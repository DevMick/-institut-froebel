/**
 * Auth Slice - Rotary Club Mobile
 * Gestion de l'authentification avec biométrie et tokens
 */

import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { apiService } from '../../services';
import type { User, LoginForm } from '../../types';

// ===== TYPES D'ÉTAT =====
export interface AuthState {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  biometricEnabled: boolean;
  lastLoginDate: string | null;
}

// État initial
const initialState: AuthState = {
  user: null,
  token: null,
  refreshToken: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
  biometricEnabled: false,
  lastLoginDate: null,
};

// ===== THUNKS ASYNC =====

/**
 * Login utilisateur
 */
export const loginAsync = createAsyncThunk(
  'auth/login',
  async (credentials: LoginForm, { rejectWithValue }) => {
    try {
      const response = await apiService.post<{
        user: User;
        token: string;
        refreshToken: string;
      }>('/auth/login', credentials);

      if (!response.success || !response.data) {
        return rejectWithValue(response.error || 'Erreur de connexion');
      }

      return response.data;
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : 'Erreur de connexion'
      );
    }
  }
);

/**
 * Logout utilisateur
 */
export const logoutAsync = createAsyncThunk(
  'auth/logout',
  async (_, { getState, rejectWithValue }) => {
    try {
      const state = getState() as { auth: AuthState };
      const { token } = state.auth;

      if (token) {
        await apiService.post('/auth/logout', { token });
      }

      return true;
    } catch (error) {
      // Même en cas d'erreur, on déconnecte localement
      return rejectWithValue(
        error instanceof Error ? error.message : 'Erreur de déconnexion'
      );
    }
  }
);

/**
 * Refresh token
 */
export const refreshTokenAsync = createAsyncThunk(
  'auth/refreshToken',
  async (_, { getState, rejectWithValue }) => {
    try {
      const state = getState() as { auth: AuthState };
      const { refreshToken } = state.auth;

      if (!refreshToken) {
        return rejectWithValue('Aucun refresh token disponible');
      }

      const response = await apiService.post<{
        token: string;
        refreshToken: string;
      }>('/auth/refresh', { refreshToken });

      if (!response.success || !response.data) {
        return rejectWithValue(response.error || 'Erreur de rafraîchissement');
      }

      return response.data;
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : 'Erreur de rafraîchissement'
      );
    }
  }
);

/**
 * Setup biométrie
 */
export const setupBiometricAsync = createAsyncThunk(
  'auth/setupBiometric',
  async (enable: boolean, { rejectWithValue }) => {
    try {
      // Ici on intégrerait react-native-biometrics
      // const biometrics = new ReactNativeBiometrics();
      // const { available } = await biometrics.isSensorAvailable();
      
      // Pour l'instant, simulation
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      return enable;
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : 'Erreur biométrie'
      );
    }
  }
);

// ===== SLICE =====
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    // Actions synchrones
    setUser: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
    },
    
    clearError: (state) => {
      state.error = null;
    },
    
    setToken: (state, action: PayloadAction<string>) => {
      state.token = action.payload;
    },
    
    enableBiometric: (state, action: PayloadAction<boolean>) => {
      state.biometricEnabled = action.payload;
    },
    
    // Reset complet (pour logout)
    resetAuth: (state) => {
      Object.assign(state, initialState);
    },
  },
  extraReducers: (builder) => {
    // Login
    builder
      .addCase(loginAsync.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginAsync.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.refreshToken = action.payload.refreshToken;
        state.isAuthenticated = true;
        state.lastLoginDate = new Date().toISOString();
        state.error = null;
      })
      .addCase(loginAsync.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
        state.isAuthenticated = false;
      });

    // Logout
    builder
      .addCase(logoutAsync.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(logoutAsync.fulfilled, (state) => {
        Object.assign(state, initialState);
      })
      .addCase(logoutAsync.rejected, (state) => {
        // Même en cas d'erreur, on déconnecte localement
        Object.assign(state, initialState);
      });

    // Refresh token
    builder
      .addCase(refreshTokenAsync.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(refreshTokenAsync.fulfilled, (state, action) => {
        state.isLoading = false;
        state.token = action.payload.token;
        state.refreshToken = action.payload.refreshToken;
        state.error = null;
      })
      .addCase(refreshTokenAsync.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
        // Token invalide, déconnexion
        Object.assign(state, initialState);
      });

    // Biométrie
    builder
      .addCase(setupBiometricAsync.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(setupBiometricAsync.fulfilled, (state, action) => {
        state.isLoading = false;
        state.biometricEnabled = action.payload;
        state.error = null;
      })
      .addCase(setupBiometricAsync.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

// Export des actions
export const {
  setUser,
  clearError,
  setToken,
  enableBiometric,
  resetAuth,
} = authSlice.actions;

// Export du reducer
export default authSlice.reducer;
