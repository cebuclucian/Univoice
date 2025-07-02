import React from 'react';

interface SkeletonLoaderProps {
  height?: string;
  className?: string;
}

export const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({
  height = 'h-4',
  className = ''
}) => {
  return (
    <div className={`bg-gray-200 rounded animate-pulse ${height} ${className}`} />
  );
};

interface CardSkeletonProps {
  className?: string;
}

export const CardSkeleton: React.FC<CardSkeletonProps> = ({ className = '' }) => {
  return (
    <div className={`bg-white rounded-2xl border border-gray-200 shadow-sm p-6 ${className}`}>
      <div className="space-y-4">
        <SkeletonLoader height="h-6" className="w-3/4" />
        <SkeletonLoader height="h-4" className="w-full" />
        <SkeletonLoader height="h-4" className="w-2/3" />
        <div className="flex space-x-2">
          <SkeletonLoader height="h-8" className="w-16" />
          <SkeletonLoader height="h-8" className="w-20" />
        </div>
      </div>
    </div>
  );
};