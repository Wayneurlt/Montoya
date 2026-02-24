import { ref, onMounted, onBeforeUnmount } from 'vue'

// Analytics data structure
interface AnalyticsData {
  sessionId: string
  userId: string
  timestamp: number
  userAgent: string
  gamePreferences: Record<string, number>
  sessionsCount: number
  lastActivity: number
  location?: {
    country?: string
    city?: string
  }
}

// In-memory analytics store (could be replaced with a proper database)
const ANALYTICS_KEY = 'montoya_analytics'
const SESSION_KEY = 'montoya_session_analytics'
const USER_KEY = 'montoya_user_id'

// Generate unique IDs
const generateId = () => Date.now().toString(36) + Math.random().toString(36).substr(2, 9)

// Get or create user ID (works synchronously)
const getUserId = (): string => {
  if (typeof window === 'undefined') return ''
  let userId = localStorage.getItem(USER_KEY)
  if (!userId) {
    userId = generateId()
    localStorage.setItem(USER_KEY, userId)
  }
  return userId
}

// Get or create session ID (works synchronously)
const getSessionId = (): string => {
  if (typeof window === 'undefined') return ''
  let sessionId = sessionStorage.getItem(SESSION_KEY)
  if (!sessionId) {
    sessionId = generateId()
    sessionStorage.setItem(SESSION_KEY, sessionId)
  }
  return sessionId
}

const POST_EVENT_RETRY_MS = 1500
const POST_EVENT_MAX_RETRIES = 2

// Analytics composable
export const useAnalytics = () => {
  const isTracking = ref(false)
  const analyticsData = ref<AnalyticsData | null>(null)
  // Real-time user count comes from admin dashboard; client shows 0 to avoid fake data
  const currentUsers = ref(0)

  // Initialize analytics: set data synchronously first so trackPageView never misses
  const initializeAnalytics = async () => {
    if (typeof window === 'undefined') return

    const userId = getUserId()
    const sessionId = getSessionId()

    // Set immediately so any trackPageView call has data
    analyticsData.value = {
      sessionId,
      userId,
      timestamp: Date.now(),
      userAgent: navigator.userAgent,
      gamePreferences: {},
      sessionsCount: 1,
      lastActivity: Date.now()
    }

    // Load existing analytics data (merge preferences/session count)
    loadAnalyticsData()

    // Start tracking
    isTracking.value = true
    updateActivity()

    // Location is optional; fetch in background (don't block tracking)
    try {
      const response = await fetch('/api/analytics/location', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      })
      if (response.ok) {
        const location = await response.json()
        if (analyticsData.value && location.country) {
          analyticsData.value.location = { country: location.country, city: location.city }
        }
      }
    } catch {
      // Location optional; fail silently
    }
  }

  // Load existing analytics from localStorage
  const loadAnalyticsData = () => {
    if (typeof window === 'undefined') return

    try {
      const stored = localStorage.getItem(ANALYTICS_KEY)
      if (stored) {
        const data = JSON.parse(stored)
        if (analyticsData.value && data.userId === analyticsData.value.userId) {
          // Merge existing preferences
          analyticsData.value.gamePreferences = data.gamePreferences || {}
          analyticsData.value.sessionsCount = (data.sessionsCount || 0) + 1
        }
      }
    } catch (error) {
      console.warn('Failed to load analytics data:', error)
    }
  }

  // Save analytics data
  const saveAnalyticsData = () => {
    if (typeof window === 'undefined' || !analyticsData.value) return

    try {
      localStorage.setItem(ANALYTICS_KEY, JSON.stringify(analyticsData.value))
    } catch (error) {
      console.warn('Failed to save analytics data:', error)
    }
  }

  // Post event to API with retry for robustness
  const postEvent = async (payload: Record<string, unknown>) => {
    let lastError: unknown
    for (let attempt = 0; attempt <= POST_EVENT_MAX_RETRIES; attempt++) {
      try {
        await $fetch('/api/analytics/event', { method: 'POST', body: payload })
        return
      } catch (e) {
        lastError = e
        if (attempt < POST_EVENT_MAX_RETRIES) {
          await new Promise(r => setTimeout(r, POST_EVENT_RETRY_MS))
        }
      }
    }
    console.warn('Failed to post analytics event after retries', lastError)
  }

  const trackGameSelection = (gameName: string) => {
    if (!analyticsData.value) return

    analyticsData.value.gamePreferences[gameName] = 
      (analyticsData.value.gamePreferences[gameName] || 0) + 1
    
    updateActivity()
    saveAnalyticsData()

    // server-side
    postEvent({
      type: 'game_select',
      userId: analyticsData.value.userId,
      sessionId: analyticsData.value.sessionId,
      game: gameName,
    })

    console.log(`🎮 Game tracked: ${gameName}`)
  }

  // Track page view – always send to API (use getUserId/getSessionId if composable not ready)
  const trackPageView = (pageName: string) => {
    const userId = analyticsData.value?.userId ?? getUserId()
    const sessionId = analyticsData.value?.sessionId ?? getSessionId()
    if (analyticsData.value) {
      updateActivity()
    }

    // Always send to API so server has accurate counts (single-device users don't use socket)
    postEvent({
      type: 'page_view',
      userId,
      sessionId,
      page: pageName,
    })

    // Also send to Socket.IO for real-time tracking when in multiplayer flow
    try {
      const { socket } = useMultiplayer()
      if (socket && typeof socket.emit === 'function' && socket.connected) {
        socket.emit('analytics:page-view', {
          page: pageName,
          userId,
          sessionId,
        })
      }
    } catch {
      // Socket not available; API is source of truth
    }
  }

  // Update last activity
  const updateActivity = () => {
    if (analyticsData.value) {
      analyticsData.value.lastActivity = Date.now()
    }
  }

  // Get analytics summary
  const getAnalyticsSummary = () => {
    if (!analyticsData.value) return null

    const totalGamesPlayed = Object.values(analyticsData.value.gamePreferences)
      .reduce((sum, count) => sum + count, 0)

    const favoriteGame = Object.entries(analyticsData.value.gamePreferences)
      .sort(([,a], [,b]) => b - a)[0]

    return {
      userId: analyticsData.value.userId,
      sessionId: analyticsData.value.sessionId,
      sessionsCount: analyticsData.value.sessionsCount,
      totalGamesPlayed,
      favoriteGame: favoriteGame ? favoriteGame[0] : 'None',
      gamePreferences: analyticsData.value.gamePreferences,
      location: analyticsData.value.location,
      sessionDuration: Math.round((Date.now() - analyticsData.value.timestamp) / 1000 / 60), // in minutes
    }
  }

  // Lifecycle management
  onMounted(() => {
    initializeAnalytics()

    const saveInterval = setInterval(saveAnalyticsData, 5 * 60 * 1000)

    const handleVisibilityChange = () => {
      if (document.hidden) {
        saveAnalyticsData()
      } else {
        updateActivity()
      }
    }
    document.addEventListener('visibilitychange', handleVisibilityChange)

    onBeforeUnmount(() => {
      clearInterval(saveInterval)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      saveAnalyticsData()
    })
  })

  return {
    isTracking,
    currentUsers,
    analyticsData,
    trackGameSelection,
    trackPageView,
    getAnalyticsSummary,
    updateActivity
  }
}

// Global analytics for admin dashboard
export const getGlobalAnalytics = async () => {
  try {
    const stats = await $fetch('/api/analytics/stats')
    return stats
  } catch (e) {
    console.warn('Failed to fetch global analytics', e)
    return null
  }
}
