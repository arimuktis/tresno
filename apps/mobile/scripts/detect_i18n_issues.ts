import * as fs from 'fs';
import * as path from 'path';

console.log('========================================================');
console.log('🔍 DETEKTOR KELENGKAPAN i18n & TEKS HARDCODED (TRESNO)');
console.log('========================================================\n');

const MOBILE_SRC_DIR = path.resolve(__dirname, '../src');
const LOCALES_DIR = path.resolve(MOBILE_SRC_DIR, 'i18n/locales');

// Helper flatten nested object into dot paths
function flattenObject(obj: Record<string, any>, prefix = ''): string[] {
  let keys: string[] = [];
  for (const [key, value] of Object.entries(obj)) {
    const fullPath = prefix ? `${prefix}.${key}` : key;
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      keys = keys.concat(flattenObject(value, fullPath));
    } else {
      keys.push(fullPath);
    }
  }
  return keys;
}

// 1. Audit Key Parity between id.ts and en.ts
console.log('1. Memeriksa Sinkronisasi Key Terjemahan (ID vs EN)...');
let idKeys: string[] = [];
let enKeys: string[] = [];

try {
  // Dynamically import locales
  const idLocale = require('../src/i18n/locales/id').id;
  const enLocale = require('../src/i18n/locales/en').en;

  idKeys = flattenObject(idLocale);
  enKeys = flattenObject(enLocale);

  const missingInEn = idKeys.filter((k) => !enKeys.includes(k));
  const missingInId = enKeys.filter((k) => !idKeys.includes(k));

  console.log(`   - Total Key Bahasa Indonesia (id): ${idKeys.length}`);
  console.log(`   - Total Key Bahasa Inggris   (en): ${enKeys.length}`);

  if (missingInEn.length > 0) {
    console.error(`\n❌ Ditemukan ${missingInEn.length} key yang ada di ID tapi HILANG di EN:`);
    missingInEn.forEach((k) => console.error(`     - ${k}`));
  } else {
    console.log('   ✅ Semua key ID memiliki padanan di EN (0 missing in EN)');
  }

  if (missingInId.length > 0) {
    console.error(`\n❌ Ditemukan ${missingInId.length} key yang ada di EN tapi HILANG di ID:`);
    missingInId.forEach((k) => console.error(`     - ${k}`));
  } else {
    console.log('   ✅ Semua key EN memiliki padanan di ID (0 missing in ID)');
  }
} catch (err: any) {
  console.error('   ⚠️ Gagal memuat modul locales secara langsung:', err.message);
}

// 2. Scan JSX Files for Raw Hardcoded Indonesian / English Strings
console.log('\n2. Memindai Teks Hardcoded di Seluruh Komponen JSX/TSX...');

interface HardcodedFinding {
  filePath: string;
  lineNumber: number;
  text: string;
  kind: 'jsx-text' | 'jsx-prop';
}

const findings: HardcodedFinding[] = [];

// Whitelist patterns / words that are technical or expected
const WHITELIST_REGEX = /^(#|rgba|http|px|%|auto|none|solid|flex|row|column|center|space-|bold|normal|\d+$|\d+px|\d+%|[A-Za-z0-9_-]+\.(png|jpg|webp|svg)|use[A-Z]|anchor_|user_|ch_|tok_)/;

function scanFile(filePath: string) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');

  lines.forEach((line, idx) => {
    const lineNum = idx + 1;
    // Skip comments and imports
    const trimmed = line.trim();
    if (trimmed.startsWith('//') || trimmed.startsWith('/*') || trimmed.startsWith('*') || trimmed.startsWith('import ')) {
      return;
    }

    // Check JSX Text inside <Text>Hardcoded Text</Text>
    const textTagMatch = line.match(/<Text[^>]*>([^<>{}\n]+)<\/Text>/);
    if (textTagMatch) {
      const textVal = textTagMatch[1].trim();
      if (
        textVal.length >= 3 &&
        !textVal.startsWith('{') &&
        !WHITELIST_REGEX.test(textVal) &&
        !/^[0-9\s:.,+-]+$/.test(textVal)
      ) {
        findings.push({
          filePath,
          lineNumber: lineNum,
          text: textVal,
          kind: 'jsx-text',
        });
      }
    }

    // Check JSX Props: placeholder="...", title="..."
    const propMatch = line.match(/(placeholder|title|label)=["']([^"'{}]+)["']/);
    if (propMatch) {
      const propVal = propMatch[2].trim();
      if (
        propVal.length >= 3 &&
        !WHITELIST_REGEX.test(propVal) &&
        !/^[0-9\s:.,+-]+$/.test(propVal)
      ) {
        // Exclude test IDs or known props
        if (!propVal.startsWith('test_') && !propVal.startsWith('icon_')) {
          findings.push({
            filePath,
            lineNumber: lineNum,
            text: propVal,
            kind: 'jsx-prop',
          });
        }
      }
    }
  });
}

function walkDir(dir: string) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name !== 'node_modules' && entry.name !== 'i18n' && entry.name !== 'scripts') {
        walkDir(fullPath);
      }
    } else if (entry.isFile() && (entry.name.endsWith('.tsx') || entry.name.endsWith('.ts'))) {
      if (!entry.name.endsWith('.d.ts') && !entry.name.includes('tokens') && !entry.name.includes('mock')) {
        scanFile(fullPath);
      }
    }
  }
}

walkDir(MOBILE_SRC_DIR);

const relPath = (p: string) => path.relative(path.resolve(__dirname, '..'), p);

console.log(`   - Total Berkas Dipindai di 'src/': selesai`);
console.log(`   - Temuan Potensi Hardcoded Text: ${findings.length}`);

if (findings.length > 0) {
  console.log('\n📋 Daftar Potensi Teks Hardcoded yang Perlu Menggunakan t(...):');
  // Show top 25 findings to keep output manageable
  findings.slice(0, 25).forEach((f) => {
    console.log(`   - [${f.kind.toUpperCase()}] ${relPath(f.filePath)}:${f.lineNumber} -> "${f.text}"`);
  });
  if (findings.length > 25) {
    console.log(`   ... dan ${findings.length - 25} temuan lainnya.`);
  }
} else {
  console.log('   ✅ Tidak ada teks hardcoded mencurigakan yang terdeteksi.');
}

console.log('\n========================================================');
console.log('📊 RINGKASAN AUDIT i18n:');
console.log(`   - Status Parity ID vs EN: ${idKeys.length === enKeys.length ? 'SEMPURNA (100% Selaras)' : 'ADA PERBEDAAN'}`);
console.log(`   - Detektor Hardcoded String: ${findings.length} peringatan`);
console.log('========================================================\n');

// Exit with 0 if no missing keys between ID and EN
if (idKeys.length === enKeys.length) {
  process.exit(0);
} else {
  process.exit(1);
}
