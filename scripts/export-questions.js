// One-off export: dump all questions/cards from the database into a Markdown file.
import { PrismaClient } from '@prisma/client'
import { writeFile } from 'node:fs/promises'
import { buildQuestionsMarkdown } from '../lib/questionsMarkdown.js'

const prisma = new PrismaClient()

async function main() {
  const [cards, groupQuestions] = await Promise.all([
    prisma.gameCard.findMany(),
    prisma.groupGameQuestion.findMany(),
  ])

  const md = buildQuestionsMarkdown(cards, groupQuestions)

  const outPath = new URL('../data/questions-export.md', import.meta.url)
  await writeFile(outPath, md, 'utf-8')
  console.log(`Wrote ${cards.length + groupQuestions.length} questions to data/questions-export.md`)
}

main()
  .catch((e) => {
    console.error('Export failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
