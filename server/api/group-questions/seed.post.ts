import prisma from "~/lib/prisma";

export default defineEventHandler(async (event) => {
  const body = await readBody<{
    questions: Array<{ gameType: "NEVER_HAVE_I_EVER" | "MOST_LIKELY_TO" | "WOULD_YOU_RATHER"; text: string; intensity?: number; isActive?: boolean }>;
  }>(event);

  if (!body?.questions?.length) {
    throw createError({ statusCode: 400, statusMessage: "No questions provided" });
  }

  const created = await prisma.groupGameQuestion.createMany({
    data: body.questions.map((q) => ({
      gameType: q.gameType,
      text: q.text.trim(),
      intensity: q.intensity ?? 1,
      isActive: q.isActive ?? true,
    })),
    skipDuplicates: true,
  });

  return { inserted: created.count };
});



