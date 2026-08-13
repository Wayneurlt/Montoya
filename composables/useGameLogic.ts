import { computed } from 'vue'
import { useGameStore } from '~/stores/game'
import type { GameMode } from '~/stores/game'
import { adaptPromptForTwoPlayer } from '~/utils/promptFilter'

export function useGameLogic() {
  const gameStore = useGameStore()

  /**
   * Get the current prompt context for filtering
   */
  const getPromptContext = () => {
    return {
      gameMode: gameStore.gameMode!,
      playerCount: gameStore.playerCount,
      currentRound: gameStore.currentRound,
      intensityLevel: gameStore.intensityLevel,
      isTwoPlayerMode: gameStore.isTwoPlayerMode,
    }
  }

  /**
   * Filter and adapt a prompt based on game context
   */
  const adaptPrompt = (
    prompt: string,
    promptIntensity: number
  ): string => {
    const context = getPromptContext()

    // Two-player mode: personalize prompts
    if (context.isTwoPlayerMode && gameStore.players.length === 2) {
      const [player1, player2] = gameStore.players
      prompt = adaptPromptForTwoPlayer(prompt, player1.name, player2.name)
    }

    return prompt
  }

  /**
   * Get target player based on game mode
   */
  const getTargetPlayer = () => {
    const currentPlayer = gameStore.currentPlayer
    if (!currentPlayer) return null

    const players = gameStore.players

    // Relationship mode: target is partner
    if (gameStore.gameMode === 'relationship') {
      return players.find((p) => p.id === currentPlayer.partnerId) || null
    }

    // Free-for-all: pick random other player
    const validTargets = players.filter((p) => p.id !== currentPlayer.id)
    if (validTargets.length === 0) return null
    return validTargets[Math.floor(Math.random() * validTargets.length)]
  }

  /**
   * Complete a round and advance game state
   */
  const completeRound = () => {
    // Advance turn
    gameStore.nextTurn()

    // Escalate intensity occasionally
    if (Math.random() > 0.7 && gameStore.intensityLevel < gameStore.maxIntensity) {
      gameStore.escalateIntensity()
    }
  }

  /**
   * Get intensity filter for database queries
   */
  const getIntensityFilter = (): number => {
    return gameStore.targetIntensity
  }

  return {
    getPromptContext,
    adaptPrompt,
    getTargetPlayer,
    completeRound,
    getIntensityFilter,
  }
}




