/**
 * Notification Types - Rotary Club Mobile
 * Types pour réunion reminders, finance alerts et communications
 */

// Base notification interface
export interface BaseNotification {
  id: string;
  title: string;
  body: string;
  timestamp: Date;
  read: boolean;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  category: string;
  data?: Record<string, any>;
}

// Notification types
export type NotificationType = 
  | 'reunion_reminder' 
  | 'finance_due' 
  | 'announcement' 
  | 'project_update'
  | 'member_joined'
  | 'event_cancelled'
  | 'system_update';

// Réunion reminders
export interface ReunionReminderNotification extends BaseNotification {
  type: 'reunion_reminder';
  data: {
    reunionId: string;
    title: string;
    date: string; // ISO string
    time: string; // HH:mm format
    location: string;
    reminderType: '24h' | '1h' | '15min';
    confirmed?: boolean;
    agenda?: string;
    presenter?: string;
  };
  actions: Array<{
    id: 'confirm_presence' | 'view_details' | 'add_calendar' | 'decline';
    title: string;
    icon?: string;
    destructive?: boolean;
  }>;
}

// Finance alerts
export interface FinanceDueNotification extends BaseNotification {
  type: 'finance_due';
  data: {
    paymentId: string;
    amount: number;
    currency: string;
    dueDate: string; // ISO string
    description: string;
    reminderType: '7days' | '1day' | 'due_today' | 'overdue';
    invoiceUrl?: string;
    paymentMethods: string[];
  };
  actions: Array<{
    id: 'pay_now' | 'view_invoice' | 'request_extension' | 'contact_treasurer';
    title: string;
    icon?: string;
    primary?: boolean;
  }>;
}

// Club communications
export interface AnnouncementNotification extends BaseNotification {
  type: 'announcement';
  data: {
    announcementId: string;
    senderId: string;
    senderName: string;
    senderRole: string;
    message: string;
    attachments?: Array<{
      id: string;
      name: string;
      type: string;
      url: string;
    }>;
    urgent?: boolean;
    expiresAt?: string; // ISO string
  };
  actions: Array<{
    id: 'read_full' | 'reply' | 'share' | 'save' | 'mark_important';
    title: string;
    icon?: string;
  }>;
}

// Project updates
export interface ProjectUpdateNotification extends BaseNotification {
  type: 'project_update';
  data: {
    projectId: string;
    projectName: string;
    updateType: 'progress' | 'milestone' | 'completion' | 'funding' | 'volunteer_needed';
    progress?: number; // 0-100
    milestone?: string;
    fundingGoal?: number;
    fundingCurrent?: number;
    volunteersNeeded?: number;
    deadline?: string; // ISO string
  };
  actions: Array<{
    id: 'view_project' | 'volunteer' | 'donate' | 'share_progress';
    title: string;
    icon?: string;
  }>;
}

// Member joined
export interface MemberJoinedNotification extends BaseNotification {
  type: 'member_joined';
  data: {
    memberId: string;
    memberName: string;
    memberPhoto?: string;
    classification?: string;
    sponsorId?: string;
    sponsorName?: string;
    joinDate: string; // ISO string
  };
  actions: Array<{
    id: 'view_profile' | 'send_welcome' | 'add_contact';
    title: string;
    icon?: string;
  }>;
}

// Union type for all notifications
export type RotaryNotification = 
  | ReunionReminderNotification
  | FinanceDueNotification
  | AnnouncementNotification
  | ProjectUpdateNotification
  | MemberJoinedNotification;

// Notification settings
export interface NotificationSettings {
  enabled: boolean;
  reunionReminders: {
    enabled: boolean;
    timing: Array<'24h' | '1h' | '15min'>;
    sound: boolean;
    vibration: boolean;
  };
  financeAlerts: {
    enabled: boolean;
    timing: Array<'7days' | '1day' | 'due_today'>;
    sound: boolean;
    vibration: boolean;
  };
  announcements: {
    enabled: boolean;
    urgentOnly: boolean;
    sound: boolean;
    vibration: boolean;
  };
  projectUpdates: {
    enabled: boolean;
    milestones: boolean;
    funding: boolean;
    volunteers: boolean;
    sound: boolean;
    vibration: boolean;
  };
  memberUpdates: {
    enabled: boolean;
    newMembers: boolean;
    birthdays: boolean;
    achievements: boolean;
    sound: boolean;
    vibration: boolean;
  };
  quietHours: {
    enabled: boolean;
    startTime: string; // HH:mm
    endTime: string; // HH:mm
  };
  doNotDisturb: {
    enabled: boolean;
    schedule?: {
      days: Array<'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday'>;
      startTime: string; // HH:mm
      endTime: string; // HH:mm
    };
  };
}

// Notification payload for FCM
export interface FCMNotificationPayload {
  notification?: {
    title: string;
    body: string;
    image?: string;
    icon?: string;
    color?: string;
    sound?: string;
    tag?: string;
    click_action?: string;
  };
  data: {
    type: NotificationType;
    id: string;
    timestamp: string;
    priority: string;
    [key: string]: string; // FCM data must be strings
  };
  android?: {
    notification?: {
      channel_id: string;
      priority: 'min' | 'low' | 'default' | 'high' | 'max';
      visibility: 'private' | 'public' | 'secret';
      sticky?: boolean;
      local_only?: boolean;
    };
    data?: Record<string, string>;
  };
  apns?: {
    payload: {
      aps: {
        alert?: {
          title?: string;
          body?: string;
        };
        badge?: number;
        sound?: string;
        'content-available'?: number;
        'mutable-content'?: number;
      };
    };
  };
}

// Notification action result
export interface NotificationActionResult {
  actionId: string;
  notificationId: string;
  success: boolean;
  error?: string;
  data?: any;
}

// Notification scheduling
export interface NotificationSchedule {
  id: string;
  notificationId: string;
  scheduledFor: Date;
  type: NotificationType;
  payload: FCMNotificationPayload;
  recurring?: {
    frequency: 'daily' | 'weekly' | 'monthly';
    interval: number;
    endDate?: Date;
  };
  conditions?: {
    userOnline?: boolean;
    quietHours?: boolean;
    doNotDisturb?: boolean;
  };
}

// Notification analytics
export interface NotificationAnalytics {
  notificationId: string;
  type: NotificationType;
  sentAt: Date;
  deliveredAt?: Date;
  openedAt?: Date;
  actionTaken?: string;
  dismissed?: boolean;
  deviceInfo: {
    platform: string;
    version: string;
    model?: string;
  };
}

// Notification batch
export interface NotificationBatch {
  id: string;
  name: string;
  description?: string;
  targetAudience: {
    clubIds?: string[];
    memberIds?: string[];
    roles?: string[];
    classifications?: string[];
    tags?: string[];
  };
  notifications: RotaryNotification[];
  scheduledFor?: Date;
  status: 'draft' | 'scheduled' | 'sending' | 'sent' | 'failed';
  analytics: {
    totalSent: number;
    totalDelivered: number;
    totalOpened: number;
    totalActioned: number;
  };
}

export default {
  BaseNotification,
  NotificationType,
  ReunionReminderNotification,
  FinanceDueNotification,
  AnnouncementNotification,
  ProjectUpdateNotification,
  MemberJoinedNotification,
  RotaryNotification,
  NotificationSettings,
  FCMNotificationPayload,
  NotificationActionResult,
  NotificationSchedule,
  NotificationAnalytics,
  NotificationBatch,
};
