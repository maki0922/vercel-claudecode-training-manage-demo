-- Migration: 003_rls_and_indexes
-- Description: Enable RLS, create policies, and create indexes

-- ----------------------------------------
-- Enable Row Level Security on all tables
-- ----------------------------------------
ALTER TABLE profiles                  ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers                 ENABLE ROW LEVEL SECURITY;
ALTER TABLE exercises                 ENABLE ROW LEVEL SECURITY;
ALTER TABLE training_sessions         ENABLE ROW LEVEL SECURITY;
ALTER TABLE training_session_exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE training_sets             ENABLE ROW LEVEL SECURITY;

-- ----------------------------------------
-- RLS Policies: profiles
-- ----------------------------------------

-- Trainers can only read their own profile
CREATE POLICY "profiles_select_own" ON profiles
  FOR SELECT USING (auth.uid() = id);

-- Trainers can only update their own profile
CREATE POLICY "profiles_update_own" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- ----------------------------------------
-- RLS Policies: customers
-- ----------------------------------------

-- Only trainers can perform any operation on customers
CREATE POLICY "customers_all_trainer" ON customers
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
        AND profiles.role = 'trainer'
    )
  );

-- Future: allow customers to read their own record
-- Requires auth_user_id column on customers table (see data-model.md)
-- CREATE POLICY "customers_select_own_customer" ON customers
--   FOR SELECT USING (
--     EXISTS (
--       SELECT 1 FROM profiles
--       WHERE profiles.id = auth.uid()
--         AND profiles.role = 'customer'
--         AND customers.auth_user_id = auth.uid()
--     )
--   );

-- ----------------------------------------
-- RLS Policies: exercises
-- ----------------------------------------

-- All authenticated users can read exercises
CREATE POLICY "exercises_select_authenticated" ON exercises
  FOR SELECT USING (auth.uid() IS NOT NULL);

-- Only trainers can insert exercises
CREATE POLICY "exercises_insert_trainer" ON exercises
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
        AND profiles.role = 'trainer'
    )
  );

-- Only trainers can update exercises
CREATE POLICY "exercises_update_trainer" ON exercises
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
        AND profiles.role = 'trainer'
    )
  );

-- Only trainers can delete exercises
CREATE POLICY "exercises_delete_trainer" ON exercises
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
        AND profiles.role = 'trainer'
    )
  );

-- ----------------------------------------
-- RLS Policies: training_sessions
-- ----------------------------------------

-- Trainers can perform any operation on all sessions
CREATE POLICY "sessions_all_trainer" ON training_sessions
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
        AND profiles.role = 'trainer'
    )
  );

-- Future: allow customers to read only their own sessions
-- CREATE POLICY "sessions_select_customer" ON training_sessions
--   FOR SELECT USING (
--     EXISTS (
--       SELECT 1 FROM profiles p
--       JOIN customers c ON c.auth_user_id = p.id
--       WHERE p.id = auth.uid()
--         AND p.role = 'customer'
--         AND training_sessions.customer_id = c.id
--     )
--   );

-- ----------------------------------------
-- RLS Policies: training_session_exercises
-- ----------------------------------------

-- Trainers can perform any operation (follows parent session access)
CREATE POLICY "session_exercises_all_trainer" ON training_session_exercises
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
        AND profiles.role = 'trainer'
    )
  );

-- ----------------------------------------
-- RLS Policies: training_sets
-- ----------------------------------------

-- Trainers can perform any operation (follows parent session access)
CREATE POLICY "training_sets_all_trainer" ON training_sets
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
        AND profiles.role = 'trainer'
    )
  );

-- ----------------------------------------
-- Indexes
-- ----------------------------------------

-- training_sessions: frequently filtered by customer and sorted by date
CREATE INDEX idx_training_sessions_customer_id
  ON training_sessions(customer_id);

CREATE INDEX idx_training_sessions_trainer_id
  ON training_sessions(trainer_id);

CREATE INDEX idx_training_sessions_session_date
  ON training_sessions(session_date DESC);

-- training_session_exercises: always queried by parent session
CREATE INDEX idx_training_session_exercises_session_id
  ON training_session_exercises(session_id);

-- training_sets: always queried by parent session exercise
CREATE INDEX idx_training_sets_session_exercise_id
  ON training_sets(session_exercise_id);
