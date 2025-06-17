/**
 * Social Login Button Component - Rotary Club Mobile
 * Composant boutons social login Google/Facebook avec branding
 */

import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  View,
  ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { THEME } from '../../config/theme';

type SocialProvider = 'google' | 'facebook' | 'apple';

interface SocialLoginButtonProps {
  provider: SocialProvider;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  style?: object;
  testID?: string;
}

interface ProviderConfig {
  name: string;
  icon: string;
  backgroundColor: string;
  textColor: string;
  borderColor?: string;
}

const PROVIDER_CONFIGS: Record<SocialProvider, ProviderConfig> = {
  google: {
    name: 'Google',
    icon: 'google',
    backgroundColor: '#FFFFFF',
    textColor: '#1F1F1F',
    borderColor: '#DADCE0',
  },
  facebook: {
    name: 'Facebook',
    icon: 'facebook',
    backgroundColor: '#1877F2',
    textColor: '#FFFFFF',
  },
  apple: {
    name: 'Apple',
    icon: 'apple',
    backgroundColor: '#000000',
    textColor: '#FFFFFF',
  },
};

export const SocialLoginButton: React.FC<SocialLoginButtonProps> = ({
  provider,
  onPress,
  loading = false,
  disabled = false,
  style,
  testID,
}) => {
  const config = PROVIDER_CONFIGS[provider];
  
  if (!config) {
    console.warn(`Unknown social provider: ${provider}`);
    return null;
  }

  const handlePress = () => {
    if (disabled || loading) return;
    onPress();
  };

  const getAccessibilityLabel = (): string => {
    return `Se connecter avec ${config.name}`;
  };

  const renderIcon = () => {
    if (loading) {
      return (
        <ActivityIndicator
          size="small"
          color={config.textColor}
          style={styles.loadingIcon}
        />
      );
    }

    // Pour Google, on utilise un style spécial
    if (provider === 'google') {
      return (
        <View style={styles.googleIconContainer}>
          <Text style={styles.googleIcon}>G</Text>
        </View>
      );
    }

    // Pour Facebook et Apple, on utilise des icônes Material
    return (
      <Icon
        name={config.icon}
        size={20}
        color={config.textColor}
        style={styles.icon}
      />
    );
  };

  return (
    <TouchableOpacity
      style={[
        styles.container,
        {
          backgroundColor: config.backgroundColor,
          borderColor: config.borderColor || config.backgroundColor,
        },
        disabled && styles.disabled,
        style,
      ]}
      onPress={handlePress}
      disabled={disabled || loading}
      accessibilityLabel={getAccessibilityLabel()}
      accessibilityRole="button"
      accessibilityState={{
        disabled: disabled || loading,
        busy: loading,
      }}
      testID={testID}
    >
      <View style={styles.content}>
        {renderIcon()}
        
        <Text
          style={[
            styles.text,
            { color: config.textColor },
            disabled && styles.disabledText,
          ]}
        >
          {loading
            ? 'Connexion...'
            : `Continuer avec ${config.name}`
          }
        </Text>
      </View>
    </TouchableOpacity>
  );
};

/**
 * Composant pour afficher plusieurs boutons sociaux
 */
interface SocialLoginGroupProps {
  providers: SocialProvider[];
  onPress: (provider: SocialProvider) => void;
  loading?: SocialProvider | null;
  disabled?: boolean;
  style?: object;
}

export const SocialLoginGroup: React.FC<SocialLoginGroupProps> = ({
  providers,
  onPress,
  loading = null,
  disabled = false,
  style,
}) => {
  return (
    <View style={[styles.group, style]}>
      <View style={styles.dividerContainer}>
        <View style={styles.dividerLine} />
        <Text style={styles.dividerText}>ou</Text>
        <View style={styles.dividerLine} />
      </View>

      {providers.map((provider) => (
        <SocialLoginButton
          key={provider}
          provider={provider}
          onPress={() => onPress(provider)}
          loading={loading === provider}
          disabled={disabled || loading !== null}
          style={styles.groupButton}
          testID={`social-login-${provider}`}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: THEME.radius.MD,
    borderWidth: 1,
    minHeight: 48,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: THEME.spacing.LG,
    paddingVertical: THEME.spacing.MD,
  },

  disabled: {
    opacity: 0.6,
  },

  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },

  icon: {
    marginRight: THEME.spacing.SM,
  },

  loadingIcon: {
    marginRight: THEME.spacing.SM,
  },

  // Google icon spécial
  googleIconContainer: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#4285F4',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: THEME.spacing.SM,
  },

  googleIcon: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },

  text: {
    fontSize: THEME.typography.FONT_SIZE.MD,
    fontWeight: THEME.typography.FONT_WEIGHT.MEDIUM,
    textAlign: 'center',
  },

  disabledText: {
    opacity: 0.6,
  },

  // Styles pour le groupe
  group: {
    marginVertical: THEME.spacing.LG,
  },

  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: THEME.spacing.LG,
  },

  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: THEME.colors.OUTLINE_VARIANT,
  },

  dividerText: {
    fontSize: THEME.typography.FONT_SIZE.SM,
    color: THEME.colors.GRAY_500,
    marginHorizontal: THEME.spacing.MD,
    fontWeight: THEME.typography.FONT_WEIGHT.MEDIUM,
  },

  groupButton: {
    marginBottom: THEME.spacing.SM,
  },
});

export default SocialLoginButton;
