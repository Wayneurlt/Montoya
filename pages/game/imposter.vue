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
      <!-- Home Button -->
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
            Round {{ gameStore.currentRound + 1 }}
          </span>
        </div>
      </div>

      <!-- Game Title -->
      <div ref="titleBlockRef" class="text-center mb-8">
        <h1 class="font-display text-4xl sm:text-5xl md:text-6xl font-bold uppercase mb-4 text-paper flex items-center justify-center gap-3">
          <Icon icon="mdi:drama-masks" class="w-9 h-9 sm:w-11 sm:h-11 text-hot" />
          Imposter
        </h1>
        <p class="text-paper/60 text-sm font-medium px-2">Find the person with the different task!</p>
      </div>

      <!-- Game Phase: Setup -->
      <div v-if="gamePhase === 'setup'" class="space-y-4 sm:space-y-5 md:space-y-6">
        <div class="card-poster p-4 sm:p-5 md:p-6">
          <h3 class="font-display uppercase tracking-wide font-bold text-lg sm:text-xl mb-3 sm:mb-4">How to Play</h3>
          <ul class="space-y-2 text-sm sm:text-base">
            <li class="flex gap-2">
              <span class="text-hot font-display font-bold">1.</span>
              <span>Everyone gets a task, but one person gets a similar task</span>
            </li>
            <li class="flex gap-2">
              <span class="text-hot font-display font-bold">2.</span>
              <span>Tap your card to see your task (others won't see it)</span>
            </li>
            <li class="flex gap-2">
              <span class="text-hot font-display font-bold">3.</span>
              <span>Crew members describe their tasks, Imposter must fake it</span>
            </li>
            <li class="flex gap-2">
              <span class="text-hot font-display font-bold">4.</span>
              <span>Discuss and vote on who you think the Imposter is</span>
            </li>
            <li class="flex gap-2">
              <span class="text-hot font-display font-bold">5.</span>
              <span>Imposter wins if they blend in successfully!</span>
            </li>
          </ul>
        </div>

        <button
          @click="handleStartGame($event)"
          class="w-full bg-hot text-paper shadow-hard hover:brightness-110 py-4 sm:py-5 rounded-lg font-display font-bold uppercase tracking-wide text-lg sm:text-xl transition-[filter]"
        >
          Start Game
        </button>
      </div>

      <!-- Game Phase: Role Reveal -->
      <div v-if="gamePhase === 'reveal'" class="space-y-4 sm:space-y-5 md:space-y-6">
        <div class="text-center mb-2">
          <p class="text-base sm:text-lg text-paper/70">
            Pass the device around. Each player taps their card to see their task.
          </p>
        </div>

        <!-- Flip Stage: face-down player card <-> revealed task card -->
        <div ref="flipStageRef" class="flip-stage mb-2">
          <div ref="flipInnerRef" class="flip-inner">
            <!-- No player queued: advance to the next one -->
            <div v-if="!currentReveal" class="text-center py-8 sm:py-10">
              <button
                @click="handleRevealNext($event)"
                class="bg-hot text-paper shadow-hard hover:brightness-110 px-8 sm:px-10 md:px-12 py-4 sm:py-5 rounded-lg font-display font-bold uppercase tracking-wide text-lg sm:text-xl transition-[filter]"
              >
                {{ revealIndex === 0 ? 'Start Revealing' : 'Next Player' }}
              </button>
            </div>

            <!-- Face-down: shows whose turn it is -->
            <div v-else-if="!wordRevealed" class="max-w-[220px] mx-auto">
              <button
                ref="revealCardButtonRef"
                @click="handleRevealWord($event)"
                class="playing-card is-hot shadow-hard hover:brightness-110 w-full"
              >
                <div class="playing-card-pattern"></div>
                <div class="card-index card-index-tl"><Icon icon="mdi:account" class="w-3.5 h-3.5" />P</div>
                <div class="card-index card-index-br"><Icon icon="mdi:account" class="w-3.5 h-3.5" />P</div>
                <div class="playing-card-medallion">
                  <span><Icon icon="mdi:account" class="w-7 h-7" /></span>
                </div>
                <span class="absolute bottom-4 inset-x-0 text-center font-display font-bold uppercase tracking-wide text-sm px-2 truncate">{{ currentReveal.player.name }}</span>
              </button>
              <p class="text-center text-paper/50 text-xs mt-3 font-display uppercase tracking-wide">Tap to reveal your task</p>
            </div>

            <!-- Revealed task -->
            <div v-else class="max-w-md mx-auto">
              <div class="card-face p-6 sm:p-8 md:p-10 min-h-[300px] flex items-center justify-center" :class="{ 'is-volt': !currentReveal.isImposter }">
                <div class="card-index card-index-tl" :class="currentReveal.isImposter ? 'text-hot' : 'text-volt'">
                  <Icon :icon="currentReveal.isImposter ? 'mdi:drama-masks' : 'mdi:account-check'" class="w-3.5 h-3.5" />
                  {{ currentReveal.isImposter ? 'I' : 'C' }}
                </div>
                <div class="card-index card-index-br" :class="currentReveal.isImposter ? 'text-hot' : 'text-volt'">
                  <Icon :icon="currentReveal.isImposter ? 'mdi:drama-masks' : 'mdi:account-check'" class="w-3.5 h-3.5" />
                  {{ currentReveal.isImposter ? 'I' : 'C' }}
                </div>

                <div class="text-center w-full">
                  <div v-if="currentReveal.isImposter" class="space-y-3 sm:space-y-4">
                    <div class="mb-3 flex justify-center">
                      <div class="badge-stamp px-5 py-2.5 text-base bg-hot text-paper">
                        <Icon icon="mdi:drama-masks" class="w-5 h-5" />
                        Imposter
                      </div>
                    </div>
                    <p class="text-sm sm:text-base text-paper/70">Your similar task is:</p>
                    <div class="bg-white/5 border border-hot/30 rounded-md p-3 sm:p-4">
                      <p class="font-display text-lg sm:text-xl md:text-2xl font-bold text-paper">{{ getPlayerWord(currentReveal.player.id) }}</p>
                    </div>
                    <p class="text-sm sm:text-base text-paper/70 mt-2">Pretend to do tasks. Don't get caught!</p>
                    <div class="bg-hot/10 border border-hot/30 rounded-md p-3">
                      <p class="text-xs sm:text-sm font-display uppercase tracking-wide font-bold text-hot">Goal: Blend in and avoid detection</p>
                    </div>
                  </div>

                  <div v-else class="space-y-3 sm:space-y-4">
                    <div class="mb-3 flex justify-center">
                      <div class="badge-stamp px-5 py-2.5 text-base bg-volt text-ink">
                        <Icon icon="mdi:account-check" class="w-5 h-5" />
                        Crew Member
                      </div>
                    </div>
                    <p class="text-sm sm:text-base text-paper/70">Your task is:</p>
                    <div class="bg-white/5 border border-volt/30 rounded-md p-3 sm:p-4">
                      <p class="font-display text-lg sm:text-xl md:text-2xl font-bold text-paper">{{ getPlayerWord(currentReveal.player.id) }}</p>
                    </div>
                    <p class="text-xs sm:text-sm text-paper/60 mt-1">Describe this task to others. Find the imposter!</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <StickyActionBar v-if="currentReveal && wordRevealed">
          <button
            @click="handleConfirmReveal($event)"
            class="w-full bg-volt text-ink shadow-hard hover:brightness-110 py-3 sm:py-4 rounded-lg font-display font-bold uppercase tracking-wide text-base sm:text-lg transition-[filter] flex items-center justify-center gap-2"
          >
            <Icon icon="mdi:check-circle" class="w-5 h-5 sm:w-6 sm:h-6" />
            I've Seen My Task
          </button>
        </StickyActionBar>
      </div>

      <!-- Game Phase: Playing/Discussion -->
      <div v-if="gamePhase === 'playing'" class="space-y-4 sm:space-y-5 md:space-y-6">
        <div class="card-poster p-4 sm:p-5 md:p-6">
          <h3 class="font-display uppercase tracking-wide font-bold text-lg sm:text-xl mb-3 sm:mb-4 text-center">Discussion Phase</h3>
          <div class="space-y-3 text-sm sm:text-base">
            <p class="flex items-start gap-2"><Icon icon="mdi:account-voice" class="w-5 h-5 text-volt flex-shrink-0 mt-0.5" /><span><strong class="font-display uppercase tracking-wide">Crew Members:</strong> Describe your tasks in detail</span></p>
            <p class="flex items-start gap-2"><Icon icon="mdi:drama-masks" class="w-5 h-5 text-hot flex-shrink-0 mt-0.5" /><span><strong class="font-display uppercase tracking-wide">Imposter:</strong> Try to blend in without giving yourself away</span></p>
            <p class="flex items-start gap-2"><Icon icon="mdi:magnify" class="w-5 h-5 text-paper/70 flex-shrink-0 mt-0.5" /><span><strong class="font-display uppercase tracking-wide">Everyone:</strong> Listen carefully and watch for suspicious behavior</span></p>
          </div>
        </div>

        <!-- Timer -->
        <div v-if="timerActive" ref="timerBlockRef" class="card-poster p-4">
          <div class="flex justify-between items-center mb-2">
            <div class="flex items-center gap-2">
              <Icon icon="mdi:timer" class="w-5 h-5 text-hot" />
              <span class="font-display uppercase tracking-wide text-sm">Discussion Time</span>
            </div>
            <span ref="timerNumberRef" class="font-bold font-display text-lg tabular-nums text-volt">
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

        <StickyActionBar>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 w-full">
            <button
              v-if="!timerActive"
              @click="handleStartTimer($event)"
              class="bg-card hover:bg-white/5 border border-white/10 py-3 sm:py-4 rounded-lg font-display font-bold uppercase tracking-wide text-base sm:text-lg transition-colors flex items-center justify-center gap-2"
            >
              <Icon icon="mdi:timer" class="w-5 h-5 sm:w-6 sm:h-6" />
              Start Timer (60s)
            </button>
            <button
              @click="handleStartVoting($event)"
              class="bg-hot text-paper shadow-hard hover:brightness-110 py-3 sm:py-4 rounded-lg font-display font-bold uppercase tracking-wide text-base sm:text-lg transition-[filter] flex items-center justify-center gap-2"
            >
              <Icon icon="mdi:vote" class="w-5 h-5 sm:w-6 sm:h-6" />
              Start Voting
            </button>
          </div>
        </StickyActionBar>
      </div>

      <!-- Voting Phase -->
      <div v-if="gamePhase === 'voting'" class="space-y-4 sm:space-y-5 md:space-y-6">
        <h3 class="font-display uppercase tracking-wide text-xl sm:text-2xl md:text-3xl font-bold text-center">Who is the Imposter?</h3>
        <p class="text-center text-sm sm:text-base text-paper/60">Vote for the player you think is the imposter</p>

        <div class="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
          <button
            v-for="player in players"
            :key="player.id"
            @click="handleVoteForPlayer(player, $event)"
            :disabled="selectedPlayerId !== null"
            class="rounded-lg p-4 sm:p-5 transition-colors text-center border disabled:cursor-not-allowed"
            :class="selectedPlayerId === player.id
              ? 'bg-hot/15 border-hot'
              : 'bg-card border-white/10 hover:border-hot/50 disabled:opacity-50'"
          >
            <p class="font-display uppercase tracking-wide font-bold text-sm sm:text-base md:text-lg">{{ player.name }}</p>
          </button>
        </div>
      </div>

      <!-- Result Phase -->
      <div v-if="gamePhase === 'result'" class="space-y-4 sm:space-y-5 md:space-y-6 text-center">
        <div ref="resultPanelRef" class="card-face p-6 sm:p-8 md:p-10" :class="{ 'is-volt': resultCorrect }">
          <Icon :icon="resultCorrect ? 'mdi:party-popper' : 'mdi:emoticon-dead'" class="w-14 h-14 sm:w-16 sm:h-16 mx-auto mb-4 sm:mb-6" :class="resultCorrect ? 'text-volt' : 'text-hot'" />
          <p class="font-display uppercase tracking-wide text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4">{{ resultMessage }}</p>
          <p class="text-base sm:text-lg md:text-xl text-paper/60 mb-2">The Imposter was:</p>
          <p class="font-display text-2xl sm:text-3xl md:text-4xl font-bold text-hot">{{ imposterPlayer?.name }}</p>
        </div>

        <StickyActionBar>
          <button
            @click="handlePlayAgain($event)"
            class="w-full bg-volt text-ink shadow-hard hover:brightness-110 py-3 sm:py-4 rounded-lg font-display font-bold uppercase tracking-wide text-base sm:text-lg transition-[filter] flex items-center justify-center gap-2"
          >
            <Icon icon="mdi:refresh" class="w-5 h-5 sm:w-6 sm:h-6" />
            Play Again
          </button>
        </StickyActionBar>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, nextTick } from "vue";
import { Icon } from "@iconify/vue";
import { push } from "notivue";
import { useGameStore } from "~/stores/game";
import { useAnalytics } from "~/composables/useAnalytics";
import { staggerReveal, flipTransition, punchScale, tickPulse, shake, celebrateBurst } from "~/composables/useGameAnimations";
import { navigateTo } from "#app";

const gameStore = useGameStore();
const { trackPageView } = useAnalytics();

const gamePhase = ref('setup'); // setup, reveal, playing, voting, result
const imposterPlayer = ref(null);
const revealIndex = ref(0);
const currentReveal = ref(null);
const resultMessage = ref("");
const resultEmoji = ref("");
const resultCorrect = ref(false);
const playerTasks = ref({});
const timerActive = ref(false);
const timeLeft = ref(60);
const timerInterval = ref(null);
const playerWords = ref({});
const wordRevealed = ref(false);
const selectedPlayerId = ref(null);

// Animation refs
const headerRowRef = ref(null);
const titleBlockRef = ref(null);
const flipStageRef = ref(null);
const flipInnerRef = ref(null);
const revealCardButtonRef = ref(null);
const timerBlockRef = ref(null);
const timerNumberRef = ref(null);
const resultPanelRef = ref(null);

const players = computed(() => gameStore.players);
const timePercent = computed(() => (timeLeft.value / 60) * 100);

// Task pairs with similar characteristics
const taskPairs = [
  { task: "Download data from the computer", similar: "Upload files to the server" },
  { task: "Empty the trash into space", similar: "Dispose of waste materials" },
  { task: "Water the plants in the garden", similar: "Feed the animals in the farm" },
  { task: "Fix the wires in electrical", similar: "Repair the circuits in engineering" },
  { task: "Clean the air filters", similar: "Replace the oxygen tanks" },
  { task: "Submit a scan at medbay", similar: "Complete a health checkup" },
  { task: "Align the telescope", similar: "Calibrate the radar system" },
  { task: "Chart the course", similar: "Plot the navigation route" },
  { task: "Inspect the samples", similar: "Analyze the test results" },
  { task: "Prime the shields", similar: "Activate the defense systems" },
  { task: "Fuel the engines", similar: "Charge the power cells" },
  { task: "Calibrate the distributor", similar: "Adjust the power grid" },
  { task: "Unlock the manifolds", similar: "Open the access panels" },
  { task: "Stabilize the steering", similar: "Balance the control systems" },
  { task: "Divert power to weapons", similar: "Redirect energy to defenses" }
];

function getPlayerWord(playerId) {
  return playerWords.value[playerId] || '';
}

// Tracks which task pairs have already been used this session so the same
// pair doesn't turn up again until every pair has been seen once.
const usedTaskPairIndices = ref(new Set());

function pickTaskPair() {
  const availableIndices = taskPairs
    .map((_, index) => index)
    .filter((index) => !usedTaskPairIndices.value.has(index));

  let isRepeat = false;
  let indices = availableIndices;
  if (indices.length === 0) {
    isRepeat = true;
    usedTaskPairIndices.value = new Set();
    indices = taskPairs.map((_, index) => index);
  }

  const chosenIndex = indices[Math.floor(Math.random() * indices.length)];
  usedTaskPairIndices.value.add(chosenIndex);

  if (isRepeat) {
    push.info({ title: 'Fresh round!', message: "You've seen every task pair — shuffling for a new round.", duration: 4000 });
  }

  return taskPairs[chosenIndex];
}

function startGame() {
  // Select random task pair
  const randomPair = pickTaskPair();

  // Select random imposter
  const randomIndex = Math.floor(Math.random() * players.value.length);
  imposterPlayer.value = players.value[randomIndex];

  // Assign words to all players
  playerWords.value = {};
  players.value.forEach(player => {
    if (player.id === imposterPlayer.value.id) {
      // Imposter gets the similar task
      playerWords.value[player.id] = randomPair.similar;
    } else {
      // Everyone else gets the secret task
      playerWords.value[player.id] = randomPair.task;
    }
  });

  gamePhase.value = 'reveal';
  revealIndex.value = 0;
  currentReveal.value = null;
  wordRevealed.value = false;
}

function revealNext() {
  if (revealIndex.value < players.value.length) {
    const player = players.value[revealIndex.value];
    const isImposter = player.id === imposterPlayer.value.id;

    currentReveal.value = {
      player,
      isImposter,
      task: !isImposter ? playerTasks.value[player.id] : null
    };
    wordRevealed.value = false; // Reset word reveal for new player
  }
}

function confirmReveal() {
  if (!wordRevealed.value) {
    // If word not revealed yet, reveal it first
    wordRevealed.value = true;
    return;
  }

  // Word already revealed, move to next player
  currentReveal.value = null;
  revealIndex.value++;
  wordRevealed.value = false;

  if (revealIndex.value >= players.value.length) {
    gamePhase.value = 'playing';
  }
}

function startTimer() {
  timerActive.value = true;
  timeLeft.value = 60;

  timerInterval.value = setInterval(() => {
    timeLeft.value--;
    tickPulse(timerNumberRef.value, { scale: timeLeft.value <= 10 ? 1.4 : 1.15 });
    if (timeLeft.value === 10) {
      shake(timerBlockRef.value);
    }

    if (timeLeft.value <= 0) {
      stopTimer();
    }
  }, 1000);
}

function stopTimer() {
  clearInterval(timerInterval.value);
  timerActive.value = false;
}

function startVoting() {
  stopTimer();
  selectedPlayerId.value = null;
  gamePhase.value = 'voting';
}

function voteForPlayer(player) {
  if (player.id === imposterPlayer.value.id) {
    resultMessage.value = "Correct! You found the Imposter!";
    resultEmoji.value = "🎉";
    resultCorrect.value = true;
  } else {
    resultMessage.value = "Wrong! The Imposter escaped!";
    resultEmoji.value = "😱";
    resultCorrect.value = false;
  }
  gamePhase.value = 'result';
}

function playAgain() {
  gamePhase.value = 'setup';
  imposterPlayer.value = null;
  revealIndex.value = 0;
  currentReveal.value = null;
  playerTasks.value = {};
  playerWords.value = {};
  wordRevealed.value = false;
  selectedPlayerId.value = null;
  gameStore.nextTurn();
  stopTimer();
}

// --- Handlers: wrap game-logic functions with the shared GSAP feedback,
// mirroring truth-or-dare.vue's pattern of a thin handler around the
// underlying action rather than baking animation into the logic itself.

function handleStartGame(evt) {
  punchScale(evt?.currentTarget);
  startGame();
}

function handleRevealNext(evt) {
  punchScale(evt?.currentTarget);
  flipTransition(flipInnerRef.value, () => {
    revealNext();
  });
}

function handleRevealWord(evt) {
  punchScale(evt?.currentTarget);
  flipTransition(flipInnerRef.value, () => {
    wordRevealed.value = true;
  });
}

function handleConfirmReveal(evt) {
  punchScale(evt?.currentTarget);
  flipTransition(flipInnerRef.value, () => {
    confirmReveal();
  });
}

function handleStartTimer(evt) {
  punchScale(evt?.currentTarget);
  startTimer();
}

function handleStartVoting(evt) {
  punchScale(evt?.currentTarget);
  startVoting();
}

function handleVoteForPlayer(player, evt) {
  if (selectedPlayerId.value !== null) return;
  punchScale(evt?.currentTarget);
  // Show the selected state briefly before advancing to results, so the
  // "voted for" highlight is actually perceivable (voteForPlayer() below
  // switches gamePhase synchronously, which would otherwise skip the paint).
  selectedPlayerId.value = player.id;
  setTimeout(() => {
    voteForPlayer(player);
    nextTick(() => {
      if (resultCorrect.value) {
        celebrateBurst(resultPanelRef.value);
      }
    });
  }, 450);
}

function handlePlayAgain(evt) {
  punchScale(evt?.currentTarget);
  playAgain();
}

onMounted(() => {
  trackPageView('imposter');

  gameStore.loadFromLocalStorage();

  if (players.value.length < 3) {
    alert('Imposter requires at least 3 players!');
    navigateTo('/setup?game=imposter');
    return;
  }

  nextTick(() => {
    staggerReveal([headerRowRef.value, titleBlockRef.value]);
  });
});

onBeforeUnmount(() => {
  stopTimer();
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
