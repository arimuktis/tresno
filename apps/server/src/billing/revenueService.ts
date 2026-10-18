import {
  RevenueShareConfig,
  DEFAULT_REVENUE_SHARE_CONFIG,
  WithdrawalRequest,
  TopupTransaction,
  PlatformFinancialStats,
  DEFAULT_COIN_PACKAGES,
  PaymentPackage,
} from '@tresno/shared';

// Initial Mock Withdrawal Requests untuk testing & demo CMS
const INITIAL_WITHDRAWALS: WithdrawalRequest[] = [
  {
    id: 'WD-20261017-001',
    hostId: 'anchor_1',
    hostName: 'Dewi Lestari',
    agencyCode: 'AGENCY_GARUDA',
    method: 'BCA',
    accountNumber: '8271920381',
    accountName: 'Dewi Lestari',
    pointsRequested: 3500,
    ratePerPoint: 100,
    grossAmountIdr: 350000,
    adminFeeIdr: 2500,
    netAmountIdr: 347500,
    status: 'PENDING_REVIEW',
    createdAt: Date.now() - 3600000 * 3, // 3 jam lalu
  },
  {
    id: 'WD-20261017-002',
    hostId: 'anchor_2',
    hostName: 'Bella Putri',
    agencyCode: undefined, // Mandiri
    method: 'DANA',
    accountNumber: '081298765432',
    accountName: 'Bella Putri',
    pointsRequested: 2000,
    ratePerPoint: 100,
    grossAmountIdr: 200000,
    adminFeeIdr: 0,
    netAmountIdr: 200000,
    status: 'APPROVED',
    createdAt: Date.now() - 86400000, // Kemarin
    reviewedAt: Date.now() - 86400000 + 1800000,
  },
  {
    id: 'WD-20261016-003',
    hostId: 'anchor_3',
    hostName: 'Siti Rahma',
    agencyCode: 'AGENCY_BINTANG',
    method: 'MANDIRI',
    accountNumber: '1370019283746',
    accountName: 'Siti Rahmawati',
    pointsRequested: 5000,
    ratePerPoint: 100,
    grossAmountIdr: 500000,
    adminFeeIdr: 2500,
    netAmountIdr: 497500,
    status: 'COMPLETED',
    createdAt: Date.now() - 86400000 * 2, // 2 hari lalu
    reviewedAt: Date.now() - 86400000 * 2 + 3600000,
  },
  {
    id: 'WD-20261015-004',
    hostId: 'anchor_4',
    hostName: 'Nadia Safitri',
    agencyCode: undefined,
    method: 'GOPAY',
    accountNumber: '085712349876',
    accountName: 'Budi Santoso (Rekening Orang Lain)',
    pointsRequested: 2200,
    ratePerPoint: 100,
    grossAmountIdr: 220000,
    adminFeeIdr: 0,
    netAmountIdr: 220000,
    status: 'REJECTED',
    createdAt: Date.now() - 86400000 * 3,
    reviewedAt: Date.now() - 86400000 * 3 + 7200000,
    rejectionReason: 'Nama pemilik rekening GoPay tidak cocok dengan nama KTP KYC Host.',
  },
];

// Initial Spender Top-up Transactions
const INITIAL_TOPUPS: TopupTransaction[] = [
  {
    id: 'INV-20261017-0941',
    userId: 'user_spender_sultan',
    userNickname: 'Sultan Jakarta 99',
    packageId: 'pack_1200k',
    packageName: 'Paket Mahkota Raja VIP',
    amountIdr: 1200000,
    coinsAwarded: 20000,
    bonusCoinsAwarded: 8000,
    couponsAwarded: 20,
    paymentMethod: 'QRIS',
    status: 'PAID',
    createdAt: Date.now() - 7200000,
    paidAt: Date.now() - 7180000,
    isSpenderVIP: true,
  },
  {
    id: 'INV-20261017-0812',
    userId: 'user_whale_surabaya',
    userNickname: 'Juragan Besi',
    packageId: 'pack_600k',
    packageName: 'Paket Konglomerat Sultan',
    amountIdr: 600000,
    coinsAwarded: 9000,
    bonusCoinsAwarded: 3500,
    couponsAwarded: 10,
    paymentMethod: 'VA_BCA',
    status: 'PAID',
    createdAt: Date.now() - 14400000,
    paidAt: Date.now() - 14350000,
    isSpenderVIP: true,
  },
  {
    id: 'INV-20261017-0705',
    userId: 'user_regular_01',
    userNickname: 'Adit Pratama',
    packageId: 'pack_75k',
    packageName: 'Paket Asmara Seru',
    amountIdr: 75000,
    coinsAwarded: 800,
    bonusCoinsAwarded: 200,
    couponsAwarded: 0,
    paymentMethod: 'QRIS',
    status: 'PAID',
    createdAt: Date.now() - 28800000,
    paidAt: Date.now() - 28750000,
  },
];

class RevenueService {
  private config: RevenueShareConfig = { ...DEFAULT_REVENUE_SHARE_CONFIG };
  private withdrawals: WithdrawalRequest[] = [...INITIAL_WITHDRAWALS];
  private topups: TopupTransaction[] = [...INITIAL_TOPUPS];

  // 1. Parameter Config Management
  getConfig(): RevenueShareConfig {
    return this.config;
  }

  updateConfig(updates: Partial<RevenueShareConfig>): RevenueShareConfig {
    this.config = {
      ...this.config,
      ...updates,
    };
    console.log('[RevenueService] Revenue Share Configuration updated via CMS Admin:', this.config);
    return this.config;
  }

  // 2. Kalkulasi Bagi Hasil 3 Pihak (Host, Agency, Pemilik APK)
  calculateSplit(grossIdr: number, hasAgency: boolean) {
    if (!hasAgency) {
      // Skema Host Mandiri
      const hostPercent = this.config.hostShareIndependent;
      const platformPercent = this.config.platformShareIndependent;

      const hostAmount = Math.round((grossIdr * hostPercent) / 100);
      const agencyAmount = 0;
      const platformAmount = grossIdr - hostAmount;

      return {
        hostPercent,
        agencyPercent: 0,
        platformPercent,
        hostAmount,
        agencyAmount,
        platformAmount,
      };
    } else {
      // Skema Host Agensi
      const hostPercent = this.config.hostShareAgency;
      const agencyPercent = this.config.agencyShare;
      const platformPercent = this.config.platformShareAgency;

      const hostAmount = Math.round((grossIdr * hostPercent) / 100);
      const agencyAmount = Math.round((grossIdr * agencyPercent) / 100);
      const platformAmount = grossIdr - hostAmount - agencyAmount;

      return {
        hostPercent,
        agencyPercent,
        platformPercent,
        hostAmount,
        agencyAmount,
        platformAmount,
      };
    }
  }

  // 3. Spender Top-up Invoice & Payment Confirmation
  getCoinPackages(): PaymentPackage[] {
    return DEFAULT_COIN_PACKAGES;
  }

  createTopupInvoice(params: {
    userId: string;
    userNickname: string;
    packageId: string;
    paymentMethod: 'QRIS' | 'VA_BCA' | 'VA_MANDIRI' | 'VA_BRI' | 'VA_BNI' | 'DANA' | 'GOPAY' | 'OVO';
  }): TopupTransaction {
    const pkg = DEFAULT_COIN_PACKAGES.find((p) => p.id === params.packageId) || DEFAULT_COIN_PACKAGES[0];
    const invoiceId = `INV-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

    const tx: TopupTransaction = {
      id: invoiceId,
      userId: params.userId,
      userNickname: params.userNickname,
      packageId: pkg.id,
      packageName: pkg.name,
      amountIdr: pkg.priceIdr,
      coinsAwarded: pkg.coins,
      bonusCoinsAwarded: pkg.bonusCoins,
      couponsAwarded: pkg.matchCouponsBonus || 0,
      paymentMethod: params.paymentMethod,
      status: 'PENDING',
      createdAt: Date.now(),
      isSpenderVIP: pkg.isSpenderVIP,
    };

    this.topups.unshift(tx);
    return tx;
  }

  confirmTopupPayment(invoiceId: string): TopupTransaction | null {
    const tx = this.topups.find((t) => t.id === invoiceId);
    if (!tx) return null;

    tx.status = 'PAID';
    tx.paidAt = Date.now();
    console.log(`[RevenueService] Payment confirmed for invoice ${invoiceId}: Rp ${tx.amountIdr} paid via ${tx.paymentMethod}`);
    return tx;
  }

  getTopupInvoice(invoiceId: string): TopupTransaction | undefined {
    return this.topups.find((t) => t.id === invoiceId);
  }

  getTopupTransactions(): TopupTransaction[] {
    return this.topups;
  }

  // 4. Host Cashout / Withdrawal Lifecycle Management
  createWithdrawalRequest(params: {
    hostId: string;
    hostName: string;
    agencyCode?: string;
    method: 'BCA' | 'MANDIRI' | 'BRI' | 'BNI' | 'DANA' | 'GOPAY' | 'OVO';
    accountNumber: string;
    accountName: string;
    points: number;
  }): { success: boolean; message: string; withdrawal?: WithdrawalRequest } {
    if (params.points < this.config.minWithdrawalPoints) {
      return {
        success: false,
        message: `Minimal penarikan adalah ${this.config.minWithdrawalPoints.toLocaleString()} Points (~Rp ${(this.config.minWithdrawalPoints * this.config.pointToIdrRate).toLocaleString()}).`,
      };
    }

    const grossAmountIdr = params.points * this.config.pointToIdrRate;
    const isEWallet = ['DANA', 'GOPAY', 'OVO'].includes(params.method);
    const adminFeeIdr = isEWallet ? 0 : this.config.withdrawalAdminFeeIdr;
    const netAmountIdr = Math.max(0, grossAmountIdr - adminFeeIdr);

    const withdrawalId = `WD-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

    const newWd: WithdrawalRequest = {
      id: withdrawalId,
      hostId: params.hostId,
      hostName: params.hostName,
      agencyCode: params.agencyCode,
      method: params.method,
      accountNumber: params.accountNumber,
      accountName: params.accountName,
      pointsRequested: params.points,
      ratePerPoint: this.config.pointToIdrRate,
      grossAmountIdr,
      adminFeeIdr,
      netAmountIdr,
      status: 'PENDING_REVIEW',
      createdAt: Date.now(),
    };

    this.withdrawals.unshift(newWd);
    console.log(`[RevenueService] New withdrawal request created: ${withdrawalId} for host ${params.hostName} (Rp ${netAmountIdr})`);

    return {
      success: true,
      message: 'Pengajuan penarikan dana berhasil dibuat! Menunggu verifikasi tim admin CMS.',
      withdrawal: newWd,
    };
  }

  reviewWithdrawal(
    id: string,
    action: 'APPROVE' | 'COMPLETE' | 'REJECT',
    reason?: string,
    transferProofUrl?: string
  ): WithdrawalRequest | null {
    const wd = this.withdrawals.find((w) => w.id === id);
    if (!wd) return null;

    if (action === 'APPROVE') {
      wd.status = 'APPROVED';
      wd.reviewedAt = Date.now();
    } else if (action === 'COMPLETE') {
      wd.status = 'COMPLETED';
      wd.reviewedAt = Date.now();
      wd.transferProofUrl = transferProofUrl;
    } else if (action === 'REJECT') {
      wd.status = 'REJECTED';
      wd.reviewedAt = Date.now();
      wd.rejectionReason = reason || 'Data rekening tidak sesuai dengan verifikasi identitas.';
    }

    console.log(`[RevenueService] Withdrawal ${id} reviewed. New status: ${wd.status}`);
    return wd;
  }

  getWithdrawals(filterStatus?: string): WithdrawalRequest[] {
    if (!filterStatus || filterStatus === 'ALL') {
      return this.withdrawals;
    }
    return this.withdrawals.filter((w) => w.status === filterStatus);
  }

  getWithdrawalsByHost(hostId: string): WithdrawalRequest[] {
    return this.withdrawals.filter((w) => w.hostId === hostId);
  }

  // 5. Financial Dashboard Stats untuk CMS Admin Pemilik APK
  getPlatformStats(): PlatformFinancialStats {
    let totalGrossRevenueIdr = 0;
    for (const t of this.topups) {
      if (t.status === 'PAID') {
        totalGrossRevenueIdr += t.amountIdr;
      }
    }

    let totalPayoutCompletedIdr = 0;
    let totalPendingWithdrawalIdr = 0;

    for (const w of this.withdrawals) {
      if (w.status === 'COMPLETED') {
        totalPayoutCompletedIdr += w.netAmountIdr;
      } else if (w.status === 'PENDING_REVIEW' || w.status === 'APPROVED' || w.status === 'PROCESSING') {
        totalPendingWithdrawalIdr += w.netAmountIdr;
      }
    }

    // Profit Bersih Pemilik APK = Omzet Spender - Payout yang telah dicairkan
    const totalPlatformProfitIdr = Math.max(0, totalGrossRevenueIdr - totalPayoutCompletedIdr);

    return {
      totalGrossRevenueIdr,
      totalPayoutCompletedIdr,
      totalPendingWithdrawalIdr,
      totalPlatformProfitIdr,
      totalSpenderCount: new Set(this.topups.map((t) => t.userId)).size,
      totalHostCount: new Set(this.withdrawals.map((w) => w.hostId)).size || 12,
      totalAgencyCount: 3,
    };
  }
}

export const revenueService = new RevenueService();
