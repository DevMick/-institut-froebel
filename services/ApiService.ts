import * as SecureStore from 'expo-secure-store';
import { API_CONFIG } from '../config/api';
import { User, Club, Member, Reunion, ApiResponse, LoginData } from '../types';

export class ApiService {
  private async getToken(): Promise<string | null> {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        return window.localStorage.getItem('authToken');
      }
      return await SecureStore.getItemAsync('authToken');
    } catch (error) {
      console.error('Erreur lors de la récupération du token:', error);
      if (typeof window !== 'undefined' && window.localStorage) {
        return window.localStorage.getItem('authToken');
      }
      return null;
    }
  }

  private async setToken(token: string): Promise<void> {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem('authToken', token);
        return;
      }
      await SecureStore.setItemAsync('authToken', token);
    } catch (error) {
      console.error('Erreur lors de la sauvegarde du token:', error);
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem('authToken', token);
      }
    }
  }

  private async removeToken(): Promise<void> {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.removeItem('authToken');
        return;
      }
      await SecureStore.deleteItemAsync('authToken');
    } catch (error) {
      console.error('Erreur lors de la suppression du token:', error);
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.removeItem('authToken');
      }
    }
  }

  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const token = await this.getToken();
      const url = `${API_CONFIG.BASE_URL}${API_CONFIG.API_PREFIX}${endpoint}`;

      const headers: HeadersInit = {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'ngrok-skip-browser-warning': 'true',
        ...options.headers,
      };

      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(url, {
        ...options,
        headers,
      });

      if (!response.ok) {
        if (response.status === 401) {
          await this.removeToken();
          throw new Error('Session expirée. Veuillez vous reconnecter.');
        }
        throw new Error(`Erreur HTTP: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Erreur API:', error);
      throw error;
    }
  }

  async login(loginData: LoginData): Promise<User> {
    try {
      const url = `${API_CONFIG.BASE_URL}${API_CONFIG.API_PREFIX}/Auth/login`;
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'ngrok-skip-browser-warning': 'true',
        },
        body: JSON.stringify(loginData),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Erreur ${response.status}: ${errorText}`);
      }

      const result = await response.json();

      if (result.token) {
        await this.setToken(result.token);

        try {
          console.log('🔄 Tentative de récupération du profil utilisateur...');
          const profile = await this.getCurrentUser();
          console.log('✅ Profil utilisateur récupéré:', profile);
          return profile;
        } catch (error) {
          console.log('⚠️ Erreur récupération profil utilisateur:', error);

          // Essayer de récupérer le nom depuis la réponse de login si disponible
          let firstName = 'Utilisateur';
          let lastName = 'Connecté';
          let fullName = 'Utilisateur Connecté';

          // Les données sont dans result directement, pas dans result.user
          if (result.firstName || result.lastName) {
            firstName = result.firstName || firstName;
            lastName = result.lastName || lastName;
            fullName = result.fullName || `${firstName} ${lastName}`;
          }

          console.log('🔄 Utilisation des données de fallback:', { firstName, lastName, fullName });

          return {
            id: result.userId || 'user-id',
            email: loginData.email,
            firstName,
            lastName,
            fullName,
            clubId: loginData.clubId
          };
        }
      }

      throw new Error(result.message || result.Message || 'Erreur de connexion');
    } catch (error) {
      console.error('Erreur lors du login:', error);
      throw error;
    }
  }

  async getCurrentUser(): Promise<User> {
    console.log('🔄 getCurrentUser: Tentative avec /Auth/me...');
    try {
      const response = await this.makeRequest<any>('/Auth/me');
      console.log('📥 Réponse /Auth/me:', response);
      if (response.success && response.user) {
        console.log('✅ getCurrentUser: Succès avec /Auth/me');
        // Construire fullName s'il n'existe pas
        const user = response.user;
        if (!user.fullName && user.firstName && user.lastName) {
          user.fullName = `${user.firstName} ${user.lastName}`;
        }
        console.log('🔍 Utilisateur final avec fullName:', { firstName: user.firstName, lastName: user.lastName, fullName: user.fullName });
        return user;
      }
    } catch (error) {
      console.log('❌ getCurrentUser: Erreur avec /Auth/me:', error);
      console.log('🔄 getCurrentUser: Tentative avec /Auth/getCurrentProfile...');
    }

    try {
      const response = await this.makeRequest<User>('/Auth/getCurrentProfile');
      console.log('📥 Réponse /Auth/getCurrentProfile:', response);
      if (response) {
        console.log('✅ getCurrentUser: Succès avec /Auth/getCurrentProfile');
        return response;
      }
    } catch (error) {
      console.log('❌ getCurrentUser: Erreur avec /Auth/getCurrentProfile:', error);
    }

    console.log('❌ getCurrentUser: Toutes les tentatives ont échoué');
    throw new Error('Impossible de récupérer les informations utilisateur');
  }

  async getClubs(): Promise<Club[]> {
    try {
      const url = `${API_CONFIG.BASE_URL}/api/Clubs`;
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true',
          'User-Agent': 'RotaryClubMobile/1.0',
          'Origin': 'https://snack.expo.dev',
        },
      });

      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }

      const data = await response.json();
      return Array.isArray(data) ? data : data.data || [];
    } catch (error) {
      console.error('Erreur chargement clubs:', error);
      console.log('🔄 Utilisation des données de démonstration pour les clubs');
      
      // Données de démonstration pour les clubs
      const demoClubs: Club[] = [
        {
          id: 'club-1',
          name: 'Rotary Club Paris Centre',
          city: 'Paris',
          country: 'France',
          district: '1660',
          president: 'Jean Dupont',
          secretary: 'Marie Martin',
          treasurer: 'Pierre Durand',
          membersCount: 45,
          foundedYear: 1920,
          meetingDay: 'Mardi',
          meetingTime: '19:00',
          meetingLocation: 'Hôtel de Ville, Paris',
          email: 'paris.centre@rotary.fr',
          phone: '+33 1 42 60 00 00',
          website: 'https://rotarypariscentre.fr',
          description: 'Club Rotary historique du centre de Paris, engagé dans des projets humanitaires locaux et internationaux.'
        },
        {
          id: 'club-2',
          name: 'Rotary Club Lyon Confluence',
          city: 'Lyon',
          country: 'France',
          district: '1710',
          president: 'Sophie Bernard',
          secretary: 'Lucas Moreau',
          treasurer: 'Emma Petit',
          membersCount: 38,
          foundedYear: 1985,
          meetingDay: 'Jeudi',
          meetingTime: '19:30',
          meetingLocation: 'Hôtel de la Confluence, Lyon',
          email: 'lyon.confluence@rotary.fr',
          phone: '+33 4 72 00 00 00',
          website: 'https://rotarylyonconfluence.fr',
          description: 'Club moderne de Lyon, spécialisé dans les projets environnementaux et l\'innovation sociale.'
        },
        {
          id: 'club-3',
          name: 'Rotary Club Marseille Provence',
          city: 'Marseille',
          country: 'France',
          district: '1730',
          president: 'Antoine Roux',
          secretary: 'Camille Dubois',
          treasurer: 'Thomas Leroy',
          membersCount: 52,
          foundedYear: 1950,
          meetingDay: 'Lundi',
          meetingTime: '20:00',
          meetingLocation: 'Palais du Pharo, Marseille',
          email: 'marseille.provence@rotary.fr',
          phone: '+33 4 91 00 00 00',
          website: 'https://rotarymarseilleprovence.fr',
          description: 'Club dynamique de Marseille, actif dans les projets méditerranéens et la coopération internationale.'
        },
        {
          id: 'club-4',
          name: 'Rotary Club Bordeaux Aquitaine',
          city: 'Bordeaux',
          country: 'France',
          district: '1690',
          president: 'Isabelle Mercier',
          secretary: 'Nicolas Blanc',
          treasurer: 'Julie Rousseau',
          membersCount: 41,
          foundedYear: 1975,
          meetingDay: 'Mercredi',
          meetingTime: '19:00',
          meetingLocation: 'Château de Bordeaux',
          email: 'bordeaux.aquitaine@rotary.fr',
          phone: '+33 5 56 00 00 00',
          website: 'https://rotarybordeauxaquitaine.fr',
          description: 'Club élégant de Bordeaux, engagé dans la culture, le vin et les échanges internationaux.'
        },
        {
          id: 'club-5',
          name: 'Rotary Club Toulouse Midi-Pyrénées',
          city: 'Toulouse',
          country: 'France',
          district: '1700',
          president: 'Marc Dubois',
          secretary: 'Anne-Marie Laurent',
          treasurer: 'François Moreau',
          membersCount: 47,
          foundedYear: 1960,
          meetingDay: 'Vendredi',
          meetingTime: '19:30',
          meetingLocation: 'Cité de l\'Espace, Toulouse',
          email: 'toulouse.midipyrenees@rotary.fr',
          phone: '+33 5 61 00 00 00',
          website: 'https://rotarytoulousemidipyrenees.fr',
          description: 'Club innovant de Toulouse, spécialisé dans l\'aéronautique et les technologies spatiales.'
        }
      ];
      
      return demoClubs;
    }
  }

  async getClubMembers(clubId: string): Promise<Member[]> {
    try {
      const url = `${API_CONFIG.BASE_URL}${API_CONFIG.API_PREFIX}/Auth/club/${clubId}/members`;
      const token = await this.getToken();
      
      if (!token) {
        throw new Error('Token d\'authentification manquant');
      }

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'ngrok-skip-browser-warning': 'true',
          'User-Agent': 'RotaryClubMobile/1.0',
          'Origin': 'https://snack.expo.dev',
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          await this.removeToken();
          throw new Error('Session expirée. Veuillez vous reconnecter.');
        }
        const errorText = await response.text();
        throw new Error(`Erreur ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      console.log('📊 Données brutes reçues de l\'API membres:', JSON.stringify(data, null, 2));

      const members = Array.isArray(data) ? data : data.data || data.members || [];
      console.log('👥 Membres après traitement:', members.length);

      if (members.length > 0) {
        console.log('🔍 Premier membre API (structure):', JSON.stringify(members[0], null, 2));

        // Vérifier spécifiquement les fonctions et commissions
        members.forEach((member, index) => {
          console.log(`📋 Membre ${index + 1} API: ${member.fullName || member.firstName + ' ' + member.lastName}`);
          console.log(`  - Propriété 'fonctions':`, member.fonctions ? 'Présente' : 'Absente');
          console.log(`  - Propriété 'commissions':`, member.commissions ? 'Présente' : 'Absente');
          console.log(`  - Toutes les propriétés:`, Object.keys(member));
        });
      }

      return members;
    } catch (error) {
      console.error('Erreur chargement membres:', error);
      console.log('🔄 Utilisation des données de démonstration pour les membres');
      
      // Données de démonstration pour les membres
      const demoMembers: Member[] = [
        {
          id: 'member-1',
          firstName: 'Jean',
          lastName: 'Dupont',
          fullName: 'Jean Dupont',
          email: 'jean.dupont@email.com',
          phone: '+33 6 12 34 56 78',
          role: 'president',
          status: 'active',
          joinDate: '2020-01-15',
          clubId: clubId,
          avatar: null,
          fonctions: [
            { id: '1', name: 'Président', startDate: '2024-01-01', endDate: '2024-12-31' },
            { id: '2', name: 'Trésorier', startDate: '2023-01-01', endDate: '2023-12-31' }
          ],
          commissions: [
            { id: '1', name: 'Commission Internationale', role: 'Membre' },
            { id: '2', name: 'Commission Jeunesse', role: 'Responsable' }
          ]
        },
        {
          id: 'member-2',
          firstName: 'Marie',
          lastName: 'Martin',
          fullName: 'Marie Martin',
          email: 'marie.martin@email.com',
          phone: '+33 6 23 45 67 89',
          role: 'secretary',
          status: 'active',
          joinDate: '2019-03-20',
          clubId: clubId,
          avatar: null,
          fonctions: [
            { id: '3', name: 'Secrétaire', startDate: '2024-01-01', endDate: '2024-12-31' }
          ],
          commissions: [
            { id: '3', name: 'Commission Communication', role: 'Membre' }
          ]
        },
        {
          id: 'member-3',
          firstName: 'Pierre',
          lastName: 'Durand',
          fullName: 'Pierre Durand',
          email: 'pierre.durand@email.com',
          phone: '+33 6 34 56 78 90',
          role: 'treasurer',
          status: 'active',
          joinDate: '2018-06-10',
          clubId: clubId,
          avatar: null,
          fonctions: [
            { id: '4', name: 'Trésorier', startDate: '2024-01-01', endDate: '2024-12-31' }
          ],
          commissions: [
            { id: '4', name: 'Commission Finances', role: 'Responsable' }
          ]
        },
        {
          id: 'member-4',
          firstName: 'Sophie',
          lastName: 'Bernard',
          fullName: 'Sophie Bernard',
          email: 'sophie.bernard@email.com',
          phone: '+33 6 45 67 89 01',
          role: 'member',
          status: 'active',
          joinDate: '2021-09-05',
          clubId: clubId,
          avatar: null,
          fonctions: [],
          commissions: [
            { id: '5', name: 'Commission Environnement', role: 'Membre' },
            { id: '6', name: 'Commission Sociale', role: 'Membre' }
          ]
        },
        {
          id: 'member-5',
          firstName: 'Lucas',
          lastName: 'Moreau',
          fullName: 'Lucas Moreau',
          email: 'lucas.moreau@email.com',
          phone: '+33 6 56 78 90 12',
          role: 'member',
          status: 'active',
          joinDate: '2022-02-15',
          clubId: clubId,
          avatar: null,
          fonctions: [],
          commissions: [
            { id: '7', name: 'Commission Jeunesse', role: 'Membre' }
          ]
        },
        {
          id: 'member-6',
          firstName: 'Emma',
          lastName: 'Petit',
          fullName: 'Emma Petit',
          email: 'emma.petit@email.com',
          phone: '+33 6 67 89 01 23',
          role: 'member',
          status: 'active',
          joinDate: '2020-11-30',
          clubId: clubId,
          avatar: null,
          fonctions: [],
          commissions: [
            { id: '8', name: 'Commission Culture', role: 'Responsable' }
          ]
        },
        {
          id: 'member-7',
          firstName: 'Antoine',
          lastName: 'Roux',
          fullName: 'Antoine Roux',
          email: 'antoine.roux@email.com',
          phone: '+33 6 78 90 12 34',
          role: 'member',
          status: 'active',
          joinDate: '2019-08-12',
          clubId: clubId,
          avatar: null,
          fonctions: [],
          commissions: [
            { id: '9', name: 'Commission Sport', role: 'Membre' }
          ]
        },
        {
          id: 'member-8',
          firstName: 'Camille',
          lastName: 'Dubois',
          fullName: 'Camille Dubois',
          email: 'camille.dubois@email.com',
          phone: '+33 6 89 01 23 45',
          role: 'member',
          status: 'active',
          joinDate: '2021-04-18',
          clubId: clubId,
          avatar: null,
          fonctions: [],
          commissions: [
            { id: '10', name: 'Commission Santé', role: 'Membre' }
          ]
        }
      ];
      
      return demoMembers;
    }
  }

  async getClubReunions(clubId: string): Promise<Reunion[]> {
    try {
      console.log('🔄 Chargement réunions pour club:', clubId);
      const url = `${API_CONFIG.BASE_URL}${API_CONFIG.API_PREFIX}/clubs/${clubId}/reunions`;
      const token = await this.getToken();

      if (!token) {
        throw new Error('Token d\'authentification manquant');
      }

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'ngrok-skip-browser-warning': 'true',
          'User-Agent': 'RotaryClubMobile/1.0',
          'Origin': 'https://snack.expo.dev',
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          await this.removeToken();
          throw new Error('Session expirée. Veuillez vous reconnecter.');
        }
        throw new Error(`Erreur HTTP: ${response.status}`);
      }

      const data = await response.json();
      console.log('✅ Réunions chargées:', Array.isArray(data) ? data.length : 'Format inattendu');
      return Array.isArray(data) ? data : data.data || [];
    } catch (error) {
      console.error('❌ Erreur chargement réunions:', error);
      console.log('🔄 Utilisation des données de démonstration pour les réunions');
      
      // Données de démonstration pour les réunions
      const demoReunions: Reunion[] = [
        {
          id: 'reunion-1',
          title: 'Réunion hebdomadaire',
          description: 'Réunion hebdomadaire du club avec ordre du jour et discussions',
          date: '2024-12-19',
          time: '19:00',
          location: 'Hôtel de Ville, Salle des Fêtes',
          type: 'hebdomadaire',
          status: 'scheduled',
          participantsCount: 35,
          maxParticipants: 50,
          clubId: clubId,
          ordreJour: [
            'Accueil et présentation des nouveaux membres',
            'Rapport du président',
            'Présentation des projets en cours',
            'Discussion sur les événements à venir',
            'Questions diverses'
          ],
          rapport: null,
          qrCode: 'qr-code-reunion-1'
        },
        {
          id: 'reunion-2',
          title: 'Assemblée générale annuelle',
          description: 'Assemblée générale annuelle avec élection du nouveau bureau',
          date: '2024-04-15',
          time: '14:00',
          location: 'Grand Hôtel, Salle de Conférence',
          type: 'annuelle',
          status: 'scheduled',
          participantsCount: 42,
          maxParticipants: 60,
          clubId: clubId,
          ordreJour: [
            'Ouverture de l\'assemblée',
            'Rapport moral du président',
            'Rapport financier du trésorier',
            'Présentation des projets de l\'année',
            'Élection du nouveau bureau',
            'Clôture de l\'assemblée'
          ],
          rapport: null,
          qrCode: 'qr-code-reunion-2'
        },
        {
          id: 'reunion-3',
          title: 'Conférence sur l\'environnement',
          description: 'Conférence spéciale sur les enjeux environnementaux',
          date: '2024-01-25',
          time: '20:00',
          location: 'Auditorium Municipal',
          type: 'special',
          status: 'scheduled',
          participantsCount: 28,
          maxParticipants: 100,
          clubId: clubId,
          ordreJour: [
            'Introduction par le président',
            'Intervention de l\'expert environnemental',
            'Débat et questions',
            'Présentation des actions du club',
            'Cocktail de clôture'
          ],
          rapport: null,
          qrCode: 'qr-code-reunion-3'
        },
        {
          id: 'reunion-4',
          title: 'Réunion de commission jeunesse',
          description: 'Réunion de la commission jeunesse pour planifier les activités',
          date: '2024-01-30',
          time: '18:30',
          location: 'Salle de réunion du club',
          type: 'commission',
          status: 'scheduled',
          participantsCount: 12,
          maxParticipants: 20,
          clubId: clubId,
          ordreJour: [
            'Bilan des activités passées',
            'Présentation des nouveaux projets',
            'Planning des événements jeunesse',
            'Budget et ressources',
            'Prochaine réunion'
          ],
          rapport: null,
          qrCode: 'qr-code-reunion-4'
        }
      ];
      
      return demoReunions;
    }
  }

  async getReunionDetails(clubId: string, reunionId: string): Promise<Reunion> {
    try {
      console.log('🔄 Chargement détails réunion:', reunionId);
      const url = `${API_CONFIG.BASE_URL}${API_CONFIG.API_PREFIX}/clubs/${clubId}/reunions/${reunionId}`;
      const token = await this.getToken();

      if (!token) {
        throw new Error('Token d\'authentification manquant');
      }

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'ngrok-skip-browser-warning': 'true',
          'User-Agent': 'RotaryClubMobile/1.0',
          'Origin': 'https://snack.expo.dev',
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          await this.removeToken();
          throw new Error('Session expirée. Veuillez vous reconnecter.');
        }
        throw new Error(`Erreur HTTP: ${response.status}`);
      }

      const data = await response.json();
      console.log('✅ Détails réunion chargés:', data);
      return data;
    } catch (error) {
      console.error('❌ Erreur chargement détails réunion:', error);
      throw error;
    }
  }

  async logout(): Promise<void> {
    await this.removeToken();
  }
}
