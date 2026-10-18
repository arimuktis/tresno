import { useChuckerStore } from './chuckerStore';
import { ChuckerTransaction, ChuckerMethod } from './types';

function parseUrlParts(rawUrl: string): { host: string; path: string } {
  try {
    const parsed = new URL(rawUrl, typeof window !== 'undefined' ? window.location.origin : 'http://localhost');
    return {
      host: parsed.host,
      path: parsed.pathname + parsed.search,
    };
  } catch {
    return {
      host: '',
      path: rawUrl,
    };
  }
}

export function generateCurl(
  url: string,
  method: string,
  headers: Record<string, string>,
  body?: any
): string {
  const parts: string[] = [`curl -X ${method.toUpperCase()} "${url}"`];

  for (const [key, value] of Object.entries(headers)) {
    // Escape quotes
    const escapedVal = value.replace(/"/g, '\\"');
    parts.push(`-H "${key}: ${escapedVal}"`);
  }

  if (body) {
    let bodyStr = '';
    if (typeof body === 'string') {
      bodyStr = body;
    } else {
      try {
        bodyStr = JSON.stringify(body);
      } catch {
        bodyStr = String(body);
      }
    }
    const escapedBody = bodyStr.replace(/'/g, "'\\''");
    parts.push(`--data-raw '${escapedBody}'`);
  }

  return parts.join(' \\\n  ');
}

export function formatBytes(bytes?: number): string {
  if (bytes === undefined || bytes === null || isNaN(bytes)) return '0 B';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

/**
 * Global Network Interceptor untuk Fetch API
 */
export function initChucker() {
  if (typeof window === 'undefined') return;
  if ((window as any).__chucker_initialized) return;
  (window as any).__chucker_initialized = true;

  const originalFetch = window.fetch;

  window.fetch = async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
    const rawUrl = typeof input === 'string' ? input : input instanceof URL ? input.toString() : input.url;
    const method = (init?.method || (typeof input === 'object' && 'method' in input ? input.method : 'GET')).toUpperCase() as ChuckerMethod;

    // Abaikan jika endpoint internal tertentu yang tidak perlu di-log (opsional)
    const { host, path } = parseUrlParts(rawUrl);

    // Parse Request Headers
    const reqHeaders: Record<string, string> = {};
    if (init?.headers) {
      if (init.headers instanceof Headers) {
        init.headers.forEach((val: string, key: string) => {
          reqHeaders[key] = val;
        });
      } else if (Array.isArray(init.headers)) {
        init.headers.forEach(([key, val]) => {
          reqHeaders[key] = val;
        });
      } else {
        Object.assign(reqHeaders, init.headers);
      }
    }

    // Parse Request Body
    let reqBody: any = undefined;
    let reqBodyRaw: string | undefined = undefined;
    let reqSize = 0;

    if (init?.body) {
      if (typeof init.body === 'string') {
        reqBodyRaw = init.body;
        reqSize = new Blob([init.body]).size;
        try {
          reqBody = JSON.parse(init.body);
        } catch {
          reqBody = init.body;
        }
      } else if (init.body instanceof FormData) {
        reqBody = '[FormData Payload]';
        reqBodyRaw = '[FormData]';
      } else {
        reqBody = '[Binary/Stream Payload]';
      }
    }

    const txId = `tx_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const startTime = performance.now();
    const curlCommand = generateCurl(rawUrl, method, reqHeaders, reqBodyRaw || reqBody);

    const initialTx: ChuckerTransaction = {
      id: txId,
      timestamp: Date.now(),
      protocol: rawUrl.startsWith('https') ? 'HTTPS' : 'HTTP',
      method,
      url: rawUrl,
      path: path || rawUrl,
      host: host || 'localhost',
      isPending: true,
      durationMs: 0,
      requestHeaders: reqHeaders,
      requestBody: reqBody,
      requestBodyRaw: reqBodyRaw,
      requestSize: reqSize,
      curlCommand,
    };

    useChuckerStore.getState().addTransaction(initialTx);

    try {
      const response = await originalFetch(input, init);
      const durationMs = Math.round(performance.now() - startTime);

      // Clone response agar tidak mengonsumsi stream asli yang dibutuhkan pemanggil
      const clonedResponse = response.clone();

      // Parse Response Headers
      const resHeaders: Record<string, string> = {};
      clonedResponse.headers.forEach((val: string, key: string) => {
        resHeaders[key] = val;
      });

      // Parse Response Body secara asynchronous
      clonedResponse.text().then((text) => {
        let resBody: any = text;
        try {
          resBody = JSON.parse(text);
        } catch {
          // Plain text atau html
        }

        const resSize = new Blob([text]).size;

        useChuckerStore.getState().updateTransaction(txId, {
          isPending: false,
          durationMs,
          statusCode: response.status,
          statusText: response.statusText || (response.ok ? 'OK' : 'Error'),
          responseHeaders: resHeaders,
          responseBody: resBody,
          responseBodyRaw: text,
          responseSize: resSize,
        });
      }).catch((readErr) => {
        useChuckerStore.getState().updateTransaction(txId, {
          isPending: false,
          durationMs,
          statusCode: response.status,
          statusText: response.statusText,
          responseHeaders: resHeaders,
          error: `Gagal membaca body respons: ${readErr.message}`,
        });
      });

      return response;
    } catch (fetchErr: any) {
      const durationMs = Math.round(performance.now() - startTime);
      useChuckerStore.getState().updateTransaction(txId, {
        isPending: false,
        durationMs,
        statusCode: 0,
        statusText: 'Failed / Network Error',
        error: fetchErr?.message || 'Network request failed',
      });
      throw fetchErr;
    }
  };
}

/**
 * Perekam Event WebSocket (Signaling / Chat / Matchmaking ala Tigo)
 */
export function recordWebSocketEvent(
  direction: 'SEND' | 'RECV' | 'OPEN' | 'CLOSE' | 'ERROR',
  eventName: string,
  payload?: any,
  url = 'ws://localhost:4000/ws'
) {
  const methodMap: Record<string, ChuckerMethod> = {
    SEND: 'WS-SEND',
    RECV: 'WS-RECV',
    OPEN: 'WS-OPEN',
    CLOSE: 'WS-CLOSE',
    ERROR: 'WS-ERROR',
  };

  const method = methodMap[direction] || 'WS-SEND';
  const { host } = parseUrlParts(url);
  const txId = `ws_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;

  let rawPayload = '';
  try {
    rawPayload = typeof payload === 'string' ? payload : JSON.stringify(payload, null, 2);
  } catch {
    rawPayload = String(payload);
  }

  const tx: ChuckerTransaction = {
    id: txId,
    timestamp: Date.now(),
    protocol: 'WS',
    method,
    url: `${url} [${eventName}]`,
    path: `[WS: ${eventName}]`,
    host: host || 'Signaling Server',
    isPending: false,
    durationMs: 0,
    statusCode: direction === 'ERROR' ? 500 : 101,
    statusText: direction === 'ERROR' ? 'WS Error' : 'Switching Protocols',
    requestHeaders: {
      Connection: 'Upgrade',
      Upgrade: 'websocket',
      'X-Event-Type': eventName,
    },
    requestBody: direction === 'SEND' ? payload : undefined,
    requestBodyRaw: direction === 'SEND' ? rawPayload : undefined,
    responseBody: direction === 'RECV' ? payload : undefined,
    responseBodyRaw: direction === 'RECV' ? rawPayload : undefined,
    requestSize: direction === 'SEND' ? new Blob([rawPayload]).size : 0,
    responseSize: direction === 'RECV' ? new Blob([rawPayload]).size : 0,
    error: direction === 'ERROR' ? (payload?.message || String(payload)) : undefined,
  };

  useChuckerStore.getState().addTransaction(tx);
}
