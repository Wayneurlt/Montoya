<template>
  <div class="sticky-action-bar">
    <div class="sticky-action-bar-inner">
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
// Keeps a screen's primary action(s) reachable without scrolling, regardless
// of how much secondary content (player lists, game logs, settings) precedes
// it. `position: sticky` (not `fixed`) so it works inside any scroll
// container — including setup.vue's custom fixed-viewport inner scroller —
// as long as it's placed as the last element inside that scroll container.
// Button sizing/layout is left to the caller (most already use w-full).
</script>

<style scoped>
.sticky-action-bar {
  position: sticky;
  bottom: 0;
  z-index: 20;
  margin-top: 1.25rem;
  padding-top: 1.5rem;
  background: linear-gradient(to bottom, transparent, var(--color-ink) 40%);
  pointer-events: none;
}
.sticky-action-bar-inner {
  display: flex;
  gap: 0.75rem;
  padding-bottom: max(0.75rem, env(safe-area-inset-bottom, 0px));
  pointer-events: auto;
}
</style>
