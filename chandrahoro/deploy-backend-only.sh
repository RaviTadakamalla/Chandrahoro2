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
PERPLEXITY_API_KEY=$(az keyvault secret show --vault-name "$KEY_VAULT_NAME" --name "perplexity-api-key" --query "value" -o tsv)
GEONAMES_USERNAME=$(az keyvault secret show --vault-name "$KEY_VAULT_NAME" --name "geonames-username" --query "value" -o tsv)
NEXTAUTH_SECRET=$(az keyvault secret show --vault-name "$KEY_VAULT_NAME" --name "nextauth-secret" --query "value" -o tsv)
JWT_SECRET=$(az keyvault secret show --vault-name "$KEY_VAULT_NAME" --name "jwt-secret" --query "value" -o tsv)
MYSQL_PASSWORD=$(az keyvault secret show --vault-name "$KEY_VAULT_NAME" --name "mysql-admin-password" --query "value" -o tsv)
LLM_VAULT_KEY=$(az keyvault secret show --vault-name "$KEY_VAULT_NAME" --name "llm-vault-key" --query "value" -o tsv)

# MySQL connection string
MYSQL_HOST="${MYSQL_SERVER_NAME}.mysql.database.azure.com"
DATABASE_URL="mysql+aiomysql://${MYSQL_ADMIN_USER}:${MYSQL_PASSWORD}@${MYSQL_HOST}/${MYSQL_DATABASE_NAME}"

echo "✅ Secrets retrieved"

# Deploy Backend Container Instance
echo ""
echo "🐳 Deploying Backend Container Instance..."
az container create \
  --resource-group "$RESOURCE_GROUP" \
  --name "chandrahoro-backend" \
  --image "${ACR_SERVER}/chandrahoro-backend:latest" \
  --registry-login-server "$ACR_SERVER" \
  --registry-username "$ACR_USERNAME" \
  --registry-password "$ACR_PASSWORD" \
  --dns-name-label "chandrahoro-api" \
  --ports 8000 \
  --cpu 1 \
  --memory 1.5 \
  --os-type Linux \
  --environment-variables \
    DATABASE_URL="$DATABASE_URL" \
    PERPLEXITY_API_KEY="$PERPLEXITY_API_KEY" \
    GEONAMES_USERNAME="$GEONAMES_USERNAME" \
    JWT_SECRET="$JWT_SECRET" \
    NEXTAUTH_SECRET="$NEXTAUTH_SECRET" \
    LLM_VAULT_KEY="$LLM_VAULT_KEY" \
    CORS_ORIGINS="https://valuestream.in,https://www.valuestream.in,http://localhost:3000" \
  --location "$LOCATION" \
  --restart-policy Always

# Get backend FQDN
BACKEND_FQDN=$(az container show --resource-group "$RESOURCE_GROUP" --name "chandrahoro-backend" --query "ipAddress.fqdn" -o tsv)
BACKEND_IP=$(az container show --resource-group "$RESOURCE_GROUP" --name "chandrahoro-backend" --query "ipAddress.ip" -o tsv)

echo ""
echo "✅ Backend deployed at: http://${BACKEND_FQDN}:8000"
echo "   API Docs: http://${BACKEND_FQDN}:8000/docs"
echo "   IP: $BACKEND_IP"
echo ""
echo "🔍 Checking health..."
sleep 10
curl -s "http://${BACKEND_FQDN}:8000/health" | jq . || echo "Health check pending..."

