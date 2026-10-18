import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import {
  X,
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  Lock,
  Cpu,
  Smartphone,
  Server,
  RefreshCw,
  Bug,
  Key,
} from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useThemeStore } from '../../theme/useThemeStore';
import { securityGuardService } from './securityGuardService';
import { PlayIntegrityVerdict, DeviceSecurityVerdict } from '@tresno/shared';
import { toast } from '../stores/useToastStore';

interface SecurityInspectorModalProps {
  isVisible: boolean;
  onClose: () => void;
}

export const SecurityInspectorModal: React.FC<SecurityInspectorModalProps> = ({
  isVisible,
  onClose,
}) => {
  const insets = useSafeAreaInsets();
  const { colors, isDark } = useThemeStore();

  const [verdict, setVerdict] = useState<DeviceSecurityVerdict>(securityGuardService.getLastVerdict());
  const [playIntegrityVerdict, setPlayIntegrityVerdict] = useState<PlayIntegrityVerdict | null>(null);
  const [isLoadingIntegrity, setIsLoadingIntegrity] = useState(false);
  const [appCheckToken, setAppCheckToken] = useState<string>('');

  const handleRunScan = async () => {
    const res = await securityGuardService.runHeuristicScan();
    setVerdict(res);
    toast.success('Pemindaian keamanan perangkat selesai.');
  };

  const handleTestPlayIntegrity = async () => {
    setIsLoadingIntegrity(true);
    const res = await securityGuardService.requestPlayIntegrityAttestation('admin_tester');
    setIsLoadingIntegrity(false);
    setPlayIntegrityVerdict(res);
    if (res.isValid) {
      toast.success('Attestasi Google Play Integrity: VALID & MEETS_DEVICE_INTEGRITY!');
    } else {
      toast.error(res.error || 'Play Integrity gagal diverifikasi.');
    }
  };

  const handleFetchAppCheck = async () => {
    const tok = await securityGuardService.getAppCheckToken();
    setAppCheckToken(tok);
    toast.success('Token Firebase App Check berhasil diterbitkan.');
  };

  const handleSimulate = (type: 'ROOT' | 'FRIDA' | 'EMULATOR' | 'CLEAN') => {
    const sim = securityGuardService.simulateThreat(type);
    setVerdict(sim);
    if (type === 'CLEAN') {
      toast.success('Status perangkat dikembalikan ke: CLEAN / SECURE');
    } else {
      toast.error(`Simulasi ${type} aktif: Skor risiko melonjak ke 0.95!`);
    }
  };

  const isSecure = verdict.status === 'SECURE';

  return (
    <Modal visible={isVisible} animationType="slide" transparent={false} onRequestClose={onClose}>
      <View style={[styles.container, { backgroundColor: colors.background, paddingTop: insets.top }]}>
        {/* Header */}
        <View style={[styles.header, { borderBottomColor: colors.border, backgroundColor: colors.surfaceCard }]}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <ShieldCheck size={22} color={isSecure ? '#00D26A' : '#FF4B4B'} />
            <View>
              <Text style={[styles.title, { color: colors.text }]}>Security & Anti-Fraud Center</Text>
              <Text style={{ color: colors.textSecondary, fontSize: 11 }}>
                Play Integrity • App Check • Anti-Root & Frida
              </Text>
            </View>
          </View>
          <TouchableOpacity onPress={onClose} style={[styles.closeBtn, { backgroundColor: colors.surfaceGlass }]}>
            <X size={18} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.scroll} contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
          {/* Status Banner */}
          <View
            style={[
              styles.statusBanner,
              {
                backgroundColor: isSecure ? 'rgba(0, 210, 106, 0.1)' : 'rgba(255, 75, 75, 0.1)',
                borderColor: isSecure ? '#00D26A' : '#FF4B4B',
              },
            ]}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
              {isSecure ? <ShieldCheck size={28} color="#00D26A" /> : <ShieldAlert size={28} color="#FF4B4B Prim" />}
              <View style={{ flex: 1 }}>
                <Text style={{ color: isSecure ? '#00D26A' : '#FF4B4B', fontWeight: '900', fontSize: 15 }}>
                  STATUS PERANGKAT: {verdict.status}
                </Text>
                <Text style={{ color: colors.textSecondary, fontSize: 11, marginTop: 2 }}>
                  Skor Risiko Fraud: {(verdict.riskScore * 100).toFixed(0)}% • Terakhir dipindai:{' '}
                  {new Date(verdict.checkedAt).toLocaleTimeString('id-ID')}
                </Text>
              </View>
            </View>

            {verdict.violationReasons.length > 0 && (
              <View style={styles.violationBox}>
                <Text style={{ color: '#FF4B4B', fontSize: 11, fontWeight: '700', marginBottom: 4 }}>
                  Pelanggaran Integritas Terdeteksi:
                </Text>
                {verdict.violationReasons.map((r, i) => (
                  <Text key={i} style={{ color: '#FFB8B8', fontSize: 10.5, lineHeight: 15 }}>
                    • {r}
                  </Text>
                ))}
              </View>
            )}
          </View>

          {/* Section 1: Heuristic Security Modules */}
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
            MODUL PROTEKSI NATIVE & HEURISTIK
          </Text>

          <View style={[styles.card, { backgroundColor: colors.surfaceCard, borderColor: colors.border }]}>
            <View style={styles.checkRow}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                <Smartphone size={18} color={verdict.isRooted ? '#FF4B4B' : '#00D26A'} />
                <View>
                  <Text style={[styles.checkLabel, { color: colors.text }]}>Anti-Root & Magisk Detection</Text>
                  <Text style={{ color: colors.textSecondary, fontSize: 11 }}>
                    Memeriksa /system/xbin/su, Magisk mounts, & test-keys
                  </Text>
                </View>
              </View>
              <View
                style={[
                  styles.pill,
                  { backgroundColor: verdict.isRooted ? 'rgba(255, 75, 75, 0.15)' : 'rgba(0, 210, 106, 0.15)' },
                ]}
              >
                <Text style={{ color: verdict.isRooted ? '#FF4B4B' : '#00D26A', fontSize: 10, fontWeight: '800' }}>
                  {verdict.isRooted ? 'ROOTED' : 'CLEAN'}
                </Text>
              </View>
            </View>

            <View style={[styles.divider, { backgroundColor: colors.border }]} />

            <View style={styles.checkRow}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                <Lock size={18} color={verdict.isJailbroken ? '#FF4B4B' : '#00D26A'} />
                <View>
                  <Text style={[styles.checkLabel, { color: colors.text }]}>Anti-Jailbreak iOS Shield</Text>
                  <Text style={{ color: colors.textSecondary, fontSize: 11 }}>
                    Memeriksa Cydia, Sileo, Substrate & Sandbox escape
                  </Text>
                </View>
              </View>
              <View
                style={[
                  styles.pill,
                  { backgroundColor: verdict.isJailbroken ? 'rgba(255, 75, 75, 0.15)' : 'rgba(0, 210, 106, 0.15)' },
                ]}
              >
                <Text style={{ color: verdict.isJailbroken ? '#FF4B4B' : '#00D26A', fontSize: 10, fontWeight: '800' }}>
                  {verdict.isJailbroken ? 'JAILBROKEN' : 'CLEAN'}
                </Text>
              </View>
            </View>

            <View style={[styles.divider, { backgroundColor: colors.border }]} />

            <View style={styles.checkRow}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                <Bug size={18} color={verdict.isHookDetected ? '#FF4B4B' : '#00D26A'} />
                <View>
                  <Text style={[styles.checkLabel, { color: colors.text }]}>Anti-Frida & Xposed Hooking</Text>
                  <Text style={{ color: colors.textSecondary, fontSize: 11 }}>
                    Memindai port 27042, injected dylib, & memory tampering
                  </Text>
                </View>
              </View>
              <View
                style={[
                  styles.pill,
                  { backgroundColor: verdict.isHookDetected ? 'rgba(255, 75, 75, 0.15)' : 'rgba(0, 210, 106, 0.15)' },
                ]}
              >
                <Text style={{ color: verdict.isHookDetected ? '#FF4B4B' : '#00D26A', fontSize: 10, fontWeight: '800' }}>
                  {verdict.isHookDetected ? 'HOOK DETECTED' : 'UNHOOKED'}
                </Text>
              </View>
            </View>

            <View style={[styles.divider, { backgroundColor: colors.border }]} />

            <View style={styles.checkRow}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                <Cpu size={18} color={verdict.isEmulator ? '#FFA502' : '#00D26A'} />
                <View>
                  <Text style={[styles.checkLabel, { color: colors.text }]}>Anti-Emulator & Bot Farm</Text>
                  <Text style={{ color: colors.textSecondary, fontSize: 11 }}>
                    Mendeteksi Nox, BlueStacks, LDPlayer, & QEMU
                  </Text>
                </View>
              </View>
              <View
                style={[
                  styles.pill,
                  { backgroundColor: verdict.isEmulator ? 'rgba(255, 165, 2, 0.15)' : 'rgba(0, 210, 106, 0.15)' },
                ]}
              >
                <Text style={{ color: verdict.isEmulator ? '#FFA502' : '#00D26A', fontSize: 10, fontWeight: '800' }}>
                  {verdict.isEmulator ? 'EMULATOR' : 'REAL DEVICE'}
                </Text>
              </View>
            </View>
          </View>

          {/* Section 2: Google Play Integrity API */}
          <Text style={[styles.sectionTitle, { color: colors.textSecondary, marginTop: 20 }]}>
            GOOGLE PLAY INTEGRITY API (HARDWARE-BACKED ATTESTATION)
          </Text>

          <View style={[styles.card, { backgroundColor: colors.surfaceCard, borderColor: colors.border }]}>
            <Text style={{ color: colors.text, fontSize: 12, lineHeight: 16 }}>
              Memvalidasi integritas biner resmi dari Google Play Store dan membuktikan perangkat lolos sertifikasi
              hardware Play Protect.
            </Text>

            <TouchableOpacity
              style={[styles.actionBtn, { backgroundColor: colors.primary, marginTop: 12 }]}
              onPress={handleTestPlayIntegrity}
              disabled={isLoadingIntegrity}
            >
              {isLoadingIntegrity ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <>
                  <Key size={16} color="#FFFFFF" style={{ marginRight: 6 }} />
                  <Text style={{ color: '#FFFFFF', fontWeight: '800', fontSize: 12 }}>
                    Uji Attestasi Play Integrity (Live Nonce)
                  </Text>
                </>
              )}
            </TouchableOpacity>

            {playIntegrityVerdict && (
              <View style={[styles.verdictResultBox, { backgroundColor: colors.surfaceGlass }]}>
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Text style={{ color: colors.text, fontWeight: '700', fontSize: 12 }}>Hasil Attestasi Google:</Text>
                  <Text
                    style={{
                      color: playIntegrityVerdict.isValid ? '#00D26A' : '#FF4B4B',
                      fontWeight: '800',
                      fontSize: 11,
                    }}
                  >
                    {playIntegrityVerdict.isValid ? 'VERIFIED' : 'FAILED'}
                  </Text>
                </View>

                <View style={{ marginTop: 6, gap: 3 }}>
                  <Text style={{ color: colors.textSecondary, fontSize: 11 }}>
                    • Device Integrity:{' '}
                    <b style={{ color: colors.text }}>{playIntegrityVerdict.deviceIntegrity.join(', ') || 'NONE'}</b>
                  </Text>
                  <Text style={{ color: colors.textSecondary, fontSize: 11 }}>
                    • App Recognition:{' '}
                    <b style={{ color: colors.text }}>{playIntegrityVerdict.appRecognitionVerdict}</b>
                  </Text>
                  <Text style={{ color: colors.textSecondary, fontSize: 11 }}>
                    • Licensing Status: <b style={{ color: colors.text }}>{playIntegrityVerdict.appLicensingVerdict}</b>
                  </Text>
                </View>
              </View>
            )}
          </View>

          {/* Section 3: Firebase App Check */}
          <Text style={[styles.sectionTitle, { color: colors.textSecondary, marginTop: 20 }]}>
            FIREBASE APP CHECK (BACKEND API GATEWAY SHIELD)
          </Text>

          <View style={[styles.card, { backgroundColor: colors.surfaceCard, borderColor: colors.border }]}>
            <Text style={{ color: colors.text, fontSize: 12, lineHeight: 16 }}>
              Menyematkan header <code style={{ color: colors.primary }}>X-Firebase-AppCheck</code> pada semua request ke
              Fastify backend untuk menolak bot / scraper ilegal.
            </Text>

            <TouchableOpacity
              style={[styles.actionBtn, { backgroundColor: 'rgba(0, 210, 106, 0.15)', borderColor: '#00D26A', borderWidth: 1, marginTop: 12 }]}
              onPress={handleFetchAppCheck}
            >
              <Server size={16} color="#00D26A" style={{ marginRight: 6 }} />
              <Text style={{ color: '#00D26A', fontWeight: '800', fontSize: 12 }}>
                Generate App Check Attestation Token
              </Text>
            </TouchableOpacity>

            {appCheckToken ? (
              <View style={[styles.verdictResultBox, { backgroundColor: colors.surfaceGlass, marginTop: 10 }]}>
                <Text style={{ color: colors.textSecondary, fontSize: 10.5 }}>Token Terdaftar:</Text>
                <Text style={{ color: '#00D26A', fontSize: 11, fontFamily: 'monospace', marginTop: 2 }}>
                  {appCheckToken}
                </Text>
              </View>
            ) : null}
          </View>

          {/* Section 4: Threat Simulation Tools for Testing */}
          <Text style={[styles.sectionTitle, { color: colors.textSecondary, marginTop: 20 }]}>
            SIMULATOR ANCAMAN (UNTUK UJI COBA KEAMANAN)
          </Text>

          <View style={[styles.card, { backgroundColor: colors.surfaceCard, borderColor: colors.border, gap: 8 }]}>
            <Text style={{ color: colors.textSecondary, fontSize: 11 }}>
              Uji respons aplikasi saat menghadapi serangan fraud secara terkontrol:
            </Text>

            <View style={{ flexDirection: 'row', gap: 6, flexWrap: 'wrap' }}>
              <TouchableOpacity
                onPress={() => handleSimulate('ROOT')}
                style={[styles.simBtn, { backgroundColor: 'rgba(255, 75, 75, 0.15)', borderColor: '#FF4B4B' }]}
              >
                <Text style={{ color: '#FF4B4B', fontSize: 11, fontWeight: '700' }}>Simulasi Root Magisk</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => handleSimulate('FRIDA')}
                style={[styles.simBtn, { backgroundColor: 'rgba(255, 75, 75, 0.15)', borderColor: '#FF4B4B' }]}
              >
                <Text style={{ color: '#FF4B4B', fontSize: 11, fontWeight: '700' }}>Simulasi Frida Hook</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => handleSimulate('EMULATOR')}
                style={[styles.simBtn, { backgroundColor: 'rgba(255, 165, 2, 0.15)', borderColor: '#FFA502' }]}
              >
                <Text style={{ color: '#FFA502', fontSize: 11, fontWeight: '700' }}>Simulasi Emulator Nox</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => handleSimulate('CLEAN')}
                style={[styles.simBtn, { backgroundColor: 'rgba(0, 210, 106, 0.15)', borderColor: '#00D26A' }]}
              >
                <Text style={{ color: '#00D26A', fontSize: 11, fontWeight: '700' }}>Reset ke Normal (Clean)</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  title: {
    fontSize: 15,
    fontWeight: '800',
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scroll: {
    flex: 1,
  },
  statusBanner: {
    borderRadius: 16,
    borderWidth: 1.5,
    padding: 16,
    marginBottom: 16,
  },
  violationBox: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 75, 75, 0.2)',
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  card: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 14,
  },
  checkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  checkLabel: {
    fontSize: 13,
    fontWeight: '700',
  },
  pill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  divider: {
    height: 1,
    marginVertical: 4,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
  },
  verdictResultBox: {
    padding: 12,
    borderRadius: 10,
    marginTop: 12,
  },
  simBtn: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
  },
});
