// Service API pour la gestion des contenus de la page d'accueil
// Utilise localStorage pour le stockage (facilement remplaçable par une vraie API)

const STORAGE_KEY = 'homePageData';

// Données par défaut pour la page d'accueil
const defaultHomeData = {
  hero: {
    title: "L'ÉDUCATION D'AUJOURD'HUI, LES LEADERS DE DEMAIN.",
    videoUrl: "https://res.cloudinary.com/dntyghmap/video/upload/v1755144106/Spot_Ecole_hrko3u.mp4",
    badges: [
      {
        icon: "fas fa-graduation-cap",
        text: "Maternelle • Primaire • Secondaire"
      },
      {
        icon: "fas fa-award", 
        text: "Excellence Pédagogique"
      }
    ],
    messages: [
      "Cultivons l'excellence ensemble",
      "Épanouissement et apprentissage", 
      "Innovation pédagogique",
      "Construisons l'avenir de vos enfants"
    ]
  },
  cartesInfos: [
    {
      id: "qui-sommes-nous",
      titre: "QUI SOMMES-NOUS",
      sousTitre: "Découvrez notre histoire et nos valeurs",
      imageUrl: "/src/assets/images/image2.jpg",
      lien: "/presentation"
    },
    {
      id: "nos-ecoles", 
      titre: "NOS ÉCOLES",
      sousTitre: "Explorez nos établissements",
      imageUrl: "/src/assets/images/_DSC0253.jpg",
      lien: "#ecoles"
    }
  ],
  presentationBienvenue: {
    title: "BIENVENUE À L'INSTITUT FROEBEL",
    description: "Ancré dans des valeurs d'excellence et d'innovation pédagogique, l'Institut Froebel se positionne comme une référence éducative à Abidjan, avec des établissements dédiés à chaque étape du parcours scolaire.",
    niveaux: [
      {
        id: "maternelle",
        titre: "ÉCOLE MATERNELLE", 
        description: "Un cadre accueillant où les plus jeunes découvrent le plaisir d'apprendre à travers des activités ludiques et éducatives.",
        imageUrl: "/src/assets/images/maternelle.jpg"
      },
      {
        id: "primaire",
        titre: "ÉCOLE PRIMAIRE",
        description: "Un programme solide qui combine apprentissage académique et développement des compétences sociales.", 
        imageUrl: "/src/assets/images/primaire.jpg"
      },
      {
        id: "secondaire",
        titre: "SECONDAIRE",
        description: "Un environnement structuré pour renforcer les acquis et préparer les élèves aux défis du secondaire.",
        imageUrl: "/src/assets/images/secondaire.jpg"
      }
    ]
  },
  galeriePhoto: {
    title: "GALERIE PHOTO",
    description: "Découvrez nos espaces d'apprentissage et de vie",
    photos: [
      {
        id: "maternelle-espace",
        titre: "École Maternelle",
        description: "Nos plus jeunes élèves évoluent dans un environnement coloré et adapté à leur développement",
        imageUrl: "/src/assets/images/maternelle.jpg"
      },
      {
        id: "bibliotheque",
        titre: "Bibliothèque Moderne", 
        description: "Un espace de lecture et de découverte équipé des dernières technologies pour encourager l'amour des livres",
        imageUrl: "/src/assets/images/blio.jpg"
      },
      {
        id: "salle-classe",
        titre: "Salles de Classe",
        description: "Environnement d'apprentissage lumineux et technologiquement avancé",
        imageUrl: "/src/assets/images/_DSC0230.jpg"
      }
    ]
  }
};

// Récupérer les données depuis localStorage
export const fetchHomeData = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const data = JSON.parse(stored);
      return { success: true, data };
    }
    // Si pas de données, retourner les données par défaut
    return { success: true, data: defaultHomeData };
  } catch (error) {
    console.error('Erreur lors de la récupération des données:', error);
    return { success: false, error: error.message, data: defaultHomeData };
  }
};

// Sauvegarder les données dans localStorage
export const saveHomeData = (data) => {
  try {
    // Validation basique des données
    if (!data || typeof data !== 'object') {
      throw new Error('Données invalides');
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    return { success: true, message: 'Données sauvegardées avec succès' };
  } catch (error) {
    console.error('Erreur lors de la sauvegarde:', error);
    return { success: false, error: error.message };
  }
};

// Réinitialiser aux données par défaut
export const resetHomeData = () => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultHomeData));
    return { success: true, data: defaultHomeData, message: 'Données réinitialisées' };
  } catch (error) {
    console.error('Erreur lors de la réinitialisation:', error);
    return { success: false, error: error.message };
  }
};

// Fonction utilitaire pour uploader une image (simulation)
export const uploadImage = async (file) => {
  try {
    // Simulation d'upload - dans un vrai projet, vous utiliseriez Cloudinary, AWS S3, etc.
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        // Retourner l'URL de l'image (base64 pour la démo)
        resolve({
          success: true,
          imageUrl: e.target.result,
          message: 'Image uploadée avec succès'
        });
      };
      reader.readAsDataURL(file);
    });
  } catch (error) {
    console.error('Erreur lors de l\'upload:', error);
    return { success: false, error: error.message };
  }
};

// Fonction utilitaire pour valider une URL de vidéo
export const validateVideoUrl = (url) => {
  try {
    // Vérifier si c'est une URL valide
    new URL(url);
    
    // Vérifier si c'est une URL de vidéo supportée
    const supportedDomains = ['cloudinary.com', 'youtube.com', 'youtu.be', 'vimeo.com'];
    const urlObj = new URL(url);
    const isSupported = supportedDomains.some(domain => urlObj.hostname.includes(domain));
    
    return {
      success: true,
      isValid: isSupported,
      message: isSupported ? 'URL valide' : 'URL non supportée. Utilisez Cloudinary, YouTube ou Vimeo.'
    };
  } catch (error) {
    return {
      success: false,
      isValid: false,
      message: 'URL invalide'
    };
  }
};
