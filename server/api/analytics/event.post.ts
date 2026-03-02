import prisma from '~/lib/prisma'
import { realtimeAnalytics } from '~/server/utils/realtimeAnalytics'
import { recordEvent as recordEventFile } from '~/server/utils/analyticsStore'

function toFileEvent(body: any) {
  return {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    type: (body.type === 'page_view' || body.type === 'game_select' ? body.type : 'activity') as 'page_view' | 'game_select' | 'activity',
    userId: body.userId,
    sessionId: body.sessionId,
    page: body.page,
    game: body.game,
    timestamp: Date.now()
  }
}

export default defineEventHandler(async (event) => {
  const body = await readBody<any>(event)
  if (!body || !body.type) {
    throw createError({ statusCode: 400, statusMessage: 'Missing event type' })
  }

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
    // Keep file store in sync as backup so all-time stats work when DB is down
    recordEventFile(toFileEvent(body)).catch((err) =>
      console.warn('Analytics file backup failed:', err)
    )
    return { success: true }
  } catch (dbError) {
    try {
      await recordEventFile(toFileEvent(body))
      return { success: true }
    } catch (fileError) {
      console.error('Analytics storage failed (DB and file):', fileError)
      throw createError({
        statusCode: 500,
        statusMessage: 'Failed to store analytics event'
      })
    }
  }
})