// Service API pour la gestion des contenus de la page Cycles
// UTILISE localStorage - PAS d'API externe

// Structure par défaut des données Cycles
const defaultCyclesData = {
  mainTitle: 'Nos Cycles Éducatifs',
  cycles: [
    {
      id: 'creche-garderie',
      titre: 'Crèche & Garderie (0 à 3 ans)',
      description: "Un espace chaleureux, doux et sécurisé, pensé pour les tout-petits. Encadrés par des professionnels qualifiés, les enfants évoluent dans un environnement stimulant qui favorise l'éveil sensoriel, le langage et les premiers pas vers l'autonomie.",
      points: [
        "Éveil moteur, affectif et social",
        "Personnel formé à la petite enfance",
        "Communication étroite avec les parents"
      ],
      age: '0-3 ans'
    },
    {
      id: 'maternelle',
      titre: 'Maternelle',
      description: "À la maternelle, l'enfant explore, découvre, expérimente. Nos classes sont conçues pour encourager l'imagination, le langage, la motricité fine et l'apprentissage de la vie en groupe.",
      points: [
        "Apprentissage ludique par le jeu",
        "Développement de la curiosité naturelle",
        "Préparation à l'entrée au primaire"
      ],
      age: '3-6 ans'
    },
    {
      id: 'primaire',
      titre: 'Primaire',
      description: "Le cycle primaire jette les bases fondamentales du savoir : lire, écrire, compter, comprendre le monde. Nos enseignants transmettent avec méthode, exigence et bienveillance.",
      points: [
        "Suivi pédagogique individualisé",
        "Classes à effectif réduit (25 élèves maximum par classe)",
        "Activités de soutien et d'enrichissement",
        "Taux de réussite au CEPE : 100 %"
      ],
      age: '6-11 ans'
    },
    {
      id: 'secondaire',
      titre: 'Secondaire',
      description: "Le secondaire accompagne les élèves vers l'autonomie intellectuelle, la rigueur et l'orientation. Nos filières sont conçues pour préparer aux examens nationaux et au supérieur, tout en développant l'esprit critique, le sens de l'effort et la citoyenneté.",
      points: [
        "Enseignants expérimentés",
        "Résultats solides au BEPC et au BAC",
        "Activités parascolaires (clubs, sport, arts)",
        "Suivi régulier des élèves et accompagnement"
      ],
      age: '11-18 ans'
    }
  ],
  ctaSection: {
    title: 'Prêt à rejoindre notre famille éducative ?',
    description: 'Découvrez comment nous pouvons accompagner votre enfant dans son parcours éducatif.',
    buttonText: 'Nous contacter'
  }
};

// Clé pour le localStorage
const STORAGE_KEY = 'cyclesData';

/**
 * Récupérer les données de Cycles
 */
export const fetchCyclesData = async () => {
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
        data: defaultCyclesData
      };
    }
  } catch (error) {
    console.error('Erreur lors de la récupération des données Cycles:', error);
    return {
      success: false,
      error: error.message,
      data: defaultCyclesData // Fallback vers les données par défaut
    };
  }
};

/**
 * Sauvegarder les données de Cycles
 */
export const saveCyclesData = async (data) => {
  try {
    // Validation des données
    if (!data || !data.mainTitle || !Array.isArray(data.cycles) || !data.ctaSection) {
      throw new Error('Format de données invalide');
    }

    // Validation des cycles
    for (const cycle of data.cycles) {
      if (!cycle.id || !cycle.titre || !cycle.description || !Array.isArray(cycle.points) || !cycle.age) {
        throw new Error('Format de cycle invalide');
      }
    }

    // Validation de la section CTA
    if (!data.ctaSection.title || !data.ctaSection.description || !data.ctaSection.buttonText) {
      throw new Error('Format de section CTA invalide');
    }

    // Sauvegarder dans le localStorage
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    
    return {
      success: true,
      message: 'Données sauvegardées avec succès'
    };
  } catch (error) {
    console.error('Erreur lors de la sauvegarde des données Cycles:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Réinitialiser les données aux valeurs par défaut
 */
export const resetCyclesData = async () => {
  try {
    localStorage.removeItem(STORAGE_KEY);
    return {
      success: true,
      message: 'Données réinitialisées aux valeurs par défaut',
      data: defaultCyclesData
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
 * Sauvegarder un cycle spécifique
 */
export const saveCycleData = async (cycleId, cycleData) => {
  try {
    // Récupérer les données actuelles
    const currentDataResult = await fetchCyclesData();
    if (!currentDataResult.success) {
      throw new Error('Impossible de récupérer les données actuelles');
    }

    const currentData = currentDataResult.data;
    
    // Trouver et mettre à jour le cycle
    const cycleIndex = currentData.cycles.findIndex(c => c.id === cycleId);
    if (cycleIndex === -1) {
      throw new Error('Cycle non trouvé');
    }

    currentData.cycles[cycleIndex] = {
      ...currentData.cycles[cycleIndex],
      ...cycleData
    };

    // Sauvegarder les données mises à jour
    return await saveCyclesData(currentData);
  } catch (error) {
    console.error('Erreur lors de la sauvegarde du cycle:', error);
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
    const currentDataResult = await fetchCyclesData();
    if (!currentDataResult.success) {
      throw new Error('Impossible de récupérer les données actuelles');
    }

    const currentData = currentDataResult.data;
    currentData.mainTitle = newTitle;

    // Sauvegarder les données mises à jour
    return await saveCyclesData(currentData);
  } catch (error) {
    console.error('Erreur lors de la mise à jour du titre principal:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Mettre à jour la section CTA
 */
export const updateCtaSection = async (ctaData) => {
  try {
    // Récupérer les données actuelles
    const currentDataResult = await fetchCyclesData();
    if (!currentDataResult.success) {
      throw new Error('Impossible de récupérer les données actuelles');
    }

    const currentData = currentDataResult.data;
    currentData.ctaSection = {
      ...currentData.ctaSection,
      ...ctaData
    };

    // Sauvegarder les données mises à jour
    return await saveCyclesData(currentData);
  } catch (error) {
    console.error('Erreur lors de la mise à jour de la section CTA:', error);
    return {
      success: false,
      error: error.message
    };
  }
};
