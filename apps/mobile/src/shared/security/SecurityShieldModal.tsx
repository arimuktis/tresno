import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity } from 'react-native';
import { ShieldAlert, AlertTriangle, RefreshCw, XCircle } from 'lucide-react-native';
import { useThemeStore } from '../../theme/useThemeStore';
import { DeviceSecurityVerdict } from '@tresno/shared';

interface SecurityShieldModalProps {
  isVisible: boolean;
  verdict: DeviceSecurityVerdict;
  onRetry: () => void;
  onClose: () => void;
}

export const SecurityShieldModal: React.FC<SecurityShieldModalProps> = ({
  isVisible,
  verdict,
  onRetry,
  onClose,
}) => {
  const { colors } = useThemeStore();

  if (!isVisible) return null;

  return (
    <Modal visible={isVisible} animationType="fade" transparent={true}>
      <View style={styles.backdrop}>
        <View style={[styles.dialogCard, { backgroundColor: '#181622', borderColor: '#FF4B4B' }]}>
          <View style={styles.iconCircle}>
            <ShieldAlert size={36} color="#FF4B4B" />
          </View>

          <Text style={styles.title}>PERINGATAN INTEGRITAS SISTEM</Text>
          <Text style={styles.subtitle}>
            Akses ke fitur keuangan &amp; panggilan dibatasi demi mencegah fraud dan penyalahgunaan akun.
          </Text>

          <View style={styles.reasonsBox}>
            <Text style={{ color: '#FF4B4B', fontSize: 11, fontWeight: '700', marginBottom: 6 }}>
              Indikator Pelanggaran Terdeteksi:
            </Text>
            {verdict.violationReasons.map((reason, idx) => (
              <View key={idx} style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 6, marginBottom: 4 }}>
                <AlertTriangle size={12} color="#FF4B4B" style={{ marginTop: 2 }} />
                <Text style={{ color: '#E0E2EC', fontSize: 11.5, flex: 1, lineHeight: 16 }}>{reason}</Text>
              </View>
            ))}
          </View>

          <Text style={styles.noticeFooter}>
            Sistem Tresno mewajibkan perangkat resmi yang tidak dimodifikasi (non-root / non-jailbreak) serta bebas dari
            alat instrumentasi dinamis (Frida / Xposed) sesuai kebijakan Google Play Protect.
          </Text>

          <View style={styles.actions}>
            <TouchableOpacity onPress={onRetry} style={styles.retryBtn}>
              <RefreshCw size={15} color="#FFFFFF" style={{ marginRight: 6 }} />
              <Text style={{ color: '#FFFFFF', fontWeight: '800', fontSize: 12 }}>Pindai Ulang Perangkat</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Text style={{ color: '#8E8D9A', fontWeight: '600', fontSize: 12 }}>Abaikan (Mode Terbatas)</Text>
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
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  dialogCard: {
    width: '92%',
    maxWidth: 380,
    borderRadius: 24,
    borderWidth: 1.5,
    padding: 24,
    alignItems: 'center',
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(255, 75, 75, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  title: {
    color: '#FF4B4B',
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 0.5,
    textAlign: 'center',
  },
  subtitle: {
    color: '#A0A5B5',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 16,
  },
  reasonsBox: {
    width: '100%',
    backgroundColor: 'rgba(255, 75, 75, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255, 75, 75, 0.25)',
    borderRadius: 14,
    padding: 14,
    marginVertical: 16,
  },
  noticeFooter: {
    color: '#6E7180',
    fontSize: 10.5,
    textAlign: 'center',
    lineHeight: 15,
    marginBottom: 20,
  },
  actions: {
    width: '100%',
    gap: 10,
  },
  retryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FF4B4B',
    paddingVertical: 12,
    borderRadius: 14,
  },
  closeBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
  },
});
