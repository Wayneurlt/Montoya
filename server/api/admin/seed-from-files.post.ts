import prisma from '~/lib/prisma'
import { requireAdmin } from '~/server/utils/adminAuth'
import { wouldYouRatherQuestions } from '~/data/questions/wouldyourather'
import { neverHaveIEverQuestions } from '~/data/questions/neverhaveiever'
import { mostLikelyToQuestions } from '~/data/questions/mostlikelyto'

export default defineEventHandler(async (event) => {
  requireAdmin(event)

  const payload: Array<{ gameType: 'NEVER_HAVE_I_EVER' | 'MOST_LIKELY_TO' | 'WOULD_YOU_RATHER'; text: string; intensity?: number; isActive?: boolean }> = []

  for (const t of wouldYouRatherQuestions) payload.push({ gameType: 'WOULD_YOU_RATHER', text: t, intensity: 1, isActive: true })
  for (const t of neverHaveIEverQuestions) payload.push({ gameType: 'NEVER_HAVE_I_EVER', text: t, intensity: 1, isActive: true })
  for (const t of mostLikelyToQuestions) payload.push({ gameType: 'MOST_LIKELY_TO', text: t, intensity: 1, isActive: true })

  if (payload.length === 0) return { inserted: 0 }

  const created = await prisma.groupGameQuestion.createMany({
    data: payload.map((q) => ({
      gameType: q.gameType as any,
      text: q.text.trim(),
      intensity: q.intensity ?? 1,
      isActive: q.isActive ?? true,
    })),
    skipDuplicates: true,
  })

  return { inserted: created.count }
})


