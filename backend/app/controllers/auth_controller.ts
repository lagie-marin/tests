import type { HttpContext } from '@adonisjs/core/http'
import User from '#models/user'
import { loginValidator, registerValidator } from '#validators/auth'

export default class AuthController {
  async register({ request, response }: HttpContext) {
    try {
      const data = await request.validateUsing(registerValidator)

      const user = await User.create({
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        password: data.password,
        marketingConsent: data.marketingConsent || false,
        role: 'user',
      })

      const token = await User.accessTokens.create(user)

      return response.created({
        token: token.value!.release(),
        user: {
          id: user.id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          role: user.role,
        },
      })
    } catch (error) {
      return response.badRequest({
        message: 'Erreur lors de l’inscription',
        error: error.messages || error.message,
      })
    }
  }

  async login({ request, response }: HttpContext) {
    try {
      const data = await request.validateUsing(loginValidator)

      const user = await User.verifyCredentials(data.email, data.password)
      const token = await User.accessTokens.create(user)

      return response.ok({
        token: token.value!.release(),
        user: {
          id: user.id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          role: user.role,
        },
      })
    } catch (error) {
      return response.unauthorized({ message: 'Identifiants invalides' })
    }
  }

  async me({ auth, response }: HttpContext) {
    const user = auth.getUserOrFail()
    return response.ok({
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      marketingConsent: user.marketingConsent,
      role: user.role,
      createdAt: user.createdAt?.toISO(),
      updatedAt: user.updatedAt?.toISO(),
    })
  }

  async logout({ auth, response }: HttpContext) {
    const user = auth.getUserOrFail()
    await User.accessTokens.delete(user, user.currentAccessToken!.identifier)
    return response.ok({ message: 'Déconnexion réussie' })
  }
}
