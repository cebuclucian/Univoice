import React, { useState, useEffect } from 'react';
import { ArrowLeft, Edit3, Download, Share2, Calendar, Target, Users, TrendingUp, CheckCircle, Clock, Sparkles, Eye, Copy } from 'lucide-react';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { MarketingPlanEditor } from './MarketingPlanEditor';
import { PostEditor } from './PostEditor';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

interface MarketingPlan {
  id: string;
  title: string;
  details: any;
  created_at: string;
}

interface ScheduledPost {
  id: string;
  platform: string;
  content: string;
  scheduled_at: string;
  status: string;
  user_id: string;
  marketing_plan_id: string;
}

interface MarketingPlanDetailsProps {
  plan: MarketingPlan;
  onBack: () => void;
  onEdit: () => void;
  onPlanUpdated: (updatedPlan: MarketingPlan) => void;
}

export const MarketingPlanDetails: React.FC<MarketingPlanDetailsProps> = ({
  plan,
  onBack,
  onEdit,
  onPlanUpdated
}) => {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [scheduledPosts, setScheduledPosts] = useState<ScheduledPost[]>([]);
  const [loadingPosts, setLoadingPosts] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'strategy' | 'content' | 'kpis' | 'posts'>('overview');

  useEffect(() => {
    const fetchScheduledPosts = async () => {
      if (!user) return;

      try {
        setLoadingPosts(true);
        const { data, error } = await supabase
          .from('scheduled_posts')
          .select('*')
          .eq('marketing_plan_id', plan.id)
          .order('scheduled_at', { ascending: true });

        if (error) throw error;
        setScheduledPosts(data || []);
      } catch (error) {
        console.error('Error fetching scheduled posts:', error);
      } finally {
        setLoadingPosts(false);
      }
    };

    fetchScheduledPosts();
  }, [user, plan.id]);

  const handlePlanUpdated = (updatedPlan: MarketingPlan) => {
    onPlanUpdated(updatedPlan);
    setIsEditing(false);
  };

  const handlePostUpdated = (updatedPost: ScheduledPost) => {
    setScheduledPosts(prev => 
      prev.map(post => post.id === updatedPost.id ? updatedPost : post)
    );
  };

  const exportPlan = () => {
    const exportContent = `Plan de Marketing: ${plan.title}
Creat pe: ${new Date(plan.created_at).toLocaleDateString('ro-RO')}

${plan.details?.summary ? `REZUMAT:
${plan.details.summary}

` : ''}${plan.details?.objectives ? `OBIECTIVE:
${plan.details.objectives.map((obj: string, idx: number) => `${idx + 1}. ${obj}`).join('\n')}

` : ''}${plan.details?.target_audience ? `AUDIENȚA ȚINTĂ:
Principală: ${plan.details.target_audience.primary || 'Nu este specificată'}
Demografia: ${plan.details.target_audience.demographics || 'Nu este specificată'}
Psihografia: ${plan.details.target_audience.psychographics || 'Nu este specificată'}

` : ''}${plan.details?.strategy ? `STRATEGIA:
Poziționare: ${plan.details.strategy.positioning || 'Nu este specificată'}
Mesaje cheie: ${plan.details.strategy.key_messages?.join(', ') || 'Nu sunt specificate'}
Piloni de conținut: ${plan.details.strategy.content_pillars?.join(', ') || 'Nu sunt specificați'}

` : ''}${plan.details?.tactical_plan_per_platform ? `PLAN TACTIC PE PLATFORME:
${plan.details.tactical_plan_per_platform.map((platform: any) => 
  `${platform.platform || platform.name}: ${platform.strategy || 'Strategie nespecificată'}`
).join('\n')}

` : ''}${plan.details?.kpis_smart ? `KPI-URI SMART:
${plan.details.kpis_smart.map((kpi: any, idx: number) => 
  `${idx + 1}. ${kpi.name}: ${kpi.target_value || kpi.target} (${kpi.timeframe || 'Perioada nespecificată'})`
).join('\n')}

` : ''}---
Generat de Univoice - ${new Date().toLocaleDateString('ro-RO')}`;

    const blob = new Blob([exportContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `plan_marketing_${plan.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const copyPlanSummary = async () => {
    const summary = `Plan de Marketing: ${plan.title}

${plan.details?.summary || 'Plan de marketing personalizat generat cu Univoice'}

Obiective principale:
${plan.details?.objectives?.slice(0, 3).map((obj: string, idx: number) => `• ${obj}`).join('\n') || '• Creșterea awareness-ului brandului'}

Platforme: ${plan.details?.tactical_plan_per_platform?.map((p: any) => p.platform || p.name).join(', ') || 'Multiple platforme'}

Generat cu Univoice`;

    try {
      await navigator.clipboard.writeText(summary);
      // You could add a toast notification here
    } catch (error) {
      console.error('Error copying to clipboard:', error);
    }
  };

  if (isEditing) {
    return (
      <MarketingPlanEditor
        plan={plan}
        onSave={handlePlanUpdated}
        onCancel={() => setIsEditing(false)}
      />
    );
  }

  const tabs = [
    { id: 'overview', name: 'Prezentare generală', icon: Eye },
    { id: 'strategy', name: 'Strategie', icon: Target },
    { id: 'content', name: 'Conținut', icon: Calendar },
    { id: 'kpis', name: 'KPI-uri', icon: TrendingUp },
    { id: 'posts', name: 'Postări programate', icon: Clock }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200" animation="fadeInUp">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
          <div className="flex items-center space-x-4">
            <Button 
              variant="outline" 
              onClick={onBack}
              className="flex items-center space-x-2"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Înapoi</span>
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{plan.title}</h1>
              <p className="text-gray-600">
                Creat pe {new Date(plan.created_at).toLocaleDateString('ro-RO')}
                {plan.details?.last_edited && (
                  <span className="ml-2">
                    • Editat pe {new Date(plan.details.last_edited).toLocaleDateString('ro-RO')}
                  </span>
                )}
              </p>
            </div>
          </div>
          
          <div className="flex space-x-3">
            <Button 
              variant="outline" 
              onClick={copyPlanSummary}
              className="flex items-center space-x-2"
            >
              <Copy className="h-4 w-4" />
              <span>Copiază</span>
            </Button>
            <Button 
              variant="outline" 
              onClick={exportPlan}
              className="flex items-center space-x-2"
            >
              <Download className="h-4 w-4" />
              <span>Exportă</span>
            </Button>
            <Button 
              onClick={() => setIsEditing(true)}
              className="flex items-center space-x-2"
            >
              <Edit3 className="h-4 w-4" />
              <span>Editează</span>
            </Button>
          </div>
        </div>
      </Card>

      {/* Tabs */}
      <Card className="shadow-lg" animation="slideInLeft">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 overflow-x-auto">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`
                    flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors whitespace-nowrap
                    ${activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }
                  `}
                >
                  <Icon className="h-4 w-4" />
                  <span>{tab.name}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </Card>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Summary */}
          {plan.details?.summary && (
            <Card className="shadow-lg" animation="slideInLeft" hover="subtle">
              <div className="flex items-center space-x-3 mb-4">
                <div className="p-2 bg-blue-100 rounded-xl">
                  <Sparkles className="h-6 w-6 text-blue-600" />
                </div>
                <h2 className="text-xl font-bold text-gray-900">Rezumat executiv</h2>
              </div>
              <p className="text-gray-700 leading-relaxed">{plan.details.summary}</p>
            </Card>
          )}

          {/* Objectives */}
          {plan.details?.objectives && (
            <Card className="shadow-lg" animation="slideInRight" hover="subtle">
              <div className="flex items-center space-x-3 mb-4">
                <div className="p-2 bg-green-100 rounded-xl">
                  <Target className="h-6 w-6 text-green-600" />
                </div>
                <h2 className="text-xl font-bold text-gray-900">Obiective</h2>
              </div>
              <div className="space-y-3">
                {plan.details.objectives.map((objective: string, index: number) => (
                  <div key={index} className="flex items-start space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <p className="text-gray-700">{objective}</p>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Target Audience */}
          {plan.details?.target_audience && (
            <Card className="shadow-lg" animation="scaleIn" delay={1} hover="subtle">
              <div className="flex items-center space-x-3 mb-4">
                <div className="p-2 bg-purple-100 rounded-xl">
                  <Users className="h-6 w-6 text-purple-600" />
                </div>
                <h2 className="text-xl font-bold text-gray-900">Audiența țintă</h2>
              </div>
              <div className="space-y-4">
                {plan.details.target_audience.primary && (
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-2">Audiența principală:</h4>
                    <p className="text-gray-700">{plan.details.target_audience.primary}</p>
                  </div>
                )}
                {plan.details.target_audience.demographics && (
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-2">Demografia:</h4>
                    <p className="text-gray-700">{plan.details.target_audience.demographics}</p>
                  </div>
                )}
                {plan.details.target_audience.psychographics && (
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-2">Psihografia:</h4>
                    <p className="text-gray-700">{plan.details.target_audience.psychographics}</p>
                  </div>
                )}
                {plan.details.target_audience.pain_points && plan.details.target_audience.pain_points.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-2">Puncte de durere:</h4>
                    <ul className="space-y-1">
                      {plan.details.target_audience.pain_points.map((point: string, index: number) => (
                        <li key={index} className="flex items-start space-x-2">
                          <span className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></span>
                          <span className="text-gray-700">{point}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </Card>
          )}
        </div>
      )}

      {activeTab === 'strategy' && (
        <div className="space-y-6">
          {/* Strategy */}
          {plan.details?.strategy && (
            <Card className="shadow-lg" animation="slideInLeft" hover="subtle">
              <div className="flex items-center space-x-3 mb-6">
                <div className="p-2 bg-blue-100 rounded-xl">
                  <Target className="h-6 w-6 text-blue-600" />
                </div>
                <h2 className="text-xl font-bold text-gray-900">Strategia de marketing</h2>
              </div>
              
              <div className="space-y-6">
                {plan.details.strategy.positioning && (
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-3">Poziționarea brandului:</h4>
                    <p className="text-gray-700 leading-relaxed">{plan.details.strategy.positioning}</p>
                  </div>
                )}

                {plan.details.strategy.key_messages && plan.details.strategy.key_messages.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-3">Mesaje cheie:</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {plan.details.strategy.key_messages.map((message: string, index: number) => (
                        <div key={index} className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                          <p className="text-blue-800 font-medium">{message}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {plan.details.strategy.content_pillars && plan.details.strategy.content_pillars.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-3">Piloni de conținut:</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      {plan.details.strategy.content_pillars.map((pillar: string, index: number) => (
                        <div key={index} className="bg-purple-50 border border-purple-200 rounded-lg p-3 text-center">
                          <p className="text-purple-800 font-medium">{pillar}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </Card>
          )}

          {/* Tactical Plan per Platform */}
          {plan.details?.tactical_plan_per_platform && (
            <Card className="shadow-lg" animation="slideInRight" hover="subtle">
              <div className="flex items-center space-x-3 mb-6">
                <div className="p-2 bg-green-100 rounded-xl">
                  <Calendar className="h-6 w-6 text-green-600" />
                </div>
                <h2 className="text-xl font-bold text-gray-900">Plan tactic pe platforme</h2>
              </div>
              
              <div className="space-y-6">
                {plan.details.tactical_plan_per_platform.map((platform: any, index: number) => (
                  <Card key={index} className="border-l-4 border-green-400" padding="md">
                    <h4 className="text-lg font-bold text-gray-900 mb-3">
                      {platform.platform || platform.name}
                    </h4>
                    
                    {platform.strategy && (
                      <div className="mb-4">
                        <h5 className="font-semibold text-gray-800 mb-2">Strategia:</h5>
                        <p className="text-gray-700">{platform.strategy}</p>
                      </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {platform.content_types && platform.content_types.length > 0 && (
                        <div>
                          <h5 className="font-semibold text-gray-800 mb-2">Tipuri de conținut:</h5>
                          <div className="flex flex-wrap gap-1">
                            {platform.content_types.map((type: string, typeIndex: number) => (
                              <span key={typeIndex} className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                                {type}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {platform.posting_frequency && (
                        <div>
                          <h5 className="font-semibold text-gray-800 mb-2">Frecvența postărilor:</h5>
                          <p className="text-gray-700 text-sm">{platform.posting_frequency}</p>
                        </div>
                      )}
                    </div>

                    {platform.kpis && platform.kpis.length > 0 && (
                      <div className="mt-4">
                        <h5 className="font-semibold text-gray-800 mb-2">KPI-uri:</h5>
                        <div className="flex flex-wrap gap-1">
                          {platform.kpis.map((kpi: string, kpiIndex: number) => (
                            <span key={kpiIndex} className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">
                              {kpi}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </Card>
                ))}
              </div>
            </Card>
          )}
        </div>
      )}

      {activeTab === 'content' && (
        <div className="space-y-6">
          {/* Content Calendar */}
          {plan.details?.content_calendar && (
            <Card className="shadow-lg" animation="slideInLeft" hover="subtle">
              <div className="flex items-center space-x-3 mb-6">
                <div className="p-2 bg-purple-100 rounded-xl">
                  <Calendar className="h-6 w-6 text-purple-600" />
                </div>
                <h2 className="text-xl font-bold text-gray-900">Calendar de conținut</h2>
              </div>
              
              <div className="space-y-6">
                {plan.details.content_calendar.map((week: any, index: number) => (
                  <Card key={index} className="border-l-4 border-purple-400" padding="md">
                    <h4 className="text-lg font-bold text-gray-900 mb-3">
                      Săptămâna {week.week}
                      {week.theme && <span className="text-purple-600 ml-2">- {week.theme}</span>}
                    </h4>
                    
                    {week.posts && week.posts.length > 0 && (
                      <div className="space-y-3">
                        {week.posts.map((post: any, postIndex: number) => (
                          <div key={postIndex} className="bg-gray-50 rounded-lg p-4">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center space-x-2">
                                <span className="font-semibold text-gray-900">{post.platform}</span>
                                <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-xs">
                                  {post.type}
                                </span>
                              </div>
                              <span className="text-sm text-gray-600">{post.day}</span>
                            </div>
                            <p className="text-gray-700 text-sm">{post.content}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </Card>
                ))}
              </div>
            </Card>
          )}
        </div>
      )}

      {activeTab === 'kpis' && (
        <div className="space-y-6">
          {/* KPIs */}
          {plan.details?.kpis_smart && (
            <Card className="shadow-lg" animation="slideInLeft" hover="subtle">
              <div className="flex items-center space-x-3 mb-6">
                <div className="p-2 bg-green-100 rounded-xl">
                  <TrendingUp className="h-6 w-6 text-green-600" />
                </div>
                <h2 className="text-xl font-bold text-gray-900">KPI-uri SMART</h2>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {plan.details.kpis_smart.map((kpi: any, index: number) => (
                  <Card key={index} className="border-l-4 border-green-400" padding="md">
                    <h4 className="text-lg font-bold text-gray-900 mb-3">
                      {kpi.name || kpi.metric}
                    </h4>
                    
                    <div className="space-y-2 text-sm">
                      {kpi.target_value && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Ținta:</span>
                          <span className="font-semibold text-gray-900">{kpi.target_value}</span>
                        </div>
                      )}
                      {kpi.timeframe && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Perioada:</span>
                          <span className="font-semibold text-gray-900">{kpi.timeframe}</span>
                        </div>
                      )}
                      {kpi.measurement && (
                        <div className="mt-3">
                          <span className="text-gray-600">Măsurare:</span>
                          <p className="text-gray-700 mt-1">{kpi.measurement}</p>
                        </div>
                      )}
                    </div>
                  </Card>
                ))}
              </div>
            </Card>
          )}

          {/* Budget Allocation */}
          {plan.details?.budget_allocation_summary && (
            <Card className="shadow-lg" animation="slideInRight" hover="subtle">
              <div className="flex items-center space-x-3 mb-6">
                <div className="p-2 bg-blue-100 rounded-xl">
                  <TrendingUp className="h-6 w-6 text-blue-600" />
                </div>
                <h2 className="text-xl font-bold text-gray-900">Alocarea bugetului</h2>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {Object.entries(plan.details.budget_allocation_summary).map(([category, percentage]) => (
                  <div key={category} className="text-center">
                    <div className="bg-blue-50 rounded-lg p-4 mb-2">
                      <p className="text-2xl font-bold text-blue-600">{percentage as string}</p>
                    </div>
                    <p className="text-sm text-gray-700 capitalize">
                      {category.replace(/_/g, ' ')}
                    </p>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>
      )}

      {activeTab === 'posts' && (
        <div className="space-y-6">
          <Card className="shadow-lg" animation="slideInLeft">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-100 rounded-xl">
                  <Clock className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Postări programate</h2>
                  <p className="text-gray-600">
                    {scheduledPosts.length} postări pentru acest plan
                  </p>
                </div>
              </div>
            </div>

            {loadingPosts ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="text-gray-600 mt-2">Se încarcă postările...</p>
              </div>
            ) : scheduledPosts.length === 0 ? (
              <div className="text-center py-8">
                <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Nu există postări programate
                </h3>
                <p className="text-gray-600">
                  Postările programate vor apărea aici când sunt create.
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {scheduledPosts.map((post, index) => (
                  <PostEditor
                    key={post.id}
                    post={post}
                    onUpdate={handlePostUpdated}
                  />
                ))}
              </div>
            )}
          </Card>
        </div>
      )}
    </div>
  );
};