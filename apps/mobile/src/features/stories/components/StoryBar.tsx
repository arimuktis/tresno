import React, { useEffect, useRef } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Platform,
  Alert,
} from 'react-native';
import { useStoryStore } from '../stores/useStoryStore';
import { useAuthStore } from '../../auth/stores/useAuthStore';
import { useThemeStore } from '../../../theme/useThemeStore';
import { StoryCircle } from './StoryCircle';
import { ShimmerStoryCircle } from '../../../shared/components/atoms/ShimmerLoadingBar';
import { toast } from '../../../shared/stores/useToastStore';

export const StoryBar: React.FC = () => {
  const { colors, isDark } = useThemeStore();
  const { user } = useAuthStore();
  const {
    storyGroups,
    isLoading,
    isUploading,
    fetchStories,
    openStory,
    uploadStory,
  } = useStoryStore();

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    fetchStories();
  }, [fetchStories]);

  // Cari apakah user saat ini sudah punya story di dalam list
  const userStoryGroupIndex = storyGroups.findIndex(
    (g) => g.userId === user?.id
  );
  const userStoryGroup = userStoryGroupIndex !== -1 ? storyGroups[userStoryGroupIndex] : null;
  const userHasStories = Boolean(userStoryGroup && userStoryGroup.stories.length > 0);
  const isHost = Boolean(user?.isHost);

  // Filter story groups lainnya (bukan user sendiri)
  const otherStoryGroups = storyGroups.filter((g) => g.userId !== user?.id);

  const handlePickFile = () => {
    if (!isHost) {
      toast.info('Hanya Host / Anchor yang dapat mengunggah cerita.');
      return;
    }
    if (Platform.OS === 'web') {
      fileInputRef.current?.click();
    } else {
      // Alert untuk native jika dibutuhkan
      Alert.alert(
        'Unggah Cerita (24 Jam)',
        'Pilih foto atau video untuk cerita Anda. Cerita akan otomatis terhapus setelah 24 jam.',
        [
          { text: 'Batal', style: 'cancel' },
          {
            text: 'Gunakan Foto Demo',
            onPress: () => {
              uploadStory(
                new Blob(['mock-binary-data'], { type: 'image/jpeg' }),
                'Hai semuanya! Ini cerita 24 jam saya di Tresno.'
              );
            },
          },
        ]
      );
    }
  };

  const handleWebFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Reset value agar bisa upload ulang file yang sama jika diinginkan
    e.target.value = '';

    // Validasi ukuran (misal max 50MB per video/foto)
    if (file.size > 50 * 1024 * 1024) {
      toast.error('Ukuran file video atau foto maksimal adalah 50MB.');
      return;
    }

    const caption = prompt('Tambahkan caption untuk story 24 jam Anda (opsional):') || undefined;
    await uploadStory(file, caption);
  };

  const handleUserCirclePress = () => {
    if (userHasStories && userStoryGroupIndex !== -1) {
      openStory(userStoryGroupIndex);
    } else {
      handlePickFile();
    }
  };

  return (
    <View style={[styles.container, { borderBottomColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)' }]}>
      {/* Hidden File Input untuk Web Platform */}
      {Platform.OS === 'web' && (
        <input
          type="file"
          ref={fileInputRef as any}
          style={{ display: 'none' }}
          accept="image/*,video/*"
          onChange={handleWebFileChange as any}
        />
      )}

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        nestedScrollEnabled={true}
        directionalLockEnabled={true}
        keyboardShouldPersistTaps="handled"
      >
        {/* Lingkaran User Self ("Cerita Anda") - HANYA UNTUK HOST */}
        {isHost && (
          <View style={styles.selfWrapper}>
            <StoryCircle
              username="Cerita Anda"
              avatar={
                user?.avatarUrl ||
                'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300'
              }
              isUserSelf={true}
              hasStories={userHasStories}
              hasUnseen={Boolean(userStoryGroup?.hasUnseen)}
              onPress={handleUserCirclePress}
              onAddPress={handlePickFile}
            />
            {isUploading && (
              <View style={styles.uploadOverlay}>
                <ActivityIndicator size="small" color={colors.primary} />
              </View>
            )}
          </View>
        )}

        {/* List Stories dari Host / Anchor Lain */}
        {otherStoryGroups.map((group) => {
          // Cari index asli di dalam storyGroups
          const originalIndex = storyGroups.findIndex((g) => g.userId === group.userId);
          return (
            <StoryCircle
              key={group.userId}
              id={group.userId}
              username={group.username}
              avatar={group.avatar}
              isUserSelf={false}
              hasStories={group.stories.length > 0}
              hasUnseen={group.hasUnseen}
              isHost={group.isHost}
              onPress={() => openStory(originalIndex)}
            />
          );
        })}

        {isLoading && otherStoryGroups.length === 0 && (
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <ShimmerStoryCircle style={{ marginLeft: 10 }} />
            <ShimmerStoryCircle style={{ marginLeft: 10 }} />
            <ShimmerStoryCircle style={{ marginLeft: 10 }} />
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  scrollContent: {
    paddingHorizontal: 2,
    flexDirection: 'row',
    alignItems: 'center',
  },
  selfWrapper: {
    position: 'relative',
  },
  uploadOverlay: {
    position: 'absolute',
    top: 15,
    left: 15,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingContainer: {
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
});
