import gsap from 'gsap'
import { nextTick } from 'vue'

/**
 * Shared GSAP animation primitives for the game screens.
 * Built once for the Truth or Dare pilot, meant to be reused as the same
 * motion language rolls out to the rest of the games — keep additions here
 * generic (take elements/refs in, don't assume a specific game's markup).
 */

/** Staggered fade-up entrance for a list of elements (e.g. header pieces on mount). */
export function staggerReveal(els: Array<Element | null | undefined>, opts: { delay?: number } = {}) {
  const targets = els.filter(Boolean) as Element[]
  if (!targets.length) return
  gsap.fromTo(
    targets,
    { opacity: 0, y: 18 },
    { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out', stagger: 0.08, delay: opts.delay ?? 0 }
  )
}

/**
 * A physical "card flip" transition: build a brief anticipatory pulse/glow,
 * rotate to edge-on (invisible), run `swap()` to change the DOM content (e.g.
 * toggle a v-if), then rotate back to face-on. Falls back to calling `swap()`
 * immediately if there's no element (e.g. first render, or reduced-motion
 * contexts where refs aren't mounted).
 */
export async function flipTransition(
  el: Element | null | undefined,
  swap: () => void,
  opts: { anticipation?: boolean } = {}
) {
  if (!el) {
    swap()
    return
  }
  if (opts.anticipation ?? true) {
    await gsap.timeline()
      .to(el, { scale: 1.03, filter: 'brightness(1.15)', duration: 0.22, ease: 'power1.inOut' })
      .to(el, { scale: 1, filter: 'brightness(1)', duration: 0.18, ease: 'power1.in' })
  }
  await gsap.to(el, { rotationY: 90, duration: 0.2, ease: 'power1.in' })
  swap()
  gsap.set(el, { rotationY: -90 })
  await nextTick()
  await gsap.to(el, { rotationY: 0, duration: 0.32, ease: 'back.out(1.6)' })
}

/** Quick tactile "punch" scale for button presses — call on click with the event's currentTarget. */
export function punchScale(el: Element | null | undefined) {
  if (!el) return
  gsap.timeline()
    .to(el, { scale: 0.92, duration: 0.08, ease: 'power1.out' })
    .to(el, { scale: 1, duration: 0.22, ease: 'back.out(2)' })
}

/** A short attention-grabbing shake, e.g. for a timer running out or an invalid action. */
export function shake(el: Element | null | undefined) {
  if (!el) return
  gsap.fromTo(
    el,
    { x: -6 },
    { x: 0, duration: 0.4, ease: 'elastic.out(1, 0.3)' }
  )
}

/** Pulses an element once — used for per-second timer ticks or vote/score changes. */
export function tickPulse(el: Element | null | undefined, opts: { scale?: number } = {}) {
  if (!el) return
  gsap.fromTo(
    el,
    { scale: opts.scale ?? 1.25 },
    { scale: 1, duration: 0.35, ease: 'back.out(2.5)' }
  )
}

/**
 * Celebration burst for high-impact moments (challenge completed, correct guess, etc).
 * Scales/glows the trigger element and spawns a short-lived ring of particles
 * around its center — lightweight, no external confetti library needed.
 */
export function celebrateBurst(el: Element | null | undefined, opts: { colors?: string[] } = {}) {
  if (!el || typeof document === 'undefined') return
  const colors = opts.colors ?? ['#c8253f', '#d4af6a', '#7c1226', '#f2ece2']

  gsap.timeline()
    .to(el, { scale: 1.06, duration: 0.12, ease: 'power2.out' })
    .to(el, { scale: 1, duration: 0.35, ease: 'elastic.out(1, 0.4)' })

  const rect = (el as HTMLElement).getBoundingClientRect?.()
  if (!rect) return

  const originX = rect.left + rect.width / 2
  const originY = rect.top + rect.height / 2
  const particleCount = 14
  const container = document.createElement('div')
  container.style.position = 'fixed'
  container.style.left = '0'
  container.style.top = '0'
  container.style.pointerEvents = 'none'
  container.style.zIndex = '9999'
  document.body.appendChild(container)

  const particles: HTMLElement[] = []
  for (let i = 0; i < particleCount; i++) {
    const p = document.createElement('div')
    const size = 6 + Math.random() * 6
    p.style.position = 'absolute'
    p.style.left = `${originX}px`
    p.style.top = `${originY}px`
    p.style.width = `${size}px`
    p.style.height = `${size}px`
    p.style.borderRadius = '9999px'
    p.style.background = colors[i % colors.length]
    p.style.opacity = '0'
    container.appendChild(p)
    particles.push(p)
  }

  particles.forEach((p, i) => {
    const angle = (i / particleCount) * Math.PI * 2 + Math.random() * 0.4
    const distance = 70 + Math.random() * 60
    gsap.fromTo(
      p,
      { x: 0, y: 0, opacity: 1, scale: 0.5 },
      {
        x: Math.cos(angle) * distance,
        y: Math.sin(angle) * distance - 20,
        opacity: 0,
        scale: 1,
        duration: 0.7 + Math.random() * 0.3,
        ease: 'power2.out',
      }
    )
  })

  gsap.delayedCall(1.1, () => container.remove())
}

/** Smoothly tweens a numeric progress value (0-100) — used for timers/progress bars. */
export function tweenProgress(state: { value: number }, to: number, duration = 1) {
  gsap.to(state, { value: to, duration, ease: 'linear' })
}
