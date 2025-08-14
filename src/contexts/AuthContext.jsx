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
          try {
            const userData = JSON.parse(savedUser);

            // Vérifier que l'utilisateur a au moins un identifiant (plus flexible)
            if (userData && (userData.id || userData.email || userData.nom)) {
              console.log('Restauration de la session utilisateur:', userData);
              setUser(userData);
              setToken(savedToken);
              setIsAuthenticated(true);

              // Restaurer l'enfant sélectionné s'il existe
              const savedSelectedEnfant = localStorage.getItem('selectedEnfant');
              if (savedSelectedEnfant) {
                try {
                  setSelectedEnfant(JSON.parse(savedSelectedEnfant));
                } catch (e) {
                  console.warn('Erreur lors de la restauration de l\'enfant sélectionné');
                }
              }

              return;
            }
          } catch (parseError) {
            console.error('Erreur lors du parsing des données utilisateur:', parseError);
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

  // Synchroniser l'état d'authentification avec le localStorage
  useEffect(() => {
    if (token && token.trim() !== '' && user) {
      setIsAuthenticated(true);
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
    } else if (!token || !user) {
      setIsAuthenticated(false);
    }
  }, [token, user]); // Retirer selectedEnfant pour éviter les boucles

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