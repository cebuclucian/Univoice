// Image optimization utilities
export interface ImageOptimizationOptions {
  width?: number;
  height?: number;
  quality?: number;
  format?: 'webp' | 'jpeg' | 'png';
  lazy?: boolean;
}

export const optimizeImageUrl = (
  url: string, 
  options: ImageOptimizationOptions = {}
): string => {
  const {
    width,
    height,
    quality = 80,
    format = 'webp'
  } = options;

  // For external URLs (like Pexels), return as-is
  if (url.startsWith('http') && !url.includes(window.location.hostname)) {
    return url;
  }

  // For local images, apply optimization parameters
  const params = new URLSearchParams();
  
  if (width) params.set('w', width.toString());
  if (height) params.set('h', height.toString());
  if (quality) params.set('q', quality.toString());
  if (format) params.set('f', format);

  const separator = url.includes('?') ? '&' : '?';
  return `${url}${separator}${params.toString()}`;
};

export const generateSrcSet = (
  baseUrl: string,
  sizes: number[] = [320, 640, 768, 1024, 1280]
): string => {
  return sizes
    .map(size => `${optimizeImageUrl(baseUrl, { width: size })} ${size}w`)
    .join(', ');
};

export const generateSizes = (
  breakpoints: { [key: string]: string } = {
    '(max-width: 640px)': '100vw',
    '(max-width: 768px)': '50vw',
    '(max-width: 1024px)': '33vw',
    default: '25vw'
  }
): string => {
  const entries = Object.entries(breakpoints);
  const mediaQueries = entries
    .filter(([key]) => key !== 'default')
    .map(([query, size]) => `${query} ${size}`);
  
  const defaultSize = breakpoints.default || '100vw';
  return [...mediaQueries, defaultSize].join(', ');
};

// Lazy loading intersection observer
export const createLazyImageObserver = (
  callback: (entry: IntersectionObserverEntry) => void
): IntersectionObserver => {
  return new IntersectionObserver(
    (entries) => {
      entries.forEach(callback);
    },
    {
      rootMargin: '50px 0px', // Start loading 50px before image enters viewport
      threshold: 0.01
    }
  );
};

// Image preloading utility
export const preloadImage = (src: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve();
    img.onerror = reject;
    img.src = src;
  });
};

export const preloadImages = async (urls: string[]): Promise<void> => {
  try {
    await Promise.all(urls.map(preloadImage));
  } catch (error) {
    console.warn('Some images failed to preload:', error);
  }
};

// WebP support detection
export const supportsWebP = (): Promise<boolean> => {
  return new Promise((resolve) => {
    const webP = new Image();
    webP.onload = webP.onerror = () => {
      resolve(webP.height === 2);
    };
    webP.src = 'data:image/webp;base64,UklGRjoAAABXRUJQVlA4IC4AAACyAgCdASoCAAIALmk0mk0iIiIiIgBoSygABc6WWgAA/veff/0PP8bA//LwYAAA';
  });
};

// Image compression utility for uploads
export const compressImage = (
  file: File,
  options: {
    maxWidth?: number;
    maxHeight?: number;
    quality?: number;
    format?: string;
  } = {}
): Promise<Blob> => {
  const {
    maxWidth = 1920,
    maxHeight = 1080,
    quality = 0.8,
    format = 'image/jpeg'
  } = options;

  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      // Calculate new dimensions
      let { width, height } = img;
      
      if (width > maxWidth) {
        height = (height * maxWidth) / width;
        width = maxWidth;
      }
      
      if (height > maxHeight) {
        width = (width * maxHeight) / height;
        height = maxHeight;
      }

      canvas.width = width;
      canvas.height = height;

      // Draw and compress
      ctx?.drawImage(img, 0, 0, width, height);
      
      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error('Failed to compress image'));
          }
        },
        format,
        quality
      );
    };

    img.onerror = reject;
    img.src = URL.createObjectURL(file);
  });
};

// Responsive image component props generator
export const generateResponsiveImageProps = (
  src: string,
  alt: string,
  options: ImageOptimizationOptions & {
    sizes?: string;
    srcSetSizes?: number[];
  } = {}
) => {
  const {
    width,
    height,
    quality,
    format,
    lazy = true,
    sizes,
    srcSetSizes
  } = options;

  const optimizedSrc = optimizeImageUrl(src, { width, height, quality, format });
  
  const props: any = {
    src: optimizedSrc,
    alt,
    loading: lazy ? 'lazy' : 'eager',
    decoding: 'async'
  };

  if (srcSetSizes) {
    props.srcSet = generateSrcSet(src, srcSetSizes);
  }

  if (sizes) {
    props.sizes = sizes;
  }

  if (width) props.width = width;
  if (height) props.height = height;

  return props;
};