/**
 * Offline Member Service - Rotary Club Mobile
 * Service membres avec cache-first et optimistic updates
 */

import { databaseService } from './databaseService';
import { syncService } from './syncService';
import { apiClient } from './apiClient';
import { v4 as uuidv4 } from 'uuid';

// Types
export interface Member {
  id: string;
  name: string;
  email: string;
  phone?: string;
  photo_url?: string;
  club_id: string;
  role: 'member' | 'admin' | 'president' | 'secretary' | 'treasurer';
  is_active: boolean;
  synced: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateMemberData {
  name: string;
  email: string;
  phone?: string;
  photo_url?: string;
  club_id: string;
  role?: Member['role'];
}

export interface UpdateMemberData {
  name?: string;
  email?: string;
  phone?: string;
  photo_url?: string;
  role?: Member['role'];
  is_active?: boolean;
}

class OfflineMemberService {
  /**
   * Obtenir tous les membres (cache-first)
   */
  async getMembers(clubId?: string): Promise<Member[]> {
    try {
      // 1. Récupérer depuis le cache local
      const whereClause = clubId ? 'club_id = ? AND is_active = 1' : 'is_active = 1';
      const whereParams = clubId ? [clubId] : [];
      
      const cachedMembers = await databaseService.select(
        'members',
        '*',
        whereClause,
        whereParams,
        'name ASC'
      );

      // 2. Si on a des données en cache, les retourner immédiatement
      if (cachedMembers.length > 0) {
        console.log(`📋 Loaded ${cachedMembers.length} members from cache`);
        
        // 3. Déclencher une sync en arrière-plan pour rafraîchir
        this.refreshMembersInBackground(clubId);
        
        return cachedMembers;
      }

      // 4. Si pas de cache, essayer de récupérer depuis l'API
      return await this.fetchMembersFromAPI(clubId);
    } catch (error) {
      console.error('Error getting members:', error);
      throw error;
    }
  }

  /**
   * Obtenir un membre par ID (cache-first)
   */
  async getMemberById(id: string): Promise<Member | null> {
    try {
      // 1. Vérifier le cache local
      const cachedMembers = await databaseService.select(
        'members',
        '*',
        'id = ?',
        [id]
      );

      if (cachedMembers.length > 0) {
        console.log(`📋 Loaded member ${id} from cache`);
        
        // Rafraîchir en arrière-plan
        this.refreshMemberInBackground(id);
        
        return cachedMembers[0];
      }

      // 2. Récupérer depuis l'API si pas en cache
      return await this.fetchMemberFromAPI(id);
    } catch (error) {
      console.error('Error getting member by ID:', error);
      return null;
    }
  }

  /**
   * Créer un nouveau membre (optimistic update)
   */
  async createMember(data: CreateMemberData): Promise<Member> {
    try {
      const id = uuidv4();
      const now = new Date().toISOString();
      
      const member: Member = {
        id,
        ...data,
        role: data.role || 'member',
        is_active: true,
        synced: false,
        created_at: now,
        updated_at: now,
      };

      // 1. Optimistic update - sauvegarder localement d'abord
      await databaseService.insert('members', member);
      console.log(`✅ Member ${id} created locally (optimistic)`);

      // 2. Ajouter à la queue de synchronisation
      await syncService.queueAction('CREATE', 'members', id, member, 1);

      return member;
    } catch (error) {
      console.error('Error creating member:', error);
      throw error;
    }
  }

  /**
   * Mettre à jour un membre (optimistic update)
   */
  async updateMember(id: string, data: UpdateMemberData): Promise<Member> {
    try {
      // 1. Récupérer le membre existant
      const existingMember = await this.getMemberById(id);
      if (!existingMember) {
        throw new Error('Member not found');
      }

      // 2. Préparer les données mises à jour
      const updatedMember: Member = {
        ...existingMember,
        ...data,
        synced: false,
        updated_at: new Date().toISOString(),
      };

      // 3. Optimistic update - mettre à jour localement
      await databaseService.update(
        'members',
        updatedMember,
        'id = ?',
        [id]
      );
      console.log(`✅ Member ${id} updated locally (optimistic)`);

      // 4. Ajouter à la queue de synchronisation
      await syncService.queueAction('UPDATE', 'members', id, updatedMember, 1);

      return updatedMember;
    } catch (error) {
      console.error('Error updating member:', error);
      throw error;
    }
  }

  /**
   * Supprimer un membre (optimistic update)
   */
  async deleteMember(id: string): Promise<void> {
    try {
      // 1. Soft delete - marquer comme inactif
      await databaseService.update(
        'members',
        { 
          is_active: false, 
          synced: false,
          updated_at: new Date().toISOString(),
        },
        'id = ?',
        [id]
      );
      console.log(`✅ Member ${id} deleted locally (optimistic)`);

      // 2. Ajouter à la queue de synchronisation
      await syncService.queueAction('DELETE', 'members', id, { id }, 1);
    } catch (error) {
      console.error('Error deleting member:', error);
      throw error;
    }
  }

  /**
   * Rechercher des membres (cache-first avec filtrage local)
   */
  async searchMembers(query: string, clubId?: string): Promise<Member[]> {
    try {
      // Récupérer tous les membres depuis le cache
      const members = await this.getMembers(clubId);
      
      // Filtrer localement
      const filteredMembers = members.filter(member => 
        member.name.toLowerCase().includes(query.toLowerCase()) ||
        member.email.toLowerCase().includes(query.toLowerCase()) ||
        (member.phone && member.phone.includes(query))
      );

      console.log(`🔍 Found ${filteredMembers.length} members matching "${query}"`);
      return filteredMembers;
    } catch (error) {
      console.error('Error searching members:', error);
      return [];
    }
  }

  /**
   * Obtenir les statistiques des membres
   */
  async getMemberStats(clubId?: string): Promise<{
    total: number;
    active: number;
    inactive: number;
    byRole: Record<string, number>;
    unsynced: number;
  }> {
    try {
      const whereClause = clubId ? 'club_id = ?' : '';
      const whereParams = clubId ? [clubId] : [];

      const [
        totalResult,
        activeResult,
        inactiveResult,
        unsyncedResult,
      ] = await Promise.all([
        databaseService.count('members', whereClause, whereParams),
        databaseService.count('members', 
          whereClause ? `${whereClause} AND is_active = 1` : 'is_active = 1', 
          whereParams
        ),
        databaseService.count('members', 
          whereClause ? `${whereClause} AND is_active = 0` : 'is_active = 0', 
          whereParams
        ),
        databaseService.count('members', 
          whereClause ? `${whereClause} AND synced = 0` : 'synced = 0', 
          whereParams
        ),
      ]);

      // Compter par rôle
      const members = await databaseService.select(
        'members',
        'role',
        whereClause,
        whereParams
      );

      const byRole = members.reduce((acc, member) => {
        acc[member.role] = (acc[member.role] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      return {
        total: totalResult,
        active: activeResult,
        inactive: inactiveResult,
        byRole,
        unsynced: unsyncedResult,
      };
    } catch (error) {
      console.error('Error getting member stats:', error);
      return {
        total: 0,
        active: 0,
        inactive: 0,
        byRole: {},
        unsynced: 0,
      };
    }
  }

  /**
   * Rafraîchir les membres en arrière-plan
   */
  private async refreshMembersInBackground(clubId?: string): Promise<void> {
    try {
      // Ne pas bloquer l'UI, exécuter en arrière-plan
      setTimeout(async () => {
        await this.fetchMembersFromAPI(clubId, true);
      }, 1000);
    } catch (error) {
      console.error('Background refresh failed:', error);
    }
  }

  /**
   * Rafraîchir un membre en arrière-plan
   */
  private async refreshMemberInBackground(id: string): Promise<void> {
    try {
      setTimeout(async () => {
        await this.fetchMemberFromAPI(id, true);
      }, 1000);
    } catch (error) {
      console.error('Background member refresh failed:', error);
    }
  }

  /**
   * Récupérer les membres depuis l'API
   */
  private async fetchMembersFromAPI(clubId?: string, isBackground = false): Promise<Member[]> {
    try {
      const endpoint = clubId ? `/api/members?club_id=${clubId}` : '/api/members';
      const response = await apiClient.get(endpoint);

      if (response.success && response.data) {
        const members: Member[] = response.data.map((member: any) => ({
          ...member,
          synced: true,
        }));

        // Mettre à jour le cache local
        await this.updateMembersCache(members);
        
        if (!isBackground) {
          console.log(`📡 Loaded ${members.length} members from API`);
        }
        
        return members;
      } else {
        throw new Error(response.error || 'Failed to fetch members');
      }
    } catch (error) {
      if (!isBackground) {
        console.error('Error fetching members from API:', error);
        throw error;
      }
      return [];
    }
  }

  /**
   * Récupérer un membre depuis l'API
   */
  private async fetchMemberFromAPI(id: string, isBackground = false): Promise<Member | null> {
    try {
      const response = await apiClient.get(`/api/members/${id}`);

      if (response.success && response.data) {
        const member: Member = {
          ...response.data,
          synced: true,
        };

        // Mettre à jour le cache local
        await databaseService.update(
          'members',
          member,
          'id = ?',
          [id]
        );

        if (!isBackground) {
          console.log(`📡 Loaded member ${id} from API`);
        }

        return member;
      } else {
        return null;
      }
    } catch (error) {
      if (!isBackground) {
        console.error('Error fetching member from API:', error);
      }
      return null;
    }
  }

  /**
   * Mettre à jour le cache des membres
   */
  private async updateMembersCache(members: Member[]): Promise<void> {
    try {
      await databaseService.executeTransaction(async (tx) => {
        for (const member of members) {
          // Vérifier si le membre existe déjà
          const existing = await databaseService.select(
            'members',
            'id',
            'id = ?',
            [member.id]
          );

          if (existing.length > 0) {
            // Mettre à jour seulement si pas de modifications locales non synchronisées
            const localMember = existing[0];
            if (localMember.synced) {
              await databaseService.update(
                'members',
                member,
                'id = ?',
                [member.id]
              );
            }
          } else {
            // Nouveau membre, l'insérer
            await databaseService.insert('members', member);
          }
        }
      });

      console.log(`💾 Updated cache with ${members.length} members`);
    } catch (error) {
      console.error('Error updating members cache:', error);
    }
  }

  /**
   * Nettoyer le cache des membres
   */
  async cleanupCache(): Promise<void> {
    try {
      // Supprimer les membres inactifs anciens (> 30 jours)
      await databaseService.delete(
        'members',
        'is_active = 0 AND updated_at < datetime("now", "-30 days")'
      );

      console.log('✅ Members cache cleaned up');
    } catch (error) {
      console.error('Error cleaning up members cache:', error);
    }
  }

  /**
   * Forcer la synchronisation des membres
   */
  async forceSync(clubId?: string): Promise<void> {
    try {
      console.log('🔄 Force syncing members...');
      await this.fetchMembersFromAPI(clubId);
    } catch (error) {
      console.error('Error force syncing members:', error);
      throw error;
    }
  }
}

// Instance singleton
export const offlineMemberService = new OfflineMemberService();

export default offlineMemberService;
