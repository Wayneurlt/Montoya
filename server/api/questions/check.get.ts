import prisma from '~/lib/prisma'

export default defineEventHandler(async (event) => {
  try {
    // Check GameCard table
    const truthCount = await prisma.gameCard.count({
      where: {
        gameType: 'TRUTH_OR_DARE',
        type: 'TRUTH'
      }
    })
    
    const dareCount = await prisma.gameCard.count({
      where: {
        gameType: 'TRUTH_OR_DARE',
        type: 'DARE'
      }
    })
    
    const doOrDrinkCount = await prisma.gameCard.count({
      where: {
        gameType: 'DO_OR_DRINK',
        type: 'DO'
      }
    })
    
    // Check GroupGameQuestion table
    const neverHaveIEverCount = await prisma.groupGameQuestion.count({
      where: {
        gameType: 'NEVER_HAVE_I_EVER',
        isActive: true
      }
    })
    
    // Get sample questions
    const sampleTruth = await prisma.gameCard.findFirst({
      where: { gameType: 'TRUTH_OR_DARE', type: 'TRUTH' },
      select: { id: true, text: true, intensity: true }
    })
    
    const sampleDare = await prisma.gameCard.findFirst({
      where: { gameType: 'TRUTH_OR_DARE', type: 'DARE' },
      select: { id: true, text: true, intensity: true }
    })
    
    return {
      success: true,
      counts: {
        truth: truthCount,
        dare: dareCount,
        doOrDrink: doOrDrinkCount,
        neverHaveIEver: neverHaveIEverCount
      },
      samples: {
        truth: sampleTruth,
        dare: sampleDare
      },
      message: truthCount === 0 && dareCount === 0 
        ? 'No questions found in database. Please seed the database.'
        : `Found ${truthCount} truth questions, ${dareCount} dare questions, ${doOrDrinkCount} do-or-drink questions, and ${neverHaveIEverCount} never-have-i-ever questions.`
    }
  } catch (error) {
    console.error('Error checking database:', error)
    return {
      success: false,
      error: error.message,
      message: 'Error checking database'
    }
  }
})



