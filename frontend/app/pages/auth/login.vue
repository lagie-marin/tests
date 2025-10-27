<script setup lang="ts">
import type { FormSubmitEvent } from '@nuxt/ui'
import { useAuthStore } from '~/stores/auth'

definePageMeta({
  layout: 'auth',
})

useSeoMeta({
  title: 'Connexion'
})

const toast = useToast()
const authStore = useAuthStore()

interface LoginForm {
  email: string
  password: string
  remember?: boolean
}

const fields = [
  {
    name: 'email',
    type: 'text' as const,
    label: 'Email',
    placeholder: 'Entrez votre email',
    required: true,
  },
  {
    name: 'password',
    label: 'Mot de passe',
    type: 'password' as const,
    placeholder: 'Entrez votre mot de passe',
    required: true,
  },
]

const providers = [
  // {
  //   label: 'Google',
  //   icon: 'i-simple-icons-google',
  //   onClick: () => {
  //     authStore.googleLogin()
  //   },
  // },
]

const error = ref<string>('')

const onSubmit = async (event: FormSubmitEvent<LoginForm>) => {
  try {
    const payload = {
      email: event.data.email,
      password: event.data.password,
    }
    await authStore.login(payload)
    error.value = ''
    toast.add({ title: 'Succès', description: 'Connexion réussie !' })
    navigateTo('/')
  } catch (err: any) {
    error.value = err.message || 'Erreur lors de la connexion'
    toast.add({
      title: 'Erreur',
      description: error.value,
      color: 'error',
    })
  }
}
</script>

<template>
  <UAuthForm
    :fields="fields"
    :providers="providers"
    title="Se connecter"
    icon="i-lucide-lock"
    :submit-button="{ label: 'Se connecter' }"
    @submit="onSubmit"
  >
    <template #description>
      Pas de compte ? <ULink to="/auth/register" class="text-primary-500 font-medium">S’inscrire</ULink>.
    </template>

    <template #password-hint>
      <ULink to="/auth/reset-password" class="text-primary-500 font-medium">Mot de passe oublié ?</ULink>
    </template>

    <template #footer>
      En vous connectant, vous acceptez nos <ULink to="/terms" target="_blank" class="text-primary-500 font-medium"
    >Conditions d’utilisation</ULink
    >.
    </template>

    <template #error v-if="error">
      <p class="text-red-500">{{ error }}</p>
    </template>
  </UAuthForm>
</template>
