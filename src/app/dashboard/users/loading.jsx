import { StatsSkeleton } from '@/components/SkeletonLoader';

export default function UsersLoading() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="h-8 bg-muted rounded w-32 animate-pulse"></div>
          <div className="h-4 bg-muted rounded w-64 animate-pulse"></div>
        </div>
        <div className="h-10 w-28 bg-muted rounded-lg animate-pulse"></div>
      </div>
      <StatsSkeleton />
      <div className="bg-card rounded-lg shadow-sm border border-border p-6">
        <div className="flex justify-between items-center">
          <div className="h-10 bg-muted rounded-lg w-64 animate-pulse"></div>
          <div className="flex gap-2">
            <div className="h-10 w-20 bg-muted rounded-lg animate-pulse"></div>
            <div className="h-10 w-28 bg-muted rounded-lg animate-pulse"></div>
          </div>
        </div>
      </div>
      <div className="bg-card rounded-lg shadow-sm border border-border overflow-hidden">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex items-center gap-4 p-4 border-b border-border animate-pulse">
            <div className="h-10 w-10 bg-muted rounded-full"></div>
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-muted rounded w-48"></div>
              <div className="h-3 bg-muted rounded w-32"></div>
            </div>
            <div className="h-6 w-16 bg-muted rounded-full"></div>
          </div>
        ))}
      </div>
    </div>
  );
}
