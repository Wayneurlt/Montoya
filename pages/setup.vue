<template>
  <div
    data-setup-container
    class="fixed inset-0 bg-nightlife text-paper p-3 sm:p-4 md:p-8 overflow-x-hidden overflow-y-auto"
    style="height: 100vh; height: calc(var(--vh, 1vh) * 100);"
  >
    <!-- Background Icons Pattern -->
    <BackgroundIcons />

    <div
      class="max-w-3xl mx-auto card-poster p-4 sm:p-5 md:p-8 relative z-10 min-h-full safe-bottom"
    >
      <!-- Back to Home -->
      <div ref="headerRef" class="mb-4 flex items-center justify-between">
        <NuxtLink
          to="/"
          class="inline-flex items-center gap-2 bg-card border border-white/10 hover:border-hot/50 px-3 sm:px-4 py-1.5 sm:py-2 rounded-md transition-colors"
        >
          <Icon icon="mdi:arrow-left" class="w-5 h-5" />
          <span class="font-medium">Home</span>
        </NuxtLink>
        <span class="flex-1" />
      </div>

      <!-- Mode Indicator -->
      <div class="mb-4 flex items-center justify-center">
        <span
          v-if="isFamilyMode"
          class="badge-stamp bg-volt text-ink px-4 py-2 text-sm sm:text-base"
        >
          <Icon icon="mdi:human-male-female-child" class="w-5 h-5" />
          Family Mode
        </span>
        <span
          v-else
          class="badge-stamp bg-hot text-paper px-4 py-2 text-sm sm:text-base"
        >
          <Icon icon="mdi:fire" class="w-5 h-5" />
          Adult Mode
        </span>
      </div>

      <!-- Progress Steps -->
      <div class="mb-6 md:mb-8">
        <div class="flex items-center mb-3 md:mb-4 px-2">
          <template v-for="(step, index) in steps" :key="index">
            <!-- Step Circle -->
            <div
              class="w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 rounded-full flex items-center justify-center font-display font-bold text-sm md:text-base transition-all duration-300 flex-shrink-0"
              :class="
                currentStep > index
                  ? 'bg-volt text-ink'
                  : currentStep === index
                  ? 'bg-hot text-paper scale-110 shadow-hard-sm'
                  : 'bg-white/10 text-paper/40'
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
              class="h-0.5 sm:h-1 flex-1 mx-1.5 sm:mx-2 transition-all duration-300 rounded-full"
              :class="currentStep > index ? 'bg-volt' : 'bg-white/10'"
            ></div>
          </template>
        </div>

        <div class="text-center px-2 mt-4">
          <h2 class="font-display text-lg sm:text-xl font-bold uppercase tracking-wide text-paper">{{ steps[currentStep].title }}</h2>
          <p class="text-xs sm:text-sm text-paper/60 mt-1">
            {{ steps[currentStep].description }}
          </p>
        </div>
      </div>

      <div ref="stepBodyRef">
        <!-- Step 0: Game Mode (Adult Mode Only) -->
        <div v-if="!isFamilyMode && currentStep === 0" class="space-y-4 md:space-y-6">
          <div class="text-center mb-4 md:mb-6">
            <Icon icon="mdi:gamepad-variant" class="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 mx-auto mb-3 md:mb-4 text-hot" />
            <h3 class="font-display text-xl sm:text-2xl font-bold uppercase mb-2 text-paper">Choose Your Game Mode</h3>
            <p class="text-sm sm:text-base md:text-lg text-paper/70 px-2">
              How should prompts be distributed?
            </p>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
            <button
              v-for="(mode, modeIndex) in gameModes"
              :key="mode.value"
              @click="gameStore.setGameMode(mode.value); punchScale($event.currentTarget)"
              class="mode-card min-h-[9rem] sm:min-h-[10rem]"
              :class="[modeIndex === 1 ? 'is-volt' : '', { 'is-active': gameStore.gameMode === mode.value }]"
            >
              <Icon :icon="mode.icon" class="w-7 h-7 sm:w-8 sm:h-8 flex-shrink-0" />
              <span class="mode-card-title">{{ mode.label }}</span>
              <span class="mode-card-desc">{{ mode.description }}</span>
              <Icon icon="mdi:check-circle" class="mode-card-check" />
            </button>
          </div>
        </div>

        <!-- Step 1: Player Management (Adult Mode) / Step 0 (Family Mode) -->
        <div v-if="(isFamilyMode && currentStep === 0) || (!isFamilyMode && currentStep === 1)" class="space-y-4 md:space-y-6">
          <div class="text-center mb-4 md:mb-6">
            <Icon icon="mdi:account-multiple" class="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 mx-auto mb-3 md:mb-4 text-hot" />
            <h3 class="font-display text-xl sm:text-2xl font-bold uppercase mb-2 text-paper">Add Players</h3>
            <p class="text-sm sm:text-base md:text-lg text-paper/70 px-2">
              Add at least 2 players to start. You can add more anytime!
            </p>
            <div class="mt-3 md:mt-4 inline-flex items-center gap-2 bg-white/5 border border-white/10 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full">
              <Icon icon="mdi:account-group" class="w-4 h-4 sm:w-5 sm:h-5" />
              <span class="font-bold font-display text-sm sm:text-base">{{ tempPlayers.length }}</span>
              <span class="text-xs sm:text-sm text-paper/60">player{{ tempPlayers.length !== 1 ? 's' : '' }}</span>
            </div>
            <p v-if="resumedPlayers" class="mt-2 text-xs text-volt/80 flex items-center justify-center gap-1.5">
              <Icon icon="mdi:restore" class="w-3.5 h-3.5" />
              Picking up where you left off
            </p>
          </div>

          <!-- Quick Add Buttons: shown until the user starts naming players, since
               the list is always pre-seeded with 2 blanks (an empty-list check
               here would never actually show this shortcut). -->
          <div v-if="tempPlayers.every((p) => !p.name.trim())" class="mb-4 md:mb-6">
            <p class="text-center text-paper/60 mb-3 md:mb-4 text-xs sm:text-sm px-2">Quick start with common group sizes:</p>
            <div class="flex flex-wrap justify-center gap-2 sm:gap-3">
              <button
                v-for="count in [2, 3, 4, 5, 6]"
                :key="count"
                @click="quickAddPlayers(count); punchScale($event.currentTarget)"
                class="px-3 sm:px-4 md:px-6 py-2 sm:py-2.5 md:py-3 bg-card border border-white/10 hover:border-hot/50 rounded-md font-display uppercase tracking-wide text-xs sm:text-sm transition-all flex items-center gap-1.5 sm:gap-2"
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
              class="bg-card rounded-md p-3 sm:p-4 border border-white/10 hover:border-hot/30 transition-all"
            >
              <div class="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
                <!-- Top row on mobile: Number badge + Name input -->
                <div class="flex items-center gap-2 sm:gap-3 flex-1">
                  <!-- Player Number Badge -->
                  <div class="flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-hot text-paper flex items-center justify-center font-display font-bold text-sm sm:text-lg">
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
                    class="flex-1 bg-white/5 border border-white/10 rounded-md p-2 sm:p-3 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-hot/60 placeholder-paper/40 font-medium text-paper"
                    @keyup.enter="focusNextPlayer(index)"
                  />
                </div>

                <!-- Bottom row on mobile: Gender + Remove buttons -->
                <div class="flex items-center gap-2 sm:gap-3">
                  <!-- Gender Selection (Adult Mode Only) -->
                  <div v-if="!isFamilyMode" class="flex-1 sm:w-48 sm:flex-none">
                    <GenderPicker
                      :model-value="tempPlayers[index].gender"
                      aria-label="Player gender"
                      @update:model-value="tempPlayers[index].gender = $event"
                    />
                  </div>

                  <!-- Remove Button -->
                  <button
                    @click="removePlayer(index)"
                    :disabled="tempPlayers.length < 3"
                    class="flex-shrink-0 min-w-[44px] min-h-[44px] flex items-center justify-center px-2.5 bg-hot/15 hover:bg-hot/25 text-hot disabled:opacity-30 disabled:cursor-not-allowed rounded-md transition-all"
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
                  <span class="text-xs sm:text-sm text-paper/60 flex items-center gap-1">
                    <Icon icon="mdi:heart" class="w-4 h-4 text-hot" />
                    Partner:
                  </span>
                  <div class="flex items-center gap-2 flex-1 justify-end">
                    <span v-if="tempPlayers[index].partnerId" class="text-xs sm:text-sm font-medium text-volt flex items-center gap-1">
                      {{ tempPlayers.find(p => p.id === tempPlayers[index].partnerId)?.name || 'Unknown' }}
                      <button
                        @click="unPair(index)"
                        class="ml-2 text-hot hover:brightness-110 transition-colors"
                        title="Unpair"
                      >
                        <Icon icon="mdi:close-circle" class="w-4 h-4" />
                      </button>
                    </span>
                    <select
                      v-else
                      :value="tempPlayers[index].partnerId || ''"
                      @change="handlePartnerSelect(index, $event.target.value)"
                      class="text-xs sm:text-sm bg-white/5 border border-white/10 rounded-md px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-hot/60 flex-1 max-w-[200px] text-paper"
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
          <div v-if="!isFamilyMode && gameStore.gameMode === 'relationship' && tempPlayers.length >= 2" class="mt-4 card-poster p-3 sm:p-4">
            <div class="flex items-center gap-2 mb-2">
              <Icon icon="mdi:heart-multiple" class="w-5 h-5 text-hot" />
              <span class="font-bold font-display uppercase tracking-wide text-sm sm:text-base text-hot">Pairing Status</span>
            </div>
            <p class="text-xs sm:text-sm text-paper/70">
              {{ Math.floor(tempPlayers.filter(p => p.partnerId).length / 2) }} pair(s) formed,
              {{ tempPlayers.filter(p => !p.partnerId && p.name.trim() !== '').length }} unpaired
            </p>
          </div>

          <!-- Add Player Button -->
          <button
            @click="addPlayer(); punchScale($event.currentTarget)"
            class="w-full bg-hot text-paper shadow-hard hover:brightness-110 rounded-md py-3 sm:py-4 text-sm sm:text-base font-display font-bold uppercase tracking-wide transition-[filter] flex items-center justify-center gap-2"
          >
            <Icon icon="mdi:account-plus" class="w-5 h-5 sm:w-6 sm:h-6" />
            Add Another Player
          </button>

          <!-- Validation Message -->
          <div v-if="tempPlayers.length < 2" class="text-center text-hot text-xs sm:text-sm flex items-center justify-center gap-2 px-2">
            <Icon icon="mdi:alert" class="w-4 h-4 sm:w-5 sm:h-5" />
            <span>You need at least 2 players to start</span>
          </div>
          <div v-else-if="!allPlayersHaveNames" class="text-center text-hot text-xs sm:text-sm flex items-center justify-center gap-2 px-2">
            <Icon icon="mdi:alert" class="w-4 h-4 sm:w-5 sm:h-5" />
            <span>All players need names to continue</span>
          </div>
        </div>

        <!-- Step 2: Game Selection (Adult Mode) / Step 1 (Family Mode) -->
        <div v-if="(isFamilyMode && currentStep === 1) || (!isFamilyMode && currentStep === 2)" class="space-y-4 md:space-y-6">
          <!-- Game Selection -->
          <div class="mt-4 md:mt-6">
            <h3 class="font-display text-lg sm:text-xl font-bold uppercase mb-3 md:mb-4 text-center px-2 text-paper">Choose Your Game</h3>

            <!-- Adult Games Section (Adult Mode Only) -->
            <div v-if="!isFamilyMode" class="mb-6">
              <h4 class="font-display text-base sm:text-lg font-bold uppercase mb-3 text-hot flex items-center gap-2">
                <Icon icon="mdi:fire" class="w-5 h-5" />
                Adult Games
              </h4>
              <div class="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3">
                <button
                  v-for="game in availableGames.filter(g => !g.familyFriendly)"
                  :key="game.value"
                  @click="gameStore.setSelectedGame(game.value); punchScale($event.currentTarget)"
                  :class="gameStore.selectedGame === game.value
                    ? 'border-hot bg-hot/15 shadow-hard-sm'
                    : 'border-white/10 hover:border-hot/40 bg-card'"
                  class="p-3 sm:p-4 border-2 rounded-lg transition-all flex flex-col items-center relative group"
                >
                  <div class="w-12 h-12 sm:w-14 sm:h-14 mb-3 flex items-center justify-center text-hot group-hover:scale-110 transition-transform">
                    <Icon :icon="game.icon" class="w-8 h-8 sm:w-9 sm:h-9" />
                  </div>
                  <span class="font-display font-bold uppercase text-sm sm:text-base text-center leading-tight mb-1 text-paper">{{ game.name }}</span>
                  <span class="text-xs text-paper/60 text-center">{{ game.description }}</span>
                </button>
              </div>
            </div>

            <!-- Friendly Games Section (Adult Mode) -->
            <div v-if="!isFamilyMode" class="mb-6">
              <h4 class="font-display text-base sm:text-lg font-bold uppercase mb-3 text-volt flex items-center gap-2">
                <Icon icon="mdi:heart-multiple" class="w-5 h-5" />
                Friendly Games
              </h4>
              <div class="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3">
                <button
                  v-for="game in availableGames.filter(g => g.familyFriendly)"
                  :key="game.value"
                  @click="gameStore.setSelectedGame(game.value); punchScale($event.currentTarget)"
                  :class="gameStore.selectedGame === game.value
                    ? 'border-volt bg-volt/15 shadow-hard-sm'
                    : 'border-white/10 hover:border-volt/40 bg-card'"
                  class="p-4 sm:p-5 border-2 rounded-lg transition-all flex flex-col items-center relative group"
                >
                  <div class="w-12 h-12 sm:w-14 sm:h-14 mb-3 flex items-center justify-center text-volt group-hover:scale-110 transition-transform">
                    <Icon :icon="game.icon" class="w-8 h-8 sm:w-9 sm:h-9" />
                  </div>
                  <span class="font-display font-bold uppercase text-sm sm:text-base text-center leading-tight mb-1 text-paper">{{ game.name }}</span>
                  <span class="text-xs text-paper/60 text-center">{{ game.description }}</span>
                </button>
              </div>
            </div>

            <!-- Family Mode Games -->
            <div v-if="isFamilyMode" class="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
              <button
                v-for="game in availableGames"
                :key="game.value"
                @click="gameStore.setSelectedGame(game.value); punchScale($event.currentTarget)"
                :class="gameStore.selectedGame === game.value
                  ? 'border-volt bg-volt/15 shadow-hard-sm'
                  : 'border-white/10 hover:border-volt/40 bg-card'"
                class="p-4 sm:p-5 border-2 rounded-lg transition-all flex flex-col items-center relative group"
              >
                <div class="w-12 h-12 sm:w-14 sm:h-14 mb-3 flex items-center justify-center text-volt group-hover:scale-110 transition-transform">
                  <Icon :icon="game.icon" class="w-8 h-8 sm:w-9 sm:h-9" />
                </div>
                <span class="font-display font-bold uppercase text-sm sm:text-base text-center leading-tight mb-1 text-paper">{{ game.name }}</span>
                <span class="text-xs text-paper/60 text-center">{{ game.description }}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Navigation: sticky so Continue/Start Game stay reachable regardless
           of how long the player list or game grid above gets. -->
      <StickyActionBar>
        <div class="w-full">
          <p v-if="proceedHint" class="text-center text-hot text-xs sm:text-sm mb-2 flex items-center justify-center gap-1.5">
            <Icon icon="mdi:alert" class="w-4 h-4" />
            {{ proceedHint }}
          </p>
          <div class="flex justify-between gap-2 sm:gap-3">
            <button
              v-if="currentStep > 0"
              @click="previousStep(); punchScale($event.currentTarget)"
              class="bg-card border border-white/10 hover:bg-white/5 px-4 sm:px-5 md:px-6 py-2.5 sm:py-3 rounded-md text-sm sm:text-base font-display uppercase tracking-wide transition-all flex items-center gap-1.5 sm:gap-2"
            >
              <Icon icon="mdi:arrow-left" class="w-4 h-4 sm:w-5 sm:h-5" />
              <span class="hidden xs:inline">Back</span>
            </button>
            <div v-else></div>

            <button
              v-if="currentStep < steps.length - 1"
              @click="nextStep(); punchScale($event.currentTarget)"
              :disabled="!canProceed"
              class="bg-hot text-paper shadow-hard hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none px-6 sm:px-7 md:px-8 py-2.5 sm:py-3 rounded-md text-sm sm:text-base font-display font-bold uppercase tracking-wide transition-[filter] flex items-center gap-1.5 sm:gap-2 ml-auto"
            >
              <span>Continue</span>
              <Icon icon="mdi:arrow-right" class="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
            <button
              v-else
              @click="handleStartGame($event)"
              :disabled="!gameStore.canStartGame"
              class="bg-volt text-ink shadow-hard hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none px-6 sm:px-7 md:px-8 py-2.5 sm:py-3 rounded-md text-sm sm:text-base font-display font-bold uppercase tracking-wide transition-[filter] flex items-center gap-1.5 sm:gap-2 ml-auto"
            >
              <Icon icon="mdi:play" class="w-4 h-4 sm:w-5 sm:h-5" />
              <span>Start Game</span>
            </button>
          </div>
        </div>
      </StickyActionBar>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, nextTick } from "vue";
import { Icon } from "@iconify/vue";
import { useGameStore } from "~/stores/game";
import { useAnalytics } from "~/composables/useAnalytics";
import { navigateTo } from "#app";
import { staggerReveal, punchScale, celebrateBurst } from "~/composables/useGameAnimations";

const gameStore = useGameStore();
const { trackGameSelection, trackPageView } = useAnalytics();

const route = useRoute();
const isFamilyMode = computed(() => route.query.mode === 'family');

const currentStep = ref(0);
const tempPlayers = ref([
  { id: generateId(), name: "", gender: "male" },
  { id: generateId(), name: "", gender: "female" },
]);
const resumedPlayers = ref(false);

// Animation refs
const headerRef = ref(null);
const stepBodyRef = ref(null);

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

// Short reason Continue/Start Game is disabled, shown right next to the
// sticky nav bar (not just near the player list, which can scroll out of
// view before the button does).
const proceedHint = computed(() => {
  if (canProceed.value) return null;
  const playerStep = isFamilyMode.value ? 0 : 1;
  const gameStep = isFamilyMode.value ? 1 : 2;
  if (!isFamilyMode.value && currentStep.value === 0) return "Choose a game mode to continue";
  if (currentStep.value === playerStep) {
    return tempPlayers.value.length < 2 ? "Add at least 2 players" : "All players need a name";
  }
  if (currentStep.value === gameStep) return "Pick a game to continue";
  return null;
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
  animateStepBody();
}

function previousStep() {
  if (currentStep.value > 0) {
    currentStep.value--;
  }
  animateStepBody();
}

function animateStepBody() {
  nextTick(() => staggerReveal([stepBodyRef.value]));
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

const handleStartGame = (evt) => {
  celebrateBurst(evt?.currentTarget);
  startGame();
};

// Track page view on mount
onMounted(() => {
  trackPageView("setup");

  // Load existing state if available
  gameStore.loadFromLocalStorage();

  // If players exist, populate temp players
  if (gameStore.players.length > 0) {
    resumedPlayers.value = true;
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

  staggerReveal([headerRef.value, stepBodyRef.value]);
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
  color: rgba(242, 236, 230, 0.4);
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
    background-color: #0a0a0d !important;
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

  /* Use 100dvh on setup container so inner scroll works on iOS */
  @supports (height: 100dvh) {
    [data-setup-container] {
      height: 100dvh !important;
    }
    [data-setup-container] > div {
      max-height: 100dvh !important;
    }
  }
  /* Do NOT set html/body overflow:hidden here – it breaks scroll on lobby/index on iPhone */
}
</style>
