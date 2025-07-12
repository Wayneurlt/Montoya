<template>
  <div class="min-h-screen bg-black text-white flex items-center justify-center px-4">
    <div class="max-w-5xl w-full text-center">
      <!-- Game Options -->
      <div class="flex justify-center items-end flex-wrap gap-6 md:gap-10 mb-8">
        <!-- Dice -->
        <img
          src="/assets/images/dice.png"
          alt="Dice"
          class="h-20 sm:h-24 md:h-36 lg:h-52 hover:scale-110 transition-transform duration-200"
        />
        <!-- Card -->
        <img
          src="/assets/images/cards.png"
          alt="Card"
          class="h-20 sm:h-24 md:h-36 lg:h-52 hover:scale-110 transition-transform duration-200"
        />
        <!-- Emoji -->
        <img
          src="/assets/images/chaos.png"
          alt="Emoji"
          class="h-20 sm:h-24 md:h-36 lg:h-52 hover:scale-110 transition-transform duration-200"
        />
      </div>

      <!-- Pick one -->
      <p class="text-white font-semibold mb-4 text-sm sm:text-base">Pick one.</p>

      <!-- Headline -->
      <h1 class="text-xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold mb-2">
        Play it. Regret it. Do it again.
      </h1>

      <!-- Subheading -->
      <p class="text-gray-300 text-xs sm:text-sm md:text-base mb-6 max-w-lg mx-auto">
        The game you were warned you about. But your situationship will love it.
      </p>

      <!-- CTA Button -->
      <button
        @click="navigateToSetup"
        class="bg-red-600 hover:bg-red-700 text-white font-medium px-6 py-2 rounded-lg transition-colors text-sm sm:text-base"
      >
        Choose for me
      </button>
    </div>
  </div>
</template>

<script setup>
const navigateToSetup = () => {
  navigateTo("/setup");
};
</script>
