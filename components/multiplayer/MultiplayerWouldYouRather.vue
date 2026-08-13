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
        🤔 Would You Rather
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
    <div v-if="roomState.gamePhase === 'playing' && roomState.currentPrompt && parsedOptions" class="space-y-6">
      <!-- Two Options as Tappable Cards -->
      <div class="relative grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <!-- Option A -->
        <button
          @click="submitVote('Option A')"
          :disabled="isSubmitting || hasVoted"
          :class="[
            'group cursor-pointer bg-gradient-to-br from-red-800/30 to-red-950/20 hover:from-red-800/40 hover:to-red-950/30 backdrop-blur-md rounded-2xl p-8 border-2 border-red-600/40 hover:border-red-500/70 transition-all duration-300 transform hover:scale-105 min-h-[250px] flex flex-col justify-center relative',
            { 'ring-4 ring-red-500 scale-105': myVote === 'Option A' },
            { 'opacity-50 cursor-not-allowed': hasVoted && myVote !== 'Option A' }
          ]"
        >
          <div class="text-center">
            <div class="mb-4">
              <span class="inline-block bg-red-600 text-white px-4 py-2 rounded-full font-bold text-lg">
                Option A
              </span>
            </div>
            <p class="text-xl md:text-2xl font-bold text-white leading-relaxed">
              {{ parsedOptions.optionA }}
            </p>
            <div v-if="myVote === 'Option A'" class="mt-4">
              <Icon icon="mdi:check-circle" class="w-8 h-8 text-red-400 mx-auto animate-bounce" />
            </div>
          </div>
        </button>

        <!-- VS Badge -->
        <div class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-20 hidden md:block">
          <div class="bg-gradient-to-r from-red-700 to-orange-700 px-4 py-2 rounded-full shadow-2xl border-2 border-amber-500/40">
            <span class="text-xl font-black">VS</span>
          </div>
        </div>

        <!-- Option B -->
        <button
          @click="submitVote('Option B')"
          :disabled="isSubmitting || hasVoted"
          :class="[
            'group cursor-pointer bg-gradient-to-br from-orange-800/30 to-orange-950/20 hover:from-orange-800/40 hover:to-orange-950/30 backdrop-blur-md rounded-2xl p-8 border-2 border-orange-600/40 hover:border-orange-500/70 transition-all duration-300 transform hover:scale-105 min-h-[250px] flex flex-col justify-center relative',
            { 'ring-4 ring-orange-500 scale-105': myVote === 'Option B' },
            { 'opacity-50 cursor-not-allowed': hasVoted && myVote !== 'Option B' }
          ]"
        >
          <div class="text-center">
            <div class="mb-4">
              <span class="inline-block bg-orange-600 text-white px-4 py-2 rounded-full font-bold text-lg">
                Option B
              </span>
            </div>
            <p class="text-xl md:text-2xl font-bold text-white leading-relaxed">
              {{ parsedOptions.optionB }}
            </p>
            <div v-if="myVote === 'Option B'" class="mt-4">
              <Icon icon="mdi:check-circle" class="w-8 h-8 text-orange-400 mx-auto animate-bounce" />
            </div>
          </div>
        </button>
      </div>

      <!-- Already Voted -->
      <div v-if="hasVoted" class="bg-purple-500/20 border-2 border-purple-500/50 rounded-xl p-6 text-center">
        <Icon icon="mdi:check-circle" class="w-16 h-16 mx-auto mb-4 text-green-400" />
        <p class="text-xl font-semibold">You've voted! Waiting for others...</p>
      </div>

      <!-- Live Vote Count - Real-time Animation -->
      <div v-if="votes.length > 0" class="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20">
        <h3 class="font-bold mb-3">Live Results</h3>
        <div class="space-y-3">
          <!-- Option A -->
          <div>
            <div class="flex items-center justify-between mb-2">
              <span class="font-semibold">Option A:</span>
              <span class="text-red-400 font-bold">{{ optionACount }} votes ({{ optionAPercentage }}%)</span>
            </div>
            <div class="w-full bg-white/10 rounded-full h-4 overflow-hidden">
              <div 
                class="bg-red-500 h-4 rounded-full transition-all duration-500 ease-out"
                :style="{ width: optionAPercentage + '%' }"
              ></div>
            </div>
            <!-- Public: Show who picked -->
            <div v-if="roomState.answerVisibility === 'public' && optionAVotes.length > 0" class="mt-2 space-y-1">
              <div
                v-for="vote in optionAVotes"
                :key="vote.socketId || Math.random()"
                class="text-sm text-white/80 animate-fade-in"
              >
                {{ vote.nickname || 'Player' }}
              </div>
            </div>
          </div>
          
          <!-- Option B -->
          <div>
            <div class="flex items-center justify-between mb-2">
              <span class="font-semibold">Option B:</span>
              <span class="text-orange-400 font-bold">{{ optionBCount }} votes ({{ optionBPercentage }}%)</span>
            </div>
            <div class="w-full bg-white/10 rounded-full h-4 overflow-hidden">
              <div 
                class="bg-orange-500 h-4 rounded-full transition-all duration-500 ease-out"
                :style="{ width: optionBPercentage + '%' }"
              ></div>
            </div>
            <!-- Public: Show who picked -->
            <div v-if="roomState.answerVisibility === 'public' && optionBVotes.length > 0" class="mt-2 space-y-1">
              <div
                v-for="vote in optionBVotes"
                :key="vote.socketId || Math.random()"
                class="text-sm text-white/80 animate-fade-in"
              >
                {{ vote.nickname || 'Player' }}
              </div>
            </div>
          </div>
          
          <div class="text-sm text-white/60 text-center">
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

    <!-- Results Phase -->
    <div v-else-if="roomState.gamePhase === 'results'" class="space-y-6">
      <div class="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
        <h2 class="text-2xl font-bold mb-4 text-center">Results</h2>
        
        <div class="space-y-4">
          <!-- Option A -->
          <div class="bg-red-500/20 border-2 border-red-500/50 rounded-xl p-4">
            <div class="flex items-center justify-between mb-2">
              <span class="font-bold text-lg">Option A</span>
              <span class="text-2xl font-black text-red-400">{{ optionACount }} ({{ optionAPercentage }}%)</span>
            </div>
            <div class="w-full bg-white/10 rounded-full h-4 mb-2">
              <div class="bg-red-500 h-4 rounded-full" :style="{ width: optionAPercentage + '%' }"></div>
            </div>
            <!-- Public: Show who picked -->
            <div v-if="roomState.answerVisibility === 'public' && optionAVotes.length > 0" class="mt-2 space-y-1">
              <div
                v-for="vote in optionAVotes"
                :key="vote.socketId || Math.random()"
                class="text-sm text-white/80"
              >
                {{ vote.nickname || 'Player' }}
              </div>
            </div>
          </div>

          <!-- Option B -->
          <div class="bg-orange-500/20 border-2 border-orange-500/50 rounded-xl p-4">
            <div class="flex items-center justify-between mb-2">
              <span class="font-bold text-lg">Option B</span>
              <span class="text-2xl font-black text-orange-400">{{ optionBCount }} ({{ optionBPercentage }}%)</span>
            </div>
            <div class="w-full bg-white/10 rounded-full h-4 mb-2">
              <div class="bg-orange-500 h-4 rounded-full" :style="{ width: optionBPercentage + '%' }"></div>
            </div>
            <!-- Public: Show who picked -->
            <div v-if="roomState.answerVisibility === 'public' && optionBVotes.length > 0" class="mt-2 space-y-1">
              <div
                v-for="vote in optionBVotes"
                :key="vote.socketId || Math.random()"
                class="text-sm text-white/80"
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

// Get host name
const hostName = computed(() => {
  const host = roomState.value.players.find((p: any) => p.isHost)
  return host?.nickname || 'Host'
})

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
