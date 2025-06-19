import axios from 'axios';
import { fetchWithAuth } from './clubService';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5265/api';

// Add axios interceptor for authentication
axios.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

function getClubIdFromStorage() {
  const user = localStorage.getItem('user');
  if (user) {
    try {
      const userData = JSON.parse(user);
      return userData.clubId;
    } catch (e) {
      return null;
    }
  }
  return null;
}

export const getComites = async (clubId) => {
  const realClubId = clubId || getClubIdFromStorage();
  if (!realClubId) throw new Error('ClubId non trouvé');
  try {
    const response = await axios.get(`${API_URL}/clubs/${realClubId}/comites`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data || 'Erreur lors de la récupération des comités');
  }
};

export const getComite = async (clubId, id) => {
  const realClubId = clubId || getClubIdFromStorage();
  if (!realClubId) throw new Error('ClubId non trouvé');
  try {
    const response = await axios.get(`${API_URL}/clubs/${realClubId}/comites/${id}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data || 'Erreur lors de la récupération du comité');
  }
};

export const createComite = async (clubId, comite) => {
  const realClubId = clubId || getClubIdFromStorage();
  if (!realClubId) throw new Error('ClubId non trouvé');
  try {
    const response = await axios.post(`${API_URL}/clubs/${realClubId}/comites`, comite);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data || 'Erreur lors de la création du comité');
  }
};

export const updateComite = async (clubId, id, comite) => {
  const realClubId = clubId || getClubIdFromStorage();
  if (!realClubId) throw new Error('ClubId non trouvé');
  try {
    const response = await axios.put(`${API_URL}/clubs/${realClubId}/comites/${id}`, comite);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data || 'Erreur lors de la mise à jour du comité');
  }
};

export const deleteComite = async (clubId, id) => {
  const realClubId = clubId || getClubIdFromStorage();
  if (!realClubId) throw new Error('ClubId non trouvé');
  try {
    const response = await axios.delete(`${API_URL}/clubs/${realClubId}/comites/${id}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data || 'Erreur lors de la suppression du comité');
  }
};

export const getComitesByMandat = async (clubId, mandatId) => {
  const realClubId = clubId || getClubIdFromStorage();
  if (!realClubId) throw new Error('ClubId non trouvé');
  try {
    const response = await axios.get(`${API_URL}/clubs/${realClubId}/comites/by-mandat/${mandatId}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data || 'Erreur lors de la récupération des comités du mandat');
  }
};

export async function searchComites(searchTerm) {
  const token = localStorage.getItem('token');
  const response = await fetch(`${API_URL}/comites/search?searchTerm=${encodeURIComponent(searchTerm)}`, {
    method: 'GET',
    headers: {
      'Accept': 'application/json',
      'Authorization': `Bearer ${token}`
    },
  });
  return response.json();
}

export async function getComitesByClub(clubId) {
  const response = await fetchWithAuth(`${API_URL}/clubs/${clubId}/comites`, {
    method: 'GET',
    headers: { 'Accept': 'application/json' },
  });
  
  if (!response.ok) {
    throw new Error(`Erreur ${response.status}: ${response.statusText}`);
  }
  
  return response.json();
}

export async function getClubComiteMembers(clubId, comiteId) {
  try {
    if (!comiteId || comiteId === 'undefined') {
      return {
        Comite: {
          Id: '',
          Nom: '',
          MandatId: '',
          MandatAnnee: '',
          MandatDescription: ''
        },
        Membres: [],
        Statistiques: {
          TotalMembres: 0,
          MembresActifs: 0,
          MembresInactifs: 0,
          FonctionsDistinctes: 0
        }
      };
    }

    const response = await fetchWithAuth(`${API_URL}/clubs/${clubId}/comites/${comiteId}/membres`, {
      method: 'GET',
      headers: { 'Accept': 'application/json' },
    });
    
    if (!response.ok) {
      throw new Error(`Erreur ${response.status}: ${response.statusText}`);
    }
    
    return response.json();
  } catch (error) {
    console.error('Erreur lors de la récupération des membres du comité:', error);
    return {
      Comite: {
        Id: '',
        Nom: '',
        MandatId: '',
        MandatAnnee: '',
        MandatDescription: ''
      },
      Membres: [],
      Statistiques: {
        TotalMembres: 0,
        MembresActifs: 0,
        MembresInactifs: 0,
        FonctionsDistinctes: 0
      }
    };
  }
}

export async function assignMemberToComite(clubId, comiteId, data) {
  const response = await fetchWithAuth(
    `${API_URL}/clubs/${clubId}/comites/${comiteId}/membres`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data)
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText);
  }

  return response.json();
}

export async function removeMemberFromComite(clubId, comiteId, comiteMembreId) {
  const response = await fetchWithAuth(
    `${API_URL}/clubs/${clubId}/comites/${comiteId}/membres/${comiteMembreId}`,
    {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      }
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText);
  }

  return response.status === 204;
}

export async function updateAffectationMembre(clubId, comiteId, comiteMembreId, data) {
  console.log('Appel API updateAffectationMembre avec:', {
    clubId,
    comiteId,
    comiteMembreId,
    data
  });

  const response = await fetchWithAuth(
    `${API_URL}/clubs/${clubId}/comites/${comiteId}/membres/${comiteMembreId}`,
    {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data)
    }
  );

  console.log('Réponse API updateAffectationMembre:', {
    status: response.status,
    statusText: response.statusText
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Erreur API updateAffectationMembre:', errorText);
    throw new Error(errorText || `Erreur ${response.status}: ${response.statusText}`);
  }

  // Si la réponse est 204 (No Content), retourner true pour indiquer le succès
  if (response.status === 204) {
    return true;
  }

  // Sinon, essayer de parser le JSON de la réponse
  try {
    return await response.json();
  } catch (error) {
    console.warn('Pas de contenu JSON dans la réponse:', error);
    return true;
  }
} 