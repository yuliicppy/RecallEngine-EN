import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserFromRequest } from "@/lib/auth";
import { applySm2 } from "@/lib/sm2";

export async function GET(request: Request) {
  const user = await getUserFromRequest(request);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = new Date();
  const cards = await prisma.card.findMany({
    where: {
      userId: user.id,
      nextReviewAt: { lte: now }
    },
    orderBy: { nextReviewAt: "asc" },
    take: 20
  });

  return NextResponse.json(
    cards.map((card) => ({
      id: card.id,
      front: card.front,
      back: card.back
    }))
  );
}

export async function POST(request: Request) {
  const user = await getUserFromRequest(request);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json()) as { cardId?: string; rating?: number };
  if (!body.cardId || typeof body.rating !== "number") {
    return NextResponse.json({ error: "cardId and rating are required" }, { status: 400 });
  }

  const card = await prisma.card.findFirst({
    where: { id: body.cardId, userId: user.id }
  });

  if (!card) {
    return NextResponse.json({ error: "Card not found" }, { status: 404 });
  }

  const now = new Date();
  const next = applySm2(
    {
      easeFactor: card.easeFactor,
      intervalDays: card.intervalDays,
      repetitions: card.repetitions
    },
    body.rating,
    now
  );

  await prisma.$transaction([
    prisma.card.update({
      where: { id: card.id },
      data: {
        easeFactor: next.easeFactor,
        intervalDays: next.intervalDays,
        repetitions: next.repetitions,
        nextReviewAt: next.nextReviewAt,
        lastReviewedAt: now
      }
    }),
    prisma.reviewLog.create({
      data: {
        userId: user.id,
        cardId: card.id,
        rating: body.rating
      }
    })
  ]);

  return NextResponse.json({ ok: true });
}
