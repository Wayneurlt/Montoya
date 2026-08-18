<template>
  <div class="lobby-page min-h-screen bg-nightlife text-paper p-3 sm:p-4 relative overflow-x-hidden overflow-y-auto">
    <!-- Background Icons Pattern -->
    <BackgroundIcons />

    <div class="max-w-4xl mx-auto relative z-10 pt-4 sm:pt-6 md:pt-8 safe-bottom">
      <!-- Header: sticky-top so the room code stays visible (for sharing)
           while scrolling the player list / game grid below. -->
      <div ref="headerRef" class="lobby-sticky-header flex items-center justify-between mb-6 sm:mb-8">
        <NuxtLink to="/" class="bg-card border border-white/10 hover:border-hot/50 px-3 sm:px-4 py-1.5 sm:py-2 rounded-md transition-colors flex items-center gap-2">
          <Icon icon="mdi:home" class="w-5 h-5" />
          <span class="font-medium">Home</span>
        </NuxtLink>
        <div v-if="safeRoomState.roomCode" class="text-center">
          <div class="text-xs text-paper/50 mb-1 font-display uppercase tracking-wide">Room Code</div>
          <button
            @click="copyRoomCode"
            class="group relative cursor-pointer transition-all hover:-translate-y-0.5"
            :title="copied ? 'Copied!' : 'Click to copy'"
          >
            <div class="font-display text-3xl sm:text-4xl font-bold text-hot flex items-center justify-center gap-2">
              {{ safeRoomState.roomCode }}
              <Icon icon="mdi:content-copy" class="w-5 h-5 sm:w-6 sm:h-6 text-hot/70 group-hover:text-hot transition-colors" />
            </div>
            <transition name="fade">
              <div v-if="copied" class="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-volt text-ink px-3 py-1 rounded-md text-xs whitespace-nowrap font-display uppercase tracking-wide font-bold">
                Copied!
              </div>
            </transition>
          </button>
        </div>
      </div>

      <!-- Connection Lost - distinct from dismissible room errors: reconnection is exhausted -->
      <transition name="fade">
        <div v-if="connectionLost" class="mb-6 card-poster p-4 flex items-center justify-between gap-3">
          <div class="flex items-center gap-2 min-w-0">
            <Icon icon="mdi:wifi-off" class="w-6 h-6 text-hot shrink-0" />
            <p class="text-paper font-semibold">Lost connection to the server.</p>
          </div>
          <button
            type="button"
            @click="retryConnection"
            class="shrink-0 bg-hot text-paper shadow-hard-sm hover:brightness-110 px-4 py-2 rounded-md font-display font-bold uppercase tracking-wide text-sm transition-[filter]"
          >
            Retry
          </button>
        </div>
      </transition>

      <!-- Error Message -->
      <transition name="fade">
        <div v-if="displayError" class="mb-6 card-poster p-4">
          <div class="flex items-center justify-between gap-2">
            <div class="flex items-center gap-2 min-w-0">
              <Icon icon="mdi:alert-circle" class="w-6 h-6 text-hot shrink-0" />
              <p class="text-paper font-semibold">{{ displayError }}</p>
            </div>
            <button
              type="button"
              @click="localError = null; clearError()"
              class="shrink-0 p-1 rounded-md hover:bg-white/5 text-paper/60 hover:text-paper transition-colors"
              aria-label="Dismiss"
            >
              <Icon icon="mdi:close" class="w-5 h-5" />
            </button>
          </div>
        </div>
      </transition>

      <!-- Lobby Phase -->
      <div ref="mainContentRef" v-if="!safeRoomState.gamePhase || safeRoomState.gamePhase === 'lobby'" class="space-y-6">
        <!-- Room Info Card -->
        <div v-if="safeRoomState.roomCode" class="card-poster p-6">
          <div class="text-center mb-6">
            <h1 class="font-display text-3xl sm:text-4xl font-bold uppercase mb-2 text-paper">
              {{ safeRoomState.roomName || 'Game Room' }}
            </h1>
            <div class="flex items-center justify-center gap-4 mt-4">
              <div class="flex items-center gap-2">
                <Icon icon="mdi:account-group" class="w-5 h-5 text-hot" />
                <span class="text-sm">{{ playerCount }} Players</span>
              </div>
              <div class="flex items-center gap-2">
                <Icon :icon="safeRoomState.answerVisibility === 'anonymous' ? 'mdi:incognito' : 'mdi:eye'" class="w-5 h-5 text-volt" />
                <span class="text-sm capitalize">{{ safeRoomState.answerVisibility }} Mode</span>
              </div>
            </div>
          </div>

          <!-- Player List -->
          <div class="mb-6">
            <h3 class="font-display text-lg font-bold uppercase mb-4 text-center text-paper">Players</h3>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div
                v-for="player in safeRoomState.players"
                :key="player.socketId"
                class="bg-card rounded-md p-4 border border-white/10 flex items-center justify-between"
                :class="{ 'border-hot': player.isHost, 'opacity-50': !player.connected }"
              >
                <div class="flex items-center gap-3">
                  <div class="w-10 h-10 rounded-full bg-hot text-paper flex items-center justify-center font-display font-bold">
                    {{ player.nickname.charAt(0).toUpperCase() }}
                  </div>
                  <div>
                    <div class="font-semibold flex items-center gap-2">
                      {{ player.nickname }}
                      <span v-if="player.isHost" class="badge-stamp bg-hot text-paper text-[10px] px-2 py-0.5">Host</span>
                    </div>
                    <div class="text-xs text-paper/50">
                      {{ player.connected ? 'Connected' : 'Disconnected' }}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>


          <!-- Select Game - Always show if room exists, but disable if not host.
               Start Game / Ring Host live in the sticky action bar below so
               they stay reachable regardless of player-list/grid length. -->
          <div class="card-poster p-4">
            <h3 class="font-display font-bold uppercase tracking-wide mb-3 flex items-center gap-2 text-paper">
              <Icon icon="mdi:gamepad-variant" class="w-5 h-5 text-hot" />
              Select Game
            </h3>
            <div class="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <button
                v-for="game in multiplayerGames"
                :key="game.value"
                @click="selectedGame = game.value"
                :disabled="!isHost"
                :class="selectedGame === game.value
                  ? 'border-hot bg-hot/15 shadow-hard-sm'
                  : 'border-white/10 bg-white/5 hover:border-hot/30'"
                class="p-3 rounded-md border-2 transition-all text-center disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Icon :icon="game.icon" class="w-6 h-6 mx-auto mb-1 text-hot" />
                <div class="text-xs font-display font-bold uppercase tracking-wide">{{ game.name }}</div>
              </button>
            </div>
          </div>

          <!-- Leave Button -->
          <button
            @click="handleLeaveRoom"
            class="w-full mt-4 bg-hot/10 hover:bg-hot/20 text-hot px-4 py-2 rounded-md border border-hot/30 transition-all font-display uppercase tracking-wide text-sm"
          >
            Leave Room
          </button>
        </div>

        <!-- Create/Join Room Form -->
        <div v-else class="space-y-4">
          <div class="text-center mb-4">
            <h1 class="font-display text-3xl sm:text-4xl font-bold uppercase mb-2 text-paper">
              Multiplayer <span class="text-hot">Mode</span>
            </h1>
            <p class="text-paper/70 text-base">Create or join a game room</p>
          </div>

          <!-- Tabs -->
          <div class="pill-toggle">
            <button
              @click="isCreating = true"
              :class="{ 'is-active': isCreating }"
              class="pill-toggle-btn py-2.5"
            >
              Create Room
            </button>
            <button
              @click="isCreating = false"
              :class="{ 'is-active': !isCreating }"
              class="pill-toggle-btn py-2.5"
            >
              Join Room
            </button>
          </div>

          <!-- Create Room Form -->
          <div v-if="isCreating" class="card-poster p-4 sm:p-6 space-y-3">
            <div>
              <label class="block text-sm font-semibold mb-1.5">Room Name (Optional)</label>
              <input
                v-model="createForm.roomName"
                type="text"
                placeholder="My Awesome Game"
                class="w-full bg-white/5 border border-white/10 rounded-md px-4 py-2.5 text-paper placeholder-paper/40 focus:outline-none focus:ring-2 focus:ring-hot/60"
              />
            </div>
            <div>
              <label class="block text-sm font-semibold mb-1.5">Answer Visibility</label>
              <div class="space-y-1.5">
                <label
                  class="flex items-center gap-3 p-2.5 rounded-md border cursor-pointer transition-all"
                  :class="createForm.answerVisibility === 'anonymous' ? 'border-hot bg-hot/10' : 'border-white/10 bg-white/5 hover:bg-white/10'"
                >
                  <input
                    v-model="createForm.answerVisibility"
                    type="radio"
                    value="anonymous"
                    class="w-4 h-4 accent-hot"
                  />
                  <div class="flex-1">
                    <div class="font-semibold flex items-center gap-2 text-sm">
                      <Icon icon="mdi:incognito" class="w-4 h-4" />
                      Anonymous
                    </div>
                    <div class="text-xs text-paper/60">Answers and votes are hidden</div>
                  </div>
                </label>
                <label
                  class="flex items-center gap-3 p-2.5 rounded-md border cursor-pointer transition-all"
                  :class="createForm.answerVisibility === 'public' ? 'border-hot bg-hot/10' : 'border-white/10 bg-white/5 hover:bg-white/10'"
                >
                  <input
                    v-model="createForm.answerVisibility"
                    type="radio"
                    value="public"
                    class="w-4 h-4 accent-hot"
                  />
                  <div class="flex-1">
                    <div class="font-semibold flex items-center gap-2 text-sm">
                      <Icon icon="mdi:eye" class="w-4 h-4" />
                      Public
                    </div>
                    <div class="text-xs text-paper/60">Answers and votes show player names</div>
                  </div>
                </label>
              </div>
            </div>
            <div>
              <label class="block text-sm font-semibold mb-1.5">Your Nickname</label>
              <input
                v-model="createForm.nickname"
                type="text"
                placeholder="Enter your name"
                maxlength="20"
                class="w-full bg-white/5 border border-white/10 rounded-md px-4 py-2.5 text-paper placeholder-paper/40 focus:outline-none focus:ring-2 focus:ring-hot/60"
              />
            </div>
            <div>
              <label class="block text-sm font-semibold mb-1.5">Gender</label>
              <GenderPicker v-model="createForm.gender" aria-label="Your gender" />
            </div>
          </div>

          <!-- Join Room Form -->
          <div v-else class="card-poster p-4 sm:p-6 space-y-3">
            <div>
              <label class="block text-sm font-semibold mb-1.5">Room Code</label>
              <input
                v-model="joinForm.roomCode"
                type="text"
                placeholder="ABCD12"
                maxlength="6"
                class="w-full bg-white/5 border border-white/10 rounded-md px-4 py-2.5 text-paper placeholder-paper/40 focus:outline-none focus:ring-2 focus:ring-hot/60 text-center text-2xl font-display font-bold tracking-widest uppercase"
                @input="joinForm.roomCode = joinForm.roomCode.toUpperCase().replace(/[^A-Z0-9]/g, ''); localError = null; clearError()"
              />
            </div>
            <div>
              <label class="block text-sm font-semibold mb-1.5">Your Nickname</label>
              <input
                v-model="joinForm.nickname"
                type="text"
                placeholder="Enter your name"
                maxlength="20"
                class="w-full bg-white/5 border border-white/10 rounded-md px-4 py-2.5 text-paper placeholder-paper/40 focus:outline-none focus:ring-2 focus:ring-hot/60"
              />
            </div>
            <div>
              <label class="block text-sm font-semibold mb-1.5">Gender</label>
              <GenderPicker v-model="joinForm.gender" aria-label="Your gender" />
            </div>
          </div>
        </div>

        <!-- Sticky primary action: Start Game/Ring Host once a room exists,
             otherwise Create/Join Room submit — always reachable regardless
             of player-list or game-grid length. -->
        <StickyActionBar>
          <div class="w-full">
            <template v-if="safeRoomState.roomCode">
              <p v-if="!isHost" class="text-center text-sm text-hot mb-2">
                <Icon icon="mdi:information" class="w-4 h-4 inline mr-1" />
                Only the host can start the game
              </p>
              <p v-else-if="lobbyActionHint" class="text-center text-sm text-hot mb-2">
                <Icon icon="mdi:information" class="w-4 h-4 inline mr-1" />
                {{ lobbyActionHint }}
              </p>
              <button
                v-if="isHost"
                @click="handleStartGame"
                :disabled="!canStartGame || !selectedGame || isStartingGame"
                class="w-full bg-volt text-ink shadow-hard hover:brightness-110 px-8 py-4 rounded-lg font-display font-bold uppercase tracking-wide text-lg transition-[filter] disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none flex items-center justify-center gap-2"
              >
                <Icon :icon="isStartingGame ? 'mdi:loading' : 'mdi:play-circle'" :class="['w-6 h-6', { 'animate-spin': isStartingGame }]" />
                <span>{{ isStartingGame ? 'Starting...' : 'Start Game' }}</span>
              </button>
              <button
                v-else
                @click="handleRingHost"
                :disabled="isRinging || ringHostCooldown > 0"
                class="w-full inline-flex items-center justify-center gap-2 bg-hot text-paper shadow-hard hover:brightness-110 px-4 py-3 rounded-lg font-display font-bold uppercase tracking-wide text-sm transition-[filter] disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
              >
                <Icon icon="mdi:bell-ring" class="w-4 h-4" />
                {{ isRinging ? 'Ringing...' : ringHostCooldown > 0 ? `Ring Host (${ringHostCooldown}s)` : 'Ring Host' }}
              </button>
            </template>
            <template v-else-if="isCreating">
              <button
                @click="handleCreateRoom"
                :disabled="!createForm.nickname.trim() || isConnecting"
                class="w-full bg-hot text-paper shadow-hard hover:brightness-110 px-8 py-3 rounded-lg font-display font-bold uppercase tracking-wide text-base sm:text-lg transition-[filter] disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
              >
                {{ isConnecting ? 'Connecting...' : 'Create Room' }}
              </button>
            </template>
            <template v-else>
              <button
                @click="handleJoinRoom"
                :disabled="!joinForm.roomCode || joinForm.roomCode.length !== 6 || !joinForm.nickname.trim() || isConnecting"
                class="w-full bg-hot text-paper shadow-hard hover:brightness-110 px-8 py-3 rounded-lg font-display font-bold uppercase tracking-wide text-base sm:text-lg transition-[filter] disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
              >
                {{ isConnecting ? 'Connecting...' : 'Join Room' }}
              </button>
            </template>
          </div>
        </StickyActionBar>
      </div>

      <!-- Game Phase - Redirect to game -->
      <div v-else-if="safeRoomState.gamePhase === 'playing' && safeRoomState.currentGame" class="text-center py-12">
        <div class="animate-pulse">
          <Icon icon="mdi:loading" class="w-16 h-16 mx-auto mb-4 text-hot animate-spin" />
          <p class="text-xl font-semibold">Starting game...</p>
        </div>
      </div>
    </div>

    <MultiplayerPaywallModal @success="handlePaywallSuccess" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue'
import { Icon } from '@iconify/vue'
import { push } from 'notivue'
import { useMultiplayer } from '~/composables/useMultiplayer'
import { playRingSound, vibrateRing } from '~/composables/useRingSound'
import { usePayment } from '~/composables/usePayment'
import { useGameStore } from '~/stores/game'
import MultiplayerPaywallModal from '~/components/payment/MultiplayerPaywallModal.vue'
import { staggerReveal } from '~/composables/useGameAnimations'

// Multiplayer room state lives in a process-wide singleton (see useMultiplayer.ts),
// not per-request — rendering it during SSR could leak one user's live room into
// another user's server-rendered HTML, so this page is client-only.
definePageMeta({ ssr: false })

const multiplayer = useMultiplayer()
const gameStore = useGameStore()

const {
  isConnected,
  connectionLost,
  roomState,
  error,
  isHost,
  playerCount,
  canStartGame,
  connect,
  retryConnection,
  createRoom,
  joinRoom,
  startGame,
  leaveRoom,
  updateNickname,
  attemptAutoReconnect,
  ringHost,
  clearError,
  paymentRequired,
  clearPaymentRequired,
} = multiplayer

const { passActive, checkEntitlement, openPaywall } = usePayment()

const isRinging = ref(false)
const ringHostCooldown = ref(0)
let ringCooldownTimer: ReturnType<typeof setInterval> | null = null
let isComponentMounted = true
let pendingConnectTimeout: ReturnType<typeof setTimeout> | null = null

// Animation refs
const headerRef = ref(null)
const mainContentRef = ref(null)

const handleRingHost = () => {
  if (isRinging.value || ringHostCooldown.value > 0) return
  isRinging.value = true
  ringHostCooldown.value = 10
  ringHost()
  setTimeout(() => { isRinging.value = false }, 1000)
  if (ringCooldownTimer) clearInterval(ringCooldownTimer)
  ringCooldownTimer = setInterval(() => {
    ringHostCooldown.value--
    if (ringHostCooldown.value <= 0 && ringCooldownTimer) {
      clearInterval(ringCooldownTimer)
      ringCooldownTimer = null
    }
  }, 1000)
}

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
const isStartingGame = ref(false)
const copied = ref(false)
const localError = ref<string | null>(null)
// Tracks which action the paywall was opened for, so a successful payment
// retries the right thing instead of always re-attempting room creation.
const pendingPaywallAction = ref<'create' | 'start'>('create')

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

// Reason the sticky Start Game button is disabled, for the host only —
// non-hosts get the fixed "only the host can start" message instead.
const lobbyActionHint = computed(() => {
  if (!selectedGame.value) return 'Please select a game first'
  if (playerCount.value < 2) return `Need at least 2 players to start (${playerCount.value}/2)`
  if (!canStartGame.value) return 'Waiting for more players...'
  return null
})

// Multiplayer games (excluding single-device only games)
const multiplayerGames = [
  { value: 'truth-or-dare', name: 'Truth or Dare', icon: 'mdi:cards-heart' },
  { value: 'dice-of-desire', name: 'Dice of Desire', icon: 'mdi:dice-6' },
  { value: 'do-or-drink', name: 'Do or Drink', icon: 'mdi:glass-cocktail' },
  { value: 'never-have-i-ever', name: 'Never Have I Ever', icon: 'mdi:hand-back-right' },
  { value: 'most-likely-to', name: 'Most Likely To', icon: 'mdi:account-group-outline' },
  { value: 'would-you-rather', name: 'Would You Rather', icon: 'mdi:help-circle' },
]

const handleCreateRoom = async () => {
  if (!createForm.value.nickname.trim() || isConnecting.value) return

  pendingPaywallAction.value = 'create'
  if (!passActive.value) {
    openPaywall()
    return
  }

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
    while (!isConnected.value && attempts < 15 && isComponentMounted) {
      await new Promise(resolve => setTimeout(resolve, 200))
      attempts++
    }

    if (!isComponentMounted) return

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
    pendingConnectTimeout = setTimeout(() => {
      if (!isComponentMounted) return
      // Only update nickname / persist room info if the room actually got created —
      // room:create can be rejected server-side (e.g. payment required), in which case
      // roomCode is never set and there's no room to update.
      if (roomState.value.roomCode) {
        updateNickname(createForm.value.nickname, createForm.value.gender)
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
    while (!isConnected.value && attempts < 15 && isComponentMounted) {
      await new Promise(resolve => setTimeout(resolve, 200))
      attempts++
    }

    if (!isComponentMounted) return

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
    pendingConnectTimeout = setTimeout(() => {
      if (!isComponentMounted) return
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

  pendingPaywallAction.value = 'start'
  isStartingGame.value = true
  gameStore.setSelectedGame(selectedGame.value as any)
  startGame(selectedGame.value)

  // Navigation happens reactively once the server confirms gamePhase → 'playing'
  // (see the roomState.gamePhase watcher below). Every client — host included —
  // goes through that single path instead of the host also firing its own
  // immediate navigateTo, which used to race the server round-trip and could
  // flash the game screen before bouncing back if the start was rejected.
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

let hostRingHandler: ((e: Event) => void) | null = null

const handlePaywallSuccess = () => {
  if (pendingPaywallAction.value === 'start') {
    handleStartGame()
  } else {
    handleCreateRoom()
  }
}

watch(paymentRequired, (blocked) => {
  if (blocked) {
    isConnecting.value = false
    isStartingGame.value = false
    clearPaymentRequired()
    openPaywall()
  }
})

// Any room:error (start rejected, room full, etc.) means "Start Game" didn't
// go through — clear the pending state so the button doesn't stay stuck.
watch(error, (message) => {
  if (message) {
    isStartingGame.value = false
  }
})

onMounted(() => {
  connect()
  checkEntitlement()

  // Host ring: show toast + sound when a player rings (host is on lobby)
  if (typeof window !== 'undefined') {
    hostRingHandler = (event: Event) => {
      const data = (event as CustomEvent<{ playerName: string; message: string }>).detail
      vibrateRing()
      playRingSound()
      push.warning({ title: '🔔 Someone is waiting!', message: data.message, duration: 6000 })
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('🔔 Players are waiting!', { body: data.message })
      }
    }
    window.addEventListener('host-ring', hostRingHandler)
  }

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
              if (!isComponentMounted) return
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

  staggerReveal([headerRef.value, mainContentRef.value])
})

onBeforeUnmount(() => {
  isComponentMounted = false
  if (pendingConnectTimeout) {
    clearTimeout(pendingConnectTimeout)
    pendingConnectTimeout = null
  }
  if (ringCooldownTimer) {
    clearInterval(ringCooldownTimer)
    ringCooldownTimer = null
  }
  if (typeof window !== 'undefined' && hostRingHandler) {
    window.removeEventListener('host-ring', hostRingHandler)
    hostRingHandler = null
  }
})
</script>

<style scoped>
/* Use document scroll: page grows with content so body scrolls (works on all mobile browsers) */
.lobby-page {
  min-height: 100vh;
  min-height: 100dvh;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.lobby-sticky-header {
  position: sticky;
  top: 0;
  z-index: 20;
  padding: 0.5rem 0;
  margin: -0.5rem 0 0;
  background-color: rgba(10, 10, 13, 0.85);
  backdrop-filter: blur(8px);
}
</style>
