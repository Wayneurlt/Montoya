<template>
  <div
    class="min-h-screen bg-nightlife text-paper flex flex-col items-center justify-start px-3 sm:px-4 relative overflow-x-hidden py-4 sm:py-6 safe-bottom"
  >
    <!-- Background Icons Pattern -->
    <BackgroundIcons />
    <div class="max-w-5xl w-full text-center relative z-10 py-4 sm:py-6 md:py-8 lg:py-10">
      <!-- Game Title, dealt out of a small fanned hand of face-down cards.
           Note: .playing-card hardcodes position:relative (its own decorations
           are absolutely positioned inside it), which ties with and beats the
           Tailwind `absolute` utility at equal specificity — position:absolute
           has to go in the inline style here so it actually wins, or these fall
           into normal block flow and stack vertically instead of fanning out. -->
      <div ref="heroRef" class="relative mb-4 sm:mb-6 md:mb-8 pt-14 sm:pt-16 md:pt-20">
        <div class="pointer-events-none absolute inset-x-0 top-0 flex justify-center">
          <div class="relative w-36 sm:w-44 md:w-56 h-16 sm:h-20 md:h-24">
            <div
              v-for="card in heroCards"
              :key="card.rotation"
              :ref="(el) => setHeroCardRef(el, card.rotation)"
              class="playing-card left-1/2 -translate-x-1/2 w-12 sm:w-14 md:w-16"
              :class="card.color"
              :style="{ marginLeft: card.offset, position: 'absolute', top: 0 }"
            >
              <div class="playing-card-pattern"></div>
              <div class="playing-card-medallion"><span><Icon :icon="card.icon" class="w-3.5 h-3.5 sm:w-4 sm:h-4" /></span></div>
            </div>
          </div>
        </div>
        <h1
          class="relative font-display text-4xl sm:text-5xl md:text-7xl lg:text-8xl xl:text-9xl font-bold uppercase mb-2 sm:mb-3 md:mb-4 text-paper tracking-tight"
        >
          Mont<span class="text-hot">o</span>ya
        </h1>
        <div class="flex justify-center gap-1.5 sm:gap-2 mb-2 sm:mb-3 md:mb-4">
          <div class="h-1.5 sm:h-2 w-14 sm:w-20 md:w-28 bg-hot rounded-full"></div>
          <div class="h-1.5 sm:h-2 w-8 sm:w-12 md:w-16 bg-volt rounded-full"></div>
        </div>
      </div>

      <!-- Tagline -->
      <p ref="taglineRef" class="text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl mb-4 sm:mb-6 md:mb-8 text-paper/70 font-bold tracking-wide px-2 flex flex-wrap items-center justify-center gap-2">
        <span>Where bad decisions make <span class="text-hot">dangerous memories</span></span>
        <Icon icon="mdi:fire" class="w-5 h-5 sm:w-6 sm:h-6 text-hot" />
      </p>

      <!-- How to play: the one decision every visitor needs to make, right up
           front — a compact tap-row per path (icon, name, one line, arrow)
           rather than a tall feature card, so both fit above the fold together
           with the hero instead of being buried below the game grid. -->
      <div ref="buttonsRef" class="flex flex-col gap-3 max-w-md mx-auto px-4 mb-6 sm:mb-8 md:mb-10 text-left">
        <NuxtLink
          to="/setup"
          @click="punchScale($event.currentTarget)"
          class="group card-poster p-3 sm:p-4 flex items-center gap-3 sm:gap-4 hover:-translate-y-0.5 transition-transform border-2 border-transparent hover:border-hot"
        >
          <Icon icon="mdi:gamepad-variant" class="w-9 h-9 sm:w-10 sm:h-10 text-hot flex-shrink-0 group-hover:scale-110 transition-transform" />
          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-2 mb-0.5 flex-wrap">
              <h2 class="font-display text-base sm:text-lg font-bold uppercase text-paper">Pass &amp; Play</h2>
              <span class="badge-stamp bg-hot text-paper text-[9px] px-2 py-0.5">1 Phone</span>
            </div>
            <p class="text-xs sm:text-sm text-paper/70">One phone, everyone takes turns.</p>
          </div>
          <Icon icon="mdi:chevron-right" class="w-6 h-6 sm:w-7 sm:h-7 text-hot flex-shrink-0 group-hover:translate-x-1 transition-transform" />
        </NuxtLink>
        <NuxtLink
          to="/lobby"
          @click="punchScale($event.currentTarget)"
          class="group card-poster-volt card-poster p-3 sm:p-4 flex items-center gap-3 sm:gap-4 hover:-translate-y-0.5 transition-transform border-2 border-transparent hover:border-volt"
        >
          <Icon icon="mdi:account-group" class="w-9 h-9 sm:w-10 sm:h-10 text-volt flex-shrink-0 group-hover:scale-110 transition-transform" />
          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-2 mb-0.5 flex-wrap">
              <h2 class="font-display text-base sm:text-lg font-bold uppercase text-paper">Multiplayer</h2>
              <span class="badge-stamp bg-volt text-ink text-[9px] px-2 py-0.5">Group</span>
            </div>
            <p class="text-xs sm:text-sm text-paper/70">Everyone joins from their own phone.</p>
          </div>
          <Icon icon="mdi:chevron-right" class="w-6 h-6 sm:w-7 sm:h-7 text-volt flex-shrink-0 group-hover:translate-x-1 transition-transform" />
        </NuxtLink>
      </div>

      <!-- Game Preview: a spread of mini cards, family games in volt, adult in hot -->
      <div ref="previewGridRef" class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5 sm:gap-3 md:gap-3 lg:gap-4 mb-4 sm:mb-6 md:mb-8 lg:mb-12 max-w-5xl mx-auto px-4">
        <div
          v-for="{ name, tag, icon, mode, code, accent } in gamePreviews"
          :key="name"
          class="card-face p-3 sm:p-3.5 md:p-4 hover:-translate-y-1 transition-transform"
          :class="{ 'is-volt': mode === 'family' }"
        >
          <div class="card-index card-index-tl" :class="accent">{{ code }}</div>
          <div class="card-index card-index-br" :class="accent">{{ code }}</div>
          <Icon :icon="icon" class="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 mb-1.5 sm:mb-2 mx-auto" :class="accent" />
          <h3 class="font-display text-xs sm:text-sm md:text-base font-bold uppercase mb-0.5 sm:mb-1 text-paper">{{ name }}</h3>
          <p class="text-[10px] sm:text-xs text-paper/60">{{ tag }}</p>
        </div>
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

        <div v-if="showInstallButton" class="flex justify-center px-4">
          <button
            type="button"
            @click="handleInstallClick"
            class="inline-flex items-center gap-1.5 sm:gap-2 bg-card border border-white/10 hover:bg-white/5 px-3 sm:px-4 py-1.5 sm:py-2 rounded-md text-[10px] sm:text-xs md:text-sm text-paper/70 hover:text-paper transition-all"
          >
            <Icon icon="mdi:cellphone-arrow-down" class="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span>Install App</span>
          </button>
        </div>
      </div>

      <!-- iOS install instructions (no programmatic install prompt exists on iOS Safari) -->
      <BottomSheet v-model="showIosInstructions">
        <div class="text-center">
          <Icon icon="mdi:cellphone-arrow-down" class="w-10 h-10 mx-auto mb-3 text-hot" />
          <h3 class="font-display text-lg font-bold uppercase mb-2 text-paper">Install Montoya</h3>
          <p class="text-sm text-paper/70">
            Tap the <Icon icon="mdi:export-variant" class="inline w-4 h-4 -mt-1" /> <strong class="text-paper">Share</strong> icon in Safari's toolbar, then choose
            <strong class="text-paper">"Add to Home Screen."</strong>
          </p>
          <button
            @click="showIosInstructions = false"
            class="mt-4 bg-hot text-paper shadow-hard-sm hover:brightness-110 px-6 py-2 rounded-md font-display font-bold uppercase tracking-wide text-sm transition-[filter]"
          >
            Got it
          </button>
        </div>
      </BottomSheet>
    </div>

  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from "vue";
import { Icon } from "@iconify/vue";
import gsap from "gsap";
import { useAnalytics } from "~/composables/useAnalytics";
import { useGameStore } from "~/stores/game";
import { staggerReveal, punchScale } from "~/composables/useGameAnimations";

const { trackPageView } = useAnalytics();
const gameStore = useGameStore();

// Entrance animation refs
const heroRef = ref(null);
const taglineRef = ref(null);
const previewGridRef = ref(null);
const buttonsRef = ref(null);
const pillsRef = ref(null);

// Small fanned "hand" of face-down cards behind the wordmark — purely decorative,
// gives the marketing page the same card-object identity as the games themselves.
const heroCards = [
  { rotation: -12, offset: '-38px', color: 'is-hot', icon: 'mdi:cards-heart' },
  { rotation: 0, offset: '-13px', color: 'is-volt', icon: 'mdi:dice-6' },
  { rotation: 12, offset: '13px', color: 'is-hot', icon: 'mdi:fire' },
];
const heroCardEls = new Map();
const setHeroCardRef = (el, key) => {
  if (el) heroCardEls.set(key, el);
  else heroCardEls.delete(key);
};

// Game preview tiles — icons match the ones used for the same games in setup.vue.
// `mode` drives the card-face color (family = volt, adult = hot), `code`
// is the two-letter corner-index mark, and `accent`
// is the matching text-color utility precomputed here rather than re-derived
// with a ternary at each of the three usage sites in the template.
const gamePreviews = [
  { name: "Truth or Dare", tag: "Reveal or risk", icon: "mdi:cards-heart", mode: "adult", code: "TD", accent: "text-hot" },
  { name: "Do or Drink", tag: "Challenge accepted", icon: "mdi:glass-cocktail", mode: "adult", code: "DD", accent: "text-hot" },
  { name: "Dice of Desire", tag: "Roll & reveal", icon: "mdi:dice-6", mode: "adult", code: "DoD", accent: "text-hot" },
  { name: "Imposter", tag: "Find the fake", icon: "mdi:account-question", mode: "family", code: "IM", accent: "text-volt" },
  { name: "Charades", tag: "Act it out", icon: "mdi:human-handsup", mode: "family", code: "CH", accent: "text-volt" },
  { name: "Most Likely To", tag: "Who fits best?", icon: "mdi:account-group-outline", mode: "adult", code: "ML", accent: "text-hot" },
  { name: "Never Have I", tag: "Confess all", icon: "mdi:hand-back-right", mode: "adult", code: "NH", accent: "text-hot" },
  { name: "Would You Rather", tag: "Choose wisely", icon: "mdi:help-circle", mode: "adult", code: "WY", accent: "text-hot" },
];

const featurePills = [
  { label: "10+ Adult Games", icon: "mdi:gamepad-variant" },
  { label: "Extreme Mode", icon: "mdi:fire" },
  { label: "Group Play", icon: "mdi:account-group" },
  { label: "Couples Mode", icon: "mdi:heart" },
];

// --- PWA install button ---
// Chromium (desktop Chrome/Edge, Android) exposes a `beforeinstallprompt` event that
// @vite-pwa/nuxt's usePWA() wraps as `showInstallPrompt` / `install()`. iOS Safari has
// no such event or API at all — the only way to install there is manually via the
// Share sheet, so we detect iOS and show instructions instead of a broken button.
const pwa = import.meta.client ? usePWA() : undefined;
const isIOS = ref(false);
const isStandalone = ref(false);
const showIosInstructions = ref(false);

onMounted(() => {
  isIOS.value = /iphone|ipad|ipod/i.test(navigator.userAgent) && !("MSStream" in window);
  isStandalone.value =
    window.matchMedia("(display-mode: standalone)").matches ||
    window.navigator.standalone === true;
});

const showInstallButton = computed(() => {
  if (isStandalone.value || pwa?.isPWAInstalled) return false;
  return Boolean(pwa?.showInstallPrompt || isIOS.value);
});

async function handleInstallClick() {
  if (pwa?.showInstallPrompt) {
    await pwa.install();
    return;
  }
  if (isIOS.value) {
    showIosInstructions.value = true;
  }
}

onMounted(() => {
  trackPageView('home');

  // Clear one-device (pass-and-play) state when returning home so next time
  // they play they get a fresh setup with no previous player names or game details
  gameStore.resetSetup();
  if (typeof window !== 'undefined') {
    localStorage.removeItem('montoya_game_state');
  }

  staggerReveal([heroRef.value, taglineRef.value, buttonsRef.value, previewGridRef.value, pillsRef.value]);
  startHeroCardFloat();
});

// Gentle, continuous idle rotation on the fanned hero cards so the page feels
// alive even before anyone touches it — skipped entirely for users who've
// asked for reduced motion.
let heroFloatTween = null;
function startHeroCardFloat() {
  if (typeof window === 'undefined') return;
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  heroCards.forEach((card) => {
    const el = heroCardEls.get(card.rotation);
    if (el) gsap.set(el, { rotation: card.rotation });
  });
  if (reduceMotion) return;
  const els = heroCards.map((c) => heroCardEls.get(c.rotation)).filter(Boolean);
  if (!els.length) return;
  heroFloatTween = gsap.to(els, {
    rotation: (i, target) => Number(gsap.getProperty(target, 'rotation')) + (i % 2 === 0 ? 4 : -4),
    y: -4,
    duration: 2.4,
    ease: 'sine.inOut',
    yoyo: true,
    repeat: -1,
    stagger: 0.15,
  });
}

onBeforeUnmount(() => {
  heroFloatTween?.kill();
});
</script>
