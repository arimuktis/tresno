import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  ScrollView,
  Platform,
} from 'react-native';
import {
  X,
  Database,
  Radio,
  Zap,
  CheckCircle2,
  RefreshCw,
  ExternalLink,
  ShieldCheck,
  Users,
  MessageSquare,
  Key,
  Copy,
  Check,
  Flame,
  Wifi,
  Sparkles,
} from 'lucide-react-native';
import { useThemeStore } from '../../../theme/useThemeStore';
import { useAuthStore } from '../../../features/auth/stores/useAuthStore';
import {
  supabaseRealtimeService,
  RealtimeDiagnosticStats,
} from '../../services/supabaseRealtimeService';
import {
  getSupabaseConfig,
  updateSupabaseConfig,
  resetSupabaseConfig,
} from '../../services/supabaseClient';
import { toast } from '../../stores/useToastStore';
import { usePresenceStore } from '../../stores/usePresenceStore';

interface SupabaseHubModalProps {
  isVisible: boolean;
  onClose: () => void;
}

export const SupabaseHubModal: React.FC<SupabaseHubModalProps> = ({
  isVisible,
  onClose,
}) => {
  const { colors, isDark } = useThemeStore();
  const { user: authUser, session, loginWithGoogle, refreshSession } = useAuthStore();
  const {
    presences,
    simulateToggleHostStatus,
    getAvailableCount,
    getBusyCount,
    getOfflineCount,
  } = usePresenceStore();

  const availableCount = getAvailableCount();
  const busyCount = getBusyCount();
  const offlineCount = getOfflineCount();

  const [stats, setStats] = useState<RealtimeDiagnosticStats>(
    supabaseRealtimeService.getStats()
  );
  const [config, setConfig] = useState(getSupabaseConfig());
  const [customUrl, setCustomUrl] = useState(config.url);
  const [customKey, setCustomKey] = useState(config.anonKey);
  const [isEditingConfig, setIsEditingConfig] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    if (!isVisible) return;
    const unsub = supabaseRealtimeService.onStatusChange((newStats) => {
      setStats(newStats);
    });
    return unsub;
  }, [isVisible]);

  if (!isVisible) return null;

  const handleSaveConfig = () => {
    if (!customUrl.trim() || !customKey.trim()) {
      toast.error('URL dan Anon Key Supabase tidak boleh kosong.');
      return;
    }
    updateSupabaseConfig(customUrl, customKey);
    setConfig(getSupabaseConfig());
    setIsEditingConfig(false);
    supabaseRealtimeService.init(authUser);
    toast.success('Konfigurasi Supabase berhasil diperbarui & menyambung ulang.');
  };

  const handleResetConfig = () => {
    resetSupabaseConfig();
    const def = getSupabaseConfig();
    setConfig(def);
    setCustomUrl(def.url);
    setCustomKey(def.anonKey);
    setIsEditingConfig(false);
    supabaseRealtimeService.init(authUser);
    toast.info('Konfigurasi Supabase dikembalikan ke default.');
  };

  const handleManualRefreshToken = async () => {
    setIsRefreshing(true);
    try {
      const ok = await refreshSession();
      if (ok) {
        toast.success('Token sesi Supabase berhasil diperbarui!');
      } else {
        toast.error('Gagal memperbarui token.');
      }
    } catch (e: any) {
      toast.error(e.message || 'Gagal refresh token.');
    } finally {
      setIsRefreshing(false);
    }
  };

  const isReal = config.isReal;

  return (
    <Modal
      visible={isVisible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View
          style={[
            styles.container,
            {
              backgroundColor: colors.surfaceCard,
              borderColor: colors.border,
            },
          ]}
        >
          {/* Header */}
          <View style={[styles.header, { borderBottomColor: colors.border }]}>
            <View style={{ flex: 1 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Database size={20} color="#3ECF8E" />
                <Text style={[styles.title, { color: colors.text }]}>
                  Supabase Cloud &amp; Live Data Hub
                </Text>
              </View>
              <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
                OAuth 2.0 PKCE • Realtime Presence &amp; Live Broadcast
              </Text>
            </View>

            <TouchableOpacity
              onPress={onClose}
              style={[styles.closeBtn, { backgroundColor: colors.surfaceGlass }]}
              activeOpacity={0.7}
            >
              <X size={18} color={colors.text} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.body} showsVerticalScrollIndicator={false}>
            {/* CONNECTION STATUS BANNER */}
            <View
              style={[
                styles.statusBanner,
                {
                  backgroundColor:
                    stats.state === 'connected'
                      ? 'rgba(0, 210, 106, 0.12)'
                      : stats.state === 'simulated_live'
                      ? 'rgba(255, 184, 0, 0.12)'
                      : 'rgba(255, 45, 85, 0.12)',
                  borderColor:
                    stats.state === 'connected'
                      ? '#00D26A'
                      : stats.state === 'simulated_live'
                      ? '#FFB800'
                      : '#FF2D55',
                },
              ]}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <Wifi
                    size={16}
                    color={
                      stats.state === 'connected'
                        ? '#00D26A'
                        : stats.state === 'simulated_live'
                        ? '#FFB800'
                        : '#FF2D55'
                    }
                  />
                  <Text
                    style={[
                      styles.statusTitle,
                      {
                        color:
                          stats.state === 'connected'
                            ? '#00D26A'
                            : stats.state === 'simulated_live'
                            ? '#FFB800'
                            : '#FF2D55',
                      },
                    ]}
                  >
                    {stats.state === 'connected'
                      ? 'SUPABASE REALTIME: TERHUBUNG (LIVE)'
                      : stats.state === 'simulated_live'
                      ? 'REALTIME: MULTI-TAB LIVE SYNC (DEMO)'
                      : 'REALTIME: DISCONNECTED'}
                  </Text>
                </View>

                <View style={styles.pingPill}>
                  <Text style={styles.pingText}>Ping: {stats.pingMs}ms</Text>
                </View>
              </View>

              <Text style={[styles.statusDesc, { color: colors.textSecondary }]}>
                {stats.state === 'connected'
                  ? 'Koneksi WebSocket Realtime aktif langsung ke server Supabase Cloud.'
                  : 'BroadcastChannel sinkronisasi multi-tab browser aktif untuk event live stories, presence & chat.'}
              </Text>
            </View>

            {/* OAUTH 2.0 PKCE SECTION */}
            <View style={[styles.card, { borderColor: colors.border }]}>
              <View style={styles.cardHeader}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <ShieldCheck size={18} color="#4285F4" />
                  <Text style={[styles.cardTitle, { color: colors.text }]}>
                    Supabase OAuth 2.0 (Google Auth)
                  </Text>
                </View>

                <View
                  style={[
                    styles.providerBadge,
                    {
                      backgroundColor:
                        authUser?.provider === 'google'
                          ? 'rgba(66, 133, 244, 0.15)'
                          : colors.surfaceGlass,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.providerBadgeText,
                      {
                        color:
                          authUser?.provider === 'google' ? '#4285F4' : colors.textSecondary,
                      },
                    ]}
                  >
                    {authUser?.provider ? `PROVIDER: ${authUser.provider.toUpperCase()}` : 'GUEST'}
                  </Text>
                </View>
              </View>

              <View style={styles.metaRow}>
                <Text style={[styles.metaLabel, { color: colors.textSecondary }]}>Akun Pengguna:</Text>
                <Text style={[styles.metaValue, { color: colors.text }]}>
                  {authUser?.nickname || 'Guest'} ({authUser?.email || 'Belum terhubung email'})
                </Text>
              </View>

              <View style={styles.metaRow}>
                <Text style={[styles.metaLabel, { color: colors.textSecondary }]}>User UUID:</Text>
                <Text style={[styles.metaValue, { color: colors.text }]} numberOfLines={1}>
                  {authUser?.id || '-'}
                </Text>
              </View>

              <View style={styles.metaRow}>
                <Text style={[styles.metaLabel, { color: colors.textSecondary }]}>Sesi Token Expiry:</Text>
                <Text style={[styles.metaValue, { color: colors.text }]}>
                  {session?.expiresAt ? new Date(session.expiresAt).toLocaleTimeString() : 'Aktif (1 Jam)'}
                </Text>
              </View>

              {/* Action Buttons */}
              <View style={styles.btnRow}>
                <TouchableOpacity
                  onPress={loginWithGoogle}
                  style={[styles.primaryActionBtn, { backgroundColor: '#4285F4' }]}
                  activeOpacity={0.8}
                >
                  <Zap size={14} color="#FFFFFF" style={{ marginRight: 6 }} />
                  <Text style={styles.primaryActionBtnText}>Masuk via Google OAuth</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={handleManualRefreshToken}
                  disabled={isRefreshing}
                  style={[styles.secondaryActionBtn, { borderColor: colors.border }]}
                  activeOpacity={0.7}
                >
                  <RefreshCw size={13} color={colors.text} style={{ marginRight: 4 }} />
                  <Text style={[styles.secondaryActionBtnText, { color: colors.text }]}>
                    {isRefreshing ? 'Memperbarui...' : 'Refresh Token'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* LIVE DATA & REALTIME MONITOR */}
            <View style={[styles.card, { borderColor: colors.border }]}>
              <View style={styles.cardHeader}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <Radio size={18} color="#FF2D55" />
                  <Text style={[styles.cardTitle, { color: colors.text }]}>
                    Live Data Channels &amp; Presence
                  </Text>
                </View>
                <Text style={{ color: '#00D26A', fontSize: 11, fontWeight: '700' }}>
                  {stats.onlineUsersCount} Online
                </Text>
              </View>

              {/* Metrics Grid */}
              <View style={styles.metricsGrid}>
                <View style={[styles.metricItem, { backgroundColor: colors.surfaceGlass }]}>
                  <Text style={[styles.metricNumber, { color: colors.primary }]}>
                    {stats.totalEventsReceived}
                  </Text>
                  <Text style={[styles.metricLabel, { color: colors.textSecondary }]}>
                    Live Event Diterima
                  </Text>
                </View>

                <View style={[styles.metricItem, { backgroundColor: colors.surfaceGlass }]}>
                  <Text style={[styles.metricNumber, { color: '#00D26A' }]}>
                    {stats.activeChannels.length}
                  </Text>
                  <Text style={[styles.metricLabel, { color: colors.textSecondary }]}>
                    Channel Aktif
                  </Text>
                </View>

                <View style={[styles.metricItem, { backgroundColor: colors.surfaceGlass }]}>
                  <Text style={[styles.metricNumber, { color: colors.gold }]}>
                    {availableCount + busyCount}
                  </Text>
                  <Text style={[styles.metricLabel, { color: colors.textSecondary }]}>
                    Live Online &amp; Busy
                  </Text>
                </View>
              </View>

              {/* Live Presence Tri-State Status Dashboard */}
              <View style={{ marginBottom: 12, padding: 10, borderRadius: 12, backgroundColor: colors.surfaceGlass, borderWidth: 1, borderColor: colors.border }}>
                <Text style={{ fontSize: 11, fontWeight: '800', color: colors.text, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                  Live Presence Status (Tri-State Indicator):
                </Text>
                <View style={{ flexDirection: 'row', gap: 6, marginBottom: 10 }}>
                  <View style={{ flex: 1, paddingVertical: 8, paddingHorizontal: 6, borderRadius: 8, backgroundColor: 'rgba(0, 210, 106, 0.12)', borderWidth: 1, borderColor: '#00D26A', alignItems: 'center' }}>
                    <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: '#00D26A', marginBottom: 4 }} />
                    <Text style={{ color: '#00D26A', fontSize: 14, fontWeight: '900' }}>{availableCount}</Text>
                    <Text style={{ color: colors.textSecondary, fontSize: 9, fontWeight: '600', textAlign: 'center' }}>Online Tersedia</Text>
                  </View>
                  <View style={{ flex: 1, paddingVertical: 8, paddingHorizontal: 6, borderRadius: 8, backgroundColor: 'rgba(255, 46, 99, 0.12)', borderWidth: 1, borderColor: '#FF2E63', alignItems: 'center' }}>
                    <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: '#FF2E63', marginBottom: 4 }} />
                    <Text style={{ color: '#FF2E63', fontSize: 14, fontWeight: '900' }}>{busyCount}</Text>
                    <Text style={{ color: colors.textSecondary, fontSize: 9, fontWeight: '600', textAlign: 'center' }}>Sedang Call (Busy)</Text>
                  </View>
                  <View style={{ flex: 1, paddingVertical: 8, paddingHorizontal: 6, borderRadius: 8, backgroundColor: 'rgba(148, 163, 184, 0.12)', borderWidth: 1, borderColor: '#94A3B8', alignItems: 'center' }}>
                    <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: '#94A3B8', marginBottom: 4 }} />
                    <Text style={{ color: '#94A3B8', fontSize: 14, fontWeight: '900' }}>{offlineCount}</Text>
                    <Text style={{ color: colors.textSecondary, fontSize: 9, fontWeight: '600', textAlign: 'center' }}>Offline</Text>
                  </View>
                </View>

                {/* Interactive Toggle for Testing Live Updates */}
                <Text style={{ fontSize: 10, fontWeight: '700', color: colors.textSecondary, marginBottom: 6 }}>
                  Uji Live Presence Toggle (Reaktivitas Real-Time):
                </Text>
                <View style={{ flexDirection: 'row', gap: 6 }}>
                  <TouchableOpacity
                    onPress={() => {
                      simulateToggleHostStatus('anchor_bella');
                      const st = usePresenceStore.getState().getStatus('anchor_bella');
                      toast.info(`Bella Putri berganti jadi: ${st.toUpperCase()}`);
                    }}
                    style={{ flex: 1, paddingVertical: 7, paddingHorizontal: 6, borderRadius: 8, borderWidth: 1, borderColor: colors.border, backgroundColor: 'rgba(255, 46, 99, 0.1)', alignItems: 'center' }}
                    activeOpacity={0.7}
                  >
                    <Text style={{ fontSize: 10, fontWeight: '700', color: colors.text }}>
                      Toggle Bella ({presences['anchor_bella']?.status === 'busy' ? '🔴 Call' : '🟢 Free'})
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => {
                      simulateToggleHostStatus('anchor_dewi');
                      const st = usePresenceStore.getState().getStatus('anchor_dewi');
                      toast.info(`Dewi Lestari berganti jadi: ${st.toUpperCase()}`);
                    }}
                    style={{ flex: 1, paddingVertical: 7, paddingHorizontal: 6, borderRadius: 8, borderWidth: 1, borderColor: colors.border, backgroundColor: 'rgba(0, 210, 106, 0.1)', alignItems: 'center' }}
                    activeOpacity={0.7}
                  >
                    <Text style={{ fontSize: 10, fontWeight: '700', color: colors.text }}>
                      Toggle Dewi ({presences['anchor_dewi']?.status === 'available' ? '🟢 Online' : '🔴 Call'})
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Channel List */}
              <View style={styles.channelList}>
                {stats.activeChannels.map((ch, idx) => (
                  <View key={idx} style={[styles.channelPill, { backgroundColor: colors.surfaceGlass, borderColor: colors.border }]}>
                    <Radio size={11} color="#00D26A" style={{ marginRight: 4 }} />
                    <Text style={[styles.channelPillText, { color: colors.text }]}>{ch}</Text>
                  </View>
                ))}
              </View>

              {/* Interactive Live Data Testing Buttons */}
              <View style={{ marginTop: 12 }}>
                <Text style={[styles.testSectionTitle, { color: colors.text }]}>
                  Uji Aliran Live Data (Simulator Event):
                </Text>
                <View style={styles.testBtnRow}>
                  <TouchableOpacity
                    onPress={() => {
                      supabaseRealtimeService.triggerTestLiveEvent('story');
                      toast.success('Event cerita baru di-broadcast via Supabase Live Data!');
                    }}
                    style={[styles.testLiveBtn, { backgroundColor: 'rgba(255, 45, 85, 0.15)', borderColor: '#FF2D55' }]}
                    activeOpacity={0.7}
                  >
                    <Flame size={13} color="#FF2D55" style={{ marginRight: 4 }} />
                    <Text style={{ color: '#FF2D55', fontSize: 11, fontWeight: '700' }}>
                      Broadcast Cerita Live
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => {
                      supabaseRealtimeService.triggerTestLiveEvent('presence');
                      toast.info('Event presence user online diperbarui via Supabase Realtime!');
                    }}
                    style={[styles.testLiveBtn, { backgroundColor: 'rgba(0, 210, 106, 0.15)', borderColor: '#00D26A' }]}
                    activeOpacity={0.7}
                  >
                    <Users size={13} color="#00D26A" style={{ marginRight: 4 }} />
                    <Text style={{ color: '#00D26A', fontSize: 11, fontWeight: '700' }}>
                      Tambah Presence Live
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            {/* CONFIGURATION DRAWER (CUSTOM URL & ANON KEY) */}
            <View style={[styles.card, { borderColor: colors.border }]}>
              <View style={styles.cardHeader}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <Key size={18} color={colors.gold} />
                  <Text style={[styles.cardTitle, { color: colors.text }]}>
                    Konfigurasi Project Supabase
                  </Text>
                </View>

                <TouchableOpacity
                  onPress={() => setIsEditingConfig(!isEditingConfig)}
                  style={[styles.editConfigBtn, { borderColor: colors.border }]}
                >
                  <Text style={{ color: colors.primary, fontSize: 11, fontWeight: '700' }}>
                    {isEditingConfig ? 'Batal' : 'Ubah URL / Key'}
                  </Text>
                </TouchableOpacity>
              </View>

              {!isEditingConfig ? (
                <View>
                  <View style={styles.metaRow}>
                    <Text style={[styles.metaLabel, { color: colors.textSecondary }]}>URL:</Text>
                    <Text style={[styles.metaValue, { color: colors.text }]} numberOfLines={1}>
                      {config.url}
                    </Text>
                  </View>
                  <View style={styles.metaRow}>
                    <Text style={[styles.metaLabel, { color: colors.textSecondary }]}>Status Project:</Text>
                    <Text style={{ color: isReal ? '#00D26A' : colors.gold, fontSize: 12, fontWeight: '700' }}>
                      {isReal ? 'Project Asli Terhubung' : 'Demo Hybrid / Simulated Mode'}
                    </Text>
                  </View>
                </View>
              ) : (
                <View style={{ marginTop: 8 }}>
                  <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>
                    Supabase Project URL:
                  </Text>
                  <TextInput
                    value={customUrl}
                    onChangeText={setCustomUrl}
                    placeholder="https://xxxx.supabase.co"
                    placeholderTextColor={colors.textSecondary}
                    style={[
                      styles.input,
                      {
                        backgroundColor: colors.surfaceGlass,
                        color: colors.text,
                        borderColor: colors.border,
                      },
                    ]}
                  />

                  <Text style={[styles.inputLabel, { color: colors.textSecondary, marginTop: 8 }]}>
                    Supabase Anon Public Key:
                  </Text>
                  <TextInput
                    value={customKey}
                    onChangeText={setCustomKey}
                    placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                    placeholderTextColor={colors.textSecondary}
                    secureTextEntry
                    style={[
                      styles.input,
                      {
                        backgroundColor: colors.surfaceGlass,
                        color: colors.text,
                        borderColor: colors.border,
                      },
                    ]}
                  />

                  <View style={styles.btnRow}>
                    <TouchableOpacity
                      onPress={handleSaveConfig}
                      style={[styles.primaryActionBtn, { backgroundColor: colors.primary }]}
                    >
                      <Text style={styles.primaryActionBtnText}>Simpan &amp; Hubungkan</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      onPress={handleResetConfig}
                      style={[styles.secondaryActionBtn, { borderColor: colors.border }]}
                    >
                      <Text style={[styles.secondaryActionBtnText, { color: colors.gold }]}>
                        Reset ke Demo
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.72)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  container: {
    width: '92%',
    maxWidth: 380,
    maxHeight: '90%',
    borderRadius: 24,
    borderWidth: 1,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 18,
    borderBottomWidth: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '800',
  },
  subtitle: {
    fontSize: 11,
    marginTop: 2,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  body: {
    padding: 18,
  },
  statusBanner: {
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 14,
  },
  statusTitle: {
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  statusDesc: {
    fontSize: 11,
    marginTop: 6,
    lineHeight: 15,
  },
  pingPill: {
    backgroundColor: 'rgba(0,0,0,0.4)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  pingText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
  },
  card: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 14,
    marginBottom: 14,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  cardTitle: {
    fontSize: 13,
    fontWeight: '800',
  },
  providerBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  providerBadgeText: {
    fontSize: 10,
    fontWeight: '800',
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  metaLabel: {
    fontSize: 11,
  },
  metaValue: {
    fontSize: 11,
    fontWeight: '600',
    maxWidth: '65%',
  },
  btnRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 10,
  },
  primaryActionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 9,
    paddingHorizontal: 12,
    borderRadius: 10,
  },
  primaryActionBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },
  secondaryActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 9,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1,
  },
  secondaryActionBtnText: {
    fontSize: 12,
    fontWeight: '700',
  },
  metricsGrid: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 10,
  },
  metricItem: {
    flex: 1,
    padding: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  metricNumber: {
    fontSize: 16,
    fontWeight: '900',
  },
  metricLabel: {
    fontSize: 10,
    textAlign: 'center',
    marginTop: 2,
  },
  channelList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginVertical: 4,
  },
  channelPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
  },
  channelPillText: {
    fontSize: 11,
    fontWeight: '600',
  },
  testSectionTitle: {
    fontSize: 11,
    fontWeight: '700',
    marginBottom: 6,
  },
  testBtnRow: {
    flexDirection: 'row',
    gap: 8,
  },
  testLiveBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 8,
    borderWidth: 1,
  },
  editConfigBtn: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
  },
  inputLabel: {
    fontSize: 11,
    marginBottom: 4,
  },
  input: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 7,
    fontSize: 12,
  },
});
