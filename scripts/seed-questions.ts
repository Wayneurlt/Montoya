import { PrismaClient } from '@prisma/client'

// Import all question data
import { truthQuestions } from '../data/questions/truth'
import { dareQuestions } from '../data/questions/dare'
import { spicyTruthQuestions } from '../data/questions/spicytruth'
import { spicyDareQuestions } from '../data/questions/spicydare'
import { doOrDrinkQuestions } from '../data/questions/doordrink'
import { neverHaveIEverQuestions } from '../data/questions/neverhaveiever'
import { mostLikelyToQuestions } from '../data/questions/mostlikelyto'
import { wouldYouRatherQuestions } from '../data/questions/wouldyourather'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding questions database...')
  
  console.log('📊 Question counts from files:')
  console.log(`- Truth: ${truthQuestions.length}`)
  console.log(`- Spicy Truth: ${spicyTruthQuestions.length}`)
  console.log(`- Dare: ${dareQuestions.length}`)
  console.log(`- Spicy Dare: ${spicyDareQuestions.length}`)
  console.log(`- Do or Drink: ${doOrDrinkQuestions.length}`)
  console.log(`- Never Have I Ever: ${neverHaveIEverQuestions.length}`)
  console.log(`- Most Likely To: ${mostLikelyToQuestions.length}`)
  console.log(`- Would You Rather: ${wouldYouRatherQuestions.length}`)
  console.log(`- Total from files: ${truthQuestions.length + spicyTruthQuestions.length + dareQuestions.length + spicyDareQuestions.length + doOrDrinkQuestions.length + neverHaveIEverQuestions.length + mostLikelyToQuestions.length + wouldYouRatherQuestions.length}`)

  // Clear existing data
  await prisma.sessionCardUsage.deleteMany()
  await prisma.sessionGroupQuestionUsage.deleteMany()
  await prisma.gameHistory.deleteMany()
  await prisma.gameCard.deleteMany()
  await prisma.groupGameQuestion.deleteMany()

  let totalCreated = 0

  // Seed Truth or Dare cards
  console.log('📝 Seeding Truth cards...')
  for (const question of truthQuestions) {
    await prisma.gameCard.create({
      data: {
        type: 'TRUTH',
        gameType: 'TRUTH_OR_DARE',
        text: question,
        intensity: question.includes('secret') || question.includes('wildest') ? 3 : 
                   question.includes('risky') || question.includes('boldest') ? 4 : 2,
        isCustom: false
      }
    })
    totalCreated++
  }

  console.log('🎯 Seeding Dare cards...')
  for (const question of dareQuestions) {
    await prisma.gameCard.create({
      data: {
        type: 'DARE',
        gameType: 'TRUTH_OR_DARE',
        text: question,
        intensity: question.includes('sexy') || question.includes('kiss') ? 4 : 
                   question.includes('flirty') || question.includes('romantic') ? 3 : 2,
        isCustom: false
      }
    })
    totalCreated++
  }

  console.log('🔥 Seeding Spicy Truth cards...')
  for (const question of spicyTruthQuestions) {
    await prisma.gameCard.create({
      data: {
        type: 'TRUTH',
        gameType: 'TRUTH_OR_DARE',
        text: question,
        intensity: 5, // Spicy questions are high intensity
        isCustom: false
      }
    })
    totalCreated++
  }

  console.log('🌶️ Seeding Spicy Dare cards...')
  for (const question of spicyDareQuestions) {
    await prisma.gameCard.create({
      data: {
        type: 'DARE',
        gameType: 'TRUTH_OR_DARE',
        text: question,
        intensity: 5, // Spicy dares are high intensity
        isCustom: false
      }
    })
    totalCreated++
  }

  console.log('🍺 Seeding Do or Drink cards...')
  for (const question of doOrDrinkQuestions) {
    await prisma.gameCard.create({
      data: {
        type: 'DO',
        gameType: 'DO_OR_DRINK',
        text: question,
        intensity: question.includes('shot') || question.includes('chug') ? 3 : 
                   question.includes('sip') ? 1 : 2,
        drinkAmount: question.includes('shot') ? 'shot' :
                     question.includes('chug') ? 'full drink' :
                     question.includes('gulp') ? '3 gulps' : '2 sips',
        isCustom: false
      }
    })
    totalCreated++
  }

  // Seed group questions
  console.log('🙋 Seeding Never Have I Ever questions...')
  for (const question of neverHaveIEverQuestions) {
    await prisma.groupGameQuestion.create({
      data: {
        gameType: 'NEVER_HAVE_I_EVER',
        text: question,
        intensity: question.includes('sex') || question.includes('BDSM') ? 5 :
                   question.includes('kissed') || question.includes('hooked up') ? 4 :
                   question.includes('date') || question.includes('crush') ? 2 : 3,
        isActive: true
      }
    })
    totalCreated++
  }

  console.log('🤔 Seeding Most Likely To questions...')
  for (const question of mostLikelyToQuestions) {
    await prisma.groupGameQuestion.create({
      data: {
        gameType: 'MOST_LIKELY_TO',
        text: question,
        intensity: question.includes('wild') || question.includes('crazy') ? 4 :
                   question.includes('embarrassing') ? 3 : 2,
        isActive: true
      }
    })
    totalCreated++
  }

  console.log('🤷 Seeding Would You Rather questions...')
  for (const question of wouldYouRatherQuestions) {
    await prisma.groupGameQuestion.create({
      data: {
        gameType: 'WOULD_YOU_RATHER',
        text: question,
        intensity: question.includes('embarrassing') || question.includes('awkward') ? 4 :
                   question.includes('weird') || question.includes('gross') ? 3 : 2,
        isActive: true
      }
    })
    totalCreated++
  }

  // Create admin user from required env vars (never hardcode credentials)
  const adminUsername = process.env.ADMIN_USERNAME
  const adminPassword = process.env.ADMIN_PASSWORD

  if (!adminUsername || !adminPassword) {
    throw new Error(
      'ADMIN_USERNAME and ADMIN_PASSWORD environment variables must be set to seed the admin account'
    )
  }

  console.log(`👤 Creating admin user "${adminUsername}"...`)
  const bcrypt = await import('bcryptjs')
  const hashedPassword = await bcrypt.hash(adminPassword, 10)

  await prisma.admin.upsert({
    where: { username: adminUsername },
    update: {},
    create: {
      username: adminUsername,
      password: hashedPassword
    }
  })

  console.log(`✅ Seeded ${totalCreated} questions and ensured admin user "${adminUsername}" exists`)
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
