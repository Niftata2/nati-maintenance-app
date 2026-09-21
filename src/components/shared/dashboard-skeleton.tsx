export function DashboardSkeleton() {
    return (
      <div className="space-y-6 animate-page-enter">
        {/* Header Skeleton */}
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <div className="h-8 w-48 rounded-md animate-shimmer" />
            <div className="h-4 w-32 rounded-md animate-shimmer" />
          </div>
          <div className="h-9 w-32 rounded-md animate-shimmer" />
        </div>
  
        {/* KPI Cards Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="p-6 rounded-lg border border-border bg-card space-y-3">
              <div className="h-4 w-24 rounded-md animate-shimmer" />
              <div className="h-8 w-32 rounded-md animate-shimmer" />
              <div className="h-3 w-20 rounded-md animate-shimmer" />
            </div>
          ))}
        </div>
  
        {/* Main Grid Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            <div className="rounded-lg border border-border bg-card p-6 space-y-4">
              <div className="h-6 w-48 rounded-md animate-shimmer" />
              <div className="h-[300px] w-full rounded-md animate-shimmer" />
            </div>
  
            <div className="rounded-lg border border-border bg-card p-6 space-y-4">
              <div className="h-6 w-32 rounded-md animate-shimmer" />
              <div className="space-y-2">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="h-12 w-full rounded-md animate-shimmer" />
                ))}
              </div>
            </div>
          </div>
  
          {/* Right Column */}
          <div className="space-y-6">
            <div className="rounded-lg border border-border bg-card p-6 space-y-4">
              <div className="h-6 w-40 rounded-md animate-shimmer" />
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-16 w-full rounded-md animate-shimmer" />
                ))}
              </div>
            </div>
            
            <div className="rounded-lg border border-border bg-card p-6 space-y-4">
              <div className="h-6 w-32 rounded-md animate-shimmer" />
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-12 w-full rounded-md animate-shimmer" />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }