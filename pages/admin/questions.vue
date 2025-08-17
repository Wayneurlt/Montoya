<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <div>
        <h1 class="text-2xl sm:text-3xl font-bold">Manage Questions</h1>
        <p class="text-white/60 text-sm mt-1">
          Total: {{ totalQuestions }} questions across all games
        </p>
      </div>
      <div class="flex gap-2">
        <UButton icon="i-mdi:database-import" color="neutral" variant="soft" @click="seedAllQuestions">
          Import All
        </UButton>
        <UDropdown :items="quickAddItems">
          <UButton icon="i-mdi:plus" color="primary">
            Add Question
            <UIcon name="i-heroicons-chevron-down-20-solid" class="w-4 h-4 ml-1" />
          </UButton>
        </UDropdown>
      </div>
    </div>

    <!-- Game Sections -->
    <div class="space-y-8">
      <!-- Truth or Dare Section -->
      <div class="bg-white/5 border border-white/10 rounded-xl p-6">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-xl font-bold text-pink-400">🎯 Truth or Dare</h2>
          <div class="flex gap-2">
            <UButton size="sm" color="blue" variant="soft" @click="openCreateFor('TRUTH_OR_DARE', 'TRUTH')">
              <Icon name="i-mdi-plus" class="w-4 h-4 mr-1" />
              Add Truth
            </UButton>
            <UButton size="sm" color="purple" variant="soft" @click="openCreateFor('TRUTH_OR_DARE', 'DARE')">
              <Icon name="i-mdi-plus" class="w-4 h-4 mr-1" />
              Add Dare
            </UButton>
          </div>
        </div>
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <!-- Truth Cards -->
          <div>
            <div class="flex items-center justify-between mb-3">
              <h3 class="text-lg font-semibold text-blue-300">Truth Questions ({{ truthCards.length }})</h3>
              <UButton size="xs" color="blue" variant="ghost" @click="openCreateFor('TRUTH_OR_DARE', 'TRUTH')">
                <Icon name="i-mdi-plus" class="w-3 h-3" />
              </UButton>
            </div>
            <div class="space-y-2 max-h-64 overflow-y-auto">
              <div v-for="card in truthCards.slice(0, 10)" :key="card.id" 
                   class="p-3 bg-white/5 rounded-lg border border-white/10">
                <div class="text-sm text-white/90">{{ card.text }}</div>
                <div class="flex justify-between items-center mt-2">
                  <span class="text-xs text-white/60">Intensity: {{ card.intensity }}</span>
                  <div class="flex gap-1">
                    <UButton size="xs" color="neutral" variant="soft" @click="editQuestion(card)">Edit</UButton>
                    <UButton size="xs" color="red" variant="soft" @click="deleteQuestion(card)">Delete</UButton>
                  </div>
                </div>
              </div>
              <div v-if="truthCards.length > 10" class="text-center text-white/60 text-sm">
                ... and {{ truthCards.length - 10 }} more
              </div>
            </div>
          </div>

          <!-- Dare Cards -->
          <div>
            <div class="flex items-center justify-between mb-3">
              <h3 class="text-lg font-semibold text-purple-300">Dare Questions ({{ dareCards.length }})</h3>
              <UButton size="xs" color="purple" variant="ghost" @click="openCreateFor('TRUTH_OR_DARE', 'DARE')">
                <Icon name="i-mdi-plus" class="w-3 h-3" />
              </UButton>
            </div>
            <div class="space-y-2 max-h-64 overflow-y-auto">
              <div v-for="card in dareCards.slice(0, 10)" :key="card.id" 
                   class="p-3 bg-white/5 rounded-lg border border-white/10">
                <div class="text-sm text-white/90">{{ card.text }}</div>
                <div class="flex justify-between items-center mt-2">
                  <span class="text-xs text-white/60">Intensity: {{ card.intensity }}</span>
                  <div class="flex gap-1">
                    <UButton size="xs" color="neutral" variant="soft" @click="editQuestion(card)">Edit</UButton>
                    <UButton size="xs" color="red" variant="soft" @click="deleteQuestion(card)">Delete</UButton>
                  </div>
                </div>
              </div>
              <div v-if="dareCards.length > 10" class="text-center text-white/60 text-sm">
                ... and {{ dareCards.length - 10 }} more
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Do or Drink Section -->
      <div class="bg-white/5 border border-white/10 rounded-xl p-6">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-xl font-bold text-orange-400">🍺 Do or Drink</h2>
          <UButton size="sm" color="orange" variant="soft" @click="openCreateFor('DO_OR_DRINK', 'DO')">
            <Icon name="i-mdi-plus" class="w-4 h-4 mr-1" />
            Add Challenge
          </UButton>
        </div>
        <div class="space-y-2 max-h-64 overflow-y-auto">
          <div v-for="card in doOrDrinkCards.slice(0, 15)" :key="card.id" 
               class="p-3 bg-white/5 rounded-lg border border-white/10">
            <div class="text-sm text-white/90">{{ card.text }}</div>
            <div class="flex justify-between items-center mt-2">
              <div class="flex gap-3 text-xs text-white/60">
                <span>Intensity: {{ card.intensity }}</span>
                <span v-if="card.drinkAmount">Drink: {{ card.drinkAmount }}</span>
              </div>
              <div class="flex gap-1">
                <UButton size="xs" color="neutral" variant="soft" @click="editQuestion(card)">Edit</UButton>
                <UButton size="xs" color="red" variant="soft" @click="deleteQuestion(card)">Delete</UButton>
              </div>
            </div>
          </div>
          <div v-if="doOrDrinkCards.length > 15" class="text-center text-white/60 text-sm">
            ... and {{ doOrDrinkCards.length - 15 }} more
          </div>
        </div>
      </div>

      <!-- Group Games Section -->
      <div class="bg-white/5 border border-white/10 rounded-xl p-6">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-xl font-bold text-green-400">👥 Group Games</h2>
          <div class="flex gap-2 flex-wrap">
            <UButton size="sm" color="red" variant="soft" @click="openCreateFor('NEVER_HAVE_I_EVER')">
              <Icon name="i-mdi-plus" class="w-4 h-4 mr-1" />
              Add NHIE
            </UButton>
            <UButton size="sm" color="yellow" variant="soft" @click="openCreateFor('MOST_LIKELY_TO')">
              <Icon name="i-mdi-plus" class="w-4 h-4 mr-1" />
              Add MLT
            </UButton>
            <UButton size="sm" color="cyan" variant="soft" @click="openCreateFor('WOULD_YOU_RATHER')">
              <Icon name="i-mdi-plus" class="w-4 h-4 mr-1" />
              Add WYR
            </UButton>
          </div>
        </div>
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <!-- Never Have I Ever -->
          <div>
            <div class="flex items-center justify-between mb-3">
              <h3 class="text-lg font-semibold text-red-300">Never Have I Ever ({{ neverHaveQuestions.length }})</h3>
              <UButton size="xs" color="red" variant="ghost" @click="openCreateFor('NEVER_HAVE_I_EVER')">
                <Icon name="i-mdi-plus" class="w-3 h-3" />
              </UButton>
            </div>
            <div class="space-y-2 max-h-48 overflow-y-auto">
              <div v-for="q in neverHaveQuestions.slice(0, 8)" :key="q.id" 
                   class="p-3 bg-white/5 rounded-lg border border-white/10">
                <div class="text-sm text-white/90">{{ q.text }}</div>
                <div class="flex justify-between items-center mt-2">
                  <span class="text-xs text-white/60">Intensity: {{ q.intensity }}</span>
                  <div class="flex gap-1">
                    <UButton size="xs" color="neutral" variant="soft" @click="editQuestion(q)">Edit</UButton>
                    <UButton size="xs" color="red" variant="soft" @click="deleteQuestion(q)">Delete</UButton>
                  </div>
                </div>
              </div>
              <div v-if="neverHaveQuestions.length > 8" class="text-center text-white/60 text-sm">
                ... and {{ neverHaveQuestions.length - 8 }} more
              </div>
            </div>
          </div>

          <!-- Most Likely To -->
          <div>
            <div class="flex items-center justify-between mb-3">
              <h3 class="text-lg font-semibold text-yellow-300">Most Likely To ({{ mostLikelyQuestions.length }})</h3>
              <UButton size="xs" color="yellow" variant="ghost" @click="openCreateFor('MOST_LIKELY_TO')">
                <Icon name="i-mdi-plus" class="w-3 h-3" />
              </UButton>
            </div>
            <div class="space-y-2 max-h-48 overflow-y-auto">
              <div v-for="q in mostLikelyQuestions.slice(0, 8)" :key="q.id" 
                   class="p-3 bg-white/5 rounded-lg border border-white/10">
                <div class="text-sm text-white/90">{{ q.text }}</div>
                <div class="flex justify-between items-center mt-2">
                  <span class="text-xs text-white/60">Intensity: {{ q.intensity }}</span>
                  <div class="flex gap-1">
                    <UButton size="xs" color="neutral" variant="soft" @click="editQuestion(q)">Edit</UButton>
                    <UButton size="xs" color="red" variant="soft" @click="deleteQuestion(q)">Delete</UButton>
                  </div>
                </div>
              </div>
              <div v-if="mostLikelyQuestions.length > 8" class="text-center text-white/60 text-sm">
                ... and {{ mostLikelyQuestions.length - 8 }} more
              </div>
            </div>
          </div>

          <!-- Would You Rather -->
          <div>
            <div class="flex items-center justify-between mb-3">
              <h3 class="text-lg font-semibold text-cyan-300">Would You Rather ({{ wouldYouRatherQuestions.length }})</h3>
              <UButton size="xs" color="cyan" variant="ghost" @click="openCreateFor('WOULD_YOU_RATHER')">
                <Icon name="i-mdi-plus" class="w-3 h-3" />
              </UButton>
            </div>
            <div class="space-y-2 max-h-48 overflow-y-auto">
              <div v-for="q in wouldYouRatherQuestions.slice(0, 8)" :key="q.id" 
                   class="p-3 bg-white/5 rounded-lg border border-white/10">
                <div class="text-sm text-white/90">{{ q.text }}</div>
                <div class="flex justify-between items-center mt-2">
                  <span class="text-xs text-white/60">Intensity: {{ q.intensity }}</span>
                  <div class="flex gap-1">
                    <UButton size="xs" color="neutral" variant="soft" @click="editQuestion(q)">Edit</UButton>
                    <UButton size="xs" color="red" variant="soft" @click="deleteQuestion(q)">Delete</UButton>
                  </div>
                </div>
              </div>
              <div v-if="wouldYouRatherQuestions.length > 8" class="text-center text-white/60 text-sm">
                ... and {{ wouldYouRatherQuestions.length - 8 }} more
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="text-center py-8">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto"></div>
      <p class="text-white/60 mt-2">Loading questions...</p>
    </div>

    <!-- Add/Edit Question Modal -->
    <UModal v-model="showEditModal" :ui="{ width: 'sm:max-w-lg' }">
      <UCard>
        <template #header>
          <div class="flex items-center justify-between">
            <h3 class="text-lg font-semibold text-gray-900">
              {{ editingQuestion?.id ? 'Edit Question' : 'Add New Question' }}
            </h3>
            <UButton color="gray" variant="ghost" icon="i-heroicons-x-mark-20-solid" @click="showEditModal = false" />
          </div>
        </template>

        <div class="space-y-4">
          <!-- Step 1: Game Type (only for new questions) -->
          <div v-if="!editingQuestion?.id" class="space-y-3">
            <label class="text-sm font-medium text-gray-700">1. Choose Game Type</label>
            <USelectMenu 
              v-model="newQuestion.gameType" 
              :options="gameTypeSelectOptions" 
              placeholder="Select a game type..."
              @change="onGameTypeChange"
            />
          </div>

          <!-- Step 2: Truth or Dare Type (only for Truth or Dare) -->
          <div v-if="newQuestion.gameType === 'TRUTH_OR_DARE' && !editingQuestion?.id" class="space-y-3">
            <label class="text-sm font-medium text-gray-700">2. Truth or Dare?</label>
            <div class="flex gap-2">
              <UButton 
                :color="newQuestion.type === 'TRUTH' ? 'blue' : 'gray'" 
                :variant="newQuestion.type === 'TRUTH' ? 'solid' : 'outline'"
                @click="newQuestion.type = 'TRUTH'"
                class="flex-1"
              >
                🎯 Truth
              </UButton>
              <UButton 
                :color="newQuestion.type === 'DARE' ? 'purple' : 'gray'" 
                :variant="newQuestion.type === 'DARE' ? 'solid' : 'outline'"
                @click="newQuestion.type = 'DARE'"
                class="flex-1"
              >
                ⚡ Dare
              </UButton>
            </div>
          </div>

          <!-- Step 3: Question Text -->
          <div class="space-y-3">
            <label class="text-sm font-medium text-gray-700">
              {{ editingQuestion?.id ? 'Question Text' : (newQuestion.gameType ? '3.' : '2.') }} Write Your Question *
            </label>
            <UTextarea 
              v-model="newQuestion.text" 
              :placeholder="getSimplePlaceholder()" 
              :rows="3"
              autoresize
              required
            />
            <div class="text-xs text-gray-500">{{ newQuestion.text.length }}/500 characters</div>
          </div>

          <!-- Step 4: Intensity Level -->
          <div class="space-y-3">
            <label class="text-sm font-medium text-gray-700">
              {{ editingQuestion?.id ? 'Intensity Level' : (newQuestion.gameType ? '4.' : '3.') }} How Intense? *
            </label>
            <div class="flex gap-2">
              <UButton 
                v-for="level in 5" 
                :key="level"
                :color="getIntensityButtonColor(level)"
                :variant="newQuestion.intensity === level ? 'solid' : 'outline'"
                @click="newQuestion.intensity = level"
                size="sm"
                class="flex-1 text-center"
              >
                <div class="flex flex-col items-center">
                  <div class="text-lg">{{ getIntensityEmoji(level) }}</div>
                  <div class="text-xs">{{ level }}</div>
                </div>
              </UButton>
            </div>
            <div class="text-xs text-gray-500">{{ getIntensityDescription(newQuestion.intensity) }}</div>
          </div>

          <!-- Step 5: Drink Amount (for Do or Drink only) -->
          <div v-if="newQuestion.gameType === 'DO_OR_DRINK'" class="space-y-3">
            <label class="text-sm font-medium text-gray-700">
              {{ editingQuestion?.id ? 'Drink Amount' : '5.' }} Drink Amount (Optional)
            </label>
            <USelectMenu 
              v-model="newQuestion.drinkAmount" 
              :options="drinkAmountSelectOptions"
              placeholder="Choose drink amount..."
              searchable
              creatable
            />
          </div>

          <!-- Preview -->
          <div v-if="newQuestion.text && newQuestion.gameType" class="space-y-3">
            <label class="text-sm font-medium text-gray-700">Preview</label>
            <div class="bg-gray-50 p-4 rounded-lg border">
              <div class="text-gray-900 font-medium mb-2">{{ newQuestion.text }}</div>
              <div class="flex items-center gap-4 text-sm text-gray-600">
                <span class="flex items-center gap-1">
                  {{ getGameIcon(newQuestion.gameType) }} {{ getGameTypeLabel(newQuestion.gameType) }}
                </span>
                <span v-if="newQuestion.type" class="flex items-center gap-1">
                  {{ newQuestion.type === 'TRUTH' ? '🎯' : '⚡' }} {{ newQuestion.type }}
                </span>
                <span class="flex items-center gap-1">
                  {{ getIntensityEmoji(newQuestion.intensity) }} Level {{ newQuestion.intensity }}
                </span>
                <span v-if="newQuestion.drinkAmount" class="flex items-center gap-1">
                  🍺 {{ newQuestion.drinkAmount }}
                </span>
              </div>
            </div>
          </div>
        </div>

        <template #footer>
          <div class="flex justify-end gap-3">
            <UButton color="gray" variant="soft" @click="showEditModal = false">
              Cancel
            </UButton>
            <UButton 
              color="primary" 
              :loading="saving"
              :disabled="!canSave"
              @click="saveQuestion"
            >
              {{ editingQuestion?.id ? 'Update' : 'Add Question' }}
            </UButton>
          </div>
        </template>
      </UCard>
    </UModal>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ 
  layout: 'admin',
  middleware: 'admin'
})

// State
const loading = ref(true)
const saving = ref(false)
const showEditModal = ref(false)
const editingQuestion = ref(null)

// Question categories
const truthCards = ref([])
const dareCards = ref([])
const doOrDrinkCards = ref([])
const neverHaveQuestions = ref([])
const mostLikelyQuestions = ref([])
const wouldYouRatherQuestions = ref([])

// Form data
const newQuestion = reactive({
  gameType: '',
  type: '',
  text: '',
  intensity: 1,
  drinkAmount: ''
})

const gameTypeOptions = [
  { label: 'Truth or Dare', value: 'TRUTH_OR_DARE' },
  { label: 'Do or Drink', value: 'DO_OR_DRINK' },
  { label: 'Never Have I Ever', value: 'NEVER_HAVE_I_EVER' },
  { label: 'Most Likely To', value: 'MOST_LIKELY_TO' },
  { label: 'Would You Rather', value: 'WOULD_YOU_RATHER' }
]

const drinkAmountOptions = ['1 sip', '2 sips', '3 sips', '1 gulp', '2 gulps', '3 gulps', 'shot', 'finish drink']

// Select menu options
const gameTypeSelectOptions = computed(() => gameTypeOptions.map(option => ({
  label: `${getGameIcon(option.value)} ${option.label}`,
  value: option.value
})))

const drinkAmountSelectOptions = computed(() => drinkAmountOptions.map(amount => ({
  label: amount,
  value: amount
})))

// Computed properties
const canSave = computed(() => {
  return newQuestion.text.trim() && 
         newQuestion.gameType && 
         (newQuestion.gameType !== 'TRUTH_OR_DARE' || newQuestion.type) &&
         newQuestion.intensity >= 1 && 
         newQuestion.intensity <= 5
})

const totalQuestions = computed(() => {
  return truthCards.value.length + 
         dareCards.value.length + 
         doOrDrinkCards.value.length + 
         neverHaveQuestions.value.length + 
         mostLikelyQuestions.value.length + 
         wouldYouRatherQuestions.value.length
})

const quickAddItems = computed(() => [
  [{
    label: 'Truth Question',
    icon: '🎯',
    click: () => openCreateFor('TRUTH_OR_DARE', 'TRUTH')
  }, {
    label: 'Dare Challenge',
    icon: '⚡',
    click: () => openCreateFor('TRUTH_OR_DARE', 'DARE')
  }],
  [{
    label: 'Do or Drink',
    icon: '🍺',
    click: () => openCreateFor('DO_OR_DRINK', 'DO')
  }],
  [{
    label: 'Never Have I Ever',
    icon: '🙋',
    click: () => openCreateFor('NEVER_HAVE_I_EVER')
  }, {
    label: 'Most Likely To',
    icon: '🤔',
    click: () => openCreateFor('MOST_LIKELY_TO')
  }, {
    label: 'Would You Rather',
    icon: '🤷',
    click: () => openCreateFor('WOULD_YOU_RATHER')
  }]
])

// Helper functions
function onGameTypeChange(gameType: string) {
  newQuestion.gameType = gameType
  // Reset type when changing game type
  if (gameType !== 'TRUTH_OR_DARE') {
    newQuestion.type = gameType === 'DO_OR_DRINK' ? 'DO' : ''
  }
  // Set default drink amount for Do or Drink
  if (gameType === 'DO_OR_DRINK' && !newQuestion.drinkAmount) {
    newQuestion.drinkAmount = '2 sips'
  }
}

function getSimplePlaceholder() {
  if (!newQuestion.gameType) return 'Enter your question here...'
  
  const placeholders = {
    'TRUTH_OR_DARE': newQuestion.type === 'TRUTH' 
      ? 'What is your biggest secret?' 
      : 'Give someone a compliment',
    'DO_OR_DRINK': 'Do a silly dance for 30 seconds',
    'NEVER_HAVE_I_EVER': 'Never have I ever been skydiving',
    'MOST_LIKELY_TO': 'Who is most likely to become famous?',
    'WOULD_YOU_RATHER': 'Would you rather fly or be invisible?'
  }
  return placeholders[newQuestion.gameType] || 'Enter your question here...'
}

function getIntensityButtonColor(level: number) {
  const colors = ['green', 'blue', 'yellow', 'orange', 'red']
  return colors[level - 1] || 'gray'
}

function getGameIcon(gameType: string) {
  const icons = {
    'TRUTH_OR_DARE': '🎯',
    'DO_OR_DRINK': '🍺',
    'NEVER_HAVE_I_EVER': '🙋',
    'MOST_LIKELY_TO': '🤔',
    'WOULD_YOU_RATHER': '🤷'
  }
  return icons[gameType] || '❓'
}

function getGameDescription(gameType: string) {
  const descriptions = {
    'TRUTH_OR_DARE': 'Ask truths or give dares',
    'DO_OR_DRINK': 'Do the challenge or drink',
    'NEVER_HAVE_I_EVER': 'Group elimination game',
    'MOST_LIKELY_TO': 'Vote who\'s most likely',
    'WOULD_YOU_RATHER': 'Choose between options'
  }
  return descriptions[gameType] || ''
}

function getGameTypeLabel(gameType: string) {
  const labels = {
    'TRUTH_OR_DARE': 'Truth or Dare',
    'DO_OR_DRINK': 'Do or Drink',
    'NEVER_HAVE_I_EVER': 'Never Have I Ever',
    'MOST_LIKELY_TO': 'Most Likely To',
    'WOULD_YOU_RATHER': 'Would You Rather'
  }
  return labels[gameType] || gameType
}



function getIntensityEmoji(level: number) {
  const emojis = ['😊', '😏', '😈', '🔥', '💀']
  return emojis[level - 1] || '😊'
}

function getIntensityLabel(level: number) {
  const labels = ['Mild', 'Light', 'Medium', 'Spicy', 'Wild']
  return labels[level - 1] || 'Mild'
}



function getIntensityDescription(level: number) {
  const descriptions = [
    'Safe for everyone - family friendly',
    'Slightly playful - good for warming up',
    'Getting interesting - moderate challenge',
    'Bold and daring - things get spicy',
    'Extreme level - only for the brave!'
  ]
  return descriptions[level - 1] || descriptions[0]
}

// Load all questions and categorize them
async function loadQuestions() {
  loading.value = true
  console.log('🔄 Loading questions for admin dashboard...')
  
  try {
    // Load all questions from the unified API
    const response = await $fetch('/api/admin/all-questions?pageSize=1000')
    console.log('✅ Questions response:', response)
    
    if (!response || !response.items) {
      throw new Error('Invalid response format')
    }

    const allQuestions = response.items

    // Categorize questions
    truthCards.value = allQuestions.filter(q => q.gameType === 'TRUTH_OR_DARE' && q.type === 'TRUTH')
    dareCards.value = allQuestions.filter(q => q.gameType === 'TRUTH_OR_DARE' && q.type === 'DARE')
    doOrDrinkCards.value = allQuestions.filter(q => q.gameType === 'DO_OR_DRINK')
    neverHaveQuestions.value = allQuestions.filter(q => q.gameType === 'NEVER_HAVE_I_EVER')
    mostLikelyQuestions.value = allQuestions.filter(q => q.gameType === 'MOST_LIKELY_TO')
    wouldYouRatherQuestions.value = allQuestions.filter(q => q.gameType === 'WOULD_YOU_RATHER')

    console.log('📊 Questions categorized:')
    console.log(`- Truth: ${truthCards.value.length}`)
    console.log(`- Dare: ${dareCards.value.length}`)
    console.log(`- Do or Drink: ${doOrDrinkCards.value.length}`)
    console.log(`- Never Have I Ever: ${neverHaveQuestions.value.length}`)
    console.log(`- Most Likely To: ${mostLikelyQuestions.value.length}`)
    console.log(`- Would You Rather: ${wouldYouRatherQuestions.value.length}`)
    
  } catch (error) {
    console.error('❌ Error loading questions:', error)
  } finally {
    loading.value = false
  }
}

// Edit question
function editQuestion(question) {
  editingQuestion.value = question
  newQuestion.gameType = question.gameType
  newQuestion.type = question.type || ''
  newQuestion.text = question.text
  newQuestion.intensity = question.intensity
  newQuestion.drinkAmount = question.drinkAmount || ''
  showEditModal.value = true
}

// Open create modal
function openCreate() {
  editingQuestion.value = null
  newQuestion.gameType = ''
  newQuestion.type = ''
  newQuestion.text = ''
  newQuestion.intensity = 1
  newQuestion.drinkAmount = ''
  showEditModal.value = true
}

// Open create modal for specific game type
function openCreateFor(gameType: string, type?: string) {
  editingQuestion.value = null
  newQuestion.gameType = gameType
  newQuestion.type = type || (gameType === 'DO_OR_DRINK' ? 'DO' : '')
  newQuestion.text = ''
  newQuestion.intensity = 1
  newQuestion.drinkAmount = gameType === 'DO_OR_DRINK' ? '2 sips' : ''
  showEditModal.value = true
}

// Save question
async function saveQuestion() {
  if (!newQuestion.text || !newQuestion.gameType) {
    return
  }

  saving.value = true
  
  try {
    if (editingQuestion.value) {
      // Update existing question
      const endpoint = editingQuestion.value.source === 'group' 
        ? `/api/admin/questions/${editingQuestion.value.id}`
        : `/api/admin/cards/${editingQuestion.value.id}`
      
      await $fetch(endpoint, {
        method: 'PUT',
        body: {
          text: newQuestion.text,
          intensity: parseInt(newQuestion.intensity),
          ...(newQuestion.drinkAmount && { drinkAmount: newQuestion.drinkAmount })
        }
      })
    } else {
      // Create new question
      if (['NEVER_HAVE_I_EVER', 'MOST_LIKELY_TO', 'WOULD_YOU_RATHER'].includes(newQuestion.gameType)) {
        // Group question
        await $fetch('/api/admin/questions', {
          method: 'POST',
          body: {
            gameType: newQuestion.gameType,
            text: newQuestion.text,
            intensity: parseInt(newQuestion.intensity),
            isActive: true
          }
        })
      } else {
        // Game card
        await $fetch('/api/admin/cards', {
          method: 'POST',
          body: {
            type: newQuestion.type || 'DO',
            gameType: newQuestion.gameType,
            text: newQuestion.text,
            intensity: parseInt(newQuestion.intensity),
            ...(newQuestion.drinkAmount && { drinkAmount: newQuestion.drinkAmount })
          }
        })
      }
    }
    
    showEditModal.value = false
    await loadQuestions()
  } catch (error) {
    console.error('Error saving question:', error)
  } finally {
    saving.value = false
  }
}

// Delete question
async function deleteQuestion(question) {
  if (!confirm('Are you sure you want to delete this question?')) return
  
  try {
    const endpoint = question.source === 'group' 
      ? `/api/admin/questions/${question.id}`
      : `/api/admin/cards/${question.id}`
    
    await $fetch(endpoint, { method: 'DELETE' })
    await loadQuestions()
  } catch (error) {
    console.error('Error deleting question:', error)
  }
}

// Seed all questions
async function seedAllQuestions() {
  if (!confirm('Import all questions from data files? This will add any missing questions.')) return
  
  try {
    await $fetch('/api/admin/seed-all-questions', { method: 'POST' })
    await loadQuestions()
  } catch (error) {
    console.error('Error seeding questions:', error)
  }
}

// Load questions on mount
onMounted(() => {
  loadQuestions()
})
</script>