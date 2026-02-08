"use client";

import { useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";

type ChatMessage = {
  role: "user" | "assistant" | "system";
  content: string;
};

export default function ChatPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: "system", content: "You are a friendly English conversation partner." }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sendMessage = async () => {
    if (!input.trim()) return;
    setError(null);
    const newMessages = [...messages, { role: "user", content: input }];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    const { data: session } = await supabase.auth.getSession();
    const token = session.session?.access_token;
    if (!token) {
      setError("ログインしてください");
      setLoading(false);
      return;
    }

    const res = await fetch("/api/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ messages: newMessages })
    });

    if (!res.ok) {
      setError("AI呼び出しに失敗しました");
      setLoading(false);
      return;
    }

    const data = (await res.json()) as { message: ChatMessage };
    setMessages([...newMessages, data.message]);
    setLoading(false);
  };

  return (
    <div className="stack">
      <div className="nav">
        <Link href="/" className="button secondary">
          戻る
        </Link>
      </div>
      <h1>AI会話</h1>

      <div className="card stack">
        {messages
          .filter((m) => m.role !== "system")
          .map((message, index) => (
            <div key={index}>
              <strong>{message.role === "user" ? "You" : "AI"}:</strong> {message.content}
            </div>
          ))}
        {loading && <div>生成中...</div>}
        {error && <div>{error}</div>}
      </div>

      <div className="card stack">
        <textarea
          rows={3}
          value={input}
          onChange={(event) => setInput(event.target.value)}
        />
        <button className="button" onClick={sendMessage} disabled={loading}>
          送信
        </button>
      </div>
    </div>
  );
}
