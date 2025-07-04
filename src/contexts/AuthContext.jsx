import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('token') || '');
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    const savedToken = localStorage.getItem('token');
    return !!savedToken;
  });
  const [selectedEnfant, setSelectedEnfant] = useState(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      const userData = JSON.parse(savedUser);
      return userData.enfants && userData.enfants.length > 0 ? userData.enfants[0] : null;
    }
    return null;
  });

  useEffect(() => {
    if (token) {
      setIsAuthenticated(true);
      localStorage.setItem('token', token);
      if (user) {
        localStorage.setItem('user', JSON.stringify(user));
        if (user.enfants && user.enfants.length > 0 && !selectedEnfant) {
          setSelectedEnfant(user.enfants[0]);
        }
      }
    } else {
      setIsAuthenticated(false);
      setUser(null);
      setSelectedEnfant(null);
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
  }, [token, user, selectedEnfant]);

  const login = (userData, jwtToken) => {
    console.log('Connexion utilisateur:', userData);
    setUser(userData);
    setToken(jwtToken);
    setIsAuthenticated(true);
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('token', jwtToken);
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
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('school');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        token,
        selectedEnfant,
        setSelectedEnfant,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext); 