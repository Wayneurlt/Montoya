<template>
  <div class="max-w-3xl mx-auto relative z-10 pt-4 sm:pt-6 md:pt-8">
    <!-- Header -->
    <MultiplayerGameHeader
      :room-code="roomState.roomCode"
      :is-host="isHost"
      @back-to-lobby="handleBackToLobby"
      @change-game="handleChangeGame"
    />

    <!-- Game Title -->
    <div class="text-center mb-4 sm:mb-6">
      <h1 class="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black mb-2 sm:mb-3 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-pink-500 to-cyan-400 drop-shadow-2xl">
        🍺 Do or Drink
      </h1>
    </div>

    <!-- Turn Indicator -->
    <TurnIndicator :current-player="currentPlayer" />

    <!-- Loading State -->
    <div v-if="questionsLoading" class="mb-4 sm:mb-6 bg-blue-500/20 border border-blue-400/30 rounded-xl p-4 text-center">
      <div class="flex items-center justify-center gap-3">
        <Icon icon="svg-spinners:3-dots-fade" class="w-6 h-6" />
        <span class="font-medium">Loading questions from database...</span>
      </div>
    </div>

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
    <MultiplayerPlayerList :players="roomState.players" :current-turn-socket-id="currentPlayer?.socketId" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onBeforeUnmount, watch, onMounted, type DeepReadonly } from 'vue'
import { Icon } from '@iconify/vue'
import { useRouter } from 'vue-router'
import { navigateTo } from '#app'
import TurnIndicator from './TurnIndicator.vue'
import WaitingForHost from './WaitingForHost.vue'
import MultiplayerGameHeader from './MultiplayerGameHeader.vue'
import MultiplayerPlayerList from './MultiplayerPlayerList.vue'
import { useMultiplayer, type RoomState } from '~/composables/useMultiplayer'
import { useMultiplayerQuestions } from '~/composables/useMultiplayerQuestions'

interface Props {
  roomState: DeepReadonly<RoomState>
  isHost: boolean
  multiplayer: ReturnType<typeof useMultiplayer>
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

const { questionsLoading, loadInitialQuestions, notifyIfRepeat } = useMultiplayerQuestions(props.multiplayer)

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
  const response = await $fetch('/api/questions/do-or-drink?limit=1000')
  const questions = response.questions || []

  const { useDoOrDrinkTracker } = await import('~/composables/useQuestionTracker')
  challengeTracker = useDoOrDrinkTracker(questions.map((q: any) => q.text || String(q)))
  challengeTracker.initializeTracker()
}

// Get random challenge
const getRandomChallenge = () => {
  if (!challengeTracker) {
    return 'Questions are loading... Please wait.'
  }
  const result = challengeTracker.getNextQuestion()
  notifyIfRepeat(result)
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
onMounted(() => {
  loadInitialQuestions(loadQuestions)
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
