# Guide d'Authentification - Rotary Club Mobile

## 🔐 Authentification Obligatoire

L'application Rotary Club Mobile exige maintenant une authentification avant d'accéder au contenu. Cette sécurité garantit que seuls les membres autorisés peuvent accéder aux données du club.

## 🚀 Processus de Connexion

### 1. Écran de Démarrage
Au lancement de l'application :
- **Écran de chargement** avec vérification automatique du token
- Si un token valide existe → Connexion automatique
- Si aucun token ou token expiré → Écran de connexion

### 2. Écran de Connexion
- **Titre** : "Authentification Requise"
- **Champs** : Email et Mot de passe
- **Comptes de test** préremplis pour faciliter les tests
- **Bouton** : "Se connecter"

### 3. Après Connexion Réussie
- Accès complet à l'application
- Navigation disponible (Accueil, Réunions, Membres, Profil)
- Données personnalisées selon l'utilisateur connecté

## 👤 Comptes de Test Disponibles

### Président - Kouamé Yao
- **Email** : `kouame.yao@rotary.org`
- **Mot de passe** : `password123`
- **Rôle** : Président du club
- **Permissions** : Accès complet

### Secrétaire - Aya Traoré
- **Email** : `aya.traore@rotary.org`
- **Mot de passe** : `password123`
- **Rôle** : Secrétaire du club
- **Permissions** : Gestion des réunions et membres

## 🔄 Gestion des Sessions

### Token JWT
- **Stockage** : SecureStore d'Expo (chiffré)
- **Durée** : Selon configuration backend
- **Renouvellement** : Automatique si possible

### Déconnexion
- **Manuelle** : Bouton dans l'écran Profil
- **Automatique** : Token expiré ou erreur 401
- **Sécurisée** : Suppression complète du token

## 📱 États de l'Application

### 1. Initialisation
```
🔄 Écran de chargement
   ↓
🔍 Vérification du token
   ↓
✅ Token valide → Accès direct
❌ Token invalide → Écran de connexion
```

### 2. Authentifié
- ✅ Navigation complète disponible
- ✅ Accès aux données personnalisées
- ✅ Bouton de déconnexion dans le profil

### 3. Non Authentifié
- ❌ Accès bloqué au contenu
- 🔐 Écran de connexion obligatoire
- ❌ Navigation masquée

## 🛡️ Sécurité Implémentée

### Protection des Données
- **Token JWT** : Authentification sécurisée
- **SecureStore** : Stockage chiffré du token
- **Validation** : Vérification automatique de l'expiration
- **Déconnexion** : Nettoyage complet des données

### Gestion des Erreurs
- **401 Unauthorized** : Déconnexion automatique
- **Réseau** : Fallback vers données locales
- **Token expiré** : Redirection vers connexion

## 🔧 Configuration API

### Endpoints Utilisés
```javascript
POST /api/Auth/login
GET /api/Auth/me
POST /api/Auth/logout (optionnel)
```

### Format de Réponse Login
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "user-id",
      "email": "user@rotary.org",
      "fullName": "Nom Complet",
      "clubId": "club-id",
      "clubName": "Rotary Club Abidjan II Plateaux"
    }
  }
}
```

## 🎯 Fonctionnalités Post-Authentification

### Données Personnalisées
- **Nom d'utilisateur** : Affiché dans l'en-tête
- **Club** : Informations du club de l'utilisateur
- **Rôle** : Permissions selon le rôle
- **Membres** : Liste des membres du même club

### Navigation Sécurisée
- **Accueil** : Vue d'ensemble personnalisée
- **Réunions** : Réunions du club de l'utilisateur
- **Membres** : Membres du club avec détails
- **Profil** : Informations personnelles et déconnexion

## 🚨 Dépannage

### Problème de Connexion
1. **Vérifier les identifiants** : Email et mot de passe corrects
2. **Tester la connectivité** : Réseau disponible
3. **Utiliser les comptes de test** : Boutons préremplis
4. **Vérifier l'API** : Backend accessible

### Token Expiré
- **Symptôme** : Déconnexion automatique
- **Solution** : Se reconnecter avec les identifiants
- **Prévention** : Utilisation régulière de l'app

### Données Non Chargées
- **Fallback** : Données de démonstration utilisées
- **Vérification** : Connexion API et permissions
- **Rafraîchissement** : Pull-to-refresh disponible

## 📝 Notes de Développement

### Mode Développement
- **Comptes de test** : Toujours disponibles
- **Données de fallback** : En cas d'échec API
- **Logs** : Console pour débogage

### Mode Production
- **Variables d'environnement** : Configuration sécurisée
- **HTTPS** : Communication chiffrée obligatoire
- **Validation** : Contrôles de sécurité renforcés

L'authentification est maintenant pleinement intégrée et sécurisée ! 🔐✨
