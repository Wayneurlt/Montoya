<template>
  <div class="min-h-screen bg-gradient-to-br from-purple-900 via-pink-900 to-red-900 text-white flex items-center justify-center px-4 relative overflow-hidden">
    <!-- Animated background elements -->
    <ClientOnly>
      <div class="absolute inset-0 opacity-20 pointer-events-none">
        <div
          v-for="i in 30"
          :key="i"
          class="absolute rounded-full bg-pink-500 animate-float"
          :style="`left: ${Math.random() * 100}%; top: ${Math.random() * 100}%; 
                     width: ${Math.random() * 10 + 2}px; height: ${Math.random() * 10 + 2}px;
                     animation-delay: ${Math.random() * 5}s;`"
        ></div>
      </div>
    </ClientOnly>

    <div class="max-w-2xl w-full relative z-10">
      <div class="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-8 shadow-2xl text-center">
        <!-- Header -->
        <div class="mb-8">
          <h1 class="text-4xl md:text-5xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-cyan-400 font-bungee">
            Game Setup
          </h1>
          <p class="text-lg text-white/80">
            Who's ready to unleash the chaos?
          </p>
        </div>

        <!-- Player Setup Form -->
        <div v-if="!gameStarted" class="space-y-6">
          <!-- Add Players Section -->
          <div class="text-left">
            <label class="block text-sm font-semibold text-white/90 mb-3">
              Add Players (2-8 players)
            </label>
            <div class="flex gap-3 mb-4">
              <input
                v-model="newPlayerName"
                @keyup.enter="addPlayer"
                type="text"
                placeholder="Enter player name..."
                class="flex-1 px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                maxlength="20"
              />
              <button
                @click="addPlayer"
                :disabled="!newPlayerName.trim() || players.length >= 8"
                class="px-6 py-3 bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 disabled:from-gray-600 disabled:to-gray-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg font-semibold transition-all duration-300"
              >
                Add
              </button>
            </div>
          </div>

          <!-- Players List -->
          <div v-if="players.length > 0" class="text-left">
            <h3 class="text-sm font-semibold text-white/90 mb-3">
              Players ({{ players.length }}/8)
            </h3>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div
                v-for="(player, index) in players"
                :key="index"
                class="flex items-center justify-between bg-white/5 border border-white/10 rounded-lg p-3"
              >
                <div class="flex items-center gap-3">
                  <div class="w-8 h-8 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full flex items-center justify-center text-sm font-bold">
                    {{ index + 1 }}
                  </div>
                  <span class="text-white">{{ player.name }}</span>
                </div>
                <button
                  @click="removePlayer(index)"
                  class="text-red-400 hover:text-red-300 text-sm hover:bg-red-500/20 p-2 rounded transition-colors"
                  title="Remove player"
                >
                  ✕
                </button>
              </div>
            </div>
          </div>

          <!-- Game Selection -->
          <div v-if="players.length >= 2" class="text-left">
            <label class="block text-sm font-semibold text-white/90 mb-3">
              Choose Your Game
            </label>
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div
                v-for="game in availableGames"
                :key="game.id"
                @click="selectGame(game)"
                class="cursor-pointer p-4 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-pink-500/50 rounded-lg transition-all duration-300 group"
                :class="{ 'border-pink-500 bg-pink-500/20': selectedGame?.id === game.id }"
              >
                <div class="text-2xl mb-2">{{ game.emoji }}</div>
                <h4 class="font-semibold text-white group-hover:text-pink-300 transition-colors">
                  {{ game.name }}
                </h4>
                <p class="text-xs text-white/60 mt-1">
                  {{ game.description }}
                </p>
              </div>
            </div>
          </div>

          <!-- Error Messages -->
          <div v-if="error" class="p-4 bg-red-500/20 border border-red-500/30 rounded-lg">
            <p class="text-red-300 text-sm">{{ error }}</p>
          </div>

          <!-- Start Game Button -->
          <button
            v-if="players.length >= 2 && selectedGame"
            @click="startGame"
            :disabled="loading"
            class="w-full bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 disabled:opacity-50 disabled:cursor-not-allowed text-white px-8 py-4 rounded-lg text-lg font-bold shadow-lg hover:shadow-pink-500/30 transition-all duration-300 transform hover:scale-105"
          >
            <span v-if="!loading">START THE GAME! 🚀</span>
            <span v-else class="flex items-center justify-center gap-2">
              <div class="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              Starting Game...
            </span>
          </button>

          <div class="text-center">
            <button
              @click="$router.go(-1)"
              class="text-white/60 hover:text-white text-sm underline transition-colors"
            >
              ← Back to Home
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { navigateTo } from '#app'

definePageMeta({ 
  layout: false 
})

// Reactive data
const players = ref([])
const newPlayerName = ref('')
const selectedGame = ref(null)
const loading = ref(false)
const error = ref('')
const gameStarted = ref(false)

// Available games
const availableGames = reactive([
  {
    id: 'truth-or-dare',
    name: 'Strip Truth or Dare',
    description: 'Clothes optional, honesty mandatory',
    emoji: '💋',
    route: '/game/truth-or-dare'
  },
  {
    id: 'do-or-drink',
    name: 'Do or Drink',
    description: 'No boring choices allowed',
    emoji: '🍻',
    route: '/game/do-or-drink'
  },
  {
    id: 'dice-of-desire',
    name: 'Dice of Desire',
    description: 'Roll for desires you never knew you had',
    emoji: '🎲',
    route: '/game/dice-of-desire'
  },
  {
    id: 'never-have-i-ever',
    name: 'Never Have I Ever',
    description: 'Confess your secrets',
    emoji: '🤫',
    route: '/game/never-have-i-ever'
  },
  {
    id: 'would-you-rather',
    name: 'Would You Rather',
    description: 'Impossible choices await',
    emoji: '🤔',
    route: '/game/would-you-rather'
  },
  {
    id: 'most-likely-to',
    name: 'Most Likely To',
    description: 'Who among you would...',
    emoji: '👑',
    route: '/game/most-likely-to'
  }
])

// Methods
const addPlayer = () => {
  const name = newPlayerName.value.trim()
  if (!name) return
  
  if (players.value.some(p => p.name.toLowerCase() === name.toLowerCase())) {
    error.value = 'Player name already exists!'
    setTimeout(() => error.value = '', 3000)
    return
  }
  
  if (players.value.length >= 8) {
    error.value = 'Maximum 8 players allowed!'
    setTimeout(() => error.value = '', 3000)
    return
  }
  
  players.value.push({
    id: Date.now() + Math.random(),
    name: name
  })
  newPlayerName.value = ''
  error.value = ''
}

const removePlayer = (index) => {
  players.value.splice(index, 1)
}

const selectGame = (game) => {
  selectedGame.value = game
}

const startGame = async () => {
  if (players.value.length < 2) {
    error.value = 'Need at least 2 players to start!'
    return
  }
  
  if (!selectedGame.value) {
    error.value = 'Please select a game!'
    return
  }
  
  loading.value = true
  error.value = ''
  
  try {
    // Create game session
    const gameSession = {
      id: Date.now(),
      players: players.value,
      gameType: selectedGame.value.id,
      createdAt: new Date().toISOString()
    }
    
    // Store game session in localStorage for now
    // In a real app, you'd send this to your backend
    localStorage.setItem('currentGameSession', JSON.stringify(gameSession))
    
    // Navigate to the selected game
    await navigateTo(selectedGame.value.route)
    
  } catch (err) {
    console.error('Error starting game:', err)
    error.value = 'Failed to start game. Please try again.'
  } finally {
    loading.value = false
  }
}

// Auto-focus on input when component mounts
onMounted(() => {
  const input = document.querySelector('input[type="text"]')
  if (input) {
    input.focus()
  }
})
</script>

<style scoped>
@keyframes float {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-20px);
  }
}

.animate-float {
  animation: float 6s ease-in-out infinite;
}

.font-bungee {
  font-family: "Bungee", cursive;
}
</style>