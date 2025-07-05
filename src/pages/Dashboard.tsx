import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { SkeletonLoader } from '../components/ui/SkeletonLoader';
import { MarketingPlanGenerator } from '../components/MarketingPlanGenerator';
import { QuickContentGenerator } from '../components/QuickContentGenerator';
import { UsageStats } from '../components/UsageStats';
import { NotificationCenter } from '../components/NotificationCenter';
import { Plus, Zap, TrendingUp, Calendar, Target } from 'lucide-react';

interface DashboardStats {
  totalPlans: number;
  plansThisMonth: number;
  activePlans: number;
  draftPlans: number;
  lastPlanCreated: string | null;
  uniqueBrandProfiles: number;
}

interface BrandProfile {
  id: string;
  brand_name: string;
  brand_description: string;
  content_example_1: string;
  content_example_2?: string;
  personality_traits: string[];
  communication_tones: string[];
  created_at: string;
  updated_at: string;
}

interface MarketingPlan {
  id: string;
  title: string;
  created_at: string;
  status: string;
  brand_profile_id: string;
  brand_profiles: BrandProfile;
}

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentPlans, setRecentPlans] = useState<MarketingPlan[]>([]);
  const [brandProfile, setBrandProfile] = useState<BrandProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [showGenerator, setShowGenerator] = useState(false);
  const [showQuickGenerator, setShowQuickGenerator] = useState(false);
  const [quickGeneratorFocus, setQuickGeneratorFocus] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      loadDashboardData();
    }
  }, [user]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Load dashboard stats
      const { data: statsData } = await supabase
        .from('user_dashboard_stats')
        .select('*')
        .eq('user_id', user?.id)
        .single();

      if (statsData) {
        setStats(statsData);
      }

      // Load recent marketing plans
      const { data: plansData } = await supabase
        .from('marketing_plans')
        .select(`
          id,
          title,
          created_at,
          status,
          brand_profile_id,
          brand_profiles (
            id,
            brand_name,
            brand_description,
            content_example_1,
            content_example_2,
            personality_traits,
            communication_tones,
            created_at,
            updated_at
          )
        `)
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false })
        .limit(5);

      if (plansData) {
        setRecentPlans(plansData);
      }

      // Load user's brand profile
      const { data: brandData } = await supabase
        .from('brand_profiles')
        .select('*')
        .eq('user_id', user?.id)
        .order('updated_at', { ascending: false })
        .limit(1)
        .single();

      if (brandData) {
        setBrandProfile(brandData);
      }

    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickAction = (type: string) => {
    if (type === 'generate-plan') {
      setShowGenerator(true);
    } else {
      setQuickGeneratorFocus(type);
      setShowQuickGenerator(true);
    }
  };

  const handleViewPlan = (planId: string) => {
    navigate(`/app/plans?view=${planId}`);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <SkeletonLoader className="h-8 w-64" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <SkeletonLoader key={i} className="h-32" />
          ))}
        </div>
        <SkeletonLoader className="h-64" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Tablou de bord</h1>
          <p className="text-gray-600 mt-1">
            Bine ai revenit! Iată ce se întâmplă cu marketingul tău.
          </p>
        </div>
        <NotificationCenter />
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total planuri</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats?.totalPlans || 0}
              </p>
            </div>
            <Target className="h-8 w-8 text-blue-600" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Luna aceasta</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats?.plansThisMonth || 0}
              </p>
            </div>
            <TrendingUp className="h-8 w-8 text-green-600" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Planuri active</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats?.activePlans || 0}
              </p>
            </div>
            <Zap className="h-8 w-8 text-yellow-600" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Profile de brand</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats?.uniqueBrandProfiles || 0}
              </p>
            </div>
            <Calendar className="h-8 w-8 text-purple-600" />
          </div>
        </Card>
      </div>

      {/* Usage Stats */}
      <UsageStats />

      {/* Quick Actions */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Acțiuni rapide</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Button
            onClick={() => handleQuickAction('generate-plan')}
            className="flex items-center justify-center space-x-2 h-16"
          >
            <Plus className="h-5 w-5" />
            <span>Plan de marketing nou</span>
          </Button>
          
          <Button
            variant="outline"
            onClick={() => handleQuickAction('social-post')}
            className="flex items-center justify-center space-x-2 h-16"
          >
            <Zap className="h-5 w-5" />
            <span>Postare rapidă</span>
          </Button>
          
          <Button
            variant="outline"
            onClick={() => handleQuickAction('email-campaign')}
            className="flex items-center justify-center space-x-2 h-16"
          >
            <TrendingUp className="h-5 w-5" />
            <span>Campanie email</span>
          </Button>
          
          <Button
            variant="outline"
            onClick={() => handleQuickAction('blog-post')}
            className="flex items-center justify-center space-x-2 h-16"
          >
            <Calendar className="h-5 w-5" />
            <span>Articol blog</span>
          </Button>
        </div>
      </Card>

      {/* Recent Plans */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Planuri de marketing recente</h2>
          <Button variant="outline" size="sm">
            Vezi toate
          </Button>
        </div>
        
        {recentPlans.length > 0 ? (
          <div className="space-y-4">
            {recentPlans.map((plan) => (
              <div
                key={plan.id}
                className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div>
                  <h3 className="font-medium text-gray-900">{plan.title}</h3>
                  <p className="text-sm text-gray-600">
                    {plan.brand_profiles?.brand_name} • {' '}
                    {new Date(plan.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    plan.status === 'active' 
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {plan.status === 'active' ? 'activ' : plan.status}
                  </span>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleViewPlan(plan.id)}
                  >
                    Vezi
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Încă nu ai planuri de marketing
            </h3>
            <p className="text-gray-600 mb-4">
              Creează primul tău plan de marketing pentru a începe.
            </p>
            <Button onClick={() => setShowGenerator(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Creează plan de marketing
            </Button>
          </div>
        )}
      </Card>

      {/* Marketing Plan Generator Modal */}
      {brandProfile && (
        <MarketingPlanGenerator
          isOpen={showGenerator}
          onClose={() => setShowGenerator(false)}
          onPlanGenerated={loadDashboardData}
          brandProfile={brandProfile}
        />
      )}

      {/* Quick Content Generator Modal */}
      {brandProfile && (
        <QuickContentGenerator
          isOpen={showQuickGenerator}
          onClose={() => {
            setShowQuickGenerator(false);
            setQuickGeneratorFocus(null);
          }}
          brandProfile={brandProfile}
          focusType={quickGeneratorFocus}
        />
      )}
    </div>
  );
}