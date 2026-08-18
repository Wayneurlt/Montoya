import { ref } from 'vue'
import { push } from 'notivue'
import type { useMultiplayer } from '~/composables/useMultiplayer'

/**
 * Shared "load questions from the database" plumbing used by every multiplayer
 * game that pulls its prompts from an API endpoint (Never Have I Ever, Would
 * You Rather, Most Likely To, Do or Drink, Truth or Dare). Each game hits a
 * different endpoint and shapes its own question tracker, so this composable
 * only owns the generic bits: a loading flag for the initial fetch (so the UI
 * can always show feedback instead of silence), and a host-only isLoading
 * guard for "next question" / "skip question" actions.
 */
export function useMultiplayerQuestions(multiplayer: ReturnType<typeof useMultiplayer>) {
  // True while the initial question pool is being fetched on mount.
  const questionsLoading = ref(false)
  // True while a host-only next/skip action is in flight.
  const isLoading = ref(false)

  const loadInitialQuestions = async (loader: () => Promise<void>) => {
    questionsLoading.value = true
    try {
      await loader()
    } catch (error) {
      console.error('Error loading questions:', error)
    } finally {
      questionsLoading.value = false
    }
  }

  const withHostLoading = async (
    action: () => Promise<{ isRepeat?: boolean } | void> | { isRepeat?: boolean } | void
  ) => {
    if (isLoading.value || !multiplayer.isHost.value) return
    isLoading.value = true
    try {
      const result = await action()
      notifyIfRepeat(result)
    } catch (error) {
      console.error('Error fetching question:', error)
    } finally {
      isLoading.value = false
    }
  }

  // The question tracker silently reshuffles (and may repeat a question) once
  // its pool is exhausted. Surface that as an honest, visible moment instead
  // of a repeat that looks like a bug.
  const notifyIfRepeat = (result?: { isRepeat?: boolean } | null | void) => {
    if (result && (result as any).isRepeat) {
      push.info({
        title: 'Fresh round!',
        message: "You've seen every question — shuffling for a new round.",
        duration: 4000,
      })
    }
  }

  return {
    questionsLoading,
    isLoading,
    loadInitialQuestions,
    withHostLoading,
    notifyIfRepeat,
  }
}

/**
 * Room-scoped repeat-avoidance so a host handoff mid-game doesn't repeat a
 * question a previous host already picked (each device's own tracker only
 * knows its own localStorage history, not what other hosts have shown).
 *
 * `usedPromptKeys` on the room is a flat set of strings shared by every
 * sub-pool a game might have (e.g. truth vs dare, normal vs spicy), so each
 * key is namespaced by a `scope` string identifying which pool an index came
 * from. Only meaningful within one `currentGame` session — the server resets
 * the room's set whenever the game changes.
 */
export function excludedIndicesForScope(usedPromptKeys: readonly string[] | undefined | null, scope: string): number[] {
  const prefix = `${scope}:`
  return (usedPromptKeys || [])
    .filter((k) => k.startsWith(prefix))
    .map((k) => Number(k.slice(prefix.length)))
    .filter((n) => !Number.isNaN(n))
}

export function makeScopedPromptKey(scope: string, index: number): string {
  return `${scope}:${index}`
}
