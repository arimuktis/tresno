export type TransactionType = 
  | 'topup_qris' 
  | 'topup_va'
  | 'topup_ewallet'
  | 'topup_gpay' 
  | 'video_chat' 
  | 'gift_sent' 
  | 'gift_received' 
  | 'host_withdraw';

export interface CoinDeductionEvent {
  channelId: string;
  userId: string;
  deductedAmount: number;
  newBalance: number;
  intervalIndex: number;
  isRenewed: boolean;
  nextRenewalTimestamp: number;
  newAgoraToken?: string;
  pointsAwarded?: number;
}

export interface CoinBalanceUpdate {
  userId: string;
  coinBalance: number;
  pointsBalance?: number;
  diamondBalance: number;
}

export interface PaymentPackage {
  id: string;
  name: string;
  coins: number;
  bonusCoins: number;
  matchCouponsBonus?: number;
  priceIdr: number;
  badge?: string;
  isSpenderVIP?: boolean;
}

export const DEFAULT_COIN_PACKAGES: PaymentPackage[] = [
  // Tier Reguler & Hemat
  { id: 'pack_15k', name: 'Paket Kencan Awal', coins: 120, bonusCoins: 0, priceIdr: 15000 },
  { id: 'pack_35k', name: 'Paket Temu Akrab', coins: 350, bonusCoins: 50, priceIdr: 35000, badge: 'Hemat' },
  { id: 'pack_75k', name: 'Paket Asmara Seru', coins: 800, bonusCoins: 200, priceIdr: 75000, badge: 'Populer' },
  { id: 'pack_150k', name: 'Paket Juragan Tresno', coins: 1800, bonusCoins: 500, matchCouponsBonus: 2, priceIdr: 150000, badge: 'Terbaik' },
  
  // Tier Spender & Whale Eksklusif (High-Ticket Spender ala Tigo)
  { id: 'pack_300k', name: 'Paket Sultan Muda VIP', coins: 4000, bonusCoins: 1200, matchCouponsBonus: 5, priceIdr: 300000, badge: 'VIP Spender', isSpenderVIP: true },
  { id: 'pack_600k', name: 'Paket Konglomerat Sultan', coins: 9000, bonusCoins: 3500, matchCouponsBonus: 10, priceIdr: 600000, badge: 'Whale Exclusive', isSpenderVIP: true },
  { id: 'pack_1200k', name: 'Paket Mahkota Raja VIP', coins: 20000, bonusCoins: 8000, matchCouponsBonus: 20, priceIdr: 1200000, badge: 'Mahkota VIP', isSpenderVIP: true },
  { id: 'pack_2500k', name: 'Paket Emperor Ultimate Whale', coins: 48000, bonusCoins: 22000, matchCouponsBonus: 50, priceIdr: 2500000, badge: 'Sultan Tertinggi', isSpenderVIP: true },
];

export type WithdrawalStatus = 
  | 'PENDING_REVIEW' 
  | 'APPROVED' 
  | 'PROCESSING' 
  | 'COMPLETED' 
  | 'REJECTED';

export interface WithdrawalRequest {
  id: string;
  hostId: string;
  hostName: string;
  agencyCode?: string;
  method: 'BCA' | 'MANDIRI' | 'BRI' | 'BNI' | 'DANA' | 'GOPAY' | 'OVO';
  accountNumber: string;
  accountName: string;
  pointsRequested: number;
  ratePerPoint: number;
  grossAmountIdr: number;
  adminFeeIdr: number;
  netAmountIdr: number;
  status: WithdrawalStatus;
  createdAt: number;
  reviewedAt?: number;
  rejectionReason?: string;
  transferProofUrl?: string;
}

export interface RevenueShareConfig {
  // Skema Host Mandiri (Independent Host)
  hostShareIndependent: number; // default: 75%
  platformShareIndependent: number; // default: 25%

  // Skema Host Agensi (Agency-managed Host)
  hostShareAgency: number; // default: 60%
  agencyShare: number; // default: 15%
  platformShareAgency: number; // default: 25%

  // Kurs & Parameter Penarikan
  pointToIdrRate: number; // default: 100 (1 Point = Rp 100)
  minWithdrawalPoints: number; // default: 2000 Points ($20 USD / Rp 200.000)
  withdrawalAdminFeeIdr: number; // default: 2500 (Rp 2.500)
}

export const DEFAULT_REVENUE_SHARE_CONFIG: RevenueShareConfig = {
  hostShareIndependent: 75,
  platformShareIndependent: 25,
  hostShareAgency: 60,
  agencyShare: 15,
  platformShareAgency: 25,
  pointToIdrRate: 100,
  minWithdrawalPoints: 2000,
  withdrawalAdminFeeIdr: 2500,
};

export interface TopupTransaction {
  id: string;
  userId: string;
  userNickname: string;
  packageId: string;
  packageName: string;
  amountIdr: number;
  coinsAwarded: number;
  bonusCoinsAwarded: number;
  couponsAwarded: number;
  paymentMethod: 'QRIS' | 'VA_BCA' | 'VA_MANDIRI' | 'VA_BRI' | 'VA_BNI' | 'DANA' | 'GOPAY' | 'OVO';
  status: 'PENDING' | 'PAID' | 'FAILED' | 'EXPIRED';
  createdAt: number;
  paidAt?: number;
  isSpenderVIP?: boolean;
}

export interface PlatformFinancialStats {
  totalGrossRevenueIdr: number; // Total topup spender masuk
  totalPayoutCompletedIdr: number; // Total withdraw host yang selesai dicairkan
  totalPendingWithdrawalIdr: number; // Total withdraw yang masih pending di review
  totalPlatformProfitIdr: number; // Total profit bersih pemilik APK
  totalSpenderCount: number;
  totalHostCount: number;
  totalAgencyCount: number;
}
