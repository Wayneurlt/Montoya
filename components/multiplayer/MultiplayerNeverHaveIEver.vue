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
    <div class="text-center mb-8">
      <h1 class="text-4xl sm:text-5xl md:text-6xl font-black mb-4 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-pink-500 to-cyan-400 drop-shadow-2xl">
        🙅 Never Have I Ever
      </h1>
      <p class="text-purple-200/80 text-sm font-medium">{{ roomState.answerVisibility === 'anonymous' ? 'Anonymous Mode' : 'Public Mode' }}</p>
    </div>

    <!-- Loading State -->
    <div v-if="questionsLoading" class="mb-6 bg-blue-500/20 border border-blue-400/30 rounded-xl p-4 text-center">
      <div class="flex items-center justify-center gap-3">
        <Icon icon="svg-spinners:3-dots-fade" class="w-6 h-6" />
        <span class="font-medium">Loading questions from database...</span>
      </div>
    </div>

    <!-- Playing Phase: Show Question and Voting -->
    <div v-if="roomState.gamePhase === 'playing' && roomState.currentPrompt" class="space-y-6">
      <!-- Current Question -->
      <div class="bg-white/10 backdrop-blur-md rounded-2xl p-6 sm:p-8 md:p-10 mb-6 border border-white/20 shadow-2xl">
        <div class="text-center">
          <p class="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 leading-relaxed">
            {{ roomState.currentPrompt?.text || roomState.currentPrompt }}
          </p>
        </div>
      </div>

      <!-- Voting Options (if not voted yet) - Self-voting only -->
      <div v-if="!hasVoted" class="grid grid-cols-2 gap-4 sm:gap-6">
        <button
          @click="submitVote('I Have')"
          :disabled="isSubmitting"
          class="bg-green-500/20 hover:bg-green-500/30 border-2 border-green-500/50 rounded-xl sm:rounded-2xl p-6 sm:p-8 transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Icon icon="mdi:check-circle" class="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4" />
          <span class="font-black text-lg sm:text-xl md:text-2xl">I Have</span>
        </button>
        <button
          @click="submitVote('I Have Not')"
          :disabled="isSubmitting"
          class="bg-red-500/20 hover:bg-red-500/30 border-2 border-red-500/50 rounded-xl sm:rounded-2xl p-6 sm:p-8 transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Icon icon="mdi:close-circle" class="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4" />
          <span class="font-black text-lg sm:text-xl md:text-2xl">I Have Not</span>
        </button>
      </div>

      <!-- Already Voted - Waiting for others -->
      <div v-else class="bg-purple-500/20 border-2 border-purple-500/50 rounded-xl sm:rounded-2xl p-6 sm:p-8 text-center">
        <Icon icon="mdi:check-circle" class="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4 text-green-400 animate-pulse" />
        <p class="text-xl sm:text-2xl font-semibold mb-2">You've voted!</p>
        <p class="text-sm sm:text-base text-white/70">
          Waiting for others... ({{ votes.length }} / {{ roomState.players.length }})
        </p>
      </div>

      <!-- Host: Skip Question Button -->
      <div v-if="isHost" class="bg-yellow-500/20 rounded-xl p-4 border border-yellow-500/30">
        <button
          @click="handleSkipQuestion"
          :disabled="isLoading"
          class="w-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white px-6 py-3 rounded-xl font-black shadow-xl transition-all transform hover:scale-105 disabled:opacity-50"
        >
          <Icon icon="mdi:skip-next" class="w-5 h-5 inline mr-2" />
          Skip Question
        </button>
      </div>
    </div>

    <!-- Results Phase - Auto-transitioned -->
    <div v-else-if="roomState.gamePhase === 'results'" class="space-y-6">
      <div class="bg-white/10 backdrop-blur-md rounded-2xl p-6 sm:p-8 border border-white/20">
        <h2 class="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6 text-center">Results</h2>
        
        <div class="space-y-4">
          <!-- I Have -->
          <div class="bg-green-500/20 border-2 border-green-500/50 rounded-xl p-4 sm:p-6">
            <div class="flex items-center justify-between mb-3">
              <span class="font-bold text-lg sm:text-xl">I Have</span>
              <span class="text-3xl sm:text-4xl font-black text-green-400">{{ iHaveCount }}</span>
            </div>
            <!-- Anonymous: show only totals, Public: show names -->
            <div v-if="roomState.answerVisibility === 'public' && iHaveVotes.length > 0" class="mt-3 space-y-2">
              <div
                v-for="vote in iHaveVotes"
                :key="vote.socketId || Math.random()"
                class="text-sm sm:text-base text-white/90 font-medium"
              >
                {{ vote.nickname || 'Player' }}
              </div>
            </div>
          </div>

          <!-- I Have Not -->
          <div class="bg-red-500/20 border-2 border-red-500/50 rounded-xl p-4 sm:p-6">
            <div class="flex items-center justify-between mb-3">
              <span class="font-bold text-lg sm:text-xl">I Have Not</span>
              <span class="text-3xl sm:text-4xl font-black text-red-400">{{ iHaveNotCount }}</span>
            </div>
            <!-- Anonymous: show only totals, Public: show names -->
            <div v-if="roomState.answerVisibility === 'public' && iHaveNotVotes.length > 0" class="mt-3 space-y-2">
              <div
                v-for="vote in iHaveNotVotes"
                :key="vote.socketId || Math.random()"
                class="text-sm sm:text-base text-white/90 font-medium"
              >
                {{ vote.nickname || 'Player' }}
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Host Controls for Next Round -->
      <div v-if="isHost" class="bg-purple-500/20 rounded-xl p-6 border border-purple-500/30">
        <button
          @click="getNextQuestion"
          :disabled="isLoading"
          class="w-full bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 hover:from-purple-500 hover:via-pink-500 hover:to-purple-500 text-white px-6 py-3 rounded-xl font-black shadow-xl transition-all transform hover:scale-105 disabled:opacity-50"
        >
          <Icon icon="mdi:arrow-right" class="w-5 h-5 inline mr-2" />
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
    <div v-else-if="roomState.gamePhase === 'playing' && !roomState.currentPrompt" class="space-y-6">
      <div class="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20 text-center">
        <Icon icon="mdi:thought-bubble" class="w-16 h-16 mx-auto mb-4 text-purple-400" />
        <p class="text-xl font-semibold mb-4">Game Started!</p>
        <p class="text-white/60 mb-6">Waiting for host to load the first question...</p>
        
        <!-- Host: Load First Question -->
        <div v-if="isHost" class="bg-purple-500/20 rounded-xl p-6 border border-purple-500/30">
          <button
            @click="getNextQuestion"
            :disabled="isLoading"
            class="w-full bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 hover:from-purple-500 hover:via-pink-500 hover:to-purple-500 text-white px-6 py-3 rounded-xl font-black shadow-xl transition-all transform hover:scale-105 disabled:opacity-50"
          >
            <Icon icon="mdi:arrow-right" class="w-5 h-5 inline mr-2" />
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
import { ref, computed, onMounted, type DeepReadonly } from 'vue'
import { Icon } from '@iconify/vue'
import { useRouter } from 'vue-router'
import { navigateTo } from '#app'
import WaitingForHost from './WaitingForHost.vue'
import MultiplayerGameHeader from './MultiplayerGameHeader.vue'
import MultiplayerPlayerList from './MultiplayerPlayerList.vue'
import { useMultiplayer, type RoomState } from '~/composables/useMultiplayer'
import { useMultiplayerVoting } from '~/composables/useMultiplayerVoting'
import { useMultiplayerQuestions } from '~/composables/useMultiplayerQuestions'

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

onMounted(() => {
  loadInitialQuestions(loadQuestions)
})
</script>

<style scoped>
@keyframes fade-in {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
.animate-fade-in {
  animation: fade-in 0.3s ease-out;
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
