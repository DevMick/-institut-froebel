/**
 * Club Service - Rotary Club Mobile
 * Service club avec CRUD membres, officers et upload photos
 */

import { apiService } from './apiService';
import type { RotaryClub, Member, ClubPosition, ApiResponse } from '../types';

// Types pour les requêtes club
interface ClubUpdateData {
  name?: string;
  meetingInfo?: {
    day: string;
    time: string;
    venue: string;
  };
  location?: {
    address: string;
    city: string;
    country: string;
  };
  website?: string;
}

interface MemberCreateData {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  membershipType: string;
  classification?: string;
  sponsor?: string;
}

interface MemberUpdateData {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  classification?: string;
  position?: ClubPosition;
  isActive?: boolean;
}

interface PhotoUploadData {
  uri: string;
  type: string;
  name: string;
}

class ClubService {
  /**
   * Récupérer les informations du club
   */
  async fetchClub(clubId: string): Promise<ApiResponse<RotaryClub>> {
    try {
      return await apiService.get<RotaryClub>(`/clubs/${clubId}`, undefined, {
        cache: true,
        cacheTtl: 300000, // 5 minutes
      });
    } catch (error) {
      console.error('❌ Fetch club error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erreur de récupération du club',
        timestamp: new Date().toISOString(),
        requestId: 'club_fetch_error',
      };
    }
  }

  /**
   * Mettre à jour les informations du club
   */
  async updateClub(clubId: string, updates: ClubUpdateData): Promise<ApiResponse<RotaryClub>> {
    try {
      return await apiService.put<RotaryClub>(`/clubs/${clubId}`, updates);
    } catch (error) {
      console.error('❌ Update club error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erreur de mise à jour du club',
        timestamp: new Date().toISOString(),
        requestId: 'club_update_error',
      };
    }
  }

  /**
   * Récupérer la liste des membres
   */
  async getMembers(clubId: string, filters?: {
    active?: boolean;
    position?: ClubPosition;
    search?: string;
  }): Promise<ApiResponse<Member[]>> {
    try {
      const params: any = { clubId };
      
      if (filters?.active !== undefined) {
        params.active = filters.active;
      }
      if (filters?.position) {
        params.position = filters.position;
      }
      if (filters?.search) {
        params.search = filters.search;
      }

      return await apiService.get<Member[]>('/members', params, {
        cache: true,
        cacheTtl: 180000, // 3 minutes
      });
    } catch (error) {
      console.error('❌ Get members error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erreur de récupération des membres',
        timestamp: new Date().toISOString(),
        requestId: 'members_fetch_error',
      };
    }
  }

  /**
   * Récupérer un membre par ID
   */
  async getMember(memberId: string): Promise<ApiResponse<Member>> {
    try {
      return await apiService.get<Member>(`/members/${memberId}`, undefined, {
        cache: true,
        cacheTtl: 300000, // 5 minutes
      });
    } catch (error) {
      console.error('❌ Get member error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erreur de récupération du membre',
        timestamp: new Date().toISOString(),
        requestId: 'member_fetch_error',
      };
    }
  }

  /**
   * Mettre à jour un membre
   */
  async updateMember(memberId: string, updates: MemberUpdateData): Promise<ApiResponse<Member>> {
    try {
      return await apiService.put<Member>(`/members/${memberId}`, updates);
    } catch (error) {
      console.error('❌ Update member error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erreur de mise à jour du membre',
        timestamp: new Date().toISOString(),
        requestId: 'member_update_error',
      };
    }
  }

  /**
   * Ajouter un nouveau membre
   */
  async addMember(clubId: string, memberData: MemberCreateData): Promise<ApiResponse<Member>> {
    try {
      const data = {
        ...memberData,
        clubId,
        joinDate: new Date().toISOString(),
        isActive: true,
      };

      return await apiService.post<Member>('/members', data);
    } catch (error) {
      console.error('❌ Add member error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erreur d\'ajout du membre',
        timestamp: new Date().toISOString(),
        requestId: 'member_add_error',
      };
    }
  }

  /**
   * Supprimer un membre (désactiver)
   */
  async removeMember(memberId: string, reason?: string): Promise<ApiResponse<boolean>> {
    try {
      const data = {
        isActive: false,
        deactivationDate: new Date().toISOString(),
        reason,
      };

      const response = await apiService.put<Member>(`/members/${memberId}`, data);
      
      return {
        success: response.success,
        data: response.success,
        error: response.error,
        timestamp: new Date().toISOString(),
        requestId: 'member_remove_success',
      };
    } catch (error) {
      console.error('❌ Remove member error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erreur de suppression du membre',
        timestamp: new Date().toISOString(),
        requestId: 'member_remove_error',
      };
    }
  }

  /**
   * Récupérer les officers du club
   */
  async getOfficers(clubId: string): Promise<ApiResponse<Record<ClubPosition, Member | null>>> {
    try {
      return await apiService.get<Record<ClubPosition, Member | null>>(`/clubs/${clubId}/officers`, undefined, {
        cache: true,
        cacheTtl: 600000, // 10 minutes
      });
    } catch (error) {
      console.error('❌ Get officers error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erreur de récupération des officers',
        timestamp: new Date().toISOString(),
        requestId: 'officers_fetch_error',
      };
    }
  }

  /**
   * Définir les officers du club
   */
  async setOfficers(
    clubId: string, 
    officers: Record<ClubPosition, string | null>
  ): Promise<ApiResponse<Record<ClubPosition, Member | null>>> {
    try {
      return await apiService.put<Record<ClubPosition, Member | null>>(
        `/clubs/${clubId}/officers`, 
        officers
      );
    } catch (error) {
      console.error('❌ Set officers error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erreur de définition des officers',
        timestamp: new Date().toISOString(),
        requestId: 'officers_set_error',
      };
    }
  }

  /**
   * Upload photo de membre
   */
  async uploadMemberPhoto(memberId: string, photo: PhotoUploadData): Promise<ApiResponse<{ url: string }>> {
    try {
      // Créer FormData pour l'upload
      const formData = new FormData();
      formData.append('photo', {
        uri: photo.uri,
        type: photo.type,
        name: photo.name,
      } as any);
      formData.append('memberId', memberId);

      // Configuration spéciale pour l'upload
      const response = await apiService.post<{ url: string }>(
        `/members/${memberId}/photo`,
        formData,
        { retries: 1 }
      );

      if (response.success && __DEV__) {
        console.log('✅ Photo uploaded successfully for member:', memberId);
      }

      return response;
    } catch (error) {
      console.error('❌ Upload photo error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erreur d\'upload de photo',
        timestamp: new Date().toISOString(),
        requestId: 'photo_upload_error',
      };
    }
  }

  /**
   * Télécharger les données du club pour usage offline
   */
  async downloadClubData(clubId: string): Promise<ApiResponse<{
    club: RotaryClub;
    members: Member[];
    officers: Record<ClubPosition, Member | null>;
  }>> {
    try {
      return await apiService.get<{
        club: RotaryClub;
        members: Member[];
        officers: Record<ClubPosition, Member | null>;
      }>(`/clubs/${clubId}/export`);
    } catch (error) {
      console.error('❌ Download club data error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erreur de téléchargement des données',
        timestamp: new Date().toISOString(),
        requestId: 'club_download_error',
      };
    }
  }

  /**
   * Rechercher des membres
   */
  async searchMembers(clubId: string, query: string): Promise<ApiResponse<Member[]>> {
    try {
      if (query.trim().length < 2) {
        return {
          success: true,
          data: [],
          timestamp: new Date().toISOString(),
          requestId: 'search_empty',
        };
      }

      return await apiService.get<Member[]>('/members/search', {
        clubId,
        q: query.trim(),
        limit: 20,
      });
    } catch (error) {
      console.error('❌ Search members error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erreur de recherche',
        timestamp: new Date().toISOString(),
        requestId: 'search_error',
      };
    }
  }

  /**
   * Obtenir les statistiques du club
   */
  async getClubStats(clubId: string): Promise<ApiResponse<{
    totalMembers: number;
    activeMembers: number;
    averageAttendance: number;
    monthlyGrowth: number;
  }>> {
    try {
      return await apiService.get<{
        totalMembers: number;
        activeMembers: number;
        averageAttendance: number;
        monthlyGrowth: number;
      }>(`/clubs/${clubId}/stats`, undefined, {
        cache: true,
        cacheTtl: 900000, // 15 minutes
      });
    } catch (error) {
      console.error('❌ Get club stats error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erreur de récupération des statistiques',
        timestamp: new Date().toISOString(),
        requestId: 'stats_error',
      };
    }
  }

  /**
   * Inviter un nouveau membre
   */
  async inviteMember(clubId: string, email: string, message?: string): Promise<ApiResponse<boolean>> {
    try {
      const data = {
        clubId,
        email: email.toLowerCase().trim(),
        message: message || 'Vous êtes invité à rejoindre notre club Rotary !',
        invitedAt: new Date().toISOString(),
      };

      const response = await apiService.post<{ invitationId: string }>('/members/invite', data);
      
      return {
        success: response.success,
        data: response.success,
        error: response.error,
        timestamp: new Date().toISOString(),
        requestId: 'member_invite_success',
      };
    } catch (error) {
      console.error('❌ Invite member error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erreur d\'invitation',
        timestamp: new Date().toISOString(),
        requestId: 'member_invite_error',
      };
    }
  }
}

// Instance singleton
export const clubService = new ClubService();
export default clubService;
