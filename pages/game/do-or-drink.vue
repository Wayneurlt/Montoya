<template>
  <div
    class="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 text-white p-3 sm:p-4 relative overflow-hidden"
  >
    <!-- Background Icons Pattern -->
    <BackgroundIcons />

    <!-- Main Game Container -->
    <div
      class="max-w-3xl mx-auto bg-white/10 backdrop-blur-md rounded-xl sm:rounded-2xl p-4 sm:p-5 md:p-6 lg:p-8 shadow-2xl relative z-10"
    >
      <!-- Home Button & Info -->
      <div class="flex justify-between items-center mb-6">
        <NuxtLink to="/" class="bg-white/10 hover:bg-white/20 backdrop-blur-md px-4 py-2 rounded-xl transition-all duration-300 flex items-center gap-2 border border-white/20 hover:scale-105 shadow-lg">
          <Icon icon="mdi:home" class="w-5 h-5" />
          <span class="font-medium">Home</span>
        </NuxtLink>
        
        <div class="flex items-center gap-2">
          <span
            class="text-sm px-3 py-1.5 rounded-full border shadow-md"
            :class="
              gameMode === 'individual'
                ? 'bg-pink-500/20 text-pink-300 border-pink-400/30'
                : gameMode === 'teams'
                ? 'bg-blue-500/20 text-blue-300 border-blue-400/30'
                : 'bg-red-500/20 text-red-300 border-red-400/30'
            "
          >
            {{
              gameMode === "individual"
                ? "Individual"
                : gameMode === "teams"
                ? "Teams"
                : "Elimination"
            }}
          </span>
          <span
            class="text-sm px-3 py-1.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-400/30 shadow-md"
          >
            Level {{ gameLevel }}
          </span>
        </div>
      </div>
      
      <!-- Game Header -->
      <div class="text-center mb-8">
        <h1
          class="text-5xl md:text-6xl font-black mb-2 bg-clip-text text-transparent bg-gradient-to-r from-red-600 via-orange-600 to-amber-500 drop-shadow-2xl"
        >
          Do or Drink
        </h1>
        <p class="text-red-200/80 text-sm font-medium mt-2">Complete the challenge or take the penalty!</p>
      </div>

      <!-- Game Settings -->
      <div class="mb-8">
        <button
          @click="showSettings = !showSettings"
          class="text-sm bg-white/10 hover:bg-white/20 px-4 py-2 rounded-xl flex items-center gap-2 border border-white/20 transition-all hover:scale-105 font-medium shadow-lg"
        >
          <Icon icon="mdi:cog" class="w-5 h-5" />
          Game Settings
        </button>

        <transition name="slide-down">
          <div
            v-if="showSettings"
            class="mt-3 p-4 bg-white/5 rounded-xl border border-white/10"
          >
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium mb-1"
                  >Drink Amount</label
                >
                <select
                  v-model="baseDrinkAmount"
                  class="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-sm"
                >
                  <option value="1">1 sip</option>
                  <option value="2">2 sips</option>
                  <option value="3">3 sips</option>
                  <option value="shot">1 shot</option>
                  <option value="glass">Full glass</option>
                </select>
              </div>

              <div>
                <label class="block text-sm font-medium mb-1">Game Mode</label>
                <select
                  v-model="gameMode"
                  class="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-sm"
                >
                  <option value="individual">Individual</option>
                  <option value="teams">Teams</option>
                  <option value="elimination">Elimination</option>
                </select>
              </div>
            </div>

            <div class="mt-4">
              <label class="flex items-center gap-2">
                <input
                  type="checkbox"
                  v-model="enableHouseRules"
                  class="rounded bg-white/10 border-white/20 focus:ring-pink-500"
                />
                <span class="text-sm">Enable House Rules</span>
              </label>
            </div>

            <div v-if="enableHouseRules" class="mt-3">
              <label class="block text-sm font-medium mb-1">Custom Rules</label>
              <textarea
                v-model="houseRules"
                placeholder="Enter your custom house rules..."
                class="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-sm h-20"
              ></textarea>
            </div>
          </div>
        </transition>
      </div>

      <!-- Player Status -->
      <div
        class="flex justify-between items-center mb-8 p-6 bg-gradient-to-r from-white/10 to-white/5 rounded-2xl border-2 border-white/20 shadow-xl backdrop-blur-lg"
      >
        <div>
          <h3 class="text-xs font-bold text-white/60 uppercase tracking-wider mb-1">Current Turn</h3>
          <p class="text-2xl font-black flex items-center gap-2">
            <span>{{ currentPlayer?.name }}</span>
            <span class="text-3xl">{{
              currentPlayer?.gender === "male" ? "♂" : "♀"
            }}</span>
          </p>
        </div>
        <div class="text-right">
          <h3 class="text-xs font-bold text-white/60 uppercase tracking-wider mb-1">Drinks Taken</h3>
          <p class="text-2xl font-black flex items-center justify-end gap-2">
            <Icon icon="mdi:glass-cocktail" class="w-6 h-6 text-orange-400 animate-pulse" />
            <span>{{ currentPlayer?.drinks || 0 }}</span>
          </p>
        </div>
      </div>

      <!-- Main Game Card -->
      <div
        class="relative w-full h-80 mb-8 cursor-pointer perspective-1000 group"
        @click="flipCard"
      >
        <div
          class="relative w-full h-full transition-transform duration-700 transform-style-preserve-3d"
          :class="{ 'rotate-y-180': cardFlipped }"
        >
          <!-- Front of Card -->
          <div
            class="absolute w-full h-full backface-hidden rounded-3xl flex flex-col justify-center items-center p-8 shadow-2xl border-4 border-red-600/40 group-hover:scale-105 transition-all"
            :class="cardColor"
          >
            <!-- Glow effect -->
            <div class="absolute inset-0 bg-gradient-to-br from-red-500/20 to-transparent rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            
            <div class="text-center relative z-10">
              <p class="text-4xl font-black mb-4 drop-shadow-lg">Do or Drink</p>
              <p v-if="!currentCard" class="text-xl opacity-90 font-semibold">
                Draw a card to begin the game
              </p>
              <p v-else class="text-xl opacity-90 font-bold">
                Level {{ currentCard?.intensity }} Challenge
                <span class="inline-block text-lg mt-2 px-4 py-2 bg-white/20 rounded-full"
                  >Penalty: {{ currentCard?.drinkAmount }}</span
                >
              </p>
              <div class="mt-8 text-7xl animate-pulse">
                <Icon
                  v-if="currentCard?.intensity === 1"
                  icon="mdi:emoticon-happy"
                  class="drop-shadow-lg"
                />
                <Icon
                  v-else-if="currentCard?.intensity === 2"
                  icon="mdi:emoticon-excited"
                  class="drop-shadow-lg"
                />
                <Icon
                  v-else-if="currentCard?.intensity === 3"
                  icon="mdi:emoticon-devil"
                  class="drop-shadow-lg"
                />
                <Icon v-else icon="mdi:cards" class="drop-shadow-lg" />
              </div>
            </div>
          </div>

          <!-- Back of Card -->
          <div
            class="absolute w-full h-full backface-hidden bg-white text-gray-900 rounded-3xl flex flex-col justify-center items-center p-8 shadow-2xl rotate-y-180 border-4 border-white/40"
          >
            <div v-if="currentCard" class="text-center w-full">
              <span
                class="font-black text-xl px-5 py-2 rounded-full mb-6 inline-flex items-center gap-2 shadow-lg"
                :class="intensityClass"
              >
                <Icon
                  :icon="
                    currentCard.intensity === 1
                      ? 'mdi:emoticon-happy'
                      : currentCard.intensity === 2
                      ? 'mdi:emoticon-excited'
                      : 'mdi:emoticon-devil'
                  "
                  class="w-6 h-6"
                />
                Level {{ currentCard.intensity }}
              </span>
              <p class="text-2xl font-bold mb-6 px-4 leading-relaxed">
                {{ currentCard.text }}
              </p>

              <div
                v-if="currentCard.target"
                class="bg-gray-100 rounded-xl p-4 w-full max-w-sm mx-auto mb-4 border-2 border-gray-200"
              >
                <p
                  class="text-base font-bold text-gray-700 flex items-center justify-center gap-2"
                >
                  <Icon icon="mdi:account-arrow-right" class="w-6 h-6" />
                  <span>
                    To: {{ currentCard.target.name }}
                    <span class="text-xl">{{
                      currentCard.target.gender === "male" ? "♂" : "♀"
                    }}</span>
                  </span>
                </p>
              </div>

              <p class="mt-5 font-black text-2xl px-6 py-3 rounded-full inline-block" :class="intensityTextClass">
                Penalty: {{ currentCard.drinkAmount }}
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="grid grid-cols-2 gap-4 mb-6">
        <button
          @click="drawCard"
          :disabled="isDrawing || currentCard"
          class="group bg-gradient-to-r from-red-700 to-orange-700 hover:from-red-600 hover:to-orange-600 py-4 rounded-2xl font-black text-lg transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed shadow-xl hover:shadow-red-600/50 border-2 border-red-500/30 hover:scale-105"
        >
          <Icon
            v-if="isDrawing"
            icon="svg-spinners:3-dots-fade"
            class="w-6 h-6"
          />
          <Icon v-else icon="mdi:cards" class="w-6 h-6 group-hover:rotate-12 transition-transform" />
          {{ isDrawing ? "Generating..." : "Draw Card" }}
        </button>
        <button
          @click="completeChallenge"
          :disabled="!currentCard || !cardFlipped"
          class="group bg-gradient-to-r from-orange-700 to-amber-700 hover:from-orange-600 hover:to-amber-600 py-4 rounded-2xl font-black text-lg transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed shadow-xl hover:shadow-orange-600/50 border-2 border-orange-500/30 hover:scale-105"
        >
          <Icon icon="mdi:check-bold" class="w-6 h-6 group-hover:scale-110 transition-transform" />
          Completed
        </button>
      </div>

      <!-- Drink Button -->
      <button
        v-if="currentCard && cardFlipped"
        @click="takeDrink"
        class="group w-full mb-8 bg-gradient-to-r from-amber-700 to-red-700 hover:from-amber-600 hover:to-red-600 py-5 rounded-2xl font-black text-lg transition-all flex items-center justify-center gap-3 shadow-xl hover:shadow-amber-600/50 border-2 border-amber-500/30 hover:scale-105"
      >
        <Icon icon="mdi:glass-cocktail" class="w-6 h-6 group-hover:animate-bounce" />
        Take Drink Instead ({{ currentCard.drinkAmount }})
      </button>

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
                :icon="getLogIcon(log)"
                class="w-4 h-4 mt-0.5 flex-shrink-0"
                :class="getLogIconColor(log)"
              />
              <span>{{ log.text || log }}</span>
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
import { useDoOrDrinkTracker } from "~/composables/useQuestionTracker";
// Sessionless: no server session polling

// Game Configuration
const INTENSITY_LEVELS = [
  {
    name: "Mild",
    color: "from-orange-700 to-red-700",
    textColor: "text-orange-900",
    bgColor: "bg-orange-200",
  },
  {
    name: "Medium",
    color: "from-red-700 to-rose-700",
    textColor: "text-red-900",
    bgColor: "bg-red-200",
  },
  {
    name: "Hot",
    color: "from-rose-700 to-red-900",
    textColor: "text-rose-900",
    bgColor: "bg-rose-200",
  },
];

// Load game data from localStorage
const getLocalStorage = (key, defaultValue) => {
  if (typeof window !== "undefined" && window.localStorage) {
    const value = window.localStorage.getItem(key);
    return value ? JSON.parse(value) : defaultValue;
  }
  return defaultValue;
};

// Game State
const showSettings = ref(false);
const baseDrinkAmount = ref("2");
const gameMode = ref("individual");
const enableHouseRules = ref(false);
const houseRules = ref("");
const gameLevel = ref(1);

// Players
const gameSession = getLocalStorage("gameSession", {});
const players = ref(
  gameSession.players?.map((p) => ({ ...p, drinks: 0 })) || []
);
const currentPlayerIndex = ref(0);

// Gameplay
const currentCard = ref(null);
const cardFlipped = ref(false);
const gameHistory = ref([]);
const hesitationTime = ref(15);
const hesitationTimer = ref(null);
const hesitationPercent = ref(100);
const isDrawing = ref(false);

// Set game mode from session if available
if (gameSession.mode) {
  gameMode.value = gameSession.mode;
}

// Initialize with default players if none loaded
if (players.value.length === 0) {
  players.value = [
    { id: "1", name: "Player 1", gender: "male", drinks: 0 },
    { id: "2", name: "Player 2", gender: "female", drinks: 0 },
  ];
  gameHistory.value.push("No session found. Using default players.");
} else {
  gameHistory.value.push("Game session loaded successfully!");
}

// Computed Properties
const currentPlayer = computed(
  () => players.value[currentPlayerIndex.value] || {}
);

const cardColor = computed(() => {
  if (!currentCard.value) return "bg-gradient-to-br from-red-900 to-black";
  return (
    INTENSITY_LEVELS[currentCard.value.intensity - 1]?.color ||
    "bg-gradient-to-br from-red-900 to-black"
  );
});

const intensityClass = computed(() => {
  if (!currentCard.value) return "";
  return INTENSITY_LEVELS[currentCard.value.intensity - 1]?.bgColor || "";
});

const intensityTextClass = computed(() => {
  if (!currentCard.value) return "";
  return INTENSITY_LEVELS[currentCard.value.intensity - 1]?.textColor || "";
});

// Initialize question tracker (will be populated from database)
let challengeTracker = null;

// Question Selection Logic
const getRandomChallenge = () => {
  console.log('🎯 getRandomChallenge called, challengeTracker:', challengeTracker ? 'exists' : 'null')
  
  if (!challengeTracker) {
    console.log('⚠️ No challengeTracker, returning loading message')
    return 'Questions are loading... Please wait.';
  }
  
  const result = challengeTracker.getNextQuestion();
  console.log('📋 Tracker result:', result)
  
  // Log usage stats for debugging
  const stats = challengeTracker.getUsageStats.value;
  console.log(`Do or Drink - Used: ${stats.usedCount}/${stats.totalQuestions} (${stats.usagePercentage}%)`);
  
  // Since questions are now just strings, result.question is the string itself
  const question = result.question
  console.log('🎭 Returning question:', question)
  return question;
};

// Game Logic
const getValidTargets = () => {
  if (!currentPlayer.value) return [];
  return players.value.filter((p) => p.id !== currentPlayer.value.id);
};

// No DB card fetching

const generateChallenge = () => {
  const intensity = Math.min(
    Math.floor(Math.random() * 3) + 1 + Math.floor(gameLevel.value / 3),
    3
  );
  let drinkAmount;

  switch (intensity) {
    case 1:
      drinkAmount =
        baseDrinkAmount.value === "shot"
          ? "1 shot"
          : baseDrinkAmount.value === "glass"
          ? "1 glass"
          : `${baseDrinkAmount.value} sip${
              baseDrinkAmount.value !== "1" ? "s" : ""
            }`;
      break;
    case 2:
      drinkAmount =
        Math.random() > 0.5
          ? baseDrinkAmount.value === "shot"
            ? "2 shots"
            : baseDrinkAmount.value === "glass"
            ? "1.5 glasses"
            : `${Math.min(parseInt(baseDrinkAmount.value) * 2, 4)} sips`
          : "1 shot";
      break;
    case 3:
      drinkAmount =
        Math.random() > 0.5
          ? baseDrinkAmount.value === "shot"
            ? "3 shots"
            : baseDrinkAmount.value === "glass"
            ? "2 glasses"
            : `${Math.min(parseInt(baseDrinkAmount.value) * 3, 6)} sips`
          : "2 shots";
      break;
  }

  const targets = getValidTargets();
  const hasTarget = targets.length > 0 && Math.random() > 0.3;
  const target = hasTarget
    ? targets[Math.floor(Math.random() * targets.length)]
    : null;

  const challengeText = getRandomChallenge();
  console.log('🎲 Generated challenge text:', challengeText)

  const challenge = {
    text: challengeText,
    intensity,
    drinkAmount,
    target,
  };
  
  console.log('🎯 Final challenge object:', challenge)
  return challenge;
};

const drawCard = () => {
  if (isDrawing.value || currentCard.value) return;

  isDrawing.value = true;
  cardFlipped.value = false;

  try {
    currentCard.value = generateChallenge();
    gameHistory.value.unshift({
      text: `${currentPlayer.value.name} drew a level ${currentCard.value.intensity} challenge`,
      type: "draw",
    });
  } catch (error) {
    console.error("Error generating challenge:", error);
    currentCard.value = {
      text: "Give someone a passionate kiss or take a drink",
      intensity: 1,
      drinkAmount: "1 sip",
      target: null,
    };
  } finally {
    isDrawing.value = false;
  }
};

const flipCard = () => {
  if (currentCard.value && !isDrawing.value) {
    cardFlipped.value = !cardFlipped.value;
    if (cardFlipped.value) {
      startHesitationTimer();
    } else {
      clearInterval(hesitationTimer.value);
    }
  }
};

const startHesitationTimer = () => {
  clearInterval(hesitationTimer.value);
  hesitationTime.value = 15;
  hesitationPercent.value = 100;
  hesitationTimer.value = setInterval(() => {
    hesitationTime.value--;
    hesitationPercent.value = (hesitationTime.value / 15) * 100;
    if (hesitationTime.value <= 0) {
      clearInterval(hesitationTimer.value);
      gameHistory.value.unshift({
        text: `${currentPlayer.value.name} hesitated! Forced to drink.`,
        type: "penalty",
      });
      applyPenalty();
      nextTurn();
    }
  }, 1000);
};

const completeChallenge = () => {
  if (!currentCard.value) return;
  clearInterval(hesitationTimer.value);
  gameHistory.value.unshift({
    text: `${currentPlayer.value.name} completed: ${currentCard.value.text}`,
    type: "complete",
  });

  // Increase game level occasionally
  if (Math.random() > 0.7) {
    gameLevel.value = Math.min(gameLevel.value + 1, 5);
  }

  nextTurn();
};

const takeDrink = () => {
  if (!currentCard.value) return;
  clearInterval(hesitationTimer.value);

  const drinkAmount = currentCard.value.drinkAmount;
  let drinkCount = 1;

  if (drinkAmount.includes("shot")) {
    drinkCount = (parseInt(drinkAmount) || 1) * 2;
  } else if (drinkAmount.includes("sip")) {
    drinkCount = parseInt(drinkAmount) || 1;
  } else if (drinkAmount.includes("glass")) {
    drinkCount = 5;
  }

  players.value[currentPlayerIndex.value].drinks += drinkCount;
  gameHistory.value.unshift({
    text: `${currentPlayer.value.name} drank instead: ${drinkAmount}`,
    type: "drink",
  });

  handleElimination();
  nextTurn();
};

const applyPenalty = () => {
  if (!currentCard.value) return;

  const drinkAmount = currentCard.value.drinkAmount;
  let drinkCount = 2; // Default double penalty

  if (drinkAmount.includes("shot")) {
    drinkCount = (parseInt(drinkAmount) || 1) * 2 * 2;
  } else if (drinkAmount.includes("sip")) {
    drinkCount = (parseInt(drinkAmount) || 1) * 2;
  } else if (drinkAmount.includes("glass")) {
    drinkCount = 10;
  }

  players.value[currentPlayerIndex.value].drinks += drinkCount;
  gameHistory.value.unshift({
    text: `${currentPlayer.value.name} takes a penalty of ${drinkCount} sips/drinks`,
    type: "penalty",
  });

  handleElimination();
};

const handleElimination = () => {
  if (gameMode.value === "elimination" && currentPlayer.value?.drinks >= 10) {
    gameHistory.value.unshift({
      text: `🚨 ${currentPlayer.value.name} is eliminated after 10 drinks!`,
      type: "elimination",
    });
    players.value.splice(currentPlayerIndex.value, 1);

    if (players.value.length === 1) {
      gameHistory.value.unshift({
        text: `🏆 ${players.value[0].name} wins the game!`,
        type: "winner",
      });
    }
  }
};

const nextTurn = () => {
  currentCard.value = null;
  cardFlipped.value = false;
  hesitationPercent.value = 100;
  hesitationTime.value = 15;
  clearInterval(hesitationTimer.value);

  if (players.value.length === 0) {
    gameHistory.value.unshift({
      text: "Game over! No players left.",
      type: "game-over",
    });
    return;
  }

  currentPlayerIndex.value =
    (currentPlayerIndex.value + 1) % players.value.length;
};

// Helper functions
const getLogIcon = (log) => {
  if (typeof log === "object") {
    switch (log.type) {
      case "draw":
        return "mdi:cards";
      case "complete":
        return "mdi:check-circle";
      case "drink":
        return "mdi:glass-cocktail";
      case "penalty":
        return "mdi:alert-circle";
      case "elimination":
        return "mdi:skull";
      case "winner":
        return "mdi:trophy";
      case "game-over":
        return "mdi:flag";
      default:
        return "mdi:information";
    }
  }
  return "mdi:information";
};

const getLogIconColor = (log) => {
  if (typeof log === "object") {
    switch (log.type) {
      case "complete":
        return "text-green-400";
      case "drink":
        return "text-red-400";
      case "penalty":
        return "text-yellow-400";
      case "elimination":
        return "text-red-500";
      case "winner":
        return "text-yellow-300";
      case "game-over":
        return "text-gray-400";
      default:
        return "text-blue-400";
    }
  }
  return "text-blue-400";
};

// Load questions from database
async function loadQuestions() {
  try {
    console.log('🔄 Loading Do or Drink questions from database...')
    
    // Use standard fetch instead of $fetch to avoid potential issues
    const response = await fetch('/api/questions/do-or-drink?limit=100')
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    const data = await response.json()
    console.log('Do or Drink API response:', data)
    const questions = data.questions || []
    
    console.log('Questions array:', questions)
    console.log('Questions length:', questions.length)
    console.log('First question:', questions[0])
    
    // Create tracker with loaded questions - questions are now just strings
    console.log('🔧 Creating tracker with questions:', questions)
    challengeTracker = useDoOrDrinkTracker(questions)
    console.log('📊 Tracker created:', challengeTracker)
    
    challengeTracker.initializeTracker();
    console.log('✅ Tracker initialized')
    
    console.log(`✅ Loaded ${questions.length} Do or Drink questions`)
  } catch (error) {
    console.error('❌ Error loading Do or Drink questions:', error)
    // Fallback questions - only text
    console.log('🔄 Creating fallback tracker...')
    challengeTracker = useDoOrDrinkTracker([
      'Give someone a compliment',
      'Do a funny dance', 
      'Tell a joke'
    ])
    challengeTracker.initializeTracker();
    console.log('⚠️ Using fallback Do or Drink questions')
  }
}

onMounted(async () => {
  console.log('🚀 Component mounted, loading questions...')
  if (typeof window !== "undefined") {
    // Load questions from database
    await loadQuestions()
    console.log('🏁 Questions loading completed')
  } else {
    console.log('⚠️ Not in browser environment')
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

@keyframes slide-down {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
.slide-down-enter-active {
  animation: slide-down 0.3s ease-out;
}
.slide-down-leave-active {
  animation: slide-down 0.3s ease-out reverse;
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
