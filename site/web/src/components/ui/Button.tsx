import React from 'react'
import { motion } from 'framer-motion'
import { cn } from '../../lib/utils'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'gradient' | 'danger'
  size?: 'sm' | 'md' | 'lg' | 'xl'
  loading?: boolean
  icon?: React.ReactNode
  iconPosition?: 'left' | 'right'
  fullWidth?: boolean
  animated?: boolean
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({
    className,
    variant = 'primary',
    size = 'md',
    loading = false,
    icon,
    iconPosition = 'left',
    fullWidth = false,
    animated = true,
    asChild = false,
    disabled,
    children,
    ...props
  }, ref) => {
    const baseClasses = cn(
      'relative inline-flex items-center justify-center font-medium rounded-xl',
      'transition-all duration-200 ease-in-out',
      'focus:outline-none focus:ring-2 focus:ring-offset-2',
      'disabled:opacity-50 disabled:cursor-not-allowed',
      {
        'w-full': fullWidth,
      }
    )

    const variants = {
      primary: cn(
        'bg-gradient-to-r from-primary-500 to-primary-600',
        'hover:from-primary-600 hover:to-primary-700',
        'text-white shadow-lg hover:shadow-xl',
        'focus:ring-primary-500',
        animated && 'hover:scale-105 active:scale-95'
      ),
      secondary: cn(
        'bg-gradient-to-r from-secondary-500 to-secondary-600',
        'hover:from-secondary-600 hover:to-secondary-700',
        'text-white shadow-lg hover:shadow-xl',
        'focus:ring-secondary-500',
        animated && 'hover:scale-105 active:scale-95'
      ),
      outline: cn(
        'border-2 border-neutral-300 bg-white',
        'hover:border-primary-500 hover:bg-primary-50',
        'text-neutral-700 hover:text-primary-700',
        'focus:ring-primary-500',
        animated && 'hover:scale-105 active:scale-95'
      ),
      ghost: cn(
        'bg-transparent hover:bg-neutral-100',
        'text-neutral-700 hover:text-neutral-900',
        'focus:ring-neutral-500',
        animated && 'hover:scale-105 active:scale-95'
      ),
      gradient: cn(
        'bg-gradient-to-r from-accent-500 via-primary-500 to-secondary-500',
        'hover:from-accent-600 hover:via-primary-600 hover:to-secondary-600',
        'text-white shadow-lg hover:shadow-xl',
        'focus:ring-primary-500',
        animated && 'hover:scale-105 active:scale-95 animate-glow'
      ),
      danger: cn(
        'bg-gradient-to-r from-red-500 to-red-600',
        'hover:from-red-600 hover:to-red-700',
        'text-white shadow-lg hover:shadow-xl',
        'focus:ring-red-500',
        animated && 'hover:scale-105 active:scale-95'
      ),
    }

    const sizes = {
      sm: 'px-3 py-2 text-sm gap-2',
      md: 'px-4 py-3 text-base gap-2',
      lg: 'px-6 py-4 text-lg gap-3',
      xl: 'px-8 py-5 text-xl gap-3',
    }

    // If rendering as child (e.g., React Router Link), clone it with button styles
    if (asChild && React.isValidElement(children)) {
      const child = children as React.ReactElement<any>
      const composedClassName = cn(baseClasses, variants[variant], sizes[size], child.props.className, className)

      const handleClick: React.MouseEventHandler = (e) => {
        if (disabled || loading) {
          e.preventDefault()
          e.stopPropagation()
          return
        }
        if (typeof (props as any).onClick === 'function') (props as any).onClick(e)
        if (typeof child.props.onClick === 'function') child.props.onClick(e)
      }

      return React.cloneElement(
        child,
        {
          className: composedClassName,
          onClick: handleClick,
          'aria-disabled': disabled || loading ? true : undefined,
          tabIndex: disabled || loading ? -1 : child.props.tabIndex,
        },
        (
          <>
            {loading && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              </div>
            )}
            <div className={cn('flex items-center gap-2', { 'opacity-0': loading })}>
              {icon && iconPosition === 'left' && (
                <span className="flex-shrink-0">{icon}</span>
              )}
              {child.props.children}
              {icon && iconPosition === 'right' && (
                <span className="flex-shrink-0">{icon}</span>
              )}
            </div>
          </>
        )
      )
    }

    const ButtonComponent = animated ? motion.button : 'button'
    const motionProps = animated ? {
      whileHover: { scale: disabled ? 1 : 1.05 },
      whileTap: { scale: disabled ? 1 : 0.95 },
      transition: { type: 'spring', stiffness: 400, damping: 17 }
    } : {}

    return (
      <ButtonComponent
        ref={ref}
        className={cn(
          baseClasses,
          variants[variant],
          sizes[size],
          className
        )}
        disabled={disabled || loading}
        {...motionProps}
        {...props}
      >
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          </div>
        )}
        
        <div className={cn('flex items-center gap-2', { 'opacity-0': loading })}>
          {icon && iconPosition === 'left' && (
            <span className="flex-shrink-0">{icon}</span>
          )}
          {children}
          {icon && iconPosition === 'right' && (
            <span className="flex-shrink-0">{icon}</span>
          )}
        </div>
      </ButtonComponent>
    )
  }
)

Button.displayName = 'Button'

export { Button }