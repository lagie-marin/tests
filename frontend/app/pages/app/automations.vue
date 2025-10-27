<script setup lang="ts">
import { useAuthStore } from '~/stores/auth'

definePageMeta({
  layout: 'app',
})

type AutomationFieldType = 'string' | 'number' | 'select' | 'boolean'

interface AutomationFieldOption {
  value: string
  label: string
  description?: string
}

interface AutomationField {
  name: string
  label: string
  type: AutomationFieldType
  description?: string
  required?: boolean
  placeholder?: string
  options?: AutomationFieldOption[]
}

interface AutomationActionDefinition {
  id: string
  serviceId: string
  displayName: string
  description: string
  fields: AutomationField[]
  minimumPollingIntervalMs: number
}

interface AutomationReactionDefinition {
  id: string
  serviceId: string
  displayName: string
  description: string
  fields: AutomationField[]
}

interface AutomationStateSnapshot {
  lastRunAt: string | null
  lastEventAt: string | null
  lastError: string | null
  checkpoint?: Record<string, unknown> | null
  updatedAt?: string | null
  createdAt?: string | null
}

interface AutomationListItem {
  id: number
  name: string
  description: string | null
  enabled: boolean
  action: {
    id: string
    serviceId: string
    config: Record<string, unknown> | null
  }
  reaction: {
    id: string
    serviceId: string
    config: Record<string, unknown> | null
  }
  state?: AutomationStateSnapshot | null
  createdAt: string
  updatedAt?: string | null
}

interface ServiceMeta {
  title: string
  description: string
  icon: string
  accent?: string
}

interface AutomationStatusDescriptor {
  label: string
  color: string
  icon: string
  message?: string
}

const serviceCatalogCopy: Record<string, ServiceMeta> = {
  spotify: {
    title: 'Spotify',
    description: 'Automatisez vos playlists, titres likés et bibliothèques musicales.',
    icon: 'i-simple-icons-spotify',
    accent: 'text-emerald-500',
  },
  github: {
    title: 'GitHub',
    description: 'Réagissez aux issues, pull requests et événements de dépôt.',
    icon: 'i-simple-icons-github',
    accent: 'text-black',
  },
  google: {
    title: 'Google',
    description: 'Gérez vos e-mails, Drive ou agenda automatiquement.',
    icon: 'i-simple-icons-google',
    accent: 'text-blue-500',
  },
  facebook: {
    title: 'Facebook',
    description: 'Surveillez votre communauté et déclenchez des rappels personnalisés.',
    icon: 'i-simple-icons-facebook',
    accent: 'text-blue-600',
  },
  twitter: {
    title: 'X / Twitter',
    description: 'Réagissez aux mentions, messages et hashtags clés.',
    icon: 'i-simple-icons-x',
    accent: 'text-black',
  },
  discord: {
    title: 'Discord',
    description: 'Animez vos communautés avec des notifications ciblées.',
    icon: 'i-simple-icons-discord',
    accent: 'text-indigo-500',
  },
  linkedin: {
    title: 'LinkedIn',
    description: 'Suivez vos relations professionnelles et répondez rapidement.',
    icon: 'i-simple-icons-linkedin',
    accent: 'text-sky-600',
  },
  dropbox: {
    title: 'Dropbox',
    description: 'Synchronisez vos fichiers critiques automatiquement.',
    icon: 'i-simple-icons-dropbox',
    accent: 'text-sky-500',
  },
  onedrive: {
    title: 'OneDrive',
    description: 'Sauvegardez documents et pièces jointes en un clin d’œil.',
    icon: 'i-simple-icons-microsoftonedrive',
    accent: 'text-blue-500',
  },
  outlook: {
    title: 'Outlook',
    description: 'Traitez vos e-mails entrants avec des flux personnalisés.',
    icon: 'i-simple-icons-microsoftoutlook',
    accent: 'text-sky-600',
  },
  gmail: {
    title: 'Gmail',
    description: 'Transformez vos e-mails en tâches et réactions instantanées.',
    icon: 'i-simple-icons-gmail',
    accent: 'text-red-500',
  },
  feedly: {
    title: 'Feedly',
    description: 'Surveillez vos sources RSS favorites sans effort.',
    icon: 'i-simple-icons-feedly',
    accent: 'text-emerald-600',
  },
  timer: {
    title: 'Minuteur',
    description: 'Déclenchez des actions récurrentes selon vos échéances.',
    icon: 'i-lucide-stopwatch',
    accent: 'text-purple-500',
  },
  scripting: {
    title: 'Scripting',
    description: 'Exécutez du code personnalisé lorsque vos conditions sont réunies.',
    icon: 'i-lucide-code',
    accent: 'text-amber-500',
  },
}

const authStore = useAuthStore()
const toast = useToast()

const isCatalogLoading = ref(false)
const catalogError = ref<string | null>(null)
const isAutomationsLoading = ref(false)
const automationsError = ref<string | null>(null)

const actionsCatalog = ref<AutomationActionDefinition[]>([])
const reactionsCatalog = ref<AutomationReactionDefinition[]>([])
const automations = ref<AutomationListItem[]>([])

const selectedActionId = ref<string | null>(null)
const selectedReactionId = ref<string | null>(null)

const actionConfig = reactive<Record<string, any>>({})
const reactionConfig = reactive<Record<string, any>>({})

const automationName = ref('')
const automationDescription = ref('')

const isSavingDraft = ref(false)
const formError = ref<string | null>(null)
const isCreateAutomationOpen = ref(false)

const actionFieldTouched = reactive<Record<string, boolean>>({})
const reactionFieldTouched = reactive<Record<string, boolean>>({})

const dateTimeFormatter = new Intl.DateTimeFormat('fr-FR', {
  dateStyle: 'medium',
  timeStyle: 'short',
})

function formatDateTime(value: string | null | undefined) {
  if (!value) {
    return 'Jamais'
  }

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return 'Inconnue'
  }

  return dateTimeFormatter.format(date)
}

function parseDateToTimestamp(value: string | null | undefined) {
  if (!value) {
    return 0
  }

  const timestamp = new Date(value).getTime()
  if (Number.isNaN(timestamp)) {
    return 0
  }

  return timestamp
}

function formatServiceId(serviceId: string) {
  if (!serviceId) {
    return 'Service'
  }
  return serviceId.charAt(0).toUpperCase() + serviceId.slice(1)
}

function getServiceMeta(serviceId?: string | null): ServiceMeta {
  if (!serviceId) {
    return {
      title: 'Service à définir',
      description: 'Sélectionnez un service pour afficher ses détails.',
      icon: 'i-lucide-plug',
      accent: 'text-primary-500',
    }
  }
  const meta = serviceCatalogCopy[serviceId]
  if (meta) {
    return meta
  }
  return {
    title: formatServiceId(serviceId),
    description: 'Service externe connecté à Area.',
    icon: 'i-lucide-plug',
    accent: 'text-primary-500',
  }
}

function computeAutomationStatus(automation: AutomationListItem): AutomationStatusDescriptor {
  if (!automation.enabled) {
    return {
      label: 'Désactivée',
      color: 'neutral',
      icon: 'i-lucide-pause-circle',
      message: 'Cette automation est actuellement désactivée.',
    }
  }

  const lastError = automation.state?.lastError
  if (lastError) {
    return {
      label: 'En erreur',
      color: 'error',
      icon: 'i-lucide-alert-triangle',
      message: 'Erreur détectée lors de la dernière exécution.',
    }
  }

  const lastRunAt = automation.state?.lastRunAt
  if (lastRunAt) {
    return {
      label: 'Active',
      color: 'success',
      icon: 'i-lucide-check-circle-2',
      message: `Dernière exécution : ${formatDateTime(lastRunAt)}`,
    }
  }

  return {
    label: 'En attente',
    color: 'info',
    icon: 'i-lucide-hourglass',
    message: 'En attente de première exécution.',
  }
}

function defaultValueForField(field: AutomationField) {
  switch (field.type) {
    case 'boolean':
      return false
    case 'select':
    case 'string':
    case 'number':
    default:
      return ''
  }
}

function resetConfig(target: Record<string, any>, fields: AutomationField[]) {
  Object.keys(target).forEach((key) => {
    delete target[key]
  })
  fields.forEach((field) => {
    target[field.name] = defaultValueForField(field)
  })
}

function snapshotConfig(target: Record<string, any>) {
  return Object.keys(target).reduce<Record<string, any>>((acc, key) => {
    const value = target[key]
    if (value !== '' && value !== null && value !== undefined) {
      acc[key] = value
    }
    return acc
  }, {})
}

function getFieldError(field: AutomationField, values: Record<string, any>) {
  const rawValue = values[field.name]
  const isEmpty = rawValue === '' || rawValue === null || rawValue === undefined

  switch (field.type) {
    case 'boolean':
      if (field.required && typeof rawValue !== 'boolean') {
        return 'Ce champ est requis.'
      }
      return null
    case 'number': {
      if (isEmpty) {
        return field.required ? 'Ce champ est requis.' : null
      }
      const numericValue = Number(rawValue)
      if (Number.isNaN(numericValue)) {
        return 'Veuillez saisir un nombre valide.'
      }
      return null
    }
    case 'select':
      if (isEmpty) {
        return field.required ? 'Veuillez sélectionner une option.' : null
      }
      if (field.options && field.options.length > 0) {
        const availableValues = field.options.map((option) => option.value)
        if (!availableValues.includes(rawValue)) {
          return 'Option invalide sélectionnée.'
        }
      }
      return null
    case 'string':
    default:
      if (isEmpty) {
        return field.required ? 'Ce champ est requis.' : null
      }
      if (typeof rawValue !== 'string') {
        return 'Valeur invalide.'
      }
      return null
  }
}

function resetTouchedState(target: Record<string, boolean>, fields: AutomationField[]) {
  Object.keys(target).forEach((key) => {
    delete target[key]
  })

  fields.forEach((field) => {
    target[field.name] = false
  })
}

const selectedAction = computed(() =>
  actionsCatalog.value.find((action) => action.id === selectedActionId.value) ?? null
)

const selectedReaction = computed(() =>
  reactionsCatalog.value.find((reaction) => reaction.id === selectedReactionId.value) ?? null
)

const selectedActionFields = computed(() => selectedAction.value?.fields ?? [])
const selectedReactionFields = computed(() => selectedReaction.value?.fields ?? [])

const selectedActionMeta = computed(() => getServiceMeta(selectedAction.value?.serviceId))
const selectedReactionMeta = computed(() => getServiceMeta(selectedReaction.value?.serviceId))

const actionFieldErrors = computed(() => {
  return selectedActionFields.value.reduce<Record<string, string | null>>((acc, field) => {
    acc[field.name] = getFieldError(field, actionConfig)
    return acc
  }, {})
})

const reactionFieldErrors = computed(() => {
  return selectedReactionFields.value.reduce<Record<string, string | null>>((acc, field) => {
    acc[field.name] = getFieldError(field, reactionConfig)
    return acc
  }, {})
})

const actionOptions = computed(() =>
  actionsCatalog.value.map((action) => {
    const meta = getServiceMeta(action.serviceId)
    return {
      label: `${action.displayName}`,
      value: action.id,
      description: meta.title,
    }
  })
)

const reactionOptions = computed(() =>
  reactionsCatalog.value.map((reaction) => {
    const meta = getServiceMeta(reaction.serviceId)
    return {
      label: `${reaction.displayName}`,
      value: reaction.id,
      description: meta.title,
    }
  })
)

const isActionConfigComplete = computed(() => {
  const action = selectedAction.value
  if (!action) {
    return false
  }
  return action.fields.every((field) => !getFieldError(field, actionConfig))
})

const isReactionConfigComplete = computed(() => {
  const reaction = selectedReaction.value
  if (!reaction) {
    return false
  }
  return reaction.fields.every((field) => !getFieldError(field, reactionConfig))
})

const automationSummary = computed(() => {
  if (!selectedAction.value || !selectedReaction.value) {
    return null
  }

  return {
    action: selectedAction.value,
    reaction: selectedReaction.value,
    actionMeta: getServiceMeta(selectedAction.value.serviceId),
    reactionMeta: getServiceMeta(selectedReaction.value.serviceId),
  }
})

const automationPreview = computed(() => {
  if (!selectedAction.value || !selectedReaction.value) {
    return null
  }

  return {
    name: automationName.value.trim() || 'Automatisation sans titre',
    description: automationDescription.value.trim() || undefined,
    action: {
      id: selectedAction.value.id,
      serviceId: selectedAction.value.serviceId,
      config: snapshotConfig(actionConfig),
    },
    reaction: {
      id: selectedReaction.value.id,
      serviceId: selectedReaction.value.serviceId,
      config: snapshotConfig(reactionConfig),
    },
  }
})

const automationPreviewFormatted = computed(() =>
  automationPreview.value ? JSON.stringify(automationPreview.value, null, 2) : null
)

const canCreateAutomation = computed(() => {
  if (!selectedAction.value || !selectedReaction.value) {
    return false
  }
  if (!isActionConfigComplete.value || !isReactionConfigComplete.value) {
    return false
  }
  return automationName.value.trim().length > 0
})

const servicesCatalog = computed(() => {
  const serviceIds = new Set<string>()
  actionsCatalog.value.forEach((action) => serviceIds.add(action.serviceId))
  reactionsCatalog.value.forEach((reaction) => serviceIds.add(reaction.serviceId))

  return Array.from(serviceIds).map((serviceId) => {
    const serviceActions = actionsCatalog.value
      .filter((action) => action.serviceId === serviceId)
      .sort((a, b) => a.displayName.localeCompare(b.displayName))
    const serviceReactions = reactionsCatalog.value
      .filter((reaction) => reaction.serviceId === serviceId)
      .sort((a, b) => a.displayName.localeCompare(b.displayName))

    return {
      id: serviceId,
      meta: getServiceMeta(serviceId),
      actions: serviceActions,
      reactions: serviceReactions,
    }
  }).sort((a, b) => a.meta.title.localeCompare(b.meta.title))
})

const hasCatalogData = computed(() => servicesCatalog.value.length > 0)

const actionDefinitionsById = computed(() =>
  actionsCatalog.value.reduce<Record<string, AutomationActionDefinition>>((acc, action) => {
    acc[action.id] = action
    return acc
  }, {})
)

const reactionDefinitionsById = computed(() =>
  reactionsCatalog.value.reduce<Record<string, AutomationReactionDefinition>>((acc, reaction) => {
    acc[reaction.id] = reaction
    return acc
  }, {})
)

const automationStats = computed(() => {
  const items = automations.value
  const total = items.length
  const active = items.filter((automation) => automation.enabled).length
  const healthy = items.filter(
    (automation) => automation.enabled && !automation.state?.lastError
  ).length
  const recentlyRun = items.filter((automation) => Boolean(automation.state?.lastRunAt)).length
  const successRate = total === 0 ? 0 : Math.round((healthy / total) * 100)

  return {
    total,
    active,
    healthy,
    recentlyRun,
    successRate,
  }
})

const sortedAutomations = computed(() =>
  [...automations.value].sort(
    (a, b) => parseDateToTimestamp(b.createdAt) - parseDateToTimestamp(a.createdAt)
  )
)

const automationEntries = computed(() =>
  sortedAutomations.value.map((automation) => {
    const actionDefinition = actionDefinitionsById.value[automation.action.id]
    const reactionDefinition = reactionDefinitionsById.value[automation.reaction.id]

    return {
      automation,
      actionDefinition,
      reactionDefinition,
      actionMeta: getServiceMeta(actionDefinition?.serviceId ?? automation.action.serviceId),
      reactionMeta: getServiceMeta(
        reactionDefinition?.serviceId ?? automation.reaction.serviceId
      ),
      status: computeAutomationStatus(automation),
    }
  })
)

const hasAutomations = computed(() => sortedAutomations.value.length > 0)

async function loadAutomations(options: { silent?: boolean } = {}) {
  if (isAutomationsLoading.value) {
    return
  }

  const silent = options.silent ?? false

  automationsError.value = null
  isAutomationsLoading.value = true

  try {
    await authStore.initializeAuth()

    if (!authStore.token) {
      throw new Error('Votre session a expiré. Veuillez vous reconnecter.')
    }

    const headers = {
      Authorization: `Bearer ${authStore.token}`,
    }

    const response = await $fetch<{ automations: AutomationListItem[] }>(
      '/api/auth/automations',
      { headers }
    )

    automations.value = response?.automations ?? []
  } catch (error: any) {
    const message =
      error?.data?.message ||
      error?.message ||
      'Impossible de récupérer vos automatisations.'

    automationsError.value = message

    if (!silent) {
      toast.add({
        title: 'Chargement impossible',
        description: message,
        color: 'error',
      })
    }
  } finally {
    isAutomationsLoading.value = false
  }
}

async function loadCatalog() {
  if (isCatalogLoading.value) {
    return
  }

  catalogError.value = null
  isCatalogLoading.value = true

  try {
    await authStore.initializeAuth()

    if (!authStore.token) {
      throw new Error('Votre session a expiré. Veuillez vous reconnecter.')
    }

    const headers = {
      Authorization: `Bearer ${authStore.token}`,
    }

    const [actionsResponse, reactionsResponse] = await Promise.all([
      $fetch<{ actions: AutomationActionDefinition[] }>('/api/auth/automation/actions', { headers }),
      $fetch<{ reactions: AutomationReactionDefinition[] }>('/api/auth/automation/reactions', { headers }),
    ])

    actionsCatalog.value = actionsResponse?.actions ?? []
    reactionsCatalog.value = reactionsResponse?.reactions ?? []
  } catch (error: any) {
    const message =
      error?.data?.message ||
      error?.message ||
      'Impossible de charger le catalogue des automatisations.'

    catalogError.value = message

    toast.add({
      title: 'Chargement impossible',
      description: message,
      color: 'error',
    })
  } finally {
    isCatalogLoading.value = false
  }
}

function selectAction(id: string) {
  selectedActionId.value = id
}

function selectReaction(id: string) {
  selectedReactionId.value = id
}

function markAllActionFieldsTouched() {
  selectedActionFields.value.forEach((field) => {
    actionFieldTouched[field.name] = true
  })
}

function markAllReactionFieldsTouched() {
  selectedReactionFields.value.forEach((field) => {
    reactionFieldTouched[field.name] = true
  })
}

async function onSubmit() {
  markAllActionFieldsTouched()
  markAllReactionFieldsTouched()

  if (!canCreateAutomation.value || isSavingDraft.value) {
    toast.add({
      title: 'Champs incomplets',
      description: 'Vérifiez les paramètres requis avant de tenter un enregistrement.',
      color: 'warning',
    })
    return
  }

  isSavingDraft.value = true
  formError.value = null

  try {
    await authStore.initializeAuth()
    if (!authStore.token) {
      throw new Error('Votre session a expiré. Veuillez vous reconnecter.')
    }

    const payload = automationPreview.value
    const response = await $fetch<{ message?: string }>(
      '/api/auth/automations',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${authStore.token}`,
          'Content-Type': 'application/json',
        },
        body: payload,
      }
    )

    toast.add({
      title: 'Automation enregistrée',
      description: response?.message || 'Votre demande a été transmise au serveur.',
      color: 'success',
    })

    await loadAutomations({ silent: true })
    isCreateAutomationOpen.value = false
  } catch (error: any) {
    const status = error?.response?.status || error?.status
    const message =
      error?.response?._data?.message ||
      error?.data?.message ||
      error?.message ||
      'Impossible d’enregistrer cette automation pour le moment.'

    if (status === 501) {
      toast.add({
        title: 'Fonctionnalité à venir',
        description: message,
        color: 'info',
      })
    } else {
      formError.value = message
      toast.add({
        title: 'Erreur lors de l’enregistrement',
        description: message,
        color: 'error',
      })
    }
  } finally {
    isSavingDraft.value = false
  }
}

watch(actionsCatalog, (actions) => {
  if (!actions.length) {
    selectedActionId.value = null
    return
  }

  if (!selectedActionId.value || !actions.some((action) => action.id === selectedActionId.value)) {
    selectedActionId.value = actions[0].id
  }
}, { immediate: true })

watch(reactionsCatalog, (reactions) => {
  if (!reactions.length) {
    selectedReactionId.value = null
    return
  }

  if (!selectedReactionId.value || !reactions.some((reaction) => reaction.id === selectedReactionId.value)) {
    selectedReactionId.value = reactions[0].id
  }
}, { immediate: true })

watch(selectedAction, (action) => {
  resetConfig(actionConfig, action ? action.fields : [])
  resetTouchedState(actionFieldTouched, action ? action.fields : [])
  formError.value = null
}, { immediate: true })

watch(selectedReaction, (reaction) => {
  resetConfig(reactionConfig, reaction ? reaction.fields : [])
  resetTouchedState(reactionFieldTouched, reaction ? reaction.fields : [])
  formError.value = null
}, { immediate: true })

onMounted(() => {
  loadCatalog()
  loadAutomations()
})
</script>

<template>
  <UDashboardPanel id="automations" :ui="{ body: 'lg:py-12' }">
    <template #header>
      <UDashboardNavbar title="Automatisations">
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>

        <template #description>
          Configurez vos AREA : choisissez une action déclencheuse et associez une réaction automatisée.
        </template>
      </UDashboardNavbar>
    </template>

    <template #body>
      <div class="flex flex-col gap-6 sm:gap-8 lg:gap-12 w-full lg:max-w-6xl mx-auto">
        <section class="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary-600 via-primary-500 to-emerald-400 px-8 py-12 text-white shadow-2xl shadow-primary-500/20">
          <div class="absolute inset-y-0 right-0 h-full w-1/3 bg-gradient-to-l from-white/10 to-transparent blur-3xl" />
          <div class="pointer-events-none absolute -top-16 left-10 h-44 w-44 rounded-full bg-white/15 blur-3xl" />
          <div class="pointer-events-none absolute -bottom-20 right-16 h-56 w-56 rounded-full border border-white/25" />
          <div class="pointer-events-none absolute right-10 top-10 grid grid-cols-2 gap-3 text-white/30">
            <div class="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 backdrop-blur">
              <UIcon name="i-lucide-bot" class="h-5 w-5" />
            </div>
            <div class="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 backdrop-blur">
              <UIcon name="i-lucide-trending-up" class="h-5 w-5" />
            </div>
            <div class="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 backdrop-blur">
              <UIcon name="i-lucide-gantt-chart" class="h-5 w-5" />
            </div>
            <div class="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 backdrop-blur">
              <UIcon name="i-lucide-rocket" class="h-5 w-5" />
            </div>
          </div>
          <div class="relative grid gap-10 lg:grid-cols-2">
            <div class="space-y-6">
              <UBadge color="neutral" variant="soft" class="bg-white/20 text-white/90">
                Pilotage des automatisations
              </UBadge>
              <h1 class="text-4xl font-semibold tracking-tight sm:text-5xl">
                Orchestration en continu de vos scénarios AREA
              </h1>
              <p class="max-w-xl text-base text-white/80">
                Visualisez l’impact de vos automatisations actives et ajustez vos scénarios pour maintenir un niveau de performance élevé.
              </p>
              <div class="flex flex-wrap items-center gap-3 text-sm">
                <span class="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-white">
                  <UIcon name="i-lucide-clock" class="h-4 w-4" />
                  Exécutions monitorées
                </span>
                <span class="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-white">
                  <UIcon name="i-lucide-shield-check" class="h-4 w-4" />
                  Analyse des incidents
                </span>
              </div>
            </div>
            <div class="grid grid-cols-2 gap-4 text-sm">
              <div class="rounded-2xl bg-white/15 p-6 backdrop-blur">
                <span class="text-white/70">Automations actives</span>
                <p class="mt-4 text-4xl font-semibold">{{ automationStats.active }}</p>
                <p class="mt-1 text-white/70">sur {{ automationStats.total }} scénarios créés</p>
              </div>
              <div class="rounded-2xl bg-white/15 p-6 backdrop-blur">
                <span class="text-white/70">Taux de fiabilité</span>
                <p class="mt-4 text-4xl font-semibold">{{ automationStats.successRate }}%</p>
                <p class="mt-1 text-white/70">Objectif > 85%</p>
              </div>
              <div class="col-span-2 rounded-2xl bg-white/10 p-6 backdrop-blur">
                <div class="flex items-center justify-between">
                  <div>
                    <p class="text-white/80">Activité récente</p>
                    <p class="text-lg font-semibold">
                      {{ automationStats.recentlyRun }} automatisations ont tourné
                    </p>
                    <p class="text-sm text-white/70">
                      {{ automationStats.healthy }} scénarios actifs sans incident
                    </p>
                  </div>
                  <UIcon name="i-lucide-activity" class="h-10 w-10 text-white/70" />
                </div>
                <div class="mt-4 h-2 rounded-full bg-white/10">
                  <div
                    class="h-full rounded-full bg-white"
                    :style="{ width: `${automationStats.successRate}%` }"
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <h1 class="text-2xl font-semibold tracking-tight sm:text-3xl">
          Vos automatisations
        </h1>

        <div v-if="isAutomationsLoading && !hasAutomations" class="flex h-40 items-center justify-center">
          <UIcon name="i-lucide-loader-2" class="h-8 w-8 animate-spin text-primary-500" />
        </div>

        <div v-else class="space-y-4">
          <UAlert
            v-if="automationsError"
            icon="i-lucide-alert-octagon"
            color="error"
            variant="soft"
            :title="automationsError"
          />

          <div
            v-else-if="!hasAutomations"
            class="flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-(--ui-border) bg-(--ui-bg-elevated)/30 p-6 text-center"
          >
            <UIcon name="i-lucide-bot" class="h-8 w-8 text-muted" />
            <p class="text-sm font-medium text-(--ui-text)">Aucune automation enregistrée</p>
            <p class="text-sm text-muted">
              Cliquez sur « Nouvelle automation » pour créer votre premier scénario et le voir apparaître ici.
            </p>
          </div>

          <div v-else class="space-y-4">
            <article
              v-for="entry in automationEntries"
              :key="entry.automation.id"
              class="space-y-4 rounded-xl border border-(--ui-border) bg-(--ui-bg-elevated)/40 p-4"
            >
              <header class="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div class="space-y-1">
                  <div class="flex flex-wrap items-center gap-2">
                    <span class="text-base font-semibold text-(--ui-text)">{{ entry.automation.name }}</span>
                    <UBadge :color="entry.status.color" variant="soft" class="flex items-center gap-1">
                      <UIcon :name="entry.status.icon" class="h-3.5 w-3.5" />
                      <span>{{ entry.status.label }}</span>
                    </UBadge>
                  </div>
                  <p v-if="entry.automation.description" class="text-sm text-muted">
                    {{ entry.automation.description }}
                  </p>
                  <p class="text-xs text-muted">
                    Créée le {{ formatDateTime(entry.automation.createdAt) }}
                  </p>
                </div>
                <p v-if="entry.status.message" class="text-xs text-muted sm:text-right">
                  {{ entry.status.message }}
                </p>
              </header>

              <div class="grid gap-4 text-sm sm:grid-cols-2 lg:grid-cols-4">
                <div class="space-y-1">
                  <p class="text-xs font-semibold uppercase tracking-wide text-muted">Action</p>
                  <p class="font-medium text-(--ui-text)">
                    {{ entry.actionDefinition?.displayName || entry.automation.action.id }}
                  </p>
                  <p class="text-xs text-muted">{{ entry.actionMeta.title }}</p>
                </div>
                <div class="space-y-1">
                  <p class="text-xs font-semibold uppercase tracking-wide text-muted">Réaction</p>
                  <p class="font-medium text-(--ui-text)">
                    {{ entry.reactionDefinition?.displayName || entry.automation.reaction.id }}
                  </p>
                  <p class="text-xs text-muted">{{ entry.reactionMeta.title }}</p>
                </div>
                <div class="space-y-1">
                  <p class="text-xs font-semibold uppercase tracking-wide text-muted">Dernière exécution</p>
                  <p>{{ formatDateTime(entry.automation.state?.lastRunAt ?? null) }}</p>
                </div>
                <div class="space-y-1">
                  <p class="text-xs font-semibold uppercase tracking-wide text-muted">Dernier événement</p>
                  <p>{{ formatDateTime(entry.automation.state?.lastEventAt ?? null) }}</p>
                </div>
              </div>

              <p
                v-if="entry.automation.state?.lastError"
                class="rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-600 dark:border-red-900/40 dark:bg-red-900/20"
              >
                <span class="font-semibold">Dernière erreur :</span> {{ entry.automation.state?.lastError }}
              </p>
            </article>
          </div>
        </div>

        <div class="flex justify-end">
          <UModal
            v-model:open="isCreateAutomationOpen"
            title="Composer une nouvelle automation"
            description="Sélectionnez un déclencheur et une réaction, puis ajustez-les avant enregistrement."
            :ui="{
              content: 'sm:max-w-5xl w-full',
              body: 'space-y-8 max-h-[75vh] overflow-y-auto'
            }"
          >
            <UButton
              label="Nouvelle automation"
              icon="i-lucide-plus"
              color="primary"
            />

            <template #body>
              <div class="space-y-8">
                <UCard>
                <template #header>
                <div class="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
                <div>
                <h2 class="text-lg font-semibold text-(--ui-text)">Composer une nouvelle automation</h2>
                <p class="text-sm text-muted">
                Sélectionnez un déclencheur et une réaction. Ajoutez éventuellement des paramètres pour personnaliser le comportement.
                </p>
                </div>

                <UButton
                icon="i-lucide-refresh-cw"
                variant="ghost"
                color="neutral"
                :loading="isCatalogLoading"
                @click="loadCatalog"
                >
                Actualiser
                </UButton>
                </div>
                </template>

                <div v-if="isCatalogLoading && !hasCatalogData" class="flex h-56 items-center justify-center">
                <UIcon name="i-lucide-loader-2" class="h-8 w-8 animate-spin text-primary-500" />
                </div>

                <div v-else class="space-y-8">
                <UAlert
                v-if="catalogError"
                icon="i-lucide-alert-octagon"
                color="error"
                variant="soft"
                :title="catalogError"
                />

                <form class="space-y-8" @submit.prevent="onSubmit">
                <div class="grid gap-4">
                <div class="space-y-2">
                <UFormField label="Nom de l’automatisation" required>
                <UInput
                v-model="automationName"
                placeholder="Exemple : Sauvegarder chaque nouveau titre liké dans ma playlist favoris"
                />
                </UFormField>
                </div>

                <div class="space-y-2">
                <UFormField label="Description (facultatif)" hint="Optionnel">
                <UTextarea
                v-model="automationDescription"
                :rows="3"
                placeholder="Expliquez rapidement ce que doit faire cette automation."
                />
                </UFormField>
                </div>
                </div>

                <div class="grid gap-6 lg:grid-cols-2">
                <section class="space-y-4 rounded-xl border border-(--ui-border) bg-(--ui-bg-elevated)/40 p-4">
                <header class="flex items-start gap-3">
                <div class="flex h-12 w-12 items-center justify-center rounded-full bg-(--ui-bg-elevated)">
                <UIcon :name="selectedActionMeta.icon" class="h-6 w-6" />
                </div>
                <div>
                <p class="text-xs font-semibold uppercase tracking-wide text-muted">Action déclencheuse</p>
                <p class="text-base font-semibold">
                {{ selectedActionMeta.title }}
                </p>
                <p class="text-sm text-muted">
                {{ selectedAction?.description || selectedActionMeta.description }}
                </p>
                </div>
                </header>

                <div class="space-y-4">
                <div class="space-y-2">
                <UFormField label="Choisir une action">
                <USelectMenu
                v-model="selectedActionId"
                :items="actionOptions"
                value-key="value"
                label-key="label"
                :disabled="isCatalogLoading || !actionOptions.length"
                placeholder="Sélectionnez un déclencheur"
                >
                <template #item="{ item }">
                <div class="flex flex-col text-left">
                <span class="font-medium">{{ item.label }}</span>
                <span class="text-xs text-muted">{{ item.description }}</span>
                </div>
                </template>
                </USelectMenu>
                </UFormField>
                <p v-if="!actionOptions.length" class="text-sm text-muted">
                Aucune action disponible pour le moment.
                </p>
                </div>

                <div v-if="selectedActionFields.length" class="space-y-4">
                <h3 class="text-sm font-semibold text-(--ui-text)">Paramètres de l’action</h3>

                <div class="space-y-4">
                <div v-for="field in selectedActionFields" :key="field.name">
                <template v-if="field.type === 'boolean'">
                <div class="rounded-lg border border-(--ui-border) bg-(--ui-bg-elevated) p-4">
                <UCheckbox
                v-model="actionConfig[field.name]"
                :name="`action-${field.name}`"
                @change="actionFieldTouched[field.name] = true"
                >
                <template #label>
                <span class="font-medium">{{ field.label }}</span>
                </template>
                </UCheckbox>
                <p v-if="field.description" class="mt-1 text-sm text-muted">
                {{ field.description }}
                </p>
                <p
                v-if="actionFieldTouched[field.name] && actionFieldErrors[field.name]"
                class="mt-2 text-xs text-red-500"
                >
                {{ actionFieldErrors[field.name] }}
                </p>
                </div>
                </template>

                <template v-else>
                <div class="space-y-2">
                <UFormField
                :label="field.label"
                :required="field.required"
                :help="field.description || undefined"
                :error="actionFieldTouched[field.name] ? actionFieldErrors[field.name] || false : false"
                >
                <UInput
                v-if="field.type === 'string'"
                v-model="actionConfig[field.name]"
                :placeholder="field.placeholder || 'Saisir une valeur'"
                @blur="actionFieldTouched[field.name] = true"
                />
                <UInput
                v-else-if="field.type === 'number'"
                v-model="actionConfig[field.name]"
                type="number"
                :placeholder="field.placeholder || '0'"
                @blur="actionFieldTouched[field.name] = true"
                />
                <USelectMenu
                v-else-if="field.type === 'select'"
                v-model="actionConfig[field.name]"
                :items="field.options?.map((option) => ({ label: option.label, value: option.value, description: option.description })) ?? []"
                value-key="value"
                label-key="label"
                :placeholder="field.placeholder || 'Choisir une option'"
                @update:model-value="() => (actionFieldTouched[field.name] = true)"
                >
                <template #item="{ item }">
                <div class="flex flex-col text-left">
                <span class="font-medium">{{ item.label }}</span>
                <span v-if="item.description" class="text-xs text-muted">{{ item.description }}</span>
                </div>
                </template>
                </USelectMenu>
                </UFormField>
                </div>
                </template>
                </div>
                </div>
                </div>

                <p v-else class="text-sm text-muted">
                Aucun paramètre supplémentaire n’est requis pour cette action.
                </p>
                </div>
                </section>

                <section class="space-y-4 rounded-xl border border-(--ui-border) bg-(--ui-bg-elevated)/40 p-4">
                <header class="flex items-start gap-3">
                <div class="flex h-12 w-12 items-center justify-center rounded-full bg-(--ui-bg-elevated)">
                <UIcon :name="selectedReactionMeta.icon" class="h-6 w-6" />
                </div>
                <div>
                <p class="text-xs font-semibold uppercase tracking-wide text-muted">Réaction exécutée</p>
                <p class="text-base font-semibold">
                {{ selectedReactionMeta.title }}
                </p>
                <p class="text-sm text-muted">
                {{ selectedReaction?.description || selectedReactionMeta.description }}
                </p>
                </div>
                </header>

                <div class="space-y-4">
                <div class="space-y-2">
                <UFormField label="Choisir une réaction">
                <USelectMenu
                v-model="selectedReactionId"
                :items="reactionOptions"
                value-key="value"
                label-key="label"
                :disabled="isCatalogLoading || !reactionOptions.length"
                placeholder="Sélectionnez une réaction"
                >
                <template #item="{ item }">
                <div class="flex flex-col text-left">
                <span class="font-medium">{{ item.label }}</span>
                <span class="text-xs text-muted">{{ item.description }}</span>
                </div>
                </template>
                </USelectMenu>
                </UFormField>
                <p v-if="!reactionOptions.length" class="text-sm text-muted">
                Aucune réaction disponible pour le moment.
                </p>
                </div>

                <div v-if="selectedReactionFields.length" class="space-y-4">
                <h3 class="text-sm font-semibold text-(--ui-text)">Paramètres de la réaction</h3>

                <div class="space-y-4">
                <div v-for="field in selectedReactionFields" :key="field.name">
                <template v-if="field.type === 'boolean'">
                <div class="rounded-lg border border-(--ui-border) bg-(--ui-bg-elevated) p-4">
                <UCheckbox
                v-model="reactionConfig[field.name]"
                :name="`reaction-${field.name}`"
                @change="reactionFieldTouched[field.name] = true"
                >
                <template #label>
                <span class="font-medium">{{ field.label }}</span>
                </template>
                </UCheckbox>
                <p v-if="field.description" class="mt-1 text-sm text-muted">
                {{ field.description }}
                </p>
                <p
                v-if="reactionFieldTouched[field.name] && reactionFieldErrors[field.name]"
                class="mt-2 text-xs text-red-500"
                >
                {{ reactionFieldErrors[field.name] }}
                </p>
                </div>
                </template>

                <template v-else>
                <div class="space-y-2">
                <UFormField
                :label="field.label"
                :required="field.required"
                :help="field.description || undefined"
                :error="reactionFieldTouched[field.name] ? reactionFieldErrors[field.name] || false : false"
                >
                <UInput
                v-if="field.type === 'string'"
                v-model="reactionConfig[field.name]"
                :placeholder="field.placeholder || 'Saisir une valeur'"
                @blur="reactionFieldTouched[field.name] = true"
                />
                <UInput
                v-else-if="field.type === 'number'"
                v-model="reactionConfig[field.name]"
                type="number"
                :placeholder="field.placeholder || '0'"
                @blur="reactionFieldTouched[field.name] = true"
                />
                <USelectMenu
                v-else-if="field.type === 'select'"
                v-model="reactionConfig[field.name]"
                :items="field.options?.map((option) => ({ label: option.label, value: option.value, description: option.description })) ?? []"
                value-key="value"
                label-key="label"
                :placeholder="field.placeholder || 'Choisir une option'"
                @update:model-value="() => (reactionFieldTouched[field.name] = true)"
                >
                <template #item="{ item }">
                <div class="flex flex-col text-left">
                <span class="font-medium">{{ item.label }}</span>
                <span v-if="item.description" class="text-xs text-muted">{{ item.description }}</span>
                </div>
                </template>
                </USelectMenu>
                </UFormField>
                </div>
                </template>
                </div>
                </div>
                </div>

                <p v-else class="text-sm text-muted">
                Aucun paramètre supplémentaire n’est requis pour cette réaction.
                </p>
                </div>
                </section>
                </div>

                <div class="space-y-4 rounded-xl border border-dashed border-(--ui-border) bg-(--ui-bg-elevated)/30 p-4">
                <div class="flex items-center gap-2">
                <UIcon name="i-lucide-workflow" class="h-5 w-5 text-primary-500" />
                <p class="text-sm font-semibold text-(--ui-text)">Aperçu de l’automation</p>
                <UBadge
                :color="canCreateAutomation ? 'success' : 'neutral'"
                variant="soft"
                class="uppercase tracking-wide"
                >
                {{ canCreateAutomation ? 'Prête' : 'En construction' }}
                </UBadge>
                </div>

                <p v-if="!automationSummary" class="text-sm text-muted">
                Sélectionnez une action et une réaction pour générer l’aperçu de l’AREA.
                </p>

                <div v-else class="space-y-3">
                <p class="text-sm text-(--ui-text)">
                Quand <strong>{{ automationSummary.actionMeta.title }}</strong> détecte
                « {{ automationSummary.action.displayName }} », alors
                <strong>{{ automationSummary.reactionMeta.title }}</strong> exécute
                « {{ automationSummary.reaction.displayName }} ».
                </p>

                <pre
                v-if="automationPreviewFormatted"
                class="max-h-48 overflow-auto rounded-lg bg-(--ui-bg-elevated) p-3 text-xs leading-relaxed text-(--ui-text-muted)"
                ><code>{{ automationPreviewFormatted }}</code></pre>
                </div>
                </div>

                <UAlert
                v-if="formError"
                color="error"
                variant="soft"
                icon="i-lucide-alert-octagon"
                :title="formError"
                />

                <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div class="flex items-center gap-2 text-sm text-muted">
                <UIcon
                :name="canCreateAutomation ? 'i-lucide-badge-check' : 'i-lucide-circle-dot-dashed'"
                class="h-4 w-4"
                />
                <span>
                {{ canCreateAutomation ? 'Votre automation est prête à être enregistrée.' : 'Complétez les champs obligatoires pour activer le bouton.' }}
                </span>
                </div>

                <UButton
                type="submit"
                color="primary"
                icon="i-lucide-save"
                :disabled="!canCreateAutomation"
                :loading="isSavingDraft"
                >
                Enregistrer
                </UButton>
                </div>
                </form>
                </div>
                </UCard>

                <UCard>
                <template #header>
                <div>
                <h2 class="text-lg font-semibold text-(--ui-text)">Catalogue des actions & réactions</h2>
                <p class="text-sm text-muted">
                Visualisez les déclencheurs et réactions disponibles par service. Cliquez sur « Utiliser » pour les sélectionner rapidement.
                </p>
                </div>
                </template>

                <div v-if="isCatalogLoading && !hasCatalogData" class="flex h-40 items-center justify-center">
                <UIcon name="i-lucide-loader-2" class="h-6 w-6 animate-spin text-primary-500" />
                </div>

                <div v-else class="space-y-6">
                <UAlert
                v-if="!hasCatalogData && !isCatalogLoading"
                icon="i-lucide-info"
                color="neutral"
                variant="soft"
                title="Aucun service disponible pour le moment"
                description="Connectez des services depuis l’onglet « Services » pour découvrir de nouvelles actions et réactions."
                />

                <section
                v-for="service in servicesCatalog"
                :key="service.id"
                class="space-y-4 rounded-xl border border-(--ui-border) p-4"
                >
                <header class="flex items-start gap-3">
                <div class="flex h-12 w-12 items-center justify-center rounded-full bg-(--ui-bg-elevated)">
                <UIcon :name="service.meta.icon" class="h-6 w-6" />
                </div>
                <div>
                <p class="text-base font-semibold text-(--ui-text)">
                {{ service.meta.title }}
                </p>
                <p class="text-sm text-muted">
                {{ service.meta.description }}
                </p>
                </div>
                </header>

                <div class="space-y-4">
                <div class="space-y-2">
                <div class="flex items-center gap-2">
                <UBadge color="primary" variant="soft">Actions</UBadge>
                <span class="text-xs text-muted">{{ service.actions.length }} disponible(s)</span>
                </div>

                <div v-if="service.actions.length" class="grid gap-2">
                <div
                v-for="action in service.actions"
                :key="action.id"
                class="flex flex-col gap-2 rounded-lg border border-(--ui-border) bg-(--ui-bg-elevated)/40 p-3 md:flex-row md:items-center md:justify-between"
                >
                <div>
                <p class="font-medium text-(--ui-text)">{{ action.displayName }}</p>
                <p class="text-sm text-muted">{{ action.description }}</p>
                </div>
                <UButton
                size="xs"
                :color="selectedActionId === action.id ? 'primary' : 'neutral'"
                variant="ghost"
                icon="i-lucide-hand-pointer"
                @click="selectAction(action.id)"
                >
                {{ selectedActionId === action.id ? 'Sélectionné' : 'Utiliser' }}
                </UButton>
                </div>
                </div>

                <p v-else class="text-sm text-muted">
                Ce service ne dispose pas encore d’actions configurées.
                </p>
                </div>

                <UDivider />

                <div class="space-y-2">
                <div class="flex items-center gap-2">
                <UBadge color="success" variant="soft">Réactions</UBadge>
                <span class="text-xs text-muted">{{ service.reactions.length }} disponible(s)</span>
                </div>

                <div v-if="service.reactions.length" class="grid gap-2">
                <div
                v-for="reaction in service.reactions"
                :key="reaction.id"
                class="flex flex-col gap-2 rounded-lg border border-(--ui-border) bg-(--ui-bg-elevated)/40 p-3 md:flex-row md:items-center md:justify-between"
                >
                <div>
                <p class="font-medium text-(--ui-text)">{{ reaction.displayName }}</p>
                <p class="text-sm text-muted">{{ reaction.description }}</p>
                </div>
                <UButton
                size="xs"
                :color="selectedReactionId === reaction.id ? 'primary' : 'neutral'"
                variant="ghost"
                icon="i-lucide-hand-pointer"
                @click="selectReaction(reaction.id)"
                >
                {{ selectedReactionId === reaction.id ? 'Sélectionné' : 'Utiliser' }}
                </UButton>
                </div>
                </div>

                <p v-else class="text-sm text-muted">
                Ce service ne dispose pas encore de réactions configurées.
                </p>
                </div>
                </div>
                </section>
                </div>
                </UCard>
              </div>
            </template>
          </UModal>
        </div>

      </div>
    </template>
  </UDashboardPanel>
</template>
