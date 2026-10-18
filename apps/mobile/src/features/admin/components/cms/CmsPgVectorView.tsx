import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import {
  Sparkles,
  Cpu,
  Database,
  Search,
  RefreshCw,
  Zap,
  CheckCircle2,
  ShieldCheck,
  ChevronRight,
  Layers,
} from 'lucide-react-native';
import { useThemeStore } from '../../../../theme/useThemeStore';
import { useAdminCmsStore } from '../../stores/useAdminCmsStore';

export const CmsPgVectorView: React.FC = () => {
  const { colors } = useThemeStore();
  const {
    pgvectorStats,
    vectorSearchQuery,
    setVectorSearchQuery,
    vectorSearchResults,
    isSearchingVectors,
    isReindexing,
    fetchPgvectorStats,
    runSemanticSearch,
    reindexVectors,
  } = useAdminCmsStore();

  useEffect(() => {
    fetchPgvectorStats();
    runSemanticSearch(vectorSearchQuery || 'curhat malam santai asik');
  }, []);

  const samplePrompts = [
    'curhat malam santai kopi',
    'gamer anime mabar mlbb',
    'penyanyi akustik merdu',
    'travelling pantai bali',
  ];

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header Bar */}
      <View style={styles.sectionHeader}>
        <View style={styles.headerLeft}>
          <Sparkles size={20} color="#00D19D" />
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            PgVector & AI Semantic Intelligence Console
          </Text>
        </View>
        <TouchableOpacity
          style={[styles.reindexBtn, { backgroundColor: '#FF2E63' }]}
          onPress={reindexVectors}
          disabled={isReindexing}
        >
          <RefreshCw size={14} color="#FFF" />
          <Text style={styles.reindexText}>
            {isReindexing ? 'Mengindeks...' : 'Re-index HNSW'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* 1. Database & Vector Stats Cards */}
      <View style={styles.kpiGrid}>
        <View style={[styles.kpiCard, { backgroundColor: colors.surfaceCard, borderColor: colors.border }]}>
          <View style={styles.cardHeader}>
            <Database size={16} color="#00D19D" />
            <Text style={[styles.kpiLabel, { color: colors.textSecondary }]}>Extension</Text>
          </View>
          <Text style={[styles.kpiValue, { color: '#00D19D' }]}>pgvector</Text>
          <Text style={[styles.kpiSub, { color: colors.textMuted }]}>v0.7.0 (HNSW Active)</Text>
        </View>

        <View style={[styles.kpiCard, { backgroundColor: colors.surfaceCard, borderColor: colors.border }]}>
          <View style={styles.cardHeader}>
            <Layers size={16} color="#FFB800" />
            <Text style={[styles.kpiLabel, { color: colors.textSecondary }]}>Vector Dim</Text>
          </View>
          <Text style={[styles.kpiValue, { color: colors.text }]}>
            {pgvectorStats?.vectorDimension || 384}d
          </Text>
          <Text style={[styles.kpiSub, { color: colors.textMuted }]}>Dense L2 Normalized</Text>
        </View>

        <View style={[styles.kpiCard, { backgroundColor: colors.surfaceCard, borderColor: colors.border }]}>
          <View style={styles.cardHeader}>
            <Cpu size={16} color="#FF2E63" />
            <Text style={[styles.kpiLabel, { color: colors.textSecondary }]}>Query Latency</Text>
          </View>
          <Text style={[styles.kpiValue, { color: '#10B981' }]}>
            {pgvectorStats?.avgQueryLatencyMs || 0.82} ms
          </Text>
          <Text style={[styles.kpiSub, { color: colors.textMuted }]}>Cosine Index Distance</Text>
        </View>

        <View style={[styles.kpiCard, { backgroundColor: colors.surfaceCard, borderColor: colors.border }]}>
          <View style={styles.cardHeader}>
            <Zap size={16} color="#3B82F6" />
            <Text style={[styles.kpiLabel, { color: colors.textSecondary }]}>Total Vectors</Text>
          </View>
          <Text style={[styles.kpiValue, { color: colors.text }]}>
            {(pgvectorStats?.totalHostsIndexed || 5) + (pgvectorStats?.totalProfilesIndexed || 142)}
          </Text>
          <Text style={[styles.kpiSub, { color: colors.textMuted }]}>Profiles & Knowledge</Text>
        </View>
      </View>

      {/* 2. Interactive Semantic Vector Search Explorer */}
      <View style={[styles.panelCard, { backgroundColor: colors.surfaceCard, borderColor: colors.border }]}>
        <View style={styles.panelHeader}>
          <Search size={18} color="#00D19D" />
          <Text style={[styles.panelTitle, { color: colors.text }]}>
            Live Vector Similarity Search Explorer (`&lt;=&gt;` Operator)
          </Text>
        </View>
        <Text style={[styles.panelSubtitle, { color: colors.textSecondary }]}>
          Ketik kalimat bahasa alami untuk menguji pencarian kesamaan semantik vektor host secara real-time.
        </Text>

        {/* Search Input Bar */}
        <View style={[styles.searchBox, { backgroundColor: 'rgba(255,255,255,0.05)', borderColor: colors.border }]}>
          <TextInput
            style={[styles.searchInput, { color: colors.text }]}
            value={vectorSearchQuery}
            onChangeText={setVectorSearchQuery}
            placeholder="Contoh: cewek asik diajak curhat malam..."
            placeholderTextColor={colors.textMuted}
            onSubmitEditing={() => runSemanticSearch(vectorSearchQuery)}
          />
          <TouchableOpacity
            style={[styles.searchExecuteBtn, { backgroundColor: '#00D19D' }]}
            onPress={() => runSemanticSearch(vectorSearchQuery)}
            disabled={isSearchingVectors}
          >
            <Text style={styles.searchExecuteText}>
              {isSearchingVectors ? '...' : 'Cari Vektor'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Quick Sample Prompt Chips */}
        <View style={styles.promptChipsRow}>
          <Text style={[styles.promptLabel, { color: colors.textMuted }]}>Uji Coba Cepat:</Text>
          {samplePrompts.map((p) => (
            <TouchableOpacity
              key={p}
              style={[styles.promptChip, { backgroundColor: 'rgba(255,255,255,0.06)' }]}
              onPress={() => {
                setVectorSearchQuery(p);
                runSemanticSearch(p);
              }}
            >
              <Text style={styles.promptChipText}>"{p}"</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Vector Search Results Table */}
        <View style={styles.resultsList}>
          {vectorSearchResults.map((res, index) => (
            <View
              key={res.hostId}
              style={[
                styles.resultCard,
                { backgroundColor: 'rgba(255,255,255,0.03)', borderColor: colors.border },
              ]}
            >
              <View style={styles.resultTopRow}>
                <View style={styles.rankBadge}>
                  <Text style={styles.rankText}>#{index + 1}</Text>
                </View>
                <View style={{ flex: 1, marginLeft: 8 }}>
                  <Text style={[styles.resultName, { color: colors.text }]}>
                    {res.nickname}
                  </Text>
                  <Text style={[styles.resultVibe, { color: colors.textSecondary }]}>
                    {res.vibeDescription}
                  </Text>
                </View>
                <View style={styles.scoreBox}>
                  <Text style={[styles.similarityScore, { color: '#00D19D' }]}>
                    {(res.similarity * 100).toFixed(1)}%
                  </Text>
                  <Text style={[styles.similarityLabel, { color: colors.textMuted }]}>
                    Cosine Sim
                  </Text>
                </View>
              </View>

              {/* Match Reason Banner */}
              <View style={styles.reasonBanner}>
                <Sparkles size={12} color="#FFB800" />
                <Text style={styles.reasonText}>{res.matchReason}</Text>
              </View>

              {/* Vector Preview Bar */}
              {res.vectorPreview && (
                <View style={styles.vectorPreviewBox}>
                  <Text style={styles.vectorPreviewLabel}>Vector Snippet [0..7]:</Text>
                  <Text style={styles.vectorSnippetText}>
                    [{res.vectorPreview.map((v) => v.toFixed(3)).join(', ')}, ...]
                  </Text>
                </View>
              )}
            </View>
          ))}
        </View>
      </View>

      {/* 3. Moderation Benchmarks Vector Bank */}
      <View style={[styles.panelCard, { backgroundColor: colors.surfaceCard, borderColor: colors.border }]}>
        <View style={styles.panelHeader}>
          <ShieldCheck size={18} color="#FF2E63" />
          <Text style={[styles.panelTitle, { color: colors.text }]}>
            Moderation Vector Benchmarks Bank (SARA & Pornografi)
          </Text>
        </View>
        <Text style={[styles.panelSubtitle, { color: colors.textSecondary }]}>
          Tolok ukur pola teks pelanggaran berdimensi 384 untuk pemindaian otomatis sebelum konten diunggah.
        </Text>

        <View style={styles.benchmarkList}>
          <View style={styles.benchmarkItem}>
            <View style={[styles.bmCategoryBadge, { backgroundColor: 'rgba(239,68,68,0.15)' }]}>
              <Text style={[styles.bmCategoryText, { color: '#EF4444' }]}>SARA</Text>
            </View>
            <View style={{ flex: 1, marginLeft: 10 }}>
              <Text style={[styles.bmPattern, { color: colors.text }]}>
                Ujaran kebencian suku, agama, ras, etnis & diskriminasi
              </Text>
              <Text style={[styles.bmPolicy, { color: colors.textMuted }]}>
                Ambang Batas: &ge; 0.70 &bull; Kebijakan: AUTO_REJECT &bull; Severity: CRITICAL
              </Text>
            </View>
          </View>

          <View style={styles.benchmarkItem}>
            <View style={[styles.bmCategoryBadge, { backgroundColor: 'rgba(255,46,99,0.15)' }]}>
              <Text style={[styles.bmCategoryText, { color: '#FF2E63' }]}>PORNOGRAFI</Text>
            </View>
            <View style={{ flex: 1, marginLeft: 10 }}>
              <Text style={[styles.bmPattern, { color: colors.text }]}>
                Tawaran VCS, ketelanjangan eksplisit, prostitusi/Open BO
              </Text>
              <Text style={[styles.bmPolicy, { color: colors.textMuted }]}>
                Ambang Batas: &ge; 0.70 &bull; Kebijakan: AUTO_REJECT &bull; Severity: CRITICAL
              </Text>
            </View>
          </View>

          <View style={styles.benchmarkItem}>
            <View style={[styles.bmCategoryBadge, { backgroundColor: 'rgba(245,158,11,0.15)' }]}>
              <Text style={[styles.bmCategoryText, { color: '#F59E0B' }]}>TOKSISITAS</Text>
            </View>
            <View style={{ flex: 1, marginLeft: 10 }}>
              <Text style={[styles.bmPattern, { color: colors.text }]}>
                Makian kasar, perundungan verbal, dan ancaman
              </Text>
              <Text style={[styles.bmPolicy, { color: colors.textMuted }]}>
                Ambang Batas: &ge; 0.68 &bull; Kebijakan: FLAG_FOR_REVIEW &bull; Severity: HIGH
              </Text>
            </View>
          </View>
        </View>
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
    marginBottom: 16,
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
  reindexBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
  },
  reindexText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '700',
  },
  kpiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 16,
  },
  kpiCard: {
    flex: 1,
    minWidth: 140,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  kpiLabel: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  kpiValue: {
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 4,
  },
  kpiSub: {
    fontSize: 11,
  },
  panelCard: {
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 16,
  },
  panelHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  panelTitle: {
    fontSize: 14,
    fontWeight: '700',
  },
  panelSubtitle: {
    fontSize: 12,
    marginBottom: 14,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 4,
    marginBottom: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    paddingVertical: 8,
  },
  searchExecuteBtn: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 6,
  },
  searchExecuteText: {
    color: '#000',
    fontSize: 12,
    fontWeight: '700',
  },
  promptChipsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 14,
  },
  promptLabel: {
    fontSize: 11,
    fontWeight: '600',
  },
  promptChip: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  promptChipText: {
    fontSize: 11,
    color: '#00D19D',
  },
  resultsList: {
    gap: 10,
  },
  resultCard: {
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
  },
  resultTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rankBadge: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#00D19D',
    alignItems: 'center',
    justifyContent: 'center',
  },
  rankText: {
    color: '#000',
    fontSize: 12,
    fontWeight: '800',
  },
  resultName: {
    fontSize: 13,
    fontWeight: '700',
  },
  resultVibe: {
    fontSize: 11,
    marginTop: 2,
  },
  scoreBox: {
    alignItems: 'flex-end',
  },
  similarityScore: {
    fontSize: 16,
    fontWeight: '800',
  },
  similarityLabel: {
    fontSize: 10,
  },
  reasonBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 8,
    backgroundColor: 'rgba(255,184,0,0.08)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  reasonText: {
    color: '#FFB800',
    fontSize: 11,
    fontWeight: '600',
  },
  vectorPreviewBox: {
    marginTop: 6,
  },
  vectorPreviewLabel: {
    fontSize: 10,
    color: '#9CA3AF',
    fontFamily: 'monospace',
  },
  vectorSnippetText: {
    fontSize: 10,
    color: '#6EE7B7',
    fontFamily: 'monospace',
    marginTop: 1,
  },
  benchmarkList: {
    gap: 10,
  },
  benchmarkItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.03)',
  },
  bmCategoryBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    width: 90,
    alignItems: 'center',
  },
  bmCategoryText: {
    fontSize: 10,
    fontWeight: '800',
  },
  bmPattern: {
    fontSize: 12,
    fontWeight: '600',
  },
  bmPolicy: {
    fontSize: 10,
    marginTop: 2,
  },
});
