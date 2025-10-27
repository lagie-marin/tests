# Architecture Web – Area

## Plan

1. [Vue d'ensemble](#1-vue-densemble)
2. [Architecture générale](#2-architecture-générale)
3. [Backend (AdonisJS)](#3-backend-adonisjs)
4. [Frontend (Nuxt 4)](#4-frontend-nuxt-4)
5. [Mobile (React Native/Expo)](#5-mobile-react-nativeexpo)
6. [Base de données](#6-base-de-données)
7. [Services externes](#7-services-externes)
8. [Flux de données](#8-flux-de-données)
9. [Sécurité](#9-sécurité)
10. [Déploiement](#10-déploiement)

---

## 1. Vue d'ensemble

Area est une plateforme d'automatisation moderne construite avec une architecture microservices permettant de connecter différents services web via des automatisations personnalisées.

### Stack technique principale
- **Backend** : AdonisJS 6 (Node.js, TypeScript)
- **Frontend** : Nuxt 4 (Vue.js 3, TypeScript)
- **Mobile** : React Native avec Expo
- **Base de données** : PostgreSQL
- **Authentification** : JWT + OAuth2
- **Qualité** : PushGuardian (CLI personnalisé)

---

## 2. Architecture générale

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │     Mobile      │    │   Services      │
│   (Nuxt 4)      │    │   (Expo/RN)     │    │   Externes      │
│   Port 3000     │    │                 │    │   (OAuth APIs)  │
└─────────┬───────┘    └─────────┬───────┘    └─────────┬───────┘
          │                      │                      │
          │                      │                      │
          └──────────────────────┼──────────────────────┘
                                 │
                    ┌─────────────┴───────────┐
                    │      Backend API        │
                    │     (AdonisJS 6)        │
                    │      Port 3333          │
                    └─────────────┬───────────┘
                                  │
                    ┌─────────────┴───────────┐
                    │     PostgreSQL          │
                    │    Base de données      │
                    └─────────────────────────┘
```

---

## 3. Backend (AdonisJS)

### Structure des dossiers
```
backend/
├── app/
│   ├── controllers/          # Logique des routes API
│   │   ├── auth_controller.ts
│   │   ├── social_auth_controller.ts
│   │   ├── social_accounts_controller.ts
│   │   ├── automation_actions_controller.ts
│   │   ├── automation_reactions_controller.ts
│   │   └── automations_controller.ts
│   ├── models/              # Modèles de données (Lucid ORM)
│   │   ├── user.ts
│   │   ├── social_account.ts
│   │   ├── automation.ts
│   │   └── automation_state.ts
│   ├── services/            # Services métier
│   │   ├── automation/      # Engine d'automatisation
│   │   │   ├── engine.ts
│   │   │   ├── action_registry.ts
│   │   │   ├── reaction_registry.ts
│   │   │   ├── actions/     # Actions par service
│   │   │   └── reactions/   # Réactions par service
│   │   ├── social_auth_service.ts
│   │   └── social_state_service.ts
│   ├── middleware/          # Middlewares personnalisés
│   │   ├── auth_middleware.ts
│   │   ├── container_bindings_middleware.ts
│   │   └── force_json_response_middleware.ts
│   └── validators/          # Validation des données
│       ├── auth.ts
│       └── automations.ts
├── config/                  # Configuration
│   ├── ally.ts             # OAuth providers
│   ├── auth.ts             # JWT config
│   ├── database.ts         # DB config
│   └── cors.ts             # CORS config
├── database/
│   └── migrations/         # Migrations DB
└── start/
    ├── kernel.ts          # Middlewares
    ├── routes.ts          # Routes API
    └── env.ts             # Variables env
```

### APIs principales
- `POST /api/auth/register|login` - Authentification
- `GET /api/auth/me` - Profil utilisateur
- `GET /api/auth/social/:provider/redirect` - OAuth redirect
- `GET /api/auth/social/:provider/callback` - OAuth callback
- `GET /api/auth/social/providers` - Comptes connectés
- `GET /api/auth/automation/actions|reactions` - Catalogue
- `POST /api/auth/automations` - Créer automation

### Système d'automatisation
```typescript
// Pattern Registry pour actions/réactions
ActionRegistry.register({
  id: 'spotify.new_playlist_track',
  serviceId: 'spotify',
  execute: async (context, params) => { /* logique */ }
})

// Engine d'automatisation
AutomationEngine.process(trigger, automation)
```

---

## 4. Frontend (Nuxt 4)

### Structure des dossiers
```
frontend/
├── app/
│   ├── components/          # Composants Vue réutilisables
│   │   ├── ui/             # Composants UI (Nuxt UI)
│   │   ├── forms/          # Formulaires
│   │   └── automation/     # Composants spécifiques
│   ├── pages/              # Pages Nuxt (routage auto)
│   │   ├── index.vue       # Accueil
│   │   ├── login.vue       # Connexion
│   │   ├── register.vue    # Inscription
│   │   └── app/            # Application protégée
│   │       ├── dashboard.vue
│   │       ├── automations.vue
│   │       └── accounts.vue
│   ├── layouts/            # Layouts Nuxt
│   │   ├── default.vue
│   │   └── app.vue
│   ├── stores/             # Pinia stores
│   │   ├── auth.ts         # État d'authentification
│   │   ├── automations.ts  # Gestion des Areas
│   │   └── accounts.ts     # Comptes connectés
│   ├── middleware/         # Middlewares Nuxt
│   │   └── auth.ts         # Protection des routes
│   └── composables/        # Composables Vue
│       ├── useAuth.ts
│       └── useApi.ts
├── public/                 # Fichiers statiques
└── server/                 # API côté frontend (optionnel)
```

### Technologies utilisées
- **Nuxt 4** : Framework Vue.js full-stack
- **Nuxt UI** : Système de design (Tailwind CSS)
- **Pinia** : Gestion d'état réactive
- **Nuxt Content** : Gestion de contenu
- **TypeScript** : Typage statique

---

## 5. Mobile (React Native/Expo)

### Structure
```
mobile/
├── app/
│   ├── _layout.tsx         # Layout principal
│   ├── modal.tsx           # Modal partagée
│   └── (tabs)/             # Navigation par onglets
│       ├── index.tsx       # Accueil
│       ├── automations.tsx # Areas
│       └── profile.tsx     # Profil
├── components/             # Composants React Native
├── constants/              # Constantes (thème, etc.)
├── hooks/                  # Hooks personnalisés
└── assets/                 # Images, icônes
```

### Fonctionnalités mobiles
- **Navigation native** avec Expo Router
- **Authentification** synchronisée avec le web
- **Push notifications** pour les automatisations
- **Interface adaptive** iOS/Android

---

## 6. Base de données

### Schéma PostgreSQL
```sql
-- Utilisateurs
users (
  id: serial,
  firstName: varchar,
  lastName: varchar,
  email: varchar unique,
  password: varchar,
  role: varchar,
  created_at: timestamp,
  updated_at: timestamp
)

-- Comptes sociaux connectés
social_accounts (
  id: serial,
  user_id: foreign key,
  provider: varchar, -- 'spotify', 'github', etc.
  provider_id: varchar,
  access_token: text,
  refresh_token: text,
  metadata: jsonb,
  created_at: timestamp,
  updated_at: timestamp
)

-- Automatisations
automations (
  id: serial,
  user_id: foreign key,
  name: varchar,
  action_id: varchar,
  action_parameters: jsonb,
  reaction_id: varchar,
  reaction_parameters: jsonb,
  is_active: boolean,
  created_at: timestamp,
  updated_at: timestamp
)

-- État des automatisations
automation_states (
  id: serial,
  automation_id: foreign key,
  last_check: timestamp,
  state_data: jsonb,
  created_at: timestamp,
  updated_at: timestamp
)
```

---

## 7. Services externes

### OAuth Providers configurés
```typescript
// backend/config/ally.ts
{
  discord: {
    clientId: env.DISCORD_CLIENT_ID,
    scopes: ['identify', 'email', 'guilds']
  },
  spotify: {
    clientId: env.SPOTIFY_CLIENT_ID,
    scopes: ['user-read-private', 'playlist-modify-public']
  },
  github: {
    clientId: env.GITHUB_CLIENT_ID,
    scopes: ['repo', 'user:email']
  },
  // ... autres services
}
```

### APIs utilisées
- **Spotify Web API** : Gestion des playlists et tracks
- **GitHub API** : Repositories, issues, commits
- **Discord API** : Messages, webhooks
- **Google APIs** : Gmail, Calendar
- **Twitter API v2** : Tweets, mentions
- **Facebook Graph API** : Posts, messages

---

## 8. Flux de données

### Authentification OAuth
```
1. User clique "Connecter Spotify"
2. Frontend → Backend /auth/social/spotify/redirect
3. Backend → Spotify OAuth (authorization_code)
4. Spotify → Backend /auth/social/spotify/callback
5. Backend stocke tokens → DB
6. Backend → Frontend (success)
7. Frontend met à jour l'état
```

### Exécution d'automatisation
```
1. Déclencheur détecté (ex: nouvelle track Spotify)
2. AutomationEngine.process()
3. ActionRegistry.findById(actionId).execute()
4. Données récupérées et formatées
5. ReactionRegistry.findById(reactionId).execute()
6. Action exécutée sur service cible
7. État mis à jour en DB
```

---

## 9. Sécurité

### Authentification
- **JWT tokens** avec expiration
- **Refresh tokens** pour renouvellement
- **OAuth2** pour services externes
- **Middleware d'auth** sur routes protégées

### Protection des données
- **Variables d'environnement** pour secrets
- **Tokens chiffrés** en base
- **CORS** configuré
- **Validation** stricte des entrées

### Bonnes pratiques
- **Rate limiting** sur APIs
- **Sanitization** des données
- **HTTPS** en production
- **Logs sécurisés** (pas de tokens)

---

## 10. Déploiement

### Environnements
```
Development:
- Backend: localhost:3333
- Frontend: localhost:3000
- DB: PostgreSQL local

Production:
- Backend: VPS/Cloud (Docker)
- Frontend: Vercel/Netlify
- DB: PostgreSQL managée
- Mobile: App stores
```

### Scripts de déploiement
```bash
# Build production
pnpm run build

# Backend
cd backend && pnpm run build
node build/bin/server.js

# Frontend
cd frontend && pnpm run build
pnpm run preview
```

### Monitoring
- **Logs centralisés** pour debugging
- **Health checks** sur APIs
- **Métriques** d'usage des automatisations
- **Alertes** en cas d'erreur

---

**Version :** v1.0.0  
**Dernière mise à jour :** 13 octobre 2025
