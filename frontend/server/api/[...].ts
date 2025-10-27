import { joinURL } from 'ufo'

export default defineEventHandler(async (event) => {
  const { apiBaseUrl } = useRuntimeConfig()

  if (event.path === '/api/auth/google/redirect') {
    return sendRedirect(event, joinURL(apiBaseUrl, '/api/auth/google/redirect'), 302)
  }

  const target = joinURL(apiBaseUrl, event.path)

  return proxyRequest(event, target)
})
