// Global types for the Rotary Club Mobile application
import type { TextStyle, ViewStyle, ImageStyle } from 'react-native';

// ===== TYPES MÉTIER ROTARY =====

export interface Member {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  club: RotaryClub;
  membershipType: MembershipType;
  joinDate: Date;
  avatar?: string;
  position?: ClubPosition;
  classification?: string;
  sponsor?: string;
  isActive: boolean;
  attendanceRate?: number;
  lastLogin?: Date;
}

export interface User extends Member {
  // User hérite de Member avec des propriétés supplémentaires
  preferences: UserPreferences;
  notifications: NotificationSettings;
}

export interface Club extends RotaryClub {}

export interface RotaryClub {
  id: string;
  name: string;
  district: string;
  location: {
    address: string;
    city: string;
    country: string;
    coordinates?: {
      latitude: number;
      longitude: number;
    };
  };
  meetingInfo: {
    day: string;
    time: string;
    venue: string;
  };
  president: string;
  secretary: string;
  memberCount: number;
  foundedDate: Date;
  charterNumber: string;
  website?: string;
  logo?: string;
}

export interface Reunion {
  id: string;
  clubId: string;
  date: Date;
  type: ReunionType;
  title: string;
  description?: string;
  location: string;
  startTime: string;
  endTime: string;
  agenda?: AgendaItem[];
  attendees: Attendance[];
  speaker?: Speaker;
  isRecurring: boolean;
  recurringPattern?: RecurringPattern;
  status: ReunionStatus;
}

export interface Finance {
  id: string;
  clubId: string;
  type: FinanceType;
  amount: number;
  currency: string;
  description: string;
  date: Date;
  category: FinanceCategory;
  memberId?: string;
  projectId?: string;
  receiptUrl?: string;
  status: FinanceStatus;
}

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  data?: Record<string, any>;
  isRead: boolean;
  createdAt: Date;
  scheduledFor?: Date;
  priority: NotificationPriority;
}

export interface Attendance {
  id: string;
  memberId: string;
  reunionId: string;
  status: AttendanceStatus;
  arrivalTime?: Date;
  departureTime?: Date;
  excuseReason?: string;
  makeupDetails?: MakeupDetails;
}

export interface Event {
  id: string;
  title: string;
  description: string;
  date: Date;
  location: string;
  organizer: User;
  attendees: User[];
  maxAttendees?: number;
  category: EventCategory;
  isPublic: boolean;
}

export interface Project {
  id: string;
  title: string;
  description: string;
  startDate: Date;
  endDate?: Date;
  budget: number;
  raised: number;
  status: ProjectStatus;
  category: ProjectCategory;
  images: string[];
  participants: User[];
  club: RotaryClub;
}

// ===== TYPES ÉNUMÉRÉS =====
export type MembershipType = 'Active' | 'Honorary' | 'Corporate' | 'Youth' | 'Past';
export type ClubPosition = 'President' | 'Secretary' | 'Treasurer' | 'Director' | 'Member' | 'Past President';
export type EventCategory = 'Service' | 'Fellowship' | 'Fundraising' | 'Meeting' | 'Training' | 'Social';
export type ProjectStatus = 'Planning' | 'Active' | 'Completed' | 'Cancelled' | 'On Hold';
export type ProjectCategory = 'Community' | 'International' | 'Youth' | 'Environment' | 'Health' | 'Education';

export type ReunionType = 'Regular' | 'Board' | 'Committee' | 'Special' | 'Social' | 'Service';
export type ReunionStatus = 'Scheduled' | 'InProgress' | 'Completed' | 'Cancelled' | 'Postponed';
export type FinanceType = 'Income' | 'Expense' | 'Transfer' | 'Donation';
export type FinanceCategory = 'Dues' | 'Meals' | 'Projects' | 'Administration' | 'Events' | 'Donations';
export type FinanceStatus = 'Pending' | 'Approved' | 'Paid' | 'Cancelled';
export type NotificationType = 'Meeting' | 'Event' | 'Payment' | 'Announcement' | 'Reminder' | 'System';
export type NotificationPriority = 'Low' | 'Normal' | 'High' | 'Urgent';
export type AttendanceStatus = 'Present' | 'Absent' | 'Excused' | 'Makeup' | 'Late';

// ===== TYPES UI =====
export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
export type ButtonSize = 'small' | 'medium' | 'large';
export type InputType = 'text' | 'email' | 'password' | 'number' | 'phone' | 'search';
export type CardType = 'default' | 'outlined' | 'elevated';
export type LoadingState = 'idle' | 'loading' | 'success' | 'error';
export type ModalSize = 'small' | 'medium' | 'large' | 'fullscreen';
export type ToastType = 'success' | 'error' | 'warning' | 'info';

// ===== TYPES NAVIGATION =====
export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
  ResetPassword: { token: string };
  Welcome: undefined;
};

export type MainTabParamList = {
  Home: undefined;
  Meetings: undefined;
  Members: undefined;
  Projects: undefined;
  Profile: undefined;
};

export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
  Profile: { userId: string };
  MemberDetail: { memberId: string };
  MeetingDetail: { meetingId: string };
  ProjectDetail: { projectId: string };
  ClubDetail: { clubId: string };
  Settings: undefined;
  Notifications: undefined;
  Finance: undefined;
  FinanceDetail: { transactionId: string };
  QRScanner: undefined;
  Camera: { type: 'profile' | 'event' | 'document' };
};

// ===== TYPES REDUX =====
export interface RootState {
  auth: AuthState;
  user: UserState;
  club: ClubState;
  meetings: MeetingsState;
  members: MembersState;
  projects: ProjectsState;
  notifications: NotificationsState;
  finance: FinanceState;
  ui: UIState;
}

export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  loading: boolean;
  error: string | null;
}

export interface UIState {
  theme: 'light' | 'dark';
  loading: Record<string, boolean>;
  errors: Record<string, string | null>;
  modals: Record<string, boolean>;
  toasts: ToastMessage[];
}

// ===== TYPES API =====
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  timestamp: string;
  requestId: string;
}

export interface ErrorResponse {
  success: false;
  error: string;
  message: string;
  code: string;
  details?: Record<string, any>;
  timestamp: string;
  requestId: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
  totalPages: number;
}

// Form types
export interface LoginForm {
  email: string;
  password: string;
}

export interface RegisterForm {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  phone?: string;
  clubId?: string;
}

// Theme types
export interface Theme {
  colors: {
    primary: string;
    secondary: string;
    background: string;
    surface: string;
    text: string;
    textSecondary: string;
    border: string;
    error: string;
    success: string;
    warning: string;
  };
  spacing: {
    xs: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
  };
  typography: {
    h1: TextStyle;
    h2: TextStyle;
    h3: TextStyle;
    body: TextStyle;
    caption: TextStyle;
  };
}

// ===== INTERFACES DE SUPPORT =====
export interface UserPreferences {
  language: string;
  notifications: boolean;
  emailUpdates: boolean;
  theme: 'light' | 'dark' | 'auto';
  currency: string;
  timezone: string;
}

export interface NotificationSettings {
  meetings: boolean;
  events: boolean;
  payments: boolean;
  announcements: boolean;
  reminders: boolean;
  push: boolean;
  email: boolean;
  sms: boolean;
}

export interface AgendaItem {
  id: string;
  title: string;
  description?: string;
  duration: number;
  presenter?: string;
  order: number;
}

export interface Speaker {
  id: string;
  name: string;
  title?: string;
  company?: string;
  bio?: string;
  photo?: string;
  topic: string;
}

export interface RecurringPattern {
  frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
  interval: number;
  daysOfWeek?: number[];
  endDate?: Date;
  occurrences?: number;
}

export interface MakeupDetails {
  clubId: string;
  clubName: string;
  date: Date;
  type: 'meeting' | 'service' | 'event';
  verifiedBy?: string;
}

export interface ToastMessage {
  id: string;
  type: ToastType;
  title: string;
  message: string;
  duration?: number;
  action?: {
    label: string;
    onPress: () => void;
  };
}

// ===== TYPES D'ÉTAT REDUX =====
export interface UserState {
  profile: User | null;
  preferences: UserPreferences;
  loading: boolean;
  error: string | null;
}

export interface ClubState {
  current: RotaryClub | null;
  clubs: RotaryClub[];
  loading: boolean;
  error: string | null;
}

export interface MeetingsState {
  meetings: Reunion[];
  currentMeeting: Reunion | null;
  attendance: Attendance[];
  loading: boolean;
  error: string | null;
}

export interface MembersState {
  members: Member[];
  currentMember: Member | null;
  loading: boolean;
  error: string | null;
}

export interface ProjectsState {
  projects: Project[];
  currentProject: Project | null;
  loading: boolean;
  error: string | null;
}

export interface NotificationsState {
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
  error: string | null;
}

export interface FinanceState {
  transactions: Finance[];
  balance: number;
  loading: boolean;
  error: string | null;
}

// ===== TYPES DISPATCH =====
export type AppDispatch = any; // À définir avec Redux Toolkit

// ===== TYPES FORMULAIRES =====
export interface LoginForm {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterForm {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  phone?: string;
  clubId: string;
}

export interface ForgotPasswordForm {
  email: string;
}

export interface ResetPasswordForm {
  token: string;
  password: string;
  confirmPassword: string;
}

// Re-export React Native types that we commonly use
export type { TextStyle, ViewStyle, ImageStyle };
