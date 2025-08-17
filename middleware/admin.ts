export default defineNuxtRouteMiddleware(async (to) => {
  // Skip middleware on server-side rendering
  if (process.server) return

  try {
    // Check if user is authenticated
    const response = await $fetch('/api/auth/me')
    
    if (!response.user) {
      throw new Error('Not authenticated')
    }
  } catch (error) {
    // Redirect to login page if not authenticated
    return navigateTo('/admin/login')
  }
})
