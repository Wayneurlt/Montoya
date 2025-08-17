import prisma from '~/lib/prisma'
import { requireAdmin } from '~/server/utils/adminAuth'

export default defineEventHandler(async (event) => {
  // Require admin authentication
  requireAdmin(event)
  
  const query = getQuery(event)
  const gameType = query.gameType as string | undefined
  const search = query.search as string | undefined
  const page = Number(query.page ?? 1)
  const pageSize = Number(query.pageSize ?? 25)

  try {
    let allQuestions: any[] = []

    // Get Group Game Questions
    const groupQuestions = await prisma.groupGameQuestion.findMany({
      where: {
        ...(gameType && ['NEVER_HAVE_I_EVER', 'MOST_LIKELY_TO', 'WOULD_YOU_RATHER'].includes(gameType) ? { gameType: gameType as any } : {}),
        ...(search ? { text: { contains: search, mode: 'insensitive' } } : {})
      },
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
      source: 'group'
    }))

    allQuestions.push(...transformedGroupQuestions)

    // Get Game Cards
    const gameCards = await prisma.gameCard.findMany({
      where: {
        ...(gameType && ['TRUTH_OR_DARE', 'DO_OR_DRINK', 'DICE_OF_DESIRE'].includes(gameType) ? { gameType: gameType as any } : {}),
        ...(search ? { text: { contains: search, mode: 'insensitive' } } : {})
      },
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
      pageSize
    }
  } catch (error) {
    console.error('Error fetching all questions:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch questions'
    })
  }
})
