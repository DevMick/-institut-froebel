# Guide de Dépannage API - Rotary Club Mobile

## 🔍 Diagnostic des Problèmes de Connexion

### Erreurs Observées dans ngrok
D'après vos logs ngrok, nous voyons :
- **401 Unauthorized** sur `/api/Auth/login`
- **404 Not Found** sur `/api/health` et `/api/Auth/me`

## 🛠️ Solutions par Type d'Erreur

### 1. Erreur 401 Unauthorized
**Signification** : L'endpoint existe mais les credentials sont incorrects

**Solutions** :
```bash
# Vérifiez que votre backend accepte ces formats :
POST /api/Auth/login
Content-Type: application/json

# Format avec clubId (recommandé)
{
  "email": "user@example.com",
  "password": "password123",
  "clubId": "club-id-guid"
}

# Format sans clubId (si supporté)
{
  "email": "user@example.com", 
  "password": "password123"
}
```

### 2. Erreur 404 Not Found
**Signification** : L'endpoint n'existe pas ou le routing est incorrect

**Vérifications** :
- L'API est-elle bien démarrée sur le port 5265 ?
- Les contrôleurs sont-ils bien configurés ?
- Le routing ASP.NET Core est-il correct ?

## 🔧 Vérifications Backend

### 1. Contrôleur d'Authentification
Vérifiez que vous avez un contrôleur comme :
```csharp
[Route("api/[controller]")]
[ApiController]
public class AuthController : ControllerBase
{
    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginRequest request)
    {
        // Votre logique de login
    }

    [HttpGet("me")]
    [Authorize]
    public async Task<IActionResult> GetCurrentUser()
    {
        // Votre logique pour récupérer l'utilisateur actuel
    }
}
```

### 2. Modèle de Requête Login
```csharp
public class LoginRequest
{
    public string Email { get; set; }
    public string Password { get; set; }
    public string ClubId { get; set; } // Optionnel selon votre implémentation
}
```

### 3. Configuration CORS
Assurez-vous que CORS est configuré pour ngrok :
```csharp
// Dans Program.cs ou Startup.cs
services.AddCors(options =>
{
    options.AddPolicy("AllowAll", builder =>
    {
        builder
            .AllowAnyOrigin()
            .AllowAnyMethod()
            .AllowAnyHeader();
    });
});

// Dans Configure
app.UseCors("AllowAll");
```

## 🌐 Configuration ngrok

### Headers Requis
L'application mobile envoie maintenant :
```javascript
headers: {
  'Content-Type': 'application/json',
  'Accept': 'application/json',
  'ngrok-skip-browser-warning': 'true'
}
```

### URL ngrok Actuelle
```
https://1bb90ebd0e23.ngrok-free.app
```

## 🧪 Tests de Diagnostic

### 1. Test Direct avec curl
```bash
# Test de l'endpoint login
curl -X POST https://1bb90ebd0e23.ngrok-free.app/api/Auth/login \
  -H "Content-Type: application/json" \
  -H "ngrok-skip-browser-warning: true" \
  -d '{"email":"test@test.com","password":"test123"}'

# Test de l'endpoint clubs
curl -X GET https://1bb90ebd0e23.ngrok-free.app/api/Clubs \
  -H "Accept: application/json" \
  -H "ngrok-skip-browser-warning: true"
```

### 2. Test depuis l'Application
1. **Rechargez Expo Snack** : https://snack.expo.dev/@git/github.com/DevMick/RotaryClubMobile
2. **Utilisez le bouton "Tester la connexion API"**
3. **Vérifiez les logs dans la console Expo**

## 📋 Checklist de Vérification

### Backend ASP.NET Core
- [ ] API démarrée sur le port 5265
- [ ] Contrôleur AuthController existe
- [ ] Endpoint `/api/Auth/login` configuré
- [ ] Endpoint `/api/Auth/me` configuré  
- [ ] Endpoint `/api/Clubs` configuré
- [ ] CORS configuré pour ngrok
- [ ] Base de données Aiven accessible

### ngrok
- [ ] ngrok démarré et pointant vers localhost:5265
- [ ] URL ngrok mise à jour dans l'app mobile
- [ ] Headers ngrok configurés

### Application Mobile
- [ ] URL API mise à jour
- [ ] Headers ngrok ajoutés
- [ ] Sélection de club implémentée
- [ ] Gestion d'erreurs améliorée

## 🔍 Logs de Débogage

### Dans votre Backend
Ajoutez des logs pour diagnostiquer :
```csharp
[HttpPost("login")]
public async Task<IActionResult> Login([FromBody] LoginRequest request)
{
    _logger.LogInformation($"Login attempt for email: {request.Email}");
    _logger.LogInformation($"ClubId provided: {request.ClubId}");
    
    // Votre logique...
}
```

### Dans l'Application Mobile
Les erreurs sont affichées dans :
- Console Expo Snack
- Alertes utilisateur
- Logs ngrok (côté serveur)

## 🚀 Prochaines Étapes

1. **Vérifiez votre backend** avec les points ci-dessus
2. **Testez avec curl** pour isoler le problème
3. **Rechargez l'application** après les corrections
4. **Utilisez les vrais credentials** de votre base Aiven

## 📞 Support

Si le problème persiste :
1. Partagez les logs complets de votre backend
2. Confirmez la structure de votre contrôleur Auth
3. Vérifiez la configuration de votre base de données Aiven

## 🔄 Adaptation selon RotaryManager

### ✅ **Changements Appliqués**

#### 1. **Format de Login Identique**
```javascript
// RotaryManager (Web)
{ email, password, clubId }

// RotaryClubMobile (Mobile) - MAINTENANT IDENTIQUE
{ email, password, clubId }
```

#### 2. **Chargement des Clubs**
```javascript
// Même endpoint: GET /api/Clubs
// Même format de réponse attendu
// Même gestion d'erreurs
```

#### 3. **Gestion du Token JWT**
```javascript
// RotaryManager: localStorage.setItem('token', token)
// Mobile: SecureStore (équivalent sécurisé)
```

#### 4. **Récupération du Profil**
```javascript
// Essaie /Auth/me puis /Auth/getCurrentProfile
// Comme dans RotaryManager
```

### 🧪 **Nouveau Test API Complet**
- ✅ Test du chargement des clubs
- ✅ Test de l'endpoint login avec clubId
- ✅ Rapport détaillé des résultats
- ✅ Logs de débogage dans la console

L'application est maintenant **parfaitement configurée** pour votre environnement ngrok + Aiven ! 🚀
