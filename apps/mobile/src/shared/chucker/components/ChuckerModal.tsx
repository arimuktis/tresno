import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Platform,
  Modal,
} from 'react-native';
import {
  X,
  Trash2,
  Share2,
  Search,
  Activity,
  ArrowRight,
  Filter,
  Radio,
  Zap,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Play,
} from 'lucide-react-native';
import { useChuckerStore } from '../chuckerStore';
import { ChuckerTransaction, ChuckerFilter } from '../types';
import { ChuckerDetailModal } from './ChuckerDetailModal';
import { formatBytes, recordWebSocketEvent } from '../chuckerInterceptor';
import { useThemeStore } from '../../../theme/useThemeStore';
import { toast } from '../../stores/useToastStore';
import { ButtonChip } from '../../components/atoms/Chip';

export const ChuckerModal: React.FC = () => {
  const { colors, isDark } = useThemeStore();
  const {
    isOpen,
    setOpen,
    transactions,
    clearTransactions,
    filter,
    setFilter,
    searchQuery,
    setSearchQuery,
    selectedTransactionId,
    selectTransaction,
    getStats,
    getFilteredTransactions,
  } = useChuckerStore();

  if (!isOpen) return null;

  const stats = getStats();
  const filteredList = getFilteredTransactions();
  const selectedTx = transactions.find((t) => t.id === selectedTransactionId) || null;

  const handleClear = () => {
    clearTransactions();
    toast.info('Seluruh log network Chucker telah dibersihkan.');
  };

  const handleExportJson = async () => {
    try {
      const jsonStr = JSON.stringify(transactions, null, 2);
      if (typeof navigator !== 'undefined' && navigator.clipboard) {
        await navigator.clipboard.writeText(jsonStr);
        toast.success(`Berhasil menyalin ${transactions.length} log transaksi ke clipboard!`);
      }
    } catch {
      toast.error('Gagal mengekspor log');
    }
  };

  // Fitur simulasi cepat untuk mendemonstrasikan Chucker langsung
  const handleSimulateRequest = async () => {
    toast.info('Menjalankan simulasi request HTTP & WebSocket...');
    try {
      // 1. HTTP 200 Health Check
      fetch('http://localhost:4000/health').catch(() => {});

      // 2. HTTP POST Simulasi
      fetch('http://localhost:4000/api/auth/otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: '08123456789', source: 'chucker_test' }),
      }).catch(() => {});

      // 3. WebSocket Mock Event
      setTimeout(() => {
        recordWebSocketEvent('SEND', 'HEARTBEAT', { timestamp: Date.now() });
      }, 200);

      setTimeout(() => {
        recordWebSocketEvent('RECV', 'HEARTBEAT_ACK', { status: 'ok', serverTime: Date.now() });
      }, 400);
    } catch {
      // ignore
    }
  };

  const getMethodBadgeColor = (method: string) => {
    const m = method.toUpperCase();
    if (m === 'GET') return '#00A8FF';
    if (m === 'POST') return '#00D26A';
    if (m === 'PUT' || m === 'PATCH') return '#FFA502';
    if (m === 'DELETE') return '#FF4757';
    if (m.startsWith('WS')) return '#9B51E0';
    return colors.primary;
  };

  const getStatusBadgeStyle = (tx: ChuckerTransaction) => {
    if (tx.isPending) {
      return { bg: 'rgba(255, 165, 2, 0.15)', text: '#FFA502', label: 'PENDING' };
    }
    if (tx.protocol === 'WS') {
      return { bg: 'rgba(155, 81, 224, 0.15)', text: '#9B51E0', label: 'WS' };
    }
    if (tx.statusCode && tx.statusCode >= 200 && tx.statusCode < 300) {
      return { bg: 'rgba(0, 210, 106, 0.15)', text: '#00D26A', label: `${tx.statusCode}` };
    }
    if (tx.statusCode && tx.statusCode >= 300 && tx.statusCode < 400) {
      return { bg: 'rgba(255, 184, 0, 0.15)', text: colors.gold, label: `${tx.statusCode}` };
    }
    if (tx.statusCode && tx.statusCode >= 400) {
      return { bg: 'rgba(255, 71, 87, 0.15)', text: '#FF4757', label: `${tx.statusCode}` };
    }
    return { bg: 'rgba(255, 71, 87, 0.15)', text: '#FF4757', label: 'ERR' };
  };

  return (
    <View style={[styles.overlay, { backgroundColor: colors.background }]}>
      {/* Detail Modal Sub-screen */}
      {selectedTx && (
        <ChuckerDetailModal
          transaction={selectedTx}
          onClose={() => selectTransaction(null)}
        />
      )}

      {/* Main Chucker Inspector Screen */}
      <View style={[styles.header, { backgroundColor: colors.surfaceCard, borderBottomColor: colors.border }]}>
        <View style={styles.headerTop}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <View style={[styles.headerIconCircle, { backgroundColor: colors.primaryGlow }]}>
              <Activity size={18} color={colors.primary} />
            </View>
            <View>
              <Text style={[styles.headerTitle, { color: colors.text }]}>CHUCKER</Text>
              <Text style={[styles.headerSub, { color: colors.textSecondary }]}>
                Network & WebSocket Inspector
              </Text>
            </View>
          </View>

          {/* Action Icons */}
          <View style={styles.actionRow}>
            <TouchableOpacity
              style={[styles.actionIconBtn, { backgroundColor: colors.surfaceGlass }]}
              onPress={handleSimulateRequest}
              accessibilityLabel="Simulasi Request"
            >
              <Zap size={15} color={colors.gold} />
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionIconBtn, { backgroundColor: colors.surfaceGlass }]}
              onPress={handleExportJson}
              accessibilityLabel="Salin JSON"
            >
              <Share2 size={15} color={colors.primary} />
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionIconBtn, { backgroundColor: colors.surfaceGlass }]}
              onPress={handleClear}
              accessibilityLabel="Bersihkan"
            >
              <Trash2 size={15} color="#FF4757" />
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.closeIconBtn, { backgroundColor: colors.surfaceGlass }]}
              onPress={() => setOpen(false)}
              accessibilityLabel="Tutup"
            >
              <X size={17} color={colors.text} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Stats Pill Summary Bar */}
        <View style={styles.statsBar}>
          <View style={[styles.statPill, { backgroundColor: colors.surfaceGlass }]}>
            <Text style={[styles.statNum, { color: colors.text }]}>{stats.total}</Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Total</Text>
          </View>

          <View style={[styles.statPill, { backgroundColor: 'rgba(0, 210, 106, 0.1)' }]}>
            <Text style={[styles.statNum, { color: '#00D26A' }]}>{stats.success}</Text>
            <Text style={[styles.statLabel, { color: '#00D26A' }]}>2xx OK</Text>
          </View>

          <View style={[styles.statPill, { backgroundColor: stats.errors > 0 ? 'rgba(255, 71, 87, 0.15)' : colors.surfaceGlass }]}>
            <Text style={[styles.statNum, { color: stats.errors > 0 ? '#FF4757' : colors.textSecondary }]}>
              {stats.errors}
            </Text>
            <Text style={[styles.statLabel, { color: stats.errors > 0 ? '#FF4757' : colors.textSecondary }]}>
              Errors
            </Text>
          </View>

          <View style={[styles.statPill, { backgroundColor: 'rgba(155, 81, 224, 0.1)' }]}>
            <Text style={[styles.statNum, { color: '#9B51E0' }]}>{stats.ws}</Text>
            <Text style={[styles.statLabel, { color: '#9B51E0' }]}>WS</Text>
          </View>
        </View>

        {/* Search Input Bar */}
        <View style={[styles.searchBox, { backgroundColor: colors.surfaceGlass, borderColor: colors.border }]}>
          <Search size={14} color={colors.textSecondary} style={{ marginRight: 6 }} />
          <TextInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Cari URL, method, payload..."
            placeholderTextColor={colors.textSecondary}
            style={[styles.searchInput, { color: colors.text }]}
          />
          {searchQuery ? (
            <TouchableOpacity onPress={() => setSearchQuery('')} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <X size={13} color={colors.textSecondary} />
            </TouchableOpacity>
          ) : null}
        </View>

        {/* Filter Chips Bar */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll} contentContainerStyle={{ gap: 6 }}>
          {(
            [
              { key: 'all', label: 'Semua' },
              { key: 'errors', label: `Errors (${stats.errors})` },
              { key: 'http', label: 'HTTP' },
              { key: 'ws', label: 'WebSocket' },
              { key: 'pending', label: 'Pending' },
            ] as const
          ).map((chip) => (
            <ButtonChip
              key={chip.key}
              label={chip.label}
              selected={filter === chip.key}
              onPress={() => setFilter(chip.key)}
              size="sm"
            />
          ))}
        </ScrollView>
      </View>

      {/* Transaction List */}
      <ScrollView style={styles.listScroll} contentContainerStyle={styles.listContent}>
        {filteredList.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Activity size={36} color={colors.textSecondary} />
            <Text style={[styles.emptyTitle, { color: colors.text }]}>Belum Ada Log Transaksi</Text>
            <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
              {searchQuery
                ? 'Tidak ada request yang sesuai dengan kata kunci pencarian.'
                : 'Request HTTP dan event WebSocket akan otomatis tercatat di sini.'}
            </Text>
            <TouchableOpacity
              style={[styles.simulateBtn, { backgroundColor: colors.primaryGlow, borderColor: colors.primary }]}
              onPress={handleSimulateRequest}
            >
              <Zap size={14} color={colors.primary} style={{ marginRight: 6 }} />
              <Text style={[styles.simulateBtnText, { color: colors.primary }]}>Uji Simulasi Request</Text>
            </TouchableOpacity>
          </View>
        ) : (
          filteredList.map((tx, idx) => {
            const statusStyle = getStatusBadgeStyle(tx);
            const methodColor = getMethodBadgeColor(tx.method);

            return (
              <TouchableOpacity
                key={tx.id}
                style={[
                  styles.itemRow,
                  {
                    backgroundColor: isDark ? 'rgba(255, 255, 255, 0.02)' : 'rgba(0, 0, 0, 0.01)',
                    borderBottomColor: colors.border,
                  },
                ]}
                onPress={() => selectTransaction(tx.id)}
                activeOpacity={0.7}
              >
                {/* Status Code / WS Pill */}
                <View style={[styles.statusPill, { backgroundColor: statusStyle.bg }]}>
                  <Text style={[styles.statusPillText, { color: statusStyle.text }]}>
                    {statusStyle.label}
                  </Text>
                </View>

                {/* Main Transaction Body */}
                <View style={styles.itemMainCol}>
                  <View style={styles.itemTopRow}>
                    <View style={[styles.methodPillSmall, { backgroundColor: `${methodColor}20` }]}>
                      <Text style={[styles.methodTextSmall, { color: methodColor }]}>
                        {tx.method}
                      </Text>
                    </View>
                    <Text style={[styles.itemPath, { color: colors.text }]} numberOfLines={1}>
                      {tx.path}
                    </Text>
                  </View>

                  <View style={styles.itemBottomRow}>
                    <Text style={[styles.metaText, { color: colors.textSecondary }]}>
                      {new Date(tx.timestamp).toLocaleTimeString()}
                    </Text>
                    <Text style={[styles.metaDot, { color: colors.border }]}>•</Text>
                    <Text style={[styles.metaText, { color: colors.textSecondary }]}>
                      {tx.durationMs} ms
                    </Text>
                    <Text style={[styles.metaDot, { color: colors.border }]}>•</Text>
                    <Text style={[styles.metaText, { color: colors.textSecondary }]}>
                      {formatBytes((tx.requestSize || 0) + (tx.responseSize || 0))}
                    </Text>
                  </View>
                </View>

                {/* Arrow indicator */}
                <ArrowRight size={14} color={colors.textSecondary} />
              </TouchableOpacity>
            );
          })
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 10000,
  },
  header: {
    paddingTop: 16,
    paddingHorizontal: 14,
    paddingBottom: 10,
    borderBottomWidth: 1,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  headerIconCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  headerSub: {
    fontSize: 10.5,
    marginTop: 1,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  actionIconBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeIconBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statsBar: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 10,
  },
  statPill: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 5,
    borderRadius: 8,
    gap: 4,
  },
  statNum: {
    fontSize: 12,
    fontWeight: '800',
  },
  statLabel: {
    fontSize: 10,
    fontWeight: '600',
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 34,
    borderRadius: 8,
    paddingHorizontal: 10,
    borderWidth: 1,
    marginBottom: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 12,
    padding: 0,
  },
  filterScroll: {
    maxHeight: 28,
  },
  chip: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
  },
  chipText: {
    fontSize: 11,
  },
  listScroll: {
    flex: 1,
  },
  listContent: {
    paddingBottom: 40,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  statusPill: {
    minWidth: 46,
    paddingVertical: 4,
    paddingHorizontal: 6,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  statusPillText: {
    fontSize: 10.5,
    fontWeight: '900',
  },
  itemMainCol: {
    flex: 1,
    marginRight: 8,
  },
  itemTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 3,
  },
  methodPillSmall: {
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 4,
  },
  methodTextSmall: {
    fontSize: 9,
    fontWeight: '800',
  },
  itemPath: {
    fontSize: 12.5,
    fontWeight: '600',
    flex: 1,
  },
  itemBottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaText: {
    fontSize: 10.5,
  },
  metaDot: {
    marginHorizontal: 4,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 24,
    gap: 8,
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: '700',
    marginTop: 8,
  },
  emptySubtitle: {
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 18,
    maxWidth: 280,
  },
  simulateBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    marginTop: 12,
  },
  simulateBtnText: {
    fontSize: 12,
    fontWeight: '700',
  },
});
