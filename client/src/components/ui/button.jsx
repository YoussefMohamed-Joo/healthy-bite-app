import { forwardRef } from 'react'
import { cn } from '@/lib/utils'

const Button = forwardRef(({ className, variant = 'default', size = 'default', ...props }, ref) => {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-bold transition-all duration-200 cursor-pointer select-none',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50',
        'disabled:pointer-events-none disabled:opacity-50',
        variant === 'default' && 'bg-primary text-white shadow-lg shadow-primary/30 hover:bg-primary-dark hover:scale-[1.03] hover:shadow-xl hover:shadow-primary/40',
        variant === 'outline' && 'border-2 border-primary text-primary bg-transparent hover:bg-primary hover:text-white hover:scale-[1.03]',
        variant === 'secondary' && 'bg-white text-charcoal hover:bg-gray-100',
        variant === 'ghost' && 'text-grey bg-transparent hover:bg-gray-100 hover:text-charcoal',
        variant === 'danger' && 'bg-red-500 text-white hover:bg-red-600',
        size === 'default' && 'h-12 px-8 text-base',
        size === 'lg' && 'h-14 px-10 text-lg',
        size === 'sm' && 'h-9 px-5 text-sm',
        className
      )}
      ref={ref}
      {...props}
    />
  )
})
Button.displayName = 'Button'
export { Button }
