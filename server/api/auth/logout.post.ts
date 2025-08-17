export default defineEventHandler(async (event) => {
  // Clear the admin token cookie
  setCookie(event, 'admin-token', '', {
    httpOnly: true,
    secure: true, // Always secure for Vercel
    sameSite: 'lax', // More permissive for Vercel
    maxAge: 0, // Expire immediately
    domain: process.env.VERCEL_URL ? undefined : 'localhost'
  })

  return { success: true }
})
