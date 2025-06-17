# 🎯 Rotary Club Mobile

Application mobile complète pour les clubs Rotary, développée avec React Native, Expo et TypeScript.

## 🚀 Démo en ligne

**🔗 Testez immédiatement sur Expo Snack :**
👉 **https://snack.expo.dev/@devmick/github.com-devmick-rotaryclubmobile**

1. Ouvrez le lien ci-dessus
2. Installez [Expo Go](https://expo.dev/client) sur votre téléphone
3. Scannez le QR code
4. L'application se lance instantanément !

## 📱 Fonctionnalités principales

### 🏠 Tableau de bord intelligent
- ✅ Vue d'ensemble des activités du club
- ✅ Statistiques en temps réel (membres actifs, réunions)
- ✅ Prochaines réunions avec détails
- ✅ Actions rapides (navigation, QR code)
- ✅ Pull-to-refresh et animations fluides

### 📅 Gestion des réunions
- ✅ Liste des réunions avec dates formatées
- ✅ Scanner QR code intégré (simulé dans Snack)
- ✅ Compteur de participants
- ✅ Interface Material Design

### 👥 Annuaire des membres
- ✅ Liste complète avec avatars générés
- ✅ Barre de recherche en temps réel
- ✅ Informations de contact (email, téléphone)
- ✅ Rôles et statuts des membres

### 👤 Profil utilisateur
- ✅ Informations personnelles
- ✅ Préférences (notifications, thème)
- ✅ Actions de profil (modifier, déconnexion)
- ✅ Interface cohérente

## 🎨 Design System

### Couleurs Rotary officielles
- **Bleu Rotary** : `#005AA9` (Primary)
- **Or Rotary** : `#F7A81B` (Secondary)
- **Material Design 3** avec React Native Paper

### Architecture
- **React Native** 0.72.6 + **Expo** 49.0.0
- **TypeScript** strict pour la sécurité
- **Redux Toolkit** pour l'état global
- **React Navigation** v6 avec bottom tabs
- **Material Design** avec animations 60fps

## 📚 Documentation complète

- 📖 **[Guide Expo Snack](./EXPO-SNACK-GUIDE.md)** - Comment utiliser l'app
- 🎯 **[Fonctionnalités démo](./DEMO-FEATURES.md)** - Toutes les fonctionnalités
- 🔧 **[Dépannage](./TROUBLESHOOTING.md)** - Résolution de problèmes
- 📱 **[README Snack](./README-SNACK.md)** - Version simplifiée

## 🛠️ Installation locale

```bash
# Cloner le repository
git clone https://github.com/DevMick/RotaryClubMobile.git
cd RotaryClubMobile

# Installer les dépendances
npm install

# Lancer avec Expo
npx expo start
```

## 🔧 Technologies utilisées

### Frontend
- **React Native** 0.72.6
- **Expo** SDK 49
- **TypeScript** 5.1.3
- **React Navigation** v6
- **React Native Paper** (Material Design)

### État global
- **Redux Toolkit** 2.0.1
- **React Redux** 9.0.4
- Slices : user, meetings, members

### UI/UX
- **@expo/vector-icons** (Ionicons)
- **react-native-safe-area-context**
- **react-native-gesture-handler**
- Animations et transitions fluides

## 📱 Compatibilité

- ✅ **iOS** 13.0+
- ✅ **Android** 6.0+ (API 23+)
- ✅ **Web** (via Expo Web)
- ✅ **Expo Go** pour tests rapides
- ✅ **Expo Snack** pour démo en ligne

## 📁 Structure du projet

```
├── App.tsx                 # Point d'entrée principal
├── src/
│   ├── screens/           # Écrans de l'application
│   │   ├── HomeScreen.tsx
│   │   ├── ReunionsScreen.tsx
│   │   ├── MembersScreen.tsx
│   │   └── ProfileScreen.tsx
│   ├── store/             # Redux store
│   │   ├── index.ts
│   │   └── slices/
│   │       ├── userSlice.ts
│   │       ├── meetingsSlice.ts
│   │       └── membersSlice.ts
│   ├── components/        # Composants réutilisables
│   │   ├── ui/           # Composants UI de base
│   │   ├── dashboard/    # Widgets dashboard
│   │   └── auth/         # Composants d'authentification
│   ├── navigation/       # Configuration navigation
│   ├── services/         # Services API et business logic
│   ├── utils/           # Utilitaires
│   ├── types/           # Types TypeScript
│   └── theme.ts         # Thème Material Design
├── package.json         # Dépendances Expo Snack
└── app.json            # Configuration Expo
```

## 🎯 Données de démonstration

L'application utilise des données mockées pour la démonstration :

### Utilisateur connecté
- **Nom** : Jean Dupont
- **Club** : Rotary Club Paris Centre
- **Rôle** : Membre

### Réunions
- Réunion hebdomadaire (19 Décembre 2024, 18h30)
- Assemblée générale (15 Avril 2024, 14h00)

### Membres
- John Doe (member)
- Jane Smith (president)

## 🚀 Démarrage rapide

### Option 1 : Expo Snack (Recommandé)
1. 🔗 Ouvrez https://snack.expo.dev/@devmick/github.com-devmick-rotaryclubmobile
2. 📱 Installez Expo Go sur votre téléphone
3. 📷 Scannez le QR code
4. 🎉 L'application se lance !

### Option 2 : Installation locale
```bash
git clone https://github.com/DevMick/RotaryClubMobile.git
cd RotaryClubMobile
npm install
npx expo start
```

## 🤝 Contribution

Les contributions sont les bienvenues ! Pour contribuer :

1. **Fork** le projet
2. **Créez** une branche pour votre fonctionnalité (`git checkout -b feature/AmazingFeature`)
3. **Committez** vos changements (`git commit -m 'Add some AmazingFeature'`)
4. **Poussez** vers la branche (`git push origin feature/AmazingFeature`)
5. **Ouvrez** une Pull Request

## 📄 Licence

Ce projet est sous licence MIT. Voir le fichier [LICENSE](LICENSE) pour plus de détails.

## 👨‍💻 Auteur

**DevMick** - [GitHub](https://github.com/DevMick)

## 🙏 Remerciements

- [Rotary International](https://www.rotary.org/) pour l'inspiration
- [Expo](https://expo.dev/) pour la plateforme de développement
- [React Native Paper](https://reactnativepaper.com/) pour les composants Material Design
- La communauté React Native pour le support

---

⭐ **N'hésitez pas à donner une étoile si ce projet vous plaît !**
3. Commiter vos changements
4. Pousser vers la branche
5. Ouvrir une Pull Request
