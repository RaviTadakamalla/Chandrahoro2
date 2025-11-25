# Prisma ORM Setup Guide for ChandraHoro

**Database**: MySQL 8.0+  
**ORM**: Prisma  
**Version**: 1.0

---

## 📋 Overview

Prisma is a next-generation ORM that provides type-safe database access with automatic migrations and a powerful query API.

---

## 🚀 Installation

```bash
npm install @prisma/client
npm install -D prisma
npx prisma init
```

---

## 🔧 Configuration

### 1. Environment Variables

```env
# .env.local
DATABASE_URL="mysql://user:password@localhost:3306/chandrahoro"
```

### 2. Prisma Schema

```prisma
// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "mysql"
  url      = env("DATABASE_URL")
}

model User {
  id        String   @id @default(cuid())
  email     String   @unique
  name      String?
  password  String?
  image     String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  birthCharts BirthChart[]
  readings    Reading[]
}

model BirthChart {
  id        String   @id @default(cuid())
  userId    String
  name      String
  birthDate DateTime
  birthTime String?
  latitude  Decimal  @db.Decimal(10, 8)
  longitude Decimal  @db.Decimal(10, 8)
  timezone  String
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  user      User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  readings  Reading[]

  @@index([userId])
}

model Reading {
  id          String   @id @default(cuid())
  userId      String
  chartId     String
  readingType String   // 'daily', 'transit', 'dasha'
  content     Json     // Store complex data as JSON
  isRead      Boolean  @default(false)
  isSaved     Boolean  @default(false)
  readingDate DateTime
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  user      User       @relation(fields: [userId], references: [id], onDelete: Cascade)
  chart     BirthChart @relation(fields: [chartId], references: [id], onDelete: Cascade)

  @@index([userId])
  @@index([chartId])
  @@index([readingDate])
}
```

---

## 📊 Common Queries

### CREATE
```typescript
const user = await prisma.user.create({
  data: {
    email: 'user@example.com',
    name: 'John Doe',
    password: hashedPassword
  }
});
```

### READ
```typescript
// Find one
const user = await prisma.user.findUnique({
  where: { email: 'user@example.com' }
});

// Find many
const readings = await prisma.reading.findMany({
  where: { userId },
  orderBy: { readingDate: 'desc' },
  take: 10
});

// With relations
const chart = await prisma.birthChart.findUnique({
  where: { id: chartId },
  include: {
    user: true,
    readings: { take: 5 }
  }
});
```

### UPDATE
```typescript
await prisma.reading.update({
  where: { id: readingId },
  data: { isRead: true }
});
```

### DELETE
```typescript
await prisma.reading.delete({
  where: { id: readingId }
});
```

---

## 🔄 Migrations

### Create Migration
```bash
npx prisma migrate dev --name add_readings_table
```

### Apply Migration
```bash
npx prisma migrate deploy
```

### Reset Database
```bash
npx prisma migrate reset
```

---

## 🛡️ Type Safety

```typescript
import { Prisma } from '@prisma/client';

// Type-safe query results
type UserWithCharts = Prisma.UserGetPayload<{
  include: { birthCharts: true }
}>;

const user: UserWithCharts = await prisma.user.findUnique({
  where: { id: userId },
  include: { birthCharts: true }
});
```

---

## 🔐 Authorization Pattern

```typescript
// Always filter by userId for security
export async function getUserReading(
  userId: string,
  readingId: string
) {
  const reading = await prisma.reading.findUnique({
    where: { id: readingId }
  });

  if (!reading || reading.userId !== userId) {
    throw new Error('Unauthorized');
  }

  return reading;
}
```

---

## 📈 Performance Tips

### 1. Use Select for Specific Fields
```typescript
const readings = await prisma.reading.findMany({
  where: { userId },
  select: {
    id: true,
    readingType: true,
    readingDate: true
  }
});
```

### 2. Batch Operations
```typescript
const results = await prisma.$transaction([
  prisma.reading.create({ data: {...} }),
  prisma.reading.create({ data: {...} })
]);
```

### 3. Pagination
```typescript
const page = 1;
const pageSize = 10;

const readings = await prisma.reading.findMany({
  where: { userId },
  skip: (page - 1) * pageSize,
  take: pageSize
});
```

---

## 🧪 Testing

```typescript
// Use test database
process.env.DATABASE_URL = 'mysql://test:test@localhost:3306/chandrahoro_test';

beforeAll(async () => {
  await prisma.$connect();
});

afterAll(async () => {
  await prisma.$disconnect();
});

test('creates user', async () => {
  const user = await prisma.user.create({
    data: { email: 'test@example.com' }
  });
  expect(user.email).toBe('test@example.com');
});
```

---

## ✅ Verification Checklist

- [ ] Prisma installed
- [ ] Schema defined
- [ ] DATABASE_URL configured
- [ ] Migrations created
- [ ] Prisma client generated
- [ ] Queries tested
- [ ] Type safety verified
- [ ] Authorization patterns implemented

---

**Last Updated**: October 26, 2025

