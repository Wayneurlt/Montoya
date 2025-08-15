import prisma from "~/lib/prisma";

export default defineEventHandler(async (event) => {
  const body = await readBody<{
    gameType: "NEVER_HAVE_I_EVER" | "MOST_LIKELY_TO" | "WOULD_YOU_RATHER";
    intensity?: number; // 1-3
    sessionCode?: string; // optional session code for per-session de-duplication
  }>(event);

  const { gameType, intensity, sessionCode } = body || {};
  if (!gameType) throw createError({ statusCode: 400, statusMessage: "Missing gameType" });

  // Resolve session if provided
  let session: any = null;
  if (sessionCode) {
    session = await prisma.gameSession.findUnique({ where: { code: sessionCode } });
  }

  // Build base filter
  const where: any = {
    gameType,
    isActive: true,
    ...(intensity ? { intensity } : {}),
  };

  // Exclude already used questions in this session
  let excludeIds: number[] = [];
  if (session) {
    const used = await prisma.sessionGroupQuestionUsage.findMany({
      where: { gameSessionId: session.id },
      select: { questionId: true },
    });
    excludeIds = used.map((u) => u.questionId);
  }

  // Count remaining
  const remainingCount = await prisma.groupGameQuestion.count({
    where: {
      ...where,
      id: excludeIds.length > 0 ? { notIn: excludeIds } : undefined,
    },
  });

  if (session && remainingCount === 0) {
    // reset usage for this session
    await prisma.sessionGroupQuestionUsage.deleteMany({ where: { gameSessionId: session.id } });
  }

  // Pick next question: prioritize least used, then oldest lastUsed
  const question = await prisma.groupGameQuestion.findFirst({
    where: {
      ...where,
      id: session && excludeIds.length > 0 ? { notIn: excludeIds } : undefined,
    },
    orderBy: [
      { timesUsed: "asc" },
      { lastUsed: "asc" },
      { id: "asc" },
    ],
  });

  if (!question) return null;

  // Update global usage
  await prisma.groupGameQuestion.update({
    where: { id: question.id },
    data: { timesUsed: { increment: 1 }, lastUsed: new Date() },
  });

  // Mark session usage
  if (session) {
    await prisma.sessionGroupQuestionUsage.upsert({
      where: {
        gameSessionId_questionId: { gameSessionId: session.id, questionId: question.id },
      },
      create: { gameSessionId: session.id, questionId: question.id },
      update: {},
    });
  }

  return question;
});



