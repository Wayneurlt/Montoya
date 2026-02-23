import { getIO } from '~/server/plugins/socket.io'
import { realtimeAnalytics } from './realtimeAnalytics'

// Broadcast analytics updates to admin clients
export function broadcastAnalyticsUpdate() {
  const io = getIO()
  if (!io) return

  const stats = realtimeAnalytics.getStats()
  
  // Emit to all clients in 'admin:analytics' room
  io.to('admin:analytics').emit('analytics:update', stats)
}

// Start broadcasting analytics updates every 5 seconds
let analyticsInterval: NodeJS.Timeout | null = null

export function startAnalyticsBroadcast() {
  if (analyticsInterval) return // Already started
  
  analyticsInterval = setInterval(() => {
    broadcastAnalyticsUpdate()
  }, 5000) // Update every 5 seconds
  
  console.log('📊 Real-time analytics broadcast started')
}

export function stopAnalyticsBroadcast() {
  if (analyticsInterval) {
    clearInterval(analyticsInterval)
    analyticsInterval = null
    console.log('📊 Real-time analytics broadcast stopped')
  }
}
