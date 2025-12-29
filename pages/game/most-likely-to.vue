<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 text-white p-3 sm:p-4 relative overflow-hidden">
    <!-- Background Icons Pattern -->
    <BackgroundIcons />

    <div class="max-w-4xl mx-auto relative z-10 pt-4 sm:pt-6 md:pt-8">
      <!-- Header with Home Button -->
      <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-0 mb-6 sm:mb-8">
        <div class="flex gap-2 w-full sm:w-auto">
          <NuxtLink to="/" class="bg-white/10 hover:bg-white/20 backdrop-blur-md px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl transition-all duration-300 flex items-center gap-1.5 sm:gap-2 border border-white/20 hover:scale-105 text-sm sm:text-base flex-1 sm:flex-initial justify-center sm:justify-start">
            <Icon icon="mdi:home" class="w-4 h-4 sm:w-5 sm:h-5" />
            <span class="font-medium">Home</span>
          </NuxtLink>
          <NuxtLink to="/setup?step=game-selection" class="bg-white/10 hover:bg-white/20 backdrop-blur-md px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl transition-all duration-300 flex items-center gap-1.5 sm:gap-2 border border-white/20 hover:scale-105 text-sm sm:text-base flex-1 sm:flex-initial justify-center sm:justify-start">
            <Icon icon="mdi:arrow-left" class="w-4 h-4 sm:w-5 sm:h-5" />
            <span class="font-medium">Back</span>
          </NuxtLink>
        </div>
        
        <div class="flex items-center gap-2 w-full sm:w-auto justify-center sm:justify-end">
          <div class="bg-white/10 backdrop-blur-md px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl border border-white/20">
            <div class="text-[10px] sm:text-xs text-white/60">Current Turn</div>
            <div class="text-xs sm:text-sm font-bold flex items-center gap-1 sm:gap-1.5">
              <span class="truncate max-w-[100px] sm:max-w-none">{{ currentPlayer?.name || 'Player' }}</span>
              <span class="text-xs sm:text-base flex-shrink-0">{{ currentPlayer?.gender === 'male' ? '♂' : currentPlayer?.gender === 'female' ? '♀' : '' }}</span>
            </div>
          </div>
          <div class="bg-white/10 backdrop-blur-md px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl border border-white/20">
            <div class="flex items-center gap-1.5 sm:gap-2">
              <Icon icon="mdi:counter" class="w-4 h-4 sm:w-5 sm:h-5 text-cyan-300" />
              <span class="font-semibold text-xs sm:text-sm md:text-base">Round {{ roundCount }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Game Title Card -->
      <div class="text-center mb-3 sm:mb-4 md:mb-6 transform hover:scale-105 transition-transform duration-300 px-2">
        <div class="inline-block bg-gradient-to-r from-red-900/40 to-black/60 backdrop-blur-md rounded-lg sm:rounded-xl md:rounded-2xl px-3 sm:px-4 md:px-6 lg:px-8 py-2 sm:py-3 md:py-4 border-2 border-red-500/40 shadow-2xl shadow-red-900/50 w-full sm:w-auto">
          <h1 class="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-black bg-clip-text text-transparent bg-gradient-to-r from-red-500 via-orange-500 to-amber-400 mb-1 sm:mb-2">
            Most Likely To
          </h1>
          <p class="text-red-200/80 text-[10px] sm:text-xs md:text-sm font-medium tracking-wide">Point at someone - majority rules!</p>
        </div>
      </div>

      <!-- Main Question Card -->
      <div class="mb-8">
        <div class="bg-gradient-to-br from-red-950/60 to-black/80 backdrop-blur-xl rounded-3xl p-8 md:p-12 shadow-2xl border-2 border-red-600/30 relative overflow-hidden min-h-[280px] flex items-center justify-center">
          <!-- Decorative corner elements -->
          <div class="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-red-600/20 to-transparent rounded-bl-full"></div>
          <div class="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-orange-600/20 to-transparent rounded-tr-full"></div>
          
          <transition name="slide-fade" mode="out-in">
            <div :key="questionKey" class="text-center relative z-10 w-full">
              <!-- Question Icon -->
              <div class="mb-6 flex justify-center">
                <div class="bg-gradient-to-br from-red-600 to-orange-700 p-4 rounded-2xl shadow-lg shadow-red-900/50 animate-pulse-slow">
                  <Icon icon="mdi:account-question" class="w-12 h-12" />
                </div>
              </div>
              
              <!-- Question Text -->
              <p class="text-2xl md:text-4xl font-bold leading-relaxed px-4 text-white drop-shadow-lg">
                {{ question?.text || 'Get ready to point fingers...' }}
              </p>

              <!-- Decorative underline -->
              <div class="mt-6 flex justify-center">
                <div class="h-1 w-24 bg-gradient-to-r from-red-600 via-orange-600 to-amber-500 rounded-full"></div>
              </div>
            </div>
          </transition>
        </div>
      </div>

      <!-- Multiplayer Voting (if in multiplayer mode) -->
      <div v-if="isMultiplayer && roomState && roomState.gamePhase === 'playing'" class="mb-8">
        <div class="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
          <h3 class="text-xl font-bold mb-4 text-center">Who is most likely to...</h3>
          <div class="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <button
              v-for="player in availablePlayers"
              :key="player.socketId"
              @click="handleVoteForPlayer(player.socketId)"
              :disabled="hasVoted"
              :class="[
                'p-4 rounded-xl border-2 transition-all',
                selectedPlayer === player.socketId
                  ? 'bg-red-500/30 border-red-500 ring-4 ring-red-400'
                  : 'bg-white/5 border-white/10 hover:border-red-400/50',
                hasVoted ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:scale-105'
              ]"
            >
              <div class="w-12 h-12 rounded-full bg-gradient-to-r from-red-500 to-orange-500 flex items-center justify-center mx-auto mb-2 font-bold text-xl">
                {{ player.nickname.charAt(0).toUpperCase() }}
              </div>
              <div class="text-sm font-semibold text-center">{{ player.nickname }}</div>
              <div v-if="player.isHost" class="text-xs text-purple-300 mt-1">Host</div>
            </button>
          </div>
          <div v-if="hasVoted" class="mt-4 text-center text-purple-300 text-sm">
            ✓ Vote submitted! Waiting for other players...
          </div>
        </div>
      </div>

      <!-- Multiplayer Results -->
      <div v-if="isMultiplayer && roomState && roomState.gamePhase === 'results'" class="mb-8">
        <div class="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
          <h3 class="text-xl font-bold mb-4 text-center">Results</h3>
          <div class="space-y-3">
            <div
              v-for="(playerVotes, playerId) in voteDistribution"
              :key="playerId"
              :class="[
                'rounded-xl p-4 border-2 transition-all',
                playerId === winnerId
                  ? 'bg-gradient-to-r from-yellow-500/30 to-orange-500/30 border-yellow-500 ring-4 ring-yellow-400'
                  : 'bg-white/5 border-white/10'
              ]"
            >
              <div class="flex items-center justify-between mb-2">
                <div class="flex items-center gap-3">
                  <div class="w-10 h-10 rounded-full bg-gradient-to-r from-red-500 to-orange-500 flex items-center justify-center font-bold">
                    {{ getPlayerName(playerId)?.charAt(0).toUpperCase() }}
                  </div>
                  <div>
                    <div class="font-semibold">{{ getPlayerName(playerId) }}</div>
                    <div v-if="roomState && roomState.answerVisibility === 'public'" class="text-xs text-white/60">
                      Voted by: {{ getVoterNames(playerId).join(', ') }}
                    </div>
                  </div>
                </div>
                <div class="text-2xl font-black">{{ playerVotes.length }}</div>
              </div>
              <div class="h-2 bg-white/10 rounded-full overflow-hidden">
                <div
                  class="h-full bg-gradient-to-r from-red-500 to-orange-500 transition-all duration-500"
                  :style="{ width: `${(playerVotes.length / totalVotes) * 100}%` }"
                ></div>
              </div>
            </div>
          </div>
          <div v-if="winnerId" class="mt-6 text-center">
            <div class="text-2xl font-black bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent mb-2">
              🏆 Winner: {{ getPlayerName(winnerId) }}
            </div>
          </div>
          <div v-if="isHost" class="mt-4">
            <button
              @click="handleNextRound"
              class="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white px-6 py-3 rounded-xl font-bold transition-all"
            >
              Next Question
            </button>
          </div>
        </div>
      </div>

      <!-- Action Buttons (Single-Device Mode) -->
      <div v-if="!isMultiplayer" class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <button 
          @click="fetchAnother" 
          class="group bg-gradient-to-r from-red-700 to-orange-700 hover:from-red-600 hover:to-orange-600 px-8 py-5 rounded-2xl font-bold text-lg flex items-center justify-center gap-3 shadow-xl hover:shadow-red-600/50 transition-all duration-300 transform hover:scale-105 border-2 border-red-500/30"
        >
          <Icon icon="mdi:refresh" class="w-6 h-6 group-hover:rotate-180 transition-transform duration-500" />
          <span>Next Question</span>
        </button>
        
        <button 
          @click="applyPenalty" 
          class="group bg-gradient-to-r from-amber-700 to-red-700 hover:from-amber-600 hover:to-red-600 px-8 py-5 rounded-2xl font-bold text-lg flex items-center justify-center gap-3 shadow-xl hover:shadow-amber-600/50 transition-all duration-300 transform hover:scale-105 border-2 border-amber-500/30"
        >
          <Icon icon="mdi:glass-cocktail" class="w-6 h-6 group-hover:animate-bounce" />
          <span>Drink Penalty</span>
        </button>
      </div>

      <!-- Penalty Display -->
      <transition name="bounce-in">
        <div v-if="showPenalty" class="mb-8">
          <div class="bg-gradient-to-r from-red-500/30 to-orange-500/30 backdrop-blur-md border-2 border-red-400/50 rounded-2xl p-6 text-center shadow-2xl animate-pulse">
            <div class="flex items-center justify-center gap-3 mb-2">
              <Icon icon="mdi:alert-circle" class="w-8 h-8 text-red-300" />
              <p class="text-red-200 font-bold text-xl">{{ penaltyMessage }}</p>
              <Icon icon="mdi:alert-circle" class="w-8 h-8 text-red-300" />
            </div>
            <p class="text-red-300/70 text-sm mt-2">Time to pay up! 🍻</p>
          </div>
        </div>
      </transition>

      <!-- Game Stats -->
      <div class="grid grid-cols-2 gap-4">
        <div class="bg-black/40 backdrop-blur-md rounded-xl p-4 border border-red-600/20 text-center hover:bg-red-950/30 transition-all">
          <Icon icon="mdi:star-circle" class="w-8 h-8 mx-auto mb-2 text-amber-500" />
          <p class="text-2xl font-bold text-white">{{ questionCount }}</p>
          <p class="text-red-200/60 text-sm">Questions Asked</p>
        </div>
        
        <div class="bg-black/40 backdrop-blur-md rounded-xl p-4 border border-orange-600/20 text-center hover:bg-orange-950/30 transition-all">
          <Icon icon="mdi:glass-cocktail" class="w-8 h-8 mx-auto mb-2 text-orange-500" />
          <p class="text-2xl font-bold text-white">{{ penaltyCount }}</p>
          <p class="text-orange-200/60 text-sm">Penalties Given</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { Icon } from '@iconify/vue';
import { useAnalytics } from '~/composables/useAnalytics';
import { useGameStore } from '~/stores/game';
// Questions are now loaded from database via API
import { useMostLikelyToTracker } from '~/composables/useQuestionTracker';
import { useMultiplayer } from '~/composables/useMultiplayer';

const gameStore = useGameStore();
const currentPlayer = computed(() => gameStore.currentPlayer);

// Multiplayer integration
const route = useRoute();
const isMultiplayer = computed(() => route.query.multiplayer === 'true');
const multiplayer = useMultiplayer();
const { roomState, votes, isHost, myPlayer, submitVote, showResults, nextRound, connect } = multiplayer;

const question = ref<{ text: string } | null>(null);

// Initialize question tracker
let questionTracker: any = null;
const showPenalty = ref(false);
const penaltyMessage = ref('');

// Game statistics
const roundCount = ref(0);
const questionCount = ref(0);
const penaltyCount = ref(0);

// Multiplayer state
const hasVoted = ref(false);
const selectedPlayer = ref<string | null>(null);

// Initialize analytics
const { trackPageView, updateActivity } = useAnalytics();

// Available players (excluding self)
const availablePlayers = computed(() => {
  if (!isMultiplayer.value || !myPlayer.value) return []
  return roomState.value.players.filter(p => p.socketId !== myPlayer.value?.socketId)
})

// Vote distribution
const voteDistribution = computed(() => {
  const distribution: Record<string, any[]> = {}
  votes.value.forEach(vote => {
    const targetPlayerId = vote.vote
    if (!distribution[targetPlayerId]) {
      distribution[targetPlayerId] = []
    }
    distribution[targetPlayerId].push(vote)
  })
  return distribution
})

// Total votes
const totalVotes = computed(() => {
  return votes.value.length
})

// Winner (player with most votes)
const winnerId = computed(() => {
  if (totalVotes.value === 0) return null
  let maxVotes = 0
  let winner: string | null = null
  Object.entries(voteDistribution.value).forEach(([playerId, playerVotes]) => {
    if (playerVotes.length > maxVotes) {
      maxVotes = playerVotes.length
      winner = playerId
    }
  })
  return winner
})

// Key for transition
const questionKey = computed(() => {
  return question.value && question.value.text ? `question-${question.value.text}` : 'question-none'
})

// Helper functions
const getPlayerName = (socketId: string) => {
  return roomState.value.players.find(p => p.socketId === socketId)?.nickname || 'Unknown'
}

const getVoterNames = (playerId: string) => {
  return voteDistribution.value[playerId]?.map(v => v.nickname).filter(Boolean) || []
}

const fetchAnother = () => {
  showPenalty.value = false;
  
  // Track user activity
  updateActivity();
  
  if (!questionTracker) {
    question.value = { text: 'Questions are loading... Please wait.' };
    return;
  }
  
  const result = questionTracker.getNextQuestion();
  
  // Log usage stats for debugging
  const stats = questionTracker.getUsageStats.value;
  console.log(`Most Likely To - Used: ${stats.usedCount}/${stats.totalQuestions} (${stats.usagePercentage}%)`);
  
  question.value = { text: result.question };
  roundCount.value++;
  questionCount.value++;
};

// Multiplayer vote for player
const handleVoteForPlayer = (playerId: string) => {
  if (hasVoted.value || !isMultiplayer.value) return;
  
  selectedPlayer.value = playerId
  submitVote(playerId)
  hasVoted.value = true
  updateActivity()
}

// Handle next round (host only)
const handleNextRound = () => {
  if (!isHost.value || !isMultiplayer.value) return;
  
  const result = questionTracker?.getNextQuestion();
  if (result) {
    nextRound({ prompt: { text: result.question } });
    hasVoted.value = false;
    selectedPlayer.value = null;
    question.value = { text: result.question };
    questionCount.value++;
    roundCount.value++;
  }
};

// Watch for game state updates in multiplayer
watch(() => roomState.value.gamePhase, (newPhase) => {
  if (newPhase === 'playing') {
    hasVoted.value = false;
    selectedPlayer.value = null;
    
    // If host, fetch next question
    if (isHost.value && questionTracker) {
      const result = questionTracker.getNextQuestion();
      question.value = { text: result.question };
      questionCount.value++;
      roundCount.value++;
    } else if (roomState.value.currentPrompt) {
      question.value = roomState.value.currentPrompt;
    }
  }
});

// Watch for vote updates
watch(() => votes.value, (newVotes) => {
  // Check if all players have voted (host can show results)
  if (isHost.value && newVotes.length >= roomState.value.players.length) {
    // Auto-show results after a short delay
    setTimeout(() => {
      if (roomState.value.gamePhase === 'playing') {
        showResults();
      }
    }, 2000);
  }
});

const applyPenalty = () => {
  const penalties = [
    'Take 2 sips as penalty!',
    'Take a shot as penalty!',
    'Drink for 3 seconds straight!',
    'Take a large gulp as penalty!',
    'Finish your current drink!',
    'Down that drink!',
    'Take 3 big sips!',
    'Chug for 5 seconds!'
  ];
  penaltyMessage.value = penalties[Math.floor(Math.random() * penalties.length)];
  showPenalty.value = true;
  penaltyCount.value++;
  
  // Track activity
  updateActivity();
  
  // Auto-hide penalty message after 5 seconds
  setTimeout(() => {
    showPenalty.value = false;
  }, 5000);
};

// Load questions from database
async function loadQuestions() {
  try {
    console.log('🔄 Loading Most Likely To questions from database...')
    const response = await $fetch('/api/questions/group-game?gameType=MOST_LIKELY_TO&limit=100')
      .catch(error => {
        console.error('❌ API call failed:', error)
        throw new Error(`Failed to fetch questions: ${error.message || 'Unknown error'}`)
      })
    
    console.log('Most Likely To API response:', response)
    
    if (!response || !response.questions) {
      console.error('❌ Invalid API response structure:', response)
      throw new Error('Invalid API response structure')
    }
    
    const questions = response.questions || []
    
    if (!Array.isArray(questions)) {
      throw new Error('Questions is not an array')
    }
    
    if (questions.length === 0) {
      throw new Error('No questions returned from API')
    }
    
    console.log(`✅ Successfully received ${questions.length} questions from API`)
    
    // Create tracker with loaded questions
    questionTracker = useMostLikelyToTracker(questions.map(q => q.text || q))
    questionTracker.initializeTracker();
    
    console.log(`✅ Loaded ${questions.length} Most Likely To questions`)
  } catch (error) {
    console.error('❌ Error loading Most Likely To questions:', error)
    console.error('Error details:', error.message, error.stack)
    // Don't use fallback - throw error so user knows
    throw error
  }
}

onMounted(async () => {
  if (typeof window !== "undefined") {
    // Track page view
    trackPageView('most-likely-to');
    
    // Initialize multiplayer if in multiplayer mode
    if (isMultiplayer.value) {
      connect();
      
      // Check if we have room info
      const roomInfo = localStorage.getItem('multiplayer_room');
      if (roomInfo) {
        try {
          const info = JSON.parse(roomInfo);
          console.log('Multiplayer room info:', info);
        } catch (e) {
          console.error('Failed to parse room info:', e);
        }
      }
    }
    
    // Load game state
    gameStore.loadFromLocalStorage();
    
    // Load questions from database
    try {
      await loadQuestions()
      
      // In multiplayer, wait for host to start game
      if (isMultiplayer.value) {
        if (isHost.value && roomState.value.gamePhase === 'playing') {
          const result = questionTracker.getNextQuestion();
          question.value = { text: result.question };
          questionCount.value++;
          roundCount.value++;
        } else if (roomState.value.currentPrompt) {
          question.value = roomState.value.currentPrompt;
        }
      } else {
        fetchAnother();
      }
    } catch (error) {
      console.error('Failed to load questions:', error)
      question.value = { text: 'Error loading questions. Please refresh the page or contact support.' }
    }
  }
});
</script>

<style scoped>
/* Animations */
@keyframes float {
  0%, 100% {
    transform: translateY(0) rotate(0deg);
  }
  50% {
    transform: translateY(-20px) rotate(5deg);
  }
}

.animate-float {
  animation: float 6s ease-in-out infinite;
}

@keyframes pulse-slow {
  0%, 100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.8;
    transform: scale(1.05);
  }
}

.animate-pulse-slow {
  animation: pulse-slow 3s ease-in-out infinite;
}

/* Slide fade transition */
.slide-fade-enter-active {
  transition: all 0.4s cubic-bezier(0.68, -0.55, 0.27, 1.55);
}

.slide-fade-leave-active {
  transition: all 0.3s cubic-bezier(0.68, -0.55, 0.27, 1.55);
}

.slide-fade-enter-from {
  transform: translateY(30px) scale(0.9);
  opacity: 0;
}

.slide-fade-leave-to {
  transform: translateY(-30px) scale(0.9);
  opacity: 0;
}

/* Bounce in animation */
.bounce-in-enter-active {
  animation: bounce-in 0.5s cubic-bezier(0.68, -0.55, 0.27, 1.55);
}

.bounce-in-leave-active {
  animation: bounce-out 0.3s ease-in;
}

@keyframes bounce-in {
  0% {
    transform: scale(0) translateY(-50px);
    opacity: 0;
  }
  50% {
    transform: scale(1.1) translateY(0);
  }
  100% {
    transform: scale(1) translateY(0);
    opacity: 1;
  }
}

@keyframes bounce-out {
  0% {
    transform: scale(1);
    opacity: 1;
  }
  100% {
    transform: scale(0.8);
    opacity: 0;
  }
}

/* Scrollbar styling */
::-webkit-scrollbar {
  width: 8px;
}

::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 4px;
}

::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.3);
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.5);
}
</style>


