<template>
  <div
    v-if="currentPlayer"
    class="bg-gradient-to-r from-purple-600/30 via-pink-600/30 to-purple-600/30 rounded-xl sm:rounded-2xl p-4 sm:p-5 mb-4 sm:mb-6 border-2 border-purple-500/50 shadow-lg shadow-purple-500/20 animate-pulse-slow"
  >
    <div class="text-center">
      <div class="text-xs sm:text-sm text-purple-200/80 mb-2 flex items-center justify-center gap-2">
        <Icon icon="mdi:account-star" class="w-4 h-4 sm:w-5 sm:h-5 animate-pulse" />
        <span>It's</span>
      </div>
      <div class="text-xl sm:text-2xl md:text-3xl font-black flex items-center justify-center gap-3">
        <span class="bg-gradient-to-r from-purple-300 via-pink-300 to-cyan-300 bg-clip-text text-transparent">
          {{ currentPlayer.nickname }}'s
        </span>
        <span class="text-2xl sm:text-3xl md:text-4xl">{{ currentPlayer.gender === 'male' ? '♂' : currentPlayer.gender === 'female' ? '♀' : '⚧' }}</span>
        <span class="text-lg sm:text-xl md:text-2xl text-purple-200">Turn</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Icon } from '@iconify/vue'

interface Props {
  currentPlayer: {
    nickname: string
    gender?: 'male' | 'female' | 'other'
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

