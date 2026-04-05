-- Migration: 001_create_tables
-- Description: Create all base tables

-- ----------------------------------------
-- profiles
-- 1:1 with auth.users. Manages user roles.
-- ----------------------------------------
CREATE TABLE profiles (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role        TEXT NOT NULL DEFAULT 'trainer' CHECK (role IN ('trainer', 'customer')),
  name        TEXT NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ----------------------------------------
-- customers
-- Minimal customer info (name/nickname only).
-- No PII such as address, phone, or email.
-- ----------------------------------------
CREATE TABLE customers (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name         TEXT NOT NULL,
  nickname     TEXT,
  notes        TEXT,
  created_by   UUID NOT NULL REFERENCES profiles(id),
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ----------------------------------------
-- exercises
-- Shared exercise master managed by trainers.
-- ----------------------------------------
CREATE TABLE exercises (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL,
  category    TEXT CHECK (category IN ('chest', 'back', 'shoulder', 'arm', 'leg', 'core', 'cardio')),
  notes       TEXT,
  created_by  UUID NOT NULL REFERENCES profiles(id),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ----------------------------------------
-- training_sessions
-- One session per customer per day.
-- ----------------------------------------
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

-- ----------------------------------------
-- training_session_exercises
-- Exercises added to a session.
-- exercise_name is copied from master to avoid
-- past records being affected by name changes.
-- ----------------------------------------
CREATE TABLE training_session_exercises (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id    UUID NOT NULL REFERENCES training_sessions(id) ON DELETE CASCADE,
  exercise_id   UUID REFERENCES exercises(id),
  exercise_name TEXT NOT NULL,
  sort_order    INTEGER NOT NULL DEFAULT 0,
  notes         TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ----------------------------------------
-- training_sets
-- Individual sets within a session exercise.
-- ----------------------------------------
CREATE TABLE training_sets (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_exercise_id  UUID NOT NULL REFERENCES training_session_exercises(id) ON DELETE CASCADE,
  set_number           INTEGER NOT NULL,
  weight_kg            NUMERIC(5,1),
  reps                 INTEGER,
  notes                TEXT,
  created_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at           TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
