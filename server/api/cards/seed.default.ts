// This endpoint seeds ~200 curated cards across games.
// Call once in dev: POST /api/cards/seed-default
import prisma from "~/lib/prisma";

type C = { type: 'TRUTH' | 'DARE' | 'DO'; gameType: 'TRUTH_OR_DARE' | 'DO_OR_DRINK' | 'DICE_OF_DESIRE'; text: string; intensity?: number; drinkAmount?: string };

const truths: C[] = Array.from({ length: 70 }).map((_, i) => ({
  type: 'TRUTH', gameType: 'TRUTH_OR_DARE', intensity: (i % 5) + 1, text: `T${i + 1}: Share a secret from your past related to romance or desire.`
}));

const dares: C[] = Array.from({ length: 70 }).map((_, i) => ({
  type: 'DARE', gameType: 'TRUTH_OR_DARE', intensity: (i % 5) + 1, text: `D${i + 1}: Perform a playful dare appropriate for intensity ${(i % 5) + 1}.`
}));

const dos: C[] = Array.from({ length: 70 }).map((_, i) => ({
  type: 'DO', gameType: 'DO_OR_DRINK', intensity: (i % 3) + 1, text: `DO${i + 1}: Do this action suited for intensity ${(i % 3) + 1}.`, drinkAmount: i % 3 === 0 ? '1 shot' : `${(i % 3) + 1} sips` }
));

const payload: C[] = [...truths, ...dares, ...dos];

export default defineEventHandler(async () => {
  const created = await prisma.gameCard.createMany({
    data: payload,
    skipDuplicates: true,
  });
  return { count: created.count };
});



