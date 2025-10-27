# Documentation Utilisateur – Area

## Plan

1. [Présentation](#1-présentation)
2. [Installation](#2-installation)
3. [Lancement](#3-lancement)
4. [Utilisation](#4-utilisation)
5. [Services disponibles et actions/réactions](#5-services-disponibles-et-actionsréactions)
6. [Exemples d'automatisations](#6-exemples-dautomatisations)
7. [FAQ utilisateur](#7-faq-utilisateur)
8. [Guide de dépannage](#8-guide-de-dépannage)
9. [Contact et support](#9-contact-et-support)

---

## 1. Présentation

Ce projet Area permet d'automatiser des actions entre différents services (Google, Microsoft, Discord, Facebook, GitHub, LinkedIn, Spotify, Twitter, etc.) via une interface web. Il se compose d'un frontend (Nuxt 4) et d'un backend (AdonisJS).

### Fonctionnalités principales
- ✅ Connexion OAuth avec plusieurs services
- ✅ Création d'automatisations personnalisées (Areas)
- ✅ Interface web intuitive
- ✅ Application mobile (React Native/Expo)
- ✅ Système de notifications en temps réel

---

## 2. Installation

### Prérequis
- Node.js (v18+ recommandé)
- pnpm (gestionnaire de paquets)
- Accès à internet
- Base de données PostgreSQL (pour le développement local)

### Cloner le projet
```bash
git clone git@github.com:EpitechPGE3-2025/G-DEV-500-LYN-5-1-area-9.git
cd G-DEV-500-LYN-5-1-area-9
```

### Installer les dépendances

#### Installation globale (recommandée)
```bash
pnpm install
```

#### Installation individuelle
```bash
# Backend (AdonisJS)
cd backend && pnpm install

# Frontend (Nuxt 4)
cd ../frontend && pnpm install

# Mobile (Expo - optionnel)
cd ../mobile && pnpm install
```

---

## 3. Lancement

### Lancement rapide (recommandé)
Depuis la racine du projet :
```bash
pnpm run dev
```
Cette commande lance automatiquement le backend et le frontend simultanément.

### Lancement individuel

#### Backend (AdonisJS)
```bash
cd backend
pnpm run dev
```
Le backend démarre sur http://localhost:3333 avec hot reload.

#### Frontend (Nuxt 4)
```bash
cd frontend
pnpm run dev
```
Le frontend démarre sur http://localhost:3000 avec hot reload.

#### Mobile (optionnel)
```bash
cd mobile
pnpm run start
```
Lance l'application mobile avec Expo Metro.

---

## 4. Utilisation

### Premier démarrage
1. **Accéder à l'application** : [http://localhost:3000](http://localhost:3000)
2. **Créer un compte** : Cliquez sur "S'inscrire" et remplissez le formulaire
3. **Se connecter** : Utilisez vos identifiants pour accéder au tableau de bord

### Connecter vos services
1. **Accéder aux comptes** : Rendez-vous dans la section "Comptes connectés"
2. **Ajouter un service** : Cliquez sur le service souhaité (Discord, GitHub, Spotify, etc.)
3. **Autoriser l'accès** : Suivez le processus OAuth du service
4. **Vérifier la connexion** : Le service apparaît comme "Connecté" dans votre liste

### Créer une automatisation (Area)
1. **Nouvelle automatisation** : Cliquez sur "Créer une Area"
2. **Choisir un déclencheur** : Sélectionnez l'action qui va déclencher l'automatisation
3. **Configurer les paramètres** : Remplissez les champs requis pour le déclencheur
4. **Choisir une réaction** : Sélectionnez l'action qui sera exécutée
5. **Finaliser** : Donnez un nom à votre Area et activez-la

### Gérer vos automatisations
- **Tableau de bord** : Vue d'ensemble de toutes vos Areas
- **Historique** : Consultez les exécutions récentes
- **Modifier/Supprimer** : Gérez vos automatisations existantes

---

## 5. Services disponibles et actions/réactions

### Spotify (Pleinement fonctionnel)
**Actions (déclencheurs) :**
- Nouvelle musique ajoutée à une playlist
- Nouvelle musique sauvegardée dans vos favoris

**Réactions (actions automatiques) :**
- Ajouter une musique à une playlist spécifique
- Sauvegarder une musique dans vos favoris

### Discord
**Actions :** Nouveau message dans un salon, mention de votre nom  
**Réactions :** Envoyer un message, notifier un utilisateur

### GitHub
**Actions :** Nouveau commit, nouvelle issue, nouveau pull request  
**Réactions :** Créer une issue, commenter, assigner un développeur

### Google
**Actions :** Nouveau mail Gmail, nouvel événement Calendar  
**Réactions :** Envoyer un mail, créer un événement Calendar

### Facebook
**Actions :** Nouvelle publication, nouveau message  
**Réactions :** Publier sur votre mur, envoyer un message

### LinkedIn
**Actions :** Nouvelle connexion, nouveau message  
**Réactions :** Publier une actualité, envoyer un message

### Twitter/X
**Actions :** Nouveau tweet avec hashtag, nouveau follower  
**Réactions :** Publier un tweet, envoyer un message privé

> **Note :** Certains services peuvent nécessiter une configuration supplémentaire ou des permissions spécifiques selon votre usage.

---

## 6. Exemples d'automatisations

### Exemples populaires
- **Spotify → Spotify** : Quand j'ajoute une musique à ma playlist "Découvertes", l'ajouter automatiquement à ma playlist "Favoris"
- **GitHub → Discord** : Quand une nouvelle issue est créée sur mon projet, envoyer une notification sur Discord
- **Gmail → Spotify** : Quand je reçois un mail important, ajouter une musique relaxante à ma playlist "Focus"
- **Spotify → LinkedIn** : Quand je sauvegarde une nouvelle musique, partager mes découvertes musicales sur LinkedIn

### Cas d'usage avancés
- **Workflow développeur** : GitHub push → Discord notification → Spotify motivation playlist
- **Productivité** : Gmail nouveau mail → Google Calendar événement → Discord rappel
- **Social media** : Nouvelle publication LinkedIn → Twitter retweet → Discord analytics

### Configurations recommandées
1. **Notifications centralisées** : Tous vos services → Discord pour un hub de notifications
2. **Backup automatique** : Actions importantes → Plusieurs services pour la redondance
3. **Workflow créatif** : Inspirations diverses → Playlists Spotify thématiques

---

## 7. FAQ utilisateur

**Comment connecter mon compte Spotify ?**
- Cliquez sur "Connecter Spotify" dans la section Comptes
- Autorisez l'accès aux playlists et à la bibliothèque
- Vérifiez que vous avez un compte Spotify Premium pour certaines fonctionnalités

**Pourquoi mon automatisation Spotify ne fonctionne pas ?**
- Vérifiez que votre compte Spotify est bien connecté et autorisé
- Assurez-vous que les playlists existent et sont accessibles
- Les automatisations peuvent prendre quelques minutes à se déclencher

**Je n'arrive pas à connecter mon compte GitHub, que faire ?**
- Vérifiez que vous avez autorisé l'accès aux repositories
- Essayez de vous déconnecter puis reconnecter
- Vérifiez les permissions de votre organisation GitHub si applicable

**Mon Area ne se déclenche pas, pourquoi ?**
- Vérifiez que tous les services sont connectés et actifs
- Consultez l'historique pour voir les tentatives d'exécution
- Certaines actions peuvent nécessiter des permissions supplémentaires

**Comment modifier une automatisation existante ?**
- Accédez au tableau de bord de vos Areas
- Cliquez sur l'Area à modifier
- Modifiez les paramètres et sauvegardez

---

## 8. Guide de dépannage

### Problèmes de connexion
- **Erreur OAuth** : Déconnectez et reconnectez le service concerné
- **Token expiré** : Reconnectez-vous à l'application et au service
- **Permissions insuffisantes** : Vérifiez les autorisations accordées lors de la connexion

### Problèmes d'automatisation
- **Area inactive** : Vérifiez que l'Area est activée dans votre tableau de bord
- **Service hors ligne** : Consultez le statut des APIs sur les sites officiels (status.spotify.com, status.github.com, etc.)
- **Délai d'exécution** : Les automatisations peuvent prendre 1-5 minutes pour se déclencher

### Problèmes techniques
- **Page qui ne charge pas** : Videz le cache du navigateur ou essayez en navigation privée
- **Données non synchronisées** : Rafraîchissez la page ou déconnectez/reconnectez-vous
- **Erreur 500** : Le serveur est temporairement indisponible, réessayez plus tard

### Limitations connues
- **Spotify** : Nécessite un compte Premium pour certaines actions
- **GitHub** : Limité aux repositories publics ou auxquels vous avez accès
- **Rate limiting** : Certains services limitent le nombre d'actions par heure

---

## 9. Contact et support

### Support utilisateur
- **GitHub Issues** : [Ouvrir un ticket](https://github.com/EpitechPGE3-2025/G-DEV-500-LYN-5-1-area-9/issues)
- **Documentation** : Consultez la documentation développeur pour des détails techniques
- **Status page** : Vérifiez l'état des services sur nos réseaux sociaux

### Ressources utiles
- **Code source** : [GitHub Repository](https://github.com/EpitechPGE3-2025/G-DEV-500-LYN-5-1-area-9)
- **Documentation développeur** : `document/developeur_utilisation.txt`
- **Exemples** : Templates d'automatisations dans l'interface

### Signaler un bug
1. Vérifiez que le bug n'est pas déjà reporté
2. Décrivez les étapes pour reproduire le problème
3. Incluez des captures d'écran si applicable
4. Mentionnez votre navigateur et système d'exploitation

---

**Version du projet :** v1.0.0  
**Dernière mise à jour :** 13 octobre 2025

