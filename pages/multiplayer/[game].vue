<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 text-white p-3 sm:p-4 relative overflow-x-hidden overflow-y-auto">
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
        <button
          @click="handleLeaveRoom"
          class="mt-4 bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg transition-all"
        >
          Cancel
        </button>
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
import { ref, computed, onMounted, onBeforeUnmount, watch, nextTick } from 'vue'
import { Icon } from '@iconify/vue'
import { useMultiplayer } from '~/composables/useMultiplayer'
import { useRoute, useRouter } from 'vue-router'
import { navigateTo } from '#app'

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
  attemptAutoReconnect,
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
    // Use nextTick to ensure state is updated
    nextTick(() => {
      navigateTo('/lobby')
    })
  }
})

// Note: error is readonly from composable, so we can't set it directly
// The composable will handle error display

onMounted(() => {
  // Ensure we're connected
  if (!isConnected.value) {
    connect()
  }

  // Check if we have room info but aren't in a room (page refresh scenario)
  if (!roomState.value?.roomCode && typeof window !== 'undefined') {
    const roomInfo = localStorage.getItem('multiplayer_room')
    if (roomInfo) {
      try {
        const info = JSON.parse(roomInfo)
        if (info.roomCode && info.nickname) {
          // Wait for connection, then rejoin
          const attemptReconnect = () => {
            if (isConnected.value) {
              console.log('🔄 Reconnecting to room from game page:', info.roomCode)
              attemptAutoReconnect()
            } else {
              setTimeout(attemptReconnect, 200)
            }
          }
          setTimeout(attemptReconnect, 500)
          return // Don't redirect yet, wait for reconnection
        }
      } catch (e) {
        console.error('Failed to parse room info:', e)
      }
    }
    // No room info found, redirect to lobby
    router.push('/lobby')
    return
  }
  
  // Also watch for connection to auto-reconnect
  watch(isConnected, (connected) => {
    if (connected && !roomState.value?.roomCode) {
      setTimeout(() => {
        attemptAutoReconnect()
      }, 300)
    }
  })

  // If the current game doesn't match, redirect
  if (roomState.value?.currentGame && roomState.value.currentGame !== gameType.value) {
    router.push(`/multiplayer/${roomState.value.currentGame}`)
  }

  // Listen for host ring notifications
  if (typeof window !== 'undefined') {
    const handleHostRing = (event: CustomEvent) => {
      const data = event.detail
      // Play sound notification
      try {
        const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBTGH0fPTgjMGFm')
        audio.volume = 0.5
        audio.play().catch(() => {})
      } catch (e) {
        // Fallback: use browser notification if available
        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification('🔔 Players are waiting!', {
            body: data.message,
            icon: '/icon.png',
          })
        }
      }
      
      // Visual pulse animation
      const ringElement = document.querySelector('[data-host-ring]')
      if (ringElement) {
        ringElement.classList.add('animate-pulse', 'ring-4', 'ring-yellow-500')
        setTimeout(() => {
          ringElement.classList.remove('animate-pulse', 'ring-4', 'ring-yellow-500')
        }, 2000)
      }
    }
    
    window.addEventListener('host-ring', handleHostRing as EventListener)
    
    // Cleanup
    onBeforeUnmount(() => {
      window.removeEventListener('host-ring', handleHostRing as EventListener)
    })
  }
})
</script>

