import React from 'react';
import { Navigate } from 'react-router-dom';

const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  const userInfo = JSON.parse(localStorage.getItem('user') || '{}');
  const clubId = userInfo?.clubId;
  
  if (!token || !clubId) {
    // Rediriger vers la page de connexion si l'utilisateur n'est pas authentifié ou n'a pas de club sélectionné
    return <Navigate to="/login" replace />;
  }

  // Si l'utilisateur est authentifié et a un club sélectionné, afficher le composant enfant
  return children;
};

export default PrivateRoute; 