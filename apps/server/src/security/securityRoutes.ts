import { FastifyPluginAsync } from 'fastify';
import { playIntegrityService } from './playIntegrityService';
import { appCheckService } from './appCheckService';
import {
  SecurityPolicyConfig,
  DEFAULT_SECURITY_POLICY,
  DeviceSecurityVerdict,
} from '@tresno/shared';

interface ThreatReportRecord {
  id: string;
  userId?: string;
  deviceFingerprint?: string;
  threatVerdict: DeviceSecurityVerdict;
  ipAddress?: string;
  reportedAt: number;
}

class ThreatLedger {
  private policy: SecurityPolicyConfig = { ...DEFAULT_SECURITY_POLICY };
  private reports: ThreatReportRecord[] = [
    {
      id: 'TR-20261017-001',
      userId: 'spammer_bot_99',
      deviceFingerprint: 'nox_emulator_x86_genymotion',
      threatVerdict: {
        status: 'CRITICAL_RISK',
        riskScore: 0.98,
        isRooted: true,
        isJailbroken: false,
        isEmulator: true,
        isDebuggerAttached: false,
        isHookDetected: true,
        isRepackaged: false,
        isScreenCaptureActive: false,
        violationReasons: [
          'Root binary /system/xbin/su terdeteksi',
          'Arsitektur emulator Nox x86 terdeteksi',
          'Frida agent port 27042 terdeteksi aktif',
        ],
        checkedAt: Date.now() - 3600000 * 2,
      },
      ipAddress: '103.111.45.12',
      reportedAt: Date.now() - 3600000 * 2,
    },
    {
      id: 'TR-20261017-002',
      userId: 'modded_apk_user',
      deviceFingerprint: 'samsung_a52_repackaged',
      threatVerdict: {
        status: 'SUSPICIOUS',
        riskScore: 0.75,
        isRooted: false,
        isJailbroken: false,
        isEmulator: false,
        isDebuggerAttached: true,
        isHookDetected: false,
        isRepackaged: true,
        isScreenCaptureActive: false,
        violationReasons: [
          'Signature APK tidak cocok dengan Google Play Developer Certificate',
          'Debugger ptrace terdeteksi menempel pada proses aplikasi',
        ],
        checkedAt: Date.now() - 3600000 * 5,
      },
      ipAddress: '180.252.19.88',
      reportedAt: Date.now() - 3600000 * 5,
    },
  ];

  getPolicy(): SecurityPolicyConfig {
    return this.policy;
  }

  updatePolicy(updates: Partial<SecurityPolicyConfig>): SecurityPolicyConfig {
    this.policy = { ...this.policy, ...updates };
    appCheckService.setEnforced(this.policy.enforceAppCheck);
    console.log('[SecurityLedger] Security Policy updated via CMS Admin:', this.policy);
    return this.policy;
  }

  recordThreat(record: Omit<ThreatReportRecord, 'id' | 'reportedAt'>): ThreatReportRecord {
    const newRecord: ThreatReportRecord = {
      id: `TR-${Date.now().toString(36).toUpperCase()}`,
      reportedAt: Date.now(),
      ...record,
    };
    this.reports.unshift(newRecord);
    console.warn(`[ThreatLedger] THREAT DETECTED & LOGGED: ${record.userId || 'Unknown'} - Risk: ${record.threatVerdict.riskScore}`);
    return newRecord;
  }

  getThreats(): ThreatReportRecord[] {
    return this.reports;
  }
}

export const threatLedger = new ThreatLedger();

export const securityRoutes: FastifyPluginAsync = async (fastify) => {
  // -------------------------------------------------------------
  // 1. GOOGLE PLAY INTEGRITY APIS
  // -------------------------------------------------------------

  // Minta Nonce kriptografis sekali pakai sebelum memanggil Play Integrity
  fastify.post('/api/security/integrity/nonce', async (request) => {
    const body = (request.body || {}) as { userId?: string };
    const nonceData = playIntegrityService.generateNonce(body.userId);
    return {
      success: true,
      data: nonceData,
    };
  });

  // Verifikasi Play Integrity Token dari client Android
  fastify.post('/api/security/integrity/verify', async (request, reply) => {
    const body = (request.body || {}) as {
      integrityToken?: string;
      nonce?: string;
      packageName?: string;
      userId?: string;
    };

    if (!body.integrityToken || !body.nonce) {
      return reply.status(400).send({
        success: false,
        message: 'integrityToken dan nonce wajib disertakan.',
      });
    }

    const verdict = await playIntegrityService.verifyIntegrityToken({
      integrityToken: body.integrityToken,
      nonce: body.nonce,
      packageName: body.packageName,
      userId: body.userId,
    });

    const threatEval = playIntegrityService.evaluateThreat(verdict);

    return {
      success: verdict.isValid,
      verdict,
      evaluation: threatEval,
    };
  });

  // -------------------------------------------------------------
  // 2. FIREBASE APP CHECK APIS
  // -------------------------------------------------------------

  // Verifikasi Token App Check
  fastify.post('/api/security/appcheck/verify', async (request) => {
    const body = (request.body || {}) as { token?: string };
    const result = await appCheckService.verifyToken(body.token);
    return {
      success: result.valid,
      data: result,
    };
  });

  // -------------------------------------------------------------
  // 3. THREAT REPORTING & FRAUD AUDIT
  // -------------------------------------------------------------

  // Client melaporkan adanya ancaman root/jailbreak/frida
  fastify.post('/api/security/report-threat', async (request) => {
    const body = (request.body || {}) as {
      userId?: string;
      deviceFingerprint?: string;
      threatVerdict?: DeviceSecurityVerdict;
    };

    if (!body.threatVerdict) {
      return { success: false, message: 'threatVerdict diperlukan.' };
    }

    const recorded = threatLedger.recordThreat({
      userId: body.userId,
      deviceFingerprint: body.deviceFingerprint,
      threatVerdict: body.threatVerdict,
      ipAddress: request.ip,
    });

    return {
      success: true,
      message: 'Threat telemetry recorded.',
      reportId: recorded.id,
    };
  });

  // Ambil Policy Keamanan Aktif
  fastify.get('/api/security/policy', async () => {
    return {
      success: true,
      data: threatLedger.getPolicy(),
    };
  });

  // -------------------------------------------------------------
  // 4. CMS ADMIN SECURITY CONTROLS (Khusus Pemilik APK)
  // -------------------------------------------------------------

  // Update Policy Keamanan dari CMS Admin
  fastify.put('/api/admin/security/policy', async (request) => {
    const body = (request.body || {}) as Partial<SecurityPolicyConfig>;
    const updated = threatLedger.updatePolicy(body);
    return {
      success: true,
      message: 'Kebijakan keamanan sistem berhasil diperbarui.',
      data: updated,
    };
  });

  // Ambil Rekap Telemetri Ancaman & Fraud di CMS Admin
  fastify.get('/api/admin/security/threat-ledger', async () => {
    return {
      success: true,
      data: threatLedger.getThreats(),
    };
  });
};
