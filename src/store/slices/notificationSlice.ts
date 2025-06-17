/**
 * Notification Slice - Rotary Club Mobile
 * Gestion des notifications avec FCM et badge count
 */

import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { apiService } from '../../services';
import type { Notification, NotificationSettings } from '../../types';

// ===== TYPES D'ÉTAT =====
export interface NotificationState {
  notifications: Notification[];
  settings: NotificationSettings;
  fcmToken: string | null;
  unreadCount: number;
  isLoading: boolean;
  error: string | null;
  permissionStatus: 'granted' | 'denied' | 'not-determined';
  badgeCount: number;
}

// État initial
const initialState: NotificationState = {
  notifications: [],
  settings: {
    meetings: true,
    events: true,
    payments: true,
    announcements: true,
    reminders: true,
    push: true,
    email: true,
    sms: false,
  },
  fcmToken: null,
  unreadCount: 0,
  isLoading: false,
  error: null,
  permissionStatus: 'not-determined',
  badgeCount: 0,
};

// ===== THUNKS ASYNC =====

/**
 * S'enregistrer pour les notifications
 */
export const registerForNotificationsAsync = createAsyncThunk(
  'notification/registerForNotifications',
  async (_, { rejectWithValue }) => {
    try {
      // Ici on intégrerait @react-native-firebase/messaging
      // const messaging = firebase.messaging();
      // const token = await messaging.getToken();
      
      // Pour l'instant, simulation
      await new Promise(resolve => setTimeout(resolve, 1000));
      const mockToken = 'mock-fcm-token-' + Date.now();
      
      // Enregistrer le token sur le serveur
      const response = await apiService.post('/notifications/register', {
        fcmToken: mockToken,
        platform: 'android',
      });

      if (!response.success) {
        return rejectWithValue(response.error || 'Erreur d\'enregistrement');
      }

      return mockToken;
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : 'Erreur d\'enregistrement'
      );
    }
  }
);

/**
 * Récupérer les notifications
 */
export const fetchNotificationsAsync = createAsyncThunk(
  'notification/fetchNotifications',
  async (
    { page = 1, limit = 20 }: { page?: number; limit?: number } = {},
    { rejectWithValue }
  ) => {
    try {
      const response = await apiService.get<{
        notifications: Notification[];
        unreadCount: number;
        total: number;
      }>(`/notifications?page=${page}&limit=${limit}`);

      if (!response.success || !response.data) {
        return rejectWithValue(response.error || 'Erreur de récupération des notifications');
      }

      return response.data;
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : 'Erreur de récupération des notifications'
      );
    }
  }
);

/**
 * Marquer comme lu
 */
export const markAsReadAsync = createAsyncThunk(
  'notification/markAsRead',
  async (notificationIds: string[], { rejectWithValue }) => {
    try {
      const response = await apiService.post('/notifications/mark-read', {
        notificationIds,
      });

      if (!response.success) {
        return rejectWithValue(response.error || 'Erreur de marquage');
      }

      return notificationIds;
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : 'Erreur de marquage'
      );
    }
  }
);

/**
 * Mettre à jour les paramètres
 */
export const updateNotificationSettingsAsync = createAsyncThunk(
  'notification/updateSettings',
  async (settings: Partial<NotificationSettings>, { rejectWithValue }) => {
    try {
      const response = await apiService.put<NotificationSettings>(
        '/notifications/settings',
        settings
      );

      if (!response.success || !response.data) {
        return rejectWithValue(response.error || 'Erreur de mise à jour des paramètres');
      }

      return response.data;
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : 'Erreur de mise à jour des paramètres'
      );
    }
  }
);

/**
 * Supprimer une notification
 */
export const deleteNotificationAsync = createAsyncThunk(
  'notification/deleteNotification',
  async (notificationId: string, { rejectWithValue }) => {
    try {
      const response = await apiService.delete(`/notifications/${notificationId}`);

      if (!response.success) {
        return rejectWithValue(response.error || 'Erreur de suppression');
      }

      return notificationId;
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : 'Erreur de suppression'
      );
    }
  }
);

// ===== SLICE =====
const notificationSlice = createSlice({
  name: 'notification',
  initialState,
  reducers: {
    // Actions synchrones
    addNotification: (state, action: PayloadAction<Notification>) => {
      state.notifications.unshift(action.payload);
      if (!action.payload.isRead) {
        state.unreadCount += 1;
        state.badgeCount += 1;
      }
    },
    
    markAsRead: (state, action: PayloadAction<string[]>) => {
      action.payload.forEach(id => {
        const notification = state.notifications.find(n => n.id === id);
        if (notification && !notification.isRead) {
          notification.isRead = true;
          state.unreadCount = Math.max(0, state.unreadCount - 1);
          state.badgeCount = Math.max(0, state.badgeCount - 1);
        }
      });
    },
    
    markAllAsRead: (state) => {
      state.notifications.forEach(notification => {
        notification.isRead = true;
      });
      state.unreadCount = 0;
      state.badgeCount = 0;
    },
    
    updateSettings: (state, action: PayloadAction<Partial<NotificationSettings>>) => {
      state.settings = { ...state.settings, ...action.payload };
    },
    
    setFCMToken: (state, action: PayloadAction<string>) => {
      state.fcmToken = action.payload;
    },
    
    setPermissionStatus: (state, action: PayloadAction<'granted' | 'denied' | 'not-determined'>) => {
      state.permissionStatus = action.payload;
    },
    
    setBadgeCount: (state, action: PayloadAction<number>) => {
      state.badgeCount = Math.max(0, action.payload);
    },
    
    incrementBadgeCount: (state) => {
      state.badgeCount += 1;
    },
    
    decrementBadgeCount: (state) => {
      state.badgeCount = Math.max(0, state.badgeCount - 1);
    },
    
    clearBadgeCount: (state) => {
      state.badgeCount = 0;
    },
    
    removeNotification: (state, action: PayloadAction<string>) => {
      const notification = state.notifications.find(n => n.id === action.payload);
      if (notification && !notification.isRead) {
        state.unreadCount = Math.max(0, state.unreadCount - 1);
        state.badgeCount = Math.max(0, state.badgeCount - 1);
      }
      state.notifications = state.notifications.filter(n => n.id !== action.payload);
    },
    
    clearError: (state) => {
      state.error = null;
    },
    
    // Reset complet
    resetNotification: (state) => {
      Object.assign(state, initialState);
    },
  },
  extraReducers: (builder) => {
    // Register for notifications
    builder
      .addCase(registerForNotificationsAsync.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(registerForNotificationsAsync.fulfilled, (state, action) => {
        state.isLoading = false;
        state.fcmToken = action.payload;
        state.permissionStatus = 'granted';
        state.error = null;
      })
      .addCase(registerForNotificationsAsync.rejected, (state, action) => {
        state.isLoading = false;
        state.permissionStatus = 'denied';
        state.error = action.payload as string;
      });

    // Fetch notifications
    builder
      .addCase(fetchNotificationsAsync.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchNotificationsAsync.fulfilled, (state, action) => {
        state.isLoading = false;
        state.notifications = action.payload.notifications.sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        state.unreadCount = action.payload.unreadCount;
        state.badgeCount = action.payload.unreadCount;
        state.error = null;
      })
      .addCase(fetchNotificationsAsync.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Mark as read
    builder
      .addCase(markAsReadAsync.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(markAsReadAsync.fulfilled, (state, action) => {
        state.isLoading = false;
        action.payload.forEach(id => {
          const notification = state.notifications.find(n => n.id === id);
          if (notification && !notification.isRead) {
            notification.isRead = true;
            state.unreadCount = Math.max(0, state.unreadCount - 1);
            state.badgeCount = Math.max(0, state.badgeCount - 1);
          }
        });
        state.error = null;
      })
      .addCase(markAsReadAsync.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Update settings
    builder
      .addCase(updateNotificationSettingsAsync.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateNotificationSettingsAsync.fulfilled, (state, action) => {
        state.isLoading = false;
        state.settings = action.payload;
        state.error = null;
      })
      .addCase(updateNotificationSettingsAsync.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Delete notification
    builder
      .addCase(deleteNotificationAsync.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteNotificationAsync.fulfilled, (state, action) => {
        state.isLoading = false;
        const notification = state.notifications.find(n => n.id === action.payload);
        if (notification && !notification.isRead) {
          state.unreadCount = Math.max(0, state.unreadCount - 1);
          state.badgeCount = Math.max(0, state.badgeCount - 1);
        }
        state.notifications = state.notifications.filter(n => n.id !== action.payload);
        state.error = null;
      })
      .addCase(deleteNotificationAsync.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

// Export des actions
export const {
  addNotification,
  markAsRead,
  markAllAsRead,
  updateSettings,
  setFCMToken,
  setPermissionStatus,
  setBadgeCount,
  incrementBadgeCount,
  decrementBadgeCount,
  clearBadgeCount,
  removeNotification,
  clearError,
  resetNotification,
} = notificationSlice.actions;

// Export du reducer
export default notificationSlice.reducer;
