'use client'

import { deleteCustomer } from '@/app/(dashboard)/customers/[id]/edit/actions'

export default function DeleteCustomerButton({ customerId }: { customerId: string }) {
  async function handleDelete() {
    const confirmed = window.confirm(
      'この顧客を削除しますか？\n関連するセッション記録もすべて削除されます。'
    )
    if (!confirmed) return
    await deleteCustomer(customerId)
  }

  return (
    <button
      type="button"
      onClick={handleDelete}
      className="w-full rounded-lg border border-red-200 px-4 py-3 text-base font-semibold text-red-600 hover:bg-red-50 active:bg-red-100 transition-colors"
    >
      この顧客を削除する
    </button>
  )
}
