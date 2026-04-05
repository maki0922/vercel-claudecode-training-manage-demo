export const EXERCISE_CATEGORIES = [
  { value: 'chest',    label: '胸' },
  { value: 'back',     label: '背中' },
  { value: 'shoulder', label: '肩' },
  { value: 'arm',      label: '腕' },
  { value: 'leg',      label: '脚' },
  { value: 'core',     label: '体幹' },
  { value: 'cardio',   label: '有酸素' },
] as const

export type ExerciseCategory = (typeof EXERCISE_CATEGORIES)[number]['value']

export function getCategoryLabel(value: string | null): string {
  return EXERCISE_CATEGORIES.find((c) => c.value === value)?.label ?? 'その他'
}
