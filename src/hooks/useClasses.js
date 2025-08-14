import { useState, useEffect, useCallback } from 'react';
import classesApi from '../services/classesApi';

/**
 * Hook personnalisé pour gérer les classes d'une école
 * @param {number} ecoleId - ID de l'école
 * @param {boolean} autoFetch - Récupérer automatiquement les données au montage
 */
export const useClasses = (ecoleId = null, autoFetch = false) => {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastFetch, setLastFetch] = useState(null);

  // Fonction pour récupérer les classes
  const fetchClasses = useCallback(async (schoolId = ecoleId) => {
    if (!schoolId) {
      setError('ID d\'école requis');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await classesApi.getClassesByEcole(schoolId);
      
      if (result.success) {
        setClasses(result.data);
        setLastFetch(new Date());
        console.log(`Classes récupérées pour l'école ${schoolId}:`, result.data);
      } else {
        setError(result.message);
        setClasses([]);
      }
    } catch (err) {
      setError(err.message || 'Erreur lors de la récupération des classes');
      setClasses([]);
      console.error('Erreur dans useClasses:', err);
    } finally {
      setLoading(false);
    }
  }, [ecoleId]);

  // Fonction pour rafraîchir les données
  const refresh = useCallback(() => {
    fetchClasses();
  }, [fetchClasses]);

  // Fonction pour changer d'école
  const changeEcole = useCallback((newEcoleId) => {
    if (newEcoleId !== ecoleId) {
      fetchClasses(newEcoleId);
    }
  }, [ecoleId, fetchClasses]);

  // Récupération automatique au montage si autoFetch est true
  useEffect(() => {
    if (autoFetch && ecoleId) {
      fetchClasses();
    }
  }, [autoFetch, ecoleId, fetchClasses]);

  // Fonction pour obtenir une classe par ID
  const getClasseById = useCallback((classeId) => {
    return classes.find(classe => classe.id === classeId) || null;
  }, [classes]);

  // Fonction pour filtrer les classes par niveau
  const getClassesByNiveau = useCallback((niveau) => {
    return classes.filter(classe => 
      classe.niveau && classe.niveau.toLowerCase() === niveau.toLowerCase()
    );
  }, [classes]);

  // Statistiques des classes
  const stats = {
    total: classes.length,
    totalEffectif: classes.reduce((sum, classe) => sum + (classe.effectif || 0), 0),
    niveaux: [...new Set(classes.map(classe => classe.niveau).filter(Boolean))],
    moyenneEffectif: classes.length > 0 
      ? Math.round(classes.reduce((sum, classe) => sum + (classe.effectif || 0), 0) / classes.length)
      : 0
  };

  return {
    // Données
    classes,
    loading,
    error,
    lastFetch,
    stats,
    
    // Actions
    fetchClasses,
    refresh,
    changeEcole,
    
    // Utilitaires
    getClasseById,
    getClassesByNiveau,
    
    // État
    hasData: classes.length > 0,
    isEmpty: !loading && classes.length === 0,
    hasError: !!error
  };
};

/**
 * Hook pour récupérer une classe spécifique
 * @param {number} ecoleId - ID de l'école
 * @param {number} classeId - ID de la classe
 */
export const useClasse = (ecoleId, classeId) => {
  const [classe, setClasse] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchClasse = useCallback(async () => {
    if (!ecoleId || !classeId) {
      setError('ID d\'école et ID de classe requis');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await classesApi.getClasseById(ecoleId, classeId);
      
      if (result.success) {
        setClasse(result.data);
      } else {
        setError(result.message);
        setClasse(null);
      }
    } catch (err) {
      setError(err.message || 'Erreur lors de la récupération de la classe');
      setClasse(null);
    } finally {
      setLoading(false);
    }
  }, [ecoleId, classeId]);

  useEffect(() => {
    if (ecoleId && classeId) {
      fetchClasse();
    }
  }, [ecoleId, classeId, fetchClasse]);

  return {
    classe,
    loading,
    error,
    fetchClasse,
    hasData: !!classe,
    hasError: !!error
  };
};
