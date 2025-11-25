# Owner Name Key Sharing Feature

## Overview

The **Owner Name Key Sharing** feature provides a simple way for multiple users to share the same LLM API key during testing and development. Unlike the complex Shared Keys system with access control, this approach uses a simple "owner name" identifier that anyone can reference.

## Key Concept

**API keys are stored and retrieved by "owner name", NOT by the logged-in user's ID.**

This means:
- User A can configure an API key with owner name "test-openai"
- User B can also configure with owner name "test-openai"
- Both users will use the SAME API key because they specified the same owner name
- No access control, no permissions, no usage limits - just simple key sharing

## Use Cases

### ✅ **Perfect For:**
- Testing with multiple test accounts
- Development environments
- Small teams that trust each other
- Quick prototyping without complex access control
- Sharing API keys across test users

### ❌ **NOT Recommended For:**
- Production environments with untrusted users
- Scenarios requiring usage tracking per user
- Scenarios requiring rate limiting
- Scenarios requiring access control

## How It Works

### Example Scenario

**User A (alice@example.com) configures:**
```json
{
  "use_owner_name": true,
  "key_owner_name": "test-openai",
  "provider": "openai",
  "model": "gpt-4",
  "api_key": "sk-abc123..."
}
```

**User B (bob@example.com) configures:**
```json
{
  "use_owner_name": true,
  "key_owner_name": "test-openai",
  "provider": "openai",
  "model": "gpt-4",
  "api_key": "sk-abc123..."  // Same or different - doesn't matter
}
```

**Result:**
- Both users use the API key stored under owner name "test-openai"
- The system looks up the key by owner name, not by who is logged in
- If User A updates the key, User B automatically uses the new key (same owner name)

### Vault Storage

Keys are stored in the vault with this format:
```
vault://secret/owner-{owner_name}-{provider}-key
```

Examples:
- `vault://secret/owner-test-openai-openai-key`
- `vault://secret/owner-shared-anthropic-anthropic-key`
- `vault://secret/owner-team-perplexity-perplexity-key`

## API Usage

### Save Configuration with Owner Name

**Endpoint:** `POST /api/v1/llm/save`

**Request:**
```json
{
  "use_owner_name": true,
  "key_owner_name": "test-openai",
  "provider": "openai",
  "model": "gpt-4",
  "api_key": "sk-abc123...",
  "base_url": null,
  "region": null,
  "deployment": null,
  "extra_headers": null,
  "response_format": "auto",
  "daily_limit": null
}
```

**Response:**
```json
{
  "ok": true
}
```

### Get Current Configuration

**Endpoint:** `GET /api/v1/llm/me`

**Response (using owner name):**
```json
{
  "id": "uuid",
  "use_shared_key": false,
  "shared_key_account_name": null,
  "shared_key_display_name": null,
  "use_owner_name": true,
  "key_owner_name": "test-openai",
  "provider": "openai",
  "model": "gpt-4",
  "base_url": null,
  "key_last_four": "3...",
  "last_validated_at": "2025-10-30T14:00:00Z",
  "usage_today": 0,
  "daily_limit": null,
  "is_active": true,
  "created_at": "2025-10-30T14:00:00Z",
  "updated_at": "2025-10-30T14:00:00Z"
}
```

## Three Configuration Modes

The LLM configuration system now supports **three modes**:

### 1. Personal Key (BYOK - Bring Your Own Key)
- Each user has their own API key
- Key stored by user ID
- Full access control and rate limiting
- **Use when:** Each user should have their own key

**Configuration:**
```json
{
  "use_shared_key": false,
  "use_owner_name": false,
  "provider": "openai",
  "model": "gpt-4",
  "api_key": "sk-personal..."
}
```

### 2. Shared Key (Complex Access Control)
- Centralized API keys with access control
- Owner can manage who has access
- Per-user usage tracking and rate limiting
- **Use when:** Production environment with access control needed

**Configuration:**
```json
{
  "use_shared_key": true,
  "shared_key_account_name": "team-openai"
}
```

### 3. Owner Name (Simple Sharing) ⭐ NEW
- Simple key sharing by name
- No access control
- No per-user tracking
- **Use when:** Testing/development with trusted users

**Configuration:**
```json
{
  "use_owner_name": true,
  "key_owner_name": "test-openai",
  "provider": "openai",
  "model": "gpt-4",
  "api_key": "sk-shared..."
}
```

## Database Schema

### LlmConfig Model

```python
class LlmConfig(BaseModel):
    user_id = Column(String(36), ForeignKey("users.id"))
    
    # Mode 1: Personal key
    # (use_shared_key=False, use_owner_name=False)
    
    # Mode 2: Shared key
    use_shared_key = Column(Boolean, default=False)
    shared_key_account_name = Column(String(100))
    
    # Mode 3: Owner name (NEW)
    use_owner_name = Column(Boolean, default=False)
    key_owner_name = Column(String(100))
    
    # Configuration (used for personal and owner name modes)
    provider = Column(Enum(LlmProvider), nullable=True)
    model = Column(String(100), nullable=True)
    key_vault_ref = Column(String(200), nullable=True)
    key_last_four = Column(String(4), nullable=True)
    # ... other fields
```

## Testing Examples

### Example 1: Two Test Users Share OpenAI Key

**User 1 (tester@example.com):**
```bash
curl -X POST http://localhost:8000/api/v1/llm/save \
  -H "Authorization: Bearer $TOKEN_USER1" \
  -H "Content-Type: application/json" \
  -d '{
    "use_owner_name": true,
    "key_owner_name": "test-openai",
    "provider": "openai",
    "model": "gpt-4",
    "api_key": "sk-abc123..."
  }'
```

**User 2 (tester2@example.com):**
```bash
curl -X POST http://localhost:8000/api/v1/llm/save \
  -H "Authorization: Bearer $TOKEN_USER2" \
  -H "Content-Type: application/json" \
  -d '{
    "use_owner_name": true,
    "key_owner_name": "test-openai",
    "provider": "openai",
    "model": "gpt-4",
    "api_key": "sk-abc123..."
  }'
```

**Result:** Both users now use the same API key stored under "test-openai".

### Example 2: Multiple Provider Keys

**Perplexity Key:**
```bash
curl -X POST http://localhost:8000/api/v1/llm/save \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "use_owner_name": true,
    "key_owner_name": "test-perplexity",
    "provider": "perplexity",
    "model": "llama-3.1-sonar-large-128k-online",
    "api_key": "pplx-..."
  }'
```

**Anthropic Key:**
```bash
curl -X POST http://localhost:8000/api/v1/llm/save \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "use_owner_name": true,
    "key_owner_name": "test-anthropic",
    "provider": "anthropic",
    "model": "claude-3-opus-20240229",
    "api_key": "sk-ant-..."
  }'
```

## Security Considerations

### ⚠️ Important Notes

1. **No Access Control**: Anyone who knows the owner name can use the key
2. **No Usage Tracking**: Cannot track which user made which request
3. **No Rate Limiting**: Cannot limit usage per user
4. **Trust Required**: Only use with trusted users in controlled environments

### Best Practices

1. **Use descriptive owner names**: `test-openai`, `dev-anthropic`, `staging-perplexity`
2. **Don't use in production**: This is for testing/development only
3. **Rotate keys regularly**: Change API keys periodically
4. **Monitor usage**: Check your LLM provider's dashboard for unusual activity
5. **Transition to Shared Keys**: When going to production, migrate to the Shared Keys system

## Migration Path

### From Owner Name to Shared Keys

When you're ready to move to production:

1. **Create a shared key** with the same configuration:
```bash
curl -X POST http://localhost:8000/api/v1/llm/shared-keys \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -d '{
    "account_name": "production-openai",
    "display_name": "Production OpenAI Key",
    "provider": "openai",
    "model": "gpt-4",
    "api_key": "sk-abc123...",
    "is_public": false,
    "allowed_user_ids": ["user1", "user2", "user3"],
    "daily_limit": 1000,
    "per_user_daily_limit": 100
  }'
```

2. **Update users to use shared key**:
```bash
curl -X POST http://localhost:8000/api/v1/llm/save \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "use_shared_key": true,
    "shared_key_account_name": "production-openai"
  }'
```

3. **Benefits of migration**:
   - ✅ Access control (only allowed users can use the key)
   - ✅ Usage tracking per user
   - ✅ Rate limiting per user and globally
   - ✅ Audit trail
   - ✅ Owner can manage access

## Frontend Integration

### Update LLM Configuration Form

Add a third option to the configuration form:

```typescript
// Radio buttons or tabs
[ ] Personal Key (BYOK)
[ ] Shared Key
[x] Owner Name (Simple Sharing)

// When "Owner Name" is selected:
Owner Name: [test-openai        ]
Provider:   [OpenAI ▼           ]
Model:      [gpt-4              ]
API Key:    [sk-abc123...       ]
```

### TypeScript Types

```typescript
interface LlmConfigInput {
  use_shared_key: boolean;
  shared_key_account_name?: string;
  use_owner_name: boolean;
  key_owner_name?: string;
  provider?: LlmProvider;
  model?: string;
  api_key?: string;
  // ... other fields
}

interface LlmConfigSummary {
  id: string;
  use_shared_key: boolean;
  shared_key_account_name?: string;
  shared_key_display_name?: string;
  use_owner_name: boolean;
  key_owner_name?: string;
  provider?: LlmProvider;
  model?: string;
  // ... other fields
}
```

## Summary

The Owner Name Key Sharing feature provides a **simple, no-frills way to share API keys** for testing and development:

✅ **Pros:**
- Simple to use
- No complex access control
- Perfect for testing
- Easy to set up

❌ **Cons:**
- No security/access control
- No per-user tracking
- Not suitable for production
- Requires trust between users

**Use this feature for testing, then migrate to Shared Keys for production!**

