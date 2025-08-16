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
        <div class="flex justify-center items-center gap-2 flex-wrap">
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
          <!-- Spicy Mode Toggle -->
          <button
            @click="isSpicyMode = !isSpicyMode"
            class="text-sm px-3 py-1 rounded-full transition-all"
            :class="
              isSpicyMode
                ? 'bg-red-500/20 text-red-300 border border-red-400/50'
                : 'bg-gray-500/20 text-gray-300 border border-gray-400/50'
            "
          >
            {{ isSpicyMode ? '🌶️ Spicy' : '😇 Normal' }}
          </button>
        </div>
      </div>

      <!-- Player Status Bar -->
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
          <h3 class="text-sm font-medium text-white/70">Clothing Left:</h3>
          <p class="text-xl font-bold flex items-center justify-end gap-1">
            <span>{{ remainingClothing }}</span>
            <Icon icon="mdi:tshirt-crew" class="w-5 h-5" />
          </p>
        </div>
      </div>

      <!-- Clothing Status -->
      <div class="mb-8">
        <h3 class="text-lg font-semibold mb-3 flex items-center gap-2">
          <Icon icon="mdi:wardrobe" class="w-5 h-5" />
          <span>Clothing Status</span>
        </h3>
        <div class="flex flex-wrap gap-2">
          <div
            v-for="(item, index) in clothingItems"
            :key="index"
            class="px-4 py-2 rounded-full transition-all flex items-center gap-2"
            :class="
              item.removed
                ? 'bg-gray-700/50 text-gray-400 line-through'
                : 'bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 cursor-pointer'
            "
            @click="toggleClothing(index)"
          >
            <Icon :icon="item.icon" class="w-4 h-4" />
            <span>{{ item.name }}</span>
          </div>
        </div>
      </div>

      <!-- Game Card -->
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
            class="absolute w-full h-full backface-hidden bg-gradient-to-br from-pink-600 to-purple-600 rounded-2xl flex flex-col justify-center items-center p-6 shadow-lg border-2 border-white/20"
          >
            <div class="text-center">
              <p class="text-3xl font-bold mb-4">Truth or Dare?</p>
              <p v-if="!currentCard" class="text-lg opacity-80">
                Draw a card to begin the game
              </p>
              <p v-else class="text-lg opacity-80">
                Click to reveal your challenge
              </p>
              <div class="mt-6 text-5xl">
                <Icon
                  v-if="currentCard?.type === 'TRUTH'"
                  icon="mdi:chat-question"
                />
                <Icon
                  v-else-if="currentCard?.type === 'DARE'"
                  icon="mdi:fire"
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
                :class="
                  currentCard.type === 'TRUTH'
                    ? 'bg-blue-100 text-blue-800'
                    : 'bg-pink-100 text-pink-800'
                "
              >
                <Icon
                  :icon="
                    currentCard.type === 'TRUTH'
                      ? 'mdi:chat-question'
                      : 'mdi:fire'
                  "
                  class="w-5 h-5"
                />
                {{ currentCard.type }}
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
            </div>
          </div>
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="grid grid-cols-2 gap-4 mb-6">
        <button
          @click="drawCard"
          class="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          :disabled="isDrawing || currentCard"
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
          class="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          :disabled="!currentCard || !cardFlipped"
        >
          <Icon icon="mdi:check-bold" class="w-5 h-5" />
          Completed
        </button>
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
import { truthQuestions } from "~/data/questions/truth";
import { spicyTruthQuestions } from "~/data/questions/spicytruth";
import { dareQuestions } from "~/data/questions/dare";
import { spicyDareQuestions } from "~/data/questions/spicydare";
import { useTruthTracker, useDareTracker } from "~/composables/useQuestionTracker";

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

// Initialize question trackers
const normalTruthTracker = useTruthTracker(truthQuestions, false);
const spicyTruthTracker = useTruthTracker(spicyTruthQuestions, true);
const normalDareTracker = useDareTracker(dareQuestions, false);
const spicyDareTracker = useDareTracker(spicyDareQuestions, true);

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

const drawCard = async () => {
  if (isDrawing.value || currentCard.value) return;
  isDrawing.value = true;
  cardFlipped.value = false;

  const type = Math.random() > 0.5 ? "TRUTH" : "DARE";
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

  isDrawing.value = false;
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

// Lifecycle Hooks
onMounted(() => {
  if (typeof window !== "undefined") {
    // Initialize question trackers
    normalTruthTracker.initializeTracker();
    spicyTruthTracker.initializeTracker();
    normalDareTracker.initializeTracker();
    spicyDareTracker.initializeTracker();
    
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
