# 💖 TRESNO (Indonesian 1-on-1 Video Matchmaking & Social App)

> **Platform Pencocokan Video 1-on-1 Acak & Obrolan Sosial Komunitas Indonesia**  
> *Arsitektur Monorepo Bersih, Atomik, Berorientasi Fitur (Feature-Driven), Efisien Biaya & Siap Produksi.*

[![React Native](https://img.shields.io/badge/React%20Native-0.76+-61DAFB?style=flat-square&logo=react&logoColor=black)](https://reactnative.dev/)
[![Fastify](https://img.shields.io/badge/Fastify-5.0+-000000?style=flat-square&logo=fastify&logoColor=white)](https://fastify.dev/)
[![Agora RTC](https://img.shields.io/badge/Agora%20RTC-Audio%2FVideo-099DFD?style=flat-square)](https://www.agora.io/)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL%20%26%20Storage-3ECF8E?style=flat-square&logo=supabase&logoColor=white)](https://supabase.com/)
[![Redis](https://img.shields.io/badge/Redis-7%20In--Memory%20Queue-DC382D?style=flat-square&logo=redis&logoColor=white)](https://redis.io/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6+-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![pnpm](https://img.shields.io/badge/pnpm-Workspaces-F69220?style=flat-square&logo=pnpm&logoColor=white)](https://pnpm.io/)
[![Docker](https://img.shields.io/badge/Docker-Compose%20Ready-2496ED?style=flat-square&logo=docker&logoColor=white)](https://www.docker.com/)

---

## 📑 Daftar Isi
1. [Ringkasan & Filosofi Produk](#-ringkasan--filosofi-produk)
2. [Tech Stack Lengkap](#-tech-stack-lengkap)
3. [Struktur Direktori Monorepo](#-struktur-direktori-monorepo)
4. [Prasyarat Sistem (Prerequisites)](#-prasyarat-sistem-prerequisites)
5. [Panduan Setup & Instalasi](#-panduan-setup--instalasi)
6. [Spesifikasi Lengkap Environment Variables (.env)](#-spesifikasi-lengkap-environment-variables-env)
7. [Cara Menjalankan Aplikasi](#-cara-menjalankan-aplikasi)
8. [Fitur Unggulan & Logika Bisnis Utama](#-fitur-unggulan--logika-bisnis-utama)
9. [Deployment ke VPS (Docker Compose)](#-deployment-ke-vps-docker-compose)
10. [Pengujian & Jaminan Mutu (Quality Assurance)](#-pengujian--jaminan-mutu-quality-assurance)
11. [Troubleshooting & Solusi Masalah](#-troubleshooting--solusi-masalah)

---

## 🌟 Ringkasan & Filosofi Produk

**Tresno** terinspirasi dari aplikasi video sosial global (seperti Tigo, Chamet, dan Bigo), namun didesain khusus dari nol untuk **pasar Indonesia** dengan keunggulan:

1. **Anti-Bot & Real Human:** Membasmi fenomena video looping rekaman palsu di kompetitor; hanya menghubungkan pengguna asli dan host terverifikasi.
2. **Model Ekonomi Berkeadilan (70%–75% Bagi Hasil Host):** Berbeda dari platform besar yang memotong 50%–70% pendapatan talent, Tresno mengambil margin platform ramping (~20%) agar host wanita betah dan mendapatkan penghasilan harian yang layak.
3. **Pencairan Harian Instan (Daily Cashout):** Host dapat mencairkan *Diamond Points* langsung ke dompet digital (DANA, GoPay, OVO) atau rekening bank lokal (BCA, Mandiri, BRI) setelah mencapai batas minimum **2.000 Poin (Rp 200.000)**.
4. **Metode Pembayaran Lokal Mikro (QRIS Native):** Pengguna pria dapat membeli koin mulai dari Rp 10.000 tanpa perlu kartu kredit.
5. **20 Detik Bebas Biaya (Free Trial):** Pengguna baru atau match baru memiliki waktu 20 detik pertama untuk melihat kecocokan sebelum koin mulai dipotong.
6. **Chat Billing Tigo-Grade:** Biaya inisiasi chat 10 koin untuk pria ke host (gratis jika saling follow atau menggunakan Kupon Chat; gratis bagi wanita; host wanita mendapatkan reward +0.1 poin tiap membalas chat).

---

## 💻 Tech Stack Lengkap

### Monorepo & Workspace
- **Package Manager:** `pnpm` (Workspaces) v12.14.0
- **Build Orchestration:** `Turborepo` v2.1.3
- **Bahasa:** TypeScript 5.6.3 (Strict Type Checking)

### Frontend Client (`apps/mobile`)
- **Core:** React Native v0.76.1 + React 18.3.1 (Arsitektur Baru / Fabric & TurboModules Ready)
- **Web Runtime & Preview:** React Native Web v0.21.4 + Vite v8.3.4 (Build SPA kilat < 800ms)
- **State Management:** Zustand v4.5.5 (Zero-overhead, atomic store modular)
- **Animasi & Interaksi:** Native `Animated` API dengan kurva Easing *cubic-bezier* responsif di web & mobile
- **Icons & Visuals:** `lucide-react-native`
- **Design System:** Custom Atomic Design (Atoms, Molecules) dengan Glassmorphism, 3 Theme Modes (Dark, Light, OLED Black), dan 4 Accent Palettes (Ruby Rose, Emerald Mint, Sapphire Ocean, Amethyst Orchid)
- **Internasionalisasi (i18n):** Engine mandiri berbasis store dengan dukungan penuh **Bahasa Indonesia (`id`)** dan **English (`en`)** (100% key parity, 334+ keys)

### Backend Engine & Signaling (`apps/server`)
- **HTTP Framework:** Fastify v5.0.0 (High throughput, low overhead)
- **Realtime Signaling:** `@fastify/websocket` v11.0.0 (Native WebSocket RFC 6455)
- **CORS & Middleware:** `@fastify/cors` v10.0.1
- **Video RTC Token Engine:** `agora-token` v2.0.3 (Dynamic short-lived RTC Access Tokens)
- **In-Memory Queue & Cache:** `ioredis` v5.4.1 (Koneksi ke Redis 7)
- **Runtime Dev:** `tsx` watch mode untuk hot-reload instan

### Shared Contract (`packages/shared`)
- **Shared Types:** Definisi model TypeScript untuk User, Match, Billing, Gift, dan Story
- **Shared Rules & Constants:** Parameter match (durasi trial, tarif per menit, rate diamond)

### Database, Storage & Payment Gateway
- **Database:** Supabase Managed PostgreSQL (Row-Level Security + Atomic SQL Transactions)
- **File Storage:** Supabase Storage (50 GB Free Tier untuk Ephemeral Story 24 jam)
- **Payment Gateway:** Midtrans Snap & Dynamic QRIS (Bank Indonesia MDR 0.7%)

### Production Gateway & Containerization
- **Web Server & Reverse Proxy:** Nginx Alpine (SSL Termination, Rate Limiting, WebSocket Upgrade)
- **Containerization:** Multi-stage Dockerfile untuk Server dan Web + `docker-compose.yml`

---

## 📂 Struktur Direktori Monorepo

```
tresno/
├── apps/
│   ├── mobile/                    # 📱 Frontend React Native + Vite Web Preview
│   │   ├── src/
│   │   │   ├── features/          # Modul Fitur (Feature-Driven Architecture)
│   │   │   │   ├── auth/          # Login Email/Password, Phone OTP, Guest Demo
│   │   │   │   ├── destiny/       # Tab Destiny / Kartu Profil Host
│   │   │   │   ├── matchmaking/   # Radar Pencarian & Algoritma Match
│   │   │   │   ├── messages/      # Obrolan Chat, ChatRoomModal (Slide), Billing Chat
│   │   │   │   ├── mine/          # Profil Saya, Saldo, Status Host, Withdraw
│   │   │   │   ├── missions/      # Task Center, Klaim Hadiah Harian & Kupon
│   │   │   │   ├── navigation/    # Bottom Navigation Dock (Non-Slide)
│   │   │   │   ├── onboarding/    # Wizard 3-Step (Gender, Info, KYC Anchor)
│   │   │   │   ├── social/        # Mekanisme Follow & Status Saling Berteman
│   │   │   │   ├── stories/       # Story Bar & StoryViewerModal (Slide Vertikal)
│   │   │   │   ├── video-chat/    # Agora Video RTC, Billing Heartbeat, DRM Shield
│   │   │   │   └── wallet/        # TopupModal QRIS, Saldo Koin, Poin Host
│   │   │   ├── i18n/              # Sistem Terjemahan (id.ts & en.ts, 334 Keys)
│   │   │   ├── shared/            # Komponen Atomik (Button, Avatar, ChatBubble, Dialog)
│   │   │   ├── theme/             # Design Tokens, 3 Tema & 4 Aksen Palet
│   │   │   ├── App.tsx            # Root Application Component
│   │   │   └── main.web.tsx       # Vite Web Entry Point
│   │   ├── .env.development       # Env lokal mobile
│   │   ├── .env.example           # Template env mobile
│   │   ├── Dockerfile             # Multi-stage build Nginx SPA
│   │   └── vite.config.ts         # Konfigurasi Vite & Alias React Native Web
│   │
│   └── server/                    # ⚡ Backend Fastify & WebSocket Signaling
│       ├── src/
│       │   ├── agora/             # Dynamic Agora RTC Token Generator
│       │   ├── billing/           # Loop Pemotongan Koin & Heartbeat Monitor
│       │   ├── config/            # Loader Konfigurasi & Validasi Env
│       │   ├── match/             # Antrean Pencocokan Gender (In-Memory / Redis)
│       │   ├── socket/            # Signaling Handler WebRTC & Event Dispatcher
│       │   ├── story/             # Worker Pembersih Story 24 Jam Supabase
│       │   └── index.ts           # Fastify Server Bootstrapper
│       ├── .env.development       # Env lokal server
│       ├── .env.example           # Template env server
│       └── Dockerfile             # Container build Fastify Server
│
├── packages/
│   ├── shared/                    # 📦 Shared Types, Rules, & DTOs
│   │   └── src/
│   │       ├── constants/         # Parameter Tarif & Rules Bisnis
│   │       └── types/             # Interface TypeScript Bersama
│   └── supabase/                  # 🐘 Database Migrations & Atomic SQL
│       └── migrations/
│           ├── 01_profiles.sql    # Tabel Akun, Gender, Host Anchor
│           ├── 02_wallets_and_ledger.sql # Dompet Koin, Diamond, Ledger
│           ├── 03_call_sessions.sql # Riwayat Panggilan Video
│           ├── 04_atomic_billing_functions.sql # Fungsi Anti-Bocor deduct_call_coins()
│           └── 05_gifts_seed.sql  # Data Awal Virtual Gift
│
├── gateway/
│   └── nginx.conf                 # Konfigurasi Reverse Proxy Nginx untuk VPS
├── deploy.sh                      # Script Otomatis 1-Click Deployment VPS
├── docker-compose.yml             # Orkestrasikan Server, Web, Redis, Gateway
├── package.json                   # Root package script
├── pnpm-workspace.yaml            # Konfigurasi workspace pnpm
├── PLAN.md                        # Dokumen Blueprint Arsitektur Teknis
├── PRD.md                         # Product Requirements Document
└── README_DOCKER_VPS.md           # Panduan Khusus Deployment Docker VPS
```

---

## 🛠️ Prasyarat Sistem (Prerequisites)

Sebelum memulai, pastikan perangkat Anda memiliki dependensi berikut terpasang:
- **Node.js:** Versi `>= 20.0.0` (Direkomendasikan Node.js v22 LTS).
- **pnpm:** Versi `>= 9.0.0` (Bisa diinstall via `npm install -g pnpm` atau `corepack enable`).
- **Git:** Untuk clone repository.
- **Docker & Docker Compose (Opsional):** Jika ingin menjalankan melalui container lokal atau VPS.

---

## 🚀 Panduan Setup & Instalasi

### 1. Clone Repository & Masuk ke Folder
```bash
git clone https://github.com/username/tresno.git
cd tresno
```

### 2. Install Seluruh Dependensi Monorepo
Gunakan `pnpm` di root folder proyek:
```bash
pnpm install
```
*Catatan: pnpm workspaces akan secara otomatis menghubungkan `@tresno/shared` ke `apps/mobile` dan `apps/server` tanpa symlink manual.*

### 3. Setup Database & SQL Migrations (Supabase)
1. Buka dashboard [Supabase](https://supabase.com/) dan buat project baru (Free tier 500MB DB & 50GB Storage).
2. Buka menu **SQL Editor** pada dashboard Supabase Anda.
3. Jalankan file migration yang ada di `packages/supabase/migrations/` secara berurutan:
   - `01_profiles.sql` (Tabel profil, gender, host verification)
   - `02_wallets_and_ledger.sql` (Tabel saldo koin, saldo diamond, mutasi transaksi)
   - `03_call_sessions.sql` (Pencatatan sesi panggilan video)
   - `04_atomic_billing_functions.sql` (Fungsi SQL atomic `deduct_call_coins()` dengan mekanisme *Row-Level Lock* `SELECT ... FOR UPDATE` anti-bocor saldo)
   - `05_gifts_seed.sql` (Daftar virtual gift default: Mawar, Cokelat, dsb.)
4. Buka menu **Storage** di Supabase, buat bucket baru bernama `tresno-stories` dengan akses *Public Read*.

### 4. Konfigurasi Environment Variables
Salin file template `.env.example` ke file environment aktif:
```bash
# Server Fastify
cp apps/server/.env.example apps/server/.env.development

# Client Mobile Web
cp apps/mobile/.env.example apps/mobile/.env.development
```

---

## 🔑 Spesifikasi Lengkap Environment Variables (.env)

Berikut adalah rincian seluruh parameter environment yang wajib dan opsional:

### 1. Backend Server (`apps/server/.env.development` & `.env.production`)

| Nama Variabel | Tipe Data | Nilai Contoh | Keterangan & Cara Mendapatkannya |
|---|---|---|---|
| `NODE_ENV` | String | `development` / `production` | Menentukan mode logging dan optimasi Fastify. |
| `PORT` | Number | `4000` | Port listening server Fastify. |
| `HOST` | String | `0.0.0.0` | Bind host (gunakan `0.0.0.0` agar dapat diakses jaringan/Docker). |
| `CORS_ORIGIN` | String | `*` atau `http://localhost:3000` | Domain frontend yang diizinkan melakukan request. |
| `AGORA_APP_ID` | String | `a1b2c3d4...` | App ID proyek Agora dari [Agora Console](https://console.agora.io). |
| `AGORA_APP_CERTIFICATE` | String | `e5f6g7h8...` | Primary Certificate dari project Agora untuk enkripsi token keamanan. |
| `REDIS_URL` | String | `redis://localhost:6379` *(Opsional)* | Alamat koneksi Redis. Jika dikosongkan, server otomatis beralih ke *In-Memory Queue*. |
| `SUPABASE_URL` | String | `https://xxxx.supabase.co` | URL Project Supabase dari menu *Project Settings ➔ API*. |
| `SUPABASE_SERVICE_ROLE_KEY` | String | `eyJh...` | **Service Role Secret Key** (jangan pernah diekspos ke frontend client). Digunakan untuk eksekusi fungsi atomic billing di server. |
| `STORY_BUCKET` | String | `tresno-stories` | Nama Supabase Storage Bucket tempat file video/foto story diunggah. |
| `MIDTRANS_SERVER_KEY` | String | `SB-Mid-server-xxx` | Server Key merchant dari [Dashboard Midtrans](https://dashboard.midtrans.com). |
| `MIDTRANS_CLIENT_KEY` | String | `SB-Mid-client-xxx` | Client Key merchant Midtrans. |
| `MIDTRANS_IS_PRODUCTION` | Boolean | `false` | `false` untuk Sandbox, `true` jika menggunakan Production QRIS. |

### 2. Frontend Client (`apps/mobile/.env.development` & `.env.production`)

| Nama Variabel | Tipe Data | Nilai Contoh | Keterangan |
|---|---|---|---|
| `VITE_APP_ENV` | String | `development` | Status environment runtime client. |
| `VITE_API_URL` | String | `http://localhost:4000` | Alamat endpoint REST API backend Fastify. |
| `VITE_WS_URL` | String | `ws://localhost:4000/ws` | Alamat WebSocket server signaling dan billing stream. |
| `VITE_SUPABASE_URL` | String | `https://xxxx.supabase.co` | URL Project Supabase publik untuk client. |
| `VITE_SUPABASE_ANON_KEY` | String | `eyJh...` | Anon/Public Key Supabase untuk query data profil & story. |
| `VITE_AGORA_APP_ID` | String | `a1b2c3d4...` | App ID Agora publik untuk inisialisasi SDK RTC. |

---

## 🏃 Cara Menjalankan Aplikasi

Anda dapat menjalankan aplikasi menggunakan beberapa metode sesuai kebutuhan alur kerja Anda:

### Opsi A: Jalankan Bersamaan (Full-Stack Dev Mode)
Dari direktori root proyek:
```bash
pnpm dev
```
Perintah ini akan menjalankan pipeline Turborepo untuk menjalankan `apps/server` (port 4000) dan `apps/mobile` (port 3000) secara serentak.

### Opsi B: Jalankan Secara Terpisah (Direkomendasikan saat Debugging)

1. **Jalankan Backend Fastify Server:**
   ```bash
   pnpm --filter @tresno/server dev
   ```
   *Server aktif di: `http://localhost:4000` (WebSocket di `ws://localhost:4000/ws`).*

2. **Jalankan Frontend Mobile Web Client (Vite Preview):**
   ```bash
   pnpm --filter @tresno/mobile dev:web
   ```
   *Frontend aktif di: `http://localhost:3000`.*

### Opsi C: Build Produksi Frontend Web
Untuk memvalidasi bundle produksi sebelum rilis:
```bash
pnpm --filter @tresno/mobile build:web
```
*Output bundle teroptimasi akan dihasilkan di folder `apps/mobile/dist/`.*

### Opsi D: Menjalankan di Emulator Android / iOS Native
Jika Anda mengembangkan untuk aplikasi native Android / iOS:
```bash
# Untuk Android
pnpm --filter @tresno/mobile android

# Untuk iOS (di macOS)
pnpm --filter @tresno/mobile ios
```

---

## 💎 Fitur Unggulan & Logika Bisnis Utama

### 1. Video Matchmaking & Billing Anti-Bocor
- **20 Detik Pertama Gratis:** Sesi panggilan video memberikan 20 detik pertama gratis bagi pengguna untuk saling menyapa.
- **Interval Billing 60 Detik:** Setelah detik ke-20, sistem secara otomatis memotong saldo **15 Koin per interval (60 detik)**.
- **Pre-Authorization Hold (Zero Race Condition):** Token Agora hanya diperpanjang setelah pemotongan saldo berhasil di database. Jika saldo pengguna tidak mencukupi 15 koin, database menolak transaksi dan server seketika memutus token Agora.
- **Heartbeat Disconnect Sensor:** WebSocket mengirimkan sinyal heartbeat setiap 5 detik. Jika koneksi putus lebih dari 15 detik, sesi panggilan otomatis ditutup dan kompensasi koin diselesaikan.

### 2. Aturan Chat Billing Ala Tigo
- **Inisiasi Chat Pria ke Host:** Dikenakan biaya awal **10 koin** untuk membuka sesi obrolan (*initial chat fee*). Setelah terbuka, chat selanjutnya tidak dikenakan biaya koin per pesan.
- **Pengecualian Gratis (Free Initial Chat):**
  - **Saling Follow (Mutual Friends):** Jika host dan caller pria saling mengikuti, inisiasi chat 100% **GRATIS**.
  - **Kupon Chat (Chat Coupons):** Jika caller memiliki kupon obrolan, kupon akan digunakan otomatis tanpa memotong saldo koin.
- **Inisiasi Chat Wanita ke Pria:** Selalu **GRATIS** tanpa syarat.
- **Hadiah Poin Balas Chat Host Wanita:** Host wanita menerima reward sebesar **+0.1 Diamond Point** setiap kali membalas pesan dari pengguna.
- **Official System Channel:** Jalur obrolan khusus dari sistem Tresno dengan badge emas resmi dan penanda visual unik.
- **Divider Waktu Cerdas:** Pesan dikelompokkan dengan penanda waktu (jam:menit) jika ada jeda percakapan > 5 menit, serta garis pembatas tanggal jika obrolan berada di hari yang berbeda.

### 3. Konversi Dompet & Penarikan Poin Host (Daily Cashout)
- **1 Koin = Rp 100** (Pembelian pengguna via QRIS).
- **1 Diamond Point = Rp 100** (Pendapatan bersih host).
- **Ambang Batas Minimum Penarikan:** **2.000 Diamond Points (Rp 200.000)**.
- Pencairan dana langsung diproses ke rekening DANA, GoPay, OVO, atau rekening bank lokal (BCA, Mandiri, BRI).

### 4. Story Feeds Ephemeral 24 Jam
- Pengguna dan host dapat mengunggah video atau foto ke Story Bar.
- Menggunakan Supabase Storage (50 GB Free Tier).
- Sistem pembersih otomatis (*24-hour purge worker*) menghapus media kedaluwarsa setelah 24 jam.
- Pengguna dapat membalas story langsung ke ruang obrolan chat atau langsung memulai panggilan video 1-on-1 dengan host.

### 5. Pusat Misi & Hadiah (Task Center)
- **Check-in Harian:** Mengklaim koin gratis dan kupon obrolan setiap hari.
- **Misi Pemula:** Tugas verifikasi profil, panggilan pertama, dan follow host untuk mendapatkan hadiah kupon obrolan.

### 6. Desain Visual, Tema & Animasi Navigasi Native
- **Desain Glassmorphism:** Tampilan modern, bersih, dan berkesan mewah.
- **3 Mode Tema:** Dark Mode, Light Mode, dan OLED Pure Black.
- **4 Palet Warna Aksen:** Ruby Rose, Emerald Mint, Sapphire Ocean, dan Amethyst Orchid.
- **Matriks Animasi Navigasi:**
  - **Horizontal Slide (Kanan ➔ Kiri):** Chat Room Detail, Onboarding Wizard (Step 1–3), Phone Login ke OTP.
  - **Vertical Slide-Up (Bottom Drawer Sheet):** Top-up QRIS, Pusat Misi, Pemutar Story 24 Jam, DatePicker.
  - **Non-Slide (Instant / Center Scale):** Tab Utama Bottom Bar, Dialog Alert Kritis, DRM Shield.

### 7. Keamanan, DRM & Privasi
- **Call DRM Shield:** Sensor perlindungan perekaman layar dan anti-screenshot pada sesi panggilan video.
- **3-Second Black Blur:** Layar disensor di 3 detik awal sebelum stream video dibuka penuh untuk kenyamanan privasi.
- **One-Tap Report & Block:** Melaporkan pelanggaran visual atau memblokir pengguna secara instan.

---

## 🚢 Deployment ke VPS (Docker Compose)

Aplikasi Tresno telah dilengkapi dengan konfigurasi Docker produksi dan skrip otomatis 1-click.

### Spesifikasi VPS yang Disarankan
- **Provider:** Hetzner Cloud (CX22) / DigitalOcean / Linode / IDCloudHost.
- **Spesifikasi:** 1–2 vCPU, 2–4 GB RAM, Ubuntu 22.04 LTS.
- **Estimasi Biaya Server:** ~Rp 65.000 / bulan.

### Langkah Cepat Deploy:
```bash
# 1. Masuk ke direktori aplikasi di VPS
cd /opt/tresno

# 2. Siapkan file .env.production untuk server
cp apps/server/.env.example apps/server/.env.production
nano apps/server/.env.production   # Isi kredensial asli

# 3. Beri izin eksekusi dan jalankan deploy script
chmod +x deploy.sh
./deploy.sh
```

Seluruh kontainer (Fastify Backend, Frontend Web SPA, Redis Cache, dan Nginx Reverse Proxy) akan aktif otomatis di port 80/443. Untuk panduan lengkap setup SSL Certbot dan Cloudflare, baca [README_DOCKER_VPS.md](file:///Users/jangkungari/Desktop/tigo/tresno/README_DOCKER_VPS.md).

---

## 🧪 Pengujian & Jaminan Mutu (Quality Assurance)

Sebelum melakukan commit atau deployment, pastikan seluruh tes kompilasi dan build lolos tanpa error:

1. **Uji Validasi Tipe TypeScript:**
   ```bash
   pnpm --filter @tresno/mobile exec tsc --noEmit
   pnpm --filter @tresno/server exec tsc --noEmit
   ```
   *(Harus menghasilkan exit code 0 tanpa error).*

2. **Uji Produksi Web Bundle:**
   ```bash
   pnpm --filter @tresno/mobile build:web
   ```
   *(Harus menghasilkan bundle minified di `apps/mobile/dist/` dalam waktu < 1 detik).*

3. **Uji Simulasi Script Koin & Billing:**
   Jalankan skrip verifikasi otomatis pemotongan koin:
   ```bash
   node qa/test_billing.js
   ```

---

## ❓ Troubleshooting & Solusi Masalah

### 1. Error: `Cannot find module '@tresno/shared'`
- **Penyebab:** Workspace pnpm belum terindeks atau belum menjalankan instalasi dependensi.
- **Solusi:** Jalankan `pnpm install` di root direktori monorepo.

### 2. Port Conflict (Error `EADDRINUSE: port 3000` atau `port 4000`)
- **Penyebab:** Proses server atau dev server sebelumnya masih berjalan di background.
- **Solusi:** 
  ```bash
  # Cari PID yang menggunakan port
  lsof -i :3000
  lsof -i :4000
  # Matikan proses tersebut
  kill -9 <PID>
  ```

### 3. Layar Video Agora Kosong / Hitam
- **Penyebab:** `AGORA_APP_ID` atau `AGORA_APP_CERTIFICATE` di `.env` masih berisi placeholder.
- **Solusi:** Buat project gratis di [Agora Console](https://console.agora.io), aktifkan *App Certificate*, lalu salin kuncinya ke file `.env` server dan mobile.

### 4. Supabase RLS Policy Menolak Query
- **Penyebab:** Migration SQL belum dieksekusi lengkap di Supabase SQL Editor.
- **Solusi:** Jalankan seluruh isi file migration `01_profiles.sql` sampai `05_gifts_seed.sql` di Supabase SQL Editor.

---

## 📄 Lisensi & Hak Cipta
Hak Cipta © 2026 **Tresno Team**. Seluruh hak cipta dilindungi undang-undang.
Dirancang khusus untuk ekosistem komunitas dan kreator Indonesia.
