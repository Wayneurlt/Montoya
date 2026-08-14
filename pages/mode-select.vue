<template>
  <div
    class="min-h-screen bg-nightlife text-paper flex flex-col items-center justify-start px-3 sm:px-4 relative overflow-x-hidden overflow-y-auto py-4 sm:py-6 safe-bottom"
  >
    <!-- Background Icons Pattern -->
    <BackgroundIcons />

    <div class="max-w-5xl w-full text-center relative z-10 py-4 sm:py-6 md:py-8 lg:py-10">
      <!-- Title -->
      <div ref="headerRef" class="mb-4 sm:mb-6 md:mb-8 lg:mb-12">
        <h1
          class="font-display text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold uppercase mb-2 sm:mb-3 md:mb-4 text-paper"
        >
          Choose Your <span class="text-hot">Mode</span>
        </h1>
        <p class="text-sm sm:text-base md:text-lg lg:text-xl text-paper/70 font-bold tracking-wide px-2">
          What type of games are you playing today?
        </p>
      </div>

      <!-- Mode Selection Cards -->
      <div ref="cardsRef" class="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5 md:gap-6 lg:gap-8 max-w-4xl mx-auto px-4 mb-6 sm:mb-8">
        <!-- Family Mode -->
        <NuxtLink
          to="/setup?mode=family"
          @click="punchScale($event.currentTarget)"
          class="group card-poster-volt card-poster p-4 sm:p-5 md:p-6 lg:p-8 text-left flex flex-col hover:-translate-y-1 transition-transform border-2 border-transparent hover:border-volt"
        >
          <div class="flex items-center justify-between mb-3 sm:mb-4 md:mb-5">
            <Icon icon="mdi:human-male-female-child" class="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 text-volt group-hover:scale-110 transition-transform" />
            <span class="badge-stamp bg-volt text-ink text-[10px] sm:text-xs px-2.5 sm:px-3 py-1">All Ages</span>
          </div>
          <h2 class="font-display text-xl sm:text-2xl md:text-3xl font-bold uppercase mb-1.5 sm:mb-2 text-paper">
            Family Mode
          </h2>
          <p class="text-sm sm:text-base md:text-lg text-paper/70 mb-3 sm:mb-4 md:mb-5">
            Kid-friendly games for all ages
          </p>
          <ul class="text-left space-y-2 sm:space-y-2.5 md:space-y-3 text-xs sm:text-sm md:text-base text-paper/70">
            <li class="flex items-center gap-1.5 sm:gap-2">
              <Icon icon="mdi:check-circle" class="w-4 h-4 sm:w-5 sm:h-5 text-volt flex-shrink-0" />
              <span>Charades</span>
            </li>
            <li class="flex items-center gap-1.5 sm:gap-2">
              <Icon icon="mdi:check-circle" class="w-4 h-4 sm:w-5 sm:h-5 text-volt flex-shrink-0" />
              <span>Imposter</span>
            </li>
            <li class="flex items-center gap-1.5 sm:gap-2">
              <Icon icon="mdi:check-circle" class="w-4 h-4 sm:w-5 sm:h-5 text-volt flex-shrink-0" />
              <span>Mr. White</span>
            </li>
          </ul>
          <div class="mt-auto pt-3 sm:pt-4 md:pt-5 lg:pt-6">
            <div class="flex items-center justify-center gap-2 bg-white/5 border border-white/10 px-3 sm:px-4 py-2 sm:py-2.5 md:py-3 rounded-md">
              <Icon icon="mdi:shield-check" class="w-4 h-4 sm:w-5 sm:h-5 text-volt flex-shrink-0" />
              <p class="text-xs sm:text-sm md:text-base font-bold font-display uppercase tracking-wide text-volt">
                Safe for everyone!
              </p>
            </div>
          </div>
        </NuxtLink>

        <!-- Adult Mode -->
        <NuxtLink
          to="/adult-landing"
          @click="punchScale($event.currentTarget)"
          class="group card-poster p-4 sm:p-5 md:p-6 lg:p-8 text-left flex flex-col hover:-translate-y-1 transition-transform border-2 border-transparent hover:border-hot"
        >
          <div class="flex items-center justify-between mb-3 sm:mb-4 md:mb-5">
            <Icon icon="mdi:fire" class="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 text-hot group-hover:scale-110 transition-transform" />
            <span class="badge-stamp bg-hot text-ink text-[10px] sm:text-xs px-2.5 sm:px-3 py-1">18+</span>
          </div>
          <h2 class="font-display text-xl sm:text-2xl md:text-3xl font-bold uppercase mb-1.5 sm:mb-2 text-paper">
            Adult Mode
          </h2>
          <p class="text-sm sm:text-base md:text-lg text-paper/70 mb-3 sm:mb-4 md:mb-5">
            Bold &amp; daring games for 18+
          </p>
          <ul class="text-left space-y-2 sm:space-y-2.5 md:space-y-3 text-xs sm:text-sm md:text-base text-paper/70">
            <li class="flex items-center gap-1.5 sm:gap-2">
              <Icon icon="mdi:check-circle" class="w-4 h-4 sm:w-5 sm:h-5 text-hot flex-shrink-0" />
              <span>Truth or Dare</span>
            </li>
            <li class="flex items-center gap-1.5 sm:gap-2">
              <Icon icon="mdi:check-circle" class="w-4 h-4 sm:w-5 sm:h-5 text-hot flex-shrink-0" />
              <span>Never Have I Ever</span>
            </li>
            <li class="flex items-center gap-1.5 sm:gap-2">
              <Icon icon="mdi:check-circle" class="w-4 h-4 sm:w-5 sm:h-5 text-hot flex-shrink-0" />
              <span>Spicy Challenges</span>
            </li>
          </ul>
          <div class="mt-auto pt-3 sm:pt-4 md:pt-5 lg:pt-6">
            <div class="flex items-center justify-center gap-2 bg-white/5 border border-white/10 px-3 sm:px-4 py-2 sm:py-2.5 md:py-3 rounded-md">
              <Icon icon="mdi:alert-octagon" class="w-4 h-4 sm:w-5 sm:h-5 text-hot flex-shrink-0" />
              <p class="text-xs sm:text-sm md:text-base font-bold font-display uppercase tracking-wide text-hot">
                18+ Only
              </p>
            </div>
          </div>
        </NuxtLink>
      </div>

      <!-- Back Button -->
      <NuxtLink
        to="/"
        class="inline-flex items-center gap-2 text-paper/60 hover:text-paper transition-colors text-sm sm:text-base"
      >
        <Icon icon="mdi:arrow-left" class="w-5 h-5" />
        Back to Home
      </NuxtLink>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { Icon } from "@iconify/vue";
import { useAnalytics } from "~/composables/useAnalytics";
import { staggerReveal, punchScale } from "~/composables/useGameAnimations";

const { trackPageView } = useAnalytics();

const headerRef = ref(null);
const cardsRef = ref(null);

onMounted(() => {
  trackPageView('mode-select');
  staggerReveal([headerRef.value, cardsRef.value]);
});
</script>
