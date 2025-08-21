<template>
  <div
    class="min-h-screen bg-gradient-to-b from-purple-900 to-black text-white flex items-center justify-center px-4 relative overflow-hidden"
  >
    <!-- Animated background elements -->
    <ClientOnly>
      <div class="absolute inset-0 opacity-20 pointer-events-none">
        <div
          v-for="i in 30"
          :key="i"
          class="absolute rounded-full bg-pink-500 animate-float"
          :style="`left: ${Math.random() * 100}%; top: ${Math.random() * 100}%; 
                     width: ${Math.random() * 10 + 2}px; height: ${
            Math.random() * 10 + 2
          }px;
                     animation-delay: ${Math.random() * 5}s;`"
        ></div>
      </div>
    </ClientOnly>

    <div class="max-w-5xl w-full text-center relative z-10 py-10">
      <!-- Game Title -->
      <h1
        class="text-6xl md:text-8xl font-bold mb-2 text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-cyan-400 font-bungee"
      >
        MONTOYA
      </h1>

      <!-- Tagline -->
      <p class="text-lg md:text-xl mb-12 text-cyan-200 font-light">
        Where bad decisions make great stories
      </p>

      <!-- Game Options -->
      <div
        class="flex justify-center items-end flex-wrap gap-8 md:gap-12 mb-12"
      >
        <GameIcon
          :image="diceImg"
          name="Dice of Desire"
          class="hover:text-pink-400"
          @hover="showDesc('Roll for desires you never knew you had')"
        />
        <GameIcon
          :image="cardsImg"
          name="Strip Truth or Dare"
          class="hover:text-cyan-400"
          @hover="showDesc('Clothes optional, honesty mandatory')"
        />
        <GameIcon
          :image="chaosImg"
          name="Do or Drink"
          class="hover:text-purple-400"
          @hover="showDesc('No boring choices allowed')"
        />
      </div>

      <!-- Game Description -->
      <p class="text-pink-200 mb-8 text-lg min-h-8">
        {{ currentDescription || "The party game you were warned about" }}
      </p>

      <!-- CTA Button -->
      <button
        @click="navigateToSetup"
        class="bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white px-8 py-3 rounded-full text-lg font-bold shadow-lg hover:shadow-pink-500/30 transition-all duration-300 transform hover:scale-105 animate-pulse-slow"
      >
        START THE CHAOS
      </button>

      <!-- Player counter -->
      <div class="mt-12 text-sm text-gray-400">
        Over <span class="text-pink-400 font-bold">10,000</span> wild nights
        created
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { navigateTo } from "#app"; // Nuxt navigation

// Import images so they work after build
import diceImg from "@/assets/images/dice.png";
import cardsImg from "@/assets/images/cards.png";
import chaosImg from "@/assets/images/chaos.png";

const currentDescription = ref("");

const showDesc = (text) => {
  currentDescription.value = text;
};

const navigateToSetup = () => {
  navigateTo("/setup");
};
</script>

<style>
@keyframes float {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-20px);
  }
}
.animate-float {
  animation: float 6s ease-in-out infinite;
}

@keyframes pulse-slow {
  0%,
  100% {
    box-shadow: 0 0 0 0 rgba(236, 72, 153, 0.7);
  }
  50% {
    box-shadow: 0 0 0 15px rgba(236, 72, 153, 0);
  }
}
.animate-pulse-slow {
  animation: pulse-slow 2s infinite;
}

.font-bungee {
  font-family: "Bungee", cursive;
}
</style>
