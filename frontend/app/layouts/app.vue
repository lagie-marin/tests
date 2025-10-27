<script setup lang="ts">
import { useAuthStore } from '~/stores/auth'

const authStore = useAuthStore()

const route = useRoute()
const toast = useToast()

const open = ref(false)

const links = computed(() => {
  const primary = [{
    label: 'Accueil',
    icon: 'i-lucide-house',
    to: '/app/'
  }, {
    label: 'Services',
    icon: 'i-lucide-box',
    to: '/app/services'
  }, {
    label: 'Automatisations',
    icon: 'i-lucide-workflow',
    to: '/app/automations'
  }]

  if (authStore.isAdmin) {
    (primary as any[]).unshift({
      label: 'Administration',
      icon: 'i-lucide-shield-check',
      to: '/admin',
      badge: 'ADMIN',
      onSelect: () => {
        open.value = false
      }
    })
  }

  return [primary, [{
  label: 'Politique de confidentialité',
  icon: 'i-lucide-shield-check',
  to: '/privacy',
  target: '_blank'
}, {
  label: 'Conditions générales d’utilisation',
  icon: 'i-lucide-file-text',
  to: '/terms',
  target: '_blank'
}, {
  label: 'Mentions légales',
  icon: 'i-lucide-scale',
  to: '/legal-notice',
  target: '_blank'
}, {
  label: 'Support et aide',
  icon: 'i-lucide-info',
  to: 'mailto:contact@finvio.fr'
  }]]
})

const groups = computed(() => [{
  id: 'links',
  label: 'Go to',
  items: links.value.flat()
}, {
  id: 'code',
  label: 'Code',
  items: [{
    id: 'source',
    label: 'View page source',
    icon: 'i-simple-icons-github',
    to: `https://github.com/nuxt-ui-pro/dashboard/blob/main/app/pages${route.path === '/' ? '/index' : route.path}.vue`,
    target: '_blank'
  }]
}])

onMounted(async () => {
  const cookie = useCookie('cookie-consent')
  if (cookie.value === 'accepted') {
    return
  }

  toast.add({
    title: 'Nous utilisons des cookies pour améliorer votre expérience sur notre site.',
    duration: 0,
    close: false,
    actions: [{
      label: 'Accepter',
      color: 'neutral',
      variant: 'outline',
      onClick: () => {
        cookie.value = 'accepted'
      }
    }, {
      label: 'Refuser',
      color: 'neutral',
      variant: 'ghost'
    }]
  })
})
</script>

<template>
  <UDashboardGroup unit="rem">
    <UDashboardSidebar
      id="default"
      v-model:open="open"
      collapsible
      resizable
      class="bg-(--ui-bg-elevated)/25"
      :ui="{ footer: 'lg:border-t lg:border-(--ui-border)' }"
    >
      <template #header="{ collapsed }">
        <h1 class="flex items-center gap-2 text-2xl font-bold text-(--ui-text)">
          <Logo :collapsed="collapsed" class="h-5 w-auto shrink-0" />
        </h1>
      </template>

      <template #default="{ collapsed }">
        <UDashboardSearchButton :collapsed="collapsed" class="bg-transparent ring-(--ui-border)" />

        <UNavigationMenu
          :collapsed="collapsed"
          :items="links[0]"
          orientation="vertical"
        />

        <UNavigationMenu
          :collapsed="collapsed"
          :items="links[1]"
          orientation="vertical"
          class="mt-auto"
        />
      </template>

      <template #footer="{ collapsed }">
        <UserMenu :collapsed="collapsed" />
      </template>
    </UDashboardSidebar>

    <UDashboardSearch :groups="groups" />

    <slot v-if="authStore.isAuthenticated" />

    <NotificationsSlideover />
  </UDashboardGroup>
</template>
