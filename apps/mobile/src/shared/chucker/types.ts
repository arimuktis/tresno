export type ChuckerProtocol = 'HTTP' | 'HTTPS' | 'WS';

export type ChuckerMethod =
  | 'GET'
  | 'POST'
  | 'PUT'
  | 'PATCH'
  | 'DELETE'
  | 'HEAD'
  | 'OPTIONS'
  | 'WS-SEND'
  | 'WS-RECV'
  | 'WS-OPEN'
  | 'WS-CLOSE'
  | 'WS-ERROR';

export interface ChuckerTransaction {
  id: string;
  timestamp: number;
  protocol: ChuckerProtocol;
  method: ChuckerMethod | string;
  url: string;
  path: string;
  host: string;
  isPending: boolean;
  durationMs: number;
  
  // Status
  statusCode?: number;
  statusText?: string;
  error?: string;

  // Request details
  requestHeaders: Record<string, string>;
  requestBody?: any;
  requestBodyRaw?: string;
  requestSize?: number;

  // Response details
  responseHeaders?: Record<string, string>;
  responseBody?: any;
  responseBodyRaw?: string;
  responseSize?: number;

  // Utilities
  curlCommand?: string;
}

export type ChuckerFilter = 'all' | 'errors' | 'http' | 'ws' | 'pending';

export interface ChuckerStats {
  total: number;
  success: number;
  errors: number;
  ws: number;
  pending: number;
}
