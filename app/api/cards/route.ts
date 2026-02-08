import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserFromRequest } from "@/lib/auth";
import OpenAI from "openai";

const apiKey = process.env.OPENAI_API_KEY;
const model = process.env.OPENAI_MODEL || "gpt-4o-mini";

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
    notes?: string;
  };

  if (!body.front) {
    return NextResponse.json({ error: "front is required" }, { status: 400 });
  }

  if (!apiKey) {
    return NextResponse.json({ error: "OPENAI_API_KEY is missing" }, { status: 500 });
  }

  await prisma.user.upsert({
    where: { id: user.id },
    update: { email: user.email ?? undefined },
    create: { id: user.id, email: user.email ?? undefined }
  });

  const client = new OpenAI({ apiKey });
  const response = await client.responses.create({
    model,
    input: [
      {
        role: "system",
        content: "Translate the following English sentence into natural Japanese. Output only the Japanese translation."
      },
      { role: "user", content: body.front }
    ]
  });

  const back = response.output_text?.trim() || "";
  if (!back) {
    return NextResponse.json({ error: "Failed to generate translation" }, { status: 500 });
  }

  const card = await prisma.card.create({
    data: {
      userId: user.id,
      front: body.front,
      back,
      notes: body.notes
    }
  });

  return NextResponse.json(card, { status: 201 });
}
