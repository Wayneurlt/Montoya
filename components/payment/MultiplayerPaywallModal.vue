<template>
  <div
    v-if="isPaywallOpen"
    class="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm px-4"
  >
    <div class="bg-white/10 backdrop-blur-md rounded-2xl p-6 sm:p-8 border border-white/20 max-w-sm w-full text-center relative">
      <button
        v-if="!isPolling"
        @click="handleClose"
        class="absolute top-3 right-3 text-white/50 hover:text-white/90 transition-colors"
        aria-label="Close"
      >
        <Icon icon="mdi:close" class="w-6 h-6" />
      </button>

      <Icon icon="mdi:cellphone-lock" class="w-14 h-14 mx-auto mb-4 text-purple-400" />

      <h2 class="text-xl sm:text-2xl font-black mb-2">Unlock Multiplayer</h2>
      <p class="text-sm sm:text-base text-white/70 mb-6">
        Hosting a room costs
        <span class="font-bold text-purple-300">KES {{ passAmount }}</span>
        via M-Pesa — unlimited rooms for {{ passHours }} hours. Friends join your room code for free.
      </p>

      <template v-if="!isPolling">
        <input
          v-model="phoneNumber"
          type="tel"
          inputmode="tel"
          placeholder="07XX XXX XXX"
          class="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-center text-lg tracking-wide placeholder-white/40 focus:outline-none focus:border-purple-400 mb-4"
          @keyup.enter="handlePay"
        />

        <button
          @click="handlePay"
          :disabled="!isValidPhone || isSubmitting"
          class="group relative w-full bg-gradient-to-r from-green-600 via-emerald-600 to-green-600 hover:from-green-500 hover:via-emerald-500 hover:to-green-500 text-white px-6 py-3 rounded-xl font-black text-base shadow-2xl transition-all duration-300 transform hover:scale-105 border-2 border-green-500/50 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
        >
          <Icon icon="mdi:cellphone-check" class="w-5 h-5 inline mr-2" />
          {{ isSubmitting ? 'Starting…' : 'Pay with M-Pesa' }}
        </button>
      </template>

      <template v-else>
        <div class="animate-pulse py-2">
          <Icon icon="mdi:cellphone-message" class="w-10 h-10 mx-auto mb-3 text-green-400" />
          <p class="text-sm text-white/80">
            Check your phone and enter your M-Pesa PIN to complete the payment…
          </p>
        </div>
      </template>

      <p v-if="error" class="text-sm text-red-400 mt-4">{{ error }}</p>
    </div>
  </div>
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
</script>
