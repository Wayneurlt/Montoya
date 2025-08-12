export function useCardsApi() {
  const nextCard = async (payload: {
    sessionCode?: string;
    gameType: 'TRUTH_OR_DARE' | 'DO_OR_DRINK' | 'DICE_OF_DESIRE';
    cardType: 'TRUTH' | 'DARE' | 'DO';
    intensity?: number;
  }) => {
    return await $fetch('/api/cards/next', { method: 'POST', body: payload });
  };

  const seedCards = async (cards: Array<{ type: 'TRUTH' | 'DARE' | 'DO'; gameType: 'TRUTH_OR_DARE' | 'DO_OR_DRINK' | 'DICE_OF_DESIRE'; text: string; intensity?: number; drinkAmount?: string }>) => {
    return await $fetch('/api/cards/seed', { method: 'POST', body: { cards } });
  };

  const wildcard = async (gameType: 'TRUTH_OR_DARE' | 'DO_OR_DRINK' | 'DICE_OF_DESIRE') => {
    return await $fetch('/api/cards/wildcard', { method: 'POST', body: { gameType } });
  };

  return { nextCard, seedCards, wildcard };
}



