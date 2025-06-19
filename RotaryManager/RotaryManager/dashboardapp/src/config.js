// Configuration de l'API
export const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5265/api';
export const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5265';

// Autres configurations globales
export const APP_CONFIG = {
    APP_NAME: 'Rotary Manager',
    VERSION: '1.0.0',
    DEFAULT_PAGE_SIZE: 10,
    DATE_FORMAT: 'DD/MM/YYYY',
    DATETIME_FORMAT: 'DD/MM/YYYY HH:mm',
}; 