<template>
  <div
    data-setup-container
    class="fixed inset-0 bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 text-white p-3 sm:p-4 md:p-8 overflow-x-hidden overflow-y-auto"
    style="height: 100vh; height: calc(var(--vh, 1vh) * 100);"
  >
    <!-- Background Icons Pattern -->
    <BackgroundIcons />

    <div
      class="max-w-3xl mx-auto bg-white/10 backdrop-blur-md rounded-xl p-4 sm:p-5 md:p-8 shadow-2xl relative z-10 min-h-full overflow-y-auto pb-6 sm:pb-8 md:pb-12"
    >
      <!-- Mode Indicator -->
      <div class="mb-4 flex items-center justify-center">
        <span 
          v-if="isFamilyMode"
          class="inline-flex items-center gap-2 bg-green-500/20 text-green-300 border-2 border-green-400/50 px-4 py-2 rounded-full font-bold text-sm sm:text-base"
        >
          <span class="text-2xl">👨‍👩‍👧‍👦</span>
          Family Mode
        </span>
        <span 
          v-else
          class="inline-flex items-center gap-2 bg-pink-500/20 text-pink-300 border-2 border-pink-400/50 px-4 py-2 rounded-full font-bold text-sm sm:text-base"
        >
          <span class="text-2xl">🔥</span>
          Adult Mode
        </span>
      </div>

      <!-- Progress Steps -->
      <div class="mb-6 md:mb-8">
        <div class="flex items-center mb-3 md:mb-4 px-2">
          <template v-for="(step, index) in steps" :key="index">
            <!-- Step Circle -->
            <div
              class="w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 rounded-full flex items-center justify-center font-bold text-sm md:text-base transition-all duration-300 flex-shrink-0"
              :class="
                currentStep > index
                  ? 'bg-gradient-to-r from-green-500 to-emerald-600'
                  : currentStep === index
                  ? 'bg-gradient-to-r from-pink-600 to-purple-600 scale-110'
                  : 'bg-white/20 text-white/50'
              "
            >
              <Icon
                v-if="currentStep > index"
                icon="mdi:check"
                class="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6"
              />
              <span v-else>{{ index + 1 }}</span>
            </div>
            
            <!-- Connector Line -->
            <div
              v-if="index < steps.length - 1"
              class="h-0.5 sm:h-1 flex-1 mx-1.5 sm:mx-2 transition-all duration-300"
              :class="
                currentStep > index
                  ? 'bg-gradient-to-r from-green-500 to-emerald-600'
                  : 'bg-white/20'
              "
            ></div>
          </template>
        </div>
        
        <div class="text-center px-2 mt-4">
          <h2 class="text-lg sm:text-xl font-bold">{{ steps[currentStep].title }}</h2>
          <p class="text-xs sm:text-sm text-purple-200 mt-1">
            {{ steps[currentStep].description }}
          </p>
        </div>
      </div>

      <!-- Step 0: Game Mode (Adult Mode Only) -->
      <div v-if="!isFamilyMode && currentStep === 0" class="space-y-4 md:space-y-6">
        <div class="text-center mb-4 md:mb-6">
          <Icon icon="mdi:gamepad-variant" class="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 mx-auto mb-3 md:mb-4 text-cyan-400" />
          <h3 class="text-xl sm:text-2xl font-bold mb-2">Choose Your Game Mode</h3>
          <p class="text-sm sm:text-base md:text-lg text-white/80 px-2">
            How should prompts be distributed?
          </p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
          <button
            v-for="mode in gameModes"
            :key="mode.value"
            @click="gameStore.setGameMode(mode.value)"
            :class="{
              'bg-gradient-to-r from-purple-600 to-pink-600 scale-105 ring-4 ring-purple-400/50':
                gameStore.gameMode === mode.value,
              'bg-white/10 hover:bg-white/20': gameStore.gameMode !== mode.value,
            }"
            class="p-4 sm:p-5 md:p-6 rounded-lg sm:rounded-xl transition-all duration-300 text-left"
          >
            <div class="flex items-center gap-2 sm:gap-3 mb-1 sm:mb-2">
              <Icon :icon="mode.icon" class="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 flex-shrink-0" />
              <h3 class="text-base sm:text-lg md:text-xl font-bold">{{ mode.label }}</h3>
            </div>
            <p class="text-xs sm:text-sm text-white/70">{{ mode.description }}</p>
          </button>
        </div>
      </div>

      <!-- Step 1: Player Management (Adult Mode) / Step 0 (Family Mode) -->
      <div v-if="(isFamilyMode && currentStep === 0) || (!isFamilyMode && currentStep === 1)" class="space-y-4 md:space-y-6">
        <div class="text-center mb-4 md:mb-6">
          <Icon icon="mdi:account-multiple" class="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 mx-auto mb-3 md:mb-4 text-pink-400" />
          <h3 class="text-xl sm:text-2xl font-bold mb-2">Add Players</h3>
          <p class="text-sm sm:text-base md:text-lg text-white/80 px-2">
            Add at least 2 players to start. You can add more anytime!
          </p>
          <div class="mt-3 md:mt-4 inline-flex items-center gap-2 bg-white/10 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full">
            <Icon icon="mdi:account-group" class="w-4 h-4 sm:w-5 sm:h-5" />
            <span class="font-bold text-sm sm:text-base">{{ tempPlayers.length }}</span>
            <span class="text-xs sm:text-sm text-white/70">player{{ tempPlayers.length !== 1 ? 's' : '' }}</span>
          </div>
        </div>

        <!-- Quick Add Buttons -->
        <div v-if="tempPlayers.length === 0" class="mb-4 md:mb-6">
          <p class="text-center text-white/60 mb-3 md:mb-4 text-xs sm:text-sm px-2">Quick start with common group sizes:</p>
          <div class="flex flex-wrap justify-center gap-2 sm:gap-3">
            <button
              v-for="count in [2, 3, 4, 5, 6]"
              :key="count"
              @click="quickAddPlayers(count)"
              class="px-3 sm:px-4 md:px-6 py-2 sm:py-2.5 md:py-3 bg-white/10 hover:bg-white/20 rounded-lg sm:rounded-xl font-medium text-xs sm:text-sm md:text-base transition-all hover:scale-105 flex items-center gap-1.5 sm:gap-2"
            >
              <Icon icon="mdi:account-plus" class="w-4 h-4 sm:w-5 sm:h-5" />
              {{ count }} Players
            </button>
          </div>
        </div>

        <!-- Player List -->
        <div class="space-y-2 sm:space-y-3 max-h-[400px] sm:max-h-none overflow-y-auto pr-2">
          <div
            v-for="(player, index) in tempPlayers"
            :key="player.id"
            class="bg-gradient-to-br from-white/10 to-white/5 rounded-lg sm:rounded-xl p-3 sm:p-4 border border-white/10 hover:border-pink-500/30 transition-all"
          >
            <div class="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
              <!-- Top row on mobile: Number badge + Name input -->
              <div class="flex items-center gap-2 sm:gap-3 flex-1">
                <!-- Player Number Badge -->
                <div class="flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-r from-pink-600 to-purple-600 flex items-center justify-center font-bold text-sm sm:text-lg">
                  {{ index + 1 }}
                </div>

                <!-- Name Input -->
                <input
                  v-model="tempPlayers[index].name"
                  :placeholder="`Player ${index + 1} name`"
                  type="text"
                  inputmode="text"
                  autocomplete="off"
                  autocorrect="off"
                  autocapitalize="off"
                  spellcheck="false"
                  class="flex-1 bg-white/20 rounded-lg p-2 sm:p-3 text-sm sm:text-base focus:ring-2 focus:ring-purple-500 placeholder-white/50 font-medium"
                  @keyup.enter="focusNextPlayer(index)"
                />
              </div>

              <!-- Bottom row on mobile: Gender + Remove buttons -->
              <div class="flex items-center gap-2 justify-between sm:justify-end">
                <!-- Gender Selection (Adult Mode Only) -->
                <div v-if="!isFamilyMode" class="flex gap-1.5 sm:gap-2 flex-shrink-0">
                  <button
                    @click="tempPlayers[index].gender = 'male'"
                    :class="{
                      'bg-blue-500 ring-2 ring-blue-300': tempPlayers[index].gender === 'male',
                      'bg-white/10 hover:bg-white/20': tempPlayers[index].gender !== 'male',
                    }"
                    class="px-2 py-1.5 sm:px-3 sm:py-2 rounded-lg transition-all"
                    :title="'Male'"
                  >
                    <Icon icon="mdi:gender-male" class="w-4 h-4 sm:w-5 sm:h-5" />
                  </button>
                  <button
                    @click="tempPlayers[index].gender = 'female'"
                    :class="{
                      'bg-pink-500 ring-2 ring-pink-300': tempPlayers[index].gender === 'female',
                      'bg-white/10 hover:bg-white/20': tempPlayers[index].gender !== 'female',
                    }"
                    class="px-2 py-1.5 sm:px-3 sm:py-2 rounded-lg transition-all"
                    :title="'Female'"
                  >
                    <Icon icon="mdi:gender-female" class="w-4 h-4 sm:w-5 sm:h-5" />
                  </button>
                  <button
                    @click="tempPlayers[index].gender = 'other'"
                    :class="{
                      'bg-purple-500 ring-2 ring-purple-300': tempPlayers[index].gender === 'other',
                      'bg-white/10 hover:bg-white/20': tempPlayers[index].gender !== 'other',
                    }"
                    class="px-2 py-1.5 sm:px-3 sm:py-2 rounded-lg transition-all"
                    title="Other"
                  >
                    <Icon icon="mdi:account" class="w-4 h-4 sm:w-5 sm:h-5" />
                  </button>
                </div>

                <!-- Remove Button -->
                <button
                  @click="removePlayer(index)"
                  :disabled="tempPlayers.length < 3"
                  class="flex-shrink-0 px-2 py-1.5 sm:px-3 sm:py-2 bg-red-500/20 hover:bg-red-500/30 disabled:opacity-30 disabled:cursor-not-allowed rounded-lg transition-all"
                  :class="{ 'ml-auto': isFamilyMode }"
                  :title="tempPlayers.length < 3 ? 'Need at least 2 players' : 'Remove player'"
                >
                  <Icon icon="mdi:delete" class="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
              </div>
            </div>
            
            <!-- Pairing Section (Paired Mode Only) -->
            <div v-if="!isFamilyMode && gameStore.gameMode === 'relationship' && tempPlayers[index].name.trim() !== ''" class="mt-3 pt-3 border-t border-white/10">
              <div class="flex items-center justify-between gap-2">
                <span class="text-xs sm:text-sm text-white/70 flex items-center gap-1">
                  <Icon icon="mdi:heart" class="w-4 h-4" />
                  Partner:
                </span>
                <div class="flex items-center gap-2 flex-1 justify-end">
                  <span v-if="tempPlayers[index].partnerId" class="text-xs sm:text-sm font-medium text-green-300 flex items-center gap-1">
                    {{ tempPlayers.find(p => p.id === tempPlayers[index].partnerId)?.name || 'Unknown' }}
                    <button
                      @click="unPair(index)"
                      class="ml-2 text-red-400 hover:text-red-300 transition-colors"
                      title="Unpair"
                    >
                      <Icon icon="mdi:close-circle" class="w-4 h-4" />
                    </button>
                  </span>
                  <select
                    v-else
                    :value="tempPlayers[index].partnerId || ''"
                    @change="handlePartnerSelect(index, $event.target.value)"
                    class="text-xs sm:text-sm bg-white/20 border border-white/30 rounded-lg px-2 py-1.5 focus:ring-2 focus:ring-purple-500 flex-1 max-w-[200px]"
                  >
                    <option value="">Select partner...</option>
                    <option
                      v-for="(otherPlayer, otherIndex) in tempPlayers.filter((p, i) => i !== index && p.name.trim() !== '' && !p.partnerId)"
                      :key="otherPlayer.id"
                      :value="otherPlayer.id"
                    >
                      {{ otherPlayer.name }}
                    </option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Pairing Status (Paired Mode) -->
        <div v-if="!isFamilyMode && gameStore.gameMode === 'relationship' && tempPlayers.length >= 2" class="mt-4 bg-gradient-to-r from-pink-500/20 to-purple-500/20 border-2 border-pink-400/50 rounded-lg sm:rounded-xl p-3 sm:p-4">
          <div class="flex items-center gap-2 mb-2">
            <Icon icon="mdi:heart-multiple" class="w-5 h-5 text-pink-400" />
            <span class="font-bold text-sm sm:text-base text-pink-300">Pairing Status</span>
          </div>
          <p class="text-xs sm:text-sm text-white/80">
            {{ Math.floor(tempPlayers.filter(p => p.partnerId).length / 2) }} pair(s) formed, 
            {{ tempPlayers.filter(p => !p.partnerId && p.name.trim() !== '').length }} unpaired
          </p>
        </div>

        <!-- Add Player Button -->
        <button
          @click="addPlayer"
          class="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 rounded-lg sm:rounded-xl py-3 sm:py-4 text-sm sm:text-base font-bold transition-all flex items-center justify-center gap-2 shadow-lg hover:scale-105"
        >
          <Icon icon="mdi:account-plus" class="w-5 h-5 sm:w-6 sm:h-6" />
          Add Another Player
        </button>

        <!-- Validation Message -->
        <div v-if="tempPlayers.length < 2" class="text-center text-amber-400 text-xs sm:text-sm flex items-center justify-center gap-2 px-2">
          <Icon icon="mdi:alert" class="w-4 h-4 sm:w-5 sm:h-5" />
          <span>You need at least 2 players to start</span>
        </div>
        <div v-else-if="!allPlayersHaveNames" class="text-center text-amber-400 text-xs sm:text-sm flex items-center justify-center gap-2 px-2">
          <Icon icon="mdi:alert" class="w-4 h-4 sm:w-5 sm:h-5" />
          <span>All players need names to continue</span>
        </div>
      </div>

      <!-- Step 2: Game Selection (Adult Mode) / Step 1 (Family Mode) -->
      <div v-if="(isFamilyMode && currentStep === 1) || (!isFamilyMode && currentStep === 2)" class="space-y-4 md:space-y-6">
        <!-- Game Selection -->
        <div class="mt-4 md:mt-6">
          <h3 class="text-lg sm:text-xl font-semibold mb-3 md:mb-4 text-center px-2">Choose Your Game</h3>

          <!-- Adult Games Section (Adult Mode Only) -->
          <div v-if="!isFamilyMode" class="mb-6">
            <h4 class="text-base sm:text-lg font-bold mb-3 text-pink-300 flex items-center gap-2">
              <Icon icon="mdi:fire" class="w-5 h-5" />
              🔥 Adult Games
            </h4>
            <div class="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3">
              <button
                v-for="game in availableGames.filter(g => !g.familyFriendly)"
                :key="game.value"
                @click="gameStore.setSelectedGame(game.value)"
                :class="{
                  'border-pink-500 bg-pink-500/20 scale-105 ring-2 ring-pink-400/50':
                    gameStore.selectedGame === game.value,
                  'border-white/10 hover:border-pink-300 bg-gradient-to-br from-pink-500/10 to-purple-500/10':
                    gameStore.selectedGame !== game.value,
                }"
                class="p-3 sm:p-4 border-2 rounded-xl transition-all flex flex-col items-center relative group hover:scale-105"
              >
                <div class="w-12 h-12 sm:w-14 sm:h-14 mb-3 flex items-center justify-center text-3xl sm:text-4xl group-hover:scale-110 transition-transform">
                  <Icon :icon="game.icon" />
                </div>
                <span class="font-bold text-sm sm:text-base text-center leading-tight mb-1">{{ game.name }}</span>
                <span class="text-xs text-white/60 text-center">{{ game.description }}</span>
              </button>
            </div>
          </div>

          <!-- Friendly Games Section (Adult Mode) -->
          <div v-if="!isFamilyMode" class="mb-6">
            <h4 class="text-base sm:text-lg font-bold mb-3 text-green-300 flex items-center gap-2">
              <Icon icon="mdi:heart-multiple" class="w-5 h-5" />
              😊 Friendly Games
            </h4>
            <div class="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3">
              <button
                v-for="game in availableGames.filter(g => g.familyFriendly)"
                :key="game.value"
                @click="gameStore.setSelectedGame(game.value)"
                :class="{
                  'border-green-500 bg-green-500/20 scale-105 ring-2 ring-green-400/50':
                    gameStore.selectedGame === game.value,
                  'border-white/10 hover:border-green-300 bg-gradient-to-br from-green-500/10 to-emerald-500/10':
                    gameStore.selectedGame !== game.value,
                }"
                class="p-4 sm:p-5 border-2 rounded-xl sm:rounded-2xl transition-all flex flex-col items-center relative group hover:scale-105"
              >
                <div class="w-12 h-12 sm:w-14 sm:h-14 mb-3 flex items-center justify-center text-3xl sm:text-4xl group-hover:scale-110 transition-transform">
                  <Icon :icon="game.icon" />
                </div>
                <span class="font-bold text-sm sm:text-base text-center leading-tight mb-1">{{ game.name }}</span>
                <span class="text-xs text-white/60 text-center">{{ game.description }}</span>
              </button>
            </div>
          </div>

          <!-- Family Mode Games -->
          <div v-if="isFamilyMode" class="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
            <button
              v-for="game in availableGames"
              :key="game.value"
              @click="gameStore.setSelectedGame(game.value)"
              :class="{
                'border-green-500 bg-green-500/20 scale-105 ring-2 ring-green-400/50':
                  gameStore.selectedGame === game.value,
                'border-white/10 hover:border-green-300 bg-gradient-to-br from-green-500/10 to-emerald-500/10':
                  gameStore.selectedGame !== game.value,
              }"
              class="p-4 sm:p-5 border-2 rounded-xl sm:rounded-2xl transition-all flex flex-col items-center relative group hover:scale-105"
            >
              <div class="w-12 h-12 sm:w-14 sm:h-14 mb-3 flex items-center justify-center text-3xl sm:text-4xl group-hover:scale-110 transition-transform">
                <Icon :icon="game.icon" />
              </div>
              <span class="font-bold text-sm sm:text-base text-center leading-tight mb-1">{{ game.name }}</span>
              <span class="text-xs text-white/60 text-center">{{ game.description }}</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Navigation Buttons -->
      <div class="flex justify-between mt-6 md:mt-8 gap-2 sm:gap-3">
        <button
          v-if="currentStep > 0"
          @click="previousStep"
          class="bg-white/10 hover:bg-white/20 px-4 sm:px-5 md:px-6 py-2.5 sm:py-3 rounded-lg sm:rounded-xl text-sm sm:text-base font-medium transition-all flex items-center gap-1.5 sm:gap-2"
        >
          <Icon icon="mdi:arrow-left" class="w-4 h-4 sm:w-5 sm:h-5" />
          <span class="hidden xs:inline">Back</span>
        </button>
        <div v-else></div>

        <button
          v-if="currentStep < steps.length - 1"
          @click="nextStep"
          :disabled="!canProceed"
          class="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 disabled:opacity-50 disabled:cursor-not-allowed px-6 sm:px-7 md:px-8 py-2.5 sm:py-3 rounded-lg sm:rounded-xl text-sm sm:text-base font-bold transition-all flex items-center gap-1.5 sm:gap-2 ml-auto"
        >
          <span>Continue</span>
          <Icon icon="mdi:arrow-right" class="w-4 h-4 sm:w-5 sm:h-5" />
        </button>
        <button
          v-else
          @click="startGame"
          :disabled="!gameStore.canStartGame"
          class="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed px-6 sm:px-7 md:px-8 py-2.5 sm:py-3 rounded-lg sm:rounded-xl text-sm sm:text-base font-bold transition-all flex items-center gap-1.5 sm:gap-2 ml-auto"
        >
          <Icon icon="mdi:play" class="w-4 h-4 sm:w-5 sm:h-5" />
          <span>Start Game</span>
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
const { trackGameSelection, trackPageView } = useAnalytics();

const route = useRoute();
const isFamilyMode = computed(() => route.query.mode === 'family');

const currentStep = ref(0);
const tempPlayers = ref([
  { id: generateId(), name: "", gender: "male" },
  { id: generateId(), name: "", gender: "female" },
]);

const steps = computed(() => {
  if (isFamilyMode.value) {
    return [
      {
        title: "Add Players",
        description: "Enter player names",
      },
      {
        title: "Choose Game",
        description: "Pick your family game",
      },
    ];
  }
  
  // Adult Mode: Simplified flow (removed relationship type and comfort level)
  return [
    {
      title: "Game Mode",
      description: "Choose your game mode",
    },
    {
      title: "Add Players",
      description: "Enter player names",
    },
    {
      title: "Choose Game",
      description: "Pick your game",
    },
  ];
});

const gameModes = [
  {
    value: "free-for-all",
    label: "Free For All",
    icon: "mdi:account-group",
    description: "Prompts can target anyone in the group",
  },
  {
    value: "relationship",
    label: "Paired Mode",
    icon: "mdi:heart",
    description: "Prompts only target paired partners",
  },
];

const availableGames = computed(() => {
  const allGames = [
    // Family-friendly games
    {
      value: "charades",
      name: "Charades",
      description: "Act it out!",
      icon: "mdi:human-handsup",
      familyFriendly: true,
    },
    {
      value: "imposter",
      name: "Imposter",
      description: "Find the fake",
      icon: "mdi:account-question",
      familyFriendly: true,
    },
    {
      value: "mr-white",
      name: "Mr. White",
      description: "Blend in or be found",
      icon: "mdi:incognito",
      familyFriendly: true,
    },
    // Adult games
    {
      value: "truth-or-dare",
      name: "Truth or Dare",
      description: "Reveal or Risk",
      icon: "mdi:cards-heart",
      familyFriendly: false,
    },
    {
      value: "dice-of-desire",
      name: "Dice of Desire",
      description: "Roll for desires",
      icon: "mdi:dice-6",
      familyFriendly: false,
    },
    {
      value: "do-or-drink",
      name: "Do or Drink",
      description: "Do or Dodge",
      icon: "mdi:glass-cocktail",
      familyFriendly: false,
    },
    {
      value: "never-have-i-ever",
      name: "Never Have I Ever",
      description: "Never Have We Ever",
      icon: "mdi:hand-back-right",
      familyFriendly: false,
    },
    {
      value: "most-likely-to",
      name: "Most Likely To",
      description: "Who Fits This?",
      icon: "mdi:account-group-outline",
      familyFriendly: false,
    },
    {
      value: "would-you-rather",
      name: "Would You Rather",
      description: "Defend Your Choice",
      icon: "mdi:help-circle",
      familyFriendly: false,
    },
  ];

  // Filter games based on mode
  if (isFamilyMode.value) {
    // Family Mode: Only show family-friendly games
    return allGames.filter(game => game.familyFriendly);
  }
  
  // Adult Mode: Show adult games first, then family games
  const adultGames = allGames.filter(game => !game.familyFriendly);
  const familyGames = allGames.filter(game => game.familyFriendly);
  return [...adultGames, ...familyGames];
});

function generateId() {
  return Math.random().toString(36).substring(2, 9);
}

function quickAddPlayers(count) {
    // For paired mode, ensure pairs of male/female
    if (!isFamilyMode.value && gameStore.gameMode === 'relationship') {
    tempPlayers.value = Array.from({ length: count }, (_, i) => ({
      id: generateId(),
      name: "",
      gender: i % 2 === 0 ? "male" : "female",
    }));
  } else {
    tempPlayers.value = Array.from({ length: count }, (_, i) => ({
      id: generateId(),
      name: "",
      gender: i % 2 === 0 ? "male" : "female",
    }));
  }
}

function addPlayer() {
  tempPlayers.value.push({
    id: generateId(),
    name: "",
    gender: "male",
  });
}

function selectPartner(playerIndex, partnerIndex) {
  const player = tempPlayers.value[playerIndex];
  const partner = tempPlayers.value[partnerIndex];
  
  // If already paired with someone else, unlink them
  if (player.partnerId) {
    const oldPartner = tempPlayers.value.find(p => p.id === player.partnerId);
    if (oldPartner) {
      oldPartner.partnerId = null;
    }
  }
  
  // If partner is already paired, unlink them
  if (partner.partnerId) {
    const oldPartnerOfPartner = tempPlayers.value.find(p => p.id === partner.partnerId);
    if (oldPartnerOfPartner) {
      oldPartnerOfPartner.partnerId = null;
    }
  }
  
  // Create new pairing
  player.partnerId = partner.id;
  partner.partnerId = player.id;
}

function handlePartnerSelect(playerIndex, selectedPartnerId) {
  if (selectedPartnerId) {
    const partnerIndex = tempPlayers.value.findIndex(p => p.id === selectedPartnerId);
    if (partnerIndex !== -1) {
      selectPartner(playerIndex, partnerIndex);
    }
  } else {
    // If empty value selected, unpair
    unPair(playerIndex);
  }
}

function unPair(playerIndex) {
  const player = tempPlayers.value[playerIndex];
  if (player.partnerId) {
    const partner = tempPlayers.value.find(p => p.id === player.partnerId);
    if (partner) {
      partner.partnerId = null;
    }
    player.partnerId = null;
  }
}

const removePlayer = (index) => {
  if (tempPlayers.value.length > 2) {
    tempPlayers.value.splice(index, 1);
  }
};

function focusNextPlayer(currentIndex) {
  if (currentIndex < tempPlayers.value.length - 1) {
    // Focus next input (handled by browser)
    const nextInput = document.querySelectorAll('input[placeholder*="Player"]')[currentIndex + 1];
    if (nextInput) {
      nextInput.focus();
    }
  } else {
    // If last player, add a new one
    addPlayer();
    setTimeout(() => {
      const inputs = document.querySelectorAll('input[placeholder*="Player"]');
      if (inputs[inputs.length - 1]) {
        inputs[inputs.length - 1].focus();
      }
    }, 100);
  }
}

const allPlayersHaveNames = computed(() => {
  return tempPlayers.value.length >= 2 && tempPlayers.value.every((p) => p.name.trim() !== "");
});


const canProceed = computed(() => {
  // Family Mode: 2 steps
  if (isFamilyMode.value) {
    if (currentStep.value === 0) {
      return allPlayersHaveNames.value;
    }
    if (currentStep.value === 1) {
      return gameStore.selectedGame !== null;
    }
  }
  // Adult Mode: 3 steps (removed relationship type and comfort level)
  else {
    if (currentStep.value === 0) {
      return gameStore.gameMode !== null;
    }
    if (currentStep.value === 1) {
      return allPlayersHaveNames.value;
    }
    if (currentStep.value === 2) {
      return gameStore.selectedGame !== null;
    }
  }
  return false;
});

function nextStep() {
  // Save players when moving from player step
  if ((isFamilyMode.value && currentStep.value === 0) || (!isFamilyMode.value && currentStep.value === 1)) {
    // For paired mode, players are already paired manually
    gameStore.setPlayers(tempPlayers.value);
    
    // Family Mode: Set default game mode
    if (isFamilyMode.value) {
      gameStore.setGameMode('free-for-all');
    }
  }
  
  if (currentStep.value < steps.value.length - 1) {
    currentStep.value++;
  }
}

function previousStep() {
  if (currentStep.value > 0) {
    currentStep.value--;
  }
}

const startGame = async () => {
  // Final save of players
  if (tempPlayers.value.length > 0) {
    gameStore.setPlayers(tempPlayers.value);
  }
  
  // Save to localStorage
  gameStore.saveToLocalStorage();
  
  // Track game selection
  const gameName = availableGames.value.find(
    (g) => g.value === gameStore.selectedGame
  )?.name || gameStore.selectedGame;
  trackGameSelection(gameName);
  
  // Navigate to game
  navigateTo(`/game/${gameStore.selectedGame}`);
};

// Track page view on mount
onMounted(() => {
  trackPageView("setup");
  
  // Load existing state if available
  gameStore.loadFromLocalStorage();
  
  // If players exist, populate temp players
  if (gameStore.players.length > 0) {
    tempPlayers.value = gameStore.players.map((p) => ({ 
      ...p,
      gender: p.gender || 'male' // Ensure gender is set
    }));
  }
  
  // Check mode from URL
  if (typeof window !== 'undefined') {
    const urlParams = new URLSearchParams(window.location.search);
    const modeParam = urlParams.get('mode');
    
    // Set family mode flag
    if (modeParam === 'family') {
      gameStore.setFamilyMode(true);
    } else {
      gameStore.setFamilyMode(false);
    }
    
    // Check if coming from a direct game link or back from game
    const gameParam = urlParams.get('game');
    const stepParam = urlParams.get('step');
    
    if (gameParam) {
      gameStore.setSelectedGame(gameParam);
    }
    
    // If step parameter is provided, jump to that step
    if (stepParam === 'game-selection') {
      if (isFamilyMode.value) {
        currentStep.value = 1;
      } else {
        currentStep.value = 2;
      }
    } else if (gameParam) {
      // Jump to last step if game is selected and setup is complete
      if (isFamilyMode.value) {
        if (gameStore.players.length >= 2) {
          currentStep.value = 1;
        }
      } else if (gameStore.players.length >= 2 && gameStore.gameMode) {
        currentStep.value = 2;
      }
    }

    // Prevent viewport resize on mobile when keyboard appears
    // Lock the initial viewport height
    const setViewportHeight = () => {
      const vh = window.innerHeight * 0.01;
      document.documentElement.style.setProperty('--vh', `${vh}px`);
    };
    
    setViewportHeight();
    window.addEventListener('resize', setViewportHeight);
    window.addEventListener('orientationchange', setViewportHeight);
    
    // Use Visual Viewport API if available (better mobile support)
    let viewportHandler = null;
    if (window.visualViewport) {
      viewportHandler = () => {
        // Prevent layout shifts when keyboard appears
        const container = document.querySelector('[data-setup-container]');
        if (container) {
          container.style.height = `${window.visualViewport.height}px`;
        }
      };
      
      window.visualViewport.addEventListener('resize', viewportHandler);
      window.visualViewport.addEventListener('scroll', viewportHandler);
    }
    
    // Cleanup on unmount
    onBeforeUnmount(() => {
      window.removeEventListener('resize', setViewportHeight);
      window.removeEventListener('orientationchange', setViewportHeight);
      if (window.visualViewport && viewportHandler) {
        window.visualViewport.removeEventListener('resize', viewportHandler);
        window.visualViewport.removeEventListener('scroll', viewportHandler);
      }
    });
  }
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

/* Prevent viewport expansion on mobile */
@media (max-width: 768px) {
  /* Ensure fixed container doesn't expand */
  [data-setup-container] {
    position: fixed !important;
    top: 0 !important;
    left: 0 !important;
    right: 0 !important;
    bottom: 0 !important;
    width: 100% !important;
    max-width: 100% !important;
    overflow: hidden !important;
    background: linear-gradient(to bottom right, #0f172a, #581c87, #0f172a) !important;
  }
  
  /* Smooth scrolling for inner content */
  [data-setup-container] > div {
    -webkit-overflow-scrolling: touch;
    overscroll-behavior: contain;
    height: 100% !important;
    max-height: 100vh !important;
    overflow-y: auto !important;
    overflow-x: hidden !important;
  }
  
  /* Prevent input focus from causing viewport expansion */
  [data-setup-container] input:focus {
    transform: translateZ(0);
    -webkit-transform: translateZ(0);
  }
  
  /* Prevent black space when keyboard appears */
  @supports (height: 100dvh) {
    [data-setup-container] {
      height: 100dvh !important;
    }
  }
  
  /* Ensure background covers entire viewport */
  html, body {
    overflow: hidden !important;
    height: 100% !important;
    height: 100dvh !important;
  }
}
</style>
