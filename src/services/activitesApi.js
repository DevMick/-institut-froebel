// Service API pour la gestion des activités récentes avec images et vidéos
// Utilise localStorage pour le stockage (facilement remplaçable par une vraie API)

const STORAGE_KEY = 'activitesRecentesData';

// Données par défaut pour les activités récentes
const defaultActivitesData = {
  title: "ACTIVITÉS RÉCENTES",
  description: "Découvrez les dernières activités et événements de notre institut",
  sections: [
    {
      id: "sila",
      title: "Visite au SILA(Salon international du livre d'Abidjan)",
      medias: [
        {
          id: "sila-1",
          type: "image",
          url: "/src/assets/images/activites/sila1.jpg",
          title: "Découverte des livres",
          description: "Nos élèves explorent les stands du salon"
        },
        {
          id: "sila-2", 
          type: "image",
          url: "/src/assets/images/activites/sila2.jpg",
          title: "Rencontre avec les auteurs",
          description: "Échanges enrichissants avec les écrivains"
        },
        {
          id: "sila-3",
          type: "image", 
          url: "/src/assets/images/activites/sila3.jpg",
          title: "Ateliers de lecture",
          description: "Participation aux activités pédagogiques"
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
          url: "/src/assets/images/activites/banco1.jpg", 
          title: "Exploration de la nature",
          description: "Découverte de la biodiversité locale"
        },
        {
          id: "banco-2",
          type: "image",
          url: "/src/assets/images/activites/banco2.jpg",
          title: "Observation des arbres",
          description: "Apprentissage sur l'écosystème forestier"
        },
        {
          id: "banco-3",
          type: "image",
          url: "/src/assets/images/activites/banco3.jpg",
          title: "Activités en groupe",
          description: "Travail collaboratif en pleine nature"
        },
        {
          id: "banco-video",
          type: "video",
          url: "https://res.cloudinary.com/dntyghmap/video/upload/v1757153869/Visite_au_Banco_pg6681.mp4",
          title: "Vidéo de la visite",
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
          url: "/src/assets/images/activites/solidarite1.jpg",
          title: "Collecte de dons",
          description: "Nos élèves rassemblent leurs contributions"
        },
        {
          id: "solidarite-2",
          type: "image", 
          url: "/src/assets/images/activites/solidarite2.jpg",
          title: "Remise des dons",
          description: "Moment émouvant de partage"
        },
        {
          id: "solidarite-3",
          type: "image",
          url: "/src/assets/images/activites/solidarite3.jpg",
          title: "Joie partagée",
          description: "Bonheur des enfants de l'orphelinat"
        },
        {
          id: "solidarite-video",
          type: "video",
          url: "https://res.cloudinary.com/dntyghmap/video/upload/v1757154294/C%C3%A9l%C3%A9bration_de_la_solidarit%C3%A9_des_%C3%A9l%C3%A8ves_zsrxbh.mp4",
          title: "Vidéo de la célébration",
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
          url: "/src/assets/images/activites/mardi-gras1.jpg",
          title: "Déguisements colorés",
          description: "Nos élèves en costumes festifs"
        },
        {
          id: "mardi-gras-2",
          type: "image",
          url: "/src/assets/images/activites/mardi-gras2.jpg", 
          title: "Parade joyeuse",
          description: "Défilé dans la cour de l'école"
        },
        {
          id: "mardi-gras-3",
          type: "image",
          url: "/src/assets/images/activites/mardi-gras3.jpg",
          title: "Danses et musique",
          description: "Ambiance festive et conviviale"
        },
        {
          id: "mardi-gras-4",
          type: "image",
          url: "/src/assets/images/activites/mardi-gras4.jpg",
          title: "Créativité en action",
          description: "Ateliers de création de masques"
        }
      ]
    }
  ]
};

// Récupérer les données depuis localStorage
export const fetchActivitesData = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const data = JSON.parse(stored);
      return { success: true, data };
    }
    // Si pas de données, retourner les données par défaut
    return { success: true, data: defaultActivitesData };
  } catch (error) {
    console.error('Erreur lors de la récupération des données:', error);
    return { success: false, error: error.message, data: defaultActivitesData };
  }
};

// Sauvegarder les données dans localStorage
export const saveActivitesData = (data) => {
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
export const resetActivitesData = () => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultActivitesData));
    return { success: true, data: defaultActivitesData, message: 'Données réinitialisées' };
  } catch (error) {
    console.error('Erreur lors de la réinitialisation:', error);
    return { success: false, error: error.message };
  }
};

// Fonction utilitaire pour uploader un média (image ou vidéo)
export const uploadMedia = async (file) => {
  try {
    // Simulation d'upload - dans un vrai projet, vous utiliseriez Cloudinary, AWS S3, etc.
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        // Déterminer le type de média
        const mediaType = file.type.startsWith('video/') ? 'video' : 'image';
        
        resolve({
          success: true,
          mediaUrl: e.target.result,
          mediaType: mediaType,
          message: `${mediaType === 'video' ? 'Vidéo' : 'Image'} uploadée avec succès`
        });
      };
      reader.readAsDataURL(file);
    });
  } catch (error) {
    console.error('Erreur lors de l\'upload:', error);
    return { success: false, error: error.message };
  }
};

// Fonction utilitaire pour valider une URL de média
export const validateMediaUrl = (url, expectedType = null) => {
  try {
    // Vérifier si c'est une URL valide
    new URL(url);
    
    // Vérifier si c'est une URL de média supportée
    const supportedDomains = ['cloudinary.com', 'youtube.com', 'youtu.be', 'vimeo.com'];
    const urlObj = new URL(url);
    const isSupported = supportedDomains.some(domain => urlObj.hostname.includes(domain));
    
    // Vérifier le type si spécifié
    let typeMatch = true;
    if (expectedType) {
      if (expectedType === 'video') {
        typeMatch = url.includes('.mp4') || url.includes('youtube') || url.includes('vimeo') || url.includes('cloudinary.com/video');
      } else if (expectedType === 'image') {
        typeMatch = url.includes('.jpg') || url.includes('.jpeg') || url.includes('.png') || url.includes('.webp') || url.includes('cloudinary.com/image');
      }
    }
    
    return {
      success: true,
      isValid: isSupported && typeMatch,
      message: (isSupported && typeMatch) ? 'URL valide' : 'URL non supportée ou type incorrect'
    };
  } catch (error) {
    return {
      success: false,
      isValid: false,
      message: 'URL invalide'
    };
  }
};

// Ajouter un nouveau média à une section
export const addMediaToSection = async (sectionId, mediaData) => {
  try {
    const result = await fetchActivitesData();
    if (!result.success) {
      throw new Error('Impossible de récupérer les données');
    }
    
    const updatedData = { ...result.data };
    const sectionIndex = updatedData.sections.findIndex(s => s.id === sectionId);
    
    if (sectionIndex === -1) {
      throw new Error('Section non trouvée');
    }
    
    // Générer un ID unique pour le nouveau média
    const newMediaId = `${sectionId}-${Date.now()}`;
    const newMedia = {
      id: newMediaId,
      ...mediaData
    };
    
    updatedData.sections[sectionIndex].medias.push(newMedia);
    
    const saveResult = await saveActivitesData(updatedData);
    if (saveResult.success) {
      return { success: true, data: updatedData, newMediaId };
    } else {
      throw new Error(saveResult.error);
    }
  } catch (error) {
    console.error('Erreur lors de l\'ajout du média:', error);
    return { success: false, error: error.message };
  }
};

// Supprimer un média d'une section
export const removeMediaFromSection = async (sectionId, mediaId) => {
  try {
    const result = await fetchActivitesData();
    if (!result.success) {
      throw new Error('Impossible de récupérer les données');
    }
    
    const updatedData = { ...result.data };
    const sectionIndex = updatedData.sections.findIndex(s => s.id === sectionId);
    
    if (sectionIndex === -1) {
      throw new Error('Section non trouvée');
    }
    
    updatedData.sections[sectionIndex].medias = updatedData.sections[sectionIndex].medias.filter(m => m.id !== mediaId);
    
    const saveResult = await saveActivitesData(updatedData);
    if (saveResult.success) {
      return { success: true, data: updatedData };
    } else {
      throw new Error(saveResult.error);
    }
  } catch (error) {
    console.error('Erreur lors de la suppression du média:', error);
    return { success: false, error: error.message };
  }
};
