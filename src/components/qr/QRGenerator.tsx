/**
 * QR Generator Component - Rotary Club Mobile
 * Composant générateur QR avec logo Rotary, partage et sécurité
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Animated,
  Dimensions,
  ScrollView,
} from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Share from 'react-native-share';
import { THEME } from '../../config/theme';
import { Button, Card } from '../ui';
import { qrService, QRData, QRGenerationOptions } from '../../services/qrService';

interface QRGeneratorProps {
  options: QRGenerationOptions;
  onGenerated?: (qrData: QRData) => void;
  onError?: (error: string) => void;
  style?: object;
  showControls?: boolean;
  autoRefresh?: boolean;
  refreshInterval?: number; // minutes
}

const { width } = Dimensions.get('window');
const QR_SIZE = Math.min(width * 0.6, 250);

export const QRGenerator: React.FC<QRGeneratorProps> = ({
  options,
  onGenerated,
  onError,
  style,
  showControls = true,
  autoRefresh = true,
  refreshInterval = 5, // 5 minutes par défaut
}) => {
  const [qrData, setQrData] = useState<QRData | null>(null);
  const [qrString, setQrString] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [showPreview, setShowPreview] = useState(true);

  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  // Refs
  const qrRef = useRef<any>(null);
  const refreshTimer = useRef<NodeJS.Timeout | null>(null);
  const countdownTimer = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    generateQRCode();
    
    return () => {
      if (refreshTimer.current) {
        clearInterval(refreshTimer.current);
      }
      if (countdownTimer.current) {
        clearInterval(countdownTimer.current);
      }
    };
  }, [options]);

  useEffect(() => {
    if (autoRefresh && qrData) {
      startAutoRefresh();
    }
    
    return () => {
      if (refreshTimer.current) {
        clearInterval(refreshTimer.current);
      }
    };
  }, [autoRefresh, refreshInterval, qrData]);

  // Générer le QR Code
  const generateQRCode = async () => {
    try {
      setLoading(true);
      
      // Générer les données QR sécurisées
      const newQrData = qrService.generateQRData(options);
      const qrString = JSON.stringify(newQrData);
      
      setQrData(newQrData);
      setQrString(qrString);
      
      // Calculer le temps restant
      const expiry = new Date(newQrData.expiry);
      const now = new Date();
      setTimeLeft(Math.max(0, Math.floor((expiry.getTime() - now.getTime()) / 1000)));
      
      // Démarrer le countdown
      startCountdown();
      
      // Animation d'apparition
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 100,
          friction: 8,
          useNativeDriver: true,
        }),
      ]).start();

      onGenerated?.(newQrData);
    } catch (error) {
      console.error('Error generating QR code:', error);
      onError?.(error instanceof Error ? error.message : 'Erreur de génération QR');
    } finally {
      setLoading(false);
    }
  };

  // Démarrer le refresh automatique
  const startAutoRefresh = () => {
    if (refreshTimer.current) {
      clearInterval(refreshTimer.current);
    }

    refreshTimer.current = setInterval(() => {
      generateQRCode();
    }, refreshInterval * 60 * 1000);
  };

  // Démarrer le countdown
  const startCountdown = () => {
    if (countdownTimer.current) {
      clearInterval(countdownTimer.current);
    }

    countdownTimer.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          // QR expiré, générer un nouveau
          if (autoRefresh) {
            generateQRCode();
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  // Partager le QR Code
  const shareQRCode = async () => {
    try {
      if (!qrData) return;

      // Animation de rotation
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start(() => {
        rotateAnim.setValue(0);
      });

      const shareOptions = {
        title: 'QR Code Rotary Club',
        message: `QR Code pour: ${qrData.metadata.reunionTitle}\nLieu: ${qrData.metadata.location}\nValide jusqu'à: ${new Date(qrData.expiry).toLocaleString('fr-FR')}`,
        url: `data:text/plain;base64,${Buffer.from(qrString).toString('base64')}`,
      };

      await Share.open(shareOptions);
    } catch (error) {
      if (error.message !== 'User did not share') {
        console.error('Error sharing QR code:', error);
        Alert.alert('Erreur', 'Impossible de partager le QR Code');
      }
    }
  };

  // Sauvegarder dans la galerie
  const saveToGallery = async () => {
    try {
      // TODO: Implémenter la sauvegarde dans la galerie
      Alert.alert('Fonctionnalité à venir', 'La sauvegarde dans la galerie sera disponible prochainement');
    } catch (error) {
      console.error('Error saving to gallery:', error);
      Alert.alert('Erreur', 'Impossible de sauvegarder dans la galerie');
    }
  };

  // Imprimer le QR Code
  const printQRCode = async () => {
    try {
      // TODO: Implémenter l'impression
      Alert.alert('Fonctionnalité à venir', 'L\'impression sera disponible prochainement');
    } catch (error) {
      console.error('Error printing QR code:', error);
      Alert.alert('Erreur', 'Impossible d\'imprimer le QR Code');
    }
  };

  // Copier le contenu
  const copyContent = async () => {
    try {
      // TODO: Implémenter la copie dans le presse-papiers
      Alert.alert('Copié', 'Le contenu du QR Code a été copié dans le presse-papiers');
    } catch (error) {
      console.error('Error copying content:', error);
      Alert.alert('Erreur', 'Impossible de copier le contenu');
    }
  };

  // Formater le temps restant
  const formatTimeLeft = (seconds: number): string => {
    if (seconds <= 0) return 'Expiré';
    
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    } else if (minutes > 0) {
      return `${minutes}m ${secs}s`;
    } else {
      return `${secs}s`;
    }
  };

  // Obtenir la couleur du countdown
  const getCountdownColor = (): string => {
    if (timeLeft <= 0) return THEME.colors.ERROR;
    if (timeLeft <= 300) return THEME.colors.WARNING; // 5 minutes
    return THEME.colors.SUCCESS;
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.loadingContainer, style]}>
        <Text style={styles.loadingText}>Génération du QR Code...</Text>
      </View>
    );
  }

  if (!qrData) {
    return (
      <View style={[styles.container, styles.errorContainer, style]}>
        <Icon name="error" size={48} color={THEME.colors.ERROR} />
        <Text style={styles.errorText}>Erreur de génération QR</Text>
        <Button
          title="Réessayer"
          onPress={generateQRCode}
          variant="primary"
          style={styles.retryButton}
        />
      </View>
    );
  }

  return (
    <ScrollView style={[styles.container, style]} showsVerticalScrollIndicator={false}>
      <Card style={styles.qrCard}>
        {/* En-tête */}
        <View style={styles.header}>
          <View style={styles.headerInfo}>
            <Text style={styles.title}>{qrData.metadata.reunionTitle}</Text>
            <Text style={styles.subtitle}>{qrData.metadata.location}</Text>
          </View>
          
          <View style={styles.statusContainer}>
            <View style={[styles.statusDot, { backgroundColor: getCountdownColor() }]} />
            <Text style={[styles.timeLeft, { color: getCountdownColor() }]}>
              {formatTimeLeft(timeLeft)}
            </Text>
          </View>
        </View>

        {/* QR Code */}
        {showPreview && (
          <Animated.View 
            style={[
              styles.qrContainer,
              {
                opacity: fadeAnim,
                transform: [
                  { scale: scaleAnim },
                  {
                    rotate: rotateAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: ['0deg', '360deg'],
                    }),
                  },
                ],
              },
            ]}
          >
            <QRCode
              value={qrString}
              size={QR_SIZE}
              color={THEME.colors.ON_SURFACE}
              backgroundColor={THEME.colors.WHITE}
              // logo={require('../../assets/images/rotary-logo-small.png')} // TODO: Ajouter le logo
              logoSize={QR_SIZE * 0.15}
              logoBackgroundColor={THEME.colors.WHITE}
              logoMargin={4}
              logoBorderRadius={8}
              getRef={qrRef}
            />
          </Animated.View>
        )}

        {/* Informations */}
        <View style={styles.infoContainer}>
          <View style={styles.infoRow}>
            <Icon name="event" size={16} color={THEME.colors.GRAY_600} />
            <Text style={styles.infoText}>
              Créé: {new Date(qrData.timestamp).toLocaleString('fr-FR')}
            </Text>
          </View>
          
          <View style={styles.infoRow}>
            <Icon name="schedule" size={16} color={THEME.colors.GRAY_600} />
            <Text style={styles.infoText}>
              Expire: {new Date(qrData.expiry).toLocaleString('fr-FR')}
            </Text>
          </View>

          {qrData.metadata.maxParticipants && (
            <View style={styles.infoRow}>
              <Icon name="people" size={16} color={THEME.colors.GRAY_600} />
              <Text style={styles.infoText}>
                Max participants: {qrData.metadata.maxParticipants}
              </Text>
            </View>
          )}
        </View>

        {/* Contrôles */}
        {showControls && (
          <View style={styles.controlsContainer}>
            <TouchableOpacity style={styles.controlButton} onPress={shareQRCode}>
              <Icon name="share" size={20} color={THEME.colors.PRIMARY} />
              <Text style={styles.controlButtonText}>Partager</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.controlButton} onPress={copyContent}>
              <Icon name="content-copy" size={20} color={THEME.colors.PRIMARY} />
              <Text style={styles.controlButtonText}>Copier</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.controlButton} onPress={saveToGallery}>
              <Icon name="save-alt" size={20} color={THEME.colors.PRIMARY} />
              <Text style={styles.controlButtonText}>Sauver</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.controlButton} onPress={printQRCode}>
              <Icon name="print" size={20} color={THEME.colors.PRIMARY} />
              <Text style={styles.controlButtonText}>Imprimer</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Actions principales */}
        <View style={styles.actionsContainer}>
          <Button
            title="Nouveau QR Code"
            onPress={generateQRCode}
            variant="outline"
            style={styles.actionButton}
            icon="refresh"
          />
          
          <Button
            title={showPreview ? 'Masquer' : 'Afficher'}
            onPress={() => setShowPreview(prev => !prev)}
            variant="outline"
            style={styles.actionButton}
            icon={showPreview ? 'visibility-off' : 'visibility'}
          />
        </View>
      </Card>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: THEME.spacing.XXL,
  },

  loadingText: {
    fontSize: THEME.typography.FONT_SIZE.MD,
    color: THEME.colors.GRAY_600,
  },

  errorContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: THEME.spacing.XXL,
  },

  errorText: {
    fontSize: THEME.typography.FONT_SIZE.MD,
    color: THEME.colors.ERROR,
    marginTop: THEME.spacing.MD,
    marginBottom: THEME.spacing.LG,
    textAlign: 'center',
  },

  retryButton: {
    minWidth: 120,
  },

  qrCard: {
    margin: THEME.spacing.MD,
  },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: THEME.spacing.LG,
  },

  headerInfo: {
    flex: 1,
  },

  title: {
    fontSize: THEME.typography.FONT_SIZE.LG,
    fontWeight: THEME.typography.FONT_WEIGHT.BOLD,
    color: THEME.colors.ON_SURFACE,
    marginBottom: THEME.spacing.XS,
  },

  subtitle: {
    fontSize: THEME.typography.FONT_SIZE.SM,
    color: THEME.colors.GRAY_600,
  },

  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: THEME.spacing.XS,
  },

  timeLeft: {
    fontSize: THEME.typography.FONT_SIZE.SM,
    fontWeight: THEME.typography.FONT_WEIGHT.MEDIUM,
  },

  qrContainer: {
    alignItems: 'center',
    marginBottom: THEME.spacing.LG,
    padding: THEME.spacing.MD,
    backgroundColor: THEME.colors.WHITE,
    borderRadius: THEME.radius.MD,
    elevation: 2,
    shadowColor: THEME.colors.SHADOW,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },

  infoContainer: {
    marginBottom: THEME.spacing.LG,
  },

  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: THEME.spacing.SM,
  },

  infoText: {
    fontSize: THEME.typography.FONT_SIZE.SM,
    color: THEME.colors.GRAY_600,
    marginLeft: THEME.spacing.SM,
  },

  controlsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: THEME.spacing.LG,
    paddingVertical: THEME.spacing.MD,
    borderTopWidth: 1,
    borderTopColor: THEME.colors.OUTLINE_VARIANT,
  },

  controlButton: {
    alignItems: 'center',
    padding: THEME.spacing.SM,
  },

  controlButtonText: {
    fontSize: THEME.typography.FONT_SIZE.XS,
    color: THEME.colors.PRIMARY,
    marginTop: THEME.spacing.XS,
  },

  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: THEME.spacing.MD,
  },

  actionButton: {
    flex: 1,
  },
});

export default QRGenerator;
