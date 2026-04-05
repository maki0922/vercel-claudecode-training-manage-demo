'use client'

import { useState, useRef } from 'react'
import { EXERCISE_CATEGORIES } from '@/lib/constants/exercises'
import { createExercise, updateExercise, deleteExercise } from '@/app/(dashboard)/exercises/actions'

type Exercise = {
  id: string
  name: string
  category: string | null
  notes: string | null
}

// ── 種目追加フォーム ──────────────────────────────────────────
export function AddExerciseForm() {
  const [open, setOpen] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [pending, setPending] = useState(false)
  const formRef = useRef<HTMLFormElement>(null)

  async function handleSubmit(formData: FormData) {
    setPending(true)
    setError(null)
    const result = await createExercise(formData)
    setPending(false)
    if (result.error) {
      setError(result.error === 'name_required' ? '種目名を入力してください' : '登録に失敗しました')
      return
    }
    formRef.current?.reset()
    setOpen(false)
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 active:bg-blue-800 transition-colors"
      >
        ＋ 種目追加
      </button>
    )
  }

  return (
    <form ref={formRef} action={handleSubmit} className="bg-white rounded-2xl border border-blue-200 p-4 space-y-3">
      <p className="text-sm font-semibold text-gray-700">新しい種目</p>
      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}
      <input
        name="name"
        type="text"
        required
        placeholder="種目名（例：ベンチプレス）"
        className="block w-full rounded-lg border border-gray-300 px-3 py-3 text-base text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
      />
      <select
        name="category"
        className="block w-full rounded-lg border border-gray-300 px-3 py-3 text-base text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
      >
        <option value="">カテゴリなし</option>
        {EXERCISE_CATEGORIES.map((c) => (
          <option key={c.value} value={c.value}>{c.label}</option>
        ))}
      </select>
      <textarea
        name="notes"
        rows={2}
        placeholder="メモ（任意）"
        className="block w-full rounded-lg border border-gray-300 px-3 py-3 text-base text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none"
      />
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => { setOpen(false); setError(null) }}
          className="flex-1 rounded-lg border border-gray-300 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50 active:bg-gray-100 transition-colors"
        >
          キャンセル
        </button>
        <button
          type="submit"
          disabled={pending}
          className="flex-1 rounded-lg bg-blue-600 py-3 text-sm font-semibold text-white hover:bg-blue-700 active:bg-blue-800 disabled:opacity-50 transition-colors"
        >
          {pending ? '登録中…' : '登録する'}
        </button>
      </div>
    </form>
  )
}

// ── 種目行（編集・削除） ──────────────────────────────────────
export function ExerciseItem({ exercise }: { exercise: Exercise }) {
  const [editing, setEditing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [pending, setPending] = useState(false)

  async function handleUpdate(formData: FormData) {
    setPending(true)
    setError(null)
    const result = await updateExercise(exercise.id, formData)
    setPending(false)
    if (result.error) {
      setError(result.error === 'name_required' ? '種目名を入力してください' : '更新に失敗しました')
      return
    }
    setEditing(false)
  }

  async function handleDelete() {
    if (!window.confirm(`「${exercise.name}」を削除しますか？`)) return
    setPending(true)
    const result = await deleteExercise(exercise.id)
    setPending(false)
    if (result.error) setError('削除に失敗しました')
  }

  if (editing) {
    return (
      <form action={handleUpdate} className="rounded-xl border border-blue-200 bg-blue-50 p-3 space-y-2">
        {error && <p className="text-sm text-red-600">{error}</p>}
        <input
          name="name"
          type="text"
          required
          defaultValue={exercise.name}
          className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-base text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
        <select
          name="category"
          defaultValue={exercise.category ?? ''}
          className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-base text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
        >
          <option value="">カテゴリなし</option>
          {EXERCISE_CATEGORIES.map((c) => (
            <option key={c.value} value={c.value}>{c.label}</option>
          ))}
        </select>
        <textarea
          name="notes"
          rows={2}
          defaultValue={exercise.notes ?? ''}
          className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-base text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none"
        />
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => { setEditing(false); setError(null) }}
            className="flex-1 rounded-lg border border-gray-300 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
          >
            キャンセル
          </button>
          <button
            type="submit"
            disabled={pending}
            className="flex-1 rounded-lg bg-blue-600 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            {pending ? '保存中…' : '保存する'}
          </button>
        </div>
      </form>
    )
  }

  return (
    <div className="flex items-center justify-between rounded-xl bg-white border border-gray-200 px-4 py-3">
      <div>
        <p className="font-medium text-gray-900">{exercise.name}</p>
        {exercise.notes && (
          <p className="text-xs text-gray-400 mt-0.5">{exercise.notes}</p>
        )}
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={() => setEditing(true)}
          className="text-xs text-blue-600 hover:text-blue-700 font-medium px-2 py-1"
        >
          編集
        </button>
        <button
          onClick={handleDelete}
          disabled={pending}
          className="text-xs text-red-500 hover:text-red-600 font-medium px-2 py-1 disabled:opacity-50"
        >
          削除
        </button>
      </div>
    </div>
  )
}
