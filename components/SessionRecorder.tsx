'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { getCategoryLabel } from '@/lib/constants/exercises'
import {
  addExerciseToSession,
  saveSet as saveSetAction,
  deleteSet as deleteSetAction,
  removeExerciseFromSession,
  completeSession as completeSessionAction,
} from '@/app/(dashboard)/sessions/[id]/actions'

// ── 型定義 ────────────────────────────────────────────────────────────────────

type SetData = {
  id: string | null
  setNumber: number
  weightKg: string
  reps: string
  notes: string
}

type ExerciseData = {
  sessionExerciseId: string
  exerciseName: string
  exerciseNotes: string
  sets: SetData[]
}

type MasterExercise = {
  id: string
  name: string
  category: string | null
}

type SaveStatus = 'idle' | 'saving' | 'saved' | 'error'

// ── SetRow ────────────────────────────────────────────────────────────────────

function SetRow({
  set,
  sessionExerciseId,
  displayIndex,
  isCompleted,
  onDelete,
}: {
  set: SetData
  sessionExerciseId: string
  displayIndex: number
  isCompleted: boolean
  onDelete: (savedId: string | null) => void
}) {
  const [fields, setFields] = useState({ weightKg: set.weightKg, reps: set.reps, notes: set.notes })
  const [savedId, setSavedId] = useState(set.id)
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle')
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  async function handleBlur() {
    const weightKg = fields.weightKg !== '' ? parseFloat(fields.weightKg) : null
    const reps = fields.reps !== '' ? parseInt(fields.reps, 10) : null
    const notes = fields.notes.trim() || null

    // 新規セットで全フィールドが空なら保存しない
    if (!savedId && weightKg === null && reps === null && notes === null) return

    setSaveStatus('saving')
    if (timerRef.current) clearTimeout(timerRef.current)

    const result = await saveSetAction({
      id: savedId,
      sessionExerciseId,
      setNumber: set.setNumber,
      weightKg,
      reps,
      notes,
    })

    if (result.error) {
      setSaveStatus('error')
    } else {
      if (!savedId && result.id) setSavedId(result.id)
      setSaveStatus('saved')
      timerRef.current = setTimeout(() => setSaveStatus('idle'), 2000)
    }
  }

  async function handleDelete() {
    onDelete(savedId)
    if (savedId) await deleteSetAction(savedId)
  }

  const inputCls =
    'w-full rounded-lg border border-gray-300 px-2 py-2 text-base text-gray-900 text-center focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white'

  return (
    <div className="space-y-0.5">
      <div className="flex items-center gap-2">
        <span className="w-6 shrink-0 text-center text-sm font-medium text-gray-400">
          {displayIndex}
        </span>
        <div className="flex flex-1 gap-2">
          <div className="flex-1">
            <input
              type="number"
              inputMode="decimal"
              placeholder="0"
              value={fields.weightKg}
              onChange={(e) => setFields((f) => ({ ...f, weightKg: e.target.value }))}
              onBlur={handleBlur}
              readOnly={isCompleted}
              className={inputCls}
            />
          </div>
          <div className="flex-1">
            <input
              type="number"
              inputMode="numeric"
              placeholder="0"
              value={fields.reps}
              onChange={(e) => setFields((f) => ({ ...f, reps: e.target.value }))}
              onBlur={handleBlur}
              readOnly={isCompleted}
              className={inputCls}
            />
          </div>
          <div className="flex-[2]">
            <input
              type="text"
              placeholder="メモ"
              value={fields.notes}
              onChange={(e) => setFields((f) => ({ ...f, notes: e.target.value }))}
              onBlur={handleBlur}
              readOnly={isCompleted}
              className={inputCls}
            />
          </div>
        </div>
        {!isCompleted && (
          <button
            type="button"
            onClick={handleDelete}
            className="shrink-0 p-1 text-gray-300 hover:text-red-400 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>
      {saveStatus !== 'idle' && (
        <p
          className={`pl-8 text-xs ${
            saveStatus === 'saving'
              ? 'text-gray-400'
              : saveStatus === 'saved'
                ? 'text-green-600'
                : 'text-red-500'
          }`}
        >
          {saveStatus === 'saving' ? '保存中…' : saveStatus === 'saved' ? '保存済み ✓' : '保存失敗'}
        </p>
      )}
    </div>
  )
}

// ── ExerciseSection ───────────────────────────────────────────────────────────

function ExerciseSection({
  exercise,
  isCompleted,
  onDelete,
}: {
  exercise: ExerciseData
  isCompleted: boolean
  onDelete: () => void
}) {
  const [sets, setSets] = useState<SetData[]>(exercise.sets)

  function handleAddSet() {
    const lastSet = sets.at(-1)
    setSets((prev) => [
      ...prev,
      {
        id: null,
        setNumber: prev.length + 1,
        weightKg: lastSet?.weightKg ?? '',
        reps: lastSet?.reps ?? '',
        notes: '',
      },
    ])
  }

  function handleDeleteSet(index: number) {
    return (_savedId: string | null) => {
      setSets((prev) =>
        prev.filter((_, i) => i !== index).map((s, i) => ({ ...s, setNumber: i + 1 }))
      )
    }
  }

  async function handleDeleteExercise() {
    if (!window.confirm(`「${exercise.exerciseName}」を削除しますか？`)) return
    onDelete()
    await removeExerciseFromSession(exercise.sessionExerciseId)
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-4 space-y-3">
      <div className="flex items-start justify-between">
        <div>
          <p className="font-semibold text-gray-900">{exercise.exerciseName}</p>
          {exercise.exerciseNotes && (
            <p className="text-xs text-gray-400 mt-0.5">{exercise.exerciseNotes}</p>
          )}
        </div>
        {!isCompleted && (
          <button
            type="button"
            onClick={handleDeleteExercise}
            className="text-xs text-gray-400 hover:text-red-500 transition-colors"
          >
            削除
          </button>
        )}
      </div>

      {sets.length > 0 && (
        <div className="flex gap-2 pl-8">
          <p className="flex-1 text-center text-xs text-gray-400">重量 (kg)</p>
          <p className="flex-1 text-center text-xs text-gray-400">回数</p>
          <p className="flex-[2] text-center text-xs text-gray-400">メモ</p>
          <div className="w-6 shrink-0" />
        </div>
      )}

      <div className="space-y-2">
        {sets.map((set, index) => (
          <SetRow
            key={`${exercise.sessionExerciseId}-${index}`}
            set={set}
            sessionExerciseId={exercise.sessionExerciseId}
            displayIndex={index + 1}
            isCompleted={isCompleted}
            onDelete={handleDeleteSet(index)}
          />
        ))}
      </div>

      {!isCompleted && (
        <button
          type="button"
          onClick={handleAddSet}
          className="w-full rounded-lg border border-dashed border-gray-300 py-2 text-sm text-gray-400 hover:border-blue-300 hover:text-blue-500 transition-colors"
        >
          ＋ セット追加
        </button>
      )}
    </div>
  )
}

// ── AddExerciseModal ──────────────────────────────────────────────────────────

function AddExerciseModal({
  masterExercises,
  onAdd,
  onClose,
}: {
  masterExercises: MasterExercise[]
  onAdd: (name: string, id: string | null) => Promise<void>
  onClose: () => void
}) {
  const [query, setQuery] = useState('')
  const [adding, setAdding] = useState(false)

  const filtered = masterExercises.filter((e) =>
    e.name.toLowerCase().includes(query.toLowerCase())
  )
  const exactMatch = filtered.some((e) => e.name === query.trim())

  async function handleSelect(name: string, id: string | null) {
    setAdding(true)
    await onAdd(name, id)
    setAdding(false)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative flex max-h-[80vh] flex-col rounded-t-2xl bg-white p-4 space-y-3">
        <div className="flex items-center justify-between">
          <p className="font-semibold text-gray-900">種目を選択</p>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <input
          type="search"
          placeholder="種目名で検索、または新しい種目名を入力"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          autoFocus
          className="block w-full rounded-lg border border-gray-300 px-3 py-3 text-base text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />

        <div className="flex-1 overflow-y-auto space-y-1">
          {query.trim() && !exactMatch && (
            <button
              type="button"
              onClick={() => handleSelect(query.trim(), null)}
              disabled={adding}
              className="w-full rounded-lg px-3 py-3 text-left text-base text-blue-600 hover:bg-blue-50 active:bg-blue-100 transition-colors"
            >
              「{query.trim()}」として追加
            </button>
          )}
          {filtered.map((exercise) => (
            <button
              key={exercise.id}
              type="button"
              onClick={() => handleSelect(exercise.name, exercise.id)}
              disabled={adding}
              className="flex w-full items-center justify-between rounded-lg px-3 py-3 text-left text-base text-gray-900 hover:bg-gray-50 active:bg-gray-100 transition-colors"
            >
              <span>{exercise.name}</span>
              {exercise.category && (
                <span className="text-xs text-gray-400">{getCategoryLabel(exercise.category)}</span>
              )}
            </button>
          ))}
          {masterExercises.length === 0 && !query.trim() && (
            <p className="py-4 text-center text-sm text-gray-400">
              種目マスタが登録されていません
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

// ── SessionRecorder（メイン） ──────────────────────────────────────────────────

export default function SessionRecorder({
  sessionId,
  sessionDate,
  sessionStatus,
  sessionNotes,
  customerId,
  customerName,
  trainerName,
  initialExercises,
  masterExercises,
}: {
  sessionId: string
  sessionDate: string
  sessionStatus: string
  sessionNotes: string | null
  customerId: string
  customerName: string
  trainerName: string
  initialExercises: ExerciseData[]
  masterExercises: MasterExercise[]
}) {
  const router = useRouter()
  const [exercises, setExercises] = useState<ExerciseData[]>(initialExercises)
  const [modalOpen, setModalOpen] = useState(false)
  const [completing, setCompleting] = useState(false)
  const isCompleted = sessionStatus === 'completed'

  async function handleAddExercise(name: string, exerciseId: string | null) {
    const result = await addExerciseToSession(sessionId, name, exerciseId, exercises.length)
    if (result.error || !result.id) return
    setExercises((prev) => [
      ...prev,
      { sessionExerciseId: result.id!, exerciseName: name, exerciseNotes: '', sets: [] },
    ])
  }

  async function handleComplete() {
    if (!window.confirm('セッションを完了しますか？')) return
    setCompleting(true)
    const result = await completeSessionAction(sessionId)
    if (result.error) { setCompleting(false); return }
    router.push(`/customers/${customerId}`)
  }

  const formattedDate = new Date(sessionDate).toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'short',
  })

  return (
    <div className="space-y-4">
      {/* セッション情報 */}
      <div className="rounded-2xl border border-gray-200 bg-white p-4 space-y-1">
        <div className="flex items-center justify-between">
          <p className="text-lg font-bold text-gray-900">{customerName}</p>
          {isCompleted && (
            <span className="rounded-full border border-green-200 bg-green-50 px-2 py-0.5 text-xs font-medium text-green-700">
              完了
            </span>
          )}
        </div>
        <p className="text-sm text-gray-500">{formattedDate}</p>
        <p className="text-xs text-gray-400">担当: {trainerName}</p>
        {sessionNotes && (
          <p className="border-t border-gray-100 pt-2 text-sm text-gray-600">{sessionNotes}</p>
        )}
      </div>

      {/* 種目一覧 */}
      {exercises.length === 0 ? (
        <p className="py-8 text-center text-sm text-gray-400">種目を追加してください</p>
      ) : (
        <div className="space-y-3">
          {exercises.map((exercise) => (
            <ExerciseSection
              key={exercise.sessionExerciseId}
              exercise={exercise}
              isCompleted={isCompleted}
              onDelete={() =>
                setExercises((prev) =>
                  prev.filter((e) => e.sessionExerciseId !== exercise.sessionExerciseId)
                )
              }
            />
          ))}
        </div>
      )}

      {/* 種目追加ボタン */}
      {!isCompleted && (
        <button
          type="button"
          onClick={() => setModalOpen(true)}
          className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-gray-300 py-4 text-sm font-medium text-gray-400 hover:border-blue-400 hover:text-blue-500 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          種目を追加
        </button>
      )}

      {/* セッション完了ボタン */}
      {!isCompleted && (
        <button
          type="button"
          onClick={handleComplete}
          disabled={completing}
          className="w-full rounded-xl bg-green-600 px-4 py-4 text-base font-semibold text-white hover:bg-green-700 active:bg-green-800 disabled:opacity-50 transition-colors"
        >
          {completing ? '処理中…' : 'セッション完了'}
        </button>
      )}

      {/* 種目追加モーダル */}
      {modalOpen && (
        <AddExerciseModal
          masterExercises={masterExercises}
          onAdd={handleAddExercise}
          onClose={() => setModalOpen(false)}
        />
      )}
    </div>
  )
}
