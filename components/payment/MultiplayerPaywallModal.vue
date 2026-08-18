<template>
  <BottomSheet :model-value="isPaywallOpen" :dismissible="!isPolling" @update:model-value="handleSheetUpdate">
    <div class="text-center text-paper">
      <Icon icon="mdi:cellphone-lock" class="w-14 h-14 mx-auto mb-4 text-hot" />

      <h2 class="font-display text-xl sm:text-2xl font-bold uppercase mb-2">Unlock Multiplayer</h2>
      <p class="text-sm sm:text-base text-paper/70 mb-6">
        Hosting a room costs
        <span class="font-bold text-volt">KES {{ passAmount }}</span>
        via M-Pesa — unlimited rooms for {{ passHours }} hours. Friends join your room code for free.
      </p>

      <template v-if="!isPolling">
        <input
          v-model="phoneNumber"
          type="tel"
          inputmode="tel"
          placeholder="07XX XXX XXX"
          class="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-center text-lg tracking-wide placeholder-paper/40 focus:outline-none focus:border-hot/60 mb-4"
          @keyup.enter="handlePay"
        />

        <button
          @click="handlePay"
          :disabled="!isValidPhone || isSubmitting"
          class="group relative w-full bg-hot text-paper shadow-hard hover:brightness-110 px-6 py-3 rounded-lg font-display font-bold uppercase tracking-wide text-sm sm:text-base transition-[filter] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Icon icon="mdi:cellphone-check" class="w-5 h-5 inline mr-2" />
          {{ isSubmitting ? 'Starting…' : 'Pay with M-Pesa' }}
        </button>
      </template>

      <template v-else>
        <div class="animate-pulse py-2">
          <Icon icon="mdi:cellphone-message" class="w-10 h-10 mx-auto mb-3 text-volt" />
          <p class="text-sm text-paper/80">
            Check your phone and enter your M-Pesa PIN to complete the payment…
          </p>
        </div>
      </template>

      <p v-if="error" class="text-sm text-wine mt-4">{{ error }}</p>
    </div>
  </BottomSheet>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { Icon } from '@iconify/vue'
import { usePayment } from '~/composables/usePayment'

const emit = defineEmits<{ (e: 'success'): void }>()

const { isPaywallOpen, isPolling, error, closePaywall, initiatePayment } = usePayment()

const config = useRuntimeConfig()
const passAmount = config.public.multiplayerPassAmount
const passHours = config.public.multiplayerPassHours

const phoneNumber = ref('')
const isSubmitting = ref(false)

const isValidPhone = computed(() => /^(\+254|254|0)(7|1)\d{8}$/.test(phoneNumber.value.replace(/\s+/g, '')))

const handlePay = async () => {
  if (!isValidPhone.value || isSubmitting.value) return
  isSubmitting.value = true
  try {
    const success = await initiatePayment(phoneNumber.value.replace(/\s+/g, ''))
    if (success) {
      emit('success')
    }
  } finally {
    isSubmitting.value = false
  }
}

const handleClose = () => {
  closePaywall()
}

const handleSheetUpdate = (value: boolean) => {
  if (!value) handleClose()
}
</script>
