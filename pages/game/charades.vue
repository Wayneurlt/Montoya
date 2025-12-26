<template>
  <div
    class="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 text-white p-3 sm:p-4 relative overflow-hidden"
  >
    <!-- Background Icons Pattern -->
    <BackgroundIcons />

    <!-- Main Game Container -->
    <div
      class="max-w-3xl mx-auto bg-white/10 backdrop-blur-md rounded-xl sm:rounded-2xl p-4 sm:p-5 md:p-6 lg:p-8 shadow-2xl relative z-10"
    >
      <!-- Home Button & Info -->
      <div class="flex justify-between items-center mb-4 sm:mb-5 md:mb-6 gap-2">
        <NuxtLink to="/" class="bg-white/10 hover:bg-white/20 backdrop-blur-md px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl transition-all duration-300 flex items-center gap-1.5 sm:gap-2 border border-white/20 hover:scale-105 shadow-lg text-sm sm:text-base">
          <Icon icon="mdi:home" class="w-4 h-4 sm:w-5 sm:h-5" />
          <span class="font-medium">Home</span>
        </NuxtLink>
        
        <div class="flex items-center gap-1.5 sm:gap-2">
          <span class="text-xs sm:text-sm px-2 sm:px-3 py-1 sm:py-1.5 rounded-full bg-green-500/20 text-green-300 border border-green-400/30 shadow-md whitespace-nowrap">
            👨‍👩‍👧‍👦 Family
          </span>
          <span class="text-xs sm:text-sm px-2 sm:px-3 py-1 sm:py-1.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-400/30 shadow-md whitespace-nowrap">
            Round {{ roundCount }}
          </span>
        </div>
      </div>

      <!-- Game Header -->
      <div class="text-center mb-4 sm:mb-5 md:mb-6">
        <h1 class="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black mb-3 sm:mb-4 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-pink-500 to-cyan-400 drop-shadow-2xl">
          🎭 Charades
        </h1>
        <p class="text-sm sm:text-base md:text-lg text-purple-200 px-2">
          Act it out without speaking! Your team has to guess what you're acting.
        </p>
      </div>

      <!-- Current Player Turn -->
      <div class="bg-gradient-to-r from-purple-500/20 to-pink-500/20 border-2 border-purple-400/50 rounded-lg sm:rounded-xl p-3 sm:p-4 mb-4 sm:mb-5 md:mb-6">
        <div class="text-center">
          <p class="text-xs sm:text-sm text-white/70 mb-1">Current Actor</p>
          <p class="text-xl sm:text-2xl md:text-3xl font-bold">{{ currentPlayer?.name }}</p>
        </div>
      </div>

      <!-- Timer -->
      <div v-if="timerActive" class="mb-4 sm:mb-5 md:mb-6 bg-white/5 rounded-lg sm:rounded-xl p-3 sm:p-4">
        <div class="flex justify-between items-center mb-2">
          <div class="flex items-center gap-1.5 sm:gap-2">
            <Icon icon="mdi:timer" class="w-4 h-4 sm:w-5 sm:h-5 text-cyan-400" />
            <span class="font-medium text-sm sm:text-base">Time Remaining:</span>
          </div>
          <span
            class="font-bold text-xl sm:text-2xl"
            :class="timeLeft <= 10 ? 'text-red-400' : 'text-cyan-400'"
          >
            {{ timeLeft }}s
          </span>
        </div>
        <div class="w-full h-2 bg-white/20 rounded-full overflow-hidden">
          <div
            class="h-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all duration-1000 ease-linear"
            :style="{ width: timePercent + '%' }"
          ></div>
        </div>
      </div>

      <!-- Charade Card -->
      <div v-if="!currentPrompt" class="text-center py-8 sm:py-10 md:py-12">
        <button
          @click="drawPrompt"
          class="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 px-8 sm:px-10 md:px-12 py-4 sm:py-5 rounded-xl sm:rounded-2xl text-lg sm:text-xl md:text-2xl font-black shadow-2xl hover:shadow-purple-600/50 transition-all duration-300 transform hover:scale-110"
        >
          <Icon icon="mdi:cards" class="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 inline-block mr-2" />
          Draw Card
        </button>
      </div>

      <!-- Show Prompt (Hidden from others) -->
      <div v-else class="space-y-4 sm:space-y-5 md:space-y-6">
        <div class="bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl sm:rounded-2xl p-6 sm:p-8 md:p-10 text-center shadow-2xl">
          <p class="text-xs sm:text-sm text-white/80 mb-2 sm:mb-3">Category</p>
          <p class="text-base sm:text-lg md:text-xl font-bold text-cyan-300 mb-4 sm:mb-6">{{ currentCategory }}</p>
          <p class="text-2xl sm:text-3xl md:text-4xl font-black leading-tight">{{ currentPrompt }}</p>
        </div>

        <!-- Action Buttons -->
        <div class="grid grid-cols-2 gap-3 sm:gap-4">
          <button
            @click="correctGuess"
            class="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 py-3 sm:py-4 rounded-lg sm:rounded-xl font-bold text-base sm:text-lg transition-all flex items-center justify-center gap-2 shadow-lg"
          >
            <Icon icon="mdi:check-circle" class="w-5 h-5 sm:w-6 sm:h-6" />
            Correct!
          </button>
          <button
            @click="skipPrompt"
            class="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 py-3 sm:py-4 rounded-lg sm:rounded-xl font-bold text-base sm:text-lg transition-all flex items-center justify-center gap-2 shadow-lg"
          >
            <Icon icon="mdi:skip-next" class="w-5 h-5 sm:w-6 sm:h-6" />
            Skip
          </button>
        </div>
      </div>

      <!-- Score Board -->
      <div class="mt-6 sm:mt-8 bg-white/5 rounded-lg sm:rounded-xl p-4 sm:p-5 md:p-6">
        <h3 class="font-bold text-lg sm:text-xl mb-3 sm:mb-4 flex items-center gap-2">
          <Icon icon="mdi:trophy" class="w-5 h-5 sm:w-6 sm:h-6 text-yellow-400" />
          <span>Scoreboard</span>
        </h3>
        <div class="space-y-2 sm:space-y-3">
          <div
            v-for="player in players"
            :key="player.id"
            class="flex justify-between items-center p-2 sm:p-3 rounded-lg"
            :class="player.id === currentPlayer?.id ? 'bg-purple-500/20' : 'bg-white/5'"
          >
            <span class="font-medium text-sm sm:text-base">{{ player.name }}</span>
            <span class="font-bold text-lg sm:text-xl text-cyan-400">{{ scores[player.id] || 0 }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from "vue";
import { Icon } from "@iconify/vue";
import { useGameStore } from "~/stores/game";
import { useAnalytics } from "~/composables/useAnalytics";

const gameStore = useGameStore();
const { trackPageView } = useAnalytics();

const MAX_TIME = 60;
const timeLeft = ref(MAX_TIME);
const timerActive = ref(false);
const timerInterval = ref(null);
const currentPrompt = ref("");
const currentCategory = ref("");
const roundCount = ref(1);
const scores = ref({});

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

const usedPrompts = ref([]);

function drawPrompt() {
  const categoryNames = Object.keys(categories);
  const randomCategory = categoryNames[Math.floor(Math.random() * categoryNames.length)];
  const availablePrompts = categories[randomCategory].filter(p => !usedPrompts.value.includes(p));
  
  if (availablePrompts.length === 0) {
    usedPrompts.value = [];
  }
  
  const randomPrompt = availablePrompts[Math.floor(Math.random() * availablePrompts.length)];
  
  currentPrompt.value = randomPrompt;
  currentCategory.value = randomCategory;
  usedPrompts.value.push(randomPrompt);
  
  startTimer();
}

function startTimer() {
  timerActive.value = true;
  timeLeft.value = MAX_TIME;
  
  timerInterval.value = setInterval(() => {
    timeLeft.value--;
    
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
  stopTimer();
  
  // Award point
  if (!scores.value[currentPlayer.value.id]) {
    scores.value[currentPlayer.value.id] = 0;
  }
  scores.value[currentPlayer.value.id]++;
  
  nextTurn();
}

function skipPrompt() {
  stopTimer();
  nextTurn();
}

function nextTurn() {
  currentPrompt.value = "";
  currentCategory.value = "";
  gameStore.nextPlayer();
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
  }
});

onBeforeUnmount(() => {
  stopTimer();
});
</script>

<style scoped>
/* Add any additional styles here */
</style>

