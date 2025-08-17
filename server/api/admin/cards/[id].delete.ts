import prisma from '~/lib/prisma'

export default defineEventHandler(async (event) => {
  const id = Number(getRouterParam(event, 'id'))
  if (!id) throw createError({ statusCode: 400, statusMessage: 'Invalid id' })

  await prisma.gameCard.delete({ where: { id } })
  return { ok: true }
})
