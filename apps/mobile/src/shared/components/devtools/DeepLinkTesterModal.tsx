import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Platform,
} from 'react-native';
import {
  Link,
  X,
  Send,
  Compass,
  MessageCircle,
  Coins,
  Award,
  Sparkles,
  ShieldCheck,
  Bell,
  Clock,
  CheckCircle2,
  AlertCircle,
  Trash2,
} from 'lucide-react-native';
import { useThemeStore } from '../../../theme/useThemeStore';
import { deepLinkService } from '../../services/deepLinkService';
import { useDeepLinkStore } from '../../stores/useDeepLinkStore';
import { useNotificationStore } from '../../../features/notifications/stores/useNotificationStore';
import { toast } from '../../stores/useToastStore';

export const DeepLinkTesterModal: React.FC = () => {
  const { colors, isDark } = useThemeStore();
  const { isTesterModalOpen, closeTesterModal, history, clearHistory } = useDeepLinkStore();
  const { receiveNotification } = useNotificationStore();

  const [customUrl, setCustomUrl] = useState('tresno://chat/anchor_dewi');

  if (!isTesterModalOpen) return null;

  const handleExecute = (url: string) => {
    closeTesterModal();
    const success = deepLinkService.handleUrl(url, 'simulator');
    if (success) {
      toast.success(`Deep link berhasil dieksekusi: ${url}`);
    }
  };

  const handleSimulateNotificationWithDeepLink = (
    title: string,
    body: string,
    actionUrl: string,
    type: any = 'system_promo',
    senderId?: string
  ) => {
    closeTesterModal();
    receiveNotification({
      id: `dl_notif_${Date.now()}`,
      type,
      title,
      body,
      timestamp: Date.now(),
      read: false,
      actionUrl,
      senderId,
      senderName: senderId ? 'Dewi Lestari' : undefined,
      avatarUrl: senderId ? 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300' : undefined,
    });
    toast.info('Notifikasi dengan Deep Link berhasil dikirim ke banner atas!');
  };

  const sampleDeepLinks = [
    { label: 'Chat Dewi Lestari', url: 'tresno://chat/anchor_dewi', icon: <MessageCircle size={14} color={colors.primary} /> },
    { label: 'Destiny (Host Online)', url: 'tresno://destiny?filter=online', icon: <Compass size={14} color="#00D26A" /> },
    { label: 'Top-Up Koin QRIS', url: 'tresno://topup', icon: <Coins size={14} color={colors.gold} /> },
    { label: 'Pusat Misi Harian', url: 'tresno://missions', icon: <Award size={14} color="#3B82F6" /> },
    { label: 'Paket Gentleman VIP', url: 'tresno://gentleman', icon: <Sparkles size={14} color="#EC4899" /> },
    { label: 'Penarikan Dana Host', url: 'tresno://cashout', icon: <Coins size={14} color="#10B981" /> },
    { label: 'Admin CMS Panel', url: 'tresno://admin', icon: <ShieldCheck size={14} color={colors.gold} /> },
    { label: 'Pengaturan Tema', url: 'tresno://theme', icon: <Compass size={14} color={colors.textSecondary} /> },
  ];

  return (
    <Modal
      visible={isTesterModalOpen}
      transparent
      animationType="fade"
      onRequestClose={closeTesterModal}
    >
      <View style={styles.backdrop}>
        <View style={[styles.modalCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          {/* Header */}
          <View style={styles.header}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <View style={[styles.iconCircle, { backgroundColor: colors.primaryGlow }]}>
                <Link size={18} color={colors.primary} />
              </View>
              <View>
                <Text style={[styles.title, { color: colors.text }]}>Simulator Deep Link</Text>
                <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
                  Uji Tautan Kustom &amp; Notifikasi Deep Link
                </Text>
              </View>
            </View>
            <TouchableOpacity onPress={closeTesterModal} style={[styles.closeBtn, { backgroundColor: colors.surfaceCard }]}>
              <X size={16} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.scrollArea} showsVerticalScrollIndicator={false}>
            {/* Input URL Kustom */}
            <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
              MASUKKAN TAUTAN DEEP LINK:
            </Text>
            <View style={{ flexDirection: 'row', gap: 8, marginBottom: 16 }}>
              <TextInput
                value={customUrl}
                onChangeText={setCustomUrl}
                placeholder="tresno://chat/anchor_dewi"
                placeholderTextColor={colors.textSecondary}
                style={[
                  styles.input,
                  {
                    backgroundColor: colors.surfaceCard,
                    borderColor: colors.border,
                    color: colors.text,
                  },
                ]}
                autoCapitalize="none"
                autoCorrect={false}
              />
              <TouchableOpacity
                onPress={() => handleExecute(customUrl)}
                style={[styles.goBtn, { backgroundColor: colors.primary }]}
                activeOpacity={0.8}
              >
                <Send size={15} color="#FFFFFF" />
              </TouchableOpacity>
            </View>

            {/* Presets Cepat */}
            <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
              PRESET RUTE DEEP LINK CEPAT:
            </Text>
            <View style={styles.presetGrid}>
              {sampleDeepLinks.map((item, idx) => (
                <TouchableOpacity
                  key={idx}
                  onPress={() => handleExecute(item.url)}
                  style={[styles.presetCard, { backgroundColor: colors.surfaceCard, borderColor: colors.border }]}
                  activeOpacity={0.7}
                >
                  <View style={{ marginRight: 6 }}>{item.icon}</View>
                  <Text style={[styles.presetText, { color: colors.text }]} numberOfLines={1}>
                    {item.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Uji Notifikasi Ber-Deep Link */}
            <Text style={[styles.sectionTitle, { color: colors.textSecondary, marginTop: 16 }]}>
              SIMULASI NOTIFIKASI DENGAN DEEP LINK:
            </Text>
            <View style={{ gap: 8 }}>
              <TouchableOpacity
                onPress={() =>
                  handleSimulateNotificationWithDeepLink(
                    'Pesan Baru dari Dewi Lestari',
                    'Halo ganteng! Mau ngobrol lagi yuk, mumpung aku lagi online nih ❤️',
                    'tresno://chat/anchor_dewi',
                    'chat_message',
                    'anchor_dewi'
                  )
                }
                style={[styles.notifSimBtn, { backgroundColor: 'rgba(255, 0, 94, 0.12)', borderColor: colors.primary }]}
                activeOpacity={0.7}
              >
                <Bell size={15} color={colors.primary} />
                <View style={{ flex: 1, marginLeft: 8 }}>
                  <Text style={{ fontSize: 11, fontWeight: '700', color: colors.text }}>
                    Notif Pesan Dewi (Deep Link ke Chat Room)
                  </Text>
                  <Text style={{ fontSize: 10, color: colors.textSecondary }}>
                    ActionUrl: tresno://chat/anchor_dewi
                  </Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() =>
                  handleSimulateNotificationWithDeepLink(
                    'Bonus 200 Koin Menunggumu!',
                    'Ambil bonus top-up QRIS pertama kamu sebelum promo berakhir hari ini.',
                    'tresno://topup',
                    'system_promo'
                  )
                }
                style={[styles.notifSimBtn, { backgroundColor: 'rgba(245, 158, 11, 0.12)', borderColor: colors.gold }]}
                activeOpacity={0.7}
              >
                <Coins size={15} color={colors.gold} />
                <View style={{ flex: 1, marginLeft: 8 }}>
                  <Text style={{ fontSize: 11, fontWeight: '700', color: colors.text }}>
                    Notif Promo Koin (Deep Link ke Topup)
                  </Text>
                  <Text style={{ fontSize: 10, color: colors.textSecondary }}>
                    ActionUrl: tresno://topup
                  </Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() =>
                  handleSimulateNotificationWithDeepLink(
                    'Misi Harian Siap Diklaim!',
                    'Selesaikan obrolan pertamamu dan dapatkan +1 Kupon Match Gratis!',
                    'tresno://missions',
                    'system_promo'
                  )
                }
                style={[styles.notifSimBtn, { backgroundColor: 'rgba(59, 130, 246, 0.12)', borderColor: '#3B82F6' }]}
                activeOpacity={0.7}
              >
                <Award size={15} color="#3B82F6" />
                <View style={{ flex: 1, marginLeft: 8 }}>
                  <Text style={{ fontSize: 11, fontWeight: '700', color: colors.text }}>
                    Notif Misi Harian (Deep Link ke Misi)
                  </Text>
                  <Text style={{ fontSize: 10, color: colors.textSecondary }}>
                    ActionUrl: tresno://missions
                  </Text>
                </View>
              </TouchableOpacity>
            </View>

            {/* Riwayat Eksekusi Deep Link */}
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 18, marginBottom: 8 }}>
              <Text style={[styles.sectionTitle, { color: colors.textSecondary, marginBottom: 0 }]}>
                RIWAYAT EKSEKUSI TERAKHIR:
              </Text>
              {history.length > 0 && (
                <TouchableOpacity onPress={clearHistory} style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                  <Trash2 size={12} color={colors.textSecondary} />
                  <Text style={{ fontSize: 10, color: colors.textSecondary }}>Hapus</Text>
                </TouchableOpacity>
              )}
            </View>

            {history.length === 0 ? (
              <View style={[styles.emptyHistory, { backgroundColor: colors.surfaceCard }]}>
                <Clock size={16} color={colors.textSecondary} />
                <Text style={{ fontSize: 11, color: colors.textSecondary, marginTop: 4 }}>
                  Belum ada riwayat deep link yang dieksekusi.
                </Text>
              </View>
            ) : (
              <View style={{ gap: 6 }}>
                {history.slice(0, 5).map((rec) => (
                  <View
                    key={rec.id}
                    style={[styles.historyRow, { backgroundColor: colors.surfaceCard, borderColor: colors.border }]}
                  >
                    {rec.success ? (
                      <CheckCircle2 size={13} color="#10B981" />
                    ) : (
                      <AlertCircle size={13} color="#FF3B30" />
                    )}
                    <View style={{ flex: 1, marginLeft: 6 }}>
                      <Text style={{ fontSize: 11, fontWeight: '700', color: colors.text }}>
                        {rec.url}
                      </Text>
                      <Text style={{ fontSize: 9, color: colors.textSecondary }}>
                        {rec.targetDescription} • Sumber: {rec.source}
                      </Text>
                    </View>
                  </View>
                ))}
              </View>
            )}
          </ScrollView>

          {/* Footer */}
          <TouchableOpacity
            style={[styles.doneBtn, { backgroundColor: colors.surfaceCard, borderColor: colors.border }]}
            onPress={closeTesterModal}
            activeOpacity={0.7}
          >
            <Text style={{ fontSize: 12, fontWeight: '700', color: colors.text }}>Tutup Simulator</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  modalCard: {
    width: '92%',
    maxWidth: 380,
    maxHeight: '90%',
    borderRadius: 24,
    borderWidth: 1,
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  iconCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 14,
    fontWeight: '800',
  },
  subtitle: {
    fontSize: 10,
  },
  closeBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollArea: {
    maxHeight: 460,
  },
  sectionTitle: {
    fontSize: 10,
    fontWeight: '800',
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  input: {
    flex: 1,
    height: 38,
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 10,
    fontSize: 11,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  goBtn: {
    width: 38,
    height: 38,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  presetGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  presetCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 7,
    paddingHorizontal: 9,
    borderRadius: 8,
    borderWidth: 1,
    maxWidth: '48%',
    flexGrow: 1,
  },
  presetText: {
    fontSize: 10,
    fontWeight: '700',
  },
  notifSimBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
  },
  emptyHistory: {
    padding: 14,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  historyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    borderRadius: 8,
    borderWidth: 1,
  },
  doneBtn: {
    marginTop: 12,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
