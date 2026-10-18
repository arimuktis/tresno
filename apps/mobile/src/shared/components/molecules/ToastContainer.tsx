import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { CheckCircle, AlertCircle, AlertTriangle, Info, X } from 'lucide-react-native';
import { useToastStore, ToastItem } from '../../stores/useToastStore';
import { useThemeStore } from '../../../theme/useThemeStore';

export const ToastContainer: React.FC = () => {
  const { toasts, hide } = useToastStore();
  const { colors, isDark } = useThemeStore();

  if (toasts.length === 0) return null;

  return (
    <View style={styles.container} pointerEvents="box-none">
      {toasts.map((toast: ToastItem) => {
        let accentColor = colors.primary;
        let icon: React.ReactNode = <Info size={18} color={colors.primary} style={{ marginRight: 10 }} />;

        if (toast.type === 'success') {
          accentColor = '#10B981';
          icon = <CheckCircle size={18} color="#10B981" style={{ marginRight: 10 }} />;
        } else if (toast.type === 'error') {
          accentColor = '#EF4444';
          icon = <AlertCircle size={18} color="#EF4444" style={{ marginRight: 10 }} />;
        } else if (toast.type === 'warning') {
          accentColor = '#F59E0B';
          icon = <AlertTriangle size={18} color="#F59E0B" style={{ marginRight: 10 }} />;
        }

        return (
          <View
            key={toast.id}
            style={[
              styles.toastCard,
              {
                backgroundColor: isDark ? 'rgba(20, 20, 30, 0.95)' : 'rgba(255, 255, 255, 0.98)',
                borderColor: isDark ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.08)',
              },
              Platform.OS === 'web' && ({
                backdropFilter: 'blur(20px)',
                boxShadow: `0 12px 30px rgba(0, 0, 0, 0.35), 0 0 16px ${accentColor}33`,
              } as any),
            ]}
          >
            {/* Color Accent Indicator Strip */}
            <View style={[styles.colorStrip, { backgroundColor: accentColor }]} />

            <View style={styles.contentRow}>
              {icon}
              <Text
                style={[styles.toastText, { color: isDark ? '#FFFFFF' : '#1F2937' }]}
                numberOfLines={2}
              >
                {toast.message}
              </Text>

              {/* Action Button */}
              {toast.action && (
                <TouchableOpacity
                  style={[styles.actionBtn, { borderColor: accentColor }]}
                  onPress={toast.action.onPress}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.actionText, { color: accentColor }]}>
                    {toast.action.label}
                  </Text>
                </TouchableOpacity>
              )}

              {/* Dismiss Button */}
              <TouchableOpacity
                style={styles.closeBtn}
                onPress={() => hide(toast.id)}
                activeOpacity={0.7}
              >
                <X size={14} color={isDark ? '#9CA3AF' : '#6B7280'} />
              </TouchableOpacity>
            </View>
          </View>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: Platform.OS === 'web' ? 16 : 48,
    left: 16,
    right: 16,
    zIndex: 99998,
    alignItems: 'center',
  },
  toastCard: {
    width: '100%',
    maxWidth: 380,
    borderRadius: 16,
    marginBottom: 8,
    borderWidth: 1,
    overflow: 'hidden',
    position: 'relative',
  },
  colorStrip: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 14,
    paddingLeft: 16,
  },
  toastIcon: {
    fontSize: 16,
    marginRight: 10,
  },
  toastText: {
    flex: 1,
    fontSize: 13,
    fontWeight: '600',
    lineHeight: 18,
  },
  actionBtn: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    borderWidth: 1,
    marginRight: 8,
  },
  actionText: {
    fontSize: 11,
    fontWeight: '700',
  },
  closeBtn: {
    padding: 4,
  },
  closeText: {
    fontSize: 12,
    color: 'rgba(156, 163, 175, 0.9)',
    fontWeight: '700',
  },
});
