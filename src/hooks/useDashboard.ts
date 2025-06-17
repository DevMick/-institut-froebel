/**
 * Dashboard Hook - Rotary Club Mobile
 * Hook métier dashboard avec cache, auto-refresh et offline fallback
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth, useClub, useReunion, useFinance, useNetwork } from './redux';
import { clubService, reunionService, financeService } from '../services';

interface DashboardData {
  welcomeData: {
    greeting: string;
    memberName: string;
    clubName: string;
    role: string;
    lastLogin: Date | null;
    profilePhoto?: string;
  };
  nextReunion: {
    id: string;
    title: string;
    date: Date;
    location: string;
    confirmed: boolean;
    weather?: {
      temperature: number;
      condition: string;
      icon: string;
    };
  } | null;
  quickStats: {
    attendanceThisMonth: number;
    duesStatus: 'up-to-date' | 'overdue' | 'partial';
    newMembersThisMonth: number;
    totalMembers: number;
  };
  recentActivities: Array<{
    id: string;
    type: 'member' | 'reunion' | 'payment' | 'announcement';
    title: string;
    description: string;
    timestamp: Date;
    icon: string;
  }>;
}

interface UseDashboardReturn {
  data: DashboardData | null;
  loading: boolean;
  refreshing: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  lastUpdated: Date | null;
}

const CACHE_KEY = 'dashboard_data';
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export const useDashboard = (): UseDashboardReturn => {
  const { user } = useAuth();
  const { currentClub } = useClub();
  const { nextReunion } = useReunion();
  const { isOnline } = useNetwork();

  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  // Générer le greeting basé sur l'heure
  const getGreeting = useCallback((): string => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Bonjour';
    if (hour < 18) return 'Bon après-midi';
    return 'Bonsoir';
  }, []);

  // Charger les données depuis le cache
  const loadCachedData = useCallback(async (): Promise<DashboardData | null> => {
    try {
      const cached = await AsyncStorage.getItem(CACHE_KEY);
      if (cached) {
        const { data: cachedData, timestamp } = JSON.parse(cached);
        const now = Date.now();
        
        // Vérifier si le cache est encore valide
        if (now - timestamp < CACHE_DURATION) {
          // Convertir les dates string en Date objects
          const parsedData = {
            ...cachedData,
            nextReunion: cachedData.nextReunion ? {
              ...cachedData.nextReunion,
              date: new Date(cachedData.nextReunion.date),
            } : null,
            recentActivities: cachedData.recentActivities.map((activity: any) => ({
              ...activity,
              timestamp: new Date(activity.timestamp),
            })),
            welcomeData: {
              ...cachedData.welcomeData,
              lastLogin: cachedData.welcomeData.lastLogin 
                ? new Date(cachedData.welcomeData.lastLogin) 
                : null,
            },
          };
          
          setLastUpdated(new Date(timestamp));
          return parsedData;
        }
      }
    } catch (error) {
      console.error('Error loading cached dashboard data:', error);
    }
    return null;
  }, []);

  // Sauvegarder les données en cache
  const saveCachedData = useCallback(async (dashboardData: DashboardData): Promise<void> => {
    try {
      const cacheData = {
        data: dashboardData,
        timestamp: Date.now(),
      };
      await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(cacheData));
    } catch (error) {
      console.error('Error saving dashboard data to cache:', error);
    }
  }, []);

  // Fetch des données depuis l'API
  const fetchDashboardData = useCallback(async (): Promise<DashboardData> => {
    if (!user || !currentClub) {
      throw new Error('Utilisateur ou club non disponible');
    }

    // Fetch en parallèle pour optimiser les performances
    const [
      clubStats,
      recentActivities,
      memberAttendance,
      duesStatus,
      weatherData,
    ] = await Promise.allSettled([
      clubService.getClubStats(currentClub.id),
      clubService.getRecentActivities(currentClub.id, 5),
      reunionService.getMemberAttendanceStats(user.id),
      financeService.getMemberDuesStatus(user.id),
      // TODO: Intégrer API météo
      Promise.resolve(null),
    ]);

    // Construire les données du dashboard
    const dashboardData: DashboardData = {
      welcomeData: {
        greeting: getGreeting(),
        memberName: `${user.firstName} ${user.lastName}`,
        clubName: currentClub.name,
        role: user.role || 'Membre',
        lastLogin: user.lastLogin ? new Date(user.lastLogin) : null,
        profilePhoto: user.profilePhoto,
      },
      nextReunion: nextReunion ? {
        id: nextReunion.id,
        title: nextReunion.title,
        date: new Date(nextReunion.date),
        location: nextReunion.location,
        confirmed: nextReunion.attendees?.includes(user.id) || false,
        weather: weatherData.status === 'fulfilled' ? weatherData.value : undefined,
      } : null,
      quickStats: {
        attendanceThisMonth: memberAttendance.status === 'fulfilled' 
          ? memberAttendance.value.thisMonth 
          : 0,
        duesStatus: duesStatus.status === 'fulfilled' 
          ? duesStatus.value.status 
          : 'up-to-date',
        newMembersThisMonth: clubStats.status === 'fulfilled' 
          ? clubStats.value.newMembersThisMonth 
          : 0,
        totalMembers: clubStats.status === 'fulfilled' 
          ? clubStats.value.totalMembers 
          : 0,
      },
      recentActivities: recentActivities.status === 'fulfilled' 
        ? recentActivities.value.map((activity: any) => ({
            id: activity.id,
            type: activity.type,
            title: activity.title,
            description: activity.description,
            timestamp: new Date(activity.timestamp),
            icon: getActivityIcon(activity.type),
          }))
        : [],
    };

    return dashboardData;
  }, [user, currentClub, nextReunion, getGreeting]);

  // Obtenir l'icône pour un type d'activité
  const getActivityIcon = useCallback((type: string): string => {
    switch (type) {
      case 'member': return 'person-add';
      case 'reunion': return 'event';
      case 'payment': return 'payment';
      case 'announcement': return 'campaign';
      default: return 'info';
    }
  }, []);

  // Fonction de refresh
  const refresh = useCallback(async (): Promise<void> => {
    if (!isOnline) {
      setError('Aucune connexion internet disponible');
      return;
    }

    setRefreshing(true);
    setError(null);

    try {
      const freshData = await fetchDashboardData();
      setData(freshData);
      setLastUpdated(new Date());
      await saveCachedData(freshData);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors du chargement';
      setError(errorMessage);
      
      // En cas d'erreur, essayer de charger depuis le cache
      const cachedData = await loadCachedData();
      if (cachedData) {
        setData(cachedData);
      }
    } finally {
      setRefreshing(false);
    }
  }, [isOnline, fetchDashboardData, saveCachedData, loadCachedData]);

  // Chargement initial
  useEffect(() => {
    const loadInitialData = async () => {
      setLoading(true);
      
      // Charger d'abord depuis le cache
      const cachedData = await loadCachedData();
      if (cachedData) {
        setData(cachedData);
      }

      // Puis essayer de refresh si en ligne
      if (isOnline) {
        await refresh();
      } else if (!cachedData) {
        setError('Aucune donnée disponible hors ligne');
      }
      
      setLoading(false);
    };

    if (user && currentClub) {
      loadInitialData();
    }
  }, [user, currentClub, isOnline, loadCachedData, refresh]);

  // Auto-refresh quand l'app revient au premier plan
  useEffect(() => {
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      if (nextAppState === 'active' && data && isOnline) {
        // Auto-refresh si les données ont plus de 2 minutes
        const now = Date.now();
        const lastUpdateTime = lastUpdated?.getTime() || 0;
        if (now - lastUpdateTime > 2 * 60 * 1000) {
          refresh();
        }
      }
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);
    return () => subscription?.remove();
  }, [data, isOnline, lastUpdated, refresh]);

  // Memoized return value pour éviter les re-renders inutiles
  const returnValue = useMemo(() => ({
    data,
    loading,
    refreshing,
    error,
    refresh,
    lastUpdated,
  }), [data, loading, refreshing, error, refresh, lastUpdated]);

  return returnValue;
};

export default useDashboard;
