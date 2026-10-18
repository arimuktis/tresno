import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { z } from 'zod';

/**
 * Multi-Environment Loader (Mirrored from WorkWise / Production Standards)
 *
 * Hirarki pemuatan file .env:
 * 1. process.env (Sistem / CI/CD / Docker runtime)
 * 2. .env.{NODE_ENV}.local
 * 3. .env.{NODE_ENV}
 * 4. .env.local
 * 5. .env
 */
const nodeEnv = process.env.NODE_ENV || 'development';
const rootDir = path.resolve(__dirname, '../../');

const envFiles = [
  path.join(rootDir, `.env.${nodeEnv}.local`),
  path.join(rootDir, `.env.${nodeEnv}`),
  path.join(rootDir, '.env.local'),
  path.join(rootDir, '.env'),
];

for (const file of envFiles) {
  if (fs.existsSync(file)) {
    dotenv.config({ path: file, override: false });
  }
}

// Skema Validasi Environment Variables Server dengan Zod
const serverEnvSchema = z
  .object({
    NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
    PORT: z.coerce.number().min(1000).max(65535).default(4000),
    HOST: z.string().default('0.0.0.0'),
    CORS_ORIGIN: z.string().default('*'),

    // Agora RTC
    AGORA_APP_ID: z.string().default('dummy_agora_app_id'),
    AGORA_APP_CERTIFICATE: z.string().default('dummy_agora_app_certificate'),

    // Redis Cache & Matchmaking
    REDIS_URL: z.string().optional(),

    // Supabase Credentials
    SUPABASE_URL: z.string().url().default('https://demo-tresno.supabase.co'),
    SUPABASE_SERVICE_ROLE_KEY: z.string().default('dummy_service_role_key'),
    STORY_BUCKET: z.string().default('tresno-stories'),

    // Midtrans Payment Gateway
    MIDTRANS_SERVER_KEY: z.string().default('SB-Mid-server-dummy'),
    MIDTRANS_CLIENT_KEY: z.string().default('SB-Mid-client-dummy'),
    MIDTRANS_IS_PRODUCTION: z.coerce.boolean().default(false),
  })
  .superRefine((data: Record<string, any>, ctx: z.RefinementCtx) => {
    // Validasi ketat jika berjalan di mode PRODUCTION (WorkWise Security Rule)
    if (data.NODE_ENV === 'production') {
      if (
        typeof data.SUPABASE_URL === 'string' &&
        (data.SUPABASE_URL.includes('demo-tresno.supabase.co') || data.SUPABASE_URL.includes('your-project'))
      ) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['SUPABASE_URL'],
          message: 'Di mode PRODUCTION, SUPABASE_URL wajib menggunakan project Supabase live nyata!',
        });
      }

      if (
        !data.SUPABASE_SERVICE_ROLE_KEY ||
        data.SUPABASE_SERVICE_ROLE_KEY.includes('dummy') ||
        data.SUPABASE_SERVICE_ROLE_KEY.includes('your_')
      ) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['SUPABASE_SERVICE_ROLE_KEY'],
          message: 'Di mode PRODUCTION, SUPABASE_SERVICE_ROLE_KEY wajib diisi dengan Secret Key resmi!',
        });
      }

      if (
        !data.AGORA_APP_ID ||
        data.AGORA_APP_ID.includes('dummy') ||
        data.AGORA_APP_ID.includes('your_')
      ) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['AGORA_APP_ID'],
          message: 'Di mode PRODUCTION, AGORA_APP_ID wajib menggunakan App ID dari console.agora.io!',
        });
      }

      if (data.CORS_ORIGIN === '*') {
        console.warn(
          '⚠️ [SECURITY WARNING] CORS_ORIGIN disetel ke "*" di production. Disarankan mengganti dengan domain spesifik (misal: https://app.tresno.id).'
        );
      }
    }
  });

export type ServerEnv = z.infer<typeof serverEnvSchema>;

const parsed = serverEnvSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('\n❌ =======================================================');
  console.error('❌ GAGAL MEMUAT ENVIRONMENT VARIABLES (WORKWISE SCHEMA CHECK)');
  console.error('❌ =======================================================');
  parsed.error.issues.forEach((issue: z.ZodIssue) => {
    console.error(`🔴 [${issue.path.join('.') || 'CONFIG'}]: ${issue.message}`);
  });
  console.error('\n👉 Pastikan Anda telah mengisi file .env.production atau .env.development dengan benar.\n');
  process.exit(1);
}

export const env = parsed.data;

export const isProduction = env.NODE_ENV === 'production';
export const isDevelopment = env.NODE_ENV === 'development';
export const isTest = env.NODE_ENV === 'test';
