<script setup lang="ts">
import { useAuthStore } from '~/stores/auth'

definePageMeta({
  layout: 'app',
})

interface SocialAccountSummary {
  username: string | null
  displayName: string | null
  email: string | null
  avatarUrl: string | null
  profileUrl: string | null
  scopes: string[] | null
  connectedAt: string | null
  updatedAt: string | null
}

interface SocialProviderEntry {
  id: string
  displayName: string
  icon: string
  connected: boolean
  account: SocialAccountSummary | null
}

const authStore = useAuthStore()
const router = useRouter()
const route = useRoute()
const toast = useToast()

const providers = ref<SocialProviderEntry[]>([])
const isLoading = ref(false)
const hasLoadedOnce = ref(false)
const connectingProvider = ref<string | null>(null)
const disconnectingProvider = ref<string | null>(null)
const sessionWarningShown = ref(false)
const visibleProviders = computed(() =>
  providers.value.filter((provider) => Boolean(providerCopy[provider.id]))
)
const connectionStats = computed(() => {
  const currentProviders = visibleProviders.value
  const total = currentProviders.length
  const connected = currentProviders.filter((provider) => provider.connected).length
  const ratio = total === 0 ? 0 : Math.round((connected / total) * 100)

  return {
    connected,
    total,
    ratio,
  }
})

const providerCopy: Record<string, { title: string; description: string; icon: string }> = {
  discord: {
    title: 'Discord',
    description: 'Connectez votre compte Discord pour gérer vos serveurs et canaux.',
    icon: 'i-logos-discord-icon',
  },
  github: {
    title: 'GitHub',
    description: 'Connectez votre compte GitHub pour synchroniser vos projets et dépôts.',
    icon: 'i-logos-github-icon',
  },
  spotify: {
    title: 'Spotify',
    description: 'Reliez votre compte Spotify pour automatiser vos playlists et activités musicales.',
    icon: 'i-simple-icons-spotify',
  },
    google: {
        title: 'Google',
        description: 'Connectez votre compte Google pour accéder à vos services Google Workspace.',
        icon: 'i-logos-google-icon',
    },
}

const providerUi: Record<string, { leadingIcon?: string }> = {
  github: {
    leadingIcon: 'dark:invert',
  },
}

const ensureAuthenticated = async (): Promise<boolean> => {
  if (!authStore.token) {
    await authStore.initializeAuth()
  }

  if (!authStore.token) {
    if (!sessionWarningShown.value) {
      sessionWarningShown.value = true
      toast.add({
        title: 'Session requise',
        description: 'Veuillez vous reconnecter pour gérer vos intégrations.',
        color: 'warning',
      })
    }
    return false
  }

  return true
}

const loadProviders = async () => {
  if (!hasLoadedOnce.value) {
    isLoading.value = true
  }

  if (!(await ensureAuthenticated())) {
    isLoading.value = false
    hasLoadedOnce.value = true
    return
  }

  try {
    const response = await $fetch<{ providers: SocialProviderEntry[] }>('/api/auth/social/providers', {
      headers: {
        Authorization: `Bearer ${authStore.token}`,
      },
    })

    providers.value = response.providers
  } catch (error: any) {
    const message = error?.data?.message || error?.message || 'Impossible de récupérer vos intégrations.'
    toast.add({
      title: 'Erreur de chargement',
      description: message,
      color: 'error',
    })
  } finally {
    isLoading.value = false
    hasLoadedOnce.value = true
  }
}

const providerDisplayName = (id: string | null | undefined) => {
  if (!id) {
    return 'ce service'
  }
  const match = providerCopy[id]?.title || providers.value.find((provider) => provider.id === id)?.displayName
  return match || id
}

const connectProvider = async (providerId: string) => {
  if (connectingProvider.value) {
    return
  }

  if (!(await ensureAuthenticated())) {
    return
  }

  connectingProvider.value = providerId

  try {
    const { redirectUrl } = await $fetch<{ redirectUrl: string }>(`/api/auth/social/${providerId}/redirect`, {
      headers: {
        Authorization: `Bearer ${authStore.token}`,
      },
      params: {
        purpose: 'connect',
        redirect_path: '/app/services',
      },
    })

    if (!redirectUrl) {
      throw new Error('Lien de redirection introuvable.')
    }

    window.location.href = redirectUrl
  } catch (error: any) {
    const message = error?.data?.message || error?.message || 'Impossible de lancer la connexion.'
    toast.add({
      title: `Connexion ${providerDisplayName(providerId)}`,
      description: message,
      color: 'error',
    })
  } finally {
    connectingProvider.value = null
  }
}

const disconnectProvider = async (providerId: string) => {
  if (disconnectingProvider.value) {
    return
  }

  if (!(await ensureAuthenticated())) {
    return
  }

  disconnectingProvider.value = providerId

  try {
    await $fetch(`/api/auth/social/${providerId}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${authStore.token}`,
      },
    })

    toast.add({
      title: `${providerDisplayName(providerId)} déconnecté`,
      description: 'Le compte externe a bien été retiré.',
      color: 'success',
    })

    await loadProviders()
  } catch (error: any) {
    const message = error?.data?.message || error?.message || 'Impossible de déconnecter ce service.'
    toast.add({
      title: `Déconnexion ${providerDisplayName(providerId)}`,
      description: message,
      color: 'error',
    })
  } finally {
    disconnectingProvider.value = null
  }
}

const handleRouteStatus = () => {
  const getQueryParam = (key: string) => {
    const value = route.query[key]
    return Array.isArray(value) ? value[0] ?? null : (value ?? null)
  }

  const status = getQueryParam('status')
  if (!status) {
    return
  }

  const provider = getQueryParam('provider')
  const reason = getQueryParam('reason')

  if (status === 'connected') {
    toast.add({
      title: `${providerDisplayName(provider)} connecté`,
      description: 'Votre compte a été relié avec succès.',
      color: 'success',
    })
  } else if (status === 'error') {
    const readableReason = reason ? reason.replace(/_/g, ' ') : 'Une erreur est survenue.'
    toast.add({
      title: `Erreur ${providerDisplayName(provider)}`,
      description: readableReason,
      color: 'error',
    })
  }

  const nextQuery = { ...route.query }
  delete nextQuery.status
  delete nextQuery.provider
  delete nextQuery.reason
  delete nextQuery.token
  delete nextQuery.created

  router.replace({
    query: nextQuery,
  })
}

onMounted(async () => {
  await loadProviders()
  handleRouteStatus()
})
</script>

<template>
  <UDashboardPanel id="services" :ui="{ body: 'lg:py-12' }">
    <template #header>
      <UDashboardNavbar title="Services">
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>
      </UDashboardNavbar>
    </template>

    <template #body>
      <div class="flex flex-col gap-4 sm:gap-6 lg:gap-12 w-full lg:max-w-5xl mx-auto">
        <section class="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary-600 via-primary-500 to-primary-400 px-8 py-12 text-white shadow-2xl shadow-primary-500/20">
          <div class="absolute inset-y-0 right-0 h-full w-1/3 bg-gradient-to-l from-white/10 to-transparent blur-3xl" />
          <div class="pointer-events-none absolute -top-16 left-6 h-48 w-48 rounded-full bg-white/10 blur-3xl" />
          <div class="pointer-events-none absolute -bottom-20 right-32 h-56 w-56 rounded-full border border-white/25" />
          <div class="pointer-events-none absolute right-10 top-10 grid grid-cols-2 gap-3 text-white/30">
            <div class="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 backdrop-blur">
              <UIcon name="i-lucide-plug" class="h-5 w-5" />
            </div>
            <div class="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 backdrop-blur">
              <UIcon name="i-lucide-waves" class="h-5 w-5" />
            </div>
            <div class="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 backdrop-blur">
              <UIcon name="i-lucide-arrow-right" class="h-5 w-5" />
            </div>
            <div class="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 backdrop-blur">
              <UIcon name="i-lucide-cpu" class="h-5 w-5" />
            </div>
          </div>
          <div class="relative grid gap-10 lg:grid-cols-2">
            <div class="space-y-6">
              <UBadge color="neutral" variant="soft" class="bg-white/20 text-white/90">
                Connexions AREA
              </UBadge>
              <h1 class="text-4xl font-semibold tracking-tight sm:text-5xl">
                Activez vos services en quelques clics
              </h1>
              <p class="max-w-xl text-base text-white/80">
                Connectez vos outils métiers pour débloquer vos scénarios AREA. Chaque service autorisé
                devient instantanément disponible dans l’atelier d’automatisation.
              </p>
              <div class="flex flex-wrap items-center gap-3 text-sm">
                <span class="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-white">
                  <UIcon name="i-lucide-lock-keyhole" class="h-4 w-4" />
                  OAuth sécurisé
                </span>
                <span class="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-white">
                  <UIcon name="i-lucide-shield-check" class="h-4 w-4" />
                  Permissions révocables
                </span>
              </div>
            </div>
            <div class="grid grid-cols-2 gap-4 text-sm">
              <div class="rounded-2xl bg-white/15 p-6 backdrop-blur">
                <span class="text-white/70">Services connectés</span>
                <p class="mt-4 text-4xl font-semibold">{{ connectionStats.connected }}</p>
                <p class="mt-1 text-white/70">sur {{ connectionStats.total }} disponibles</p>
              </div>
              <div class="rounded-2xl bg-white/15 p-6 backdrop-blur">
                <span class="text-white/70">Taux d’activation</span>
                <p class="mt-4 text-4xl font-semibold">{{ connectionStats.ratio }}%</p>
                <p class="mt-1 text-white/70">Objectif > 80%</p>
              </div>
              <div class="col-span-2 rounded-2xl bg-white/10 p-6 backdrop-blur">
                <div class="flex items-center justify-between">
                  <div>
                    <p class="text-white/80">Progression globale</p>
                    <p class="text-lg font-semibold">
                      {{ connectionStats.connected }} services prêts à l’usage
                    </p>
                  </div>
                  <UIcon name="i-lucide-plug" class="h-10 w-10 text-white/70" />
                </div>
                <div class="mt-4 h-2 rounded-full bg-white/10">
                  <div
                      class="h-full rounded-full bg-white"
                      :style="{ width: `${connectionStats.ratio}%` }"
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <UPageGrid>
          <template v-if="isLoading">
            <UPageCard
              v-for="placeholder in 1"
              :key="placeholder"
              title="Chargement..."
              icon="i-lucide-ellipsis"
              spotlight
            >
              <div class="flex flex-col gap-4">
                <USkeleton class="h-4 w-2/3" />
                <USkeleton class="h-4 w-1/2" />
                <USkeleton class="h-10 w-full" />
              </div>
            </UPageCard>
          </template>

          <template v-else>
            <template v-if="visibleProviders.length">
              <UPageCard
              v-for="provider in visibleProviders"
              :key="provider.id"
              :title="providerCopy[provider.id]?.title || provider.displayName"
              :description="providerCopy[provider.id]?.description || 'Connectez-vous pour débloquer des fonctionnalités avancées.'"
              :icon="providerCopy[provider.id]?.icon || provider.icon"
              :ui="providerUi[provider.id]"
              spotlight
            >
              <div class="flex flex-col gap-4">
                <div class="flex items-center gap-3">
                  <UAvatar
                    v-if="provider.connected && provider.account?.avatarUrl"
                    :src="provider.account.avatarUrl"
                    :alt="provider.account?.displayName || provider.account?.username || provider.displayName"
                    size="lg"
                  />
                  <div>
                    <p class="font-medium">
                      <template v-if="provider.connected">
                        {{ provider.account?.displayName || provider.account?.username || provider.displayName }}
                      </template>
                    </p>
                    <p v-if="provider.connected && provider.account?.email" class="text-sm text-neutral-500">
                      {{ provider.account.email }}
                    </p>
                  </div>
                </div>

                <div class="flex flex-col sm:flex-row gap-3 mt-auto">
                  <UButton
                    variant="subtle"
                    :color="provider.connected ? 'success' : 'neutral'"
                    icon="i-lucide-square-arrow-out-up-right"
                    block
                    :loading="connectingProvider === provider.id"
                    @click="connectProvider(provider.id)"
                  >
                    {{ provider.connected ? 'Reconnecter' : 'Connecter' }}
                  </UButton>

                  <UButton
                    v-if="provider.connected"
                    variant="subtle"
                    color="error"
                    block
                    :loading="disconnectingProvider === provider.id"
                    @click="disconnectProvider(provider.id)"
                  >
                    Déconnecter
                  </UButton>
                </div>

                <UPopover v-if="provider.connected && provider.account?.scopes?.length" mode="hover">
                  <UButton
                    label="Permissions accordées"
                    color="neutral"
                    icon="i-lucide-shield-check"
                    variant="soft"
                    block
                  />

                  <template #content>
                    <div class="w-74 p-4 flex flex-wrap gap-2">
                      <UBadge
                        v-for="scope in provider.account?.scopes"
                        :key="scope"
                        color="neutral"
                        variant="subtle"
                      >
                        {{ scope }}
                      </UBadge>
                    </div>
                  </template>
                </UPopover>
              </div>
            </UPageCard>
            </template>
            <template v-else>
              <UPageCard
                title="Intégrations"
                description="Aucune intégration n’est disponible pour le moment."
                icon="i-lucide-plug"
              >
                <p class="text-sm text-neutral-500">Revenez bientôt pour découvrir de nouveaux connecteurs.</p>
              </UPageCard>
            </template>
          </template>
        </UPageGrid>
      </div>
    </template>
  </UDashboardPanel>
</template>
