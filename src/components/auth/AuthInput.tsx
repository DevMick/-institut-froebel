/**
 * Auth Input Component - Rotary Club Mobile
 * Composant input Material Design avec floating label et validation visuelle
 */

import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  Animated,
  TouchableOpacity,
  TextInputProps,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { THEME } from '../../config/theme';

interface AuthInputProps extends Omit<TextInputProps, 'style'> {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  error?: string;
  leftIcon?: string;
  rightIcon?: string;
  onRightIconPress?: () => void;
  secureTextEntry?: boolean;
  showPasswordToggle?: boolean;
  characterCount?: boolean;
  maxLength?: number;
  required?: boolean;
  style?: object;
}

export const AuthInput: React.FC<AuthInputProps> = ({
  label,
  value,
  onChangeText,
  error,
  leftIcon,
  rightIcon,
  onRightIconPress,
  secureTextEntry = false,
  showPasswordToggle = false,
  characterCount = false,
  maxLength,
  required = false,
  style,
  ...textInputProps
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  
  // Animations
  const labelPosition = useRef(new Animated.Value(value ? 1 : 0)).current;
  const borderColor = useRef(new Animated.Value(0)).current;
  const errorOpacity = useRef(new Animated.Value(0)).current;

  // État dérivé
  const hasValue = value.length > 0;
  const hasError = !!error;
  const isSecure = secureTextEntry && !isPasswordVisible;
  const shouldShowPasswordToggle = showPasswordToggle && secureTextEntry;

  // Animation du label
  useEffect(() => {
    Animated.timing(labelPosition, {
      toValue: isFocused || hasValue ? 1 : 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
  }, [isFocused, hasValue, labelPosition]);

  // Animation de la bordure
  useEffect(() => {
    Animated.timing(borderColor, {
      toValue: hasError ? 2 : isFocused ? 1 : 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
  }, [isFocused, hasError, borderColor]);

  // Animation de l'erreur
  useEffect(() => {
    Animated.timing(errorOpacity, {
      toValue: hasError ? 1 : 0,
      duration: 200,
      useNativeDriver: true,
    }).start();
  }, [hasError, errorOpacity]);

  const handleFocus = () => {
    setIsFocused(true);
  };

  const handleBlur = () => {
    setIsFocused(false);
  };

  const togglePasswordVisibility = () => {
    setIsPasswordVisible(!isPasswordVisible);
  };

  const handleRightIconPress = () => {
    if (shouldShowPasswordToggle) {
      togglePasswordVisibility();
    } else if (onRightIconPress) {
      onRightIconPress();
    }
  };

  // Interpolations d'animation
  const labelStyle = {
    top: labelPosition.interpolate({
      inputRange: [0, 1],
      outputRange: [20, 4],
    }),
    fontSize: labelPosition.interpolate({
      inputRange: [0, 1],
      outputRange: [THEME.typography.FONT_SIZE.MD, THEME.typography.FONT_SIZE.XS],
    }),
    color: labelPosition.interpolate({
      inputRange: [0, 1],
      outputRange: [THEME.colors.GRAY_500, isFocused ? THEME.colors.PRIMARY : THEME.colors.GRAY_600],
    }),
  };

  const containerBorderColor = borderColor.interpolate({
    inputRange: [0, 1, 2],
    outputRange: [THEME.colors.OUTLINE_VARIANT, THEME.colors.PRIMARY, THEME.colors.ERROR],
  });

  const containerBorderWidth = borderColor.interpolate({
    inputRange: [0, 1, 2],
    outputRange: [1, 2, 2],
  });

  return (
    <View style={[styles.container, style]}>
      {/* Container principal avec bordure animée */}
      <Animated.View
        style={[
          styles.inputContainer,
          {
            borderColor: containerBorderColor,
            borderWidth: containerBorderWidth,
          },
        ]}
      >
        {/* Icône gauche */}
        {leftIcon && (
          <View style={styles.leftIconContainer}>
            <Icon
              name={leftIcon}
              size={24}
              color={isFocused ? THEME.colors.PRIMARY : THEME.colors.GRAY_500}
            />
          </View>
        )}

        {/* Zone de saisie */}
        <View style={styles.inputWrapper}>
          {/* Label flottant */}
          <Animated.Text
            style={[styles.label, labelStyle]}
            numberOfLines={1}
          >
            {label}{required && ' *'}
          </Animated.Text>

          {/* Input */}
          <TextInput
            style={[
              styles.input,
              leftIcon && styles.inputWithLeftIcon,
              (shouldShowPasswordToggle || rightIcon) && styles.inputWithRightIcon,
            ]}
            value={value}
            onChangeText={onChangeText}
            onFocus={handleFocus}
            onBlur={handleBlur}
            secureTextEntry={isSecure}
            maxLength={maxLength}
            placeholderTextColor={THEME.colors.GRAY_400}
            selectionColor={THEME.colors.PRIMARY}
            {...textInputProps}
          />
        </View>

        {/* Icône droite / Toggle password */}
        {(shouldShowPasswordToggle || rightIcon) && (
          <TouchableOpacity
            style={styles.rightIconContainer}
            onPress={handleRightIconPress}
            accessibilityLabel={
              shouldShowPasswordToggle
                ? isPasswordVisible
                  ? 'Masquer le mot de passe'
                  : 'Afficher le mot de passe'
                : 'Action'
            }
          >
            <Icon
              name={
                shouldShowPasswordToggle
                  ? isPasswordVisible
                    ? 'visibility-off'
                    : 'visibility'
                  : rightIcon || 'help'
              }
              size={24}
              color={isFocused ? THEME.colors.PRIMARY : THEME.colors.GRAY_500}
            />
          </TouchableOpacity>
        )}
      </Animated.View>

      {/* Zone d'information (erreur + compteur) */}
      <View style={styles.infoContainer}>
        {/* Message d'erreur */}
        <Animated.View
          style={[
            styles.errorContainer,
            { opacity: errorOpacity },
          ]}
        >
          {hasError && (
            <>
              <Icon
                name="error"
                size={16}
                color={THEME.colors.ERROR}
                style={styles.errorIcon}
              />
              <Text style={styles.errorText}>{error}</Text>
            </>
          )}
        </Animated.View>

        {/* Compteur de caractères */}
        {characterCount && maxLength && (
          <Text style={styles.characterCount}>
            {value.length}/{maxLength}
          </Text>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: THEME.spacing.LG,
  },

  inputContainer: {
    borderRadius: THEME.radius.MD,
    backgroundColor: THEME.colors.SURFACE,
    minHeight: 56,
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
  },

  leftIconContainer: {
    paddingLeft: THEME.spacing.MD,
    paddingRight: THEME.spacing.SM,
  },

  inputWrapper: {
    flex: 1,
    position: 'relative',
    paddingHorizontal: THEME.spacing.MD,
  },

  label: {
    position: 'absolute',
    left: 0,
    fontWeight: THEME.typography.FONT_WEIGHT.MEDIUM,
    backgroundColor: THEME.colors.SURFACE,
    paddingHorizontal: 4,
    zIndex: 1,
  },

  input: {
    fontSize: THEME.typography.FONT_SIZE.MD,
    color: THEME.colors.ON_SURFACE,
    paddingTop: 20,
    paddingBottom: 8,
    margin: 0,
    padding: 0,
  },

  inputWithLeftIcon: {
    // Déjà géré par le wrapper
  },

  inputWithRightIcon: {
    paddingRight: THEME.spacing.SM,
  },

  rightIconContainer: {
    paddingRight: THEME.spacing.MD,
    paddingLeft: THEME.spacing.SM,
    minWidth: 44,
    minHeight: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },

  infoContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    minHeight: 20,
    paddingHorizontal: THEME.spacing.MD,
    paddingTop: THEME.spacing.XS,
  },

  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },

  errorIcon: {
    marginRight: THEME.spacing.XS,
  },

  errorText: {
    fontSize: THEME.typography.FONT_SIZE.XS,
    color: THEME.colors.ERROR,
    flex: 1,
    lineHeight: THEME.typography.LINE_HEIGHT.XS,
  },

  characterCount: {
    fontSize: THEME.typography.FONT_SIZE.XS,
    color: THEME.colors.GRAY_500,
    marginLeft: THEME.spacing.SM,
  },
});

export default AuthInput;
