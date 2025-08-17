<template>
  <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-900 via-pink-900 to-red-900">
    <div class="max-w-md w-full mx-4">
      <div class="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-8 shadow-2xl">
        <div class="text-center mb-8">
          <h1 class="text-3xl font-bold text-white mb-2">Admin Login</h1>
          <p class="text-white/70">Access the admin dashboard</p>
        </div>

        <form @submit.prevent="handleLogin" class="space-y-6">
          <div>
            <label for="username" class="block text-sm font-medium text-white/80 mb-2">Username</label>
            <UInput
              id="username"
              v-model="form.username"
              type="text"
              placeholder="Enter username"
              :disabled="loading"
              required
            />
          </div>

          <div>
            <label for="password" class="block text-sm font-medium text-white/80 mb-2">Password</label>
            <UInput
              id="password"
              v-model="form.password"
              type="password"
              placeholder="Enter password"
              :disabled="loading"
              required
            />
          </div>

          <UButton
            type="submit"
            :loading="loading"
            :disabled="loading"
            color="primary"
            size="lg"
            class="w-full"
          >
            {{ loading ? 'Logging in...' : 'Login' }}
          </UButton>
        </form>

        <div v-if="error" class="mt-4 p-3 bg-red-500/20 border border-red-500/30 rounded-lg">
          <p class="text-red-300 text-sm">{{ error }}</p>
        </div>

        <div class="mt-6 text-center">
          <NuxtLink to="/" class="text-white/60 hover:text-white text-sm">
            ← Back to Home
          </NuxtLink>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ 
  layout: false,
  middleware: 'guest'
})

const form = reactive({
  username: '',
  password: ''
})

const loading = ref(false)
const error = ref('')

async function handleLogin() {
  if (!form.username || !form.password) {
    error.value = 'Please fill in all fields'
    return
  }

  loading.value = true
  error.value = ''

  try {
    const response = await $fetch('/api/auth/login', {
      method: 'POST',
      body: {
        username: form.username,
        password: form.password
      }
    })

    if (response.success) {
      // Redirect to admin dashboard
      await navigateTo('/admin')
    }
  } catch (err: any) {
    console.error('Login error:', err)
    error.value = err.data?.message || 'Invalid credentials'
  } finally {
    loading.value = false
  }
}
</script>
