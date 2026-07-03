export function Skeleton({ className = '', width, height, rounded = 'xl' }) {
  const borderRadius = {
    xs: 'rounded-sm',
    sm: 'rounded',
    md: 'rounded-md',
    lg: 'rounded-lg',
    xl: 'rounded-xl',
    '2xl': 'rounded-2xl',
    full: 'rounded-full',
  }

  return (
    <div
      className={`bg-[#E8F5E9]/60 animate-pulse ${borderRadius[rounded] || rounded} ${className}`}
      style={{ width, height }}
    />
  )
}

export function ProductCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
      <Skeleton className="w-full h-48" rounded="none" />
      <div className="p-4 space-y-3">
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="h-4 w-full" />
        <div className="flex items-center justify-between pt-2">
          <Skeleton className="h-6 w-20" />
          <Skeleton className="h-10 w-24" rounded="xl" />
        </div>
      </div>
    </div>
  )
}

export function OrderCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-4 space-y-3">
      <div className="flex items-center justify-between">
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-6 w-20" rounded="full" />
      </div>
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-4 w-1/2" />
      <div className="flex gap-2 pt-2">
        <Skeleton className="h-9 w-24" rounded="xl" />
        <Skeleton className="h-9 w-24" rounded="xl" />
      </div>
    </div>
  )
}

export function TableRowSkeleton({ cols = 5, rows = 5 }) {
  return (
    <>
      {Array.from({ length: rows }).map((_, i) => (
        <tr key={i} className="border-b border-gray-50">
          {Array.from({ length: cols }).map((_, j) => (
            <td key={j} className="px-4 py-3">
              <Skeleton className="h-4 w-full" />
            </td>
          ))}
        </tr>
      ))}
    </>
  )
}
