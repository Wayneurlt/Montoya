import { ref, watch } from 'vue'
import type { useMultiplayer } from '~/composables/useMultiplayer'

/**
 * Derives hasVoted/myVote from the shared multiplayer room state, and resets
 * them whenever a new question comes in. Used by the voting-style games
 * (Never Have I Ever, Would You Rather, Most Likely To).
 *
 * hasVoted/myVote are returned as plain refs (not readonly) so a caller can
 * still set them optimistically before the server echoes the vote back —
 * the watcher below will simply confirm (or correct) that value once
 * `multiplayer.votes` updates.
 */
export function useMultiplayerVoting(multiplayer: ReturnType<typeof useMultiplayer>) {
  const hasVoted = ref(false)
  const myVote = ref<string | null>(null)

  // Watch for vote updates to check if we've voted
  watch(
    () => [multiplayer.votes.value, multiplayer.myPlayer.value] as const,
    ([newVotes, myPlayer]) => {
      if (myPlayer && newVotes) {
        const myVoteData = newVotes.find((v: any) => v.socketId === myPlayer.socketId)
        if (myVoteData) {
          hasVoted.value = true
          myVote.value = myVoteData.vote
        } else {
          hasVoted.value = false
          myVote.value = null
        }
      }
    },
    { immediate: true }
  )

  // Reset vote status when a new question starts
  watch(
    () => multiplayer.roomState.value.currentPrompt,
    () => {
      hasVoted.value = false
      myVote.value = null
    }
  )

  const submitVote = (vote: any) => {
    multiplayer.submitVote(vote)
  }

  return {
    hasVoted,
    myVote,
    submitVote,
  }
}
