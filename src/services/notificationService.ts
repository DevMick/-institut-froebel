/**
 * Notification Service - Rotary Club Mobile
 * Service notifications avec Firebase, FCM et deep linking
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { Linking, Platform } from 'react-native';
import { apiService } from './apiService';
import type { Notification, NotificationSettings, ApiResponse } from '../types';

// Configuration depuis .env
const DEEP_LINK_SCHEME = process.env.DEEP_LINK_SCHEME || 'rotaryclub';

// Types pour les notifications

interface LocalNotification {
  id: string;
  title: string;
  message: string;
  scheduledFor: Date;
  data?: Record<string, any>;
  recurring?: {
    frequency: 'daily' | 'weekly' | 'monthly';
    interval: number;
  };
}

interface DeepLinkData {
  screen: string;
  params?: Record<string, any>;
}

// Clés de stockage
const STORAGE_KEYS = {
  FCM_TOKEN: 'fcm_token',
  NOTIFICATION_SETTINGS: 'notification_settings',
  PENDING_NOTIFICATIONS: 'pending_notifications',
  LAST_NOTIFICATION_CHECK: 'last_notification_check',
} as const;

class NotificationService {
  private fcmToken: string | null = null;
  private notificationListeners: Array<(notification: Notification) => void> = [];
  private deepLinkListeners: Array<(data: DeepLinkData) => void> = [];
  private isInitialized: boolean = false;

  constructor() {
    this.initializeService();
  }

  /**
   * Initialiser le service de notifications
   */
  private async initializeService(): Promise<void> {
    try {
      // Charger le token FCM existant
      await this.loadStoredFCMToken();

      // Configurer les listeners de deep linking
      this.setupDeepLinkListeners();

      // Configurer les handlers de notifications
      this.setupNotificationHandlers();

      this.isInitialized = true;

      if (__DEV__) {
        console.log('🔔 Notification service initialized');
      }
    } catch (error) {
      console.error('❌ Notification service initialization error:', error);
    }
  }

  /**
   * Demander les permissions de notification
   */
  async requestPermissions(): Promise<ApiResponse<{
    granted: boolean;
    status: 'granted' | 'denied' | 'not-determined';
  }>> {
    try {
      // Simulation de la demande de permission
      // En réalité, on utiliserait @react-native-firebase/messaging
      // const authStatus = await messaging().requestPermission();
      
      // Pour l'instant, simulation
      const granted = true;
      const status = 'granted' as const;

      if (granted) {
        // Générer et enregistrer le token FCM
        await this.registerForNotifications();
      }

      return {
        success: true,
        data: { granted, status },
        timestamp: new Date().toISOString(),
        requestId: 'notification_permission_success',
      };
    } catch (error) {
      console.error('❌ Request permissions error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erreur de demande de permissions',
        timestamp: new Date().toISOString(),
        requestId: 'notification_permission_error',
      };
    }
  }

  /**
   * S'enregistrer pour les notifications FCM
   */
  async registerForNotifications(): Promise<ApiResponse<string>> {
    try {
      // Simulation de l'obtention du token FCM
      // En réalité : const token = await messaging().getToken();
      const mockToken = `fcm_token_${Platform.OS}_${Date.now()}`;
      
      this.fcmToken = mockToken;

      // Enregistrer le token sur le serveur
      const response = await apiService.post<{ success: boolean }>('/notifications/register', {
        fcmToken: mockToken,
        platform: Platform.OS,
        deviceId: await this.getDeviceId(),
        registeredAt: new Date().toISOString(),
      });

      if (response.success) {
        // Sauvegarder le token localement
        await this.storeFCMToken(mockToken);
        
        if (__DEV__) {
          console.log('✅ FCM token registered:', mockToken);
        }
      }

      return {
        success: response.success,
        data: mockToken,
        error: response.error,
        timestamp: new Date().toISOString(),
        requestId: 'fcm_register_success',
      };
    } catch (error) {
      console.error('❌ Register for notifications error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erreur d\'enregistrement FCM',
        timestamp: new Date().toISOString(),
        requestId: 'fcm_register_error',
      };
    }
  }

  /**
   * Configurer les handlers de notifications
   */
  private setupNotificationHandlers(): void {
    // Simulation des handlers Firebase
    // En réalité, on utiliserait :
    
    // Foreground notifications
    // messaging().onMessage(async remoteMessage => {
    //   this.handleForegroundNotification(remoteMessage);
    // });

    // Background notifications
    // messaging().setBackgroundMessageHandler(async remoteMessage => {
    //   this.handleBackgroundNotification(remoteMessage);
    // });

    // Notification opened app
    // messaging().onNotificationOpenedApp(remoteMessage => {
    //   this.handleNotificationOpened(remoteMessage);
    // });

    if (__DEV__) {
      console.log('🔔 Notification handlers configured');
    }
  }

  /**
   * Gérer les notifications en premier plan
   */
  private handleForegroundNotification(notification: any): void {
    try {
      const processedNotification: Notification = {
        id: notification.messageId || Date.now().toString(),
        userId: '', // À remplir selon le contexte
        type: notification.data?.type || 'System',
        title: notification.notification?.title || 'Notification',
        message: notification.notification?.body || '',
        data: notification.data || {},
        isRead: false,
        createdAt: new Date(),
        priority: notification.data?.priority || 'Normal',
      };

      // Notifier les listeners
      this.notifyListeners(processedNotification);

      // Afficher une notification locale si nécessaire
      this.showLocalNotification(processedNotification);

      if (__DEV__) {
        console.log('🔔 Foreground notification handled:', processedNotification);
      }
    } catch (error) {
      console.error('❌ Error handling foreground notification:', error);
    }
  }

  /**
   * Gérer les notifications en arrière-plan
   */
  private handleBackgroundNotification(notification: any): void {
    try {
      // Traitement en arrière-plan
      if (__DEV__) {
        console.log('🔔 Background notification handled:', notification);
      }
    } catch (error) {
      console.error('❌ Error handling background notification:', error);
    }
  }

  /**
   * Gérer l'ouverture de l'app via notification
   */
  private handleNotificationOpened(notification: any): void {
    try {
      // Extraire les données de deep linking
      const deepLinkData = this.parseDeepLinkData(notification.data);
      
      if (deepLinkData) {
        // Notifier les listeners de deep link
        this.notifyDeepLinkListeners(deepLinkData);
      }

      if (__DEV__) {
        console.log('🔔 Notification opened app:', notification);
      }
    } catch (error) {
      console.error('❌ Error handling notification opened:', error);
    }
  }

  /**
   * Configurer les listeners de deep linking
   */
  private setupDeepLinkListeners(): void {
    // Listener pour les liens entrants
    Linking.addEventListener('url', this.handleDeepLink.bind(this));

    // Vérifier si l'app a été ouverte via un deep link
    Linking.getInitialURL().then(url => {
      if (url) {
        this.handleDeepLink({ url });
      }
    });
  }

  /**
   * Gérer les deep links
   */
  private handleDeepLink(event: { url: string }): void {
    try {
      const deepLinkData = this.parseDeepLinkUrl(event.url);
      
      if (deepLinkData) {
        this.notifyDeepLinkListeners(deepLinkData);
      }

      if (__DEV__) {
        console.log('🔗 Deep link handled:', event.url);
      }
    } catch (error) {
      console.error('❌ Error handling deep link:', error);
    }
  }

  /**
   * Parser les données de deep link depuis une URL
   */
  private parseDeepLinkUrl(url: string): DeepLinkData | null {
    try {
      const parsedUrl = new URL(url);
      
      if (parsedUrl.protocol !== `${DEEP_LINK_SCHEME}:`) {
        return null;
      }

      const screen = parsedUrl.pathname.replace('/', '') || 'Home';
      const params: Record<string, any> = {};

      // Extraire les paramètres de query
      parsedUrl.searchParams.forEach((value, key) => {
        params[key] = value;
      });

      return { screen, params };
    } catch (error) {
      console.error('Error parsing deep link URL:', error);
      return null;
    }
  }

  /**
   * Parser les données de deep link depuis les données de notification
   */
  private parseDeepLinkData(data: Record<string, any>): DeepLinkData | null {
    if (!data.screen) {
      return null;
    }

    return {
      screen: data.screen,
      params: data.params ? JSON.parse(data.params) : {},
    };
  }

  /**
   * Afficher une notification locale
   */
  private showLocalNotification(notification: Notification): void {
    // Ici on utiliserait react-native-push-notification ou similar
    // PushNotification.localNotification({
    //   title: notification.title,
    //   message: notification.message,
    //   data: notification.data,
    // });

    if (__DEV__) {
      console.log('📱 Local notification shown:', notification.title);
    }
  }

  /**
   * Programmer une notification locale
   */
  async scheduleLocalNotification(notification: LocalNotification): Promise<ApiResponse<string>> {
    try {
      // Sauvegarder la notification programmée
      const pendingNotifications = await this.getPendingNotifications();
      pendingNotifications.push(notification);
      await this.savePendingNotifications(pendingNotifications);

      // Programmer la notification
      // PushNotification.localNotificationSchedule({
      //   title: notification.title,
      //   message: notification.message,
      //   date: notification.scheduledFor,
      //   data: notification.data,
      // });

      if (__DEV__) {
        console.log('⏰ Local notification scheduled:', notification.id);
      }

      return {
        success: true,
        data: notification.id,
        timestamp: new Date().toISOString(),
        requestId: 'local_notification_scheduled',
      };
    } catch (error) {
      console.error('❌ Schedule local notification error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erreur de programmation de notification',
        timestamp: new Date().toISOString(),
        requestId: 'local_notification_error',
      };
    }
  }

  /**
   * Annuler une notification locale
   */
  async cancelLocalNotification(notificationId: string): Promise<void> {
    try {
      // Supprimer des notifications en attente
      const pendingNotifications = await this.getPendingNotifications();
      const filtered = pendingNotifications.filter(n => n.id !== notificationId);
      await this.savePendingNotifications(filtered);

      // Annuler la notification système
      // PushNotification.cancelLocalNotifications({ id: notificationId });

      if (__DEV__) {
        console.log('❌ Local notification cancelled:', notificationId);
      }
    } catch (error) {
      console.error('❌ Cancel local notification error:', error);
    }
  }

  /**
   * Mettre à jour les paramètres de notification
   */
  async updateNotificationSettings(settings: Partial<NotificationSettings>): Promise<ApiResponse<NotificationSettings>> {
    try {
      // Sauvegarder localement
      const currentSettings = await this.getNotificationSettings();
      const updatedSettings = { ...currentSettings, ...settings };
      await this.saveNotificationSettings(updatedSettings);

      // Synchroniser avec le serveur
      const response = await apiService.put<NotificationSettings>('/notifications/settings', updatedSettings);

      return response;
    } catch (error) {
      console.error('❌ Update notification settings error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erreur de mise à jour des paramètres',
        timestamp: new Date().toISOString(),
        requestId: 'settings_update_error',
      };
    }
  }

  // ===== MÉTHODES UTILITAIRES =====

  /**
   * Obtenir l'ID de l'appareil
   */
  private async getDeviceId(): Promise<string> {
    // Ici on utiliserait react-native-device-info
    // return DeviceInfo.getUniqueId();
    return `device_${Platform.OS}_${Date.now()}`;
  }

  /**
   * Charger le token FCM stocké
   */
  private async loadStoredFCMToken(): Promise<void> {
    try {
      const token = await AsyncStorage.getItem(STORAGE_KEYS.FCM_TOKEN);
      if (token) {
        this.fcmToken = token;
      }
    } catch (error) {
      console.error('Error loading FCM token:', error);
    }
  }

  /**
   * Sauvegarder le token FCM
   */
  private async storeFCMToken(token: string): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.FCM_TOKEN, token);
    } catch (error) {
      console.error('Error storing FCM token:', error);
    }
  }

  /**
   * Obtenir les paramètres de notification
   */
  private async getNotificationSettings(): Promise<NotificationSettings> {
    try {
      const settings = await AsyncStorage.getItem(STORAGE_KEYS.NOTIFICATION_SETTINGS);
      return settings ? JSON.parse(settings) : {
        meetings: true,
        events: true,
        payments: true,
        announcements: true,
        reminders: true,
        push: true,
        email: true,
        sms: false,
      };
    } catch (error) {
      console.error('Error getting notification settings:', error);
      return {
        meetings: true,
        events: true,
        payments: true,
        announcements: true,
        reminders: true,
        push: true,
        email: true,
        sms: false,
      };
    }
  }

  /**
   * Sauvegarder les paramètres de notification
   */
  private async saveNotificationSettings(settings: NotificationSettings): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.NOTIFICATION_SETTINGS, JSON.stringify(settings));
    } catch (error) {
      console.error('Error saving notification settings:', error);
    }
  }

  /**
   * Obtenir les notifications en attente
   */
  private async getPendingNotifications(): Promise<LocalNotification[]> {
    try {
      const notifications = await AsyncStorage.getItem(STORAGE_KEYS.PENDING_NOTIFICATIONS);
      return notifications ? JSON.parse(notifications) : [];
    } catch (error) {
      console.error('Error getting pending notifications:', error);
      return [];
    }
  }

  /**
   * Sauvegarder les notifications en attente
   */
  private async savePendingNotifications(notifications: LocalNotification[]): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.PENDING_NOTIFICATIONS, JSON.stringify(notifications));
    } catch (error) {
      console.error('Error saving pending notifications:', error);
    }
  }

  /**
   * Notifier les listeners de notification
   */
  private notifyListeners(notification: Notification): void {
    this.notificationListeners.forEach(listener => {
      try {
        listener(notification);
      } catch (error) {
        console.error('Error notifying notification listener:', error);
      }
    });
  }

  /**
   * Notifier les listeners de deep link
   */
  private notifyDeepLinkListeners(data: DeepLinkData): void {
    this.deepLinkListeners.forEach(listener => {
      try {
        listener(data);
      } catch (error) {
        console.error('Error notifying deep link listener:', error);
      }
    });
  }

  // ===== API PUBLIQUE =====

  /**
   * Obtenir le token FCM actuel
   */
  getFCMToken(): string | null {
    return this.fcmToken;
  }

  /**
   * Ajouter un listener pour les notifications
   */
  addNotificationListener(listener: (notification: Notification) => void): () => void {
    this.notificationListeners.push(listener);
    
    return () => {
      const index = this.notificationListeners.indexOf(listener);
      if (index > -1) {
        this.notificationListeners.splice(index, 1);
      }
    };
  }

  /**
   * Ajouter un listener pour les deep links
   */
  addDeepLinkListener(listener: (data: DeepLinkData) => void): () => void {
    this.deepLinkListeners.push(listener);
    
    return () => {
      const index = this.deepLinkListeners.indexOf(listener);
      if (index > -1) {
        this.deepLinkListeners.splice(index, 1);
      }
    };
  }

  /**
   * Vérifier si le service est initialisé
   */
  isServiceInitialized(): boolean {
    return this.isInitialized;
  }
}

// Instance singleton
export const notificationService = new NotificationService();
export default notificationService;
