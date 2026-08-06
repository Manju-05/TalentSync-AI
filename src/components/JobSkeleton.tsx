import { Skeleton } from "@/components/ui/skeleton";

export function JobSkeleton() {
  return (
    <div className="rounded-2xl border border-border/60 bg-card p-6 shadow-sm">
      <Skeleton className="h-6 w-3/4" />
      <div className="mt-4 flex flex-wrap gap-4">
        <Skeleton className="h-4 w-28" />
        <Skeleton className="h-4 w-28" />
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        <Skeleton className="h-6 w-16 rounded-full" />
        <Skeleton className="h-6 w-16 rounded-full" />
        <Skeleton className="h-6 w-16 rounded-full" />
      </div>
      <Skeleton className="mt-5 h-9 w-28 rounded-full" />
    </div>
  );
}

export function JobSkeletonList({ count = 3 }: { count?: number }) {
  return (
    <div className="mt-8 grid gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <JobSkeleton key={i} />
      ))}
    </div>
  );
}
