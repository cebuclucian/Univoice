// Performance monitoring and optimization utilities
export interface PerformanceMetrics {
  renderTime: number;
  componentName: string;
  timestamp: number;
  props?: any;
}

export interface NetworkMetrics {
  url: string;
  method: string;
  duration: number;
  status: number;
  size?: number;
  cached?: boolean;
}

class PerformanceMonitor {
  private metrics: PerformanceMetrics[] = [];
  private networkMetrics: NetworkMetrics[] = [];
  private observers: PerformanceObserver[] = [];

  constructor() {
    this.initializeObservers();
  }

  private initializeObservers() {
    // Observe long tasks
    if ('PerformanceObserver' in window) {
      try {
        const longTaskObserver = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (entry.duration > 50) { // Tasks longer than 50ms
              console.warn('Long task detected:', {
                duration: entry.duration,
                startTime: entry.startTime,
                name: entry.name
              });
            }
          }
        });
        longTaskObserver.observe({ entryTypes: ['longtask'] });
        this.observers.push(longTaskObserver);
      } catch (e) {
        console.warn('Long task observer not supported');
      }

      // Observe layout shifts
      try {
        const clsObserver = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (entry.value > 0.1) { // CLS threshold
              console.warn('Layout shift detected:', {
                value: entry.value,
                sources: entry.sources
              });
            }
          }
        });
        clsObserver.observe({ entryTypes: ['layout-shift'] });
        this.observers.push(clsObserver);
      } catch (e) {
        console.warn('Layout shift observer not supported');
      }

      // Observe largest contentful paint
      try {
        const lcpObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const lastEntry = entries[entries.length - 1];
          if (lastEntry.startTime > 2500) { // LCP threshold
            console.warn('Slow LCP detected:', lastEntry.startTime);
          }
        });
        lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
        this.observers.push(lcpObserver);
      } catch (e) {
        console.warn('LCP observer not supported');
      }
    }
  }

  // Track component render performance
  trackRender(componentName: string, renderTime: number, props?: any) {
    const metric: PerformanceMetrics = {
      componentName,
      renderTime,
      timestamp: Date.now(),
      props: props ? JSON.stringify(props) : undefined
    };

    this.metrics.push(metric);

    // Keep only last 100 metrics
    if (this.metrics.length > 100) {
      this.metrics = this.metrics.slice(-100);
    }

    // Log slow renders
    if (renderTime > 100) {
      console.warn(`Slow render in ${componentName}: ${renderTime.toFixed(2)}ms`);
    }
  }

  // Track network requests
  trackNetwork(url: string, method: string, duration: number, status: number, options?: {
    size?: number;
    cached?: boolean;
  }) {
    const metric: NetworkMetrics = {
      url,
      method,
      duration,
      status,
      ...options
    };

    this.networkMetrics.push(metric);

    // Keep only last 50 network metrics
    if (this.networkMetrics.length > 50) {
      this.networkMetrics = this.networkMetrics.slice(-50);
    }

    // Log slow requests
    if (duration > 1000) {
      console.warn(`Slow network request: ${method} ${url} took ${duration}ms`);
    }
  }

  // Get performance summary
  getSummary() {
    const renderMetrics = this.metrics.reduce((acc, metric) => {
      if (!acc[metric.componentName]) {
        acc[metric.componentName] = {
          count: 0,
          totalTime: 0,
          maxTime: 0,
          avgTime: 0
        };
      }

      const component = acc[metric.componentName];
      component.count++;
      component.totalTime += metric.renderTime;
      component.maxTime = Math.max(component.maxTime, metric.renderTime);
      component.avgTime = component.totalTime / component.count;

      return acc;
    }, {} as Record<string, any>);

    const networkSummary = {
      totalRequests: this.networkMetrics.length,
      avgDuration: this.networkMetrics.reduce((sum, m) => sum + m.duration, 0) / this.networkMetrics.length,
      slowRequests: this.networkMetrics.filter(m => m.duration > 1000).length,
      errorRequests: this.networkMetrics.filter(m => m.status >= 400).length,
      cachedRequests: this.networkMetrics.filter(m => m.cached).length
    };

    return {
      renders: renderMetrics,
      network: networkSummary,
      vitals: this.getWebVitals()
    };
  }

  // Get Core Web Vitals
  private getWebVitals() {
    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    
    return {
      fcp: this.getFCP(),
      lcp: this.getLCP(),
      fid: this.getFID(),
      cls: this.getCLS(),
      ttfb: navigation ? navigation.responseStart - navigation.requestStart : 0
    };
  }

  private getFCP(): number {
    const fcpEntry = performance.getEntriesByName('first-contentful-paint')[0];
    return fcpEntry ? fcpEntry.startTime : 0;
  }

  private getLCP(): number {
    return new Promise((resolve) => {
      if ('PerformanceObserver' in window) {
        const observer = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const lastEntry = entries[entries.length - 1];
          resolve(lastEntry.startTime);
        });
        observer.observe({ entryTypes: ['largest-contentful-paint'] });
      } else {
        resolve(0);
      }
    }) as any;
  }

  private getFID(): number {
    return new Promise((resolve) => {
      if ('PerformanceObserver' in window) {
        const observer = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            resolve(entry.processingStart - entry.startTime);
            break;
          }
        });
        observer.observe({ entryTypes: ['first-input'] });
      } else {
        resolve(0);
      }
    }) as any;
  }

  private getCLS(): number {
    return new Promise((resolve) => {
      let clsValue = 0;
      if ('PerformanceObserver' in window) {
        const observer = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (!entry.hadRecentInput) {
              clsValue += entry.value;
            }
          }
          resolve(clsValue);
        });
        observer.observe({ entryTypes: ['layout-shift'] });
      } else {
        resolve(0);
      }
    }) as any;
  }

  // Clean up observers
  disconnect() {
    this.observers.forEach(observer => observer.disconnect());
    this.observers = [];
  }
}

// Global performance monitor instance
export const performanceMonitor = new PerformanceMonitor();

// React hook for component performance tracking
export const usePerformanceTracking = (componentName: string) => {
  const startTime = performance.now();

  React.useEffect(() => {
    const endTime = performance.now();
    const renderTime = endTime - startTime;
    performanceMonitor.trackRender(componentName, renderTime);
  });

  return {
    trackCustomMetric: (metricName: string, value: number) => {
      console.log(`${componentName} - ${metricName}:`, value);
    }
  };
};

// Network request interceptor for performance tracking
export const interceptFetch = () => {
  const originalFetch = window.fetch;

  window.fetch = async (...args) => {
    const startTime = performance.now();
    const url = typeof args[0] === 'string' ? args[0] : args[0].url;
    const method = args[1]?.method || 'GET';

    try {
      const response = await originalFetch(...args);
      const endTime = performance.now();
      const duration = endTime - startTime;

      performanceMonitor.trackNetwork(url, method, duration, response.status, {
        cached: response.headers.get('x-cache') === 'HIT'
      });

      return response;
    } catch (error) {
      const endTime = performance.now();
      const duration = endTime - startTime;
      performanceMonitor.trackNetwork(url, method, duration, 0);
      throw error;
    }
  };
};

// Bundle size analyzer
export const analyzeBundleSize = () => {
  if ('performance' in window && 'getEntriesByType' in performance) {
    const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
    
    const jsResources = resources.filter(r => r.name.endsWith('.js'));
    const cssResources = resources.filter(r => r.name.endsWith('.css'));
    
    const totalJSSize = jsResources.reduce((sum, r) => sum + (r.transferSize || 0), 0);
    const totalCSSSize = cssResources.reduce((sum, r) => sum + (r.transferSize || 0), 0);
    
    console.log('Bundle Analysis:', {
      totalJS: `${(totalJSSize / 1024).toFixed(2)} KB`,
      totalCSS: `${(totalCSSSize / 1024).toFixed(2)} KB`,
      jsFiles: jsResources.length,
      cssFiles: cssResources.length,
      largestJS: jsResources.sort((a, b) => (b.transferSize || 0) - (a.transferSize || 0))[0]
    });
  }
};

// Memory usage monitoring
export const monitorMemoryUsage = () => {
  if ('memory' in performance) {
    const memory = (performance as any).memory;
    
    const usage = {
      used: `${(memory.usedJSHeapSize / 1024 / 1024).toFixed(2)} MB`,
      total: `${(memory.totalJSHeapSize / 1024 / 1024).toFixed(2)} MB`,
      limit: `${(memory.jsHeapSizeLimit / 1024 / 1024).toFixed(2)} MB`,
      percentage: `${((memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100).toFixed(2)}%`
    };

    if (memory.usedJSHeapSize / memory.jsHeapSizeLimit > 0.9) {
      console.warn('High memory usage detected:', usage);
    }

    return usage;
  }

  return null;
};

// Initialize performance monitoring
export const initializePerformanceMonitoring = () => {
  // Intercept fetch requests
  interceptFetch();

  // Monitor memory usage periodically
  setInterval(() => {
    monitorMemoryUsage();
  }, 30000); // Every 30 seconds

  // Analyze bundle size after load
  window.addEventListener('load', () => {
    setTimeout(analyzeBundleSize, 1000);
  });

  // Report performance summary periodically
  setInterval(() => {
    const summary = performanceMonitor.getSummary();
    console.log('Performance Summary:', summary);
  }, 60000); // Every minute
};