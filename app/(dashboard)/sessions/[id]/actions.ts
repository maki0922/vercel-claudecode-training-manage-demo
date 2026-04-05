'use server'

import { createClient } from '@/lib/supabase/server'

export async function addExerciseToSession(
  sessionId: string,
  exerciseName: string,
  exerciseId: string | null,
  sortOrder: number
): Promise<{ id: string | null; error: string | null }> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('training_session_exercises')
    .insert({ session_id: sessionId, exercise_name: exerciseName, exercise_id: exerciseId, sort_order: sortOrder })
    .select('id')
    .single()

  if (error) return { id: null, error: 'server_error' }
  return { id: data.id, error: null }
}

export async function saveSet(data: {
  id: string | null
  sessionExerciseId: string
  setNumber: number
  weightKg: number | null
  reps: number | null
  notes: string | null
}): Promise<{ id: string | null; error: string | null }> {
  const supabase = await createClient()

  if (data.id) {
    const { error } = await supabase
      .from('training_sets')
      .update({ weight_kg: data.weightKg, reps: data.reps, notes: data.notes })
      .eq('id', data.id)
    return { id: data.id, error: error ? 'server_error' : null }
  }

  const { data: inserted, error } = await supabase
    .from('training_sets')
    .insert({
      session_exercise_id: data.sessionExerciseId,
      set_number: data.setNumber,
      weight_kg: data.weightKg,
      reps: data.reps,
      notes: data.notes,
    })
    .select('id')
    .single()

  return { id: inserted?.id ?? null, error: error ? 'server_error' : null }
}

export async function deleteSet(id: string): Promise<{ error: string | null }> {
  const supabase = await createClient()
  const { error } = await supabase.from('training_sets').delete().eq('id', id)
  return { error: error ? 'server_error' : null }
}

export async function removeExerciseFromSession(id: string): Promise<{ error: string | null }> {
  const supabase = await createClient()
  const { error } = await supabase.from('training_session_exercises').delete().eq('id', id)
  return { error: error ? 'server_error' : null }
}

export async function completeSession(sessionId: string): Promise<{ error: string | null }> {
  const supabase = await createClient()
  const { error } = await supabase
    .from('training_sessions')
    .update({ status: 'completed' })
    .eq('id', sessionId)
  return { error: error ? 'server_error' : null }
}
