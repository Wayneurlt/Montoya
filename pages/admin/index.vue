<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-2xl sm:text-3xl font-bold">Admin Dashboard</h1>
      <NuxtLink to="/" class="text-sm text-white/70 hover:text-white">Back to Home</NuxtLink>
    </div>

    <!-- Age Confirmation Stats -->
    <div class="bg-white/5 border border-white/10 rounded-xl p-5 mb-6">
      <div class="flex items-center justify-between mb-4">
        <h2 class="text-xl font-semibold">Age Confirmations (18+)</h2>
        <button
          @click="() => loadConfirmations(1)"
          :disabled="loading"
          class="text-sm text-white/70 hover:text-white disabled:opacity-50"
        >
          {{ loading ? 'Loading...' : 'Refresh' }}
        </button>
      </div>
      
      <div class="mb-4">
        <div class="text-3xl font-bold text-pink-400 mb-1">{{ totalConfirmations }}</div>
        <div class="text-white/60 text-sm">Total Confirmations</div>
      </div>

      <div v-if="errorMessage" class="mb-4 p-3 bg-red-500/20 border border-red-500/30 rounded-lg">
        <p class="text-red-300 text-sm">{{ errorMessage }}</p>
      </div>

      <div v-if="loading && confirmations.length === 0" class="text-white/70 text-sm">
        Loading confirmations...
      </div>
      
      <div v-else-if="!errorMessage && confirmations.length === 0" class="text-white/70 text-sm">
        No confirmations yet.
      </div>

      <div v-else class="space-y-3 max-h-96 overflow-y-auto">
        <div
          v-for="confirmation in confirmations"
          :key="confirmation.id"
          class="bg-white/5 border border-white/10 rounded-lg p-3"
        >
          <div class="flex items-start justify-between gap-4">
            <div class="flex-1">
              <div class="text-white font-medium mb-1">
                Confirmation #{{ confirmation.id }}
              </div>
              <div class="text-white/60 text-xs sm:text-sm">
                {{ formatDate(confirmation.confirmedAt) }}
              </div>
              <div v-if="confirmation.ipAddress" class="text-white/50 text-xs mt-1">
                IP: {{ confirmation.ipAddress }}
              </div>
            </div>
            <div class="text-pink-400 text-2xl">🔞</div>
          </div>
        </div>
      </div>

      <div v-if="pagination && pagination.totalPages > 1" class="mt-4 flex items-center justify-between">
        <button
          @click="loadPage(pagination.page - 1)"
          :disabled="pagination.page === 1 || loading"
          class="px-3 py-1 rounded bg-white/10 hover:bg-white/20 disabled:opacity-50 text-sm"
        >
          Previous
        </button>
        <span class="text-white/70 text-sm">
          Page {{ pagination.page }} of {{ pagination.totalPages }}
        </span>
        <button
          @click="loadPage(pagination.page + 1)"
          :disabled="pagination.page >= pagination.totalPages || loading"
          class="px-3 py-1 rounded bg-white/10 hover:bg-white/20 disabled:opacity-50 text-sm"
        >
          Next
        </button>
      </div>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-6">
      <div class="bg-white/5 border border-white/10 rounded-xl p-5">
        <div class="text-white/60 text-sm">Quick Links</div>
        <div class="mt-3 space-y-2">
          <NuxtLink to="/admin/analytics" class="block px-3 py-2 rounded bg-white/10 hover:bg-white/20">View Analytics</NuxtLink>
        </div>
      </div>
      <div class="bg-white/5 border border-white/10 rounded-xl p-5">
        <div class="text-white/60 text-sm">Status</div>
        <div class="mt-3 text-white/80 text-sm">System nominal</div>
      </div>
      <div class="bg-white/5 border border-white/10 rounded-xl p-5">
        <div class="text-white/60 text-sm">Shortcuts</div>
        <div class="mt-3 text-sm space-y-2">
          <NuxtLink to="/" class="block text-white/80 hover:text-white">Home</NuxtLink>
        </div>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
      <div class="bg-white/5 border border-white/10 rounded-xl p-5">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-xl font-semibold">Overview</h2>
          <NuxtLink to="/admin/analytics" class="text-sm text-white/70 hover:text-white">Open Analytics</NuxtLink>
        </div>
        <div class="text-white/70 text-sm">High-level stats and summaries will appear here.</div>
      </div>
      <div class="bg-white/5 border border-white/10 rounded-xl p-5">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-xl font-semibold">Recent Activity</h2>
        </div>
        <div class="text-white/70 text-sm">No recent activity.</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
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
  // Ensure page is a number, not an event object
  const page = typeof pageParam === 'number' ? pageParam : 1
  
  loading.value = true
  errorMessage.value = null
  try {
    const response = await $fetch<{
      confirmations: AgeConfirmation[]
      pagination: Pagination
    }>('/api/admin/age-confirmations', {
      query: {
        page: String(page), // Ensure it's a string for the query
        limit: '20'
      }
    })
    
    confirmations.value = response.confirmations
    pagination.value = response.pagination
    totalConfirmations.value = response.pagination.total
    currentPage.value = page
  } catch (error: any) {
    console.error('Error loading confirmations:', error)
    errorMessage.value = error?.data?.message || error?.message || 'Failed to load age confirmations. Please check the console for details.'
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


