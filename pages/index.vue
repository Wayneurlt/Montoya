<template>
  <div
    class="min-h-screen bg-gradient-to-br from-purple-900 to-indigo-800 text-white"
  >
    <div
      class="relative overflow-hidden h-screen flex items-center justify-center"
    >
      <div class="absolute inset-0 opacity-20">
        <div
          v-for="i in 15"
          :key="i"
          class="absolute rounded-full bg-white/10"
          :style="{
            width: `${Math.random() * 50 + 50}px`,
            height: `${Math.random() * 50 + 50}px`,
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
          }"
        />
      </div>
      <div class="container mx-auto text-center relative z-10 px-4">
        <h1 class="text-6xl md:text-8xl font-bold mb-6 animate-fade-in">
          Party Games
        </h1>
        <p
          class="text-xl md:text-2xl text-purple-200 mb-12 animate-fade-in delay-100"
        >
          Spin the wheel of chaos!
        </p>
        <button
          @click="navigateToSetup"
          class="px-8 py-4 bg-pink-600 hover:bg-pink-700 rounded-full text-white font-bold text-lg shadow-lg transition-colors"
        >
          Start Party
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
const navigateToSetup = () => {
  navigateTo("/setup");
};
</script>

<style>
/* Same animation styles as before */
</style>
