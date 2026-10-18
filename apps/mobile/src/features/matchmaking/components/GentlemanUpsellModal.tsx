import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import {
  Crown,
  Coins,
  Ticket,
  ShieldCheck,
  Zap,
  Clock,
  Check,
  X,
  Sparkles,
  QrCode,
  ArrowRight,
} from 'lucide-react-native';
import { THEME } from '../../../theme/tokens';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useWalletStore } from '../../wallet/stores/useWalletStore';
import { useThemeStore } from '../../../theme/useThemeStore';
import { Button } from '../../../shared/components/atoms/Button';

export const GentlemanUpsellModal: React.FC = () => {
  const insets = useSafeAreaInsets();
  const { colors, isDark } = useThemeStore();
  const { isStarterPackModalOpen, closeStarterPackModal, buyStarterPack } = useWalletStore();

  const [timeLeftSeconds, setTimeLeftSeconds] = useState(599); // 09:59 countdown urgency
  const [showQrisPayment, setShowQrisPayment] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // Countdown timer for FOMO urgency
  useEffect(() => {
    if (!isStarterPackModalOpen) return;

    const timer = setInterval(() => {
      setTimeLeftSeconds((prev) => (prev > 1 ? prev - 1 : 599));
    }, 1000);

    return () => clearInterval(timer);
  }, [isStarterPackModalOpen]);

  const minutes = Math.floor(timeLeftSeconds / 60);
  const seconds = timeLeftSeconds % 60;
  const formattedTime = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  const handleOpenQris = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setShowQrisPayment(true);
    }, 450);
  };

  const handleCompletePayment = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setShowQrisPayment(false);
      buyStarterPack();
    }, 600);
  };

  const handleClose = () => {
    setShowQrisPayment(false);
    closeStarterPackModal();
  };

  const PERKS = [
    {
      icon: <Coins size={20} color="#FFB800" />,
      title: '120 Koin Video Call Langsung',
      desc: 'Cukup untuk 2-3 panggilan video call 1-on-1 tanpa khawatir terputus.',
      value: 'Senilai Rp 30.000',
    },
    {
      icon: <Ticket size={20} color="#FF2D55" />,
      title: '5 Kupon Matchmaking Spesial',
      desc: '20 detik matchmaking gratis per kupon dengan fitur skip instan bebas pulsa.',
      value: 'Senilai Rp 15.000',
    },
    {
      icon: <ShieldCheck size={20} color="#00D26A" />,
      title: '100% Filter Host Wanita Asli',
      desc: 'Radar hanya memindai host wanita asli terverifikasi KYC. Bebas bot & sesama pria.',
      value: 'Garansi 100%',
    },
    {
      icon: <Zap size={20} color="#00E5FF" />,
      title: 'Radar Prioritas Kilat (2 Detik)',
      desc: 'Bypass antrean matchmaking server reguler. Terhubung langsung tanpa menunggu.',
      value: 'Koneksi Prioritas',
    },
    {
      icon: <Crown size={20} color="#FFD700" />,
      title: 'Badge Mahkota Emas Gentleman VIP',
      desc: 'Tersemat di avatar profil & frame video call. Respon wanita naik hingga 300%.',
      value: 'Akses Eksklusif',
    },
  ];

  return (
    <Modal
      visible={isStarterPackModalOpen}
      transparent
      animationType="fade"
      onRequestClose={handleClose}
    >
      <View style={styles.modalBackdrop}>
        <View
          style={[
            styles.modalContainer,
            {
              backgroundColor: isDark ? '#12111A' : '#FFFFFF',
              borderColor: '#FFB800',
              paddingBottom: Math.max(insets.bottom, 16),
            },
          ]}
        >
          {/* Header Bar */}
          <View style={styles.topHeader}>
            <View style={styles.badgeRow}>
              <View style={styles.vipTag}>
                <Crown size={12} color="#000" fill="#000" />
                <Text style={styles.vipTagText}>KHUSUS MEMBER PRIA BARU</Text>
              </View>
              <View style={[styles.timerTag, { borderColor: '#FFB800' }]}>
                <Clock size={11} color="#FFB800" />
                <Text style={styles.timerText}>{formattedTime}</Text>
              </View>
            </View>

            <TouchableOpacity
              testID="btn-close-gentleman-upsell"
              accessibilityLabel="btn-close-gentleman-upsell"
              onPress={handleClose}
              style={[styles.closeBtn, { backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)' }]}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <X size={18} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          {!showQrisPayment ? (
            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.scrollContent}
            >
              {/* Hero Banner Title */}
              <View style={styles.heroSection}>
                <View style={styles.crownHalo}>
                  <Crown size={38} color="#FFB800" fill="#FFB800" />
                </View>
                <Text style={[styles.mainTitle, { color: colors.text }]}>
                  Paket Perdana Gentleman VIP
                </Text>
                <Text style={[styles.subTitle, { color: colors.textSecondary }]}>
                  Tingkatkan peluang terhubung dengan wanita idaman secara instan & tanpa batas
                </Text>

                {/* Price Display */}
                <View style={[styles.priceBox, { backgroundColor: isDark ? 'rgba(255, 184, 0, 0.08)' : '#FFF9E6' }]}>
                  <View style={styles.priceLeft}>
                    <Text style={styles.strikePrice}>Rp 50.000</Text>
                    <View style={styles.activePriceRow}>
                      <Text style={[styles.activePriceCurrency, { color: colors.text }]}>Rp</Text>
                      <Text style={[styles.activePriceNumber, { color: '#FFB800' }]}>9.900</Text>
                    </View>
                  </View>
                  <View style={styles.discountBadge}>
                    <Sparkles size={12} color="#000" />
                    <Text style={styles.discountText}>HEMAT 80%</Text>
                  </View>
                </View>
              </View>

              {/* 5 Value Perks */}
              <View style={styles.perksList}>
                <Text style={[styles.perksSectionTitle, { color: colors.textSecondary }]}>
                  KEUNTUNGAN GENTLEMAN VIP:
                </Text>

                {PERKS.map((perk, idx) => (
                  <View
                    key={idx}
                    style={[
                      styles.perkCard,
                      {
                        backgroundColor: isDark ? 'rgba(255,255,255,0.04)' : '#F9F9FB',
                        borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)',
                      },
                    ]}
                  >
                    <View style={styles.perkIconBox}>{perk.icon}</View>
                    <View style={{ flex: 1, marginHorizontal: 10 }}>
                      <Text style={[styles.perkTitle, { color: colors.text }]}>{perk.title}</Text>
                      <Text style={[styles.perkDesc, { color: colors.textSecondary }]}>
                        {perk.desc}
                      </Text>
                    </View>
                    <View style={styles.perkValuePill}>
                      <Text style={styles.perkValueText}>{perk.value}</Text>
                    </View>
                  </View>
                ))}
              </View>

              {/* Instant Checkout Button */}
              <View style={styles.ctaContainer}>
                <TouchableOpacity
                  activeOpacity={0.88}
                  onPress={handleOpenQris}
                  style={styles.payBtn}
                >
                  {isProcessing ? (
                    <ActivityIndicator color="#000000" />
                  ) : (
                    <View style={styles.payBtnRow}>
                      <Crown size={18} color="#000000" fill="#000000" />
                      <Text style={styles.payBtnText}>
                        Aktifkan Gentleman VIP • Rp 9.900
                      </Text>
                      <ArrowRight size={18} color="#000000" />
                    </View>
                  )}
                </TouchableOpacity>

                {/* Payment Channels Pill */}
                <View style={styles.paymentMethodsRow}>
                  <Text style={[styles.methodText, { color: colors.textSecondary }]}>
                    QRIS Instan: GoPay • DANA • OVO • ShopeePay • BCA Mobile
                  </Text>
                </View>

                {/* Dismiss Link */}
                <TouchableOpacity
                  testID="btn-dismiss-gentleman-upsell"
                  accessibilityLabel="btn-dismiss-gentleman-upsell"
                  onPress={handleClose}
                  style={styles.dismissBtn}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.dismissText, { color: colors.textSecondary }]}>
                    Nanti Saja, Lanjutkan Akun Gratis
                  </Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          ) : (
            /* QRIS Payment Screen */
            <View style={styles.qrisScreen}>
              <View style={styles.qrisHeader}>
                <QrCode size={26} color="#FFB800" />
                <Text style={[styles.qrisTitle, { color: colors.text }]}>
                  Pembayaran QRIS Instan
                </Text>
                <Text style={[styles.qrisSub, { color: colors.textSecondary }]}>
                  Pindai menggunakan aplikasi e-wallet atau mobile banking apa pun
                </Text>
              </View>

              {/* Mock QRIS Visual Box */}
              <View style={styles.mockQrBox}>
                <View style={styles.qrInnerFrame}>
                  <QrCode size={130} color="#000000" />
                  <Text style={styles.qrLabel}>TRESNO GENTLEMAN VIP</Text>
                  <Text style={styles.qrPrice}>Rp 9.900</Text>
                </View>
              </View>

              <Text style={[styles.supportedApps, { color: colors.textSecondary }]}>
                Mendukung semua aplikasi berstandar QRIS Indonesia
              </Text>

              {/* 1-Click Simulated Payment */}
              <View style={styles.qrisActionContainer}>
                <Button
                  title={isProcessing ? 'Memproses Aktivasi...' : 'Bayar Sekarang via QRIS (Rp 9.900)'}
                  isLoading={isProcessing}
                  onPress={handleCompletePayment}
                  style={{
                    backgroundColor: '#FFB800',
                  }}
                  textStyle={{
                    color: '#000000',
                    fontWeight: '800',
                  }}
                />

                <TouchableOpacity
                  onPress={() => setShowQrisPayment(false)}
                  style={styles.backBtn}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.backText, { color: colors.textSecondary }]}>
                    Kembali ke Detail Penawaran
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.82)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 24,
  },
  modalContainer: {
    width: '92%',
    maxWidth: 380,
    maxHeight: '90%',
    borderRadius: 24,
    borderWidth: 1.5,
    overflow: 'hidden',
    shadowColor: '#FFB800',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 24,
    elevation: 12,
  },
  topHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingTop: 16,
    paddingBottom: 10,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  vipTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFB800',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    gap: 4,
  },
  vipTagText: {
    color: '#000000',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  timerTag: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
    gap: 4,
  },
  timerText: {
    color: '#FFB800',
    fontSize: 11,
    fontWeight: '800',
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    paddingHorizontal: 18,
    paddingBottom: 20,
  },
  heroSection: {
    alignItems: 'center',
    marginTop: 4,
    marginBottom: 16,
  },
  crownHalo: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: 'rgba(255, 184, 0, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 184, 0, 0.35)',
  },
  mainTitle: {
    fontSize: 21,
    fontWeight: '900',
    textAlign: 'center',
    letterSpacing: 0.2,
  },
  subTitle: {
    fontSize: 12,
    textAlign: 'center',
    marginTop: 4,
    paddingHorizontal: 12,
    lineHeight: 17,
  },
  priceBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 14,
    marginTop: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 184, 0, 0.3)',
  },
  priceLeft: {
    flexDirection: 'column',
  },
  strikePrice: {
    fontSize: 11,
    color: '#8E8E93',
    textDecorationLine: 'line-through',
  },
  activePriceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 3,
  },
  activePriceCurrency: {
    fontSize: 14,
    fontWeight: '700',
  },
  activePriceNumber: {
    fontSize: 26,
    fontWeight: '900',
  },
  discountBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFB800',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    gap: 4,
  },
  discountText: {
    color: '#000000',
    fontSize: 11,
    fontWeight: '900',
  },
  perksList: {
    marginTop: 6,
    gap: 8,
  },
  perksSectionTitle: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.6,
    marginBottom: 2,
  },
  perkCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 12,
    borderWidth: 1,
  },
  perkIconBox: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  perkTitle: {
    fontSize: 13,
    fontWeight: '700',
  },
  perkDesc: {
    fontSize: 11,
    marginTop: 2,
    lineHeight: 15,
  },
  perkValuePill: {
    backgroundColor: 'rgba(255, 184, 0, 0.12)',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
  },
  perkValueText: {
    color: '#FFB800',
    fontSize: 9,
    fontWeight: '800',
  },
  ctaContainer: {
    marginTop: 18,
    gap: 8,
  },
  payBtn: {
    backgroundColor: '#FFB800',
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#FFB800',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 4,
  },
  payBtnRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  payBtnText: {
    color: '#000000',
    fontSize: 15,
    fontWeight: '900',
    letterSpacing: 0.3,
  },
  paymentMethodsRow: {
    alignItems: 'center',
    marginTop: 2,
  },
  methodText: {
    fontSize: 10,
    fontWeight: '500',
    textAlign: 'center',
  },
  dismissBtn: {
    paddingVertical: 8,
    alignItems: 'center',
  },
  dismissText: {
    fontSize: 12,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
  qrisScreen: {
    paddingHorizontal: 20,
    paddingVertical: 14,
    alignItems: 'center',
  },
  qrisHeader: {
    alignItems: 'center',
    marginBottom: 16,
  },
  qrisTitle: {
    fontSize: 19,
    fontWeight: '800',
    marginTop: 6,
  },
  qrisSub: {
    fontSize: 12,
    textAlign: 'center',
    marginTop: 4,
    paddingHorizontal: 16,
    lineHeight: 16,
  },
  mockQrBox: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: '#FFB800',
    shadowColor: '#FFB800',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
  },
  qrInnerFrame: {
    alignItems: 'center',
    gap: 6,
  },
  qrLabel: {
    color: '#000000',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
    marginTop: 4,
  },
  qrPrice: {
    color: '#FF2D55',
    fontSize: 18,
    fontWeight: '900',
  },
  supportedApps: {
    fontSize: 11,
    marginTop: 14,
    textAlign: 'center',
  },
  qrisActionContainer: {
    width: '100%',
    marginTop: 18,
    gap: 10,
  },
  backBtn: {
    paddingVertical: 8,
    alignItems: 'center',
  },
  backText: {
    fontSize: 12,
    fontWeight: '600',
  },
});
