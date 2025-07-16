<template>
  <div
    class="min-h-screen bg-gradient-to-br from-purple-900 to-indigo-800 text-white p-4"
  >
    <header class="text-center mb-8">
      <h1 class="text-4xl font-bold mb-2">🍻 Do or Drink</h1>
      <p class="text-purple-200">Where challenges meet consequences</p>
    </header>

    <div
      class="max-w-2xl mx-auto bg-white/10 backdrop-blur-lg rounded-2xl p-6 shadow-2xl border border-white/20"
    >
      <!-- Game Settings Toggle -->
      <div class="mb-6">
        <button
          @click="showSettings = !showSettings"
          class="text-sm bg-black/30 hover:bg-black/50 px-3 py-1 rounded-full flex items-center gap-1"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
            />
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>
          Game Settings
        </button>

        <div
          v-if="showSettings"
          class="mt-2 p-4 bg-black/20 rounded-lg border border-white/10"
        >
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm mb-1">Drink Amount</label>
              <select
                v-model="baseDrinkAmount"
                class="w-full bg-white/10 border border-white/20 rounded px-2 py-1 text-sm"
              >
                <option value="1">1 sip</option>
                <option value="2">2 sips</option>
                <option value="3">3 sips</option>
                <option value="shot">1 shot</option>
                <option value="glass">Full glass</option>
              </select>
            </div>

            <div>
              <label class="block text-sm mb-1">Game Mode</label>
              <select
                v-model="gameMode"
                class="w-full bg-white/10 border border-white/20 rounded px-2 py-1 text-sm"
              >
                <option value="individual">Individual</option>
                <option value="teams">Teams</option>
                <option value="elimination">Elimination</option>
              </select>
            </div>
          </div>

          <div class="mt-3">
            <label class="flex items-center space-x-2">
              <input
                type="checkbox"
                v-model="enableHouseRules"
                class="rounded bg-white/10 border-white/20"
              />
              <span class="text-sm">Enable House Rules</span>
            </label>
          </div>

          <div v-if="enableHouseRules" class="mt-2">
            <label class="block text-sm mb-1">Custom Rules</label>
            <textarea
              v-model="houseRules"
              placeholder="Enter your custom house rules..."
              class="w-full bg-white/10 border border-white/20 rounded px-2 py-1 text-sm h-20"
            ></textarea>
          </div>
        </div>
      </div>

      <!-- Player Info -->
      <div
        class="flex justify-between items-center mb-6 p-4 bg-white/5 rounded-xl"
      >
        <div>
          <h3 class="font-semibold">Current Turn:</h3>
          <p class="text-xl">
            {{ currentPlayer?.name }} ({{
              currentPlayer?.gender === "male" ? "♂" : "♀"
            }})
          </p>
        </div>
        <div class="text-right">
          <h3 class="font-semibold">Drinks Taken:</h3>
          <p class="text-xl">{{ currentPlayer?.drinks || 0 }} 🍺</p>
        </div>
      </div>

      <!-- Main Game Card -->
      <div
        class="relative w-full h-64 mb-8 cursor-pointer perspective-1000"
        @click="flipCard"
      >
        <div
          class="relative w-full h-full transition-transform duration-700 transform-style-preserve-3d"
          :class="{ 'rotate-y-180': cardFlipped }"
        >
          <!-- Front of Card -->
          <div
            class="absolute w-full h-full backface-hidden rounded-2xl flex flex-col justify-center items-center p-6 shadow-lg border-2 border-white/20"
            :class="cardColor"
          >
            <div class="text-center">
              <p class="text-2xl font-bold mb-2">Do or Drink</p>
              <p v-if="!currentCard">Click 'Draw Card' to begin</p>
              <p v-else>
                Level {{ currentCard?.intensity }} Challenge
                <span class="block text-sm mt-1"
                  >{{ currentCard?.drinkAmount }} penalty</span
                >
              </p>
            </div>
          </div>

          <!-- Back of Card -->
          <div
            class="absolute w-full h-full backface-hidden bg-white text-gray-900 rounded-2xl flex flex-col justify-center items-center p-6 shadow-lg rotate-y-180 border-2 border-white/20"
          >
            <div v-if="currentCard" class="text-center">
              <span
                class="font-bold text-lg px-3 py-1 rounded-full mb-2"
                :class="intensityClass"
              >
                Level {{ currentCard.intensity }}
              </span>
              <p class="text-xl font-medium mt-2">{{ currentCard.text }}</p>
              <p v-if="currentCard.target" class="text-sm mt-2 text-gray-600">
                To: {{ currentCard.target.name }} ({{
                  currentCard.target.gender === "male" ? "♂" : "♀"
                }})
              </p>
              <p class="mt-3 font-semibold text-red-600">
                Penalty: {{ currentCard.drinkAmount }}
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="grid grid-cols-2 gap-4 mb-6">
        <button
          @click="drawCard"
          class="bg-blue-600 hover:bg-blue-700 py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2 disabled:bg-gray-500 disabled:cursor-not-allowed"
          :disabled="isDrawing || currentCard"
        >
          <svg
            v-if="isDrawing"
            class="animate-spin h-5 w-5"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              class="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              stroke-width="4"
            ></circle>
            <path
              class="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          {{ isDrawing ? "Generating..." : "Draw Card" }}
        </button>
        <button
          @click="completeChallenge"
          class="bg-green-600 hover:bg-green-700 py-3 rounded-xl font-bold transition-all disabled:bg-gray-500 disabled:cursor-not-allowed"
          :disabled="!currentCard || !cardFlipped"
        >
          Completed
        </button>
      </div>

      <!-- Drink Button -->
      <button
        v-if="currentCard && cardFlipped"
        @click="takeDrink"
        class="w-full mb-6 bg-red-600 hover:bg-red-700 py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="h-5 w-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M20.618 5.984A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016zM12 9v2m0 4h.01"
          />
        </svg>
        Take Drink Instead ({{ currentCard.drinkAmount }})
      </button>

      <!-- Hesitation Timer -->
      <div class="mb-6">
        <div class="flex justify-between mb-1">
          <span>Hesitation Timer:</span>
          <span>{{ hesitationTime }}s remaining</span>
        </div>
        <div class="w-full h-2 bg-white/20 rounded-full overflow-hidden">
          <div
            class="h-full bg-pink-500 transition-all duration-1000 ease-linear"
            :style="{ width: hesitationPercent + '%' }"
          ></div>
        </div>
      </div>

      <!-- Game Log -->
      <div class="bg-white/5 rounded-xl p-4 max-h-40 overflow-y-auto">
        <h3 class="font-semibold mb-2">Game Log</h3>
        <ul class="space-y-1 text-sm">
          <li
            v-for="(log, index) in gameHistory"
            :key="index"
            class="py-1 border-b border-white/10"
          >
            {{ log }}
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onBeforeUnmount } from "vue";

const OPENAI_API_KEY =
  "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"; 
const OPENAI_API_URL = "https://api.openai.com/v1/chat/completions";

// Game Settings
const showSettings = ref(false);
const baseDrinkAmount = ref("2");
const gameMode = ref("individual");
const enableHouseRules = ref(false);
const houseRules = ref("");

// Players
const players = ref([
  { id: 1, name: "Player 1", gender: "male", drinks: 0 },
  { id: 2, name: "Player 2", gender: "female", drinks: 0 },
]);

// Game State
const currentPlayerIndex = ref(0);
const currentCard = ref(null);
const cardFlipped = ref(false);
const gameHistory = ref([]);
const hesitationTime = ref(15);
const hesitationTimer = ref(null);
const hesitationPercent = ref(100);
const isDrawing = ref(false);

const currentPlayer = computed(() => players.value[currentPlayerIndex.value]);

const cardColor = computed(() => {
  if (!currentCard.value) return "bg-gradient-to-br from-gray-600 to-gray-700";
  switch (currentCard.value.intensity) {
    case 1:
      return "bg-gradient-to-br from-green-600 to-teal-600";
    case 2:
      return "bg-gradient-to-br from-yellow-600 to-orange-600";
    case 3:
      return "bg-gradient-to-br from-red-600 to-pink-600";
    default:
      return "bg-gradient-to-br from-gray-600 to-gray-700";
  }
});

const intensityClass = computed(() => {
  if (!currentCard.value) return "";
  switch (currentCard.value.intensity) {
    case 1:
      return "bg-green-100 text-green-800";
    case 2:
      return "bg-yellow-100 text-yellow-800";
    case 3:
      return "bg-red-100 text-red-800";
    default:
      return "";
  }
});

const getValidTargets = () => {
  return players.value.filter((p) => p.id !== currentPlayer.value.id);
};

const generateChallenge = async () => {
  const intensity = Math.floor(Math.random() * 3) + 1; // 1-3
  const isGroupChallenge = Math.random() > 0.7;
  const hasTarget = !isGroupChallenge && Math.random() > 0.5;
  const target = hasTarget
    ? getValidTargets()[Math.floor(Math.random() * getValidTargets().length)]
    : null;

  // Determine drink amount based on intensity
  let drinkAmount;
  switch (intensity) {
    case 1:
      drinkAmount =
        baseDrinkAmount.value === "shot"
          ? "1 shot"
          : baseDrinkAmount.value === "glass"
          ? "half glass"
          : `${baseDrinkAmount.value} sip${
              baseDrinkAmount.value > 1 ? "s" : ""
            }`;
      break;
    case 2:
      drinkAmount =
        baseDrinkAmount.value === "shot"
          ? "2 shots"
          : baseDrinkAmount.value === "glass"
          ? "full glass"
          : `${baseDrinkAmount.value * 2} sips`;
      break;
    case 3:
      drinkAmount =
        baseDrinkAmount.value === "shot"
          ? "3 shots"
          : baseDrinkAmount.value === "glass"
          ? "2 full glasses"
          : `${baseDrinkAmount.value * 3} sips`;
      break;
  }

  try {
    let prompt;
    if (isGroupChallenge) {
      prompt = `Generate a level ${intensity} (1=easy, 3=hard) group challenge for a drinking game where players must either complete the challenge or drink. Make it fun, social, and slightly embarrassing. For level ${intensity}, the penalty should be ${drinkAmount}. Examples: "Do a silly dance" or "Sing a song". Make it 1 sentence, max 15 words. Just the challenge, no quotes.`;
    } else if (hasTarget && intensity === 3) {
      // More intimate dares for high intensity with target
      prompt = `Generate a sexy level 3 challenge for a ${currentPlayer.value.gender} to perform with a ${target.gender} in a drinking game. It should involve physical contact, kissing, or something intimate. The penalty for refusing is ${drinkAmount}. Make it 1 sentence, max 15 words. Just the challenge, no quotes.`;
    } else if (hasTarget) {
      prompt = `Generate a level ${intensity} challenge for a ${currentPlayer.value.gender} to do with a ${target.gender} in a drinking game. The penalty for refusing is ${drinkAmount}. Make it social and fun. 1 sentence, max 15 words. Just the challenge, no quotes.`;
    } else {
      prompt = `Generate a level ${intensity} personal challenge for a drinking game where the player must either do the challenge or drink ${drinkAmount}. Make it fun and slightly embarrassing. 1 sentence, max 15 words. Just the challenge, no quotes.`;
    }

    const response = await fetch(OPENAI_API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: prompt }],
        temperature: intensity === 3 ? 0.9 : 0.7,
        max_tokens: 50,
      }),
    });

    if (!response.ok) throw new Error(`API Error: ${response.statusText}`);
    const data = await response.json();
    const challengeText = data.choices[0].message.content.trim();

    return {
      text: challengeText,
      intensity,
      drinkAmount,
      target: hasTarget ? target : null,
      isGroup: isGroupChallenge,
    };
  } catch (error) {
    console.error("AI Error:", error);
    // Fallback challenges
    const fallbacks = [
      {
        text: "Do your best impression of a celebrity",
        intensity: 1,
        drinkAmount: "1 sip",
        target: null,
      },
      {
        text: "Let someone give you a lap dance for 15 seconds",
        intensity: 2,
        drinkAmount: "2 sips",
        target: getValidTargets()[0],
      },
      {
        text: "Kiss the person to your right passionately for 10 seconds",
        intensity: 3,
        drinkAmount: "3 sips",
        target: getValidTargets()[0],
      },
    ];
    return fallbacks[intensity - 1];
  }
};

const drawCard = async () => {
  if (isDrawing.value || currentCard.value) return;

  isDrawing.value = true;
  cardFlipped.value = false;

  try {
    const challenge = await generateChallenge();
    currentCard.value = challenge;
  } catch (error) {
    console.error("Error generating challenge:", error);
    currentCard.value = {
      text: "Do 10 pushups or take a drink",
      intensity: 1,
      drinkAmount: "1 sip",
      target: null,
    };
  } finally {
    isDrawing.value = false;
  }
};

const flipCard = () => {
  if (currentCard.value && !isDrawing.value) {
    cardFlipped.value = !cardFlipped.value;
    if (cardFlipped.value) {
      startHesitationTimer();
    } else {
      clearInterval(hesitationTimer.value);
    }
  }
};

const startHesitationTimer = () => {
  clearInterval(hesitationTimer.value);
  hesitationTime.value = 15;
  hesitationPercent.value = 100;

  hesitationTimer.value = setInterval(() => {
    hesitationTime.value--;
    hesitationPercent.value = (hesitationTime.value / 15) * 100;

    if (hesitationTime.value <= 0) {
      clearInterval(hesitationTimer.value);
      gameHistory.value.unshift(
        `${currentPlayer.value.name} hesitated too long! Penalty applied.`
      );
      applyPenalty();
      nextTurn();
    }
  }, 1000);
};

const completeChallenge = () => {
  if (!currentCard.value) return;
  clearInterval(hesitationTimer.value);
  gameHistory.value.unshift(
    `${currentPlayer.value.name} completed: ${currentCard.value.text}`
  );

  // In team mode, maybe give drinks to other team?
  nextTurn();
};

const takeDrink = () => {
  if (!currentCard.value) return;
  clearInterval(hesitationTimer.value);

  // Parse drink amount
  let drinkCount = 0;
  if (currentCard.value.drinkAmount.includes("shot")) {
    drinkCount = parseInt(currentCard.value.drinkAmount) || 1;
  } else if (currentCard.value.drinkAmount.includes("sip")) {
    drinkCount = parseInt(currentCard.value.drinkAmount) || 1;
  } else if (currentCard.value.drinkAmount.includes("glass")) {
    drinkCount = 2; // Count a glass as 2 drinks
  }

  players.value[currentPlayerIndex.value].drinks += drinkCount;

  gameHistory.value.unshift(
    `${currentPlayer.value.name} drank instead: ${currentCard.value.drinkAmount}`
  );

  if (
    gameMode.value === "elimination" &&
    players.value[currentPlayerIndex.value].drinks >= 10
  ) {
    gameHistory.value.unshift(
      `🚨 ${currentPlayer.value.name} is eliminated after 10 drinks!`
    );
    players.value.splice(currentPlayerIndex.value, 1);
    if (players.value.length === 1) {
      gameHistory.value.unshift(`🏆 ${players.value[0].name} wins the game!`);
    }
  }

  nextTurn();
};

const applyPenalty = () => {
  // For hesitation penalty, make them drink double
  let penaltyAmount;
  switch (currentCard.value.intensity) {
    case 1:
      penaltyAmount =
        baseDrinkAmount.value === "shot"
          ? "2 shots"
          : baseDrinkAmount.value === "glass"
          ? "full glass"
          : `${baseDrinkAmount.value * 2} sips`;
      break;
    case 2:
      penaltyAmount =
        baseDrinkAmount.value === "shot"
          ? "3 shots"
          : baseDrinkAmount.value === "glass"
          ? "2 full glasses"
          : `${baseDrinkAmount.value * 3} sips`;
      break;
    case 3:
      penaltyAmount =
        baseDrinkAmount.value === "shot"
          ? "4 shots"
          : baseDrinkAmount.value === "glass"
          ? "3 full glasses"
          : `${baseDrinkAmount.value * 4} sips`;
      break;
  }

  // Parse penalty amount
  let penaltyCount = 0;
  if (penaltyAmount.includes("shot")) {
    penaltyCount = parseInt(penaltyAmount) || 2;
  } else if (penaltyAmount.includes("sip")) {
    penaltyCount = parseInt(penaltyAmount) || 2;
  } else if (penaltyAmount.includes("glass")) {
    penaltyCount = 3; // Count a glass as 2 drinks
  }

  players.value[currentPlayerIndex.value].drinks += penaltyCount;

  if (
    gameMode.value === "elimination" &&
    players.value[currentPlayerIndex.value].drinks >= 10
  ) {
    gameHistory.value.unshift(
      `🚨 ${currentPlayer.value.name} is eliminated after 10 drinks!`
    );
    players.value.splice(currentPlayerIndex.value, 1);
    if (players.value.length === 1) {
      gameHistory.value.unshift(`🏆 ${players.value[0].name} wins the game!`);
    }
  }
};

const nextTurn = () => {
  currentCard.value = null;
  cardFlipped.value = false;
  hesitationPercent.value = 100;
  hesitationTime.value = 15;
  clearInterval(hesitationTimer.value);

  if (players.value.length === 0) return;

  currentPlayerIndex.value =
    (currentPlayerIndex.value + 1) % players.value.length;
};

onBeforeUnmount(() => {
  clearInterval(hesitationTimer.value);
});
</script>

<style>
/* Custom 3D Card Styles */
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

/* Smooth transitions */
button,
div {
  transition: all 0.3s ease;
}

/* Scrollbar styling */
::-webkit-scrollbar {
  width: 6px;
}
::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 3px;
}
::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.3);
  border-radius: 3px;
}

/* Custom animations */
@keyframes pulse {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
  100% {
    transform: scale(1);
  }
}

.pulse:hover {
  animation: pulse 1.5s infinite;
}
</style>
