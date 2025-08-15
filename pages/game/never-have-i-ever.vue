<template>
  <div class="min-h-screen bg-gradient-to-br from-purple-900 via-indigo-800 to-fuchsia-900 text-white p-4 md:p-8">
    <div class="max-w-2xl mx-auto bg-white/10 backdrop-blur-md rounded-xl p-6 md:p-10 shadow-2xl">
      <div class="text-center mb-6">
        <h1 class="text-3xl md:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-pink-500 to-cyan-400">Never Have I Ever</h1>
      </div>
      <transition name="fade">
        <div :key="`question-${question?.id ?? 'none'}`" class="text-center min-h-[120px] flex items-center justify-center">
          <p class="text-xl md:text-2xl font-semibold leading-relaxed px-2">{{ question?.text || 'Tap Another to begin' }}</p>
        </div>
      </transition>
      <div class="mt-8 flex gap-3 justify-center flex-wrap">
        <button @click="fetchAnother" class="bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 px-6 py-3 rounded-xl font-bold flex items-center gap-2">
          <Icon icon="mdi:refresh" class="w-5 h-5" />
          Another
        </button>
        <button @click="applyPenalty" class="bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 px-6 py-3 rounded-xl font-bold flex items-center gap-2">
          <Icon icon="mdi:glass-cocktail" class="w-5 h-5" />
          Drink Penalty
        </button>
      </div>
      
      <div v-if="showPenalty" class="mt-4 p-4 bg-red-500/20 border border-red-400/50 rounded-xl text-center">
        <p class="text-red-300 font-semibold">{{ penaltyMessage }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { Icon } from '@iconify/vue';
import { neverHaveIEverQuestions } from '~/data/questions/neverhaveiever';

const question = ref(null);

// Used question tracking to avoid repeats
const usedQuestions = ref(new Set());
const showPenalty = ref(false);
const penaltyMessage = ref('');

const fetchAnother = () => {
  showPenalty.value = false;
  // Get unused questions
  const unusedQuestions = neverHaveIEverQuestions.filter((_, index) => !usedQuestions.value.has(index));
  
  // If all questions have been used, reset the used set
  if (unusedQuestions.length === 0) {
    usedQuestions.value.clear();
    const randomQuestion = neverHaveIEverQuestions[Math.floor(Math.random() * neverHaveIEverQuestions.length)];
    question.value = { text: randomQuestion };
    return;
  }
  
  // Pick a random unused question
  const randomUnused = unusedQuestions[Math.floor(Math.random() * unusedQuestions.length)];
  const questionIndex = neverHaveIEverQuestions.indexOf(randomUnused);
  usedQuestions.value.add(questionIndex);
  
  question.value = { text: randomUnused };
};

const applyPenalty = () => {
  const penalties = [
    'Take 2 sips as penalty!',
    'Take a shot as penalty!',
    'Drink for 3 seconds straight!',
    'Take a large gulp as penalty!',
    'Finish your current drink!'
  ];
  penaltyMessage.value = penalties[Math.floor(Math.random() * penalties.length)];
  showPenalty.value = true;
  
  // Auto-hide penalty message after 5 seconds
  setTimeout(() => {
    showPenalty.value = false;
  }, 5000);
};

onMounted(fetchAnother);
</script>

<style>
.fade-enter-active, .fade-leave-active { transition: opacity .25s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>


