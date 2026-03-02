<template>
  <div
    class="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 text-white p-3 sm:p-4 relative overflow-x-hidden overflow-y-auto safe-bottom"
  >
    <!-- Background Icons Pattern -->
    <BackgroundIcons />

    <!-- Rules Modal -->
    <div
      v-if="showRules"
      class="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
    >
        <div
          class="bg-gradient-to-br from-purple-900 to-pink-900 rounded-2xl p-6 max-w-md w-full shadow-2xl border border-white/20 backdrop-blur-md"
        >
        <h2
          class="text-3xl font-bold mb-4 text-center bg-clip-text text-transparent bg-gradient-to-r from-pink-500 to-cyan-400"
        >
          Dice of Desire
        </h2>
        <div class="text-center mb-6 text-pink-200">
          Roll for intimate commands and escalating challenges
        </div>

        <div class="space-y-4 mb-6">
          <div class="bg-white/10 p-4 rounded-xl">
            <h3 class="font-bold text-lg mb-2 flex items-center gap-2">
              <Icon icon="mdi:account-group" class="w-5 h-5" />
              <span>Game Modes</span>
            </h3>
            <ul class="list-disc pl-5 space-y-1">
              <li>
                <span class="font-semibold text-pink-300">Free-for-All:</span>
                Roll for any opposite-gender player
              </li>
              <li>
                <span class="font-semibold text-cyan-300"
                  >Paired Mode:</span
                >
                Roll only for your partner
              </li>
            </ul>
          </div>

          <div class="bg-white/10 p-4 rounded-xl">
            <h3 class="font-bold text-lg mb-2 flex items-center gap-2">
              <Icon icon="mdi:dice-multiple" class="w-5 h-5" />
              <span>Special Rolls</span>
            </h3>
            <ul class="list-disc pl-5 space-y-1">
              <li>
                <span class="font-semibold">"Your Choice":</span> Target picks
                the action
              </li>
              <li>
                <span class="font-semibold">Matching numbers:</span> 1 minute
                duration + remove clothing
              </li>
              <li>
                <span class="font-semibold text-red-300">Snake eyes (⚀⚀):</span>
                Immediately switch roles
              </li>
              <li>
                <span class="font-semibold text-green-300"
                  >Double six (⚅⚅):</span
                >
                Both players perform the action
              </li>
            </ul>
          </div>
        </div>

        <button
          @click="startGame"
          class="w-full bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2"
        >
          <Icon icon="mdi:dice" class="w-5 h-5" />
          Start Game
        </button>
      </div>
    </div>

    <!-- Game Board -->
    <div v-else class="max-w-3xl mx-auto relative z-10">
      <!-- Header with Home Button & Game Mode -->
      <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-0 mb-4 sm:mb-6">
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
        
        <div
          class="bg-white/10 backdrop-blur-md rounded-lg sm:rounded-xl px-3 sm:px-5 py-1.5 sm:py-2 text-xs sm:text-sm md:text-base flex items-center gap-1.5 sm:gap-2 border-2 border-white/20 shadow-lg w-full sm:w-auto justify-center sm:justify-end"
        >
          <Icon
            :icon="
              gameMode === 'free-for-all' ? 'mdi:account-group' : 'mdi:heart'
            "
            class="w-4 h-4 sm:w-5 sm:h-5 text-pink-400"
          />
          <span class="font-bold hidden sm:inline">{{
            gameMode === "free-for-all" ? "Free-for-All" : "Paired"
          }}</span>
          <span class="font-bold sm:hidden">{{
            gameMode === "free-for-all" ? "FFA" : "Paired"
          }}</span>
          <span class="ml-1 px-2 sm:px-3 py-0.5 sm:py-1 rounded-full bg-pink-500/30 text-xs sm:text-sm font-bold border border-pink-400/50"
            >Lv {{ gameLevel }}</span
          >
        </div>
      </div>
      
      <!-- Game Title -->
      <div class="text-center mb-3 sm:mb-4 md:mb-6">
        <h1 class="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black mb-1 sm:mb-2 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-pink-500 to-cyan-400 drop-shadow-2xl px-2">
          Dice of Desire
        </h1>
        <p class="text-purple-200/80 text-[10px] sm:text-xs md:text-sm font-medium px-2">Roll for intimate commands!</p>
      </div>

      <!-- Player Status -->
      <div
        class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-0 mb-3 sm:mb-4 md:mb-6 p-2 sm:p-3 md:p-4 lg:p-6 bg-gradient-to-r from-white/10 to-white/5 rounded-lg sm:rounded-xl md:rounded-2xl border-2 border-white/20 shadow-2xl backdrop-blur-lg"
      >
        <div class="w-full sm:w-auto">
          <h3 class="text-xs font-bold text-white/60 uppercase tracking-wider mb-1">Current Roller</h3>
          <p class="text-xl sm:text-2xl font-black flex items-center gap-2">
            <span class="truncate">{{ currentPlayer.name }}</span>
            <span class="text-2xl sm:text-3xl text-blue-400 flex-shrink-0">{{
              currentPlayer.gender === "male" ? "♂" : "♀"
            }}</span>
          </p>
        </div>
        <div class="text-left sm:text-right w-full sm:w-auto">
          <h3 class="text-xs font-bold text-white/60 uppercase tracking-wider mb-1">Target</h3>
          <p class="text-xl sm:text-2xl font-black flex items-center sm:justify-end gap-2">
            <span class="text-2xl sm:text-3xl text-pink-400 flex-shrink-0">{{
              targetPlayer.gender === "male" ? "♂" : "♀"
            }}</span>
            <span class="truncate">{{ targetPlayer.name }}</span>
          </p>
        </div>
      </div>

      <!-- Dice Area -->
      <div
        class="relative bg-gradient-to-br from-purple-950/60 to-pink-950/60 rounded-xl sm:rounded-2xl md:rounded-3xl p-3 sm:p-4 md:p-6 lg:p-8 mb-3 sm:mb-4 md:mb-6 border-2 border-purple-700/40 shadow-2xl shadow-purple-900/30 backdrop-blur-lg"
      >
        <div class="flex justify-center gap-3 sm:gap-4 md:gap-6 lg:gap-8 mb-4 sm:mb-5 md:mb-6">
          <!-- Body Part Die -->
          <div
            @click="rollDice"
            class="group w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 lg:w-32 lg:h-32 bg-gradient-to-br from-purple-700 to-pink-800 rounded-xl sm:rounded-2xl shadow-2xl flex flex-col justify-center items-center cursor-pointer transition-all hover:scale-110"
            :class="{
              'animate-spin': isRolling,
              'scale-110': !isRolling && currentRoll.body,
              'ring-4 ring-purple-400 shadow-purple-600/50': currentRoll.body === 'Your Choice',
            }"
          >
            <div v-if="!isRolling" class="text-center px-1 sm:px-2">
              <p class="text-[10px] sm:text-xs md:text-sm text-white/80 font-bold mb-0.5 sm:mb-1">Body Part</p>
              <p class="text-xs sm:text-sm md:text-base lg:text-lg font-black text-white leading-tight">
                {{ currentRoll.body || "?" }}
              </p>
            </div>
            <div v-else class="text-center">
              <p class="text-[10px] sm:text-xs text-white/80 font-bold">Rolling...</p>
              <p class="text-xl sm:text-2xl md:text-3xl font-bold text-white">⚄</p>
            </div>
          </div>

          <!-- Action Die -->
          <div
            @click="rollDice"
            class="group w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 lg:w-32 lg:h-32 bg-gradient-to-br from-pink-700 to-purple-800 rounded-xl sm:rounded-2xl shadow-2xl flex flex-col justify-center items-center cursor-pointer transition-all hover:scale-110"
            :class="{
              'animate-spin': isRolling,
              'scale-110': !isRolling && currentRoll.action,
              'ring-4 ring-pink-400 shadow-pink-600/50': currentRoll.action === 'Your Choice',
            }"
          >
            <div v-if="!isRolling" class="text-center px-1 sm:px-2">
              <p class="text-[10px] sm:text-xs md:text-sm text-white/80 font-bold mb-0.5 sm:mb-1">Action</p>
              <p class="text-xs sm:text-sm md:text-base lg:text-lg font-black text-white leading-tight">
                {{ currentRoll.action || "?" }}
              </p>
            </div>
            <div v-else class="text-center">
              <p class="text-[10px] sm:text-xs text-white/80 font-bold">Rolling...</p>
              <p class="text-xl sm:text-2xl md:text-3xl font-bold text-white">⚂</p>
            </div>
          </div>
        </div>

        <button
          @click="rollDice"
          :disabled="isRolling || isTimerRunning"
          class="group w-full bg-gradient-to-r from-purple-700 to-pink-700 hover:from-purple-600 hover:to-pink-600 py-3 sm:py-4 md:py-5 rounded-xl sm:rounded-2xl font-black text-base sm:text-lg md:text-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 sm:gap-3 shadow-xl hover:shadow-purple-600/50 border-2 border-purple-500/30 hover:scale-105"
        >
          <Icon
            v-if="isRolling"
            icon="svg-spinners:3-dots-fade"
            class="w-6 h-6"
          />
          <Icon v-else icon="mdi:dice" class="w-6 h-6 group-hover:rotate-45 transition-transform" />
          {{ isRolling ? "Rolling..." : "Roll Dice" }}
        </button>
      </div>

      <!-- Result Display -->
      <div
        v-if="currentResult"
        class="bg-gradient-to-br from-purple-950/60 to-pink-950/60 rounded-xl sm:rounded-2xl md:rounded-3xl p-3 sm:p-4 md:p-6 mb-3 sm:mb-4 md:mb-6 border-2 border-purple-700/40 shadow-2xl shadow-purple-900/30 backdrop-blur-lg"
      >
        <h3
          class="text-base sm:text-lg md:text-xl lg:text-2xl font-black mb-2 sm:mb-3 md:mb-4 text-center flex items-center justify-center gap-1.5 sm:gap-2 md:gap-3"
        >
          <Icon icon="mdi:fire" class="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-7 text-orange-500 animate-pulse" />
          <span class="bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-500">Your Command</span>
          <Icon icon="mdi:fire" class="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-7 text-orange-500 animate-pulse" style="animation-delay: 0.5s;" />
        </h3>
        <div
          class="bg-gradient-to-r from-purple-700/40 to-pink-700/40 rounded-lg sm:rounded-xl md:rounded-2xl p-3 sm:p-4 md:p-6 mb-3 sm:mb-4 md:mb-6 border-2 border-purple-600/30 shadow-xl"
        >
          <p class="text-lg sm:text-xl md:text-2xl lg:text-3xl font-black text-center leading-relaxed drop-shadow-lg px-2">{{ currentResult }}</p>
          <p
            v-if="specialEffect"
            class="text-center mt-4 text-yellow-300 font-bold text-lg flex items-center justify-center gap-2 bg-black/20 rounded-full px-6 py-3 mx-auto inline-flex"
          >
            <Icon :icon="specialEffectIcon" class="w-6 h-6" />
            {{ specialEffect }}
          </p>
        </div>

        <!-- Timer -->
        <div class="flex flex-col items-center">
          <div class="relative w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 mb-3 sm:mb-4 md:mb-6">
            <svg class="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
              <path
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke="rgba(255,255,255,0.2)"
                stroke-width="3"
              />
              <path
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke="url(#timerGradient)"
                stroke-width="3"
                stroke-linecap="round"
                :stroke-dasharray="`${timerPercent}, 100`"
              />
              <defs>
                <linearGradient
                  id="timerGradient"
                  x1="0%"
                  y1="0%"
                  x2="100%"
                  y2="0%"
                >
                  <stop offset="0%" stop-color="#ec4899" />
                  <stop offset="100%" stop-color="#8b5cf6" />
                </linearGradient>
              </defs>
            </svg>
            <span
              class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-2xl font-bold"
              :class="secondsLeft <= 5 ? 'text-red-400' : 'text-white'"
            >
              {{ secondsLeft }}s
            </span>
          </div>

          <div class="flex gap-2 sm:gap-3 md:gap-4">
            <button
              @click="completeAction"
              class="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 px-3 sm:px-4 md:px-6 py-1.5 sm:py-2 rounded-lg font-medium flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm md:text-base"
            >
              <Icon icon="mdi:check-bold" class="w-4 h-4 sm:w-5 sm:h-5" />
              Completed
            </button>
            <button
              @click="failAction"
              class="bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 px-3 sm:px-4 md:px-6 py-1.5 sm:py-2 rounded-lg font-medium flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm md:text-base"
            >
              <Icon icon="mdi:close-thick" class="w-4 h-4 sm:w-5 sm:h-5" />
              Failed
            </button>
          </div>
        </div>
      </div>

      <!-- History -->
      <div class="bg-white/10 rounded-lg sm:rounded-xl md:rounded-2xl p-3 sm:p-4 md:p-6 border border-white/20">
        <h3 class="text-base sm:text-lg md:text-xl font-bold mb-2 sm:mb-3 md:mb-4 flex items-center gap-1.5 sm:gap-2">
          <Icon icon="mdi:history" class="w-4 h-4 sm:w-5 sm:h-5" />
          <span>Game History</span>
        </h3>
        <ul class="space-y-2 sm:space-y-3 max-h-40 sm:max-h-50 md:max-h-60 overflow-y-auto pr-2 text-xs sm:text-sm">
          <li
            v-for="(item, index) in history"
            :key="index"
            class="pb-3 border-b border-white/10 last:border-0 group"
          >
            <div class="flex justify-between items-start">
              <div>
                <p class="font-semibold">
                  <span class="text-pink-300">{{ item.roller }}</span> →
                  <span class="text-cyan-300">{{ item.target }}</span
                  >:
                </p>
                <p class="mt-1">{{ item.result }}</p>
                <p
                  v-if="item.special"
                  class="text-pink-300 text-sm mt-1 flex items-center gap-1"
                >
                  <Icon :icon="getEffectIcon(item.special)" class="w-4 h-4" />
                  {{ item.special }}
                </p>
              </div>
              <span
                class="opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Icon
                  v-if="item.status === 'completed'"
                  icon="mdi:check-circle"
                  class="w-5 h-5 text-green-400"
                />
                <Icon
                  v-else-if="item.status === 'failed'"
                  icon="mdi:close-circle"
                  class="w-5 h-5 text-red-400"
                />
              </span>
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
import { useGameStore } from "~/stores/game";
import { navigateTo } from "#app";
// Sessionless: no server session polling

const gameStore = useGameStore();

// Game Configuration
const BODY_PARTS = [
  "Lips",
  "Neck",
   "Hips",
  "Thighs",
  "Inner Thigh",
  "Crotch",
  "Below Navel",
  "Ass",
  "Nipples",
  "Boobs",
  "Your Choice",
];

const ACTIONS = [
  "Kiss",
  "Lick",
  "Nibble",
  "Massage",
  "Caress",
  "Suck",
  "Gentle Bite",
  "Grab",
  "Trace with Finger",
  "Blow On",
  "Kiss and Suck",
  "Lick and Suck",
  "Tease",
  "Your Choice",
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
const showRules = ref(true);
const isRolling = ref(false);
const isTimerRunning = ref(false);
const secondsLeft = ref(30);
const timerPercent = ref(100);
const timer = ref(null);
const specialEffect = ref("");
const specialEffectIcon = ref("mdi:star");
const gameMode = ref("free-for-all"); // 'free-for-all' or 'relationship'
const gameLevel = ref(1);
const currentRoll = ref({ body: "", action: "" });
const currentResult = ref("");
const history = ref([]);

// Load players from game store
const players = computed(() => gameStore.players);
const currentPlayerIndex = ref(gameStore.currentPlayerIndex || 0);

// Set game mode from store
watch(() => gameStore.gameMode, (newMode) => {
  if (newMode) {
    gameMode.value = newMode;
  }
}, { immediate: true });

// Computed Properties
const currentPlayer = computed(
  () => players.value[currentPlayerIndex.value] || {}
);
const targetPlayer = computed(() => {
  if (players.value.length === 0) return {};

  if (gameMode.value === "relationship") {
    // In paired mode, target is always the partner
    return (
      players.value.find((p) => p.id === currentPlayer.value.partnerId) || {}
    );
  }

  // Free-for-all mode - find opposite gender
  const oppositeGenderPlayers = players.value.filter(
    (p) =>
      p.id !== currentPlayer.value.id && p.gender !== currentPlayer.value.gender
  );

  // If no opposite gender, just pick someone else
  if (oppositeGenderPlayers.length === 0) {
    return players.value.find((p) => p.id !== currentPlayer.value.id) || {};
  }

  return oppositeGenderPlayers[
    Math.floor(Math.random() * oppositeGenderPlayers.length)
  ];
});

// Lifecycle Hooks
onMounted(() => {
  // Load game state from store
  gameStore.loadFromLocalStorage();
  
  // Set game mode from store
  if (gameStore.gameMode) {
    gameMode.value = gameStore.gameMode;
  }
  
  // Redirect if no players
  if (players.value.length === 0) {
    navigateTo('/setup?game=dice-of-desire');
  }
});

onBeforeUnmount(() => {
  clearInterval(timer.value);
});

// Helper Functions
const getEffectIcon = (effectText) => {
  if (effectText.includes("Snake Eyes")) return "mdi:dice-1";
  if (effectText.includes("Double Six")) return "mdi:dice-6";
  if (effectText.includes("Matching")) return "mdi:heart";
  if (effectText.includes("remove clothing")) return "mdi:tshirt-crew-off";
  return "mdi:star";
};

// No DB card fetching here

// Game Logic
const startGame = () => {
  showRules.value = false;
};

const rollDice = async () => {
  if (isRolling.value || isTimerRunning.value) return;

  // Reset previous result
  currentResult.value = "";
  specialEffect.value = "";
  isRolling.value = true;

  // Show rolling animation for at least 1 second
  await new Promise((resolve) => setTimeout(resolve, 1000));

  let validCombination = false;
  let attempts = 0;
  const maxAttempts = 10;
  let bodyPart, action;

  while (!validCombination && attempts < maxAttempts) {
    attempts++;
    const bodyIndex = Math.floor(Math.random() * BODY_PARTS.length);
    const actionIndex = Math.floor(Math.random() * ACTIONS.length);
    bodyPart = BODY_PARTS[bodyIndex];
    action = ACTIONS[actionIndex];

    // "Your Choice" is always valid
    if (bodyPart === "Your Choice" || action === "Your Choice") {
      validCombination = true;
    } else {
      // Validate combination based on game mode
      validCombination = true;
    }
  }

  currentRoll.value = { body: bodyPart, action: action };
  const bodyIndex = BODY_PARTS.indexOf(bodyPart);
  const actionIndex = ACTIONS.indexOf(action);

  // Check for special combinations
  let timerDuration = 30;

  // Snake Eyes (1+1)
  if (bodyIndex === 0 && actionIndex === 0) {
    specialEffect.value = "Snake Eyes! Switch roles immediately";
    specialEffectIcon.value = "mdi:account-switch";
    switchRoles();
  }
  // Double Six (6+6 - assuming 6 is the last index)
  else if (
    bodyIndex === BODY_PARTS.length - 1 &&
    actionIndex === ACTIONS.length - 1
  ) {
    specialEffect.value = "Double Six! Both players perform the action";
    specialEffectIcon.value = "mdi:account-multiple";
    timerDuration = 45;
  }
  // Matching numbers
  else if (bodyIndex === actionIndex) {
    specialEffect.value = "Matching! 1 minute + remove clothing";
    specialEffectIcon.value = "mdi:heart";
    timerDuration = 60;
  }

  // Try database for DICE_OF_DESIRE as a DO card at intensity mapped from randomness (optional)
  // You can keep local logic only; leaving DB fetch out here since dice is compositional
  currentResult.value = `${action} ${bodyPart}`;
  startTimer(timerDuration);

  // Add to history
  history.value.unshift({
    roller: currentPlayer.value.name,
    target: targetPlayer.value.name,
    result: currentResult.value,
    special: specialEffect.value,
    status: null,
  });

  isRolling.value = false;
};

const startTimer = (duration) => {
  clearInterval(timer.value);
  isTimerRunning.value = true;
  secondsLeft.value = duration;
  const totalDuration = duration;

  timer.value = setInterval(() => {
    secondsLeft.value--;
    timerPercent.value = (secondsLeft.value / totalDuration) * 100;

    if (secondsLeft.value <= 0) {
      clearInterval(timer.value);
      isTimerRunning.value = false;
      if (history.value.length > 0) {
        history.value[0].status = "failed";
      }
      // no server turn advance
    }
  }, 1000);
};

const switchRoles = () => {
  currentPlayerIndex.value =
    (currentPlayerIndex.value + 1) % players.value.length;
  gameStore.currentPlayerIndex = currentPlayerIndex.value;
};

const nextTurn = () => {
  switchRoles();
  currentResult.value = "";
  specialEffect.value = "";
  isTimerRunning.value = false;
  clearInterval(timer.value);
};

const completeAction = () => {
  clearInterval(timer.value);
  if (history.value.length > 0) {
    history.value[0].status = "completed";
  }
  setTimeout(nextTurn, 500);

  // Increase game level occasionally
  if (Math.random() > 0.7) {
    gameLevel.value = Math.min(gameLevel.value + 1, 5);
  }
};

const failAction = () => {
  clearInterval(timer.value);
  if (history.value.length > 0) {
    history.value[0].status = "failed";
  }
  setTimeout(nextTurn, 500);
};
</script>

<style>
@keyframes spin {
  0% {
    transform: rotate(0deg) scale(1);
  }
  50% {
    transform: rotate(180deg) scale(1.1);
  }
  100% {
    transform: rotate(360deg) scale(1);
  }
}
.animate-spin {
  animation: spin 0.8s linear infinite;
}

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
