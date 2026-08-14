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
        Most Likely <span class="text-hot">To</span>
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
      <div class="card-face p-6 sm:p-8 md:p-10">
        <div class="card-index card-index-tl"><Icon icon="mdi:thought-bubble" class="w-3.5 h-3.5" />Q</div>
        <div class="card-index card-index-br"><Icon icon="mdi:thought-bubble" class="w-3.5 h-3.5" />Q</div>
        <p class="font-display text-xl sm:text-2xl md:text-3xl font-bold text-center leading-relaxed px-2 text-paper">
          {{ roomState.currentPrompt?.text || roomState.currentPrompt }}
        </p>
      </div>

      <!-- Voting Options (if not voted yet) - Players can vote for themselves -->
      <div v-if="!hasVoted" class="card-poster p-4 sm:p-6">
        <h3 class="font-display uppercase tracking-wide text-sm text-paper/70 mb-4 text-center">Who is most likely to?</h3>
        <div class="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3">
          <button
            v-for="player in roomState.players"
            :key="player.socketId"
            @click="handleVote(player.socketId, $event)"
            :disabled="isSubmitting"
            class="bg-card border border-white/10 hover:border-hot/50 rounded-lg p-3 sm:p-4 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <div class="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-hot text-ink flex items-center justify-center font-display font-bold mx-auto mb-2">
              {{ player.nickname.charAt(0).toUpperCase() }}
            </div>
            <div class="text-xs sm:text-sm font-display uppercase tracking-wide flex items-center justify-center gap-1 truncate">
              {{ player.nickname }}
              <Icon v-if="player.isHost" icon="mdi:crown" class="w-3.5 h-3.5 text-volt flex-shrink-0" />
            </div>
          </button>
        </div>
      </div>

      <!-- Already Voted -->
      <div v-else class="bg-volt/10 border-2 border-volt/40 rounded-lg p-4 sm:p-6 text-center">
        <Icon icon="mdi:check-circle" class="w-14 h-14 sm:w-16 sm:h-16 mx-auto mb-4 text-volt" />
        <p class="text-lg sm:text-xl font-display font-bold uppercase tracking-wide">You've voted for {{ votedForPlayer?.nickname || 'someone' }}!</p>
        <p class="text-sm text-paper/60 mt-2">Waiting for others...</p>
      </div>

      <!-- Live Vote Count -->
      <div v-if="votes.length > 0" class="card-poster p-4">
        <h3 class="font-display uppercase tracking-wide text-sm text-paper/70 mb-3">Live Results</h3>
        <div class="space-y-2">
          <div
            v-for="player in roomState.players"
            :key="player.socketId"
            class="flex items-center justify-between"
          >
            <span class="font-medium">{{ player.nickname }}:</span>
            <span class="text-hot font-bold">{{ getVoteCount(player.socketId) }} votes</span>
          </div>
          <div class="mt-2 text-sm text-paper/50 text-center">
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

    <!-- Results Phase - Reveal with Animation -->
    <div v-else-if="roomState.gamePhase === 'results'" class="space-y-4 sm:space-y-6">
      <div class="card-poster p-6 sm:p-8">
        <h2 class="font-display text-xl sm:text-2xl font-bold uppercase tracking-wide mb-4 text-center">Results</h2>

        <!-- Winner Highlight -->
        <div v-if="winner" ref="winnerRef" class="bg-volt/15 border-2 border-volt/50 rounded-lg p-6 mb-4 text-center">
          <Icon icon="mdi:trophy" class="w-14 h-14 sm:w-16 sm:h-16 mx-auto mb-2 text-volt" />
          <p class="text-2xl sm:text-3xl font-display font-bold uppercase tracking-wide mb-2">{{ winner.nickname }}</p>
          <p class="text-lg sm:text-xl text-volt font-display uppercase tracking-wide">Wins with {{ winner.votes }} votes!</p>
        </div>

        <!-- All Results with Vote Distribution -->
        <div class="space-y-3">
          <div
            v-for="(player, index) in sortedPlayers"
            :key="player.socketId"
            :class="[
              'rounded-lg p-4 transition-all duration-500',
              player.socketId === winner?.socketId
                ? 'bg-volt/15 border-2 border-volt/50'
                : 'bg-white/5 border border-white/10'
            ]"
          >
            <div class="flex items-center justify-between mb-2">
              <div class="flex items-center gap-3">
                <div class="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-hot text-ink flex items-center justify-center font-display font-bold">
                  {{ player.nickname.charAt(0).toUpperCase() }}
                </div>
                <span class="font-display font-bold uppercase tracking-wide">{{ player.nickname }}</span>
                <Icon v-if="player.isHost" icon="mdi:crown" class="w-4 h-4 text-volt" />
              </div>
              <span class="text-xl sm:text-2xl font-display font-bold text-hot">{{ player.votes }} votes</span>
            </div>

            <!-- Vote Bar -->
            <div class="w-full bg-white/10 rounded-full h-2.5 sm:h-3 mb-2 overflow-hidden">
              <div
                class="h-2.5 sm:h-3 rounded-full transition-all duration-1000 ease-out"
                :class="player.socketId === winner?.socketId ? 'bg-volt' : 'bg-hot'"
                :style="{ width: (player.votes / totalVotes) * 100 + '%' }"
              ></div>
            </div>

            <!-- Who voted (if public) -->
            <div v-if="roomState.answerVisibility === 'public' && player.voters.length > 0" class="mt-2 text-sm text-paper/60">
              Voted by: {{ player.voters.map((v: any) => v.nickname || 'Player').join(', ') }}
            </div>
            <!-- Anonymous: only show vote count (already shown above) -->
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
import { ref, computed, onMounted, watch, nextTick, type DeepReadonly } from 'vue'
import { Icon } from '@iconify/vue'
import { useRouter } from 'vue-router'
import { navigateTo } from '#app'
import WaitingForHost from './WaitingForHost.vue'
import MultiplayerGameHeader from './MultiplayerGameHeader.vue'
import MultiplayerPlayerList from './MultiplayerPlayerList.vue'
import { useMultiplayer, type RoomState } from '~/composables/useMultiplayer'
import { useMultiplayerVoting } from '~/composables/useMultiplayerVoting'
import { useMultiplayerQuestions } from '~/composables/useMultiplayerQuestions'
import { staggerReveal, punchScale, celebrateBurst } from '~/composables/useGameAnimations'

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

// Note: originally a plain NuxtLink with no endGame call (unlike the other
// multiplayer games) — preserved as-is so this stays a faithful refactor.
const handleBackToLobby = () => {
  navigateTo('/lobby')
}

const isSubmitting = ref(false)

// Animation refs
const headerRowRef = ref<HTMLElement | null>(null)
const titleBlockRef = ref<HTMLElement | null>(null)
const winnerRef = ref<HTMLElement | null>(null)

// Get host name
const hostName = computed(() => {
  const host = roomState.value.players.find((p: any) => p.isHost)
  return host?.nickname || 'Host'
})

const votes = computed(() => multiplayer.votes.value || [])

// Get vote count for a player
const getVoteCount = (socketId: string) => {
  return votes.value.filter((v: any) => v.vote === socketId).length
}

// Calculate results
const sortedPlayers = computed(() => {
  return roomState.value.players.map((player: any) => {
    const playerVotes = votes.value.filter((v: any) => v.vote === player.socketId)
    return {
      ...player,
      votes: playerVotes.length,
      // Public: show who voted, Anonymous: empty array
      voters: roomState.value.answerVisibility === 'public'
        ? playerVotes.map((v: any) => ({ nickname: v.nickname, socketId: v.socketId }))
        : []
    }
  }).sort((a: any, b: any) => b.votes - a.votes)
})

const winner = computed(() => {
  const sorted = sortedPlayers.value
  return sorted.length > 0 && sorted[0].votes > 0 ? sorted[0] : null
})

const totalVotes = computed(() => {
  return Math.max(votes.value.length, 1)
})

const { hasVoted, myVote, submitVote: castVote } = useMultiplayerVoting(multiplayer)

// Find the player we voted for, derived from myVote
const votedForPlayer = computed(() => {
  if (!myVote.value) return null
  return roomState.value.players.find((p: any) => p.socketId === myVote.value) || null
})

const submitVote = async (playerSocketId: string) => {
  if (isSubmitting.value || hasVoted.value) return

  // Set submitting immediately to prevent double clicks
  isSubmitting.value = true
  hasVoted.value = true
  myVote.value = playerSocketId

  try {
    castVote(playerSocketId)
  } catch (error) {
    console.error('Error submitting vote:', error)
    // Reset on error
    hasVoted.value = false
    myVote.value = null
  } finally {
    isSubmitting.value = false
  }
}

const handleVote = (playerSocketId: string, evt: MouseEvent) => {
  punchScale(evt.currentTarget as HTMLElement)
  submitVote(playerSocketId)
}

const showResults = () => {
  if (!isHost.value) return
  multiplayer.showResults()
}

// Question tracker
let questionTracker: any = null

// Load questions from database
async function loadQuestions() {
  const response = await $fetch('/api/questions/group-game?gameType=MOST_LIKELY_TO&limit=1000')
  const questions = response.questions || []
  const questionTexts = questions.map((q: any) => q.text || String(q))

  const { useMostLikelyToTracker } = await import('~/composables/useQuestionTracker')
  questionTracker = useMostLikelyToTracker(questionTexts)
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

// Celebrate with a GSAP particle burst instead of CSS confetti emoji when a
// winner is revealed.
watch(winner, async (newWinner, oldWinner) => {
  if (newWinner && !oldWinner) {
    await nextTick()
    celebrateBurst(winnerRef.value)
  }
})

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
