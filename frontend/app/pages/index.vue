<script setup lang="ts">
const page = {
  hero: {
    tagline: 'Automatisez sans effort',
    title: 'Connectez vos applications et créez des scénarios AREA puissants',
    description:
      'Déclenchez des automatisations fiables entre toutes vos plateformes en quelques minutes seulement.',
    links: [
      { label: 'Commencer gratuitement', color: 'primary', size: 'lg', to: '#produits', trailingIcon: 'i-lucide-arrow-right' },
      { label: 'Voir la démo', variant: 'outline', color: 'primary', size: 'lg', to: '#contact', icon: 'i-lucide-presentation' }
    ],
    metrics: [
      { icon: 'i-lucide-zap', label: 'Synchronisation CRM → Slack', status: 'Actif' },
      { icon: 'i-lucide-mail', label: 'Relance automatique campagnes', status: 'En cours' },
      { icon: 'i-lucide-database', label: 'Sauvegarde quotidienne', status: 'Planifiée' }
    ]
  },
  steps: {
    id: 'produits',
    title: 'Comment ça marche',
    description: 'Construisez vos flux AREA en quelques étapes simples et visualisez chaque automatisation.',
    features: [
      {
        icon: 'i-lucide-bolt',
        title: 'Choisissez un déclencheur',
        description: 'Sélectionnez l’application et l’évènement qui démarrera votre scénario AREA.'
      },
      {
        icon: 'i-lucide-layers',
        title: 'Définissez vos actions',
        description: 'Ajoutez plusieurs actions et conditions pour automatiser vos processus métiers.'
      },
      {
        icon: 'i-lucide-activity',
        title: 'Supervisez en temps réel',
        description: 'Visualisez l’exécution de vos automatisations et optimisez-les en quelques clics.'
      }
    ]
  },
  examples: {
    id: 'docs',
    title: 'Exemples d’AREA',
    description:
      'Inspirez-vous de scénarios prêts à l’emploi pour démarrer rapidement vos automatisations.',
    items: [
      {
        label: 'Notification Slack après un nouveau ticket',
        icon: 'i-lucide-bell',
        content:
          'Dès qu’un ticket est créé dans votre outil de support, un message contextualisé est posté dans le canal Slack approprié.'
      },
      {
        label: 'Synchronisation CRM et facturation',
        icon: 'i-lucide-repeat',
        content:
          'Mettez à jour automatiquement vos clients et opportunités entre le CRM et votre logiciel de facturation.'
      },
      {
        label: 'Relance client intelligente',
        icon: 'i-lucide-clock',
        content:
          'Programmez une relance multi-canal si aucune réponse n’est reçue 48h après l’envoi d’un devis.'
      }
    ]
  },
  pricing: {
    id: 'tarifs',
    title: 'Tarifs flexibles',
    description: 'Choisissez le plan qui correspond à votre maturité d’automatisation.',
    plans: [
      {
        title: 'Starter',
        description: 'Idéal pour découvrir les automatisations AREA.',
        price: 'Gratuit',
        highlight: false,
        features: ['5 scénarios actifs', 'Délais de vérification de 15 min', 'Support communautaire'],
        button: { label: 'Choisir ce plan', color: 'neutral', variant: 'outline' }
      },
      {
        title: 'Pro',
        description: 'Pour les équipes qui automatisent leurs processus quotidiens.',
        price: '4200€ / mois',
        highlight: true,
        features: ['Scénarios illimités', 'Délais de vérification de 5 min', 'Connecteurs premium inclus'],
        button: { label: 'Choisir ce plan', color: 'primary' }
      },
      {
        title: 'Entreprise',
        description: 'Accompagnement complet et SLA renforcé.',
        price: 'Sur devis',
        highlight: false,
        features: ['Déploiement dédié', 'Gestion des accès avancée', 'Support prioritaire 24/7'],
        button: { label: 'Choisir ce plan', color: 'neutral', variant: 'outline' }
      }
    ]
  },
  cta: {
    id: 'contact',
    title: 'Besoin d’un accompagnement sur mesure ?',
    description: 'Notre équipe vous aide à concevoir vos scénarios AREA les plus complexes.',
    links: [
      { label: 'Contacter le support', color: 'primary', size: 'lg', trailingIcon: 'i-lucide-mail' },
      { label: 'Planifier une démo', variant: 'outline', color: 'primary', size: 'lg', icon: 'i-lucide-calendar' }
    ]
  }
}

useSeoMeta({
  title: 'AREA — Automatisez vos scénarios',
  description: 'Concevez, orchestrez et surveillez vos automatisations AREA en toute simplicité.',
  ogTitle: 'AREA — Automatisez vos scénarios',
  ogDescription: 'Concevez, orchestrez et surveillez vos automatisations AREA en toute simplicité.'
})
</script>

<template>
  <div v-if="page">
    <UPageHero
      id="hero"
      :description="page.hero.description"
      :links="page.hero.links"
      :ui="{
        container: 'relative pt-12',
        title: 'max-w-3xl mx-auto text-center lg:text-left text-4xl font-bold tracking-tight sm:text-5xl',
        description: 'max-w-2xl mx-auto text-center text-lg text-muted-700 dark:text-muted-200 lg:mx-0 lg:text-left'
      }"
      orientation="horizontal"
    >
      <template #headline>
        <UBadge color="primary" variant="soft" icon="i-lucide-rocket" class="uppercase tracking-wide">
          {{ page.hero.tagline }}
        </UBadge>
      </template>
      <template #title>
        {{ page.hero.title }}
      </template>
      <template #default>
        <UCard
          class="border-0 bg-gradient-to-br from-primary-500 via-primary-400 to-primary-600 text-white shadow-xl"
          :ui="{ body: 'space-y-4' }"
        >
          <h2 class="text-2xl font-semibold">Vos automatisations en un clin d’œil</h2>
          <p class="text-sm text-primary-50/80">
            Suivez l’exécution de vos scénarios, les derniers déclencheurs et les métriques clés directement depuis votre tableau de bord.
          </p>
          <div class="space-y-3">
            <div
              v-for="metric in page.hero.metrics"
              :key="metric.label"
              class="flex items-center justify-between rounded-lg bg-white/10 px-4 py-3 backdrop-blur"
            >
              <div class="flex items-center gap-3">
                <UIcon :name="metric.icon" class="h-5 w-5" />
                <span class="text-sm font-medium">{{ metric.label }}</span>
              </div>
              <span class="text-xs uppercase tracking-wide text-primary-50/70">{{ metric.status }}</span>
            </div>
          </div>
        </UCard>
      </template>
    </UPageHero>

    <USeparator :ui="{ border: 'border-primary/20 dark:border-primary/30' }" />

    <UPageSection
      :id="page.steps.id"
      :title="page.steps.title"
      :description="page.steps.description"
      class="relative"
    >
      <template #features>
        <UPageCard
          v-for="feature in page.steps.features"
          :key="feature.title"
          variant="subtle"
        >
          <template #title>
            <div class="flex items-center gap-3">
              <span class="flex size-12 items-center justify-center rounded-full bg-primary-100 text-primary-600 dark:bg-primary-900/60 dark:text-primary-300">
                <UIcon :name="feature.icon" class="h-6 w-6" />
              </span>
              <span class="text-lg font-semibold">{{ feature.title }}</span>
            </div>
          </template>
          <span class="text-sm text-muted-700 dark:text-muted-200">
            {{ feature.description }}
          </span>
        </UPageCard>
      </template>
    </UPageSection>

    <USeparator :ui="{ border: 'border-gray-200 dark:border-gray-800' }" />

    <UPageSection
      :id="page.examples.id"
      :title="page.examples.title"
      :description="page.examples.description"
    >
      <UCard class="mx-auto">
        <UAccordion :items="page.examples.items" class="w-xl" multiple />
      </UCard>
    </UPageSection>

    <USeparator :ui="{ border: 'border-primary/20 dark:border-primary/30' }" />

    <UPageSection
      :id="page.pricing.id"
      :title="page.pricing.title"
      :description="page.pricing.description"
    >
      <UPricingPlans>
        <UPricingPlan
          v-for="plan in page.pricing.plans"
          :key="plan.title"
          :title="plan.title"
          :description="plan.description"
          :price="plan.price"
          :highlight="plan.highlight"
          :features="plan.features"
          :button="plan.button"
          variant="soft"
          :scale="plan.highlight"
        />
      </UPricingPlans>
    </UPageSection>

    <USeparator :ui="{ border: 'border-gray-200 dark:border-gray-800' }" />

    <UPageCTA
      :id="page.cta.id"
      :title="page.cta.title"
      :description="page.cta.description"
      :links="page.cta.links"
      variant="naked"
      class="relative overflow-hidden"
      :ui="{
        container: 'max-w-4xl mx-auto text-center',
        title: 'text-3xl font-semibold',
        description: 'text-lg text-muted-700 dark:text-muted-200'
      }"
    >
      <template #title>
        {{ page.cta.title }}
      </template>
    </UPageCTA>
  </div>
</template>
