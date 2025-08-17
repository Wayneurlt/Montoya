import prisma from '~/lib/prisma'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const intensity = query.intensity ? parseInt(query.intensity as string) : undefined
  const limit = query.limit ? parseInt(query.limit as string) : 50

  try {
    const where: any = {
      gameType: 'DO_OR_DRINK',
      type: 'DO',
      isCustom: false
    }

    if (intensity) {
      where.intensity = { lte: intensity }
    }

    const questions = await prisma.gameCard.findMany({
      where,
      select: {
        id: true,
        text: true,
        intensity: true,
        drinkAmount: true
      },
      orderBy: {
        timesUsed: 'asc' // Prefer less used questions
      },
      take: limit
    })

    return {
      questions: questions.map(q => ({
        id: q.id,
        text: q.text,
        intensity: q.intensity,
        drinkAmount: q.drinkAmount
      }))
    }
  } catch (error) {
    console.error('Error fetching do or drink questions:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch questions'
    })
  }
})
