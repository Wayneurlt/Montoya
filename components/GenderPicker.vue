<template>
  <div class="gender-picker" role="radiogroup" :aria-label="ariaLabel">
    <button
      v-for="opt in options"
      :key="opt.value"
      type="button"
      role="radio"
      :aria-checked="modelValue === opt.value"
      class="gender-picker-btn"
      :class="{ [`is-${opt.value}`]: modelValue === opt.value }"
      @click="$emit('update:modelValue', opt.value)"
    >
      <Icon :icon="opt.icon" class="w-4 h-4 sm:w-5 sm:h-5" />
      <span>{{ opt.label }}</span>
    </button>
  </div>
</template>

<script setup lang="ts">
import { Icon } from '@iconify/vue'

// Shared 3-way gender toggle — was previously hand-duplicated in setup.vue
// and lobby.vue with icon-only ~32-40px tap targets. Same color semantics as
// before (male=hot, female=volt, other=paper), just consistently sized
// (48px+ tall) and labeled so it reads without guessing at the icon.
defineProps<{
  modelValue: string
  ariaLabel?: string
}>()
defineEmits<{ (e: 'update:modelValue', value: string): void }>()

const options = [
  { value: 'male', label: 'Male', icon: 'mdi:gender-male' },
  { value: 'female', label: 'Female', icon: 'mdi:gender-female' },
  { value: 'other', label: 'Other', icon: 'mdi:gender-non-binary' },
]
</script>

<style scoped>
.gender-picker {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.5rem;
}
.gender-picker-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.25rem;
  min-height: 48px;
  padding: 0.4rem 0.25rem;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: rgba(242, 236, 226, 0.6);
  font-size: 0.7rem;
  font-weight: 600;
  transition: background-color 0.15s ease, border-color 0.15s ease, color 0.15s ease;
}
.gender-picker-btn:hover {
  background: rgba(255, 255, 255, 0.1);
}
.gender-picker-btn.is-male {
  background: var(--color-hot);
  border-color: var(--color-hot);
  color: var(--color-paper);
}
.gender-picker-btn.is-female {
  background: var(--color-volt);
  border-color: var(--color-volt);
  color: var(--color-ink);
}
.gender-picker-btn.is-other {
  background: var(--color-paper);
  border-color: var(--color-paper);
  color: var(--color-ink);
}
</style>
