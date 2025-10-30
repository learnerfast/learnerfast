export default function WebsitesLoading() {
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="h-9 bg-muted rounded w-32 animate-pulse"></div>
          <div className="h-5 bg-muted rounded w-48 animate-pulse"></div>
        </div>
        <div className="h-10 w-40 bg-muted rounded-lg animate-pulse"></div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="bg-card rounded-xl shadow-subtle border border-border overflow-hidden animate-pulse">
            <div className="aspect-video bg-muted"></div>
            <div className="p-5 space-y-3">
              <div className="h-5 bg-muted rounded w-3/4"></div>
              <div className="h-4 bg-muted rounded w-full"></div>
              <div className="flex justify-between pt-2">
                <div className="h-4 bg-muted rounded w-24"></div>
                <div className="h-8 w-20 bg-muted rounded-lg"></div>
              </div>
              <div className="flex gap-2 pt-2">
                <div className="h-8 w-16 bg-muted rounded-md"></div>
                <div className="h-8 w-20 bg-muted rounded-md"></div>
                <div className="h-8 w-16 bg-muted rounded-md"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
