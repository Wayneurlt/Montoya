<template>
  <ClientOnly>
    <div class="absolute inset-0 pointer-events-none overflow-hidden">
      <div
        v-for="orb in orbs"
        :key="orb.id"
        class="ambient-orb"
        :style="orb.style"
      />
    </div>
  </ClientOnly>
</template>

<script setup>
import { computed } from "vue";

// A handful of large, very low-opacity ambient glow orbs (crimson/gold)
// that drift slowly — replaces the old tiled icon wallpaper with a
// restrained, cinematic backdrop instead of clip-art.
const seededRandom = (seed) => {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
};

const orbDefs = [
  { color: "hot", top: 8, left: 10, size: 34 },
  { color: "volt", top: 65, left: 82, size: 30 },
  { color: "hot", top: 78, left: 18, size: 26 },
  { color: "volt", top: 20, left: 88, size: 22 },
];

const orbs = computed(() =>
  orbDefs.map((orb, index) => {
    const seed = index * 7919;
    const duration = 22 + seededRandom(seed) * 10;
    const delay = seededRandom(seed + 1) * -20;
    return {
      id: index,
      style: {
        top: `${orb.top}%`,
        left: `${orb.left}%`,
        width: `${orb.size}vmax`,
        height: `${orb.size}vmax`,
        background:
          orb.color === "hot"
            ? "radial-gradient(circle, rgba(200,37,63,0.28), transparent 70%)"
            : "radial-gradient(circle, rgba(212,175,106,0.2), transparent 70%)",
        animationDuration: `${duration}s`,
        animationDelay: `${delay}s`,
      },
    };
  })
);
</script>

<style scoped>
.ambient-orb {
  position: absolute;
  border-radius: 999px;
  transform: translate(-50%, -50%);
  filter: blur(2px);
  animation: orb-drift ease-in-out infinite;
  will-change: transform;
}

@keyframes orb-drift {
  0%, 100% {
    transform: translate(-50%, -50%) scale(1);
  }
  50% {
    transform: translate(calc(-50% + 4vmax), calc(-50% - 3vmax)) scale(1.08);
  }
}

@media (prefers-reduced-motion: reduce) {
  .ambient-orb {
    animation: none;
  }
}
</style>
