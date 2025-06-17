/**
 * Platform Utilities - Rotary Club Mobile
 * Détection platform, helpers responsive et utilitaires UI
 */

import { 
  Platform, 
  Dimensions, 
  StatusBar, 
  PixelRatio,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { THEME } from '../config/theme';

// ===== DÉTECTION PLATFORM =====

/**
 * Vérifie si l'app s'exécute sur Android
 */
export const isAndroid = Platform.OS === 'android';

/**
 * Vérifie si l'app s'exécute sur iOS
 */
export const isIOS = Platform.OS === 'ios';

/**
 * Obtient la version de l'OS
 */
export const getOSVersion = (): string | number => {
  return Platform.Version;
};

/**
 * Vérifie si c'est Android API 23+ (pour les permissions runtime)
 */
export const isAndroid23Plus = (): boolean => {
  return isAndroid && typeof Platform.Version === 'number' && Platform.Version >= 23;
};

// ===== DIMENSIONS & RESPONSIVE =====

/**
 * Obtient les dimensions actuelles de l'écran
 */
export const getScreenDimensions = () => {
  const { width, height } = Dimensions.get('screen');
  return { width, height };
};

/**
 * Obtient les dimensions de la fenêtre (sans status bar, etc.)
 */
export const getWindowDimensions = () => {
  const { width, height } = Dimensions.get('window');
  return { width, height };
};

/**
 * Vérifie si l'écran est en mode paysage
 */
export const isLandscape = (): boolean => {
  const { width, height } = getScreenDimensions();
  return width > height;
};

/**
 * Vérifie si l'écran est en mode portrait
 */
export const isPortrait = (): boolean => {
  return !isLandscape();
};

/**
 * Détermine la taille d'écran selon les breakpoints
 */
export const getScreenSize = (): 'small' | 'medium' | 'large' => {
  const { width } = getScreenDimensions();
  
  if (width < THEME.dimensions.BREAKPOINTS.SMALL) {
    return 'small';
  } else if (width < THEME.dimensions.BREAKPOINTS.MEDIUM) {
    return 'medium';
  } else {
    return 'large';
  }
};

/**
 * Vérifie si c'est un petit écran
 */
export const isSmallScreen = (): boolean => {
  return getScreenSize() === 'small';
};

/**
 * Vérifie si c'est un grand écran (tablette)
 */
export const isTablet = (): boolean => {
  return getScreenSize() === 'large';
};

// ===== HELPERS RESPONSIVE =====

/**
 * Calcule une valeur responsive basée sur la largeur d'écran
 */
export const responsiveWidth = (percentage: number): number => {
  const { width } = getScreenDimensions();
  return (percentage * width) / 100;
};

/**
 * Calcule une valeur responsive basée sur la hauteur d'écran
 */
export const responsiveHeight = (percentage: number): number => {
  const { height } = getScreenDimensions();
  return (percentage * height) / 100;
};

/**
 * Calcule une taille de police responsive
 */
export const responsiveFontSize = (size: number): number => {
  const scale = getScreenDimensions().width / 375; // Base iPhone 6/7/8
  const newSize = size * scale;
  
  // Limiter les tailles extrêmes
  return Math.max(12, Math.min(newSize, size * 1.3));
};

/**
 * Obtient un spacing responsive selon la taille d'écran
 */
export const getResponsiveSpacing = (
  small: number, 
  medium: number, 
  large: number
): number => {
  const screenSize = getScreenSize();
  
  switch (screenSize) {
    case 'small':
      return small;
    case 'large':
      return large;
    default:
      return medium;
  }
};

// ===== STATUS BAR UTILS =====

/**
 * Obtient la hauteur de la status bar
 */
export const getStatusBarHeight = (): number => {
  if (isIOS) {
    return 20; // Valeur par défaut iOS
  }
  return StatusBar.currentHeight || 0;
};

/**
 * Styles pour la status bar selon la platform
 */
export const getStatusBarStyle = (isDark: boolean = false) => {
  return {
    backgroundColor: isAndroid ? THEME.colors.PRIMARY : 'transparent',
    barStyle: isDark ? 'light-content' : 'dark-content' as const,
    translucent: isAndroid,
  };
};

// ===== SAFE AREA HELPERS =====

/**
 * Obtient le padding top pour éviter la status bar
 */
export const getSafeAreaTopPadding = (): number => {
  if (isAndroid) {
    return getStatusBarHeight();
  }
  return 0; // iOS géré par SafeAreaView
};

/**
 * Obtient le padding bottom pour éviter les gestes système
 */
export const getSafeAreaBottomPadding = (): number => {
  if (isIOS) {
    // Approximation pour les iPhones avec home indicator
    const { height } = getScreenDimensions();
    return height >= 812 ? 34 : 0;
  }
  return 0;
};

// ===== STYLES CONDITIONNELS =====

/**
 * Applique des styles selon la platform
 */
export const platformStyles = <T extends ViewStyle | TextStyle>(
  androidStyle: T,
  iosStyle: T
): T => {
  return isAndroid ? androidStyle : iosStyle;
};

/**
 * Applique des styles selon la taille d'écran
 */
export const responsiveStyles = <T extends ViewStyle | TextStyle>(
  smallStyle: T,
  mediumStyle: T,
  largeStyle: T
): T => {
  const screenSize = getScreenSize();
  
  switch (screenSize) {
    case 'small':
      return smallStyle;
    case 'large':
      return largeStyle;
    default:
      return mediumStyle;
  }
};

/**
 * Crée des styles avec shadow selon la platform
 */
export const createShadowStyle = (elevation: number) => {
  if (isAndroid) {
    return {
      elevation,
    };
  } else {
    // iOS shadow
    const shadowOpacity = elevation * 0.02;
    const shadowRadius = elevation * 0.5;
    
    return {
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: elevation * 0.25,
      },
      shadowOpacity,
      shadowRadius,
    };
  }
};

// ===== PIXEL RATIO & DENSITY =====

/**
 * Obtient le pixel ratio de l'appareil
 */
export const getPixelRatio = (): number => {
  return PixelRatio.get();
};

/**
 * Convertit une valeur en pixels denses
 */
export const toDp = (px: number): number => {
  return PixelRatio.getPixelSizeForLayoutSize(px);
};

/**
 * Convertit une valeur de pixels denses en pixels
 */
export const toPx = (dp: number): number => {
  return PixelRatio.roundToNearestPixel(dp);
};

// ===== HELPERS TOUCH TARGETS =====

/**
 * Assure qu'un touch target respecte la taille minimum d'accessibilité
 */
export const ensureMinTouchTarget = (size: number): number => {
  return Math.max(size, THEME.dimensions.TOUCH_TARGET_MIN);
};

/**
 * Crée un style pour un touch target accessible
 */
export const createTouchTargetStyle = (size?: number): ViewStyle => {
  const targetSize = ensureMinTouchTarget(size || THEME.dimensions.TOUCH_TARGET_MIN);
  
  return {
    minWidth: targetSize,
    minHeight: targetSize,
    justifyContent: 'center',
    alignItems: 'center',
  };
};

// ===== EXPORT GROUPÉ =====
export const PlatformUtils = {
  // Platform detection
  isAndroid,
  isIOS,
  getOSVersion,
  isAndroid23Plus,
  
  // Dimensions
  getScreenDimensions,
  getWindowDimensions,
  isLandscape,
  isPortrait,
  getScreenSize,
  isSmallScreen,
  isTablet,
  
  // Responsive
  responsiveWidth,
  responsiveHeight,
  responsiveFontSize,
  getResponsiveSpacing,
  
  // Status bar
  getStatusBarHeight,
  getStatusBarStyle,
  
  // Safe area
  getSafeAreaTopPadding,
  getSafeAreaBottomPadding,
  
  // Styles
  platformStyles,
  responsiveStyles,
  createShadowStyle,
  
  // Pixel ratio
  getPixelRatio,
  toDp,
  toPx,
  
  // Touch targets
  ensureMinTouchTarget,
  createTouchTargetStyle,
};

export default PlatformUtils;
