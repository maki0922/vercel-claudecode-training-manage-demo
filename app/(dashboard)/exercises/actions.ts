'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

export async function createExercise(formData: FormData) {
  const name = (formData.get('name') as string).trim()
  const category = (formData.get('category') as string) || null
  const notes = (formData.get('notes') as string).trim() || null

  if (!name) return { error: 'name_required' }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'unauthorized' }

  const { error } = await supabase
    .from('exercises')
    .insert({ name, category, notes, created_by: user.id })

  if (error) return { error: 'server_error' }

  revalidatePath('/exercises')
  return { error: null }
}

export async function updateExercise(id: string, formData: FormData) {
  const name = (formData.get('name') as string).trim()
  const category = (formData.get('category') as string) || null
  const notes = (formData.get('notes') as string).trim() || null

  if (!name) return { error: 'name_required' }

  const supabase = await createClient()
  const { error } = await supabase
    .from('exercises')
    .update({ name, category, notes })
    .eq('id', id)

  if (error) return { error: 'server_error' }

  revalidatePath('/exercises')
  return { error: null }
}

export async function deleteExercise(id: string) {
  const supabase = await createClient()
  const { error } = await supabase.from('exercises').delete().eq('id', id)

  if (error) return { error: 'server_error' }

  revalidatePath('/exercises')
  return { error: null }
}
