# LLM Shared Keys Feature

## Overview

The LLM Shared Keys feature enables multi-user API key sharing, allowing teams and organizations to share LLM API keys efficiently while maintaining security, access control, and usage tracking.

## Key Benefits

1. **Team Collaboration**: Multiple users can share the same LLM API key
2. **Cost Efficiency**: Reduces redundant API key storage and management
3. **Centralized Management**: Key owners can manage access and monitor usage
4. **Granular Access Control**: Public keys, private keys, or user-specific access
5. **Usage Tracking**: Per-user and aggregate usage statistics
6. **Audit Trail**: Complete audit log of who used which key and when

## Architecture

### Database Models

#### 1. `LlmSharedKey`
Stores shared API keys that can be used by multiple users.

**Key Fields:**
- `account_name`: Unique identifier (e.g., "team-openai", "org-anthropic")
- `display_name`: Human-readable name
- `owner_user_id`: User who created/owns the key
- `is_public`: If true, all users can use it
- `allowed_user_ids`: JSON array of user IDs with access (if not public)
- `provider`, `model`, `base_url`: LLM configuration
- `key_vault_ref`: Encrypted API key reference
- `daily_limit`: Shared daily limit across all users
- `per_user_daily_limit`: Per-user daily limit

#### 2. `LlmSharedKeyUsage`
Tracks per-user usage of shared keys for rate limiting and analytics.

**Key Fields:**
- `shared_key_account_name`: Reference to shared key
- `user_id`: User who used the key
- `usage_today`, `usage_this_month`, `total_usage_count`: Usage metrics
- `last_used_at`: Timestamp of last use

#### 3. `LlmConfig` (Updated)
User LLM configuration - can now use personal key OR reference a shared key.

**New Fields:**
- `use_shared_key`: Boolean flag
- `shared_key_account_name`: Reference to shared key (if using shared key)

**Modified Fields:**
- `provider`, `model`, `key_vault_ref`, `key_last_four`: Now nullable (not needed when using shared key)

## API Endpoints

### Shared Key Management

#### `GET /api/v1/llm/shared-keys`
List all shared keys accessible to the current user.

**Response:**
```json
[
  {
    "id": "uuid",
    "account_name": "team-openai",
    "display_name": "Team OpenAI Key",
    "description": "Shared key for team use",
    "owner_user_id": "uuid",
    "owner_email": "owner@example.com",
    "is_public": false,
    "provider": "openai",
    "model": "gpt-4",
    "key_last_four": "abcd",
    "is_active": true,
    "usage_today": 42,
    "usage_this_month": 1250,
    "total_usage_count": 5000,
    "daily_limit": 1000,
    "per_user_daily_limit": 100,
    "can_edit": true,
    "can_use": true,
    "created_at": "2025-10-30T12:00:00Z",
    "updated_at": "2025-10-30T12:00:00Z"
  }
]
```

#### `POST /api/v1/llm/shared-keys`
Create a new shared API key.

**Request:**
```json
{
  "account_name": "team-openai",
  "display_name": "Team OpenAI Key",
  "description": "Shared key for team use",
  "provider": "openai",
  "model": "gpt-4",
  "api_key": "sk-...",
  "is_public": false,
  "allowed_user_ids": ["user-id-1", "user-id-2"],
  "daily_limit": 1000,
  "per_user_daily_limit": 100
}
```

**Response:**
```json
{
  "ok": true,
  "account_name": "team-openai"
}
```

#### `GET /api/v1/llm/shared-keys/{account_name}`
Get details of a specific shared key.

#### `DELETE /api/v1/llm/shared-keys/{account_name}`
Delete a shared key (owner or admin only).

### User Configuration

#### `POST /api/v1/llm/save`
Save LLM configuration - can use personal key or shared key.

**Using Shared Key:**
```json
{
  "use_shared_key": true,
  "shared_key_account_name": "team-openai"
}
```

**Using Personal Key (BYOK):**
```json
{
  "use_shared_key": false,
  "provider": "openai",
  "model": "gpt-4",
  "api_key": "sk-...",
  "daily_limit": 100
}
```

#### `GET /api/v1/llm/me`
Get current user's LLM configuration.

**Response (using shared key):**
```json
{
  "id": "uuid",
  "use_shared_key": true,
  "shared_key_account_name": "team-openai",
  "shared_key_display_name": "Team OpenAI Key",
  "provider": null,
  "model": null,
  "key_last_four": null,
  "usage_today": 5,
  "is_active": true,
  "created_at": "2025-10-30T12:00:00Z",
  "updated_at": "2025-10-30T12:00:00Z"
}
```

## Access Control

### Permission Levels

1. **Owner**: User who created the shared key
   - Can edit key settings
   - Can delete the key
   - Can manage allowed users
   - Can use the key

2. **Allowed User**: User explicitly granted access
   - Can use the key
   - Cannot edit or delete

3. **Public Access**: If `is_public=true`
   - All users can use the key
   - Only owner can edit/delete

4. **Admin**: Users with admin role
   - Can view all shared keys
   - Can edit/delete any shared key

### Access Checks

When a user tries to use a shared key:
1. Check if key exists and is active
2. Check if user is owner OR key is public OR user is in allowed_user_ids
3. Check rate limits (shared daily limit and per-user daily limit)
4. Track usage in `LlmSharedKeyUsage` table

## Rate Limiting

### Two-Level Rate Limiting

1. **Shared Daily Limit** (`daily_limit`):
   - Total requests across all users
   - Tracked in `LlmSharedKey.usage_today`

2. **Per-User Daily Limit** (`per_user_daily_limit`):
   - Requests per individual user
   - Tracked in `LlmSharedKeyUsage.usage_today`

### Example

If `daily_limit=1000` and `per_user_daily_limit=100`:
- Maximum 1000 requests total per day across all users
- Each user can make maximum 100 requests per day
- If 10 users each make 100 requests, total is 1000 (both limits reached)

## Security

### API Key Storage

- API keys are encrypted using Fernet (symmetric encryption)
- Stored in vault directory (`/tmp/llm_vault` by default)
- Vault reference format: `vault://secret/shared-{account_name}-key`
- Only last 4 characters shown in API responses

### Encryption Key

Set via environment variable:
```bash
export LLM_VAULT_KEY="your-fernet-key-here"
```

If not set, a key is generated at runtime (not suitable for production).

## Audit Logging

All shared key operations are logged in `LlmAuditLog`:

- Key creation
- Key updates
- Key deletion
- Key usage (when generating content)
- Access grants/revocations

**Audit Log Fields:**
- `user_id`: Who performed the action
- `action`: CREATE, UPDATE, DELETE, GENERATE, etc.
- `resource_type`: "shared_key"
- `shared_key_account_name`: Which key was affected
- `ip_address`, `user_agent`: Request context
- `success`: Whether operation succeeded
- `error_message`: If operation failed

## Migration

The feature includes a database migration (`003_add_shared_keys.py`) that:

1. Creates `llm_shared_keys` table
2. Creates `llm_shared_key_usage` table
3. Adds `use_shared_key` and `shared_key_account_name` columns to `llm_configs`
4. Makes personal key columns nullable in `llm_configs`
5. Adds `shared_key_account_name` column to `llm_audit_logs`

**Run migration:**
```bash
cd backend
alembic upgrade head
```

## Usage Examples

### Example 1: Create a Public Shared Key

```bash
curl -X POST http://localhost:8000/api/v1/llm/shared-keys \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "account_name": "public-perplexity",
    "display_name": "Public Perplexity Key",
    "description": "Available to all users",
    "provider": "perplexity",
    "model": "llama-3.1-sonar-large-128k-online",
    "api_key": "pplx-...",
    "is_public": true,
    "daily_limit": 5000,
    "per_user_daily_limit": 50
  }'
```

### Example 2: Create a Team-Only Shared Key

```bash
curl -X POST http://localhost:8000/api/v1/llm/shared-keys \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "account_name": "team-anthropic",
    "display_name": "Team Anthropic Key",
    "provider": "anthropic",
    "model": "claude-3-opus-20240229",
    "api_key": "sk-ant-...",
    "is_public": false,
    "allowed_user_ids": ["user-1", "user-2", "user-3"],
    "daily_limit": 1000,
    "per_user_daily_limit": 100
  }'
```

### Example 3: User Switches to Shared Key

```bash
curl -X POST http://localhost:8000/api/v1/llm/save \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "use_shared_key": true,
    "shared_key_account_name": "team-anthropic"
  }'
```

## Frontend Integration (TODO)

The frontend needs to be updated to support shared keys:

1. **LLM Settings Page**:
   - Add "Use Shared Key" toggle
   - Add shared key selector dropdown
   - Show shared key details (owner, usage, limits)
   - Add "Manage Shared Keys" button

2. **Shared Keys Management Page**:
   - List all accessible shared keys
   - Create new shared key form
   - Edit shared key (owner only)
   - Delete shared key (owner only)
   - View usage statistics

3. **Types** (`frontend/src/types/llm.ts`):
   - Add `SharedKeyInput` type
   - Add `SharedKeySummary` type
   - Update `LlmConfigInput` to include `use_shared_key` and `shared_key_account_name`
   - Update `LlmConfigSummary` to include shared key fields

4. **Hooks**:
   - Add `useSharedKeys()` hook for managing shared keys
   - Update `useLlmConfig()` to handle shared keys

## Testing

Test the feature with:

```bash
# Create a shared key
curl -X POST http://localhost:8000/api/v1/llm/shared-keys ...

# List shared keys
curl -X GET http://localhost:8000/api/v1/llm/shared-keys \
  -H "Authorization: Bearer $TOKEN"

# Configure user to use shared key
curl -X POST http://localhost:8000/api/v1/llm/save \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"use_shared_key": true, "shared_key_account_name": "team-openai"}'

# Verify configuration
curl -X GET http://localhost:8000/api/v1/llm/me \
  -H "Authorization: Bearer $TOKEN"
```

## Future Enhancements

1. **Cost Tracking**: Track API costs per user/key
2. **Usage Analytics**: Detailed usage reports and dashboards
3. **Key Rotation**: Automated key rotation with zero downtime
4. **Approval Workflow**: Require approval for shared key access
5. **Notifications**: Alert owners when limits are reached
6. **Key Expiration**: Auto-expire keys after a certain date
7. **Budget Limits**: Set monthly budget limits per key

