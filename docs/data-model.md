# データモデル設計

## 1. ER図（概要）

```
auth.users (Supabase管理)
    │
    └──< profiles (1:1)
            │
            └──< training_sessions >──── customers
                        │
                        └──< training_session_exercises >──── exercises
                                    │
                                    └──< training_sets
```

---

## 2. テーブル定義

### `profiles`
Supabaseの`auth.users`と1:1で対応するプロフィールテーブル。ロール管理に使用。

```sql
CREATE TABLE profiles (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role        TEXT NOT NULL DEFAULT 'trainer' CHECK (role IN ('trainer', 'customer')),
  name        TEXT NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

| カラム | 型 | 説明 |
|--------|-----|------|
| id | UUID (PK, FK) | auth.usersのIDと一致 |
| role | TEXT | 'trainer' または 'customer' |
| name | TEXT | 表示名（トレーナー名） |
| created_at | TIMESTAMPTZ | 作成日時 |
| updated_at | TIMESTAMPTZ | 更新日時（トリガーで自動更新） |

---

### `customers`
顧客情報。個人情報最小化のため氏名・ニックネーム・メモのみ保持。

```sql
CREATE TABLE customers (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name         TEXT NOT NULL,
  nickname     TEXT,
  notes        TEXT,
  created_by   UUID NOT NULL REFERENCES profiles(id),
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

| カラム | 型 | 説明 |
|--------|-----|------|
| id | UUID (PK) | 顧客ID |
| name | TEXT | 氏名（必須） |
| nickname | TEXT | ニックネーム（任意）。アプリ内の表示優先 |
| notes | TEXT | トレーナー用備考（任意） |
| created_by | UUID (FK) | 顧客を登録したトレーナーの profiles.id |
| created_at | TIMESTAMPTZ | 作成日時 |
| updated_at | TIMESTAMPTZ | 更新日時 |

**設計注意点**
- メールアドレス・電話番号・住所は保存しない
- 将来、顧客ログイン機能を追加する場合は`auth_user_id UUID REFERENCES auth.users(id)`カラムを追加する

---

### `exercises`
種目マスタ。トレーナーが管理する共有マスタ。

```sql
CREATE TABLE exercises (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL,
  category    TEXT CHECK (category IN ('chest', 'back', 'shoulder', 'arm', 'leg', 'core', 'cardio')),
  notes       TEXT,
  created_by  UUID NOT NULL REFERENCES profiles(id),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

| カラム | 型 | 説明 |
|--------|-----|------|
| id | UUID (PK) | 種目ID |
| name | TEXT | 種目名（例: "ベンチプレス"） |
| category | TEXT | カテゴリ（任意） |
| notes | TEXT | 種目の説明・注意点（任意） |
| created_by | UUID (FK) | 登録したトレーナーのprofiles.id |
| created_at | TIMESTAMPTZ | 作成日時 |
| updated_at | TIMESTAMPTZ | 更新日時 |

**カテゴリ値**
| 値 | 日本語表示 |
|----|-----------|
| chest | 胸 |
| back | 背中 |
| shoulder | 肩 |
| arm | 腕 |
| leg | 脚 |
| core | 体幹 |
| cardio | 有酸素 |

---

### `training_sessions`
1日のトレーニングセッション。顧客1人につき1つ。

```sql
CREATE TABLE training_sessions (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id  UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  trainer_id   UUID NOT NULL REFERENCES profiles(id),
  session_date DATE NOT NULL,
  status       TEXT NOT NULL DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'completed')),
  notes        TEXT,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

| カラム | 型 | 説明 |
|--------|-----|------|
| id | UUID (PK) | セッションID |
| customer_id | UUID (FK) | 対象顧客 |
| trainer_id | UUID (FK) | 担当トレーナー（ログインユーザーのID） |
| session_date | DATE | セッション日付 |
| status | TEXT | 'in_progress'（記録中） / 'completed'（完了） |
| notes | TEXT | セッション全体のメモ（任意） |
| created_at | TIMESTAMPTZ | 作成日時 |
| updated_at | TIMESTAMPTZ | 更新日時 |

---

### `training_session_exercises`
セッション内の種目。1セッションに複数の種目が追加される。

```sql
CREATE TABLE training_session_exercises (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id   UUID NOT NULL REFERENCES training_sessions(id) ON DELETE CASCADE,
  exercise_id  UUID REFERENCES exercises(id),
  exercise_name TEXT NOT NULL,  -- マスタ選択時はexercises.nameをコピー、フリー入力時はそのまま
  sort_order   INTEGER NOT NULL DEFAULT 0,
  notes        TEXT,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

| カラム | 型 | 説明 |
|--------|-----|------|
| id | UUID (PK) | 種目エントリID |
| session_id | UUID (FK) | 親セッション |
| exercise_id | UUID (FK, nullable) | 種目マスタのID。フリー入力時はNULL |
| exercise_name | TEXT | 種目名（マスタから取得 or フリー入力） |
| sort_order | INTEGER | セッション内での表示順 |
| notes | TEXT | 種目単位のトレーナーメモ（任意） |
| created_at | TIMESTAMPTZ | 作成日時 |

**設計注意点**
- `exercise_name`をコピー保持することで、マスタの種目名変更が過去記録に影響しない

---

### `training_sets`
種目エントリに紐づく個々のセット記録。

```sql
CREATE TABLE training_sets (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_exercise_id  UUID NOT NULL REFERENCES training_session_exercises(id) ON DELETE CASCADE,
  set_number           INTEGER NOT NULL,
  weight_kg            NUMERIC(5,1),  -- 例: 100.0
  reps                 INTEGER,
  notes                TEXT,
  created_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at           TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

| カラム | 型 | 説明 |
|--------|-----|------|
| id | UUID (PK) | セットID |
| session_exercise_id | UUID (FK) | 親種目エントリ |
| set_number | INTEGER | セット番号（1から始まる） |
| weight_kg | NUMERIC(5,1) | 重量（kg）。自重トレは0またはNULL |
| reps | INTEGER | 回数。NULL許容（タイム系種目など） |
| notes | TEXT | セット単位のメモ（任意） |
| created_at | TIMESTAMPTZ | 作成日時 |
| updated_at | TIMESTAMPTZ | 更新日時 |

---

## 3. RLSポリシー設計

### ポリシー一覧

#### `profiles`
```sql
-- 自分のプロフィールのみ参照可能
CREATE POLICY "profiles_select_own" ON profiles
  FOR SELECT USING (auth.uid() = id);

-- 自分のプロフィールのみ更新可能
CREATE POLICY "profiles_update_own" ON profiles
  FOR UPDATE USING (auth.uid() = id);
```

#### `customers`
```sql
-- trainerロールのみ全操作可能
CREATE POLICY "customers_all_trainer" ON customers
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'trainer'
    )
  );
```

#### `exercises`
```sql
-- 認証済みユーザー全員が参照可能
CREATE POLICY "exercises_select_authenticated" ON exercises
  FOR SELECT USING (auth.uid() IS NOT NULL);

-- trainerのみ書き込み可能
CREATE POLICY "exercises_write_trainer" ON exercises
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'trainer')
  );

CREATE POLICY "exercises_update_trainer" ON exercises
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'trainer')
  );

CREATE POLICY "exercises_delete_trainer" ON exercises
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'trainer')
  );
```

#### `training_sessions`
```sql
-- trainerは全セッションを操作可能
CREATE POLICY "sessions_all_trainer" ON training_sessions
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'trainer')
  );

-- customer（将来拡張）は自分のセッションのみ参照可能
-- auth.usersとcustomersの紐付けが必要になった時点で追加
-- CREATE POLICY "sessions_select_customer" ON training_sessions
--   FOR SELECT USING (
--     EXISTS (
--       SELECT 1 FROM profiles p
--       JOIN customers c ON c.auth_user_id = p.id  -- 将来追加カラム
--       WHERE p.id = auth.uid()
--       AND p.role = 'customer'
--       AND training_sessions.customer_id = c.id
--     )
--   );
```

#### `training_session_exercises` / `training_sets`
```sql
-- 親セッションへのアクセス権に準ずる（同様のパターン）
CREATE POLICY "session_exercises_all_trainer" ON training_session_exercises
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'trainer')
  );

CREATE POLICY "training_sets_all_trainer" ON training_sets
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'trainer')
  );
```

---

## 4. インデックス設計

```sql
-- よく使う検索パターンに対するインデックス
CREATE INDEX idx_training_sessions_customer_id ON training_sessions(customer_id);
CREATE INDEX idx_training_sessions_trainer_id ON training_sessions(trainer_id);
CREATE INDEX idx_training_sessions_session_date ON training_sessions(session_date DESC);
CREATE INDEX idx_training_session_exercises_session_id ON training_session_exercises(session_id);
CREATE INDEX idx_training_sets_session_exercise_id ON training_sets(session_exercise_id);
```

---

## 5. トリガー設計

```sql
-- updated_atの自動更新トリガー（全テーブルに適用）
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- 各テーブルへの適用例
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 同様にcustomers, exercises, training_sessions, training_setsにも適用
```

---

## 6. ユーザー登録時の処理

新規トレーナーがSupabase Authに登録された際、`profiles`テーブルに自動でレコードを作成するトリガー。

```sql
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, role, name)
  VALUES (
    NEW.id,
    'trainer',
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.email)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
```

---

## 7. Supabase無料枠への配慮

| 項目 | 制限 | 対策 |
|------|------|------|
| DB容量 | 500MB | テキストデータのみ。画像・動画は保存しない |
| 行数 | 制限なし | UUIDを主キーに使用（シーケンスでも可） |
| 接続数 | 60（pooler経由） | Supabase公式クライアントはデフォルトでpooling使用 |
| Edge Functions | 500,000回/月 | 現時点では不使用 |
