<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 text-white p-3 sm:p-4 relative overflow-x-hidden overflow-y-auto safe-bottom">
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
            <div class="flex items-center gap-1.5 sm:gap-2">
              <Icon icon="mdi:fire" class="w-4 h-4 sm:w-5 sm:h-5 text-orange-400 animate-pulse" />
              <span class="font-semibold text-xs sm:text-sm md:text-base">Round {{ roundCount }}</span>
            </div>
          </div>
          <span
            v-if="gameStore.gameMode === 'connection'"
            class="text-xs sm:text-sm px-2 sm:px-3 py-1 sm:py-1.5 rounded-full bg-green-500/20 text-green-300 border border-green-400/30 whitespace-nowrap"
          >
            Connection
          </span>
        </div>
      </div>

      <!-- Game Title Card -->
      <div class="text-center mb-3 sm:mb-4 md:mb-6 transform hover:scale-105 transition-transform duration-300 px-2">
        <div class="inline-block bg-gradient-to-r from-black/60 to-purple-950/60 backdrop-blur-md rounded-lg sm:rounded-xl md:rounded-2xl px-3 sm:px-4 md:px-6 lg:px-8 py-2 sm:py-3 md:py-4 border-2 border-purple-600/40 shadow-2xl shadow-purple-900/50 w-full sm:w-auto">
          <h1 class="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-pink-500 to-cyan-400 mb-1 sm:mb-2">
            Never Have I Ever
          </h1>
          <p class="text-purple-200/80 text-[10px] sm:text-xs md:text-sm font-medium tracking-wide">If you have, take a drink!</p>
        </div>
      </div>

      <!-- Main Question Card - Matching Most Likely To Style -->
      <div class="mb-8">
        <div class="bg-gradient-to-br from-purple-950/60 to-black/80 backdrop-blur-xl rounded-3xl p-8 md:p-12 shadow-2xl border-2 border-purple-600/30 relative overflow-hidden min-h-[280px] flex items-center justify-center">
          <!-- Decorative corner elements -->
          <div class="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-600/20 to-transparent rounded-bl-full"></div>
          <div class="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-pink-600/20 to-transparent rounded-tr-full"></div>
          
          <transition name="slide-fade" mode="out-in">
            <div :key="questionKey" class="text-center relative z-10 w-full">
              <!-- Question Icon -->
              <div class="mb-6 flex justify-center">
                <div class="bg-gradient-to-br from-purple-600 to-pink-700 p-4 rounded-2xl shadow-lg shadow-purple-900/50 animate-pulse-slow">
                  <Icon icon="mdi:hand-pointing-right" class="w-12 h-12" />
                </div>
              </div>
              
              <!-- Never Have I Ever prefix -->
              <div class="mb-4">
                <span class="inline-block bg-gradient-to-r from-purple-600/40 to-pink-600/40 px-4 py-2 rounded-full text-sm font-bold border border-purple-500/50">
                  Never Have I Ever...
                </span>
              </div>
              
              <!-- Question Text -->
              <p class="text-2xl md:text-4xl font-bold leading-relaxed px-4 text-white drop-shadow-lg">
                {{ questionTextWithoutPrefix || 'Get ready to confess...' }}
              </p>

              <!-- Decorative underline -->
              <div class="mt-6 flex justify-center">
                <div class="h-1 w-24 bg-gradient-to-r from-purple-600 via-pink-600 to-cyan-500 rounded-full"></div>
              </div>
            </div>
          </transition>
        </div>
      </div>

      <!-- Action Buttons - Matching Most Likely To Style -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <button 
          @click="fetchAnother" 
          class="group bg-gradient-to-r from-purple-700 to-pink-700 hover:from-purple-600 hover:to-pink-600 px-8 py-5 rounded-2xl font-bold text-lg flex items-center justify-center gap-3 shadow-xl hover:shadow-purple-600/50 transition-all duration-300 transform hover:scale-105 border-2 border-purple-500/30"
        >
          <Icon icon="mdi:refresh" class="w-6 h-6 group-hover:rotate-180 transition-transform duration-500" />
          <span>Next Question</span>
        </button>
        
        <button 
          @click="applyPenalty" 
          class="group bg-gradient-to-r from-pink-700 to-purple-700 hover:from-pink-600 hover:to-purple-600 px-8 py-5 rounded-2xl font-bold text-lg flex items-center justify-center gap-3 shadow-xl hover:shadow-pink-600/50 transition-all duration-300 transform hover:scale-105 border-2 border-pink-500/30"
        >
          <Icon icon="mdi:glass-cocktail" class="w-6 h-6 group-hover:animate-bounce" />
          <span>Drink Penalty</span>
        </button>
      </div>
      
      <!-- Multiplayer Voting (if in multiplayer mode) -->
      <div v-if="isMultiplayer && roomState && roomState.gamePhase === 'playing'" class="mb-8 space-y-4">
        <div class="grid grid-cols-2 gap-4">
          <button 
            @click="handleSubmitVote('have')" 
            :disabled="hasVoted"
            class="group bg-gradient-to-r from-green-700 to-emerald-700 hover:from-green-600 hover:to-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed px-8 py-5 rounded-2xl font-bold text-lg flex items-center justify-center gap-3 shadow-xl hover:shadow-green-600/50 transition-all duration-300 transform hover:scale-105 border-2 border-green-500/30"
            :class="{ 'ring-4 ring-green-400': myVote === 'have' }"
          >
            <Icon icon="mdi:check-circle" class="w-6 h-6 group-hover:scale-110 transition-transform" />
            <span>I Have</span>
          </button>
          <button 
            @click="handleSubmitVote('haveNot')" 
            :disabled="hasVoted"
            class="group bg-gradient-to-r from-red-700 to-rose-700 hover:from-red-600 hover:to-rose-600 disabled:opacity-50 disabled:cursor-not-allowed px-8 py-5 rounded-2xl font-bold text-lg flex items-center justify-center gap-3 shadow-xl hover:shadow-red-600/50 transition-all duration-300 transform hover:scale-105 border-2 border-red-500/30"
            :class="{ 'ring-4 ring-red-400': myVote === 'haveNot' }"
          >
            <Icon icon="mdi:close-circle" class="w-6 h-6 group-hover:scale-110 transition-transform" />
            <span>I Have Not</span>
          </button>
        </div>
        <div v-if="hasVoted" class="text-center text-purple-300 text-sm">
          ✓ Vote submitted! Waiting for other players...
        </div>
      </div>

      <!-- Results Display (Multiplayer) -->
      <div v-if="isMultiplayer && roomState && roomState.gamePhase === 'results'" class="mb-8">
        <div class="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
          <h3 class="text-xl font-bold mb-4 text-center">Results</h3>
          <div class="grid grid-cols-2 gap-4">
            <div class="bg-green-500/20 rounded-xl p-4 border border-green-500/30">
              <div class="text-3xl font-black text-green-400 mb-2">{{ haveCount }}</div>
              <div class="text-sm text-green-300 mb-3">I Have</div>
              <div v-if="roomState && roomState.answerVisibility === 'public'" class="space-y-1">
                <div v-for="vote in haveVotes" :key="vote.socketId" class="text-xs text-green-200">
                  • {{ vote.nickname }}
                </div>
              </div>
            </div>
            <div class="bg-red-500/20 rounded-xl p-4 border border-red-500/30">
              <div class="text-3xl font-black text-red-400 mb-2">{{ haveNotCount }}</div>
              <div class="text-sm text-red-300 mb-3">I Have Not</div>
              <div v-if="roomState && roomState.answerVisibility === 'public'" class="space-y-1">
                <div v-for="vote in haveNotVotes" :key="vote.socketId" class="text-xs text-red-200">
                  • {{ vote.nickname }}
                </div>
              </div>
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

      <!-- Single-Device I Have Button -->
      <div v-if="!isMultiplayer" class="mb-8">
        <button 
          @click="markAsDone('yes')" 
          class="w-full group bg-gradient-to-r from-green-700 to-emerald-700 hover:from-green-600 hover:to-emerald-600 px-8 py-5 rounded-2xl font-bold text-lg flex items-center justify-center gap-3 shadow-xl hover:shadow-green-600/50 transition-all duration-300 transform hover:scale-105 border-2 border-green-500/30"
        >
          <Icon icon="mdi:check-circle" class="w-6 h-6 group-hover:scale-110 transition-transform" />
          <span>I Have!</span>
        </button>
      </div>

      <!-- Penalty Display -->
      <transition name="bounce-in">
        <div v-if="showPenalty" class="mb-8">
          <div class="bg-gradient-to-r from-purple-500/30 to-pink-500/30 backdrop-blur-md border-2 border-purple-400/50 rounded-2xl p-6 text-center shadow-2xl animate-shake">
            <div class="flex items-center justify-center gap-3 mb-2">
              <Icon icon="mdi:beer" class="w-8 h-8 text-purple-300 animate-bounce" />
              <p class="text-purple-200 font-bold text-xl">{{ penaltyMessage }}</p>
              <Icon icon="mdi:beer" class="w-8 h-8 text-purple-300 animate-bounce" style="animation-delay: 0.2s;" />
            </div>
            <p class="text-purple-300/70 text-sm mt-2">Bottoms up! 🍺</p>
          </div>
        </div>
      </transition>

      <!-- Game Stats - Matching Most Likely To Style -->
      <div class="grid grid-cols-2 gap-4">
        <div class="bg-black/40 backdrop-blur-md rounded-xl p-4 border border-purple-600/20 text-center hover:bg-purple-950/30 transition-all">
          <Icon icon="mdi:star-circle" class="w-8 h-8 mx-auto mb-2 text-purple-500" />
          <p class="text-2xl font-bold text-white">{{ questionCount }}</p>
          <p class="text-purple-200/60 text-sm">Questions Asked</p>
        </div>
        
        <div class="bg-black/40 backdrop-blur-md rounded-xl p-4 border border-pink-600/20 text-center hover:bg-pink-950/30 transition-all">
          <Icon icon="mdi:glass-cocktail" class="w-8 h-8 mx-auto mb-2 text-pink-500" />
          <p class="text-2xl font-bold text-white">{{ penaltyCount }}</p>
          <p class="text-pink-200/60 text-sm">Penalties Given</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue';
import { Icon } from '@iconify/vue';
import { useAnalytics } from '~/composables/useAnalytics';
// Questions are now loaded from database via API
import { useNeverHaveIEverTracker } from '~/composables/useQuestionTracker';
import { useGameStore } from '~/stores/game';
import { useGroupGame } from '~/composables/useGroupGame';
import { useMultiplayer } from '~/composables/useMultiplayer';

// Multiplayer room state lives in a process-wide singleton (see useMultiplayer.ts),
// not per-request — rendering it during SSR could leak one user's live room into
// another user's server-rendered HTML, so this page is client-only.
definePageMeta({ ssr: false });

const question = ref(null);

// Game Store Integration
const gameStore = useGameStore();
const groupGame = useGroupGame();

// Multiplayer integration
const route = useRoute();
const isMultiplayer = computed(() => route.query.multiplayer === 'true');
const multiplayer = useMultiplayer();
const { roomState, votes, isHost, submitVote, showResults, nextRound, connect } = multiplayer;

// Initialize question tracker (will be populated from database)
let questionTracker = null;
const showPenalty = ref(false);
const penaltyMessage = ref('');

// Game statistics
const questionCount = ref(0);
const penaltyCount = ref(0);

// Multiplayer state
const hasVoted = ref(false);
const myVote = ref<string | null>(null);

// Computed from store
const roundCount = computed(() => gameStore.currentRound);

// Multiplayer vote counts
const haveCount = computed(() => {
  return votes.value.filter(v => v.vote === 'have').length;
});

const haveNotCount = computed(() => {
  return votes.value.filter(v => v.vote === 'haveNot').length;
});

const haveVotes = computed(() => {
  return votes.value.filter(v => v.vote === 'have' && v.nickname);
});

const haveNotVotes = computed(() => {
  return votes.value.filter(v => v.vote === 'haveNot' && v.nickname);
});

// Remove "Never have I ever" prefix from question text for display
const questionTextWithoutPrefix = computed(() => {
  if (!question.value || !question.value.text) return ''
  const text = question.value.text
  // Remove "Never have I ever" or "Never Have I Ever" prefix (case insensitive)
  return text.replace(/^never\s+have\s+i\s+ever\s+/i, '').trim() || text
})

// Key for transition
const questionKey = computed(() => {
  return question.value && question.value.text ? `question-${question.value.text}` : 'question-none'
})

// Initialize analytics
const { trackPageView, updateActivity } = useAnalytics();

const fetchAnother = () => {
  showPenalty.value = false;
  
  // Track user activity
  updateActivity();
  
  if (!questionTracker) {
    question.value = { text: 'Questions are loading... Please wait.' };
    return;
  }
  
  const result = questionTracker.getNextQuestion();
  let questionText = result.question;
  
  // Don't adapt Never Have I Ever questions - they should stay as-is
  // The adaptQuestion function was replacing them with Truth-style icebreakers
  // questionText = groupGame.adaptQuestion(questionText, intensity);
  
  // Log usage stats for debugging
  const stats = questionTracker.getUsageStats.value;
  console.log(`Never Have I Ever - Used: ${stats.usedCount}/${stats.totalQuestions} (${stats.usagePercentage}%)`);
  
  question.value = { text: questionText };
  questionCount.value++;
  groupGame.addToHistory(questionText);
  groupGame.completeRound();
};

const markAsDone = (response) => {
  // Track activity
  updateActivity();
  
  // Auto-advance to next question after a brief moment
  setTimeout(() => {
    fetchAnother();
  }, 500);
};

// Multiplayer vote submission
const handleSubmitVote = (vote: 'have' | 'haveNot') => {
  if (hasVoted.value || !isMultiplayer.value) return;
  
  submitVote(vote);
  hasVoted.value = true;
  myVote.value = vote;
  updateActivity();
};

// Handle next round (host only)
const handleNextRound = () => {
  if (!isHost.value || !isMultiplayer.value) return;
  
  const result = questionTracker?.getNextQuestion();
  if (result) {
    nextRound({ prompt: { text: result.question } });
    hasVoted.value = false;
    myVote.value = null;
    question.value = { text: result.question };
    questionCount.value++;
  }
};

// Watch for game state updates in multiplayer
watch(() => roomState.value.gamePhase, (newPhase) => {
  if (newPhase === 'playing') {
    hasVoted.value = false;
    myVote.value = null;
    
    // If host, fetch next question
    if (isHost.value && questionTracker) {
      const result = questionTracker.getNextQuestion();
      question.value = { text: result.question };
      questionCount.value++;
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
    'Down it all!',
    'Take 3 big gulps!',
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
    console.log('🔄 Loading Never Have I Ever questions from database...')
    
    // Removed intensity filter - get all questions
    const response = await $fetch(`/api/questions/group-game?gameType=NEVER_HAVE_I_EVER&limit=200`)
      .catch(error => {
        console.error('❌ API call failed:', error)
        console.error('Error details:', error.message, error.data, error.statusCode)
        throw new Error(`Failed to fetch questions: ${error.message || 'Unknown error'}`)
      })
    
    console.log('✅ Never Have I Ever API response:', response)
    console.log('📦 Questions array:', response?.questions)
    
    if (!response || !response.questions) {
      console.error('❌ Invalid API response structure:', response)
      throw new Error('Invalid API response structure')
    }
    
    const questions = response.questions || []
    
    if (!Array.isArray(questions)) {
      console.error('❌ Questions is not an array:', typeof questions, questions)
      throw new Error('Questions is not an array')
    }
    
    if (questions.length === 0) {
      console.error('❌ No questions returned from API - database may be empty!')
      throw new Error('No questions returned from API')
    }
    
    console.log(`✅ Successfully received ${questions.length} questions from API`)
    
    // Extract text from questions (questions come as objects: {id, text, intensity})
    const questionTexts = questions
      .map(q => {
        if (typeof q === 'string') {
          return q
        }
        if (q && typeof q === 'object' && q.text) {
          return q.text
        }
        return String(q)
      })
      .filter(q => q && q.trim().length > 0)
    
    console.log(`✅ Extracted ${questionTexts.length} question texts`)
    if (questionTexts.length > 0) {
      console.log('✅ Sample question:', questionTexts[0])
    }
    
    if (questionTexts.length === 0) {
      console.error('❌ No valid questions found after processing')
      throw new Error('No questions found in database')
    }
    
    // Create tracker with loaded questions
    console.log('🔧 Creating tracker with', questionTexts.length, 'questions')
    questionTracker = useNeverHaveIEverTracker(questionTexts)
    questionTracker.initializeTracker();
    
    console.log(`✅ Loaded ${questionTexts.length} Never Have I Ever questions`)
    console.log(`📈 Tracker stats: ${questionTracker.getUsageStats.value.totalQuestions} total questions`)
  } catch (error) {
    console.error('❌ Error loading Never Have I Ever questions:', error)
    console.error('Error details:', error.message, error.stack)
    // Don't use fallback - rethrow error so it can be handled in onMounted
    throw error
  }
}

onMounted(async () => {
  if (typeof window !== "undefined") {
    // Track page view
    trackPageView('never-have-i-ever');
    
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
    if (!gameStore.selectedGame) {
      gameStore.setSelectedGame('never-have-i-ever');
    }
    
    // Load questions from database
    try {
      await loadQuestions()
      
      // In multiplayer, wait for host to start game
      if (isMultiplayer.value) {
        if (isHost.value && roomState.value.gamePhase === 'playing') {
          const result = questionTracker.getNextQuestion();
          question.value = { text: result.question };
          questionCount.value++;
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
  33% {
    transform: translateY(-15px) rotate(3deg);
  }
  66% {
    transform: translateY(10px) rotate(-3deg);
  }
}

.animate-float {
  animation: float 7s ease-in-out infinite;
}

@keyframes bounce-slow {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-10px);
  }
}

.animate-bounce-slow {
  animation: bounce-slow 2s ease-in-out infinite;
}

/* Flip transition */
.flip-enter-active {
  animation: flip-in 0.6s cubic-bezier(0.68, -0.55, 0.27, 1.55);
}

.flip-leave-active {
  animation: flip-out 0.4s ease-in;
}

@keyframes flip-in {
  0% {
    transform: rotateY(90deg) scale(0.8);
    opacity: 0;
  }
  50% {
    transform: rotateY(-10deg) scale(1.05);
  }
  100% {
    transform: rotateY(0) scale(1);
    opacity: 1;
  }
}

@keyframes flip-out {
  0% {
    transform: rotateY(0) scale(1);
    opacity: 1;
  }
  100% {
    transform: rotateY(-90deg) scale(0.8);
    opacity: 0;
  }
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

/* Shake animation */
@keyframes shake {
  0%, 100% {
    transform: translateX(0);
  }
  10%, 30%, 50%, 70%, 90% {
    transform: translateX(-5px);
  }
  20%, 40%, 60%, 80% {
    transform: translateX(5px);
  }
}

.animate-shake {
  animation: shake 0.5s ease-in-out;
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


