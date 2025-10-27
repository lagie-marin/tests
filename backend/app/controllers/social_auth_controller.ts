import type { HttpContext } from '@adonisjs/core/http'
import env from '#start/env'
import { assertSocialProvider, getSocialProviderConfig } from '#constants/social_providers'
import SocialStateService, { type SocialStatePurpose } from '#services/social_state_service'
import SocialAuthService from '#services/social_auth_service'
import User from '#models/user'

function resolveRedirectPath(
  purpose: SocialStatePurpose,
  requestedPath?: string | null
): string {
  const defaultPath = purpose === 'connect' ? '/app/services' : '/auth/social-callback'
  if (!requestedPath) {
    return defaultPath
  }

  if (!requestedPath.startsWith('/')) {
    return defaultPath
  }

  return requestedPath
}

function buildFrontendUrl(path: string, query?: Record<string, string | null | undefined>) {
  const url = new URL(path, env.get('FRONTEND_URL'))
  if (query) {
    Object.entries(query).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        url.searchParams.set(key, value)
      }
    })
  }
  return url.toString()
}

function ensurePurpose(value: any): SocialStatePurpose {
  return value === 'connect' ? 'connect' : 'login'
}

export default class SocialAuthController {
  async redirect({ ally, params, request, response, auth }: HttpContext) {
    let provider
    try {
      provider = assertSocialProvider(params.provider)
    } catch {
      return response.badRequest({ message: 'Fournisseur inconnu.' })
    }
    const purpose = ensurePurpose(request.input('purpose', 'login'))
    const redirectPath = resolveRedirectPath(purpose, request.input('redirect_path'))

    let userId: number | undefined
    if (purpose === 'connect') {
      try {
        const user = await auth.use('api').authenticate()
        userId = user.id
      } catch {
        return response.unauthorized({ message: 'Authentification requise pour lier un compte.' })
      }
    }

    const driverConfig = getSocialProviderConfig(provider)
    if (!driverConfig) {
      return response.badRequest({ message: 'Fournisseur inconnu.' })
    }

    const state = SocialStateService.create({
      provider,
      purpose,
      redirectPath,
      userId,
    })

    const driver = ally.use(driverConfig.driver).stateless()

    const redirectUrl = await driver.redirectUrl((redirectRequest) => {
      redirectRequest.param('state', state)
    })

    if (request.accepts(['json', 'html']) === 'json') {
      return response.ok({ redirectUrl })
    }

    return response.redirect().status(302).url(redirectUrl)
  }

  async callback({ ally, params, request, response }: HttpContext) {
    let provider
    try {
      provider = assertSocialProvider(params.provider)
    } catch {
      return response.badRequest({ message: 'Fournisseur inconnu.' })
    }
    const driverConfig = getSocialProviderConfig(provider)
    if (!driverConfig) {
      return response.badRequest({ message: 'Fournisseur inconnu.' })
    }

    const driver = ally.use(driverConfig.driver).stateless()

    const defaultErrorRedirect = buildFrontendUrl('/app/services', {
      provider,
      status: 'error',
      reason: 'unexpected',
    })

    if (driver.accessDenied()) {
      return response.redirect(
        buildFrontendUrl('/app/services', {
          provider,
          status: 'error',
          reason: 'access_denied',
        })
      )
    }

    if (driver.hasError()) {
      return response.redirect(
        buildFrontendUrl('/app/services', {
          provider,
          status: 'error',
          reason: driver.getError() ?? 'unknown_error',
        })
      )
    }

    const stateParam = request.input('state')
    if (!stateParam) {
      return response.redirect(defaultErrorRedirect)
    }

    let state: ReturnType<typeof SocialStateService.verify>
    try {
      state = SocialStateService.verify(stateParam)
    } catch (error) {
      return response.redirect(
        buildFrontendUrl('/app/services', {
          provider,
          status: 'error',
          reason: error instanceof Error ? error.message : 'invalid_state',
        })
      )
    }

    if (state.provider !== provider) {
      return response.redirect(defaultErrorRedirect)
    }

    try {
      const profile = await SocialAuthService.getSocialProfile(driver)

      if (state.purpose === 'connect') {
        if (!state.userId) {
          throw new Error('Utilisateur introuvable pour la liaison du compte.')
        }

        const user = await User.find(state.userId)
        if (!user) {
          throw new Error('Utilisateur introuvable.')
        }

        await SocialAuthService.linkSocialAccount(user, provider, profile)

        return response.redirect(
          buildFrontendUrl(state.redirectPath, {
            provider,
            status: 'connected',
          })
        )
      }

      const { user, createdUser } = await SocialAuthService.findOrCreateUser(provider, profile)
      const token = await User.accessTokens.create(user)

      return response.redirect(
        buildFrontendUrl(state.redirectPath, {
          provider,
          status: 'authenticated',
          token: token.value?.release() ?? null,
          created: createdUser ? 'true' : 'false',
        })
      )
    } catch (error) {
      const reason =
        error instanceof Error && error.message ? error.message.replace(/\s+/g, '_').toLowerCase() : 'unknown'

      return response.redirect(
        buildFrontendUrl(state.redirectPath, {
          provider,
          status: 'error',
          reason,
        })
      )
    }
  }
}
