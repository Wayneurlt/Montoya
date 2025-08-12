import prisma from "~/lib/prisma";

export default defineEventHandler(async (event) => {
  const body = await readBody<{ gameType: 'TRUTH_OR_DARE' | 'DO_OR_DRINK' | 'DICE_OF_DESIRE' }>(event);
  const gameType = body?.gameType || 'TRUTH_OR_DARE';
  // Return a random card disregarding intensity/type balance to surprise players
  const total = await prisma.gameCard.count({ where: { gameType } });
  if (total === 0) return null;
  const skip = Math.floor(Math.random() * total);
  const cards = await prisma.gameCard.findMany({ where: { gameType }, skip, take: 1 });
  return cards[0] || null;
});



