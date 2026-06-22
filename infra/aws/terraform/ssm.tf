# ssm.tf — backend secrets & config in Parameter Store (README §5).
#
# WHAT: every parameter the prod profile reads, under /airdnd/prod/. Secrets
#       are SecureString (KMS-encrypted); plain config is String.
# WHY:  keeps secrets out of the image and out of git. The EC2 role (ec2.tf)
#       can read exactly this path and nothing else. The deploy step turns the
#       path into a --env-file for `docker run`.
# HOW:  the DB URL/username/password are wired straight from the MySQL box + random
#       resources, so rotating the DB password is a Terraform change — not
#       manual console editing. for_each keeps the code short (one block,
#       many parameters) instead of repeating a resource per key.

locals {
  ssm_prefix = "/${var.project}/${var.environment}"

  # Points at the self-managed MySQL box's PRIVATE IP (mysql.tf). useSSL=false
  # because we don't run managed TLS like RDS did; allowPublicKeyRetrieval lets
  # the JDBC driver complete caching_sha2_password auth over the plaintext link
  # (fine inside the VPC, where only the app SG can reach 3306).
  jdbc_url = "jdbc:mysql://${aws_instance.mysql.private_ip}:3306/${var.db_name}?useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=Asia/Seoul&characterEncoding=UTF-8"

  # The app's public URL: custom domain if set, else the CloudFront-generated
  # one (referencing the distribution makes Terraform build it first).
  frontend_base_url = var.domain_name == "" ? "https://${aws_cloudfront_distribution.this.domain_name}" : "https://${var.domain_name}"

  # Non-secret config → String parameters.
  plain_params = {
    "SPRING_PROFILES_ACTIVE"        = var.environment
    "SPRING_JPA_HIBERNATE_DDL_AUTO" = "validate"
    "APP_FRONTEND_BASE_URL"         = local.frontend_base_url
  }

  # Secrets → SecureString parameters.
  secret_params = {
    "SPRING_DATASOURCE_URL"       = local.jdbc_url
    "SPRING_DATASOURCE_USERNAME"  = var.db_username
    "SPRING_DATASOURCE_PASSWORD"  = random_password.db.result
    "OAUTH2_GOOGLE_CLIENT_ID"     = var.oauth_google_client_id
    "OAUTH2_GOOGLE_CLIENT_SECRET" = var.oauth_google_client_secret
    "PAYPAL_CLIENT_ID"            = var.paypal_client_id
    "PAYPAL_CLIENT_SECRET"        = var.paypal_client_secret
  }
}

resource "aws_ssm_parameter" "plain" {
  for_each = local.plain_params
  name     = "${local.ssm_prefix}/${each.key}"
  type     = "String"
  value    = each.value
}

resource "aws_ssm_parameter" "secret" {
  for_each = local.secret_params
  name     = "${local.ssm_prefix}/${each.key}"
  type     = "SecureString"
  value    = each.value
}
