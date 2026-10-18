import { ModerationResult, ModerationCategory } from '@tresno/shared';

const SARA_PATTERNS = [
  /\b(cina\s*(babi|anjing|keparat|bangsat))\b/i,
  /\b(chindo\s*(anjing|babi|sampah))\b/i,
  /\b(pribumi\s*(bangsat|babi|anjing))\b/i,
  /\b(nonpri\s*(bangsat|sampah|musuh))\b/i,
  /\b(negro\s*(monyet|anjing|sampah)|nigger|nigga)\b/i,
  /\b(papua\s*(monyet|anjing|sampah))\b/i,
  /\b(jawa\s*(monyet|anjing)|batak\s*(anjing|babi)|madura\s*(maling|anjing))\b/i,
  /\b(ganyang\s*(cina|arab|barat|komunis|jawa|batak))\b/i,
  /\b(bantai\s*(ras|etnis|suku))\b/i,
  /\b(islam\s*(teroris|sesat|anjing|babi))\b/i,
  /\b(kristen\s*(anjing|babi|najis|sesat))\b/i,
  /\b(katolik\s*(sesat|najis|anjing))\b/i,
  /\b(hindu\s*(berhala\s*anjing|najis)|budha\s*(najis|anjing))\b/i,
  /\b(kafir\s*(najis|haram|bangkai|babi|darah\s*halal))\b/i,
  /\b(bakar\s*(masjid|gereja|pura|vihara|klenteng))\b/i,
  /\b(quran\s*(palsu|sampah|bakar)|alkitab\s*(palsu|sampah|bakar))\b/i,
  /\b(agama\s*(sampah|teroris|sesat|penipu))\b/i,
];

const PORNOGRAPHY_PATTERNS = [
  /\b(kontol|titit|memek|jembut|toket|pentil|tetek|peler|pepek)\b/i,
  /\b(vagina|penis|boobs|dick|pussy|clitoris|nipple|dildo)\b/i,
  /\b(ngentot|bersetubuh|seks|ngewe|wikwik|colmek|coli|masturbasi|onani)\b/i,
  /\b(blowjob|anal\s*sex|cumshot|creampie|gangbang|threesome|milf\s*sex)\b/i,
  /\b(bokep|porno|porn|pornografi|hentai|nude|bugil|telanjang\s*bulat)\b/i,
  /\b(video\s*lendir|pap\s*(bugil|toket|tt|nude|vagina))\b/i,
  /\b(open\s*bo|bokingan|bo\s*murah|vcs\s*(sange|murah|berbayar)|ava\s*bo)\b/i,
];

export function checkContentModeration(text?: string, mediaUrl?: string): ModerationResult {
  const timestamp = Date.now();
  const raw = `${text || ''} ${mediaUrl || ''}`.toLowerCase();

  for (const regex of SARA_PATTERNS) {
    if (regex.test(raw)) {
      return {
        isSafe: false,
        status: 'rejected',
        category: 'sara',
        flaggedKeywords: ['SARA_VIOLATION'],
        reason: 'Konten diblokir server: Terdeteksi pelanggaran ujaran kebencian SARA (Suku, Agama, Ras, Antargolongan).',
        confidence: 0.99,
        timestamp,
        reviewedBy: 'automated_heuristic_ai',
      };
    }
  }

  for (const regex of PORNOGRAPHY_PATTERNS) {
    if (regex.test(raw)) {
      return {
        isSafe: false,
        status: 'rejected',
        category: 'pornography',
        flaggedKeywords: ['PORNOGRAPHY_VIOLATION'],
        reason: 'Konten diblokir server: Terdeteksi pelanggaran konten dewasa, vulgar, atau pornografi.',
        confidence: 0.99,
        timestamp,
        reviewedBy: 'automated_heuristic_ai',
      };
    }
  }

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
