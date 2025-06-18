const BASE_URL = 'http://localhost:5265';

export const getMembresComite = async () => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${BASE_URL}/api/MembresComite`, {
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        }
    });
    if (!response.ok) {
        throw new Error('Erreur lors de la récupération des membres des comités');
    }
    return response.json();
};

export const getMembreComite = async (id) => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${BASE_URL}/api/MembresComite/${id}`, {
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        }
    });
    if (!response.ok) {
        throw new Error('Erreur lors de la récupération du membre du comité');
    }
    return response.json();
};

export const createMembreComite = async (data) => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${BASE_URL}/api/MembresComite`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    });
    if (!response.ok) {
        throw new Error('Erreur lors de la création du membre du comité');
    }
    return response.json();
};

export const updateMembreComite = async (id, data) => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${BASE_URL}/api/MembresComite/${id}`, {
        method: 'PUT',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    });
    if (!response.ok) {
        throw new Error('Erreur lors de la mise à jour du membre du comité');
    }
    return response.json();
};

export const deleteMembreComite = async (id) => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${BASE_URL}/api/MembresComite/${id}`, {
        method: 'DELETE',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        }
    });
    if (!response.ok) {
        throw new Error('Erreur lors de la suppression du membre du comité');
    }
    return response.json();
}; 