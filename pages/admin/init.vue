<template>
  <div class="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-indigo-900 flex items-center justify-center">
    <div class="max-w-md w-full mx-4">
      <div class="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-8 shadow-2xl text-center">
        <div class="text-6xl mb-4">🔧</div>
        <h1 class="text-3xl font-bold text-white mb-4">Database Setup</h1>
        
        <div v-if="!setupComplete && !loading" class="space-y-4">
          <p class="text-white/80">Initialize your database with questions and admin user.</p>
          <UButton @click="initializeDatabase" color="primary" size="lg" class="w-full">
            Initialize Database
          </UButton>
        </div>

        <div v-if="loading" class="space-y-4">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto"></div>
          <p class="text-white/80">Setting up your database...</p>
          <div v-if="progress" class="text-sm text-white/60">{{ progress }}</div>
        </div>

        <div v-if="setupComplete" class="space-y-4">
          <div class="text-4xl mb-2">✅</div>
          <h2 class="text-xl font-bold text-white mb-2">Setup Complete!</h2>
          <div class="text-white/80 text-sm space-y-2">
            <p>Database initialized with {{ result?.questionsCount || 0 }} questions</p>
            <p>Admin user created</p>
            <div class="bg-white/10 p-3 rounded-lg mt-4">
              <p class="font-semibold">Admin Credentials:</p>
              <p>Username: <code class="bg-white/20 px-2 py-1 rounded">admin</code></p>
              <p>Password: <code class="bg-white/20 px-2 py-1 rounded">admin123</code></p>
            </div>
          </div>
          <div class="flex gap-2 mt-6">
            <UButton @click="goToAdmin" color="primary" class="flex-1">
              Go to Admin
            </UButton>
            <UButton @click="goToHome" color="white" variant="soft" class="flex-1">
              Go to Games
            </UButton>
          </div>
        </div>

        <div v-if="error" class="mt-4 p-3 bg-red-500/20 border border-red-500/30 rounded-lg">
          <p class="text-red-300 text-sm">{{ error }}</p>
          <UButton @click="initializeDatabase" color="red" variant="soft" size="sm" class="mt-2">
            Try Again
          </UButton>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ 
  layout: false 
})

const loading = ref(false)
const setupComplete = ref(false)
const error = ref('')
const progress = ref('')
const result = ref(null)

async function initializeDatabase() {
  loading.value = true
  error.value = ''
  progress.value = 'Connecting to database...'

  try {
    progress.value = 'Creating tables and seeding questions...'
    const response = await $fetch('/api/setup/init', { method: 'POST' })
    
    result.value = response
    setupComplete.value = true
    progress.value = ''
  } catch (err: any) {
    console.error('Setup error:', err)
    error.value = err.data?.message || 'Setup failed. Please try again.'
    progress.value = ''
  } finally {
    loading.value = false
  }
}

function goToAdmin() {
  navigateTo('/admin/login')
}

function goToHome() {
  navigateTo('/')
}

// Check if setup is needed on mount
onMounted(async () => {
  try {
    // Try to get some questions to see if database is set up
    const response = await $fetch('/api/questions/truth-or-dare?type=TRUTH&limit=1')
    if (response.questions && response.questions.length > 0) {
      setupComplete.value = true
    }
  } catch (error) {
    // Database needs setup
    console.log('Database needs initialization')
  }
})
</script>
</template>