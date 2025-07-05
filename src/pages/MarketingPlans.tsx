import React, { useState, useEffect } from 'react';
import { Plus, Target, Calendar, Eye, Edit3, Trash2, Filter, Search, ArrowLeft } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { LazyWrapper, LazyMarketingPlanGenerator, LazyMarketingPlanDetails, PlanGeneratorSkeleton, ComponentSkeleton } from '../components/LazyComponents';

interface BrandProfile {
  id: string;
  brand_name: string;
  brand_description: string;
  content_example_1: string;
  content_example_2: string | null;
  personality_traits: string[];
  communication_tones: string[];
}

interface MarketingPlan {
  id: string;
  title: string;
  details: any;
  created_at: string;
}

type ViewMode = 'list' | 'generator' | 'details';

export const MarketingPlans: React.FC = () => {
  const { user } = useAuth();
  const [brandProfile, setBrandProfile] = useState<BrandProfile | null>(null);
  const [marketingPlans, setMarketingPlans] = useState<MarketingPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPlan, setSelectedPlan] = useState<MarketingPlan | null>(null);

  useEffect(() => {
    // Check if we should open the generator directly
    const urlParams = new URLSearchParams(location.search);
    if (urlParams.get('action') === 'generate') {
      setViewMode('generator');
    }

    const fetchData = async () => {
      if (!user) return;

      try {
        // Fetch brand profile
        const { data: brandData, error: brandError } = await supabase
          .from('brand_profiles')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (brandData && !brandError) {
          setBrandProfile(brandData);
          
          // Fetch marketing plans
          const { data: plansData, error: plansError } = await supabase
            .from('marketing_plans')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false });

          if (plansData && !plansError) {
            setMarketingPlans(plansData);
          }
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  const handlePlanGenerated = (newPlan: MarketingPlan) => {
    setMarketingPlans(prev => [newPlan, ...prev]);
    setViewMode('list');
  };

  const handleViewPlan = (plan: MarketingPlan) => {
    setSelectedPlan(plan);
    setViewMode('details');
  };

  const handlePlanUpdated = (updatedPlan: MarketingPlan) => {
    setMarketingPlans(prev => 
      prev.map(plan => plan.id === updatedPlan.id ? updatedPlan : plan)
    );
    setSelectedPlan(updatedPlan);
  };

  const handleDeletePlan = async (planId: string) => {
    if (!confirm('Ești sigur că vrei să ștergi acest plan?')) return;

    try {
      const { error } = await supabase
        .from('marketing_plans')
        .delete()
        .eq('id', planId);

      if (error) throw error;

      setMarketingPlans(prev => prev.filter(plan => plan.id !== planId));
    } catch (error) {
      console.error('Error deleting plan:', error);
    }
  };

  const filteredPlans = marketingPlans.filter(plan =>
    plan.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    plan.details?.summary?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="space-y-6">
        <ComponentSkeleton />
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => (
            <ComponentSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  if (!brandProfile) {
    return (
      <Card className="text-center py-12" animation="bounceIn">
        <div className="p-4 bg-gradient-to-r from-gray-100 to-gray-200 rounded-2xl mb-4 inline-block">
          <Target className="h-12 w-12 text-gray-500" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Definește vocea brandului</h2>
        <p className="text-gray-600 mb-6">
          Pentru a genera planuri de marketing personalizate, trebuie să îți definești mai întâi vocea brandului.
        </p>
        <Button className="flex items-center space-x-2">
          <Target className="h-4 w-4" />
          <span>Configurează brandul</span>
        </Button>
      </Card>
    );
  }

  // Show plan details
  if (viewMode === 'details' && selectedPlan) {
    return (
      <LazyWrapper fallback={<ComponentSkeleton />}>
        <LazyMarketingPlanDetails
          plan={selectedPlan}
          onBack={() => {
            setViewMode('list');
            setSelectedPlan(null);
          }}
          onEdit={() => {
            // Edit functionality is handled within MarketingPlanDetails
          }}
          onPlanUpdated={handlePlanUpdated}
        />
      </LazyWrapper>
    );
  }

  // Show generator
  if (viewMode === 'generator') {
    return (
      <div className="space-y-6">
        <Card animation="fadeInUp">
          <div className="flex items-center justify-between">
            <Button 
              variant="outline" 
              onClick={() => setViewMode('list')}
              className="flex items-center space-x-2"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Înapoi la planuri</span>
            </Button>
            <h1 className="text-2xl font-bold text-gray-900">Generează Plan Nou</h1>
          </div>
        </Card>

        <LazyWrapper fallback={<PlanGeneratorSkeleton />}>
          <LazyMarketingPlanGenerator 
            brandProfile={brandProfile}
            onPlanGenerated={handlePlanGenerated}
          />
        </LazyWrapper>
      </div>
    );
  }

  // Show plans list
  return (
    <div className="space-y-8">
      {/* Header */}
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200" animation="fadeInUp">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Planuri de Marketing</h1>
            <p className="text-gray-600">
              Gestionează și creează planuri de marketing personalizate pentru {brandProfile.brand_name}
            </p>
          </div>
          <Button 
            onClick={() => setViewMode('generator')}
            className="flex items-center space-x-2"
            size="lg"
          >
            <Plus className="h-5 w-5" />
            <span>Plan Nou</span>
          </Button>
        </div>
      </Card>

      {/* Search and Filters */}
      <Card className="shadow-lg" animation="slideInLeft">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <Input
              placeholder="Caută planuri..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              icon={Search}
            />
          </div>
          <Button variant="outline" className="flex items-center space-x-2">
            <Filter className="h-4 w-4" />
            <span>Filtrează</span>
          </Button>
        </div>
      </Card>

      {/* Plans Grid */}
      {filteredPlans.length === 0 ? (
        <Card className="text-center py-12" animation="bounceIn">
          <div className="p-4 bg-gradient-to-r from-gray-100 to-gray-200 rounded-2xl mb-4 inline-block">
            <Target className="h-12 w-12 text-gray-500" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            {searchTerm ? 'Nu s-au găsit planuri' : 'Nu ai încă planuri de marketing'}
          </h3>
          <p className="text-gray-600 mb-6">
            {searchTerm 
              ? 'Încearcă să modifici termenul de căutare'
              : 'Creează primul tău plan de marketing personalizat cu AI'
            }
          </p>
          {!searchTerm && (
            <Button 
              onClick={() => setViewMode('generator')}
              className="flex items-center space-x-2"
            >
              <Plus className="h-4 w-4" />
              <span>Creează primul plan</span>
            </Button>
          )}
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredPlans.map((plan, index) => (
            <Card 
              key={plan.id}
              className="shadow-lg cursor-pointer group"
              animation="scaleIn"
              delay={index + 1}
              hover="subtle"
            >
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                      {plan.title}
                    </h3>
                    <p className="text-gray-600 text-sm mt-1 line-clamp-2">
                      {plan.details?.summary || plan.details?.objective || 'Plan de marketing personalizat'}
                    </p>
                  </div>
                  <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleViewPlan(plan);
                      }}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleViewPlan(plan);
                      }}
                    >
                      <Edit3 className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeletePlan(plan.id);
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="space-y-3">
                  {plan.details?.kpis_smart && (
                    <div>
                      <h4 className="font-semibold text-gray-800 text-sm mb-2">KPI-uri SMART:</h4>
                      <ul className="space-y-1">
                        {plan.details.kpis_smart.slice(0, 2).map((kpi: any, idx: number) => (
                          <li key={idx} className="text-xs text-gray-600 flex items-start space-x-1">
                            <span className="w-1 h-1 bg-green-500 rounded-full mt-1.5 flex-shrink-0"></span>
                            <span className="line-clamp-1">{kpi.name}: {kpi.target_value}</span>
                          </li>
                        ))}
                        {plan.details.kpis_smart.length > 2 && (
                          <li className="text-xs text-gray-500">
                            +{plan.details.kpis_smart.length - 2} KPI-uri
                          </li>
                        )}
                      </ul>
                    </div>
                  )}

                  {plan.details?.tactical_plan_per_platform && (
                    <div>
                      <h4 className="font-semibold text-gray-800 text-sm mb-2">Platforme:</h4>
                      <div className="flex flex-wrap gap-1">
                        {plan.details.tactical_plan_per_platform.slice(0, 3).map((platform: any, idx: number) => (
                          <span 
                            key={idx}
                            className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium"
                          >
                            {platform.platform}
                          </span>
                        ))}
                        {plan.details.tactical_plan_per_platform.length > 3 && (
                          <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs">
                            +{plan.details.tactical_plan_per_platform.length - 3}
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Plan Type Indicator */}
                  {plan.details?.plan_type === 'digital_marketing_complete' && (
                    <div className="pt-2 border-t border-gray-100">
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="text-xs text-gray-500">
                          Plan Digital Complet
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Brand Voice Used Indicator */}
                  {plan.details?.brand_voice_used && (
                    <div className="pt-2 border-t border-gray-100">
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                        <span className="text-xs text-gray-500">
                          Vocea brandului din {new Date(plan.details.brand_voice_used.timestamp || plan.created_at).toLocaleDateString('ro-RO')}
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                  <span className="text-xs text-gray-500">
                    {new Date(plan.created_at).toLocaleDateString('ro-RO')}
                    {plan.details?.last_edited && (
                      <span className="ml-2">
                        • Editat: {new Date(plan.details.last_edited).toLocaleDateString('ro-RO')}
                      </span>
                    )}
                  </span>
                  <Button 
                    size="sm" 
                    className="flex items-center space-x-1"
                    onClick={() => handleViewPlan(plan)}
                  >
                    <Calendar className="h-3 w-3" />
                    <span>Vezi detalii</span>
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};