'use client'

import { logout } from '@/app/(dashboard)/actions'

export default function LogoutButton() {
  return (
    <form action={logout}>
      <button
        type="submit"
        className="text-sm font-medium text-gray-500 hover:text-gray-700 active:text-gray-900 transition-colors"
      >
        ログアウト
      </button>
    </form>
  )
}
