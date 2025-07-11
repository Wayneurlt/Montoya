<template>
  <!-- Main Container -->
  <div
    class="min-h-screen bg-gradient-to-br from-purple-900 to-fuchsia-900 text-white p-4"
  >
    <!-- Rules Modal -->
    <div
      v-if="showRules"
      class="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
    >
      <div
        class="bg-gradient-to-br from-purple-800 to-rose-800 rounded-2xl p-6 max-w-md w-full shadow-2xl border border-white/20"
      >
        <h2 class="text-3xl font-bold mb-4 text-center">🌀 Chaos Mode</h2>

        <div class="space-y-4 mb-6">
          <div class="bg-white/10 p-4 rounded-xl">
            <h3 class="font-bold text-lg mb-2 text-pink-300">Gender Rules</h3>
            <ul class="list-disc pl-5 space-y-1">
              <li>Men only interact with women</li>
              <li>Women only interact with men</li>
              <li>Same-gender actions automatically reroll</li>
            </ul>
          </div>

          <div class="bg-white/10 p-4 rounded-xl">
            <h3 class="font-bold text-lg mb-2 text-pink-300">Game Phases</h3>
            <ol class="list-decimal pl-5 space-y-2">
              <li><strong>Dice Phase:</strong> 3 rounds of Dice of Desire</li>
              <li>
                <strong>Strip Phase:</strong> Truth or Dare after first clothing
                loss
              </li>
              <li>
                <strong>Chaos Finale:</strong> Blindfolded dice + dare combo
              </li>
            </ol>
          </div>

          <div class="bg-white/10 p-4 rounded-xl">
            <h3 class="font-bold text-lg mb-2 text-pink-300">Vegas Rule</h3>
            <p>After game ends, you must:</p>
            <ul class="list-disc pl-5 mt-1 space-y-1">
              <li>Use fake accents for 24 hours</li>
              <li>Each slip-up = mystery dare within 7 days</li>
            </ul>
          </div>
        </div>

        <button
          @click="startGame"
          class="w-full bg-pink-600 hover:bg-pink-700 py-3 rounded-xl font-bold transition-all"
        >
          Accept & Begin
        </button>
      </div>
    </div>

    <!-- Game Board -->
    <div v-else class="max-w-2xl mx-auto">
      <!-- Phase Indicator -->
      <div class="flex justify-center mb-6">
        <div class="bg-white/10 rounded-full p-1 flex">
          <button
            v-for="(phase, index) in phases"
            :key="index"
            @click="switchPhase(index)"
            class="px-4 py-2 rounded-full text-sm font-medium transition-all"
            :class="{
              'bg-pink-600': currentPhaseIndex === index,
              'text-white': currentPhaseIndex === index,
              'text-white/70': currentPhaseIndex !== index,
            }"
          >
            {{ phase.name }}
          </button>
        </div>
      </div>

      <!-- Player Status -->
      <div
        class="flex justify-between items-center mb-6 p-4 bg-white/10 rounded-xl backdrop-blur-sm"
      >
        <div>
          <h3 class="font-semibold">Current Player:</h3>
          <p class="text-xl">
            {{ currentPlayer.name }} ({{
              currentPlayer.gender === "male" ? "♂" : "♀"
            }})
          </p>
        </div>
        <div class="text-right">
          <h3 class="font-semibold">Target:</h3>
          <p class="text-xl">
            {{ targetPlayer.name }} ({{
              targetPlayer.gender === "male" ? "♂" : "♀"
            }})
          </p>
        </div>
      </div>

      <!-- Dice Phase -->
      <div
        v-if="currentPhase === 'dice'"
        class="bg-white/10 rounded-2xl p-6 mb-8 backdrop-blur-sm border border-white/20"
      >
        <h3 class="text-xl font-bold mb-4 text-center">Dice of Desire</h3>
        <p class="text-center mb-6 text-pink-200">Round {{ diceRound }} of 3</p>

        <div class="flex justify-center gap-6 mb-8">
          <div
            @click="rollDice"
            class="w-20 h-20 bg-white rounded-xl shadow-lg flex justify-center items-center cursor-pointer transition-transform hover:scale-105"
            :class="{ 'animate-spin': isRolling }"
          >
            <div v-if="!isRolling" class="text-center">
              <p class="text-xs text-gray-800">Body</p>
              <p class="text-lg font-bold text-black">
                {{ currentRoll.body || "?" }}
              </p>
            </div>
          </div>

          <div
            @click="rollDice"
            class="w-20 h-20 bg-white rounded-xl shadow-lg flex justify-center items-center cursor-pointer transition-transform hover:scale-105"
            :class="{ 'animate-spin': isRolling }"
          >
            <div v-if="!isRolling" class="text-center">
              <p class="text-xs text-gray-800">Action</p>
              <p class="text-lg font-bold text-black">
                {{ currentRoll.action || "?" }}
              </p>
            </div>
          </div>
        </div>

        <button
          @click="rollDice"
          :disabled="isRolling || isTimerRunning"
          class="w-full bg-pink-600 hover:bg-pink-700 py-3 rounded-xl font-bold text-lg transition-all disabled:bg-gray-600 disabled:cursor-not-allowed"
        >
          {{ isRolling ? "Rolling..." : "Roll Dice" }}
        </button>

        <div v-if="currentResult" class="mt-6 text-center">
          <h4 class="text-lg font-bold mb-3">Your Command:</h4>
          <p class="text-xl bg-white/10 rounded-lg py-4 px-6 mb-4">
            {{ currentResult }}
          </p>
          <p v-if="specialEffect" class="text-pink-300 font-medium mb-4">
            {{ specialEffect }}
          </p>

          <div class="flex justify-center">
            <div class="relative w-24 h-24">
              <svg
                class="w-full h-full transform -rotate-90"
                viewBox="0 0 36 36"
              >
                <path
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="rgba(255,255,255,0.2)"
                  stroke-width="3"
                />
                <path
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="#ec4899"
                  stroke-width="3"
                  stroke-linecap="round"
                  :stroke-dasharray="`${timerPercent}, 100`"
                />
              </svg>
              <span
                class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-xl font-bold"
              >
                {{ secondsLeft }}s
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Strip Phase -->
      <div
        v-else-if="currentPhase === 'strip'"
        class="bg-white/10 rounded-2xl p-6 mb-8 backdrop-blur-sm border border-white/20"
      >
        <h3 class="text-xl font-bold mb-4 text-center">Strip Truth or Dare</h3>

        <div class="mb-6">
          <h4 class="font-semibold mb-2">Clothing Status:</h4>
          <div class="flex flex-wrap gap-2">
            <div
              v-for="(item, index) in clothingItems"
              :key="index"
              class="px-4 py-2 rounded-full transition-all"
              :class="
                item.removed
                  ? 'bg-gray-700 text-gray-400 line-through'
                  : 'bg-pink-600 hover:bg-pink-700 cursor-pointer'
              "
              @click="toggleClothing(index)"
            >
              {{ item.name }}
            </div>
          </div>
        </div>

        <div
          @click="flipCard"
          class="relative w-full h-64 mb-6 cursor-pointer perspective-1000"
        >
          <div
            class="relative w-full h-full transition-transform duration-700 transform-style-preserve-3d"
            :class="{ 'rotate-y-180': cardFlipped }"
          >
            <!-- Card Front -->
            <div
              class="absolute w-full h-full backface-hidden bg-gradient-to-br from-pink-600 to-purple-600 rounded-2xl flex flex-col justify-center items-center p-6 shadow-lg border-2 border-white/20"
            >
              <p class="text-2xl font-bold mb-2">Truth or Dare?</p>
              <p v-if="!currentCard">Click to draw a card</p>
              <p v-else>Click to reveal</p>
            </div>

            <!-- Card Back -->
            <div
              class="absolute w-full h-full backface-hidden bg-white text-gray-900 rounded-2xl flex flex-col justify-center items-center p-6 shadow-lg rotate-y-180 border-2 border-white/20"
            >
              <div v-if="currentCard" class="text-center">
                <span
                  class="font-bold text-lg px-3 py-1 rounded-full mb-2"
                  :class="
                    currentCard.type === 'TRUTH'
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-pink-100 text-pink-800'
                  "
                >
                  {{ currentCard.type }}
                </span>
                <p class="text-xl font-medium mt-2">{{ currentCard.text }}</p>
              </div>
            </div>
          </div>
        </div>

        <div class="flex justify-center gap-4">
          <button
            @click="completeChallenge"
            class="bg-green-600 hover:bg-green-700 px-6 py-3 rounded-xl font-bold transition-all"
            :disabled="!currentCard"
          >
            Completed
          </button>
          <button
            @click="failChallenge"
            class="bg-red-600 hover:bg-red-700 px-6 py-3 rounded-xl font-bold transition-all"
            :disabled="!currentCard"
          >
            Failed
          </button>
        </div>
      </div>

      <!-- Chaos Finale -->
      <div
        v-else
        class="bg-white/10 rounded-2xl p-6 mb-8 backdrop-blur-sm border border-white/20"
      >
        <h3 class="text-2xl font-bold mb-4 text-center">🔥 CHAOS FINALE 🔥</h3>
        <p class="text-center mb-6 text-pink-300">
          Loser rolls blindfolded + Winner picks dare<br />
          Combine both actions simultaneously!
        </p>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div class="bg-white/5 rounded-xl p-4">
            <h4 class="font-bold mb-3 text-center">Blindfolded Dice</h4>
            <div class="flex justify-center mb-4">
              <div
                class="w-16 h-16 bg-gray-700 rounded-lg flex justify-center items-center"
              >
                <p v-if="chaosDice" class="text-lg font-bold">
                  {{ chaosDice }}
                </p>
                <p v-else class="text-gray-400">?</p>
              </div>
            </div>
            <button
              @click="rollChaosDice"
              :disabled="chaosDice"
              class="w-full bg-purple-600 hover:bg-purple-700 py-2 rounded-lg disabled:bg-gray-700 disabled:cursor-not-allowed"
            >
              Roll Blindfolded
            </button>
          </div>

          <div class="bg-white/5 rounded-xl p-4">
            <h4 class="font-bold mb-3 text-center">Dare Card</h4>
            <div class="min-h-16 flex justify-center items-center mb-4">
              <p v-if="chaosDare" class="text-lg font-medium text-center">
                {{ chaosDare }}
              </p>
              <p v-else class="text-gray-400">Waiting for draw...</p>
            </div>
            <button
              @click="drawChaosDare"
              :disabled="chaosDare"
              class="w-full bg-pink-600 hover:bg-pink-700 py-2 rounded-lg disabled:bg-gray-700 disabled:cursor-not-allowed"
            >
              Draw Dare
            </button>
          </div>
        </div>

        <div v-if="chaosDice && chaosDare" class="text-center">
          <h4 class="text-xl font-bold mb-3">Combined Command:</h4>
          <p
            class="text-2xl bg-gradient-to-r from-pink-600 to-purple-600 text-white py-4 px-6 rounded-xl mb-6"
          >
            {{ chaosDare }} WHILE {{ chaosDice }}
          </p>
          <button
            @click="completeChaosRound"
            class="bg-green-600 hover:bg-green-700 px-8 py-3 rounded-xl font-bold text-lg transition-all"
          >
            Complete Challenge!
          </button>
        </div>
      </div>

      <!-- Game History -->
      <div
        class="bg-white/10 rounded-2xl p-6 mb-8 backdrop-blur-sm border border-white/20"
      >
        <h3 class="text-xl font-bold mb-3">Game History</h3>
        <ul class="space-y-3 max-h-60 overflow-y-auto">
          <li
            v-for="(log, index) in gameHistory"
            :key="index"
            class="py-2 border-b border-white/10 last:border-0 text-sm"
          >
            {{ log }}
          </li>
        </ul>
      </div>

      <!-- Vegas Rule Tracker -->
      <div
        v-if="gameCompleted"
        class="bg-white/10 rounded-2xl p-6 backdrop-blur-sm border border-white/20"
      >
        <h3 class="text-xl font-bold mb-3">🎰 Vegas Rule Active</h3>
        <div class="grid grid-cols-2 gap-4">
          <div class="bg-white/5 rounded-lg p-3 text-center">
            <p class="text-sm text-pink-300 mb-1">Time Remaining</p>
            <p class="text-xl font-mono">{{ vegasTimeLeft }}</p>
          </div>
          <div class="bg-white/5 rounded-lg p-3 text-center">
            <p class="text-sm text-pink-300 mb-1">Slip-ups</p>
            <p class="text-xl">{{ slipUps }}</p>
          </div>
        </div>
        <button
          @click="reportSlipUp"
          class="mt-4 w-full bg-red-600 hover:bg-red-700 py-2 rounded-lg transition-all"
        >
          Report Slip-up
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
// ======================
// GAME CONFIGURATION
// ======================
const bodyParts = [
  "Lips",
  "Neck",
  "Earlobe",
  "Shoulders",
  "Chest",
  "Back",
  "Stomach",
  "Thighs",
  "Feet",
  "Hands",
  "Your Choice",
];

const actions = [
  "Kiss",
  "Lick",
  "Nibble",
  "Massage",
  "Trace",
  "Blow",
  "Caress",
  "Pinch",
  "Tease",
  "Suck",
  "Your Choice",
];

const dareCards = [
  "Let me apply lipstick—then kiss wherever I choose",
  "Swap underwear for the next 3 rounds",
  "Describe where you'd touch me if we were in a crowded elevator",
  "Let your partner choose your outfit from what's left",
  "Whisper your wildest fantasy in my ear",
];

// ======================
// GAME STATE
// ======================
const showRules = ref(true);
const isRolling = ref(false);
const isTimerRunning = ref(false);
const secondsLeft = ref(60);
const timerPercent = ref(100);
const timer = ref(null);
const specialEffect = ref("");

const players = ref([
  { id: 1, name: "Player 1", gender: "male" },
  { id: 2, name: "Player 2", gender: "female" },
]);

const currentPlayerIndex = ref(0);
const currentRoll = ref({ body: "", action: "" });
const currentResult = ref("");
const gameHistory = ref([]);

const phases = ref([
  { name: "Dice Phase", value: "dice" },
  { name: "Strip Phase", value: "strip" },
  { name: "Chaos Finale", value: "chaos" },
]);
const currentPhaseIndex = ref(0);
const currentPhase = computed(
  () => phases.value[currentPhaseIndex.value].value
);
const diceRound = ref(1);

const clothingItems = ref([
  { name: "Top", removed: false },
  { name: "Bottom", removed: false },
  { name: "Underwear", removed: false },
  { name: "Socks", removed: false },
  { name: "Accessories", removed: false },
]);

const currentCard = ref(null);
const cardFlipped = ref(false);

const chaosDice = ref("");
const chaosDare = ref("");

const gameCompleted = ref(false);
const vegasTimeLeft = ref("24:00:00");
const slipUps = ref(0);
const vegasTimer = ref(null);

// ======================
// COMPUTED PROPERTIES
// ======================
const currentPlayer = computed(() => players.value[currentPlayerIndex.value]);

const targetPlayer = computed(() => {
  // Always return opposite gender player
  return players.value.find((p) => p.gender !== currentPlayer.value.gender);
});

// ======================
// GAME METHODS
// ======================
const startGame = () => {
  showRules.value = false;
  gameHistory.value.push("Game started! Beginning Dice Phase");
};

const switchPhase = (index) => {
  if (index > currentPhaseIndex.value) return; // Can't skip ahead
  currentPhaseIndex.value = index;
};

const rollDice = async () => {
  if (isRolling.value) return;

  isRolling.value = true;
  currentResult.value = "";
  specialEffect.value = "";

  setTimeout(() => {
    const bodyIndex = Math.floor(Math.random() * bodyParts.length);
    const actionIndex = Math.floor(Math.random() * actions.length);

    currentRoll.value = {
      body: bodyParts[bodyIndex],
      action: actions[actionIndex],
    };

    // Check for special effects
    if (bodyIndex === 0 && actionIndex === 0) {
      specialEffect.value = "⚡ Snake Eyes! Switch roles immediately";
      switchRoles();
    } else if (bodyIndex === actionIndex) {
      specialEffect.value = "✨ Matching! 2 minutes + remove clothing";
    }

    currentResult.value = `${currentRoll.value.action} ${currentRoll.value.body}`;
    startTimer();

    // Log to history
    gameHistory.value.push(
      `${currentPlayer.value.name} rolled: ${currentResult.value}`
    );

    // Check for phase transition
    if (currentPhase.value === "dice") {
      diceRound.value++;
      if (diceRound.value > 3) {
        currentPhaseIndex.value = 1; // Move to strip phase
        gameHistory.value.push("Phase change: Now entering Strip Phase");
      }

      // Check for clothing removal (25% chance after round 1)
      if (diceRound.value > 1 && Math.random() < 0.25) {
        removeRandomClothing();
      }
    }

    isRolling.value = false;
  }, 1000);
};

const startTimer = () => {
  clearInterval(timer.value);
  isTimerRunning.value = true;
  secondsLeft.value = specialEffect.value.includes("2 minutes") ? 120 : 60;
  timerPercent.value = 100;

  timer.value = setInterval(() => {
    secondsLeft.value--;
    timerPercent.value =
      (secondsLeft.value /
        (specialEffect.value.includes("2 minutes") ? 120 : 60)) *
      100;

    if (secondsLeft.value <= 0) {
      clearInterval(timer.value);
      isTimerRunning.value = false;
      gameHistory.value.push("Time's up!");
    }
  }, 1000);
};

const switchRoles = () => {
  currentPlayerIndex.value =
    (currentPlayerIndex.value + 1) % players.value.length;
  gameHistory.value.push(
    `Roles switched! Now ${currentPlayer.value.name}'s turn`
  );
};

const removeRandomClothing = () => {
  const remainingItems = clothingItems.value.filter((item) => !item.removed);
  if (remainingItems.length > 0) {
    const randomIndex = Math.floor(Math.random() * remainingItems.length);
    remainingItems[randomIndex].removed = true;
    gameHistory.value.push(
      `${currentPlayer.value.name} removed ${remainingItems[randomIndex].name}`
    );

    // Check for phase transition
    if (currentPhase.value === "dice") {
      currentPhaseIndex.value = 1; // Move to strip phase
      gameHistory.value.push("Clothing removed! Now entering Strip Phase");
    }

    // Check for chaos phase transition
    if (remainingItems.length <= 1) {
      currentPhaseIndex.value = 2; // Move to chaos phase
      gameHistory.value.push("Final clothing item! Chaos Finale activated!");
    }
  }
};

const drawCard = () => {
  cardFlipped.value = false;

  setTimeout(() => {
    const isTruth = Math.random() < 0.3; // 30% chance for truth
    if (isTruth) {
      currentCard.value = {
        type: "TRUTH",
        text: "What's your secret fantasy you've never shared?",
      };
    } else {
      const randomIndex = Math.floor(Math.random() * dareCards.length);
      currentCard.value = {
        type: "DARE",
        text: dareCards[randomIndex],
      };
    }

    cardFlipped.value = true;
    gameHistory.value.push(
      `${currentPlayer.value.name} drew a ${currentCard.value.type} card`
    );
  }, 300);
};

const flipCard = () => {
  if (currentCard.value) {
    cardFlipped.value = !cardFlipped.value;
  }
};

const completeChallenge = () => {
  gameHistory.value.push(
    `${currentPlayer.value.name} completed: ${currentCard.value.text}`
  );
  currentCard.value = null;
  cardFlipped.value = false;
  switchRoles();
};

const failChallenge = () => {
  gameHistory.value.push(
    `${currentPlayer.value.name} failed: ${currentCard.value.text}`
  );
  removeRandomClothing();
  currentCard.value = null;
  cardFlipped.value = false;
  switchRoles();
};

const rollChaosDice = () => {
  const bodyIndex = Math.floor(Math.random() * bodyParts.length);
  const actionIndex = Math.floor(Math.random() * actions.length);
  chaosDice.value = `${actions[actionIndex]} ${bodyParts[bodyIndex]}`;
  gameHistory.value.push(`Chaos dice rolled: ${chaosDice.value}`);
};

const drawChaosDare = () => {
  const randomIndex = Math.floor(Math.random() * dareCards.length);
  chaosDare.value = dareCards[randomIndex];
  gameHistory.value.push(`Chaos dare drawn: ${chaosDare.value}`);
};

const completeChaosRound = () => {
  gameHistory.value.push("CHAOS FINALE COMPLETED! Game over!");
  gameCompleted.value = true;
  startVegasTimer();
};

const startVegasTimer = () => {
  let hours = 24;
  let minutes = 0;
  let seconds = 0;

  vegasTimer.value = setInterval(() => {
    seconds--;
    if (seconds < 0) {
      seconds = 59;
      minutes--;
      if (minutes < 0) {
        minutes = 59;
        hours--;
        if (hours < 0) {
          clearInterval(vegasTimer.value);
          vegasTimeLeft.value = "COMPLETED!";
          return;
        }
      }
    }

    vegasTimeLeft.value = `${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  }, 1000);
};

const reportSlipUp = () => {
  slipUps.value++;
  gameHistory.value.push(`Vegas Rule slip-up! Total: ${slipUps.value}`);
};

// Cleanup
onBeforeUnmount(() => {
  if (timer.value) clearInterval(timer.value);
  if (vegasTimer.value) clearInterval(vegasTimer.value);
});
</script>

<style>
/* Animations */
@keyframes spin {
  0% {
    transform: rotate(0deg) scale(1);
  }
  50% {
    transform: rotate(180deg) scale(1.1);
  }
  100% {
    transform: rotate(360deg) scale(1);
  }
}
.animate-spin {
  animation: spin 0.8s linear infinite;
}

/* 3D Card Styles */
.perspective-1000 {
  perspective: 1000px;
}
.transform-style-preserve-3d {
  transform-style: preserve-3d;
}
.backface-hidden {
  backface-visibility: hidden;
}
.rotate-y-180 {
  transform: rotateY(180deg);
}

/* Scrollbar */
::-webkit-scrollbar {
  width: 6px;
}
::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.1);
}
::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.3);
  border-radius: 3px;
}

/* Glassmorphism effect */
.backdrop-blur-sm {
  backdrop-filter: blur(8px);
}
</style>
