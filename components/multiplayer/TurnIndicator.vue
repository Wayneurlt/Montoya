<template>
  <div
    v-if="currentPlayer"
    class="rounded-xl sm:rounded-2xl p-4 sm:p-5 mb-4 sm:mb-6 border-2 border-pink-500/60 shadow-xl bg-gradient-to-r from-purple-700/50 via-pink-600/50 to-purple-700/50 backdrop-blur-sm animate-pulse-slow"
  >
    <div class="text-center">
      <div class="text-xs sm:text-sm text-pink-200/90 mb-1 flex items-center justify-center gap-2">
        <Icon icon="mdi:account-star" class="w-4 h-4 sm:w-5 sm:h-5 animate-pulse" />
        <span>Current turn</span>
      </div>
      <div class="text-2xl sm:text-3xl md:text-4xl font-black flex items-center justify-center gap-2">
        <span class="text-white drop-shadow-md">
          {{ currentPlayer.nickname }}
        </span>
        <span class="text-lg sm:text-xl md:text-2xl text-pink-200">'s turn</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Icon } from '@iconify/vue'

interface Props {
  currentPlayer: {
    nickname: string
    socketId?: string
  } | null
}

defineProps<Props>()
</script>

<style scoped>
@keyframes pulse-slow {
  0%, 100% {
    opacity: 1;
    box-shadow: 0 0 0 0 rgba(168, 85, 247, 0.7);
  }
  50% {
    opacity: 0.9;
    box-shadow: 0 0 0 10px rgba(168, 85, 247, 0);
  }
}
.animate-pulse-slow {
  animation: pulse-slow 2s infinite;
}
</style>

