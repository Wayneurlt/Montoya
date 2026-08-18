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
      <!-- Header -->
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
              gameMode === 'free-for-all'
                ? 'bg-hot/15 text-hot border-hot/30'
                : gameMode === 'relationship'
                ? 'bg-volt/15 text-volt border-volt/30'
                : 'bg-paper/10 text-paper border-paper/20'
            "
          >
            {{ gameMode === "free-for-all" ? "Free-for-All" : gameMode === "relationship" ? "Paired" : "Teams" }}
          </span>
        </div>
      </div>

      <!-- Game Title -->
      <div ref="titleBlockRef" class="text-center mb-8">
        <h1
          class="font-display text-4xl sm:text-5xl md:text-6xl font-bold uppercase mb-4 text-paper"
        >
          Truth <span class="text-hot">or</span> Dare
        </h1>
        <p class="text-paper/60 text-sm font-medium">Choose your challenge and answer honestly!</p>
      </div>

      <!-- Current Player -->
      <div ref="turnBlockRef" class="card-poster p-4 mb-6">
        <div class="text-center">
          <div class="text-xs font-display uppercase tracking-wider text-paper/50 mb-1">Current Turn</div>
          <div class="text-xl font-bold font-display uppercase flex items-center justify-center gap-2 min-w-0">
            <span class="truncate">{{ currentPlayer?.name }}</span>
            <span class="text-2xl flex-shrink-0 text-hot">{{ currentPlayer?.gender === 'male' ? '♂' : '♀' }}</span>
          </div>
        </div>
      </div>

      <!-- Intensity Mode: two full choices, not a slim switch -->
      <div ref="toggleBlockRef" class="mb-6 grid grid-cols-2 gap-3">
        <button
          @click="setSpicyMode(false, $event)"
          class="mode-card"
          :class="{ 'is-active': !isSpicyMode }"
        >
          <Icon icon="mdi:emoticon-happy-outline" class="w-7 h-7" />
          <span class="mode-card-title">Normal</span>
          <span class="mode-card-desc">Mild and playful questions</span>
          <Icon icon="mdi:check-circle" class="mode-card-check" />
        </button>
        <button
          @click="setSpicyMode(true, $event)"
          class="mode-card is-volt"
          :class="{ 'is-active': isSpicyMode }"
        >
          <Icon icon="mdi:fire" class="w-7 h-7" />
          <span class="mode-card-title">Spicy</span>
          <span class="mode-card-desc">Hot and steamy questions</span>
          <Icon icon="mdi:check-circle" class="mode-card-check" />
        </button>
      </div>

      <!-- Loading State -->
      <div v-if="questionsLoading" class="mb-6 card-poster p-4 text-center">
        <div class="flex items-center justify-center gap-3">
          <Icon icon="svg-spinners:3-dots-fade" class="w-6 h-6 text-hot" />
          <span class="font-medium">Loading questions from database...</span>
        </div>
      </div>

      <!-- Error State -->
      <div v-if="questionsError" class="mb-6 card-poster border-hot/40 p-4">
        <div class="flex items-start gap-3">
          <Icon icon="mdi:alert-circle" class="w-6 h-6 text-hot flex-shrink-0 mt-0.5" />
          <div>
            <p class="font-bold font-display uppercase text-hot mb-1">Questions Not Loaded</p>
            <p class="text-sm text-paper/80 mb-2">{{ questionsError }}</p>
            <p class="text-xs text-paper/50">Using fallback questions. Please seed your database with questions.</p>
          </div>
        </div>
      </div>

      <!-- Flip Stage: face-down card choices <-> revealed question card -->
      <div ref="flipStageRef" class="flip-stage mb-6">
        <div ref="flipInnerRef" class="flip-inner">
          <!-- Face-down cards: pick one -->
          <div v-if="!currentCard || !cardFlipped" class="grid grid-cols-2 gap-4 max-w-sm mx-auto">
            <button
              ref="truthButtonRef"
              @click="handleDraw('TRUTH', $event)"
              :disabled="isDrawing || questionsLoading"
              class="playing-card is-hot shadow-hard hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div class="playing-card-pattern"></div>
              <div class="card-index card-index-tl"><Icon icon="mdi:chat-question" class="w-3.5 h-3.5" />T</div>
              <div class="card-index card-index-br"><Icon icon="mdi:chat-question" class="w-3.5 h-3.5" />T</div>
              <div v-if="isDrawing && selectedCardType === 'TRUTH'" class="absolute inset-0 flex items-center justify-center bg-black/20">
                <Icon icon="svg-spinners:3-dots-fade" class="w-8 h-8" />
              </div>
              <div v-else class="playing-card-medallion">
                <span><Icon icon="mdi:chat-question" class="w-7 h-7" /></span>
              </div>
              <span class="absolute bottom-4 inset-x-0 text-center font-display font-bold uppercase tracking-wide text-sm">Truth</span>
            </button>
            <button
              ref="dareButtonRef"
              @click="handleDraw('DARE', $event)"
              :disabled="isDrawing || questionsLoading"
              class="playing-card is-volt shadow-hard hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div class="playing-card-pattern"></div>
              <div class="card-index card-index-tl"><Icon icon="mdi:fire" class="w-3.5 h-3.5" />D</div>
              <div class="card-index card-index-br"><Icon icon="mdi:fire" class="w-3.5 h-3.5" />D</div>
              <div v-if="isDrawing && selectedCardType === 'DARE'" class="absolute inset-0 flex items-center justify-center bg-black/20">
                <Icon icon="svg-spinners:3-dots-fade" class="w-8 h-8" />
              </div>
              <div v-else class="playing-card-medallion">
                <span><Icon icon="mdi:fire" class="w-7 h-7" /></span>
              </div>
              <span class="absolute bottom-4 inset-x-0 text-center font-display font-bold uppercase tracking-wide text-sm">Dare</span>
            </button>
          </div>

          <!-- Revealed card face -->
          <div v-if="currentCard && cardFlipped" class="max-w-md mx-auto">
            <div class="card-face p-8 md:p-10 min-h-[280px] flex items-center justify-center"
              :class="{ 'is-volt': currentCard.type === 'DARE' }">
              <div class="card-index card-index-tl" :class="currentCard.type === 'DARE' ? 'text-volt' : 'text-hot'">
                <Icon :icon="currentCard.type === 'TRUTH' ? 'mdi:chat-question' : 'mdi:fire'" class="w-3.5 h-3.5" />
                {{ currentCard.type === 'TRUTH' ? 'T' : 'D' }}
              </div>
              <div class="card-index card-index-br" :class="currentCard.type === 'DARE' ? 'text-volt' : 'text-hot'">
                <Icon :icon="currentCard.type === 'TRUTH' ? 'mdi:chat-question' : 'mdi:fire'" class="w-3.5 h-3.5" />
                {{ currentCard.type === 'TRUTH' ? 'T' : 'D' }}
              </div>

              <div class="text-center w-full">
                <!-- Type Badge -->
                <div class="mb-6 flex justify-center">
                  <div ref="typeBadgeRef" class="badge-stamp px-6 py-3 text-lg"
                    :class="currentCard.type === 'TRUTH' ? 'bg-hot text-paper' : 'bg-volt text-ink'">
                    <Icon :icon="currentCard.type === 'TRUTH' ? 'mdi:chat-question' : 'mdi:fire'" class="w-6 h-6" />
                    {{ currentCard.type === 'TRUTH' ? 'TRUTH' : 'DARE' }}
                  </div>
                </div>

                <!-- Question Text -->
                <p ref="questionTextRef" class="font-display text-xl md:text-3xl font-bold mb-6 leading-relaxed px-2 text-paper">
                  {{ currentCard.text }}
                </p>

                <!-- Target (if applicable) -->
                <div v-if="currentCard.target" class="bg-white/5 border border-white/10 rounded-md p-4 max-w-sm mx-auto">
                  <p class="text-base font-medium flex items-center justify-center gap-2 text-paper">
                    <Icon icon="mdi:account-arrow-right" class="w-5 h-5 text-hot" />
                    To: {{ currentCard.target.name }}
                    <span class="text-xl">{{ currentCard.target.gender === "male" ? "♂" : "♀" }}</span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Complete/Reset Buttons -->
      <StickyActionBar v-if="currentCard && cardFlipped" class="mb-6">
        <div class="grid grid-cols-1 gap-3 w-full">
          <button
            ref="completeButtonRef"
            @click="handleCompleteChallenge($event)"
          class="w-full bg-volt text-ink shadow-hard hover:brightness-110 py-4 rounded-lg font-display font-bold uppercase tracking-wide text-lg transition-[filter] flex items-center justify-center gap-2"
          >
          <Icon icon="mdi:check-bold" class="w-6 h-6" />
            Challenge Completed!
          </button>
          <button
            @click="handleResetCard($event)"
            :disabled="skipsThisPrompt >= MAX_SKIPS_PER_PROMPT"
            :title="skipsThisPrompt >= MAX_SKIPS_PER_PROMPT ? 'No more re-rolls for this turn' : `${MAX_SKIPS_PER_PROMPT - skipsThisPrompt} re-roll${MAX_SKIPS_PER_PROMPT - skipsThisPrompt === 1 ? '' : 's'} left`"
          class="w-full bg-card hover:bg-white/5 border border-white/10 py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-card"
          >
          <Icon icon="mdi:refresh" class="w-5 h-5" />
            Choose Different Card
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
                  icon="mdi:information"
                  class="w-4 h-4 mt-0.5 flex-shrink-0 text-hot"
                />
                <span class="break-words text-paper/80">{{ log }}</span>
              </div>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, onBeforeUnmount, watch, nextTick } from "vue";
import { Icon } from "@iconify/vue";
import { push } from "notivue";
import gsap from "gsap";
import { useTruthTracker, useDareTracker } from "~/composables/useQuestionTracker";
import { useAnalytics } from "~/composables/useAnalytics";
import { useGameStore } from "~/stores/game";
import { useGameLogic } from "~/composables/useGameLogic";
import { staggerReveal, flipTransition, punchScale, tickPulse, shake, celebrateBurst } from "~/composables/useGameAnimations";
import { navigateTo } from "#app";

// Game Configuration
const MAX_HESITATION_TIME = 15;
const MAX_SKIPS_PER_PROMPT = 2;

// Game Store Integration
const gameStore = useGameStore();
const gameLogic = useGameLogic();

// State
const currentCard = ref(null);
const cardFlipped = ref(false);
const gameHistory = ref([]);
const hesitationTime = ref(MAX_HESITATION_TIME);
const hesitationTimer = ref(null);
// A reactive plain object (not a ref) so GSAP can tween `.value` directly for
// a smooth per-tick animation instead of an instant jump + CSS transition.
const hesitationPercent = reactive({ value: 100 });
const isDrawing = ref(false);
const isSpicyMode = ref(false);
const selectedCardType = ref('');
const skipsThisPrompt = ref(0);
const questionsLoading = ref(false);
const questionsError = ref(null);
const logExpanded = ref(false);

// Animation refs
const headerRowRef = ref(null);
const titleBlockRef = ref(null);
const turnBlockRef = ref(null);
const toggleBlockRef = ref(null);
const flipStageRef = ref(null);
const flipInnerRef = ref(null);
const truthButtonRef = ref(null);
const dareButtonRef = ref(null);
const completeButtonRef = ref(null);
const timerBlockRef = ref(null);
const timerNumberRef = ref(null);
const typeBadgeRef = ref(null);
const questionTextRef = ref(null);
const logBodyRef = ref(null);

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

const setSpicyMode = (value, evt) => {
  if (isSpicyMode.value === value) return;
  punchScale(evt?.currentTarget);
  isSpicyMode.value = value;
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

// Question Selection Logic - Use ONLY database questions, no icebreakers or adaptations
const getRandomQuestion = (type) => {
  let tracker;

  if (type === "TRUTH") {
    tracker = isSpicyMode.value ? spicyTruthTracker : normalTruthTracker;
  } else if (type === "DARE") {
    tracker = isSpicyMode.value ? spicyDareTracker : normalDareTracker;
  } else {
    return 'Invalid question type';
  }

  if (!tracker) {
    return 'Questions are loading... Please try again in a moment.';
  }

  const result = tracker.getNextQuestion();
  let question = result.question;

  if (result.isRepeat) {
    push.info({ title: 'Fresh round!', message: "You've seen every question — shuffling for a new round.", duration: 4000 });
  }

  return question;
};

const getRandomTarget = () => {
  return gameLogic.getTargetPlayer();
};

const drawSpecificCard = async (type) => {
  if (isDrawing.value || (currentCard.value && currentCard.value.type !== type)) {
    return;
  }

  updateActivity();

  isDrawing.value = true;
  selectedCardType.value = type;

  let target = null;
  if (type === "DARE" && players.value.length > 1) {
    target = getRandomTarget();
  }

  const content = getRandomQuestion(type);

  const nextCard = {
    type,
    text: content,
    target,
  };

  gameStore.addPromptToHistory(content);

  await flipTransition(flipInnerRef.value, () => {
    currentCard.value = nextCard;
    cardFlipped.value = true;
  });

  // Reveal beat: the type badge pops in, then the question text settles in —
  // gives the flip a second, slower "unveil" instead of everything appearing at once.
  await nextTick();
  if (typeBadgeRef.value) {
    gsap.fromTo(typeBadgeRef.value, { scale: 0.6, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.35, ease: 'back.out(2.2)' });
  }
  if (questionTextRef.value) {
    gsap.fromTo(questionTextRef.value, { y: 14, opacity: 0 }, { y: 0, opacity: 1, duration: 0.4, delay: 0.12, ease: 'power2.out' });
  }

  startHesitationTimer();
  isDrawing.value = false;
};

const handleDraw = (type, evt) => {
  punchScale(evt?.currentTarget);
  drawSpecificCard(type);
};

const handleCompleteChallenge = (evt) => {
  celebrateBurst(evt?.currentTarget);
  completeChallenge();
};

const handleResetCard = (evt) => {
  punchScale(evt?.currentTarget);
  resetCard();
};

const resetCard = () => {
  if (skipsThisPrompt.value >= MAX_SKIPS_PER_PROMPT) return;
  skipsThisPrompt.value++;
  flipTransition(flipInnerRef.value, () => {
    currentCard.value = null;
    cardFlipped.value = false;
    selectedCardType.value = '';
  });
  resetHesitationTimer();
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
      gameHistory.value.unshift(`${currentPlayer.value.name} hesitated too long!`);
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
  resetHesitationTimer();
  gameHistory.value.unshift(`${currentPlayer.value?.name} completed: ${currentCard.value.text}`);
  gameLogic.completeRound();
  nextTurn();
};

const nextTurn = () => {
  skipsThisPrompt.value = 0;
  flipTransition(flipInnerRef.value, () => {
    currentCard.value = null;
    cardFlipped.value = false;
    selectedCardType.value = '';
  });
};

// Load questions from database
async function loadQuestions() {
  questionsLoading.value = true;
  questionsError.value = null;

  try {
    const truthResponse = await $fetch('/api/questions/truth-or-dare?type=TRUTH&limit=1000')
      .catch(error => {
        throw new Error(`Failed to fetch truth questions: ${error.message || 'Unknown error'}`)
      })

    if (!truthResponse || !truthResponse.questions) {
      throw new Error('Invalid truth API response structure')
    }

    const allTruthQuestions = truthResponse.questions || []

    if (!Array.isArray(allTruthQuestions)) {
      throw new Error('Truth questions is not an array')
    }

    if (allTruthQuestions.length === 0) {
      throw new Error('No truth questions returned from API')
    }

    const dareResponse = await $fetch('/api/questions/truth-or-dare?type=DARE&limit=1000')
      .catch(error => {
        throw new Error(`Failed to fetch dare questions: ${error.message || 'Unknown error'}`)
      })

    if (!dareResponse || !dareResponse.questions) {
      throw new Error('Invalid dare API response structure')
    }

    const allDareQuestions = dareResponse.questions || []

    if (!Array.isArray(allDareQuestions)) {
      throw new Error('Dare questions is not an array')
    }

    if (allDareQuestions.length === 0) {
      throw new Error('No dare questions returned from API')
    }

    const normalTruths = allTruthQuestions
      .filter(q => {
        if (!q || typeof q !== 'object') return false;
        const intensity = q.intensity ?? 2;
        return intensity <= 3;
      })
      .map(q => q.text || String(q))

    const spicyTruths = allTruthQuestions
      .filter(q => {
        if (!q || typeof q !== 'object') return false;
        const intensity = q.intensity ?? 2;
        return intensity >= 4;
      })
      .map(q => q.text || String(q))

    const normalDares = allDareQuestions
      .filter(q => {
        if (!q || typeof q !== 'object') return false;
        const intensity = q.intensity ?? 2;
        return intensity <= 3;
      })
      .map(q => q.text || String(q))

    const spicyDares = allDareQuestions
      .filter(q => {
        if (!q || typeof q !== 'object') return false;
        const intensity = q.intensity ?? 2;
        return intensity >= 4;
      })
      .map(q => q.text || String(q))

    if (normalTruths.length === 0 && spicyTruths.length === 0 && normalDares.length === 0 && spicyDares.length === 0) {
      questionsError.value = 'No questions found in database. Please seed your database with questions.';
      throw new Error('No questions found in database')
    }

    if (normalTruths.length === 0 && spicyTruths.length === 0) {
      questionsError.value = 'No truth questions found in database.';
      throw new Error('No truth questions found')
    }

    if (normalDares.length === 0 && spicyDares.length === 0) {
      questionsError.value = 'No dare questions found in database.';
      throw new Error('No dare questions found')
    }

    normalTruthTracker = useTruthTracker(normalTruths.length > 0 ? normalTruths : (spicyTruths.length > 0 ? spicyTruths : []), false);
    spicyTruthTracker = useTruthTracker(spicyTruths.length > 0 ? spicyTruths : (normalTruths.length > 0 ? normalTruths : []), true);
    normalDareTracker = useDareTracker(normalDares.length > 0 ? normalDares : (spicyDares.length > 0 ? spicyDares : []), false);
    spicyDareTracker = useDareTracker(spicyDares.length > 0 ? spicyDares : (normalDares.length > 0 ? normalDares : []), true);

    if (!normalTruthTracker || !spicyTruthTracker || !normalDareTracker || !spicyDareTracker) {
      throw new Error('Failed to create question trackers')
    }

    normalTruthTracker.initializeTracker();
    spicyTruthTracker.initializeTracker();
    normalDareTracker.initializeTracker();
    spicyDareTracker.initializeTracker();

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
    questionsError.value = error.message || 'Failed to load questions from database. Please refresh the page or contact support.';
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
      await navigateTo('/setup?game=truth-or-dare');
      return;
    }

    if (!gameStore.selectedGame) {
      gameStore.setSelectedGame('truth-or-dare');
    }

    if (!gameStore.gameMode) {
      await navigateTo('/setup?game=truth-or-dare');
      return;
    }

    await nextTick();
    staggerReveal([headerRowRef.value, titleBlockRef.value, turnBlockRef.value, toggleBlockRef.value]);

    await loadQuestions();
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
