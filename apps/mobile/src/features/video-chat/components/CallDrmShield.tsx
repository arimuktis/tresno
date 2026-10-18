import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { ShieldAlert, AlertCircle, AlertTriangle } from 'lucide-react-native';
import { useThemeStore } from '../../../theme/useThemeStore';
import { useTranslation } from '../../../i18n';

interface CallDrmShieldProps {
  isActive: boolean;
  reason: string | null;
  violationCount: number;
  onDismiss: () => void;
}

export const CallDrmShield: React.FC<CallDrmShieldProps> = ({
  isActive,
  reason,
  violationCount,
  onDismiss,
}) => {
  const { colors, isDark } = useThemeStore();
  const { t } = useTranslation();

  if (!isActive) return null;

  const isTerminated = violationCount >= 2;

  return (
    <View style={styles.overlay}>
      <View
        style={[
          styles.dialogCard,
          {
            backgroundColor: isDark ? 'rgba(18, 18, 28, 0.96)' : 'rgba(255, 255, 255, 0.98)',
            borderColor: colors.danger,
          },
          Platform.OS === 'web' && ({
            boxShadow: `0 20px 50px rgba(0, 0, 0, 0.6), 0 0 30px rgba(255, 46, 99, 0.35)`,
            backdropFilter: 'blur(24px)',
          } as any),
        ]}
      >
        {/* Shield Icon Badge */}
        <View style={[styles.shieldIconCircle, { backgroundColor: 'rgba(255, 46, 99, 0.15)' }]}>
          <ShieldAlert size={36} color={colors.danger} />
        </View>

        <Text style={[styles.title, { color: colors.danger }]}>
          {t('call.shieldTitle')}
        </Text>

        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          {t('call.shieldDesc')}
        </Text>

        {Boolean(reason) && (
          <View style={styles.reasonBox}>
            <Text style={styles.reasonLabel}>{t('call.systemDetection')}</Text>
            <Text style={[styles.reasonText, { color: colors.primary }]}>{reason}</Text>
          </View>
        )}

        <View style={styles.statusRow}>
          {isTerminated ? (
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <AlertCircle size={15} color={colors.danger} style={{ marginRight: 6 }} />
              <Text style={[styles.warningCount, { color: colors.danger }]}>
                Batas pelanggaran terlampaui. Panggilan dihentikan.
              </Text>
            </View>
          ) : (
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <AlertTriangle size={15} color={colors.gold} style={{ marginRight: 6 }} />
              <Text style={[styles.warningCount, { color: colors.gold }]}>
                Peringatan Keamanan: {violationCount} dari 2 kali percobaan.
              </Text>
            </View>
          )}
        </View>

        {!isTerminated && (
          <TouchableOpacity
            style={[styles.resumeButton, { backgroundColor: colors.primary }]}
            activeOpacity={0.85}
            onPress={onDismiss}
          >
            <Text style={styles.resumeButtonText}>{t('call.btnUnderstand')}</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#000000',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    zIndex: 999,
  },
  dialogCard: {
    width: '100%',
    maxWidth: 380,
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1.5,
  },
  shieldIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  shieldIcon: {
    fontSize: 32,
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: 0.5,
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 19,
    marginBottom: 16,
  },
  reasonBox: {
    width: '100%',
    backgroundColor: 'rgba(0, 0, 0, 0.25)',
    padding: 10,
    borderRadius: 12,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  reasonLabel: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.5)',
    fontWeight: '600',
    marginBottom: 2,
  },
  reasonText: {
    fontSize: 12,
    fontWeight: '700',
  },
  statusRow: {
    marginBottom: 20,
    alignItems: 'center',
  },
  warningCount: {
    fontSize: 12,
    fontWeight: '700',
    textAlign: 'center',
  },
  resumeButton: {
    width: '100%',
    height: 46,
    borderRadius: 23,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 4,
  },
  resumeButtonText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 13,
  },
});
