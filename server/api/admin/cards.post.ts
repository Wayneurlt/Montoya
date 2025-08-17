import prisma from '~/lib/prisma'
import { requireAdmin } from '~/server/utils/adminAuth'

export default defineEventHandler(async (event) => {
  // Require admin authentication
  requireAdmin(event)
  const body = await readBody<{
    type: 'TRUTH' | 'DARE' | 'DO'
    gameType: 'TRUTH_OR_DARE' | 'DO_OR_DRINK' | 'DICE_OF_DESIRE'
    text: string
    intensity?: number
    drinkAmount?: string
  }>(event)

  if (!body?.text || !body?.gameType || !body?.type) {
    throw createError({ statusCode: 400, statusMessage: 'Missing required fields' })
  }

  const created = await prisma.gameCard.create({
    data: {
      type: body.type as any,
      gameType: body.gameType as any,
      text: body.text,
      intensity: body.intensity ?? 1,
      drinkAmount: body.drinkAmount ?? null,
    },
  })

  return created
})
