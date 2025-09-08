# 🚀 Guide de déploiement - Rotary Club Mobile

## **Prérequis**

### 1. Comptes nécessaires :
- [ ] Compte Expo/EAS (gratuit)
- [ ] Compte Google Play Console (25$ une fois)
- [ ] Compte développeur Google

### 2. Outils requis :
```bash
# Installation des outils
npm install -g @expo/eas-cli
npm install -g expo-cli

# Connexion à votre compte Expo
eas login
```

## **Étape 1 : Configuration du projet**

### A. Initialisation EAS
```bash
# Dans le dossier du projet
eas build:configure
```

### B. Création du projet Expo
```bash
# Si pas encore fait
eas project:init
```

## **Étape 2 : Préparation des assets**

### Assets requis (à créer) :
- [ ] `assets/icon.png` (1024x1024px)
- [ ] `assets/adaptive-icon.png` (1024x1024px) 
- [ ] `assets/splash.png` (1284x2778px)
- [ ] `assets/favicon.png` (48x48px)

### Outils recommandés :
- **Canva** : Templates d'icônes d'app
- **Figma** : Design personnalisé
- **Icon Kitchen** : Génération d'icônes Android

## **Étape 3 : Build de production**

### A. Build Android (AAB pour Play Store)
```bash
eas build --platform android --profile production
```

### B. Téléchargement du build
Une fois terminé, téléchargez le fichier `.aab` depuis :
- Dashboard EAS : https://expo.dev/
- Ou via CLI : `eas build:list`

## **Étape 4 : Configuration Google Play Console**

### A. Création de l'application
1. Allez sur https://play.google.com/console
2. "Créer une application"
3. Nom : "Rotary Club Mobile"
4. Langue par défaut : Français
5. Type : Application

### B. Configuration de base
1. **Icône de l'application** : 512x512px
2. **Screenshots** : Minimum 2 (téléphone)
3. **Description courte** : 80 caractères max
4. **Description complète** : Utilisez store-description.md

### C. Politique de confidentialité
Créez une page web avec votre politique de confidentialité et ajoutez l'URL.

## **Étape 5 : Upload et test**

### A. Upload du AAB
1. Production → Releases → "Créer une release"
2. Upload du fichier `.aab`
3. Notes de version
4. Révision et publication

### B. Test interne (RECOMMANDÉ)
1. Test interne → "Créer une release"
2. Ajoutez des testeurs (emails)
3. Partagez le lien de test

## **Étape 6 : Publication**

### Options de publication :
1. **Test interne** : Jusqu'à 100 testeurs
2. **Test fermé** : Jusqu'à 1000 testeurs  
3. **Production** : Public ou non répertorié

### Délais :
- **Test interne** : Instantané
- **Test fermé** : 24-48h de révision
- **Production** : 24-72h de révision

## **Commandes utiles**

```bash
# Vérifier le statut des builds
eas build:list

# Build de preview (APK pour test)
eas build --platform android --profile preview

# Soumission automatique au Play Store
eas submit --platform android

# Mise à jour OTA (sans rebuild)
eas update
```

## **Checklist finale**

### Avant publication :
- [ ] Tests sur différents appareils Android
- [ ] Vérification de l'API en production
- [ ] Screenshots de qualité
- [ ] Description complète et attrayante
- [ ] Politique de confidentialité publiée
- [ ] Icônes haute résolution
- [ ] Version et versionCode corrects

### Après publication :
- [ ] Test de l'installation depuis Play Store
- [ ] Vérification des analytics
- [ ] Monitoring des crashes
- [ ] Collecte des premiers retours utilisateurs

## **Support et ressources**

- **Documentation EAS** : https://docs.expo.dev/eas/
- **Google Play Console** : https://support.google.com/googleplay/android-developer/
- **Expo Discord** : Support communautaire
- **Stack Overflow** : Questions techniques
