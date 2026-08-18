<template>
  <div
    class="min-h-screen bg-nightlife text-paper p-3 sm:p-4 relative overflow-x-hidden overflow-y-auto safe-bottom"
  >
    <!-- Background Icons Pattern -->
    <BackgroundIcons />

    <!-- Main Game Container -->
    <div
      class="max-w-3xl mx-auto p-1 sm:p-2 relative z-10"
    >
      <!-- Home Button & Info -->
      <div ref="headerRowRef" class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-0 mb-6">
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
            class="text-xs sm:text-sm px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full border font-display uppercase tracking-wide"
            :class="
              gameMode === 'individual'
                ? 'bg-hot/15 text-hot border-hot/30'
                : gameMode === 'teams'
                ? 'bg-volt/15 text-volt border-volt/30'
                : 'bg-paper/10 text-paper border-paper/20'
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
          <span class="badge-stamp px-2.5 sm:px-3 py-1 sm:py-1.5 text-xs sm:text-sm bg-hot text-paper">
            Lv {{ gameLevel }}
          </span>
        </div>
      </div>

      <!-- Game Title -->
      <div ref="titleBlockRef" class="text-center mb-8">
        <h1
          class="font-display text-4xl sm:text-5xl md:text-6xl font-bold uppercase mb-4 text-paper"
        >
          Do <span class="text-hot">or</span> Drink
        </h1>
        <p class="text-paper/60 text-sm font-medium">Complete the challenge or take the penalty!</p>
      </div>

      <!-- Game Settings -->
      <div ref="settingsBlockRef" class="mb-8">
        <button
          @click="handleToggleSettings($event)"
          class="text-sm bg-card border border-white/10 hover:border-hot/50 px-4 py-2 rounded-md flex items-center gap-2 transition-colors font-display uppercase tracking-wide"
        >
          <Icon icon="mdi:cog" class="w-5 h-5" />
          Game Settings
        </button>

        <transition name="slide-down">
          <div
            v-if="showSettings"
            class="mt-3 card-poster p-4"
          >
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-xs font-display uppercase tracking-wide text-paper/60 mb-1.5"
                  >Drink Amount</label
                >
                <select
                  v-model="baseDrinkAmount"
                  class="w-full bg-card border border-white/10 rounded-md px-3 py-2 text-sm text-paper focus:outline-none focus:border-hot/50"
                >
                  <option value="1">1 sip</option>
                  <option value="2">2 sips</option>
                  <option value="3">3 sips</option>
                  <option value="shot">1 shot</option>
                  <option value="glass">Full glass</option>
                </select>
              </div>

              <div>
                <label class="block text-xs font-display uppercase tracking-wide text-paper/60 mb-1.5">Game Mode</label>
                <div class="pill-toggle">
                  <button
                    type="button"
                    class="pill-toggle-btn"
                    :class="{ 'is-active': gameMode === 'individual' }"
                    @click="setGameMode('individual', $event)"
                  >
                    Individual
                  </button>
                  <button
                    type="button"
                    class="pill-toggle-btn"
                    :class="{ 'is-active': gameMode === 'teams', 'is-volt': gameMode === 'teams' }"
                    @click="setGameMode('teams', $event)"
                  >
                    Teams
                  </button>
                  <button
                    type="button"
                    class="pill-toggle-btn"
                    :class="{ 'is-active': gameMode === 'elimination' }"
                    @click="setGameMode('elimination', $event)"
                  >
                    Elimination
                  </button>
                </div>
              </div>
            </div>

            <div class="mt-4">
              <label class="flex items-center gap-2">
                <input
                  type="checkbox"
                  v-model="enableHouseRules"
                  class="rounded bg-card border-white/10 focus:ring-hot"
                />
                <span class="text-sm text-paper/80">Enable House Rules</span>
              </label>
            </div>

            <div v-if="enableHouseRules" class="mt-3">
              <label class="block text-xs font-display uppercase tracking-wide text-paper/60 mb-1.5">Custom Rules</label>
              <textarea
                v-model="houseRules"
                placeholder="Enter your custom house rules..."
                class="w-full bg-card border border-white/10 rounded-md px-3 py-2 text-sm text-paper h-20 focus:outline-none focus:border-hot/50"
              ></textarea>
            </div>
          </div>
        </transition>
      </div>

      <!-- Player Status -->
      <div ref="turnBlockRef" class="card-poster p-4 mb-6 flex justify-between items-center gap-3">
        <div class="min-w-0">
          <div class="text-xs font-display uppercase tracking-wider text-paper/50 mb-1">Current Turn</div>
          <div class="text-xl font-bold font-display uppercase flex items-center gap-2 min-w-0">
            <span class="truncate">{{ currentPlayer?.name }}</span>
            <span class="text-2xl flex-shrink-0 text-hot">{{
              currentPlayer?.gender === "male" ? "♂" : "♀"
            }}</span>
          </div>
        </div>
        <div class="text-right flex-shrink-0">
          <div class="text-xs font-display uppercase tracking-wider text-paper/50 mb-1">Drinks Taken</div>
          <div class="text-xl font-bold font-display flex items-center justify-end gap-2">
            <Icon icon="mdi:glass-cocktail" class="w-5 h-5 text-hot" />
            <span>{{ currentPlayer?.drinks || 0 }}</span>
          </div>
        </div>
      </div>

      <!-- Flip Stage: face-down deck <-> revealed challenge card -->
      <div ref="flipStageRef" class="flip-stage mb-6">
        <div ref="flipInnerRef" class="flip-inner">
          <!-- Face-down: single DO deck -->
          <div v-if="!currentCard || !cardFlipped" class="max-w-[240px] mx-auto">
            <button
              ref="drawCardButtonRef"
              @click="handleDrawCard($event)"
              :disabled="isDrawing"
              class="playing-card is-hot shadow-hard hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed w-full"
            >
              <div class="playing-card-pattern"></div>
              <div class="card-index card-index-tl"><Icon icon="mdi:cards" class="w-3.5 h-3.5" />DD</div>
              <div class="card-index card-index-br"><Icon icon="mdi:cards" class="w-3.5 h-3.5" />DD</div>
              <div v-if="isDrawing" class="absolute inset-0 flex items-center justify-center bg-black/20">
                <Icon icon="svg-spinners:3-dots-fade" class="w-8 h-8" />
              </div>
              <div v-else class="playing-card-medallion">
                <span><Icon icon="mdi:glass-cocktail" class="w-7 h-7" /></span>
              </div>
              <span class="absolute bottom-4 inset-x-0 text-center font-display font-bold uppercase tracking-wide text-sm">Draw</span>
            </button>
          </div>

          <!-- Revealed card face -->
          <div v-if="currentCard && cardFlipped" class="max-w-md mx-auto">
            <div class="card-face p-8 md:p-10 min-h-[280px] flex items-center justify-center">
              <div class="card-index card-index-tl text-hot"><Icon icon="mdi:cards" class="w-3.5 h-3.5" />DD</div>
              <div class="card-index card-index-br text-hot"><Icon icon="mdi:cards" class="w-3.5 h-3.5" />DD</div>

              <div class="text-center w-full">
                <!-- Level Badge -->
                <div class="mb-6 flex justify-center">
                  <div ref="typeBadgeRef" class="badge-stamp px-6 py-3 text-lg bg-hot text-paper">
                    <Icon :icon="intensityIcon" class="w-6 h-6" />
                    Level {{ currentCard.intensity }}
                  </div>
                </div>

                <!-- Challenge Text -->
                <p ref="questionTextRef" class="font-display text-xl md:text-3xl font-bold mb-6 leading-relaxed px-2 text-paper">
                  {{ currentCard.text }}
                </p>

                <!-- Target (if applicable) -->
                <div v-if="currentCard.target" class="bg-white/5 border border-white/10 rounded-md p-4 max-w-sm mx-auto mb-4">
                  <p class="text-base font-medium flex items-center justify-center gap-2 text-paper">
                    <Icon icon="mdi:account-arrow-right" class="w-5 h-5 text-hot" />
                    To: {{ currentCard.target.name }}
                    <span class="text-xl">{{ currentCard.target.gender === "male" ? "♂" : "♀" }}</span>
                  </p>
                </div>

                <p class="inline-block font-display font-bold uppercase tracking-wide text-sm px-4 py-2 rounded-full bg-volt/15 text-volt border border-volt/30">
                  Penalty: {{ currentCard.drinkAmount }}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Tertiary action: demoted from a co-equal stacked button to a small
           text link, so the two primary actions below don't compete with it. -->
      <div v-if="currentCard && cardFlipped" class="flex justify-center mb-2">
        <button
          @click="handleResetCard($event)"
          class="btn-ghost inline-flex items-center gap-2"
        >
          <Icon icon="mdi:refresh" class="w-4 h-4" />
          Choose Different Card
        </button>
      </div>

      <!-- Primary Action Buttons: kept reachable without scrolling -->
      <StickyActionBar v-if="currentCard && cardFlipped">
        <div class="flex flex-col gap-3 w-full">
          <button
            ref="completeButtonRef"
            @click="handleCompleteChallenge($event)"
            class="w-full bg-volt text-ink shadow-hard hover:brightness-110 py-4 rounded-lg font-display font-bold uppercase tracking-wide text-lg transition-[filter] flex items-center justify-center gap-2"
          >
            <Icon icon="mdi:check-bold" class="w-6 h-6" />
            Completed
          </button>
          <button
            @click="handleTakeDrink($event)"
            class="w-full bg-hot text-paper shadow-hard hover:brightness-110 py-4 rounded-lg font-display font-bold uppercase tracking-wide text-lg transition-[filter] flex items-center justify-center gap-2"
          >
            <Icon icon="mdi:glass-cocktail" class="w-6 h-6" />
            Take Drink Instead ({{ currentCard.drinkAmount }})
          </button>
        </div>
      </StickyActionBar>

      <!-- Hesitation Timer -->
      <div v-if="currentCard && cardFlipped" ref="timerBlockRef" class="card-poster p-4 mb-6">
        <div class="flex justify-between items-center mb-2">
          <div class="flex items-center gap-2">
            <Icon icon="mdi:timer-sand" class="w-5 h-5 text-hot" />
            <span class="font-display uppercase tracking-wide text-sm">Hesitation Timer</span>
          </div>
          <span
            ref="timerNumberRef"
            class="font-bold font-display text-lg tabular-nums"
            :class="hesitationTime <= 5 ? 'text-hot' : 'text-volt'"
          >
            {{ hesitationTime }}s
          </span>
        </div>
        <div class="w-full h-2 bg-white/10 rounded-full overflow-hidden">
          <div
            class="h-full bg-hot"
            :style="{ width: hesitationPercent.value + '%' }"
          ></div>
        </div>
      </div>

      <!-- Game Log: collapsed by default so it doesn't eat gameplay space -->
      <div class="card-poster overflow-hidden">
        <button
          type="button"
          @click="toggleLog"
          class="w-full flex items-center justify-between p-4 font-display uppercase tracking-wide text-sm text-paper/70"
        >
          <span class="flex items-center gap-2">
            <Icon icon="mdi:history" class="w-5 h-5" />
            <span>Game Log</span>
            <span v-if="gameHistory.length" class="bg-white/10 text-paper/60 text-xs px-2 py-0.5 rounded-full normal-case tracking-normal font-sans font-medium">{{ gameHistory.length }}</span>
          </span>
          <Icon icon="mdi:chevron-down" class="w-5 h-5 transition-transform duration-200" :class="{ 'rotate-180': logExpanded }" />
        </button>
        <div ref="logBodyRef" class="overflow-hidden" style="height: 0">
          <ul class="space-y-2 text-xs px-4 pb-4 max-h-40 overflow-y-auto">
            <li
              v-for="(log, index) in gameHistory"
              :key="index"
              class="py-2 px-3 rounded-md bg-white/5"
            >
              <div class="flex items-start gap-2">
                <Icon
                  :icon="getLogIcon(log)"
                  class="w-4 h-4 mt-0.5 flex-shrink-0"
                  :class="getLogIconColor(log)"
                />
                <span class="break-words text-paper/80">{{ log.text || log }}</span>
              </div>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, onBeforeUnmount, nextTick } from "vue";
import { Icon } from "@iconify/vue";
import { push } from "notivue";
import gsap from "gsap";
import { useGameStore } from "~/stores/game";
import { navigateTo } from "#app";
// Questions are now loaded from database via API
import { useDoOrDrinkTracker } from "~/composables/useQuestionTracker";
import { staggerReveal, flipTransition, punchScale, tickPulse, shake, celebrateBurst } from "~/composables/useGameAnimations";
// Sessionless: no server session polling

const gameStore = useGameStore();

// Game Configuration
const MAX_HESITATION_TIME = 15;

// Game State
const showSettings = ref(false);
const baseDrinkAmount = ref("2");
const gameMode = ref("individual");
const enableHouseRules = ref(false);
const houseRules = ref("");
const gameLevel = ref(1);
const logExpanded = ref(false);

// Players - use gameStore with local drinks tracking
const storePlayers = computed(() => gameStore.players);
const playerDrinks = ref({}); // Track drinks separately
const players = computed(() => storePlayers.value.map((p) => ({
  ...p,
  drinks: playerDrinks.value[p.id] || 0
})));

// Gameplay
const currentCard = ref(null);
const cardFlipped = ref(false);
const gameHistory = ref([]);
const hesitationTime = ref(MAX_HESITATION_TIME);
const hesitationTimer = ref(null);
// A reactive plain object (not a ref) so GSAP can tween `.value` directly for
// a smooth per-tick animation instead of an instant jump + CSS transition.
const hesitationPercent = reactive({ value: 100 });
const isDrawing = ref(false);

// Animation refs
const headerRowRef = ref(null);
const titleBlockRef = ref(null);
const settingsBlockRef = ref(null);
const turnBlockRef = ref(null);
const flipStageRef = ref(null);
const flipInnerRef = ref(null);
const drawCardButtonRef = ref(null);
const completeButtonRef = ref(null);
const timerBlockRef = ref(null);
const timerNumberRef = ref(null);
const typeBadgeRef = ref(null);
const questionTextRef = ref(null);
const logBodyRef = ref(null);

// Computed Properties
const currentPlayer = computed(
  () => players.value[gameStore.currentPlayerIndex] || {}
);

const intensityIcon = computed(() => {
  if (!currentCard.value) return "mdi:cards";
  switch (currentCard.value.intensity) {
    case 1:
      return "mdi:emoticon-happy";
    case 2:
      return "mdi:emoticon-excited";
    case 3:
      return "mdi:emoticon-devil";
    default:
      return "mdi:cards";
  }
});

const setGameMode = (mode, evt) => {
  if (gameMode.value === mode) return;
  punchScale(evt?.currentTarget);
  gameMode.value = mode;
};

const handleToggleSettings = (evt) => {
  punchScale(evt?.currentTarget);
  showSettings.value = !showSettings.value;
};

// Collapsed by default so the log doesn't permanently eat gameplay space —
// animate the height open/closed rather than a plain v-if (the disclosure
// affordance reads better with motion).
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

// Initialize question tracker (will be populated from database)
let challengeTracker = null;

// Question Selection Logic
const getRandomChallenge = () => {
  if (!challengeTracker) {
    return 'Questions are loading... Please wait.';
  }

  const result = challengeTracker.getNextQuestion();

  if (result.isRepeat) {
    push.info({ title: 'Fresh round!', message: "You've seen every question — shuffling for a new round.", duration: 4000 });
  }

  // Since questions are now just strings, result.question is the string itself
  return result.question;
};

// Game Logic
const getValidTargets = () => {
  if (!currentPlayer.value) return [];
  return players.value.filter((p) => p.id !== currentPlayer.value.id);
};

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

const drawAndReveal = async () => {
  if (isDrawing.value || currentCard.value) return;

  isDrawing.value = true;

  try {
    const challenge = generateChallenge();
    await flipTransition(flipInnerRef.value, () => {
      currentCard.value = challenge;
      cardFlipped.value = true;
    });
    gameHistory.value.unshift({
      text: `${currentPlayer.value.name} drew a level ${challenge.intensity} challenge`,
      type: "draw",
    });

    // Reveal beat: badge pops in, then the challenge text settles in.
    await nextTick();
    if (typeBadgeRef.value) {
      gsap.fromTo(typeBadgeRef.value, { scale: 0.6, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.35, ease: 'back.out(2.2)' });
    }
    if (questionTextRef.value) {
      gsap.fromTo(questionTextRef.value, { y: 14, opacity: 0 }, { y: 0, opacity: 1, duration: 0.4, delay: 0.12, ease: 'power2.out' });
    }

    startHesitationTimer();
  } catch (error) {
    console.error("Error generating challenge:", error);
    await flipTransition(flipInnerRef.value, () => {
      currentCard.value = {
        text: "Give someone a passionate kiss or take a drink",
        intensity: 1,
        drinkAmount: "1 sip",
        target: null,
      };
      cardFlipped.value = true;
    });
    startHesitationTimer();
  } finally {
    isDrawing.value = false;
  }
};

const handleDrawCard = (evt) => {
  punchScale(evt?.currentTarget);
  drawAndReveal();
};

const handleResetCard = (evt) => {
  punchScale(evt?.currentTarget);
  resetHesitationTimer();
  flipTransition(flipInnerRef.value, () => {
    currentCard.value = null;
    cardFlipped.value = false;
  });
};

const startHesitationTimer = () => {
  resetHesitationTimer();
  hesitationTimer.value = setInterval(() => {
    hesitationTime.value--;
    const pct = (hesitationTime.value / MAX_HESITATION_TIME) * 100;
    gsap.to(hesitationPercent, { value: pct, duration: 0.9, ease: 'linear' });
    tickPulse(timerNumberRef.value, { scale: hesitationTime.value <= 5 ? 1.4 : 1.15 });
    if (hesitationTime.value === 5) {
      shake(timerBlockRef.value);
    }

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

const resetHesitationTimer = () => {
  clearInterval(hesitationTimer.value);
  hesitationTime.value = MAX_HESITATION_TIME;
  gsap.set(hesitationPercent, { value: 100 });
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

const handleCompleteChallenge = (evt) => {
  celebrateBurst(evt?.currentTarget);
  completeChallenge();
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

  // Update drinks count
  const player = players.value[gameStore.currentPlayerIndex];
  if (player) {
    playerDrinks.value[player.id] = (playerDrinks.value[player.id] || 0) + drinkCount;
  }
  gameHistory.value.unshift({
    text: `${currentPlayer.value.name} drank instead: ${drinkAmount}`,
    type: "drink",
  });

  handleElimination();
  nextTurn();
};

const handleTakeDrink = (evt) => {
  punchScale(evt?.currentTarget);
  takeDrink();
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

  // Update drinks count
  const player = players.value[gameStore.currentPlayerIndex];
  if (player) {
    playerDrinks.value[player.id] = (playerDrinks.value[player.id] || 0) + drinkCount;
  }
  gameHistory.value.unshift({
    text: `${currentPlayer.value.name} takes a penalty of ${drinkCount} sips/drinks`,
    type: "penalty",
  });

  handleElimination();
};

const handleElimination = () => {
  if (gameMode.value === "elimination" && currentPlayer.value?.drinks >= 10) {
    gameHistory.value.unshift({
      text: `${currentPlayer.value.name} is eliminated after 10 drinks!`,
      type: "elimination",
    });
    // Note: Can't directly modify computed, but this is for display only
    // In a real implementation, you'd update the store

    if (players.value.length === 1) {
      gameHistory.value.unshift({
        text: `${players.value[0].name} wins the game!`,
        type: "winner",
      });
    }
  }
};

const nextTurn = () => {
  resetHesitationTimer();
  flipTransition(flipInnerRef.value, () => {
    currentCard.value = null;
    cardFlipped.value = false;
  });

  if (players.value.length === 0) {
    gameHistory.value.unshift({
      text: "Game over! No players left.",
      type: "game-over",
    });
    return;
  }

  gameStore.nextTurn();
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
        return "text-volt";
      case "drink":
        return "text-hot";
      case "penalty":
        return "text-hot";
      case "elimination":
        return "text-hot";
      case "winner":
        return "text-volt";
      case "game-over":
        return "text-paper/50";
      default:
        return "text-paper/60";
    }
  }
  return "text-paper/60";
};

// Load questions from database
async function loadQuestions() {
  const data = await $fetch('/api/questions/do-or-drink?limit=1000')
    .catch(error => {
      throw new Error(`Failed to fetch questions: ${error.message || 'Unknown error'}`)
    })

  if (!data || !data.questions) {
    throw new Error('Invalid API response structure')
  }

  // Extract questions from response
  const questions = data.questions || []

  if (!Array.isArray(questions)) {
    throw new Error('Questions is not an array')
  }

  if (questions.length === 0) {
    throw new Error('No questions returned from API')
  }

  // Ensure questions are strings (API returns array of strings)
  const questionTexts = questions.map(q => {
    if (typeof q === 'string') {
      return q
    }
    if (q && typeof q === 'object' && q.text) {
      return q.text
    }
    return String(q)
  }).filter(q => q && q.trim().length > 0)

  if (questionTexts.length === 0) {
    throw new Error('No questions found in database')
  }

  // Create tracker with loaded questions
  challengeTracker = useDoOrDrinkTracker(questionTexts)
  challengeTracker.initializeTracker();
}

onMounted(async () => {
  if (typeof window !== "undefined") {
    // Load game state from store
    gameStore.loadFromLocalStorage();

    // Redirect if no players
    if (players.value.length === 0) {
      navigateTo('/setup?game=do-or-drink');
      return;
    }

    await nextTick();
    staggerReveal([headerRowRef.value, titleBlockRef.value, settingsBlockRef.value, turnBlockRef.value]);

    // Load questions from database
    try {
      await loadQuestions()
    } catch (error) {
      console.error('Failed to load questions:', error)
      // Show error to user - don't silently use fallback
      alert('Failed to load questions from database. Please refresh the page or contact support.')
    }
  }
});

onBeforeUnmount(() => {
  clearInterval(hesitationTimer.value);
});
</script>

<style scoped>
.flip-stage {
  perspective: 1400px;
}
.flip-inner {
  transform-style: preserve-3d;
  will-change: transform;
  backface-visibility: hidden;
}
</style>

<style>
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
