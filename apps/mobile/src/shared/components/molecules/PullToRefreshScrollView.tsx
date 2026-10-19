import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ScrollViewProps,
  Platform,
  RefreshControl,
  Animated,
  TouchableOpacity,
} from 'react-native';
import { RotateCw, ArrowDown } from 'lucide-react-native';
import { useThemeStore } from '../../../theme/useThemeStore';
import { soundService } from '../../services/soundService';

export interface PullToRefreshScrollViewProps extends ScrollViewProps {
  refreshing: boolean;
  onRefresh: () => void | Promise<void>;
  pullThreshold?: number;
  pullText?: string;
  releaseText?: string;
  refreshText?: string;
}

export const PullToRefreshScrollView: React.FC<PullToRefreshScrollViewProps> = ({
  refreshing,
  onRefresh,
  pullThreshold = 60,
  pullText = 'Tarik ke bawah untuk menyegarkan',
  releaseText = 'Lepaskan untuk menyegarkan',
  refreshText = 'Menyegarkan...',
  children,
  style,
  contentContainerStyle,
  onScroll,
  scrollEventThrottle = 16,
  ...restProps
}) => {
  const { colors, isDark } = useThemeStore();
  const scrollRef = useRef<any>(null);

  // Web Pull-To-Refresh State
  const [pullDistance, setPullDistance] = useState(0);
  const [isPulling, setIsPulling] = useState(false);
  const startYRef = useRef(0);
  const isDraggingRef = useRef(false);
  const scrollTopRef = useRef(0);
  const wheelAccumulatorRef = useRef(0);
  const wheelTimerRef = useRef<any>(null);

  // Spin animation for the refreshing state
  const spinAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (refreshing) {
      Animated.loop(
        Animated.timing(spinAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        })
      ).start();
    } else {
      spinAnim.stopAnimation();
      spinAnim.setValue(0);
      setPullDistance(0);
      setIsPulling(false);
    }
  }, [refreshing, spinAnim]);

  const spinInterpolation = spinAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  // Web Mouse and Touch event handlers
  const handleTouchStart = (e: any) => {
    if (Platform.OS !== 'web' || refreshing) return;
    if (scrollTopRef.current <= 2) {
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;
      startYRef.current = clientY;
      isDraggingRef.current = true;
    }
  };

  const handleTouchMove = (e: any) => {
    if (Platform.OS !== 'web' || !isDraggingRef.current || refreshing) return;
    if (scrollTopRef.current <= 2) {
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;
      const deltaY = clientY - startYRef.current;
      if (deltaY > 0) {
        // Rubber-band damping
        const distance = Math.min(100, deltaY * 0.45);
        setPullDistance(distance);
        setIsPulling(true);
        if (e.cancelable && deltaY > 10) {
          e.preventDefault?.();
        }
      } else {
        setPullDistance(0);
        setIsPulling(false);
      }
    }
  };

  const handleTouchEnd = () => {
    if (Platform.OS !== 'web' || !isDraggingRef.current) return;
    isDraggingRef.current = false;
    setIsPulling(false);

    if (pullDistance >= pullThreshold && !refreshing) {
      soundService.playMessageChime();
      onRefresh();
    } else {
      setPullDistance(0);
    }
  };

  // Web Wheel / Trackpad Overscroll listener
  useEffect(() => {
    if (Platform.OS !== 'web') return;

    const scrollNode = scrollRef.current?.getScrollableNode?.() || scrollRef.current;
    if (!scrollNode || typeof scrollNode.addEventListener !== 'function') return;

    const onWheel = (e: WheelEvent) => {
      if (refreshing) return;
      if (scrollNode.scrollTop <= 0 && e.deltaY < -15) {
        wheelAccumulatorRef.current += Math.abs(e.deltaY) * 0.25;
        const currentPull = Math.min(90, wheelAccumulatorRef.current);
        setPullDistance(currentPull);
        setIsPulling(true);

        clearTimeout(wheelTimerRef.current);
        wheelTimerRef.current = setTimeout(() => {
          if (wheelAccumulatorRef.current >= pullThreshold && !refreshing) {
            soundService.playMessageChime();
            onRefresh();
          }
          wheelAccumulatorRef.current = 0;
          setPullDistance(0);
          setIsPulling(false);
        }, 220);
      }
    };

    scrollNode.addEventListener('wheel', onWheel, { passive: true });
    return () => {
      scrollNode.removeEventListener('wheel', onWheel);
      clearTimeout(wheelTimerRef.current);
    };
  }, [refreshing, onRefresh, pullThreshold]);

  // Track scroll position
  const handleScroll = useCallback(
    (e: any) => {
      const currentScrollTop = e.nativeEvent.contentOffset.y;
      scrollTopRef.current = currentScrollTop;
      onScroll?.(e);
    },
    [onScroll]
  );

  // If on native platform, use native RefreshControl
  if (Platform.OS !== 'web') {
    return (
      <ScrollView
        ref={scrollRef}
        style={style}
        contentContainerStyle={contentContainerStyle}
        onScroll={handleScroll}
        scrollEventThrottle={scrollEventThrottle}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[colors.primary, '#FF2E63']}
            tintColor={colors.primary}
            progressBackgroundColor={colors.surfaceCard}
          />
        }
        {...restProps}
      >
        {children}
      </ScrollView>
    );
  }

  // Web Platform Implementation
  const isPastThreshold = pullDistance >= pullThreshold;
  const indicatorHeight = refreshing ? 50 : pullDistance;
  const rotateDeg = `${Math.min(180, (pullDistance / pullThreshold) * 180)}deg`;

  return (
    <View
      style={styles.webContainer}
      // @ts-ignore Web DOM drag listeners
      onMouseDown={handleTouchStart}
      onMouseMove={handleTouchMove}
      onMouseUp={handleTouchEnd}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Animated Pull to Refresh Header Indicator */}
      {(indicatorHeight > 0 || refreshing) && (
        <View
          style={[
            styles.indicatorContainer,
            {
              height: indicatorHeight,
              backgroundColor: isDark ? 'rgba(15, 23, 42, 0.95)' : 'rgba(255, 255, 255, 0.95)',
              borderBottomColor: colors.border,
            },
          ]}
        >
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => {
              if (!refreshing) {
                soundService.playMessageChime();
                onRefresh();
              }
            }}
            style={[
              styles.indicatorPill,
              {
                backgroundColor: isPastThreshold || refreshing ? colors.liquidGlow : colors.surfaceCard,
                borderColor: isPastThreshold || refreshing ? colors.primary : colors.border,
              },
            ]}
          >
            {refreshing ? (
              <Animated.View style={{ transform: [{ rotate: spinInterpolation }] }}>
                <RotateCw size={14} color={colors.primary} />
              </Animated.View>
            ) : isPastThreshold ? (
              <Animated.View style={{ transform: [{ rotate: '180deg' }] }}>
                <RotateCw size={14} color={colors.primary} />
              </Animated.View>
            ) : (
              <View style={{ transform: [{ rotate: rotateDeg }] }}>
                <ArrowDown size={14} color={colors.textSecondary} />
              </View>
            )}

            <Text
              style={[
                styles.indicatorText,
                {
                  color: isPastThreshold || refreshing ? colors.primary : colors.textSecondary,
                  fontWeight: isPastThreshold || refreshing ? '700' : '600',
                },
              ]}
            >
              {refreshing ? refreshText : isPastThreshold ? releaseText : pullText}
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Main Scroll Content */}
      <ScrollView
        ref={scrollRef}
        style={style}
        contentContainerStyle={contentContainerStyle}
        onScroll={handleScroll}
        scrollEventThrottle={scrollEventThrottle}
        {...restProps}
      >
        {children}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  webContainer: {
    flex: 1,
    overflow: 'hidden',
    position: 'relative',
  },
  indicatorContainer: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    borderBottomWidth: 1,
    zIndex: 100,
    transition: 'height 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
  } as any,
  indicatorPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    gap: 6,
  },
  indicatorText: {
    fontSize: 11,
    letterSpacing: 0.2,
  },
});
