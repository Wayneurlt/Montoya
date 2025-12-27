<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 text-white p-3 sm:p-4 relative overflow-hidden">
    <!-- Background Icons Pattern -->
    <BackgroundIcons />

    <div class="max-w-4xl mx-auto relative z-10 pt-4 sm:pt-6 md:pt-8">
      <!-- Header with Home Button -->
      <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-0 mb-6 sm:mb-8">
        <NuxtLink to="/" class="bg-white/10 hover:bg-white/20 backdrop-blur-md px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl transition-all duration-300 flex items-center gap-1.5 sm:gap-2 border border-white/20 hover:scale-105 text-sm sm:text-base w-full sm:w-auto justify-center sm:justify-start">
          <Icon icon="mdi:home" class="w-4 h-4 sm:w-5 sm:h-5" />
          <span class="font-medium">Home</span>
        </NuxtLink>
        
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

      <!-- Icebreaker Banner -->
      <div v-if="groupGame.showIcebreaker" class="mb-2 sm:mb-3 md:mb-4 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 border-2 border-blue-400/50 rounded-lg sm:rounded-xl p-2 sm:p-3 md:p-4">
        <div class="flex items-center gap-1.5 sm:gap-2 md:gap-3">
          <Icon icon="mdi:ice-cream" class="w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8 text-cyan-400 flex-shrink-0" />
          <div>
            <h4 class="font-bold text-xs sm:text-sm md:text-base lg:text-lg">Icebreaker Round</h4>
            <p class="text-[10px] sm:text-xs md:text-sm text-white/80">Starting with a light, conversation-friendly prompt</p>
          </div>
        </div>
      </div>

      <!-- Main Question Card -->
      <div class="mb-3 sm:mb-4 md:mb-6">
        <div class="bg-gradient-to-br from-purple-950/60 to-black/90 backdrop-blur-xl rounded-xl sm:rounded-2xl md:rounded-3xl p-3 sm:p-4 md:p-6 lg:p-8 xl:p-12 shadow-2xl border-2 border-purple-700/30 relative overflow-hidden min-h-[180px] sm:min-h-[220px] md:min-h-[250px] lg:min-h-[300px] flex items-center justify-center">
          <!-- Decorative elements -->
          <div class="absolute top-0 left-0 w-40 h-40 bg-gradient-to-br from-purple-600/20 to-transparent rounded-full blur-3xl"></div>
          <div class="absolute bottom-0 right-0 w-40 h-40 bg-gradient-to-tl from-pink-600/20 to-transparent rounded-full blur-3xl"></div>
          
          <transition name="flip" mode="out-in">
            <div :key="`question-${question?.text ?? 'none'}`" class="text-center relative z-10 w-full">
              <!-- Finger pointing icon -->
              <div class="mb-2 sm:mb-3 md:mb-4 flex justify-center">
                <div class="bg-gradient-to-br from-purple-600 to-pink-700 p-2 sm:p-3 md:p-4 lg:p-5 rounded-lg sm:rounded-xl md:rounded-2xl shadow-2xl shadow-purple-900/50 transform hover:rotate-12 transition-transform">
                  <Icon icon="mdi:hand-pointing-right" class="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 lg:w-14 lg:h-14 animate-bounce-slow" />
                </div>
              </div>
              
              <!-- Never Have I Ever prefix -->
              <div class="mb-2 sm:mb-3 md:mb-4">
                <span class="inline-block bg-gradient-to-r from-purple-600/40 to-pink-600/40 px-2 sm:px-3 md:px-4 lg:px-6 py-1 sm:py-1.5 md:py-2 rounded-full text-xs sm:text-sm md:text-base lg:text-lg font-bold border border-purple-500/50">
                  Never Have I Ever...
                </span>
              </div>
              
              <!-- Question Text -->
              <p class="text-base sm:text-lg md:text-xl lg:text-2xl xl:text-4xl font-bold leading-relaxed px-2 sm:px-4 text-white drop-shadow-2xl">
                {{ question?.text || 'Ready to confess your secrets?' }}
              </p>

              <!-- Decorative dots -->
              <div class="mt-8 flex justify-center gap-2">
                <div class="h-2 w-2 bg-cyan-400 rounded-full animate-ping"></div>
                <div class="h-2 w-2 bg-blue-400 rounded-full animate-ping" style="animation-delay: 0.2s;"></div>
                <div class="h-2 w-2 bg-purple-400 rounded-full animate-ping" style="animation-delay: 0.4s;"></div>
              </div>
            </div>
          </transition>
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3 md:gap-4 mb-3 sm:mb-4 md:mb-6">
        <button 
          @click="fetchAnother" 
          class="group bg-gradient-to-r from-purple-700 to-pink-700 hover:from-purple-600 hover:to-pink-600 px-4 sm:px-6 py-3 sm:py-4 md:py-5 rounded-xl sm:rounded-2xl font-bold text-sm sm:text-base md:text-lg flex items-center justify-center gap-2 sm:gap-3 shadow-xl hover:shadow-purple-600/50 transition-all duration-300 transform hover:scale-105 border-2 border-purple-500/30"
        >
          <Icon icon="mdi:refresh" class="w-5 h-5 sm:w-6 sm:h-6 group-hover:rotate-180 transition-transform duration-500" />
          <span>Next</span>
        </button>
        
        <button 
          @click="markAsDone('yes')" 
          class="group bg-gradient-to-r from-pink-700 to-purple-700 hover:from-pink-600 hover:to-purple-600 px-4 sm:px-6 py-3 sm:py-4 md:py-5 rounded-xl sm:rounded-2xl font-bold text-sm sm:text-base md:text-lg flex items-center justify-center gap-2 sm:gap-3 shadow-xl hover:shadow-pink-600/50 transition-all duration-300 transform hover:scale-105 border-2 border-pink-500/30"
        >
          <Icon icon="mdi:check-circle" class="w-5 h-5 sm:w-6 sm:h-6 group-hover:scale-110 transition-transform" />
          <span>I Have!</span>
        </button>
        
        <button 
          @click="applyPenalty" 
          class="group bg-gradient-to-r from-purple-700 to-pink-700 hover:from-purple-600 hover:to-pink-600 px-4 sm:px-6 py-3 sm:py-4 md:py-5 rounded-xl sm:rounded-2xl font-bold text-sm sm:text-base md:text-lg flex items-center justify-center gap-2 sm:gap-3 shadow-xl hover:shadow-purple-600/50 transition-all duration-300 transform hover:scale-105 border-2 border-purple-500/30"
        >
          <Icon icon="mdi:glass-cocktail" class="w-5 h-5 sm:w-6 sm:h-6 group-hover:animate-bounce" />
          <span>Penalty</span>
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

      <!-- Game Stats Grid -->
      <div class="grid grid-cols-3 gap-1.5 sm:gap-2 md:gap-3 lg:gap-4">
        <div class="bg-black/40 backdrop-blur-md rounded-lg sm:rounded-xl p-3 sm:p-4 border border-purple-700/20 text-center hover:bg-purple-950/30 transition-all hover:scale-105">
          <Icon icon="mdi:comment-question" class="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 mx-auto mb-1 sm:mb-2 text-purple-500" />
          <p class="text-xl sm:text-2xl font-bold text-white">{{ questionCount }}</p>
          <p class="text-purple-200/60 text-[10px] sm:text-xs">Questions</p>
        </div>
        
        <div class="bg-black/40 backdrop-blur-md rounded-lg sm:rounded-xl p-3 sm:p-4 border border-pink-700/20 text-center hover:bg-pink-950/30 transition-all hover:scale-105">
          <Icon icon="mdi:check-decagram" class="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 mx-auto mb-1 sm:mb-2 text-pink-500" />
          <p class="text-xl sm:text-2xl font-bold text-white">{{ confessionCount }}</p>
          <p class="text-pink-200/60 text-[10px] sm:text-xs">Confessions</p>
        </div>
        
        <div class="bg-black/40 backdrop-blur-md rounded-lg sm:rounded-xl p-3 sm:p-4 border border-cyan-700/20 text-center hover:bg-cyan-950/30 transition-all hover:scale-105">
          <Icon icon="mdi:glass-cocktail" class="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 mx-auto mb-1 sm:mb-2 text-cyan-500" />
          <p class="text-xl sm:text-2xl font-bold text-white">{{ penaltyCount }}</p>
          <p class="text-cyan-200/60 text-[10px] sm:text-xs">Drinks</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { Icon } from '@iconify/vue';
import { useAnalytics } from '~/composables/useAnalytics';
// Questions are now loaded from database via API
import { useNeverHaveIEverTracker } from '~/composables/useQuestionTracker';
import { useGameStore } from '~/stores/game';
import { useGroupGame } from '~/composables/useGroupGame';

const question = ref(null);

// Game Store Integration
const gameStore = useGameStore();
const groupGame = useGroupGame();

// Initialize question tracker (will be populated from database)
let questionTracker = null;
const showPenalty = ref(false);
const penaltyMessage = ref('');

// Game statistics
const questionCount = ref(0);
const confessionCount = ref(0);
const penaltyCount = ref(0);

// Computed from store
const roundCount = computed(() => gameStore.currentRound);

// Initialize analytics
const { trackPageView, updateActivity } = useAnalytics();

const fetchAnother = () => {
  showPenalty.value = false;
  
  // Track user activity
  updateActivity();
  
  // Check for icebreaker
  const icebreaker = groupGame.getIcebreakerIfNeeded();
  if (icebreaker) {
    question.value = { text: icebreaker };
    groupGame.addToHistory(icebreaker);
    return;
  }
  
  if (!questionTracker) {
    question.value = { text: 'Questions are loading... Please wait.' };
    return;
  }
  
  const result = questionTracker.getNextQuestion();
  let questionText = result.question;
  
  // Adapt question for context
  const intensity = groupGame.getIntensityFilter();
  questionText = groupGame.adaptQuestion(questionText, intensity);
  
  // Log usage stats for debugging
  const stats = questionTracker.getUsageStats.value;
  console.log(`Never Have I Ever - Used: ${stats.usedCount}/${stats.totalQuestions} (${stats.usagePercentage}%)`);
  
  question.value = { text: questionText };
  questionCount.value++;
  groupGame.addToHistory(questionText);
  groupGame.completeRound();
};

const markAsDone = (response) => {
  if (response === 'yes') {
    confessionCount.value++;
  }
  
  // Track activity
  updateActivity();
  
  // Auto-advance to next question after a brief moment
  setTimeout(() => {
    fetchAnother();
  }, 500);
};

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
    
    // Get intensity filter from game context
    const intensity = groupGame.getIntensityFilter()
    const response = await $fetch(`/api/questions/group-game?gameType=NEVER_HAVE_I_EVER&intensity=${intensity}&limit=100`)
    console.log('Never Have I Ever API response:', response)
    const questions = response.questions || []
    
    // Create tracker with loaded questions
    questionTracker = useNeverHaveIEverTracker(questions.map(q => q.text))
    questionTracker.initializeTracker();
    
    console.log(`✅ Loaded ${questions.length} Never Have I Ever questions`)
  } catch (error) {
    console.error('❌ Error loading Never Have I Ever questions:', error)
    // Fallback questions
    questionTracker = useNeverHaveIEverTracker([
      'kissed someone in public',
      'lied to get out of trouble',
      'pretended to be sick to skip work/school',
      'stalked someone on social media',
      'sent a text to the wrong person'
    ])
    questionTracker.initializeTracker();
    console.log('⚠️ Using fallback Never Have I Ever questions')
  }
}

onMounted(async () => {
  if (typeof window !== "undefined") {
    // Track page view
    trackPageView('never-have-i-ever');
    
    // Load game state
    gameStore.loadFromLocalStorage();
    if (!gameStore.selectedGame) {
      gameStore.setSelectedGame('never-have-i-ever');
    }
    
    // Load questions from database
    await loadQuestions()
    fetchAnother();
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


