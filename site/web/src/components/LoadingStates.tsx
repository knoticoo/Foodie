import React from 'react';
import { motion } from 'framer-motion';
import { Loader2, ChefHat, Clock, Utensils } from 'lucide-react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'primary' | 'secondary' | 'white';
  className?: string;
}

interface LoadingSkeletonProps {
  variant?: 'text' | 'card' | 'avatar' | 'recipe' | 'list';
  count?: number;
  className?: string;
}

interface LoadingOverlayProps {
  message?: string;
  show: boolean;
  transparent?: boolean;
}

interface FullPageLoadingProps {
  message?: string;
  submessage?: string;
  variant?: 'cooking' | 'recipes' | 'default';
}

// Spinner Component
export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  variant = 'primary',
  className = '',
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-12 h-12',
  };

  const variantClasses = {
    primary: 'text-blue-600',
    secondary: 'text-gray-600',
    white: 'text-white',
  };

  return (
    <Loader2
      className={`animate-spin ${sizeClasses[size]} ${variantClasses[variant]} ${className}`}
    />
  );
};

// Skeleton Components
export const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({
  variant = 'text',
  count = 1,
  className = '',
}) => {
  const skeletonVariants = {
    text: () => (
      <div className="space-y-2">
        {Array.from({ length: count }).map((_, i) => (
          <motion.div
            key={i}
            className={`h-4 bg-gray-200 rounded animate-pulse ${className}`}
            style={{ width: `${Math.random() * 30 + 70}%` }}
            initial={{ opacity: 0.6 }}
            animate={{ opacity: [0.6, 1, 0.6] }}
            transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.1 }}
          />
        ))}
      </div>
    ),

    card: () => (
      <div className={`bg-white rounded-xl border border-gray-200 p-6 ${className}`}>
        <motion.div
          className="flex items-center space-x-4"
          initial={{ opacity: 0.6 }}
          animate={{ opacity: [0.6, 1, 0.6] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          <div className="w-12 h-12 bg-gray-200 rounded-lg animate-pulse" />
          <div className="space-y-2 flex-1">
            <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4" />
            <div className="h-3 bg-gray-200 rounded animate-pulse w-1/2" />
          </div>
        </motion.div>
      </div>
    ),

    avatar: () => (
      <motion.div
        className={`w-10 h-10 bg-gray-200 rounded-full animate-pulse ${className}`}
        initial={{ opacity: 0.6 }}
        animate={{ opacity: [0.6, 1, 0.6] }}
        transition={{ duration: 1.5, repeat: Infinity }}
      />
    ),

    recipe: () => (
      <div className={`bg-white rounded-xl border border-gray-200 overflow-hidden ${className}`}>
        <motion.div
          className="h-48 bg-gray-200 animate-pulse"
          initial={{ opacity: 0.6 }}
          animate={{ opacity: [0.6, 1, 0.6] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        />
        <div className="p-4 space-y-3">
          <div className="h-5 bg-gray-200 rounded animate-pulse w-3/4" />
          <div className="h-4 bg-gray-200 rounded animate-pulse w-full" />
          <div className="h-4 bg-gray-200 rounded animate-pulse w-5/6" />
          <div className="flex space-x-4 mt-4">
            <div className="h-3 bg-gray-200 rounded animate-pulse w-16" />
            <div className="h-3 bg-gray-200 rounded animate-pulse w-20" />
            <div className="h-3 bg-gray-200 rounded animate-pulse w-14" />
          </div>
        </div>
      </div>
    ),

    list: () => (
      <div className={`space-y-3 ${className}`}>
        {Array.from({ length: count }).map((_, i) => (
          <motion.div
            key={i}
            className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg"
            initial={{ opacity: 0.6 }}
            animate={{ opacity: [0.6, 1, 0.6] }}
            transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.1 }}
          >
            <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse" />
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4" />
              <div className="h-3 bg-gray-200 rounded animate-pulse w-1/2" />
            </div>
          </motion.div>
        ))}
      </div>
    ),
  };

  return <>{skeletonVariants[variant]()}</>;
};

// Loading Overlay
export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({
  message = 'Ielādē...',
  show,
  transparent = false,
}) => {
  if (!show) return null;

  return (
    <motion.div
      className={`fixed inset-0 z-50 flex items-center justify-center ${
        transparent ? 'bg-black bg-opacity-20' : 'bg-white bg-opacity-90'
      } backdrop-blur-sm`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
    >
      <motion.div
        className="flex flex-col items-center gap-4 p-6 bg-white rounded-2xl shadow-xl border border-gray-100"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <LoadingSpinner size="lg" />
        <p className="text-gray-700 font-medium">{message}</p>
      </motion.div>
    </motion.div>
  );
};

// Full Page Loading
export const FullPageLoading: React.FC<FullPageLoadingProps> = ({
  message = 'Ielādē saturu...',
  submessage,
  variant = 'default',
}) => {
  const variants = {
    default: {
      icon: <LoadingSpinner size="xl" />,
      bgGradient: 'from-blue-50 to-indigo-50',
      iconBg: 'bg-blue-100',
    },
    cooking: {
      icon: <ChefHat className="w-12 h-12 text-orange-600" />,
      bgGradient: 'from-orange-50 to-red-50',
      iconBg: 'bg-orange-100',
    },
    recipes: {
      icon: <Utensils className="w-12 h-12 text-green-600" />,
      bgGradient: 'from-green-50 to-emerald-50',
      iconBg: 'bg-green-100',
    },
  };

  const config = variants[variant];

  return (
    <div className={`min-h-screen bg-gradient-to-br ${config.bgGradient} flex items-center justify-center p-4`}>
      <motion.div
        className="text-center max-w-md w-full"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        {/* Icon */}
        <motion.div
          className={`w-20 h-20 ${config.iconBg} rounded-full flex items-center justify-center mx-auto mb-6`}
          animate={{
            scale: [1, 1.05, 1],
            rotate: variant === 'default' ? [0, 360] : [0, 0],
          }}
          transition={{
            duration: variant === 'default' ? 2 : 3,
            repeat: Infinity,
            ease: 'linear',
          }}
        >
          {config.icon}
        </motion.div>

        {/* Main Message */}
        <motion.h2
          className="text-2xl font-bold text-gray-900 mb-3"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          {message}
        </motion.h2>

        {/* Submessage */}
        {submessage && (
          <motion.p
            className="text-gray-600 mb-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            {submessage}
          </motion.p>
        )}

        {/* Progress Dots */}
        <motion.div
          className="flex justify-center space-x-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="w-2 h-2 bg-gray-400 rounded-full"
              animate={{
                scale: [1, 1.5, 1],
                opacity: [0.4, 1, 0.4],
              }}
              transition={{
                duration: 1.2,
                repeat: Infinity,
                delay: i * 0.2,
              }}
            />
          ))}
        </motion.div>
      </motion.div>
    </div>
  );
};

// Inline Loading States
export const InlineLoading: React.FC<{
  text?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}> = ({ text = 'Ielādē...', size = 'md', className = '' }) => {
  const sizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
  };

  return (
    <div className={`flex items-center gap-2 text-gray-600 ${sizeClasses[size]} ${className}`}>
      <LoadingSpinner size={size} variant="secondary" />
      <span>{text}</span>
    </div>
  );
};

// Button Loading State
export const ButtonLoading: React.FC<{
  loading: boolean;
  children: React.ReactNode;
  loadingText?: string;
  className?: string;
  disabled?: boolean;
  onClick?: () => void;
}> = ({
  loading,
  children,
  loadingText,
  className = '',
  disabled,
  onClick,
}) => {
  return (
    <button
      className={`relative ${className}`}
      disabled={disabled || loading}
      onClick={onClick}
    >
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <LoadingSpinner size="sm" variant="white" />
          {loadingText && <span className="ml-2">{loadingText}</span>}
        </div>
      )}
      <div className={loading ? 'invisible' : 'visible'}>
        {children}
      </div>
    </button>
  );
};

// Progress Bar Loading
export const ProgressLoading: React.FC<{
  progress: number;
  message?: string;
  showPercentage?: boolean;
  className?: string;
}> = ({
  progress,
  message = 'Ielādē...',
  showPercentage = true,
  className = '',
}) => {
  return (
    <div className={`w-full ${className}`}>
      {(message || showPercentage) && (
        <div className="flex justify-between items-center mb-2">
          {message && <span className="text-sm text-gray-600">{message}</span>}
          {showPercentage && (
            <span className="text-sm font-medium text-gray-900">
              {Math.round(progress)}%
            </span>
          )}
        </div>
      )}
      <div className="w-full bg-gray-200 rounded-full h-2">
        <motion.div
          className="bg-blue-600 h-2 rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>
    </div>
  );
};

// Typing Animation Loading
export const TypingLoading: React.FC<{
  text?: string;
  className?: string;
}> = ({ text = 'Ielādē', className = '' }) => {
  return (
    <div className={`flex items-center ${className}`}>
      <span className="text-gray-600">{text}</span>
      <motion.span
        className="ml-1"
        animate={{ opacity: [0, 1, 0] }}
        transition={{ duration: 1, repeat: Infinity }}
      >
        ...
      </motion.span>
    </div>
  );
};

// Recipe Card Loading (Specialized)
export const RecipeCardLoading: React.FC<{ count?: number }> = ({ count = 6 }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <LoadingSkeleton key={i} variant="recipe" />
      ))}
    </div>
  );
};

// Table Loading (Specialized)
export const TableLoading: React.FC<{ 
  columns?: number; 
  rows?: number; 
  hasHeader?: boolean;
}> = ({ 
  columns = 5, 
  rows = 8, 
  hasHeader = true 
}) => {
  return (
    <div className="w-full">
      {hasHeader && (
        <div className="flex space-x-4 p-4 bg-gray-50 border-b">
          {Array.from({ length: columns }).map((_, i) => (
            <div key={i} className="flex-1">
              <div className="h-4 bg-gray-200 rounded animate-pulse" />
            </div>
          ))}
        </div>
      )}
      <div className="divide-y">
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <motion.div
            key={rowIndex}
            className="flex space-x-4 p-4"
            initial={{ opacity: 0.6 }}
            animate={{ opacity: [0.6, 1, 0.6] }}
            transition={{ 
              duration: 1.5, 
              repeat: Infinity, 
              delay: rowIndex * 0.1 
            }}
          >
            {Array.from({ length: columns }).map((_, colIndex) => (
              <div key={colIndex} className="flex-1">
                <div 
                  className="h-4 bg-gray-200 rounded animate-pulse"
                  style={{ width: `${Math.random() * 40 + 60}%` }}
                />
              </div>
            ))}
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default {
  LoadingSpinner,
  LoadingSkeleton,
  LoadingOverlay,
  FullPageLoading,
  InlineLoading,
  ButtonLoading,
  ProgressLoading,
  TypingLoading,
  RecipeCardLoading,
  TableLoading,
};