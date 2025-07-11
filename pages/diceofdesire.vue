<template>
  <div class="min-h-screen bg-gradient-to-br from-pink-50 to-pink-200 p-5">
    <div
      class="max-w-4xl mx-auto bg-white bg-opacity-95 rounded-xl shadow-lg p-6"
    >
      <!-- Rules Section -->
      <div class="bg-white p-4 rounded-lg mb-6">
        <h2 class="text-2xl font-bold text-black mb-3">Game Rules</h2>
        <ul class="list-disc pl-5 space-y-2 text-black">
          <li>Roll both dice for a 60-second command</li>
          <li>"Your Choice" = Partner's wildcard pick (no veto power)</li>
          <li>
            Matching numbers = Repeat action for 2 minutes + remove clothing
          </li>
          <li>Snake eyes (⚀⚀) = Switch roles immediately</li>
        </ul>
      </div>

      <!-- Dice Area -->
      <div class="flex flex-col items-center my-8">
        <div class="flex flex-col items-center">
          <div class="flex gap-5 mb-5">
            <!-- Body Die -->
            <div
              @click="rollDice"
              :class="{ 'animate-shake': isRolling }"
              class="w-20 h-20 bg-white rounded-lg shadow-md flex justify-center items-center font-bold text-black relative overflow-hidden"
            >
              <div
                v-for="face in bodyFaces"
                :key="face"
                class="absolute w-full h-full flex justify-center items-center text-sm text-center p-1 backface-hidden"
              >
                {{ face }}
              </div>
            </div>

            <!-- Action Die -->
            <div
              @click="rollDice"
              :class="{ 'animate-shake': isRolling }"
              class="w-20 h-20 bg-white rounded-lg shadow-md flex justify-center items-center font-bold text-black relative overflow-hidden"
            >
              <div
                v-for="face in actionFaces"
                :key="face"
                class="absolute w-full h-full flex justify-center items-center text-sm text-center p-1 backface-hidden"
              >
                {{ face }}
              </div>
            </div>
          </div>

          <button
            @click="rollDice"
            :disabled="isRolling"
            class="bg-pink-600 text-black px-6 py-3 rounded-full text-lg shadow-lg hover:bg-pink-700 hover:-translate-y-0.5 transition-all disabled:bg-pink-300 disabled:cursor-not-allowed"
          >
            {{ isRolling ? "Rolling..." : "Roll Dice" }}
          </button>
        </div>

        <!-- Result Display -->
        <div v-if="currentResult" class="text-center mt-5">
          <h3 class="text-xl font-semibold text-black">Your Command:</h3>
          <p
            class="text-xl font-bold text-black bg-pink-50 px-6 py-4 rounded-lg my-4"
          >
            {{ currentResult }}
          </p>

          <!-- Timer -->
          <div class="relative w-24 h-24 mx-auto">
            <svg class="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
              <path
                class="fill-none stroke-black stroke-[4]"
                d="M18 2.0845
                   a 15.9155 15.9155 0 0 1 0 31.831
                   a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                class="fill-none stroke-black stroke-[4] stroke-linecap-round transition-all duration-300 ease-linear"
                :stroke-dasharray="`${timerPercent}, 100`"
                d="M18 2.0845
                   a 15.9155 15.9155 0 0 1 0 31.831
                   a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
            <span
              class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-xl font-bold text-black"
            >
              {{ secondsLeft }}s
            </span>
          </div>
        </div>
      </div>

      <!-- History Section -->
      <div class="mt-8 bg-pink-50 p-4 rounded-lg">
        <h3 class="text-xl font-bold text-black mb-3">Previous Rolls</h3>
        <ul class="space-y-2">
          <li
            v-for="(roll, index) in rollHistory"
            :key="index"
            class="py-2 border-b border-pink-200 text-black"
          >
            {{ roll.body }} + {{ roll.action }} = {{ roll.result }}
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      bodyFaces: [
        "Lips",
        "Inner Thigh",
        "Outer Thigh",
        "Neck",
        "Earlobe",
        "navel",
        "Ass",
        "Nipples",
        "Boobs",
        "Lower Back",
        "Inner Arm",
        "Inner Wrist",
        "Your Choice",
      ],
      actionFaces: [
        "Lick",
        "Gentle Bite",
        "Blow",
        "Grab",
        "Trace with Finger",
        "Pet",
        "Pinch",
        "Kiss and Suck",
        "Lick and Suck",
        "Suck",
        "Kiss",
        "Tease",
        "Your Choice",
      ],
      isRolling: false,
      currentResult: "",
      rollHistory: [],
      secondsLeft: 60,
      timerInterval: null,
      timerPercent: 100,
    };
  },
  methods: {
    rollDice() {
      this.isRolling = true;
      this.currentResult = "";

      setTimeout(() => {
        const bodyIndex = Math.floor(Math.random() * 6);
        const actionIndex = Math.floor(Math.random() * 6);

        const bodyResult = this.bodyFaces[bodyIndex];
        const actionResult = this.actionFaces[actionIndex];

        this.currentResult = `${actionResult} ${bodyResult} for 60 seconds`;

        if (bodyIndex === 0 && actionIndex === 0) {
          this.currentResult += " (Snake Eyes! Switch roles immediately)";
        } else if (bodyIndex === actionIndex) {
          this.currentResult +=
            " (Matching numbers! Repeat for 2 minutes + remove clothing)";
        }

        this.rollHistory.unshift({
          body: bodyResult,
          action: actionResult,
          result: this.currentResult,
        });

        this.startTimer();
        this.isRolling = false;
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
  },
  beforeUnmount() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
    }
  },
};
</script>

<style>
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
.animate-shake {
  animation: shake 0.5s;
}
.backface-hidden {
  backface-visibility: hidden;
}
</style>
