'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export async function updateCustomer(id: string, formData: FormData) {
  const name = (formData.get('name') as string).trim()
  const nickname = (formData.get('nickname') as string).trim() || null
  const notes = (formData.get('notes') as string).trim() || null

  if (!name) redirect(`/customers/${id}/edit?error=name_required`)
  if (name.length > 50) redirect(`/customers/${id}/edit?error=name_too_long`)
  if (nickname && nickname.length > 30) redirect(`/customers/${id}/edit?error=nickname_too_long`)

  const supabase = await createClient()

  const { error } = await supabase
    .from('customers')
    .update({ name, nickname, notes })
    .eq('id', id)

  if (error) redirect(`/customers/${id}/edit?error=server_error`)

  redirect(`/customers/${id}`)
}

export async function deleteCustomer(id: string) {
  const supabase = await createClient()

  const { error } = await supabase.from('customers').delete().eq('id', id)

  if (error) redirect(`/customers/${id}/edit?error=delete_error`)

  redirect('/customers')
}
