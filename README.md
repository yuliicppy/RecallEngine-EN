# RecallEngine-EN

英会話力の向上を目的に、**忘却曲線（間隔反復）**と**AI会話練習**を組み合わせた個人向け学習Webアプリ。

## 目的
- 英会話の練習を効率的に継続できるようにする
- 忘却曲線に沿った復習で学習効率を最大化する
- オープンソースで公開し、**利用者は各自のAPIキー**で動かせる形にする
- 外出先でも使えるように軽量クラウド運用に対応する

## 方針
- **主な利用者**: 作者本人（個人利用）
- **コードは公開**: 各自のAPIキーを設定すれば利用可能
- **認証必須**: デプロイ後もログインがないと利用できない構成にする

## 推奨技術スタック（MVP）
- **Frontend**: Next.js
- **Backend**: Next.js API Routes（初期は簡単に）
- **DB**: PostgreSQL
- **ORM**: Prisma
- **Auth**: Supabase Auth（代替として NextAuth も可）
- **AI API**: OpenAI（BYOK: Bring Your Own Key）
- **Hosting**: Vercel（フロント/API） + Supabase（DB/Auth）
- **スケジューリング**: まずはDB＋cron、必要なら Redis + BullMQ に移行

## MVP機能
- 単語・フレーズ・会話カード管理
- 間隔反復（SM-2）による復習スケジューリング
- AIとの会話練習（ロールプレイ）
- 回答へのフィードバック（訂正・改善提案）

## セキュリティとAPIキー方針
- **APIキーはブラウザに置かない**
- API呼び出しは必ずサーバー側で実行
- `.env`はコミットしない（`.env.example`のみ用意）

## デプロイ方針
- まずはローカルで素早く試作
- 外出先で使うため **Vercel** にデプロイ
- **認証を最初から導入**して、URLが知られても使えないようにする

## 決定済み事項
- **テキスト中心**で開始し、音声機能は後から追加
- **SM-2**を初期の間隔反復アルゴリズムとして採用
- **単一ユーザー運用**を想定しつつ、**将来の複数ユーザーにも対応できる設計**にする

## 実行手順（ローカル）
1. 依存関係をインストール
```bash
npm install
```
2. `.env` を作成して環境変数を設定（`.env.example`参照）
```bash
cp .env.example .env
```
3. Prisma を初期化
```bash
npx prisma generate
npx prisma migrate dev --name init
```
4. 開発サーバーを起動
```bash
npm run dev
```
5. ブラウザで `http://localhost:3000` を開く

## ライセンス
MIT
