import * as SecureStore from 'expo-secure-store';
import { API_CONFIG } from '../config/api';

export interface ComiteFonction {
  id: string;
  comiteId: string;
  nomComite: string;
  fonctionId: string;
  nomFonction: string;
  mandatId: string;
  anneeMandat: number;
  estResponsable: boolean;
  estActif: boolean;
  dateNomination: string;
  dateDemission?: string;
}

export interface MemberCommission {
  id: string;
  commissionId: string;
  nomCommission: string;
  estResponsable: boolean;
  estActif: boolean;
  dateNomination: string;
  dateDemission?: string;
  mandatId: string;
  anneeMandat: number;
  commentaires?: string;
}

export class MemberFunctionsService {
  private async getToken(): Promise<string | null> {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        return window.localStorage.getItem('authToken');
      }
      return await SecureStore.getItemAsync('authToken');
    } catch (error) {
      console.error('❌ Erreur récupération token pour fonctions:', error);
      return null;
    }
  }

  async getMembresComite(): Promise<any[]> {
    try {
      const token = await this.getToken();
      if (!token) {
        console.log('⚠️ Token manquant pour membres comité');
        return [];
      }

      const url = `${API_CONFIG.BASE_URL}${API_CONFIG.API_PREFIX}/membres-comite`;
      console.log(`🔄 Chargement tous les membres comité:`, url);

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'ngrok-skip-browser-warning': 'true',
        },
      });

      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }

      const data = await response.json();
      console.log(`✅ Membres comité reçus:`, Array.isArray(data) ? data.length : 'Format inattendu');
      return Array.isArray(data) ? data : data.data || [];
    } catch (error) {
      console.error(`❌ Erreur chargement membres comité:`, error);
      return [];
    }
  }

  async getMemberComiteFunctions(clubId: string, membreId: string): Promise<ComiteFonction[]> {
    try {
      console.log(`🔄 Recherche fonctions pour membre ${membreId}`);

      // Récupérer tous les membres comité et filtrer pour ce membre
      const allMembresComite = await this.getMembresComite();
      const fonctionsDuMembre = allMembresComite.filter(mc => mc.membreId === membreId);

      console.log(`✅ Fonctions trouvées pour membre ${membreId}:`, fonctionsDuMembre.length);
      return fonctionsDuMembre;
    } catch (error) {
      console.error(`❌ Erreur chargement fonctions membre ${membreId}:`, error);
      return [];
    }
  }

  async getClubCommissions(clubId: string): Promise<any[]> {
    try {
      const token = await this.getToken();
      if (!token) {
        console.log('⚠️ Token manquant pour commissions club');
        return [];
      }

      const url = `${API_CONFIG.BASE_URL}${API_CONFIG.API_PREFIX}/clubs/${clubId}/commissions`;
      console.log(`🔄 Chargement commissions du club ${clubId}:`, url);

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'ngrok-skip-browser-warning': 'true',
        },
      });

      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }

      const data = await response.json();
      console.log(`✅ Commissions du club reçues:`, Array.isArray(data) ? data.length : 'Format inattendu');
      return Array.isArray(data) ? data : data.data || [];
    } catch (error) {
      console.error(`❌ Erreur chargement commissions club:`, error);
      return [];
    }
  }

  async getClubCommissionMembers(clubId: string, commissionId: string): Promise<any> {
    try {
      const token = await this.getToken();
      if (!token) {
        console.log('⚠️ Token manquant pour membres commission');
        return { membres: [] };
      }

      const url = `${API_CONFIG.BASE_URL}${API_CONFIG.API_PREFIX}/clubs/${clubId}/commissions/${commissionId}/membres`;
      console.log(`🔄 Chargement membres commission ${commissionId}:`, url);

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'ngrok-skip-browser-warning': 'true',
        },
      });

      if (!response.ok) {
        if (response.status === 404) {
          console.log(`📋 Aucun membre trouvé pour commission ${commissionId}`);
          return { membres: [] };
        }
        throw new Error(`Erreur HTTP: ${response.status}`);
      }

      const data = await response.json();
      console.log(`✅ Membres commission ${commissionId} reçus:`, data.membres ? data.membres.length : 'Format inattendu');
      return data;
    } catch (error) {
      console.error(`❌ Erreur chargement membres commission ${commissionId}:`, error);
      return { membres: [] };
    }
  }

  async getMemberCommissions(clubId: string, membreId: string): Promise<MemberCommission[]> {
    try {
      console.log(`🔄 Recherche commissions pour membre ${membreId}`);

      // Récupérer toutes les commissions du club
      const commissions = await this.getClubCommissions(clubId);
      const commissionsDuMembre = [];

      for (const commission of commissions) {
        try {
          const membresCommission = await this.getClubCommissionMembers(clubId, commission.id);
          const membreDansCommission = membresCommission.membres.find(m => m.membreId === membreId);

          if (membreDansCommission) {
            commissionsDuMembre.push({
              id: membreDansCommission.id,
              commissionId: commission.id,
              nomCommission: commission.nom,
              estResponsable: membreDansCommission.estResponsable,
              estActif: membreDansCommission.estActif,
              dateNomination: membreDansCommission.dateNomination,
              dateDemission: membreDansCommission.dateDemission,
              mandatId: membreDansCommission.mandatId,
              anneeMandat: membreDansCommission.mandatAnnee,
              commentaires: membreDansCommission.commentaires
            });
          }
        } catch (error) {
          console.warn(`⚠️ Erreur lors de la récupération des membres de la commission ${commission.id}:`, error);
        }
      }

      console.log(`✅ Commissions trouvées pour membre ${membreId}:`, commissionsDuMembre.length);
      return commissionsDuMembre;
    } catch (error) {
      console.error(`❌ Erreur chargement commissions membre ${membreId}:`, error);
      return [];
    }
  }

  async loadMemberFunctionsAndCommissions(clubId: string, members: any[]): Promise<any[]> {
    console.log('🔄 Chargement fonctions et commissions pour tous les membres...');
    
    const enrichedMembers = await Promise.all(
      members.map(async (member) => {
        console.log(`📋 Traitement membre: ${member.fullName}`);
        
        // Charger les fonctions
        const fonctions = await this.getMemberComiteFunctions(clubId, member.id);
        
        // Charger les commissions
        const commissions = await this.getMemberCommissions(clubId, member.id);
        
        // Mapper au format attendu par l'interface
        const mappedFonctions = fonctions.map(f => ({
          comiteId: f.comiteId,
          comiteNom: f.nomComite,
          estResponsable: f.estResponsable,
          estActif: f.estActif,
          dateNomination: f.dateNomination,
          mandatAnnee: f.anneeMandat
        }));

        const mappedCommissions = commissions.map(c => ({
          commissionId: c.commissionId,
          commissionNom: c.nomCommission,
          estResponsable: c.estResponsable,
          estActif: c.estActif,
          dateNomination: c.dateNomination,
          mandatAnnee: c.anneeMandat
        }));

        console.log(`✅ Membre ${member.fullName}: ${mappedFonctions.length} fonctions, ${mappedCommissions.length} commissions`);

        return {
          ...member,
          fonctions: mappedFonctions,
          commissions: mappedCommissions
        };
      })
    );

    console.log('✅ Enrichissement des membres terminé');
    return enrichedMembers;
  }
}

export const memberFunctionsService = new MemberFunctionsService();
