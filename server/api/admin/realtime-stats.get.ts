import { requireAdmin } from '~/server/utils/adminAuth'
import { realtimeAnalytics } from '~/server/utils/realtimeAnalytics'

export default defineEventHandler(async (event) => {
  requireAdmin(event)

  try {
    const stats = realtimeAnalytics.getStats()
    const users = realtimeAnalytics.getUsers()
    const peakUsers = realtimeAnalytics.getPeakUsers()
    const history = realtimeAnalytics.getStatsHistory()

    return {
      ...stats,
      peakUsers,
      users,
      history: history.slice(-24), // Last 24 data points
    }
  } catch (error) {
    console.error('Error getting real-time stats:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to get real-time stats'
    })
  }
})
