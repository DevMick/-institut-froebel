/**
 * Navigation Types - Rotary Club Mobile
 * Types navigation AuthStack, MainTabs, RootStack avec helpers typés
 */

import type { StackScreenProps } from '@react-navigation/stack';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type { CompositeScreenProps, NavigatorScreenParams } from '@react-navigation/native';

// ===== AUTH STACK PARAM LIST =====
export type AuthStackParamList = {
  Welcome: undefined;
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
  ResetPassword: { token: string };
  OnboardingStep1: undefined;
  OnboardingStep2: undefined;
  OnboardingStep3: undefined;
};

// ===== MAIN TAB PARAM LIST =====
export type MainTabParamList = {
  Home: undefined;
  Reunions: undefined;
  Members: undefined;
  Finance: undefined;
  Profile: undefined;
};

// ===== STACK NAVIGATORS PARAM LISTS =====
export type HomeStackParamList = {
  HomeScreen: undefined;
  Announcements: undefined;
  ClubInfo: undefined;
  Settings: undefined;
};

export type ReunionsStackParamList = {
  ReunionsScreen: undefined;
  ReunionDetail: { reunionId: string };
  CreateReunion: undefined;
  EditReunion: { reunionId: string };
  QRScanner: { reunionId: string };
  AttendanceReport: { reunionId: string };
};

export type MembersStackParamList = {
  MembersScreen: undefined;
  MemberDetail: { memberId: string };
  MemberEdit: { memberId: string };
  AddMember: undefined;
  MemberDirectory: undefined;
  OfficersManagement: undefined;
};

export type FinanceStackParamList = {
  FinanceScreen: undefined;
  TransactionDetail: { transactionId: string };
  AddTransaction: undefined;
  PayDues: { duesId: string };
  FinanceReport: undefined;
  BudgetManagement: undefined;
};

export type ProfileStackParamList = {
  ProfileScreen: undefined;
  EditProfile: undefined;
  ChangePassword: undefined;
  NotificationSettings: undefined;
  PrivacySettings: undefined;
  About: undefined;
  Help: undefined;
};

// ===== ROOT STACK PARAM LIST =====
export type RootStackParamList = {
  // Auth Flow
  AuthStack: NavigatorScreenParams<AuthStackParamList>;
  
  // Main App
  MainTabs: NavigatorScreenParams<MainTabParamList>;
  
  // Modal Screens
  NotificationModal: { notificationId: string };
  ImageViewer: { imageUrl: string; title?: string };
  DocumentViewer: { documentUrl: string; title?: string };
  QRCodeModal: { qrCode: string; title?: string };
  
  // Full Screen Modals
  Camera: { type: 'profile' | 'document' | 'receipt' };
  PhotoEditor: { imageUri: string };
  
  // Deep Link Screens
  ReunionDeepLink: { reunionId: string };
  MemberDeepLink: { memberId: string };
  PaymentDeepLink: { paymentId: string };
  
  // Error Screens
  ErrorScreen: { error: string; retry?: () => void };
  MaintenanceScreen: undefined;
  NoInternetScreen: undefined;
};

// ===== SCREEN PROPS HELPERS =====

// Auth Stack Screen Props
export type AuthStackScreenProps<T extends keyof AuthStackParamList> = StackScreenProps<
  AuthStackParamList,
  T
>;

// Main Tab Screen Props
export type MainTabScreenProps<T extends keyof MainTabParamList> = CompositeScreenProps<
  BottomTabScreenProps<MainTabParamList, T>,
  StackScreenProps<RootStackParamList>
>;

// Home Stack Screen Props
export type HomeStackScreenProps<T extends keyof HomeStackParamList> = CompositeScreenProps<
  StackScreenProps<HomeStackParamList, T>,
  MainTabScreenProps<'Home'>
>;

// Reunions Stack Screen Props
export type ReunionsStackScreenProps<T extends keyof ReunionsStackParamList> = CompositeScreenProps<
  StackScreenProps<ReunionsStackParamList, T>,
  MainTabScreenProps<'Reunions'>
>;

// Members Stack Screen Props
export type MembersStackScreenProps<T extends keyof MembersStackParamList> = CompositeScreenProps<
  StackScreenProps<MembersStackParamList, T>,
  MainTabScreenProps<'Members'>
>;

// Finance Stack Screen Props
export type FinanceStackScreenProps<T extends keyof FinanceStackParamList> = CompositeScreenProps<
  StackScreenProps<FinanceStackParamList, T>,
  MainTabScreenProps<'Finance'>
>;

// Profile Stack Screen Props
export type ProfileStackScreenProps<T extends keyof ProfileStackParamList> = CompositeScreenProps<
  StackScreenProps<ProfileStackParamList, T>,
  MainTabScreenProps<'Profile'>
>;

// Root Stack Screen Props
export type RootStackScreenProps<T extends keyof RootStackParamList> = StackScreenProps<
  RootStackParamList,
  T
>;

// ===== NAVIGATION PROP HELPERS =====
export type AuthStackNavigationProp = AuthStackScreenProps<keyof AuthStackParamList>['navigation'];
export type MainTabNavigationProp = MainTabScreenProps<keyof MainTabParamList>['navigation'];
export type RootStackNavigationProp = RootStackScreenProps<keyof RootStackParamList>['navigation'];

// ===== ROUTE PROP HELPERS =====
export type AuthStackRouteProp<T extends keyof AuthStackParamList> = AuthStackScreenProps<T>['route'];
export type MainTabRouteProp<T extends keyof MainTabParamList> = MainTabScreenProps<T>['route'];
export type RootStackRouteProp<T extends keyof RootStackParamList> = RootStackScreenProps<T>['route'];

// ===== DEEP LINKING TYPES =====
export interface DeepLinkConfig {
  screens: {
    AuthStack: {
      screens: {
        Login: 'login';
        Register: 'register';
        ForgotPassword: 'forgot-password';
        ResetPassword: 'reset-password/:token';
      };
    };
    MainTabs: {
      screens: {
        Home: 'home';
        Reunions: {
          screens: {
            ReunionsScreen: 'reunions';
            ReunionDetail: 'reunion/:reunionId';
          };
        };
        Members: {
          screens: {
            MembersScreen: 'members';
            MemberDetail: 'member/:memberId';
          };
        };
        Finance: {
          screens: {
            FinanceScreen: 'finance';
            PayDues: 'pay-dues/:duesId';
          };
        };
        Profile: 'profile';
      };
    };
    // Direct deep link screens
    ReunionDeepLink: 'reunion/:reunionId';
    MemberDeepLink: 'member/:memberId';
    PaymentDeepLink: 'payment/:paymentId';
  };
}

// ===== NAVIGATION STATE TYPES =====
export interface NavigationState {
  key: string;
  index: number;
  routeNames: string[];
  history?: unknown[];
  routes: Array<{
    key: string;
    name: string;
    params?: object;
    state?: NavigationState;
  }>;
  type: string;
  stale: false;
}

// ===== SCREEN OPTIONS TYPES =====
export interface ScreenOptions {
  title?: string;
  headerShown?: boolean;
  headerTitle?: string;
  headerTitleAlign?: 'left' | 'center';
  headerStyle?: object;
  headerTintColor?: string;
  headerTitleStyle?: object;
  headerBackTitle?: string;
  headerBackTitleVisible?: boolean;
  gestureEnabled?: boolean;
  animationEnabled?: boolean;
  presentation?: 'card' | 'modal' | 'transparentModal';
}

// ===== TAB BAR OPTIONS TYPES =====
export interface TabBarOptions {
  tabBarLabel?: string;
  tabBarIcon?: ({ focused, color, size }: { focused: boolean; color: string; size: number }) => React.ReactNode;
  tabBarBadge?: string | number;
  tabBarAccessibilityLabel?: string;
  tabBarTestID?: string;
  tabBarActiveTintColor?: string;
  tabBarInactiveTintColor?: string;
  tabBarShowLabel?: boolean;
  tabBarStyle?: object;
  tabBarLabelStyle?: object;
  tabBarIconStyle?: object;
}

// ===== NAVIGATION ANALYTICS TYPES =====
export interface ScreenTrackingEvent {
  screenName: string;
  previousScreenName?: string;
  timestamp: number;
  params?: Record<string, any>;
  duration?: number;
}

export interface NavigationAnalytics {
  screenViews: ScreenTrackingEvent[];
  currentScreen: string | null;
  sessionStartTime: number;
  totalScreenTime: Record<string, number>;
}

// ===== EXPORT TYPES =====
declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}

export default {
  AuthStackParamList,
  MainTabParamList,
  RootStackParamList,
  DeepLinkConfig,
};
