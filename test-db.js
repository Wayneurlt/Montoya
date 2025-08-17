// Quick script to check database content
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Checking database content...')
  
  // Check GroupGameQuestion
  const groupQuestions = await prisma.groupGameQuestion.findMany()
  console.log(`GroupGameQuestion count: ${groupQuestions.length}`)
  if (groupQuestions.length > 0) {
    console.log('Sample group question:', groupQuestions[0])
  }
  
  // Check GameCard
  const gameCards = await prisma.gameCard.findMany()
  console.log(`GameCard count: ${gameCards.length}`)
  if (gameCards.length > 0) {
    console.log('Sample game card:', gameCards[0])
  }
  
  await prisma.$disconnect()
}

main().catch(console.error)
