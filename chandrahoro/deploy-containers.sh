#!/bin/bash
set -e

# Load configuration
source azure-deployment-config.sh

echo "🚀 Deploying ChandraHoro to Azure Container Instances"
echo "=================================================="

# Get ACR credentials
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

# MySQL connection string (using aiomysql driver for async SQLAlchemy)
# SSL is configured in backend/app/core/database.py based on azure.com in hostname
MYSQL_HOST="${MYSQL_SERVER_NAME}.mysql.database.azure.com"
DATABASE_URL="mysql+aiomysql://${MYSQL_ADMIN_USER}:${MYSQL_PASSWORD}@${MYSQL_HOST}/${MYSQL_DATABASE_NAME}"

echo "✅ Secrets retrieved"

# Deploy Backend Container Instance (AMD64)
echo ""
echo "🐳 Deploying Backend Container Instance (AMD64)..."
echo "Note: This may take 2-3 minutes..."
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
  --location "$LOCATION" \
  --restart-policy Always \
  --no-wait

# Deploy Frontend Container Instance (ARM64) - starts immediately
echo ""
echo "🐳 Deploying Frontend Container Instance (ARM64)..."
echo "Note: This may take 2-3 minutes..."
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
    NEXT_PUBLIC_API_URL="http://chandrahoro-api.westus2.azurecontainer.io:8000" \
    NEXTAUTH_URL="http://chandrahoro-app.westus2.azurecontainer.io:3000" \
    NEXTAUTH_SECRET="$NEXTAUTH_SECRET" \
    DATABASE_URL="$DATABASE_URL" \
  --location "$LOCATION" \
  --restart-policy Always \
  --no-wait

echo ""
echo "⏳ Waiting for containers to be ready..."
sleep 10

# Get backend FQDN
BACKEND_FQDN=$(az container show --resource-group "$RESOURCE_GROUP" --name "chandrahoro-backend" --query "ipAddress.fqdn" -o tsv 2>/dev/null || echo "chandrahoro-api.westus2.azurecontainer.io")
BACKEND_IP=$(az container show --resource-group "$RESOURCE_GROUP" --name "chandrahoro-backend" --query "ipAddress.ip" -o tsv 2>/dev/null || echo "pending")

# Get frontend FQDN
FRONTEND_FQDN=$(az container show --resource-group "$RESOURCE_GROUP" --name "chandrahoro-frontend" --query "ipAddress.fqdn" -o tsv 2>/dev/null || echo "chandrahoro-app.westus2.azurecontainer.io")
FRONTEND_IP=$(az container show --resource-group "$RESOURCE_GROUP" --name "chandrahoro-frontend" --query "ipAddress.ip" -o tsv 2>/dev/null || echo "pending")

echo ""
echo "✅ Backend deployed at: http://${BACKEND_FQDN}:8000"
echo "   IP: $BACKEND_IP"
echo ""
echo "✅ Frontend deployed at: http://${FRONTEND_FQDN}:3000"
echo "   IP: $FRONTEND_IP"

echo ""
echo "=================================================="
echo "🎉 Deployment Complete!"
echo "=================================================="
echo ""
echo "📍 Access your application:"
echo "   Frontend: http://${FRONTEND_FQDN}:3000"
echo "   Backend API: http://${BACKEND_FQDN}:8000"
echo "   API Docs: http://${BACKEND_FQDN}:8000/docs"
echo ""
echo "📊 Resource Summary:"
echo "   Resource Group: $RESOURCE_GROUP"
echo "   Location: $LOCATION"
echo "   MySQL Server: ${MYSQL_HOST}"
echo "   Key Vault: ${KEY_VAULT_NAME}"
echo "   Container Registry: ${ACR_SERVER}"
echo ""
echo "🔍 Monitor containers:"
echo "   az container logs --resource-group $RESOURCE_GROUP --name chandrahoro-backend"
echo "   az container logs --resource-group $RESOURCE_GROUP --name chandrahoro-frontend"
echo ""

