<template>
  <div
    class="min-h-screen bg-gradient-to-br from-purple-900 via-indigo-800 to-fuchsia-900 text-white p-4 relative overflow-hidden"
  >
    <!-- Animated background elements -->
    <ClientOnly>
      <div class="absolute inset-0 opacity-10 pointer-events-none">
        <div
          v-for="i in 20"
          :key="i"
          class="absolute rounded-full bg-pink-500 animate-float"
          :style="`left: ${Math.random() * 100}%; top: ${Math.random() * 100}%;
                     width: ${Math.random() * 10 + 2}px; height: ${
            Math.random() * 10 + 2
          }px;
                     animation-delay: ${Math.random() * 5}s;`"
        ></div>
      </div>
    </ClientOnly>

    <div
      class="max-w-2xl mx-auto bg-white/10 backdrop-blur-md rounded-xl p-6 md:p-8 shadow-2xl relative z-10"
    >
      <!-- Game Header -->
      <div class="text-center mb-6">
        <h1
          class="text-4xl md:text-5xl font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-pink-500 to-cyan-400"
        >
          Strip Truth or Dare
        </h1>
        <div class="flex justify-center items-center gap-3 flex-wrap mb-4">
          <span
            class="text-sm px-3 py-1 rounded-full"
            :class="
              gameMode === 'free-for-all'
                ? 'bg-pink-500/20 text-pink-300'
                : 'bg-cyan-500/20 text-cyan-300'
            "
          >
            {{
              gameMode === "free-for-all" ? "Free-for-All" : "Relationship Mode"
            }}
          </span>
          <span
            class="text-sm px-3 py-1 rounded-full bg-purple-500/20 text-purple-300"
          >
            Level {{ gameLevel }}
          </span>
        </div>
        
        <!-- Enhanced Spicy Mode Toggle -->
        <div class="bg-gradient-to-r from-white/5 to-white/10 rounded-xl p-5 border border-white/20 shadow-lg">
          <div class="flex items-center justify-center gap-2 mb-4">
            <Icon icon="mdi:fire" class="w-5 h-5 text-orange-400" />
            <h3 class="text-lg font-semibold text-white">Game Intensity</h3>
          </div>
          <div class="flex bg-gray-800/60 rounded-xl p-1.5 max-w-sm mx-auto shadow-inner">
            <button
              @click="isSpicyMode = false"
              class="flex-1 px-5 py-3 rounded-lg transition-all duration-300 text-sm font-semibold flex items-center justify-center gap-2 relative overflow-hidden"
              :class="
                !isSpicyMode
                  ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg transform scale-105'
                  : 'text-gray-300 hover:text-white hover:bg-white/5'
              "
            >
              <span class="text-base">😇</span>
              <span>Normal</span>
              <span v-if="!isSpicyMode" class="absolute inset-0 bg-white/20 animate-pulse rounded-lg"></span>
            </button>
            <button
              @click="isSpicyMode = true"
              class="flex-1 px-5 py-3 rounded-lg transition-all duration-300 text-sm font-semibold flex items-center justify-center gap-2 relative overflow-hidden"
              :class="
                isSpicyMode
                  ? 'bg-gradient-to-r from-red-500 to-rose-500 text-white shadow-lg transform scale-105'
                  : 'text-gray-300 hover:text-white hover:bg-white/5'
              "
            >
              <span class="text-base">🌶️</span>
              <span>Spicy</span>
              <span v-if="isSpicyMode" class="absolute inset-0 bg-white/20 animate-pulse rounded-lg"></span>
            </button>
          </div>
          <div class="text-center mt-4">
            <p class="text-sm font-medium" :class="isSpicyMode ? 'text-red-300' : 'text-green-300'">
              {{ isSpicyMode ? '🔥 Hot and steamy questions' : '✨ Playful and safe questions' }}
            </p>
            <p class="text-xs text-white/60 mt-1">
              {{ isSpicyMode ? 'For adventurous players' : 'Perfect for everyone' }}
            </p>
          </div>
        </div>
      </div>

      <!-- Top Bar: Turn + Compact Clothing Counter + Settings -->
      <div class="flex items-center justify-between mb-6">
        <div class="bg-white/5 rounded-xl px-4 py-3 border border-white/10">
          <div class="text-xs text-white/60">Current Turn</div>
          <div class="text-lg font-bold flex items-center gap-2">
            <span>{{ currentPlayer?.name }}</span>
            <span class="text-xl">{{ currentPlayer?.gender === 'male' ? '♂' : '♀' }}</span>
          </div>
        </div>

        <div class="flex items-center gap-3">
          <!-- Compact clothing chip -->
          <div class="flex items-center gap-1 bg-white/5 px-3 py-2 rounded-full border border-white/10 text-sm">
            <Icon icon="mdi:tshirt-crew" class="w-4 h-4" />
            <span class="font-semibold">{{ remainingClothing }}</span>
          </div>
          <!-- Settings button -->
          <button @click="showSettings = true" class="bg-white/10 hover:bg-white/20 px-3 py-2 rounded-lg border border-white/10 text-sm flex items-center gap-2">
            <Icon icon="mdi:cog" class="w-4 h-4" />
            Settings
          </button>
        </div>
      </div>

      <!-- Clothing Status moved to Settings modal -->

      <!-- Choose Your Card -->
      <div class="mb-8">
        <div class="text-center mb-6">
          <h3 class="text-2xl font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-pink-400">
            Choose Your Challenge
          </h3>
          <p class="text-white/60 text-sm">
            {{ currentPlayer?.name }}, it's your turn! Pick Truth or Dare to continue.
          </p>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          <!-- Truth Card -->
          <div class="relative">
            <div
              class="cursor-pointer perspective-1000"
              @click="drawSpecificCard('TRUTH')"
            >
              <div
                class="relative w-full h-64 transition-transform duration-700 transform-style-preserve-3d"
                :class="{ 'rotate-y-180': currentCard?.type === 'TRUTH' && cardFlipped }"
              >
                <!-- Truth Card Front -->
                <div
                  class="absolute w-full h-full backface-hidden bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 rounded-2xl flex flex-col justify-center items-center p-6 shadow-2xl border-2 hover:scale-105 transition-all duration-300 hover:shadow-blue-500/30"
                  :class="{ 
                    'opacity-50': isDrawing && selectedCardType !== 'TRUTH',
                    'border-blue-400/50': !isDrawing || selectedCardType === 'TRUTH',
                    'border-white/20': isDrawing && selectedCardType !== 'TRUTH'
                  }"
                >
                  <div class="text-center relative">
                    <!-- Floating background elements -->
                    <div class="absolute -top-2 -right-2 w-8 h-8 bg-blue-400/20 rounded-full animate-bounce" style="animation-delay: 0s;"></div>
                    <div class="absolute -bottom-1 -left-1 w-6 h-6 bg-indigo-400/30 rounded-full animate-bounce" style="animation-delay: 1s;"></div>
                    
                    <div class="text-6xl mb-4 animate-pulse">
                      <Icon icon="mdi:chat-question" />
                    </div>
                    <p class="text-3xl font-bold mb-3 tracking-wide">TRUTH</p>
                    <p class="text-base font-medium mb-3" :class="isSpicyMode ? 'text-red-200' : 'text-blue-200'">
                      {{ isSpicyMode ? '🔥 Answer honestly...' : '✨ Share your secrets...' }}
                    </p>
                    <div class="mt-4 text-sm px-4 py-2 rounded-full bg-white/25 backdrop-blur-sm font-semibold">
                      {{ isSpicyMode ? '🌶️ Spicy Mode' : '😇 Normal Mode' }}
                    </div>
                  </div>
                </div>

                <!-- Truth Card Back -->
                <div
                  class="absolute w-full h-full backface-hidden bg-white text-gray-900 rounded-2xl flex flex-col justify-center items-center p-6 shadow-lg rotate-y-180 border-2 border-white/20"
                >
                  <div v-if="currentCard?.type === 'TRUTH'" class="text-center w-full">
                    <span class="font-bold text-lg px-4 py-1 rounded-full mb-4 inline-flex items-center gap-2 bg-blue-100 text-blue-800">
                      <Icon icon="mdi:chat-question" class="w-5 h-5" />
                      TRUTH
                    </span>
                    <p class="text-lg font-medium mb-4 px-2">
                      {{ currentCard.text }}
                    </p>
                    <div
                      v-if="currentCard.target"
                      class="bg-gray-100 rounded-lg p-3 max-w-xs mx-auto"
                    >
                      <p class="text-sm font-medium text-gray-700 flex items-center justify-center gap-2">
                        <Icon icon="mdi:account-arrow-right" class="w-5 h-5" />
                        <span>
                          To: {{ currentCard.target.name }}
                          <span class="text-lg">{{ currentCard.target.gender === "male" ? "♂" : "♀" }}</span>
                        </span>
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <!-- Truth Action Button -->
            <button
              @click="drawSpecificCard('TRUTH')"
              class="w-full mt-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 py-3 rounded-xl font-bold transition-all duration-300 flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-blue-500/30 hover:scale-105"
              :disabled="isDrawing || (currentCard && currentCard.type !== 'TRUTH')"
            >
              <Icon v-if="isDrawing && selectedCardType === 'TRUTH'" icon="svg-spinners:3-dots-fade" class="w-5 h-5" />
              <Icon v-else icon="mdi:chat-question" class="w-5 h-5" />
              <span class="text-base">
                {{ (isDrawing && selectedCardType === 'TRUTH') ? "Getting Truth..." : "Draw Truth" }}
              </span>
            </button>
          </div>

          <!-- Dare Card -->
          <div class="relative">
            <div
              class="cursor-pointer perspective-1000"
              @click="drawSpecificCard('DARE')"
            >
              <div
                class="relative w-full h-64 transition-transform duration-700 transform-style-preserve-3d"
                :class="{ 'rotate-y-180': currentCard?.type === 'DARE' && cardFlipped }"
              >
                <!-- Dare Card Front -->
                <div
                  class="absolute w-full h-full backface-hidden bg-gradient-to-br from-pink-600 via-red-600 to-rose-700 rounded-2xl flex flex-col justify-center items-center p-6 shadow-2xl border-2 hover:scale-105 transition-all duration-300 hover:shadow-pink-500/30"
                  :class="{ 
                    'opacity-50': isDrawing && selectedCardType !== 'DARE',
                    'border-pink-400/50': !isDrawing || selectedCardType === 'DARE',
                    'border-white/20': isDrawing && selectedCardType !== 'DARE'
                  }"
                >
                  <div class="text-center relative">
                    <!-- Floating background elements -->
                    <div class="absolute -top-1 -right-3 w-7 h-7 bg-pink-400/20 rounded-full animate-bounce" style="animation-delay: 0.5s;"></div>
                    <div class="absolute -bottom-2 -left-2 w-5 h-5 bg-red-400/30 rounded-full animate-bounce" style="animation-delay: 1.5s;"></div>
                    
                    <div class="text-6xl mb-4 animate-pulse">
                      <Icon icon="mdi:fire" />
                    </div>
                    <p class="text-3xl font-bold mb-3 tracking-wide">DARE</p>
                    <p class="text-base font-medium mb-3" :class="isSpicyMode ? 'text-red-200' : 'text-pink-200'">
                      {{ isSpicyMode ? '🔥 Take the heat...' : '💪 Show your courage...' }}
                    </p>
                    <div class="mt-4 text-sm px-4 py-2 rounded-full bg-white/25 backdrop-blur-sm font-semibold">
                      {{ isSpicyMode ? '🌶️ Spicy Mode' : '😇 Normal Mode' }}
                    </div>
                  </div>
                </div>

                <!-- Dare Card Back -->
                <div
                  class="absolute w-full h-full backface-hidden bg-white text-gray-900 rounded-2xl flex flex-col justify-center items-center p-6 shadow-lg rotate-y-180 border-2 border-white/20"
                >
                  <div v-if="currentCard?.type === 'DARE'" class="text-center w-full">
                    <span class="font-bold text-lg px-4 py-1 rounded-full mb-4 inline-flex items-center gap-2 bg-pink-100 text-pink-800">
                      <Icon icon="mdi:fire" class="w-5 h-5" />
                      DARE
                    </span>
                    <p class="text-lg font-medium mb-4 px-2">
                      {{ currentCard.text }}
                    </p>
                    <div
                      v-if="currentCard.target"
                      class="bg-gray-100 rounded-lg p-3 max-w-xs mx-auto"
                    >
                      <p class="text-sm font-medium text-gray-700 flex items-center justify-center gap-2">
                        <Icon icon="mdi:account-arrow-right" class="w-5 h-5" />
                        <span>
                          To: {{ currentCard.target.name }}
                          <span class="text-lg">{{ currentCard.target.gender === "male" ? "♂" : "♀" }}</span>
                        </span>
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <!-- Dare Action Button -->
            <button
              @click="drawSpecificCard('DARE')"
              class="w-full mt-4 bg-gradient-to-r from-pink-600 to-red-600 hover:from-pink-700 hover:to-red-700 py-3 rounded-xl font-bold transition-all duration-300 flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-pink-500/30 hover:scale-105"
              :disabled="isDrawing || (currentCard && currentCard.type !== 'DARE')"
            >
              <Icon v-if="isDrawing && selectedCardType === 'DARE'" icon="svg-spinners:3-dots-fade" class="w-5 h-5" />
              <Icon v-else icon="mdi:fire" class="w-5 h-5" />
              <span class="text-base">
                {{ (isDrawing && selectedCardType === 'DARE') ? "Getting Dare..." : "Draw Dare" }}
              </span>
            </button>
          </div>
        </div>
      </div>

      <!-- Action Buttons -->
      <div v-if="currentCard && cardFlipped" class="mb-6">
        <div class="grid grid-cols-1 gap-3">
          <button
            @click="completeChallenge"
            class="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 py-4 rounded-xl font-bold text-lg transition-all flex items-center justify-center gap-2 shadow-lg"
          >
            <Icon icon="mdi:check-bold" class="w-6 h-6" />
            Challenge Completed!
          </button>
          
          <button
            @click="resetCard"
            class="w-full bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 py-2 rounded-xl font-medium transition-all flex items-center justify-center gap-2 text-sm"
          >
            <Icon icon="mdi:refresh" class="w-4 h-4" />
            Choose Different Card
          </button>
        </div>
      </div>

      <!-- Hesitation Timer -->
      <div class="mb-6 bg-white/5 rounded-xl p-4">
        <div class="flex justify-between items-center mb-2">
          <div class="flex items-center gap-2">
            <Icon icon="mdi:timer-sand" class="w-5 h-5 text-pink-300" />
            <span class="font-medium">Hesitation Timer:</span>
          </div>
          <span
            class="font-bold"
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

      <!-- Settings Modal -->
      <transition name="fade">
        <div v-if="showSettings" class="fixed inset-0 bg-black/60 flex items-center justify-center z-40">
          <div class="bg-slate-900 rounded-2xl border border-white/10 w-full max-w-lg p-6 shadow-2xl">
            <div class="flex items-center justify-between mb-4">
              <h3 class="text-xl font-semibold">Settings</h3>
              <button @click="showSettings = false" class="text-white/60 hover:text-white">
                <Icon icon="mdi:close" class="w-5 h-5" />
              </button>
            </div>

            <!-- Game Intensity quick toggle -->
            <div class="mb-5">
              <div class="text-sm text-white/70 mb-2">Game Intensity</div>
              <div class="flex bg-gray-800/60 rounded-xl p-1.5">
                <button
                  @click="isSpicyMode = false"
                  class="flex-1 px-4 py-2 rounded-lg text-sm font-semibold"
                  :class="!isSpicyMode ? 'bg-green-600 text-white' : 'text-white/70 hover:text-white hover:bg-white/5'"
                >😇 Normal</button>
                <button
                  @click="isSpicyMode = true"
                  class="flex-1 px-4 py-2 rounded-lg text-sm font-semibold"
                  :class="isSpicyMode ? 'bg-red-600 text-white' : 'text-white/70 hover:text-white hover:bg-white/5'"
                >🌶️ Spicy</button>
              </div>
            </div>

            <!-- Clothing status list -->
            <div class="mb-5">
              <div class="text-sm text-white/70 mb-2 flex items-center gap-2">
                <Icon icon="mdi:wardrobe" class="w-4 h-4" />
                Clothing Status
              </div>
              <div class="flex flex-wrap gap-2">
                <button
                  v-for="(item, index) in clothingItems"
                  :key="index"
                  class="px-3 py-1.5 rounded-full text-sm border"
                  :class="item.removed ? 'bg-gray-800 text-gray-400 border-gray-700 line-through' : 'bg-white/10 text-white border-white/10 hover:bg-white/20'"
                  @click="toggleClothing(index)"
                >
                  <Icon :icon="item.icon" class="w-4 h-4" />
                  <span class="ml-1">{{ item.name }}</span>
                </button>
              </div>
            </div>

            <div class="flex justify-end gap-2">
              <button @click="showSettings = false" class="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 border border-white/10">Close</button>
            </div>
          </div>
        </div>
      </transition>

      <!-- Game Log -->
      <div class="bg-white/5 rounded-xl p-4 max-h-40 overflow-y-auto">
        <h3 class="font-semibold mb-3 flex items-center gap-2">
          <Icon icon="mdi:history" class="w-5 h-5" />
          <span>Game Log</span>
        </h3>
        <ul class="space-y-2 text-sm">
          <li
            v-for="(log, index) in gameHistory"
            :key="index"
            class="py-1.5 px-2 rounded-lg"
            :class="index % 2 === 0 ? 'bg-white/5' : ''"
          >
            <div class="flex items-start gap-2">
              <Icon
                icon="mdi:information"
                class="w-4 h-4 mt-0.5 flex-shrink-0 text-pink-300"
              />
              <span>{{ log }}</span>
            </div>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from "vue";
import { Icon } from "@iconify/vue";
// Questions are now loaded from database via API
import { useTruthTracker, useDareTracker } from "~/composables/useQuestionTracker";
import { useAnalytics } from "~/composables/useAnalytics";

// Game Configuration
const MAX_HESITATION_TIME = 15;
const CLOTHING_ITEMS = [
  { name: "Top", icon: "mdi:tshirt-crew", removed: false },
  { name: "Bottom", icon: "mdi:human-male-pants", removed: false },
  { name: "Underwear", icon: "mdi:underwear", removed: false },
  { name: "Socks", icon: "mdi:sock", removed: false },
  { name: "Accessories", icon: "mdi:glasses", removed: false },
];

// State
const gameMode = ref("free-for-all");
const players = ref([]);
const currentPlayerIndex = ref(0);
const currentCard = ref(null);
const cardFlipped = ref(false);
const gameHistory = ref([]);
const hesitationTime = ref(MAX_HESITATION_TIME);
const hesitationTimer = ref(null);
const hesitationPercent = ref(100);
const gameLevel = ref(1);
const isDrawing = ref(false);
const clothingItems = ref(JSON.parse(JSON.stringify(CLOTHING_ITEMS)));
const isSpicyMode = ref(false);
const selectedCardType = ref('');
const showSettings = ref(false);

// Question storage
const truthQuestionsDB = ref([])
const dareQuestionsDB = ref([])

// Initialize question trackers (will be populated from database)
let normalTruthTracker = null;
let spicyTruthTracker = null;
let normalDareTracker = null;
let spicyDareTracker = null;

// Initialize analytics
const { trackPageView, updateActivity } = useAnalytics();

// Computed Properties
const currentPlayer = computed(() => players.value[currentPlayerIndex.value]);
const remainingClothing = computed(
  () => clothingItems.value.filter((item) => !item.removed).length
);

// Question Selection Logic
const getRandomQuestion = (type) => {
  let tracker;
  
  if (type === "TRUTH") {
    tracker = isSpicyMode.value ? spicyTruthTracker : normalTruthTracker;
  } else {
    tracker = isSpicyMode.value ? spicyDareTracker : normalDareTracker;
  }
  
  // Check if tracker exists (questions might still be loading)
  if (!tracker) {
    console.warn('Question tracker not ready yet, questions may still be loading')
    return {
      question: 'Questions are loading... Please try again in a moment.',
      isRepeat: false
    }
  }
  
  const result = tracker.getNextQuestion();
  
  // Log usage stats for debugging
  const stats = tracker.getUsageStats.value;
  console.log(`${type} ${isSpicyMode.value ? 'Spicy' : 'Normal'} - Used: ${stats.usedCount}/${stats.totalQuestions} (${stats.usagePercentage}%)`);
  
  return result.question;
};

// Game Logic
const getRandomTarget = () => {
  if (!currentPlayer.value) return null;
  if (gameMode.value === "relationship") {
    return (
      players.value.find((p) => p.id === currentPlayer.value.partnerId) || null
    );
  }
  const validTargets = players.value.filter(
    (p) => p.id !== currentPlayer.value.id
  );
  if (validTargets.length === 0) return null;
  return validTargets[Math.floor(Math.random() * validTargets.length)];
};

const drawSpecificCard = async (type) => {
  if (isDrawing.value || (currentCard.value && currentCard.value.type !== type)) return;
  
  // Track user activity
  updateActivity();
  
  isDrawing.value = true;
  selectedCardType.value = type;
  cardFlipped.value = false;

  let target = null;
  if (type === "DARE" && players.value.length > 1) {
    target = getRandomTarget();
  }

  const content = getRandomQuestion(type);

  currentCard.value = {
    type,
    text: content,
    target,
  };

  // Auto-flip the card after a short delay
  setTimeout(() => {
    cardFlipped.value = true;
    startHesitationTimer();
    isDrawing.value = false;
  }, 800);
};

// Keep the old function for compatibility but make it choose randomly
const drawCard = async () => {
  const type = Math.random() > 0.5 ? "TRUTH" : "DARE";
  drawSpecificCard(type);
};

const flipCard = () => {
  if (currentCard.value && !isDrawing.value) {
    cardFlipped.value = !cardFlipped.value;
    if (cardFlipped.value) {
      startHesitationTimer();
    } else {
      resetHesitationTimer();
    }
  }
};

// Reset current card to allow new selection
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
    hesitationPercent.value =
      (hesitationTime.value / MAX_HESITATION_TIME) * 100;

    if (hesitationTime.value <= 0) {
      clearInterval(hesitationTimer.value);
      gameHistory.value.unshift(
        `${currentPlayer.value.name} hesitated too long!`
      );
      applyPenalty();
      // Server penalty + advance
      // no server penalty/advance in sessionless mode
      nextTurn();
    }
  }, 1000);
};

const resetHesitationTimer = () => {
  clearInterval(hesitationTimer.value);
  hesitationTime.value = MAX_HESITATION_TIME;
  hesitationPercent.value = 100;
};

const applyPenalty = () => {
  const removableItems = clothingItems.value.filter((item) => !item.removed);
  if (removableItems.length > 0) {
    const itemToRemove = removableItems[0]; // Remove in a predictable order
    const itemInState = clothingItems.value.find(
      (i) => i.name === itemToRemove.name
    );
    if (itemInState) {
      itemInState.removed = true;
      gameHistory.value.unshift(
        `${currentPlayer.value.name} removed their ${itemInState.name} as a penalty!`
      );
      updateGameLevel();
    }
  }
};

const completeChallenge = () => {
  if (!currentCard.value) return;
  resetHesitationTimer();
  gameHistory.value.unshift(
    `${currentPlayer.value.name} completed: ${currentCard.value.text}`
  );
  // Advance server turn
  nextTurn();
};

const nextTurn = () => {
  currentCard.value = null;
  cardFlipped.value = false;
  selectedCardType.value = '';
  currentPlayerIndex.value =
    (currentPlayerIndex.value + 1) % players.value.length;
};

const toggleClothing = (index) => {
  if (!clothingItems.value[index].removed) {
    clothingItems.value[index].removed = true;
    gameHistory.value.unshift(
      `${currentPlayer.value.name} voluntarily removed their ${clothingItems.value[index].name}.`
    );
    updateGameLevel();
  }
};

const updateGameLevel = () => {
  const removedCount = clothingItems.value.filter((i) => i.removed).length;
  gameLevel.value = Math.min(Math.floor(removedCount / 2) + 1, 5);
};

// Load questions from database
async function loadQuestions() {
  try {
    console.log('🔄 Loading questions from database...')
    
    // Load truth questions (normal and spicy)
    const truthResponse = await $fetch('/api/questions/truth-or-dare?type=TRUTH&limit=100')
    console.log('Truth API response:', truthResponse)
    const allTruthQuestions = truthResponse.questions || []
    
    // Load dare questions (normal and spicy)
    const dareResponse = await $fetch('/api/questions/truth-or-dare?type=DARE&limit=100')
    console.log('Dare API response:', dareResponse)
    const allDareQuestions = dareResponse.questions || []
    
    // Separate by intensity (1-3 = normal, 4-5 = spicy)
    const normalTruths = allTruthQuestions.filter(q => q.intensity <= 3).map(q => q.text)
    const spicyTruths = allTruthQuestions.filter(q => q.intensity >= 4).map(q => q.text)
    const normalDares = allDareQuestions.filter(q => q.intensity <= 3).map(q => q.text)
    const spicyDares = allDareQuestions.filter(q => q.intensity >= 4).map(q => q.text)
    
    console.log(`📊 Question distribution:`)
    console.log(`- Normal Truths: ${normalTruths.length}`)
    console.log(`- Spicy Truths: ${spicyTruths.length}`)
    console.log(`- Normal Dares: ${normalDares.length}`)
    console.log(`- Spicy Dares: ${spicyDares.length}`)
    
    // Create trackers with loaded questions
    normalTruthTracker = useTruthTracker(normalTruths, false);
    spicyTruthTracker = useTruthTracker(spicyTruths, true);
    normalDareTracker = useDareTracker(normalDares, false);
    spicyDareTracker = useDareTracker(spicyDares, true);
    
    // Initialize trackers
    normalTruthTracker.initializeTracker();
    spicyTruthTracker.initializeTracker();
    normalDareTracker.initializeTracker();
    spicyDareTracker.initializeTracker();
    
    console.log(`✅ Successfully loaded and initialized question trackers`)
  } catch (error) {
    console.error('❌ Error loading questions from database:', error)
    // Fallback: use some default questions to prevent game from breaking
    const fallbackTruths = ['What is your biggest secret?', 'Who do you have a crush on?']
    const fallbackDares = ['Give someone a hug', 'Do a silly dance']
    
    normalTruthTracker = useTruthTracker(fallbackTruths, false);
    spicyTruthTracker = useTruthTracker(fallbackTruths, true);
    normalDareTracker = useDareTracker(fallbackDares, false);
    spicyDareTracker = useDareTracker(fallbackDares, true);
    
    normalTruthTracker.initializeTracker();
    spicyTruthTracker.initializeTracker();
    normalDareTracker.initializeTracker();
    spicyDareTracker.initializeTracker();
    
    console.log('⚠️ Using fallback questions due to API error')
  }
}

// Lifecycle Hooks
onMounted(async () => {
  if (typeof window !== "undefined") {
    // Track page view
    trackPageView('truth-or-dare');
    
    // Load questions from database
    await loadQuestions()
    
    const savedSession = localStorage.getItem("gameSession");
    if (savedSession) {
      const session = JSON.parse(savedSession);
      gameMode.value = session.mode || "free-for-all";
      players.value = session.players || [];
    } else {
      // Setup mock players if no session is found
      players.value = [
        { id: 1, name: "Alex", gender: "male" },
        { id: 2, name: "Mia", gender: "female" },
      ];
    }
  }
});

onBeforeUnmount(() => {
  clearInterval(hesitationTimer.value);
});
</script>

<style>
/* Custom 3D Card Styles */
.perspective-1000 {
  perspective: 1000px;
}
.transform-style-preserve-3d {
  transform-style: preserve-3d;
}
.backface-hidden {
  backface-visibility: hidden;
}
.rotate-y-180 {
  transform: rotateY(180deg);
}

/* Animations */
@keyframes float {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-10px);
  }
}
.animate-float {
  animation: float 6s ease-in-out infinite;
}

/* Smooth transitions */
button,
div {
  transition: all 0.3s ease;
}

/* Scrollbar styling */
::-webkit-scrollbar {
  width: 6px;
}
::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 3px;
}
::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.3);
  border-radius: 3px;
}
</style>
