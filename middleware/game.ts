export default defineNuxtRouteMiddleware((to) => {
  // Only run on client side
  if (process.server) return

  // Check if navigating to a game page
  if (to.path.startsWith('/game/')) {
    const gameStore = useGameStore()
    
    // Load game state
    gameStore.loadFromLocalStorage()
    
    // If no players or setup data, redirect to setup
    if (gameStore.players.length === 0 || !gameStore.selectedGame) {
      return navigateTo('/setup')
    }
    
    // Ensure selected game matches route
    const gameName = to.path.split('/').pop()
    if (gameStore.selectedGame !== gameName) {
      gameStore.setSelectedGame(gameName as any)
    }
  }
})






