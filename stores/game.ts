import { defineStore } from 'pinia'

export type RelationshipType = 'strangers' | 'friends' | 'dating' | 'couple' | 'mixed'
export type ComfortLevel = 'chill' | 'spicy' | 'wild'
export type GameMode = 'free-for-all' | 'relationship' | 'connection'
export type GameType = 
  // Family games
  | 'charades' 
  | 'imposter' 
  | 'mr-white'
  // Adult games
  | 'truth-or-dare' 
  | 'dice-of-desire' 
  | 'do-or-drink' 
  | 'never-have-i-ever' 
  | 'most-likely-to' 
  | 'would-you-rather'

export interface Player {
  id: string
  name: string
  gender?: 'male' | 'female' | 'other'
  partnerId?: string
}

export interface GameState {
  // Setup data
  players: Player[]
  relationshipType: RelationshipType | null
  comfortLevel: ComfortLevel | null
  gameMode: GameMode | null
  selectedGame: GameType | null
  isFamilyMode: boolean
  
  // Game state
  currentRound: number
  currentPlayerIndex: number
  promptHistory: string[]
  skipsUsed: number
  icebreakerRoundsCompleted: number
  isIcebreakerPhase: boolean
  
  // Two-player specific
  isTwoPlayerMode: boolean
  mirrorRoundActive: boolean
  guessModeActive: boolean
  
  // Dynamic escalation
  intensityLevel: number // 1-5, starts at 1, escalates based on rounds/skips
}

export const useGameStore = defineStore('game', {
  state: (): GameState => ({
    players: [],
    relationshipType: null,
    comfortLevel: null,
    gameMode: null,
    selectedGame: null,
    isFamilyMode: false,
    currentRound: 0,
    currentPlayerIndex: 0,
    promptHistory: [],
    skipsUsed: 0,
    icebreakerRoundsCompleted: 0,
    isIcebreakerPhase: true,
    isTwoPlayerMode: false,
    mirrorRoundActive: false,
    guessModeActive: false,
    intensityLevel: 1,
  }),

  getters: {
    currentPlayer: (state): Player | null => {
      return state.players[state.currentPlayerIndex] || null
    },
    
    playerCount: (state): number => {
      return state.players.length
    },
    
    canStartGame: (state): boolean => {
      // For family mode, only need players and game selection
      if (state.isFamilyMode) {
        return (
          state.players.length >= 2 &&
          state.selectedGame !== null &&
          state.players.every(p => p.name.trim() !== '')
        )
      }
      
      // For adult mode, need all settings
      return (
        state.players.length >= 2 &&
        state.relationshipType !== null &&
        state.comfortLevel !== null &&
        state.gameMode !== null &&
        state.selectedGame !== null &&
        state.players.every(p => p.name.trim() !== '')
      )
    },
    
    shouldShowIcebreakers: (state): boolean => {
      // Show icebreakers for strangers, first rounds, or connection mode
      return (
        state.isIcebreakerPhase &&
        (state.relationshipType === 'strangers' ||
         state.currentRound < 3 ||
         state.gameMode === 'connection')
      )
    },
    
    maxIntensity: (state): number => {
      // Map comfort level to max intensity
      switch (state.comfortLevel) {
        case 'chill': return 2
        case 'spicy': return 4
        case 'wild': return 5
        default: return 3
      }
    },
    
    targetIntensity: (state): number => {
      // Calculate target intensity based on rounds, skips, and comfort level
      const baseIntensity = Math.min(
        state.intensityLevel,
        state.maxIntensity
      )
      
      // Escalate based on rounds
      const roundBonus = Math.floor(state.currentRound / 5)
      
      // Escalate based on skips (more skips = more comfortable = can handle more)
      const skipBonus = Math.min(Math.floor(state.skipsUsed / 3), 1)
      
      return Math.min(baseIntensity + roundBonus + skipBonus, state.maxIntensity)
    },
  },

  actions: {
    // Setup actions
    setPlayers(players: Player[]) {
      this.players = players
      this.isTwoPlayerMode = players.length === 2
      
      // Auto-enable connection mode for 2 players or strangers
      if (players.length === 2 && !this.gameMode) {
        this.gameMode = 'connection'
      }
    },
    
    addPlayer(player: Player) {
      this.players.push(player)
      this.isTwoPlayerMode = this.players.length === 2
    },
    
    removePlayer(playerId: string) {
      this.players = this.players.filter(p => p.id !== playerId)
      // Remove this player as partner from others
      this.players.forEach(p => {
        if (p.partnerId === playerId) {
          p.partnerId = undefined
        }
      })
      this.isTwoPlayerMode = this.players.length === 2
    },
    
    setRelationshipType(type: RelationshipType) {
      this.relationshipType = type
      
      // Auto-adjust game mode for strangers
      if (type === 'strangers' && !this.gameMode) {
        this.gameMode = 'connection'
      }
    },
    
    setComfortLevel(level: ComfortLevel) {
      this.comfortLevel = level
    },
    
    setGameMode(mode: GameMode) {
      this.gameMode = mode
    },
    
    setSelectedGame(game: GameType) {
      this.selectedGame = game
    },
    
    setFamilyMode(isFamilyMode: boolean) {
      this.isFamilyMode = isFamilyMode
    },
    
    // Game state actions
    nextTurn() {
      this.currentPlayerIndex = (this.currentPlayerIndex + 1) % this.players.length
      if (this.currentPlayerIndex === 0) {
        this.currentRound++
        // Check if we should exit icebreaker phase
        if (this.isIcebreakerPhase && this.currentRound >= 3) {
          this.isIcebreakerPhase = false
        }
      }
    },
    
    addPromptToHistory(prompt: string) {
      this.promptHistory.push(prompt)
      // Keep only last 50 prompts
      if (this.promptHistory.length > 50) {
        this.promptHistory.shift()
      }
    },
    
    useSkip() {
      this.skipsUsed++
    },
    
    escalateIntensity() {
      if (this.intensityLevel < this.maxIntensity) {
        this.intensityLevel++
      }
    },
    
    completeIcebreakerRound() {
      this.icebreakerRoundsCompleted++
      if (this.icebreakerRoundsCompleted >= 3) {
        this.isIcebreakerPhase = false
      }
    },
    
    // Two-player specific actions
    activateMirrorRound() {
      this.mirrorRoundActive = true
    },
    
    deactivateMirrorRound() {
      this.mirrorRoundActive = false
    },
    
    activateGuessMode() {
      this.guessModeActive = true
    },
    
    deactivateGuessMode() {
      this.guessModeActive = false
    },
    
    // Reset and initialization
    resetGame() {
      this.currentRound = 0
      this.currentPlayerIndex = 0
      this.promptHistory = []
      this.skipsUsed = 0
      this.icebreakerRoundsCompleted = 0
      this.isIcebreakerPhase = true
      this.mirrorRoundActive = false
      this.guessModeActive = false
      this.intensityLevel = 1
    },
    
    resetSetup() {
      this.players = []
      this.relationshipType = null
      this.comfortLevel = null
      this.gameMode = null
      this.selectedGame = null
      this.isFamilyMode = false
      this.resetGame()
    },
    
    // Persistence
    saveToLocalStorage() {
      if (typeof window !== 'undefined') {
        const state = {
          players: this.players,
          relationshipType: this.relationshipType,
          comfortLevel: this.comfortLevel,
          gameMode: this.gameMode,
          selectedGame: this.selectedGame,
          isFamilyMode: this.isFamilyMode,
          currentRound: this.currentRound,
          currentPlayerIndex: this.currentPlayerIndex,
          intensityLevel: this.intensityLevel,
        }
        localStorage.setItem('montoya_game_state', JSON.stringify(state))
      }
    },
    
    loadFromLocalStorage() {
      if (typeof window !== 'undefined') {
        const stored = localStorage.getItem('montoya_game_state')
        if (stored) {
          try {
            const state = JSON.parse(stored)
            this.players = state.players || []
            this.relationshipType = state.relationshipType || null
            this.comfortLevel = state.comfortLevel || null
            this.gameMode = state.gameMode || null
            this.selectedGame = state.selectedGame || null
            this.isFamilyMode = state.isFamilyMode || false
            this.currentRound = state.currentRound || 0
            this.currentPlayerIndex = state.currentPlayerIndex || 0
            this.intensityLevel = state.intensityLevel || 1
            this.isTwoPlayerMode = this.players.length === 2
          } catch (error) {
            console.error('Failed to load game state:', error)
          }
        }
      }
    },
  },
})




