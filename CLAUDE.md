# CLAUDE.md

## プロジェクト概要

ジムトレーナーが顧客のトレーニングを記録・管理するWebアプリ。
トレーナーが顧客と一緒にアプリを見ながら、その日のトレーニング内容をリアルタイムで記録する。

## 技術スタック

| 領域 | 技術 |
|------|------|
| フロントエンド | Next.js 15 (App Router), TypeScript, Tailwind CSS |
| バックエンド/DB | Supabase (PostgreSQL + Auth + RLS) |
| DBクライアント | @supabase/supabase-js（Prisma不使用） |
| デプロイ | Vercel |

## ディレクトリ構成

```
/
├── app/                    # Next.js App Router
│   ├── (auth)/             # 認証不要ルート
│   └── (dashboard)/        # 認証必要ルート（layout.tsxで認証ガード）
├── components/             # 再利用可能UIコンポーネント
├── lib/
│   ├── supabase/           # Supabaseクライアント初期化
│   └── types/              # 共通型定義
├── docs/                   # 設計ドキュメント
└── supabase/
    └── migrations/         # SQLマイグレーションファイル
```

## 開発ルール

### コーディング規約
- TypeScriptの`any`型は使用禁止。型が不明な場合は`unknown`を使う
- Supabaseクエリは必ずエラーハンドリングを行う（`const { data, error } = await ...`）
- Server ComponentとClient Componentを明確に分ける（`"use client"`は最小限）
- 環境変数は`NEXT_PUBLIC_`プレフィックスのルールに従う

### Supabase利用規約
- DBアクセスはすべて@supabase/supabase-jsを使用（Prisma不使用）
- すべてのテーブルにRLSを有効化する
- Server Componentからのアクセスには`createServerClient`を使用
- Client ComponentからのアクセスにはBrowserクライアントを使用

### セキュリティ
- 個人情報（住所・電話・カード情報）は絶対に保存しない
- RLSポリシーで行レベルのアクセス制御を徹底する
- 環境変数をコミットしない（`.env.local`は`.gitignore`対象）

### UI/UX
- **iPhone（iOS Safari）を主要端末**として最適化する。PCでも全機能が動作すること
- トレーニング中の操作を想定し、タップターゲットは最低44px確保
- すべての `<input>` / `<textarea>` のフォントサイズは `16px` 以上（iOS Safariのズーム防止）
- 重量・回数などの数値入力フィールドには `inputMode="numeric"` を付与してテンキーを表示
- ボトムナビゲーション・固定フッターには `env(safe-area-inset-bottom)` のセーフエリア対応を行う
- ローディング状態・エラー状態を必ず実装する

## 無料枠制限への配慮

### Supabase Free Tier
- DBストレージ: 500MB
- 月間アクティブユーザー: 50,000
- 帯域幅: 5GB/月
- → 画像・動画は保存しない。テキストデータのみ

### Vercel Free Tier
- 帯域幅: 100GB/月
- Serverless Function実行時間: 100GB-hrs/月
- → 重い処理はSupabase側（PostgreSQL関数）で行う

## ドキュメント

- [要求仕様](docs/requirements.md)
- [機能仕様](docs/functional-spec.md)
- [データモデル設計](docs/data-model.md)
- [実装タスク一覧](docs/task-list.md)
