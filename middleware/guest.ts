export default defineNuxtRouteMiddleware(async () => {
  // Skip middleware on server-side rendering
  if (process.server) return

  try {
    // Check if user is already authenticated
    const response = await $fetch('/api/auth/me')
    
    if (response.user) {
      // Redirect to admin dashboard if already logged in
      return navigateTo('/admin')
    }
  } catch (error) {
    // User is not authenticated, allow access to login page
  }
})
