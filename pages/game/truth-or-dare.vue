<template>
  <div
    class="min-h-screen bg-gradient-to-br from-purple-900 to-indigo-800 text-white p-4"
  >
    <header class="text-center mb-8">
      <h1 class="text-4xl font-bold mb-2">🔥 Strip Truth or Dare</h1>
      <p class="text-purple-200">Where intimacy meets adventure</p>
    </header>

    <div
      class="max-w-2xl mx-auto bg-white/10 backdrop-blur-lg rounded-2xl p-6 shadow-2xl border border-white/20"
    >
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
          <h3 class="font-semibold">Level:</h3>
          <p class="text-xl">Intimacy Level {{ gameLevel }}</p>
        </div>
      </div>

      <div class="mb-8">
        <h3 class="font-semibold mb-3">Clothing Status:</h3>
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
        class="relative w-full h-64 mb-8 cursor-pointer perspective-1000"
        @click="flipCard"
      >
        <div
          class="relative w-full h-full transition-transform duration-700 transform-style-preserve-3d"
          :class="{ 'rotate-y-180': cardFlipped }"
        >
          <div
            class="absolute w-full h-full backface-hidden bg-gradient-to-br from-pink-600 to-purple-600 rounded-2xl flex flex-col justify-center items-center p-6 shadow-lg border-2 border-white/20"
          >
            <div class="text-center">
              <p class="text-2xl font-bold mb-2">Truth or Dare?</p>
              <p v-if="!currentCard">Click 'Draw Card' to begin</p>
              <p v-else>Click to reveal</p>
            </div>
          </div>

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
              <p v-if="currentCard.target" class="text-sm mt-2 text-gray-600">
                To: {{ currentCard.target.name }} ({{
                  currentCard.target.gender === "male" ? "♂" : "♀"
                }})
              </p>
            </div>
          </div>
        </div>
      </div>

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

// ======================
// OPENAI API CONFIGURATION
// ======================
// Replace with your actual OpenAI API key
const OPENAI_API_KEY =
  "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"; // 👈 Add your key here
const OPENAI_API_URL = "https://api.openai.com/v1/chat/completions";

// ======================
// GAME STATE
// ======================
const players = ref([
  { id: "p1", name: "Player 1", gender: "male", itemsRemoved: 0 },
  { id: "p2", name: "Player 2", gender: "female", itemsRemoved: 0 },
]);

const currentPlayerIndex = ref(0);
const currentCard = ref(null);
const cardFlipped = ref(false);
const gameHistory = ref([]);
const hesitationTime = ref(30);
const hesitationTimer = ref(null);
const hesitationPercent = ref(100);
const gameLevel = ref(1);
const restrictions = ref([]);
const isDrawing = ref(false);

const clothingItems = ref([
  { name: "Shirt", removed: false },
  { name: "Pants", removed: false },
  { name: "Underwear", removed: false },
  { name: "Socks", removed: false },
  { name: "Accessories", removed: false },
]);

// ======================
// COMPUTED PROPERTIES
// ======================
const currentPlayer = computed(() => players.value[currentPlayerIndex.value]);
const remainingClothing = computed(
  () => clothingItems.value.filter((item) => !item.removed).length
);

// ======================
// OPENAI AI FUNCTIONS
// ======================
const generateTruth = async () => {
  const prompt = `You are a creative assistant for a truth or dare game. Generate one intimate but tasteful truth question for a couple. It should be playful and slightly explicit. The question must be a maximum of 15 words. Just provide the question, nothing else.`;

  try {
    const response = await fetch(OPENAI_API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.8,
        max_tokens: 50,
      }),
    });
    if (!response.ok) throw new Error(`API Error: ${response.statusText}`);
    const data = await response.json();
    return data.choices[0].message.content.trim();
  } catch (error) {
    console.error("AI Error (Truth):", error);
    return fallbackTruths[Math.floor(Math.random() * fallbackTruths.length)];
  }
};

const generateDare = async (fromGender, toGender) => {
  const prompt = `You are a creative assistant for a truth or dare game. Generate a sensual dare for a ${fromGender} to perform on a ${toGender}.Turn up the heat each time. do not/ never repeat dares It must be tasteful, fun, and a maximum of 15 words. Just provide the dare, nothing else.`;

  try {
    const response = await fetch(OPENAI_API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.8,
        max_tokens: 50,
      }),
    });
    if (!response.ok) throw new Error(`API Error: ${response.statusText}`);
    const data = await response.json();
    return data.choices[0].message.content.trim();
  } catch (error) {
    console.error("AI Error (Dare):", error);
    return fallbackDares[Math.floor(Math.random() * fallbackDares.length)];
  }
};

// Fallback content if AI fails
const fallbackTruths = [
  "What's your favorite memory of us being intimate?",
  "Where's the most unusual place you've felt turned on?",
  "What's one thing you'd like to try but haven't asked for?",
];

const fallbackDares = [
  "Give your partner a 30-second neck massage.",
  "Whisper something sexy in your partner's ear.",
  "Let your partner remove one accessory you are wearing.",
];

// ======================
// GAME LOGIC
// ======================
const getValidTargets = () => {
  return players.value.filter((p) => p.id !== currentPlayer.value.id);
};

const drawCard = async () => {
  if (isDrawing.value || currentCard.value) return;

  isDrawing.value = true;
  cardFlipped.value = false;

  try {
    const validTargets = getValidTargets();
    const isDare = validTargets.length > 0 && Math.random() > 0.5;

    let cardData = {};

    if (isDare) {
      const target =
        validTargets[Math.floor(Math.random() * validTargets.length)];
      const dareText = await generateDare(
        currentPlayer.value.gender,
        target.gender
      );
      cardData = { type: "DARE", text: dareText, target: target };
    } else {
      const truthText = await generateTruth();
      cardData = { type: "TRUTH", text: truthText, target: null };
    }

    currentCard.value = cardData;
  } catch (error) {
    console.error("Error drawing card:", error);
    currentCard.value = {
      type: "TRUTH",
      text: "Something went wrong. Tell a secret.",
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
  hesitationTime.value = 30;
  hesitationPercent.value = 100;

  hesitationTimer.value = setInterval(() => {
    hesitationTime.value--;
    hesitationPercent.value = (hesitationTime.value / 30) * 100;

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
  nextTurn();
};

const applyPenalty = () => {
  if (gameLevel.value === 1) {
    const remainingItems = clothingItems.value.filter((item) => !item.removed);
    if (remainingItems.length > 0) {
      const itemToDrop = remainingItems[0];
      const itemIndex = clothingItems.value.findIndex(
        (i) => i.name === itemToDrop.name
      );
      clothingItems.value[itemIndex].removed = true;
      gameHistory.value.unshift(
        `PENALTY: ${currentPlayer.value.name} removed ${itemToDrop.name}.`
      );

      if (remainingClothing.value <= 2) {
        gameLevel.value = 2;
        gameHistory.value.unshift(
          "LEVEL UP! Now hesitation adds restrictions."
        );
      }
    }
  } else if (gameLevel.value === 2) {
    const newRestrictions = [
      "No using hands",
      "Must keep eyes closed",
      "Speak in whispers only",
      "Stay within 1 foot of partner",
    ];
    const restriction =
      newRestrictions[Math.floor(Math.random() * newRestrictions.length)];
    restrictions.value.push(restriction);
    gameHistory.value.unshift(
      `PENALTY: ${currentPlayer.value.name} got a restriction: ${restriction}`
    );

    if (restrictions.value.length >= 2) {
      gameLevel.value = 3;
      gameHistory.value.unshift(
        "FINAL LEVEL! Dare refusal is an instant forfeit!"
      );
    }
  } else {
    gameHistory.value.unshift(
      `PENALTY: ${currentPlayer.value.name} must accept a forfeit! Game Over?`
    );
  }
};

const nextTurn = () => {
  currentCard.value = null;
  cardFlipped.value = false;
  hesitationPercent.value = 100;
  hesitationTime.value = 30;
  clearInterval(hesitationTimer.value);
  currentPlayerIndex.value =
    (currentPlayerIndex.value + 1) % players.value.length;
};

const toggleClothing = (index) => {
  if (!clothingItems.value[index].removed) {
    clothingItems.value[index].removed = true;
    gameHistory.value.unshift(
      `${currentPlayer.value.name} chose to remove ${clothingItems.value[index].name}.`
    );
  }
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
</style>
