import { SkeletonLine, SkeletonCard } from '@/components/Skeleton'

export default function CustomerDetailLoading() {
  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <div className="w-5 h-5 rounded bg-gray-200 animate-pulse" />
        <SkeletonLine className="w-32" />
      </div>
      <SkeletonCard>
        <div className="space-y-2">
          <SkeletonLine className="w-36" />
          <SkeletonLine className="w-24 h-3" />
        </div>
      </SkeletonCard>
      <div className="h-14 rounded-xl bg-gray-200 animate-pulse" />
      <div>
        <SkeletonLine className="w-28 mb-3" />
        <div className="space-y-2">
          {[...Array(3)].map((_, i) => (
            <SkeletonCard key={i}>
              <div className="flex justify-between items-center">
                <div className="space-y-2">
                  <SkeletonLine className="w-40" />
                  <SkeletonLine className="w-28 h-3" />
                </div>
                <div className="w-4 h-4 rounded bg-gray-200 animate-pulse" />
              </div>
            </SkeletonCard>
          ))}
        </div>
      </div>
    </div>
  )
}
