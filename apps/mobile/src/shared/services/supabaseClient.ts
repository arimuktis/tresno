import { createClient, SupabaseClient } from '@supabase/supabase-js';

const STORAGE_URL_KEY = 'tresno_custom_supabase_url';
const STORAGE_KEY_KEY = 'tresno_custom_supabase_anon_key';

const getEnvVar = (key: string, defaultValue: string): string => {
  // 1. Cek penyimpanan lokal pengguna terlebih dahulu
  if (typeof window !== 'undefined' && window.localStorage) {
    const storageKey = key === 'SUPABASE_URL' ? STORAGE_URL_KEY : STORAGE_KEY_KEY;
    const customVal = window.localStorage.getItem(storageKey);
    if (customVal && customVal.trim()) {
      return customVal.trim();
    }
  }

  // 2. Cek process.env (Node / SSR)
  const globalProc = (globalThis as any)?.process;
  if (globalProc && globalProc.env && globalProc.env[key]) {
    return globalProc.env[key];
  }

  // 3. Cek import.meta.env (Vite)
  if (typeof import.meta !== 'undefined' && (import.meta as any).env) {
    const viteKey = `VITE_${key}`;
    if ((import.meta as any).env[viteKey]) {
      return (import.meta as any).env[viteKey];
    }
  }

  return defaultValue;
};

export let SUPABASE_URL = getEnvVar('SUPABASE_URL', 'https://demo-tresno.supabase.co');
export let SUPABASE_ANON_KEY = getEnvVar(
  'SUPABASE_ANON_KEY',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.dummy_anon_key_for_tresno'
);

export const isRealSupabaseConfigured = (): boolean => {
  return (
    SUPABASE_URL !== 'https://demo-tresno.supabase.co' &&
    SUPABASE_ANON_KEY !== 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.dummy_anon_key_for_tresno' &&
    !SUPABASE_URL.includes('your-project') &&
    SUPABASE_URL.startsWith('https://') &&
    SUPABASE_URL.includes('.supabase.co')
  );
};

// Storage adapter (localStorage untuk web, memory fallback)
const customStorage = {
  getItem: (key: string): string | null => {
    if (typeof window !== 'undefined' && window.localStorage) {
      return window.localStorage.getItem(key);
    }
    return null;
  },
  setItem: (key: string, value: string): void => {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem(key, value);
    }
  },
  removeItem: (key: string): void => {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.removeItem(key);
    }
  },
};

function createSupabaseInstance(url: string, key: string): SupabaseClient {
  return createClient(url, key, {
    auth: {
      storage: customStorage,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
      flowType: 'pkce',
    },
    realtime: {
      params: {
        eventsPerSecond: 10,
      },
    },
  });
}

export let supabase: SupabaseClient = createSupabaseInstance(SUPABASE_URL, SUPABASE_ANON_KEY);

/**
 * Update runtime Supabase credentials (misal dari modal pengaturan admin)
 */
export const updateSupabaseConfig = (url: string, anonKey: string): void => {
  if (typeof window !== 'undefined' && window.localStorage) {
    window.localStorage.setItem(STORAGE_URL_KEY, url.trim());
    window.localStorage.setItem(STORAGE_KEY_KEY, anonKey.trim());
  }
  SUPABASE_URL = url.trim();
  SUPABASE_ANON_KEY = anonKey.trim();
  supabase = createSupabaseInstance(SUPABASE_URL, SUPABASE_ANON_KEY);
};

/**
 * Reset credentials ke default demo
 */
export const resetSupabaseConfig = (): void => {
  if (typeof window !== 'undefined' && window.localStorage) {
    window.localStorage.removeItem(STORAGE_URL_KEY);
    window.localStorage.removeItem(STORAGE_KEY_KEY);
  }
  SUPABASE_URL = 'https://demo-tresno.supabase.co';
  SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.dummy_anon_key_for_tresno';
  supabase = createSupabaseInstance(SUPABASE_URL, SUPABASE_ANON_KEY);
};

export const getSupabaseConfig = () => ({
  url: SUPABASE_URL,
  anonKey: SUPABASE_ANON_KEY,
  isReal: isRealSupabaseConfigured(),
});
