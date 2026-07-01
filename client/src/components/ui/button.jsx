import { forwardRef } from 'react'
import { cn } from '@/lib/utils'

const Button = forwardRef(({ className, variant = 'default', size = 'default', ...props }, ref) => {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-bold transition-all duration-200 cursor-pointer select-none',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/50',
        'disabled:pointer-events-none disabled:opacity-50',
        variant === 'default' && 'bg-brand text-white shadow-lg shadow-brand/30 hover:bg-brand-dark hover:scale-[1.03] hover:shadow-xl hover:shadow-brand/40',
        variant === 'outline' && 'border-2 border-white/35 text-white bg-transparent hover:border-white hover:bg-white/10 hover:scale-[1.03]',
        variant === 'secondary' && 'bg-white text-zinc-900 hover:bg-gray-100',
        variant === 'ghost' && 'text-zinc-600 bg-transparent hover:bg-zinc-100',
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
