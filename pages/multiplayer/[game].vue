<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 text-white p-3 sm:p-4 relative overflow-hidden">
    <BackgroundIcons />

    <!-- Error State -->
    <div v-if="error" class="max-w-3xl mx-auto mt-8">
      <div class="bg-red-500/20 border-2 border-red-500/50 rounded-xl p-4 backdrop-blur-md">
        <div class="flex items-center gap-2">
          <Icon icon="mdi:alert-circle" class="w-6 h-6 text-red-400" />
          <p class="text-red-200 font-semibold">{{ error }}</p>
        </div>
      </div>
      <button
        @click="handleLeaveRoom"
        class="mt-4 w-full bg-red-500/20 hover:bg-red-500/30 text-red-300 px-4 py-2 rounded-lg border border-red-500/30 transition-all"
      >
        Leave Room
      </button>
    </div>

    <!-- Loading State -->
    <div v-else-if="!isConnected || !safeRoomState.roomCode" class="max-w-3xl mx-auto mt-8 text-center py-12">
      <div class="animate-pulse">
        <Icon icon="mdi:loading" class="w-16 h-16 mx-auto mb-4 text-purple-400 animate-spin" />
        <p class="text-xl font-semibold">Connecting to room...</p>
      </div>
    </div>

    <!-- Game Content -->
    <div v-else>
      <!-- Passive Sync Games (Truth or Dare, Dice of Desire, Do or Drink) -->
      <MultiplayerTruthOrDare
        v-if="gameType === 'truth-or-dare'"
        :room-state="safeRoomState"
        :is-host="isHost"
        :multiplayer="multiplayer"
      />
      <MultiplayerDiceOfDesire
        v-else-if="gameType === 'dice-of-desire'"
        :room-state="safeRoomState"
        :is-host="isHost"
        :multiplayer="multiplayer"
      />
      <MultiplayerDoOrDrink
        v-else-if="gameType === 'do-or-drink'"
        :room-state="safeRoomState"
        :is-host="isHost"
        :multiplayer="multiplayer"
      />

      <!-- Interactive Voting Games -->
      <MultiplayerNeverHaveIEver
        v-else-if="gameType === 'never-have-i-ever'"
        :room-state="safeRoomState"
        :is-host="isHost"
        :multiplayer="multiplayer"
      />
      <MultiplayerWouldYouRather
        v-else-if="gameType === 'would-you-rather'"
        :room-state="safeRoomState"
        :is-host="isHost"
        :multiplayer="multiplayer"
      />
      <MultiplayerMostLikelyTo
        v-else-if="gameType === 'most-likely-to'"
        :room-state="safeRoomState"
        :is-host="isHost"
        :multiplayer="multiplayer"
      />

      <!-- Unknown Game -->
      <div v-else class="max-w-3xl mx-auto mt-8 text-center py-12">
        <div class="bg-red-500/20 border-2 border-red-500/50 rounded-xl p-6 backdrop-blur-md">
          <Icon icon="mdi:alert" class="w-16 h-16 mx-auto mb-4 text-red-400" />
          <p class="text-xl font-semibold">Unknown game type: {{ gameType }}</p>
          <button
            @click="handleLeaveRoom"
            class="mt-4 bg-red-500/20 hover:bg-red-500/30 text-red-300 px-4 py-2 rounded-lg border border-red-500/30 transition-all"
          >
            Return to Lobby
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { Icon } from '@iconify/vue'
import { useMultiplayer } from '~/composables/useMultiplayer'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()
const multiplayer = useMultiplayer()

const {
  isConnected,
  roomState,
  error,
  isHost,
  connect,
  leaveRoom,
} = multiplayer

const gameType = computed(() => route.params.game as string)

const safeRoomState = computed(() => {
  if (!roomState || !roomState.value) {
    return {
      roomId: null,
      roomCode: null,
      roomName: undefined,
      hostSocketId: null,
      players: [],
      maxPlayers: 999,
      answerVisibility: 'anonymous' as const,
      currentGame: null,
      gamePhase: 'lobby' as const,
      currentPrompt: null,
    }
  }
  return roomState.value
})

const handleLeaveRoom = () => {
  leaveRoom()
  router.push('/lobby')
}

// Watch for game phase changes - if we're not in the right game, redirect
watch(() => roomState.value?.currentGame, (currentGame) => {
  if (currentGame && currentGame !== gameType.value) {
    router.push(`/multiplayer/${currentGame}`)
  }
})

// Watch for game ended event (host left) - redirect to lobby
watch(() => roomState.value?.gamePhase, (phase) => {
  if (phase === 'lobby' && roomState.value?.currentGame === null) {
    // Game was ended by host leaving, redirect to lobby
    router.push('/lobby')
  }
})

// Note: error is readonly from composable, so we can't set it directly
// The composable will handle error display

onMounted(() => {
  // Ensure we're connected
  if (!isConnected.value) {
    connect()
  }

  // If we're not in a room, redirect to lobby
  if (!roomState.value?.roomCode) {
    router.push('/lobby')
  }

  // If the current game doesn't match, redirect
  if (roomState.value?.currentGame && roomState.value.currentGame !== gameType.value) {
    router.push(`/multiplayer/${roomState.value.currentGame}`)
  }
})
</script>

