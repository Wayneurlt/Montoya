import prisma from '~/lib/prisma'

export default defineEventHandler(async () => {
  try {
    console.log('🔄 Starting database reset and re-seed...')
    
    // Step 1: Clear all questions
    console.log('🗑️ Clearing all questions from database...')
    await prisma.sessionGroupQuestionUsage.deleteMany()
    await prisma.sessionCardUsage.deleteMany()
    await prisma.gameHistory.deleteMany()
    await prisma.groupGameQuestion.deleteMany()
    await prisma.gameCard.deleteMany()
    console.log('✅ All questions cleared')
    
    // Step 2: Call the seed endpoint
    const seedResponse = await $fetch('/api/admin/seed-new-questions', {
      method: 'POST'
    })
    
    return {
      success: true,
      cleared: true,
      seeded: seedResponse,
      message: 'Database reset and re-seeded successfully'
    }
  } catch (error) {
    console.error('❌ Error resetting and seeding database:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to reset and seed database'
    })
  }
})

