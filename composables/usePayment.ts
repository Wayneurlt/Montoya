import { ref } from 'vue'

const POLL_INTERVAL_MS = 3000
const POLL_MAX_ATTEMPTS = 30 // ~90 seconds

// Module-level singleton state so the paywall modal and the page that opens it
// (e.g. lobby.vue) always see the same entitlement/poll state.
const isPaywallOpen = ref(false)
const isPolling = ref(false)
const passActive = ref(false)
const expiresAt = ref<string | null>(null)
const error = ref<string | null>(null)

export const usePayment = () => {
  const checkEntitlement = async () => {
    try {
      const result = await $fetch<{ active: boolean; expiresAt?: string }>('/api/payment/entitlement')
      passActive.value = result.active
      expiresAt.value = result.expiresAt ?? null
    } catch (e) {
      console.warn('Failed to check multiplayer pass entitlement:', e)
    }
  }

  const openPaywall = () => {
    error.value = null
    isPaywallOpen.value = true
  }

  const closePaywall = () => {
    isPaywallOpen.value = false
    isPolling.value = false
  }

  const initiatePayment = async (phoneNumber: string) => {
    error.value = null
    try {
      const { apiRef } = await $fetch<{ apiRef: string }>('/api/payment/mpesa-initiate', {
        method: 'POST',
        body: { phoneNumber },
      })
      return await pollStatus(apiRef)
    } catch (e: any) {
      error.value = e?.data?.statusMessage || 'Could not start M-Pesa payment. Please try again.'
      return false
    }
  }

  const pollStatus = async (apiRef: string): Promise<boolean> => {
    isPolling.value = true
    try {
      for (let attempt = 0; attempt < POLL_MAX_ATTEMPTS; attempt++) {
        const result = await $fetch<{ status: string; expiresAt?: string }>('/api/payment/status', {
          query: { ref: apiRef },
        })

        if (result.status === 'ACTIVE') {
          passActive.value = true
          expiresAt.value = result.expiresAt ?? null
          isPaywallOpen.value = false
          return true
        }

        if (result.status === 'FAILED') {
          error.value = 'Payment failed or was cancelled. Please try again.'
          return false
        }

        await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL_MS))
      }

      error.value = 'Payment timed out. If you completed the M-Pesa prompt, try again in a moment.'
      return false
    } finally {
      isPolling.value = false
    }
  }

  return {
    isPaywallOpen,
    isPolling,
    passActive,
    expiresAt,
    error,
    checkEntitlement,
    openPaywall,
    closePaywall,
    initiatePayment,
  }
}
