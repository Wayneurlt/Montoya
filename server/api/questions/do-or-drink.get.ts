import prisma from '~/lib/prisma'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const intensity = query.intensity ? parseInt(query.intensity as string) : undefined
  const limit = query.limit ? parseInt(query.limit as string) : 50

  try {
    const where: any = {
      gameType: 'DO_OR_DRINK',
      type: 'DO'
      // Removed isCustom: false filter to see all questions
    }

    if (intensity) {
      where.intensity = { lte: intensity }
    }

    console.log('🔍 Database query where clause:', JSON.stringify(where, null, 2))

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

    console.log('Database query result:', questions.length, 'questions found')
    console.log('Sample question:', questions[0])

    return {
      questions: questions.map(q => q.text)
    }
  } catch (error) {
    console.error('Error fetching do or drink questions:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch questions'
    })
  } finally {
    await prisma.$disconnect()
  }
})
