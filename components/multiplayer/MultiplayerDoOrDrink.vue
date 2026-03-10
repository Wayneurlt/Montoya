<template>
  <div class="max-w-3xl mx-auto relative z-10 pt-4 sm:pt-6 md:pt-8">
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
    <div class="text-center mb-4 sm:mb-6">
      <h1 class="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black mb-2 sm:mb-3 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-pink-500 to-cyan-400 drop-shadow-2xl">
        🍺 Do or Drink
      </h1>
    </div>

    <!-- Turn Indicator -->
    <TurnIndicator :current-player="currentPlayer" />

    <!-- Main Game Card - Simplified -->
    <div
      v-if="currentCard && cardFlipped"
      class="relative w-full min-h-[300px] sm:min-h-[350px] mb-4 sm:mb-6"
    >
      <!-- Challenge Card - Simplified Display -->
      <div class="bg-white/10 backdrop-blur-md rounded-2xl sm:rounded-3xl p-6 sm:p-8 md:p-10 border-2 border-white/20 shadow-2xl">
        <div class="text-center">
          <!-- Intensity Badge -->
          <div class="mb-4 sm:mb-6 flex justify-center">
            <div
              class="inline-flex items-center gap-2 sm:gap-3 px-4 sm:px-6 py-2 sm:py-3 rounded-full font-black text-sm sm:text-base md:text-lg shadow-lg"
              :class="intensityClass"
            >
              <Icon
                :icon="
                  currentCard.intensity === 1
                    ? 'mdi:emoticon-happy'
                    : currentCard.intensity === 2
                    ? 'mdi:emoticon-excited'
                    : 'mdi:emoticon-devil'
                "
                class="w-5 h-5 sm:w-6 sm:h-6"
              />
              Level {{ currentCard.intensity }}
            </div>
          </div>
          
          <!-- Challenge Text -->
          <p class="text-xl sm:text-2xl md:text-3xl font-bold mb-4 sm:mb-6 px-2 sm:px-4 leading-relaxed">
            {{ currentCard.text }}
          </p>

          <!-- Target Player (if any) -->
          <div
            v-if="currentCard.target"
            class="bg-white/10 rounded-xl p-3 sm:p-4 max-w-sm mx-auto mb-4 sm:mb-6 border border-white/20"
          >
            <p class="text-sm sm:text-base font-medium flex items-center justify-center gap-2">
              <Icon icon="mdi:account-arrow-right" class="w-5 h-5 sm:w-6 sm:h-6" />
              To: {{ currentCard.target.nickname }}
            </p>
          </div>

          <!-- Penalty -->
          <div class="mt-4 sm:mt-6">
            <p class="text-base sm:text-lg md:text-xl font-black px-4 sm:px-6 py-2 sm:py-3 rounded-full inline-block" :class="intensityTextClass">
              Penalty: {{ currentCard.drinkAmount }}
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- Waiting for Card -->
    <div v-else-if="!currentCard" class="mb-4 sm:mb-6">
      <div class="bg-white/5 rounded-2xl p-8 sm:p-12 text-center border border-white/10">
        <Icon icon="mdi:cards" class="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4 text-purple-400" />
        <p class="text-lg sm:text-xl font-semibold text-white/70">
          {{ isHost ? 'Click below to draw a card' : 'Waiting for host to draw a card...' }}
        </p>
      </div>
    </div>

    <!-- Action Buttons - Simplified -->
    <div class="space-y-4 mb-4 sm:mb-6">
      <!-- Host: Draw Card Button -->
      <button
        v-if="isHost && !currentCard"
        @click="drawCard"
        :disabled="isDrawing"
        class="w-full group bg-gradient-to-r from-purple-700 to-pink-700 hover:from-purple-600 hover:to-pink-600 py-4 sm:py-5 rounded-xl sm:rounded-2xl font-black text-base sm:text-lg transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed shadow-xl hover:shadow-purple-600/50 border-2 border-purple-500/30 hover:scale-105"
      >
        <Icon
          v-if="isDrawing"
          icon="svg-spinners:3-dots-fade"
          class="w-5 h-5 sm:w-6 sm:h-6"
        />
        <Icon v-else icon="mdi:cards" class="w-5 h-5 sm:w-6 sm:h-6 group-hover:rotate-12 transition-transform" />
        {{ isDrawing ? "Drawing..." : "Draw Card" }}
      </button>
      
      <!-- Action Buttons (Host only - when card is revealed) -->
      <div v-else-if="currentCard && cardFlipped" class="space-y-3 sm:space-y-4">
        <div v-if="isHost" class="grid grid-cols-2 gap-3 sm:gap-4">
          <button
            @click="completeChallenge"
            class="group bg-gradient-to-r from-green-700 to-emerald-700 hover:from-green-600 hover:to-emerald-600 py-4 sm:py-5 rounded-xl sm:rounded-2xl font-black text-base sm:text-lg transition-all flex items-center justify-center gap-2 sm:gap-3 shadow-xl hover:shadow-green-600/50 border-2 border-green-500/30 hover:scale-105"
          >
            <Icon icon="mdi:check-bold" class="w-5 h-5 sm:w-6 sm:h-6 group-hover:scale-110 transition-transform" />
            Completed
          </button>
          <button
            @click="takeDrink"
            class="group bg-gradient-to-r from-purple-700 to-pink-700 hover:from-purple-600 hover:to-pink-600 py-4 sm:py-5 rounded-xl sm:rounded-2xl font-black text-base sm:text-lg transition-all flex items-center justify-center gap-2 sm:gap-3 shadow-xl hover:shadow-purple-600/50 border-2 border-purple-500/30 hover:scale-105"
          >
            <Icon icon="mdi:glass-cocktail" class="w-5 h-5 sm:w-6 sm:h-6 group-hover:animate-bounce" />
            Take Drink
          </button>
        </div>
        <p v-else class="text-center text-white/60 text-sm">Waiting for host to mark Completed or Take Drink</p>
        <!-- Host: Skip Question Button -->
        <button
          v-if="isHost"
          @click="handleSkipQuestion"
          class="w-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white py-3 sm:py-4 rounded-xl sm:rounded-2xl font-black text-base sm:text-lg shadow-xl transition-all transform hover:scale-105"
        >
          <Icon icon="mdi:skip-next" class="w-5 h-5 sm:w-6 sm:h-6 inline mr-2" />
          Skip Question
        </button>
      </div>
    </div>

    <!-- Hesitation Timer - Simplified -->
    <div v-if="currentCard && cardFlipped" class="mb-4 sm:mb-6 bg-white/5 rounded-lg sm:rounded-xl p-3 sm:p-4">
      <div class="flex justify-between items-center mb-2">
        <div class="flex items-center gap-2">
          <Icon icon="mdi:timer-sand" class="w-4 h-4 sm:w-5 sm:h-5 text-pink-300" />
          <span class="font-medium text-sm sm:text-base">Hesitation Timer</span>
        </div>
        <span
          class="font-bold text-lg sm:text-xl"
          :class="hesitationTime <= 5 ? 'text-red-400' : 'text-cyan-400'"
        >
          {{ hesitationTime }}s
        </span>
      </div>
      <div class="w-full h-2 bg-white/20 rounded-full overflow-hidden">
        <div
          class="h-full bg-gradient-to-r from-pink-500 to-purple-500 transition-all duration-1000 ease-linear"
          :style="{ width: hesitationPercent + '%' }"
        ></div>
      </div>
    </div>

    <!-- Waiting State -->
    <WaitingForHost
      v-if="roomState.gamePhase === 'lobby' && !isHost"
      :host-name="hostName"
      :multiplayer="props.multiplayer"
    />

    <!-- Player List with Turn Highlighting -->
    <div class="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20 mt-4 sm:mt-6">
      <h3 class="font-bold mb-3 flex items-center gap-2 text-sm sm:text-base">
        <Icon icon="mdi:account-group" class="w-4 h-4 sm:w-5 sm:h-5" />
        Players ({{ roomState.players.length }})
        <span v-if="currentPlayer" class="text-purple-300 text-xs font-normal">— {{ currentPlayer.nickname }}'s turn</span>
      </h3>
      <div class="grid grid-cols-2 sm:grid-cols-3 gap-2">
        <div
          v-for="player in roomState.players"
          :key="player.socketId"
          class="bg-white/5 rounded-lg p-2 text-center text-xs sm:text-sm transition-all"
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
import { ref, computed, onBeforeUnmount, watch, onMounted } from 'vue'
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

const handleChangeGame = () => {
  if (!props.isHost) return
  props.multiplayer.endGame()
  navigateTo('/lobby')
}

const handleBackToLobby = () => {
  // If host, end the game first, otherwise just navigate
  if (props.multiplayer.isHost.value) {
    props.multiplayer.endGame()
  }
  // Navigate immediately - don't wait for socket response
  navigateTo('/lobby')
}

// Use the multiplayer composable's isHost directly for reactivity
const isHost = computed(() => props.multiplayer.isHost.value)

// Intensity levels
const INTENSITY_LEVELS = [
  { color: "bg-gradient-to-br from-green-900 to-emerald-900", bgColor: "bg-green-500 text-white", textColor: "text-green-600" },
  { color: "bg-gradient-to-br from-yellow-900 to-orange-900", bgColor: "bg-yellow-500 text-white", textColor: "text-yellow-600" },
  { color: "bg-gradient-to-br from-red-900 to-pink-900", bgColor: "bg-red-500 text-white", textColor: "text-red-600" },
]

// Game State
const currentCard = ref<any>(null)
const cardFlipped = ref(false)
const gameHistory = ref<any[]>([])
const hesitationTime = ref(15)
const hesitationTimer = ref<any>(null)
const hesitationPercent = ref(100)
const isDrawing = ref(false)
const baseDrinkAmount = ref("1")
const gameLevel = ref(1)

// Question tracker
let challengeTracker: any = null

// Who is up: from current prompt or server's nextUpPlayer (before host draws)
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

const lastTurnPlayerId = ref<string | null>(null)

function getNextPlayerAfter(afterSocketId: string | null) {
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

function getPlayerForTurn() {
  const players = props.roomState.players
  if (!players?.length) return null
  return getNextPlayerAfter(lastTurnPlayerId.value)
}

// Get host name
const hostName = computed(() => {
  const host = props.roomState.players.find((p: any) => p.isHost)
  return host?.nickname || 'Host'
})

const copied = ref(false)

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

const cardColor = computed(() => {
  if (!currentCard.value) return "bg-gradient-to-br from-purple-900 to-black"
  return INTENSITY_LEVELS[currentCard.value.intensity - 1]?.color || "bg-gradient-to-br from-purple-900 to-black"
})

const intensityClass = computed(() => {
  if (!currentCard.value) return ""
  return INTENSITY_LEVELS[currentCard.value.intensity - 1]?.bgColor || ""
})

const intensityTextClass = computed(() => {
  if (!currentCard.value) return ""
  return INTENSITY_LEVELS[currentCard.value.intensity - 1]?.textColor || ""
})

// Load questions
async function loadQuestions() {
  try {
    const response = await $fetch('/api/questions/do-or-drink?limit=200')
    const questions = response.questions || []
    
    const { useDoOrDrinkTracker } = await import('~/composables/useQuestionTracker')
    challengeTracker = useDoOrDrinkTracker(questions.map((q: any) => q.text || String(q)), false)
  } catch (error) {
    console.error('Error loading questions:', error)
  }
}

// Get random challenge
const getRandomChallenge = () => {
  if (!challengeTracker) {
    return 'Questions are loading... Please wait.'
  }
  const result = challengeTracker.getNextQuestion()
  return result.question
}

// Generate challenge (optionally exclude the player who will do the challenge)
function generateChallenge(excludePlayer?: { socketId: string } | null) {
  const intensity = Math.min(
    Math.floor(Math.random() * 3) + 1 + Math.floor(gameLevel.value / 3),
    3
  )
  let drinkAmount

  switch (intensity) {
    case 1:
      drinkAmount = baseDrinkAmount.value === "shot" ? "1 shot" : baseDrinkAmount.value === "glass" ? "1 glass" : `${baseDrinkAmount.value} sip${baseDrinkAmount.value !== "1" ? "s" : ""}`
      break
    case 2:
      drinkAmount = Math.random() > 0.5
        ? baseDrinkAmount.value === "shot" ? "2 shots" : baseDrinkAmount.value === "glass" ? "1.5 glasses" : `${Math.min(parseInt(baseDrinkAmount.value) * 2, 4)} sips`
        : "1 shot"
      break
    case 3:
      drinkAmount = Math.random() > 0.5
        ? baseDrinkAmount.value === "shot" ? "3 shots" : baseDrinkAmount.value === "glass" ? "2 glasses" : `${Math.min(parseInt(baseDrinkAmount.value) * 3, 6)} sips`
        : "2 shots"
      break
  }

  const players = props.roomState.players
  const current = excludePlayer || currentPlayer.value
  const targets = players.filter((p: any) => p.socketId !== current?.socketId)
  const hasTarget = targets.length > 0 && Math.random() > 0.3
  const target = hasTarget ? targets[Math.floor(Math.random() * targets.length)] : null

  const challengeText = getRandomChallenge()

  return {
    text: challengeText,
    intensity,
    drinkAmount,
    target: target ? {
      socketId: target.socketId,
      nickname: target.nickname,
      gender: target.gender,
    } : null,
  }
}

const drawCard = () => {
  if (isDrawing.value || currentCard.value || !props.isHost) return

  isDrawing.value = true
  cardFlipped.value = false

  try {
    const player = getPlayerForTurn()
    const challenge = generateChallenge(player)
    currentCard.value = challenge
    
    
    // Update game state (always send who must do the challenge so all devices show same turn)
    props.multiplayer.nextRound({
      text: challenge.text,
      intensity: challenge.intensity,
      drinkAmount: challenge.drinkAmount,
      target: challenge.target,
      player: player ? {
        socketId: player.socketId,
        nickname: player.nickname,
        gender: player.gender,
      } : null,
    })

    gameHistory.value.unshift({
      text: `${player?.nickname || 'Player'} drew a level ${challenge.intensity} challenge`,
      type: "draw",
    })
  } catch (error) {
    console.error("Error generating challenge:", error)
    currentCard.value = {
      text: "Give someone a passionate kiss or take a drink",
      intensity: 1,
      drinkAmount: "1 sip",
      target: null,
    }
  } finally {
    isDrawing.value = false
  }
}

const flipCard = () => {
  // Auto-flip when card is drawn from server
  if (currentCard.value && !cardFlipped.value && !isDrawing.value) {
    cardFlipped.value = true
    startHesitationTimer()
  }
}

const startHesitationTimer = () => {
  clearInterval(hesitationTimer.value)
  hesitationTime.value = 15
  hesitationPercent.value = 100
  hesitationTimer.value = setInterval(() => {
    hesitationTime.value--
    hesitationPercent.value = (hesitationTime.value / 15) * 100
    if (hesitationTime.value <= 0) {
      clearInterval(hesitationTimer.value)
      gameHistory.value.unshift({
        text: `${currentPlayer.value?.nickname || 'Player'} hesitated! Forced to drink.`,
        type: "penalty",
      })
      nextTurn()
    }
  }, 1000)
}

const completeChallenge = () => {
  if (!currentCard.value) return
  clearInterval(hesitationTimer.value)
  gameHistory.value.unshift({
    text: `${currentPlayer.value?.nickname || 'Player'} completed: ${currentCard.value.text}`,
    type: "complete",
  })

  if (Math.random() > 0.7) {
    gameLevel.value = Math.min(gameLevel.value + 1, 5)
  }

  nextTurn()
}

const takeDrink = () => {
  if (!currentCard.value) return
  clearInterval(hesitationTimer.value)

  gameHistory.value.unshift({
    text: `${currentPlayer.value?.nickname || 'Player'} drank instead: ${currentCard.value.drinkAmount}`,
    type: "drink",
  })

  nextTurn()
}

const handleSkipQuestion = () => {
  if (!currentCard.value || !props.isHost) return
  clearInterval(hesitationTimer.value)
  const current = props.roomState.currentPrompt?.player
  if (current?.socketId) lastTurnPlayerId.value = current.socketId
  props.multiplayer.skipQuestion(null)
  currentCard.value = null
  cardFlipped.value = false
}

const nextTurn = () => {
  const current = props.roomState.currentPrompt?.player
  if (current?.socketId) lastTurnPlayerId.value = current.socketId
  currentCard.value = null
  cardFlipped.value = false
  hesitationPercent.value = 100
  hesitationTime.value = 15
  clearInterval(hesitationTimer.value)
  props.multiplayer.nextRound(null)
}

const getLogIcon = (log: any) => {
  if (typeof log === "object") {
    switch (log.type) {
      case "draw": return "mdi:cards"
      case "complete": return "mdi:check-circle"
      case "drink": return "mdi:glass-cocktail"
      case "penalty": return "mdi:alert-circle"
      default: return "mdi:information"
    }
  }
  return "mdi:information"
}

const getLogIconColor = (log: any) => {
  if (typeof log === "object") {
    switch (log.type) {
      case "draw": return "text-purple-400"
      case "complete": return "text-green-400"
      case "drink": return "text-pink-400"
      case "penalty": return "text-red-400"
      default: return "text-white/60"
    }
  }
  return "text-white/60"
}

// Watch for prompt changes
watch(() => props.roomState.currentPrompt, (newPrompt) => {
  if (newPrompt && newPrompt.text) {
    currentCard.value = {
      text: newPrompt.text,
      intensity: newPrompt.intensity || 1,
      drinkAmount: newPrompt.drinkAmount || "1 sip",
      target: newPrompt.target,
    }
    // Auto-flip card when received from server
    setTimeout(() => {
      cardFlipped.value = true
      startHesitationTimer()
    }, 300)
  } else {
    currentCard.value = null
    cardFlipped.value = false
    clearInterval(hesitationTimer.value)
  }
})

onBeforeUnmount(() => {
  clearInterval(hesitationTimer.value)
})

// Load questions on mount
import { onMounted } from 'vue'
onMounted(() => {
  loadQuestions()
})
</script>

<style scoped>
.perspective-1000 {
  perspective: 1000px;
}
.transform-style-preserve-3d {
  transform-style: preserve-3d;
}
.backface-hidden {
  backface-visibility: hidden;
}
.rotate-y-180 {
  transform: rotateY(180deg);
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
