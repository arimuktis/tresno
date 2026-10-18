import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, TextInput } from 'react-native';
import {
  ShieldAlert,
  ShieldCheck,
  Check,
  X,
  Eye,
  EyeOff,
  AlertTriangle,
  UserX,
  FileText,
} from 'lucide-react-native';
import { useThemeStore } from '../../../../theme/useThemeStore';
import { useAdminCmsStore, CmsModerationItem } from '../../stores/useAdminCmsStore';

export const CmsModerationView: React.FC = () => {
  const { colors } = useThemeStore();
  const {
    moderationQueue,
    approveModerationItem,
    rejectModerationItem,
    blurModerationItem,
    toggleUserBan,
  } = useAdminCmsStore();

  const [activeTab, setActiveTab] = useState<'ALL' | 'PENDING' | 'FLAGGED'>('ALL');
  const [blurredMap, setBlurredMap] = useState<Record<string, boolean>>({});

  const toggleBlur = (id: string) => {
    setBlurredMap((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const filteredItems = moderationQueue.filter((item) => {
    if (activeTab === 'PENDING') return item.status === 'pending_review';
    if (activeTab === 'FLAGGED')
      return item.aiConfidenceScores.saraRisk > 50 || item.aiConfidenceScores.pornoRisk > 50;
    return true;
  });

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header Bar */}
      <View style={styles.sectionHeader}>
        <View style={styles.headerLeft}>
          <ShieldAlert size={20} color="#FF2E63" />
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Antrean Peninjauan Moderasi Konten (SARA & Pornografi)
          </Text>
        </View>

        <View style={styles.tabButtons}>
          {(['ALL', 'PENDING', 'FLAGGED'] as const).map((tab) => (
            <TouchableOpacity
              key={tab}
              style={[
                styles.tabBtn,
                activeTab === tab && { backgroundColor: '#FF2E63' },
              ]}
              onPress={() => setActiveTab(tab)}
            >
              <Text
                style={[
                  styles.tabBtnText,
                  { color: activeTab === tab ? '#FFF' : colors.textSecondary },
                ]}
              >
                {tab}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <Text style={[styles.sectionSubtitle, { color: colors.textSecondary }]}>
        Setiap postingan Story dan Foto Album wajib diperiksa terhadap pelanggaran SARA dan pornografi sesuai standar Master Rules Tresno.
      </Text>

      {/* Moderation Items Grid / List */}
      <View style={styles.queueGrid}>
        {filteredItems.map((item) => {
          const isBlurred = blurredMap[item.id] ?? (item.status === 'blurred' || item.aiConfidenceScores.pornoRisk > 60);

          return (
            <View
              key={item.id}
              style={[
                styles.itemCard,
                { backgroundColor: colors.surfaceCard, borderColor: colors.border },
              ]}
            >
              {/* Media Preview Box */}
              <View style={styles.mediaContainer}>
                <Image
                  source={{ uri: item.mediaUrl }}
                  style={[styles.mediaImg, isBlurred && styles.mediaBlurred]}
                  blurRadius={isBlurred ? 25 : 0}
                />
                <TouchableOpacity
                  style={styles.blurToggleBtn}
                  onPress={() => toggleBlur(item.id)}
                >
                  {isBlurred ? (
                    <Eye size={14} color="#FFF" />
                  ) : (
                    <EyeOff size={14} color="#FFF" />
                  )}
                  <Text style={styles.blurToggleText}>
                    {isBlurred ? 'Buka Sensor' : 'Sensor (Blur)'}
                  </Text>
                </TouchableOpacity>

                <View style={styles.typeBadge}>
                  <Text style={styles.typeBadgeText}>{item.type}</Text>
                </View>

                <View
                  style={[
                    styles.statusPill,
                    {
                      backgroundColor:
                        item.status === 'approved'
                          ? 'rgba(16,185,129,0.85)'
                          : item.status === 'rejected'
                          ? 'rgba(239,68,68,0.85)'
                          : 'rgba(245,158,11,0.85)',
                    },
                  ]}
                >
                  <Text style={styles.statusPillText}>{item.status.toUpperCase()}</Text>
                </View>
              </View>

              {/* Meta & AI Scores */}
              <View style={styles.metaContainer}>
                <View style={styles.authorRow}>
                  <Text style={[styles.authorName, { color: colors.text }]}>
                    {item.authorNickname}
                  </Text>
                  <Text style={[styles.authorId, { color: colors.textMuted }]}>
                    ID: {item.authorId}
                  </Text>
                </View>

                {item.caption && (
                  <View style={styles.captionBox}>
                    <FileText size={12} color={colors.textSecondary} />
                    <Text style={[styles.captionText, { color: colors.textSecondary }]}>
                      "{item.caption}"
                    </Text>
                  </View>
                )}

                {/* AI Confidence Gauges */}
                <View style={styles.aiScoresGrid}>
                  <View style={styles.scoreItem}>
                    <Text style={styles.scoreLabel}>Risiko SARA</Text>
                    <Text
                      style={[
                        styles.scoreVal,
                        {
                          color:
                            item.aiConfidenceScores.saraRisk > 50
                              ? '#EF4444'
                              : item.aiConfidenceScores.saraRisk > 20
                              ? '#F59E0B'
                              : '#10B981',
                        },
                      ]}
                    >
                      {item.aiConfidenceScores.saraRisk}%
                    </Text>
                  </View>

                  <View style={styles.scoreItem}>
                    <Text style={styles.scoreLabel}>Risiko Pornografi</Text>
                    <Text
                      style={[
                        styles.scoreVal,
                        {
                          color:
                            item.aiConfidenceScores.pornoRisk > 50
                              ? '#EF4444'
                              : item.aiConfidenceScores.pornoRisk > 20
                              ? '#F59E0B'
                              : '#10B981',
                        },
                      ]}
                    >
                      {item.aiConfidenceScores.pornoRisk}%
                    </Text>
                  </View>

                  <View style={styles.scoreItem}>
                    <Text style={styles.scoreLabel}>Skor Bersih</Text>
                    <Text style={[styles.scoreVal, { color: '#00D19D' }]}>
                      {item.aiConfidenceScores.cleanliness}%
                    </Text>
                  </View>
                </View>

                {item.rejectionReason && (
                  <View style={styles.rejectionNotice}>
                    <AlertTriangle size={12} color="#EF4444" />
                    <Text style={styles.rejectionText}>
                      Alasan Tolak: {item.rejectionReason}
                    </Text>
                  </View>
                )}

                {/* Moderation Actions Bar */}
                <View style={styles.actionButtonsRow}>
                  <TouchableOpacity
                    style={[styles.actionBtn, { backgroundColor: '#10B981' }]}
                    onPress={() => approveModerationItem(item.id)}
                  >
                    <Check size={14} color="#FFF" />
                    <Text style={styles.actionBtnText}>Setujui</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.actionBtn, { backgroundColor: '#EF4444' }]}
                    onPress={() =>
                      rejectModerationItem(
                        item.id,
                        item.aiConfidenceScores.pornoRisk > 50
                          ? 'Terdeteksi konten pornografi/ketelanjangan vulgar'
                          : 'Melanggar pedoman komunitas SARA'
                      )
                    }
                  >
                    <X size={14} color="#FFF" />
                    <Text style={styles.actionBtnText}>Tolak</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.actionBtn, { backgroundColor: 'rgba(255,255,255,0.08)' }]}
                    onPress={() => blurModerationItem(item.id)}
                  >
                    <EyeOff size={14} color="#FFF" />
                    <Text style={[styles.actionBtnText, { color: '#FFF' }]}>Buramkan</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.actionBtn, { backgroundColor: 'rgba(239,68,68,0.2)' }]}
                    onPress={() => toggleUserBan(item.authorId, 'Penyebaran konten terlarang')}
                  >
                    <UserX size={14} color="#EF4444" />
                    <Text style={[styles.actionBtnText, { color: '#EF4444' }]}>Ban User</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          );
        })}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  sectionSubtitle: {
    fontSize: 12,
    marginBottom: 16,
  },
  tabButtons: {
    flexDirection: 'row',
    gap: 6,
  },
  tabBtn: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  tabBtnText: {
    fontSize: 11,
    fontWeight: '700',
  },
  queueGrid: {
    gap: 14,
  },
  itemCard: {
    flexDirection: 'row',
    borderRadius: 12,
    borderWidth: 1,
    padding: 12,
    gap: 14,
  },
  mediaContainer: {
    width: 140,
    height: 180,
    borderRadius: 8,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#1E1E2E',
  },
  mediaImg: {
    width: '100%',
    height: '100%',
  },
  mediaBlurred: {
    opacity: 0.6,
  },
  blurToggleBtn: {
    position: 'absolute',
    bottom: 6,
    left: 6,
    right: 6,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingVertical: 4,
    borderRadius: 4,
  },
  blurToggleText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: '600',
  },
  typeBadge: {
    position: 'absolute',
    top: 6,
    left: 6,
    backgroundColor: '#FF2E63',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  typeBadgeText: {
    color: '#FFF',
    fontSize: 9,
    fontWeight: '800',
  },
  statusPill: {
    position: 'absolute',
    top: 6,
    right: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  statusPillText: {
    color: '#FFF',
    fontSize: 8,
    fontWeight: '800',
  },
  metaContainer: {
    flex: 1,
    justifyContent: 'space-between',
  },
  authorRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  authorName: {
    fontSize: 14,
    fontWeight: '700',
  },
  authorId: {
    fontSize: 11,
  },
  captionBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 6,
    padding: 8,
    borderRadius: 6,
    backgroundColor: 'rgba(255,255,255,0.03)',
  },
  captionText: {
    fontSize: 11,
    fontStyle: 'italic',
    flex: 1,
  },
  aiScoresGrid: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 10,
    padding: 8,
    borderRadius: 6,
    backgroundColor: 'rgba(255,255,255,0.02)',
  },
  scoreItem: {
    flex: 1,
  },
  scoreLabel: {
    fontSize: 9,
    color: '#9CA3AF',
    textTransform: 'uppercase',
    fontWeight: '600',
  },
  scoreVal: {
    fontSize: 16,
    fontWeight: '800',
    marginTop: 2,
  },
  rejectionNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 8,
    backgroundColor: 'rgba(239,68,68,0.1)',
    padding: 6,
    borderRadius: 6,
  },
  rejectionText: {
    color: '#EF4444',
    fontSize: 11,
    fontWeight: '600',
  },
  actionButtonsRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
  },
  actionBtnText: {
    color: '#FFF',
    fontSize: 11,
    fontWeight: '700',
  },
});
