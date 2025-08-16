import { clearAllUsedQuestions, getSessionStats } from '~/composables/useQuestionTracker'

// Admin utility functions for managing question tracking

/**
 * Clear all question tracking data for a fresh start
 */
export const startNewSession = () => {
  if (typeof window === 'undefined') return false
  
  try {
    clearAllUsedQuestions()
    console.log('✅ New session started - all question tracking cleared')
    return true
  } catch (error) {
    console.error('❌ Failed to start new session:', error)
    return false
  }
}

/**
 * Get detailed statistics about current session
 */
export const getDetailedSessionStats = () => {
  if (typeof window === 'undefined') return null
  
  try {
    const stats = getSessionStats()
    if (!stats) return null
    
    console.log('📊 Session Statistics:')
    console.log('Session ID:', stats.sessionId)
    
    Object.entries(stats.games).forEach(([game, data]) => {
      console.log(`${game}: ${data.usedCount} questions used (${new Date(data.lastUpdated).toLocaleString()})`)
    })
    
    return stats
  } catch (error) {
    console.error('❌ Failed to get session stats:', error)
    return null
  }
}

/**
 * Export current session data for backup
 */
export const exportSessionData = () => {
  if (typeof window === 'undefined') return null
  
  try {
    const data = {
      timestamp: new Date().toISOString(),
      sessionStats: getSessionStats(),
      localStorage: {} as Record<string, any>
    }
    
    // Export all Montoya-related localStorage data
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key && key.startsWith('montoya_')) {
        data.localStorage[key] = localStorage.getItem(key)
      }
    }
    
    const jsonData = JSON.stringify(data, null, 2)
    console.log('💾 Session data exported:', jsonData)
    
    return jsonData
  } catch (error) {
    console.error('❌ Failed to export session data:', error)
    return null
  }
}

/**
 * Import session data from backup
 */
export const importSessionData = (jsonData: string) => {
  if (typeof window === 'undefined') return false
  
  try {
    const data = JSON.parse(jsonData)
    
    if (!data.localStorage) {
      throw new Error('Invalid session data format')
    }
    
    // Clear existing data first
    clearAllUsedQuestions()
    
    // Import localStorage data
    Object.entries(data.localStorage).forEach(([key, value]) => {
      if (key.startsWith('montoya_') && typeof value === 'string') {
        localStorage.setItem(key, value)
      }
    })
    
    console.log('📥 Session data imported successfully')
    return true
  } catch (error) {
    console.error('❌ Failed to import session data:', error)
    return false
  }
}

/**
 * Check if any questions are running low (< 20% remaining)
 */
export const checkLowQuestionAlerts = () => {
  if (typeof window === 'undefined') return []
  
  const alerts = []
  const stats = getSessionStats()
  
  if (!stats) return alerts
  
  // Define question pool sizes (should match actual files)
  const poolSizes = {
    TRUTH_NORMAL: 20,
    TRUTH_SPICY: 20,
    DARE_NORMAL: 20,
    DARE_SPICY: 20,
    DO_OR_DRINK: 30,
    NEVER_HAVE_I_EVER: 30,
    MOST_LIKELY_TO: 30,
    WOULD_YOU_RATHER: 30
  }
  
  Object.entries(stats.games).forEach(([game, data]) => {
    const poolSize = poolSizes[game as keyof typeof poolSizes] || 20
    const usagePercentage = (data.usedCount / poolSize) * 100
    
    if (usagePercentage >= 80) {
      alerts.push({
        game,
        usedCount: data.usedCount,
        totalQuestions: poolSize,
        usagePercentage: Math.round(usagePercentage),
        severity: usagePercentage >= 95 ? 'critical' : 'warning'
      })
    }
  })
  
  if (alerts.length > 0) {
    console.warn('⚠️ Low question alerts:', alerts)
  }
  
  return alerts
}

/**
 * Add console commands for easy debugging
 */
export const initializeDebugCommands = () => {
  if (typeof window === 'undefined') return
  
  // Add global debug functions
  (window as any).montoyaDebug = {
    startNewSession,
    getStats: getDetailedSessionStats,
    exportData: exportSessionData,
    importData: importSessionData,
    checkAlerts: checkLowQuestionAlerts,
    help: () => {
      console.log(`
🎮 Montoya Question Tracking Debug Commands:

montoyaDebug.startNewSession()  - Clear all question tracking, start fresh
montoyaDebug.getStats()         - Show detailed session statistics  
montoyaDebug.exportData()       - Export session data as JSON
montoyaDebug.importData(json)   - Import session data from JSON
montoyaDebug.checkAlerts()      - Check for games running low on questions
montoyaDebug.help()             - Show this help message

Example usage:
> montoyaDebug.getStats()
> montoyaDebug.startNewSession()
> const backup = montoyaDebug.exportData()
      `)
    }
  }
  
  console.log('🎮 Montoya debug commands loaded! Type "montoyaDebug.help()" for commands.')
}

// Auto-initialize debug commands in development
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  initializeDebugCommands()
}
