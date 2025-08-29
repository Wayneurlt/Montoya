import prisma from '~/lib/prisma'
import { requireAdmin } from '~/server/utils/adminAuth'

export default defineEventHandler(async (event) => {
  // Require admin authentication
  requireAdmin(event)
  
  const query = getQuery(event)
  const gameType = query.gameType as string | undefined
  const search = query.search as string | undefined
  const intensity = query.intensity as string | undefined
  const status = query.status as string | undefined
  const page = Number(query.page ?? 1)
  const pageSize = Number(query.pageSize ?? 25)

  try {
    let allQuestions: any[] = []

    // Build where conditions for group questions
    const groupWhereConditions: any = {}
    if (gameType && ['NEVER_HAVE_I_EVER', 'MOST_LIKELY_TO', 'WOULD_YOU_RATHER'].includes(gameType)) {
      groupWhereConditions.gameType = gameType as any
    }
    if (search) {
      groupWhereConditions.text = { contains: search, mode: 'insensitive' }
    }
    if (intensity) {
      groupWhereConditions.intensity = parseInt(intensity)
    }
    if (status) {
      groupWhereConditions.isActive = status === 'active'
    }

    // Get Group Game Questions
    const groupQuestions = await prisma.groupGameQuestion.findMany({
      where: groupWhereConditions,
      orderBy: { id: 'desc' }
    })

    // Transform group questions
    const transformedGroupQuestions = groupQuestions.map(q => ({
      id: q.id,
      type: 'Group Question',
      gameType: q.gameType,
      text: q.text,
      intensity: q.intensity,
      drinkAmount: null,
      isActive: q.isActive,
      timesUsed: q.timesUsed,
      lastUsed: q.lastUsed,
      source: 'group'
    }))

    allQuestions.push(...transformedGroupQuestions)

    // Build where conditions for game cards
    const cardWhereConditions: any = {}
    if (gameType && ['TRUTH_OR_DARE', 'DO_OR_DRINK', 'DICE_OF_DESIRE'].includes(gameType)) {
      cardWhereConditions.gameType = gameType as any
    }
    if (search) {
      cardWhereConditions.text = { contains: search, mode: 'insensitive' }
    }
    if (intensity) {
      cardWhereConditions.intensity = parseInt(intensity)
    }

    // Get Game Cards
    const gameCards = await prisma.gameCard.findMany({
      where: cardWhereConditions,
      orderBy: { id: 'desc' }
    })

    // Transform game cards
    const transformedGameCards = gameCards.map(card => ({
      id: card.id,
      type: card.type,
      gameType: card.gameType,
      text: card.text,
      intensity: card.intensity,
      drinkAmount: card.drinkAmount,
      isActive: true, // Game cards don't have isActive field
      timesUsed: card.timesUsed,
      lastUsed: card.lastUsed,
      source: 'cards'
    }))

    allQuestions.push(...transformedGameCards)

    // Apply pagination
    const startIndex = (page - 1) * pageSize
    const endIndex = startIndex + pageSize
    const paginatedQuestions = allQuestions.slice(startIndex, endIndex)

    return {
      items: paginatedQuestions,
      total: allQuestions.length,
      page,
      pageSize,
      totalPages: Math.ceil(allQuestions.length / pageSize)
    }
  } catch (error) {
    console.error('Error fetching all questions:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch questions'
    })
  } finally {
    await prisma.$disconnect()
  }
})
