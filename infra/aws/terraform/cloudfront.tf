# cloudfront.tf — the single CDN that fronts BOTH deployables (README §8).
#
# WHAT: an Origin Access Control (lets CloudFront read the private bucket),
#       the distribution with two origins (S3 + EC2) and path-based behaviors,
#       and the S3 bucket policy that trusts this distribution.
# WHY:  one domain for the SPA and /api means no CORS and clean OAuth cookies.
#       /api, /login, /oauth2 must NOT be cached and MUST forward cookies +
#       host, or login silently loops (README §8 warning).
# HOW:  ordered_cache_behavior entries match most-specific-first; AWS-managed
#       policy data sources supply ready-made cache/forward rules so we don't
#       hand-roll header/cookie forwarding.

# Managed policies, referenced by name → id.
data "aws_cloudfront_cache_policy" "disabled" {
  name = "Managed-CachingDisabled"
}
data "aws_cloudfront_cache_policy" "optimized" {
  name = "Managed-CachingOptimized"
}
data "aws_cloudfront_origin_request_policy" "all_viewer" {
  name = "Managed-AllViewer"
}
data "aws_cloudfront_origin_request_policy" "cors_s3" {
  name = "Managed-CORS-S3Origin"
}

resource "aws_cloudfront_origin_access_control" "s3" {
  name                              = "${var.project}-s3-oac"
  origin_access_control_origin_type = "s3"
  signing_behavior                  = "always"
  signing_protocol                  = "sigv4"
}

resource "aws_cloudfront_distribution" "this" {
  enabled             = true
  default_root_object = "index.html"
  # Custom domain only when provided; otherwise none (use the cloudfront.net URL).
  aliases = var.domain_name == "" ? [] : [var.domain_name]

  # Origin 1: the private S3 bucket (SPA), read via OAC.
  origin {
    origin_id                = "s3-frontend"
    domain_name              = aws_s3_bucket.frontend.bucket_regional_domain_name
    origin_access_control_id = aws_cloudfront_origin_access_control.s3.id
  }

  # Origin 2: the EC2 box on plain HTTP:8080.
  # Use the ELASTIC IP's DNS, not the instance's ephemeral public_dns — the EIP
  # survives stop/start so this origin never goes stale (see aws_eip in ec2.tf).
  origin {
    origin_id   = "ec2-backend"
    domain_name = aws_eip.backend.public_dns

    custom_origin_config {
      http_port              = 8080
      https_port             = 443
      origin_protocol_policy = "http-only"
      origin_ssl_protocols   = ["TLSv1.2"]
    }

    # Tells Spring (server.forward-headers-strategy: framework) that the
    # EXTERNAL scheme is https, so OAuth redirect URIs are built as https://
    # even though CloudFront talks to the box over http.
    custom_header {
      name  = "X-Forwarded-Proto"
      value = "https"
    }
  }

  # Default behavior → SPA from S3, cached.
  default_cache_behavior {
    target_origin_id         = "s3-frontend"
    viewer_protocol_policy   = "redirect-to-https"
    allowed_methods          = ["GET", "HEAD", "OPTIONS"]
    cached_methods           = ["GET", "HEAD"]
    cache_policy_id          = data.aws_cloudfront_cache_policy.optimized.id
    origin_request_policy_id = data.aws_cloudfront_origin_request_policy.cors_s3.id
  }

  # Auth-critical behaviors → EC2, NEVER cached, forward everything.
  # dynamic{} generates one ordered_cache_behavior per path pattern.
  dynamic "ordered_cache_behavior" {
    for_each = ["/api/*", "/login/*", "/oauth2/*"]
    content {
      path_pattern             = ordered_cache_behavior.value
      target_origin_id         = "ec2-backend"
      viewer_protocol_policy   = "redirect-to-https"
      allowed_methods          = ["GET", "HEAD", "OPTIONS", "PUT", "POST", "PATCH", "DELETE"]
      cached_methods           = ["GET", "HEAD"]
      cache_policy_id          = data.aws_cloudfront_cache_policy.disabled.id
      origin_request_policy_id = data.aws_cloudfront_origin_request_policy.all_viewer.id
    }
  }

  # SPA fallback: client-side routes (e.g. /auth/callback) serve index.html
  # instead of a 403/404. Safe ONLY because /api/* is matched above and so
  # never hits these rules.
  custom_error_response {
    error_code         = 403
    response_code      = 200
    response_page_path = "/index.html"
  }
  custom_error_response {
    error_code         = 404
    response_code      = 200
    response_page_path = "/index.html"
  }

  # No domain → CloudFront's free default *.cloudfront.net certificate.
  # Domain set → the ACM cert validated in acm.tf. one() yields null when the
  # cert isn't created (count = 0), so this block stays valid either way.
  viewer_certificate {
    cloudfront_default_certificate = var.domain_name == "" ? true : null
    acm_certificate_arn            = one(aws_acm_certificate_validation.cf[*].certificate_arn)
    ssl_support_method             = var.domain_name == "" ? null : "sni-only"
    minimum_protocol_version       = var.domain_name == "" ? "TLSv1" : "TLSv1.2_2021"
  }

  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }

  price_class = "PriceClass_100" # US, Canada, Europe only — cheapest tier.
}

# --- Bucket policy: trust ONLY this distribution (closes the loop with s3.tf)
data "aws_iam_policy_document" "frontend_bucket" {
  statement {
    sid       = "AllowCloudFrontRead"
    actions   = ["s3:GetObject"]
    resources = ["${aws_s3_bucket.frontend.arn}/*"]

    principals {
      type        = "Service"
      identifiers = ["cloudfront.amazonaws.com"]
    }
    # Restrict to THIS distribution so no other CloudFront dist can read it.
    condition {
      test     = "StringEquals"
      variable = "AWS:SourceArn"
      values   = [aws_cloudfront_distribution.this.arn]
    }
  }
}

resource "aws_s3_bucket_policy" "frontend" {
  bucket = aws_s3_bucket.frontend.id
  policy = data.aws_iam_policy_document.frontend_bucket.json
}
