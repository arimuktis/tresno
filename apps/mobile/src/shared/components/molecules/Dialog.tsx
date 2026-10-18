import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, Platform } from 'react-native';
import { Sparkles, AlertCircle, AlertTriangle } from 'lucide-react-native';
import { useThemeStore } from '../../../theme/useThemeStore';
import { Button } from '../atoms/Button';

export interface DialogProps {
  isVisible: boolean;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel?: () => void;
  variant?: 'primary' | 'danger' | 'warning';
  icon?: React.ReactNode | string;
}

export const Dialog: React.FC<DialogProps> = ({
  isVisible,
  title,
  description,
  confirmText = 'Konfirmasi',
  cancelText = 'Batal',
  onConfirm,
  onCancel,
  variant = 'primary',
  icon,
}) => {
  const { colors, isDark } = useThemeStore();

  if (!isVisible) return null;

  let accentColor = colors.primary;
  let defaultIcon: React.ReactNode = <Sparkles size={28} color={colors.primary} />;

  if (variant === 'danger') {
    accentColor = colors.danger;
    defaultIcon = <AlertCircle size={28} color={colors.danger} />;
  } else if (variant === 'warning') {
    accentColor = '#F59E0B';
    defaultIcon = <AlertTriangle size={28} color="#F59E0B" />;
  }

  const dialogIcon = icon || defaultIcon;

  return (
    <Modal visible={isVisible} transparent animationType="fade">
      <View style={styles.backdrop}>
        <View
          style={[
            styles.card,
            {
              backgroundColor: isDark ? 'rgba(20, 20, 32, 0.96)' : 'rgba(255, 255, 255, 0.98)',
              borderColor: isDark ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.1)',
            },
            Platform.OS === 'web' && ({
              backdropFilter: 'blur(24px)',
              boxShadow: `0 20px 48px rgba(0, 0, 0, 0.5), 0 0 24px ${accentColor}33`,
            } as any),
          ]}
        >
          {/* Header Icon */}
          <View style={[styles.iconCircle, { backgroundColor: `${accentColor}18` }]}>
            {typeof dialogIcon === 'string' ? (
              <Text style={styles.iconText}>{dialogIcon}</Text>
            ) : (
              dialogIcon
            )}
          </View>

          {/* Title & Description */}
          <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
          <Text style={[styles.description, { color: colors.textSecondary }]}>
            {description}
          </Text>

          {/* Action Buttons Row */}
          <View style={styles.buttonRow}>
            {Boolean(onCancel) && (
              <Button
                title={cancelText}
                variant="outline"
                size="md"
                onPress={onCancel!}
                style={styles.cancelBtn}
              />
            )}
            <Button
              title={confirmText}
              variant={variant === 'danger' ? 'danger' : 'primary'}
              size="md"
              onPress={onConfirm}
              style={styles.confirmBtn}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    zIndex: 99999,
  },
  card: {
    width: '92%',
    maxWidth: 380,
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1.2,
  },
  iconCircle: {
    width: 58,
    height: 58,
    borderRadius: 29,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  iconText: {
    fontSize: 28,
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 8,
    letterSpacing: -0.3,
  },
  description: {
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 19,
    marginBottom: 24,
  },
  buttonRow: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-between',
    gap: 10,
  },
  cancelBtn: {
    flex: 1,
  },
  confirmBtn: {
    flex: 1,
  },
});
