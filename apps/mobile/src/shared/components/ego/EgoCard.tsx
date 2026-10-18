import React from 'react';
import { View, Text, StyleSheet, Platform, StyleProp, ViewStyle } from 'react-native';

export interface EgoCardProps {
  title?: string;
  titleItalicPart?: string;
  titleSuffix?: string;
  titleIcon?: React.ReactNode;
  subtitle?: string;
  children?: React.ReactNode;
  footerPillContent?: React.ReactNode;
  width?: number | string;
  minHeight?: number | string;
  style?: StyleProp<ViewStyle>;
}

export const EgoCard: React.FC<EgoCardProps> = ({
  title,
  titleItalicPart,
  titleSuffix,
  titleIcon,
  subtitle,
  children,
  footerPillContent,
  width = '100%',
  minHeight = 440,
  style,
}) => {
  return (
    <View
      style={[
        styles.cardContainer,
        {
          width: width as any,
          minHeight: minHeight as any,
        },
        style,
      ]}
    >
      {/* Card Header (Title & Subtitle) */}
      {(title || titleItalicPart) && (
        <View style={styles.header}>
          <Text style={styles.titleText}>
            {title}
            {titleItalicPart && (
              <Text style={styles.titleItalicText}>({titleItalicPart}) </Text>
            )}
            {titleIcon && <View style={styles.titleIconBox}>{titleIcon}</View>}
            {titleSuffix && <Text> {titleSuffix}</Text>}
          </Text>

          {Boolean(subtitle) && <Text style={styles.subtitleText}>{subtitle}</Text>}
        </View>
      )}

      {/* Main Body Slot */}
      <View style={styles.body}>{children}</View>

      {/* Floating Frosted Glass Footer Pill */}
      {footerPillContent && (
        <View style={styles.footerPill}>
          {footerPillContent}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.96)',
    borderRadius: 32,
    borderWidth: 1.2,
    borderColor: 'rgba(255, 255, 255, 0.9)',
    padding: 24,
    position: 'relative',
    overflow: 'hidden',
    justifyContent: 'space-between',
    ...Platform.select({
      web: {
        boxShadow:
          '0 24px 48px -12px rgba(16, 78, 203, 0.14), 0 2px 6px rgba(0, 0, 0, 0.04)',
        backdropFilter: 'blur(20px)',
      },
      default: {
        elevation: 6,
        shadowColor: '#104ECB',
        shadowOffset: { width: 0, height: 12 },
        shadowOpacity: 0.15,
        shadowRadius: 24,
      },
    }),
  },
  header: {
    marginBottom: 16,
    zIndex: 10,
  },
  titleText: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0F172A',
    lineHeight: 28,
    letterSpacing: -0.4,
  },
  titleItalicText: {
    fontStyle: 'italic',
    fontWeight: '500',
    color: '#0F172A',
  },
  titleIconBox: {
    marginHorizontal: 4,
  },
  subtitleText: {
    fontSize: 13,
    color: '#64748B',
    lineHeight: 18,
    marginTop: 6,
  },
  body: {
    flex: 1,
    zIndex: 5,
  },
  footerPill: {
    marginTop: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.72)',
    borderRadius: 20,
    borderWidth: 1.2,
    borderColor: 'rgba(255, 255, 255, 0.95)',
    padding: 14,
    zIndex: 10,
    ...Platform.select({
      web: {
        backdropFilter: 'blur(16px)',
        boxShadow: '0 8px 20px rgba(0, 0, 0, 0.04)',
      },
      default: {},
    }),
  },
});
