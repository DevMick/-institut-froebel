# Rotary Club Mobile - Expo Snack

Application mobile pour les clubs Rotary, optimisée pour Expo Snack.

## 🚀 Fonctionnalités

- **Tableau de bord** : Vue d'ensemble des activités du club
- **Réunions** : Gestion des réunions avec scanner QR
- **Membres** : Annuaire des membres avec recherche
- **Profil** : Gestion du profil utilisateur

## 🎨 Design

- **Couleurs Rotary officielles** :
  - Bleu Rotary : `#005AA9`
  - Or Rotary : `#F7A81B`
- **Material Design** avec React Native Paper
- **Navigation** avec React Navigation
- **État global** avec Redux Toolkit

## 📱 Utilisation dans Expo Snack

1. Ouvrez [snack.expo.dev](https://snack.expo.dev)
2. Importez ce projet depuis GitHub
3. Cliquez sur "Run" pour lancer l'application
4. Scannez le QR code avec l'app Expo Go

## 🔧 Technologies

- **React Native** 0.72.6
- **Expo** ~49.0.0
- **TypeScript**
- **Redux Toolkit** pour la gestion d'état
- **React Navigation** pour la navigation
- **React Native Paper** pour l'UI Material Design

## 📝 Structure

```
src/
├── components/     # Composants réutilisables
├── screens/        # Écrans de l'application
├── store/          # Configuration Redux
├── theme.ts        # Thème Material Design
└── types/          # Types TypeScript
```

## 🎯 Données de démonstration

L'application utilise des données mockées pour la démonstration :
- Utilisateur : Jean Dupont (Rotary Club Paris Centre)
- Réunions : Réunions hebdomadaires et assemblées
- Membres : Liste des membres actifs

## 🔒 Sécurité

Version simplifiée pour Expo Snack :
- Pas de persistence des données
- Authentification bypassée
- Données en mémoire uniquement

## 🤝 Contribution

Ce projet est une démonstration. Pour la version complète avec toutes les fonctionnalités de sécurité et de persistence, consultez le repository principal.
