<template>
  <div class="max-w-3xl mx-auto relative z-10 pt-2 sm:pt-4 md:pt-6 lg:pt-8 pb-4 sm:pb-6">
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
    <div ref="titleBlockRef" class="text-center mb-4 sm:mb-6 md:mb-8">
      <h1 class="font-display text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold uppercase mb-2 sm:mb-3 md:mb-4 text-paper">
        Truth <span class="text-hot">or</span> Dare
      </h1>
      <p class="text-paper/60 text-xs sm:text-sm font-medium">{{ roomState.answerVisibility === 'anonymous' ? 'Anonymous Mode' : 'Public Mode' }}</p>
    </div>

    <!-- Turn Indicator - always show whose turn when playing -->
    <div v-if="roomState.gamePhase === 'playing'" class="mb-4 sm:mb-6">
      <TurnIndicator v-if="currentPlayer" :current-player="currentPlayer" />
      <div v-else class="card-poster p-4 sm:p-5 text-center">
        <p class="text-paper/60 text-sm sm:text-base">Waiting to see whose turn...</p>
      </div>
    </div>

    <!-- Intensity Mode (Host Only): two full choices, not a slim switch -->
    <div v-if="isHost" class="mb-4 sm:mb-5 md:mb-6 grid grid-cols-2 gap-3">
      <button
        @click="setSpicyMode(false, $event)"
        class="mode-card"
        :class="{ 'is-active': !isSpicyMode }"
      >
        <Icon icon="mdi:emoticon-happy-outline" class="w-6 h-6 sm:w-7 sm:h-7" />
        <span class="mode-card-title">Normal</span>
        <span class="mode-card-desc">Mild and playful questions</span>
        <Icon icon="mdi:check-circle" class="mode-card-check" />
      </button>
      <button
        @click="setSpicyMode(true, $event)"
        class="mode-card is-volt"
        :class="{ 'is-active': isSpicyMode }"
      >
        <Icon icon="mdi:fire" class="w-6 h-6 sm:w-7 sm:h-7" />
        <span class="mode-card-title">Spicy</span>
        <span class="mode-card-desc">Hot and steamy questions</span>
        <Icon icon="mdi:check-circle" class="mode-card-check" />
      </button>
    </div>

    <!-- Loading State -->
    <div v-if="questionsLoading" class="mb-4 sm:mb-6 card-poster p-4 text-center">
      <div class="flex items-center justify-center gap-3">
        <Icon icon="svg-spinners:3-dots-fade" class="w-6 h-6 text-hot" />
        <span class="font-medium">Loading questions from database...</span>
      </div>
    </div>

    <!-- Flip Stage: face-down draw choices (host) <-> revealed question card (everyone) -->
    <div ref="flipStageRef" class="flip-stage mb-4 sm:mb-6">
      <div ref="flipInnerRef" class="flip-inner">
        <!-- Host: face-down cards to draw with -->
        <div
          v-if="isHost && (!roomState.currentPrompt || !roomState.currentPrompt.text)"
          class="grid grid-cols-2 gap-4 max-w-sm mx-auto"
        >
          <button
            ref="truthButtonRef"
            @click="handleDraw('TRUTH', $event)"
            :disabled="isDrawing || questionsLoading"
            class="playing-card is-hot shadow-hard hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <div class="playing-card-pattern"></div>
            <div class="card-index card-index-tl"><Icon icon="mdi:chat-question" class="w-3.5 h-3.5" />T</div>
            <div class="card-index card-index-br"><Icon icon="mdi:chat-question" class="w-3.5 h-3.5" />T</div>
            <div v-if="isDrawing && selectedCardType === 'TRUTH'" class="absolute inset-0 flex items-center justify-center bg-black/20">
              <Icon icon="svg-spinners:3-dots-fade" class="w-8 h-8" />
            </div>
            <div v-else class="playing-card-medallion">
              <span><Icon icon="mdi:chat-question" class="w-7 h-7" /></span>
            </div>
            <span class="absolute bottom-4 inset-x-0 text-center font-display font-bold uppercase tracking-wide text-sm">Truth</span>
          </button>
          <button
            ref="dareButtonRef"
            @click="handleDraw('DARE', $event)"
            :disabled="isDrawing || questionsLoading"
            class="playing-card is-volt shadow-hard hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <div class="playing-card-pattern"></div>
            <div class="card-index card-index-tl"><Icon icon="mdi:fire" class="w-3.5 h-3.5" />D</div>
            <div class="card-index card-index-br"><Icon icon="mdi:fire" class="w-3.5 h-3.5" />D</div>
            <div v-if="isDrawing && selectedCardType === 'DARE'" class="absolute inset-0 flex items-center justify-center bg-black/20">
              <Icon icon="svg-spinners:3-dots-fade" class="w-8 h-8" />
            </div>
            <div v-else class="playing-card-medallion">
              <span><Icon icon="mdi:fire" class="w-7 h-7" /></span>
            </div>
            <span class="absolute bottom-4 inset-x-0 text-center font-display font-bold uppercase tracking-wide text-sm">Dare</span>
          </button>
        </div>

        <!-- Revealed card face: shown to every player once the host has drawn -->
        <div v-if="roomState.currentPrompt && roomState.currentPrompt.text && cardFlipped" class="max-w-md mx-auto">
          <div
            class="card-face p-6 sm:p-8 md:p-10 min-h-[240px] flex items-center justify-center"
            :class="{ 'is-volt': roomState.currentPrompt.type === 'DARE' }"
          >
            <div class="card-index card-index-tl" :class="roomState.currentPrompt.type === 'DARE' ? 'text-volt' : 'text-hot'">
              <Icon :icon="roomState.currentPrompt.type === 'TRUTH' ? 'mdi:chat-question' : 'mdi:fire'" class="w-3.5 h-3.5" />
              {{ roomState.currentPrompt.type === 'TRUTH' ? 'T' : 'D' }}
            </div>
            <div class="card-index card-index-br" :class="roomState.currentPrompt.type === 'DARE' ? 'text-volt' : 'text-hot'">
              <Icon :icon="roomState.currentPrompt.type === 'TRUTH' ? 'mdi:chat-question' : 'mdi:fire'" class="w-3.5 h-3.5" />
              {{ roomState.currentPrompt.type === 'TRUTH' ? 'T' : 'D' }}
            </div>

            <div class="text-center w-full">
              <!-- Type Badge -->
              <div class="mb-4 sm:mb-6 flex justify-center">
                <div
                  ref="typeBadgeRef"
                  class="badge-stamp px-5 sm:px-6 py-2.5 sm:py-3 text-base sm:text-lg"
                  :class="roomState.currentPrompt.type === 'TRUTH' ? 'bg-hot text-paper' : 'bg-volt text-ink'"
                >
                  <Icon :icon="roomState.currentPrompt.type === 'TRUTH' ? 'mdi:chat-question' : 'mdi:fire'" class="w-5 h-5 sm:w-6 sm:h-6" />
                  {{ roomState.currentPrompt.type === 'TRUTH' ? 'TRUTH' : 'DARE' }}
                </div>
              </div>

              <!-- Question Text -->
              <p ref="questionTextRef" class="font-display text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold mb-4 sm:mb-6 leading-relaxed px-2 text-paper">
                {{ roomState.currentPrompt.text }}
              </p>

              <!-- Target Player (for Dares) -->
              <div v-if="roomState.currentPrompt.target" class="bg-white/5 border border-white/10 rounded-md p-3 sm:p-4 max-w-sm mx-auto">
                <p class="text-sm sm:text-base font-medium flex items-center justify-center gap-2 text-paper">
                  <Icon icon="mdi:account-arrow-right" class="w-4 h-4 sm:w-5 sm:h-5 text-hot" />
                  To: {{ roomState.currentPrompt.target.nickname }}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Hesitation Timer -->
    <div v-if="roomState.currentPrompt && roomState.currentPrompt.text && cardFlipped" ref="timerBlockRef" class="card-poster p-3 sm:p-4 mb-4 sm:mb-6">
      <div class="flex justify-between items-center mb-2">
        <div class="flex items-center gap-2">
          <Icon icon="mdi:timer-sand" class="w-4 h-4 sm:w-5 sm:h-5 text-hot" />
          <span class="font-display uppercase tracking-wide text-xs sm:text-sm">Hesitation Timer</span>
        </div>
        <span
          ref="timerNumberRef"
          class="font-bold font-display text-lg sm:text-xl tabular-nums"
          :class="hesitationTime <= 10 ? 'text-hot' : 'text-volt'"
        >
          {{ Math.floor(hesitationTime / 60) }}:{{ String(Math.floor(hesitationTime % 60)).padStart(2, '0') }}
        </span>
      </div>
      <div class="w-full h-2 bg-white/10 rounded-full overflow-hidden">
        <div
          class="h-full bg-hot transition-all duration-1000 ease-linear"
          :style="{ width: hesitationPercent + '%' }"
        ></div>
      </div>
    </div>

    <!-- Action Buttons (Host only - host marks completed/failed) -->
    <StickyActionBar v-if="roomState.currentPrompt && roomState.currentPrompt.text && cardFlipped && isHost">
      <div class="grid grid-cols-2 gap-3 sm:gap-4 w-full">
        <button
          @click="handleComplete"
          class="bg-volt text-ink shadow-hard hover:brightness-110 py-3 sm:py-4 rounded-lg font-display font-bold uppercase tracking-wide text-sm sm:text-base transition-[filter] flex items-center justify-center gap-2"
        >
          <Icon icon="mdi:check-bold" class="w-5 h-5 sm:w-6 sm:h-6" />
          Completed
        </button>
        <button
          @click="handleFail"
          class="bg-hot text-paper shadow-hard hover:brightness-110 py-3 sm:py-4 rounded-lg font-display font-bold uppercase tracking-wide text-sm sm:text-base transition-[filter] flex items-center justify-center gap-2"
        >
          <Icon icon="mdi:close-thick" class="w-5 h-5 sm:w-6 sm:h-6" />
          Failed
        </button>
      </div>
    </StickyActionBar>
    <p v-else-if="roomState.currentPrompt && roomState.currentPrompt.text && cardFlipped && !isHost" class="text-center text-paper/60 text-sm mb-4">
      Waiting for host to mark as Completed or Failed
    </p>

    <!-- Waiting for Host -->
    <WaitingForHost
      v-if="roomState.gamePhase === 'playing' && (!roomState.currentPrompt || !roomState.currentPrompt.text) && !isHost"
      :host-name="hostName"
      :multiplayer="props.multiplayer"
    />
    <div v-else-if="roomState.gamePhase === 'playing' && (!roomState.currentPrompt || !roomState.currentPrompt.text) && isHost" class="card-poster p-6 sm:p-8 mb-4 sm:mb-6 text-center">
      <Icon icon="mdi:cards" class="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-4 text-hot" />
      <p class="text-base sm:text-lg font-display font-bold uppercase tracking-wide">{{ roomState.currentPrompt?.player?.nickname ? `Waiting for ${roomState.currentPrompt.player.nickname} to receive their question...` : 'Draw a card to start!' }}</p>
    </div>

    <!-- Host Controls -->
    <div v-if="isHost" class="card-poster p-4 sm:p-5 md:p-6 space-y-3 sm:space-y-4">
      <h3 class="font-display uppercase tracking-wide text-sm sm:text-base mb-1 flex items-center gap-2 text-paper/70">
        <Icon icon="mdi:crown" class="w-4 h-4 sm:w-5 sm:h-5 text-volt" />
        Host Controls
      </h3>

      <button
        @click="handleRandomDraw"
        :disabled="isDrawing"
        class="w-full bg-card border border-white/10 hover:border-hot/50 text-paper px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg font-display font-bold uppercase tracking-wide text-sm sm:text-base transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        <Icon icon="mdi:dice-multiple" class="w-4 h-4 sm:w-5 sm:h-5" />
        {{ isDrawing ? 'Drawing...' : 'Random Card' }}
      </button>

      <button
        v-if="roomState.currentPrompt"
        @click="handleSkip"
        class="w-full bg-card border border-white/10 hover:border-volt/50 text-paper px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg font-display font-bold uppercase tracking-wide text-sm sm:text-base transition-colors flex items-center justify-center gap-2"
      >
        <Icon icon="mdi:skip-next" class="w-4 h-4 sm:w-5 sm:h-5" />
        Skip Question
      </button>
    </div>

    <!-- Player List -->
    <MultiplayerPlayerList :players="roomState.players" :current-turn-socket-id="currentPlayer?.socketId" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount, watch, nextTick, type DeepReadonly } from 'vue'
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
const selectedCardType = ref<'TRUTH' | 'DARE' | ''>('')
const hesitationTime = ref(60) // 1 minute in seconds
const hesitationTimer = ref<number | null>(null)
const hesitationPercent = ref(100)

// Animation refs
const headerRowRef = ref<HTMLElement | null>(null)
const titleBlockRef = ref<HTMLElement | null>(null)
const flipStageRef = ref<HTMLElement | null>(null)
const flipInnerRef = ref<HTMLElement | null>(null)
const truthButtonRef = ref<HTMLElement | null>(null)
const dareButtonRef = ref<HTMLElement | null>(null)
const timerBlockRef = ref<HTMLElement | null>(null)
const timerNumberRef = ref<HTMLElement | null>(null)
const typeBadgeRef = ref<HTMLElement | null>(null)
const questionTextRef = ref<HTMLElement | null>(null)

const { questionsLoading, loadInitialQuestions, notifyIfRepeat } = useMultiplayerQuestions(props.multiplayer)

// Question trackers (same as single-player)
let normalTruthTracker: any = null
let spicyTruthTracker: any = null
let normalDareTracker: any = null
let spicyDareTracker: any = null

// Load questions from database (same as single-player)
async function loadQuestions() {
  const truthResponse = await $fetch('/api/questions/truth-or-dare?type=TRUTH&limit=1000')
  const dareResponse = await $fetch('/api/questions/truth-or-dare?type=DARE&limit=1000')

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

  normalTruthTracker.initializeTracker()
  spicyTruthTracker.initializeTracker()
  normalDareTracker.initializeTracker()
  spicyDareTracker.initializeTracker()

  console.log('✅ Questions loaded:', {
    normalTruths: normalTruths.length,
    spicyTruths: spicyTruths.length,
    normalDares: normalDares.length,
    spicyDares: spicyDares.length,
  })
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
  notifyIfRepeat(result)
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
  selectedCardType.value = type

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

  // The actual flip is driven by the currentPrompt watcher below once the
  // server echoes the round back — that way every client (host included)
  // flips in sync instead of the host flipping optimistically on its own.
  setTimeout(() => {
    isDrawing.value = false
  }, 500)
}

const handleDraw = (type: 'TRUTH' | 'DARE', evt: MouseEvent) => {
  punchScale(evt.currentTarget as HTMLElement)
  drawCard(type)
}

// Draw random card
const drawRandomCard = async () => {
  const type = Math.random() > 0.5 ? 'TRUTH' : 'DARE'
  await drawCard(type)
}

const handleRandomDraw = (evt: MouseEvent) => {
  punchScale(evt.currentTarget as HTMLElement)
  drawRandomCard()
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

const handleComplete = (evt: MouseEvent) => {
  celebrateBurst(evt.currentTarget as HTMLElement)
  completeChallenge()
}

const handleFail = (evt: MouseEvent) => {
  punchScale(evt.currentTarget as HTMLElement)
  failChallenge()
}

// Skip question
const handleSkipQuestion = () => {
  if (!props.roomState.currentPrompt || !props.isHost) return
  const current = props.roomState.currentPrompt.player
  if (current?.socketId) lastTurnPlayerId.value = current.socketId
  props.multiplayer.skipQuestion(null)
  cardFlipped.value = false
}

const handleSkip = (evt: MouseEvent) => {
  punchScale(evt.currentTarget as HTMLElement)
  handleSkipQuestion()
}

// Start hesitation timer
const startHesitationTimer = () => {
  clearInterval(hesitationTimer.value || undefined)
  hesitationTime.value = 60 // 1 minute
  hesitationPercent.value = 100
  hesitationTimer.value = setInterval(() => {
    hesitationTime.value--
    hesitationPercent.value = (hesitationTime.value / 60) * 100
    tickPulse(timerNumberRef.value, { scale: hesitationTime.value <= 10 ? 1.4 : 1.15 })
    if (hesitationTime.value === 10) {
      shake(timerBlockRef.value)
    }
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

const setSpicyMode = (value: boolean, evt: MouseEvent) => {
  if (isSpicyMode.value === value) return
  punchScale(evt.currentTarget as HTMLElement)
  isSpicyMode.value = value
}

// Watch for prompt changes to flip card — physically flips the shared card
// via flipTransition so every client (host included) sees the same beat,
// then plays the same badge/text reveal sequence as the single-player game.
watch(() => props.roomState.currentPrompt, (newPrompt) => {
  if (newPrompt) {
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
    flipTransition(flipInnerRef.value, () => {
      cardFlipped.value = false
    })
    resetHesitationTimer()
  }
})

// Cleanup on unmount
onBeforeUnmount(() => {
  resetHesitationTimer()
})

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
