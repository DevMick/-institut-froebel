import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';

const API_BASE_URL = 'https://ominous-space-potato-r4gg6jvq474jcx99j-5271.app.github.dev/api';

const getAuthHeaders = (token) => ({
  Authorization: `Bearer ${token}`,
  'Content-Type': 'application/json',
});

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
});

// Helper pour gérer les erreurs API
const handleApiError = (error) => {
  if (error.response && error.response.data) {
    return error.response.data;
  }
  return {
    success: false,
    message: "Erreur réseau ou serveur injoignable.",
    data: null,
    errors: [error.message],
  };
};

// Données de test pour le dashboard
const dashboardTestData = {
  utilisateur: {
    nomComplet: "Aminata Diallo",
    email: "aminata.diallo@email.com",
    ecoleNom: "Institut Froebel Abidjan"
  },
  enfants: [
    {
      id: 1,
      prenom: "Koffi",
      nom: "Diallo", 
      classe: "CP1",
      niveau: "Primaire"
    },
    {
      id: 2,
      prenom: "Aya",
      nom: "Diallo",
      classe: "Petite Section", 
      niveau: "Maternelle"
    }
  ],
  notifications: {
    messagesNonLus: 3,
    dernieresAnnonces: [
      {
        id: 1,
        titre: "Rentrée scolaire 2024-2025",
        type: "generale",
        datePublication: "2024-12-10T10:30:00Z"
      },
      {
        id: 2,
        titre: "Menu de la cantine - Semaine du 16 décembre",
        type: "cantine", 
        datePublication: "2024-12-12T14:20:00Z"
      }
    ],
    prochainesActivites: [
      {
        id: 1,
        nom: "Sortie pédagogique au Zoo",
        dateDebut: "2024-12-20T08:00:00Z",
        lieu: "Zoo National d'Abidjan"
      },
      {
        id: 2,
        nom: "Réunion parents-professeurs",
        dateDebut: "2024-12-18T15:00:00Z",
        lieu: "Salle de conférence"
      }
    ]
  }
};

// Données de test pour le cahier de liaison
const cahierLiaisonTestData = {
  items: [
    {
      id: 1,
      titre: "Devoirs de mathématiques",
      message: "Votre enfant doit réviser les additions pour demain. Exercices pages 15-16.",
      type: "devoirs",
      luParParent: false,
      dateCreation: "2024-12-12T16:30:00Z",
      createdByName: "Mme KOUAME Marie"
    },
    {
      id: 2,
      titre: "Comportement excellent aujourd'hui",
      message: "Koffi a très bien participé en classe et a aidé ses camarades.",
      type: "comportement", 
      luParParent: true,
      dateCreation: "2024-12-11T17:15:00Z",
      createdByName: "Mme YAO Adjoa"
    },
    {
      id: 3,
      titre: "Information importante",
      message: "N'oubliez pas d'apporter le matériel d'art plastique demain.",
      type: "info",
      luParParent: false,
      dateCreation: "2024-12-10T14:45:00Z",
      createdByName: "M. BAMBA Ibrahim"
    },
    {
      id: 4,
      titre: "Suivi médical",
      message: "Votre enfant s'est plaint de maux de ventre ce matin. Surveillez son état.",
      type: "sante",
      luParParent: true,
      dateCreation: "2024-12-09T11:20:00Z",
      createdByName: "Infirmière scolaire"
    }
  ],
  totalCount: 25,
  page: 1,
  pageSize: 10,
  totalPages: 3
};

// Données de test pour les annonces
const annoncesTestData = {
  items: [
    {
      id: 1,
      titre: "Rentrée scolaire 2024-2025",
      contenu: "La rentrée scolaire aura lieu le lundi 9 septembre 2024. Tous les parents sont invités à venir récupérer les listes de fournitures avant le 30 août. Les horaires d'accueil seront de 8h à 10h pour éviter l'affluence.",
      type: "generale",
      datePublication: "2024-12-10T10:30:00Z",
      dateExpiration: "2025-01-15T23:59:59Z",
      createdByName: "Administration"
    },
    {
      id: 2,
      titre: "URGENT: Fermeture exceptionnelle",
      contenu: "L'école sera fermée demain en raison des conditions météorologiques défavorables. Les cours reprendront normalement jeudi. Surveillez vos emails pour plus d'informations.",
      type: "urgent",
      datePublication: "2024-12-13T07:00:00Z",
      dateExpiration: "2024-12-14T23:59:59Z",
      createdByName: "Directeur"
    },
    {
      id: 3,
      titre: "Nouveau menu de la cantine",
      contenu: "Découvrez notre nouveau menu équilibré pour ce mois. Nous avons ajouté plus de légumes locaux et des plats traditionnels ivoiriens adaptés aux enfants.",
      type: "cantine",
      datePublication: "2024-12-08T14:15:00Z",
      dateExpiration: "2024-12-31T23:59:59Z",
      createdByName: "Chef cuisinier"
    },
    {
      id: 4,
      titre: "Inscription activités extra-scolaires",
      contenu: "Les inscriptions pour les activités du 2ème trimestre sont ouvertes : football, danse, arts plastiques, anglais renforcé. Formulaires disponibles à l'accueil.",
      type: "activite",
      datePublication: "2024-12-05T09:00:00Z",
      dateExpiration: "2024-12-20T23:59:59Z",
      createdByName: "Coordinateur activités"
    }
  ],
  totalCount: 28,
  page: 1, 
  pageSize: 10,
  totalPages: 3
};

// Données de test pour les bulletins
const bulletinsTestData = [
  {
    id: 1,
    trimestre: "1",
    anneeScolaire: "2024-2025",
    moyenneGenerale: 14.5,
    datePublication: "2024-12-15T10:00:00Z",
    nomFichier: "bulletin_koffi_t1_2024.pdf",
    estTelechargeable: true
  },
  {
    id: 2,
    trimestre: "3",
    anneeScolaire: "2023-2024", 
    moyenneGenerale: 13.8,
    datePublication: "2024-06-20T10:00:00Z",
    nomFichier: "bulletin_koffi_t3_2023.pdf",
    estTelechargeable: true
  },
  {
    id: 3,
    trimestre: "2",
    anneeScolaire: "2023-2024",
    moyenneGenerale: 15.2,
    datePublication: "2024-04-10T10:00:00Z",
    nomFichier: "bulletin_koffi_t2_2023.pdf",
    estTelechargeable: true
  },
  {
    id: 4,
    trimestre: "1",
    anneeScolaire: "2023-2024",
    moyenneGenerale: 12.9,
    datePublication: "2023-12-18T10:00:00Z",
    nomFichier: "bulletin_koffi_t1_2023.pdf",
    estTelechargeable: false
  }
];

// Données de test pour la cantine
const cantineTestData = {
  semaineDebut: "2024-12-16T00:00:00Z",
  semaineFin: "2024-12-22T23:59:59Z",
  menusSemaine: [
    {
      dateMenu: "2024-12-16T00:00:00Z",
      typeRepas: "dejeuner",
      menu: "Riz au poisson, salade de tomates, fruit de saison",
      prix: 1500
    },
    {
      dateMenu: "2024-12-17T00:00:00Z", 
      typeRepas: "dejeuner",
      menu: "Attiéké au poulet braisé, légumes sautés, yaourt",
      prix: 1500
    },
    {
      dateMenu: "2024-12-18T00:00:00Z",
      typeRepas: "dejeuner", 
      menu: "Igname pilée, sauce arachide au poisson, banane",
      prix: 1500
    },
    {
      dateMenu: "2024-12-19T00:00:00Z",
      typeRepas: "dejeuner",
      menu: "Riz gras aux légumes, salade verte, jus de fruits frais",
      prix: 1500
    },
    {
      dateMenu: "2024-12-20T00:00:00Z",
      typeRepas: "dejeuner",
      menu: "Foutou banane, sauce claire au poisson, orange",
      prix: 1500
    }
  ],
  informations: {
    horairesService: "12h00 - 13h30",
    contact: "Mme KOUAME - 01 02 03 04 05",
    paiementMensuel: true,
    allergiesInfo: "Merci de signaler toute allergie alimentaire à l'administration"
  }
};

// Données de test pour les activités
const activitesTestData = {
  mois: "décembre 2024",
  activites: [
    {
      id: 1,
      nom: "Sortie pédagogique au Zoo",
      description: "Visite du zoo national pour les classes de CP et CE1. Découverte des animaux d'Afrique et sensibilisation à la protection de la nature.",
      dateDebut: "2024-12-20T08:00:00Z",
      dateFin: "2024-12-20T14:00:00Z",
      lieu: "Zoo National d'Abidjan",
      classeConcernee: "CP1, CP2, CE1"
    },
    {
      id: 2,
      nom: "Réunion parents-professeurs",
      description: "Rencontre trimestrielle avec les parents d'élèves pour faire le bilan du 1er trimestre et préparer le 2ème trimestre.",
      dateDebut: "2024-12-18T15:00:00Z",
      dateFin: "2024-12-18T18:00:00Z",
      lieu: "Salle de conférence de l'école",
      classeConcernee: "Toutes classes"
    },
    {
      id: 3,
      nom: "Spectacle de Noël",
      description: "Représentation théâtrale et musicale préparée par les élèves de maternelle sur le thème de Noël autour du monde.",
      dateDebut: "2024-12-22T10:00:00Z",
      dateFin: "2024-12-22T11:30:00Z", 
      lieu: "Cour de l'école",
      classeConcernee: "Maternelle"
    },
    {
      id: 4,
      nom: "Atelier cuisine pour parents",
      description: "Venez apprendre à préparer des goûters sains et équilibrés pour vos enfants avec notre nutritionniste.",
      dateDebut: "2024-12-14T14:00:00Z",
      dateFin: "2024-12-14T16:00:00Z",
      lieu: "Cuisine pédagogique",
      classeConcernee: "Tous niveaux"
    },
    {
      id: 5,
      nom: "Remise des bulletins T1",
      description: "Distribution officielle des bulletins du premier trimestre. Entretiens individuels sur rendez-vous.",
      dateDebut: "2024-12-16T08:00:00Z",
      dateFin: "2024-12-16T17:00:00Z",
      lieu: "Classes respectives",
      classeConcernee: "Primaire"
    }
  ]
};

export const fetchDashboard = async (token) => {
  try {
    // Simulation d'un délai réseau
    await new Promise(resolve => setTimeout(resolve, 500));
    return {
      success: true,
      message: "Tableau de bord récupéré",
      data: dashboardTestData
    };
  } catch (error) {
    return handleApiError(error);
  }
};

export const fetchCahierLiaison = async (token, enfantId, page = 1, pageSize = 10) => {
  try {
    await new Promise(resolve => setTimeout(resolve, 300));
    return {
      success: true,
      message: "Cahier de liaison récupéré",
      data: cahierLiaisonTestData
    };
  } catch (error) {
    return handleApiError(error);
  }
};

export const markMessageLu = async (token, messageId) => {
  try {
    await new Promise(resolve => setTimeout(resolve, 200));
    return {
      success: true,
      message: "Message marqué comme lu",
      data: null
    };
  } catch (error) {
    return handleApiError(error);
  }
};

export const fetchAnnonces = async (token, page = 1, pageSize = 10, type = '', search = '') => {
  try {
    await new Promise(resolve => setTimeout(resolve, 400));
    return {
      success: true,
      message: "Annonces récupérées",
      data: annoncesTestData
    };
  } catch (error) {
    return handleApiError(error);
  }
};

export const fetchBulletins = async (token, enfantId) => {
  try {
    await new Promise(resolve => setTimeout(resolve, 300));
    return {
      success: true,
      message: "Bulletins récupérés",
      data: bulletinsTestData
    };
  } catch (error) {
    return handleApiError(error);
  }
};

export const fetchCantine = async (token, semaine) => {
  try {
    await new Promise(resolve => setTimeout(resolve, 300));
    return {
      success: true,
      message: "Informations cantine récupérées",
      data: cantineTestData
    };
  } catch (error) {
    return handleApiError(error);
  }
};

export const fetchActivites = async (token, mois) => {
  try {
    await new Promise(resolve => setTimeout(resolve, 300));
    return {
      success: true,
      message: "Calendrier des activités récupéré",
      data: activitesTestData
    };
  } catch (error) {
    return handleApiError(error);
  }
};

export { bulletinsTestData };
