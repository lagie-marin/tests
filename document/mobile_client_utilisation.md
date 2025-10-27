# Documentation Utilisateur Mobile – Area

## Plan

1. [Présentation](#1-présentation)
2. [Installation](#2-installation)
3. [Configuration réseau](#3-configuration-réseau)
4. [Utilisation](#4-utilisation)
5. [Fonctionnalités mobiles](#5-fonctionnalités-mobiles)
6. [FAQ utilisateur mobile](#6-faq-utilisateur-mobile)
7. [Guide de dépannage mobile](#7-guide-de-dépannage-mobile)
8. [Contact et support](#8-contact-et-support)

---

## 1. Présentation

L'application mobile Area est une version React Native/Expo qui affiche l'application web Area dans une WebView native. Elle permet d'accéder à toutes les fonctionnalités d'automatisation depuis votre téléphone.

### Fonctionnalités principales
- ✅ Interface web complète dans une app native
- ✅ Synchronisation avec votre compte web
- ✅ Notifications push pour vos automatisations
- ✅ Disponible sur iOS et Android
- ✅ Interface optimisée mobile

### Prérequis
- Téléphone iOS ou Android
- Application Expo Go installée
- Connexion au même WiFi que votre ordinateur

---

## 2. Installation

### Étape 1 : Installer Expo Go
**Sur iOS :**
1. Ouvrez l'App Store
2. Recherchez "Expo Go" 
3. Installez l'application

**Sur Android :**
1. Ouvrez le Play Store
2. Recherchez "Expo Go"
3. Installez l'application

### Étape 2 : Configuration réseau
**⚠️ IMPORTANT** : Votre téléphone et votre ordinateur doivent être sur le **même réseau WiFi**.

### Étape 3 : Lancer l'application
1. **Démarrez le serveur web** sur votre ordinateur :
   ```bash
   cd frontend
   pnpm run dev -- --host 0.0.0.0
   ```

2. **Démarrez l'app mobile** :
   ```bash
   cd mobile
   pnpm start
   ```

3. **Scannez le QR code** avec Expo Go sur votre téléphone

---

## 3. Configuration réseau

### Trouver l'IP de votre ordinateur

**Sur Linux/macOS :**
```bash
ip addr show | grep inet
```

**Sur Windows :**
```bash
ipconfig
```

### Vérifier la connexion
1. **Testez dans le navigateur de votre téléphone** :
   - Ouvrez `http://VOTRE_IP:3000`
   - Vous devez voir l'application Area

2. **Si ça ne marche pas** :
   - Vérifiez que vous êtes sur le même WiFi
   - Désactivez temporairement le firewall
   - Redémarrez le serveur avec `--host 0.0.0.0`

---

## 4. Utilisation

### Premier démarrage
1. **Ouvrez Expo Go** sur votre téléphone
2. **Scannez le QR code** affiché dans le terminal
3. **Attendez le chargement** de l'application
4. **Connectez-vous** avec vos identifiants Area

### Navigation dans l'app
- **Interface identique** au web mais optimisée mobile
- **Glissement tactile** pour naviguer
- **Zoom** supporté sur les éléments
- **Notifications** intégrées au système

### Fonctionnalités disponibles
- ✅ Créer et gérer vos automatisations (Areas)
- ✅ Connecter vos comptes de services
- ✅ Consulter l'historique des exécutions
- ✅ Recevoir des notifications push
- ✅ Synchronisation en temps réel avec le web

---

## 5. Fonctionnalités mobiles

### Notifications push
- **Automatisations déclenchées** : Notification quand une Area s'exécute
- **Erreurs** : Alerte en cas de problème avec vos automatisations
- **Nouveaux services** : Information sur les nouveaux services disponibles

### Interface adaptative
- **Design responsive** : Interface qui s'adapte à votre écran
- **Navigation tactile** : Optimisée pour le touch
- **Mode portrait/paysage** : Support des deux orientations

### Synchronisation
- **Compte unifié** : Même compte que sur le web
- **Temps réel** : Modifications instantanées entre web et mobile
- **Hors ligne** : Consultation des données en cache

---

## 6. FAQ utilisateur mobile

**L'app ne se lance pas, que faire ?**
- Vérifiez que vous êtes sur le même WiFi que votre ordinateur
- Redémarrez Expo Go
- Vérifiez que le serveur web tourne sur votre ordinateur

**"Cannot connect to AREA web app" s'affiche**
- Testez l'URL dans le navigateur de votre téléphone d'abord
- Vérifiez l'IP dans la config mobile (`mobile/config.ts`)
- Assurez-vous que le frontend est démarré avec `--host 0.0.0.0`

**L'interface est trop petite/grande**
- Utilisez le zoom natif (pincer pour zoomer)
- L'interface s'adapte automatiquement à votre écran
- Essayez de tourner votre téléphone (mode paysage)

**Les notifications ne marchent pas**
- Autorisez les notifications dans les paramètres de votre téléphone
- Vérifiez que l'app est en arrière-plan (ne pas fermer complètement)
- Redémarrez l'application si nécessaire

**Mes automatisations ne se synchronisent pas**
- Tirez vers le bas pour actualiser
- Vérifiez votre connexion internet
- Reconnectez-vous si nécessaire

---

## 7. Guide de dépannage mobile

### Problèmes de connexion
- **Erreur réseau** : 
  - Vérifiez le WiFi (même réseau ordinateur/téléphone)
  - Testez avec `curl http://VOTRE_IP:3000` sur ordinateur
  - Désactivez temporairement le firewall

- **QR code ne fonctionne pas** :
  - Rapprochez/éloignez le téléphone
  - Augmentez la luminosité de l'écran
  - Essayez de taper l'URL manuellement dans Expo Go

### Problèmes de performance
- **App lente** :
  - Fermez les autres apps sur votre téléphone
  - Redémarrez Expo Go
  - Videz le cache : `npx expo start --clear`

- **Interface qui lag** :
  - Vérifiez votre connexion WiFi
  - Rapprochez-vous du routeur
  - Redémarrez le serveur web

### Problèmes d'affichage
- **Texte trop petit** : Utilisez le zoom (pincer)
- **Éléments coupés** : Tournez en mode paysage
- **Couleurs bizarres** : Vérifiez les paramètres d'affichage de votre téléphone

### Solutions avancées
**Si rien ne marche** :
1. **Utilisez ngrok** pour exposer votre serveur :
   ```bash
   npm install -g ngrok
   ngrok http 3000
   # Utilisez l'URL ngrok dans config.ts
   ```

2. **Testez sur émulateur** :
   ```bash
   pnpm run android  # ou pnpm run ios
   ```

---

## 8. Contact et support

### Support mobile spécifique
- **GitHub Issues** : [Problèmes mobile](https://github.com/EpitechPGE3-2025/G-DEV-500-LYN-5-1-area-9/issues)
- **Tag** : Utilisez le tag `mobile` pour vos issues

### Informations utiles pour le support
Quand vous reportez un problème mobile, indiquez :
1. **Modèle de téléphone** : iPhone 12, Samsung Galaxy S21, etc.
2. **Système d'exploitation** : iOS 15, Android 12, etc.
3. **Version d'Expo Go** : Visible dans l'app
4. **Réseau** : Type de WiFi, force du signal
5. **Message d'erreur exact** avec capture d'écran

### Ressources
- **Documentation développeur mobile** : `mobile_developeur_utilisation.md`
- **Code source mobile** : `mobile/` folder
- **Comparaison des solutions** : `mobile_stack_comparison.md`

---

**Version mobile :** v1.0.0  
**Compatible avec :** iOS 11+ / Android 8+  
**Dernière mise à jour :** 13 octobre 2025
