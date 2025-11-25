#!/bin/bash
# ChandraHoro Azure Deployment Script
# Version: 2.1.2
# Date: October 29, 2025

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Load configuration
if [ ! -f "azure-deployment-config.sh" ]; then
    echo -e "${RED}❌ ERROR: azure-deployment-config.sh not found${NC}"
    exit 1
fi

source azure-deployment-config.sh

# ============================================================================
# Helper Functions
# ============================================================================

log_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

log_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

log_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

log_error() {
    echo -e "${RED}❌ $1${NC}"
}

log_section() {
    echo ""
    echo -e "${BLUE}============================================================================${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}============================================================================${NC}"
    echo ""
}

# Prompt for confirmation
confirm() {
    read -p "$(echo -e ${YELLOW}$1 [y/N]: ${NC})" -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        log_warning "Operation cancelled by user"
        exit 1
    fi
}

# ============================================================================
# Phase 1: Prerequisites Check
# ============================================================================

phase1_prerequisites() {
    log_section "Phase 1: Prerequisites Check"
    
    # Check Azure CLI
    log_info "Checking Azure CLI..."
    if ! command -v az &> /dev/null; then
        log_error "Azure CLI is not installed. Please install it first."
        exit 1
    fi
    log_success "Azure CLI is installed: $(az --version | head -n 1)"
    
    # Check if logged in
    log_info "Checking Azure login..."
    if ! az account show &> /dev/null; then
        log_error "Not logged in to Azure. Please run: az login"
        exit 1
    fi
    log_success "Logged in to Azure"
    
    # Check Docker
    log_info "Checking Docker..."
    if ! command -v docker &> /dev/null; then
        log_error "Docker is not installed. Please install it first."
        exit 1
    fi
    log_success "Docker is installed: $(docker --version)"
    
    # Check required variables
    log_info "Checking required variables..."
    bash azure-deployment-config.sh check
    
    # Show configuration
    bash azure-deployment-config.sh show
    
    log_success "Phase 1 complete: Prerequisites verified"
}

# ============================================================================
# Phase 2: Create Azure Key Vault
# ============================================================================

phase2_key_vault() {
    log_section "Phase 2: Create Azure Key Vault"
    
    # Create Resource Group first
    log_info "Creating resource group: $RESOURCE_GROUP"
    az group create \
        --name "$RESOURCE_GROUP" \
        --location "$LOCATION" \
        --tags $TAGS
    log_success "Resource group created"
    
    # Create Key Vault
    log_info "Creating Key Vault: $KEY_VAULT_NAME"
    az keyvault create \
        --name "$KEY_VAULT_NAME" \
        --resource-group "$RESOURCE_GROUP" \
        --location "$LOCATION" \
        --sku "$KEY_VAULT_SKU" \
        --enable-rbac-authorization true \
        --tags $TAGS
    log_success "Key Vault created"
    
    # Get current user object ID for Key Vault access
    log_info "Granting Key Vault access to current user..."
    CURRENT_USER_ID=$(az ad signed-in-user show --query id -o tsv)
    KEY_VAULT_ID=$(az keyvault show --name "$KEY_VAULT_NAME" --resource-group "$RESOURCE_GROUP" --query id -o tsv)
    
    az role assignment create \
        --role "Key Vault Secrets Officer" \
        --assignee "$CURRENT_USER_ID" \
        --scope "$KEY_VAULT_ID"
    log_success "Key Vault access granted"
    
    # Wait for RBAC propagation
    log_info "Waiting for RBAC propagation (30 seconds)..."
    sleep 30
    
    # Store secrets in Key Vault
    log_info "Storing secrets in Key Vault..."

    if [ -n "$PERPLEXITY_API_KEY" ]; then
        az keyvault secret set --vault-name "$KEY_VAULT_NAME" --name "perplexity-api-key" --value "$PERPLEXITY_API_KEY" > /dev/null
        log_success "Stored: perplexity-api-key"
    fi

    if [ -n "$ANTHROPIC_API_KEY" ]; then
        az keyvault secret set --vault-name "$KEY_VAULT_NAME" --name "anthropic-api-key" --value "$ANTHROPIC_API_KEY" > /dev/null
        log_success "Stored: anthropic-api-key"
    fi

    if [ -n "$OPENAI_API_KEY" ]; then
        az keyvault secret set --vault-name "$KEY_VAULT_NAME" --name "openai-api-key" --value "$OPENAI_API_KEY" > /dev/null
        log_success "Stored: openai-api-key"
    fi

    if [ -n "$GOOGLE_API_KEY" ]; then
        az keyvault secret set --vault-name "$KEY_VAULT_NAME" --name "google-api-key" --value "$GOOGLE_API_KEY" > /dev/null
        log_success "Stored: google-api-key"
    fi
    
    if [ -n "$GEONAMES_USERNAME" ]; then
        az keyvault secret set --vault-name "$KEY_VAULT_NAME" --name "geonames-username" --value "$GEONAMES_USERNAME" > /dev/null
        log_success "Stored: geonames-username"
    fi
    
    if [ -n "$NEXTAUTH_SECRET" ]; then
        az keyvault secret set --vault-name "$KEY_VAULT_NAME" --name "nextauth-secret" --value "$NEXTAUTH_SECRET" > /dev/null
        log_success "Stored: nextauth-secret"
    fi
    
    if [ -n "$JWT_SECRET" ]; then
        az keyvault secret set --vault-name "$KEY_VAULT_NAME" --name "jwt-secret" --value "$JWT_SECRET" > /dev/null
        log_success "Stored: jwt-secret"
    fi
    
    if [ -n "$MYSQL_ADMIN_PASSWORD" ]; then
        az keyvault secret set --vault-name "$KEY_VAULT_NAME" --name "mysql-admin-password" --value "$MYSQL_ADMIN_PASSWORD" > /dev/null
        log_success "Stored: mysql-admin-password"
    fi
    
    log_success "Phase 2 complete: Key Vault created and secrets stored"
}

# ============================================================================
# Phase 3: Create Core Infrastructure
# ============================================================================

phase3_infrastructure() {
    log_section "Phase 3: Create Core Infrastructure"
    
    # Create MySQL Flexible Server
    log_info "Creating MySQL Flexible Server: $MYSQL_SERVER_NAME (this may take 5-10 minutes)..."
    az mysql flexible-server create \
        --name "$MYSQL_SERVER_NAME" \
        --resource-group "$RESOURCE_GROUP" \
        --location "$LOCATION" \
        --admin-user "$MYSQL_ADMIN_USER" \
        --admin-password "$MYSQL_ADMIN_PASSWORD" \
        --sku-name "$MYSQL_SKU" \
        --tier Burstable \
        --storage-size "$MYSQL_STORAGE_SIZE" \
        --version "$MYSQL_VERSION" \
        --backup-retention "$MYSQL_BACKUP_RETENTION" \
        --public-access 0.0.0.0-255.255.255.255 \
        --tags $TAGS
    log_success "MySQL Flexible Server created"
    
    # Create database
    log_info "Creating database: $MYSQL_DATABASE_NAME"
    az mysql flexible-server db create \
        --resource-group "$RESOURCE_GROUP" \
        --server-name "$MYSQL_SERVER_NAME" \
        --database-name "$MYSQL_DATABASE_NAME"
    log_success "Database created"
    
    # Create Redis Cache
    log_info "Creating Redis Cache: $REDIS_NAME (this may take 10-15 minutes)..."
    az redis create \
        --name "$REDIS_NAME" \
        --resource-group "$RESOURCE_GROUP" \
        --location "$LOCATION" \
        --sku "$REDIS_SKU" \
        --vm-size "$REDIS_VM_SIZE" \
        --tags $TAGS
    log_success "Redis Cache created"
    
    # Create Container Apps Environment
    log_info "Creating Container Apps Environment: $CONTAINER_APP_ENV_NAME"
    az containerapp env create \
        --name "$CONTAINER_APP_ENV_NAME" \
        --resource-group "$RESOURCE_GROUP" \
        --location "$LOCATION" \
        --tags $TAGS
    log_success "Container Apps Environment created"
    
    # Create App Service Plan
    log_info "Creating App Service Plan: $APP_SERVICE_PLAN_NAME"
    az appservice plan create \
        --name "$APP_SERVICE_PLAN_NAME" \
        --resource-group "$RESOURCE_GROUP" \
        --location "$LOCATION" \
        --sku "$APP_SERVICE_PLAN_SKU" \
        --is-linux \
        --tags $TAGS
    log_success "App Service Plan created"
    
    log_success "Phase 3 complete: Core infrastructure created"
}

# ============================================================================
# Main Execution
# ============================================================================

main() {
    log_section "ChandraHoro Azure Deployment"
    log_info "Starting deployment process..."
    
    # Show configuration
    bash azure-deployment-config.sh show
    
    # Confirm deployment
    confirm "Do you want to proceed with the deployment?"
    
    # Execute phases
    phase1_prerequisites
    phase2_key_vault
    phase3_infrastructure
    
    log_section "Deployment Progress"
    log_success "Completed: Phase 1 (Prerequisites)"
    log_success "Completed: Phase 2 (Key Vault)"
    log_success "Completed: Phase 3 (Infrastructure)"
    log_warning "Remaining: Phase 4 (Update Dockerfile)"
    log_warning "Remaining: Phase 5 (Deploy Backend)"
    log_warning "Remaining: Phase 6 (Deploy Frontend)"
    log_warning "Remaining: Phase 7 (Database Migration)"
    log_warning "Remaining: Phase 8 (Verification)"
    
    echo ""
    log_info "Next steps:"
    echo "  1. Run: ./azure-deploy-phase4.sh (Update Dockerfile)"
    echo "  2. Run: ./azure-deploy-phase5.sh (Deploy Backend)"
    echo "  3. Run: ./azure-deploy-phase6.sh (Deploy Frontend)"
    echo "  4. Run: ./azure-deploy-phase7.sh (Database Migration)"
    echo "  5. Run: ./azure-deploy-phase8.sh (Verification)"
}

# Run main function
main

