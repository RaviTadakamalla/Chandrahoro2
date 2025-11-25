# ChandraHoro Frontend - Multi-stage Docker Build
# Stage 1: Build
FROM node:18-alpine AS builder

WORKDIR /app

# Install OpenSSL for Prisma
RUN apk add --no-cache openssl libc6-compat

# Build arguments for environment variables
ARG NEXT_PUBLIC_API_URL=http://localhost:8000
ARG NEXT_PUBLIC_APP_URL=http://localhost:3000

# Set environment variables for build
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_APP_URL=$NEXT_PUBLIC_APP_URL

# Copy package files
COPY package*.json ./
COPY prisma ./prisma/

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build Next.js application
RUN npm run build

# Stage 2: Runtime
FROM node:18-alpine

# Install OpenSSL for Prisma runtime
RUN apk add --no-cache openssl libc6-compat

WORKDIR /app

# Install dumb-init for proper signal handling
RUN apk add --no-cache dumb-init

# Copy package files
COPY package*.json ./
COPY prisma ./prisma/

# Install production dependencies only (skip prepare scripts like husky)
RUN npm ci --only=production --ignore-scripts && \
    npx prisma generate && \
    npm cache clean --force

# Copy built application from builder
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nextjs -u 1001

USER nextjs

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD node -e "require('http').get('http://localhost:3000', (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)})"

# Use dumb-init to handle signals properly
ENTRYPOINT ["dumb-init", "--"]

# Start Next.js application
CMD ["npm", "start"]
