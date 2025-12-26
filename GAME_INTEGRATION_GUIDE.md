# Montoya Game Integration Guide

This guide explains how to integrate the new game state store, connection mode, icebreakers, and two-player mechanics into all games.

## Quick Integration Steps

### 1. Import Required Composables

```vue
<script setup>
import { useGameStore } from "~/stores/game";
import { useGameLogic } from "~/composables/useGameLogic";
import { useAnalytics } from "~/composables/useAnalytics";
</script>
```

### 2. Initialize Store and Logic

```javascript
const gameStore = useGameStore();
const gameLogic = useGameLogic();

// Load state on mount
onMounted(() => {
  gameStore.loadFromLocalStorage();
  if (!gameStore.selectedGame) {
    gameStore.setSelectedGame('your-game-name');
  }
});
```

### 3. Replace Local State with Store

Instead of:
```javascript
const players = ref([]);
const gameMode = ref('free-for-all');
const currentPlayerIndex = ref(0);
```

Use:
```javascript
const players = computed(() => gameStore.players);
const gameMode = computed(() => gameStore.gameMode);
const currentPlayerIndex = computed(() => gameStore.currentPlayerIndex);
const currentPlayer = computed(() => gameStore.currentPlayer);
```

### 4. Add Icebreaker Support

```javascript
const showIcebreaker = ref(false);

// In your prompt generation function:
const getPrompt = () => {
  if (gameLogic.shouldUseIcebreaker()) {
    const icebreaker = gameLogic.getIcebreakerPrompt('TRUTH'); // or 'DARE'
    if (icebreaker) {
      showIcebreaker.value = true;
      return icebreaker;
    }
  }
  
  // Your normal prompt logic here
  const prompt = getNormalPrompt();
  
  // Adapt prompt for context
  return gameLogic.adaptPrompt(prompt, intensity);
};
```

### 5. Add Connection Mode Support

```javascript
const getTarget = () => {
  // Connection mode has no specific target
  if (gameStore.gameMode === 'connection') {
    return null;
  }
  return gameLogic.getTargetPlayer();
};
```

### 6. Add Two-Player Mechanics

```javascript
const mirrorRoundActive = ref(false);
const guessModeActive = ref(false);

watch(() => gameStore.mirrorRoundActive, (active) => {
  mirrorRoundActive.value = active;
});

watch(() => gameStore.guessModeActive, (active) => {
  guessModeActive.value = active;
});

// In your prompt display:
if (mirrorRoundActive.value) {
  // Show "Both players answer" message
}
```

### 7. Complete Rounds Properly

```javascript
const completeRound = () => {
  // Use game logic to handle round completion
  gameLogic.completeRound();
  
  // Reset special modes
  if (mirrorRoundActive.value) {
    gameStore.deactivateMirrorRound();
  }
  if (guessModeActive.value) {
    gameStore.deactivateGuessMode();
  }
  
  // Add prompt to history
  gameStore.addPromptToHistory(promptText);
};
```

### 8. Use Intensity Filtering

```javascript
// When fetching questions from API:
const intensity = gameLogic.getIntensityFilter();

const questions = await $fetch('/api/questions/your-game', {
  query: { intensity }
});
```

## Game-Specific Adaptations

### Dice of Desire
- Use connection mode to make dice results mutual
- In two-player mode, both players perform the action on each other

### Do or Drink
- Replace "drink" with skip/swap/reverse/reveal based on comfort level
- Connection mode: make challenges mutual

### Never Have I Ever
- Focus on "Never Have We Ever" in connection mode
- Add follow-up discussion prompts

### Most Likely To
- In connection mode, both players vote and discuss
- Two-player: both answer and compare

### Would You Rather
- Connection mode: both answer and explain to each other
- Two-player: guess partner's answer first

## UI Components to Add

### Icebreaker Banner
```vue
<div v-if="showIcebreaker" class="mb-6 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 border-2 border-blue-400/50 rounded-xl p-4">
  <div class="flex items-center gap-3">
    <Icon icon="mdi:ice-cream" class="w-8 h-8 text-cyan-400" />
    <div>
      <h4 class="font-bold text-lg">Icebreaker Round</h4>
      <p class="text-sm text-white/80">Starting with a light, conversation-friendly prompt</p>
    </div>
  </div>
</div>
```

### Connection Mode Indicator
```vue
<span v-if="gameMode === 'connection'" class="text-sm px-3 py-1.5 rounded-full bg-green-500/20 text-green-300 border border-green-400/30">
  Connection Mode
</span>
```

### Two-Player Special Mechanics
```vue
<div v-if="mirrorRoundActive" class="mb-4 p-4 bg-purple-500/20 rounded-xl">
  <Icon icon="mdi:mirror" class="w-6 h-6 mb-2" />
  <p class="font-bold">Mirror Round: Both players answer!</p>
</div>
```

## Testing Checklist

- [ ] Game loads with setup data from store
- [ ] Icebreakers show for first 3 rounds (or for strangers)
- [ ] Connection mode filters out isolating prompts
- [ ] Two-player mode activates mirror rounds and guess mode
- [ ] Intensity escalates based on rounds and comfort level
- [ ] Prompts adapt based on relationship type
- [ ] Game state persists across page refreshes




