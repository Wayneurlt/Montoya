<template>
  <div class="bg-white/10 backdrop-blur-md rounded-lg sm:rounded-xl p-3 sm:p-4 border border-white/20 mt-4 sm:mt-5 md:mt-6">
    <h3 class="font-bold mb-2 sm:mb-3 text-sm sm:text-base flex items-center gap-2">
      <Icon icon="mdi:account-group" class="w-4 h-4 sm:w-5 sm:h-5" />
      Players ({{ players.length }})
      <span v-if="currentTurnPlayer" class="text-purple-300 text-xs font-normal">— {{ currentTurnPlayer.nickname }}'s turn</span>
    </h3>
    <div class="grid grid-cols-2 sm:grid-cols-3 gap-1.5 sm:gap-2">
      <div
        v-for="player in players"
        :key="player.socketId"
        class="bg-white/5 rounded-lg p-1.5 sm:p-2 text-center text-xs sm:text-sm transition-all"
        :class="{
          'ring-2 ring-purple-500': player.isHost,
          'ring-2 ring-pink-500 bg-pink-500/20 scale-105 shadow-lg shadow-pink-500/50': !!currentTurnSocketId && player.socketId === currentTurnSocketId,
        }"
      >
        <div class="font-semibold">{{ player.nickname }}</div>
        <div class="flex items-center justify-center gap-1 mt-1 flex-wrap">
          <span v-if="player.isHost" class="text-xs text-purple-400">👑</span>
          <span v-if="!!currentTurnSocketId && player.socketId === currentTurnSocketId" class="text-xs text-pink-400 animate-pulse font-medium">⭐ Their turn</span>
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
