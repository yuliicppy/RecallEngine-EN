"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";

type Card = {
  id: string;
  front: string;
  back: string;
  notes?: string | null;
  nextReviewAt: string;
};

export default function CardsPage() {
  const [cards, setCards] = useState<Card[]>([]);
  const [front, setFront] = useState("");
  const [back, setBack] = useState("");
  const [notes, setNotes] = useState("");
  const [message, setMessage] = useState<string | null>(null);

  const loadCards = async () => {
    const { data: session } = await supabase.auth.getSession();
    const token = session.session?.access_token;
    if (!token) {
      setMessage("ログインしてください");
      return;
    }
    const res = await fetch("/api/cards", {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (!res.ok) {
      setMessage("カードの取得に失敗しました");
      return;
    }
    const data = (await res.json()) as Card[];
    setCards(data);
  };

  useEffect(() => {
    loadCards();
  }, []);

  const addCard = async () => {
    setMessage(null);
    const { data: session } = await supabase.auth.getSession();
    const token = session.session?.access_token;
    if (!token) {
      setMessage("ログインしてください");
      return;
    }
    const res = await fetch("/api/cards", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ front, back, notes })
    });
    if (!res.ok) {
      setMessage("カードの作成に失敗しました");
      return;
    }
    setFront("");
    setBack("");
    setNotes("");
    await loadCards();
  };

  return (
    <div className="stack">
      <div className="nav">
        <Link href="/" className="button secondary">
          戻る
        </Link>
      </div>
      <h1>カード管理</h1>

      <div className="card stack">
        <label>
          表（英語）
          <input
            className="input"
            value={front}
            onChange={(event) => setFront(event.target.value)}
          />
        </label>
        <label>
          裏（意味・訳）
          <input
            className="input"
            value={back}
            onChange={(event) => setBack(event.target.value)}
          />
        </label>
        <label>
          メモ
          <textarea
            rows={3}
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
          />
        </label>
        <button className="button" onClick={addCard}>
          追加
        </button>
        {message && <div>{message}</div>}
      </div>

      <div className="stack">
        {cards.map((card) => (
          <div className="card" key={card.id}>
            <div><strong>{card.front}</strong></div>
            <div>{card.back}</div>
            {card.notes && <div>メモ: {card.notes}</div>}
            <div>次回復習: {new Date(card.nextReviewAt).toLocaleString()}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
