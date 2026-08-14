<template>
  <div class="card-poster p-3 sm:p-4 mt-4 sm:mt-5 md:mt-6">
    <h3 class="font-display uppercase tracking-wide text-xs sm:text-sm text-paper/60 mb-3 flex items-center gap-2 flex-wrap">
      <Icon icon="mdi:account-group" class="w-4 h-4 sm:w-5 sm:h-5 text-hot" />
      Players ({{ players.length }})
      <span v-if="currentTurnPlayer" class="text-volt normal-case font-sans font-medium tracking-normal">— {{ currentTurnPlayer.nickname }}'s turn</span>
    </h3>
    <div class="grid grid-cols-2 sm:grid-cols-3 gap-1.5 sm:gap-2">
      <div
        v-for="player in players"
        :key="player.socketId"
        class="rounded-md p-1.5 sm:p-2 text-center text-xs sm:text-sm transition-colors bg-white/5 border border-white/10"
        :class="{
          'border-volt/50': player.isHost && !(!!currentTurnSocketId && player.socketId === currentTurnSocketId),
          'bg-hot text-ink border-hot shadow-hard-sm': !!currentTurnSocketId && player.socketId === currentTurnSocketId,
        }"
      >
        <div class="font-display uppercase tracking-wide truncate">{{ player.nickname }}</div>
        <div class="flex items-center justify-center gap-1 mt-1 flex-wrap">
          <Icon
            v-if="player.isHost"
            icon="mdi:crown"
            class="w-3.5 h-3.5"
            :class="!!currentTurnSocketId && player.socketId === currentTurnSocketId ? 'text-ink/70' : 'text-volt'"
          />
          <span
            v-if="!!currentTurnSocketId && player.socketId === currentTurnSocketId"
            class="text-[10px] font-display uppercase tracking-wide"
          >
            Turn
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// Shared player-list card for every multiplayer game screen. Turn-highlighting
// (used by turn-based games like Truth or Dare, Do or Drink, Dice of Desire)
// is opt-in via `currentTurnSocketId` — leave it unset for the voting games
// (Never Have I Ever, Would You Rather, Most Likely To) to get the plain list.
import { computed } from 'vue'
import { Icon } from '@iconify/vue'

interface PlayerListPlayer {
  socketId: string
  nickname: string
  isHost: boolean
  [key: string]: any
}

interface Props {
  players: readonly PlayerListPlayer[]
  /** socketId of the player whose turn it currently is, for turn-based games. */
  currentTurnSocketId?: string | null
}

const props = defineProps<Props>()

const currentTurnPlayer = computed(() => {
  if (!props.currentTurnSocketId) return null
  return props.players.find(p => p.socketId === props.currentTurnSocketId) || null
})
</script>
