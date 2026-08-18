<template>
  <div class="min-h-screen bg-nightlife text-paper p-3 sm:p-4 relative overflow-x-hidden overflow-y-auto safe-bottom">
    <BackgroundIcons />

    <!-- Error State -->
    <div v-if="error" class="max-w-3xl mx-auto mt-8">
      <div class="card-poster p-4">
        <div class="flex items-center gap-2">
          <Icon icon="mdi:alert-circle" class="w-6 h-6 text-hot" />
          <p class="text-paper font-semibold">{{ error }}</p>
        </div>
      </div>
      <button
        @click="handleLeaveRoom"
        class="mt-4 w-full bg-hot/10 hover:bg-hot/20 text-hot px-4 py-2 rounded-md border border-hot/30 transition-all font-display uppercase tracking-wide text-sm"
      >
        Leave Room
      </button>
    </div>

    <!-- Connection Lost - reconnection attempts exhausted, or our own reconnect poll gave up -->
    <div v-else-if="connectionLost || reconnectGaveUp" class="max-w-3xl mx-auto mt-8 text-center py-12">
      <Icon icon="mdi:wifi-off" class="w-16 h-16 mx-auto mb-4 text-hot" />
      <p class="text-xl font-semibold mb-4">Lost connection to the room.</p>
      <div class="flex items-center justify-center gap-3">
        <button
          @click="handleRetryConnection"
          class="bg-hot text-paper shadow-hard-sm hover:brightness-110 px-4 py-2 rounded-md transition-[filter] font-display font-bold uppercase tracking-wide text-sm"
        >
          Retry
        </button>
        <button
          @click="handleLeaveRoom"
          class="bg-card border border-white/10 hover:bg-white/5 px-4 py-2 rounded-md transition-all font-display uppercase tracking-wide text-sm"
        >
          Back to Lobby
        </button>
      </div>
    </div>

    <!-- Loading State -->
    <div v-else-if="!isConnected || !safeRoomState.roomCode" class="max-w-3xl mx-auto mt-8 text-center py-12">
      <div class="animate-pulse">
        <Icon icon="mdi:loading" class="w-16 h-16 mx-auto mb-4 text-hot animate-spin" />
        <p class="text-xl font-semibold">{{ isReconnecting ? 'Reconnecting to room...' : 'Connecting to room...' }}</p>
        <p v-if="safeRoomState.roomCode || pendingRoomCode" class="text-sm text-paper/60 mt-1">
          Room <span class="font-display font-bold text-hot">{{ safeRoomState.roomCode || pendingRoomCode }}</span>
          · {{ gameDisplayName }}
        </p>
        <button
          @click="handleLeaveRoom"
          class="mt-4 bg-card border border-white/10 hover:bg-white/5 px-4 py-2 rounded-md transition-all font-display uppercase tracking-wide text-sm"
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
        <div class="card-poster p-6">
          <Icon icon="mdi:alert" class="w-16 h-16 mx-auto mb-4 text-hot" />
          <p class="text-xl font-semibold">Unknown game type: {{ gameType }}</p>
          <button
            @click="handleLeaveRoom"
            class="mt-4 bg-hot/10 hover:bg-hot/20 text-hot px-4 py-2 rounded-md border border-hot/30 transition-all font-display uppercase tracking-wide text-sm"
          >
            Return to Lobby
          </button>
        </div>
      </div>

      <!-- Quick emoji reactions -->
      <div class="fixed bottom-4 right-3 z-40 flex gap-1.5 bg-card/90 backdrop-blur border border-white/10 rounded-full px-2 py-1.5 shadow-hard-sm">
        <button
          v-for="emoji in REACTION_EMOJIS"
          :key="emoji"
          @click="handleSendReaction(emoji)"
          class="text-lg leading-none w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/10 transition-colors"
        >
          {{ emoji }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount, watch, nextTick } from 'vue'
import { Icon } from '@iconify/vue'
import { push } from 'notivue'
import gsap from 'gsap'
import { useMultiplayer } from '~/composables/useMultiplayer'
import { playRingSound, vibrateRing } from '~/composables/useRingSound'
import { useRoute, useRouter } from 'vue-router'
import { navigateTo } from '#app'

const REACTION_EMOJIS = ['😂', '😮', '🔥', '😳', '❤️', '👏']

// Multiplayer room state lives in a process-wide singleton (see useMultiplayer.ts),
// not per-request — rendering it during SSR could leak one user's live room into
// another user's server-rendered HTML, so this page is client-only.
definePageMeta({ ssr: false })

const route = useRoute()
const router = useRouter()
const multiplayer = useMultiplayer()

const {
  isConnected,
  isReconnecting,
  connectionLost,
  roomState,
  error,
  isHost,
  connect,
  retryConnection,
  leaveRoom,
  attemptAutoReconnect,
  sendReaction,
} = multiplayer

const gameType = computed(() => route.params.game as string)

const GAME_DISPLAY_NAMES: Record<string, string> = {
  'truth-or-dare': 'Truth or Dare',
  'dice-of-desire': 'Dice of Desire',
  'do-or-drink': 'Do or Drink',
  'never-have-i-ever': 'Never Have I Ever',
  'most-likely-to': 'Most Likely To',
  'would-you-rather': 'Would You Rather',
}
const gameDisplayName = computed(() => GAME_DISPLAY_NAMES[gameType.value] || gameType.value)

// Populated from localStorage during the reconnect attempt below, so the
// connecting/reconnecting spinner can show which room it's rejoining instead
// of a bare, contextless spinner.
const pendingRoomCode = ref<string | null>(null)

let isComponentMounted = true
onBeforeUnmount(() => {
  isComponentMounted = false
})

// Our own local reconnect poll (below) gives up after this long even if the
// socket itself never reports connectionLost, so a stuck join doesn't spin forever.
const RECONNECT_POLL_TIMEOUT_MS = 15_000
const reconnectGaveUp = ref(false)

const handleRetryConnection = () => {
  reconnectGaveUp.value = false
  retryConnection()
}

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

const handleSendReaction = (emoji: string) => {
  sendReaction(emoji)
}

// A single emoji that floats up from the bottom of the screen and fades —
// deliberately lighter weight than celebrateBurst's confetti particles, since
// this fires on every reaction rather than a one-off win moment.
function floatEmoji(emoji: string) {
  if (typeof document === 'undefined') return
  const el = document.createElement('div')
  el.textContent = emoji
  el.style.position = 'fixed'
  el.style.left = `${45 + Math.random() * 10}%`
  el.style.bottom = '15%'
  el.style.fontSize = '2.5rem'
  el.style.pointerEvents = 'none'
  el.style.zIndex = '9999'
  document.body.appendChild(el)
  gsap.fromTo(
    el,
    { y: 0, opacity: 1, scale: 0.8 },
    {
      y: -160,
      opacity: 0,
      scale: 1.2,
      duration: 1.4,
      ease: 'power1.out',
      onComplete: () => el.remove(),
    }
  )
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
          pendingRoomCode.value = info.roomCode
          // Wait for connection, then rejoin — capped so a socket that never
          // connects doesn't leave the user staring at an infinite spinner.
          const reconnectDeadline = Date.now() + RECONNECT_POLL_TIMEOUT_MS
          const attemptReconnect = () => {
            if (!isComponentMounted) return
            if (isConnected.value) {
              console.log('🔄 Reconnecting to room from game page:', info.roomCode)
              attemptAutoReconnect()
            } else if (Date.now() < reconnectDeadline) {
              setTimeout(attemptReconnect, 200)
            } else {
              console.warn('⏱️ Gave up waiting to reconnect to room:', info.roomCode)
              reconnectGaveUp.value = true
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
        if (!isComponentMounted) return
        attemptAutoReconnect()
      }, 300)
    }
  })

  // If the current game doesn't match, redirect
  if (roomState.value?.currentGame && roomState.value.currentGame !== gameType.value) {
    router.push(`/multiplayer/${roomState.value.currentGame}`)
  }

  // Listen for host ring notifications (sound + visual)
  if (typeof window !== 'undefined') {
    const handleHostRing = (event: CustomEvent) => {
      const data = event.detail
      vibrateRing()
      playRingSound()
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('🔔 Players are waiting!', { body: data.message, icon: '/icon.png' })
      }
      const ringElement = document.querySelector('[data-host-ring]')
      if (ringElement) {
        ringElement.classList.add('animate-pulse', 'ring-4', 'ring-volt')
        setTimeout(() => {
          ringElement.classList.remove('animate-pulse', 'ring-4', 'ring-volt')
        }, 2000)
      }
    }
    window.addEventListener('host-ring', handleHostRing as EventListener)
    onBeforeUnmount(() => {
      window.removeEventListener('host-ring', handleHostRing as EventListener)
    })

    // Listen for reaction broadcasts (visual pop + toast for everyone in the room)
    const handleRoomReaction = (event: CustomEvent) => {
      const data = event.detail as { emoji: string; fromNickname: string }
      floatEmoji(data.emoji)
      push.info({
        title: data.fromNickname,
        message: data.emoji,
        duration: 2000,
      })
    }
    window.addEventListener('room-reaction', handleRoomReaction as EventListener)
    onBeforeUnmount(() => {
      window.removeEventListener('room-reaction', handleRoomReaction as EventListener)
    })
  }
})
</script>

