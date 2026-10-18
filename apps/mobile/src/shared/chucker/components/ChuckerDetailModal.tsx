import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
} from 'react-native';
import {
  ChevronLeft,
  Copy,
  Terminal,
  FileText,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Layers,
  ArrowDownCircle,
  ArrowUpCircle,
} from 'lucide-react-native';
import { ChuckerTransaction } from '../types';
import { formatBytes } from '../chuckerInterceptor';
import { useThemeStore } from '../../../theme/useThemeStore';
import { toast } from '../../stores/useToastStore';

interface ChuckerDetailModalProps {
  transaction: ChuckerTransaction | null;
  onClose: () => void;
}

type DetailTab = 'overview' | 'request' | 'response' | 'curl';

export const ChuckerDetailModal: React.FC<ChuckerDetailModalProps> = ({
  transaction,
  onClose,
}) => {
  const { colors, isDark } = useThemeStore();
  const [activeTab, setActiveTab] = useState<DetailTab>('overview');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  if (!transaction) return null;

  const isSuccess = transaction.statusCode && transaction.statusCode >= 200 && transaction.statusCode < 400;
  const isError = (transaction.statusCode && transaction.statusCode >= 400) || Boolean(transaction.error);
  const statusColor = isSuccess ? '#00D26A' : isError ? '#FF4757' : '#FFA502';

  const copyToClipboard = async (text: string, label: string) => {
    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard) {
        await navigator.clipboard.writeText(text);
        setCopiedKey(label);
        toast.success(`${label} berhasil disalin ke clipboard!`);
        setTimeout(() => setCopiedKey(null), 2000);
      }
    } catch {
      toast.error('Gagal menyalin teks');
    }
  };

  const renderJsonOrText = (data: any, raw?: string) => {
    let content = raw || '';
    if (!content && data) {
      try {
        content = typeof data === 'string' ? data : JSON.stringify(data, null, 2);
      } catch {
        content = String(data);
      }
    }

    if (!content) {
      return (
        <View style={styles.emptyContentBox}>
          <Text style={[styles.emptyContentText, { color: colors.textSecondary }]}>
            Tidak ada konten / Body kosong
          </Text>
        </View>
      );
    }

    return (
      <View style={[styles.codeBox, { backgroundColor: isDark ? '#0D1117' : '#F6F8FA', borderColor: colors.border }]}>
        <ScrollView horizontal showsHorizontalScrollIndicator={true}>
          <Text style={[styles.codeText, { color: isDark ? '#7EE787' : '#0969DA' }]}>
            {content}
          </Text>
        </ScrollView>
      </View>
    );
  };

  const renderHeadersTable = (headers?: Record<string, string>) => {
    if (!headers || Object.keys(headers).length === 0) {
      return (
        <Text style={[styles.emptyContentText, { color: colors.textSecondary }]}>
          Tidak ada header
        </Text>
      );
    }

    return (
      <View style={[styles.headersTable, { borderColor: colors.border }]}>
        {Object.entries(headers).map(([key, val], idx) => (
          <View
            key={key}
            style={[
              styles.headerRow,
              idx % 2 === 1 && { backgroundColor: isDark ? 'rgba(255, 255, 255, 0.02)' : 'rgba(0, 0, 0, 0.02)' },
              { borderBottomColor: colors.border },
            ]}
          >
            <Text style={[styles.headerKey, { color: colors.primary }]}>{key}</Text>
            <Text style={[styles.headerVal, { color: colors.text }]} selectable>
              {val}
            </Text>
          </View>
        ))}
      </View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Top Navigation Bar */}
      <View style={[styles.navBar, { backgroundColor: colors.surfaceCard, borderBottomColor: colors.border }]}>
        <TouchableOpacity style={styles.backBtn} onPress={onClose} activeOpacity={0.7}>
          <ChevronLeft size={22} color={colors.text} />
        </TouchableOpacity>

        <View style={styles.titleCol}>
          <View style={styles.methodStatusRow}>
            <View style={[styles.methodBadge, { backgroundColor: colors.primaryGlow }]}>
              <Text style={[styles.methodBadgeText, { color: colors.primary }]}>
                {transaction.method}
              </Text>
            </View>

            <View style={[styles.statusBadge, { backgroundColor: `${statusColor}20`, borderColor: statusColor }]}>
              <Text style={[styles.statusBadgeText, { color: statusColor }]}>
                {transaction.isPending ? 'PENDING' : `${transaction.statusCode || ''} ${transaction.statusText || ''}`}
              </Text>
            </View>
          </View>

          <Text style={[styles.pathText, { color: colors.text }]} numberOfLines={1}>
            {transaction.path}
          </Text>
        </View>
      </View>

      {/* Segmented Subtabs (Overview | Request | Response | cURL) */}
      <View style={[styles.tabBar, { backgroundColor: colors.surfaceCard, borderBottomColor: colors.border }]}>
        {(
          [
            { key: 'overview', label: 'Ringkasan' },
            { key: 'request', label: 'Request' },
            { key: 'response', label: 'Response' },
            { key: 'curl', label: 'cURL' },
          ] as const
        ).map((tab) => {
          const isSelected = activeTab === tab.key;
          return (
            <TouchableOpacity
              key={tab.key}
              onPress={() => setActiveTab(tab.key)}
              style={[
                styles.tabItem,
                isSelected && { borderBottomColor: colors.primary, borderBottomWidth: 2 },
              ]}
              activeOpacity={0.8}
            >
              <Text
                style={[
                  styles.tabLabel,
                  { color: isSelected ? colors.primary : colors.textSecondary },
                  isSelected && { fontWeight: '700' },
                ]}
              >
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Tab Contents */}
      <ScrollView style={styles.contentScroll} contentContainerStyle={styles.contentInner}>
        {/* TAB 1: OVERVIEW */}
        {activeTab === 'overview' && (
          <View style={styles.tabSection}>
            {/* Error banner if present */}
            {transaction.error && (
              <View style={[styles.errorBox, { backgroundColor: 'rgba(255, 71, 87, 0.1)', borderColor: '#FF4757' }]}>
                <AlertTriangle size={18} color="#FF4757" style={{ marginTop: 2, marginRight: 8 }} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.errorBoxTitle}>Error / Exception Terdeteksi</Text>
                  <Text style={styles.errorBoxBody}>{transaction.error}</Text>
                </View>
              </View>
            )}

            <View style={[styles.infoCard, { backgroundColor: colors.surfaceCard, borderColor: colors.border }]}>
              <View style={styles.infoRow}>
                <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>URL Lengkap</Text>
                <TouchableOpacity
                  onPress={() => copyToClipboard(transaction.url, 'URL')}
                  style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}
                >
                  <Text style={[styles.infoVal, { color: colors.primary }]} numberOfLines={2} selectable>
                    {transaction.url}
                  </Text>
                  <Copy size={12} color={colors.primary} />
                </TouchableOpacity>
              </View>

              <View style={[styles.divider, { backgroundColor: colors.border }]} />

              <View style={styles.infoGrid}>
                <View style={styles.gridItem}>
                  <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Method</Text>
                  <Text style={[styles.infoVal, { color: colors.text }]}>{transaction.method}</Text>
                </View>

                <View style={styles.gridItem}>
                  <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Protokol</Text>
                  <Text style={[styles.infoVal, { color: colors.text }]}>{transaction.protocol}</Text>
                </View>

                <View style={styles.gridItem}>
                  <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Status Code</Text>
                  <Text style={[styles.infoVal, { color: statusColor, fontWeight: '700' }]}>
                    {transaction.statusCode || 'N/A'} ({transaction.statusText || 'Pending'})
                  </Text>
                </View>

                <View style={styles.gridItem}>
                  <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Durasi Latensi</Text>
                  <Text style={[styles.infoVal, { color: colors.text, fontWeight: '700' }]}>
                    {transaction.durationMs} ms
                  </Text>
                </View>

                <View style={styles.gridItem}>
                  <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Request Size</Text>
                  <Text style={[styles.infoVal, { color: colors.text }]}>
                    {formatBytes(transaction.requestSize)}
                  </Text>
                </View>

                <View style={styles.gridItem}>
                  <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Response Size</Text>
                  <Text style={[styles.infoVal, { color: colors.text }]}>
                    {formatBytes(transaction.responseSize)}
                  </Text>
                </View>
              </View>

              <View style={[styles.divider, { backgroundColor: colors.border }]} />

              <View style={styles.infoRow}>
                <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Waktu Request</Text>
                <Text style={[styles.infoVal, { color: colors.text }]}>
                  {new Date(transaction.timestamp).toLocaleTimeString()} ({new Date(transaction.timestamp).toLocaleDateString()})
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* TAB 2: REQUEST */}
        {activeTab === 'request' && (
          <View style={styles.tabSection}>
            <View style={styles.sectionHeaderRow}>
              <Text style={[styles.sectionHeading, { color: colors.text }]}>REQUEST HEADERS</Text>
            </View>
            {renderHeadersTable(transaction.requestHeaders)}

            <View style={[styles.sectionHeaderRow, { marginTop: 18 }]}>
              <Text style={[styles.sectionHeading, { color: colors.text }]}>REQUEST BODY</Text>
              {transaction.requestBodyRaw && (
                <TouchableOpacity
                  onPress={() => copyToClipboard(transaction.requestBodyRaw || '', 'Request Body')}
                  style={styles.copyBtn}
                >
                  <Copy size={12} color={colors.primary} />
                  <Text style={[styles.copyBtnText, { color: colors.primary }]}>Salin JSON</Text>
                </TouchableOpacity>
              )}
            </View>
            {renderJsonOrText(transaction.requestBody, transaction.requestBodyRaw)}
          </View>
        )}

        {/* TAB 3: RESPONSE */}
        {activeTab === 'response' && (
          <View style={styles.tabSection}>
            <View style={styles.sectionHeaderRow}>
              <Text style={[styles.sectionHeading, { color: colors.text }]}>RESPONSE HEADERS</Text>
            </View>
            {renderHeadersTable(transaction.responseHeaders)}

            <View style={[styles.sectionHeaderRow, { marginTop: 18 }]}>
              <Text style={[styles.sectionHeading, { color: colors.text }]}>RESPONSE BODY</Text>
              {transaction.responseBodyRaw && (
                <TouchableOpacity
                  onPress={() => copyToClipboard(transaction.responseBodyRaw || '', 'Response Body')}
                  style={styles.copyBtn}
                >
                  <Copy size={12} color={colors.primary} />
                  <Text style={[styles.copyBtnText, { color: colors.primary }]}>Salin JSON</Text>
                </TouchableOpacity>
              )}
            </View>
            {renderJsonOrText(transaction.responseBody, transaction.responseBodyRaw)}
          </View>
        )}

        {/* TAB 4: CURL */}
        {activeTab === 'curl' && (
          <View style={styles.tabSection}>
            <View style={styles.sectionHeaderRow}>
              <Text style={[styles.sectionHeading, { color: colors.text }]}>EXECUTABLE CURL COMMAND</Text>
            </View>
            <Text style={[styles.curlHint, { color: colors.textSecondary }]}>
              Salin perintah berikut untuk menguji ulang permintaan ini di Terminal atau mengimpor ke Postman / Insomnia:
            </Text>

            <View style={[styles.codeBox, { backgroundColor: isDark ? '#0D1117' : '#F6F8FA', borderColor: colors.border }]}>
              <ScrollView horizontal showsHorizontalScrollIndicator={true}>
                <Text style={[styles.codeText, { color: isDark ? '#79C0FF' : '#0550AE' }]} selectable>
                  {transaction.curlCommand || `curl -X ${transaction.method} "${transaction.url}"`}
                </Text>
              </ScrollView>
            </View>

            <TouchableOpacity
              style={[styles.bigCopyBtn, { backgroundColor: colors.primary }]}
              onPress={() => copyToClipboard(transaction.curlCommand || '', 'cURL Command')}
              activeOpacity={0.8}
            >
              <Terminal size={16} color="#FFFFFF" style={{ marginRight: 6 }} />
              <Text style={styles.bigCopyBtnText}>
                {copiedKey === 'cURL Command' ? 'Tersalin ke Clipboard!' : 'Salin Perintah cURL Lengkap'}
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 10001,
  },
  navBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingTop: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
  },
  backBtn: {
    padding: 6,
    marginRight: 6,
  },
  titleCol: {
    flex: 1,
  },
  methodStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 2,
  },
  methodBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  methodBadgeText: {
    fontSize: 10,
    fontWeight: '800',
  },
  statusBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
  },
  statusBadgeText: {
    fontSize: 10,
    fontWeight: '800',
  },
  pathText: {
    fontSize: 13,
    fontWeight: '700',
  },
  tabBar: {
    flexDirection: 'row',
    borderBottomWidth: 1,
  },
  tabItem: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabLabel: {
    fontSize: 12,
  },
  contentScroll: {
    flex: 1,
  },
  contentInner: {
    padding: 14,
    paddingBottom: 40,
  },
  tabSection: {
    width: '100%',
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    marginBottom: 14,
  },
  errorBoxTitle: {
    color: '#FF4757',
    fontSize: 12,
    fontWeight: '800',
    marginBottom: 2,
  },
  errorBoxBody: {
    color: '#FF4757',
    fontSize: 11,
    lineHeight: 16,
  },
  infoCard: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 14,
  },
  infoRow: {
    marginBottom: 10,
  },
  infoLabel: {
    fontSize: 10.5,
    fontWeight: '600',
    textTransform: 'uppercase',
    marginBottom: 3,
  },
  infoVal: {
    fontSize: 12.5,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    marginVertical: 10,
  },
  infoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  gridItem: {
    width: '46%',
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  sectionHeading: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.6,
  },
  copyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  copyBtnText: {
    fontSize: 11,
    fontWeight: '700',
  },
  headersTable: {
    borderWidth: 1,
    borderRadius: 8,
    overflow: 'hidden',
  },
  headerRow: {
    flexDirection: 'row',
    paddingVertical: 7,
    paddingHorizontal: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  headerKey: {
    width: 140,
    fontSize: 11,
    fontWeight: '700',
  },
  headerVal: {
    flex: 1,
    fontSize: 11,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  codeBox: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    minHeight: 120,
    maxHeight: 380,
  },
  codeText: {
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    fontSize: 11.5,
    lineHeight: 18,
  },
  emptyContentBox: {
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyContentText: {
    fontSize: 12,
    fontStyle: 'italic',
  },
  curlHint: {
    fontSize: 11.5,
    lineHeight: 16,
    marginBottom: 10,
  },
  bigCopyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    marginTop: 14,
  },
  bigCopyBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
});
