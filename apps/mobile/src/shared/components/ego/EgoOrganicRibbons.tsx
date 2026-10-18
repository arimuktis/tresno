import React from 'react';
import { View, StyleSheet } from 'react-native';

interface EgoOrganicRibbonsProps {
  width?: number | string;
  height?: number;
}

export const EgoOrganicRibbons: React.FC<EgoOrganicRibbonsProps> = ({
  width = '100%',
  height = 140,
}) => {
  return (
    <View style={[styles.container, { height }]}>
      <svg
        width="100%"
        height={height}
        viewBox="0 0 320 140"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="none"
      >
        {/* Emerald Arc (Left) */}
        <path
          d="M -10 110 C 20 20, 100 20, 120 140"
          stroke="#059669"
          strokeWidth="16"
          strokeLinecap="round"
          fill="none"
        />

        {/* Lime/Chartreuse Loop (Center) */}
        <path
          d="M 90 140 C 95 10, 195 10, 200 140"
          stroke="#84CC16"
          strokeWidth="16"
          strokeLinecap="round"
          fill="none"
        />

        {/* Fuchsia/Pink Loop (Right) */}
        <path
          d="M 180 140 C 185 30, 265 30, 275 140"
          stroke="#F43F5E"
          strokeWidth="16"
          strokeLinecap="round"
          fill="none"
        />
      </svg>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    overflow: 'hidden',
  },
});
