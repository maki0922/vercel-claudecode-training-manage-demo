'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export async function createSession(formData: FormData) {
  const customerId = formData.get('customerId') as string
  const sessionDate = formData.get('sessionDate') as string
  const notes = (formData.get('notes') as string).trim() || null

  if (!customerId) redirect('/sessions/new?error=customer_required')
  if (!sessionDate) redirect('/sessions/new?error=date_required')

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data, error } = await supabase
    .from('training_sessions')
    .insert({
      customer_id: customerId,
      trainer_id: user.id,
      session_date: sessionDate,
      notes,
      status: 'in_progress',
    })
    .select('id')
    .single()

  if (error) redirect('/sessions/new?error=server_error')

  redirect(`/sessions/${data.id}`)
}
