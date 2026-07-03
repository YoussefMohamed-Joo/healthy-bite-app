import { forwardRef } from 'react'
import { cn } from '@/lib/utils'

const Button = forwardRef(({ className, variant = 'default', size = 'default', ...props }, ref) => {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center gap-2 whitespace-nowrap font-cairo text-sm font-bold transition-all duration-200 cursor-pointer select-none',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40',
        'disabled:pointer-events-none disabled:opacity-50',
        variant === 'default' && 'bg-primary text-cream shadow-sm hover:bg-primary-dark hover:shadow-md',
        variant === 'outline' && 'border border-primary text-primary bg-transparent hover:bg-primary hover:text-cream',
        variant === 'secondary' && 'bg-cream text-charcoal border border-card-border hover:bg-white',
        variant === 'ghost' && 'text-grey bg-transparent hover:bg-brand-light/30 hover:text-charcoal',
        variant === 'danger' && 'bg-red-600 text-white hover:bg-red-700',
        size === 'default' && 'h-11 px-7 text-base',
        size === 'lg' && 'h-13 px-9 text-lg',
        size === 'sm' && 'h-8 px-5 text-sm',
        className
      )}
      ref={ref}
      {...props}
    />
  )
})
Button.displayName = 'Button'
export { Button }
