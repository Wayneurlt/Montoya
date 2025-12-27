<template>
  <div
    class="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 text-white p-3 sm:p-4 md:p-8 relative overflow-hidden"
  >
    <!-- Background Icons Pattern -->
    <BackgroundIcons />

    <div
      class="max-w-3xl mx-auto bg-white/10 backdrop-blur-md rounded-xl p-4 sm:p-5 md:p-8 shadow-2xl relative z-10"
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

      <!-- Step 1: Player Management -->
      <div v-if="currentStep === 0" class="space-y-4 md:space-y-6">
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
        <div class="space-y-2 sm:space-y-3 max-h-96 overflow-y-auto pr-1 sm:pr-2">
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
          </div>
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

      <!-- Step 2: Relationship Type (Adult Mode Only) -->
      <div v-if="!isFamilyMode && currentStep === 1" class="space-y-4 md:space-y-6">
        <div class="text-center mb-4 md:mb-6">
          <Icon icon="mdi:heart-multiple" class="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 mx-auto mb-3 md:mb-4 text-pink-400" />
          <p class="text-sm sm:text-base md:text-lg text-white/80 px-2">
            How do you know each other?
          </p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
          <button
            v-for="type in relationshipTypes"
            :key="type.value"
            @click="gameStore.setRelationshipType(type.value)"
            :class="{
              'bg-gradient-to-r from-purple-600 to-pink-600 scale-105 ring-4 ring-purple-400/50':
                gameStore.relationshipType === type.value,
              'bg-white/10 hover:bg-white/20': gameStore.relationshipType !== type.value,
            }"
            class="p-4 sm:p-5 md:p-6 rounded-lg sm:rounded-xl transition-all duration-300 text-left"
          >
            <div class="flex items-center gap-2 sm:gap-3 mb-1 sm:mb-2">
              <Icon :icon="type.icon" class="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 flex-shrink-0" />
              <h3 class="text-base sm:text-lg md:text-xl font-bold">{{ type.label }}</h3>
            </div>
            <p class="text-xs sm:text-sm text-white/70">{{ type.description }}</p>
          </button>
        </div>
      </div>

      <!-- Step 3: Comfort Level (Adult Mode Only) -->
      <div v-if="!isFamilyMode && currentStep === 2" class="space-y-4 md:space-y-6">
        <div class="text-center mb-4 md:mb-6">
          <Icon icon="mdi:fire" class="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 mx-auto mb-3 md:mb-4 text-orange-400" />
          <p class="text-sm sm:text-base md:text-lg text-white/80 px-2">
            How wild are you willing to get?
          </p>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4">
          <button
            v-for="level in comfortLevels"
            :key="level.value"
            @click="gameStore.setComfortLevel(level.value)"
            :class="{
              'bg-gradient-to-r from-purple-600 to-pink-600 scale-105 ring-4 ring-purple-400/50':
                gameStore.comfortLevel === level.value,
              'bg-white/10 hover:bg-white/20': gameStore.comfortLevel !== level.value,
            }"
            class="p-4 sm:p-5 md:p-6 rounded-lg sm:rounded-xl transition-all duration-300 text-center"
          >
            <div class="text-3xl sm:text-4xl md:text-5xl mb-2 sm:mb-3">{{ level.emoji }}</div>
            <h3 class="text-base sm:text-lg md:text-xl font-bold mb-1 sm:mb-2">{{ level.label }}</h3>
            <p class="text-xs sm:text-sm text-white/70">{{ level.description }}</p>
          </button>
        </div>
      </div>

      <!-- Step 2/4: Game Selection -->
      <div v-if="(isFamilyMode && currentStep === 1) || (!isFamilyMode && currentStep === 3)" class="space-y-4 md:space-y-6">
        <!-- Game Mode Selection (Adult Mode Only) -->
        <div v-if="!isFamilyMode">
          <div class="text-center mb-4 md:mb-6">
            <Icon icon="mdi:gamepad-variant" class="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 mx-auto mb-3 md:mb-4 text-cyan-400" />
            <p class="text-sm sm:text-base md:text-lg text-white/80 px-2">
              Choose your game mode
            </p>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4">
            <button
              v-for="mode in gameModes"
              :key="mode.value"
              @click="gameStore.setGameMode(mode.value)"
              :class="{
                'bg-gradient-to-r from-purple-600 to-pink-600 scale-105 ring-4 ring-purple-400/50':
                  gameStore.gameMode === mode.value,
                'bg-white/10 hover:bg-white/20': gameStore.gameMode !== mode.value,
              }"
              class="p-4 sm:p-5 md:p-6 rounded-lg sm:rounded-xl transition-all duration-300"
            >
              <div class="flex items-center gap-2 sm:gap-3 mb-1 sm:mb-2">
                <Icon :icon="mode.icon" class="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 flex-shrink-0" />
                <h3 class="text-sm sm:text-base md:text-xl font-bold">{{ mode.label }}</h3>
              </div>
              <p class="text-xs sm:text-sm text-white/70 mt-1 sm:mt-2">{{ mode.description }}</p>
            </button>
          </div>
        </div>

        <!-- Game Selection -->
        <div class="mt-6 md:mt-8">
          <h3 class="text-lg sm:text-xl font-semibold mb-3 md:mb-4 text-center px-2">Choose Your Game</h3>
          
          <!-- Recommended Games Badge -->
          <div v-if="recommendedGames.length > 0" class="mb-4 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border border-cyan-400/50 rounded-lg px-4 py-3">
            <div class="flex items-center gap-2 mb-2">
              <Icon icon="mdi:star" class="w-5 h-5 text-cyan-400" />
              <span class="font-bold text-sm sm:text-base text-cyan-300">Recommended for {{ getRelationshipLabel() }}</span>
            </div>
            <p class="text-xs sm:text-sm text-white/70">{{ getRecommendationText() }}</p>
          </div>

          <div class="grid grid-cols-2 sm:grid-cols-3 gap-2.5 sm:gap-3 md:gap-4">
            <button
              v-for="game in availableGames"
              :key="game.value"
              @click="gameStore.setSelectedGame(game.value)"
              :class="{
                'border-purple-500 bg-white/20 scale-105':
                  gameStore.selectedGame === game.value,
                'border-cyan-400 bg-cyan-500/10':
                  isRecommended(game.value) && gameStore.selectedGame !== game.value,
                'border-white/10 hover:border-purple-300':
                  !isRecommended(game.value) && gameStore.selectedGame !== game.value,
              }"
              class="p-3 sm:p-4 border-2 rounded-lg sm:rounded-xl transition-all flex flex-col items-center relative"
            >
              <div v-if="isRecommended(game.value)" class="absolute -top-2 -right-2 bg-cyan-500 text-white text-xs px-2 py-0.5 rounded-full font-bold">
                ⭐
              </div>
              <div class="w-10 h-10 sm:w-12 sm:h-12 mb-2 sm:mb-3 flex items-center justify-center text-2xl sm:text-3xl">
                <Icon :icon="game.icon" />
              </div>
              <span class="font-medium text-xs sm:text-sm text-center leading-tight">{{ game.name }}</span>
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
import { ref, computed, onMounted } from "vue";
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
  
  return [
    {
      title: "Player Count",
      description: "Add players and their names",
    },
    {
      title: "Relationship Type",
      description: "How do you know each other?",
    },
    {
      title: "Comfort Level",
      description: "How wild are you willing to get?",
    },
    {
      title: "Game Mode & Selection",
      description: "Choose your adventure",
    },
  ];
});

const relationshipTypes = [
  {
    value: "strangers",
    label: "Strangers",
    icon: "mdi:account-question",
    description: "Just met or don't know each other well",
  },
  {
    value: "friends",
    label: "Friends",
    icon: "mdi:account-group",
    description: "Good friends having fun together",
  },
  {
    value: "dating",
    label: "Dating",
    icon: "mdi:heart",
    description: "In a relationship, getting to know each other",
  },
  {
    value: "couple",
    label: "Couple",
    icon: "mdi:heart-multiple",
    description: "Committed couple, comfortable with each other",
  },
  {
    value: "mixed",
    label: "Mixed Group",
    icon: "mdi:account-multiple",
    description: "Mix of relationships and strangers",
  },
];

const comfortLevels = [
  {
    value: "chill",
    label: "Chill",
    emoji: "😌",
    description: "Safe, light, public-friendly prompts",
  },
  {
    value: "spicy",
    label: "Spicy",
    emoji: "🌶️",
    description: "Flirty, bold, suggestive content",
  },
  {
    value: "wild",
    label: "Wild",
    emoji: "🔥",
    description: "Chaotic, risky, adult content",
  },
];

const gameModes = [
  {
    value: "free-for-all",
    label: "Free For All",
    icon: "mdi:account-group",
    description: "Prompts can target anyone in the group",
  },
  {
    value: "relationship",
    label: "Relationship Mode",
    icon: "mdi:heart",
    description: "Prompts only target paired partners",
  },
  {
    value: "connection",
    label: "Connection Mode",
    icon: "mdi:handshake",
    description: "Conversation-first, mutual prompts (ideal for strangers & 2 players)",
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
    {
      value: "trivia",
      name: "Trivia Time",
      description: "Test your knowledge",
      icon: "mdi:head-question",
      familyFriendly: true,
    },
    {
      value: "two-truths-one-lie",
      name: "Two Truths One Lie",
      description: "Spot the lie",
      icon: "mdi:comment-question-outline",
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
  
  // Adult Mode: Show ALL games (family + adult)
  return allGames;
});

function generateId() {
  return Math.random().toString(36).substring(2, 9);
}

function quickAddPlayers(count) {
  tempPlayers.value = Array.from({ length: count }, (_, i) => ({
    id: generateId(),
    name: "",
    gender: i % 2 === 0 ? "male" : "female",
  }));
}

function addPlayer() {
  tempPlayers.value.push({
    id: generateId(),
    name: "",
    gender: "male",
  });
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

// Game recommendations based on relationship type and mode
const recommendedGames = computed(() => {
  const relationship = gameStore.relationshipType;
  
  if (!relationship && !isFamilyMode.value) return [];

  // Family mode recommendations
  if (isFamilyMode.value) {
    return ['charades', 'imposter', 'mr-white', 'trivia'];
  }

  // Adult game recommendations by relationship
  const recommendations = {
    strangers: ['most-likely-to', 'would-you-rather', 'never-have-i-ever', 'charades'],
    friends: ['never-have-i-ever', 'most-likely-to', 'truth-or-dare', 'imposter'],
    dating: ['truth-or-dare', 'would-you-rather', 'dice-of-desire'],
    couple: ['truth-or-dare', 'dice-of-desire', 'do-or-drink'],
    mixed: ['most-likely-to', 'never-have-i-ever', 'would-you-rather', 'charades'],
  };

  return recommendations[relationship] || [];
});

function isRecommended(gameValue) {
  return recommendedGames.value.includes(gameValue);
}

function getRelationshipLabel() {
  if (isFamilyMode.value) {
    return 'Family Mode';
  }
  
  const labels = {
    strangers: 'Strangers',
    friends: 'Friends',
    dating: 'Dating',
    couple: 'Couples',
    mixed: 'Mixed Groups',
  };
  return labels[gameStore.relationshipType] || 'You';
}

function getRecommendationText() {
  if (isFamilyMode.value) {
    return 'Kid-friendly games perfect for family gatherings and all ages!';
  }
  
  const texts = {
    strangers: 'Start with light, conversation-focused games to break the ice. Includes both adult and icebreaker games.',
    friends: 'Perfect mix of fun revelations and daring challenges for your group.',
    dating: 'Flirty and revealing games to deepen your connection and have fun.',
    couple: 'Intimate and adventurous games designed to spice things up.',
    mixed: 'Versatile games that work well for groups with mixed comfort levels.',
  };
  return texts[gameStore.relationshipType] || 'These games are perfect for your group!';
}

const canProceed = computed(() => {
  if (currentStep.value === 0) {
    return allPlayersHaveNames.value;
  }
  
  // Family Mode: Only 2 steps
  if (isFamilyMode.value) {
    if (currentStep.value === 1) {
      return gameStore.selectedGame !== null;
    }
  }
  // Adult Mode: 4 steps
  else {
    if (currentStep.value === 1) {
      return gameStore.relationshipType !== null;
    }
    if (currentStep.value === 2) {
      return gameStore.comfortLevel !== null;
    }
    if (currentStep.value === 3) {
      return (
        gameStore.gameMode !== null && gameStore.selectedGame !== null
      );
    }
  }
  return false;
});

function nextStep() {
  if (currentStep.value === 0) {
    // Save players to store
    gameStore.setPlayers(tempPlayers.value);
    
    // Family Mode: Set defaults (not needed for gameplay, but for compatibility)
    if (isFamilyMode.value) {
      gameStore.setComfortLevel('chill');
      gameStore.setRelationshipType('mixed');
      gameStore.setGameMode('free-for-all');
    }
    // Adult Mode: Auto-suggest game mode based on player count
    else {
      if (tempPlayers.value.length === 2 && !gameStore.gameMode) {
        gameStore.setGameMode("connection");
      }
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
    
    // Check if coming from a direct game link
    const gameParam = urlParams.get('game');
    if (gameParam) {
      gameStore.setSelectedGame(gameParam);
      // Jump to last step if game is selected and setup is complete
      if (isFamilyMode.value) {
        if (gameStore.players.length >= 2) {
          currentStep.value = 1;
        }
      } else if (gameStore.players.length >= 2 && gameStore.relationshipType && gameStore.comfortLevel) {
        currentStep.value = 3;
      }
    }
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
</style>
