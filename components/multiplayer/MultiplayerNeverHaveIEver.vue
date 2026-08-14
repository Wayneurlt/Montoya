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
    <div ref="titleBlockRef" class="text-center mb-6 sm:mb-8">
      <h1 class="font-display text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold uppercase mb-2 sm:mb-4 text-paper">
        Never Have I <span class="text-hot">Ever</span>
      </h1>
      <p class="text-paper/60 text-xs sm:text-sm font-medium">{{ roomState.answerVisibility === 'anonymous' ? 'Anonymous Mode' : 'Public Mode' }}</p>
    </div>

    <!-- Loading State -->
    <div v-if="questionsLoading" class="mb-4 sm:mb-6 card-poster p-4 text-center">
      <div class="flex items-center justify-center gap-3">
        <Icon icon="svg-spinners:3-dots-fade" class="w-6 h-6 text-hot" />
        <span class="font-medium">Loading questions from database...</span>
      </div>
    </div>

    <!-- Playing Phase: Show Question and Voting -->
    <div v-if="roomState.gamePhase === 'playing' && roomState.currentPrompt" class="space-y-4 sm:space-y-6">
      <!-- Current Question -->
      <div ref="questionCardRef" class="card-face p-6 sm:p-8 md:p-10">
        <div class="card-index card-index-tl">
          <Icon icon="mdi:thought-bubble" class="w-3.5 h-3.5" />Q
        </div>
        <div class="card-index card-index-br">
          <Icon icon="mdi:thought-bubble" class="w-3.5 h-3.5" />Q
        </div>
        <p class="font-display text-xl sm:text-2xl md:text-3xl font-bold text-center leading-relaxed px-2 text-paper">
          {{ roomState.currentPrompt?.text || roomState.currentPrompt }}
        </p>
      </div>

      <!-- Voting Options (if not voted yet) - Self-voting only -->
      <div v-if="!hasVoted" class="grid grid-cols-2 gap-3 sm:gap-4">
        <button
          @click="handleVote('I Have', $event)"
          :disabled="isSubmitting"
          class="mode-card is-volt disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Icon icon="mdi:check-circle" class="w-8 h-8 sm:w-10 sm:h-10" />
          <span class="mode-card-title text-base sm:text-lg">I Have</span>
          <span class="mode-card-desc">Yep, done that</span>
        </button>
        <button
          @click="handleVote('I Have Not', $event)"
          :disabled="isSubmitting"
          class="mode-card disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Icon icon="mdi:close-circle" class="w-8 h-8 sm:w-10 sm:h-10" />
          <span class="mode-card-title text-base sm:text-lg">I Have Not</span>
          <span class="mode-card-desc">Never done that</span>
        </button>
      </div>

      <!-- Already Voted - Waiting for others -->
      <div v-else class="bg-volt/10 border-2 border-volt/40 rounded-lg p-6 sm:p-8 text-center">
        <Icon icon="mdi:check-circle" class="w-14 h-14 sm:w-16 sm:h-16 mx-auto mb-4 text-volt" />
        <p class="text-lg sm:text-xl font-display font-bold uppercase tracking-wide mb-2">You've voted!</p>
        <p class="text-sm sm:text-base text-paper/60">
          Waiting for others... ({{ votes.length }} / {{ roomState.players.length }})
        </p>
      </div>

      <!-- Host: Skip Question Button -->
      <div v-if="isHost" class="card-poster p-4">
        <button
          @click="handleSkip"
          :disabled="isLoading"
          class="w-full bg-card border border-white/10 hover:border-volt/50 text-paper px-6 py-2.5 sm:py-3 rounded-lg font-display font-bold uppercase tracking-wide transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
        >
          <Icon icon="mdi:skip-next" class="w-5 h-5" />
          Skip Question
        </button>
      </div>
    </div>

    <!-- Results Phase - Auto-transitioned -->
    <div v-else-if="roomState.gamePhase === 'results'" class="space-y-4 sm:space-y-6">
      <div class="card-poster p-6 sm:p-8">
        <h2 class="font-display text-xl sm:text-2xl md:text-3xl font-bold uppercase tracking-wide mb-4 sm:mb-6 text-center">Results</h2>

        <div class="space-y-3 sm:space-y-4">
          <!-- I Have -->
          <div class="bg-volt/10 border-2 border-volt/40 rounded-lg p-4 sm:p-6">
            <div class="flex items-center justify-between mb-3">
              <span class="font-display font-bold uppercase tracking-wide text-base sm:text-lg">I Have</span>
              <span class="text-3xl sm:text-4xl font-display font-bold text-volt">{{ iHaveCount }}</span>
            </div>
            <!-- Anonymous: show only totals, Public: show names -->
            <div v-if="roomState.answerVisibility === 'public' && iHaveVotes.length > 0" class="mt-3 space-y-2">
              <div
                v-for="vote in iHaveVotes"
                :key="vote.socketId || Math.random()"
                class="text-sm sm:text-base text-paper/80 font-medium"
              >
                {{ vote.nickname || 'Player' }}
              </div>
            </div>
          </div>

          <!-- I Have Not -->
          <div class="bg-hot/10 border-2 border-hot/40 rounded-lg p-4 sm:p-6">
            <div class="flex items-center justify-between mb-3">
              <span class="font-display font-bold uppercase tracking-wide text-base sm:text-lg">I Have Not</span>
              <span class="text-3xl sm:text-4xl font-display font-bold text-hot">{{ iHaveNotCount }}</span>
            </div>
            <!-- Anonymous: show only totals, Public: show names -->
            <div v-if="roomState.answerVisibility === 'public' && iHaveNotVotes.length > 0" class="mt-3 space-y-2">
              <div
                v-for="vote in iHaveNotVotes"
                :key="vote.socketId || Math.random()"
                class="text-sm sm:text-base text-paper/80 font-medium"
              >
                {{ vote.nickname || 'Player' }}
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Host Controls for Next Round -->
      <div v-if="isHost" class="card-poster p-4 sm:p-6">
        <button
          @click="handleNext"
          :disabled="isLoading"
          class="w-full bg-hot text-ink shadow-hard hover:brightness-110 px-6 py-2.5 sm:py-3 rounded-lg font-display font-bold uppercase tracking-wide transition-[filter] disabled:opacity-50 flex items-center justify-center gap-2"
        >
          <Icon icon="mdi:arrow-right" class="w-5 h-5" />
          {{ isLoading ? 'Loading...' : 'Next Question' }}
        </button>
      </div>
      <WaitingForHost
        v-else
        :host-name="hostName"
        :multiplayer="multiplayer"
        message="Waiting for host to continue..."
      />
    </div>

    <!-- Game Started but No Question Yet -->
    <div v-else-if="roomState.gamePhase === 'playing' && !roomState.currentPrompt" class="space-y-4 sm:space-y-6">
      <div class="card-poster p-8 text-center">
        <Icon icon="mdi:thought-bubble" class="w-14 h-14 sm:w-16 sm:h-16 mx-auto mb-4 text-hot" />
        <p class="text-lg sm:text-xl font-display font-bold uppercase tracking-wide mb-2">Game Started!</p>
        <p class="text-paper/60 mb-6">Waiting for host to load the first question...</p>

        <!-- Host: Load First Question -->
        <div v-if="isHost">
          <button
            @click="handleNext"
            :disabled="isLoading"
            class="w-full bg-hot text-ink shadow-hard hover:brightness-110 px-6 py-2.5 sm:py-3 rounded-lg font-display font-bold uppercase tracking-wide transition-[filter] disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <Icon icon="mdi:arrow-right" class="w-5 h-5" />
            {{ isLoading ? 'Loading...' : 'Load First Question' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Waiting State -->
    <WaitingForHost
      v-else-if="roomState.gamePhase === 'lobby'"
      :host-name="hostName"
      :multiplayer="multiplayer"
    />

    <!-- Player List -->
    <MultiplayerPlayerList :players="roomState.players" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, nextTick, type DeepReadonly } from 'vue'
import { Icon } from '@iconify/vue'
import { useRouter } from 'vue-router'
import { navigateTo } from '#app'
import WaitingForHost from './WaitingForHost.vue'
import MultiplayerGameHeader from './MultiplayerGameHeader.vue'
import MultiplayerPlayerList from './MultiplayerPlayerList.vue'
import { useMultiplayer, type RoomState } from '~/composables/useMultiplayer'
import { useMultiplayerVoting } from '~/composables/useMultiplayerVoting'
import { useMultiplayerQuestions } from '~/composables/useMultiplayerQuestions'
import { staggerReveal, punchScale } from '~/composables/useGameAnimations'

interface Props {
  roomState: DeepReadonly<RoomState>
  isHost: boolean
  multiplayer: ReturnType<typeof useMultiplayer>
}

const props = defineProps<Props>()
const router = useRouter()

// Use the multiplayer composable directly for reactivity
const multiplayer = props.multiplayer
const roomState = computed(() => multiplayer.roomState.value)
const isHost = computed(() => multiplayer.isHost.value)

const handleChangeGame = () => {
  if (!isHost.value) return
  multiplayer.endGame()
  navigateTo('/lobby')
}

const handleBackToLobby = () => {
  // If host, end the game first, otherwise just navigate
  if (isHost.value) {
    multiplayer.endGame()
  }
  // Navigate immediately - don't wait for socket response
  navigateTo('/lobby')
}

const isSubmitting = ref(false)

// Animation refs
const headerRowRef = ref<HTMLElement | null>(null)
const titleBlockRef = ref<HTMLElement | null>(null)
const questionCardRef = ref<HTMLElement | null>(null)

const votes = computed(() => multiplayer.votes.value || [])

const iHaveVotes = computed(() => {
  return votes.value.filter((v: any) => v.vote === 'I Have')
})

const iHaveNotVotes = computed(() => {
  return votes.value.filter((v: any) => v.vote === 'I Have Not')
})

const iHaveCount = computed(() => iHaveVotes.value.length)
const iHaveNotCount = computed(() => iHaveNotVotes.value.length)

// Get host name
const hostName = computed(() => {
  const host = roomState.value.players.find((p: any) => p.isHost)
  return host?.nickname || 'Host'
})

const { hasVoted, myVote, submitVote: castVote } = useMultiplayerVoting(multiplayer)

const submitVote = async (vote: 'I Have' | 'I Have Not') => {
  if (isSubmitting.value || hasVoted.value) return

  // Set submitting immediately to prevent double clicks
  isSubmitting.value = true
  hasVoted.value = true
  myVote.value = vote

  try {
    // Submit vote - server will auto-transition to results when all players vote
    castVote(vote)
  } catch (error) {
    console.error('Error submitting vote:', error)
    // Reset on error
    hasVoted.value = false
    myVote.value = null
  } finally {
    isSubmitting.value = false
  }
}

const handleVote = (vote: 'I Have' | 'I Have Not', evt: MouseEvent) => {
  punchScale(evt.currentTarget as HTMLElement)
  submitVote(vote)
}

// Results are now auto-shown when all players vote, so this is no longer needed
// But keeping for backwards compatibility
const showResults = () => {
  if (!isHost.value) return
  multiplayer.showResults()
}

// Question tracker
let questionTracker: any = null

// Load questions from database
async function loadQuestions() {
  const response = await $fetch('/api/questions/group-game?gameType=NEVER_HAVE_I_EVER&limit=1000')
  const questions = response.questions || []
  const questionTexts = questions.map((q: any) => q.text || String(q))

  const { useNeverHaveIEverTracker } = await import('~/composables/useQuestionTracker')
  questionTracker = useNeverHaveIEverTracker(questionTexts)
  questionTracker.initializeTracker()
}

const { questionsLoading, isLoading, loadInitialQuestions, withHostLoading } = useMultiplayerQuestions(multiplayer)

const getNextQuestion = () => withHostLoading(async () => {
  if (!questionTracker) {
    await loadQuestions()
  }

  if (questionTracker) {
    const result = questionTracker.getNextQuestion()
    multiplayer.nextRound({
      text: result.question,
      intensity: 2,
    })
    return result
  }
})

const handleSkipQuestion = () => withHostLoading(async () => {
  if (!questionTracker) {
    await loadQuestions()
  }

  if (questionTracker) {
    const result = questionTracker.getNextQuestion()
    multiplayer.skipQuestion({
      text: result.question,
      intensity: 2,
    })
    return result
  }
})

const handleNext = (evt: MouseEvent) => {
  punchScale(evt.currentTarget as HTMLElement)
  getNextQuestion()
}

const handleSkip = (evt: MouseEvent) => {
  punchScale(evt.currentTarget as HTMLElement)
  handleSkipQuestion()
}

onMounted(() => {
  loadInitialQuestions(loadQuestions)
  nextTick(() => {
    staggerReveal([headerRowRef.value, titleBlockRef.value])
  })
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
