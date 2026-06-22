#!/usr/bin/env bash
# load-env-secrets.sh — map the repo-root .env's backend secrets to TF_VAR_*
# so `terraform apply` writes them into the SSM SecureString params (ssm.tf).
#
# WHY this and not `aws ssm put-parameter`: those params are MANAGED by
# Terraform. Writing to SSM directly would be reverted on the next apply.
# Feeding the values through TF_VAR_* keeps Terraform the single source of truth.
#
# Usage (from infra/aws/terraform):
#   source ./load-env-secrets.sh         # uses ../../../.env by default
#   terraform apply                      # shows the 4 params changing
#
# Note: `source` it (don't just run it) so the exports survive into your shell.

ENV_FILE="${1:-../../../.env}"

if [ ! -f "$ENV_FILE" ]; then
  echo "load-env-secrets: no .env at $ENV_FILE" >&2
  return 1 2>/dev/null || exit 1
fi

# Read KEY=value from the env file; tolerate surrounding single/double quotes.
_val() {
  grep -E "^$1=" "$ENV_FILE" | head -1 | cut -d= -f2- \
    | sed -e 's/^["'\'']//' -e 's/["'\'']$//'
}

export TF_VAR_oauth_google_client_id="$(_val OAUTH2_GOOGLE_CLIENT_ID)"
export TF_VAR_oauth_google_client_secret="$(_val OAUTH2_GOOGLE_CLIENT_SECRET)"
export TF_VAR_paypal_client_id="$(_val PAYPAL_CLIENT_ID)"
export TF_VAR_paypal_client_secret="$(_val PAYPAL_CLIENT_SECRET)"
# S3 upload signing keys (note: .env names differ from the AWS_* SSM names).
export TF_VAR_aws_access_key_id="$(_val AWS_ACCESS_KEY)"
export TF_VAR_aws_secret_access_key="$(_val AWS_ACCESS_SECRET_KEY)"

# Confirm they loaded WITHOUT printing the secret values (just lengths).
echo "Loaded TF_VAR_* from $ENV_FILE:"
echo "  oauth_google_client_id     (${#TF_VAR_oauth_google_client_id} chars)"
echo "  oauth_google_client_secret (${#TF_VAR_oauth_google_client_secret} chars)"
echo "  paypal_client_id           (${#TF_VAR_paypal_client_id} chars)"
echo "  paypal_client_secret       (${#TF_VAR_paypal_client_secret} chars)"
echo "  aws_access_key_id          (${#TF_VAR_aws_access_key_id} chars)"
echo "  aws_secret_access_key      (${#TF_VAR_aws_secret_access_key} chars)"
