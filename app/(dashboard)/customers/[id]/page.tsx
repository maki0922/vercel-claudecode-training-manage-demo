import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

type Props = {
  params: Promise<{ id: string }>
}

export default async function CustomerDetailPage({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()

  const [{ data: customer, error }, { data: sessions }] = await Promise.all([
    supabase
      .from('customers')
      .select('id, name, nickname, notes')
      .eq('id', id)
      .single(),
    supabase
      .from('training_sessions')
      .select(`
        id,
        session_date,
        status,
        profiles ( name ),
        training_session_exercises ( id )
      `)
      .eq('customer_id', id)
      .order('session_date', { ascending: false }),
  ])

  if (error || !customer) notFound()

  const displayName = customer.nickname ?? customer.name

  return (
    <div className="space-y-5">
      {/* ヘッダー */}
      <div className="flex items-center gap-3">
        <Link href="/customers" className="text-gray-400 hover:text-gray-600 transition-colors">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <h1 className="text-xl font-bold text-gray-900">{displayName}</h1>
      </div>

      {/* 顧客情報カード */}
      <div className="bg-white rounded-2xl border border-gray-200 p-5 space-y-3">
        <div className="flex items-start justify-between">
          <div>
            <p className="font-semibold text-gray-900 text-lg">{displayName}</p>
            {customer.nickname && (
              <p className="text-sm text-gray-400 mt-0.5">{customer.name}</p>
            )}
          </div>
          <Link
            href={`/customers/${id}/edit`}
            className="text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            編集
          </Link>
        </div>
        {customer.notes && (
          <p className="text-sm text-gray-600 border-t border-gray-100 pt-3 whitespace-pre-wrap">
            {customer.notes}
          </p>
        )}
      </div>

      {/* セッション開始ボタン */}
      <Link
        href={`/sessions/new?customerId=${id}`}
        className="flex items-center justify-center gap-2 w-full rounded-xl bg-blue-600 px-4 py-4 text-base font-semibold text-white hover:bg-blue-700 active:bg-blue-800 transition-colors"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
        </svg>
        セッション開始
      </Link>

      {/* セッション履歴 */}
      <div>
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
          セッション履歴
        </h2>
        {!sessions || sessions.length === 0 ? (
          <div className="text-center py-10 text-gray-400 text-sm">
            まだセッションの記録がありません
          </div>
        ) : (
          <ul className="space-y-2">
            {sessions.map((session) => {
              const trainer = session.profiles as unknown as { name: string } | null
              const exerciseCount = (
                session.training_session_exercises as { id: string }[] | null
              )?.length ?? 0
              const isCompleted = session.status === 'completed'

              return (
                <li key={session.id}>
                  <Link
                    href={`/sessions/${session.id}`}
                    className="flex items-center justify-between rounded-xl bg-white border border-gray-200 px-4 py-3 hover:border-blue-300 hover:shadow-sm active:bg-gray-50 transition-all"
                  >
                    <div className="space-y-0.5">
                      <p className="font-medium text-gray-900">
                        {new Date(session.session_date).toLocaleDateString('ja-JP', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </p>
                      <p className="text-xs text-gray-400">
                        {trainer?.name ?? '—'} ・ {exerciseCount}種目
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {!isCompleted && (
                        <span className="text-xs font-medium text-amber-600 bg-amber-50 border border-amber-200 rounded-full px-2 py-0.5">
                          記録中
                        </span>
                      )}
                      <svg
                        className="w-4 h-4 text-gray-300"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={2}
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </Link>
                </li>
              )
            })}
          </ul>
        )}
      </div>
    </div>
  )
}
