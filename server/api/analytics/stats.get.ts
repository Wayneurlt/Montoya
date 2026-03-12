import prisma from '~/lib/prisma'
import { requireAdmin } from '~/server/utils/adminAuth'
import { realtimeAnalytics } from '~/server/utils/realtimeAnalytics'
import { getStats as getFileStats } from '~/server/utils/analyticsStore'

const RECENT_GAME_PAGE_SLUGS = [
  'truth-or-dare', 'would-you-rather', 'most-likely-to', 'never-have-i-ever',
  'charades', 'imposter', 'mr-white',
] as const

function getRealtimePayload() {
  const realtimeStats = realtimeAnalytics.getStats()
  const peakUsers = realtimeAnalytics.getPeakUsers()
  return {
    totalActiveUsers: realtimeStats.totalActiveUsers,
    usersInGames: realtimeStats.usersInGames,
    usersInLobby: realtimeStats.usersInLobby,
    usersOnPages: realtimeStats.usersOnPages,
    activeRooms: realtimeStats.activeRooms,
    popularGames: realtimeStats.popularGames,
    peakUsers,
  }
}

export default defineEventHandler(async (event) => {
  requireAdmin(event)

  const realtime = getRealtimePayload()

  try {
    const [
      totalAnalytics,
      pageViews,
      uniqueUsers,
      uniqueSessions,
      gameEvents,
      recentEvents,
      activeSessions,
      totalGameSessions
    ] = await Promise.all([
      prisma.analytics.count(),
      prisma.analytics.count({ where: { eventType: 'page_view' } }),
      prisma.analytics.groupBy({
        by: ['userId'],
        where: { userId: { not: null } },
        _count: { userId: true }
      }),
      prisma.analytics.groupBy({
        by: ['sessionId'],
        where: { sessionId: { not: null } },
        _count: { sessionId: true }
      }),
      prisma.analytics.findMany({
        where: {
          eventType: { in: ['game_start', 'game_join', 'game_select'] },
          game: { not: null }
        },
        select: { game: true }
      }),
      prisma.analytics.findMany({
        orderBy: { timestamp: 'desc' },
        take: 20,
        select: {
          id: true,
          eventType: true,
          userId: true,
          sessionId: true,
          page: true,
          game: true,
          timestamp: true
        }
      }),
      prisma.gameSession.count({ where: { status: 'IN_PROGRESS' } }),
      prisma.gameSession.count()
    ])

    // Total users all time = unique userIds in analytics (visitors/players), not User table
    const totalUsers = uniqueUsers.length

    const gameCount: Record<string, number> = {}
    gameEvents.forEach(ev => {
      if (ev.game) gameCount[ev.game] = (gameCount[ev.game] || 0) + 1
    })
    const popularGames = Object.fromEntries(
      Object.entries(gameCount).sort(([, a], [, b]) => b - a)
    )

    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000)
    const activePlayersResult = await prisma.analytics.groupBy({
      by: ['userId'],
      where: {
        timestamp: { gte: oneHourAgo },
        eventType: { in: ['page_view', 'game_start', 'game_join'] },
        userId: { not: null }
      }
    })
    const activePlayers = activePlayersResult.length

    const fifteenMinAgo = new Date(Date.now() - 15 * 60 * 1000)
    const recentGameEvents = await prisma.analytics.findMany({
      where: {
        timestamp: { gte: fifteenMinAgo },
        eventType: 'page_view',
        page: { in: [...RECENT_GAME_PAGE_SLUGS] },
      },
      select: { page: true },
    })
    const recentGameActivity: Record<string, number> = {}
    recentGameEvents.forEach(ev => {
      if (ev.page) recentGameActivity[ev.page] = (recentGameActivity[ev.page] || 0) + 1
    })

    return {
      totalAnalytics,
      pageViews,
      totalUsers,
      allTimeUniqueUsers: totalUsers,
      totalGameSessions,
      uniqueUsers: uniqueUsers.length,
      uniqueSessions: uniqueSessions.length,
      activePlayers,
      activeSessions,
      popularGames,
      recentEvents: recentEvents.map(ev => ({ ...ev, type: ev.eventType })),
      realtime,
      recentGameActivity,
      dbAvailable: true,
      lastUpdated: new Date().toISOString()
    }
  } catch (dbError) {
    console.error('Analytics stats DB error, using file store + realtime:', dbError)
    try {
      const fileStats = await getFileStats()
      const recentEvents = (fileStats.recentEvents || []).slice(0, 20).map((ev: any) => ({
        id: ev.id,
        eventType: ev.type,
        type: ev.type,
        userId: ev.userId,
        sessionId: ev.sessionId,
        page: ev.page,
        game: ev.game,
        timestamp: ev.timestamp ? new Date(ev.timestamp) : new Date()
      }))
      return {
        totalAnalytics: fileStats.totalEvents ?? fileStats.pageViews ?? 0,
        pageViews: fileStats.pageViews || 0,
        totalUsers: fileStats.totalUsers || 0,
        allTimeUniqueUsers: fileStats.totalUsers || 0,
        totalGameSessions: fileStats.totalSessions || 0,
        uniqueUsers: fileStats.totalUsers || 0,
        uniqueSessions: fileStats.totalSessions || 0,
        activePlayers: realtime.totalActiveUsers,
        activeSessions: 0,
        popularGames: fileStats.popularGames || realtime.popularGames,
        recentEvents,
        realtime,
        recentGameActivity: {},
        dbAvailable: false
      }
    } catch (fileErr) {
      console.error('File store also failed:', fileErr)
      return {
        totalAnalytics: 0,
        pageViews: 0,
        totalUsers: 0,
        allTimeUniqueUsers: 0,
        totalGameSessions: 0,
        uniqueUsers: 0,
        uniqueSessions: 0,
        activePlayers: realtime.totalActiveUsers,
        activeSessions: 0,
        popularGames: realtime.popularGames,
        recentEvents: [],
        realtime,
        recentGameActivity: {},
        dbAvailable: false,
        lastUpdated: new Date().toISOString()
      }
    }
  }
})