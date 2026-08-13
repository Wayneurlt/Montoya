<template>
  <div
    class="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 text-white p-3 sm:p-4 relative overflow-x-hidden overflow-y-auto safe-bottom"
  >
    <!-- Background Icons Pattern -->
    <BackgroundIcons />

    <!-- Main Game Container -->
    <div
      class="max-w-3xl mx-auto bg-white/10 backdrop-blur-md rounded-xl sm:rounded-2xl p-4 sm:p-5 md:p-6 lg:p-8 shadow-2xl relative z-10"
    >
      <!-- Header -->
      <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-0 mb-6">
        <div class="flex gap-2 w-full sm:w-auto">
          <NuxtLink to="/" class="bg-white/10 hover:bg-white/20 backdrop-blur-md px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl transition-all duration-300 flex items-center gap-1.5 sm:gap-2 border border-white/20 hover:scale-105 shadow-lg text-sm sm:text-base flex-1 sm:flex-initial justify-center sm:justify-start">
            <Icon icon="mdi:home" class="w-4 h-4 sm:w-5 sm:h-5" />
            <span class="font-medium">Home</span>
          </NuxtLink>
          <NuxtLink to="/setup?step=game-selection" class="bg-white/10 hover:bg-white/20 backdrop-blur-md px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl transition-all duration-300 flex items-center gap-1.5 sm:gap-2 border border-white/20 hover:scale-105 shadow-lg text-sm sm:text-base flex-1 sm:flex-initial justify-center sm:justify-start">
            <Icon icon="mdi:arrow-left" class="w-4 h-4 sm:w-5 sm:h-5" />
            <span class="font-medium">Back</span>
          </NuxtLink>
        </div>

        <div class="flex items-center gap-2 w-full sm:w-auto justify-center sm:justify-end">
          <span
            class="text-xs sm:text-sm px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full border shadow-md"
            :class="
              gameMode === 'free-for-all'
                ? 'bg-purple-500/20 text-purple-300 border-purple-400/30'
                : gameMode === 'relationship'
                ? 'bg-pink-500/20 text-pink-300 border-pink-400/30'
                : 'bg-cyan-500/20 text-cyan-300 border-cyan-400/30'
            "
          >
            {{ gameMode === "free-for-all" ? "Free-for-All" : gameMode === "relationship" ? "Paired" : "Teams" }}
          </span>
        </div>
      </div>
      
      <!-- Game Title -->
      <div class="text-center mb-8">
        <h1
          class="text-4xl sm:text-5xl md:text-6xl font-black mb-4 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-pink-500 to-cyan-400 drop-shadow-2xl"
        >
          Truth or Dare
        </h1>
        <p class="text-purple-200/80 text-sm font-medium">Choose your challenge and answer honestly!</p>
      </div>

      <!-- Current Player -->
      <div class="bg-white/5 rounded-xl p-4 mb-6 border border-white/10">
        <div class="text-center">
          <div class="text-sm text-white/60 mb-1">Current Turn</div>
          <div class="text-xl font-bold flex items-center justify-center gap-2 min-w-0">
            <span class="truncate">{{ currentPlayer?.name }}</span>
            <span class="text-2xl flex-shrink-0">{{ currentPlayer?.gender === 'male' ? '♂' : '♀' }}</span>
          </div>
        </div>
      </div>

      <!-- Intensity Toggle - Improved -->
      <div class="mb-6">
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

      <!-- Error State -->
      <div v-if="questionsError" class="mb-6 bg-red-500/20 border border-red-400/30 rounded-xl p-4">
        <div class="flex items-start gap-3">
          <Icon icon="mdi:alert-circle" class="w-6 h-6 text-red-400 flex-shrink-0 mt-0.5" />
          <div>
            <p class="font-bold text-red-300 mb-1">Questions Not Loaded</p>
            <p class="text-sm text-red-200/80 mb-2">{{ questionsError }}</p>
            <p class="text-xs text-red-200/60">Using fallback questions. Please seed your database with questions.</p>
          </div>
        </div>
      </div>

      <!-- Question Display Card - Enhanced -->
      <div v-if="currentCard && cardFlipped" class="mb-6">
        <div class="bg-gradient-to-br rounded-3xl p-8 md:p-12 shadow-2xl border-2 relative overflow-hidden min-h-[200px] flex items-center justify-center"
          :class="currentCard.type === 'TRUTH' 
            ? 'from-blue-950/60 to-cyan-950/60 border-blue-500/30' 
            : 'from-pink-950/60 to-red-950/60 border-pink-500/30'">
          <!-- Decorative elements -->
          <div class="absolute top-0 right-0 w-32 h-32 rounded-bl-full"
            :class="currentCard.type === 'TRUTH' 
              ? 'bg-gradient-to-br from-blue-600/20 to-transparent' 
              : 'bg-gradient-to-br from-pink-600/20 to-transparent'"></div>
          <div class="absolute bottom-0 left-0 w-32 h-32 rounded-tr-full"
            :class="currentCard.type === 'TRUTH' 
              ? 'bg-gradient-to-tr from-cyan-600/20 to-transparent' 
              : 'bg-gradient-to-tr from-red-600/20 to-transparent'"></div>
          
          <div class="text-center relative z-10 w-full">
            <!-- Type Badge -->
            <div class="mb-6 flex justify-center">
              <div class="inline-flex items-center gap-3 px-6 py-3 rounded-full font-black text-lg shadow-lg"
                :class="currentCard.type === 'TRUTH' 
                  ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white' 
                  : 'bg-gradient-to-r from-pink-600 to-red-600 text-white'">
                <Icon :icon="currentCard.type === 'TRUTH' ? 'mdi:chat-question' : 'mdi:fire'" class="w-6 h-6" />
                {{ currentCard.type === 'TRUTH' ? 'TRUTH' : 'DARE' }}
              </div>
            </div>
            
            <!-- Question Text -->
            <p class="text-2xl md:text-4xl font-bold mb-6 leading-relaxed px-4 text-white drop-shadow-lg">
              {{ currentCard.text }}
            </p>
            
            <!-- Target (if applicable) -->
            <div v-if="currentCard.target" class="bg-white/10 rounded-xl p-4 max-w-sm mx-auto border border-white/20">
              <p class="text-base font-medium flex items-center justify-center gap-2 text-white">
                <Icon icon="mdi:account-arrow-right" class="w-5 h-5" />
                To: {{ currentCard.target.name }}
                <span class="text-xl">{{ currentCard.target.gender === "male" ? "♂" : "♀" }}</span>
              </p>
            </div>
            
            <!-- Decorative underline -->
            <div class="mt-6 flex justify-center">
              <div class="h-1 w-24 rounded-full"
                :class="currentCard.type === 'TRUTH' 
                  ? 'bg-gradient-to-r from-blue-600 via-cyan-600 to-blue-600' 
                  : 'bg-gradient-to-r from-pink-600 via-red-600 to-pink-600'"></div>
            </div>
          </div>
        </div>
      </div>

      <!-- Action Buttons -->
      <div v-if="!currentCard || !cardFlipped" class="grid grid-cols-2 gap-4 mb-6">
        <button
          @click="drawSpecificCard('TRUTH')"
          :disabled="isDrawing || questionsLoading"
          class="bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-700 hover:to-cyan-700 py-6 rounded-xl font-bold text-lg transition-all flex flex-col items-center justify-center gap-2 shadow-lg hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed border-2 border-purple-500/30 relative overflow-hidden"
        >
          <div v-if="isDrawing && selectedCardType === 'TRUTH'" class="absolute inset-0 flex items-center justify-center bg-black/20">
            <Icon icon="svg-spinners:3-dots-fade" class="w-8 h-8" />
          </div>
          <Icon v-else icon="mdi:chat-question" class="w-8 h-8" />
          <span>Truth</span>
        </button>
        <button
          @click="drawSpecificCard('DARE')"
          :disabled="isDrawing || questionsLoading"
          class="bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 py-6 rounded-xl font-bold text-lg transition-all flex flex-col items-center justify-center gap-2 shadow-lg hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed border-2 border-pink-500/30 relative overflow-hidden"
        >
          <div v-if="isDrawing && selectedCardType === 'DARE'" class="absolute inset-0 flex items-center justify-center bg-black/20">
            <Icon icon="svg-spinners:3-dots-fade" class="w-8 h-8" />
          </div>
          <Icon v-else icon="mdi:fire" class="w-8 h-8" />
          <span>Dare</span>
        </button>
      </div>

      <!-- Complete/Reset Buttons -->
      <div v-if="currentCard && cardFlipped" class="grid grid-cols-1 gap-3 mb-6">
          <button
            @click="completeChallenge"
          class="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 py-4 rounded-xl font-bold text-lg transition-all flex items-center justify-center gap-2 shadow-lg"
          >
          <Icon icon="mdi:check-bold" class="w-6 h-6" />
            Challenge Completed!
          </button>
          <button
            @click="resetCard"
          class="w-full bg-white/10 hover:bg-white/20 py-3 rounded-xl font-medium transition-all flex items-center justify-center gap-2 border border-white/20"
          >
          <Icon icon="mdi:refresh" class="w-5 h-5" />
            Choose Different Card
          </button>
      </div>

      <!-- Hesitation Timer -->
      <div v-if="currentCard && cardFlipped" class="bg-white/5 rounded-xl p-4 mb-6 border border-white/10">
        <div class="flex justify-between items-center mb-2">
          <div class="flex items-center gap-2">
            <Icon icon="mdi:timer-sand" class="w-5 h-5 text-pink-300" />
            <span class="font-medium">Hesitation Timer</span>
          </div>
          <span
            class="font-bold text-lg"
            :class="hesitationTime <= 5 ? 'text-red-400' : 'text-cyan-400'"
          >
            {{ hesitationTime }}s
          </span>
        </div>
        <div class="w-full h-2 bg-white/20 rounded-full overflow-hidden">
          <div
            class="h-full bg-gradient-to-r from-pink-500 to-purple-500 transition-all duration-1000 ease-linear"
            :style="{ width: hesitationPercent + '%' }"
          ></div>
        </div>
      </div>

      <!-- Game Log -->
      <div class="bg-white/5 rounded-xl p-4 max-h-40 overflow-y-auto border border-white/10">
        <h3 class="font-semibold text-sm mb-3 flex items-center gap-2">
          <Icon icon="mdi:history" class="w-5 h-5" />
          <span>Game Log</span>
        </h3>
        <ul class="space-y-2 text-xs">
          <li
            v-for="(log, index) in gameHistory"
            :key="index"
            class="py-2 px-3 rounded-lg bg-white/5"
          >
            <div class="flex items-start gap-2">
              <Icon
                icon="mdi:information"
                class="w-4 h-4 mt-0.5 flex-shrink-0 text-pink-300"
              />
              <span class="break-words">{{ log }}</span>
            </div>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, watch } from "vue";
import { Icon } from "@iconify/vue";
import { useTruthTracker, useDareTracker } from "~/composables/useQuestionTracker";
import { useAnalytics } from "~/composables/useAnalytics";
import { useGameStore } from "~/stores/game";
import { useGameLogic } from "~/composables/useGameLogic";
import { navigateTo } from "#app";

// Game Configuration
const MAX_HESITATION_TIME = 15;

// Game Store Integration
const gameStore = useGameStore();
const gameLogic = useGameLogic();

// State
const currentCard = ref(null);
const cardFlipped = ref(false);
const gameHistory = ref([]);
const hesitationTime = ref(MAX_HESITATION_TIME);
const hesitationTimer = ref(null);
const hesitationPercent = ref(100);
const isDrawing = ref(false);
const isSpicyMode = ref(false);
const selectedCardType = ref('');
const questionsLoading = ref(false);
const questionsError = ref(null);

// Initialize question trackers
let normalTruthTracker = null;
let spicyTruthTracker = null;
let normalDareTracker = null;
let spicyDareTracker = null;

// Initialize analytics
const { trackPageView, updateActivity } = useAnalytics();

// Computed Properties
const gameMode = computed(() => gameStore.gameMode || 'free-for-all');
const players = computed(() => gameStore.players);
const currentPlayer = computed(() => gameStore.currentPlayer);

// Question Selection Logic - Use ONLY database questions, no icebreakers or adaptations
const getRandomQuestion = (type) => {
  console.log(`🎯 getRandomQuestion called with type: ${type}, isSpicyMode: ${isSpicyMode.value}`)
  
  // NO ICEBREAKERS - Use only database questions
  // if (gameLogic.shouldUseIcebreaker()) {
  //   const icebreaker = gameLogic.getIcebreakerPrompt(type);
  //   if (icebreaker) {
  //     console.log('🧊 Returning icebreaker prompt')
  //     return icebreaker;
  //   }
  // }
  
  let tracker;
  
  if (type === "TRUTH") {
    tracker = isSpicyMode.value ? spicyTruthTracker : normalTruthTracker;
    console.log(`📚 Using ${isSpicyMode.value ? 'spicy' : 'normal'} TRUTH tracker`)
  } else if (type === "DARE") {
    tracker = isSpicyMode.value ? spicyDareTracker : normalDareTracker;
    console.log(`📚 Using ${isSpicyMode.value ? 'spicy' : 'normal'} DARE tracker`)
  } else {
    console.error(`❌ Unknown type: ${type}`)
    return 'Invalid question type';
  }
  
  if (!tracker) {
    console.warn(`⚠️ ${type} tracker not ready yet`)
    return 'Questions are loading... Please try again in a moment.';
  }
  
  const result = tracker.getNextQuestion();
  let question = result.question;
  
  console.log(`✅ Got question from ${type} tracker:`, question.substring(0, 50) + '...')
  
  // DON'T ADAPT QUESTIONS - Use them exactly as they are from the database
  // const intensity = isSpicyMode.value ? 4 : 2;
  // question = gameLogic.adaptPrompt(question, intensity);
  
  return question;
};

const getRandomTarget = () => {
  return gameLogic.getTargetPlayer();
};

const drawSpecificCard = async (type) => {
  console.log(`🎴 drawSpecificCard called with type: ${type}`)
  
  if (isDrawing.value || (currentCard.value && currentCard.value.type !== type)) {
    console.log('⏸️ Card draw blocked - already drawing or wrong type')
    return;
  }
  
  updateActivity();
  
  isDrawing.value = true;
  selectedCardType.value = type;
  cardFlipped.value = false;

  let target = null;
  if (type === "DARE" && gameStore.gameMode !== 'connection' && players.value.length > 1) {
    target = getRandomTarget();
    console.log(`🎯 Dare target selected:`, target?.name)
  }

  console.log(`🔍 Fetching ${type} question...`)
  const content = getRandomQuestion(type);
  console.log(`📝 Question content received (type: ${type}):`, content.substring(0, 50) + '...')

  // Double-check: ensure the type matches what was requested
  if (!content || content === 'Questions are loading... Please try again in a moment.') {
    console.error(`❌ Failed to get ${type} question!`)
  }

  currentCard.value = {
    type: type, // Explicitly set the type to what was requested
    text: content,
    target,
  };
  
  console.log(`✅ Card set with type: ${currentCard.value.type} (requested: ${type}), text preview: ${currentCard.value.text.substring(0, 50)}...`)
  
  // Final verification
  if (currentCard.value.type !== type) {
    console.error(`❌ TYPE MISMATCH! Requested ${type} but card type is ${currentCard.value.type}`)
  }

  gameStore.addPromptToHistory(content);

  setTimeout(() => {
    cardFlipped.value = true;
    startHesitationTimer();
    isDrawing.value = false;
    console.log(`🃏 Card flipped! Type: ${currentCard.value.type}`)
  }, 500);
};

const resetCard = () => {
  currentCard.value = null;
  cardFlipped.value = false;
  selectedCardType.value = '';
  resetHesitationTimer();
};

const startHesitationTimer = () => {
  resetHesitationTimer();
  hesitationTimer.value = setInterval(() => {
    hesitationTime.value--;
    hesitationPercent.value = (hesitationTime.value / MAX_HESITATION_TIME) * 100;

    if (hesitationTime.value <= 0) {
      clearInterval(hesitationTimer.value);
      gameHistory.value.unshift(`${currentPlayer.value.name} hesitated too long!`);
      nextTurn();
    }
  }, 1000);
};

const resetHesitationTimer = () => {
  clearInterval(hesitationTimer.value);
  hesitationTime.value = MAX_HESITATION_TIME;
  hesitationPercent.value = 100;
};

const completeChallenge = () => {
  if (!currentCard.value) return;
  resetHesitationTimer();
  gameHistory.value.unshift(`${currentPlayer.value?.name} completed: ${currentCard.value.text}`);
  gameLogic.completeRound();
  nextTurn();
};

const nextTurn = () => {
  currentCard.value = null;
  cardFlipped.value = false;
  selectedCardType.value = '';
};

// Load questions from database
async function loadQuestions() {
  questionsLoading.value = true;
  questionsError.value = null;
  
  try {
    console.log('🔄 Loading questions from database...')
    
    const truthResponse = await $fetch('/api/questions/truth-or-dare?type=TRUTH&limit=200')
      .catch(error => {
        console.error('❌ Truth API call failed:', error)
        throw new Error(`Failed to fetch truth questions: ${error.message || 'Unknown error'}`)
      })
    
    console.log('✅ Truth API response:', truthResponse)
    
    if (!truthResponse || !truthResponse.questions) {
      console.error('❌ Invalid truth API response structure:', truthResponse)
      throw new Error('Invalid truth API response structure')
    }
    
    const allTruthQuestions = truthResponse.questions || []
    
    if (!Array.isArray(allTruthQuestions)) {
      throw new Error('Truth questions is not an array')
    }
    
    if (allTruthQuestions.length === 0) {
      throw new Error('No truth questions returned from API')
    }
    
    const dareResponse = await $fetch('/api/questions/truth-or-dare?type=DARE&limit=200')
      .catch(error => {
        console.error('❌ Dare API call failed:', error)
        throw new Error(`Failed to fetch dare questions: ${error.message || 'Unknown error'}`)
      })
    
    console.log('✅ Dare API response:', dareResponse)
    
    if (!dareResponse || !dareResponse.questions) {
      console.error('❌ Invalid dare API response structure:', dareResponse)
      throw new Error('Invalid dare API response structure')
    }
    
    const allDareQuestions = dareResponse.questions || []
    
    if (!Array.isArray(allDareQuestions)) {
      throw new Error('Dare questions is not an array')
    }
    
    if (allDareQuestions.length === 0) {
      throw new Error('No dare questions returned from API')
    }
    
    console.log(`✅ Successfully received ${allTruthQuestions.length} truth and ${allDareQuestions.length} dare questions`)
    
    const normalTruths = allTruthQuestions
      .filter(q => {
        if (!q || typeof q !== 'object') return false;
        // Use consistent default of 2 for missing intensity
        const intensity = q.intensity ?? 2;
        return intensity <= 3;
      })
      .map(q => q.text || String(q))
    
    const spicyTruths = allTruthQuestions
      .filter(q => {
        if (!q || typeof q !== 'object') return false;
        // Use consistent default of 2 for missing intensity (same as normal)
        const intensity = q.intensity ?? 2;
        return intensity >= 4;
      })
      .map(q => q.text || String(q))
    
    const normalDares = allDareQuestions
      .filter(q => {
        if (!q || typeof q !== 'object') return false;
        // Use consistent default of 2 for missing intensity
        const intensity = q.intensity ?? 2;
        const isNormal = intensity <= 3;
        if (!isNormal) {
          console.log(`🚫 Excluding dare from normal (intensity ${intensity}): ${q.text?.substring(0, 50)}...`);
        }
        return isNormal;
      })
      .map(q => {
        if (q.type !== 'DARE') {
          console.warn(`⚠️ WARNING: Found non-DARE question in dare response:`, q);
        }
        return q.text || String(q);
      })
    
    const spicyDares = allDareQuestions
      .filter(q => {
        if (!q || typeof q !== 'object') return false;
        // Use consistent default of 2 for missing intensity (same as normal)
        const intensity = q.intensity ?? 2;
        const isSpicy = intensity >= 4;
        if (!isSpicy) {
          console.log(`🚫 Excluding dare from spicy (intensity ${intensity}): ${q.text?.substring(0, 50)}...`);
        }
        return isSpicy;
      })
      .map(q => {
        if (q.type !== 'DARE') {
          console.warn(`⚠️ WARNING: Found non-DARE question in dare response:`, q);
        }
        return q.text || String(q);
      })
    
    console.log(`📊 Question distribution:`)
    console.log(`- Normal Truths: ${normalTruths.length}`)
    console.log(`- Spicy Truths: ${spicyTruths.length}`)
    console.log(`- Normal Dares: ${normalDares.length}`)
    console.log(`- Spicy Dares: ${spicyDares.length}`)
    
    // Log sample questions to verify they're correct
    if (normalTruths.length > 0) {
      console.log(`📝 Sample Normal Truth: ${normalTruths[0]}`)
    }
    if (normalDares.length > 0) {
      console.log(`📝 Sample Normal Dare: ${normalDares[0]}`)
    }
    if (spicyDares.length > 0) {
      console.log(`📝 Sample Spicy Dare: ${spicyDares[0]}`)
    }
    
    if (normalTruths.length === 0 && spicyTruths.length === 0 && normalDares.length === 0 && spicyDares.length === 0) {
      questionsError.value = 'No questions found in database. Please seed your database with questions.';
      throw new Error('No questions found in database')
    }
    
    // Use what we have - don't use fallbacks
    if (normalTruths.length === 0 && spicyTruths.length === 0) {
      questionsError.value = 'No truth questions found in database.';
      throw new Error('No truth questions found')
    }
    
    if (normalDares.length === 0 && spicyDares.length === 0) {
      questionsError.value = 'No dare questions found in database.';
      throw new Error('No dare questions found')
    }
    
    // Verify we have actual dare questions
    console.log(`🔍 Verifying dare questions:`)
    console.log(`- Normal dares array length: ${normalDares.length}`)
    console.log(`- Spicy dares array length: ${spicyDares.length}`)
    if (normalDares.length > 0) {
      console.log(`- First normal dare: "${normalDares[0]}"`)
    }
    if (spicyDares.length > 0) {
      console.log(`- First spicy dare: "${spicyDares[0]}"`)
    }
    
    // Use actual questions from database - no fallbacks
    // If one category is empty, use the other (but prefer the correct category)
    normalTruthTracker = useTruthTracker(normalTruths.length > 0 ? normalTruths : (spicyTruths.length > 0 ? spicyTruths : []), false);
    spicyTruthTracker = useTruthTracker(spicyTruths.length > 0 ? spicyTruths : (normalTruths.length > 0 ? normalTruths : []), true);
    normalDareTracker = useDareTracker(normalDares.length > 0 ? normalDares : (spicyDares.length > 0 ? spicyDares : []), false);
    spicyDareTracker = useDareTracker(spicyDares.length > 0 ? spicyDares : (normalDares.length > 0 ? normalDares : []), true);
    
    // Verify trackers were created
    if (!normalTruthTracker || !spicyTruthTracker || !normalDareTracker || !spicyDareTracker) {
      throw new Error('Failed to create question trackers')
    }
    
    console.log(`✅ Dare trackers created:`)
    console.log(`- Normal dare tracker has ${normalDareTracker.getUsageStats.value.totalQuestions} questions`)
    console.log(`- Spicy dare tracker has ${spicyDareTracker.getUsageStats.value.totalQuestions} questions`)
    
    normalTruthTracker.initializeTracker();
    spicyTruthTracker.initializeTracker();
    normalDareTracker.initializeTracker();
    spicyDareTracker.initializeTracker();
    
    console.log(`✅ Successfully loaded and initialized question trackers`)
    console.log(`📈 Final tracker stats:`)
    console.log(`- Normal Truths: ${normalTruthTracker.getUsageStats.value.totalQuestions}`)
    console.log(`- Spicy Truths: ${spicyTruthTracker.getUsageStats.value.totalQuestions}`)
    console.log(`- Normal Dares: ${normalDareTracker.getUsageStats.value.totalQuestions}`)
    console.log(`- Spicy Dares: ${spicyDareTracker.getUsageStats.value.totalQuestions}`)
    
    // Final verification - ensure we have at least some questions
    if (normalTruthTracker.getUsageStats.value.totalQuestions === 0 && 
        spicyTruthTracker.getUsageStats.value.totalQuestions === 0) {
      throw new Error('No truth questions available in trackers')
    }
    if (normalDareTracker.getUsageStats.value.totalQuestions === 0 && 
        spicyDareTracker.getUsageStats.value.totalQuestions === 0) {
      throw new Error('No dare questions available in trackers')
    }
  } catch (error) {
    console.error('❌ Error loading questions from database:', error)
    console.error('Full error details:', error)
    questionsError.value = error.message || 'Failed to load questions from database. Please refresh the page or contact support.';
    // Don't use fallback - show error to user
  } finally {
    questionsLoading.value = false;
  }
}

// Lifecycle Hooks
onMounted(async () => {
  if (typeof window !== "undefined") {
    trackPageView('truth-or-dare');
    
    gameStore.loadFromLocalStorage();
    
    if (gameStore.players.length === 0) {
      const savedSession = localStorage.getItem("gameSession");
      let session = null;
      if (savedSession) {
        try {
          session = JSON.parse(savedSession);
        } catch (e) {
          console.error("Failed to parse saved game session:", e);
        }
      }
      if (session) {
        gameStore.setGameMode(session.mode || "free-for-all");
        gameStore.setPlayers(session.players || []);
      } else {
        await navigateTo('/setup?game=truth-or-dare');
        return;
      }
    }
    
    if (!gameStore.selectedGame) {
      gameStore.setSelectedGame('truth-or-dare');
    }
    
    if (!gameStore.gameMode) {
      await navigateTo('/setup?game=truth-or-dare');
      return;
    }
    
    await loadQuestions();
    
    if (gameStore.isTwoPlayerMode) {
      gameLogic.checkMirrorRound();
      gameLogic.checkGuessMode();
    }
  }
});

onBeforeUnmount(() => {
  clearInterval(hesitationTimer.value);
});
</script>

<style scoped>
/* Smooth transitions */
button, div {
  transition: all 0.3s ease;
}
</style>
