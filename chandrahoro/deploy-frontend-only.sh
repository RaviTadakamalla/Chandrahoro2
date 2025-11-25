#!/bin/bash
set -e

# Load configuration
source azure-deployment-config.sh

# ACR Configuration
ACR_NAME="chandrahoroacr"
ACR_SERVER="${ACR_NAME}.azurecr.io"
ACR_USERNAME=$(az acr credential show --name $ACR_NAME --query "username" -o tsv)
ACR_PASSWORD=$(az acr credential show --name $ACR_NAME --query "passwords[0].value" -o tsv)

# Get secrets from Key Vault
echo "📦 Retrieving secrets from Key Vault..."
NEXTAUTH_SECRET=$(az keyvault secret show --vault-name "$KEY_VAULT_NAME" --name "nextauth-secret" --query "value" -o tsv)
GITHUB_TOKEN=$(az keyvault secret show --vault-name "$KEY_VAULT_NAME" --name "github-token" --query "value" -o tsv)

echo "✅ Secrets retrieved"

# Backend URL (already deployed)
BACKEND_FQDN="chandrahoro-api.westus2.azurecontainer.io"
BACKEND_URL="http://${BACKEND_FQDN}:8000"

# Deploy Frontend Container Instance
echo ""
echo "🐳 Deploying Frontend Container Instance..."
az container create \
  --resource-group "$RESOURCE_GROUP" \
  --name "chandrahoro-frontend" \
  --image "${ACR_SERVER}/chandrahoro-frontend:latest" \
  --registry-login-server "$ACR_SERVER" \
  --registry-username "$ACR_USERNAME" \
  --registry-password "$ACR_PASSWORD" \
  --dns-name-label "chandrahoro-app" \
  --ports 3000 \
  --cpu 1 \
  --memory 2 \
  --os-type Linux \
  --environment-variables \
    NEXT_PUBLIC_API_URL="https://valuestream.in/horo/api" \
    NEXT_PUBLIC_APP_URL="https://valuestream.in/horo" \
    NEXTAUTH_URL="https://valuestream.in/horo" \
    NEXTAUTH_SECRET="$NEXTAUTH_SECRET" \
    GITHUB_ID="placeholder" \
    GITHUB_SECRET="placeholder" \
    NODE_ENV="production" \
  --location "$LOCATION" \
  --restart-policy Always

# Get frontend FQDN
FRONTEND_FQDN=$(az container show --resource-group "$RESOURCE_GROUP" --name "chandrahoro-frontend" --query "ipAddress.fqdn" -o tsv)
FRONTEND_IP=$(az container show --resource-group "$RESOURCE_GROUP" --name "chandrahoro-frontend" --query "ipAddress.ip" -o tsv)

echo ""
echo "✅ Frontend deployed at: http://${FRONTEND_FQDN}:3000"
echo "   IP: $FRONTEND_IP"
echo "   Backend API: $BACKEND_URL"
echo ""
echo "🔍 Checking health..."
sleep 15
curl -s "http://${FRONTEND_FQDN}:3000" -I | head -5 || echo "Frontend starting..."

