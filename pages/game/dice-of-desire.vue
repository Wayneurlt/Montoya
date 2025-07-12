<template>
  <!-- Main Container -->
  <div
    class="min-h-screen bg-gradient-to-br from-rose-900 to-fuchsia-900 text-white p-4"
  >
    <!-- Rules Modal -->
    <div
      v-if="showRules"
      class="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
    >
      <div
        class="bg-gradient-to-br from-purple-900 to-rose-900 rounded-2xl p-6 max-w-md w-full shadow-2xl border border-white/20"
      >
        <h2 class="text-3xl font-bold mb-4 text-center">🎲 Dice of Desire</h2>

        <div class="space-y-4 mb-6">
          <div class="bg-white/10 p-4 rounded-xl">
            <h3 class="font-bold text-lg mb-2">Gender Rules</h3>
            <ul class="list-disc pl-5 space-y-1">
              <li>Men only roll for women</li>
              <li>Women only roll for men</li>
              <li>Same-gender rolls automatically reroll</li>
            </ul>
          </div>

          <div class="bg-white/10 p-4 rounded-xl">
            <h3 class="font-bold text-lg mb-2">Game Rules</h3>
            <ul class="list-disc pl-5 space-y-1">
              <li><strong>Roll both dice</strong> for a 60-second command</li>
              <li><strong>"Your Choice"</strong> = Partner picks the action</li>
              <li>
                <strong>Matching numbers</strong> = 2 minutes + remove clothing
              </li>
              <li>
                <strong>Snake eyes (⚀⚀)</strong> = Immediately switch roles
              </li>
            </ul>
          </div>
        </div>

        <button
          @click="startGame"
          class="w-full bg-pink-600 hover:bg-pink-700 py-3 rounded-xl font-bold transition-all"
        >
          I Understand - Start Game
        </button>
      </div>
    </div>

    <!-- Game Board -->
    <div v-else class="max-w-2xl mx-auto">
      <!-- Player Status -->
      <div
        class="flex justify-between items-center mb-6 p-4 bg-white/10 rounded-xl backdrop-blur-sm"
      >
        <div>
          <h3 class="font-semibold">Current Roller:</h3>
          <p class="text-xl">
            {{ currentPlayer.name }} ({{
              currentPlayer.gender === "male" ? "♂" : "♀"
            }})
          </p>
        </div>
        <div>
          <h3 class="font-semibold">Target:</h3>
          <p class="text-xl">
            {{ targetPlayer.name }} ({{
              targetPlayer.gender === "male" ? "♂" : "♀"
            }})
          </p>
        </div>
      </div>

      <!-- Dice Area -->
      <div
        class="relative bg-white/10 rounded-2xl p-8 mb-8 backdrop-blur-sm border border-white/20"
      >
        <div class="flex justify-center gap-8 mb-8">
          <!-- Body Part Die -->
          <div
            @click="rollDice"
            class="w-24 h-24 bg-white rounded-xl shadow-lg flex justify-center items-center cursor-pointer transition-transform hover:scale-105 px-4"
            :class="{ 'animate-spin': isRolling }"
          >
            <div v-if="!isRolling" class="text-center">
              <p class="text-sm text-gray-800">Body Part</p>
              <p class="text-xl font-bold text-black">
                {{ currentRoll.body || "?" }}
              </p>
            </div>
          </div>

          <!-- Action Die -->
          <div
            @click="rollDice"
            class="w-24 h-24 bg-white rounded-xl shadow-lg flex justify-center items-center cursor-pointer transition-transform hover:scale-105"
            :class="{ 'animate-spin': isRolling }"
          >
            <div v-if="!isRolling" class="text-center">
              <p class="text-sm text-gray-800">Action</p>
              <p class="text-xl font-bold text-black">
                {{ currentRoll.action || "?" }}
              </p>
            </div>
          </div>
        </div>

        <button
          @click="rollDice"
          :disabled="isRolling || isTimerRunning"
          class="w-full bg-pink-600 hover:bg-pink-700 py-4 rounded-xl font-bold text-lg transition-all disabled:bg-gray-600 disabled:cursor-not-allowed"
        >
          {{ isRolling ? "Rolling..." : "Roll Dice" }}
        </button>
      </div>

      <!-- Result Display -->
      <div
        v-if="currentResult"
        class="bg-white/10 rounded-2xl p-6 mb-8 backdrop-blur-sm border border-white/20"
      >
        <h3 class="text-xl font-bold mb-4 text-center">Your Command</h3>
        <div class="bg-white/20 rounded-lg p-4 mb-6">
          <p class="text-2xl font-bold text-center">{{ currentResult }}</p>
          <p
            v-if="specialEffect"
            class="text-center mt-2 text-pink-300 font-semibold"
          >
            {{ specialEffect }}
          </p>
        </div>

        <!-- Timer -->
        <div class="flex flex-col items-center">
          <div class="relative w-32 h-32 mb-4">
            <svg class="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
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
              class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-2xl font-bold"
            >
              {{ secondsLeft }}s
            </span>
          </div>

          <div class="flex gap-4">
            <button
              @click="completeAction"
              class="bg-green-600 hover:bg-green-700 px-6 py-2 rounded-lg font-medium"
            >
              Completed
            </button>
            <button
              @click="failAction"
              class="bg-red-600 hover:bg-red-700 px-6 py-2 rounded-lg font-medium"
            >
              Failed
            </button>
          </div>
        </div>
      </div>

      <!-- History -->
      <div
        class="bg-white/10 rounded-2xl p-6 backdrop-blur-sm border border-white/20"
      >
        <h3 class="text-xl font-bold mb-4">Game History</h3>
        <ul class="space-y-3 max-h-60 overflow-y-auto pr-2">
          <li
            v-for="(item, index) in history"
            :key="index"
            class="pb-3 border-b border-white/10 last:border-0"
          >
            <p class="font-semibold">{{ item.roller }} → {{ item.target }}:</p>
            <p>{{ item.result }}</p>
            <p v-if="item.special" class="text-pink-300 text-sm">
              {{ item.special }}
            </p>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup>
// ======================
// GAME CONFIGURATION
// ======================
// Add your OpenAI API key here
const OPENAI_API_KEY =
  "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"; // Replace with your actual API key

const bodyParts = [
  "Lips",
  "Neck",
  "Earlobe",
  "Inner Thigh",
  "Breasts",
  "Below Navel",
  "Ass",
  "Nipples",
  "Boobs",
  "Your Choice",
];

const actions = [
  "Kiss",
  "Lick",
  "Massage",
  "Blow",
  "Caress",
  "Pinch",
  "Tease",
  "Suck",
  "Gentle Bite",
  "Grab",
  "Trace with Finger",
  "Kiss and Suck",
  "Lick and Suck",
  "Your Choice",
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
const history = ref([]);

const currentPlayer = computed(() => players.value[currentPlayerIndex.value]);

const targetPlayer = computed(() => {
  // Always return the opposite gender player
  return players.value.find((p) => p.gender !== currentPlayer.value.gender);
});

const startGame = () => {
  showRules.value = false;
};

const validateCombination = async (action, bodyPart) => {
  if (action === "Your Choice" || bodyPart === "Your Choice") return true;

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content:
              "You are an intimacy advisor for a couples game. Determine if this action/body part combination makes sense for intimate play between consenting adults. Respond only with 'true' or 'false'.",
          },
          {
            role: "user",
            content: `Does "${action} ${bodyPart}" make sense as an intimate action between partners?`,
          },
        ],
        temperature: 0.7,
        max_tokens: 1,
      }),
    });

    const data = await response.json();
    const isValid =
      data.choices?.[0]?.message?.content?.toLowerCase() === "true";
    return isValid;
  } catch (error) {
    console.error("Error validating combination:", error);
    // If API fails, allow the combination by default
    return true;
  }
};

const rollDice = async () => {
  if (isRolling.value) return;

  isRolling.value = true;
  currentResult.value = "";
  specialEffect.value = "";

  let validCombination = false;
  let attempts = 0;
  const maxAttempts = 10; // Prevent infinite loops

  while (!validCombination && attempts < maxAttempts) {
    attempts++;

    const bodyIndex = Math.floor(Math.random() * bodyParts.length);
    const actionIndex = Math.floor(Math.random() * actions.length);

    const bodyPart = bodyParts[bodyIndex];
    const action = actions[actionIndex];

    // Skip validation for "Your Choice" options
    if (bodyPart === "Your Choice" || action === "Your Choice") {
      validCombination = true;
      currentRoll.value = { body: bodyPart, action: action };
      break;
    }

    // Validate the combination
    validCombination = await validateCombination(action, bodyPart);

    if (validCombination) {
      currentRoll.value = { body: bodyPart, action: action };
    }
  }

  // If we couldn't find a valid combination after max attempts, use the last one
  if (!validCombination) {
    const bodyIndex = Math.floor(Math.random() * bodyParts.length);
    const actionIndex = Math.floor(Math.random() * actions.length);
    currentRoll.value = {
      body: bodyParts[bodyIndex],
      action: actions[actionIndex],
    };
  }

  // Check for special effects
  const bodyIndex = bodyParts.indexOf(currentRoll.value.body);
  const actionIndex = actions.indexOf(currentRoll.value.action);

  if (bodyIndex === 0 && actionIndex === 0) {
    specialEffect.value = "Snake Eyes! Switch roles immediately";
    switchRoles();
  } else if (bodyIndex === actionIndex) {
    specialEffect.value = "Matching! 2 minutes + remove clothing";
  }

  currentResult.value = `${currentRoll.value.action} ${currentRoll.value.body}`;
  startTimer();

  // Log to history
  history.value.unshift({
    roller: currentPlayer.value.name,
    target: targetPlayer.value.name,
    result: currentResult.value,
    special: specialEffect.value,
  });

  isRolling.value = false;
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
    }
  }, 1000);
};

const switchRoles = () => {
  currentPlayerIndex.value =
    (currentPlayerIndex.value + 1) % players.value.length;
};

const completeAction = () => {
  clearInterval(timer.value);
  isTimerRunning.value = false;
  history.value[0].result += " ✔️";
};

const failAction = () => {
  clearInterval(timer.value);
  isTimerRunning.value = false;
  history.value[0].result += " ❌";
  // Add penalty logic here if needed
};

// Cleanup
onBeforeUnmount(() => {
  clearInterval(timer.value);
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
