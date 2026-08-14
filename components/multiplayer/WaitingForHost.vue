<template>
  <div class="card-poster p-6 sm:p-8 text-center">
    <Icon icon="mdi:clock-outline" class="w-14 h-14 sm:w-16 sm:h-16 mx-auto mb-4 text-hot" />
    <p class="text-lg sm:text-xl font-display font-bold uppercase tracking-wide mb-2">{{ message }}</p>
    <p class="text-sm sm:text-base text-paper/60 mb-6">
      Host: <span class="font-bold text-volt">{{ hostName }}</span>
    </p>

    <!-- Ring Host Button -->
    <button
      @click="handleRingHost"
      :disabled="isRinging || canRingIn === 0"
      class="bg-hot text-ink shadow-hard hover:brightness-110 px-6 sm:px-8 py-3 sm:py-4 rounded-lg font-display font-bold uppercase tracking-wide text-sm sm:text-base transition-[filter] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mx-auto"
    >
      <Icon icon="mdi:bell-ring" class="w-5 h-5 sm:w-6 sm:h-6" />
      <span>{{ isRinging ? 'Ringing...' : canRingIn > 0 ? `Ring Host (${canRingIn}s)` : 'Ring Host' }}</span>
    </button>

    <p v-if="canRingIn > 0" class="text-xs sm:text-sm text-paper/40 mt-3">
      Please wait {{ canRingIn }} seconds before ringing again
    </p>
  </div>
</template>

<script setup lang="ts">
import { ref, onBeforeUnmount } from 'vue'
import { Icon } from '@iconify/vue'
import { punchScale } from '~/composables/useGameAnimations'

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

const handleRingHost = (evt: MouseEvent) => {
  if (isRinging.value || canRingIn.value > 0) return

  punchScale(evt.currentTarget as HTMLElement)

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
