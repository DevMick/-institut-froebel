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

  async getClubComites(clubId: string): Promise<any[]> {
    try {
      const token = await this.getToken();
      if (!token) {
        console.log('⚠️ Token manquant pour comités club');
        return [];
      }

      const url = `${API_CONFIG.BASE_URL}${API_CONFIG.API_PREFIX}/clubs/${clubId}/comites`;
      console.log(`🔄 Chargement comités du club ${clubId}:`, url);

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
      console.log(`✅ Comités du club reçus:`, Array.isArray(data) ? data.length : 'Format inattendu');
      return Array.isArray(data) ? data : data.data || [];
    } catch (error) {
      console.error(`❌ Erreur chargement comités club:`, error);
      return [];
    }
  }

  async getComiteMembres(clubId: string, comiteId: string): Promise<any> {
    try {
      const token = await this.getToken();
      if (!token) {
        console.log('⚠️ Token manquant pour membres comité');
        return { Membres: [] };
      }

      const url = `${API_CONFIG.BASE_URL}${API_CONFIG.API_PREFIX}/clubs/${clubId}/comites/${comiteId}/membres`;
      console.log(`🔄 Chargement membres comité ${comiteId}:`, url);

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
          console.log(`📋 Aucun membre trouvé pour comité ${comiteId}`);
          return { Membres: [] };
        }
        throw new Error(`Erreur HTTP: ${response.status}`);
      }

      const data = await response.json();
      console.log(`✅ Membres comité ${comiteId} reçus:`, data.Membres ? data.Membres.length : 'Format inattendu');
      return data;
    } catch (error) {
      console.error(`❌ Erreur chargement membres comité ${comiteId}:`, error);
      return { Membres: [] };
    }
  }

  async getMemberComiteFunctions(clubId: string, membreId: string): Promise<ComiteFonction[]> {
    try {
      console.log(`🔄 Recherche fonctions pour membre ${membreId}`);

      // Récupérer tous les comités du club
      const comites = await this.getClubComites(clubId);
      const fonctionsDuMembre = [];

      // Pour chaque comité, récupérer les membres et chercher notre membre
      for (const comite of comites) {
        try {
          const comiteData = await this.getComiteMembres(clubId, comite.id);
          const membreDansComite = comiteData.Membres.find((m: any) => m.MembreId === membreId);

          if (membreDansComite) {
            fonctionsDuMembre.push({
              id: membreDansComite.Id,
              comiteId: comite.id,
              nomFonction: membreDansComite.NomFonction,
              fonctionId: membreDansComite.FonctionId,
              estResponsable: membreDansComite.NomFonction.toLowerCase().includes('président') ||
                             membreDansComite.NomFonction.toLowerCase().includes('responsable'),
              estActif: membreDansComite.IsActiveMembre,
              dateNomination: new Date().toISOString(),
              mandatAnnee: new Date().getFullYear()
            });
          }
        } catch (error) {
          console.warn(`⚠️ Erreur lors de la récupération des membres du comité ${comite.id}:`, error);
        }
      }

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
          nomFonction: 'Président',
          estResponsable: true,
          estActif: true,
          dateNomination: '2024-07-01',
          mandatAnnee: 2024
        }
      ],
      '0cbfc6d5-18a9-4b35-a82e-81b62fa2bcf5': [ // Jean-Baptiste Kouamé
        {
          comiteId: 'comite-3',
          nomFonction: 'Vice-Président',
          estResponsable: true,
          estActif: true,
          dateNomination: '2024-07-01',
          mandatAnnee: 2024
        }
      ],
      'fd503d4e-f59a-42b1-b9ea-703bf82faeb3': [ // Paul Gnangnan
        {
          comiteId: 'comite-3',
          nomFonction: 'Trésorier',
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
      console.log(`🚀 DÉBUT getAllMembersFunctionsCommissions pour club: ${clubId}`);
      const token = await this.getToken();
      if (!token) {
        console.log('⚠️ Token manquant pour fonctions/commissions membres');
        return null;
      }

      const url = `${API_CONFIG.BASE_URL}${API_CONFIG.API_PREFIX}/clubs/${clubId}/membres/fonctions-commissions`;
      console.log(`🔄 Chargement fonctions/commissions tous membres:`, url);
      console.log(`🔑 Token présent: ${token ? 'OUI' : 'NON'}`);

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'ngrok-skip-browser-warning': 'true',
        },
      });

      console.log(`📡 Réponse HTTP: ${response.status} ${response.statusText}`);

      if (!response.ok) {
        if (response.status === 404) {
          console.log(`📋 Endpoint fonctions/commissions non trouvé (404) - utilisation fallback`);
          return null;
        }
        console.log(`❌ Erreur HTTP ${response.status}: ${response.statusText}`);
        throw new Error(`Erreur HTTP: ${response.status}`);
      }

      const data = await response.json();
      const membres = data.membres || data.Membres;
      console.log(`✅ Fonctions/commissions reçues:`, membres ? membres.length : 'Format inattendu');
      console.log(`📊 Structure complète des données:`, JSON.stringify(data, null, 2));
      console.log(`📊 Statistiques globales:`, data.statistiques || data.Statistiques);
      console.log(`🔍 Premier membre exemple:`, membres && membres.length > 0 ? JSON.stringify(membres[0], null, 2) : 'Aucun membre');
      return data;
    } catch (error) {
      console.error(`❌ ERREUR getAllMembersFunctionsCommissions:`, error);
      console.error(`❌ Type d'erreur:`, typeof error);
      console.error(`❌ Message:`, error instanceof Error ? error.message : 'Erreur inconnue');
      return null;
    }
  }

  async loadMemberFunctionsAndCommissions(clubId: string, members: any[]): Promise<any[]> {
    console.log('🚨🚨🚨 DEBUT LOAD MEMBER FUNCTIONS AND COMMISSIONS 🚨🚨🚨');
    console.log('🔄 Chargement fonctions et commissions pour tous les membres...');
    console.log(`📊 Nombre de membres à enrichir: ${members.length}`);

    // Essayer d'utiliser le nouvel endpoint optimisé d'abord
    console.log('🚨 AVANT APPEL getAllMembersFunctionsCommissions');
    const apiData = await this.getAllMembersFunctionsCommissions(clubId);
    console.log('🚨 APRÈS APPEL getAllMembersFunctionsCommissions');
    console.log('🔍 Réponse API getAllMembersFunctionsCommissions:', apiData ? 'Données reçues' : 'Null/undefined');

    if (apiData && (apiData.membres || apiData.Membres)) {
      console.log('✅ Utilisation de l\'endpoint optimisé /membres/fonctions-commissions');

      // Utiliser la bonne propriété (membres ou Membres selon la réponse)
      const apiMembers = apiData.membres || apiData.Membres;
      console.log(`📊 Nombre de membres dans l'API: ${apiMembers.length}`);

      // Enrichir les membres existants avec les données de l'API
      const enrichedMembers = members.map((member) => {
        // Trouver les données correspondantes dans la réponse API
        const apiMember = apiMembers.find((m: any) => m.membreId === member.id || m.MembreId === member.id);

        if (apiMember) {
          console.log(`🔍 Données API pour ${member.fullName}:`, JSON.stringify(apiMember, null, 2));

          // Mapper la fonction (une seule) au format attendu par l'interface
          const fonction = apiMember.fonction || apiMember.Fonction;
          const mappedFonctions = fonction ? [{
            fonctionId: fonction.fonctionId || fonction.FonctionId,
            nomFonction: (fonction.nomFonction || fonction.NomFonction || '').trim(),
            estResponsable: (fonction.nomFonction || fonction.NomFonction || '').toLowerCase().includes('président') ||
                           (fonction.nomFonction || fonction.NomFonction || '').toLowerCase().includes('responsable'),
            estActif: true,
            dateNomination: new Date().toISOString(),
            mandatAnnee: (apiData.mandatActuel || apiData.MandatActuel)?.annee || (apiData.mandatActuel || apiData.MandatActuel)?.Annee
          }] : [];

          // Mapper les commissions au format attendu par l'interface
          const commissions = apiMember.commissions || apiMember.Commissions || [];
          const mappedCommissions = commissions.map((c: any) => ({
            commissionId: c.commissionId || c.CommissionId,
            commissionNom: (c.nomCommission || c.NomCommission || '').trim(),
            estResponsable: c.estResponsable || c.EstResponsable,
            estActif: true,
            dateNomination: c.dateNomination || c.DateNomination,
            mandatAnnee: (apiData.mandatActuel || apiData.MandatActuel)?.annee || (apiData.mandatActuel || apiData.MandatActuel)?.Annee
          }));

          console.log(`✅ Membre ${member.fullName}: ${mappedFonctions.length} fonction, ${mappedCommissions.length} commissions`);
          if (mappedFonctions.length > 0) {
            console.log(`  - Fonction: ${mappedFonctions[0].nomFonction}`);
          }
          if (mappedCommissions.length > 0) {
            console.log(`  - Commissions: ${mappedCommissions.map(c => c.commissionNom).join(', ')}`);
          }

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

      console.log('✅ Enrichissement des membres terminé (avec endpoint optimisé)');
      return enrichedMembers;
    } else {
      // Fallback vers les endpoints individuels des comités
      console.log('⚠️ Endpoint optimisé non disponible - utilisation des endpoints comités individuels');
      console.log('🔄 Début du fallback avec endpoints individuels...');

      const enrichedMembers = await Promise.all(
        members.map(async (member) => {
          console.log(`📋 Traitement membre: ${member.fullName}`);

          // Charger les fonctions via les comités
          const fonctions = await this.getMemberComiteFunctions(clubId, member.id);

          // Charger les commissions
          const commissions = await this.getMemberCommissions(clubId, member.id);

          // Mapper au format attendu par l'interface
          const mappedFonctions = fonctions.map(f => ({
            comiteId: f.comiteId,
            nomFonction: f.nomFonction,
            estResponsable: f.estResponsable,
            estActif: f.estActif,
            dateNomination: f.dateNomination,
            mandatAnnee: f.mandatAnnee
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

      console.log('✅ Enrichissement des membres terminé (avec endpoints individuels)');
      return enrichedMembers;
    }
  }
}

export const memberFunctionsService = new MemberFunctionsService();
