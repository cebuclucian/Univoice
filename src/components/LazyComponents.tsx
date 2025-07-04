import React, { Suspense, lazy } from 'react';
import { Card } from './ui/Card';
import { SkeletonLoader } from './ui/SkeletonLoader';

// Lazy load heavy components
export const LazyBrandVoiceAnalysis = lazy(() => 
  import('./BrandVoiceAnalysis').then(module => ({ default: module.BrandVoiceAnalysis }))
);

export const LazyMarketingPlanGenerator = lazy(() => 
  import('./MarketingPlanGenerator').then(module => ({ default: module.MarketingPlanGenerator }))
);

export const LazyMarketingPlanDetails = lazy(() => 
  import('./MarketingPlanDetails').then(module => ({ default: module.MarketingPlanDetails }))
);

export const LazyNotificationCenter = lazy(() => 
  import('./NotificationCenter').then(module => ({ default: module.NotificationCenter }))
);

// Enhanced loading fallback components
export const ComponentSkeleton: React.FC<{ className?: string }> = ({ className = '' }) => (
  <Card className={`animate-pulse ${className}`}>
    <div className="space-y-4">
      <div className="flex items-center space-x-3">
        <SkeletonLoader height="h-8" className="w-8 rounded-full" />
        <SkeletonLoader height="h-6" className="w-48" />
      </div>
      <SkeletonLoader height="h-4" className="w-full" />
      <SkeletonLoader height="h-4" className="w-3/4" />
      <div className="flex space-x-2">
        <SkeletonLoader height="h-8" className="w-20" />
        <SkeletonLoader height="h-8" className="w-24" />
      </div>
    </div>
  </Card>
);

export const AnalysisSkeleton: React.FC = () => (
  <div className="space-y-6">
    <Card className="animate-pulse">
      <div className="text-center">
        <SkeletonLoader height="h-16" className="w-16 rounded-2xl mx-auto mb-4" />
        <SkeletonLoader height="h-8" className="w-64 mx-auto mb-2" />
        <SkeletonLoader height="h-4" className="w-96 mx-auto" />
      </div>
    </Card>
    
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {[1, 2, 3].map(i => (
        <Card key={i} className="animate-pulse">
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <SkeletonLoader height="h-8" className="w-8 rounded-xl" />
              <SkeletonLoader height="h-6" className="w-24" />
            </div>
            <SkeletonLoader height="h-4" className="w-full" />
            <SkeletonLoader height="h-4" className="w-2/3" />
          </div>
        </Card>
      ))}
    </div>
  </div>
);

export const PlanGeneratorSkeleton: React.FC = () => (
  <div className="space-y-8">
    <Card className="animate-pulse">
      <div className="text-center">
        <SkeletonLoader height="h-12" className="w-12 rounded-2xl mx-auto mb-4" />
        <SkeletonLoader height="h-8" className="w-80 mx-auto mb-2" />
        <SkeletonLoader height="h-4" className="w-96 mx-auto" />
      </div>
    </Card>
    
    <Card className="animate-pulse">
      <div className="space-y-6">
        <SkeletonLoader height="h-6" className="w-48" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-4">
            <SkeletonLoader height="h-4" className="w-32" />
            <SkeletonLoader height="h-12" className="w-full" />
          </div>
          <div className="space-y-4">
            <SkeletonLoader height="h-4" className="w-32" />
            <SkeletonLoader height="h-12" className="w-full" />
          </div>
        </div>
      </div>
    </Card>
  </div>
);

// HOC for lazy loading with error boundary
interface LazyWrapperProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  errorFallback?: React.ReactNode;
}

export const LazyWrapper: React.FC<LazyWrapperProps> = ({ 
  children, 
  fallback = <ComponentSkeleton />,
  errorFallback = <div className="text-center py-8 text-red-600">Eroare la încărcarea componentei</div>
}) => {
  return (
    <Suspense fallback={fallback}>
      <ErrorBoundary fallback={errorFallback}>
        {children}
      </ErrorBoundary>
    </Suspense>
  );
};

// Enhanced error boundary with retry functionality
class ErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback: React.ReactNode },
  { hasError: boolean; error?: Error }
> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): { hasError: boolean; error: Error } {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Lazy component error:', error, errorInfo);
    
    // Report to monitoring service if available
    if (window.gtag) {
      window.gtag('event', 'exception', {
        description: error.message,
        fatal: false
      });
    }
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined });
  };

  render() {
    if (this.state.hasError) {
      return (
        <Card className="text-center py-8 border-red-200 bg-red-50">
          <div className="space-y-4">
            <div className="text-red-600">
              <h3 className="font-semibold mb-2">Eroare la încărcarea componentei</h3>
              <p className="text-sm">{this.state.error?.message || 'Eroare necunoscută'}</p>
            </div>
            <button
              onClick={this.handleRetry}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Încearcă din nou
            </button>
          </div>
        </Card>
      );
    }

    return this.props.children;
  }
}