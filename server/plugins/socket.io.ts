import { Server } from 'socket.io'
import type { Server as HTTPServer, IncomingMessage } from 'http'
import jwt from 'jsonwebtoken'
import { realtimeAnalytics } from '~/server/utils/realtimeAnalytics'
import { JWT_SECRET } from '~/server/utils/jwtSecret'
import { extractMultiplayerPassFromCookieHeader } from '~/server/utils/multiplayerPass'

function isRequestFromAdmin(request: IncomingMessage): boolean {
  const cookieHeader = request.headers.cookie
  if (!cookieHeader) return false

  const match = cookieHeader.match(/(?:^|;\s*)admin-token=([^;]+)/)
  if (!match) return false

  try {
    jwt.verify(decodeURIComponent(match[1]), JWT_SECRET)
    return true
  } catch {
    return false
  }
}

function hasValidMultiplayerPass(request: IncomingMessage): boolean {
  return extractMultiplayerPassFromCookieHeader(request.headers.cookie) !== null
}

// Room state management
interface RoomPlayer {
  socketId: string
  nickname: string
  gender?: 'male' | 'female' | 'other'
  isHost: boolean
  connected: boolean
  hasVoted?: boolean
  vote?: any
  lastRingTime?: number
  lastDisconnectedAt?: number // for cleanup; set when connected -> false
}

interface RoomState {
  roomId: string
  roomCode: string
  roomName?: string
  hostSocketId: string
  players: Map<string, RoomPlayer>
  maxPlayers: number
  answerVisibility: 'anonymous' | 'public'
  currentGame: string | null
  gamePhase: 'lobby' | 'playing' | 'voting' | 'results'
  currentPrompt: any
  nextUpPlayer: { socketId: string; nickname: string } | null // who is up when no card is showing (Truth or Dare etc.)
  votes: Map<string, any> // socketId -> vote data
  createdAt: number
  lastUpdated: number
}

const rooms = new Map<string, RoomState>()

function makePromptId() {
  return `p_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`
}

// Generate a 6-character room code
function generateRoomCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let code = ''
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return code
}

// Get or create room
function getRoom(roomCode: string): RoomState | null {
  for (const room of rooms.values()) {
    if (room.roomCode === roomCode.toUpperCase()) {
      return room
    }
  }
  return null
}

// Find room by socket ID
function findRoomBySocketId(socketId: string): RoomState | null {
  for (const room of rooms.values()) {
    if (room.players.has(socketId)) {
      return room
    }
  }
  return null
}

// Clean up empty rooms
function cleanupRoom(roomId: string) {
  const room = rooms.get(roomId)
  if (room && room.players.size === 0) {
    rooms.delete(roomId)
    console.log(`🗑️ Room ${room.roomCode} cleaned up`)
  }
}

// Get next player in room (round-robin) for turn order
function getNextPlayerInRoom(room: RoomState, afterSocketId: string | null): { socketId: string; nickname: string } | null {
  const list = Array.from(room.players.values()).filter(p => p.connected)
  const players = list.length ? list : Array.from(room.players.values())
  if (!players.length) return null
  if (!afterSocketId) {
    const p = players[0]
    return { socketId: p.socketId, nickname: p.nickname }
  }
  const idx = players.findIndex(p => p.socketId === afterSocketId)
  if (idx === -1) {
    const p = players[0]
    return { socketId: p.socketId, nickname: p.nickname }
  }
  const next = players[(idx + 1) % players.length]
  return { socketId: next.socketId, nickname: next.nickname }
}

// Migrate host if host disconnects
function migrateHost(room: RoomState) {
  if (room.players.size === 0) {
    cleanupRoom(room.roomId)
    return null
  }

  // Find new host (first connected player)
  for (const player of room.players.values()) {
    if (player.connected) {
      player.isHost = true
      room.hostSocketId = player.socketId
      return player
    }
  }

  return null
}

// Global Socket.IO instance
let io: Server | null = null

// Export function to get io instance
export function getIO(): Server | null {
  return io
}

export default defineNitroPlugin((nitroApp) => {
  console.log('🔧 Socket.IO plugin loading...')
  
  // Define initializeSocketIO function first
  function initializeSocketIO(httpServer: HTTPServer) {
    if (io) {
      console.log('⚠️ Socket.IO already initialized')
      return
    }

    console.log('✅ HTTP server found, initializing Socket.IO...')
    console.log('📡 Server details:', {
      listening: httpServer.listening,
      address: httpServer.address(),
    })

    const corsOrigin = process.env.SOCKET_CORS_ORIGIN ||
      (process.env.NODE_ENV === 'production' ? 'https://www.montoya.ke' : '*')

    io = new Server(httpServer, {
      cors: {
        origin: corsOrigin,
        methods: ['GET', 'POST'],
      },
      transports: ['websocket', 'polling'],
      path: '/socket.io/',
    })

    console.log('🎉 Socket.IO server created successfully!')
    console.log('🔌 Socket.IO will handle requests at: /socket.io/')

    io.on('connection', (socket) => {
    console.log(`✅ Client connected: ${socket.id}`)
    
    // Track user connection
    const ipAddress = socket.handshake.address || socket.request?.socket?.remoteAddress || null
    const userAgent = socket.handshake.headers['user-agent'] || 'unknown'
    
    realtimeAnalytics.addUser(socket.id, {
      userId: null,
      sessionId: null,
      page: 'unknown',
      userAgent,
      ipAddress,
      isInGame: false,
      currentGame: null,
      roomCode: null,
    })

    // Admin analytics room (admin-only: verify the admin-token cookie on the handshake)
    socket.on('admin:join-analytics', () => {
      if (!isRequestFromAdmin(socket.request)) {
        console.warn(`Rejected admin:join-analytics from unauthenticated socket ${socket.id}`)
        return
      }
      socket.join('admin:analytics')
      console.log(`📊 Admin client ${socket.id} joined analytics room`)
      // Send immediate stats
      const stats = realtimeAnalytics.getStats()
      socket.emit('analytics:update', stats)
    })

    socket.on('admin:leave-analytics', () => {
      socket.leave('admin:analytics')
      console.log(`📊 Admin client ${socket.id} left analytics room`)
    })

    // Create room
    socket.on('room:create', (data: {
      roomName?: string
      maxPlayers?: number
      answerVisibility: 'anonymous' | 'public'
      nickname?: string
      gender?: 'male' | 'female' | 'other'
    }) => {
      try {
        if (!hasValidMultiplayerPass(socket.request)) {
          socket.emit('room:error', {
            message: 'Payment required to host a room',
            code: 'PAYMENT_REQUIRED',
          })
          return
        }

        const roomCode = generateRoomCode()
        const roomId = `room_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

        const room: RoomState = {
          roomId,
          roomCode,
          roomName: data.roomName,
          hostSocketId: socket.id,
          players: new Map(),
          maxPlayers: data.maxPlayers || 999, // Unlimited players
          answerVisibility: data.answerVisibility || 'anonymous',
          currentGame: null,
          gamePhase: 'lobby',
          currentPrompt: null,
          nextUpPlayer: null,
          votes: new Map(),
          createdAt: Date.now(),
          lastUpdated: Date.now(),
        }

        // Add host as first player
        room.players.set(socket.id, {
          socketId: socket.id,
          nickname: data.nickname || 'Host', // Use provided nickname
          gender: data.gender || undefined, // Use provided gender
          isHost: true,
          connected: true,
        })

        rooms.set(roomId, room)
        socket.join(roomId)

        console.log(`🏠 Room created: ${roomCode} by ${socket.id}`)

        socket.emit('room:created', {
          roomId,
          roomCode,
          roomName: room.roomName,
          maxPlayers: room.maxPlayers,
          answerVisibility: room.answerVisibility,
          hostSocketId: room.hostSocketId,
        })
      } catch (error) {
        console.error('❌ Error creating room:', error)
        socket.emit('room:error', { message: 'Failed to create room' })
      }
    })

    // Join room (supports reconnection: same nickname while disconnected reclaims slot)
    socket.on('room:join', (data: { roomCode: string; nickname: string; gender?: 'male' | 'female' | 'other' }) => {
      try {
        const room = getRoom(data.roomCode)
        if (!room) {
          socket.emit('room:error', { message: 'Room not found' })
          return
        }

        const nicknameLower = data.nickname.trim().toLowerCase()
        let existingDisconnectedSocketId: string | null = null
        for (const [sid, p] of room.players.entries()) {
          if (!p.connected && p.nickname.toLowerCase() === nicknameLower) {
            existingDisconnectedSocketId = sid
            break
          }
        }

        if (existingDisconnectedSocketId !== null) {
          // Reconnection: reclaim slot for same nickname
          const existing = room.players.get(existingDisconnectedSocketId)!
          room.players.delete(existingDisconnectedSocketId)
          room.votes.delete(existingDisconnectedSocketId)
          const reconnected: RoomPlayer = {
            ...existing,
            socketId: socket.id,
            connected: true,
            hasVoted: existing.hasVoted ?? false,
            vote: existing.vote,
          }
          room.players.set(socket.id, reconnected)
          if (existing.isHost) {
            room.hostSocketId = socket.id
          }
          socket.join(room.roomId)
          room.lastUpdated = Date.now()
          console.log(`🔄 Reconnected: ${existing.nickname} in room ${room.roomCode}`)
        } else {
          // New join: check duplicate nicknames among connected only
          let finalNickname = data.nickname.trim()
          let nicknameCounter = 1
          const existingNicknames = Array.from(room.players.values())
            .filter(p => p.connected)
            .map(p => p.nickname.toLowerCase())
          while (existingNicknames.includes(finalNickname.toLowerCase())) {
            finalNickname = `${data.nickname.trim()} ${nicknameCounter}`
            nicknameCounter++
          }

          room.players.set(socket.id, {
            socketId: socket.id,
            nickname: finalNickname,
            gender: data.gender,
            isHost: false,
            connected: true,
            hasVoted: false,
            vote: undefined,
          })
          socket.join(room.roomId)
          room.lastUpdated = Date.now()
        }

        // Track analytics
        realtimeAnalytics.updateUserActivity(socket.id, {
          page: 'lobby',
          isInGame: room.gamePhase !== 'lobby',
          currentGame: room.currentGame || null,
          roomCode: room.roomCode,
        })

        const joinedPlayer = room.players.get(socket.id)
        console.log(`👤 ${joinedPlayer?.nickname} joined room ${room.roomCode} (game phase: ${room.gamePhase})`)

        // Notify all players in room (include disconnected so UI can show "Disconnected")
        const playersList = Array.from(room.players.values()).map(p => ({
          socketId: p.socketId,
          nickname: p.nickname,
          gender: p.gender,
          isHost: p.isHost,
          connected: p.connected,
        }))

        if (io) {
          io.to(room.roomId).emit('room:sync', {
            roomId: room.roomId,
            roomCode: room.roomCode,
            roomName: room.roomName,
            maxPlayers: room.maxPlayers,
            answerVisibility: room.answerVisibility,
            hostSocketId: room.hostSocketId,
            players: playersList,
            currentGame: room.currentGame,
            gamePhase: room.gamePhase,
            currentPrompt: room.currentPrompt,
            nextUpPlayer: room.nextUpPlayer ?? null,
          })
        }

        socket.emit('room:joined', {
          roomId: room.roomId,
          roomCode: room.roomCode,
          roomName: room.roomName,
          maxPlayers: room.maxPlayers,
          answerVisibility: room.answerVisibility,
          hostSocketId: room.hostSocketId,
          players: playersList,
          currentGame: room.currentGame,
          gamePhase: room.gamePhase,
          currentPrompt: room.currentPrompt,
          nextUpPlayer: room.nextUpPlayer ?? null,
        })
      } catch (error) {
        console.error('❌ Error joining room:', error)
        socket.emit('room:error', { message: 'Failed to join room' })
      }
    })

    // Update player nickname and gender
    socket.on('player:update', (data: { nickname: string; gender?: 'male' | 'female' | 'other' }) => {
      try {
        const room = findRoomBySocketId(socket.id)
        if (!room) {
          socket.emit('room:error', { message: 'Not in a room' })
          return
        }

        const player = room.players.get(socket.id)
        if (player) {
          player.nickname = data.nickname
          if (data.gender) {
            player.gender = data.gender
          }
          room.lastUpdated = Date.now()

          // Broadcast update
          const playersList = Array.from(room.players.values()).map(p => ({
            socketId: p.socketId,
            nickname: p.nickname,
            gender: p.gender,
            isHost: p.isHost,
            connected: p.connected,
          }))

          if (io) {
            io.to(room.roomId).emit('room:sync', {
              roomId: room.roomId,
              roomCode: room.roomCode,
              roomName: room.roomName,
              maxPlayers: room.maxPlayers,
              answerVisibility: room.answerVisibility,
              hostSocketId: room.hostSocketId,
              players: playersList,
              currentGame: room.currentGame,
              gamePhase: room.gamePhase,
              currentPrompt: room.currentPrompt,
              nextUpPlayer: room.nextUpPlayer ?? null,
            })
          }
        }
      } catch (error) {
        console.error('❌ Error updating player:', error)
      }
    })

    // Start game
    socket.on('game:start', (data: { gameType: string; prompt?: any }) => {
      try {
        const room = findRoomBySocketId(socket.id)
        if (!room) {
          socket.emit('room:error', { message: 'Not in a room' })
          return
        }

        const player = room.players.get(socket.id)
        if (!player || !player.isHost) {
          socket.emit('room:error', { message: 'Only host can start game' })
          return
        }

        room.currentGame = data.gameType
        room.gamePhase = 'playing'

        // Track analytics for all players in room
        room.players.forEach((player) => {
          realtimeAnalytics.updateUserActivity(player.socketId, {
            isInGame: true,
            currentGame: data.gameType,
            roomCode: room.roomCode,
            page: 'multiplayer',
          })
        })
        room.currentPrompt = data.prompt || null
        room.nextUpPlayer = room.currentPrompt ? null : getNextPlayerInRoom(room, null)
        room.votes.clear()
        room.lastUpdated = Date.now()

        // Reset all player votes
        room.players.forEach(p => {
          p.hasVoted = false
          p.vote = undefined
        })

        console.log(`🎮 Game started in room ${room.roomCode}: ${data.gameType}`)

        if (io) {
          io.to(room.roomId).emit('game:state:update', {
            currentGame: room.currentGame,
            gamePhase: room.gamePhase,
            currentPrompt: room.currentPrompt,
            nextUpPlayer: room.nextUpPlayer,
          })
        }
      } catch (error) {
        console.error('❌ Error starting game:', error)
        socket.emit('room:error', { message: 'Failed to start game' })
      }
    })

    // Submit vote/answer
    socket.on('game:vote', (data: { vote: any }) => {
      try {
        const room = findRoomBySocketId(socket.id)
        if (!room) {
          socket.emit('room:error', { message: 'Not in a room' })
          return
        }

        const player = room.players.get(socket.id)
        if (!player) {
          socket.emit('room:error', { message: 'Player not found' })
          return
        }

        // Silently ignore duplicate votes - don't emit error, just return
        if (player.hasVoted) {
          console.log(`🗳️ Duplicate vote attempt from ${player.nickname} in room ${room.roomCode} - ignoring`)
          return
        }

        player.hasVoted = true
        player.vote = data.vote
        room.votes.set(socket.id, {
          socketId: socket.id,
          nickname: player.nickname,
          vote: data.vote,
        })

        room.lastUpdated = Date.now()

        console.log(`🗳️ Vote received from ${player.nickname} in room ${room.roomCode}`)

        // Broadcast vote update (with visibility rules)
        const votesData = Array.from(room.votes.values()).map(v => {
          if (room.answerVisibility === 'anonymous') {
            return { vote: v.vote } // Hide player info
          } else {
            return v // Show player info
          }
        })

        const allPlayersVoted = room.votes.size >= room.players.size

        if (io) {
          io.to(room.roomId).emit('game:vote:update', {
            votes: votesData,
            totalVotes: room.votes.size,
            totalPlayers: room.players.size,
            allVoted: allPlayersVoted,
          })

          // Auto-transition to results if all players voted (for all voting games)
          const votingGames = ['never-have-i-ever', 'would-you-rather', 'most-likely-to']
          if (allPlayersVoted && room.currentGame && votingGames.includes(room.currentGame)) {
            room.gamePhase = 'results'
            room.lastUpdated = Date.now()

            // Prepare results with visibility rules
            const results = votesData

            io.to(room.roomId).emit('game:results', {
              results,
              answerVisibility: room.answerVisibility,
            })

            io.to(room.roomId).emit('game:state:update', {
              currentGame: room.currentGame,
              gamePhase: room.gamePhase,
              currentPrompt: room.currentPrompt,
              nextUpPlayer: room.nextUpPlayer ?? null,
            })

            console.log(`✅ All players voted in room ${room.roomCode}, auto-showing results for ${room.currentGame}`)
          }
        }
      } catch (error) {
        console.error('❌ Error submitting vote:', error)
        socket.emit('room:error', { message: 'Failed to submit vote' })
      }
    })

    // End game and return to lobby (host only - keeps players in room)
    socket.on('game:end', () => {
      try {
        const room = findRoomBySocketId(socket.id)
        if (!room) {
          socket.emit('room:error', { message: 'Not in a room' })
          return
        }

        const player = room.players.get(socket.id)
        if (!player || !player.isHost) {
          socket.emit('room:error', { message: 'Only host can end game' })
          return
        }

        // Reset game state but keep players in room
        room.currentGame = null
        room.gamePhase = 'lobby'
        room.currentPrompt = null
        room.nextUpPlayer = null
        room.votes.clear()
        room.lastUpdated = Date.now()

        // Reset all player votes
        room.players.forEach(p => {
          p.hasVoted = false
          p.vote = undefined
        })

        console.log(`🎮 Game ended in room ${room.roomCode}, returning to lobby`)

        // Broadcast game ended event to all players
        if (io) {
          io.to(room.roomId).emit('game:ended', {
            message: 'Game ended. Returning to lobby.',
          })
          
          // Also sync room state
          const playersList = Array.from(room.players.values()).map(p => ({
            socketId: p.socketId,
            nickname: p.nickname,
            gender: p.gender,
            isHost: p.isHost,
            connected: p.connected,
          }))

          io.to(room.roomId).emit('room:sync', {
            roomId: room.roomId,
            roomCode: room.roomCode,
            roomName: room.roomName,
            maxPlayers: room.maxPlayers,
            answerVisibility: room.answerVisibility,
            hostSocketId: room.hostSocketId,
            players: playersList,
            currentGame: room.currentGame,
            gamePhase: room.gamePhase,
            currentPrompt: room.currentPrompt,
            nextUpPlayer: room.nextUpPlayer ?? null,
          })
        }
      } catch (error) {
        console.error('❌ Error ending game:', error)
        socket.emit('room:error', { message: 'Failed to end game' })
      }
    })

    // Show results
    socket.on('game:results', () => {
      try {
        const room = findRoomBySocketId(socket.id)
        if (!room) {
          socket.emit('room:error', { message: 'Not in a room' })
          return
        }

        const player = room.players.get(socket.id)
        if (!player || !player.isHost) {
          socket.emit('room:error', { message: 'Only host can show results' })
          return
        }

        room.gamePhase = 'results'
        room.lastUpdated = Date.now()

        // Prepare results with visibility rules
        const results = Array.from(room.votes.values()).map(v => {
          if (room.answerVisibility === 'anonymous') {
            return { vote: v.vote } // Hide player info
          } else {
            return v // Show player info
          }
        })

        if (io) {
          io.to(room.roomId).emit('game:results', {
            results,
            answerVisibility: room.answerVisibility,
          })
        }
      } catch (error) {
        console.error('❌ Error showing results:', error)
        socket.emit('room:error', { message: 'Failed to show results' })
      }
    })

    // Next round/question
    socket.on('game:next', (data?: { prompt?: any }) => {
      try {
        const room = findRoomBySocketId(socket.id)
        if (!room) {
          socket.emit('room:error', { message: 'Not in a room' })
          return
        }

        const player = room.players.get(socket.id)
        if (!player || !player.isHost) {
          socket.emit('room:error', { message: 'Only host can advance game' })
          return
        }

        room.gamePhase = 'playing'
        if (data?.prompt) {
          const isTurnBasedPrompt = !!data.prompt?.player?.socketId
          if (isTurnBasedPrompt) {
            const promptId = makePromptId()
            // Public state: only reveal whose turn (and optional target/type).
            // Full prompt content is delivered privately.
            const publicPrompt = {
              promptId,
              deliveredToPlayer: false,
              player: data.prompt?.player ?? null,
              target: data.prompt?.target ?? null,
              type: data.prompt?.type ?? null,
            }
            room.currentPrompt = publicPrompt
          } else {
            // Voting / public prompts: broadcast normally
            room.currentPrompt = data.prompt
          }
          room.nextUpPlayer = null
        } else {
          const lastSocketId = room.currentPrompt?.player?.socketId ?? null
          room.nextUpPlayer = getNextPlayerInRoom(room, lastSocketId)
          room.currentPrompt = null
        }
        room.votes.clear()
        room.lastUpdated = Date.now()

        room.players.forEach(p => {
          p.hasVoted = false
          p.vote = undefined
        })

        console.log(`🔄 Next round in room ${room.roomCode}, prompt:`, room.currentPrompt, 'nextUp:', room.nextUpPlayer?.nickname)

        if (io) {
          io.to(room.roomId).emit('game:state:update', {
            currentGame: room.currentGame,
            gamePhase: room.gamePhase,
            currentPrompt: room.currentPrompt,
            nextUpPlayer: room.nextUpPlayer,
          })

          // Deliver full prompt privately to the selected player and the host.
          if (data?.prompt && data.prompt?.player?.socketId) {
            const playerSocketId = room.currentPrompt?.player?.socketId
            const promptId = room.currentPrompt?.promptId
            const payload = { ...data.prompt, promptId }
            if (room.hostSocketId) {
              io.to(room.hostSocketId).emit('game:prompt:private', payload)
            }
            if (playerSocketId) {
              io.to(playerSocketId).emit('game:prompt:private', payload)
            }
          }
        }
      } catch (error) {
        console.error('❌ Error advancing game:', error)
        socket.emit('room:error', { message: 'Failed to advance game' })
      }
    })

    // Player acknowledges they received their private prompt
    socket.on('game:prompt:received', (data: { promptId: string }) => {
      try {
        const room = findRoomBySocketId(socket.id)
        if (!room) return
        const promptId = data?.promptId
        if (!promptId) return
        if (!room.currentPrompt || room.currentPrompt.promptId !== promptId) return

        const expectedPlayerSocketId = room.currentPrompt?.player?.socketId
        if (expectedPlayerSocketId && socket.id !== expectedPlayerSocketId) {
          return
        }

        room.currentPrompt.deliveredToPlayer = true
        room.lastUpdated = Date.now()
        if (io) {
          io.to(room.roomId).emit('game:state:update', {
            currentGame: room.currentGame,
            gamePhase: room.gamePhase,
            currentPrompt: room.currentPrompt,
            nextUpPlayer: room.nextUpPlayer,
          })
        }
      } catch (error) {
        console.error('❌ Error handling prompt received:', error)
      }
    })

    // Skip question (host only)
    socket.on('game:skip', (data?: { prompt?: any }) => {
      try {
        const room = findRoomBySocketId(socket.id)
        if (!room) {
          socket.emit('room:error', { message: 'Not in a room' })
          return
        }

        const player = room.players.get(socket.id)
        if (!player || !player.isHost) {
          socket.emit('room:error', { message: 'Only host can skip question' })
          return
        }

        // Skip to next question - same as next round
        room.gamePhase = 'playing'
        if (data?.prompt) {
          room.currentPrompt = data.prompt
          room.nextUpPlayer = null
        } else {
          const lastSocketId = room.currentPrompt?.player?.socketId ?? null
          room.nextUpPlayer = getNextPlayerInRoom(room, lastSocketId)
          room.currentPrompt = null
        }
        room.votes.clear()
        room.lastUpdated = Date.now()

        room.players.forEach(p => {
          p.hasVoted = false
          p.vote = undefined
        })

        console.log(`⏭️ Question skipped in room ${room.roomCode}`)

        if (io) {
          io.to(room.roomId).emit('game:state:update', {
            currentGame: room.currentGame,
            gamePhase: room.gamePhase,
            currentPrompt: room.currentPrompt,
            nextUpPlayer: room.nextUpPlayer,
          })
        }
      } catch (error) {
        console.error('❌ Error skipping question:', error)
        socket.emit('room:error', { message: 'Failed to skip question' })
      }
    })

    // Ring host - notify host that players are waiting
    socket.on('room:ring-host', () => {
      try {
        const room = findRoomBySocketId(socket.id)
        if (!room) {
          socket.emit('room:error', { message: 'Not in a room' })
          return
        }

        const player = room.players.get(socket.id)
        if (!player) {
          socket.emit('room:error', { message: 'Player not found' })
          return
        }

        // Don't ring if game is already started
        if (room.gamePhase === 'playing' || room.gamePhase === 'voting' || room.gamePhase === 'results') {
          return
        }

        // Rate limit: track last ring time per player
        const now = Date.now()
        if (!player.lastRingTime) {
          player.lastRingTime = 0
        }
        
        // Only allow ringing once every 10 seconds per player
        if (now - player.lastRingTime < 10000) {
          return
        }

        player.lastRingTime = now

        // Broadcast to entire room so host's client always receives it (handles reconnects, multiple tabs)
        const payload = {
          playerName: player.nickname,
          message: `${player.nickname} is waiting for you to start the game`,
        }
        if (io) {
          io.to(room.roomId).emit('ring:notify', payload)
        }

        console.log(`🔔 ${player.nickname} rang host in room ${room.roomCode}`)
      } catch (error) {
        console.error('❌ Error ringing host:', error)
      }
    })

    // Leave room - if host leaves, end game and notify all players
    socket.on('room:leave', () => {
      try {
        const room = findRoomBySocketId(socket.id)
        if (!room) {
          return
        }

        const player = room.players.get(socket.id)
        const wasHost = player?.isHost || false

        room.players.delete(socket.id)
        room.votes.delete(socket.id)
        socket.leave(room.roomId)
        room.lastUpdated = Date.now()

        console.log(`👋 Player left room ${room.roomCode}`)

        // If host leaves, end game and return all players to lobby
        if (wasHost) {
          room.gamePhase = 'lobby'
          room.currentGame = null
          room.currentPrompt = null
          room.votes.clear()
          
          // Migrate host if there are other players
          const newHost = migrateHost(room)
          if (newHost) {
            console.log(`👑 New host: ${newHost.nickname} in room ${room.roomCode}`)
          }
          
          // Notify all players that game ended and return to lobby
          if (io) {
            io.to(room.roomId).emit('game:ended', {
              message: 'Host left the game. Returning to lobby.',
            })
          }
        }

        // Clean up if empty
        if (room.players.size === 0) {
          cleanupRoom(room.roomId)
          return
        }

        // Broadcast update
        const playersList = Array.from(room.players.values()).map(p => ({
          socketId: p.socketId,
          nickname: p.nickname,
          gender: p.gender,
          isHost: p.isHost,
          connected: p.connected,
        }))

        if (io) {
          io.to(room.roomId).emit('room:sync', {
          roomId: room.roomId,
          roomCode: room.roomCode,
          roomName: room.roomName,
          maxPlayers: room.maxPlayers,
          answerVisibility: room.answerVisibility,
          hostSocketId: room.hostSocketId,
          players: playersList,
          currentGame: room.currentGame,
          gamePhase: room.gamePhase,
          currentPrompt: room.currentPrompt,
          nextUpPlayer: room.nextUpPlayer ?? null,
        })
        }
      } catch (error) {
        console.error('❌ Error leaving room:', error)
      }
    })

    // Known game page slugs – treat as "current game" for Popular Games (Live)
    const GAME_PAGE_SLUGS = new Set([
      'truth-or-dare', 'would-you-rather', 'most-likely-to', 'never-have-i-ever',
      'charades', 'imposter', 'mr-white',
    ])
    // Track page views and navigation
    socket.on('analytics:page-view', (data: { page: string, userId?: string, sessionId?: string }) => {
      const page = data.page || 'unknown'
      const isGamePage = GAME_PAGE_SLUGS.has(page)
      realtimeAnalytics.updateUserActivity(socket.id, {
        page,
        userId: data.userId || null,
        sessionId: data.sessionId || null,
        // Set game for Live when on a game page; don't clear on non-game so multiplayer room state persists
        ...(isGamePage ? { isInGame: true, currentGame: page } : {}),
      })
    })

    // Track game activity
    socket.on('analytics:game-activity', (data: { isInGame: boolean, currentGame?: string, roomCode?: string }) => {
      realtimeAnalytics.updateUserActivity(socket.id, {
        isInGame: data.isInGame,
        currentGame: data.currentGame || null,
        roomCode: data.roomCode || null,
      })
    })

    // Handle disconnect: mark player disconnected but keep in room so they can reconnect
    socket.on('disconnect', () => {
      console.log(`❌ Client disconnected: ${socket.id}`)

      try {
        realtimeAnalytics.removeUser(socket.id)
        const room = findRoomBySocketId(socket.id)
        if (!room) return

        const player = room.players.get(socket.id)
        const wasHost = player?.isHost || false

        // Mark disconnected instead of removing (allows reconnection with same nickname)
        if (player) {
          player.connected = false
          player.lastDisconnectedAt = Date.now()
        }
        room.votes.delete(socket.id)
        room.lastUpdated = Date.now()
        console.log(`📴 Player ${player?.nickname || socket.id} disconnected from room ${room.roomCode} (can reconnect)`)

        if (wasHost) {
          const newHost = migrateHost(room)
          if (newHost) {
            console.log(`👑 Host migrated to ${newHost.nickname} in room ${room.roomCode}`)
          } else {
            // No connected players left; room stays for reconnection, cleanup via timer
          }
        }

        const playersList = Array.from(room.players.values()).map(p => ({
          socketId: p.socketId,
          nickname: p.nickname,
          gender: p.gender,
          isHost: p.isHost,
          connected: p.connected,
        }))

        if (io) {
          io.to(room.roomId).emit('room:sync', {
            roomId: room.roomId,
            roomCode: room.roomCode,
            roomName: room.roomName,
            maxPlayers: room.maxPlayers,
            answerVisibility: room.answerVisibility,
            hostSocketId: room.hostSocketId,
            players: playersList,
            currentGame: room.currentGame,
            gamePhase: room.gamePhase,
            currentPrompt: room.currentPrompt,
            nextUpPlayer: room.nextUpPlayer ?? null,
          })
        }
      } catch (error) {
        console.error('❌ Error handling disconnect:', error)
      }
    })

    console.log('✅ Socket.IO server initialized and ready for connections')

    // Remove disconnected players after 90s so rooms can be cleaned up; broadcast sync after
    const DISCONNECTED_GRACE_MS = 90_000
    setInterval(() => {
      const now = Date.now()
      const roomIdsToCleanup: string[] = []
      for (const room of rooms.values()) {
        const toDelete: string[] = []
        for (const [sid, p] of room.players.entries()) {
          if (!p.connected && p.lastDisconnectedAt && now - p.lastDisconnectedAt > DISCONNECTED_GRACE_MS) {
            toDelete.push(sid)
          }
        }
        for (const sid of toDelete) {
          room.players.delete(sid)
          room.votes.delete(sid)
          console.log(`🗑️ Removed stale disconnected player from room ${room.roomCode}`)
        }
        if (room.players.size === 0) {
          roomIdsToCleanup.push(room.roomId)
        } else if (toDelete.length > 0 && io) {
          const playersList = Array.from(room.players.values()).map(p => ({
            socketId: p.socketId,
            nickname: p.nickname,
            gender: p.gender,
            isHost: p.isHost,
            connected: p.connected,
          }))
          io.to(room.roomId).emit('room:sync', {
            roomId: room.roomId,
            roomCode: room.roomCode,
            roomName: room.roomName,
            maxPlayers: room.maxPlayers,
            answerVisibility: room.answerVisibility,
            hostSocketId: room.hostSocketId,
            players: playersList,
            currentGame: room.currentGame,
            gamePhase: room.gamePhase,
            currentPrompt: room.currentPrompt,
            nextUpPlayer: room.nextUpPlayer ?? null,
          })
        }
      }
      for (const id of roomIdsToCleanup) {
        cleanupRoom(id)
      }
    }, 60_000)
    
    // Start analytics broadcast
    setTimeout(() => {
      import('~/server/utils/broadcastAnalytics').then(({ startAnalyticsBroadcast }) => {
        startAnalyticsBroadcast()
      }).catch(err => {
        console.error('Failed to start analytics broadcast:', err)
      })
    }, 1000)
    }) // Close io.on('connection') callback
  } // Close initializeSocketIO function
  
  // Initialize Socket.IO on first request - most reliable method
  nitroApp.hooks.hook('request', (event) => {
    if (!io && event?.node?.req) {
      const nodeReq = event.node.req
      // Access server through the request's socket
      const server = (nodeReq as any).socket?.server || (nodeReq as any).connection?.server
      if (server && typeof server.listen === 'function') {
        const httpServer = server as HTTPServer
        console.log('✅ Found HTTP server via request hook, initializing Socket.IO...')
        initializeSocketIO(httpServer)
      }
    }
  })
  
  // Also try ready hook (using type assertion)
  const hooks = nitroApp.hooks as any
  if (hooks.hook) {
    hooks.hook('ready', async () => {
      console.log('🚀 Nitro app ready, checking for HTTP server...')
      
      let httpServer: HTTPServer | null = null

      if ((nitroApp as any).nodeServer) {
        httpServer = (nitroApp as any).nodeServer as HTTPServer
        console.log('✅ Found server via nitroApp.nodeServer')
        initializeSocketIO(httpServer)
        return
      }
      
      for (const layer of nitroApp.h3App.stack) {
        if (layer && (layer as any).handle && typeof (layer as any).handle.listen === 'function') {
          httpServer = (layer as any).handle as HTTPServer
          console.log('✅ Found server via h3App.stack')
          initializeSocketIO(httpServer)
          return
        }
      }

      if ((nitroApp.h3App as any).nodeServer) {
        httpServer = (nitroApp.h3App as any).nodeServer as HTTPServer
        console.log('✅ Found server via h3App.nodeServer')
        initializeSocketIO(httpServer)
        return
      }

      if ((globalThis as any).__httpServer) {
        httpServer = (globalThis as any).__httpServer as HTTPServer
        console.log('✅ Found server via globalThis')
        initializeSocketIO(httpServer)
        return
      }

      if ((nitroApp.h3App as any).listener) {
        const listener = (nitroApp.h3App as any).listener
        if (listener && typeof listener.listen === 'function') {
          httpServer = listener as HTTPServer
          console.log('✅ Found server via h3App.listener')
          initializeSocketIO(httpServer)
          return
        }
      }

      console.warn('⚠️ HTTP server not found in ready hook, will initialize on first request')
    })
  }
  
  console.log('🔧 Socket.IO plugin registered (waiting for server ready)')
})

