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
        🤷 Most Likely To
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

      <!-- Voting Options (if not voted yet) - Players can vote for themselves -->
      <div v-if="!hasVoted" class="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
        <h3 class="font-bold mb-4 text-center">Who is most likely to?</h3>
        <div class="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <button
            v-for="player in roomState.players"
            :key="player.socketId"
            @click="submitVote(player.socketId)"
            :disabled="isSubmitting"
            class="bg-white/5 hover:bg-white/10 border-2 border-white/20 hover:border-purple-500/50 rounded-xl p-4 transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <div class="w-12 h-12 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center font-bold mx-auto mb-2">
              {{ player.nickname.charAt(0).toUpperCase() }}
            </div>
            <div class="text-sm font-semibold flex items-center justify-center gap-1">
              {{ player.nickname }}
              <span v-if="player.isHost" class="text-xs text-purple-400">👑</span>
            </div>
          </button>
        </div>
      </div>

      <!-- Already Voted -->
      <div v-else class="bg-purple-500/20 border-2 border-purple-500/50 rounded-xl p-6 text-center">
        <Icon icon="mdi:check-circle" class="w-16 h-16 mx-auto mb-4 text-green-400" />
        <p class="text-xl font-semibold">You've voted for {{ votedForPlayer?.nickname || 'someone' }}!</p>
        <p class="text-sm text-white/60 mt-2">Waiting for others...</p>
      </div>

      <!-- Live Vote Count -->
      <div v-if="votes.length > 0" class="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20">
        <h3 class="font-bold mb-3">Live Results</h3>
        <div class="space-y-2">
          <div
            v-for="player in roomState.players"
            :key="player.socketId"
            class="flex items-center justify-between"
          >
            <span class="font-semibold">{{ player.nickname }}:</span>
            <span class="text-purple-400 font-bold animate-pulse">{{ getVoteCount(player.socketId) }} votes</span>
          </div>
          <div class="mt-2 text-sm text-white/60 text-center">
            {{ votes.length }} / {{ roomState.players.length }} players voted
          </div>
        </div>
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

    <!-- Results Phase - Reveal with Animation -->
    <div v-else-if="roomState.gamePhase === 'results'" class="space-y-6">
      <div class="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
        <h2 class="text-2xl font-bold mb-4 text-center">Results</h2>
        
        <!-- Winner Highlight with Confetti Effect -->
        <div v-if="winner" class="bg-gradient-to-r from-yellow-500/30 to-orange-500/30 border-4 border-yellow-500/50 rounded-xl p-6 mb-4 text-center animate-pulse relative overflow-hidden">
          <!-- Confetti Effect -->
          <div class="absolute inset-0 overflow-hidden pointer-events-none">
            <div class="confetti confetti-1">🎉</div>
            <div class="confetti confetti-2">✨</div>
            <div class="confetti confetti-3">🎊</div>
            <div class="confetti confetti-4">🌟</div>
            <div class="confetti confetti-5">💫</div>
          </div>
          <Icon icon="mdi:trophy" class="w-16 h-16 mx-auto mb-2 text-yellow-400 relative z-10" />
          <p class="text-3xl font-black mb-2 relative z-10">{{ winner.nickname }}</p>
          <p class="text-xl text-yellow-300 relative z-10">Wins with {{ winner.votes }} votes!</p>
        </div>
        
        <!-- All Results with Vote Distribution Animation -->
        <div class="space-y-3">
          <div
            v-for="(player, index) in sortedPlayers"
            :key="player.socketId"
            :class="[
              'rounded-xl p-4 transition-all duration-500',
              player.socketId === winner?.socketId 
                ? 'bg-yellow-500/20 border-2 border-yellow-500/50 shadow-lg shadow-yellow-500/30' 
                : 'bg-white/5 border border-white/10'
            ]"
            :style="{ animationDelay: index * 100 + 'ms' }"
            class="animate-slide-up"
          >
            <div class="flex items-center justify-between mb-2">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center font-bold">
                  {{ player.nickname.charAt(0).toUpperCase() }}
                </div>
                <span class="font-bold text-lg">{{ player.nickname }}</span>
                <span v-if="player.isHost" class="text-xs text-purple-400">👑</span>
              </div>
              <span class="text-2xl font-black text-purple-400">{{ player.votes }} votes</span>
            </div>
            
            <!-- Vote Bar with Animation -->
            <div class="w-full bg-white/10 rounded-full h-3 mb-2 overflow-hidden">
              <div 
                class="bg-gradient-to-r from-purple-500 to-pink-500 h-3 rounded-full transition-all duration-1000 ease-out"
                :style="{ width: (player.votes / totalVotes) * 100 + '%' }"
              ></div>
            </div>
            
            <!-- Who voted (if public) -->
            <div v-if="roomState.answerVisibility === 'public' && player.voters.length > 0" class="mt-2 text-sm text-white/60">
              Voted by: {{ player.voters.map((v: any) => v.nickname || 'Player').join(', ') }}
            </div>
            <!-- Anonymous: only show vote count (already shown above) -->
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
      v-else
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

// Note: originally a plain NuxtLink with no endGame call (unlike the other
// multiplayer games) — preserved as-is so this stays a faithful refactor.
const handleBackToLobby = () => {
  navigateTo('/lobby')
}

const isSubmitting = ref(false)

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

onMounted(() => {
  loadInitialQuestions(loadQuestions)
})
</script>

<style scoped>
@keyframes slide-up {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
.animate-slide-up {
  animation: slide-up 0.5s ease-out forwards;
  opacity: 0;
}

@keyframes confetti-fall {
  0% {
    transform: translateY(-100vh) rotate(0deg);
    opacity: 1;
  }
  100% {
    transform: translateY(100vh) rotate(720deg);
    opacity: 0;
  }
}

.confetti {
  position: absolute;
  font-size: 1.5rem;
  animation: confetti-fall 3s linear infinite;
  pointer-events: none;
}

.confetti-1 {
  left: 10%;
  animation-delay: 0s;
}

.confetti-2 {
  left: 30%;
  animation-delay: 0.5s;
}

.confetti-3 {
  left: 50%;
  animation-delay: 1s;
}

.confetti-4 {
  left: 70%;
  animation-delay: 1.5s;
}

.confetti-5 {
  left: 90%;
  animation-delay: 2s;
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
