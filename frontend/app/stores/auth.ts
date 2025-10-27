import { defineStore } from 'pinia'
import { useCookie, useNuxtApp } from 'nuxt/app'

export interface AuthUser {
  id: number
  firstName: string
  lastName: string
  email: string
  role: 'user' | 'admin'
}

interface AuthResponse {
  token: string
  user: AuthUser
}

interface RegisterPayload {
  firstName: string
  lastName: string
  email: string
  password: string
  passwordConfirmation: string
}

interface LoginPayload {
  email: string
  password: string
}

const cookieOptions = {
  path: '/',
  sameSite: 'lax' as const,
}

const getTokenCookie = () => useCookie<string | null>('auth_token', cookieOptions)
const getUserCookie = () => useCookie<AuthUser | null>('auth_user', cookieOptions)

let initializationPromise: Promise<void> | null = null

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null as AuthUser | null,
    token: null as string | null,
    isInitialized: false,
  }),

  getters: {
    isAuthenticated: (state): boolean => !!state.token,
    isAdmin: (state): boolean => state.user?.role === 'admin',
    isReady: (state): boolean => state.isInitialized,
  },

  actions: {
    async register(payload: RegisterPayload): Promise<void> {
      try {
        const { data, error } = await useFetch<AuthResponse>('/api/auth/register', {
          method: 'POST',
          body: payload,
        })
        if (error.value) {
          const PASSWORD_REQUIREMENTS_MESSAGE =
            'Le mot de passe doit contenir au minimum 8 caractères, dont au moins un chiffre et un caractère spécial.'
          const PASSWORD_MISMATCH_MESSAGE = 'Les mots de passe ne correspondent pas.'
          const ACCOUNT_EXISTS_MESSAGE = 'Un compte existe déjà avec cette adresse e-mail.'

          const errorData = error.value.data ?? {}
          const rawValidationErrors = Array.isArray(errorData?.error)
            ? errorData.error
            : Array.isArray(errorData?.error?.errors)
              ? errorData.error.errors
              : Array.isArray(errorData?.errors)
                ? errorData.errors
                : []

          const normalisedValidationErrors = rawValidationErrors.filter((validationError: any) =>
            validationError && typeof validationError === 'object'
          )

          const hasPasswordValidationError = normalisedValidationErrors.some((validationError: any) => {
            const field = validationError?.field
            const rule = validationError?.rule
            if (typeof field !== 'string') {
              return false
            }
            return field === 'password' || rule === 'minLength'
          })

          const hasPasswordConfirmationError = normalisedValidationErrors.some((validationError: any) => {
            const field = validationError?.field
            const rule = validationError?.rule
            const message = typeof validationError?.message === 'string' ? validationError.message.toLowerCase() : ''
            if (rule === 'confirmed') {
              return true
            }
            if (typeof field === 'string' && field === 'passwordConfirmation') {
              return true
            }
            return message.includes('confirmation')
          })

          const hasExistingAccountError = normalisedValidationErrors.some((validationError: any) => {
            const field = validationError?.field
            const rule = validationError?.rule
            const message = typeof validationError?.message === 'string' ? validationError.message.toLowerCase() : ''
            if (typeof field === 'string' && field === 'email' && rule === 'unique') {
              return true
            }
            return typeof field === 'string' && field === 'email' && (message.includes('already') || message.includes('existe'))
          })

          if (hasPasswordValidationError) {
            throw new Error(PASSWORD_REQUIREMENTS_MESSAGE)
          }

          if (hasPasswordConfirmationError) {
            throw new Error(PASSWORD_MISMATCH_MESSAGE)
          }

          if (hasExistingAccountError) {
            throw new Error(ACCOUNT_EXISTS_MESSAGE)
          }

          const firstValidationMessage = normalisedValidationErrors.find((validationError: any) => typeof validationError?.message === 'string')

          throw new Error(firstValidationMessage?.message || errorData?.message || 'Erreur lors de l’inscription')
        }
        if (data.value) {
          this.setAuthData(data.value)
        }
      } catch (error: any) {
        throw new Error(error.message || 'Erreur lors de l’inscription')
      }
    },

    async login(payload: LoginPayload): Promise<void> {
      try {
        const { data, error } = await useFetch<AuthResponse>('/api/auth/login', {
          method: 'POST',
          body: payload,
        })
        if (error.value) {
          throw new Error(error.value.data?.message || 'Identifiants invalides')
        }
        if (data.value) {
          this.setAuthData(data.value)
        }
      } catch (error: any) {
        throw new Error(error.message || 'Identifiants invalides')
      }
    },

    async logout(): Promise<void> {
      try {
        await useFetch('/api/auth/logout', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${this.token}`,
          },
        })
      } finally {
        this.clearAuthData()
      }
    },

    setAuthData(response: AuthResponse): void {
      this.token = response.token
      this.user = response.user
      this.isInitialized = true
      const tokenCookie = getTokenCookie()
      const userCookie = getUserCookie()
      tokenCookie.value = this.token
      userCookie.value = this.user
    },

    clearAuthData(): void {
      this.token = null
      this.user = null
      this.isInitialized = true
      const tokenCookie = getTokenCookie()
      const userCookie = getUserCookie()
      tokenCookie.value = null
      userCookie.value = null
    },

    async initializeAuth(force = false): Promise<void> {
      if (this.isInitialized && !force) {
        return
      }

      if (initializationPromise) {
        await initializationPromise
        return
      }

      const { $fetch } = useNuxtApp()

      initializationPromise = (async () => {
        const tokenCookie = getTokenCookie()
        const userCookie = getUserCookie()

        const token = tokenCookie.value
        if (!token) {
          this.clearAuthData()
          return
        }

        this.token = token

        const cachedUser = userCookie.value
        if (cachedUser && !force) {
          this.user = cachedUser
          return
        }

        if (!import.meta.client) {
          return
        }

        try {
          const user = await $fetch<AuthUser>('/api/auth/me', {
            method: 'GET',
            headers: {
              Authorization: `Bearer ${token}`,
            },
          })
          this.user = user
          userCookie.value = user
        } catch (error) {
          this.clearAuthData()
        }
      })()

      try {
        await initializationPromise
      } finally {
        initializationPromise = null
        this.isInitialized = true
      }
    },
  },
})
