# Azure Key Vault Strategy for LLM API Keys

**Version**: 2.1.2  
**Date**: October 29, 2025  
**Topic**: Secure API Key Management for ChandraHoro  
**Repository**: WhatTag/chandrahoro

---

## Executive Summary

**Question**: Do we need Azure Key Vault for LLM API keys stored in frontend configuration?

**Answer**: **YES - HIGHLY RECOMMENDED** for production deployment

**Current Risk**: 🔴 **HIGH** - API keys are currently stored in environment variables without encryption

**Recommended Solution**: Use Azure Key Vault + Azure App Configuration for secure, centralized key management

---

## 1. Current API Key Usage Analysis

### 1.1 Where API Keys Are Used

#### **Frontend (Next.js)**
```typescript
// frontend/src/lib/ai/claude-client.ts
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,  // ⚠️ Server-side only
  timeout: parseInt(process.env.AI_TIMEOUT_MS || '60000'),
  maxRetries: parseInt(process.env.AI_MAX_RETRIES || '3'),
});
```

**API Keys in Frontend:**
```bash
# frontend/.env.example
ANTHROPIC_API_KEY=your-anthropic-api-key-here    # ⚠️ Server-side
OPENAI_API_KEY=your-openai-api-key-here          # ⚠️ Server-side
GOOGLE_API_KEY=your-google-api-key-here          # ⚠️ Server-side
NEXTAUTH_SECRET=your-nextauth-secret-here        # ⚠️ Server-side
JWT_SECRET=your-jwt-secret-here                  # ⚠️ Server-side
DATABASE_URL=mysql://user:pass@host/db           # ⚠️ Server-side
```

**Good News**: ✅ These are **NOT** exposed to client-side (no `NEXT_PUBLIC_` prefix)

**Bad News**: ⚠️ Still stored in plain text in environment variables

---

#### **Backend (FastAPI)**
```python
# backend/.env.example
ANTHROPIC_API_KEY=                               # ⚠️ Plain text
OPENAI_API_KEY=                                  # ⚠️ Plain text
GEONAMES_USERNAME=your_geonames_username         # ⚠️ Plain text
DATABASE_URL=mysql+aiomysql://user:pass@host/db  # ⚠️ Plain text
```

---

### 1.2 Security Analysis

#### **Current Security Posture**

| Aspect | Status | Risk Level |
|--------|--------|------------|
| **Client-side Exposure** | ✅ Not exposed | 🟢 Low |
| **Server-side Storage** | ⚠️ Plain text env vars | 🔴 High |
| **Version Control** | ✅ .env in .gitignore | 🟢 Low |
| **Azure App Service** | ⚠️ App Settings visible | 🟡 Medium |
| **Rotation** | ❌ Manual process | 🔴 High |
| **Audit Logging** | ❌ No tracking | 🔴 High |
| **Access Control** | ⚠️ Anyone with Azure access | 🟡 Medium |

#### **Vulnerabilities**

1. **Environment Variable Exposure**
   - Anyone with Azure portal access can view App Settings
   - Keys visible in deployment logs
   - No encryption at rest

2. **No Key Rotation**
   - Manual process to update keys
   - Requires redeployment
   - Downtime during rotation

3. **No Audit Trail**
   - Can't track who accessed keys
   - Can't track when keys were used
   - No compliance reporting

4. **Shared Access**
   - All developers with Azure access can see keys
   - No granular permissions
   - No separation of duties

---

## 2. Azure Key Vault Solution

### 2.1 What is Azure Key Vault?

Azure Key Vault is a cloud service for securely storing and accessing secrets, keys, and certificates.

**Benefits:**
- ✅ **Encryption at Rest**: Keys encrypted with HSM-backed keys
- ✅ **Access Control**: Fine-grained RBAC and access policies
- ✅ **Audit Logging**: Complete audit trail of all access
- ✅ **Key Rotation**: Automated rotation with zero downtime
- ✅ **Compliance**: Meets SOC, ISO, PCI-DSS standards
- ✅ **Integration**: Native integration with Azure services

---

### 2.2 Recommended Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Azure Key Vault                          │
│  ┌────────────────────────────────────────────────────┐     │
│  │  Secrets:                                          │     │
│  │  - anthropic-api-key                               │     │
│  │  - openai-api-key                                  │     │
│  │  - google-api-key                                  │     │
│  │  - nextauth-secret                                 │     │
│  │  - jwt-secret                                      │     │
│  │  - database-password                               │     │
│  │  - geonames-username                               │     │
│  └────────────────────────────────────────────────────┘     │
└────────────────────┬────────────────────────────────────────┘
                     │
                     │ Managed Identity (RBAC)
                     │
        ┌────────────┴────────────┐
        │                         │
        ▼                         ▼
┌──────────────────┐    ┌──────────────────┐
│  App Service     │    │ Container Apps   │
│  (Frontend)      │    │  (Backend API)   │
│  Managed ID      │    │  Managed ID      │
└──────────────────┘    └──────────────────┘
```

---

### 2.3 Implementation Options

#### **Option 1: Direct Key Vault Integration** ✅ **RECOMMENDED**

**How it works:**
1. Store secrets in Azure Key Vault
2. Use Managed Identity for authentication
3. Reference secrets in App Settings using Key Vault references
4. Azure automatically fetches secrets at runtime

**Pros:**
- ✅ No code changes required
- ✅ Automatic secret refresh
- ✅ Works with existing environment variables
- ✅ Zero downtime key rotation

**Cons:**
- ⚠️ Slight latency on first access
- ⚠️ Requires Managed Identity setup

---

#### **Option 2: Azure App Configuration** ⚠️ **ALTERNATIVE**

**How it works:**
1. Store secrets in Key Vault
2. Reference them in Azure App Configuration
3. Use App Configuration SDK in code
4. Supports feature flags and dynamic config

**Pros:**
- ✅ Centralized configuration management
- ✅ Feature flags support
- ✅ Dynamic configuration updates
- ✅ Better for multi-environment setups

**Cons:**
- ⚠️ Requires code changes
- ⚠️ Additional service cost ($1.20/day)
- ⚠️ More complex setup

---

#### **Option 3: Environment Variables Only** ❌ **NOT RECOMMENDED**

**Current approach - keep using plain text environment variables**

**Pros:**
- ✅ Simple setup
- ✅ No additional cost

**Cons:**
- ❌ Security risk
- ❌ No audit trail
- ❌ Manual rotation
- ❌ Not compliant

---

## 3. Recommended Implementation

### 3.1 Setup Azure Key Vault

```bash
# Variables
RESOURCE_GROUP="chandrahoro-prod"
LOCATION="eastus"
KEY_VAULT_NAME="chandrahoro-kv"  # Must be globally unique

# Create Key Vault
az keyvault create \
  --name $KEY_VAULT_NAME \
  --resource-group $RESOURCE_GROUP \
  --location $LOCATION \
  --sku standard \
  --enable-rbac-authorization true

# Store secrets
az keyvault secret set \
  --vault-name $KEY_VAULT_NAME \
  --name "anthropic-api-key" \
  --value "your-actual-anthropic-key"

az keyvault secret set \
  --vault-name $KEY_VAULT_NAME \
  --name "openai-api-key" \
  --value "your-actual-openai-key"

az keyvault secret set \
  --vault-name $KEY_VAULT_NAME \
  --name "nextauth-secret" \
  --value "your-actual-nextauth-secret"

az keyvault secret set \
  --vault-name $KEY_VAULT_NAME \
  --name "database-password" \
  --value "your-actual-db-password"

az keyvault secret set \
  --vault-name $KEY_VAULT_NAME \
  --name "geonames-username" \
  --value "your-actual-geonames-username"
```

---

### 3.2 Enable Managed Identity

#### **For App Service (Frontend)**

```bash
# Enable system-assigned managed identity
az webapp identity assign \
  --name chandrahoro-frontend \
  --resource-group $RESOURCE_GROUP

# Get the principal ID
FRONTEND_PRINCIPAL_ID=$(az webapp identity show \
  --name chandrahoro-frontend \
  --resource-group $RESOURCE_GROUP \
  --query principalId \
  --output tsv)

# Grant Key Vault access
az role assignment create \
  --role "Key Vault Secrets User" \
  --assignee $FRONTEND_PRINCIPAL_ID \
  --scope /subscriptions/YOUR_SUBSCRIPTION_ID/resourceGroups/$RESOURCE_GROUP/providers/Microsoft.KeyVault/vaults/$KEY_VAULT_NAME
```

#### **For Container Apps (Backend)**

```bash
# Enable system-assigned managed identity
az containerapp identity assign \
  --name chandrahoro-backend \
  --resource-group $RESOURCE_GROUP

# Get the principal ID
BACKEND_PRINCIPAL_ID=$(az containerapp identity show \
  --name chandrahoro-backend \
  --resource-group $RESOURCE_GROUP \
  --query principalId \
  --output tsv)

# Grant Key Vault access
az role assignment create \
  --role "Key Vault Secrets User" \
  --assignee $BACKEND_PRINCIPAL_ID \
  --scope /subscriptions/YOUR_SUBSCRIPTION_ID/resourceGroups/$RESOURCE_GROUP/providers/Microsoft.KeyVault/vaults/$KEY_VAULT_NAME
```

---

### 3.3 Configure Key Vault References

#### **Frontend App Settings**

```bash
# Update App Service configuration with Key Vault references
az webapp config appsettings set \
  --name chandrahoro-frontend \
  --resource-group $RESOURCE_GROUP \
  --settings \
    ANTHROPIC_API_KEY="@Microsoft.KeyVault(VaultName=chandrahoro-kv;SecretName=anthropic-api-key)" \
    OPENAI_API_KEY="@Microsoft.KeyVault(VaultName=chandrahoro-kv;SecretName=openai-api-key)" \
    NEXTAUTH_SECRET="@Microsoft.KeyVault(VaultName=chandrahoro-kv;SecretName=nextauth-secret)" \
    JWT_SECRET="@Microsoft.KeyVault(VaultName=chandrahoro-kv;SecretName=jwt-secret)" \
    DATABASE_URL="mysql://chandrahoro:@Microsoft.KeyVault(VaultName=chandrahoro-kv;SecretName=database-password)@chandrahoro-mysql.mysql.database.azure.com:3306/chandrahoro"
```

#### **Backend Environment Variables**

```bash
# Update Container Apps configuration with Key Vault references
az containerapp update \
  --name chandrahoro-backend \
  --resource-group $RESOURCE_GROUP \
  --set-env-vars \
    ANTHROPIC_API_KEY="secretref:anthropic-api-key" \
    OPENAI_API_KEY="secretref:openai-api-key" \
    GEONAMES_USERNAME="secretref:geonames-username"

# Add secrets to Container Apps
az containerapp secret set \
  --name chandrahoro-backend \
  --resource-group $RESOURCE_GROUP \
  --secrets \
    anthropic-api-key=keyvaultref:https://chandrahoro-kv.vault.azure.net/secrets/anthropic-api-key,identityref:/subscriptions/YOUR_SUBSCRIPTION_ID/resourceGroups/$RESOURCE_GROUP/providers/Microsoft.ManagedIdentity/userAssignedIdentities/chandrahoro-backend
```

---

### 3.4 No Code Changes Required!

**The beauty of this approach**: Your existing code continues to work as-is!

```typescript
// frontend/src/lib/ai/claude-client.ts
// No changes needed - still reads from process.env
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,  // ✅ Now from Key Vault
});
```

```python
# backend/app/api/v1/ai.py
# No changes needed - still reads from os.getenv
anthropic_key = os.getenv("ANTHROPIC_API_KEY")  # ✅ Now from Key Vault
```

---

## 4. Cost Analysis

### 4.1 Azure Key Vault Pricing

| Tier | Price | Features |
|------|-------|----------|
| **Standard** | $0.03 per 10,000 operations | Software-protected keys |
| **Premium** | $1.00 per key/month + operations | HSM-protected keys |

**Estimated Monthly Cost:**
- Standard tier: **$5-10/month** (for typical usage)
- Premium tier: **$50-100/month** (for high security)

**Recommendation**: Start with **Standard tier** ($5-10/month)

---

### 4.2 Total Cost Comparison

| Approach | Setup Cost | Monthly Cost | Security | Compliance |
|----------|------------|--------------|----------|------------|
| **Environment Variables** | $0 | $0 | 🔴 Low | ❌ No |
| **Key Vault (Standard)** | $0 | $5-10 | 🟢 High | ✅ Yes |
| **Key Vault (Premium)** | $0 | $50-100 | 🟢 Very High | ✅ Yes |
| **App Configuration + KV** | $0 | $40-50 | 🟢 High | ✅ Yes |

**Recommendation**: Use **Key Vault Standard** for best value

---

## 5. Key Rotation Strategy

### 5.1 Automated Rotation

```bash
# Create a new version of a secret (zero downtime)
az keyvault secret set \
  --vault-name chandrahoro-kv \
  --name "anthropic-api-key" \
  --value "new-anthropic-key-value"

# App Service automatically picks up new version within 24 hours
# Or force refresh immediately:
az webapp restart \
  --name chandrahoro-frontend \
  --resource-group chandrahoro-prod
```

### 5.2 Rotation Schedule

**Recommended rotation schedule:**
- **API Keys**: Every 90 days
- **Secrets (NextAuth, JWT)**: Every 180 days
- **Database Passwords**: Every 90 days

---

## 6. Audit and Monitoring

### 6.1 Enable Diagnostic Logging

```bash
# Create Log Analytics workspace
az monitor log-analytics workspace create \
  --resource-group chandrahoro-prod \
  --workspace-name chandrahoro-logs

# Enable Key Vault diagnostics
az monitor diagnostic-settings create \
  --name kv-diagnostics \
  --resource /subscriptions/YOUR_SUBSCRIPTION_ID/resourceGroups/chandrahoro-prod/providers/Microsoft.KeyVault/vaults/chandrahoro-kv \
  --workspace chandrahoro-logs \
  --logs '[{"category": "AuditEvent", "enabled": true}]' \
  --metrics '[{"category": "AllMetrics", "enabled": true}]'
```

### 6.2 Query Audit Logs

```kusto
// Who accessed which secrets?
AzureDiagnostics
| where ResourceProvider == "MICROSOFT.KEYVAULT"
| where OperationName == "SecretGet"
| project TimeGenerated, CallerIPAddress, identity_claim_upn_s, requestUri_s
| order by TimeGenerated desc
```

---

## 7. Comparison: With vs Without Key Vault

### 7.1 Without Key Vault (Current)

```bash
# Azure App Service App Settings (visible to anyone with access)
ANTHROPIC_API_KEY=sk-ant-api03-xxxxxxxxxxxxx  # ⚠️ Visible in portal
OPENAI_API_KEY=sk-xxxxxxxxxxxxxxxxxxxxxxxx    # ⚠️ Visible in portal
DATABASE_URL=mysql://user:password@host/db     # ⚠️ Password visible
```

**Risks:**
- ❌ Anyone with Azure portal access can see keys
- ❌ Keys visible in deployment logs
- ❌ No audit trail of access
- ❌ Manual rotation requires redeployment
- ❌ Not compliant with security standards

---

### 7.2 With Key Vault (Recommended)

```bash
# Azure App Service App Settings (references only)
ANTHROPIC_API_KEY=@Microsoft.KeyVault(VaultName=chandrahoro-kv;SecretName=anthropic-api-key)
OPENAI_API_KEY=@Microsoft.KeyVault(VaultName=chandrahoro-kv;SecretName=openai-api-key)
```

**Benefits:**
- ✅ Keys never visible in portal
- ✅ Complete audit trail
- ✅ Automated rotation
- ✅ RBAC-based access control
- ✅ Compliance-ready

---

## 8. Final Recommendation

### 8.1 For Production: **USE KEY VAULT** ✅

**Why:**
1. **Security**: Keys encrypted at rest and in transit
2. **Compliance**: Meets industry standards (SOC, ISO, PCI-DSS)
3. **Audit**: Complete audit trail for compliance
4. **Rotation**: Zero-downtime key rotation
5. **Cost**: Only $5-10/month for standard tier
6. **No Code Changes**: Works with existing code

### 8.2 Implementation Priority

**Phase 1: Critical Secrets** (Immediate)
- ✅ Database passwords
- ✅ NextAuth secret
- ✅ JWT secret

**Phase 2: API Keys** (Week 1)
- ✅ Anthropic API key
- ✅ OpenAI API key
- ✅ GeoNames username

**Phase 3: Optional Secrets** (Week 2)
- ✅ Google Maps API key
- ✅ Email service keys
- ✅ Analytics keys

---

## 9. Quick Start Guide

### 9.1 Minimal Setup (5 minutes)

```bash
# 1. Create Key Vault
az keyvault create --name chandrahoro-kv --resource-group chandrahoro-prod --location eastus

# 2. Store critical secrets
az keyvault secret set --vault-name chandrahoro-kv --name "anthropic-api-key" --value "YOUR_KEY"
az keyvault secret set --vault-name chandrahoro-kv --name "database-password" --value "YOUR_PASSWORD"

# 3. Enable Managed Identity on App Service
az webapp identity assign --name chandrahoro-frontend --resource-group chandrahoro-prod

# 4. Grant access
az role assignment create \
  --role "Key Vault Secrets User" \
  --assignee $(az webapp identity show --name chandrahoro-frontend --resource-group chandrahoro-prod --query principalId -o tsv) \
  --scope $(az keyvault show --name chandrahoro-kv --resource-group chandrahoro-prod --query id -o tsv)

# 5. Update App Settings
az webapp config appsettings set \
  --name chandrahoro-frontend \
  --resource-group chandrahoro-prod \
  --settings ANTHROPIC_API_KEY="@Microsoft.KeyVault(VaultName=chandrahoro-kv;SecretName=anthropic-api-key)"

# Done! ✅
```

---

## 10. Conclusion

**Question**: Do we need Azure Key Vault for LLM API keys?

**Answer**: **YES - ABSOLUTELY RECOMMENDED**

**Summary:**
- ✅ **Security**: 10x better than environment variables
- ✅ **Cost**: Only $5-10/month
- ✅ **Effort**: No code changes required
- ✅ **Compliance**: Industry standard
- ✅ **ROI**: High value for minimal cost

**Next Steps:**
1. Review this document
2. Decide on Standard vs Premium tier
3. Follow Quick Start Guide
4. Implement in development first
5. Roll out to production

**Estimated Time**: 30 minutes setup, 0 minutes code changes

---

**Ready to implement Azure Key Vault?** 🔐

