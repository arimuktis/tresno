import React, { Component, ErrorInfo, ReactNode } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Platform,
} from 'react-native';
import { AlertOctagon, RefreshCw, Terminal, Home, ChevronDown, ChevronUp, Copy, Check } from 'lucide-react-native';
import { toast } from '../../stores/useToastStore';
import { useChuckerStore } from '../../chucker/chuckerStore';

interface Props {
  children: ReactNode;
  fallbackTitle?: string;
  fallbackMessage?: string;
  onReset?: () => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  showDetails: boolean;
  copied: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      showDetails: false,
      copied: false,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    this.setState({ errorInfo });
    console.error('[ErrorBoundary caught error]:', error, errorInfo);
  }

  handleReload = (): void => {
    if (this.props.onReset) {
      this.props.onReset();
    }
    this.setState({ hasError: false, error: null, errorInfo: null, showDetails: false });
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      // If reset doesn't restore, soft reload
      window.location.reload();
    }
  };

  handleOpenChucker = (): void => {
    useChuckerStore.getState().setOpen(true);
    toast.info('Chucker Network & Debug Inspector dibuka.');
  };

  handleCopyDiagnostics = (): void => {
    const { error, errorInfo } = this.state;
    const diag = `=== TRESNO CRASH DIAGNOSTIC ===\nTime: ${new Date().toISOString()}\nPlatform: ${Platform.OS}\nError: ${error?.name}: ${error?.message}\nStack: ${error?.stack}\nComponent Stack: ${errorInfo?.componentStack}`;
    
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(diag);
      this.setState({ copied: true });
      toast.success('Diagnostik error berhasil disalin ke clipboard!');
      setTimeout(() => this.setState({ copied: false }), 2000);
    }
  };

  render(): ReactNode {
    if (this.state.hasError) {
      const { fallbackTitle, fallbackMessage } = this.props;
      const { error, errorInfo, showDetails, copied } = this.state;

      return (
        <View style={styles.fallbackBackdrop}>
          <View style={styles.card}>
            {/* Error Glowing Icon */}
            <View style={styles.iconWrapper}>
              <AlertOctagon size={36} color="#EF4444" />
            </View>

            {/* Error Message Header */}
            <Text style={styles.title}>
              {fallbackTitle || 'Ups! Terjadi Kendala Tampilan'}
            </Text>

            <Text style={styles.message}>
              {fallbackMessage ||
                'Aplikasi mengalami kendala teknis saat memuat komponen ini. Saldo dan data akun Anda tetap aman.'}
            </Text>

            {/* Action Buttons */}
            <View style={styles.actionRow}>
              <TouchableOpacity
                style={styles.primaryButton}
                activeOpacity={0.8}
                onPress={this.handleReload}
              >
                <RefreshCw size={15} color="#FFFFFF" style={{ marginRight: 6 }} />
                <Text style={styles.primaryButtonText}>Muat Ulang Layar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.secondaryButton}
                activeOpacity={0.8}
                onPress={this.handleOpenChucker}
              >
                <Terminal size={15} color="#F59E0B" style={{ marginRight: 6 }} />
                <Text style={styles.secondaryButtonText}>Buka Debug & Log</Text>
              </TouchableOpacity>
            </View>

            {/* Collapsible Technical Details */}
            <TouchableOpacity
              style={styles.toggleDetailsBtn}
              activeOpacity={0.7}
              onPress={() => this.setState({ showDetails: !showDetails })}
            >
              <Text style={styles.toggleDetailsText}>
                {showDetails ? 'Sembunyikan Detail Teknis' : 'Tampilkan Detail Teknis Error'}
              </Text>
              {showDetails ? (
                <ChevronUp size={14} color="#9CA3AF" />
              ) : (
                <ChevronDown size={14} color="#9CA3AF" />
              )}
            </TouchableOpacity>

            {showDetails && (
              <View style={styles.detailsContainer}>
                <View style={styles.detailsHeader}>
                  <Text style={styles.detailsHeaderText}>Stack Trace:</Text>
                  <TouchableOpacity
                    style={styles.copyBtn}
                    onPress={this.handleCopyDiagnostics}
                    activeOpacity={0.7}
                  >
                    {copied ? (
                      <Check size={12} color="#10B981" />
                    ) : (
                      <Copy size={12} color="#9CA3AF" />
                    )}
                    <Text style={styles.copyBtnText}>{copied ? 'Tersalin' : 'Salin'}</Text>
                  </TouchableOpacity>
                </View>

                <ScrollView style={styles.detailsScroll} nestedScrollEnabled>
                  <Text style={styles.errorStackText}>
                    {error?.name}: {error?.message}
                    {'\n\n'}
                    {error?.stack}
                    {'\n\n'}
                    {errorInfo?.componentStack}
                  </Text>
                </ScrollView>
              </View>
            )}
          </View>
        </View>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  fallbackBackdrop: {
    flex: 1,
    backgroundColor: '#0F0E17',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  card: {
    width: '92%',
    maxWidth: 380,
    backgroundColor: '#1A1829',
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: 'rgba(239, 68, 68, 0.35)',
    padding: 24,
    alignItems: 'center',
    shadowColor: '#EF4444',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 8,
  },
  iconWrapper: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(239, 68, 68, 0.12)',
    borderWidth: 1.5,
    borderColor: 'rgba(239, 68, 68, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 8,
  },
  message: {
    fontSize: 13,
    color: '#9CA3AF',
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 20,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 10,
    width: '100%',
    marginBottom: 14,
  },
  primaryButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FF3366',
    borderRadius: 12,
    paddingVertical: 11,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 12.5,
  },
  secondaryButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(245, 158, 11, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.35)',
    borderRadius: 12,
    paddingVertical: 11,
  },
  secondaryButtonText: {
    color: '#F59E0B',
    fontWeight: '700',
    fontSize: 12.5,
  },
  toggleDetailsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 6,
    marginTop: 4,
  },
  toggleDetailsText: {
    fontSize: 11.5,
    color: '#9CA3AF',
    fontWeight: '600',
  },
  detailsContainer: {
    width: '100%',
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    marginTop: 10,
    padding: 10,
  },
  detailsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  detailsHeaderText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#E5E7EB',
  },
  copyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  copyBtnText: {
    fontSize: 10.5,
    color: '#D1D5DB',
    fontWeight: '600',
  },
  detailsScroll: {
    maxHeight: 120,
  },
  errorStackText: {
    fontSize: 10,
    color: '#F87171',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    lineHeight: 14,
  },
});
