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

  // Données de test en attendant l'implémentation des endpoints
  private getTestFunctionsForMember(memberId: string, memberName: string): any[] {
    const testData = {
      '60403bc7-b785-4703-bee6-345da9687aa2': [ // Kouadio Yao (Admin)
        {
          comiteId: 'comite-1',
          comiteNom: 'Comité Exécutif',
          estResponsable: true,
          estActif: true,
          dateNomination: '2024-07-01',
          mandatAnnee: 2024
        },
        {
          comiteId: 'comite-2',
          comiteNom: 'Comité Administration',
          estResponsable: false,
          estActif: true,
          dateNomination: '2024-07-01',
          mandatAnnee: 2024
        }
      ],
      '0cbfc6d5-18a9-4b35-a82e-81b62fa2bcf5': [ // Jean-Baptiste Kouamé
        {
          comiteId: 'comite-3',
          comiteNom: 'Comité Finances',
          estResponsable: true,
          estActif: true,
          dateNomination: '2024-07-01',
          mandatAnnee: 2024
        }
      ],
      'fd503d4e-f59a-42b1-b9ea-703bf82faeb3': [ // Paul Gnangnan
        {
          comiteId: 'comite-3',
          comiteNom: 'Comité Finances',
          estResponsable: false,
          estActif: true,
          dateNomination: '2024-07-01',
          mandatAnnee: 2024
        }
      ]
    };

    return testData[memberId] || [];
  }

  private getTestCommissionsForMember(memberId: string, memberName: string): any[] {
    const testData = {
      '60403bc7-b785-4703-bee6-345da9687aa2': [ // Kouadio Yao
        {
          commissionId: 'comm-1',
          commissionNom: 'Commission Actions Communautaires',
          estResponsable: true,
          estActif: true,
          dateNomination: '2024-07-01',
          mandatAnnee: 2024
        }
      ],
      'eaf935d4-6ac1-40a4-8bc4-fb153d53bd07': [ // Fatou Camara
        {
          commissionId: 'comm-1',
          commissionNom: 'Commission Actions Communautaires',
          estResponsable: false,
          estActif: true,
          dateNomination: '2024-07-01',
          mandatAnnee: 2024
        },
        {
          commissionId: 'comm-2',
          commissionNom: 'Commission Jeunesse',
          estResponsable: true,
          estActif: true,
          dateNomination: '2024-07-01',
          mandatAnnee: 2024
        }
      ],
      '95ba8bcb-7308-473a-b619-46853807dd30': [ // Didier Assi
        {
          commissionId: 'comm-3',
          commissionNom: 'Commission Communication',
          estResponsable: true,
          estActif: true,
          dateNomination: '2024-07-01',
          mandatAnnee: 2024
        }
      ]
    };

    return testData[memberId] || [];
  }

  async getAllMembersFunctionsCommissions(clubId: string): Promise<any> {
    try {
      const token = await this.getToken();
      if (!token) {
        console.log('⚠️ Token manquant pour fonctions/commissions membres');
        return null;
      }

      const url = `${API_CONFIG.BASE_URL}${API_CONFIG.API_PREFIX}/clubs/${clubId}/membres/fonctions-commissions`;
      console.log(`🔄 Chargement fonctions/commissions tous membres:`, url);

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
          console.log(`📋 Endpoint fonctions/commissions non trouvé - utilisation données de test`);
          return null;
        }
        throw new Error(`Erreur HTTP: ${response.status}`);
      }

      const data = await response.json();
      console.log(`✅ Fonctions/commissions reçues:`, data.Membres ? data.Membres.length : 'Format inattendu');
      console.log(`📊 Statistiques globales:`, data.StatistiquesGlobales);
      return data;
    } catch (error) {
      console.error(`❌ Erreur chargement fonctions/commissions:`, error);
      return null;
    }
  }

  async loadMemberFunctionsAndCommissions(clubId: string, members: any[]): Promise<any[]> {
    console.log('🔄 Chargement fonctions et commissions pour tous les membres...');

    // Essayer d'utiliser le nouvel endpoint optimisé
    const apiData = await this.getAllMembersFunctionsCommissions(clubId);

    if (apiData && apiData.Membres) {
      console.log('✅ Utilisation des données de l\'API backend');

      // Enrichir les membres existants avec les données de l'API
      const enrichedMembers = members.map((member) => {
        // Trouver les données correspondantes dans la réponse API
        const apiMember = apiData.Membres.find((m: any) => m.Membre.Id === member.id);

        if (apiMember) {
          // Mapper les fonctions au format attendu par l'interface
          const mappedFonctions = apiMember.Fonctions.map((f: any) => ({
            comiteId: f.ComiteMembreId,
            comiteNom: f.NomFonction, // Le nom de la fonction fait office de nom du comité
            estResponsable: f.NomFonction.toLowerCase().includes('président') || f.NomFonction.toLowerCase().includes('responsable'),
            estActif: true,
            dateNomination: new Date().toISOString(),
            mandatAnnee: apiData.Mandat.Annee
          }));

          // Mapper les commissions au format attendu par l'interface
          const mappedCommissions = apiMember.Commissions.map((c: any) => ({
            commissionId: c.CommissionId,
            commissionNom: c.NomCommission,
            estResponsable: c.EstResponsable,
            estActif: true,
            dateNomination: c.DateNomination,
            mandatAnnee: apiData.Mandat.Annee
          }));

          console.log(`✅ Membre ${member.fullName}: ${mappedFonctions.length} fonctions, ${mappedCommissions.length} commissions`);

          return {
            ...member,
            fonctions: mappedFonctions,
            commissions: mappedCommissions
          };
        } else {
          console.log(`⚠️ Membre ${member.fullName}: non trouvé dans les données API`);
          return {
            ...member,
            fonctions: [],
            commissions: []
          };
        }
      });

      console.log('✅ Enrichissement des membres terminé (avec données API)');
      return enrichedMembers;
    } else {
      // Fallback vers les données de test
      console.log('⚠️ Utilisation de données de test en attendant l\'implémentation de l\'endpoint backend');

      const enrichedMembers = members.map((member) => {
        console.log(`📋 Traitement membre: ${member.fullName}`);

        // Utiliser les données de test
        const fonctions = this.getTestFunctionsForMember(member.id, member.fullName);
        const commissions = this.getTestCommissionsForMember(member.id, member.fullName);

        console.log(`✅ Membre ${member.fullName}: ${fonctions.length} fonctions, ${commissions.length} commissions`);

        return {
          ...member,
          fonctions: fonctions,
          commissions: commissions
        };
      });

      console.log('✅ Enrichissement des membres terminé (avec données de test)');
      return enrichedMembers;
    }
  }
}

export const memberFunctionsService = new MemberFunctionsService();
