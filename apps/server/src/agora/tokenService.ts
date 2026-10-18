import { RtcTokenBuilder, RtcRole } from 'agora-token';

const AGORA_APP_ID = process.env.AGORA_APP_ID || 'mock_agora_app_id';
const AGORA_APP_CERTIFICATE = process.env.AGORA_APP_CERTIFICATE || 'mock_agora_app_certificate';

export class AgoraTokenService {
  /**
   * Menghasilkan token Agora dengan durasi expired yang pendek (misal 20 detik atau 60 detik)
   * untuk memastikan tidak ada celah saldo habis tapi call lanjut.
   */
  static generateRtcToken(
    channelName: string,
    uid: number,
    expireSeconds: number,
    isGhostSubscriber = false
  ): string {
    if (!AGORA_APP_ID || AGORA_APP_ID === 'mock_agora_app_id') {
      return `mock_token_${channelName}_${uid}_${isGhostSubscriber ? 'ghost' : 'pub'}_${Date.now()}`;
    }

    const currentTimestamp = Math.floor(Date.now() / 1000);
    const privilegeExpiredTs = currentTimestamp + expireSeconds;
    const role = isGhostSubscriber ? RtcRole.SUBSCRIBER : RtcRole.PUBLISHER;

    return RtcTokenBuilder.buildTokenWithUid(
      AGORA_APP_ID,
      AGORA_APP_CERTIFICATE,
      channelName,
      uid,
      role,
      privilegeExpiredTs,
      privilegeExpiredTs
    );
  }
}
