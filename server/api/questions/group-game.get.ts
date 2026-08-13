import prisma from '~/lib/prisma'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const gameType = query.gameType as 'NEVER_HAVE_I_EVER' | 'MOST_LIKELY_TO' | 'WOULD_YOU_RATHER'
  // High default so a caller that omits `limit` still gets the whole pool
  // (avoids the client-side no-repeat tracker running out early and cycling).
  const limit = query.limit ? parseInt(query.limit as string) : 1000

  if (!gameType) {
    throw createError({
      statusCode: 400,
      statusMessage: 'gameType is required'
    })
  }

  try {
    const where: any = {
      gameType,
      isActive: true  // Only get active questions
    }

    // Removed intensity filtering - get all questions regardless of intensity

    console.log(`🔍 Group Game query for ${gameType}:`, JSON.stringify(where, null, 2))

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

    console.log(`📊 Found ${questions.length} questions for ${gameType}`)
    if (questions.length === 0) {
      console.warn(`⚠️ No questions found in database for ${gameType}`)
    }

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
