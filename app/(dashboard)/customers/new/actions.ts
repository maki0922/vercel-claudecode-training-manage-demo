'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export async function createCustomer(formData: FormData) {
  const name = (formData.get('name') as string).trim()
  const nickname = (formData.get('nickname') as string).trim() || null
  const notes = (formData.get('notes') as string).trim() || null

  if (!name) redirect('/customers/new?error=name_required')
  if (name.length > 50) redirect('/customers/new?error=name_too_long')
  if (nickname && nickname.length > 30) redirect('/customers/new?error=nickname_too_long')

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data, error } = await supabase
    .from('customers')
    .insert({ name, nickname, notes, created_by: user.id })
    .select('id')
    .single()

  if (error) redirect('/customers/new?error=server_error')

  redirect(`/customers/${data.id}`)
}
