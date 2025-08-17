import bcrypt from 'bcryptjs'
import prisma from '~/lib/prisma'

// Import all question data
import { truthQuestions } from '../../../data/questions/truth'
import { dareQuestions } from '../../../data/questions/dare'
import { spicyTruthQuestions } from '../../../data/questions/spicytruth'
import { spicyDareQuestions } from '../../../data/questions/spicydare'
import { doOrDrinkQuestions } from '../../../data/questions/doordrink'
import { neverHaveIEverQuestions } from '../../../data/questions/neverhaveiever'
import { mostLikelyToQuestions } from '../../../data/questions/mostlikelyto'
import { wouldYouRatherQuestions } from '../../../data/questions/wouldyourather'

export default defineEventHandler(async (event) => {
  try {
    console.log('🚀 Initializing database for production...')

    // Check if questions already exist
    const existingQuestions = await prisma.gameCard.count()
    const existingGroupQuestions = await prisma.groupGameQuestion.count()
    
    console.log(`Found ${existingQuestions} game cards and ${existingGroupQuestions} group questions`)

    // Only seed if database is empty
    if (existingQuestions === 0 && existingGroupQuestions === 0) {
      console.log('📝 Seeding questions...')
      
      let totalCreated = 0

      // Seed Truth or Dare cards
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

      for (const question of spicyTruthQuestions) {
        await prisma.gameCard.create({
          data: {
            type: 'TRUTH',
            gameType: 'TRUTH_OR_DARE',
            text: question,
            intensity: 5,
            isCustom: false
          }
        })
        totalCreated++
      }

      for (const question of spicyDareQuestions) {
        await prisma.gameCard.create({
          data: {
            type: 'DARE',
            gameType: 'TRUTH_OR_DARE',
            text: question,
            intensity: 5,
            isCustom: false
          }
        })
        totalCreated++
      }

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

      console.log(`✅ Seeded ${totalCreated} questions`)
    }

    // Ensure admin user exists
    let admin = await prisma.admin.findUnique({
      where: { username: 'admin' }
    })

    if (!admin) {
      console.log('👤 Creating default admin user...')
      const hashedPassword = await bcrypt.hash('admin123', 10)
      admin = await prisma.admin.create({
        data: {
          username: 'admin',
          password: hashedPassword
        }
      })
      console.log('Default admin user created')
    }

    return {
      success: true,
      message: 'Database initialized successfully',
      questionsCount: existingQuestions + existingGroupQuestions,
      adminExists: !!admin
    }

  } catch (error) {
    console.error('❌ Database initialization error:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to initialize database'
    })
  }
})
