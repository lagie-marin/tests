# Documentation Développeur Mobile – Area

## Plan

1. [Architecture mobile](#1-architecture-mobile)
2. [Installation développeur](#2-installation-développeur)
3. [Structure du projet](#3-structure-du-projet)
4. [Configuration](#4-configuration)
5. [Développement](#5-développement)
6. [Build et déploiement](#6-build-et-déploiement)
7. [Debugging](#7-debugging)
8. [Tests](#8-tests)
9. [Bonnes pratiques](#9-bonnes-pratiques)
10. [API et intégrations](#10-api-et-intégrations)

---

## 1. Architecture mobile

### Stack technique
- **Framework** : React Native 0.74+
- **Runtime** : Expo SDK 51+
- **Navigation** : Expo Router (file-based routing)
- **Styling** : StyleSheet natif + Tailwind-style
- **State** : React hooks + Context API
- **Build** : EAS Build (Expo Application Services)

### Approche WebView hybride
```typescript
// App principale = WebView + surcouche native
WebView Component → Area Web App (Nuxt 4)
     ↓
Native Shell (React Native)
     ↓  
Platform APIs (iOS/Android)
```

### Architecture des dossiers
```
mobile/
├── app/                    # Expo Router pages
│   ├── _layout.tsx        # Layout racine
│   ├── index.tsx          # Page principale (WebView)
│   ├── modal.tsx          # Modales natives
│   └── (tabs)/            # Navigation par onglets
├── components/            # Composants React Native
│   ├── WebViewContainer.tsx
│   ├── LoadingSpinner.tsx
│   └── ui/               # Composants UI réutilisables
├── hooks/                # Hooks personnalisés
│   ├── useColorScheme.ts
│   └── useNetworkStatus.ts
├── constants/            # Constantes et configuration
│   ├── theme.ts
│   └── config.ts
├── assets/              # Images, icônes, fonts
└── scripts/             # Scripts utilitaires
```

---

## 2. Installation développeur

### Prérequis
```bash
# Node.js 18+
node --version

# Expo CLI global
npm install -g @expo/cli
npm install -g eas-cli

# Simulateurs (optionnel)
# iOS : Xcode (macOS uniquement)
# Android : Android Studio
```

### Installation
```bash
# Cloner et installer
cd mobile
pnpm install

# Vérifier la config Expo
npx expo doctor

# Démarrage développement
pnpm start
```

### Configuration environnement
```bash
# Créer le fichier .env local
cp .env.example .env

# Variables importantes
EXPO_PUBLIC_WEB_URL=http://192.168.1.100:3000
EXPO_PUBLIC_API_URL=http://192.168.1.100:3333
```

---

## 3. Structure du projet

### Fichiers de configuration principaux

#### `app.json` - Configuration Expo
```json
{
  "expo": {
    "name": "Area Mobile",
    "slug": "area-mobile",
    "version": "1.0.0",
    "platforms": ["ios", "android"],
    "orientation": "portrait",
    "scheme": "area",
    "userInterfaceStyle": "automatic"
  }
}
```

#### `config.ts` - Configuration réseau
```typescript
const CONFIG = {
  WEB_URL: process.env.EXPO_PUBLIC_WEB_URL || 'http://localhost:3000',
  API_URL: process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3333',
  TIMEOUT: 10000,
  RETRY_ATTEMPTS: 3
}
```

### Composants principaux

#### `app/_layout.tsx` - Layout racine
```typescript
import { Stack } from 'expo-router'
import { StatusBar } from 'expo-status-bar'

export default function RootLayout() {
  return (
    <>
      <Stack>
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="modal" options={{ presentation: 'modal' }} />
      </Stack>
      <StatusBar style="auto" />
    </>
  )
}
```

#### `components/WebViewContainer.tsx` - WebView principal
```typescript
import { WebView } from 'react-native-webview'

interface WebViewContainerProps {
  url: string
  onLoad?: () => void
  onError?: (error: any) => void
}

export function WebViewContainer({ url, onLoad, onError }: WebViewContainerProps) {
  return (
    <WebView
      source={{ uri: url }}
      onLoad={onLoad}
      onError={onError}
      javaScriptEnabled={true}
      domStorageEnabled={true}
      allowsBackForwardNavigationGestures={true}
      // Configuration sécurité et performance
      mixedContentMode="compatibility"
      allowsInlineMediaPlayback={true}
      mediaPlaybackRequiresUserAction={false}
    />
  )
}
```

---

## 4. Configuration

### Configuration réseau dynamique
```typescript
// utils/networkConfig.ts
import { Platform } from 'react-native'
import NetInfo from '@react-native-community/netinfo'

export async function getOptimalConfig() {
  const networkState = await NetInfo.fetch()
  
  if (Platform.OS === 'ios') {
    // Configuration iOS spécifique
    return {
      baseURL: 'http://localhost:3000',
      timeout: 8000
    }
  }
  
  // Configuration Android
  return {
    baseURL: 'http://10.0.2.2:3000', // Émulateur Android
    timeout: 10000
  }
}
```

### Variables d'environnement
```bash
# .env
EXPO_PUBLIC_WEB_URL=http://192.168.1.100:3000
EXPO_PUBLIC_API_URL=http://192.168.1.100:3333
EXPO_PUBLIC_ENVIRONMENT=development
EXPO_PUBLIC_DEBUG_MODE=true

# Pour ngrok (développement distant)
EXPO_PUBLIC_WEB_URL=https://abc123.ngrok.io
```

### Configuration des permissions
```json
// app.json
{
  "expo": {
    "permissions": [
      "INTERNET",
      "ACCESS_NETWORK_STATE",
      "VIBRATE",
      "NOTIFICATIONS"
    ],
    "ios": {
      "infoPlist": {
        "NSAppTransportSecurity": {
          "NSAllowsArbitraryLoads": true
        }
      }
    },
    "android": {
      "usesCleartextTraffic": true
    }
  }
}
```

---

## 5. Développement

### Scripts de développement
```json
// package.json
{
  "scripts": {
    "start": "expo start",
    "android": "expo start --android",
    "ios": "expo start --ios",
    "web": "expo start --web",
    "build:android": "eas build --platform android",
    "build:ios": "eas build --platform ios",
    "submit": "eas submit",
    "lint": "eslint .",
    "type-check": "tsc --noEmit"
  }
}
```

### Développement avec reload automatique
```bash
# Mode développement avec auto-reload
pnpm start

# Avec cache vidé
pnpm start --clear

# Tunnel pour test sur autre réseau
pnpm start --tunnel
```

### Hot reloading et debugging
```typescript
// App.tsx - Mode debug
import { __DEV__ } from 'react-native'

if (__DEV__) {
  // Activer les outils de debug
  console.log('🚀 Mode développement activé')
  
  // Debug WebView
  WebView.setWebContentsDebuggingEnabled(true)
}
```

---

## 6. Build et déploiement

### Configuration EAS Build
```json
// eas.json
{
  "cli": {
    "version": ">= 5.2.0"
  },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal"
    },
    "preview": {
      "distribution": "internal",
      "android": {
        "buildType": "apk"
      }
    },
    "production": {
      "android": {
        "buildType": "aab"
      }
    }
  }
}
```

### Build local (développement)
```bash
# Build de développement
npx expo run:android
npx expo run:ios

# Prérequis : 
# - Android Studio + SDK pour Android
# - Xcode pour iOS (macOS uniquement)
```

### Build cloud (EAS)
```bash
# Setup EAS
eas login
eas build:configure

# Build Android
eas build --platform android --profile preview

# Build iOS  
eas build --platform ios --profile preview

# Build production
eas build --platform all --profile production
```

### Déploiement sur stores
```bash
# Soumettre aux stores
eas submit --platform android
eas submit --platform ios

# Prérequis :
# - Compte Google Play Developer
# - Compte Apple Developer Program
```

---

## 7. Debugging

### Debug console
```typescript
// Debugging WebView
const webViewRef = useRef<WebView>(null)

const injectJavaScript = `
  console.log = function(message) {
    window.ReactNativeWebView.postMessage(JSON.stringify({
      type: 'console',
      message: message
    }))
  }
  true;
`

<WebView
  ref={webViewRef}
  source={{ uri: CONFIG.WEB_URL }}
  injectedJavaScript={injectJavaScript}
  onMessage={(event) => {
    const data = JSON.parse(event.nativeEvent.data)
    console.log('WebView Log:', data.message)
  }}
/>
```

### Debug réseau
```typescript
// hooks/useNetworkDebug.ts
import NetInfo from '@react-native-community/netinfo'

export function useNetworkDebug() {
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      console.log('📶 Network State:', {
        type: state.type,
        isConnected: state.isConnected,
        isInternetReachable: state.isInternetReachable
      })
    })
    
    return unsubscribe
  }, [])
}
```

### Remote debugging
```bash
# Flipper (recommandé)
npx expo install react-native-flipper

# React DevTools
npm install -g react-devtools
react-devtools

# Chrome DevTools pour WebView
# Dans Chrome : chrome://inspect/#devices
```

---

## 8. Tests

### Configuration des tests
```bash
# Installation
pnpm add -D jest @testing-library/react-native

# Configuration jest.config.js
module.exports = {
  preset: 'react-native',
  setupFilesAfterEnv: ['<rootDir>/jest-setup.js'],
  transformIgnorePatterns: [
    'node_modules/(?!(react-native|@react-native|expo|@expo)/)'
  ]
}
```

### Tests unitaires
```typescript
// __tests__/WebViewContainer.test.tsx
import { render } from '@testing-library/react-native'
import { WebViewContainer } from '../components/WebViewContainer'

describe('WebViewContainer', () => {
  it('renders correctly', () => {
    const { getByTestId } = render(
      <WebViewContainer url="http://test.com" />
    )
    
    expect(getByTestId('webview')).toBeTruthy()
  })
})
```

### Tests E2E avec Detox
```bash
# Installation Detox
pnpm add -D detox

# Configuration détox
# detox.config.js
module.exports = {
  testRunner: 'jest',
  runnerConfig: 'e2e/config.json',
  apps: {
    'ios.debug': {
      type: 'ios.app',
      binaryPath: 'ios/build/Build/Products/Debug-iphonesimulator/AreaMobile.app'
    }
  }
}
```

---

## 9. Bonnes pratiques

### Performance
```typescript
// Optimisation WebView
<WebView
  // Réduire l'usage mémoire
  cacheEnabled={true}
  cacheMode="LOAD_CACHE_ELSE_NETWORK"
  
  // Optimiser les rendus
  renderLoading={() => <LoadingSpinner />}
  startInLoadingState={true}
  
  // Gérer les erreurs réseau
  onError={(error) => handleWebViewError(error)}
  onHttpError={(error) => handleHttpError(error)}
/>
```

### Gestion d'état
```typescript
// Context pour état global
export const AppContext = createContext<AppState>({})

export function AppProvider({ children }: { children: ReactNode }) {
  const [webViewUrl, setWebViewUrl] = useState(CONFIG.WEB_URL)
  const [isOnline, setIsOnline] = useState(true)
  
  return (
    <AppContext.Provider value={{ webViewUrl, isOnline }}>
      {children}
    </AppContext.Provider>
  )
}
```

### Sécurité
```typescript
// Validation des URLs
function isValidUrl(url: string): boolean {
  const allowedDomains = [
    'localhost',
    '192.168.',
    '10.0.0.',
    'your-domain.com'
  ]
  
  return allowedDomains.some(domain => url.includes(domain))
}

// Communication sécurisée WebView ↔ Native
const secureMessageHandler = (event: WebViewMessageEvent) => {
  try {
    const message = JSON.parse(event.nativeEvent.data)
    
    // Valider le message
    if (isValidMessage(message)) {
      handleMessage(message)
    }
  } catch (error) {
    console.error('Invalid message from WebView:', error)
  }
}
```

---

## 10. API et intégrations

### Communication WebView ↔ Native
```typescript
// Côté React Native
const sendToWebView = (message: any) => {
  webViewRef.current?.postMessage(JSON.stringify(message))
}

// Côté Web (dans Nuxt)
window.addEventListener('message', (event) => {
  const message = JSON.parse(event.data)
  handleNativeMessage(message)
})

// Envoyer vers React Native
window.ReactNativeWebView?.postMessage(JSON.stringify({
  type: 'navigation',
  path: '/dashboard'
}))
```

### Notifications push
```typescript
// Configuration Expo Notifications
import * as Notifications from 'expo-notifications'

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
})

// Envoyer notification depuis le web
async function sendPushNotification(message: string) {
  await fetch('https://exp.host/--/api/v2/push/send', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      to: expoPushToken,
      sound: 'default',
      title: 'Area Automation',
      body: message,
    }),
  })
}
```

### Deep linking
```typescript
// Configuration du scheme
// app.json
{
  "expo": {
    "scheme": "area",
    "ios": {
      "associatedDomains": ["applinks:area-app.com"]
    },
    "android": {
      "intentFilters": [{
        "action": "VIEW",
        "data": {
          "scheme": "area"
        }
      }]
    }
  }
}

// Handling des deep links
import { useURL } from 'expo-linking'

export default function App() {
  const url = useURL()
  
  useEffect(() => {
    if (url) {
      // area://automation/123
      handleDeepLink(url)
    }
  }, [url])
}
```

---

## Ressources supplémentaires

### Documentation officielle
- [Expo Documentation](https://docs.expo.dev/)
- [React Native WebView](https://github.com/react-native-webview/react-native-webview)
- [EAS Build](https://docs.expo.dev/build/introduction/)

### Outils de développement
- **Expo Dev Tools** : Interface web pour gérer l'app
- **Flipper** : Debug et profiling avancé
- **React DevTools** : Debug des composants React

### CI/CD
```yaml
# .github/workflows/mobile-build.yml
name: Build Mobile App
on:
  push:
    paths: ['mobile/**']
    
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm install -g eas-cli
      - run: eas build --platform android --non-interactive
```

---

**Version :** v1.0.0 (Expo SDK 51)  
**Dernière mise à jour :** 13 octobre 2025
