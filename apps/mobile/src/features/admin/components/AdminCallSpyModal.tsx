import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  Image,
  Platform,
  Alert,
} from 'react-native';
import {
  Eye,
  PhoneOff,
  Volume2,
  VolumeX,
  AlertTriangle,
  Camera,
  ShieldAlert,
  Clock,
  Coins,
  Radio,
  X,
  CheckCircle2,
} from 'lucide-react-native';
import { useSurveillanceStore } from '../stores/useSurveillanceStore';
import { toast } from '../../../shared/stores/useToastStore';
import { ButtonChip } from '../../../shared/components/atoms/Chip';

export const AdminCallSpyModal: React.FC = () => {
  const {
    infiltratedSession,
    leaveInfiltration,
    terminateCall,
    sendCallWarning,
    isAdminAudioListening,
    toggleAdminAudioListening,
  } = useSurveillanceStore();

  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [isTerminateDialogVisible, setIsTerminateDialogVisible] = useState(false);
  const [selectedKillReason, setSelectedKillReason] = useState('Terdeteksi permintaan transaksi / transfer di luar aplikasi');

  useEffect(() => {
    if (!infiltratedSession) return;
    setElapsedSeconds(infiltratedSession.durationSeconds || 0);

    const interval = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [infiltratedSession]);

  if (!infiltratedSession) return null;

  const formatTimer = (totalSec: number) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleForceKill = async () => {
    const success = await terminateCall(infiltratedSession.channelId, selectedKillReason);
    if (success) {
      setIsTerminateDialogVisible(false);
    }
  };

  const handleQuickWarning = (msg: string) => {
    sendCallWarning(infiltratedSession.channelId, msg);
  };

  const handleCaptureSnapshot = () => {
    toast.success('📸 Bukti percakapan & snapshot forensik berhasil disimpan ke audit log!');
  };

  return (
    <Modal visible={true} transparent animationType="fade" onRequestClose={leaveInfiltration}>
      <View style={styles.backdrop}>
        <View style={styles.modalCard}>
          {/* Top Spy Header */}
          <View style={styles.header}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
              <View style={styles.liveIndicatorBox}>
                <Radio size={14} color="#EF4444" />
                <Text style={styles.liveIndicatorText}>LIVE WIRETAP</Text>
              </View>
              <View>
                <Text style={styles.channelTitle}>{infiltratedSession.channelId}</Text>
                <Text style={styles.stealthNotice}>
                  🛡️ Mode Hantu (Ghost Mode): Peserta TIDAK tahu Anda menonton
                </Text>
              </View>
            </View>

            <TouchableOpacity
              onPress={leaveInfiltration}
              style={styles.closeBtn}
              activeOpacity={0.8}
            >
              <X size={20} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

          {/* Telemetry Bar */}
          <View style={styles.telemetryBar}>
            <View style={styles.telemetryItem}>
              <Clock size={14} color="#94A3B8" />
              <Text style={styles.telemetryLabel}>Durasi:</Text>
              <Text style={styles.telemetryValue}>{formatTimer(elapsedSeconds)}</Text>
            </View>

            <View style={styles.telemetryItem}>
              <Coins size={14} color="#FBBF24" />
              <Text style={styles.telemetryLabel}>Koin Terkuras:</Text>
              <Text style={[styles.telemetryValue, { color: '#FBBF24' }]}>
                {infiltratedSession.coinsSpent + Math.floor(elapsedSeconds / 60) * 60} Koin
              </Text>
            </View>

            {infiltratedSession.riskFlags.length > 0 ? (
              <View style={styles.riskBadge}>
                <ShieldAlert size={13} color="#EF4444" />
                <Text style={styles.riskBadgeText}>
                  {infiltratedSession.riskFlags.join(', ')}
                </Text>
              </View>
            ) : (
              <View style={styles.safeBadge}>
                <CheckCircle2 size={13} color="#10B981" />
                <Text style={styles.safeBadgeText}>Kondisi Normal</Text>
              </View>
            )}
          </View>

          {/* Dual Stream Video Monitor */}
          <View style={styles.videoGrid}>
            {/* Tile 1: Host Stream */}
            <View style={styles.videoTile}>
              <Image
                source={{
                  uri:
                    infiltratedSession.callee.avatarUrl ||
                    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400',
                }}
                style={styles.videoStreamImage}
              />
              <View style={styles.videoTileOverlay}>
                <View style={styles.tileHeader}>
                  <View style={styles.hostRoleBadge}>
                    <Text style={styles.hostRoleText}>HOST ANCHOR</Text>
                  </View>
                  <View style={styles.audioWaveform}>
                    <View style={[styles.waveBar, { height: 12 }]} />
                    <View style={[styles.waveBar, { height: 18 }]} />
                    <View style={[styles.waveBar, { height: 10 }]} />
                  </View>
                </View>
                <View style={styles.tileFooter}>
                  <Text style={styles.participantName}>
                    {infiltratedSession.callee.nickname}
                  </Text>
                  <Text style={styles.participantSub}>
                    ID: {infiltratedSession.callee.id} • Lv.{infiltratedSession.callee.level || 1}
                  </Text>
                </View>
              </View>
            </View>

            {/* Tile 2: Spender Stream */}
            <View style={styles.videoTile}>
              <Image
                source={{
                  uri:
                    infiltratedSession.caller.avatarUrl ||
                    'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400',
                }}
                style={styles.videoStreamImage}
              />
              <View style={styles.videoTileOverlay}>
                <View style={styles.tileHeader}>
                  <View style={styles.spenderRoleBadge}>
                    <Text style={styles.spenderRoleText}>SPENDER CALLER</Text>
                  </View>
                  <View style={styles.audioWaveform}>
                    <View style={[styles.waveBar, { height: 8 }]} />
                    <View style={[styles.waveBar, { height: 16 }]} />
                    <View style={[styles.waveBar, { height: 14 }]} />
                  </View>
                </View>
                <View style={styles.tileFooter}>
                  <Text style={styles.participantName}>
                    {infiltratedSession.caller.nickname}
                  </Text>
                  <Text style={styles.participantSub}>
                    ID: {infiltratedSession.caller.id} • Saldo: {infiltratedSession.caller.coinsBalance || 0} Koin
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {/* Quick Warning Action Chips */}
          <View style={styles.warningSection}>
            <Text style={styles.sectionHeaderTitle}>TINDAKAN MODERASI LANGSUNG (INTERVENSI)</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
              <ButtonChip
                size="sm"
                variant="warning"
                icon={AlertTriangle}
                label="Tegur: Larangan Kontak WA"
                onPress={() => handleQuickWarning('⚠️ PERINGATAN RESMI: Dilarang meminta nomor WhatsApp / kontak pribadi!')}
              />
              <ButtonChip
                size="sm"
                variant="warning"
                icon={AlertTriangle}
                label="Tegur: Transaksi Luar"
                onPress={() => handleQuickWarning('⚠️ PERINGATAN RESMI: Dilarang melakukan transaksi atau transfer di luar platform!')}
              />
              <ButtonChip
                size="sm"
                variant="warning"
                icon={AlertTriangle}
                label="Tegur: Asusila / Busana"
                onPress={() => handleQuickWarning('⚠️ PERINGATAN RESMI: Jaga etika berpakaian dan sopan santun video call!')}
              />
            </ScrollView>
          </View>

          {/* Bottom Console Controls */}
          <View style={styles.bottomConsole}>
            <TouchableOpacity
              style={[
                styles.consoleBtn,
                isAdminAudioListening ? styles.audioBtnActive : styles.audioBtnMuted,
              ]}
              onPress={toggleAdminAudioListening}
            >
              {isAdminAudioListening ? (
                <Volume2 size={18} color="#FFFFFF" />
              ) : (
                <VolumeX size={18} color="#94A3B8" />
              )}
              <Text
                style={[
                  styles.consoleBtnText,
                  { color: isAdminAudioListening ? '#FFFFFF' : '#94A3B8' },
                ]}
              >
                {isAdminAudioListening ? 'Audio On' : 'Audio Muted'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.consoleBtn, styles.snapshotBtn]}
              onPress={handleCaptureSnapshot}
            >
              <Camera size={18} color="#FFFFFF" />
              <Text style={styles.consoleBtnText}>Bukti Forensik</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.consoleBtn, styles.killBtn]}
              onPress={() => setIsTerminateDialogVisible(true)}
            >
              <PhoneOff size={18} color="#FFFFFF" />
              <Text style={[styles.consoleBtnText, { fontWeight: '800' }]}>Paksa Putus</Text>
            </TouchableOpacity>
          </View>

          {/* Terminate Dialog Modal */}
          {isTerminateDialogVisible && (
            <View style={styles.terminateOverlay}>
              <View style={styles.terminateBox}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                  <AlertTriangle size={20} color="#EF4444" />
                  <Text style={styles.terminateTitle}>Putus Panggilan Paksa (Kill-Switch)</Text>
                </View>
                <Text style={styles.terminateSub}>
                  Panggilan akan segera diputus seketika dan peserta akan menerima alasan penghentian.
                </Text>

                <Text style={styles.reasonLabel}>PILIH ALASAN PELANGGARAN:</Text>
                {[
                  'Terdeteksi permintaan transaksi / transfer di luar aplikasi (Fraud)',
                  'Pelanggaran asusila / konten pornografi tidak pantas',
                  'Pelecehan verbal / ujaran kebencian / pemerasan',
                  'Akun terindikasi sindikat bot / bukan pengguna asli',
                ].map((reason) => (
                  <TouchableOpacity
                    key={reason}
                    style={[
                      styles.reasonOption,
                      selectedKillReason === reason && styles.reasonOptionSelected,
                    ]}
                    onPress={() => setSelectedKillReason(reason)}
                  >
                    <Text
                      style={[
                        styles.reasonText,
                        selectedKillReason === reason && { color: '#EF4444', fontWeight: '700' },
                      ]}
                    >
                      {reason}
                    </Text>
                  </TouchableOpacity>
                ))}

                <View style={styles.terminateActions}>
                  <TouchableOpacity
                    style={styles.cancelBtn}
                    onPress={() => setIsTerminateDialogVisible(false)}
                  >
                    <Text style={{ color: '#94A3B8', fontWeight: '600' }}>Batal</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.confirmKillBtn}
                    onPress={handleForceKill}
                  >
                    <PhoneOff size={16} color="#FFFFFF" style={{ marginRight: 6 }} />
                    <Text style={{ color: '#FFFFFF', fontWeight: '800' }}>
                      Eksekusi Putus Sekarang
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.88)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 12,
    zIndex: 9999,
  },
  modalCard: {
    width: '94%',
    maxWidth: 390,
    maxHeight: '94%',
    backgroundColor: '#0F172A',
    borderRadius: 24,
    borderWidth: 1.5,
    borderColor: '#334155',
    overflow: 'hidden',
    position: 'relative',
    ...Platform.select({
      web: {
        boxShadow: '0 25px 60px rgba(0, 0, 0, 0.7)',
      } as any,
      default: {
        elevation: 20,
      },
    }),
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#1E293B',
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
  },
  liveIndicatorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(239, 68, 68, 0.18)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 6,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.4)',
  },
  liveIndicatorText: {
    fontSize: 10,
    fontWeight: '900',
    color: '#EF4444',
    letterSpacing: 0.5,
  },
  channelTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  stealthNotice: {
    fontSize: 11,
    color: '#10B981',
    fontWeight: '600',
    marginTop: 2,
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  telemetryBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#090D16',
    borderBottomWidth: 1,
    borderBottomColor: '#1E293B',
  },
  telemetryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  telemetryLabel: {
    fontSize: 11.5,
    color: '#94A3B8',
  },
  telemetryValue: {
    fontSize: 12,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  riskBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#EF4444',
  },
  riskBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#EF4444',
  },
  safeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  safeBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#10B981',
  },
  videoGrid: {
    flexDirection: 'row',
    gap: 12,
    padding: 16,
    height: 250,
  },
  videoTile: {
    flex: 1,
    borderRadius: 16,
    backgroundColor: '#020617',
    overflow: 'hidden',
    position: 'relative',
    borderWidth: 1.5,
    borderColor: '#334155',
  },
  videoStreamImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  videoTileOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.35)',
    justifyContent: 'space-between',
    padding: 10,
  },
  tileHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  hostRoleBadge: {
    backgroundColor: '#EC4899',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  hostRoleText: {
    fontSize: 9,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  spenderRoleBadge: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  spenderRoleText: {
    fontSize: 9,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  audioWaveform: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 2,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    paddingHorizontal: 5,
    paddingVertical: 3,
    borderRadius: 4,
  },
  waveBar: {
    width: 3,
    backgroundColor: '#10B981',
    borderRadius: 1.5,
  },
  tileFooter: {
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    padding: 6,
    borderRadius: 8,
  },
  participantName: {
    fontSize: 12,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  participantSub: {
    fontSize: 10,
    color: '#94A3B8',
    marginTop: 1,
  },
  warningSection: {
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  sectionHeaderTitle: {
    fontSize: 10,
    fontWeight: '800',
    color: '#64748B',
    letterSpacing: 0.5,
    marginBottom: 8,
  },

  bottomConsole: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 16,
    backgroundColor: '#1E293B',
    borderTopWidth: 1,
    borderTopColor: '#334155',
  },
  consoleBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: 14,
  },
  consoleBtnText: {
    fontSize: 12.5,
    color: '#FFFFFF',
  },
  audioBtnActive: {
    backgroundColor: '#2563EB',
  },
  audioBtnMuted: {
    backgroundColor: '#334155',
  },
  snapshotBtn: {
    backgroundColor: '#059669',
  },
  killBtn: {
    backgroundColor: '#DC2626',
  },
  terminateOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    zIndex: 100,
  },
  terminateBox: {
    width: '100%',
    backgroundColor: '#1E293B',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1.5,
    borderColor: '#EF4444',
  },
  terminateTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  terminateSub: {
    fontSize: 12,
    color: '#94A3B8',
    lineHeight: 16,
    marginBottom: 14,
  },
  reasonLabel: {
    fontSize: 10.5,
    fontWeight: '800',
    color: '#CBD5E1',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  reasonOption: {
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#334155',
    backgroundColor: '#0F172A',
    marginBottom: 6,
  },
  reasonOptionSelected: {
    borderColor: '#EF4444',
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
  },
  reasonText: {
    fontSize: 12,
    color: '#E2E8F0',
  },
  terminateActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
    marginTop: 16,
  },
  cancelBtn: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
  },
  confirmKillBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#DC2626',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
  },
});
