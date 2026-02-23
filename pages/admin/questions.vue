<template>
  <div class="overflow-x-hidden overflow-y-auto pb-6">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
      <div>
        <h1 class="text-2xl sm:text-3xl md:text-4xl font-bold">Manage Questions</h1>
        <p class="text-white/60 text-sm mt-1">
          Total: {{ totalQuestions }} questions
        </p>
      </div>
      <div class="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
        <UButton icon="i-mdi:database-import" color="neutral" variant="soft" @click="seedAllQuestions" class="w-full sm:w-auto">
          Import All
        </UButton>
        <UButton icon="i-mdi:plus" color="primary" @click="showAddForm = true" class="w-full sm:w-auto">
          Add Question
        </UButton>
      </div>
    </div>

    <!-- Search and Filters -->
    <div class="bg-white/5 border border-white/10 rounded-xl p-4 mb-6">
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <UInput
          v-model="searchQuery"
          placeholder="Search questions..."
          icon="i-heroicons-magnifying-glass"
          class="w-full"
        />
        <USelectMenu
          v-model="selectedGameType"
          :options="gameTypeFilterOptions"
          placeholder="All Game Types"
          class="w-full"
        />
        <USelectMenu
          v-model="selectedIntensity"
          :options="intensityFilterOptions"
          placeholder="All Intensities"
          class="w-full"
        />
        <USelectMenu
          v-model="selectedStatus"
          :options="statusFilterOptions"
          placeholder="All Status"
          class="w-full"
        />
      </div>
    </div>

    <!-- Add Question Form -->
    <div v-if="showAddForm" class="bg-white/5 border border-white/10 rounded-xl p-6 mb-6">
      <div class="flex items-center justify-between mb-6">
        <div>
          <h3 class="text-lg font-semibold text-white">
            {{ editingQuestion ? 'Edit Question' : 'Add New Question' }}
          </h3>
          <p class="text-white/60 text-sm mt-1">
            Fill in all required fields to create a new question
          </p>
        </div>
        <UButton 
          color="neutral" 
          variant="ghost" 
          icon="i-heroicons-x-mark-20-solid" 
          @click="closeAddForm"
        />
      </div>

      <!-- Form Validation Messages -->
      <div v-if="formErrors.length > 0" class="mb-4 p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
        <div class="flex items-center gap-2 mb-2">
          <UIcon name="i-heroicons-exclamation-triangle" class="w-5 h-5 text-red-400" />
          <span class="text-red-400 font-medium">Please fix the following errors:</span>
        </div>
        <ul class="list-disc list-inside text-red-300 text-sm space-y-1">
          <li v-for="error in formErrors" :key="error">{{ error }}</li>
        </ul>
      </div>

      <!-- Success Message -->
      <div v-if="successMessage" class="mb-4 p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
        <div class="flex items-center gap-2">
          <UIcon name="i-heroicons-check-circle" class="w-5 h-5 text-green-400" />
          <span class="text-green-400">{{ successMessage }}</span>
        </div>
      </div>

      <div class="space-y-6">
                 <!-- Game Type Selection -->
         <div class="space-y-3">
           <label class="text-sm font-medium text-white/80 flex items-center gap-2">
             Game Type
             <span class="text-red-400">*</span>
           </label>
           <div class="grid grid-cols-2 lg:grid-cols-3 gap-3">
             <UButton
               v-for="option in gameTypeOptions"
               :key="option.value"
               :color="newQuestion.gameType === option.value ? 'primary' : 'neutral'"
               :variant="newQuestion.gameType === option.value ? 'solid' : 'outline'"
               @click="onGameTypeChange(option.value)"
               class="h-20 flex flex-col items-center justify-center gap-2 cursor-pointer"
               type="button"
             >
               <div class="text-2xl">{{ getGameIcon(option.value) }}</div>
               <div class="text-sm font-medium text-center">{{ option.label }}</div>
             </UButton>
           </div>
           <p class="text-xs text-white/60">{{ getGameTypeDescription(newQuestion.gameType) }}</p>
         </div>

        <!-- Truth/Dare Type Selection -->
        <div v-if="newQuestion.gameType === 'TRUTH_OR_DARE'" class="space-y-3">
          <label class="text-sm font-medium text-white/80 flex items-center gap-2">
            Question Type
            <span class="text-red-400">*</span>
          </label>
          <div class="grid grid-cols-2 gap-3">
            <UButton
              :color="newQuestion.type === 'TRUTH' ? 'primary' : 'neutral'"
              :variant="newQuestion.type === 'TRUTH' ? 'solid' : 'outline'"
              @click="newQuestion.type = 'TRUTH'"
              class="h-12 cursor-pointer"
              type="button"
            >
              <div class="flex items-center gap-2">
                <span class="text-lg">🎯</span>
                <span>Truth</span>
              </div>
            </UButton>
            <UButton
              :color="newQuestion.type === 'DARE' ? 'secondary' : 'neutral'"
              :variant="newQuestion.type === 'DARE' ? 'solid' : 'outline'"
              @click="newQuestion.type = 'DARE'"
              class="h-12 cursor-pointer"
              type="button"
            >
              <div class="flex items-center gap-2">
                <span class="text-lg">⚡</span>
                <span>Dare</span>
              </div>
            </UButton>
          </div>
        </div>

        <!-- Intensity Selection -->
        <div class="space-y-3">
          <label class="text-sm font-medium text-white/80 flex items-center gap-2">
            Intensity Level
            <span class="text-red-400">*</span>
          </label>
          <div class="grid grid-cols-5 gap-2">
            <UButton
              v-for="level in 5"
              :key="level"
              :color="getIntensityButtonColor(level)"
              :variant="newQuestion.intensity === level ? 'solid' : 'outline'"
              @click="newQuestion.intensity = level"
              class="h-16 flex flex-col items-center justify-center gap-1 cursor-pointer"
              type="button"
            >
              <div class="text-xl">{{ getIntensityEmoji(level) }}</div>
              <div class="text-xs font-medium">Level {{ level }}</div>
            </UButton>
          </div>
          <div class="text-sm text-white/70 bg-white/10 p-3 rounded-lg">
            <strong>{{ getIntensityLabel(newQuestion.intensity) }}:</strong> {{ getIntensityDescription(newQuestion.intensity) }}
          </div>
        </div>

        <!-- Drink Amount Selection -->
        <div v-if="newQuestion.gameType === 'DO_OR_DRINK'" class="space-y-3">
          <label class="text-sm font-medium text-white/80">
            Drink Amount (Optional)
          </label>
          <USelectMenu
            v-model="newQuestion.drinkAmount"
            :options="drinkAmountOptions"
            placeholder="Select Drink Amount"
            searchable
            creatable
          />
          <p class="text-xs text-white/60">Specify how much the player should drink if they choose not to do the challenge</p>
        </div>

        <!-- Question Text -->
        <div class="space-y-3">
          <label class="text-sm font-medium text-white/80 flex items-center gap-2">
            Question Text
            <span class="text-red-400">*</span>
          </label>
          <UTextarea
            v-model="newQuestion.text"
            :placeholder="getQuestionPlaceholder()"
            :rows="4"
            :error="getFieldError('text')"
            class="w-full"
            maxlength="500"
          />
          <div class="flex justify-between items-center text-xs">
            <span :class="newQuestion.text.length > 450 ? 'text-orange-400' : 'text-white/60'">
              {{ newQuestion.text.length }}/500 characters
            </span>
            <span v-if="newQuestion.text.length > 450" class="text-orange-400">
              {{ 500 - newQuestion.text.length }} characters left
            </span>
          </div>
        </div>

        <!-- Preview -->
        <div v-if="newQuestion.text && newQuestion.gameType" class="space-y-3">
          <label class="text-sm font-medium text-white/80">Preview</label>
          <div class="bg-white/10 p-4 rounded-lg border border-white/20">
            <div class="text-white font-medium mb-3 text-lg">{{ newQuestion.text }}</div>
            <div class="flex flex-wrap items-center gap-3 text-sm text-white/70">
              <span class="flex items-center gap-1 bg-white/20 px-2 py-1 rounded">
                {{ getGameIcon(newQuestion.gameType) }} {{ getGameTypeLabel(newQuestion.gameType) }}
              </span>
              <span v-if="newQuestion.type" class="flex items-center gap-1 bg-white/20 px-2 py-1 rounded">
                {{ newQuestion.type === 'TRUTH' ? '🎯' : '⚡' }} {{ newQuestion.type }}
              </span>
              <span class="flex items-center gap-1 bg-white/20 px-2 py-1 rounded">
                {{ getIntensityEmoji(newQuestion.intensity) }} Level {{ newQuestion.intensity }}
              </span>
              <span v-if="newQuestion.drinkAmount" class="flex items-center gap-1 bg-white/20 px-2 py-1 rounded">
                🍺 {{ newQuestion.drinkAmount }}
              </span>
            </div>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="flex justify-between items-center pt-4 border-t border-white/10">
          <div class="text-sm text-white/60">
            {{ getFormStatus() }}
          </div>
          <div class="flex gap-3">
            <UButton 
              color="neutral" 
              variant="soft" 
              @click="closeAddForm"
              type="button"
            >
              Cancel
            </UButton>
            <UButton
              color="primary"
              :loading="saving"
              :disabled="!canSave || formErrors.length > 0"
              @click="saveQuestion"
              type="button"
            >
              {{ editingQuestion ? 'Update Question' : 'Add Question' }}
            </UButton>
          </div>
        </div>
      </div>
    </div>

    <!-- Questions Table -->
    <div class="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
      <div class="overflow-x-auto -mx-4 sm:mx-0">
        <table class="w-full">
          <thead class="bg-white/10">
            <tr>
              <th class="px-4 py-3 text-left text-sm font-medium text-white">Question</th>
              <th class="px-4 py-3 text-left text-sm font-medium text-white">Game Type</th>
              <th class="px-4 py-3 text-left text-sm font-medium text-white">Type</th>
              <th class="px-4 py-3 text-left text-sm font-medium text-white">Intensity</th>
              <th class="px-4 py-3 text-left text-sm font-medium text-white">Status</th>
              <th class="px-4 py-3 text-left text-sm font-medium text-white">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-white/10">
            <tr v-for="question in paginatedQuestions" :key="question.id" class="hover:bg-white/5">
              <td class="px-4 py-3 text-sm text-white/90 max-w-xs truncate">
                {{ question.text }}
              </td>
              <td class="px-4 py-3 text-sm text-white/70">
                {{ getGameTypeLabel(question.gameType) }}
              </td>
              <td class="px-4 py-3 text-sm text-white/70">
                {{ question.type || '-' }}
              </td>
              <td class="px-4 py-3 text-sm">
                <UBadge :color="getIntensityColor(question.intensity)" variant="soft">
                  Level {{ question.intensity }}
                </UBadge>
              </td>
              <td class="px-4 py-3 text-sm">
                <UBadge :color="question.isActive ? 'success' : 'neutral'" variant="soft">
                  {{ question.isActive ? 'Active' : 'Inactive' }}
                </UBadge>
              </td>
              <td class="px-4 py-3 text-sm">
                <div class="flex gap-2">
                  <UButton size="xs" color="neutral" variant="soft" @click="editQuestion(question)">
                    Edit
                  </UButton>
                  <UButton size="xs" color="error" variant="soft" @click="deleteQuestion(question)">
                    Delete
                  </UButton>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div class="px-4 py-3 bg-white/5 border-t border-white/10">
        <div class="flex items-center justify-between">
          <div class="text-sm text-white/60">
            Showing {{ startIndex + 1 }} to {{ endIndex }} of {{ filteredQuestions.length }} questions
          </div>
          <div class="flex gap-2">
            <UButton
              size="sm"
              color="neutral"
              variant="soft"
              :disabled="currentPage === 1"
              @click="currentPage--"
            >
              Previous
            </UButton>
            <span class="px-3 py-1 text-sm text-white/70">
              Page {{ currentPage }} of {{ totalPages }}
            </span>
            <UButton
              size="sm"
              color="neutral"
              variant="soft"
              :disabled="currentPage === totalPages"
              @click="currentPage++"
            >
              Next
            </UButton>
          </div>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="text-center py-8">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto"></div>
      <p class="text-white/60 mt-2">Loading questions...</p>
    </div>
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
const showAddForm = ref(false)
const editingQuestion = ref(null)

// Search and filters
const searchQuery = ref('')
const selectedGameType = ref('')
const selectedIntensity = ref('')
const selectedStatus = ref('')

// Pagination
const currentPage = ref(1)
const pageSize = ref(20)

// Questions data
const questions = ref([])

// Form data
const newQuestion = reactive({
  gameType: '',
  type: '',
  text: '',
  intensity: 1,
  drinkAmount: ''
})

// Options
const gameTypeOptions = [
  { label: 'Truth or Dare', value: 'TRUTH_OR_DARE' },
  { label: 'Do or Drink', value: 'DO_OR_DRINK' },
  { label: 'Never Have I Ever', value: 'NEVER_HAVE_I_EVER' },
  { label: 'Most Likely To', value: 'MOST_LIKELY_TO' },
  { label: 'Would You Rather', value: 'WOULD_YOU_RATHER' }
]

const truthDareOptions = [
  { label: 'Truth', value: 'TRUTH' },
  { label: 'Dare', value: 'DARE' }
]

const intensityOptions = [
  { label: 'Level 1 - Mild', value: 1 },
  { label: 'Level 2 - Light', value: 2 },
  { label: 'Level 3 - Medium', value: 3 },
  { label: 'Level 4 - Spicy', value: 4 },
  { label: 'Level 5 - Wild', value: 5 }
]

const drinkAmountOptions = [
  { label: '1 sip', value: '1 sip' },
  { label: '2 sips', value: '2 sips' },
  { label: '3 sips', value: '3 sips' },
  { label: '1 gulp', value: '1 gulp' },
  { label: '2 gulps', value: '2 gulps' },
  { label: '3 gulps', value: '3 gulps' },
  { label: 'shot', value: 'shot' },
  { label: 'finish drink', value: 'finish drink' }
]

// Filter options
const gameTypeFilterOptions = computed(() => [
  { label: 'All Game Types', value: '' },
  ...gameTypeOptions
])

const intensityFilterOptions = computed(() => [
  { label: 'All Intensities', value: '' },
  ...intensityOptions
])

const statusFilterOptions = computed(() => [
  { label: 'All Status', value: '' },
  { label: 'Active', value: 'active' },
  { label: 'Inactive', value: 'inactive' }
])

// Computed properties
const canSave = computed(() => {
  return newQuestion.text.trim() && 
         newQuestion.gameType && 
         (newQuestion.gameType !== 'TRUTH_OR_DARE' || newQuestion.type) &&
         newQuestion.intensity
})

const totalQuestions = computed(() => questions.value.length)

const filteredQuestions = computed(() => {
  let filtered = questions.value

  if (searchQuery.value) {
    filtered = filtered.filter(q => 
      q.text.toLowerCase().includes(searchQuery.value.toLowerCase())
    )
  }

  if (selectedGameType.value) {
    filtered = filtered.filter(q => q.gameType === selectedGameType.value)
  }

  if (selectedIntensity.value) {
    filtered = filtered.filter(q => q.intensity === parseInt(selectedIntensity.value))
  }

  if (selectedStatus.value) {
    const isActive = selectedStatus.value === 'active'
    filtered = filtered.filter(q => q.isActive === isActive)
  }

  return filtered
})

const totalPages = computed(() => Math.ceil(filteredQuestions.value.length / pageSize.value))

const startIndex = computed(() => (currentPage.value - 1) * pageSize.value)
const endIndex = computed(() => Math.min(startIndex.value + pageSize.value, filteredQuestions.value.length))

const paginatedQuestions = computed(() => {
  return filteredQuestions.value.slice(startIndex.value, endIndex.value)
})

// State for form validation
const formErrors = ref<string[]>([])
const successMessage = ref('')

// Helper functions
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

function getGameTypeDescription(gameType: string) {
  const descriptions = {
    'TRUTH_OR_DARE': 'Ask truths or give dares to players',
    'DO_OR_DRINK': 'Players must do a challenge or drink',
    'NEVER_HAVE_I_EVER': 'Group elimination game with "Never have I ever" questions',
    'MOST_LIKELY_TO': 'Players vote on who is most likely to do something',
    'WOULD_YOU_RATHER': 'Players choose between two difficult options'
  }
  return descriptions[gameType] || 'Select a game type to get started'
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

function getIntensityColor(level: number) {
  const colors = ['success', 'info', 'warning', 'error', 'error']
  return colors[level - 1] || 'neutral'
}

function getIntensityButtonColor(level: number) {
  const colors = ['success', 'info', 'warning', 'error', 'error']
  return colors[level - 1] || 'neutral'
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
    'Safe for everyone - family friendly content',
    'Slightly playful - good for warming up the group',
    'Getting interesting - moderate challenge level',
    'Bold and daring - things get spicy and fun',
    'Extreme level - only for the brave and adventurous!'
  ]
  return descriptions[level - 1] || descriptions[0]
}

function getQuestionPlaceholder() {
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
  validateForm()
}

function validateForm() {
  const errors: string[] = []
  
  if (!newQuestion.gameType) {
    errors.push('Game type is required')
  }
  
  if (newQuestion.gameType === 'TRUTH_OR_DARE' && !newQuestion.type) {
    errors.push('Question type (Truth or Dare) is required')
  }
  
  if (!newQuestion.text.trim()) {
    errors.push('Question text is required')
  } else if (newQuestion.text.trim().length < 10) {
    errors.push('Question text must be at least 10 characters long')
  } else if (newQuestion.text.trim().length > 500) {
    errors.push('Question text cannot exceed 500 characters')
  }
  
  if (!newQuestion.intensity || newQuestion.intensity < 1 || newQuestion.intensity > 5) {
    errors.push('Intensity level must be between 1 and 5')
  }
  
  formErrors.value = errors
  return errors.length === 0
}

function getFieldError(field: string): string | undefined {
  const error = formErrors.value.find(err => err.toLowerCase().includes(field.toLowerCase()))
  return error
}

function getFormStatus() {
  if (formErrors.value.length > 0) {
    return `${formErrors.value.length} error(s) need to be fixed`
  }
  if (!newQuestion.text.trim() || !newQuestion.gameType) {
    return 'Please fill in all required fields'
  }
  return 'Ready to save'
}

// Load questions
async function loadQuestions() {
  loading.value = true
  try {
    const response = await $fetch('/api/admin/all-questions?pageSize=1000')
    questions.value = response.items || []
  } catch (error) {
    console.error('Error loading questions:', error)
  } finally {
    loading.value = false
  }
}

// Save question
async function saveQuestion() {
  if (!validateForm()) {
    return
  }

  saving.value = true
  successMessage.value = ''
  
  try {
    if (editingQuestion.value) {
      // Update existing question
      const endpoint = (editingQuestion.value as any).source === 'group' 
        ? `/api/admin/questions/${(editingQuestion.value as any).id}`
        : `/api/admin/cards/${(editingQuestion.value as any).id}`
      
      await $fetch(endpoint, {
        method: 'PUT',
        body: {
          text: newQuestion.text,
          intensity: parseInt(newQuestion.intensity.toString()),
          ...(newQuestion.drinkAmount && { drinkAmount: newQuestion.drinkAmount })
        }
      })
      successMessage.value = 'Question updated successfully!'
    } else {
      // Create new question
      if (['NEVER_HAVE_I_EVER', 'MOST_LIKELY_TO', 'WOULD_YOU_RATHER'].includes(newQuestion.gameType)) {
        await $fetch('/api/admin/questions', {
          method: 'POST',
          body: {
            gameType: newQuestion.gameType,
            text: newQuestion.text,
            intensity: parseInt(newQuestion.intensity.toString()),
            isActive: true
          }
        })
      } else {
        await $fetch('/api/admin/cards', {
          method: 'POST',
          body: {
            type: newQuestion.type || 'DO',
            gameType: newQuestion.gameType,
            text: newQuestion.text,
            intensity: parseInt(newQuestion.intensity.toString()),
            ...(newQuestion.drinkAmount && { drinkAmount: newQuestion.drinkAmount })
          }
        })
      }
      successMessage.value = 'Question added successfully!'
    }
    
    await loadQuestions()
    
    // Close form after a short delay to show success message
    setTimeout(() => {
      closeAddForm()
    }, 1500)
  } catch (error) {
    console.error('Error saving question:', error)
    formErrors.value = ['Failed to save question. Please try again.']
  } finally {
    saving.value = false
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
  showAddForm.value = true
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

// Close add form
function closeAddForm() {
  showAddForm.value = false
  editingQuestion.value = null
  newQuestion.gameType = ''
  newQuestion.type = ''
  newQuestion.text = ''
  newQuestion.intensity = 1
  newQuestion.drinkAmount = ''
  formErrors.value = []
  successMessage.value = ''
}

// Watch for form changes to validate in real-time
watch([() => newQuestion.text, () => newQuestion.gameType, () => newQuestion.type, () => newQuestion.intensity], () => {
  if (showAddForm.value) {
    validateForm()
  }
})

// Watch for filter changes to reset pagination
watch([searchQuery, selectedGameType, selectedIntensity, selectedStatus], () => {
  currentPage.value = 1
})

// Load questions on mount
onMounted(() => {
  loadQuestions()
})
</script>
