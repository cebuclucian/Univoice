import React, { useState, useRef } from 'react';
import { 
  Calendar, Target, Users, TrendingUp, BarChart3, Clock, 
  CheckCircle, ArrowLeft, Edit3, Share2, Download, Brain,
  Lightbulb, Zap, MessageSquare, Instagram, Facebook, 
  Twitter, Mail, Globe, Youtube, Music, Monitor, Copy,
  CheckSquare, AlertCircle, Info, Clipboard, FileText,
  Star, Award, DollarSign, Eye, Activity, Settings
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
  const [activeTab, setActiveTab] = useState<'overview' | 'strategy' | 'calendar' | 'content' | 'metrics' | 'monitoring'>('overview');
  const [copiedContentId, setCopiedContentId] = useState<string | null>(null);
  const [showExportOptions, setShowExportOptions] = useState(false);
  const [exportFormat, setExportFormat] = useState<'json' | 'text' | 'calendar'>('text');
  const [showShareOptions, setShowShareOptions] = useState(false);
  const exportLinkRef = useRef<HTMLAnchorElement>(null);

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
    { id: 'strategy', name: 'Strategie & KPIs', icon: Award },
    { id: 'calendar', name: 'Calendar editorial', icon: Calendar },
    { id: 'content', name: 'Conținut detaliat', icon: MessageSquare },
    { id: 'metrics', name: 'Metrici & ROI', icon: BarChart3 },
    { id: 'monitoring', name: 'Monitorizare', icon: Activity }
  ];

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedContentId(id);
      setTimeout(() => setCopiedContentId(null), 2000);
    });
  };

  const handleExport = () => {
    if (!plan) return;

    let exportData: string;
    let fileName: string;
    let mimeType: string;

    switch (exportFormat) {
      case 'json':
        exportData = JSON.stringify(plan, null, 2);
        fileName = `${plan.title.replace(/\s+/g, '_')}_plan.json`;
        mimeType = 'application/json';
        break;
      case 'calendar':
        exportData = generateCalendarExport();
        fileName = `${plan.title.replace(/\s+/g, '_')}_calendar.txt`;
        mimeType = 'text/plain';
        break;
      case 'text':
      default:
        exportData = generateTextExport();
        fileName = `${plan.title.replace(/\s+/g, '_')}_plan.txt`;
        mimeType = 'text/plain';
        break;
    }

    const blob = new Blob([exportData], { type: mimeType });
    const url = URL.createObjectURL(blob);

    if (exportLinkRef.current) {
      exportLinkRef.current.href = url;
      exportLinkRef.current.download = fileName;
      exportLinkRef.current.click();
      URL.revokeObjectURL(url);
    }

    setShowExportOptions(false);
  };

  const generateTextExport = () => {
    const { title, details, created_at } = plan;
    const createdDate = new Date(created_at).toLocaleDateString('ro-RO');
    
    let text = `PLAN DE MARKETING DIGITAL: ${title}\n`;
    text += `Creat pe: ${createdDate}\n\n`;
    
    // Summary
    text += `REZUMAT EXECUTIV:\n${details?.summary || 'N/A'}\n\n`;
    
    // KPIs SMART
    text += 'KPI-URI SMART:\n';
    if (details?.kpis_smart && details.kpis_smart.length > 0) {
      details.kpis_smart.forEach((kpi: any, i: number) => {
        text += `${i+1}. ${kpi.name}: ${kpi.target_value}\n`;
        text += `   Descriere: ${kpi.description}\n`;
        text += `   Măsurare: ${kpi.measurement_method}\n\n`;
      });
    } else {
      text += 'N/A\n';
    }
    text += '\n';
    
    // Buyer Personas
    text += 'BUYER PERSONAS:\n';
    if (details?.buyer_personas && details.buyer_personas.length > 0) {
      details.buyer_personas.forEach((persona: any, i: number) => {
        text += `${i+1}. ${persona.name}\n`;
        text += `   Demografie: ${persona.demographics?.age_range}, ${persona.demographics?.location}\n`;
        text += `   Interese: ${persona.psychographics?.interests?.join(', ')}\n`;
        text += `   Platforme preferate: ${persona.digital_behavior?.preferred_platforms?.join(', ')}\n\n`;
      });
    } else {
      text += 'N/A\n';
    }
    text += '\n';
    
    return text;
  };

  const generateCalendarExport = () => {
    const { title, details } = plan;
    
    let text = `CALENDAR EDITORIAL: ${title}\n\n`;
    
    if (details?.tactical_plan_per_platform && details.tactical_plan_per_platform.length > 0) {
      details.tactical_plan_per_platform.forEach((platform: any) => {
        text += `PLATFORMA: ${platform.platform.toUpperCase()}\n`;
        text += '='.repeat(40) + '\n\n';
        
        if (platform.editorial_calendar?.month_1) {
          platform.editorial_calendar.month_1.forEach((week: any) => {
            text += `SĂPTĂMÂNA ${week.week}\n`;
            text += '-'.repeat(20) + '\n';
            
            if (week.posts && week.posts.length > 0) {
              week.posts.forEach((post: any) => {
                text += `${post.scheduled_date}\n`;
                text += `Titlu: ${post.copy?.main_text?.substring(0, 100)}...\n`;
                text += `CTA: ${post.copy?.call_to_action}\n`;
                text += `Hashtags: ${post.copy?.hashtags?.join(' ')}\n`;
                text += `Buget promovare: ${post.promotion_budget}\n\n`;
              });
            }
          });
        }
        text += '\n';
      });
    } else {
      text += 'Nu există un calendar editorial definit pentru acest plan.\n';
    }
    
    return text;
  };

  const handleShare = () => {
    setShowShareOptions(!showShareOptions);
  };

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
            {plan.details?.summary || 'Plan de marketing digital personalizat generat cu AI.'}
          </p>
          
          {plan.details?.delivery_date && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <div className="flex items-center space-x-2">
                <Calendar className="h-5 w-5 text-blue-600" />
                <span className="font-semibold text-blue-900">Data livrare: {plan.details.delivery_date}</span>
              </div>
            </div>
          )}
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

      {/* Identity and Voice */}
      {plan.details?.identity_and_voice && (
        <Card className="shadow-lg" animation="slideInLeft" hover="subtle">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-2 bg-indigo-100 rounded-xl">
              <Star className="h-6 w-6 text-indigo-600" />
            </div>
            <h3 className="text-lg font-bold text-gray-900">Identitatea și vocea brandului</h3>
          </div>
          
          <div className="space-y-4">
            <div>
              <h4 className="font-semibold text-gray-800 mb-2">Identitatea brandului:</h4>
              <p className="text-gray-700">{plan.details.identity_and_voice.brand_identity}</p>
            </div>
            
            {plan.details.identity_and_voice.voice_characteristics && (
              <div>
                <h4 className="font-semibold text-gray-800 mb-2">Caracteristicile vocii:</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-gray-700">Ton: </span>
                    <span className="text-gray-600">{plan.details.identity_and_voice.voice_characteristics.tone}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Stil comunicare: </span>
                    <span className="text-gray-600">{plan.details.identity_and_voice.voice_characteristics.communication_style}</span>
                  </div>
                </div>
                
                {plan.details.identity_and_voice.voice_characteristics.values && (
                  <div className="mt-3">
                    <span className="font-medium text-gray-700">Valori: </span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {plan.details.identity_and_voice.voice_characteristics.values.map((value: string, index: number) => (
                        <span key={index} className="px-2 py-1 bg-indigo-100 text-indigo-800 rounded-full text-xs">
                          {value}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
            
            {plan.details.identity_and_voice.brand_positioning && (
              <div>
                <h4 className="font-semibold text-gray-800 mb-2">Poziționarea brandului:</h4>
                <p className="text-gray-700">{plan.details.identity_and_voice.brand_positioning}</p>
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Buyer Personas */}
      {plan.details?.buyer_personas && (
        <Card className="shadow-lg" animation="slideInRight" hover="subtle">
          <div className="flex items-center space-x-3 mb-6">
            <div className="p-2 bg-green-100 rounded-xl">
              <Users className="h-6 w-6 text-green-600" />
            </div>
            <h3 className="text-lg font-bold text-gray-900">Buyer Personas</h3>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {plan.details.buyer_personas.map((persona: any, index: number) => (
              <Card key={index} className="bg-gray-50" padding="md" hover="subtle">
                <h4 className="font-bold text-gray-900 mb-4">{persona.name}</h4>
                
                <div className="space-y-3 text-sm">
                  {persona.demographics && (
                    <div>
                      <h5 className="font-semibold text-gray-800 mb-1">Demografia:</h5>
                      <div className="space-y-1">
                        <p><span className="font-medium">Vârstă:</span> {persona.demographics.age_range}</p>
                        <p><span className="font-medium">Locație:</span> {persona.demographics.location}</p>
                        <p><span className="font-medium">Ocupație:</span> {persona.demographics.occupation}</p>
                        <p><span className="font-medium">Venit:</span> {persona.demographics.income}</p>
                      </div>
                    </div>
                  )}
                  
                  {persona.psychographics && (
                    <div>
                      <h5 className="font-semibold text-gray-800 mb-1">Psihografia:</h5>
                      <div className="space-y-1">
                        {persona.psychographics.interests && (
                          <p><span className="font-medium">Interese:</span> {persona.psychographics.interests.join(', ')}</p>
                        )}
                        {persona.psychographics.values && (
                          <p><span className="font-medium">Valori:</span> {persona.psychographics.values.join(', ')}</p>
                        )}
                        {persona.psychographics.pain_points && (
                          <p><span className="font-medium">Puncte de durere:</span> {persona.psychographics.pain_points.join(', ')}</p>
                        )}
                      </div>
                    </div>
                  )}
                  
                  {persona.digital_behavior && (
                    <div>
                      <h5 className="font-semibold text-gray-800 mb-1">Comportament digital:</h5>
                      <div className="space-y-1">
                        {persona.digital_behavior.preferred_platforms && (
                          <p><span className="font-medium">Platforme preferate:</span> {persona.digital_behavior.preferred_platforms.join(', ')}</p>
                        )}
                        {persona.digital_behavior.content_preferences && (
                          <p><span className="font-medium">Preferințe conținut:</span> {persona.digital_behavior.content_preferences.join(', ')}</p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </Card>
            ))}
          </div>
        </Card>
      )}

      {/* Platform Selection Justification */}
      {plan.details?.platform_selection_justification && (
        <Card className="shadow-lg" animation="fadeInUp" hover="subtle">
          <div className="flex items-center space-x-3 mb-6">
            <div className="p-2 bg-purple-100 rounded-xl">
              <Lightbulb className="h-6 w-6 text-purple-600" />
            </div>
            <h3 className="text-lg font-bold text-gray-900">Justificarea selecției platformelor</h3>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold text-gray-900 mb-3">Platforme selectate:</h4>
              <div className="space-y-3">
                {plan.details.platform_selection_justification.selected_platforms?.map((platform: any, index: number) => (
                  <Card key={index} className="bg-green-50 border-green-200" padding="sm">
                    <div className="flex items-center justify-between mb-2">
                      <h5 className="font-semibold text-gray-900">{platform.platform}</h5>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        platform.priority_level === 'high' ? 'bg-red-100 text-red-800' :
                        platform.priority_level === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {platform.priority_level}
                      </span>
                    </div>
                    <p className="text-sm text-gray-700 mb-2">{platform.justification}</p>
                    <div className="text-xs text-gray-600">
                      <p><span className="font-medium">ROI așteptat:</span> {platform.expected_roi}</p>
                      <p><span className="font-medium">Suprapunere audiență:</span> {platform.audience_overlap}</p>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
            
            {plan.details.platform_selection_justification.excluded_platforms && (
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Platforme excluse:</h4>
                <div className="space-y-2">
                  {plan.details.platform_selection_justification.excluded_platforms.map((platform: any, index: number) => (
                    <Card key={index} className="bg-red-50 border-red-200" padding="sm">
                      <h5 className="font-semibold text-gray-900 text-sm">{platform.platform}</h5>
                      <p className="text-xs text-gray-700">{platform.reason}</p>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </div>
        </Card>
      )}
    </div>
  );

  const renderStrategyAndKPIs = () => (
    <div className="space-y-6">
      {/* KPIs SMART */}
      {plan.details?.kpis_smart && (
        <Card className="shadow-lg" animation="slideInLeft">
          <div className="flex items-center space-x-3 mb-6">
            <div className="p-3 bg-green-100 rounded-xl">
              <Award className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">KPI-uri SMART</h3>
              <p className="text-gray-600">Indicatori cheie de performanță</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {plan.details.kpis_smart.map((kpi: any, index: number) => (
              <Card key={index} className="bg-gradient-to-r from-green-50 to-blue-50 border-green-200" padding="md" hover="subtle">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-bold text-gray-900">{kpi.name}</h4>
                  <div className="text-2xl font-bold text-green-600">
                    {kpi.target_value}
                  </div>
                </div>
                
                <p className="text-gray-700 text-sm mb-4">{kpi.description}</p>
                
                <div className="space-y-2 text-xs">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <span className="font-semibold text-gray-800">Măsurare:</span>
                      <p className="text-gray-600">{kpi.measurement_method}</p>
                    </div>
                    <div>
                      <span className="font-semibold text-gray-800">Responsabil:</span>
                      <p className="text-gray-600">{kpi.responsible}</p>
                    </div>
                  </div>
                  
                  <div>
                    <span className="font-semibold text-gray-800">Perioada:</span>
                    <span className="text-gray-600 ml-1">{kpi.timeframe}</span>
                  </div>
                </div>
                
                {/* SMART Breakdown */}
                <div className="mt-4 pt-4 border-t border-green-200">
                  <h5 className="font-semibold text-gray-800 mb-2 text-sm">Analiza SMART:</h5>
                  <div className="space-y-1 text-xs">
                    <div><span className="font-medium text-green-700">S (Specific):</span> {kpi.specific}</div>
                    <div><span className="font-medium text-blue-700">M (Măsurabil):</span> {kpi.measurable}</div>
                    <div><span className="font-medium text-purple-700">A (Realizabil):</span> {kpi.achievable}</div>
                    <div><span className="font-medium text-orange-700">R (Relevant):</span> {kpi.relevant}</div>
                    <div><span className="font-medium text-red-700">T (Încadrat în timp):</span> {kpi.time_bound}</div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </Card>
      )}

      {/* Budget Allocation */}
      {plan.details?.budget_allocation_summary && (
        <Card className="shadow-lg" animation="slideInRight">
          <div className="flex items-center space-x-3 mb-6">
            <div className="p-3 bg-blue-100 rounded-xl">
              <DollarSign className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">Alocarea bugetului</h3>
              <p className="text-gray-600">Distribuția resurselor financiare</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* By Channel */}
            <div>
              <h4 className="font-semibold text-gray-900 mb-4">Alocare pe canale:</h4>
              <div className="space-y-3">
                {plan.details.budget_allocation_summary.allocation_by_channel?.map((channel: any, index: number) => (
                  <Card key={index} className="bg-blue-50 border-blue-200" padding="sm">
                    <div className="flex items-center justify-between mb-2">
                      <h5 className="font-semibold text-gray-900">{channel.channel}</h5>
                      <div className="text-right">
                        <div className="font-bold text-blue-600">{channel.percentage}</div>
                        <div className="text-sm text-gray-600">{channel.amount}</div>
                      </div>
                    </div>
                    <p className="text-xs text-gray-700">{channel.justification}</p>
                  </Card>
                ))}
              </div>
            </div>

            {/* By Type */}
            <div>
              <h4 className="font-semibold text-gray-900 mb-4">Alocare pe tipuri:</h4>
              <div className="space-y-3">
                {plan.details.budget_allocation_summary.allocation_by_type && Object.entries(plan.details.budget_allocation_summary.allocation_by_type).map(([type, percentage]: [string, any], index: number) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="font-medium text-gray-800 capitalize">{type.replace(/_/g, ' ')}</span>
                    <span className="font-bold text-gray-900">{percentage}</span>
                  </div>
                ))}
              </div>
              
              <div className="mt-4 p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg border border-green-200">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-gray-900">Buget total:</span>
                  <span className="text-xl font-bold text-green-600">{plan.details.budget_allocation_summary.total_budget}</span>
                </div>
              </div>
            </div>
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
            <h3 className="text-xl font-bold text-gray-900">Calendar editorial</h3>
            <p className="text-gray-600">Planificarea detaliată a conținutului pe platforme</p>
          </div>
        </div>

        {plan.details?.tactical_plan_per_platform ? (
          <div className="space-y-8">
            {plan.details.tactical_plan_per_platform.map((platform: any, platformIndex: number) => (
              <Card 
                key={platformIndex}
                className={`border-l-4 ${getPlatformColor(platform.platform).includes('blue') ? 'border-blue-400' : 
                  getPlatformColor(platform.platform).includes('pink') ? 'border-pink-400' :
                  getPlatformColor(platform.platform).includes('sky') ? 'border-sky-400' :
                  getPlatformColor(platform.platform).includes('indigo') ? 'border-indigo-400' :
                  'border-gray-400'
                }`}
                padding="md"
                animation="fadeInUp"
                delay={platformIndex + 1}
              >
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-lg ${getPlatformColor(platform.platform)}`}>
                      {getPlatformIcon(platform.platform)}
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">{platform.platform}</h4>
                      <p className="text-sm text-gray-600">{platform.posting_frequency}</p>
                    </div>
                  </div>
                  
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => {
                      const platformContent = `Calendar ${platform.platform}:\n${JSON.stringify(platform.editorial_calendar, null, 2)}`;
                      copyToClipboard(platformContent, `platform-calendar-${platformIndex}`);
                    }}
                    className="flex items-center space-x-1"
                  >
                    {copiedContentId === `platform-calendar-${platformIndex}` ? (
                      <>
                        <CheckSquare className="h-3 w-3" />
                        <span>Copiat!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="h-3 w-3" />
                        <span>Copiază calendarul</span>
                      </>
                    )}
                  </Button>
                </div>

                {/* Editorial Calendar */}
                {platform.editorial_calendar?.month_1 && (
                  <div className="space-y-6">
                    <h5 className="font-semibold text-gray-900">Luna 1 - Calendar editorial:</h5>
                    
                    {platform.editorial_calendar.month_1.map((week: any, weekIndex: number) => (
                      <Card key={weekIndex} className="bg-gray-50" padding="sm">
                        <div className="flex items-center justify-between mb-4">
                          <h6 className="font-bold text-gray-900">Săptămâna {week.week}</h6>
                          <span className="text-sm text-gray-600">{week.posts?.length || 0} postări</span>
                        </div>
                        
                        {week.posts && week.posts.length > 0 ? (
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {week.posts.map((post: any, postIndex: number) => (
                              <Card key={postIndex} className="bg-white border border-gray-200" padding="sm" hover="subtle">
                                <div className="flex items-center justify-between mb-2">
                                  <span className="text-xs font-medium text-blue-600">{post.post_id}</span>
                                  <Button 
                                    variant="ghost" 
                                    size="sm"
                                    onClick={() => copyToClipboard(post.copy?.main_text || '', `post-${platformIndex}-${weekIndex}-${postIndex}`)}
                                    className="p-1 h-6 w-6"
                                  >
                                    {copiedContentId === `post-${platformIndex}-${weekIndex}-${postIndex}` ? (
                                      <CheckSquare className="h-3 w-3 text-green-600" />
                                    ) : (
                                      <Copy className="h-3 w-3" />
                                    )}
                                  </Button>
                                </div>
                                
                                <div className="space-y-2">
                                  <div>
                                    <span className="text-xs font-semibold text-gray-800">Programat:</span>
                                    <p className="text-xs text-gray-600">{post.scheduled_date}</p>
                                  </div>
                                  
                                  {post.copy && (
                                    <div>
                                      <span className="text-xs font-semibold text-gray-800">Conținut:</span>
                                      <p className="text-xs text-gray-700 line-clamp-3">{post.copy.main_text}</p>
                                      
                                      {post.copy.call_to_action && (
                                        <div className="mt-1">
                                          <span className="text-xs font-semibold text-gray-800">CTA:</span>
                                          <p className="text-xs text-blue-600">{post.copy.call_to_action}</p>
                                        </div>
                                      )}
                                      
                                      {post.copy.hashtags && post.copy.hashtags.length > 0 && (
                                        <div className="flex flex-wrap gap-1 mt-1">
                                          {post.copy.hashtags.map((hashtag: string, hashIndex: number) => (
                                            <span key={hashIndex} className="px-1 py-0.5 bg-blue-100 text-blue-800 rounded text-xs">
                                              {hashtag}
                                            </span>
                                          ))}
                                        </div>
                                      )}
                                    </div>
                                  )}
                                  
                                  {post.visual_brief && (
                                    <div>
                                      <span className="text-xs font-semibold text-gray-800">Visual:</span>
                                      <p className="text-xs text-gray-600">{post.visual_brief.type} - {post.visual_brief.dimensions}</p>
                                    </div>
                                  )}
                                  
                                  {post.promotion_budget && (
                                    <div className="flex items-center justify-between pt-2 border-t border-gray-200">
                                      <span className="text-xs font-semibold text-gray-800">Buget:</span>
                                      <span className="text-xs font-bold text-green-600">{post.promotion_budget}</span>
                                    </div>
                                  )}
                                </div>
                              </Card>
                            ))}
                          </div>
                        ) : (
                          <p className="text-sm text-gray-500 text-center py-4">Nu sunt postări programate pentru această săptămână</p>
                        )}
                      </Card>
                    ))}
                  </div>
                )}
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
              Calendarul editorial va fi disponibil în curând
            </p>
          </Card>
        )}

        {/* Export Calendar Button */}
        {plan.details?.tactical_plan_per_platform && (
          <div className="mt-6 flex justify-center">
            <Button 
              variant="outline" 
              onClick={() => {
                setExportFormat('calendar');
                handleExport();
              }}
              className="flex items-center space-x-2"
            >
              <Download className="h-4 w-4" />
              <span>Exportă calendarul</span>
            </Button>
          </div>
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
            <h3 className="text-xl font-bold text-gray-900">Conținut detaliat</h3>
            <p className="text-gray-600">Toate postările și materialele generate cu AI</p>
          </div>
        </div>

        {plan.details?.tactical_plan_per_platform && plan.details.tactical_plan_per_platform.length > 0 ? (
          <div className="space-y-8">
            {plan.details.tactical_plan_per_platform.map((platform: any, platformIndex: number) => (
              <Card 
                key={platformIndex}
                className={`border-l-4 ${getPlatformColor(platform.platform).includes('blue') ? 'border-blue-400' : 
                  getPlatformColor(platform.platform).includes('pink') ? 'border-pink-400' :
                  getPlatformColor(platform.platform).includes('sky') ? 'border-sky-400' :
                  getPlatformColor(platform.platform).includes('indigo') ? 'border-indigo-400' :
                  'border-gray-400'
                }`}
                padding="md"
                animation="fadeInUp"
                delay={platformIndex + 1}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-lg ${getPlatformColor(platform.platform)}`}>
                      {getPlatformIcon(platform.platform)}
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">{platform.platform}</h4>
                      <p className="text-xs text-gray-600">{platform.posting_frequency || 'Frecvență variabilă'}</p>
                    </div>
                  </div>
                  
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => {
                      const platformContent = `Strategie ${platform.platform}:\n${platform.strategy}\n\nTipuri conținut: ${platform.content_types?.join(', ') || 'N/A'}\nFrecvență: ${platform.posting_frequency || 'N/A'}`;
                      copyToClipboard(platformContent, `platform-${platformIndex}`);
                    }}
                    className="flex items-center space-x-1"
                  >
                    {copiedContentId === `platform-${platformIndex}` ? (
                      <>
                        <CheckSquare className="h-3 w-3" />
                        <span>Copiat!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="h-3 w-3" />
                        <span>Copiază strategia</span>
                      </>
                    )}
                  </Button>
                </div>
                
                <div className="bg-white p-4 rounded-lg border border-gray-100 mb-4">
                  <h5 className="font-medium text-gray-800 mb-2">Strategie:</h5>
                  <p className="text-gray-700 text-sm">{platform.strategy}</p>
                  
                  {platform.content_types && (
                    <div className="mt-3">
                      <span className="font-medium text-gray-800 text-sm">Tipuri de conținut: </span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {platform.content_types.map((type: string, index: number) => (
                          <span key={index} className="px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-xs">
                            {type}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {platform.optimal_posting_times && (
                    <div className="mt-3">
                      <span className="font-medium text-gray-800 text-sm">Ore optime de postare: </span>
                      <span className="text-gray-600 text-sm">{platform.optimal_posting_times.join(', ')}</span>
                    </div>
                  )}
                </div>
                
                {/* Content Examples */}
                {platform.editorial_calendar?.month_1 && (
                  <div className="space-y-4">
                    <h5 className="font-medium text-gray-800">Exemple de conținut generat:</h5>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {platform.editorial_calendar.month_1
                        .flatMap((week: any) => week.posts || [])
                        .slice(0, 6)
                        .map((post: any, contentIndex: number) => (
                          <Card 
                            key={contentIndex}
                            className="bg-gray-50"
                            padding="sm"
                            hover="subtle"
                          >
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-xs font-medium text-gray-700">{post.post_id}</span>
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => copyToClipboard(post.copy?.main_text || '', `platform-content-${platformIndex}-${contentIndex}`)}
                                className="p-1 h-6 w-6"
                              >
                                {copiedContentId === `platform-content-${platformIndex}-${contentIndex}` ? (
                                  <CheckSquare className="h-3 w-3 text-green-600" />
                                ) : (
                                  <Copy className="h-3 w-3" />
                                )}
                              </Button>
                            </div>
                            
                            {post.copy && (
                              <div className="space-y-2">
                                <div className="bg-white p-2 rounded border border-gray-200">
                                  <p className="text-xs text-gray-700 line-clamp-4">{post.copy.main_text}</p>
                                </div>
                                
                                {post.copy.call_to_action && (
                                  <div className="text-xs">
                                    <span className="font-semibold text-gray-800">CTA: </span>
                                    <span className="text-blue-600">{post.copy.call_to_action}</span>
                                  </div>
                                )}
                                
                                {post.copy.hashtags && post.copy.hashtags.length > 0 && (
                                  <div className="flex flex-wrap gap-1">
                                    {post.copy.hashtags.slice(0, 3).map((hashtag: string, hashIndex: number) => (
                                      <span key={hashIndex} className="px-1 py-0.5 bg-blue-100 text-blue-800 rounded text-xs">
                                        {hashtag}
                                      </span>
                                    ))}
                                    {post.copy.hashtags.length > 3 && (
                                      <span className="px-1 py-0.5 bg-gray-100 text-gray-600 rounded text-xs">
                                        +{post.copy.hashtags.length - 3}
                                      </span>
                                    )}
                                  </div>
                                )}
                              </div>
                            )}
                            
                            {post.visual_brief && (
                              <div className="mt-2 pt-2 border-t border-gray-200">
                                <div className="text-xs text-gray-600">
                                  <span className="font-semibold">Visual: </span>
                                  {post.visual_brief.type} ({post.visual_brief.dimensions})
                                </div>
                              </div>
                            )}
                          </Card>
                        ))
                      }
                    </div>
                  </div>
                )}
              </Card>
            ))}
          </div>
        ) : (
          <Card className="text-center py-8" animation="bounceIn">
            <div className="p-4 bg-gradient-to-r from-purple-100 to-pink-100 rounded-2xl mb-4 inline-block">
              <Zap className="h-8 w-8 text-purple-600" />
            </div>
            <h4 className="text-lg font-semibold text-gray-900 mb-2">
              Conținut în dezvoltare
            </h4>
            <p className="text-gray-600 mb-4">
              Conținutul detaliat va fi disponibil în curând
            </p>
            <Button className="flex items-center space-x-2">
              <Zap className="h-4 w-4" />
              <span>Generează conținut</span>
            </Button>
          </Card>
        )}
      </Card>
    </div>
  );

  const renderMetricsAndROI = () => (
    <div className="space-y-6">
      <Card className="shadow-lg" animation="slideInLeft">
        <div className="flex items-center space-x-3 mb-6">
          <div className="p-3 bg-orange-100 rounded-xl">
            <BarChart3 className="h-6 w-6 text-orange-600" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900">Metrici și ROI</h3>
            <p className="text-gray-600">Urmărirea performanței și returnul investiției</p>
          </div>
        </div>

        {/* KPIs Overview */}
        {plan.details?.kpis_smart ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            {plan.details.kpis_smart.map((kpi: any, index: number) => (
              <Card 
                key={index}
                className="bg-gradient-to-r from-orange-50 to-red-50 border-orange-200"
                padding="md"
                animation="scaleIn"
                delay={index + 1}
                hover="subtle"
              >
                <div className="text-center">
                  <h4 className="font-semibold text-gray-900 mb-2">{kpi.name}</h4>
                  <div className="text-2xl font-bold text-orange-600 mb-2">
                    {kpi.target_value}
                  </div>
                  <p className="text-gray-600 text-sm">{kpi.measurement_method}</p>
                  
                  {/* Visual indicator */}
                  <div className="mt-4 pt-4 border-t border-orange-200">
                    <div className="flex items-center justify-center space-x-2">
                      {index % 3 === 0 ? (
                        <>
                          <TrendingUp className="h-4 w-4 text-green-600" />
                          <span className="text-xs text-green-600">Prioritate înaltă</span>
                        </>
                      ) : index % 3 === 1 ? (
                        <>
                          <AlertCircle className="h-4 w-4 text-amber-600" />
                          <span className="text-xs text-amber-600">Monitorizare activă</span>
                        </>
                      ) : (
                        <>
                          <Info className="h-4 w-4 text-blue-600" />
                          <span className="text-xs text-blue-600">Urmărire regulată</span>
                        </>
                      )}
                    </div>
                  </div>
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
              Metrici în dezvoltare
            </h4>
            <p className="text-gray-600">
              Urmărirea detaliată a performanței va fi disponibilă în curând
            </p>
          </Card>
        )}

        {/* ROI Projections */}
        {plan.details?.budget_allocation_summary && (
          <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-green-200" animation="fadeInUp">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2 bg-green-100 rounded-lg">
                <DollarSign className="h-6 w-6 text-green-600" />
              </div>
              <h4 className="text-lg font-bold text-gray-900">Proiecții ROI</h4>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600 mb-1">150-200%</div>
                <p className="text-sm text-gray-600">ROI așteptat</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600 mb-1">{plan.details.budget_allocation_summary.total_budget}</div>
                <p className="text-sm text-gray-600">Investiție totală</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600 mb-1">90 zile</div>
                <p className="text-sm text-gray-600">Perioada de măsurare</p>
              </div>
            </div>
          </Card>
        )}

        {/* KPI Recommendations */}
        <Card className="mt-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200" animation="fadeInUp" delay={1}>
          <div className="flex items-start space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Lightbulb className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Recomandări pentru măsurare</h4>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                  <span className="text-gray-700">Setează obiective SMART (Specifice, Măsurabile, Realizabile, Relevante, Încadrate în Timp)</span>
                </li>
                <li className="flex items-start space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                  <span className="text-gray-700">Monitorizează atât metrici de vanitate (reach, likes) cât și metrici de conversie</span>
                </li>
                <li className="flex items-start space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                  <span className="text-gray-700">Evaluează performanța la fiecare 2 săptămâni și ajustează strategia dacă e necesar</span>
                </li>
                <li className="flex items-start space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                  <span className="text-gray-700">Folosește dashboard-uri automatizate pentru urmărirea în timp real</span>
                </li>
              </ul>
            </div>
          </div>
        </Card>
      </Card>
    </div>
  );

  const renderMonitoring = () => (
    <div className="space-y-6">
      <Card className="shadow-lg" animation="slideInLeft">
        <div className="flex items-center space-x-3 mb-6">
          <div className="p-3 bg-indigo-100 rounded-xl">
            <Activity className="h-6 w-6 text-indigo-600" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900">Monitorizare și optimizare</h3>
            <p className="text-gray-600">Sistemul de urmărire și îmbunătățire continuă</p>
          </div>
        </div>

        {plan.details?.monitoring_and_optimization ? (
          <div className="space-y-8">
            {/* Weekly Dashboard Metrics */}
            {plan.details.monitoring_and_optimization.weekly_dashboard_metrics && (
              <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200" animation="slideInLeft">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Eye className="h-6 w-6 text-blue-600" />
                  </div>
                  <h4 className="text-lg font-bold text-gray-900">Metrici dashboard săptămânal</h4>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {plan.details.monitoring_and_optimization.weekly_dashboard_metrics.map((metric: any, index: number) => (
                    <Card key={index} className="bg-white" padding="sm" hover="subtle">
                      <div className="flex items-center justify-between mb-2">
                        <h5 className="font-semibold text-gray-900">{metric.metric}</h5>
                        <span className="text-sm font-bold text-blue-600">{metric.target_value}</span>
                      </div>
                      <p className="text-sm text-gray-700 mb-2">{metric.description}</p>
                      <div className="text-xs text-gray-600">
                        <p><span className="font-medium">Frecvență:</span> {metric.measurement_frequency}</p>
                        <p><span className="font-medium">Sursă:</span> {metric.data_source}</p>
                      </div>
                    </Card>
                  ))}
                </div>
              </Card>
            )}

            {/* Performance Evaluation Schedule */}
            {plan.details.monitoring_and_optimization.performance_evaluation_schedule && (
              <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200" animation="slideInRight">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Calendar className="h-6 w-6 text-green-600" />
                  </div>
                  <h4 className="text-lg font-bold text-gray-900">Program de evaluare a performanței</h4>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {Object.entries(plan.details.monitoring_and_optimization.performance_evaluation_schedule).map(([period, details]: [string, any], index: number) => (
                    <Card key={index} className="bg-white" padding="sm" hover="subtle">
                      <h5 className="font-semibold text-gray-900 mb-3 capitalize">{period.replace(/_/g, ' ')}</h5>
                      
                      <div className="space-y-2 text-sm">
                        <div>
                          <span className="font-medium text-gray-800">Zone de focus:</span>
                          <ul className="list-disc list-inside text-gray-600 ml-2">
                            {details.focus_areas?.map((area: string, areaIndex: number) => (
                              <li key={areaIndex}>{area}</li>
                            ))}
                          </ul>
                        </div>
                        
                        <div>
                          <span className="font-medium text-gray-800">Metrici cheie:</span>
                          <ul className="list-disc list-inside text-gray-600 ml-2">
                            {details.key_metrics?.map((metric: string, metricIndex: number) => (
                              <li key={metricIndex}>{metric}</li>
                            ))}
                          </ul>
                        </div>
                        
                        <div>
                          <span className="font-medium text-gray-800">Acțiuni:</span>
                          <ul className="list-disc list-inside text-gray-600 ml-2">
                            {details.action_items?.map((action: string, actionIndex: number) => (
                              <li key={actionIndex}>{action}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </Card>
            )}

            {/* Adjustment Recommendations */}
            {plan.details.monitoring_and_optimization.adjustment_recommendations && (
              <Card className="bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200" animation="fadeInUp">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="p-2 bg-amber-100 rounded-lg">
                    <Settings className="h-6 w-6 text-amber-600" />
                  </div>
                  <h4 className="text-lg font-bold text-gray-900">Recomandări de ajustare</h4>
                </div>
                
                <div className="space-y-4">
                  {plan.details.monitoring_and_optimization.adjustment_recommendations.map((recommendation: any, index: number) => (
                    <Card key={index} className="bg-white" padding="sm" hover="subtle">
                      <div className="flex items-start space-x-3">
                        <div className="p-1 bg-amber-100 rounded">
                          <AlertCircle className="h-4 w-4 text-amber-600" />
                        </div>
                        <div className="flex-1">
                          <h5 className="font-semibold text-gray-900 mb-1">Condiție declanșatoare:</h5>
                          <p className="text-sm text-gray-700 mb-2">{recommendation.trigger_condition}</p>
                          
                          <h5 className="font-semibold text-gray-900 mb-1">Acțiune recomandată:</h5>
                          <p className="text-sm text-gray-700 mb-2">{recommendation.recommended_action}</p>
                          
                          <div className="grid grid-cols-2 gap-4 text-xs text-gray-600">
                            <div>
                              <span className="font-medium">Timeline:</span> {recommendation.implementation_timeline}
                            </div>
                            <div>
                              <span className="font-medium">Impact așteptat:</span> {recommendation.expected_impact}
                            </div>
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </Card>
            )}

            {/* Dedicated Responsibilities */}
            {plan.details.monitoring_and_optimization.dedicated_responsibilities && (
              <Card className="bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200" animation="fadeInUp" delay={1}>
                <div className="flex items-center space-x-3 mb-4">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <Users className="h-6 w-6 text-purple-600" />
                  </div>
                  <h4 className="text-lg font-bold text-gray-900">Responsabilități dedicate</h4>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {plan.details.monitoring_and_optimization.dedicated_responsibilities.map((role: any, index: number) => (
                    <Card key={index} className="bg-white" padding="sm" hover="subtle">
                      <div className="flex items-center space-x-2 mb-3">
                        <div className="p-1 bg-purple-100 rounded">
                          <User className="h-4 w-4 text-purple-600" />
                        </div>
                        <h5 className="font-semibold text-gray-900">{role.role}</h5>
                      </div>
                      
                      <div className="space-y-2 text-sm">
                        <div>
                          <span className="font-medium text-gray-800">Responsabilități:</span>
                          <ul className="list-disc list-inside text-gray-600 ml-2">
                            {role.responsibilities?.map((responsibility: string, respIndex: number) => (
                              <li key={respIndex}>{responsibility}</li>
                            ))}
                          </ul>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
                          <div>
                            <span className="font-medium">Timp alocat:</span> {role.time_allocation}
                          </div>
                          <div>
                            <span className="font-medium">Abilități necesare:</span> {role.required_skills?.join(', ')}
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </Card>
            )}
          </div>
        ) : (
          <Card className="text-center py-8" animation="bounceIn">
            <div className="p-4 bg-indigo-100 rounded-2xl mb-4 inline-block">
              <Activity className="h-8 w-8 text-indigo-600" />
            </div>
            <h4 className="text-lg font-semibold text-gray-900 mb-2">
              Sistem de monitorizare în dezvoltare
            </h4>
            <p className="text-gray-600">
              Sistemul complet de monitorizare și optimizare va fi disponibil în curând
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
            <div className="relative">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleShare}
                className="flex items-center space-x-2"
              >
                <Share2 className="h-4 w-4" />
                <span>Partajează</span>
              </Button>
              
              {showShareOptions && (
                <Card className="absolute right-0 top-full mt-2 z-10 shadow-xl" padding="sm">
                  <div className="space-y-2 w-48">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="w-full justify-start"
                      onClick={() => {
                        navigator.clipboard.writeText(`${window.location.origin}/app/plans?id=${plan.id}`);
                        setShowShareOptions(false);
                      }}
                    >
                      <Clipboard className="h-4 w-4 mr-2" />
                      <span>Copiază link</span>
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="w-full justify-start"
                      onClick={() => {
                        window.open(`mailto:?subject=Plan de marketing: ${plan.title}&body=Iată planul de marketing generat: ${window.location.origin}/app/plans?id=${plan.id}`);
                        setShowShareOptions(false);
                      }}
                    >
                      <Mail className="h-4 w-4 mr-2" />
                      <span>Trimite pe email</span>
                    </Button>
                  </div>
                </Card>
              )}
            </div>
            
            <div className="relative">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setShowExportOptions(!showExportOptions)}
                className="flex items-center space-x-2"
              >
                <Download className="h-4 w-4" />
                <span>Export</span>
              </Button>
              
              {showExportOptions && (
                <Card className="absolute right-0 top-full mt-2 z-10 shadow-xl" padding="sm">
                  <div className="space-y-2 w-48">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="w-full justify-start"
                      onClick={() => {
                        setExportFormat('text');
                        handleExport();
                      }}
                    >
                      <FileText className="h-4 w-4 mr-2" />
                      <span>Export ca Text</span>
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="w-full justify-start"
                      onClick={() => {
                        setExportFormat('json');
                        handleExport();
                      }}
                    >
                      <FileText className="h-4 w-4 mr-2" />
                      <span>Export ca JSON</span>
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="w-full justify-start"
                      onClick={() => {
                        setExportFormat('calendar');
                        handleExport();
                      }}
                    >
                      <Calendar className="h-4 w-4 mr-2" />
                      <span>Export Calendar</span>
                    </Button>
                  </div>
                </Card>
              )}
              
              {/* Hidden download link */}
              <a ref={exportLinkRef} style={{ display: 'none' }} />
            </div>
            
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
      <div className="min-h-96">
        {activeTab === 'overview' && renderOverview()}
        {activeTab === 'strategy' && renderStrategyAndKPIs()}
        {activeTab === 'calendar' && renderCalendar()}
        {activeTab === 'content' && renderContent()}
        {activeTab === 'metrics' && renderMetricsAndROI()}
        {activeTab === 'monitoring' && renderMonitoring()}
      </div>
    </div>
  );
};