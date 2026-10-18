import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useThemeStore } from '../../../theme/useThemeStore';
import { useTranslation, SUPPORTED_LANGUAGES } from '../../../i18n';
import { useAuthStore } from '../../auth/stores/useAuthStore';
import { useWalletStore } from '../../wallet/stores/useWalletStore';
import { MATCH_RULES } from '@tresno/shared';
import { useSocialStore } from '../../social/stores/useSocialStore';
import { useMissionStore } from '../../missions/stores/useMissionStore';
import { Settings, Gift, Palette, Phone, Lock, FileText, Shield, ShieldCheck, LogOut, Bell, Volume2, VolumeX, Sparkles, MessageCircle, Crown, Zap, TrendingUp, Activity } from 'lucide-react-native';
import { IconButton } from '../../../shared/components/atoms/IconButton';
import { SettingMenuItem } from '../../../shared/components/molecules/SettingMenuItem';
import { LegalModal } from '../../../shared/components/molecules/LegalModal';
import { Dialog } from '../../../shared/components/molecules/Dialog';
import { useLegalModalStore } from '../../../shared/stores/useLegalModalStore';
import { ProfileCard } from '../../../shared/components/organisms/ProfileCard';
import { WalletCard } from '../../../shared/components/organisms/WalletCard';
import { MissionsCenterModal } from '../../missions/components/MissionsCenterModal';
import { CashoutModal } from '../../wallet/components/CashoutModal';
import { AdminCmsModal } from '../../admin/components/AdminCmsModal';
import { SecurityInspectorModal } from '../../../shared/security/SecurityInspectorModal';
import { useNotificationStore } from '../../notifications/stores/useNotificationStore';
import { soundService } from '../../../shared/services/soundService';
import { toast } from '../../../shared/stores/useToastStore';
import { useChuckerStore } from '../../../shared/chucker';
import { EgoWelcomeModal } from '../../../shared/components/ego/EgoWelcomeModal';
import { Compass, ShieldAlert, Database } from 'lucide-react-native';
import { AlbumCarousel, AlbumViewerModal, ContentModerationPolicyModal, useAlbumStore } from '../../album';
import { SupabaseHubModal } from '../../../shared/components/supabase';

export const MineTab: React.FC = () => {
  const { colors, isDark, themeMode, openThemeModal } = useThemeStore();
  const { t, currentLanguage } = useTranslation();
  const { user: authUser, logout } = useAuthStore();
  const { photos, openPolicyModal } = useAlbumStore();
  const coverPhoto = photos.find((p) => p.isCover && p.status !== 'rejected')?.url;
  const { coinBalance, chatCoupons, openTopupModal, pointsBalance, deductPoints } = useWalletStore();
  const { following, followers } = useSocialStore();
  const { openMissionModal, getUnclaimedCount } = useMissionStore();
  const { open: openLegalModal } = useLegalModalStore();
  const { soundEnabled, toggleSound, receiveIncomingCall, receiveNotification } = useNotificationStore();
  const { getStats: getChuckerStats, setOpen: setChuckerOpen, isBubbleVisible } = useChuckerStore();
  const chuckerStats = getChuckerStats();

  const isHost = authUser?.isHost;
  const unclaimedCount = getUnclaimedCount();
  const [isBroadcastOnline, setIsBroadcastOnline] = useState(true);
  const [cashoutModalVisible, setCashoutModalVisible] = useState(false);
  const [isCmsModalOpen, setIsCmsModalOpen] = useState(false);
  const [isSecurityModalOpen, setIsSecurityModalOpen] = useState(false);
  const [isLogoutDialogOpen, setIsLogoutDialogOpen] = useState(false);
  const [isNotifModalOpen, setIsNotifModalOpen] = useState(false);
  const [isEgoShowcaseOpen, setIsEgoShowcaseOpen] = useState(false);
  const [isSupabaseModalOpen, setIsSupabaseModalOpen] = useState(false);

  const userId = authUser?.id || '894210';
  const displayPoints = pointsBalance !== undefined ? pointsBalance : 1250;

  const currentLang = SUPPORTED_LANGUAGES[currentLanguage];

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      {/* Top Header */}
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>{t('mine.title')}</Text>
        <IconButton
          icon={<Settings size={18} color={colors.text} />}
          onPress={openThemeModal}
          variant="solid"
          size={36}
        />
      </View>

      {/* User Profile Card (Organism) */}
      <ProfileCard
        userId={userId}
        nickname={authUser?.nickname || (isHost ? 'Dewi Lestari' : 'Member Tresno')}
        avatarUrl={coverPhoto || authUser?.avatarUrl}
        gender={authUser?.gender || 'male'}
        isHost={isHost}
        levelText="Lv.3"
        followersCount={isHost ? 158 : followers.length}
        followingCount={following.length}
        visitorsCount={isHost ? 682 : 89}
        followersLabel={t('mine.followers')}
        followingLabel={t('mine.following')}
        visitorsLabel={t('mine.visitors')}
      />

      {/* User Album Photos (Max 8 Photos Carousel Slider with SARA & Pornography Review Mechanism) */}
      <AlbumCarousel />

      {/* Adaptive Economic / Wallet Card (Organism) */}
      <WalletCard
        isHost={isHost}
        coinBalance={coinBalance}
        chatCoupons={chatCoupons}
        diamondBalance={displayPoints}
        onTopupPress={openTopupModal}
        onCashoutPress={() => setCashoutModalVisible(true)}
        isBroadcastOnline={isBroadcastOnline}
        onToggleBroadcast={setIsBroadcastOnline}
        coinsLabel={t('mine.coinsLabel')}
        diamondsLabel={t('mine.diamondsLabel')}
        topupBtnLabel={t('mine.topupBtn')}
        cashoutBtnLabel={t('mine.cashoutBtn')}
        broadcastStatusLabel={t('mine.broadcastStatus')}
        broadcastOnlineLabel={t('mine.broadcastOnline')}
        broadcastOfflineLabel={t('mine.broadcastOffline')}
        revenueShareNotice={t('mine.hostRevenueShareNotice')}
      />

      {/* Agency Status Card (for Host) */}
      {isHost && (
        <View style={[styles.agencyCard, { backgroundColor: colors.surfaceCard, borderColor: colors.border }]}>
          <View style={{ flex: 1 }}>
            <Text style={[styles.agencyTitle, { color: colors.text }]}>{t('mine.agencyStatus')}</Text>
            <Text style={[styles.agencySub, { color: colors.textSecondary }]}>
              {authUser?.agencyCode
                ? t('mine.registeredAgency', { code: authUser.agencyCode })
                : t('mine.independentHost')}
            </Text>
          </View>
          <View style={[styles.agencyBadge, { backgroundColor: colors.primaryGlow }]}>
            <Text style={{ color: colors.primary, fontSize: 11, fontWeight: '700' }}>
              {authUser?.agencyCode ? 'AGENCY' : 'MANDIRI'}
            </Text>
          </View>
        </View>
      )}

      {/* Host Traffic Fairness & Anti-Sepi Radar Indicator (Khusus Host) */}
      {isHost && (
        <View style={[styles.trafficRadarCard, { backgroundColor: isDark ? 'rgba(255, 184, 0, 0.08)' : '#FFF9E6', borderColor: colors.gold }]}>
          <View style={styles.trafficHeader}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Crown size={16} color={colors.gold} />
              <Text style={[styles.trafficTitle, { color: colors.gold }]}>
                DISTRIBUSI TRAFFIC RADAR (ANTI-SEPI)
              </Text>
            </View>
            <View style={styles.trafficBadge}>
              <Zap size={11} color="#000" fill="#000" />
              <Text style={styles.trafficBadgeText}>Prioritas #1</Text>
            </View>
          </View>

          <View style={styles.metricsRow}>
            <View style={styles.metricItem}>
              <Text style={[styles.metricLabel, { color: colors.textSecondary }]}>Skor Algoritma</Text>
              <Text style={[styles.metricValue, { color: colors.text }]}>195 Pts</Text>
            </View>
            <View style={styles.metricItem}>
              <Text style={[styles.metricLabel, { color: colors.textSecondary }]}>Estimasi Panggilan</Text>
              <Text style={[styles.metricValue, { color: colors.primary }]}>&lt; 2 Menit</Text>
            </View>
            <View style={styles.metricItem}>
              <Text style={[styles.metricLabel, { color: colors.textSecondary }]}>Boost Inkubator</Text>
              <Text style={[styles.metricValue, { color: '#00D26A' }]}>+100 Pts</Text>
            </View>
          </View>

          <View style={styles.tipBox}>
            <TrendingUp size={13} color={colors.primary} style={{ marginTop: 2, marginRight: 6 }} />
            <Text style={[styles.tipText, { color: colors.text }]}>
              Algoritma memprioritaskan akun yang baru online &amp; standby. Respon panggilan dalam 3 detik untuk mempertahankan posisi #1!
            </Text>
          </View>
        </View>
      )}

      {/* Settings / Menu Options Card (Molecules) */}
      <View style={[styles.menuListCard, { backgroundColor: colors.surfaceCard, borderColor: colors.border }]}>
        {/* Pusat Misi & Hadiah (Task Center ala Tigo) */}
        <SettingMenuItem
          icon={<Gift size={20} color={colors.primary} />}
          title={t('missions.taskCenterMenu')}
          subtitle={t('missions.taskCenterSubtitle')}
          badge={unclaimedCount > 0 ? `+${unclaimedCount} ${t('missions.claimBtn')}` : undefined}
          onPress={openMissionModal}
        />

        <SettingMenuItem
          icon={<Palette size={20} color={colors.secondary} />}
          title={t('mine.settingThemeLang')}
          subtitle={`${themeMode === 'system' ? 'Sistem' : isDark ? 'Gelap' : 'Terang'} • ${currentLang.nativeName}`}
          onPress={openThemeModal}
        />

        <SettingMenuItem
          icon={<Compass size={20} color="#104ECB" />}
          title="Ego Design System & Showcase"
          subtitle="Liquid Glass, Continuous Squircles & Atmospheric Blue"
          badge="EGO UI"
          onPress={() => setIsEgoShowcaseOpen(true)}
        />

        <SettingMenuItem
          icon={<Bell size={20} color={colors.primary} />}
          title="Notifikasi & Suara"
          subtitle={`${soundEnabled ? 'Suara Aktif' : 'Senyap'} • Uji Notif & Nada Dering`}
          onPress={() => setIsNotifModalOpen(true)}
        />

        <SettingMenuItem
          icon={<Activity size={20} color={colors.primary} />}
          title="Network Inspector (Chucker)"
          subtitle={`${chuckerStats.total} Request • ${chuckerStats.errors} Error • ${isBubbleVisible ? 'Bubble Aktif' : 'Bubble Nonaktif'}`}
          badge={chuckerStats.errors > 0 ? `${chuckerStats.errors} Error` : `${chuckerStats.total} Log`}
          onPress={() => setChuckerOpen(true)}
        />

        <SettingMenuItem
          icon={<Database size={20} color="#3ECF8E" />}
          title="Supabase Cloud & Live Data Hub"
          subtitle="Google OAuth 2.0 PKCE • Realtime Presence & Live Broadcast"
          badge="LIVE"
          onPress={() => setIsSupabaseModalOpen(true)}
        />

        <SettingMenuItem
          icon={<ShieldCheck size={20} color={colors.gold} />}
          title="CMS Admin & Bagi Hasil (Owner APK)"
          subtitle="Atur Bagi Hasil, Review Payout Host & Monitor Spender"
          badge="CMS"
          onPress={() => setIsCmsModalOpen(true)}
        />

        <SettingMenuItem
          icon={<Phone size={20} color={colors.gold} />}
          title={t('mine.settingHistory')}
          subtitle={t('mine.historySubtitle')}
          onPress={() => toast.info(t('mine.historyAlert'))}
        />

        <SettingMenuItem
          icon={<Lock size={20} color={colors.success} />}
          title="Security Center & Anti-Fraud"
          subtitle="Play Integrity • Anti-Root & Frida • App Check"
          badge="SHIELD"
          onPress={() => setIsSecurityModalOpen(true)}
        />

        <SettingMenuItem
          icon={<ShieldAlert size={20} color={colors.gold} />}
          title="Kebijakan Moderasi SARA & Pornografi"
          subtitle="Standar Komunitas • Sistem Deteksi AI & Review Album"
          badge="REVIEW"
          onPress={openPolicyModal}
        />

        <SettingMenuItem
          icon={<FileText size={20} color={colors.textSecondary} />}
          title={t('mine.settingTerms')}
          subtitle={t('mine.termsSubtitle')}
          onPress={() => openLegalModal('terms')}
        />

        <SettingMenuItem
          icon={<Shield size={20} color={colors.primary} />}
          title={t('mine.settingPrivacy')}
          subtitle={t('mine.privacySubtitle')}
          onPress={() => openLegalModal('privacy')}
        />

        <SettingMenuItem
          icon={<LogOut size={20} color={colors.danger} />}
          title={t('mine.logout')}
          subtitle={t('mine.logoutSubtitle')}
          isDanger
          isLast
          onPress={() => setIsLogoutDialogOpen(true)}
        />
      </View>

      {/* Logout Confirmation Dialog */}
      <Dialog
        isVisible={isLogoutDialogOpen}
        variant="danger"
        title={t('mine.logoutConfirmTitle')}
        description={t('mine.logoutConfirmDesc')}
        confirmText={t('mine.logoutConfirmBtn')}
        cancelText={t('mine.logoutCancelBtn')}
        icon={<LogOut size={28} color={colors.danger} />}
        onConfirm={async () => {
          setIsLogoutDialogOpen(false);
          await logout();
        }}
        onCancel={() => setIsLogoutDialogOpen(false)}
      />

      {/* Refined Host Withdrawal Request & History Modal */}
      <CashoutModal
        isVisible={cashoutModalVisible}
        onClose={() => setCashoutModalVisible(false)}
      />

      {/* Integrated CMS Admin Panel (Pemilik APK: Revenue Share, Payout Review, Spenders) */}
      <AdminCmsModal
        isVisible={isCmsModalOpen}
        onClose={() => setIsCmsModalOpen(false)}
      />

      {/* Security Center & Anti-Fraud Diagnostic Modal (Play Integrity, App Check, Root/Frida) */}
      <SecurityInspectorModal
        isVisible={isSecurityModalOpen}
        onClose={() => setIsSecurityModalOpen(false)}
      />

      {/* Ego UI System & Welcome Showcase Modal (Exact Reproduction of Screenshot) */}
      <EgoWelcomeModal
        visible={isEgoShowcaseOpen}
        onClose={() => setIsEgoShowcaseOpen(false)}
      />

      {/* Notification & Sound Settings Modal */}
      {isNotifModalOpen && (
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.surfaceCard, borderColor: colors.border }]}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
              <Bell size={22} color={colors.primary} style={{ marginRight: 8 }} />
              <Text style={[styles.modalTitle, { color: colors.text, marginBottom: 0 }]}>
                Notifikasi & Suara
              </Text>
            </View>
            <Text style={[styles.modalSubtitle, { color: colors.textSecondary }]}>
              Atur preferensi suara panggilan dan uji instan nada dering synthesizer
            </Text>

            {/* Toggle Suara */}
            <TouchableOpacity
              onPress={toggleSound}
              style={[
                styles.notifToggleRow,
                {
                  backgroundColor: colors.surfaceGlass,
                  borderColor: soundEnabled ? colors.primary : colors.border,
                },
              ]}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                {soundEnabled ? (
                  <Volume2 size={20} color={colors.primary} />
                ) : (
                  <VolumeX size={20} color={colors.textSecondary} />
                )}
                <View>
                  <Text style={{ color: colors.text, fontWeight: '700', fontSize: 13 }}>
                    Suara Notifikasi & Ringtone
                  </Text>
                  <Text style={{ color: colors.textSecondary, fontSize: 11 }}>
                    {soundEnabled ? 'Suara synthesizer aktif' : 'Mode senyap (mute)'}
                  </Text>
                </View>
              </View>
              <View
                style={[
                  styles.togglePill,
                  { backgroundColor: soundEnabled ? colors.primary : colors.border },
                ]}
              >
                <Text style={{ color: '#FFFFFF', fontWeight: '800', fontSize: 10 }}>
                  {soundEnabled ? 'ON' : 'OFF'}
                </Text>
              </View>
            </TouchableOpacity>

            {/* Quick Test Buttons */}
            <Text style={{ color: colors.textSecondary, fontSize: 11, fontWeight: '700', marginTop: 14, marginBottom: 8, letterSpacing: 0.5 }}>
              UJI INSTAN SUARA & WORKER:
            </Text>

            <TouchableOpacity
              onPress={() => {
                receiveNotification({
                  id: `test_msg_${Date.now()}`,
                  type: 'chat_message',
                  title: 'Dewi Lestari mengirim pesan',
                  body: 'Halo! Aku suka banget ngobrol sama kamu tadi',
                  timestamp: Date.now(),
                  read: false,
                  avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
                  senderId: 'anchor_1',
                  senderName: 'Dewi Lestari',
                });
              }}
              style={[styles.testActionBtn, { backgroundColor: colors.surfaceGlass, borderColor: colors.border }]}
            >
              <MessageCircle size={16} color={colors.primary} />
              <Text style={{ color: colors.text, fontSize: 12, fontWeight: '600', marginLeft: 8 }}>
                Uji Notif Pesan (Glass Chime)
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => {
                receiveNotification({
                  id: `test_gift_${Date.now()}`,
                  type: 'gift_received',
                  title: 'Hadiah Mawar Diterima',
                  body: 'Kamu menerima hadiah virtual dari penggemar setia!',
                  timestamp: Date.now(),
                  read: false,
                });
              }}
              style={[styles.testActionBtn, { backgroundColor: colors.surfaceGlass, borderColor: colors.border }]}
            >
              <Sparkles size={16} color="#FFB800" />
              <Text style={{ color: colors.text, fontSize: 12, fontWeight: '600', marginLeft: 8 }}>
                Uji Notif Hadiah (Sparkle Chime)
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => {
                setIsNotifModalOpen(false);
                receiveIncomingCall({
                  callId: `call_test_${Date.now()}`,
                  channelId: `ch_test_${Date.now()}`,
                  caller: {
                    id: 'host_dewi',
                    nickname: 'Dewi Lestari',
                    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
                    gender: 'female',
                    level: 3,
                    ratePerMin: 60,
                  },
                  agoraUid: 1002,
                  agoraToken: 'tok_test',
                  freeChatSeconds: 0,
                  billingIntervalSeconds: 60,
                  costPerInterval: 60,
                  timestamp: Date.now(),
                });
              }}
              style={[styles.testActionBtn, { backgroundColor: 'rgba(0, 210, 106, 0.12)', borderColor: '#00D26A' }]}
            >
              <Phone size={16} color="#00D26A" />
              <Text style={{ color: '#00D26A', fontSize: 12, fontWeight: '800', marginLeft: 8 }}>
                Uji Panggilan Masuk (Ringtone Loop)
              </Text>
            </TouchableOpacity>

            {/* Close */}
            <View style={{ marginTop: 14 }}>
              <TouchableOpacity
                style={[styles.modalCancelBtn, { borderColor: colors.border, width: '100%' }]}
                onPress={() => setIsNotifModalOpen(false)}
              >
                <Text style={{ color: colors.textSecondary, fontWeight: '600', textAlign: 'center' }}>
                  Tutup
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}

      {/* Terms & Privacy Legal Modal */}
      <LegalModal />

      {/* Missions & Rewards Task Center Modal (ala Tigo) */}
      <MissionsCenterModal />

      {/* Album Fullscreen Slide Viewer & Content Moderation Policy Modals */}
      <AlbumViewerModal />
      <ContentModerationPolicyModal />

      {/* Supabase Cloud & Live Data Hub Modal */}
      <SupabaseHubModal
        isVisible={isSupabaseModalOpen}
        onClose={() => setIsSupabaseModalOpen(false)}
      />

      {/* Bottom padding for navbar */}
      <View style={{ height: 32 }} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 48,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
  },
  agencyCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    borderWidth: 1,
    padding: 14,
    marginBottom: 16,
  },
  agencyTitle: {
    fontSize: 13,
    fontWeight: '700',
  },
  agencySub: {
    fontSize: 11,
    marginTop: 2,
  },
  agencyBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  trafficRadarCard: {
    padding: 14,
    borderRadius: 16,
    borderWidth: 1.2,
    marginBottom: 16,
    gap: 8,
  },
  trafficHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  trafficTitle: {
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 0.3,
  },
  trafficBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFB800',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    gap: 3,
  },
  trafficBadgeText: {
    color: '#000000',
    fontSize: 10,
    fontWeight: '900',
  },
  metricsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 184, 0, 0.15)',
  },
  metricItem: {
    alignItems: 'center',
  },
  metricLabel: {
    fontSize: 10,
    fontWeight: '600',
  },
  metricValue: {
    fontSize: 13,
    fontWeight: '800',
    marginTop: 2,
  },
  tipBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 2,
  },
  tipText: {
    fontSize: 11,
    lineHeight: 15,
    flex: 1,
  },
  menuListCard: {
    borderRadius: 20,
    borderWidth: 1,
    overflow: 'hidden',
    marginBottom: 16,
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    zIndex: 99,
  },
  modalContent: {
    width: '92%',
    maxWidth: 380,
    borderRadius: 24,
    borderWidth: 1,
    padding: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
  },
  modalSubtitle: {
    fontSize: 12,
    marginTop: 4,
    marginBottom: 16,
  },

  modalCancelBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
  },

  notifToggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    marginTop: 4,
    marginBottom: 8,
  },
  togglePill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  testActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 8,
  },
});
