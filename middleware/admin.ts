export default defineNuxtRouteMiddleware(async () => {
  try {
    // useRequestFetch forwards the incoming request's cookies during SSR,
    // which plain $fetch does not do automatically.
    const response = process.server
      ? await useRequestFetch()('/api/auth/me')
      : await $fetch('/api/auth/me')

    if (!response?.user) {
      throw new Error('Not authenticated')
    }
  } catch (error) {
    return navigateTo('/admin/login')
  }
})
