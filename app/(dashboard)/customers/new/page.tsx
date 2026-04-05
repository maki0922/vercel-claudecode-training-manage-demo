import Link from 'next/link'
import { createCustomer } from './actions'

type Props = {
  searchParams: Promise<{ error?: string }>
}

const ERROR_MESSAGES: Record<string, string> = {
  name_required: '氏名を入力してください',
  name_too_long: '氏名は50文字以内で入力してください',
  nickname_too_long: 'ニックネームは30文字以内で入力してください',
  server_error: '登録に失敗しました。時間をおいて再度お試しください',
}

export default async function CustomerNewPage({ searchParams }: Props) {
  const { error } = await searchParams

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Link href="/customers" className="text-gray-400 hover:text-gray-600 transition-colors">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <h1 className="text-xl font-bold text-gray-900">顧客登録</h1>
      </div>

      <form action={createCustomer} className="bg-white rounded-2xl border border-gray-200 p-5 space-y-5">
        {error && (
          <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
            {ERROR_MESSAGES[error] ?? '予期しないエラーが発生しました'}
          </div>
        )}

        <div className="space-y-1">
          <label htmlFor="name" className="block text-sm font-medium text-gray-700">
            氏名 <span className="text-red-500">*</span>
          </label>
          <input
            id="name"
            name="name"
            type="text"
            required
            maxLength={50}
            className="block w-full rounded-lg border border-gray-300 px-3 py-3 text-base text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            placeholder="山田 太郎"
          />
        </div>

        <div className="space-y-1">
          <label htmlFor="nickname" className="block text-sm font-medium text-gray-700">
            ニックネーム
          </label>
          <input
            id="nickname"
            name="nickname"
            type="text"
            maxLength={30}
            className="block w-full rounded-lg border border-gray-300 px-3 py-3 text-base text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            placeholder="たろう"
          />
          <p className="text-xs text-gray-400">アプリ内での表示名に使用します</p>
        </div>

        <div className="space-y-1">
          <label htmlFor="notes" className="block text-sm font-medium text-gray-700">
            メモ
          </label>
          <textarea
            id="notes"
            name="notes"
            rows={3}
            maxLength={500}
            className="block w-full rounded-lg border border-gray-300 px-3 py-3 text-base text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none"
            placeholder="トレーナー用の備考（怪我の履歴など）"
          />
        </div>

        <div className="flex gap-3 pt-1">
          <Link
            href="/customers"
            className="flex-1 rounded-lg border border-gray-300 px-4 py-3 text-base font-semibold text-gray-700 text-center hover:bg-gray-50 active:bg-gray-100 transition-colors"
          >
            キャンセル
          </Link>
          <button
            type="submit"
            className="flex-1 rounded-lg bg-blue-600 px-4 py-3 text-base font-semibold text-white hover:bg-blue-700 active:bg-blue-800 transition-colors"
          >
            登録する
          </button>
        </div>
      </form>
    </div>
  )
}
