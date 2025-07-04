import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const ProtectedRoute = ({ children, requiredRoles = [] }) => {
  const { isAuthenticated, user } = useAuth();
  const location = useLocation();

  // Si l'utilisateur n'est pas authentifié, rediriger vers la page de connexion
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Si des rôles sont requis, vérifier que l'utilisateur a au moins un des rôles requis
  if (requiredRoles.length > 0) {
    const userRoles = user?.roles || [];
    const hasRequiredRole = requiredRoles.some(role => userRoles.includes(role));
    
    if (!hasRequiredRole) {
      // Rediriger vers la page d'accueil si l'utilisateur n'a pas les permissions
      return <Navigate to="/" replace />;
    }
  }

  // Si tout est OK, afficher le contenu protégé
  return children;
};

export default ProtectedRoute; 