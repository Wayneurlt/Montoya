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

// Outside server/ so dev server doesn't reload on every analytics event
const DATA_DIR = path.join(process.cwd(), '.data')
const DATA_FILE = path.join(DATA_DIR, 'analytics.json')
const OLD_DATA_FILE = path.join(process.cwd(), 'server', 'db', 'analytics.json')
const MAX_EVENTS = 5000

async function ensureStore(): Promise<AnalyticsStore> {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true })
    const raw = await fs.readFile(DATA_FILE, 'utf-8')
    return JSON.parse(raw)
  } catch {
    // One-time migration from old location
    try {
      const raw = await fs.readFile(OLD_DATA_FILE, 'utf-8')
      const store = JSON.parse(raw)
      await fs.writeFile(DATA_FILE, JSON.stringify(store, null, 2), 'utf-8')
      return store
    } catch {
      const initial: AnalyticsStore = {
        events: [],
        totals: { pageViews: 0, gameSelections: {}, users: {}, sessions: {} },
      }
      await fs.writeFile(DATA_FILE, JSON.stringify(initial, null, 2), 'utf-8')
      return initial
    }
  }
}

async function saveStore(store: AnalyticsStore) {
  await fs.writeFile(DATA_FILE, JSON.stringify(store, null, 2), 'utf-8')
}

export async function recordEvent(evt: AnalyticsEvent) {
  const store = await ensureStore()
  store.events.push(evt)
  // Simple roll-up (totals are never pruned; only events array is capped)
  if (evt.type === 'page_view') store.totals.pageViews += 1
  if (evt.type === 'game_select' && evt.game) {
    store.totals.gameSelections[evt.game] = (store.totals.gameSelections[evt.game] || 0) + 1
  }
  if (evt.userId) store.totals.users[evt.userId] = (store.totals.users[evt.userId] || 0) + 1
  if (evt.sessionId) store.totals.sessions[evt.sessionId] = (store.totals.sessions[evt.sessionId] || 0) + 1
  // Cap events to prevent unbounded file growth; totals stay accurate
  if (store.events.length > MAX_EVENTS) {
    store.events = store.events.slice(-MAX_EVENTS)
  }
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


