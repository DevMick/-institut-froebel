// Configuration API pour l'application Rotary Club Mobile
export const API_CONFIG = {
  // Mode de développement - forcer les données de test
  FORCE_DEMO_MODE: true, // Mettre à false pour utiliser l'API réelle
  
  // URLs de l'API
  LOCAL_URL: 'http://localhost:5265',
  NGROK_URL: 'https://eb341d744645.ngrok-free.app',
  
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
      id: 1,
      name: 'Rotary Club de Paris',
      city: 'Paris',
      description: 'Club principal de Paris',
      membersCount: 45
    },
    {
      id: 2,
      name: 'Rotary Club de Lyon',
      city: 'Lyon',
      description: 'Club de Lyon',
      membersCount: 32
    },
    {
      id: 3,
      name: 'Rotary Club de Marseille',
      city: 'Marseille',
      description: 'Club de Marseille',
      membersCount: 28
    },
    {
      id: 4,
      name: 'Rotary Club de Toulouse',
      city: 'Toulouse',
      description: 'Club de Toulouse',
      membersCount: 35
    },
    {
      id: 5,
      name: 'Rotary Club de Nice',
      city: 'Nice',
      description: 'Club de Nice',
      membersCount: 22
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
