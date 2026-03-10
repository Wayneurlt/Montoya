/**
 * Vibrate the device (e.g. when host is rung). Works on mobile; no-op if not supported.
 */
export function vibrateRing() {
  if (typeof navigator === 'undefined' || !navigator.vibrate) return
  try {
    // Pattern: vibrate 200ms, pause 100ms, vibrate 200ms, pause 100ms, vibrate 200ms
    navigator.vibrate([200, 100, 200, 100, 200])
  } catch (_) {}
}

/**
 * Play a short bell/ding sound for "ring host" notifications.
 * Uses Web Audio API so no external file is needed.
 */
export function playRingSound() {
  if (typeof window === 'undefined') return
  try {
    const Ctx = window.AudioContext || (window as any).webkitAudioContext
    if (!Ctx) return
    const ctx = new Ctx()
    if (ctx.state === 'suspended') {
      ctx.resume().then(() => playRingSoundInner(ctx)).catch(() => {})
    } else {
      playRingSoundInner(ctx)
    }
  } catch (_) {}
}

function playRingSoundInner(ctx: AudioContext) {
  const osc = ctx.createOscillator()
  const gain = ctx.createGain()
  osc.connect(gain)
  gain.connect(ctx.destination)
  osc.frequency.value = 880
  osc.type = 'sine'
  gain.gain.setValueAtTime(0.25, ctx.currentTime)
  gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2)
  osc.start(ctx.currentTime)
  osc.stop(ctx.currentTime + 0.2)
}
