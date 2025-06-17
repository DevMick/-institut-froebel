/**
 * Reunion Service - Rotary Club Mobile
 * Service réunions avec QR codes, attendance et rappels
 */

import { apiService } from './apiService';
import type { Reunion, Attendance, AttendanceStatus, ReunionType, ApiResponse } from '../types';

// Types pour les requêtes réunion
interface ReunionCreateData {
  clubId: string;
  title: string;
  description?: string;
  date: string;
  startTime: string;
  endTime: string;
  location: string;
  type: ReunionType;
  isRecurring?: boolean;
  recurringPattern?: {
    frequency: 'weekly' | 'monthly';
    interval: number;
    endDate?: string;
  };
}

interface ReunionUpdateData {
  title?: string;
  description?: string;
  date?: string;
  startTime?: string;
  endTime?: string;
  location?: string;
  status?: 'Scheduled' | 'InProgress' | 'Completed' | 'Cancelled';
}

interface AttendanceMarkData {
  memberId: string;
  reunionId: string;
  status: AttendanceStatus;
  qrCode?: string;
  notes?: string;
}

interface QRCodeData {
  qrCode: string;
  expiresAt: string;
  reunionId: string;
}

class ReunionService {
  /**
   * Récupérer les réunions
   */
  async fetchReunions(
    clubId: string,
    filters?: {
      startDate?: string;
      endDate?: string;
      type?: ReunionType;
      status?: string;
      limit?: number;
    }
  ): Promise<ApiResponse<Reunion[]>> {
    try {
      const params: any = { clubId };
      
      if (filters?.startDate) params.startDate = filters.startDate;
      if (filters?.endDate) params.endDate = filters.endDate;
      if (filters?.type) params.type = filters.type;
      if (filters?.status) params.status = filters.status;
      if (filters?.limit) params.limit = filters.limit;

      return await apiService.get<Reunion[]>('/reunions', params, {
        cache: true,
        cacheTtl: 180000, // 3 minutes
      });
    } catch (error) {
      console.error('❌ Fetch reunions error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erreur de récupération des réunions',
        timestamp: new Date().toISOString(),
        requestId: 'reunions_fetch_error',
      };
    }
  }

  /**
   * Créer une nouvelle réunion
   */
  async createReunion(reunionData: ReunionCreateData): Promise<ApiResponse<Reunion>> {
    try {
      const data = {
        ...reunionData,
        createdAt: new Date().toISOString(),
        status: 'Scheduled',
      };

      return await apiService.post<Reunion>('/reunions', data);
    } catch (error) {
      console.error('❌ Create reunion error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erreur de création de réunion',
        timestamp: new Date().toISOString(),
        requestId: 'reunion_create_error',
      };
    }
  }

  /**
   * Mettre à jour une réunion
   */
  async updateReunion(reunionId: string, updates: ReunionUpdateData): Promise<ApiResponse<Reunion>> {
    try {
      return await apiService.put<Reunion>(`/reunions/${reunionId}`, updates);
    } catch (error) {
      console.error('❌ Update reunion error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erreur de mise à jour de réunion',
        timestamp: new Date().toISOString(),
        requestId: 'reunion_update_error',
      };
    }
  }

  /**
   * Supprimer une réunion
   */
  async deleteReunion(reunionId: string): Promise<ApiResponse<boolean>> {
    try {
      const response = await apiService.delete<{ deleted: boolean }>(`/reunions/${reunionId}`);
      
      return {
        success: response.success,
        data: response.success,
        error: response.error,
        timestamp: new Date().toISOString(),
        requestId: 'reunion_delete_success',
      };
    } catch (error) {
      console.error('❌ Delete reunion error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erreur de suppression de réunion',
        timestamp: new Date().toISOString(),
        requestId: 'reunion_delete_error',
      };
    }
  }

  /**
   * Générer un QR code pour la réunion
   */
  async generateQRCode(reunionId: string, expiryMinutes: number = 30): Promise<ApiResponse<QRCodeData>> {
    try {
      const data = {
        reunionId,
        expiryMinutes,
        generatedAt: new Date().toISOString(),
      };

      return await apiService.post<QRCodeData>(`/reunions/${reunionId}/qr`, data);
    } catch (error) {
      console.error('❌ Generate QR code error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erreur de génération QR code',
        timestamp: new Date().toISOString(),
        requestId: 'qr_generate_error',
      };
    }
  }

  /**
   * Valider un QR code
   */
  async validateQRCode(qrCode: string, memberId: string): Promise<ApiResponse<{
    valid: boolean;
    reunionId?: string;
    message: string;
  }>> {
    try {
      const data = {
        qrCode,
        memberId,
        scannedAt: new Date().toISOString(),
      };

      return await apiService.post<{
        valid: boolean;
        reunionId?: string;
        message: string;
      }>('/reunions/qr/validate', data);
    } catch (error) {
      console.error('❌ Validate QR code error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erreur de validation QR code',
        timestamp: new Date().toISOString(),
        requestId: 'qr_validate_error',
      };
    }
  }

  /**
   * Marquer la présence
   */
  async markAttendance(attendanceData: AttendanceMarkData): Promise<ApiResponse<Attendance>> {
    try {
      const data = {
        ...attendanceData,
        timestamp: new Date().toISOString(),
      };

      return await apiService.post<Attendance>('/attendance', data);
    } catch (error) {
      console.error('❌ Mark attendance error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erreur de marquage de présence',
        timestamp: new Date().toISOString(),
        requestId: 'attendance_mark_error',
      };
    }
  }

  /**
   * Récupérer les présences d'une réunion
   */
  async getAttendance(reunionId: string): Promise<ApiResponse<Attendance[]>> {
    try {
      return await apiService.get<Attendance[]>(`/reunions/${reunionId}/attendance`, undefined, {
        cache: true,
        cacheTtl: 60000, // 1 minute (données temps réel)
      });
    } catch (error) {
      console.error('❌ Get attendance error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erreur de récupération des présences',
        timestamp: new Date().toISOString(),
        requestId: 'attendance_fetch_error',
      };
    }
  }

  /**
   * Générer un rapport de présence
   */
  async getAttendanceReport(
    clubId: string,
    filters?: {
      startDate?: string;
      endDate?: string;
      memberId?: string;
      format?: 'json' | 'csv' | 'pdf';
    }
  ): Promise<ApiResponse<{
    report: any;
    downloadUrl?: string;
  }>> {
    try {
      const params: any = { clubId };
      
      if (filters?.startDate) params.startDate = filters.startDate;
      if (filters?.endDate) params.endDate = filters.endDate;
      if (filters?.memberId) params.memberId = filters.memberId;
      if (filters?.format) params.format = filters.format;

      return await apiService.get<{
        report: any;
        downloadUrl?: string;
      }>('/attendance/report', params);
    } catch (error) {
      console.error('❌ Get attendance report error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erreur de génération du rapport',
        timestamp: new Date().toISOString(),
        requestId: 'report_error',
      };
    }
  }

  /**
   * Envoyer des rappels de réunion
   */
  async sendReunionReminders(
    reunionId: string,
    options?: {
      channels?: ('email' | 'push' | 'sms')[];
      customMessage?: string;
      sendToAll?: boolean;
      memberIds?: string[];
    }
  ): Promise<ApiResponse<{
    sent: number;
    failed: number;
    details: Array<{ memberId: string; status: 'sent' | 'failed'; error?: string }>;
  }>> {
    try {
      const data = {
        reunionId,
        channels: options?.channels || ['email', 'push'],
        customMessage: options?.customMessage,
        sendToAll: options?.sendToAll ?? true,
        memberIds: options?.memberIds || [],
        sentAt: new Date().toISOString(),
      };

      return await apiService.post<{
        sent: number;
        failed: number;
        details: Array<{ memberId: string; status: 'sent' | 'failed'; error?: string }>;
      }>(`/reunions/${reunionId}/reminders`, data);
    } catch (error) {
      console.error('❌ Send reminders error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erreur d\'envoi des rappels',
        timestamp: new Date().toISOString(),
        requestId: 'reminders_error',
      };
    }
  }

  /**
   * Démarrer une réunion (change le statut)
   */
  async startReunion(reunionId: string): Promise<ApiResponse<Reunion>> {
    try {
      const updates = {
        status: 'InProgress',
        actualStartTime: new Date().toISOString(),
      };

      return await this.updateReunion(reunionId, updates);
    } catch (error) {
      console.error('❌ Start reunion error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erreur de démarrage de réunion',
        timestamp: new Date().toISOString(),
        requestId: 'reunion_start_error',
      };
    }
  }

  /**
   * Terminer une réunion
   */
  async endReunion(reunionId: string, summary?: string): Promise<ApiResponse<Reunion>> {
    try {
      const updates = {
        status: 'Completed',
        actualEndTime: new Date().toISOString(),
        summary,
      };

      return await this.updateReunion(reunionId, updates);
    } catch (error) {
      console.error('❌ End reunion error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erreur de fin de réunion',
        timestamp: new Date().toISOString(),
        requestId: 'reunion_end_error',
      };
    }
  }

  /**
   * Obtenir les statistiques de présence d'un membre
   */
  async getMemberAttendanceStats(
    memberId: string,
    period?: {
      startDate: string;
      endDate: string;
    }
  ): Promise<ApiResponse<{
    totalReunions: number;
    attended: number;
    attendanceRate: number;
    streak: number;
    lastAttended?: string;
  }>> {
    try {
      const params: any = { memberId };
      
      if (period?.startDate) params.startDate = period.startDate;
      if (period?.endDate) params.endDate = period.endDate;

      return await apiService.get<{
        totalReunions: number;
        attended: number;
        attendanceRate: number;
        streak: number;
        lastAttended?: string;
      }>(`/members/${memberId}/attendance-stats`, params, {
        cache: true,
        cacheTtl: 300000, // 5 minutes
      });
    } catch (error) {
      console.error('❌ Get member attendance stats error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erreur de récupération des statistiques',
        timestamp: new Date().toISOString(),
        requestId: 'member_stats_error',
      };
    }
  }

  /**
   * Rechercher des réunions
   */
  async searchReunions(clubId: string, query: string): Promise<ApiResponse<Reunion[]>> {
    try {
      if (query.trim().length < 2) {
        return {
          success: true,
          data: [],
          timestamp: new Date().toISOString(),
          requestId: 'search_empty',
        };
      }

      return await apiService.get<Reunion[]>('/reunions/search', {
        clubId,
        q: query.trim(),
        limit: 20,
      });
    } catch (error) {
      console.error('❌ Search reunions error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erreur de recherche',
        timestamp: new Date().toISOString(),
        requestId: 'search_error',
      };
    }
  }
}

// Instance singleton
export const reunionService = new ReunionService();
export default reunionService;
