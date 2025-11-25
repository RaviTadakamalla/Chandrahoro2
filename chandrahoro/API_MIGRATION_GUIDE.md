# API Migration Guide: Supabase → MySQL/Prisma

**From**: Supabase REST API + PostgreSQL  
**To**: FastAPI + MySQL with Prisma  
**Version**: 1.0

---

## 📋 Overview

This guide shows how to migrate API endpoints from Supabase to a custom FastAPI backend with MySQL/Prisma.

---

## 🔄 Query Pattern Changes

### AUTHENTICATION

#### OLD: Supabase Auth
```typescript
const { data, error } = await supabase.auth.signUp({
  email: 'user@example.com',
  password: 'password123'
});
```

#### NEW: NextAuth.js + API Route
```typescript
// Frontend
const response = await fetch('/api/auth/signup', {
  method: 'POST',
  body: JSON.stringify({
    email: 'user@example.com',
    password: 'password123',
    name: 'User Name'
  })
});

// Backend API Route (src/app/api/auth/signup/route.ts)
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function POST(request: Request) {
  const { email, password, name } = await request.json();

  const hashedPassword = await bcrypt.hash(password, 12);

  const user = await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      name
    }
  });

  return Response.json({ user });
}
```

---

### READING DATA

#### OLD: Supabase
```typescript
const { data: readings, error } = await supabase
  .from('readings')
  .select('*')
  .eq('user_id', userId)
  .order('reading_date', { ascending: false })
  .limit(10);
```

#### NEW: Prisma + API Route
```typescript
// Frontend
const response = await fetch('/api/readings?limit=10');
const readings = await response.json();

// Backend API Route (src/app/api/readings/route.ts)
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.id) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const url = new URL(request.url);
  const limit = parseInt(url.searchParams.get('limit') || '10');

  const readings = await prisma.reading.findMany({
    where: { userId: session.user.id },
    orderBy: { readingDate: 'desc' },
    take: limit
  });

  return Response.json(readings);
}
```

---

### CREATING DATA

#### OLD: Supabase
```typescript
const { data: reading, error } = await supabase
  .from('readings')
  .insert({
    user_id: userId,
    reading_type: 'daily',
    content: {...},
    reading_date: new Date()
  })
  .select()
  .single();
```

#### NEW: Prisma + API Route
```typescript
// Frontend
const response = await fetch('/api/readings', {
  method: 'POST',
  body: JSON.stringify({
    readingType: 'daily',
    content: {...}
  })
});

// Backend API Route
export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.id) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { readingType, content } = await request.json();

  const reading = await prisma.reading.create({
    data: {
      userId: session.user.id,
      readingType,
      content,
      readingDate: new Date()
    }
  });

  return Response.json(reading);
}
```

---

### UPDATING DATA

#### OLD: Supabase
```typescript
const { data, error } = await supabase
  .from('readings')
  .update({ is_read: true })
  .eq('id', readingId)
  .select()
  .single();
```

#### NEW: Prisma + API Route
```typescript
// Frontend
const response = await fetch(`/api/readings/${readingId}`, {
  method: 'PATCH',
  body: JSON.stringify({ isRead: true })
});

// Backend API Route
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.id) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Verify ownership
  const reading = await prisma.reading.findUnique({
    where: { id: params.id }
  });

  if (!reading || reading.userId !== session.user.id) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const updated = await prisma.reading.update({
    where: { id: params.id },
    data: { isRead: true }
  });

  return Response.json(updated);
}
```

---

### DELETING DATA

#### OLD: Supabase
```typescript
const { error } = await supabase
  .from('readings')
  .delete()
  .eq('id', readingId);
```

#### NEW: Prisma + API Route
```typescript
// Frontend
const response = await fetch(`/api/readings/${readingId}`, {
  method: 'DELETE'
});

// Backend API Route
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.id) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Verify ownership
  const reading = await prisma.reading.findUnique({
    where: { id: params.id }
  });

  if (!reading || reading.userId !== session.user.id) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  await prisma.reading.delete({
    where: { id: params.id }
  });

  return Response.json({ success: true });
}
```

---

## 🔐 Authorization Pattern

All API routes must verify user ownership:

```typescript
// Helper function
async function verifyOwnership(
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

  return resource;
}
```

---

## ✅ Migration Checklist

- [ ] All Supabase queries converted to Prisma
- [ ] All field names changed to camelCase
- [ ] Authorization checks added to all routes
- [ ] Error handling implemented
- [ ] Type safety verified
- [ ] Tests written
- [ ] Documentation updated

---

**Last Updated**: October 26, 2025

