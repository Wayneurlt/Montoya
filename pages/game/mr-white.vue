<template>
  <div
    class="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 text-white p-3 sm:p-4 relative overflow-hidden"
  >
    <!-- Background Icons Pattern -->
    <BackgroundIcons />

    <!-- Main Game Container -->
    <div
      class="max-w-4xl mx-auto bg-white/10 backdrop-blur-md rounded-xl sm:rounded-2xl p-4 sm:p-5 md:p-6 lg:p-8 shadow-2xl relative z-10"
    >
      <!-- Home Button -->
      <div class="flex justify-between items-center mb-4 sm:mb-5 md:mb-6 gap-2">
        <NuxtLink to="/" class="bg-white/10 hover:bg-white/20 backdrop-blur-md px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl transition-all duration-300 flex items-center gap-1.5 sm:gap-2 border border-white/20 hover:scale-105 shadow-lg text-sm sm:text-base">
          <Icon icon="mdi:home" class="w-4 h-4 sm:w-5 sm:h-5" />
          <span class="font-medium">Home</span>
        </NuxtLink>
        
        <span class="text-xs sm:text-sm px-2 sm:px-3 py-1 sm:py-1.5 rounded-full bg-green-500/20 text-green-300 border border-green-400/30 shadow-md whitespace-nowrap">
          👨‍👩‍👧‍👦 Family Mode
        </span>
      </div>

      <!-- Game Header -->
      <div class="text-center mb-4 sm:mb-6 md:mb-8">
        <h1 class="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black mb-3 sm:mb-4 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-pink-500 to-cyan-400 drop-shadow-2xl">
          🕵️ Mr. White
        </h1>
        <p class="text-sm sm:text-base md:text-lg text-purple-200 px-2 mb-4">
          Find the imposter who doesn't know the secret word!
        </p>
      </div>

      <!-- Game Phase: Setup -->
      <div v-if="gamePhase === 'setup'" class="space-y-4 sm:space-y-5 md:space-y-6">
        <div class="bg-gradient-to-r from-blue-500/20 to-cyan-500/20 border-2 border-blue-400/50 rounded-lg sm:rounded-xl p-4 sm:p-5 md:p-6">
          <h3 class="font-bold text-lg sm:text-xl md:text-2xl mb-3 sm:mb-4">How to Play:</h3>
          <ul class="space-y-2 text-sm sm:text-base">
            <li class="flex gap-2">
              <span class="text-cyan-400">1.</span>
              <span>One player is secretly chosen as "Mr. White"</span>
            </li>
            <li class="flex gap-2">
              <span class="text-cyan-400">2.</span>
              <span>Everyone else sees the secret word</span>
            </li>
            <li class="flex gap-2">
              <span class="text-cyan-400">3.</span>
              <span>Take turns giving hints about the word</span>
            </li>
            <li class="flex gap-2">
              <span class="text-cyan-400">4.</span>
              <span>Mr. White must blend in without knowing the word!</span>
            </li>
            <li class="flex gap-2">
              <span class="text-cyan-400">5.</span>
              <span>Vote to expose Mr. White</span>
            </li>
          </ul>
        </div>

        <button
          @click="startGame"
          class="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 py-4 sm:py-5 rounded-xl sm:rounded-2xl text-lg sm:text-xl font-black shadow-2xl hover:shadow-purple-600/50 transition-all duration-300 transform hover:scale-105"
        >
          Start Game
        </button>
      </div>

      <!-- Game Phase: Reveal -->
      <div v-if="gamePhase === 'reveal'" class="space-y-4 sm:space-y-5 md:space-y-6">
        <div class="text-center mb-4 sm:mb-6">
          <p class="text-lg sm:text-xl md:text-2xl text-cyan-300 mb-4 sm:mb-6">
            Pass the device around. Each player clicks to see their role:
          </p>
        </div>

        <div v-if="!currentReveal" class="text-center">
          <button
            @click="revealNext"
            class="bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 px-8 sm:px-10 md:px-12 py-4 sm:py-5 rounded-xl sm:rounded-2xl text-lg sm:text-xl md:text-2xl font-black shadow-2xl transition-all duration-300 transform hover:scale-110"
          >
            {{ revealIndex === 0 ? 'Start Revealing' : 'Next Player' }}
          </button>
        </div>

        <!-- Show Role Card -->
        <div v-else class="space-y-4 sm:space-y-5 md:space-y-6">
          <div class="bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl sm:rounded-2xl p-6 sm:p-8 md:p-10 text-center shadow-2xl">
            <p class="text-2xl sm:text-3xl md:text-4xl font-black mb-4 sm:mb-6">
              {{ currentReveal.player.name }}
            </p>
            
            <div v-if="currentReveal.isMrWhite" class="space-y-3 sm:space-y-4">
              <p class="text-3xl sm:text-4xl md:text-5xl mb-2 sm:mb-3">🕵️</p>
              <p class="text-xl sm:text-2xl md:text-3xl font-bold text-red-300">You are Mr. White!</p>
              <p class="text-base sm:text-lg md:text-xl text-white/80">You don't know the secret word. Blend in!</p>
            </div>
            
            <div v-else class="space-y-3 sm:space-y-4">
              <p class="text-base sm:text-lg md:text-xl text-white/80 mb-2 sm:mb-3">Your secret word is:</p>
              <p class="text-2xl sm:text-3xl md:text-4xl font-black text-cyan-300">{{ secretWord }}</p>
              <p class="text-sm sm:text-base md:text-lg text-white/70 mt-3 sm:mt-4">Give subtle hints without being obvious!</p>
            </div>
          </div>

          <button
            @click="confirmReveal"
            class="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 py-3 sm:py-4 rounded-lg sm:rounded-xl font-bold text-base sm:text-lg transition-all flex items-center justify-center gap-2 shadow-lg"
          >
            <Icon icon="mdi:check-circle" class="w-5 h-5 sm:w-6 sm:h-6" />
            I've Seen My Role
          </button>
        </div>
      </div>

      <!-- Game Phase: Playing -->
      <div v-if="gamePhase === 'playing'" class="space-y-4 sm:space-y-5 md:space-y-6">
        <div class="bg-gradient-to-r from-purple-500/20 to-pink-500/20 border-2 border-purple-400/50 rounded-lg sm:rounded-xl p-4 sm:p-5 md:p-6 text-center">
          <p class="text-base sm:text-lg md:text-xl font-bold mb-2 sm:mb-3">
            Discussion Phase
          </p>
          <p class="text-sm sm:text-base text-white/80">
            Take turns giving one-word hints about the secret word. Mr. White: try to blend in!
          </p>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          <button
            @click="votePhase"
            class="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 py-3 sm:py-4 rounded-lg sm:rounded-xl font-bold text-base sm:text-lg transition-all flex items-center justify-center gap-2 shadow-lg"
          >
            <Icon icon="mdi:vote" class="w-5 h-5 sm:w-6 sm:h-6" />
            Start Voting
          </button>
          <button
            @click="revealMrWhite"
            class="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 py-3 sm:py-4 rounded-lg sm:rounded-xl font-bold text-base sm:text-lg transition-all flex items-center justify-center gap-2 shadow-lg"
          >
            <Icon icon="mdi:eye" class="w-5 h-5 sm:w-6 sm:h-6" />
            Reveal Mr. White
          </button>
        </div>
      </div>

      <!-- Voting Phase -->
      <div v-if="gamePhase === 'voting'" class="space-y-4 sm:space-y-5 md:space-y-6">
        <h3 class="text-xl sm:text-2xl font-bold text-center">Who is Mr. White?</h3>
        <div class="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
          <button
            v-for="player in players"
            :key="player.id"
            @click="selectMrWhite(player)"
            class="bg-white/10 hover:bg-white/20 border-2 border-white/20 hover:border-purple-400 rounded-lg sm:rounded-xl p-4 sm:p-5 transition-all text-center"
          >
            <p class="font-bold text-sm sm:text-base md:text-lg">{{ player.name }}</p>
          </button>
        </div>
      </div>

      <!-- Result Phase -->
      <div v-if="gamePhase === 'result'" class="space-y-4 sm:space-y-5 md:space-y-6 text-center">
        <div class="bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl sm:rounded-2xl p-6 sm:p-8 md:p-10 shadow-2xl">
          <p class="text-3xl sm:text-4xl md:text-5xl mb-3 sm:mb-4">{{ resultEmoji }}</p>
          <p class="text-xl sm:text-2xl md:text-3xl font-black mb-2 sm:mb-3">{{ resultMessage }}</p>
          <p class="text-base sm:text-lg md:text-xl text-cyan-300">Mr. White was: {{ mrWhitePlayer?.name }}</p>
          <p class="text-sm sm:text-base md:text-lg text-white/80 mt-3 sm:mt-4">The secret word was: <span class="font-bold">{{ secretWord }}</span></p>
        </div>

        <button
          @click="playAgain"
          class="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 py-3 sm:py-4 rounded-lg sm:rounded-xl font-bold text-base sm:text-lg transition-all flex items-center justify-center gap-2 shadow-lg"
        >
          <Icon icon="mdi:refresh" class="w-5 h-5 sm:w-6 sm:h-6" />
          Play Again
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { Icon } from "@iconify/vue";
import { useGameStore } from "~/stores/game";
import { useAnalytics } from "~/composables/useAnalytics";

const gameStore = useGameStore();
const { trackPageView } = useAnalytics();

const gamePhase = ref('setup'); // setup, reveal, playing, voting, result
const secretWord = ref("");
const mrWhitePlayer = ref(null);
const revealIndex = ref(0);
const currentReveal = ref(null);
const resultMessage = ref("");
const resultEmoji = ref("");

const players = computed(() => gameStore.players);

const secretWords = [
  "Pizza", "Beach", "Rainbow", "Music", "Book", "Movie", "Phone", "Camera",
  "Birthday", "Holiday", "School", "Garden", "Ocean", "Mountain", "Desert",
  "Forest", "River", "Bridge", "Castle", "Museum", "Library", "Park", "Zoo",
  "Circus", "Theater", "Concert", "Party", "Wedding", "Picnic", "Camping"
];

function startGame() {
  // Select random word
  secretWord.value = secretWords[Math.floor(Math.random() * secretWords.length)];
  
  // Select random Mr. White
  const randomIndex = Math.floor(Math.random() * players.value.length);
  mrWhitePlayer.value = players.value[randomIndex];
  
  gamePhase.value = 'reveal';
  revealIndex.value = 0;
  currentReveal.value = null;
}

function revealNext() {
  if (revealIndex.value < players.value.length) {
    const player = players.value[revealIndex.value];
    currentReveal.value = {
      player,
      isMrWhite: player.id === mrWhitePlayer.value.id
    };
  }
}

function confirmReveal() {
  currentReveal.value = null;
  revealIndex.value++;
  
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
  } else {
    resultMessage.value = "Wrong! Mr. White escaped!";
    resultEmoji.value = "😱";
  }
  gamePhase.value = 'result';
}

function revealMrWhite() {
  resultMessage.value = "Mr. White Revealed!";
  resultEmoji.value = "🕵️";
  gamePhase.value = 'result';
}

function playAgain() {
  gamePhase.value = 'setup';
  secretWord.value = "";
  mrWhitePlayer.value = null;
  revealIndex.value = 0;
  currentReveal.value = null;
}

onMounted(() => {
  trackPageView('mr-white');
  
  gameStore.loadFromLocalStorage();
  
  if (players.value.length < 3) {
    alert('Mr. White requires at least 3 players!');
    navigateTo('/setup?game=mr-white');
  }
});
</script>

<style scoped>
/* Add any additional styles here */
</style>

