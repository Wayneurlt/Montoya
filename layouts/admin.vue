<template>
  <div class="min-h-screen bg-gradient-to-b from-slate-900 to-black text-white overflow-x-hidden overflow-y-auto">
    <!-- Mobile top bar -->
    <div class="md:hidden sticky top-0 z-40 bg-black/40 backdrop-blur border-b border-white/10">
      <div class="flex items-center justify-between px-4 py-3">
        <button @click="isSidebarOpen = true" class="p-2 rounded-md bg-white/10 hover:bg-white/20">
          <Icon name="mdi:menu" class="w-6 h-6" />
        </button>
        <div class="font-semibold">Admin</div>
        <NuxtLink to="/" class="text-sm text-white/70 hover:text-white">Home</NuxtLink>
      </div>
    </div>

    <!-- Sidebar for desktop -->
    <aside class="hidden md:flex md:flex-col md:w-64 md:fixed md:inset-y-0 md:z-30 bg-gradient-to-b from-slate-900/95 to-black/95 backdrop-blur-sm border-r border-white/10 overflow-y-auto">
      <div class="h-16 flex items-center px-5 border-b border-white/10 bg-white/5">
        <NuxtLink to="/" class="font-bold text-lg hover:text-white transition-colors flex items-center gap-2">
          <Icon name="mdi:shield-crown" class="w-6 h-6 text-purple-400" />
          <span>Montoya Admin</span>
        </NuxtLink>
      </div>
      <nav class="flex-1 overflow-y-auto py-4">
        <ul class="px-2 space-y-1">
          <li>
            <NuxtLink 
              to="/admin"
              class="flex items-center gap-2 px-3 py-2 rounded-md transition-all duration-200 cursor-pointer"
              :class="navClass('/admin')"
              active-class="bg-white/15 text-white"
              exact-active-class="bg-white/15 text-white"
            >
              <Icon name="mdi:view-dashboard" class="w-5 h-5 flex-shrink-0" />
              <span class="font-medium">Dashboard</span>
            </NuxtLink>
          </li>
          <li>
            <NuxtLink 
              to="/admin/analytics"
              class="flex items-center gap-2 px-3 py-2 rounded-md transition-all duration-200 cursor-pointer"
              :class="navClass('/admin/analytics')"
              active-class="bg-white/15 text-white"
              exact-active-class="bg-white/15 text-white"
            >
              <Icon name="mdi:chart-line" class="w-5 h-5 flex-shrink-0" />
              <span class="font-medium">Analytics</span>
            </NuxtLink>
          </li>
          <li>
            <NuxtLink 
              to="/admin/questions"
              class="flex items-center gap-2 px-3 py-2 rounded-md transition-all duration-200 cursor-pointer"
              :class="navClass('/admin/questions')"
              active-class="bg-white/15 text-white"
              exact-active-class="bg-white/15 text-white"
            >
              <Icon name="mdi:comment-question-outline" class="w-5 h-5 flex-shrink-0" />
              <span class="font-medium">Questions</span>
            </NuxtLink>
          </li>
        </ul>
      </nav>
      <div class="px-4 py-3 border-t border-white/10">
        <div class="flex items-center justify-between">
          <div class="text-xs text-white/60">{{ user?.username || 'Admin' }}</div>
          <UButton 
            @click="handleLogout" 
            color="error" 
            variant="ghost" 
            size="xs"
            :loading="loggingOut"
          >
            Logout
          </UButton>
        </div>
      </div>
    </aside>

    <!-- Mobile sidebar drawer -->
    <transition name="fade">
      <div v-if="isSidebarOpen" class="fixed inset-0 z-40 lg:hidden">
        <div class="absolute inset-0 bg-black/60" @click="isSidebarOpen = false"></div>
        <div class="absolute inset-y-0 left-0 w-72 bg-gradient-to-b from-slate-900 to-black backdrop-blur-sm border-r border-white/10 p-4 z-50">
          <div class="flex items-center justify-between h-12">
            <div class="font-semibold">Admin</div>
            <button @click="isSidebarOpen = false" class="p-2 rounded-md bg-white/10 hover:bg-white/20">
              <Icon name="mdi:close" class="w-5 h-5" />
            </button>
          </div>
          <nav class="mt-4">
            <ul class="space-y-1">
              <li>
                <NuxtLink 
                  to="/admin"
                  @click="isSidebarOpen = false"
                  class="flex items-center gap-2 px-3 py-2 rounded-md transition-all duration-200 cursor-pointer"
                  :class="navClass('/admin')"
                  active-class="bg-white/15 text-white"
                  exact-active-class="bg-white/15 text-white"
                >
                  <Icon name="mdi:view-dashboard" class="w-5 h-5 flex-shrink-0" />
                  <span class="font-medium">Dashboard</span>
                </NuxtLink>
              </li>
              <li>
                <NuxtLink 
                  to="/admin/analytics"
                  @click="isSidebarOpen = false"
                  class="flex items-center gap-2 px-3 py-2 rounded-md transition-all duration-200 cursor-pointer"
                  :class="navClass('/admin/analytics')"
                  active-class="bg-white/15 text-white"
                  exact-active-class="bg-white/15 text-white"
                >
                  <Icon name="mdi:chart-line" class="w-5 h-5 flex-shrink-0" />
                  <span class="font-medium">Analytics</span>
                </NuxtLink>
              </li>
              <li>
                <NuxtLink 
                  to="/admin/questions"
                  @click="isSidebarOpen = false"
                  class="flex items-center gap-2 px-3 py-2 rounded-md transition-all duration-200 cursor-pointer"
                  :class="navClass('/admin/questions')"
                  active-class="bg-white/15 text-white"
                  exact-active-class="bg-white/15 text-white"
                >
                  <Icon name="mdi:comment-question-outline" class="w-5 h-5 flex-shrink-0" />
                  <span class="font-medium">Questions</span>
                </NuxtLink>
              </li>
            </ul>
          </nav>
        </div>
      </div>
    </transition>

    <!-- Main content -->
    <div class="md:pl-64 min-h-screen">
      <main class="px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 overflow-x-hidden">
        <slot />
      </main>
    </div>
  </div>
  
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRoute, useRouter } from '#imports'

definePageMeta({
  middleware: 'admin'
})

const isSidebarOpen = ref(false)
const route = useRoute()
const router = useRouter()
const user = ref<{ id: number; username: string; createdAt?: string } | null>(null)
const loggingOut = ref(false)

// Get current user info
onMounted(async () => {
  try {
    const response = await $fetch('/api/auth/me')
    user.value = response.user
  } catch (error) {
    console.error('Failed to get user info:', error)
  }
})

async function handleLogout() {
  loggingOut.value = true
  try {
    await $fetch('/api/auth/logout', { method: 'POST' })
    await navigateTo('/admin/login')
  } catch (error) {
    console.error('Logout error:', error)
  } finally {
    loggingOut.value = false
  }
}

function navClass(path: string) {
  const isActive = route.path === path || route.path.startsWith(path + '/')
  return isActive 
    ? 'bg-white/15 text-white shadow-lg shadow-white/5' 
    : 'text-white/70 hover:bg-white/10 hover:text-white'
}
</script>

<style>
.fade-enter-active, .fade-leave-active { transition: opacity .2s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>


