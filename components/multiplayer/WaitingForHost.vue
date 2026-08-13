<template>
  <div class="bg-white/10 backdrop-blur-md rounded-2xl p-6 sm:p-8 border border-white/20 text-center">
    <div class="animate-pulse mb-6">
      <Icon icon="mdi:clock-outline" class="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4 text-purple-400" />
      <p class="text-xl sm:text-2xl font-semibold mb-2">{{ message }}</p>
      <p class="text-sm sm:text-base text-white/70 mb-4">
        Host: <span class="font-bold text-purple-300">{{ hostName }}</span>
      </p>
    </div>
    
    <!-- Ring Host Button -->
    <button
      @click="handleRingHost"
      :disabled="isRinging || canRingIn === 0"
      class="group relative bg-gradient-to-r from-yellow-600 via-orange-600 to-yellow-600 hover:from-yellow-500 hover:via-orange-500 hover:to-yellow-500 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-xl font-black text-base sm:text-lg shadow-2xl hover:shadow-yellow-600/50 transition-all duration-300 transform hover:scale-105 border-2 border-yellow-500/50 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
    >
      <Icon icon="mdi:bell-ring" class="w-5 h-5 sm:w-6 sm:h-6 inline mr-2 group-hover:animate-bounce" />
      <span>{{ isRinging ? 'Ringing...' : canRingIn > 0 ? `Ring Host (${canRingIn}s)` : 'Ring Host 🔔' }}</span>
      <div class="absolute inset-0 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-xl blur-xl opacity-50 group-hover:opacity-75 transition-opacity"></div>
    </button>
    
    <p v-if="canRingIn > 0" class="text-xs sm:text-sm text-white/50 mt-3">
      Please wait {{ canRingIn }} seconds before ringing again
    </p>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { Icon } from '@iconify/vue'

interface Props {
  hostName: string
  multiplayer: any
  message?: string
}

const props = withDefaults(defineProps<Props>(), {
  message: 'Waiting for host to start...',
})

const isRinging = ref(false)
const lastRingTime = ref(0)
const canRingIn = ref(0)
let ringCooldownTimer: any = null

const handleRingHost = () => {
  if (isRinging.value || canRingIn.value > 0) return
  
  isRinging.value = true
  lastRingTime.value = Date.now()
  canRingIn.value = 10
  
  props.multiplayer.ringHost()
  
  setTimeout(() => {
    isRinging.value = false
  }, 1000)
  
  // Start cooldown timer
  ringCooldownTimer = setInterval(() => {
    canRingIn.value--
    if (canRingIn.value <= 0) {
      clearInterval(ringCooldownTimer)
      ringCooldownTimer = null
    }
  }, 1000)
}

onBeforeUnmount(() => {
  if (ringCooldownTimer) {
    clearInterval(ringCooldownTimer)
  }
})
</script>

