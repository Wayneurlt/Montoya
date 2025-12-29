import type { GameMode } from '~/stores/game'

export interface PromptContext {
  gameMode: GameMode
  playerCount: number
  currentRound: number
  intensityLevel: number
  isTwoPlayerMode: boolean
}

/**
 * Determines if a prompt should be shown based on context
 */
export function shouldShowPrompt(
  promptIntensity: number,
  context: PromptContext
): boolean {
  // Default max intensity is 5 (wild)
  const maxIntensity = 5
  
  if (promptIntensity > maxIntensity) {
    return false
  }

  // Connection mode: filter out isolating prompts
  if (context.gameMode === 'connection') {
    // In connection mode, prefer prompts that create dialogue
    // This is handled at the prompt generation level, not filtering
    return true
  }

  return promptIntensity <= context.intensityLevel
}

/**
 * Check if prompt is suitable for connection mode
 */
export function isConnectionModePrompt(promptText: string): boolean {
  const connectionKeywords = [
    'ask',
    'explain',
    'share',
    'tell',
    'describe',
    'discuss',
    'talk about',
    'reveal',
    'confess',
    'admit',
  ]

  const isolatingKeywords = [
    'alone',
    'by yourself',
    'without',
    'secretly',
    'privately',
  ]

  const lowerText = promptText.toLowerCase()

  // Check for isolating keywords (bad for connection mode)
  if (isolatingKeywords.some(keyword => lowerText.includes(keyword))) {
    return false
  }

  // Check for connection keywords (good for connection mode)
  return connectionKeywords.some(keyword => lowerText.includes(keyword))
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

/**
 * Check if prompt should trigger mirror round
 */
export function shouldTriggerMirrorRound(round: number, isTwoPlayer: boolean): boolean {
  if (!isTwoPlayer) return false
  // Every 3rd round in two-player mode
  return round % 3 === 0
}

/**
 * Check if prompt should trigger guess mode
 */
export function shouldTriggerGuessMode(round: number, isTwoPlayer: boolean): boolean {
  if (!isTwoPlayer) return false
  // Every 5th round in two-player mode
  return round % 5 === 0
}




