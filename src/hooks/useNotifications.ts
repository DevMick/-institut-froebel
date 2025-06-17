/**
 * useNotifications Hook - Rotary Club Mobile
 * Hook pour la gestion des notifications avec Redux
 */

import { useSelector, useDispatch } from 'react-redux';
import { useCallback } from 'react';
import type { RootState, AppDispatch } from '../store';
import {
  fetchNotifications,
  markNotificationAsRead,
  deleteNotification,
  updateNotificationSettings,
  addNotification,
  markAsRead,
  markAsUnread,
  markAllAsRead,
  removeNotification,
  clearAllNotifications,
  updateBadgeCount,
  updateSettings,
} from '../store/slices/notificationSlice';
import type { RotaryNotification, NotificationSettings } from '../types/notifications';

export const useNotifications = () => {
  const dispatch = useDispatch<AppDispatch>();
  
  const {
    notifications,
    unreadCount,
    settings,
    loading,
    error,
    lastSync,
  } = useSelector((state: RootState) => state.notifications);

  // Actions synchrones
  const addNotificationLocal = useCallback((notification: RotaryNotification) => {
    dispatch(addNotification(notification));
  }, [dispatch]);

  const markAsReadLocal = useCallback((notificationId: string) => {
    dispatch(markAsRead(notificationId));
  }, [dispatch]);

  const markAsUnreadLocal = useCallback((notificationId: string) => {
    dispatch(markAsUnread(notificationId));
  }, [dispatch]);

  const markAllAsReadLocal = useCallback(() => {
    dispatch(markAllAsRead());
  }, [dispatch]);

  const removeNotificationLocal = useCallback((notificationId: string) => {
    dispatch(removeNotification(notificationId));
  }, [dispatch]);

  const clearAllNotificationsLocal = useCallback(() => {
    dispatch(clearAllNotifications());
  }, [dispatch]);

  const updateBadgeCountLocal = useCallback((count: number) => {
    dispatch(updateBadgeCount(count));
  }, [dispatch]);

  const updateSettingsLocal = useCallback((newSettings: Partial<NotificationSettings>) => {
    dispatch(updateSettings(newSettings));
  }, [dispatch]);

  // Actions asynchrones
  const fetchNotificationsAsync = useCallback(() => {
    return dispatch(fetchNotifications());
  }, [dispatch]);

  const markAsReadAsync = useCallback((notificationId: string) => {
    return dispatch(markNotificationAsRead(notificationId));
  }, [dispatch]);

  const deleteNotificationAsync = useCallback((notificationId: string) => {
    return dispatch(deleteNotification(notificationId));
  }, [dispatch]);

  const updateSettingsAsync = useCallback((newSettings: Partial<NotificationSettings>) => {
    return dispatch(updateNotificationSettings(newSettings));
  }, [dispatch]);

  // Getters utilitaires
  const getNotificationById = useCallback((id: string): RotaryNotification | undefined => {
    return notifications.find(notification => notification.id === id);
  }, [notifications]);

  const getNotificationsByType = useCallback((type: RotaryNotification['type']): RotaryNotification[] => {
    return notifications.filter(notification => notification.type === type);
  }, [notifications]);

  const getUnreadNotifications = useCallback((): RotaryNotification[] => {
    return notifications.filter(notification => !notification.read);
  }, [notifications]);

  const getRecentNotifications = useCallback((): RotaryNotification[] => {
    const oneDayAgo = new Date();
    oneDayAgo.setDate(oneDayAgo.getDate() - 1);
    
    return notifications.filter(notification => 
      notification.timestamp >= oneDayAgo
    );
  }, [notifications]);

  const getNotificationsByPriority = useCallback((priority: RotaryNotification['priority']): RotaryNotification[] => {
    return notifications.filter(notification => notification.priority === priority);
  }, [notifications]);

  // Statistiques
  const getNotificationStats = useCallback(() => {
    const total = notifications.length;
    const unread = unreadCount;
    const read = total - unread;
    
    const byType = notifications.reduce((acc, notification) => {
      acc[notification.type] = (acc[notification.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const byPriority = notifications.reduce((acc, notification) => {
      acc[notification.priority] = (acc[notification.priority] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      total,
      unread,
      read,
      byType,
      byPriority,
    };
  }, [notifications, unreadCount]);

  return {
    // État
    notifications,
    unreadCount,
    settings,
    loading,
    error,
    lastSync,

    // Actions synchrones
    addNotification: addNotificationLocal,
    markAsRead: markAsReadLocal,
    markAsUnread: markAsUnreadLocal,
    markAllAsRead: markAllAsReadLocal,
    removeNotification: removeNotificationLocal,
    clearAllNotifications: clearAllNotificationsLocal,
    updateBadgeCount: updateBadgeCountLocal,
    updateSettings: updateSettingsLocal,

    // Actions asynchrones
    fetchNotifications: fetchNotificationsAsync,
    markAsReadAsync,
    deleteNotification: deleteNotificationAsync,
    updateSettingsAsync,

    // Getters
    getNotificationById,
    getNotificationsByType,
    getUnreadNotifications,
    getRecentNotifications,
    getNotificationsByPriority,
    getNotificationStats,
  };
};

export default useNotifications;
