<template>
  <div class="overflow-x-hidden overflow-y-auto pb-6">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
      <div>
        <h1 class="text-2xl sm:text-3xl md:text-4xl font-bold">Analytics Dashboard</h1>
        <p class="text-white/60 text-sm mt-1">Real-time analytics and insights</p>
      </div>
      <div class="flex gap-2">
        <button 
          @click="refresh" 
          :disabled="loading"
          class="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 border border-white/20 text-sm font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          <Icon v-if="loading" name="mdi:loading" class="w-4 h-4 animate-spin" />
          <Icon v-else name="mdi:refresh" class="w-4 h-4" />
          {{ loading ? 'Refreshing...' : 'Refresh' }}
        </button>
        <NuxtLink to="/" class="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 border border-white/20 text-sm font-medium transition-all">
          Home
        </NuxtLink>
      </div>
    </div>

    <!-- All-time unique users (persistent, works offline) -->
    <div class="mb-6 p-5 sm:p-6 bg-gradient-to-br from-violet-500/20 via-fuchsia-500/10 to-transparent border border-violet-400/30 rounded-xl relative overflow-hidden">
      <div class="absolute bottom-0 right-0 w-48 h-48 bg-violet-500/10 rounded-full -mr-24 -mb-24"></div>
      <div class="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 class="text-sm font-medium text-white/70 uppercase tracking-wider mb-1">All-time unique users</h2>
          <p class="text-4xl sm:text-5xl font-bold text-white">
            {{ allTimeUniqueUsers }}
          </p>
          <p class="text-white/60 text-sm mt-2">Unique visitors ever (stored; visible even when they’re offline)</p>
        </div>
        <div class="flex items-center gap-2 text-white/60 text-sm">
          <Icon name="mdi:account-group" class="w-8 h-8 text-violet-400/80" />
          <span v-if="stats?.dbAvailable === false">From backup store</span>
          <span v-else>From database</span>
        </div>
      </div>
    </div>

    <!-- DB unavailable notice -->
    <div v-if="stats && stats.dbAvailable === false" class="mb-4 p-4 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center gap-2">
      <Icon name="mdi:database-off" class="w-5 h-5 text-amber-400 shrink-0" />
      <p class="text-amber-200 text-sm">Database temporarily unavailable. Showing real-time counts only; historical stats will appear when the database is back.</p>
    </div>

    <!-- Real-time Stats -->
    <div class="mb-6 p-4 sm:p-6 bg-gradient-to-r from-green-500/10 via-blue-500/10 to-purple-500/10 border border-green-500/20 rounded-xl relative overflow-hidden">
      <div class="absolute top-0 right-0 w-32 h-32 bg-green-500/5 rounded-full -mr-16 -mt-16"></div>
      <div class="relative z-10">
        <div class="flex items-center justify-between mb-4">
          <div class="flex items-center gap-2">
            <div :class="isConnected ? 'bg-green-400' : 'bg-red-400'" class="w-3 h-3 rounded-full animate-pulse"></div>
            <span class="text-sm font-semibold" :class="isConnected ? 'text-green-400' : 'text-red-400'">
              {{ isConnected ? 'LIVE' : 'DISCONNECTED' }}
            </span>
          </div>
          <div class="text-xs text-white/60">Updates every 5 seconds</div>
        </div>
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div class="bg-white/5 rounded-lg p-3 border border-white/10">
            <div class="text-white/70 text-xs mb-1 font-medium">Active Users</div>
            <div class="text-2xl sm:text-3xl font-bold text-green-400">{{ effectiveRealtime?.totalActiveUsers ?? 0 }}</div>
            <div class="text-white/50 text-xs mt-1">Currently on site (incl. one-device)</div>
          </div>
          <div class="bg-white/5 rounded-lg p-3 border border-white/10">
            <div class="text-white/70 text-xs mb-1 font-medium">In Games</div>
            <div class="text-2xl sm:text-3xl font-bold text-purple-400">{{ effectiveRealtime?.usersInGames ?? 0 }}</div>
            <div class="text-white/50 text-xs mt-1">Playing now</div>
          </div>
          <div class="bg-white/5 rounded-lg p-3 border border-white/10">
            <div class="text-white/70 text-xs mb-1 font-medium">Active Rooms</div>
            <div class="text-2xl sm:text-3xl font-bold text-blue-400">{{ effectiveRealtime?.activeRooms ?? 0 }}</div>
            <div class="text-white/50 text-xs mt-1">Multiplayer sessions</div>
          </div>
          <div class="bg-white/5 rounded-lg p-3 border border-white/10">
            <div class="text-white/70 text-xs mb-1 font-medium">In Lobby</div>
            <div class="text-2xl sm:text-3xl font-bold text-cyan-400">{{ effectiveRealtime?.usersInLobby ?? 0 }}</div>
            <div class="text-white/50 text-xs mt-1">Waiting to play</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Historical Stats -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <div class="bg-white/10 border border-white/10 rounded-xl p-4 sm:p-5">
        <div class="text-white/80 text-sm mb-1">Active Players</div>
        <div class="text-2xl sm:text-3xl font-bold text-green-400">{{ stats?.activePlayers ?? 0 }}</div>
        <div class="text-xs text-white/60 mt-1">Last hour</div>
      </div>
      <div class="bg-white/10 border border-white/10 rounded-xl p-4 sm:p-5">
        <div class="text-white/80 text-sm mb-1">Active Sessions</div>
        <div class="text-2xl sm:text-3xl font-bold text-blue-400">{{ stats?.activeSessions ?? 0 }}</div>
        <div class="text-xs text-white/60 mt-1">Games in progress</div>
      </div>
      <div class="bg-white/10 border border-white/10 rounded-xl p-4 sm:p-5">
        <div class="text-white/80 text-sm mb-1">Total Users</div>
        <div class="text-2xl sm:text-3xl font-bold">{{ stats?.totalUsers ?? 0 }}</div>
        <div class="text-xs text-white/60 mt-1">All time</div>
      </div>
      <div class="bg-white/10 border border-white/10 rounded-xl p-4 sm:p-5">
        <div class="text-white/80 text-sm mb-1">Total Games</div>
        <div class="text-2xl sm:text-3xl font-bold">{{ stats?.totalGameSessions ?? 0 }}</div>
        <div class="text-xs text-white/60 mt-1">Sessions created</div>
      </div>
    </div>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 mb-6">
        <!-- Popular Games (Real-time) -->
        <div class="bg-white/10 border border-white/10 rounded-xl p-4 sm:p-5">
          <div class="flex items-center justify-between mb-4">
            <h2 class="text-lg sm:text-xl font-semibold">Popular Games (Live)</h2>
            <div v-if="isConnected" class="w-2 h-2 bg-green-400 rounded-full animate-pulse" title="Live"></div>
          </div>
          <div v-if="effectiveRealtime?.popularGames && Object.keys(effectiveRealtime.popularGames).length" class="space-y-3">
            <div v-for="(count, game) in effectiveRealtime.popularGames" :key="game" class="space-y-1">
              <div class="flex justify-between text-sm">
                <span class="text-white/80 capitalize">{{ game.replace('-', ' ') }}</span>
                <span class="font-semibold">{{ count }}</span>
              </div>
              <div class="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                <div 
                  class="h-2 rounded-full bg-gradient-to-r from-pink-500 to-purple-500 transition-all duration-500" 
                  :style="{ width: `${Math.min((count / maxRealtimeGameCount) * 100, 100)}%` }"
                ></div>
              </div>
            </div>
          </div>
          <div v-else class="text-white/60 text-sm text-center py-4">No active games</div>
        </div>

        <!-- Popular Games (Historical) -->
        <div class="bg-white/10 border border-white/10 rounded-xl p-4 sm:p-5">
          <div class="flex items-center justify-between mb-4">
            <h2 class="text-lg sm:text-xl font-semibold">Popular Games (All Time)</h2>
          </div>
          <div v-if="stats && Object.keys(stats.popularGames || {}).length" class="space-y-3">
            <div v-for="(count, game) in stats.popularGames" :key="game" class="space-y-1">
              <div class="flex justify-between text-sm">
                <span class="text-white/80 capitalize">{{ game.replace('-', ' ') }}</span>
                <span class="font-semibold">{{ count }}</span>
              </div>
              <div class="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                <div 
                  class="h-2 rounded-full bg-gradient-to-r from-pink-500 to-purple-500 transition-all duration-500" 
                  :style="{ width: `${Math.min((count / maxGameCount) * 100, 100)}%` }"
                ></div>
              </div>
            </div>
          </div>
          <div v-else class="text-white/60 text-sm text-center py-4">No data yet</div>
        </div>

        <!-- Recent Events -->
        <div class="bg-white/10 border border-white/10 rounded-xl p-4 sm:p-5 lg:col-span-2">
          <div class="flex items-center justify-between mb-4">
            <h2 class="text-lg sm:text-xl font-semibold">Recent Events</h2>
          </div>
          <div class="space-y-2 max-h-80 overflow-y-auto pr-2">
            <div v-for="evt in stats?.recentEvents || []" :key="evt.id" class="p-3 rounded-lg bg-white/10 border border-white/10 hover:bg-white/15 transition-all">
              <div class="text-sm flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <span class="font-semibold">{{ evt.type }}</span>
                <span class="text-white/70 text-xs sm:text-sm">{{ new Date(evt.timestamp).toLocaleString() }}</span>
              </div>
              <div class="text-xs text-white/80 mt-1">User: {{ evt.userId || 'unknown' }} · Session: {{ evt.sessionId || 'unknown' }}</div>
              <div v-if="evt.page" class="text-xs text-white/80">Page: {{ evt.page }}</div>
              <div v-if="evt.game" class="text-xs text-white/80">Game: {{ evt.game }}</div>
            </div>
            <div v-if="!stats?.recentEvents || stats.recentEvents.length === 0" class="text-white/60 text-sm text-center py-4">
              No recent events
            </div>
          </div>
        </div>
      </div>

      <!-- Actions -->
      <div class="flex flex-col sm:flex-row gap-3">
        <button 
          @click="refresh" 
          :disabled="loading"
          class="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 border border-white/20 text-sm font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          <Icon v-if="loading" name="mdi:loading" class="w-4 h-4 animate-spin" />
          <Icon v-else name="mdi:refresh" class="w-4 h-4" />
          {{ loading ? 'Refreshing...' : 'Refresh Data' }}
        </button>
        <button 
          @click="exportJson" 
          class="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 border border-white/20 text-sm font-medium transition-all flex items-center justify-center gap-2"
        >
          <Icon name="mdi:download" class="w-4 h-4" />
          Export JSON
        </button>
      </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useAdminAnalytics } from '~/composables/useAdminAnalytics'

definePageMeta({ 
  layout: 'admin',
  middleware: 'admin'
})

const { realtimeStats, isConnected, fetchStats: fetchRealtimeStats } = useAdminAnalytics()
const stats = ref<any>(null)
const loading = ref(false)

// All-time unique users: from stored analytics (DB or file backup). Always available.
const allTimeUniqueUsers = computed(() =>
  stats.value?.allTimeUniqueUsers ?? stats.value?.totalUsers ?? 0
)

// Prefer live socket stats; fall back to stats.realtime from API (e.g. after refresh)
const effectiveRealtime = computed(() => realtimeStats.value ?? stats.value?.realtime ?? null)

const fetchStats = async () => {
  loading.value = true
  try {
    stats.value = await $fetch('/api/analytics/stats')
    // Refresh real-time stats
    if (fetchRealtimeStats) {
      await fetchRealtimeStats()
    }
  } catch (error) {
    console.error('Failed to fetch stats:', error)
  } finally {
    loading.value = false
  }
}

const maxGameCount = computed(() => {
  const vals = Object.values(stats.value?.popularGames || {}) as number[]
  return Math.max(1, ...(vals.length ? vals : [1]))
})

const maxRealtimeGameCount = computed(() => {
  const vals = Object.values(effectiveRealtime.value?.popularGames || {}) as number[]
  return Math.max(1, ...(vals.length ? vals : [1]))
})

const refresh = () => {
  fetchStats()
}

const exportJson = () => {
  const data = {
    stats: stats.value,
    realtime: effectiveRealtime.value,
    exportedAt: new Date().toISOString()
  }
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `analytics-${Date.now()}.json`
  a.click()
  URL.revokeObjectURL(url)
}

onMounted(() => {
  fetchStats()
})
</script>

<style>
</style>


