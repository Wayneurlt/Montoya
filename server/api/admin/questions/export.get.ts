import prisma from '~/lib/prisma'
import { requireAdmin } from '~/server/utils/adminAuth'
import { buildQuestionsMarkdown } from '~/lib/questionsMarkdown'

export default defineEventHandler(async (event) => {
  requireAdmin(event)

  const [cards, groupQuestions] = await Promise.all([
    prisma.gameCard.findMany(),
    prisma.groupGameQuestion.findMany(),
  ])

  const markdown = buildQuestionsMarkdown(cards, groupQuestions)

  setHeader(event, 'Content-Type', 'text/markdown; charset=utf-8')
  setHeader(event, 'Content-Disposition', 'attachment; filename="questions-export.md"')

  return markdown
})
