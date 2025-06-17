/**
 * QR Scanner Component - Rotary Club Mobile
 * Composant scanner QR avec overlay, animations, torch et fallback manual
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Animated,
  TextInput,
  Modal,
  Dimensions,
  Platform,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { check, request, PERMISSIONS, RESULTS } from 'react-native-permissions';
// import HapticFeedback from 'react-native-haptic-feedback';
import { THEME } from '../../config/theme';
import { Button } from '../ui';
import { qrService, QRValidationResult } from '../../services/qrService';

interface QRScannerProps {
  onScanSuccess: (result: QRValidationResult) => void;
  onScanError?: (error: string) => void;
  onClose?: () => void;
  style?: object;
  showManualInput?: boolean;
  instructions?: string;
}

const { width, height } = Dimensions.get('window');
const SCAN_AREA_SIZE = width * 0.7;

export const QRScanner: React.FC<QRScannerProps> = ({
  onScanSuccess,
  onScanError,
  onClose,
  style,
  showManualInput = true,
  instructions = 'Positionnez le QR Code dans le cadre',
}) => {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [torchOn, setTorchOn] = useState(false);
  const [scanning, setScanning] = useState(true);
  const [showManualModal, setShowManualModal] = useState(false);
  const [manualInput, setManualInput] = useState('');
  const [cameraReady, setCameraReady] = useState(false);

  // Animations
  const scanLineAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    checkCameraPermission();
    startAnimations();
    
    return () => {
      stopAnimations();
    };
  }, []);

  // Vérifier les permissions caméra
  const checkCameraPermission = async () => {
    try {
      const permission = Platform.OS === 'ios' 
        ? PERMISSIONS.IOS.CAMERA 
        : PERMISSIONS.ANDROID.CAMERA;

      const result = await check(permission);
      
      switch (result) {
        case RESULTS.GRANTED:
          setHasPermission(true);
          break;
        case RESULTS.DENIED:
          requestCameraPermission();
          break;
        case RESULTS.BLOCKED:
          showPermissionBlockedAlert();
          break;
        default:
          setHasPermission(false);
      }
    } catch (error) {
      console.error('Error checking camera permission:', error);
      setHasPermission(false);
    }
  };

  // Demander les permissions caméra
  const requestCameraPermission = async () => {
    try {
      const permission = Platform.OS === 'ios' 
        ? PERMISSIONS.IOS.CAMERA 
        : PERMISSIONS.ANDROID.CAMERA;

      const result = await request(permission);
      setHasPermission(result === RESULTS.GRANTED);
      
      if (result === RESULTS.BLOCKED) {
        showPermissionBlockedAlert();
      }
    } catch (error) {
      console.error('Error requesting camera permission:', error);
      setHasPermission(false);
    }
  };

  // Afficher l'alerte de permission bloquée
  const showPermissionBlockedAlert = () => {
    Alert.alert(
      'Permission caméra requise',
      'Pour scanner les QR Codes, veuillez autoriser l\'accès à la caméra dans les paramètres.',
      [
        { text: 'Annuler', style: 'cancel' },
        { 
          text: 'Paramètres', 
          onPress: () => {
            // TODO: Ouvrir les paramètres de l'app
            console.log('Open app settings');
          }
        },
      ]
    );
  };

  // Démarrer les animations
  const startAnimations = () => {
    // Animation ligne de scan
    const scanAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(scanLineAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(scanLineAnim, {
          toValue: 0,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    );

    // Animation pulse du cadre
    const pulseAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );

    // Fade in
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();

    scanAnimation.start();
    pulseAnimation.start();
  };

  // Arrêter les animations
  const stopAnimations = () => {
    scanLineAnim.stopAnimation();
    pulseAnim.stopAnimation();
  };

  // Gérer le scan QR
  const handleQRCodeScanned = (data: string) => {
    if (!scanning) return;

    setScanning(false);
    
    // Feedback haptique
    // HapticFeedback.trigger('impactMedium');

    // Valider le QR Code
    const result = qrService.parseQRCode(data);
    
    if (result.valid) {
      // Feedback de succès
      // HapticFeedback.trigger('notificationSuccess');
      onScanSuccess(result);
    } else {
      // Feedback d'erreur
      // HapticFeedback.trigger('notificationError');
      onScanError?.(result.error || 'QR Code invalide');
      
      // Reprendre le scan après 2 secondes
      setTimeout(() => {
        setScanning(true);
      }, 2000);
    }
  };

  // Toggle torch
  const toggleTorch = () => {
    setTorchOn(prev => !prev);
    // HapticFeedback.trigger('impactLight');
  };

  // Gérer la saisie manuelle
  const handleManualInput = () => {
    if (!manualInput.trim()) {
      Alert.alert('Erreur', 'Veuillez saisir un code QR valide');
      return;
    }

    const result = qrService.parseQRCode(manualInput.trim());
    
    if (result.valid) {
      setShowManualModal(false);
      setManualInput('');
      onScanSuccess(result);
    } else {
      Alert.alert('Code invalide', result.error || 'Le code saisi n\'est pas valide');
    }
  };

  // Render overlay de scan
  const renderScanOverlay = () => (
    <View style={styles.overlay}>
      {/* Instructions */}
      <View style={styles.instructionsContainer}>
        <Text style={styles.instructions}>{instructions}</Text>
      </View>

      {/* Cadre de scan */}
      <View style={styles.scanAreaContainer}>
        <Animated.View 
          style={[
            styles.scanArea,
            { transform: [{ scale: pulseAnim }] }
          ]}
        >
          {/* Coins du cadre */}
          <View style={[styles.corner, styles.topLeft]} />
          <View style={[styles.corner, styles.topRight]} />
          <View style={[styles.corner, styles.bottomLeft]} />
          <View style={[styles.corner, styles.bottomRight]} />

          {/* Ligne de scan animée */}
          <Animated.View
            style={[
              styles.scanLine,
              {
                transform: [{
                  translateY: scanLineAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, SCAN_AREA_SIZE - 4],
                  }),
                }],
              },
            ]}
          />
        </Animated.View>
      </View>

      {/* Contrôles */}
      <View style={styles.controlsContainer}>
        {/* Torch */}
        <TouchableOpacity
          style={[styles.controlButton, torchOn && styles.controlButtonActive]}
          onPress={toggleTorch}
          accessibilityLabel={torchOn ? 'Éteindre la lampe' : 'Allumer la lampe'}
        >
          <Icon 
            name={torchOn ? 'flash-on' : 'flash-off'} 
            size={24} 
            color={torchOn ? THEME.colors.SECONDARY : THEME.colors.WHITE} 
          />
          <Text style={styles.controlButtonText}>Flash</Text>
        </TouchableOpacity>

        {/* Saisie manuelle */}
        {showManualInput && (
          <TouchableOpacity
            style={styles.controlButton}
            onPress={() => setShowManualModal(true)}
            accessibilityLabel="Saisie manuelle"
          >
            <Icon name="keyboard" size={24} color={THEME.colors.WHITE} />
            <Text style={styles.controlButtonText}>Manuel</Text>
          </TouchableOpacity>
        )}

        {/* Fermer */}
        {onClose && (
          <TouchableOpacity
            style={styles.controlButton}
            onPress={onClose}
            accessibilityLabel="Fermer le scanner"
          >
            <Icon name="close" size={24} color={THEME.colors.WHITE} />
            <Text style={styles.controlButtonText}>Fermer</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  // Render modal saisie manuelle
  const renderManualInputModal = () => (
    <Modal
      visible={showManualModal}
      transparent
      animationType="slide"
      onRequestClose={() => setShowManualModal(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Saisie manuelle</Text>
          <Text style={styles.modalSubtitle}>
            Saisissez ou collez le contenu du QR Code
          </Text>

          <TextInput
            style={styles.manualTextInput}
            value={manualInput}
            onChangeText={setManualInput}
            placeholder="Contenu du QR Code..."
            multiline
            numberOfLines={4}
            textAlignVertical="top"
            autoFocus
          />

          <View style={styles.modalButtons}>
            <Button
              title="Annuler"
              onPress={() => {
                setShowManualModal(false);
                setManualInput('');
              }}
              variant="outline"
              style={styles.modalButton}
            />
            
            <Button
              title="Valider"
              onPress={handleManualInput}
              variant="primary"
              style={styles.modalButton}
              disabled={!manualInput.trim()}
            />
          </View>
        </View>
      </View>
    </Modal>
  );

  // Render état sans permission
  if (hasPermission === false) {
    return (
      <View style={[styles.container, styles.permissionContainer, style]}>
        <Icon name="camera-alt" size={64} color={THEME.colors.GRAY_400} />
        <Text style={styles.permissionTitle}>Caméra non disponible</Text>
        <Text style={styles.permissionText}>
          L'accès à la caméra est nécessaire pour scanner les QR Codes.
        </Text>
        
        <Button
          title="Autoriser la caméra"
          onPress={requestCameraPermission}
          variant="primary"
          style={styles.permissionButton}
        />

        {showManualInput && (
          <Button
            title="Saisie manuelle"
            onPress={() => setShowManualModal(true)}
            variant="outline"
            style={styles.permissionButton}
          />
        )}

        {renderManualInputModal()}
      </View>
    );
  }

  // Render chargement
  if (hasPermission === null) {
    return (
      <View style={[styles.container, styles.loadingContainer, style]}>
        <Text style={styles.loadingText}>Initialisation de la caméra...</Text>
      </View>
    );
  }

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }, style]}>
      {/* TODO: Intégrer react-native-vision-camera ou alternative */}
      <View style={styles.cameraContainer}>
        <Text style={styles.cameraPlaceholder}>
          📷 Caméra QR Scanner
          {'\n'}(Intégration en cours)
        </Text>
        
        {/* Bouton de test */}
        <TouchableOpacity
          style={styles.testButton}
          onPress={() => {
            // Simuler un scan réussi avec un QR de test
            const testQR = qrService.generateTestQR();
            const result = qrService.parseQRCode(JSON.stringify(testQR));
            handleQRCodeScanned(JSON.stringify(testQR));
          }}
        >
          <Text style={styles.testButtonText}>Test QR Scan</Text>
        </TouchableOpacity>
      </View>

      {renderScanOverlay()}
      {renderManualInputModal()}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },

  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },

  loadingText: {
    color: THEME.colors.WHITE,
    fontSize: THEME.typography.FONT_SIZE.MD,
  },

  permissionContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: THEME.spacing.XXL,
    backgroundColor: THEME.colors.BACKGROUND,
  },

  permissionTitle: {
    fontSize: THEME.typography.FONT_SIZE.XL,
    fontWeight: THEME.typography.FONT_WEIGHT.BOLD,
    color: THEME.colors.ON_SURFACE,
    marginTop: THEME.spacing.LG,
    marginBottom: THEME.spacing.SM,
    textAlign: 'center',
  },

  permissionText: {
    fontSize: THEME.typography.FONT_SIZE.MD,
    color: THEME.colors.GRAY_600,
    textAlign: 'center',
    lineHeight: THEME.typography.LINE_HEIGHT.MD,
    marginBottom: THEME.spacing.XXL,
  },

  permissionButton: {
    marginBottom: THEME.spacing.MD,
    minWidth: 200,
  },

  cameraContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
  },

  cameraPlaceholder: {
    color: THEME.colors.WHITE,
    fontSize: THEME.typography.FONT_SIZE.LG,
    textAlign: 'center',
    marginBottom: THEME.spacing.XXL,
  },

  testButton: {
    backgroundColor: THEME.colors.PRIMARY,
    paddingHorizontal: THEME.spacing.LG,
    paddingVertical: THEME.spacing.MD,
    borderRadius: THEME.radius.MD,
  },

  testButtonText: {
    color: THEME.colors.WHITE,
    fontSize: THEME.typography.FONT_SIZE.MD,
    fontWeight: THEME.typography.FONT_WEIGHT.MEDIUM,
  },

  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'space-between',
  },

  instructionsContainer: {
    paddingTop: 60,
    paddingHorizontal: THEME.spacing.LG,
    alignItems: 'center',
  },

  instructions: {
    color: THEME.colors.WHITE,
    fontSize: THEME.typography.FONT_SIZE.MD,
    textAlign: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: THEME.spacing.LG,
    paddingVertical: THEME.spacing.SM,
    borderRadius: THEME.radius.MD,
  },

  scanAreaContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  scanArea: {
    width: SCAN_AREA_SIZE,
    height: SCAN_AREA_SIZE,
    position: 'relative',
  },

  corner: {
    position: 'absolute',
    width: 30,
    height: 30,
    borderColor: THEME.colors.SECONDARY,
    borderWidth: 3,
  },

  topLeft: {
    top: 0,
    left: 0,
    borderRightWidth: 0,
    borderBottomWidth: 0,
  },

  topRight: {
    top: 0,
    right: 0,
    borderLeftWidth: 0,
    borderBottomWidth: 0,
  },

  bottomLeft: {
    bottom: 0,
    left: 0,
    borderRightWidth: 0,
    borderTopWidth: 0,
  },

  bottomRight: {
    bottom: 0,
    right: 0,
    borderLeftWidth: 0,
    borderTopWidth: 0,
  },

  scanLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: THEME.colors.SECONDARY,
    shadowColor: THEME.colors.SECONDARY,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
  },

  controlsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingBottom: 60,
    paddingHorizontal: THEME.spacing.LG,
  },

  controlButton: {
    alignItems: 'center',
    padding: THEME.spacing.MD,
    borderRadius: THEME.radius.MD,
    backgroundColor: 'rgba(0,0,0,0.5)',
    minWidth: 80,
  },

  controlButtonActive: {
    backgroundColor: 'rgba(247,168,27,0.3)',
  },

  controlButtonText: {
    color: THEME.colors.WHITE,
    fontSize: THEME.typography.FONT_SIZE.XS,
    marginTop: THEME.spacing.XS,
  },

  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  modalContent: {
    backgroundColor: THEME.colors.SURFACE,
    borderRadius: THEME.radius.LG,
    padding: THEME.spacing.XXL,
    margin: THEME.spacing.LG,
    width: '90%',
    maxWidth: 400,
  },

  modalTitle: {
    fontSize: THEME.typography.FONT_SIZE.XL,
    fontWeight: THEME.typography.FONT_WEIGHT.BOLD,
    color: THEME.colors.ON_SURFACE,
    textAlign: 'center',
    marginBottom: THEME.spacing.SM,
  },

  modalSubtitle: {
    fontSize: THEME.typography.FONT_SIZE.SM,
    color: THEME.colors.GRAY_600,
    textAlign: 'center',
    marginBottom: THEME.spacing.LG,
  },

  manualTextInput: {
    borderWidth: 1,
    borderColor: THEME.colors.OUTLINE,
    borderRadius: THEME.radius.MD,
    padding: THEME.spacing.MD,
    fontSize: THEME.typography.FONT_SIZE.MD,
    color: THEME.colors.ON_SURFACE,
    backgroundColor: THEME.colors.BACKGROUND,
    marginBottom: THEME.spacing.LG,
    minHeight: 100,
  },

  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: THEME.spacing.MD,
  },

  modalButton: {
    flex: 1,
  },
});

export default QRScanner;
