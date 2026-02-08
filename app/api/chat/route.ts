import { NextResponse } from "next/server";
import OpenAI from "openai";
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

  const body = (await request.json()) as {
    messages?: { role: "user" | "assistant" | "system"; content: string }[];
  };

  if (!body.messages || body.messages.length === 0) {
    return NextResponse.json({ error: "messages are required" }, { status: 400 });
  }

  const client = new OpenAI({ apiKey });
  const response = await client.responses.create({
    model,
    input: body.messages.map((message) => ({
      role: message.role,
      content: message.content
    }))
  });

  const output = response.output_text || "";
  return NextResponse.json({ message: { role: "assistant", content: output } });
}
