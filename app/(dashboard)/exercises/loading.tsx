import { SkeletonLine, SkeletonCard } from '@/components/Skeleton'

export default function ExercisesLoading() {
  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <SkeletonLine className="w-24" />
        <div className="h-9 w-24 rounded-lg bg-gray-200 animate-pulse" />
      </div>
      {[['w-8', 3], ['w-12', 4], ['w-6', 2]].map(([labelW, count], gi) => (
        <div key={gi}>
          <SkeletonLine className={`${labelW} h-3 mb-2`} />
          <div className="space-y-2">
            {[...Array(count as number)].map((_, i) => (
              <SkeletonCard key={i}>
                <div className="flex justify-between items-center">
                  <SkeletonLine className="w-32" />
                  <div className="flex gap-2">
                    <SkeletonLine className="w-8 h-3" />
                    <SkeletonLine className="w-8 h-3" />
                  </div>
                </div>
              </SkeletonCard>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
