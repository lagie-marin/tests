<script setup lang="ts">
import { useAuthStore } from '~/stores/auth';
import { useDateFormat } from '@vueuse/core';

definePageMeta({ layout: 'app' });

const authStore = useAuthStore();
const today = useDateFormat(new Date(), 'dddd D MMMM YYYY', { locales: 'fr-FR' });

const dashboard = {
    hero: {
        metrics: [
            { icon: 'i-lucide-zap', label: 'Automatisations actifs', value: 0, trend: '+0%' },
            { icon: 'i-lucide-clock', label: 'Exécutions aujourd’hui', value: 0, trend: '+0%' },
            { icon: 'i-lucide-link', label: 'Intégrations connectées', value: 0, trend: '+0%' }
        ]
    },
    actions: [
        {
            icon: 'i-lucide-plus-circle',
            title: 'Créer une automatisation',
            description: 'Débutez une nouvelle automatisation en quelques clics.',
            color: 'primary',
            to: '/app/automations'
        },
        {
            icon: 'i-lucide-box',
            title: 'Mes Services',
            description: 'Connectez et gérez vos services tiers (Slack, Gmail, Notion…).',
            color: 'neutral',
            to: '/app/services'
        },
        {
            icon: 'i-lucide-bar-chart-2',
            title: 'Statistiques',
            description: 'Analysez les performances de vos scénarios.',
            color: 'neutral',
            to: '/stats'
        }
    ],
    recent: [
        {
            icon: 'i-simple-icons-spotify',
            title: 'Ajout automatique du titre écouté à la playlist "Favoris du jour"',
            status: 'Terminé',
            time: 'il y a 5 min',
        },
        {
            icon: 'i-simple-icons-spotify',
            title: 'Sauvegarde du morceau liké dans la bibliothèque Spotify',
            status: 'En cours',
            time: 'il y a 2 min',
        },
        {
            icon: 'i-simple-icons-spotify',
            title: 'Ajout du morceau en lecture à la playlist "Morning Vibes"',
            status: 'Planifié',
            time: 'demain 8h',
        },
        {
            icon: 'i-simple-icons-spotify',
            title: 'Sauvegarde automatique des nouvelles sorties écoutées',
            status: 'Terminé',
            time: 'il y a 1h',
        },
    ]

};
</script>

<template>
    <UDashboardPanel id="home" :ui="{ body: 'lg:py-10' }">
        <!-- HEADER -->
        <template #header>
            <UDashboardNavbar>
                <template #leading>
                    <div class="flex flex-col lg:flex-row lg:items-center gap-2 lg:gap-4">
                        <div class="flex items-center gap-2">
                            <UDashboardSidebarCollapse />
                            <h1 class="text-lg font-semibold text-gray-900 dark:text-white">
                                Bienvenue {{ authStore.user?.firstName || 'utilisateur' }}
                            </h1>
                        </div>
                        <p class="text-sm text-gray-500 dark:text-gray-400">
                            {{ today }} · <span class="text-green-500 font-medium">Systèmes opérationnels</span>
                        </p>
                    </div>
                </template>
            </UDashboardNavbar>
        </template>

        <!-- BODY -->
        <template #body>
            <!-- Aperçu global -->
            <section class="px-6 pt-6">
                <h2 class="text-sm font-semibold uppercase tracking-wide text-gray-500 mb-3">Aperçu global</h2>
                <div class="grid sm:grid-cols-3 gap-4">
                    <UCard
                        v-for="metric in dashboard.hero.metrics"
                        :key="metric.label"
                        class="relative border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm rounded-xl hover:shadow-md transition-all duration-300"
                        :ui="{ body: 'flex flex-col justify-between h-full p-5' }"
                    >
                        <div class="flex items-center gap-3">
                            <span
                                class="flex h-10 w-10 items-center justify-center rounded-full bg-[#00D26A]/10 text-[#00D26A]"
                            >
                                <UIcon :name="metric.icon" class="h-5 w-5" />
                            </span>
                            <div>
                                <p class="text-sm text-gray-500 dark:text-gray-400">{{ metric.label }}</p>
                                <h3 class="text-2xl font-semibold text-gray-900 dark:text-white">
                                    {{ metric.value }}
                                    <span class="text-xs text-gray-500 ml-1">{{ metric.trend }}</span>
                                </h3>
                            </div>
                        </div>
                    </UCard>
                </div>
                <p class="text-xs text-gray-400 text-right mt-2">Dernière mise à jour : {{ today }}</p>
            </section>

            <USeparator :ui="{ border: 'border-gray-200 dark:border-gray-800 my-10' }" />

            <!-- Actions rapides -->
            <section class="px-6">
                <h2 class="text-sm font-semibold uppercase tracking-wide text-gray-500 mb-3">Actions rapides</h2>
                <div class="grid sm:grid-cols-3 gap-5">
                    <UCard
                        v-for="action in dashboard.actions"
                        :key="action.title"
                        class="group border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900/70 shadow-sm rounded-xl transition hover:-translate-y-1 hover:shadow-md"
                        :ui="{ body: 'space-y-2 p-5' }"
                        :to="action.to"
                    >
                        <div class="flex items-center gap-3">
                            <UIcon
                                :name="action.icon"
                                class="h-5 w-5 text-[#00D26A] group-hover:scale-110 transition"
                            />
                            <h3 class="text-base font-semibold text-gray-900 dark:text-white">
                                {{ action.title }}
                            </h3>
                        </div>
                        <p class="text-sm text-gray-500 dark:text-gray-400">{{ action.description }}</p>
                        <UButton
                            :to="action.to"
                            size="sm"
                            icon="i-lucide-arrow-right"
                            trailing
                            :ui="{ color: { primary: 'bg-[#00D26A] text-white hover:bg-[#00B65C]' } }"
                        >
                            Accéder
                        </UButton>
                    </UCard>
                </div>
            </section>

            <USeparator :ui="{ border: 'border-gray-200 dark:border-gray-800 my-10' }" />

            <!-- Dernières automatisations -->
            <section class="px-6">
                <div class="flex items-center justify-between mb-6">
                    <div>
                        <h2 class="text-sm font-semibold uppercase tracking-wide text-gray-500">
                            Dernières automatisations
                        </h2>
                        <p class="text-sm text-gray-500 dark:text-gray-400">
                            Historique de vos exécutions récentes, avec statut et performances.
                        </p>
                    </div>
                    <UButton
                        variant="ghost"
                        color="neutral"
                        size="sm"
                        icon="i-lucide-refresh-cw"
                        label="Actualiser"
                        class="text-gray-500 hover:text-[#00D26A]"
                    />
                </div>

                <UCard
                    class="border border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-gray-900/60 backdrop-blur-sm shadow-sm rounded-xl overflow-hidden"
                >
                    <div
                        class="grid grid-cols-[2fr_1fr_1fr_1fr_0.5fr] text-xs uppercase tracking-wide font-semibold text-gray-500 border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/70 px-6 py-3"
                    >
                        <span>Nom du scénario</span>
                        <span>Source</span>
                        <span>Destination</span>
                        <span>Statut</span>
                        <span class="text-right">Logs</span>
                    </div>

                    <div class="divide-y divide-gray-100 dark:divide-gray-800">
                        <div
                            v-for="item in dashboard.recent"
                            :key="item.title"
                            class="grid grid-cols-[2fr_1fr_1fr_1fr_0.5fr] items-center px-6 py-4 hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-all duration-200"
                        >
                            <!-- Nom + icône -->
                            <div class="flex items-center gap-3">
                                <div
                                    class="flex items-center justify-center h-8 w-8 rounded-full bg-[#00D26A]/10 text-[#00D26A]"
                                >
                                    <UIcon :name="item.icon" class="h-4 w-4" />
                                </div>
                                <div>
                                    <p class="font-medium text-gray-900 dark:text-white">{{ item.title }}</p>
                                    <p class="text-xs text-gray-500 dark:text-gray-400">{{ item.time }}</p>
                                </div>
                            </div>

                            <!-- Source -->
                            <div class="flex items-center gap-2">
                                <UIcon name="i-simple-icons-spotify" class="h-4 w-4 text-gray-400" />
                                <span class="text-sm text-gray-700 dark:text-gray-300">Spotify</span>
                            </div>

                            <!-- Destination -->
                            <div class="flex items-center gap-2">
                                <UIcon name="i-simple-icons-spotify" class="h-4 w-4 text-gray-400" />
                                <span class="text-sm text-gray-700 dark:text-gray-300">Spotify</span>
                            </div>

                            <!-- Statut -->
                            <div class="flex items-center gap-2">
                                <span
                                    class="h-2.5 w-2.5 rounded-full animate-pulse"
                                    :class="{
                                        'bg-green-500': item.status === 'Terminé',
                                        'bg-yellow-400': item.status === 'En cours',
                                        'bg-gray-400': item.status === 'Planifié'
                                    }"
                                ></span>
                                <span class="text-sm text-gray-800 dark:text-gray-200">{{ item.status }}</span>
                            </div>

                            <!-- Logs -->
                            <div class="flex justify-end">
                                <UButton
                                    variant="ghost"
                                    color="neutral"
                                    size="xs"
                                    icon="i-lucide-external-link"
                                    class="text-gray-500 hover:text-[#00D26A]"
                                />
                            </div>
                        </div>
                    </div>

                    <div
                        class="flex items-center justify-between px-6 py-3 text-xs text-gray-400 border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/70"
                    >
                        <span>3 automatisations affichées</span>
                        <span>Dernière mise à jour : il y a 5 min</span>
                    </div>
                </UCard>
            </section>
        </template>
    </UDashboardPanel>
</template>
