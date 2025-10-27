# Documentation complète pour l'intégration de l'API Microsoft Teams

## Vue d'ensemble

Cette documentation explique comment configurer l'API Microsoft Teams pour recevoir des événements en temps réel, notamment les messages reçus par les utilisateurs. L'intégration utilise Microsoft Graph API avec des notifications de changement (webhooks) pour une architecture pilotée par les événements.

## Prérequis

### 1. Inscription d'application Azure AD

Vous devez d'abord enregistrer votre application dans Azure Active Directory :

1. Accédez au [Centre d'administration Microsoft Entra](https://entra.microsoft.com/)
2. Naviguez vers **Entra ID > Inscriptions d'applications**
3. Cliquez sur **Nouvelle inscription**
4. Donnez un nom à votre application (ex: "Teams Integration App")
5. Sélectionnez le type de compte approprié
6. Cliquez sur **Enregistrer**

**Note importante :** Enregistrez l'**ID d'application (client)** qui sera généré.

### 2. Configuration des autorisations

Dans votre inscription d'application, ajoutez les autorisations suivantes :

#### Autorisations Microsoft Graph :
- `ChannelMessage.Read.All` - Pour lire tous les messages de canal
- `Chat.Read.All` - Pour lire tous les chats
- `ChatMessage.Read.All` - Pour lire tous les messages de chat
- `User.Read` - Pour lire les informations utilisateur de base

#### Autorisations Teams :
- `ChannelMessage.Read.Group` - Pour les messages de canal spécifiques
- `ChatMessage.Read.Chat` - Pour les messages de chat spécifiques

### 3. Certificat de chiffrement

Pour les notifications riches (avec données), vous devez :
1. Générer un certificat auto-signé ou utiliser Azure Key Vault
2. Exporter le certificat au format X.509 codé en Base64
3. Stocker la clé privée de manière sécurisée

## Architecture de l'intégration

### Flux de notifications

```
Événement Teams → Microsoft Graph → Webhook → Votre application
     ↓              ↓              ↓              ↓
 Message reçu → Notification → Validation → Traitement
```

### Types d'abonnements disponibles

1. **Messages de canal spécifiques** : `/teams/{team-id}/channels/{channel-id}/messages`
2. **Tous les messages de canal** : `/teams/getAllMessages`
3. **Messages de chat spécifiques** : `/chats/{chat-id}/messages`
4. **Tous les messages de chat** : `/chats/getAllMessages`
5. **Messages pour un utilisateur** : `/users/{user-id}/chats/getAllMessages`

## Configuration des webhooks

### 1. Point de terminaison de notification

Votre application doit exposer un point de terminaison HTTPS qui :

- Accepte les requêtes POST
- Répond rapidement (dans les 5 secondes)
- Gère la validation initiale
- Traite les notifications de changement

Exemple de contrôleur (Node.js/Express) :

```javascript
const express = require('express');
const crypto = require('crypto');

const app = express();
app.use(express.json());

// Point de terminaison pour les notifications Teams
app.post('/api/notifications', async (req, res) => {
    try {
        const notifications = req.body.value;

        // Validation des tokens (pour notifications riches)
        if (req.body.validationTokens) {
            // Valider les tokens JWT
            const isValid = await validateTokens(req.body.validationTokens);
            if (!isValid) {
                return res.status(400).send('Invalid tokens');
            }
        }

        // Traiter chaque notification
        for (const notification of notifications) {
            await processNotification(notification);
        }

        // Répondre immédiatement
        res.status(202).send();

        // Traiter les notifications de manière asynchrone
        processNotificationsAsync(notifications);

    } catch (error) {
        console.error('Erreur traitement notification:', error);
        res.status(500).send();
    }
});

// Validation initiale du webhook
app.post('/api/notifications', (req, res) => {
    if (req.query.validationToken) {
        // Répondre avec le token de validation
        res.set('Content-Type', 'text/plain');
        res.send(req.query.validationToken);
    }
});

async function validateTokens(tokens) {
    // Implémentation de validation JWT
    // Utiliser MSAL ou bibliothèque JWT
}

async function processNotification(notification) {
    const { changeType, resource, resourceData } = notification;

    switch (changeType) {
        case 'created':
            console.log('Nouveau message:', resource);
            // Traiter le nouveau message
            break;
        case 'updated':
            console.log('Message modifié:', resource);
            // Traiter la modification
            break;
        case 'deleted':
            console.log('Message supprimé:', resource);
            // Traiter la suppression
            break;
    }
}
```

### 2. Création d'un abonnement

Pour créer un abonnement aux notifications :

```javascript
const axios = require('axios');

async function createSubscription() {
    const subscription = {
        changeType: 'created,updated,deleted',
        notificationUrl: 'https://votredomaine.com/api/notifications',
        resource: '/teams/getAllMessages', // ou '/chats/getAllMessages'
        includeResourceData: true, // Pour données riches
        encryptionCertificate: 'BASE64_CERTIFICATE',
        encryptionCertificateId: 'votre-cert-id',
        expirationDateTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24h
        clientState: 'secret-state-pour-validation'
    };

    try {
        const response = await axios.post(
            'https://graph.microsoft.com/v1.0/subscriptions',
            subscription,
            {
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json'
                }
            }
        );

        console.log('Abonnement créé:', response.data.id);
        return response.data;
    } catch (error) {
        console.error('Erreur création abonnement:', error.response.data);
    }
}
```

## Gestion des notifications

### Types de notifications

#### Notifications basiques (sans données)
```json
{
    "subscriptionId": "12345678-1234-1234-1234-123456789012",
    "changeType": "created",
    "tenantId": "tenant-id",
    "clientState": "secret-state",
    "resource": "teams/team-id/channels/channel-id/messages/message-id",
    "resourceData": {
        "id": "message-id",
        "@odata.type": "#Microsoft.Graph.chatMessage",
        "@odata.id": "teams/team-id/channels/channel-id/messages/message-id"
    }
}
```

#### Notifications riches (avec données chiffrées)
```json
{
    "value": [{
        "subscriptionId": "12345678-1234-1234-1234-123456789012",
        "changeType": "created",
        "resource": "teams/team-id/channels/channel-id/messages/message-id",
        "resourceData": {
            "id": "message-id",
            "@odata.type": "#Microsoft.Graph.chatMessage",
            "@odata.id": "teams/team-id/channels/channel-id/messages/message-id"
        },
        "encryptedContent": {
            "data": "données-chiffrées-base64",
            "dataSignature": "signature-hmac-sha256",
            "dataKey": "clé-symétrique-chiffrée",
            "encryptionCertificateId": "cert-id"
        }
    }],
    "validationTokens": ["token-jwt-1", "token-jwt-2"]
}
```

### Déchiffrement des données (pour notifications riches)

```javascript
const crypto = require('crypto');

async function decryptNotification(encryptedContent, certificateId) {
    // 1. Récupérer le certificat privé
    const certificate = getCertificateById(certificateId);
    const privateKey = certificate.privateKey;

    // 2. Déchiffrer la clé symétrique
    const encryptedKey = Buffer.from(encryptedContent.dataKey, 'base64');
    const symmetricKey = crypto.privateDecrypt(
        {
            key: privateKey,
            padding: crypto.constants.RSA_PKCS1_OAEP_PADDING
        },
        encryptedKey
    );

    // 3. Vérifier la signature HMAC
    const data = Buffer.from(encryptedContent.data, 'base64');
    const expectedSignature = crypto
        .createHmac('sha256', symmetricKey)
        .update(data)
        .digest();

    const providedSignature = Buffer.from(encryptedContent.dataSignature, 'base64');

    if (!crypto.timingSafeEqual(expectedSignature, providedSignature)) {
        throw new Error('Signature invalide');
    }

    // 4. Déchiffrer les données
    const iv = symmetricKey.slice(0, 16); // 16 premiers octets
    const decipher = crypto.createDecipheriv('aes-256-cbc', symmetricKey, iv);

    let decrypted = decipher.update(data);
    decrypted = Buffer.concat([decrypted, decipher.final()]);

    return JSON.parse(decrypted.toString());
}
```

## Gestion des abonnements

### Renouvellement automatique

Les abonnements expirent après un maximum de 3 jours. Implémentez un système de renouvellement :

```javascript
async function renewSubscription(subscriptionId) {
    const renewal = {
        expirationDateTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
    };

    try {
        await axios.patch(
            `https://graph.microsoft.com/v1.0/subscriptions/${subscriptionId}`,
            renewal,
            {
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json'
                }
            }
        );
    } catch (error) {
        console.error('Erreur renouvellement:', error.response.data);
    }
}
```

### Nettoyage des abonnements expirés

```javascript
async function cleanupExpiredSubscriptions() {
    try {
        const response = await axios.get(
            'https://graph.microsoft.com/v1.0/subscriptions',
            {
                headers: {
                    'Authorization': `Bearer ${accessToken}`
                }
            }
        );

        const expired = response.data.value.filter(sub =>
            new Date(sub.expirationDateTime) < new Date()
        );

        for (const sub of expired) {
            await axios.delete(
                `https://graph.microsoft.com/v1.0/subscriptions/${sub.id}`,
                {
                    headers: {
                        'Authorization': `Bearer ${accessToken}`
                    }
                }
            );
        }
    } catch (error) {
        console.error('Erreur nettoyage:', error.response.data);
    }
}
```

## Sécurité et bonnes pratiques

### 1. Validation des notifications

- Toujours valider le `clientState`
- Pour les notifications riches, valider les tokens JWT
- Vérifier que l'expéditeur est Microsoft Graph

### 2. Gestion des certificats

- Faire tourner régulièrement les certificats
- Stocker les clés privées de manière sécurisée (Azure Key Vault recommandé)
- Utiliser des certificats RSA 2048+ bits

### 3. Gestion des erreurs

- Implémenter une logique de retry pour les échecs temporaires
- Surveiller les quotas d'abonnement
- Gérer les notifications du cycle de vie

### 4. Performance

- Traiter les notifications de manière asynchrone
- Implémenter un système de file d'attente
- Surveiller la latence des notifications

## Exemple complet d'application

Voir le dépôt GitHub officiel Microsoft pour des exemples complets :
- [Microsoft Graph Webhooks Sample for Node.js](https://github.com/microsoftgraph/nodejs-webhooks-rest-sample)
- [Microsoft Graph Webhooks Sample for ASP.NET Core](https://github.com/microsoftgraph/aspnetcore-webhooks-sample)

## Dépannage

### Problèmes courants

1. **Erreur 400 lors de la création d'abonnement**
   - Vérifier que l'URL de notification est accessible publiquement
   - S'assurer que le certificat est correctement formaté

2. **Notifications non reçues**
   - Vérifier les autorisations de l'application
   - Contrôler que l'abonnement n'a pas expiré
   - Examiner les logs de validation du webhook

3. **Erreur de déchiffrement**
   - Vérifier l'ID du certificat
   - S'assurer que la clé privée correspond au certificat public

### Outils de débogage

- Utiliser [Microsoft Graph Explorer](https://developer.microsoft.com/en-us/graph/graph-explorer) pour tester les API
- Activer les logs détaillés dans votre application
- Surveiller les métriques de performance

## Ressources supplémentaires

- [Documentation officielle Microsoft Graph](https://docs.microsoft.com/en-us/graph/)
- [Guide des notifications de changement Teams](https://docs.microsoft.com/en-us/graph/teams-changenotifications-chatMessage)
- [Exemples de code Microsoft](https://github.com/microsoftgraph)
- [Forum de développeurs Microsoft 365](https://techcommunity.microsoft.com/t5/microsoft-365-developer-platform/bd-p/Microsoft365DeveloperPlatform)

---

**Note :** Cette documentation est basée sur les APIs Microsoft Graph v1.0. Vérifiez régulièrement les mises à jour de l'API car les spécifications peuvent évoluer.
