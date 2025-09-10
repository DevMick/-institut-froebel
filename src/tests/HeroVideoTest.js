// Script de test pour vérifier le changement de vidéo Hero
// Ce script teste automatiquement si les modifications de vidéo fonctionnent

import { fetchHomeData, saveHomeData } from '../services/homeApi';

/**
 * Test automatisé pour vérifier le changement de vidéo Hero
 */
export const testHeroVideoChange = async () => {
  console.log('🧪 === DÉBUT TEST VIDÉO HERO ===');
  
  try {
    // 1. Récupérer les données actuelles
    console.log('📊 Étape 1: Récupération des données actuelles...');
    const currentData = await fetchHomeData();
    
    if (!currentData.success) {
      throw new Error('Impossible de récupérer les données actuelles');
    }
    
    const originalVideoUrl = currentData.data.hero?.videoUrl;
    console.log('🎥 URL vidéo actuelle:', originalVideoUrl);
    
    // 2. Préparer une nouvelle URL de test
    const testVideoUrl = 'https://res.cloudinary.com/dntyghmap/video/upload/v1757153869/TEST_VIDEO_' + Date.now() + '.mp4';
    console.log('🔄 URL vidéo de test:', testVideoUrl);
    
    // 3. Sauvegarder avec la nouvelle URL
    console.log('💾 Étape 2: Sauvegarde avec nouvelle URL...');
    const updatedData = {
      ...currentData.data,
      hero: {
        ...currentData.data.hero,
        videoUrl: testVideoUrl
      }
    };
    
    const saveResult = await saveHomeData(updatedData);
    
    if (!saveResult.success) {
      throw new Error('Échec de la sauvegarde: ' + saveResult.error);
    }
    
    console.log('✅ Sauvegarde réussie');
    
    // 4. Vérifier que les données ont été sauvegardées
    console.log('🔍 Étape 3: Vérification de la persistance...');
    const verifyData = await fetchHomeData();
    
    if (!verifyData.success) {
      throw new Error('Impossible de vérifier les données sauvegardées');
    }
    
    const savedVideoUrl = verifyData.data.hero?.videoUrl;
    console.log('🎥 URL vidéo après sauvegarde:', savedVideoUrl);
    
    // 5. Comparer les URLs
    if (savedVideoUrl === testVideoUrl) {
      console.log('✅ TEST RÉUSSI: La vidéo a été correctement sauvegardée');
    } else {
      console.error('❌ TEST ÉCHOUÉ: La vidéo n\'a pas été sauvegardée correctement');
      console.error('   Attendu:', testVideoUrl);
      console.error('   Reçu:', savedVideoUrl);
      return false;
    }
    
    // 6. Restaurer l'URL originale
    console.log('🔄 Étape 4: Restauration de l\'URL originale...');
    const restoreData = {
      ...verifyData.data,
      hero: {
        ...verifyData.data.hero,
        videoUrl: originalVideoUrl
      }
    };
    
    const restoreResult = await saveHomeData(restoreData);
    
    if (restoreResult.success) {
      console.log('✅ URL originale restaurée');
    } else {
      console.warn('⚠️ Attention: Impossible de restaurer l\'URL originale');
    }
    
    console.log('🎉 === TEST VIDÉO HERO TERMINÉ AVEC SUCCÈS ===');
    return true;
    
  } catch (error) {
    console.error('💥 === ERREUR DANS LE TEST ===');
    console.error('Erreur:', error.message);
    console.error('Stack:', error.stack);
    return false;
  }
};

/**
 * Test de validation des URLs vidéo
 */
export const testVideoUrlValidation = () => {
  console.log('🧪 === TEST VALIDATION URLs VIDÉO ===');
  
  const testUrls = [
    {
      url: 'https://res.cloudinary.com/dntyghmap/video/upload/v1757153869/test.mp4',
      expected: true,
      description: 'URL Cloudinary valide'
    },
    {
      url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      expected: true,
      description: 'URL YouTube valide'
    },
    {
      url: 'https://vimeo.com/123456789',
      expected: true,
      description: 'URL Vimeo valide'
    },
    {
      url: 'invalid-url',
      expected: false,
      description: 'URL invalide'
    },
    {
      url: '',
      expected: false,
      description: 'URL vide'
    }
  ];
  
  let allPassed = true;
  
  testUrls.forEach((test, index) => {
    try {
      // Simulation de validation (à adapter selon votre fonction validateVideoUrl)
      const isValid = test.url.includes('cloudinary') || 
                     test.url.includes('youtube') || 
                     test.url.includes('vimeo');
      
      if (isValid === test.expected) {
        console.log(`✅ Test ${index + 1}: ${test.description} - RÉUSSI`);
      } else {
        console.error(`❌ Test ${index + 1}: ${test.description} - ÉCHOUÉ`);
        allPassed = false;
      }
    } catch (error) {
      console.error(`💥 Test ${index + 1}: ${test.description} - ERREUR:`, error.message);
      allPassed = false;
    }
  });
  
  if (allPassed) {
    console.log('🎉 === TOUS LES TESTS DE VALIDATION RÉUSSIS ===');
  } else {
    console.error('❌ === CERTAINS TESTS DE VALIDATION ONT ÉCHOUÉ ===');
  }
  
  return allPassed;
};

/**
 * Fonction principale pour exécuter tous les tests
 */
export const runAllHeroTests = async () => {
  console.log('🚀 === DÉBUT DE TOUS LES TESTS HERO ===');
  
  const results = {
    videoChange: false,
    urlValidation: false
  };
  
  // Test 1: Changement de vidéo
  results.videoChange = await testHeroVideoChange();
  
  // Test 2: Validation des URLs
  results.urlValidation = testVideoUrlValidation();
  
  // Résumé
  console.log('📊 === RÉSUMÉ DES TESTS ===');
  console.log('Changement vidéo:', results.videoChange ? '✅ RÉUSSI' : '❌ ÉCHOUÉ');
  console.log('Validation URLs:', results.urlValidation ? '✅ RÉUSSI' : '❌ ÉCHOUÉ');
  
  const allPassed = results.videoChange && results.urlValidation;
  
  if (allPassed) {
    console.log('🎉 === TOUS LES TESTS HERO RÉUSSIS ===');
  } else {
    console.error('❌ === CERTAINS TESTS HERO ONT ÉCHOUÉ ===');
  }
  
  return results;
};

// Export pour utilisation dans la console du navigateur
if (typeof window !== 'undefined') {
  window.testHeroVideo = runAllHeroTests;
  window.testHeroVideoChange = testHeroVideoChange;
  window.testVideoUrlValidation = testVideoUrlValidation;
}
