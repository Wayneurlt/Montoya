<template>
  <div class="max-w-3xl mx-auto relative z-10 pt-2 sm:pt-4 md:pt-6 lg:pt-8 pb-4 sm:pb-6">
    <!-- Header -->
    <div class="flex justify-between items-center mb-6">
      <button
        @click="handleBackToLobby"
        class="bg-white/10 hover:bg-white/20 backdrop-blur-md px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg transition-all flex items-center gap-2 border border-white/20 hover:scale-105"
      >
        <Icon icon="mdi:arrow-left" class="w-5 h-5" />
        <span class="font-medium">Back to Lobby</span>
      </button>
      <div class="text-center">
        <div class="text-xs text-white/60 mb-1">Room Code</div>
        <button
          @click="copyRoomCode"
          class="group relative cursor-pointer transition-all hover:scale-105"
          :title="copied ? 'Copied!' : 'Click to copy'"
        >
          <div class="text-2xl sm:text-3xl font-black bg-gradient-to-r from-purple-400 via-pink-500 to-cyan-400 bg-clip-text text-transparent flex items-center justify-center gap-2">
            {{ roomState.roomCode }}
            <Icon icon="mdi:content-copy" class="w-4 h-4 sm:w-5 sm:h-5 text-purple-400 opacity-70 group-hover:opacity-100 transition-opacity" />
          </div>
          <transition name="fade">
            <div v-if="copied" class="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-green-500 text-white px-3 py-1 rounded-lg text-xs whitespace-nowrap">
              Copied!
            </div>
          </transition>
        </button>
      </div>
      <div v-if="isHost" class="flex">
        <button
          @click="handleChangeGame"
          class="bg-yellow-500/20 hover:bg-yellow-500/30 backdrop-blur-md px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg transition-all flex items-center gap-2 border border-yellow-500/30 hover:scale-105"
        >
          <Icon icon="mdi:gamepad-variant" class="w-5 h-5" />
          <span class="font-medium hidden sm:inline">Change Game</span>
        </button>
      </div>
    </div>

    <!-- Game Title -->
    <div class="text-center mb-4 sm:mb-6 md:mb-8">
      <h1 class="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-black mb-2 sm:mb-3 md:mb-4 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-pink-500 to-cyan-400 drop-shadow-2xl">
        💬 Truth or Dare
      </h1>
      <p class="text-purple-200/80 text-xs sm:text-sm font-medium">{{ roomState.answerVisibility === 'anonymous' ? 'Anonymous Mode' : 'Public Mode' }}</p>
    </div>

    <!-- Turn Indicator - always show whose turn when playing -->
    <div v-if="roomState.gamePhase === 'playing'" class="mb-4 sm:mb-6">
      <TurnIndicator v-if="currentPlayer" :current-player="currentPlayer" />
      <div v-else class="bg-white/10 rounded-xl sm:rounded-2xl p-4 sm:p-5 border border-white/20 text-center">
        <p class="text-white/70 text-sm sm:text-base">Waiting to see whose turn...</p>
      </div>
    </div>

    <!-- Intensity Toggle (Host Only) -->
    <div v-if="isHost" class="mb-4 sm:mb-5 md:mb-6">
      <div class="flex bg-white/5 rounded-xl p-1 border-2 border-white/10">
        <button
          @click="isSpicyMode = false"
          class="flex-1 px-6 py-4 rounded-lg transition-all duration-300 text-base font-bold"
          :class="!isSpicyMode ? 'bg-gradient-to-r from-purple-600 to-cyan-600 text-white shadow-lg scale-105' : 'text-white/70 hover:text-white hover:bg-white/5'"
        >
          😇 Normal
        </button>
        <button
          @click="isSpicyMode = true"
          class="flex-1 px-6 py-4 rounded-lg transition-all duration-300 text-base font-bold"
          :class="isSpicyMode ? 'bg-gradient-to-r from-pink-600 to-purple-600 text-white shadow-lg scale-105' : 'text-white/70 hover:text-white hover:bg-white/5'"
        >
          🌶️ Spicy
        </button>
      </div>
      <div class="text-center mt-3 text-sm font-medium"
        :class="isSpicyMode ? 'text-pink-300' : 'text-purple-300'">
        {{ isSpicyMode ? '🔥 Hot and steamy questions' : '✨ Mild and playful questions' }}
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="questionsLoading" class="mb-6 bg-blue-500/20 border border-blue-400/30 rounded-xl p-4 text-center">
      <div class="flex items-center justify-center gap-3">
        <Icon icon="svg-spinners:3-dots-fade" class="w-6 h-6" />
        <span class="font-medium">Loading questions from database...</span>
      </div>
    </div>

    <!-- Current Card Display -->
    <div v-if="roomState.currentPrompt && roomState.currentPrompt.text && cardFlipped" class="mb-4 sm:mb-6">
      <div class="bg-white/10 backdrop-blur-md rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8 lg:p-10 border border-white/20 shadow-2xl">
        <div class="text-center">
          <!-- Type Badge -->
          <div class="mb-3 sm:mb-4 md:mb-6 flex justify-center">
            <div class="inline-flex items-center gap-2 sm:gap-3 px-3 sm:px-4 md:px-6 py-2 sm:py-2.5 md:py-3 rounded-full font-black text-sm sm:text-base md:text-lg shadow-lg"
              :class="roomState.currentPrompt.type === 'TRUTH' 
                ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white' 
                : 'bg-gradient-to-r from-pink-600 to-red-600 text-white'">
              <Icon :icon="roomState.currentPrompt.type === 'TRUTH' ? 'mdi:chat-question' : 'mdi:fire'" class="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6" />
              {{ roomState.currentPrompt.type === 'TRUTH' ? 'TRUTH' : 'DARE' }}
            </div>
          </div>
          
          <!-- Question Text -->
          <p class="text-lg sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl font-bold mb-4 sm:mb-5 md:mb-6 leading-tight sm:leading-relaxed px-2 sm:px-4">
            {{ roomState.currentPrompt.text }}
          </p>
          
          <!-- Target Player (for Dares) -->
          <div v-if="roomState.currentPrompt.target" class="bg-white/5 rounded-lg sm:rounded-xl p-2 sm:p-3 md:p-4 max-w-sm mx-auto mb-3 sm:mb-4 border border-white/10">
            <p class="text-xs sm:text-sm md:text-base font-medium flex items-center justify-center gap-1.5 sm:gap-2">
              <Icon icon="mdi:account-arrow-right" class="w-4 h-4 sm:w-5 sm:h-5" />
              To: {{ roomState.currentPrompt.target.nickname }}
            </p>
          </div>
        </div>
      </div>

      <!-- Hesitation Timer -->
      <div v-if="roomState.currentPrompt && roomState.currentPrompt.text && cardFlipped" class="mb-4 sm:mb-6 bg-white/5 rounded-lg sm:rounded-xl p-3 sm:p-4">
        <div class="flex justify-between items-center mb-2">
          <div class="flex items-center gap-2">
            <Icon icon="mdi:timer-sand" class="w-4 h-4 sm:w-5 sm:h-5 text-pink-300" />
            <span class="font-medium text-sm sm:text-base">Hesitation Timer</span>
          </div>
          <span
            class="font-bold text-lg sm:text-xl"
            :class="hesitationTime <= 10 ? 'text-red-400' : 'text-cyan-400'"
          >
            {{ Math.floor(hesitationTime / 60) }}:{{ String(Math.floor(hesitationTime % 60)).padStart(2, '0') }}
          </span>
        </div>
        <div class="w-full h-2 bg-white/20 rounded-full overflow-hidden">
          <div
            class="h-full bg-gradient-to-r from-pink-500 to-purple-500 transition-all duration-1000 ease-linear"
            :style="{ width: hesitationPercent + '%' }"
          ></div>
        </div>
      </div>

      <!-- Action Buttons (Host only - host marks completed/failed) -->
      <div v-if="roomState.currentPrompt && roomState.currentPrompt.text && cardFlipped && isHost" class="grid grid-cols-2 gap-3 sm:gap-4 mb-4 sm:mb-6">
        <button
          @click="completeChallenge"
          class="group bg-gradient-to-r from-green-700 to-emerald-700 hover:from-green-600 hover:to-emerald-600 py-3 sm:py-4 rounded-xl sm:rounded-2xl font-black text-sm sm:text-base md:text-lg transition-all flex items-center justify-center gap-2 sm:gap-3 shadow-xl hover:shadow-green-600/50 border-2 border-green-500/30 hover:scale-105"
        >
          <Icon icon="mdi:check-bold" class="w-5 h-5 sm:w-6 sm:h-6 group-hover:scale-110 transition-transform" />
          Completed
        </button>
        <button
          @click="failChallenge"
          class="group bg-gradient-to-r from-red-700 to-pink-700 hover:from-red-600 hover:to-pink-600 py-3 sm:py-4 rounded-xl sm:rounded-2xl font-black text-sm sm:text-base md:text-lg transition-all flex items-center justify-center gap-2 sm:gap-3 shadow-xl hover:shadow-red-600/50 border-2 border-red-500/30 hover:scale-105"
        >
          <Icon icon="mdi:close-thick" class="w-5 h-5 sm:w-6 sm:h-6 group-hover:scale-110 transition-transform" />
          Failed
        </button>
      </div>
      <p v-else-if="roomState.currentPrompt && roomState.currentPrompt.text && cardFlipped && !isHost" class="text-center text-white/60 text-sm mb-4">
        Waiting for host to mark as Completed or Failed
      </p>
    </div>

    <!-- Waiting for Host -->
    <WaitingForHost
      v-else-if="roomState.gamePhase === 'playing' && (!roomState.currentPrompt || !roomState.currentPrompt.text) && !isHost"
      :host-name="hostName"
      :multiplayer="props.multiplayer"
    />
    <div v-else-if="roomState.gamePhase === 'playing' && (!roomState.currentPrompt || !roomState.currentPrompt.text) && isHost" class="bg-white/10 backdrop-blur-md rounded-2xl p-8 mb-6 border border-white/20 text-center">
      <div class="animate-pulse">
        <Icon icon="mdi:cards" class="w-16 h-16 mx-auto mb-4 text-purple-400" />
        <p class="text-xl font-semibold">{{ roomState.currentPrompt?.player?.nickname ? `Waiting for ${roomState.currentPrompt.player.nickname} to receive their question...` : 'Draw a card to start!' }}</p>
      </div>
    </div>

    <!-- Host Controls -->
    <div v-if="isHost" class="bg-purple-500/20 rounded-lg sm:rounded-xl p-4 sm:p-5 md:p-6 border border-purple-500/30 space-y-3 sm:space-y-4">
      <h3 class="font-bold text-base sm:text-lg mb-3 sm:mb-4 flex items-center gap-2">
        <Icon icon="mdi:crown" class="w-4 h-4 sm:w-5 sm:h-5" />
        Host Controls
      </h3>

      <div class="grid grid-cols-2 gap-2 sm:gap-3 mb-3 sm:mb-4">
        <button
          @click="drawCard('TRUTH')"
          :disabled="isDrawing"
          class="bg-blue-500/20 hover:bg-blue-500/30 border-2 border-blue-500/50 rounded-lg sm:rounded-xl p-3 sm:p-4 transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Icon icon="mdi:eye" class="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 mx-auto mb-1 sm:mb-2" />
          <span class="font-bold text-xs sm:text-sm md:text-base">Truth</span>
        </button>
        <button
          @click="drawCard('DARE')"
          :disabled="isDrawing"
          class="bg-red-500/20 hover:bg-red-500/30 border-2 border-red-500/50 rounded-lg sm:rounded-xl p-3 sm:p-4 transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Icon icon="mdi:fire" class="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 mx-auto mb-1 sm:mb-2" />
          <span class="font-bold text-xs sm:text-sm md:text-base">Dare</span>
        </button>
      </div>

      <button
        @click="drawRandomCard"
        :disabled="isDrawing"
        class="w-full bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 hover:from-purple-500 hover:via-pink-500 hover:to-purple-500 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg sm:rounded-xl font-black text-sm sm:text-base shadow-xl transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <Icon icon="mdi:dice-multiple" class="w-4 h-4 sm:w-5 sm:h-5 inline mr-2" />
        {{ isDrawing ? 'Drawing...' : 'Random Card' }}
      </button>

      <button
        v-if="roomState.currentPrompt"
        @click="handleSkipQuestion"
        class="w-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg sm:rounded-xl font-black text-sm sm:text-base shadow-xl transition-all transform hover:scale-105"
      >
        <Icon icon="mdi:skip-next" class="w-4 h-4 sm:w-5 sm:h-5 inline mr-2" />
        Skip Question
      </button>
    </div>

    <!-- Player List -->
    <div class="bg-white/10 backdrop-blur-md rounded-lg sm:rounded-xl p-3 sm:p-4 border border-white/20 mt-4 sm:mt-5 md:mt-6">
      <h3 class="font-bold mb-2 sm:mb-3 text-sm sm:text-base flex items-center gap-2">
        <Icon icon="mdi:account-group" class="w-4 h-4 sm:w-5 sm:h-5" />
        Players ({{ roomState.players.length }})
        <span v-if="currentPlayer" class="text-purple-300 text-xs font-normal">— {{ currentPlayer.nickname }}'s turn</span>
      </h3>
      <div class="grid grid-cols-2 sm:grid-cols-3 gap-1.5 sm:gap-2">
        <div
          v-for="player in roomState.players"
          :key="player.socketId"
          class="bg-white/5 rounded-lg p-1.5 sm:p-2 text-center text-xs sm:text-sm transition-all"
          :class="{
            'ring-2 ring-purple-500': player.isHost,
            'ring-2 ring-pink-500 bg-pink-500/20 scale-105 shadow-lg shadow-pink-500/50': currentPlayer && player.socketId === currentPlayer.socketId,
          }"
        >
          <div class="font-semibold">{{ player.nickname }}</div>
          <div class="flex items-center justify-center gap-1 mt-1 flex-wrap">
            <span v-if="player.isHost" class="text-xs text-purple-400">👑</span>
            <span v-if="currentPlayer && player.socketId === currentPlayer.socketId" class="text-xs text-pink-400 animate-pulse font-medium">⭐ Their turn</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue'
import { Icon } from '@iconify/vue'
import { useRouter } from 'vue-router'
import { navigateTo } from '#app'
import TurnIndicator from './TurnIndicator.vue'
import WaitingForHost from './WaitingForHost.vue'

interface Props {
  roomState: any
  isHost: boolean
  multiplayer: any
}

const props = defineProps<Props>()
const router = useRouter()

// Use the multiplayer composable's isHost directly for reactivity
const isHost = computed(() => props.multiplayer.isHost.value)

const handleChangeGame = () => {
  if (!isHost.value) return
  props.multiplayer.endGame()
  // Use navigateTo for better navigation handling
  navigateTo('/lobby')
}

const handleBackToLobby = () => {
  // If host, end the game first, otherwise just navigate
  if (isHost.value) {
    props.multiplayer.endGame()
  }
  // Navigate immediately - don't wait for socket response
  navigateTo('/lobby')
}

const isSpicyMode = ref(false)
const isDrawing = ref(false)
const cardFlipped = ref(false)
const questionsLoading = ref(false)
const copied = ref(false)
const hesitationTime = ref(60) // 1 minute in seconds
const hesitationTimer = ref<number | null>(null)
const hesitationPercent = ref(100)

const copyRoomCode = async () => {
  if (!props.roomState.roomCode) return
  try {
    await navigator.clipboard.writeText(props.roomState.roomCode)
    copied.value = true
    setTimeout(() => {
      copied.value = false
    }, 2000)
  } catch (err) {
    console.error('Failed to copy:', err)
  }
}

// Question trackers (same as single-player)
let normalTruthTracker: any = null
let spicyTruthTracker: any = null
let normalDareTracker: any = null
let spicyDareTracker: any = null

// Load questions from database (same as single-player)
async function loadQuestions() {
  questionsLoading.value = true
  
  try {
    const truthResponse = await $fetch('/api/questions/truth-or-dare?type=TRUTH&limit=200')
    const dareResponse = await $fetch('/api/questions/truth-or-dare?type=DARE&limit=200')
    
    const allTruthQuestions = truthResponse.questions || []
    const allDareQuestions = dareResponse.questions || []
    
    const normalTruths = allTruthQuestions
      .filter((q: any) => {
        const intensity = q.intensity ?? 2
        return intensity <= 3
      })
      .map((q: any) => q.text || String(q))
    
    const spicyTruths = allTruthQuestions
      .filter((q: any) => {
        const intensity = q.intensity ?? 2
        return intensity >= 4
      })
      .map((q: any) => q.text || String(q))
    
    const normalDares = allDareQuestions
      .filter((q: any) => {
        const intensity = q.intensity ?? 2
        return intensity <= 3
      })
      .map((q: any) => q.text || String(q))
    
    const spicyDares = allDareQuestions
      .filter((q: any) => {
        const intensity = q.intensity ?? 2
        return intensity >= 4
      })
      .map((q: any) => q.text || String(q))
    
    // Use trackers (import from composables if available, or create simple ones)
    const { useTruthTracker, useDareTracker } = await import('~/composables/useQuestionTracker')
    
    normalTruthTracker = useTruthTracker(normalTruths.length > 0 ? normalTruths : (spicyTruths.length > 0 ? spicyTruths : []), false)
    spicyTruthTracker = useTruthTracker(spicyTruths.length > 0 ? spicyTruths : (normalTruths.length > 0 ? normalTruths : []), true)
    normalDareTracker = useDareTracker(normalDares.length > 0 ? normalDares : (spicyDares.length > 0 ? spicyDares : []), false)
    spicyDareTracker = useDareTracker(spicyDares.length > 0 ? spicyDares : (normalDares.length > 0 ? normalDares : []), true)
    
    console.log('✅ Questions loaded:', {
      normalTruths: normalTruths.length,
      spicyTruths: spicyTruths.length,
      normalDares: normalDares.length,
      spicyDares: spicyDares.length,
    })
  } catch (error) {
    console.error('Error loading questions:', error)
  } finally {
    questionsLoading.value = false
  }
}

// Get random question (same logic as single-player)
const getRandomQuestion = (type: 'TRUTH' | 'DARE') => {
  let tracker
  
  if (type === 'TRUTH') {
    tracker = isSpicyMode.value ? spicyTruthTracker : normalTruthTracker
  } else {
    tracker = isSpicyMode.value ? spicyDareTracker : normalDareTracker
  }
  
  if (!tracker) {
    return 'Questions are loading... Please try again in a moment.'
  }
  
  const result = tracker.getNextQuestion()
  return result.question
}

// Who is up now: from current card, or from server's nextUpPlayer (before host draws)
const currentPlayer = computed(() => {
  if (props.roomState.currentPrompt?.player) {
    return props.roomState.currentPrompt.player
  }
  const next = props.roomState.nextUpPlayer
  if (next) {
    return { socketId: next.socketId, nickname: next.nickname }
  }
  return null
})

// Track who just had their turn so we advance to the next player
const lastTurnPlayerId = ref<string | null>(null)

// Return the player after the given socketId in the list (round-robin), or first if not found
function getNextPlayerAfter(afterSocketId: string | null): { socketId: string; nickname: string; gender?: string } | null {
  const players = props.roomState.players
  if (!players?.length) return null
  const list = players.filter((p: any) => p.connected !== false).length ? players.filter((p: any) => p.connected !== false) : players
  if (!list.length) return null
  if (!afterSocketId) return { socketId: list[0].socketId, nickname: list[0].nickname, gender: list[0].gender }
  const idx = list.findIndex((p: any) => p.socketId === afterSocketId)
  if (idx === -1) return { socketId: list[0].socketId, nickname: list[0].nickname, gender: list[0].gender }
  const next = list[(idx + 1) % list.length]
  return { socketId: next.socketId, nickname: next.nickname, gender: next.gender }
}

// Who should do the next turn (for assigning when host draws a new card)
function getPlayerForTurn(): { socketId: string; nickname: string; gender?: string } | null {
  const players = props.roomState.players
  if (!players?.length) return null
  return getNextPlayerAfter(lastTurnPlayerId.value)
}

// Get host name
const hostName = computed(() => {
  const host = props.roomState.players.find((p: any) => p.isHost)
  return host?.nickname || 'Host'
})

// Get random target player (for Dares), excluding the given player for this turn
function getRandomTarget(forPlayer: { socketId: string } | null) {
  const players = props.roomState.players
  if (!players || players.length <= 1) return null
  const current = forPlayer || currentPlayer.value
  const otherPlayers = players.filter((p: any) => p.socketId !== current?.socketId)
  if (otherPlayers.length === 0) return null
  const randomIndex = Math.floor(Math.random() * otherPlayers.length)
  return otherPlayers[randomIndex]
}

// Draw card
const drawCard = async (type: 'TRUTH' | 'DARE') => {
  if (isDrawing.value || !props.isHost) return
  
  isDrawing.value = true
  cardFlipped.value = false
  
  const content = getRandomQuestion(type)
  const player = currentPlayer.value
    ? { socketId: currentPlayer.value.socketId, nickname: currentPlayer.value.nickname, gender: (props.roomState.players.find((p: any) => p.socketId === currentPlayer.value?.socketId) as any)?.gender }
    : getPlayerForTurn()
  
  // For Dares, optionally assign a target player (different from who does the dare)
  let target = null
  if (type === 'DARE' && props.roomState.players.length > 1) {
    target = getRandomTarget(player)
  }
  
  // Update game state with player assignment (always send who must answer/do the dare)
  props.multiplayer.nextRound({
    type: type,
    text: content,
    player: player ? {
      socketId: player.socketId,
      nickname: player.nickname,
      gender: player.gender,
    } : null,
    target: target ? {
      socketId: target.socketId,
      nickname: target.nickname,
      gender: target.gender,
    } : null,
  })
  
  // Flip card after delay
  setTimeout(() => {
    cardFlipped.value = true
    isDrawing.value = false
  }, 500)
}

// Draw random card
const drawRandomCard = async () => {
  const type = Math.random() > 0.5 ? 'TRUTH' : 'DARE'
  await drawCard(type)
}

// Complete challenge - move to next player
const completeChallenge = () => {
  if (!props.roomState.currentPrompt) return
  const current = props.roomState.currentPrompt.player
  if (current?.socketId) lastTurnPlayerId.value = current.socketId
  resetHesitationTimer()
  props.multiplayer.nextRound(null)
  cardFlipped.value = false
}

// Fail challenge - move to next player
const failChallenge = () => {
  if (!props.roomState.currentPrompt) return
  const current = props.roomState.currentPrompt.player
  if (current?.socketId) lastTurnPlayerId.value = current.socketId
  resetHesitationTimer()
  props.multiplayer.nextRound(null)
  cardFlipped.value = false
}

// Skip question
const handleSkipQuestion = () => {
  if (!props.roomState.currentPrompt || !props.isHost) return
  const current = props.roomState.currentPrompt.player
  if (current?.socketId) lastTurnPlayerId.value = current.socketId
  props.multiplayer.skipQuestion(null)
  cardFlipped.value = false
}

// Start hesitation timer
const startHesitationTimer = () => {
  clearInterval(hesitationTimer.value || undefined)
  hesitationTime.value = 60 // 1 minute
  hesitationPercent.value = 100
  hesitationTimer.value = setInterval(() => {
    hesitationTime.value--
    hesitationPercent.value = (hesitationTime.value / 60) * 100
    if (hesitationTime.value <= 0) {
      clearInterval(hesitationTimer.value || undefined)
      hesitationTimer.value = null
      // Auto-fail if time runs out
      if (props.roomState.currentPrompt) {
        failChallenge()
      }
    }
  }, 1000) as unknown as number
}

// Reset hesitation timer
const resetHesitationTimer = () => {
  clearInterval(hesitationTimer.value || undefined)
  hesitationTimer.value = null
  hesitationTime.value = 60
  hesitationPercent.value = 100
}

// Watch for prompt changes to flip card
watch(() => props.roomState.currentPrompt, (newPrompt) => {
  if (newPrompt) {
    cardFlipped.value = true
    startHesitationTimer()
  } else {
    cardFlipped.value = false
    resetHesitationTimer()
  }
})

// Cleanup on unmount
onBeforeUnmount(() => {
  resetHesitationTimer()
})

onMounted(() => {
  loadQuestions()
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
