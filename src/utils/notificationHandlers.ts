/**
 * Notification Handlers - Rotary Club Mobile
 * Utilitaires parsing, navigation, badge count et analytics
 */

import { Platform } from 'react-native';
import { FirebaseMessagingTypes } from '@react-native-firebase/messaging';
import analytics from '@react-native-firebase/analytics';
import { navigationRef } from './navigation';
import { store } from '../store';
import { addNotification, markAsRead, updateBadgeCount } from '../store/slices/notificationSlice';
import type { 
  RotaryNotification, 
  NotificationType, 
  FCMNotificationPayload,
  NotificationActionResult,
  NotificationAnalytics 
} from '../types/notifications';

/**
 * Parser le payload d'une notification FCM
 */
export function parseNotificationPayload(
  remoteMessage: FirebaseMessagingTypes.RemoteMessage
): RotaryNotification | null {
  try {
    const { notification, data } = remoteMessage;
    
    if (!data?.type || !data?.id) {
      console.warn('Invalid notification payload: missing type or id');
      return null;
    }

    const baseNotification = {
      id: data.id,
      title: notification?.title || data.title || 'Rotary Club',
      body: notification?.body || data.body || '',
      timestamp: new Date(data.timestamp || Date.now()),
      read: false,
      priority: (data.priority as any) || 'normal',
      category: data.type,
    };

    switch (data.type as NotificationType) {
      case 'reunion_reminder':
        return {
          ...baseNotification,
          type: 'reunion_reminder',
          data: {
            reunionId: data.reunionId || '',
            title: data.reunionTitle || baseNotification.title,
            date: data.reunionDate || '',
            time: data.reunionTime || '',
            location: data.location || '',
            reminderType: (data.reminderType as any) || '1h',
            confirmed: data.confirmed === 'true',
            agenda: data.agenda,
            presenter: data.presenter,
          },
          actions: [
            { id: 'confirm_presence', title: 'Confirmer présence', icon: 'check' },
            { id: 'view_details', title: 'Voir détails', icon: 'info' },
            { id: 'add_calendar', title: 'Ajouter au calendrier', icon: 'calendar' },
          ],
        } as any;

      case 'finance_due':
        return {
          ...baseNotification,
          type: 'finance_due',
          data: {
            paymentId: data.paymentId || '',
            amount: parseFloat(data.amount || '0'),
            currency: data.currency || 'EUR',
            dueDate: data.dueDate || '',
            description: data.description || baseNotification.body,
            reminderType: (data.reminderType as any) || '1day',
            invoiceUrl: data.invoiceUrl,
            paymentMethods: data.paymentMethods?.split(',') || [],
          },
          actions: [
            { id: 'pay_now', title: 'Payer maintenant', icon: 'payment', primary: true },
            { id: 'view_invoice', title: 'Voir facture', icon: 'receipt' },
            { id: 'request_extension', title: 'Demander un délai', icon: 'schedule' },
          ],
        } as any;

      case 'announcement':
        return {
          ...baseNotification,
          type: 'announcement',
          data: {
            announcementId: data.announcementId || '',
            senderId: data.senderId || '',
            senderName: data.senderName || 'Club Rotary',
            senderRole: data.senderRole || 'Membre',
            message: data.message || baseNotification.body,
            urgent: data.urgent === 'true',
            expiresAt: data.expiresAt,
          },
          actions: [
            { id: 'read_full', title: 'Lire', icon: 'article' },
            { id: 'reply', title: 'Répondre', icon: 'reply' },
            { id: 'share', title: 'Partager', icon: 'share' },
          ],
        } as any;

      default:
        console.warn(`Unknown notification type: ${data.type}`);
        return null;
    }
  } catch (error) {
    console.error('Error parsing notification payload:', error);
    return null;
  }
}

/**
 * Naviguer depuis une notification
 */
export function navigateFromNotification(notification: RotaryNotification): void {
  if (!navigationRef.current) {
    console.warn('Navigation ref not available');
    return;
  }

  try {
    switch (notification.type) {
      case 'reunion_reminder':
        navigationRef.current.navigate('ReunionDetail', {
          reunionId: notification.data.reunionId,
          fromNotification: true,
        });
        break;

      case 'finance_due':
        navigationRef.current.navigate('Finance', {
          paymentId: notification.data.paymentId,
          fromNotification: true,
        });
        break;

      case 'announcement':
        navigationRef.current.navigate('AnnouncementDetail', {
          announcementId: notification.data.announcementId,
          fromNotification: true,
        });
        break;

      case 'project_update':
        navigationRef.current.navigate('ProjectDetail', {
          projectId: notification.data.projectId,
          fromNotification: true,
        });
        break;

      case 'member_joined':
        navigationRef.current.navigate('MemberDetail', {
          memberId: notification.data.memberId,
          fromNotification: true,
        });
        break;

      default:
        navigationRef.current.navigate('Notifications');
    }

    // Marquer comme lu
    store.dispatch(markAsRead(notification.id));
    
    // Tracker l'événement
    trackNotificationEvent('opened', notification);
  } catch (error) {
    console.error('Error navigating from notification:', error);
    // Fallback vers l'écran des notifications
    navigationRef.current?.navigate('Notifications');
  }
}

/**
 * Mettre à jour le badge count
 */
export function updateBadgeCount(): void {
  try {
    const state = store.getState();
    const unreadCount = state.notifications?.unreadCount || 0;
    
    // Mettre à jour le badge dans le store
    store.dispatch(updateBadgeCount(unreadCount));
    
    // TODO: Mettre à jour le badge natif de l'app
    if (Platform.OS === 'ios') {
      // import PushNotificationIOS from '@react-native-community/push-notification-ios';
      // PushNotificationIOS.setApplicationIconBadgeNumber(unreadCount);
    }
    
    console.log(`Badge count updated: ${unreadCount}`);
  } catch (error) {
    console.error('Error updating badge count:', error);
  }
}

/**
 * Tracker un événement de notification
 */
export async function trackNotificationEvent(
  eventType: 'received' | 'opened' | 'dismissed' | 'action_taken',
  notification: RotaryNotification,
  actionId?: string
): Promise<void> {
  try {
    const eventData = {
      notification_id: notification.id,
      notification_type: notification.type,
      notification_priority: notification.priority,
      event_type: eventType,
      action_id: actionId,
      timestamp: Date.now(),
      platform: Platform.OS,
    };

    // Firebase Analytics
    await analytics().logEvent('notification_event', eventData);

    // Analytics personnalisées
    const analyticsData: NotificationAnalytics = {
      notificationId: notification.id,
      type: notification.type,
      sentAt: notification.timestamp,
      deviceInfo: {
        platform: Platform.OS,
        version: Platform.Version.toString(),
      },
    };

    switch (eventType) {
      case 'received':
        analyticsData.deliveredAt = new Date();
        break;
      case 'opened':
        analyticsData.openedAt = new Date();
        break;
      case 'action_taken':
        analyticsData.actionTaken = actionId;
        break;
      case 'dismissed':
        analyticsData.dismissed = true;
        break;
    }

    // TODO: Envoyer au serveur d'analytics
    console.log('Notification event tracked:', eventData);
  } catch (error) {
    console.error('Error tracking notification event:', error);
  }
}

/**
 * Exécuter une action de notification
 */
export async function executeNotificationAction(
  notification: RotaryNotification,
  actionId: string
): Promise<NotificationActionResult> {
  try {
    let result: NotificationActionResult = {
      actionId,
      notificationId: notification.id,
      success: false,
    };

    switch (notification.type) {
      case 'reunion_reminder':
        result = await handleReunionAction(notification, actionId);
        break;
      case 'finance_due':
        result = await handleFinanceAction(notification, actionId);
        break;
      case 'announcement':
        result = await handleAnnouncementAction(notification, actionId);
        break;
      default:
        result.error = `Unknown notification type: ${notification.type}`;
    }

    // Tracker l'action
    if (result.success) {
      await trackNotificationEvent('action_taken', notification, actionId);
    }

    return result;
  } catch (error) {
    console.error('Error executing notification action:', error);
    return {
      actionId,
      notificationId: notification.id,
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Gérer les actions de réunion
 */
async function handleReunionAction(
  notification: RotaryNotification,
  actionId: string
): Promise<NotificationActionResult> {
  const { reunionId } = notification.data;

  switch (actionId) {
    case 'confirm_presence':
      // TODO: Appeler l'API pour confirmer la présence
      console.log(`Confirming presence for reunion ${reunionId}`);
      return { actionId, notificationId: notification.id, success: true };

    case 'view_details':
      navigateFromNotification(notification);
      return { actionId, notificationId: notification.id, success: true };

    case 'add_calendar':
      // TODO: Ajouter au calendrier natif
      console.log(`Adding reunion ${reunionId} to calendar`);
      return { actionId, notificationId: notification.id, success: true };

    default:
      return {
        actionId,
        notificationId: notification.id,
        success: false,
        error: `Unknown action: ${actionId}`,
      };
  }
}

/**
 * Gérer les actions de finance
 */
async function handleFinanceAction(
  notification: RotaryNotification,
  actionId: string
): Promise<NotificationActionResult> {
  const { paymentId } = notification.data;

  switch (actionId) {
    case 'pay_now':
      navigationRef.current?.navigate('PaymentScreen', { paymentId });
      return { actionId, notificationId: notification.id, success: true };

    case 'view_invoice':
      // TODO: Ouvrir l'URL de la facture
      console.log(`Opening invoice for payment ${paymentId}`);
      return { actionId, notificationId: notification.id, success: true };

    case 'request_extension':
      // TODO: Ouvrir le formulaire de demande de délai
      console.log(`Requesting extension for payment ${paymentId}`);
      return { actionId, notificationId: notification.id, success: true };

    default:
      return {
        actionId,
        notificationId: notification.id,
        success: false,
        error: `Unknown action: ${actionId}`,
      };
  }
}

/**
 * Gérer les actions d'annonce
 */
async function handleAnnouncementAction(
  notification: RotaryNotification,
  actionId: string
): Promise<NotificationActionResult> {
  const { announcementId } = notification.data;

  switch (actionId) {
    case 'read_full':
      navigateFromNotification(notification);
      return { actionId, notificationId: notification.id, success: true };

    case 'reply':
      // TODO: Ouvrir l'interface de réponse
      console.log(`Replying to announcement ${announcementId}`);
      return { actionId, notificationId: notification.id, success: true };

    case 'share':
      // TODO: Ouvrir le partage natif
      console.log(`Sharing announcement ${announcementId}`);
      return { actionId, notificationId: notification.id, success: true };

    default:
      return {
        actionId,
        notificationId: notification.id,
        success: false,
        error: `Unknown action: ${actionId}`,
      };
  }
}

/**
 * Nettoyer les notifications expirées
 */
export function cleanupExpiredNotifications(): void {
  try {
    const state = store.getState();
    const notifications = state.notifications?.notifications || [];
    const now = new Date();

    notifications.forEach(notification => {
      // Supprimer les notifications de plus de 30 jours
      const daysDiff = (now.getTime() - notification.timestamp.getTime()) / (1000 * 60 * 60 * 24);
      
      if (daysDiff > 30) {
        // TODO: Dispatch action pour supprimer
        console.log(`Cleaning up old notification: ${notification.id}`);
      }
    });
  } catch (error) {
    console.error('Error cleaning up notifications:', error);
  }
}

export default {
  parseNotificationPayload,
  navigateFromNotification,
  updateBadgeCount,
  trackNotificationEvent,
  executeNotificationAction,
  cleanupExpiredNotifications,
};
