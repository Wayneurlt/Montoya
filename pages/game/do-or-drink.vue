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

    <!-- Main Game Container -->
    <div
      class="max-w-2xl mx-auto bg-white/10 backdrop-blur-md rounded-xl p-6 md:p-8 shadow-2xl relative z-10"
    >
      <!-- Game Header -->
      <div class="text-center mb-6">
        <h1
          class="text-4xl md:text-5xl font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-pink-500 to-cyan-400"
        >
          Do or Drink
        </h1>
        <div class="flex justify-center items-center gap-2">
          <span
            class="text-sm px-3 py-1 rounded-full"
            :class="
              gameMode === 'individual'
                ? 'bg-pink-500/20 text-pink-300'
                : gameMode === 'teams'
                ? 'bg-blue-500/20 text-blue-300'
                : 'bg-red-500/20 text-red-300'
            "
          >
            {{
              gameMode === "individual"
                ? "Individual"
                : gameMode === "teams"
                ? "Team Mode"
                : "Elimination"
            }}
          </span>
          <span
            class="text-sm px-3 py-1 rounded-full bg-purple-500/20 text-purple-300"
          >
            Level {{ gameLevel }}
          </span>
        </div>
      </div>

      <!-- Game Settings -->
      <div class="mb-6">
        <button
          @click="showSettings = !showSettings"
          class="text-sm bg-black/30 hover:bg-black/50 px-3 py-1 rounded-full flex items-center gap-2"
        >
          <Icon icon="mdi:cog" class="w-4 h-4" />
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
        class="flex justify-between items-center mb-6 p-4 bg-gradient-to-r from-white/5 to-white/10 rounded-xl border border-white/10"
      >
        <div>
          <h3 class="text-sm font-medium text-white/70">Current Turn:</h3>
          <p class="text-xl font-bold flex items-center gap-2">
            <span>{{ currentPlayer?.name }}</span>
            <span class="text-2xl">{{
              currentPlayer?.gender === "male" ? "♂" : "♀"
            }}</span>
          </p>
        </div>
        <div class="text-right">
          <h3 class="text-sm font-medium text-white/70">Drinks Taken:</h3>
          <p class="text-xl font-bold flex items-center justify-end gap-2">
            <Icon icon="mdi:glass-cocktail" class="w-5 h-5" />
            <span>{{ currentPlayer?.drinks || 0 }}</span>
          </p>
        </div>
      </div>

      <!-- Main Game Card -->
      <div
        class="relative w-full h-72 mb-8 cursor-pointer perspective-1000"
        @click="flipCard"
      >
        <div
          class="relative w-full h-full transition-transform duration-700 transform-style-preserve-3d"
          :class="{ 'rotate-y-180': cardFlipped }"
        >
          <!-- Front of Card -->
          <div
            class="absolute w-full h-full backface-hidden rounded-2xl flex flex-col justify-center items-center p-6 shadow-lg border-2 border-white/20"
            :class="cardColor"
          >
            <div class="text-center">
              <p class="text-3xl font-bold mb-2">Do or Drink</p>
              <p v-if="!currentCard" class="text-lg opacity-80">
                Draw a card to begin the game
              </p>
              <p v-else class="text-lg opacity-80">
                Level {{ currentCard?.intensity }} Challenge
                <span class="block text-sm mt-1"
                  >{{ currentCard?.drinkAmount }} penalty</span
                >
              </p>
              <div class="mt-6 text-5xl">
                <Icon
                  v-if="currentCard?.intensity === 1"
                  icon="mdi:emoticon-happy"
                />
                <Icon
                  v-else-if="currentCard?.intensity === 2"
                  icon="mdi:emoticon-excited"
                />
                <Icon
                  v-else-if="currentCard?.intensity === 3"
                  icon="mdi:emoticon-devil"
                />
                <Icon v-else icon="mdi:cards" />
              </div>
            </div>
          </div>

          <!-- Back of Card -->
          <div
            class="absolute w-full h-full backface-hidden bg-white text-gray-900 rounded-2xl flex flex-col justify-center items-center p-6 shadow-lg rotate-y-180 border-2 border-white/20"
          >
            <div v-if="currentCard" class="text-center w-full">
              <span
                class="font-bold text-lg px-4 py-1 rounded-full mb-4 inline-flex items-center gap-2"
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
                  class="w-5 h-5"
                />
                Level {{ currentCard.intensity }}
              </span>
              <p class="text-xl font-medium mb-4 px-4">
                {{ currentCard.text }}
              </p>

              <div
                v-if="currentCard.target"
                class="bg-gray-100 rounded-lg p-3 w-full max-w-xs mx-auto"
              >
                <p
                  class="text-sm font-medium text-gray-700 flex items-center justify-center gap-2"
                >
                  <Icon icon="mdi:account-arrow-right" class="w-5 h-5" />
                  <span>
                    To: {{ currentCard.target.name }}
                    <span class="text-lg">{{
                      currentCard.target.gender === "male" ? "♂" : "♀"
                    }}</span>
                  </span>
                </p>
              </div>

              <p class="mt-4 font-semibold text-lg" :class="intensityTextClass">
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
          class="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Icon
            v-if="isDrawing"
            icon="svg-spinners:3-dots-fade"
            class="w-5 h-5"
          />
          <Icon v-else icon="mdi:cards" class="w-5 h-5" />
          {{ isDrawing ? "Generating..." : "Draw Card" }}
        </button>
        <button
          @click="completeChallenge"
          :disabled="!currentCard || !cardFlipped"
          class="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Icon icon="mdi:check-bold" class="w-5 h-5" />
          Completed
        </button>
      </div>

      <!-- Drink Button -->
      <button
        v-if="currentCard && cardFlipped"
        @click="takeDrink"
        class="w-full mb-6 bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2"
      >
        <Icon icon="mdi:glass-cocktail" class="w-5 h-5" />
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
    color: "from-green-600 to-teal-600",
    textColor: "text-green-800",
    bgColor: "bg-green-100",
  },
  {
    name: "Medium",
    color: "from-yellow-600 to-orange-600",
    textColor: "text-yellow-800",
    bgColor: "bg-yellow-100",
  },
  {
    name: "Hot",
    color: "from-red-600 to-pink-600",
    textColor: "text-red-800",
    bgColor: "bg-red-100",
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
  if (!currentCard.value) return "bg-gradient-to-br from-gray-600 to-gray-700";
  return (
    INTENSITY_LEVELS[currentCard.value.intensity - 1]?.color ||
    "bg-gradient-to-br from-gray-600 to-gray-700"
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
  if (!challengeTracker) {
    return {
      question: { text: 'Questions are loading... Please wait.', intensity: 1, drinkAmount: '1 sip' },
      isRepeat: false
    }
  }
  
  const result = challengeTracker.getNextQuestion();
  
  // Log usage stats for debugging
  const stats = challengeTracker.getUsageStats.value;
  console.log(`Do or Drink - Used: ${stats.usedCount}/${stats.totalQuestions} (${stats.usagePercentage}%)`);
  
  return result.question;
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

  return {
    text: challengeText,
    intensity,
    drinkAmount,
    target,
  };
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
    const response = await $fetch('/api/questions/do-or-drink?limit=100')
    console.log('Do or Drink API response:', response)
    const questions = response.questions || []
    
    // Create tracker with loaded questions
    challengeTracker = useDoOrDrinkTracker(questions.map(q => ({
      text: q.text,
      intensity: q.intensity,
      drinkAmount: q.drinkAmount || '2 sips'
    })))
    challengeTracker.initializeTracker();
    
    console.log(`✅ Loaded ${questions.length} Do or Drink questions`)
  } catch (error) {
    console.error('❌ Error loading Do or Drink questions:', error)
    // Fallback questions
    challengeTracker = useDoOrDrinkTracker([
      { text: 'Give someone a compliment', intensity: 1, drinkAmount: '1 sip' },
      { text: 'Do a funny dance', intensity: 2, drinkAmount: '2 sips' },
      { text: 'Tell a joke', intensity: 1, drinkAmount: '1 sip' },
      { text: 'Give someone a high five', intensity: 1, drinkAmount: '1 sip' },
      { text: 'Do your best impression', intensity: 2, drinkAmount: '2 sips' },
      { text: 'Sing a song', intensity: 2, drinkAmount: '2 sips' },
      { text: 'Do 10 push-ups', intensity: 3, drinkAmount: '3 sips' }
    ])
    challengeTracker.initializeTracker();
    console.log('⚠️ Using fallback Do or Drink questions')
  }
}

onMounted(async () => {
  if (typeof window !== "undefined") {
    // Load questions from database
    await loadQuestions()
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
