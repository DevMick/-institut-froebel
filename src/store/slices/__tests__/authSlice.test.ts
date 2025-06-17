/**
 * Auth Slice Tests - Rotary Club Mobile
 * Tests unitaires pour authSlice avec actions, reducers et thunks
 */

import { configureStore } from '@reduxjs/toolkit';
import authReducer, {
  loginStart,
  loginSuccess,
  loginFailure,
  logout,
  setUser,
  clearError,
  loginAsync,
  logoutAsync,
  refreshTokenAsync,
} from '../authSlice';
import { authService } from '../../services/authService';

// Mock authService
jest.mock('../../services/authService');
const mockAuthService = authService as jest.Mocked<typeof authService>;

describe('authSlice', () => {
  const initialState = {
    user: null,
    token: null,
    refreshToken: null,
    isAuthenticated: false,
    loading: false,
    error: null,
  };

  const mockUser = {
    id: 'user-1',
    email: 'test@example.com',
    name: 'Test User',
    role: 'member' as const,
    clubId: 'club-1',
  };

  const mockTokens = {
    accessToken: 'access-token',
    refreshToken: 'refresh-token',
    expiresIn: 3600,
  };

  describe('reducers', () => {
    it('should return initial state', () => {
      expect(authReducer(undefined, { type: 'unknown' })).toEqual(initialState);
    });

    it('should handle loginStart', () => {
      const action = loginStart();
      const state = authReducer(initialState, action);
      
      expect(state.loading).toBe(true);
      expect(state.error).toBe(null);
    });

    it('should handle loginSuccess', () => {
      const action = loginSuccess({
        user: mockUser,
        token: mockTokens.accessToken,
        refreshToken: mockTokens.refreshToken,
      });
      
      const state = authReducer(initialState, action);
      
      expect(state.loading).toBe(false);
      expect(state.isAuthenticated).toBe(true);
      expect(state.user).toEqual(mockUser);
      expect(state.token).toBe(mockTokens.accessToken);
      expect(state.refreshToken).toBe(mockTokens.refreshToken);
      expect(state.error).toBe(null);
    });

    it('should handle loginFailure', () => {
      const errorMessage = 'Invalid credentials';
      const action = loginFailure(errorMessage);
      
      const state = authReducer(initialState, action);
      
      expect(state.loading).toBe(false);
      expect(state.isAuthenticated).toBe(false);
      expect(state.user).toBe(null);
      expect(state.token).toBe(null);
      expect(state.error).toBe(errorMessage);
    });

    it('should handle logout', () => {
      const authenticatedState = {
        ...initialState,
        user: mockUser,
        token: mockTokens.accessToken,
        refreshToken: mockTokens.refreshToken,
        isAuthenticated: true,
      };
      
      const action = logout();
      const state = authReducer(authenticatedState, action);
      
      expect(state).toEqual(initialState);
    });

    it('should handle setUser', () => {
      const updatedUser = { ...mockUser, name: 'Updated Name' };
      const action = setUser(updatedUser);
      
      const authenticatedState = {
        ...initialState,
        user: mockUser,
        isAuthenticated: true,
      };
      
      const state = authReducer(authenticatedState, action);
      
      expect(state.user).toEqual(updatedUser);
    });

    it('should handle clearError', () => {
      const errorState = {
        ...initialState,
        error: 'Some error',
      };
      
      const action = clearError();
      const state = authReducer(errorState, action);
      
      expect(state.error).toBe(null);
    });
  });

  describe('async thunks', () => {
    let store: ReturnType<typeof configureStore>;

    beforeEach(() => {
      store = configureStore({
        reducer: {
          auth: authReducer,
        },
      });
      jest.clearAllMocks();
    });

    describe('loginAsync', () => {
      it('should handle successful login', async () => {
        mockAuthService.login.mockResolvedValueOnce({
          success: true,
          user: mockUser,
          tokens: mockTokens,
        });

        const credentials = {
          email: 'test@example.com',
          password: 'password123',
        };

        await store.dispatch(loginAsync(credentials));
        
        const state = store.getState().auth;
        
        expect(state.loading).toBe(false);
        expect(state.isAuthenticated).toBe(true);
        expect(state.user).toEqual(mockUser);
        expect(state.token).toBe(mockTokens.accessToken);
        expect(state.error).toBe(null);
        
        expect(mockAuthService.login).toHaveBeenCalledWith(credentials);
      });

      it('should handle login failure', async () => {
        const errorMessage = 'Invalid credentials';
        mockAuthService.login.mockResolvedValueOnce({
          success: false,
          error: errorMessage,
        });

        const credentials = {
          email: 'test@example.com',
          password: 'wrongpassword',
        };

        await store.dispatch(loginAsync(credentials));
        
        const state = store.getState().auth;
        
        expect(state.loading).toBe(false);
        expect(state.isAuthenticated).toBe(false);
        expect(state.user).toBe(null);
        expect(state.error).toBe(errorMessage);
      });

      it('should handle login network error', async () => {
        mockAuthService.login.mockRejectedValueOnce(new Error('Network error'));

        const credentials = {
          email: 'test@example.com',
          password: 'password123',
        };

        await store.dispatch(loginAsync(credentials));
        
        const state = store.getState().auth;
        
        expect(state.loading).toBe(false);
        expect(state.isAuthenticated).toBe(false);
        expect(state.error).toBe('Network error');
      });
    });

    describe('logoutAsync', () => {
      it('should handle successful logout', async () => {
        // Set initial authenticated state
        store.dispatch(loginSuccess({
          user: mockUser,
          token: mockTokens.accessToken,
          refreshToken: mockTokens.refreshToken,
        }));

        mockAuthService.logout.mockResolvedValueOnce({ success: true });

        await store.dispatch(logoutAsync());
        
        const state = store.getState().auth;
        
        expect(state.isAuthenticated).toBe(false);
        expect(state.user).toBe(null);
        expect(state.token).toBe(null);
        expect(state.refreshToken).toBe(null);
        
        expect(mockAuthService.logout).toHaveBeenCalled();
      });

      it('should handle logout failure gracefully', async () => {
        // Set initial authenticated state
        store.dispatch(loginSuccess({
          user: mockUser,
          token: mockTokens.accessToken,
          refreshToken: mockTokens.refreshToken,
        }));

        mockAuthService.logout.mockRejectedValueOnce(new Error('Logout failed'));

        await store.dispatch(logoutAsync());
        
        const state = store.getState().auth;
        
        // Should still clear local state even if server logout fails
        expect(state.isAuthenticated).toBe(false);
        expect(state.user).toBe(null);
        expect(state.token).toBe(null);
      });
    });

    describe('refreshTokenAsync', () => {
      it('should handle successful token refresh', async () => {
        const newTokens = {
          accessToken: 'new-access-token',
          refreshToken: 'new-refresh-token',
          expiresIn: 3600,
        };

        mockAuthService.refreshToken.mockResolvedValueOnce({
          success: true,
          tokens: newTokens,
        });

        // Set initial state with refresh token
        store.dispatch(loginSuccess({
          user: mockUser,
          token: 'old-token',
          refreshToken: 'old-refresh-token',
        }));

        await store.dispatch(refreshTokenAsync());
        
        const state = store.getState().auth;
        
        expect(state.token).toBe(newTokens.accessToken);
        expect(state.refreshToken).toBe(newTokens.refreshToken);
        expect(state.isAuthenticated).toBe(true);
        
        expect(mockAuthService.refreshToken).toHaveBeenCalledWith('old-refresh-token');
      });

      it('should handle token refresh failure', async () => {
        mockAuthService.refreshToken.mockResolvedValueOnce({
          success: false,
          error: 'Invalid refresh token',
        });

        // Set initial state with refresh token
        store.dispatch(loginSuccess({
          user: mockUser,
          token: 'old-token',
          refreshToken: 'old-refresh-token',
        }));

        await store.dispatch(refreshTokenAsync());
        
        const state = store.getState().auth;
        
        // Should logout user on refresh failure
        expect(state.isAuthenticated).toBe(false);
        expect(state.user).toBe(null);
        expect(state.token).toBe(null);
        expect(state.error).toBe('Invalid refresh token');
      });

      it('should handle missing refresh token', async () => {
        // Set state without refresh token
        const stateWithoutRefreshToken = {
          ...initialState,
          user: mockUser,
          token: 'access-token',
          isAuthenticated: true,
        };

        await store.dispatch(refreshTokenAsync());
        
        const state = store.getState().auth;
        
        // Should logout user if no refresh token
        expect(state.isAuthenticated).toBe(false);
        expect(state.error).toBe('No refresh token available');
        
        expect(mockAuthService.refreshToken).not.toHaveBeenCalled();
      });
    });
  });

  describe('edge cases', () => {
    it('should handle multiple rapid login attempts', async () => {
      const store = configureStore({
        reducer: { auth: authReducer },
      });

      mockAuthService.login.mockImplementation(() => 
        new Promise(resolve => setTimeout(() => resolve({
          success: true,
          user: mockUser,
          tokens: mockTokens,
        }), 100))
      );

      const credentials = {
        email: 'test@example.com',
        password: 'password123',
      };

      // Dispatch multiple login attempts
      const promises = [
        store.dispatch(loginAsync(credentials)),
        store.dispatch(loginAsync(credentials)),
        store.dispatch(loginAsync(credentials)),
      ];

      await Promise.all(promises);
      
      const state = store.getState().auth;
      
      // Should handle gracefully
      expect(state.isAuthenticated).toBe(true);
      expect(state.user).toEqual(mockUser);
    });

    it('should preserve user data during token refresh', async () => {
      const store = configureStore({
        reducer: { auth: authReducer },
      });

      // Set initial authenticated state
      store.dispatch(loginSuccess({
        user: mockUser,
        token: 'old-token',
        refreshToken: 'refresh-token',
      }));

      const newTokens = {
        accessToken: 'new-access-token',
        refreshToken: 'new-refresh-token',
        expiresIn: 3600,
      };

      mockAuthService.refreshToken.mockResolvedValueOnce({
        success: true,
        tokens: newTokens,
      });

      await store.dispatch(refreshTokenAsync());
      
      const state = store.getState().auth;
      
      // User data should be preserved
      expect(state.user).toEqual(mockUser);
      expect(state.token).toBe(newTokens.accessToken);
      expect(state.refreshToken).toBe(newTokens.refreshToken);
    });
  });
});
