<template>
  <div
    v-if="currentPlayer"
    ref="rootRef"
    class="card-poster p-4 sm:p-5 mb-4 sm:mb-6 text-center"
  >
    <div class="text-xs sm:text-sm font-display uppercase tracking-wide text-paper/50 mb-1 flex items-center justify-center gap-2">
      <Icon icon="mdi:account-star" class="w-4 h-4 sm:w-5 sm:h-5 text-hot" />
      <span>Current Turn</span>
    </div>
    <div ref="nameRef" class="text-2xl sm:text-3xl md:text-4xl font-display font-bold uppercase text-paper">
      {{ currentPlayer.nickname }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, nextTick } from 'vue'
import { Icon } from '@iconify/vue'
import { tickPulse } from '~/composables/useGameAnimations'

interface Props {
  currentPlayer: {
    nickname: string
    socketId?: string
  } | null
}

const props = defineProps<Props>()

const rootRef = ref<HTMLElement | null>(null)
const nameRef = ref<HTMLElement | null>(null)

onMounted(() => {
  tickPulse(rootRef.value, { scale: 1.03 })
})

// Pulse the name whenever the turn changes to a different player, so the
// hand-off reads as a distinct beat instead of a silent text swap.
watch(
  () => props.currentPlayer?.socketId ?? props.currentPlayer?.nickname,
  async () => {
    await nextTick()
    tickPulse(nameRef.value, { scale: 1.12 })
  }
)
</script>
