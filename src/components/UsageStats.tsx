import React from 'react';
import { Crown, Target, MessageSquare, TrendingUp, AlertCircle, Infinity } from 'lucide-react';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { useUserStats } from '../hooks/useUserStats';

interface UsageStatsProps {
  className?: string;
  showUpgrade?: boolean;
}

export const UsageStats: React.FC<UsageStatsProps> = ({ 
  className = '', 
  showUpgrade = true 
}) => {
  const { stats, loading } = useUserStats();

  if (loading || !stats) {
    return (
      <Card className={`animate-pulse ${className}`}>
        <div className="space-y-4">
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          <div className="h-8 bg-gray-200 rounded"></div>
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
        </div>
      </Card>
    );
  }

  const isUnlimited = (limit: number) => limit === -1;
  
  const planUsagePercentage = isUnlimited(stats.plan_limit) 
    ? 0 
    : (stats.plans_this_month / stats.plan_limit) * 100;

  const contentUsagePercentage = isUnlimited(stats.content_limit) 
    ? 0 
    : (stats.content_this_month / stats.content_limit) * 100;

  const isNearPlanLimit = !isUnlimited(stats.plan_limit) && planUsagePercentage >= 80;
  const isNearContentLimit = !isUnlimited(stats.content_limit) && contentUsagePercentage >= 80;

  const getPlanDisplayName = (plan: string) => {
    switch (plan) {
      case 'free': return 'Gratuit';
      case 'pro': return 'Pro';
      case 'premium': return 'Premium';
      default: return 'Gratuit';
    }
  };

  const getUsageColor = (percentage: number, isUnlimited: boolean) => {
    if (isUnlimited) return 'text-green-600 bg-green-100';
    if (percentage >= 90) return 'text-red-600 bg-red-100';
    if (percentage >= 80) return 'text-amber-600 bg-amber-100';
    if (percentage >= 60) return 'text-yellow-600 bg-yellow-100';
    return 'text-green-600 bg-green-100';
  };

  const getProgressColor = (percentage: number, isUnlimited: boolean) => {
    if (isUnlimited) return 'bg-green-500';
    if (percentage >= 90) return 'bg-red-500';
    if (percentage >= 80) return 'bg-amber-500';
    if (percentage >= 60) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const formatLimit = (current: number, limit: number) => {
    if (isUnlimited(limit)) {
      return `${current}/∞`;
    }
    return `${current}/${limit}`;
  };

  return (
    <Card className={`shadow-lg ${className}`} hover="subtle">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-xl">
              {isUnlimited(stats.plan_limit) ? (
                <Infinity className="h-6 w-6 text-blue-600" />
              ) : (
                <Crown className="h-6 w-6 text-blue-600" />
              )}
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">
                Plan {getPlanDisplayName(stats.subscription_plan)}
                {isUnlimited(stats.plan_limit) && (
                  <span className="ml-2 text-sm bg-green-100 text-green-800 px-2 py-1 rounded-full">
                    Admin
                  </span>
                )}
              </h3>
              <p className="text-sm text-gray-600">Utilizare lunară</p>
            </div>
          </div>
          
          {(isNearPlanLimit || isNearContentLimit) && (
            <div className="p-2 bg-amber-100 rounded-lg">
              <AlertCircle className="h-5 w-5 text-amber-600" />
            </div>
          )}
        </div>

        {/* Plans Usage */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Target className="h-4 w-4 text-gray-600" />
              <span className="text-sm font-medium text-gray-700">Planuri de marketing</span>
            </div>
            <div className={`px-2 py-1 rounded-lg text-xs font-medium ${getUsageColor(planUsagePercentage, isUnlimited(stats.plan_limit))}`}>
              {formatLimit(stats.plans_this_month, stats.plan_limit)}
            </div>
          </div>
          
          {!isUnlimited(stats.plan_limit) && (
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className={`h-2 rounded-full transition-all duration-300 ${getProgressColor(planUsagePercentage, false)}`}
                style={{ 
                  width: `${Math.min(planUsagePercentage, 100)}%` 
                }}
              />
            </div>
          )}
          
          {isNearPlanLimit && (
            <p className="text-xs text-amber-600">
              Ai folosit {Math.round(planUsagePercentage)}% din planurile disponibile
            </p>
          )}
          
          {isUnlimited(stats.plan_limit) && (
            <p className="text-xs text-green-600 flex items-center space-x-1">
              <Infinity className="h-3 w-3" />
              <span>Acces nelimitat</span>
            </p>
          )}
        </div>

        {/* Content Usage */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <MessageSquare className="h-4 w-4 text-gray-600" />
              <span className="text-sm font-medium text-gray-700">Conținut generat</span>
            </div>
            <div className={`px-2 py-1 rounded-lg text-xs font-medium ${getUsageColor(contentUsagePercentage, isUnlimited(stats.content_limit))}`}>
              {formatLimit(stats.content_this_month, stats.content_limit)}
            </div>
          </div>
          
          {!isUnlimited(stats.content_limit) && (
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className={`h-2 rounded-full transition-all duration-300 ${getProgressColor(contentUsagePercentage, false)}`}
                style={{ 
                  width: `${Math.min(contentUsagePercentage, 100)}%` 
                }}
              />
            </div>
          )}
          
          {isNearContentLimit && (
            <p className="text-xs text-amber-600">
              Ai folosit {Math.round(contentUsagePercentage)}% din conținutul disponibil
            </p>
          )}
          
          {isUnlimited(stats.content_limit) && (
            <p className="text-xs text-green-600 flex items-center space-x-1">
              <Infinity className="h-3 w-3" />
              <span>Acces nelimitat</span>
            </p>
          )}
        </div>

        {/* Total Stats */}
        <div className="pt-4 border-t border-gray-200">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-4 w-4 text-gray-600" />
              <span className="text-gray-700">Total planuri create:</span>
            </div>
            <span className="font-semibold text-gray-900">{stats.total_plans}</span>
          </div>
        </div>

        {/* Upgrade Button */}
        {showUpgrade && stats.subscription_plan === 'free' && (isNearPlanLimit || isNearContentLimit) && (
          <div className="pt-4 border-t border-gray-200">
            <Button 
              variant="outline" 
              className="w-full flex items-center justify-center space-x-2"
            >
              <Crown className="h-4 w-4" />
              <span>Upgrade la Pro</span>
            </Button>
          </div>
        )}
      </div>
    </Card>
  );
};