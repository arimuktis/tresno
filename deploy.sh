#!/usr/bin/env bash

# ==============================================================================
# TRESNO - 1-CLICK PRODUCTION DEPLOYMENT SCRIPT FOR VPS
# ==============================================================================

set -e

echo ""
echo "🚀 ========================================================="
echo "🚀 MEMULAI DEPLOYMENT TRESNO DI SERVER VPS (DOCKER COMPOSE)"
echo "🚀 ========================================================="
echo ""

# 1. Periksa ketersediaan Docker
if ! command -v docker &> /dev/null; then
    echo "❌ Error: Docker belum terinstall di VPS ini."
    echo "👉 Silakan install Docker: curl -fsSL https://get.docker.com | sh"
    exit 1
fi

# 2. Periksa ketersediaan Docker Compose
if ! docker compose version &> /dev/null; then
    echo "❌ Error: Docker Compose plugin belum terinstall."
    exit 1
fi

# 3. Pastikan file konfigurasi .env.production tersedia
if [ ! -f "apps/server/.env.production" ]; then
    echo "⚠️ File apps/server/.env.production belum ada."
    echo "📄 Menyalin template dari apps/server/.env.example..."
    cp apps/server/.env.example apps/server/.env.production
    echo "👉 Silakan edit apps/server/.env.production dengan kredensial live Anda jika diperlukan."
fi

echo "📦 1/3 Membangun container Docker (Server, Web, Redis, Gateway)..."
docker compose build

echo "🚀 2/3 Menjalankan seluruh container di background..."
docker compose up -d

echo ""
echo "🔍 3/3 Memeriksa status kesehatan container..."
sleep 3
docker compose ps

echo ""
echo "✅ ========================================================="
echo "✅ TRESNO BERHASIL BERJALAN DI VPS ANDA!"
echo "✅ ========================================================="
echo "🌐 Web App Client      : http://<IP_VPS_ANDA>"
echo "📡 WebSocket Signaling : ws://<IP_VPS_ANDA>/ws"
echo "🛠️ REST API Health     : http://<IP_VPS_ANDA>/health"
echo "📊 Monitoring Log      : docker compose logs -f"
echo "========================================================="
echo ""
