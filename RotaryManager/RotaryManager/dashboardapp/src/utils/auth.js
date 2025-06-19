import { API_URL } from '../config';
import axios from 'axios';

// Configuration d'axios pour les requêtes d'authentification
const authAxios = axios.create({
    baseURL: API_URL,
    timeout: 30000,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    },
    withCredentials: false, // Désactiver withCredentials car le serveur utilise *
    validateStatus: function (status) {
        return status >= 200 && status < 500;
    }
});

// Intercepteur pour gérer les erreurs de réseau
authAxios.interceptors.response.use(
    response => response,
    error => {
        if (error.code === 'ECONNABORTED') {
            throw new Error('La requête a expiré. Veuillez réessayer.');
        }
        if (error.message === 'Network Error' || error.message.includes('ERR_INCOMPLETE_CHUNKED_ENCODING')) {
            throw new Error('Erreur de connexion au serveur. Veuillez vérifier votre connexion.');
        }
        throw error;
    }
);

const isTokenExpired = (token) => {
    try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        return payload.exp * 1000 < Date.now();
    } catch (error) {
        return true;
    }
};

const refreshToken = async () => {
    try {
        const response = await authAxios.post('/auth/refresh');
        if (response.data && response.data.token) {
            localStorage.setItem('token', response.data.token);
            return response.data.token;
        }
        throw new Error('Invalid refresh token response');
    } catch (error) {
        console.error('Error refreshing token:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
        throw error;
    }
};

export const fetchWithAuth = async (url, options = {}) => {
    let token = localStorage.getItem('token');
    
    if (token && isTokenExpired(token)) {
        try {
            token = await refreshToken();
        } catch (error) {
            throw error;
        }
    }

    const headers = {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
        ...options.headers,
    };

    try {
        const response = await authAxios({
            url,
            method: options.method || 'GET',
            headers,
            data: options.body,
            params: options.params,
            responseType: 'json'
        });

        if (response.status === 401) {
            token = await refreshToken();
            headers['Authorization'] = `Bearer ${token}`;
            return authAxios({
                url,
                method: options.method || 'GET',
                headers,
                data: options.body,
                params: options.params,
                responseType: 'json'
            });
        }

        return response;
    } catch (error) {
        if (error.response && error.response.status === 401) {
            window.location.href = '/login';
        }
        throw error;
    }
}; 