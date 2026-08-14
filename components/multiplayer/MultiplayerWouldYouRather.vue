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
        Would You <span class="text-hot">Rather</span>
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
    <div v-if="roomState.gamePhase === 'playing' && roomState.currentPrompt && parsedOptions" class="space-y-4 sm:space-y-6">
      <!-- Two Options as full choice cards -->
      <div class="relative grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 mb-2">
        <!-- Option A -->
        <button
          @click="handleVote('Option A', $event)"
          :disabled="isSubmitting || hasVoted"
          :class="[
            'mode-card min-h-[180px] sm:min-h-[220px]',
            { 'is-active': myVote === 'Option A' },
            { 'opacity-50 cursor-not-allowed': hasVoted && myVote !== 'Option A' }
          ]"
        >
          <span class="mode-card-title">Option A</span>
          <p class="text-sm sm:text-base font-medium text-center leading-relaxed">
            {{ parsedOptions.optionA }}
          </p>
          <Icon icon="mdi:check-circle" class="mode-card-check" />
        </button>

        <!-- VS Badge -->
        <div class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-20 hidden md:block">
          <div class="bg-ink border-2 border-white/20 px-4 py-2 rounded-full shadow-hard-sm">
            <span class="font-display font-bold uppercase text-sm text-paper/70">VS</span>
          </div>
        </div>

        <!-- Option B -->
        <button
          @click="handleVote('Option B', $event)"
          :disabled="isSubmitting || hasVoted"
          :class="[
            'mode-card is-volt min-h-[180px] sm:min-h-[220px]',
            { 'is-active': myVote === 'Option B' },
            { 'opacity-50 cursor-not-allowed': hasVoted && myVote !== 'Option B' }
          ]"
        >
          <span class="mode-card-title">Option B</span>
          <p class="text-sm sm:text-base font-medium text-center leading-relaxed">
            {{ parsedOptions.optionB }}
          </p>
          <Icon icon="mdi:check-circle" class="mode-card-check" />
        </button>
      </div>

      <!-- Already Voted -->
      <div v-if="hasVoted" class="bg-volt/10 border-2 border-volt/40 rounded-lg p-4 sm:p-6 text-center">
        <Icon icon="mdi:check-circle" class="w-12 h-12 sm:w-14 sm:h-14 mx-auto mb-3 text-volt" />
        <p class="text-lg sm:text-xl font-display font-bold uppercase tracking-wide">You've voted! Waiting for others...</p>
      </div>

      <!-- Live Vote Count - Real-time Animation -->
      <div v-if="votes.length > 0" class="card-poster p-4">
        <h3 class="font-display uppercase tracking-wide text-sm text-paper/70 mb-3">Live Results</h3>
        <div class="space-y-3">
          <!-- Option A -->
          <div>
            <div class="flex items-center justify-between mb-2">
              <span class="font-medium">Option A:</span>
              <span class="text-hot font-bold">{{ optionACount }} votes ({{ optionAPercentage }}%)</span>
            </div>
            <div class="w-full bg-white/10 rounded-full h-3 sm:h-4 overflow-hidden">
              <div
                class="bg-hot h-3 sm:h-4 rounded-full transition-all duration-500 ease-out"
                :style="{ width: optionAPercentage + '%' }"
              ></div>
            </div>
            <!-- Public: Show who picked -->
            <div v-if="roomState.answerVisibility === 'public' && optionAVotes.length > 0" class="mt-2 space-y-1">
              <div
                v-for="vote in optionAVotes"
                :key="vote.socketId || Math.random()"
                class="text-sm text-paper/70"
              >
                {{ vote.nickname || 'Player' }}
              </div>
            </div>
          </div>

          <!-- Option B -->
          <div>
            <div class="flex items-center justify-between mb-2">
              <span class="font-medium">Option B:</span>
              <span class="text-volt font-bold">{{ optionBCount }} votes ({{ optionBPercentage }}%)</span>
            </div>
            <div class="w-full bg-white/10 rounded-full h-3 sm:h-4 overflow-hidden">
              <div
                class="bg-volt h-3 sm:h-4 rounded-full transition-all duration-500 ease-out"
                :style="{ width: optionBPercentage + '%' }"
              ></div>
            </div>
            <!-- Public: Show who picked -->
            <div v-if="roomState.answerVisibility === 'public' && optionBVotes.length > 0" class="mt-2 space-y-1">
              <div
                v-for="vote in optionBVotes"
                :key="vote.socketId || Math.random()"
                class="text-sm text-paper/70"
              >
                {{ vote.nickname || 'Player' }}
              </div>
            </div>
          </div>

          <div class="text-sm text-paper/50 text-center">
            {{ votes.length }} / {{ roomState.players.length }} players voted
          </div>
        </div>
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

    <!-- Results Phase -->
    <div v-else-if="roomState.gamePhase === 'results'" class="space-y-4 sm:space-y-6">
      <div class="card-poster p-6 sm:p-8">
        <h2 class="font-display text-xl sm:text-2xl font-bold uppercase tracking-wide mb-4 text-center">Results</h2>

        <div class="space-y-3 sm:space-y-4">
          <!-- Option A -->
          <div class="bg-hot/10 border-2 border-hot/40 rounded-lg p-4">
            <div class="flex items-center justify-between mb-2">
              <span class="font-display font-bold uppercase tracking-wide">Option A</span>
              <span class="text-2xl font-display font-bold text-hot">{{ optionACount }} ({{ optionAPercentage }}%)</span>
            </div>
            <div class="w-full bg-white/10 rounded-full h-3 sm:h-4 mb-2">
              <div class="bg-hot h-3 sm:h-4 rounded-full" :style="{ width: optionAPercentage + '%' }"></div>
            </div>
            <!-- Public: Show who picked -->
            <div v-if="roomState.answerVisibility === 'public' && optionAVotes.length > 0" class="mt-2 space-y-1">
              <div
                v-for="vote in optionAVotes"
                :key="vote.socketId || Math.random()"
                class="text-sm text-paper/70"
              >
                {{ vote.nickname || 'Player' }}
              </div>
            </div>
          </div>

          <!-- Option B -->
          <div class="bg-volt/10 border-2 border-volt/40 rounded-lg p-4">
            <div class="flex items-center justify-between mb-2">
              <span class="font-display font-bold uppercase tracking-wide">Option B</span>
              <span class="text-2xl font-display font-bold text-volt">{{ optionBCount }} ({{ optionBPercentage }}%)</span>
            </div>
            <div class="w-full bg-white/10 rounded-full h-3 sm:h-4 mb-2">
              <div class="bg-volt h-3 sm:h-4 rounded-full" :style="{ width: optionBPercentage + '%' }"></div>
            </div>
            <!-- Public: Show who picked -->
            <div v-if="roomState.answerVisibility === 'public' && optionBVotes.length > 0" class="mt-2 space-y-1">
              <div
                v-for="vote in optionBVotes"
                :key="vote.socketId || Math.random()"
                class="text-sm text-paper/70"
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
      v-else
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

// Get host name
const hostName = computed(() => {
  const host = roomState.value.players.find((p: any) => p.isHost)
  return host?.nickname || 'Host'
})

const votes = computed(() => multiplayer.votes.value || [])

const parsedOptions = computed(() => {
  const prompt = roomState.value.currentPrompt
  if (!prompt) return null

  const text = prompt.text || prompt
  // Parse "Would you rather X or Y?" format
  const match = text.match(/Would you rather (.+?) or (.+?)\??$/i)
  if (match) {
    return {
      optionA: match[1].trim(),
      optionB: match[2].trim()
    }
  }

  // Fallback: split by " or "
  const parts = text.split(' or ')
  if (parts.length === 2) {
    return {
      optionA: parts[0].replace(/Would you rather /i, '').trim(),
      optionB: parts[1].trim()
    }
  }

  return null
})

const optionAVotes = computed(() => {
  return votes.value.filter((v: any) => v.vote === 'Option A')
})

const optionBVotes = computed(() => {
  return votes.value.filter((v: any) => v.vote === 'Option B')
})

const optionACount = computed(() => optionAVotes.value.length)
const optionBCount = computed(() => optionBVotes.value.length)

const totalVotes = computed(() => Math.max(votes.value.length, 1))
const optionAPercentage = computed(() => Math.round((optionACount.value / totalVotes.value) * 100))
const optionBPercentage = computed(() => Math.round((optionBCount.value / totalVotes.value) * 100))

const { hasVoted, myVote, submitVote: castVote } = useMultiplayerVoting(multiplayer)

const submitVote = async (vote: 'Option A' | 'Option B') => {
  if (isSubmitting.value || hasVoted.value) return

  // Set submitting immediately to prevent double clicks
  isSubmitting.value = true
  hasVoted.value = true
  myVote.value = vote

  try {
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

const handleVote = (vote: 'Option A' | 'Option B', evt: MouseEvent) => {
  punchScale(evt.currentTarget as HTMLElement)
  submitVote(vote)
}

const showResults = () => {
  if (!isHost.value) return
  multiplayer.showResults()
}

// Question tracker
let questionTracker: any = null

// Load questions from database
async function loadQuestions() {
  const response = await $fetch('/api/questions/group-game?gameType=WOULD_YOU_RATHER&limit=1000')
  const questions = response.questions || []
  const questionTexts = questions.map((q: any) => q.text || String(q))

  const { useWouldYouRatherTracker } = await import('~/composables/useQuestionTracker')
  questionTracker = useWouldYouRatherTracker(questionTexts)
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
