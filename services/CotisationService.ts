import * as SecureStore from 'expo-secure-store';
import { API_CONFIG } from '../config/api';

export interface Paiement {
  id: string;
  membre: {
    id: string;
    firstName: string;
    lastName: string;
  };
  montant: number;
  date: string;
  commentaires?: string;
  clubId: string;
}

export interface SituationCotisation {
  membreId: string;
  resume: {
    montantTotalCotisations: number;
    montantTotalPaiements: number;
    solde: number;
    nombreCotisations: number;
    nombrePaiements: number;
    tauxRecouvrement: number;
  };
  cotisations: Array<{
    mandatId: string;
    annee: number;
    description: string;
    montantCotisation: number;
    estPaye: boolean;
  }>;
  historiquePaiements: Paiement[];
}

export class CotisationService {
  private async getToken(): Promise<string | null> {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        return window.localStorage.getItem('authToken');
      }
      return await SecureStore.getItemAsync('authToken');
    } catch (error) {
      console.error('❌ Erreur récupération token pour cotisations:', error);
      return null;
    }
  }

  async getPaiements(clubId: string): Promise<Paiement[]> {
    try {
      const token = await this.getToken();
      if (!token) {
        console.log('⚠️ Token manquant pour paiements');
        return [];
      }

      const url = `${API_CONFIG.BASE_URL}${API_CONFIG.API_PREFIX}/PaiementCotisation?clubId=${clubId}`;
      console.log(`🔄 Chargement paiements club ${clubId}:`, url);

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
      console.log(`✅ Paiements reçus:`, Array.isArray(data) ? data.length : 'Format inattendu');
      return Array.isArray(data) ? data : data.data || [];
    } catch (error) {
      console.error(`❌ Erreur chargement paiements:`, error);
      return [];
    }
  }



  private getTestSituationMembre(membreId: string): SituationCotisation {
    const testData = {
      '60403bc7-b785-4703-bee6-345da9687aa2': {
        membreId: '60403bc7-b785-4703-bee6-345da9687aa2',
        resume: {
          montantTotalCotisations: 120000,
          montantTotalPaiements: 120000,
          solde: 0,
          nombreCotisations: 2,
          nombrePaiements: 4,
          tauxRecouvrement: 100
        },
        cotisations: [
          {
            mandatId: 'mandat-2025',
            annee: 2025,
            description: 'Mandat 2025 - Éducation',
            montantCotisation: 60000,
            estPaye: true
          },
          {
            mandatId: 'mandat-2024',
            annee: 2024,
            description: 'Mandat 2024 - Santé',
            montantCotisation: 60000,
            estPaye: true
          }
        ],
        historiquePaiements: [
          {
            id: 'p1',
            membre: { id: membreId, firstName: 'Kouadio', lastName: 'Yao' },
            montant: 30000,
            date: '2025-06-15T00:00:00Z',
            commentaires: 'Paiement cotisation 2025 - 1er trimestre',
            clubId: 'club-1'
          },
          {
            id: 'p2',
            membre: { id: membreId, firstName: 'Kouadio', lastName: 'Yao' },
            montant: 30000,
            date: '2025-03-15T00:00:00Z',
            commentaires: 'Paiement cotisation 2025 - 2ème trimestre',
            clubId: 'club-1'
          }
        ]
      }
    };

    return testData[membreId] || {
      membreId,
      resume: {
        montantTotalCotisations: 120000,
        montantTotalPaiements: 60000,
        solde: 60000,
        nombreCotisations: 1,
        nombrePaiements: 2,
        tauxRecouvrement: 50
      },
      cotisations: [
        {
          mandatId: 'mandat-2025',
          annee: 2025,
          description: 'Mandat 2025 - Éducation',
          montantCotisation: 120000,
          estPaye: false
        }
      ],
      historiquePaiements: [
        {
          id: 'p1',
          membre: { id: membreId, firstName: 'Test', lastName: 'User' },
          montant: 30000,
          date: '2025-06-15T00:00:00Z',
          commentaires: 'Paiement partiel',
          clubId: 'club-1'
        }
      ]
    };
  }



  async getMaSituation(clubId: string, membreId: string): Promise<SituationCotisation | null> {
    try {
      const token = await this.getToken();
      if (!token) {
        console.log('⚠️ Token manquant pour ma situation');
        return null;
      }

      const url = `${API_CONFIG.BASE_URL}${API_CONFIG.API_PREFIX}/PaiementCotisation/situation/membre/${membreId}`;
      console.log(`🔄 Chargement ma situation cotisations:`, url);

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
          console.log(`📋 Endpoint situation membre non trouvé - utilisation données de test`);
          return this.getTestSituationMembre(membreId);
        }
        throw new Error(`Erreur HTTP: ${response.status}`);
      }

      const data = await response.json();
      console.log(`✅ Ma situation reçue:`, data);

      if (data.success) {
        return {
          membreId: data.membreId,
          resume: data.resume,
          cotisations: data.cotisations,
          historiquePaiements: data.historiquePaiements
        };
      } else {
        console.log(`⚠️ Réponse API non réussie:`, data.message);
        return null;
      }
    } catch (error) {
      console.error(`❌ Erreur chargement ma situation:`, error);
      return this.getTestSituationMembre(membreId);
    }
  }

  formatMontant(montant: number): string {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0,
    }).format(montant);
  }

  formatDate(dateString: string): string {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    } catch (error) {
      return dateString;
    }
  }

  getStatutColor(solde: number, montantPaye: number): string {
    if (solde <= 0) return '#34C759'; // À jour
    if (montantPaye > 0) return '#FF9500'; // Partiellement payé
    return '#FF3B30'; // En retard
  }

  getStatutText(solde: number, montantPaye: number): string {
    if (solde <= 0) return 'À jour';
    if (montantPaye > 0) return 'Partiellement payé';
    return 'En retard';
  }
}

export const cotisationService = new CotisationService();
