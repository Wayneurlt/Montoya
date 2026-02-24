import prisma from '~/lib/prisma'
import { realtimeAnalytics } from '~/server/utils/realtimeAnalytics'
import { recordEvent as recordEventFile } from '~/server/utils/analyticsStore'

export default defineEventHandler(async (event) => {
  const body = await readBody<any>(event)
  if (!body || !body.type) {
    throw createError({ statusCode: 400, statusMessage: 'Missing event type' })
  }

  // Record in real-time store so active user counts include single-device / API-only users
  if (body.type === 'page_view' && (body.sessionId || body.userId)) {
    realtimeAnalytics.recordApiActivity(body.sessionId || body.userId, body.page)
  }

  try {
    await prisma.analytics.create({
      data: {
        eventType: body.type,
        userId: body.userId ?? null,
        sessionId: body.sessionId ?? null,
        page: body.page ?? null,
        game: body.game ?? null,
        data: body.data ? JSON.stringify(body.data) : null
      }
    })
    return { success: true }
  } catch (dbError) {
    console.error('Analytics DB error, falling back to file store:', dbError)
    try {
      await recordEventFile({
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
        type: body.type as 'page_view' | 'game_select' | 'activity',
        userId: body.userId,
        sessionId: body.sessionId,
        page: body.page,
        game: body.game,
        timestamp: Date.now()
      })
      return { success: true }
    } catch (fileError) {
      console.error('Analytics file store also failed:', fileError)
      throw createError({
        statusCode: 500,
        statusMessage: 'Failed to store analytics event'
      })
    }
  }
})