import prisma from '~/lib/prisma'

export default defineEventHandler(async (event) => {
  try {
    // Get IP address from request headers (optional)
    // Try to get from various headers that might contain the IP
    let ipAddress: string | null = null
    try {
      // Try to get from X-Forwarded-For header (common in proxies)
      const forwardedFor = getHeader(event, 'x-forwarded-for')
      if (forwardedFor) {
        // X-Forwarded-For can contain multiple IPs, take the first one
        ipAddress = forwardedFor.split(',')[0].trim()
      } else {
        // Try X-Real-IP header
        const realIp = getHeader(event, 'x-real-ip')
        if (realIp) {
          ipAddress = realIp
        } else {
          // Try CF-Connecting-IP (Cloudflare)
          const cfIp = getHeader(event, 'cf-connecting-ip')
          if (cfIp) {
            ipAddress = cfIp
          }
        }
      }
    } catch (ipError) {
      // IP address is optional, so we just continue without it
      console.log('Could not extract IP address:', ipError)
    }
    
    // Get user agent from request body or headers
    const body = await readBody(event).catch(() => ({}))
    const userAgent = body.userAgent || getHeader(event, 'user-agent') || null

    // Create age confirmation record
    const confirmation = await prisma.ageConfirmation.create({
      data: {
        ipAddress,
        userAgent
      }
    })

    return {
      success: true,
      id: confirmation.id
    }
  } catch (error: any) {
    console.error('Error creating age confirmation:', error)
    console.error('Error details:', {
      message: error?.message,
      code: error?.code,
      meta: error?.meta
    })
    throw createError({
      statusCode: 500,
      statusMessage: error?.message || 'Failed to record age confirmation'
    })
  }
})

