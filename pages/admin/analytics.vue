<template>
  <div>
    <div class="max-w-7xl mx-auto">
      <div class="flex items-center justify-between mb-6">
        <h1 class="text-3xl font-bold">Admin Analytics Dashboard</h1>
        <NuxtLink to="/" class="text-sm text-white/80 hover:text-white">Back to Home</NuxtLink>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-5 gap-4 md:gap-6 mb-6">
        <div class="bg-white/10 border border-white/10 rounded-xl p-5">
          <div class="text-white/80 text-sm">Active Sessions</div>
          <div class="text-3xl font-bold text-green-400">{{ gameCards?.activeSessions ?? 0 }}</div>
          <div class="text-xs text-white/60 mt-1">Games in progress</div>
        </div>
        <div class="bg-white/10 border border-white/10 rounded-xl p-5">
          <div class="text-white/80 text-sm">Waiting Sessions</div>
          <div class="text-3xl font-bold text-yellow-400">{{ gameCards?.waitingSessions ?? 0 }}</div>
          <div class="text-xs text-white/60 mt-1">In lobby</div>
        </div>
        <div class="bg-white/10 border border-white/10 rounded-xl p-5">
          <div class="text-white/80 text-sm">Total Sessions</div>
          <div class="text-3xl font-bold text-blue-400">{{ gameCards?.totalSessions ?? 0 }}</div>
          <div class="text-xs text-white/60 mt-1">All time</div>
        </div>
        <div class="bg-white/10 border border-white/10 rounded-xl p-5">
          <div class="text-white/80 text-sm">Total Players</div>
          <div class="text-3xl font-bold text-purple-400">{{ gameCards?.totalPlayers ?? 0 }}</div>
          <div class="text-xs text-white/60 mt-1">Across all games</div>
        </div>
        <div class="bg-white/10 border border-white/10 rounded-xl p-5">
          <div class="text-white/80 text-sm">Active Players</div>
          <div class="text-3xl font-bold text-pink-400">{{ stats?.activePlayers ?? 0 }}</div>
          <div class="text-xs text-white/60 mt-1">Recently active</div>
        </div>
      </div>

      <!-- Game Cards Section -->
      <div class="mb-6">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-2xl font-bold">Game Sessions</h2>
          <div class="flex gap-2">
            <button 
              @click="selectedFilter = 'all'" 
              :class="selectedFilter === 'all' ? 'bg-purple-600' : 'bg-white/10'"
              class="px-3 py-1 rounded text-sm"
            >
              All ({{ gameCards?.gameCards?.length ?? 0 }})
            </button>
            <button 
              @click="selectedFilter = 'active'" 
              :class="selectedFilter === 'active' ? 'bg-green-600' : 'bg-white/10'"
              class="px-3 py-1 rounded text-sm"
            >
              Active ({{ gameCards?.activeSessions ?? 0 }})
            </button>
            <button 
              @click="selectedFilter = 'waiting'" 
              :class="selectedFilter === 'waiting' ? 'bg-yellow-600' : 'bg-white/10'"
              class="px-3 py-1 rounded text-sm"
            >
              Waiting ({{ gameCards?.waitingSessions ?? 0 }})
            </button>
          </div>
        </div>
        
        <!-- Game Cards Grid -->
        <div v-if="filteredGameCards && filteredGameCards.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div 
            v-for="game in filteredGameCards" 
            :key="game.id"
            class="bg-white/10 border border-white/10 rounded-xl p-5 hover:bg-white/15 transition-all duration-200"
            :class="{
              'border-green-500/50 bg-green-500/10': game.isActive,
              'border-yellow-500/50 bg-yellow-500/10': game.isWaiting,
              'border-gray-500/50': !game.isActive && !game.isWaiting
            }"
          >
            <div class="flex items-center justify-between mb-3">
              <div class="flex items-center gap-2">
                <div class="text-lg">{{ getGameEmoji(game.gameType) }}</div>
                <div>
                  <h3 class="font-semibold text-white">{{ game.name }}</h3>
                  <p class="text-xs text-white/60">{{ formatGameType(game.gameType) }}</p>
                </div>
              </div>
              <div 
                class="px-2 py-1 rounded text-xs font-semibold"
                :class="getStatusColor(game.status)"
              >
                {{ formatStatus(game.status) }}
              </div>
            </div>
            
            <div class="space-y-2 mb-4">
              <div class="flex justify-between text-sm">
                <span class="text-white/80">Players:</span>
                <span class="font-semibold text-white">{{ game.playerCount }}/{{ game.maxPlayers }}</span>
              </div>
              <div class="flex justify-between text-sm">
                <span class="text-white/80">Code:</span>
                <span class="font-mono text-white">{{ game.code }}</span>
              </div>
              <div class="flex justify-between text-sm">
                <span class="text-white/80">Creator:</span>
                <span class="text-white">{{ game.creator }}</span>
              </div>
              <div class="flex justify-between text-sm">
                <span class="text-white/80">Updated:</span>
                <span class="text-white/60">{{ formatTime(game.updatedAt) }}</span>
              </div>
            </div>

            <!-- Players List -->
            <div v-if="game.players && game.players.length > 0" class="border-t border-white/10 pt-3">
              <div class="text-xs text-white/80 mb-2">Players in game:</div>
              <div class="flex flex-wrap gap-1">
                <div 
                  v-for="player in game.players.slice(0, 6)" 
                  :key="player.id"
                  class="px-2 py-1 bg-white/5 rounded text-xs"
                  :class="{
                    'bg-red-500/20 text-red-300': player.isEliminated,
                    'bg-green-500/20 text-green-300': player.isReady && !player.isEliminated,
                    'bg-gray-500/20 text-gray-300': !player.isReady && !player.isEliminated
                  }"
                  :title="`${player.name} - ${player.isEliminated ? 'Eliminated' : player.isReady ? 'Ready' : 'Not Ready'}`"
                >
                  {{ player.name }}
                </div>
                <div v-if="game.players.length > 6" class="px-2 py-1 bg-white/5 rounded text-xs text-white/60">
                  +{{ game.players.length - 6 }} more
                </div>
              </div>
            </div>

            <!-- Progress Bar for Player Count -->
            <div class="mt-3">
              <div class="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                <div 
                  class="h-2 rounded-full transition-all duration-300"
                  :class="game.isActive ? 'bg-gradient-to-r from-green-500 to-emerald-500' : 'bg-gradient-to-r from-purple-500 to-pink-500'"
                  :style="{ width: `${Math.min((game.playerCount / game.maxPlayers) * 100, 100)}%` }"
                ></div>
              </div>
            </div>
          </div>
        </div>
        
        <div v-else class="text-center py-12">
          <div class="text-4xl mb-4">🎮</div>
          <h3 class="text-xl font-semibold mb-2">No Games Found</h3>
          <p class="text-white/60">{{ getEmptyStateMessage() }}</p>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        <div class="bg-white/10 border border-white/10 rounded-xl p-5">
          <div class="flex items-center justify-between mb-4">
            <h2 class="text-xl font-semibold">Popular Games</h2>
          </div>
          <div v-if="stats && Object.keys(stats.popularGames || {}).length" class="space-y-3">
            <div v-for="(count, game) in stats.popularGames" :key="game" class="space-y-1">
              <div class="flex justify-between text-sm">
                <span class="text-white/80">{{ game }}</span>
                <span class="font-semibold">{{ count }}</span>
              </div>
              <div class="w-full h-2 bg-white/10 rounded-full">
                <div class="h-2 rounded-full bg-gradient-to-r from-pink-500 to-purple-500" :style="{ width: `${Math.min((count / maxGameCount) * 100, 100)}%` }"></div>
              </div>
            </div>
          </div>
          <div v-else class="text-white/80 text-sm">No data yet.</div>
        </div>

        <div class="bg-white/10 border border-white/10 rounded-xl p-5">
          <div class="flex items-center justify-between mb-4">
            <h2 class="text-xl font-semibold">Recent Events</h2>
          </div>
          <div class="space-y-2 max-h-80 overflow-y-auto">
            <div v-for="evt in stats?.recentEvents || []" :key="evt.id" class="p-3 rounded-lg bg-white/10 border border-white/10">
              <div class="text-sm flex items-center justify-between">
                <span class="font-semibold">{{ evt.type }}</span>
                <span class="text-white/70">{{ new Date(evt.timestamp).toLocaleString() }}</span>
              </div>
              <div class="text-xs text-white/80">User: {{ evt.userId || 'unknown' }} · Session: {{ evt.sessionId || 'unknown' }}</div>
              <div v-if="evt.page" class="text-xs text-white/80">Page: {{ evt.page }}</div>
              <div v-if="evt.game" class="text-xs text-white/80">Game: {{ evt.game }}</div>
            </div>
          </div>
        </div>
      </div>

      <div class="mt-6 flex gap-3">
        <button @click="refresh" class="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 border border-white/20">Refresh</button>
        <button @click="exportJson" class="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 border border-white/20">Export JSON</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
definePageMeta({ 
  layout: 'admin',
  middleware: 'admin'
})

const stats = ref<any>(null)
const gameCards = ref<any>(null)
const selectedFilter = ref('all')

const fetchStats = async () => {
  stats.value = await $fetch('/api/analytics/stats')
}

const fetchGameCards = async () => {
  gameCards.value = await $fetch('/api/analytics/game-cards')
}

const filteredGameCards = computed(() => {
  if (!gameCards.value?.gameCards) return []
  
  const cards = gameCards.value.gameCards
  
  switch (selectedFilter.value) {
    case 'active':
      return cards.filter((game: any) => game.isActive)
    case 'waiting':
      return cards.filter((game: any) => game.isWaiting)
    default:
      return cards
  }
})

const maxGameCount = computed(() => {
  const vals = Object.values(stats.value?.popularGames || {}) as number[]
  return Math.max(1, ...(vals.length ? vals : [1]))
})

const refresh = async () => {
  await Promise.all([fetchStats(), fetchGameCards()])
}

const exportJson = () => {
  const data = {
    generalStats: stats.value,
    gameCards: gameCards.value
  }
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `analytics-${Date.now()}.json`
  a.click()
  URL.revokeObjectURL(url)
}

// Utility functions for formatting
const getGameEmoji = (gameType: string) => {
  const emojis: Record<string, string> = {
    'TRUTH_OR_DARE': '💋',
    'DO_OR_DRINK': '🍻',
    'DICE_OF_DESIRE': '🎲',
    'NEVER_HAVE_I_EVER': '🤫',
    'WOULD_YOU_RATHER': '🤔',
    'MOST_LIKELY_TO': '👑'
  }
  return emojis[gameType] || '🎮'
}

const formatGameType = (gameType: string) => {
  return gameType.replace(/_/g, ' ')
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ')
}

const formatStatus = (status: string) => {
  const statusMap: Record<string, string> = {
    'LOBBY': 'Waiting',
    'IN_PROGRESS': 'Active',
    'COMPLETED': 'Completed',
    'CANCELLED': 'Cancelled'
  }
  return statusMap[status] || status
}

const getStatusColor = (status: string) => {
  const colorMap: Record<string, string> = {
    'LOBBY': 'bg-yellow-500/20 text-yellow-300',
    'IN_PROGRESS': 'bg-green-500/20 text-green-300',
    'COMPLETED': 'bg-blue-500/20 text-blue-300',
    'CANCELLED': 'bg-red-500/20 text-red-300'
  }
  return colorMap[status] || 'bg-gray-500/20 text-gray-300'
}

const formatTime = (timestamp: string) => {
  return new Date(timestamp).toLocaleString()
}

const getEmptyStateMessage = () => {
  switch (selectedFilter.value) {
    case 'active':
      return 'No active games at the moment'
    case 'waiting':
      return 'No games waiting for players'
    default:
      return 'No game sessions have been created yet'
  }
}

onMounted(async () => {
  await Promise.all([fetchStats(), fetchGameCards()])
})
</script>

<style>
</style>


