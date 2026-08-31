# Visitor counter backend

The site is otherwise fully static (`output: "export"`, no server) --
this is the one exception, a tiny public HTTP endpoint that atomically
increments a page-view count in DynamoDB and returns the new total.
Called from `src/components/VisitorCounter.tsx` on every page load.

## AWS resources (account 654654435055, us-east-1)

- **DynamoDB table**: `paycheck-overtime-visitor-counter` (on-demand
  billing, single item `{id: "pageviews", count: N}`)
- **Lambda function**: `paycheck-overtime-visitor-counter`
  (`index.mjs` in this directory), Node.js 20.x, IAM role
  `paycheck-overtime-visitor-counter-role` (basic execution +
  `dynamodb:UpdateItem` scoped to just that one table)
- **Function URL**: `https://hf2immk2wijulvkkktxtr6k5by0noezi.lambda-url.us-east-1.on.aws/`,
  `AuthType: NONE` (public), CORS restricted to
  `https://paycheckovertime.com` + localhost dev ports

## The October-2025 Lambda gotcha

Public (`AuthType: NONE`) Function URLs created via the CLI/API (not
the console) need **two** separate resource-policy statements, not
one -- this changed in October 2025 and isn't obvious from a first
read of the docs:

```bash
# 1. Allow invoking the URL itself
aws lambda add-permission \
  --function-name paycheck-overtime-visitor-counter \
  --statement-id FunctionURLAllowPublicAccess \
  --action lambda:InvokeFunctionUrl \
  --principal '*' \
  --function-url-auth-type NONE

# 2. Allow the underlying function invocation, restricted to
#    function-URL-originated calls
aws lambda add-permission \
  --function-name paycheck-overtime-visitor-counter \
  --statement-id FunctionURLInvokeAllowPublicAccess \
  --action lambda:InvokeFunction \
  --principal '*' \
  --invoked-via-function-url
```

Missing the second statement produces a 403 Forbidden with no
indication of which permission is missing -- confirmed by testing
(the function itself worked fine via authenticated `aws lambda
invoke`; only the public Function URL failed until both statements
were in place).

## Redeploying the function after a code change

```bash
cd infra/visitor-counter
zip -X function.zip index.mjs
aws lambda update-function-code \
  --function-name paycheck-overtime-visitor-counter \
  --zip-file fileb://function.zip \
  --region us-east-1
```

## Resetting the counter

```bash
aws dynamodb put-item \
  --table-name paycheck-overtime-visitor-counter \
  --item '{"id":{"S":"pageviews"},"count":{"N":"0"}}' \
  --region us-east-1
```
