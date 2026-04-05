# 実装タスク一覧

優先度・依存関係順に並べた実装タスク。上から順に着手する。

---

## Phase 1: プロジェクト基盤セットアップ

### T-01: Next.js プロジェクト初期化
- `create-next-app` でNext.js 15 + TypeScript + Tailwind CSSプロジェクト作成
- App Router有効化
- ESLint / Prettier 設定
- 成果物: 動作する空のNext.jsプロジェクト

### T-02: Supabase プロジェクト作成・環境変数設定
- Supabaseダッシュボードでプロジェクト作成
- `.env.local` に環境変数設定（`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`）
- `.env.local` を `.gitignore` に追加
- 成果物: Supabase接続設定済みの環境

### T-03: Supabase クライアント初期化
- `@supabase/supabase-js` `@supabase/ssr` インストール
- `lib/supabase/client.ts` (Browser用)
- `lib/supabase/server.ts` (Server Component用)
- 成果物: 2種類のSupabaseクライアント

### T-04: ルート保護設定
- `app/(dashboard)/layout.tsx` でサーバーサイド認証チェック
- 未認証時 `/login` へリダイレクト
- 成果物: ルート保護機能
- 備考: Vercel Edge Runtimeとの互換性問題により、Next.js Middlewareは使用せずレイアウトで認証ガードを実装

---

## Phase 2: データベース構築

### T-05: Supabase マイグレーション作成（テーブル）
依存: T-02

以下のテーブルを作成するSQLマイグレーションを `supabase/migrations/` に作成:
- `profiles`
- `customers`
- `exercises`
- `training_sessions`
- `training_session_exercises`
- `training_sets`

成果物: `supabase/migrations/001_create_tables.sql`

### T-06: マイグレーション作成（トリガー・関数）
依存: T-05

- `update_updated_at_column()` 関数と各テーブルへのトリガー
- `handle_new_user()` 関数と `on_auth_user_created` トリガー

成果物: `supabase/migrations/002_create_triggers.sql`

### T-07: マイグレーション作成（RLSポリシー・インデックス）
依存: T-05

- 全テーブルの `ALTER TABLE ... ENABLE ROW LEVEL SECURITY`
- 各テーブルのRLSポリシー（data-model.md参照）
- インデックス作成

成果物: `supabase/migrations/003_rls_and_indexes.sql`

### T-08: マイグレーションのSupabaseへの適用
依存: T-05, T-06, T-07

- Supabase SQLエディタまたは CLIでマイグレーション実行
- 動作確認（テーブル・RLS・トリガーの存在確認）

### T-09: 型定義の生成
依存: T-08

- Supabase CLIで TypeScript型を自動生成
- `lib/types/supabase.ts` として保存
- アプリ全体で使用する共通型として活用

成果物: `lib/types/supabase.ts`

---

## Phase 3: 認証機能

### T-10: ログイン画面（SCR-01）実装
依存: T-03, T-04

- `app/(auth)/login/page.tsx` 作成
- メール/パスワードフォーム
- Supabase Authでのサインイン処理
- エラーハンドリング・リダイレクト処理
- 成果物: 動作するログイン画面

### T-11: ログアウト機能実装
依存: T-10

- ログアウトServer Action or APIルート
- ナビゲーション内のログアウトボタン
- 成果物: ログアウト機能

---

## Phase 4: 共通レイアウト・ナビゲーション

### T-12: ダッシュボードレイアウト実装
依存: T-10

- `app/(dashboard)/layout.tsx` 作成
- ヘッダー（ロゴ・ログアウトボタン）
- ボトムナビゲーション（モバイル向け: ダッシュボード・顧客・種目）
- 成果物: 認証済みエリアの共通レイアウト

---

## Phase 5: 顧客管理機能

### T-13: 顧客一覧画面（SCR-03）実装
依存: T-09, T-12

- `app/(dashboard)/customers/page.tsx`
- Supabaseから顧客一覧を取得・表示（Server Component）
- 顧客カードコンポーネント
- 検索フィルタ（Client Component）
- 「新規顧客登録」ボタン

### T-14: 顧客登録画面（SCR-04）実装
依存: T-13

- `app/(dashboard)/customers/new/page.tsx`
- 顧客登録フォーム（氏名・ニックネーム・メモ）
- Server Actionで`customers`テーブルに挿入
- バリデーション・エラーハンドリング

### T-15: 顧客詳細・履歴画面（SCR-05）実装
依存: T-13

- `app/(dashboard)/customers/[id]/page.tsx`
- 顧客情報表示
- セッション履歴一覧（`training_sessions` JOIN `profiles`）
- 「セッション開始」ボタン
- 「顧客情報編集」ボタン

### T-16: 顧客編集・削除機能（SCR-06）実装
依存: T-15

- `app/(dashboard)/customers/[id]/edit/page.tsx`
- 編集フォーム（SCR-04と同様）
- 削除確認ダイアログ
- Server Actionで更新・削除処理

---

## Phase 6: 種目マスタ管理

### T-17: 種目マスタ管理画面（SCR-09）実装
依存: T-09, T-12

- `app/(dashboard)/exercises/page.tsx`
- 種目一覧（カテゴリ別表示）
- 種目追加フォーム（インラインまたはモーダル）
- 種目編集・削除機能
- Server Actionで CRUD処理

---

## Phase 7: トレーニングセッション機能（コア機能）

### T-18: セッション作成画面（SCR-07）実装
依存: T-15, T-17

- `app/(dashboard)/sessions/new/page.tsx`
- 顧客セレクト（URLパラメータで事前選択対応）
- 日付ピッカー（デフォルト: 今日）
- セッションメモ入力
- Server Actionで`training_sessions`に挿入 → セッション詳細画面へリダイレクト

### T-19: セッション詳細・記録画面（SCR-08）実装
依存: T-18

メインの実装タスク。以下を含む:

**T-19a: セッション情報表示**
- セッション基本情報（日付・顧客名・担当トレーナー・メモ）
- セッション完了ステータス表示

**T-19b: 種目追加機能**
- 「種目を追加」ボタン
- 種目選択モーダル（マスタ一覧 + フリーテキスト入力）
- `training_session_exercises`への挿入

**T-19c: セット記録UI**
- 各種目の下にセット入力行を展開
- 重量・回数・メモのインライン入力
- 「セット追加」ボタン
- セット削除ボタン
- 入力値の即時保存（`training_sets`のUPSERT）

**T-19d: セッション完了処理**
- 「セッション完了」ボタン
- `training_sessions.status`を`completed`に更新
- 顧客詳細画面へリダイレクト

### T-20: ダッシュボード画面（SCR-02）実装
依存: T-19

- `app/(dashboard)/page.tsx`
- 直近5件のセッション一覧
- 「新規セッション開始」クイックアクション
- 顧客一覧へのリンク

---

## Phase 8: 品質・仕上げ

### T-21: ローディング・エラー状態の実装
依存: T-13〜T-20

- `loading.tsx` の各ルートへの追加（スケルトンUI）
- `error.tsx` の各ルートへの追加
- Server Actionのエラーハンドリング統一

### T-22: レスポンシブ・モバイル最適化
依存: T-13〜T-20

- 全画面のスマートフォン表示確認
- タップターゲット44px確保
- 入力フォームのモバイルキーボード最適化（`inputMode`属性など）

### T-23: シードデータ作成
依存: T-08

- 開発・デモ用のサンプルデータSQL
- 種目マスタ（基本的な種目一覧）
- テストトレーナーアカウント

**アカウント管理方針**
- トレーナーアカウントはSupabaseダッシュボードの Authentication > Users から管理者が手動で作成する
- アプリ内にサインアップ画面は作らない
- Supabase Auth の Email confirmation を disabled に設定すること（Supabase ダッシュボード: Authentication > Providers > Email > Confirm email をオフ）

成果物: `supabase/seed.sql`

---

## 実装優先度まとめ

| フェーズ | タスク | 優先度 |
|---------|--------|--------|
| Phase 1 | T-01〜T-04 | 最高（着手前提） |
| Phase 2 | T-05〜T-09 | 最高（DB基盤） |
| Phase 3 | T-10〜T-11 | 高（認証） |
| Phase 4 | T-12 | 高（レイアウト） |
| Phase 5 | T-13〜T-16 | 高（顧客管理） |
| Phase 6 | T-17 | 中（種目マスタ） |
| Phase 7 | T-18〜T-20 | 最高（コア機能） |
| Phase 8 | T-21〜T-23 | 中（仕上げ） |

---

## 将来タスク（MVPスコープ外）

- T-F01: 顧客ロールの追加（`auth.users`と`customers`の紐付け）
- T-F02: 顧客向けログイン画面・マイページ
- T-F03: 体組成記録機能（体重・体脂肪率）
- T-F04: トレーニングプランの事前作成機能
- T-F05: 統計・進捗グラフ表示
- T-F06: PWA対応（オフライン記録）
