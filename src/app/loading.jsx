import { StatsSkeleton } from '@/components/SkeletonLoader';

export default function Loading() {
  return (
    <div className="min-h-screen p-8">
      <div className="space-y-8">
        <div className="space-y-2">
          <div className="h-8 bg-muted rounded w-48 animate-pulse"></div>
          <div className="h-4 bg-muted rounded w-96 animate-pulse"></div>
        </div>
        <StatsSkeleton />
      </div>
    </div>
  );
}
