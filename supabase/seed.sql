-- Seed Data
-- 開発・デモ用サンプルデータ
--
-- 実行前提条件:
--   - 001〜003 のマイグレーションが適用済みであること
--   - トレーナーアカウントが Supabase Authentication > Users から
--     手動で作成済みであること（アプリ内にサインアップ画面はない）
--
-- 実行方法:
--   Supabase ダッシュボード > SQL Editor に貼り付けて実行
--
-- 注意:
--   このファイルには exercises のみ含む。
--   顧客・セッションデータはアプリから実際に登録すること。
--   トレーナーの profiles レコードは on_auth_user_created トリガーで自動生成される。

-- ----------------------------------------
-- 種目マスタ（共通マスタ）
-- created_by には実際のトレーナーのUUIDを設定すること
-- 例: SELECT id FROM profiles WHERE role = 'trainer' LIMIT 1;
-- ----------------------------------------

DO $$
DECLARE
  trainer_id UUID;
BEGIN
  -- 最初のトレーナーのIDを取得
  SELECT id INTO trainer_id FROM profiles WHERE role = 'trainer' ORDER BY created_at LIMIT 1;

  IF trainer_id IS NULL THEN
    RAISE NOTICE 'トレーナーアカウントが見つかりません。先にトレーナーアカウントを作成してください。';
    RETURN;
  END IF;

  INSERT INTO exercises (name, category, notes, created_by) VALUES
    -- 胸
    ('ベンチプレス',          'chest',    'フラットベンチ。肩甲骨を寄せてアーチを作る', trainer_id),
    ('インクラインベンチプレス', 'chest',   '30〜45度のインクライン。上部胸筋を意識', trainer_id),
    ('ダンベルフライ',         'chest',    'ストレッチを意識。重量より可動域を優先', trainer_id),
    ('ケーブルクロスオーバー',  'chest',    '頂点でピークコントラクション', trainer_id),
    -- 背中
    ('デッドリフト',           'back',     '腰を丸めない。背中のアーチを維持', trainer_id),
    ('懸垂（チンアップ）',      'back',     '肩甲骨を落とすイメージで引く', trainer_id),
    ('ラットプルダウン',        'back',     '広背筋への収縮を意識', trainer_id),
    ('シーテッドロウ',          'back',     '肘を後ろに引くイメージ', trainer_id),
    ('ダンベルロウ',            'back',     '片手ずつ。体幹を安定させる', trainer_id),
    -- 肩
    ('ショルダープレス',        'shoulder', 'バーベルまたはダンベル。耳の横から真上に押す', trainer_id),
    ('サイドレイズ',            'shoulder', '肘を軽く曲げ、肩の高さまで上げる', trainer_id),
    ('フロントレイズ',          'shoulder', '前部三角筋。体の前方に持ち上げる', trainer_id),
    ('リアレイズ',              'shoulder', '後部三角筋。前傾姿勢で行う', trainer_id),
    -- 腕
    ('バーベルカール',          'arm',      '上腕二頭筋。肘の位置を固定する', trainer_id),
    ('ハンマーカール',          'arm',      '上腕筋・腕橈骨筋。ニュートラルグリップ', trainer_id),
    ('トライセプスプレスダウン', 'arm',      '上腕三頭筋。肘を固定して前腕だけ動かす', trainer_id),
    ('スカルクラッシャー',      'arm',      '上腕三頭筋。肘を広げすぎない', trainer_id),
    -- 脚
    ('スクワット',              'leg',      'バーベルスクワット。膝がつま先より前に出ないよう注意', trainer_id),
    ('レッグプレス',            'leg',      'ニーインを防ぐ。足幅・足の位置で効く部位が変わる', trainer_id),
    ('ルーマニアンデッドリフト', 'leg',      'ハムストリングのストレッチを意識', trainer_id),
    ('レッグカール',            'leg',      'ハムストリング。可動域を最大限に使う', trainer_id),
    ('レッグエクステンション',  'leg',      '大腿四頭筋。膝を痛めないよう重量管理', trainer_id),
    ('カーフレイズ',            'leg',      'ふくらはぎ。踵まで下げてストレッチ', trainer_id),
    -- 体幹
    ('プランク',                'core',     '体幹全体。腰を反らせない', trainer_id),
    ('クランチ',                'core',     '腹直筋上部。反動を使わない', trainer_id),
    ('レッグレイズ',            'core',     '腹直筋下部。腰が浮かないよう注意', trainer_id),
    ('ロシアンツイスト',        'core',     '腹斜筋。ゆっくり丁寧に', trainer_id),
    -- 有酸素
    ('トレッドミル',            'cardio',   'ウォームアップ・クールダウンに', trainer_id),
    ('バイク（エアロバイク）',  'cardio',   '膝への負担が少ない。回復日にも', trainer_id)
  ON CONFLICT DO NOTHING;

  RAISE NOTICE '種目マスタを % 件登録しました（trainer_id: %）', 29, trainer_id;
END $$;
