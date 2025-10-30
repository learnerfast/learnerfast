import { StatsSkeleton } from '@/components/SkeletonLoader';

export default function DashboardLoading() {
  return (
    <div className="space-y-8 p-6">
      <div className="space-y-2">
        <div className="h-9 bg-muted rounded w-48 animate-pulse"></div>
        <div className="h-5 bg-muted rounded w-96 animate-pulse"></div>
      </div>
      <StatsSkeleton />
      <div className="bg-card rounded-xl shadow-subtle border border-border p-6">
        <div className="h-6 bg-muted rounded w-32 mb-4 animate-pulse"></div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="p-6 border-2 border-border rounded-lg animate-pulse">
              <div className="h-10 w-10 bg-muted rounded mx-auto mb-3"></div>
              <div className="h-4 bg-muted rounded w-32 mx-auto mb-2"></div>
              <div className="h-3 bg-muted rounded w-24 mx-auto"></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
