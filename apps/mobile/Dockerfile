# ==============================================================================
# TRESNO WEB / MOBILE CLIENT - MULTI-STAGE DOCKERFILE FOR VPS
# ==============================================================================

# STAGE 1: Build static web bundle
FROM node:22-alpine AS builder

WORKDIR /app

# Aktifkan pnpm via Corepack
RUN corepack enable && corepack prepare pnpm@latest --activate

# Salin manifest dependensi monorepo
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY packages/shared/package.json ./packages/shared/
COPY apps/mobile/package.json ./apps/mobile/

# Install dependensi
RUN pnpm install --frozen-lockfile

# Salin source code
COPY tsconfig.base.json ./
COPY packages/shared/ ./packages/shared/
COPY apps/mobile/ ./apps/mobile/

# Build shared library dan frontend bundle
RUN pnpm --filter @tresno/shared build
RUN pnpm --filter @tresno/mobile build:web

# STAGE 2: Nginx Web Server (Ultra-lightweight ~20MB)
FROM nginx:alpine AS runner

# Hapus file default bawaan Nginx
RUN rm -rf /usr/share/nginx/html/*

# Salin bundle hasil build dari stage builder
COPY --from=builder /app/apps/mobile/dist /usr/share/nginx/html

# Salin konfigurasi Nginx khusus SPA
COPY apps/mobile/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
