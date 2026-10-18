import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useAuthStore } from '../../auth/stores/useAuthStore';
import { useCallStore } from '../stores/useCallStore';

export const ForensicWatermark: React.FC = () => {
  const { user } = useAuthStore();
  const { activeMatch } = useCallStore();

  const [currentTime, setCurrentTime] = useState(() => new Date().toISOString().substring(11, 19));
  const [offsetPos, setOffsetPos] = useState({ x: 0, y: 0 });

  // Update timestamp tiap detik dan drift posisi tiap 8 detik
  useEffect(() => {
    const timeInterval = setInterval(() => {
      setCurrentTime(new Date().toISOString().substring(11, 19));
    }, 1000);

    const driftInterval = setInterval(() => {
      // Pergeseran acak halus (-15px s/d +15px) untuk mencegah teknik crop watermark
      const dx = (Math.random() - 0.5) * 30;
      const dy = (Math.random() - 0.5) * 30;
      setOffsetPos({ x: dx, y: dy });
    }, 8000);

    return () => {
      clearInterval(timeInterval);
      clearInterval(driftInterval);
    };
  }, []);

  const userId = user?.id || 'USER_GUEST';
  const peerId = activeMatch?.peer.id || 'PEER';
  const watermarkText = `TRESNO PRIVACY • ${userId} • ${peerId} • ${currentTime}`;

  return (
    <View style={styles.container} pointerEvents="none">
      {/* Dynamic Grid of 4 floating forensic watermarks */}
      <View
        style={[
          styles.watermarkWrapper,
          {
            transform: [
              { rotate: '-22deg' },
              { translateX: offsetPos.x },
              { translateY: offsetPos.y },
            ],
          },
        ]}
      >
        <Text style={styles.watermarkText}>{watermarkText}</Text>
        <Text style={styles.watermarkText}>{watermarkText}</Text>
        <Text style={styles.watermarkText}>{watermarkText}</Text>
        <Text style={styles.watermarkText}>{watermarkText}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'space-around',
    alignItems: 'center',
    zIndex: 99,
  },
  watermarkWrapper: {
    width: '120%',
    height: '100%',
    justifyContent: 'space-evenly',
    alignItems: 'center',
  },
  watermarkText: {
    color: 'rgba(255, 255, 255, 0.16)',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 2,
    textShadowColor: 'rgba(0, 0, 0, 0.25)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
});
