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
        🤔 Would You Rather
      </h1>
      <p class="text-purple-200/80 text-sm font-medium">{{ roomState.answerVisibility === 'anonymous' ? 'Anonymous Mode' : 'Public Mode' }}</p>
    </div>

    <!-- Playing Phase: Show Question and Voting -->
    <div v-if="roomState.gamePhase === 'playing' && roomState.currentPrompt" class="space-y-6">
      <!-- Parse question into two options -->
      <div v-if="parsedOptions" class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <!-- Option A -->
        <button
          @click="submitVote('Option A')"
          :disabled="isSubmitting || hasVoted"
          :class="[
            'group cursor-pointer bg-gradient-to-br from-red-800/30 to-red-950/20 hover:from-red-800/40 hover:to-red-950/30 backdrop-blur-md rounded-2xl p-6 border-2 border-red-600/40 hover:border-red-500/70 transition-all duration-300 transform hover:scale-105 min-h-[200px] flex flex-col justify-center',
            { 'ring-4 ring-red-500 scale-105': myVote === 'Option A' },
            { 'opacity-50 cursor-not-allowed': hasVoted && myVote !== 'Option A' }
          ]"
        >
          <div class="text-center">
            <div class="mb-4">
              <span class="inline-block bg-red-600 text-white px-4 py-2 rounded-full font-bold text-lg">
                Option A
              </span>
            </div>
            <p class="text-xl md:text-2xl font-bold text-white leading-relaxed">
              {{ parsedOptions.optionA }}
            </p>
            <div v-if="myVote === 'Option A'" class="mt-4">
              <Icon icon="mdi:check-circle" class="w-8 h-8 text-red-400 mx-auto animate-bounce" />
            </div>
          </div>
        </button>

        <!-- VS Badge -->
        <div class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-20 hidden md:block">
          <div class="bg-gradient-to-r from-red-700 to-orange-700 px-4 py-2 rounded-full shadow-2xl border-2 border-amber-500/40">
            <span class="text-xl font-black">VS</span>
          </div>
        </div>

        <!-- Option B -->
        <button
          @click="submitVote('Option B')"
          :disabled="isSubmitting || hasVoted"
          :class="[
            'group cursor-pointer bg-gradient-to-br from-orange-800/30 to-orange-950/20 hover:from-orange-800/40 hover:to-orange-950/30 backdrop-blur-md rounded-2xl p-6 border-2 border-orange-600/40 hover:border-orange-500/70 transition-all duration-300 transform hover:scale-105 min-h-[200px] flex flex-col justify-center',
            { 'ring-4 ring-orange-500 scale-105': myVote === 'Option B' },
            { 'opacity-50 cursor-not-allowed': hasVoted && myVote !== 'Option B' }
          ]"
        >
          <div class="text-center">
            <div class="mb-4">
              <span class="inline-block bg-orange-600 text-white px-4 py-2 rounded-full font-bold text-lg">
                Option B
              </span>
            </div>
            <p class="text-xl md:text-2xl font-bold text-white leading-relaxed">
              {{ parsedOptions.optionB }}
            </p>
            <div v-if="myVote === 'Option B'" class="mt-4">
              <Icon icon="mdi:check-circle" class="w-8 h-8 text-orange-400 mx-auto animate-bounce" />
            </div>
          </div>
        </button>
      </div>

      <!-- Already Voted -->
      <div v-if="hasVoted" class="bg-purple-500/20 border-2 border-purple-500/50 rounded-xl p-6 text-center">
        <Icon icon="mdi:check-circle" class="w-16 h-16 mx-auto mb-4 text-green-400" />
        <p class="text-xl font-semibold">You've voted! Waiting for others...</p>
      </div>

      <!-- Live Vote Count -->
      <div v-if="votes.length > 0" class="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20">
        <h3 class="font-bold mb-3">Live Results</h3>
        <div class="space-y-3">
          <div>
            <div class="flex items-center justify-between mb-2">
              <span class="font-semibold">Option A:</span>
              <span class="text-red-400">{{ optionACount }} votes ({{ optionAPercentage }}%)</span>
            </div>
            <div class="w-full bg-white/10 rounded-full h-4">
              <div class="bg-red-500 h-4 rounded-full transition-all" :style="{ width: optionAPercentage + '%' }"></div>
            </div>
          </div>
          <div>
            <div class="flex items-center justify-between mb-2">
              <span class="font-semibold">Option B:</span>
              <span class="text-orange-400">{{ optionBCount }} votes ({{ optionBPercentage }}%)</span>
            </div>
            <div class="w-full bg-white/10 rounded-full h-4">
              <div class="bg-orange-500 h-4 rounded-full transition-all" :style="{ width: optionBPercentage + '%' }"></div>
            </div>
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
          <div class="bg-red-500/20 border-2 border-red-500/50 rounded-xl p-4">
            <div class="flex items-center justify-between mb-2">
              <span class="font-bold text-lg">Option A</span>
              <span class="text-2xl font-black text-red-400">{{ optionACount }} ({{ optionAPercentage }}%)</span>
            </div>
            <div class="w-full bg-white/10 rounded-full h-4 mb-2">
              <div class="bg-red-500 h-4 rounded-full" :style="{ width: optionAPercentage + '%' }"></div>
            </div>
            <div v-if="roomState.answerVisibility === 'public'" class="mt-2 space-y-1">
              <div
                v-for="vote in optionAVotes"
                :key="vote.socketId || Math.random()"
                class="text-sm text-white/80"
              >
                {{ vote.nickname || 'Player' }}
              </div>
            </div>
          </div>

          <div class="bg-orange-500/20 border-2 border-orange-500/50 rounded-xl p-4">
            <div class="flex items-center justify-between mb-2">
              <span class="font-bold text-lg">Option B</span>
              <span class="text-2xl font-black text-orange-400">{{ optionBCount }} ({{ optionBPercentage }}%)</span>
            </div>
            <div class="w-full bg-white/10 rounded-full h-4 mb-2">
              <div class="bg-orange-500 h-4 rounded-full" :style="{ width: optionBPercentage + '%' }"></div>
            </div>
            <div v-if="roomState.answerVisibility === 'public'" class="mt-2 space-y-1">
              <div
                v-for="vote in optionBVotes"
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

const parsedOptions = computed(() => {
  const prompt = props.roomState.currentPrompt
  if (!prompt) return null
  
  const text = prompt.text || prompt
  // Parse "Would you rather X or Y?" format
  const match = text.match(/Would you rather (.+?) or (.+?)\??$/i)
  if (match) {
    return {
      optionA: match[1].trim(),
      optionB: match[2].trim()
    }
  }
  
  // Fallback: split by " or "
  const parts = text.split(' or ')
  if (parts.length === 2) {
    return {
      optionA: parts[0].replace(/Would you rather /i, '').trim(),
      optionB: parts[1].trim()
    }
  }
  
  return null
})

const optionAVotes = computed(() => {
  return votes.value.filter((v: any) => v.vote === 'Option A')
})

const optionBVotes = computed(() => {
  return votes.value.filter((v: any) => v.vote === 'Option B')
})

const optionACount = computed(() => optionAVotes.value.length)
const optionBCount = computed(() => optionBVotes.value.length)

const totalVotes = computed(() => votes.value.length || 1)
const optionAPercentage = computed(() => Math.round((optionACount.value / totalVotes.value) * 100))
const optionBPercentage = computed(() => Math.round((optionBCount.value / totalVotes.value) * 100))

// Watch for vote updates
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
        gameType: 'WOULD_YOU_RATHER',
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

<style scoped>
.relative {
  position: relative;
}
</style>

