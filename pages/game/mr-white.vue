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

        <span class="text-xs sm:text-sm px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full border font-display uppercase tracking-wide bg-paper/10 text-paper border-paper/20 flex items-center gap-1.5 whitespace-nowrap w-fit">
          <Icon icon="mdi:account-group" class="w-3.5 h-3.5" />
          Family Mode
        </span>
      </div>

      <!-- Game Title -->
      <div ref="titleBlockRef" class="text-center mb-8">
        <h1 class="font-display text-4xl sm:text-5xl md:text-6xl font-bold uppercase mb-4 text-paper flex items-center justify-center gap-3">
          <Icon icon="mdi:incognito" class="w-9 h-9 sm:w-11 sm:h-11 text-hot" />
          Mr. White
        </h1>
        <p class="text-paper/60 text-sm font-medium px-2">Find the person with the different word!</p>
      </div>

      <!-- Game Phase: Setup -->
      <div v-if="gamePhase === 'setup'" class="space-y-4 sm:space-y-5 md:space-y-6">
        <div class="card-poster p-4 sm:p-5 md:p-6">
          <h3 class="font-display uppercase tracking-wide font-bold text-lg sm:text-xl mb-3 sm:mb-4">How to Play</h3>
          <ul class="space-y-2 text-sm sm:text-base">
            <li class="flex gap-2">
              <span class="text-hot font-display font-bold">1.</span>
              <span>Everyone gets a word, but one person gets a similar word</span>
            </li>
            <li class="flex gap-2">
              <span class="text-hot font-display font-bold">2.</span>
              <span>Tap your card to see your word (others won't see it)</span>
            </li>
            <li class="flex gap-2">
              <span class="text-hot font-display font-bold">3.</span>
              <span>Take turns giving hints about your word</span>
            </li>
            <li class="flex gap-2">
              <span class="text-hot font-display font-bold">4.</span>
              <span>Find the person with the different word!</span>
            </li>
            <li class="flex gap-2">
              <span class="text-hot font-display font-bold">5.</span>
              <span>Vote to expose Mr. White</span>
            </li>
          </ul>
        </div>

        <button
          @click="handleStartGame($event)"
          class="w-full bg-hot text-ink shadow-hard hover:brightness-110 py-4 sm:py-5 rounded-lg font-display font-bold uppercase tracking-wide text-lg sm:text-xl transition-[filter]"
        >
          Start Game
        </button>
      </div>

      <!-- Game Phase: Reveal -->
      <div v-if="gamePhase === 'reveal'" class="space-y-4 sm:space-y-5 md:space-y-6">
        <div class="text-center mb-2">
          <p class="text-base sm:text-lg text-paper/70">
            Pass the device around. Each player taps their card to see their word.
          </p>
        </div>

        <!-- Flip Stage: face-down player card <-> revealed word card -->
        <div ref="flipStageRef" class="flip-stage mb-2">
          <div ref="flipInnerRef" class="flip-inner">
            <!-- No player queued: advance to the next one -->
            <div v-if="!currentReveal" class="text-center py-8 sm:py-10">
              <button
                @click="handleRevealNext($event)"
                class="bg-hot text-ink shadow-hard hover:brightness-110 px-8 sm:px-10 md:px-12 py-4 sm:py-5 rounded-lg font-display font-bold uppercase tracking-wide text-lg sm:text-xl transition-[filter]"
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
              <p class="text-center text-paper/50 text-xs mt-3 font-display uppercase tracking-wide">Tap to reveal your word</p>
            </div>

            <!-- Revealed word -->
            <div v-else class="max-w-md mx-auto">
              <div class="card-face is-volt p-6 sm:p-8 md:p-10 min-h-[280px] flex items-center justify-center">
                <div class="card-index card-index-tl text-volt"><Icon icon="mdi:cards" class="w-3.5 h-3.5" />W</div>
                <div class="card-index card-index-br text-volt"><Icon icon="mdi:cards" class="w-3.5 h-3.5" />W</div>

                <div class="text-center w-full space-y-3 sm:space-y-4">
                  <p class="text-sm sm:text-base text-paper/70">Your word is:</p>
                  <p class="font-display text-2xl sm:text-3xl md:text-4xl font-bold text-paper">{{ getPlayerWord(currentReveal.player.id) }}</p>
                  <p class="text-xs sm:text-sm text-paper/60 mt-2">Give subtle hints without being obvious!</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <button
          v-if="currentReveal && wordRevealed"
          @click="handleConfirmReveal($event)"
          class="w-full bg-volt text-ink shadow-hard hover:brightness-110 py-3 sm:py-4 rounded-lg font-display font-bold uppercase tracking-wide text-base sm:text-lg transition-[filter] flex items-center justify-center gap-2"
        >
          <Icon icon="mdi:check-circle" class="w-5 h-5 sm:w-6 sm:h-6" />
          I've Seen My Word
        </button>
      </div>

      <!-- Game Phase: Playing -->
      <div v-if="gamePhase === 'playing'" class="space-y-4 sm:space-y-5 md:space-y-6">
        <div class="card-poster p-4 sm:p-5 md:p-6 text-center">
          <p class="font-display uppercase tracking-wide font-bold text-base sm:text-lg md:text-xl mb-2 sm:mb-3">
            Discussion Phase
          </p>
          <p class="text-sm sm:text-base text-paper/70">
            Take turns giving one-word hints about your word. The person with the different word must blend in!
          </p>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          <button
            @click="handleVotePhase($event)"
            class="bg-hot text-ink shadow-hard hover:brightness-110 py-3 sm:py-4 rounded-lg font-display font-bold uppercase tracking-wide text-base sm:text-lg transition-[filter] flex items-center justify-center gap-2"
          >
            <Icon icon="mdi:vote" class="w-5 h-5 sm:w-6 sm:h-6" />
            Start Voting
          </button>
          <button
            @click="handleRevealMrWhite($event)"
            class="bg-card hover:bg-white/5 border border-white/10 py-3 sm:py-4 rounded-lg font-display font-bold uppercase tracking-wide text-base sm:text-lg transition-colors flex items-center justify-center gap-2"
          >
            <Icon icon="mdi:eye" class="w-5 h-5 sm:w-6 sm:h-6" />
            Reveal Mr. White
          </button>
        </div>
      </div>

      <!-- Voting Phase -->
      <div v-if="gamePhase === 'voting'" class="space-y-4 sm:space-y-5 md:space-y-6">
        <h3 class="font-display uppercase tracking-wide text-xl sm:text-2xl font-bold text-center">Who is Mr. White?</h3>
        <div class="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
          <button
            v-for="player in players"
            :key="player.id"
            @click="handleSelectMrWhite(player, $event)"
            class="bg-card border border-white/10 hover:border-hot/50 rounded-lg p-4 sm:p-5 transition-colors text-center"
          >
            <p class="font-display uppercase tracking-wide font-bold text-sm sm:text-base md:text-lg">{{ player.name }}</p>
          </button>
        </div>
      </div>

      <!-- Result Phase -->
      <div v-if="gamePhase === 'result'" class="space-y-4 sm:space-y-5 md:space-y-6 text-center">
        <div ref="resultPanelRef" class="card-face p-6 sm:p-8 md:p-10" :class="{ 'is-volt': resultCorrect }">
          <Icon :icon="resultIcon" class="w-12 h-12 sm:w-14 sm:h-14 mx-auto mb-3 sm:mb-4" :class="resultCorrect ? 'text-volt' : 'text-hot'" />
          <p class="font-display uppercase tracking-wide text-xl sm:text-2xl md:text-3xl font-bold mb-2 sm:mb-3">{{ resultMessage }}</p>
          <p class="text-base sm:text-lg md:text-xl text-paper/60">Mr. White was: <span class="font-display font-bold text-hot">{{ mrWhitePlayer?.name }}</span></p>
          <p class="text-sm sm:text-base md:text-lg text-paper/70 mt-3 sm:mt-4">The secret word was: <span class="font-bold text-paper">{{ secretWord }}</span></p>
          <p class="text-sm sm:text-base md:text-lg text-paper/70 mt-2">Mr. White's word was: <span class="font-bold text-paper">{{ getPlayerWord(mrWhitePlayer?.id) }}</span></p>
        </div>

        <button
          @click="handlePlayAgain($event)"
          class="w-full bg-volt text-ink shadow-hard hover:brightness-110 py-3 sm:py-4 rounded-lg font-display font-bold uppercase tracking-wide text-base sm:text-lg transition-[filter] flex items-center justify-center gap-2"
        >
          <Icon icon="mdi:refresh" class="w-5 h-5 sm:w-6 sm:h-6" />
          Play Again
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick } from "vue";
import { Icon } from "@iconify/vue";
import { push } from "notivue";
import { useGameStore } from "~/stores/game";
import { useAnalytics } from "~/composables/useAnalytics";
import { staggerReveal, flipTransition, punchScale, celebrateBurst } from "~/composables/useGameAnimations";
import { navigateTo } from "#app";

const gameStore = useGameStore();
const { trackPageView } = useAnalytics();

const gamePhase = ref('setup'); // setup, reveal, playing, voting, result
const secretWord = ref("");
const mrWhitePlayer = ref(null);
const revealIndex = ref(0);
const currentReveal = ref(null);
const resultMessage = ref("");
const resultEmoji = ref("");
const resultCorrect = ref(false);
const playerWords = ref({});
const wordRevealed = ref(false);

// Animation refs
const headerRowRef = ref(null);
const titleBlockRef = ref(null);
const flipStageRef = ref(null);
const flipInnerRef = ref(null);
const revealCardButtonRef = ref(null);
const resultPanelRef = ref(null);

const players = computed(() => gameStore.players);
const resultIcon = computed(() => resultEmoji.value === '🕵️' ? 'mdi:incognito' : (resultCorrect.value ? 'mdi:party-popper' : 'mdi:emoticon-dead'));

// Word pairs with similar characteristics
const wordPairs = [
  { word: "Strawberry", similar: "Apple" },
  { word: "Cat", similar: "Dog" },
  { word: "Pizza", similar: "Burger" },
  { word: "Beach", similar: "Mountain" },
  { word: "Rainbow", similar: "Sunset" },
  { word: "Music", similar: "Dance" },
  { word: "Book", similar: "Movie" },
  { word: "Phone", similar: "Computer" },
  { word: "Camera", similar: "Painting" },
  { word: "Birthday", similar: "Wedding" },
  { word: "Holiday", similar: "Vacation" },
  { word: "School", similar: "University" },
  { word: "Garden", similar: "Forest" },
  { word: "Ocean", similar: "Lake" },
  { word: "Desert", similar: "Beach" },
  { word: "River", similar: "Stream" },
  { word: "Bridge", similar: "Tunnel" },
  { word: "Castle", similar: "Palace" },
  { word: "Museum", similar: "Library" },
  { word: "Park", similar: "Garden" },
  { word: "Zoo", similar: "Farm" },
  { word: "Circus", similar: "Theater" },
  { word: "Concert", similar: "Festival" },
  { word: "Party", similar: "Celebration" },
  { word: "Picnic", similar: "Barbecue" },
  { word: "Camping", similar: "Hiking" },
  { word: "Car", similar: "Bike" },
  { word: "Train", similar: "Bus" },
  { word: "Plane", similar: "Helicopter" },
  { word: "Boat", similar: "Ship" }
];

function getPlayerWord(playerId) {
  return playerWords.value[playerId] || '';
}

// Tracks which word pairs have already been used this session so the same
// pair doesn't turn up again until every pair has been seen once.
const usedWordPairIndices = ref(new Set());

function pickWordPair() {
  const availableIndices = wordPairs
    .map((_, index) => index)
    .filter((index) => !usedWordPairIndices.value.has(index));

  let isRepeat = false;
  let indices = availableIndices;
  if (indices.length === 0) {
    isRepeat = true;
    usedWordPairIndices.value = new Set();
    indices = wordPairs.map((_, index) => index);
  }

  const chosenIndex = indices[Math.floor(Math.random() * indices.length)];
  usedWordPairIndices.value.add(chosenIndex);

  if (isRepeat) {
    push.info({ title: 'Fresh round!', message: "You've seen every word pair — shuffling for a new round.", duration: 4000 });
  }

  return wordPairs[chosenIndex];
}

function startGame() {
  // Select random word pair
  const randomPair = pickWordPair();
  secretWord.value = randomPair.word;

  // Select random Mr. White
  const randomIndex = Math.floor(Math.random() * players.value.length);
  mrWhitePlayer.value = players.value[randomIndex];

  // Assign words to all players
  playerWords.value = {};
  players.value.forEach(player => {
    if (player.id === mrWhitePlayer.value.id) {
      // Mr. White gets the similar word
      playerWords.value[player.id] = randomPair.similar;
    } else {
      // Everyone else gets the secret word
      playerWords.value[player.id] = randomPair.word;
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
    currentReveal.value = {
      player,
      isMrWhite: player.id === mrWhitePlayer.value.id
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

function votePhase() {
  gamePhase.value = 'voting';
}

function selectMrWhite(player) {
  if (player.id === mrWhitePlayer.value.id) {
    resultMessage.value = "Correct! You found Mr. White!";
    resultEmoji.value = "🎉";
    resultCorrect.value = true;
  } else {
    resultMessage.value = "Wrong! Mr. White escaped!";
    resultEmoji.value = "😱";
    resultCorrect.value = false;
  }
  gamePhase.value = 'result';
}

function revealMrWhite() {
  resultMessage.value = "Mr. White Revealed!";
  resultEmoji.value = "🕵️";
  resultCorrect.value = false;
  gamePhase.value = 'result';
}

function playAgain() {
  gamePhase.value = 'setup';
  secretWord.value = "";
  mrWhitePlayer.value = null;
  revealIndex.value = 0;
  currentReveal.value = null;
  playerWords.value = {};
  wordRevealed.value = false;
  gameStore.nextTurn();
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

function handleVotePhase(evt) {
  punchScale(evt?.currentTarget);
  votePhase();
}

function handleRevealMrWhite(evt) {
  punchScale(evt?.currentTarget);
  revealMrWhite();
}

function handleSelectMrWhite(player, evt) {
  punchScale(evt?.currentTarget);
  selectMrWhite(player);
  nextTick(() => {
    if (resultCorrect.value) {
      celebrateBurst(resultPanelRef.value);
    }
  });
}

function handlePlayAgain(evt) {
  punchScale(evt?.currentTarget);
  playAgain();
}

onMounted(() => {
  trackPageView('mr-white');

  gameStore.loadFromLocalStorage();

  if (players.value.length < 3) {
    alert('Mr. White requires at least 3 players!');
    navigateTo('/setup?game=mr-white');
    return;
  }

  nextTick(() => {
    staggerReveal([headerRowRef.value, titleBlockRef.value]);
  });
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
