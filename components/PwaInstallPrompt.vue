<template>
  <Transition name="fade-slide">
    <div
      v-if="pwa?.showInstallPrompt"
      class="fixed bottom-4 inset-x-4 sm:inset-x-auto sm:right-4 sm:w-80 z-50 card-poster p-4 flex items-center gap-3"
      role="dialog"
      aria-label="Install Montoya app"
    >
      <img src="/pwa-64x64.png" alt="" class="w-10 h-10 rounded-lg flex-shrink-0" />
      <div class="flex-1 min-w-0">
        <p class="text-sm font-bold font-display uppercase tracking-wide text-paper">Install Montoya</p>
        <p class="text-xs text-paper/70">Add it to your home screen for quick access.</p>
      </div>
      <div class="flex flex-col gap-1.5 flex-shrink-0">
        <button
          type="button"
          class="text-xs font-bold font-display uppercase tracking-wide px-3 py-1.5 rounded-md bg-volt text-ink hover:brightness-110 transition"
          @click="handleInstall"
        >
          Install
        </button>
        <button
          type="button"
          class="text-xs text-paper/60 hover:text-paper/90 transition"
          @click="pwa?.cancelInstall()"
        >
          Not now
        </button>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
const pwa = import.meta.client ? usePWA() : undefined

async function handleInstall() {
  await pwa?.install()
}
</script>

<style scoped>
.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}
.fade-slide-enter-from,
.fade-slide-leave-to {
  opacity: 0;
  transform: translateY(0.5rem);
}
</style>
