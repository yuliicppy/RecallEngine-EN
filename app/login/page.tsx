"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState<string | null>(null);

  const signIn = async () => {
    setMessage(null);
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    if (error) {
      setMessage(error.message);
      return;
    }
    router.push("/");
  };

  const signUp = async () => {
    setMessage(null);
    const { error } = await supabase.auth.signUp({
      email,
      password
    });
    if (error) {
      setMessage(error.message);
      return;
    }
    setMessage("確認メールを送信しました。メールを確認してからログインしてください。");
  };

  return (
    <div className="stack">
      <h1>ログイン / サインアップ</h1>
      <div className="card stack">
        <label>
          メールアドレス
          <input
            className="input"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
        </label>
        <label>
          パスワード
          <input
            className="input"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
        </label>
        <div className="row">
          <button className="button" onClick={signIn}>
            ログイン
          </button>
          <button className="button secondary" onClick={signUp}>
            サインアップ
          </button>
        </div>
        {message && <div>{message}</div>}
      </div>
    </div>
  );
}
