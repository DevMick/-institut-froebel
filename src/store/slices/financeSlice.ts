/**
 * Finance Slice - Rotary Club Mobile
 * Gestion des finances avec encryption pour données sensibles
 */

import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { apiService } from '../../services';
import type { Finance, FinanceCategory } from '../../types';

// ===== TYPES D'ÉTAT =====
export interface FinanceState {
  transactions: Finance[];
  dues: DuesInfo[];
  balance: BalanceInfo;
  reports: FinanceReport[];
  isLoading: boolean;
  error: string | null;
  encryptionEnabled: boolean;
}

export interface DuesInfo {
  id: string;
  memberId: string;
  amount: number;
  dueDate: Date;
  paidDate?: Date;
  status: 'pending' | 'paid' | 'overdue';
  type: 'monthly' | 'quarterly' | 'annual';
}

export interface BalanceInfo {
  current: number;
  currency: string;
  lastUpdated: string;
  breakdown: {
    dues: number;
    donations: number;
    expenses: number;
    projects: number;
  };
}

export interface FinanceReport {
  id: string;
  type: 'monthly' | 'quarterly' | 'annual' | 'custom';
  period: {
    start: string;
    end: string;
  };
  summary: {
    income: number;
    expenses: number;
    balance: number;
  };
  categories: Record<FinanceCategory, number>;
  generatedAt: string;
}

// État initial
const initialState: FinanceState = {
  transactions: [],
  dues: [],
  balance: {
    current: 0,
    currency: 'EUR',
    lastUpdated: new Date().toISOString(),
    breakdown: {
      dues: 0,
      donations: 0,
      expenses: 0,
      projects: 0,
    },
  },
  reports: [],
  isLoading: false,
  error: null,
  encryptionEnabled: true,
};

// ===== THUNKS ASYNC =====

/**
 * Récupérer les finances
 */
export const fetchFinancesAsync = createAsyncThunk(
  'finance/fetchFinances',
  async (
    { clubId, startDate, endDate }: { clubId: string; startDate?: string; endDate?: string },
    { rejectWithValue }
  ) => {
    try {
      const params = new URLSearchParams({ clubId });
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);

      const response = await apiService.get<{
        transactions: Finance[];
        dues: DuesInfo[];
        balance: BalanceInfo;
      }>(`/finances?${params}`);

      if (!response.success || !response.data) {
        return rejectWithValue(response.error || 'Erreur de récupération des finances');
      }

      return response.data;
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : 'Erreur de récupération des finances'
      );
    }
  }
);

/**
 * Payer les cotisations
 */
export const payDuesAsync = createAsyncThunk(
  'finance/payDues',
  async (
    {
      duesId,
      paymentMethod,
      amount,
    }: {
      duesId: string;
      paymentMethod: string;
      amount: number;
    },
    { rejectWithValue }
  ) => {
    try {
      const response = await apiService.post<{
        transaction: Finance;
        dues: DuesInfo;
      }>(`/finances/dues/${duesId}/pay`, {
        paymentMethod,
        amount,
        timestamp: new Date().toISOString(),
      });

      if (!response.success || !response.data) {
        return rejectWithValue(response.error || 'Erreur de paiement');
      }

      return response.data;
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : 'Erreur de paiement'
      );
    }
  }
);

/**
 * Générer un rapport financier
 */
export const generateReportAsync = createAsyncThunk(
  'finance/generateReport',
  async (
    {
      clubId,
      type,
      startDate,
      endDate,
    }: {
      clubId: string;
      type: 'monthly' | 'quarterly' | 'annual' | 'custom';
      startDate: string;
      endDate: string;
    },
    { rejectWithValue }
  ) => {
    try {
      const response = await apiService.post<FinanceReport>('/finances/reports', {
        clubId,
        type,
        startDate,
        endDate,
      });

      if (!response.success || !response.data) {
        return rejectWithValue(response.error || 'Erreur de génération de rapport');
      }

      return response.data;
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : 'Erreur de génération de rapport'
      );
    }
  }
);

/**
 * Ajouter une transaction
 */
export const addTransactionAsync = createAsyncThunk(
  'finance/addTransaction',
  async (
    transaction: Omit<Finance, 'id' | 'status'>,
    { rejectWithValue }
  ) => {
    try {
      const response = await apiService.post<Finance>('/finances/transactions', {
        ...transaction,
        timestamp: new Date().toISOString(),
      });

      if (!response.success || !response.data) {
        return rejectWithValue(response.error || 'Erreur d\'ajout de transaction');
      }

      return response.data;
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : 'Erreur d\'ajout de transaction'
      );
    }
  }
);

// ===== SLICE =====
const financeSlice = createSlice({
  name: 'finance',
  initialState,
  reducers: {
    // Actions synchrones
    addTransaction: (state, action: PayloadAction<Finance>) => {
      state.transactions.unshift(action.payload);
      // Trier par date
      state.transactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    },
    
    updateTransaction: (state, action: PayloadAction<Finance>) => {
      const index = state.transactions.findIndex(t => t.id === action.payload.id);
      if (index !== -1) {
        state.transactions[index] = action.payload;
      }
    },
    
    updateDues: (state, action: PayloadAction<DuesInfo>) => {
      const index = state.dues.findIndex(d => d.id === action.payload.id);
      if (index !== -1) {
        state.dues[index] = action.payload;
      }
    },
    
    setBalance: (state, action: PayloadAction<BalanceInfo>) => {
      state.balance = action.payload;
    },
    
    generateReport: (state, action: PayloadAction<FinanceReport>) => {
      const exists = state.reports.some(r => r.id === action.payload.id);
      if (!exists) {
        state.reports.unshift(action.payload);
      }
    },
    
    setEncryption: (state, action: PayloadAction<boolean>) => {
      state.encryptionEnabled = action.payload;
    },
    
    clearError: (state) => {
      state.error = null;
    },
    
    // Reset complet
    resetFinance: (state) => {
      Object.assign(state, initialState);
    },
  },
  extraReducers: (builder) => {
    // Fetch finances
    builder
      .addCase(fetchFinancesAsync.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchFinancesAsync.fulfilled, (state, action) => {
        state.isLoading = false;
        state.transactions = action.payload.transactions.sort(
          (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
        );
        state.dues = action.payload.dues;
        state.balance = action.payload.balance;
        state.error = null;
      })
      .addCase(fetchFinancesAsync.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Pay dues
    builder
      .addCase(payDuesAsync.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(payDuesAsync.fulfilled, (state, action) => {
        state.isLoading = false;
        
        // Ajouter la transaction
        state.transactions.unshift(action.payload.transaction);
        
        // Mettre à jour les dues
        const duesIndex = state.dues.findIndex(d => d.id === action.payload.dues.id);
        if (duesIndex !== -1) {
          state.dues[duesIndex] = action.payload.dues;
        }
        
        state.error = null;
      })
      .addCase(payDuesAsync.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Generate report
    builder
      .addCase(generateReportAsync.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(generateReportAsync.fulfilled, (state, action) => {
        state.isLoading = false;
        
        // Ajouter le rapport (éviter les doublons)
        const exists = state.reports.some(r => r.id === action.payload.id);
        if (!exists) {
          state.reports.unshift(action.payload);
        }
        
        state.error = null;
      })
      .addCase(generateReportAsync.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Add transaction
    builder
      .addCase(addTransactionAsync.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(addTransactionAsync.fulfilled, (state, action) => {
        state.isLoading = false;
        state.transactions.unshift(action.payload);
        state.transactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        state.error = null;
      })
      .addCase(addTransactionAsync.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

// Export des actions
export const {
  addTransaction,
  updateTransaction,
  updateDues,
  setBalance,
  generateReport,
  setEncryption,
  clearError,
  resetFinance,
} = financeSlice.actions;

// Export du reducer
export default financeSlice.reducer;
