// Configuration constants for the Rotary Club Mobile application

export const API_CONFIG = {
  BASE_URL: __DEV__ 
    ? 'http://localhost:3000/api' 
    : 'https://api.rotaryclub.com',
  TIMEOUT: 10000,
  RETRY_ATTEMPTS: 3,
};

export const APP_CONFIG = {
  NAME: 'Rotary Club Mobile',
  VERSION: '1.0.0',
  BUNDLE_ID: 'com.rotaryclub.mobile',
  DEEP_LINK_SCHEME: 'rotaryclub',
};

export const STORAGE_KEYS = {
  USER_TOKEN: '@rotary_user_token',
  USER_DATA: '@rotary_user_data',
  THEME_PREFERENCE: '@rotary_theme',
  LANGUAGE_PREFERENCE: '@rotary_language',
  ONBOARDING_COMPLETED: '@rotary_onboarding',
  NOTIFICATION_SETTINGS: '@rotary_notifications',
};

export const COLORS = {
  // Rotary International Brand Colors
  ROTARY_BLUE: '#1F4F96',
  ROTARY_GOLD: '#F7A81B',
  
  // Primary palette
  PRIMARY: '#1F4F96',
  PRIMARY_LIGHT: '#4A73B8',
  PRIMARY_DARK: '#0D2B5C',
  
  // Secondary palette
  SECONDARY: '#F7A81B',
  SECONDARY_LIGHT: '#FFD54F',
  SECONDARY_DARK: '#C77700',
  
  // Neutral colors
  WHITE: '#FFFFFF',
  BLACK: '#000000',
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
  
  // Status colors
  SUCCESS: '#4CAF50',
  WARNING: '#FF9800',
  ERROR: '#F44336',
  INFO: '#2196F3',
  
  // Background colors
  BACKGROUND: '#FFFFFF',
  SURFACE: '#F8F9FA',
  CARD: '#FFFFFF',
};

export const SPACING = {
  XS: 4,
  SM: 8,
  MD: 16,
  LG: 24,
  XL: 32,
  XXL: 48,
};

export const TYPOGRAPHY = {
  FONT_FAMILY: {
    REGULAR: 'System',
    MEDIUM: 'System',
    BOLD: 'System',
  },
  FONT_SIZE: {
    XS: 12,
    SM: 14,
    MD: 16,
    LG: 18,
    XL: 20,
    XXL: 24,
    XXXL: 32,
  },
  LINE_HEIGHT: {
    XS: 16,
    SM: 20,
    MD: 24,
    LG: 28,
    XL: 32,
    XXL: 36,
    XXXL: 48,
  },
};

export const DIMENSIONS = {
  SCREEN_PADDING: SPACING.MD,
  HEADER_HEIGHT: 56,
  TAB_BAR_HEIGHT: 60,
  BUTTON_HEIGHT: 48,
  INPUT_HEIGHT: 48,
  CARD_BORDER_RADIUS: 8,
  BUTTON_BORDER_RADIUS: 8,
};

export const ANIMATION = {
  DURATION: {
    SHORT: 200,
    MEDIUM: 300,
    LONG: 500,
  },
  EASING: {
    EASE_IN: 'ease-in',
    EASE_OUT: 'ease-out',
    EASE_IN_OUT: 'ease-in-out',
  },
};

export const VALIDATION = {
  EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PHONE_REGEX: /^\+?[\d\s\-()]+$/,
  PASSWORD_MIN_LENGTH: 8,
  NAME_MIN_LENGTH: 2,
  NAME_MAX_LENGTH: 50,
};

export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,
};

export const CACHE = {
  TTL: {
    SHORT: 5 * 60 * 1000, // 5 minutes
    MEDIUM: 30 * 60 * 1000, // 30 minutes
    LONG: 24 * 60 * 60 * 1000, // 24 hours
  },
};

export const PERMISSIONS = {
  CAMERA: 'camera',
  PHOTO_LIBRARY: 'photo-library',
  LOCATION: 'location',
  NOTIFICATIONS: 'notifications',
} as const;

// Export theme
export { THEME } from './theme';
export type { Theme, ThemeColors, ThemeSpacing, ThemeShadows } from './theme';

export default {
  API_CONFIG,
  APP_CONFIG,
  STORAGE_KEYS,
  COLORS,
  SPACING,
  TYPOGRAPHY,
  DIMENSIONS,
  ANIMATION,
  VALIDATION,
  PAGINATION,
  CACHE,
  PERMISSIONS,
};
