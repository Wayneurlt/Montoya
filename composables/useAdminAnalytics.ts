import { ref, onMounted, onBeforeUnmount } from 'vue'
import { io, Socket } from 'socket.io-client'

interface RealtimeStats {
  totalActiveUsers: number
  usersInGames: number
  usersInLobby: number
  usersOnPages: Record<string, number>
  activeRooms: number
  popularGames: Record<string, number>
  usersByHour: number[]
  peakUsers?: number
}

export const useAdminAnalytics = () => {
  const realtimeStats = ref<RealtimeStats | null>(null)
  const isConnected = ref(false)
  const socket = ref<Socket | null>(null)

  const connect = () => {
    if (typeof window === 'undefined') return

    try {
      // Get server URL from runtime config or use current origin
      const config = useRuntimeConfig()
      const serverUrl = config.public.socketUrl || window.location.origin

      // Create socket connection for admin
      socket.value = io(serverUrl, {
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionAttempts: 5,
      })

      socket.value.on('connect', () => {
        console.log('📊 Admin analytics connected:', socket.value?.id)
        isConnected.value = true
        
        // Join admin analytics room
        socket.value?.emit('admin:join-analytics')
      })

      socket.value.on('disconnect', () => {
        console.log('📊 Admin analytics disconnected')
        isConnected.value = false
      })

      // Listen for real-time updates
      socket.value.on('analytics:update', (stats: RealtimeStats) => {
        realtimeStats.value = stats
      })

      socket.value.on('connect_error', (error) => {
        console.error('📊 Admin analytics connection error:', error)
        isConnected.value = false
      })
    } catch (error) {
      console.error('Failed to connect to admin analytics:', error)
    }
  }

  const disconnect = () => {
    if (socket.value) {
      socket.value.emit('admin:leave-analytics')
      socket.value.off('analytics:update')
      socket.value.disconnect()
      isConnected.value = false
      socket.value = null
    }
  }

  const fetchStats = async () => {
    try {
      const stats = await $fetch('/api/admin/realtime-stats')
      realtimeStats.value = stats as any
    } catch (error) {
      console.error('Failed to fetch real-time stats:', error)
    }
  }

  onMounted(() => {
    connect()
    fetchStats()
    
    // Refresh stats every 10 seconds as fallback
    const interval = setInterval(fetchStats, 10000)
    
    onBeforeUnmount(() => {
      disconnect()
      clearInterval(interval)
    })
  })

  return {
    realtimeStats,
    isConnected,
    connect,
    disconnect,
    fetchStats,
  }
}
