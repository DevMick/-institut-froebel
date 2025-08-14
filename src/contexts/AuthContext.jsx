import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  // Initialiser tous les états à "déconnecté" par défaut
  const [user, setUser] = useState(null);
  const [token, setToken] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [selectedEnfant, setSelectedEnfant] = useState(null);

  // Fonction de nettoyage du localStorage
  const clearAuthData = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('school');
  };

  // Vérifier l'authentification au montage du composant
  useEffect(() => {
    const checkAuthOnMount = () => {
      try {
        const savedToken = localStorage.getItem('token');
        const savedUser = localStorage.getItem('user');

        console.log('Vérification auth au montage:', { savedToken: !!savedToken, savedUser: !!savedUser });

        // Vérifier que nous avons les deux éléments et qu'ils sont valides
        if (savedToken && savedToken.trim() !== '' && savedUser) {
          const userData = JSON.parse(savedUser);

          // Vérifier que l'utilisateur a au moins un nom et prénom (pour tous les types d'utilisateurs)
          if (userData && (userData.id || userData.nom || userData.prenom)) {
            console.log('Restauration de la session utilisateur:', userData.prenom, userData.nom);
            setUser(userData);
            setToken(savedToken);
            setIsAuthenticated(true);

            // Seulement pour les parents qui ont des enfants
            if (userData.enfants && userData.enfants.length > 0) {
              setSelectedEnfant(userData.enfants[0]);
            }
            return;
          }
        }

        // Si nous arrivons ici, les données ne sont pas valides
        console.log('Aucune session valide trouvée, nettoyage...');
        clearAuthData();
        setUser(null);
        setToken('');
        setIsAuthenticated(false);
        setSelectedEnfant(null);

      } catch (error) {
        console.error('Erreur lors de la vérification de l\'authentification:', error);
        clearAuthData();
        setUser(null);
        setToken('');
        setIsAuthenticated(false);
        setSelectedEnfant(null);
      }
    };

    checkAuthOnMount();
  }, []); // Exécuter seulement au montage

  useEffect(() => {
    if (token && token.trim() !== '' && user && user.id) {
      setIsAuthenticated(true);
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      if (user.enfants && user.enfants.length > 0 && !selectedEnfant) {
        setSelectedEnfant(user.enfants[0]);
      }
    } else if (!token || !user) {
      // Si les données ne sont pas cohérentes, nettoyer complètement
      setIsAuthenticated(false);
      setUser(null);
      setSelectedEnfant(null);
      clearAuthData();
    }
  }, [token, user, selectedEnfant]);

  const login = (userData, jwtToken) => {
    console.log('Connexion utilisateur:', userData);
    setUser(userData);
    setToken(jwtToken);
    setIsAuthenticated(true);
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('token', jwtToken);

    // Les enfants seront récupérés séparément via l'API
    if (userData.enfants && userData.enfants.length > 0) {
      setSelectedEnfant(userData.enfants[0]);
    }
  };

  const logout = () => {
    console.log('Déconnexion utilisateur');
    setUser(null);
    setToken('');
    setIsAuthenticated(false);
    setSelectedEnfant(null);
    clearAuthData();
  };

  const selectEnfant = (enfant) => {
    setSelectedEnfant(enfant);
    localStorage.setItem('selectedEnfant', JSON.stringify(enfant));
  };

  const updateEnfants = (enfants) => {
    if (user) {
      const updatedUser = { ...user, enfants };
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));

      // Sélectionner le premier enfant par défaut si aucun n'est sélectionné
      if (enfants.length > 0 && !selectedEnfant) {
        setSelectedEnfant(enfants[0]);
        localStorage.setItem('selectedEnfant', JSON.stringify(enfants[0]));
      }
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        token,
        selectedEnfant,
        setSelectedEnfant,
        selectEnfant,
        updateEnfants,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext); 