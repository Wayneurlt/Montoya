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
  nextUpPlayer?: { socketId: string; nickname: string } | null
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

    // Get server URL from runtime config or use current origin
    const config = useRuntimeConfig()
    const serverUrl = config.public.socketUrl || window.location.origin

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
      
      // Trigger auto-reconnect check (will be handled by pages or watchers)
      // We can't call joinRoom here as it's not defined yet, so we'll rely on
      // the page-level reconnection logic
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
      
      // Store room info for reconnection
      if (typeof window !== 'undefined' && data.roomCode) {
        const existingInfo = localStorage.getItem('multiplayer_room')
        let roomInfo: any = {}
        if (existingInfo) {
          try {
            roomInfo = JSON.parse(existingInfo)
          } catch (e) {
            roomInfo = {}
          }
        }
        localStorage.setItem('multiplayer_room', JSON.stringify({
          ...roomInfo,
          roomCode: data.roomCode,
          isHost: true,
        }))
      }
    })

    socket.on('room:joined', (data: RoomState) => {
      roomState.value = data
      console.log('✅ Room joined:', data.roomCode)
      console.log('👑 Host check:', {
        hostSocketId: roomState.value.hostSocketId,
        mySocketId: socket?.id,
        isHost: isHost.value,
        players: data.players
      })
      
      // Store room info for reconnection
      if (typeof window !== 'undefined' && data.roomCode) {
        const existingInfo = localStorage.getItem('multiplayer_room')
        let roomInfo: any = {}
        if (existingInfo) {
          try {
            roomInfo = JSON.parse(existingInfo)
          } catch (e) {
            roomInfo = {}
          }
        }
        
        // Get nickname from current player if available
        const myPlayer = data.players.find((p: any) => p.socketId === socket?.id)
        const nickname = myPlayer?.nickname || roomInfo.nickname
        
        localStorage.setItem('multiplayer_room', JSON.stringify({
          ...roomInfo,
          roomCode: data.roomCode,
          nickname: nickname || roomInfo.nickname,
          isHost: isHost.value,
        }))
      }
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
      
      // Store room info for reconnection whenever room syncs
      if (typeof window !== 'undefined' && data.roomCode) {
        const existingInfo = localStorage.getItem('multiplayer_room')
        let roomInfo: any = {}
        if (existingInfo) {
          try {
            roomInfo = JSON.parse(existingInfo)
          } catch (e) {
            roomInfo = {}
          }
        }
        localStorage.setItem('multiplayer_room', JSON.stringify({
          ...roomInfo,
          roomCode: data.roomCode,
          isHost: isHost.value,
        }))
      }
    })

    socket.on('game:state:update', (data: {
      currentGame: string | null
      gamePhase: 'lobby' | 'playing' | 'voting' | 'results'
      currentPrompt: any
      nextUpPlayer?: { socketId: string; nickname: string } | null
    }) => {
      roomState.value.currentGame = data.currentGame
      roomState.value.gamePhase = data.gamePhase
      roomState.value.currentPrompt = data.currentPrompt
      roomState.value.nextUpPlayer = data.nextUpPlayer ?? null
      console.log('🎮 Game state updated:', data)
    })

    // Private prompt delivery: only host + selected player receive the full question text.
    socket.on('game:prompt:private', (prompt: any) => {
      try {
        const current = roomState.value.currentPrompt
        if (!current || !prompt?.promptId) return
        if (current.promptId !== prompt.promptId) return

        // Merge the full prompt (including text) into local state for this client.
        roomState.value.currentPrompt = {
          ...current,
          ...prompt,
        }

        // Acknowledge receipt so the room can "wait until player got it".
        socket?.emit('game:prompt:received', { promptId: prompt.promptId })
      } catch (e) {
        console.error('Failed handling private prompt:', e)
      }
    })

    socket.on('game:vote:update', (data: {
      votes: VoteData[]
      totalVotes: number
      totalPlayers: number
      allVoted?: boolean
    }) => {
      votes.value = data.votes
      console.log('🗳️ Votes updated:', data)
    })

    socket.on('ring:notify', (data: {
      playerName: string
      message: string
    }) => {
      // Only show notification to the host (event is broadcast to whole room)
      if (!isHost.value) return
      console.log('🔔 Ring notification (host):', data.message)
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('host-ring', { detail: data }))
      }
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
    nickname?: string
    gender?: 'male' | 'female' | 'other'
  }) => {
    if (!socket || !socket.connected) {
      connect()
    }

    if (socket) {
      socket.emit('room:create', {
        roomName: options.roomName,
        maxPlayers: options.maxPlayers || 8,
        answerVisibility: options.answerVisibility || 'anonymous',
        nickname: options.nickname,
        gender: options.gender,
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

  // Skip question
  const skipQuestion = (prompt?: any) => {
    if (socket && socket.connected && isHost.value) {
      socket.emit('game:skip', { prompt })
    }
  }

  // End game and return to lobby (keeps players in room)
  const endGame = () => {
    if (socket && socket.connected && isHost.value) {
      socket.emit('game:end')
    }
  }

  // Leave room – clear in-memory state and persisted room so next visit is fresh
  const leaveRoom = () => {
    if (socket && socket.connected) {
      socket.emit('room:leave')
    }
    disconnect()
    if (typeof window !== 'undefined') {
      localStorage.removeItem('multiplayer_room')
    }
  }

  // Ring host to notify them players are waiting
  const ringHost = () => {
    if (socket && socket.connected) {
      socket.emit('room:ring-host')
    }
  }

  // Auto-reconnect helper - call this after socket connects
  const attemptAutoReconnect = () => {
    if (typeof window !== 'undefined' && isConnected.value && !roomState.value.roomCode) {
      const roomInfo = localStorage.getItem('multiplayer_room')
      if (roomInfo) {
        try {
          const info = JSON.parse(roomInfo)
          if (info.roomCode && info.nickname) {
            console.log('🔄 Auto-reconnecting to room:', info.roomCode, 'as', info.nickname)
            joinRoom(info.roomCode, info.nickname, info.gender)
          }
        } catch (e) {
          console.error('Failed to parse room info for auto-reconnect:', e)
        }
      }
    }
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
    skipQuestion,
    endGame,
    leaveRoom,
    ringHost,
    attemptAutoReconnect,
    socket, // Export socket for analytics
  }
}

