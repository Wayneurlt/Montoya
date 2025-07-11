<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 p-5">
    <Home title="Strip Truth or Dare" />
    
    <div class="max-w-4xl mx-auto bg-white text-black bg-opacity-90 rounded-xl shadow-lg p-6">
      <div class="bg-blue-100 p-4 rounded-lg mb-6">
        <h2 class="text-black text-xl font-bold mb-2">Game Rules</h2>
        <ul class="space-y-2">
          <li><strong class="font-semibold">Level 1:</strong> Wrong answer = Remove clothing</li>
          <li><strong class="font-semibold">Level 2:</strong> Hesitate >20 seconds = Add restriction (e.g., hands tied)</li>
          <li><strong class="font-semibold">Level 3:</strong> Dare refusal = Take a shot OR fulfill "forfeit fantasy"</li>
          <li><strong class="font-semibold">Vegas Rule:</strong> What happens in the game stays in the game</li>
        </ul>
      </div>

      <div class="flex flex-col md:flex-row gap-6 my-8">
        <div class="bg-blue-50 p-4 rounded-lg flex-1">
          <h3 class="text-black font-semibold mb-3">Clothing Remaining</h3>
          <div class="flex flex-wrap gap-2">
            <div 
              v-for="(item, index) in clothingItems" 
              :key="index" 
              class="px-3 py-2 rounded-full text-sm text-white"
              :class="item.removed ? 'bg-gray-400 line-through' : 'bg-blue-400'"
            >
              {{ item.name }}
            </div>
          </div>
        </div>

        <div class="flex-2 flex flex-col items-center">
          <div 
            class="w-48 h-72 cursor-pointer perspective-1000 mb-5"
            @click="flipCard"
          >
            <div 
              class="relative w-full h-full transition-transform duration-500 transform-style-preserve-3d"
              :class="{ 'rotate-y-180': cardFlipped }"
            >
              <div class="absolute w-full h-full backface-hidden rounded-lg flex justify-center items-center text-center p-5 shadow-md bg-blue-400 text-white">
                <p>Click to draw a card</p>
              </div>
              <div class="absolute w-full h-full backface-hidden rounded-lg flex flex-col justify-center items-center text-center p-5 shadow-md bg-white text-black rotate-y-180">
                <p v-if="currentCard" class="font-semibold">{{ currentCard.type }}:</p>
                <p class="font-bold text-lg">{{ currentCard?.text }}</p>
              </div>
            </div>
          </div>
          <button 
            @click="drawCard" 
            class="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-full font-medium shadow-lg transition-all duration-300 hover:-translate-y-1"
          >
            Draw Card
          </button>
        </div>
      </div>

      <div class="mt-6">
        <div class="mb-6">
          <h4 class="text-black font-medium mb-2">Hesitation Timer: {{ hesitationTime }}s</h4>
          <div class="w-full h-2.5 bg-blue-50 rounded-full overflow-hidden">
            <div 
              class="h-full bg-blue-400 transition-all duration-1000 ease-linear" 
              :style="{ width: hesitationPercent + '%' }"
            ></div>
          </div>
        </div>

        <div class="flex justify-center gap-3">
          <button 
            @click="completeChallenge" 
            class="bg-green-500 hover:bg-green-600 text-white px-5 py-2.5 rounded-full font-bold shadow-md transition-all duration-300 hover:-translate-y-1"
          >
            Completed
          </button>
          <button 
            @click="failChallenge" 
            class="bg-red-500 hover:bg-red-600 text-white px-5 py-2.5 rounded-full font-bold shadow-md transition-all duration-300 hover:-translate-y-1"
          >
            Failed
          </button>
        </div>
      </div>

      <div class="mt-8 bg-blue-50 p-4 rounded-lg">
        <h3 class="text-black font-semibold mb-3">Game History</h3>
        <ul class="space-y-2 max-h-40 overflow-y-auto">
          <li 
            v-for="(action, index) in gameHistory" 
            :key="index" 
            class="py-2 border-b border-blue-100"
          >
            {{ action }}
          </li>
        </ul>
      </div>
    </div>

    <GameFooter />
  </div>
</template>

<script setup>
import { HomeNavbar } from '#components';

const clothingItems = ref([
  { name: "Top", removed: false },
  { name: "Bottom", removed: false },
  { name: "Underwear", removed: false },
  { name: "Socks", removed: false },
  { name: "Accessories", removed: false }
]);

const currentCard = ref(null);
const cardFlipped = ref(false);
const gameHistory = ref([]);
const hesitationTime = ref(20);
const hesitationTimer = ref(null);
const hesitationPercent = ref(100);
const gameLevel = ref(1);
const restrictions = ref([]);

const truthCards = [
  "What's your secret turn-on you've never told anyone?",
  "Where's the most inappropriate place you've fantasized about having sex?",
  "What's something you pretend to dislike in bed but actually enjoy?",
  "What's your favorite memory of us being intimate?",
  "What's one sexual thing you'd like to try but are afraid to ask for?",
  "Have you ever faked an orgasm with me? Be honest.",
  "What's the most embarrassing place you've ever gotten turned on?",
  "What's your wildest unfulfilled sexual fantasy?",
  "Have you ever been attracted to one of my friends?",
  "What's the most adventurous place you've ever had sex?",
  "Have you ever cheated on a partner?",
  "What's something you've done sexually that you regret?",
  "What's your biggest turn-off about me?",
  "Have you ever had a same-sex experience?",
  "What's the most unusual place you've masturbated?"
];

const dareCards = [
  "Let me apply lipstick—then kiss wherever I choose",
  "Swap underwear with your partner for the next 3 rounds",
  "Describe in detail where you'd touch me if we were in a crowded elevator",
  "Let your partner choose your outfit from what's left",
  "Whisper your wildest fantasy in my ear",
  "Remove one piece of clothing and hand it to your partner",
  "Let your partner blindfold you and lead you around the room",
  "Give your partner a sensual massage for 2 minutes",
  "Let your partner tie your hands with their clothing",
  "Kiss your partner's neck for 30 seconds without using your hands",
  "Let your partner choose a body part you have to keep touching",
  "Exchange a piece of clothing with your partner right now",
  "Let your partner whisper a command in your ear that you must obey",
  "Sit on your partner's lap for the next round",
  "Let your partner choose a position you must maintain until your next turn"
];

const drawCard = () => {
  cardFlipped.value = false;
  
  setTimeout(() => {
    const isTruth = Math.random() > 0.5;
    const cards = isTruth ? truthCards : dareCards;
    const randomIndex = Math.floor(Math.random() * cards.length);
    
    currentCard.value = {
      type: isTruth ? "TRUTH" : "DARE",
      text: cards[randomIndex]
    };
    
    cardFlipped.value = true;
    startHesitationTimer();
  }, 300);
};

const flipCard = () => {
  if (currentCard.value) {
    cardFlipped.value = !cardFlipped.value;
  }
};

const startHesitationTimer = () => {
  hesitationTime.value = 20;
  hesitationPercent.value = 100;
  
  if (hesitationTimer.value) {
    clearInterval(hesitationTimer.value);
  }
  
  hesitationTimer.value = setInterval(() => {
    hesitationTime.value--;
    hesitationPercent.value = (hesitationTime.value / 20) * 100;
    
    if (hesitationTime.value <= 0) {
      clearInterval(hesitationTimer.value);
      gameHistory.value.push("Time's up! Penalty applied.");
      applyPenalty();
    }
  }, 1000);
};

const completeChallenge = () => {
  clearInterval(hesitationTimer.value);
  gameHistory.value.push(`Completed: ${currentCard.value.text}`);
  currentCard.value = null;
  cardFlipped.value = false;
};

const failChallenge = () => {
  clearInterval(hesitationTimer.value);
  gameHistory.value.push(`Failed: ${currentCard.value.text}`);
  applyPenalty();
  currentCard.value = null;
  cardFlipped.value = false;
};

const applyPenalty = () => {
  if (gameLevel.value === 1) {
    const remainingItems = clothingItems.value.filter(item => !item.removed);
    if (remainingItems.length > 0) {
      const randomIndex = Math.floor(Math.random() * remainingItems.length);
      remainingItems[randomIndex].removed = true;
      gameHistory.value.push(`Removed: ${remainingItems[randomIndex].name}`);
      
      const remainingCount = clothingItems.value.filter(item => !item.removed).length;
      if (remainingCount <= 2) {
        gameLevel.value = 2;
        gameHistory.value.push("Level Up! Now hesitation adds restrictions");
      }
    }
  } else if (gameLevel.value === 2) {
    const newRestrictions = [
      "Hands tied with silk scarf",
      "Blindfolded for next round",
      "No speaking for next 2 rounds",
      "Must keep eyes closed during next dare",
      "Cannot use hands for next challenge",
      "Must keep one hand on partner at all times"
    ];
    const randomRestriction = newRestrictions[Math.floor(Math.random() * newRestrictions.length)];
    restrictions.value.push(randomRestriction);
    gameHistory.value.push(`New restriction: ${randomRestriction}`);
    
    if (restrictions.value.length >= 2) {
      gameLevel.value = 3;
      gameHistory.value.push("Final Level! Dare refusal = shot or forfeit fantasy");
    }
  } else {
    gameHistory.value.push("Choose: Take a shot OR fulfill partner's forfeit fantasy");
  }
};

onBeforeUnmount(() => {
  if (hesitationTimer.value) {
    clearInterval(hesitationTimer.value);
  }
});
</script>

<style>
/* Custom CSS for 3D card flip effect since Tailwind doesn't have these utilities */
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
</style>