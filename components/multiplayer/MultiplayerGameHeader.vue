<template>
  <div class="flex justify-between items-center mb-6">
    <button
      @click="emit('back-to-lobby')"
      class="bg-white/10 hover:bg-white/20 backdrop-blur-md px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg transition-all flex items-center gap-2 border border-white/20 hover:scale-105"
    >
      <Icon icon="mdi:arrow-left" class="w-5 h-5" />
      <span class="font-medium hidden sm:inline">Back to Lobby</span>
    </button>
    <div class="text-center">
      <div class="text-xs text-white/60 mb-1">Room Code</div>
      <button
        @click="copyRoomCode"
        class="group relative cursor-pointer transition-all hover:scale-105"
        :title="copied ? 'Copied!' : 'Click to copy'"
      >
        <div class="text-2xl sm:text-3xl font-black bg-gradient-to-r from-purple-400 via-pink-500 to-cyan-400 bg-clip-text text-transparent flex items-center justify-center gap-2">
          {{ roomCode }}
          <Icon icon="mdi:content-copy" class="w-4 h-4 sm:w-5 sm:h-5 text-purple-400 opacity-70 group-hover:opacity-100 transition-opacity" />
        </div>
        <transition name="fade">
          <div v-if="copied" class="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-green-500 text-white px-3 py-1 rounded-lg text-xs whitespace-nowrap">
            Copied!
          </div>
        </transition>
      </button>
    </div>
    <div v-if="isHost" class="flex">
      <button
        @click="emit('change-game')"
        class="bg-yellow-500/20 hover:bg-yellow-500/30 backdrop-blur-md px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg transition-all flex items-center gap-2 border border-yellow-500/30 hover:scale-105"
      >
        <Icon icon="mdi:gamepad-variant" class="w-5 h-5" />
        <span class="font-medium hidden sm:inline">Change Game</span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
// Presentational header shared by every multiplayer game screen: back-to-lobby
// button, room code display with copy-to-clipboard, and a host-only "Change
// Game" button. Navigation/endGame logic stays in each parent's own handlers —
// this component only emits intent, it never navigates or touches the socket.
import { ref } from 'vue'
import { Icon } from '@iconify/vue'

interface Props {
  roomCode?: string | null
  isHost: boolean
}

const props = defineProps<Props>()
const emit = defineEmits<{
  (e: 'back-to-lobby'): void
  (e: 'change-game'): void
}>()

const copied = ref(false)

const copyRoomCode = async () => {
  if (!props.roomCode) return
  try {
    await navigator.clipboard.writeText(props.roomCode)
    copied.value = true
    setTimeout(() => {
      copied.value = false
    }, 2000)
  } catch (err) {
    console.error('Failed to copy:', err)
  }
}
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
