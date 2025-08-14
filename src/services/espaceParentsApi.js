import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';

const API_BASE_URL = '/api';

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

// Nouvelle fonction pour récupérer les vraies données du dashboard
export const fetchDashboardData = async (token) => {
  try {
    console.log('Récupération des données du dashboard...');

    // Extraire les informations utilisateur du token JWT
    let utilisateur = {
      nomComplet: "Parent Utilisateur",
      email: "parent@email.com",
      ecoleNom: "Institut Froebel"
    };

    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        utilisateur = {
          nomComplet: payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'] || `${payload.user_prenom} ${payload.user_nom}` || "Parent Utilisateur",
          email: payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress'] || "parent@email.com",
          ecoleNom: payload.school_code === "FROEBEL_DEFAULT" ? "Institut Froebel" : "Institut Froebel"
        };
        console.log('Informations utilisateur extraites du token:', utilisateur);
      } catch (e) {
        console.warn('Impossible de décoder le token, utilisation des données par défaut');
      }
    }

    // Récupérer les enfants du parent
    const enfantsResponse = await fetchEnfantsParent(token);
    const enfants = enfantsResponse.success ? enfantsResponse.data : [];
    console.log('Enfants récupérés:', enfants);

    // Récupérer les messages non lus du cahier de liaison
    let messagesNonLus = 0;
    let dernieresAnnonces = [];

    if (enfants.length > 0) {
      try {
        // Récupérer les messages pour le premier enfant (ou on pourrait faire pour tous)
        const cahierResponse = await fetchCahierLiaison(token, enfants[0].id, 1, 10);
        if (cahierResponse.success) {
          const messages = cahierResponse.data.items || [];
          messagesNonLus = messages.filter(msg => !msg.luParParent).length;
          console.log('Messages non lus:', messagesNonLus);
        }
      } catch (error) {
        console.warn('Erreur lors de la récupération des messages:', error);
      }

      try {
        // Récupérer les dernières annonces
        const ecoleId = 2; // Utiliser l'école ID appropriée
        const annoncesResponse = await fetchAnnoncesParEcole(token, ecoleId, 1, 5);
        if (annoncesResponse.success) {
          dernieresAnnonces = annoncesResponse.data.items.slice(0, 3).map(annonce => ({
            id: annonce.id,
            titre: annonce.titre,
            type: annonce.type,
            datePublication: annonce.datePublication
          }));
          console.log('Dernières annonces:', dernieresAnnonces);
        }
      } catch (error) {
        console.warn('Erreur lors de la récupération des annonces:', error);
      }
    }

    // Plus d'activités - section supprimée
    const prochainesActivites = [];

    const dashboardData = {
      utilisateur,
      enfants: enfants.map(enfant => ({
        id: enfant.id,
        prenom: enfant.prenom,
        nom: enfant.nom,
        classe: enfant.classe,
        niveau: enfant.classe // Utiliser la classe comme niveau pour l'instant
      })),
      notifications: {
        messagesNonLus,
        dernieresAnnonces,
        prochainesActivites
      }
    };

    console.log('Données du dashboard assemblées:', dashboardData);

    return {
      success: true,
      message: "Tableau de bord récupéré",
      data: dashboardData
    };
  } catch (error) {
    console.error('Erreur lors de la récupération du dashboard:', error);
    return handleApiError(error);
  }
};

// Ancienne fonction pour compatibilité (utilise maintenant les vraies données)
export const fetchDashboard = async (token) => {
  return await fetchDashboardData(token);
};



// Récupérer les enfants du parent connecté
export const fetchEnfantsParent = async (token, parentId = null) => {
  try {
    const ecoleId = 2; // ID de l'école fixé à 2 (correspond au token JWT)
    const response = await api.get(`/ecoles/${ecoleId}/parent-enfants`, {
      headers: getAuthHeaders(token)
    });

    // Filtrer les enfants du parent connecté si parentId est fourni
    let filteredData = response.data;
    if (parentId) {
      filteredData = response.data.filter(item => item.parentId === parentId);
    }

    // Transformer les données pour correspondre au format attendu par le frontend
    const enfants = filteredData.map(item => ({
      id: item.enfantId,
      prenom: item.enfantNom.split(' ')[0], // Premier mot comme prénom
      nom: item.enfantNom.split(' ').slice(1).join(' ') || item.enfantNom, // Reste comme nom
      classe: item.classeNom,
      classeId: item.classeId,
      dateNaissance: item.enfantDateNaissance,
      anneeScolaire: item.anneeScolaire,
      parentId: item.parentId,
      parentNom: item.parentNom,
      parentEmail: item.parentEmail,
      parentTelephone: item.parentTelephone
    }));

    return {
      success: true,
      message: "Enfants récupérés",
      data: enfants
    };
  } catch (error) {
    console.error('Erreur lors de la récupération des enfants:', error);
    return handleApiError(error);
  }
};

export const fetchCahierLiaison = async (token, enfantId, page = 1, pageSize = 10) => {
  try {
    // Pour l'instant, on utilise l'école ID 2 comme dans l'exemple
    const ecoleId = 2;
    console.log(`Appel API: /ecoles/${ecoleId}/enfants/${enfantId}/cahier-liaison`);

    const response = await api.get(`/ecoles/${ecoleId}/enfants/${enfantId}/cahier-liaison`, {
      headers: getAuthHeaders(token),
      params: {
        page,
        pageSize
      }
    });

    console.log('Réponse brute API cahier de liaison:', response.data);

    // Transformer les données pour correspondre au format attendu par le frontend
    const items = Array.isArray(response.data) ? response.data : [];
    const transformedData = {
      items: items.map(item => ({
        id: item.id,
        titre: item.titre,
        message: item.message,
        type: item.type,
        luParParent: item.luParParent,
        dateLecture: item.dateLecture,
        reponseRequise: item.reponseRequise,
        reponseParent: item.reponseParent,
        dateReponse: item.dateReponse,
        enfantId: item.enfantId,
        enfantNom: item.enfantNom,
        classeNom: item.classeNom,
        parentNom: item.parentNom,
        createdById: item.createdById,
        createdByNom: item.createdByNom,
        dateCreation: item.createdAt,
        createdByName: item.createdByNom
      })),
      totalCount: items.length,
      page: page,
      pageSize: pageSize,
      totalPages: Math.ceil(items.length / pageSize) || 1
    };

    console.log('Données transformées:', transformedData);

    return {
      success: true,
      message: items.length > 0 ? "Cahier de liaison récupéré" : "Aucun message trouvé",
      data: transformedData
    };
  } catch (error) {
    console.error('Erreur lors de la récupération du cahier de liaison:', error);
    console.error('Détails de l\'erreur:', error.response?.data || error.message);

    // Si l'enfant n'a pas de messages, retourner une structure vide plutôt qu'une erreur
    if (error.response?.status === 404) {
      return {
        success: true,
        message: "Aucun message trouvé pour cet enfant",
        data: {
          items: [],
          totalCount: 0,
          page: page,
          pageSize: pageSize,
          totalPages: 1
        }
      };
    }

    return handleApiError(error);
  }
};

export const markMessageLu = async (token, messageId, enfantId = null) => {
  try {
    // Pour l'instant, on utilise l'école ID 2 comme dans l'exemple
    const ecoleId = 2;
    // Si enfantId n'est pas fourni, on utilise 1 par défaut (correspond à Aya Kouassi)
    const enfantIdToUse = enfantId || 1;

    const response = await api.put(`/ecoles/${ecoleId}/enfants/${enfantIdToUse}/cahier-liaison/${messageId}/marquer-lu`, {}, {
      headers: getAuthHeaders(token)
    });

    return {
      success: true,
      message: "Message marqué comme lu",
      data: response.data
    };
  } catch (error) {
    console.error('Erreur lors du marquage du message comme lu:', error);
    return handleApiError(error);
  }
};

// Récupérer les annonces par école pour les parents
export const fetchAnnoncesParEcole = async (token, ecoleId, page = 1, pageSize = 10, type = '', search = '') => {
  try {
    console.log(`Récupération des annonces pour l'école ${ecoleId}`);

    const response = await api.get(`/ecoles/${ecoleId}/annonces`, {
      headers: getAuthHeaders(token),
      params: {
        page,
        pageSize,
        type,
        search
      }
    });

    console.log('Réponse brute API annonces:', response.data);

    // Transformer les données pour correspondre au format attendu par le frontend
    const items = Array.isArray(response.data) ? response.data : [];
    const transformedData = {
      items: items.map(item => ({
        id: item.id,
        titre: item.titre,
        contenu: item.contenu,
        type: item.type,
        datePublication: item.datePublication,
        dateExpiration: item.dateExpiration,
        classeId: item.classeId,
        classeNom: item.classeNom,
        createdById: item.createdById,
        createdByNom: item.createdByNom,
        createdByName: item.createdByNom,
        createdAt: item.createdAt
      })),
      totalPages: Math.ceil(items.length / pageSize),
      currentPage: page,
      totalItems: items.length
    };

    return {
      success: true,
      message: "Annonces récupérées",
      data: transformedData
    };
  } catch (error) {
    console.error('Erreur lors de la récupération des annonces:', error);
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
