import { SkeletonLine, SkeletonCard } from '@/components/Skeleton'

export default function SessionDetailLoading() {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="w-5 h-5 rounded bg-gray-200 animate-pulse" />
        <SkeletonLine className="w-32" />
      </div>
      <SkeletonCard>
        <div className="space-y-2">
          <SkeletonLine className="w-36" />
          <SkeletonLine className="w-24 h-3" />
          <SkeletonLine className="w-20 h-3" />
        </div>
      </SkeletonCard>
      {[...Array(2)].map((_, i) => (
        <SkeletonCard key={i}>
          <div className="space-y-3">
            <SkeletonLine className="w-28" />
            <div className="flex gap-2 pl-8">
              <SkeletonLine className="flex-1 h-3" />
              <SkeletonLine className="flex-1 h-3" />
              <SkeletonLine className="flex-[2] h-3" />
            </div>
            {[...Array(3)].map((_, j) => (
              <div key={j} className="flex gap-2 items-center pl-8">
                <div className="flex-1 h-10 rounded-lg bg-gray-100 animate-pulse" />
                <div className="flex-1 h-10 rounded-lg bg-gray-100 animate-pulse" />
                <div className="flex-[2] h-10 rounded-lg bg-gray-100 animate-pulse" />
                <div className="w-6 h-6 rounded bg-gray-100 animate-pulse" />
              </div>
            ))}
          </div>
        </SkeletonCard>
      ))}
      <div className="h-14 rounded-xl bg-gray-200 animate-pulse" />
      <div className="h-14 rounded-xl bg-gray-200 animate-pulse" />
    </div>
  )
}
