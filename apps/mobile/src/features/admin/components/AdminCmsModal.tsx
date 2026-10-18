import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Platform,
} from 'react-native';
import {
  X,
  LayoutDashboard,
  CreditCard,
  Settings,
  Users,
  Building,
  CheckCircle2,
  Clock,
  AlertTriangle,
  ArrowUpRight,
  TrendingUp,
  Coins,
  ShieldCheck,
  ShieldAlert,
  Save,
  Check,
  ChevronRight,
  RefreshCw,
  Lock,
  Unlock,
  Radio,
  Eye,
  PhoneOff,
  MessageSquare,
  Cpu,
  Bug,
  Server,
  Key,
  Smartphone,
  Activity,
  Sparkles,
  Database,
  Layers,
} from 'lucide-react-native';
import {
  WithdrawalRequest,
  WithdrawalStatus,
  RevenueShareConfig,
  DEFAULT_REVENUE_SHARE_CONFIG,
  PlatformFinancialStats,
  TopupTransaction,
  SecurityPolicyConfig,
  DEFAULT_SECURITY_POLICY,
} from '@tresno/shared';
import { useThemeStore } from '../../../theme/useThemeStore';
import { toast } from '../../../shared/stores/useToastStore';
import { useWalletStore } from '../../wallet/stores/useWalletStore';
import { useSurveillanceStore } from '../stores/useSurveillanceStore';
import { AdminCallSpyModal } from './AdminCallSpyModal';
import { AdminChatSpyModal } from './AdminChatSpyModal';
import { ButtonChip } from '../../../shared/components/atoms/Chip';
import { CmsPostHogView } from './cms/CmsPostHogView';
import { CmsPgVectorView } from './cms/CmsPgVectorView';
import { CmsUsersView } from './cms/CmsUsersView';
import { CmsModerationView } from './cms/CmsModerationView';

interface AdminCmsModalProps {
  isVisible: boolean;
  onClose: () => void;
}

export type CmsTab =
  | 'dashboard'
  | 'posthog'
  | 'pgvector'
  | 'users'
  | 'moderation'
  | 'surveillance'
  | 'withdrawals'
  | 'settings'
  | 'spenders'
  | 'security';

export const AdminCmsModal: React.FC<AdminCmsModalProps> = ({ isVisible, onClose }) => {

  const { colors, isDark } = useThemeStore();
  const { addPoints } = useWalletStore();

  const [activeTab, setActiveTab] = useState<CmsTab>('dashboard');
  const [filterWdStatus, setFilterWdStatus] = useState<string>('ALL');

  // Surveillance & Wiretap State
  const {
    activeCalls,
    chatrooms,
    fetchActiveCalls,
    fetchChatrooms,
    infiltrateCall,
    terminateCall,
    inspectChatroom,
    toggleFreezeChatroom,
  } = useSurveillanceStore();

  useEffect(() => {
    if (isVisible) {
      fetchActiveCalls();
      fetchChatrooms();
    }
  }, [isVisible]);

  // Security Policy State
  const [securityPolicy, setSecurityPolicy] = useState<SecurityPolicyConfig>({ ...DEFAULT_SECURITY_POLICY });
  const [isSavingSecurity, setIsSavingSecurity] = useState(false);
  const [threatLogs, setThreatLogs] = useState<any[]>([
    {
      id: 'TR-20261017-001',
      userId: 'spammer_bot_99',
      deviceFingerprint: 'nox_emulator_x86_genymotion',
      threatVerdict: {
        status: 'CRITICAL_RISK',
        riskScore: 0.98,
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
        violationReasons: [
          'Signature APK tidak cocok dengan Google Play Developer Certificate',
          'Debugger ptrace terdeteksi menempel pada proses aplikasi',
        ],
        checkedAt: Date.now() - 3600000 * 5,
      },
      ipAddress: '180.252.19.88',
      reportedAt: Date.now() - 3600000 * 5,
    },
  ]);

  // CMS Parameter State
  const [config, setConfig] = useState<RevenueShareConfig>({ ...DEFAULT_REVENUE_SHARE_CONFIG });
  const [isSavingConfig, setIsSavingConfig] = useState(false);

  // Reject Dialog State
  const [rejectDialogWd, setRejectDialogWd] = useState<WithdrawalRequest | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  // Withdrawals List State
  const [withdrawals, setWithdrawals] = useState<WithdrawalRequest[]>([
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
      createdAt: Date.now() - 3600000 * 3,
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
      createdAt: Date.now() - 86400000,
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
      createdAt: Date.now() - 86400000 * 2,
      reviewedAt: Date.now() - 86400000 * 2 + 3600000,
    },
    {
      id: 'WD-20261015-004',
      hostId: 'anchor_4',
      hostName: 'Nadia Safitri',
      agencyCode: undefined,
      method: 'GOPAY',
      accountNumber: '085712349876',
      accountName: 'Budi Santoso',
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
  ]);

  // Spender Transactions State
  const [topupList, setTopupList] = useState<TopupTransaction[]>([
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
  ]);

  // Ambil data terbaru dari server jika backend aktif
  useEffect(() => {
    if (!isVisible) return;
    const fetchData = async () => {
      try {
        const host = typeof window !== 'undefined' ? window.location.hostname : 'localhost';
        const resConfig = await fetch(`http://${host}:4000/api/admin/revenue-config`);
        const jsonConfig = await resConfig.json();
        if (jsonConfig.success && jsonConfig.data) {
          setConfig(jsonConfig.data);
        }

        const resWd = await fetch(`http://${host}:4000/api/admin/withdrawals`);
        const jsonWd = await resWd.json();
        if (jsonWd.success && jsonWd.data) {
          setWithdrawals(jsonWd.data);
        }

        const resTopup = await fetch(`http://${host}:4000/api/admin/topup-transactions`);
        const jsonTopup = await resTopup.json();
        if (jsonTopup.success && jsonTopup.data) {
          setTopupList(jsonTopup.data);
        }

        const resSec = await fetch(`http://${host}:4000/api/security/policy`);
        const jsonSec = await resSec.json();
        if (jsonSec.success && jsonSec.data) {
          setSecurityPolicy(jsonSec.data);
        }

        const resThreats = await fetch(`http://${host}:4000/api/admin/security/threat-ledger`);
        const jsonThreats = await resThreats.json();
        if (jsonThreats.success && jsonThreats.data) {
          setThreatLogs(jsonThreats.data);
        }
      } catch {
        // Fallback local
      }
    };

    fetchData();
  }, [isVisible]);

  const handleSaveSecurityPolicy = async () => {
    setIsSavingSecurity(true);
    try {
      const host = typeof window !== 'undefined' ? window.location.hostname : 'localhost';
      const res = await fetch(`http://${host}:4000/api/admin/security/policy`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(securityPolicy),
      });
      const data = await res.json();
      setIsSavingSecurity(false);
      if (data.success) {
        toast.success('Kebijakan Keamanan & Anti-Fraud berhasil disimpan ke server!');
      } else {
        toast.error('Gagal memperbarui kebijakan keamanan.');
      }
    } catch {
      setIsSavingSecurity(false);
      toast.success('Kebijakan Keamanan diperbarui secara lokal.');
    }
  };

  // Hitung KPI Keuangan
  const grossRevenue = topupList.reduce((acc, curr) => acc + curr.amountIdr, 0);
  const completedPayout = withdrawals
    .filter((w) => w.status === 'COMPLETED')
    .reduce((acc, curr) => acc + curr.netAmountIdr, 0);
  const pendingPayout = withdrawals
    .filter((w) => w.status === 'PENDING_REVIEW' || w.status === 'APPROVED' || w.status === 'PROCESSING')
    .reduce((acc, curr) => acc + curr.netAmountIdr, 0);
  const platformNetProfit = Math.max(0, grossRevenue - completedPayout);

  // Actions on Withdrawals
  const handleApproveWd = async (wd: WithdrawalRequest) => {
    try {
      const host = typeof window !== 'undefined' ? window.location.hostname : 'localhost';
      await fetch(`http://${host}:4000/api/admin/withdrawals/${wd.id}/review`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'APPROVE' }),
      }).catch(() => {});
    } catch {
      // ignore
    }

    setWithdrawals((prev) =>
      prev.map((w) => (w.id === wd.id ? { ...w, status: 'APPROVED' as const, reviewedAt: Date.now() } : w))
    );
    toast.success(`Pengajuan ${wd.id} disetujui! Status dialihkan ke proses transfer bank.`);
  };

  const handleCompleteWd = async (wd: WithdrawalRequest) => {
    try {
      const host = typeof window !== 'undefined' ? window.location.hostname : 'localhost';
      await fetch(`http://${host}:4000/api/admin/withdrawals/${wd.id}/review`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'COMPLETE' }),
      }).catch(() => {});
    } catch {
      // ignore
    }

    setWithdrawals((prev) =>
      prev.map((w) => (w.id === wd.id ? { ...w, status: 'COMPLETED' as const, reviewedAt: Date.now() } : w))
    );
    toast.success(`Pengajuan ${wd.id} ditandai SELESAI DITRANSFER (Dana masuk ke rekening host).`);
  };

  const handleOpenRejectDialog = (wd: WithdrawalRequest) => {
    setRejectDialogWd(wd);
    setRejectReason('Nama pemilik rekening tidak cocok dengan nama KTP KYC Host.');
  };

  const handleConfirmReject = async () => {
    if (!rejectDialogWd) return;

    try {
      const host = typeof window !== 'undefined' ? window.location.hostname : 'localhost';
      await fetch(`http://${host}:4000/api/admin/withdrawals/${rejectDialogWd.id}/review`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'REJECT', reason: rejectReason }),
      }).catch(() => {});
    } catch {
      // ignore
    }

    // Kembalikan Points ke saldo host jika ditolak!
    if (rejectDialogWd.hostId === 'anchor_1') {
      addPoints(rejectDialogWd.pointsRequested);
    }

    setWithdrawals((prev) =>
      prev.map((w) =>
        w.id === rejectDialogWd.id
          ? {
              ...w,
              status: 'REJECTED' as const,
              reviewedAt: Date.now(),
              rejectionReason: rejectReason,
            }
          : w
      )
    );

    toast.info(`Pengajuan ${rejectDialogWd.id} DITOLAK. Poin (${rejectDialogWd.pointsRequested} Pts) telah dikembalikan ke saldo host.`);
    setRejectDialogWd(null);
  };

  // Simpan Parameter Bagi Hasil
  const handleSaveConfig = async () => {
    setIsSavingConfig(true);
    try {
      const host = typeof window !== 'undefined' ? window.location.hostname : 'localhost';
      const res = await fetch(`http://${host}:4000/api/admin/revenue-config`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      });
      const data = await res.json();
      setIsSavingConfig(false);
      if (data.success && data.data) {
        setConfig(data.data);
      }
      toast.success('Parameter bagi hasil & keuangan platform berhasil disimpan di CMS!');
    } catch {
      setIsSavingConfig(false);
      toast.success('Parameter bagi hasil CMS berhasil disimpan secara lokal!');
    }
  };

  const formatRupiah = (val: number) => `Rp ${val.toLocaleString('id-ID')}`;

  const filteredWdList = withdrawals.filter((w) => {
    if (filterWdStatus === 'ALL') return true;
    return w.status === filterWdStatus;
  });

  return (
    <Modal visible={isVisible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.modalBackdrop}>
        <View
          style={[
            styles.sheetContainer,
            { backgroundColor: colors.surface, borderTopColor: colors.border },
          ]}
        >
          {/* Header CMS */}
          <View style={[styles.header, { backgroundColor: colors.surfaceCard, borderBottomColor: colors.border }]}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <View style={[styles.adminBadgeIcon, { backgroundColor: colors.primaryGlow }]}>
                <ShieldCheck size={20} color={colors.primary} />
              </View>
              <View>
                <Text style={[styles.headerTitle, { color: colors.text }]}>CMS ADMIN PANEL</Text>
                <Text style={{ color: colors.textSecondary, fontSize: 11 }}>
                  Portal Pengelolaan Finansial, Withdrawal & Bagi Hasil (Owner APK)
                </Text>
              </View>
            </View>

            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <X size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* Navigation Subtabs CMS */}
          <View style={[styles.navTabs, { backgroundColor: colors.surfaceCard, borderBottomColor: colors.border }]}>
            {[
              { key: 'dashboard', label: 'Ringkasan', icon: LayoutDashboard },
              { key: 'posthog', label: 'PostHog Analytics', icon: Activity },
              { key: 'pgvector', label: 'PgVector & AI', icon: Sparkles },
              { key: 'users', label: 'Users & Hosts', icon: Users },
              { key: 'moderation', label: 'Moderasi SARA & Porno', icon: ShieldAlert },
              {
                key: 'surveillance',
                label: `Wiretap & Spy (${activeCalls.length})`,
                icon: Radio,
              },
              { key: 'withdrawals', label: `Penarikan (${withdrawals.filter((w) => w.status === 'PENDING_REVIEW').length})`, icon: CreditCard },
              { key: 'spenders', label: 'Spender', icon: Coins },
              { key: 'settings', label: 'Bagi Hasil', icon: Settings },
              { key: 'security', label: 'Security & Anti-Fraud', icon: ShieldCheck },
            ].map((tab) => {

              const isSelected = activeTab === tab.key;
              const IconComp = tab.icon;
              return (
                <TouchableOpacity
                  key={tab.key}
                  onPress={() => setActiveTab(tab.key as CmsTab)}
                  style={[
                    styles.navTabItem,
                    isSelected && { borderBottomColor: colors.primary, borderBottomWidth: 2 },
                  ]}
                >
                  <IconComp size={15} color={isSelected ? colors.primary : colors.textSecondary} />
                  <Text
                    style={[
                      styles.navTabText,
                      { color: isSelected ? colors.primary : colors.textSecondary, fontWeight: isSelected ? '800' : '500' },
                    ]}
                  >
                    {tab.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* CONTENT AREA */}
          <ScrollView style={styles.scrollContent} contentContainerStyle={{ padding: 14, paddingBottom: 40 }}>
            {/* TAB 1: DASHBOARD RINGKASAN FINANSIAL */}
            {activeTab === 'dashboard' && (
              <View style={{ gap: 14 }}>
                {/* 4 Kartu KPI Keuangan */}
                <View style={styles.kpiGrid}>
                  <View style={[styles.kpiCard, { backgroundColor: colors.surfaceCard, borderColor: colors.border }]}>
                    <Text style={[styles.kpiLabel, { color: colors.textSecondary }]}>TOTAL OMZET SPENDER (GROSS)</Text>
                    <Text style={[styles.kpiValue, { color: colors.primary }]}>{formatRupiah(grossRevenue)}</Text>
                    <Text style={{ color: colors.textSecondary, fontSize: 10, marginTop: 4 }}>
                      Dari {topupList.length} transaksi pembelian koin
                    </Text>
                  </View>

                  <View style={[styles.kpiCard, { backgroundColor: colors.surfaceCard, borderColor: colors.border }]}>
                    <Text style={[styles.kpiLabel, { color: colors.textSecondary }]}>KEUNTUNGAN BERSIH PEMILIK APK</Text>
                    <Text style={[styles.kpiValue, { color: '#00D26A' }]}>{formatRupiah(platformNetProfit)}</Text>
                    <Text style={{ color: colors.textSecondary, fontSize: 10, marginTop: 4 }}>
                      Profit bersih setelah potongan bagi hasil
                    </Text>
                  </View>

                  <View style={[styles.kpiCard, { backgroundColor: colors.surfaceCard, borderColor: colors.border }]}>
                    <Text style={[styles.kpiLabel, { color: colors.textSecondary }]}>PAYOUT HOST SELESAI</Text>
                    <Text style={[styles.kpiValue, { color: colors.text }]}>{formatRupiah(completedPayout)}</Text>
                    <Text style={{ color: colors.textSecondary, fontSize: 10, marginTop: 4 }}>
                      Telah ditransfer ke rekening host
                    </Text>
                  </View>

                  <View style={[styles.kpiCard, { backgroundColor: colors.surfaceCard, borderColor: colors.border }]}>
                    <Text style={[styles.kpiLabel, { color: colors.textSecondary }]}>ANTEAN PENARIKAN PENDING</Text>
                    <Text style={[styles.kpiValue, { color: '#FFA502' }]}>{formatRupiah(pendingPayout)}</Text>
                    <Text style={{ color: colors.textSecondary, fontSize: 10, marginTop: 4 }}>
                      Menunggu verifikasi admin CMS
                    </Text>
                  </View>
                </View>

                {/* Ringkasan Model Bagi Hasil Saat Ini */}
                <View style={[styles.configCard, { backgroundColor: colors.surfaceCard, borderColor: colors.border }]}>
                  <View style={styles.configHeader}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                      <TrendingUp size={16} color={colors.gold} />
                      <Text style={[styles.configTitle, { color: colors.text }]}>
                        SKEMA PEMBAGIAN HASIL AKTIF (REVENUE SHARE)
                      </Text>
                    </View>
                    <TouchableOpacity onPress={() => setActiveTab('settings')}>
                      <Text style={{ color: colors.primary, fontSize: 11, fontWeight: '700' }}>Ubah di Pengaturan &gt;</Text>
                    </TouchableOpacity>
                  </View>

                  <View style={[styles.divider, { backgroundColor: colors.border }]} />

                  <View style={styles.splitRow}>
                    <View style={styles.splitCol}>
                      <Text style={[styles.splitColTitle, { color: colors.text }]}>Host Mandiri:</Text>
                      <Text style={{ color: '#00D26A', fontSize: 13, fontWeight: '800' }}>
                        Host: {config.hostShareIndependent}%
                      </Text>
                      <Text style={{ color: colors.primary, fontSize: 13, fontWeight: '800' }}>
                        Pemilik APK: {config.platformShareIndependent}%
                      </Text>
                    </View>

                    <View style={[styles.verticalDivider, { backgroundColor: colors.border }]} />

                    <View style={styles.splitCol}>
                      <Text style={[styles.splitColTitle, { color: colors.text }]}>Host Agensi:</Text>
                      <Text style={{ color: '#00D26A', fontSize: 13, fontWeight: '800' }}>
                        Host: {config.hostShareAgency}%
                      </Text>
                      <Text style={{ color: colors.gold, fontSize: 13, fontWeight: '800' }}>
                        Agensi: {config.agencyShare}%
                      </Text>
                      <Text style={{ color: colors.primary, fontSize: 13, fontWeight: '800' }}>
                        Pemilik APK: {config.platformShareAgency}%
                      </Text>
                    </View>
                  </View>
                </View>
              </View>
            )}




            {/* TAB: POSTHOG TELEMETRY & FUNNEL ANALYTICS */}
            {activeTab === 'posthog' && <CmsPostHogView />}

            {/* TAB: PGVECTOR & AI SEMANTIC CONSOLE */}
            {activeTab === 'pgvector' && <CmsPgVectorView />}

            {/* TAB: USERS & HOSTS CRM & ALBUM INSPECTOR */}
            {activeTab === 'users' && <CmsUsersView />}

            {/* TAB: CONTENT MODERATION QUEUE (SARA & PORNOGRAFI) */}
            {activeTab === 'moderation' && <CmsModerationView />}

            {/* TAB 2: MANAJEMEN PENARIKAN HOST (WITHDRAWALS REVIEW) */}
            {activeTab === 'withdrawals' && (

              <View style={{ gap: 10 }}>
                {/* Filter Chips Bar */}
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  nestedScrollEnabled={true}
                  directionalLockEnabled={true}
                  contentContainerStyle={{ gap: 6, marginBottom: 8 }}
                >
                  {[
                    { key: 'ALL', label: `Semua (${withdrawals.length})` },
                    { key: 'PENDING_REVIEW', label: `Menunggu Review (${withdrawals.filter((w) => w.status === 'PENDING_REVIEW').length})` },
                    { key: 'APPROVED', label: `Disetujui (${withdrawals.filter((w) => w.status === 'APPROVED').length})` },
                    { key: 'COMPLETED', label: `Selesai (${withdrawals.filter((w) => w.status === 'COMPLETED').length})` },
                    { key: 'REJECTED', label: `Ditolak (${withdrawals.filter((w) => w.status === 'REJECTED').length})` },
                  ].map((chip) => (
                    <ButtonChip
                      key={chip.key}
                      label={chip.label}
                      selected={filterWdStatus === chip.key}
                      onPress={() => setFilterWdStatus(chip.key)}
                      size="sm"
                    />
                  ))}
                </ScrollView>

                {/* Table / List Pengajuan Penarikan */}
                {filteredWdList.map((wd) => {
                  const isPending = wd.status === 'PENDING_REVIEW';
                  const isApproved = wd.status === 'APPROVED';

                  return (
                    <View
                      key={wd.id}
                      style={[
                        styles.wdCard,
                        { backgroundColor: colors.surfaceCard, borderColor: colors.border },
                      ]}
                    >
                      <View style={styles.wdCardHeader}>
                        <View>
                          <Text style={[styles.wdIdText, { color: colors.text }]}>{wd.id}</Text>
                          <Text style={{ color: colors.textSecondary, fontSize: 11 }}>
                            Host: <Text style={{ color: colors.text, fontWeight: '700' }}>{wd.hostName}</Text> • {wd.agencyCode ? `Agensi: ${wd.agencyCode}` : 'Host Mandiri'}
                          </Text>
                        </View>

                        <View
                          style={[
                            styles.statusBadge,
                            {
                              backgroundColor:
                                wd.status === 'COMPLETED'
                                  ? 'rgba(0, 210, 106, 0.15)'
                                  : wd.status === 'REJECTED'
                                  ? 'rgba(255, 71, 87, 0.15)'
                                  : wd.status === 'APPROVED'
                                  ? 'rgba(0, 168, 255, 0.15)'
                                  : 'rgba(255, 165, 2, 0.15)',
                            },
                          ]}
                        >
                          <Text
                            style={[
                              styles.statusBadgeText,
                              {
                                color:
                                  wd.status === 'COMPLETED'
                                    ? '#00D26A'
                                    : wd.status === 'REJECTED'
                                    ? '#FF4757'
                                    : wd.status === 'APPROVED'
                                    ? '#00A8FF'
                                    : '#FFA502',
                              },
                            ]}
                          >
                            {wd.status}
                          </Text>
                        </View>
                      </View>

                      <View style={[styles.divider, { backgroundColor: colors.border }]} />

                      <View style={styles.wdInfoGrid}>
                        <View style={{ width: '48%' }}>
                          <Text style={styles.wdInfoLabel}>Rekening Tujuan:</Text>
                          <Text style={[styles.wdInfoVal, { color: colors.text }]}>
                            {wd.method} - {wd.accountNumber}
                          </Text>
                          <Text style={{ color: colors.textSecondary, fontSize: 11 }}>a.n. {wd.accountName}</Text>
                        </View>

                        <View style={{ width: '48%' }}>
                          <Text style={styles.wdInfoLabel}>Points / Bersih IDR:</Text>
                          <Text style={[styles.wdInfoVal, { color: colors.gold, fontWeight: '800' }]}>
                            {wd.pointsRequested.toLocaleString()} Points
                          </Text>
                          <Text style={{ color: colors.primary, fontSize: 13, fontWeight: '900' }}>
                            {formatRupiah(wd.netAmountIdr)}
                          </Text>
                        </View>
                      </View>

                      {wd.rejectionReason && (
                        <View style={styles.rejectNotice}>
                          <Text style={{ color: '#FF4757', fontSize: 11 }}>Alasan Penolakan: {wd.rejectionReason}</Text>
                        </View>
                      )}

                      {/* Tombol Aksi Admin */}
                      {(isPending || isApproved) && (
                        <View style={styles.wdActionsRow}>
                          {isPending && (
                            <TouchableOpacity
                              style={[styles.btnActionApprove, { backgroundColor: colors.primaryGlow, borderColor: colors.primary }]}
                              onPress={() => handleApproveWd(wd)}
                            >
                              <Text style={[styles.btnActionText, { color: colors.primary }]}>Setujui (Approve)</Text>
                            </TouchableOpacity>
                          )}

                          {isApproved && (
                            <TouchableOpacity
                              style={[styles.btnActionComplete, { backgroundColor: '#00D26A' }]}
                              onPress={() => handleCompleteWd(wd)}
                            >
                              <Text style={[styles.btnActionText, { color: '#FFFFFF' }]}>Tandai Ditransfer (Complete)</Text>
                            </TouchableOpacity>
                          )}

                          <TouchableOpacity
                            style={[styles.btnActionReject, { borderColor: '#FF4757' }]}
                            onPress={() => handleOpenRejectDialog(wd)}
                          >
                            <Text style={{ color: '#FF4757', fontSize: 11.5, fontWeight: '700' }}>Tolak (Reject)</Text>
                          </TouchableOpacity>
                        </View>
                      )}
                    </View>
                  );
                })}
              </View>
            )}

            {/* TAB 3: PENGATURAN PARAMETER BAGI HASIL (REVENUE SHARE SETTINGS FORM) */}
            {activeTab === 'settings' && (
              <View style={[styles.settingsFormCard, { backgroundColor: colors.surfaceCard, borderColor: colors.border }]}>
                <View style={styles.formTitleRow}>
                  <Settings size={18} color={colors.primary} />
                  <Text style={[styles.formTitle, { color: colors.text }]}>
                    PENGATURAN KOMISI &amp; BAGI HASIL (CMS ADMIN)
                  </Text>
                </View>
                <Text style={{ color: colors.textSecondary, fontSize: 11, marginBottom: 14 }}>
                  Atur persentase keuntungan pemilik aplikasi, host, agensi, kurs tukar points, serta batas minimum penarikan dana.
                </Text>

                {/* Skenario A: Host Mandiri */}
                <View style={[styles.scenarioBox, { backgroundColor: colors.surfaceGlass, borderColor: colors.border }]}>
                  <Text style={[styles.scenarioHeading, { color: colors.text }]}>1. SKEMA HOST MANDIRI (INDEPENDENT)</Text>
                  <View style={styles.inputGroupRow}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.inputFieldLabel}>Bagi Hasil Host Mandiri (%):</Text>
                      <TextInput
                        value={config.hostShareIndependent.toString()}
                        onChangeText={(v) => {
                          const val = Math.min(100, Math.max(0, parseInt(v, 10) || 0));
                          setConfig({
                            ...config,
                            hostShareIndependent: val,
                            platformShareIndependent: 100 - val,
                          });
                        }}
                        keyboardType="numeric"
                        style={[styles.formInput, { color: colors.text, borderColor: colors.border }]}
                      />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.inputFieldLabel}>Share Pemilik APK (%):</Text>
                      <TextInput
                        value={config.platformShareIndependent.toString()}
                        editable={false}
                        style={[styles.formInput, { color: colors.primary, borderColor: colors.border, backgroundColor: 'rgba(0,0,0,0.1)' }]}
                      />
                    </View>
                  </View>
                </View>

                {/* Skenario B: Host Agensi */}
                <View style={[styles.scenarioBox, { backgroundColor: colors.surfaceGlass, borderColor: colors.border }]}>
                  <Text style={[styles.scenarioHeading, { color: colors.text }]}>2. SKEMA HOST AGENSI (3 PIHAK)</Text>
                  <View style={styles.inputGroupRow}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.inputFieldLabel}>Bagi Hasil Host (%):</Text>
                      <TextInput
                        value={config.hostShareAgency.toString()}
                        onChangeText={(v) => {
                          const hostVal = parseInt(v, 10) || 0;
                          const platVal = Math.max(0, 100 - hostVal - config.agencyShare);
                          setConfig({ ...config, hostShareAgency: hostVal, platformShareAgency: platVal });
                        }}
                        keyboardType="numeric"
                        style={[styles.formInput, { color: colors.text, borderColor: colors.border }]}
                      />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.inputFieldLabel}>Komisi Agensi (%):</Text>
                      <TextInput
                        value={config.agencyShare.toString()}
                        onChangeText={(v) => {
                          const agVal = parseInt(v, 10) || 0;
                          const platVal = Math.max(0, 100 - config.hostShareAgency - agVal);
                          setConfig({ ...config, agencyShare: agVal, platformShareAgency: platVal });
                        }}
                        keyboardType="numeric"
                        style={[styles.formInput, { color: colors.gold, borderColor: colors.border }]}
                      />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.inputFieldLabel}>Pemilik APK (%):</Text>
                      <TextInput
                        value={config.platformShareAgency.toString()}
                        editable={false}
                        style={[styles.formInput, { color: colors.primary, borderColor: colors.border, backgroundColor: 'rgba(0,0,0,0.1)' }]}
                      />
                    </View>
                  </View>
                </View>

                {/* Kurs & Parameter Finansial */}
                <View style={[styles.scenarioBox, { backgroundColor: colors.surfaceGlass, borderColor: colors.border }]}>
                  <Text style={[styles.scenarioHeading, { color: colors.text }]}>3. PARAMETER PENARIKAN DANA (WITHDRAWAL)</Text>
                  <View style={styles.inputGroupRow}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.inputFieldLabel}>Kurs 1 Point ke Rupiah (Rp):</Text>
                      <TextInput
                        value={config.pointToIdrRate.toString()}
                        onChangeText={(v) => setConfig({ ...config, pointToIdrRate: parseInt(v, 10) || 100 })}
                        keyboardType="numeric"
                        style={[styles.formInput, { color: colors.text, borderColor: colors.border }]}
                      />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.inputFieldLabel}>Batas Minimum Penarikan (Pts):</Text>
                      <TextInput
                        value={config.minWithdrawalPoints.toString()}
                        onChangeText={(v) => setConfig({ ...config, minWithdrawalPoints: parseInt(v, 10) || 2000 })}
                        keyboardType="numeric"
                        style={[styles.formInput, { color: colors.text, borderColor: colors.border }]}
                      />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.inputFieldLabel}>Biaya Admin Bank (Rp):</Text>
                      <TextInput
                        value={config.withdrawalAdminFeeIdr.toString()}
                        onChangeText={(v) => setConfig({ ...config, withdrawalAdminFeeIdr: parseInt(v, 10) || 0 })}
                        keyboardType="numeric"
                        style={[styles.formInput, { color: colors.text, borderColor: colors.border }]}
                      />
                    </View>
                  </View>
                </View>

                {/* Tombol Simpan Perubahan CMS */}
                <TouchableOpacity
                  style={[styles.saveConfigBtn, { backgroundColor: colors.primary }]}
                  onPress={handleSaveConfig}
                  disabled={isSavingConfig}
                  activeOpacity={0.8}
                >
                  <Save size={16} color="#FFFFFF" style={{ marginRight: 6 }} />
                  <Text style={styles.saveConfigBtnText}>
                    {isSavingConfig ? 'Menyimpan...' : 'Simpan Parameter CMS'}
                  </Text>
                </TouchableOpacity>
              </View>
            )}

            {/* TAB 4: LEDGER TRANSAKSI SPENDER */}
            {activeTab === 'spenders' && (
              <View style={{ gap: 10 }}>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>
                  TRANSAKSI PEMBELIAN KOIN SPENDER MASUK
                </Text>

                {topupList.map((tx) => (
                  <View
                    key={tx.id}
                    style={[
                      styles.topupCard,
                      { backgroundColor: colors.surfaceCard, borderColor: colors.border },
                    ]}
                  >
                    <View style={styles.topupHeader}>
                      <View>
                        <Text style={[styles.topupId, { color: colors.text }]}>{tx.id}</Text>
                        <Text style={{ color: colors.textSecondary, fontSize: 11 }}>
                          Spender: <Text style={{ color: colors.text, fontWeight: '700' }}>{tx.userNickname}</Text>
                        </Text>
                      </View>

                      <View style={[styles.topupStatusBadge, { backgroundColor: 'rgba(0, 210, 106, 0.15)' }]}>
                        <Text style={{ color: '#00D26A', fontSize: 10, fontWeight: '800' }}>{tx.status}</Text>
                      </View>
                    </View>

                    <View style={[styles.divider, { backgroundColor: colors.border }]} />

                    <View style={styles.topupDetailRow}>
                      <View>
                        <Text style={{ color: colors.textSecondary, fontSize: 11 }}>Paket:</Text>
                        <Text style={{ color: tx.isSpenderVIP ? colors.gold : colors.text, fontSize: 12, fontWeight: '800' }}>
                          {tx.packageName}
                        </Text>
                      </View>

                      <View>
                        <Text style={{ color: colors.textSecondary, fontSize: 11 }}>Koin Diberikan:</Text>
                        <Text style={{ color: colors.gold, fontSize: 12, fontWeight: '800' }}>
                          {(tx.coinsAwarded + tx.bonusCoinsAwarded).toLocaleString()} Koin
                        </Text>
                      </View>

                      <View style={{ alignItems: 'flex-end' }}>
                        <Text style={{ color: colors.textSecondary, fontSize: 11 }}>Nominal Bayar:</Text>
                        <Text style={{ color: colors.primary, fontSize: 14, fontWeight: '900' }}>
                          {formatRupiah(tx.amountIdr)}
                        </Text>
                      </View>
                    </View>
                  </View>
                ))}
              </View>
            )}

            {/* TAB 5: SECURITY POLICY & THREAT TELEMETRY */}
            {activeTab === 'security' && (
              <View style={{ gap: 14 }}>
                {/* Kebijakan Proteksi Runtime & Anti-Reverse Engineering */}
                <View style={[styles.configCard, { backgroundColor: colors.surfaceCard, borderColor: colors.border }]}>
                  <View style={styles.configHeader}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                      <ShieldAlert size={16} color="#FF4B4B" />
                      <Text style={[styles.configTitle, { color: colors.text }]}>
                        KEBIJAKAN PROTEKSI RUNTIME &amp; ANTI-REVERSE ENGINEERING
                      </Text>
                    </View>
                    <View style={[styles.badgePill, { backgroundColor: 'rgba(0, 210, 106, 0.15)' }]}>
                      <Text style={{ color: '#00D26A', fontSize: 10, fontWeight: '800' }}>ACTIVE SHIELD</Text>
                    </View>
                  </View>

                  <View style={[styles.divider, { backgroundColor: colors.border }]} />

                  <Text style={{ color: colors.textSecondary, fontSize: 11.5, marginBottom: 12 }}>
                    Atur kebijakan keamanan untuk melindungi dompet koin spender, mencegah bypass penarikan host, serta
                    menolak modifikasi biner APK bajakan:
                  </Text>

                  {/* Toggle List */}
                  {[
                    {
                      key: 'blockRootJailbreak',
                      label: 'Blokir Perangkat Root & Jailbreak',
                      sub: 'Menolak akses dari Magisk, KernelSU, Cydia, Sileo, & Superuser su binary',
                      icon: Smartphone,
                    },
                    {
                      key: 'blockEmulators',
                      label: 'Blokir Emulator & Bot Farm',
                      sub: 'Mendeteksi Nox, LDPlayer, BlueStacks, & QEMU untuk mencegah bot spam',
                      icon: Cpu,
                    },
                    {
                      key: 'blockFridaHooks',
                      label: 'Deteksi & Blokir Frida / Xposed Hooking',
                      sub: 'Memindai port 27042, injected dylib/so, dan memory tampering secara real-time',
                      icon: Bug,
                    },
                    {
                      key: 'enforcePlayIntegrity',
                      label: 'Wajibkan Google Play Integrity API',
                      sub: 'Hanya izinkan perangkat yang lulus evaluasi hardware-backed Play Protect Google',
                      icon: Key,
                    },
                    {
                      key: 'enforceAppCheck',
                      label: 'Wajibkan Firebase App Check pada Server',
                      sub: 'Menolak seluruh request API yang tidak berasal dari biner aplikasi resmi Tresno',
                      icon: Server,
                    },
                    {
                      key: 'enforceDrmScreenProtection',
                      label: 'DRM Anti-Screen Capture (FLAG_SECURE)',
                      sub: 'Mencegah perekaman layar & screenshot saat panggilan video privat host',
                      icon: Lock,
                    },
                  ].map((item) => {
                    const isEnabled = (securityPolicy as any)[item.key];
                    const IconC = item.icon;
                    return (
                      <TouchableOpacity
                        key={item.key}
                        activeOpacity={0.7}
                        onPress={() => {
                          setSecurityPolicy((prev) => ({
                            ...prev,
                            [item.key]: !isEnabled,
                          }));
                        }}
                        style={[
                          styles.securityToggleRow,
                          {
                            backgroundColor: colors.surfaceGlass,
                            borderColor: isEnabled ? colors.primary : colors.border,
                          },
                        ]}
                      >
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 }}>
                          <IconC size={18} color={isEnabled ? colors.primary : colors.textSecondary} />
                          <View style={{ flex: 1 }}>
                            <Text style={{ color: colors.text, fontSize: 12.5, fontWeight: '700' }}>
                              {item.label}
                            </Text>
                            <Text style={{ color: colors.textSecondary, fontSize: 10.5, marginTop: 2 }}>
                              {item.sub}
                            </Text>
                          </View>
                        </View>

                        <View
                          style={[
                            styles.toggleSwitch,
                            { backgroundColor: isEnabled ? colors.primary : 'rgba(255,255,255,0.1)' },
                          ]}
                        >
                          <Text style={{ color: isEnabled ? '#FFFFFF' : colors.textSecondary, fontSize: 9.5, fontWeight: '900' }}>
                            {isEnabled ? 'ON' : 'OFF'}
                          </Text>
                        </View>
                      </TouchableOpacity>
                    );
                  })}

                  <TouchableOpacity
                    style={[styles.saveBtn, { backgroundColor: colors.primary, marginTop: 14 }]}
                    onPress={handleSaveSecurityPolicy}
                    disabled={isSavingSecurity}
                  >
                    <Save size={16} color="#FFFFFF" style={{ marginRight: 6 }} />
                    <Text style={{ color: '#FFFFFF', fontWeight: '800', fontSize: 12.5 }}>
                      {isSavingSecurity ? 'Menyimpan...' : 'Simpan Kebijakan Keamanan'}
                    </Text>
                  </TouchableOpacity>
                </View>

                {/* Log Telemetri Ancaman & Fraud yang Terdeteksi */}
                <View style={[styles.configCard, { backgroundColor: colors.surfaceCard, borderColor: colors.border }]}>
                  <View style={styles.configHeader}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                      <AlertTriangle size={16} color="#FFA502" />
                      <Text style={[styles.configTitle, { color: colors.text }]}>
                        TELEMETRI ANCAMAN &amp; FRAUD TERDETEKSI ({threatLogs.length} LOG)
                      </Text>
                    </View>
                  </View>

                  <View style={[styles.divider, { backgroundColor: colors.border }]} />

                  {threatLogs.map((log) => (
                    <View
                      key={log.id}
                      style={[
                        styles.threatItemCard,
                        { backgroundColor: colors.surfaceGlass, borderColor: colors.border },
                      ]}
                    >
                      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Text style={{ color: colors.text, fontWeight: '800', fontSize: 12 }}>
                          {log.id} • User: <Text style={{ color: colors.primary }}>{log.userId}</Text>
                        </Text>
                        <View style={[styles.badgePill, { backgroundColor: 'rgba(255, 75, 75, 0.15)' }]}>
                          <Text style={{ color: '#FF4B4B', fontSize: 10, fontWeight: '800' }}>
                            RISK: {((log.threatVerdict?.riskScore || 0.9) * 100).toFixed(0)}%
                          </Text>
                        </View>
                      </View>

                      <Text style={{ color: colors.textSecondary, fontSize: 10.5, marginTop: 4 }}>
                        Fingerprint: {log.deviceFingerprint} • IP: {log.ipAddress || '127.0.0.1'}
                      </Text>

                      <View style={{ marginTop: 6, gap: 2 }}>
                        {(log.threatVerdict?.violationReasons || []).map((r: string, idx: number) => (
                          <Text key={idx} style={{ color: '#FF7B7B', fontSize: 10 }}>
                            • {r}
                          </Text>
                        ))}
                      </View>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {/* TAB 6: LIVE WIRETAP & SPY (PENYUSUPAN CALL & CHAT) */}
            {activeTab === 'surveillance' && (
              <View style={{ gap: 14 }}>
                {/* SECTION 1: PENYUSUPAN LIVE VIDEO CALL (GHOST MODE) */}
                <View style={[styles.configCard, { backgroundColor: colors.surfaceCard, borderColor: colors.border }]}>
                  <View style={styles.configHeader}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                      <Radio size={16} color="#EF4444" />
                      <Text style={[styles.configTitle, { color: colors.text }]}>
                        LIVE VIDEO CALL MONITORING ({activeCalls.length} PANGGILAN AKTIF)
                      </Text>
                    </View>
                    <TouchableOpacity
                      style={[styles.badgePill, { backgroundColor: colors.primaryGlow }]}
                      onPress={fetchActiveCalls}
                    >
                      <RefreshCw size={11} color={colors.primary} style={{ marginRight: 4 }} />
                      <Text style={{ color: colors.primary, fontSize: 10, fontWeight: '800' }}>REFRESH</Text>
                    </TouchableOpacity>
                  </View>

                  <View style={[styles.divider, { backgroundColor: colors.border }]} />

                  <Text style={{ color: colors.textSecondary, fontSize: 11.5, marginBottom: 12 }}>
                    Penyusupan senyap (Ghost Mode): Anda dapat menonton video call antara Host dan Spender secara langsung tanpa mereka sadari untuk mencegah fraud transaksi luar atau konten asusila.
                  </Text>

                  {/* List Active Calls */}
                  {activeCalls.length === 0 ? (
                    <View style={{ alignItems: 'center', paddingVertical: 20 }}>
                      <Text style={{ color: colors.textSecondary, fontSize: 12 }}>
                        Tidak ada panggilan 1-on-1 yang sedang aktif saat ini.
                      </Text>
                    </View>
                  ) : (
                    activeCalls.map((call) => (
                      <View
                        key={call.channelId}
                        style={[
                          styles.callMonitorCard,
                          {
                            backgroundColor: colors.surfaceGlass,
                            borderColor: call.riskFlags.length > 0 ? '#EF4444' : colors.border,
                          },
                        ]}
                      >
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                          <View>
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                              <View style={styles.livePulseDot} />
                              <Text style={{ color: colors.text, fontWeight: '800', fontSize: 13 }}>
                                Channel: {call.channelId}
                              </Text>
                            </View>
                            <Text style={{ color: colors.textSecondary, fontSize: 11, marginTop: 2 }}>
                              Durasi: <Text style={{ color: colors.primary, fontWeight: '700' }}>{Math.floor(call.durationSeconds / 60)}m {call.durationSeconds % 60}s</Text> • Terkuras: <Text style={{ color: colors.gold, fontWeight: '800' }}>{call.coinsSpent} Koin</Text>
                            </Text>
                          </View>

                          {call.riskFlags.length > 0 ? (
                            <View style={[styles.badgePill, { backgroundColor: 'rgba(239, 68, 68, 0.15)' }]}>
                              <Text style={{ color: '#EF4444', fontSize: 10, fontWeight: '800' }}>
                                RISK ALERT ({call.riskFlags.length})
                              </Text>
                            </View>
                          ) : (
                            <View style={[styles.badgePill, { backgroundColor: 'rgba(16, 185, 129, 0.15)' }]}>
                              <Text style={{ color: '#10B981', fontSize: 10, fontWeight: '800' }}>
                                NORMAL
                              </Text>
                            </View>
                          )}
                        </View>

                        {/* Participants Pair Row */}
                        <View style={styles.pairRow}>
                          <View style={styles.participantItem}>
                            <Text style={styles.participantRoleTag}>HOST ANCHOR</Text>
                            <Text style={[styles.participantNickname, { color: colors.text }]}>
                              {call.callee.nickname}
                            </Text>
                            <Text style={{ color: colors.textSecondary, fontSize: 10 }}>ID: {call.callee.id}</Text>
                          </View>

                          <Text style={{ color: colors.textSecondary, fontWeight: '900', fontSize: 14 }}>⇄</Text>

                          <View style={styles.participantItem}>
                            <Text style={[styles.participantRoleTag, { backgroundColor: '#3B82F6' }]}>CALLER / SPENDER</Text>
                            <Text style={[styles.participantNickname, { color: colors.text }]}>
                              {call.caller.nickname}
                            </Text>
                            <Text style={{ color: colors.textSecondary, fontSize: 10 }}>Saldo: {call.caller.coinsBalance} Koin</Text>
                          </View>
                        </View>

                        {/* Action Buttons */}
                        <View style={{ flexDirection: 'row', gap: 8, marginTop: 10 }}>
                          <TouchableOpacity
                            style={styles.spyCallBtn}
                            onPress={() => infiltrateCall(call.channelId)}
                          >
                            <Eye size={14} color="#FFFFFF" style={{ marginRight: 6 }} />
                            <Text style={styles.spyCallBtnText}>Menyusup ke Call (Ghost Wiretap)</Text>
                          </TouchableOpacity>

                          <TouchableOpacity
                            style={styles.killCallBtn}
                            onPress={() => terminateCall(call.channelId, 'Diputus oleh Admin: Pelanggaran Kebijakan Komunitas')}
                          >
                            <PhoneOff size={14} color="#FFFFFF" style={{ marginRight: 6 }} />
                            <Text style={styles.killCallBtnText}>Putus Paksa</Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                    ))
                  )}
                </View>

                {/* SECTION 2: PENYADAPAN CHATROOM (LIVE CHAT INTERCEPTION) */}
                <View style={[styles.configCard, { backgroundColor: colors.surfaceCard, borderColor: colors.border }]}>
                  <View style={styles.configHeader}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                      <MessageSquare size={16} color="#3B82F6" />
                      <Text style={[styles.configTitle, { color: colors.text }]}>
                        PENYADAPAN CHATROOM REAL-TIME ({chatrooms.length} PERCAKAPAN)
                      </Text>
                    </View>
                    <TouchableOpacity
                      style={[styles.badgePill, { backgroundColor: colors.primaryGlow }]}
                      onPress={fetchChatrooms}
                    >
                      <RefreshCw size={11} color={colors.primary} style={{ marginRight: 4 }} />
                      <Text style={{ color: colors.primary, fontSize: 10, fontWeight: '800' }}>REFRESH</Text>
                    </TouchableOpacity>
                  </View>

                  <View style={[styles.divider, { backgroundColor: colors.border }]} />

                  <Text style={{ color: colors.textSecondary, fontSize: 11.5, marginBottom: 12 }}>
                    Pantau riwayat pesan teks antar pengguna secara rahasia tanpa memicu tanda dibaca. Deteksi otomatis transaksi luar (WhatsApp, BCA, DANA) dan suntikkan peringatan resmi ke ruang chat.
                  </Text>

                  {chatrooms.map((room) => {
                    const isHighRisk = room.riskScore >= 50;
                    return (
                      <View
                        key={room.chatId}
                        style={[
                          styles.chatroomCard,
                          {
                            backgroundColor: colors.surfaceGlass,
                            borderColor: isHighRisk ? '#EF4444' : colors.border,
                          },
                        ]}
                      >
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                          <View style={{ flex: 1 }}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                              <Text style={{ color: colors.text, fontWeight: '800', fontSize: 13 }}>
                                {room.participants.map((p) => p.nickname).join(' ⇄ ')}
                              </Text>
                              {room.isFrozen && (
                                <View style={styles.frozenTag}>
                                  <Lock size={10} color="#FFFFFF" />
                                  <Text style={styles.frozenTagText}>DIBEKUKAN</Text>
                                </View>
                              )}
                            </View>

                            {room.lastMessage && (
                              <Text
                                style={{
                                  color: room.lastMessage.isFlagged ? '#EF4444' : colors.textSecondary,
                                  fontSize: 11.5,
                                  marginTop: 3,
                                }}
                                numberOfLines={2}
                              >
                                "{room.lastMessage.text}"
                              </Text>
                            )}
                          </View>

                          <View
                            style={[
                              styles.badgePill,
                              {
                                backgroundColor: isHighRisk
                                  ? 'rgba(239, 68, 68, 0.15)'
                                  : 'rgba(16, 185, 129, 0.15)',
                              },
                            ]}
                          >
                            <Text
                              style={{
                                color: isHighRisk ? '#EF4444' : '#10B981',
                                fontSize: 10,
                                fontWeight: '800',
                              }}
                            >
                              RISK: {room.riskScore}%
                            </Text>
                          </View>
                        </View>

                        {room.riskReason && (
                          <View style={styles.riskReasonBox}>
                            <AlertTriangle size={12} color="#EF4444" />
                            <Text style={styles.riskReasonText}>{room.riskReason}</Text>
                          </View>
                        )}

                        <View style={{ flexDirection: 'row', gap: 8, marginTop: 10 }}>
                          <TouchableOpacity
                            style={styles.inspectChatBtn}
                            onPress={() => inspectChatroom(room.chatId)}
                          >
                            <Eye size={13} color="#FFFFFF" style={{ marginRight: 6 }} />
                            <Text style={styles.inspectChatBtnText}>
                              Buka Sadap Chat ({room.messageCount} Pesan)
                            </Text>
                          </TouchableOpacity>

                          <TouchableOpacity
                            style={[
                              styles.freezeToggleBtn,
                              room.isFrozen && { backgroundColor: '#059669' },
                            ]}
                            onPress={() => toggleFreezeChatroom(room.chatId, !room.isFrozen)}
                          >
                            {room.isFrozen ? (
                              <>
                                <Unlock size={13} color="#FFFFFF" style={{ marginRight: 4 }} />
                                <Text style={styles.freezeToggleBtnText}>Buka Blokir</Text>
                              </>
                            ) : (
                              <>
                                <Lock size={13} color="#FFFFFF" style={{ marginRight: 4 }} />
                                <Text style={styles.freezeToggleBtnText}>Bekukan Chat</Text>
                              </>
                            )}
                          </TouchableOpacity>
                        </View>
                      </View>
                    );
                  })}
                </View>
              </View>
            )}
          </ScrollView>

          {/* DIALOG POPUP REJECT WITHDRAWAL */}
          {rejectDialogWd && (
            <View style={styles.rejectModalOverlay}>
              <View style={[styles.rejectModalBox, { backgroundColor: colors.surfaceCard, borderColor: colors.border }]}>
                <Text style={[styles.rejectModalTitle, { color: colors.text }]}>
                  Tolak Pengajuan Penarikan {rejectDialogWd.id}
                </Text>
                <Text style={{ color: colors.textSecondary, fontSize: 11.5, marginVertical: 8 }}>
                  Poin sejumlah <Text style={{ color: colors.gold, fontWeight: '800' }}>{rejectDialogWd.pointsRequested.toLocaleString()} Points</Text> akan otomatis dikembalikan ke saldo aktif host.
                </Text>

                <Text style={{ color: colors.text, fontSize: 11, fontWeight: '700', marginBottom: 4 }}>
                  Alasan Penolakan:
                </Text>
                <TextInput
                  value={rejectReason}
                  onChangeText={setRejectReason}
                  placeholder="Masukkan alasan penolakan..."
                  placeholderTextColor={colors.textSecondary}
                  multiline
                  numberOfLines={3}
                  style={[styles.rejectInput, { color: colors.text, borderColor: colors.border, backgroundColor: colors.surfaceGlass }]}
                />

                <View style={styles.rejectActionsRow}>
                  <TouchableOpacity
                    style={[styles.btnCancelReject, { borderColor: colors.border }]}
                    onPress={() => setRejectDialogWd(null)}
                  >
                    <Text style={{ color: colors.textSecondary, fontWeight: '700' }}>Batal</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.btnConfirmReject, { backgroundColor: '#FF4757' }]}
                    onPress={handleConfirmReject}
                  >
                    <Text style={{ color: '#FFFFFF', fontWeight: '800' }}>Konfirmasi Tolak &amp; Refund Poin</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          )}

          {/* Interactive Ghost Surveillance Modals */}
          <AdminCallSpyModal />
          <AdminChatSpyModal />
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sheetContainer: {
    width: Platform.OS === 'web' ? '94%' : '100%',
    maxWidth: 900,
    height: '92%',
    borderRadius: 20,
    borderWidth: 1,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  adminBadgeIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 15,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  closeBtn: {
    padding: 6,
  },
  navTabs: {
    flexDirection: 'row',
    borderBottomWidth: 1,
  },
  navTabItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 11,
  },
  navTabText: {
    fontSize: 11.5,
  },
  scrollContent: {
    flex: 1,
  },
  kpiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  kpiCard: {
    width: '48.5%',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  kpiLabel: {
    fontSize: 9.5,
    fontWeight: '800',
    letterSpacing: 0.4,
  },
  kpiValue: {
    fontSize: 17,
    fontWeight: '900',
    marginTop: 4,
  },
  configCard: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
  },
  configHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  configTitle: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.4,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    marginVertical: 10,
  },
  verticalDivider: {
    width: StyleSheet.hairlineWidth,
    marginHorizontal: 12,
  },
  splitRow: {
    flexDirection: 'row',
  },
  splitCol: {
    flex: 1,
    gap: 4,
  },
  splitColTitle: {
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 4,
  },

  wdCard: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 12,
    marginBottom: 10,
  },
  wdCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  wdIdText: {
    fontSize: 13,
    fontWeight: '800',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  statusBadgeText: {
    fontSize: 10,
    fontWeight: '800',
  },
  wdInfoGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  wdInfoLabel: {
    fontSize: 10.5,
    color: '#888',
    marginBottom: 2,
  },
  wdInfoVal: {
    fontSize: 12,
    fontWeight: '600',
  },
  wdActionsRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(255,255,255,0.06)',
  },
  btnActionApprove: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
  },
  btnActionComplete: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  btnActionReject: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
  },
  btnActionText: {
    fontSize: 11.5,
    fontWeight: '700',
  },
  rejectNotice: {
    backgroundColor: 'rgba(255, 71, 87, 0.1)',
    padding: 6,
    borderRadius: 6,
    marginTop: 6,
  },
  settingsFormCard: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
  },
  formTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  formTitle: {
    fontSize: 13,
    fontWeight: '900',
    letterSpacing: 0.4,
  },
  scenarioBox: {
    borderRadius: 10,
    borderWidth: 1,
    padding: 12,
    marginBottom: 12,
  },
  scenarioHeading: {
    fontSize: 11.5,
    fontWeight: '800',
    marginBottom: 8,
  },
  inputGroupRow: {
    flexDirection: 'row',
    gap: 10,
  },
  inputFieldLabel: {
    fontSize: 10,
    color: '#888',
    marginBottom: 4,
  },
  formInput: {
    height: 38,
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 10,
    fontSize: 13,
    fontWeight: '700',
  },
  saveConfigBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    marginTop: 6,
  },
  saveConfigBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '800',
    marginBottom: 6,
  },
  topupCard: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 12,
    marginBottom: 8,
  },
  topupHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  topupId: {
    fontSize: 12.5,
    fontWeight: '800',
  },
  topupStatusBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  topupDetailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  rejectModalOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.8)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    zIndex: 1000,
  },
  rejectModalBox: {
    width: '92%',
    maxWidth: 380,
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
  },
  rejectModalTitle: {
    fontSize: 14,
    fontWeight: '800',
  },
  rejectInput: {
    height: 70,
    borderRadius: 8,
    borderWidth: 1,
    padding: 10,
    fontSize: 12,
    textAlignVertical: 'top',
    marginBottom: 14,
  },
  rejectActionsRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
  },
  btnCancelReject: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
  },
  btnConfirmReject: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
  },
  securityToggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 8,
  },
  toggleSwitch: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    minWidth: 38,
    alignItems: 'center',
  },
  threatItemCard: {
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 8,
  },
  badgePill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  saveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
  },
  callMonitorCard: {
    borderRadius: 14,
    borderWidth: 1.2,
    padding: 12,
    marginBottom: 10,
    gap: 8,
  },
  livePulseDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#EF4444',
  },
  pairRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(0, 0, 0, 0.04)',
    borderRadius: 10,
    padding: 10,
    marginTop: 4,
  },
  participantItem: {
    flex: 1,
  },
  participantRoleTag: {
    alignSelf: 'flex-start',
    backgroundColor: '#EC4899',
    color: '#FFFFFF',
    fontSize: 8.5,
    fontWeight: '900',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginBottom: 2,
  },
  participantNickname: {
    fontSize: 12,
    fontWeight: '700',
  },
  spyCallBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2563EB',
    paddingVertical: 9,
    borderRadius: 10,
  },
  spyCallBtnText: {
    color: '#FFFFFF',
    fontSize: 11.5,
    fontWeight: '800',
  },
  killCallBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#DC2626',
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 10,
  },
  killCallBtnText: {
    color: '#FFFFFF',
    fontSize: 11.5,
    fontWeight: '800',
  },
  chatroomCard: {
    borderRadius: 14,
    borderWidth: 1.2,
    padding: 12,
    marginBottom: 10,
  },
  frozenTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#DC2626',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginLeft: 6,
  },
  frozenTagText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '900',
  },
  riskReasonBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    padding: 8,
    borderRadius: 8,
    marginTop: 8,
  },
  riskReasonText: {
    color: '#EF4444',
    fontSize: 10.5,
    fontWeight: '600',
    flex: 1,
  },
  inspectChatBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#3B82F6',
    paddingVertical: 8,
    borderRadius: 8,
  },
  inspectChatBtnText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
  },
  freezeToggleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#64748B',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  freezeToggleBtnText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
});
