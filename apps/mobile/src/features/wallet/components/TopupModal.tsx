import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  Platform,
} from 'react-native';
import {
  X,
  Coins,
  Crown,
  Sparkles,
  QrCode,
  Building2,
  Wallet as WalletIcon,
  Copy,
  CheckCircle2,
  Clock,
  ArrowRight,
  ShieldCheck,
  Globe,
  Lock,
} from 'lucide-react-native';
import { THEME } from '../../../theme/tokens';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { DEFAULT_COIN_PACKAGES, PaymentPackage, TopupTransaction } from '@tresno/shared';
import { useWalletStore } from '../stores/useWalletStore';
import { useAuthStore } from '../../auth/stores/useAuthStore';
import { useThemeStore } from '../../../theme/useThemeStore';
import { useTranslation } from '../../../i18n';
import { toast } from '../../../shared/stores/useToastStore';
import { WebCheckoutModal } from './WebCheckoutModal';

type PaymentMethodType = 'QRIS' | 'VA_BCA' | 'VA_MANDIRI' | 'VA_BRI' | 'VA_BNI' | 'DANA' | 'GOPAY' | 'OVO';

export const TopupModal: React.FC = () => {
  const insets = useSafeAreaInsets();
  const { isTopupModalVisible, closeTopupModal, addCoins, addMatchCoupons } = useWalletStore();
  const { user: authUser } = useAuthStore();
  const { colors, isDark } = useThemeStore();
  const { t } = useTranslation();

  const [categoryFilter, setCategoryFilter] = useState<'all' | 'regular' | 'spender'>('all');
  const [selectedPack, setSelectedPack] = useState<PaymentPackage>(DEFAULT_COIN_PACKAGES[1]);
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethodType>('QRIS');
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeInvoice, setActiveInvoice] = useState<TopupTransaction | null>(null);
  const [isWebviewOpen, setIsWebviewOpen] = useState(false);

  const displayedPackages = DEFAULT_COIN_PACKAGES.filter((p) => {
    if (categoryFilter === 'regular') return !p.isSpenderVIP;
    if (categoryFilter === 'spender') return p.isSpenderVIP;
    return true;
  });

  const handleCheckout = async () => {
    setIsProcessing(true);

    try {
      // Hubungi server backend untuk membuat invoice spender
      const host = typeof window !== 'undefined' ? window.location.hostname : 'localhost';
      const res = await fetch(`http://${host}:4000/api/billing/topup/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: authUser?.id || 'user_guest',
          userNickname: authUser?.nickname || 'Sultan Spender',
          packageId: selectedPack.id,
          paymentMethod: selectedMethod,
        }),
      });

      const data = await res.json();
      setIsProcessing(false);

      if (data.success && data.data) {
        setActiveInvoice(data.data);
        setIsWebviewOpen(true);
      } else {
        // Fallback local invoice jika server offline
        const fallbackInv: TopupTransaction = {
          id: `INV-${Date.now().toString().slice(-8)}`,
          userId: authUser?.id || 'me',
          userNickname: authUser?.nickname || 'Saya',
          packageId: selectedPack.id,
          packageName: selectedPack.name,
          amountIdr: selectedPack.priceIdr,
          coinsAwarded: selectedPack.coins,
          bonusCoinsAwarded: selectedPack.bonusCoins,
          couponsAwarded: selectedPack.matchCouponsBonus || 0,
          paymentMethod: selectedMethod,
          status: 'PENDING',
          createdAt: Date.now(),
          isSpenderVIP: selectedPack.isSpenderVIP,
        };
        setActiveInvoice(fallbackInv);
        setIsWebviewOpen(true);
      }
    } catch {
      setIsProcessing(false);
      // Fallback
      const fallbackInv: TopupTransaction = {
        id: `INV-${Date.now().toString().slice(-8)}`,
        userId: authUser?.id || 'me',
        userNickname: authUser?.nickname || 'Saya',
        packageId: selectedPack.id,
        packageName: selectedPack.name,
        amountIdr: selectedPack.priceIdr,
        coinsAwarded: selectedPack.coins,
        bonusCoinsAwarded: selectedPack.bonusCoins,
        couponsAwarded: selectedPack.matchCouponsBonus || 0,
        paymentMethod: selectedMethod,
        status: 'PENDING',
        createdAt: Date.now(),
        isSpenderVIP: selectedPack.isSpenderVIP,
      };
      setActiveInvoice(fallbackInv);
      setIsWebviewOpen(true);
    }
  };

  const handleConfirmPayment = async () => {
    if (!activeInvoice) return;

    try {
      const host = typeof window !== 'undefined' ? window.location.hostname : 'localhost';
      await fetch(`http://${host}:4000/api/billing/topup/confirm`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ invoiceId: activeInvoice.id }),
      }).catch(() => {});
    } catch {
      // ignore
    }

    const totalCoins = activeInvoice.coinsAwarded + activeInvoice.bonusCoinsAwarded;
    addCoins(totalCoins);

    if (activeInvoice.couponsAwarded > 0) {
      addMatchCoupons(activeInvoice.couponsAwarded);
      toast.success(
        `Pembayaran Berhasil! +${totalCoins.toLocaleString()} Koin dan +${activeInvoice.couponsAwarded} Kupon Matchmaking ditambahkan ke akunmu!`
      );
    } else {
      toast.success(`Pembayaran Berhasil! +${totalCoins.toLocaleString()} Koin telah ditambahkan ke dompetmu!`);
    }

    setActiveInvoice(null);
    closeTopupModal();
  };

  const copyToClipboard = (text: string, label: string) => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(text);
      toast.success(`${label} berhasil disalin!`);
    }
  };

  const formatRupiah = (val: number) => `Rp ${val.toLocaleString('id-ID')}`;

  return (
    <Modal
      visible={isTopupModalVisible}
      transparent
      animationType="slide"
      onRequestClose={closeTopupModal}
    >
      <View style={styles.modalBackdrop}>
        <View
          style={[
            styles.sheetContainer,
            {
              backgroundColor: colors.surface,
              borderTopColor: colors.border,
              paddingBottom: Math.max(insets.bottom, 16),
            },
          ]}
        >
          {/* Header */}
          <View style={styles.header}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Coins size={22} color={colors.gold} />
              <Text style={[styles.title, { color: colors.text }]}>{t('wallet.title')}</Text>
            </View>
            <TouchableOpacity
              onPress={() => {
                setActiveInvoice(null);
                closeTopupModal();
              }}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <X size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* SCREEN 1: PILIH PAKET & METODE BAYAR */}
          {!activeInvoice ? (
            <>
              {/* Category Segment: Semua | Reguler | VIP Spender */}
              <View style={[styles.filterBar, { backgroundColor: colors.surfaceGlass, borderColor: colors.border }]}>
                {(
                  [
                    { key: 'all', label: 'Semua Paket' },
                    { key: 'regular', label: 'Reguler' },
                    { key: 'spender', label: 'VIP Spender & Whale' },
                  ] as const
                ).map((tab) => {
                  const isSelected = categoryFilter === tab.key;
                  return (
                    <TouchableOpacity
                      key={tab.key}
                      onPress={() => setCategoryFilter(tab.key)}
                      style={[
                        styles.filterTab,
                        isSelected && { backgroundColor: tab.key === 'spender' ? colors.gold : colors.primary },
                      ]}
                    >
                      <Text
                        style={[
                          styles.filterTabText,
                          {
                            color: isSelected
                              ? tab.key === 'spender'
                                ? '#000000'
                                : '#FFFFFF'
                              : colors.textSecondary,
                            fontWeight: isSelected ? '800' : '600',
                          },
                        ]}
                      >
                        {tab.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              <ScrollView
                style={styles.packageScroll}
                showsVerticalScrollIndicator={false}
                nestedScrollEnabled={true}
                keyboardShouldPersistTaps="handled"
              >
                {/* List Paket Koin */}
                <View style={{ gap: 8, paddingBottom: 10 }}>
                  {displayedPackages.map((pack) => {
                    const isSelected = selectedPack.id === pack.id;
                    const isVIP = pack.isSpenderVIP;

                    return (
                      <TouchableOpacity
                        key={pack.id}
                        activeOpacity={0.8}
                        onPress={() => setSelectedPack(pack)}
                        style={[
                          styles.packCard,
                          {
                            backgroundColor: isSelected
                              ? isVIP
                                ? isDark ? 'rgba(255, 184, 0, 0.12)' : '#FFF9E6'
                                : colors.primaryGlow
                              : colors.surfaceCard,
                            borderColor: isSelected ? (isVIP ? colors.gold : colors.primary) : colors.border,
                            borderWidth: isSelected ? 2 : 1,
                          },
                        ]}
                      >
                        <View style={styles.packLeft}>
                          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                            {isVIP ? (
                              <Crown size={18} color={colors.gold} />
                            ) : (
                              <Coins size={18} color={colors.gold} />
                            )}
                            <Text style={[styles.packCoins, { color: isVIP ? colors.gold : colors.text }]}>
                              {(pack.coins + pack.bonusCoins).toLocaleString()} Koin
                            </Text>
                          </View>

                          <View style={styles.bonusBadgesRow}>
                            {pack.bonusCoins > 0 && (
                              <View style={[styles.bonusPill, { backgroundColor: 'rgba(0, 210, 106, 0.15)' }]}>
                                <Text style={styles.bonusPillText}>
                                  +{pack.bonusCoins.toLocaleString()} Bonus
                                </Text>
                              </View>
                            )}

                            {pack.matchCouponsBonus && pack.matchCouponsBonus > 0 && (
                              <View style={[styles.bonusPill, { backgroundColor: isDark ? 'rgba(255, 184, 0, 0.2)' : 'rgba(255, 184, 0, 0.3)' }]}>
                                <Text style={[styles.bonusPillText, { color: colors.gold }]}>
                                  +{pack.matchCouponsBonus} Kupon Call
                                </Text>
                              </View>
                            )}

                            {pack.badge && (
                              <View style={[styles.badgePill, { backgroundColor: isVIP ? colors.gold : colors.primary }]}>
                                <Text style={[styles.badgePillText, isVIP && { color: '#000000' }]}>
                                  {pack.badge}
                                </Text>
                              </View>
                            )}
                          </View>
                        </View>

                        <View style={styles.packRight}>
                          <Text style={[styles.packPrice, { color: isVIP ? colors.gold : colors.primary }]}>
                            {formatRupiah(pack.priceIdr)}
                          </Text>
                        </View>
                      </TouchableOpacity>
                    );
                  })}
                </View>

                {/* Pilih Metode Pembayaran */}
                <Text style={[styles.sectionHeading, { color: colors.textSecondary }]}>
                  METODE PEMBAYARAN INSTAN
                </Text>

                <View style={styles.methodGrid}>
                  {[
                    { id: 'QRIS', label: 'QRIS Instan', icon: QrCode, sub: 'BCA, DANA, GoPay, ShopeePay' },
                    { id: 'VA_BCA', label: 'BCA Virtual Account', icon: Building2, sub: 'Konfirmasi Otomatis' },
                    { id: 'VA_MANDIRI', label: 'Mandiri Livin VA', icon: Building2, sub: 'Konfirmasi Otomatis' },
                    { id: 'DANA', label: 'DANA E-Wallet', icon: WalletIcon, sub: 'Direct App' },
                  ].map((m) => {
                    const isSelected = selectedMethod === m.id;
                    const IconComp = m.icon;
                    return (
                      <TouchableOpacity
                        key={m.id}
                        onPress={() => setSelectedMethod(m.id as PaymentMethodType)}
                        style={[
                          styles.methodCard,
                          {
                            backgroundColor: isSelected ? colors.primaryGlow : colors.surfaceCard,
                            borderColor: isSelected ? colors.primary : colors.border,
                          },
                        ]}
                      >
                        <IconComp size={18} color={isSelected ? colors.primary : colors.textSecondary} />
                        <View style={{ flex: 1, marginLeft: 8 }}>
                          <Text style={[styles.methodTitle, { color: colors.text }]}>{m.label}</Text>
                          <Text style={[styles.methodSub, { color: colors.textSecondary }]}>{m.sub}</Text>
                        </View>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </ScrollView>

              {/* Bottom Sticky Checkout Bar */}
              <View style={[styles.checkoutBar, { backgroundColor: colors.surfaceCard, borderTopColor: colors.border }]}>
                <View style={[styles.antiFraudTag, { backgroundColor: 'rgba(0, 210, 106, 0.08)', borderColor: 'rgba(0, 210, 106, 0.25)' }]}>
                  <ShieldCheck size={13} color="#00D26A" />
                  <Text style={{ color: '#00D26A', fontSize: 10, fontWeight: '700', flex: 1, marginLeft: 4 }}>
                    Bebas Pajak App Store 30% • Anti-Fraud Webview (3D-Secure 2.0 & QRIS)
                  </Text>
                </View>

                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 8 }}>
                  <View style={{ flex: 1 }}>
                    <Text style={{ color: colors.textSecondary, fontSize: 11 }}>Total Pembayaran</Text>
                    <Text style={{ color: selectedPack.isSpenderVIP ? colors.gold : colors.primary, fontSize: 18, fontWeight: '800' }}>
                      {formatRupiah(selectedPack.priceIdr)}
                    </Text>
                  </View>

                  <TouchableOpacity
                    style={[
                      styles.checkoutBtn,
                      { backgroundColor: selectedPack.isSpenderVIP ? colors.gold : colors.primary },
                    ]}
                    onPress={handleCheckout}
                    disabled={isProcessing}
                    activeOpacity={0.8}
                  >
                    <Globe size={15} color={selectedPack.isSpenderVIP ? '#000000' : '#FFFFFF'} style={{ marginRight: 5 }} />
                    <Text style={[styles.checkoutBtnText, selectedPack.isSpenderVIP && { color: '#000000' }]}>
                      {isProcessing ? 'Memuat Webview...' : 'Webview Pay'}
                    </Text>
                    <ArrowRight size={14} color={selectedPack.isSpenderVIP ? '#000000' : '#FFFFFF'} />
                  </TouchableOpacity>
                </View>
              </View>
            </>
          ) : (
            /* SCREEN 2: INVOICE PEMBAYARAN & SIMULASI INSTAN */
            <ScrollView
              style={styles.invoiceScroll}
              contentContainerStyle={{ paddingBottom: 24 }}
              nestedScrollEnabled={true}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              <View style={[styles.invoiceCard, { backgroundColor: colors.surfaceCard, borderColor: colors.border }]}>
                <View style={styles.invoiceHeader}>
                  <View>
                    <Text style={[styles.invoiceNumber, { color: colors.primary }]}>{activeInvoice.id}</Text>
                    <Text style={{ color: colors.textSecondary, fontSize: 11, marginTop: 2 }}>
                      {activeInvoice.packageName}
                    </Text>
                  </View>
                  <View style={[styles.statusBadgePending, { backgroundColor: 'rgba(255, 165, 2, 0.15)' }]}>
                    <Clock size={12} color="#FFA502" />
                    <Text style={{ color: '#FFA502', fontSize: 10, fontWeight: '800' }}>MENUNGGU PEMBAYARAN</Text>
                  </View>
                </View>

                <View style={[styles.divider, { backgroundColor: colors.border }]} />

                {/* QR Code / VA Code Display */}
                <View style={styles.qrisDisplayBox}>
                  {activeInvoice.paymentMethod === 'QRIS' ? (
                    <View style={styles.qrisVisual}>
                      <QrCode size={160} color={isDark ? '#FFFFFF' : '#000000'} />
                      <Text style={[styles.qrisHint, { color: colors.textSecondary }]}>
                        Pindai QRIS menggunakan BCA, GoPay, DANA, OVO, atau ShopeePay
                      </Text>
                    </View>
                  ) : (
                    <View style={styles.vaVisual}>
                      <Text style={[styles.vaLabel, { color: colors.textSecondary }]}>Nomor Virtual Account:</Text>
                      <View style={styles.vaNumberRow}>
                        <Text style={[styles.vaNumber, { color: colors.text }]}>8271081298765432</Text>
                        <TouchableOpacity
                          style={[styles.copyVaBtn, { backgroundColor: colors.primaryGlow }]}
                          onPress={() => copyToClipboard('8271081298765432', 'Nomor VA')}
                        >
                          <Copy size={13} color={colors.primary} />
                          <Text style={[styles.copyVaText, { color: colors.primary }]}>Salin</Text>
                        </TouchableOpacity>
                      </View>
                      <Text style={[styles.vaHint, { color: colors.textSecondary }]}>
                        Batas waktu pembayaran: 23 jam 59 menit
                      </Text>
                    </View>
                  )}
                </View>

                {/* Rincian Pesanan */}
                <View style={[styles.breakdownBox, { backgroundColor: colors.surfaceGlass }]}>
                  <View style={styles.breakdownRow}>
                    <Text style={{ color: colors.textSecondary, fontSize: 12 }}>Koin Utama:</Text>
                    <Text style={{ color: colors.text, fontSize: 12, fontWeight: '700' }}>
                      {activeInvoice.coinsAwarded.toLocaleString()} Koin
                    </Text>
                  </View>
                  {activeInvoice.bonusCoinsAwarded > 0 && (
                    <View style={styles.breakdownRow}>
                      <Text style={{ color: colors.textSecondary, fontSize: 12 }}>Bonus Koin Ekstra:</Text>
                      <Text style={{ color: '#00D26A', fontSize: 12, fontWeight: '700' }}>
                        +{activeInvoice.bonusCoinsAwarded.toLocaleString()} Koin
                      </Text>
                    </View>
                  )}
                  {activeInvoice.couponsAwarded > 0 && (
                    <View style={styles.breakdownRow}>
                      <Text style={{ color: colors.textSecondary, fontSize: 12 }}>Bonus Kupon Match VIP:</Text>
                      <Text style={{ color: colors.gold, fontSize: 12, fontWeight: '700' }}>
                        +{activeInvoice.couponsAwarded} Kupon Gratis
                      </Text>
                    </View>
                  )}
                  <View style={[styles.divider, { backgroundColor: colors.border }]} />
                  <View style={styles.breakdownRow}>
                    <Text style={{ color: colors.text, fontSize: 14, fontWeight: '800' }}>Total Bayar:</Text>
                    <Text style={{ color: colors.primary, fontSize: 16, fontWeight: '900' }}>
                      {formatRupiah(activeInvoice.amountIdr)}
                    </Text>
                  </View>
                </View>
              </View>

              {/* Tombol Buka Webview Checkout Resmi */}
              <TouchableOpacity
                style={[styles.reopenWebviewBtn, { backgroundColor: 'rgba(0, 210, 106, 0.12)', borderColor: '#00D26A' }]}
                onPress={() => setIsWebviewOpen(true)}
                activeOpacity={0.8}
              >
                <Globe size={16} color="#00D26A" style={{ marginRight: 6 }} />
                <Text style={{ color: '#00D26A', fontWeight: '800', fontSize: 13 }}>
                  Buka Webview Checkout (Anti-Fraud & 3DS)
                </Text>
              </TouchableOpacity>

              {/* Tombol Konfirmasi Selesai Bayar */}
              <TouchableOpacity
                style={[styles.confirmPaidBtn, { backgroundColor: colors.primary }]}
                onPress={handleConfirmPayment}
                activeOpacity={0.8}
              >
                <CheckCircle2 size={18} color="#FFFFFF" style={{ marginRight: 6 }} />
                <Text style={styles.confirmPaidText}>Saya Sudah Bayar (Konfirmasi Instan)</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.cancelInvoiceBtn, { borderColor: colors.border }]}
                onPress={() => setActiveInvoice(null)}
              >
                <Text style={{ color: colors.textSecondary, fontSize: 12, fontWeight: '600' }}>
                  Ganti Paket / Metode Lain
                </Text>
              </TouchableOpacity>
            </ScrollView>
          )}
        </View>

        {/* Anti-Fraud H5 Webview Payment Gateway Modal (ala Tigo OutWebPay / GoblinWebActivity) */}
        <WebCheckoutModal
          isVisible={isWebviewOpen}
          invoice={activeInvoice}
          onClose={() => setIsWebviewOpen(false)}
          onPaymentSuccess={(payload) => {
            const totalCoins = payload.coinsAwarded;
            addCoins(totalCoins);
            if (payload.couponsAwarded && payload.couponsAwarded > 0) {
              addMatchCoupons(payload.couponsAwarded);
            }
            setIsWebviewOpen(false);
            setActiveInvoice(null);
            closeTopupModal();
          }}
        />
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  sheetContainer: {
    width: '100%',
    maxWidth: 414,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    borderTopWidth: 1,
    maxHeight: '92%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: -0.2,
  },
  filterBar: {
    flexDirection: 'row',
    marginHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    padding: 3,
    marginBottom: 12,
  },
  filterTab: {
    flex: 1,
    paddingVertical: 7,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 9,
  },
  filterTabText: {
    fontSize: 11.5,
  },
  packageScroll: {
    paddingHorizontal: 16,
    maxHeight: 400,
  },
  packCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 14,
  },
  packLeft: {
    flex: 1,
  },
  packCoins: {
    fontSize: 16,
    fontWeight: '800',
  },
  bonusBadgesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    marginTop: 4,
  },
  bonusPill: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  bonusPillText: {
    color: '#00D26A',
    fontSize: 10,
    fontWeight: '700',
  },
  badgePill: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  badgePillText: {
    color: '#FFFFFF',
    fontSize: 9.5,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  packRight: {
    alignItems: 'flex-end',
  },
  packPrice: {
    fontSize: 15,
    fontWeight: '800',
  },
  sectionHeading: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.6,
    marginTop: 16,
    marginBottom: 8,
  },
  methodGrid: {
    gap: 8,
    marginBottom: 16,
  },
  methodCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
  },
  methodTitle: {
    fontSize: 12,
    fontWeight: '700',
  },
  methodSub: {
    fontSize: 10,
    marginTop: 1,
  },
  checkoutBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    gap: 12,
  },
  checkoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 18,
    paddingVertical: 11,
    borderRadius: 16,
  },
  checkoutBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
  // Invoice screen
  invoiceScroll: {
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  invoiceCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    marginBottom: 14,
  },
  invoiceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  invoiceNumber: {
    fontSize: 14,
    fontWeight: '800',
  },
  statusBadgePending: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    marginVertical: 12,
  },
  qrisDisplayBox: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
  },
  qrisVisual: {
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
  },
  qrisHint: {
    fontSize: 11,
    textAlign: 'center',
    marginTop: 8,
    maxWidth: 240,
  },
  vaVisual: {
    width: '100%',
    alignItems: 'center',
    paddingVertical: 10,
  },
  vaLabel: {
    fontSize: 11,
    marginBottom: 4,
  },
  vaNumberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginVertical: 6,
  },
  vaNumber: {
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: 1,
  },
  copyVaBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  copyVaText: {
    fontSize: 11,
    fontWeight: '700',
  },
  vaHint: {
    fontSize: 10.5,
    marginTop: 4,
  },
  breakdownBox: {
    padding: 12,
    borderRadius: 10,
    gap: 6,
  },
  breakdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  confirmPaidBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 13,
    borderRadius: 16,
    marginBottom: 8,
  },
  confirmPaidText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
  cancelInvoiceBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 14,
    borderWidth: 1,
  },
  antiFraudTag: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 4,
  },
  reopenWebviewBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 14,
    borderWidth: 1.2,
    marginBottom: 10,
  },
});
