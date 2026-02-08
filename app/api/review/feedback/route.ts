import { NextResponse } from "next/server";
import OpenAI from "openai";
import { prisma } from "@/lib/prisma";
import { getUserFromRequest } from "@/lib/auth";

const apiKey = process.env.OPENAI_API_KEY;
const model = process.env.OPENAI_MODEL || "gpt-4o-mini";

export async function POST(request: Request) {
  const user = await getUserFromRequest(request);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!apiKey) {
    return NextResponse.json({ error: "OPENAI_API_KEY is missing" }, { status: 500 });
  }

  const body = (await request.json()) as { cardId?: string; answer?: string };
  if (!body.cardId || !body.answer) {
    return NextResponse.json({ error: "cardId and answer are required" }, { status: 400 });
  }

  const card = await prisma.card.findFirst({
    where: { id: body.cardId, userId: user.id }
  });

  if (!card) {
    return NextResponse.json({ error: "Card not found" }, { status: 404 });
  }

  const client = new OpenAI({ apiKey });
  const response = await client.responses.create({
    model,
    input: [
      {
        role: "system",
        content:
          "You are an English teacher. The user translates Japanese into English. Provide brief feedback in Japanese: correctness, if incorrect show a better translation, and one short tip."
      },
      {
        role: "user",
        content: `日本語: ${card.back}\nユーザーの英訳: ${body.answer}`
      }
    ]
  });

  const feedback = response.output_text?.trim() || "";
  return NextResponse.json({ feedback });
}
