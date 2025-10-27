import env from '#start/env'
import { defineConfig, services, InferSocialProviders } from '@adonisjs/ally'

const appUrl = env.get('APP_URL')

const allyConfig = defineConfig({
  discord: services.discord({
    clientId: env.get('DISCORD_CLIENT_ID'),
    clientSecret: env.get('DISCORD_CLIENT_SECRET'),
    callbackUrl: new URL('/api/auth/social/discord/callback', appUrl).toString(),
    scopes: ['identify', 'email', 'guilds'],
  }),
  facebook: services.facebook({
    clientId: env.get('FACEBOOK_CLIENT_ID'),
    clientSecret: env.get('FACEBOOK_CLIENT_SECRET'),
    callbackUrl: new URL('/api/auth/social/facebook/callback', appUrl).toString(),
  }),
  github: services.github({
    clientId: env.get('GITHUB_CLIENT_ID'),
    clientSecret: env.get('GITHUB_CLIENT_SECRET'),
    callbackUrl: new URL('/api/auth/social/github/callback', appUrl).toString(),
    scopes: [
      'repo',
      'repo:status',
      'repo_deployment',
      'public_repo',
      'repo:invite',
      'security_events',
      'admin:repo_hook',
      'write:repo_hook',
      'read:repo_hook',
      'admin:org',
      'write:org',
      'read:org',
      'admin:public_key',
      'write:public_key',
      'read:public_key',
      'admin:org_hook',
      'gist',
      'notifications',
      'user',
      'read:user',
      'user:email',
      'user:follow',
      'delete_repo',
      'write:discussion',
      'read:discussion',
      'write:packages',
      'read:packages',
      'delete:packages',
      'admin:gpg_key',
      'write:gpg_key',
      'read:gpg_key',
      'workflow',
    ],
  }),
  google: services.google({
    clientId: env.get('GOOGLE_CLIENT_ID'),
    clientSecret: env.get('GOOGLE_CLIENT_SECRET'),
    callbackUrl: new URL('/api/auth/social/google/callback', appUrl).toString(),
  }),
  linkedinOpenidConnect: services.linkedinOpenidConnect({
    clientId: env.get('LINKEDINOPENIDCONNECT_CLIENT_ID'),
    clientSecret: env.get('LINKEDINOPENIDCONNECT_CLIENT_SECRET'),
    callbackUrl: new URL('/api/auth/social/linkedin/callback', appUrl).toString(),
  }),
  spotify: services.spotify({
    clientId: env.get('SPOTIFY_CLIENT_ID'),
    clientSecret: env.get('SPOTIFY_CLIENT_SECRET'),
    callbackUrl: new URL('/api/auth/social/spotify/callback', appUrl).toString(),
    scopes: [
      'ugc-image-upload',
      'user-read-recently-played',
      'user-top-read',
      'user-read-playback-position',
      'user-read-playback-state',
      'user-modify-playback-state',
      'user-read-currently-playing',
      'app-remote-control',
      'streaming',
      'playlist-modify-public',
      'playlist-modify-private',
      'playlist-read-private',
      'playlist-read-collaborative',
      'user-follow-modify',
      'user-follow-read',
      'user-library-modify',
      'user-library-read',
      'user-read-email',
      'user-read-private',
    ],
  }),
  twitter: services.twitter({
    clientId: env.get('TWITTER_CLIENT_ID'),
    clientSecret: env.get('TWITTER_CLIENT_SECRET'),
    callbackUrl: new URL('/api/auth/social/twitter/callback', appUrl).toString(),
  }),
})

export default allyConfig

declare module '@adonisjs/ally/types' {
  interface SocialProviders extends InferSocialProviders<typeof allyConfig> {}
}
