<template>
  <div
    class="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 text-white p-3 sm:p-4 relative overflow-hidden"
  >
    <!-- Background Icons Pattern -->
    <BackgroundIcons />

    <div
      class="max-w-2xl mx-auto bg-white/10 backdrop-blur-md rounded-xl p-4 sm:p-5 md:p-6 lg:p-8 shadow-2xl relative z-10"
    >
      <!-- Home Button -->
      <div class="flex justify-between items-center mb-4 sm:mb-5 md:mb-6 gap-2">
        <NuxtLink to="/" class="bg-white/10 hover:bg-white/20 backdrop-blur-md px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl transition-all duration-300 flex items-center gap-1.5 sm:gap-2 border border-white/20 hover:scale-105 shadow-lg text-sm sm:text-base">
          <Icon icon="mdi:home" class="w-4 h-4 sm:w-5 sm:h-5" />
          <span class="font-medium">Home</span>
        </NuxtLink>
        
        <div class="flex items-center gap-1.5 sm:gap-2">
          <span
            class="text-xs sm:text-sm px-2 sm:px-3 py-1 sm:py-1.5 rounded-full shadow-md whitespace-nowrap"
            :class="
              gameMode === 'free-for-all'
                ? 'bg-purple-500/20 text-purple-300 border border-purple-400/30'
                : gameMode === 'connection'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/30'
                : 'bg-pink-500/20 text-pink-300 border border-pink-400/30'
            "
          >
            <span class="hidden sm:inline">{{
              gameMode === "free-for-all" ? "Free-for-All" 
              : gameMode === "connection" ? "Connection"
              : "Relationship"
            }}</span>
            <span class="sm:hidden">{{
              gameMode === "free-for-all" ? "FFA" 
              : gameMode === "connection" ? "Connect"
              : "Couple"
            }}</span>
          </span>
          <span
            class="text-xs sm:text-sm px-2 sm:px-3 py-1 sm:py-1.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-400/30 shadow-md whitespace-nowrap"
          >
            Lv {{ gameLevel }}
          </span>
        </div>
      </div>
      
      <!-- Game Header -->
      <div class="text-center mb-4 sm:mb-5 md:mb-6">
        <h1
          class="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black mb-3 sm:mb-4 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-pink-500 to-cyan-400 drop-shadow-2xl"
        >
          Truth or Dare
        </h1>
        
        <!-- Enhanced Spicy Mode Toggle -->
        <div class="bg-gradient-to-br from-black/50 to-red-950/40 rounded-xl sm:rounded-2xl p-4 sm:p-5 md:p-6 border-2 border-red-700/30 shadow-2xl shadow-red-900/30 backdrop-blur-lg">
          <div class="flex items-center justify-center gap-2 sm:gap-3 mb-3 sm:mb-4 md:mb-5">
            <Icon icon="mdi:fire" class="w-5 h-5 sm:w-6 sm:h-6 text-orange-500 animate-pulse" />
            <h3 class="text-base sm:text-lg md:text-xl font-bold text-white">Game Intensity</h3>
            <Icon icon="mdi:fire" class="w-5 h-5 sm:w-6 sm:h-6 text-orange-500 animate-pulse" style="animation-delay: 0.5s;" />
          </div>
          <div class="flex bg-black/60 rounded-xl sm:rounded-2xl p-1.5 sm:p-2 max-w-md mx-auto shadow-inner border border-red-800/30">
            <button
              @click="isSpicyMode = false"
              class="flex-1 px-3 sm:px-4 md:px-6 py-2.5 sm:py-3 md:py-4 rounded-lg sm:rounded-xl transition-all duration-300 text-sm sm:text-base font-bold flex items-center justify-center gap-1.5 sm:gap-2 relative overflow-hidden"
              :class="
                !isSpicyMode
                  ? 'bg-gradient-to-r from-purple-600 to-cyan-600 text-white shadow-2xl transform scale-105 ring-2 ring-cyan-400/50'
                  : 'text-gray-500 hover:text-white hover:bg-purple-950/30'
              "
            >
              <span class="text-lg sm:text-xl">😇</span>
              <span>Normal</span>
              <span v-if="!isSpicyMode" class="absolute inset-0 bg-white/20 animate-pulse rounded-xl"></span>
            </button>
            <button
              @click="isSpicyMode = true"
              class="flex-1 px-3 sm:px-4 md:px-6 py-2.5 sm:py-3 md:py-4 rounded-lg sm:rounded-xl transition-all duration-300 text-sm sm:text-base font-bold flex items-center justify-center gap-1.5 sm:gap-2 relative overflow-hidden"
              :class="
                isSpicyMode
                  ? 'bg-gradient-to-r from-pink-700 to-purple-700 text-white shadow-2xl transform scale-105 ring-2 ring-pink-400/50'
                  : 'text-gray-500 hover:text-white hover:bg-purple-950/30'
              "
            >
              <span class="text-lg sm:text-xl">🌶️</span>
              <span>Spicy</span>
              <span v-if="isSpicyMode" class="absolute inset-0 bg-white/20 animate-pulse rounded-xl"></span>
            </button>
          </div>
          <div class="text-center mt-3 sm:mt-4 md:mt-5">
            <p class="text-sm sm:text-base font-bold" :class="isSpicyMode ? 'text-pink-400' : 'text-cyan-400'">
              {{ isSpicyMode ? '🔥 Hot and steamy questions' : '✨ Mild and playful questions' }}
            </p>
            <p class="text-xs sm:text-sm text-purple-200/70 mt-1 sm:mt-2">
              {{ isSpicyMode ? 'For adventurous players only!' : 'Start here and heat up later!' }}
            </p>
          </div>
        </div>
      </div>

      <!-- Top Bar: Turn + Compact Clothing Counter + Settings -->
      <div class="flex items-center justify-between mb-4 sm:mb-5 md:mb-6 gap-2">
        <div class="bg-white/5 rounded-lg sm:rounded-xl px-3 sm:px-4 py-2 sm:py-3 border border-white/10">
          <div class="text-xs text-white/60">Current Turn</div>
          <div class="text-sm sm:text-base md:text-lg font-bold flex items-center gap-1.5 sm:gap-2">
            <span class="truncate max-w-[80px] sm:max-w-none">{{ currentPlayer?.name }}</span>
            <span class="text-base sm:text-lg md:text-xl">{{ currentPlayer?.gender === 'male' ? '♂' : '♀' }}</span>
          </div>
        </div>

        <div class="flex items-center gap-2 sm:gap-3">
          <!-- Compact clothing chip -->
          <div class="flex items-center gap-1 bg-white/5 px-2 sm:px-3 py-1.5 sm:py-2 rounded-full border border-white/10 text-xs sm:text-sm">
            <Icon icon="mdi:tshirt-crew" class="w-3 h-3 sm:w-4 sm:h-4" />
            <span class="font-semibold">{{ remainingClothing }}</span>
          </div>
          <!-- Settings button -->
          <button @click="showSettings = true" class="bg-white/10 hover:bg-white/20 px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg border border-white/10 text-xs sm:text-sm flex items-center gap-1.5 sm:gap-2">
            <Icon icon="mdi:cog" class="w-3 h-3 sm:w-4 sm:h-4" />
            <span class="hidden xs:inline">Settings</span>
          </button>
        </div>
      </div>

      <!-- Clothing Status moved to Settings modal -->

      <!-- Choose Your Card -->
      <div class="mb-6 sm:mb-7 md:mb-8">
        <div class="text-center mb-5 sm:mb-6 md:mb-8">
          <h3 class="text-xl sm:text-2xl md:text-3xl font-black mb-2 sm:mb-3 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-pink-500 to-cyan-400 drop-shadow-lg px-2">
            Choose Your Challenge
          </h3>
          <p class="text-purple-200/80 text-sm sm:text-base font-medium px-2">
            <span class="font-bold">{{ currentPlayer?.name }}</span>, it's your turn! Pick Truth or Dare to continue.
          </p>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5 md:gap-6">
          
          <!-- Truth Card -->
          <div class="relative">
            <div
              class="cursor-pointer perspective-1000"
              @click="drawSpecificCard('TRUTH')"
            >
              <div
                class="relative w-full h-48 sm:h-56 md:h-64 transition-transform duration-700 transform-style-preserve-3d"
                :class="{ 'rotate-y-180': currentCard?.type === 'TRUTH' && cardFlipped }"
              >
                <!-- Truth Card Front -->
                <div
                  class="absolute w-full h-full backface-hidden bg-gradient-to-br from-purple-700 via-pink-700 to-cyan-800 rounded-2xl sm:rounded-3xl flex flex-col justify-center items-center p-4 sm:p-5 md:p-6 shadow-2xl border-2 sm:border-3 md:border-4 hover:scale-105 transition-all duration-300 hover:shadow-purple-600/50 group"
                  :class="{ 
                    'opacity-50 grayscale': isDrawing && selectedCardType !== 'TRUTH',
                    'border-orange-500/60': !isDrawing || selectedCardType === 'TRUTH',
                    'border-white/30': isDrawing && selectedCardType !== 'TRUTH'
                  }"
                >
                  <!-- Glow effect -->
                  <div class="absolute inset-0 bg-gradient-to-br from-orange-500/20 to-transparent rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  
                  <div class="text-center relative z-10 px-2">
                    <!-- Floating background elements -->
                    <div class="absolute -top-2 -right-2 sm:-top-3 sm:-right-3 w-8 h-8 sm:w-10 sm:h-10 bg-orange-400/30 rounded-full animate-bounce" style="animation-delay: 0s;"></div>
                    <div class="absolute -bottom-1 -left-1 sm:-bottom-2 sm:-left-2 w-6 h-6 sm:w-8 sm:h-8 bg-red-400/40 rounded-full animate-bounce" style="animation-delay: 1s;"></div>
                    
                    <div class="text-5xl sm:text-6xl md:text-7xl mb-3 sm:mb-4 md:mb-5 animate-pulse group-hover:scale-110 transition-transform">
                      <Icon icon="mdi:chat-question" />
                    </div>
                    <p class="text-2xl sm:text-3xl md:text-4xl font-black mb-2 sm:mb-3 md:mb-4 tracking-wider drop-shadow-lg">TRUTH</p>
                    <p class="text-sm sm:text-base md:text-lg font-bold mb-2 sm:mb-3 md:mb-4" :class="isSpicyMode ? 'text-red-200' : 'text-orange-200'">
                      {{ isSpicyMode ? '🔥 Answer honestly...' : '✨ Share your secrets...' }}
                    </p>
                    <div class="mt-3 sm:mt-4 md:mt-5 text-xs sm:text-sm md:text-base px-3 sm:px-4 md:px-5 py-1.5 sm:py-2 md:py-2.5 rounded-full bg-white/30 backdrop-blur-sm font-bold border-2 border-white/40">
                      {{ isSpicyMode ? '🌶️ Spicy Mode' : '😇 Normal Mode' }}
                    </div>
                  </div>
                </div>

                <!-- Truth Card Back -->
                <div
                  class="absolute w-full h-full backface-hidden bg-white text-gray-900 rounded-2xl sm:rounded-3xl flex flex-col justify-center items-center p-4 sm:p-5 md:p-6 shadow-lg rotate-y-180 border-2 border-white/20"
                >
                  <div v-if="currentCard?.type === 'TRUTH'" class="text-center w-full">
                    <span class="font-bold text-sm sm:text-base md:text-lg px-3 sm:px-4 py-1 rounded-full mb-3 sm:mb-4 inline-flex items-center gap-1.5 sm:gap-2 bg-blue-100 text-blue-800">
                      <Icon icon="mdi:chat-question" class="w-4 h-4 sm:w-5 sm:h-5" />
                      TRUTH
                    </span>
                    <p class="text-sm sm:text-base md:text-lg font-medium mb-3 sm:mb-4 px-2 break-words">
                      {{ currentCard.text }}
                    </p>
                    <div
                      v-if="currentCard.target"
                      class="bg-gray-100 rounded-lg p-2 sm:p-3 max-w-xs mx-auto"
                    >
                      <p class="text-xs sm:text-sm font-medium text-gray-700 flex items-center justify-center gap-1.5 sm:gap-2 flex-wrap">
                        <Icon icon="mdi:account-arrow-right" class="w-4 h-4 sm:w-5 sm:h-5" />
                        <span class="break-words">
                          To: {{ currentCard.target.name }}
                          <span class="text-base sm:text-lg">{{ currentCard.target.gender === "male" ? "♂" : "♀" }}</span>
                        </span>
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <!-- Truth Action Button -->
            <button
              @click="drawSpecificCard('TRUTH')"
              class="w-full mt-3 sm:mt-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 py-2.5 sm:py-3 rounded-lg sm:rounded-xl text-sm sm:text-base font-bold transition-all duration-300 flex items-center justify-center gap-2 sm:gap-3 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-purple-600/30 hover:scale-105 border-2 border-purple-500/30"
              :disabled="isDrawing || (currentCard && currentCard.type !== 'TRUTH')"
            >
              <Icon v-if="isDrawing && selectedCardType === 'TRUTH'" icon="svg-spinners:3-dots-fade" class="w-4 h-4 sm:w-5 sm:h-5" />
              <Icon v-else icon="mdi:chat-question" class="w-4 h-4 sm:w-5 sm:h-5" />
              <span>
                {{ (isDrawing && selectedCardType === 'TRUTH') ? "Getting Truth..." : "Draw Truth" }}
              </span>
            </button>
          </div>

          <!-- Dare Card -->
          <div class="relative">
            <div
              class="cursor-pointer perspective-1000"
              @click="drawSpecificCard('DARE')"
            >
              <div
                class="relative w-full h-48 sm:h-56 md:h-64 transition-transform duration-700 transform-style-preserve-3d"
                :class="{ 'rotate-y-180': currentCard?.type === 'DARE' && cardFlipped }"
              >
                <!-- Dare Card Front -->
                <div
                  class="absolute w-full h-full backface-hidden bg-gradient-to-br from-pink-700 via-purple-700 to-pink-900 rounded-2xl sm:rounded-3xl flex flex-col justify-center items-center p-4 sm:p-5 md:p-6 shadow-2xl border-2 sm:border-3 md:border-4 hover:scale-105 transition-all duration-300 hover:shadow-pink-600/50 group"
                  :class="{ 
                    'opacity-50 grayscale': isDrawing && selectedCardType !== 'DARE',
                    'border-red-500/60': !isDrawing || selectedCardType === 'DARE',
                    'border-white/30': isDrawing && selectedCardType !== 'DARE'
                  }"
                >
                  <!-- Glow effect -->
                  <div class="absolute inset-0 bg-gradient-to-br from-red-500/20 to-transparent rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  
                  <div class="text-center relative z-10 px-2">
                    <!-- Floating background elements -->
                    <div class="absolute -top-1 -right-2 sm:-top-2 sm:-right-3 w-7 h-7 sm:w-9 sm:h-9 bg-red-500/30 rounded-full animate-bounce" style="animation-delay: 0.5s;"></div>
                    <div class="absolute -bottom-1 -left-1 sm:-bottom-2 sm:-left-2 w-5 h-5 sm:w-7 sm:h-7 bg-rose-500/40 rounded-full animate-bounce" style="animation-delay: 1.5s;"></div>
                    
                    <div class="text-5xl sm:text-6xl md:text-7xl mb-3 sm:mb-4 md:mb-5 animate-pulse group-hover:scale-110 transition-transform">
                      <Icon icon="mdi:fire" />
                    </div>
                    <p class="text-2xl sm:text-3xl md:text-4xl font-black mb-2 sm:mb-3 md:mb-4 tracking-wider drop-shadow-lg">DARE</p>
                    <p class="text-sm sm:text-base md:text-lg font-bold mb-2 sm:mb-3 md:mb-4" :class="isSpicyMode ? 'text-red-200' : 'text-rose-200'">
                      {{ isSpicyMode ? '🔥 Take the heat...' : '💪 Show your courage...' }}
                    </p>
                    <div class="mt-3 sm:mt-4 md:mt-5 text-xs sm:text-sm md:text-base px-3 sm:px-4 md:px-5 py-1.5 sm:py-2 md:py-2.5 rounded-full bg-white/30 backdrop-blur-sm font-bold border-2 border-white/40">
                      {{ isSpicyMode ? '🌶️ Spicy Mode' : '😇 Normal Mode' }}
                    </div>
                  </div>
                </div>

                <!-- Dare Card Back -->
                <div
                  class="absolute w-full h-full backface-hidden bg-white text-gray-900 rounded-2xl sm:rounded-3xl flex flex-col justify-center items-center p-4 sm:p-5 md:p-6 shadow-lg rotate-y-180 border-2 border-white/20"
                >
                  <div v-if="currentCard?.type === 'DARE'" class="text-center w-full">
                    <span class="font-bold text-sm sm:text-base md:text-lg px-3 sm:px-4 py-1 rounded-full mb-3 sm:mb-4 inline-flex items-center gap-1.5 sm:gap-2 bg-pink-100 text-pink-800">
                      <Icon icon="mdi:fire" class="w-4 h-4 sm:w-5 sm:h-5" />
                      DARE
                    </span>
                    <p class="text-sm sm:text-base md:text-lg font-medium mb-3 sm:mb-4 px-2 break-words">
                      {{ currentCard.text }}
                    </p>
                    <div
                      v-if="currentCard.target"
                      class="bg-gray-100 rounded-lg p-2 sm:p-3 max-w-xs mx-auto"
                    >
                      <p class="text-xs sm:text-sm font-medium text-gray-700 flex items-center justify-center gap-1.5 sm:gap-2 flex-wrap">
                        <Icon icon="mdi:account-arrow-right" class="w-4 h-4 sm:w-5 sm:h-5" />
                        <span class="break-words">
                          To: {{ currentCard.target.name }}
                          <span class="text-base sm:text-lg">{{ currentCard.target.gender === "male" ? "♂" : "♀" }}</span>
                        </span>
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <!-- Dare Action Button -->
            <button
              @click="drawSpecificCard('DARE')"
              class="w-full mt-3 sm:mt-4 bg-gradient-to-r from-pink-700 to-purple-700 hover:from-pink-800 hover:to-purple-800 py-2.5 sm:py-3 rounded-lg sm:rounded-xl text-sm sm:text-base font-bold transition-all duration-300 flex items-center justify-center gap-2 sm:gap-3 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-pink-600/30 hover:scale-105 border-2 border-pink-500/30"
              :disabled="isDrawing || (currentCard && currentCard.type !== 'DARE')"
            >
              <Icon v-if="isDrawing && selectedCardType === 'DARE'" icon="svg-spinners:3-dots-fade" class="w-4 h-4 sm:w-5 sm:h-5" />
              <Icon v-else icon="mdi:fire" class="w-4 h-4 sm:w-5 sm:h-5" />
              <span>
                {{ (isDrawing && selectedCardType === 'DARE') ? "Getting Dare..." : "Draw Dare" }}
              </span>
            </button>
          </div>
        </div>
      </div>

      <!-- Icebreaker Banner -->
      <div v-if="showIcebreaker && currentCard" class="mb-4 sm:mb-5 md:mb-6 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 border-2 border-blue-400/50 rounded-lg sm:rounded-xl p-3 sm:p-4">
        <div class="flex items-center gap-2 sm:gap-3">
          <Icon icon="mdi:ice-cream" class="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-cyan-400 flex-shrink-0" />
          <div>
            <h4 class="font-bold text-base sm:text-lg">Icebreaker Round</h4>
            <p class="text-xs sm:text-sm text-white/80">Starting with a light, conversation-friendly prompt</p>
          </div>
        </div>
      </div>

      <!-- Mirror Round Banner (Two-Player) -->
      <div v-if="mirrorRoundActive && currentCard" class="mb-4 sm:mb-5 md:mb-6 bg-gradient-to-r from-purple-500/20 to-pink-500/20 border-2 border-purple-400/50 rounded-lg sm:rounded-xl p-3 sm:p-4">
        <div class="flex items-center gap-2 sm:gap-3">
          <Icon icon="mdi:mirror" class="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-purple-400 flex-shrink-0" />
          <div>
            <h4 class="font-bold text-base sm:text-lg">Mirror Round</h4>
            <p class="text-xs sm:text-sm text-white/80">Both players answer the same prompt!</p>
          </div>
        </div>
      </div>

      <!-- Guess Mode Banner (Two-Player) -->
      <div v-if="guessModeActive && currentCard" class="mb-4 sm:mb-5 md:mb-6 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border-2 border-yellow-400/50 rounded-lg sm:rounded-xl p-3 sm:p-4">
        <div class="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
          <Icon icon="mdi:lightbulb-on" class="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-yellow-400 flex-shrink-0" />
          <div>
            <h4 class="font-bold text-base sm:text-lg">Guess Mode</h4>
            <p class="text-xs sm:text-sm text-white/80">Guess what your partner will answer before they reveal!</p>
          </div>
        </div>
        <div v-if="!playerGuess" class="mt-2 sm:mt-3">
          <input
            v-model="playerGuess"
            placeholder="Enter your guess..."
            class="w-full bg-white/20 rounded-lg p-2 sm:p-3 text-sm sm:text-base focus:ring-2 focus:ring-yellow-500 placeholder-white/50"
          />
        </div>
        <div v-else class="mt-2 sm:mt-3 p-2 sm:p-3 bg-white/10 rounded-lg">
          <p class="text-xs sm:text-sm">Your guess: <span class="font-bold">{{ playerGuess }}</span></p>
        </div>
      </div>

      <!-- Action Buttons -->
      <div v-if="currentCard && cardFlipped" class="mb-4 sm:mb-5 md:mb-6">
        <div class="grid grid-cols-1 gap-2 sm:gap-3">
          <button
            @click="completeChallenge"
            class="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 py-3 sm:py-3.5 md:py-4 rounded-lg sm:rounded-xl font-bold text-base sm:text-lg transition-all flex items-center justify-center gap-2 shadow-lg"
          >
            <Icon icon="mdi:check-bold" class="w-5 h-5 sm:w-6 sm:h-6" />
            Challenge Completed!
          </button>
          
          <button
            @click="resetCard"
            class="w-full bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 py-2 sm:py-2.5 rounded-lg sm:rounded-xl font-medium text-xs sm:text-sm transition-all flex items-center justify-center gap-2"
          >
            <Icon icon="mdi:refresh" class="w-3 h-3 sm:w-4 sm:h-4" />
            Choose Different Card
          </button>
        </div>
      </div>

      <!-- Hesitation Timer -->
      <div class="mb-4 sm:mb-5 md:mb-6 bg-white/5 rounded-lg sm:rounded-xl p-3 sm:p-4">
        <div class="flex justify-between items-center mb-2">
          <div class="flex items-center gap-1.5 sm:gap-2">
            <Icon icon="mdi:timer-sand" class="w-4 h-4 sm:w-5 sm:h-5 text-pink-300" />
            <span class="font-medium text-sm sm:text-base">Hesitation Timer:</span>
          </div>
          <span
            class="font-bold text-sm sm:text-base"
            :class="hesitationTime <= 5 ? 'text-red-400' : 'text-cyan-400'"
          >
            {{ hesitationTime }}s
          </span>
        </div>
        <div class="w-full h-1.5 sm:h-2 bg-white/20 rounded-full overflow-hidden">
          <div
            class="h-full bg-gradient-to-r from-pink-500 to-purple-500 transition-all duration-1000 ease-linear"
            :style="{ width: hesitationPercent + '%' }"
          ></div>
        </div>
      </div>

      <!-- Settings Modal -->
      <transition name="fade">
        <div v-if="showSettings" class="fixed inset-0 bg-black/60 flex items-center justify-center z-40 p-4">
          <div class="bg-slate-900 rounded-xl sm:rounded-2xl border border-white/10 w-full max-w-lg p-4 sm:p-5 md:p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div class="flex items-center justify-between mb-3 sm:mb-4">
              <h3 class="text-lg sm:text-xl font-semibold">Settings</h3>
              <button @click="showSettings = false" class="text-white/60 hover:text-white">
                <Icon icon="mdi:close" class="w-5 h-5 sm:w-6 sm:h-6" />
              </button>
            </div>

            <!-- Game Intensity quick toggle -->
            <div class="mb-4 sm:mb-5">
              <div class="text-xs sm:text-sm text-white/70 mb-2">Game Intensity</div>
              <div class="flex bg-gray-800/60 rounded-lg sm:rounded-xl p-1 sm:p-1.5">
                <button
                  @click="isSpicyMode = false"
                  class="flex-1 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-semibold"
                  :class="!isSpicyMode ? 'bg-green-600 text-white' : 'text-white/70 hover:text-white hover:bg-white/5'"
                >😇 Normal</button>
                <button
                  @click="isSpicyMode = true"
                  class="flex-1 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-semibold"
                  :class="isSpicyMode ? 'bg-red-600 text-white' : 'text-white/70 hover:text-white hover:bg-white/5'"
                >🌶️ Spicy</button>
              </div>
            </div>

            <!-- Clothing status list -->
            <div class="mb-4 sm:mb-5">
              <div class="text-xs sm:text-sm text-white/70 mb-2 flex items-center gap-2">
                <Icon icon="mdi:wardrobe" class="w-3 h-3 sm:w-4 sm:h-4" />
                Clothing Status
              </div>
              <div class="flex flex-wrap gap-1.5 sm:gap-2">
                <button
                  v-for="(item, index) in clothingItems"
                  :key="index"
                  class="px-2 sm:px-3 py-1 sm:py-1.5 rounded-full text-xs sm:text-sm border inline-flex items-center gap-1"
                  :class="item.removed ? 'bg-gray-800 text-gray-400 border-gray-700 line-through' : 'bg-white/10 text-white border-white/10 hover:bg-white/20'"
                  @click="toggleClothing(index)"
                >
                  <Icon :icon="item.icon" class="w-3 h-3 sm:w-4 sm:h-4" />
                  <span>{{ item.name }}</span>
                </button>
              </div>
            </div>

            <div class="flex justify-end gap-2">
              <button @click="showSettings = false" class="px-3 sm:px-4 py-1.5 sm:py-2 text-sm sm:text-base rounded-lg bg-white/10 hover:bg-white/20 border border-white/10">Close</button>
            </div>
          </div>
        </div>
      </transition>

      <!-- Game Log -->
      <div class="bg-white/5 rounded-lg sm:rounded-xl p-3 sm:p-4 max-h-32 sm:max-h-40 overflow-y-auto">
        <h3 class="font-semibold text-sm sm:text-base mb-2 sm:mb-3 flex items-center gap-2">
          <Icon icon="mdi:history" class="w-4 h-4 sm:w-5 sm:h-5" />
          <span>Game Log</span>
        </h3>
        <ul class="space-y-1.5 sm:space-y-2 text-xs sm:text-sm">
          <li
            v-for="(log, index) in gameHistory"
            :key="index"
            class="py-1 sm:py-1.5 px-2 rounded-lg"
            :class="index % 2 === 0 ? 'bg-white/5' : ''"
          >
            <div class="flex items-start gap-1.5 sm:gap-2">
              <Icon
                icon="mdi:information"
                class="w-3 h-3 sm:w-4 sm:h-4 mt-0.5 flex-shrink-0 text-pink-300"
              />
              <span class="break-words">{{ log }}</span>
            </div>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, watch } from "vue";
import { Icon } from "@iconify/vue";
// Questions are now loaded from database via API
import { useTruthTracker, useDareTracker } from "~/composables/useQuestionTracker";
import { useAnalytics } from "~/composables/useAnalytics";
import { useGameStore } from "~/stores/game";
import { useGameLogic } from "~/composables/useGameLogic";
import { navigateTo } from "#app";

// Game Configuration
const MAX_HESITATION_TIME = 15;
const CLOTHING_ITEMS = [
  { name: "Top", icon: "mdi:tshirt-crew", removed: false },
  { name: "Bottom", icon: "mdi:human-male-pants", removed: false },
  { name: "Underwear", icon: "mdi:underwear", removed: false },
  { name: "Socks", icon: "mdi:sock", removed: false },
  { name: "Accessories", icon: "mdi:glasses", removed: false },
];

// Game Store Integration
const gameStore = useGameStore();
const gameLogic = useGameLogic();

// State
const currentCard = ref(null);
const cardFlipped = ref(false);
const gameHistory = ref([]);
const hesitationTime = ref(MAX_HESITATION_TIME);
const hesitationTimer = ref(null);
const hesitationPercent = ref(100);
const gameLevel = ref(1);
const isDrawing = ref(false);
const clothingItems = ref(JSON.parse(JSON.stringify(CLOTHING_ITEMS)));
const isSpicyMode = ref(false);
const selectedCardType = ref('');
const showSettings = ref(false);
const showIcebreaker = ref(false);
const icebreakerPrompt = ref('');
const mirrorRoundActive = ref(false);
const guessModeActive = ref(false);
const playerGuess = ref('');

// Computed from store
const gameMode = computed(() => gameStore.gameMode || 'free-for-all');
const players = computed(() => gameStore.players);
const currentPlayerIndex = computed(() => gameStore.currentPlayerIndex);

// Question storage
const truthQuestionsDB = ref([])
const dareQuestionsDB = ref([])

// Initialize question trackers (will be populated from database)
let normalTruthTracker = null;
let spicyTruthTracker = null;
let normalDareTracker = null;
let spicyDareTracker = null;

// Initialize analytics
const { trackPageView, updateActivity } = useAnalytics();

// Computed Properties
const currentPlayer = computed(() => gameStore.currentPlayer);
const remainingClothing = computed(
  () => clothingItems.value.filter((item) => !item.removed).length
);

// Watch for two-player special mechanics
watch(() => gameStore.mirrorRoundActive, (active) => {
  mirrorRoundActive.value = active;
});

watch(() => gameStore.guessModeActive, (active) => {
  guessModeActive.value = active;
});

// Question Selection Logic with Icebreaker and Connection Mode Support
const getRandomQuestion = (type) => {
  // Check for icebreaker phase
  if (gameLogic.shouldUseIcebreaker()) {
    const icebreaker = gameLogic.getIcebreakerPrompt(type);
    if (icebreaker) {
      showIcebreaker.value = true;
      icebreakerPrompt.value = icebreaker;
      return icebreaker;
    }
  }
  
  let tracker;
  
  if (type === "TRUTH") {
    tracker = isSpicyMode.value ? spicyTruthTracker : normalTruthTracker;
  } else {
    tracker = isSpicyMode.value ? spicyDareTracker : normalDareTracker;
  }
  
  // Check if tracker exists (questions might still be loading)
  if (!tracker) {
    console.warn('Question tracker not ready yet, questions may still be loading')
    return 'Questions are loading... Please try again in a moment.';
  }
  
  const result = tracker.getNextQuestion();
  let question = result.question;
  
  // Adapt prompt based on game context
  const intensity = isSpicyMode.value ? 4 : 2; // Approximate intensity
  question = gameLogic.adaptPrompt(question, intensity);
  
  // Log usage stats for debugging
  const stats = tracker.getUsageStats.value;
  console.log(`${type} ${isSpicyMode.value ? 'Spicy' : 'Normal'} - Used: ${stats.usedCount}/${stats.totalQuestions} (${stats.usagePercentage}%)`);
  
  return question;
};

// Game Logic - Use game logic composable
const getRandomTarget = () => {
  return gameLogic.getTargetPlayer();
};

const drawSpecificCard = async (type) => {
  if (isDrawing.value || (currentCard.value && currentCard.value.type !== type)) return;
  
  // Track user activity
  updateActivity();
  
  isDrawing.value = true;
  selectedCardType.value = type;
  cardFlipped.value = false;
  showIcebreaker.value = false;

  // Check for mirror round in two-player mode
  if (gameStore.isTwoPlayerMode && gameStore.mirrorRoundActive) {
    mirrorRoundActive.value = true;
  }

  let target = null;
  // In connection mode, dares don't have specific targets
  if (type === "DARE" && gameStore.gameMode !== 'connection' && players.value.length > 1) {
    target = getRandomTarget();
  }

  const content = getRandomQuestion(type);

  currentCard.value = {
    type,
    text: content,
    target,
    isIcebreaker: showIcebreaker.value,
    isMirrorRound: mirrorRoundActive.value,
  };

  // Add to prompt history
  gameStore.addPromptToHistory(content);

  // Auto-flip the card after a short delay
  setTimeout(() => {
    cardFlipped.value = true;
    startHesitationTimer();
    isDrawing.value = false;
  }, 800);
};

// Keep the old function for compatibility but make it choose randomly
const drawCard = async () => {
  const type = Math.random() > 0.5 ? "TRUTH" : "DARE";
  drawSpecificCard(type);
};

const flipCard = () => {
  if (currentCard.value && !isDrawing.value) {
    cardFlipped.value = !cardFlipped.value;
    if (cardFlipped.value) {
      startHesitationTimer();
    } else {
      resetHesitationTimer();
    }
  }
};

// Reset current card to allow new selection
const resetCard = () => {
  currentCard.value = null;
  cardFlipped.value = false;
  selectedCardType.value = '';
  showIcebreaker.value = false;
  playerGuess.value = '';
  resetHesitationTimer();
};

const startHesitationTimer = () => {
  resetHesitationTimer();
  hesitationTimer.value = setInterval(() => {
    hesitationTime.value--;
    hesitationPercent.value =
      (hesitationTime.value / MAX_HESITATION_TIME) * 100;

    if (hesitationTime.value <= 0) {
      clearInterval(hesitationTimer.value);
      gameHistory.value.unshift(
        `${currentPlayer.value.name} hesitated too long!`
      );
      applyPenalty();
      // Server penalty + advance
      // no server penalty/advance in sessionless mode
      nextTurn();
    }
  }, 1000);
};

const resetHesitationTimer = () => {
  clearInterval(hesitationTimer.value);
  hesitationTime.value = MAX_HESITATION_TIME;
  hesitationPercent.value = 100;
};

const applyPenalty = () => {
  const removableItems = clothingItems.value.filter((item) => !item.removed);
  if (removableItems.length > 0) {
    const itemToRemove = removableItems[0]; // Remove in a predictable order
    const itemInState = clothingItems.value.find(
      (i) => i.name === itemToRemove.name
    );
    if (itemInState) {
      itemInState.removed = true;
      gameHistory.value.unshift(
        `${currentPlayer.value.name} removed their ${itemInState.name} as a penalty!`
      );
      updateGameLevel();
    }
  }
};

const completeChallenge = () => {
  if (!currentCard.value) return;
  resetHesitationTimer();
  gameHistory.value.unshift(
    `${currentPlayer.value?.name} completed: ${currentCard.value.text}`
  );
  
  // Use game logic to complete round
  gameLogic.completeRound();
  
  // Reset special modes
  if (mirrorRoundActive.value) {
    gameStore.deactivateMirrorRound();
    mirrorRoundActive.value = false;
  }
  if (guessModeActive.value) {
    gameStore.deactivateGuessMode();
    guessModeActive.value = false;
  }
  
  nextTurn();
};

const nextTurn = () => {
  currentCard.value = null;
  cardFlipped.value = false;
  selectedCardType.value = '';
  showIcebreaker.value = false;
  // Player index is managed by game store
};

const toggleClothing = (index) => {
  if (!clothingItems.value[index].removed) {
    clothingItems.value[index].removed = true;
    gameHistory.value.unshift(
      `${currentPlayer.value.name} voluntarily removed their ${clothingItems.value[index].name}.`
    );
    updateGameLevel();
  }
};

const updateGameLevel = () => {
  const removedCount = clothingItems.value.filter((i) => i.removed).length;
  gameLevel.value = Math.min(Math.floor(removedCount / 2) + 1, 5);
};

// Load questions from database
async function loadQuestions() {
  try {
    console.log('🔄 Loading questions from database...')
    
    // Load truth questions (normal and spicy)
    const truthResponse = await $fetch('/api/questions/truth-or-dare?type=TRUTH&limit=100')
    console.log('Truth API response:', truthResponse)
    const allTruthQuestions = truthResponse.questions || []
    
    // Load dare questions (normal and spicy)
    const dareResponse = await $fetch('/api/questions/truth-or-dare?type=DARE&limit=100')
    console.log('Dare API response:', dareResponse)
    const allDareQuestions = dareResponse.questions || []
    
    // Separate by intensity (1-3 = normal, 4-5 = spicy)
    const normalTruths = allTruthQuestions.filter(q => q.intensity <= 3).map(q => q.text)
    const spicyTruths = allTruthQuestions.filter(q => q.intensity >= 4).map(q => q.text)
    const normalDares = allDareQuestions.filter(q => q.intensity <= 3).map(q => q.text)
    const spicyDares = allDareQuestions.filter(q => q.intensity >= 4).map(q => q.text)
    
    console.log(`📊 Question distribution:`)
    console.log(`- Normal Truths: ${normalTruths.length}`)
    console.log(`- Spicy Truths: ${spicyTruths.length}`)
    console.log(`- Normal Dares: ${normalDares.length}`)
    console.log(`- Spicy Dares: ${spicyDares.length}`)
    
    // Create trackers with loaded questions
    normalTruthTracker = useTruthTracker(normalTruths, false);
    spicyTruthTracker = useTruthTracker(spicyTruths, true);
    normalDareTracker = useDareTracker(normalDares, false);
    spicyDareTracker = useDareTracker(spicyDares, true);
    
    // Initialize trackers
    normalTruthTracker.initializeTracker();
    spicyTruthTracker.initializeTracker();
    normalDareTracker.initializeTracker();
    spicyDareTracker.initializeTracker();
    
    console.log(`✅ Successfully loaded and initialized question trackers`)
  } catch (error) {
    console.error('❌ Error loading questions from database:', error)
    // Fallback: use some default questions to prevent game from breaking
    const fallbackTruths = ['What is your biggest secret?', 'Who do you have a crush on?']
    const fallbackDares = ['Give someone a hug', 'Do a silly dance']
    
    normalTruthTracker = useTruthTracker(fallbackTruths, false);
    spicyTruthTracker = useTruthTracker(fallbackTruths, true);
    normalDareTracker = useDareTracker(fallbackDares, false);
    spicyDareTracker = useDareTracker(fallbackDares, true);
    
    normalTruthTracker.initializeTracker();
    spicyTruthTracker.initializeTracker();
    normalDareTracker.initializeTracker();
    spicyDareTracker.initializeTracker();
    
    console.log('⚠️ Using fallback questions due to API error')
  }
}

// Lifecycle Hooks
onMounted(async () => {
  if (typeof window !== "undefined") {
    // Track page view
    trackPageView('truth-or-dare');
    
    // Load game state from store
    gameStore.loadFromLocalStorage();
    
    // If no players in store, redirect to setup
    if (gameStore.players.length === 0) {
      const savedSession = localStorage.getItem("gameSession");
      if (savedSession) {
        const session = JSON.parse(savedSession);
        gameStore.setGameMode(session.mode || "free-for-all");
        gameStore.setPlayers(session.players || []);
      } else {
        // No game state found, redirect to setup
        await navigateTo('/setup?game=truth-or-dare');
        return;
      }
    }
    
    // Set selected game if not set
    if (!gameStore.selectedGame) {
      gameStore.setSelectedGame('truth-or-dare');
    }
    
    // Ensure required setup data exists
    if (!gameStore.relationshipType || !gameStore.comfortLevel || !gameStore.gameMode) {
      await navigateTo('/setup?game=truth-or-dare');
      return;
    }
    
    // Load questions from database
    await loadQuestions();
    
    // Check for two-player special mechanics
    if (gameStore.isTwoPlayerMode) {
      gameLogic.checkMirrorRound();
      gameLogic.checkGuessMode();
    }
  }
});

function generateId() {
  return Math.random().toString(36).substring(2, 9);
}

onBeforeUnmount(() => {
  clearInterval(hesitationTimer.value);
});
</script>

<style>
/* Custom 3D Card Styles */
.perspective-1000 {
  perspective: 1000px;
}
.transform-style-preserve-3d {
  transform-style: preserve-3d;
}
.backface-hidden {
  backface-visibility: hidden;
}
.rotate-y-180 {
  transform: rotateY(180deg);
}

/* Animations */
@keyframes float {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-10px);
  }
}
.animate-float {
  animation: float 6s ease-in-out infinite;
}

/* Smooth transitions */
button,
div {
  transition: all 0.3s ease;
}

/* Scrollbar styling */
::-webkit-scrollbar {
  width: 6px;
}
::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 3px;
}
::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.3);
  border-radius: 3px;
}
</style>
