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
          <p class="text-4xl sm:text-5xl font-bold text-white flex items-center gap-2">
            <template v-if="stats === null && loading">—</template>
            <template v-else>{{ allTimeUniqueUsers }}</template>
            <Icon v-if="backgroundRefreshing" name="mdi:loading" class="w-6 h-6 text-violet-400 animate-spin" />
          </p>
          <p class="text-white/60 text-sm mt-2">Unique visitors ever (stored; visible even when they’re offline)</p>
          <p v-if="lastUpdated" class="text-white/50 text-xs mt-1">Last updated {{ lastUpdated }}</p>
        </div>
        <div class="flex flex-col items-end gap-1">
          <div class="flex items-center gap-2 text-white/60 text-sm">
            <Icon name="mdi:account-group" class="w-8 h-8 text-violet-400/80" />
            <span v-if="stats?.dbAvailable === false">From backup store</span>
            <span v-else>From database</span>
          </div>
          <span class="text-white/40 text-xs">Refreshes every 5s</span>
        </div>
      </div>
    </div>

    <!-- Stats fetch error -->
    <div v-if="statsError" class="mb-4 p-4 rounded-xl bg-red-500/20 border border-red-500/40 flex items-center justify-between gap-2">
      <p class="text-red-200 text-sm">{{ statsError }}</p>
      <button @click="statsError = null; refresh()" class="text-red-300 hover:text-white text-sm font-medium">Retry</button>
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
        <div class="text-white/80 text-sm mb-1">Page views</div>
        <div class="text-2xl sm:text-3xl font-bold text-amber-400">{{ stats?.pageViews ?? 0 }}</div>
        <div class="text-xs text-white/60 mt-1">All time</div>
      </div>
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
        <div class="text-white/80 text-sm mb-1">Total Games</div>
        <div class="text-2xl sm:text-3xl font-bold">{{ stats?.totalGameSessions ?? 0 }}</div>
        <div class="text-xs text-white/60 mt-1">Sessions created</div>
      </div>
    </div>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 mb-6">
        <!-- Popular Games (Live or recent fallback) -->
        <div class="bg-white/10 border border-white/10 rounded-xl p-4 sm:p-5">
          <div class="flex items-center justify-between mb-4">
            <h2 class="text-lg sm:text-xl font-semibold">Popular Games (Live)</h2>
            <div class="flex items-center gap-2">
              <span v-if="liveGamesSource === 'live'" class="text-xs text-green-400 font-medium flex items-center gap-1">
                <span class="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span> Live
              </span>
              <span v-else-if="liveGamesSource === 'recent'" class="text-xs text-amber-400/90">Last 15 min</span>
            </div>
          </div>
          <div v-if="popularGamesForLive && Object.keys(popularGamesForLive).length" class="space-y-3">
            <div v-for="(count, game) in popularGamesForLive" :key="game" class="space-y-1">
              <div class="flex justify-between text-sm">
                <span class="text-white/80 capitalize">{{ String(game).replace(/-/g, ' ') }}</span>
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
          <div v-else class="text-white/60 text-sm text-center py-4">
            <p>No active games right now.</p>
            <p class="text-white/50 text-xs mt-1">Open the site in another tab to see live counts, or refresh after visitors load game pages.</p>
          </div>
        </div>

        <!-- Popular Games (Historical) -->
        <div class="bg-white/10 border border-white/10 rounded-xl p-4 sm:p-5">
          <div class="flex items-center justify-between mb-4">
            <h2 class="text-lg sm:text-xl font-semibold">Popular Games (All Time)</h2>
          </div>
          <div v-if="stats && Object.keys(stats.popularGames || {}).length" class="space-y-3">
            <div v-for="(count, game) in stats.popularGames" :key="game" class="space-y-1">
              <div class="flex justify-between text-sm">
                <span class="text-white/80 capitalize">{{ String(game).replace('-', ' ') }}</span>
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

    <!-- Day-by-day comparison -->
    <div class="mb-6 p-4 sm:p-6 bg-white/10 border border-white/10 rounded-xl">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
        <div>
          <h2 class="text-lg sm:text-xl font-semibold">Daily comparison</h2>
          <p class="text-white/60 text-sm mt-1">Users and game performance by day for analysis</p>
        </div>
        <div class="flex items-center gap-2">
          <span class="text-white/60 text-sm">Last</span>
          <select
            v-model.number="dailyDays"
            @change="fetchDaily"
            :disabled="dailyLoading"
            class="rounded-lg bg-white/10 border border-white/20 text-white px-3 py-2 text-sm focus:ring-2 focus:ring-violet-400 focus:border-transparent disabled:opacity-50"
          >
            <option :value="7">7 days</option>
            <option :value="30">30 days</option>
            <option :value="90">90 days</option>
          </select>
          <button
            v-if="dailyLoading"
            class="p-2 text-white/60"
            disabled
          >
            <Icon name="mdi:loading" class="w-4 h-4 animate-spin" />
          </button>
          <button
            v-else-if="dailyError || dailyData?.error"
            @click="fetchDaily"
            class="px-3 py-2 rounded-lg bg-amber-500/20 border border-amber-500/40 text-amber-200 text-sm font-medium hover:bg-amber-500/30"
          >
            Retry
          </button>
        </div>
      </div>
      <p v-if="dailyError || dailyData?.error" class="text-amber-200/90 text-sm mb-3">{{ dailyError || dailyData?.error }}</p>
      <div class="overflow-x-auto -mx-2">
        <table class="w-full min-w-[640px] text-sm">
          <thead>
            <tr class="text-left text-white/70 border-b border-white/20">
              <th class="pb-2 pr-4 font-semibold">Date</th>
              <th class="pb-2 pr-4 font-semibold text-right">Users</th>
              <th class="pb-2 pr-4 font-semibold text-right">Page views</th>
              <th v-for="slug in dailyGameColumns" :key="slug" class="pb-2 pr-4 font-semibold text-right capitalize">{{ slug.replace(/-/g, ' ') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="row in dailyRowsReversed"
              :key="row.date"
              class="border-b border-white/10 hover:bg-white/5"
            >
              <td class="py-2 pr-4 text-white/90">{{ formatDailyDate(row.date) }}</td>
              <td class="py-2 pr-4 text-right text-amber-300 font-medium">{{ row.uniqueUsers }}</td>
              <td class="py-2 pr-4 text-right text-white/80">{{ row.pageViews }}</td>
              <td v-for="slug in dailyGameColumns" :key="slug" class="py-2 pr-4 text-right text-white/70">{{ row.games && row.games[slug] != null ? row.games[slug] : '—' }}</td>
            </tr>
            <tr v-if="!dailyRowsReversed.length && !dailyLoading" class="text-white/60 text-center py-6">
              <td :colspan="3 + dailyGameColumns.length">No daily data yet</td>
            </tr>
          </tbody>
        </table>
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
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useAdminAnalytics } from '~/composables/useAdminAnalytics'

definePageMeta({ 
  layout: 'admin',
  middleware: 'admin'
})

const { realtimeStats, isConnected, fetchStats: fetchRealtimeStats } = useAdminAnalytics()
const stats = ref<any>(null)
const loading = ref(false)
const backgroundRefreshing = ref(false)
const lastUpdated = ref<string | null>(null)
const statsError = ref<string | null>(null)

const dailyData = ref<{ days: { date: string; uniqueUsers: number; pageViews: number; games: Record<string, number> }[]; gameSlugs: string[]; error?: string } | null>(null)
const dailyLoading = ref(false)
const dailyError = ref<string | null>(null)
const dailyDays = ref(30)

// All-time unique users: from stored analytics (DB or file backup). Always available.
const allTimeUniqueUsers = computed(() =>
  stats.value?.allTimeUniqueUsers ?? stats.value?.totalUsers ?? 0
)

// Prefer live socket stats; fall back to stats.realtime from API (e.g. after refresh)
const effectiveRealtime = computed(() => realtimeStats.value ?? stats.value?.realtime ?? null)

// Popular Games (Live): use socket data when present, else fall back to recent 15-min activity from API
const popularGamesForLive = computed(() => {
  const live = effectiveRealtime.value?.popularGames
  if (live && Object.keys(live).length > 0) return live
  const recent = stats.value?.recentGameActivity
  if (recent && Object.keys(recent).length > 0) return recent
  return null
})
const liveGamesSource = computed(() => {
  const live = effectiveRealtime.value?.popularGames
  if (live && Object.keys(live).length > 0) return 'live'
  if (stats.value?.recentGameActivity && Object.keys(stats.value.recentGameActivity).length > 0) return 'recent'
  return null
})

const fetchStats = async (silent = false) => {
  if (silent) backgroundRefreshing.value = true
  else loading.value = true
  statsError.value = null
  try {
    stats.value = await $fetch('/api/analytics/stats')
    lastUpdated.value = stats.value?.lastUpdated
      ? new Date(stats.value.lastUpdated).toLocaleTimeString()
      : new Date().toLocaleTimeString()
    if (fetchRealtimeStats) {
      await fetchRealtimeStats()
    }
  } catch (error: any) {
    const msg = error?.data?.message || error?.message || 'Failed to load analytics'
    statsError.value = msg
    if (!silent) console.error('Failed to fetch stats:', error)
  } finally {
    loading.value = false
    backgroundRefreshing.value = false
  }
}

let statsInterval: ReturnType<typeof setInterval> | null = null

const maxGameCount = computed(() => {
  const vals = Object.values(stats.value?.popularGames || {}) as number[]
  return Math.max(1, ...(vals.length ? vals : [1]))
})

const maxRealtimeGameCount = computed(() => {
  const source = popularGamesForLive.value
  const vals = source ? (Object.values(source) as number[]) : []
  return Math.max(1, ...(vals.length ? vals : [1]))
})

const fetchDaily = async () => {
  dailyLoading.value = true
  dailyError.value = null
  try {
    const res = await $fetch<{ days: unknown[]; gameSlugs: string[]; error?: string }>('/api/analytics/daily', { query: { days: dailyDays.value } })
    dailyData.value = res && Array.isArray(res.days) ? { days: res.days as any, gameSlugs: Array.isArray(res.gameSlugs) ? res.gameSlugs : [], error: res.error } : { days: [], gameSlugs: [], error: res?.error }
  } catch (e: any) {
    console.error('Failed to fetch daily analytics:', e)
    dailyError.value = e?.data?.message || e?.message || 'Failed to load daily data'
    dailyData.value = null
  } finally {
    dailyLoading.value = false
  }
}

const dailyGameColumns = computed(() => {
  if (!dailyData.value?.gameSlugs?.length) return []
  const fromSlugs = dailyData.value.gameSlugs
  const fromRows = new Set<string>()
  dailyData.value.days?.forEach(d => Object.keys(d.games || {}).forEach(g => fromRows.add(g)))
  return [...new Set([...fromSlugs, ...fromRows])]
})

const dailyRowsReversed = computed(() => {
  const days = dailyData.value?.days
  if (!days?.length) return []
  return [...days].reverse()
})

function formatDailyDate(iso: string) {
  const d = new Date(iso + 'T00:00:00')
  return d.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: d.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined })
}

const refresh = () => {
  fetchStats()
  fetchDaily()
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
  fetchDaily()
  // Refresh all-time unique users and historical stats every 5 seconds
  statsInterval = setInterval(() => fetchStats(true), 5000)
})

onBeforeUnmount(() => {
  if (statsInterval) clearInterval(statsInterval)
})
</script>

<style>
</style>


