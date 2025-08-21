<template>
  <div class="min-h-screen bg-gradient-to-br from-purple-900 via-pink-900 to-red-900 flex items-center justify-center p-4">
    <div class="max-w-2xl w-full">
      <div class="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-8 shadow-2xl">
        
        <!-- Header -->
        <div class="text-center mb-8">
          <div class="text-6xl mb-4">🎮</div>
          <h1 class="text-4xl font-bold text-white mb-2">Game Setup</h1>
          <p class="text-white/70">Configure your players and game mode</p>
        </div>

        <!-- Game Mode Selection -->
        <div class="mb-8">
          <h2 class="text-xl font-semibold text-white mb-4 text-center">Choose Game Mode</h2>
          <div class="flex bg-gray-800/60 rounded-xl p-1.5 max-w-md mx-auto shadow-inner">
            <button
              @click="gameMode = 'free-for-all'"
              class="flex-1 px-6 py-4 rounded-lg transition-all duration-300 text-sm font-semibold flex items-center justify-center gap-2 relative overflow-hidden"
              :class="gameMode === 'free-for-all'
                ? 'bg-gradient-to-r from-pink-500 to-purple-500 text-white shadow-lg transform scale-105'
                : 'text-gray-300 hover:text-white hover:bg-white/5'"
            >
              <span class="text-xl">🎉</span>
              <span>Free-for-All</span>
            </button>
            <button
              @click="gameMode = 'relationship'"
              class="flex-1 px-6 py-4 rounded-lg transition-all duration-300 text-sm font-semibold flex items-center justify-center gap-2 relative overflow-hidden"
              :class="gameMode === 'relationship'
                ? 'bg-gradient-to-r from-red-500 to-pink-500 text-white shadow-lg transform scale-105'
                : 'text-gray-300 hover:text-white hover:bg-white/5'"
            >
              <span class="text-xl">💕</span>
              <span>Relationship</span>
            </button>
          </div>
          <div class="text-center mt-3">
            <p class="text-sm text-white/60">
              {{ gameMode === 'free-for-all' 
                ? 'Everyone plays together - perfect for groups' 
                : 'Designed for couples and intimate play' }}
            </p>
          </div>
        </div>

        <!-- Players Section -->
        <div class="mb-8">
          <div class="flex items-center justify-between mb-4">
            <h2 class="text-xl font-semibold text-white">Players</h2>
            <span class="text-sm text-white/60">{{ players.length }} player{{ players.length !== 1 ? 's' : '' }}</span>
          </div>

          <!-- Player List -->
          <div class="space-y-3 mb-6">
            <div 
              v-for="(player, index) in players" 
              :key="player.id"
              class="flex items-center gap-4 bg-white/5 rounded-lg p-4 border border-white/10"
            >
              <div class="flex-shrink-0">
                <div class="w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-white font-bold">
                  {{ player.name.charAt(0).toUpperCase() }}
                </div>
              </div>
              <div class="flex-1">
                <input
                  v-model="player.name"
                  class="bg-transparent text-white placeholder-white/50 border-none outline-none text-lg font-medium w-full"
                  :placeholder="`Player ${index + 1}`"
                  @blur="saveSession"
                />
              </div>
              <div class="flex gap-2">
                <button
                  @click="player.gender = 'male'"
                  class="px-3 py-1 rounded-full text-xs font-medium transition-all"
                  :class="player.gender === 'male' 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-white/10 text-white/70 hover:bg-white/20'"
                >
                  ♂️ Male
                </button>
                <button
                  @click="player.gender = 'female'"
                  class="px-3 py-1 rounded-full text-xs font-medium transition-all"
                  :class="player.gender === 'female' 
                    ? 'bg-pink-500 text-white' 
                    : 'bg-white/10 text-white/70 hover:bg-white/20'"
                >
                  ♀️ Female
                </button>
              </div>
              <button
                @click="removePlayer(player.id)"
                v-if="players.length > 1"
                class="text-red-400 hover:text-red-300 p-2 hover:bg-red-500/20 rounded-full transition-all"
              >
                <Icon icon="mdi:close" class="w-4 h-4" />
              </button>
            </div>
          </div>

          <!-- Add Player Button -->
          <button
            @click="addPlayer"
            v-if="players.length < 8"
            class="w-full py-4 border-2 border-dashed border-white/30 rounded-lg text-white/70 hover:text-white hover:border-white/50 transition-all flex items-center justify-center gap-2"
          >
            <Icon icon="mdi:plus" class="w-5 h-5" />
            Add Player
          </button>
        </div>

        <!-- Action Buttons -->
        <div class="flex gap-4">
          <UButton 
            @click="goToHome" 
            color="white" 
            variant="soft" 
            size="lg" 
            class="flex-1"
          >
            Back to Home
          </UButton>
          <UButton 
            @click="startPlaying" 
            color="primary" 
            size="lg" 
            class="flex-1"
            :disabled="players.length === 0 || !allPlayersHaveNames"
          >
            Start Playing! 🎮
          </UButton>
        </div>

        <div v-if="!allPlayersHaveNames" class="mt-4 text-center">
          <p class="text-sm text-yellow-300">⚠️ Please name all players to continue</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ 
  layout: false 
})

interface Player {
  id: number
  name: string
  gender: 'male' | 'female'
}

// Reactive state
const gameMode = ref<'free-for-all' | 'relationship'>('free-for-all')
const players = ref<Player[]>([
  { id: 1, name: '', gender: 'male' },
  { id: 2, name: '', gender: 'female' }
])

// Computed
const allPlayersHaveNames = computed(() => {
  return players.value.every(player => player.name.trim().length > 0)
})

// Player management
function addPlayer() {
  if (players.value.length < 8) {
    const newId = Math.max(...players.value.map(p => p.id), 0) + 1
    players.value.push({
      id: newId,
      name: '',
      gender: 'male'
    })
    saveSession()
  }
}

function removePlayer(playerId: number) {
  if (players.value.length > 1) {
    players.value = players.value.filter(player => player.id !== playerId)
    saveSession()
  }
}

// Session management
function saveSession() {
  if (typeof window !== 'undefined') {
    const session = {
      mode: gameMode.value,
      players: players.value
    }
    localStorage.setItem('gameSession', JSON.stringify(session))
  }
}

function loadSession() {
  if (typeof window !== 'undefined') {
    const savedSession = localStorage.getItem('gameSession')
    if (savedSession) {
      try {
        const session = JSON.parse(savedSession)
        if (session.mode) {
          gameMode.value = session.mode
        }
        if (session.players && Array.isArray(session.players) && session.players.length > 0) {
          players.value = session.players
        }
      } catch (error) {
        console.error('Error loading session:', error)
      }
    }
  }
}

// Navigation
function goToHome() {
  navigateTo('/')
}

function startPlaying() {
  if (allPlayersHaveNames.value) {
    saveSession()
    // Navigate to game selection or first game
    navigateTo('/')
  }
}

// Watch for changes
watch([gameMode, players], () => {
  saveSession()
}, { deep: true })

// Lifecycle
onMounted(() => {
  loadSession()
})
</script>