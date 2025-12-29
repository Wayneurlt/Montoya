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

// Get or create user ID
const getUserId = (): string => {
  if (typeof window === 'undefined') return ''
  
  let userId = localStorage.getItem(USER_KEY)
  if (!userId) {
    userId = generateId()
    localStorage.setItem(USER_KEY, userId)
  }
  return userId
}

// Get or create session ID
const getSessionId = (): string => {
  if (typeof window === 'undefined') return ''
  
  let sessionId = sessionStorage.getItem(SESSION_KEY)
  if (!sessionId) {
    sessionId = generateId()
    sessionStorage.setItem(SESSION_KEY, sessionId)
  }
  return sessionId
}

// Analytics composable
export const useAnalytics = () => {
  const isTracking = ref(false)
  const currentUsers = ref(0)
  const analyticsData = ref<AnalyticsData | null>(null)

  // Initialize analytics
  const initializeAnalytics = async () => {
    if (typeof window === 'undefined') return

    const userId = getUserId()
    const sessionId = getSessionId()
    
    analyticsData.value = {
      sessionId,
      userId,
      timestamp: Date.now(),
      userAgent: navigator.userAgent,
      gamePreferences: {},
      sessionsCount: 1,
      lastActivity: Date.now()
    }

    // Try to get location (optional) - using server-side proxy to avoid CORS
    try {
      const response = await fetch('/api/analytics/location', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })
      if (response.ok) {
        const location = await response.json()
        if (analyticsData.value && location.country) {
          analyticsData.value.location = {
            country: location.country,
            city: location.city
          }
        }
      }
    } catch (error) {
      // Location detection is optional, fail silently
      console.log('Location detection disabled:', error)
    }

    // Load existing analytics data
    loadAnalyticsData()
    
    // Start tracking
    isTracking.value = true
    updateActivity()

    console.log('📊 Analytics initialized for user:', userId)
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

  // Track game selection
  const postEvent = async (payload: any) => {
    try {
      await $fetch('/api/analytics/event', { method: 'POST', body: payload })
    } catch (e) {
      console.warn('Failed to post analytics event', e)
    }
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

  // Track page view
  const trackPageView = (pageName: string) => {
    if (!analyticsData.value) return

    updateActivity()
    postEvent({
      type: 'page_view',
      userId: analyticsData.value.userId,
      sessionId: analyticsData.value.sessionId,
      page: pageName,
    })
    console.log(`📄 Page view: ${pageName}`)
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

  // Simulate current users (in a real app, this would come from a server)
  const updateCurrentUsers = () => {
    // Simulate 5-50 users based on time of day
    const hour = new Date().getHours()
    const baseUsers = Math.max(5, Math.floor(Math.random() * 50))
    const timeMultiplier = hour >= 18 && hour <= 23 ? 1.5 : hour >= 6 && hour <= 18 ? 1.2 : 0.7
    currentUsers.value = Math.floor(baseUsers * timeMultiplier)
  }

  // Lifecycle management
  onMounted(() => {
    initializeAnalytics()
    updateCurrentUsers()
    
    // Update current users every 30 seconds
    const userInterval = setInterval(updateCurrentUsers, 30000)
    
    // Save analytics every 5 minutes
    const saveInterval = setInterval(saveAnalyticsData, 5 * 60 * 1000)

    // Track page visibility changes
    const handleVisibilityChange = () => {
      if (document.hidden) {
        saveAnalyticsData()
      } else {
        updateActivity()
      }
    }
    
    document.addEventListener('visibilitychange', handleVisibilityChange)

    // Cleanup
    onBeforeUnmount(() => {
      clearInterval(userInterval)
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
