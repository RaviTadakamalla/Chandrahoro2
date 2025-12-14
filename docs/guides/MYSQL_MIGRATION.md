# ChandraHoro: Supabase/PostgreSQL → MySQL/Prisma Migration Guide

**Status**: Migration Documentation  
**Date**: October 26, 2025  
**Version**: 1.0

---

## 📋 Overview

This guide documents the complete migration from Supabase (PostgreSQL) to MySQL 8.0+ with Prisma ORM and NextAuth.js for authentication.

---

## 🔄 Architecture Changes

### OLD ARCHITECTURE (Supabase/PostgreSQL)
```
Frontend (Next.js)
    ↓
Supabase Auth
    ↓
PostgreSQL Database
    ↓
Row-Level Security (RLS)
```

### NEW ARCHITECTURE (MySQL/Prisma)
```
Frontend (Next.js)
    ↓
NextAuth.js
    ↓
MySQL Database (Prisma ORM)
    ↓
Application-Level Authorization
```

---

## 🔐 Authentication Changes

### OLD: Supabase Auth
```typescript
import { createClient } from '@/lib/supabase/server';
const supabase = createClient();
const { data: { user } } = await supabase.auth.getUser();
```

### NEW: NextAuth.js
```typescript
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

const session = await getServerSession(authOptions);
const user = session?.user;
```

---

## 📊 Database Query Changes

### OLD: Supabase
```typescript
const { data: readings } = await supabase
  .from('readings')
  .select('*')
  .eq('user_id', userId)
  .order('reading_date', { ascending: false })
  .limit(10);
```

### NEW: Prisma
```typescript
const readings = await prisma.reading.findMany({
  where: { userId },
  orderBy: { readingDate: 'desc' },
  take: 10
});
```

---

## 🏗️ Schema Naming Convention

**PostgreSQL (snake_case)** → **MySQL/Prisma (camelCase)**

| Old | New |
|-----|-----|
| user_id | userId |
| birth_date | birthDate |
| birth_time | birthTime |
| reading_type | readingType |
| reading_date | readingDate |
| is_read | isRead |
| is_saved | isSaved |
| created_at | createdAt |
| updated_at | updatedAt |
| full_name | fullName |
| avatar_url | avatarUrl |

---

## 🛡️ Security Model Changes

### OLD: Row-Level Security (RLS)
```sql
ALTER TABLE readings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own readings"
  ON readings FOR SELECT
  USING (auth.uid() = user_id);
```

### NEW: Application-Level Authorization
```typescript
export async function checkResourceOwnership(
  userId: string,
  resourceId: string,
  resourceType: 'reading' | 'chart'
) {
  const resource = await prisma[resourceType].findUnique({
    where: { id: resourceId },
    select: { userId: true }
  });
  
  if (!resource || resource.userId !== userId) {
    throw new Error('Unauthorized');
  }
}
```

---

## 🔧 Environment Variables

### OLD
```env
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxx
SUPABASE_SERVICE_ROLE_KEY=xxx
```

### NEW
```env
DATABASE_URL="mysql://user:password@host:3306/chandrahoro"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="generate-with-openssl-rand-base64-32"
```

---

## 📁 File Structure Changes

### REMOVE
```
src/lib/supabase/
├── client.ts
├── server.ts
├── middleware.ts
└── admin.ts
```

### ADD
```
src/lib/
├── prisma.ts (Prisma client singleton)
├── auth.ts (NextAuth configuration)
└── db/ (optional: query helpers)
    ├── users.ts
    ├── readings.ts
    └── charts.ts
```

---

## 📦 Dependencies

### REMOVE
- @supabase/supabase-js
- @supabase/auth-helpers-nextjs

### ADD
- @prisma/client
- prisma
- next-auth
- @next-auth/prisma-adapter

---

## ✅ Verification Checklist

- [ ] No "Supabase" references remain (except in migration context)
- [ ] No "PostgreSQL" references remain (except in comparison)
- [ ] No "RLS" or "Row-Level Security" references remain
- [ ] All code examples use Prisma syntax
- [ ] All field names use camelCase
- [ ] All auth examples use NextAuth.js
- [ ] Environment variables updated
- [ ] Tech stack lists accurate
- [ ] Deployment instructions reflect MySQL/Prisma

---

## 📚 Related Documentation

- `docs/prd2.1.md` - Product requirements with MySQL/Prisma
- `docs/prd2.md` - Architecture decisions
- `DEPLOYMENT_GUIDE.md` - Deployment with MySQL
- `DATABASE_SETUP_GUIDE.md` - MySQL setup instructions

---

**Last Updated**: October 26, 2025  
**Maintained By**: Development Team

