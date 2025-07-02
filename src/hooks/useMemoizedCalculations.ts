import { useMemo, useCallback } from 'react';

// Memoized calculations for dashboard statistics
export const useDashboardStats = (
  marketingPlans: any[],
  brandProfile: any,
  userStats: any
) => {
  return useMemo(() => {
    const activePlans = marketingPlans?.filter(plan => 
      plan.status !== 'archived' && plan.status !== 'deleted'
    ).length || 0;

    const draftPlans = marketingPlans?.filter(plan => 
      plan.status === 'draft'
    ).length || 0;

    const completedPlans = marketingPlans?.filter(plan => 
      plan.status === 'completed'
    ).length || 0;

    const totalContent = userStats?.content_this_month || 0;
    
    const planCompletionRate = marketingPlans?.length > 0 
      ? Math.round((completedPlans / marketingPlans.length) * 100)
      : 0;

    const monthlyGrowth = userStats?.plans_this_month > 0 
      ? Math.round(((userStats.plans_this_month - (userStats.plans_last_month || 0)) / 
          Math.max(userStats.plans_last_month || 1, 1)) * 100)
      : 0;

    return {
      activePlans,
      draftPlans,
      completedPlans,
      totalContent,
      planCompletionRate,
      monthlyGrowth,
      hasData: marketingPlans?.length > 0 || brandProfile !== null
    };
  }, [marketingPlans, brandProfile, userStats]);
};

// Memoized brand voice analysis calculations
export const useBrandVoiceMetrics = (brandProfile: any, marketingPlans: any[]) => {
  return useMemo(() => {
    if (!brandProfile) {
      return {
        personalityScore: 0,
        toneConsistency: 0,
        contentAlignment: 0,
        overallHealth: 0,
        recommendations: []
      };
    }

    const personalityTraits = brandProfile.personality_traits?.length || 0;
    const communicationTones = brandProfile.communication_tones?.length || 0;
    const hasContentExamples = brandProfile.content_example_1?.length > 0;
    const hasDescription = brandProfile.brand_description?.length > 0;

    // Calculate personality score (0-100)
    const personalityScore = Math.min(
      (personalityTraits / 5) * 100, // Ideal: 5 traits
      100
    );

    // Calculate tone consistency (0-100)
    const toneConsistency = Math.min(
      (communicationTones / 4) * 100, // Ideal: 4 tones
      100
    );

    // Calculate content alignment (0-100)
    const contentAlignment = (
      (hasDescription ? 25 : 0) +
      (hasContentExamples ? 25 : 0) +
      (brandProfile.content_example_2?.length > 0 ? 25 : 0) +
      (personalityTraits > 0 && communicationTones > 0 ? 25 : 0)
    );

    // Calculate overall health
    const overallHealth = Math.round(
      (personalityScore * 0.3) +
      (toneConsistency * 0.3) +
      (contentAlignment * 0.4)
    );

    // Generate recommendations
    const recommendations = [];
    if (personalityTraits < 3) {
      recommendations.push('Adaugă mai multe trăsături de personalitate');
    }
    if (communicationTones < 3) {
      recommendations.push('Definește mai multe tonuri de comunicare');
    }
    if (!brandProfile.content_example_2) {
      recommendations.push('Adaugă un al doilea exemplu de conținut');
    }
    if (overallHealth < 70) {
      recommendations.push('Îmbunătățește coerența vocii brandului');
    }

    return {
      personalityScore: Math.round(personalityScore),
      toneConsistency: Math.round(toneConsistency),
      contentAlignment: Math.round(contentAlignment),
      overallHealth,
      recommendations
    };
  }, [brandProfile]);
};

// Memoized notification processing
export const useProcessedNotifications = (notifications: any[]) => {
  return useMemo(() => {
    if (!notifications?.length) {
      return {
        unreadCount: 0,
        priorityNotifications: [],
        recentNotifications: [],
        groupedByType: {}
      };
    }

    const unreadCount = notifications.filter(n => !n.is_read).length;
    
    const priorityNotifications = notifications
      .filter(n => n.type === 'error' || n.type === 'warning')
      .slice(0, 3);

    const recentNotifications = notifications
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 10);

    const groupedByType = notifications.reduce((acc, notification) => {
      const type = notification.type;
      if (!acc[type]) acc[type] = [];
      acc[type].push(notification);
      return acc;
    }, {} as Record<string, any[]>);

    return {
      unreadCount,
      priorityNotifications,
      recentNotifications,
      groupedByType
    };
  }, [notifications]);
};

// Memoized search and filtering
export const useFilteredData = <T>(
  data: T[],
  searchTerm: string,
  filters: Record<string, any>,
  searchFields: (keyof T)[]
) => {
  return useMemo(() => {
    if (!data?.length) return [];

    let filtered = data;

    // Apply search
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(item =>
        searchFields.some(field => {
          const value = item[field];
          return value && 
            String(value).toLowerCase().includes(searchLower);
        })
      );
    }

    // Apply filters
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== '') {
        filtered = filtered.filter(item => {
          const itemValue = (item as any)[key];
          if (Array.isArray(value)) {
            return value.includes(itemValue);
          }
          return itemValue === value;
        });
      }
    });

    return filtered;
  }, [data, searchTerm, filters, searchFields]);
};

// Memoized sorting
export const useSortedData = <T>(
  data: T[],
  sortBy: keyof T | null,
  sortOrder: 'asc' | 'desc' = 'asc'
) => {
  return useMemo(() => {
    if (!data?.length || !sortBy) return data;

    return [...data].sort((a, b) => {
      const aValue = a[sortBy];
      const bValue = b[sortBy];

      if (aValue === bValue) return 0;

      let comparison = 0;
      if (aValue > bValue) comparison = 1;
      if (aValue < bValue) comparison = -1;

      return sortOrder === 'desc' ? -comparison : comparison;
    });
  }, [data, sortBy, sortOrder]);
};

// Memoized pagination
export const usePaginatedData = <T>(
  data: T[],
  page: number,
  pageSize: number
) => {
  return useMemo(() => {
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    
    return {
      items: data.slice(startIndex, endIndex),
      totalItems: data.length,
      totalPages: Math.ceil(data.length / pageSize),
      hasNextPage: endIndex < data.length,
      hasPreviousPage: page > 1,
      currentPage: page
    };
  }, [data, page, pageSize]);
};

// Memoized date calculations
export const useDateCalculations = (dates: string[]) => {
  return useMemo(() => {
    if (!dates?.length) {
      return {
        earliest: null,
        latest: null,
        range: 0,
        average: null
      };
    }

    const timestamps = dates
      .map(date => new Date(date).getTime())
      .filter(timestamp => !isNaN(timestamp))
      .sort((a, b) => a - b);

    if (timestamps.length === 0) {
      return {
        earliest: null,
        latest: null,
        range: 0,
        average: null
      };
    }

    const earliest = new Date(timestamps[0]);
    const latest = new Date(timestamps[timestamps.length - 1]);
    const range = latest.getTime() - earliest.getTime();
    const average = new Date(
      timestamps.reduce((sum, timestamp) => sum + timestamp, 0) / timestamps.length
    );

    return {
      earliest,
      latest,
      range,
      average
    };
  }, [dates]);
};

// Performance monitoring hook
export const usePerformanceMonitor = (componentName: string) => {
  const startTime = useMemo(() => performance.now(), []);

  const logRenderTime = useCallback(() => {
    const endTime = performance.now();
    const renderTime = endTime - startTime;
    
    if (renderTime > 100) { // Log slow renders (>100ms)
      console.warn(`Slow render detected in ${componentName}: ${renderTime.toFixed(2)}ms`);
    }
  }, [componentName, startTime]);

  return { logRenderTime };
};