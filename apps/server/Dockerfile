# ==============================================================================
# TRESNO BACKEND SERVER - MULTI-STAGE DOCKERFILE FOR VPS
# ==============================================================================

# STAGE 1: Builder
FROM node:22-alpine AS builder

WORKDIR /app

# Aktifkan pnpm via Corepack bawaan Node
RUN corepack enable && corepack prepare pnpm@latest --activate

# Salin manifest dependensi monorepo
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY packages/shared/package.json ./packages/shared/
COPY apps/server/package.json ./apps/server/

# Install dependensi monorepo
RUN pnpm install --frozen-lockfile

# Salin konfigurasi typescript dan source code
COPY tsconfig.base.json ./
COPY packages/shared/ ./packages/shared/
COPY apps/server/ ./apps/server/

# Build shared library dan Fastify server
RUN pnpm --filter @tresno/shared build && pnpm --filter @tresno/server build

# STAGE 2: Runner (Lightweight Production Container)
FROM node:22-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=4000
ENV HOST=0.0.0.0

# Install curl / wget untuk Docker health check
RUN apk add --no-cache curl wget

# Salin package json & node_modules dari builder
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/packages/shared ./packages/shared
COPY --from=builder /app/apps/server/package.json ./apps/server/package.json
COPY --from=builder /app/apps/server/dist ./apps/server/dist

# Jalankan sebagai non-root user demi keamanan (Least Privilege)
USER node

EXPOSE 4000

# Health check endpoint
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget --spider http://localhost:4000/health || exit 1

CMD ["node", "apps/server/dist/index.js"]
