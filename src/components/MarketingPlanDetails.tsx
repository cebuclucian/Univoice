import React, { useState } from 'react';
import { 
  Calendar, Target, Users, TrendingUp, BarChart3, Clock, 
  CheckCircle, ArrowLeft, Edit3, Share2, Download, Brain,
  Lightbulb, Zap, MessageSquare, Instagram, Facebook, 
  Twitter, Mail, Globe, Youtube, Music, Monitor
} from 'lucide-react';
import { Card } from './ui/Card';
import { Button } from './ui/Button';

interface MarketingPlan {
  id: string;
  title: string;
  details: any;
  created_at: string;
}

interface MarketingPlanDetailsProps {
  plan: MarketingPlan;
  onBack: () => void;
  onEdit?: () => void;
}

export const MarketingPlanDetails: React.FC<MarketingPlanDetailsProps> = ({
  plan,
  onBack,
  onEdit
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'calendar' | 'content' | 'analytics'>('overview');

  const getPlatformIcon = (platformName: string) => {
    const name = platformName.toLowerCase();
    if (name.includes('facebook')) return <Facebook className="h-4 w-4" />;
    if (name.includes('instagram')) return <Instagram className="h-4 w-4" />;
    if (name.includes('twitter') || name.includes('x')) return <Twitter className="h-4 w-4" />;
    if (name.includes('linkedin')) return <Globe className="h-4 w-4" />;
    if (name.includes('youtube')) return <Youtube className="h-4 w-4" />;
    if (name.includes('tiktok')) return <Music className="h-4 w-4" />;
    if (name.includes('email')) return <Mail className="h-4 w-4" />;
    if (name.includes('website') || name.includes('blog')) return <Monitor className="h-4 w-4" />;
    return <MessageSquare className="h-4 w-4" />;
  };

  const getPlatformColor = (platformName: string) => {
    const name = platformName.toLowerCase();
    if (name.includes('facebook')) return 'bg-blue-100 text-blue-700 border-blue-200';
    if (name.includes('instagram')) return 'bg-pink-100 text-pink-700 border-pink-200';
    if (name.includes('twitter') || name.includes('x')) return 'bg-sky-100 text-sky-700 border-sky-200';
    if (name.includes('linkedin')) return 'bg-indigo-100 text-indigo-700 border-indigo-200';
    if (name.includes('youtube')) return 'bg-red-100 text-red-700 border-red-200';
    if (name.includes('tiktok')) return 'bg-purple-100 text-purple-700 border-purple-200';
    if (name.includes('email')) return 'bg-green-100 text-green-700 border-green-200';
    return 'bg-gray-100 text-gray-700 border-gray-200';
  };

  const tabs = [
    { id: 'overview', name: 'Prezentare generală', icon: Target },
    { id: 'calendar', name: 'Calendar conținut', icon: Calendar },
    { id: 'content', name: 'Conținut generat', icon: MessageSquare },
    { id: 'analytics', name: 'Metrici & KPI', icon: BarChart3 }
  ];

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Plan Summary */}
      <Card className="shadow-lg" animation="slideInLeft">
        <div className="flex items-center space-x-3 mb-6">
          <div className="p-3 bg-blue-100 rounded-xl">
            <Target className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900">Rezumat executiv</h3>
            <p className="text-gray-600">Obiective și strategie</p>
          </div>
        </div>
        
        <div className="prose max-w-none">
          <p className="text-gray-700 leading-relaxed mb-6">
            {plan.details?.summary || 'Plan de marketing personalizat generat cu AI.'}
          </p>
        </div>
      </Card>

      {/* Brand Voice Used */}
      {plan.details?.brand_voice_used && (
        <Card className="bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200" animation="slideInLeft">
          <div className="flex items-start space-x-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Brain className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 mb-2">Vocea brandului folosită</h3>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="font-semibold text-gray-800">Personalitate: </span>
                  <span className="text-gray-700">
                    {Array.isArray(plan.details.brand_voice_used.personality) 
                      ? plan.details.brand_voice_used.personality.join(', ')
                      : plan.details.brand_voice_used.personality
                    }
                  </span>
                </div>
                <div>
                  <span className="font-semibold text-gray-800">Ton: </span>
                  <span className="text-gray-700">
                    {Array.isArray(plan.details.brand_voice_used.tone)
                      ? plan.details.brand_voice_used.tone.join(', ')
                      : plan.details.brand_voice_used.tone
                    }
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Generat pe: {new Date(plan.details.brand_voice_used.timestamp || plan.created_at).toLocaleDateString('ro-RO')}
                </p>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Objectives and Target Audience */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="shadow-lg" animation="slideInLeft" hover="subtle">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-2 bg-green-100 rounded-xl">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <h3 className="text-lg font-bold text-gray-900">Obiective</h3>
          </div>
          
          <div className="space-y-3">
            {plan.details?.objectives?.map((objective: string, index: number) => (
              <div key={index} className="flex items-start space-x-2">
                <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                <p className="text-gray-700">{objective}</p>
              </div>
            ))}
          </div>
        </Card>

        <Card className="shadow-lg" animation="slideInRight" hover="subtle">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-2 bg-blue-100 rounded-xl">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
            <h3 className="text-lg font-bold text-gray-900">Audiența țintă</h3>
          </div>
          
          {plan.details?.target_audience && (
            <div className="space-y-3 text-sm">
              <div>
                <h4 className="font-semibold text-gray-800 mb-1">Audiența principală:</h4>
                <p className="text-gray-700">{plan.details.target_audience.primary}</p>
              </div>
              
              {plan.details.target_audience.demographics && (
                <div>
                  <h4 className="font-semibold text-gray-800 mb-1">Demografia:</h4>
                  <p className="text-gray-700">{plan.details.target_audience.demographics}</p>
                </div>
              )}
              
              {plan.details.target_audience.pain_points && (
                <div>
                  <h4 className="font-semibold text-gray-800 mb-1">Puncte de durere:</h4>
                  <ul className="space-y-1">
                    {plan.details.target_audience.pain_points.map((point: string, index: number) => (
                      <li key={index} className="flex items-start space-x-2">
                        <span className="w-1 h-1 bg-red-500 rounded-full mt-2 flex-shrink-0"></span>
                        <span className="text-gray-700">{point}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </Card>
      </div>

      {/* Strategy */}
      {plan.details?.strategy && (
        <Card className="shadow-lg" animation="fadeInUp" hover="subtle">
          <div className="flex items-center space-x-3 mb-6">
            <div className="p-2 bg-purple-100 rounded-xl">
              <Lightbulb className="h-6 w-6 text-purple-600" />
            </div>
            <h3 className="text-lg font-bold text-gray-900">Strategia</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {plan.details.strategy.positioning && (
              <div>
                <h4 className="font-semibold text-gray-800 mb-2">Poziționare:</h4>
                <p className="text-gray-700 text-sm">{plan.details.strategy.positioning}</p>
              </div>
            )}
            
            {plan.details.strategy.key_messages && (
              <div>
                <h4 className="font-semibold text-gray-800 mb-2">Mesaje cheie:</h4>
                <ul className="space-y-1">
                  {plan.details.strategy.key_messages.map((message: string, index: number) => (
                    <li key={index} className="text-gray-700 text-sm flex items-start space-x-2">
                      <span className="w-1 h-1 bg-blue-500 rounded-full mt-2 flex-shrink-0"></span>
                      <span>{message}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            
            {plan.details.strategy.content_pillars && (
              <div>
                <h4 className="font-semibold text-gray-800 mb-2">Piloni de conținut:</h4>
                <div className="flex flex-wrap gap-1">
                  {plan.details.strategy.content_pillars.map((pillar: string, index: number) => (
                    <span 
                      key={index}
                      className="px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-medium"
                    >
                      {pillar}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Platforms */}
      {plan.details?.platforms && (
        <Card className="shadow-lg" animation="fadeInUp" hover="subtle">
          <div className="flex items-center space-x-3 mb-6">
            <div className="p-2 bg-indigo-100 rounded-xl">
              <Zap className="h-6 w-6 text-indigo-600" />
            </div>
            <h3 className="text-lg font-bold text-gray-900">Platforme și strategii</h3>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {plan.details.platforms.map((platform: any, index: number) => (
              <Card 
                key={index}
                className={`border-l-4 ${getPlatformColor(platform.name).includes('blue') ? 'border-blue-400' : 
                  getPlatformColor(platform.name).includes('pink') ? 'border-pink-400' :
                  getPlatformColor(platform.name).includes('sky') ? 'border-sky-400' :
                  getPlatformColor(platform.name).includes('indigo') ? 'border-indigo-400' :
                  'border-gray-400'
                }`}
                padding="sm"
                hover="subtle"
              >
                <div className="flex items-center space-x-3 mb-3">
                  <div className={`p-2 rounded-lg ${getPlatformColor(platform.name)}`}>
                    {getPlatformIcon(platform.name)}
                  </div>
                  <h4 className="font-semibold text-gray-900">{platform.name}</h4>
                </div>
                
                <div className="space-y-2 text-sm">
                  <p className="text-gray-700">{platform.strategy}</p>
                  
                  {platform.content_types && (
                    <div>
                      <span className="font-semibold text-gray-800">Tipuri conținut: </span>
                      <span className="text-gray-600">{platform.content_types.join(', ')}</span>
                    </div>
                  )}
                  
                  {platform.posting_frequency && (
                    <div>
                      <span className="font-semibold text-gray-800">Frecvență: </span>
                      <span className="text-gray-600">{platform.posting_frequency}</span>
                    </div>
                  )}
                </div>
              </Card>
            ))}
          </div>
        </Card>
      )}
    </div>
  );

  const renderCalendar = () => (
    <div className="space-y-6">
      <Card className="shadow-lg" animation="slideInLeft">
        <div className="flex items-center space-x-3 mb-6">
          <div className="p-3 bg-green-100 rounded-xl">
            <Calendar className="h-6 w-6 text-green-600" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900">Calendar de conținut</h3>
            <p className="text-gray-600">Planificarea postărilor pe săptămâni</p>
          </div>
        </div>

        {plan.details?.content_calendar ? (
          <div className="space-y-6">
            {plan.details.content_calendar.map((week: any, weekIndex: number) => (
              <Card 
                key={weekIndex}
                className="bg-gray-50"
                padding="md"
                animation="fadeInUp"
                delay={weekIndex + 1}
              >
                <h4 className="font-bold text-gray-900 mb-4">
                  Săptămâna {week.week}
                </h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {week.content?.map((content: any, contentIndex: number) => (
                    <Card 
                      key={contentIndex}
                      className={`border-l-4 ${getPlatformColor(content.platform)}`}
                      padding="sm"
                      hover="subtle"
                    >
                      <div className="flex items-center space-x-2 mb-2">
                        <div className={`p-1 rounded ${getPlatformColor(content.platform)}`}>
                          {getPlatformIcon(content.platform)}
                        </div>
                        <span className="font-semibold text-gray-900 text-sm">
                          {content.platform}
                        </span>
                        <span className="text-xs text-gray-500">
                          {content.type}
                        </span>
                      </div>
                      
                      <h5 className="font-semibold text-gray-800 mb-2 text-sm">
                        {content.title}
                      </h5>
                      
                      <p className="text-gray-700 text-xs mb-3 line-clamp-3">
                        {content.description}
                      </p>
                      
                      {content.hashtags && (
                        <div className="flex flex-wrap gap-1 mb-2">
                          {content.hashtags.slice(0, 3).map((hashtag: string, hashIndex: number) => (
                            <span 
                              key={hashIndex}
                              className="px-1 py-0.5 bg-blue-100 text-blue-800 rounded text-xs"
                            >
                              {hashtag}
                            </span>
                          ))}
                          {content.hashtags.length > 3 && (
                            <span className="text-xs text-gray-500">
                              +{content.hashtags.length - 3}
                            </span>
                          )}
                        </div>
                      )}
                      
                      {content.call_to_action && (
                        <div className="text-xs text-gray-600 italic">
                          CTA: {content.call_to_action}
                        </div>
                      )}
                    </Card>
                  ))}
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="text-center py-8" animation="bounceIn">
            <div className="p-4 bg-gray-100 rounded-2xl mb-4 inline-block">
              <Calendar className="h-8 w-8 text-gray-500" />
            </div>
            <h4 className="text-lg font-semibold text-gray-900 mb-2">
              Calendar în dezvoltare
            </h4>
            <p className="text-gray-600">
              Calendarul de conținut va fi disponibil în curând
            </p>
          </Card>
        )}
      </Card>
    </div>
  );

  const renderContent = () => (
    <div className="space-y-6">
      <Card className="shadow-lg" animation="slideInLeft">
        <div className="flex items-center space-x-3 mb-6">
          <div className="p-3 bg-purple-100 rounded-xl">
            <MessageSquare className="h-6 w-6 text-purple-600" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900">Conținut generat</h3>
            <p className="text-gray-600">Postări și materiale create cu AI</p>
          </div>
        </div>

        <Card className="text-center py-8" animation="bounceIn">
          <div className="p-4 bg-gradient-to-r from-purple-100 to-pink-100 rounded-2xl mb-4 inline-block">
            <Zap className="h-8 w-8 text-purple-600" />
          </div>
          <h4 className="text-lg font-semibold text-gray-900 mb-2">
            Generator de conținut
          </h4>
          <p className="text-gray-600 mb-4">
            Funcționalitatea de generare automată a conținutului va fi disponibilă în curând
          </p>
          <Button className="flex items-center space-x-2">
            <Zap className="h-4 w-4" />
            <span>Generează conținut</span>
          </Button>
        </Card>
      </Card>
    </div>
  );

  const renderAnalytics = () => (
    <div className="space-y-6">
      <Card className="shadow-lg" animation="slideInLeft">
        <div className="flex items-center space-x-3 mb-6">
          <div className="p-3 bg-orange-100 rounded-xl">
            <BarChart3 className="h-6 w-6 text-orange-600" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900">Metrici și KPI-uri</h3>
            <p className="text-gray-600">Urmărirea performanței campaniei</p>
          </div>
        </div>

        {plan.details?.kpis ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {plan.details.kpis.map((kpi: any, index: number) => (
              <Card 
                key={index}
                className="bg-gradient-to-r from-orange-50 to-red-50 border-orange-200"
                padding="md"
                animation="scaleIn"
                delay={index + 1}
                hover="subtle"
              >
                <div className="text-center">
                  <h4 className="font-semibold text-gray-900 mb-2">{kpi.metric}</h4>
                  <div className="text-2xl font-bold text-orange-600 mb-2">
                    {kpi.target}
                  </div>
                  <p className="text-gray-600 text-sm">{kpi.measurement}</p>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="text-center py-8" animation="bounceIn">
            <div className="p-4 bg-orange-100 rounded-2xl mb-4 inline-block">
              <BarChart3 className="h-8 w-8 text-orange-600" />
            </div>
            <h4 className="text-lg font-semibold text-gray-900 mb-2">
              Analytics în dezvoltare
            </h4>
            <p className="text-gray-600">
              Urmărirea detaliată a performanței va fi disponibilă în curând
            </p>
          </Card>
        )}
      </Card>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="shadow-lg" animation="fadeInUp">
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
              <h1 className="text-2xl font-bold text-gray-900">{plan.title}</h1>
              <p className="text-gray-600">
                Creat pe {new Date(plan.created_at).toLocaleDateString('ro-RO')}
              </p>
            </div>
          </div>
          
          <div className="flex space-x-2">
            <Button variant="outline" size="sm" className="flex items-center space-x-2">
              <Share2 className="h-4 w-4" />
              <span>Partajează</span>
            </Button>
            <Button variant="outline" size="sm" className="flex items-center space-x-2">
              <Download className="h-4 w-4" />
              <span>Export</span>
            </Button>
            {onEdit && (
              <Button size="sm" onClick={onEdit} className="flex items-center space-x-2">
                <Edit3 className="h-4 w-4" />
                <span>Editează</span>
              </Button>
            )}
          </div>
        </div>
      </Card>

      {/* Tabs */}
      <Card className="shadow-lg" animation="slideInLeft">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`
                    flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors
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
      <div className="min-h-96">
        {activeTab === 'overview' && renderOverview()}
        {activeTab === 'calendar' && renderCalendar()}
        {activeTab === 'content' && renderContent()}
        {activeTab === 'analytics' && renderAnalytics()}
      </div>
    </div>
  );
};