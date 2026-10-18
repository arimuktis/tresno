# Tresno App - Master Rules & Engineering Guidelines (`RULES.md`)

Dokumen ini merangkum seluruh aturan, konvensi teknis, standar UI/UX, dan arsitektur sistem yang telah disepakati dan diimplementasikan pada proyek **Tresno** (Aplikasi Video Match & Live Social 1-on-1). Seluruh kontributor, developer, dan AI agent **wajib** mematuhi aturan ini dalam setiap iterasi pengembangan.

---

## 1. Arsitektur Proyek & Monorepo

1. **Struktur Monorepo (pnpm workspace & Turbo)**:
   - `apps/mobile`: Aplikasi React Native / React Native Web (Vite).
   - `apps/server`: Backend Fastify + WebSocket + Redis + Agora RTC Token Generator.
   - `packages/shared`: Skema Zod, aturan bisnis (`MATCH_RULES`), dan tipe data bersama.
2. **Dependensi & Workspace**:
   - Selalu gunakan perintah `pnpm --filter <nama-package>` untuk eksekusi skrip atau instalasi package.
   - Hindari dependensi sirkular antara `apps/mobile` dan `apps/server`. Semua kontrak data bersama harus dideklarasikan di `@tresno/shared`.
3. **Zero Lint & Compilation Errors**:
   - Setiap perubahan kode **wajib** lolos pemeriksaan tipe:
     ```bash
     pnpm --filter @tresno/mobile exec tsc --noEmit
     ```
   - Skrip produksi Vite build harus selalu sukses:
     ```bash
     pnpm --filter @tresno/mobile build:web
     ```

---

## 2. Standar Desain UI/UX & Ego UI System

1. **Asetetika Premium & Modern (Ego Aesthetic)**:
   - Wajib menggunakan tema gelap elegan (*Sleek Dark Mode*) dengan glassmorphism (`surfaceGlass`, `surfaceCard`), border tipis bergradasi halus (*hairline borders*), dan saturasi warna yang harmonis.
   - **Warna Aksen Utama**:
     - `primary`: `#FF2E63` (Hot Pink / Magenta Tresno)
     - `primaryGlow`: `rgba(255, 46, 99, 0.15)`
     - `gold`: `#F59E0B` / `#FFB800` (VIP, Koin, Poin Host)
     - `success`: `#00D19D` / `#10B981` (Online status, Mutual friend)
   - Hindari warna mentah murni (*pure red/green/blue*). Gunakan token terpusat dari `useThemeStore`.
2. **Konsistensi Navigasi Bawah (Bottom Navigation Bar)**:
   - Tidak boleh ada lompatan tata letak (*zero layout jitter*) saat berpindah tab.
   - Ikon tab wajib konsisten menggunakan Lucide:
     - Match: `Flame`
     - Destiny: `Sparkles`
     - Pesan: `MessageCircle`
     - Profil: `User`
   - **Aturan Rendering Ikon**:
     - *Active*: `fill={colors.primary}`, `color={colors.primary}`, ukuran 24px, label `fontWeight: '700'`.
     - *Inactive*: `fill="none"`, `color={colors.textSecondary}`, ukuran 24px, label `fontWeight: '500'`.
3. **Atomic Reusable Components**:
   - Komponen interaktif yang berulang (misal Filter Chip, Tombol Aksi) wajib dibungkus dalam komponen atomik reaktif (`ButtonChip.tsx`, `FilterChipBar.tsx`, `Avatar.tsx`).
   - Ukuran, padding, dan status terfokus harus seragam di seluruh tab.
4. **Ergonomi ScrollView**:
   - Seluruh layar scroll wajib memiliki padding bawah aman (`paddingBottom: 40` ke atas) agar konten terbawah tidak tertutup oleh BottomNavBar atau floating action bar.
   - Sembunyikan scrollbar default browser (`showsVerticalScrollIndicator={false}`).

---

## 3. Standar Pesan, Obrolan & Mekanisme Pin

1. **Mekanisme Pin Obrolan (Maksimal 20 Pin)**:
   - Batas maksimal obrolan yang dapat disematkan ke atas adalah **tepat 20 obrolan** (`MAX_PINNED_CHATS = 20`).
   - Jika pengguna sudah memiliki 20 obrolan tersemat dan mencoba menyematkan obrolan ke-21:
     - **Wajib ditolak secara tegas** (`return false`).
     - Tampilkan notifikasi peringatan: *"Maksimal 20 obrolan yang dapat disematkan."*
   - Status pin wajib persisten di `localStorage` (`tresno_pinned_chats`).
2. **Pengurutan Percakapan (`getRecentConversations`)**:
   - Obrolan yang disematkan (`isPinned: true`) wajib selalu berada di posisi paling atas daftar.
   - Di antara sesama obrolan yang disematkan (atau sesama tidak disematkan), urutkan berdasarkan aktivitas pesan terbaru (*timestamp descending*).
   - Obrolan resmi sistem (`anchor_system`) dipisahkan dalam seksi notifikasi tersendiri di paling atas.
3. **Indikator Visual Pin**:
   - Setiap baris obrolan yang disematkan wajib memiliki badge ikon `Pin` kecil di samping waktu pesan dan latar belakang baris beraksen halus (`rgba(255, 46, 99, 0.05)`).
   - Header daftar obrolan wajib menampilkan counter pin live: `N/20 DISEMATKAN`.
4. **Mekanisme Klik-Tahan (*Click & Hold / Long-Press*)**:
   - **Pada Daftar Obrolan (`MessageItemRow`)**:
     - Menahan mouse / touch selama 320ms atau klik kanan (`onContextMenu`) membuka Action Bottom Sheet dengan opsi:
       - 📌 *Sematkan Obrolan / Lepas Sematan* (beserta counter `N/20`)
       - 📞 *Panggilan Video Langsung*
       - 💬 *Buka Obrolan Penuh*
       - 🗑️ *Hapus Percakapan*
       - ✕ *Batal*
   - **Pada Gelembung Pesan Ruang Chat (`ChatBubble`)**:
     - Menahan pesan chat membuka Menu Aksi Pesan ala Telegram/WhatsApp:
       - Floating Emoji Reactions: ❤️ 👍 😂 🔥 👏 😮
       - 📋 *Salin Teks* (menyalin ke clipboard)
       - ↩️ *Balas Pesan* (memunculkan banner Quote Reply di atas input bar)
       - 📌 *Sematkan di Ruang Chat* (memasang banner sematan di atas chat room)
       - 🗑️ *Hapus Pesan*
       - ✕ *Batal*

---

## 4. Kebijakan Billing, Koin & Placeholder Hygiene

1. **Larangan Keras Tulisan Harga di Placeholder Input**:
   - **DILARANG KERAS** mencantumkan tulisan *"5 Koin"*, *"10 Koin"*, atau biaya lainnya di dalam placeholder input text obrolan.
   - Placeholder input obrolan wajib bersih dan ramah pengguna:
     - Tamu/User: `"Ketik pesan..."`
     - Host: `"Ketik pesan balasan..."`
     - Sistem resmi: `"Pesan sistem (Hanya Baca)"`
2. **Pusat Informasi Biaya (Notice Banner)**:
   - Seluruh informasi tarif wajib dipusatkan secara eksklusif pada **Notice Banner** di bagian atas ruang chat (`chatBilling.bannerInitialCost`, dsb.) dan dialog modal topup saat saldo tidak mencukupi.
3. **Aturan Billing Obrolan**:
   - Obrolan dengan host: Pesan pertama dikenakan biaya 10 Koin (Initial Chat unlock). Setelah terbuka, seluruh pesan berikutnya gratis sepuasnya.
   - **Pengecualian Gratis**:
     - Host cewek mengirim/membalas pesan: **100% Gratis** dan mendapatkan +2 Points per balasan.
     - Pertemanan saling follow (*Mutual Friends*): **100% Gratis**.
     - Memiliki Kupon Chat (*Chat Coupon*): Membuka chat tanpa memotong koin.
     - Saluran pengumuman resmi sistem: **100% Gratis**.

---

## 5. Fitur Matchmaking & Panggilan Video

1. **Aturan Waktu Gratis (Free Seconds)**:
   - Fitur **20 detik gratis** HANYA berlaku untuk matchmaking acak 1-on-1 di tab Match.
   - Panggilan video langsung (*Direct Call / Callback*) dari tab Pesan atau tab Destiny **TIDAK MEMILIKI** mekanisme gratis (langsung berlaku tarif 60 Koin/menit).
2. **Efek Radar Layar Penuh (Match Pulse)**:
   - Animasi radar pencarian pada `MatchTab.tsx` wajib memenuhi seluruh layar (*scale 7.8 ~ 900px*), terdiri dari 4 gelombang ripple dinamis, rotating scanner beam 360°, dan 5 cincin panduan konsentris.
   - Elemen interaktif (tombol cancel, filter gender, switcher mode host) harus memiliki `zIndex` lebih tinggi agar tidak terhalang animasi radar.

---

## 6. Standar Suara & Audio Sintetis (Sound Engine)

1. **Zero External Audio Assets**:
   - Seluruh notifikasi suara (ringtone panggilan masuk, denting pesan baru, efek kirim hadiah, match lock-on, promo chime, koin jatuh) wajib dihasilkan menggunakan Web Audio API Synthesizer terpadu di [soundService.ts](file:///Users/jangkungari/Desktop/tigo/tresno/apps/mobile/src/shared/services/soundService.ts).
   - Hindari ketergantungan pada file eksternal `.mp3` atau `.wav` untuk memastikan latensi 0ms dan 100% keandalan offline.

---

## 7. Lokalisasi & Internasionalisasi (i18n)

1. **Wajib Terdaftar di Schema**:
   - Seluruh teks antarmuka pengguna **wajib** terdaftar pada schema terpusat di [src/i18n/types.ts](file:///Users/jangkungari/Desktop/tigo/tresno/apps/mobile/src/i18n/types.ts).
   - Setiap penambahan key baru harus didefinisikan secara simetris di kedua berkas kamus:
     - Bahasa Indonesia: [src/i18n/locales/id.ts](file:///Users/jangkungari/Desktop/tigo/tresno/apps/mobile/src/i18n/locales/id.ts)
     - Bahasa Inggris: [src/i18n/locales/en.ts](file:///Users/jangkungari/Desktop/tigo/tresno/apps/mobile/src/i18n/locales/en.ts)
2. **Larangan Teks Hardcoded**:
   - Tidak diperkenankan menulis teks antarmuka langsung (*hardcoded string*) di dalam komponen TSX jika teks tersebut ditujukan untuk dilihat oleh pengguna akhir. Gunakan fungsi `t('path.key')`.

---

## 8. Standar Keamanan & Fitur Admin (Stealth Surveillance)

1. **Kerahasiaan Mode Pengawasan**:
   - Pengawasan admin (*wiretap call* dan inspeksi chatroom) wajib berjalan dalam mode siluman (*stealth mode*):
     - UID Agora admin di-mute secara default (*silent subscriber*).
     - Tidak mengirim event *user-joined* atau broadcast kehadiran admin kepada user & host yang sedang melakukan panggilan.
   - Akses pengawasan dibatasi dengan verifikasi token admin bertingkat (RBAC).

---

---

## 9. Kebijakan Moderasi Konten (SARA & Pornografi) serta Foto Album

1. **Mekanisme Reviewing Konten (Story & Foto Album)**:
   - Seluruh postingan cerita (Story 24 Jam) dan foto album pengguna **wajib** melalui mekanisme peninjauan moderasi otomatis terhadap dua kategori pelanggaran utama:
     - **Deteksi SARA**: Ujaran kebencian, diskriminasi suku/ras/etnis (Chindo, Papua, Jawa, dsb), penistaan agama, pelecehan tempat ibadah, dan provokasi antargolongan.
     - **Deteksi Pornografi**: Ketelanjangan (*nudity*), istilah anatomi genital vulgar, tawaran prostitusi/Open BO, VCS eksplisit, dan file berindikasi pornografi.
   - Moderasi berjalan dua lapis:
     - **Client-Side**: [moderationService.ts](file:///Users/jangkungari/Desktop/tigo/tresno/apps/mobile/src/shared/services/moderationService.ts) untuk inspeksi seketika sebelum pengunggahan.
     - **Server-Side**: [moderationChecker.ts](file:///Users/jangkungari/Desktop/tigo/tresno/apps/server/src/moderation/moderationChecker.ts) untuk memvalidasi endpoint `/api/stories/upload` (menolak via HTTP 422 jika melanggar).
   - Status peninjauan:
     - `approved`: Lolos moderasi dan dapat ditayangkan untuk publik.
     - `pending_review`: Konten bernuansa sensitif sedang dalam antrean kurasi manual.
     - `rejected`: Ditolak karena melanggar pedoman komunitas, media diburamkan (*blur*), dan pengguna diberikan penjelasan alasan pelanggaran.

2. **Ketentuan Foto Album Profil (Maksimal 8 Foto)**:
   - Pengguna memiliki album foto profil yang dapat digeser / di-slide horizontal ([AlbumCarousel.tsx](file:///Users/jangkungari/Desktop/tigo/tresno/apps/mobile/src/features/album/components/AlbumCarousel.tsx)).
   - Batas maksimal foto album adalah **tepat 8 foto** (`MAX_ALBUM_PHOTOS = 8`).
   - Sistem wajib mencegah dan menolak pengunggahan foto ke-9 dengan pemberitahuan bahwa batas maksimal 8 foto telah tercapai.
   - Fitur album mencakup:
     - Indikator halaman slide (contoh: `1/8`, `2/8`).
     - Badge status moderasi pada masing-masing kartu slide foto.
     - Pemilihan foto sampul profil utama (*cover photo*).
     - Penampil layar penuh dengan navigasi geser / slide ([AlbumViewerModal.tsx](file:///Users/jangkungari/Desktop/tigo/tresno/apps/mobile/src/features/album/components/AlbumViewerModal.tsx)).

---

## 10. Standar Supabase OAuth 2.0 & Live Data (Realtime Streaming)

1. **Supabase OAuth 2.0 PKCE Flow**:
   - Seluruh integrasi autentikasi pihak ketiga (Google OAuth, Apple, Email Magic Link) menggunakan Supabase Auth dengan alur **PKCE (`flowType: 'pkce'`)** demi keamanan token tingkat peramban (*browser storage*) tanpa kebocoran hash fragment.
   - Konfigurasi klien Supabase ([supabaseClient.ts](file:///Users/jangkungari/Desktop/tigo/tresno/apps/mobile/src/shared/services/supabaseClient.ts)):
     - `autoRefreshToken: true` untuk pembaruan sesi token otomatis di latar belakang.
     - `detectSessionInUrl: true` untuk menangani redirect balik OAuth secara instan.
     - Mendukung pengalihan kredensial dinamis saat runtime (`updateSupabaseConfig`) dan fallback ramah demo tanpa crashing.
   - Penanganan callback OAuth terpusat di [authService.ts](file:///Users/jangkungari/Desktop/tigo/tresno/apps/mobile/src/features/auth/services/authService.ts) dan sinkronisasi store via [useAuthStore.ts](file:///Users/jangkungari/Desktop/tigo/tresno/apps/mobile/src/features/auth/stores/useAuthStore.ts) dengan pemetaan metadata Google (`full_name`, `avatar_url`, email) ke entitas `AuthUser`.

2. **Supabase Realtime Live Data Engine**:
   - Komunikasi data siaran langsung disalurkan melalui arsitektur multi-saluran terpadu di [supabaseRealtimeService.ts](file:///Users/jangkungari/Desktop/tigo/tresno/apps/mobile/src/shared/services/supabaseRealtimeService.ts):
     - Saluran Kehadiran Live (`tresno-presence`): Melacak status host & pengguna online secara real-time (`trackUserPresence`, `onPresenceChange`), disinkronkan ke badge live di tab Destiny.
     - Saluran Cerita 24 Jam Live (`tresno-live-stories`): Penyiaran (*broadcast*) cerita baru seketika ke seluruh klien aktif tanpa perlu polling ulang HTTP.
     - Saluran Obrolan Live (`tresno-live-chat`): Pengiriman dan penerimaan pesan obrolan instan secara peer-to-peer antar pengguna dengan latensi ultra rendah.
   - **Mode Hibrida Zero-Barrier (Demo & Production)**:
     - Jika pengguna/developer belum mengonfigurasi URL Supabase produksi, service secara otomatis beralih ke browser `BroadcastChannel` multi-tab, menjaga pengalaman testing realtime tetap 100% mulus.
     - Begitu kredensial Supabase dimasukkan, koneksi WebSocket murni (`wss://*.supabase.co/realtime/v1/websocket`) langsung mengambil alih tanpa reload aplikasi.
   - **Pusat Monitoring Realtime & Kredensial**:
     - Tersedia modal interaktif [SupabaseHubModal.tsx](file:///Users/jangkungari/Desktop/tigo/tresno/apps/mobile/src/shared/components/supabase/SupabaseHubModal.tsx) di tab Saya (Mine) untuk inspeksi status autentikasi, status kanal Realtime, latensi/ping, tombol uji broadcast live event, dan konfigurasi API keys.

---

## 11. Standar PostHog Telemetry, PgVector AI Engine, & Comprehensive Admin CMS

1. **PostHog Funnel Analytics & Dynamic Feature Flags**:
   - Pelacakan telemetry alur konversi bertingkat (*conversion funnel*):
     - `match_radar_started` -> `match_found` -> `free_trial_20s` -> `call_minute_billed` -> `gift_sent` -> `topup_success`.
   - Feature flags dinamis terkontrol di [posthogServerService.ts](file:///Users/jangkungari/Desktop/tigo/tresno/apps/server/src/posthog/posthogServerService.ts) dan [posthogService.ts](file:///Users/jangkungari/Desktop/tigo/tresno/apps/mobile/src/shared/services/posthogService.ts):
     - `pgvector-semantic-match`: Mengaktifkan pencocokan host berbasis embedding kosinus.
     - `ai-smart-icebreaker`: Menampilkan chip pembuka obrolan otomatis di chatroom.
     - `anti-churn-radar`: Booster dinamis untuk host yang standby lama.
     - `strict-sara-moderation`: Ambang batas otomatis penolakan konten SARA/pornografi.

2. **PgVector Embedding (384-Dimensi) & HNSW Indexing**:
   - Arsitektur vektor PostgreSQL dengan ekstensi `pgvector` ([06_pgvector_ai_knowledge.sql](file:///Users/jangkungari/Desktop/tigo/tresno/packages/supabase/migrations/06_pgvector_ai_knowledge.sql)):
     - Indeks berkecepatan tinggi: `USING hnsw (embedding vector_cosine_ops)`.
     - Tabel: `profile_embeddings`, `host_embeddings`, `moderation_vector_benchmarks`, dan `ai_knowledge_chunks`.
     - Operator kesamaan kosinus `<=>` untuk semantic host matchmaking dan pemindaian moderasi.
   - Layanan [pgvectorService.ts](file:///Users/jangkungari/Desktop/tigo/tresno/apps/server/src/ai/pgvectorService.ts) menyediakan normalisasi L2 dan in-memory vector fallback untuk stabilitas tanpa ketergantungan eksternal saat mode demo.

3. **Admin CMS Lengkap & Komprehensif ([AdminCmsModal.tsx](file:///Users/jangkungari/Desktop/tigo/tresno/apps/mobile/src/features/admin/components/AdminCmsModal.tsx))**:
   - Modul CMS terpadu:
     - **Ringkasan**: Gross revenue, net margin, pending payout, active calls.
     - **PostHog**: Live event stream, 6-step conversion funnel, feature flags switcher & rollout %.
     - **PgVector & AI**: Status indeks HNSW, live semantic similarity search explorer, 1-klik re-index.
     - **Users & Hosts**: CRM pengguna, inspeksi album 8 foto profil, penyesuaian saldo koin, toggle ban & KYC.
     - **Moderasi**: Antrean review story & album dengan AI confidence gauge (SARA %, Pornografi %, Cleanliness %).
     - **Penarikan**: Review penarikan rekening bank (BCA, Mandiri, DANA, GoPay) dengan opsi setujui/tolak.
     - **Spender**: Pemantau top spender sultan dan metode pembayaran QRIS/VA.
     - **Wiretap & Spy**: Pengawasan siluman panggilan video Agora dan inspeksi chatroom.
     - **Bagi Hasil & Security**: Kebijakan anti-fraud, anti-root, dan emulator detection.

---

## 13. Standar Mobile Frame Overlay Containment & Modal Layout

1. **Batas Frame Mockup HP Web (`.phone-frame`)**:
   - Dimensi standar mockup mobile pada desktop: lebar maksimal **414px** dan tinggi maksimal **896px** dengan radius sudut **40px**.
   - **Containing Block CSS (`transform: translateZ(0)`)**:
     - `.phone-frame` di [index.html](file:///Users/jangkungari/Desktop/tigo/tresno/apps/mobile/index.html) **wajib** memiliki `transform: translateZ(0)` dan `overflow: hidden`.
     - Hal ini memastikan seluruh elemen dengan `position: fixed` dari React Native Web (`Modal`, `ModalContent`, backdrop) terkunci di dalam batas mockup HP, bukan meluas ke seluruh layar desktop (1440px+).
   - **Redireksi Portal DOM ([main.web.tsx](file:///Users/jangkungari/Desktop/tigo/tresno/apps/mobile/src/main.web.tsx))**:
     - Elemen portal div yang dibuat oleh `ModalPortal` React Native Web diintersepsi dan otomatis diarahkan ke `#phone-modal-root` di dalam `.phone-frame`.
   - **CSS Fallback Containment**:
     - Elemen `body > div:not(.phone-frame)` dibatasi dengan `max-width: 414px; max-height: 896px; border-radius: 40px; overflow: hidden; position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%)`.

2. **Standar Dimensi & Anatomi Modal**:
   - **Centered Dialogs & Alert Card**:
     - `width: '92%'`
     - `maxWidth: 380` (Dilarang keras memakai `maxWidth: 440`, `500`, atau `520`)
     - `borderRadius: 24`
     - `alignSelf: 'center'`
   - **Bottom Sheet (Missions, Topup, Cashout, Chat Actions)**:
     - `width: '100%'`
     - `maxWidth: 414`
     - `borderTopLeftRadius: 28`
     - `borderTopRightRadius: 28`
     - `borderBottomLeftRadius: 0`
     - `borderBottomRightRadius: 0`
     - Padding sisi bawah rapat (*flush*) dengan bezel bawah HP.
   - **In-App Toast & Notifikasi Banner**:
     - `width: '100%'`
     - `maxWidth: 380` (terpusat dan tidak menabrak notch atau bezel samping).
   - **Dilarang Menggunakan Unstyled Browser Alert**:
     - Jangan memanggil dialog unstyled mentah bawaan browser yang meluber keluar frame. Gunakan `toast.info` / `toast.show` atau komponen atomik [Dialog.tsx](file:///Users/jangkungari/Desktop/tigo/tresno/apps/mobile/src/shared/components/molecules/Dialog.tsx).

---

## 14. Standar Indikator Kehadiran Live Data (Tri-State Live Presence System)

1. **Definisi Tiga Status Kehadiran (Tri-State Status)**:
   - **Hijau (`#00D26A` / Glow `rgba(0, 210, 106, 0.45)`) - `available`**:
     - Pengguna / Host sedang online dan **Tersedia (Available)** untuk menerima panggilan video atau obrolan.
     - Badge teks: `"ONLINE"` (`variant="success"`).
   - **Merah Pink (`#FF2E63` / Glow `rgba(255, 46, 99, 0.55)`) - `busy`**:
     - Pengguna / Host sedang **Sibuk dalam Panggilan (Sedang Call)** atau matching aktif.
     - Badge teks: `"SEDANG CALL"` (`variant="danger"`).
     - **Safety Guard**: Tombol panggil pada card atau chat room wajib diproteksi dari double-calling saat lawan bicara berstatus `busy`.
   - **Abu-abu (`#94A3B8` / Tanpa Glow) - `offline`**:
     - Pengguna / Host sedang tidak aktif / disconnect.
     - Badge teks: `"OFFLINE"` (`variant="neutral"`).

2. **Kewajiban Live Data (Real-Time Reactive)**:
   - Dilarang keras menaruh dot hijau statis tanpa binding data reaktif.
   - Seluruh status dikelola terpusat oleh [usePresenceStore.ts](file:///Users/jangkungari/Desktop/tigo/tresno/apps/mobile/src/shared/stores/usePresenceStore.ts).
   - **Sinkronisasi Multi-Tab & Jaringan**:
     - Web browser tersinkronisasi instan antar tab menggunakan `BroadcastChannel('tresno_presence_sync')`.
     - Terhubung dengan channel Supabase Realtime Presence (`tresno-presence`).
   - **Siklus Hidup Panggilan (Call Lifecycle)**:
     - Pada `useCallStore.ts`, saat panggilan tersambung (`matchFound`), status diri dan host otomatis berganti menjadi `'busy'`.
     - Saat panggilan berakhir (`endCall`), status otomatis dipulihkan menjadi `'available'`.

3. **Komponen yang Terintegrasi**:
   - [Avatar.tsx](file:///Users/jangkungari/Desktop/tigo/tresno/apps/mobile/src/shared/components/atoms/Avatar.tsx): Mengambil status dari `userId` atau `presenceStatus` dengan 3 warna dot berbeda.
   - [AnchorCard.tsx](file:///Users/jangkungari/Desktop/tigo/tresno/apps/mobile/src/shared/components/organisms/AnchorCard.tsx): Badge status live dan pencegahan panggilan saat host sibuk.
   - [DestinyTab.tsx](file:///Users/jangkungari/Desktop/tigo/tresno/apps/mobile/src/features/destiny/components/DestinyTab.tsx): Counter live host tersedia (Hijau) & sedang call (Pink) di header.
   - [ChatRoomModal.tsx](file:///Users/jangkungari/Desktop/tigo/tresno/apps/mobile/src/features/messages/components/ChatRoomModal.tsx): Header obrolan dengan dot live dan teks status dinamis.
   - [MessageItemRow.tsx](file:///Users/jangkungari/Desktop/tigo/tresno/apps/mobile/src/shared/components/organisms/MessageItemRow.tsx): Menampilkan dot live status pada avatar daftar percakapan.
   - [SupabaseHubModal.tsx](file:///Users/jangkungari/Desktop/tigo/tresno/apps/mobile/src/shared/components/supabase/SupabaseHubModal.tsx): Dashboard live presence status beserta tombol toggle simulasi reaktifitas langsung.

---

## 15. Checklist Sebelum Melakukan Commit / Rilis

- [ ] `pnpm --filter @tresno/mobile exec tsc --noEmit` lolos dengan status exit code 0.
- [ ] `pnpm --filter @tresno/mobile build:web` berhasil membuat bundle produksi.
- [ ] Indikator status kehadiran (Tri-State: Hijau=Available, Merah Pink=Sedang Call, Abu-abu=Offline) aktif dan menggunakan live data.
- [ ] Tombol panggil terproteksi saat host sedang sibuk dalam panggilan lain (`busy`).
- [ ] Semua modal, bottom sheet, dan dialog dialog terkunci rapi di dalam frame 414px tanpa overflow ke kiri/kanan.
- [ ] Centered dialog menggunakan `width: '92%', maxWidth: 380`.
- [ ] Bottom sheet menggunakan `maxWidth: 414` dengan sudut bawah 0 (flush).
- [ ] Batas maksimal 20 pin obrolan tidak terlampaui.
- [ ] Tidak ada tulisan "5 Koin" / "10 Koin" pada input placeholder obrolan.
- [ ] Klik-tahan pada pesan dan baris obrolan berfungsi dengan benar (baik mouse hold maupun touch).
- [ ] Batas maksimal 8 foto album profil ditegakkan (`MAX_ALBUM_PHOTOS = 8`).
- [ ] Mekanisme reviewing deteksi SARA dan Pornografi aktif pada Story dan Foto Album.
- [ ] Supabase OAuth PKCE terkonfigurasi dengan penanganan URL redirect dan auto-refresh token.
- [ ] Kanal Supabase Realtime (Presence, Stories, Chat) aktif dan tersinkronisasi.
- [ ] UI Supabase Cloud Hub dapat diakses melalui tab Profil/Saya.
- [ ] PostHog telemetry & dynamic feature flags aktif dan sinkron dengan backend.
- [ ] Ekstensi PgVector dan indexing HNSW 384 dimensi siap digunakan untuk pencocokan semantik.
- [ ] Panel Admin CMS komprehensif (PostHog, PgVector, Users CRM, Moderasi, Finance, Wiretap) dapat dibuka.
- [ ] Semua key bahasa baru telah ditambahkan ke `types.ts`, `id.ts`, dan `en.ts`.




