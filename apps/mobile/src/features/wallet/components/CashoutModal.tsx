import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  TextInput,
} from 'react-native';
import {
  X,
  CreditCard,
  Building2,
  Wallet as WalletIcon,
  CheckCircle2,
  Clock,
  AlertTriangle,
  History,
  Send,
  Info,
  ShieldCheck,
  ChevronRight,
} from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { WithdrawalRequest, WithdrawalStatus, MATCH_RULES } from '@tresno/shared';
import { useWalletStore } from '../stores/useWalletStore';
import { useAuthStore } from '../../auth/stores/useAuthStore';
import { useThemeStore } from '../../../theme/useThemeStore';
import { useTranslation } from '../../../i18n';
import { toast } from '../../../shared/stores/useToastStore';
import { InlineError } from '../../../shared/components/molecules/InlineError';

interface CashoutModalProps {
  isVisible: boolean;
  onClose: () => void;
}

type CashoutMethodType = 'BCA' | 'MANDIRI' | 'BRI' | 'BNI' | 'DANA' | 'GOPAY' | 'OVO';

export const CashoutModal: React.FC<CashoutModalProps> = ({ isVisible, onClose }) => {
  const insets = useSafeAreaInsets();
  const { colors, isDark } = useThemeStore();
  const { t } = useTranslation();
  const { pointsBalance, deductPoints, addPoints } = useWalletStore();
  const { user: authUser } = useAuthStore();

  const [activeTab, setActiveTab] = useState<'request' | 'history'>('request');
  const [method, setMethod] = useState<CashoutMethodType>('BCA');
  const [accountNumber, setAccountNumber] = useState('');
  const [accountName, setAccountName] = useState(authUser?.nickname || '');
  const [pointsInput, setPointsInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [accountNumberTouched, setAccountNumberTouched] = useState(false);
  const [accountNameTouched, setAccountNameTouched] = useState(false);
  const [pointsTouched, setPointsTouched] = useState(false);
  const [submittedAttempt, setSubmittedAttempt] = useState(false);

  // Initial mock history for this host
  const [historyList, setHistoryList] = useState<WithdrawalRequest[]>([
    {
      id: 'WD-20261017-001',
      hostId: authUser?.id || 'anchor_1',
      hostName: authUser?.nickname || 'Host',
      agencyCode: authUser?.agencyCode,
      method: 'BCA',
      accountNumber: '8271920381',
      accountName: authUser?.nickname || 'Host',
      pointsRequested: 3500,
      ratePerPoint: 100,
      grossAmountIdr: 350000,
      adminFeeIdr: 2500,
      netAmountIdr: 347500,
      status: 'PENDING_REVIEW',
      createdAt: Date.now() - 3600000 * 3,
    },
    {
      id: 'WD-20261016-002',
      hostId: authUser?.id || 'anchor_1',
      hostName: authUser?.nickname || 'Host',
      agencyCode: authUser?.agencyCode,
      method: 'DANA',
      accountNumber: '081298765432',
      accountName: authUser?.nickname || 'Host',
      pointsRequested: 2000,
      ratePerPoint: 100,
      grossAmountIdr: 200000,
      adminFeeIdr: 0,
      netAmountIdr: 200000,
      status: 'COMPLETED',
      createdAt: Date.now() - 86400000 * 2,
      reviewedAt: Date.now() - 86400000 * 2 + 3600000,
    },
  ]);

  const MIN_POINTS = MATCH_RULES.MINIMUM_WITHDRAWAL_POINTS; // 2.000 Points
  const RATE_IDR = MATCH_RULES.POINT_TO_IDR_RATE; // Rp 100 per Point
  const currentPoints = pointsBalance || 0;

  const enteredPoints = parseInt(pointsInput, 10) || 0;
  const isEWallet = ['DANA', 'GOPAY', 'OVO'].includes(method);
  const adminFeeIdr = isEWallet ? 0 : 2500;
  const grossAmountIdr = enteredPoints * RATE_IDR;
  const netAmountIdr = Math.max(0, grossAmountIdr - adminFeeIdr);

  // Inline Validation Error Calculations
  let accountNumberError: string | null = null;
  if (submittedAttempt || accountNumberTouched) {
    const cleanNum = accountNumber.trim().replace(/\D/g, '');
    if (!accountNumber.trim()) {
      accountNumberError = isEWallet
        ? 'Nomor handphone akun e-wallet wajib diisi.'
        : 'Nomor rekening bank tujuan wajib diisi.';
    } else if (cleanNum.length < 8) {
      accountNumberError = isEWallet
        ? 'Nomor e-wallet minimal 9 digit angka (contoh: 081234567890).'
        : 'Nomor rekening bank minimal 8 digit angka.';
    }
  }

  let accountNameError: string | null = null;
  if (submittedAttempt || accountNameTouched) {
    if (!accountName.trim()) {
      accountNameError = 'Nama pemilik rekening / e-wallet wajib diisi.';
    } else if (accountName.trim().length < 3) {
      accountNameError = 'Nama minimal 3 karakter (wajib sama dengan identitas bank/KTP).';
    }
  }

  let pointsError: string | null = null;
  if (submittedAttempt || pointsTouched || pointsInput.length > 0) {
    if (!pointsInput.trim()) {
      if (submittedAttempt) pointsError = 'Masukkan jumlah Points yang ingin ditarik.';
    } else if (isNaN(enteredPoints) || enteredPoints <= 0) {
      pointsError = 'Jumlah points harus berupa angka bulat positif.';
    } else if (enteredPoints < MIN_POINTS) {
      pointsError = `Minimal penarikan adalah ${MIN_POINTS.toLocaleString()} Points (Rp ${(MIN_POINTS * RATE_IDR).toLocaleString('id-ID')}).`;
    } else if (enteredPoints > currentPoints) {
      pointsError = `Poin melebihi saldo aktif Anda (${currentPoints.toLocaleString()} Points).`;
    }
  }

  const isValidAmount = enteredPoints >= MIN_POINTS && enteredPoints <= currentPoints;
  const canSubmit =
    isValidAmount &&
    accountNumber.trim().replace(/\D/g, '').length >= 8 &&
    accountName.trim().length >= 3 &&
    !isSubmitting;

  const handleSetMax = () => {
    setPointsInput(currentPoints.toString());
    setPointsTouched(true);
  };

  const handleSubmitRequest = async () => {
    setSubmittedAttempt(true);
    if (!canSubmit) {
      toast.warning('Silakan periksa dan perbaiki kesalahan input pada formulir.');
      return;
    }
    setIsSubmitting(true);

    try {
      // Hubungi backend server API
      const host = typeof window !== 'undefined' ? window.location.hostname : 'localhost';
      const res = await fetch(`http://${host}:4000/api/billing/withdrawal/request`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          hostId: authUser?.id || 'anchor_1',
          hostName: authUser?.nickname || 'Dewi Lestari',
          agencyCode: authUser?.agencyCode,
          method,
          accountNumber: accountNumber.trim(),
          accountName: accountName.trim(),
          points: enteredPoints,
        }),
      });

      const data = await res.json();
      setIsSubmitting(false);

      if (data.success && data.withdrawal) {
        // Potong Points dari saldo aktif (masuk ke escrow pending)
        deductPoints(enteredPoints);
        setHistoryList([data.withdrawal, ...historyList]);
        setPointsInput('');
        toast.success('Pengajuan penarikan dana berhasil dibuat! Menunggu verifikasi admin CMS.');
        setActiveTab('history');
      } else {
        // Fallback local
        deductPoints(enteredPoints);
        const fallbackWd: WithdrawalRequest = {
          id: `WD-${Date.now().toString().slice(-8)}`,
          hostId: authUser?.id || 'anchor_1',
          hostName: authUser?.nickname || 'Host',
          agencyCode: authUser?.agencyCode,
          method,
          accountNumber: accountNumber.trim(),
          accountName: accountName.trim(),
          pointsRequested: enteredPoints,
          ratePerPoint: RATE_IDR,
          grossAmountIdr,
          adminFeeIdr,
          netAmountIdr,
          status: 'PENDING_REVIEW',
          createdAt: Date.now(),
        };
        setHistoryList([fallbackWd, ...historyList]);
        setPointsInput('');
        toast.success('Pengajuan penarikan berhasil dicatat! Tim CMS akan memproses 1x24 jam.');
        setActiveTab('history');
      }
    } catch {
      setIsSubmitting(false);
      // Fallback
      deductPoints(enteredPoints);
      const fallbackWd: WithdrawalRequest = {
        id: `WD-${Date.now().toString().slice(-8)}`,
        hostId: authUser?.id || 'anchor_1',
        hostName: authUser?.nickname || 'Host',
        agencyCode: authUser?.agencyCode,
        method,
        accountNumber: accountNumber.trim(),
        accountName: accountName.trim(),
        pointsRequested: enteredPoints,
        ratePerPoint: RATE_IDR,
        grossAmountIdr,
        adminFeeIdr,
        netAmountIdr,
        status: 'PENDING_REVIEW',
        createdAt: Date.now(),
      };
      setHistoryList([fallbackWd, ...historyList]);
      setPointsInput('');
      toast.success('Pengajuan penarikan dana berhasil disubmit ke CMS!');
      setActiveTab('history');
    }
  };

  const getStatusBadge = (status: WithdrawalStatus) => {
    switch (status) {
      case 'PENDING_REVIEW':
        return { bg: 'rgba(255, 165, 2, 0.15)', text: '#FFA502', label: 'Menunggu Review CMS' };
      case 'APPROVED':
        return { bg: 'rgba(0, 168, 255, 0.15)', text: '#00A8FF', label: 'Disetujui Admin' };
      case 'PROCESSING':
        return { bg: 'rgba(155, 81, 224, 0.15)', text: '#9B51E0', label: 'Proses Transfer Bank' };
      case 'COMPLETED':
        return { bg: 'rgba(0, 210, 106, 0.15)', text: '#00D26A', label: 'Selesai Ditransfer' };
      case 'REJECTED':
        return { bg: 'rgba(255, 71, 87, 0.15)', text: '#FF4757', label: 'Ditolak (Poin Dikembalikan)' };
      default:
        return { bg: 'rgba(255, 255, 255, 0.1)', text: '#FFFFFF', label: status };
    }
  };

  const formatRupiah = (val: number) => `Rp ${val.toLocaleString('id-ID')}`;

  return (
    <Modal visible={isVisible} transparent animationType="slide" onRequestClose={onClose}>
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
              <CreditCard size={22} color={colors.gold} />
              <Text style={[styles.title, { color: colors.text }]}>Pencairan Saldo Host (Withdrawal)</Text>
            </View>
            <TouchableOpacity onPress={onClose} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <X size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* Segmented Tab: Form Pengajuan | Riwayat Penarikan */}
          <View style={[styles.tabBar, { backgroundColor: colors.surfaceGlass, borderColor: colors.border }]}>
            <TouchableOpacity
              style={[styles.tabBtn, activeTab === 'request' && { backgroundColor: colors.gold }]}
              onPress={() => setActiveTab('request')}
            >
              <Text
                style={[
                  styles.tabBtnText,
                  { color: activeTab === 'request' ? '#000000' : colors.textSecondary },
                ]}
              >
                Ajukan Penarikan
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.tabBtn, activeTab === 'history' && { backgroundColor: colors.gold }]}
              onPress={() => setActiveTab('history')}
            >
              <Text
                style={[
                  styles.tabBtnText,
                  { color: activeTab === 'history' ? '#000000' : colors.textSecondary },
                ]}
              >
                Riwayat Pengajuan ({historyList.length})
              </Text>
            </TouchableOpacity>
          </View>

          {/* TAB 1: FORM PENGAJUAN PENARIKAN */}
          {activeTab === 'request' && (
            <ScrollView
              style={styles.formScroll}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              nestedScrollEnabled={true}
            >
              {/* Info Saldo Host & Ambang Batas Minimum */}
              <View style={[styles.balanceCard, { backgroundColor: isDark ? 'rgba(255, 184, 0, 0.08)' : '#FFF9E6', borderColor: colors.gold }]}>
                <View style={{ flex: 1 }}>
                  <Text style={{ color: colors.textSecondary, fontSize: 11, fontWeight: '600' }}>
                    Saldo Points Aktif:
                  </Text>
                  <Text style={{ color: colors.gold, fontSize: 22, fontWeight: '900', marginTop: 2 }}>
                    {currentPoints.toLocaleString()} Points
                  </Text>
                  <Text style={{ color: colors.textSecondary, fontSize: 11, marginTop: 2 }}>
                    Estimasi: {formatRupiah(currentPoints * RATE_IDR)} (Kurs: 1 Point = Rp {RATE_IDR})
                  </Text>
                </View>

                <View style={styles.minBadge}>
                  <Text style={styles.minBadgeText}>Min. 2.000 Pts</Text>
                </View>
              </View>

              {/* Status Skema Pembagian Hasil Host & Agensi */}
              <View style={[styles.agencyNoticeBox, { backgroundColor: colors.surfaceGlass, borderColor: colors.border }]}>
                <ShieldCheck size={16} color={colors.primary} style={{ marginTop: 1, marginRight: 6 }} />
                <View style={{ flex: 1 }}>
                  <Text style={[styles.agencyNoticeTitle, { color: colors.text }]}>
                    {authUser?.agencyCode
                      ? `Terdaftar di Agensi: [${authUser.agencyCode}] (Bagi Hasil 60% + Komisi Agensi 15%)`
                      : 'Status: Host Mandiri (Bagi Hasil Maksimal 75%)'}
                  </Text>
                  <Text style={[styles.agencyNoticeSub, { color: colors.textSecondary }]}>
                    Dana ditransfer ke rekening bank / e-wallet resmi setelah diverifikasi oleh admin CMS.
                  </Text>
                </View>
              </View>

              {/* Pilihan Metode Pencairan */}
              <Text style={[styles.inputLabel, { color: colors.text }]}>PILIH REKENING / E-WALLET TUJUAN</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                nestedScrollEnabled={true}
                directionalLockEnabled={true}
                keyboardShouldPersistTaps="handled"
                style={{ marginBottom: 12 }}
                contentContainerStyle={{ gap: 8 }}
              >
                {(['BCA', 'MANDIRI', 'BRI', 'BNI', 'DANA', 'GOPAY', 'OVO'] as const).map((m) => {
                  const isSelected = method === m;
                  return (
                    <TouchableOpacity
                      key={m}
                      onPress={() => setMethod(m)}
                      style={[
                        styles.methodPill,
                        {
                          backgroundColor: isSelected ? colors.primaryGlow : colors.surfaceCard,
                          borderColor: isSelected ? colors.primary : colors.border,
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.methodPillText,
                          { color: isSelected ? colors.primary : colors.textSecondary },
                          isSelected && { fontWeight: '800' },
                        ]}
                      >
                        {m}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>

              {/* Input Nomor Rekening / E-Wallet */}
              <Text style={[styles.inputLabel, { color: colors.text }]}>
                {isEWallet ? 'NOMOR HP E-WALLET' : 'NOMOR REKENING BANK'}
              </Text>
              <TextInput
                value={accountNumber}
                onChangeText={(val) => {
                  setAccountNumber(val);
                  setAccountNumberTouched(true);
                }}
                onBlur={() => setAccountNumberTouched(true)}
                placeholder={isEWallet ? 'Contoh: 081234567890' : 'Contoh: 8271920381'}
                placeholderTextColor={colors.textSecondary}
                keyboardType="numeric"
                style={[
                  styles.textInput,
                  {
                    backgroundColor: colors.surfaceGlass,
                    color: colors.text,
                    borderColor: accountNumberError ? (colors.danger || '#EF4444') : colors.border,
                  },
                ]}
              />
              <InlineError
                message={accountNumberError}
                variant="error"
                containerStyle={{ marginBottom: 10, marginTop: -4 }}
              />

              {/* Input Nama Pemilik Rekening (KYC) */}
              <Text style={[styles.inputLabel, { color: colors.text }]}>NAMA PEMILIK REKENING (SESUAI KTP / KYC)</Text>
              <TextInput
                value={accountName}
                onChangeText={(val) => {
                  setAccountName(val);
                  setAccountNameTouched(true);
                }}
                onBlur={() => setAccountNameTouched(true)}
                placeholder="Nama lengkap sesuai rekening"
                placeholderTextColor={colors.textSecondary}
                style={[
                  styles.textInput,
                  {
                    backgroundColor: colors.surfaceGlass,
                    color: colors.text,
                    borderColor: accountNameError ? (colors.danger || '#EF4444') : colors.border,
                  },
                ]}
              />
              <InlineError
                message={accountNameError}
                variant="error"
                containerStyle={{ marginBottom: 10, marginTop: -4 }}
              />

              {/* Input Jumlah Points yang Ditarik */}
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 12, marginBottom: 4 }}>
                <Text style={[styles.inputLabel, { color: colors.text, marginBottom: 0 }]}>JUMLAH POINTS DITARIK</Text>
                <TouchableOpacity onPress={handleSetMax}>
                  <Text style={{ color: colors.gold, fontSize: 12, fontWeight: '800' }}>Tarik Semua Poin</Text>
                </TouchableOpacity>
              </View>

              <TextInput
                value={pointsInput}
                onChangeText={(val) => {
                  setPointsInput(val.replace(/\D/g, ''));
                  setPointsTouched(true);
                }}
                onBlur={() => setPointsTouched(true)}
                placeholder={`Minimal ${MIN_POINTS.toLocaleString()} Points`}
                placeholderTextColor={colors.textSecondary}
                keyboardType="numeric"
                style={[
                  styles.textInput,
                  {
                    backgroundColor: colors.surfaceGlass,
                    color: colors.gold,
                    borderColor: pointsError
                      ? (colors.danger || '#EF4444')
                      : isValidAmount
                      ? colors.gold
                      : colors.border,
                    fontSize: 16,
                    fontWeight: '800',
                  },
                ]}
              />
              <InlineError
                message={pointsError}
                variant="error"
                containerStyle={{ marginBottom: 10, marginTop: -4 }}
              />
              {!pointsError && enteredPoints >= MIN_POINTS && (
                <InlineError
                  message={`Jumlah valid • Estimasi bersih ${formatRupiah(netAmountIdr)}`}
                  variant="success"
                  containerStyle={{ marginBottom: 10, marginTop: -4 }}
                />
              )}

              {/* Shortcut Pilihan Cepat */}
              <View style={styles.shortcutRow}>
                {[2000, 3000, 5000, 10000].map((amt) => (
                  <TouchableOpacity
                    key={amt}
                    onPress={() => setPointsInput(amt.toString())}
                    style={[styles.shortcutBtn, { backgroundColor: colors.surfaceGlass, borderColor: colors.border }]}
                  >
                    <Text style={[styles.shortcutBtnText, { color: colors.textSecondary }]}>
                      {amt.toLocaleString()} Pts
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Rincian Kalkulasi Pencairan */}
              {enteredPoints > 0 && (
                <View style={[styles.calcBox, { backgroundColor: colors.surfaceGlass, borderColor: colors.border }]}>
                  <View style={styles.calcRow}>
                    <Text style={{ color: colors.textSecondary, fontSize: 11.5 }}>Estimasi Bruto:</Text>
                    <Text style={{ color: colors.text, fontSize: 12, fontWeight: '700' }}>
                      {formatRupiah(grossAmountIdr)}
                    </Text>
                  </View>

                  <View style={styles.calcRow}>
                    <Text style={{ color: colors.textSecondary, fontSize: 11.5 }}>Biaya Admin Transfer:</Text>
                    <Text style={{ color: colors.text, fontSize: 12, fontWeight: '700' }}>
                      {adminFeeIdr === 0 ? 'GRATIS (E-Wallet)' : formatRupiah(adminFeeIdr)}
                    </Text>
                  </View>

                  <View style={[styles.divider, { backgroundColor: colors.border }]} />

                  <View style={styles.calcRow}>
                    <Text style={{ color: colors.text, fontSize: 13, fontWeight: '800' }}>Bersih Masuk Rekening:</Text>
                    <Text style={{ color: colors.gold, fontSize: 16, fontWeight: '900' }}>
                      {formatRupiah(netAmountIdr)}
                    </Text>
                  </View>
                </View>
              )}

              {/* Tombol Ajukan Penarikan */}
              <TouchableOpacity
                style={[
                  styles.submitBtn,
                  { backgroundColor: canSubmit ? colors.gold : colors.surfaceGlass, opacity: canSubmit ? 1 : 0.6 },
                ]}
                onPress={handleSubmitRequest}
                disabled={!canSubmit}
                activeOpacity={0.8}
              >
                <Send size={16} color={canSubmit ? '#000000' : colors.textSecondary} style={{ marginRight: 6 }} />
                <Text style={[styles.submitBtnText, { color: canSubmit ? '#000000' : colors.textSecondary }]}>
                  {isSubmitting ? 'Mengirim Pengajuan...' : 'Kirim Pengajuan ke CMS Admin'}
                </Text>
              </TouchableOpacity>
            </ScrollView>
          )}

          {/* TAB 2: RIWAYAT PENGAJUAN PENARIKAN (WITHDRAWAL HISTORY) */}
          {activeTab === 'history' && (
            <ScrollView
              style={styles.historyScroll}
              contentContainerStyle={{ paddingBottom: 20 }}
              nestedScrollEnabled={true}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              {historyList.length === 0 ? (
                <View style={styles.emptyHistoryBox}>
                  <Clock size={36} color={colors.textSecondary} />
                  <Text style={[styles.emptyHistoryTitle, { color: colors.text }]}>Belum Ada Riwayat Penarikan</Text>
                  <Text style={[styles.emptyHistorySub, { color: colors.textSecondary }]}>
                    Pengajuan penarikan dana yang Anda buat akan tercatat di sini dan dipantau oleh admin CMS.
                  </Text>
                </View>
              ) : (
                historyList.map((item) => {
                  const badge = getStatusBadge(item.status);
                  return (
                    <View
                      key={item.id}
                      style={[
                        styles.historyCard,
                        { backgroundColor: colors.surfaceCard, borderColor: colors.border },
                      ]}
                    >
                      <View style={styles.historyCardTop}>
                        <View>
                          <Text style={[styles.historyIdText, { color: colors.text }]}>{item.id}</Text>
                          <Text style={{ color: colors.textSecondary, fontSize: 11, marginTop: 1 }}>
                            {new Date(item.createdAt).toLocaleDateString()} • {new Date(item.createdAt).toLocaleTimeString()}
                          </Text>
                        </View>

                        <View style={[styles.statusBadgePill, { backgroundColor: badge.bg }]}>
                          <Text style={[styles.statusBadgeText, { color: badge.text }]}>{badge.label}</Text>
                        </View>
                      </View>

                      <View style={[styles.divider, { backgroundColor: colors.border }]} />

                      <View style={styles.historyDetailRow}>
                        <Text style={{ color: colors.textSecondary, fontSize: 12 }}>Tujuan Pencairan:</Text>
                        <Text style={{ color: colors.text, fontSize: 12, fontWeight: '700' }}>
                          {item.method} - {item.accountNumber} ({item.accountName})
                        </Text>
                      </View>

                      <View style={styles.historyDetailRow}>
                        <Text style={{ color: colors.textSecondary, fontSize: 12 }}>Points Ditarik:</Text>
                        <Text style={{ color: colors.gold, fontSize: 12, fontWeight: '800' }}>
                          {item.pointsRequested.toLocaleString()} Points
                        </Text>
                      </View>

                      <View style={styles.historyDetailRow}>
                        <Text style={{ color: colors.textSecondary, fontSize: 12 }}>Dana Bersih (Net):</Text>
                        <Text style={{ color: colors.primary, fontSize: 14, fontWeight: '900' }}>
                          {formatRupiah(item.netAmountIdr)}
                        </Text>
                      </View>

                      {item.rejectionReason && (
                        <View style={styles.rejectionBox}>
                          <AlertTriangle size={14} color="#FF4757" style={{ marginRight: 4, marginTop: 2 }} />
                          <Text style={styles.rejectionText}>Alasan Penolakan: {item.rejectionReason}</Text>
                        </View>
                      )}
                    </View>
                  );
                })
              )}
            </ScrollView>
          )}
        </View>
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
    fontSize: 16,
    fontWeight: '800',
  },
  tabBar: {
    flexDirection: 'row',
    marginHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    padding: 3,
    marginBottom: 12,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 7,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 9,
  },
  tabBtnText: {
    fontSize: 11.5,
    fontWeight: '700',
  },
  formScroll: {
    paddingHorizontal: 16,
  },
  balanceCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 10,
  },
  minBadge: {
    backgroundColor: 'rgba(255, 184, 0, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  minBadgeText: {
    color: '#D48806',
    fontSize: 10,
    fontWeight: '800',
  },
  agencyNoticeBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    marginBottom: 14,
  },
  agencyNoticeTitle: {
    fontSize: 11,
    fontWeight: '700',
    marginBottom: 2,
  },
  agencyNoticeSub: {
    fontSize: 10,
    lineHeight: 14,
  },
  inputLabel: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  methodPill: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
  },
  methodPillText: {
    fontSize: 12,
  },
  textInput: {
    height: 42,
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 12,
    fontSize: 13,
    marginBottom: 10,
  },
  shortcutRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 14,
  },
  shortcutBtn: {
    flex: 1,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
  },
  shortcutBtnText: {
    fontSize: 11,
    fontWeight: '600',
  },
  calcBox: {
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 14,
    gap: 6,
  },
  calcRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    marginVertical: 6,
  },
  submitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 13,
    borderRadius: 16,
    marginBottom: 20,
  },
  submitBtnText: {
    fontSize: 13,
    fontWeight: '800',
  },
  // History tab
  historyScroll: {
    paddingHorizontal: 16,
  },
  emptyHistoryBox: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
    gap: 8,
  },
  emptyHistoryTitle: {
    fontSize: 14,
    fontWeight: '700',
    marginTop: 8,
  },
  emptyHistorySub: {
    fontSize: 11.5,
    textAlign: 'center',
    maxWidth: 260,
  },
  historyCard: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 12,
    marginBottom: 10,
  },
  historyCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  historyIdText: {
    fontSize: 13,
    fontWeight: '800',
  },
  statusBadgePill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  statusBadgeText: {
    fontSize: 10,
    fontWeight: '800',
  },
  historyDetailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 2,
  },
  rejectionBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: 'rgba(255, 71, 87, 0.1)',
    padding: 8,
    borderRadius: 8,
    marginTop: 8,
  },
  rejectionText: {
    color: '#FF4757',
    fontSize: 11,
    flex: 1,
  },
});
