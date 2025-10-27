import { DateTime } from 'luxon'
import encryption from '@adonisjs/core/services/encryption'
import { SocialProvider } from '#constants/social_providers'

const STATE_TTL_SECONDS = 10 * 60

export type SocialStatePurpose = 'login' | 'connect'

export interface SocialStatePayload {
  provider: SocialProvider
  purpose: SocialStatePurpose
  redirectPath: string
  userId?: number
  issuedAt: number
}

export default class SocialStateService {
  static create(payload: Omit<SocialStatePayload, 'issuedAt'>) {
    const data: SocialStatePayload = {
      ...payload,
      issuedAt: DateTime.utc().toSeconds(),
    }

    const encrypted = encryption.encrypt(data)
    if (!encrypted) {
      throw new Error('Unable to sign social auth state')
    }

    return encrypted
  }

  static verify(state: string): SocialStatePayload {
    const payload = encryption.decrypt<SocialStatePayload>(state)
    if (!payload) {
      throw new Error('Invalid social auth state')
    }

    const now = DateTime.utc().toSeconds()
    if (now - payload.issuedAt > STATE_TTL_SECONDS) {
      throw new Error('Expired social auth state')
    }

    if (!payload.redirectPath.startsWith('/')) {
      throw new Error('Invalid redirect path in social auth state')
    }

    return payload
  }
}
