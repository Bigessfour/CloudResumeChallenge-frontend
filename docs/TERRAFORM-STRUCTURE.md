# Terraform Structure — Cloud Resume Challenge

This document is the portfolio reference for how the Cloud Resume Challenge (CRC) infrastructure is organized as Terraform. The actual `.tf` files live in the companion repo, **[Bigessfour/CloudResumeChallenge-infra](https://github.com/Bigessfour/CloudResumeChallenge-infra)**, so this frontend repo stays clean.

CRC step 12 (Infrastructure as Code) is **complete** — see [environments/prod/storage.tf](https://github.com/Bigessfour/CloudResumeChallenge-infra/blob/main/environments/prod/storage.tf), [cdn.tf](https://github.com/Bigessfour/CloudResumeChallenge-infra/blob/main/environments/prod/cdn.tf), and [handler.py](https://github.com/Bigessfour/CloudResumeChallenge-infra/blob/main/lambda/visitor_counter/handler.py) for the canonical sources. The next milestone is full OIDC → `terraform apply` (see roadmap at the bottom).

## Why a separate infra repo

- **Blast radius.** Frontend CI (lint + format) runs on every push. Infra plans should run only when `.tf` changes — keeping them in their own repo isolates the OIDC role + provider downloads from frontend builds.
- **Permissions.** The OIDC role for `terraform apply` is much broader than the one needed for `aws s3 sync`. Separate repos = separate trust policies = least privilege.
- **State safety.** State lives in S3 with DynamoDB locking. A frontend PR can never accidentally touch state because the workflow simply isn't there.

## Recommended folder layout

```text
terraform/
├── backend.tf              # S3 + DynamoDB remote state and lock table
├── providers.tf            # AWS provider pin + default tags
├── variables.tf            # All input variables (region, domain, project name…)
├── outputs.tf              # CloudFront URL, API endpoint, table name
├── main.tf                 # Locals, data sources, the wiring sheet
├── s3-cloudfront.tf        # Static site bucket + CloudFront distribution + OAC
├── api-gateway-lambda.tf   # HTTP API + Lambda function + permission glue
├── dynamodb.tf             # Visitor counter table (on-demand)
├── iam.tf                  # Lambda execution role + OIDC role for GitHub Actions
└── modules/                # Optional: extract repeated patterns (e.g. tagged_bucket)
```

For multi-environment setups, layer this under `environments/` like the live infra repo:

```text
environments/
├── bootstrap/   # Creates the state bucket + lock table (one-time, local state)
└── prod/        # Everything above, with backend "s3" pointing at bootstrap output
```

## Starter snippets

These are intentionally short — copy them into the matching files and expand. They assume Terraform 1.7+ and AWS provider 5.x.

### `backend.tf` — remote state with locking

```hcl
terraform {
  required_version = ">= 1.7.0"

  backend "s3" {
    bucket         = "crc-tfstate-<your-account-id>"
    key            = "prod/terraform.tfstate"
    region         = "us-east-1"
    dynamodb_table = "crc-tflock"
    encrypt        = true
  }
}
```

### `providers.tf`

```hcl
terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = var.aws_region

  default_tags {
    tags = {
      Project   = "CloudResumeChallenge"
      ManagedBy = "Terraform"
      Owner     = "stephenmckitrick"
    }
  }
}
```

### `variables.tf`

```hcl
variable "aws_region" {
  type    = string
  default = "us-east-1"
}

variable "domain_name" {
  type    = string
  default = "stephenmckitrick.com"
}

variable "project_name" {
  type    = string
  default = "crc"
}
```

### `outputs.tf`

```hcl
output "cloudfront_domain" {
  value = aws_cloudfront_distribution.site.domain_name
}

output "visitor_api_url" {
  value = aws_apigatewayv2_api.visitor.api_endpoint
}

output "visitor_table_name" {
  value = aws_dynamodb_table.visitors.name
}
```

### `s3-cloudfront.tf`

```hcl
resource "aws_s3_bucket" "site" {
  bucket        = "${var.project_name}-site-${var.aws_region}"
  force_destroy = false
}

resource "aws_cloudfront_origin_access_control" "site" {
  name                              = "${var.project_name}-oac"
  origin_access_control_origin_type = "s3"
  signing_behavior                  = "always"
  signing_protocol                  = "sigv4"
}

resource "aws_cloudfront_distribution" "site" {
  enabled             = true
  default_root_object = "index.html"

  origin {
    domain_name              = aws_s3_bucket.site.bucket_regional_domain_name
    origin_id                = "s3-site"
    origin_access_control_id = aws_cloudfront_origin_access_control.site.id
  }

  default_cache_behavior {
    target_origin_id       = "s3-site"
    viewer_protocol_policy = "redirect-to-https"
    allowed_methods        = ["GET", "HEAD"]
    cached_methods         = ["GET", "HEAD"]
    forwarded_values {
      query_string = false
      cookies { forward = "none" }
    }
  }

  restrictions {
    geo_restriction { restriction_type = "none" }
  }

  viewer_certificate {
    cloudfront_default_certificate = true
  }
}
```

### `dynamodb.tf`

```hcl
resource "aws_dynamodb_table" "visitors" {
  name         = "${var.project_name}-visitors"
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "id"

  attribute {
    name = "id"
    type = "S"
  }
}
```

### `api-gateway-lambda.tf`

```hcl
resource "aws_lambda_function" "visitor_counter" {
  function_name = "${var.project_name}-visitor-counter"
  role          = aws_iam_role.lambda_exec.arn
  runtime       = "python3.12"
  handler       = "handler.lambda_handler"
  filename      = "${path.module}/build/visitor_counter.zip"

  environment {
    variables = {
      TABLE_NAME = aws_dynamodb_table.visitors.name
    }
  }
}

resource "aws_apigatewayv2_api" "visitor" {
  name          = "${var.project_name}-visitor-api"
  protocol_type = "HTTP"
  cors_configuration {
    allow_origins = ["https://${var.domain_name}"]
    allow_methods = ["GET"]
  }
}

resource "aws_apigatewayv2_integration" "visitor" {
  api_id                 = aws_apigatewayv2_api.visitor.id
  integration_type       = "AWS_PROXY"
  integration_uri        = aws_lambda_function.visitor_counter.invoke_arn
  payload_format_version = "2.0"
}

resource "aws_apigatewayv2_route" "visitor_get" {
  api_id    = aws_apigatewayv2_api.visitor.id
  route_key = "GET /count"
  target    = "integrations/${aws_apigatewayv2_integration.visitor.id}"
}

resource "aws_lambda_permission" "apigw" {
  statement_id  = "AllowAPIGatewayInvoke"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.visitor_counter.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_apigatewayv2_api.visitor.execution_arn}/*/*"
}
```

### `iam.tf` — Lambda + GitHub OIDC

```hcl
resource "aws_iam_role" "lambda_exec" {
  name = "${var.project_name}-lambda-exec"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect    = "Allow"
      Principal = { Service = "lambda.amazonaws.com" }
      Action    = "sts:AssumeRole"
    }]
  })
}

resource "aws_iam_role_policy_attachment" "lambda_basic" {
  role       = aws_iam_role.lambda_exec.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
}

resource "aws_iam_role_policy" "lambda_ddb" {
  role = aws_iam_role.lambda_exec.id
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect   = "Allow"
      Action   = ["dynamodb:UpdateItem", "dynamodb:GetItem"]
      Resource = aws_dynamodb_table.visitors.arn
    }]
  })
}

# OIDC trust for GitHub Actions → terraform apply
resource "aws_iam_openid_connect_provider" "github" {
  url             = "https://token.actions.githubusercontent.com"
  client_id_list  = ["sts.amazonaws.com"]
  thumbprint_list = ["6938fd4d98bab03faadb97b34396831e3780aea1"]
}

resource "aws_iam_role" "github_actions" {
  name = "${var.project_name}-gha-deploy"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect    = "Allow"
      Principal = { Federated = aws_iam_openid_connect_provider.github.arn }
      Action    = "sts:AssumeRoleWithWebIdentity"
      Condition = {
        StringEquals = {
          "token.actions.githubusercontent.com:aud" = "sts.amazonaws.com"
        }
        StringLike = {
          "token.actions.githubusercontent.com:sub" = "repo:Bigessfour/CloudResumeChallenge-infra:*"
        }
      }
    }]
  })
}
```

## README section (drop into the infra repo)

````md
# CloudResumeChallenge-infra

Terraform stack behind [stephenmckitrick.com](https://stephenmckitrick.com): S3 + CloudFront for the static site, API Gateway + Lambda + DynamoDB for the visitor counter, all wired up via GitHub Actions with OIDC.

## Workflows

| Trigger        | Command                                    |
| -------------- | ------------------------------------------ |
| PR to `main`   | `terraform fmt -check && validate && plan` |
| Push to `main` | `terraform apply -auto-approve`            |

## Local dev

```bash
cd environments/prod
terraform init
terraform plan
```
````

## OIDC apply roadmap

Next CRC milestone — finish the hands-off pipeline so a merge to `main` is the only thing that touches production:

- [ ] Wire `aws-actions/configure-aws-credentials@v4` with `role-to-assume` to the OIDC role
- [ ] Add `terraform-plan.yml` (pull_request) and `terraform-apply.yml` (push to main)
- [ ] Scope the apply role to a least-privilege policy (no `*:*`)
- [ ] Add `tfsec` and `checkov` as plan-time guardrails
- [ ] Surface plan output as a sticky PR comment via `actions/github-script`
- [ ] Add a manual `workflow_dispatch` for `terraform destroy` (with an environment approval gate)
- [ ] Smoke-test the `/count` endpoint from the deploy workflow before invalidating CloudFront
