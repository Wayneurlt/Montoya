<template>
  <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-900 via-pink-900 to-red-900 py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full">
      <!-- Logo/Icon Section -->
      <div class="text-center mb-8">
        <div class="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 mb-4 shadow-lg">
          <Icon name="i-heroicons-lock-closed" class="h-8 w-8 text-white" />
        </div>
        <h1 class="text-4xl font-bold text-white mb-2 tracking-tight">Admin Login</h1>
        <p class="text-white/70 text-sm">Sign in to access the admin dashboard</p>
      </div>

      <!-- Login Card -->
      <div class="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-8 shadow-2xl transition-all duration-300 hover:shadow-3xl">
        <form @submit.prevent="handleLogin" class="space-y-6">
          <!-- Username Field -->
          <div>
            <label for="username" class="flex items-center gap-2 text-sm font-semibold text-white/90 mb-2">
              <Icon name="i-heroicons-user" class="h-4 w-4" />
              Username
            </label>
            <UInput
              id="username"
              v-model="form.username"
              type="text"
              placeholder="Enter your username"
              :disabled="loading"
              :class="['w-full', { 'border-red-500/50': errors.username }]"
              icon="i-heroicons-user-circle"
              size="lg"
              autocomplete="username"
              required
              @blur="validateField('username')"
              @input="clearError('username')"
            />
            <p v-if="errors.username" class="mt-1.5 text-sm text-red-300 flex items-center gap-1">
              <Icon name="i-heroicons-exclamation-circle" class="h-4 w-4" />
              {{ errors.username }}
            </p>
          </div>

          <!-- Password Field -->
          <div>
            <label for="password" class="flex items-center gap-2 text-sm font-semibold text-white/90 mb-2">
              <Icon name="i-heroicons-key" class="h-4 w-4" />
              Password
            </label>
            <div class="relative">
              <UInput
                id="password"
                v-model="form.password"
                :type="showPassword ? 'text' : 'password'"
                placeholder="Enter your password"
                :disabled="loading"
                :class="['w-full', { 'border-red-500/50': errors.password }]"
                icon="i-heroicons-lock-closed"
                size="lg"
                autocomplete="current-password"
                required
                @blur="validateField('password')"
                @input="clearError('password')"
              />
              <button
                type="button"
                @click="showPassword = !showPassword"
                :disabled="loading"
                class="absolute right-3 top-1/2 -translate-y-1/2 text-white/60 hover:text-white/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-white/50 rounded p-1"
                :aria-label="showPassword ? 'Hide password' : 'Show password'"
              >
                <Icon :name="showPassword ? 'i-heroicons-eye-slash' : 'i-heroicons-eye'" class="h-5 w-5" />
              </button>
            </div>
            <p v-if="errors.password" class="mt-1.5 text-sm text-red-300 flex items-center gap-1">
              <Icon name="i-heroicons-exclamation-circle" class="h-4 w-4" />
              {{ errors.password }}
            </p>
          </div>

          <!-- Remember Me & Forgot Password -->
          <div class="flex items-center justify-between">
            <label class="flex items-center gap-2 cursor-pointer group">
              <div class="relative inline-flex items-center">
                <input
                  v-model="form.rememberMe"
                  type="checkbox"
                  :disabled="loading"
                  class="sr-only peer"
                />
                <div class="relative w-11 h-6 bg-white/20 rounded-full peer peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-white/50 peer-disabled:opacity-50 peer-disabled:cursor-not-allowed transition-colors duration-200 peer-checked:bg-primary-500">
                  <div class="absolute top-0.5 left-0.5 bg-white rounded-full h-5 w-5 shadow-md transition-transform duration-200 peer-checked:translate-x-5"></div>
                </div>
              </div>
              <span class="text-sm text-white/80 group-hover:text-white/90 transition-colors select-none">Remember me</span>
            </label>
            <NuxtLink
              to="/admin/forgot-password"
              class="text-sm text-white/70 hover:text-white/90 transition-colors focus:outline-none focus:ring-2 focus:ring-white/50 rounded px-2 py-1"
            >
              Forgot password?
            </NuxtLink>
          </div>

          <!-- Error Alert -->
          <Transition
            enter-active-class="transition ease-out duration-300"
            enter-from-class="opacity-0 translate-y-2"
            enter-to-class="opacity-100 translate-y-0"
            leave-active-class="transition ease-in duration-200"
            leave-from-class="opacity-100 translate-y-0"
            leave-to-class="opacity-0 translate-y-2"
          >
            <div v-if="error" class="p-4 bg-red-500/20 border border-red-500/40 rounded-xl backdrop-blur-sm">
              <div class="flex items-start gap-3">
                <Icon name="i-heroicons-exclamation-triangle" class="h-5 w-5 text-red-300 flex-shrink-0 mt-0.5" />
                <div class="flex-1">
                  <p class="text-red-200 text-sm font-medium">Login failed</p>
                  <p class="text-red-300/90 text-sm mt-0.5">{{ error }}</p>
                </div>
                <button
                  @click="error = ''"
                  class="text-red-300/70 hover:text-red-200 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500/50 rounded p-1"
                  aria-label="Dismiss error"
                >
                  <Icon name="i-heroicons-x-mark" class="h-4 w-4" />
                </button>
              </div>
            </div>
          </Transition>

          <!-- Submit Button -->
          <UButton
            type="submit"
            :loading="loading"
            :disabled="loading || !isFormValid"
            color="primary"
            size="xl"
            class="w-full font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
            :class="{ 'opacity-50 cursor-not-allowed': !isFormValid && !loading }"
          >
            <template v-if="!loading">
              <Icon name="i-heroicons-arrow-right-on-rectangle" class="h-5 w-5 mr-2" />
              Sign In
            </template>
            <template v-else>
              <Icon name="i-heroicons-arrow-path" class="h-5 w-5 mr-2 animate-spin" />
              Signing in...
            </template>
          </UButton>
        </form>

        <!-- Footer Links -->
        <div class="mt-6 pt-6 border-t border-white/10">
          <NuxtLink
            to="/"
            class="flex items-center justify-center gap-2 text-white/70 hover:text-white/90 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-white/50 rounded-lg px-3 py-2"
          >
            <Icon name="i-heroicons-arrow-left" class="h-4 w-4" />
            Back to Home
          </NuxtLink>
        </div>
      </div>

      <!-- Security Notice -->
      <div class="mt-6 text-center">
        <p class="text-white/50 text-xs flex items-center justify-center gap-1.5">
          <Icon name="i-heroicons-shield-check" class="h-3.5 w-3.5" />
          Secure admin access only
        </p>
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
  password: '',
  rememberMe: false
})

const loading = ref(false)
const error = ref('')
const showPassword = ref(false)
const errors = reactive({
  username: '',
  password: ''
})

// Computed property for form validation
const isFormValid = computed(() => {
  return form.username.trim().length > 0 && form.password.trim().length > 0
})

function validateField(field: 'username' | 'password') {
  if (field === 'username') {
    errors.username = form.username.trim().length === 0 ? 'Username is required' : ''
  } else if (field === 'password') {
    errors.password = form.password.length === 0 ? 'Password is required' : ''
  }
}

function clearError(field: 'username' | 'password') {
  errors[field] = ''
  if (error.value) {
    error.value = ''
  }
}

async function handleLogin() {
  // Clear previous errors
  error.value = ''
  validateField('username')
  validateField('password')

  // Check for validation errors
  if (errors.username || errors.password) {
    return
  }

  if (!form.username.trim() || !form.password) {
    error.value = 'Please fill in all fields'
    return
  }

  loading.value = true
  error.value = ''

  try {
    const response = await $fetch('/api/auth/login', {
      method: 'POST',
      body: {
        username: form.username.trim(),
        password: form.password,
        rememberMe: form.rememberMe
      }
    })

    if (response.success) {
      // Redirect to admin dashboard
      await navigateTo('/admin')
    }
  } catch (err: any) {
    console.error('Login error:', err)
    error.value = err.data?.message || err.message || 'Invalid credentials. Please try again.'
    
    // Clear password field on error for security
    form.password = ''
  } finally {
    loading.value = false
  }
}
</script>
