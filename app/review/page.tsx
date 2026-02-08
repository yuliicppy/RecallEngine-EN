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
  const [answer, setAnswer] = useState("");
  const [feedback, setFeedback] = useState<string | null>(null);
  const [checking, setChecking] = useState(false);
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
    setAnswer("");
    setFeedback(null);
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

  const checkAnswer = async () => {
    if (!current || !answer.trim()) return;
    setChecking(true);
    setMessage(null);
    const { data: session } = await supabase.auth.getSession();
    const token = session.session?.access_token;
    if (!token) {
      setMessage("ログインしてください");
      setChecking(false);
      return;
    }

    const res = await fetch("/api/review/feedback", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ cardId: current.id, answer })
    });

    if (!res.ok) {
      setMessage("AIチェックに失敗しました");
      setChecking(false);
      return;
    }

    const data = (await res.json()) as { feedback: string };
    setFeedback(data.feedback || "フィードバックがありません");
    setChecking(false);
  };

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
          <div>日本語: <strong>{current.back}</strong></div>
          <label>
            英訳
            <textarea
              rows={3}
              value={answer}
              onChange={(event) => setAnswer(event.target.value)}
            />
          </label>
          <div className="row">
            <button className="button" onClick={checkAnswer} disabled={checking}>
              AIチェック
            </button>
          </div>
          {feedback && (
            <div className="card">
              <div>AIフィードバック</div>
              <div>{feedback}</div>
            </div>
          )}
          {feedback && (
            <div className="row">
              <button className="button" onClick={() => submitRating(4)}>
                正解
              </button>
              <button className="button secondary" onClick={() => submitRating(2)}>
                不正解
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
