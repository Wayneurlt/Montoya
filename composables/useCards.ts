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

  const nextGroupQuestion = async (payload: { gameType: 'NEVER_HAVE_I_EVER' | 'MOST_LIKELY_TO' | 'WOULD_YOU_RATHER'; intensity?: number; sessionCode?: string }) => {
    return await $fetch('/api/group-questions/next', { method: 'POST', body: payload });
  };

  const seedGroupQuestions = async (questions: Array<{ gameType: 'NEVER_HAVE_I_EVER' | 'MOST_LIKELY_TO' | 'WOULD_YOU_RATHER'; text: string; intensity?: number; isActive?: boolean }>) => {
    return await $fetch('/api/group-questions/seed', { method: 'POST', body: { questions } });
  };

  return { nextCard, seedCards, wildcard, nextGroupQuestion, seedGroupQuestions };
}



