<template>
  <div
    class="min-h-screen bg-nightlife text-paper p-3 sm:p-4 relative overflow-x-hidden overflow-y-auto safe-bottom"
  >
    <!-- Background Icons Pattern -->
    <BackgroundIcons />

    <!-- Rules Modal -->
    <div
      v-if="showRules"
      class="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
    >
      <div class="card-poster p-6 max-w-md w-full">
        <h2 class="font-display text-3xl font-bold uppercase mb-4 text-center text-paper">
          Dice <span class="text-hot">of</span> Desire
        </h2>
        <div class="text-center mb-6 text-paper/70 text-sm font-medium">
          Roll for intimate commands and escalating challenges
        </div>

        <div class="space-y-4 mb-6">
          <div class="bg-card border border-white/10 p-4 rounded-md">
            <h3 class="font-display uppercase tracking-wide font-bold text-base mb-2 flex items-center gap-2">
              <Icon icon="mdi:account-group" class="w-5 h-5 text-hot" />
              <span>Game Modes</span>
            </h3>
            <ul class="list-disc pl-5 space-y-1 text-sm text-paper/80">
              <li>
                <span class="font-semibold text-hot">Free-for-All:</span>
                Roll for any opposite-gender player
              </li>
              <li>
                <span class="font-semibold text-volt">Paired Mode:</span>
                Roll only for your partner
              </li>
            </ul>
          </div>

          <div class="bg-card border border-white/10 p-4 rounded-md">
            <h3 class="font-display uppercase tracking-wide font-bold text-base mb-2 flex items-center gap-2">
              <Icon icon="mdi:dice-multiple" class="w-5 h-5 text-volt" />
              <span>Special Rolls</span>
            </h3>
            <ul class="list-disc pl-5 space-y-1 text-sm text-paper/80">
              <li>
                <span class="font-semibold text-paper">"Your Choice":</span> Target picks
                the action
              </li>
              <li>
                <span class="font-semibold text-paper">Matching numbers:</span> 1 minute
                duration + remove clothing
              </li>
              <li>
                <span class="font-semibold text-hot">Snake eyes (⚀⚀):</span>
                Immediately switch roles
              </li>
              <li>
                <span class="font-semibold text-volt">Double six (⚅⚅):</span>
                Both players perform the action
              </li>
            </ul>
          </div>
        </div>

        <button
          @click="startGame"
          class="w-full bg-hot text-ink shadow-hard hover:brightness-110 py-3 rounded-lg font-display font-bold uppercase tracking-wide transition-[filter] flex items-center justify-center gap-2"
        >
          <Icon icon="mdi:dice" class="w-5 h-5" />
          Start Game
        </button>
      </div>
    </div>

    <!-- Game Board -->
    <div v-else class="max-w-3xl mx-auto p-1 sm:p-2 relative z-10">
      <!-- Header with Home Button & Game Mode -->
      <div ref="headerRowRef" class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-0 mb-4 sm:mb-6">
        <div class="flex gap-2 w-full sm:w-auto">
          <NuxtLink to="/" class="bg-card border border-white/10 hover:border-hot/50 px-3 sm:px-4 py-1.5 sm:py-2 rounded-md transition-colors flex items-center gap-1.5 sm:gap-2 text-sm sm:text-base flex-1 sm:flex-initial justify-center sm:justify-start">
            <Icon icon="mdi:home" class="w-4 h-4 sm:w-5 sm:h-5" />
            <span class="font-medium">Home</span>
          </NuxtLink>
          <NuxtLink to="/setup?step=game-selection" class="bg-card border border-white/10 hover:border-hot/50 px-3 sm:px-4 py-1.5 sm:py-2 rounded-md transition-colors flex items-center gap-1.5 sm:gap-2 text-sm sm:text-base flex-1 sm:flex-initial justify-center sm:justify-start">
            <Icon icon="mdi:arrow-left" class="w-4 h-4 sm:w-5 sm:h-5" />
            <span class="font-medium">Back</span>
          </NuxtLink>
        </div>

        <div class="flex items-center gap-2 w-full sm:w-auto justify-center sm:justify-end">
          <span
            class="text-xs sm:text-sm px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full border font-display uppercase tracking-wide flex items-center gap-1.5 sm:gap-2"
            :class="gameMode === 'free-for-all' ? 'bg-hot/15 text-hot border-hot/30' : 'bg-volt/15 text-volt border-volt/30'"
          >
            <Icon
              :icon="gameMode === 'free-for-all' ? 'mdi:account-group' : 'mdi:heart'"
              class="w-4 h-4 sm:w-5 sm:h-5"
            />
            <span class="hidden sm:inline">{{
              gameMode === "free-for-all" ? "Free-for-All" : "Paired"
            }}</span>
            <span class="sm:hidden">{{
              gameMode === "free-for-all" ? "FFA" : "Paired"
            }}</span>
          </span>
          <span class="badge-stamp px-2.5 sm:px-3 py-1 sm:py-1.5 text-xs sm:text-sm bg-hot text-ink">Lv {{ gameLevel }}</span>
        </div>
      </div>

      <!-- Game Title -->
      <div ref="titleBlockRef" class="text-center mb-3 sm:mb-4 md:mb-6">
        <h1 class="font-display text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold uppercase mb-1 sm:mb-2 px-2 text-paper">
          Dice <span class="text-hot">of</span> Desire
        </h1>
        <p class="text-paper/60 text-[10px] sm:text-xs md:text-sm font-medium px-2">Roll for intimate commands!</p>
      </div>

      <!-- Player Status -->
      <div ref="turnBlockRef" class="card-poster flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-0 mb-3 sm:mb-4 md:mb-6 p-3 sm:p-4 md:p-5">
        <div class="w-full sm:w-auto">
          <h3 class="text-xs font-display uppercase tracking-wider text-paper/50 mb-1">Current Roller</h3>
          <p class="text-xl sm:text-2xl font-bold font-display uppercase flex items-center gap-2">
            <span class="truncate">{{ currentPlayer.name }}</span>
            <span class="text-2xl sm:text-3xl text-hot flex-shrink-0">{{
              currentPlayer.gender === "male" ? "♂" : "♀"
            }}</span>
          </p>
        </div>
        <div class="text-left sm:text-right w-full sm:w-auto">
          <h3 class="text-xs font-display uppercase tracking-wider text-paper/50 mb-1">Target</h3>
          <p class="text-xl sm:text-2xl font-bold font-display uppercase flex items-center sm:justify-end gap-2">
            <span class="text-2xl sm:text-3xl text-volt flex-shrink-0">{{
              targetPlayer.gender === "male" ? "♂" : "♀"
            }}</span>
            <span class="truncate">{{ targetPlayer.name }}</span>
          </p>
        </div>
      </div>

      <!-- Dice Area -->
      <div
        ref="diceAreaRef"
        class="card-poster p-3 sm:p-4 md:p-6 lg:p-8 mb-3 sm:mb-4 md:mb-6"
      >
        <div class="flex justify-center gap-3 sm:gap-4 md:gap-6 lg:gap-8 mb-4 sm:mb-5 md:mb-6">
          <!-- Body Part Die -->
          <div
            ref="bodyDieRef"
            @click="handleRollDice($event)"
            class="w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 lg:w-32 lg:h-32 bg-hot text-ink rounded-lg shadow-hard flex flex-col justify-center items-center cursor-pointer transition-transform hover:brightness-110"
            :class="{
              'ring-2 ring-paper': !isRolling && currentRoll.body === 'Your Choice',
            }"
          >
            <div v-if="!isRolling" class="text-center px-1 sm:px-2">
              <p class="text-[10px] sm:text-xs md:text-sm font-display uppercase tracking-wide mb-0.5 sm:mb-1 opacity-80">Body Part</p>
              <p class="text-xs sm:text-sm md:text-base lg:text-lg font-display font-bold leading-tight">
                {{ currentRoll.body || "?" }}
              </p>
            </div>
            <div v-else class="text-center">
              <p class="text-[10px] sm:text-xs font-display uppercase tracking-wide opacity-80">Rolling...</p>
              <Icon icon="mdi:dice-multiple" class="w-7 h-7 sm:w-8 sm:h-8 mt-1" />
            </div>
          </div>

          <!-- Action Die -->
          <div
            ref="actionDieRef"
            @click="handleRollDice($event)"
            class="w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 lg:w-32 lg:h-32 bg-volt text-ink rounded-lg shadow-hard flex flex-col justify-center items-center cursor-pointer transition-transform hover:brightness-110"
            :class="{
              'ring-2 ring-paper': !isRolling && currentRoll.action === 'Your Choice',
            }"
          >
            <div v-if="!isRolling" class="text-center px-1 sm:px-2">
              <p class="text-[10px] sm:text-xs md:text-sm font-display uppercase tracking-wide mb-0.5 sm:mb-1 opacity-80">Action</p>
              <p class="text-xs sm:text-sm md:text-base lg:text-lg font-display font-bold leading-tight">
                {{ currentRoll.action || "?" }}
              </p>
            </div>
            <div v-else class="text-center">
              <p class="text-[10px] sm:text-xs font-display uppercase tracking-wide opacity-80">Rolling...</p>
              <Icon icon="mdi:dice-multiple" class="w-7 h-7 sm:w-8 sm:h-8 mt-1" />
            </div>
          </div>
        </div>

        <button
          ref="rollButtonRef"
          @click="handleRollDice($event)"
          :disabled="isRolling || isTimerRunning"
          class="w-full bg-hot text-ink shadow-hard hover:brightness-110 py-3 sm:py-4 md:py-5 rounded-lg font-display font-bold uppercase tracking-wide text-base sm:text-lg md:text-xl transition-[filter] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 sm:gap-3"
        >
          <Icon
            v-if="isRolling"
            icon="svg-spinners:3-dots-fade"
            class="w-6 h-6"
          />
          <Icon v-else icon="mdi:dice" class="w-6 h-6" />
          {{ isRolling ? "Rolling..." : "Roll Dice" }}
        </button>
      </div>

      <!-- Result Display -->
      <div
        v-if="currentResult"
        ref="resultPanelRef"
        class="card-face is-volt p-3 sm:p-4 md:p-6 mb-3 sm:mb-4 md:mb-6"
      >
        <div class="card-index card-index-tl text-volt"><Icon icon="mdi:dice-multiple" class="w-3.5 h-3.5" />R</div>
        <div class="card-index card-index-br text-volt"><Icon icon="mdi:dice-multiple" class="w-3.5 h-3.5" />R</div>

        <h3
          class="font-display text-base sm:text-lg md:text-xl lg:text-2xl font-bold uppercase tracking-wide mb-2 sm:mb-3 md:mb-4 text-center flex items-center justify-center gap-1.5 sm:gap-2 md:gap-3"
        >
          <Icon icon="mdi:fire" class="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-7 text-hot" />
          <span class="text-paper">Your Command</span>
          <Icon icon="mdi:fire" class="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-7 text-hot" />
        </h3>
        <div
          class="bg-white/5 border border-white/10 rounded-md p-3 sm:p-4 md:p-6 mb-3 sm:mb-4 md:mb-6"
        >
          <p ref="resultTextRef" class="font-display text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-center leading-relaxed px-2 text-paper">{{ currentResult }}</p>
          <p
            v-if="specialEffect"
            class="text-center mt-4 font-display font-bold uppercase tracking-wide text-sm inline-flex items-center justify-center gap-2 bg-volt text-ink rounded-full px-6 py-3 mx-auto"
          >
            <Icon :icon="specialEffectIcon" class="w-5 h-5" />
            {{ specialEffect }}
          </p>
        </div>

        <!-- Timer -->
        <div class="flex flex-col items-center">
          <div ref="timerWrapRef" class="relative w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 mb-3 sm:mb-4 md:mb-6">
            <svg class="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
              <path
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke="rgba(255,255,255,0.12)"
                stroke-width="3"
              />
              <path
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                :stroke="secondsLeft <= 5 ? '#FF2E63' : '#C6FF3D'"
                stroke-width="3"
                stroke-linecap="round"
                :stroke-dasharray="`${timerPercent}, 100`"
              />
            </svg>
            <span
              ref="secondsTextRef"
              class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 font-display font-bold text-2xl tabular-nums"
              :class="secondsLeft <= 5 ? 'text-hot' : 'text-paper'"
            >
              {{ secondsLeft }}s
            </span>
          </div>

          <div class="flex gap-2 sm:gap-3 md:gap-4">
            <button
              @click="handleCompleteAction($event)"
              class="bg-volt text-ink shadow-hard-sm hover:brightness-110 px-3 sm:px-4 md:px-6 py-1.5 sm:py-2 rounded-lg font-display font-bold uppercase tracking-wide flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm md:text-base transition-[filter]"
            >
              <Icon icon="mdi:check-bold" class="w-4 h-4 sm:w-5 sm:h-5" />
              Completed
            </button>
            <button
              @click="handleFailAction($event)"
              class="bg-hot text-ink shadow-hard-sm hover:brightness-110 px-3 sm:px-4 md:px-6 py-1.5 sm:py-2 rounded-lg font-display font-bold uppercase tracking-wide flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm md:text-base transition-[filter]"
            >
              <Icon icon="mdi:close-thick" class="w-4 h-4 sm:w-5 sm:h-5" />
              Failed
            </button>
          </div>
        </div>
      </div>

      <!-- History: collapsed by default so it doesn't eat gameplay space -->
      <div class="card-poster overflow-hidden">
        <button
          type="button"
          @click="toggleLog"
          class="w-full flex items-center justify-between p-4 font-display uppercase tracking-wide text-sm text-paper/70"
        >
          <span class="flex items-center gap-2">
            <Icon icon="mdi:history" class="w-5 h-5" />
            <span>Game History</span>
            <span v-if="history.length" class="bg-white/10 text-paper/60 text-xs px-2 py-0.5 rounded-full normal-case tracking-normal font-sans font-medium">{{ history.length }}</span>
          </span>
          <Icon icon="mdi:chevron-down" class="w-5 h-5 transition-transform duration-200" :class="{ 'rotate-180': logExpanded }" />
        </button>
        <div ref="logBodyRef" class="overflow-hidden" style="height: 0">
          <ul class="space-y-2 sm:space-y-3 max-h-40 sm:max-h-52 overflow-y-auto px-4 pb-4 text-xs sm:text-sm">
            <li
              v-for="(item, index) in history"
              :key="index"
              class="pb-3 border-b border-white/10 last:border-0 group"
            >
              <div class="flex justify-between items-start gap-2">
                <div class="min-w-0">
                  <p class="font-semibold text-paper">
                    <span class="text-hot">{{ item.roller }}</span> →
                    <span class="text-volt">{{ item.target }}</span
                    >:
                  </p>
                  <p class="mt-1 text-paper/80 break-words">{{ item.result }}</p>
                  <p
                    v-if="item.special"
                    class="text-volt text-xs sm:text-sm mt-1 flex items-center gap-1"
                  >
                    <Icon :icon="getEffectIcon(item.special)" class="w-4 h-4" />
                    {{ item.special }}
                  </p>
                </div>
                <span class="flex-shrink-0">
                  <Icon
                    v-if="item.status === 'completed'"
                    icon="mdi:check-circle"
                    class="w-5 h-5 text-volt"
                  />
                  <Icon
                    v-else-if="item.status === 'failed'"
                    icon="mdi:close-circle"
                    class="w-5 h-5 text-hot"
                  />
                </span>
              </div>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, nextTick, watch } from "vue";
import { Icon } from "@iconify/vue";
import gsap from "gsap";
import { useGameStore } from "~/stores/game";
import { navigateTo } from "#app";
import { staggerReveal, punchScale, tickPulse, shake, celebrateBurst } from "~/composables/useGameAnimations";
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
    if (!value) return defaultValue;
    try {
      return JSON.parse(value);
    } catch (e) {
      console.error(`Failed to parse localStorage key "${key}":`, e);
      return defaultValue;
    }
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
const logExpanded = ref(false);

// Animation refs
const headerRowRef = ref(null);
const titleBlockRef = ref(null);
const turnBlockRef = ref(null);
const diceAreaRef = ref(null);
const bodyDieRef = ref(null);
const actionDieRef = ref(null);
const rollButtonRef = ref(null);
const resultPanelRef = ref(null);
const resultTextRef = ref(null);
const timerWrapRef = ref(null);
const secondsTextRef = ref(null);
const logBodyRef = ref(null);

// Load players from game store
const players = computed(() => gameStore.players);

// Set game mode from store
watch(() => gameStore.gameMode, (newMode) => {
  if (newMode) {
    gameMode.value = newMode;
  }
}, { immediate: true });

// Computed Properties
const currentPlayer = computed(() => gameStore.currentPlayer || {});
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

// Collapsed by default so history doesn't permanently eat gameplay space —
// animate the height open/closed rather than a plain v-if.
const toggleLog = () => {
  logExpanded.value = !logExpanded.value;
  nextTick(() => {
    if (!logBodyRef.value) return;
    if (logExpanded.value) {
      const targetHeight = logBodyRef.value.scrollHeight;
      gsap.fromTo(
        logBodyRef.value,
        { height: 0 },
        { height: targetHeight, duration: 0.35, ease: 'power2.out', onComplete: () => gsap.set(logBodyRef.value, { height: 'auto' }) }
      );
    } else {
      gsap.fromTo(
        logBodyRef.value,
        { height: logBodyRef.value.scrollHeight },
        { height: 0, duration: 0.28, ease: 'power2.in' }
      );
    }
  });
};

// Game Logic
const startGame = () => {
  showRules.value = false;
  nextTick(() => {
    staggerReveal([headerRowRef.value, titleBlockRef.value, turnBlockRef.value, diceAreaRef.value]);
  });
};

// A short tactile "tumble" for the two dice while rolling — rocks them back
// and forth and settles flat, standing in for a physical dice-roll motion.
const tumbleDice = () => {
  const targets = [bodyDieRef.value, actionDieRef.value].filter(Boolean);
  if (!targets.length) return;
  gsap.timeline()
    .to(targets, { rotation: 12, scale: 1.08, duration: 0.1, ease: 'power1.out' })
    .to(targets, { rotation: -14, duration: 0.12, ease: 'power1.inOut' })
    .to(targets, { rotation: 10, duration: 0.12, ease: 'power1.inOut' })
    .to(targets, { rotation: -6, duration: 0.12, ease: 'power1.inOut' })
    .to(targets, { rotation: 0, scale: 1, duration: 0.3, ease: 'back.out(1.7)' });
};

const rollDice = async () => {
  if (isRolling.value || isTimerRunning.value) return;

  // Reset previous result
  currentResult.value = "";
  specialEffect.value = "";
  isRolling.value = true;
  tumbleDice();

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

  // Reveal beat: the result text settles in after the tumble.
  await nextTick();
  if (resultTextRef.value) {
    gsap.fromTo(resultTextRef.value, { y: 14, opacity: 0 }, { y: 0, opacity: 1, duration: 0.4, ease: 'power2.out' });
  }
};

const handleRollDice = (evt) => {
  if (isRolling.value || isTimerRunning.value) return;
  punchScale(evt?.currentTarget);
  rollDice();
};

const startTimer = (duration) => {
  clearInterval(timer.value);
  isTimerRunning.value = true;
  secondsLeft.value = duration;
  const totalDuration = duration;

  timer.value = setInterval(() => {
    secondsLeft.value--;
    timerPercent.value = (secondsLeft.value / totalDuration) * 100;
    tickPulse(secondsTextRef.value, { scale: secondsLeft.value <= 5 ? 1.4 : 1.15 });
    if (secondsLeft.value === 5) {
      shake(timerWrapRef.value);
    }

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
  gameStore.nextTurn();
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

const handleCompleteAction = (evt) => {
  celebrateBurst(evt?.currentTarget);
  completeAction();
};

const failAction = () => {
  clearInterval(timer.value);
  if (history.value.length > 0) {
    history.value[0].status = "failed";
  }
  setTimeout(nextTurn, 500);
};

const handleFailAction = (evt) => {
  punchScale(evt?.currentTarget);
  failAction();
};
</script>

<style scoped>
</style>

<style>
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
