<template>
  <div
    class="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 text-white flex items-center justify-center px-3 sm:px-4 relative overflow-hidden"
  >
    <!-- WhatsApp-style Game Icons Background Pattern -->
    <ClientOnly>
      <div class="absolute inset-0 pointer-events-none overflow-hidden">
        <div class="absolute inset-0 game-icons-pattern">
          <div
            v-for="(icon, index) in backgroundIcons"
            :key="`icon-${index}`"
            class="absolute game-icon"
            :style="getIconStyle(index)"
          >
            <Icon
              :icon="icon.icon"
              :class="icon.color"
              class="w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 lg:w-12 lg:h-12"
            />
          </div>
        </div>
      </div>
    </ClientOnly>

    <div class="max-w-5xl w-full text-center relative z-10 py-3 sm:py-4 md:py-6 lg:py-10">
      <!-- Game Title -->
      <div class="mb-3 sm:mb-4 md:mb-6 lg:mb-8 transform hover:scale-105 transition-transform duration-300">
        <h1
          class="text-3xl sm:text-4xl md:text-6xl lg:text-8xl xl:text-9xl font-black mb-2 sm:mb-3 md:mb-4 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-500 to-cyan-400 font-bungee drop-shadow-2xl"
        >
          MONTOYA
        </h1>
        <div class="flex justify-center gap-1 sm:gap-1.5 md:gap-2 mb-2 sm:mb-3 md:mb-4">
          <div class="h-1 sm:h-1.5 md:h-2 w-12 sm:w-16 md:w-24 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"></div>
          <div class="h-1 sm:h-1.5 md:h-2 w-8 sm:w-12 md:w-16 bg-gradient-to-r from-pink-500 to-cyan-400 rounded-full"></div>
          <div class="h-1 sm:h-1.5 md:h-2 w-12 sm:w-16 md:w-24 bg-gradient-to-r from-cyan-400 to-purple-500 rounded-full"></div>
        </div>
      </div>

      <!-- Tagline -->
      <p class="text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl mb-4 sm:mb-6 md:mb-8 lg:mb-12 xl:mb-16 text-purple-200 font-bold tracking-wide px-2">
        The ultimate party game collection for <span class="text-pink-400">every occasion</span> 🎉
      </p>

      <!-- Game Modes -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 md:gap-6 lg:gap-8 mb-4 sm:mb-6 md:mb-8 lg:mb-12 max-w-4xl mx-auto px-4">
        <!-- Family Mode -->
        <div class="bg-gradient-to-br from-green-500/20 to-emerald-500/20 border-2 border-green-400/50 rounded-xl sm:rounded-2xl p-3 sm:p-4 md:p-6 lg:p-8 hover:scale-105 transition-all duration-300">
          <div class="text-center">
            <div class="text-3xl sm:text-4xl md:text-5xl lg:text-6xl mb-2 sm:mb-3 md:mb-4">👨‍👩‍👧‍👦</div>
            <h3 class="text-lg sm:text-xl md:text-2xl lg:text-3xl font-black mb-2 sm:mb-3 text-green-300">Family Mode</h3>
            <p class="text-xs sm:text-sm md:text-base lg:text-lg text-white/80 mb-2 sm:mb-3 md:mb-4">
              Kid-friendly games for all ages
            </p>
            <ul class="text-xs sm:text-sm md:text-base text-left space-y-1 sm:space-y-2 text-white/70">
              <li>✓ Charades</li>
              <li>✓ Mr. White</li>
              <li>✓ Trivia & More</li>
            </ul>
          </div>
        </div>

        <!-- Adult Mode -->
        <div class="bg-gradient-to-br from-pink-500/20 to-purple-500/20 border-2 border-pink-400/50 rounded-xl sm:rounded-2xl p-3 sm:p-4 md:p-6 lg:p-8 hover:scale-105 transition-all duration-300">
          <div class="text-center">
            <div class="text-3xl sm:text-4xl md:text-5xl lg:text-6xl mb-2 sm:mb-3 md:mb-4">🔥</div>
            <h3 class="text-lg sm:text-xl md:text-2xl lg:text-3xl font-black mb-2 sm:mb-3 text-pink-300">Adult Mode</h3>
            <p class="text-xs sm:text-sm md:text-base lg:text-lg text-white/80 mb-2 sm:mb-3 md:mb-4">
              Bold & daring games for 18+
            </p>
            <ul class="text-xs sm:text-sm md:text-base text-left space-y-1 sm:space-y-2 text-white/70">
              <li>✓ Truth or Dare</li>
              <li>✓ Never Have I Ever</li>
              <li>✓ Spicy Challenges</li>
            </ul>
          </div>
        </div>
      </div>

      <!-- CTA Button -->
      <div class="flex flex-col items-center gap-2 sm:gap-3 md:gap-4 px-4 mb-3 sm:mb-4 md:mb-6">
        <NuxtLink to="/mode-select" 
          class="group relative bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 hover:from-purple-500 hover:via-pink-500 hover:to-purple-500 text-white px-6 sm:px-8 md:px-12 py-3 sm:py-4 md:py-5 rounded-full text-base sm:text-lg md:text-xl lg:text-2xl font-black shadow-2xl hover:shadow-pink-600/50 transition-all duration-300 transform hover:scale-110 animate-pulse-slow border-2 sm:border-3 md:border-4 border-pink-500/50 w-full max-w-md"
        >
          <span class="relative z-10">START PLAYING</span>
          <div class="absolute inset-0 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full blur-xl opacity-50 group-hover:opacity-75 transition-opacity"></div>
        </NuxtLink>
      </div>

      <!-- Player counter & Features -->
      <div class="mt-4 sm:mt-6 md:mt-8 lg:mt-10 xl:mt-16 space-y-2 sm:space-y-3 md:space-y-4 lg:space-y-6 pb-2 sm:pb-3 md:pb-4">
        <div class="text-xs sm:text-sm md:text-base text-purple-300 px-4">
          Over <span class="text-pink-500 font-black text-sm sm:text-base md:text-lg lg:text-xl">10,000+</span> game sessions created 🎉
        </div>
        
        <!-- Feature Pills -->
        <div class="flex flex-wrap justify-center gap-1.5 sm:gap-2 md:gap-3 px-4">
          <span class="bg-purple-950/40 backdrop-blur-md px-2 sm:px-3 md:px-4 py-1 sm:py-1.5 md:py-2 rounded-full text-[10px] sm:text-xs md:text-sm border border-purple-700/30 text-purple-200">
            ✨ No Account Needed
          </span>
          <span class="bg-purple-950/40 backdrop-blur-md px-2 sm:px-3 md:px-4 py-1 sm:py-1.5 md:py-2 rounded-full text-[10px] sm:text-xs md:text-sm border border-purple-700/30 text-purple-200">
            👨‍👩‍👧‍👦 Family Friendly
          </span>
          <span class="bg-purple-950/40 backdrop-blur-md px-2 sm:px-3 md:px-4 py-1 sm:py-1.5 md:py-2 rounded-full text-[10px] sm:text-xs md:text-sm border border-purple-700/30 text-purple-200">
            🔥 Adult Games
          </span>
          <span class="bg-purple-950/40 backdrop-blur-md px-2 sm:px-3 md:px-4 py-1 sm:py-1.5 md:py-2 rounded-full text-[10px] sm:text-xs md:text-sm border border-purple-700/30 text-purple-200">
            👥 Multiplayer
          </span>
          <span class="bg-purple-950/40 backdrop-blur-md px-2 sm:px-3 md:px-4 py-1 sm:py-1.5 md:py-2 rounded-full text-[10px] sm:text-xs md:text-sm border border-purple-700/30 text-purple-200">
            📱 Mobile Ready
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import { navigateTo } from "#app"; // Nuxt navigation
import { Icon } from "@iconify/vue";

// Import images so they work after build
import diceImg from "@/assets/images/dice.png";
import cardsImg from "@/assets/images/cards.png";
import chaosImg from "@/assets/images/chaos.png";

const currentDescription = ref("");

const showDesc = (text) => {
  currentDescription.value = text;
};

// All available games with their icons
const gameIcons = [
  { icon: "mdi:cards-heart", color: "text-pink-400" },
  { icon: "mdi:dice-6", color: "text-purple-400" },
  { icon: "mdi:glass-cocktail", color: "text-cyan-400" },
  { icon: "mdi:hand-back-right", color: "text-orange-400" },
  { icon: "mdi:account-group-outline", color: "text-pink-300" },
  { icon: "mdi:help-circle", color: "text-purple-300" },
];

// Seeded random function for consistent patterns
const seededRandom = (seed) => {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
};

// Generate background icons pattern (WhatsApp style)
const backgroundIcons = computed(() => {
  const icons = [];
  // Create a grid pattern with ~100-120 icons for good coverage
  const iconCount = 120;
  for (let i = 0; i < iconCount; i++) {
    icons.push(gameIcons[i % gameIcons.length]);
  }
  return icons;
});

// Generate deterministic but varied positions for icons
const getIconStyle = (index) => {
  // Create a tiled pattern similar to WhatsApp
  const cols = 10; // 10 columns for better coverage
  const rows = Math.ceil(backgroundIcons.value.length / cols);
  const col = index % cols;
  const row = Math.floor(index / cols);
  
  // Use seeded random for consistent but varied positions
  const seed = index * 7919; // Prime number for better distribution
  const randomX = seededRandom(seed);
  const randomY = seededRandom(seed + 1);
  const randomRot = seededRandom(seed + 2);
  const randomSize = seededRandom(seed + 3);
  const randomDelay = seededRandom(seed + 4);
  
  // Add some randomness to break the grid but keep it organized
  const baseX = (col * (100 / cols)) + (randomX * 8 - 4);
  const baseY = (row * (100 / rows)) + (randomY * 8 - 4);
  
  // Random rotation for variety (0-360 degrees)
  const rotation = randomRot * 360;
  
  // Random size variation (0.7x to 1.1x)
  const sizeVariation = 0.7 + randomSize * 0.4;
  
  return {
    left: `${Math.max(0, Math.min(100, baseX))}%`,
    top: `${Math.max(0, Math.min(100, baseY))}%`,
    '--rotation': `${rotation}deg`,
    '--scale': sizeVariation,
    animationDelay: `${randomDelay * 20}s`,
  };
};

// Track page view on mount
import { useAnalytics } from '~/composables/useAnalytics';
const { trackPageView } = useAnalytics();

onMounted(() => {
  trackPageView('home');
});

const navigateToSetup = () => {
  navigateTo("/setup");
};
</script>

<style>
@keyframes float {
  0%,
  100% {
    transform: translateY(0) rotate(0deg);
  }
  50% {
    transform: translateY(-10px) rotate(5deg);
  }
}
.animate-float {
  animation: float 6s ease-in-out infinite;
}

@keyframes pulse-slow {
  0%,
  100% {
    box-shadow: 0 0 0 0 rgba(168, 85, 247, 0.7);
  }
  50% {
    box-shadow: 0 0 0 15px rgba(168, 85, 247, 0);
  }
}
.animate-pulse-slow {
  animation: pulse-slow 2s infinite;
}

.font-bungee {
  font-family: "Bungee", cursive;
}

/* WhatsApp-style background pattern */
.game-icons-pattern {
  width: 100%;
  height: 100%;
  position: relative;
}

.game-icon {
  animation: icon-float 20s ease-in-out infinite;
  will-change: transform;
  transform-origin: center center;
  transform: rotate(var(--rotation, 0deg)) scale(var(--scale, 1));
  opacity: 0.08;
}

/* Subtle animation for icons - only animates translateY to preserve inline transform */
@keyframes icon-float {
  0%, 100% {
    transform: translateY(0) rotate(var(--rotation, 0deg)) scale(var(--scale, 1));
  }
  50% {
    transform: translateY(-15px) rotate(var(--rotation, 0deg)) scale(var(--scale, 1));
  }
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .game-icon {
    opacity: 0.08;
  }
}

/* Ensure icons don't interfere with content */
.game-icons-pattern {
  z-index: 0;
}
</style>
