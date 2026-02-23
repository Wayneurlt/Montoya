<template>
  <div class="overflow-x-hidden overflow-y-auto pb-6">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
      <div>
        <h1 class="text-2xl sm:text-3xl md:text-4xl font-bold">Admin Dashboard</h1>
        <p class="text-white/60 text-sm mt-1">Real-time monitoring and management</p>
      </div>
      <NuxtLink to="/" class="text-sm text-white/70 hover:text-white transition-colors px-3 py-2 rounded-lg bg-white/10 hover:bg-white/20">
        Back to Home
      </NuxtLink>
    </div>

    <!-- Real-time Stats Cards -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <!-- Active Users -->
      <div class="bg-gradient-to-br from-green-500/20 to-emerald-500/20 border border-green-500/30 rounded-xl p-4 sm:p-5 relative overflow-hidden">
        <div class="absolute top-0 right-0 w-20 h-20 bg-green-500/10 rounded-full -mr-10 -mt-10"></div>
        <div class="relative z-10">
          <div class="flex items-center justify-between mb-2">
            <div class="text-white/70 text-xs sm:text-sm font-medium">Active Users</div>
            <div v-if="realtimeStats" class="w-2 h-2 bg-green-400 rounded-full animate-pulse" title="Live"></div>
          </div>
          <div class="text-2xl sm:text-3xl md:text-4xl font-bold text-green-400 mb-1">
            {{ realtimeStats?.totalActiveUsers ?? 0 }}
          </div>
          <div class="text-white/60 text-xs">Currently on site</div>
        </div>
      </div>

      <!-- Users in Games -->
      <div class="bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/30 rounded-xl p-4 sm:p-5 relative overflow-hidden">
        <div class="absolute top-0 right-0 w-20 h-20 bg-purple-500/10 rounded-full -mr-10 -mt-10"></div>
        <div class="relative z-10">
          <div class="text-white/70 text-xs sm:text-sm font-medium mb-2">In Games</div>
          <div class="text-2xl sm:text-3xl md:text-4xl font-bold text-purple-400 mb-1">
            {{ realtimeStats?.usersInGames ?? 0 }}
          </div>
          <div class="text-white/60 text-xs">Playing now</div>
        </div>
      </div>

      <!-- Active Rooms -->
      <div class="bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border border-blue-500/30 rounded-xl p-4 sm:p-5 relative overflow-hidden">
        <div class="absolute top-0 right-0 w-20 h-20 bg-blue-500/10 rounded-full -mr-10 -mt-10"></div>
        <div class="relative z-10">
          <div class="text-white/70 text-xs sm:text-sm font-medium mb-2">Active Rooms</div>
          <div class="text-2xl sm:text-3xl md:text-4xl font-bold text-blue-400 mb-1">
            {{ realtimeStats?.activeRooms ?? 0 }}
          </div>
          <div class="text-white/60 text-xs">Multiplayer sessions</div>
        </div>
      </div>

      <!-- Peak Users -->
      <div class="bg-gradient-to-br from-orange-500/20 to-red-500/20 border border-orange-500/30 rounded-xl p-4 sm:p-5 relative overflow-hidden">
        <div class="absolute top-0 right-0 w-20 h-20 bg-orange-500/10 rounded-full -mr-10 -mt-10"></div>
        <div class="relative z-10">
          <div class="text-white/70 text-xs sm:text-sm font-medium mb-2">Peak Users</div>
          <div class="text-2xl sm:text-3xl md:text-4xl font-bold text-orange-400 mb-1">
            {{ realtimeStats?.peakUsers ?? 0 }}
          </div>
          <div class="text-white/60 text-xs">All-time high</div>
        </div>
      </div>
    </div>

    <!-- Users by Page -->
    <div class="bg-white/5 border border-white/10 rounded-xl p-4 sm:p-5 mb-6">
      <div class="flex items-center justify-between mb-4">
        <h2 class="text-lg sm:text-xl font-semibold">Users by Page</h2>
        <div v-if="isConnected" class="flex items-center gap-2 text-xs text-green-400">
          <div class="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
          Live
        </div>
      </div>
      <div v-if="realtimeStats?.usersOnPages && Object.keys(realtimeStats.usersOnPages).length > 0" class="space-y-3">
        <div v-for="(count, page) in realtimeStats.usersOnPages" :key="page" class="space-y-2">
          <div class="flex justify-between items-center text-sm">
            <span class="text-white/80 font-medium capitalize">{{ page === '/' ? 'Home' : page.replace(/\//g, ' ').replace(/-/g, ' ') }}</span>
            <span class="font-bold text-white bg-white/10 px-2 py-1 rounded">{{ count }}</span>
          </div>
          <div class="w-full h-2.5 bg-white/10 rounded-full overflow-hidden">
            <div 
              class="h-full rounded-full bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 transition-all duration-500 shadow-lg"
              :style="{ width: `${Math.min((count / (realtimeStats.totalActiveUsers || 1)) * 100, 100)}%` }"
            ></div>
          </div>
        </div>
      </div>
      <div v-else class="text-white/60 text-sm text-center py-8">
        <Icon name="mdi:account-off" class="w-12 h-12 mx-auto mb-2 opacity-50" />
        <p>No active users</p>
      </div>
    </div>

    <!-- Quick Actions -->
    <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
      <NuxtLink 
        to="/admin/analytics" 
        class="bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-xl p-4 sm:p-5 hover:bg-blue-500/20 transition-all group relative overflow-hidden"
      >
        <div class="absolute top-0 right-0 w-16 h-16 bg-blue-500/10 rounded-full -mr-8 -mt-8"></div>
        <div class="relative z-10">
          <div class="text-white/60 text-xs sm:text-sm mb-2 font-medium">Quick Actions</div>
          <div class="text-lg sm:text-xl font-semibold group-hover:text-blue-300 transition-colors flex items-center gap-2">
            <Icon name="mdi:chart-line" class="w-5 h-5" />
            View Analytics
          </div>
          <div class="text-white/50 text-xs mt-2">Real-time insights & data</div>
        </div>
      </NuxtLink>
      <NuxtLink 
        to="/admin/questions" 
        class="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/20 rounded-xl p-4 sm:p-5 hover:bg-green-500/20 transition-all group relative overflow-hidden"
      >
        <div class="absolute top-0 right-0 w-16 h-16 bg-green-500/10 rounded-full -mr-8 -mt-8"></div>
        <div class="relative z-10">
          <div class="text-white/60 text-xs sm:text-sm mb-2 font-medium">Management</div>
          <div class="text-lg sm:text-xl font-semibold group-hover:text-green-300 transition-colors flex items-center gap-2">
            <Icon name="mdi:comment-question-outline" class="w-5 h-5" />
            Manage Questions
          </div>
          <div class="text-white/50 text-xs mt-2">Add, edit & organize questions</div>
        </div>
      </NuxtLink>
      <div class="bg-gradient-to-br from-orange-500/10 to-red-500/10 border border-orange-500/20 rounded-xl p-4 sm:p-5 relative overflow-hidden">
        <div class="absolute top-0 right-0 w-16 h-16 bg-orange-500/10 rounded-full -mr-8 -mt-8"></div>
        <div class="relative z-10">
          <div class="text-white/60 text-xs sm:text-sm mb-2 font-medium">Status</div>
          <div class="text-lg sm:text-xl font-semibold text-green-400 flex items-center gap-2">
            <div class="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            System Online
          </div>
          <div class="text-white/50 text-xs mt-2">All systems operational</div>
        </div>
      </div>
    </div>

    <!-- Age Confirmation Stats -->
    <div class="bg-white/5 border border-white/10 rounded-xl p-4 sm:p-5 md:p-6 mb-6">
      <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
        <div>
          <h2 class="text-lg sm:text-xl font-semibold">Age Confirmations (18+)</h2>
          <p class="text-white/60 text-xs sm:text-sm mt-1">Total: {{ totalConfirmations }} confirmations</p>
        </div>
        <button
          @click="() => loadConfirmations(1)"
          :disabled="loading"
          class="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 disabled:opacity-50 text-sm font-medium transition-all"
        >
          {{ loading ? 'Loading...' : 'Refresh' }}
        </button>
      </div>
      
      <div v-if="errorMessage" class="mb-4 p-3 bg-red-500/20 border border-red-500/30 rounded-lg">
        <p class="text-red-300 text-sm">{{ errorMessage }}</p>
      </div>

      <div v-if="loading && confirmations.length === 0" class="text-white/70 text-sm text-center py-8">
        Loading confirmations...
      </div>
      
      <div v-else-if="!errorMessage && confirmations.length === 0" class="text-white/70 text-sm text-center py-8">
        No confirmations yet.
      </div>

      <div v-else class="space-y-3 max-h-96 overflow-y-auto pr-2">
        <div
          v-for="confirmation in confirmations"
          :key="confirmation.id"
          class="bg-white/5 border border-white/10 rounded-lg p-3 sm:p-4 hover:bg-white/10 transition-all"
        >
          <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div class="flex-1">
              <div class="text-white font-medium mb-1 text-sm sm:text-base">
                Confirmation #{{ confirmation.id }}
              </div>
              <div class="text-white/60 text-xs sm:text-sm">
                {{ formatDate(confirmation.confirmedAt) }}
              </div>
              <div v-if="confirmation.ipAddress" class="text-white/50 text-xs mt-1">
                IP: {{ confirmation.ipAddress }}
              </div>
            </div>
            <div class="text-pink-400 text-2xl sm:text-3xl">🔞</div>
          </div>
        </div>
      </div>

      <div v-if="pagination && pagination.totalPages > 1" class="mt-4 flex flex-col sm:flex-row items-center justify-between gap-3">
        <button
          @click="loadPage(pagination.page - 1)"
          :disabled="pagination.page === 1 || loading"
          class="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 disabled:opacity-50 text-sm font-medium transition-all w-full sm:w-auto"
        >
          Previous
        </button>
        <span class="text-white/70 text-sm">
          Page {{ pagination.page }} of {{ pagination.totalPages }}
        </span>
        <button
          @click="loadPage(pagination.page + 1)"
          :disabled="pagination.page >= pagination.totalPages || loading"
          class="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 disabled:opacity-50 text-sm font-medium transition-all w-full sm:w-auto"
        >
          Next
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useAdminAnalytics } from '~/composables/useAdminAnalytics'

definePageMeta({ 
  layout: 'admin',
  middleware: 'admin'
})

interface AgeConfirmation {
  id: number
  ipAddress: string | null
  userAgent: string | null
  confirmedAt: string
}

interface Pagination {
  page: number
  limit: number
  total: number
  totalPages: number
}

const { realtimeStats, isConnected } = useAdminAnalytics()

const confirmations = ref<AgeConfirmation[]>([])
const totalConfirmations = ref(0)
const pagination = ref<Pagination | null>(null)
const loading = ref(false)
const currentPage = ref(1)

const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })
}

const errorMessage = ref<string | null>(null)

const loadConfirmations = async (pageParam: number | Event | undefined = 1) => {
  const page = typeof pageParam === 'number' ? pageParam : 1
  
  loading.value = true
  errorMessage.value = null
  try {
    const response = await $fetch<{
      confirmations: AgeConfirmation[]
      pagination: Pagination
    }>('/api/admin/age-confirmations', {
      query: {
        page: String(page),
        limit: '20'
      }
    })
    
    confirmations.value = response.confirmations
    pagination.value = response.pagination
    totalConfirmations.value = response.pagination.total
    currentPage.value = page
  } catch (error: any) {
    console.error('Error loading confirmations:', error)
    errorMessage.value = error?.data?.message || error?.message || 'Failed to load age confirmations.'
  } finally {
    loading.value = false
  }
}

const loadPage = (page: number) => {
  if (page >= 1 && pagination.value && page <= pagination.value.totalPages) {
    loadConfirmations(page)
  }
}

onMounted(() => {
  loadConfirmations()
})
</script>
