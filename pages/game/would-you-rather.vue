<template>
  <div class="min-h-screen bg-nightlife text-paper p-3 sm:p-4 relative overflow-x-hidden overflow-y-auto safe-bottom">
    <!-- Background Icons Pattern -->
    <BackgroundIcons />

    <div class="max-w-5xl mx-auto relative z-10 pt-4 sm:pt-6 md:pt-8">
      <!-- Header with Home Button -->
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
          <div class="bg-card border border-white/10 px-3 sm:px-4 py-1.5 sm:py-2 rounded-md">
            <div class="text-[10px] sm:text-xs text-paper/50 font-display uppercase tracking-wide">Current Turn</div>
            <div class="text-xs sm:text-sm font-bold font-display uppercase flex items-center gap-1 sm:gap-1.5">
              <span class="truncate max-w-[100px] sm:max-w-none">{{ currentPlayer?.name || 'Player' }}</span>
              <span class="text-xs sm:text-base flex-shrink-0 text-hot">{{ currentPlayer?.gender === 'male' ? '♂' : currentPlayer?.gender === 'female' ? '♀' : '' }}</span>
            </div>
          </div>
          <span class="text-xs sm:text-sm px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full border font-display uppercase tracking-wide bg-hot/15 text-hot border-hot/30 flex items-center gap-1.5 sm:gap-2">
            <Icon icon="mdi:head-question" class="w-4 h-4 sm:w-5 sm:h-5" />
            <span>Round {{ roundCount }}</span>
          </span>
        </div>
      </div>

      <!-- Game Title Card -->
      <div ref="titleBlockRef" class="text-center mb-4 sm:mb-6">
        <h1 class="font-display text-3xl sm:text-4xl md:text-5xl font-bold uppercase mb-1 sm:mb-2 text-paper">
          Would You <span class="text-hot">Rather</span>
        </h1>
        <p class="text-paper/60 text-sm font-medium">Make impossible choices!</p>
      </div>

      <!-- Main Question Card with Split Display -->
      <div ref="questionCardRef" class="mb-4 sm:mb-6">
        <div ref="questionStageRef" class="relative">
          <!-- Two-column layout for choices -->
          <div v-if="parsedQuestion" class="relative grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            <!-- Decorative VS badge (only shown once options sit side-by-side, md+) -->
            <div class="hidden md:flex absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 items-center justify-center">
              <div class="bg-hot text-paper px-5 py-2.5 rounded-full shadow-hard rotate-12">
                <span class="font-display font-black text-xl uppercase">VS</span>
              </div>
            </div>

            <!-- Option A -->
            <button
              @click="handleSelectOptionClick('A', $event)"
              :disabled="isMultiplayer && hasVoted"
              class="mode-card"
              :class="{ 'is-active': selectedOption === 'A', 'opacity-50 cursor-not-allowed': isMultiplayer && hasVoted }"
            >
              <span class="mode-card-title text-xs opacity-70">Option A</span>
              <p class="font-display text-lg md:text-xl font-bold text-center leading-snug px-1">
                {{ parsedQuestion.optionA }}
              </p>
              <Icon icon="mdi:check-circle" class="mode-card-check" />
            </button>

            <!-- Option B -->
            <button
              @click="handleSelectOptionClick('B', $event)"
              :disabled="isMultiplayer && hasVoted"
              class="mode-card is-volt"
              :class="{ 'is-active': selectedOption === 'B', 'opacity-50 cursor-not-allowed': isMultiplayer && hasVoted }"
            >
              <span class="mode-card-title text-xs opacity-70">Option B</span>
              <p class="font-display text-lg md:text-xl font-bold text-center leading-snug px-1">
                {{ parsedQuestion.optionB }}
              </p>
              <Icon icon="mdi:check-circle" class="mode-card-check" />
            </button>
          </div>

          <!-- Fallback for non-parsed questions -->
          <div v-else class="card-face p-8 md:p-10 min-h-[220px] flex items-center justify-center">
            <div class="card-index card-index-tl text-hot"><Icon icon="mdi:head-question" class="w-3.5 h-3.5" />W</div>
            <div class="card-index card-index-br text-hot"><Icon icon="mdi:head-question" class="w-3.5 h-3.5" />W</div>
            <div class="text-center w-full">
              <div class="mb-6 flex justify-center">
                <div class="badge-stamp px-6 py-3 text-lg bg-hot text-paper">
                  <Icon icon="mdi:head-question" class="w-6 h-6" />
                  Would You Rather
                </div>
              </div>
              <p class="font-display text-xl md:text-3xl font-bold leading-relaxed px-2 text-paper">
                {{ question?.text || 'Ready for tough choices?' }}
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- Multiplayer Results -->
      <div v-if="isMultiplayer && roomState && roomState.gamePhase === 'results'" class="mb-6">
        <div class="card-poster p-6">
          <h3 class="font-display uppercase tracking-wide text-lg font-bold mb-4 text-center">Results</h3>
          <div class="grid grid-cols-2 gap-4">
            <div class="bg-hot/10 border border-hot/30 rounded-lg p-4">
              <div class="text-3xl font-display font-bold text-hot mb-2">{{ optionACount }}</div>
              <div class="text-sm font-display uppercase tracking-wide text-hot/80 mb-3">Option A</div>
              <div class="h-2 bg-white/10 rounded-full overflow-hidden">
                <div class="h-full bg-hot transition-all duration-500" :style="{ width: `${optionAPercentage}%` }"></div>
              </div>
              <div v-if="roomState && roomState.answerVisibility === 'public'" class="mt-3 space-y-1">
                <div v-for="vote in optionAVotes" :key="vote.socketId" class="text-xs text-paper/70">
                  {{ vote.nickname }}
                </div>
              </div>
            </div>
            <div class="bg-volt/10 border border-volt/30 rounded-lg p-4">
              <div class="text-3xl font-display font-bold text-volt mb-2">{{ optionBCount }}</div>
              <div class="text-sm font-display uppercase tracking-wide text-volt/80 mb-3">Option B</div>
              <div class="h-2 bg-white/10 rounded-full overflow-hidden">
                <div class="h-full bg-volt transition-all duration-500" :style="{ width: `${optionBPercentage}%` }"></div>
              </div>
              <div v-if="roomState && roomState.answerVisibility === 'public'" class="mt-3 space-y-1">
                <div v-for="vote in optionBVotes" :key="vote.socketId" class="text-xs text-paper/70">
                  {{ vote.nickname }}
                </div>
              </div>
            </div>
          </div>
          <div v-if="isHost" class="mt-4">
            <button
              @click="handleNextRoundClick"
              class="w-full bg-volt text-ink shadow-hard hover:brightness-110 px-6 py-3 rounded-lg font-display font-bold uppercase tracking-wide transition-[filter]"
            >
              Next Question
            </button>
          </div>
        </div>
      </div>

      <!-- Primary Action Buttons: kept reachable without scrolling -->
      <StickyActionBar v-if="!isMultiplayer || !roomState || roomState.gamePhase !== 'playing'">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
          <button
            @click="handleFetchAnotherClick"
            class="bg-card hover:bg-white/5 border border-white/10 px-8 py-5 rounded-lg font-display font-bold uppercase tracking-wide text-lg flex items-center justify-center gap-3 transition-colors"
          >
            <Icon icon="mdi:refresh" class="w-6 h-6" />
            <span>Next Dilemma</span>
          </button>

          <button
            @click="handleApplyPenaltyClick"
            class="bg-hot text-paper shadow-hard hover:brightness-110 px-8 py-5 rounded-lg font-display font-bold uppercase tracking-wide text-lg flex items-center justify-center gap-3 transition-[filter]"
          >
            <Icon icon="mdi:glass-cocktail" class="w-6 h-6" />
            <span>Can't Decide? Drink!</span>
          </button>
        </div>
      </StickyActionBar>

      <!-- Multiplayer Vote Status -->
      <div v-if="isMultiplayer && hasVoted && roomState && roomState.gamePhase === 'playing'" class="mb-6 text-center text-paper/60 text-sm font-medium flex items-center justify-center gap-2">
        <Icon icon="mdi:check-circle" class="w-4 h-4 text-volt" />
        <span>Vote submitted! Waiting for other players...</span>
      </div>

      <!-- Penalty Display -->
      <transition name="bounce-in">
        <div v-if="showPenalty" ref="penaltyBlockRef" class="mb-6">
          <div class="card-poster border-hot/40 p-6 text-center">
            <div class="flex items-center justify-center gap-3 mb-2">
              <Icon icon="mdi:bottle-wine" class="w-8 h-8 text-hot" />
              <p class="font-display font-bold uppercase tracking-wide text-xl text-paper">{{ penaltyMessage }}</p>
              <Icon icon="mdi:bottle-wine" class="w-8 h-8 text-hot" />
            </div>
            <p class="text-paper/60 text-sm mt-2">Indecision has consequences!</p>
          </div>
        </div>
      </transition>

      <!-- Game Stats: collapsed by default so it doesn't eat gameplay space -->
      <div class="card-poster overflow-hidden">
        <button
          type="button"
          @click="toggleStats"
          class="w-full flex items-center justify-between p-4 font-display uppercase tracking-wide text-sm text-paper/70"
        >
          <span class="flex items-center gap-2">
            <Icon icon="mdi:chart-box" class="w-5 h-5" />
            <span>Game Stats</span>
          </span>
          <Icon icon="mdi:chevron-down" class="w-5 h-5 transition-transform duration-200" :class="{ 'rotate-180': statsExpanded }" />
        </button>
        <div ref="statsBodyRef" class="overflow-hidden" style="height: 0">
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 px-4 pb-4">
            <div class="card-poster p-4 text-center">
              <Icon icon="mdi:thought-bubble" class="w-8 h-8 mx-auto mb-2 text-hot" />
              <p class="text-2xl font-display font-bold text-paper">{{ questionCount }}</p>
              <p class="text-paper/50 text-xs font-display uppercase tracking-wide">Dilemmas</p>
            </div>

            <div class="card-poster card-poster-volt p-4 text-center">
              <Icon icon="mdi:vote" class="w-8 h-8 mx-auto mb-2 text-volt" />
              <p class="text-2xl font-display font-bold text-paper">{{ choicesMade }}</p>
              <p class="text-paper/50 text-xs font-display uppercase tracking-wide">Decisions</p>
            </div>

            <div class="card-poster p-4 text-center">
              <Icon icon="mdi:glass-cocktail" class="w-8 h-8 mx-auto mb-2 text-hot" />
              <p class="text-2xl font-display font-bold text-paper">{{ penaltyCount }}</p>
              <p class="text-paper/50 text-xs font-display uppercase tracking-wide">Penalties</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch, nextTick } from 'vue';
import { Icon } from '@iconify/vue';
import { push } from 'notivue';
import gsap from 'gsap';
import { useAnalytics } from '~/composables/useAnalytics';
import { useGameStore } from '~/stores/game';
// Questions are now loaded from database via API
import { useWouldYouRatherTracker } from '~/composables/useQuestionTracker';
import { useMultiplayer } from '~/composables/useMultiplayer';
import { staggerReveal, punchScale, shake } from '~/composables/useGameAnimations';

// Multiplayer room state lives in a process-wide singleton (see useMultiplayer.ts),
// not per-request — rendering it during SSR could leak one user's live room into
// another user's server-rendered HTML, so this page is client-only.
definePageMeta({ ssr: false });

const gameStore = useGameStore();
const currentPlayer = computed(() => gameStore.currentPlayer);

// Multiplayer integration
const route = useRoute();
const isMultiplayer = computed(() => route.query.multiplayer === 'true');
const multiplayer = useMultiplayer();
const { roomState, votes, isHost, submitVote, showResults, nextRound, connect } = multiplayer;

const question = ref(null);

// Initialize question tracker
let questionTracker = null;
const showPenalty = ref(false);
const penaltyMessage = ref('');
const selectedOption = ref(null);
const hasVoted = ref(false);
const statsExpanded = ref(false);

// Game statistics
const roundCount = ref(0);
const questionCount = ref(0);
const choicesMade = ref(0);
const penaltyCount = ref(0);

// Initialize analytics
const { trackPageView, updateActivity } = useAnalytics();

// Animation refs
const headerRowRef = ref(null);
const titleBlockRef = ref(null);
const questionCardRef = ref(null);
const questionStageRef = ref(null);
const penaltyBlockRef = ref(null);
const statsBodyRef = ref(null);

// Collapsed by default so the stats grid doesn't permanently eat gameplay
// space — animate the height open/closed rather than a plain v-if (same
// disclosure pattern as the Game Log accordion in truth-or-dare.vue /
// do-or-drink.vue).
const toggleStats = () => {
  statsExpanded.value = !statsExpanded.value;
  nextTick(() => {
    if (!statsBodyRef.value) return;
    if (statsExpanded.value) {
      const targetHeight = statsBodyRef.value.scrollHeight;
      gsap.fromTo(
        statsBodyRef.value,
        { height: 0 },
        { height: targetHeight, duration: 0.35, ease: 'power2.out', onComplete: () => gsap.set(statsBodyRef.value, { height: 'auto' }) }
      );
    } else {
      gsap.fromTo(
        statsBodyRef.value,
        { height: statsBodyRef.value.scrollHeight },
        { height: 0, duration: 0.28, ease: 'power2.in' }
      );
    }
  });
};

// Reveal beat: whenever the displayed question changes, crossfade the whole
// answer stage (mode-card pair or fallback card-face) in — mirrors how
// truth-or-dare.vue reveals `questionTextRef` after a draw, adapted to a
// block-level swap since this page's content shape changes (two options vs.
// a single fallback panel).
watch(question, (_val, oldVal) => {
  // Skip the very first population: questionCardRef (this element's parent) is
  // already fading in via staggerReveal() on mount, and animating both at once
  // compounds their opacity multiplicatively, leaving the card nearly invisible
  // for far longer than either animation's own duration.
  if (!oldVal) return;
  nextTick(() => {
    if (!questionStageRef.value) return;
    gsap.fromTo(questionStageRef.value, { y: 14, opacity: 0 }, { y: 0, opacity: 1, duration: 0.4, ease: 'power2.out' });
  });
});

// Shared across every call site that pulls a question from the tracker: once the
// whole pool has been shown, the tracker resets and picks a repeat — tell the
// player that's happening instead of silently repeating a question.
const notifyIfRepeat = (result: { isRepeat: boolean } | null | undefined) => {
  if (result?.isRepeat) {
    push.info({ title: 'Fresh round!', message: "You've seen every question — shuffling for a new round.", duration: 4000 });
  }
};

// Multiplayer vote counts
const optionACount = computed(() => {
  return votes.value.filter(v => v.vote === 'A').length;
});

const optionBCount = computed(() => {
  return votes.value.filter(v => v.vote === 'B').length;
});

const totalVotes = computed(() => {
  return votes.value.length;
});

const optionAPercentage = computed(() => {
  return totalVotes.value > 0 ? Math.round((optionACount.value / totalVotes.value) * 100) : 0;
});

const optionBPercentage = computed(() => {
  return totalVotes.value > 0 ? Math.round((optionBCount.value / totalVotes.value) * 100) : 0;
});

const optionAVotes = computed(() => {
  return votes.value.filter(v => v.vote === 'A' && v.nickname);
});

const optionBVotes = computed(() => {
  return votes.value.filter(v => v.vote === 'B' && v.nickname);
});

// Parse question to extract two options
const parsedQuestion = computed(() => {
  if (!question.value?.text) return null;

  const text = question.value.text.toLowerCase();

  // Try to find "or" to split the options
  const orIndex = text.indexOf(' or ');
  if (orIndex === -1) return null;

  // Remove "would you rather" prefix if present
  let cleanText = text;
  if (cleanText.startsWith('would you rather ')) {
    cleanText = cleanText.substring('would you rather '.length);
  }

  const parts = cleanText.split(' or ');
  if (parts.length < 2) return null;

  return {
    optionA: parts[0].trim().charAt(0).toUpperCase() + parts[0].trim().slice(1),
    optionB: parts.slice(1).join(' or ').trim().charAt(0).toUpperCase() + parts.slice(1).join(' or ').trim().slice(1)
  };
});

const selectOption = (option) => {
  selectedOption.value = option;
  choicesMade.value++;

  // Track activity
  updateActivity();

  // Auto-advance after selection
  setTimeout(() => {
    fetchAnother();
  }, 1000);
};

// Multiplayer option selection
const handleSelectOption = (option: 'A' | 'B') => {
  if (hasVoted.value && isMultiplayer.value) return;

  selectedOption.value = option;
  choicesMade.value++;
  updateActivity();

  if (isMultiplayer.value) {
    submitVote(option);
    hasVoted.value = true;
  } else {
    setTimeout(() => {
      fetchAnother();
    }, 1000);
  }
};

// Handle next round (host only)
const handleNextRound = () => {
  if (!isHost.value || !isMultiplayer.value) return;

  const result = questionTracker?.getNextQuestion();
  if (result) {
    notifyIfRepeat(result);
    nextRound({ prompt: { text: result.question } });
    hasVoted.value = false;
    selectedOption.value = null;
    question.value = { text: result.question };
    questionCount.value++;
    roundCount.value++;
  }
};

// Thin click wrappers that add the shared tactile "punch" feedback around the
// existing, untouched game logic — same pattern as truth-or-dare.vue's
// handleDraw/handleCompleteChallenge/handleResetCard.
const handleFetchAnotherClick = (evt?: Event) => {
  punchScale((evt?.currentTarget as Element) ?? null);
  fetchAnother();
};

const handleApplyPenaltyClick = (evt?: Event) => {
  punchScale((evt?.currentTarget as Element) ?? null);
  applyPenalty();
  nextTick(() => shake(penaltyBlockRef.value));
};

const handleSelectOptionClick = (option: 'A' | 'B', evt?: Event) => {
  punchScale((evt?.currentTarget as Element) ?? null);
  handleSelectOption(option);
};

const handleNextRoundClick = (evt?: Event) => {
  punchScale((evt?.currentTarget as Element) ?? null);
  handleNextRound();
};

// Watch for game state updates in multiplayer
watch(() => roomState.value.gamePhase, (newPhase) => {
  if (newPhase === 'playing') {
    hasVoted.value = false;
    selectedOption.value = null;

    // If host, fetch next question
    if (isHost.value && questionTracker) {
      const result = questionTracker.getNextQuestion();
      notifyIfRepeat(result);
      question.value = { text: result.question };
      questionCount.value++;
      roundCount.value++;
    } else if (roomState.value.currentPrompt) {
      question.value = roomState.value.currentPrompt;
    }
  }
});

// Watch for vote updates
watch(() => votes.value, (newVotes) => {
  // Check if all players have voted (host can show results)
  if (isHost.value && newVotes.length >= roomState.value.players.length) {
    // Auto-show results after a short delay
    setTimeout(() => {
      if (roomState.value.gamePhase === 'playing') {
        showResults();
      }
    }, 2000);
  }
});

const fetchAnother = () => {
  showPenalty.value = false;
  selectedOption.value = null;

  // Track user activity
  updateActivity();

  if (!questionTracker) {
    question.value = { text: 'Questions are loading... Please wait.' };
    return;
  }

  const result = questionTracker.getNextQuestion();
  notifyIfRepeat(result);

  // Log usage stats for debugging
  const stats = questionTracker.getUsageStats.value;
  console.log(`Would You Rather - Used: ${stats.usedCount}/${stats.totalQuestions} (${stats.usagePercentage}%)`);

  question.value = { text: result.question };
  roundCount.value++;
  questionCount.value++;
};

const applyPenalty = () => {
  const penalties = [
    'Take 2 sips as penalty!',
    'Take a shot as penalty!',
    'Drink for 3 seconds straight!',
    'Take a large gulp as penalty!',
    'Finish your current drink!',
    'Down the whole thing!',
    'Take 4 big sips!',
    'Chug for 5 seconds!'
  ];
  penaltyMessage.value = penalties[Math.floor(Math.random() * penalties.length)];
  showPenalty.value = true;
  penaltyCount.value++;

  // Track activity
  updateActivity();

  // Auto-hide penalty message after 5 seconds
  setTimeout(() => {
    showPenalty.value = false;
  }, 5000);
};

// Load questions from database
async function loadQuestions() {
  try {
    console.log('🔄 Loading Would You Rather questions from database...')
    const response = await $fetch('/api/questions/group-game?gameType=WOULD_YOU_RATHER&limit=1000')
    console.log('Would You Rather API response:', response)
    const questions = response.questions || []

    // Create tracker with loaded questions
    questionTracker = useWouldYouRatherTracker(questions.map(q => q.text))
    questionTracker.initializeTracker();

    console.log(`✅ Loaded ${questions.length} Would You Rather questions`)
  } catch (error) {
    console.error('❌ Error loading Would You Rather questions:', error)
    // Fallback questions
    questionTracker = useWouldYouRatherTracker([
      'Would you rather have the ability to fly or be invisible?',
      'Would you rather be rich or famous?',
      'Would you rather live in the past or the future?',
      'Would you rather always be 10 minutes late or 20 minutes early?',
      'Would you rather have unlimited money or unlimited time?'
    ])
    questionTracker.initializeTracker();
    console.log('⚠️ Using fallback Would You Rather questions')
  }
}

onMounted(async () => {
  if (typeof window !== "undefined") {
    // Track page view
    trackPageView('would-you-rather');

    // Initialize multiplayer if in multiplayer mode
    if (isMultiplayer.value) {
      connect();

      // Check if we have room info
      const roomInfo = localStorage.getItem('multiplayer_room');
      if (roomInfo) {
        try {
          const info = JSON.parse(roomInfo);
          console.log('Multiplayer room info:', info);
        } catch (e) {
          console.error('Failed to parse room info:', e);
        }
      }
    }

    // Load game state
    gameStore.loadFromLocalStorage();

    await nextTick();
    staggerReveal([headerRowRef.value, titleBlockRef.value, questionCardRef.value]);

    // Load questions from database
    await loadQuestions()

    // In multiplayer, wait for host to start game
    if (isMultiplayer.value) {
      if (isHost.value && roomState.value.gamePhase === 'playing') {
        const result = questionTracker.getNextQuestion();
        notifyIfRepeat(result);
        question.value = { text: result.question };
        questionCount.value++;
        roundCount.value++;
      } else if (roomState.value.currentPrompt) {
        question.value = roomState.value.currentPrompt;
      }
    } else {
      fetchAnother();
    }
  }
});
</script>

<style scoped>
/* Bounce in animation (penalty reveal) */
.bounce-in-enter-active {
  animation: bounce-in 0.6s cubic-bezier(0.68, -0.55, 0.27, 1.55);
}

.bounce-in-leave-active {
  animation: bounce-out 0.3s ease-in;
}

@keyframes bounce-in {
  0% {
    transform: scale(0) translateY(-80px) rotate(-10deg);
    opacity: 0;
  }
  60% {
    transform: scale(1.15) translateY(0) rotate(5deg);
  }
  100% {
    transform: scale(1) translateY(0) rotate(0);
    opacity: 1;
  }
}

@keyframes bounce-out {
  0% {
    transform: scale(1) rotate(0);
    opacity: 1;
  }
  100% {
    transform: scale(0.7) rotate(-5deg);
    opacity: 0;
  }
}
</style>
