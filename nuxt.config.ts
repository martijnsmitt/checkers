import { defineNuxtConfig } from 'nuxt'

// https://v3.nuxtjs.org/api/configuration/nuxt.config
export default defineNuxtConfig({
  app: {
    head: {
      viewport: 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no',
      title: 'Checkers'
    }
  },
  serverMiddleware: [
    { path: '/api', handler: '~/api' }
  ],
  typescript: {
    shim: false
  },
  vite: {
    server: {
      watch: {
        ignored: ['**/database.json']
      }
    },
  }
})
