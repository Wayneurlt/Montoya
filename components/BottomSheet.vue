<template>
  <Teleport to="body">
    <Transition name="sheet-fade">
      <div v-if="modelValue" class="bottom-sheet-scrim" @click.self="handleDismiss">
        <Transition name="sheet-slide" appear>
          <div v-if="modelValue" class="bottom-sheet-panel card-poster" role="dialog" aria-modal="true">
            <div class="bottom-sheet-handle" aria-hidden="true" />
            <button
              v-if="dismissible"
              type="button"
              class="bottom-sheet-close"
              aria-label="Close"
              @click="handleDismiss"
            >
              <Icon icon="mdi:close" class="w-5 h-5" />
            </button>
            <div class="bottom-sheet-content">
              <slot />
            </div>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue'
import { Icon } from '@iconify/vue'

// Shared bottom sheet — replaces the app's 3 independently hand-rolled
// `fixed inset-0` centered dialogs (paywall, iOS-install-instructions,
// dice-of-desire rules). Bottom-anchored with top-only rounded corners on
// mobile; caps at a centered card width on larger screens. No new colors —
// reuses .card-poster's existing surface/border/shadow tokens.
const props = defineProps<{
  modelValue: boolean
  dismissible?: boolean
}>()
const emit = defineEmits<{ (e: 'update:modelValue', value: boolean): void }>()

function handleDismiss() {
  if (props.dismissible === false) return
  emit('update:modelValue', false)
}

function handleKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape') handleDismiss()
}
onMounted(() => window.addEventListener('keydown', handleKeydown))
onUnmounted(() => window.removeEventListener('keydown', handleKeydown))
</script>

<style scoped>
.bottom-sheet-scrim {
  position: fixed;
  inset: 0;
  z-index: 50;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  background: rgba(0, 0, 0, 0.7);
}
.bottom-sheet-panel {
  position: relative;
  width: 100%;
  max-width: 480px;
  max-height: 88vh;
  overflow-y: auto;
  border-bottom-left-radius: 0;
  border-bottom-right-radius: 0;
  padding: 1.5rem 1.25rem calc(1.5rem + env(safe-area-inset-bottom, 0px));
}
.bottom-sheet-handle {
  position: absolute;
  top: 0.6rem;
  left: 50%;
  transform: translateX(-50%);
  width: 36px;
  height: 4px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.25);
}
.bottom-sheet-close {
  position: absolute;
  top: 0.9rem;
  right: 0.9rem;
  color: rgba(242, 236, 226, 0.6);
}
.bottom-sheet-content {
  margin-top: 0.75rem;
}

.sheet-fade-enter-active,
.sheet-fade-leave-active {
  transition: opacity 0.2s ease;
}
.sheet-fade-enter-from,
.sheet-fade-leave-to {
  opacity: 0;
}

.sheet-slide-enter-active {
  transition: transform 0.28s cubic-bezier(0.16, 1, 0.3, 1);
}
.sheet-slide-leave-active {
  transition: transform 0.2s ease-in;
}
.sheet-slide-enter-from,
.sheet-slide-leave-to {
  transform: translateY(100%);
}
</style>
