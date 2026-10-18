import React from 'react';
import { View, Text, StyleSheet, Platform, StyleProp, ViewStyle, useWindowDimensions } from 'react-native';
import { EgoPrismaticEmblem } from './EgoPrismaticEmblem';

export interface EgoAtmosphereProps {
  title?: string;
  subtitle?: string;
  emblemSize?: number;
  children?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}

export const EgoAtmosphere: React.FC<EgoAtmosphereProps> = ({
  title = 'Welcome aboard!',
  subtitle = 'Follow the guides below to get started',
  emblemSize: customEmblemSize,
  children,
  style,
}) => {
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();
  const isCompact = windowHeight < 720 || windowWidth < 380;
  const effectiveEmblemSize = customEmblemSize || (isCompact ? 54 : 68);

  return (
    <View style={[styles.container, style]}>
      {/* Background Gradient Mesh */}
      <View style={styles.gradientBackground} />

      {/* Decorative Specular Atmospheric Orbs */}
      <View style={styles.specularOrbLeft} />
      <View style={styles.specularOrbRight} />

      {/* Hero Header Section */}
      <View
        style={[
          styles.headerSection,
          isCompact && { paddingTop: 32, paddingBottom: 20 },
        ]}
      >
        {/* 3D Iridescent Liquid Glass Emblem */}
        <View style={[styles.emblemContainer, isCompact && { marginBottom: 12 }]}>
          <EgoPrismaticEmblem size={effectiveEmblemSize} />
        </View>

        {/* Hero Title */}
        <Text
          style={[
            styles.heroTitle,
            isCompact && { fontSize: 36, lineHeight: 40, letterSpacing: -0.8 },
          ]}
        >
          {title}
        </Text>

        {/* Subtitle */}
        {Boolean(subtitle) && (
          <Text style={[styles.heroSubtitle, isCompact && { fontSize: 13, marginTop: 6 }]}>
            {subtitle}
          </Text>
        )}
      </View>

      {/* Children Slot (e.g. Card Carousel / Content) */}
      <View style={styles.contentSection}>{children}</View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    minHeight: '100%',
    position: 'relative',
    overflow: 'hidden',
  },
  gradientBackground: {
    ...StyleSheet.absoluteFillObject,
    ...Platform.select({
      web: {
        background:
          'linear-gradient(180deg, #104ECB 0%, #1D5BD8 22%, #3B82F6 46%, #93C5FD 74%, #EFF6FF 100%)',
      },
      default: {
        backgroundColor: '#1E40AF',
      },
    }),
  },
  specularOrbLeft: {
    position: 'absolute',
    top: -80,
    left: -60,
    width: 260,
    height: 260,
    borderRadius: 130,
    backgroundColor: 'rgba(56, 189, 248, 0.28)',
    ...Platform.select({
      web: {
        filter: 'blur(60px)',
      },
      default: {},
    }),
  },
  specularOrbRight: {
    position: 'absolute',
    top: 40,
    right: -80,
    width: 320,
    height: 320,
    borderRadius: 160,
    backgroundColor: 'rgba(147, 197, 253, 0.35)',
    ...Platform.select({
      web: {
        filter: 'blur(75px)',
      },
      default: {},
    }),
  },
  headerSection: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 48,
    paddingBottom: 36,
    paddingHorizontal: 20,
    zIndex: 10,
  },
  emblemContainer: {
    marginBottom: 20,
  },
  heroTitle: {
    fontSize: 44,
    fontWeight: '900',
    color: '#FFFFFF',
    textAlign: 'center',
    letterSpacing: -1.2,
    lineHeight: 50,
    ...Platform.select({
      web: {
        textShadow: '0 4px 18px rgba(0, 32, 96, 0.25)',
      },
      default: {},
    }),
  },
  heroSubtitle: {
    fontSize: 14,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.82)',
    textAlign: 'center',
    marginTop: 8,
    letterSpacing: -0.2,
  },
  contentSection: {
    zIndex: 15,
  },
});
