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
        🙅 Never Have I Ever
      </h1>
      <p class="text-purple-200/80 text-sm font-medium">{{ roomState.answerVisibility === 'anonymous' ? 'Anonymous Mode' : 'Public Mode' }}</p>
    </div>

    <!-- Playing Phase: Show Question and Voting -->
    <div v-if="roomState.gamePhase === 'playing' && roomState.currentPrompt" class="space-y-6">
      <!-- Current Question -->
      <div class="bg-white/10 backdrop-blur-md rounded-2xl p-6 sm:p-8 md:p-10 mb-6 border border-white/20 shadow-2xl">
        <div class="text-center">
          <p class="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 leading-relaxed">
            {{ roomState.currentPrompt?.text || roomState.currentPrompt }}
          </p>
          <div v-if="roomState.currentPrompt.intensity" class="text-sm text-white/60">
            Intensity: {{ roomState.currentPrompt.intensity }}/3
          </div>
        </div>
      </div>

      <!-- Voting Options (if not voted yet) -->
      <div v-if="!hasVoted" class="grid grid-cols-2 gap-4">
        <button
          @click="submitVote('I Have')"
          :disabled="isSubmitting"
          class="bg-green-500/20 hover:bg-green-500/30 border-2 border-green-500/50 rounded-xl p-6 transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Icon icon="mdi:check-circle" class="w-12 h-12 mx-auto mb-2" />
          <span class="font-bold text-lg">I Have</span>
        </button>
        <button
          @click="submitVote('I Have Not')"
          :disabled="isSubmitting"
          class="bg-red-500/20 hover:bg-red-500/30 border-2 border-red-500/50 rounded-xl p-6 transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Icon icon="mdi:close-circle" class="w-12 h-12 mx-auto mb-2" />
          <span class="font-bold text-lg">I Have Not</span>
        </button>
      </div>

      <!-- Already Voted -->
      <div v-else class="bg-purple-500/20 border-2 border-purple-500/50 rounded-xl p-6 text-center">
        <Icon icon="mdi:check-circle" class="w-16 h-16 mx-auto mb-4 text-green-400" />
        <p class="text-xl font-semibold">You've voted! Waiting for others...</p>
      </div>

      <!-- Live Vote Count -->
      <div v-if="votes.length > 0" class="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20">
        <h3 class="font-bold mb-3">Live Results</h3>
        <div class="space-y-2">
          <div class="flex items-center justify-between">
            <span class="font-semibold">I Have:</span>
            <span class="text-green-400">{{ iHaveCount }} votes</span>
          </div>
          <div class="flex items-center justify-between">
            <span class="font-semibold">I Have Not:</span>
            <span class="text-red-400">{{ iHaveNotCount }} votes</span>
          </div>
          <div class="mt-2 text-sm text-white/60">
            {{ votes.length }} / {{ roomState.players.length }} players voted
          </div>
        </div>
      </div>

      <!-- Host: Show Results Button -->
      <div v-if="isHost && votes.length > 0" class="bg-purple-500/20 rounded-xl p-4 border border-purple-500/30">
        <button
          @click="showResults"
          class="w-full bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 hover:from-purple-500 hover:via-pink-500 hover:to-purple-500 text-white px-6 py-3 rounded-xl font-black shadow-xl transition-all transform hover:scale-105"
        >
          <Icon icon="mdi:chart-bar" class="w-5 h-5 inline mr-2" />
          Show Results
        </button>
      </div>
    </div>

    <!-- Results Phase -->
    <div v-else-if="roomState.gamePhase === 'results'" class="space-y-6">
      <div class="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
        <h2 class="text-2xl font-bold mb-4 text-center">Results</h2>
        
        <div class="space-y-4">
          <div class="bg-green-500/20 border-2 border-green-500/50 rounded-xl p-4">
            <div class="flex items-center justify-between mb-2">
              <span class="font-bold text-lg">I Have</span>
              <span class="text-2xl font-black text-green-400">{{ iHaveCount }}</span>
            </div>
            <div v-if="roomState.answerVisibility === 'public'" class="mt-2 space-y-1">
              <div
                v-for="vote in iHaveVotes"
                :key="vote.socketId || Math.random()"
                class="text-sm text-white/80"
              >
                {{ vote.nickname || 'Player' }}
              </div>
            </div>
          </div>

          <div class="bg-red-500/20 border-2 border-red-500/50 rounded-xl p-4">
            <div class="flex items-center justify-between mb-2">
              <span class="font-bold text-lg">I Have Not</span>
              <span class="text-2xl font-black text-red-400">{{ iHaveNotCount }}</span>
            </div>
            <div v-if="roomState.answerVisibility === 'public'" class="mt-2 space-y-1">
              <div
                v-for="vote in iHaveNotVotes"
                :key="vote.socketId || Math.random()"
                class="text-sm text-white/80"
              >
                {{ vote.nickname || 'Player' }}
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Host Controls for Next Round -->
      <div v-if="isHost" class="bg-purple-500/20 rounded-xl p-6 border border-purple-500/30">
        <button
          @click="getNextQuestion"
          :disabled="isLoading"
          class="w-full bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 hover:from-purple-500 hover:via-pink-500 hover:to-purple-500 text-white px-6 py-3 rounded-xl font-black shadow-xl transition-all transform hover:scale-105 disabled:opacity-50"
        >
          <Icon icon="mdi:arrow-right" class="w-5 h-5 inline mr-2" />
          {{ isLoading ? 'Loading...' : 'Next Question' }}
        </button>
      </div>
    </div>

    <!-- Waiting State -->
    <div v-else class="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20 text-center">
      <div class="animate-pulse">
        <Icon icon="mdi:clock-outline" class="w-16 h-16 mx-auto mb-4 text-purple-400" />
        <p class="text-xl font-semibold">Waiting for host to start...</p>
      </div>
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
          <span v-if="player.isHost" class="text-xs text-purple-400">👑</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { Icon } from '@iconify/vue'

interface Props {
  roomState: any
  isHost: boolean
  multiplayer: any
}

const props = defineProps<Props>()

const isLoading = ref(false)
const isSubmitting = ref(false)
const hasVoted = ref(false)
const myVote = ref<string | null>(null)

const votes = computed(() => props.multiplayer.votes.value || [])

const iHaveVotes = computed(() => {
  return votes.value.filter((v: any) => v.vote === 'I Have')
})

const iHaveNotVotes = computed(() => {
  return votes.value.filter((v: any) => v.vote === 'I Have Not')
})

const iHaveCount = computed(() => iHaveVotes.value.length)
const iHaveNotCount = computed(() => iHaveNotVotes.value.length)

// Watch for vote updates to check if we've voted
watch(() => [props.multiplayer.votes.value, props.multiplayer.myPlayer.value], ([newVotes, myPlayer]) => {
  if (myPlayer && newVotes) {
    const myVoteData = newVotes.find((v: any) => v.socketId === myPlayer.socketId)
    if (myVoteData) {
      hasVoted.value = true
      myVote.value = myVoteData.vote
    } else {
      hasVoted.value = false
      myVote.value = null
    }
  }
}, { immediate: true })

// Reset vote status when new question starts
watch(() => props.roomState.currentPrompt, () => {
  hasVoted.value = false
  myVote.value = null
})

const submitVote = async (vote: string) => {
  if (isSubmitting.value || hasVoted.value) return
  isSubmitting.value = true

  try {
    props.multiplayer.submitVote(vote)
    hasVoted.value = true
    myVote.value = vote
  } catch (error) {
    console.error('Error submitting vote:', error)
  } finally {
    isSubmitting.value = false
  }
}

const showResults = () => {
  if (!props.isHost) return
  props.multiplayer.showResults()
}

const getNextQuestion = async () => {
  if (isLoading.value || !props.isHost) return
  isLoading.value = true

  try {
    const response = await $fetch('/api/group-questions/next', {
      method: 'POST',
      body: {
        gameType: 'NEVER_HAVE_I_EVER',
        intensity: 2,
      }
    })

    if (response) {
      props.multiplayer.nextRound({
        text: response.text,
        intensity: response.intensity,
      })
    }
  } catch (error) {
    console.error('Error fetching question:', error)
  } finally {
    isLoading.value = false
  }
}
</script>

