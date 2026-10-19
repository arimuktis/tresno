import { create } from 'zustand';
import { SupportedLanguage, TranslationKey, TranslationSchema, SUPPORTED_LANGUAGES } from './types';
import { LOCALES } from './locales';

interface LanguageState {
  currentLanguage: SupportedLanguage;
  setLanguage: (lang: SupportedLanguage) => void;
  t: (key: TranslationKey, params?: Record<string, string | number>) => string;
  missingKeys: string[];
  debugHighlight: boolean;
  setDebugHighlight: (enabled: boolean) => void;
  clearMissingKeys: () => void;
  getMissingKeys: () => string[];
}

const STORAGE_KEY = 'tresno_language';
const DEBUG_STORAGE_KEY = 'tresno_i18n_debug';

const getInitialLanguage = (): SupportedLanguage => {
  if (typeof window !== 'undefined' && window.localStorage) {
    const saved = window.localStorage.getItem(STORAGE_KEY) as SupportedLanguage;
    if (saved && (saved === 'id' || saved === 'en')) {
      return saved;
    }
    // Auto-detect dari browser jika belum pernah dipilih
    if (navigator?.language?.toLowerCase().startsWith('en')) {
      return 'en';
    }
  }
  return 'id'; // Default Bahasa Indonesia untuk aplikasi Tresno
};

const getInitialDebug = (): boolean => {
  if (typeof window !== 'undefined' && window.localStorage) {
    return window.localStorage.getItem(DEBUG_STORAGE_KEY) === 'true';
  }
  return false;
};

const resolveKey = (
  schema: TranslationSchema,
  keyPath: string
): string | undefined => {
  const parts = keyPath.split('.');
  let current: any = schema;
  for (const part of parts) {
    if (current && typeof current === 'object' && part in current) {
      current = current[part];
    } else {
      return undefined;
    }
  }
  return typeof current === 'string' ? current : undefined;
};

// In-memory set for zero-overhead deduping of missing keys
const missingKeysSet = new Set<string>();

export const useLanguageStore = create<LanguageState>((set, get) => {
  const initialLanguage = getInitialLanguage();
  const initialDebug = getInitialDebug();

  const translate = (
    key: TranslationKey,
    params?: Record<string, string | number>
  ): string => {
    const lang = get()?.currentLanguage || initialLanguage;
    const activeSchema = LOCALES[lang] || LOCALES.id;
    let template = resolveKey(activeSchema, key);

    // Fallback ke Bahasa Indonesia jika key belum ada di bahasa lain
    if (!template && lang !== 'id') {
      template = resolveKey(LOCALES.id, key);
    }

    // DETEKTOR MISSING KEY
    if (!template) {
      if (!missingKeysSet.has(key)) {
        missingKeysSet.add(key);
        set({ missingKeys: Array.from(missingKeysSet) });
        if (typeof console !== 'undefined') {
          console.warn(`[i18n DETECTOR] ⚠️ Missing translation key: "${key}" (currentLang: ${lang})`);
        }
      }

      if (get().debugHighlight) {
        return `⚠️[missing:${key}]`;
      }
      return key;
    }

    if (!params) {
      return template;
    }

    // Parameter Interpolation: {paramName} -> value
    return Object.entries(params).reduce((str, [paramKey, value]) => {
      const regex = new RegExp(`\\{${paramKey}\\}`, 'g');
      return str.replace(regex, String(value));
    }, template);
  };

  return {
    currentLanguage: initialLanguage,
    missingKeys: [],
    debugHighlight: initialDebug,
    setLanguage: (lang) => {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem(STORAGE_KEY, lang);
      }
      set({ currentLanguage: lang });
    },
    setDebugHighlight: (enabled) => {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem(DEBUG_STORAGE_KEY, enabled ? 'true' : 'false');
      }
      set({ debugHighlight: enabled });
    },
    clearMissingKeys: () => {
      missingKeysSet.clear();
      set({ missingKeys: [] });
    },
    getMissingKeys: () => Array.from(missingKeysSet),
    t: translate,
  };
});

/**
 * Hook praktis untuk komponen React
 */
export const useTranslation = () => {
  const currentLanguage = useLanguageStore((s) => s.currentLanguage);
  const setLanguage = useLanguageStore((s) => s.setLanguage);
  const t = useLanguageStore((s) => s.t);
  const missingKeys = useLanguageStore((s) => s.missingKeys);
  const debugHighlight = useLanguageStore((s) => s.debugHighlight);
  const setDebugHighlight = useLanguageStore((s) => s.setDebugHighlight);
  const clearMissingKeys = useLanguageStore((s) => s.clearMissingKeys);

  return {
    t,
    currentLanguage,
    setLanguage,
    missingKeys,
    debugHighlight,
    setDebugHighlight,
    clearMissingKeys,
    languageInfo: SUPPORTED_LANGUAGES[currentLanguage],
    isIndonesian: currentLanguage === 'id',
    isEnglish: currentLanguage === 'en',
  };
};
