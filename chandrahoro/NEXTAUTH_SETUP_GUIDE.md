# NextAuth.js Setup Guide for ChandraHoro

**Framework**: Next.js 14 with App Router  
**Authentication**: NextAuth.js v4  
**Database**: MySQL 8.0+ with Prisma ORM  
**Version**: 1.0

---

## 📋 Overview

NextAuth.js provides flexible authentication with support for multiple providers, JWT-based sessions, and seamless Next.js integration.

---

## 🚀 Installation

```bash
npm install next-auth @next-auth/prisma-adapter
npm install bcryptjs
```

---

## 🔧 Configuration

### 1. Create Prisma Schema

```prisma
// prisma/schema.prisma

model User {
  id            String    @id @default(cuid())
  name          String?
  email         String?   @unique
  emailVerified DateTime?
  password      String?   // For credentials provider
  image         String?
  accounts      Account[]
  sessions      Session[]
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
}

model Account {
  id                 String  @id @default(cuid())
  userId             String
  type               String
  provider           String
  providerAccountId  String
  refresh_token      String?  @db.Text
  access_token       String?  @db.Text
  expires_at         Int?
  token_type         String?
  scope              String?
  id_token           String?  @db.Text
  session_state      String?

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([provider, providerAccountId])
}

model Session {
  id           String   @id @default(cuid())
  sessionToken String   @unique
  userId       String
  expires      DateTime
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model VerificationToken {
  identifier String
  token      String   @unique
  expires    DateTime

  @@unique([identifier, token])
}
```

### 2. Create Auth Configuration

```typescript
// src/lib/auth.ts

import { type NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import GitHubProvider from 'next-auth/providers/github';
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
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Invalid credentials');
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email }
        });

        if (!user || !user.password) {
          throw new Error('Invalid credentials');
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.password
        );

        if (!isPasswordValid) {
          throw new Error('Invalid credentials');
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image
        };
      }
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || ''
    }),
    GitHubProvider({
      clientId: process.env.GITHUB_ID || '',
      clientSecret: process.env.GITHUB_SECRET || ''
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
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error'
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60 // 30 days
  },
  jwt: {
    secret: process.env.NEXTAUTH_SECRET
  }
};
```

### 3. Create API Route

```typescript
// src/app/api/auth/[...nextauth]/route.ts

import NextAuth from 'next-auth';
import { authOptions } from '@/lib/auth';

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
```

---

## 🔑 Environment Variables

```env
# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="generate-with: openssl rand -base64 32"

# OAuth Providers
GOOGLE_CLIENT_ID="xxx"
GOOGLE_CLIENT_SECRET="xxx"
GITHUB_ID="xxx"
GITHUB_SECRET="xxx"

# Database
DATABASE_URL="mysql://user:password@host:3306/chandrahoro"
```

---

## 💻 Usage in Components

### Server-Side
```typescript
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

export default async function Page() {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    redirect('/auth/signin');
  }

  return <div>Welcome, {session.user?.name}</div>;
}
```

### Client-Side
```typescript
'use client';

import { useSession, signIn, signOut } from 'next-auth/react';

export default function Component() {
  const { data: session } = useSession();

  if (!session) {
    return <button onClick={() => signIn()}>Sign In</button>;
  }

  return (
    <div>
      <p>Welcome, {session.user?.name}</p>
      <button onClick={() => signOut()}>Sign Out</button>
    </div>
  );
}
```

---

## 🔐 Authorization Middleware

```typescript
// src/middleware.ts

import { withAuth } from 'next-auth/middleware';

export const middleware = withAuth({
  callbacks: {
    authorized: ({ token }) => !!token
  }
});

export const config = {
  matcher: ['/dashboard/:path*', '/profile/:path*']
};
```

---

## ✅ Verification Checklist

- [ ] Prisma schema includes User, Account, Session models
- [ ] NextAuth configuration created
- [ ] API route handler created
- [ ] Environment variables set
- [ ] OAuth providers configured
- [ ] Database migrations applied
- [ ] Middleware configured
- [ ] Sign-in page created
- [ ] Session working in components

---

**Last Updated**: October 26, 2025

