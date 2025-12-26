import { ref, computed } from 'vue'
import { useGameStore } from '~/stores/game'
import { useGameLogic } from '~/composables/useGameLogic'
import { generateIcebreakerPrompt } from '~/utils/promptFilter'

/**
 * Composable for group games (Never Have I Ever, Would You Rather, Most Likely To)
 * These games don't need individual player tracking but should respect game context
 */
export function useGroupGame() {
  const gameStore = useGameStore()
  const gameLogic = useGameLogic()

  const showIcebreaker = ref(false)
  const icebreakerPrompt = ref('')

  /**
   * Get icebreaker prompt if needed
   */
  const getIcebreakerIfNeeded = (): string | null => {
    if (gameLogic.shouldUseIcebreaker()) {
      const prompt = gameLogic.getIcebreakerPrompt('TRUTH')
      if (prompt) {
        showIcebreaker.value = true
        icebreakerPrompt.value = prompt
        return prompt
      }
    }
    showIcebreaker.value = false
    return null
  }

  /**
   * Adapt question for game context
   */
  const adaptQuestion = (question: string, intensity: number): string => {
    // Check for icebreaker first
    const icebreaker = getIcebreakerIfNeeded()
    if (icebreaker) {
      return icebreaker
    }

    // Adapt based on context
    return gameLogic.adaptPrompt(question, intensity)
  }

  /**
   * Complete a round
   */
  const completeRound = () => {
    if (gameStore.isIcebreakerPhase) {
      gameStore.completeIcebreakerRound()
    }
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
    showIcebreaker,
    icebreakerPrompt,
    adaptQuestion,
    completeRound,
    getIntensityFilter,
    addToHistory,
    gameStore,
    gameLogic,
  }
}




