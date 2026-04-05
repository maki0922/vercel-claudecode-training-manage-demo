import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createSession } from './actions'

type Props = {
  searchParams: Promise<{ customerId?: string; error?: string }>
}

const ERROR_MESSAGES: Record<string, string> = {
  customer_required: '顧客を選択してください',
  date_required: '日付を入力してください',
  server_error: 'セッションの作成に失敗しました。時間をおいて再度お試しください',
}

export default async function SessionNewPage({ searchParams }: Props) {
  const { customerId, error } = await searchParams

  const supabase = await createClient()
  const { data: customers, error: fetchError } = await supabase
    .from('customers')
    .select('id, name, nickname')
    .order('name')

  if (fetchError) redirect('/dashboard')

  // 今日の日付をyyyy-mm-dd形式で取得
  const today = new Date().toLocaleDateString('sv-SE')

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Link
          href={customerId ? `/customers/${customerId}` : '/dashboard'}
          className="text-gray-400 hover:text-gray-600 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <h1 className="text-xl font-bold text-gray-900">セッション開始</h1>
      </div>

      <form action={createSession} className="bg-white rounded-2xl border border-gray-200 p-5 space-y-5">
        {error && (
          <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
            {ERROR_MESSAGES[error] ?? '予期しないエラーが発生しました'}
          </div>
        )}

        <div className="space-y-1">
          <label htmlFor="customerId" className="block text-sm font-medium text-gray-700">
            顧客 <span className="text-red-500">*</span>
          </label>
          <select
            id="customerId"
            name="customerId"
            required
            defaultValue={customerId ?? ''}
            className="block w-full rounded-lg border border-gray-300 px-3 py-3 text-base text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
          >
            <option value="" disabled>顧客を選択してください</option>
            {customers?.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nickname ?? c.name}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1">
          <label htmlFor="sessionDate" className="block text-sm font-medium text-gray-700">
            日付 <span className="text-red-500">*</span>
          </label>
          <input
            id="sessionDate"
            name="sessionDate"
            type="date"
            required
            defaultValue={today}
            className="block w-full rounded-lg border border-gray-300 px-3 py-3 text-base text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

        <div className="space-y-1">
          <label htmlFor="notes" className="block text-sm font-medium text-gray-700">
            セッションメモ
          </label>
          <textarea
            id="notes"
            name="notes"
            rows={3}
            className="block w-full rounded-lg border border-gray-300 px-3 py-3 text-base text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none"
            placeholder="今日のテーマや体調など"
          />
        </div>

        <button
          type="submit"
          className="w-full rounded-lg bg-blue-600 px-4 py-4 text-base font-semibold text-white hover:bg-blue-700 active:bg-blue-800 transition-colors"
        >
          セッションを開始する
        </button>
      </form>
    </div>
  )
}
