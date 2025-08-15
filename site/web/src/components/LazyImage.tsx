import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useIntersectionObserver } from 'react-intersection-observer';
import { ImageOff, Loader2 } from 'lucide-react';

interface LazyImageProps {
  src: string;
  alt: string;
  className?: string;
  placeholderSrc?: string;
  width?: number;
  height?: number;
  aspectRatio?: 'square' | '4:3' | '16:9' | '3:2' | 'auto';
  objectFit?: 'cover' | 'contain' | 'fill' | 'scale-down';
  priority?: boolean; // Skip lazy loading for above-the-fold images
  sizes?: string;
  srcSet?: string;
  onLoad?: () => void;
  onError?: () => void;
  fallbackSrc?: string;
  showLoader?: boolean;
  rounded?: boolean;
  shadow?: boolean;
  blur?: boolean; // Progressive blur effect
  webpSrc?: string; // WebP version for better compression
  avifSrc?: string; // AVIF version for even better compression
}

export const LazyImage: React.FC<LazyImageProps> = ({
  src,
  alt,
  className = '',
  placeholderSrc,
  width,
  height,
  aspectRatio = 'auto',
  objectFit = 'cover',
  priority = false,
  sizes,
  srcSet,
  onLoad,
  onError,
  fallbackSrc = '/images/recipe-placeholder.jpg',
  showLoader = true,
  rounded = false,
  shadow = false,
  blur = true,
  webpSrc,
  avifSrc,
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isError, setIsError] = useState(false);
  const [currentSrc, setCurrentSrc] = useState(placeholderSrc || '');
  const imgRef = useRef<HTMLImageElement>(null);

  // Intersection Observer for lazy loading
  const { ref, inView } = useIntersectionObserver({
    threshold: 0.1,
    triggerOnce: true,
    skip: priority, // Skip lazy loading for priority images
  });

  // Should load when in view or priority is true
  const shouldLoad = priority || inView;

  const aspectRatioClasses = {
    'auto': '',
    'square': 'aspect-square',
    '4:3': 'aspect-[4/3]',
    '16:9': 'aspect-video',
    '3:2': 'aspect-[3/2]',
  };

  const baseClasses = `
    relative overflow-hidden transition-all duration-300
    ${aspectRatioClasses[aspectRatio]}
    ${rounded ? 'rounded-lg' : ''}
    ${shadow ? 'shadow-lg' : ''}
    ${className}
  `;

  // Handle image load
  const handleLoad = () => {
    setIsLoaded(true);
    onLoad?.();
  };

  // Handle image error
  const handleError = () => {
    if (currentSrc !== fallbackSrc) {
      setCurrentSrc(fallbackSrc);
    } else {
      setIsError(true);
    }
    onError?.();
  };

  // Progressive image loading
  useEffect(() => {
    if (!shouldLoad) return;

    const img = new Image();
    
    // Set up sources with modern format support
    if (avifSrc && supportsFormat('image/avif')) {
      img.src = avifSrc;
    } else if (webpSrc && supportsFormat('image/webp')) {
      img.src = webpSrc;
    } else {
      img.src = src;
    }
    
    if (srcSet) img.srcset = srcSet;
    if (sizes) img.sizes = sizes;

    img.onload = () => {
      setCurrentSrc(img.src);
      handleLoad();
    };
    
    img.onerror = handleError;

    return () => {
      img.onload = null;
      img.onerror = null;
    };
  }, [shouldLoad, src, webpSrc, avifSrc, srcSet, sizes]);

  // Check format support
  const supportsFormat = (format: string): boolean => {
    if (typeof window === 'undefined') return false;
    const canvas = document.createElement('canvas');
    canvas.width = 1;
    canvas.height = 1;
    return canvas.toDataURL(format).indexOf('data:' + format) === 0;
  };

  // Generate srcSet for responsive images
  const generateSrcSet = () => {
    if (srcSet) return srcSet;
    
    // Auto-generate srcSet based on src
    const baseSrc = src.replace(/\.(jpg|jpeg|png|webp)$/i, '');
    const extension = src.match(/\.(jpg|jpeg|png|webp)$/i)?.[0] || '.jpg';
    
    return [
      `${baseSrc}_400w${extension} 400w`,
      `${baseSrc}_800w${extension} 800w`,
      `${baseSrc}_1200w${extension} 1200w`,
    ].join(', ');
  };

  if (isError) {
    return (
      <div ref={ref} className={baseClasses}>
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
          <div className="text-center p-4">
            <ImageOff className="w-8 h-8 text-gray-400 mx-auto mb-2" />
            <p className="text-sm text-gray-500">Attēls nav pieejams</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div ref={ref} className={baseClasses}>
      <AnimatePresence mode="wait">
        {/* Loading state */}
        {!isLoaded && showLoader && shouldLoad && (
          <motion.div
            className="absolute inset-0 flex items-center justify-center bg-gray-100"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Loader2 className="w-6 h-6 text-gray-400 animate-spin" />
          </motion.div>
        )}

        {/* Placeholder image */}
        {placeholderSrc && !isLoaded && (
          <motion.img
            src={placeholderSrc}
            alt=""
            className={`absolute inset-0 w-full h-full object-${objectFit} ${blur ? 'blur-sm' : ''}`}
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          />
        )}

        {/* Main image */}
        {shouldLoad && (
          <motion.picture
            className="absolute inset-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: isLoaded ? 1 : 0 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          >
            {/* Modern format sources */}
            {avifSrc && <source srcSet={avifSrc} type="image/avif" />}
            {webpSrc && <source srcSet={webpSrc} type="image/webp" />}
            
            <motion.img
              ref={imgRef}
              src={currentSrc || src}
              alt={alt}
              width={width}
              height={height}
              sizes={sizes || '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw'}
              srcSet={generateSrcSet()}
              className={`w-full h-full object-${objectFit} transition-all duration-500`}
              loading={priority ? 'eager' : 'lazy'}
              decoding="async"
              onLoad={handleLoad}
              onError={handleError}
              style={{
                filter: isLoaded ? 'none' : blur ? 'blur(4px)' : 'none',
              }}
            />
          </motion.picture>
        )}
      </AnimatePresence>

      {/* Image overlay effects */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300"
        initial={false}
        animate={{ opacity: 0 }}
        whileHover={{ opacity: 1 }}
      />
    </div>
  );
};

// Recipe-specific image component
export const RecipeImage: React.FC<{
  recipe: {
    id: string;
    title: string;
    image?: string;
  };
  size?: 'sm' | 'md' | 'lg' | 'xl';
  priority?: boolean;
  className?: string;
}> = ({ 
  recipe, 
  size = 'md', 
  priority = false,
  className = ''
}) => {
  const sizes = {
    sm: { width: 150, height: 150 },
    md: { width: 300, height: 200 },
    lg: { width: 400, height: 300 },
    xl: { width: 600, height: 400 },
  };

  const { width, height } = sizes[size];
  
  // Generate responsive image URLs
  const generateImageUrls = (baseSrc: string) => {
    if (!baseSrc) return {};
    
    const baseUrl = baseSrc.startsWith('http') ? baseSrc : `${window.location.origin}${baseSrc}`;
    const cleanUrl = baseUrl.replace(/\.(jpg|jpeg|png)$/i, '');
    
    return {
      webp: `${cleanUrl}.webp`,
      avif: `${cleanUrl}.avif`,
      placeholder: `${cleanUrl}_blur.jpg`,
    };
  };

  const imageUrls = recipe.image ? generateImageUrls(recipe.image) : {};

  return (
    <LazyImage
      src={recipe.image || '/images/recipe-placeholder.jpg'}
      alt={`${recipe.title} receptes attēls`}
      width={width}
      height={height}
      aspectRatio="4:3"
      priority={priority}
      className={className}
      webpSrc={imageUrls.webp}
      avifSrc={imageUrls.avif}
      placeholderSrc={imageUrls.placeholder}
      rounded
      shadow
      sizes={`${width}px`}
    />
  );
};

// Avatar image component
export const AvatarImage: React.FC<{
  src?: string;
  alt: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}> = ({ 
  src, 
  alt, 
  size = 'md',
  className = ''
}) => {
  const sizes = {
    xs: 'w-6 h-6',
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16',
  };

  if (!src) {
    return (
      <div className={`${sizes[size]} bg-gray-200 rounded-full flex items-center justify-center ${className}`}>
        <span className="text-gray-500 font-medium text-sm">
          {alt.charAt(0).toUpperCase()}
        </span>
      </div>
    );
  }

  return (
    <LazyImage
      src={src}
      alt={alt}
      aspectRatio="square"
      className={`${sizes[size]} rounded-full ${className}`}
      showLoader={false}
      priority={false}
    />
  );
};

// Gallery image component with zoom
export const GalleryImage: React.FC<{
  src: string;
  alt: string;
  caption?: string;
  onClick?: () => void;
  className?: string;
}> = ({ 
  src, 
  alt, 
  caption,
  onClick,
  className = ''
}) => {
  return (
    <motion.div
      className={`cursor-pointer group ${className}`}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
    >
      <LazyImage
        src={src}
        alt={alt}
        aspectRatio="4:3"
        className="w-full"
        rounded
        shadow
      />
      {caption && (
        <p className="text-sm text-gray-600 mt-2 group-hover:text-gray-900 transition-colors">
          {caption}
        </p>
      )}
    </motion.div>
  );
};

export default LazyImage;