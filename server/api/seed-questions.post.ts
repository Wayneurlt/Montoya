import prisma from '~/lib/prisma'
import { wouldYouRatherQuestions } from '~/data/questions/wouldyourather'
import { neverHaveIEverQuestions } from '~/data/questions/neverhaveiever'
import { mostLikelyToQuestions } from '~/data/questions/mostlikelyto'
import { truthQuestions } from '~/data/questions/truth'
import { dareQuestions } from '~/data/questions/dare'
import { spicyTruthQuestions } from '~/data/questions/spicytruth'
import { spicyDareQuestions } from '~/data/questions/spicydare'
import { doOrDrinkQuestions } from '~/data/questions/doordrink'

export default defineEventHandler(async () => {
  try {
    console.log('🌱 Starting database seeding...')
    
    // Group game questions
    const groupQuestions: Array<{
      gameType: 'NEVER_HAVE_I_EVER' | 'MOST_LIKELY_TO' | 'WOULD_YOU_RATHER'
      text: string
      intensity?: number
      isActive?: boolean
    }> = []

    for (const t of wouldYouRatherQuestions) groupQuestions.push({ gameType: 'WOULD_YOU_RATHER', text: t, intensity: 1, isActive: true })
    for (const t of neverHaveIEverQuestions) groupQuestions.push({ gameType: 'NEVER_HAVE_I_EVER', text: t, intensity: 1, isActive: true })
    for (const t of mostLikelyToQuestions) groupQuestions.push({ gameType: 'MOST_LIKELY_TO', text: t, intensity: 1, isActive: true })

    // Game cards
    const gameCards: Array<{
      type: 'TRUTH' | 'DARE' | 'DO'
      gameType: 'TRUTH_OR_DARE' | 'DO_OR_DRINK' | 'DICE_OF_DESIRE'
      text: string
      intensity?: number
      drinkAmount?: string
    }> = []

    // Truth questions (regular intensity)
    for (const t of truthQuestions) gameCards.push({ type: 'TRUTH', gameType: 'TRUTH_OR_DARE', text: t, intensity: 2 })
    
    // Dare questions (regular intensity)
    for (const t of dareQuestions) gameCards.push({ type: 'DARE', gameType: 'TRUTH_OR_DARE', text: t, intensity: 2 })
    
    // Spicy truth questions (high intensity)
    for (const t of spicyTruthQuestions) gameCards.push({ type: 'TRUTH', gameType: 'TRUTH_OR_DARE', text: t, intensity: 5 })
    
    // Spicy dare questions (high intensity)
    for (const t of spicyDareQuestions) gameCards.push({ type: 'DARE', gameType: 'TRUTH_OR_DARE', text: t, intensity: 5 })
    
    // Do or drink questions
    for (const t of doOrDrinkQuestions) gameCards.push({ type: 'DO', gameType: 'DO_OR_DRINK', text: t, intensity: 3, drinkAmount: '2 sips' })

    console.log(`📊 Prepared ${groupQuestions.length} group questions and ${gameCards.length} game cards`)

    let groupInserted = 0
    let cardsInserted = 0

    if (groupQuestions.length > 0) {
      console.log('📝 Inserting group questions...')
      const groupResult = await prisma.groupGameQuestion.createMany({
        data: groupQuestions.map((q) => ({
          gameType: q.gameType as any,
          text: q.text.trim(),
          intensity: q.intensity ?? 1,
          isActive: q.isActive ?? true,
        })),
        skipDuplicates: true,
      })
      groupInserted = groupResult.count
      console.log(`✅ Inserted ${groupInserted} group questions`)
    }

    if (gameCards.length > 0) {
      console.log('📝 Inserting game cards...')
      const cardsResult = await prisma.gameCard.createMany({
        data: gameCards.map((c) => ({
          type: c.type as any,
          gameType: c.gameType as any,
          text: c.text.trim(),
          intensity: c.intensity ?? 1,
          drinkAmount: c.drinkAmount ?? null,
        })),
        skipDuplicates: true,
      })
      cardsInserted = cardsResult.count
      console.log(`✅ Inserted ${cardsInserted} game cards`)
    }

    return { 
      success: true,
      groupQuestionsInserted: groupInserted,
      gameCardsInserted: cardsInserted,
      total: groupInserted + cardsInserted,
      message: `Successfully seeded ${groupInserted + cardsInserted} questions`
    }
  } catch (error) {
    console.error('❌ Seeding failed:', error)
    return {
      success: false,
      error: error.message,
      message: 'Failed to seed database'
    }
  }
})



