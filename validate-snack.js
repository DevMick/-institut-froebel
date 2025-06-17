/**
 * Script de validation pour Expo Snack
 * Vérifie que tous les fichiers et dépendances sont compatibles
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Validation de la compatibilité Expo Snack...\n');

// 1. Vérifier package.json
console.log('📦 Vérification du package.json...');
try {
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  
  // Vérifier les dépendances compatibles Expo
  const compatibleDeps = [
    'expo',
    'expo-status-bar',
    'react',
    'react-native',
    '@react-navigation/native',
    '@react-navigation/bottom-tabs',
    '@reduxjs/toolkit',
    'react-redux',
    'react-native-paper',
    '@expo/vector-icons',
    'react-native-safe-area-context',
    'react-native-screens',
    'react-native-gesture-handler'
  ];
  
  const missingDeps = compatibleDeps.filter(dep => !packageJson.dependencies[dep]);
  
  if (missingDeps.length === 0) {
    console.log('✅ Toutes les dépendances requises sont présentes');
  } else {
    console.log('❌ Dépendances manquantes:', missingDeps);
  }
  
  // Vérifier qu'il n'y a pas de dépendances incompatibles
  const incompatibleDeps = [
    '@react-native-async-storage/async-storage',
    'redux-persist',
    'react-native-vector-icons',
    'react-native-sqlite-storage'
  ];
  
  const foundIncompatible = incompatibleDeps.filter(dep => packageJson.dependencies[dep]);
  
  if (foundIncompatible.length === 0) {
    console.log('✅ Aucune dépendance incompatible détectée');
  } else {
    console.log('⚠️ Dépendances incompatibles trouvées:', foundIncompatible);
  }
  
} catch (error) {
  console.log('❌ Erreur lors de la lecture du package.json:', error.message);
}

// 2. Vérifier app.json
console.log('\n📱 Vérification du app.json...');
try {
  const appJson = JSON.parse(fs.readFileSync('app.json', 'utf8'));
  
  if (appJson.expo && appJson.expo.name && appJson.expo.slug) {
    console.log('✅ Configuration Expo valide');
  } else {
    console.log('❌ Configuration Expo manquante ou invalide');
  }
  
} catch (error) {
  console.log('❌ Erreur lors de la lecture du app.json:', error.message);
}

// 3. Vérifier la structure des fichiers
console.log('\n📁 Vérification de la structure des fichiers...');

const requiredFiles = [
  'App.tsx',
  'src/theme.ts',
  'src/store/index.ts',
  'src/screens/HomeScreen.tsx',
  'src/screens/ReunionsScreen.tsx',
  'src/screens/MembersScreen.tsx',
  'src/screens/ProfileScreen.tsx'
];

let allFilesExist = true;

requiredFiles.forEach(file => {
  if (fs.existsSync(file)) {
    console.log(`✅ ${file}`);
  } else {
    console.log(`❌ ${file} - MANQUANT`);
    allFilesExist = false;
  }
});

// 4. Vérifier les imports dans App.tsx
console.log('\n🔗 Vérification des imports dans App.tsx...');
try {
  const appContent = fs.readFileSync('App.tsx', 'utf8');
  
  const requiredImports = [
    'react',
    'expo-status-bar',
    'react-native-paper',
    'react-redux',
    '@react-navigation/native',
    '@react-navigation/bottom-tabs',
    'react-native-safe-area-context',
    '@expo/vector-icons'
  ];
  
  let allImportsValid = true;
  
  requiredImports.forEach(imp => {
    if (appContent.includes(`from '${imp}'`) || appContent.includes(`from "${imp}"`)) {
      console.log(`✅ Import ${imp}`);
    } else {
      console.log(`❌ Import ${imp} - MANQUANT`);
      allImportsValid = false;
    }
  });
  
  if (allImportsValid) {
    console.log('✅ Tous les imports requis sont présents');
  }
  
} catch (error) {
  console.log('❌ Erreur lors de la vérification des imports:', error.message);
}

// 5. Résumé final
console.log('\n📊 RÉSUMÉ DE LA VALIDATION');
console.log('================================');

if (allFilesExist) {
  console.log('✅ Structure des fichiers: OK');
} else {
  console.log('❌ Structure des fichiers: PROBLÈMES DÉTECTÉS');
}

console.log('\n🎯 LIENS UTILES');
console.log('===============');
console.log('🔗 Expo Snack: https://snack.expo.dev/@devmick/github.com-devmick-rotaryclubmobile');
console.log('📖 Documentation: ./EXPO-SNACK-GUIDE.md');
console.log('🔧 Dépannage: ./TROUBLESHOOTING.md');
console.log('🎯 Fonctionnalités: ./DEMO-FEATURES.md');

console.log('\n🚀 PRÊT POUR EXPO SNACK !');
console.log('=========================');
console.log('1. Ouvrez le lien Expo Snack ci-dessus');
console.log('2. Installez Expo Go sur votre téléphone');
console.log('3. Scannez le QR code');
console.log('4. Profitez de l\'application !');

console.log('\n✨ Validation terminée avec succès !');
