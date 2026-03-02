import { promises as fs } from 'fs'
import path from 'path'

type AnalyticsEvent = {
  id: string
  type: 'page_view' | 'game_select' | 'activity'
  userId?: string
  sessionId?: string
  page?: string
  game?: string
  timestamp: number
  userAgent?: string
  location?: { country?: string; city?: string }
}

type AnalyticsStore = {
  events: AnalyticsEvent[]
  totals: {
    pageViews: number
    gameSelections: Record<string, number>
    users: Record<string, number>
    sessions: Record<string, number>
  }
}

const DATA_DIR = path.join(process.cwd(), 'server', 'db')
const DATA_FILE = path.join(DATA_DIR, 'analytics.json')

async function ensureStore(): Promise<AnalyticsStore> {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true })
    const raw = await fs.readFile(DATA_FILE, 'utf-8')
    return JSON.parse(raw)
  } catch {
    const initial: AnalyticsStore = {
      events: [],
      totals: { pageViews: 0, gameSelections: {}, users: {}, sessions: {} },
    }
    await fs.writeFile(DATA_FILE, JSON.stringify(initial, null, 2), 'utf-8')
    return initial
  }
}

async function saveStore(store: AnalyticsStore) {
  await fs.writeFile(DATA_FILE, JSON.stringify(store, null, 2), 'utf-8')
}

export async function recordEvent(evt: AnalyticsEvent) {
  const store = await ensureStore()
  store.events.push(evt)
  // Simple roll-up
  if (evt.type === 'page_view') store.totals.pageViews += 1
  if (evt.type === 'game_select' && evt.game) {
    store.totals.gameSelections[evt.game] = (store.totals.gameSelections[evt.game] || 0) + 1
  }
  if (evt.userId) store.totals.users[evt.userId] = (store.totals.users[evt.userId] || 0) + 1
  if (evt.sessionId) store.totals.sessions[evt.sessionId] = (store.totals.sessions[evt.sessionId] || 0) + 1
  await saveStore(store)
}

export async function getStats() {
  const store = await ensureStore()
  // Derive simple aggregates
  const totalUsers = Object.keys(store.totals.users).length
  const totalSessions = Object.keys(store.totals.sessions).length
  const popularGames = Object.entries(store.totals.gameSelections)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .reduce((acc, [k, v]) => ({ ...acc, [k]: v }), {} as Record<string, number>)

  return {
    pageViews: store.totals.pageViews,
    totalEvents: store.events.length,
    totalUsers,
    totalSessions,
    popularGames,
    recentEvents: store.events.slice(-50).reverse(),
  }
}


