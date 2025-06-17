/**
 * Design System & Theme Configuration - Rotary Club Mobile
 * Couleurs officielles Rotary International et Material Design Android
 */

import { TextStyle } from 'react-native';

// ===== COULEURS ROTARY OFFICIELLES =====
export const ROTARY_COLORS = {
  // Couleurs principales Rotary International
  PRIMARY: '#005AA9', // Rotary Blue officiel
  SECONDARY: '#F7A81B', // Rotary Gold officiel
  WHITE: '#FFFFFF',
  
  // Variations du bleu Rotary
  PRIMARY_50: '#E3F2FD',
  PRIMARY_100: '#BBDEFB',
  PRIMARY_200: '#90CAF9',
  PRIMARY_300: '#64B5F6',
  PRIMARY_400: '#42A5F5',
  PRIMARY_500: '#005AA9', // Principal
  PRIMARY_600: '#004A94',
  PRIMARY_700: '#003A7F',
  PRIMARY_800: '#002A6A',
  PRIMARY_900: '#001A55',
  
  // Variations du gold Rotary
  SECONDARY_50: '#FFF8E1',
  SECONDARY_100: '#FFECB3',
  SECONDARY_200: '#FFE082',
  SECONDARY_300: '#FFD54F',
  SECONDARY_400: '#FFCA28',
  SECONDARY_500: '#F7A81B', // Principal
  SECONDARY_600: '#FF8F00',
  SECONDARY_700: '#FF6F00',
  SECONDARY_800: '#E65100',
  SECONDARY_900: '#BF360C',
} as const;

// ===== PALETTE SYSTÈME =====
export const SYSTEM_COLORS = {
  // États
  SUCCESS: '#4CAF50',
  SUCCESS_LIGHT: '#81C784',
  SUCCESS_DARK: '#388E3C',
  
  WARNING: '#FF9800',
  WARNING_LIGHT: '#FFB74D',
  WARNING_DARK: '#F57C00',
  
  ERROR: '#F44336',
  ERROR_LIGHT: '#E57373',
  ERROR_DARK: '#D32F2F',
  
  INFO: '#2196F3',
  INFO_LIGHT: '#64B5F6',
  INFO_DARK: '#1976D2',
  
  // Grays Material Design
  GRAY_50: '#FAFAFA',
  GRAY_100: '#F5F5F5',
  GRAY_200: '#EEEEEE',
  GRAY_300: '#E0E0E0',
  GRAY_400: '#BDBDBD',
  GRAY_500: '#9E9E9E',
  GRAY_600: '#757575',
  GRAY_700: '#616161',
  GRAY_800: '#424242',
  GRAY_900: '#212121',
  
  // Surfaces
  BACKGROUND: '#FFFFFF',
  SURFACE: '#FFFFFF',
  SURFACE_VARIANT: '#F5F5F5',
  
  // Texte
  ON_PRIMARY: '#FFFFFF',
  ON_SECONDARY: '#000000',
  ON_SURFACE: '#212121',
  ON_BACKGROUND: '#212121',
  ON_ERROR: '#FFFFFF',
  
  // Dividers et borders
  DIVIDER: '#E0E0E0',
  OUTLINE: '#757575',
  OUTLINE_VARIANT: '#BDBDBD',
} as const;

// ===== TYPOGRAPHY SCALE =====
export const TYPOGRAPHY = {
  // Font sizes
  FONT_SIZE: {
    XS: 12,
    SM: 14,
    MD: 16,
    LG: 18,
    XL: 20,
    XXL: 24,
    XXXL: 32,
    DISPLAY: 48,
  },
  
  // Line heights
  LINE_HEIGHT: {
    XS: 16,
    SM: 20,
    MD: 24,
    LG: 28,
    XL: 32,
    XXL: 36,
    XXXL: 48,
    DISPLAY: 64,
  },
  
  // Font weights
  FONT_WEIGHT: {
    LIGHT: '300' as TextStyle['fontWeight'],
    REGULAR: '400' as TextStyle['fontWeight'],
    MEDIUM: '500' as TextStyle['fontWeight'],
    SEMI_BOLD: '600' as TextStyle['fontWeight'],
    BOLD: '700' as TextStyle['fontWeight'],
    EXTRA_BOLD: '800' as TextStyle['fontWeight'],
  },
  
  // Font families (System fonts pour performance)
  FONT_FAMILY: {
    REGULAR: 'System',
    MEDIUM: 'System',
    BOLD: 'System',
  },
} as const;

// ===== SPACING SYSTÈME =====
export const SPACING = {
  XS: 4,
  SM: 8,
  MD: 12,
  LG: 16,
  XL: 20,
  XXL: 24,
  XXXL: 32,
  HUGE: 48,
  MASSIVE: 64,
} as const;

// ===== BORDER RADIUS =====
export const BORDER_RADIUS = {
  XS: 4,
  SM: 8,
  MD: 12,
  LG: 16,
  XL: 24,
  ROUND: 999,
} as const;

// ===== SHADOWS MATERIAL DESIGN =====
export const SHADOWS = {
  NONE: {
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  
  SMALL: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.12,
    shadowRadius: 2,
    elevation: 2,
  },
  
  MEDIUM: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.16,
    shadowRadius: 4,
    elevation: 4,
  },
  
  LARGE: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.20,
    shadowRadius: 8,
    elevation: 8,
  },
  
  EXTRA_LARGE: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.24,
    shadowRadius: 16,
    elevation: 16,
  },
} as const;

// ===== Z-INDEX SCALE =====
export const Z_INDEX = {
  BACKGROUND: -1,
  DEFAULT: 0,
  CONTENT: 1,
  HEADER: 10,
  OVERLAY: 100,
  MODAL: 1000,
  TOAST: 2000,
  TOOLTIP: 3000,
} as const;

// ===== DIMENSIONS =====
export const DIMENSIONS = {
  // Touch targets (minimum 44px pour accessibilité)
  TOUCH_TARGET_MIN: 44,
  
  // Composants
  BUTTON_HEIGHT: {
    SMALL: 32,
    MEDIUM: 44,
    LARGE: 56,
  },
  
  INPUT_HEIGHT: {
    SMALL: 40,
    MEDIUM: 48,
    LARGE: 56,
  },
  
  HEADER_HEIGHT: 56,
  TAB_BAR_HEIGHT: 60,
  FAB_SIZE: 56,
  
  // Breakpoints responsive
  BREAKPOINTS: {
    SMALL: 360,
    MEDIUM: 768,
    LARGE: 1024,
  },
} as const;

// ===== ANIMATIONS =====
export const ANIMATIONS = {
  DURATION: {
    FAST: 150,
    NORMAL: 250,
    SLOW: 350,
  },
  
  EASING: {
    EASE_IN: 'ease-in',
    EASE_OUT: 'ease-out',
    EASE_IN_OUT: 'ease-in-out',
  },
} as const;

// ===== THÈME PRINCIPAL =====
export const THEME = {
  colors: {
    ...ROTARY_COLORS,
    ...SYSTEM_COLORS,
  },
  typography: TYPOGRAPHY,
  spacing: SPACING,
  borderRadius: BORDER_RADIUS,
  shadows: SHADOWS,
  zIndex: Z_INDEX,
  dimensions: DIMENSIONS,
  animations: ANIMATIONS,
} as const;

// ===== TYPES =====
export type Theme = typeof THEME;
export type ThemeColors = typeof THEME.colors;
export type ThemeSpacing = typeof SPACING;
export type ThemeShadows = typeof SHADOWS;

export default THEME;
