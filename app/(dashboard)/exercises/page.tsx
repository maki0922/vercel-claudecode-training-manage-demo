import { createClient } from '@/lib/supabase/server'
import { getCategoryLabel, EXERCISE_CATEGORIES } from '@/lib/constants/exercises'
import { AddExerciseForm, ExerciseItem } from '@/components/ExerciseForm'

export default async function ExercisesPage() {
  const supabase = await createClient()

  const { data: exercises, error } = await supabase
    .from('exercises')
    .select('id, name, category, notes')
    .order('name')

  if (error) {
    return <div className="text-red-600 text-sm">種目情報の取得に失敗しました</div>
  }

  // カテゴリ別にグループ化
  const categoryValues = [...EXERCISE_CATEGORIES.map((c) => c.value), null] as (string | null)[]
  const grouped = categoryValues.reduce<Record<string, typeof exercises>>((acc, cat) => {
    const key = cat ?? 'other'
    const items = exercises.filter((e) => e.category === cat)
    if (items.length > 0) acc[key] = items
    return acc
  }, {})

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900">種目マスタ</h1>
        <AddExerciseForm />
      </div>

      {exercises.length === 0 ? (
        <div className="text-center py-16 text-gray-400 text-sm">
          種目が登録されていません
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(grouped).map(([categoryKey, items]) => (
            <div key={categoryKey}>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">
                {categoryKey === 'other' ? 'その他' : getCategoryLabel(categoryKey)}
              </p>
              <ul className="space-y-2">
                {items.map((exercise) => (
                  <li key={exercise.id}>
                    <ExerciseItem exercise={exercise} />
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
