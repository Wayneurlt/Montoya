<template>
  <div class="max-w-3xl mx-auto relative z-10 pt-4 sm:pt-6 md:pt-8">
    <!-- Header -->
    <div class="flex justify-between items-center mb-6">
      <button
        @click="handleBackToLobby"
        class="bg-white/10 hover:bg-white/20 backdrop-blur-md px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg transition-all flex items-center gap-2 border border-white/20 hover:scale-105"
      >
        <Icon icon="mdi:arrow-left" class="w-5 h-5" />
        <span class="font-medium">Back to Lobby</span>
      </button>
      <div class="text-center">
        <div class="text-xs text-white/60 mb-1">Room Code</div>
        <button
          @click="copyRoomCode"
          class="group relative cursor-pointer transition-all hover:scale-105"
          :title="copied ? 'Copied!' : 'Click to copy'"
        >
          <div class="text-2xl sm:text-3xl font-black bg-gradient-to-r from-purple-400 via-pink-500 to-cyan-400 bg-clip-text text-transparent flex items-center justify-center gap-2">
            {{ roomState.roomCode }}
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
          @click="handleChangeGame"
          class="bg-yellow-500/20 hover:bg-yellow-500/30 backdrop-blur-md px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg transition-all flex items-center gap-2 border border-yellow-500/30 hover:scale-105"
        >
          <Icon icon="mdi:gamepad-variant" class="w-5 h-5" />
          <span class="font-medium hidden sm:inline">Change Game</span>
        </button>
      </div>
    </div>

    <!-- Game Title -->
    <div class="text-center mb-8">
      <h1 class="text-4xl sm:text-5xl md:text-6xl font-black mb-4 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-pink-500 to-cyan-400 drop-shadow-2xl">
        🎲 Dice of Desire
      </h1>
      <p class="text-purple-200/80 text-sm font-medium">Host controls the game flow</p>
    </div>

    <!-- Current Player Display -->
    <div v-if="currentPlayer" class="bg-white/5 rounded-xl p-4 mb-6 border border-white/10">
      <div class="text-center">
        <div class="text-sm text-white/60 mb-1">Current Turn</div>
        <div class="text-xl font-bold flex items-center justify-center gap-2">
          <span>{{ currentPlayer.nickname }}</span>
          <span v-if="currentPlayer.gender" class="text-2xl">{{ currentPlayer.gender === 'male' ? '♂' : currentPlayer.gender === 'female' ? '♀' : '⚧' }}</span>
        </div>
        <div v-if="targetPlayer" class="text-sm text-white/60 mt-2">
          Target: {{ targetPlayer.nickname }}
        </div>
      </div>
    </div>

    <!-- Dice Area -->
    <div class="relative bg-gradient-to-br from-purple-950/60 to-pink-950/60 rounded-xl sm:rounded-2xl md:rounded-3xl p-3 sm:p-4 md:p-6 lg:p-8 mb-3 sm:mb-4 md:mb-6 border-2 border-purple-700/40 shadow-2xl shadow-purple-900/30 backdrop-blur-lg">
      <div class="flex justify-center gap-3 sm:gap-4 md:gap-6 lg:gap-8 mb-4 sm:mb-5 md:mb-6">
        <!-- Body Part Die -->
        <div
          class="group w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 lg:w-32 lg:h-32 bg-gradient-to-br from-purple-700 to-pink-800 rounded-xl sm:rounded-2xl shadow-2xl flex flex-col justify-center items-center transition-all"
          :class="{
            'animate-spin': isRolling,
            'scale-110': !isRolling && currentRoll.body,
            'ring-4 ring-purple-400 shadow-purple-600/50': currentRoll.body === 'Your Choice',
          }"
        >
          <div v-if="!isRolling" class="text-center px-1 sm:px-2">
            <p class="text-[10px] sm:text-xs md:text-sm text-white/80 font-bold mb-0.5 sm:mb-1">Body Part</p>
            <p class="text-xs sm:text-sm md:text-base lg:text-lg font-black text-white leading-tight">
              {{ currentRoll.body || "?" }}
            </p>
          </div>
          <div v-else class="text-center">
            <p class="text-[10px] sm:text-xs text-white/80 font-bold">Rolling...</p>
            <p class="text-xl sm:text-2xl md:text-3xl font-bold text-white">⚄</p>
          </div>
        </div>

        <!-- Action Die -->
        <div
          class="group w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 lg:w-32 lg:h-32 bg-gradient-to-br from-pink-700 to-purple-800 rounded-xl sm:rounded-2xl shadow-2xl flex flex-col justify-center items-center transition-all"
          :class="{
            'animate-spin': isRolling,
            'scale-110': !isRolling && currentRoll.action,
            'ring-4 ring-pink-400 shadow-pink-600/50': currentRoll.action === 'Your Choice',
          }"
        >
          <div v-if="!isRolling" class="text-center px-1 sm:px-2">
            <p class="text-[10px] sm:text-xs md:text-sm text-white/80 font-bold mb-0.5 sm:mb-1">Action</p>
            <p class="text-xs sm:text-sm md:text-base lg:text-lg font-black text-white leading-tight">
              {{ currentRoll.action || "?" }}
            </p>
          </div>
          <div v-else class="text-center">
            <p class="text-[10px] sm:text-xs text-white/80 font-bold">Rolling...</p>
            <p class="text-xl sm:text-2xl md:text-3xl font-bold text-white">⚂</p>
          </div>
        </div>
      </div>

      <button
        v-if="isHost"
        @click="rollDice"
        :disabled="isRolling || isTimerRunning"
        class="group w-full bg-gradient-to-r from-purple-700 to-pink-700 hover:from-purple-600 hover:to-pink-600 py-3 sm:py-4 md:py-5 rounded-xl sm:rounded-2xl font-black text-base sm:text-lg md:text-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 sm:gap-3 shadow-xl hover:shadow-purple-600/50 border-2 border-purple-500/30 hover:scale-105"
      >
        <Icon
          v-if="isRolling"
          icon="svg-spinners:3-dots-fade"
          class="w-6 h-6"
        />
        <Icon v-else icon="mdi:dice" class="w-6 h-6 group-hover:rotate-45 transition-transform" />
        {{ isRolling ? "Rolling..." : "Roll Dice" }}
      </button>
    </div>

    <!-- Result Display -->
    <div
      v-if="currentResult"
      class="bg-gradient-to-br from-purple-950/60 to-pink-950/60 rounded-xl sm:rounded-2xl md:rounded-3xl p-3 sm:p-4 md:p-6 mb-3 sm:mb-4 md:mb-6 border-2 border-purple-700/40 shadow-2xl shadow-purple-900/30 backdrop-blur-lg"
    >
      <h3
        class="text-base sm:text-lg md:text-xl lg:text-2xl font-black mb-2 sm:mb-3 md:mb-4 text-center flex items-center justify-center gap-1.5 sm:gap-2 md:gap-3"
      >
        <Icon icon="mdi:fire" class="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-7 text-orange-500 animate-pulse" />
        <span class="bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-500">Your Command</span>
        <Icon icon="mdi:fire" class="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-7 text-orange-500 animate-pulse" style="animation-delay: 0.5s;" />
      </h3>
      <div
        class="bg-gradient-to-r from-purple-700/40 to-pink-700/40 rounded-lg sm:rounded-xl md:rounded-2xl p-3 sm:p-4 md:p-6 mb-3 sm:mb-4 md:mb-6 border-2 border-purple-600/30 shadow-xl"
      >
        <p class="text-lg sm:text-xl md:text-2xl lg:text-3xl font-black text-center leading-relaxed drop-shadow-lg px-2">{{ currentResult }}</p>
        <p
          v-if="specialEffect"
          class="text-center mt-4 text-yellow-300 font-bold text-lg flex items-center justify-center gap-2 bg-black/20 rounded-full px-6 py-3 mx-auto inline-flex"
        >
          <Icon :icon="specialEffectIcon" class="w-6 h-6" />
          {{ specialEffect }}
        </p>
      </div>

      <!-- Timer -->
      <div class="flex flex-col items-center">
        <div class="relative w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 mb-3 sm:mb-4 md:mb-6">
          <svg class="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
            <path
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              fill="none"
              stroke="rgba(255,255,255,0.2)"
              stroke-width="3"
            />
            <path
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              fill="none"
              stroke="url(#timerGradient)"
              stroke-width="3"
              stroke-linecap="round"
              :stroke-dasharray="`${timerPercent}, 100`"
            />
            <defs>
              <linearGradient
                id="timerGradient"
                x1="0%"
                y1="0%"
                x2="100%"
                y2="0%"
              >
                <stop offset="0%" stop-color="#ec4899" />
                <stop offset="100%" stop-color="#8b5cf6" />
              </linearGradient>
            </defs>
          </svg>
          <span
            class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-2xl font-bold"
            :class="secondsLeft <= 5 ? 'text-red-400' : 'text-white'"
          >
            {{ secondsLeft }}s
          </span>
        </div>

        <div class="flex gap-2 sm:gap-3 md:gap-4">
          <button
            @click="completeAction"
            class="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 px-3 sm:px-4 md:px-6 py-1.5 sm:py-2 rounded-lg font-medium flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm md:text-base"
          >
            <Icon icon="mdi:check-bold" class="w-4 h-4 sm:w-5 sm:h-5" />
            Completed
          </button>
          <button
            @click="failAction"
            class="bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 px-3 sm:px-4 md:px-6 py-1.5 sm:py-2 rounded-lg font-medium flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm md:text-base"
          >
            <Icon icon="mdi:close-thick" class="w-4 h-4 sm:w-5 sm:h-5" />
            Failed
          </button>
        </div>
      </div>
    </div>

    <!-- History -->
    <div class="bg-white/10 rounded-lg sm:rounded-xl md:rounded-2xl p-3 sm:p-4 md:p-6 border border-white/20">
      <h3 class="text-base sm:text-lg md:text-xl font-bold mb-2 sm:mb-3 md:mb-4 flex items-center gap-1.5 sm:gap-2">
        <Icon icon="mdi:history" class="w-4 h-4 sm:w-5 sm:h-5" />
        <span>Game History</span>
      </h3>
      <ul class="space-y-2 sm:space-y-3 max-h-40 sm:max-h-50 md:max-h-60 overflow-y-auto pr-2 text-xs sm:text-sm">
        <li
          v-for="(item, index) in history"
          :key="index"
          class="pb-3 border-b border-white/10 last:border-0 group"
        >
          <div class="flex justify-between items-start">
            <div>
              <p class="font-semibold">
                <span class="text-pink-300">{{ item.roller }}</span> →
                <span class="text-cyan-300">{{ item.target }}</span>:
              </p>
              <p class="mt-1">{{ item.result }}</p>
              <p
                v-if="item.special"
                class="text-pink-300 text-sm mt-1 flex items-center gap-1"
              >
                <Icon :icon="getEffectIcon(item.special)" class="w-4 h-4" />
                {{ item.special }}
              </p>
            </div>
            <span
              class="opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <Icon
                v-if="item.status === 'completed'"
                icon="mdi:check-circle"
                class="w-5 h-5 text-green-400"
              />
              <Icon
                v-else-if="item.status === 'failed'"
                icon="mdi:close-circle"
                class="w-5 h-5 text-red-400"
              />
            </span>
          </div>
        </li>
      </ul>
    </div>

    <!-- Player List -->
    <div class="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20 mt-6">
      <h3 class="font-bold mb-3 flex items-center gap-2">
        <Icon icon="mdi:account-group" class="w-5 h-5" />
        Players ({{ roomState.players.length }})
      </h3>
      <div class="grid grid-cols-2 sm:grid-cols-3 gap-2">
        <div
          v-for="player in roomState.players"
          :key="player.socketId"
          class="bg-white/5 rounded-lg p-2 text-center text-sm"
          :class="{ 'ring-2 ring-purple-500': player.isHost }"
        >
          {{ player.nickname }}
          <span v-if="player.gender" class="text-xs">{{ player.gender === 'male' ? '♂' : player.gender === 'female' ? '♀' : '⚧' }}</span>
          <span v-if="player.isHost" class="text-xs text-purple-400">👑</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onBeforeUnmount, watch } from 'vue'
import { Icon } from '@iconify/vue'
import { useRouter } from 'vue-router'
import { navigateTo } from '#app'

interface Props {
  roomState: any
  isHost: boolean
  multiplayer: any
}

const props = defineProps<Props>()
const router = useRouter()

const handleChangeGame = () => {
  if (!props.isHost) return
  props.multiplayer.endGame()
  navigateTo('/lobby')
}

const handleBackToLobby = () => {
  // If host, end the game first, otherwise just navigate
  if (props.multiplayer.isHost.value) {
    props.multiplayer.endGame()
  }
  // Navigate immediately - don't wait for socket response
  navigateTo('/lobby')
}

// Use the multiplayer composable's isHost directly for reactivity
const isHost = computed(() => props.multiplayer.isHost.value)

// Game Configuration
const BODY_PARTS = [
  "Lips", "Neck", "Hips", "Thighs", "Inner Thigh", "Crotch",
  "Below Navel", "Ass", "Nipples", "Boobs", "Your Choice",
]

const ACTIONS = [
  "Kiss", "Lick", "Nibble", "Massage", "Caress", "Suck",
  "Gentle Bite", "Grab", "Trace with Finger", "Blow On",
  "Kiss and Suck", "Lick and Suck", "Tease", "Your Choice",
]

// Game State
const isRolling = ref(false)
const isTimerRunning = ref(false)
const secondsLeft = ref(30)
const timerPercent = ref(100)
const timer = ref<any>(null)
const specialEffect = ref("")
const specialEffectIcon = ref("mdi:star")
const currentRoll = ref({ body: "", action: "" })
const currentResult = ref("")
const history = ref<any[]>([])

// Get current player - only use synced state, no random fallback
const currentPlayer = computed(() => {
  // Only use the player from the synced prompt to ensure all devices show the same player
  if (props.roomState.currentPrompt?.player) {
    return props.roomState.currentPrompt.player
  }
  
  // Return null if no player is assigned yet (don't use random fallback)
  return null
})

const copied = ref(false)

const copyRoomCode = async () => {
  if (!props.roomState.roomCode) return
  try {
    await navigator.clipboard.writeText(props.roomState.roomCode)
    copied.value = true
    setTimeout(() => {
      copied.value = false
    }, 2000)
  } catch (err) {
    console.error('Failed to copy:', err)
  }
}

// Get target player (opposite gender if available)
const targetPlayer = computed(() => {
  if (props.roomState.currentPrompt?.target) {
    return props.roomState.currentPrompt.target
  }
  const players = props.roomState.players
  if (!players || players.length <= 1) return null
  
  const current = currentPlayer.value
  if (!current) return null
  
  // Find opposite gender
  const oppositeGender = players.filter((p: any) => 
    p.socketId !== current.socketId && 
    p.gender && 
    p.gender !== current.gender
  )
  
  if (oppositeGender.length > 0) {
    return oppositeGender[Math.floor(Math.random() * oppositeGender.length)]
  }
  
  // Fallback to any other player
  const others = players.filter((p: any) => p.socketId !== current.socketId)
  return others.length > 0 ? others[Math.floor(Math.random() * others.length)] : null
})

// Helper Functions
const getEffectIcon = (effectText: string) => {
  if (effectText.includes("Snake Eyes")) return "mdi:dice-1"
  if (effectText.includes("Double Six")) return "mdi:dice-6"
  if (effectText.includes("Matching")) return "mdi:heart"
  if (effectText.includes("remove clothing")) return "mdi:tshirt-crew-off"
  return "mdi:star"
}

// Roll Dice
const rollDice = async () => {
  if (isRolling.value || isTimerRunning.value || !props.isHost) return

  currentResult.value = ""
  specialEffect.value = ""
  isRolling.value = true

  await new Promise((resolve) => setTimeout(resolve, 1000))

  const bodyIndex = Math.floor(Math.random() * BODY_PARTS.length)
  const actionIndex = Math.floor(Math.random() * ACTIONS.length)
  const bodyPart = BODY_PARTS[bodyIndex]
  const action = ACTIONS[actionIndex]

  currentRoll.value = { body: bodyPart, action: action }

  let timerDuration = 30

  // Check for special combinations
  // Snake Eyes (1+1)
  if (bodyIndex === 0 && actionIndex === 0) {
    specialEffect.value = "Snake Eyes! Switch roles immediately"
    specialEffectIcon.value = "mdi:account-switch"
    timerDuration = 30
  }
  // Double Six (last indices)
  else if (
    bodyIndex === BODY_PARTS.length - 1 &&
    actionIndex === ACTIONS.length - 1
  ) {
    specialEffect.value = "Double Six! Both players perform the action"
    specialEffectIcon.value = "mdi:account-multiple"
    timerDuration = 45
  }
  // Matching numbers
  else if (bodyIndex === actionIndex) {
    specialEffect.value = "Matching! 1 minute + remove clothing"
    specialEffectIcon.value = "mdi:heart"
    timerDuration = 60
  }

  currentResult.value = `${action} ${bodyPart}`
  
  const player = currentPlayer.value
  const target = targetPlayer.value

  // Update game state
  props.multiplayer.nextRound({
    body: bodyPart,
    action: action,
    result: currentResult.value,
    special: specialEffect.value,
    player: player ? {
      socketId: player.socketId,
      nickname: player.nickname,
      gender: player.gender,
    } : null,
    target: target ? {
      socketId: target.socketId,
      nickname: target.nickname,
      gender: target.gender,
    } : null,
    timerDuration,
  })

  startTimer(timerDuration)

  // Add to history
  history.value.unshift({
    roller: player?.nickname || 'Player',
    target: target?.nickname || 'Player',
    result: currentResult.value,
    special: specialEffect.value,
    status: null,
  })

  isRolling.value = false
}

const startTimer = (duration: number) => {
  clearInterval(timer.value)
  isTimerRunning.value = true
  secondsLeft.value = duration
  const totalDuration = duration

  timer.value = setInterval(() => {
    secondsLeft.value--
    timerPercent.value = (secondsLeft.value / totalDuration) * 100

    if (secondsLeft.value <= 0) {
      clearInterval(timer.value)
      isTimerRunning.value = false
      if (history.value.length > 0) {
        history.value[0].status = "failed"
      }
    }
  }, 1000)
}

const completeAction = () => {
  clearInterval(timer.value)
  if (history.value.length > 0) {
    history.value[0].status = "completed"
  }
  // Move to next turn
  props.multiplayer.nextRound(null)
  currentResult.value = ""
  specialEffect.value = ""
  isTimerRunning.value = false
  currentRoll.value = { body: "", action: "" }
}

const failAction = () => {
  clearInterval(timer.value)
  if (history.value.length > 0) {
    history.value[0].status = "failed"
  }
  // Move to next turn
  props.multiplayer.nextRound(null)
  currentResult.value = ""
  specialEffect.value = ""
  isTimerRunning.value = false
  currentRoll.value = { body: "", action: "" }
}

// Watch for prompt changes
watch(() => props.roomState.currentPrompt, (newPrompt) => {
  if (newPrompt && newPrompt.result) {
    currentResult.value = newPrompt.result
    currentRoll.value = {
      body: newPrompt.body || "",
      action: newPrompt.action || "",
    }
    specialEffect.value = newPrompt.special || ""
    if (newPrompt.timerDuration) {
      startTimer(newPrompt.timerDuration)
    }
  } else {
    currentResult.value = ""
    currentRoll.value = { body: "", action: "" }
    specialEffect.value = ""
    isTimerRunning.value = false
    clearInterval(timer.value)
  }
})

onBeforeUnmount(() => {
  clearInterval(timer.value)
})
</script>

<style scoped>
@keyframes spin {
  0% { transform: rotate(0deg) scale(1); }
  50% { transform: rotate(180deg) scale(1.1); }
  100% { transform: rotate(360deg) scale(1); }
}
.animate-spin {
  animation: spin 0.8s linear infinite;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
