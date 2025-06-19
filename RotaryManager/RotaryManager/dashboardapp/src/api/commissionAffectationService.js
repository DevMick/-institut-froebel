const BASE_URL = 'http://localhost:5265';

export const getCommissionAffectations = async () => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${BASE_URL}/api/commission-affectations`, {
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        }
    });
    if (!response.ok) {
        throw new Error('Erreur lors de la récupération des affectations de commission');
    }
    return response.json();
};

export const getCommissionAffectation = async (id) => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${BASE_URL}/api/commission-affectations/${id}`, {
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        }
    });
    if (!response.ok) {
        throw new Error('Erreur lors de la récupération de l\'affectation de commission');
    }
    return response.json();
};

export const createCommissionAffectation = async (data) => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${BASE_URL}/api/commission-affectations`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    });
    if (!response.ok) {
        throw new Error('Erreur lors de la création de l\'affectation de commission');
    }
    return response.json();
};

export const updateCommissionAffectation = async (id, data) => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${BASE_URL}/api/commission-affectations/${id}`, {
        method: 'PUT',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    });
    if (!response.ok) {
        throw new Error('Erreur lors de la mise à jour de l\'affectation de commission');
    }
    return response.json();
};

export const deleteCommissionAffectation = async (id) => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${BASE_URL}/api/commission-affectations/${id}`, {
        method: 'DELETE',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        }
    });
    if (!response.ok) {
        throw new Error('Erreur lors de la suppression de l\'affectation de commission');
    }
    return response.json();
}; 