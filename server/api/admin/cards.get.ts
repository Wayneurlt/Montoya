import prisma from '~/lib/prisma'
import { requireAdmin } from '~/server/utils/adminAuth'

export default defineEventHandler(async (event) => {
  // Require admin authentication
  requireAdmin(event)
  const query = getQuery(event)
  const gameType = query.gameType as string | undefined
  const cardType = query.cardType as string | undefined
  const search = query.search as string | undefined
  const page = Number(query.page ?? 1)
  const pageSize = Number(query.pageSize ?? 25)

  const where: any = {}
  if (gameType) where.gameType = gameType as any
  if (cardType) where.type = cardType as any
  if (search) where.text = { contains: String(search), mode: 'insensitive' }

  const [items, total] = await Promise.all([
    prisma.gameCard.findMany({
      where,
      orderBy: { id: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.gameCard.count({ where }),
  ])

  return { items, total, page, pageSize }
})
