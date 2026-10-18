import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TextInputProps,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Animated,
} from 'react-native';
import { Eye, EyeOff, X } from 'lucide-react-native';
import { useThemeStore } from '../../../theme/useThemeStore';
import { InlineError } from './InlineError';

export interface TextFieldProps extends Omit<TextInputProps, 'onChangeText'> {
  label?: string;
  value: string;
  onChangeText: (text: string) => void;
  error?: string | null;
  warning?: string | null;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  isPassword?: boolean;
  onClear?: () => void;
  containerStyle?: any;
  disabled?: boolean;
}

export const TextField: React.FC<TextFieldProps> = ({
  label,
  value,
  onChangeText,
  placeholder,
  error,
  warning,
  helperText,
  leftIcon,
  rightIcon,
  isPassword = false,
  onClear,
  containerStyle,
  disabled,
  multiline,
  ...restProps
}) => {
  const { colors, isDark } = useThemeStore();
  const [isFocused, setIsFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(!isPassword);

  const hasError = Boolean(error);
  const hasWarning = !hasError && Boolean(warning);

  const shakeAnim = useRef(new Animated.Value(0)).current;
  const prevErrorRef = useRef(error);

  useEffect(() => {
    if (error && error !== prevErrorRef.current) {
      Animated.sequence([
        Animated.timing(shakeAnim, { toValue: -6, duration: 50, useNativeDriver: Platform.OS !== 'web' }),
        Animated.timing(shakeAnim, { toValue: 6, duration: 50, useNativeDriver: Platform.OS !== 'web' }),
        Animated.timing(shakeAnim, { toValue: -4, duration: 50, useNativeDriver: Platform.OS !== 'web' }),
        Animated.timing(shakeAnim, { toValue: 4, duration: 50, useNativeDriver: Platform.OS !== 'web' }),
        Animated.timing(shakeAnim, { toValue: 0, duration: 50, useNativeDriver: Platform.OS !== 'web' }),
      ]).start();
    }
    prevErrorRef.current = error;
  }, [error]);

  const borderColor = hasError
    ? colors.danger || '#EF4444'
    : hasWarning
    ? colors.gold || '#F59E0B'
    : isFocused
    ? colors.primary
    : isDark
    ? 'rgba(255, 255, 255, 0.12)'
    : 'rgba(0, 0, 0, 0.12)';

  return (
    <View style={[styles.wrapper, containerStyle]}>
      {/* Label */}
      {Boolean(label) && (
        <Text
          style={[
            styles.label,
            {
              color: hasError
                ? colors.danger || '#EF4444'
                : hasWarning
                ? colors.gold || '#F59E0B'
                : isFocused
                ? colors.primary
                : colors.textSecondary,
            },
          ]}
        >
          {label}
        </Text>
      )}

      {/* Input Container with Animated Shake & Liquid Glass Accent */}
      <Animated.View
        style={[
          styles.inputContainer,
          {
            backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.03)',
            borderColor,
            transform: [{ translateX: shakeAnim }],
          },
          Platform.OS === 'web' &&
            hasError &&
            ({
              boxShadow: '0 0 10px rgba(239, 68, 68, 0.35)',
            } as any),
          Platform.OS === 'web' &&
            !hasError &&
            isFocused &&
            ({
              boxShadow: `0 0 12px ${colors.liquidGlow}`,
            } as any),
        ]}
      >
        {/* Left Icon Slot */}
        {leftIcon && <View style={styles.iconLeft}>{leftIcon}</View>}

        {/* Text Input */}
        <TextInput
          style={[
            styles.input,
            {
              color: colors.text,
              minHeight: multiline ? 80 : 44,
            },
          ]}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={isDark ? 'rgba(255,255,255,0.35)' : 'rgba(0,0,0,0.35)'}
          secureTextEntry={isPassword && !showPassword}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          editable={!disabled}
          multiline={multiline}
          {...restProps}
        />

        {/* Clear Button */}
        {onClear && value.length > 0 && !disabled && (
          <TouchableOpacity onPress={onClear} style={styles.clearBtn} activeOpacity={0.7}>
            <X size={14} color="#9CA3AF" />
          </TouchableOpacity>
        )}

        {/* Password Eye Toggle */}
        {isPassword && (
          <TouchableOpacity
            onPress={() => setShowPassword(!showPassword)}
            style={styles.eyeBtn}
            activeOpacity={0.7}
          >
            {showPassword ? (
              <EyeOff size={18} color={colors.textSecondary} />
            ) : (
              <Eye size={18} color={colors.textSecondary} />
            )}
          </TouchableOpacity>
        )}

        {/* Custom Right Icon */}
        {!isPassword && rightIcon && <View style={styles.iconRight}>{rightIcon}</View>}
      </Animated.View>

      {/* Inline Validation Feedback */}
      {hasError ? (
        <InlineError message={error} variant="error" containerStyle={{ marginTop: 4 }} />
      ) : hasWarning ? (
        <InlineError message={warning} variant="warning" containerStyle={{ marginTop: 4 }} />
      ) : Boolean(helperText) ? (
        <Text style={[styles.helperText, { color: colors.textSecondary }]}>{helperText}</Text>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    width: '100%',
    marginBottom: 16,
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.2,
    borderRadius: 14,
    paddingHorizontal: 14,
  },
  input: {
    flex: 1,
    fontSize: 14,
    paddingVertical: 10,
  },
  iconLeft: {
    marginRight: 10,
  },
  iconRight: {
    marginLeft: 10,
  },
  clearBtn: {
    padding: 6,
    marginRight: 2,
  },
  eyeBtn: {
    padding: 6,
  },
  helperText: {
    fontSize: 11,
    marginTop: 4,
    marginLeft: 4,
  },
});
