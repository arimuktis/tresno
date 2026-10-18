/**
 * Production-Grade ApiClient
 * Menggabungkan arsitektur standar produksi WorkWise & Anbu:
 * - Struktur Header Lengkap (Standard, Auth, Anti-Replay Security Signature, Idempotency, Client Metadata)
 * - Struktur Body Terpadu (BaseResponse<T>, fieldErrors, details)
 * - Interceptor & Error Handling (401 Auth, 402 Top Up, 426 Force Update, 503 Maintenance, Timeout)
 * - Monadic Result Pattern (Result<T, DomainError>)
 */

import { Platform } from 'react-native';
import { clientEnv } from '../../config/env';
import { supabase, isRealSupabaseConfigured } from '../services/supabaseClient';
import { BaseResponse, RequestOptions, ApiErrorType } from './apiTypes';
import { Result, ok, err } from './Result';
import {
  DomainError,
  NetworkError,
  TimeoutError,
  AuthenticationError,
  PaymentRequiredError,
  MaintenanceError,
  ForceUpdateError,
  ValidationError,
} from './AppErrors';
import { useLanguageStore } from '../../i18n';
import { useWalletStore } from '../../features/wallet/stores/useWalletStore';
import { useAuthStore } from '../../features/auth/stores/useAuthStore';
import { getOrCreateDeviceId } from '../../features/auth/services/authService';
import { APP_CONFIG } from '@tresno/shared';

const BASE_URL = clientEnv.API_URL || 'http://localhost:4000';
const DEFAULT_TIMEOUT_MS = 15000;

// Sederhana generator UUID v4 untuk browser & mobile runtime
const generateNonce = (): string => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    try {
      return crypto.randomUUID();
    } catch (_) {}
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

export class ApiClient {
  /**
   * Eksekusi HTTP Request dengan interceptor lengkap
   */
  static async request<T>(
    endpoint: string,
    options: RequestOptions = {}
  ): Promise<Result<T, DomainError>> {
    const cleanBase = BASE_URL.replace(/\/$/, '');
    const cleanEndpoint = endpoint.replace(/^\//, '');
    const url = `${cleanBase}/${cleanEndpoint}`;

    const timeoutMs = options.timeoutMs || DEFAULT_TIMEOUT_MS;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    try {
      // 1. Ambil Token Sesi (Supabase Auth / Local Session)
      let token: string | null = null;
      if (options.requiresAuth !== false) {
        if (isRealSupabaseConfigured()) {
          const { data: sessionData } = await supabase.auth.getSession();
          token = sessionData.session?.access_token || null;
        } else {
          // Fallback session token dari local auth store
          const currentToken = useAuthStore.getState().session?.accessToken;
          token = currentToken || 'demo_bearer_token';
        }
      }

      // 2. Siapkan Security Headers (Anti-Replay ala Anbu)
      const timestamp = Math.floor(Date.now() / 1000).toString();
      const nonce = generateNonce();
      const method = (options.method || 'GET').toUpperCase();

      // 3. Susun Struktur Header Lengkap
      const currentLang = useLanguageStore.getState().currentLanguage || 'id';
      const clientPlatform = Platform.OS === 'web' ? 'mobile-web' : `mobile-${Platform.OS}`;

      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        'Accept-Language': currentLang,
        'X-Client-Platform': clientPlatform,
        'X-App-Version': APP_CONFIG.VERSION || '1.0.0',
        'X-Device-Id': getOrCreateDeviceId(),
        'X-Timestamp': timestamp,
        'X-Nonce': nonce,
        ...(options.headers || {}),
      };

      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      // Idempotency Key untuk mutasi finansial (Koin, Gift, Top Up ala WorkWise)
      if (options.idempotencyKey) {
        headers['X-Idempotency-Key'] = options.idempotencyKey;
      }

      // Bypass token untuk maintenance testing (ala Anbu)
      if (options.bypassMaintenance) {
        headers['X-Bypass-Maintenance'] = options.bypassMaintenance;
      }

      // 4. Lakukan Fetch HTTP Call
      const response = await fetch(url, {
        ...options,
        headers,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      // 5. Tangani Interceptor Response Berdasarkan Kode Status (WorkWise & Anbu)

      // A. 401 Unauthorized (Sesi Kedaluwarsa)
      if (response.status === 401) {
        console.warn(`[ApiClient] 401 Unauthorized on ${endpoint}`);
        // Jika endpoint bukan endpoint login itu sendiri
        if (!endpoint.includes('/auth/login') && !endpoint.includes('/auth/verify')) {
          useAuthStore.getState().logout();
        }
        return err(
          new AuthenticationError('Sesi Anda telah berakhir. Silakan masuk kembali.', {
            status: 401,
            type: 'session_expired',
          })
        );
      }

      // B. 402 Payment Required (Saldo Koin Tidak Cukup)
      if (response.status === 402) {
        console.warn(`[ApiClient] 402 Payment Required on ${endpoint}`);
        useWalletStore.getState().openTopupModal();
        return err(
          new PaymentRequiredError('Saldo koin tidak mencukupi untuk aksi ini.', {
            status: 402,
            type: 'payment_required',
          })
        );
      }

      // C. 426 Upgrade Required (Wajib Update Aplikasi)
      if (response.status === 426) {
        return err(
          new ForceUpdateError('Pembaruan aplikasi diperlukan untuk terus menggunakan layanan.', {
            status: 426,
            type: 'force_update',
          })
        );
      }

      // D. 503 Service Unavailable / Maintenance Mode
      if (response.status === 503) {
        const errorBody: BaseResponse = await response.json().catch(() => ({}));
        return err(
          new MaintenanceError(
            errorBody.message || 'Sistem sedang dalam peningkatan performa berkala.',
            {
              status: 503,
              type: 'maintenance',
              details: errorBody.details,
            }
          )
        );
      }

      // Parse JSON Payload
      const jsonResponse: BaseResponse<T> = await response.json().catch(() => ({}));

      // E. Tangani Validasi Error (400 Bad Request)
      if (response.status === 400 || response.status === 422) {
        return err(
          new ValidationError(jsonResponse.message || 'Data yang dikirimkan tidak valid.', {
            status: response.status,
            type: 'validation',
            fieldErrors: jsonResponse.fieldErrors,
            details: jsonResponse.details,
          })
        );
      }

      // F. Tangani Status HTTP Non-2xx Lainnya
      if (!response.ok || jsonResponse.success === false) {
        const message =
          jsonResponse.message || `Permintaan gagal dengan status ${response.status}.`;
        return err(
          new NetworkError(message, {
            status: response.status,
            type: (jsonResponse.type as ApiErrorType) || 'network',
            details: jsonResponse.details,
          })
        );
      }

      // G. Sukses (Ambil data dari .data atau .result atau root object)
      const resultData = (jsonResponse.data !== undefined
        ? jsonResponse.data
        : jsonResponse.result !== undefined
        ? jsonResponse.result
        : jsonResponse) as T;

      return ok(resultData);
    } catch (error: any) {
      clearTimeout(timeoutId);

      // Handle Timeout Abort
      if (error?.name === 'AbortError') {
        return err(
          new TimeoutError('Koneksi internet lambat (Request Timeout). Silakan coba lagi.', {
            type: 'timeout',
          })
        );
      }

      // Sanitasi pesan teknis agar aman untuk user di production
      const isConnectionLoss =
        error?.message?.toLowerCase().includes('failed to fetch') ||
        error?.message?.toLowerCase().includes('network request failed');

      const userFriendlyMessage = isConnectionLoss
        ? 'Gagal terhubung ke server. Periksa koneksi internet Anda.'
        : error?.message || 'Terjadi gangguan jaringan sementara.';

      return err(
        new NetworkError(userFriendlyMessage, {
          type: 'network',
        })
      );
    }
  }

  /**
   * Helper HTTP Methods
   */
  static get<T>(endpoint: string, options?: RequestOptions): Promise<Result<T, DomainError>> {
    return this.request<T>(endpoint, { ...options, method: 'GET' });
  }

  static post<T>(
    endpoint: string,
    body?: any,
    options?: RequestOptions
  ): Promise<Result<T, DomainError>> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  static put<T>(
    endpoint: string,
    body?: any,
    options?: RequestOptions
  ): Promise<Result<T, DomainError>> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  static patch<T>(
    endpoint: string,
    body?: any,
    options?: RequestOptions
  ): Promise<Result<T, DomainError>> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PATCH',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  static delete<T>(endpoint: string, options?: RequestOptions): Promise<Result<T, DomainError>> {
    return this.request<T>(endpoint, { ...options, method: 'DELETE' });
  }
}

/**
 * Convenience apiClient object (mirroring WorkWise `apiClient`)
 */
export const apiClient = {
  async get<T>(endpoint: string, options?: RequestOptions): Promise<{ data: T }> {
    const res = await ApiClient.get<T>(endpoint, options);
    if (!res.success) throw res.error;
    return { data: res.data };
  },
  async post<T>(endpoint: string, body?: any, options?: RequestOptions): Promise<{ data: T }> {
    const res = await ApiClient.post<T>(endpoint, body, options);
    if (!res.success) throw res.error;
    return { data: res.data };
  },
  async put<T>(endpoint: string, body?: any, options?: RequestOptions): Promise<{ data: T }> {
    const res = await ApiClient.put<T>(endpoint, body, options);
    if (!res.success) throw res.error;
    return { data: res.data };
  },
  async patch<T>(endpoint: string, body?: any, options?: RequestOptions): Promise<{ data: T }> {
    const res = await ApiClient.patch<T>(endpoint, body, options);
    if (!res.success) throw res.error;
    return { data: res.data };
  },
  async delete<T>(endpoint: string, options?: RequestOptions): Promise<{ data: T }> {
    const res = await ApiClient.delete<T>(endpoint, options);
    if (!res.success) throw res.error;
    return { data: res.data };
  },
};
