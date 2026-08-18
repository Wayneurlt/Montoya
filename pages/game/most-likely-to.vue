<template>
  <div class="min-h-screen bg-nightlife text-paper p-3 sm:p-4 relative overflow-x-hidden overflow-y-auto safe-bottom">
    <!-- Background Icons Pattern -->
    <BackgroundIcons />

    <div class="max-w-4xl mx-auto relative z-10 pt-4 sm:pt-6 md:pt-8">
      <!-- Header with Home Button -->
      <div ref="headerRowRef" class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-0 mb-6 sm:mb-8">
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
            <Icon icon="mdi:counter" class="w-4 h-4 sm:w-5 sm:h-5" />
            <span>Round {{ roundCount }}</span>
          </span>
        </div>
      </div>

      <!-- Game Title Card -->
      <div ref="titleBlockRef" class="text-center mb-8">
        <h1 class="font-display text-4xl sm:text-5xl md:text-6xl font-bold uppercase mb-4 text-paper">
          Most <span class="text-hot">Likely</span> To
        </h1>
        <p class="text-paper/60 text-sm font-medium">Point at someone - majority rules!</p>
      </div>

      <!-- Main Question Card -->
      <div ref="questionCardRef" class="mb-6">
        <div class="card-face p-8 md:p-10 min-h-[280px] flex items-center justify-center">
          <div class="card-index card-index-tl text-hot"><Icon icon="mdi:account-question" class="w-3.5 h-3.5" />M</div>
          <div class="card-index card-index-br text-hot"><Icon icon="mdi:account-question" class="w-3.5 h-3.5" />M</div>

          <div class="text-center relative z-10 w-full">
            <div class="mb-6 flex justify-center">
              <div class="badge-stamp px-6 py-3 text-lg bg-hot text-paper">
                <Icon icon="mdi:account-question" class="w-6 h-6" />
                Most Likely To
              </div>
            </div>

            <p ref="questionTextRef" class="font-display text-xl md:text-3xl font-bold leading-relaxed px-2 text-paper">
              {{ question?.text || 'Get ready to point fingers...' }}
            </p>
          </div>
        </div>
      </div>

      <!-- Multiplayer Voting (if in multiplayer mode) -->
      <div v-if="isMultiplayer && roomState && roomState.gamePhase === 'playing'" class="mb-6">
        <div class="card-poster p-6">
          <h3 class="font-display uppercase tracking-wide text-lg font-bold mb-4 text-center">Who is most likely to...</h3>
          <div class="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <button
              v-for="player in availablePlayers"
              :key="player.socketId"
              @click="handleVoteForPlayerClick(player.socketId, $event)"
              :disabled="hasVoted"
              class="p-4 rounded-lg border-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              :class="selectedPlayer === player.socketId ? 'bg-hot/15 border-hot' : 'bg-card border-white/10 hover:border-hot/50'"
            >
              <div class="w-12 h-12 rounded-full bg-hot/15 text-hot flex items-center justify-center mx-auto mb-2 font-display font-bold text-xl">
                {{ player.nickname.charAt(0).toUpperCase() }}
              </div>
              <div class="text-sm font-display uppercase tracking-wide text-center">{{ player.nickname }}</div>
              <div v-if="player.isHost" class="text-[10px] text-volt text-center mt-1 font-display uppercase tracking-wide">Host</div>
            </button>
          </div>
          <div v-if="hasVoted" class="mt-4 text-center text-paper/60 text-sm font-medium flex items-center justify-center gap-2">
            <Icon icon="mdi:check-circle" class="w-4 h-4 text-volt" />
            <span>Vote submitted! Waiting for other players...</span>
          </div>
        </div>
      </div>

      <!-- Multiplayer Results -->
      <div v-if="isMultiplayer && roomState && roomState.gamePhase === 'results'" class="mb-6">
        <div class="card-poster p-6">
          <h3 class="font-display uppercase tracking-wide text-lg font-bold mb-4 text-center">Results</h3>
          <div class="space-y-3">
            <div
              v-for="(playerVotes, playerId) in voteDistribution"
              :key="playerId"
              class="rounded-lg p-4 border-2 transition-colors"
              :class="playerId === winnerId ? 'bg-volt/10 border-volt' : 'bg-white/5 border-white/10'"
            >
              <div class="flex items-center justify-between mb-2">
                <div class="flex items-center gap-3">
                  <div class="w-10 h-10 rounded-full bg-hot/15 text-hot flex items-center justify-center font-display font-bold">
                    {{ getPlayerName(playerId)?.charAt(0).toUpperCase() }}
                  </div>
                  <div>
                    <div class="font-display uppercase tracking-wide font-semibold">{{ getPlayerName(playerId) }}</div>
                    <div v-if="roomState && roomState.answerVisibility === 'public'" class="text-xs text-paper/50">
                      Voted by: {{ getVoterNames(playerId).join(', ') }}
                    </div>
                  </div>
                </div>
                <div class="text-2xl font-display font-black">{{ playerVotes.length }}</div>
              </div>
              <div class="h-2 bg-white/10 rounded-full overflow-hidden">
                <div
                  class="h-full bg-hot transition-all duration-500"
                  :style="{ width: `${(playerVotes.length / totalVotes) * 100}%` }"
                ></div>
              </div>
            </div>
          </div>
          <div v-if="winnerId" class="mt-6 text-center flex items-center justify-center gap-2">
            <Icon icon="mdi:trophy" class="w-6 h-6 text-volt" />
            <span class="text-xl font-display font-bold uppercase tracking-wide text-volt">Winner: {{ getPlayerName(winnerId) }}</span>
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

      <!-- Primary Action Buttons (Single-Device Mode): kept reachable without scrolling -->
      <StickyActionBar v-if="!isMultiplayer">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
          <button
            @click="handleFetchAnotherClick"
            class="bg-card hover:bg-white/5 border border-white/10 px-8 py-5 rounded-lg font-display font-bold uppercase tracking-wide text-lg flex items-center justify-center gap-3 transition-colors"
          >
            <Icon icon="mdi:refresh" class="w-6 h-6" />
            <span>Next Question</span>
          </button>

          <button
            @click="handleApplyPenaltyClick"
            class="bg-hot text-paper shadow-hard hover:brightness-110 px-8 py-5 rounded-lg font-display font-bold uppercase tracking-wide text-lg flex items-center justify-center gap-3 transition-[filter]"
          >
            <Icon icon="mdi:glass-cocktail" class="w-6 h-6" />
            <span>Drink Penalty</span>
          </button>
        </div>
      </StickyActionBar>

      <!-- Penalty Display -->
      <transition name="bounce-in">
        <div v-if="showPenalty" ref="penaltyBlockRef" class="mb-6">
          <div class="card-poster border-hot/40 p-6 text-center">
            <div class="flex items-center justify-center gap-3 mb-2">
              <Icon icon="mdi:alert-circle" class="w-8 h-8 text-hot" />
              <p class="font-display font-bold uppercase tracking-wide text-xl text-paper">{{ penaltyMessage }}</p>
              <Icon icon="mdi:alert-circle" class="w-8 h-8 text-hot" />
            </div>
            <p class="text-paper/60 text-sm mt-2">Time to pay up!</p>
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
          <div class="grid grid-cols-2 gap-4 px-4 pb-4">
            <div class="card-poster p-4 text-center">
              <Icon icon="mdi:star-circle" class="w-8 h-8 mx-auto mb-2 text-hot" />
              <p class="text-2xl font-display font-bold text-paper">{{ questionCount }}</p>
              <p class="text-paper/50 text-sm font-display uppercase tracking-wide">Questions Asked</p>
            </div>

            <div class="card-poster card-poster-volt p-4 text-center">
              <Icon icon="mdi:glass-cocktail" class="w-8 h-8 mx-auto mb-2 text-volt" />
              <p class="text-2xl font-display font-bold text-paper">{{ penaltyCount }}</p>
              <p class="text-paper/50 text-sm font-display uppercase tracking-wide">Penalties Given</p>
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
import { useMostLikelyToTracker } from '~/composables/useQuestionTracker';
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
const { roomState, votes, isHost, myPlayer, submitVote, showResults, nextRound, connect } = multiplayer;

const question = ref<{ text: string } | null>(null);

// Initialize question tracker
let questionTracker: any = null;
const showPenalty = ref(false);
const penaltyMessage = ref('');
const statsExpanded = ref(false);

// Game statistics
const roundCount = ref(0);
const questionCount = ref(0);
const penaltyCount = ref(0);

// Multiplayer state
const hasVoted = ref(false);
const selectedPlayer = ref<string | null>(null);

// Initialize analytics
const { trackPageView, updateActivity } = useAnalytics();

// Animation refs
const headerRowRef = ref(null);
const titleBlockRef = ref(null);
const questionCardRef = ref(null);
const questionTextRef = ref(null);
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

// Reveal beat: whenever the displayed question changes, settle the text in
// with a quick fade/rise instead of an instant swap — mirrors how
// truth-or-dare.vue reveals `questionTextRef` after a draw.
watch(question, (_val, oldVal) => {
  // Skip the very first population: questionCardRef (this element's parent) is
  // already fading in via staggerReveal() on mount, and animating both at once
  // compounds their opacity multiplicatively, leaving the card nearly invisible
  // for far longer than either animation's own duration.
  if (!oldVal) return;
  nextTick(() => {
    if (!questionTextRef.value) return;
    gsap.fromTo(questionTextRef.value, { y: 14, opacity: 0 }, { y: 0, opacity: 1, duration: 0.4, ease: 'power2.out' });
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

// Available players (excluding self)
const availablePlayers = computed(() => {
  if (!isMultiplayer.value || !myPlayer.value) return []
  return roomState.value.players.filter(p => p.socketId !== myPlayer.value?.socketId)
})

// Vote distribution
const voteDistribution = computed(() => {
  const distribution: Record<string, any[]> = {}
  votes.value.forEach(vote => {
    const targetPlayerId = vote.vote
    if (!distribution[targetPlayerId]) {
      distribution[targetPlayerId] = []
    }
    distribution[targetPlayerId].push(vote)
  })
  return distribution
})

// Total votes
const totalVotes = computed(() => {
  return votes.value.length
})

// Winner (player with most votes)
const winnerId = computed(() => {
  if (totalVotes.value === 0) return null
  let maxVotes = 0
  let winner: string | null = null
  Object.entries(voteDistribution.value).forEach(([playerId, playerVotes]) => {
    if (playerVotes.length > maxVotes) {
      maxVotes = playerVotes.length
      winner = playerId
    }
  })
  return winner
})

// Helper functions
const getPlayerName = (socketId: string) => {
  return roomState.value.players.find(p => p.socketId === socketId)?.nickname || 'Unknown'
}

const getVoterNames = (playerId: string) => {
  return voteDistribution.value[playerId]?.map(v => v.nickname).filter(Boolean) || []
}

const fetchAnother = () => {
  showPenalty.value = false;

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
  console.log(`Most Likely To - Used: ${stats.usedCount}/${stats.totalQuestions} (${stats.usagePercentage}%)`);

  question.value = { text: result.question };
  roundCount.value++;
  questionCount.value++;
};

// Multiplayer vote for player
const handleVoteForPlayer = (playerId: string) => {
  if (hasVoted.value || !isMultiplayer.value) return;

  selectedPlayer.value = playerId
  submitVote(playerId)
  hasVoted.value = true
  updateActivity()
}

// Handle next round (host only)
const handleNextRound = () => {
  if (!isHost.value || !isMultiplayer.value) return;

  const result = questionTracker?.getNextQuestion();
  if (result) {
    notifyIfRepeat(result);
    nextRound({ prompt: { text: result.question } });
    hasVoted.value = false;
    selectedPlayer.value = null;
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

const handleVoteForPlayerClick = (playerId: string, evt?: Event) => {
  punchScale((evt?.currentTarget as Element) ?? null);
  handleVoteForPlayer(playerId);
};

const handleNextRoundClick = (evt?: Event) => {
  punchScale((evt?.currentTarget as Element) ?? null);
  handleNextRound();
};

// Watch for game state updates in multiplayer
watch(() => roomState.value.gamePhase, (newPhase) => {
  if (newPhase === 'playing') {
    hasVoted.value = false;
    selectedPlayer.value = null;

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

const applyPenalty = () => {
  const penalties = [
    'Take 2 sips as penalty!',
    'Take a shot as penalty!',
    'Drink for 3 seconds straight!',
    'Take a large gulp as penalty!',
    'Finish your current drink!',
    'Down that drink!',
    'Take 3 big sips!',
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
    console.log('🔄 Loading Most Likely To questions from database...')
    const response = await $fetch('/api/questions/group-game?gameType=MOST_LIKELY_TO&limit=1000')
      .catch(error => {
        console.error('❌ API call failed:', error)
        throw new Error(`Failed to fetch questions: ${error.message || 'Unknown error'}`)
      })

    console.log('Most Likely To API response:', response)

    if (!response || !response.questions) {
      console.error('❌ Invalid API response structure:', response)
      throw new Error('Invalid API response structure')
    }

    const questions = response.questions || []

    if (!Array.isArray(questions)) {
      throw new Error('Questions is not an array')
    }

    if (questions.length === 0) {
      throw new Error('No questions returned from API')
    }

    console.log(`✅ Successfully received ${questions.length} questions from API`)

    // Create tracker with loaded questions
    questionTracker = useMostLikelyToTracker(questions.map(q => q.text || q))
    questionTracker.initializeTracker();

    console.log(`✅ Loaded ${questions.length} Most Likely To questions`)
  } catch (error) {
    console.error('❌ Error loading Most Likely To questions:', error)
    console.error('Error details:', error.message, error.stack)
    // Don't use fallback - throw error so user knows
    throw error
  }
}

onMounted(async () => {
  if (typeof window !== "undefined") {
    // Track page view
    trackPageView('most-likely-to');

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
    try {
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
    } catch (error) {
      console.error('Failed to load questions:', error)
      question.value = { text: 'Error loading questions. Please refresh the page or contact support.' }
    }
  }
});
</script>

<style scoped>
/* Bounce in animation (penalty reveal) */
.bounce-in-enter-active {
  animation: bounce-in 0.5s cubic-bezier(0.68, -0.55, 0.27, 1.55);
}

.bounce-in-leave-active {
  animation: bounce-out 0.3s ease-in;
}

@keyframes bounce-in {
  0% {
    transform: scale(0) translateY(-50px);
    opacity: 0;
  }
  50% {
    transform: scale(1.1) translateY(0);
  }
  100% {
    transform: scale(1) translateY(0);
    opacity: 1;
  }
}

@keyframes bounce-out {
  0% {
    transform: scale(1);
    opacity: 1;
  }
  100% {
    transform: scale(0.8);
    opacity: 0;
  }
}
</style>
