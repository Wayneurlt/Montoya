import type { GameMode } from '~/stores/game'

export interface PromptContext {
  gameMode: GameMode
  playerCount: number
  currentRound: number
  intensityLevel: number
  isTwoPlayerMode: boolean
}

/**
 * Adapt prompt for two-player mode
 */
export function adaptPromptForTwoPlayer(
  prompt: string,
  player1Name: string,
  player2Name: string
): string {
  // Replace generic terms with player names
  return prompt
    .replace(/someone/gi, player2Name)
    .replace(/anyone/gi, player2Name)
    .replace(/a person/gi, player2Name)
    .replace(/your partner/gi, player2Name)
    .replace(/the other person/gi, player2Name)
}




