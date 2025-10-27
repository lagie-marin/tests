export const SOCIAL_PROVIDERS = [
  {
    id: 'github',
    displayName: 'GitHub',
    driver: 'github',
    icon: 'i-simple-icons-github',
  },
  {
    id: 'google',
    displayName: 'Google',
    driver: 'google',
    icon: 'i-simple-icons-google',
  },
  {
    id: 'facebook',
    displayName: 'Facebook',
    driver: 'facebook',
    icon: 'i-simple-icons-facebook',
  },
  {
    id: 'twitter',
    displayName: 'Twitter / X',
    driver: 'twitter',
    icon: 'i-simple-icons-x',
  },
  {
    id: 'discord',
    displayName: 'Discord',
    driver: 'discord',
    icon: 'i-simple-icons-discord',
  },
  {
    id: 'linkedin',
    displayName: 'LinkedIn',
    driver: 'linkedinOpenidConnect',
    icon: 'i-simple-icons-linkedin',
  },
  {
    id: 'spotify',
    displayName: 'Spotify',
    driver: 'spotify',
    icon: 'i-simple-icons-spotify',
  },
] as const

export type SocialProvider = (typeof SOCIAL_PROVIDERS)[number]['id']

const SOCIAL_PROVIDER_IDS = new Set<string>(SOCIAL_PROVIDERS.map((provider) => provider.id))

export function isSocialProvider(value: string): value is SocialProvider {
  return SOCIAL_PROVIDER_IDS.has(value)
}

export function assertSocialProvider(value: string): SocialProvider {
  if (!isSocialProvider(value)) {
    throw new Error(`Unsupported social provider "${value}"`)
  }

  return value
}

export function getSocialProviderConfig(provider: SocialProvider) {
  return SOCIAL_PROVIDERS.find((item) => item.id === provider)
}
