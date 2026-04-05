import { SkeletonLine, SkeletonCard } from '@/components/Skeleton'

export default function CustomersLoading() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <SkeletonLine className="w-24" />
        <div className="h-9 w-24 rounded-lg bg-gray-200 animate-pulse" />
      </div>
      <div className="h-12 rounded-lg bg-gray-200 animate-pulse" />
      <div className="space-y-2">
        {[...Array(5)].map((_, i) => (
          <SkeletonCard key={i}>
            <div className="flex justify-between items-center">
              <div className="space-y-2">
                <SkeletonLine className="w-32" />
                <SkeletonLine className="w-20 h-3" />
              </div>
              <SkeletonLine className="w-12 h-3" />
            </div>
          </SkeletonCard>
        ))}
      </div>
    </div>
  )
}
