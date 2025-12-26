import type { RelationshipType, ComfortLevel, GameMode } from '~/stores/game'

export interface PromptContext {
  relationshipType: RelationshipType
  comfortLevel: ComfortLevel
  gameMode: GameMode
  playerCount: number
  currentRound: number
  intensityLevel: number
  isIcebreakerPhase: boolean
  isTwoPlayerMode: boolean
}

/**
 * Determines if a prompt should be shown based on context
 */
export function shouldShowPrompt(
  promptIntensity: number,
  context: PromptContext
): boolean {
  // Icebreaker phase: only show low intensity prompts
  if (context.isIcebreakerPhase) {
    return promptIntensity <= 2
  }

  // Check if prompt intensity matches target
  const maxIntensity = getMaxIntensityForComfortLevel(context.comfortLevel)
  if (promptIntensity > maxIntensity) {
    return false
  }

  // Connection mode: filter out isolating prompts
  if (context.gameMode === 'connection') {
    // In connection mode, prefer prompts that create dialogue
    // This is handled at the prompt generation level, not filtering
    return true
  }

  // Relationship mode: can be more intense for couples
  if (context.gameMode === 'relationship') {
    if (context.relationshipType === 'couple' || context.relationshipType === 'dating') {
      return promptIntensity <= maxIntensity
    }
  }

  // Strangers: be more conservative
  if (context.relationshipType === 'strangers') {
    return promptIntensity <= Math.min(maxIntensity, 3)
  }

  return promptIntensity <= context.intensityLevel
}

/**
 * Get max intensity for a comfort level
 */
export function getMaxIntensityForComfortLevel(level: ComfortLevel): number {
  switch (level) {
    case 'chill':
      return 2
    case 'spicy':
      return 4
    case 'wild':
      return 5
    default:
      return 3
  }
}

/**
 * Get icebreaker intensity level
 */
export function getIcebreakerIntensity(round: number): number {
  // Gradually increase intensity across icebreaker rounds
  if (round === 0) return 1 // Safe & Fun
  if (round === 1) return 1 // Personal but Light
  if (round === 2) return 2 // Flirty / Curious (if allowed)
  return 2
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
 * Generate icebreaker prompts dynamically
 */
export function generateIcebreakerPrompt(
  round: number,
  context: PromptContext
): string {
  const prompts = {
    safe: [
      "What's one thing people always get wrong about you?",
      "Would you rather be famous or anonymous?",
      "What made you want to play this game?",
      "What's your go-to conversation starter?",
      "What's something you're secretly good at?",
      "What's the best piece of advice you've ever received?",
    ],
    personal: [
      "What's a small thing that makes you really happy?",
      "What's something you're working on improving about yourself?",
      "What's a memory that always makes you smile?",
      "What's something you wish more people knew about you?",
      "What's a goal you're currently working towards?",
    ],
    flirty: [
      "What's your idea of a perfect first date?",
      "What's something that instantly makes someone more attractive to you?",
      "What's a quality you find irresistible in someone?",
      "What's the most romantic thing someone has done for you?",
    ],
  }

  if (round === 0) {
    return prompts.safe[Math.floor(Math.random() * prompts.safe.length)]
  } else if (round === 1) {
    return prompts.personal[Math.floor(Math.random() * prompts.personal.length)]
  } else if (round === 2 && context.comfortLevel !== 'chill') {
    return prompts.flirty[Math.floor(Math.random() * prompts.flirty.length)]
  }

  return prompts.safe[Math.floor(Math.random() * prompts.safe.length)]
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




