import type { HttpContext } from '@adonisjs/core/http'
import { SOCIAL_PROVIDERS, assertSocialProvider } from '#constants/social_providers'
import SocialAccount from '#models/social_account'

export default class SocialAccountsController {
  async index({ auth }: HttpContext) {
    const user = await auth.use('api').authenticate()
    await user.load('socialAccounts')

    const providers = SOCIAL_PROVIDERS.map((provider) => {
      const account = user.socialAccounts.find((item) => item.provider === provider.id)

      return {
        id: provider.id,
        displayName: provider.displayName,
        icon: provider.icon,
        connected: Boolean(account),
        account: account
          ? {
              username: account.username,
              displayName: account.displayName,
              email: account.email,
              avatarUrl: account.avatarUrl,
              profileUrl: account.profileUrl,
              scopes: account.scopes,
              connectedAt: account.createdAt.toISO(),
              updatedAt: account.updatedAt?.toISO() ?? null,
            }
          : null,
      }
    })

    return {
      providers,
    }
  }

  async destroy({ auth, params, response }: HttpContext) {
    let provider
    try {
      provider = assertSocialProvider(params.provider)
    } catch {
      return response.badRequest({ message: 'Fournisseur inconnu.' })
    }

    const user = await auth.use('api').authenticate()

    const account = await SocialAccount.query()
      .where('user_id', user.id)
      .andWhere('provider', provider)
      .first()

    if (!account) {
      return response.notFound({ message: 'Compte externe non lié.' })
    }

    await account.delete()

    return response.noContent()
  }
}
