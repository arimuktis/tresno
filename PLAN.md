# TRESNO - Master Blueprint, Architecture & Production Deployment Plan

> **Dokumen Referensi Utama:**  
> - Spesifikasi Produk & Strategi Bisnis: [`PRD.md`](file:///Users/jangkungari/Desktop/tigo/tresno/PRD.md)  
> - Panduan Docker & VPS Gateway: [`README_DOCKER_VPS.md`](file:///Users/jangkungari/Desktop/tigo/tresno/README_DOCKER_VPS.md)  
> - Checklist Deployment VPS 7-Fase: [`DEPLOYMENT_CHECKLIST.md`](file:///Users/jangkungari/Desktop/tigo/tresno/DEPLOYMENT_CHECKLIST.md)  
> - Status Arsitektur Monorepo: `@tresno/shared`, `@tresno/mobile`, `@tresno/server`, `@tresno/supabase`

---

## 1. Ringkasan Eksekutif & Status Sistem

Aplikasi **Tresno** (Domain Web: `app.tresno.id`, Package ID: `com.arimukti.tresno`) adalah platform **1-on-1 Random Video Match & Virtual Gifting** berbasis komunitas lokal Indonesia yang dirancang dengan filosofi **Lean, High-Trust, Growth-First, dan Anti-Bocor**.

Sistem saat ini telah selesai dibangun (*feature-complete*) pada fase MVP dengan arsitektur **Dual-Mode Engine (Offline Sandbox Demo & Production Supabase)**, sehingga aplikasi dapat diuji coba seketika tanpa dependensi eksternal, sekaligus siap di-deploy ke server VPS produksi.

---

## 2. Matriks Fitur yang Selesai Dibangun (Status Selesai)

| Modul | Komponen Kunci | Deskripsi & Keunggulan |
|---|---|---|
| **Story Instagram 24h** | `StoryCircle.tsx`, `StoryBar.tsx`, `StoryViewerModal.tsx`, `storyWorker.ts` | Unggah video/foto singkat ke Supabase Storage (50GB free tier) dengan durasi kedaluwarsa 24 jam (*auto-purge* background worker setiap 10 menit), progress bar interaktif 5 detik, tap jeda, dan tombol langsung panggil video 1-on-1. |
| **Strict Call DRM** | `useCallDrm.ts`, `CallDrmShield.tsx`, `ForensicWatermark.tsx`, `nativeDrmBridge.ts` | Perlindungan privasi panggilan video tingkat tinggi: blokir *screenshot* & *screen recording*, sensor layar hitam saat unfocus/blur, *dynamic floating forensic watermark* (User ID, Host ID, live timestamp), dan sanksi pemutusan panggilan 2-strike. |
| **Multi-Method Auth** | `authService.ts`, `useAuthStore.ts`, `EmailLoginModal.tsx`, `PhoneLoginModal.tsx` | Mendukung **4 metode login ala Tigo**: Google OAuth, Nomor HP / WhatsApp OTP (cooldown 60s), Email & Kata Sandi (dengan toggle visibilitas sandi dan lupa kata sandi), serta Masuk Instan (Tamu/Guest binding Device ID dengan 50 koin bonus). |
| **Legal & Kepatuhan** | `LegalModal.tsx`, `useLegalModalStore.ts` | Modal interaktif dwibahasa untuk **Ketentuan Layanan** (syarat usia 18+, kebijakan nol toleransi pornografi/pelecehan) dan **Kebijakan Privasi** (WebRTC P2P DTLS-SRTP, UU PDP No. 27/2022 & GDPR). |
| **Tigo-Style Messages & Dividers** | `MessagesTab.tsx`, `MessageItemRow.tsx`, `ChatRoomModal.tsx`, `dateTimeUtils.ts` | Daftar pesan datar (*flat list*) dengan *hairline line divider* (tanpa kartu), waktu jam presisi (`13:20`, `Kemarin`, `15 Okt`), pesan resmi sistem (*Tresno Official*) terpisah di bagian atas dengan badge `[RESMI]`, serta *date & time divider* kapsul di ruang chat detail saat beda hari (`Hari ini`, `Kemarin`) atau ada jeda waktu (>15 menit). |
| **Tigo-Style Chat Billing & Kupon** | `useChatStore.ts`, `useWalletStore.ts`, `ChatRoomModal.tsx` | Initial chat 10 koin untuk cowok (pesan pertama), pesan selanjutnya GRATIS sepuasnya tanpa biaya per pesan. Chat dimulai dari cewek 100% GRATIS dan Host cewek mendapat reward +2 Points per balasan chat (ala Tigo). Biaya initial chat cowok gratis jika memiliki **Kupon Chat (Chat Coupon)** atau **Saling Follow (Berteman)**. |
| **Saling Follow & Teman** | `useSocialStore.ts`, `ChatRoomModal.tsx`, `MineTab.tsx` | Mekanisme follow/unfollow dan deteksi mutual friendship (`Teman`). Pengguna yang saling follow mendapatkan hak istimewa bebas biaya chat (gratis sepuasnya). |
| **Misi Harian & Claim Reward** | `useMissionStore.ts`, `MissionsCenterModal.tsx`, `MineTab.tsx` | Pusat Misi & Hadiah (*Task Center* ala Tigo) dengan tab Misi Harian & Pemula: check-in harian, kirim chat, follow host, tonton story, coba video call, dan balas pesan. Tombol *Klaim Hadiah* interaktif dengan penambahan instan Koin, Kupon Chat, dan Poin Host. |
| **Atomic Design System** | `TextField.tsx`, `Dialog.tsx`, `SelectDropdown.tsx`, `DatePickerModal.tsx`, `PhotoPicker.tsx`, `ToastContainer.tsx`, `NetworkStatusBar.tsx` | Komponen atomik-molekul standar berdesain *liquid glass*, floating labels, validasi terpadu, notifikasi toast non-blocking, dan indikator koneksi online/offline otomatis. |
| **Multi-Env Config** | `env.ts` (Mobile & Server), `.env.development`, `.env.production` | Sistem variabel lingkungan ala WorkWise dengan validasi skema runtime menggunakan **Zod** dan aturan keamanan gatekeeper sebelum build produksi. |
| **Docker & Gateway VPS** | `Dockerfile` (Server & Mobile), `docker-compose.yml`, `gateway/nginx.conf`, `deploy.sh` | Deployment kontainer multi-stage Node 22 Alpine, reverse proxy Nginx untuk WebSocket upgrade (`/ws`), batas upload 50MB, dan skrip instalasi 1-klik. |
| **Billing Loop Anti-Bocor** | `billingWorker.ts`, `04_atomic_billing_functions.sql` | 20 detik pertama gratis, countdown per-menit otomatis, fungsi atomik PostgreSQL `deduct_call_coins()` mencegah eksploitasi koin negatif, dan konversi reward Host ke Points minimal 2.000 Points untuk pencairan. |
| **Sistem Notifikasi & Web Audio Synthesizer** | `soundService.ts`, `useNotificationStore.ts`, `NotificationBanner.tsx`, `IncomingCallModal.tsx`, `notificationWorker.ts`, `notificationRoutes.ts` | Notifikasi in-app & push browser dengan mesin synthesizer audio internal (Web Audio API) tanpa file audio eksternal berat: nada dering panggilan masuk (*ringtone*), koin masuk (*coin drop*), dentang pesan (*chime*), dan radar match (*alert*). Dilengkapi background timer simulation worker dan endpoint `/api/notifications`. |
| **Navigasi Fallback Default & Non-blocking Call Lifecycle** | `App.tsx`, `useCallStore.ts`, `VideoCallOverlay.tsx` | Alur navigasi anti-disorientasi: fallback setelah login dan onboarding diarahkan default ke tab Matchmaking (`match`). Ketika panggilan berakhir (hangup atau waktu habis), layar langsung bertransisi (*non-blocking clean return*) ke tab asal tanpa modal pop-up interupsi. |
| **Mekanisme Upsell Gentleman VIP Starter Pack** | `GentlemanUpsellModal.tsx`, `MatchTab.tsx`, `useWalletStore.ts` | Strategi monetisasi khusus pengguna pria (Rp 9.900) dengan paket bernilai tinggi: 120 Koin + 5 Kupon Chat + Filter 100% Host Wanita + Prioritas Radar 2 Detik + Lencana VIP Emas. Pemicu otomatis cerdas: saat saldo menipis, setelah panggilan ke-2 selesai, atau saat menunggu radar matchmaking, dilengkapi countdown 10 menit dan simulasi 1-klik QRIS. |
| **Host Anti-Sepi Fair Traffic Allocation Engine** | `hostTrafficEngine.ts`, `destinyAlgorithm.ts`, `DestinyTab.tsx`, `MineTab.tsx`, `AnchorCard.tsx` | Algoritma alokasi trafik adil berbasis skor dinamis ($Score = \text{IdleBoost} + \text{Incubator} + \text{QuotaDeficit} + \text{AnswerRate} - \text{Fatigue}$) yang mencegah dominasi segelintir host dan menghilangkan akun sepi bagi host baru / yang sedang lama menunggu. Dilengkapi Multi-Bucket Interleaving di tab Destiny, lencana eksposur (`Bintang Baru`, `Respon Kilat`, `Baru Online`), dan panel transparansi Live Host Radar di profil host. |
| **Standarisasi 100% Vector Icon (Zero Unicode Emoji UI)** | Seluruh komponen `apps/mobile/src` | Seluruh antarmuka dibersihkan dari emoji Unicode bawaan OS dan dialihkan 100% ke pustaka ikon vektor Lucide (`LucideIcon`, SVG ter-optimasi) untuk konsistensi visual lintas platform (Android/iOS/Web), rendering tajam di semua DPI, dan tampilan modern premium. |

---

## 3. Panduan Menjalankan & Quick Start

### A. Menjalankan di Mode Lokal / Sandbox Demo (Default)
Aplikasi secara cerdas mendeteksi ketiadaan kredensial Supabase dan otomatis beralih ke engine simulasi lokal (`localStorage` & server in-memory).

1. **Buka Direktori Monorepo**:
   ```bash
   cd /Users/jangkungari/Desktop/tigo/tresno
   ```
2. **Pasang Dependensi**:
   ```bash
   pnpm install
   ```
3. **Build Library Shared Monorepo**:
   ```bash
   pnpm --filter @tresno/shared build
   ```
4. **Jalankan Backend Server Fastify & WebSocket (Port 4000)**:
   ```bash
   pnpm --filter @tresno/server dev
   ```
5. **Jalankan Frontend Mobile Web (Port 3000 / 3001)**:
   ```bash
   pnpm --filter @tresno/mobile dev:web
   ```
6. Buka peramban di `http://localhost:3000` (atau port aktif yang ditampilkan terminal).

---

### B. Menghubungkan ke Supabase Produksi (Opsional)
Jika Anda ingin menghubungkan ke database cloud Supabase nyata:

1. Buat project baru di [Supabase Dashboard](https://app.supabase.com).
2. Masuk ke menu **SQL Editor**, lalu jalankan migrasi berikut secara berurutan:
   - `packages/supabase/migrations/01_profiles.sql` (tabel profil, gender, kyc, role)
   - `packages/supabase/migrations/02_wallets_and_ledger.sql` (dompet koin, diamond host, ledger mutasi)
   - `packages/supabase/migrations/03_call_sessions.sql` (sesi call WebRTC/Agora)
   - `packages/supabase/migrations/04_atomic_billing_functions.sql` (stored procedure billing aman)
   - `packages/supabase/migrations/05_gifts_seed.sql` (katalog virtual gift kado)
3. Buat Bucket Storage di menu **Storage**:
   - Nama bucket: `tresno-stories`
   - Jadikan sebagai **Public Bucket** dengan batas ukuran file 50 MB.
4. Perbarui file `.env.development` atau `.env.production` di `apps/server` dan `apps/mobile` dengan `SUPABASE_URL` dan `SUPABASE_ANON_KEY`.

---

## 4. Prosedur Deployment VPS Produksi (1-Click Docker)

Sistem telah dilengkapi dengan pipeline kontainerisasi Docker lengkap:

```
[Internet Client]
       │
       ▼ (Port 80 / 443 SSL)
┌──────────────────────────────────────────────┐
│        Gateway Nginx Reverse Proxy           │
├──────────────────────┬───────────────────────┤
│  /ws & /api/*        │  /* (SPA Web App)     │
│  (Upstream: 4000)    │  (Upstream: 80)       │
└──────────┬───────────┴───────────┬───────────┘
           │                       │
           ▼                       ▼
┌─────────────────────┐ ┌─────────────────────┐
│  tresno-server      │ │  tresno-mobile      │
│  (Node 22 Fastify)  │ │  (Vite + Nginx SPA) │
└─────────────────────┘ └─────────────────────┘
```

### Langkah Deployment ke VPS:
1. **Sewa VPS Linux** (Rekomendasi: Hetzner CX22 / Ubuntu 22.04 LTS, minimal 1 vCPU, 2GB RAM).
2. **Clone Repository & Konfigurasi**:
   ```bash
   git clone <repo-url> /opt/tresno
   cd /opt/tresno
   cp apps/server/.env.production.example apps/server/.env.production
   cp apps/mobile/.env.production.example apps/mobile/.env.production
   nano apps/server/.env.production  # Sesuaikan kredensial Agora & domain
   ```
3. **Eksekusi 1-Click Deploy Script**:
   ```bash
   chmod +x deploy.sh
   ./deploy.sh
   ```
4. **Pasang Sertifikat SSL Gratis (Let's Encrypt)**:
   ```bash
   apt-get update && apt-get install -y certbot
   certbot certonly --webroot -w /opt/tresno/gateway/certbot -d app.tresno.id
   ```

---

## 5. Model Finansial & Kalkulasi Biaya Indie Solo Dev

### A. Rincian Biaya Berjalan Bulanan (OpEx)

| Komponen Infrastruktur | Paket Rekomendasi | Kuota Gratis / Kapasitas | Estimasi Biaya/Bulan |
|---|---|---|:---:|
| **Agora RTC (Video Stream)** | **Free Tier** | **10.000 menit gratis setiap bulan** (~166 jam panggilan video). Cukup untuk puluhan user aktif awal. | **Rp 0** |
| **Supabase (DB, Auth, Storage)** | **Free Tier** | 500 MB PostgreSQL, 50.000 MAU Auth, dan **50 GB Supabase Storage** untuk Story 24 jam. | **Rp 0** |
| **Payment Gateway (Midtrans)** | **Pay-As-You-Grow** | **Tanpa biaya bulanan / biaya setup**. Potongan hanya 0.7% saat ada transaksi QRIS berhasil. | **Rp 0** |
| **VPS Server (Docker Hosting)** | **Hetzner Cloud (CX22)** | 2 vCPU, 4GB RAM, 40GB SSD, 20TB Traffic di data center Falkenstein/Helsinki. | **~Rp 65.000 / bln** |
| **Total Biaya Bulanan (OpEx):** | | | **~Rp 65.000 / bulan** |

### B. Biaya Sekali Bayar di Awal (CapEx)

| Item | Keterangan | Estimasi Biaya |
|---|---|:---:|
| **Google Play Developer Account** | Biaya registrasi seumur hidup untuk rilis APK Android ke Play Store. | **$25 (~Rp 400.000)** |
| **Domain Web (tresno.id)** | Untuk endpoint API gateway, SSL, dan verifikasi merchant QRIS. | **Rp 12.000 - Rp 140.000** |
| **Total Investasi Awal:** | | **~Rp 412.000 - Rp 540.000** |

---

## 6. Roadmap Pengembangan Lanjutan (Post-Launch Phase)

1. **AI Integrated Content Moderation (Safety First)**:
   - Integrasi model *nudity & toxicity detection* ringan pada *frame stream* video untuk mematikan kamera secara otomatis jika terdeteksi pelanggaran visual berat.
2. **PostHog Funnel Analytics & Monetization Optimizer**:
   - Pelacakan rasio konversi dari *20-second free trial* menuju *first top-up QRIS*.
   - Analisis *drop-off rate* pada matchmaking radar untuk mengoptimalkan waktu tunggu pencocokan.
3. **Agensi & Host Web Portal**:
   - Dashboard analitik berbasis web untuk ketua agensi guna memantau total menit panggilan talent, pembagian komisi 10%, dan laporan performa harian.
4. **Distribusi Native Android (AAB/APK)**:
   - Build bundle Android rilis menggunakan React Native CLI / Gradle dengan konfigurasi `FLAG_SECURE` hardware protection aktif (`PACKAGE_ID: com.arimukti.tresno`).

---

## 7. Algoritma Distribusi Trafik Host Adil (Anti-Sepi) & Prosedur Deployment VPS Produksi

### A. Latar Belakang Masalah (Host Tigo "Akun Sepi")
Pada platform live 1-on-1 seperti Tigo, salah satu keluhan terbesar host adalah **distribusi panggilan yang berat sebelah** (hanya 5% host teratas yang menerima 90% panggilan), sementara host baru atau host yang sudah lama bersiap (*standby*) merasa akunnya "sepi" dan akhirnya berhenti menjadi talent (*host churn*).

### B. Rumus & Komponen Skor Trafik Adil (`hostTrafficEngine.ts`)
Tresno mengimplementasikan **Fair Traffic Allocation Engine** dengan skor dinamis:

$$\text{FinalScore} = \text{BaseScore} + \text{IdleBoost} + \text{IncubatorBoost} + \text{QuotaDeficitBoost} + \text{AnswerRateBoost} - \text{FatiguePenalty}$$

1. **Idle Anti-Sepi Boost (+2.5 poin / menit standby, Maksimal +50 poin)**:
   - Host yang telah aktif menunggu tanpa panggilan menerima peningkatan prioritas secara linier.
   - Host yang menunggu 20 menit akan melompati host yang baru saja selesai menerima panggilan.
2. **Cold-Start Incubator (+45 poin)**:
   - Host baru yang mendaftar dalam waktu < 72 jam pertama otomatis masuk ke dalam "Inkubator Eksposur" untuk memastikan mereka langsung mendapat impresi dan panggilan awal tanpa harus memiliki riwayat diamond lama.
3. **Daily Minimum Quota Guarantee (+30 poin)**:
   - Host aktif yang hari ini menerima < 5 panggilan diberikan dorongan prioritas agar tidak mengalami hari tanpa pendapatan sama sekali.
4. **Answer Rate & Responsiveness Boost (+20 poin)**:
   - Host dengan riwayat mengangkat panggilan > 85% diapresiasi dengan bonus prioritas untuk menjaga pengalaman pengguna pria (*user pickup rate* tetap tinggi).
5. **Fatigue Cooldown Penalty (-35 poin)**:
   - Host yang baru saja menyelesaikan panggilan berturut-turut dikenai penalti pendinginan sementara selama 3 menit agar trafik otomatis berputar ke host lain yang sedang menunggu.

### C. Multi-Bucket Interleaving pada Tab Destiny (`destinyAlgorithm.ts`)
Di halaman feed Destiny, daftar anchor tidak lagi diurutkan secara statis berdasarkan total gift atau popularitas, melainkan menggunakan pola **Multi-Bucket Interleaving**:
- **Slot 1**: Host Berkinerja Tinggi (*High Performer / Respon Kilat*)
- **Slot 2**: Host Baru Inkubator (*Bintang Baru*)
- **Slot 3**: Host Lama Standby (*Baru Online / Idle Waiting*)
- **Slot 4**: Host Berkinerja Tinggi berikutnya (bergilir sesuai time-sharing jam)

Dengan pola ini, setiap host yang online dijamin muncul di paruh atas layar (*above-the-fold*), memutus siklus monopoli trafik.

### D. Checklist Deployment VPS Produksi 7-Fase
Panduan operasional lengkap step-by-step telah dibukukan dalam dokumen tersendiri:
👉 **[`DEPLOYMENT_CHECKLIST.md`](file:///Users/jangkungari/Desktop/tigo/tresno/DEPLOYMENT_CHECKLIST.md)**
1. **Fase 1**: Persiapan Domain `app.tresno.id` & DNS A-Record Cloudflare.
2. **Fase 2**: Konfigurasi Agora RTC App Certificate, Supabase Cloud Storage `tresno-stories`, dan Midtrans QRIS Production.
3. **Fase 3**: Konfigurasi Server VPS Ubuntu, UFW Firewall (Port 22, 80, 443), Swap Memory 2GB, dan Docker Engine.
4. **Fase 4**: Audit Variabel Lingkungan `.env.production` & Validasi Zod.
5. **Fase 5**: Eksekusi Multi-Stage Container Build & Docker Compose Up.
6. **Fase 6**: Smoke Testing E2E Panggilan Realtime & Billing.
7. **Fase 7**: Monitoring Kesehatan Server & Prosedur Rollback Cepat.

---

## 8. Audit Navigasi & Matriks Transisi Animasi (Slide vs Non-Slide UX)

Berdasarkan audit komprehensif terhadap seluruh arsitektur navigasi, modal, drawer, dan overlay pada aplikasi, berikut adalah matriks standar transisi antarmuka beserta justifikasi UX (*User Experience & Human Interface Guidelines*):

### Matriks Klasifikasi Transisi Navigasi

| Komponen / Screen | Tipe Transisi | Nilai Transformasi & Easing | Justifikasi UX & Alasan |
|---|---|---|---|
| **Chat Room Detail (`ChatRoomModal`)** | **Horizontal Slide (Kanan ➔ Kiri)** | `translateX: [SCREEN_WIDTH, 0]`, Cubic-Bezier `(0.16, 1, 0.3, 1)`, durasi 280ms/220ms + shadow elevasi -4 | **Wajib Slide:** Pola standar industri (*iOS/Android Navigation Stack*). Pengguna berpindah hierarki dari daftar pesan (master) ke percakapan individual (detail). Efek slide horizontal mempertegas kedalaman hierarki navigasi. |
| **Onboarding Wizard (`OnboardingScreen`)** | **Horizontal Step Slide (Kanan/Kiri)** | `translateX: [±40, 0]`, `opacity: [0, 1]`, durasi 250ms | **Wajib Slide:** Alur formulir bertahap (*multi-step funnel*: Gender ➔ Profil ➔ KYC Host). Efek slide ke kanan menandakan kemajuan (*forward*), slide ke kiri saat back menandakan kembali (*retreat*). Fallback default setelah selesai langsung ke tab Matchmaking. |
| **Phone Login & OTP (`PhoneLoginModal`)** | **Horizontal Step Slide (Kanan/Kiri)** | `translateX: [±36, 0]`, `opacity: [0, 1]`, durasi 240ms | **Wajib Slide:** Transisi dari input nomor telepon ke verifikasi OTP 6-digit. Memberikan kesinambungan alur verifikasi tanpa disorientasi. Fallback default setelah login langsung ke tab Matchmaking. |
| **Top-up Saldo QRIS (`TopupModal`)** | **Vertical Slide-Up (Bottom Sheet)** | Native `animationType="slide"` (`translateY: [height, 0]`) | **Wajib Slide (Vertikal):** Pembayaran adalah aksi kontekstual sekunder yang ditarik dari bawah layar (*drawer sheet*). Pengguna tetap merasa berada di halaman asal. |
| **Pusat Misi & Hadiah (`MissionsCenterModal`)** | **Vertical Slide-Up (Bottom Sheet Drawer)** | Native `animationType="slide"` + drag handle indicator | **Wajib Slide (Vertikal):** Kotak hadiah dan klaim harian ala Tigo/game casual. Menampilkan aset ribbon (Koin, Kupon, Poin) sebagai laci hadiah yang ditarik dari bawah. |
| **Gentleman VIP Starter Pack (`GentlemanUpsellModal`)** | **Vertical Slide-Up (Bottom Sheet Glow)** | Native `animationType="slide"` + gold border glow | **Wajib Slide (Vertikal):** Penawaran diskon waktu terbatas (10 menit) yang muncul secara elegan dari bawah tanpa mengaburkan konteks radar matchmaking. |
| **Pemutar Story 24 Jam (`StoryViewerModal`)** | **Vertical Slide-Up & Slide-Down** | `translateY: [SCREEN_HEIGHT, 0]`, `opacity: [0, 1]`, durasi 280ms/220ms | **Wajib Slide (Vertikal):** Mengikuti standar Instagram/Tigo Stories. Story muncul dari lingkaran avatar di StoryBar ke layar penuh, dan saat di-close/swipe turun kembali meluncur ke bawah. |
| **Pemilih Tanggal Lahir (`DatePickerModal`)** | **Vertical Slide-Up (Bottom Wheel)** | Native `animationType="slide"` | **Wajib Slide (Vertikal):** Selector roda tanggal standar mobile (*bottom drawer picker*). |
| **Panggilan Masuk (`IncomingCallModal`)** | **Vertical Slide-Down (Top Banner Drop)** | `translateY: [-120, 0]`, spring easing | **Wajib Slide (Vertikal Atas):** Notifikasi panggilan masuk bergaya head-up display ala iOS/Android dengan loop ringtone audio synthesizer. |
| **Bottom Navigation Bar (`App.tsx`)** | **Non-Slide (Instant Tab Switch)** | Tanpa animasi geser / cross-fade halus | **TIDAK Menggunakan Slide:** 4 tab utama (`match`, `destiny`, `messages`, `mine`) berada di tingkat hierarki setara (*peer destinations*). Animasi slide horizontal antar tab bawah dihindari karena memicu disorientasi visual pada mobile navigation dock. |
| **Dialog Konfirmasi (`Dialog.tsx`)** | **Non-Slide (Center Scale & Fade)** | `opacity: [0, 1]`, scale center | **TIDAK Menggunakan Slide:** Alert darurat atau dialog konfirmasi tindakan kritis harus fokus di tengah pandangan mata pengguna. Slide akan mengaburkan urgensi dialog. |
| **Pilihan Tema & Legalitas (`ThemeSwitcherModal`, `LegalModal`)** | **Non-Slide (Center Glass Fade)** | `animationType="fade"` | **TIDAK Menggunakan Slide:** Dialog referensi ringan & preferensi cepat. Tetap berada di tengah layar tanpa mengubah orientasi spasial pengguna. |
| **Overlay Panggilan Video & DRM Shield (`VideoCallOverlay`, `CallDrmShield`)** | **Non-Slide (Instant Return Fallback)** | Instant mount / Instant unmount (0ms) | **TIDAK Menggunakan Slide:** Proteksi sensor keamanan & WebRTC media stream harus aktif seketika. Saat panggilan berakhir, layar langsung kembali bersih (*non-blocking clean return*) ke tab semula tanpa modal perantara. |

---

## 9. Checklist Kesiapan Produksi & Verifikasi Build

Seluruh paket dalam arsitektur monorepo telah diaudit dan diverifikasi:

1. **Shared Library (`@tresno/shared`)**:
   - `pnpm --filter @tresno/shared build` -> **LULUS (Exit Code 0)**.
   - Entry point dual-mode (`dist/index.js`, `dist/index.d.ts`, ESM `exports` map).
   - Aturan bisnis, konfigurasi package `com.arimukti.tresno`, dan domain `app.tresno.id` tersinkronisasi 100%.
2. **Backend Server (`@tresno/server`)**:
   - `pnpm --filter @tresno/server build` -> **LULUS (Exit Code 0)**.
   - `pnpm --filter @tresno/server exec tsc --noEmit` -> **LULUS (Exit Code 0)**.
   - Smoke test startup node `apps/server/dist/index.js` -> Berhasil mendengarkan port 4000/4005, koneksi WebSocket `/ws`, dan endpoint `/health`.
3. **Frontend Client (`@tresno/mobile`)**:
   - `pnpm --filter @tresno/mobile exec tsc --noEmit` -> **LULUS (Exit Code 0)**.
   - `pnpm --filter @tresno/mobile build:web` -> **LULUS (Exit Code 0)**.
   - Bundle produksi Vite terkompresi gzip (`dist/index.html`, `dist/assets/`).
4. **Automated QA Test Suite (`qa/run-ui-flow-tests.mjs`)**:
   - 7/7 skenario alur fungsional disinkronkan dengan mekanisme fallback non-blocking dan alur upsell.

---

## 10. Kesimpulan & Status Akhir

Seluruh arsitektur teknis, perlindungan keamanan DRM, kepatuhan legalitas, komponen antarmuka atomik, sistem transisi navigasi native-grade (slide horizontal master-detail & vertical drawer sheet), mesin audio notifikasi terpadu, mekanisme upsell VIP gentleman, algoritma alokasi trafik adil (*anti-sepi* host), serta checklist deployment VPS produksi telah **diaudit, dikerjakan, dan difinalisasi dengan status 100% Siap Produksi**.
