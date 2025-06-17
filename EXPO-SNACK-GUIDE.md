# Guide d'utilisation - Rotary Club Mobile sur Expo Snack

## 🚀 Accès rapide

**Lien direct :** https://snack.expo.dev/@devmick/github.com-devmick-rotaryclubmobile

## 📱 Comment tester l'application

### 1. Sur votre téléphone (Recommandé)
1. Installez l'application **Expo Go** depuis :
   - [App Store (iOS)](https://apps.apple.com/app/expo-go/id982107779)
   - [Google Play (Android)](https://play.google.com/store/apps/details?id=host.exp.exponent)

2. Ouvrez le lien Snack dans votre navigateur
3. Cliquez sur "My Device" dans la barre latérale
4. Scannez le QR code avec Expo Go
5. L'application se lance automatiquement !

### 2. Sur simulateur (Alternative)
- **iOS Simulator** : Cliquez sur "iOS" dans Snack
- **Android Emulator** : Cliquez sur "Android" dans Snack
- **Web** : Cliquez sur "Web" pour une prévisualisation

## 🎯 Fonctionnalités disponibles

### ✅ Fonctionnalités actives
- **Navigation** : Onglets Material Design (Accueil, Réunions, Membres, Profil)
- **Tableau de bord** : Statistiques et actions rapides
- **Réunions** : Liste des réunions avec scanner QR simulé
- **Membres** : Annuaire avec recherche
- **Profil** : Gestion des préférences utilisateur
- **Thème Rotary** : Couleurs officielles (Bleu #005AA9, Or #F7A81B)

### ⚠️ Limitations Expo Snack
- Pas de persistence des données (redémarre à chaque refresh)
- Scanner QR simulé (pas d'accès caméra réel)
- Données mockées pour la démonstration
- Pas d'authentification réelle

## 🔧 Modifications en temps réel

1. **Éditer le code** : Modifiez les fichiers directement dans Snack
2. **Sauvegarde automatique** : Les changements sont sauvés automatiquement
3. **Rechargement à chaud** : L'app se met à jour en temps réel
4. **Partage** : Partagez votre version modifiée via l'URL

## 📁 Structure du projet

```
├── App.tsx                 # Point d'entrée principal
├── src/
│   ├── screens/           # Écrans de l'application
│   │   ├── HomeScreen.tsx
│   │   ├── ReunionsScreen.tsx
│   │   ├── MembersScreen.tsx
│   │   └── ProfileScreen.tsx
│   ├── store/             # Redux store simplifié
│   ├── components/        # Composants réutilisables
│   └── theme.ts          # Thème Material Design
├── package.json          # Dépendances Expo Snack
└── app.json             # Configuration Expo
```

## 🎨 Personnalisation

### Changer les couleurs
Modifiez `src/theme.ts` :
```typescript
export const theme = {
  colors: {
    primary: '#005AA9',    // Bleu Rotary
    secondary: '#F7A81B',  // Or Rotary
    // ... autres couleurs
  }
};
```

### Ajouter des données
Modifiez les données mockées dans :
- `src/store/slices/userSlice.ts` (utilisateur)
- `src/store/slices/meetingsSlice.ts` (réunions)
- `src/store/slices/membersSlice.ts` (membres)

## 🐛 Résolution de problèmes

### L'application ne se charge pas
1. Vérifiez votre connexion internet
2. Actualisez la page Snack
3. Redémarrez Expo Go sur votre téléphone

### Erreurs de compilation
1. Vérifiez la console d'erreurs dans Snack
2. Assurez-vous que toutes les dépendances sont compatibles
3. Vérifiez la syntaxe TypeScript

### QR Code ne fonctionne pas
1. Assurez-vous qu'Expo Go est installé
2. Vérifiez que votre téléphone et ordinateur sont sur le même réseau
3. Essayez le mode "Tunnel" dans les paramètres Snack

## 📞 Support

Pour toute question ou problème :
1. Consultez la [documentation Expo](https://docs.expo.dev/)
2. Vérifiez les [forums Expo](https://forums.expo.dev/)
3. Contactez le développeur via GitHub

## 🔄 Mises à jour

L'application se met à jour automatiquement depuis le repository GitHub.
Pour forcer une mise à jour : actualisez la page Snack.
