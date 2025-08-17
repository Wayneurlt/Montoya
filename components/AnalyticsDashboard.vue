<template>
  <div class="fixed top-4 right-4 z-50">
    <!-- Toggle Button -->
    <button
      v-if="!showDashboard"
      @click="showDashboard = true"
      class="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-4 py-2 rounded-lg shadow-lg transition-all flex items-center gap-2"
    >
      <Icon icon="mdi:chart-line" class="w-5 h-5" />
      Analytics
    </button>

    <!-- Dashboard Panel -->
    <div
      v-if="showDashboard"
      class="bg-white/10 backdrop-blur-md rounded-xl p-6 shadow-2xl border border-white/20 w-80 max-h-96 overflow-y-auto"
    >
      <!-- Header -->
      <div class="flex justify-between items-center mb-4">
        <h3 class="text-lg font-bold text-white flex items-center gap-2">
          <Icon icon="mdi:chart-line" class="w-5 h-5" />
          Analytics Dashboard
        </h3>
        <button
          @click="showDashboard = false"
          class="text-white/60 hover:text-white transition-colors"
        >
          <Icon icon="mdi:close" class="w-5 h-5" />
        </button>
      </div>

      <!-- Live Stats -->
      <div class="space-y-4">
        <!-- Current Users -->
        <div class="bg-green-500/20 rounded-lg p-3 border border-green-400/30">
          <div class="flex items-center justify-between">
            <span class="text-green-300 text-sm font-medium">Users Online</span>
            <div class="flex items-center gap-2">
              <div class="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span class="text-green-100 font-bold">{{ currentUsers }}</span>
            </div>
          </div>
        </div>

        <!-- Session Info -->
        <div v-if="summary" class="bg-blue-500/20 rounded-lg p-3 border border-blue-400/30">
          <div class="text-blue-300 text-sm font-medium mb-2">Your Session</div>
          <div class="space-y-1 text-xs">
            <div class="flex justify-between">
              <span class="text-blue-200">Duration:</span>
              <span class="text-blue-100">{{ summary.sessionDuration }}min</span>
            </div>
            <div class="flex justify-between">
              <span class="text-blue-200">Games Played:</span>
              <span class="text-blue-100">{{ summary.totalGamesPlayed }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-blue-200">Sessions:</span>
              <span class="text-blue-100">{{ summary.sessionsCount }}</span>
            </div>
          </div>
        </div>

        <!-- Game Preferences -->
        <div v-if="summary && Object.keys(summary.gamePreferences).length > 0" class="bg-purple-500/20 rounded-lg p-3 border border-purple-400/30">
          <div class="text-purple-300 text-sm font-medium mb-2">Your Game Preferences</div>
          <div class="space-y-1">
            <div
              v-for="[game, count] in sortedPreferences"
              :key="game"
              class="flex justify-between items-center text-xs"
            >
              <span class="text-purple-200">{{ game }}:</span>
              <div class="flex items-center gap-2">
                <div class="w-12 bg-purple-800/50 rounded-full h-1.5">
                  <div 
                    class="bg-purple-400 h-1.5 rounded-full transition-all duration-500"
                    :style="{ width: `${(count / Math.max(...Object.values(summary.gamePreferences))) * 100}%` }"
                  ></div>
                </div>
                <span class="text-purple-100 font-medium">{{ count }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Global Stats -->
        <div v-if="globalStats" class="bg-orange-500/20 rounded-lg p-3 border border-orange-400/30">
          <div class="text-orange-300 text-sm font-medium mb-2">Popular Games</div>
          <div class="space-y-1">
            <div
              v-for="[game, count] in topGames"
              :key="game"
              class="flex justify-between items-center text-xs"
            >
              <span class="text-orange-200">{{ formatGameName(game) }}:</span>
              <span class="text-orange-100 font-medium">{{ formatNumber(count) }}</span>
            </div>
          </div>
        </div>

        <!-- Location -->
        <div v-if="summary?.location" class="bg-pink-500/20 rounded-lg p-3 border border-pink-400/30">
          <div class="text-pink-300 text-sm font-medium mb-2">Location</div>
          <div class="text-pink-100 text-xs">
            {{ summary.location.city }}, {{ summary.location.country }}
          </div>
        </div>

        <!-- Admin Actions -->
        <div class="flex gap-2">
          <button
            @click="exportAnalytics"
            class="flex-1 bg-white/10 hover:bg-white/20 text-white text-xs py-2 px-3 rounded-lg transition-colors flex items-center justify-center gap-1"
          >
            <Icon icon="mdi:download" class="w-3 h-3" />
            Export
          </button>
          <button
            @click="resetAnalytics"
            class="flex-1 bg-red-500/20 hover:bg-red-500/30 text-red-300 text-xs py-2 px-3 rounded-lg transition-colors flex items-center justify-center gap-1"
          >
            <Icon icon="mdi:refresh" class="w-3 h-3" />
            Reset
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { Icon } from '@iconify/vue'
import { useAnalytics, getGlobalAnalytics } from '~/composables/useAnalytics'

const showDashboard = ref(false)
const { currentUsers, getAnalyticsSummary } = useAnalytics()

const summary = ref(null)
const globalStats = ref(null)

// Computed properties
const sortedPreferences = computed(() => {
  if (!summary.value?.gamePreferences) return []
  return Object.entries(summary.value.gamePreferences)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 5)
})

const topGames = computed(() => {
  if (!globalStats.value?.popularGames) return []
  return Object.entries(globalStats.value.popularGames)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 5)
})

// Methods
const refreshData = () => {
  summary.value = getAnalyticsSummary()
  globalStats.value = getGlobalAnalytics()
}

const formatGameName = (name) => {
  return name.replace(/([A-Z])/g, ' $1').trim()
}

const formatNumber = (num) => {
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'k'
  }
  return num.toString()
}

const exportAnalytics = () => {
  const data = {
    summary: summary.value,
    globalStats: globalStats.value,
    timestamp: new Date().toISOString()
  }
  
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `montoya-analytics-${Date.now()}.json`
  a.click()
  URL.revokeObjectURL(url)
}

const resetAnalytics = () => {
  if (confirm('Are you sure you want to reset all analytics data?')) {
    localStorage.removeItem('montoya_analytics')
    localStorage.removeItem('montoya_user_id')
    sessionStorage.removeItem('montoya_session_analytics')
    refreshData()
  }
}

// Initialize
onMounted(() => {
  refreshData()
  
  // Refresh data every 30 seconds
  setInterval(refreshData, 30000)
})
</script>
