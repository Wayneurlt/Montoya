<template>
  <div class="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 p-5">
    <HomeNavbar title="Chaos Mode" />

    <div
      class="max-w-4xl mx-auto bg-white bg-opacity-90 rounded-xl shadow-lg p-6"
    >
      <!-- Rules Section -->
      <div class="bg-purple-100 rounded-lg p-4 mb-6">
        <h2 class="text-2xl font-bold text-purple-800 mb-3">
          Chaos Mode Rules
        </h2>
        <ol class="list-decimal pl-5 space-y-2 text-black">
          <li>Start with <strong>3 rounds of Dice of Desire</strong></li>
          <li>
            Switch to <strong>Strip Truth or Dare</strong> after first clothing
            loss
          </li>
          <li>
            Final Round:
            <ul class="list-disc pl-5 mt-1 space-y-1">
              <li>Loser rolls dice blindfolded</li>
              <li>Winner draws dare card</li>
              <li>Execute both simultaneously</li>
            </ul>
          </li>
          <li>
            <strong>Vegas Rule:</strong> All game talk must occur in a fake
            accent for 24hrs post-game
          </li>
        </ol>
      </div>

      <!-- Dice Phase -->
      <div v-if="phase === 'dice'" class="mb-8">
        <h3 class="text-xl font-semibold text-purple-700 mb-4">
          Dice of Desire Phase (Round {{ diceRound }}/3)
        </h3>

        <div class="flex flex-col items-center">
          <div class="flex gap-5 mb-5" @click="rollDice">
            <!-- Body Die -->
            <div
              ref="bodyDie"
              class="w-16 h-16 bg-white rounded-lg shadow-md flex justify-center items-center relative overflow-hidden transition-transform duration-300"
              :class="{ 'animate-shake': isRolling }"
            >
              <div
                v-for="(face, index) in bodyFaces"
                :key="index"
                class="absolute inset-0 flex justify-center items-center p-1 text-xs font-bold text-purple-800 text-center"
              >
                {{ face }}
              </div>
            </div>

            <!-- Action Die -->
            <div
              ref="actionDie"
              class="w-16 h-16 bg-white rounded-lg shadow-md flex justify-center items-center relative overflow-hidden transition-transform duration-300"
              :class="{ 'animate-shake': isRolling }"
            >
              <div
                v-for="(face, index) in actionFaces"
                :key="index"
                class="absolute inset-0 flex justify-center items-center p-1 text-xs font-bold text-purple-800 text-center"
              >
                {{ face }}
              </div>
            </div>
          </div>

          <button
            @click="rollDice"
            :disabled="isRolling"
            class="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-full shadow-md transition-all disabled:bg-purple-300 disabled:cursor-not-allowed"
            :class="{ 'transform -translate-y-1': !isRolling }"
          >
            {{ isRolling ? "Rolling..." : "Roll Dice" }}
          </button>
        </div>

        <div v-if="currentDiceResult" class="mt-6 text-center">
          <h4 class="text-lg font-medium text-purple-800 mb-2">
            Your Command:
          </h4>
          <p
            class="text-purple-700 font-bold bg-purple-50 rounded-lg py-3 px-4 mb-4"
          >
            {{ currentDiceResult }}
          </p>

          <div class="flex justify-center items-center">
            <div class="relative w-20 h-20 mr-3">
              <circle-progress
                :percent="timerPercent"
                :size="80"
                :border-width="8"
                :border-bg-width="8"
                fill-color="#9c27b0"
                empty-color="#e1bee7"
              />
              <span
                class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 font-bold text-purple-700"
              >
                {{ secondsLeft }}s
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Truth or Dare Phase -->
      <div v-else-if="phase === 'truthOrDare'" class="mb-8">
        <h3 class="text-xl font-semibold text-purple-700 mb-4">
          Strip Truth or Dare Phase
        </h3>

        <div class="bg-purple-50 rounded-lg p-4 mb-6">
          <h4 class="font-medium text-purple-800 mb-2">
            Clothing Remaining: {{ remainingClothing }}
          </h4>
          <div class="flex flex-wrap gap-2">
            <div
              v-for="(item, index) in clothingItems"
              :key="index"
              class="px-3 py-1 text-sm rounded-full"
              :class="
                item.removed
                  ? 'bg-gray-300 text-gray-600 line-through'
                  : 'bg-purple-500 text-white'
              "
            >
              {{ item.name }}
            </div>
          </div>
        </div>

        <div class="flex flex-col items-center mb-6">
          <div
            @click="flipCard"
            class="w-48 h-72 perspective-1000 cursor-pointer mb-4"
          >
            <div
              class="relative w-full h-full transition-transform duration-500 transform-style-preserve-3d"
              :class="{ 'rotate-y-180': cardFlipped }"
            >
              <!-- Card Front -->
              <div
                class="absolute inset-0 bg-purple-500 rounded-lg shadow-md flex justify-center items-center p-4 backface-hidden"
              >
                <p class="text-white text-center">Click to draw a card</p>
              </div>

              <!-- Card Back -->
              <div
                class="absolute inset-0 bg-white rounded-lg shadow-md flex flex-col justify-center items-center p-4 backface-hidden rotate-y-180"
              >
                <p v-if="currentCard" class="text-purple-700 font-medium">
                  {{ currentCard.type }}:
                </p>
                <p class="text-purple-800 font-bold text-center">
                  {{ currentCard?.text }}
                </p>
              </div>
            </div>
          </div>

          <button
            @click="drawCard"
            class="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-full shadow-md transition-transform hover:-translate-y-1"
          >
            Draw Card
          </button>
        </div>

        <div class="flex justify-center gap-4">
          <button
            @click="completeChallenge"
            class="px-5 py-2 bg-green-500 hover:bg-green-600 text-white rounded-full font-medium shadow transition-transform hover:-translate-y-1"
          >
            Completed
          </button>
          <button
            @click="failChallenge"
            class="px-5 py-2 bg-red-500 hover:bg-red-600 text-white rounded-full font-medium shadow transition-transform hover:-translate-y-1"
          >
            Failed
          </button>
        </div>
      </div>

      <!-- Chaos Round Phase -->
      <div v-else class="mb-8">
        <h3 class="text-xl font-semibold text-purple-700 mb-4">
          Final Chaos Round!
        </h3>

        <div class="text-center mb-8">
          <p class="text-purple-800 text-lg">
            Loser rolls dice blindfolded<br />Winner draws dare card<br />Execute
            both simultaneously!
          </p>
        </div>

        <div class="flex flex-col md:flex-row justify-around gap-6 mb-8">
          <!-- Dice Section -->
          <div class="bg-purple-50 rounded-lg p-4 flex-1 text-center">
            <h4 class="font-medium text-purple-800 mb-3">Dice Result:</h4>
            <p
              v-if="chaosDiceResult"
              class="font-bold text-purple-700 bg-purple-100 rounded py-2 px-3 min-h-12 mb-3"
            >
              {{ chaosDiceResult }}
            </p>
            <button
              @click="rollChaosDice"
              :disabled="chaosDiceResult"
              class="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-full text-sm shadow disabled:bg-purple-300 disabled:cursor-not-allowed"
            >
              Roll Blindfolded
            </button>
          </div>

          <!-- Dare Section -->
          <div class="bg-purple-50 rounded-lg p-4 flex-1 text-center">
            <h4 class="font-medium text-purple-800 mb-3">Dare Card:</h4>
            <p
              v-if="chaosDare"
              class="font-bold text-purple-700 bg-purple-100 rounded py-2 px-3 min-h-12 mb-3"
            >
              {{ chaosDare }}
            </p>
            <button
              @click="drawChaosDare"
              :disabled="chaosDare"
              class="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-full text-sm shadow disabled:bg-purple-300 disabled:cursor-not-allowed"
            >
              Draw Dare
            </button>
          </div>
        </div>

        <div v-if="chaosDiceResult && chaosDare" class="text-center">
          <h4 class="text-lg font-medium text-purple-800 mb-2">
            Combined Command:
          </h4>
          <p
            class="text-purple-700 font-bold bg-purple-50 rounded-lg py-3 px-4 mb-4"
          >
            {{ chaosDare }} WHILE {{ chaosDiceResult }}
          </p>
          <button
            @click="completeChaosRound"
            class="px-6 py-2 bg-green-500 hover:bg-green-600 text-black rounded-full font-medium shadow transition-transform hover:-translate-y-1"
          >
            Challenge Complete!
          </button>
        </div>
      </div>

      <!-- Game History -->
      <div class="bg-purple-50 rounded-lg p-4 mb-6">
        <h3 class="text-lg font-semibold text-purple-800 mb-3">Game History</h3>
        <ul class="max-h-40 overflow-y-auto text-black">
          <li
            v-for="(action, index) in gameHistory"
            :key="index"
            class="py-2 border-b border-purple-100 last:border-0 text-sm"
          >
            {{ action }}
          </li>
        </ul>
      </div>

      <!-- Vegas Rule Tracker -->
      <div class="bg-purple-100 rounded-lg p-4 text-center">
        <h3 class="text-lg font-semibold text-purple-800 mb-2">
          Vegas Rule Tracker
        </h3>
        <p class="text-purple-700 mb-3">
          After game ends, you must use fake accents for 24 hours!
        </p>

        <div v-if="gameCompleted" class="mt-2">
          <p class="font-medium text-purple-800">
            Time remaining: {{ vegasTimeLeft }}
          </p>
          <p class="font-medium text-purple-800">
            Slip-ups: {{ slipUps }} (Each = mystery dare within 7 days)
          </p>
        </div>
      </div>
    </div>

    <GameFooter />
  </div>
</template>

<script>
const bodyFaces = [
  "Lips",
  "Inner Thigh",
  "Neck",
  "Earlobe",
  "navel",
  "Ass",
  "Nipples",
  "Your Choice",
];
const actionFaces = [
  "Lick",
  "Gentle Bite",
  "Blow",
  "Grab",
  "Trace with Feather",
  "Suck",
  "Kiss",
  "Your Choice",
];
const dareCards = [
  "Let me apply lipstick—then kiss wherever I choose",
  "Swap underwear for the next 3 rounds",
  "Describe where you'd touch me if we were in a crowded elevator",
  "Let your partner choose your outfit from what's left",
  "Whisper your wildest fantasy in my ear",
];

export default {
  data() {
    return {
      phase: "dice",
      diceRound: 1,
      isRolling: false,
      currentDiceResult: "",
      secondsLeft: 60,
      timerPercent: 100,
      timerInterval: null,
      bodyFaces,
      actionFaces,
      clothingItems: [
        { name: "Top", removed: false },
        { name: "Bottom", removed: false },
        { name: "Underwear", removed: false },
        { name: "Socks", removed: false },
        { name: "Accessories", removed: false },
      ],
      currentCard: null,
      cardFlipped: false,
      gameHistory: [],
      chaosDiceResult: "",
      chaosDare: "",
      gameCompleted: false,
      slipUps: 0,
      vegasTimer: null,
      vegasTimeLeft: "24:00:00",
    };
  },
  computed: {
    remainingClothing() {
      return this.clothingItems.filter((item) => !item.removed).length;
    },
  },
  methods: {
    rollDice() {
      this.isRolling = true;
      this.currentDiceResult = "";

      this.$refs.bodyDie.classList.add("animate-shake");
      this.$refs.actionDie.classList.add("animate-shake");

      setTimeout(() => {
        const bodyIndex = Math.floor(Math.random() * 6);
        const actionIndex = Math.floor(Math.random() * 6);

        const bodyResult = this.bodyFaces[bodyIndex];
        const actionResult = this.actionFaces[actionIndex];

        this.currentDiceResult = `${actionResult} ${bodyResult} for 60 seconds`;

        // Check for clothing removal condition
        if (
          bodyIndex === actionIndex ||
          (bodyIndex === 0 && actionIndex === 0)
        ) {
          const remainingItems = this.clothingItems.filter(
            (item) => !item.removed
          );
          if (remainingItems.length > 0 && this.diceRound >= 2) {
            const randomIndex = Math.floor(
              Math.random() * remainingItems.length
            );
            remainingItems[randomIndex].removed = true;
            this.gameHistory.push(
              `Clothing removed: ${remainingItems[randomIndex].name}`
            );

            // Transition to Truth or Dare phase if first clothing loss
            if (this.phase === "dice") {
              this.phase = "truthOrDare";
              this.gameHistory.push(
                "Phase change: Now playing Strip Truth or Dare!"
              );
            }
          }
        }

        this.gameHistory.push(`Dice: ${this.currentDiceResult}`);
        this.startTimer();

        this.isRolling = false;
        this.$refs.bodyDie.classList.remove("animate-shake");
        this.$refs.actionDie.classList.remove("animate-shake");

        // Advance dice rounds
        if (this.phase === "dice") {
          this.diceRound++;
          if (this.diceRound > 3) {
            this.phase = "truthOrDare";
            this.gameHistory.push(
              "Phase change: Now playing Strip Truth or Dare!"
            );
          }
        }
      }, 500);
    },
    startTimer() {
      this.secondsLeft = 60;
      this.timerPercent = 100;

      if (this.timerInterval) {
        clearInterval(this.timerInterval);
      }

      this.timerInterval = setInterval(() => {
        this.secondsLeft--;
        this.timerPercent = (this.secondsLeft / 60) * 100;

        if (this.secondsLeft <= 0) {
          clearInterval(this.timerInterval);
        }
      }, 1000);
    },
    drawCard() {
      this.cardFlipped = false;

      setTimeout(() => {
        const randomIndex = Math.floor(Math.random() * dareCards.length);
        this.currentCard = {
          type: "DARE",
          text: dareCards[randomIndex],
        };

        this.cardFlipped = true;
        this.gameHistory.push(`Card drawn: ${this.currentCard.text}`);
      }, 300);
    },
    flipCard() {
      if (this.currentCard) {
        this.cardFlipped = !this.cardFlipped;
      }
    },
    completeChallenge() {
      this.gameHistory.push(`Completed: ${this.currentCard.text}`);
      this.currentCard = null;
      this.cardFlipped = false;

      // Check for chaos round condition
      const remaining = this.clothingItems.filter(
        (item) => !item.removed
      ).length;
      if (remaining <= 1) {
        this.phase = "chaos";
        this.gameHistory.push("Final Phase: Chaos Round activated!");
      }
    },
    failChallenge() {
      this.gameHistory.push(`Failed: ${this.currentCard.text}`);

      // Remove clothing
      const remainingItems = this.clothingItems.filter((item) => !item.removed);
      if (remainingItems.length > 0) {
        const randomIndex = Math.floor(Math.random() * remainingItems.length);
        remainingItems[randomIndex].removed = true;
        this.gameHistory.push(
          `Clothing removed: ${remainingItems[randomIndex].name}`
        );
      }

      this.currentCard = null;
      this.cardFlipped = false;

      // Check for chaos round condition
      const remaining = this.clothingItems.filter(
        (item) => !item.removed
      ).length;
      if (remaining <= 1) {
        this.phase = "chaos";
        this.gameHistory.push("Final Phase: Chaos Round activated!");
      }
    },
    rollChaosDice() {
      const bodyIndex = Math.floor(Math.random() * 6);
      const actionIndex = Math.floor(Math.random() * 6);

      const bodyResult = this.bodyFaces[bodyIndex];
      const actionResult = this.actionFaces[actionIndex];

      this.chaosDiceResult = `${actionResult} ${bodyResult}`;
      this.gameHistory.push(`Chaos Dice: ${this.chaosDiceResult}`);
    },
    drawChaosDare() {
      const randomIndex = Math.floor(Math.random() * dareCards.length);
      this.chaosDare = dareCards[randomIndex];
      this.gameHistory.push(`Chaos Dare: ${this.chaosDare}`);
    },
    completeChaosRound() {
      this.gameHistory.push(
        "CHAOS COMPLETE! Game over - Vegas Rule activated!"
      );
      this.gameCompleted = true;
      this.startVegasTimer();
    },
    startVegasTimer() {
      let hours = 24;
      let minutes = 0;
      let seconds = 0;

      this.vegasTimer = setInterval(() => {
        seconds--;
        if (seconds < 0) {
          seconds = 59;
          minutes--;
          if (minutes < 0) {
            minutes = 59;
            hours--;
            if (hours < 0) {
              clearInterval(this.vegasTimer);
              this.vegasTimeLeft = "COMPLETED!";
              return;
            }
          }
        }

        this.vegasTimeLeft = `${hours.toString().padStart(2, "0")}:${minutes
          .toString()
          .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
      }, 1000);
    },
    reportSlipUp() {
      this.slipUps++;
      this.gameHistory.push(`Vegas Rule slip-up! Total: ${this.slipUps}`);
    },
  },
  beforeUnmount() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
    }
    if (this.vegasTimer) {
      clearInterval(this.vegasTimer);
    }
  },
};
</script>

<style>
/* Custom animations for dice */
.animate-shake {
  animation: shake 0.5s infinite;
}

@keyframes shake {
  0% {
    transform: rotate(0deg);
  }
  25% {
    transform: rotate(5deg);
  }
  50% {
    transform: rotate(-5deg);
  }
  75% {
    transform: rotate(5deg);
  }
  100% {
    transform: rotate(0deg);
  }
}

/* 3D card flip styles */
.perspective-1000 {
  perspective: 1000px;
}

.transform-style-preserve-3d {
  transform-style: preserve-3d;
}

.rotate-y-180 {
  transform: rotateY(180deg);
}

.backface-hidden {
  backface-visibility: hidden;
}

.rotate-y-180 {
  transform: rotateY(180deg);
}
</style>
