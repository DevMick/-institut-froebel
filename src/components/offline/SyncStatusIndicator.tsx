/**
 * Sync Status Indicator - Rotary Club Mobile
 * Composant status réseau, progress sync et notifications
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Modal,
  ScrollView,
  Animated,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { THEME } from '../../config/theme';
import { Button } from '../ui';
import { useOfflineSync } from '../../hooks/useOfflineSync';

interface SyncStatusIndicatorProps {
  style?: object;
  showDetails?: boolean;
  compact?: boolean;
}

export const SyncStatusIndicator: React.FC<SyncStatusIndicatorProps> = ({
  style,
  showDetails = false,
  compact = false,
}) => {
  const {
    isOnline,
    isSyncing,
    progress,
    pendingCount,
    lastSyncTime,
    conflicts,
    errors,
    actions,
    getConnectionStatus,
    getStatusColor,
    needsSync,
    getTimeSinceLastSync,
  } = useOfflineSync();

  const [showModal, setShowModal] = useState(false);
  const [showErrors, setShowErrors] = useState(false);
  const [showConflicts, setShowConflicts] = useState(false);

  // Animation pour le pulse
  const pulseAnim = React.useRef(new Animated.Value(1)).current;

  React.useEffect(() => {
    if (isSyncing) {
      const pulse = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.2,
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
      pulse.start();
      
      return () => pulse.stop();
    }
  }, [isSyncing, pulseAnim]);

  // Obtenir l'icône de statut
  const getStatusIcon = (): string => {
    if (isSyncing) return 'sync';
    if (!isOnline) return 'cloud-off';
    if (conflicts.length > 0) return 'warning';
    if (pendingCount > 0) return 'cloud-upload';
    return 'cloud-done';
  };

  // Gérer le clic sur le statut
  const handleStatusPress = () => {
    if (compact) {
      setShowModal(true);
    } else if (needsSync() && isOnline) {
      handleManualSync();
    }
  };

  // Synchronisation manuelle
  const handleManualSync = async () => {
    try {
      await actions.forceSync();
      Alert.alert('Synchronisation', 'Synchronisation terminée avec succès');
    } catch (error) {
      Alert.alert(
        'Erreur de synchronisation',
        error instanceof Error ? error.message : 'Une erreur est survenue'
      );
    }
  };

  // Réessayer les actions échouées
  const handleRetryFailed = async () => {
    try {
      await actions.retryFailedActions();
      Alert.alert('Reprise', 'Les actions échouées ont été reprises');
    } catch (error) {
      Alert.alert(
        'Erreur',
        'Impossible de reprendre les actions échouées'
      );
    }
  };

  // Render compact version
  if (compact) {
    return (
      <>
        <TouchableOpacity
          style={[styles.compactContainer, style]}
          onPress={handleStatusPress}
          accessibilityLabel={getConnectionStatus()}
        >
          <Animated.View
            style={[
              styles.statusDot,
              { backgroundColor: getStatusColor() },
              isSyncing && { transform: [{ scale: pulseAnim }] },
            ]}
          />
          
          {(pendingCount > 0 || conflicts.length > 0) && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>
                {pendingCount + conflicts.length}
              </Text>
            </View>
          )}
        </TouchableOpacity>

        {renderModal()}
      </>
    );
  }

  // Render full version
  return (
    <View style={[styles.container, style]}>
      <TouchableOpacity
        style={styles.statusContainer}
        onPress={handleStatusPress}
        disabled={!needsSync() || !isOnline}
      >
        <Animated.View
          style={[
            styles.iconContainer,
            { backgroundColor: `${getStatusColor()}20` },
            isSyncing && { transform: [{ scale: pulseAnim }] },
          ]}
        >
          <Icon
            name={getStatusIcon()}
            size={20}
            color={getStatusColor()}
          />
        </Animated.View>

        <View style={styles.statusInfo}>
          <Text style={styles.statusText}>{getConnectionStatus()}</Text>
          
          {lastSyncTime && (
            <Text style={styles.lastSyncText}>
              Dernière sync: {getTimeSinceLastSync()}
            </Text>
          )}
        </View>

        {needsSync() && isOnline && (
          <Icon name="chevron-right" size={20} color={THEME.colors.GRAY_400} />
        )}
      </TouchableOpacity>

      {/* Progress bar */}
      {isSyncing && progress.total > 0 && (
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                { width: `${progress.percentage}%` },
              ]}
            />
          </View>
          
          <Text style={styles.progressText}>
            {progress.completed}/{progress.total}
            {progress.currentAction && ` - ${progress.currentAction}`}
          </Text>
        </View>
      )}

      {/* Notifications */}
      {errors.length > 0 && (
        <TouchableOpacity
          style={styles.errorNotification}
          onPress={() => setShowErrors(true)}
        >
          <Icon name="error" size={16} color={THEME.colors.ERROR} />
          <Text style={styles.errorText}>
            {errors.length} erreur(s) de synchronisation
          </Text>
        </TouchableOpacity>
      )}

      {conflicts.length > 0 && (
        <TouchableOpacity
          style={styles.conflictNotification}
          onPress={() => setShowConflicts(true)}
        >
          <Icon name="warning" size={16} color={THEME.colors.WARNING} />
          <Text style={styles.conflictText}>
            {conflicts.length} conflit(s) à résoudre
          </Text>
        </TouchableOpacity>
      )}

      {showDetails && renderDetails()}
      {renderErrorModal()}
      {renderConflictModal()}
    </View>
  );

  // Render details section
  function renderDetails() {
    return (
      <View style={styles.detailsContainer}>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Statut réseau:</Text>
          <Text style={[styles.detailValue, { color: getStatusColor() }]}>
            {isOnline ? 'En ligne' : 'Hors ligne'}
          </Text>
        </View>

        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Actions en attente:</Text>
          <Text style={styles.detailValue}>{pendingCount}</Text>
        </View>

        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Conflits:</Text>
          <Text style={styles.detailValue}>{conflicts.length}</Text>
        </View>

        {lastSyncTime && (
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Dernière sync:</Text>
            <Text style={styles.detailValue}>
              {lastSyncTime.toLocaleString('fr-FR')}
            </Text>
          </View>
        )}

        <View style={styles.actionButtons}>
          <Button
            title="Synchroniser"
            onPress={handleManualSync}
            variant="primary"
            size="small"
            disabled={!isOnline || isSyncing}
            style={styles.actionButton}
          />

          {errors.length > 0 && (
            <Button
              title="Réessayer"
              onPress={handleRetryFailed}
              variant="outline"
              size="small"
              style={styles.actionButton}
            />
          )}
        </View>
      </View>
    );
  }

  // Render modal for compact version
  function renderModal() {
    return (
      <Modal
        visible={showModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>État de synchronisation</Text>
              <TouchableOpacity onPress={() => setShowModal(false)}>
                <Icon name="close" size={24} color={THEME.colors.ON_SURFACE} />
              </TouchableOpacity>
            </View>

            <View style={styles.modalBody}>
              <View style={styles.statusRow}>
                <Icon
                  name={getStatusIcon()}
                  size={24}
                  color={getStatusColor()}
                />
                <Text style={styles.modalStatusText}>
                  {getConnectionStatus()}
                </Text>
              </View>

              {renderDetails()}
            </View>
          </View>
        </View>
      </Modal>
    );
  }

  // Render error modal
  function renderErrorModal() {
    return (
      <Modal
        visible={showErrors}
        transparent
        animationType="slide"
        onRequestClose={() => setShowErrors(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Erreurs de synchronisation</Text>
              <TouchableOpacity onPress={() => setShowErrors(false)}>
                <Icon name="close" size={24} color={THEME.colors.ON_SURFACE} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.errorList}>
              {errors.map((error, index) => (
                <View key={index} style={styles.errorItem}>
                  <Icon name="error" size={20} color={THEME.colors.ERROR} />
                  <Text style={styles.errorItemText}>{error}</Text>
                  <TouchableOpacity
                    onPress={() => actions.dismissError(index)}
                    style={styles.dismissButton}
                  >
                    <Icon name="close" size={16} color={THEME.colors.GRAY_500} />
                  </TouchableOpacity>
                </View>
              ))}
            </ScrollView>

            <View style={styles.modalActions}>
              <Button
                title="Tout effacer"
                onPress={() => {
                  actions.clearAllErrors();
                  setShowErrors(false);
                }}
                variant="outline"
                style={styles.modalActionButton}
              />
              
              <Button
                title="Réessayer"
                onPress={() => {
                  handleRetryFailed();
                  setShowErrors(false);
                }}
                variant="primary"
                style={styles.modalActionButton}
              />
            </View>
          </View>
        </View>
      </Modal>
    );
  }

  // Render conflict modal
  function renderConflictModal() {
    return (
      <Modal
        visible={showConflicts}
        transparent
        animationType="slide"
        onRequestClose={() => setShowConflicts(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Conflits de synchronisation</Text>
              <TouchableOpacity onPress={() => setShowConflicts(false)}>
                <Icon name="close" size={24} color={THEME.colors.ON_SURFACE} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.conflictList}>
              {conflicts.map((conflict, index) => (
                <View key={index} style={styles.conflictItem}>
                  <Icon name="warning" size={20} color={THEME.colors.WARNING} />
                  <View style={styles.conflictInfo}>
                    <Text style={styles.conflictTitle}>
                      Conflit de données détecté
                    </Text>
                    <Text style={styles.conflictDescription}>
                      Stratégie: {conflict.strategy}
                    </Text>
                  </View>
                  <TouchableOpacity
                    style={styles.resolveButton}
                    onPress={() => {
                      // TODO: Ouvrir l'interface de résolution
                      console.log('Resolve conflict:', conflict);
                    }}
                  >
                    <Text style={styles.resolveButtonText}>Résoudre</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </ScrollView>

            <Button
              title="Fermer"
              onPress={() => setShowConflicts(false)}
              variant="outline"
              style={styles.modalCloseButton}
            />
          </View>
        </View>
      </Modal>
    );
  }
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: THEME.colors.SURFACE,
    borderRadius: THEME.radius.MD,
    padding: THEME.spacing.MD,
    margin: THEME.spacing.SM,
  },

  compactContainer: {
    position: 'relative',
    padding: THEME.spacing.SM,
  },

  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: THEME.spacing.MD,
  },

  statusInfo: {
    flex: 1,
  },

  statusText: {
    fontSize: THEME.typography.FONT_SIZE.MD,
    fontWeight: THEME.typography.FONT_WEIGHT.MEDIUM,
    color: THEME.colors.ON_SURFACE,
  },

  lastSyncText: {
    fontSize: THEME.typography.FONT_SIZE.SM,
    color: THEME.colors.GRAY_600,
    marginTop: THEME.spacing.XS,
  },

  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },

  badge: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: THEME.colors.ERROR,
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },

  badgeText: {
    color: THEME.colors.WHITE,
    fontSize: THEME.typography.FONT_SIZE.XS,
    fontWeight: THEME.typography.FONT_WEIGHT.BOLD,
  },

  progressContainer: {
    marginTop: THEME.spacing.MD,
  },

  progressBar: {
    height: 4,
    backgroundColor: THEME.colors.GRAY_200,
    borderRadius: 2,
    overflow: 'hidden',
  },

  progressFill: {
    height: '100%',
    backgroundColor: THEME.colors.PRIMARY,
  },

  progressText: {
    fontSize: THEME.typography.FONT_SIZE.XS,
    color: THEME.colors.GRAY_600,
    marginTop: THEME.spacing.XS,
  },

  errorNotification: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: THEME.colors.ERROR_CONTAINER,
    padding: THEME.spacing.SM,
    borderRadius: THEME.radius.SM,
    marginTop: THEME.spacing.SM,
  },

  errorText: {
    fontSize: THEME.typography.FONT_SIZE.SM,
    color: THEME.colors.ON_ERROR_CONTAINER,
    marginLeft: THEME.spacing.SM,
  },

  conflictNotification: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: THEME.colors.WARNING_CONTAINER,
    padding: THEME.spacing.SM,
    borderRadius: THEME.radius.SM,
    marginTop: THEME.spacing.SM,
  },

  conflictText: {
    fontSize: THEME.typography.FONT_SIZE.SM,
    color: THEME.colors.ON_WARNING_CONTAINER,
    marginLeft: THEME.spacing.SM,
  },

  detailsContainer: {
    marginTop: THEME.spacing.MD,
    paddingTop: THEME.spacing.MD,
    borderTopWidth: 1,
    borderTopColor: THEME.colors.OUTLINE_VARIANT,
  },

  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: THEME.spacing.SM,
  },

  detailLabel: {
    fontSize: THEME.typography.FONT_SIZE.SM,
    color: THEME.colors.GRAY_600,
  },

  detailValue: {
    fontSize: THEME.typography.FONT_SIZE.SM,
    fontWeight: THEME.typography.FONT_WEIGHT.MEDIUM,
    color: THEME.colors.ON_SURFACE,
  },

  actionButtons: {
    flexDirection: 'row',
    marginTop: THEME.spacing.MD,
    gap: THEME.spacing.SM,
  },

  actionButton: {
    flex: 1,
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
    margin: THEME.spacing.LG,
    width: '90%',
    maxWidth: 400,
    maxHeight: '80%',
  },

  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: THEME.spacing.LG,
    borderBottomWidth: 1,
    borderBottomColor: THEME.colors.OUTLINE_VARIANT,
  },

  modalTitle: {
    fontSize: THEME.typography.FONT_SIZE.LG,
    fontWeight: THEME.typography.FONT_WEIGHT.BOLD,
    color: THEME.colors.ON_SURFACE,
  },

  modalBody: {
    padding: THEME.spacing.LG,
  },

  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: THEME.spacing.MD,
  },

  modalStatusText: {
    fontSize: THEME.typography.FONT_SIZE.MD,
    fontWeight: THEME.typography.FONT_WEIGHT.MEDIUM,
    color: THEME.colors.ON_SURFACE,
    marginLeft: THEME.spacing.MD,
  },

  errorList: {
    maxHeight: 200,
    padding: THEME.spacing.MD,
  },

  errorItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: THEME.spacing.SM,
    backgroundColor: THEME.colors.ERROR_CONTAINER,
    borderRadius: THEME.radius.SM,
    marginBottom: THEME.spacing.SM,
  },

  errorItemText: {
    flex: 1,
    fontSize: THEME.typography.FONT_SIZE.SM,
    color: THEME.colors.ON_ERROR_CONTAINER,
    marginLeft: THEME.spacing.SM,
    marginRight: THEME.spacing.SM,
  },

  dismissButton: {
    padding: THEME.spacing.XS,
  },

  conflictList: {
    maxHeight: 200,
    padding: THEME.spacing.MD,
  },

  conflictItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: THEME.spacing.SM,
    backgroundColor: THEME.colors.WARNING_CONTAINER,
    borderRadius: THEME.radius.SM,
    marginBottom: THEME.spacing.SM,
  },

  conflictInfo: {
    flex: 1,
    marginLeft: THEME.spacing.SM,
  },

  conflictTitle: {
    fontSize: THEME.typography.FONT_SIZE.SM,
    fontWeight: THEME.typography.FONT_WEIGHT.MEDIUM,
    color: THEME.colors.ON_WARNING_CONTAINER,
  },

  conflictDescription: {
    fontSize: THEME.typography.FONT_SIZE.XS,
    color: THEME.colors.ON_WARNING_CONTAINER,
    marginTop: THEME.spacing.XS,
  },

  resolveButton: {
    backgroundColor: THEME.colors.WARNING,
    paddingHorizontal: THEME.spacing.SM,
    paddingVertical: THEME.spacing.XS,
    borderRadius: THEME.radius.SM,
  },

  resolveButtonText: {
    fontSize: THEME.typography.FONT_SIZE.XS,
    fontWeight: THEME.typography.FONT_WEIGHT.MEDIUM,
    color: THEME.colors.WHITE,
  },

  modalActions: {
    flexDirection: 'row',
    padding: THEME.spacing.LG,
    gap: THEME.spacing.SM,
  },

  modalActionButton: {
    flex: 1,
  },

  modalCloseButton: {
    margin: THEME.spacing.LG,
  },
});

export default SyncStatusIndicator;
