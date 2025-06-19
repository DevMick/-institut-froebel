// Utilitaire pour vérifier le token
export function isTokenValid(token) {
  if (!token) return false;
  
  try {
    // Décoder le JWT pour vérifier l'expiration
    const payload = JSON.parse(atob(token.split('.')[1]));
    const currentTime = Date.now() / 1000;
    return payload.exp > currentTime;
  } catch (error) {
    console.error('Erreur lors de la vérification du token:', error);
    return false;
  }
}

// Utilitaire pour rafraîchir le token
export async function refreshToken() {
  try {
    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) {
      throw new Error('Pas de refresh token disponible');
    }

    const response = await fetch(`${BASE_URL}/api/Auth/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refreshToken }),
    });

    if (!response.ok) {
      throw new Error('Impossible de rafraîchir le token');
    }

    const data = await response.json();
    localStorage.setItem('token', data.token);
    if (data.refreshToken) {
      localStorage.setItem('refreshToken', data.refreshToken);
    }
    
    return data.token;
  } catch (error) {
    console.error('Erreur lors du rafraîchissement du token:', error);
    // Rediriger vers la page de connexion
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    window.location.href = '/login';
    throw error;
  }
}

const BASE_URL = 'http://localhost:5265';

// Fonction helper pour faire les requêtes avec gestion automatique du token
export async function fetchWithAuth(url, options = {}) {
  let token = localStorage.getItem('token');
  
  // Vérifier si le token est valide
  if (!isTokenValid(token)) {
    console.log('Token expiré, tentative de rafraîchissement...');
    try {
      token = await refreshToken();
    } catch (error) {
      throw new Error('Session expirée. Veuillez vous reconnecter.');
    }
  }
  
  // Ajouter le token aux headers
  const headers = {
    ...options.headers,
    'Authorization': `Bearer ${token}`,
  };
  
  const response = await fetch(url, {
    ...options,
    headers,
  });
  
  // Si 401, essayer une fois de rafraîchir le token
  if (response.status === 401) {
    console.log('401 reçu, tentative de rafraîchissement du token...');
    try {
      token = await refreshToken();
      headers['Authorization'] = `Bearer ${token}`;
      
      // Refaire la requête avec le nouveau token
      return await fetch(url, {
        ...options,
        headers,
      });
    } catch (error) {
      throw new Error('Session expirée. Veuillez vous reconnecter.');
    }
  }
  
  return response;
}

export async function getClubs() {
  const response = await fetch(`${BASE_URL}/api/Clubs`, {
    method: 'GET',
    headers: { 'Accept': 'application/json' },
  });
  
  if (!response.ok) {
    throw new Error(`Erreur ${response.status}: ${response.statusText}`);
  }
  
  return response.json();
}

export async function getClub(id) {
  console.log('=== getClub appelée ===');
  console.log('ID du club:', id);
  
  const response = await fetchWithAuth(`${BASE_URL}/api/Clubs/${id}`, {
    method: 'GET',
    headers: { 'Accept': 'application/json' },
  });
  
  console.log('Status de la réponse:', response.status);
  console.log('Headers de la réponse:', Object.fromEntries(response.headers.entries()));
  
  if (!response.ok) {
    const errorText = await response.text();
    console.error('Erreur API:', errorText);
    throw new Error(`Erreur ${response.status}: ${errorText}`);
  }
  
  const data = await response.json();
  console.log('Données du club reçues:', data);
  return data;
}

export async function getMyClubs() {
  const response = await fetchWithAuth(`${BASE_URL}/api/Clubs/my-clubs`, {
    method: 'GET',
    headers: { 'Accept': 'application/json' },
  });
  
  if (!response.ok) {
    throw new Error(`Erreur ${response.status}: ${response.statusText}`);
  }
  
  return response.json();
}

// Nouvelle fonction pour vérifier si un code de club est unique
export async function checkClubCodeUnique(code, excludeClubId = null) {
  try {
    // Construire l'URL avec ou sans excludeClubId
    let url = `${BASE_URL}/api/Clubs/check-code-unique?code=${encodeURIComponent(code)}`;
    if (excludeClubId) {
      url += `&excludeClubId=${excludeClubId}`;
    }
    
    // Utilisation d'une solution temporaire pour vérifier l'unicité en l'absence d'un endpoint dédié
    const response = await fetchWithAuth(url, {
      method: 'GET',
      headers: { 'Accept': 'application/json' },
    });
    
    if (response.status === 404) {
      // Si l'endpoint n'existe pas, vérifier manuellement en récupérant tous les clubs
      console.warn("L'endpoint de vérification d'unicité n'existe pas, vérification manuelle...");
      const clubs = await getClubs();
      
      // Filtrer les clubs pour voir si le code est déjà utilisé par un autre club
      const existingClub = clubs.find(club => 
        club.code === code && (excludeClubId === null || club.id !== excludeClubId)
      );
      
      // Retourne true si le code est unique (aucun club trouvé avec ce code)
      return !existingClub;
    }
    
    // Si l'endpoint existe, la réponse sera un booléen indiquant si le code est unique
    const data = await response.json();
    return data.isUnique !== undefined ? data.isUnique : true;
  } catch (error) {
    console.error("Erreur lors de la vérification de l'unicité du code:", error);
    // En cas d'erreur, on retourne true pour permettre la continuation du processus
    // Le backend va quand même valider l'unicité
    return true;
  }
}

export async function createClub(club, token) {
  try {
    const response = await fetchWithAuth(`${BASE_URL}/api/Clubs`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(club),
    });
    
    const responseData = await response.json();
    
    if (!response.ok) {
      return {
        success: false,
        error: responseData,
        status: response.status
      };
    }
    
    return {
      success: true,
      data: responseData
    };
  } catch (error) {
    return {
      success: false,
      error: { message: error.message },
      status: 500
    };
  }
}

export async function updateClub(id, club, token) {
  try {
    const response = await fetchWithAuth(`${BASE_URL}/api/Clubs/${id}/info`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(club),
    });
    
    let responseData;
    try {
      responseData = await response.json();
    } catch (e) {
      responseData = { message: `Erreur ${response.status}: ${response.statusText}` };
    }
    
    if (!response.ok) {
      return {
        success: false,
        error: responseData,
        status: response.status
      };
    }
    
    return {
      success: true,
      data: responseData
    };
  } catch (error) {
    return {
      success: false,
      error: { message: error.message },
      status: 500
    };
  }
}

export async function deleteClub(id, token) {
  try {
    const response = await fetchWithAuth(`${BASE_URL}/api/Clubs/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    let responseData;
    try {
      responseData = await response.json();
    } catch (e) {
      responseData = { message: `Erreur ${response.status}: ${response.statusText}` };
    }
    
    if (!response.ok) {
      return {
        success: false,
        error: responseData,
        status: response.status
      };
    }
    
    return {
      success: true,
      data: responseData
    };
  } catch (error) {
    return {
      success: false,
      error: { message: error.message },
      status: 500
    };
  }
}

export async function setAsPrimaryClub(id, token) {
  try {
    const response = await fetchWithAuth(`${BASE_URL}/api/Clubs/${id}/set-as-primary`, {
      method: 'POST',
    });
    return response.ok;
  } catch (error) {
    console.error('Erreur lors de la définition comme club principal:', error);
    return false;
  }
}