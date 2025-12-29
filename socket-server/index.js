/**
 * Standalone Socket.IO Server for Montoya
 * 
 * This server can be deployed separately on platforms that support WebSockets:
 * - Railway (https://railway.app)
 * - Render (https://render.com)
 * - Fly.io (https://fly.io)
 * - Your own VPS/VM
 * 
 * Deploy this separately and set NUXT_PUBLIC_SOCKET_URL in your Vercel deployment
 * to point to this server's URL.
 */

const { Server } = require('socket.io')
const http = require('http')

// Room state management
const rooms = new Map()

// Generate a 6-character room code
function generateRoomCode() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let code = ''
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return code
}

// Get or create room
function getRoom(roomCode) {
  for (const room of rooms.values()) {
    if (room.roomCode === roomCode.toUpperCase()) {
      return room
    }
  }
  return null
}

// Find room by socket ID
function findRoomBySocketId(socketId) {
  for (const room of rooms.values()) {
    if (room.players.has(socketId)) {
      return room
    }
  }
  return null
}

// Clean up empty rooms
function cleanupRoom(roomId) {
  const room = rooms.get(roomId)
  if (room && room.players.size === 0) {
    rooms.delete(roomId)
    console.log(`🗑️ Room ${room.roomCode} cleaned up`)
  }
}

// Migrate host if host disconnects
function migrateHost(room) {
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

// Create HTTP server
const httpServer = http.createServer()
const PORT = process.env.PORT || 3001

// Initialize Socket.IO
const io = new Server(httpServer, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
  transports: ['websocket', 'polling'],
  path: '/socket.io/',
  allowEIO3: true,
})

io.on('connection', (socket) => {
  console.log(`✅ Client connected: ${socket.id}`)

  // Create room
  socket.on('room:create', (data) => {
    try {
      const roomCode = generateRoomCode()
      const roomId = `room_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

      const room = {
        roomId,
        roomCode,
        roomName: data.roomName,
        hostSocketId: socket.id,
        players: new Map(),
        maxPlayers: data.maxPlayers || 999,
        answerVisibility: data.answerVisibility || 'anonymous',
        currentGame: null,
        gamePhase: 'lobby',
        currentPrompt: null,
        votes: new Map(),
        createdAt: Date.now(),
        lastUpdated: Date.now(),
      }

      // Add host as first player
      room.players.set(socket.id, {
        socketId: socket.id,
        nickname: data.nickname || 'Host',
        gender: data.gender || undefined,
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

  // Join room
  socket.on('room:join', (data) => {
    try {
      const room = getRoom(data.roomCode)
      if (!room) {
        socket.emit('room:error', { message: 'Room not found' })
        return
      }

      // Check if game has already started
      if (room.gamePhase !== 'lobby') {
        socket.emit('room:error', { message: 'Game has already started' })
        return
      }

      // Check for duplicate nicknames
      let finalNickname = data.nickname
      let nicknameCounter = 1
      const existingNicknames = Array.from(room.players.values()).map(p => p.nickname.toLowerCase())
      while (existingNicknames.includes(finalNickname.toLowerCase())) {
        finalNickname = `${data.nickname} ${nicknameCounter}`
        nicknameCounter++
      }

      // Add player
      room.players.set(socket.id, {
        socketId: socket.id,
        nickname: finalNickname,
        gender: data.gender,
        isHost: false,
        connected: true,
      })

      socket.join(room.roomId)
      room.lastUpdated = Date.now()

      console.log(`👤 ${finalNickname} joined room ${room.roomCode}`)

      // Notify all players in room
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
      })
    } catch (error) {
      console.error('❌ Error joining room:', error)
      socket.emit('room:error', { message: 'Failed to join room' })
    }
  })

  // Update player nickname and gender
  socket.on('player:update', (data) => {
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
        })
      }
    } catch (error) {
      console.error('❌ Error updating player:', error)
    }
  })

  // Start game
  socket.on('game:start', (data) => {
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
      room.currentPrompt = data.prompt || null
      room.votes.clear()
      room.lastUpdated = Date.now()

      // Reset all player votes
      room.players.forEach(p => {
        p.hasVoted = false
        p.vote = undefined
      })

      console.log(`🎮 Game started in room ${room.roomCode}: ${data.gameType}`)

      io.to(room.roomId).emit('game:state:update', {
        currentGame: room.currentGame,
        gamePhase: room.gamePhase,
        currentPrompt: room.currentPrompt,
      })
    } catch (error) {
      console.error('❌ Error starting game:', error)
      socket.emit('room:error', { message: 'Failed to start game' })
    }
  })

  // Submit vote/answer
  socket.on('game:vote', (data) => {
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

      // Silently ignore duplicate votes
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
          return { vote: v.vote }
        } else {
          return v
        }
      })

      io.to(room.roomId).emit('game:vote:update', {
        votes: votesData,
        totalVotes: room.votes.size,
        totalPlayers: room.players.size,
      })
    } catch (error) {
      console.error('❌ Error submitting vote:', error)
      socket.emit('room:error', { message: 'Failed to submit vote' })
    }
  })

  // End game and return to lobby
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
      room.votes.clear()
      room.lastUpdated = Date.now()

      // Reset all player votes
      room.players.forEach(p => {
        p.hasVoted = false
        p.vote = undefined
      })

      console.log(`🎮 Game ended in room ${room.roomCode}, returning to lobby`)

      // Broadcast game ended event
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
      })
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
          return { vote: v.vote }
        } else {
          return v
        }
      })

      io.to(room.roomId).emit('game:results', {
        results,
        answerVisibility: room.answerVisibility,
      })
    } catch (error) {
      console.error('❌ Error showing results:', error)
      socket.emit('room:error', { message: 'Failed to show results' })
    }
  })

  // Next round/question
  socket.on('game:next', (data) => {
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
      room.currentPrompt = data?.prompt || null
      room.votes.clear()
      room.lastUpdated = Date.now()

      // Reset all player votes
      room.players.forEach(p => {
        p.hasVoted = false
        p.vote = undefined
      })

      console.log(`🔄 Next round in room ${room.roomCode}, prompt:`, room.currentPrompt)

      io.to(room.roomId).emit('game:state:update', {
        currentGame: room.currentGame,
        gamePhase: room.gamePhase,
        currentPrompt: room.currentPrompt,
      })
    } catch (error) {
      console.error('❌ Error advancing game:', error)
      socket.emit('room:error', { message: 'Failed to advance game' })
    }
  })

  // Leave room
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
        
        // Notify all players that game ended
        io.to(room.roomId).emit('game:ended', {
          message: 'Host left the game. Returning to lobby.',
        })
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
      })
    } catch (error) {
      console.error('❌ Error leaving room:', error)
    }
  })

  // Handle disconnect
  socket.on('disconnect', () => {
    console.log(`❌ Client disconnected: ${socket.id}`)

    try {
      const room = findRoomBySocketId(socket.id)
      if (!room) {
        return
      }

      const player = room.players.get(socket.id)
      const wasHost = player?.isHost || false

      // Mark as disconnected but keep in room (for reconnection)
      if (player) {
        player.connected = false
      }

      room.votes.delete(socket.id)
      room.lastUpdated = Date.now()

      // Migrate host if needed
      if (wasHost) {
        const newHost = migrateHost(room)
        if (newHost) {
          console.log(`👑 Host migrated to ${newHost.nickname} in room ${room.roomCode}`)
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
      })
    } catch (error) {
      console.error('❌ Error handling disconnect:', error)
    }
  })
})

// Start server
httpServer.listen(PORT, () => {
  console.log(`🚀 Socket.IO server running on port ${PORT}`)
  console.log(`🔌 WebSocket endpoint: ws://localhost:${PORT}/socket.io/`)
})

