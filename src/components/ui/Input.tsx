/**
 * Input Component - Rotary Club Mobile
 * Material Design Input avec floating label et validation
 */

import React, { useState, useRef, useMemo } from 'react';
import {
  View,
  TextInput,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  ViewStyle,
  TextStyle,
  TextInputProps,
} from 'react-native';
import { THEME } from '../../config/theme';
import type { InputType } from '../../types';
import { theme } from '../../theme';

interface InputProps extends Omit<TextInputProps, 'secureTextEntry'> {
  /**
   * Label du champ
   */
  label: string;
  
  /**
   * Type d'input pour la validation et le clavier
   * @default 'text'
   */
  type?: InputType;
  
  /**
   * Message d'erreur
   */
  error?: string;
  
  /**
   * Message d'aide
   */
  helperText?: string;
  
  /**
   * Valeur du champ
   */
  value: string;
  
  /**
   * Fonction appelée lors du changement
   */
  onChangeText: (text: string) => void;
  
  /**
   * Styles personnalisés pour le conteneur
   */
  style?: ViewStyle;
  
  /**
   * Styles personnalisés pour l'input
   */
  inputStyle?: TextStyle;
  
  /**
   * Afficher le compteur de caractères
   * @default false
   */
  showCharacterCount?: boolean;
  
  /**
   * Nombre maximum de caractères
   */
  maxLength?: number;
  
  /**
   * Icône à gauche
   */
  leftIcon?: React.ReactNode;
  
  /**
   * Icône à droite (custom)
   */
  rightIcon?: React.ReactNode;
  
  /**
   * Désactivé
   * @default false
   */
  disabled?: boolean;
  
  /**
   * Requis (affiche un astérisque)
   * @default false
   */
  required?: boolean;
  
  /**
   * Secure text entry
   * @default false
   */
  secureTextEntry?: boolean;
  
  /**
   * Keyboard type
   * @default 'default'
   */
  keyboardType?: 'default' | 'email-address' | 'numeric' | 'phone-pad';
  
  /**
   * Auto capitalize
   * @default 'none'
   */
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  
  /**
   * Multiline
   * @default false
   */
  multiline?: boolean;
  
  /**
   * Number of lines
   * @default 1
   */
  numberOfLines?: number;
}

/**
 * Composant Input avec Material Design floating label
 * 
 * @example
 * ```tsx
 * <Input
 *   label="Email"
 *   type="email"
 *   value={email}
 *   onChangeText={setEmail}
 *   error={emailError}
 *   required
 * />
 * ```
 */
export const Input: React.FC<InputProps> = React.memo(({
  label,
  type = 'text',
  error,
  helperText,
  value,
  onChangeText,
  style,
  inputStyle,
  showCharacterCount = false,
  maxLength,
  leftIcon,
  rightIcon,
  disabled = false,
  required = false,
  secureTextEntry = false,
  keyboardType = 'default',
  autoCapitalize = 'none',
  multiline = false,
  numberOfLines = 1,
  ...textInputProps
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const labelAnimation = useRef(new Animated.Value(value ? 1 : 0)).current;
  
  // Animation du label flottant
  const animateLabel = (toValue: number) => {
    Animated.timing(labelAnimation, {
      toValue,
      duration: 200,
      useNativeDriver: false,
    }).start();
  };
  
  const handleFocus = () => {
    setIsFocused(true);
    animateLabel(1);
  };
  
  const handleBlur = () => {
    setIsFocused(false);
    if (!value) {
      animateLabel(0);
    }
  };
  
  // Configuration du clavier selon le type
  const keyboardConfig = useMemo(() => {
    switch (type) {
      case 'email':
        return {
          keyboardType: 'email-address' as const,
          autoCapitalize: 'none' as const,
          autoCorrect: false,
        };
      case 'password':
        return {
          secureTextEntry: !isPasswordVisible,
          autoCapitalize: 'none' as const,
          autoCorrect: false,
        };
      case 'number':
        return {
          keyboardType: 'numeric' as const,
        };
      case 'phone':
        return {
          keyboardType: 'phone-pad' as const,
        };
      default:
        return {};
    }
  }, [type, isPasswordVisible]);
  
  // Styles calculés
  const containerStyles = useMemo(() => [
    styles.container,
    error && styles.containerError,
    disabled && styles.containerDisabled,
    style,
  ], [error, disabled, style]);
  
  const inputContainerStyles = useMemo(() => [
    styles.inputContainer,
    isFocused && styles.inputContainerFocused,
    error && styles.inputContainerError,
  ], [isFocused, error]);
  
  const inputStyles = useMemo(() => {
    const baseStyles = [styles.input];
    if (leftIcon) baseStyles.push(styles.inputWithLeftIcon);
    if (rightIcon || type === 'password') baseStyles.push(styles.inputWithRightIcon);
    if (inputStyle) baseStyles.push(inputStyle);
    return baseStyles;
  }, [leftIcon, rightIcon, type, inputStyle]);
  
  // Position du label animé
  const labelStyle = {
    position: 'absolute' as const,
    left: leftIcon ? 48 : THEME.spacing.LG,
    top: labelAnimation.interpolate({
      inputRange: [0, 1],
      outputRange: [20, 8],
    }),
    fontSize: labelAnimation.interpolate({
      inputRange: [0, 1],
      outputRange: [THEME.typography.FONT_SIZE.MD, THEME.typography.FONT_SIZE.SM],
    }),
    color: error 
      ? THEME.colors.ERROR 
      : isFocused 
        ? THEME.colors.PRIMARY 
        : THEME.colors.GRAY_600,
  };
  
  const togglePasswordVisibility = () => {
    setIsPasswordVisible(!isPasswordVisible);
  };
  
  return (
    <View style={containerStyles}>
      {/* Conteneur de l'input */}
      <View style={inputContainerStyles}>
        {/* Icône gauche */}
        {leftIcon && (
          <View style={styles.leftIconContainer}>
            {leftIcon}
          </View>
        )}
        
        {/* Label flottant */}
        <Animated.Text style={labelStyle}>
          {label}{required && ' *'}
        </Animated.Text>
        
        {/* Input */}
        <TextInput
          style={inputStyles}
          value={value}
          onChangeText={onChangeText}
          onFocus={handleFocus}
          onBlur={handleBlur}
          editable={!disabled}
          maxLength={maxLength}
          {...keyboardConfig}
          {...textInputProps}
          secureTextEntry={secureTextEntry}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          multiline={multiline}
          numberOfLines={numberOfLines}
        />
        
        {/* Icône droite ou toggle password */}
        {(rightIcon || type === 'password') && (
          <View style={styles.rightIconContainer}>
            {type === 'password' ? (
              <TouchableOpacity
                onPress={togglePasswordVisibility}
                style={styles.passwordToggle}
                accessibilityLabel={isPasswordVisible ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
              >
                <Text style={styles.passwordToggleText}>
                  {isPasswordVisible ? '🙈' : '👁️'}
                </Text>
              </TouchableOpacity>
            ) : (
              rightIcon
            )}
          </View>
        )}
      </View>
      
      {/* Messages d'aide et d'erreur */}
      <View style={styles.messageContainer}>
        <View style={styles.messageLeft}>
          {error ? (
            <Text style={styles.errorText}>{error}</Text>
          ) : helperText ? (
            <Text style={styles.helperText}>{helperText}</Text>
          ) : null}
        </View>
        
        {/* Compteur de caractères */}
        {showCharacterCount && maxLength && (
          <Text style={styles.characterCount}>
            {value.length}/{maxLength}
          </Text>
        )}
      </View>
    </View>
  );
});

Input.displayName = 'Input';

const styles = StyleSheet.create({
  container: {
    marginBottom: THEME.spacing.MD,
  },
  
  containerError: {
    // Styles spécifiques pour l'état d'erreur
  },
  
  containerDisabled: {
    opacity: 0.6,
  },
  
  inputContainer: {
    position: 'relative',
    borderWidth: 1,
    borderColor: THEME.colors.OUTLINE_VARIANT,
    borderRadius: THEME.borderRadius.SM,
    backgroundColor: THEME.colors.SURFACE,
    minHeight: THEME.dimensions.INPUT_HEIGHT.MEDIUM,
  },
  
  inputContainerFocused: {
    borderColor: THEME.colors.PRIMARY,
    borderWidth: 2,
  },
  
  inputContainerError: {
    borderColor: THEME.colors.ERROR,
    borderWidth: 2,
  },
  
  input: {
    flex: 1,
    paddingHorizontal: THEME.spacing.LG,
    paddingTop: THEME.spacing.XL,
    paddingBottom: THEME.spacing.SM,
    fontSize: THEME.typography.FONT_SIZE.MD,
    color: THEME.colors.ON_SURFACE,
  },
  
  inputWithLeftIcon: {
    paddingLeft: 48,
  },
  
  inputWithRightIcon: {
    paddingRight: 48,
  },
  
  leftIconContainer: {
    position: 'absolute',
    left: THEME.spacing.MD,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    width: 24,
    zIndex: 1,
  },
  
  rightIconContainer: {
    position: 'absolute',
    right: THEME.spacing.MD,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    width: 24,
    zIndex: 1,
  },
  
  passwordToggle: {
    padding: THEME.spacing.XS,
  },
  
  passwordToggleText: {
    fontSize: 16,
  },
  
  messageContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginTop: THEME.spacing.XS,
    paddingHorizontal: THEME.spacing.SM,
  },
  
  messageLeft: {
    flex: 1,
  },
  
  errorText: {
    fontSize: THEME.typography.FONT_SIZE.SM,
    color: THEME.colors.ERROR,
  },
  
  helperText: {
    fontSize: THEME.typography.FONT_SIZE.SM,
    color: THEME.colors.GRAY_600,
  },
  
  characterCount: {
    fontSize: THEME.typography.FONT_SIZE.SM,
    color: THEME.colors.GRAY_600,
    marginLeft: THEME.spacing.SM,
  },
});

export default Input;
