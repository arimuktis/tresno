import { create } from 'zustand';
import { Appearance } from 'react-native';

export type ThemeMode = 'dark' | 'light' | 'system';
export type AccentColorKey = 'system' | 'rose' | 'violet' | 'cyan' | 'coral' | 'mint' | 'amber' | 'ego';

export interface AccentInfo {
  key: AccentColorKey;
  name: string;
  icon: string;
  desc: string;
  primary: string;
  glow: string;
}

export const ACCENT_PALETTES: Record<AccentColorKey, (isDark: boolean) => AccentInfo> = {
  system: (isDark) => ({
    key: 'system',
    name: 'Sistem (Hot Pink)',
    icon: 'sparkles',
    desc: 'Warna dinamis modern',
    primary: '#FF005E',
    glow: isDark ? 'rgba(255, 0, 94, 0.28)' : 'rgba(255, 0, 94, 0.18)',
  }),
  ego: (isDark) => ({
    key: 'ego',
    name: 'Ego Sapphire (Liquid Blue)',
    icon: 'compass',
    desc: 'Luminous Cobalt & Ceramic Glass',
    primary: '#104ECB',
    glow: isDark ? 'rgba(56, 189, 248, 0.35)' : 'rgba(16, 78, 203, 0.28)',
  }),
  rose: () => ({
    key: 'rose',
    name: 'Tresno Hot Pink',
    icon: 'heart',
    desc: 'Romantis & Berani',
    primary: '#FF005E',
    glow: 'rgba(255, 0, 94, 0.28)',
  }),
  violet: () => ({
    key: 'violet',
    name: 'Royal Violet',
    icon: 'crown',
    desc: 'Eksklusif & Glamor',
    primary: '#9D4EDD',
    glow: 'rgba(157, 78, 221, 0.25)',
  }),
  cyan: () => ({
    key: 'cyan',
    name: 'Electric Cyan',
    icon: 'gem',
    desc: 'Segar & Modern',
    primary: '#00ADB5',
    glow: 'rgba(0, 173, 181, 0.25)',
  }),
  coral: () => ({
    key: 'coral',
    name: 'Sunset Coral',
    icon: 'flame',
    desc: 'Hangat & Ceria',
    primary: '#FF6B6B',
    glow: 'rgba(255, 107, 107, 0.25)',
  }),
  mint: () => ({
    key: 'mint',
    name: 'Emerald Mint',
    icon: 'leaf',
    desc: 'Sejuk & Menenangkan',
    primary: '#10B981',
    glow: 'rgba(16, 185, 129, 0.25)',
  }),
  amber: () => ({
    key: 'amber',
    name: 'Glam Gold',
    icon: 'award',
    desc: 'Mewah & Berkelas',
    primary: '#F59E0B',
    glow: 'rgba(245, 158, 11, 0.25)',
  }),
};

export interface ThemeColors {
  primary: string;
  primaryGlow: string;
  secondary: string;
  gold: string;
  background: string;
  surface: string;
  surfaceGlass: string;
  surfaceCard: string;
  border: string;
  text: string;
  textSecondary: string;
  textMuted: string;
  inputBg: string;
  danger: string;
  success: string;
  // Liquid Glass Design Tokens
  glassBg: string;
  glassCard: string;
  glassBorder: string;
  glassBorderHighlight: string;
  liquidGlow: string;
}

interface ThemeState {
  themeMode: ThemeMode;
  accentKey: AccentColorKey;
  isDark: boolean;
  colors: ThemeColors;
  isThemeModalOpen: boolean;
  openThemeModal: () => void;
  closeThemeModal: () => void;
  setThemeMode: (mode: ThemeMode) => void;
  setAccentKey: (key: AccentColorKey) => void;
}

const STORAGE_THEME_KEY = 'tresno_theme_mode';
const STORAGE_ACCENT_KEY = 'tresno_accent_key';

const getSystemIsDark = (): boolean => {
  if (typeof window !== 'undefined' && window.matchMedia) {
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  }
  const colorScheme = Appearance.getColorScheme();
  return colorScheme === 'dark';
};

const getEffectiveIsDark = (mode: ThemeMode): boolean => {
  if (mode === 'dark') return true;
  if (mode === 'light') return false;
  return getSystemIsDark();
};

const buildColors = (isDark: boolean, accentKey: AccentColorKey): ThemeColors => {
  const accentFn = ACCENT_PALETTES[accentKey] || ACCENT_PALETTES.system;
  const accent = accentFn(isDark);

  if (accentKey === 'ego') {
    if (isDark) {
      return {
        primary: '#38BDF8',
        primaryGlow: 'rgba(56, 189, 248, 0.35)',
        secondary: '#10B981',
        gold: '#84CC16',
        background: '#0B1528',
        surface: '#111E38',
        surfaceGlass: 'rgba(17, 30, 56, 0.85)',
        surfaceCard: '#152445',
        border: '#1E3A8A',
        text: '#FFFFFF',
        textSecondary: '#94A3B8',
        textMuted: '#64748B',
        inputBg: '#192C54',
        danger: '#FF3B30',
        success: '#10B981',
        glassBg: 'rgba(17, 30, 56, 0.8)',
        glassCard: 'rgba(21, 36, 69, 0.75)',
        glassBorder: 'rgba(56, 189, 248, 0.25)',
        glassBorderHighlight: 'rgba(56, 189, 248, 0.45)',
        liquidGlow: 'rgba(56, 189, 248, 0.3)',
      };
    }

    // Ego Pure Ceramic & Liquid Sapphire (Exact Screenshot Look)
    return {
      primary: '#104ECB',
      primaryGlow: 'rgba(16, 78, 203, 0.25)',
      secondary: '#059669',
      gold: '#84CC16',
      background: '#EFF6FF',
      surface: '#FFFFFF',
      surfaceGlass: 'rgba(255, 255, 255, 0.94)',
      surfaceCard: '#FFFFFF',
      border: 'rgba(226, 232, 240, 0.85)',
      text: '#0F172A',
      textSecondary: '#64748B',
      textMuted: '#94A3B8',
      inputBg: '#FFFFFF',
      danger: '#EF4444',
      success: '#10B981',
      glassBg: 'linear-gradient(180deg, #104ECB 0%, #2563EB 35%, #60A5FA 70%, #EFF6FF 100%)',
      glassCard: 'rgba(255, 255, 255, 0.96)',
      glassBorder: 'rgba(255, 255, 255, 0.85)',
      glassBorderHighlight: '#FFFFFF',
      liquidGlow: 'rgba(16, 78, 203, 0.18)',
    };
  }

  if (isDark) {
    return {
      primary: accent.primary,
      primaryGlow: accent.glow,
      secondary: '#08D9D6',
      gold: '#FFD700',
      background: '#0D0C1D',
      surface: '#1A182E',
      surfaceGlass: 'rgba(26, 24, 46, 0.85)',
      surfaceCard: '#161426',
      border: '#2E2B44',
      text: '#FFFFFF',
      textSecondary: '#A09CB0',
      textMuted: '#6B6882',
      inputBg: '#24223A',
      danger: '#FF3B30',
      success: '#34C759',
      // Liquid Glass Tokens
      glassBg: 'rgba(22, 18, 38, 0.72)',
      glassCard: 'rgba(28, 24, 48, 0.65)',
      glassBorder: 'rgba(255, 255, 255, 0.12)',
      glassBorderHighlight: 'rgba(255, 255, 255, 0.22)',
      liquidGlow: accent.glow || 'rgba(255, 46, 99, 0.25)',
    };
  }

  // Light Mode Palette
  return {
    primary: accent.primary,
    primaryGlow: accent.glow,
    secondary: '#0891B2',
    gold: '#D97706',
    background: '#F8FAFC',
    surface: '#FFFFFF',
    surfaceGlass: 'rgba(255, 255, 255, 0.85)',
    surfaceCard: '#F1F5F9',
    border: '#E2E8F0',
    text: '#0F172A',
    textSecondary: '#475569',
    textMuted: '#94A3B8',
    inputBg: '#F8FAFC',
    danger: '#EF4444',
    success: '#10B981',
    // Liquid Glass Tokens
    glassBg: 'rgba(255, 255, 255, 0.82)',
    glassCard: 'rgba(255, 255, 255, 0.72)',
    glassBorder: 'rgba(255, 255, 255, 0.65)',
    glassBorderHighlight: 'rgba(255, 255, 255, 0.95)',
    liquidGlow: accent.glow || 'rgba(225, 29, 72, 0.15)',
  };
};

const getSavedThemeMode = (): ThemeMode => {
  if (typeof window !== 'undefined' && window.localStorage) {
    const val = window.localStorage.getItem(STORAGE_THEME_KEY) as ThemeMode;
    if (val === 'dark' || val === 'light' || val === 'system') return val;
  }
  return 'dark'; // Default sleek dark for Tigo-style video chat
};

const getSavedAccentKey = (): AccentColorKey => {
  if (typeof window !== 'undefined' && window.localStorage) {
    const val = window.localStorage.getItem(STORAGE_ACCENT_KEY) as AccentColorKey;
    if (val && ACCENT_PALETTES[val]) return val;
  }
  return 'system';
};

export const useThemeStore = create<ThemeState>((set, get) => {
  const initialMode = getSavedThemeMode();
  const initialAccent = getSavedAccentKey();
  const isDark = getEffectiveIsDark(initialMode);

  return {
    themeMode: initialMode,
    accentKey: initialAccent,
    isDark,
    colors: buildColors(isDark, initialAccent),
    isThemeModalOpen: false,

    openThemeModal: () => set({ isThemeModalOpen: true }),
    closeThemeModal: () => set({ isThemeModalOpen: false }),

    setThemeMode: (mode) => {
      const dark = getEffectiveIsDark(mode);
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem(STORAGE_THEME_KEY, mode);
      }
      set({
        themeMode: mode,
        isDark: dark,
        colors: buildColors(dark, get().accentKey),
      });
    },

    setAccentKey: (key) => {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem(STORAGE_ACCENT_KEY, key);
      }
      set({
        accentKey: key,
        colors: buildColors(get().isDark, key),
      });
    },
  };
});

// Listener untuk System Theme changes saat user memilih mode 'system'
if (typeof window !== 'undefined' && window.matchMedia) {
  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
  const handleSystemChange = () => {
    const { themeMode, accentKey } = useThemeStore.getState();
    if (themeMode === 'system') {
      const dark = mediaQuery.matches;
      useThemeStore.setState({
        isDark: dark,
        colors: buildColors(dark, accentKey),
      });
    }
  };

  if (mediaQuery.addEventListener) {
    mediaQuery.addEventListener('change', handleSystemChange);
  } else if ((mediaQuery as any).addListener) {
    (mediaQuery as any).addListener(handleSystemChange);
  }
} else {
  Appearance.addChangeListener(({ colorScheme }) => {
    const { themeMode, accentKey } = useThemeStore.getState();
    if (themeMode === 'system') {
      const dark = colorScheme === 'dark';
      useThemeStore.setState({
        isDark: dark,
        colors: buildColors(dark, accentKey),
      });
    }
  });
}
