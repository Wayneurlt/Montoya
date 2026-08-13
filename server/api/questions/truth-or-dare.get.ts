import prisma from '~/lib/prisma'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const type = query.type as 'TRUTH' | 'DARE' | undefined
  // High default so a caller that omits `limit` still gets the whole pool
  // (avoids the client-side no-repeat tracker running out early and cycling).
  const limit = query.limit ? parseInt(query.limit as string) : 1000

  try {
    const where: any = {
      gameType: 'TRUTH_OR_DARE'
      // Removed isCustom filter to include all questions
    }

    if (type) {
      where.type = type
    }

    // Removed intensity filtering - get all questions regardless of intensity

    console.log('🔍 Truth or Dare query where:', JSON.stringify(where, null, 2))

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

    console.log(`📊 Found ${questions.length} questions for type: ${type || 'ALL'}`)

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
  }
})
