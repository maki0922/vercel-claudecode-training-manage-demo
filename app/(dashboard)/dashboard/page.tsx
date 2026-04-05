import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'

export default async function DashboardPage() {
  const supabase = await createClient()

  const { data: sessions } = await supabase
    .from('training_sessions')
    .select(`
      id,
      session_date,
      status,
      profiles ( name ),
      customers ( name, nickname )
    `)
    .order('session_date', { ascending: false })
    .limit(5)

  return (
    <div className="space-y-6">
      {/* クイックアクション */}
      <div className="space-y-3">
        <Link
          href="/sessions/new"
          className="flex items-center justify-center gap-2 w-full rounded-xl bg-blue-600 px-4 py-4 text-base font-semibold text-white hover:bg-blue-700 active:bg-blue-800 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          新規セッション開始
        </Link>
        <Link
          href="/customers"
          className="flex items-center justify-center gap-2 w-full rounded-xl border border-gray-300 bg-white px-4 py-4 text-base font-semibold text-gray-700 hover:bg-gray-50 active:bg-gray-100 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a4 4 0 00-5-3.87M9 20H4v-2a4 4 0 015-3.87m6-4a4 4 0 11-8 0 4 4 0 018 0zm6 0a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          顧客一覧
        </Link>
      </div>

      {/* 直近セッション */}
      <div>
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
          直近のセッション
        </h2>
        {!sessions || sessions.length === 0 ? (
          <div className="rounded-xl border border-dashed border-gray-200 py-10 text-center text-sm text-gray-400">
            まだセッションの記録がありません
          </div>
        ) : (
          <ul className="space-y-2">
            {sessions.map((session) => {
              const customer = session.customers as unknown as { name: string; nickname: string | null } | null
              const trainer = session.profiles as unknown as { name: string } | null
              const displayName = customer?.nickname ?? customer?.name ?? '—'
              const isCompleted = session.status === 'completed'

              return (
                <li key={session.id}>
                  <Link
                    href={`/sessions/${session.id}`}
                    className="flex items-center justify-between rounded-xl bg-white border border-gray-200 px-4 py-3 hover:border-blue-300 hover:shadow-sm active:bg-gray-50 transition-all"
                  >
                    <div className="space-y-0.5">
                      <p className="font-semibold text-gray-900">{displayName}</p>
                      <p className="text-xs text-gray-400">
                        {new Date(session.session_date).toLocaleDateString('ja-JP', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })}
                        {trainer?.name && ` ・ ${trainer.name}`}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {!isCompleted && (
                        <span className="rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-600">
                          記録中
                        </span>
                      )}
                      <svg className="w-4 h-4 text-gray-300" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
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
