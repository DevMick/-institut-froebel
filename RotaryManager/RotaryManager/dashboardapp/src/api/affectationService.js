const BASE_URL = 'http://localhost:5265';

export const getAffectations = async () => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${BASE_URL}/api/affectations`, {
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        }
    });
    if (!response.ok) {
        throw new Error('Erreur lors de la récupération des affectations');
    }
    return response.json();
};

export const getAffectation = async (id) => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${BASE_URL}/api/affectations/${id}`, {
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        }
    });
    if (!response.ok) {
        throw new Error('Erreur lors de la récupération de l\'affectation');
    }
    return response.json();
};

export const createAffectation = async (data) => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${BASE_URL}/api/affectations`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    });
    if (!response.ok) {
        throw new Error('Erreur lors de la création de l\'affectation');
    }
    return response.json();
};

export const updateAffectation = async (id, data) => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${BASE_URL}/api/affectations/${id}`, {
        method: 'PUT',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    });
    if (!response.ok) {
        throw new Error('Erreur lors de la mise à jour de l\'affectation');
    }
    return response.json();
};

export const deleteAffectation = async (id) => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${BASE_URL}/api/affectations/${id}`, {
        method: 'DELETE',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        }
    });
    if (!response.ok) {
        throw new Error('Erreur lors de la suppression de l\'affectation');
    }
    return response.json();
}; 