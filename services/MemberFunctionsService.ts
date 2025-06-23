import * as SecureStore from 'expo-secure-store';
import { API_CONFIG } from '../config/api';

export interface ComiteFonction {
  comiteId: string;
  nomComite: string;
  fonction: {
    id: string;
    nom: string;
  };
  mandat: {
    id: string;
    annee: number;
    dateDebut: string;
    dateFin: string;
  };
}

export interface MemberCommission {
  commissionId: string;
  nomCommission: string;
  estResponsable: boolean;
  mandat: {
    id: string;
    annee: number;
    dateDebut: string;
    dateFin: string;
  };
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

  async getMemberComiteFunctions(clubId: string, membreId: string): Promise<ComiteFonction[]> {
    try {
      const token = await this.getToken();
      if (!token) {
        console.log('⚠️ Token manquant pour fonctions membre:', membreId);
        return [];
      }

      const url = `${API_CONFIG.BASE_URL}${API_CONFIG.API_PREFIX}/clubs/${clubId}/membres/${membreId}/comite-fonctions?mandatActuel=true`;
      console.log(`🔄 Chargement fonctions pour membre ${membreId}:`, url);

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
          console.log(`📋 Aucune fonction trouvée pour membre ${membreId}`);
          return [];
        }
        throw new Error(`Erreur HTTP: ${response.status}`);
      }

      const data = await response.json();
      console.log(`✅ Fonctions reçues pour membre ${membreId}:`, data);
      return Array.isArray(data) ? data : data.data || [];
    } catch (error) {
      console.error(`❌ Erreur chargement fonctions membre ${membreId}:`, error);
      return [];
    }
  }

  async getMemberCommissions(clubId: string, membreId: string): Promise<MemberCommission[]> {
    try {
      const token = await this.getToken();
      if (!token) {
        console.log('⚠️ Token manquant pour commissions membre:', membreId);
        return [];
      }

      const url = `${API_CONFIG.BASE_URL}${API_CONFIG.API_PREFIX}/clubs/${clubId}/membres/${membreId}/commissions?mandatActuel=true`;
      console.log(`🔄 Chargement commissions pour membre ${membreId}:`, url);

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
          console.log(`📋 Aucune commission trouvée pour membre ${membreId}`);
          return [];
        }
        throw new Error(`Erreur HTTP: ${response.status}`);
      }

      const data = await response.json();
      console.log(`✅ Commissions reçues pour membre ${membreId}:`, data);
      return Array.isArray(data) ? data : data.data || [];
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
          estResponsable: f.fonction.nom.toLowerCase().includes('responsable') || f.fonction.nom.toLowerCase().includes('président'),
          estActif: true,
          dateNomination: f.mandat.dateDebut,
          mandatAnnee: f.mandat.annee
        }));

        const mappedCommissions = commissions.map(c => ({
          commissionId: c.commissionId,
          commissionNom: c.nomCommission,
          estResponsable: c.estResponsable,
          estActif: true,
          dateNomination: c.mandat.dateDebut,
          mandatAnnee: c.mandat.annee
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
