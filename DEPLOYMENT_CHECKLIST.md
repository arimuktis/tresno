# 📋 Production Deployment Checklist - Tresno

Panduan checklist langkah demi langkah ini digunakan untuk memastikan kesiapan, keamanan, dan keandalan sistem aplikasi **Tresno** (`app.tresno.id`) sebelum, saat, dan sesudah deployment ke server VPS produksi.

---

## 📑 Daftar Isi
1. [Fase 1: Persiapan Domain & DNS](#1-fase-persiapan-domain--dns)
2. [Fase 2: Layanan Pihak Ketiga (Agora, Supabase, Midtrans)](#2-fase-layanan-pihak-ketiga)
3. [Fase 3: Konfigurasi Server VPS & Keamanan OS](#3-fase-konfigurasi-server-vps--keamanan-os)
4. [Fase 4: Audit File Lingkungan (.env) & Secrets](#4-fase-audit-file-lingkungan-env--secrets)
5. [Fase 5: Eksekusi Deployment Docker Compose](#5-fase-eksekusi-deployment-docker-compose)
6. [Fase 6: Smoke Testing & Uji Fungsional Langsung](#6-fase-smoke-testing--uji-fungsional-langsung)
7. [Fase 7: Monitoring, Backup & Prosedur Rollback](#7-fase-monitoring-backup--prosedur-rollback)

---

## 1. Fase Persiapan Domain & DNS

- [ ] **Domain Terdaftar**: Domain utama `tresno.id` atau subdomain `app.tresno.id` sudah aktif.
- [ ] **DNS A-Record**: Arahkan `app.tresno.id` ke **IP Publik VPS** Anda.
  ```text
  Type: A
  Name: app (atau @)
  Content: <IP_PUBLIK_VPS>
  TTL: Auto
  Proxy Status: Proxied (Jika menggunakan Cloudflare)
  ```
- [ ] **Konfigurasi Cloudflare SSL/TLS**:
  - [ ] SSL/TLS Encryption Mode: disetel ke **Full** (atau *Flexible*).
  - [ ] **Always Use HTTPS**: Aktif.
  - [ ] **WebSockets**: Wajib **Aktif** di menu *Network* Cloudflare (agar `wss://app.tresno.id/ws` berjalan tanpa terputus).
  - [ ] Max Upload Size: Pastikan mendukung hingga 50 MB untuk upload video story.

---

## 2. Fase Layanan Pihak Ketiga

### A. Agora RTC (Video Call 1-on-1 Realtime)
- [ ] Buka [console.agora.io](https://console.agora.io/) dan buat project baru.
- [ ] Pilih autentikasi: **App ID + App Certificate** (Token-based authentication).
- [ ] Salin kredensial:
  - `AGORA_APP_ID`
  - `AGORA_APP_CERTIFICATE`

### B. Supabase Cloud (Autentikasi & Penyimpanan Story 24 Jam)
- [ ] Buat project baru di [supabase.com](https://supabase.com/).
- [ ] Buat storage bucket publik bernama **`tresno-stories`**:
  - Bucket Name: `tresno-stories`
  - Public Bucket: **YES**
  - File Size Limit: **50 MB**
  - Allowed MIME types: `image/*`, `video/*`
- [ ] Salin kredensial API dari *Project Settings -> API*:
  - `SUPABASE_URL`
  - `SUPABASE_ANON_KEY` (untuk client mobile/web)
  - `SUPABASE_SERVICE_ROLE_KEY` (rahasia, hanya untuk backend server)

### C. Midtrans Payment Gateway (QRIS & Top-up Koin)
- [ ] Login ke [dashboard.midtrans.com](https://dashboard.midtrans.com/) (Mode Production).
- [ ] Pastikan channel pembayaran **QRIS** (GoPay, OVO, DANA, ShopeePay, BCA) telah disetujui.
- [ ] Salin Server Key & Client Key Production:
  - `MIDTRANS_SERVER_KEY`
  - `MIDTRANS_CLIENT_KEY`
  - `MIDTRANS_IS_PRODUCTION=true`

---

## 3. Fase Konfigurasi Server VPS & Keamanan OS

- [ ] **Spesifikasi Server**: Minimal 1 vCPU, 2 GB RAM (atau 1 GB RAM + 2 GB Swap).
- [ ] **Sistem Operasi**: Ubuntu 22.04 LTS / 24.04 LTS (disarankan).
- [ ] **Update Paket OS**:
  ```bash
  sudo apt update && sudo apt upgrade -y
  ```
- [ ] **Buat Swap Memory 2GB** (Mencegah out-of-memory saat build kontainer):
  ```bash
  sudo fallocate -l 2G /swapfile
  sudo chmod 600 /swapfile
  sudo mkswap /swapfile
  sudo swapon /swapfile
  echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
  ```
- [ ] **Firewall UFW**: Hanya buka port publik yang diperlukan (Port backend & Redis tetap tertutup di dalam Docker Bridge):
  ```bash
  sudo ufw default deny incoming
  sudo ufw default allow outgoing
  sudo ufw allow 22/tcp    # SSH
  sudo ufw allow 80/tcp    # HTTP (Gateway Nginx)
  sudo ufw allow 443/tcp   # HTTPS (Gateway Nginx)
  sudo ufw enable
  ```
- [ ] **Install Docker & Docker Compose Plugin**:
  ```bash
  curl -fsSL https://get.docker.com | sh
  sudo usermod -aG docker $USER
  # Login ulang SSH atau jalankan: newgrp docker
  docker --version && docker compose version
  ```

---

## 4. Fase Audit File Lingkungan (.env) & Secrets

- [ ] **Clone Codebase ke VPS**:
  ```bash
  sudo mkdir -p /var/www/tresno
  sudo chown -R $USER:$USER /var/www/tresno
  git clone https://github.com/username/tresno.git /var/www/tresno
  cd /var/www/tresno
  ```
- [ ] **Verifikasi `.gitignore`**:
  - Pastikan `.env*`, private keys, keystore, dan dump log tidak ada yang ter-commit ke Git.
- [ ] **Konfigurasi Server Production (`apps/server/.env.production`)**:
  ```bash
  nano apps/server/.env.production
  ```
  Isi dengan data live:
  ```env
  NODE_ENV=production
  PORT=4000
  HOST=0.0.0.0
  CORS_ORIGIN=https://app.tresno.id,https://tresno.id

  AGORA_APP_ID=isi_dengan_app_id_agora_live
  AGORA_APP_CERTIFICATE=isi_dengan_certificate_agora_live

  REDIS_URL=redis://:tresno_secret_redis_pass@redis:6379

  SUPABASE_URL=https://xxxx.supabase.co
  SUPABASE_SERVICE_ROLE_KEY=isi_dengan_service_role_secret
  STORY_BUCKET=tresno-stories

  MIDTRANS_SERVER_KEY=Mid-server-xxxx
  MIDTRANS_CLIENT_KEY=Mid-client-xxxx
  MIDTRANS_IS_PRODUCTION=true
  ```
- [ ] **Konfigurasi Client Production (`apps/mobile/.env.production`)**:
  ```bash
  nano apps/mobile/.env.production
  ```
  Isi dengan URL domain resmi:
  ```env
  VITE_APP_ENV=production
  VITE_API_URL=https://app.tresno.id/api
  VITE_WS_URL=wss://app.tresno.id/ws
  VITE_SUPABASE_URL=https://xxxx.supabase.co
  VITE_SUPABASE_ANON_KEY=isi_dengan_anon_key_public
  VITE_AGORA_APP_ID=isi_dengan_app_id_agora_live
  ```

---

## 5. Fase Eksekusi Deployment Docker Compose

- [ ] **Beri Hak Akses Eksekusi `deploy.sh`**:
  ```bash
  chmod +x deploy.sh
  ```
- [ ] **Jalankan Deployment 1-Click**:
  ```bash
  ./deploy.sh
  ```
  *Atau jalankan secara manual:*
  ```bash
  docker compose up -d --build
  ```
- [ ] **Cek Kesehatan 4 Kontainer**:
  ```bash
  docker compose ps
  ```
  Pastikan seluruh kontainer berstatus `Up` / `healthy`:
  - `tresno-gateway` (Nginx port 80/443)
  - `tresno-server` (Fastify + WebSocket port 4000)
  - `tresno-web` (React Native Web SPA)
  - `tresno-redis` (Redis 7 dengan password auth)

---

## 6. Fase Smoke Testing & Uji Fungsional Langsung

Lakukan verifikasi fitur di browser laptop dan smartphone:

### A. Jaringan & Keamanan
- [ ] Buka `https://app.tresno.id/health` di browser:
  - Respon wajib HTTP 200 dengan status `ok`.
- [ ] Cek Sertifikat SSL (Gembok hijau aman, tidak ada peringatan *Mixed Content*).
- [ ] Cek WebSocket handshake:
  - Buka inspect console browser, periksa koneksi WebSocket `wss://app.tresno.id/ws` berstatus `Connected 101 Switching Protocols`.

### B. Otentikasi & Onboarding
- [ ] Coba **Login Tamu (Guest)** atau **Login Nomor HP (OTP)**.
- [ ] Selesaikan proses onboarding profil:
  - Pilih role (Pria / Host Anchor Wanita).
  - Pilih avatar preset dan isi nama kota.
- [ ] **Verifikasi Fallback Default**:
  - Setelah login/onboarding berhasil, aplikasi **wajib langsung mendarat di Tab Matchmaking (Radar Heart)**, bukan tab lain.

### C. Fitur Matchmaking & Algoritma Anti-Sepi
- [ ] Tekan tombol **"Mulai Matchmaking"**:
  - Muncul animasi radar berputar.
  - Sesi gratis 20 detik matchmaking aktif.
  - Algoritma bobot dinamis server (`hostTrafficEngine`) memilih host berdasarkan skor keadilan (Idle Time + Incubator Member Baru).
- [ ] Tes Tombol **"Batal"**:
  - Pembatalan pencarian mengembalikan kupon/koin secara utuh.
- [ ] Tes Selesai Panggilan:
  - Saat panggilan berakhir, layar langsung kembali (*fallback*) ke layar matchmaking tanpa ada dialog blocking penutup.

### D. Monetisasi Khusus Pria (Gentleman VIP Starter Pack)
- [ ] Saat user pria pertama kali mendarat di MatchTab:
  - Banner emas **"Paket Perdana Gentleman VIP • Diskon 80% Rp 9.900"** muncul di bawah header.
- [ ] Buka banner penawaran:
  - Modal terbuka dengan countdown timer 10:00 menit.
  - Terdapat 5 rincian value: 120 Koin, 5 Kupon Match, 100% Filter Wanita Asli, Radar Prioritas 2 Detik, dan Badge Mahkota VIP.
- [ ] Tes Pembayaran QRIS Instan:
  - Tombol bayar menampilkan simulasi QRIS (BCA, GoPay, DANA, ShopeePay, OVO).
  - Pembayaran berhasil langsung menambahkan 120 koin + 5 kupon ke saldo dompet, membunyikan suara reward, dan menutup modal.

### E. Destiny (Discovery Tab) & Visibilitas Host
- [ ] Buka tab **Destiny**:
  - Kartu host tersusun menggunakan algoritma *Multi-Bucket Interleaving* (Anchor Populer berselingan dengan Bintang Baru dan Host Menunggu).
  - Muncul badge `Bintang Baru`, `Respon Kilat`, atau `Baru Online`.
- [ ] Coba tombol **"Acak Rotasi"**:
  - Urutan host bergeser secara adil agar tidak ada host yang merasa sepi.
- [ ] Jika login sebagai Host Anchor Wanita:
  - Muncul kartu emas **"STATUS RADAR: PRIORITAS TINGGI (Antrean #1)"** di tab Destiny dan tab Profil (Mine).

### F. Notifikasi & Audio Synthesizer
- [ ] Kirim pesan chat:
  - Notifikasi push in-app muncul di bagian atas layar.
  - Suara *glass ping chime* berbunyi jernih tanpa error aset mp3 eksternal.
- [ ] Buka Pengaturan di tab Mine:
  - Pengaturan suara dapat diaktifkan/dinonaktifkan (*Mute/Unmute*).

---

## 7. Fase Monitoring, Backup & Prosedur Rollback

### A. Monitoring Log
```bash
# Pantau seluruh log live
docker compose logs -f

# Pantau log backend Fastify & signaling saja
docker compose logs -f --tail=100 server

# Pantau log gateway Nginx
docker compose logs -f --tail=100 gateway
```

### B. Prosedur Backup Database & Cache
- Data Redis tersimpan secara persisten di Docker volume `redis-data` (`/data/dump.rdb` dan `/data/appendonly.aof`).
- Backup manual file Redis:
  ```bash
  docker compose exec redis redis-cli -a tresno_secret_redis_pass bgsave
  sudo cp -r /var/lib/docker/volumes/tresno_redis-data/_data /var/backups/redis-$(date +%F).rdb
  ```

### C. Prosedur Update Kode di Masa Mendatang
Jika ada fitur baru yang di-push ke repository:
```bash
cd /var/www/tresno
git pull origin main
docker compose up -d --build
```

### D. Prosedur Rollback Cepat (Jika Terjadi Kendala Fatal)
```bash
cd /var/www/tresno
# Kembali ke commit stabil sebelumnya
git log --oneline -n 5
git checkout <COMMIT_HASH_STABIL>
# Rebuild dan deploy ulang instan
docker compose up -d --build
```

---

## ✅ Tanda Tangan Kesiapan Rilis

| Item Pemeriksaan | Status | Tanggal | Penanggung Jawab |
| :--- | :---: | :---: | :---: |
| Domain, DNS, & Cloudflare SSL | `[ ] Lulus` | ________ | _________________ |
| Agora, Supabase, & Midtrans Keys | `[ ] Lulus` | ________ | _________________ |
| Firewall UFW & Keamanan Docker | `[ ] Lulus` | ________ | _________________ |
| Build Kontainer Docker Compose | `[ ] Lulus` | ________ | _________________ |
| Smoke Test Matchmaking & Video RTC | `[ ] Lulus` | ________ | _________________ |
| Upsell Gentleman VIP & QRIS Flow | `[ ] Lulus` | ________ | _________________ |
| Algoritma Anti-Sepi Host & Destiny | `[ ] Lulus` | ________ | _________________ |
