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
        <div class="flex gap-2">
          <NuxtLink to="/" class="bg-white/10 hover:bg-white/20 backdrop-blur-md px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl transition-all duration-300 flex items-center gap-1.5 sm:gap-2 border border-white/20 hover:scale-105 shadow-lg text-sm sm:text-base">
            <Icon icon="mdi:home" class="w-4 h-4 sm:w-5 sm:h-5" />
            <span class="font-medium">Home</span>
          </NuxtLink>
          <NuxtLink to="/setup?step=game-selection" class="bg-white/10 hover:bg-white/20 backdrop-blur-md px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl transition-all duration-300 flex items-center gap-1.5 sm:gap-2 border border-white/20 hover:scale-105 shadow-lg text-sm sm:text-base">
            <Icon icon="mdi:arrow-left" class="w-4 h-4 sm:w-5 sm:h-5" />
            <span class="font-medium">Back</span>
          </NuxtLink>
        </div>
        
        <div class="flex items-center gap-2">
          <span class="text-xs sm:text-sm px-2 sm:px-3 py-1 sm:py-1.5 rounded-full bg-green-500/20 text-green-300 border border-green-400/30 shadow-md whitespace-nowrap">
            👨‍👩‍👧‍👦 Family
          </span>
          <span class="text-xs sm:text-sm px-2 sm:px-3 py-1 sm:py-1.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-400/30 shadow-md whitespace-nowrap">
            Round {{ roundNumber }}
          </span>
        </div>
      </div>

      <!-- Game Header -->
      <div class="text-center mb-2 sm:mb-3 md:mb-4">
        <h1 class="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black mb-2 sm:mb-3 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-pink-500 to-cyan-400 drop-shadow-2xl">
          🎭 Imposter
        </h1>
        <p class="text-xs sm:text-sm md:text-base text-purple-200 px-2 mb-2 sm:mb-3 md:mb-4">
          Find the person with the different task!
        </p>
      </div>

      <!-- Game Phase: Setup -->
      <div v-if="gamePhase === 'setup'" class="space-y-4 sm:space-y-5 md:space-y-6">
        <div class="bg-gradient-to-r from-blue-500/20 to-cyan-500/20 border-2 border-blue-400/50 rounded-lg sm:rounded-xl p-4 sm:p-5 md:p-6">
          <h3 class="font-bold text-lg sm:text-xl md:text-2xl mb-3 sm:mb-4">How to Play:</h3>
          <ul class="space-y-2 text-sm sm:text-base">
            <li class="flex gap-2">
              <span class="text-cyan-400">1.</span>
              <span>Everyone gets a task, but one person gets a similar task</span>
            </li>
            <li class="flex gap-2">
              <span class="text-cyan-400">2.</span>
              <span>Tap your card to see your task (others won't see it)</span>
            </li>
            <li class="flex gap-2">
              <span class="text-cyan-400">3.</span>
              <span>Crew members describe their tasks, Imposter must fake it</span>
            </li>
            <li class="flex gap-2">
              <span class="text-cyan-400">4.</span>
              <span>Discuss and vote on who you think the Imposter is</span>
            </li>
            <li class="flex gap-2">
              <span class="text-cyan-400">5.</span>
              <span>Imposter wins if they blend in successfully!</span>
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

      <!-- Game Phase: Role Reveal -->
      <div v-if="gamePhase === 'reveal'" class="space-y-4 sm:space-y-5 md:space-y-6">
        <div class="text-center mb-4 sm:mb-6">
          <p class="text-lg sm:text-xl md:text-2xl text-cyan-300 mb-4 sm:mb-6">
            Pass the device around. Each player taps to see their task:
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

        <!-- Show Player Name First, Then Word/Role on Tap -->
        <div v-else class="space-y-4 sm:space-y-5 md:space-y-6">
          <div 
            @click="wordRevealed = true"
            class="bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl sm:rounded-2xl p-6 sm:p-8 md:p-10 text-center shadow-2xl cursor-pointer hover:scale-105 transition-all duration-300 min-h-[300px] flex flex-col items-center justify-center"
          >
            <p v-if="!wordRevealed" class="text-2xl sm:text-3xl md:text-4xl font-black mb-4 sm:mb-6">
              {{ currentReveal.player.name }}
            </p>
            <p v-if="!wordRevealed" class="text-base sm:text-lg md:text-xl text-white/80 mb-4">
              Tap to see your task
            </p>
            <div v-if="!wordRevealed" class="text-4xl sm:text-5xl md:text-6xl animate-bounce">
              👆
            </div>
            
            <div v-if="wordRevealed" class="space-y-3 sm:space-y-4">
              <div v-if="currentReveal.isImposter" class="space-y-3 sm:space-y-4">
                <p class="text-5xl sm:text-6xl md:text-7xl mb-3 sm:mb-4">🎭</p>
                <p class="text-xl sm:text-2xl md:text-3xl font-bold text-red-300">You are the IMPOSTER!</p>
                <p class="text-base sm:text-lg md:text-xl text-white/80">Your similar task is:</p>
                <div class="bg-red-500/20 border-2 border-red-400/50 rounded-xl p-3 sm:p-4 mt-4">
                  <p class="text-lg sm:text-xl md:text-2xl font-black text-cyan-300">{{ getPlayerWord(currentReveal.player.id) }}</p>
                </div>
                <p class="text-base sm:text-lg md:text-xl text-white/80 mt-4">Pretend to do tasks. Don't get caught!</p>
                <div class="bg-red-500/20 border-2 border-red-400/50 rounded-xl p-3 sm:p-4 mt-4">
                  <p class="text-sm sm:text-base font-bold">🎯 Your Goal: Blend in and avoid detection!</p>
                </div>
              </div>
              
              <div v-else class="space-y-3 sm:space-y-4">
                <p class="text-5xl sm:text-6xl md:text-7xl mb-3 sm:mb-4">👤</p>
                <p class="text-xl sm:text-2xl md:text-3xl font-bold text-blue-300">You are a CREW MEMBER!</p>
                <p class="text-base sm:text-lg md:text-xl text-white/80">Your task is:</p>
                <div class="bg-blue-500/20 border-2 border-blue-400/50 rounded-xl p-3 sm:p-4 mt-4">
                  <p class="text-lg sm:text-xl md:text-2xl font-black text-cyan-300">{{ getPlayerWord(currentReveal.player.id) }}</p>
                </div>
                <p class="text-sm sm:text-base text-white/70 mt-3">Describe this task to others. Find the imposter!</p>
              </div>
            </div>
          </div>

          <button
            v-if="wordRevealed"
            @click="confirmReveal"
            class="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 py-3 sm:py-4 rounded-lg sm:rounded-xl font-bold text-base sm:text-lg transition-all flex items-center justify-center gap-2 shadow-lg"
          >
            <Icon icon="mdi:check-circle" class="w-5 h-5 sm:w-6 sm:h-6" />
            I've Seen My Task
          </button>
        </div>
      </div>

      <!-- Game Phase: Playing/Discussion -->
      <div v-if="gamePhase === 'playing'" class="space-y-4 sm:space-y-5 md:space-y-6">
        <div class="bg-gradient-to-r from-purple-500/20 to-pink-500/20 border-2 border-purple-400/50 rounded-lg sm:rounded-xl p-4 sm:p-5 md:p-6">
          <h3 class="font-bold text-lg sm:text-xl mb-3 sm:mb-4 text-center">Discussion Phase</h3>
          <div class="space-y-3 text-sm sm:text-base">
            <p>🗣️ <strong>Crew Members:</strong> Describe your tasks in detail</p>
            <p>🎭 <strong>Imposter:</strong> Try to blend in without giving yourself away</p>
            <p>🕵️ <strong>Everyone:</strong> Listen carefully and watch for suspicious behavior</p>
          </div>
        </div>

        <!-- Timer -->
        <div v-if="timerActive" class="bg-white/5 rounded-lg sm:rounded-xl p-3 sm:p-4">
          <div class="flex justify-between items-center mb-2">
            <div class="flex items-center gap-1.5 sm:gap-2">
              <Icon icon="mdi:timer" class="w-4 h-4 sm:w-5 sm:h-5 text-cyan-400" />
              <span class="font-medium text-sm sm:text-base">Discussion Time:</span>
            </div>
            <span class="font-bold text-xl sm:text-2xl text-cyan-400">
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

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          <button
            v-if="!timerActive"
            @click="startTimer"
            class="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 py-3 sm:py-4 rounded-lg sm:rounded-xl font-bold text-base sm:text-lg transition-all flex items-center justify-center gap-2 shadow-lg"
          >
            <Icon icon="mdi:timer" class="w-5 h-5 sm:w-6 sm:h-6" />
            Start Timer (60s)
          </button>
          <button
            @click="startVoting"
            class="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 py-3 sm:py-4 rounded-lg sm:rounded-xl font-bold text-base sm:text-lg transition-all flex items-center justify-center gap-2 shadow-lg"
          >
            <Icon icon="mdi:vote" class="w-5 h-5 sm:w-6 sm:h-6" />
            Start Voting
          </button>
        </div>
      </div>

      <!-- Voting Phase -->
      <div v-if="gamePhase === 'voting'" class="space-y-4 sm:space-y-5 md:space-y-6">
        <h3 class="text-xl sm:text-2xl md:text-3xl font-bold text-center">Who is the Imposter?</h3>
        <p class="text-center text-sm sm:text-base text-white/70">Vote for the player you think is the imposter</p>
        
        <div class="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
          <button
            v-for="player in players"
            :key="player.id"
            @click="voteForPlayer(player)"
            class="bg-white/10 hover:bg-white/20 border-2 border-white/20 hover:border-purple-400 rounded-lg sm:rounded-xl p-4 sm:p-5 transition-all text-center"
          >
            <p class="font-bold text-sm sm:text-base md:text-lg">{{ player.name }}</p>
          </button>
        </div>
      </div>

      <!-- Result Phase -->
      <div v-if="gamePhase === 'result'" class="space-y-4 sm:space-y-5 md:space-y-6 text-center">
        <div class="bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl sm:rounded-2xl p-6 sm:p-8 md:p-10 shadow-2xl">
          <p class="text-5xl sm:text-6xl md:text-7xl mb-4 sm:mb-6">{{ resultEmoji }}</p>
          <p class="text-2xl sm:text-3xl md:text-4xl font-black mb-3 sm:mb-4">{{ resultMessage }}</p>
          <p class="text-lg sm:text-xl md:text-2xl text-cyan-300 mb-2">The Imposter was:</p>
          <p class="text-2xl sm:text-3xl md:text-4xl font-black text-red-300">{{ imposterPlayer?.name }}</p>
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
import { ref, computed, onMounted, onBeforeUnmount } from "vue";
import { Icon } from "@iconify/vue";
import { useGameStore } from "~/stores/game";
import { useAnalytics } from "~/composables/useAnalytics";
import { navigateTo } from "#app";

const gameStore = useGameStore();
const { trackPageView } = useAnalytics();

const gamePhase = ref('setup'); // setup, reveal, playing, voting, result
const imposterPlayer = ref(null);
const revealIndex = ref(0);
const currentReveal = ref(null);
const roundNumber = ref(1);
const resultMessage = ref("");
const resultEmoji = ref("");
const playerTasks = ref({});
const timerActive = ref(false);
const timeLeft = ref(60);
const timerInterval = ref(null);
const playerWords = ref({});
const wordRevealed = ref(false);

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

function startGame() {
  // Select random task pair
  const randomPair = taskPairs[Math.floor(Math.random() * taskPairs.length)];
  
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
  gamePhase.value = 'voting';
}

function voteForPlayer(player) {
  if (player.id === imposterPlayer.value.id) {
    resultMessage.value = "Correct! You found the Imposter!";
    resultEmoji.value = "🎉";
  } else {
    resultMessage.value = "Wrong! The Imposter escaped!";
    resultEmoji.value = "😱";
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
  roundNumber.value++;
  stopTimer();
}

onMounted(() => {
  trackPageView('imposter');
  
  gameStore.loadFromLocalStorage();
  
  if (players.value.length < 3) {
    alert('Imposter requires at least 3 players!');
    navigateTo('/setup?game=imposter');
  }
});

onBeforeUnmount(() => {
  stopTimer();
});
</script>

<style scoped>
/* Add any additional styles here */
</style>

