import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserFromRequest } from "@/lib/auth";

export async function GET(request: Request) {
  const user = await getUserFromRequest(request);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await prisma.user.upsert({
    where: { id: user.id },
    update: { email: user.email ?? undefined },
    create: { id: user.id, email: user.email ?? undefined }
  });

  const cards = await prisma.card.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" }
  });

  return NextResponse.json(cards);
}

export async function POST(request: Request) {
  const user = await getUserFromRequest(request);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json()) as {
    front?: string;
    back?: string;
    notes?: string;
  };

  if (!body.front || !body.back) {
    return NextResponse.json({ error: "front and back are required" }, { status: 400 });
  }

  await prisma.user.upsert({
    where: { id: user.id },
    update: { email: user.email ?? undefined },
    create: { id: user.id, email: user.email ?? undefined }
  });

  const card = await prisma.card.create({
    data: {
      userId: user.id,
      front: body.front,
      back: body.back,
      notes: body.notes
    }
  });

  return NextResponse.json(card, { status: 201 });
}
