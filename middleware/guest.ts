export default defineNuxtRouteMiddleware(async () => {
  try {
    // useRequestFetch forwards the incoming request's cookies during SSR,
    // which plain $fetch does not do automatically.
    const response = process.server
      ? await useRequestFetch()('/api/auth/me')
      : await $fetch('/api/auth/me')

    if (response?.user) {
      // Redirect to admin dashboard if already logged in
      return navigateTo('/admin')
    }
  } catch (error) {
    // User is not authenticated, allow access to login page
  }
})
