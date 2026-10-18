import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Flame, Sparkles, MessageCircle, User, LucideIcon } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useThemeStore } from '../../../theme/useThemeStore';
import { useTranslation } from '../../../i18n';
import { getGlassDockNavStyle } from '../../../theme/glassStyles';

export type MainTabKey = 'match' | 'destiny' | 'messages' | 'mine';

interface BottomNavBarProps {
  activeTab: MainTabKey;
  onTabChange: (tab: MainTabKey) => void;
  unreadCount?: number;
}

export const BottomNavBar: React.FC<BottomNavBarProps> = ({
  activeTab,
  onTabChange,
  unreadCount = 2,
}) => {
  const insets = useSafeAreaInsets();
  const { colors, isDark } = useThemeStore();
  const { t } = useTranslation();

  const tabs: {
    key: MainTabKey;
    label: string;
    icon: LucideIcon;
  }[] = [
    {
      key: 'match',
      label: t('nav.match'),
      icon: Flame,
    },
    {
      key: 'destiny',
      label: t('nav.destiny'),
      icon: Sparkles,
    },
    {
      key: 'messages',
      label: t('nav.messages'),
      icon: MessageCircle,
    },
    {
      key: 'mine',
      label: t('nav.mine'),
      icon: User,
    },
  ];

  const glassDock = getGlassDockNavStyle(colors, isDark);

  return (
    <View style={[styles.outerWrapper, { paddingBottom: Math.max(insets.bottom, 10) }]}>
      <View style={[styles.navContainer, glassDock]}>
        {tabs.map((tab) => {
          const isActive = activeTab === tab.key;
          const IconComp = tab.icon;

          return (
            <TouchableOpacity
              key={tab.key}
              activeOpacity={0.7}
              onPress={() => onTabChange(tab.key)}
              style={[
                styles.tabButton,
                {
                  backgroundColor: isActive ? colors.liquidGlow : 'transparent',
                  borderColor: isActive
                    ? (isDark ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.08)')
                    : 'transparent',
                },
              ]}
            >
              {/* Fixed Size Icon Wrapper */}
              <View style={styles.iconContainer}>
                <IconComp
                  size={21}
                  color={isActive ? colors.primary : colors.textSecondary}
                  fill={isActive ? colors.primary : 'none'}
                  strokeWidth={isActive ? 2.0 : 1.8}
                />

                {/* Badge Notifikasi Pesan */}
                {tab.key === 'messages' && unreadCount > 0 && (
                  <View style={[styles.unreadBadge, { backgroundColor: colors.primary }]}>
                    <Text style={styles.unreadText}>{unreadCount}</Text>
                  </View>
                )}
              </View>

              {/* Fixed Height Text Label */}
              <Text
                style={[
                  styles.tabLabel,
                  {
                    color: isActive ? colors.primary : colors.textSecondary,
                    fontWeight: isActive ? '700' : '600',
                  },
                ]}
                numberOfLines={1}
              >
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  outerWrapper: {
    paddingHorizontal: 16,
    paddingBottom: 10,
    backgroundColor: 'transparent',
  },
  navContainer: {
    flexDirection: 'row',
    height: 62,
    borderRadius: 31,
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 6,
  },
  tabButton: {
    flex: 1,
    height: 50,
    borderRadius: 25,
    marginHorizontal: 3,
    borderWidth: 1.2,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  iconContainer: {
    position: 'relative',
    width: 26,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabLabel: {
    fontSize: 10.5,
    height: 14,
    lineHeight: 14,
    textAlign: 'center',
    marginTop: 2,
    letterSpacing: 0.1,
  },
  unreadBadge: {
    position: 'absolute',
    top: -4,
    right: -10,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
  unreadText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '900',
  },
});
