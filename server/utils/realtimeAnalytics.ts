// Real-time analytics tracking for active users
interface ActiveUser {
  socketId: string
  userId: string | null
  sessionId: string | null
  page: string
  userAgent: string
  ipAddress: string | null
  connectedAt: number
  lastActivity: number
  isInGame: boolean
  currentGame: string | null
  roomCode: string | null
}

interface RealtimeStats {
  totalActiveUsers: number
  usersInGames: number
  usersInLobby: number
  usersOnPages: Record<string, number>
  activeRooms: number
  popularGames: Record<string, number>
  usersByHour: number[]
}

class RealtimeAnalyticsStore {
  private activeUsers = new Map<string, ActiveUser>()
  private statsHistory: RealtimeStats[] = []
  private maxHistorySize = 100

  // Add or update active user
  addUser(socketId: string, data: Partial<ActiveUser>) {
    const existing = this.activeUsers.get(socketId)
    const now = Date.now()
    
    this.activeUsers.set(socketId, {
      socketId,
      userId: data.userId || existing?.userId || null,
      sessionId: data.sessionId || existing?.sessionId || null,
      page: data.page || existing?.page || 'unknown',
      userAgent: data.userAgent || existing?.userAgent || 'unknown',
      ipAddress: data.ipAddress || existing?.ipAddress || null,
      connectedAt: existing?.connectedAt || now,
      lastActivity: now,
      isInGame: data.isInGame ?? existing?.isInGame ?? false,
      currentGame: data.currentGame || existing?.currentGame || null,
      roomCode: data.roomCode || existing?.roomCode || null,
    })
  }

  // Update user activity
  updateUserActivity(socketId: string, updates: Partial<ActiveUser>) {
    const user = this.activeUsers.get(socketId)
    if (user) {
      this.activeUsers.set(socketId, {
        ...user,
        ...updates,
        lastActivity: Date.now(),
      })
    }
  }

  // Remove user
  removeUser(socketId: string) {
    this.activeUsers.delete(socketId)
  }

  // Clean up inactive users (no activity for 5 minutes)
  cleanupInactiveUsers() {
    const now = Date.now()
    const fiveMinutesAgo = now - 5 * 60 * 1000
    
    for (const [socketId, user] of this.activeUsers.entries()) {
      if (user.lastActivity < fiveMinutesAgo) {
        this.activeUsers.delete(socketId)
      }
    }
  }

  // Get current stats
  getStats(): RealtimeStats {
    this.cleanupInactiveUsers()
    
    const users = Array.from(this.activeUsers.values())
    const usersInGames = users.filter(u => u.isInGame).length
    const usersInLobby = users.filter(u => u.page === 'lobby' || u.page === 'multiplayer').length
    
    // Count users by page
    const usersOnPages: Record<string, number> = {}
    users.forEach(user => {
      usersOnPages[user.page] = (usersOnPages[user.page] || 0) + 1
    })

    // Count active rooms
    const activeRooms = new Set(users.filter(u => u.roomCode).map(u => u.roomCode)).size

    // Popular games
    const popularGames: Record<string, number> = {}
    users.forEach(user => {
      if (user.currentGame) {
        popularGames[user.currentGame] = (popularGames[user.currentGame] || 0) + 1
      }
    })

    // Users by hour (last 24 hours)
    const usersByHour = new Array(24).fill(0)
    const now = new Date()
    users.forEach(user => {
      const hour = new Date(user.connectedAt).getHours()
      usersByHour[hour] = (usersByHour[hour] || 0) + 1
    })

    const stats: RealtimeStats = {
      totalActiveUsers: users.length,
      usersInGames,
      usersInLobby,
      usersOnPages,
      activeRooms,
      popularGames,
      usersByHour,
    }

    // Add to history
    this.statsHistory.push(stats)
    if (this.statsHistory.length > this.maxHistorySize) {
      this.statsHistory.shift()
    }

    return stats
  }

  // Get user list
  getUsers(): ActiveUser[] {
    this.cleanupInactiveUsers()
    return Array.from(this.activeUsers.values())
  }

  // Get stats history
  getStatsHistory(): RealtimeStats[] {
    return this.statsHistory
  }

  // Get peak users (from history)
  getPeakUsers(): number {
    if (this.statsHistory.length === 0) return 0
    return Math.max(...this.statsHistory.map(s => s.totalActiveUsers))
  }
}

// Singleton instance
export const realtimeAnalytics = new RealtimeAnalyticsStore()

// Cleanup interval (every minute)
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    realtimeAnalytics.cleanupInactiveUsers()
  }, 60 * 1000)
}
