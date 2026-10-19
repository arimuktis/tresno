import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Image,
} from 'react-native';
import {
  ChevronLeft,
  Image as ImageIcon,
  Plus,
  User,
  Check,
  Copy,
  X,
} from 'lucide-react-native';
import { useAuthStore } from '../../auth/stores/useAuthStore';
import { useAlbumStore } from '../../album';
import { useThemeStore } from '../../../theme/useThemeStore';
import { useTranslation, SUPPORTED_LANGUAGES } from '../../../i18n';
import { toast } from '../../../shared/stores/useToastStore';
import { VerifiedBadge } from '../../../shared/components/atoms/VerifiedBadge';

export const EditProfileModal: React.FC = () => {
  const { colors, isDark, openThemeModal } = useThemeStore();
  const { t, currentLanguage, setLanguage } = useTranslation();
  const { user, isEditProfileOpen, closeEditProfile, updateProfile } = useAuthStore();
  const { photos, addPhoto } = useAlbumStore();

  const [nickname, setNickname] = useState(user?.nickname || 'Bell');
  const [gender, setGender] = useState<'male' | 'female'>(user?.gender === 'female' ? 'female' : 'male');
  const [birthday, setBirthday] = useState(user?.birthday || '2005-09-20');
  const [hashtags, setHashtags] = useState<string[]>(
    user?.hashtags && user.hashtags.length > 0 ? user.hashtags : ['#Virgo']
  );
  const [newTagInput, setNewTagInput] = useState('');
  const [isAddingTag, setIsAddingTag] = useState(false);
  const [copiedId, setCopiedId] = useState(false);

  if (!isEditProfileOpen || !user) return null;

  const coverPhoto =
    photos.find((p) => p.isCover && p.status !== 'rejected')?.url ||
    user.avatarUrl ||
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400';

  const handleCopyId = () => {
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
    toast.success(t('common.copied'));
  };

  const handleAddHashtag = () => {
    if (!newTagInput.trim()) {
      setIsAddingTag(false);
      return;
    }
    const formatted = newTagInput.startsWith('#')
      ? newTagInput.trim()
      : `#${newTagInput.trim()}`;
    if (!hashtags.includes(formatted)) {
      setHashtags([...hashtags, formatted]);
    }
    setNewTagInput('');
    setIsAddingTag(false);
  };

  const handleRemoveHashtag = (tagToRemove: string) => {
    setHashtags(hashtags.filter((t) => t !== tagToRemove));
  };

  const handleSave = () => {
    updateProfile({
      nickname: nickname.trim() || 'Bell',
      gender,
      birthday,
      hashtags,
    });
    closeEditProfile();
  };

  const handleToggleLanguage = () => {
    const nextLang = currentLanguage === 'id' ? 'en' : 'id';
    setLanguage(nextLang);
  };

  const handleSimulateAddPhoto = () => {
    const mockUrls = [
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800',
      'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=800',
      'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=800',
    ];
    const picked = mockUrls[Math.floor(Math.random() * mockUrls.length)];
    addPhoto(picked, 'Foto album baru');
    toast.success('Foto baru berhasil diunggah ke album!');
  };

  return (
    <Modal
      visible={isEditProfileOpen}
      animationType="slide"
      transparent={false}
      onRequestClose={handleSave}
    >
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        {/* Header ala Tigo */}
        <View style={[styles.header, { borderBottomColor: colors.border }]}>
          <TouchableOpacity
            style={styles.backBtn}
            onPress={handleSave}
            activeOpacity={0.7}
          >
            <ChevronLeft size={28} color={colors.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.text }]}>
            {t('profile.editTitle')}
          </Text>
          <TouchableOpacity
            style={styles.saveHeaderBtn}
            onPress={handleSave}
            activeOpacity={0.7}
          >
            <Text style={[styles.saveHeaderText, { color: colors.primary }]}>
              {t('common.save')}
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          style={styles.scrollContainer}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Section 1: Add Photo ala Tigo */}
          <View style={styles.section}>
            <View style={styles.sectionHeaderRow}>
              <ImageIcon size={18} color={colors.text} />
              <Text style={[styles.sectionHeading, { color: colors.text }]}>
                {t('profile.addPhoto')}
              </Text>
            </View>

            <View style={styles.photoGrid}>
              {/* Primary Photo with Verified overlay */}
              <View style={styles.photoSlot}>
                <Image source={{ uri: coverPhoto }} style={styles.photoThumb} />
                <View style={styles.verifiedTagOverlay}>
                  <Text style={styles.verifiedTagText}>Verified</Text>
                </View>
              </View>

              {/* Slot + to add new photo */}
              <TouchableOpacity
                style={[
                  styles.addPhotoSlot,
                  {
                    borderColor: colors.border,
                    backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : '#F9F9FB',
                  },
                ]}
                onPress={handleSimulateAddPhoto}
                activeOpacity={0.7}
              >
                <Plus size={32} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Section 2: Profile Picture card ala Tigo */}
          <View
            style={[
              styles.profilePicCard,
              {
                backgroundColor: isDark ? 'rgba(255,255,255,0.04)' : '#F7F7FA',
                borderColor: colors.border,
              },
            ]}
          >
            <View style={styles.profilePicLeft}>
              <User size={18} color="#A855F7" />
              <Text style={[styles.profilePicLabel, { color: colors.text }]}>
                {t('profile.profilePicture')}
              </Text>
            </View>
            <VerifiedBadge size="sm" variant="gradient" />
          </View>

          {/* Section 3: My info ala Tigo */}
          <View style={styles.section}>
            <Text style={[styles.sectionHeadingLarge, { color: colors.text }]}>
              {t('profile.myInfo')}
            </Text>

            <View
              style={[
                styles.infoCard,
                {
                  backgroundColor: isDark ? 'rgba(255,255,255,0.02)' : '#FFFFFF',
                  borderColor: colors.border,
                },
              ]}
            >
              {/* Nickname Row */}
              <View style={[styles.infoRow, { borderBottomColor: colors.border }]}>
                <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>
                  {t('profile.nickname')}
                </Text>
                <TextInput
                  value={nickname}
                  onChangeText={setNickname}
                  style={[styles.infoInput, { color: colors.primary }]}
                  placeholder="Masukkan nama"
                  placeholderTextColor={colors.textSecondary}
                />
              </View>

              {/* UserID Row (Copyable) */}
              <TouchableOpacity
                style={[styles.infoRow, { borderBottomColor: colors.border }]}
                onPress={handleCopyId}
                activeOpacity={0.7}
              >
                <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>
                  UserID
                </Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <Text style={[styles.infoValue, { color: colors.textSecondary }]}>
                    {user.id.replace('guest_', '') || '17691489'}
                  </Text>
                  {copiedId ? (
                    <Check size={14} color="#00C853" />
                  ) : (
                    <Copy size={14} color={colors.textSecondary} />
                  )}
                </View>
              </TouchableOpacity>

              {/* Gender Row */}
              <TouchableOpacity
                style={[styles.infoRow, { borderBottomColor: colors.border }]}
                onPress={() => setGender(gender === 'male' ? 'female' : 'male')}
                activeOpacity={0.7}
              >
                <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>
                  {t('profile.gender')}
                </Text>
                <Text
                  style={[
                    styles.infoValue,
                    { color: gender === 'male' ? '#007AFF' : '#FF2D55', fontWeight: '700' },
                  ]}
                >
                  {gender === 'male' ? 'Male ♂' : 'Female ♀'}
                </Text>
              </TouchableOpacity>

              {/* Birthday Row */}
              <View style={[styles.infoRow, { borderBottomColor: colors.border }]}>
                <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>
                  {t('profile.birthday')}
                </Text>
                <TextInput
                  value={birthday}
                  onChangeText={setBirthday}
                  style={[styles.infoInput, { color: colors.primary }]}
                  placeholder="YYYY-MM-DD"
                  placeholderTextColor={colors.textSecondary}
                />
              </View>

              {/* Language Row */}
              <TouchableOpacity
                style={styles.infoRow}
                onPress={handleToggleLanguage}
                activeOpacity={0.7}
              >
                <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>
                  {t('profile.language')}
                </Text>
                <Text style={[styles.infoValue, { color: colors.primary, fontWeight: '700' }]}>
                  {SUPPORTED_LANGUAGES[currentLanguage]?.nativeName || 'English'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Section 4: My Hashtags ala Tigo */}
          <View style={styles.section}>
            <Text style={[styles.sectionHeadingLarge, { color: colors.text }]}>
              {t('profile.myHashtags')}
            </Text>

            <View style={styles.hashtagsWrapper}>
              {hashtags.map((tag, idx) => (
                <View
                  key={idx}
                  style={[
                    styles.hashtagChip,
                    {
                      backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : '#F2F2F7',
                      borderColor: colors.border,
                    },
                  ]}
                >
                  <Text style={[styles.hashtagChipText, { color: colors.text }]}>{tag}</Text>
                  <TouchableOpacity
                    onPress={() => handleRemoveHashtag(tag)}
                    style={styles.removeTagBtn}
                  >
                    <X size={12} color={colors.textSecondary} />
                  </TouchableOpacity>
                </View>
              ))}

              {isAddingTag ? (
                <View style={styles.addTagInputRow}>
                  <TextInput
                    value={newTagInput}
                    onChangeText={setNewTagInput}
                    onSubmitEditing={handleAddHashtag}
                    autoFocus
                    placeholder="misal: Gamer"
                    placeholderTextColor={colors.textSecondary}
                    style={[
                      styles.addTagInput,
                      { color: colors.text, borderColor: colors.primary },
                    ]}
                  />
                  <TouchableOpacity
                    style={[styles.confirmTagBtn, { backgroundColor: colors.primary }]}
                    onPress={handleAddHashtag}
                  >
                    <Check size={14} color="#FFFFFF" />
                  </TouchableOpacity>
                </View>
              ) : (
                <TouchableOpacity
                  style={[
                    styles.addHashtagBtn,
                    { borderColor: colors.border },
                  ]}
                  onPress={() => setIsAddingTag(true)}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.addHashtagText, { color: colors.textSecondary }]}>
                    # Express yourself with hashtags!
                  </Text>
                  <Plus size={16} color="#A855F7" />
                </TouchableOpacity>
              )}
            </View>
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  backBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  saveHeaderBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  saveHeaderText: {
    fontSize: 15,
    fontWeight: '700',
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  sectionHeading: {
    fontSize: 16,
    fontWeight: '700',
  },
  sectionHeadingLarge: {
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 12,
  },
  photoGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  photoSlot: {
    width: 100,
    height: 140,
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#000000',
  },
  photoThumb: {
    width: '100%',
    height: '100%',
  },
  verifiedTagOverlay: {
    position: 'absolute',
    top: 6,
    left: 6,
    backgroundColor: '#8B5CF6',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  verifiedTagText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '800',
  },
  addPhotoSlot: {
    width: 100,
    height: 140,
    borderRadius: 12,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
  },
  profilePicCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 24,
  },
  profilePicLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  profilePicLabel: {
    fontSize: 15,
    fontWeight: '600',
  },
  infoCard: {
    borderRadius: 14,
    borderWidth: 1,
    overflow: 'hidden',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  infoLabel: {
    fontSize: 15,
  },
  infoValue: {
    fontSize: 15,
  },
  infoInput: {
    fontSize: 15,
    fontWeight: '600',
    textAlign: 'right',
    minWidth: 120,
    padding: 0,
  },
  hashtagsWrapper: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  hashtagChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    gap: 6,
  },
  hashtagChipText: {
    fontSize: 13,
    fontWeight: '600',
  },
  removeTagBtn: {
    padding: 2,
  },
  addHashtagBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    marginTop: 4,
  },
  addHashtagText: {
    fontSize: 13,
  },
  addTagInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    width: '100%',
    marginTop: 4,
  },
  addTagInput: {
    flex: 1,
    height: 38,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    fontSize: 13,
  },
  confirmTagBtn: {
    width: 38,
    height: 38,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
