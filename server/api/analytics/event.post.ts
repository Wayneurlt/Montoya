import prisma from '~/lib/prisma'

export default defineEventHandler(async (event) => {
  const body = await readBody<any>(event)
  if (!body || !body.type) {
    throw createError({ statusCode: 400, statusMessage: 'Missing event type' })
  }

  try {
    // Store analytics event in database
    await prisma.analytics.create({
      data: {
        eventType: body.type,
        userId: body.userId || null,
        sessionId: body.sessionId || null,
        page: body.page || null,
        game: body.game || null,
        data: body.data ? JSON.stringify(body.data) : null
      }
    })
    
    return { success: true }
  } catch (error) {
    console.error('Error storing analytics event:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to store analytics event'
    })
  }
})