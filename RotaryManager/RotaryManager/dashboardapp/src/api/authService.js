// ⚠️ IMPORTANT: Mettez à jour cette URL avec votre URL ngrok actuelle
// Pour obtenir votre URL ngrok, exécutez: ngrok http 5265
const BASE_URL = 'https://REMPLACEZ-PAR-VOTRE-URL-NGROK.ngrok-free.app';

export async function register(data) {
  console.log('📝 === REGISTER REQUEST ===');
  console.log('📝 URL:', `${BASE_URL}/api/Auth/register`);
  console.log('📝 Data:', { ...data, password: '[MASKED]' });

  const response = await fetch(`${BASE_URL}/api/Auth/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'ngrok-skip-browser-warning': 'true',
    },
    body: JSON.stringify(data),
  });

  console.log('📝 Response status:', response.status);
  const result = await response.json();
  console.log('📝 Response data:', result);
  return result;
}

export async function getClubs() {
  console.log('🏢 === GET CLUBS REQUEST ===');
  console.log('🏢 URL:', `${BASE_URL}/api/Clubs`);

  const response = await fetch(`${BASE_URL}/api/Clubs`, {
    method: 'GET',
    headers: {
      'Accept': 'application/json',
      'ngrok-skip-browser-warning': 'true',
    },
  });

  console.log('🏢 Response status:', response.status);
  console.log('🏢 Response ok:', response.ok);

  if (!response.ok) {
    const errorText = await response.text();
    console.error('🏢 Error response:', errorText);
    throw new Error(`HTTP ${response.status}: ${errorText}`);
  }

  const result = await response.json();
  console.log('🏢 Clubs received:', result);
  console.log('🏢 Number of clubs:', Array.isArray(result) ? result.length : 'Not an array');
  return result;
}

export async function login(data) {
  console.log('🔐 === LOGIN REQUEST ===');
  console.log('🔐 URL:', `${BASE_URL}/api/Auth/login`);
  console.log('🔐 Data:', { ...data, password: '[MASKED]' });

  const response = await fetch(`${BASE_URL}/api/Auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'ngrok-skip-browser-warning': 'true',
    },
    body: JSON.stringify(data),
  });

  console.log('🔐 Response status:', response.status);
  console.log('🔐 Response ok:', response.ok);

  if (!response.ok) {
    const errorText = await response.text();
    console.error('🔐 Error response:', errorText);
    throw new Error(`HTTP ${response.status}: ${errorText}`);
  }

  const result = await response.json();
  console.log('🔐 Login response:', { ...result, token: result.token ? '[TOKEN_PRESENT]' : '[NO_TOKEN]' });
  return result;
}