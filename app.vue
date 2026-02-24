<template>
  <UApp>
    <NuxtRouteAnnouncer />
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
    <Notivue v-slot="item">
      <Notification :item="item" />
    </Notivue>
  </UApp>
</template>

<script setup lang="ts">
import { useAnalytics } from '~/composables/useAnalytics'
const { trackPageView } = useAnalytics()

function shouldBlurActiveInput(target: EventTarget | null): boolean {
  if (typeof document === 'undefined' || !target || !(target instanceof Node)) return false
  const active = document.activeElement
  if (!active) return false
  const isInputLike =
    active.tagName === 'INPUT' ||
    active.tagName === 'TEXTAREA' ||
    active.getAttribute('contenteditable') === 'true'
  if (!isInputLike) return false
  // Blur when tap/click is outside the active input
  return !active.contains(target)
}

function handleDismissKeyboard(e: Event) {
  if (shouldBlurActiveInput(e.target as Node)) {
    ;(document.activeElement as HTMLElement)?.blur()
  }
}

onMounted(() => {
  console.log(window.innerHeight, window.innerWidth)
  trackPageView('app')

  // Dismiss mobile keyboard when tapping outside an input
  document.addEventListener('touchend', handleDismissKeyboard, { passive: true })
  document.addEventListener('click', handleDismissKeyboard)
})

onUnmounted(() => {
  document.removeEventListener('touchend', handleDismissKeyboard)
  document.removeEventListener('click', handleDismissKeyboard)
})
</script>
