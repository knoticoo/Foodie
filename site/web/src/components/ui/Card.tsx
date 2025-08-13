import React from 'react'
import { motion } from 'framer-motion'
import { cn } from '../../lib/utils'

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'elevated' | 'bordered' | 'glass' | 'gradient'
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl'
  hoverable?: boolean
  animated?: boolean
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({
    className,
    variant = 'default',
    padding = 'md',
    hoverable = false,
    animated = true,
    children,
    ...props
  }, ref) => {
    const baseClasses = cn(
      'rounded-xl transition-all duration-200 ease-in-out',
      {
        'cursor-pointer': hoverable,
      }
    )

    const variants = {
      default: cn(
        'bg-white shadow-md',
        hoverable && 'hover:shadow-lg hover:shadow-neutral-200/50'
      ),
      elevated: cn(
        'bg-white shadow-xl shadow-neutral-200/60',
        hoverable && 'hover:shadow-2xl hover:shadow-neutral-300/60'
      ),
      bordered: cn(
        'bg-white border border-neutral-200',
        hoverable && 'hover:border-primary-300 hover:shadow-md'
      ),
      glass: cn(
        'bg-white/80 backdrop-blur-sm border border-white/20',
        'shadow-lg shadow-neutral-900/5',
        hoverable && 'hover:bg-white/90 hover:shadow-xl'
      ),
      gradient: cn(
        'bg-gradient-to-br from-white to-neutral-50',
        'shadow-lg border border-neutral-100',
        hoverable && 'hover:from-neutral-50 hover:to-neutral-100 hover:shadow-xl'
      ),
    }

    const paddings = {
      none: '',
      sm: 'p-4',
      md: 'p-6',
      lg: 'p-8',
      xl: 'p-10',
    }

    const CardComponent = animated ? motion.div : 'div'
    const motionProps = animated && hoverable ? {
      whileHover: { 
        scale: 1.02,
        y: -2,
        transition: { type: 'spring', stiffness: 400, damping: 17 }
      },
      whileTap: { scale: 0.98 }
    } : {}

    return (
      <CardComponent
        ref={ref}
        className={cn(
          baseClasses,
          variants[variant],
          paddings[padding],
          className
        )}
        {...motionProps}
        {...props}
      >
        {children}
      </CardComponent>
    )
  }
)

Card.displayName = 'Card'

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('flex flex-col space-y-1.5 p-6', className)}
    {...props}
  />
))
CardHeader.displayName = 'CardHeader'

const CardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn('font-display text-xl font-semibold leading-none tracking-tight', className)}
    {...props}
  />
))
CardTitle.displayName = 'CardTitle'

const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn('text-sm text-neutral-600', className)}
    {...props}
  />
))
CardDescription.displayName = 'CardDescription'

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn('p-6 pt-0', className)} {...props} />
))
CardContent.displayName = 'CardContent'

const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('flex items-center p-6 pt-0', className)}
    {...props}
  />
))
CardFooter.displayName = 'CardFooter'

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent }