import React, { useRef, useState, useCallback, useEffect } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Platform,
  useWindowDimensions,
  TouchableOpacity,
  NativeSyntheticEvent,
  NativeScrollEvent,
  Animated,
} from 'react-native';
import { ChevronLeft, ChevronRight } from 'lucide-react-native';

export interface EgoCarouselProps {
  children: React.ReactNode[];
  cardWidth?: number;
  gap?: number;
  horizontalPadding?: number;
  showIndicators?: boolean;
  showChevrons?: boolean;
  onIndexChange?: (index: number) => void;
}

/**
 * EgoCarousel: High-performance, gesture-optimized horizontal card carousel
 * mirroring the exact Apple / Ego design language:
 * - Responsive card sizing with intentional edge peeking
 * - Fast deceleration snapping physics (snapToInterval)
 * - Animated glass pagination capsules with tap-to-scroll
 * - Web mouse drag-to-scroll & trackpad momentum support
 * - Floating frosted glass navigation chevrons for desktop/tablet
 * - Directional lock preventing vertical gesture interception
 */
export const EgoCarousel: React.FC<EgoCarouselProps> = ({
  children,
  cardWidth: customCardWidth,
  gap = 16,
  horizontalPadding = 20,
  showIndicators = true,
  showChevrons = true,
  onIndexChange,
}) => {
  const { width: windowWidth } = useWindowDimensions();
  const scrollRef = useRef<ScrollView>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  // Dynamic card width calculation:
  // On mobile (< 600px): takes ~84% of viewport width so the next card ALWAYS peeks in by 30-40px.
  // On desktop / tablet: standardizes at 340px for ideal reading measure.
  const computedCardWidth = customCardWidth || (
    windowWidth < 600
      ? Math.max(280, Math.min(340, Math.floor(windowWidth * 0.83)))
      : 340
  );

  const snapInterval = computedCardWidth + gap;
  const itemCount = React.Children.count(children);

  const handleScroll = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const offsetX = event.nativeEvent.contentOffset.x;
      const index = Math.round(offsetX / snapInterval);
      const clampedIndex = Math.max(0, Math.min(itemCount - 1, index));

      if (clampedIndex !== activeIndex) {
        setActiveIndex(clampedIndex);
        onIndexChange?.(clampedIndex);
      }

      setCanScrollLeft(offsetX > 10);
      const maxScroll = (itemCount - 1) * snapInterval;
      setCanScrollRight(offsetX < maxScroll - 10);
    },
    [snapInterval, itemCount, activeIndex, onIndexChange]
  );

  const scrollToIndex = useCallback(
    (index: number) => {
      const targetIndex = Math.max(0, Math.min(itemCount - 1, index));
      const targetOffset = targetIndex * snapInterval;
      scrollRef.current?.scrollTo({
        x: targetOffset,
        animated: true,
      });
      setActiveIndex(targetIndex);
      onIndexChange?.(targetIndex);
    },
    [snapInterval, itemCount, onIndexChange]
  );

  const handlePrev = () => scrollToIndex(activeIndex - 1);
  const handleNext = () => scrollToIndex(activeIndex + 1);

  // Web mouse drag-to-scroll enhancement
  const isDraggingRef = useRef(false);
  const startXRef = useRef(0);
  const scrollLeftStartRef = useRef(0);

  const handleMouseDown = (e: any) => {
    if (Platform.OS !== 'web') return;
    isDraggingRef.current = true;
    startXRef.current = e.pageX;
    // On web, access underlying scroll DOM node if available
    const node = (scrollRef.current as any)?.getScrollableNode?.() || (scrollRef.current as any)?._node;
    if (node) {
      scrollLeftStartRef.current = node.scrollLeft || 0;
    }
  };

  const handleMouseMove = (e: any) => {
    if (Platform.OS !== 'web' || !isDraggingRef.current) return;
    const node = (scrollRef.current as any)?.getScrollableNode?.() || (scrollRef.current as any)?._node;
    if (node) {
      const delta = e.pageX - startXRef.current;
      node.scrollLeft = scrollLeftStartRef.current - delta;
    }
  };

  const handleMouseUp = () => {
    if (Platform.OS !== 'web') return;
    if (isDraggingRef.current) {
      isDraggingRef.current = false;
      const node = (scrollRef.current as any)?.getScrollableNode?.() || (scrollRef.current as any)?._node;
      if (node) {
        const currentX = node.scrollLeft;
        const nearestIndex = Math.round(currentX / snapInterval);
        scrollToIndex(nearestIndex);
      }
    }
  };

  return (
    <View style={styles.container}>
      {/* Scrollable Cards Track */}
      <View
        style={styles.scrollTrackWrapper}
        {...(Platform.OS === 'web'
          ? {
              onMouseDown: handleMouseDown,
              onMouseMove: handleMouseMove,
              onMouseUp: handleMouseUp,
              onMouseLeave: handleMouseUp,
            }
          : {})}
      >
        <ScrollView
          ref={scrollRef}
          horizontal
          showsHorizontalScrollIndicator={false}
          snapToInterval={snapInterval}
          snapToAlignment="start"
          decelerationRate="fast"
          disableIntervalMomentum={true}
          nestedScrollEnabled={true}
          directionalLockEnabled={true}
          keyboardShouldPersistTaps="handled"
          scrollEventThrottle={16}
          onScroll={handleScroll}
          contentContainerStyle={[
            styles.scrollContent,
            {
              paddingHorizontal: horizontalPadding,
              gap: gap,
            },
          ]}
          style={[
            styles.scrollView,
            Platform.select({
              web: {
                scrollSnapType: 'x mandatory',
                WebkitOverflowScrolling: 'touch',
                cursor: 'grab',
              } as any,
              default: {},
            }),
          ]}
        >
          {React.Children.map(children, (child, idx) => (
            <View
              key={idx}
              style={[
                styles.itemWrapper,
                { width: computedCardWidth },
                Platform.select({
                  web: {
                    scrollSnapAlign: 'start',
                    scrollSnapStop: 'always',
                  } as any,
                  default: {},
                }),
              ]}
            >
              {child}
            </View>
          ))}
        </ScrollView>

        {/* Floating Desktop / Tablet Navigation Chevrons */}
        {showChevrons && (
          <>
            {canScrollLeft && (
              <TouchableOpacity
                style={[styles.chevronBtn, styles.chevronLeft]}
                onPress={handlePrev}
                activeOpacity={0.8}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <ChevronLeft size={20} color="#0F172A" />
              </TouchableOpacity>
            )}

            {canScrollRight && (
              <TouchableOpacity
                style={[styles.chevronBtn, styles.chevronRight]}
                onPress={handleNext}
                activeOpacity={0.8}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <ChevronRight size={20} color="#0F172A" />
              </TouchableOpacity>
            )}
          </>
        )}
      </View>

      {/* Glass Pagination Indicator Dots */}
      {showIndicators && itemCount > 1 && (
        <View style={styles.paginationRow}>
          {Array.from({ length: itemCount }).map((_, i) => {
            const isActive = i === activeIndex;
            return (
              <TouchableOpacity
                key={i}
                onPress={() => scrollToIndex(i)}
                activeOpacity={0.7}
                style={[
                  styles.dotBase,
                  isActive ? styles.dotActive : styles.dotInactive,
                ]}
                hitSlop={{ top: 10, bottom: 10, left: 6, right: 6 }}
              />
            );
          })}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    position: 'relative',
  },
  scrollTrackWrapper: {
    position: 'relative',
    width: '100%',
  },
  scrollView: {
    overflow: 'visible',
  },
  scrollContent: {
    alignItems: 'stretch',
    paddingBottom: 24,
  },
  itemWrapper: {
    flexShrink: 0,
  },
  chevronBtn: {
    position: 'absolute',
    top: '46%',
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 50,
    ...Platform.select({
      web: {
        backdropFilter: 'blur(16px)',
        boxShadow: '0 8px 24px rgba(0, 0, 0, 0.16)',
        transition: 'all 0.2s ease',
      } as any,
      default: {
        elevation: 6,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.18,
        shadowRadius: 8,
      },
    }),
  },
  chevronLeft: {
    left: 12,
  },
  chevronRight: {
    right: 12,
  },
  paginationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 4,
    marginBottom: 16,
  },
  dotBase: {
    height: 7,
    borderRadius: 9999,
    ...Platform.select({
      web: {
        transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
      } as any,
      default: {},
    }),
  },
  dotActive: {
    width: 28,
    backgroundColor: '#FFFFFF',
    ...Platform.select({
      web: {
        boxShadow: '0 2px 8px rgba(255, 255, 255, 0.6)',
      } as any,
      default: {
        elevation: 2,
      },
    }),
  },
  dotInactive: {
    width: 7,
    backgroundColor: 'rgba(255, 255, 255, 0.42)',
  },
});
