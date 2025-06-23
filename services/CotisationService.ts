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
  nomComplet: string;
  montantTotalCotisations: number;
  montantTotalPaiements: number;
  solde: number;
  statut: string;
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

  async getSituationMembresClub(clubId: string): Promise<SituationCotisation[]> {
    try {
      const token = await this.getToken();
      if (!token) {
        console.log('⚠️ Token manquant pour situation cotisations');
        return [];
      }

      const url = `${API_CONFIG.BASE_URL}${API_CONFIG.API_PREFIX}/Cotisation/situation/club/${clubId}/membres`;
      console.log(`🔄 Chargement situation cotisations club ${clubId}:`, url);

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
          console.log(`📋 Endpoint situation cotisations non trouvé - utilisation données de test`);
          return this.getTestSituationCotisations();
        }
        throw new Error(`Erreur HTTP: ${response.status}`);
      }

      const data = await response.json();
      console.log(`✅ Situation cotisations reçue:`, data.membres ? data.membres.length : 'Format inattendu');
      return data.membres || [];
    } catch (error) {
      console.error(`❌ Erreur chargement situation cotisations:`, error);
      return this.getTestSituationCotisations();
    }
  }

  private getTestSituationCotisations(): SituationCotisation[] {
    return [
      {
        membreId: '60403bc7-b785-4703-bee6-345da9687aa2',
        nomComplet: 'Kouadio Yao',
        montantTotalCotisations: 120000,
        montantTotalPaiements: 120000,
        solde: 0,
        statut: 'À jour'
      },
      {
        membreId: '0cbfc6d5-18a9-4b35-a82e-81b62fa2bcf5',
        nomComplet: 'Jean-Baptiste Kouamé',
        montantTotalCotisations: 120000,
        montantTotalPaiements: 60000,
        solde: 60000,
        statut: 'Partiellement payé'
      },
      {
        membreId: 'fd503d4e-f59a-42b1-b9ea-703bf82faeb3',
        nomComplet: 'Paul Gnangnan',
        montantTotalCotisations: 120000,
        montantTotalPaiements: 0,
        solde: 120000,
        statut: 'En retard'
      }
    ];
  }

  async getMesPaiements(clubId: string, membreId: string): Promise<Paiement[]> {
    try {
      // Récupérer tous les paiements du club
      const tousPaiements = await this.getPaiements(clubId);
      
      // Filtrer pour le membre connecté
      const mesPaiements = tousPaiements.filter(p => p.membre.id === membreId);
      
      console.log(`✅ Mes paiements trouvés: ${mesPaiements.length}`);
      return mesPaiements;
    } catch (error) {
      console.error(`❌ Erreur chargement mes paiements:`, error);
      return [];
    }
  }

  async getMaSituation(clubId: string, membreId: string): Promise<SituationCotisation | null> {
    try {
      // Récupérer la situation de tous les membres
      const situations = await this.getSituationMembresClub(clubId);
      
      // Trouver ma situation
      const maSituation = situations.find(s => s.membreId === membreId);
      
      if (maSituation) {
        console.log(`✅ Ma situation trouvée:`, maSituation);
        return maSituation;
      } else {
        console.log(`⚠️ Situation non trouvée pour membre ${membreId}`);
        return null;
      }
    } catch (error) {
      console.error(`❌ Erreur chargement ma situation:`, error);
      return null;
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

  getStatutColor(statut: string): string {
    switch (statut.toLowerCase()) {
      case 'à jour':
        return '#34C759';
      case 'partiellement payé':
        return '#FF9500';
      case 'en retard':
        return '#FF3B30';
      default:
        return '#8E8E93';
    }
  }
}

export const cotisationService = new CotisationService();
