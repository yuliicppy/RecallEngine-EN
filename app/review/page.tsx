"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";

type ReviewCard = {
  id: string;
  front: string;
  back: string;
};

export default function ReviewPage() {
  const [cards, setCards] = useState<ReviewCard[]>([]);
  const [showAnswer, setShowAnswer] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const loadDue = async () => {
    const { data: session } = await supabase.auth.getSession();
    const token = session.session?.access_token;
    if (!token) {
      setMessage("ログインしてください");
      return;
    }
    const res = await fetch("/api/review", {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (!res.ok) {
      setMessage("復習データの取得に失敗しました");
      return;
    }
    const data = (await res.json()) as ReviewCard[];
    setCards(data);
    setShowAnswer(false);
  };

  useEffect(() => {
    loadDue();
  }, []);

  const submitRating = async (rating: number) => {
    const current = cards[0];
    if (!current) return;

    const { data: session } = await supabase.auth.getSession();
    const token = session.session?.access_token;
    if (!token) {
      setMessage("ログインしてください");
      return;
    }

    const res = await fetch("/api/review", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ cardId: current.id, rating })
    });

    if (!res.ok) {
      setMessage("更新に失敗しました");
      return;
    }

    await loadDue();
  };

  const current = cards[0];

  return (
    <div className="stack">
      <div className="nav">
        <Link href="/" className="button secondary">
          戻る
        </Link>
      </div>
      <h1>復習</h1>

      {message && <div>{message}</div>}

      {!current && <div>復習対象はありません</div>}

      {current && (
        <div className="card stack">
          <div><strong>{current.front}</strong></div>
          {showAnswer ? <div>{current.back}</div> : <div>答えを見る</div>}
          <div className="row">
            {!showAnswer ? (
              <button className="button" onClick={() => setShowAnswer(true)}>
                表示
              </button>
            ) : (
              [0, 1, 2, 3, 4, 5].map((rating) => (
                <button
                  key={rating}
                  className="button"
                  onClick={() => submitRating(rating)}
                >
                  {rating}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
