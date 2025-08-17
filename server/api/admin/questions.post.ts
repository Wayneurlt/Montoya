import prisma from '~/lib/prisma'
import { requireAdmin } from '~/server/utils/adminAuth'

export default defineEventHandler(async (event) => {
  // Require admin authentication
  requireAdmin(event)
  const body = await readBody<{
    gameType: 'NEVER_HAVE_I_EVER' | 'MOST_LIKELY_TO' | 'WOULD_YOU_RATHER'
    text: string
    intensity?: number
    isActive?: boolean
  }>(event)

  if (!body?.text || !body?.gameType) {
    throw createError({ statusCode: 400, statusMessage: 'Missing required fields' })
  }

  const created = await prisma.groupGameQuestion.create({
    data: {
      gameType: body.gameType as any,
      text: body.text,
      intensity: body.intensity ?? 1,
      isActive: body.isActive ?? true,
    },
  })

  return created
})


