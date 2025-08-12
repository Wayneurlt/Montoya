import prisma from "~/lib/prisma";

export default defineEventHandler(async (event) => {
  const body = await readBody<{ cards: Array<{
    type: 'TRUTH' | 'DARE' | 'DO',
    gameType: 'TRUTH_OR_DARE' | 'DO_OR_DRINK' | 'DICE_OF_DESIRE',
    text: string,
    intensity?: number,
    drinkAmount?: string | null,
  }>}>(event);

  if (!body?.cards?.length) {
    throw createError({ statusCode: 400, statusMessage: 'No cards provided' });
  }

  const created = await prisma.gameCard.createMany({
    data: body.cards.map((c) => ({
      type: c.type as any,
      gameType: c.gameType as any,
      text: c.text,
      intensity: c.intensity ?? 1,
      drinkAmount: c.drinkAmount ?? null,
    })),
    skipDuplicates: true,
  });

  return { count: created.count };
});


