import React, { useRef } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from 'react-native';
import { useThemeStore } from '../../../theme/useThemeStore';
import { useTranslation } from '../../../i18n';
import { X, Camera } from 'lucide-react-native';

export interface PhotoPickerProps {
  label?: string;
  imageUri?: string | null;
  onImageSelected: (file: File | Blob, localPreviewUrl: string) => void;
  onRemove?: () => void;
  aspectRatio?: 'square' | 'portrait';
  error?: string | null;
  helperText?: string;
  disabled?: boolean;
}

export const PhotoPicker: React.FC<PhotoPickerProps> = ({
  label,
  imageUri,
  onImageSelected,
  onRemove,
  aspectRatio = 'square',
  error,
  helperText,
  disabled = false,
}) => {
  const { colors, isDark } = useThemeStore();
  const { t } = useTranslation();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const hasImage = Boolean(imageUri);
  const hasError = Boolean(error);

  const handleClick = () => {
    if (disabled) return;
    if (Platform.OS === 'web') {
      fileInputRef.current?.click();
    } else {
      // Mock/Native fallback
      const mockUri = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400';
      onImageSelected(new Blob(['img'], { type: 'image/jpeg' }), mockUri);
    }
  };

  const handleWebFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    onImageSelected(file, url);
    e.target.value = '';
  };

  return (
    <View style={styles.container}>
      {Boolean(label) && (
        <Text style={[styles.label, { color: hasError ? colors.danger : colors.textSecondary }]}>
          {label}
        </Text>
      )}

      {/* Hidden input file untuk Web */}
      {Platform.OS === 'web' && (
        <input
          type="file"
          ref={fileInputRef as any}
          accept="image/*"
          style={{ display: 'none' }}
          onChange={handleWebFileChange as any}
        />
      )}

      <TouchableOpacity
        style={[
          styles.pickerBox,
          aspectRatio === 'portrait' ? styles.portraitRatio : styles.squareRatio,
          {
            backgroundColor: isDark ? 'rgba(255, 255, 255, 0.04)' : 'rgba(0, 0, 0, 0.03)',
            borderColor: hasError
              ? colors.danger
              : hasImage
              ? colors.primary
              : isDark
              ? 'rgba(255, 255, 255, 0.16)'
              : 'rgba(0, 0, 0, 0.16)',
          },
        ]}
        activeOpacity={0.8}
        onPress={handleClick}
        disabled={disabled}
      >
        {hasImage ? (
          <>
            <Image source={{ uri: imageUri! }} style={styles.previewImage} resizeMode="cover" />

            {/* Change Badge */}
            <View style={[styles.changeBadge, { backgroundColor: colors.primary }]}>
              <Text style={styles.changeBadgeText}>{t('photoPicker.changePhoto')}</Text>
            </View>

            {/* Remove Button */}
            {Boolean(onRemove) && (
              <TouchableOpacity
                style={styles.removeBtn}
                onPress={(e) => {
                  e.stopPropagation?.();
                  onRemove?.();
                }}
              >
                <X size={14} color="#FFFFFF" strokeWidth={2.5} />
              </TouchableOpacity>
            )}
          </>
        ) : (
          <View style={styles.placeholderCol}>
            <View style={[styles.cameraCircle, { backgroundColor: `${colors.primary}18` }]}>
              <Camera size={26} color={colors.primary} />
            </View>
            <Text style={[styles.uploadText, { color: colors.text }]}>{t('photoPicker.selectProfilePhoto')}</Text>
            <Text style={[styles.formatText, { color: colors.textSecondary }]}>
              {t('photoPicker.photoFormats')}
            </Text>
          </View>
        )}
      </TouchableOpacity>

      {hasError ? (
        <Text style={[styles.errorText, { color: colors.danger }]}>{error}</Text>
      ) : Boolean(helperText) ? (
        <Text style={[styles.helperText, { color: colors.textSecondary }]}>{helperText}</Text>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginBottom: 16,
    alignItems: 'center',
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    alignSelf: 'flex-start',
  },
  pickerBox: {
    width: '100%',
    borderRadius: 20,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    overflow: 'hidden',
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  squareRatio: {
    aspectRatio: 1,
    maxWidth: 160,
  },
  portraitRatio: {
    aspectRatio: 3 / 4,
    maxWidth: 200,
  },
  previewImage: {
    width: '100%',
    height: '100%',
  },
  changeBadge: {
    position: 'absolute',
    bottom: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  changeBadgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  removeBtn: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(0,0,0,0.65)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },
  placeholderCol: {
    alignItems: 'center',
    padding: 16,
  },
  cameraCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  cameraIcon: {
    fontSize: 24,
  },
  uploadText: {
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 2,
  },
  formatText: {
    fontSize: 10,
  },
  errorText: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: 6,
    alignSelf: 'flex-start',
  },
  helperText: {
    fontSize: 11,
    marginTop: 6,
    alignSelf: 'flex-start',
  },
});
