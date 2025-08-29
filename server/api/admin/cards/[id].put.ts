import prisma from '~/lib/prisma'
import { requireAdmin } from '~/server/utils/adminAuth'

export default defineEventHandler(async (event) => {
  // Require admin authentication
  requireAdmin(event)
  
  const id = Number(getRouterParam(event, 'id'))
  if (!id) throw createError({ statusCode: 400, statusMessage: 'Invalid id' })

  const body = await readBody<{ 
    text?: string
    intensity?: number
    drinkAmount?: string
  }>(event)

  const updated = await prisma.gameCard.update({
    where: { id },
    data: {
      ...(body.text !== undefined ? { text: body.text } : {}),
      ...(body.intensity !== undefined ? { intensity: body.intensity } : {}),
      ...(body.drinkAmount !== undefined ? { drinkAmount: body.drinkAmount } : {}),
    },
  })

  return updated
})
