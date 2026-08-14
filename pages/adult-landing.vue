<template>
  <div
    class="min-h-screen bg-nightlife text-paper flex flex-col items-center justify-start px-3 sm:px-4 relative overflow-x-hidden overflow-y-auto py-4 sm:py-6 safe-bottom"
  >
    <!-- Background Icons Pattern -->
    <BackgroundIcons />

    <div class="max-w-5xl w-full text-center relative z-10 py-4 sm:py-6 md:py-8 lg:py-10">
      <!-- Game Title -->
      <div ref="heroRef" class="mb-4 sm:mb-6 md:mb-8">
        <h1
          class="font-display text-3xl sm:text-4xl md:text-6xl lg:text-8xl xl:text-9xl font-bold uppercase mb-2 sm:mb-3 md:mb-4 text-paper tracking-tight"
        >
          Mont<span class="text-hot">o</span>ya
        </h1>
        <div class="flex justify-center gap-1.5 sm:gap-2 mb-2 sm:mb-3 md:mb-4">
          <div class="h-1.5 sm:h-2 w-14 sm:w-20 md:w-28 bg-hot rounded-full"></div>
          <div class="h-1.5 sm:h-2 w-8 sm:w-12 md:w-16 bg-volt rounded-full"></div>
        </div>
      </div>

      <!-- Tagline -->
      <p ref="taglineRef" class="text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl mb-4 sm:mb-6 md:mb-8 lg:mb-12 text-paper/70 font-bold tracking-wide px-2 flex flex-wrap items-center justify-center gap-2">
        <span>Where bad decisions make <span class="text-hot">dangerous memories</span></span>
        <Icon icon="mdi:fire" class="w-5 h-5 sm:w-6 sm:h-6 text-hot" />
      </p>

      <!-- Age Warning Banner -->
      <div ref="warningRef" class="mb-4 sm:mb-6 md:mb-8 lg:mb-12 card-poster p-4 sm:p-5 md:p-6 lg:p-8 mx-auto max-w-2xl">
        <Icon icon="mdi:alert-octagon" class="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 mx-auto mb-2 sm:mb-3 md:mb-4 text-hot" />
        <h2 class="font-display text-lg sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl font-bold uppercase mb-2 sm:mb-3 md:mb-4 text-hot">
          18+ Adults Only
        </h2>
        <p class="text-xs sm:text-sm md:text-base lg:text-lg xl:text-xl text-paper/80 mb-2 sm:mb-3 md:mb-4">
          This section contains mature content including:
        </p>
        <ul class="text-xs sm:text-sm md:text-base lg:text-lg text-paper/70 space-y-1 sm:space-y-1.5 md:space-y-2 mb-3 sm:mb-4 md:mb-5 lg:mb-6 text-left max-w-md mx-auto">
          <li class="flex items-center gap-2"><Icon icon="mdi:fire" class="w-4 h-4 text-hot flex-shrink-0" /> Spicy Truth or Dare</li>
          <li class="flex items-center gap-2"><Icon icon="mdi:glass-cocktail" class="w-4 h-4 text-hot flex-shrink-0" /> Drinking Games</li>
          <li class="flex items-center gap-2"><Icon icon="mdi:cards-heart" class="w-4 h-4 text-hot flex-shrink-0" /> Adult Challenges</li>
          <li class="flex items-center gap-2"><Icon icon="mdi:chili-mild" class="w-4 h-4 text-hot flex-shrink-0" /> Explicit Content</li>
        </ul>
        <p class="text-xs sm:text-sm md:text-base text-hot font-bold uppercase tracking-wide font-display">
          By continuing, you confirm you are 18 years or older.
        </p>
      </div>

      <!-- Game Preview -->
      <div ref="previewGridRef" class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 sm:gap-2.5 md:gap-3 lg:gap-4 mb-4 sm:mb-6 md:mb-8 lg:mb-12 max-w-5xl mx-auto px-4">
        <div
          v-for="game in gamePreviews"
          :key="game.name"
          class="card-poster p-2.5 sm:p-3 md:p-4 hover:-translate-y-1 transition-transform"
        >
          <Icon :icon="game.icon" class="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 mb-1.5 sm:mb-2 text-hot mx-auto" />
          <h3 class="font-display text-xs sm:text-sm md:text-base font-bold uppercase mb-0.5 sm:mb-1 text-paper">{{ game.name }}</h3>
          <p class="text-[10px] sm:text-xs text-paper/60">{{ game.tag }}</p>
        </div>
      </div>

      <!-- Action Buttons -->
      <div ref="buttonsRef" class="flex flex-col items-center gap-2 sm:gap-3 md:gap-4 px-4 mb-3 sm:mb-4 md:mb-6">
        <NuxtLink
          to="/setup?mode=adult"
          @click="punchScale($event.currentTarget)"
          class="w-full max-w-md bg-hot text-ink shadow-hard hover:brightness-110 transition-[filter] rounded-lg px-6 sm:px-8 md:px-12 py-3 sm:py-4 md:py-5 font-display font-bold uppercase tracking-wide text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl"
        >
          Enter The Danger Zone
        </NuxtLink>

        <NuxtLink
          to="/mode-select"
          class="text-paper/60 hover:text-paper transition-colors text-sm sm:text-base flex items-center gap-2"
        >
          <Icon icon="mdi:arrow-left" class="w-5 h-5" />
          Go Back
        </NuxtLink>
      </div>

      <!-- Feature Pills -->
      <div ref="pillsRef" class="mt-4 sm:mt-6 md:mt-8 lg:mt-10 xl:mt-16 space-y-2 sm:space-y-3 md:space-y-4 lg:space-y-6 pb-2 sm:pb-3 md:pb-4">
        <div class="flex flex-wrap justify-center gap-1.5 sm:gap-2 md:gap-3 px-4">
          <span
            v-for="pill in featurePills"
            :key="pill.label"
            class="badge-stamp bg-card border border-white/10 text-paper/70 px-2.5 sm:px-3 md:px-4 py-1 sm:py-1.5 md:py-2 text-[10px] sm:text-xs md:text-sm"
          >
            <Icon :icon="pill.icon" class="w-3.5 h-3.5 sm:w-4 sm:h-4 text-hot" />
            {{ pill.label }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { Icon } from "@iconify/vue";
import { useAnalytics } from "~/composables/useAnalytics";
import { staggerReveal, punchScale } from "~/composables/useGameAnimations";

const { trackPageView } = useAnalytics();

// Entrance animation refs
const heroRef = ref(null);
const taglineRef = ref(null);
const warningRef = ref(null);
const previewGridRef = ref(null);
const buttonsRef = ref(null);
const pillsRef = ref(null);

const gamePreviews = [
  { name: "Truth or Dare", tag: "Reveal or risk", icon: "mdi:cards-heart" },
  { name: "Do or Drink", tag: "Challenge accepted", icon: "mdi:glass-cocktail" },
  { name: "Dice of Desire", tag: "Roll & reveal", icon: "mdi:dice-6" },
  { name: "Imposter", tag: "Find the fake", icon: "mdi:account-question" },
  { name: "Charades", tag: "Act it out", icon: "mdi:human-handsup" },
  { name: "Most Likely To", tag: "Who fits best?", icon: "mdi:account-group-outline" },
  { name: "Never Have I", tag: "Confess all", icon: "mdi:hand-back-right" },
  { name: "Would You Rather", tag: "Choose wisely", icon: "mdi:help-circle" },
];

const featurePills = [
  { label: "10+ Adult Games", icon: "mdi:gamepad-variant" },
  { label: "Extreme Mode", icon: "mdi:fire" },
  { label: "Group Play", icon: "mdi:account-group" },
  { label: "Couples Mode", icon: "mdi:heart" },
];

onMounted(() => {
  trackPageView('adult-landing');
  staggerReveal([heroRef.value, taglineRef.value, warningRef.value, previewGridRef.value, buttonsRef.value, pillsRef.value]);
});
</script>
