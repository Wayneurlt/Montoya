<template>
  <div
    class="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 text-white flex items-center justify-center px-3 sm:px-4 relative overflow-hidden"
  >
    <!-- Background Icons Pattern -->
    <BackgroundIcons />

    <div class="max-w-5xl w-full text-center relative z-10 py-4 sm:py-6 md:py-8 lg:py-10">
      <!-- Game Title -->
      <div class="mb-4 sm:mb-6 md:mb-8 transform hover:scale-105 transition-transform duration-300">
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
      <p class="text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl mb-4 sm:mb-6 md:mb-8 lg:mb-12 text-purple-200 font-bold tracking-wide px-2">
        Where bad decisions make <span class="text-pink-400">dangerous memories</span> 🔥
      </p>

      <!-- Game Preview -->
      <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 sm:gap-2.5 md:gap-3 lg:gap-4 mb-4 sm:mb-6 md:mb-8 lg:mb-12 max-w-5xl mx-auto px-4">
        <div class="bg-white/10 backdrop-blur-md rounded-lg sm:rounded-xl p-2 sm:p-2.5 md:p-3 lg:p-4 border border-white/20 hover:scale-105 transition-all">
          <div class="text-2xl sm:text-2.5xl md:text-3xl lg:text-4xl mb-1 sm:mb-1.5 md:mb-2">🎭</div>
          <h3 class="text-xs sm:text-sm md:text-base font-bold mb-0.5 sm:mb-1">Truth or Dare</h3>
          <p class="text-[10px] sm:text-xs text-white/70">Reveal or risk</p>
        </div>
        <div class="bg-white/10 backdrop-blur-md rounded-lg sm:rounded-xl p-2 sm:p-2.5 md:p-3 lg:p-4 border border-white/20 hover:scale-105 transition-all">
          <div class="text-2xl sm:text-2.5xl md:text-3xl lg:text-4xl mb-1 sm:mb-1.5 md:mb-2">🍺</div>
          <h3 class="text-xs sm:text-sm md:text-base font-bold mb-0.5 sm:mb-1">Do or Drink</h3>
          <p class="text-[10px] sm:text-xs text-white/70">Challenge accepted</p>
        </div>
        <div class="bg-white/10 backdrop-blur-md rounded-lg sm:rounded-xl p-2 sm:p-2.5 md:p-3 lg:p-4 border border-white/20 hover:scale-105 transition-all">
          <div class="text-2xl sm:text-2.5xl md:text-3xl lg:text-4xl mb-1 sm:mb-1.5 md:mb-2">🎲</div>
          <h3 class="text-xs sm:text-sm md:text-base font-bold mb-0.5 sm:mb-1">Dice of Desire</h3>
          <p class="text-[10px] sm:text-xs text-white/70">Roll & reveal</p>
        </div>
        <div class="bg-white/10 backdrop-blur-md rounded-lg sm:rounded-xl p-2 sm:p-2.5 md:p-3 lg:p-4 border border-white/20 hover:scale-105 transition-all">
          <div class="text-2xl sm:text-2.5xl md:text-3xl lg:text-4xl mb-1 sm:mb-1.5 md:mb-2">🕵️</div>
          <h3 class="text-xs sm:text-sm md:text-base font-bold mb-0.5 sm:mb-1">Imposter</h3>
          <p class="text-[10px] sm:text-xs text-white/70">Find the fake</p>
        </div>
        <div class="bg-white/10 backdrop-blur-md rounded-lg sm:rounded-xl p-2 sm:p-2.5 md:p-3 lg:p-4 border border-white/20 hover:scale-105 transition-all">
          <div class="text-2xl sm:text-2.5xl md:text-3xl lg:text-4xl mb-1 sm:mb-1.5 md:mb-2">🎬</div>
          <h3 class="text-xs sm:text-sm md:text-base font-bold mb-0.5 sm:mb-1">Charades</h3>
          <p class="text-[10px] sm:text-xs text-white/70">Act it out</p>
        </div>
        <div class="bg-white/10 backdrop-blur-md rounded-lg sm:rounded-xl p-2 sm:p-2.5 md:p-3 lg:p-4 border border-white/20 hover:scale-105 transition-all">
          <div class="text-2xl sm:text-2.5xl md:text-3xl lg:text-4xl mb-1 sm:mb-1.5 md:mb-2">🤷</div>
          <h3 class="text-xs sm:text-sm md:text-base font-bold mb-0.5 sm:mb-1">Most Likely To</h3>
          <p class="text-[10px] sm:text-xs text-white/70">Who fits best?</p>
        </div>
        <div class="bg-white/10 backdrop-blur-md rounded-lg sm:rounded-xl p-2 sm:p-2.5 md:p-3 lg:p-4 border border-white/20 hover:scale-105 transition-all">
          <div class="text-2xl sm:text-2.5xl md:text-3xl lg:text-4xl mb-1 sm:mb-1.5 md:mb-2">🙅</div>
          <h3 class="text-xs sm:text-sm md:text-base font-bold mb-0.5 sm:mb-1">Never Have I</h3>
          <p class="text-[10px] sm:text-xs text-white/70">Confess all</p>
        </div>
        <div class="bg-white/10 backdrop-blur-md rounded-lg sm:rounded-xl p-2 sm:p-2.5 md:p-3 lg:p-4 border border-white/20 hover:scale-105 transition-all">
          <div class="text-2xl sm:text-2.5xl md:text-3xl lg:text-4xl mb-1 sm:mb-1.5 md:mb-2">🤔</div>
          <h3 class="text-xs sm:text-sm md:text-base font-bold mb-0.5 sm:mb-1">Would You Rather</h3>
          <p class="text-[10px] sm:text-xs text-white/70">Choose wisely</p>
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="flex flex-col items-center gap-2 sm:gap-3 md:gap-4 px-4 mb-3 sm:mb-4 md:mb-6">
        <button
          @click="showAgeModal = true"
          class="group relative bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 hover:from-purple-500 hover:via-pink-500 hover:to-purple-500 text-white px-6 sm:px-8 md:px-12 py-3 sm:py-4 md:py-5 rounded-full text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl font-black shadow-2xl hover:shadow-pink-600/50 transition-all duration-300 transform hover:scale-110 animate-pulse-slow border-2 sm:border-3 md:border-4 border-pink-500/50 w-full max-w-md"
        >
          <span class="relative z-10">ENTER THE DANGER ZONE</span>
          <div class="absolute inset-0 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full blur-xl opacity-50 group-hover:opacity-75 transition-opacity"></div>
        </button>
      </div>

      <!-- Feature Pills -->
      <div class="mt-4 sm:mt-6 md:mt-8 lg:mt-10 xl:mt-16 space-y-2 sm:space-y-3 md:space-y-4 lg:space-y-6 pb-2 sm:pb-3 md:pb-4">
        <div class="flex flex-wrap justify-center gap-1.5 sm:gap-2 md:gap-3 px-4">
          <span class="bg-purple-950/40 backdrop-blur-md px-2 sm:px-3 md:px-4 py-1 sm:py-1.5 md:py-2 rounded-full text-[10px] sm:text-xs md:text-sm border border-purple-700/30 text-purple-200">
            🎮 10+ Adult Games
          </span>
          <span class="bg-purple-950/40 backdrop-blur-md px-2 sm:px-3 md:px-4 py-1 sm:py-1.5 md:py-2 rounded-full text-[10px] sm:text-xs md:text-sm border border-purple-700/30 text-purple-200">
            🔥 Extreme Mode
          </span>
          <span class="bg-purple-950/40 backdrop-blur-md px-2 sm:px-3 md:px-4 py-1 sm:py-1.5 md:py-2 rounded-full text-[10px] sm:text-xs md:text-sm border border-purple-700/30 text-purple-200">
            👥 Group Play
          </span>
          <span class="bg-purple-950/40 backdrop-blur-md px-2 sm:px-3 md:px-4 py-1 sm:py-1.5 md:py-2 rounded-full text-[10px] sm:text-xs md:text-sm border border-purple-700/30 text-purple-200">
            💋 Couples Mode
          </span>
        </div>
      </div>
    </div>

    <!-- Age Confirmation Modal -->
    <Teleport to="body">
      <div
        v-if="showAgeModal"
        class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
        @click.self="showAgeModal = false"
      >
        <div class="bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 border-2 sm:border-3 md:border-4 border-red-500/50 rounded-xl sm:rounded-2xl md:rounded-3xl p-4 sm:p-5 md:p-6 lg:p-8 xl:p-10 max-w-2xl w-full mx-auto relative">
          <!-- Close Button -->
          <button
            @click="showAgeModal = false"
            class="absolute top-3 right-3 sm:top-4 sm:right-4 text-white/60 hover:text-white transition-colors"
          >
            <Icon icon="mdi:close" class="w-6 h-6 sm:w-7 sm:h-8" />
          </button>

          <!-- Modal Content -->
          <div class="text-center">
            <div class="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl mb-3 sm:mb-4 md:mb-5">🔞</div>
            <h2 class="text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-black mb-3 sm:mb-4 md:mb-5 text-red-300">
              18+ ADULTS ONLY
            </h2>
            <p class="text-sm sm:text-base md:text-lg lg:text-xl text-white/90 mb-3 sm:mb-4 md:mb-5">
              This section contains mature content including:
            </p>
            <ul class="text-xs sm:text-sm md:text-base lg:text-lg text-white/80 space-y-1.5 sm:space-y-2 mb-4 sm:mb-5 md:mb-6 text-left max-w-md mx-auto">
              <li>🔥 Spicy Truth or Dare</li>
              <li>🍺 Drinking Games</li>
              <li>💋 Adult Challenges</li>
              <li>🌶️ Explicit Content</li>
            </ul>
            <p class="text-xs sm:text-sm md:text-base text-red-200 font-bold mb-4 sm:mb-5 md:mb-6">
              By continuing, you confirm you are 18 years or older.
            </p>
            
            <!-- Confirmation Button -->
            <button
              @click="confirmAge"
              :disabled="isConfirming"
              class="group relative bg-gradient-to-r from-red-600 via-pink-600 to-red-600 hover:from-red-500 hover:via-pink-500 hover:to-red-500 text-white px-6 sm:px-8 md:px-12 py-3 sm:py-4 md:py-5 rounded-full text-sm sm:text-base md:text-lg lg:text-xl font-black shadow-2xl hover:shadow-red-600/50 transition-all duration-300 transform hover:scale-105 border-2 sm:border-3 md:border-4 border-red-500/50 w-full max-w-md disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span class="relative z-10">{{ isConfirming ? 'Processing...' : 'I am 18+' }}</span>
              <div class="absolute inset-0 bg-gradient-to-r from-pink-500 to-red-500 rounded-full blur-xl opacity-50 group-hover:opacity-75 transition-opacity"></div>
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { Icon } from "@iconify/vue";
import { useAnalytics } from "~/composables/useAnalytics";

const { trackPageView } = useAnalytics();

const showAgeModal = ref(false);
const isConfirming = ref(false);

const confirmAge = async () => {
  isConfirming.value = true;
  
  try {
    // Track the age confirmation
    await $fetch('/api/age-confirmation', {
      method: 'POST',
      body: {
        userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : null
      }
    });
    
    // Navigate to setup
    await navigateTo('/setup?mode=adult');
  } catch (error) {
    console.error('Error confirming age:', error);
    // Still navigate even if tracking fails
    await navigateTo('/setup?mode=adult');
  } finally {
    isConfirming.value = false;
    showAgeModal.value = false;
  }
};

onMounted(() => {
  trackPageView('home');
});
</script>

<style scoped>
.font-bungee {
  font-family: "Bungee", cursive;
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
</style>
