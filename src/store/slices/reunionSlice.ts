/**
 * Reunion Slice - Rotary Club Mobile
 * Gestion des réunions, attendance et QR codes avec real-time
 */

import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { apiService } from '../../services';
import type { Reunion, Attendance, AttendanceStatus } from '../../types';

// ===== TYPES D'ÉTAT =====
export interface ReunionState {
  reunions: Reunion[];
  currentReunion: Reunion | null;
  attendance: Attendance[];
  qrCode: string | null;
  qrCodeExpiry: string | null;
  isLoading: boolean;
  error: string | null;
  realTimeConnected: boolean;
}

// État initial
const initialState: ReunionState = {
  reunions: [],
  currentReunion: null,
  attendance: [],
  qrCode: null,
  qrCodeExpiry: null,
  isLoading: false,
  error: null,
  realTimeConnected: false,
};

// ===== THUNKS ASYNC =====

/**
 * Récupérer les réunions
 */
export const fetchReunionsAsync = createAsyncThunk(
  'reunion/fetchReunions',
  async (
    { clubId, startDate, endDate }: { clubId: string; startDate?: string; endDate?: string },
    { rejectWithValue }
  ) => {
    try {
      const params = new URLSearchParams({ clubId });
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);

      const response = await apiService.get<Reunion[]>(`/reunions?${params}`);

      if (!response.success || !response.data) {
        return rejectWithValue(response.error || 'Erreur de récupération des réunions');
      }

      return response.data;
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : 'Erreur de récupération des réunions'
      );
    }
  }
);

/**
 * Marquer la présence
 */
export const markAttendanceAsync = createAsyncThunk(
  'reunion/markAttendance',
  async (
    {
      reunionId,
      memberId,
      status,
      qrCode,
    }: {
      reunionId: string;
      memberId: string;
      status: AttendanceStatus;
      qrCode?: string;
    },
    { rejectWithValue }
  ) => {
    try {
      const response = await apiService.post<Attendance>('/attendance', {
        reunionId,
        memberId,
        status,
        qrCode,
        timestamp: new Date().toISOString(),
      });

      if (!response.success || !response.data) {
        return rejectWithValue(response.error || 'Erreur de marquage de présence');
      }

      return response.data;
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : 'Erreur de marquage de présence'
      );
    }
  }
);

/**
 * Générer un QR code pour la réunion
 */
export const generateQRAsync = createAsyncThunk(
  'reunion/generateQR',
  async (reunionId: string, { rejectWithValue }) => {
    try {
      const response = await apiService.post<{
        qrCode: string;
        expiresAt: string;
      }>(`/reunions/${reunionId}/qr`);

      if (!response.success || !response.data) {
        return rejectWithValue(response.error || 'Erreur de génération QR');
      }

      return response.data;
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : 'Erreur de génération QR'
      );
    }
  }
);

/**
 * Récupérer les présences d'une réunion
 */
export const fetchAttendanceAsync = createAsyncThunk(
  'reunion/fetchAttendance',
  async (reunionId: string, { rejectWithValue }) => {
    try {
      const response = await apiService.get<Attendance[]>(`/reunions/${reunionId}/attendance`);

      if (!response.success || !response.data) {
        return rejectWithValue(response.error || 'Erreur de récupération des présences');
      }

      return response.data;
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : 'Erreur de récupération des présences'
      );
    }
  }
);

// ===== SLICE =====
const reunionSlice = createSlice({
  name: 'reunion',
  initialState,
  reducers: {
    // Actions synchrones
    setReunions: (state, action: PayloadAction<Reunion[]>) => {
      state.reunions = action.payload;
    },
    
    setCurrentReunion: (state, action: PayloadAction<Reunion | null>) => {
      state.currentReunion = action.payload;
    },
    
    updateAttendance: (state, action: PayloadAction<Attendance>) => {
      const index = state.attendance.findIndex(
        a => a.memberId === action.payload.memberId && a.reunionId === action.payload.reunionId
      );
      
      if (index !== -1) {
        state.attendance[index] = action.payload;
      } else {
        state.attendance.push(action.payload);
      }
    },
    
    addReunion: (state, action: PayloadAction<Reunion>) => {
      const exists = state.reunions.some(r => r.id === action.payload.id);
      if (!exists) {
        state.reunions.push(action.payload);
        // Trier par date
        state.reunions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      }
    },
    
    updateReunion: (state, action: PayloadAction<Reunion>) => {
      const index = state.reunions.findIndex(r => r.id === action.payload.id);
      if (index !== -1) {
        state.reunions[index] = action.payload;
      }
    },
    
    generateQR: (state, action: PayloadAction<{ qrCode: string; expiresAt: string }>) => {
      state.qrCode = action.payload.qrCode;
      state.qrCodeExpiry = action.payload.expiresAt;
    },
    
    clearQR: (state) => {
      state.qrCode = null;
      state.qrCodeExpiry = null;
    },
    
    setRealTimeConnection: (state, action: PayloadAction<boolean>) => {
      state.realTimeConnected = action.payload;
    },
    
    clearError: (state) => {
      state.error = null;
    },
    
    // Reset complet
    resetReunion: (state) => {
      Object.assign(state, initialState);
    },
  },
  extraReducers: (builder) => {
    // Fetch reunions
    builder
      .addCase(fetchReunionsAsync.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchReunionsAsync.fulfilled, (state, action) => {
        state.isLoading = false;
        state.reunions = action.payload.sort(
          (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
        );
        state.error = null;
      })
      .addCase(fetchReunionsAsync.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Mark attendance
    builder
      .addCase(markAttendanceAsync.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(markAttendanceAsync.fulfilled, (state, action) => {
        state.isLoading = false;
        
        // Mettre à jour ou ajouter l'attendance
        const index = state.attendance.findIndex(
          a => a.memberId === action.payload.memberId && a.reunionId === action.payload.reunionId
        );
        
        if (index !== -1) {
          state.attendance[index] = action.payload;
        } else {
          state.attendance.push(action.payload);
        }
        
        state.error = null;
      })
      .addCase(markAttendanceAsync.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Generate QR
    builder
      .addCase(generateQRAsync.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(generateQRAsync.fulfilled, (state, action) => {
        state.isLoading = false;
        state.qrCode = action.payload.qrCode;
        state.qrCodeExpiry = action.payload.expiresAt;
        state.error = null;
      })
      .addCase(generateQRAsync.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Fetch attendance
    builder
      .addCase(fetchAttendanceAsync.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchAttendanceAsync.fulfilled, (state, action) => {
        state.isLoading = false;
        state.attendance = action.payload;
        state.error = null;
      })
      .addCase(fetchAttendanceAsync.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

// Export des actions
export const {
  setReunions,
  setCurrentReunion,
  updateAttendance,
  addReunion,
  updateReunion,
  generateQR,
  clearQR,
  setRealTimeConnection,
  clearError,
  resetReunion,
} = reunionSlice.actions;

// Export du reducer
export default reunionSlice.reducer;
