import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import SessionRecorder from '@/components/SessionRecorder'

type Props = {
  params: Promise<{ id: string }>
}

export default async function SessionDetailPage({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()

  const [
    { data: session, error: sessionError },
    { data: sessionExercises },
    { data: masterExercises },
  ] = await Promise.all([
    supabase
      .from('training_sessions')
      .select('id, session_date, status, notes, customer_id, profiles ( name ), customers ( name, nickname )')
      .eq('id', id)
      .single(),
    supabase
      .from('training_session_exercises')
      .select('id, exercise_name, notes, sort_order, training_sets ( id, set_number, weight_kg, reps, notes )')
      .eq('session_id', id)
      .order('sort_order'),
    supabase.from('exercises').select('id, name, category').order('name'),
  ])

  if (sessionError || !session) notFound()

  const customer = session.customers as unknown as { name: string; nickname: string | null }
  const trainer = session.profiles as unknown as { name: string }

  const exercises = (sessionExercises ?? []).map((se) => ({
    sessionExerciseId: se.id,
    exerciseName: se.exercise_name,
    exerciseNotes: se.notes ?? '',
    sets: (
      (se.training_sets as unknown as Array<{
        id: string
        set_number: number
        weight_kg: number | null
        reps: number | null
        notes: string | null
      }>) ?? []
    )
      .sort((a, b) => a.set_number - b.set_number)
      .map((s) => ({
        id: s.id,
        setNumber: s.set_number,
        weightKg: s.weight_kg?.toString() ?? '',
        reps: s.reps?.toString() ?? '',
        notes: s.notes ?? '',
      })),
  }))

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Link
          href={`/customers/${session.customer_id}`}
          className="text-gray-400 hover:text-gray-600 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <h1 className="text-xl font-bold text-gray-900">セッション記録</h1>
      </div>

      <SessionRecorder
        sessionId={session.id}
        sessionDate={session.session_date}
        sessionStatus={session.status}
        sessionNotes={session.notes}
        customerId={session.customer_id}
        customerName={customer?.nickname ?? customer?.name ?? '—'}
        trainerName={trainer?.name ?? '—'}
        initialExercises={exercises}
        masterExercises={masterExercises ?? []}
      />
    </div>
  )
}
