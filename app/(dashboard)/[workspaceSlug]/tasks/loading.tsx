import { Skeleton } from '@/components/ui/skeleton'

export default function TasksLoading() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-8 w-24" />
          <Skeleton className="h-4 w-20" />
        </div>
        <Skeleton className="h-9 w-32" />
      </div>
      <div className="flex gap-3">
        <Skeleton className="h-9 flex-1" />
        <Skeleton className="h-9 w-44" />
        <Skeleton className="h-9 w-44" />
      </div>
      <div className="rounded-md border divide-y">
        {[...Array(7)].map((_, i) => (
          <div key={i} className="flex items-center gap-3 px-4 py-3">
            <Skeleton className="h-5 w-16 rounded-full" />
            <div className="flex-1 space-y-1">
              <Skeleton className="h-4 w-56" />
            </div>
            <Skeleton className="h-7 w-36" />
            <Skeleton className="h-6 w-6 rounded-full" />
            <Skeleton className="h-7 w-7" />
          </div>
        ))}
      </div>
    </div>
  )
}
