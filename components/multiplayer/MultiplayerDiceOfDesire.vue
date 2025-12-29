<template>
  <div class="max-w-3xl mx-auto relative z-10 pt-4 sm:pt-6 md:pt-8">
    <!-- Header -->
    <div class="flex justify-between items-center mb-6">
      <NuxtLink to="/lobby" class="bg-white/10 hover:bg-white/20 backdrop-blur-md px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg transition-all flex items-center gap-2 border border-white/20 hover:scale-105">
        <Icon icon="mdi:arrow-left" class="w-5 h-5" />
        <span class="font-medium">Back to Lobby</span>
      </NuxtLink>
      <div class="text-center">
        <div class="text-xs text-white/60 mb-1">Room Code</div>
        <div class="text-2xl sm:text-3xl font-black bg-gradient-to-r from-purple-400 via-pink-500 to-cyan-400 bg-clip-text text-transparent">
          {{ roomState.roomCode }}
        </div>
      </div>
    </div>

    <!-- Game Title -->
    <div class="text-center mb-8">
      <h1 class="text-4xl sm:text-5xl md:text-6xl font-black mb-4 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-pink-500 to-cyan-400 drop-shadow-2xl">
        🎲 Dice of Desire
      </h1>
      <p class="text-purple-200/80 text-sm font-medium">Host controls the game flow</p>
    </div>

    <!-- Current Prompt Display -->
    <div v-if="roomState.currentPrompt" class="bg-white/10 backdrop-blur-md rounded-2xl p-6 sm:p-8 md:p-10 mb-6 border border-white/20 shadow-2xl">
      <div class="text-center">
        <div class="mb-6 flex justify-center gap-4">
          <div v-if="roomState.currentPrompt.dice1" class="text-6xl">
            {{ getDiceEmoji(roomState.currentPrompt.dice1) }}
          </div>
          <div v-if="roomState.currentPrompt.dice2" class="text-6xl">
            {{ getDiceEmoji(roomState.currentPrompt.dice2) }}
          </div>
        </div>
        <p class="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 leading-relaxed">
          {{ roomState.currentPrompt?.text || roomState.currentPrompt }}
        </p>
        <div v-if="roomState.currentPrompt.intensity" class="text-sm text-white/60">
          Intensity: {{ roomState.currentPrompt.intensity }}/3
        </div>
      </div>
    </div>

    <!-- Waiting for Host -->
    <div v-else class="bg-white/10 backdrop-blur-md rounded-2xl p-8 mb-6 border border-white/20 text-center">
      <div class="animate-pulse">
        <Icon icon="mdi:clock-outline" class="w-16 h-16 mx-auto mb-4 text-purple-400" />
        <p class="text-xl font-semibold">Waiting for host to start...</p>
      </div>
    </div>

    <!-- Host Controls -->
    <div v-if="isHost" class="bg-purple-500/20 rounded-xl p-6 border border-purple-500/30 space-y-4">
      <h3 class="font-bold text-lg mb-4 flex items-center gap-2">
        <Icon icon="mdi:crown" class="w-5 h-5" />
        Host Controls
      </h3>

      <div class="space-y-2 mb-4">
        <label class="block text-sm font-semibold">Intensity Level</label>
        <div class="flex gap-2">
          <button
            v-for="level in [1, 2, 3]"
            :key="level"
            @click="selectedIntensity = level"
            :class="selectedIntensity === level 
              ? 'bg-purple-600 text-white' 
              : 'bg-white/10 text-white/70 hover:bg-white/20'"
            class="flex-1 py-2 rounded-lg font-bold transition-all"
          >
            {{ level }}
          </button>
        </div>
      </div>

      <button
        @click="getNextCard"
        :disabled="isLoading"
        class="w-full bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 hover:from-purple-500 hover:via-pink-500 hover:to-purple-500 text-white px-6 py-3 rounded-xl font-black shadow-xl transition-all transform hover:scale-105 disabled:opacity-50"
      >
        <Icon icon="mdi:dice-multiple" class="w-5 h-5 inline mr-2" />
        {{ isLoading ? 'Rolling...' : 'Roll Dice' }}
      </button>
    </div>

    <!-- Player List -->
    <div class="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20">
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
          <span v-if="player.isHost" class="text-xs text-purple-400">👑</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Icon } from '@iconify/vue'

interface Props {
  roomState: any
  isHost: boolean
  multiplayer: any
}

const props = defineProps<Props>()

const selectedIntensity = ref(2)
const isLoading = ref(false)

const getDiceEmoji = (value: number) => {
  const dice = ['⚀', '⚁', '⚂', '⚃', '⚄', '⚅']
  return dice[value - 1] || '⚀'
}

const getNextCard = async () => {
  if (isLoading.value || !props.isHost) return
  isLoading.value = true

  try {
    const response = await $fetch('/api/cards/next', {
      method: 'POST',
      body: {
        gameType: 'DICE_OF_DESIRE',
        cardType: 'DO',
        intensity: selectedIntensity.value,
      }
    })

    if (response) {
      // Simulate dice roll
      const dice1 = Math.floor(Math.random() * 6) + 1
      const dice2 = Math.floor(Math.random() * 6) + 1

      props.multiplayer.nextRound({
        text: response.text,
        intensity: response.intensity,
        dice1,
        dice2,
      })
    }
  } catch (error) {
    console.error('Error fetching card:', error)
  } finally {
    isLoading.value = false
  }
}
</script>

