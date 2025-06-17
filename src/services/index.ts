/**
 * Services Index - Rotary Club Mobile
 * Export de tous les services API et utilitaires
 */

// ===== SERVICES PRINCIPAUX =====
export { apiService } from './apiService';
export { authService } from './authService';
export { clubService } from './clubService';
export { reunionService } from './reunionService';
export { financeService } from './financeService';
export { networkService } from './networkService';
export { notificationService } from './notificationService';
export { qrService } from './qrService';
export { databaseService } from './databaseService';
export { syncService } from './syncService';
export { offlineMemberService } from './offlineMemberService';

// ===== SERVICE API LEGACY =====
export { apiService as api } from './api';

// ===== TYPES =====
export type { ApiResponse, ErrorResponse } from '../types';

// ===== CONFIGURATION =====
export const API_CONFIG = {
  BASE_URL: process.env.API_BASE_URL || 'https://api.rotaryclub.local/v1',
  TIMEOUT: parseInt(process.env.API_TIMEOUT || '30000', 10),
  MAX_RETRIES: parseInt(process.env.MAX_RETRIES || '3', 10),
  ENABLE_CACHE: true,
  ENABLE_OFFLINE: process.env.ENABLE_OFFLINE_MODE === 'true',
  DEBUG: __DEV__ && process.env.DEBUG_API === 'true',
} as const;

// ===== INITIALISATION =====
export const initializeServices = async (): Promise<void> => {
  try {
    if (__DEV__) {
      console.log('🚀 Initializing services...');
    }

    // Initialiser les services qui en ont besoin
    // networkService s'initialise automatiquement
    // notificationService s'initialise automatiquement

    if (__DEV__) {
      console.log('✅ Services initialized successfully');
    }
  } catch (error) {
    console.error('❌ Services initialization error:', error);
    throw error;
  }
};

// ===== UTILITAIRES =====
export const getServiceStatus = () => {
  return {
    network: networkService.isOnlineStatus(),
    notifications: notificationService.isServiceInitialized(),
    fcmToken: notificationService.getFCMToken(),
    offlineQueue: networkService.getOfflineQueueStats(),
  };
};

// Future exports will be added here:
// export { locationService } from './location';
// export { cameraService } from './camera';
// export { biometricService } from './biometric';
