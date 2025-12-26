<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 text-white p-3 sm:p-4 relative overflow-hidden flex items-center justify-center">
    <BackgroundIcons />
    <div class="max-w-2xl mx-auto text-center relative z-10 p-6 bg-white/10 backdrop-blur-md rounded-2xl">
      <h1 class="text-4xl sm:text-5xl md:text-6xl font-black mb-4 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-pink-500 to-cyan-400">
        🧠 Trivia Time
      </h1>
      <p class="text-lg sm:text-xl mb-6 text-purple-200">
        Coming Soon!
      </p>
      <p class="text-base text-white/80 mb-8">
        Test your knowledge with fun trivia questions for the whole family.
      </p>
      <NuxtLink to="/setup" class="inline-block bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 px-8 py-4 rounded-xl font-bold transition-all">
        Back to Setup
      </NuxtLink>
    </div>
  </div>
</template>

<script setup>
import { useAnalytics } from "~/composables/useAnalytics";
const { trackPageView } = useAnalytics();
onMounted(() => trackPageView('trivia'));
</script>

