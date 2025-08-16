<template>
  <div v-if="showStats" class="mt-4 p-3 bg-white/5 rounded-lg border border-white/10">
    <div class="flex items-center justify-between mb-2">
      <h4 class="text-sm font-semibold text-white/80">Question Usage</h4>
      <button 
        @click="toggleStats" 
        class="text-xs px-2 py-1 rounded bg-white/10 hover:bg-white/20 transition-colors"
      >
        <Icon icon="mdi:close" class="w-3 h-3" />
      </button>
    </div>
    
    <div class="space-y-2 text-xs">
      <div v-for="(tracker, label) in trackers" :key="label" class="space-y-1">
        <div class="flex justify-between items-center">
          <span class="text-white/70">{{ label }}</span>
          <span class="text-white/90 font-mono">
            {{ tracker.getUsageStats.value.usedCount }}/{{ tracker.getUsageStats.value.totalQuestions }}
          </span>
        </div>
        
        <!-- Progress bar -->
        <div class="w-full bg-gray-700 rounded-full h-1.5">
          <div 
            class="h-1.5 rounded-full transition-all duration-300"
            :class="getProgressBarColor(tracker.getUsageStats.value.usagePercentage)"
            :style="{ width: `${Math.min(tracker.getUsageStats.value.usagePercentage, 100)}%` }"
          ></div>
        </div>
        
        <!-- Percentage -->
        <div class="text-right">
          <span 
            class="text-xs font-mono"
            :class="getPercentageColor(tracker.getUsageStats.value.usagePercentage)"
          >
            {{ tracker.getUsageStats.value.usagePercentage }}%
          </span>
        </div>
      </div>
      
      <!-- Session info -->
      <div class="mt-3 pt-2 border-t border-white/10">
        <div class="flex items-center gap-2">
          <Icon icon="mdi:information-outline" class="w-3 h-3 text-blue-400" />
          <span class="text-white/60 text-xs">Questions persist across refreshes</span>
        </div>
        
        <button 
          @click="resetAllTrackers" 
          class="mt-1 text-xs px-2 py-1 rounded bg-red-500/20 hover:bg-red-500/30 text-red-300 transition-colors"
        >
          Reset All Progress
        </button>
      </div>
    </div>
  </div>
  
  <!-- Toggle button when stats are hidden -->
  <button 
    v-else
    @click="toggleStats" 
    class="mt-2 text-xs px-3 py-1 rounded bg-white/5 hover:bg-white/10 text-white/60 hover:text-white/80 transition-all flex items-center gap-2"
  >
    <Icon icon="mdi:chart-bar" class="w-3 h-3" />
    Show Question Stats
  </button>
</template>

<script setup>
import { ref } from 'vue'
import { Icon } from '@iconify/vue'

// Props
const props = defineProps({
  trackers: {
    type: Object,
    required: true
  }
})

// State
const showStats = ref(false)

// Methods
const toggleStats = () => {
  showStats.value = !showStats.value
}

const getProgressBarColor = (percentage) => {
  if (percentage >= 90) return 'bg-red-500'
  if (percentage >= 70) return 'bg-yellow-500'
  if (percentage >= 40) return 'bg-blue-500'
  return 'bg-green-500'
}

const getPercentageColor = (percentage) => {
  if (percentage >= 90) return 'text-red-400'
  if (percentage >= 70) return 'text-yellow-400'
  if (percentage >= 40) return 'text-blue-400'
  return 'text-green-400'
}

const resetAllTrackers = () => {
  if (confirm('Are you sure you want to reset all question progress? This cannot be undone.')) {
    Object.values(props.trackers).forEach(tracker => {
      if (tracker && typeof tracker.resetTracker === 'function') {
        tracker.resetTracker()
      }
    })
    
    console.log('🔄 All question trackers have been reset')
  }
}
</script>
