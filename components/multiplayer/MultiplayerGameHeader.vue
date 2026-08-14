<template>
  <div class="flex justify-between items-center mb-6 gap-2">
    <button
      @click="emit('back-to-lobby')"
      class="bg-card border border-white/10 hover:border-hot/50 px-3 sm:px-4 py-1.5 sm:py-2 rounded-md transition-colors flex items-center gap-1.5 sm:gap-2 text-sm sm:text-base"
    >
      <Icon icon="mdi:arrow-left" class="w-4 h-4 sm:w-5 sm:h-5" />
      <span class="font-medium hidden sm:inline">Back to Lobby</span>
    </button>
    <div class="text-center">
      <div class="text-[10px] sm:text-xs font-display uppercase tracking-wide text-paper/50 mb-1">Room Code</div>
      <button
        @click="handleCopy"
        class="group relative bg-card border border-white/10 hover:border-hot/50 rounded-md px-3 sm:px-4 py-1.5 sm:py-2 transition-colors"
        :title="copied ? 'Copied!' : 'Click to copy'"
      >
        <div class="text-lg sm:text-xl font-display font-bold uppercase tracking-wide text-hot flex items-center justify-center gap-2">
          {{ roomCode }}
          <Icon icon="mdi:content-copy" class="w-3.5 h-3.5 sm:w-4 sm:h-4 text-paper/50 group-hover:text-paper/80 transition-colors" />
        </div>
        <transition name="fade">
          <div v-if="copied" class="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-volt text-ink px-3 py-1 rounded-md text-xs font-display uppercase tracking-wide whitespace-nowrap shadow-hard-sm">
            Copied!
          </div>
        </transition>
      </button>
    </div>
    <div v-if="isHost" class="flex">
      <button
        @click="emit('change-game')"
        class="bg-card border border-white/10 hover:border-volt/50 px-3 sm:px-4 py-1.5 sm:py-2 rounded-md transition-colors flex items-center gap-1.5 sm:gap-2 text-sm sm:text-base"
      >
        <Icon icon="mdi:gamepad-variant" class="w-4 h-4 sm:w-5 sm:h-5 text-volt" />
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
import { punchScale } from '~/composables/useGameAnimations'

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

const handleCopy = (evt: MouseEvent) => {
  punchScale(evt.currentTarget as HTMLElement)
  copyRoomCode()
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
