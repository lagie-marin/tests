# Documentation Développeur – Area

## Plan

1. Structure du projet
2. Installation
3. Lancement du projet### Services OAuth
Les services OAuth sont configurés dans `backend/config/ally.ts` avec AdonisJS Ally. 

Variables d'environnement requises dans `backend/.env` :
```
APP_URL=http://localhost:3333

# Discord
DISCORD_CLIENT_ID=votre_client_id
DISCORD_CLIENT_SECRET=votre_client_secret

# Facebook  
FACEBOOK_CLIENT_ID=votre_client_id
FACEBOOK_CLIENT_SECRET=votre_client_secret

# GitHub
GITHUB_CLIENT_ID=votre_client_id
GITHUB_CLIENT_SECRET=votre_client_secret

# Google
GOOGLE_CLIENT_ID=votre_client_id
GOOGLE_CLIENT_SECRET=votre_client_secret

# LinkedIn
LINKEDINOPENIDCONNECT_CLIENT_ID=votre_client_id
LINKEDINOPENIDCONNECT_CLIENT_SECRET=votre_client_secret

# Spotify
SPOTIFY_CLIENT_ID=votre_client_id
SPOTIFY_CLIENT_SECRET=votre_client_secret

# Twitter/X
TWITTER_CLIENT_ID=votre_client_id  
TWITTER_CLIENT_SECRET=votre_client_secret
```

Chaque provider est configuré avec ses scopes spécifiques et callback URLs automatiques.  - Variables d’environnement
   - Services OAuth
5. Liste des services et actions/réactions
6. Implémentation d’une nouvelle action/réaction
7. Schéma de fonctionnement de l’automatisation (Area)
8. Développement et bonnes pratiques
9. Points techniques
10. Contribution

---

## 1. Structure du projet

- `backend/` : API AdonisJS (Node.js, TypeScript)
  - `app/` : logique métier
    - `controllers/` : contrôleurs API (auth, social, automations)
    - `models/` : modèles de données (User, SocialAccount, Automation, etc.)
    - `services/` : services métier (automation engine, social auth, etc.)
    - `middleware/` : middlewares personnalisés
    - `validators/` : validation des données
    - `constants/` : constantes de l'application
  - `config/` : configuration (database, auth, ally OAuth, etc.)
  - `database/` : migrations et seeders
  - `start/` : initialisation (routes, kernel, env)
  - `tests/` : tests backend (functional, unit)
- `frontend/` : interface utilisateur Nuxt 4 (Vue.js, TypeScript)
  - `app/` : application Nuxt
    - `components/` : composants Vue réutilisables
    - `pages/` : pages de l'application
    - `layouts/` : layouts Nuxt
    - `stores/` : stores Pinia pour la gestion d'état
  - `public/` : fichiers statiques
  - `server/` : API côté frontend (si nécessaire)
- `pushguardian/` : outils CLI pour la qualité et la configuration
- `document/` : documentation utilisateur et développeur
- `mobile/` : application mobile (React Native avec Expo)

---

## 2. Installation

### Prérequis

- Node.js v18+
- pnpm
- Base de données PostgreSQL (ou adapter la config)

### Installation des dépendances

À la racine du projet (utilise les workspaces pnpm) :
```bash
pnpm install
```

Ou individuellement :
```bash
cd backend && pnpm install
cd ../frontend && pnpm install
cd ../pushguardian && pnpm install
cd ../mobile && pnpm install
```

---

## 3. Lancement du projet

### Démarrage global (depuis la racine)
```bash
pnpm run dev  # Lance backend et frontend simultanément
```

### Démarrage individuel
#### Backend (AdonisJS)
```bash
cd backend
pnpm run dev  # Lance avec hot reload sur port 3333
```

#### Frontend (Nuxt 4)
```bash
cd frontend
pnpm run dev  # Lance sur port 3000
```

#### Mobile (Expo)
```bash
cd mobile
pnpm run start  # Lance Expo Metro
```

---

## 4. Configuration

### Variables d’environnement
- À placer dans `.env` (backend) et `.env` (frontend si besoin).
- Adapter la config de la base de données dans `backend/config/database.ts`.

### Services OAuth
Pour permettre l’authentification et l’automatisation avec des services externes (Discord, Facebook, GitHub, Google, LinkedIn, Spotify, Twitter), ajoutez les identifiants suivants dans le fichier `.env` du backend :
```
DISCORD_CLIENT_ID=VOTRE_CLIENT_ID
DISCORD_CLIENT_SECRET=VOTRE_CLIENT_SECRET
FACEBOOK_CLIENT_ID=VOTRE_CLIENT_ID
FACEBOOK_CLIENT_SECRET=VOTRE_CLIENT_SECRET
GITHUB_CLIENT_ID=VOTRE_CLIENT_ID
GITHUB_CLIENT_SECRET=VOTRE_CLIENT_SECRET
GOOGLE_CLIENT_ID=VOTRE_CLIENT_ID
GOOGLE_CLIENT_SECRET=VOTRE_CLIENT_SECRET
LINKEDINOPENIDCONNECT_CLIENT_ID=VOTRE_CLIENT_ID
LINKEDINOPENIDCONNECT_CLIENT_SECRET=VOTRE_CLIENT_SECRET
SPOTIFY_CLIENT_ID=VOTRE_CLIENT_ID
SPOTIFY_CLIENT_SECRET=VOTRE_CLIENT_SECRET
TWITTER_CLIENT_ID=VOTRE_CLIENT_ID
TWITTER_CLIENT_SECRET=VOTRE_CLIENT_SECRET
```
- Les providers OAuth se configurent dans `backend/config/ally.ts`.

---

## 5. Architecture des automatisations

### Système d'actions et réactions
Le projet utilise un système de registry pour enregistrer les actions et réactions :
- `AutomationActionRegistry` : Gère les déclencheurs (actions)
- `AutomationReactionRegistry` : Gère les réponses (réactions)
- `AutomationEngine` : Orchestrateur principal

### Services implémentés

#### Spotify (Exemple concret)
**Actions disponibles :**
- `new_playlist_track_action` : Détecte l'ajout d'une track à une playlist
- `new_saved_track_action` : Détecte l'ajout d'une track aux favoris

**Réactions disponibles :**
- `add_track_to_playlist_reaction` : Ajoute une track à une playlist
- `save_track_reaction` : Sauvegarde une track dans les favoris

**Fichiers concernés :**
- `backend/app/services/automation/actions/spotify/`
- `backend/app/services/automation/reactions/spotify/`
- Helper : `backend/app/services/automation/spotify/helpers.ts`

#### Autres services (Discord, GitHub, Google, etc.)
Architecture similaire avec actions/réactions spécifiques à chaque service.

### Contrôleurs API
- `auth_controller.ts` : Authentification utilisateur (register, login, me, logout)
- `social_auth_controller.ts` : OAuth avec providers externes
- `social_accounts_controller.ts` : Gestion des comptes connectés
- `automation_actions_controller.ts` : API pour lister les actions disponibles
- `automation_reactions_controller.ts` : API pour lister les réactions disponibles
- `automations_controller.ts` : CRUD des automatisations utilisateur

---

## 6. Implémentation d'une nouvelle action/réaction

### Exemple : Ajouter une action Twitter

1. **Créer l'action** dans `backend/app/services/automation/actions/twitter/`
```typescript
// new_tweet_action.ts
import { AutomationActionDefinition } from '#services/automation/types'

export const newTweetAction: AutomationActionDefinition = {
  id: 'twitter.new_tweet',
  serviceId: 'twitter',
  displayName: 'Nouveau tweet',
  description: 'Se déclenche quand vous postez un nouveau tweet',
  parameters: [
    {
      key: 'hashtag',
      displayName: 'Hashtag à surveiller',
      type: 'string',
      required: false
    }
  ],
  async execute(context, parameters) {
    // Logique de détection de nouveau tweet
  }
}
```

2. **Créer la réaction** dans `backend/app/services/automation/reactions/twitter/`
```typescript  
// send_tweet_reaction.ts
import { AutomationReactionDefinition } from '#services/automation/types'

export const sendTweetReaction: AutomationReactionDefinition = {
  id: 'twitter.send_tweet',
  serviceId: 'twitter', 
  displayName: 'Envoyer un tweet',
  description: 'Poste un nouveau tweet',
  parameters: [
    {
      key: 'message',
      displayName: 'Message du tweet',
      type: 'string',
      required: true
    }
  ],
  async execute(context, parameters, triggerData) {
    // Logique d'envoi de tweet
  }
}
```

3. **Enregistrer dans le registry** (`backend/app/services/automation/index.ts`)
```typescript
import { newTweetAction, sendTweetReaction } from './actions/twitter'

actionRegistry.register(newTweetAction)
reactionRegistry.register(sendTweetReaction)
```

4. **Ajouter les tests** dans `backend/tests/functional/` ou `backend/tests/unit/`

---

## 7. Schéma de fonctionnement de l’automatisation (Area)

1. Déclencheur : Un événement est détecté sur un service (ex : nouveau mail Google).
2. Traitement : Le backend reçoit l’événement, vérifie les conditions et appelle le service concerné.
3. Réaction : Une action est exécutée sur un autre service (ex : envoi d’un message Discord).

```
Utilisateur → Frontend → Backend → Service déclencheur → Traitement → Service réaction
```
Exemple de flux :
- L’utilisateur configure une Area : « Si je reçois un mail, alors envoie un message Discord ».
- Le backend surveille l’événement (mail reçu), puis déclenche l’action Discord via le service.

---

## 8. Développement et bonnes pratiques

### Scripts disponibles

**À la racine :**
- `pnpm run dev` : Lance backend + frontend simultanément  
- `pnpm run dev:backend` : Lance uniquement le backend
- `pnpm run dev:frontend` : Lance uniquement le frontend

**Backend :**
- `pnpm run dev` : Développement avec hot reload (ace serve --hmr)
- `pnpm run build` : Build de production (ace build)
- `pnpm run test` : Lance les tests (ace test)
- `pnpm run lint` : ESLint
- `pnpm run format` : Prettier
- `pnpm run typecheck` : Vérification TypeScript

**Frontend :**
- `pnpm run dev` : Développement Nuxt 4
- `pnpm run build` : Build de production
- `pnpm run preview` : Preview du build

### Bonnes pratiques
- Respecter l'architecture AdonisJS (contrôleurs, modèles, services)
- Utiliser le système de registry pour les automatisations
- Valider les données avec les validators AdonisJS
- Utiliser les middlewares pour l'authentification
- Tester les nouvelles actions/réactions
- Suivre les conventions TypeScript strictes
- Documenter les nouvelles APIs
- Utiliser PushGuardian pour la qualité du code

---

## 9. Points techniques

### Backend (AdonisJS)
- **Authentification** : JWT avec AdonisJS Auth + Access Tokens
- **OAuth2** : AdonisJS Ally pour les providers sociaux
- **Base de données** : Lucid ORM avec PostgreSQL
- **Validation** : Validators AdonisJS avec VineJS
- **Architecture** : Pattern Registry pour les automatisations
- **Middlewares** : Auth, CORS, Container bindings, Force JSON response

### Frontend (Nuxt 4)
- **Framework** : Nuxt 4 avec Vue 3
- **UI** : Nuxt UI v4.0
- **State Management** : Pinia 
- **Styling** : Tailwind CSS (via Nuxt UI)
- **Testing** : Nuxt Test Utils
- **Content** : Nuxt Content 3.7

### Mobile
- **Framework** : React Native avec Expo
- **TypeScript** : Configuration stricte

### DevOps & Qualité
- **PushGuardian** : CLI personnalisé pour la qualité
- **ESLint** : Configuration stricte multi-projets
- **Prettier** : Formatage automatique
- **pnpm workspaces** : Gestion des dépendances monorepo

### APIs externes
- **Routes principales** :
  - `POST /api/auth/register|login` : Authentification
  - `GET /api/auth/me` : Profil utilisateur
  - `GET /api/auth/social/:provider/redirect` : OAuth redirect
  - `GET /api/auth/social/:provider/callback` : OAuth callback  
  - `GET /api/auth/social/providers` : Comptes connectés
  - `GET /api/auth/automation/actions|reactions` : Catalog actions/réactions
  - `POST /api/auth/automations` : Créer une automation

---

## 10. Contribution

1. Forker le projet et créer une branche dédiée.
2. Proposer une Pull Request claire et documentée.
3. Respecter les conventions de nommage et la structure du projet.

---

