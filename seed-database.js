// Seed script to populate database with questions from data files
import { PrismaClient } from '@prisma/client'
import { wouldYouRatherQuestions } from './data/questions/wouldyourather.js'
import { neverHaveIEverQuestions } from './data/questions/neverhaveiever.js'
import { mostLikelyToQuestions } from './data/questions/mostlikelyto.js'
import { truthQuestions } from './data/questions/truth.js'
import { dareQuestions } from './data/questions/dare.js'
import { spicyTruthQuestions } from './data/questions/spicytruth.js'
import { spicyDareQuestions } from './data/questions/spicydare.js'
import { doOrDrinkQuestions } from './data/questions/doordrink.js'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database with questions...')
  
  // Group game questions
  const groupQuestions = []
  
  for (const text of wouldYouRatherQuestions) {
    groupQuestions.push({
      gameType: 'WOULD_YOU_RATHER',
      text: text.trim(),
      intensity: 1,
      isActive: true,
    })
  }
  
  for (const text of neverHaveIEverQuestions) {
    groupQuestions.push({
      gameType: 'NEVER_HAVE_I_EVER',
      text: text.trim(),
      intensity: 1,
      isActive: true,
    })
  }
  
  for (const text of mostLikelyToQuestions) {
    groupQuestions.push({
      gameType: 'MOST_LIKELY_TO',
      text: text.trim(),
      intensity: 1,
      isActive: true,
    })
  }
  
  console.log(`Inserting ${groupQuestions.length} group questions...`)
  const groupResult = await prisma.groupGameQuestion.createMany({
    data: groupQuestions,
    skipDuplicates: true,
  })
  console.log(`✅ Inserted ${groupResult.count} group questions`)
  
  // Game cards
  const gameCards = []
  
  // Truth questions (regular intensity)
  for (const text of truthQuestions) {
    gameCards.push({
      type: 'TRUTH',
      gameType: 'TRUTH_OR_DARE',
      text: text.trim(),
      intensity: 2,
    })
  }
  
  // Dare questions (regular intensity)
  for (const text of dareQuestions) {
    gameCards.push({
      type: 'DARE',
      gameType: 'TRUTH_OR_DARE',
      text: text.trim(),
      intensity: 2,
    })
  }
  
  // Spicy truth questions (high intensity)
  for (const text of spicyTruthQuestions) {
    gameCards.push({
      type: 'TRUTH',
      gameType: 'TRUTH_OR_DARE',
      text: text.trim(),
      intensity: 5,
    })
  }
  
  // Spicy dare questions (high intensity)
  for (const text of spicyDareQuestions) {
    gameCards.push({
      type: 'DARE',
      gameType: 'TRUTH_OR_DARE',
      text: text.trim(),
      intensity: 5,
    })
  }
  
  // Do or drink questions
  for (const text of doOrDrinkQuestions) {
    gameCards.push({
      type: 'DO',
      gameType: 'DO_OR_DRINK',
      text: text.trim(),
      intensity: 3,
      drinkAmount: '2 sips',
    })
  }
  
  console.log(`Inserting ${gameCards.length} game cards...`)
  const cardsResult = await prisma.gameCard.createMany({
    data: gameCards,
    skipDuplicates: true,
  })
  console.log(`✅ Inserted ${cardsResult.count} game cards`)
  
  console.log(`🎉 Database seeded successfully!`)
  console.log(`Total: ${groupResult.count + cardsResult.count} questions added`)
  
  await prisma.$disconnect()
}

main().catch((e) => {
  console.error('❌ Seeding failed:', e)
  process.exit(1)
})
