import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, useAnimation, useInView } from 'framer-motion';
import { Heart, Star, Bookmark, Share2, ChefHat, Sparkles, Zap } from 'lucide-react';

// Animation variants
export const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
  transition: { duration: 0.3, ease: 'easeOut' }
};

export const fadeInScale = {
  initial: { opacity: 0, scale: 0.9 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.9 },
  transition: { duration: 0.3, ease: 'easeOut' }
};

export const slideInLeft = {
  initial: { opacity: 0, x: -30 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -30 },
  transition: { duration: 0.4, ease: 'easeOut' }
};

export const slideInRight = {
  initial: { opacity: 0, x: 30 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: 30 },
  transition: { duration: 0.4, ease: 'easeOut' }
};

export const bounceIn = {
  initial: { opacity: 0, scale: 0.3 },
  animate: { 
    opacity: 1, 
    scale: 1,
    transition: {
      type: 'spring',
      damping: 15,
      stiffness: 300
    }
  },
  exit: { opacity: 0, scale: 0.3 }
};

export const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
};

export const staggerItem = {
  initial: { opacity: 0, y: 20 },
  animate: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.5, ease: 'easeOut' }
  }
};

// Animated Heart Button
export const AnimatedHeartButton: React.FC<{
  isLiked: boolean;
  onToggle: () => void;
  className?: string;
}> = ({ isLiked, onToggle, className = '' }) => {
  const [showParticles, setShowParticles] = useState(false);

  const handleClick = () => {
    onToggle();
    if (!isLiked) {
      setShowParticles(true);
      setTimeout(() => setShowParticles(false), 1000);
    }
  };

  return (
    <div className={`relative ${className}`}>
      <motion.button
        onClick={handleClick}
        className={`p-2 rounded-full transition-all duration-200 ${
          isLiked 
            ? 'bg-red-50 text-red-500 dark:bg-red-900/20' 
            : 'bg-gray-50 text-gray-400 hover:bg-red-50 hover:text-red-500 dark:bg-gray-800 dark:hover:bg-red-900/20'
        }`}
        whileTap={{ scale: 0.9 }}
        whileHover={{ scale: 1.1 }}
      >
        <motion.div
          animate={isLiked ? { scale: [1, 1.3, 1] } : { scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          <Heart 
            className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`}
          />
        </motion.div>
      </motion.button>

      {/* Heart particles */}
      <AnimatePresence>
        {showParticles && (
          <div className="absolute inset-0 pointer-events-none">
            {[...Array(6)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute left-1/2 top-1/2"
                initial={{ 
                  opacity: 1, 
                  scale: 0,
                  x: 0,
                  y: 0
                }}
                animate={{ 
                  opacity: 0, 
                  scale: 1,
                  x: (Math.random() - 0.5) * 40,
                  y: (Math.random() - 0.5) * 40
                }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.8, delay: i * 0.1 }}
              >
                <Heart className="w-3 h-3 text-red-500 fill-current" />
              </motion.div>
            ))}
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Animated Star Rating
export const AnimatedStarRating: React.FC<{
  rating: number;
  onRate?: (rating: number) => void;
  readonly?: boolean;
  size?: 'sm' | 'md' | 'lg';
}> = ({ rating, onRate, readonly = false, size = 'md' }) => {
  const [hoverRating, setHoverRating] = useState(0);
  const [showSparkles, setShowSparkles] = useState(false);

  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  };

  const handleRate = (newRating: number) => {
    if (readonly) return;
    onRate?.(newRating);
    setShowSparkles(true);
    setTimeout(() => setShowSparkles(false), 1000);
  };

  return (
    <div className="relative flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => {
        const filled = star <= (hoverRating || rating);
        return (
          <motion.button
            key={star}
            onMouseEnter={() => !readonly && setHoverRating(star)}
            onMouseLeave={() => !readonly && setHoverRating(0)}
            onClick={() => handleRate(star)}
            className={`transition-colors ${readonly ? 'cursor-default' : 'cursor-pointer'}`}
            whileHover={!readonly ? { scale: 1.2 } : {}}
            whileTap={!readonly ? { scale: 0.9 } : {}}
            disabled={readonly}
          >
            <motion.div
              animate={filled ? { rotate: [0, 5, -5, 0] } : {}}
              transition={{ duration: 0.3 }}
            >
              <Star 
                className={`${sizes[size]} transition-colors ${
                  filled 
                    ? 'text-yellow-400 fill-current' 
                    : 'text-gray-300 dark:text-gray-600'
                }`}
              />
            </motion.div>
          </motion.button>
        );
      })}

      {/* Sparkle effects */}
      <AnimatePresence>
        {showSparkles && (
          <div className="absolute inset-0 pointer-events-none">
            {[...Array(4)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute"
                style={{
                  left: `${20 + i * 20}%`,
                  top: '50%'
                }}
                initial={{ 
                  opacity: 0, 
                  scale: 0,
                  y: 0
                }}
                animate={{ 
                  opacity: [0, 1, 0], 
                  scale: [0, 1, 0],
                  y: -20
                }}
                transition={{ 
                  duration: 0.8, 
                  delay: i * 0.1,
                  ease: 'easeOut'
                }}
              >
                <Sparkles className="w-3 h-3 text-yellow-400" />
              </motion.div>
            ))}
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Floating Action Button with ripple
export const FloatingActionButton: React.FC<{
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
  color?: 'primary' | 'secondary' | 'accent';
  size?: 'sm' | 'md' | 'lg';
}> = ({ onClick, icon, label, color = 'primary', size = 'md' }) => {
  const [ripples, setRipples] = useState<Array<{ id: number; x: number; y: number }>>([]);

  const colors = {
    primary: 'bg-blue-600 hover:bg-blue-700 text-white',
    secondary: 'bg-gray-600 hover:bg-gray-700 text-white',
    accent: 'bg-orange-600 hover:bg-orange-700 text-white'
  };

  const sizes = {
    sm: 'w-12 h-12',
    md: 'w-14 h-14',
    lg: 'w-16 h-16'
  };

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const newRipple = { id: Date.now(), x, y };
    setRipples(prev => [...prev, newRipple]);
    
    setTimeout(() => {
      setRipples(prev => prev.filter(ripple => ripple.id !== newRipple.id));
    }, 800);
    
    onClick();
  };

  return (
    <motion.button
      onClick={handleClick}
      className={`
        fixed bottom-6 right-6 ${sizes[size]} ${colors[color]}
        rounded-full shadow-lg hover:shadow-xl
        flex items-center justify-center
        transition-all duration-200 overflow-hidden
        focus:outline-none focus:ring-4 focus:ring-offset-2 focus:ring-blue-300
        z-50
      `}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
      title={label}
    >
      {icon}
      
      {/* Ripple effects */}
      {ripples.map(ripple => (
        <motion.div
          key={ripple.id}
          className="absolute bg-white opacity-30 rounded-full pointer-events-none"
          style={{
            left: ripple.x,
            top: ripple.y,
            transform: 'translate(-50%, -50%)'
          }}
          initial={{ width: 0, height: 0 }}
          animate={{ width: 100, height: 100 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        />
      ))}
    </motion.button>
  );
};

// Animated Counter
export const AnimatedCounter: React.FC<{
  value: number;
  duration?: number;
  suffix?: string;
  prefix?: string;
}> = ({ value, duration = 2, suffix = '', prefix = '' }) => {
  const [count, setCount] = useState(0);
  
  useEffect(() => {
    let startTime: number;
    let animationFrame: number;
    
    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / (duration * 1000), 1);
      
      setCount(Math.floor(progress * value));
      
      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };
    
    animationFrame = requestAnimationFrame(animate);
    
    return () => cancelAnimationFrame(animationFrame);
  }, [value, duration]);
  
  return (
    <motion.span
      key={value}
      initial={{ scale: 0.8 }}
      animate={{ scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      {prefix}{count}{suffix}
    </motion.span>
  );
};

// Loading Pulse Animation
export const LoadingPulse: React.FC<{
  size?: 'sm' | 'md' | 'lg';
  color?: string;
}> = ({ size = 'md', color = 'bg-blue-600' }) => {
  const sizes = {
    sm: 'w-2 h-2',
    md: 'w-3 h-3',
    lg: 'w-4 h-4'
  };

  return (
    <div className="flex space-x-1">
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className={`${sizes[size]} ${color} rounded-full`}
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.7, 1, 0.7]
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            delay: i * 0.2
          }}
        />
      ))}
    </div>
  );
};

// Scroll-triggered animations
export const ScrollReveal: React.FC<{
  children: React.ReactNode;
  direction?: 'up' | 'down' | 'left' | 'right';
  delay?: number;
  duration?: number;
}> = ({ children, direction = 'up', delay = 0, duration = 0.6 }) => {
  const ref = React.useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });
  
  const variants = {
    up: { y: 50 },
    down: { y: -50 },
    left: { x: 50 },
    right: { x: -50 }
  };

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, ...variants[direction] }}
      animate={isInView ? { opacity: 1, x: 0, y: 0 } : {}}
      transition={{ 
        duration, 
        delay,
        ease: 'easeOut'
      }}
    >
      {children}
    </motion.div>
  );
};

// Hover Card with 3D Effect
export const HoverCard: React.FC<{
  children: React.ReactNode;
  className?: string;
  intensity?: number;
}> = ({ children, className = '', intensity = 0.1 }) => {
  return (
    <motion.div
      className={className}
      whileHover={{
        scale: 1.02,
        rotateX: intensity * 5,
        rotateY: intensity * 5,
        z: 50
      }}
      transition={{ 
        type: 'spring',
        stiffness: 300,
        damping: 20
      }}
      style={{
        transformStyle: 'preserve-3d',
        transformOrigin: 'center center'
      }}
    >
      {children}
    </motion.div>
  );
};

// Magnetic Button Effect
export const MagneticButton: React.FC<{
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}> = ({ children, className = '', onClick }) => {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const buttonRef = React.useRef<HTMLButtonElement>(null);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!buttonRef.current) return;
    
    const rect = buttonRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    const x = (e.clientX - centerX) * 0.1;
    const y = (e.clientY - centerY) * 0.1;
    
    setPosition({ x, y });
  };

  const handleMouseLeave = () => {
    setPosition({ x: 0, y: 0 });
  };

  return (
    <motion.button
      ref={buttonRef}
      className={className}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      animate={{
        x: position.x,
        y: position.y
      }}
      transition={{
        type: 'spring',
        stiffness: 200,
        damping: 15
      }}
    >
      {children}
    </motion.button>
  );
};

// Success Checkmark Animation
export const SuccessCheckmark: React.FC<{
  size?: number;
  color?: string;
}> = ({ size = 24, color = '#10b981' }) => {
  return (
    <motion.svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ 
        type: 'spring',
        stiffness: 260,
        damping: 20,
        delay: 0.1
      }}
    >
      <motion.circle
        cx="12"
        cy="12"
        r="10"
        stroke={color}
        strokeWidth="2"
        fill="none"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.6, ease: 'easeInOut' }}
      />
      <motion.path
        d="M8 12L11 15L16 9"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.4, delay: 0.3, ease: 'easeInOut' }}
      />
    </motion.svg>
  );
};

// Notification Toast
export const AnimatedToast: React.FC<{
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  isVisible: boolean;
  onClose: () => void;
}> = ({ message, type, isVisible, onClose }) => {
  const colors = {
    success: 'bg-green-500 text-white',
    error: 'bg-red-500 text-white',
    warning: 'bg-yellow-500 text-black',
    info: 'bg-blue-500 text-white'
  };

  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(onClose, 4000);
      return () => clearTimeout(timer);
    }
  }, [isVisible, onClose]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -100, scale: 0.3 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, scale: 0.5, transition: { duration: 0.2 } }}
          className={`
            fixed top-4 right-4 z-50 px-6 py-4 rounded-lg shadow-lg
            ${colors[type]} max-w-sm
          `}
        >
          <div className="flex items-center justify-between">
            <span>{message}</span>
            <button
              onClick={onClose}
              className="ml-4 text-current opacity-70 hover:opacity-100"
            >
              ×
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default {
  fadeInUp,
  fadeInScale,
  slideInLeft,
  slideInRight,
  bounceIn,
  staggerContainer,
  staggerItem,
  AnimatedHeartButton,
  AnimatedStarRating,
  FloatingActionButton,
  AnimatedCounter,
  LoadingPulse,
  ScrollReveal,
  HoverCard,
  MagneticButton,
  SuccessCheckmark,
  AnimatedToast
};