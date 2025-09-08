# 🚀 Script de build de production - Rotary Club Mobile (PowerShell)
# Usage: .\scripts\build-production.ps1

Write-Host "🚀 Démarrage du build de production..." -ForegroundColor Green

# Vérification des prérequis
Write-Host "📋 Vérification des prérequis..." -ForegroundColor Yellow

# Vérifier si EAS CLI est installé
try {
    eas --version | Out-Null
    Write-Host "✅ EAS CLI détecté" -ForegroundColor Green
} catch {
    Write-Host "❌ EAS CLI n'est pas installé. Installation..." -ForegroundColor Red
    npm install -g @expo/eas-cli
}

# Vérifier si l'utilisateur est connecté
try {
    eas whoami | Out-Null
    Write-Host "✅ Connecté à EAS" -ForegroundColor Green
} catch {
    Write-Host "🔐 Connexion à EAS requise..." -ForegroundColor Yellow
    eas login
}

# Vérification des assets
Write-Host "🎨 Vérification des assets..." -ForegroundColor Yellow

$assets = @("assets/icon.png", "assets/adaptive-icon.png", "assets/splash.png")
foreach ($asset in $assets) {
    if (Test-Path $asset) {
        Write-Host "✅ $asset trouvé" -ForegroundColor Green
    } else {
        Write-Host "⚠️  Attention: $asset manquant" -ForegroundColor Yellow
    }
}

# Installation des dépendances
Write-Host "📦 Installation des dépendances..." -ForegroundColor Yellow
npm install

# Build Android AAB pour production
Write-Host "🤖 Build Android (AAB) pour Google Play Store..." -ForegroundColor Cyan
eas build --platform android --profile production --non-interactive

Write-Host "✅ Build terminé!" -ForegroundColor Green
Write-Host "📱 Téléchargez votre AAB depuis: https://expo.dev/" -ForegroundColor Cyan
Write-Host "🏪 Prêt pour upload sur Google Play Console!" -ForegroundColor Green

# Optionnel: Build iOS si configuré
$buildIos = Read-Host "🍎 Voulez-vous aussi builder pour iOS? (y/N)"
if ($buildIos -eq "y" -or $buildIos -eq "Y") {
    Write-Host "🍎 Build iOS pour App Store..." -ForegroundColor Cyan
    eas build --platform ios --profile production --non-interactive
}

Write-Host "🎉 Tous les builds sont terminés!" -ForegroundColor Green
Write-Host "📋 Prochaines étapes:" -ForegroundColor Yellow
Write-Host "1. Télécharger le fichier AAB depuis expo.dev" -ForegroundColor White
Write-Host "2. Créer une application sur Google Play Console" -ForegroundColor White
Write-Host "3. Uploader le AAB et configurer la fiche" -ForegroundColor White
Write-Host "4. Publier en test interne d'abord" -ForegroundColor White
