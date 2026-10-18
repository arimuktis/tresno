import React, { useState } from 'react';
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
  ShieldCheck,
  ShieldAlert,
  AlertOctagon,
  Sparkles,
  Info,
  CheckCircle,
  AlertTriangle,
} from 'lucide-react-native';
import { useThemeStore } from '../../../theme/useThemeStore';
import { useAlbumStore } from '../stores/useAlbumStore';
import { moderationService } from '../../../shared/services/moderationService';
import { ModerationResult } from '@tresno/shared';

export const ContentModerationPolicyModal: React.FC = () => {
  const { colors, isDark } = useThemeStore();
  const { isPolicyModalOpen, closePolicyModal } = useAlbumStore();

  const [testInput, setTestInput] = useState('');
  const [testResult, setTestResult] = useState<ModerationResult | null>(null);

  if (!isPolicyModalOpen) return null;

  const handleRunScan = () => {
    if (!testInput.trim()) return;
    const result = moderationService.inspectText(testInput);
    setTestResult(result);
  };

  const handleUsePreset = (text: string) => {
    setTestInput(text);
    const result = moderationService.inspectText(text);
    setTestResult(result);
  };

  return (
    <Modal
      visible={isPolicyModalOpen}
      animationType="slide"
      transparent
      onRequestClose={closePolicyModal}
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
                <ShieldCheck size={20} color={colors.primary} />
                <Text style={[styles.title, { color: colors.text }]}>
                  Kebijakan Moderasi Konten
                </Text>
              </View>
              <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
                Standar Keamanan Anti-SARA &amp; Anti-Pornografi Platform Tresno
              </Text>
            </View>

            <TouchableOpacity
              onPress={closePolicyModal}
              style={[styles.closeBtn, { backgroundColor: colors.surfaceGlass }]}
              activeOpacity={0.7}
            >
              <X size={18} color={colors.text} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.body} showsVerticalScrollIndicator={false}>
            {/* SARA POLICY CARD */}
            <View
              style={[
                styles.policyCard,
                {
                  backgroundColor: isDark ? 'rgba(255, 45, 85, 0.06)' : '#FFF0F2',
                  borderColor: 'rgba(255, 45, 85, 0.3)',
                },
              ]}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <ShieldAlert size={18} color="#FF2D55" />
                <Text style={[styles.cardTitle, { color: '#FF2D55' }]}>
                  1. Deteksi &amp; Larangan SARA
                </Text>
              </View>
              <Text style={[styles.cardText, { color: colors.text }]}>
                Tresno melarang keras segala bentuk ujaran kebencian, pelecehan, diskriminasi,
                atau penghinaan terhadap Suku, Agama, Ras, dan Antargolongan (SARA).
              </Text>
              <View style={styles.bulletList}>
                <Text style={[styles.bulletItem, { color: colors.textSecondary }]}>
                  • Hinaan bernada rasisme atau etnis daerah (Chindo, Papua, Jawa, dsb).
                </Text>
                <Text style={[styles.bulletItem, { color: colors.textSecondary }]}>
                  • Penistaan agama, kitab suci, pelecehan tempat ibadah, atau hasutan sektarian.
                </Text>
                <Text style={[styles.bulletItem, { color: colors.textSecondary }]}>
                  • Provokasi kekerasan atau pemusnahan antargolongan.
                </Text>
              </View>
            </View>

            {/* PORNOGRAPHY POLICY CARD */}
            <View
              style={[
                styles.policyCard,
                {
                  backgroundColor: isDark ? 'rgba(255, 184, 0, 0.06)' : '#FFFBEA',
                  borderColor: 'rgba(255, 184, 0, 0.35)',
                },
              ]}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <AlertOctagon size={18} color="#FFB800" />
                <Text style={[styles.cardTitle, { color: colors.gold }]}>
                  2. Deteksi &amp; Larangan Pornografi &amp; NSFW
                </Text>
              </View>
              <Text style={[styles.cardText, { color: colors.text }]}>
                Segala bentuk konten vulgar, ketelanjangan, dan transaksi asusila komersial dilarang
                tanpa kompromi untuk menjaga ekosistem yang sehat dan aman.
              </Text>
              <View style={styles.bulletList}>
                <Text style={[styles.bulletItem, { color: colors.textSecondary }]}>
                  • Foto/video ketelanjangan (nudity), genital, payudara terbuka, atau pose seksual vulgar.
                </Text>
                <Text style={[styles.bulletItem, { color: colors.textSecondary }]}>
                  • Istilah anatomi genital kasar (kontol, memek, toket, pussy, dick, dsb).
                </Text>
                <Text style={[styles.bulletItem, { color: colors.textSecondary }]}>
                  • Praktik prostitusi, Open BO, VCS vulgar berbayar, dan penyebaran link porno.
                </Text>
              </View>
            </View>

            {/* INTERACTIVE SCANNER TESTER */}
            <View style={[styles.scannerSection, { borderColor: colors.border }]}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                <Sparkles size={16} color={colors.primary} />
                <Text style={[styles.scannerTitle, { color: colors.text }]}>
                  Simulator Deteksi AI Moderasi
                </Text>
              </View>
              <Text style={[styles.scannerSub, { color: colors.textSecondary }]}>
                Ketik teks di bawah untuk menguji respons sistem deteksi SARA &amp; Pornografi:
              </Text>

              <TextInput
                value={testInput}
                onChangeText={setTestInput}
                placeholder="Contoh: ketik caption atau kalimat untuk diuji..."
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

              {/* Sample Quick Chips */}
              <View style={styles.presetsRow}>
                <TouchableOpacity
                  onPress={() => handleUsePreset('Halo semuanya, selamat malam! Jangan lupa bersyukur.')}
                  style={[styles.presetChip, { borderColor: '#00D26A' }]}
                >
                  <Text style={{ color: '#00D26A', fontSize: 11, fontWeight: '700' }}>Uji Aman</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => handleUsePreset('Ganyang cina babi bakar tempat ibadah')}
                  style={[styles.presetChip, { borderColor: '#FF2D55' }]}
                >
                  <Text style={{ color: '#FF2D55', fontSize: 11, fontWeight: '700' }}>Uji SARA</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => handleUsePreset('Open bo vcs sange toket bugil')}
                  style={[styles.presetChip, { borderColor: '#FF2D55' }]}
                >
                  <Text style={{ color: '#FF2D55', fontSize: 11, fontWeight: '700' }}>Uji Pornografi</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => handleUsePreset('Lagi santai photoshoot gaya sexy')}
                  style={[styles.presetChip, { borderColor: '#FFB800' }]}
                >
                  <Text style={{ color: '#FFB800', fontSize: 11, fontWeight: '700' }}>Uji Pending</Text>
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                onPress={handleRunScan}
                style={[styles.scanBtn, { backgroundColor: colors.primary }]}
                activeOpacity={0.8}
              >
                <Text style={styles.scanBtnText}>Jalankan Pemindaian</Text>
              </TouchableOpacity>

              {/* Scan Result Output */}
              {testResult && (
                <View
                  style={[
                    styles.resultCard,
                    {
                      backgroundColor:
                        testResult.status === 'approved'
                          ? 'rgba(0, 210, 106, 0.12)'
                          : testResult.status === 'pending_review'
                          ? 'rgba(255, 184, 0, 0.12)'
                          : 'rgba(255, 45, 85, 0.15)',
                      borderColor:
                        testResult.status === 'approved'
                          ? '#00D26A'
                          : testResult.status === 'pending_review'
                          ? '#FFB800'
                          : '#FF2D55',
                    },
                  ]}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    {testResult.status === 'approved' ? (
                      <CheckCircle size={16} color="#00D26A" />
                    ) : (
                      <AlertTriangle size={16} color={testResult.status === 'pending_review' ? '#FFB800' : '#FF2D55'} />
                    )}
                    <Text
                      style={[
                        styles.resultStatusText,
                        {
                          color:
                            testResult.status === 'approved'
                              ? '#00D26A'
                              : testResult.status === 'pending_review'
                              ? '#FFB800'
                              : '#FF2D55',
                        },
                      ]}
                    >
                      {testResult.status === 'approved'
                        ? 'LOLOS REVIEW (AMAN)'
                        : testResult.status === 'pending_review'
                        ? 'MEMERLUKAN KURASI (PENDING)'
                        : `DITOLAK (PELANGGARAN ${testResult.category.toUpperCase()})`}
                    </Text>
                  </View>

                  <Text style={[styles.resultReason, { color: colors.text }]}>
                    {testResult.reason || 'Konten memenuhi standar keamanan komunitas.'}
                  </Text>

                  {testResult.flaggedKeywords.length > 0 && (
                    <Text style={[styles.resultKeywords, { color: colors.textSecondary }]}>
                      Kata kunci terdeteksi: {testResult.flaggedKeywords.join(', ')}
                    </Text>
                  )}
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
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  container: {
    width: '92%',
    maxWidth: 380,
    maxHeight: '85%',
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
    fontSize: 12,
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
  policyCard: {
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 14,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '800',
  },
  cardText: {
    fontSize: 12,
    marginTop: 6,
    lineHeight: 16,
  },
  bulletList: {
    marginTop: 8,
    gap: 4,
  },
  bulletItem: {
    fontSize: 11,
    lineHeight: 15,
  },
  scannerSection: {
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 20,
  },
  scannerTitle: {
    fontSize: 14,
    fontWeight: '800',
  },
  scannerSub: {
    fontSize: 11,
    marginBottom: 10,
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 13,
  },
  presetsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 8,
    marginBottom: 10,
  },
  presetChip: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
  },
  scanBtn: {
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scanBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
  resultCard: {
    marginTop: 12,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  resultStatusText: {
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  resultReason: {
    fontSize: 12,
    marginTop: 6,
    lineHeight: 16,
  },
  resultKeywords: {
    fontSize: 11,
    marginTop: 4,
    fontStyle: 'italic',
  },
});
