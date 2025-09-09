// Service API pour la gestion des contenus de la page Vie Scolaire

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Structure par défaut des données Vie Scolaire
const defaultVieScolaireData = {
  mainTitle: 'Vie Scolaire',
  sections: [
    {
      id: 'encadrement',
      title: 'Encadrement & Bienveillance',
      description: 'Nos équipes pédagogiques et éducatives assurent une présence constante, attentive et respectueuse. Chaque enfant est connu, reconnu et accompagné dans son individualité.',
      features: ['Équipe qualifiée', 'Suivi personnalisé', 'Relation de confiance', 'Écoute active']
    },
    {
      id: 'cadre-securise',
      title: 'Cadre sécurisé',
      description: 'Nos établissements sont situés dans des quartiers accessibles, avec des dispositifs de sécurité (agents, portails surveillés, environnement fermé) garantissant la tranquillité des parents.',
      features: ['Culture', 'Art', 'Sport']
    },
    {
      id: 'cantine',
      title: 'Cantine Scolaire',
      description: 'Nos cantines proposent des repas équilibrés, cuisinés sur place, dans le respect des normes d\'hygiène. Les menus sont pensés pour s\'adapter aux besoins nutritionnels des enfants.',
      features: ['Repas équilibrés', 'Cuisine sur place', 'Normes d\'hygiène', 'Menus adaptés']
    },
    {
      id: 'culture-art-sport',
      title: 'Culture, Art et sport',
      description: 'L\'épanouissement passe aussi par le mouvement et la créativité. Nos écoles offrent un large éventail d\'activités extrascolaires',
      features: ['Danse & Théâtre', 'Musique & Cuisine', 'Football & Karaté', 'Jeux collectifs']
    },
    {
      id: 'evenements',
      title: 'Événements & Célébrations',
      description: 'Tout au long de l\'année, la vie scolaire est rythmée par des moments forts qui créent des souvenirs inoubliables.',
      features: ['Remises de prix', 'Journées thématiques', 'Fêtes scolaires', 'Compétitions']
    },
    {
      id: 'salle-polyvalente',
      title: 'Salle Polyvalente',
      description: 'Un espace moderne équipé de bibliothèque et ordinateurs, destiné aux recherches scolaires et à la formation continue.',
      features: ['Bibliothèque moderne', 'Ordinateurs', 'Recherches scolaires', 'Formations externes']
    }
  ]
};

// Clé pour le localStorage
const STORAGE_KEY = 'vieScolaireData';

/**
 * Récupérer les données de Vie Scolaire
 */
export const fetchVieScolaireData = async () => {
  try {
    // Pour l'instant, on utilise le localStorage
    // Plus tard, on pourra remplacer par un vrai appel API
    const storedData = localStorage.getItem(STORAGE_KEY);
    
    if (storedData) {
      const parsedData = JSON.parse(storedData);
      return {
        success: true,
        data: parsedData
      };
    } else {
      // Retourner les données par défaut si rien n'est stocké
      return {
        success: true,
        data: defaultVieScolaireData
      };
    }
  } catch (error) {
    console.error('Erreur lors de la récupération des données Vie Scolaire:', error);
    return {
      success: false,
      error: error.message,
      data: defaultVieScolaireData // Fallback vers les données par défaut
    };
  }
};

/**
 * Sauvegarder les données de Vie Scolaire
 */
export const saveVieScolaireData = async (data) => {
  try {
    // Validation des données
    if (!data || !data.mainTitle || !Array.isArray(data.sections)) {
      throw new Error('Format de données invalide');
    }

    // Validation des sections
    for (const section of data.sections) {
      if (!section.id || !section.title || !section.description || !Array.isArray(section.features)) {
        throw new Error('Format de section invalide');
      }
    }

    // Sauvegarder dans le localStorage
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    
    return {
      success: true,
      message: 'Données sauvegardées avec succès'
    };
  } catch (error) {
    console.error('Erreur lors de la sauvegarde des données Vie Scolaire:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Réinitialiser les données aux valeurs par défaut
 */
export const resetVieScolaireData = async () => {
  try {
    localStorage.removeItem(STORAGE_KEY);
    return {
      success: true,
      message: 'Données réinitialisées aux valeurs par défaut',
      data: defaultVieScolaireData
    };
  } catch (error) {
    console.error('Erreur lors de la réinitialisation:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Sauvegarder une section spécifique
 */
export const saveSectionData = async (sectionId, sectionData) => {
  try {
    // Récupérer les données actuelles
    const currentDataResult = await fetchVieScolaireData();
    if (!currentDataResult.success) {
      throw new Error('Impossible de récupérer les données actuelles');
    }

    const currentData = currentDataResult.data;
    
    // Trouver et mettre à jour la section
    const sectionIndex = currentData.sections.findIndex(s => s.id === sectionId);
    if (sectionIndex === -1) {
      throw new Error('Section non trouvée');
    }

    currentData.sections[sectionIndex] = {
      ...currentData.sections[sectionIndex],
      ...sectionData
    };

    // Sauvegarder les données mises à jour
    return await saveVieScolaireData(currentData);
  } catch (error) {
    console.error('Erreur lors de la sauvegarde de la section:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Mettre à jour le titre principal
 */
export const updateMainTitle = async (newTitle) => {
  try {
    // Récupérer les données actuelles
    const currentDataResult = await fetchVieScolaireData();
    if (!currentDataResult.success) {
      throw new Error('Impossible de récupérer les données actuelles');
    }

    const currentData = currentDataResult.data;
    currentData.mainTitle = newTitle;

    // Sauvegarder les données mises à jour
    return await saveVieScolaireData(currentData);
  } catch (error) {
    console.error('Erreur lors de la mise à jour du titre principal:', error);
    return {
      success: false,
      error: error.message
    };
  }
};
