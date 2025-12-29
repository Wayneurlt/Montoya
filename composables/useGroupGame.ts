import { ref, computed } from 'vue'
import { useGameStore } from '~/stores/game'
import { useGameLogic } from '~/composables/useGameLogic'

/**
 * Composable for group games (Never Have I Ever, Would You Rather, Most Likely To)
 * These games don't need individual player tracking but should respect game context
 */
export function useGroupGame() {
  const gameStore = useGameStore()
  const gameLogic = useGameLogic()

  /**
   * Adapt question for game context
   */
  const adaptQuestion = (question: string, intensity: number): string => {
    // Adapt based on context
    return gameLogic.adaptPrompt(question, intensity)
  }

  /**
   * Complete a round
   */
  const completeRound = () => {
    gameStore.nextTurn()
    
    // Escalate intensity occasionally
    if (Math.random() > 0.7 && gameStore.intensityLevel < gameStore.maxIntensity) {
      gameStore.escalateIntensity()
    }
  }

  /**
   * Get intensity filter for API calls
   */
  const getIntensityFilter = (): number => {
    return gameLogic.getIntensityFilter()
  }

  /**
   * Add question to history
   */
  const addToHistory = (question: string) => {
    gameStore.addPromptToHistory(question)
  }

  return {
    adaptQuestion,
    completeRound,
    getIntensityFilter,
    addToHistory,
    gameStore,
    gameLogic,
  }
}




