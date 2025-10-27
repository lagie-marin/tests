// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  css: ['~/assets/css/main.css'],

  modules: [
    '@nuxt/content',
    '@nuxt/eslint',
    '@nuxt/image',
    '@nuxt/scripts',
    '@nuxt/test-utils',
    '@nuxt/ui',
    '@pinia/nuxt'
  ],

  routeRules: {
    '/': { prerender: true },
    '/app/**': { ssr: false }
  },

  runtimeConfig: {
    apiBaseUrl: process.env.NUXT_API_BASE_URL || '',
    public: {
      apiBaseUrl: process.env.NUXT_PUBLIC_API_BASE_URL || process.env.NUXT_API_BASE_URL || ''
    }
  },

  devServer: {
    host: '0.0.0.0'
  },

  vite: {
    server: {
      hmr: {
        protocol: 'ws',
        timeout: 30000,
        overlay: false
      },
      watch: {
        usePolling: false,
        interval: 100,
        ignored: ['**/node_modules/**', '**/.output/**', '**/dist/**', '**/.nuxt/**']
      }
    },
    optimizeDeps: {
      include: ['vue', 'pinia']
    }
  },

  sourcemap: {
    server: true,
    client: true
  },

  nitro: {
    compressPublicAssets: true,
    prerender: {
      crawlLinks: true
    }
  }
})