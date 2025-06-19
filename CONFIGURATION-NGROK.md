# 🔧 Configuration ngrok pour Rotary Club Mobile

## ⚠️ PROBLÈME ACTUEL
L'application ne peut pas charger les clubs car l'URL ngrok est expirée ou incorrecte.

## 🚀 SOLUTION RAPIDE

### 1. **Démarrez votre API backend**
```bash
# Dans le dossier de votre API backend
dotnet run
# Votre API doit tourner sur http://localhost:5265
```

### 2. **Démarrez ngrok**
```bash
# Dans un nouveau terminal
ngrok http 5265
```

### 3. **Copiez l'URL ngrok**
Ngrok va afficher quelque chose comme :
```
Forwarding    https://abc123.ngrok-free.app -> http://localhost:5265
```
**Copiez l'URL HTTPS** (ex: `https://abc123.ngrok-free.app`)

### 4. **Mettez à jour l'URL dans le code**
Dans `App.tsx`, ligne 29, remplacez :
```javascript
BASE_URL: 'https://your-ngrok-url.ngrok-free.app',
```
Par votre URL ngrok :
```javascript
BASE_URL: 'https://abc123.ngrok-free.app',
```

### 5. **Poussez les modifications**
```bash
git add .
git commit -m "Update ngrok URL"
git push origin main
```

### 6. **Testez sur Expo Snack**
Allez sur https://snack.expo.dev/@git/github.com/DevMick/RotaryClubMobile

## 🔄 POURQUOI ÇA NE MARCHE PAS ?

### URLs ngrok expirent
- Les URLs ngrok gratuites changent à chaque redémarrage
- L'URL actuelle `https://dfda-102-212-189-33.ngrok-free.app` est expirée

### Solution permanente
1. **Ngrok payant** : URLs fixes
2. **Déploiement cloud** : Heroku, Railway, etc.
3. **Variables d'environnement** : Configuration dynamique

## 🧪 TEST DE CONNEXION
L'app a un bouton "Tester la connexion API" qui vous dira si l'URL fonctionne.

## 📱 RÉSULTAT ATTENDU
Une fois l'URL correcte configurée :
- ✅ Les clubs se chargent automatiquement au démarrage
- ✅ Le dropdown "Club" se remplit avec les clubs de votre base de données
- ✅ La connexion fonctionne avec vos identifiants
