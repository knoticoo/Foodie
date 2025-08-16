import React from 'react'
import { motion } from 'framer-motion'
import { cn } from '../../lib/utils'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  variant?: 'default' | 'filled' | 'outline' | 'ghost'
  inputSize?: 'sm' | 'md' | 'lg'
  error?: boolean
  errorMessage?: string
  label?: string
  helper?: string
  icon?: React.ReactNode
  iconPosition?: 'left' | 'right'
  animated?: boolean
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({
    className,
    variant = 'default',
    inputSize = 'md',
    error = false,
    errorMessage,
    label,
    helper,
    icon,
    iconPosition = 'left',
    animated = true,
    ...props
  }, ref) => {
    const [isFocused, setIsFocused] = React.useState(false)
    const [hasValue, setHasValue] = React.useState(!!props.value || !!props.defaultValue)

    const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(true)
      props.onFocus?.(e)
    }

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(false)
      props.onBlur?.(e)
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setHasValue(!!e.target.value)
      props.onChange?.(e)
    }

    const baseClasses = cn(
      'w-full rounded-lg font-medium transition-all duration-200',
      'focus:outline-none focus:ring-2 focus:ring-offset-1',
      'disabled:opacity-50 disabled:cursor-not-allowed',
             'text-neutral-900 text-left placeholder:text-neutral-500',
{
        'pl-11': icon && iconPosition === 'left', // Increased padding to prevent text overlap
        'pr-11': icon && iconPosition === 'right',
      }
    )

    const variants = {
      default: cn(
        'border border-neutral-300 bg-white',
        'hover:border-neutral-400',
        error 
          ? 'border-red-500 focus:border-red-500 focus:ring-red-500' 
          : 'focus:border-primary-500 focus:ring-primary-500'
      ),
      filled: cn(
        'border-0 bg-neutral-100',
        'hover:bg-neutral-200',
        error 
          ? 'bg-red-50 focus:bg-red-100 focus:ring-red-500' 
          : 'focus:bg-white focus:ring-primary-500'
      ),
      outline: cn(
        'border-2 border-neutral-200 bg-transparent',
        'hover:border-neutral-300',
        error 
          ? 'border-red-400 focus:border-red-500 focus:ring-red-500' 
          : 'focus:border-primary-500 focus:ring-primary-500'
      ),
      ghost: cn(
        'border-0 bg-transparent border-b-2 border-neutral-300 rounded-none',
        'hover:border-neutral-400',
        error 
          ? 'border-red-500 focus:border-red-500 focus:ring-red-500' 
          : 'focus:border-primary-500 focus:ring-primary-500'
      ),
    }

    const sizes = {
      sm: 'px-3 py-2 text-sm',
      md: 'px-4 py-3 text-base',
      lg: 'px-5 py-4 text-lg',
    }

    const InputComponent = animated ? motion.input : 'input'
    const motionProps = animated ? {
      initial: { scale: 1 },
      whileFocus: { scale: 1.02 },
      transition: { type: 'spring', stiffness: 400, damping: 17 }
    } : {}

    return (
      <div className="w-full text-left text-neutral-900">
        {label && (
          <motion.label
            className={cn(
              'block text-sm font-medium mb-2 transition-colors duration-200',
              error ? 'text-red-600' : 'text-neutral-700',
              isFocused && !error && 'text-primary-600'
            )}
            animate={animated ? {
              scale: isFocused || hasValue ? 0.95 : 1,
              color: error ? '#dc2626' : isFocused ? '#2563eb' : '#374151'
            } : {}}
            transition={{ duration: 0.2 }}
          >
            {label}
          </motion.label>
        )}
        
        <div className="relative">
          <InputComponent
            ref={ref}
            className={cn(
              baseClasses,
              variants[variant],
              sizes[inputSize],
              className
            )}
            onFocus={handleFocus}
            onBlur={handleBlur}
            onChange={handleChange}
            {...motionProps}
            {...props}
          />
          
          {icon && (
            <div className={cn(
              'absolute top-1/2 transform -translate-y-1/2 text-neutral-400',
              'transition-colors duration-200',
              {
                'left-3': iconPosition === 'left',
                'right-3': iconPosition === 'right',
                'text-primary-500': isFocused && !error,
                'text-red-500': error,
              }
            )}>
              {icon}
            </div>
          )}
        </div>

        {(helper || errorMessage) && (
          <motion.p
            className={cn(
              'mt-2 text-sm transition-colors duration-200',
              error ? 'text-red-600' : 'text-neutral-500'
            )}
            initial={animated ? { opacity: 0, y: -10 } : {}}
            animate={animated ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.2 }}
          >
            {error ? errorMessage : helper}
          </motion.p>
        )}
      </div>
    )
  }
)

Input.displayName = 'Input'

export { Input }