import prisma from "~/lib/prisma";

export default defineEventHandler(async (event) => {
  const body = await readBody<{
    gameType: "TRUTH_OR_DARE" | "DICE_OF_DESIRE" | "DO_OR_DRINK";
    cardType: "TRUTH" | "DARE" | "DO";
    intensity?: number; // 1-5 for TOD, 1-3 for Do or Drink
    sessionCode?: string; // For per-session usage tracking
  }>(event);

  const { gameType, cardType, intensity = 1, sessionCode } = body || {};

  if (!gameType || !cardType) {
    throw createError({ statusCode: 400, statusMessage: "Missing gameType or cardType" });
  }

  // Resolve session
  let session: any = null;
  if (sessionCode) {
    session = await prisma.gameSession.findUnique({ where: { code: sessionCode } });
  }

  // Build where clause and exclude cards already used in this session
  const whereBase: any = {
    gameType,
    type: cardType,
    intensity,
  };

  let excludeIds: number[] = [];
  if (session) {
    const used = await prisma.sessionCardUsage.findMany({
      where: { gameSessionId: session.id },
      select: { cardId: true },
    });
    excludeIds = used.map((u) => u.cardId);
  }

  // Total remaining not used
  const remainingCount = await prisma.gameCard.count({
    where: {
      ...whereBase,
      id: excludeIds.length > 0 ? { notIn: excludeIds } : undefined,
    },
  });

  // If no remaining, reset usage for session (delete rows) and retry
  if (session && remainingCount === 0) {
    await prisma.sessionCardUsage.deleteMany({ where: { gameSessionId: session.id } });
  }

  // Select next card prioritizing least-used globally, then oldest lastUsed
  const card = await prisma.gameCard.findFirst({
    where: {
      ...whereBase,
      id: session && excludeIds.length > 0 ? { notIn: excludeIds } : undefined,
    },
    orderBy: [
      { timesUsed: "asc" },
      { lastUsed: "asc" },
      { id: "asc" },
    ],
  });

  if (!card) return null;

  // mark usage
  await prisma.gameCard.update({
    where: { id: card.id },
    data: { timesUsed: { increment: 1 }, lastUsed: new Date() },
  });

  if (session) {
    await prisma.sessionCardUsage.upsert({
      where: { gameSessionId_cardId: { gameSessionId: session.id, cardId: card.id } },
      create: { gameSessionId: session.id, cardId: card.id },
      update: {},
    });
  }

  return card;
});


