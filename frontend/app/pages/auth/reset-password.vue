<script setup lang="ts">
import type { FormSubmitEvent } from '@nuxt/ui'
import { omit } from '#ui/utils'

definePageMeta({
  layout: 'auth',
})

useSeoMeta({
  title: 'Réinitialiser le mot de passe',
})

interface ResetPasswordForm {
  password: string
  passwordConfirmation: string
}

interface ForgotPasswordForm {
  email: string
}

const route = useRoute()
const toast = useToast()
const appConfig = useAppConfig()

const token = computed(() => {
  const tokenParam = route.query.token
  return typeof tokenParam === 'string' ? tokenParam.trim() : ''
})

const email = computed(() => {
  const emailParam = route.query.email
  return typeof emailParam === 'string' ? emailParam.trim() : ''
})

const hasValidParams = computed(() => Boolean(token.value && email.value))
const fromInvalidLink = computed(() => {
  const rawToken = route.query.token
  const rawEmail = route.query.email
  const hasAnyParam =
    (typeof rawToken === 'string' && rawToken.trim().length > 0) ||
    (typeof rawEmail === 'string' && rawEmail.trim().length > 0)

  return hasAnyParam && !hasValidParams.value
})

const resetFields = [
  {
    name: 'password',
    label: 'Nouveau mot de passe',
    type: 'password' as const,
    placeholder: 'Entrez votre nouveau mot de passe',
    required: true,
  },
  {
    name: 'passwordConfirmation',
    label: 'Confirmez le mot de passe',
    type: 'password' as const,
    placeholder: 'Confirmez votre nouveau mot de passe',
    required: true,
  },
]

const forgotFields = [
  {
    name: 'email',
    type: 'text' as const,
    label: 'Adresse e-mail',
    placeholder: 'Entrez votre adresse e-mail',
    required: true,
  },
]

const resetError = ref('')
const forgotError = ref('')
const isSubmittingReset = ref(false)
const isSubmittingForgot = ref(false)
const forgotRequestCompleted = ref(false)
const passwordValue = ref('')
const passwordTouched = ref(false)
const passwordVisible = ref(false)

const PASSWORD_RULE_DEFINITIONS = [
  {
    id: 'length',
    label: 'Minimum 8 caractères',
    validate: (password: string) => password.length >= 8,
  },
  {
    id: 'number',
    label: 'Inclure au moins un chiffre',
    validate: (password: string) => /\d/.test(password),
  },
  {
    id: 'special',
    label: 'Inclure au moins un caractère spécial',
    validate: (password: string) => /[^A-Za-z0-9]/.test(password),
  },
] as const

const passwordRules = computed(() =>
  PASSWORD_RULE_DEFINITIONS.map((rule) => ({
    id: rule.id,
    label: rule.label,
    met: rule.validate(passwordValue.value),
  }))
)

const missingPasswordRules = computed(() => passwordRules.value.filter((rule) => !rule.met))

const onSubmit = async (event: FormSubmitEvent<ResetPasswordForm>) => {
  resetError.value = ''

  if (!hasValidParams.value) {
    resetError.value = 'Le lien de réinitialisation est invalide ou incomplet.'
    return
  }

  if (event.data.password !== event.data.passwordConfirmation) {
    resetError.value = 'Les mots de passe ne correspondent pas.'
    return
  }

  isSubmittingReset.value = true

  try {
    await $fetch('/api/auth/reset-password', {
      method: 'POST',
      body: {
        email: email.value,
        token: token.value,
        password: event.data.password,
        passwordConfirmation: event.data.passwordConfirmation,
      },
    })

    resetError.value = ''

    toast.add({
      title: 'Mot de passe mis à jour',
      description: 'Vous pouvez maintenant vous connecter avec votre nouveau mot de passe.',
    })

    await navigateTo('/auth/login')
  } catch (err: any) {
    const message =
      typeof err?.data?.message === 'string'
        ? err.data.message
        : typeof err?.message === 'string'
          ? err.message
          : 'Erreur lors de la réinitialisation du mot de passe.'

    resetError.value = message

    toast.add({
      title: 'Erreur',
      description: message,
      color: 'error',
    })
  } finally {
    isSubmittingReset.value = false
  }
}

const onForgotSubmit = async (event: FormSubmitEvent<ForgotPasswordForm>) => {
  forgotError.value = ''
  forgotRequestCompleted.value = false

  isSubmittingForgot.value = true

  try {
    await $fetch('/api/auth/forgot-password', {
      method: 'POST',
      body: {
        email: event.data.email,
      },
    })

    toast.add({
      title: 'E-mail envoyé',
      description: 'Si un compte existe, vous recevrez un message avec la marche à suivre.',
    })

    forgotRequestCompleted.value = true
  } catch (err: any) {
    const message =
      typeof err?.data?.message === 'string'
        ? err.data.message
        : typeof err?.message === 'string'
          ? err.message
          : 'Impossible d’envoyer l’e-mail de réinitialisation.'

    forgotError.value = message

    toast.add({
      title: 'Erreur',
      description: message,
      color: 'error',
    })
  } finally {
    isSubmittingForgot.value = false
  }
}
</script>

<template>
  <UAuthForm
    v-if="hasValidParams"
    :fields="resetFields"
    title="Réinitialiser le mot de passe"
    icon="i-lucide-rotate-ccw"
    :submit-button="{ label: 'Mettre à jour le mot de passe', loading: isSubmittingReset }"
    @submit="onSubmit"
  >
    <template #description>
      Choisissez un nouveau mot de passe pour <strong>{{ email }}</strong>.
    </template>

    <template #footer>
      Une fois le mot de passe mis à jour, vous serez redirigé vers la page de connexion.
    </template>

    <template #error v-if="resetError">
      <p class="text-red-500">{{ resetError }}</p>
    </template>

    <template
      #password-field="{ state, field }"
    >
      <div class="space-y-2">
        <UInput
          v-model="state[field.name]"
          :type="passwordVisible ? 'text' : 'password'"
          v-bind="omit(field, ['label', 'description', 'help', 'hint', 'size', 'type', 'required', 'defaultValue'])"
          :ui="{ root: 'w-full' }"
          @focus="passwordTouched = true"
          @update:model-value="(value) => {
            passwordTouched = true
            passwordValue = value || ''
          }"
        >
          <template #trailing>
            <UButton
              type="button"
              color="neutral"
              variant="link"
              size="sm"
              :icon="passwordVisible ? appConfig.ui.icons.eyeOff : appConfig.ui.icons.eye"
              :aria-pressed="passwordVisible"
              :aria-label="passwordVisible ? 'Masquer le mot de passe' : 'Afficher le mot de passe'"
              @click="passwordVisible = !passwordVisible"
            />
          </template>
        </UInput>

        <div
          v-if="passwordTouched && missingPasswordRules.length"
          class="flex flex-wrap gap-2 text-sm"
        >
          <UBadge
            v-for="rule in missingPasswordRules"
            :key="rule.id"
            color="error"
            variant="soft"
          >
            {{ rule.label }}
          </UBadge>
        </div>
      </div>
    </template>
  </UAuthForm>

  <div v-else class="space-y-4">
    <UAlert
      v-if="fromInvalidLink"
      title="Le lien de réinitialisation est incomplet ou a expiré. Vous pouvez relancer la procédure ci-dessous."
      color="error"
      variant="soft"
      icon="i-lucide-alert-triangle"
    />

    <UAuthForm
      :fields="forgotFields"
      title="Mot de passe oublié"
      icon="i-lucide-mail-question"
      :submit-button="{ label: 'Envoyer le lien de réinitialisation', loading: isSubmittingForgot }"
      @submit="onForgotSubmit"
    >
      <template #description>
        Entrez votre adresse e-mail et, si un compte existe, vous recevrez un lien pour réinitialiser votre mot de passe.
      </template>

      <template #footer>
        Vous vous souvenez de votre mot de passe ? <ULink to="/auth/login" class="text-primary-500 font-medium">Retour à la connexion</ULink>.
      </template>

      <template #error v-if="forgotError">
        <p class="text-red-500">{{ forgotError }}</p>
      </template>
    </UAuthForm>

    <UAlert
      v-if="forgotRequestCompleted"
      title="Un message a été envoyé si l’adresse est connue. Pensez à vérifier votre dossier spam."
      color="primary"
      variant="soft"
      icon="i-lucide-info"
    />
  </div>
</template>
