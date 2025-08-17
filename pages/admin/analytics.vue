<template>
  <div>
    <div class="max-w-6xl mx-auto">
      <div class="flex items-center justify-between mb-6">
        <h1 class="text-3xl font-bold">Admin Analytics Dashboard</h1>
        <NuxtLink to="/" class="text-sm text-white/80 hover:text-white">Back to Home</NuxtLink>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-4 gap-4 md:gap-6 mb-6">
        <div class="bg-white/10 border border-white/10 rounded-xl p-5">
          <div class="text-white/80 text-sm">Active Players</div>
          <div class="text-3xl font-bold text-green-400">{{ stats?.activePlayers ?? 0 }}</div>
          <div class="text-xs text-white/60 mt-1">Currently playing</div>
        </div>
        <div class="bg-white/10 border border-white/10 rounded-xl p-5">
          <div class="text-white/80 text-sm">Active Sessions</div>
          <div class="text-3xl font-bold text-blue-400">{{ stats?.activeSessions ?? 0 }}</div>
          <div class="text-xs text-white/60 mt-1">Games in progress</div>
        </div>
        <div class="bg-white/10 border border-white/10 rounded-xl p-5">
          <div class="text-white/80 text-sm">Total Users</div>
          <div class="text-3xl font-bold">{{ stats?.totalUsers ?? 0 }}</div>
          <div class="text-xs text-white/60 mt-1">All time</div>
        </div>
        <div class="bg-white/10 border border-white/10 rounded-xl p-5">
          <div class="text-white/80 text-sm">Total Games</div>
          <div class="text-3xl font-bold">{{ stats?.totalGameSessions ?? 0 }}</div>
          <div class="text-xs text-white/60 mt-1">Sessions created</div>
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

const fetchStats = async () => {
  stats.value = await $fetch('/api/analytics/stats')
}

const maxGameCount = computed(() => {
  const vals = Object.values(stats.value?.popularGames || {}) as number[]
  return Math.max(1, ...(vals.length ? vals : [1]))
})

const refresh = () => fetchStats()

const exportJson = () => {
  const blob = new Blob([JSON.stringify(stats.value, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `analytics-${Date.now()}.json`
  a.click()
  URL.revokeObjectURL(url)
}

onMounted(fetchStats)
</script>

<style>
</style>


