import { create } from 'zustand';
import { SupportedLanguage, TranslationKey, TranslationSchema, SUPPORTED_LANGUAGES } from './types';
import { LOCALES } from './locales';

interface LanguageState {
  currentLanguage: SupportedLanguage;
  setLanguage: (lang: SupportedLanguage) => void;
  t: (key: TranslationKey, params?: Record<string, string | number>) => string;
}

const STORAGE_KEY = 'tresno_language';

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

export const useLanguageStore = create<LanguageState>((set, get) => {
  const initialLanguage = getInitialLanguage();

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

    if (!template) {
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
    setLanguage: (lang) => {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem(STORAGE_KEY, lang);
      }
      set({ currentLanguage: lang });
    },
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

  return {
    t,
    currentLanguage,
    setLanguage,
    languageInfo: SUPPORTED_LANGUAGES[currentLanguage],
    isIndonesian: currentLanguage === 'id',
    isEnglish: currentLanguage === 'en',
  };
};
