export default function Loading() {
  return (
    <main className="bg-cream min-h-screen">
      {/* Category filter skeleton */}
      <div className="bg-chalk border-b border-mist px-4 py-3">
        <div className="max-w-7xl mx-auto flex gap-2 overflow-hidden">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="skeleton shrink-0 h-8 w-20 rounded-full" />
          ))}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="skeleton h-6 w-40 rounded-lg mb-6" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="bg-white rounded-[18px] border border-mist overflow-hidden shadow-card">
              <div className="skeleton" style={{ aspectRatio: '16/10' }} />
              <div className="p-5 space-y-3">
                <div className="skeleton h-4 w-full rounded" />
                <div className="skeleton h-4 w-3/4 rounded" />
                <div className="skeleton h-7 w-24 rounded" />
                <div className="skeleton h-11 w-full rounded-xl" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}
