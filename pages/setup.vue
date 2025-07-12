<template>
  <div
    class="min-h-screen bg-gradient-to-br from-purple-900 to-indigo-800 text-white p-4 md:p-8"
  >
    <div
      class="max-w-2xl mx-auto bg-white/10 backdrop-blur-md rounded-xl p-6 md:p-8 shadow-2xl"
    >
      <h1 class="text-3xl md:text-4xl font-bold text-center mb-6 md:mb-8">
        Who's Playing?
      </h1>

      <!-- Player Inputs -->
      <div
        v-for="(player, index) in players"
        :key="index"
        class="mb-4 p-4 bg-white/5 rounded-lg border border-white/10"
      >
        <div class="flex flex-col md:flex-row gap-3 md:items-center mb-3">
          <input
            v-model="players[index].name"
            placeholder="Nickname"
            class="flex-1 bg-white/20 rounded-lg p-3 focus:ring-2 focus:ring-pink-500"
          />
          <button
            @click="removePlayer(index)"
            class="bg-red-500 hover:bg-red-600 text-white text-sm font-medium rounded-lg md:rounded-xl px-3 py-2 md:w-20 flex items-center justify-center"
            :disabled="players.length <= 2"
          >
            Remove
          </button>
        </div>

        <div class="flex flex-wrap gap-4">
          <label class="flex items-center gap-2">
            <input
              type="radio"
              v-model="players[index].gender"
              value="male"
              class="h-5 w-5 text-blue-500"
            />
            <span>♂ Male</span>
          </label>
          <label class="flex items-center gap-2">
            <input
              type="radio"
              v-model="players[index].gender"
              value="female"
              class="h-5 w-5 text-pink-500"
            />
            <span>♀ Female</span>
          </label>
        </div>
      </div>

      <button
        @click="addPlayer"
        class="w-full bg-pink-600 hover:bg-pink-700 rounded-lg py-3 mb-6 font-bold"
      >
        + Add Player
      </button>

      <!-- Game Selection -->
      <div class="mb-6">
        <h2 class="text-xl md:text-2xl font-semibold mb-3">Choose a Game:</h2>
        <select
          v-model="selectedGame"
          class="w-full bg-white/20 rounded-lg p-3 focus:ring-2 focus:ring-pink-500"
        >
          <option value="truth-or-dare">Strip Truth or Dare</option>
          <option value="dice-of-desire">Dice of Desire</option>
          <option value="chaos">Chaos Mode</option>
        </select>
      </div>

      <button
        @click="startGame"
        :disabled="!canStart"
        class="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-500 rounded-lg py-3 font-bold transition-colors"
      >
        Start Game
      </button>
    </div>
  </div>
</template>

<script setup>
const players = ref([
  { name: "", gender: "male" },
  { name: "", gender: "female" },
]);

const selectedGame = ref("truth-or-dare");

const addPlayer = () => players.value.push({ name: "", gender: "male" });
const removePlayer = (index) => {
  if (players.value.length > 2) {
    players.value.splice(index, 1);
  }
};

const canStart = computed(() => {
  const hasValidPlayers =
    players.value.length >= 2 &&
    players.value.every((p) => p.name.trim() !== "");

  // For truth-or-dare, require at least 1 male and 1 female
  if (selectedGame.value === "truth-or-dare") {
    const genders = new Set(players.value.map((p) => p.gender));
    return hasValidPlayers && genders.has("male") && genders.has("female");
  }

  return hasValidPlayers;
});

const startGame = () => {
  const gameData = {
    players: players.value.map((p) => ({
      id: Math.random().toString(36).substring(7),
      name: p.name.trim(),
      gender: p.gender,
      itemsRemoved: 0, // For strip game
    })),
    game: selectedGame.value,
  };

  localStorage.setItem("gameSession", JSON.stringify(gameData));
  navigateTo(`/game/${selectedGame.value}`);
};
</script>

<style>
button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>
