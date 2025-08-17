import prisma from '~/lib/prisma'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const gameType = query.gameType as 'NEVER_HAVE_I_EVER' | 'MOST_LIKELY_TO' | 'WOULD_YOU_RATHER'
  const intensity = query.intensity ? parseInt(query.intensity as string) : undefined
  const limit = query.limit ? parseInt(query.limit as string) : 50

  if (!gameType) {
    throw createError({
      statusCode: 400,
      statusMessage: 'gameType is required'
    })
  }

  try {
    const where: any = {
      gameType,
      isActive: true
    }

    if (intensity) {
      where.intensity = { lte: intensity }
    }

    const questions = await prisma.groupGameQuestion.findMany({
      where,
      select: {
        id: true,
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
        text: q.text,
        intensity: q.intensity
      }))
    }
  } catch (error) {
    console.error('Error fetching group game questions:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch questions'
    })
  }
})
