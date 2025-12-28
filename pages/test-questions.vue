<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 text-white p-8">
    <div class="max-w-6xl mx-auto">
      <h1 class="text-4xl font-bold mb-8">Question Test Page</h1>
      
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <!-- Never Have I Ever -->
        <div class="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-purple-500/30">
          <h2 class="text-2xl font-bold mb-4 text-purple-400">Never Have I Ever</h2>
          <button @click="testNHIE" class="bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded-lg mb-4 w-full">
            Load Questions
          </button>
          <div v-if="nhieData.loading" class="text-sm">Loading...</div>
          <div v-else-if="nhieData.error" class="text-red-400 text-sm">{{ nhieData.error }}</div>
          <div v-else class="space-y-2">
            <p class="text-sm font-bold">Count: {{ nhieData.count }}</p>
            <div class="text-xs space-y-1 max-h-64 overflow-y-auto">
              <p v-for="(q, i) in nhieData.questions.slice(0, 5)" :key="i" class="border-l-2 border-purple-400 pl-2">
                {{ q }}
              </p>
            </div>
          </div>
        </div>

        <!-- Truth -->
        <div class="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-pink-500/30">
          <h2 class="text-2xl font-bold mb-4 text-pink-400">Truth</h2>
          <button @click="testTruth" class="bg-pink-600 hover:bg-pink-700 px-4 py-2 rounded-lg mb-4 w-full">
            Load Questions
          </button>
          <div v-if="truthData.loading" class="text-sm">Loading...</div>
          <div v-else-if="truthData.error" class="text-red-400 text-sm">{{ truthData.error }}</div>
          <div v-else class="space-y-2">
            <p class="text-sm font-bold">Count: {{ truthData.count }}</p>
            <div class="text-xs space-y-1 max-h-64 overflow-y-auto">
              <p v-for="(q, i) in truthData.questions.slice(0, 5)" :key="i" class="border-l-2 border-pink-400 pl-2">
                {{ q }}
              </p>
            </div>
          </div>
        </div>

        <!-- Dare -->
        <div class="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-cyan-500/30">
          <h2 class="text-2xl font-bold mb-4 text-cyan-400">Dare</h2>
          <button @click="testDare" class="bg-cyan-600 hover:bg-cyan-700 px-4 py-2 rounded-lg mb-4 w-full">
            Load Questions
          </button>
          <div v-if="dareData.loading" class="text-sm">Loading...</div>
          <div v-else-if="dareData.error" class="text-red-400 text-sm">{{ dareData.error }}</div>
          <div v-else class="space-y-2">
            <p class="text-sm font-bold">Count: {{ dareData.count }}</p>
            <div class="text-xs space-y-1 max-h-64 overflow-y-auto">
              <p v-for="(q, i) in dareData.questions.slice(0, 5)" :key="i" class="border-l-2 border-cyan-400 pl-2">
                {{ q }}
              </p>
            </div>
          </div>
        </div>

        <!-- Most Likely To -->
        <div class="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-blue-500/30">
          <h2 class="text-2xl font-bold mb-4 text-blue-400">Most Likely To</h2>
          <button @click="testMLT" class="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg mb-4 w-full">
            Load Questions
          </button>
          <div v-if="mltData.loading" class="text-sm">Loading...</div>
          <div v-else-if="mltData.error" class="text-red-400 text-sm">{{ mltData.error }}</div>
          <div v-else class="space-y-2">
            <p class="text-sm font-bold">Count: {{ mltData.count }}</p>
            <div class="text-xs space-y-1 max-h-64 overflow-y-auto">
              <p v-for="(q, i) in mltData.questions.slice(0, 5)" :key="i" class="border-l-2 border-blue-400 pl-2">
                {{ q }}
              </p>
            </div>
          </div>
        </div>

        <!-- Do or Drink -->
        <div class="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-orange-500/30">
          <h2 class="text-2xl font-bold mb-4 text-orange-400">Do or Drink</h2>
          <button @click="testDoD" class="bg-orange-600 hover:bg-orange-700 px-4 py-2 rounded-lg mb-4 w-full">
            Load Questions
          </button>
          <div v-if="dodData.loading" class="text-sm">Loading...</div>
          <div v-else-if="dodData.error" class="text-red-400 text-sm">{{ dodData.error }}</div>
          <div v-else class="space-y-2">
            <p class="text-sm font-bold">Count: {{ dodData.count }}</p>
            <div class="text-xs space-y-1 max-h-64 overflow-y-auto">
              <p v-for="(q, i) in dodData.questions.slice(0, 5)" :key="i" class="border-l-2 border-orange-400 pl-2">
                {{ q }}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div class="mt-8 bg-green-500/20 border border-green-500/50 rounded-xl p-6">
        <h3 class="text-xl font-bold mb-4 text-green-400">Instructions</h3>
        <ol class="list-decimal list-inside space-y-2 text-sm">
          <li>Click each "Load Questions" button</li>
          <li>Verify each game shows questions (not errors)</li>
          <li>Check that question counts match expected values</li>
          <li>If you see errors, check the browser console (F12)</li>
        </ol>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'

const nhieData = reactive({ loading: false, error: null, questions: [], count: 0 })
const truthData = reactive({ loading: false, error: null, questions: [], count: 0 })
const dareData = reactive({ loading: false, error: null, questions: [], count: 0 })
const mltData = reactive({ loading: false, error: null, questions: [], count: 0 })
const dodData = reactive({ loading: false, error: null, questions: [], count: 0 })

const testNHIE = async () => {
  nhieData.loading = true
  nhieData.error = null
  try {
    const response = await $fetch('/api/questions/group-game?gameType=NEVER_HAVE_I_EVER&limit=200')
    console.log('NHIE Response:', response)
    nhieData.questions = response.questions.map(q => q.text || q)
    nhieData.count = nhieData.questions.length
  } catch (error) {
    console.error('NHIE Error:', error)
    nhieData.error = error.message || 'Failed to load'
  } finally {
    nhieData.loading = false
  }
}

const testTruth = async () => {
  truthData.loading = true
  truthData.error = null
  try {
    const response = await $fetch('/api/questions/truth-or-dare?type=TRUTH&limit=200')
    console.log('Truth Response:', response)
    truthData.questions = response.questions.map(q => q.text || q)
    truthData.count = truthData.questions.length
  } catch (error) {
    console.error('Truth Error:', error)
    truthData.error = error.message || 'Failed to load'
  } finally {
    truthData.loading = false
  }
}

const testDare = async () => {
  dareData.loading = true
  dareData.error = null
  try {
    const response = await $fetch('/api/questions/truth-or-dare?type=DARE&limit=200')
    console.log('Dare Response:', response)
    dareData.questions = response.questions.map(q => q.text || q)
    dareData.count = dareData.questions.length
  } catch (error) {
    console.error('Dare Error:', error)
    dareData.error = error.message || 'Failed to load'
  } finally {
    dareData.loading = false
  }
}

const testMLT = async () => {
  mltData.loading = true
  mltData.error = null
  try {
    const response = await $fetch('/api/questions/group-game?gameType=MOST_LIKELY_TO&limit=200')
    console.log('MLT Response:', response)
    mltData.questions = response.questions.map(q => q.text || q)
    mltData.count = mltData.questions.length
  } catch (error) {
    console.error('MLT Error:', error)
    mltData.error = error.message || 'Failed to load'
  } finally {
    mltData.loading = false
  }
}

const testDoD = async () => {
  dodData.loading = true
  dodData.error = null
  try {
    const response = await $fetch('/api/questions/do-or-drink?limit=200')
    console.log('DoD Response:', response)
    dodData.questions = response.questions.map(q => q.text || q)
    dodData.count = dodData.questions.length
  } catch (error) {
    console.error('DoD Error:', error)
    dodData.error = error.message || 'Failed to load'
  } finally {
    dodData.loading = false
  }
}
</script>

