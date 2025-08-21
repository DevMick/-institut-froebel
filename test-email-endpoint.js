// Script de test pour l'endpoint d'envoi d'email
const API_URL = 'https://ff51ee175f86.ngrok-free.app/api/Email/send';

// Données de test
const testData = {
  subject: "Test Email",
  message: "Ceci est un test d'envoi d'email",
  recipients: ["devaccrocs@gmail.com"],
  attachments: []
};

async function testEmailEndpoint() {
  try {
    console.log('🧪 Test de l\'endpoint d\'envoi d\'email...');
    console.log('📧 URL:', API_URL);
    console.log('📧 Données:', JSON.stringify(testData, null, 2));

    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'ngrok-skip-browser-warning': 'true',
        // Note: Pas de token pour ce test
      },
      body: JSON.stringify(testData)
    });

    console.log('📊 Status:', response.status);
    console.log('📊 Headers:', Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Erreur:', errorText);
    } else {
      const data = await response.json();
      console.log('✅ Succès:', data);
    }
  } catch (error) {
    console.error('❌ Erreur:', error.message);
  }
}

// Exécuter le test
testEmailEndpoint();
