import { z } from 'zod';

/**
 * Client-Side Environment Variables Validator (WorkWise & Anbu Pattern)
 * Membaca variabel dari import.meta.env (Vite) atau process.env (React Native)
 */

const getRawEnv = (key: string, fallback = ''): string => {
  if (typeof import.meta !== 'undefined' && (import.meta as any).env) {
    if ((import.meta as any).env[key] !== undefined) {
      return (import.meta as any).env[key];
    }
  }
  const globalProc = (globalThis as any)?.process;
  if (globalProc && globalProc.env && globalProc.env[key] !== undefined) {
    return globalProc.env[key];
  }
  return fallback;
};

const clientEnvSchema = z.object({
  APP_ENV: z.enum(['development', 'production', 'test']).default('development'),
  API_URL: z.string().default('http://localhost:4000'),
  WS_URL: z.string().default('ws://localhost:4000/ws'),
  SUPABASE_URL: z.string().url().default('https://demo-tresno.supabase.co'),
  SUPABASE_ANON_KEY: z.string().default('dummy_anon_key_for_tresno'),
  AGORA_APP_ID: z.string().default('dev_agora_app_id_tresno'),
});

const rawValues = {
  APP_ENV: getRawEnv('VITE_APP_ENV', getRawEnv('NODE_ENV', 'development')),
  API_URL: getRawEnv('VITE_API_URL', 'http://localhost:4000'),
  WS_URL: getRawEnv('VITE_WS_URL', 'ws://localhost:4000/ws'),
  SUPABASE_URL: getRawEnv('VITE_SUPABASE_URL', 'https://demo-tresno.supabase.co'),
  SUPABASE_ANON_KEY: getRawEnv('VITE_SUPABASE_ANON_KEY', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.dummy_anon_key_for_tresno'),
  AGORA_APP_ID: getRawEnv('VITE_AGORA_APP_ID', 'dev_agora_app_id_tresno'),
};

const parsed = clientEnvSchema.safeParse(rawValues);

export const clientEnv = parsed.success ? parsed.data : clientEnvSchema.parse({});

export const isClientProduction = clientEnv.APP_ENV === 'production';
export const isClientDevelopment = clientEnv.APP_ENV === 'development';
