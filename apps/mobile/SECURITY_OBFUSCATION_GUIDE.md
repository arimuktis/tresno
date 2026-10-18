# PANDUAN OBFUSKASI & KEAMANAN BINARY (ANDROID & iOS)
**Aplikasi:** Tresno (Indonesian 1-on-1 Video Match App)  
**ID Paket:** `id.tresno.app`

---

## 1. ANDROID: PROGUARD & R8

### Mengapa Android Memerlukan ProGuard/R8?
Aplikasi Android dikompilasi ke dalam format **DEX Bytecode** (`classes.dex`). Tanpa proteksi, siapapun dapat menggunakan alat seperti **JADX-GUI**, **Apktool**, atau **dex2jar** untuk mengekstrak dan membaca kembali source code Java/Kotlin asli secara utuh beserta nama fungsi dan logikanya.

### Cara Kerja ProGuard / R8 di Tresno:
1. **Shrinking:** Menghapus kelas, metode, dan atribut yang tidak pernah dipanggil (mengurangi ukuran APK 20% - 40%).
2. **Optimization:** Mengoptimalkan bytecode instruksi (inlining fungsi, peephole optimizations).
3. **Obfuscation:** Mengganti nama kelas, field, dan fungsi menjadi karakter acak (`a`, `b`, `c`, dll).
4. **Log Stripping:** Menghapus seluruh pemanggilan `android.util.Log` secara permanen pada level bytecode rilis agar tidak ada token, saldo, atau data sensitif yang bocor ke logcat.

### File Konfigurasi:
File konfigurasi produksi telah disiapkan di:
👉 [`apps/mobile/android/app/proguard-rules.pro`](file:///Users/jangkungari/Desktop/tigo/tresno/apps/mobile/android/app/proguard-rules.pro)

Komponen penting yang **diproteksi agar tidak crash (Keep Rules)**:
- **React Native & Hermes:** `@DoNotStrip`, JNI C++ bindings, `JavaScriptModule`, `NativeModule`.
- **Agora Video Call SDK:** `io.agora.**`, `org.webrtc.**`, dan library native JNI `libagora-rtc-sdk.so`.
- **UI & Gestures:** React Native Reanimated, React Native Screens, Safe Area Context, dan SVG.
- **Networking & WebSocket:** OkHttp, Okio, WebSocketListener, dan Chucker Network Inspector.

### Cara Mengaktifkan di `android/app/build.gradle`:
```groovy
buildTypes {
    release {
        // Aktifkan minifikasi & obfuskasi R8
        minifyEnabled true
        
        // Hapus resource gambar/layout yang tidak terpakai
        shrinkResources true
        
        // Pasang file aturan ProGuard
        proguardFiles getDefaultProguardFile("proguard-android-optimize.txt"), "proguard-rules.pro"
        
        signingConfig signingConfigs.release
    }
}
```

### File Mapping untuk Crash Reporting:
Setelah build rilis berhasil, ProGuard akan menghasilkan file:
`android/app/build/outputs/mapping/release/mapping.txt`  
*Simpan file ini untuk mengunggah ke Sentry / Firebase Crashlytics agar stack trace crash yang terobfuskasi dapat dibaca kembali.*

---

## 2. iOS: APA YANG DIGUNAKAN DI iOS?

### Mengapa iOS Tidak Menggunakan ProGuard?
ProGuard dibuat khusus untuk **Java Virtual Machine (JVM) & Android DEX Bytecode**.  
Di ekosistem Apple (iOS), bahasa **Swift** dan **Objective-C** tidak dikompilasi menjadi bytecode, melainkan **langsung dikompilasi menjadi Native Machine Code ARM64 (Format Binary Mach-O)** menggunakan compiler **LLVM / Clang**.

Karena sudah berbentuk bahasa mesin (assembly ARM64), aplikasi iOS **tidak dapat di-decompile** menjadi kode Swift/Obj-C asli dengan mudah seperti halnya JADX pada Android.

---

### Proteksi Standar Produksi pada iOS (Setara ProGuard):

Di iOS dan Xcode, fungsi obfuskasi dan pengamanan binary dicapai melalui 4 lapisan berikut:

#### A. Symbol Stripping (Pembersihan Simbol Mach-O)
Secara default, binary Mach-O menyimpan tabel simbol (nama fungsi, kelas, dan variabel). Di Xcode build rilis, simbol ini **dibersihkan (stripped)** agar alat reverse-engineering seperti `nm`, `objdump`, atau `class-dump` hanya melihat alamat memori hex (`0x00000001000f4020`), bukan nama fungsi aslinya.

**Pengaturan di Xcode Build Settings (Release):**
| Xcode Build Setting | Nilai Produksi | Fungsi |
| :--- | :--- | :--- |
| **`STRIP_INSTALLED_PRODUCT`** | `YES` | Menghapus simbol biner dari binary `.app` final. |
| **`STRIP_STYLE`** | `All Symbols` (`all`) | Menghapus semua simbol debug dan simbol lokal non-global. |
| **`DEPLOYMENT_POSTPROCESSING`** | `YES` | Mengaktifkan proses stripping pasca kompilasi rilis. |
| **`DEAD_CODE_STRIPPING`** | `YES` | Membuang seluruh fungsi dan library yang tidak pernah dipanggil. |
| **`GCC_SYMBOLS_PRIVATE_EXTERN`** | `YES` | Menyembunyikan simbol private dari dynamic symbol table (`dlsym`). |

#### B. Optimasi Kompiler LLVM (-O / -Os)
Compiler Clang/LLVM mengacak dan merestrukturisasi alur kode mesin:
* **`SWIFT_OPTIMIZATION_LEVEL`** $\rightarrow$ `-O` (Optimize for Speed)
* **`SWIFT_COMPILATION_MODE`** $\rightarrow$ `Whole Module`
* **`GCC_OPTIMIZATION_LEVEL`** $\rightarrow$ `Fastest, Smallest [-Os]` (Optimize for Size)

Kompiler akan melakukan *function inlining*, *loop unrolling*, dan *control-flow flattening*, membuat kode mesin biner sangat sulit dianalisis melalui disassembler seperti IDA Pro atau Ghidra.

#### C. Proteksi JavaScript Bundle React Native (Hermes Bytecode)
Di React Native, logika bisnis utama ada di dalam bundle JavaScript (`main.jsbundle`).
* Jika Hermes **TIDAK aktif**, file `main.jsbundle` tersimpan dalam bentuk teks plain JS yang dapat dibaca siapa saja saat `.ipa` di-unzip.
* Saat Hermes **AKTIF** (standar Tresno): File JS dikompilasi oleh `hermesc` menjadi **Hermes Precompiled Bytecode (`.hbc`)**. Semua nama variabel lokal dihapus dan kode diubah menjadi opcode biner Hermes VM, sehingga aman di Android maupun iOS.

#### D. Obfuskasi Lanjutan iOS (Enterprise / Grade Perbankan)
Jika aplikasi Anda membutuhkan proteksi ekstra tinggi terhadap ancaman hacker/jailbreak reverse-engineering, industri iOS menggunakan:
1. **IxGuard (dari Guardsquare - pembuat ProGuard):** Solusi enterprise nomor 1 di dunia untuk obfuskasi native Mach-O, enkripsi string, integrity check, dan anti-hooking (anti-Frida).
2. **OLLVM (Obfuscator-LLVM):** Fork compiler LLVM open-source yang menyuntikkan instruksi *Control Flow Flattening*, *Bogus Control Flow*, dan *Instruction Substitution*.
3. **SwiftShield / iOS-Class-Guard:** Script otomatis yang mengganti nama seluruh kelas, protokol, dan properti Swift/Obj-C menjadi string MD5/acak sebelum kompilasi Xcode.

---

## 3. RINGKASAN PERBANDINGAN

| Fitur / Proteksi | Android | iOS |
| :--- | :--- | :--- |
| **Alat Utama** | **ProGuard / R8** | **LLVM / Clang Strip & Optimizations** |
| **Target Obfuskasi** | DEX Bytecode (`.dex`) | Mach-O Native ARM64 Binary |
| **Pembersihan Simbol** | `-keepattributes ...` (R8) | `STRIP_INSTALLED_PRODUCT = YES` |
| **Pembersihan Log** | `-assumenosideeffects` | Macro `#if DEBUG` / `strip-debug` |
| **Proteksi Kode JS** | Hermes Bytecode (`.hbc`) | Hermes Bytecode (`.hbc`) |
| **Alat Lanjutan (Komisi Ekstra)** | DexGuard / ProGuard | IxGuard / OLLVM / SwiftShield |

---

## 4. GOOGLE PLAY INTEGRITY API (VERIFIKASI INTEGRITAS PERANGKAT & APK RESMI)

Google Play Integrity API adalah standar keamanan tertinggi dari Google yang menggantikan SafetyNet Attestation. API ini memberikan bukti kriptografis bertandatangan Google bahwa aplikasi berjalan di perangkat fisik asli yang tidak di-root, dan biner APK cocok 100% dengan versi resmi di Google Play Store.

### Alur Kerja Produksi (3-Step Cryptographic Handshake):
```
[ Tresno Mobile App ]               [ Fastify Backend ]               [ Google Attestation Server ]
         |                                   |                                      |
         | --- 1. Minta Nonce Sekali Pakai ->|                                      |
         |     (POST /api/security/nonce)    |                                      |
         |                                   | (Generate crypto nonce + simpan TTL) |
         | <-- 2. Terima Nonce Kriptografis -|                                      |
         |                                                                          |
         | --- 3. Minta Integrity Token dengan Nonce -----------------------------> |
         | <-- 4. Terima Token Terenkripsi JWE (JSON Web Encryption) -------------- |
         |                                                                          |
         | --- 5. Kirim Token JWE ke Backend (POST /api/security/integrity/verify) ->
         |                                   |                                      |
         |                                   | --- 6. Dekripsi Token JWE via API -> |
         |                                   | <-- 7. Terima Hasil Verdict Google - |
         |                                   |                                      |
         |                                   | (Evaluasi Device & App Verdict)      |
         | <-- 8. Token Akses / Izin Akses --|                                      |
```

### Penjelasan Verdict Google Play Integrity:
1. **`deviceRecognitionVerdict`**:
   - `MEETS_BASIC_INTEGRITY`: Perangkat dasar (bisa berupa emulator atau device tanpa sertifikasi Play Protect).
   - `MEETS_DEVICE_INTEGRITY`: **(Standar Wajib Tresno)** Perangkat fisik Android asli dengan Google Play Services terverifikasi dan bootloader terkunci (non-root).
   - `MEETS_STRONG_INTEGRITY`: Perangkat fisik dengan hardware-backed keystore dan TEE (Trusted Execution Environment) aktif.
2. **`appRecognitionVerdict`**:
   - `PLAY_RECOGNIZED`: **(Standar Wajib Tresno)** Checksum biner APK cocok dengan file yang diunggah ke Google Play Console (bukan APK hasil decompiled/repackaged).
   - `UNRECOGNIZED_VERSION`: APK telah dimodifikasi atau di-repackage oleh pihak ketiga.
3. **`appLicensingVerdict`**:
   - `LICENSED`: Pengguna mengunduh aplikasi secara sah dari Google Play Store.

---

## 5. FIREBASE APP CHECK (PROTEKSI GATEWAY API BACKEND DARI BOT & SCRAPER)

Firebase App Check memproteksi backend Fastify dari serangan cURL, botnet, emulator scraper, dan pemanggilan API tanpa izin.

### Cara Kerja:
1. **Penyedia Attestasi (Attestation Providers):**
   - **Android:** Memanfaatkan Google Play Integrity API.
   - **iOS:** Memanfaatkan Apple DeviceCheck & App Attest API.
   - **Web / Admin CMS:** Memanfaatkan Google reCAPTCHA Enterprise.
2. **Injeksi Header Otomatis:**
   - Setiap request HTTP dari aplikasi Tresno menyertakan header:
     `X-Firebase-AppCheck: <jwt_app_check_token>`
3. **Verifikasi di Fastify Server:**
   - Middleware `appCheckService.requireAppCheck()` memvalidasi signature token Firebase. Request tanpa token sah langsung ditolak dengan status **HTTP 401 Unauthorized** sebelum mencapai logika bisnis / database.

---

## 6. RUNTIME HARDENING: ANTI-ROOT, ANTI-JAILBREAK & ANTI-FRIDA

Tresno mengimplementasikan sistem heuristik berlapis:

### A. Deteksi Root Android:
1. **Pemeriksaan Binary `su`:** Memindai direktori `/system/xbin/su`, `/sbin/su`, `/data/local/xbin/su`, `/data/adb/magisk`.
2. **Pemeriksaan Paket Superuser:** Memeriksa keberadaan package `com.topjohnwu.magisk`, `eu.chainfire.supersu`, `io.github.a13e300.ksu` (KernelSU), `me.bmax.apatch`.
3. **Pemeriksaan Build Tags:** Memeriksa flag `ro.build.tags` untuk mendeteksi `test-keys` (ROM kustom yang tidak tersertifikasi).
4. **Pemeriksaan Mount Writable:** Menguji apakah partisi `/system` atau `/vendor` memiliki izin mount Read-Write (`rw`).

### B. Deteksi Jailbreak iOS:
1. **Pemeriksaan File Jailbreak:** Memindai `/Applications/Cydia.app`, `/Applications/Sileo.app`, `/Library/MobileSubstrate/MobileSubstrate.dylib`, `/bin/bash`, `/usr/sbin/sshd`.
2. **Sandbox Violation Probe:** Mencoba menulis file ke luar sandbox aplikasi (`/private/jailbreak_probe.txt`). Jika berhasil, sandbox iOS telah dijebol.
3. **Dyld Library Injection:** Memeriksa apakah `DYLD_INSERT_LIBRARIES` disuntikkan saat runtime.

### C. Anti-Frida & Anti-Hooking:
1. **Pemindaian Port Default Frida:** Memeriksa apakah port `27042` atau `27043` sedang mendengar koneksi di localhost.
2. **Pemeriksaan Memory Maps (`/proc/self/maps`):** Memindai apakah library `frida-agent.so`, `frida-gadget.so`, `xposed.prop`, atau `substrate` dimuat ke dalam RAM proses.
3. **Anti-Debugging (`ptrace`):**
   - Di Android Native: Menjalankan `ptrace(PTRACE_TRACEME, 0, 1, 0)` saat startup. Jika debugger (GDB/LLDB/Frida) sudah menempel, proses akan keluar (*exit*) secara aman.
   - Memantau status `TracerPid` di `/proc/self/status`. Jika `TracerPid != 0`, aplikasi mendeteksi sedang di-debug dan membatasi transaksi keuangan.

---

## 7. DRM & PERLINDUNGAN ANTI-SCREEN RECORDING (`FLAG_SECURE`)

Untuk melindungi privasi panggilan video 1-on-1 host dan mencegah perekaman layar tanpa izin:
- **Android:** Mengaktifkan flag `WindowManager.LayoutParams.FLAG_SECURE` pada window activity. Layar otomatis menjadi hitam pekat saat pengguna mencoba mengambil screenshot atau menyalakan screen recorder (termasuk saat aplikasi diminimalkan di app switcher).
- **iOS:** Menggunakan listener `UIScreen.capturedDidChangeNotification` dan properti `isCaptured`. Jika screen recording iOS terdeteksi aktif, tampilan video host langsung disensor dengan blur overlay otomatis.

