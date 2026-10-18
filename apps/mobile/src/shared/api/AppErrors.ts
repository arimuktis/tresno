/**
 * Domain Error Classes (ala WorkWise & Anbu)
 * Menyediakan pemisahan yang jelas antara error autentikasi, jaringan, validasi, pembayaran, dan pemeliharaan.
 */

import { ApiErrorType } from './apiTypes';

export abstract class DomainError extends Error {
  abstract readonly code: string;
  readonly type: ApiErrorType = 'default';
  readonly status?: number;
  readonly details?: Record<string, any>;
  readonly fieldErrors?: Record<string, string>;

  constructor(
    message: string,
    options?: {
      status?: number;
      type?: ApiErrorType;
      details?: Record<string, any>;
      fieldErrors?: Record<string, string>;
    }
  ) {
    super(message);
    if (options?.status) this.status = options.status;
    if (options?.type) this.type = options.type;
    if (options?.details) this.details = options.details;
    if (options?.fieldErrors) this.fieldErrors = options.fieldErrors;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class NetworkError extends DomainError {
  readonly code = 'NETWORK_ERROR';
}

export class TimeoutError extends DomainError {
  readonly code = 'TIMEOUT_ERROR';
}

export class AuthenticationError extends DomainError {
  readonly code = 'AUTH_ERROR';
}

export class PaymentRequiredError extends DomainError {
  readonly code = 'PAYMENT_REQUIRED';
}

export class MaintenanceError extends DomainError {
  readonly code = 'MAINTENANCE_ERROR';
}

export class ForceUpdateError extends DomainError {
  readonly code = 'FORCE_UPDATE_ERROR';
}

export class ValidationError extends DomainError {
  readonly code = 'VALIDATION_ERROR';
}
