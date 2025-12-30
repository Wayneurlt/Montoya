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
        💬 Truth or Dare
      </h1>
      <p class="text-purple-200/80 text-sm font-medium">{{ roomState.answerVisibility === 'anonymous' ? 'Anonymous Mode' : 'Public Mode' }}</p>
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

    <!-- Intensity Toggle (Host Only) -->
    <div v-if="isHost" class="mb-6">
      <div class="flex bg-white/5 rounded-xl p-1 border-2 border-white/10">
        <button
          @click="isSpicyMode = false"
          class="flex-1 px-6 py-4 rounded-lg transition-all duration-300 text-base font-bold"
          :class="!isSpicyMode ? 'bg-gradient-to-r from-purple-600 to-cyan-600 text-white shadow-lg scale-105' : 'text-white/70 hover:text-white hover:bg-white/5'"
        >
          😇 Normal
        </button>
        <button
          @click="isSpicyMode = true"
          class="flex-1 px-6 py-4 rounded-lg transition-all duration-300 text-base font-bold"
          :class="isSpicyMode ? 'bg-gradient-to-r from-pink-600 to-purple-600 text-white shadow-lg scale-105' : 'text-white/70 hover:text-white hover:bg-white/5'"
        >
          🌶️ Spicy
        </button>
      </div>
      <div class="text-center mt-3 text-sm font-medium"
        :class="isSpicyMode ? 'text-pink-300' : 'text-purple-300'">
        {{ isSpicyMode ? '🔥 Hot and steamy questions' : '✨ Mild and playful questions' }}
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="questionsLoading" class="mb-6 bg-blue-500/20 border border-blue-400/30 rounded-xl p-4 text-center">
      <div class="flex items-center justify-center gap-3">
        <Icon icon="svg-spinners:3-dots-fade" class="w-6 h-6" />
        <span class="font-medium">Loading questions from database...</span>
      </div>
    </div>

    <!-- Current Card Display -->
    <div v-if="roomState.currentPrompt && cardFlipped" class="mb-6">
      <div class="bg-white/10 backdrop-blur-md rounded-2xl p-6 sm:p-8 md:p-10 border border-white/20 shadow-2xl">
        <div class="text-center">
          <!-- Type Badge -->
          <div class="mb-6 flex justify-center">
            <div class="inline-flex items-center gap-3 px-6 py-3 rounded-full font-black text-lg shadow-lg"
              :class="roomState.currentPrompt.type === 'TRUTH' 
                ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white' 
                : 'bg-gradient-to-r from-pink-600 to-red-600 text-white'">
              <Icon :icon="roomState.currentPrompt.type === 'TRUTH' ? 'mdi:chat-question' : 'mdi:fire'" class="w-6 h-6" />
              {{ roomState.currentPrompt.type === 'TRUTH' ? 'TRUTH' : 'DARE' }}
            </div>
          </div>
          
          <!-- Question Text -->
          <p class="text-2xl sm:text-3xl md:text-4xl font-bold mb-6 leading-relaxed px-4">
            {{ roomState.currentPrompt.text }}
          </p>
          
          <!-- Target Player (for Dares) -->
          <div v-if="roomState.currentPrompt.target" class="bg-white/5 rounded-xl p-4 max-w-sm mx-auto mb-4 border border-white/10">
            <p class="text-base font-medium flex items-center justify-center gap-2">
              <Icon icon="mdi:account-arrow-right" class="w-5 h-5" />
              To: {{ roomState.currentPrompt.target.nickname }}
              <span v-if="roomState.currentPrompt.target.gender" class="text-xl">{{ roomState.currentPrompt.target.gender === 'male' ? '♂' : roomState.currentPrompt.target.gender === 'female' ? '♀' : '⚧' }}</span>
            </p>
          </div>
        </div>
      </div>

      <!-- Action Buttons (All Players) -->
      <div v-if="roomState.currentPrompt && cardFlipped" class="grid grid-cols-2 gap-4 mb-6">
        <button
          @click="completeChallenge"
          class="group bg-gradient-to-r from-green-700 to-emerald-700 hover:from-green-600 hover:to-emerald-600 py-4 rounded-2xl font-black text-lg transition-all flex items-center justify-center gap-3 shadow-xl hover:shadow-green-600/50 border-2 border-green-500/30 hover:scale-105"
        >
          <Icon icon="mdi:check-bold" class="w-6 h-6 group-hover:scale-110 transition-transform" />
          Completed
        </button>
        <button
          @click="failChallenge"
          class="group bg-gradient-to-r from-red-700 to-pink-700 hover:from-red-600 hover:to-pink-600 py-4 rounded-2xl font-black text-lg transition-all flex items-center justify-center gap-3 shadow-xl hover:shadow-red-600/50 border-2 border-red-500/30 hover:scale-105"
        >
          <Icon icon="mdi:close-thick" class="w-6 h-6 group-hover:scale-110 transition-transform" />
          Failed
        </button>
      </div>
    </div>

    <!-- Waiting for Host -->
    <div v-else-if="!roomState.currentPrompt" class="bg-white/10 backdrop-blur-md rounded-2xl p-8 mb-6 border border-white/20 text-center">
      <div class="animate-pulse">
        <Icon icon="mdi:clock-outline" class="w-16 h-16 mx-auto mb-4 text-purple-400" />
        <p class="text-xl font-semibold">Waiting for host to start...</p>
      </div>
    </div>

    <!-- Host Controls -->
    <div v-if="isHost" class="bg-purple-500/20 rounded-xl p-6 border border-purple-500/30 space-y-4">
      <h3 class="font-bold text-lg mb-4 flex items-center gap-2">
        <Icon icon="mdi:crown" class="w-5 h-5" />
        Host Controls
      </h3>

      <div class="grid grid-cols-2 gap-3 mb-4">
        <button
          @click="drawCard('TRUTH')"
          :disabled="isDrawing"
          class="bg-blue-500/20 hover:bg-blue-500/30 border-2 border-blue-500/50 rounded-xl p-4 transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Icon icon="mdi:eye" class="w-8 h-8 mx-auto mb-2" />
          <span class="font-bold">Truth</span>
        </button>
        <button
          @click="drawCard('DARE')"
          :disabled="isDrawing"
          class="bg-red-500/20 hover:bg-red-500/30 border-2 border-red-500/50 rounded-xl p-4 transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Icon icon="mdi:fire" class="w-8 h-8 mx-auto mb-2" />
          <span class="font-bold">Dare</span>
        </button>
      </div>

      <button
        @click="drawRandomCard"
        :disabled="isDrawing"
        class="w-full bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 hover:from-purple-500 hover:via-pink-500 hover:to-purple-500 text-white px-6 py-3 rounded-xl font-black shadow-xl transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <Icon icon="mdi:dice-multiple" class="w-5 h-5 inline mr-2" />
        {{ isDrawing ? 'Drawing...' : 'Random Card' }}
      </button>
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
          <span v-if="player.gender" class="text-xs">{{ player.gender === 'male' ? '♂' : player.gender === 'female' ? '♀' : '⚧' }}</span>
          <span v-if="player.isHost" class="text-xs text-purple-400">👑</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { Icon } from '@iconify/vue'
import { useRouter } from 'vue-router'

interface Props {
  roomState: any
  isHost: boolean
  multiplayer: any
}

const props = defineProps<Props>()
const router = useRouter()

// Use the multiplayer composable's isHost directly for reactivity
const isHost = computed(() => props.multiplayer.isHost.value)

const handleChangeGame = () => {
  if (!isHost.value) return
  props.multiplayer.endGame()
  router.push('/lobby')
}

const isSpicyMode = ref(false)
const isDrawing = ref(false)
const cardFlipped = ref(false)
const questionsLoading = ref(false)
const copied = ref(false)

const copyRoomCode = async () => {
  if (!props.roomState.roomCode) return
  try {
    await navigator.clipboard.writeText(props.roomState.roomCode)
    copied.value = true
    setTimeout(() => {
      copied.value = false
    }, 2000)
  } catch (err) {
    console.error('Failed to copy:', err)
  }
}

// Question trackers (same as single-player)
let normalTruthTracker: any = null
let spicyTruthTracker: any = null
let normalDareTracker: any = null
let spicyDareTracker: any = null

// Load questions from database (same as single-player)
async function loadQuestions() {
  questionsLoading.value = true
  
  try {
    const truthResponse = await $fetch('/api/questions/truth-or-dare?type=TRUTH&limit=200')
    const dareResponse = await $fetch('/api/questions/truth-or-dare?type=DARE&limit=200')
    
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
    
    console.log('✅ Questions loaded:', {
      normalTruths: normalTruths.length,
      spicyTruths: spicyTruths.length,
      normalDares: normalDares.length,
      spicyDares: spicyDares.length,
    })
  } catch (error) {
    console.error('Error loading questions:', error)
  } finally {
    questionsLoading.value = false
  }
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
  return result.question
}

// Get current player from prompt - only use synced state, no random fallback
const currentPlayer = computed(() => {
  // Only use the player from the synced prompt to ensure all devices show the same player
  if (props.roomState.currentPrompt?.player) {
    return props.roomState.currentPrompt.player
  }
  
  // Return null if no player is assigned yet (don't use random fallback)
  return null
})

// Get random target player (for Dares)
const getRandomTarget = () => {
  const players = props.roomState.players
  if (!players || players.length <= 1) return null
  
  // Get a random player that's not the current player
  const current = currentPlayer.value
  const otherPlayers = players.filter((p: any) => p.socketId !== current?.socketId)
  
  if (otherPlayers.length === 0) return null
  
  const randomIndex = Math.floor(Math.random() * otherPlayers.length)
  return otherPlayers[randomIndex]
}

// Draw card
const drawCard = async (type: 'TRUTH' | 'DARE') => {
  if (isDrawing.value || !props.isHost) return
  
  isDrawing.value = true
  cardFlipped.value = false
  
  const content = getRandomQuestion(type)
  const player = currentPlayer.value
  
  // For Dares, optionally assign a target player
  let target = null
  if (type === 'DARE' && props.roomState.players.length > 1) {
    target = getRandomTarget()
  }
  
  // Update game state with player assignment
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
  
  // Flip card after delay
  setTimeout(() => {
    cardFlipped.value = true
    isDrawing.value = false
  }, 500)
}

// Draw random card
const drawRandomCard = async () => {
  const type = Math.random() > 0.5 ? 'TRUTH' : 'DARE'
  await drawCard(type)
}

// Complete challenge - move to next player
const completeChallenge = () => {
  if (!props.roomState.currentPrompt) return
  
  // Clear current prompt to move to next turn
  props.multiplayer.nextRound(null)
  cardFlipped.value = false
}

// Fail challenge - move to next player
const failChallenge = () => {
  if (!props.roomState.currentPrompt) return
  
  // Clear current prompt to move to next turn
  props.multiplayer.nextRound(null)
  cardFlipped.value = false
}

// Watch for prompt changes to flip card
watch(() => props.roomState.currentPrompt, (newPrompt) => {
  if (newPrompt) {
    cardFlipped.value = true
  } else {
    cardFlipped.value = false
  }
})

onMounted(() => {
  loadQuestions()
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
</script>
