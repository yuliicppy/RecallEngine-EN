"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";

export default function HomePage() {
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    supabase.auth.getSession().then(({ data }) => {
      if (mounted) {
        setEmail(data.session?.user.email ?? null);
      }
    });
    const { data: subscription } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setEmail(session?.user.email ?? null);
      }
    );
    return () => {
      mounted = false;
      subscription.subscription.unsubscribe();
    };
  }, []);

  return (
    <div className="stack">
      <h1>RecallEngine-EN</h1>
      <p>英会話のための間隔反復 + AI会話練習プロトタイプ</p>

      <div className="card">
        {email ? (
          <div className="stack">
            <div>ログイン中: {email}</div>
            <div className="nav">
              <Link className="button" href="/cards">
                カード管理
              </Link>
              <Link className="button" href="/review">
                復習
              </Link>
              <Link className="button" href="/chat">
                AI会話
              </Link>
              <button
                className="button secondary"
                onClick={() => supabase.auth.signOut()}
              >
                ログアウト
              </button>
            </div>
          </div>
        ) : (
          <div className="stack">
            <div>ログインしてください</div>
            <Link className="button" href="/login">
              ログイン / サインアップ
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
