<template>
  <div
    class="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 text-white flex items-center justify-center px-3 sm:px-4 relative overflow-hidden"
  >
    <!-- Background Icons Pattern -->
    <BackgroundIcons />

    <div class="max-w-5xl w-full text-center relative z-10 py-10">
      <!-- Title -->
      <div class="mb-8 sm:mb-12 md:mb-16">
        <h1
          class="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black mb-4 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-500 to-cyan-400 font-bungee drop-shadow-2xl"
        >
          Choose Your Mode
        </h1>
        <p class="text-lg sm:text-xl md:text-2xl text-purple-200 font-bold tracking-wide px-2">
          What type of games are you playing today?
        </p>
      </div>

      <!-- Mode Selection Cards -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 lg:gap-12 max-w-4xl mx-auto px-4 mb-8">
        <!-- Family Mode -->
        <NuxtLink
          to="/setup?mode=family"
          class="group bg-gradient-to-br from-green-500/20 to-emerald-500/20 border-4 border-green-400/50 hover:border-green-400 rounded-2xl sm:rounded-3xl p-8 sm:p-10 md:p-12 hover:scale-105 transition-all duration-300 shadow-2xl hover:shadow-green-500/50"
        >
          <div class="text-center">
            <div class="text-7xl sm:text-8xl md:text-9xl mb-6 group-hover:scale-110 transition-transform">
              👨‍👩‍👧‍👦
            </div>
            <h2 class="text-3xl sm:text-4xl md:text-5xl font-black mb-4 text-green-300">
              Family Mode
            </h2>
            <p class="text-base sm:text-lg md:text-xl text-white/90 mb-6">
              Kid-friendly games for all ages
            </p>
            <ul class="text-left space-y-3 text-sm sm:text-base md:text-lg text-white/80">
              <li class="flex items-center gap-2">
                <Icon icon="mdi:check-circle" class="w-5 h-5 text-green-400 flex-shrink-0" />
                <span>Charades</span>
              </li>
              <li class="flex items-center gap-2">
                <Icon icon="mdi:check-circle" class="w-5 h-5 text-green-400 flex-shrink-0" />
                <span>Imposter</span>
              </li>
              <li class="flex items-center gap-2">
                <Icon icon="mdi:check-circle" class="w-5 h-5 text-green-400 flex-shrink-0" />
                <span>Mr. White</span>
              </li>
            </ul>
            <div class="mt-8 bg-green-500/30 backdrop-blur-sm px-4 py-3 rounded-xl border-2 border-green-400/40">
              <p class="text-sm sm:text-base font-bold text-green-200">
                ✨ Safe for everyone!
              </p>
            </div>
          </div>
        </NuxtLink>

        <!-- Adult Mode -->
        <NuxtLink
          to="/adult-landing"
          class="group bg-gradient-to-br from-pink-500/20 to-purple-500/20 border-4 border-pink-400/50 hover:border-pink-400 rounded-2xl sm:rounded-3xl p-8 sm:p-10 md:p-12 hover:scale-105 transition-all duration-300 shadow-2xl hover:shadow-pink-500/50"
        >
          <div class="text-center">
            <div class="text-7xl sm:text-8xl md:text-9xl mb-6 group-hover:scale-110 transition-transform">
              🔥
            </div>
            <h2 class="text-3xl sm:text-4xl md:text-5xl font-black mb-4 text-pink-300">
              Adult Mode
            </h2>
            <p class="text-base sm:text-lg md:text-xl text-white/90 mb-6">
              Bold & daring games for 18+
            </p>
            <ul class="text-left space-y-3 text-sm sm:text-base md:text-lg text-white/80">
              <li class="flex items-center gap-2">
                <Icon icon="mdi:check-circle" class="w-5 h-5 text-pink-400 flex-shrink-0" />
                <span>Truth or Dare</span>
              </li>
              <li class="flex items-center gap-2">
                <Icon icon="mdi:check-circle" class="w-5 h-5 text-pink-400 flex-shrink-0" />
                <span>Never Have I Ever</span>
              </li>
              <li class="flex items-center gap-2">
                <Icon icon="mdi:check-circle" class="w-5 h-5 text-pink-400 flex-shrink-0" />
                <span>Spicy Challenges</span>
              </li>
            </ul>
            <div class="mt-8 bg-red-500/30 backdrop-blur-sm px-4 py-3 rounded-xl border-2 border-red-400/40">
              <p class="text-sm sm:text-base font-bold text-red-200 flex items-center justify-center gap-2">
                <span class="text-xl">🔞</span>
                <span>18+ Only</span>
                <span class="text-xl">🔞</span>
              </p>
            </div>
          </div>
        </NuxtLink>
      </div>

      <!-- Back Button -->
      <NuxtLink
        to="/"
        class="inline-flex items-center gap-2 text-purple-300 hover:text-purple-200 transition-colors text-sm sm:text-base"
      >
        <Icon icon="mdi:arrow-left" class="w-5 h-5" />
        Back to Home
      </NuxtLink>
    </div>
  </div>
</template>

<script setup>
import { Icon } from "@iconify/vue";
import { useAnalytics } from "~/composables/useAnalytics";

const { trackPageView } = useAnalytics();

onMounted(() => {
  trackPageView('mode-select');
});
</script>

<style scoped>
.font-bungee {
  font-family: "Bungee", cursive;
}
</style>

