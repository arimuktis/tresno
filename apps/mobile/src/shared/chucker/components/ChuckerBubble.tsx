import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Activity, X, AlertTriangle } from 'lucide-react-native';
import { useChuckerStore } from '../chuckerStore';
import { useThemeStore } from '../../../theme/useThemeStore';
import { toast } from '../../stores/useToastStore';

export const ChuckerBubble: React.FC = () => {
  const { colors, isDark } = useThemeStore();
  const { isBubbleVisible, toggleOpen, setBubbleVisible, getStats } = useChuckerStore();

  if (!isBubbleVisible) return null;

  const stats = getStats();
  const hasErrors = stats.errors > 0;

  const handleClose = (e: any) => {
    e.stopPropagation();
    setBubbleVisible(false);
    toast.info('Bubble Chucker disembunyikan. Anda dapat membukanya kembali dari menu Profil > Network Inspector.');
  };

  return (
    <View style={styles.container} pointerEvents="box-none">
      <TouchableOpacity
        style={[
          styles.bubble,
          {
            backgroundColor: isDark ? 'rgba(20, 24, 33, 0.92)' : 'rgba(255, 255, 255, 0.95)',
            borderColor: hasErrors ? '#FF4757' : colors.primary,
            shadowColor: hasErrors ? '#FF4757' : colors.primary,
          },
        ]}
        activeOpacity={0.85}
        onPress={toggleOpen}
      >
        {/* Pulse / Activity Icon */}
        <View style={[styles.iconWrapper, { backgroundColor: hasErrors ? 'rgba(255, 71, 87, 0.15)' : colors.primaryGlow }]}>
          {hasErrors ? (
            <AlertTriangle size={14} color="#FF4757" />
          ) : (
            <Activity size={14} color={colors.primary} />
          )}
        </View>

        {/* Counter Info */}
        <View style={styles.textCol}>
          <Text style={[styles.title, { color: colors.text }]}>CHUCKER</Text>
          <View style={styles.statsRow}>
            <Text style={[styles.counterText, { color: colors.textSecondary }]}>
              {stats.total} req
            </Text>
            {stats.errors > 0 && (
              <View style={styles.errorBadge}>
                <Text style={styles.errorText}>{stats.errors} err</Text>
              </View>
            )}
            {stats.pending > 0 && (
              <View style={styles.pendingBadge}>
                <Text style={styles.pendingText}>{stats.pending} ...</Text>
              </View>
            )}
          </View>
        </View>

        {/* Quick Close Button */}
        <TouchableOpacity
          style={styles.closeBtn}
          onPress={handleClose}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <X size={12} color={colors.textSecondary} />
        </TouchableOpacity>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 84, // Tepat di atas Bottom Navigation Bar
    right: 14,
    zIndex: 9999,
  },
  bubble: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 22,
    borderWidth: 1.5,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
    gap: 8,
  },
  iconWrapper: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textCol: {
    justifyContent: 'center',
  },
  title: {
    fontSize: 9.5,
    fontWeight: '900',
    letterSpacing: 0.6,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 1,
  },
  counterText: {
    fontSize: 10,
    fontWeight: '600',
  },
  errorBadge: {
    backgroundColor: '#FF4757',
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 6,
  },
  errorText: {
    color: '#FFFFFF',
    fontSize: 8.5,
    fontWeight: '800',
  },
  pendingBadge: {
    backgroundColor: '#FFA502',
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 6,
  },
  pendingText: {
    color: '#000000',
    fontSize: 8.5,
    fontWeight: '800',
  },
  closeBtn: {
    padding: 3,
    borderRadius: 10,
    marginLeft: 2,
  },
});
