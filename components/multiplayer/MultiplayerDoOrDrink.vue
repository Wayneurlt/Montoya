<template>
  <div class="max-w-3xl mx-auto relative z-10 pt-4 sm:pt-6 md:pt-8">
    <!-- Header -->
    <div class="flex justify-between items-center mb-6">
      <NuxtLink to="/lobby" class="bg-white/10 hover:bg-white/20 backdrop-blur-md px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg transition-all flex items-center gap-2 border border-white/20 hover:scale-105">
        <Icon icon="mdi:arrow-left" class="w-5 h-5" />
        <span class="font-medium">Back to Lobby</span>
      </NuxtLink>
      <div class="text-center">
        <div class="text-xs text-white/60 mb-1">Room Code</div>
        <div class="text-2xl sm:text-3xl font-black bg-gradient-to-r from-purple-400 via-pink-500 to-cyan-400 bg-clip-text text-transparent">
          {{ roomState.roomCode }}
        </div>
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
    <div class="text-center mb-8">
      <h1 class="text-4xl sm:text-5xl md:text-6xl font-black mb-4 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-pink-500 to-cyan-400 drop-shadow-2xl">
        🍺 Do or Drink
      </h1>
      <p class="text-purple-200/80 text-sm font-medium">Host controls the game flow</p>
    </div>

    <!-- Current Player Display -->
    <div v-if="currentPlayer" class="bg-white/5 rounded-xl p-4 mb-6 border border-white/10">
      <div class="text-center">
        <div class="text-sm text-white/60 mb-1">Current Turn</div>
        <div class="text-xl font-bold flex items-center justify-center gap-2">
          <span>{{ currentPlayer.nickname }}</span>
          <span v-if="currentPlayer.gender" class="text-2xl">{{ currentPlayer.gender === 'male' ? '♂' : currentPlayer.gender === 'female' ? '♀' : '⚧' }}</span>
        </div>
      </div>
    </div>

    <!-- Main Game Card -->
    <div
      class="relative w-full h-80 mb-8 cursor-pointer perspective-1000 group"
      @click="flipCard"
    >
      <div
        class="relative w-full h-full transition-transform duration-700 transform-style-preserve-3d"
        :class="{ 'rotate-y-180': cardFlipped }"
      >
        <!-- Front of Card -->
        <div
          class="absolute w-full h-full backface-hidden rounded-3xl flex flex-col justify-center items-center p-8 shadow-2xl border-4 border-purple-600/40 group-hover:scale-105 transition-all"
          :class="cardColor"
        >
          <div class="absolute inset-0 bg-gradient-to-br from-purple-500/20 to-transparent rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          
          <div class="text-center relative z-10">
            <p class="text-4xl font-black mb-4 drop-shadow-lg">Do or Drink</p>
            <p v-if="!currentCard" class="text-xl opacity-90 font-semibold">
              Click to draw a card
            </p>
            <p v-else-if="!cardFlipped" class="text-xl opacity-90 font-bold">
              Click to reveal challenge
            </p>
            <p v-else class="text-xl opacity-90 font-bold">
              Level {{ currentCard?.intensity }} Challenge
              <span class="inline-block text-lg mt-2 px-4 py-2 bg-white/20 rounded-full">
                Penalty: {{ currentCard?.drinkAmount }}
              </span>
            </p>
            <div class="mt-8 text-7xl animate-pulse">
              <Icon
                v-if="currentCard?.intensity === 1"
                icon="mdi:emoticon-happy"
                class="drop-shadow-lg"
              />
              <Icon
                v-else-if="currentCard?.intensity === 2"
                icon="mdi:emoticon-excited"
                class="drop-shadow-lg"
              />
              <Icon
                v-else-if="currentCard?.intensity === 3"
                icon="mdi:emoticon-devil"
                class="drop-shadow-lg"
              />
              <Icon v-else icon="mdi:cards" class="drop-shadow-lg" />
            </div>
          </div>
        </div>

        <!-- Back of Card -->
        <div
          class="absolute w-full h-full backface-hidden bg-white text-gray-900 rounded-3xl flex flex-col justify-center items-center p-8 shadow-2xl rotate-y-180 border-4 border-white/40"
        >
          <div v-if="currentCard" class="text-center w-full">
            <span
              class="font-black text-xl px-5 py-2 rounded-full mb-6 inline-flex items-center gap-2 shadow-lg"
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
                class="w-6 h-6"
              />
              Level {{ currentCard.intensity }}
            </span>
            <p class="text-2xl font-bold mb-6 px-4 leading-relaxed">
              {{ currentCard.text }}
            </p>

            <div
              v-if="currentCard.target"
              class="bg-gray-100 rounded-xl p-4 w-full max-w-sm mx-auto mb-4 border-2 border-gray-200"
            >
              <p
                class="text-base font-bold text-gray-700 flex items-center justify-center gap-2"
              >
                <Icon icon="mdi:account-arrow-right" class="w-6 h-6" />
                <span>
                  To: {{ currentCard.target.nickname }}
                  <span v-if="currentCard.target.gender" class="text-xl">{{
                    currentCard.target.gender === "male" ? "♂" : "♀"
                  }}</span>
                </span>
              </p>
            </div>

            <p class="mt-5 font-black text-2xl px-6 py-3 rounded-full inline-block" :class="intensityTextClass">
              Penalty: {{ currentCard.drinkAmount }}
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- Action Buttons -->
    <div class="grid grid-cols-1 gap-4 mb-6">
      <button
        v-if="isHost && !currentCard"
        @click="drawCard"
        :disabled="isDrawing"
        class="group bg-gradient-to-r from-purple-700 to-pink-700 hover:from-purple-600 hover:to-pink-600 py-5 rounded-2xl font-black text-lg transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed shadow-xl hover:shadow-purple-600/50 border-2 border-purple-500/30 hover:scale-105"
      >
        <Icon
          v-if="isDrawing"
          icon="svg-spinners:3-dots-fade"
          class="w-6 h-6"
        />
        <Icon v-else icon="mdi:cards" class="w-6 h-6 group-hover:rotate-12 transition-transform" />
        {{ isDrawing ? "Drawing..." : "Draw Card" }}
      </button>
      <div v-else-if="currentCard && !cardFlipped" class="text-center">
        <p class="text-sm text-white/70 mb-2">Card drawn! Click the card above to reveal the challenge</p>
      </div>
      <div v-else-if="currentCard && cardFlipped" class="grid grid-cols-2 gap-4">
        <button
          @click="completeChallenge"
          class="group bg-gradient-to-r from-green-700 to-emerald-700 hover:from-green-600 hover:to-emerald-600 py-4 rounded-2xl font-black text-lg transition-all flex items-center justify-center gap-3 shadow-xl hover:shadow-green-600/50 border-2 border-green-500/30 hover:scale-105"
        >
          <Icon icon="mdi:check-bold" class="w-6 h-6 group-hover:scale-110 transition-transform" />
          Completed
        </button>
        <button
          @click="takeDrink"
          class="group bg-gradient-to-r from-purple-700 to-pink-700 hover:from-purple-600 hover:to-pink-600 py-4 rounded-2xl font-black text-lg transition-all flex items-center justify-center gap-3 shadow-xl hover:shadow-purple-600/50 border-2 border-purple-500/30 hover:scale-105"
        >
          <Icon icon="mdi:glass-cocktail" class="w-6 h-6 group-hover:animate-bounce" />
          Take Drink
        </button>
      </div>
    </div>

    <!-- Hesitation Timer -->
    <div v-if="currentCard && cardFlipped" class="mb-6 bg-white/5 rounded-xl p-4">
      <div class="flex justify-between items-center mb-2">
        <div class="flex items-center gap-2">
          <Icon icon="mdi:timer-sand" class="w-5 h-5 text-pink-300" />
          <span class="font-medium">Hesitation Timer:</span>
        </div>
        <span
          class="font-bold"
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

    <!-- Game Log -->
    <div class="bg-white/5 rounded-xl p-4 max-h-40 overflow-y-auto mb-6">
      <h3 class="font-semibold mb-3 flex items-center gap-2">
        <Icon icon="mdi:history" class="w-5 h-5" />
        <span>Game Log</span>
      </h3>
      <ul class="space-y-2 text-sm">
        <li
          v-for="(log, index) in gameHistory"
          :key="index"
          class="py-1.5 px-2 rounded-lg"
          :class="index % 2 === 0 ? 'bg-white/5' : ''"
        >
          <div class="flex items-start gap-2">
            <Icon
              :icon="getLogIcon(log)"
              class="w-4 h-4 mt-0.5 flex-shrink-0"
              :class="getLogIconColor(log)"
            />
            <span>{{ log.text || log }}</span>
          </div>
        </li>
      </ul>
    </div>

    <!-- Player List -->
    <div class="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20">
      <h3 class="font-bold mb-3 flex items-center gap-2">
        <Icon icon="mdi:account-group" class="w-5 h-5" />
        Players ({{ roomState.players.length }})
      </h3>
      <div class="grid grid-cols-2 sm:grid-cols-3 gap-2">
        <div
          v-for="player in roomState.players"
          :key="player.socketId"
          class="bg-white/5 rounded-lg p-2 text-center text-sm"
          :class="{ 'ring-2 ring-purple-500': player.isHost }"
        >
          {{ player.nickname }}
          <span v-if="player.gender" class="text-xs">{{ player.gender === 'male' ? '♂' : player.gender === 'female' ? '♀' : '⚧' }}</span>
          <span v-if="player.isHost" class="text-xs text-purple-400">👑</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onBeforeUnmount, watch } from 'vue'
import { Icon } from '@iconify/vue'
import { useRouter } from 'vue-router'

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
  router.push('/lobby')
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

// Get current player
const currentPlayer = computed(() => {
  if (props.roomState.currentPrompt?.player) {
    return props.roomState.currentPrompt.player
  }
  if (!props.roomState.players || props.roomState.players.length === 0) return null
  const players = props.roomState.players
  const randomIndex = Math.floor(Math.random() * players.length)
  return players[randomIndex]
})

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

// Generate challenge
const generateChallenge = () => {
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
  const current = currentPlayer.value
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
    const challenge = generateChallenge()
    currentCard.value = challenge
    
    const player = currentPlayer.value
    
    // Update game state
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
  if (!currentCard.value && !isDrawing.value && props.isHost) {
    drawCard()
    return
  }
  
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

const nextTurn = () => {
  currentCard.value = null
  cardFlipped.value = false
  hesitationPercent.value = 100
  hesitationTime.value = 15
  clearInterval(hesitationTimer.value)
  
  // Clear prompt to move to next turn
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
    if (newPrompt.player) {
      // Card is already drawn, just flip it
      setTimeout(() => {
        cardFlipped.value = true
        startHesitationTimer()
      }, 300)
    }
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
</style>
