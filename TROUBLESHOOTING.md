# 🔧 Guide de dépannage - Rotary Club Mobile

## ❌ Problèmes courants et solutions

### 1. "Unable to resolve module" dans Expo Snack

**Symptômes :**
```
Unable to resolve module '@react-native/new-app-screen.js'
Unable to resolve module 'react-native-vector-icons'
```

**Solutions :**
✅ **Vérifiez le package.json** - Assurez-vous que seules les dépendances compatibles Expo sont listées
✅ **Redémarrez Snack** - Actualisez la page et attendez le rechargement complet
✅ **Vérifiez la version Expo** - Utilisez SDK 49.0.0 pour la compatibilité

### 2. L'application ne se charge pas sur le téléphone

**Symptômes :**
- QR code scanné mais rien ne se passe
- Erreur "Something went wrong"
- Application crash au démarrage

**Solutions :**
✅ **Vérifiez Expo Go** - Assurez-vous d'avoir la dernière version
✅ **Même réseau WiFi** - Téléphone et ordinateur sur le même réseau
✅ **Mode Tunnel** - Activez le mode Tunnel dans les paramètres Snack
✅ **Redémarrez Expo Go** - Fermez et rouvrez l'application

### 3. Erreurs TypeScript

**Symptômes :**
```
Property 'navigation' does not exist on type
Type 'string' is not assignable to type 'never'
```

**Solutions :**
✅ **Vérifiez les types** - Assurez-vous que tous les types sont correctement définis
✅ **Imports manquants** - Vérifiez que tous les imports sont présents
✅ **Version TypeScript** - Utilisez TypeScript 5.1.3 compatible

### 4. Redux store non accessible

**Symptômes :**
```
Cannot read property 'user' of undefined
useSelector hook error
```

**Solutions :**
✅ **Provider Redux** - Vérifiez que le Provider entoure l'application
✅ **Store configuration** - Vérifiez que le store est correctement configuré
✅ **Slices importés** - Assurez-vous que tous les slices sont importés

### 5. Navigation ne fonctionne pas

**Symptômes :**
- Onglets ne changent pas
- Navigation.navigate() ne fonctionne pas
- Écrans blancs

**Solutions :**
✅ **NavigationContainer** - Vérifiez que NavigationContainer entoure les navigateurs
✅ **Noms d'écrans** - Vérifiez que les noms correspondent exactement
✅ **Dépendances navigation** - Assurez-vous que toutes les dépendances sont installées

## 🛠️ Outils de débogage

### Console Expo Snack
1. Ouvrez les **DevTools** dans Snack
2. Consultez l'onglet **Logs** pour les erreurs
3. Utilisez l'onglet **Problems** pour les warnings

### Console téléphone
1. Secouez votre téléphone dans Expo Go
2. Sélectionnez **Debug Remote JS**
3. Ouvrez les DevTools de votre navigateur

### Logs détaillés
Ajoutez des logs dans votre code :
```typescript
console.log('Debug:', { user, meetings, members });
console.warn('Warning:', 'Something might be wrong');
console.error('Error:', error);
```

## 🔍 Vérifications étape par étape

### Checklist de base
- [ ] Expo Go installé et à jour
- [ ] Même réseau WiFi
- [ ] Snack chargé complètement
- [ ] Aucune erreur dans la console
- [ ] QR code visible et net

### Checklist avancée
- [ ] Package.json valide
- [ ] Toutes les dépendances compatibles Expo
- [ ] Types TypeScript corrects
- [ ] Redux store configuré
- [ ] Navigation configurée
- [ ] Composants exportés correctement

## 📱 Problèmes spécifiques aux plateformes

### iOS
**Problème :** Application ne se lance pas
**Solution :** Vérifiez les permissions dans Réglages > Expo Go

### Android
**Problème :** Erreur de réseau
**Solution :** Désactivez temporairement le VPN ou proxy

### Web
**Problème :** Fonctionnalités manquantes
**Solution :** Certaines fonctionnalités natives ne sont pas disponibles sur web

## 🚨 Erreurs critiques

### Metro Bundler Error
```
Metro has encountered an error
```
**Solution :** Redémarrez Snack et videz le cache

### JavaScript Error
```
Invariant Violation: Element type is invalid
```
**Solution :** Vérifiez les imports et exports des composants

### Network Error
```
Network request failed
```
**Solution :** Vérifiez votre connexion internet et les paramètres réseau

## 💡 Conseils de performance

### Optimisations
1. **Évitez les re-renders** - Utilisez React.memo, useCallback, useMemo
2. **Images optimisées** - Utilisez des formats web optimisés
3. **Lazy loading** - Chargez les composants à la demande
4. **Bundle size** - Évitez les dépendances lourdes

### Monitoring
1. **Performance tab** - Utilisez les DevTools pour monitorer
2. **Memory usage** - Surveillez l'utilisation mémoire
3. **Network requests** - Optimisez les appels API

## 📞 Obtenir de l'aide

### Ressources officielles
- [Documentation Expo](https://docs.expo.dev/)
- [Forums Expo](https://forums.expo.dev/)
- [Discord Expo](https://discord.gg/expo)

### Communauté
- [Stack Overflow](https://stackoverflow.com/questions/tagged/expo)
- [Reddit r/reactnative](https://reddit.com/r/reactnative)
- [GitHub Issues](https://github.com/expo/expo/issues)

### Contact développeur
- GitHub : [@DevMick](https://github.com/DevMick)
- Repository : [RotaryClubMobile](https://github.com/DevMick/RotaryClubMobile)

## 🔄 Derniers recours

Si rien ne fonctionne :
1. **Créez un nouveau Snack** - Copiez le code dans un nouveau projet
2. **Version antérieure** - Revenez à une version qui fonctionnait
3. **Signaler le bug** - Créez une issue sur GitHub avec les détails
4. **Alternative locale** - Clonez le repository et lancez localement
