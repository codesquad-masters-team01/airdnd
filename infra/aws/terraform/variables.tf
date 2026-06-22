# variables.tf — the inputs to this configuration (its "function arguments").
#
# WHAT: every value that changes between deployments or that you don't want
#       hard-coded. Real values go in terraform.tfvars (gitignored).
# WHY:  keeps environment-specific values and secrets out of the code, and
#       lets the same code serve dev/staging/prod.
# HOW:  Terraform resolves variables from terraform.tfvars, -var flags, or
#       TF_VAR_* env vars. `sensitive = true` hides the value in plan output.

variable "project" {
  description = "Name prefix for all resources, e.g. \"airdnd\"."
  type        = string
  default     = "airdnd"
}

variable "environment" {
  description = "Environment label (dev/staging/prod). Used in names & tags."
  type        = string
  default     = "prod"
}

variable "aws_region" {
  description = "Primary region for everything except the ACM cert."
  type        = string
  default     = "ap-northeast-2"
}

variable "domain_name" {
  description = "Custom domain, e.g. airdnd.example.com. LEAVE EMPTY (\"\") to use the free CloudFront-generated *.cloudfront.net domain — no domain, Route 53, or ACM needed."
  type        = string
  default     = ""
}

variable "route53_zone_name" {
  description = "Route 53 hosted zone that owns domain_name. Ignored when domain_name is empty."
  type        = string
  default     = ""
}

variable "ssh_ingress_cidr" {
  description = "Your IP in CIDR form (e.g. 1.2.3.4/32) allowed to SSH to EC2."
  type        = string
}

variable "ec2_instance_type" {
  description = "EC2 size. t4g.small (2GB) is the realistic floor for the JVM."
  type        = string
  default     = "t4g.small"
}

variable "mysql_instance_type" {
  description = "EC2 size for the self-managed MySQL box."
  type        = string
  default     = "t4g.micro"
}

variable "mysql_data_volume_size" {
  description = "Size (GiB) of the dedicated EBS volume holding MySQL data. gp3's hard floor is 1 GiB; 8 is a safe practical minimum for MySQL 8."
  type        = number
  default     = 8
}

variable "db_name" {
  description = "Initial database name."
  type        = string
  default     = "airdnd"
}

variable "db_username" {
  description = "MySQL application username."
  type        = string
  default     = "airdnd"
}

variable "github_repo" {
  description = "owner/repo allowed to assume the deploy role via OIDC."
  type        = string
  default     = "codesquad-masters-team01/airdnd"
}

# --- Secrets that originate OUTSIDE AWS (Google, PayPal). ssm.tf stores them.
variable "oauth_google_client_id" {
  type      = string
  sensitive = true
  default   = "REPLACE_ME"
}
variable "oauth_google_client_secret" {
  type      = string
  sensitive = true
  default   = "REPLACE_ME"
}
variable "paypal_client_id" {
  type      = string
  sensitive = true
  default   = "REPLACE_ME"
}
variable "paypal_client_secret" {
  type      = string
  sensitive = true
  default   = "REPLACE_ME"
}

# AWS keys the backend uses to sign presigned S3 uploads (uploads.tf / S3Config).
# From your .env: AWS_ACCESS_KEY / AWS_ACCESS_SECRET_KEY.
variable "aws_access_key_id" {
  type      = string
  sensitive = true
  default   = "REPLACE_ME"
}
variable "aws_secret_access_key" {
  type      = string
  sensitive = true
  default   = "REPLACE_ME"
}
