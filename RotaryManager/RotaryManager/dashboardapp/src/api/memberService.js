const BASE_URL = 'http://localhost:5265';

const fetchWithAuth = async (url, options = {}) => {
  const token = localStorage.getItem('token');
  if (!token) {
    throw new Error('Non authentifié');
  }

  const response = await fetch(url, {
    ...options,
    headers: {
      ...options.headers,
      'Accept': 'application/json',
      'Authorization': `Bearer ${token}`
    },
  });

  if (response.status === 401) {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
    throw new Error('Session expirée');
  }

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || `Erreur ${response.status}: ${response.statusText}`);
  }

  return response;
};

// Récupérer la liste des membres du club de l'utilisateur connecté
export async function getClubMembers(clubId) {
  console.log('=== getClubMembers appelée ===');
  console.log('clubId:', clubId);
  
  try {
    const url = `${BASE_URL}/api/Auth/club/${clubId}/members`;
    console.log('URL appelée:', url);
    
    const response = await fetchWithAuth(url);
    console.log('Response status:', response.status);
    console.log('Response ok:', response.ok);
    
    if (!response.ok) {
      console.error('Erreur de réponse:', response.status, response.statusText);
      throw new Error(`Erreur ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log('Données brutes reçues:', data);
    
    if (data && data.success && data.members) {
      console.log('Membres trouvés:', data.members);
      console.log('Nombre de membres:', data.members.length);
      
      // Transformer les données pour correspondre au format attendu
      const membresFormattes = data.members.map(membre => ({
        id: membre.id,
        firstName: membre.firstName,
        lastName: membre.lastName,
        email: membre.email,
        phoneNumber: membre.phoneNumber,
        isActive: membre.isActive,
        roles: membre.roles,
        profilePictureUrl: membre.profilePictureUrl,
        joinedDate: membre.userJoinedDate, // Utiliser userJoinedDate pour la date d'adhésion
        nomComplet: membre.fullName
      }));
      
      console.log('Membres formatés:', membresFormattes);
      return membresFormattes;
    } else {
      console.log('Aucun membre trouvé dans la réponse');
      return [];
    }
  } catch (error) {
    console.error('Erreur lors de la récupération des membres:', error);
    throw error;
  }
}

// Ajouter un nouveau membre au club
export async function addMember(data) {
  try {
    const response = await fetchWithAuth(`${BASE_URL}/api/Auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    return response.json();
  } catch (error) {
    console.error('Erreur lors de l\'ajout du membre:', error);
    throw error;
  }
}

// Mettre à jour un membre
export async function updateMember(clubId, userId, data) {
  try {
    const response = await fetchWithAuth(`${BASE_URL}/api/clubs/${clubId}/members/${userId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    return response.json();
  } catch (error) {
    console.error('Erreur lors de la mise à jour du membre:', error);
    throw error;
  }
}

// Supprimer définitivement un membre
export async function deleteMember(clubId, userId) {
  try {
    console.log('Tentative de suppression du membre:', { clubId, userId });
    const url = `${BASE_URL}/api/auth/club/${clubId}/member/${userId}`;
    console.log('URL de suppression:', url);
    
    const response = await fetchWithAuth(url, {
      method: 'DELETE',
    });
    
    console.log('Statut de la réponse:', response.status);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      console.error('Erreur de réponse:', {
        status: response.status,
        statusText: response.statusText,
        errorData
      });
      throw new Error(errorData?.Message || `Erreur ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log('Réponse de suppression:', data);
    return data;
  } catch (error) {
    console.error('Erreur lors de la suppression du membre:', error);
    throw error;
  }
}

export async function getMemberDetail(clubId, userId) {
  try {
    const response = await fetchWithAuth(`${BASE_URL}/api/clubs/${clubId}/members/${userId}`);
    return response.json();
  } catch (error) {
    console.error('Erreur lors de la récupération des détails du membre:', error);
    throw error;
  }
}

// Récupérer un membre par email et clubId
export async function getMemberByEmail(clubId, email) {
  try {
    const response = await fetchWithAuth(`${BASE_URL}/api/clubs/${clubId}/members/by-email/${encodeURIComponent(email)}`);
    return response.json();
  } catch (error) {
    console.error('Erreur lors de la récupération du membre par email:', error);
    throw error;
  }
}

// Récupérer le profil utilisateur connecté
export async function getCurrentProfile() {
  try {
    const response = await fetchWithAuth(`${BASE_URL}/api/profile`);
    return response.json();
  } catch (error) {
    console.error('Erreur lors de la récupération du profil utilisateur:', error);
    throw error;
  }
} 