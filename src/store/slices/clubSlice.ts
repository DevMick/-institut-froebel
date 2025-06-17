/**
 * Club Slice - Rotary Club Mobile
 * Gestion des clubs, membres et officers avec cache intelligent
 */

import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { apiService } from '../../services';
import type { RotaryClub, Member, ClubPosition } from '../../types';

// ===== TYPES D'ÉTAT =====
export interface ClubState {
  club: RotaryClub | null;
  members: Member[];
  officers: Record<ClubPosition, Member | null>;
  isLoading: boolean;
  error: string | null;
  lastSync: string | null;
  syncInProgress: boolean;
}

// État initial
const initialState: ClubState = {
  club: null,
  members: [],
  officers: {
    President: null,
    Secretary: null,
    Treasurer: null,
    Director: null,
    Member: null,
    'Past President': null,
  },
  isLoading: false,
  error: null,
  lastSync: null,
  syncInProgress: false,
};

// ===== THUNKS ASYNC =====

/**
 * Récupérer les données du club
 */
export const fetchClubAsync = createAsyncThunk(
  'club/fetchClub',
  async (clubId: string, { rejectWithValue }) => {
    try {
      const response = await apiService.get<{
        club: RotaryClub;
        members: Member[];
        officers: Record<ClubPosition, Member>;
      }>(`/clubs/${clubId}`);

      if (!response.success || !response.data) {
        return rejectWithValue(response.error || 'Erreur de récupération du club');
      }

      return response.data;
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : 'Erreur de récupération du club'
      );
    }
  }
);

/**
 * Mettre à jour un membre
 */
export const updateMemberAsync = createAsyncThunk(
  'club/updateMember',
  async (
    { memberId, updates }: { memberId: string; updates: Partial<Member> },
    { rejectWithValue }
  ) => {
    try {
      const response = await apiService.put<Member>(`/members/${memberId}`, updates);

      if (!response.success || !response.data) {
        return rejectWithValue(response.error || 'Erreur de mise à jour du membre');
      }

      return response.data;
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : 'Erreur de mise à jour du membre'
      );
    }
  }
);

/**
 * Synchroniser les données du club
 */
export const syncClubDataAsync = createAsyncThunk(
  'club/syncClubData',
  async (_, { getState, rejectWithValue }) => {
    try {
      const state = getState() as { club: ClubState };
      const { club, lastSync } = state.club;

      if (!club) {
        return rejectWithValue('Aucun club sélectionné');
      }

      // Sync incrémentale si lastSync existe
      const params = lastSync ? { since: lastSync } : {};
      
      const response = await apiService.get<{
        club: RotaryClub;
        members: Member[];
        officers: Record<ClubPosition, Member>;
        deletedMembers?: string[];
      }>(`/clubs/${club.id}/sync`, params);

      if (!response.success || !response.data) {
        return rejectWithValue(response.error || 'Erreur de synchronisation');
      }

      return response.data;
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : 'Erreur de synchronisation'
      );
    }
  }
);

// ===== SLICE =====
const clubSlice = createSlice({
  name: 'club',
  initialState,
  reducers: {
    // Actions synchrones
    setClub: (state, action: PayloadAction<RotaryClub>) => {
      state.club = action.payload;
    },
    
    updateMember: (state, action: PayloadAction<Member>) => {
      const index = state.members.findIndex(m => m.id === action.payload.id);
      if (index !== -1) {
        state.members[index] = action.payload;
      }
    },
    
    addMember: (state, action: PayloadAction<Member>) => {
      const exists = state.members.some(m => m.id === action.payload.id);
      if (!exists) {
        state.members.push(action.payload);
      }
    },
    
    removeMember: (state, action: PayloadAction<string>) => {
      state.members = state.members.filter(m => m.id !== action.payload);
      
      // Retirer des officers si nécessaire
      Object.keys(state.officers).forEach(position => {
        const pos = position as ClubPosition;
        if (state.officers[pos]?.id === action.payload) {
          state.officers[pos] = null;
        }
      });
    },
    
    setOfficers: (state, action: PayloadAction<Record<ClubPosition, Member | null>>) => {
      state.officers = action.payload;
    },
    
    clearError: (state) => {
      state.error = null;
    },
    
    // Reset complet
    resetClub: (state) => {
      Object.assign(state, initialState);
    },
  },
  extraReducers: (builder) => {
    // Fetch club
    builder
      .addCase(fetchClubAsync.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchClubAsync.fulfilled, (state, action) => {
        state.isLoading = false;
        state.club = action.payload.club;
        state.members = action.payload.members;
        state.officers = action.payload.officers;
        state.lastSync = new Date().toISOString();
        state.error = null;
      })
      .addCase(fetchClubAsync.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Update member
    builder
      .addCase(updateMemberAsync.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateMemberAsync.fulfilled, (state, action) => {
        state.isLoading = false;
        const index = state.members.findIndex(m => m.id === action.payload.id);
        if (index !== -1) {
          state.members[index] = action.payload;
        }
        state.error = null;
      })
      .addCase(updateMemberAsync.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Sync club data
    builder
      .addCase(syncClubDataAsync.pending, (state) => {
        state.syncInProgress = true;
        state.error = null;
      })
      .addCase(syncClubDataAsync.fulfilled, (state, action) => {
        state.syncInProgress = false;
        
        // Mise à jour incrémentale
        if (action.payload.club) {
          state.club = action.payload.club;
        }
        
        if (action.payload.members) {
          // Merge des membres (remplacer existants, ajouter nouveaux)
          action.payload.members.forEach(newMember => {
            const index = state.members.findIndex(m => m.id === newMember.id);
            if (index !== -1) {
              state.members[index] = newMember;
            } else {
              state.members.push(newMember);
            }
          });
        }
        
        if (action.payload.officers) {
          state.officers = action.payload.officers;
        }
        
        // Supprimer les membres supprimés
        if (action.payload.deletedMembers) {
          action.payload.deletedMembers.forEach(deletedId => {
            state.members = state.members.filter(m => m.id !== deletedId);
          });
        }
        
        state.lastSync = new Date().toISOString();
        state.error = null;
      })
      .addCase(syncClubDataAsync.rejected, (state, action) => {
        state.syncInProgress = false;
        state.error = action.payload as string;
      });
  },
});

// Export des actions
export const {
  setClub,
  updateMember,
  addMember,
  removeMember,
  setOfficers,
  clearError,
  resetClub,
} = clubSlice.actions;

// Export du reducer
export default clubSlice.reducer;
