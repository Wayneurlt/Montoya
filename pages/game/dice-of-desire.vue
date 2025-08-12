<template>
  <div
    class="min-h-screen bg-gradient-to-br from-rose-900 via-fuchsia-900 to-purple-900 text-white p-4 relative overflow-hidden"
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

    <!-- Rules Modal -->
    <div
      v-if="showRules"
      class="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
    >
      <div
        class="bg-gradient-to-br from-purple-900 to-rose-900 rounded-2xl p-6 max-w-md w-full shadow-2xl border border-white/20 backdrop-blur-md"
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
                  >Relationship Mode:</span
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
    <div v-else class="max-w-2xl mx-auto relative z-10">
      <!-- Game Mode Indicator -->
      <div class="flex justify-center mb-4">
        <div
          class="bg-white/10 rounded-full px-4 py-1 text-sm flex items-center gap-2"
        >
          <Icon
            :icon="
              gameMode === 'free-for-all' ? 'mdi:account-group' : 'mdi:heart'
            "
            class="w-4 h-4"
          />
          {{
            gameMode === "free-for-all" ? "Free-for-All" : "Relationship Mode"
          }}
          <span class="ml-2 px-2 py-0.5 rounded-full bg-pink-500/20 text-xs"
            >Level {{ gameLevel }}</span
          >
        </div>
      </div>

      <!-- Player Status -->
      <div
        class="flex justify-between items-center mb-6 p-4 bg-gradient-to-r from-white/5 to-white/10 rounded-xl border border-white/10"
      >
        <div>
          <h3 class="text-sm font-medium text-white/70">Current Roller:</h3>
          <p class="text-xl font-bold flex items-center gap-2">
            <span>{{ currentPlayer.name }}</span>
            <span class="text-2xl">{{
              currentPlayer.gender === "male" ? "♂" : "♀"
            }}</span>
          </p>
        </div>
        <div class="text-right">
          <h3 class="text-sm font-medium text-white/70">Target:</h3>
          <p class="text-xl font-bold flex items-center justify-end gap-2">
            <span class="text-2xl">{{
              targetPlayer.gender === "male" ? "♂" : "♀"
            }}</span>
            <span>{{ targetPlayer.name }}</span>
          </p>
        </div>
      </div>

      <!-- Dice Area -->
      <div
        class="relative bg-white/10 rounded-2xl p-6 md:p-8 mb-8 border border-white/20"
      >
        <div class="flex justify-center gap-6 md:gap-10 mb-8">
          <!-- Body Part Die -->
          <div
            @click="rollDice"
            class="w-20 h-20 md:w-24 md:h-24 bg-white rounded-xl shadow-lg flex flex-col justify-center items-center cursor-pointer transition-all"
            :class="{
              'animate-spin': isRolling,
              'scale-110': !isRolling && currentRoll.body,
              'ring-4 ring-pink-500': currentRoll.body === 'Your Choice',
            }"
          >
            <div v-if="!isRolling" class="text-center">
              <p class="text-xs md:text-sm text-gray-800">Body Part</p>
              <p class="text-lg md:text-xl font-bold text-black">
                {{ currentRoll.body || "?" }}
              </p>
            </div>
            <div v-else class="text-center">
              <p class="text-xs md:text-sm text-gray-800">Rolling...</p>
              <p class="text-lg md:text-xl font-bold text-black">⚄</p>
            </div>
          </div>

          <!-- Action Die -->
          <div
            @click="rollDice"
            class="w-20 h-20 md:w-24 md:h-24 bg-white rounded-xl shadow-lg flex flex-col justify-center items-center cursor-pointer transition-all"
            :class="{
              'animate-spin': isRolling,
              'scale-110': !isRolling && currentRoll.action,
              'ring-4 ring-pink-500': currentRoll.action === 'Your Choice',
            }"
          >
            <div v-if="!isRolling" class="text-center">
              <p class="text-xs md:text-sm text-gray-800">Action</p>
              <p class="text-lg md:text-xl font-bold text-black">
                {{ currentRoll.action || "?" }}
              </p>
            </div>
            <div v-else class="text-center">
              <p class="text-xs md:text-sm text-gray-800">Rolling...</p>
              <p class="text-lg md:text-xl font-bold text-black">⚂</p>
            </div>
          </div>
        </div>

        <button
          @click="rollDice"
          :disabled="isRolling || isTimerRunning"
          class="w-full bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 py-3 md:py-4 rounded-xl font-bold text-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          <Icon
            v-if="isRolling"
            icon="svg-spinners:3-dots-fade"
            class="w-5 h-5"
          />
          <Icon v-else icon="mdi:dice" class="w-5 h-5" />
          {{ isRolling ? "Rolling..." : "Roll Dice" }}
        </button>
      </div>

      <!-- Result Display -->
      <div
        v-if="currentResult"
        class="bg-white/10 rounded-2xl p-6 mb-8 border border-white/20"
      >
        <h3
          class="text-xl font-bold mb-4 text-center flex items-center justify-center gap-2"
        >
          <Icon icon="mdi:fire" class="w-5 h-5 text-pink-400" />
          <span>Your Command</span>
        </h3>
        <div
          class="bg-gradient-to-r from-pink-500/20 to-purple-500/20 rounded-lg p-4 mb-6 border border-white/10"
        >
          <p class="text-2xl font-bold text-center">{{ currentResult }}</p>
          <p
            v-if="specialEffect"
            class="text-center mt-2 text-pink-300 font-semibold flex items-center justify-center gap-2"
          >
            <Icon :icon="specialEffectIcon" class="w-5 h-5" />
            {{ specialEffect }}
          </p>
        </div>

        <!-- Timer -->
        <div class="flex flex-col items-center">
          <div class="relative w-32 h-32 mb-6">
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

          <div class="flex gap-4">
            <button
              @click="completeAction"
              class="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 px-6 py-2 rounded-lg font-medium flex items-center gap-2"
            >
              <Icon icon="mdi:check-bold" class="w-5 h-5" />
              Completed
            </button>
            <button
              @click="failAction"
              class="bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 px-6 py-2 rounded-lg font-medium flex items-center gap-2"
            >
              <Icon icon="mdi:close-thick" class="w-5 h-5" />
              Failed
            </button>
          </div>
        </div>
      </div>

      <!-- History -->
      <div class="bg-white/10 rounded-2xl p-6 border border-white/20">
        <h3 class="text-xl font-bold mb-4 flex items-center gap-2">
          <Icon icon="mdi:history" class="w-5 h-5" />
          <span>Game History</span>
        </h3>
        <ul class="space-y-3 max-h-60 overflow-y-auto pr-2">
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
import { ref, computed, onMounted, onBeforeUnmount } from "vue";
import { Icon } from "@iconify/vue";
// Sessionless: no server session polling

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

// Load players from game session
const gameSession = getLocalStorage("gameSession", {});
const players = ref(gameSession.players || []);
const currentPlayerIndex = ref(0);

// Set game mode from session
if (gameSession.mode) {
  gameMode.value = gameSession.mode;
}

// Computed Properties
const currentPlayer = computed(
  () => players.value[currentPlayerIndex.value] || {}
);
const targetPlayer = computed(() => {
  if (players.value.length === 0) return {};

  if (gameMode.value === "relationship") {
    // In relationship mode, target is always the partner
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
  if (players.value.length === 0) {
    players.value = [
      { id: "1", name: "Player 1", gender: "male" },
      { id: "2", name: "Player 2", gender: "female" },
    ];
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

const { nextCard, wildcard } = useCardsApi();

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
