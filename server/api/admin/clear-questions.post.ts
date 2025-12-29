import prisma from '~/lib/prisma'

export default defineEventHandler(async () => {
  try {
    console.log('🗑️ Clearing all questions from database...')
    
    // Delete in correct order to respect foreign key constraints
    await prisma.sessionGroupQuestionUsage.deleteMany()
    await prisma.sessionCardUsage.deleteMany()
    await prisma.gameHistory.deleteMany()
    await prisma.groupGameQuestion.deleteMany()
    await prisma.gameCard.deleteMany()
    
    console.log('✅ All questions cleared from database')
    
    return {
      success: true,
      message: 'All questions cleared successfully'
    }
  } catch (error) {
    console.error('❌ Error clearing database:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to clear database'
    })
  }
})



