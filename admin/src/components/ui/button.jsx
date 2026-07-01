import { forwardRef } from 'react'
import { cn } from '@/lib/utils'

const Button = forwardRef(({ className, variant = 'default', size = 'default', ...props }, ref) => {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-bold transition-all duration-200 cursor-pointer',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/50',
        'disabled:pointer-events-none disabled:opacity-50',
        variant === 'default' && 'bg-brand text-white hover:bg-brand-dark',
        variant === 'outline' && 'border border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50',
        variant === 'ghost' && 'text-zinc-600 hover:bg-zinc-100',
        variant === 'danger' && 'bg-red-500 text-white hover:bg-red-600',
        size === 'default' && 'h-10 px-5',
        size === 'sm' && 'h-8 px-3 text-xs',
        size === 'lg' && 'h-12 px-8',
        className
      )}
      ref={ref}
      {...props}
    />
  )
})
Button.displayName = 'Button'
export { Button }
