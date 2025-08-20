// Configuration API pour l'application Rotary Club Mobile
export const API_CONFIG = {
  // Mode de développement - forcer les données de test
  FORCE_DEMO_MODE: true, // Forcé à true pour éviter les problèmes CORS dans Expo Snack
  
  // URLs de l'API
  LOCAL_URL: 'http://localhost:5265',
  NGROK_URL: 'https://12e4ccb02f26.ngrok-free.app',
  
  // Configuration par défaut
  API_PREFIX: '/api',
  TIMEOUT: 10000,
  
  // Headers par défaut
  DEFAULT_HEADERS: {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
    'ngrok-skip-browser-warning': 'true',
  }
};

// Données de test pour le mode démo
export const DEMO_DATA = {
  clubs: [
    {
      id: "d44c3871-c7b8-41c4-b2ba-870badc2ac0c",
      name: "Abidjan",
      dateCreation: "1956",
      numeroClub: 17150,
      numeroTelephone: "+225 0709487367",
      email: "rotary.abidjan@gmail.com",
      lieuReunion: "HOTEL TIAMA",
      jourReunion: "Lundi",
      heureReunion: "19:00:00",
      frequence: "1er et 3ème Lundi du mois",
      adresse: "HOTEL TIAMA, 04 Boulevard de la République, Plateau, Abidjan, Côte d'Ivoire"
    },
    {
      id: "e21e0b8e-1c0a-4023-92fd-f13feba01cab",
      name: "Abidjan Akwaba",
      dateCreation: "2011",
      numeroClub: 83890,
      numeroTelephone: "+225 21757365",
      email: "rotary.abidjanakwaba@gmail.com",
      lieuReunion: "HOTEL TIAMA PLATEAU",
      jourReunion: "Jeudi",
      heureReunion: "19:00:00",
      frequence: "1er et 3ème jeudi du mois",
      adresse: "HOTEL TIAMA PLATEAU, Boulevard de la République, 04 BP 643 Abidjan 04, Abidjan, Côte d'Ivoire"
    },
    {
      id: "1952fd39-f055-4286-ba0c-34a9f451d63d",
      name: "Abidjan Atlantis",
      dateCreation: "2001",
      numeroClub: 56045,
      numeroTelephone: "+225 0707755726",
      lieuReunion: "Hotel PULLMAN - Abidjan Plateau",
      jourReunion: "Lundi",
      heureReunion: "19:00:00",
      adresse: "Rue Abdoulaye Fadiga - Avenue Delafosse Prolongée, 01 BP 2185, Abidjan, 01, Côte d'Ivoire"
    },
    {
      id: "f5995d20-cb64-4de0-a731-1c857afcdcbd",
      name: "Abidjan-Bietry",
      dateCreation: "1992",
      numeroClub: 28697,
      numeroTelephone: "+225 2721756300",
      email: "secretariat@rotaryabidjanbietry.org",
      lieuReunion: "Hôtel Le Wafou",
      jourReunion: "Mardi",
      heureReunion: "19:00:00",
      frequence: "Hebdomadaire",
      adresse: "Hôtel Le Wafou, Zone 4 Biétry, Abidjan, Côte d'Ivoire"
    },
    {
      id: "3f1e03ce-c8db-4d40-a41b-d3fc1006846b",
      name: "Abidjan-Cocody",
      dateCreation: "1978",
      numeroClub: 17152,
      email: "rotaryclubabidjancocody@gmail.com",
      lieuReunion: "Sofitel Hôtel Ivoire",
      jourReunion: "Mercredi",
      heureReunion: "19:00:00",
      frequence: "Hebdomadaire",
      adresse: "Sofitel Hôtel Ivoire, Abidjan, Côte d'Ivoire"
    }
  ],
  
  members: [
    {
      id: 1,
      firstName: 'Jean',
      lastName: 'Dupont',
      email: 'jean.dupont@email.com',
      phone: '01 23 45 67 89',
      joinDate: '2020-01-15',
      status: 'Actif'
    },
    {
      id: 2,
      firstName: 'Marie',
      lastName: 'Martin',
      email: 'marie.martin@email.com',
      phone: '01 98 76 54 32',
      joinDate: '2019-03-20',
      status: 'Actif'
    },
    {
      id: 3,
      firstName: 'Pierre',
      lastName: 'Bernard',
      email: 'pierre.bernard@email.com',
      phone: '01 11 22 33 44',
      joinDate: '2021-06-10',
      status: 'Actif'
    }
  ],
  
  reunions: [
    {
      id: 1,
      title: 'Réunion mensuelle',
      date: '2024-01-15',
      time: '19:00',
      location: 'Salle de réunion',
      description: 'Réunion mensuelle du club'
    },
    {
      id: 2,
      title: 'Assemblée générale',
      date: '2024-02-01',
      time: '18:30',
      location: 'Grande salle',
      description: 'Assemblée générale annuelle'
    }
  ],
  
  cotisations: [
    {
      id: 1,
      memberName: 'Jean Dupont',
      amount: 150,
      date: '2024-01-01',
      status: 'Payée'
    },
    {
      id: 2,
      memberName: 'Marie Martin',
      amount: 150,
      date: '2024-01-05',
      status: 'Payée'
    },
    {
      id: 3,
      memberName: 'Pierre Bernard',
      amount: 150,
      date: '2024-01-10',
      status: 'En attente'
    }
  ]
};
