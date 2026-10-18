import React from 'react';
import { View, StyleSheet, Platform } from 'react-native';

interface EgoPrismaticEmblemProps {
  size?: number;
}

export const EgoPrismaticEmblem: React.FC<EgoPrismaticEmblemProps> = ({ size = 64 }) => {
  const height = size * 0.6;

  return (
    <View style={[styles.container, { width: size, height }]}>
      {/* Background Soft Glow */}
      <View
        style={[
          styles.ambientGlow,
          {
            width: size * 1.4,
            height: height * 1.4,
            borderRadius: size,
          },
        ]}
      />

      {/* SVG Prismatic Liquid Glass Rings (Recreation of Ego Logo) */}
      <svg
        width={size}
        height={height}
        viewBox="0 0 100 60"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ overflow: 'visible' }}
      >
        <defs>
          {/* Sphere / Left Lens Gradient */}
          <radialGradient
            id="sphereGrad"
            cx="35%"
            cy="35%"
            r="65%"
            fx="30%"
            fy="30%"
          >
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.95" />
            <stop offset="25%" stopColor="#BAE6FD" stopOpacity="0.8" />
            <stop offset="60%" stopColor="#38BDF8" stopOpacity="0.5" />
            <stop offset="85%" stopColor="#0284C7" stopOpacity="0.75" />
            <stop offset="100%" stopColor="#0369A1" stopOpacity="0.9" />
          </radialGradient>

          {/* Middle Optical Lens Gradient */}
          <linearGradient id="lensMiddleGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.9" />
            <stop offset="50%" stopColor="#7DD3FC" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#0284C7" stopOpacity="0.8" />
          </linearGradient>

          {/* Right Thin Cylinder Lens Gradient */}
          <linearGradient id="lensRightGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.95" />
            <stop offset="30%" stopColor="#E0F2FE" stopOpacity="0.4" />
            <stop offset="70%" stopColor="#38BDF8" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#0369A1" stopOpacity="0.85" />
          </linearGradient>

          {/* Specular Highlight Arc Filter */}
          <filter id="causticGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="1.5" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* 1. Left Droplet / Glass Sphere */}
        <ellipse
          cx="38"
          cy="30"
          rx="18"
          ry="18"
          fill="url(#sphereGrad)"
          stroke="rgba(255, 255, 255, 0.75)"
          strokeWidth="1.2"
        />

        {/* Caustic Specular Rim Highlight on Left Sphere */}
        <path
          d="M26 22 C30 16, 42 16, 48 20"
          stroke="#FFFFFF"
          strokeWidth="2"
          strokeLinecap="round"
          filter="url(#causticGlow)"
          opacity="0.95"
        />

        {/* 2. Center Concave/Convex Glass Lens */}
        <ellipse
          cx="52"
          cy="30"
          rx="7"
          ry="21"
          fill="url(#lensMiddleGrad)"
          stroke="rgba(255, 255, 255, 0.85)"
          strokeWidth="1.4"
        />
        <path
          d="M51 13 C53 18, 53 42, 51 47"
          stroke="#FFFFFF"
          strokeWidth="1.2"
          strokeLinecap="round"
          opacity="0.9"
        />

        {/* 3. Right Optical Glass Lens */}
        <ellipse
          cx="66"
          cy="30"
          rx="3.5"
          ry="20"
          fill="url(#lensRightGrad)"
          stroke="rgba(255, 255, 255, 0.9)"
          strokeWidth="1.2"
        />
        <path
          d="M66 12 C67.5 16, 67.5 44, 66 48"
          stroke="#FFFFFF"
          strokeWidth="1.4"
          strokeLinecap="round"
          opacity="0.95"
        />
      </svg>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  ambientGlow: {
    position: 'absolute',
    backgroundColor: 'rgba(56, 189, 248, 0.35)',
    ...Platform.select({
      web: {
        filter: 'blur(20px)',
      },
      default: {},
    }),
  },
});
