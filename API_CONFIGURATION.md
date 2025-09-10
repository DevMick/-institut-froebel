# 🔗 Configuration des APIs - Institut Froebel

## 📊 **Vue d'ensemble**

Le projet utilise **DEUX SYSTÈMES** différents pour la gestion des données :

### **🌐 1. API BACKEND RÉELLE**
**URL :** `https://mon-api-aspnet.onrender.com`
**Proxy local :** `/api` → `https://mon-api-aspnet.onrender.com`

### **💾 2. STOCKAGE LOCAL (localStorage)**
**Pas d'API externe** - Données stockées dans le navigateur

---

## ✅ **Services utilisant l'API RÉELLE**

### **🔐 Authentification & Sécurité**
- **`authApi.js`** - Connexion, inscription, tokens
  - Base URL: `/api`
  - Endpoints: `/auth/login`, `/auth/register/*`, `/auth/refresh-token`

### **🏫 Gestion des Établissements**
- **`ecolesApi.js`** - Gestion des écoles
  - Base URL: `/api`
  - Endpoints: `/ecoles`, `/ecoles/{id}`

- **`classesApi.js`** - Gestion des classes
  - Base URL: `/api`
  - Endpoints: `/ecoles/{id}/classes`

### **👥 Gestion du Personnel**
- **`personnelApi.js`** - Administrateurs et professeurs
  - Base URL: `/api`
  - Endpoints: `/auth/school/{id}/users`, `/ecoles/{id}/professeurs`

### **🎓 Admissions**
- **`admissionsApi.js`** - Préinscriptions et informations
  - Base URL: `/api`
  - Endpoints: `/admissions/*`, `/auth/schools`

### **⚙️ Administration**
- **`superAdminApi.js`** - Dashboard et statistiques
  - Base URL: `/api`
  - Endpoints: `/ecoles`, `/auth/school/{id}/users`

### **👨‍👩‍👧‍👦 Espace Parents**
- **`espaceParentsApi.js`** - Interface parents
  - Base URL: `/api`
  - Endpoints: `/parents/*`, `/enfants/*`, `/bulletins/*`

---

## 💾 **Services utilisant localStorage**

### **🏠 Gestion de Contenu**
- **`homeApi.js`** - Page d'accueil
  - **Stockage :** localStorage (`homePageData`)
  - **Sections :** Hero, Directrice, Histoire, Établissements, etc.

- **`vieScolaireApi.js`** - Page Vie Scolaire
  - **Stockage :** localStorage (`vieScolaireData`)
  - **Sections :** Encadrement, Cadre sécurisé, Activités, etc.

- **`cyclesApi.js`** - Page Cycles
  - **Stockage :** localStorage (`cyclesData`)
  - **Sections :** Crèche, Maternelle, Primaire, Secondaire

- **`activitesApi.js`** - Activités récentes
  - **Stockage :** localStorage (`activitesRecentesData`)
  - **Sections :** SILA, Banco, Événements

---

## 🔧 **Configuration Proxy**

### **Développement (`setupProxy.js`)**
```javascript
target: 'https://mon-api-aspnet.onrender.com'
```

### **Production Netlify (`netlify.toml`)**
```toml
from = "/api/*"
to = "https://mon-api-aspnet.onrender.com/api/:splat"
```

### **Production Vercel (`vercel.json`)**
```json
"source": "/api/(.*)",
"destination": "https://mon-api-aspnet.onrender.com/api/$1"
```

---

## 🎯 **Pourquoi cette architecture ?**

### **✅ Avantages API Réelle :**
- Données partagées entre utilisateurs
- Sécurité et authentification
- Persistance garantie
- Synchronisation multi-appareils

### **✅ Avantages localStorage :**
- Modification rapide du contenu
- Pas besoin de backend pour le contenu statique
- Interface d'administration simple
- Prototypage rapide

---

## 🚨 **Points d'attention**

### **⚠️ localStorage Limitations :**
- Données locales au navigateur
- Pas de synchronisation entre appareils
- Perte possible si cache vidé
- Pas de sauvegarde automatique

### **✅ Recommandations :**
- Garder localStorage pour le contenu éditorial
- Utiliser l'API réelle pour les données critiques
- Prévoir une migration future si nécessaire

---

## 📋 **Résumé par Service**

| Service | Type | Base URL | Utilisation |
|---------|------|----------|-------------|
| `authApi.js` | API Réelle | `/api` | ✅ Authentification |
| `ecolesApi.js` | API Réelle | `/api` | ✅ Gestion écoles |
| `classesApi.js` | API Réelle | `/api` | ✅ Gestion classes |
| `personnelApi.js` | API Réelle | `/api` | ✅ Gestion personnel |
| `admissionsApi.js` | API Réelle | `/api` | ✅ Admissions |
| `superAdminApi.js` | API Réelle | `/api` | ✅ Administration |
| `espaceParentsApi.js` | API Réelle | `/api` | ✅ Espace parents |
| `homeApi.js` | localStorage | - | 💾 Page d'accueil |
| `vieScolaireApi.js` | localStorage | - | 💾 Vie scolaire |
| `cyclesApi.js` | localStorage | - | 💾 Cycles |
| `activitesApi.js` | localStorage | - | 💾 Activités |

---

## 🔧 **Corrections Récentes**

### **✅ URLs hardcodées corrigées :**
- **`ClassesPage.jsx`** - Toutes les fonctions CRUD (create, read, update, delete)
- **`PaiementsScolaritePage.jsx`** - Récupération des parents d'enfants
- **`DossierAFournirPage.jsx`** - Gestion des classes et dossiers à fournir

### **🧹 Nettoyage effectué :**
- **`vieScolaireApi.js`** - Suppression référence localhost inutile
- **`cyclesApi.js`** - Suppression référence localhost inutile
- **Documentation complète** - Architecture clarifiée

### **🎯 Résultat :**
- **100% des services** utilisent maintenant la configuration correcte
- **Fini les erreurs** `ERR_CONNECTION_REFUSED`
- **Architecture unifiée** et documentée

---

**✅ Configuration correcte et optimisée !**
**🔗 API Backend :** https://mon-api-aspnet.onrender.com
**💾 Contenu éditorial :** localStorage
