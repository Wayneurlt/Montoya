import prisma from '~/lib/prisma'
import { requireAdmin } from '~/server/utils/adminAuth'

export default defineEventHandler(async (event) => {
  // Require admin authentication
  requireAdmin(event)

  try {
    // Get game sessions with player counts
    const gameSessions = await prisma.gameSession.findMany({
      select: {
        id: true,
        code: true,
        name: true,
        gameType: true,
        gameMode: true,
        status: true,
        maxPlayers: true,
        currentTurn: true,
        createdAt: true,
        updatedAt: true,
        createdBy: {
          select: {
            username: true,
            displayName: true
          }
        },
        players: {
          select: {
            id: true,
            playerName: true,
            gender: true,
            isReady: true,
            isEliminated: true,
            itemsRemoved: true,
            drinksTaken: true,
            team: true,
            user: {
              select: {
                username: true,
                displayName: true
              }
            }
          }
        },
        _count: {
          select: {
            players: true
          }
        }
      },
      orderBy: [
        { status: 'asc' }, // Active games first
        { updatedAt: 'desc' }
      ]
    })

    // Get summary stats
    const stats = await prisma.gameSession.groupBy({
      by: ['gameType', 'status'],
      _count: {
        id: true
      }
    })

    // Format the data for the UI
    const gameCards = gameSessions.map(session => ({
      id: session.id,
      code: session.code,
      name: session.name || `${session.gameType.replace('_', ' ')} Game`,
      gameType: session.gameType,
      gameMode: session.gameMode,
      status: session.status,
      playerCount: session._count.players,
      maxPlayers: session.maxPlayers,
      currentTurn: session.currentTurn,
      createdAt: session.createdAt,
      updatedAt: session.updatedAt,
      creator: session.createdBy.displayName || session.createdBy.username,
      players: session.players.map(player => ({
        id: player.id,
        name: player.playerName,
        gender: player.gender,
        isReady: player.isReady,
        isEliminated: player.isEliminated,
        itemsRemoved: player.itemsRemoved,
        drinksTaken: player.drinksTaken,
        team: player.team,
        username: player.user?.username
      })),
      isActive: session.status === 'IN_PROGRESS',
      isWaiting: session.status === 'LOBBY'
    }))

    // Calculate summary by game type
    const gameTypeSummary: Record<string, { total: number; active: number; waiting: number; completed: number }> = {}
    
    stats.forEach(stat => {
      if (!gameTypeSummary[stat.gameType]) {
        gameTypeSummary[stat.gameType] = { total: 0, active: 0, waiting: 0, completed: 0 }
      }
      
      gameTypeSummary[stat.gameType].total += stat._count.id
      
      switch (stat.status) {
        case 'IN_PROGRESS':
          gameTypeSummary[stat.gameType].active += stat._count.id
          break
        case 'LOBBY':
          gameTypeSummary[stat.gameType].waiting += stat._count.id
          break
        case 'COMPLETED':
        case 'CANCELLED':
          gameTypeSummary[stat.gameType].completed += stat._count.id
          break
      }
    })

    return {
      gameCards,
      totalSessions: gameSessions.length,
      activeSessions: gameSessions.filter(s => s.status === 'IN_PROGRESS').length,
      waitingSessions: gameSessions.filter(s => s.status === 'LOBBY').length,
      totalPlayers: gameSessions.reduce((sum, s) => sum + s._count.players, 0),
      gameTypeSummary
    }
    
  } catch (error) {
    console.error('Error getting game cards:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to get game cards'
    })
  }
})