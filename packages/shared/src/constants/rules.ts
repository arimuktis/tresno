/**
 * Aturan Bisnis & Parameter Utama Tresno
 */
export const MATCH_RULES = {
  // Durasi gratis pertama kali saat match terhubung (dalam detik)
  FREE_TRIAL_SECONDS: 20,

  // Tarif koin per interval (60 detik) setelah free trial habis
  COINS_PER_INTERVAL: 60,

  // Durasi per interval billing (dalam detik)
  INTERVAL_DURATION_SECONDS: 60,

  // Pendapatan Points yang diperoleh Host per menit (skema bagi hasil 75%)
  HOST_POINTS_PER_INTERVAL: 45,
  HOST_DIAMONDS_PER_INTERVAL: 45, // Backward compatibility alias

  // Biaya matching koin jika pengguna memilih filter gender spesifik
  GENDER_FILTER_COST_COINS: 3,

  // Batas toleransi heartbeat WebSocket sebelum diputus (dalam detik)
  HEARTBEAT_TIMEOUT_SECONDS: 15,

  // Nilai tukar: 1 Point = Rp 100 saat host withdraw (100 Points = $1 USD / ~Rp 15.000)
  POINT_TO_IDR_RATE: 100,
  DIAMOND_TO_IDR_RATE: 100, // Backward compatibility alias

  // Minimum Points untuk pencairan (withdraw) host ala Tigo ($20 USD / Rp 200.000)
  MINIMUM_WITHDRAWAL_POINTS: 2000,
  MINIMUM_WITHDRAWAL_DIAMONDS: 2000, // Backward compatibility alias

  // Hadiah Points yang didapatkan Host cewek setiap membalas 1 pesan chat
  HOST_REPLY_CHAT_POINTS: 2,

  // Biaya initial chat untuk user cowok jika belum berteman dan tanpa kupon
  INITIAL_CHAT_COST_COINS: 10,
} as const;

export const APP_CONFIG = {
  NAME: 'Tresno',
  TAGLINE: 'Temukan Kasih & Teman Bicara',
  PACKAGE_ID: 'com.arimukti.tresno',
  APPLICATION_ID: 'com.arimukti.tresno',
  DOMAIN_PACKAGE_ID: 'id.tresno.app',
  DOMAIN: 'tresno.id',
  APP_URL: 'https://app.tresno.id',
  VERSION: '1.0.0',
} as const;
