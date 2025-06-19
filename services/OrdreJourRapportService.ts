import { API_CONFIG } from '../config/api';

export interface RapportOrdreJour {
  id: string;
  ordreJourId: string;
  texte: string;
  divers?: string;
  dateCreation: string;
  auteurId: string;
  auteurNom: string;
}

export interface RapportsResponse {
  rapports: RapportOrdreJour[];
  success: boolean;
  message?: string;
}

export class OrdreJourRapportService {
  private async getToken(): Promise<string | null> {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        return window.localStorage.getItem('authToken');
      }
      // Fallback pour mobile
      const { default: SecureStore } = await import('expo-secure-store');
      return await SecureStore.getItemAsync('authToken');
    } catch (error) {
      console.error('Erreur récupération token:', error);
      return null;
    }
  }

  async getRapports(clubId: string, reunionId: string, ordreId: string): Promise<RapportsResponse> {
    try {
      const token = await this.getToken();
      if (!token) {
        throw new Error('Token d\'authentification manquant');
      }

      const url = `${API_CONFIG.BASE_URL}${API_CONFIG.API_PREFIX}/clubs/${clubId}/reunions/${reunionId}/ordres-du-jour/${ordreId}/rapports`;
      
      console.log(`🔄 Chargement rapports pour ordre ${ordreId}:`, url);

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
          // Pas de rapports pour cet ordre du jour
          return {
            rapports: [],
            success: true,
            message: 'Aucun rapport trouvé pour cet ordre du jour'
          };
        }
        throw new Error(`Erreur HTTP: ${response.status}`);
      }

      const data = await response.json();
      console.log(`✅ Rapports reçus pour ordre ${ordreId}:`, data);
      
      return {
        rapports: Array.isArray(data) ? data : data.rapports || [],
        success: true
      };
    } catch (error) {
      console.error(`❌ Erreur chargement rapports pour ordre ${ordreId}:`, error);
      return {
        rapports: [],
        success: false,
        message: error.message
      };
    }
  }

  async getAllRapportsForReunion(clubId: string, reunionId: string, ordresDuJour: any[]): Promise<any[]> {
    console.log('🔄 Chargement de tous les rapports pour la réunion:', reunionId);
    
    const ordresAvecContenu = [];
    let diversExistant = '';

    for (let i = 0; i < ordresDuJour.length; i++) {
      const ordre = ordresDuJour[i];
      console.log(`Chargement contenu pour ordre ${i + 1}: ${ordre.description || ordre.titre}`);
      
      try {
        const rapportsResponse = await this.getRapports(clubId, reunionId, ordre.id);
        
        let contenuOrdre = '';
        
        // Extraire le contenu du premier rapport avec du texte
        if (rapportsResponse.rapports && rapportsResponse.rapports.length > 0) {
          const rapportTexte = rapportsResponse.rapports.find(r => r.texte && r.texte.trim());
          if (rapportTexte) {
            contenuOrdre = rapportTexte.texte;
            console.log(`✅ Contenu trouvé pour ordre ${i + 1}:`, contenuOrdre.substring(0, 100) + '...');
          }
          
          // Extraire les points divers (une seule fois)
          if (!diversExistant) {
            const rapportDivers = rapportsResponse.rapports.find(r => r.divers && r.divers.trim());
            if (rapportDivers) {
              diversExistant = rapportDivers.divers;
              console.log('✅ Points divers trouvés:', diversExistant.substring(0, 100) + '...');
            }
          }
        }
        
        ordresAvecContenu.push({
          numero: i + 1,
          id: ordre.id,
          description: ordre.description || ordre.titre,
          contenu: contenuOrdre,
          hasContent: !!contenuOrdre.trim()
        });
        
      } catch (rapportError) {
        console.error(`❌ Erreur pour ordre ${i + 1}:`, rapportError);
        // En cas d'erreur, ajouter l'ordre sans contenu
        ordresAvecContenu.push({
          numero: i + 1,
          id: ordre.id,
          description: ordre.description || ordre.titre,
          contenu: '',
          hasContent: false
        });
      }
    }

    return {
      ordresAvecContenu: ordresAvecContenu,
      diversExistant: diversExistant
    };
  }
}
