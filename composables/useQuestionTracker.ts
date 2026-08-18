import { ref, computed, readonly } from 'vue'

// Session storage keys
const STORAGE_KEYS = {
  TRUTH_NORMAL: 'montoya_used_truth_normal',
  TRUTH_SPICY: 'montoya_used_truth_spicy',
  DARE_NORMAL: 'montoya_used_dare_normal',
  DARE_SPICY: 'montoya_used_dare_spicy',
  DO_OR_DRINK: 'montoya_used_do_or_drink',
  NEVER_HAVE_I_EVER: 'montoya_used_never_have_i_ever',
  MOST_LIKELY_TO: 'montoya_used_most_likely_to',
  WOULD_YOU_RATHER: 'montoya_used_would_you_rather',
  SESSION_ID: 'montoya_session_id'
}

// Generate a unique session ID
const generateSessionId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 9)
}

// Get or create session ID
const getSessionId = () => {
  if (typeof window === 'undefined') return null
  
  let sessionId = localStorage.getItem(STORAGE_KEYS.SESSION_ID)
  if (!sessionId) {
    sessionId = generateSessionId()
    localStorage.setItem(STORAGE_KEYS.SESSION_ID, sessionId)
  }
  return sessionId
}

// Load used questions from storage
const loadUsedQuestions = (storageKey: string): Set<number> => {
  if (typeof window === 'undefined') return new Set()
  
  try {
    const stored = localStorage.getItem(storageKey)
    if (stored) {
      const data = JSON.parse(stored)
      return new Set(data.indices || [])
    }
  } catch (error) {
    console.warn('Failed to load used questions from storage:', error)
  }
  return new Set()
}

// Save used questions to storage
const saveUsedQuestions = (storageKey: string, usedSet: Set<number>) => {
  if (typeof window === 'undefined') return
  
  try {
    const data = {
      sessionId: getSessionId(),
      indices: Array.from(usedSet),
      timestamp: Date.now()
    }
    localStorage.setItem(storageKey, JSON.stringify(data))
  } catch (error) {
    console.warn('Failed to save used questions to storage:', error)
  }
}


// Hook for question tracking
export const useQuestionTracker = (questionPool: any[], storageKey: string) => {
  const usedQuestions = ref<Set<number>>(new Set())
  
  // Initialize used questions from storage on mount
  const initializeTracker = () => {
    usedQuestions.value = loadUsedQuestions(storageKey)
  }
  
  // Get next unique question. `excludeIndices` is an optional extra set of
  // indices to treat as used on top of this device's own history — used by
  // multiplayer to also exclude whatever the room has already shown (so a
  // host handoff mid-game doesn't repeat something a previous host already
  // picked, since this device's own localStorage wouldn't know about that).
  const getNextQuestion = (excludeIndices?: Set<number> | number[]) => {
    if (questionPool.length === 0) {
      throw new Error('Question pool is empty')
    }

    const excluded = excludeIndices instanceof Set ? excludeIndices : new Set(excludeIndices ?? [])

    // Get unused questions
    const unusedIndices = questionPool
      .map((_, index) => index)
      .filter(index => !usedQuestions.value.has(index) && !excluded.has(index))

    // If all questions have been used, start over but track usage
    if (unusedIndices.length === 0) {
      console.warn(`All questions in pool exhausted. Pool size: ${questionPool.length}`)
      // Instead of clearing, we'll pick a least recently used question
      // For now, we'll reset but this could be enhanced with LRU logic
      usedQuestions.value.clear()
      saveUsedQuestions(storageKey, usedQuestions.value)
      
      // Pick a random question since we've reset
      const randomIndex = Math.floor(Math.random() * questionPool.length)
      usedQuestions.value.add(randomIndex)
      saveUsedQuestions(storageKey, usedQuestions.value)
      return {
        question: questionPool[randomIndex],
        index: randomIndex,
        isRepeat: true
      }
    }
    
    // Pick a random unused question
    const randomUnusedIndex = unusedIndices[Math.floor(Math.random() * unusedIndices.length)]
    
    // Mark as used
    usedQuestions.value.add(randomUnusedIndex)
    saveUsedQuestions(storageKey, usedQuestions.value)
    
    return {
      question: questionPool[randomUnusedIndex],
      index: randomUnusedIndex,
      isRepeat: false
    }
  }
  
  // Get statistics about question usage
  const getUsageStats = computed(() => ({
    totalQuestions: questionPool.length,
    usedCount: usedQuestions.value.size,
    remainingCount: questionPool.length - usedQuestions.value.size,
    usagePercentage: questionPool.length > 0 ? 
      Math.round((usedQuestions.value.size / questionPool.length) * 100) : 0
  }))
  
  // Reset this specific tracker
  const resetTracker = () => {
    usedQuestions.value.clear()
    saveUsedQuestions(storageKey, usedQuestions.value)
  }
  
  // Check if a specific question has been used
  const isQuestionUsed = (index: number) => {
    return usedQuestions.value.has(index)
  }
  
  return {
    initializeTracker,
    getNextQuestion,
    getUsageStats,
    resetTracker,
    isQuestionUsed,
    usedQuestions: readonly(usedQuestions)
  }
}

// Specialized hooks for each game type
export const useTruthTracker = (questionPool: any[], isSpicy: boolean = false) => {
  const storageKey = isSpicy ? STORAGE_KEYS.TRUTH_SPICY : STORAGE_KEYS.TRUTH_NORMAL
  return useQuestionTracker(questionPool, storageKey)
}

export const useDareTracker = (questionPool: any[], isSpicy: boolean = false) => {
  const storageKey = isSpicy ? STORAGE_KEYS.DARE_SPICY : STORAGE_KEYS.DARE_NORMAL
  return useQuestionTracker(questionPool, storageKey)
}

export const useDoOrDrinkTracker = (questionPool: any[]) => {
  return useQuestionTracker(questionPool, STORAGE_KEYS.DO_OR_DRINK)
}

export const useNeverHaveIEverTracker = (questionPool: any[]) => {
  return useQuestionTracker(questionPool, STORAGE_KEYS.NEVER_HAVE_I_EVER)
}

export const useMostLikelyToTracker = (questionPool: any[]) => {
  return useQuestionTracker(questionPool, STORAGE_KEYS.MOST_LIKELY_TO)
}

export const useWouldYouRatherTracker = (questionPool: any[]) => {
  return useQuestionTracker(questionPool, STORAGE_KEYS.WOULD_YOU_RATHER)
}

// Utility function to get session statistics
