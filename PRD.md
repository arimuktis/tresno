# 📋 Product Requirements Document (PRD)

## Project: TRESNO (`id.tresno.app`)
**Subtitle:** Platform 1-on-1 Random Video Match & Virtual Gifting Berbasis Komunitas Lokal Indonesia  
**Author:** Solo Founder / Core Development Team  
**Status:** Approved for Production & Closed Beta Release  
**Target Market:** Indonesia (Android-First, Mobile-First, Usia 18–35 Tahun)  
**Dokumen Terkait:** [PLAN.md](file:///Users/jangkungari/Desktop/tigo/tresno/PLAN.md), [README.md](file:///Users/jangkungari/Desktop/tigo/tresno/README.md), [README_DOCKER_VPS.md](file:///Users/jangkungari/Desktop/tigo/tresno/README_DOCKER_VPS.md)

---

## 1. Executive Summary & Visi Produk

**Tresno** adalah aplikasi pencocokan video 1-on-1 acak dan jejaring sosial langsung yang dirancang khusus untuk pasar Indonesia dengan pendekatan **Lean, High-Trust, Fair-Economy, dan Growth-First**.

### 1.1 Latar Belakang Masalah (Problem Statement)
1. **Tingginya Potongan Platform Raksasa (50%–70%):** Aplikasi video chat global (seperti Bigo, Chamet, dan Tigo) membebankan potongan komisi sangat besar kepada host wanita. Akibatnya, talent kesulitan mendapatkan pendapatan yang layak dan mudah berpindah platform.
2. **Menjamurnya Bot & Video Looping Palsu:** Banyak aplikasi video chat di Indonesia mengecoh pengguna pria dengan video rekaman berulang (*recorded bot streams*) yang langsung menghabiskan koin tanpa interaksi manusia asli.
3. **Hambatan Pembayaran Pengguna (No Credit Card):** Sebagian besar pengguna muda di Indonesia tidak memiliki kartu kredit atau Google Play saldo, melainkan mengandalkan dompet digital lokal (QRIS, DANA, GoPay, OVO).
4. **Batas Pencairan Host yang Sangat Tinggi:** Platform global sering menetapkan batas penarikan puluhan ribu diamond yang baru dapat dicairkan setelah berbulan-bulan.

### 1.2 Solusi Nilai Tresno (Value Proposition)
- **Bagi Hasil Tertinggi di Industri (70%–75% untuk Host):** Platform hanya memungut margin operasional tipis (~20%), mengalokasikan 70%–75% pendapatan koin langsung ke saldo host wanita.
- **Pencairan Cepat & Terjangkau (Daily Cashout):** Batas minimal pencairan ditetapkan hanya **2.000 Poin (Rp 200.000)** langsung ke DANA, GoPay, atau rekening bank lokal (BCA/Mandiri/BRI).
- **Anti-Bot & Verifikasi Manusia Nyata:** Hanya pengguna terverifikasi dan host liveness-certified yang dapat online di antrean video.
- **Top-up Mikro QRIS Native:** Pembelian koin mulai Rp 10.000 via QRIS tanpa biaya kartu kredit.
- **20 Detik Pertama Gratis (Trial Period):** Menghilangkan rasa takut koin terbuang sia-sia jika lawan bicara tidak cocok.
- **Chat Billing Tigo-Grade:** Biaya 10 koin inisiasi chat pria ke host wanita, gratis jika saling follow atau memiliki Kupon Chat; gratis bagi wanita; host wanita mendapatkan reward +0.1 poin tiap membalas chat.

---

## 2. Target Pengguna & Persona (User Personas)

### 2.1 Persona 1: Rian (26 Tahun) — Demand Side (Male Caller)
- **Profil:** Karyawan swasta di Jakarta, lajang, menggunakan smartphone Android kelas menengah.
- **Kebutuhan:** Mencari teman ngobrol santai selepas jam kerja untuk melepas penat dan mencari koneksi sosial baru.
- **Pain Points:** Kecewa dengan aplikasi kompetitor karena sering terkena tipu video bot rekaman dan biaya per menit yang mahal tanpa ada garansi trial.
- **Perilaku di Tresno:** Melakukan top-up mikro Rp 10.000 – Rp 25.000 via QRIS GoPay, memanfaatkan 20 detik gratis untuk menyapa, dan mengirim kado virtual mawar jika obrolan menyenangkan.

### 2.2 Persona 2: Dewi (22 Tahun) — Supply Side (Female Anchor / Host)
- **Profil:** Mahasiswi dan content creator di Bandung, aktif di media sosial, ramah dan komunikatif.
- **Kebutuhan:** Mendapatkan penghasilan tambahan mandiri yang aman, fleksibel, dan memiliki bagi hasil transparan.
- **Pain Points:** Platform live streaming lama memotong 60% pendapatannya dan gaji baru bisa ditarik sebulan sekali dengan syarat berbelit.
- **Perilaku di Tresno:** Mengaktifkan status online di jam sibuk (20:00 – 00:00 WIB), menerima panggilan video, mengunggah story harian, dan mencairkan uang ke akun DANA tiap kali mencapai 2.000 poin.

### 2.3 Persona 3: Budi (34 Tahun) — Agency Partner
- **Profil:** Pimpinan komunitas agensi live streaming di Surabaya dengan 15 talent binaan.
- **Kebutuhan:** Memastikan talent aktif mendapatkan penghasilan stabil dan agensi mendapatkan komisi 10% secara otomatis.
- **Perilaku di Tresno:** Membagikan kode referral agensi pada saat talent melakukan registrasi onboarding KYC Host.

---

## 3. Model Finansial & Unit Economics

### 3.1 Struktur Tarif Koin Pengguna
- **Denominasi Koin:** 1 Koin = Rp 100.
- **Tarif Panggilan Video:** 15 Koin per menit (**Rp 1.500 / menit**).
- **Durasi Gratis Awal:** 20 detik pertama per sesi pencocokan.
- **Biaya Inisiasi Chat Pria:** 10 Koin (Rp 1.000) untuk membuka obrolan pertama (kecuali saling follow atau memakai kupon).

### 3.2 Paket Top-Up Koin (QRIS Midtrans)
| Paket Koin | Harga (IDR) | Bonus Koin | Total Koin Didapat | Nilai Riil per Koin |
|---|---|---|---|:---:|
| **Starter** | Rp 10.000 | 0 | 100 Koin | Rp 100 |
| **Popular** | Rp 25.000 | 10 | 260 Koin | Rp 96 |
| **Best Value** | Rp 50.000 | 50 | 550 Koin | Rp 90 |
| **Whale Pack** | Rp 100.000 | 200 | 1.200 Koin | Rp 83 |

### 3.3 Alokasi Pendapatan per Menit Panggilan Video (Rp 1.500)
| Komponen Alokasi | Persentase | Nilai Riil / Menit | Peruntukan |
|---|---|---|---|
| **Bagi Hasil Host Wanita (Talent)** | **70% – 75%** | **Rp 1.050 – Rp 1.125** | Ditransfer ke saldo *Diamond Points* host (10 Poin per menit). |
| **Infrastruktur Video (Agora RTC)** | ~4% | ~Rp 60 | Biaya transmisi video streaming HD latensi rendah (setelah kuota 10.000 mnt gratis). |
| **Payment Gateway (Midtrans QRIS)** | 0.7% | ~Rp 10 | Biaya pemrosesan transaksi Bank Indonesia (MDR QRIS 0.7%). |
| **Margin Bersih Platform** | **~20%** | **~Rp 300 – Rp 380** | **Menutup sewa VPS Linux, database Supabase, domain SSL, dan laba operasional.** |

### 3.4 Aturan Konversi & Penarikan Dana Host (Withdrawal)
- **Nilai Tukar Poin Host:** 1 Diamond Point = **Rp 100**.
- **Ambang Batas Minimum Penarikan:** **2.000 Diamond Points (Rp 200.000)**.
- **Metode Pencairan:** DANA, GoPay, OVO, Bank BCA, Mandiri, BRI.
- **Waktu Proses:** Instan (maksimal 1x24 jam hari kerja).

---

## 4. Spesifikasi Kebutuhan Fungsional (Functional Requirements)

### FR-01: Autentikasi, Registrasi & Onboarding
- **FR-01.1 Login Email & Kata Sandi:** Form login modal dengan validasi format email, pencegahan password lemah, dan tombol intip sandi (*toggle eye*).
- **FR-01.2 Login Nomor HP & OTP:** Form input nomor ponsel Indonesia (+62) dengan pengiriman 6-digit kode OTP simulasi dan hitung mundur kirim ulang (*countdown timer* 60 detik).
- **FR-01.3 Mode Guest / Demo 1-Tap Login:** Tombol login instan untuk pengujian atau demonstrasi aplikasi tanpa perlu memasukkan kredensial manual.
- **FR-01.4 Wizard Onboarding 3 Tahap:**
  - *Tahap 1 (Gender & Role):* Pemilihan identitas Pria (Caller) vs Host Wanita (Anchor).
  - *Tahap 2 (Profil & Data Diri):* Preset avatar ala Tigo, generator nama panggilan unik khas Indonesia (acak nama otomatis), tahun lahir (validasi 18+), dan pilihan kota domisili.
  - *Tahap 3 (Sertifikasi Goddess / KYC Host):* Khusus wanita; verifikasi live selfie, tipe pendaftaran (Agensi dengan kode khusus vs Independen), tag kepribadian, dan bio perkenalan.
- **FR-01.5 Kepatuhan Hukum:** Tautan dan modal interaktif untuk Ketentuan Layanan (*Terms of Service*) dan Kebijakan Privasi (*Privacy Policy*).

### FR-02: Sistem Pencocokan Video 1-on-1 (Matchmaking & Call Engine)
- **FR-02.1 Radar Matchmaking:** Animasi radar visual dengan efek pulsing cahaya saat mencari lawan bicara.
- **FR-02.2 Filter Gender:** Opsi pencarian acak gratis atau pemilihan preferensi gender wanita (biaya 3 koin).
- **FR-02.3 20 Detik Free Trial:** Sambungan video dibuka selama 20 detik pertama secara gratis sebelum billing koin dimulai.
- **FR-02.4 Agora Dynamic Token Exchange:** Server menerbitkan token RTC berdurasi pendek yang diperpanjang secara dinamis setiap interval 60 detik.
- **FR-02.5 Heartbeat & Billing Anti-Bocor:**
  - WebSocket bertukar sinyal heartbeat setiap 5 detik (toleransi timeout 15 detik).
  - Fungsi SQL atomic `deduct_call_coins()` dengan mekanisme *Row-Level Lock* (`SELECT ... FOR UPDATE`).
  - Pemotongan saldo dilakukan di awal interval (*Pre-Authorization Hold*). Jika koin kurang dari 15, server seketika memutus token Agora.
- **FR-02.6 Kontrol Panggilan Interaktif:** Tombol mute mikrofon, beralih kamera depan/belakang, efek filter kecantikan (Beauty Filter), dan laci pengiriman virtual gift (Mawar, Cokelat, Cincin Berlian).

### FR-03: Sistem Obrolan Chat & Ekonomi Percakapan Tigo-Grade
- **FR-03.1 Biaya Awal Chat (Initial Chat Fee):** Obrolan yang diinisiasi oleh pria ke host wanita memotong **10 koin** untuk membuka sesi obrolan pertama kali.
- **FR-03.2 Pembebasan Biaya Chat (Free Chat Rules):**
  - **Saling Follow (Mutual Friends):** Jika kedua belah pihak saling mengikuti, inisiasi chat 100% gratis.
  - **Kupon Chat:** Jika pengguna memiliki kupon obrolan, kupon terpotong 1 tiket dan koin tetap utuh.
  - **Inisiasi Host Wanita:** Jika host wanita yang memulai chat ke pengguna pria, obrolan selalu gratis.
- **FR-03.3 Hadiah Balas Chat Host:** Host wanita mendapatkan reward **+0.1 Diamond Point** setiap kali membalas pesan pengguna.
- **FR-03.4 Saluran Resmi Sistem (Official System Channel):** Sesi chat sistem khusus dengan badge emas resmi dan pesan sambutan selamat datang.
- **FR-03.5 Divider Waktu & Tanggal:**
  - Penanda jam dan menit otomatis jika percakapan memiliki jeda > 5 menit.
  - Garis pemisah tanggal (misal: "Hari ini", "Kemarin", atau format tanggal lengkap) jika obrolan berada di tanggal berbeda.
- **FR-03.6 Optimasi Jaringan (Read Receipt Batching):** Pengiriman tanda pesan terbaca (*read receipt*) dibundel via batcher debouncing untuk menghemat lalu lintas socket.

### FR-04: Story Feeds 24 Jam Ephemeral
- **FR-04.1 Story Bar:** Baris horizontal di tab Destiny/Match yang menampilkan avatar lingkaran dengan bingkai status story baru (*unseen badge*).
- **FR-04.2 Story Viewer Fullscreen:** Tampilan media layar penuh ala Instagram/Tigo dengan segmented progress bar berdurasi 5 detik per segmen dan fitur tahan layar (*press-to-pause*).
- **FR-04.3 Dukungan Video & Foto:** Mendukung video vertikal (MP4) dan foto beresolusi tinggi.
- **FR-04.4 Penyimpanan 50GB Supabase & Pembersihan 24 Jam:** Worker background otomatis menghapus media yang telah kedaluwarsa lebih dari 24 jam.
- **FR-04.5 Interaksi Langsung dari Story:** Pengguna dapat menyukai story (like), mengirim balasan teks langsung ke ruang chat, atau langsung memanggil video call 1-on-1 dengan host pembuat story.

### FR-05: Pusat Misi & Hadiah (Task Center)
- **FR-05.1 Misi Harian (Daily Check-In):** Klaim koin gratis dan kupon obrolan harian dengan penambahan berjenjang.
- **FR-05.2 Misi Pemula (Novice Tasks):** Hadiah sambutan untuk penyelesaian profil pertama kali, panggilan perdana, dan mengikuti 3 host favorit.
- **FR-05.3 Status Aset Terpadu:** Pita aset di bagian atas modal yang menampilkan saldo Koin, saldo Kupon Chat, dan saldo Poin Host secara langsung.

### FR-06: Dompet & Sistem Pembayaran (Wallet & Cashout)
- **FR-06.1 Top-Up QRIS Dinamis:** Pembuatan transaksi QRIS Midtrans dengan simulasi sukses instan di mode development/sandbox.
- **FR-06.2 Mutasi Transaksi (Double-Entry Ledger):** Seluruh debit koin dan kredit poin dicatat dalam tabel `coin_transactions` beserta saldo sebelum dan sesudah.
- **FR-06.3 Penarikan Dana Host (Withdrawal Modal):** Validasi syarat saldo minimal 2.000 poin, input nama pemilik rekening/nomor e-wallet, dan pembuatan tiket pencairan.

### FR-07: Keamanan, Sensor Privasi & DRM
- **FR-07.1 Call DRM Shield:** Deteksi perekaman layar dan screenshot dengan penutup sensor instan (`CallDrmShield`).
- **FR-07.2 Sensor Awal Panggilan (3-Second Blur):** Layar video diberi efek blur/hitam selama 3 detik pertama sebelum terbuka penuh untuk memastikan kenyamanan pengguna.
- **FR-07.3 One-Tap Report & Block:** Tombol sekali klik di dalam ruang panggilan untuk memblokir akun pelaku pelecehan atau konten tidak senonoh.

### FR-08: Desain Antarmuka, Tema & Animasi Navigasi Native
- **FR-08.1 Glassmorphism & Visual Elegan:** Menggunakan kartu tembus pandang bergradien halus dan kontras warna modern.
- **FR-08.2 Mode Tema Fleksibel:** Dark Mode (default malam), Light Mode (siang hari), dan OLED Pure Black (hemat baterai layar AMOLED).
- **FR-08.3 Pilihan Aksen Warna:** 4 pilihan tema warna personal: Ruby Rose, Emerald Mint, Sapphire Ocean, dan Amethyst Orchid.
- **FR-08.4 Standar Transisi Navigasi:**
  - *Horizontal Slide (Kanan ➔ Kiri):* Detail Chat (`ChatRoomModal`), Wizard Onboarding (Step 1 ➔ 2 ➔ 3), dan Phone Login ke OTP.
  - *Vertical Slide-Up (Bottom Drawer Sheet):* Modal Topup QRIS, Pusat Misi Hadiah, Pemutar Story 24 Jam, dan DatePicker.
  - *Non-Slide (Instant / Center Scale):* Bottom Navigation Dock, Dialog Konfirmasi Peringatan, dan Overlay Keamanan DRM.

### FR-09: Internasionalisasi (i18n)
- **FR-09.1 Dukungan Dwi-Bahasa Penuh:** Bahasa Indonesia (`id`) dan English (`en`) dengan 100% keselarasan kunci (381+ keys).
- **FR-09.2 Switcher Cepat:** Pengguna dapat mengganti bahasa kapan saja melalui modal pemilih tema & bahasa.

### FR-10: Detektor i18n & Missing Translation Keys
- **FR-10.1 Static Linter CLI (`scripts/detect_i18n_issues.ts`):** Memindai keselarasan key antara `id.ts` dan `en.ts` serta mendeteksi teks hardcoded pada seluruh elemen JSX `<Text>` dan props `placeholder`, `title`, `label`.
- **FR-10.2 Runtime Missing Key Registry & Visual Highlighter:** Pencatatan otomatis runtime key yang tidak ditemukan, emisi warning console dev, dan mode visual debug highlight `⚠️[missing:key]` yang dapat diaktifkan di menu pengaturan.

### FR-11: Sistem Deep Link & Notification Routing Terpadu
- **FR-11.1 Skema URL Kustom & Universal Link:** Mendukung `tresno://<route>` dan web path/hash untuk navigasi langsung ke Destiny (`?filter=...`), Chat Room (`chat/:id`), Anchor Call (`anchor/:id`), Topup QRIS (`topup`), Missions (`missions`), Stories (`story/:id`), dan Admin CMS (`admin`).
- **FR-11.2 Integrasi Klik Notifikasi:** Banner notifikasi in-app dan push notification otomatis mengarahkan pengguna ke layar/modal target melalui properti `actionUrl`.
- **FR-11.3 Simulator Deep Link:** Panel dev simulator interaktif untuk pengujian cepat rute deep link dan simulasi pengiriman notifikasi dengan actionUrl.

### FR-12: Pengalaman Interaktif Pull-to-Refresh
- **FR-12.1 Pull-to-Refresh Tab Destiny:** Memasang `RefreshControl` dengan warna aksen tema untuk mengocok rotasi algoritma host (*Anti-Sepi*), sinkronisasi kehadiran live tri-state, pembaruan cerita, feedback suara, dan toast status.
- **FR-12.2 Pull-to-Refresh Tab Pesan:** Sinkronisasi instan daftar percakapan dan badge belum terbaca.

---

## 5. Persyaratan Non-Fungsional (Non-Functional Requirements)

| Kategori | Parameter | Target Spesifikasi |
|---|---|---|
| **Performa & Latensi** | Latensi Video WebRTC (Agora) | < 200 ms antar kota di Indonesia (Jakarta, Surabaya, Medan, Makassar). |
| | Latensi Sinyal WebSocket | < 50 ms untuk pertukaran status panggilan dan chat. |
| | Frame Rate Animasi | Konsisten 60 FPS di ponsel Android entry-level via thread decoupling. |
| **Keamanan Data** | Enkripsi Media Stream | Enkripsi end-to-end standar WebRTC DTLS/SRTP via Agora RTC. |
| | Enkripsi Database | PostgreSQL Row-Level Security (RLS) aktif pada seluruh tabel profil & dompet. |
| | Kunci Rahasia | Kunci `SUPABASE_SERVICE_ROLE_KEY` dan `AGORA_APP_CERTIFICATE` terisolasi di server. |
| **Skalabilitas** | Kapasitas Server | Arsitektur stateless Fastify mampu menangani > 5.000 koneksi WebSocket konkuren per instans VPS 2GB RAM. |
| | Antrean Matchmaking | Redis In-Memory Set mampu memproses > 1.000 pencocokan gender per detik. |
| **Ketersediaan (Availability)** | Uptime Target | 99.9% uptime dengan Docker restart policies `unless-stopped`. |
| **Efisiensi Biaya (OpEx)** | Biaya Operasional Awal | **~Rp 65.000 / bulan** memanfaatkan free-tier Agora (10.000 mnt/bln) dan Supabase (50GB). |

---

## 6. Kepatuhan Regulasi & Aspek Legal Indonesia

1. **Penyelenggara Sistem Elektronik (PSE Kominfo):**
   - Sebelum peluncuran ke publik umum di Google Play Store, aplikasi wajib terdaftar resmi sebagai PSE Privat di Kementerian Kominfo RI.
2. **Kepatuhan Pembatasan Usia (Age Gating 18+):**
   - Pengguna diwajibkan mengonfirmasi usia minimal 18 tahun saat pendaftaran onboarding.
3. **Standar Keamanan Transaksi Finansial (Bank Indonesia & QRIS):**
   - Seluruh transaksi pembayaran koin diproses melalui payment gateway berlisensi Bank Indonesia (Midtrans).
   - Saldo rekening operasional aplikasi dipisahkan dari saldo pencairan host (*segregated accounts*).
4. **Kebijakan Konten Pornografi & Asusila (UU ITE):**
   - Pelanggaran visual pornografi langsung dikenakan sanksi blokir permanen device ID dan penahanan saldo.
   - Deteksi proaktif menggunakan sensor blur 3 detik awal dan moderasi laporan pengguna.

---

## 7. Matriks Verifikasi Fitur & Kriteria Penerimaan (Acceptance Criteria)

| Modul Fitur | Status Implementasi | Kriteria Kelulusan (Acceptance Criteria) |
|---|:---:|---|
| **Auth & Onboarding** | ✅ **Selesai** | Login Email, Phone OTP, dan Guest berfungsi. Wizard 3 langkah berjalan dengan animasi slide horizontal. |
| **Video Matchmaking** | ✅ **Selesai** | Radar match berputar; token Agora terbit; 20 detik gratis berjalan; billing 15 koin per 60s terpotong di DB. |
| **Chat Room & Tigo Economy**| ✅ **Selesai** | Chat pria memotong 10 koin awal jika belum follow; gratis jika saling follow atau punya kupon; host dapat +0.1 poin saat balas; slide animation dari kanan ke kiri mulus. |
| **24-Hour Ephemeral Stories**| ✅ **Selesai** | Story bar render unseen avatar; story viewer slide vertikal fullscreen; tap hold pause bekerja; video loop berjalan; auto-purge 24h aktif. |
| **Missions Center** | ✅ **Selesai** | Modal slide-up dari bawah; klaim hadiah harian & misi pemula menambah saldo koin/kupon seketika. |
| **Top-up QRIS & Dompet** | ✅ **Selesai** | Pilihan paket koin; simulasi QRIS berhasil; pencatatan double-entry ledger konsisten. |
| **Penarikan Dana Host** | ✅ **Selesai** | Tombol withdraw memvalidasi minimum 2.000 poin; formulir bank/e-wallet tersimpan rapi. |
| **Desain, Tema & i18n** | ✅ **Selesai** | 3 mode tema & 4 palet aksen berganti instan; 381+ string terjemahan ID & EN 100% selaras tanpa teks hardcoded. |
| **i18n & Missing Detector**| ✅ **Selesai** | Static linter CLI (`i18n:check`) memindai parity & teks hardcoded JSX; runtime missing key registry & visual highlight badge aktif. |
| **Deep Link & Notification**| ✅ **Selesai** | Skema URL `tresno://` & web hash parsing aktif; klik banner notifikasi otomatis routing via actionUrl; simulator tester terpasang. |
| **Pull-to-Refresh Reaktif**| ✅ **Selesai** | RefreshControl terpasang di Destiny & Messages Tab; memicu kocok algoritma Anti-Sepi, update kehadiran live, cerita, dan audio/toast feedback. |
| **DRM & Sensor Privasi** | ✅ **Selesai** | Sensor blur 3 detik aktif saat call mulai; deteksi perekaman layar menutup tampilan call. |
| **Kompilasi & Web Build** | ✅ **Selesai** | `tsc --noEmit` menghasilkan 0 error; Vite web build minified < 800ms. |

---

## 8. Rencana Kerja Peluncuran (Launch Roadmap)

- [x] **Fase 1:** Setup Monorepo Turborepo + pnpm di `/Users/jangkungari/Desktop/tigo/tresno`.
- [x] **Fase 2:** Migrasi database Supabase & fungsi atomic SQL `deduct_call_coins()` anti-bocor.
- [x] **Fase 3:** Kontrak data TypeScript terpusat (`@tresno/shared`).
- [x] **Fase 4:** Backend Fastify WebSocket signaling, billing loop, dan token Agora (`@tresno/server`).
- [x] **Fase 5:** Frontend React Native, sistem tema, i18n, atomic UI, dan Vite Web Preview (`@tresno/mobile`).
- [x] **Fase 6:** Implementasi fitur ekonomi Tigo (chat 10 koin, kupon obrolan, mutual follow, reward balas chat +0.1 poin, penarikan 2.000 poin).
- [x] **Fase 7:** Standardisasi animasi navigasi (slide horizontal master-detail & vertical drawer sheet).
- [x] **Fase 8:** Konfigurasi Docker Compose & 1-Click Deployment Script VPS (`deploy.sh`).
- [ ] **Fase 9:** Pengisian live credential (Agora App ID produksi, Midtrans Merchant Key live, Supabase instance produksi).
- [ ] **Fase 10:** Rekrutmen 5–10 host wanita awal melalui mitra agensi lokal dan uji coba panggilan langsung (*closed dogfooding*).
- [ ] **Fase 11:** Rilis file APK closed-beta untuk pengguna Android Indonesia.
