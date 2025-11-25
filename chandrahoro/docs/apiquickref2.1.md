# ChandraHoro V2 API Quick Reference
**Developer Guide | v2.0**

**Database**: MySQL 8.0+ with Prisma ORM
**Authentication**: NextAuth.js with JWT sessions

---

## Base URLs

- **Production**: `https://api.chandrahoro.com/v2`
- **Staging**: `https://staging-api.chandrahoro.com/v2`
- **Local**: `http://localhost:3000/api`

---

## Authentication

All API requests use NextAuth.js sessions. Authentication is handled via NextAuth.js providers (Credentials, Google, GitHub).

**Frontend Session Usage**:
```typescript
import { useSession } from 'next-auth/react';

const { data: session } = useSession();
if (session?.user?.id) {
  // User is authenticated
}
```

**Server-Side Session**:
```typescript
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

const session = await getServerSession(authOptions);
const userId = session?.user?.id;
```

**Sign In**:
```bash
POST /api/auth/signin
{
  "email": "user@example.com",
  "password": "securepassword123"
}

Response:
{
  "ok": true,
  "status": 200,
  "error": null,
  "url": "/dashboard"
}
```

### NextAuth.js Implementation

**Configuration** (`src/lib/auth.ts`):
```typescript
import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import { PrismaAdapter } from '@next-auth/prisma-adapter';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const user = await prisma.user.findUnique({
          where: { email: credentials.email }
        });

        if (!user || !user.password) return null;

        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.password
        );

        if (!isPasswordValid) return null;

        return {
          id: user.id,
          email: user.email,
          name: user.name
        };
      }
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || ''
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
      }
      return session;
    }
  },
  session: { strategy: 'jwt' },
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error'
  }
};
```

**API Route** (`src/app/api/auth/[...nextauth]/route.ts`):
```typescript
import NextAuth from 'next-auth';
import { authOptions } from '@/lib/auth';

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
```

**Client-Side Usage**:
```typescript
import { useSession, signIn, signOut } from 'next-auth/react';

export function LoginButton() {
  const { data: session } = useSession();

  if (session) {
    return (
      <>
        Signed in as {session.user?.email} <br />
        <button onClick={() => signOut()}>Sign out</button>
      </>
    );
  }

  return <button onClick={() => signIn()}>Sign in</button>;
}
```

---

## Database & ORM

**Database**: MySQL 8.0+
**ORM**: Prisma
**Field Naming**: camelCase (e.g., `userId`, `birthDate`, `readingDate`)

### Common Prisma Queries

**Fetch User Data**:
```typescript
import { prisma } from '@/lib/prisma';

// Get user with all profiles
const user = await prisma.user.findUnique({
  where: { id: userId },
  include: { profiles: true }
});

// Get user's birth charts
const charts = await prisma.birthChart.findMany({
  where: { userId },
  orderBy: { createdAt: 'desc' }
});
```

**Create Reading**:
```typescript
const reading = await prisma.reading.create({
  data: {
    userId,
    readingDate: new Date(),
    readingType: 'daily',
    content: { highlights: [...], segments: [...] }
  }
});
```

**Update Profile**:
```typescript
const updated = await prisma.profile.update({
  where: { id: profileId },
  data: {
    birthTime: '14:30',
    birthLocation: 'New York'
  }
});
```

---

## User-Facing APIs

### 1. Get Daily Reading

**Endpoint**: `GET /ai/reading/daily`

**Query Params**:
- `date` (optional): YYYY-MM-DD (defaults to today)
- `profile_id` (optional): Use specific profile (defaults to primary)

**Example**:
```bash
curl -X GET "https://api.chandrahoro.com/v2/ai/reading/daily?date=2025-10-26" \
  -H "Authorization: Bearer <token>"
```

**Response** (200):
```json
{
  "date": "2025-10-26",
  "profile_id": "abc-123",
  "highlights": [
    "Communication flows smoothly today",
    "Focus on financial planning",
    "Rest early for better energy tomorrow"
  ],
  "segments": [
    {
      "topic": "Work",
      "summary": "Productive day with good teamwork",
      "detail": "Mercury's favorable transit supports clear communication..."
    },
    {
      "topic": "Love",
      "summary": "Harmony in relationships",
      "detail": "Venus in your 7th house brings warmth to partnerships..."
    },
    {
      "topic": "Health",
      "summary": "Good energy levels",
      "detail": "Mars in a strong position boosts vitality..."
    },
    {
      "topic": "Finance",
      "summary": "Plan and save",
      "detail": "Jupiter's aspect on 2nd house favors long-term planning..."
    }
  ],
  "timings": [
    {
      "window": "10:30-12:15",
      "note": "Best time for important meetings or decisions"
    }
  ],
  "disclaimer": "This reading is for entertainment and personal insight only. Do not use for medical, financial, or legal decisions."
}
```

**Response Headers**:
```
X-Tokens-Used: 1523
X-Quota-Remaining: 48477
X-Quota-Resets-At: 2025-10-27T00:00:00+05:30
```

---

### 2. AI Chat

**Endpoint**: `POST /ai/chat`

**Request Body**:
```json
{
  "message": "What does Saturn in 10th house mean for my career?",
  "conversation_id": "conv-xyz-789",  // optional, for history
  "profile_id": "abc-123",  // optional, defaults to primary
  "tone": "practical"  // optional: mystic|practical|playful
}
```

**Example**:
```bash
curl -X POST "https://api.chandrahoro.com/v2/ai/chat" \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "message": "When is a good time to start a business?",
    "conversation_id": "conv-123"
  }'
```

**Response** (200):
```json
{
  "conversation_id": "conv-123",
  "message": "Based on your chart, Saturn in your 10th house suggests that starting a business will require patience and discipline. The best timing would be during Jupiter's transit through your 2nd or 11th house, which brings financial opportunities. Currently, Jupiter is in your 8th house, so waiting 6-8 months would be more favorable.",
  "sources": [
    {
      "type": "chart_data",
      "data": {
        "planet": "Saturn",
        "house": 10,
        "sign": "Capricorn",
        "strength": "strong"
      }
    },
    {
      "type": "transit",
      "data": {
        "planet": "Jupiter",
        "current_house": 8,
        "next_favorable_house": 11,
        "eta_months": 7
      }
    }
  ],
  "tokens_used": 234,
  "model_used": "claude-sonnet-3.5"
}
```

---

### 3. Compatibility Analysis

**Endpoint**: `POST /ai/compatibility`

**Request Body**:
```json
{
  "profile_1_id": "abc-123",
  "profile_2_id": "def-456",
  "type": "lite"  // or "full" (requires Pro plan)
}
```

**Example**:
```bash
curl -X POST "https://api.chandrahoro.com/v2/ai/compatibility" \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "profile_1_id": "abc-123",
    "profile_2_id": "def-456",
    "type": "lite"
  }'
```

**Response** (200):
```json
{
  "profile_1": {
    "id": "abc-123",
    "name": "John",
    "sun_sign": "Aries",
    "moon_sign": "Taurus"
  },
  "profile_2": {
    "id": "def-456",
    "name": "Jane",
    "sun_sign": "Libra",
    "moon_sign": "Cancer"
  },
  "synergy_score": 7.5,
  "strengths": [
    "Complementary sun signs (Aries-Libra) bring balance",
    "Moon in Earth signs suggests emotional stability",
    "Venus aspects indicate mutual attraction and harmony"
  ],
  "watch_outs": [
    "Mars-Saturn conflict may cause occasional friction",
    "Communication styles differ; practice active listening",
    "Different approaches to decision-making; compromise is key"
  ],
  "overall_summary": "This is a promising match with good potential for long-term harmony. The complementary sun signs bring natural balance, though you'll need to work on communication and decision-making styles.",
  "tokens_used": 1876
}
```

---

### 4. View AI Quota

**Endpoint**: `GET /me/ai/entitlements`

**Example**:
```bash
curl -X GET "https://api.chandrahoro.com/v2/me/ai/entitlements" \
  -H "Authorization: Bearer <token>"
```

**Response** (200):
```json
{
  "enabled": true,
  "plan": "basic",
  "limits": {
    "requests_per_day": 50,
    "tokens_per_day": 150000,
    "allowed_models": ["gpt-4-mini", "claude-haiku", "gemini-flash"],
    "allowed_endpoints": ["reading.daily", "chat", "compat.lite"]
  },
  "usage_today": {
    "requests_used": 12,
    "tokens_used": 34567,
    "requests_remaining": 38,
    "tokens_remaining": 115433
  },
  "resets_at": "2025-10-27T00:00:00+05:30",
  "cap_mode": "soft"
}
```

---

### 5. Configure LLM Profile (BYOK)

**Endpoint**: `POST /me/llm-profile`

**Request Body**:
```json
{
  "mode": "user-key",
  "provider": "anthropic",
  "model": "claude-sonnet-3.5",
  "api_key": "sk-ant-api03-...",  // your own API key
  "params": {
    "temperature": 0.8,
    "max_tokens": 1500,
    "system_preset": "mystic"
  },
  "safety": {
    "preset": "strict",
    "blocked_topics": ["medical", "financial", "legal"]
  }
}
```

**Example**:
```bash
curl -X POST "https://api.chandrahoro.com/v2/me/llm-profile" \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "mode": "user-key",
    "provider": "openai",
    "model": "gpt-4",
    "api_key": "sk-proj-..."
  }'
```

**Response** (200):
```json
{
  "id": "profile-789",
  "mode": "user-key",
  "provider": "openai",
  "model": "gpt-4",
  "key_last_4": "x7K9",
  "message": "Your API key has been securely stored. All future AI requests will use your key."
}
```

---

## Admin APIs

### 1. Admin Login (OTP)

**Endpoint**: `POST /admin/auth/login-otp`

**Request Body**:
```json
{
  "email": "admin@chandrahoro.com"
}
```

**Response** (200):
```json
{
  "message": "OTP sent to admin@chandrahoro.com",
  "expires_in": 600
}
```

---

### 2. Verify OTP

**Endpoint**: `POST /admin/auth/verify-otp`

**Request Body**:
```json
{
  "email": "admin@chandrahoro.com",
  "otp": "123456"
}
```

**Response** (200):
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "expires_in": 86400,
  "user": {
    "id": "admin-123",
    "email": "admin@chandrahoro.com",
    "role": "admin",
    "full_name": "Admin User"
  }
}
```

---

### 3. Set User Entitlements

**Endpoint**: `POST /admin/users/{user_id}/ai/entitlements`

**Request Body**:
```json
{
  "enabled": true,
  "limits": {
    "requests_per_day": 100,
    "tokens_per_day": 200000,
    "allowed_models": ["gpt-4", "claude-sonnet-3.5"],
    "allowed_endpoints": ["reading.daily", "chat", "compat.lite", "compat.full"]
  },
  "starts_at": "2025-10-26T00:00:00+05:30",
  "ends_at": null,
  "cap_mode": "soft",
  "metadata": {
    "plan": "pro",
    "notes": "Upgraded to Pro plan - paid annually"
  }
}
```

**Example**:
```bash
curl -X POST "https://api.chandrahoro.com/v2/admin/users/abc-123/ai/entitlements" \
  -H "Authorization: Bearer <admin_token>" \
  -H "Content-Type: application/json" \
  -d '{ ... }'
```

**Response** (200):
```json
{
  "id": "ent-789",
  "user_id": "abc-123",
  "enabled": true,
  "limits": { ... },
  "created_at": "2025-10-26T10:30:00+05:30",
  "updated_at": "2025-10-26T10:30:00+05:30",
  "message": "Entitlements updated successfully"
}
```

---

### 4. View User Entitlements

**Endpoint**: `GET /admin/users/{user_id}/ai/entitlements`

**Response** (200):
```json
{
  "id": "ent-789",
  "user_id": "abc-123",
  "enabled": true,
  "limits": {
    "requests_per_day": 100,
    "tokens_per_day": 200000,
    "allowed_models": ["gpt-4", "claude-sonnet-3.5"],
    "allowed_endpoints": ["reading.daily", "chat", "compat.lite", "compat.full"]
  },
  "usage_today": {
    "requests_used": 37,
    "tokens_used": 94567,
    "requests_remaining": 63,
    "tokens_remaining": 105433
  },
  "cap_mode": "soft",
  "starts_at": "2025-10-26T00:00:00+05:30",
  "ends_at": null
}
```

---

### 5. Reset User Quota

**Endpoint**: `POST /admin/users/{user_id}/ai/reset-quota`

**Request Body**:
```json
{
  "reason": "User reported error; resetting quota as courtesy"
}
```

**Response** (200):
```json
{
  "message": "Quota reset successful",
  "user_id": "abc-123",
  "new_quota": {
    "requests_used": 0,
    "tokens_used": 0
  }
}
```

---

### 6. View Audit Logs

**Endpoint**: `GET /admin/audit-logs`

**Query Params**:
- `actor_id` (optional): Filter by admin user
- `target_user_id` (optional): Filter by target user
- `action` (optional): Filter by action type
- `from_date` (optional): Start date (YYYY-MM-DD)
- `to_date` (optional): End date (YYYY-MM-DD)
- `page` (optional): Page number (default: 1)
- `per_page` (optional): Results per page (default: 50, max: 100)

**Example**:
```bash
curl -X GET "https://api.chandrahoro.com/v2/admin/audit-logs?action=ENTITLEMENT_UPDATE&from_date=2025-10-01" \
  -H "Authorization: Bearer <admin_token>"
```

**Response** (200):
```json
{
  "total": 245,
  "page": 1,
  "per_page": 50,
  "logs": [
    {
      "id": "log-123",
      "actor_id": "admin-456",
      "actor_role": "admin",
      "actor_email": "admin@chandrahoro.com",
      "action": "ENTITLEMENT_UPDATE",
      "target_user_id": "abc-123",
      "target_user_email": "user@example.com",
      "resource_type": "entitlement",
      "resource_id": "ent-789",
      "diff": {
        "before": {
          "requests_per_day": 10
        },
        "after": {
          "requests_per_day": 100
        }
      },
      "ip_address": "203.0.113.45",
      "created_at": "2025-10-26T10:30:00+05:30"
    }
  ]
}
```

---

## Error Responses

### Standard Error Format

```json
{
  "error": "ERROR_CODE",
  "message": "Human-readable error message",
  "details": {
    "field": "Additional context"
  },
  "timestamp": "2025-10-26T10:30:00+05:30",
  "request_id": "req-abc-123"
}
```

### Common Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `UNAUTHORIZED` | 401 | Invalid or expired JWT token |
| `FORBIDDEN` | 403 | User lacks permission |
| `AI_DISABLED` | 403 | AI features not enabled for user |
| `MODEL_NOT_ALLOWED` | 403 | Requested model not in entitlement |
| `AI_LIMIT_EXCEEDED` | 429 | Daily quota exhausted (hard cap) |
| `RATE_LIMITED` | 429 | Too many requests (IP-based) |
| `INVALID_INPUT` | 400 | Malformed request body |
| `NOT_FOUND` | 404 | Resource not found |
| `SERVER_ERROR` | 500 | Internal server error |
| `SERVICE_UNAVAILABLE` | 503 | LLM provider down or overloaded |

### Example Error Responses

**429 - Quota Exceeded**:
```json
{
  "error": "AI_LIMIT_EXCEEDED",
  "message": "Daily AI request limit reached. Resets at midnight IST.",
  "limits": {
    "requests_per_day": 10,
    "used_today": 10,
    "resets_at": "2025-10-27T00:00:00+05:30"
  },
  "upgrade_url": "https://chandrahoro.com/upgrade",
  "timestamp": "2025-10-26T23:45:00+05:30"
}
```

**403 - Model Not Allowed**:
```json
{
  "error": "MODEL_NOT_ALLOWED",
  "message": "GPT-4 is not available on your current plan.",
  "allowed_models": ["gpt-4-mini", "claude-haiku", "gemini-flash"],
  "requested_model": "gpt-4",
  "upgrade_url": "https://chandrahoro.com/upgrade"
}
```

---

## Rate Limits

### Public APIs (Authenticated Users)

| Endpoint | Rate Limit | Window |
|----------|------------|--------|
| `/ai/reading/daily` | Per AI quota | 24 hours |
| `/ai/chat` | Per AI quota | 24 hours |
| `/ai/compatibility` | Per AI quota | 24 hours |
| `/me/*` | 100 requests | 1 minute |

### Admin APIs

| Endpoint | Rate Limit | Window |
|----------|------------|--------|
| `/admin/auth/login-otp` | 3 attempts | 10 minutes |
| `/admin/auth/verify-otp` | 3 attempts | 10 minutes |
| `/admin/*` (other) | 1000 requests | 1 minute |

---

## Webhooks (Coming in V2.1)

Subscribe to events:
- `daily_reading.generated`
- `quota.warning` (80% used)
- `quota.exceeded`
- `ai_chat.message`
- `entitlement.updated`

**Webhook Format**:
```json
{
  "event": "daily_reading.generated",
  "timestamp": "2025-10-26T06:00:00+05:30",
  "data": {
    "user_id": "abc-123",
    "reading_id": "reading-xyz",
    "date": "2025-10-26"
  }
}
```

---

## SDK Support

### Python
```python
from chandrahoro import ChandraHoroClient

client = ChandraHoroClient(api_key="your-jwt-token")

# Get daily reading
reading = client.get_daily_reading(date="2025-10-26")
print(reading.highlights)

# AI chat
response = client.chat("What does Saturn in 10th house mean?")
print(response.message)
```

### JavaScript/TypeScript
```typescript
import { ChandraHoroClient } from 'chandrahoro-js';

const client = new ChandraHoroClient({ apiKey: 'your-jwt-token' });

// Get daily reading
const reading = await client.getDailyReading({ date: '2025-10-26' });
console.log(reading.highlights);

// AI chat
const response = await client.chat({ message: 'When should I start a business?' });
console.log(response.message);
```

---

## Testing

### Sandbox Environment

**Base URL**: `https://sandbox-api.chandrahoro.com/v2`

**Test Credentials**:
```
Email: test@chandrahoro.com
Password: Test123!@#
```

**Test Cards** (for payment testing in V2.1):
```
Success: 4242 4242 4242 4242
Decline: 4000 0000 0000 0002
```

---

## Support

- **Documentation**: https://docs.chandrahoro.com
- **API Status**: https://status.chandrahoro.com
- **Email**: dev-support@chandrahoro.com
- **Slack**: #api-support (for partners)

---

**Last Updated**: October 25, 2025  
**API Version**: v2.0  
**Changelog**: https://docs.chandrahoro.com/changelog