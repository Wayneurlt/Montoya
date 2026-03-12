import prisma from '~/lib/prisma'
import { requireAdmin } from '~/server/utils/adminAuth'

const GAME_SLUGS = new Set([
  'truth-or-dare', 'would-you-rather', 'most-likely-to', 'never-have-i-ever',
  'charades', 'imposter', 'mr-white',
])

function toDateKey(d: Date): string {
  return d.toISOString().slice(0, 10)
}

export default defineEventHandler(async (event) => {
  requireAdmin(event)

  const query = getQuery(event)
  const days = Math.min(90, Math.max(1, Number(query.days) || 30))
  const startDate = new Date()
  startDate.setDate(startDate.getDate() - days)
  startDate.setUTCHours(0, 0, 0, 0)

  try {
    const events = await prisma.analytics.findMany({
      where: { timestamp: { gte: startDate } },
      select: {
        timestamp: true,
        userId: true,
        eventType: true,
        page: true,
        game: true,
      },
      orderBy: { timestamp: 'asc' },
    })

    const byDay = new Map<string, { uniqueUsers: Set<string>, pageViews: number, games: Record<string, number> }>()

    for (const ev of events) {
      const dateKey = toDateKey(ev.timestamp)
      if (!byDay.has(dateKey)) {
        byDay.set(dateKey, { uniqueUsers: new Set(), pageViews: 0, games: {} })
      }
      const row = byDay.get(dateKey)!

      if (ev.userId) row.uniqueUsers.add(ev.userId)
      if (ev.eventType === 'page_view') row.pageViews += 1

      const gameSlug = ev.game || (ev.page && GAME_SLUGS.has(ev.page) ? ev.page : null)
      if (gameSlug) {
        row.games[gameSlug] = (row.games[gameSlug] || 0) + 1
      }
    }

    const daysList: { date: string, uniqueUsers: number, pageViews: number, games: Record<string, number> }[] = []
    for (let i = 0; i < days; i++) {
      const d = new Date(startDate)
      d.setDate(d.getDate() + i)
      const dateKey = toDateKey(d)
      const row = byDay.get(dateKey)
      daysList.push({
        date: dateKey,
        uniqueUsers: row ? row.uniqueUsers.size : 0,
        pageViews: row ? row.pageViews : 0,
        games: row ? row.games : {},
      })
    }

    return {
      days: daysList,
      gameSlugs: Array.from(GAME_SLUGS),
    }
  } catch (err) {
    console.error('Analytics daily error:', err)
    return {
      days: [] as { date: string; uniqueUsers: number; pageViews: number; games: Record<string, number> }[],
      gameSlugs: Array.from(GAME_SLUGS),
      error: 'Failed to load daily analytics',
    }
  }
})
