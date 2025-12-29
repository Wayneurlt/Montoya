import { defineStore } from 'pinia'

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
  gameMode: GameMode | null
  selectedGame: GameType | null
  isFamilyMode: boolean
  
  // Game state
  currentRound: number
  currentPlayerIndex: number
  promptHistory: string[]
  skipsUsed: number
  
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
    gameMode: null,
    selectedGame: null,
    isFamilyMode: false,
    currentRound: 0,
    currentPlayerIndex: 0,
    promptHistory: [],
    skipsUsed: 0,
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
      
      // For adult mode, need players, game mode, and game selection
      return (
        state.players.length >= 2 &&
        state.gameMode !== null &&
        state.selectedGame !== null &&
        state.players.every(p => p.name.trim() !== '')
      )
    },
    
    maxIntensity: (state): number => {
      // Default to maximum intensity (wild)
      return 5
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
      
      // Auto-enable connection mode for 2 players
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
      this.mirrorRoundActive = false
      this.guessModeActive = false
      this.intensityLevel = 1
    },
    
    resetSetup() {
      this.players = []
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




