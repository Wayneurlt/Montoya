<template>
  <div class="max-w-3xl mx-auto relative z-10 pt-4 sm:pt-6 md:pt-8">
    <!-- Header -->
    <div ref="headerRowRef">
      <MultiplayerGameHeader
        :room-code="roomState.roomCode"
        :is-host="isHost"
        @back-to-lobby="handleBackToLobby"
        @change-game="handleChangeGame"
      />
    </div>

    <!-- Game Title -->
    <div ref="titleBlockRef" class="text-center mb-6 sm:mb-8">
      <h1 class="font-display text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold uppercase mb-2 sm:mb-4 text-paper">
        Dice <span class="text-hot">of</span> Desire
      </h1>
      <p class="text-paper/60 text-xs sm:text-sm font-medium">
        Host controls the game flow
      </p>
    </div>

    <!-- Turn Indicator - always show when playing -->
    <div v-if="roomState.gamePhase === 'playing'" class="mb-4 sm:mb-6">
      <TurnIndicator v-if="currentPlayer" :current-player="currentPlayer" />
      <div v-else class="card-poster p-4 sm:p-5 text-center">
        <p class="text-paper/60 text-sm sm:text-base">Waiting to see whose turn...</p>
      </div>
    </div>

    <!-- Target Player (if any) -->
    <div
      v-if="targetPlayer"
      class="bg-white/5 border border-white/10 rounded-md p-3 sm:p-4 mb-4 sm:mb-6 text-center"
    >
      <div class="text-[10px] sm:text-xs font-display uppercase tracking-wide text-paper/50 mb-1">Target</div>
      <div class="text-base sm:text-lg font-display font-bold uppercase text-paper">
        {{ targetPlayer.nickname }}
      </div>
    </div>

    <!-- Dice Area -->
    <div class="card-poster p-4 sm:p-5 md:p-6 lg:p-8 mb-4 sm:mb-6">
      <div class="flex justify-center gap-3 sm:gap-4 md:gap-6 lg:gap-8 mb-4 sm:mb-5 md:mb-6">
        <!-- Body Part Die -->
        <div
          ref="bodyDieRef"
          class="w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 lg:w-32 lg:h-32 bg-hot text-paper rounded-lg sm:rounded-xl shadow-hard flex flex-col justify-center items-center"
          :class="{
            'ring-4 ring-paper/50': !isRolling && currentRoll.body === 'Your Choice',
          }"
        >
          <div v-if="!isRolling" class="text-center px-1 sm:px-2">
            <p class="text-[10px] sm:text-xs md:text-sm font-display uppercase tracking-wide opacity-80 mb-0.5 sm:mb-1">
              Body Part
            </p>
            <p class="text-xs sm:text-sm md:text-base lg:text-lg font-display font-bold leading-tight">
              {{ currentRoll.body || "?" }}
            </p>
          </div>
          <div v-else class="text-center px-1 sm:px-2">
            <p class="text-[10px] sm:text-xs md:text-sm font-display uppercase tracking-wide opacity-80 mb-0.5 sm:mb-1">
              Body Part
            </p>
            <p class="text-xs sm:text-sm md:text-base lg:text-lg font-display font-bold leading-tight blur-[0.5px] opacity-80">
              {{ rollingBody }}
            </p>
          </div>
        </div>

        <!-- Action Die -->
        <div
          ref="actionDieRef"
          class="w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 lg:w-32 lg:h-32 bg-volt text-ink rounded-lg sm:rounded-xl shadow-hard flex flex-col justify-center items-center"
          :class="{
            'ring-4 ring-paper/50': !isRolling && currentRoll.action === 'Your Choice',
          }"
        >
          <div v-if="!isRolling" class="text-center px-1 sm:px-2">
            <p class="text-[10px] sm:text-xs md:text-sm font-display uppercase tracking-wide opacity-80 mb-0.5 sm:mb-1">
              Action
            </p>
            <p class="text-xs sm:text-sm md:text-base lg:text-lg font-display font-bold leading-tight">
              {{ currentRoll.action || "?" }}
            </p>
          </div>
          <div v-else class="text-center px-1 sm:px-2">
            <p class="text-[10px] sm:text-xs md:text-sm font-display uppercase tracking-wide opacity-80 mb-0.5 sm:mb-1">
              Action
            </p>
            <p class="text-xs sm:text-sm md:text-base lg:text-lg font-display font-bold leading-tight blur-[0.5px] opacity-80">
              {{ rollingAction }}
            </p>
          </div>
        </div>
      </div>

      <button
        v-if="isHost"
        @click="handleRoll"
        :disabled="isRolling || isTimerRunning"
        class="w-full bg-hot text-paper shadow-hard hover:brightness-110 py-3 sm:py-4 md:py-5 rounded-lg font-display font-bold uppercase tracking-wide text-sm sm:text-base md:text-lg transition-[filter] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 sm:gap-3"
      >
        <Icon v-if="isRolling" icon="svg-spinners:3-dots-fade" class="w-5 h-5 sm:w-6 sm:h-6" />
        <Icon v-else icon="mdi:dice" class="w-5 h-5 sm:w-6 sm:h-6" />
        {{ isRolling ? "Rolling..." : "Roll Dice" }}
      </button>
      <p v-else class="text-center text-paper/60 text-sm mt-3 sm:mt-4">Waiting for host to roll the dice...</p>
    </div>

    <!-- Result Display -->
    <div v-if="currentResult" class="card-face p-4 sm:p-6 md:p-8 mb-4 sm:mb-6">
      <div class="card-index card-index-tl text-hot"><Icon icon="mdi:fire" class="w-3.5 h-3.5" />CMD</div>
      <div class="card-index card-index-br text-hot"><Icon icon="mdi:fire" class="w-3.5 h-3.5" />CMD</div>

      <div class="mb-4 sm:mb-6 flex justify-center">
        <div ref="typeBadgeRef" class="badge-stamp bg-hot text-paper px-5 sm:px-6 py-2.5 sm:py-3 text-sm sm:text-base">
          <Icon icon="mdi:fire" class="w-5 h-5 sm:w-6 sm:h-6" />
          Your Command
        </div>
      </div>

      <!-- Result text + a smaller inline timer ring beside it, instead of a
           full-size ring stacked above the action buttons, so Completed/
           Failed stay reachable without extra scrolling. -->
      <div class="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 mb-4">
        <div class="flex-1 min-w-0 w-full">
          <p ref="questionTextRef" class="font-display text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-center sm:text-left leading-relaxed px-2 text-paper">
            {{ currentResult }}
          </p>
          <div v-if="specialEffect" class="flex justify-center sm:justify-start mt-3">
            <p class="text-volt font-display font-bold uppercase tracking-wide text-xs sm:text-sm inline-flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-4 sm:px-5 py-2 sm:py-2.5">
              <Icon :icon="specialEffectIcon" class="w-4 h-4 sm:w-5 sm:h-5" />
              {{ specialEffect }}
            </p>
          </div>
        </div>

        <!-- Timer: smaller, beside the text rather than a large block above the buttons -->
        <div class="relative w-16 h-16 sm:w-20 sm:h-20 flex-shrink-0">
          <svg class="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
            <path
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              fill="none"
              stroke="rgba(255,255,255,0.1)"
              stroke-width="3"
            />
            <path
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              fill="none"
              :stroke="secondsLeft <= 5 ? '#c8253f' : '#d4af6a'"
              stroke-width="3"
              stroke-linecap="round"
              :stroke-dasharray="`${timerPercent}, 100`"
            />
          </svg>
          <span
            ref="timerNumberRef"
            class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-sm sm:text-base font-display font-bold tabular-nums"
            :class="secondsLeft <= 5 ? 'text-hot' : 'text-paper'"
          >
            {{ secondsLeft }}s
          </span>
        </div>
      </div>

      <StickyActionBar v-if="isHost">
        <div class="flex justify-center gap-2 sm:gap-3 md:gap-4 w-full">
          <button
            @click="handleCompleteAction"
            class="bg-volt text-ink shadow-hard-sm hover:brightness-110 px-3 sm:px-4 md:px-6 py-1.5 sm:py-2 rounded-lg font-display font-bold uppercase tracking-wide flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm md:text-base"
          >
            <Icon icon="mdi:check-bold" class="w-4 h-4 sm:w-5 sm:h-5" />
            Completed
          </button>
          <button
            @click="handleFailAction"
            class="bg-hot text-paper shadow-hard-sm hover:brightness-110 px-3 sm:px-4 md:px-6 py-1.5 sm:py-2 rounded-lg font-display font-bold uppercase tracking-wide flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm md:text-base"
          >
            <Icon icon="mdi:close-thick" class="w-4 h-4 sm:w-5 sm:h-5" />
            Failed
          </button>
        </div>
      </StickyActionBar>
      <p v-else class="text-paper/60 text-sm text-center">Waiting for host to mark Completed or Failed</p>
    </div>

    <!-- History: collapsed by default so it doesn't eat gameplay space -->
    <div class="card-poster overflow-hidden">
      <button
        type="button"
        @click="toggleLog"
        class="w-full flex items-center justify-between p-4 font-display uppercase tracking-wide text-sm text-paper/70"
      >
        <span class="flex items-center gap-2">
          <Icon icon="mdi:history" class="w-5 h-5" />
          <span>Game History</span>
          <span v-if="history.length" class="bg-white/10 text-paper/60 text-xs px-2 py-0.5 rounded-full normal-case tracking-normal font-sans font-medium">{{ history.length }}</span>
        </span>
        <Icon icon="mdi:chevron-down" class="w-5 h-5 transition-transform duration-200" :class="{ 'rotate-180': logExpanded }" />
      </button>
      <div ref="logBodyRef" class="overflow-hidden" style="height: 0">
        <ul class="space-y-2 text-xs sm:text-sm px-4 pb-4 max-h-60 overflow-y-auto">
          <li
            v-for="(item, index) in history"
            :key="index"
            class="py-2 px-3 rounded-md bg-white/5"
          >
            <div class="flex justify-between items-start gap-2">
              <div class="min-w-0">
                <p class="font-semibold text-paper/90">
                  <span class="text-hot">{{ item.roller }}</span> →
                  <span class="text-volt">{{ item.target }}</span>:
                </p>
                <p class="mt-1 text-paper/80 break-words">{{ item.result }}</p>
                <p v-if="item.special" class="text-volt text-xs sm:text-sm mt-1 flex items-center gap-1">
                  <Icon :icon="getEffectIcon(item.special)" class="w-4 h-4" />
                  {{ item.special }}
                </p>
              </div>
              <Icon
                v-if="item.status === 'completed'"
                icon="mdi:check-circle"
                class="w-5 h-5 text-volt flex-shrink-0"
              />
              <Icon
                v-else-if="item.status === 'failed'"
                icon="mdi:close-circle"
                class="w-5 h-5 text-hot flex-shrink-0"
              />
            </div>
          </li>
        </ul>
      </div>
    </div>

    <!-- Player List -->
    <MultiplayerPlayerList :players="roomState.players" :current-turn-socket-id="currentPlayer?.socketId" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onBeforeUnmount, onMounted, watch, nextTick, type DeepReadonly } from "vue";
import { Icon } from "@iconify/vue";
import { useRouter } from "vue-router";
import gsap from "gsap";
import { navigateTo } from "#app";
import TurnIndicator from './TurnIndicator.vue';
import WaitingForHost from './WaitingForHost.vue';
import MultiplayerGameHeader from './MultiplayerGameHeader.vue';
import MultiplayerPlayerList from './MultiplayerPlayerList.vue';
import { useMultiplayer, type RoomState } from '~/composables/useMultiplayer';
import { staggerReveal, punchScale, tickPulse, shake, celebrateBurst } from '~/composables/useGameAnimations';

interface Props {
  roomState: DeepReadonly<RoomState>;
  isHost: boolean;
  multiplayer: ReturnType<typeof useMultiplayer>;
}

const props = defineProps<Props>();
const router = useRouter();

const handleChangeGame = () => {
  if (!props.isHost) return;
  props.multiplayer.endGame();
  navigateTo("/lobby");
};

const handleBackToLobby = () => {
  // If host, end the game first, otherwise just navigate
  if (props.multiplayer.isHost.value) {
    props.multiplayer.endGame();
  }
  // Navigate immediately - don't wait for socket response
  navigateTo("/lobby");
};

// Use the multiplayer composable's isHost directly for reactivity
const isHost = computed(() => props.multiplayer.isHost.value);

// Game Configuration
const BODY_PARTS = [
  "Lips",
  "Neck",
  "Hips",
  "Thighs",
  "Inner Thigh",
  "Crotch",
  "Below Navel",
  "Ass",
  "Nipples",
  "Boobs",
  "Your Choice",
];

const ACTIONS = [
  "Kiss",
  "Lick",
  "Nibble",
  "Massage",
  "Caress",
  "Suck",
  "Gentle Bite",
  "Grab",
  "Trace with Finger",
  "Blow On",
  "Kiss and Suck",
  "Lick and Suck",
  "Tease",
  "Your Choice",
];

// Game State
const isRolling = ref(false);
const isTimerRunning = ref(false);
const secondsLeft = ref(30);
const timerPercent = ref(100);
const timer = ref<any>(null);
const specialEffect = ref("");
const specialEffectIcon = ref("mdi:star");
const currentRoll = ref({ body: "", action: "" });
const rollingBody = ref("");
const rollingAction = ref("");
let rollCycleInterval: ReturnType<typeof setTimeout> | null = null;
const currentResult = ref("");
const history = ref<any[]>([]);
const logExpanded = ref(false);

// Animation refs
const headerRowRef = ref<HTMLElement | null>(null);
const titleBlockRef = ref<HTMLElement | null>(null);
const bodyDieRef = ref<HTMLElement | null>(null);
const actionDieRef = ref<HTMLElement | null>(null);
const typeBadgeRef = ref<HTMLElement | null>(null);
const questionTextRef = ref<HTMLElement | null>(null);
const timerNumberRef = ref<HTMLElement | null>(null);
const logBodyRef = ref<HTMLElement | null>(null);

// Collapsed by default so history doesn't permanently eat gameplay space —
// animate the height open/closed rather than a plain v-if.
const toggleLog = () => {
  logExpanded.value = !logExpanded.value;
  nextTick(() => {
    if (!logBodyRef.value) return;
    if (logExpanded.value) {
      const targetHeight = logBodyRef.value.scrollHeight;
      gsap.fromTo(
        logBodyRef.value,
        { height: 0 },
        { height: targetHeight, duration: 0.35, ease: 'power2.out', onComplete: () => { gsap.set(logBodyRef.value, { height: 'auto' }); } }
      );
    } else {
      gsap.fromTo(
        logBodyRef.value,
        { height: logBodyRef.value.scrollHeight },
        { height: 0, duration: 0.28, ease: 'power2.in' }
      );
    }
  });
};

// Who is up: from current prompt or server's nextUpPlayer (before host rolls)
const currentPlayer = computed(() => {
  if (props.roomState.currentPrompt?.player) {
    return props.roomState.currentPrompt.player;
  }
  const next = props.roomState.nextUpPlayer;
  if (next) {
    return { socketId: next.socketId, nickname: next.nickname };
  }
  return null;
});

const lastTurnPlayerId = ref<string | null>(null);

function getNextPlayerAfter(afterSocketId: string | null) {
  const players = props.roomState.players;
  if (!players?.length) return null;
  const list = players.filter((p: any) => p.connected !== false).length ? players.filter((p: any) => p.connected !== false) : players;
  if (!list.length) return null;
  if (!afterSocketId) return { socketId: list[0].socketId, nickname: list[0].nickname, gender: list[0].gender };
  const idx = list.findIndex((p: any) => p.socketId === afterSocketId);
  if (idx === -1) return { socketId: list[0].socketId, nickname: list[0].nickname, gender: list[0].gender };
  const next = list[(idx + 1) % list.length];
  return { socketId: next.socketId, nickname: next.nickname, gender: next.gender };
}

function getPlayerForTurn() {
  const players = props.roomState.players;
  if (!players?.length) return null;
  return getNextPlayerAfter(lastTurnPlayerId.value);
}

// Get host name
const hostName = computed(() => {
  const host = props.roomState.players.find((p: any) => p.isHost);
  return host?.nickname || 'Host';
});


// Get target player (opposite gender if available)
const targetPlayer = computed(() => {
  if (props.roomState.currentPrompt?.target) {
    return props.roomState.currentPrompt.target;
  }
  const players = props.roomState.players;
  if (!players || players.length <= 1) return null;

  const current = currentPlayer.value;
  if (!current) return null;

  // Find opposite gender
  const oppositeGender = players.filter(
    (p: any) =>
      p.socketId !== current.socketId && p.gender && p.gender !== current.gender
  );

  if (oppositeGender.length > 0) {
    return oppositeGender[Math.floor(Math.random() * oppositeGender.length)];
  }

  // Fallback to any other player
  const others = players.filter((p: any) => p.socketId !== current.socketId);
  return others.length > 0
    ? others[Math.floor(Math.random() * others.length)]
    : null;
});

// Helper Functions
const getEffectIcon = (effectText: string) => {
  if (effectText.includes("Snake Eyes")) return "mdi:dice-1";
  if (effectText.includes("Double Six")) return "mdi:dice-6";
  if (effectText.includes("Matching")) return "mdi:heart";
  if (effectText.includes("remove clothing")) return "mdi:tshirt-crew-off";
  return "mdi:star";
};

// A short tactile "tumble" for the two dice while rolling — rocks them back
// and forth and settles flat, standing in for a physical dice-roll motion.
const tumbleDice = () => {
  const targets = [bodyDieRef.value, actionDieRef.value].filter(Boolean);
  if (!targets.length) return;
  gsap.timeline()
    .to(targets, { rotation: 12, scale: 1.08, duration: 0.1, ease: 'power1.out' })
    .to(targets, { rotation: -14, duration: 0.12, ease: 'power1.inOut' })
    .to(targets, { rotation: 10, duration: 0.12, ease: 'power1.inOut' })
    .to(targets, { rotation: -6, duration: 0.12, ease: 'power1.inOut' })
    .to(targets, { rotation: 0, scale: 1, duration: 0.3, ease: 'back.out(1.7)' });
};

// Slot-machine-style flicker: while rolling, rapidly swap each die's face
// through random words so it reads as spinning rather than just waiting,
// slowing down near the end so it feels like it's settling on a result.
const startRollCycle = () => {
  let tick = 0;
  const roll = () => {
    rollingBody.value = BODY_PARTS[Math.floor(Math.random() * BODY_PARTS.length)];
    rollingAction.value = ACTIONS[Math.floor(Math.random() * ACTIONS.length)];
    tick++;
    const delay = tick < 8 ? 70 : tick < 12 ? 130 : 200;
    rollCycleInterval = setTimeout(roll, delay);
  };
  roll();
};

const stopRollCycle = () => {
  if (rollCycleInterval) clearTimeout(rollCycleInterval);
  rollCycleInterval = null;
};

// Roll Dice
const rollDice = async () => {
  if (isRolling.value || isTimerRunning.value || !props.isHost) return;

  currentResult.value = "";
  specialEffect.value = "";
  isRolling.value = true;
  tumbleDice();
  startRollCycle();

  await new Promise((resolve) => setTimeout(resolve, 1000));
  stopRollCycle();

  const bodyIndex = Math.floor(Math.random() * BODY_PARTS.length);
  const actionIndex = Math.floor(Math.random() * ACTIONS.length);
  const bodyPart = BODY_PARTS[bodyIndex];
  const action = ACTIONS[actionIndex];

  currentRoll.value = { body: bodyPart, action: action };
  tickPulse(bodyDieRef.value, { scale: 1.12 });
  tickPulse(actionDieRef.value, { scale: 1.12 });

  let timerDuration = 30;

  // Check for special combinations
  // Snake Eyes (1+1)
  if (bodyIndex === 0 && actionIndex === 0) {
    specialEffect.value = "Snake Eyes! Switch roles immediately";
    specialEffectIcon.value = "mdi:account-switch";
    timerDuration = 30;
  }
  // Double Six (last indices)
  else if (
    bodyIndex === BODY_PARTS.length - 1 &&
    actionIndex === ACTIONS.length - 1
  ) {
    specialEffect.value = "Double Six! Both players perform the action";
    specialEffectIcon.value = "mdi:account-multiple";
    timerDuration = 45;
  }
  // Matching numbers
  else if (bodyIndex === actionIndex) {
    specialEffect.value = "Matching! 1 minute + remove clothing";
    specialEffectIcon.value = "mdi:heart";
    timerDuration = 60;
  }

  currentResult.value = `${action} ${bodyPart}`;

  const player = getPlayerForTurn();
  const target = targetPlayer.value;

  // Update game state (always send who must perform so all devices show same turn)
  props.multiplayer.nextRound({
    body: bodyPart,
    action: action,
    result: currentResult.value,
    special: specialEffect.value,
    player: player
      ? {
          socketId: player.socketId,
          nickname: player.nickname,
          gender: player.gender,
        }
      : null,
    target: target
      ? {
          socketId: target.socketId,
          nickname: target.nickname,
          gender: target.gender,
        }
      : null,
    timerDuration,
  });

  startTimer(timerDuration);

  // Add to history
  history.value.unshift({
    roller: player?.nickname || "Player",
    target: target?.nickname || "Player",
    result: currentResult.value,
    special: specialEffect.value,
    status: null,
  });

  isRolling.value = false;

  await nextTick();
  if (typeBadgeRef.value) {
    gsap.fromTo(typeBadgeRef.value, { scale: 0.6, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.35, ease: 'back.out(2.2)' });
  }
  if (questionTextRef.value) {
    gsap.fromTo(questionTextRef.value, { y: 14, opacity: 0 }, { y: 0, opacity: 1, duration: 0.4, delay: 0.12, ease: 'power2.out' });
  }
};

const handleRoll = (evt: MouseEvent) => {
  punchScale(evt.currentTarget as HTMLElement);
  rollDice();
};

const startTimer = (duration: number) => {
  clearInterval(timer.value);
  isTimerRunning.value = true;
  secondsLeft.value = duration;
  const totalDuration = duration;

  timer.value = setInterval(() => {
    secondsLeft.value--;
    timerPercent.value = (secondsLeft.value / totalDuration) * 100;
    tickPulse(timerNumberRef.value, { scale: secondsLeft.value <= 5 ? 1.4 : 1.15 });
    if (secondsLeft.value === 5) {
      shake(timerNumberRef.value);
    }

    if (secondsLeft.value <= 0) {
      clearInterval(timer.value);
      isTimerRunning.value = false;
      if (history.value.length > 0) {
        history.value[0].status = "failed";
      }
    }
  }, 1000);
};

const completeAction = () => {
  clearInterval(timer.value);
  const current = props.roomState.currentPrompt?.player;
  if (current?.socketId) lastTurnPlayerId.value = current.socketId;
  if (history.value.length > 0) {
    history.value[0].status = "completed";
  }
  props.multiplayer.nextRound(null);
  currentResult.value = "";
  specialEffect.value = "";
  isTimerRunning.value = false;
  currentRoll.value = { body: "", action: "" };
};

const failAction = () => {
  clearInterval(timer.value);
  const current = props.roomState.currentPrompt?.player;
  if (current?.socketId) lastTurnPlayerId.value = current.socketId;
  if (history.value.length > 0) {
    history.value[0].status = "failed";
  }
  props.multiplayer.nextRound(null);
  currentResult.value = "";
  specialEffect.value = "";
  isTimerRunning.value = false;
  currentRoll.value = { body: "", action: "" };
};

const handleCompleteAction = (evt: MouseEvent) => {
  celebrateBurst(evt.currentTarget as HTMLElement);
  completeAction();
};

const handleFailAction = (evt: MouseEvent) => {
  punchScale(evt.currentTarget as HTMLElement);
  failAction();
};

// Watch for prompt changes
watch(
  () => props.roomState.currentPrompt,
  (newPrompt) => {
    if (newPrompt && newPrompt.result) {
      currentResult.value = newPrompt.result;
      currentRoll.value = {
        body: newPrompt.body || "",
        action: newPrompt.action || "",
      };
      specialEffect.value = newPrompt.special || "";
      if (newPrompt.timerDuration) {
        startTimer(newPrompt.timerDuration);
      }
    } else {
      currentResult.value = "";
      currentRoll.value = { body: "", action: "" };
      specialEffect.value = "";
      isTimerRunning.value = false;
      clearInterval(timer.value);
    }
  }
);

onBeforeUnmount(() => {
  clearInterval(timer.value);
  stopRollCycle();
});

onMounted(() => {
  nextTick(() => {
    staggerReveal([headerRowRef.value, titleBlockRef.value]);
  });
});
</script>

<style scoped>
@keyframes spin {
  0% {
    transform: rotate(0deg) scale(1);
  }
  50% {
    transform: rotate(180deg) scale(1.1);
  }
  100% {
    transform: rotate(360deg) scale(1);
  }
}
.animate-spin {
  animation: spin 0.8s linear infinite;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
