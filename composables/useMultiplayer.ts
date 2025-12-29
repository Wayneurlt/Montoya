import { ref, computed } from 'vue'
import { io, Socket } from 'socket.io-client'

// Room state interface
export interface RoomPlayer {
  socketId: string
  nickname: string
  gender?: 'male' | 'female' | 'other'
  isHost: boolean
  connected: boolean
}

export interface RoomState {
  roomId: string | null
  roomCode: string | null
  roomName?: string
  hostSocketId: string | null
  players: RoomPlayer[]
  maxPlayers: number
  answerVisibility: 'anonymous' | 'public'
  currentGame: string | null
  gamePhase: 'lobby' | 'playing' | 'voting' | 'results'
  currentPrompt: any
}

export interface VoteData {
  socketId?: string
  nickname?: string
  vote: any
}

// Global socket instance
let socket: Socket | null = null

// Reactive state
const isConnected = ref(false)
const roomState = ref<RoomState>({
  roomId: null,
  roomCode: null,
  roomName: undefined,
  hostSocketId: null,
  players: [],
  maxPlayers: 8,
  answerVisibility: 'anonymous',
  currentGame: null,
  gamePhase: 'lobby',
  currentPrompt: null,
})

const votes = ref<VoteData[]>([])
const error = ref<string | null>(null)
const isHost = computed(() => {
  // Get socket from the connect function's closure
  const currentSocket = socket
  if (!currentSocket || !currentSocket.id || !roomState.value.hostSocketId) {
    return false
  }
  return roomState.value.hostSocketId === currentSocket.id
})

// Computed properties
const playerCount = computed(() => roomState.value.players.length)
const canStartGame = computed(() => {
  return isHost.value && 
         roomState.value.gamePhase === 'lobby' && 
         playerCount.value >= 2
})

const myPlayer = computed(() => {
  if (!socket) return null
  return roomState.value.players.find(p => p.socketId === socket?.id)
})

export const useMultiplayer = () => {
  // Initialize socket connection
  const connect = () => {
    if (socket?.connected) {
      return socket
    }

    if (typeof window === 'undefined') {
      return null
    }

    // Get server URL from environment or use current origin
    const serverUrl = process.env.NUXT_PUBLIC_SOCKET_URL || window.location.origin

    socket = io(serverUrl, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
    })

    socket.on('connect', () => {
      console.log('✅ Connected to server:', socket?.id)
      isConnected.value = true
      error.value = null
    })

    socket.on('disconnect', () => {
      console.log('❌ Disconnected from server')
      isConnected.value = false
    })

    socket.on('connect_error', (err) => {
      console.error('❌ Connection error:', err)
      error.value = 'Failed to connect to server. Please refresh the page.'
      isConnected.value = false
    })

    socket.on('room:created', (data: {
      roomId: string
      roomCode: string
      roomName?: string
      maxPlayers: number
      answerVisibility: 'anonymous' | 'public'
      hostSocketId: string
    }) => {
      roomState.value.roomId = data.roomId
      roomState.value.roomCode = data.roomCode
      roomState.value.roomName = data.roomName
      roomState.value.maxPlayers = data.maxPlayers
      roomState.value.answerVisibility = data.answerVisibility
      roomState.value.hostSocketId = data.hostSocketId
      console.log('🏠 Room created:', data.roomCode, 'hostSocketId:', data.hostSocketId, 'mySocketId:', socket?.id, 'isHost:', isHost.value)
    })

    socket.on('room:sync', (data: RoomState) => {
      roomState.value = data
      console.log('🔄 Room synced:', data.roomCode)
      console.log('👑 Host check:', {
        hostSocketId: roomState.value.hostSocketId,
        mySocketId: socket?.id,
        isHost: isHost.value,
        players: data.players
      })
    })

    socket.on('game:state:update', (data: {
      currentGame: string | null
      gamePhase: 'lobby' | 'playing' | 'voting' | 'results'
      currentPrompt: any
    }) => {
      roomState.value.currentGame = data.currentGame
      roomState.value.gamePhase = data.gamePhase
      roomState.value.currentPrompt = data.currentPrompt
      console.log('🎮 Game state updated:', data)
    })

    socket.on('game:vote:update', (data: {
      votes: VoteData[]
      totalVotes: number
      totalPlayers: number
    }) => {
      votes.value = data.votes
      console.log('🗳️ Votes updated:', data)
    })

    socket.on('game:results', (data: {
      results: VoteData[]
      answerVisibility: 'anonymous' | 'public'
    }) => {
      votes.value = data.results
      roomState.value.gamePhase = 'results'
      console.log('📊 Results:', data)
    })

    socket.on('room:error', (data: { message: string }) => {
      error.value = data.message
      console.error('❌ Room error:', data.message)
    })

    socket.on('game:ended', (data: { message: string }) => {
      console.log('🎮 Game ended:', data.message)
      // Reset game state
      roomState.value.gamePhase = 'lobby'
      roomState.value.currentGame = null
      roomState.value.currentPrompt = null
      votes.value = []
      // Navigate to lobby
      if (typeof window !== 'undefined') {
        navigateTo('/lobby')
      }
    })

    return socket
  }

  // Disconnect socket
  const disconnect = () => {
    if (socket) {
      socket.disconnect()
      socket = null
      isConnected.value = false
      roomState.value = {
        roomId: null,
        roomCode: null,
        roomName: undefined,
        hostSocketId: null,
        players: [],
        maxPlayers: 8,
        answerVisibility: 'anonymous',
        currentGame: null,
        gamePhase: 'lobby',
        currentPrompt: null,
      }
      votes.value = []
      error.value = null
    }
  }

  // Create room
  const createRoom = (options: {
    roomName?: string
    maxPlayers?: number
    answerVisibility?: 'anonymous' | 'public'
  }) => {
    if (!socket || !socket.connected) {
      connect()
    }

    if (socket) {
      socket.emit('room:create', {
        roomName: options.roomName,
        maxPlayers: options.maxPlayers || 8,
        answerVisibility: options.answerVisibility || 'anonymous',
      })
    }
  }

  // Join room
  const joinRoom = (roomCode: string, nickname: string, gender?: 'male' | 'female' | 'other') => {
    if (!socket || !socket.connected) {
      connect()
    }

    if (socket) {
      socket.emit('room:join', {
        roomCode: roomCode.toUpperCase(),
        nickname,
        gender,
      })
    }
  }

  // Update nickname and gender
  const updateNickname = (nickname: string, gender?: 'male' | 'female' | 'other') => {
    if (socket && socket.connected) {
      socket.emit('player:update', { nickname, gender })
    }
  }

  // Start game
  const startGame = (gameType: string, prompt?: any) => {
    if (socket && socket.connected && isHost.value) {
      socket.emit('game:start', { gameType, prompt })
    }
  }

  // Submit vote
  const submitVote = (vote: any) => {
    if (socket && socket.connected) {
      socket.emit('game:vote', { vote })
    }
  }

  // Show results
  const showResults = () => {
    if (socket && socket.connected && isHost.value) {
      socket.emit('game:results')
    }
  }

  // Next round
  const nextRound = (prompt?: any) => {
    if (socket && socket.connected && isHost.value) {
      socket.emit('game:next', { prompt })
    }
  }

  // End game and return to lobby (keeps players in room)
  const endGame = () => {
    if (socket && socket.connected && isHost.value) {
      socket.emit('game:end')
    }
  }

  // Leave room
  const leaveRoom = () => {
    if (socket && socket.connected) {
      socket.emit('room:leave')
    }
    disconnect()
  }

  return {
    // State
    isConnected: readonly(isConnected),
    roomState: readonly(roomState),
    votes: readonly(votes),
    error: readonly(error),
    isHost,
    myPlayer: readonly(myPlayer),
    
    // Computed
    playerCount,
    canStartGame,
    
    // Methods
    connect,
    disconnect,
    createRoom,
    joinRoom,
    updateNickname,
    startGame,
    submitVote,
    showResults,
    nextRound,
    endGame,
    leaveRoom,
  }
}

