<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 text-white p-3 sm:p-4 relative overflow-hidden">
    <!-- Background Icons Pattern -->
    <BackgroundIcons />

    <div class="max-w-5xl mx-auto relative z-10 pt-4 sm:pt-6 md:pt-8">
      <!-- Header with Home Button -->
      <div class="flex justify-between items-center mb-8">
        <NuxtLink to="/" class="bg-white/10 hover:bg-white/20 backdrop-blur-md px-4 py-2 rounded-xl transition-all duration-300 flex items-center gap-2 border border-white/20 hover:scale-105">
          <Icon icon="mdi:home" class="w-5 h-5" />
          <span class="font-medium">Home</span>
        </NuxtLink>
        
        <div class="flex items-center gap-2">
          <div class="bg-white/10 backdrop-blur-md px-4 py-2 rounded-xl border border-white/20">
            <div class="text-xs text-white/60">Current Turn</div>
            <div class="text-sm font-bold flex items-center gap-1.5">
              <span>{{ currentPlayer?.name || 'Player' }}</span>
              <span class="text-base">{{ currentPlayer?.gender === 'male' ? '♂' : currentPlayer?.gender === 'female' ? '♀' : '' }}</span>
            </div>
          </div>
          <div class="bg-white/10 backdrop-blur-md px-4 py-2 rounded-xl border border-white/20">
            <div class="flex items-center gap-2">
              <Icon icon="mdi:head-question" class="w-5 h-5 text-fuchsia-300" />
              <span class="font-semibold">Round {{ roundCount }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Game Title Card -->
      <div class="text-center mb-12 transform hover:scale-105 transition-transform duration-300">
        <div class="inline-block bg-gradient-to-r from-black/70 to-red-950/60 backdrop-blur-md rounded-2xl px-8 py-4 border-2 border-red-700/40 shadow-2xl shadow-red-900/50">
          <h1 class="text-5xl md:text-6xl font-black bg-clip-text text-transparent bg-gradient-to-r from-rose-500 via-red-500 to-orange-500 mb-2">
            Would You Rather
          </h1>
          <p class="text-red-200/80 text-sm font-medium tracking-wide">Make impossible choices!</p>
        </div>
      </div>

      <!-- Main Question Card with Split Display -->
      <div class="mb-8">
        <div class="bg-gradient-to-br from-red-950/60 to-black/90 backdrop-blur-xl rounded-3xl p-6 md:p-8 shadow-2xl border-2 border-red-700/30 relative overflow-hidden">
          <!-- Decorative VS badge -->
          <div class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-20">
            <div class="bg-gradient-to-r from-red-700 to-orange-700 px-6 py-3 rounded-full shadow-2xl border-4 border-amber-500/40 rotate-12 animate-pulse-slow">
              <span class="text-2xl font-black">VS</span>
            </div>
          </div>
          
          <transition name="split" mode="out-in">
            <div :key="`question-${question?.text ?? 'none'}`" class="relative">
              <!-- Two-column layout for choices -->
              <div v-if="parsedQuestion" class="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8">
                <!-- Option A -->
                <div 
                  @click="selectOption('A')"
                  class="group cursor-pointer bg-gradient-to-br from-red-800/30 to-red-950/20 hover:from-red-800/40 hover:to-red-950/30 backdrop-blur-md rounded-2xl p-6 border-2 border-red-600/40 hover:border-red-500/70 transition-all duration-300 transform hover:scale-105 hover:-rotate-2 min-h-[200px] flex flex-col justify-center"
                  :class="{ 'ring-4 ring-red-500 scale-105': selectedOption === 'A' }"
                >
                  <div class="text-center">
                    <div class="mb-4">
                      <span class="inline-block bg-red-600 text-white px-4 py-2 rounded-full font-bold text-lg shadow-lg shadow-red-900/50">
                        Option A
                      </span>
                    </div>
                    <p class="text-xl md:text-2xl font-bold text-white leading-relaxed">
                      {{ parsedQuestion.optionA }}
                    </p>
                    <div v-if="selectedOption === 'A'" class="mt-4">
                      <Icon icon="mdi:check-circle" class="w-8 h-8 text-orange-400 mx-auto animate-bounce" />
                    </div>
                  </div>
                </div>

                <!-- Option B -->
                <div 
                  @click="selectOption('B')"
                  class="group cursor-pointer bg-gradient-to-br from-orange-800/30 to-orange-950/20 hover:from-orange-800/40 hover:to-orange-950/30 backdrop-blur-md rounded-2xl p-6 border-2 border-orange-600/40 hover:border-orange-500/70 transition-all duration-300 transform hover:scale-105 hover:rotate-2 min-h-[200px] flex flex-col justify-center"
                  :class="{ 'ring-4 ring-orange-500 scale-105': selectedOption === 'B' }"
                >
                  <div class="text-center">
                    <div class="mb-4">
                      <span class="inline-block bg-orange-600 text-white px-4 py-2 rounded-full font-bold text-lg shadow-lg shadow-orange-900/50">
                        Option B
                      </span>
                    </div>
                    <p class="text-xl md:text-2xl font-bold text-white leading-relaxed">
                      {{ parsedQuestion.optionB }}
                    </p>
                    <div v-if="selectedOption === 'B'" class="mt-4">
                      <Icon icon="mdi:check-circle" class="w-8 h-8 text-amber-400 mx-auto animate-bounce" />
                    </div>
                  </div>
                </div>
              </div>

              <!-- Fallback for non-parsed questions -->
              <div v-else class="text-center py-12">
                <div class="mb-6 flex justify-center">
                  <div class="bg-gradient-to-br from-red-600 to-orange-700 p-5 rounded-2xl shadow-2xl shadow-red-900/50 animate-bounce-slow">
                    <Icon icon="mdi:help-circle" class="w-14 h-14" />
                  </div>
                </div>
                <p class="text-2xl md:text-3xl font-bold leading-relaxed px-4 text-white">
                  {{ question?.text || 'Ready for tough choices?' }}
                </p>
              </div>
            </div>
          </transition>
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <button 
          @click="fetchAnother" 
          class="group bg-gradient-to-r from-red-700 to-orange-700 hover:from-red-600 hover:to-orange-600 px-8 py-5 rounded-2xl font-bold text-lg flex items-center justify-center gap-3 shadow-xl hover:shadow-red-600/50 transition-all duration-300 transform hover:scale-105 border-2 border-red-500/30"
        >
          <Icon icon="mdi:refresh" class="w-6 h-6 group-hover:rotate-180 transition-transform duration-500" />
          <span>Next Dilemma</span>
        </button>
        
        <button 
          @click="applyPenalty" 
          class="group bg-gradient-to-r from-amber-700 to-red-700 hover:from-amber-600 hover:to-red-600 px-8 py-5 rounded-2xl font-bold text-lg flex items-center justify-center gap-3 shadow-xl hover:shadow-amber-600/50 transition-all duration-300 transform hover:scale-105 border-2 border-amber-500/30"
        >
          <Icon icon="mdi:glass-cocktail" class="w-6 h-6 group-hover:animate-bounce" />
          <span>Can't Decide? Drink!</span>
        </button>
      </div>

      <!-- Penalty Display -->
      <transition name="bounce-in">
        <div v-if="showPenalty" class="mb-8">
          <div class="bg-gradient-to-r from-red-500/30 to-orange-500/30 backdrop-blur-md border-2 border-red-400/50 rounded-2xl p-6 text-center shadow-2xl animate-pulse">
            <div class="flex items-center justify-center gap-3 mb-2">
              <Icon icon="mdi:bottle-wine" class="w-8 h-8 text-red-300" />
              <p class="text-red-200 font-bold text-xl">{{ penaltyMessage }}</p>
              <Icon icon="mdi:bottle-wine" class="w-8 h-8 text-red-300" />
            </div>
            <p class="text-red-300/70 text-sm mt-2">Indecision has consequences! 🍷</p>
          </div>
        </div>
      </transition>

      <!-- Game Stats Grid -->
      <div class="grid grid-cols-3 gap-4">
        <div class="bg-black/40 backdrop-blur-md rounded-xl p-4 border border-red-700/20 text-center hover:bg-red-950/30 transition-all hover:scale-105">
          <Icon icon="mdi:thought-bubble" class="w-8 h-8 mx-auto mb-2 text-red-500" />
          <p class="text-2xl font-bold text-white">{{ questionCount }}</p>
          <p class="text-red-200/60 text-xs">Dilemmas</p>
        </div>
        
        <div class="bg-black/40 backdrop-blur-md rounded-xl p-4 border border-orange-700/20 text-center hover:bg-orange-950/30 transition-all hover:scale-105">
          <Icon icon="mdi:vote" class="w-8 h-8 mx-auto mb-2 text-orange-500" />
          <p class="text-2xl font-bold text-white">{{ choicesMade }}</p>
          <p class="text-orange-200/60 text-xs">Decisions</p>
        </div>
        
        <div class="bg-black/40 backdrop-blur-md rounded-xl p-4 border border-amber-700/20 text-center hover:bg-amber-950/30 transition-all hover:scale-105">
          <Icon icon="mdi:glass-cocktail" class="w-8 h-8 mx-auto mb-2 text-amber-500" />
          <p class="text-2xl font-bold text-white">{{ penaltyCount }}</p>
          <p class="text-amber-200/60 text-xs">Penalties</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { Icon } from '@iconify/vue';
import { useAnalytics } from '~/composables/useAnalytics';
import { useGameStore } from '~/stores/game';
// Questions are now loaded from database via API
import { useWouldYouRatherTracker } from '~/composables/useQuestionTracker';

const gameStore = useGameStore();
const currentPlayer = computed(() => gameStore.currentPlayer);

const question = ref(null);

// Initialize question tracker
let questionTracker = null;
const showPenalty = ref(false);
const penaltyMessage = ref('');
const selectedOption = ref(null);

// Game statistics
const roundCount = ref(0);
const questionCount = ref(0);
const choicesMade = ref(0);
const penaltyCount = ref(0);

// Initialize analytics
const { trackPageView, updateActivity } = useAnalytics();

// Parse question to extract two options
const parsedQuestion = computed(() => {
  if (!question.value?.text) return null;
  
  const text = question.value.text.toLowerCase();
  
  // Try to find "or" to split the options
  const orIndex = text.indexOf(' or ');
  if (orIndex === -1) return null;
  
  // Remove "would you rather" prefix if present
  let cleanText = text;
  if (cleanText.startsWith('would you rather ')) {
    cleanText = cleanText.substring('would you rather '.length);
  }
  
  const parts = cleanText.split(' or ');
  if (parts.length < 2) return null;
  
  return {
    optionA: parts[0].trim().charAt(0).toUpperCase() + parts[0].trim().slice(1),
    optionB: parts.slice(1).join(' or ').trim().charAt(0).toUpperCase() + parts.slice(1).join(' or ').trim().slice(1)
  };
});

const selectOption = (option) => {
  selectedOption.value = option;
  choicesMade.value++;
  
  // Track activity
  updateActivity();
  
  // Auto-advance after selection
  setTimeout(() => {
    fetchAnother();
  }, 1000);
};

const fetchAnother = () => {
  showPenalty.value = false;
  selectedOption.value = null;
  
  // Track user activity
  updateActivity();
  
  if (!questionTracker) {
    question.value = { text: 'Questions are loading... Please wait.' };
    return;
  }
  
  const result = questionTracker.getNextQuestion();
  
  // Log usage stats for debugging
  const stats = questionTracker.getUsageStats.value;
  console.log(`Would You Rather - Used: ${stats.usedCount}/${stats.totalQuestions} (${stats.usagePercentage}%)`);
  
  question.value = { text: result.question };
  roundCount.value++;
  questionCount.value++;
};

const applyPenalty = () => {
  const penalties = [
    'Take 2 sips as penalty!',
    'Take a shot as penalty!',
    'Drink for 3 seconds straight!',
    'Take a large gulp as penalty!',
    'Finish your current drink!',
    'Down the whole thing!',
    'Take 4 big sips!',
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
    console.log('🔄 Loading Would You Rather questions from database...')
    const response = await $fetch('/api/questions/group-game?gameType=WOULD_YOU_RATHER&limit=100')
    console.log('Would You Rather API response:', response)
    const questions = response.questions || []
    
    // Create tracker with loaded questions
    questionTracker = useWouldYouRatherTracker(questions.map(q => q.text))
    questionTracker.initializeTracker();
    
    console.log(`✅ Loaded ${questions.length} Would You Rather questions`)
  } catch (error) {
    console.error('❌ Error loading Would You Rather questions:', error)
    // Fallback questions
    questionTracker = useWouldYouRatherTracker([
      'Would you rather have the ability to fly or be invisible?',
      'Would you rather be rich or famous?',
      'Would you rather live in the past or the future?',
      'Would you rather always be 10 minutes late or 20 minutes early?',
      'Would you rather have unlimited money or unlimited time?'
    ])
    questionTracker.initializeTracker();
    console.log('⚠️ Using fallback Would You Rather questions')
  }
}

onMounted(async () => {
  if (typeof window !== "undefined") {
    // Track page view
    trackPageView('would-you-rather');
    
    // Load game state
    gameStore.loadFromLocalStorage();
    
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
    transform: translateY(0) rotate(0deg) scale(1);
  }
  25% {
    transform: translateY(-12px) rotate(5deg) scale(1.05);
  }
  50% {
    transform: translateY(5px) rotate(-5deg) scale(0.95);
  }
  75% {
    transform: translateY(-8px) rotate(3deg) scale(1.02);
  }
}

.animate-float {
  animation: float 8s ease-in-out infinite;
}

@keyframes pulse-slow {
  0%, 100% {
    opacity: 1;
    transform: scale(1) rotate(12deg);
  }
  50% {
    opacity: 0.8;
    transform: scale(1.1) rotate(12deg);
  }
}

.animate-pulse-slow {
  animation: pulse-slow 2s ease-in-out infinite;
}

@keyframes bounce-slow {
  0%, 100% {
    transform: translateY(0) scale(1);
  }
  50% {
    transform: translateY(-15px) scale(1.1);
  }
}

.animate-bounce-slow {
  animation: bounce-slow 2.5s ease-in-out infinite;
}

/* Split transition */
.split-enter-active {
  animation: split-in 0.6s cubic-bezier(0.68, -0.55, 0.27, 1.55);
}

.split-leave-active {
  animation: split-out 0.4s ease-in;
}

@keyframes split-in {
  0% {
    transform: scale(0.5) rotateY(90deg);
    opacity: 0;
  }
  60% {
    transform: scale(1.05) rotateY(-5deg);
  }
  100% {
    transform: scale(1) rotateY(0);
    opacity: 1;
  }
}

@keyframes split-out {
  0% {
    transform: scale(1) rotateY(0);
    opacity: 1;
  }
  100% {
    transform: scale(0.5) rotateY(-90deg);
    opacity: 0;
  }
}

/* Bounce in animation */
.bounce-in-enter-active {
  animation: bounce-in 0.6s cubic-bezier(0.68, -0.55, 0.27, 1.55);
}

.bounce-in-leave-active {
  animation: bounce-out 0.3s ease-in;
}

@keyframes bounce-in {
  0% {
    transform: scale(0) translateY(-80px) rotate(-10deg);
    opacity: 0;
  }
  60% {
    transform: scale(1.15) translateY(0) rotate(5deg);
  }
  100% {
    transform: scale(1) translateY(0) rotate(0);
    opacity: 1;
  }
}

@keyframes bounce-out {
  0% {
    transform: scale(1) rotate(0);
    opacity: 1;
  }
  100% {
    transform: scale(0.7) rotate(-5deg);
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
  transition: background 0.3s;
}

::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.5);
}
</style>


