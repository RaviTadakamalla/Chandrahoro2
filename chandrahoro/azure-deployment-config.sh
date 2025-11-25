#!/bin/bash
# ChandraHoro Azure Deployment Configuration
# Version: 2.1.2
# Date: October 29, 2025

# ============================================================================
# IMPORTANT: Review and update these variables before running deployment
# ============================================================================

# Azure Subscription
export SUBSCRIPTION_ID="e00628bb-4020-4bb3-8b08-d0553ff9cb7f"
export SUBSCRIPTION_NAME="Azure for Students"

# Resource Group
export RESOURCE_GROUP="chandrahoro-prod"
export LOCATION="westus2"  # Using existing resource group location

# Naming Convention
export APP_NAME="chandrahoro"
export ENVIRONMENT="prod"

# ============================================================================
# Azure Key Vault
# ============================================================================
export KEY_VAULT_NAME="chandrahoro-kv-prod"  # Must be globally unique (3-24 chars)
export KEY_VAULT_SKU="standard"  # standard or premium

# ============================================================================
# Azure Database for MySQL Flexible Server
# ============================================================================
export MYSQL_SERVER_NAME="chandrahoro-mysql-prod"  # Must be globally unique
export MYSQL_ADMIN_USER="chandrahoroadmin"
export MYSQL_ADMIN_PASSWORD="Jairam12"
export MYSQL_DATABASE_NAME="chandrahoro"
export MYSQL_SKU="Standard_B1ms"  # B1ms (1 vCore, 2GB RAM) - cheapest option
export MYSQL_STORAGE_SIZE="20"  # GB
export MYSQL_VERSION="8.0.21"  # Allowed versions: 8.0.21, 8.4, 9.3, 5.7
export MYSQL_BACKUP_RETENTION="7"  # days

# ============================================================================
# Azure Cache for Redis
# ============================================================================
export REDIS_NAME="chandrahoro-redis-prod"  # Must be globally unique
export REDIS_SKU="Basic"  # Basic, Standard, or Premium
export REDIS_VM_SIZE="C0"  # C0 (250MB) - cheapest option

# ============================================================================
# Azure Container Apps (Backend)
# ============================================================================
export CONTAINER_APP_ENV_NAME="chandrahoro-env-prod"
export BACKEND_APP_NAME="chandrahoro-backend"
export BACKEND_IMAGE="ghcr.io/whattag/chandrahoro-backend:latest"
export BACKEND_CPU="0.5"  # CPU cores
export BACKEND_MEMORY="1Gi"  # Memory
export BACKEND_MIN_REPLICAS="1"
export BACKEND_MAX_REPLICAS="3"

# ============================================================================
# Azure App Service (Frontend)
# ============================================================================
export APP_SERVICE_PLAN_NAME="chandrahoro-plan-prod"
export APP_SERVICE_PLAN_SKU="F1"  # F1 (Free tier) - for Azure for Students
export FRONTEND_APP_NAME="chandrahoro-frontend"
export FRONTEND_IMAGE="ghcr.io/whattag/chandrahoro-frontend:latest"

# ============================================================================
# GitHub Container Registry
# ============================================================================
export GITHUB_USERNAME="WhatTag"
export GITHUB_REPO="chandrahoro"
export GITHUB_TOKEN="${GITHUB_TOKEN:-}"  # Set this in your environment or .env file

# ============================================================================
# Application Secrets (will be stored in Key Vault)
# ============================================================================
export PERPLEXITY_API_KEY="${PERPLEXITY_API_KEY:-}"  # Set this in your environment
export ANTHROPIC_API_KEY="${ANTHROPIC_API_KEY:-}"  # Optional
export OPENAI_API_KEY="${OPENAI_API_KEY:-}"  # Optional
export GOOGLE_API_KEY="${GOOGLE_API_KEY:-}"  # Optional
export GEONAMES_USERNAME="${GEONAMES_USERNAME:-drtravi}"
export NEXTAUTH_SECRET="${NEXTAUTH_SECRET:-}"  # Generate with: openssl rand -base64 32
export JWT_SECRET="${JWT_SECRET:-}"  # Generate with: openssl rand -base64 32

# ============================================================================
# Application Configuration
# ============================================================================
export NEXT_PUBLIC_APP_URL="https://valuestream.in/horo"
export NEXT_PUBLIC_API_URL="https://valuestream.in/horo/api"
export BACKEND_CORS_ORIGINS='["https://valuestream.in","https://www.valuestream.in"]'

# ============================================================================
# Tags (for cost tracking and organization)
# ============================================================================
export TAGS="Environment=${ENVIRONMENT} Application=${APP_NAME} ManagedBy=AzureCLI"

# ============================================================================
# Helper Functions
# ============================================================================

# Check if required variables are set
check_required_vars() {
    local missing_vars=()
    
    if [ -z "$MYSQL_ADMIN_PASSWORD" ]; then
        missing_vars+=("MYSQL_ADMIN_PASSWORD")
    fi
    
    if [ -z "$GITHUB_TOKEN" ]; then
        missing_vars+=("GITHUB_TOKEN")
    fi

    if [ -z "$PERPLEXITY_API_KEY" ] && [ -z "$ANTHROPIC_API_KEY" ] && [ -z "$OPENAI_API_KEY" ]; then
        missing_vars+=("At least one LLM API key (PERPLEXITY_API_KEY, ANTHROPIC_API_KEY, or OPENAI_API_KEY)")
    fi

    if [ -z "$GEONAMES_USERNAME" ]; then
        missing_vars+=("GEONAMES_USERNAME")
    fi
    
    if [ -z "$NEXTAUTH_SECRET" ]; then
        missing_vars+=("NEXTAUTH_SECRET")
    fi
    
    if [ -z "$JWT_SECRET" ]; then
        missing_vars+=("JWT_SECRET")
    fi
    
    if [ ${#missing_vars[@]} -gt 0 ]; then
        echo "❌ ERROR: The following required variables are not set:"
        for var in "${missing_vars[@]}"; do
            echo "   - $var"
        done
        echo ""
        echo "Please set these variables in azure-deployment-config.sh before running deployment."
        return 1
    fi
    
    echo "✅ All required variables are set"
    return 0
}

# Generate secrets if not set
generate_secrets() {
    if [ -z "$NEXTAUTH_SECRET" ]; then
        export NEXTAUTH_SECRET=$(openssl rand -base64 32)
        echo "✅ Generated NEXTAUTH_SECRET"
    fi
    
    if [ -z "$JWT_SECRET" ]; then
        export JWT_SECRET=$(openssl rand -base64 32)
        echo "✅ Generated JWT_SECRET"
    fi
}

# Display configuration summary
show_config() {
    echo "============================================================================"
    echo "ChandraHoro Azure Deployment Configuration"
    echo "============================================================================"
    echo ""
    echo "Subscription: $SUBSCRIPTION_NAME ($SUBSCRIPTION_ID)"
    echo "Resource Group: $RESOURCE_GROUP"
    echo "Location: $LOCATION"
    echo ""
    echo "Key Vault: $KEY_VAULT_NAME"
    echo "MySQL Server: $MYSQL_SERVER_NAME"
    echo "Redis Cache: $REDIS_NAME"
    echo "Backend App: $BACKEND_APP_NAME"
    echo "Frontend App: $FRONTEND_APP_NAME"
    echo ""
    echo "Frontend URL: $NEXT_PUBLIC_APP_URL"
    echo "Backend URL: $NEXT_PUBLIC_API_URL"
    echo ""
    echo "============================================================================"
}

# Export all variables for use in other scripts
export_vars() {
    env | grep -E "^(RESOURCE_GROUP|LOCATION|KEY_VAULT|MYSQL|REDIS|CONTAINER_APP|APP_SERVICE|BACKEND|FRONTEND|GITHUB|NEXT_PUBLIC|ANTHROPIC|OPENAI|GEONAMES|NEXTAUTH|JWT)=" > .env.azure
    echo "✅ Exported variables to .env.azure"
}

# ============================================================================
# Main
# ============================================================================

if [ "$1" == "check" ]; then
    check_required_vars
elif [ "$1" == "generate" ]; then
    generate_secrets
elif [ "$1" == "show" ]; then
    show_config
elif [ "$1" == "export" ]; then
    export_vars
else
    echo "Usage: source azure-deployment-config.sh [check|generate|show|export]"
    echo ""
    echo "Commands:"
    echo "  check    - Check if all required variables are set"
    echo "  generate - Generate missing secrets (NEXTAUTH_SECRET, JWT_SECRET)"
    echo "  show     - Display configuration summary"
    echo "  export   - Export variables to .env.azure file"
    echo ""
    echo "Example:"
    echo "  source azure-deployment-config.sh"
    echo "  bash azure-deployment-config.sh check"
fi

