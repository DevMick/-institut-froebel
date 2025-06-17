/**
 * Redux Hooks - Rotary Club Mobile
 * Hooks typés et selectors optimisés
 */

import { useDispatch, useSelector, TypedUseSelectorHook } from 'react-redux';
import { createSelector } from '@reduxjs/toolkit';
import type { RootState, AppDispatch } from '../store';

// ===== HOOKS TYPÉS =====

/**
 * Hook useAppDispatch typé
 */
export const useAppDispatch = () => useDispatch<AppDispatch>();

/**
 * Hook useAppSelector typé
 */
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

// ===== SELECTORS OPTIMISÉS =====

// Auth selectors
const selectAuthState = (state: RootState) => state.auth;

export const selectIsAuthenticated = createSelector(
  [selectAuthState],
  (auth) => auth.isAuthenticated
);

export const selectCurrentUser = createSelector(
  [selectAuthState],
  (auth) => auth.user
);

export const selectAuthLoading = createSelector(
  [selectAuthState],
  (auth) => auth.isLoading
);

export const selectBiometricEnabled = createSelector(
  [selectAuthState],
  (auth) => auth.biometricEnabled
);

// Club selectors
const selectClubState = (state: RootState) => state.club;

export const selectCurrentClub = createSelector(
  [selectClubState],
  (club) => club.club
);

export const selectClubMembers = createSelector(
  [selectClubState],
  (club) => club.members
);

export const selectClubOfficers = createSelector(
  [selectClubState],
  (club) => club.officers
);

export const selectActiveMembers = createSelector(
  [selectClubMembers],
  (members) => members.filter(member => member.isActive)
);

export const selectMemberById = createSelector(
  [selectClubMembers, (state: RootState, memberId: string) => memberId],
  (members, memberId) => members.find(member => member.id === memberId)
);

// Reunion selectors
const selectReunionState = (state: RootState) => state.reunion;

export const selectReunions = createSelector(
  [selectReunionState],
  (reunion) => reunion.reunions
);

export const selectCurrentReunion = createSelector(
  [selectReunionState],
  (reunion) => reunion.currentReunion
);

export const selectUpcomingReunions = createSelector(
  [selectReunions],
  (reunions) => {
    const now = new Date();
    return reunions.filter(reunion => new Date(reunion.date) > now);
  }
);

export const selectPastReunions = createSelector(
  [selectReunions],
  (reunions) => {
    const now = new Date();
    return reunions.filter(reunion => new Date(reunion.date) <= now);
  }
);

export const selectAttendanceByReunion = createSelector(
  [selectReunionState, (state: RootState, reunionId: string) => reunionId],
  (reunion, reunionId) => reunion.attendance.filter(att => att.reunionId === reunionId)
);

// Member selectors
const selectMemberState = (state: RootState) => state.member;

export const selectMemberProfile = createSelector(
  [selectMemberState],
  (member) => member.profile
);

export const selectMemberPreferences = createSelector(
  [selectMemberState],
  (member) => member.preferences
);

export const selectMemberRoles = createSelector(
  [selectMemberState],
  (member) => member.roles
);

export const selectMemberPermissions = createSelector(
  [selectMemberState],
  (member) => member.permissions
);

// Finance selectors
const selectFinanceState = (state: RootState) => state.finance;

export const selectTransactions = createSelector(
  [selectFinanceState],
  (finance) => finance.transactions
);

export const selectBalance = createSelector(
  [selectFinanceState],
  (finance) => finance.balance
);

export const selectPendingDues = createSelector(
  [selectFinanceState],
  (finance) => finance.dues.filter(due => due.status === 'pending')
);

export const selectOverdueDues = createSelector(
  [selectFinanceState],
  (finance) => finance.dues.filter(due => due.status === 'overdue')
);

export const selectRecentTransactions = createSelector(
  [selectTransactions],
  (transactions) => transactions.slice(0, 10)
);

// Notification selectors
const selectNotificationState = (state: RootState) => state.notification;

export const selectNotifications = createSelector(
  [selectNotificationState],
  (notification) => notification.notifications
);

export const selectUnreadNotifications = createSelector(
  [selectNotifications],
  (notifications) => notifications.filter(notif => !notif.isRead)
);

export const selectUnreadCount = createSelector(
  [selectNotificationState],
  (notification) => notification.unreadCount
);

export const selectBadgeCount = createSelector(
  [selectNotificationState],
  (notification) => notification.badgeCount
);

export const selectNotificationSettings = createSelector(
  [selectNotificationState],
  (notification) => notification.settings
);

// ===== HOOKS MÉTIER =====

/**
 * Hook pour l'authentification
 */
export const useAuth = () => {
  const dispatch = useAppDispatch();
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const user = useAppSelector(selectCurrentUser);
  const loading = useAppSelector(selectAuthLoading);
  const biometricEnabled = useAppSelector(selectBiometricEnabled);
  const error = useAppSelector(state => state.auth.error);

  return {
    isAuthenticated,
    user,
    loading,
    biometricEnabled,
    error,
    dispatch,
  };
};

/**
 * Hook pour le club
 */
export const useClub = () => {
  const dispatch = useAppDispatch();
  const club = useAppSelector(selectCurrentClub);
  const members = useAppSelector(selectClubMembers);
  const officers = useAppSelector(selectClubOfficers);
  const activeMembers = useAppSelector(selectActiveMembers);
  const loading = useAppSelector(state => state.club.isLoading);
  const error = useAppSelector(state => state.club.error);

  return {
    club,
    members,
    officers,
    activeMembers,
    loading,
    error,
    dispatch,
  };
};

/**
 * Hook pour les réunions
 */
export const useReunions = () => {
  const dispatch = useAppDispatch();
  const reunions = useAppSelector(selectReunions);
  const currentReunion = useAppSelector(selectCurrentReunion);
  const upcomingReunions = useAppSelector(selectUpcomingReunions);
  const pastReunions = useAppSelector(selectPastReunions);
  const qrCode = useAppSelector(state => state.reunion.qrCode);
  const loading = useAppSelector(state => state.reunion.isLoading);
  const error = useAppSelector(state => state.reunion.error);

  return {
    reunions,
    currentReunion,
    upcomingReunions,
    pastReunions,
    qrCode,
    loading,
    error,
    dispatch,
  };
};

/**
 * Hook pour le membre
 */
export const useMember = () => {
  const dispatch = useAppDispatch();
  const profile = useAppSelector(selectMemberProfile);
  const preferences = useAppSelector(selectMemberPreferences);
  const roles = useAppSelector(selectMemberRoles);
  const permissions = useAppSelector(selectMemberPermissions);
  const loading = useAppSelector(state => state.member.isLoading);
  const error = useAppSelector(state => state.member.error);

  return {
    profile,
    preferences,
    roles,
    permissions,
    loading,
    error,
    dispatch,
  };
};

/**
 * Hook pour les finances
 */
export const useFinance = () => {
  const dispatch = useAppDispatch();
  const transactions = useAppSelector(selectTransactions);
  const balance = useAppSelector(selectBalance);
  const pendingDues = useAppSelector(selectPendingDues);
  const overdueDues = useAppSelector(selectOverdueDues);
  const recentTransactions = useAppSelector(selectRecentTransactions);
  const loading = useAppSelector(state => state.finance.isLoading);
  const error = useAppSelector(state => state.finance.error);

  return {
    transactions,
    balance,
    pendingDues,
    overdueDues,
    recentTransactions,
    loading,
    error,
    dispatch,
  };
};

/**
 * Hook pour les notifications
 */
export const useNotifications = () => {
  const dispatch = useAppDispatch();
  const notifications = useAppSelector(selectNotifications);
  const unreadNotifications = useAppSelector(selectUnreadNotifications);
  const unreadCount = useAppSelector(selectUnreadCount);
  const badgeCount = useAppSelector(selectBadgeCount);
  const settings = useAppSelector(selectNotificationSettings);
  const loading = useAppSelector(state => state.notification.isLoading);
  const error = useAppSelector(state => state.notification.error);

  return {
    notifications,
    unreadNotifications,
    unreadCount,
    badgeCount,
    settings,
    loading,
    error,
    dispatch,
  };
};

/**
 * Hook pour obtenir un membre par ID
 */
export const useMemberById = (memberId: string) => {
  return useAppSelector(state => selectMemberById(state, memberId));
};

/**
 * Hook pour obtenir les présences d'une réunion
 */
export const useAttendanceByReunion = (reunionId: string) => {
  return useAppSelector(state => selectAttendanceByReunion(state, reunionId));
};

/**
 * Hook pour vérifier les permissions
 */
export const usePermissions = () => {
  const permissions = useAppSelector(selectMemberPermissions);
  
  const hasPermission = (permission: string) => {
    return permissions.includes(permission);
  };
  
  const hasAnyPermission = (permissionList: string[]) => {
    return permissionList.some(permission => permissions.includes(permission));
  };
  
  const hasAllPermissions = (permissionList: string[]) => {
    return permissionList.every(permission => permissions.includes(permission));
  };
  
  return {
    permissions,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
  };
};
