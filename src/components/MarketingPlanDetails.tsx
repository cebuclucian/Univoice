import React, { useState, useEffect } from 'react';
import { ArrowLeft, Calendar, Target, Users, BarChart3, Edit3, Save, X, Plus, Clock, CheckCircle, AlertCircle, Sparkles, Download, Share2, Copy, Eye, Wand2, Brain, TrendingUp, MessageSquare, Globe, Mail, Instagram, Facebook, Twitter, Linkedin } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { Button } from './ui/Button';
import { Card } from './ui/Card';
import { Input } from './ui/Input';
import { Textarea } from './ui/Textarea';
import { MarketingPlanEditor } from './MarketingPlanEditor';
import { PostEditor } from './PostEditor';
import { useNotifications } from '../contexts/NotificationContext';

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
  onPlanUpdated?: (updatedPlan: MarketingPlan) => void;
}

export const MarketingPlanDetails: React.FC<MarketingPlanDetailsProps> = ({
  plan,
  onBack,
  onEdit,
  onPlanUpdated
}) => {
  const { user } = useAuth();
  const { addNotification } = useNotifications();
  const [activeTab, setActiveTab] = useState<'overview' | 'content' | 'calendar' | 'analytics'>('overview');
  const [isEditing, setIsEditing] = useState(false);
  const [scheduledPosts, setScheduledPosts] = useState<ScheduledPost[]>([]);
  const [loadingPosts, setLoadingPosts] = useState(true);
  const [generatingContent, setGeneratingContent] = useState(false);

  useEffect(() => {
    const fetchScheduledPosts = async () => {
      if (!user) return;

      try {
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
    onPlanUpdated?.(updatedPlan);
    setIsEditing(false);
  };

  const handlePostUpdated = (updatedPost: ScheduledPost) => {
    setScheduledPosts(prev => 
      prev.map(post => post.id === updatedPost.id ? updatedPost : post)
    );
  };

  const generateContentCalendar = async () => {
    if (!user) return;

    setGeneratingContent(true);
    try {
      // Simulăm generarea unui calendar de conținut
      const platforms = ['Facebook', 'Instagram', 'LinkedIn', 'Twitter'];
      const newPosts: Omit<ScheduledPost, 'id'>[] = [];

      // Generăm postări pentru următoarele 7 zile
      for (let i = 0; i < 7; i++) {
        const date = new Date();
        date.setDate(date.getDate() + i + 1);
        
        // Alegeți o platformă aleatorie pentru fiecare zi
        const platform = platforms[i % platforms.length];
        
        // Setăm ora la 10:00 AM
        date.setHours(10, 0, 0, 0);

        const content = `Conținut generat pentru ${platform} - Ziua ${i + 1}

🎯 ${plan.details?.objectives?.[0] || 'Obiectivul principal al campaniei'}

${plan.details?.strategy?.key_messages?.[0] || 'Mesajul cheie al brandului'}

#marketing #business #${platform.toLowerCase()}`;

        newPosts.push({
          user_id: user.id,
          marketing_plan_id: plan.id,
          platform: platform,
          content: content,
          scheduled_at: date.toISOString(),
          status: 'scheduled'
        });
      }

      // Salvăm postările în baza de date
      const { data, error } = await supabase
        .from('scheduled_posts')
        .insert(newPosts)
        .select();

      if (error) throw error;

      setScheduledPosts(prev => [...prev, ...(data || [])]);
      
      addNotification({
        type: 'success',
        title: 'Calendar generat cu succes!',
        message: `Au fost create ${newPosts.length} postări programate pentru următoarele 7 zile.`,
        persistent: false,
        autoClose: true,
        duration: 4000
      });

    } catch (error) {
      console.error('Error generating content calendar:', error);
      addNotification({
        type: 'error',
        title: 'Eroare la generarea calendarului',
        message: 'Nu am putut genera calendarul de conținut. Te rog încearcă din nou.',
        persistent: true
      });
    } finally {
      setGeneratingContent(false);
    }
  };

  const exportPlan = () => {
    const exportData = {
      title: plan.title,
      created_at: plan.created_at,
      details: plan.details,
      scheduled_posts: scheduledPosts
    };

    const dataStr = JSON.stringify(exportData, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `plan-marketing-${plan.title.replace(/\s+/g, '-').toLowerCase()}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();

    addNotification({
      type: 'success',
      title: 'Plan exportat!',
      message: 'Planul de marketing a fost descărcat cu succes.',
      persistent: false,
      autoClose: true,
      duration: 3000
    });
  };

  const copyPlanToClipboard = async () => {
    try {
      const planText = `
PLAN DE MARKETING: ${plan.title}

OBIECTIVE:
${plan.details?.objectives?.map((obj: string, i: number) => `${i + 1}. ${obj}`).join('\n') || 'Nu sunt definite obiective'}

AUDIENȚA ȚINTĂ:
${plan.details?.target_audience?.primary || 'Nu este definită audiența'}

STRATEGIA:
${plan.details?.strategy?.positioning || 'Nu este definită strategia'}

PLATFORME:
${plan.details?.platforms?.map((p: any) => `- ${p.platform || p.name}: ${p.strategy}`).join('\n') || 'Nu sunt definite platforme'}

KPI-URI:
${plan.details?.kpis?.map((kpi: any, i: number) => `${i + 1}. ${kpi.name}: ${kpi.target}`).join('\n') || 'Nu sunt definite KPI-uri'}
      `.trim();

      await navigator.clipboard.writeText(planText);
      
      addNotification({
        type: 'success',
        title: 'Plan copiat!',
        message: 'Planul de marketing a fost copiat în clipboard.',
        persistent: false,
        autoClose: true,
        duration: 3000
      });
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Eroare la copiere',
        message: 'Nu am putut copia planul în clipboard.',
        persistent: true
      });
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
    { id: 'overview', name: 'Prezentare generală', icon: Target },
    { id: 'content', name: 'Calendar conținut', icon: Calendar },
    { id: 'analytics', name: 'Analiză', icon: BarChart3 }
  ];

  const renderOverview = () => (
    <div className="space-y-8">
      {/* Plan Summary */}
      <Card className="shadow-lg" animation="fadeInUp" hover="subtle">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Rezumat executiv</h2>
          <div className="flex space-x-2">
            <Button variant="outline" size="sm" onClick={copyPlanToClipboard}>
              <Copy className="h-4 w-4 mr-2" />
              Copiază
            </Button>
            <Button variant="outline" size="sm" onClick={exportPlan}>
              <Download className="h-4 w-4 mr-2" />
              Exportă
            </Button>
          </div>
        </div>
        
        <div className="prose max-w-none">
          <p className="text-gray-700 leading-relaxed">
            {plan.details?.summary || plan.details?.objective || 'Nu este disponibil un rezumat pentru acest plan.'}
          </p>
        </div>
      </Card>

      {/* Objectives */}
      {plan.details?.objectives && (
        <Card className="shadow-lg" animation="slideInLeft" delay={1} hover="subtle">
          <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center space-x-2">
            <Target className="h-6 w-6 text-blue-600" />
            <span>Obiectivele campaniei</span>
          </h3>
          <ul className="space-y-3">
            {plan.details.objectives.map((objective: string, index: number) => (
              <li key={index} className="flex items-start space-x-3">
                <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                <span className="text-gray-700">{objective}</span>
              </li>
            ))}
          </ul>
        </Card>
      )}

      {/* Target Audience */}
      {plan.details?.target_audience && (
        <Card className="shadow-lg" animation="slideInRight" delay={2} hover="subtle">
          <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center space-x-2">
            <Users className="h-6 w-6 text-purple-600" />
            <span>Audiența țintă</span>
          </h3>
          <div className="space-y-4">
            <div>
              <h4 className="font-semibold text-gray-800 mb-2">Audiența principală:</h4>
              <p className="text-gray-700">{plan.details.target_audience.primary}</p>
            </div>
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
          </div>
        </Card>
      )}

      {/* Strategy */}
      {plan.details?.strategy && (
        <Card className="shadow-lg" animation="fadeInUp" delay={3} hover="subtle">
          <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center space-x-2">
            <Brain className="h-6 w-6 text-indigo-600" />
            <span>Strategia de marketing</span>
          </h3>
          <div className="space-y-4">
            {plan.details.strategy.positioning && (
              <div>
                <h4 className="font-semibold text-gray-800 mb-2">Poziționarea:</h4>
                <p className="text-gray-700">{plan.details.strategy.positioning}</p>
              </div>
            )}
            {plan.details.strategy.key_messages && (
              <div>
                <h4 className="font-semibold text-gray-800 mb-2">Mesaje cheie:</h4>
                <ul className="list-disc list-inside space-y-1">
                  {plan.details.strategy.key_messages.map((message: string, index: number) => (
                    <li key={index} className="text-gray-700">{message}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Platforms */}
      {(plan.details?.platforms || plan.details?.tactical_plan_per_platform) && (
        <Card className="shadow-lg" animation="slideInLeft" delay={4} hover="subtle">
          <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center space-x-2">
            <Globe className="h-6 w-6 text-green-600" />
            <span>Platforme de marketing</span>
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {(plan.details.platforms || plan.details.tactical_plan_per_platform).map((platform: any, index: number) => (
              <Card key={index} className="border-l-4 border-blue-400" padding="md" hover="subtle">
                <h4 className="font-semibold text-gray-900 mb-2">
                  {platform.platform || platform.name}
                </h4>
                <p className="text-gray-700 text-sm mb-3">
                  {platform.strategy}
                </p>
                {platform.content_types && (
                  <div className="flex flex-wrap gap-1">
                    {platform.content_types.map((type: string, typeIndex: number) => (
                      <span 
                        key={typeIndex}
                        className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs"
                      >
                        {type}
                      </span>
                    ))}
                  </div>
                )}
              </Card>
            ))}
          </div>
        </Card>
      )}

      {/* KPIs */}
      {(plan.details?.kpis || plan.details?.kpis_smart) && (
        <Card className="shadow-lg" animation="slideInRight" delay={5} hover="subtle">
          <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center space-x-2">
            <BarChart3 className="h-6 w-6 text-orange-600" />
            <span>KPI-uri și metrici</span>
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {(plan.details.kpis || plan.details.kpis_smart).map((kpi: any, index: number) => (
              <Card key={index} className="border-l-4 border-orange-400" padding="sm" hover="subtle">
                <h4 className="font-semibold text-gray-900 text-sm">
                  {kpi.name || kpi.metric}
                </h4>
                <p className="text-gray-600 text-sm mt-1">
                  Țintă: {kpi.target || kpi.target_value}
                </p>
                {kpi.measurement && (
                  <p className="text-gray-500 text-xs mt-1">
                    {kpi.measurement}
                  </p>
                )}
              </Card>
            ))}
          </div>
        </Card>
      )}
    </div>
  );

  const renderContentCalendar = () => (
    <div className="space-y-6">
      {/* Header */}
      <Card className="shadow-lg" animation="fadeInUp">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Calendar de conținut</h2>
            <p className="text-gray-600">
              Gestionează și programează conținutul pentru toate platformele
            </p>
          </div>
          <Button 
            onClick={generateContentCalendar}
            loading={generatingContent}
            className="flex items-center space-x-2"
          >
            <Plus className="h-4 w-4" />
            <span>Generează calendar</span>
          </Button>
        </div>
      </Card>

      {/* Scheduled Posts */}
      {loadingPosts ? (
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <Card key={i} className="animate-pulse" padding="md">
              <div className="space-y-3">
                <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                <div className="h-20 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded w-1/3"></div>
              </div>
            </Card>
          ))}
        </div>
      ) : scheduledPosts.length === 0 ? (
        <Card className="text-center py-12" animation="bounceIn">
          <div className="p-4 bg-gradient-to-r from-gray-100 to-gray-200 rounded-2xl mb-4 inline-block">
            <Calendar className="h-12 w-12 text-gray-500" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Nu ai încă conținut programat
          </h3>
          <p className="text-gray-600 mb-6">
            Generează un calendar de conținut pentru a începe să programezi postări
          </p>
          <Button 
            onClick={generateContentCalendar}
            loading={generatingContent}
            className="flex items-center space-x-2"
          >
            <Sparkles className="h-4 w-4" />
            <span>Generează primul calendar</span>
          </Button>
        </Card>
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
    </div>
  );

  const renderAnalytics = () => (
    <div className="space-y-6">
      <Card className="shadow-lg" animation="fadeInUp">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Analiză și performanță</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="text-center" padding="md" hover="subtle">
            <div className="p-3 bg-blue-100 rounded-xl mb-4 inline-block">
              <MessageSquare className="h-8 w-8 text-blue-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900">{scheduledPosts.length}</h3>
            <p className="text-gray-600">Postări programate</p>
          </Card>

          <Card className="text-center" padding="md" hover="subtle">
            <div className="p-3 bg-green-100 rounded-xl mb-4 inline-block">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900">
              {scheduledPosts.filter(p => p.status === 'published').length}
            </h3>
            <p className="text-gray-600">Postări publicate</p>
          </Card>

          <Card className="text-center" padding="md" hover="subtle">
            <div className="p-3 bg-purple-100 rounded-xl mb-4 inline-block">
              <TrendingUp className="h-8 w-8 text-purple-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900">
              {new Set(scheduledPosts.map(p => p.platform)).size}
            </h3>
            <p className="text-gray-600">Platforme active</p>
          </Card>
        </div>

        <Card className="mt-6 bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200" padding="md">
          <div className="text-center">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Analiză avansată disponibilă în curând
            </h3>
            <p className="text-gray-600">
              Vom adăuga metrici detaliate de performanță, engagement și ROI
            </p>
          </div>
        </Card>
      </Card>
    </div>
  );

  return (
    <div className="space-y-8">
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
              </p>
            </div>
          </div>
          <Button 
            onClick={() => setIsEditing(true)}
            className="flex items-center space-x-2"
          >
            <Edit3 className="h-4 w-4" />
            <span>Editează planul</span>
          </Button>
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
      <div className="animate-fade-in-up">
        {activeTab === 'overview' && renderOverview()}
        {activeTab === 'content' && renderContentCalendar()}
        {activeTab === 'analytics' && renderAnalytics()}
      </div>
    </div>
  );
};