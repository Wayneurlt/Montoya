<template>
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
            class="w-8 h-8 md:w-12 md:h-12"
          />
        </div>
      </div>
    </div>
  </ClientOnly>
</template>

<script setup>
import { computed } from "vue";
import { Icon } from "@iconify/vue";

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
</script>

<style scoped>
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

