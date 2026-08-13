// Shared formatter: turns GameCard + GroupGameQuestion rows into a Markdown export.
// Used by both scripts/export-questions.js (CLI) and server/api/admin/questions/export.get.ts (in-app download).

export const GAME_TYPE_LABELS = {
  TRUTH_OR_DARE: 'Truth or Dare',
  DICE_OF_DESIRE: 'Dice of Desire',
  DO_OR_DRINK: 'Do or Drink',
  NEVER_HAVE_I_EVER: 'Never Have I Ever',
  MOST_LIKELY_TO: 'Most Likely To',
  WOULD_YOU_RATHER: 'Would You Rather',
}

export const GAME_TYPE_ORDER = Object.keys(GAME_TYPE_LABELS)

function groupBy(items, keyFn) {
  const map = new Map()
  for (const item of items) {
    const key = keyFn(item)
    if (!map.has(key)) map.set(key, [])
    map.get(key).push(item)
  }
  return map
}

function renderCardsSection(gameType, cards) {
  const label = GAME_TYPE_LABELS[gameType] || gameType
  let out = `## ${label}\n\n`
  out += `${cards.length} question${cards.length === 1 ? '' : 's'}\n\n`

  const byType = groupBy(cards, (c) => c.type)
  for (const [type, group] of byType) {
    out += `### ${type}\n\n`
    out += '| # | Text | Intensity | Drink Amount |\n'
    out += '|---|------|-----------|---------------|\n'
    group
      .sort((a, b) => a.intensity - b.intensity || a.id - b.id)
      .forEach((c, i) => {
        const text = c.text.replace(/\|/g, '\\|').replace(/\n/g, ' ')
        out += `| ${i + 1} | ${text} | ${c.intensity} | ${c.drinkAmount || '-'} |\n`
      })
    out += '\n'
  }
  return out
}

function renderGroupQuestionsSection(gameType, questions) {
  const label = GAME_TYPE_LABELS[gameType] || gameType
  let out = `## ${label}\n\n`
  out += `${questions.length} question${questions.length === 1 ? '' : 's'}\n\n`
  out += '| # | Text | Intensity | Active |\n'
  out += '|---|------|-----------|--------|\n'
  questions
    .sort((a, b) => a.intensity - b.intensity || a.id - b.id)
    .forEach((q, i) => {
      const text = q.text.replace(/\|/g, '\\|').replace(/\n/g, ' ')
      out += `| ${i + 1} | ${text} | ${q.intensity} | ${q.isActive ? 'yes' : 'no'} |\n`
    })
  out += '\n'
  return out
}

export function buildQuestionsMarkdown(cards, groupQuestions) {
  const cardsByGameType = groupBy(cards, (c) => c.gameType)
  const groupQuestionsByGameType = groupBy(groupQuestions, (q) => q.gameType)

  let md = '# Montoya — Question & Card Export\n\n'
  md += `Generated: ${new Date().toISOString()}\n\n`
  md += `Total game cards: ${cards.length}\n\n`
  md += `Total group questions: ${groupQuestions.length}\n\n`
  md += '---\n\n'

  for (const gameType of GAME_TYPE_ORDER) {
    if (cardsByGameType.has(gameType)) {
      md += renderCardsSection(gameType, cardsByGameType.get(gameType))
    }
    if (groupQuestionsByGameType.has(gameType)) {
      md += renderGroupQuestionsSection(gameType, groupQuestionsByGameType.get(gameType))
    }
  }

  return md
}
