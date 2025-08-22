#!/bin/bash

# 🚀 Script de build de production - Rotary Club Mobile
# Usage: ./scripts/build-production.sh

echo "🚀 Démarrage du build de production..."

# Vérification des prérequis
echo "📋 Vérification des prérequis..."

# Vérifier si EAS CLI est installé
if ! command -v eas &> /dev/null; then
    echo "❌ EAS CLI n'est pas installé. Installation..."
    npm install -g @expo/eas-cli
fi

# Vérifier si l'utilisateur est connecté
if ! eas whoami &> /dev/null; then
    echo "🔐 Connexion à EAS requise..."
    eas login
fi

# Nettoyage
echo "🧹 Nettoyage des builds précédents..."
rm -rf dist/
rm -rf .expo/

# Vérification des assets
echo "🎨 Vérification des assets..."
if [ ! -f "assets/icon.png" ]; then
    echo "⚠️  Attention: assets/icon.png manquant"
fi

if [ ! -f "assets/adaptive-icon.png" ]; then
    echo "⚠️  Attention: assets/adaptive-icon.png manquant"
fi

if [ ! -f "assets/splash.png" ]; then
    echo "⚠️  Attention: assets/splash.png manquant"
fi

# Installation des dépendances
echo "📦 Installation des dépendances..."
npm install

# Build Android AAB pour production
echo "🤖 Build Android (AAB) pour Google Play Store..."
eas build --platform android --profile production --non-interactive

echo "✅ Build terminé!"
echo "📱 Téléchargez votre AAB depuis: https://expo.dev/"
echo "🏪 Prêt pour upload sur Google Play Console!"

# Optionnel: Build iOS si configuré
read -p "🍎 Voulez-vous aussi builder pour iOS? (y/N): " build_ios
if [[ $build_ios =~ ^[Yy]$ ]]; then
    echo "🍎 Build iOS pour App Store..."
    eas build --platform ios --profile production --non-interactive
fi

echo "🎉 Tous les builds sont terminés!"
