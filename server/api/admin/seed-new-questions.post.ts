import { requireAdmin } from '~/server/utils/adminAuth'
import { runComfortLevelSeed } from '~/server/utils/comfortLevelSeed'

export default defineEventHandler(async (event) => {
  requireAdmin(event)

  try {
    const result = await runComfortLevelSeed()
    return {
      success: true,
      ...result,
      message: `Successfully seeded ${result.total} questions with comfort level mapping`
    }
  } catch (error) {
    console.error('Seeding failed:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to seed database'
    })
  }
})
