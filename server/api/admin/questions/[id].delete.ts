import prisma from '~/lib/prisma'
import { requireAdmin } from '~/server/utils/adminAuth'

export default defineEventHandler(async (event) => {
  // Require admin authentication
  requireAdmin(event)
  
  const id = Number(getRouterParam(event, 'id'))
  if (!id) throw createError({ statusCode: 400, statusMessage: 'Invalid id' })

  await prisma.groupGameQuestion.delete({ where: { id } })
  return { ok: true }
})


