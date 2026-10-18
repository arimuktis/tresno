export const THEME = {
  colors: {
    primary: '#FF005E', // High-Fashion Hot Pink (sesuai acuan design gambar)
    primaryHover: '#E60054',
    primaryLight: 'rgba(255, 0, 94, 0.12)',
    secondary: '#08D9D6',
    gold: '#F59E0B',
    background: '#0B0A12', // Deep Sleek Dark
    backgroundLight: '#FFFFFF', // Pristine Clean White (sesuai acuan)
    surface: '#161426',
    surfaceLight: '#F8FAFC',
    surfaceCardLight: '#F1F4F9',
    surfaceGlass: 'rgba(24, 20, 38, 0.75)',
    surfaceGlassLight: 'rgba(255, 255, 255, 0.85)',
    border: '#2A2640',
    borderLight: '#F0F2F6',
    text: '#FFFFFF',
    textDark: '#111827',
    textSecondary: '#9CA3AF',
    textSecondaryDark: '#6B7280',
    danger: '#FF3B30',
    success: '#10B981',
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24, // Acuan margin horizontal standar (24px)
    xl: 32,
    xxl: 40,
  },
  borderRadius: {
    xs: 6,
    sm: 10,
    md: 18,
    lg: 24, // Modern continuous squircle card
    xl: 30,
    full: 9999, // Stadium Pill button & badges
  },
  typography: {
    headingHero: {
      fontSize: 28,
      fontWeight: '800' as const,
      lineHeight: 34,
      letterSpacing: -0.5,
    },
    headingTitle: {
      fontSize: 22,
      fontWeight: '700' as const,
      lineHeight: 28,
      letterSpacing: -0.3,
    },
    headingSection: {
      fontSize: 18,
      fontWeight: '700' as const,
      lineHeight: 24,
    },
    body: {
      fontSize: 14,
      lineHeight: 20,
    },
    caption: {
      fontSize: 12,
      lineHeight: 16,
    },
  },
} as const;
