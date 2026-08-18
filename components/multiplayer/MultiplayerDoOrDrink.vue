<template>
  <div class="max-w-3xl mx-auto relative z-10 pt-4 sm:pt-6 md:pt-8">
    <!-- Header -->
    <div ref="headerRowRef">
      <MultiplayerGameHeader
        :room-code="roomState.roomCode"
        :is-host="isHost"
        @back-to-lobby="handleBackToLobby"
        @change-game="handleChangeGame"
      />
    </div>

    <!-- Game Title -->
    <div ref="titleBlockRef" class="text-center mb-4 sm:mb-6">
      <h1 class="font-display text-3xl sm:text-4xl md:text-5xl font-bold uppercase text-paper">
        Do <span class="text-hot">or</span> Drink
      </h1>
    </div>

    <!-- Turn Indicator -->
    <TurnIndicator :current-player="currentPlayer" />

    <!-- Loading State -->
    <div v-if="questionsLoading" class="mb-4 sm:mb-6 card-poster p-4 text-center">
      <div class="flex items-center justify-center gap-3">
        <Icon icon="svg-spinners:3-dots-fade" class="w-6 h-6 text-hot" />
        <span class="font-medium">Loading questions from database...</span>
      </div>
    </div>

    <!-- Flip Stage: face-down draw card (host) <-> revealed challenge card (everyone) -->
    <div ref="flipStageRef" class="flip-stage mb-4 sm:mb-6">
      <div ref="flipInnerRef" class="flip-inner">
        <!-- Host: face-down card to draw with -->
        <div v-if="isHost && !currentCard" class="max-w-[220px] mx-auto">
          <button
            ref="drawButtonRef"
            @click="handleDraw($event)"
            :disabled="isDrawing"
            class="playing-card is-hot shadow-hard hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed w-full"
          >
            <div class="playing-card-pattern"></div>
            <div class="card-index card-index-tl"><Icon icon="mdi:cards" class="w-3.5 h-3.5" />D</div>
            <div class="card-index card-index-br"><Icon icon="mdi:cards" class="w-3.5 h-3.5" />D</div>
            <div v-if="isDrawing" class="absolute inset-0 flex items-center justify-center bg-black/20">
              <Icon icon="svg-spinners:3-dots-fade" class="w-8 h-8" />
            </div>
            <div v-else class="playing-card-medallion">
              <span><Icon icon="mdi:cards" class="w-7 h-7" /></span>
            </div>
            <span class="absolute bottom-4 inset-x-0 text-center font-display font-bold uppercase tracking-wide text-sm">Draw</span>
          </button>
        </div>

        <!-- Non-host: waiting for the host to draw -->
        <div v-else-if="!currentCard" class="card-poster p-8 sm:p-12 text-center">
          <Icon icon="mdi:cards" class="w-14 h-14 sm:w-16 sm:h-16 mx-auto mb-4 text-hot" />
          <p class="text-base sm:text-lg font-display font-bold uppercase tracking-wide text-paper/60">
            Waiting for host to draw a card...
          </p>
        </div>

        <!-- Revealed card face -->
        <div v-if="currentCard && cardFlipped" class="max-w-md mx-auto">
          <div
            class="card-face p-6 sm:p-8 md:p-10 min-h-[240px] flex items-center justify-center"
            :class="{ 'is-volt': currentCard.intensity === 1 }"
          >
            <div class="card-index card-index-tl" :class="currentCard.intensity === 1 ? 'text-volt' : 'text-hot'">
              <Icon icon="mdi:cards" class="w-3.5 h-3.5" />L{{ currentCard.intensity }}
            </div>
            <div class="card-index card-index-br" :class="currentCard.intensity === 1 ? 'text-volt' : 'text-hot'">
              <Icon icon="mdi:cards" class="w-3.5 h-3.5" />L{{ currentCard.intensity }}
            </div>

            <div class="text-center w-full">
              <!-- Intensity Badge -->
              <div class="mb-4 sm:mb-6 flex justify-center">
                <div ref="typeBadgeRef" class="badge-stamp px-5 sm:px-6 py-2.5 sm:py-3 text-sm sm:text-base" :class="intensityClass">
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
              <p ref="questionTextRef" class="font-display text-lg sm:text-xl md:text-2xl font-bold mb-4 sm:mb-6 leading-relaxed px-2 text-paper">
                {{ currentCard.text }}
              </p>

              <!-- Target Player (if any) -->
              <div v-if="currentCard.target" class="bg-white/5 border border-white/10 rounded-md p-3 sm:p-4 max-w-sm mx-auto mb-4 sm:mb-6">
                <p class="text-sm sm:text-base font-medium flex items-center justify-center gap-2 text-paper">
                  <Icon icon="mdi:account-arrow-right" class="w-4 h-4 sm:w-5 sm:h-5 text-hot" />
                  To: {{ currentCard.target.nickname }}
                </p>
              </div>

              <!-- Penalty -->
              <p class="font-display font-bold uppercase tracking-wide text-sm sm:text-base px-4 sm:px-6 py-2 rounded-full inline-block bg-white/5 border border-white/10" :class="intensityTextClass">
                Penalty: {{ currentCard.drinkAmount }}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Action Buttons -->
    <div v-if="currentCard && cardFlipped" class="mb-4 sm:mb-6">
      <StickyActionBar v-if="isHost">
        <div class="grid grid-cols-2 gap-3 sm:gap-4 w-full">
          <button
            @click="handleComplete"
            class="bg-volt text-ink shadow-hard hover:brightness-110 py-3 sm:py-4 rounded-lg font-display font-bold uppercase tracking-wide text-sm sm:text-base transition-[filter] flex items-center justify-center gap-2"
          >
            <Icon icon="mdi:check-bold" class="w-5 h-5 sm:w-6 sm:h-6" />
            Completed
          </button>
          <button
            @click="handleDrink"
            class="bg-hot text-paper shadow-hard hover:brightness-110 py-3 sm:py-4 rounded-lg font-display font-bold uppercase tracking-wide text-sm sm:text-base transition-[filter] flex items-center justify-center gap-2"
          >
            <Icon icon="mdi:glass-cocktail" class="w-5 h-5 sm:w-6 sm:h-6" />
            Take Drink
          </button>
        </div>
      </StickyActionBar>
      <p v-else class="text-center text-paper/60 text-sm">Waiting for host to mark Completed or Take Drink</p>
      <!-- Host: Skip Question Button -->
      <button
        v-if="isHost"
        @click="handleSkip"
        class="w-full bg-card border border-white/10 hover:border-volt/50 text-paper py-2.5 sm:py-3 rounded-lg font-display font-bold uppercase tracking-wide text-sm sm:text-base transition-colors flex items-center justify-center gap-2 mt-3 sm:mt-4"
      >
        <Icon icon="mdi:skip-next" class="w-4 h-4 sm:w-5 sm:h-5" />
        Skip Question
      </button>
    </div>

    <!-- Hesitation Timer -->
    <div v-if="currentCard && cardFlipped" ref="timerBlockRef" class="card-poster p-3 sm:p-4 mb-4 sm:mb-6">
      <div class="flex justify-between items-center mb-2">
        <div class="flex items-center gap-2">
          <Icon icon="mdi:timer-sand" class="w-4 h-4 sm:w-5 sm:h-5 text-hot" />
          <span class="font-display uppercase tracking-wide text-xs sm:text-sm">Hesitation Timer</span>
        </div>
        <span
          ref="timerNumberRef"
          class="font-bold font-display text-lg sm:text-xl tabular-nums"
          :class="hesitationTime <= 5 ? 'text-hot' : 'text-volt'"
        >
          {{ hesitationTime }}s
        </span>
      </div>
      <div class="w-full h-2 bg-white/10 rounded-full overflow-hidden">
        <div
          class="h-full bg-hot transition-all duration-1000 ease-linear"
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
import { ref, computed, onBeforeUnmount, watch, onMounted, nextTick, type DeepReadonly } from 'vue'
import { Icon } from '@iconify/vue'
import { useRouter } from 'vue-router'
import gsap from 'gsap'
import { navigateTo } from '#app'
import TurnIndicator from './TurnIndicator.vue'
import WaitingForHost from './WaitingForHost.vue'
import MultiplayerGameHeader from './MultiplayerGameHeader.vue'
import MultiplayerPlayerList from './MultiplayerPlayerList.vue'
import { useMultiplayer, type RoomState } from '~/composables/useMultiplayer'
import { useMultiplayerQuestions } from '~/composables/useMultiplayerQuestions'
import { staggerReveal, flipTransition, punchScale, tickPulse, shake, celebrateBurst } from '~/composables/useGameAnimations'

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

// Intensity levels: flat hot/volt badge + penalty text treatment (no gradients)
const INTENSITY_LEVELS = [
  { bgColor: "bg-volt text-ink", textColor: "text-volt" },
  { bgColor: "bg-hot text-paper", textColor: "text-hot" },
  { bgColor: "bg-hot text-paper", textColor: "text-hot" },
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

// Animation refs
const headerRowRef = ref<HTMLElement | null>(null)
const titleBlockRef = ref<HTMLElement | null>(null)
const flipStageRef = ref<HTMLElement | null>(null)
const flipInnerRef = ref<HTMLElement | null>(null)
const drawButtonRef = ref<HTMLElement | null>(null)
const timerBlockRef = ref<HTMLElement | null>(null)
const timerNumberRef = ref<HTMLElement | null>(null)
const typeBadgeRef = ref<HTMLElement | null>(null)
const questionTextRef = ref<HTMLElement | null>(null)

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

const handleDraw = (evt: MouseEvent) => {
  punchScale(evt.currentTarget as HTMLElement)
  drawCard()
}

const startHesitationTimer = () => {
  clearInterval(hesitationTimer.value)
  hesitationTime.value = 15
  hesitationPercent.value = 100
  hesitationTimer.value = setInterval(() => {
    hesitationTime.value--
    hesitationPercent.value = (hesitationTime.value / 15) * 100
    tickPulse(timerNumberRef.value, { scale: hesitationTime.value <= 5 ? 1.4 : 1.15 })
    if (hesitationTime.value === 5) {
      shake(timerBlockRef.value)
    }
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

const handleComplete = (evt: MouseEvent) => {
  celebrateBurst(evt.currentTarget as HTMLElement)
  completeChallenge()
}

const handleDrink = (evt: MouseEvent) => {
  punchScale(evt.currentTarget as HTMLElement)
  takeDrink()
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

const handleSkip = (evt: MouseEvent) => {
  punchScale(evt.currentTarget as HTMLElement)
  handleSkipQuestion()
}

const nextTurn = () => {
  const current = props.roomState.currentPrompt?.player
  if (current?.socketId) lastTurnPlayerId.value = current.socketId
  flipTransition(flipInnerRef.value, () => {
    currentCard.value = null
    cardFlipped.value = false
  })
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
      case "draw": return "text-hot"
      case "complete": return "text-volt"
      case "drink": return "text-hot"
      case "penalty": return "text-hot"
      default: return "text-paper/60"
    }
  }
  return "text-paper/60"
}

// Watch for prompt changes — flips the shared card via flipTransition so
// every client sees the same physical reveal beat, then replays the same
// badge/text pop-in sequence as the single-player game.
watch(() => props.roomState.currentPrompt, (newPrompt) => {
  if (newPrompt && newPrompt.text) {
    currentCard.value = {
      text: newPrompt.text,
      intensity: newPrompt.intensity || 1,
      drinkAmount: newPrompt.drinkAmount || "1 sip",
      target: newPrompt.target,
    }
    flipTransition(flipInnerRef.value, () => {
      cardFlipped.value = true
    }).then(async () => {
      await nextTick()
      if (typeBadgeRef.value) {
        gsap.fromTo(typeBadgeRef.value, { scale: 0.6, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.35, ease: 'back.out(2.2)' })
      }
      if (questionTextRef.value) {
        gsap.fromTo(questionTextRef.value, { y: 14, opacity: 0 }, { y: 0, opacity: 1, duration: 0.4, delay: 0.12, ease: 'power2.out' })
      }
    })
    startHesitationTimer()
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
  nextTick(() => {
    staggerReveal([headerRowRef.value, titleBlockRef.value])
  })
})
</script>

<style scoped>
.flip-stage {
  perspective: 1400px;
}
.flip-inner {
  transform-style: preserve-3d;
  will-change: transform;
  backface-visibility: hidden;
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
