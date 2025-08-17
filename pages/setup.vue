<template>
  <div
    class="min-h-screen bg-gradient-to-br from-purple-900 via-indigo-800 to-fuchsia-900 text-white p-4 md:p-8 relative overflow-hidden"
  >
    <!-- Animated background elements -->
    <ClientOnly>
      <div class="absolute inset-0 opacity-10 pointer-events-none">
        <div
          v-for="i in 20"
          :key="i"
          class="absolute rounded-full bg-pink-500 animate-float"
          :style="`left: ${Math.random() * 100}%; top: ${Math.random() * 100}%; 
                     width: ${Math.random() * 10 + 2}px; height: ${
            Math.random() * 10 + 2
          }px;
                     animation-delay: ${Math.random() * 5}s;`"
        ></div>
      </div>
    </ClientOnly>

    <div
      class="max-w-2xl mx-auto bg-white/10 backdrop-blur-md rounded-xl p-6 md:p-8 shadow-2xl relative z-10"
    >
      <!-- Header -->
      <div class="text-center mb-8">
        <h1
          class="text-4xl md:text-5xl font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-pink-500 to-cyan-400"
        >
          Game Setup
        </h1>
        <p class="text-pink-200">Prepare for unforgettable moments</p>
      </div>

      <!-- Mode Selection -->
      <div class="mb-8 p-4 bg-white/5 rounded-xl border border-white/10">
        <h2 class="text-xl font-semibold mb-4 text-center">Game Mode</h2>
        <div class="flex justify-center">
          <div class="relative flex items-center bg-white/10 rounded-full p-1">
            <button
              @click="gameMode = 'free-for-all'"
              :class="{
                'bg-gradient-to-r from-pink-600 to-purple-600':
                  gameMode === 'free-for-all',
                'text-white/70': gameMode !== 'free-for-all',
              }"
              class="px-6 py-2 rounded-full text-sm font-medium transition-all duration-300 z-10 flex items-center gap-2"
            >
              <Icon icon="mdi:account-group" class="w-5 h-5" />
              Free-for-All
            </button>
            <button
              @click="gameMode = 'relationship'"
              :class="{
                'bg-gradient-to-r from-cyan-500 to-blue-600':
                  gameMode === 'relationship',
                'text-white/70': gameMode !== 'relationship',
              }"
              class="px-6 py-2 rounded-full text-sm font-medium transition-all duration-300 z-10 flex items-center gap-2"
            >
              <Icon icon="mdi:heart" class="w-5 h-5" />
              Relationship Mode
            </button>
            <div class="absolute inset-0 flex">
              <div
                class="w-1/2 h-full"
                :class="{ 'opacity-0': gameMode !== 'free-for-all' }"
              ></div>
              <div
                class="w-1/2 h-full"
                :class="{ 'opacity-0': gameMode !== 'relationship' }"
              ></div>
            </div>
          </div>
        </div>
        <p class="text-center mt-3 text-sm text-pink-200">
          {{
            gameMode === "free-for-all"
              ? "Dares can target anyone in the group"
              : "Dares will only target your partner"
          }}
        </p>
      </div>

      <!-- Player Inputs -->
      <div class="mb-6">
        <h2
          class="text-xl md:text-2xl font-semibold mb-4 text-center flex items-center justify-center gap-2"
        >
          <Icon icon="mdi:account-multiple" class="w-6 h-6" />
          Players
        </h2>

        <div
          v-for="(player, index) in players"
          :key="index"
          class="mb-4 p-4 bg-gradient-to-br from-white/5 to-white/10 rounded-xl border border-white/10 hover:border-pink-500/30 transition-all"
        >
          <div class="flex flex-col md:flex-row gap-3 md:items-center mb-3">
            <input
              v-model="players[index].name"
              placeholder="Enter nickname"
              class="flex-1 bg-white/20 rounded-lg p-3 focus:ring-2 focus:ring-pink-500 placeholder-white/50"
            />
            <button
              @click="removePlayer(index)"
              class="bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 text-white text-sm font-medium rounded-lg px-4 py-2 flex items-center justify-center gap-2"
              :disabled="players.length <= 2"
            >
              <Icon icon="mdi:trash-can-outline" class="w-4 h-4" />
              <span>Remove</span>
            </button>
          </div>

          <div class="flex flex-wrap gap-4 mb-3">
            <label class="flex items-center gap-2 cursor-pointer">
              <div class="relative">
                <input
                  type="radio"
                  v-model="players[index].gender"
                  value="male"
                  class="sr-only"
                />
                <div
                  class="h-5 w-5 rounded-full border-2 border-blue-400 flex items-center justify-center"
                >
                  <div
                    class="h-3 w-3 rounded-full bg-blue-400"
                    :class="{ 'opacity-0': players[index].gender !== 'male' }"
                  ></div>
                </div>
              </div>
              <span class="text-blue-300 flex items-center gap-1">
                <Icon icon="mdi:gender-male" class="w-4 h-4" />
                Male
              </span>
            </label>
            <label class="flex items-center gap-2 cursor-pointer">
              <div class="relative">
                <input
                  type="radio"
                  v-model="players[index].gender"
                  value="female"
                  class="sr-only"
                />
                <div
                  class="h-5 w-5 rounded-full border-2 border-pink-400 flex items-center justify-center"
                >
                  <div
                    class="h-3 w-3 rounded-full bg-pink-400"
                    :class="{ 'opacity-0': players[index].gender !== 'female' }"
                  ></div>
                </div>
              </div>
              <span class="text-pink-300 flex items-center gap-1">
                <Icon icon="mdi:gender-female" class="w-4 h-4" />
                Female
              </span>
            </label>
          </div>

          <!-- Partner Selection (Relationship Mode) -->
          <div v-if="gameMode === 'relationship'" class="mt-3">
            <label
              class="block text-sm text-white/70 mb-1  items-center gap-1"
            >
              <Icon icon="mdi:heart" class="w-4 h-4" />
              Partner:
            </label>
            <div class="relative">
              <select
                v-model="players[index].partnerId"
                class="w-full bg-white/20 rounded-lg p-2 text-sm focus:ring-2 focus:ring-pink-500 pr-8 appearance-none"
                :disabled="players.length < 2"
              >
                <option value="">Select partner</option>
                <option
                  v-for="(potentialPartner, partnerIndex) in players.filter(
                    (p) => p.id !== player.id
                  )"
                  :key="partnerIndex"
                  :value="potentialPartner.id"
                >
                  {{ potentialPartner.name || `Player ${partnerIndex + 1}` }}
                </option>
              </select>
              <Icon
                icon="mdi:chevron-down"
                class="absolute right-2 top-2.5 text-white/70 w-5 h-5 pointer-events-none"
              />
            </div>
          </div>
        </div>

        <button
          @click="addPlayer"
          class="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 rounded-lg py-3 mb-6 font-bold flex items-center justify-center gap-2"
        >
          <Icon icon="mdi:plus" class="w-5 h-5" />
          Add Player
        </button>
      </div>

      <!-- Game Selection -->
      <div class="mb-8">
        <h2
          class="text-xl md:text-2xl font-semibold mb-4 text-center flex items-center justify-center gap-2"
        >
          <Icon icon="mdi:gamepad-variant" class="w-6 h-6" />
          Choose Your Game
        </h2>
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <button
            v-for="game in availableGames"
            :key="game.value"
            @click="selectedGame = game.value"
            :class="{
              'border-pink-500 bg-white/20': selectedGame === game.value,
              'border-white/10 hover:border-pink-300':
                selectedGame !== game.value,
            }"
            class="p-4 border-2 rounded-xl transition-all flex flex-col items-center"
          >
            <div
              class="w-12 h-12 mb-3 flex items-center justify-center text-3xl"
            >
              <Icon :icon="game.icon" />
            </div>
            <span class="font-medium">{{ game.name }}</span>
            <span class="text-xs text-white/60 mt-1">{{
              game.description
            }}</span>
          </button>
        </div>
      </div>

      <!-- Start Game Button -->
      <button
        @click="startGame"
        :disabled="!canStart"
        class="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl py-4 font-bold text-lg shadow-lg hover:shadow-green-500/30 transition-all duration-300 relative overflow-hidden group flex items-center justify-center gap-2"
      >
        <Icon icon="mdi:play" class="w-6 h-6" />
        <span class="relative z-10">Start the Game</span>
        <span
          class="absolute inset-0 bg-gradient-to-r from-green-600 to-emerald-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-0"
        ></span>
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { Icon } from "@iconify/vue";
import { useAnalytics } from "~/composables/useAnalytics";

const gameMode = ref("free-for-all"); // 'free-for-all' or 'relationship'

const players = ref([
  { id: generateId(), name: "", gender: "male", partnerId: "" },
  { id: generateId(), name: "", gender: "female", partnerId: "" },
]);

const availableGames = ref([
  {
    value: "truth-or-dare",
    name: "Strip Truth or Dare",
    description: "Clothes optional, honesty mandatory",
    icon: "mdi:cards-heart",
  },
  {
    value: "dice-of-desire",
    name: "Dice of Desire",
    description: "Roll for hidden desires",
    icon: "mdi:dice-6",
  },
  {
    value: "do-or-drink",
    name: "Do or Drink",
    description: "No boring choices allowed",
    icon: "mdi:glass-cocktail",
  },
    {
      value: "never-have-i-ever",
      name: "Never Have I Ever",
      description: "Confess or drink",
      icon: "mdi:hand-back-right",
    },
    {
      value: "most-likely-to",
      name: "Most Likely To",
      description: "Vote and roast",
      icon: "mdi:account-group-outline",
    },
    {
      value: "would-you-rather",
      name: "Would You Rather",
      description: "Two terrible choices",
      icon: "mdi:help-circle",
    },
]);

const selectedGame = ref("truth-or-dare");

function generateId() {
  return Math.random().toString(36).substring(2, 9);
}

const addPlayer = () => {
  players.value.push({
    id: generateId(),
    name: "",
    gender: "male",
    partnerId: "",
  });
};

const removePlayer = (index) => {
  if (players.value.length > 2) {
    // Remove this player as partner from others
    const removedId = players.value[index].id;
    players.value.forEach((p) => {
      if (p.partnerId === removedId) {
        p.partnerId = "";
      }
    });

    players.value.splice(index, 1);
  }
};

const canStart = computed(() => {
  // Group games require no player names
  const groupGames = new Set([
    'never-have-i-ever',
    'most-likely-to',
    'would-you-rather',
  ]);
  if (groupGames.has(selectedGame.value)) return true;

  // All players must have names
  const hasValidPlayers = players.value.every((p) => p.name.trim() !== "");
  if (!hasValidPlayers) return false;

  // Game-specific requirements
  if (selectedGame.value === "truth-or-dare") {
    // In relationship mode, all must have partners
    if (gameMode.value === "relationship") {
      const allHavePartners = players.value.every((p) => p.partnerId);
      if (!allHavePartners) return false;

      // Partners must be mutual
      const allMutual = players.value.every((player) => {
        if (!player.partnerId) return false;
        const partner = players.value.find((p) => p.id === player.partnerId);
        return partner?.partnerId === player.id;
      });
      if (!allMutual) return false;
    }

    // Require at least 1 male and 1 female
    const genders = new Set(players.value.map((p) => p.gender));
    return genders.has("male") && genders.has("female");
  }

  // For other games, just need at least 2 players with names
  return players.value.length >= 2;
});

const { trackGameSelection, trackPageView } = useAnalytics();

const startGame = async () => {
  // Track game selection
  const gameName = availableGames.value.find(g => g.value === selectedGame.value)?.name || selectedGame.value;
  trackGameSelection(gameName);

  // Persist minimal session info locally for the game pages
  const saved = {
    mode: gameMode.value,
    players: players.value.map((p) => ({ id: p.id, name: p.name.trim(), gender: p.gender, partnerId: p.partnerId || '' })),
  };
  if (typeof window !== 'undefined') {
    localStorage.setItem('gameSession', JSON.stringify(saved));
  }
  navigateTo(`/game/${selectedGame.value}`);
};

// Track page view on mount
onMounted(() => {
  trackPageView('setup');
});
</script>

<style>
@keyframes float {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-10px);
  }
}
.animate-float {
  animation: float 6s ease-in-out infinite;
}

input::placeholder {
  color: rgba(255, 255, 255, 0.5);
}

/* Custom scrollbar */
::-webkit-scrollbar {
  width: 8px;
}
::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.1);
}
::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.3);
  border-radius: 4px;
}
::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.4);
}

/* Custom select arrow */
select {
  background-image: none;
}
</style>
