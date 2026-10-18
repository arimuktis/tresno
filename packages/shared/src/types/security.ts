/**
 * Types & Enums untuk Sistem Keamanan Tingkat Tinggi (Enterprise Anti-Fraud & Integrity)
 * Meliputi deteksi Root/Jailbreak, Anti-Frida/Hooking, Google Play Integrity API, dan Firebase App Check.
 */

export type SecurityThreatLevel = 'SECURE' | 'SUSPICIOUS' | 'CRITICAL_RISK';

export interface DeviceSecurityVerdict {
  status: SecurityThreatLevel;
  riskScore: number; // 0.0 (Aman) - 1.0 (Berbahaya / Fraud)
  isRooted: boolean;
  isJailbroken: boolean;
  isEmulator: boolean;
  isDebuggerAttached: boolean;
  isHookDetected: boolean; // Frida, Xposed, Magisk, Substrate
  isRepackaged: boolean; // Signature certificate mismatch
  isScreenCaptureActive: boolean; // DRM screen recording protection
  violationReasons: string[];
  checkedAt: number;
}

export interface PlayIntegrityNonceResponse {
  nonce: string;
  expiresAt: number;
}

export interface PlayIntegrityVerificationRequest {
  integrityToken: string;
  nonce: string;
  packageName?: string;
  userId?: string;
}

export interface PlayIntegrityVerdict {
  isValid: boolean;
  deviceIntegrity: ('MEETS_BASIC_INTEGRITY' | 'MEETS_DEVICE_INTEGRITY' | 'MEETS_STRONG_INTEGRITY')[];
  appRecognitionVerdict: 'PLAY_RECOGNIZED' | 'UNRECOGNIZED_VERSION' | 'UNEVALUATED';
  appLicensingVerdict: 'LICENSED' | 'UNLICENSED' | 'UNEVALUATED';
  appAccessRisk?: {
    hasAccessibilityMalware: boolean;
    hasUnknownOverlay: boolean;
  };
  timestampMillis: number;
  error?: string;
}

export interface AppCheckVerificationResult {
  valid: boolean;
  appId?: string;
  provider?: 'play_integrity' | 'app_attest' | 'device_check' | 'debug';
  issuedAt?: number;
  expiresAt?: number;
  message?: string;
}

export interface SecurityPolicyConfig {
  blockRootJailbreak: boolean;
  blockEmulators: boolean;
  blockFridaHooks: boolean;
  enforcePlayIntegrity: boolean;
  enforceAppCheck: boolean;
  enforceDrmScreenProtection: boolean;
}

export const DEFAULT_SECURITY_POLICY: SecurityPolicyConfig = {
  blockRootJailbreak: true,
  blockEmulators: true,
  blockFridaHooks: true,
  enforcePlayIntegrity: true,
  enforceAppCheck: true,
  enforceDrmScreenProtection: true,
};
