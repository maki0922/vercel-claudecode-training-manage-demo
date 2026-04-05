import Link from 'next/link'
import { Suspense } from 'react'
import { createClient } from '@/lib/supabase/server'
import CustomerSearch from '@/components/CustomerSearch'

type Props = {
  searchParams: Promise<{ q?: string }>
}

export default async function CustomersPage({ searchParams }: Props) {
  const { q } = await searchParams
  const supabase = await createClient()

  let query = supabase
    .from('customers')
    .select(`
      id,
      name,
      nickname,
      training_sessions ( session_date )
    `)
    .order('name')

  if (q) {
    query = query.or(`name.ilike.%${q}%,nickname.ilike.%${q}%`)
  }

  const { data: customers, error } = await query

  if (error) {
    return <div className="text-red-600 text-sm">顧客情報の取得に失敗しました</div>
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900">顧客一覧</h1>
        <Link
          href="/customers/new"
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 active:bg-blue-800 transition-colors"
        >
          ＋ 新規登録
        </Link>
      </div>

      <Suspense>
        <CustomerSearch />
      </Suspense>

      {customers.length === 0 ? (
        <div className="text-center py-16 text-gray-400 text-sm">
          {q ? `"${q}" に一致する顧客が見つかりません` : '顧客が登録されていません'}
        </div>
      ) : (
        <ul className="space-y-2">
          {customers.map((customer) => {
            const displayName = customer.nickname ?? customer.name
            const sessions = customer.training_sessions as { session_date: string }[] | null
            const lastSession = sessions
              ?.map((s) => s.session_date)
              .sort()
              .at(-1)

            return (
              <li key={customer.id}>
                <Link
                  href={`/customers/${customer.id}`}
                  className="flex items-center justify-between rounded-xl bg-white border border-gray-200 px-4 py-4 hover:border-blue-300 hover:shadow-sm active:bg-gray-50 transition-all"
                >
                  <div>
                    <p className="font-semibold text-gray-900">{displayName}</p>
                    {customer.nickname && (
                      <p className="text-xs text-gray-400 mt-0.5">{customer.name}</p>
                    )}
                  </div>
                  <div className="text-right">
                    {lastSession ? (
                      <p className="text-xs text-gray-400">
                        最終:{' '}
                        {new Date(lastSession).toLocaleDateString('ja-JP', {
                          month: 'short',
                          day: 'numeric',
                        })}
                      </p>
                    ) : (
                      <p className="text-xs text-gray-300">記録なし</p>
                    )}
                    <svg
                      className="w-4 h-4 text-gray-300 mt-1 ml-auto"
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
  )
}
