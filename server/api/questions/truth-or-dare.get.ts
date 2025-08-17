import prisma from '~/lib/prisma'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const type = query.type as 'TRUTH' | 'DARE' | undefined
  const intensity = query.intensity ? parseInt(query.intensity as string) : undefined
  const limit = query.limit ? parseInt(query.limit as string) : 50

  try {
    const where: any = {
      gameType: 'TRUTH_OR_DARE',
      isCustom: false
    }

    if (type) {
      where.type = type
    }

    if (intensity) {
      where.intensity = { lte: intensity }
    }

    const questions = await prisma.gameCard.findMany({
      where,
      select: {
        id: true,
        type: true,
        text: true,
        intensity: true
      },
      orderBy: {
        timesUsed: 'asc' // Prefer less used questions
      },
      take: limit
    })

    return {
      questions: questions.map(q => ({
        id: q.id,
        type: q.type,
        text: q.text,
        intensity: q.intensity
      }))
    }
  } catch (error) {
    console.error('Error fetching truth or dare questions:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch questions'
    })
  } finally {
    await prisma.$disconnect()
  }
})
