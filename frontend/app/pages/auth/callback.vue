<script setup lang="ts">
import { useAuthStore } from '~/stores/auth'

const toast = useToast()
const authStore = useAuthStore()

if (import.meta.server) {
  try {
    authStore.handleGoogleCallback()
  } catch (err: any) {
    toast.add({
      title: 'Erreur',
      description: 'Erreur lors de la connexion',
      color: 'error',
    })
    navigateTo('/auth/register')
  }
} else {
  if (authStore.isAuthenticated) {
    localStorage.setItem('auth_token', authStore.token!)
    toast.add({ title: 'Succès', description: 'Connexion réussie !' })
    navigateTo('/')
  } else {
    toast.add({
      title: 'Erreur',
      description: 'Erreur lors de la connexion',
      color: 'error',
    })
    navigateTo('/auth/register')
  }
}
</script>

<template>
  <div class="flex flex-col items-center justify-center gap-6 h-screen">
    <UIcon name="i-heroicons-arrow-path" class="animate-spin text-primary-500 w-16 h-16" />
    <h1 class="font-bold">Connexion en cours...</h1>
  </div>
</template>
