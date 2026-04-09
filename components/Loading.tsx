export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-[#0A2540] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-500">Loading...</p>
      </div>
    </div>
  )
}

// Skeleton card for job lists
export function JobCardSkeleton() {
  return (
    <div className="bg-white rounded-xl shadow-sm p-6 animate-pulse">
      <div className="flex justify-between items-start mb-3">
        <div className="h-6 bg-gray-200 rounded w-2/3"></div>
        <div className="h-5 bg-gray-200 rounded-full w-20"></div>
      </div>
      <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
      <div className="h-4 bg-gray-200 rounded w-4/5 mb-4"></div>
      <div className="flex justify-between items-center">
        <div className="h-4 bg-gray-200 rounded w-1/3"></div>
        <div className="h-9 bg-gray-200 rounded-lg w-32"></div>
      </div>
    </div>
  )
}

// Skeleton for dashboard stats row
export function StatsRowSkeleton() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
      {[0, 1, 2, 3, 4, 5].map(i => (
        <div key={i} className="bg-white rounded-xl p-4 animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-12 mx-auto mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-20 mx-auto"></div>
        </div>
      ))}
    </div>
  )
}

// Skeleton for home page stats
export function HeroStatsSkeleton() {
  return (
    <div className="grid grid-cols-4 gap-4 mb-8">
      {[0, 1, 2, 3].map(i => (
        <div key={i} className="bg-white/10 rounded-lg p-4 backdrop-blur animate-pulse">
          <div className="h-8 bg-white/20 rounded w-12 mx-auto mb-2"></div>
          <div className="h-4 bg-white/20 rounded w-16 mx-auto"></div>
        </div>
      ))}
    </div>
  )
}
