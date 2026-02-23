import prisma from '~/lib/prisma'
import { requireAdmin } from '~/server/utils/adminAuth'
import { realtimeAnalytics } from '~/server/utils/realtimeAnalytics'

export default defineEventHandler(async (event) => {
  // Require admin authentication
  requireAdmin(event)

  try {
    // Get analytics from database
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

    // Calculate popular games
    const gameCount: Record<string, number> = {}
    gameEvents.forEach(event => {
      if (event.game) {
        gameCount[event.game] = (gameCount[event.game] || 0) + 1
      }
    })

    // Sort by popularity
    const popularGames = Object.fromEntries(
      Object.entries(gameCount).sort(([,a], [,b]) => b - a)
    )

    // Get active players (players who have activity in the last hour)
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

    // Get real-time stats
    const realtimeStats = realtimeAnalytics.getStats()
    const peakUsers = realtimeAnalytics.getPeakUsers()

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
      recentEvents: recentEvents.map(event => ({
        ...event,
        type: event.eventType
      })),
      // Real-time stats
      realtime: {
        totalActiveUsers: realtimeStats.totalActiveUsers,
        usersInGames: realtimeStats.usersInGames,
        usersInLobby: realtimeStats.usersInLobby,
        usersOnPages: realtimeStats.usersOnPages,
        activeRooms: realtimeStats.activeRooms,
        popularGames: realtimeStats.popularGames,
        peakUsers,
      }
    }
  } catch (error) {
    console.error('Error getting analytics stats:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to get analytics stats'
    })
  } finally {
    await prisma.$disconnect()
  }
})