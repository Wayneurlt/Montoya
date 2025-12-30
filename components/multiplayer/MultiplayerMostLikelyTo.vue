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
    <div class="text-center mb-8">
      <h1 class="text-4xl sm:text-5xl md:text-6xl font-black mb-4 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-pink-500 to-cyan-400 drop-shadow-2xl">
        🤷 Most Likely To
      </h1>
      <p class="text-purple-200/80 text-sm font-medium">{{ roomState.answerVisibility === 'anonymous' ? 'Anonymous Mode' : 'Public Mode' }}</p>
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

      <!-- Voting Options (if not voted yet) - Players cannot vote for themselves -->
      <div v-if="!hasVoted" class="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
        <h3 class="font-bold mb-4 text-center">Who is most likely to?</h3>
        <div class="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <button
            v-for="player in otherPlayers"
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

      <!-- Host: Show Results Button -->
      <div v-if="isHost && votes.length > 0" class="bg-purple-500/20 rounded-xl p-4 border border-purple-500/30">
        <button
          @click="showResults"
          class="w-full bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 hover:from-purple-500 hover:via-pink-500 hover:to-purple-500 text-white px-6 py-3 rounded-xl font-black shadow-xl transition-all transform hover:scale-105"
        >
          <Icon icon="mdi:chart-bar" class="w-5 h-5 inline mr-2" />
          Show Results
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
    <div v-else class="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20 text-center">
      <div class="animate-pulse">
        <Icon icon="mdi:clock-outline" class="w-16 h-16 mx-auto mb-4 text-purple-400" />
        <p class="text-xl font-semibold">Waiting for host to start...</p>
      </div>
    </div>

    <!-- Player List -->
    <div class="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20 mt-6">
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
          <span v-if="player.isHost" class="text-xs text-purple-400">👑</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { Icon } from '@iconify/vue'
import { useRouter } from 'vue-router'
import { navigateTo } from '#app'

interface Props {
  roomState: any
  isHost: boolean
  multiplayer: any
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

const isLoading = ref(false)
const isSubmitting = ref(false)
const hasVoted = ref(false)
const myVote = ref<string | null>(null)
const votedForPlayer = ref<any>(null)
const copied = ref(false)

const copyRoomCode = async () => {
  if (!roomState.value.roomCode) return
  try {
    await navigator.clipboard.writeText(roomState.value.roomCode)
    copied.value = true
    setTimeout(() => {
      copied.value = false
    }, 2000)
  } catch (err) {
    console.error('Failed to copy:', err)
  }
}

const votes = computed(() => multiplayer.votes.value || [])

// Get other players (exclude self) - Players cannot vote for themselves
const otherPlayers = computed(() => {
  const myPlayer = multiplayer.myPlayer.value
  if (!myPlayer) return roomState.value.players
  
  return roomState.value.players.filter((p: any) => p.socketId !== myPlayer.socketId)
})

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

// Watch for vote updates
watch(() => [multiplayer.votes.value, multiplayer.myPlayer.value], ([newVotes, myPlayer]) => {
  if (myPlayer && newVotes) {
    const myVoteData = newVotes.find((v: any) => v.socketId === myPlayer.socketId)
    if (myVoteData) {
      hasVoted.value = true
      myVote.value = myVoteData.vote
      // Find the player we voted for
      votedForPlayer.value = roomState.value.players.find((p: any) => p.socketId === myVoteData.vote)
    } else {
      hasVoted.value = false
      myVote.value = null
      votedForPlayer.value = null
    }
  }
}, { immediate: true })

// Reset vote status when new question starts
watch(() => roomState.value.currentPrompt, () => {
  hasVoted.value = false
  myVote.value = null
  votedForPlayer.value = null
})

const submitVote = async (playerSocketId: string) => {
  if (isSubmitting.value || hasVoted.value) return
  isSubmitting.value = true

  try {
    multiplayer.submitVote(playerSocketId)
    hasVoted.value = true
    myVote.value = playerSocketId
    votedForPlayer.value = roomState.value.players.find((p: any) => p.socketId === playerSocketId)
  } catch (error) {
    console.error('Error submitting vote:', error)
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
  try {
    const response = await $fetch('/api/questions/group-game?gameType=MOST_LIKELY_TO&limit=200')
    const questions = response.questions || []
    const questionTexts = questions.map((q: any) => q.text || String(q))
    
    const { useMostLikelyToTracker } = await import('~/composables/useQuestionTracker')
    questionTracker = useMostLikelyToTracker(questionTexts)
  } catch (error) {
    console.error('Error loading questions:', error)
  }
}

const getNextQuestion = async () => {
  if (isLoading.value || !isHost.value) return
  isLoading.value = true

  try {
    if (!questionTracker) {
      await loadQuestions()
    }
    
    if (questionTracker) {
      const result = questionTracker.getNextQuestion()
      multiplayer.nextRound({
        text: result.question,
        intensity: 2,
      })
    }
  } catch (error) {
    console.error('Error fetching question:', error)
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  loadQuestions()
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
