// src/utils/roleUtils.js
// Utilitaires pour la gestion des rôles et permissions

import { jwtDecode } from 'jwt-decode';

// Liste des rôles administratifs
const ADMIN_ROLES = ['Administrator', 'Admin', 'AdminMember', 'SuperAdmin'];

// Liste des rôles qui peuvent gérer un club
const CLUB_MANAGER_ROLES = ['President', 'ClubAdmin', 'VicePresident'];

// Fonction pour vérifier si un rôle est administratif
export const isAdminRole = (role) => {
  return ADMIN_ROLES.includes(role);
};

// Fonction pour vérifier si un rôle peut gérer des clubs
export const isClubManagerRole = (role) => {
  return CLUB_MANAGER_ROLES.includes(role);
};

// Fonction pour vérifier si l'utilisateur peut modifier un club
export const canEditClub = (club, userPermissions) => {
  if (!userPermissions) return false;
  
  // Si admin global, peut tout modifier
  if (isAdminRole(userPermissions.role)) {
    return true;
  }
  
  // Si gestionnaire du club spécifique
  if (isClubManagerRole(userPermissions.role) && userPermissions.clubIds?.includes(club.id)) {
    return true;
  }
  
  return false;
};

// Fonction pour vérifier si l'utilisateur peut créer des clubs
export const canCreateClub = (userPermissions) => {
  return userPermissions && isAdminRole(userPermissions.role);
};

// Fonction pour vérifier si l'utilisateur peut supprimer des clubs
export const canDeleteClub = (club, userPermissions) => {
  if (!userPermissions) return false;
  
  // Seuls les super admins peuvent supprimer
  if (userPermissions.role === 'SuperAdmin' || userPermissions.role === 'Administrator') {
    return true;
  }
  
  return false;
};

// Fonction pour obtenir les permissions textuelles d'un rôle
export const getRolePermissions = (role) => {
  if (isAdminRole(role)) {
    return "Administrateur - Peut créer, modifier et supprimer tous les clubs";
  }
  
  if (isClubManagerRole(role)) {
    return "Gestionnaire de club - Peut modifier les clubs assignés";
  }
  
  return "Utilisateur - Accès en lecture seule";
};

// Fonction pour décoder le token et extraire les informations utilisateur
const decodeToken = (token) => {
  if (!token) return null;
  try {
    return jwtDecode(token);
  } catch (error) {
    console.error("Erreur lors du décodage du token:", error);
    return null;
  }
};

// Récupère les permissions de l'utilisateur basées sur le token stocké
export const getUserPermissions = () => {
  const token = localStorage.getItem('token');
  const decodedToken = decodeToken(token);

  if (!decodedToken) {
    return { 
      role: 'Guest', 
      username: 'Visiteur', 
      userClubs: [], 
      isLoggedIn: false, 
      isAdmin: false, 
      clubId: null,
      isPresident: false,
      isSecretary: false
    }; // Utilisateur non connecté ou token invalide
  }

  // L'API retourne un tableau de rôles, ou un seul rôle comme string. Normalisons cela.
  let roles = [];
  if (decodedToken.role) {
    if (Array.isArray(decodedToken.role)) {
      roles = decodedToken.role;
    } else {
      roles = [decodedToken.role];
    }
  } else if (decodedToken.roles) { // Au cas où la propriété serait "roles"
     if (Array.isArray(decodedToken.roles)) {
      roles = decodedToken.roles;
    } else {
      roles = [decodedToken.roles];
    }
  }
  
  // On prend le premier rôle pour simplifier, ou un rôle par défaut.
  // Idéalement, la gestion des permissions devrait pouvoir gérer plusieurs rôles.
  const primaryRole = roles[0] || 'Member'; // Ou 'Guest' si aucun rôle

  // Extraire l'ID du club directement depuis le champ "ClubId" du token
  const clubIdFromToken = decodedToken.ClubId || null;

  // Construire userClubs pour la cohérence, si d'autres parties du code l'attendent comme un tableau d'objets
  const constructedUserClubs = clubIdFromToken ? [{ id: clubIdFromToken }] : [];

  // Vérifier si le rôle principal est président ou secrétaire
  const isPresident = primaryRole === 'President';
  const isSecretary = primaryRole === 'Secretary';

  return {
    role: primaryRole,
    username: decodedToken.unique_name || decodedToken.name || 'Utilisateur',
    userId: decodedToken.nameid || decodedToken.sub,
    userClubs: constructedUserClubs, // Utiliser le tableau construit
    clubId: clubIdFromToken, // Utiliser l'ID directement extrait du token
    isLoggedIn: true,
    isAdmin: isAdminRole(primaryRole),
    isPresident,
    isSecretary
  };
};

// Fonction pour vérifier si l'utilisateur est admin
// Cette fonction devient moins utile si isAdmin est directement dans l'objet permissions,
// mais on peut la garder pour d'autres usages ou la supprimer.
export const isAdmin = (permissions) => {
  // On peut maintenant utiliser directement permissions.isAdmin si l'objet permissions vient de getUserPermissions
  // Ou, si on reçoit un objet qui n'a que la propriété role :
  return permissions && isAdminRole(permissions.role);
};