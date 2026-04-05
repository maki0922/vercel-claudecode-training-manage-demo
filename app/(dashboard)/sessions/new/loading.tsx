import { SkeletonLine, SkeletonCard } from '@/components/Skeleton'

export default function SessionNewLoading() {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="w-5 h-5 rounded bg-gray-200 animate-pulse" />
        <SkeletonLine className="w-32" />
      </div>
      <SkeletonCard>
        <div className="space-y-5">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="space-y-1">
              <SkeletonLine className="w-16 h-3" />
              <div className="h-12 rounded-lg bg-gray-100 animate-pulse" />
            </div>
          ))}
          <div className="h-14 rounded-lg bg-gray-200 animate-pulse" />
        </div>
      </SkeletonCard>
    </div>
  )
}
