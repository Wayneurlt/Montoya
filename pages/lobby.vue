<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 text-white p-3 sm:p-4 relative overflow-x-hidden overflow-y-auto">
    <!-- Background Icons Pattern -->
    <BackgroundIcons />

    <div class="max-w-4xl mx-auto relative z-10 pt-4 sm:pt-6 md:pt-8">
      <!-- Header -->
      <div class="flex items-center justify-between mb-6 sm:mb-8">
        <NuxtLink to="/" class="bg-white/10 hover:bg-white/20 backdrop-blur-md px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg transition-all flex items-center gap-2 border border-white/20 hover:scale-105">
          <Icon icon="mdi:home" class="w-5 h-5" />
          <span class="font-medium">Home</span>
        </NuxtLink>
        <div v-if="safeRoomState.roomCode" class="text-center">
          <div class="text-xs text-white/60 mb-1">Room Code</div>
          <button
            @click="copyRoomCode"
            class="group relative cursor-pointer transition-all hover:scale-105"
            :title="copied ? 'Copied!' : 'Click to copy'"
          >
            <div class="text-3xl sm:text-4xl font-black bg-gradient-to-r from-purple-400 via-pink-500 to-cyan-400 bg-clip-text text-transparent flex items-center justify-center gap-2">
              {{ safeRoomState.roomCode }}
              <Icon icon="mdi:content-copy" class="w-5 h-5 sm:w-6 sm:h-6 text-purple-400 opacity-70 group-hover:opacity-100 transition-opacity" />
            </div>
            <transition name="fade">
              <div v-if="copied" class="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-green-500 text-white px-3 py-1 rounded-lg text-xs whitespace-nowrap">
                Copied!
              </div>
            </transition>
          </button>
        </div>
      </div>

      <!-- Error Message -->
      <transition name="fade">
        <div v-if="displayError" class="mb-6 bg-red-500/20 border-2 border-red-500/50 rounded-xl p-4 backdrop-blur-md">
          <div class="flex items-center gap-2">
            <Icon icon="mdi:alert-circle" class="w-6 h-6 text-red-400" />
            <p class="text-red-200 font-semibold">{{ displayError }}</p>
          </div>
        </div>
      </transition>

      <!-- Lobby Phase -->
      <div v-if="!safeRoomState.gamePhase || safeRoomState.gamePhase === 'lobby'" class="space-y-6">
        <!-- Room Info Card -->
        <div v-if="safeRoomState.roomCode" class="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
          <div class="text-center mb-6">
            <h1 class="text-3xl sm:text-4xl font-black mb-2 bg-gradient-to-r from-purple-400 via-pink-500 to-cyan-400 bg-clip-text text-transparent">
              {{ safeRoomState.roomName || 'Game Room' }}
            </h1>
            <div class="flex items-center justify-center gap-4 mt-4">
              <div class="flex items-center gap-2">
                <Icon icon="mdi:account-group" class="w-5 h-5 text-purple-400" />
                <span class="text-sm">{{ playerCount }} Players</span>
              </div>
              <div class="flex items-center gap-2">
                <Icon :icon="safeRoomState.answerVisibility === 'anonymous' ? 'mdi:incognito' : 'mdi:eye'" class="w-5 h-5 text-pink-400" />
                <span class="text-sm capitalize">{{ safeRoomState.answerVisibility }} Mode</span>
              </div>
            </div>
          </div>

          <!-- Player List -->
          <div class="mb-6">
            <h3 class="text-lg font-bold mb-4 text-center">Players</h3>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div
                v-for="player in safeRoomState.players"
                :key="player.socketId"
                class="bg-white/5 rounded-xl p-4 border border-white/10 flex items-center justify-between"
                :class="{ 'ring-2 ring-purple-500': player.isHost, 'opacity-50': !player.connected }"
              >
                <div class="flex items-center gap-3">
                  <div class="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center font-bold">
                    {{ player.nickname.charAt(0).toUpperCase() }}
                  </div>
                  <div>
                    <div class="font-semibold flex items-center gap-2">
                      {{ player.nickname }}
                      <span v-if="player.isHost" class="text-xs bg-purple-500/30 px-2 py-0.5 rounded-full">Host</span>
                    </div>
                    <div class="text-xs text-white/60">
                      {{ player.connected ? 'Connected' : 'Disconnected' }}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>


          <!-- Host Controls - Always show if room exists, but disable if not host -->
          <div class="space-y-4">
            <div class="bg-purple-500/20 rounded-xl p-4 border border-purple-500/30">
              <h3 class="font-bold mb-3 flex items-center gap-2">
                <Icon icon="mdi:gamepad-variant" class="w-5 h-5" />
                Select Game
              </h3>
              <div class="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <button
                  v-for="game in multiplayerGames"
                  :key="game.value"
                  @click="selectedGame = game.value"
                  :disabled="!isHost"
                  :class="{
                    'ring-2 ring-pink-500 bg-pink-500/20': selectedGame === game.value,
                    'bg-white/5 hover:bg-white/10': selectedGame !== game.value,
                    'opacity-50 cursor-not-allowed': !isHost,
                  }"
                  class="p-3 rounded-lg border border-white/10 transition-all text-center"
                >
                  <div class="text-2xl mb-1">{{ game.emoji }}</div>
                  <div class="text-xs font-semibold">{{ game.name }}</div>
                </button>
              </div>
            </div>

            <!-- Start Game Button -->
            <div class="space-y-2">
              <button
                @click="handleStartGame"
                :disabled="!canStartGame || !selectedGame || !isHost"
                class="w-full bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 hover:from-purple-500 hover:via-pink-500 hover:to-purple-500 text-white px-8 py-4 rounded-xl font-black text-lg shadow-2xl hover:shadow-pink-600/50 transition-all duration-300 transform hover:scale-105 border-2 border-pink-500/50 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2"
              >
                <Icon icon="mdi:play-circle" class="w-6 h-6" />
                <span>Start Game</span>
              </button>
              
              <!-- Helper messages -->
              <div v-if="!isHost" class="text-center text-sm text-yellow-400">
                <Icon icon="mdi:information" class="w-4 h-4 inline mr-1" />
                Only the host can start the game
              </div>
              <div v-else-if="!selectedGame" class="text-center text-sm text-yellow-400">
                <Icon icon="mdi:information" class="w-4 h-4 inline mr-1" />
                Please select a game first
              </div>
              <div v-else-if="playerCount < 2" class="text-center text-sm text-yellow-400">
                <Icon icon="mdi:information" class="w-4 h-4 inline mr-1" />
                Need at least 2 players to start ({{ playerCount }}/2)
              </div>
              <div v-else-if="!canStartGame" class="text-center text-sm text-yellow-400">
                <Icon icon="mdi:information" class="w-4 h-4 inline mr-1" />
                Waiting for more players...
              </div>
            </div>
          </div>

          <!-- Leave Button -->
          <button
            @click="handleLeaveRoom"
            class="w-full mt-4 bg-red-500/20 hover:bg-red-500/30 text-red-300 px-4 py-2 rounded-lg border border-red-500/30 transition-all"
          >
            Leave Room
          </button>
        </div>

        <!-- Create/Join Room Form -->
        <div v-else class="space-y-6">
          <div class="text-center mb-8">
            <h1 class="text-4xl sm:text-5xl font-black mb-4 bg-gradient-to-r from-purple-400 via-pink-500 to-cyan-400 bg-clip-text text-transparent">
              Multiplayer Mode
            </h1>
            <p class="text-purple-200 text-lg">Create or join a game room</p>
          </div>

          <!-- Tabs -->
          <div class="flex gap-2 mb-6">
            <button
              @click="isCreating = true"
              :class="isCreating ? 'bg-purple-600 text-white' : 'bg-white/10 text-white/70'"
              class="flex-1 py-3 rounded-lg font-semibold transition-all"
            >
              Create Room
            </button>
            <button
              @click="isCreating = false"
              :class="!isCreating ? 'bg-purple-600 text-white' : 'bg-white/10 text-white/70'"
              class="flex-1 py-3 rounded-lg font-semibold transition-all"
            >
              Join Room
            </button>
          </div>

          <!-- Create Room Form -->
          <div v-if="isCreating" class="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 space-y-4">
            <div>
              <label class="block text-sm font-semibold mb-2">Room Name (Optional)</label>
              <input
                v-model="createForm.roomName"
                type="text"
                placeholder="My Awesome Game"
                class="w-full bg-white/5 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <div>
              <label class="block text-sm font-semibold mb-2">Answer Visibility</label>
              <div class="space-y-2">
                <label class="flex items-center gap-3 p-3 bg-white/5 rounded-lg border border-white/10 cursor-pointer hover:bg-white/10 transition-all">
                  <input
                    v-model="createForm.answerVisibility"
                    type="radio"
                    value="anonymous"
                    class="w-4 h-4 text-purple-600"
                  />
                  <div class="flex-1">
                    <div class="font-semibold flex items-center gap-2">
                      <Icon icon="mdi:incognito" class="w-5 h-5" />
                      Anonymous
                    </div>
                    <div class="text-xs text-white/60">Answers and votes are hidden</div>
                  </div>
                </label>
                <label class="flex items-center gap-3 p-3 bg-white/5 rounded-lg border border-white/10 cursor-pointer hover:bg-white/10 transition-all">
                  <input
                    v-model="createForm.answerVisibility"
                    type="radio"
                    value="public"
                    class="w-4 h-4 text-purple-600"
                  />
                  <div class="flex-1">
                    <div class="font-semibold flex items-center gap-2">
                      <Icon icon="mdi:eye" class="w-5 h-5" />
                      Public
                    </div>
                    <div class="text-xs text-white/60">Answers and votes show player names</div>
                  </div>
                </label>
              </div>
            </div>
            <div>
              <label class="block text-sm font-semibold mb-2">Your Nickname</label>
              <input
                v-model="createForm.nickname"
                type="text"
                placeholder="Enter your name"
                maxlength="20"
                class="w-full bg-white/5 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <div>
              <label class="block text-sm font-semibold mb-2">Gender</label>
              <div class="grid grid-cols-3 gap-2">
                <button
                  @click="createForm.gender = 'male'"
                  :class="createForm.gender === 'male' 
                    ? 'bg-blue-500/30 border-2 border-blue-500 text-white' 
                    : 'bg-white/5 border border-white/20 text-white/70 hover:bg-white/10'"
                  class="p-3 rounded-lg transition-all font-semibold"
                >
                  ♂ Male
                </button>
                <button
                  @click="createForm.gender = 'female'"
                  :class="createForm.gender === 'female' 
                    ? 'bg-pink-500/30 border-2 border-pink-500 text-white' 
                    : 'bg-white/5 border border-white/20 text-white/70 hover:bg-white/10'"
                  class="p-3 rounded-lg transition-all font-semibold"
                >
                  ♀ Female
                </button>
                <button
                  @click="createForm.gender = 'other'"
                  :class="createForm.gender === 'other' 
                    ? 'bg-purple-500/30 border-2 border-purple-500 text-white' 
                    : 'bg-white/5 border border-white/20 text-white/70 hover:bg-white/10'"
                  class="p-3 rounded-lg transition-all font-semibold"
                >
                  ⚧ Other
                </button>
              </div>
            </div>
            <button
              @click="handleCreateRoom"
              :disabled="!createForm.nickname.trim() || isConnecting"
              class="w-full bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 hover:from-purple-500 hover:via-pink-500 hover:to-purple-500 text-white px-8 py-4 rounded-xl font-black text-lg shadow-2xl hover:shadow-pink-600/50 transition-all duration-300 transform hover:scale-105 border-2 border-pink-500/50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {{ isConnecting ? 'Connecting...' : 'Create Room' }}
            </button>
          </div>

          <!-- Join Room Form -->
          <div v-else class="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 space-y-4">
            <div>
              <label class="block text-sm font-semibold mb-2">Room Code</label>
              <input
                v-model="joinForm.roomCode"
                type="text"
                placeholder="ABCD12"
                maxlength="6"
                class="w-full bg-white/5 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500 text-center text-2xl font-black tracking-widest uppercase"
                @input="joinForm.roomCode = joinForm.roomCode.toUpperCase().replace(/[^A-Z0-9]/g, '')"
              />
            </div>
            <div>
              <label class="block text-sm font-semibold mb-2">Your Nickname</label>
              <input
                v-model="joinForm.nickname"
                type="text"
                placeholder="Enter your name"
                maxlength="20"
                class="w-full bg-white/5 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <div>
              <label class="block text-sm font-semibold mb-2">Gender</label>
              <div class="grid grid-cols-3 gap-2">
                <button
                  @click="joinForm.gender = 'male'"
                  :class="joinForm.gender === 'male' 
                    ? 'bg-blue-500/30 border-2 border-blue-500 text-white' 
                    : 'bg-white/5 border border-white/20 text-white/70 hover:bg-white/10'"
                  class="p-3 rounded-lg transition-all font-semibold"
                >
                  ♂ Male
                </button>
                <button
                  @click="joinForm.gender = 'female'"
                  :class="joinForm.gender === 'female' 
                    ? 'bg-pink-500/30 border-2 border-pink-500 text-white' 
                    : 'bg-white/5 border border-white/20 text-white/70 hover:bg-white/10'"
                  class="p-3 rounded-lg transition-all font-semibold"
                >
                  ♀ Female
                </button>
                <button
                  @click="joinForm.gender = 'other'"
                  :class="joinForm.gender === 'other' 
                    ? 'bg-purple-500/30 border-2 border-purple-500 text-white' 
                    : 'bg-white/5 border border-white/20 text-white/70 hover:bg-white/10'"
                  class="p-3 rounded-lg transition-all font-semibold"
                >
                  ⚧ Other
                </button>
              </div>
            </div>
            <button
              @click="handleJoinRoom"
              :disabled="!joinForm.roomCode || joinForm.roomCode.length !== 6 || !joinForm.nickname.trim() || isConnecting"
              class="w-full bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 hover:from-purple-500 hover:via-pink-500 hover:to-purple-500 text-white px-8 py-4 rounded-xl font-black text-lg shadow-2xl hover:shadow-pink-600/50 transition-all duration-300 transform hover:scale-105 border-2 border-pink-500/50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {{ isConnecting ? 'Connecting...' : 'Join Room' }}
            </button>
          </div>
        </div>
      </div>

      <!-- Game Phase - Redirect to game -->
      <div v-else-if="safeRoomState.gamePhase === 'playing' && safeRoomState.currentGame" class="text-center py-12">
        <div class="animate-pulse">
          <Icon icon="mdi:loading" class="w-16 h-16 mx-auto mb-4 text-purple-400 animate-spin" />
          <p class="text-xl font-semibold">Starting game...</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { Icon } from '@iconify/vue'
import { useMultiplayer } from '~/composables/useMultiplayer'
import { useGameStore } from '~/stores/game'

const multiplayer = useMultiplayer()
const gameStore = useGameStore()

const {
  isConnected,
  roomState,
  error,
  isHost,
  playerCount,
  canStartGame,
  connect,
  createRoom,
  joinRoom,
  startGame,
  leaveRoom,
  updateNickname,
  attemptAutoReconnect,
} = multiplayer

// Form state
const isCreating = ref(true)
const createForm = ref({
  roomName: '',
  answerVisibility: 'anonymous' as 'anonymous' | 'public',
  nickname: '',
  gender: 'male' as 'male' | 'female' | 'other',
})
const joinForm = ref({
  roomCode: '',
  nickname: '',
  gender: 'male' as 'male' | 'female' | 'other',
})

const selectedGame = ref<string | null>(null)
const isConnecting = ref(false)
const copied = ref(false)
const localError = ref<string | null>(null)

// Use local error instead of readonly error from composable
const displayError = computed(() => localError.value || error.value)

const copyRoomCode = async () => {
  if (!safeRoomState.value.roomCode) return
  try {
    await navigator.clipboard.writeText(safeRoomState.value.roomCode)
    copied.value = true
    setTimeout(() => {
      copied.value = false
    }, 2000)
  } catch (err) {
    console.error('Failed to copy:', err)
  }
}

// Safe room state access
const safeRoomState = computed(() => {
  if (!roomState || !roomState.value) {
    return {
      roomId: null,
      roomCode: null,
      roomName: undefined,
      hostSocketId: null,
      players: [],
      maxPlayers: 999,
      answerVisibility: 'anonymous' as const,
      currentGame: null,
      gamePhase: 'lobby' as const,
      currentPrompt: null,
    }
  }
  return roomState.value
})

// Multiplayer games (excluding single-device only games)
const multiplayerGames = [
  { value: 'truth-or-dare', name: 'Truth or Dare', emoji: '🎭' },
  { value: 'dice-of-desire', name: 'Dice of Desire', emoji: '🎲' },
  { value: 'do-or-drink', name: 'Do or Drink', emoji: '🍺' },
  { value: 'never-have-i-ever', name: 'Never Have I Ever', emoji: '🙅' },
  { value: 'most-likely-to', name: 'Most Likely To', emoji: '🤷' },
  { value: 'would-you-rather', name: 'Would You Rather', emoji: '🤔' },
]

const handleCreateRoom = async () => {
  if (!createForm.value.nickname.trim() || isConnecting.value) return
  
  isConnecting.value = true
  localError.value = null
  
  try {
    // Connect first
    const socket = connect()
    if (!socket) {
      localError.value = 'Failed to initialize connection'
      isConnecting.value = false
      return
    }
    
    // Wait for connection to be established (max 3 seconds)
    let attempts = 0
    while (!isConnected.value && attempts < 15) {
      await new Promise(resolve => setTimeout(resolve, 200))
      attempts++
    }
    
    if (!isConnected.value) {
      localError.value = 'Connection timeout. Please refresh and try again.'
      isConnecting.value = false
      return
    }
    
    // Create room
    createRoom({
      roomName: createForm.value.roomName || undefined,
      answerVisibility: createForm.value.answerVisibility,
      nickname: createForm.value.nickname,
      gender: createForm.value.gender,
    })
    
    // Store room info for reconnection (will be updated when room is created)
    // Update nickname and gender after room is created
    setTimeout(() => {
      updateNickname(createForm.value.nickname, createForm.value.gender)
      // Store room info once we have the room code
      if (roomState.value.roomCode) {
        localStorage.setItem('multiplayer_room', JSON.stringify({
          roomCode: roomState.value.roomCode,
          nickname: createForm.value.nickname,
          gender: createForm.value.gender,
          isHost: true,
        }))
      }
      isConnecting.value = false
    }, 500)
  } catch (err) {
    console.error('Error creating room:', err)
    localError.value = 'Failed to create room. Please try again.'
    isConnecting.value = false
  }
}

const handleJoinRoom = async () => {
  if (!joinForm.value.roomCode || joinForm.value.roomCode.length !== 6) return
  if (!joinForm.value.nickname.trim() || isConnecting.value) return
  
  isConnecting.value = true
  localError.value = null
  
  try {
    // Connect first
    const socket = connect()
    if (!socket) {
      localError.value = 'Failed to initialize connection'
      isConnecting.value = false
      return
    }
    
    // Wait for connection to be established (max 3 seconds)
    let attempts = 0
    while (!isConnected.value && attempts < 15) {
      await new Promise(resolve => setTimeout(resolve, 200))
      attempts++
    }
    
    if (!isConnected.value) {
      localError.value = 'Connection timeout. Please refresh and try again.'
      isConnecting.value = false
      return
    }
    
    // Join room
    joinRoom(joinForm.value.roomCode, joinForm.value.nickname, joinForm.value.gender)
    
    // Store room info for reconnection
    localStorage.setItem('multiplayer_room', JSON.stringify({
      roomCode: joinForm.value.roomCode,
      nickname: joinForm.value.nickname,
      gender: joinForm.value.gender,
    }))
    
    // Update nickname and gender after joining (in case joinRoom doesn't accept gender)
    setTimeout(() => {
      updateNickname(joinForm.value.nickname, joinForm.value.gender)
      isConnecting.value = false
    }, 500)
  } catch (err) {
    console.error('Error joining room:', err)
    localError.value = 'Failed to join room. Please try again.'
    isConnecting.value = false
  }
}

const handleStartGame = () => {
  if (!selectedGame.value || !canStartGame.value) return
  
  // Set game in store
  gameStore.setSelectedGame(selectedGame.value as any)
  
  // Store room info for game pages (preserve nickname)
  if (roomState.value.roomCode) {
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
      roomCode: roomState.value.roomCode,
      isHost: isHost.value,
      answerVisibility: roomState.value.answerVisibility,
    }))
  }
  
  // Start game
  startGame(selectedGame.value)
  
  // Navigate to multiplayer game
  navigateTo(`/multiplayer/${selectedGame.value}`)
}

const handleLeaveRoom = () => {
  leaveRoom()
  navigateTo('/')
}

// Watch for game phase changes
watch(() => roomState.value.gamePhase, (newPhase) => {
  if (newPhase === 'playing' && roomState.value.currentGame) {
    // Store room info with nickname
    if (roomState.value.roomCode) {
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
        roomCode: roomState.value.roomCode,
        isHost: isHost.value,
        answerVisibility: roomState.value.answerVisibility,
      }))
    }
    
    // Navigate to multiplayer game
    navigateTo(`/multiplayer/${roomState.value.currentGame}`)
  }
})

onMounted(() => {
  connect()
  
  // Watch for connection and auto-reconnect
  watch(isConnected, (connected) => {
    if (connected && typeof window !== 'undefined') {
      const roomInfo = localStorage.getItem('multiplayer_room')
      if (roomInfo && !roomState.value?.roomCode) {
        try {
          const info = JSON.parse(roomInfo)
          if (info.roomCode && info.nickname) {
            // Update form values
            joinForm.value.roomCode = info.roomCode
            joinForm.value.nickname = info.nickname
            joinForm.value.gender = info.gender || 'male'
            isCreating.value = false
            
            // Rejoin room using the composable method
            setTimeout(() => {
              console.log('🔄 Auto-reconnecting to room from lobby:', info.roomCode)
              attemptAutoReconnect()
            }, 300)
          }
        } catch (e) {
          console.error('Failed to parse room info:', e)
          localStorage.removeItem('multiplayer_room')
        }
      }
    }
  }, { immediate: true })
})
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>

