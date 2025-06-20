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
      // Utiliser la même méthode que ApiService
      const AsyncStorage = require('@react-native-async-storage/async-storage').default;
      const token = await AsyncStorage.getItem('authToken');
      console.log('🔑 Token récupéré pour rapports:', token ? 'Présent' : 'Absent');
      return token;
    } catch (error) {
      console.error('❌ Erreur récupération token pour rapports:', error);
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

  async getAllRapportsForReunion(clubId: string, reunionId: string, ordresDuJour: any[]): Promise<{ordresAvecContenu: any[], diversExistant: string}> {
    console.log('=== DÉBUT CHARGEMENT COMPTE-RENDU ===');
    console.log('🔄 Chargement de tous les rapports pour la réunion:', reunionId);
    console.log('📋 Ordres du jour à traiter:', ordresDuJour.length);

    const ordresAvecContenu = [];
    let diversExistant = '';

    for (let i = 0; i < ordresDuJour.length; i++) {
      const ordre = ordresDuJour[i];
      console.log(`Chargement contenu pour ordre ${i + 1}: ${ordre.description} (ID: ${ordre.id})`);

      try {
        // Utiliser le service pour récupérer les rapports
        const rapportsResponse = await this.getRapports(clubId, reunionId, ordre.id);

        console.log(`Rapports reçus pour ordre ${i + 1}:`, rapportsResponse);

        let contenuOrdre = '';

        // Extraire le contenu du premier rapport avec du texte
        if (rapportsResponse.success && rapportsResponse.rapports && rapportsResponse.rapports.length > 0) {
          console.log(`📊 ${rapportsResponse.rapports.length} rapport(s) trouvé(s) pour ordre ${i + 1}`);

          const rapportTexte = rapportsResponse.rapports.find(r => r.texte && r.texte.trim());
          if (rapportTexte) {
            contenuOrdre = rapportTexte.texte;
            console.log(`✅ Contenu trouvé pour ordre ${i + 1}:`, contenuOrdre.substring(0, 100) + '...');
          } else {
            console.log(`⚠️ Aucun rapport avec texte pour ordre ${i + 1}`);
          }

          // Extraire les points divers (une seule fois)
          if (!diversExistant) {
            const rapportDivers = rapportsResponse.rapports.find(r => r.divers && r.divers.trim());
            if (rapportDivers) {
              diversExistant = rapportDivers.divers;
              console.log('✅ Points divers trouvés:', diversExistant.substring(0, 100) + '...');
            }
          }
        } else if (!rapportsResponse.success) {
          console.log(`❌ Échec de récupération des rapports pour ordre ${i + 1}:`, rapportsResponse.message);
        } else {
          console.log(`⚠️ Aucun rapport trouvé pour ordre ${i + 1}`);
        }

        ordresAvecContenu.push({
          numero: i + 1,
          id: ordre.id,
          description: ordre.description,
          contenu: contenuOrdre,
          hasContent: !!contenuOrdre.trim()
        });

      } catch (rapportError) {
        console.error(`❌ Erreur pour ordre ${i + 1}:`, rapportError);
        // En cas d'erreur, ajouter l'ordre sans contenu
        ordresAvecContenu.push({
          numero: i + 1,
          id: ordre.id,
          description: ordre.description,
          contenu: '',
          hasContent: false
        });
      }
    }

    console.log('=== COMPTE-RENDU COMPLET CONSTRUIT ===');
    console.log('✅ Tous les rapports chargés:', {
      totalOrdres: ordresAvecContenu.length,
      ordresAvecContenu: ordresAvecContenu.filter(o => o.hasContent).length,
      diversExistant: diversExistant.length > 0
    });

    return {
      ordresAvecContenu: ordresAvecContenu,
      diversExistant: diversExistant
    };
  }
}
