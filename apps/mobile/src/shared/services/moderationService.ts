import { ModerationResult, ModerationStatus, ModerationCategory } from '@tresno/shared';

/**
 * Moderation Policy Keywords (Indonesian & Global Standards)
 * Covers SARA (Suku, Agama, Ras, Antargolongan) and Pornography/NSFW/Vulgarity.
 */

// SARA Keywords: Ujaran kebencian ras, etnis, agama, penistaan, provokasi antar golongan
const SARA_PATTERNS: { regex: RegExp; label: string }[] = [
  // Ras & Etnis (Racial & Ethnic Slurs)
  { regex: /\b(cina\s*(babi|anjing|keparat|bangsat))\b/i, label: 'Penghinaan ras/etnis Tionghoa' },
  { regex: /\b(chindo\s*(anjing|babi|sampah))\b/i, label: 'Penghinaan ras Chindo' },
  { regex: /\b(pribumi\s*(bangsat|babi|anjing))\b/i, label: 'Penghinaan identitas suku/pribumi' },
  { regex: /\b(nonpri\s*(bangsat|sampah|musuh))\b/i, label: 'Diskriminasi non-pribumi' },
  { regex: /\b(negro\s*(monyet|anjing|sampah)|nigger|nigga)\b/i, label: 'Ujaran rasisme warna kulit (Negro/Nigger)' },
  { regex: /\b(papua\s*(monyet|anjing|sampah))\b/i, label: 'Ujaran rasisme terhadap Papua' },
  { regex: /\b(jawa\s*(monyet|anjing)|batak\s*(anjing|babi)|madura\s*(maling|anjing))\b/i, label: 'Pelecehan suku daerah' },
  { regex: /\b(ganyang\s*(cina|arab|barat|komunis|jawa|batak))\b/i, label: 'Provokasi kekerasan antar-etnis' },
  { regex: /\b(bantai\s*(ras|etnis|suku))\b/i, label: 'Hasutan genosida / pembersihan etnis' },

  // Agama & Kepercayaan (Religious Blasphemy & Sectarian Hatred)
  { regex: /\b(islam\s*(teroris|sesat|anjing|babi))\b/i, label: 'Penistaan / ujaran kebencian agama Islam' },
  { regex: /\b(kristen\s*(anjing|babi|najis|sesat))\b/i, label: 'Penistaan / ujaran kebencian agama Kristen' },
  { regex: /\b(katolik\s*(sesat|najis|anjing))\b/i, label: 'Penistaan / ujaran kebencian agama Katolik' },
  { regex: /\b(hindu\s*(berhala\s*anjing|najis)|budha\s*(najis|anjing))\b/i, label: 'Penistaan agama Hindu/Buddha' },
  { regex: /\b(kafir\s*(najis|haram|bangkai|babi|darah\s*halal))\b/i, label: 'Ujaran kebencian berbasis kafir/sektarian' },
  { regex: /\b(bakar\s*(masjid|gereja|pura|vihara|klenteng))\b/i, label: 'Ajakan perusakan tempat ibadah' },
  { regex: /\b(quran\s*(palsu|sampah|bakar)|alkitab\s*(palsu|sampah|bakar))\b/i, label: 'Penistaan kitab suci agama' },
  { regex: /\b(agama\s*(sampah|teroris|sesat|penipu))\b/i, label: 'Pelecehan institusi keagamaan' },

  // Antargolongan & Diskriminasi Kelompok
  { regex: /\b(hancurkan\s*(etnis|golongan|kaum))\b/i, label: 'Hasutan kebencian antargolongan' },
  { regex: /\b(darah\s*mereka\s*halal\s*dibunuh)\b/i, label: 'Fatwa kekerasan tidak sah / ancaman pembunuhan' },
];

// Pornography & NSFW Keywords: Vulgar anatomy, sexual acts, commercial adult services
const PORNOGRAPHY_PATTERNS: { regex: RegExp; label: string }[] = [
  // Anatomi Vulgar & Istilah Mesum
  { regex: /\b(kontol|titit|memek|jembut|toket|pentil|tetek|peler|pepek)\b/i, label: 'Kata vulgar anatomi genital' },
  { regex: /\b(vagina|penis|boobs|dick|pussy|clitoris|nipple|dildo)\b/i, label: 'Istilah anatomi seksual explicit' },
  { regex: /\b(ngentot|bersetubuh|seks|ngewe|wikwik|colmek|coli|masturbasi|onani)\b/i, label: 'Aktivitas seksual eksplisit' },
  { regex: /\b(blowjob|anal\s*sex|cumshot|creampie|gangbang|threesome|milf\s*sex)\b/i, label: 'Istilah pornografi global' },

  // Pornografi, Ketelanjangan & Media Dewasa
  { regex: /\b(bokep|porno|porn|pornografi|hentai|nude|bugil|telanjang\s*bulat)\b/i, label: 'Media pornografi atau ketelanjangan' },
  { regex: /\b(bokep\s*(viral|indo|abg|smp|sma|jepang))\b/i, label: 'Pencarian / penyebaran video asusila' },
  { regex: /\b(video\s*lendir|pap\s*(bugil|toket|tt|nude|vagina))\b/i, label: 'Permintaan / penawaran foto bugil' },

  // Transaksi Seksual / Open BO / VCS Vulgar
  { regex: /\b(open\s*bo|bokingan|bo\s*murah|vcs\s*(sange|murah|berbayar)|ava\s*bo)\b/i, label: 'Tawaran prostitusi / open BO / VCS vulgar' },
  { regex: /\b(sewa\s*kamar\s*short\s*time|cewek\s*bisa\s*dipake)\b/i, label: 'Fasilitasi prostitusi komersial' },
];

// File name heuristic indicators for adult / illegal media
const SUSPICIOUS_FILENAME_PATTERNS = [
  /\b(nude|naked|bokep|xxx|nsfw|porn|hentai|sex|toket|memek|kontol|bugil|boobs|pussy|dick)\b/i,
  /\b(sara|hate|rasis|penistaan)\b/i,
];

// Normalizer untuk membersihkan leetspeak sederhana (misal k0nt0l -> kontol)
export function normalizeLeetSpeak(text: string): string {
  return text
    .toLowerCase()
    .replace(/[@4]/g, 'a')
    .replace(/[3]/g, 'e')
    .replace(/[1!|]/g, 'i')
    .replace(/[0]/g, 'o')
    .replace(/[$5]/g, 's')
    .replace(/[7]/g, 't')
    .replace(/[+]/g, 't')
    .replace(/[\s._-]+/g, ' '); // satukan spasi dan pemisah buatan
}

export const moderationService = {
  /**
   * Evaluasi teks (caption, komentar, deskripsi foto)
   */
  inspectText(text?: string): ModerationResult {
    const timestamp = Date.now();
    if (!text || !text.trim()) {
      return {
        isSafe: true,
        status: 'approved',
        category: 'clean',
        flaggedKeywords: [],
        confidence: 1.0,
        timestamp,
        reviewedBy: 'automated_heuristic_ai',
      };
    }

    const rawLower = text.toLowerCase();
    const normalized = normalizeLeetSpeak(text);

    // 1. Cek SARA (Prioritas Tinggi: Pelanggaran Pidana & Kedamaian Komunitas)
    for (const pattern of SARA_PATTERNS) {
      if (pattern.regex.test(rawLower) || pattern.regex.test(normalized)) {
        return {
          isSafe: false,
          status: 'rejected',
          category: 'sara',
          flaggedKeywords: [pattern.label],
          reason: `Melanggar Pedoman Komunitas: Terdeteksi unsur SARA (${pattern.label}). Platform Tresno melarang ujaran diskriminasi suku, agama, ras, dan antargolongan.`,
          confidence: 0.98,
          timestamp,
          reviewedBy: 'automated_heuristic_ai',
        };
      }
    }

    // 2. Cek Pornografi / NSFW / Eksploitasi Seksual
    for (const pattern of PORNOGRAPHY_PATTERNS) {
      if (pattern.regex.test(rawLower) || pattern.regex.test(normalized)) {
        return {
          isSafe: false,
          status: 'rejected',
          category: 'pornography',
          flaggedKeywords: [pattern.label],
          reason: `Melanggar Pedoman Komunitas: Terdeteksi konten berbau Pornografi / Asusila (${pattern.label}). Konten ketelanjangan, vulgar, dan penawaran seksual dilarang keras.`,
          confidence: 0.99,
          timestamp,
          reviewedBy: 'automated_heuristic_ai',
        };
      }
    }

    // 3. Borderline check: kata-kata yang memicu status pending_review
    const SENSITIVE_BORDERLINE = /\b(bo|vcs|seksi|hot|sexy|sensual|teroris|kafir)\b/i;
    if (SENSITIVE_BORDERLINE.test(rawLower) || SENSITIVE_BORDERLINE.test(normalized)) {
      return {
        isSafe: true,
        status: 'pending_review',
        category: 'clean',
        flaggedKeywords: ['borderline_content'],
        reason: 'Konten terdeteksi menggunakan kata bersensitivitas sedang dan masuk antrean peninjauan kurator komunitas.',
        confidence: 0.65,
        timestamp,
        reviewedBy: 'automated_heuristic_ai',
      };
    }

    // Bersih
    return {
      isSafe: true,
      status: 'approved',
      category: 'clean',
      flaggedKeywords: [],
      confidence: 1.0,
      timestamp,
      reviewedBy: 'automated_heuristic_ai',
    };
  },

  /**
   * Evaluasi gambar / media (nama file, metadata, atau URL)
   */
  async inspectImage(
    media: File | Blob | string,
    fileName?: string
  ): Promise<ModerationResult> {
    const timestamp = Date.now();
    let resolvedName = fileName || '';

    if (typeof media === 'string') {
      resolvedName = resolvedName || media.split('/').pop() || '';
    } else if ('name' in media && typeof (media as any).name === 'string') {
      resolvedName = (media as any).name;
    }

    // 1. Cek pola nama file mencurigakan
    const normalizedName = normalizeLeetSpeak(resolvedName);
    for (const pattern of SUSPICIOUS_FILENAME_PATTERNS) {
      if (pattern.test(resolvedName) || pattern.test(normalizedName)) {
        const isSara = /\b(sara|hate|rasis|penistaan)\b/i.test(normalizedName);
        const category: ModerationCategory = isSara ? 'sara' : 'pornography';
        return {
          isSafe: false,
          status: 'rejected',
          category,
          flaggedKeywords: [resolvedName],
          reason: isSara
            ? 'Media ditolak: Nama berkas atau metadata terdeteksi mengandung indikator SARA / ujaran kebencian.'
            : 'Media ditolak: Nama berkas atau metadata terdeteksi mengandung indikator konten dewasa / pornografi.',
          confidence: 0.95,
          timestamp,
          reviewedBy: 'automated_heuristic_ai',
        };
      }
    }

    // 2. Simulasi analisis AI Computer Vision (Skin Tone & Nudity Classifier Heuristic)
    // Jika di browser dan media adalah string URL gambar atau Blob, lakukan simulasi scanning singkat
    await new Promise((resolve) => setTimeout(resolve, 300)); // Latensi simulasi analisis AI ~300ms

    // Default: Lolos jika tidak ada pelanggaran
    return {
      isSafe: true,
      status: 'approved',
      category: 'clean',
      flaggedKeywords: [],
      confidence: 0.96,
      timestamp,
      reviewedBy: 'automated_heuristic_ai',
    };
  },

  /**
   * Evaluasi Terpadu Konten (Teks Caption + Foto/Video)
   * Menggabungkan hasil teks dan visual.
   */
  async inspectContent(
    text?: string,
    media?: File | Blob | string,
    fileName?: string
  ): Promise<ModerationResult> {
    // Periksa teks terlebih dahulu
    const textResult = this.inspectText(text);
    if (!textResult.isSafe) {
      return textResult;
    }

    // Jika teks aman, periksa gambar/media
    if (media) {
      const mediaResult = await this.inspectImage(media, fileName);
      if (!mediaResult.isSafe) {
        return mediaResult;
      }
      // Jika salah satu statusnya pending_review, result keseluruhan pending_review
      if (textResult.status === 'pending_review' || mediaResult.status === 'pending_review') {
        return {
          ...textResult,
          status: 'pending_review',
          reason: textResult.reason || mediaResult.reason,
        };
      }
    }

    return textResult;
  },

  /**
   * Simulasi kurasi / keputusan admin manual
   */
  overrideDecision(
    status: ModerationStatus,
    category: ModerationCategory = 'clean',
    reason?: string
  ): ModerationResult {
    return {
      isSafe: status === 'approved',
      status,
      category,
      flaggedKeywords: [],
      reason,
      confidence: 1.0,
      timestamp: Date.now(),
      reviewedBy: 'admin_curator',
    };
  },
};
