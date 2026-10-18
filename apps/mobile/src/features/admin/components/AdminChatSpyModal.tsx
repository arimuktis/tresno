import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Platform,
  Alert,
} from 'react-native';
import {
  Eye,
  ShieldAlert,
  Send,
  Lock,
  Unlock,
  AlertTriangle,
  X,
  MessageSquare,
  Gift,
  Clock,
  CheckCircle2,
} from 'lucide-react-native';
import { useSurveillanceStore } from '../stores/useSurveillanceStore';
import { toast } from '../../../shared/stores/useToastStore';

export const AdminChatSpyModal: React.FC = () => {
  const {
    selectedChatroom,
    closeChatInspection,
    injectChatWarning,
    toggleFreezeChatroom,
  } = useSurveillanceStore();

  const [customWarning, setCustomWarning] = useState('');
  const [isSending, setIsSending] = useState(false);

  if (!selectedChatroom) return null;

  const { summary, messages } = selectedChatroom;

  const handleSendWarning = async (textToSend?: string) => {
    const text = textToSend || customWarning;
    if (!text.trim()) {
      toast.error('Masukkan teks peringatan terlebih dahulu.');
      return;
    }

    setIsSending(true);
    const success = await injectChatWarning(summary.chatId, text);
    setIsSending(false);
    if (success) {
      setCustomWarning('');
    }
  };

  const handleToggleFreeze = () => {
    toggleFreezeChatroom(summary.chatId, !summary.isFrozen);
  };

  return (
    <Modal visible={true} transparent animationType="fade" onRequestClose={closeChatInspection}>
      <View style={styles.backdrop}>
        <View style={styles.modalCard}>
          {/* Header */}
          <View style={styles.header}>
            <View style={{ flex: 1 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <View style={styles.wiretapBadge}>
                  <Eye size={12} color="#3B82F6" />
                  <Text style={styles.wiretapBadgeText}>PENYADAPAN CHATROOM</Text>
                </View>
                <Text style={styles.chatIdText}>Room: {summary.chatId}</Text>
              </View>

              <Text style={styles.participantsTitle}>
                {summary.participants.map((p) => p.nickname).join(' ⇄ ')}
              </Text>
            </View>

            <TouchableOpacity
              onPress={closeChatInspection}
              style={styles.closeBtn}
              activeOpacity={0.8}
            >
              <X size={20} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

          {/* Risk Intelligence Banner */}
          <View style={styles.riskBanner}>
            <View style={{ flex: 1 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <ShieldAlert
                  size={15}
                  color={summary.riskScore > 50 ? '#EF4444' : summary.riskScore > 20 ? '#FBBF24' : '#10B981'}
                />
                <Text style={styles.riskScoreText}>
                  Skor Risiko Fraud: <Text style={{ fontWeight: '900' }}>{summary.riskScore}/100</Text>
                </Text>
                {summary.isFrozen && (
                  <View style={styles.frozenBadge}>
                    <Lock size={10} color="#FFFFFF" />
                    <Text style={styles.frozenBadgeText}>DIBEKUKAN</Text>
                  </View>
                )}
              </View>
              {summary.riskReason && (
                <Text style={styles.riskReasonText}>{summary.riskReason}</Text>
              )}
            </View>

            <TouchableOpacity
              style={[
                styles.freezeBtn,
                summary.isFrozen ? styles.unfreezeBtn : styles.freezeBtnActive,
              ]}
              onPress={handleToggleFreeze}
            >
              {summary.isFrozen ? (
                <>
                  <Unlock size={13} color="#FFFFFF" />
                  <Text style={styles.freezeBtnText}>Buka Beku</Text>
                </>
              ) : (
                <>
                  <Lock size={13} color="#FFFFFF" />
                  <Text style={styles.freezeBtnText}>Bekukan Chat</Text>
                </>
              )}
            </TouchableOpacity>
          </View>

          {/* Chat Messages Transcript */}
          <ScrollView
            style={styles.messagesScroll}
            contentContainerStyle={styles.messagesContent}
            showsVerticalScrollIndicator={true}
          >
            {messages.length === 0 ? (
              <View style={styles.emptyBox}>
                <MessageSquare size={32} color="#64748B" />
                <Text style={styles.emptyText}>Belum ada riwayat pesan di chatroom ini.</Text>
              </View>
            ) : (
              messages.map((msg) => {
                if (msg.isSystemWarning) {
                  return (
                    <View key={msg.id} style={styles.systemWarningBubble}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                        <ShieldAlert size={15} color="#FBBF24" />
                        <Text style={styles.systemWarningTitle}>{msg.senderName}</Text>
                        <Text style={styles.systemWarningTime}>{msg.timestamp}</Text>
                      </View>
                      <Text style={styles.systemWarningBody}>{msg.text}</Text>
                    </View>
                  );
                }

                const isFlagged = msg.isFlagged;

                return (
                  <View
                    key={msg.id}
                    style={[
                      styles.msgBubble,
                      isFlagged && styles.msgBubbleFlagged,
                    ]}
                  >
                    <View style={styles.msgHeader}>
                      <Text style={[styles.senderName, isFlagged && { color: '#F87171' }]}>
                        {msg.senderName} ({msg.senderId})
                      </Text>
                      <Text style={styles.msgTime}>{msg.timestamp}</Text>
                    </View>

                    {isFlagged && (
                      <View style={styles.flaggedAlertPill}>
                        <AlertTriangle size={11} color="#EF4444" />
                        <Text style={styles.flaggedAlertText}>Terdeteksi kata mencurigakan</Text>
                      </View>
                    )}

                    <Text style={styles.msgText}>{msg.text}</Text>

                    {msg.gift && (
                      <View style={styles.giftBadge}>
                        <Gift size={13} color="#F59E0B" />
                        <Text style={styles.giftBadgeText}>
                          Hadiah: {msg.gift.name} ({msg.gift.coins} Koin)
                        </Text>
                      </View>
                    )}
                  </View>
                );
              })
            )}
          </ScrollView>

          {/* Quick Warning Templates Bar */}
          <View style={styles.templatesBar}>
            <Text style={styles.templatesTitle}>TEMPLAT PERINGATAN RESMI:</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 6 }}>
              {[
                '⚠️ Peringatan Resmi: Dilarang meminta transfer/rekening di luar aplikasi!',
                '⚠️ Peringatan Resmi: Transaksi di luar sistem Tresno berisiko penipuan.',
                '⚠️ Peringatan Tim Keamanan: Chatroom ini sedang dalam pengawasan aktif.',
              ].map((template, idx) => (
                <TouchableOpacity
                  key={idx}
                  style={styles.templatePill}
                  onPress={() => handleSendWarning(template)}
                >
                  <Text style={styles.templatePillText} numberOfLines={1}>
                    {template}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Custom Warning Input Bar */}
          <View style={styles.inputBar}>
            <TextInput
              style={styles.inputField}
              placeholder="Ketik peringatan admin custom untuk disuntikkan ke chat..."
              placeholderTextColor="#64748B"
              value={customWarning}
              onChangeText={setCustomWarning}
            />
            <TouchableOpacity
              style={[
                styles.sendBtn,
                (!customWarning.trim() || isSending) && styles.sendBtnDisabled,
              ]}
              onPress={() => handleSendWarning()}
              disabled={!customWarning.trim() || isSending}
            >
              <Send size={16} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 12,
    zIndex: 9999,
  },
  modalCard: {
    width: '94%',
    maxWidth: 390,
    height: '92%',
    backgroundColor: '#0F172A',
    borderRadius: 24,
    borderWidth: 1.5,
    borderColor: '#334155',
    overflow: 'hidden',
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
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
  wiretapBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(59, 130, 246, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.3)',
  },
  wiretapBadgeText: {
    fontSize: 10,
    fontWeight: '900',
    color: '#3B82F6',
  },
  chatIdText: {
    fontSize: 11,
    color: '#94A3B8',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  participantsTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
    marginTop: 4,
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  riskBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#090D16',
    borderBottomWidth: 1,
    borderBottomColor: '#1E293B',
  },
  riskScoreText: {
    fontSize: 12,
    color: '#E2E8F0',
  },
  riskReasonText: {
    fontSize: 11,
    color: '#F87171',
    marginTop: 2,
    fontWeight: '500',
  },
  frozenBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#DC2626',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginLeft: 6,
  },
  frozenBadgeText: {
    fontSize: 9,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  freezeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
  },
  freezeBtnActive: {
    backgroundColor: '#DC2626',
  },
  unfreezeBtn: {
    backgroundColor: '#059669',
  },
  freezeBtnText: {
    fontSize: 11.5,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  messagesScroll: {
    flex: 1,
  },
  messagesContent: {
    padding: 16,
    gap: 12,
  },
  emptyBox: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 10,
  },
  msgBubble: {
    backgroundColor: '#1E293B',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: '#334155',
  },
  msgBubbleFlagged: {
    borderColor: '#EF4444',
    backgroundColor: 'rgba(239, 68, 68, 0.08)',
  },
  msgHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  senderName: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#60A5FA',
  },
  msgTime: {
    fontSize: 10,
    color: '#64748B',
  },
  msgText: {
    fontSize: 13,
    color: '#F1F5F9',
    lineHeight: 18,
  },
  flaggedAlertPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginBottom: 6,
    alignSelf: 'flex-start',
  },
  flaggedAlertText: {
    fontSize: 9.5,
    fontWeight: '700',
    color: '#EF4444',
  },
  giftBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginTop: 8,
    alignSelf: 'flex-start',
  },
  giftBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#F59E0B',
  },
  systemWarningBubble: {
    backgroundColor: 'rgba(245, 158, 11, 0.12)',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1.5,
    borderColor: '#F59E0B',
  },
  systemWarningTitle: {
    fontSize: 11.5,
    fontWeight: '800',
    color: '#F59E0B',
    flex: 1,
  },
  systemWarningTime: {
    fontSize: 10,
    color: '#94A3B8',
  },
  systemWarningBody: {
    fontSize: 12.5,
    fontWeight: '600',
    color: '#FEF3C7',
    lineHeight: 17,
  },
  templatesBar: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#0B1120',
    borderTopWidth: 1,
    borderTopColor: '#1E293B',
  },
  templatesTitle: {
    fontSize: 9.5,
    fontWeight: '800',
    color: '#64748B',
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  templatePill: {
    backgroundColor: '#1E293B',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#334155',
    maxWidth: 240,
  },
  templatePillText: {
    fontSize: 11,
    color: '#E2E8F0',
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 12,
    backgroundColor: '#1E293B',
    borderTopWidth: 1,
    borderTopColor: '#334155',
  },
  inputField: {
    flex: 1,
    height: 42,
    backgroundColor: '#0F172A',
    borderRadius: 12,
    paddingHorizontal: 14,
    color: '#FFFFFF',
    fontSize: 12.5,
    borderWidth: 1,
    borderColor: '#334155',
  },
  sendBtn: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: '#2563EB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendBtnDisabled: {
    backgroundColor: '#334155',
    opacity: 0.5,
  },
});
