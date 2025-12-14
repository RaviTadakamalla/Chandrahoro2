# 🚀 ChandraHoro - Complete Hostinger VPS Deployment Guide

## 📋 Table of Contents

1. [Part 1: LLM Integration Architecture Analysis](#part-1-llm-integration-architecture-analysis)
2. [Part 2: Hostinger VPS Deployment](#part-2-hostinger-vps-deployment)
3. [Part 3: Security & Best Practices](#part-3-security--best-practices)
4. [Part 4: Verification & Monitoring](#part-4-verification--monitoring)

---

## Part 1: LLM Integration Architecture Analysis

### 1.1 Backend LLM Service Architecture

#### **Core Components**

**File:** `backend/app/services/llm_service.py`

The LLM service consists of two main classes:

1. **`LlmKeyVault`** - Secure API key encryption and storage
2. **`LlmService`** - LLM configuration management and API interactions

#### **API Key Encryption System (Fernet)**

```python
class LlmKeyVault:
    def __init__(self):
        # Get encryption key from environment
        key = os.getenv("LLM_VAULT_KEY")
        if not key:
            # Generate a key for development (NOT for production)
            key = Fernet.generate_key().decode()
            logger.warning("No LLM_VAULT_KEY found")
        
        self.cipher = Fernet(key)
        self.vault_dir = os.getenv("LLM_VAULT_DIR", "/tmp/llm_vault")
```

**Key Features:**
- ✅ Uses **Fernet symmetric encryption** (cryptography library)
- ✅ Encryption key from `LLM_VAULT_KEY` environment variable
- ✅ Encrypted keys stored in `LLM_VAULT_DIR` (default: `/tmp/llm_vault`)
- ✅ Each encrypted key stored as `{key_name}.enc` file
- ⚠️ **CRITICAL:** If `LLM_VAULT_KEY` changes, all existing encrypted keys become unreadable

#### **Vault Reference System**

The system uses "vault references" to identify encrypted keys:

```python
# Personal key (per user)
vault_ref = f"vault://secret/user-{user_id}-{provider}-key"

# Owner name key (shared by owner name)
vault_ref = f"vault://secret/owner-{key_owner_name}-{provider}-key"

# Shared key (team/organization)
vault_ref = f"vault://secret/shared-{account_name}-key"
```

**Storage Flow:**
1. User provides API key via frontend
2. Backend encrypts key using Fernet cipher
3. Encrypted key stored in vault directory
4. Vault reference stored in database (`llm_configs` table)
5. Only last 4 characters stored in plaintext for display

#### **Supported AI Providers**

**File:** `backend/app/models/llm_models.py`

```python
class LlmProvider(str, enum.Enum):
    OPENAI = "openai"
    AZURE_OPENAI = "azure-openai"
    ANTHROPIC = "anthropic"
    GOOGLE = "google"
    OPENROUTER = "openrouter"
    MISTRAL = "mistral"
    TOGETHER = "together"
    GROQ = "groq"
    PERPLEXITY = "perplexity"
    COHERE = "cohere"
    XAI = "xai"
    OLLAMA = "ollama"
    CUSTOM = "custom"
```

**Provider-Specific Configuration:**
- **OpenAI**: Requires `api_key`, optional `base_url`
- **Anthropic**: Requires `api_key`, uses `anthropic-version` header
- **Google**: Requires `api_key`, uses Gemini API
- **Perplexity**: Requires `api_key`, supports online models
- **Azure OpenAI**: Requires `api_key`, `region`, `deployment`, `base_url`

#### **API Key Storage Modes**

The system supports **3 modes** of API key storage:

1. **Personal Key** (`use_shared_key=False`, `use_owner_name=False`)
   - Each user has their own encrypted API key
   - Vault ref: `vault://secret/user-{user_id}-{provider}-key`

2. **Owner Name Key** (`use_owner_name=True`)
   - Multiple users share a key by using the same owner name
   - Vault ref: `vault://secret/owner-{owner_name}-{provider}-key`
   - No access control - anyone can use any owner name

3. **Shared Key** (`use_shared_key=True`)
   - Team/organization keys with access control
   - Vault ref: `vault://secret/shared-{account_name}-key`
   - Supports public keys or restricted user lists

---

### 1.2 Frontend AI Features

#### **AI Settings Page**

**File:** `frontend/src/pages/ai-insights.tsx`

The AI Settings page allows users to:
- Configure LLM provider and model
- Enter and test API keys
- Set daily usage limits
- View usage statistics
- Rotate or delete API keys

**Component:** `MyLlmSettingsCard`
**File:** `frontend/src/components/ai/MyLlmSettingsCard.tsx`

**Key Features:**
- Provider selection dropdown
- Model selection (provider-specific)
- API key input (masked)
- Connection testing
- Configuration save/update/delete

#### **AI-Powered Features**

1. **Chart Interpretation** (`/api/v1/ai/interpret`)
   - **File:** `frontend/src/features/ai/modules/chart-interpretation/index.tsx`
   - Generates comprehensive personality analysis
   - Covers: personality, life path, strengths, challenges, relationships, career

2. **Compatibility Analysis** (`/api/v1/ai/compatibility`)
   - **File:** `frontend/src/features/ai/modules/compatibility-analysis/index.tsx`
   - Analyzes relationship compatibility
   - Compares two birth charts

3. **Dasha Predictions** (`/api/v1/ai/dasha-predictions`)
   - **File:** `frontend/src/features/ai/modules/dasha-predictions/index.tsx`
   - Predicts opportunities and challenges in Dasha periods
   - Provides timing guidance

4. **Timeline Predictions** (`/api/v1/ai/timeline`)
   - Generates predictions for specific time periods
   - Analyzes transits and progressions

**API Call Pattern:**
```typescript
const response = await fetch(`${API_URL}/api/v1/ai/interpret`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
  },
  body: JSON.stringify({ chart_data, include_sections })
});
```

---

### 1.3 Current Localhost Configuration

#### **Backend Environment Variables** (`backend/.env`)

```bash
# LLM Vault Encryption Key (CRITICAL - DO NOT CHANGE IN PRODUCTION)
LLM_VAULT_KEY=AZY3-csEfDMGlb3Pq_nJaVxwRW4MXdKN5dZIwWxZtUI=

# System-level API keys (optional - for testing)
PERPLEXITY_API_KEY=your_perplexity_api_key_here
ANTHROPIC_API_KEY=
OPENAI_API_KEY=

# AI Provider defaults
AI_PROVIDER=perplexity
AI_MODEL=llama-3.1-sonar-small-128k-online

# Vault storage directory
LLM_VAULT_DIR=/tmp/llm_vault  # Default if not set
```

#### **Frontend Environment Variables** (`frontend/.env.local`)

```bash
# API URLs
NEXT_PUBLIC_API_URL=http://localhost:8000

# AI Provider keys (optional - users configure their own)
PERPLEXITY_API_KEY=your_perplexity_api_key_here
ANTHROPIC_API_KEY=
OPENAI_API_KEY=
```

#### **Docker Compose Configuration**

```yaml
backend:
  environment:
    PERPLEXITY_API_KEY: your_perplexity_api_key_here
    # LLM_VAULT_KEY should be added here for Docker deployment
```

---

### 1.4 Security and Best Practices

#### **System-Level vs User-Level API Keys**

| Type | Use Case | Storage | Access Control |
|------|----------|---------|----------------|
| **System-Level** | Default/fallback for all users | Environment variables | Admin only |
| **User-Level** | Personal API keys | Encrypted vault | Per user |
| **Owner Name** | Simple sharing (testing) | Encrypted vault | No control |
| **Shared Key** | Team/organization | Encrypted vault | ACL-based |

**Recommendations:**

1. **For Production:**
   - ✅ Use **user-level keys** (BYOK - Bring Your Own Key)
   - ✅ Optionally provide **shared keys** for teams
   - ⚠️ Avoid system-level keys in environment variables

2. **For Development/Testing:**
   - ✅ Use **owner name keys** for quick testing
   - ✅ Use **system-level keys** as fallback

#### **Critical Security Considerations**

1. **`LLM_VAULT_KEY` Management:**
   - ⚠️ **NEVER change this key in production** - all encrypted keys will become unreadable
   - ✅ Generate once during initial setup: `python -c "from cryptography.fernet import Fernet; print(Fernet.generate_key().decode())"`
   - ✅ Store securely (environment variable, secrets manager)
   - ✅ Backup this key securely

2. **Vault Directory:**
   - ⚠️ Default `/tmp/llm_vault` is **NOT persistent** (cleared on reboot)
   - ✅ Use persistent directory: `/var/lib/chandrahoro/llm_vault`
   - ✅ Set proper permissions: `chmod 700 /var/lib/chandrahoro/llm_vault`
   - ✅ Backup encrypted keys regularly

3. **API Key Rotation:**
   - ✅ Users can rotate their own keys via UI
   - ✅ System provides "Rotate Key" functionality
   - ✅ Old keys are deleted from vault

---

## Part 2: Hostinger VPS Deployment

### 2.1 Pre-Deployment Checklist

#### **Required Information**

- [ ] Hostinger VPS IP address
- [ ] SSH root password (from Hostinger panel)
- [ ] Domain name (optional but recommended)
- [ ] GitHub repository access
- [ ] API keys for LLM providers (if using system-level keys)

#### **Environment Variables Needed**

**Backend (Production):**
```bash
# Application
APP_NAME=ChandraHoro
ENVIRONMENT=production
DEBUG=False

# Database
DATABASE_URL=mysql+aiomysql://chandrahoro_user:STRONG_PASSWORD@localhost:3306/chandrahoro
SYNC_DATABASE_URL=mysql+pymysql://chandrahoro_user:STRONG_PASSWORD@localhost:3306/chandrahoro

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# LLM Vault (CRITICAL - Generate once and never change)
LLM_VAULT_KEY=<generate-with-fernet>
LLM_VAULT_DIR=/var/lib/chandrahoro/llm_vault

# API Keys (optional - users can provide their own)
PERPLEXITY_API_KEY=<your-key>
ANTHROPIC_API_KEY=<your-key>
OPENAI_API_KEY=<your-key>

# GeoNames
GEONAMES_USERNAME=<your-username>

# CORS (update with your domain)
BACKEND_CORS_ORIGINS=["https://yourdomain.com","https://www.yourdomain.com"]
```

**Frontend (Production):**
```bash
# Application
NEXT_PUBLIC_APP_URL=https://yourdomain.com
NEXT_PUBLIC_API_URL=https://yourdomain.com/api

# Authentication
NEXTAUTH_SECRET=<generate-with-openssl>
NEXTAUTH_URL=https://yourdomain.com
JWT_SECRET=<generate-with-openssl>

# Database
DATABASE_URL=mysql://chandrahoro_user:STRONG_PASSWORD@localhost:3306/chandrahoro
```

#### **Generate Secrets**

```bash
# Generate LLM_VAULT_KEY
python3 -c "from cryptography.fernet import Fernet; print(Fernet.generate_key().decode())"

# Generate NEXTAUTH_SECRET and JWT_SECRET
openssl rand -base64 32
openssl rand -base64 32
```

---


