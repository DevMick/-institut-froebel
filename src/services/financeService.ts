/**
 * Finance Service - Rotary Club Mobile
 * Service finance avec encryption et gestion transactions
 */

import CryptoJS from 'crypto-js';
import { apiService } from './apiService';
import type { Finance, FinanceCategory, ApiResponse } from '../types';

// Configuration encryption
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'rotary_club_mobile_secret_key_2024';

// Types pour les requêtes finance
interface TransactionCreateData {
  clubId: string;
  type: 'Income' | 'Expense' | 'Transfer' | 'Donation';
  amount: number;
  currency: string;
  description: string;
  category: FinanceCategory;
  date: string;
  memberId?: string;
  projectId?: string;
  receiptUrl?: string;
}

interface TransactionUpdateData {
  amount?: number;
  description?: string;
  category?: FinanceCategory;
  status?: 'Pending' | 'Approved' | 'Paid' | 'Cancelled';
  receiptUrl?: string;
}

interface DuesPaymentData {
  duesId: string;
  amount: number;
  paymentMethod: 'cash' | 'card' | 'transfer' | 'check';
  reference?: string;
  notes?: string;
}

interface FinanceReportData {
  clubId: string;
  type: 'monthly' | 'quarterly' | 'annual' | 'custom';
  startDate: string;
  endDate: string;
  categories?: FinanceCategory[];
  format?: 'json' | 'pdf' | 'excel';
}

interface BalanceInfo {
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

class FinanceService {
  /**
   * Récupérer les transactions
   */
  async fetchTransactions(
    clubId: string,
    filters?: {
      startDate?: string;
      endDate?: string;
      category?: FinanceCategory;
      type?: string;
      memberId?: string;
      limit?: number;
    }
  ): Promise<ApiResponse<Finance[]>> {
    try {
      const params: any = { clubId };
      
      if (filters?.startDate) params.startDate = filters.startDate;
      if (filters?.endDate) params.endDate = filters.endDate;
      if (filters?.category) params.category = filters.category;
      if (filters?.type) params.type = filters.type;
      if (filters?.memberId) params.memberId = filters.memberId;
      if (filters?.limit) params.limit = filters.limit;

      const response = await apiService.get<Finance[]>('/finances/transactions', params, {
        cache: true,
        cacheTtl: 300000, // 5 minutes
      });

      // Déchiffrer les données sensibles si nécessaire
      if (response.success && response.data) {
        response.data = response.data.map(transaction => this.decryptTransaction(transaction));
      }

      return response;
    } catch (error) {
      console.error('❌ Fetch transactions error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erreur de récupération des transactions',
        timestamp: new Date().toISOString(),
        requestId: 'transactions_fetch_error',
      };
    }
  }

  /**
   * Ajouter une transaction
   */
  async addTransaction(transactionData: TransactionCreateData): Promise<ApiResponse<Finance>> {
    try {
      // Chiffrer les données sensibles
      const encryptedData = this.encryptTransactionData(transactionData);

      const response = await apiService.post<Finance>('/finances/transactions', encryptedData);

      // Déchiffrer la réponse
      if (response.success && response.data) {
        response.data = this.decryptTransaction(response.data);
      }

      return response;
    } catch (error) {
      console.error('❌ Add transaction error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erreur d\'ajout de transaction',
        timestamp: new Date().toISOString(),
        requestId: 'transaction_add_error',
      };
    }
  }

  /**
   * Mettre à jour une transaction
   */
  async updateTransaction(
    transactionId: string, 
    updates: TransactionUpdateData
  ): Promise<ApiResponse<Finance>> {
    try {
      // Chiffrer les données sensibles dans les updates
      const encryptedUpdates = this.encryptTransactionData(updates);

      const response = await apiService.put<Finance>(`/finances/transactions/${transactionId}`, encryptedUpdates);

      // Déchiffrer la réponse
      if (response.success && response.data) {
        response.data = this.decryptTransaction(response.data);
      }

      return response;
    } catch (error) {
      console.error('❌ Update transaction error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erreur de mise à jour de transaction',
        timestamp: new Date().toISOString(),
        requestId: 'transaction_update_error',
      };
    }
  }

  /**
   * Récupérer les cotisations
   */
  async fetchDues(clubId: string, memberId?: string): Promise<ApiResponse<any[]>> {
    try {
      const params: any = { clubId };
      if (memberId) params.memberId = memberId;

      return await apiService.get<any[]>('/finances/dues', params, {
        cache: true,
        cacheTtl: 180000, // 3 minutes
      });
    } catch (error) {
      console.error('❌ Fetch dues error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erreur de récupération des cotisations',
        timestamp: new Date().toISOString(),
        requestId: 'dues_fetch_error',
      };
    }
  }

  /**
   * Payer les cotisations
   */
  async payDues(paymentData: DuesPaymentData): Promise<ApiResponse<{
    transaction: Finance;
    dues: any;
    receipt: { url: string; id: string };
  }>> {
    try {
      // Chiffrer les données de paiement
      const encryptedData = {
        ...paymentData,
        // Chiffrer les informations sensibles
        paymentMethod: this.encrypt(paymentData.paymentMethod),
        reference: paymentData.reference ? this.encrypt(paymentData.reference) : undefined,
        paidAt: new Date().toISOString(),
      };

      const response = await apiService.post<{
        transaction: Finance;
        dues: any;
        receipt: { url: string; id: string };
      }>(`/finances/dues/${paymentData.duesId}/pay`, encryptedData);

      // Déchiffrer la réponse
      if (response.success && response.data) {
        response.data.transaction = this.decryptTransaction(response.data.transaction);
      }

      return response;
    } catch (error) {
      console.error('❌ Pay dues error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erreur de paiement des cotisations',
        timestamp: new Date().toISOString(),
        requestId: 'dues_pay_error',
      };
    }
  }

  /**
   * Générer un rapport financier
   */
  async generateFinanceReport(reportData: FinanceReportData): Promise<ApiResponse<{
    report: any;
    downloadUrl?: string;
    summary: {
      totalIncome: number;
      totalExpenses: number;
      balance: number;
      categoryBreakdown: Record<FinanceCategory, number>;
    };
  }>> {
    try {
      return await apiService.post<{
        report: any;
        downloadUrl?: string;
        summary: {
          totalIncome: number;
          totalExpenses: number;
          balance: number;
          categoryBreakdown: Record<FinanceCategory, number>;
        };
      }>('/finances/reports', reportData);
    } catch (error) {
      console.error('❌ Generate finance report error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erreur de génération de rapport',
        timestamp: new Date().toISOString(),
        requestId: 'report_generate_error',
      };
    }
  }

  /**
   * Récupérer le solde du club
   */
  async getBalance(clubId: string): Promise<ApiResponse<BalanceInfo>> {
    try {
      return await apiService.get<BalanceInfo>(`/finances/clubs/${clubId}/balance`, undefined, {
        cache: true,
        cacheTtl: 120000, // 2 minutes
      });
    } catch (error) {
      console.error('❌ Get balance error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erreur de récupération du solde',
        timestamp: new Date().toISOString(),
        requestId: 'balance_fetch_error',
      };
    }
  }

  /**
   * Récupérer les statistiques financières
   */
  async getFinanceStats(
    clubId: string,
    period?: { startDate: string; endDate: string }
  ): Promise<ApiResponse<{
    totalIncome: number;
    totalExpenses: number;
    netBalance: number;
    monthlyTrend: Array<{ month: string; income: number; expenses: number }>;
    categoryBreakdown: Record<FinanceCategory, number>;
    topExpenses: Array<{ description: string; amount: number; category: FinanceCategory }>;
  }>> {
    try {
      const params: any = { clubId };
      if (period?.startDate) params.startDate = period.startDate;
      if (period?.endDate) params.endDate = period.endDate;

      return await apiService.get<{
        totalIncome: number;
        totalExpenses: number;
        netBalance: number;
        monthlyTrend: Array<{ month: string; income: number; expenses: number }>;
        categoryBreakdown: Record<FinanceCategory, number>;
        topExpenses: Array<{ description: string; amount: number; category: FinanceCategory }>;
      }>(`/finances/clubs/${clubId}/stats`, params, {
        cache: true,
        cacheTtl: 600000, // 10 minutes
      });
    } catch (error) {
      console.error('❌ Get finance stats error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erreur de récupération des statistiques',
        timestamp: new Date().toISOString(),
        requestId: 'finance_stats_error',
      };
    }
  }

  /**
   * Approuver une transaction (pour les officers)
   */
  async approveTransaction(transactionId: string, notes?: string): Promise<ApiResponse<Finance>> {
    try {
      const data = {
        status: 'Approved',
        approvedAt: new Date().toISOString(),
        approvalNotes: notes,
      };

      return await this.updateTransaction(transactionId, data);
    } catch (error) {
      console.error('❌ Approve transaction error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erreur d\'approbation de transaction',
        timestamp: new Date().toISOString(),
        requestId: 'transaction_approve_error',
      };
    }
  }

  /**
   * Rejeter une transaction
   */
  async rejectTransaction(transactionId: string, reason: string): Promise<ApiResponse<Finance>> {
    try {
      const data = {
        status: 'Cancelled',
        rejectedAt: new Date().toISOString(),
        rejectionReason: reason,
      };

      return await this.updateTransaction(transactionId, data);
    } catch (error) {
      console.error('❌ Reject transaction error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erreur de rejet de transaction',
        timestamp: new Date().toISOString(),
        requestId: 'transaction_reject_error',
      };
    }
  }

  /**
   * Upload reçu pour une transaction
   */
  async uploadReceipt(
    transactionId: string, 
    receipt: { uri: string; type: string; name: string }
  ): Promise<ApiResponse<{ url: string; id: string }>> {
    try {
      const formData = new FormData();
      formData.append('receipt', {
        uri: receipt.uri,
        type: receipt.type,
        name: receipt.name,
      } as any);
      formData.append('transactionId', transactionId);

      return await apiService.post<{ url: string; id: string }>(
        `/finances/transactions/${transactionId}/receipt`,
        formData
      );
    } catch (error) {
      console.error('❌ Upload receipt error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erreur d\'upload de reçu',
        timestamp: new Date().toISOString(),
        requestId: 'receipt_upload_error',
      };
    }
  }

  /**
   * Chiffrer les données de transaction
   */
  private encryptTransactionData(data: any): any {
    const sensitiveFields = ['amount', 'description', 'reference'];
    const encrypted = { ...data };

    sensitiveFields.forEach(field => {
      if (encrypted[field] !== undefined) {
        encrypted[field] = this.encrypt(encrypted[field].toString());
      }
    });

    return encrypted;
  }

  /**
   * Déchiffrer une transaction
   */
  private decryptTransaction(transaction: Finance): Finance {
    try {
      const decrypted = { ...transaction };
      
      // Déchiffrer les champs sensibles si ils sont chiffrés
      if (typeof decrypted.amount === 'string' && decrypted.amount.includes('U2FsdGVk')) {
        decrypted.amount = parseFloat(this.decrypt(decrypted.amount));
      }
      
      if (typeof decrypted.description === 'string' && decrypted.description.includes('U2FsdGVk')) {
        decrypted.description = this.decrypt(decrypted.description);
      }

      return decrypted;
    } catch (error) {
      console.error('Error decrypting transaction:', error);
      return transaction;
    }
  }

  /**
   * Chiffrer une chaîne
   */
  private encrypt(text: string): string {
    return CryptoJS.AES.encrypt(text, ENCRYPTION_KEY).toString();
  }

  /**
   * Déchiffrer une chaîne
   */
  private decrypt(encryptedText: string): string {
    const bytes = CryptoJS.AES.decrypt(encryptedText, ENCRYPTION_KEY);
    return bytes.toString(CryptoJS.enc.Utf8);
  }
}

// Instance singleton
export const financeService = new FinanceService();
export default financeService;
