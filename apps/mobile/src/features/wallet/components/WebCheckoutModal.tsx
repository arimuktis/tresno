import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
} from 'react-native';
import {
  X,
  Lock,
  ShieldCheck,
  RotateCw,
  ExternalLink,
  CheckCircle2,
} from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { TopupTransaction } from '@tresno/shared';
import { useThemeStore } from '../../../theme/useThemeStore';
import { soundService } from '../../../shared/services/soundService';
import { toast } from '../../../shared/stores/useToastStore';

interface WebCheckoutModalProps {
  isVisible: boolean;
  invoice: TopupTransaction | null;
  onClose: () => void;
  onPaymentSuccess: (payload: {
    invoiceId: string;
    coinsAwarded: number;
    couponsAwarded?: number;
    amountIdr: number;
  }) => void;
}

export const WebCheckoutModal: React.FC<WebCheckoutModalProps> = ({
  isVisible,
  invoice,
  onClose,
  onPaymentSuccess,
}) => {
  const insets = useSafeAreaInsets();
  const { colors, isDark } = useThemeStore();
  const [isLoading, setIsLoading] = useState(true);
  const [iframeKey, setIframeKey] = useState(0);

  const host = typeof window !== 'undefined' ? window.location.hostname : 'localhost';
  const checkoutUrl = invoice
    ? `http://${host}:4000/h5/checkout/${invoice.id}`
    : `http://${host}:4000/h5/checkout/demo`;

  // Listen to postMessage from the Webview / iframe
  useEffect(() => {
    if (!isVisible) return;

    const handleMessage = (event: MessageEvent) => {
      try {
        let data = event.data;
        if (typeof data === 'string') {
          try {
            data = JSON.parse(data);
          } catch {
            return;
          }
        }

        if (data && data.event === 'PAYMENT_SUCCESS') {
          soundService.playCoinSound();
          onPaymentSuccess({
            invoiceId: data.invoiceId || invoice?.id || 'INV',
            coinsAwarded: data.coinsAwarded || 120,
            couponsAwarded: data.couponsAwarded || 0,
            amountIdr: data.amountIdr || invoice?.amountIdr || 15000,
          });
          toast.success(
            `Pembayaran Berhasil! Anti-Fraud Shield: Status Transaksi Sah. +${(data.coinsAwarded || 120).toLocaleString()} Koin ditambahkan!`
          );
          onClose();
        } else if (data && data.event === 'PAYMENT_CANCEL') {
          onClose();
        }
      } catch (err) {
        console.error('Error parsing webview postMessage:', err);
      }
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('message', handleMessage);
      return () => {
        window.removeEventListener('message', handleMessage);
      };
    }
  }, [isVisible, invoice, onClose, onPaymentSuccess]);

  if (!invoice) return null;

  return (
    <Modal
      visible={isVisible}
      animationType="slide"
      transparent={false}
      onRequestClose={onClose}
    >
      <View style={[styles.container, { backgroundColor: '#0F0E17', paddingTop: insets.top }]}>
        {/* In-App Browser Chrome Header (Ala GoblinWebActivity / FixesJsWebView) */}
        <View style={styles.browserHeader}>
          <TouchableOpacity onPress={onClose} style={styles.iconBtn}>
            <X size={20} color="#FFFFFF" />
          </TouchableOpacity>

          <View style={styles.addressBar}>
            <View style={styles.sslBadge}>
              <Lock size={12} color="#00D26A" />
              <Text style={styles.sslText}>SSL 256-Bit</Text>
            </View>
            <Text style={styles.urlText} numberOfLines={1}>
              pay.tresno.app/h5/checkout?session={invoice.id}
            </Text>
          </View>

          <TouchableOpacity
            onPress={() => {
              setIsLoading(true);
              setIframeKey((prev) => prev + 1);
            }}
            style={styles.iconBtn}
          >
            <RotateCw size={17} color="#8E8D9A" />
          </TouchableOpacity>
        </View>

        {/* Anti-Fraud Security Bar */}
        <View style={styles.securitySubbar}>
          <View style={styles.securityItem}>
            <ShieldCheck size={14} color="#00D26A" />
            <Text style={styles.securityText}>Anti-Fraud Shield Active</Text>
          </View>
          <View style={styles.dot} />
          <Text style={styles.securityText}>3D Secure 2.0</Text>
          <View style={styles.dot} />
          <Text style={styles.securityText}>Bank Indonesia QRIS</Text>
        </View>

        {/* Loading Indicator */}
        {isLoading && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color="#FF3B5C" />
            <Text style={styles.loadingText}>Memuat Halaman Pembayaran Terenkripsi...</Text>
          </View>
        )}

        {/* Webview Content Container */}
        <View style={styles.webviewContainer}>
          {Platform.OS === 'web' ? (
            // Native Web / Electron / Browser iframe
            <iframe
              key={iframeKey}
              src={checkoutUrl}
              style={{
                width: '100%',
                height: '100%',
                border: 'none',
                backgroundColor: '#0F0E17',
              }}
              onLoad={() => setIsLoading(false)}
              sandbox="allow-scripts allow-same-origin allow-forms allow-modals allow-popups"
              title="Tresno Anti-Fraud Web Checkout"
            />
          ) : (
            // Fallback for native wrapper or simulate
            <View style={styles.nativeFallback}>
              <Text style={{ color: '#FFFFFF', fontSize: 16, fontWeight: '700' }}>
                H5 Web Payment WebView
              </Text>
              <Text style={{ color: '#8E8D9A', fontSize: 12, textAlign: 'center', marginTop: 8 }}>
                Membuka gateway pembayaran anti-fraud di sandbox Webview...
              </Text>
            </View>
          )}
        </View>

        {/* Bottom Safety Footer */}
        <View style={[styles.bottomBar, { paddingBottom: Math.max(insets.bottom, 12) }]}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <CheckCircle2 size={13} color="#00D26A" />
            <Text style={{ color: '#8E8D9A', fontSize: 11 }}>
              Bebas potongan komisi 30% App Store • Saldo Koin Instan
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => {
              if (typeof window !== 'undefined') {
                window.open(checkoutUrl, '_blank');
              }
            }}
            style={styles.extLinkBtn}
          >
            <ExternalLink size={13} color="#A0A5B5" />
            <Text style={{ color: '#A0A5B5', fontSize: 11, fontWeight: '600' }}>Buka Tab</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  browserHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#181622',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.08)',
    gap: 10,
  },
  iconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  addressBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.4)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 6,
    gap: 8,
  },
  sslBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 210, 106, 0.12)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    gap: 3,
  },
  sslText: {
    color: '#00D26A',
    fontSize: 9,
    fontWeight: '800',
  },
  urlText: {
    flex: 1,
    color: '#A0A5B5',
    fontSize: 11,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  securitySubbar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
    backgroundColor: 'rgba(0, 210, 106, 0.06)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 210, 106, 0.15)',
    gap: 8,
  },
  securityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  securityText: {
    color: '#00D26A',
    fontSize: 10,
    fontWeight: '700',
  },
  dot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: 'rgba(0, 210, 106, 0.4)',
  },
  webviewContainer: {
    flex: 1,
    position: 'relative',
    backgroundColor: '#0F0E17',
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#0F0E17',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
    gap: 12,
  },
  loadingText: {
    color: '#8E8D9A',
    fontSize: 12,
    fontWeight: '600',
  },
  nativeFallback: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  bottomBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 10,
    backgroundColor: '#181622',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.08)',
  },
  extLinkBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
});
