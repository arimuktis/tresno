/**
 * API Types & Unified BaseResponse Schema
 * Diadopsi dari arsitektur standar produksi Anbu & WorkWise
 */

export interface BaseResponse<T = any> {
  success?: boolean;
  code?: string;
  codeSystem?: string;
  title?: string;
  messageTitle?: string;
  message?: string;
  type?: ApiErrorType | string;
  icon?: string;
  data?: T;
  result?: T;
  errorCode?: string;
  fieldErrors?: Record<string, string>;
  details?: Record<string, any>;
}

export type ApiErrorType =
  | 'session_expired'
  | 'maintenance'
  | 'force_update'
  | 'payment_required'
  | 'network'
  | 'timeout'
  | 'validation'
  | 'default';

export interface RequestOptions extends RequestInit {
  /** Idempotency key unik untuk operasi transaksi/mutasi (ala WorkWise) */
  idempotencyKey?: string;
  /** Timeout kustom dalam milidetik (default 15.000 ms) */
  timeoutMs?: number;
  /** Bypass token untuk staging / mode maintenance (ala Anbu) */
  bypassMaintenance?: string;
  /** Menandakan apakah request membutuhkan Bearer token auth (default: true) */
  requiresAuth?: boolean;
  /** Tambahan headers spesifik */
  headers?: Record<string, string>;
}
