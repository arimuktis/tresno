import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, StatusBar, Platform } from 'react-native';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import { THEME } from './theme/tokens';
import { useWalletStore } from './features/wallet/stores/useWalletStore';
import { useCallStore } from './features/video-chat/stores/useCallStore';
import { MatchRadar } from './features/matchmaking/components/MatchRadar';
import { VideoCallOverlay } from './features/video-chat/components/VideoCallOverlay';
import { TopupModal } from './features/wallet/components/TopupModal';
import { GentlemanUpsellModal } from './features/matchmaking/components/GentlemanUpsellModal';
import { socketService } from './shared/services/socketService';
import { soundService } from './shared/services/soundService';
import { useAuthStore } from './features/auth/stores/useAuthStore';
import { SplashScreen } from './features/auth/components/SplashScreen';
import { LoginScreen } from './features/auth/components/LoginScreen';
import { OnboardingScreen } from './features/onboarding/components/OnboardingScreen';
import { useThemeStore } from './theme/useThemeStore';
import { ThemeSwitcherModal } from './shared/components/molecules/ThemeSwitcherModal';
import { BottomNavBar, MainTabKey } from './features/navigation/components/BottomNavBar';
import { MatchTab } from './features/matchmaking/components/MatchTab';
import { DestinyTab } from './features/destiny/components/DestinyTab';
import { MessagesTab } from './features/messages/components/MessagesTab';
import { ChatRoomModal } from './features/messages/components/ChatRoomModal';
import { StoryViewerModal } from './features/stories/components/StoryViewerModal';
import { MineTab } from './features/mine/components/MineTab';
import { useHostRadarStore } from './features/destiny/services/destinyAlgorithm';
import { LiquidBackgroundGlow } from './shared/components/atoms/LiquidBackgroundGlow';
import { NetworkStatusBar, ToastContainer, ErrorBoundary } from './shared/components/molecules';
import { InAppNotificationBanner } from './features/notifications/components/InAppNotificationBanner';
import { IncomingCallModal } from './features/notifications/components/IncomingCallModal';
import { useNotificationStore } from './features/notifications/stores/useNotificationStore';
import { toast } from './shared/stores/useToastStore';
import { useTranslation } from './i18n';
import { initChucker, ChuckerBubble, ChuckerModal } from './shared/chucker';
import { supabaseRealtimeService } from './shared/services/supabaseRealtimeService';
import { authService } from './features/auth/services/authService';
import { deepLinkService } from './shared/services/deepLinkService';
import { DeepLinkTesterModal } from './shared/components/devtools/DeepLinkTesterModal';

// Inisialisasi Chucker Network Inspector untuk merekam seluruh request HTTP & WebSocket
initChucker();

const AppContent: React.FC = () => {
  const insets = useSafeAreaInsets();
  const { colors, isDark } = useThemeStore();
  const { t } = useTranslation();
  const { currentStep, user: authUser } = useAuthStore();
  const { openTopupModal, setCoins, addPoints } = useWalletStore();
  const { receiveNotification, receiveIncomingCall, unreadCount } = useNotificationStore();
  const {
    stage,
    activeMatch,
    startSearching,
    matchFound,
    decrementTrial,
    incrementDuration,
    endCall,
    resetCall,
  } = useCallStore();

  const [activeTab, setActiveTab] = useState<MainTabKey>('match');
  const [matchPaidWith, setMatchPaidWith] = useState<'coupon' | 'coins' | null>(null);

  // Inisialisasi Deep Link Engine dan hubungkan ke tab switcher
  useEffect(() => {
    deepLinkService.registerTabNavigator(setActiveTab);
    deepLinkService.init();
  }, []);

  // Default screen fallback setelah login atau onboarding selalu ke screen Matchmaking ('match')
  useEffect(() => {
    if (currentStep === 'main') {
      setActiveTab('match');
    }
  }, [currentStep]);

  const [fallbackUserId] = useState(() => {
    if (typeof window !== 'undefined' && window.sessionStorage) {
      let id = window.sessionStorage.getItem('tresno_user_id');
      if (!id) {
        id = `user_${Math.random().toString(36).substring(2, 8)}`;
        window.sessionStorage.setItem('tresno_user_id', id);
      }
      return id;
    }
    return `user_${Date.now().toString(36)}`;
  });

  const effectiveUserId = authUser?.id || fallbackUserId;
  const effectiveNickname = authUser?.nickname || `User ${effectiveUserId.substring(5)}`;

  // Inisialisasi Supabase Realtime Live Data & Auth Listener
  useEffect(() => {
    supabaseRealtimeService.init(authUser);
    const unsubAuth = authService.initSupabaseAuthListener((user, session) => {
      console.log('[Supabase Auth Listener] Live auth change:', user.email);
    });

    return () => {
      unsubAuth();
    };
  }, [authUser]);

  // Sambungkan ke Backend WebSocket hanya saat user dalam sesi aktif (main)
  useEffect(() => {
    if (currentStep === 'main' && effectiveUserId) {
      socketService.connect(effectiveUserId, effectiveNickname);
    } else {
      socketService.disconnect();
    }

    const unsubSearch = socketService.on('SEARCHING', () => {
      startSearching();
    });

    const unsubMatch = socketService.on('MATCH_FOUND', (payload) => {
      console.log('Real Match Found from Backend:', payload);
      setMatchPaidWith(null); // Sesi match berhasil terhubung, biaya terpakai
      matchFound(payload);
    });

    const unsubDeduction = socketService.on('COIN_DEDUCTION', (payload) => {
      console.log('Real Coin Deduction from Backend Billing Worker:', payload);
      setCoins(payload.newBalance);
    });

    const unsubPoints = socketService.on('POINTS_EARNED', (payload: any) => {
      console.log('Host Points Earned from Call:', payload);
      addPoints(payload.points || 45);
      soundService.playCoinSound();
      toast.show(`+${payload.points || 45} Points diterima dari panggilan video!`, 'success');
    });

    const unsubTerminated = socketService.on('CALL_TERMINATED', (payload) => {
      console.log('Call Terminated by Backend:', payload);
      endCall(payload.reason);
      if (payload.reason === 'insufficient_balance') {
        toast.show('Panggilan berakhir karena saldo koin habis.', 'warning');
        openTopupModal();
      } else if (payload.reason === 'drm_violation_repeated') {
        toast.show('Panggilan diakhiri demi perlindungan privasi.', 'error');
      } else if (payload.reason === 'user_hungup') {
        toast.show('Panggilan telah diakhiri.', 'info');
      } else {
        toast.show('Panggilan telah berakhir.', 'info');
      }
    });

    const unsubCancel = socketService.on('SEARCH_CANCELLED', () => {
      resetCall();
    });

    const unsubNotif = socketService.on('NOTIFICATION_RECEIVED', (payload) => {
      console.log('Push Notification received:', payload);
      receiveNotification(payload);
    });

    const unsubIncomingCall = socketService.on('INCOMING_CALL_REQUEST', (payload) => {
      console.log('Incoming Call Request received:', payload);
      receiveIncomingCall(payload);
    });

    const unsubHostRadar = socketService.on('HOST_RADAR_STATS', (payload) => {
      console.log('Host Radar Stats received from Backend:', payload);
      useHostRadarStore.getState().setStats(payload);
    });

    return () => {
      unsubSearch();
      unsubMatch();
      unsubDeduction();
      unsubPoints();
      unsubTerminated();
      unsubCancel();
      unsubNotif();
      unsubIncomingCall();
      unsubHostRadar();
    };
  }, [currentStep, effectiveUserId, effectiveNickname]);

  // Handler Mulai Match: 20 detik gratis HANYA di matchmaking (jika punya kupon match atau bayar 3 koin)
  const handleStartMatch = () => {
    // Host yang online tidak dikenakan biaya karena host bertindak sebagai penerima panggilan
    if (authUser?.isHost) {
      startSearching();
      socketService.send('START_MATCH', {
        filter: { targetGender: 'all' },
        userSummary: {
          id: effectiveUserId,
          nickname: effectiveNickname,
          gender: authUser?.gender || 'female',
          level: 1,
        },
      });
      return;
    }

    const {
      matchCoupons,
      useMatchCoupon,
      coinBalance,
      deductCoins,
      hasClaimedStarterPack,
      openStarterPackModal,
    } = useWalletStore.getState();

    if (matchCoupons > 0) {
      useMatchCoupon();
      setMatchPaidWith('coupon');
      toast.show('1 Kupon Match digunakan • 20 Detik Pertama Gratis', 'info');
    } else if (coinBalance >= 3) {
      deductCoins(3);
      setMatchPaidWith('coins');
      toast.show('3 Koin matchmaking digunakan • 20 Detik Pertama Gratis', 'info');
    } else {
      // Upsell prioritas untuk user pria yang baru pertama kali kehabisan kupon/koin
      const isMale = authUser?.gender === 'male' || (!authUser?.isHost && authUser?.gender !== 'female');
      if (isMale && !hasClaimedStarterPack) {
        toast.show('Kupon & koin habis. Dapatkan 120 Koin + 5 Kupon di Paket Gentleman!', 'info');
        openStarterPackModal();
      } else {
        toast.show('Dibutuhkan 1 Kupon atau 3 Koin untuk mencari match (20 detik gratis).', 'warning');
        openTopupModal();
      }
      return;
    }

    startSearching();
    socketService.send('START_MATCH', {
      filter: { targetGender: 'all' },
      userSummary: {
        id: effectiveUserId,
        nickname: effectiveNickname,
        gender: authUser?.gender || 'male',
        level: 1,
      },
    });
  };

  // Handler Batalkan Match via Backend Nyata (Kembalikan kupon atau koin jika dibatalkan)
  const handleCancelMatch = () => {
    socketService.send('CANCEL_MATCH', {});
    if (matchPaidWith === 'coupon') {
      useWalletStore.getState().addMatchCoupons(1);
      toast.show('Pencarian dibatalkan. 1 Kupon dikembalikan.', 'info');
    } else if (matchPaidWith === 'coins') {
      useWalletStore.getState().addCoins(3);
      toast.show('Pencarian dibatalkan. 3 Koin dikembalikan.', 'info');
    }
    setMatchPaidWith(null);
    resetCall();
  };

  // Timer visual lokal (disinkronisasi dengan sinyal backend)
  useEffect(() => {
    if (stage !== 'in_call') return;

    const timer = setInterval(() => {
      incrementDuration();
      decrementTrial();
    }, 1000);

    return () => clearInterval(timer);
  }, [stage]);

  return (
    <View style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={colors.background}
        translucent={Platform.OS === 'android'}
      />

      {/* Ambient Liquid Glass Background Glow */}
      <LiquidBackgroundGlow />

      {/* Floating Offline-First Network Status Bar */}
      <NetworkStatusBar />

      {/* Global Toast & Snackbar Notifications */}
      <ToastContainer />

      {/* Floating In-App Push Notification Banner */}
      <InAppNotificationBanner />

      {/* Full-Featured Incoming Video Call Screen & Ringtone */}
      <IncomingCallModal />

      {/* 1. Splash Screen */}
      {currentStep === 'splash' && <SplashScreen />}

      {/* 2. Login Screen */}
      {currentStep === 'login' && <LoginScreen />}

      {/* 3. Onboarding Screen */}
      {currentStep === 'onboarding' && <OnboardingScreen />}

      {/* 4. Main View */}
      {currentStep === 'main' && (
        <>
          <View style={[styles.mainContainer, stage !== 'idle' && { display: 'none' }]}>
            {/* Main Tab View (Match, Destiny, Messages, Mine) */}
            <View style={[styles.tabContentContainer, { paddingTop: insets.top }]}>
              {activeTab === 'match' && <MatchTab onStartMatch={handleStartMatch} />}
              {activeTab === 'destiny' && <DestinyTab />}
              {activeTab === 'messages' && <MessagesTab />}
              {activeTab === 'mine' && <MineTab />}
            </View>

            {/* Bottom Navigation Bar khas Tigo */}
            <BottomNavBar
              activeTab={activeTab}
              onTabChange={setActiveTab}
              unreadCount={unreadCount}
            />
          </View>

          {/* Screen: Radar Pencarian Match */}
          {stage === 'searching' && (
            <MatchRadar onCancel={handleCancelMatch} />
          )}

          {/* Modal Chat Room (Telegram-style micro-batching) */}
          <ChatRoomModal />

          {/* Fullscreen Story Viewer (Instagram-style 24h Ephemeral Stories) */}
          <StoryViewerModal />

          {/* Screen: Video Call Aktif (Dilindungi DRM Ketat) */}
          {stage === 'in_call' && (
            <View
              style={[
                styles.videoContainer,
                Platform.OS === 'web' && ({
                  userSelect: 'none',
                  WebkitUserSelect: 'none',
                } as any),
              ]}
            >
              {/* Mock Video Canvas */}
              <View style={styles.remoteVideoPlaceholder}>
                <Text style={styles.remoteVideoText}>{t('call.remoteStreamActive')}</Text>
                <Text style={styles.remoteVideoSub}>
                  {activeMatch?.peer ? activeMatch.peer.nickname : t('call.defaultPeerName')}
                </Text>
              </View>

              {/* Local User PIP */}
              <View style={styles.localPip}>
                <Text style={styles.pipText}>{t('call.yourCamera')}</Text>
              </View>

              {/* Overlay UI */}
              <VideoCallOverlay />
            </View>
          )}

          {/* Modal Top-up QRIS */}
          <TopupModal />

          {/* Modal Paket Perdana Gentleman VIP Rp 9.900 (High-Converting Male Upsell) */}
          <GentlemanUpsellModal />

          {/* Modal Pengaturan Tema, Warna & Bahasa */}
          <ThemeSwitcherModal />

          {/* Modal Simulator Deep Link & Notifikasi Routing */}
          <DeepLinkTesterModal />
        </>
      )}

      {/* Chucker Network Inspector Floating Widget & Inspector Modal */}
      <ChuckerBubble />
      <ChuckerModal />
    </View>
  );
};

export const App: React.FC = () => {
  return (
    <SafeAreaProvider>
      <ErrorBoundary>
        <AppContent />
      </ErrorBoundary>
    </SafeAreaProvider>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: THEME.colors.background,
  },
  mainContainer: {
    flex: 1,
    justifyContent: 'space-between',
  },
  tabContentContainer: {
    flex: 1,
  },
  videoContainer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#000000',
    zIndex: 500,
  },
  remoteVideoPlaceholder: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#1A1829',
    alignItems: 'center',
    justifyContent: 'center',
  },
  remoteVideoText: {
    color: THEME.colors.secondary,
    fontWeight: 'bold',
    fontSize: 16,
  },
  remoteVideoSub: {
    color: THEME.colors.textSecondary,
    marginTop: 6,
  },
  localPip: {
    position: 'absolute',
    top: 100,
    right: 16,
    width: 100,
    height: 140,
    backgroundColor: '#2E2B44',
    borderRadius: THEME.borderRadius.md,
    borderWidth: 1.5,
    borderColor: THEME.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pipText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '600',
  },
});
