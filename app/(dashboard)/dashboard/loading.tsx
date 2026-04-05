import { SkeletonLine, SkeletonCard } from '@/components/Skeleton'

export default function DashboardLoading() {
  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <div className="h-14 rounded-xl bg-gray-200 animate-pulse" />
        <div className="h-14 rounded-xl bg-gray-100 animate-pulse" />
      </div>
      <div>
        <SkeletonLine className="w-32 mb-3" />
        <div className="space-y-2">
          {[...Array(4)].map((_, i) => (
            <SkeletonCard key={i}>
              <div className="flex justify-between">
                <div className="space-y-2 flex-1">
                  <SkeletonLine className="w-28" />
                  <SkeletonLine className="w-40 h-3" />
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
