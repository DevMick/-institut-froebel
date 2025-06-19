import { isTokenValid, refreshToken, fetchWithAuth } from './clubService';

const BASE_URL = 'http://localhost:5265';

export const getCommissions = async () => {
  try {
    const response = await fetchWithAuth(`${BASE_URL}/api/Commissions`);
    if (!response.ok) {
      throw new Error('Erreur lors de la récupération des commissions');
    }
    return await response.json();
  } catch (error) {
    console.error('Erreur dans getCommissions:', error);
    throw error;
  }
};

export async function getCommission(id) {
  const response = await fetchWithAuth(`${BASE_URL}/api/Commissions/${id}`, {
    method: 'GET',
    headers: { 'Accept': 'application/json' },
  });
  
  if (!response.ok) {
    throw new Error(`Erreur ${response.status}: ${response.statusText}`);
  }
  
  return response.json();
}

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

export async function getCommissionsByClub(clubId) {
  console.log('=== DEBUG getCommissionsByClub ===');
  console.log('clubId reçu:', clubId);
  
  const realClubId = clubId || getClubIdFromStorage();
  console.log('realClubId utilisé:', realClubId);
  
  if (!realClubId) throw new Error('ClubId non trouvé');
  
  const url = `${BASE_URL}/api/commissions/club/${realClubId}`;
  console.log('URL appelée:', url);
  
  try {
    const response = await fetchWithAuth(url, {
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
    console.log('Données reçues:', data);
    return data;
  } catch (error) {
    console.error('Erreur complète:', error);
    throw error;
  }
}

export async function getActiveCommissionsByClub(clubId) {
  const response = await fetchWithAuth(`${BASE_URL}/api/clubs/${clubId}/commissions/actives`, {
    method: 'GET',
    headers: { 'Accept': 'application/json' },
  });
  
  if (!response.ok) {
    throw new Error(`Erreur ${response.status}: ${response.statusText}`);
  }
  
  return response.json();
}

export async function getCommissionMembers(commissionId) {
  const response = await fetchWithAuth(`${BASE_URL}/api/Commissions/${commissionId}/membres`, {
    method: 'GET',
    headers: { 'Accept': 'application/json' },
  });
  
  if (!response.ok) {
    throw new Error(`Erreur ${response.status}: ${response.statusText}`);
  }
  
  return response.json();
}

export async function getClubCommissionMembers(clubId, commissionClubId) {
  try {
    if (!commissionClubId || commissionClubId === 'undefined') {
      return {
        Commission: {
          Id: '',
          Nom: '',
          Description: '',
          EstActive: false,
          NotesSpecifiques: ''
        },
        Club: {
          Id: clubId,
          Name: '',
          Code: ''
        },
        Membres: [],
        Statistiques: {
          TotalMembres: 0,
          MembresActifs: 0,
          Responsables: 0,
          MembresInactifs: 0
        }
      };
    }

    const response = await fetchWithAuth(`${BASE_URL}/api/clubs/${clubId}/commissions/${commissionClubId}/membres`, {
      method: 'GET',
      headers: { 'Accept': 'application/json' },
    });
    
    if (!response.ok) {
      throw new Error(`Erreur ${response.status}: ${response.statusText}`);
    }
    
    return response.json();
  } catch (error) {
    console.error('Erreur lors de la récupération des membres de la commission:', error);
    return {
      Commission: {
        Id: '',
        Nom: '',
        Description: '',
        EstActive: false,
        NotesSpecifiques: ''
      },
      Club: {
        Id: clubId,
        Name: '',
        Code: ''
      },
      Membres: [],
      Statistiques: {
        TotalMembres: 0,
        MembresActifs: 0,
        Responsables: 0,
        MembresInactifs: 0
      }
    };
  }
}

export async function getClubCommission(clubId, commissionClubId) {
  const response = await fetchWithAuth(`${BASE_URL}/api/clubs/${clubId}/commissions/${commissionClubId}`, {
    method: 'GET',
    headers: { 'Accept': 'application/json' },
  });
  
  if (!response.ok) {
    throw new Error(`Erreur ${response.status}: ${response.statusText}`);
  }
  
  return response.json();
}

export const createCommission = async (commissionData) => {
  const realClubId = commissionData.clubId || getClubIdFromStorage();
  if (!realClubId) return { success: false, error: { message: 'ClubId non trouvé' } };
  const dataToSend = { ...commissionData, clubId: realClubId };
  try {
    const response = await fetchWithAuth(`${BASE_URL}/api/Commissions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(dataToSend),
    });
    if (!response.ok) {
      const errorText = await response.text();
      return { success: false, error: { message: errorText } };
    }
    return { success: true, data: await response.json() };
  } catch (error) {
    console.error('Erreur dans createCommission:', error);
    return { success: false, error: { message: error.message } };
  }
};

export async function updateCommission(id, commission) {
  try {
    // Préparer les données selon le format attendu par l'API .NET
    const updateData = {
      nom: commission.nom,
      description: commission.description
    };
    
    console.log('=== DEBUG updateCommission ===');
    console.log('ID:', id);
    console.log('Données envoyées:', updateData);
    
    const response = await fetchWithAuth(`${BASE_URL}/api/Commissions/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updateData), // Envoyer directement updateData, pas { dto: ... }
    });
    
    console.log('Status de la réponse:', response.status);
    
    if (!response.ok) {
      let errorData;
      try {
        errorData = await response.text(); // Récupérer le texte d'erreur
        console.log('Erreur API:', errorData);
      } catch (e) {
        errorData = `Erreur ${response.status}: ${response.statusText}`;
      }
      
      return {
        success: false,
        error: { message: errorData },
        status: response.status
      };
    }
    
    console.log('Mise à jour réussie !');
    return {
      success: true
    };
  } catch (error) {
    console.error('Erreur dans updateCommission:', error);
    return {
      success: false,
      error: { message: error.message },
      status: 500
    };
  }
}

export const deleteCommission = async (id) => {
  try {
    const response = await fetchWithAuth(`${BASE_URL}/api/Commissions/${id}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      const errorData = await response.json();
      return { success: false, error: errorData };
    }

    return { success: true };
  } catch (error) {
    console.error('Erreur dans deleteCommission:', error);
    return { success: false, error };
  }
};

export const activateCommission = async (id) => {
  try {
    const response = await fetchWithAuth(`${BASE_URL}/api/Commissions/${id}/activate`, {
      method: 'PUT',
    });

    if (!response.ok) {
      const errorData = await response.json();
      return { success: false, error: errorData };
    }

    return { success: true, data: await response.json() };
  } catch (error) {
    console.error('Erreur dans activateCommission:', error);
    return { success: false, error };
  }
};

export const deactivateCommission = async (id) => {
  try {
    const response = await fetchWithAuth(`${BASE_URL}/api/Commissions/${id}/deactivate`, {
      method: 'PUT',
    });

    if (!response.ok) {
      const errorData = await response.json();
      return { success: false, error: errorData };
    }

    return { success: true, data: await response.json() };
  } catch (error) {
    console.error('Erreur dans deactivateCommission:', error);
    return { success: false, error };
  }
};

export async function assignCommissionToClub(request) {
  try {
    const response = await fetchWithAuth(`${BASE_URL}/api/clubs/${request.clubId}/commissions/affecter`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        commissionId: request.commissionId,
        estActive: request.estActive,
        notesSpecifiques: request.notesSpecifiques
      }),
    });
    
    if (!response.ok) {
      let errorData;
      try {
        errorData = await response.json();
      } catch (e) {
        errorData = { message: `Erreur ${response.status}: ${response.statusText}` };
      }
      
      return {
        success: false,
        error: errorData,
        status: response.status
      };
    }
    
    const data = await response.json();
    return {
      success: true,
      data
    };
  } catch (error) {
    return {
      success: false,
      error: { message: error.message },
      status: 500
    };
  }
}

export async function updateClubCommission(clubId, commissionClubId, request) {
  try {
    const response = await fetchWithAuth(`${BASE_URL}/api/clubs/${clubId}/commissions/${commissionClubId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });
    
    if (!response.ok) {
      let errorData;
      try {
        errorData = await response.json();
      } catch (e) {
        errorData = { message: `Erreur ${response.status}: ${response.statusText}` };
      }
      
      return {
        success: false,
        error: errorData,
        status: response.status
      };
    }
    
    return {
      success: true
    };
  } catch (error) {
    return {
      success: false,
      error: { message: error.message },
      status: 500
    };
  }
}

export async function activateClubCommission(clubId, commissionClubId) {
  try {
    const response = await fetchWithAuth(`${BASE_URL}/api/clubs/${clubId}/commissions/${commissionClubId}/activate`, {
      method: 'POST',
    });
    
    if (!response.ok) {
      return {
        success: false,
        status: response.status
      };
    }
    
    return {
      success: true
    };
  } catch (error) {
    return {
      success: false,
      error: { message: error.message },
      status: 500
    };
  }
}

export async function deactivateClubCommission(clubId, commissionClubId) {
  try {
    const response = await fetchWithAuth(`${BASE_URL}/api/clubs/${clubId}/commissions/${commissionClubId}/deactivate`, {
      method: 'POST',
    });
    
    if (!response.ok) {
      return {
        success: false,
        status: response.status
      };
    }
    
    return {
      success: true
    };
  } catch (error) {
    return {
      success: false,
      error: { message: error.message },
      status: 500
    };
  }
}

export async function deleteClubCommission(clubId, commissionClubId) {
  try {
    const response = await fetchWithAuth(`${BASE_URL}/api/clubs/${clubId}/commissions/${commissionClubId}`, {
      method: 'DELETE',
    });
    
    if (!response.ok) {
      let errorData;
      try {
        errorData = await response.json();
      } catch (e) {
        errorData = { message: `Erreur ${response.status}: ${response.statusText}` };
      }
      
      return {
        success: false,
        error: errorData,
        status: response.status
      };
    }
    
    return {
      success: true
    };
  } catch (error) {
    return {
      success: false,
      error: { message: error.message },
      status: 500
    };
  }
}

export async function assignMemberToCommission(clubId, commissionClubId, data) {
  const token = localStorage.getItem('token');
  const response = await fetch(
    `${BASE_URL}/api/clubs/${clubId}/commissions/${commissionClubId}/membres`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
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

export async function removeMemberFromCommission(clubId, commissionClubId, membreCommissionId, mandatId = null) {
  const token = localStorage.getItem('token');
  let url = `${BASE_URL}/api/clubs/${clubId}/commissions/${commissionClubId}/membres/${membreCommissionId}`;
  
  // Ajouter le paramètre mandatId s'il est fourni
  if (mandatId) {
    url += `?mandatId=${mandatId}`;
  }

  const response = await fetch(url, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText);
  }

  return response.status === 204;
}

export async function updateAffectationMembre(clubId, commissionClubId, membreCommissionId, data) {
  const token = localStorage.getItem('token');
  const response = await fetch(
    `${BASE_URL}/api/clubs/${clubId}/commissions/${commissionClubId}/membres/${membreCommissionId}`,
    {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(data)
    }
  );
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText);
  }
  return response.status === 204;
} 