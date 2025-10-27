<script setup lang="ts">
import {useAuthStore} from "~/stores/auth";

const route = useRoute()

const authStore = useAuthStore()

const items = computed(() => [
  { label: 'Produits', to: '#produits' },
  { label: 'Tarifs', to: '#tarifs' },
  { label: 'Docs', to: '#docs' },
  { label: 'Contact', to: '#contact' }
])
</script>

<template>
  <UHeader>
    <template #left>
      <NuxtLink to="/">
        <Logo class="w-auto h-6 shrink-0" />
      </NuxtLink>
    </template>

    <div class="flex items-center gap-4">
      <UNavigationMenu
          :items="items"
          variant="link"
      />
    </div>

    <template #right>
      <UColorModeButton />

      <template v-if="!authStore.isAuthenticated">
        <UButton
            icon="i-lucide-log-in"
            color="neutral"
            variant="ghost"
            to="/auth/login"
            class="lg:hidden"
        />

        <UButton
            label="Connexion"
            color="neutral"
            variant="outline"
            to="/auth/login"
            class="hidden lg:inline-flex"
        />

        <UButton
            label="Créer un compte"
            color="neutral"
            trailing-icon="i-lucide-arrow-right"
            class="hidden lg:inline-flex"
            to="/auth/register"
        />
      </template>
      <template v-else>
        <UButton
            icon="i-lucide-log-out"
            variant="ghost"
            color="error"
            @click="authStore.logout()"
        />
        <UAvatar :alt="`${authStore.user?.firstName} ${authStore.user?.lastName}`" size="md" />
      </template>
    </template>

    <template #body>
      <UNavigationMenu
          :items="items"
          orientation="vertical"
          class="-mx-2.5"
      />

      <USeparator class="my-6" />

      <template v-if="!authStore.isAuthenticated">
        <UButton
            label="Connexion"
            color="neutral"
            variant="subtle"
            to="/auth/login"
            block
            class="mb-3"
        />
        <UButton
            label="Créer un compte"
            color="neutral"
            to="/auth/register"
            block
        />
      </template>
      <template v-else>
        <UButton
            icon="i-lucide-log-out"
            variant="ghost"
            color="error"
            @click="authStore.logout()"
        />
        <UAvatar :alt="`${authStore.user?.firstName} ${authStore.user?.lastName}`" size="md" />
      </template>
    </template>
  </UHeader>
</template>
