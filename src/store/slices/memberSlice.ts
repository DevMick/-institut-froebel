/**
 * Member Slice - Rotary Club Mobile
 * Gestion du profil membre, préférences et permissions
 */

import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { apiService } from '../../services';
import type { Member, UserPreferences, ClubPosition } from '../../types';

// ===== TYPES D'ÉTAT =====
export interface MemberState {
  profile: Member | null;
  preferences: UserPreferences;
  roles: ClubPosition[];
  permissions: string[];
  privacySettings: PrivacySettings;
  isLoading: boolean;
  error: string | null;
}

export interface PrivacySettings {
  showEmail: boolean;
  showPhone: boolean;
  showAddress: boolean;
  allowDirectMessages: boolean;
  showAttendanceStats: boolean;
  showInDirectory: boolean;
}

// État initial
const initialState: MemberState = {
  profile: null,
  preferences: {
    language: 'fr',
    notifications: true,
    emailUpdates: true,
    theme: 'auto',
    currency: 'EUR',
    timezone: 'Europe/Paris',
  },
  roles: [],
  permissions: [],
  privacySettings: {
    showEmail: true,
    showPhone: false,
    showAddress: false,
    allowDirectMessages: true,
    showAttendanceStats: true,
    showInDirectory: true,
  },
  isLoading: false,
  error: null,
};

// ===== THUNKS ASYNC =====

/**
 * Récupérer le profil membre
 */
export const fetchProfileAsync = createAsyncThunk(
  'member/fetchProfile',
  async (memberId: string, { rejectWithValue }) => {
    try {
      const response = await apiService.get<{
        profile: Member;
        preferences: UserPreferences;
        roles: ClubPosition[];
        permissions: string[];
        privacySettings: PrivacySettings;
      }>(`/members/${memberId}/profile`);

      if (!response.success || !response.data) {
        return rejectWithValue(response.error || 'Erreur de récupération du profil');
      }

      return response.data;
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : 'Erreur de récupération du profil'
      );
    }
  }
);

/**
 * Mettre à jour le profil
 */
export const updateProfileAsync = createAsyncThunk(
  'member/updateProfile',
  async (
    { memberId, updates }: { memberId: string; updates: Partial<Member> },
    { rejectWithValue }
  ) => {
    try {
      const response = await apiService.put<Member>(`/members/${memberId}`, updates);

      if (!response.success || !response.data) {
        return rejectWithValue(response.error || 'Erreur de mise à jour du profil');
      }

      return response.data;
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : 'Erreur de mise à jour du profil'
      );
    }
  }
);

/**
 * Changer le mot de passe
 */
export const changePasswordAsync = createAsyncThunk(
  'member/changePassword',
  async (
    {
      memberId,
      currentPassword,
      newPassword,
    }: {
      memberId: string;
      currentPassword: string;
      newPassword: string;
    },
    { rejectWithValue }
  ) => {
    try {
      const response = await apiService.post(`/members/${memberId}/change-password`, {
        currentPassword,
        newPassword,
      });

      if (!response.success) {
        return rejectWithValue(response.error || 'Erreur de changement de mot de passe');
      }

      return true;
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : 'Erreur de changement de mot de passe'
      );
    }
  }
);

/**
 * Mettre à jour les préférences
 */
export const updatePreferencesAsync = createAsyncThunk(
  'member/updatePreferences',
  async (
    { memberId, preferences }: { memberId: string; preferences: Partial<UserPreferences> },
    { rejectWithValue }
  ) => {
    try {
      const response = await apiService.put<UserPreferences>(
        `/members/${memberId}/preferences`,
        preferences
      );

      if (!response.success || !response.data) {
        return rejectWithValue(response.error || 'Erreur de mise à jour des préférences');
      }

      return response.data;
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : 'Erreur de mise à jour des préférences'
      );
    }
  }
);

/**
 * Mettre à jour les paramètres de confidentialité
 */
export const updatePrivacySettingsAsync = createAsyncThunk(
  'member/updatePrivacySettings',
  async (
    { memberId, settings }: { memberId: string; settings: Partial<PrivacySettings> },
    { rejectWithValue }
  ) => {
    try {
      const response = await apiService.put<PrivacySettings>(
        `/members/${memberId}/privacy`,
        settings
      );

      if (!response.success || !response.data) {
        return rejectWithValue(response.error || 'Erreur de mise à jour de la confidentialité');
      }

      return response.data;
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : 'Erreur de mise à jour de la confidentialité'
      );
    }
  }
);

// ===== SLICE =====
const memberSlice = createSlice({
  name: 'member',
  initialState,
  reducers: {
    // Actions synchrones
    updateProfile: (state, action: PayloadAction<Partial<Member>>) => {
      if (state.profile) {
        state.profile = { ...state.profile, ...action.payload };
      }
    },
    
    setPreferences: (state, action: PayloadAction<UserPreferences>) => {
      state.preferences = action.payload;
    },
    
    updateRoles: (state, action: PayloadAction<ClubPosition[]>) => {
      state.roles = action.payload;
    },
    
    setPermissions: (state, action: PayloadAction<string[]>) => {
      state.permissions = action.payload;
    },
    
    updatePrivacySettings: (state, action: PayloadAction<Partial<PrivacySettings>>) => {
      state.privacySettings = { ...state.privacySettings, ...action.payload };
    },
    
    clearError: (state) => {
      state.error = null;
    },
    
    // Reset complet
    resetMember: (state) => {
      Object.assign(state, initialState);
    },
  },
  extraReducers: (builder) => {
    // Fetch profile
    builder
      .addCase(fetchProfileAsync.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchProfileAsync.fulfilled, (state, action) => {
        state.isLoading = false;
        state.profile = action.payload.profile;
        state.preferences = action.payload.preferences;
        state.roles = action.payload.roles;
        state.permissions = action.payload.permissions;
        state.privacySettings = action.payload.privacySettings;
        state.error = null;
      })
      .addCase(fetchProfileAsync.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Update profile
    builder
      .addCase(updateProfileAsync.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateProfileAsync.fulfilled, (state, action) => {
        state.isLoading = false;
        state.profile = action.payload;
        state.error = null;
      })
      .addCase(updateProfileAsync.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Change password
    builder
      .addCase(changePasswordAsync.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(changePasswordAsync.fulfilled, (state) => {
        state.isLoading = false;
        state.error = null;
      })
      .addCase(changePasswordAsync.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Update preferences
    builder
      .addCase(updatePreferencesAsync.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updatePreferencesAsync.fulfilled, (state, action) => {
        state.isLoading = false;
        state.preferences = action.payload;
        state.error = null;
      })
      .addCase(updatePreferencesAsync.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Update privacy settings
    builder
      .addCase(updatePrivacySettingsAsync.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updatePrivacySettingsAsync.fulfilled, (state, action) => {
        state.isLoading = false;
        state.privacySettings = action.payload;
        state.error = null;
      })
      .addCase(updatePrivacySettingsAsync.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

// Export des actions
export const {
  updateProfile,
  setPreferences,
  updateRoles,
  setPermissions,
  updatePrivacySettings,
  clearError,
  resetMember,
} = memberSlice.actions;

// Export du reducer
export default memberSlice.reducer;
