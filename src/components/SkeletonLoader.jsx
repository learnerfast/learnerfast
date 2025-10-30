export const CardSkeleton = () => (
  <div className="bg-card rounded-xl shadow-subtle border border-border p-6 animate-pulse">
    <div className="flex items-start justify-between">
      <div className="space-y-3 flex-1">
        <div className="h-4 bg-muted rounded w-24"></div>
        <div className="h-8 bg-muted rounded w-16"></div>
      </div>
      <div className="h-12 w-12 bg-muted rounded-lg"></div>
    </div>
    <div className="mt-4 flex items-center gap-2">
      <div className="h-4 bg-muted rounded w-12"></div>
      <div className="h-4 bg-muted rounded w-32"></div>
    </div>
  </div>
);

export const StatsSkeleton = () => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
    {[...Array(4)].map((_, i) => <CardSkeleton key={i} />)}
  </div>
);

export const TableRowSkeleton = () => (
  <div className="flex items-center gap-4 p-4 border-b border-border animate-pulse">
    <div className="h-10 w-10 bg-muted rounded-full"></div>
    <div className="flex-1 space-y-2">
      <div className="h-4 bg-muted rounded w-3/4"></div>
      <div className="h-3 bg-muted rounded w-1/2"></div>
    </div>
  </div>
);
