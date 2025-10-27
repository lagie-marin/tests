import { defineNuxtPlugin } from 'nuxt/app'
import { useAuthStore } from '~/stores/auth'

export default defineNuxtPlugin(() => {
  const authStore = useAuthStore()
  if (!authStore.isReady) {
    authStore.initializeAuth().catch((error) => {
      console.error('Failed to initialise auth store', error)
    })
  }
})
