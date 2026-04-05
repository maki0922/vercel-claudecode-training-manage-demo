export function SkeletonLine({ className = '' }: { className?: string }) {
  return <div className={`h-4 rounded bg-gray-200 animate-pulse ${className}`} />
}

export function SkeletonCard({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-4">
      {children}
    </div>
  )
}
