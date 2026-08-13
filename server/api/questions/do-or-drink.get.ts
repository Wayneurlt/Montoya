import prisma from '~/lib/prisma'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  // High default so a caller that omits `limit` still gets the whole pool
  // (avoids the client-side no-repeat tracker running out early and cycling).
  const limit = query.limit ? parseInt(query.limit as string) : 1000

  try {
    const where: any = {
      gameType: 'DO_OR_DRINK',
      type: 'DO'
    }

    // Removed intensity filtering - get all questions regardless of intensity

    console.log('🔍 Do or Drink query where:', JSON.stringify(where, null, 2))

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

    console.log(`📊 Found ${questions.length} Do or Drink questions`)
    if (questions.length > 0) {
      console.log('Sample question:', questions[0])
    } else {
      console.warn('⚠️ No questions found in database for DO_OR_DRINK')
    }

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
