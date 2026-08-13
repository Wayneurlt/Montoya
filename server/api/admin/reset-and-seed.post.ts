import prisma from '~/lib/prisma'
import { requireAdmin } from '~/server/utils/adminAuth'
import { runComfortLevelSeed } from '~/server/utils/comfortLevelSeed'

export default defineEventHandler(async (event) => {
  requireAdmin(event)

  try {
    await prisma.sessionGroupQuestionUsage.deleteMany()
    await prisma.sessionCardUsage.deleteMany()
    await prisma.gameHistory.deleteMany()
    await prisma.groupGameQuestion.deleteMany()
    await prisma.gameCard.deleteMany()

    const seedResult = await runComfortLevelSeed()

    return {
      success: true,
      cleared: true,
      seeded: seedResult,
      message: 'Database reset and re-seeded successfully'
    }
  } catch (error) {
    console.error('Error resetting and seeding database:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to reset and seed database'
    })
  }
})
