import prisma from '~/lib/prisma'
import { requireAdmin } from '~/server/utils/adminAuth'
import { realtimeAnalytics } from '~/server/utils/realtimeAnalytics'

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
      totalUsers,
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
          eventType: { in: ['game_start', 'game_join'] },
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
      prisma.user.count(),
      prisma.gameSession.count()
    ])

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

    return {
      totalAnalytics,
      pageViews,
      totalUsers,
      totalGameSessions,
      uniqueUsers: uniqueUsers.length,
      uniqueSessions: uniqueSessions.length,
      activePlayers,
      activeSessions,
      popularGames,
      recentEvents: recentEvents.map(ev => ({ ...ev, type: ev.eventType })),
      realtime,
      dbAvailable: true
    }
  } catch (dbError) {
    console.error('Analytics stats DB error, returning realtime-only:', dbError)
    return {
      totalAnalytics: 0,
      pageViews: 0,
      totalUsers: 0,
      totalGameSessions: 0,
      uniqueUsers: 0,
      uniqueSessions: 0,
      activePlayers: realtime.totalActiveUsers,
      activeSessions: 0,
      popularGames: realtime.popularGames,
      recentEvents: [],
      realtime,
      dbAvailable: false
    }
  }
})