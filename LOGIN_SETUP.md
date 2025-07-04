# Configuration de la Page de Connexion

## Vue d'ensemble

La page de connexion a été configurée pour fonctionner avec l'API d'authentification de l'Institut Froebel. Elle gère la connexion des utilisateurs selon leur rôle (Parent, Admin, Teacher, SuperAdmin) et redirige vers les pages appropriées.

## Structure de l'API

### Endpoint de connexion
- **URL**: `https://ominous-space-potato-r4gg6jvq474jcx99j-5271.app.github.dev/api/auth/login`
- **Méthode**: POST
- **Content-Type**: application/json

### Paramètres de requête
```json
{
  "ecoleId": 2,
  "email": "adjoua.kouassi@email.com",
  "password": "Adjoua2024!"
}
```

### Structure de réponse
```json
{
  "success": true,
  "message": "Connexion réussie",
  "data": {
    "success": true,
    "message": "Connexion réussie",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "AvCe1ndsOopnekR1CljnkFYOLmDP9EkUhhcaas0q7p2jRmEo06HOiLaAT4oyViVXmMCp/Rp9OitYcLuUA1f8hw==",
    "tokenExpiration": "2025-07-03T06:42:47.7406267Z",
    "user": {
      "id": "cf29fece-829f-4788-9a71-ace1b868caa0",
      "email": "adjoua.kouassi@email.com",
      "nom": "Kouassi",
      "prenom": "Adjoua",
      "nomComplet": "Adjoua Kouassi",
      "telephone": "+225 07 12 34 56 78",
      "adresse": "Cocody, Boulevard Lagunaire, Abidjan",
      "ecoleId": 2,
      "ecoleNom": "Institut Froebel LA TULIPE",
      "ecoleCode": "FROEBEL_DEFAULT",
      "isActive": false,
      "createdAt": "2025-07-02T02:44:28.109105Z",
      "roles": ["Parent"],
      "enfants": [
        {
          "id": 1,
          "nom": "Kouassi",
          "prenom": "Aya",
          "nomComplet": "Aya Kouassi",
          "dateNaissance": "2016-08-12T00:00:00Z",
          "age": 8,
          "sexe": "F",
          "classe": null,
          "niveau": null,
          "statut": "pre_inscrit",
          "numeroEtudiant": null,
          "parentId": "",
          "parentNom": null,
          "createdAt": "2025-07-02T02:44:30.064617Z"
        }
      ]
    },
    "school": {
      "id": 2,
      "nom": "Institut Froebel LA TULIPE",
      "code": "FROEBEL_DEFAULT",
      "email": "contact@froebel-default.ci",
      "telephone": "+225 27 22 49 50 00",
      "adresse": "Marcory Anoumambo, en face de l'ARTCI",
      "commune": "Marcory",
      "anneeScolaire": "2024-2025",
      "createdAt": "2025-07-02T01:31:58.01563Z"
    }
  }
}
```

## Fonctionnalités implémentées

### 1. Gestion des écoles
- Récupération automatique de la liste des écoles depuis l'API
- Sélection de l'école dans un dropdown
- Données de fallback en cas d'erreur de l'API

### 2. Authentification
- Validation des champs (email, mot de passe, école)
- Gestion des erreurs de connexion
- Stockage sécurisé du token et des données utilisateur

### 3. Redirection selon le rôle
- **Parent**: `/espace-parents`
- **Admin**: `/admin`
- **Teacher**: `/teacher`
- **SuperAdmin**: `/superadmin`

### 4. Stockage des données
- Token d'authentification
- Token de rafraîchissement
- Données utilisateur
- Informations de l'école

## Utilisation

### Test de connexion
1. Accédez à la page de connexion
2. Cliquez sur "Remplir formulaire test" pour utiliser les données de test
3. Cliquez sur "Se connecter"
4. Vérifiez la redirection vers l'espace approprié

### Données de test
- **École**: Institut Froebel LA TULIPE (ID: 2)
- **Email**: adjoua.kouassi@email.com
- **Mot de passe**: Adjoua2024!

## Gestion des erreurs

### Types d'erreurs gérées
1. **Erreurs de validation**: Champs manquants ou invalides
2. **Erreurs d'authentification**: Identifiants incorrects
3. **Erreurs de réseau**: Problèmes de connexion
4. **Erreurs de serveur**: Problèmes côté API

### Messages d'erreur
- Messages d'erreur clairs et informatifs
- Affichage des erreurs dans une alerte Ant Design
- Logs détaillés dans la console pour le débogage

## Sécurité

### Mesures implémentées
- Validation côté client et serveur
- Stockage sécurisé des tokens
- Nettoyage automatique des données lors de la déconnexion
- Gestion des timeouts de connexion

### Bonnes pratiques
- Pas de stockage en clair des mots de passe
- Utilisation de HTTPS
- Validation des entrées utilisateur
- Gestion des sessions

## Débogage

### Outils disponibles
- Console de développement pour les logs
- Affichage de la réponse API brute
- Bouton de test pour remplir automatiquement le formulaire

### Logs utiles
- Tentative de connexion avec les paramètres
- Réponse complète de l'API
- Erreurs détaillées
- Redirection selon le rôle

## Maintenance

### Points d'attention
- Vérifier régulièrement l'URL de l'API
- Surveiller les logs d'erreur
- Tester les différents rôles utilisateur
- Vérifier la validité des tokens

### Évolutions possibles
- Ajout de l'authentification à deux facteurs
- Intégration avec des fournisseurs d'identité externes
- Amélioration de l'interface utilisateur
- Ajout de fonctionnalités de récupération de mot de passe 