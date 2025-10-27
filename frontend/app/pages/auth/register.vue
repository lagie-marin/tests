<script setup lang="ts">
import type { FormSubmitEvent } from '@nuxt/ui'
import { computed, ref } from 'vue'
import { useAuthStore } from '~/stores/auth'
import { omit } from '#ui/utils'

definePageMeta({
  layout: 'auth',
})

useSeoMeta({
  title: 'Sign up',
})

const toast = useToast()
const authStore = useAuthStore()
const appConfig = useAppConfig()

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

interface RegisterForm {
  firstName: string
  lastName: string
  email: string
  password: string
  passwordConfirmation: string
}

const fields = [
  {
    name: 'firstName',
    type: 'text' as const,
    label: 'Prénom',
    placeholder: 'Entrez votre prénom',
    required: true,
  },
  {
    name: 'lastName',
    type: 'text' as const,
    label: 'Nom',
    placeholder: 'Entrez votre nom',
    required: true,
  },
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
  {
    name: 'passwordConfirmation',
    label: 'Confirmation du mot de passe',
    type: 'password' as const,
    placeholder: 'Confirmez votre mot de passe',
    required: true,
  },
  {
    name: 'terms',
    label: "J'ai lu et j'accepte les Conditions d'utilisation",
    type: 'checkbox' as const,
    required: true,
  },
  {
    name: 'marketingConsent',
    label: 'Je souhaite recevoir les nouveautés de la plateforme et des conseils pour mieux gérer mon argent',
    type: 'checkbox' as const,
  },
]

const providers = [
  // {
  //   label: 'Google',
  //   icon: 'i-simple-icons-google',
  //   onClick: () => {
  //     authStore.googleLogin()
  //   },
  // }
]

const error = ref<string>('')

const onSubmit = async (event: FormSubmitEvent<RegisterForm>) => {
  try {
    const payload = {
      firstName: event.data.firstName,
      lastName: event.data.lastName,
      email: event.data.email,
      password: event.data.password,
      passwordConfirmation: event.data.passwordConfirmation,
      marketingConsent: event.data.marketingConsent || false,
    }
    await authStore.register(payload)
    error.value = ''
    toast.add({ title: 'Succès', description: 'Inscription réussie !' })
    navigateTo('/')
  } catch (err: any) {
    error.value = err.message || 'Erreur lors de l’inscription'
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
    title="Créer un compte"
    :submit="{ label: 'Créer un compte' }"
    separator="ou"
    icon="i-lucide-user-plus"
    @submit="onSubmit"
  >
    <template #description>
      Déjà un compte ? <ULink to="/auth/login" class="text-primary-500 font-medium">Se connecter</ULink>.
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

    <template #terms-field="{ state, field }">
      <UCheckbox v-if="field.type === 'checkbox'" v-model="state[field.name]" v-bind="omit(field, ['description', 'help', 'hint', 'size'])">
        <template #label>
          <span>J'ai lu et j'accepte les <UButton to="/terms" target="_blank" variant="link" :ui="{ 'base': 'px-0' }">Conditions d'utilisation</UButton></span>
        </template>
      </UCheckbox>
    </template>

    <template #error v-if="error">
      <p class="text-red-500">{{ error }}</p>
    </template>
  </UAuthForm>
</template>
