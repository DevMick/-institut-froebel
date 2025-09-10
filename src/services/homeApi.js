// Service API pour la gestion complète des contenus de la page d'accueil
// Utilise localStorage pour le stockage (facilement remplaçable par une vraie API)

const STORAGE_KEY = 'homePageData';

// Données par défaut complètes pour toutes les sections de la page d'accueil
const defaultHomeData = {
  // Section Hero
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

  // Section Mot de la Directrice Centrale
  directriceMessage: {
    title: "MOT DE LA DIRECTRICE CENTRALE",
    subtitle: "Chers parents, chers partenaires de l'éducation",
    directriceInfo: {
      nom: "KADIO Dyana Roselyne",
      poste: "Directrice Centrale",
      imageUrl: "/src/assets/images/directrice.png"
    },
    paragraphes: [
      "Depuis plus de cinq décennies, l'Institut Froebel s'est imposé comme une référence au niveau l'éducation nationale de la Côte d'Ivoire plus précisément dans la région des Lagunes. Fidèle à la vision de sa fondatrice, Madame Marguerite Kadio, notre établissement s'est bâti sur une pédagogie centrée sur l'épanouissement de l'enfant, l'excellence académique et le respect des valeurs humaines.",
      "Aujourd'hui, avec plus de 1 700 élèves répartis sur cinq sites, nous poursuivons notre mission avec passion et engagement : offrir une éducation intégrale, dans un cadre sécurisé, dynamique et bienveillant.",
      "Que vous soyez parents d'un tout-petit ou d'un adolescent, nous vous invitons à découvrir cet établissement où chaque enfant est accompagné avec beaucoup de rigueur mais aussi une attention axée sur son potentiel dans le cadre d'un encadrement personnalisé."
    ],
    citation: "Bienvenue à l'Institut Froebel. Ensemble, faisons fleurir l'avenir de nos enfants.",
    signature: {
      nom: "KADIO Dyana Roselyne",
      titre: "Directrice Centrale - Institut Froebel"
    }
  },

  // Section Notre Histoire
  notreHistoire: {
    title: "NOTRE HISTOIRE",
    visionBlock: {
      title: "Une Vision Pédagogique Révolutionnaire",
      description: "Fondé en 1975 par Madame Marguerite Kadio, l'Institut Froebel s'inspire de la pédagogie de Friedrich Froebel, créateur du concept de jardin d'enfants. Notre approche met l'enfant au centre de l'apprentissage, favorisant son épanouissement naturel à travers le jeu, la créativité et l'exploration.",
      citation: "Une pionnière qui a révolutionné l'éducation en Côte d'Ivoire avec sa conviction que chaque enfant mérite une éducation de qualité, bienveillante et adaptée à son développement."
    },
    timeline: [
      {
        year: "1975",
        title: "Naissance de l'Institut",
        description: "Ouverture de la première école à Treichville, marquant le début d'une aventure éducative exceptionnelle."
      },
      {
        year: "1978",
        title: "Expansion à Yopougon",
        description: "Extension des activités avec l'ouverture d'un nouveau site à Yopougon, répondant à la demande croissante."
      },
      {
        year: "1983",
        title: "Implantation à Abobo",
        description: "Création d'un troisième établissement à Abobo, consolidant la présence de l'Institut dans Abidjan."
      },
      {
        year: "1984",
        title: "Création du Cycle Secondaire",
        description: "Lancement du cycle secondaire, permettant un parcours complet de la maternelle au baccalauréat."
      },
      {
        year: "2015",
        title: "40 ans d'Excellence",
        description: "Célébration de quatre décennies d'engagement pour l'éducation de qualité en Côte d'Ivoire."
      }
    ]
  },

  // Section Nos Établissements
  nosEtablissements: {
    title: "NOS ÉTABLISSEMENTS",
    description: "Cinq sites d'excellence répartis stratégiquement dans Abidjan, offrant un environnement sécurisé et propice à l'apprentissage.",
    etablissements: [
      {
        id: "la-tulipe",
        nom: "La Tulipe",
        adresse: "Marcory Anoumabo",
        niveaux: ["Préscolaire", "Primaire", "Secondaire"],
        badge: "Seul site avec secondaire",
        icon: "university",
        lien: "/la-tulipe"
      },
      {
        id: "la-marguerite",
        nom: "La Marguerite",
        adresse: "Marcory Cité Jean-Baptiste Mockey",
        niveaux: ["Préscolaire", "Primaire"],
        icon: "flower",
        lien: null
      },
      {
        id: "la-rose",
        nom: "La Rose",
        adresse: "Yopougon - Groupement Foncier",
        niveaux: ["Préscolaire", "Primaire"],
        icon: "flower",
        lien: null
      },
      {
        id: "les-orchidees",
        nom: "Les Orchidées",
        adresse: "Yopougon - Groupement Foncier",
        niveaux: ["Préscolaire", "Primaire"],
        icon: "flower",
        lien: null
      },
      {
        id: "le-lys",
        nom: "Le Lys",
        adresse: "Abobo - Baoulé",
        niveaux: ["Préscolaire", "Primaire"],
        icon: "flower",
        lien: null
      }
    ]
  },

  // Section Bienvenue à l'Institut Froebel
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

  // Section Nos Récentes Activités
  nosRecentesActivites: {
    title: "NOS RÉCENTES ACTIVITÉS",
    sections: [
      {
        id: "sila",
        title: "Visite au SILA(Salon international du livre d'Abidjan)",
        medias: [
          {
            id: "sila-1",
            type: "image",
            url: "/src/assets/images/activites/v1.jpg",
            titre: "Visite au SILA - Photo 1",
            description: "Découverte des stands du salon du livre"
          },
          {
            id: "sila-2",
            type: "image",
            url: "/src/assets/images/activites/v2.jpg",
            titre: "Visite au SILA - Photo 2",
            description: "Rencontre avec les auteurs"
          },
          {
            id: "sila-3",
            type: "image",
            url: "/src/assets/images/activites/v3.jpg",
            titre: "Visite au SILA - Photo 3",
            description: "Ateliers de lecture pour nos élèves"
          }
        ]
      },
      {
        id: "banco",
        title: "Visite de la forêt du Banco",
        medias: [
          {
            id: "banco-1",
            type: "image",
            url: "/src/assets/images/activites/b1.jpg",
            titre: "Visite de la forêt du Banco - Photo 1",
            description: "Exploration de la nature"
          },
          {
            id: "banco-2",
            type: "image",
            url: "/src/assets/images/activites/b2.jpg",
            titre: "Visite de la forêt du Banco - Photo 2",
            description: "Observation de la biodiversité"
          },
          {
            id: "banco-3",
            type: "image",
            url: "/src/assets/images/activites/b3.jpg",
            titre: "Visite de la forêt du Banco - Photo 3",
            description: "Activités en groupe dans la forêt"
          },
          {
            id: "banco-video",
            type: "video",
            url: "https://res.cloudinary.com/dntyghmap/video/upload/v1757153869/Visite_au_Banco_pg6681.mp4",
            titre: "Visite de la forêt du Banco - Vidéo",
            description: "Résumé de notre journée au Banco"
          }
        ]
      },
      {
        id: "solidarite",
        title: "Célébration de la solidarité des élèves à travers des dons à un orphelinat",
        medias: [
          {
            id: "solidarite-1",
            type: "image",
            url: "/src/assets/images/activites/o1.jpg",
            titre: "Célébration de la solidarité - Photo 1",
            description: "Collecte de dons par nos élèves"
          },
          {
            id: "solidarite-2",
            type: "image",
            url: "/src/assets/images/activites/o2.jpg",
            titre: "Célébration de la solidarité - Photo 2",
            description: "Remise des dons à l'orphelinat"
          },
          {
            id: "solidarite-3",
            type: "image",
            url: "/src/assets/images/activites/o3.jpg",
            titre: "Célébration de la solidarité - Photo 3",
            description: "Joie partagée avec les enfants"
          },
          {
            id: "solidarite-video",
            type: "video",
            url: "https://res.cloudinary.com/dntyghmap/video/upload/v1757154294/C%C3%A9l%C3%A9bration_de_la_solidarit%C3%A9_des_%C3%A9l%C3%A8ves_zsrxbh.mp4",
            titre: "Célébration de la solidarité - Vidéo",
            description: "Témoignages et moments forts"
          }
        ]
      },
      {
        id: "mardi-gras",
        title: "Célébration du Mardi Gras - Fête des couleurs et de la joie",
        medias: [
          {
            id: "mardi-gras-1",
            type: "image",
            url: "/src/assets/images/activites/g1.jpg",
            titre: "Célébration du Mardi Gras - Photo 1",
            description: "Déguisements colorés de nos élèves"
          },
          {
            id: "mardi-gras-2",
            type: "image",
            url: "/src/assets/images/activites/g2.jpg",
            titre: "Célébration du Mardi Gras - Photo 2",
            description: "Parade joyeuse dans la cour"
          },
          {
            id: "mardi-gras-3",
            type: "image",
            url: "/src/assets/images/activites/g3.jpg",
            titre: "Célébration du Mardi Gras - Photo 3",
            description: "Danses et musique festive"
          },
          {
            id: "mardi-gras-4",
            type: "image",
            url: "/src/assets/images/activites/g4.jpg",
            titre: "Célébration du Mardi Gras - Photo 4",
            description: "Créativité et ateliers de masques"
          }
        ]
      }
    ]
  },

  // Section Galerie Photo
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
      },
      {
        id: "laboratoire",
        titre: "Laboratoire Sciences",
        description: "Équipements modernes pour l'expérimentation et la découverte scientifique",
        imageUrl: "/src/assets/images/blio.jpg"
      },
      {
        id: "cour-recreation",
        titre: "Cour de Récréation",
        description: "Grand espace de jeu sécurisé où nos élèves peuvent se détendre et socialiser",
        imageUrl: "/src/assets/images/cours.jpg"
      },
      {
        id: "eleves-primaire",
        titre: "Nos Élèves du Primaire",
        description: "Des enfants curieux et motivés qui développent leurs compétences fondamentales avec passion",
        imageUrl: "/src/assets/images/eleve.jpg"
      },
      {
        id: "secondaire-espace",
        titre: "Secondaire",
        description: "Formation secondaire d'excellence avec accompagnement personnalisé",
        imageUrl: "/src/assets/images/secondaire.jpg"
      },
      {
        id: "salle-polyvalente",
        titre: "Salle Polyvalente",
        description: "Nos salles informatique modernes équipées pour l'apprentissage numérique",
        imageUrl: "/src/assets/images/salle polyvalente.jpg"
      },
      {
        id: "transport",
        titre: "Moyen de Transport",
        description: "Service de transport scolaire sécurisé pour nos élèves",
        imageUrl: "/src/assets/images/_DSC0278.jpg"
      },
      {
        id: "eleves-action",
        titre: "Nos Élèves du Primaire en Action",
        description: "Présentation de nos jeunes élèves du primaire, curieux et enthousiastes dans leur parcours d'apprentissage",
        imageUrl: "/src/assets/images/eleve1.jpg"
      },
      {
        id: "eleves-secondaire",
        titre: "Élèves du Secondaire",
        description: "Nos adolescents du secondaire, déterminés et ambitieux, se préparent pour leur avenir académique",
        imageUrl: "/src/assets/images/eleve2.jpg"
      },
      {
        id: "session-revision",
        titre: "Session de Révision",
        description: "Nos élèves du secondaire en pleine concentration lors d'une session de révision studieuse",
        imageUrl: "/src/assets/images/eleve3.jpg"
      }
    ]
  }
};

// Récupérer les données depuis localStorage
export const fetchHomeData = async () => {
  try {
    console.log('🔍 fetchHomeData: Récupération des données...');
    const stored = localStorage.getItem(STORAGE_KEY);
    console.log('📦 Données stockées:', stored ? 'Trouvées' : 'Aucune');

    if (stored) {
      const data = JSON.parse(stored);
      console.log('✅ Données parsées:', data);
      return { success: true, data };
    }
    // Si pas de données, retourner les données par défaut
    console.log('🔄 Utilisation des données par défaut');
    console.log('📋 Données par défaut Hero:', defaultHomeData.hero);
    return { success: true, data: defaultHomeData };
  } catch (error) {
    console.error('💥 Erreur lors de la récupération des données:', error);
    return { success: false, error: error.message, data: defaultHomeData };
  }
};

// Sauvegarder les données dans localStorage
export const saveHomeData = async (data) => {
  try {
    console.log('💾 saveHomeData: Début sauvegarde...');
    console.log('📊 Données à sauvegarder:', data);

    // Validation basique des données
    if (!data || typeof data !== 'object') {
      throw new Error('Données invalides');
    }

    // Vérification spécifique de la section Hero
    if (data.hero) {
      console.log('🏠 Section Hero à sauvegarder:', data.hero);
    }

    const jsonData = JSON.stringify(data);
    console.log('📝 JSON généré (taille):', jsonData.length, 'caractères');

    localStorage.setItem(STORAGE_KEY, jsonData);
    console.log('✅ Sauvegarde localStorage réussie');

    return { success: true, message: 'Données sauvegardées avec succès' };
  } catch (error) {
    console.error('💥 Erreur lors de la sauvegarde:', error);
    return { success: false, error: error.message };
  }
};

// Réinitialiser aux données par défaut
export const resetHomeData = async () => {
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
