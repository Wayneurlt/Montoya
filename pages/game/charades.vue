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
          <span class="text-xs sm:text-sm px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full border font-display uppercase tracking-wide bg-paper/10 text-paper border-paper/20 flex items-center gap-1.5 whitespace-nowrap">
            <Icon icon="mdi:account-group" class="w-3.5 h-3.5" />
            Family
          </span>
          <span class="text-xs sm:text-sm px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full border font-display uppercase tracking-wide bg-hot/15 text-hot border-hot/30 whitespace-nowrap">
            Round {{ roundCount }}
          </span>
        </div>
      </div>

      <!-- Game Title -->
      <div ref="titleBlockRef" class="text-center mb-8">
        <h1 class="font-display text-4xl sm:text-5xl md:text-6xl font-bold uppercase mb-4 text-paper flex items-center justify-center gap-3">
          <Icon icon="mdi:drama-masks" class="w-9 h-9 sm:w-11 sm:h-11 text-hot" />
          Charades
        </h1>
        <p class="text-paper/60 text-sm font-medium px-2">Act it out without speaking! Your team has to guess what you're acting.</p>
      </div>

      <!-- Current Actor -->
      <div ref="turnBlockRef" class="card-poster p-4 mb-6">
        <div class="text-center">
          <div class="text-xs font-display uppercase tracking-wider text-paper/50 mb-1">Current Actor</div>
          <div class="text-xl font-bold font-display uppercase">{{ currentPlayer?.name }}</div>
        </div>
      </div>

      <!-- Timer -->
      <div v-if="timerActive" ref="timerBlockRef" class="card-poster p-4 mb-6">
        <div class="flex justify-between items-center mb-2">
          <div class="flex items-center gap-2">
            <Icon icon="mdi:timer" class="w-5 h-5 text-hot" />
            <span class="font-display uppercase tracking-wide text-sm">Time Remaining</span>
          </div>
          <span
            ref="timerNumberRef"
            class="font-bold font-display text-lg tabular-nums"
            :class="timeLeft <= 10 ? 'text-hot' : 'text-volt'"
          >
            {{ timeLeft }}s
          </span>
        </div>
        <div class="w-full h-2 bg-white/10 rounded-full overflow-hidden">
          <div
            class="h-full bg-hot transition-[width] duration-1000 ease-linear"
            :style="{ width: timePercent + '%' }"
          ></div>
        </div>
      </div>

      <!-- Draw Card -->
      <div v-if="!currentPrompt && !timerActive" class="text-center py-8 sm:py-10 md:py-12">
        <button
          @click="handleDrawPrompt($event)"
          class="bg-hot text-paper shadow-hard hover:brightness-110 px-8 sm:px-10 md:px-12 py-4 sm:py-5 rounded-lg font-display font-bold uppercase tracking-wide text-lg sm:text-xl transition-[filter]"
        >
          <Icon icon="mdi:cards" class="w-6 h-6 sm:w-7 sm:h-7 inline-block mr-2 -mt-1" />
          Draw Card
        </button>
      </div>

      <!-- Show Prompt (Hidden from others) -->
      <div v-else class="space-y-4 sm:space-y-5 md:space-y-6 mb-6">
        <div class="max-w-md mx-auto">
          <div ref="promptCardRef" class="card-face is-volt p-6 sm:p-8 md:p-10 min-h-[240px] flex items-center justify-center">
            <div class="card-index card-index-tl text-volt"><Icon icon="mdi:drama-masks" class="w-3.5 h-3.5" />C</div>
            <div class="card-index card-index-br text-volt"><Icon icon="mdi:drama-masks" class="w-3.5 h-3.5" />C</div>
            <div class="text-center w-full">
              <div class="mb-5 flex justify-center">
                <div class="badge-stamp px-5 py-2.5 text-base bg-volt text-ink">
                  <Icon icon="mdi:tag" class="w-5 h-5" />
                  {{ currentCategory }}
                </div>
              </div>
              <p class="font-display text-2xl sm:text-3xl md:text-4xl font-bold leading-tight text-paper">{{ currentPrompt }}</p>
            </div>
          </div>
        </div>

        <!-- Action Buttons -->
        <StickyActionBar>
          <div class="grid grid-cols-2 gap-3 sm:gap-4 w-full">
            <button
              @click="handleCorrectGuess($event)"
              class="bg-volt text-ink shadow-hard hover:brightness-110 py-3 sm:py-4 rounded-lg font-display font-bold uppercase tracking-wide text-base sm:text-lg transition-[filter] flex items-center justify-center gap-2"
            >
              <Icon icon="mdi:check-circle" class="w-5 h-5 sm:w-6 sm:h-6" />
              Correct!
            </button>
            <button
              @click="handleSkipPrompt($event)"
              class="bg-card hover:bg-white/5 border border-white/10 py-3 sm:py-4 rounded-lg font-display font-bold uppercase tracking-wide text-base sm:text-lg transition-colors flex items-center justify-center gap-2"
            >
              <Icon icon="mdi:skip-next" class="w-5 h-5 sm:w-6 sm:h-6" />
              Skip
            </button>
          </div>
        </StickyActionBar>
      </div>

      <!-- Score Board: collapsed by default so it doesn't eat gameplay space -->
      <div class="card-poster overflow-hidden">
        <button
          type="button"
          @click="toggleScoreboard"
          class="w-full flex items-center justify-between p-4 font-display uppercase tracking-wide text-sm text-paper/70"
        >
          <span class="flex items-center gap-2">
            <Icon icon="mdi:trophy" class="w-5 h-5 text-volt" />
            <span>Scoreboard</span>
          </span>
          <Icon icon="mdi:chevron-down" class="w-5 h-5 transition-transform duration-200" :class="{ 'rotate-180': scoreboardExpanded }" />
        </button>
        <div ref="scoreboardBodyRef" class="overflow-hidden" style="height: 0">
          <div class="space-y-2 sm:space-y-3 px-4 pb-4 sm:pb-5 md:pb-6">
            <div
              v-for="player in players"
              :key="player.id"
              class="flex justify-between items-center p-2 sm:p-3 rounded-md border"
              :class="player.id === currentPlayer?.id ? 'bg-hot/15 border-hot/30' : 'bg-white/5 border-transparent'"
            >
              <span class="font-medium text-sm sm:text-base">{{ player.name }}</span>
              <span class="font-bold font-display text-lg sm:text-xl text-volt">{{ scores[player.id] || 0 }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, nextTick } from "vue";
import { Icon } from "@iconify/vue";
import { push } from "notivue";
import gsap from "gsap";
import { useGameStore } from "~/stores/game";
import { useAnalytics } from "~/composables/useAnalytics";
import { staggerReveal, punchScale, tickPulse, shake } from "~/composables/useGameAnimations";
import { navigateTo } from "#app";

const gameStore = useGameStore();
const { trackPageView } = useAnalytics();

const MAX_TIME = 120; // 2 minutes
const timeLeft = ref(MAX_TIME);
const timerActive = ref(false);
const timerInterval = ref(null);
const currentPrompt = ref("");
const currentCategory = ref("");
const roundCount = ref(1);
const scores = ref({});
const scoreboardExpanded = ref(false);

// Animation refs
const headerRowRef = ref(null);
const titleBlockRef = ref(null);
const turnBlockRef = ref(null);
const timerBlockRef = ref(null);
const timerNumberRef = ref(null);
const promptCardRef = ref(null);
const scoreboardBodyRef = ref(null);

const players = computed(() => gameStore.players);
const currentPlayer = computed(() => gameStore.currentPlayer);

const timePercent = computed(() => (timeLeft.value / MAX_TIME) * 100);

const categories = {
  "Movies & TV": [
    "Harry Potter",
    "Frozen",
    "The Lion King",
    "Star Wars",
    "SpongeBob",
    "Finding Nemo",
    "Toy Story",
    "Shrek",
    "The Avengers",
    "Jurassic Park"
  ],
  "Animals": [
    "Elephant",
    "Kangaroo",
    "Penguin",
    "Monkey",
    "Giraffe",
    "Dolphin",
    "Butterfly",
    "Snake",
    "Eagle",
    "Lion"
  ],
  "Actions": [
    "Brushing teeth",
    "Playing guitar",
    "Swimming",
    "Cooking",
    "Dancing",
    "Reading a book",
    "Playing soccer",
    "Sleeping",
    "Riding a bike",
    "Taking a photo"
  ],
  "Professions": [
    "Doctor",
    "Teacher",
    "Chef",
    "Firefighter",
    "Police Officer",
    "Astronaut",
    "Pilot",
    "Artist",
    "Dancer",
    "Musician"
  ],
  "Objects": [
    "Umbrella",
    "Phone",
    "Camera",
    "Guitar",
    "Basketball",
    "Balloon",
    "Clock",
    "Book",
    "Sunglasses",
    "Backpack"
  ]
};

// Tracked per category — a flat cross-category list meant one exhausted
// category (only 10 prompts each) would wipe every other category's used-state
// too, causing far more repeats than the 50-prompt total pool suggests.
const usedPromptsByCategory = ref({});

function drawPrompt() {
  // Start timer only if not already active
  if (!timerActive.value) {
    startTimer();
  }

  const categoryNames = Object.keys(categories);
  const randomCategory = categoryNames[Math.floor(Math.random() * categoryNames.length)];
  const usedInCategory = usedPromptsByCategory.value[randomCategory] || [];
  let availablePrompts = categories[randomCategory].filter(p => !usedInCategory.includes(p));

  let isRepeat = false;
  if (availablePrompts.length === 0) {
    isRepeat = true;
    availablePrompts = categories[randomCategory];
    usedPromptsByCategory.value[randomCategory] = [];
  }

  const randomPrompt = availablePrompts[Math.floor(Math.random() * availablePrompts.length)];

  currentPrompt.value = randomPrompt;
  currentCategory.value = randomCategory;
  usedPromptsByCategory.value[randomCategory] = [...(usedPromptsByCategory.value[randomCategory] || []), randomPrompt];

  if (isRepeat) {
    push.info({ title: 'Fresh round!', message: `You've acted out every "${randomCategory}" prompt — shuffling that category.`, duration: 4000 });
  }

  // Quick punch-in reveal for the new prompt — a full card flip is too slow
  // for a fast, timer-driven prompt cadence.
  nextTick(() => punchScale(promptCardRef.value));
}

// Button handlers: add tactile feedback without altering the underlying game logic.
function handleDrawPrompt(evt) {
  punchScale(evt?.currentTarget);
  drawPrompt();
}

function handleCorrectGuess(evt) {
  punchScale(evt?.currentTarget);
  correctGuess();
}

function handleSkipPrompt(evt) {
  punchScale(evt?.currentTarget);
  skipPrompt();
}

// Collapsed by default so the scoreboard doesn't permanently eat gameplay
// space — mirrors the Game Log accordion pattern used in truth-or-dare.vue
// and do-or-drink.vue (animate the height open/closed rather than a plain v-if).
function toggleScoreboard() {
  scoreboardExpanded.value = !scoreboardExpanded.value;
  nextTick(() => {
    if (!scoreboardBodyRef.value) return;
    if (scoreboardExpanded.value) {
      const targetHeight = scoreboardBodyRef.value.scrollHeight;
      gsap.fromTo(
        scoreboardBodyRef.value,
        { height: 0 },
        { height: targetHeight, duration: 0.35, ease: 'power2.out', onComplete: () => gsap.set(scoreboardBodyRef.value, { height: 'auto' }) }
      );
    } else {
      gsap.fromTo(
        scoreboardBodyRef.value,
        { height: scoreboardBodyRef.value.scrollHeight },
        { height: 0, duration: 0.28, ease: 'power2.in' }
      );
    }
  });
}

function startTimer() {
  if (timerActive.value) return; // Don't restart if already running

  timerActive.value = true;
  timeLeft.value = MAX_TIME;

  timerInterval.value = setInterval(() => {
    timeLeft.value--;
    tickPulse(timerNumberRef.value, { scale: timeLeft.value <= 10 ? 1.4 : 1.15 });
    if (timeLeft.value === 10) {
      shake(timerBlockRef.value);
    }

    if (timeLeft.value <= 0) {
      stopTimer();
      // Time's up - move to next player
      nextTurn();
    }
  }, 1000);
}

function stopTimer() {
  clearInterval(timerInterval.value);
  timerActive.value = false;
}

function correctGuess() {
  // Award point
  if (!scores.value[currentPlayer.value.id]) {
    scores.value[currentPlayer.value.id] = 0;
  }
  scores.value[currentPlayer.value.id]++;

  // Automatically draw next prompt (timer continues)
  drawPrompt();
}

function skipPrompt() {
  // Automatically draw next prompt (timer continues)
  drawPrompt();
}

function nextTurn() {
  stopTimer();
  currentPrompt.value = "";
  currentCategory.value = "";
  // Deliberately NOT resetting usedPromptsByCategory here — tracking needs to
  // persist across turns/players for prompts to actually stop repeating over
  // the course of a full game, not just within one player's turn.
  gameStore.nextTurn();
  roundCount.value++;
}

onMounted(() => {
  trackPageView('charades');

  // Load game state
  gameStore.loadFromLocalStorage();

  // Initialize scores
  players.value.forEach(player => {
    if (!scores.value[player.id]) {
      scores.value[player.id] = 0;
    }
  });

  // Redirect if no players
  if (players.value.length === 0) {
    navigateTo('/setup?game=charades');
    return;
  }

  nextTick(() => {
    staggerReveal([headerRowRef.value, titleBlockRef.value, turnBlockRef.value]);
  });
});

onBeforeUnmount(() => {
  stopTimer();
});
</script>

<style scoped>
/* Add any additional styles here */
</style>
