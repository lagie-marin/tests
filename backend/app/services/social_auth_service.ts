import { DateTime } from 'luxon'
import type { AllyDriverContract, AllyUserContract } from '@adonisjs/ally/types'
import SocialAccount from '#models/social_account'
import User from '#models/user'
import { SocialProvider } from '#constants/social_providers'

export interface SocialProfile {
  providerAccountId: string
  email: string | null
  name: string | null
  nickname: string | null
  avatarUrl: string | null
  profileUrl: string | null
  accessToken: string | null
  refreshToken: string | null
  tokenType: string | null
  tokenExpiresAt: DateTime | null
  scopes: string[] | null
  raw: Record<string, any> | null
}

export default class SocialAuthService {
  static async getSocialProfile(driver: AllyDriverContract<any, any>): Promise<SocialProfile> {
    const socialUser = await driver.user()
    return SocialAuthService.mapAllyUser(socialUser)
  }

  static async linkSocialAccount(user: User, provider: SocialProvider, profile: SocialProfile) {
    let account = await SocialAccount.findBy({ provider, providerAccountId: profile.providerAccountId })

    if (account && account.userId !== user.id) {
      throw new Error('Ce compte est déjà lié à un autre utilisateur.')
    }

    if (!account) {
      account = new SocialAccount()
      account.provider = provider
      account.providerAccountId = profile.providerAccountId
      account.userId = user.id
    }

    account.username = profile.nickname
    account.displayName = profile.name
    account.email = profile.email
    account.avatarUrl = profile.avatarUrl
    account.profileUrl = profile.profileUrl
    account.accessToken = profile.accessToken
    account.refreshToken = profile.refreshToken
    account.tokenType = profile.tokenType
    account.tokenExpiresAt = profile.tokenExpiresAt
    account.scopes = profile.scopes
    account.metadata = profile.raw

    await account.save()

    return account
  }

  static async findOrCreateUser(provider: SocialProvider, profile: SocialProfile) {
    let account = await SocialAccount.findBy({ provider, providerAccountId: profile.providerAccountId })

    if (account) {
      const user = await account.related('user').query().firstOrFail()
      await this.updateAccountTokens(account, profile)
      return { user, account, createdUser: false }
    }

    if (!profile.email) {
      throw new Error('Impossible de récupérer un e-mail pour ce compte externe.')
    }

    let user = await User.findBy('email', profile.email)
    let createdUser = false

    if (!user) {
      const { firstName, lastName } = this.resolveNames(profile)
      user = await User.create({
        firstName,
        lastName,
        email: profile.email,
        password: null,
        marketingConsent: false,
        role: 'user',
      })
      createdUser = true
    }

    const newAccount = await this.linkSocialAccount(user, provider, profile)
    return { user, account: newAccount, createdUser }
  }

  private static async updateAccountTokens(account: SocialAccount, profile: SocialProfile) {
    account.accessToken = profile.accessToken
    account.refreshToken = profile.refreshToken
    account.tokenType = profile.tokenType
    account.tokenExpiresAt = profile.tokenExpiresAt
    account.scopes = profile.scopes
    account.metadata = profile.raw
    await account.save()
  }

  private static resolveNames(profile: SocialProfile) {
    const fallbackNickname = profile.nickname || 'Utilisateur'
    const normalizedName = profile.name?.trim()

    if (normalizedName) {
      const parts = normalizedName.split(/\s+/)
      const firstName = parts.shift() || fallbackNickname
      const lastName = parts.length > 0 ? parts.join(' ') : fallbackNickname
      return { firstName, lastName }
    }

    return {
      firstName: fallbackNickname,
      lastName: 'Externe',
    }
  }

  private static mapAllyUser(socialUser: AllyUserContract<any>): SocialProfile {
    const token = socialUser.token as any
    const scopes =
      token && typeof (token as any).scope === 'string'
        ? (token as any).scope
            .split(/[,\s]+/)
            .map((scope: string) => scope.trim())
            .filter((scope: string) => scope.length > 0)
        : null

    let tokenExpiresAt: DateTime | null = null
    if (token?.expiresAt instanceof Date) {
      tokenExpiresAt = DateTime.fromJSDate(token.expiresAt)
    } else if (typeof token?.expiresAt === 'string') {
      tokenExpiresAt = DateTime.fromISO(token.expiresAt)
    }

    const refreshToken = token?.refreshToken ?? null
    const tokenType = token?.type ?? null

    const profileUrl =
      socialUser.original?.html_url ||
      socialUser.original?.profile ||
      socialUser.original?.link ||
      socialUser.original?.url ||
      null

    return {
      providerAccountId: socialUser.id,
      email: socialUser.email,
      name: socialUser.name || null,
      nickname: socialUser.nickName || null,
      avatarUrl: socialUser.avatarUrl || null,
      profileUrl,
      accessToken: token ? token.token ?? null : null,
      refreshToken,
      tokenType,
      tokenExpiresAt,
      scopes,
      raw: socialUser.original ?? null,
    }
  }
}
