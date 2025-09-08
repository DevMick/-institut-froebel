// Configuration Template pour Expo Snack - Rotary Club Mobile
// ⚠️ IMPORTANT: Copiez ce fichier vers 'config.js' et mettez à jour vos valeurs

export const API_CONFIG = {
  // ⚠️ REMPLACEZ PAR VOTRE URL NGROK ACTUELLE
  // 1. Démarrez votre API backend localement (port 5265)
  // 2. Exécutez: ngrok http 5265
  // 3. Copiez l'URL HTTPS (ex: https://abc123.ngrok-free.app)
  // 4. Collez-la ci-dessous
  BASE_URL: 'https://1bb90ebd0e23.ngrok-free.app',
  
  API_PREFIX: '/api',
  TIMEOUT: 10000,
};

// Informations du club par défaut (optionnel)
export const CLUB_INFO = {
  name: 'Rotary Club Abidjan II Plateaux',
  city: 'Abidjan',
  country: 'Côte d\'Ivoire',
  founded: '1988'
};

// Instructions pour obtenir votre URL ngrok :
// 1. Installez ngrok: https://ngrok.com/download
// 2. Démarrez votre API backend sur le port 5265
// 3. Dans un nouveau terminal, exécutez: ngrok http 5265
// 4. Copiez l'URL HTTPS affichée (ex: https://abc123.ngrok-free.app)
// 5. Remplacez BASE_URL ci-dessus par cette URL
// 6. Sauvegardez ce fichier sous le nom 'config.js'
