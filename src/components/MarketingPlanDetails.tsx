import React, { useState, useRef } from 'react';
import { 
  Calendar, Target, Users, TrendingUp, BarChart3, Clock, 
  CheckCircle, ArrowLeft, Edit3, Share2, Download, Brain,
  Lightbulb, Zap, MessageSquare, Instagram, Facebook, 
  Twitter, Mail, Globe, Youtube, Music, Monitor, Copy,
  CheckSquare, AlertCircle, Info, Clipboard, FileText,
  Star, Crown, Eye, Settings, Activity, Layers, PieChart,
  Briefcase, Award, Shield, Gauge, Timer, Bell
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
    { id: 'strategy', name: 'Strategie & KPIs', icon: Layers },
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
    
    // KPIs
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
                text += `${post.copy?.main_text || 'N/A'}\n`;
                if (post.copy?.hashtags) {
                  text += `Hashtag-uri: ${post.copy.hashtags.join(' ')}\n`;
                }
                text += '\n';
              });
            }
            text += '\n';
          });
        }
        text += '\n';
      });
    } else {
      text += 'Nu există calendar editorial disponibil.\n';
    }
    
    return text;
  };

  const handleShare = () => {
    setShowShareOptions(!showShareOptions);
  };

  const renderOverviewTab = () => (
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
              <Crown className="h-6 w-6 text-indigo-600" />
            </div>
            <h3 className="text-lg font-bold text-gray-900">Identitatea și vocea brandului</h3>
          </div>
          
          <div className="space-y-4">
            <div>
              <h4 className="font-semibold text-gray-800 mb-2">Identitatea brandului:</h4>
              <p className="text-gray-700">{plan.details.identity_and_voice.brand_identity}</p>
            </div>
            
            {plan.details.identity_and_voice.voice_characteristics && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold text-gray-800 mb-2">Caracteristici voce:</h4>
                  <div className="space-y-1 text-sm">
                    <p><span className="font-medium">Ton:</span> {plan.details.identity_and_voice.voice_characteristics.tone}</p>
                    <p><span className="font-medium">Personalitate:</span> {plan.details.identity_and_voice.voice_characteristics.personality}</p>
                    <p><span className="font-medium">Stil:</span> {plan.details.identity_and_voice.voice_characteristics.communication_style}</p>
                  </div>
                </div>
                
                {plan.details.identity_and_voice.voice_characteristics.values && (
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-2">Valori:</h4>
                    <div className="flex flex-wrap gap-1">
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
                <h4 className="font-semibold text-gray-800 mb-2">Poziționare:</h4>
                <p className="text-gray-700">{plan.details.identity_and_voice.brand_positioning}</p>
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Buyer Personas */}
      {plan.details?.buyer_personas && plan.details.buyer_personas.length > 0 && (
        <Card className="shadow-lg" animation="slideInRight" hover="subtle">
          <div className="flex items-center space-x-3 mb-6">
            <div className="p-2 bg-green-100 rounded-xl">
              <Users className="h-6 w-6 text-green-600" />
            </div>
            <h3 className="text-lg font-bold text-gray-900">Buyer Personas</h3>
          </div>
          
          <div className="space-y-6">
            {plan.details.buyer_personas.map((persona: any, index: number) => (
              <Card key={index} className="bg-green-50 border-green-200" padding="md">
                <h4 className="font-bold text-gray-900 mb-4">{persona.name}</h4>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  {persona.demographics && (
                    <div>
                      <h5 className="font-semibold text-gray-800 mb-2">Demografia:</h5>
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
                      <h5 className="font-semibold text-gray-800 mb-2">Psihografia:</h5>
                      <div className="space-y-2">
                        {persona.psychographics.interests && (
                          <div>
                            <span className="font-medium">Interese:</span>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {persona.psychographics.interests.map((interest: string, i: number) => (
                                <span key={i} className="px-1 py-0.5 bg-green-200 text-green-800 rounded text-xs">
                                  {interest}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                        {persona.psychographics.pain_points && (
                          <div>
                            <span className="font-medium">Probleme:</span>
                            <ul className="list-disc list-inside mt-1">
                              {persona.psychographics.pain_points.map((point: string, i: number) => (
                                <li key={i} className="text-xs">{point}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                  
                  {persona.digital_behavior && (
                    <div>
                      <h5 className="font-semibold text-gray-800 mb-2">Comportament digital:</h5>
                      <div className="space-y-1">
                        <p><span className="font-medium">Platforme preferate:</span></p>
                        <div className="flex flex-wrap gap-1">
                          {persona.digital_behavior.preferred_platforms?.map((platform: string, i: number) => (
                            <span key={i} className="px-1 py-0.5 bg-blue-200 text-blue-800 rounded text-xs">
                              {platform}
                            </span>
                          ))}
                        </div>
                        <p><span className="font-medium">Timp online:</span> {persona.digital_behavior.online_activity_time}</p>
                      </div>
                    </div>
                  )}
                </div>
              </Card>
            ))}
          </div>
        </Card>
      )}

      {/* Deliverables */}
      {plan.details?.deliverables && (
        <Card className="shadow-lg bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200" animation="fadeInUp">
          <div className="flex items-center space-x-3 mb-6">
            <div className="p-2 bg-amber-100 rounded-xl">
              <Briefcase className="h-6 w-6 text-amber-600" />
            </div>
            <h3 className="text-lg font-bold text-gray-900">Livrabile incluse</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(plan.details.deliverables).map(([key, value], index) => (
              <div key={index} className="flex items-start space-x-3">
                <CheckCircle className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-gray-900 capitalize">{key.replace(/_/g, ' ')}</h4>
                  <p className="text-gray-700 text-sm">{value}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );

  const renderStrategyKpisTab = () => (
    <div className="space-y-6">
      {/* Platform Selection Justification */}
      {plan.details?.platform_selection_justification && (
        <Card className="shadow-lg" animation="slideInLeft">
          <div className="flex items-center space-x-3 mb-6">
            <div className="p-3 bg-blue-100 rounded-xl">
              <Layers className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">Selecția platformelor</h3>
              <p className="text-gray-600">Justificarea alegerii platformelor</p>
            </div>
          </div>
          
          <div className="space-y-6">
            {/* Selected Platforms */}
            {plan.details.platform_selection_justification.selected_platforms && (
              <div>
                <h4 className="font-semibold text-gray-900 mb-4">Platforme selectate:</h4>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {plan.details.platform_selection_justification.selected_platforms.map((platform: any, index: number) => (
                    <Card key={index} className={`border-l-4 border-green-400 bg-green-50`} padding="sm">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          {getPlatformIcon(platform.platform)}
                          <h5 className="font-semibold text-gray-900">{platform.platform}</h5>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          platform.priority_level === 'high' ? 'bg-red-100 text-red-800' :
                          platform.priority_level === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {platform.priority_level}
                        </span>
                      </div>
                      <p className="text-gray-700 text-sm mb-2">{platform.justification}</p>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <span className="font-medium">Suprapunere audiență:</span>
                          <p>{platform.audience_overlap}</p>
                        </div>
                        <div>
                          <span className="font-medium">ROI așteptat:</span>
                          <p>{platform.expected_roi}</p>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            )}
            
            {/* Excluded Platforms */}
            {plan.details.platform_selection_justification.excluded_platforms && plan.details.platform_selection_justification.excluded_platforms.length > 0 && (
              <div>
                <h4 className="font-semibold text-gray-900 mb-4">Platforme excluse:</h4>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {plan.details.platform_selection_justification.excluded_platforms.map((platform: any, index: number) => (
                    <Card key={index} className="border-l-4 border-red-400 bg-red-50" padding="sm">
                      <div className="flex items-center space-x-2 mb-2">
                        {getPlatformIcon(platform.platform)}
                        <h5 className="font-semibold text-gray-900">{platform.platform}</h5>
                      </div>
                      <p className="text-gray-700 text-sm">{platform.reason}</p>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Budget Allocation */}
      {plan.details?.budget_allocation_summary && (
        <Card className="shadow-lg" animation="slideInRight">
          <div className="flex items-center space-x-3 mb-6">
            <div className="p-3 bg-green-100 rounded-xl">
              <PieChart className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">Alocarea bugetului</h3>
              <p className="text-gray-600">Distribuția resurselor financiare</p>
            </div>
          </div>
          
          <div className="space-y-6">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h4 className="font-bold text-green-900 mb-2">Buget total: {plan.details.budget_allocation_summary.total_budget}</h4>
            </div>
            
            {/* Allocation by Channel */}
            {plan.details.budget_allocation_summary.allocation_by_channel && (
              <div>
                <h4 className="font-semibold text-gray-900 mb-4">Alocare pe canale:</h4>
                <div className="space-y-3">
                  {plan.details.budget_allocation_summary.allocation_by_channel.map((channel: any, index: number) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        {getPlatformIcon(channel.channel)}
                        <div>
                          <h5 className="font-semibold text-gray-900">{channel.channel}</h5>
                          <p className="text-gray-600 text-sm">{channel.justification}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-gray-900">{channel.percentage}</p>
                        <p className="text-gray-600 text-sm">{channel.amount}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Allocation by Type */}
            {plan.details.budget_allocation_summary.allocation_by_type && (
              <div>
                <h4 className="font-semibold text-gray-900 mb-4">Alocare pe tipuri:</h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {Object.entries(plan.details.budget_allocation_summary.allocation_by_type).map(([type, percentage], index) => (
                    <div key={index} className="text-center p-3 bg-green-50 rounded-lg">
                      <p className="font-bold text-green-900">{percentage}</p>
                      <p className="text-green-700 text-sm capitalize">{type.replace(/_/g, ' ')}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </Card>
      )}

      {/* KPIs SMART Summary */}
      {plan.details?.kpis_smart && plan.details.kpis_smart.length > 0 && (
        <Card className="shadow-lg" animation="fadeInUp">
          <div className="flex items-center space-x-3 mb-6">
            <div className="p-3 bg-purple-100 rounded-xl">
              <Award className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">KPI-uri SMART</h3>
              <p className="text-gray-600">Indicatori cheie de performanță</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {plan.details.kpis_smart.slice(0, 4).map((kpi: any, index: number) => (
              <Card key={index} className="bg-purple-50 border-purple-200" padding="md">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-bold text-gray-900">{kpi.name}</h4>
                  <span className="px-2 py-1 bg-purple-200 text-purple-800 rounded-full text-xs font-medium">
                    {kpi.timeframe}
                  </span>
                </div>
                <p className="text-gray-700 text-sm mb-3">{kpi.description}</p>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="font-medium">Țintă:</span>
                    <span className="font-bold text-purple-900">{kpi.target_value}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Măsurare:</span>
                    <span>{kpi.measurement_method}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Responsabil:</span>
                    <span>{kpi.responsible}</span>
                  </div>
                </div>
              </Card>
            ))}
          </div>
          
          {plan.details.kpis_smart.length > 4 && (
            <div className="mt-4 text-center">
              <p className="text-gray-600 text-sm">
                +{plan.details.kpis_smart.length - 4} KPI-uri suplimentare în secțiunea Metrici & ROI
              </p>
            </div>
          )}
        </Card>
      )}
    </div>
  );

  const renderEditorialCalendarTab = () => (
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

        {plan.details?.tactical_plan_per_platform && plan.details.tactical_plan_per_platform.length > 0 ? (
          <div className="space-y-8">
            {plan.details.tactical_plan_per_platform.map((platform: any, platformIndex: number) => (
              <Card key={platformIndex} className={`border-l-4 ${getPlatformColor(platform.platform)}`} padding="md" animation="fadeInUp" delay={platformIndex + 1}>
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-lg ${getPlatformColor(platform.platform)}`}>
                      {getPlatformIcon(platform.platform)}
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900">{platform.platform}</h4>
                      <p className="text-gray-600 text-sm">{platform.posting_frequency}</p>
                    </div>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => {
                      const platformContent = platform.editorial_calendar?.month_1?.map((week: any) => 
                        week.posts?.map((post: any) => 
                          `${post.scheduled_date}\n${post.copy?.main_text || ''}\n${post.copy?.hashtags?.join(' ') || ''}\n${post.copy?.call_to_action || ''}`
                        ).join('\n\n')
                      ).join('\n\n---\n\n');
                      copyToClipboard(platformContent || '', `platform-${platformIndex}`);
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
                        <span>Copiază calendarul</span>
                      </>
                    )}
                  </Button>
                </div>
                
                {platform.editorial_calendar?.month_1 ? (
                  <div className="space-y-6">
                    {platform.editorial_calendar.month_1.map((week: any, weekIndex: number) => (
                      <Card key={weekIndex} className="bg-gray-50" padding="sm">
                        <div className="flex items-center justify-between mb-4">
                          <h5 className="font-bold text-gray-900">Săptămâna {week.week}</h5>
                          <span className="text-xs text-gray-500">
                            {week.posts?.length || 0} postări programate
                          </span>
                        </div>
                        
                        {week.posts && week.posts.length > 0 ? (
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {week.posts.map((post: any, postIndex: number) => (
                              <Card key={postIndex} className="bg-white border border-gray-200" padding="sm" hover="subtle">
                                <div className="flex items-center justify-between mb-2">
                                  <span className="text-xs font-medium text-gray-600">{post.post_id}</span>
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
                                    <p className="text-xs font-medium text-gray-800">Programat:</p>
                                    <p className="text-xs text-gray-600">{post.scheduled_date}</p>
                                  </div>
                                  
                                  {post.copy?.main_text && (
                                    <div>
                                      <p className="text-xs font-medium text-gray-800">Conținut:</p>
                                      <div className="bg-gray-50 p-2 rounded text-xs text-gray-700 max-h-20 overflow-y-auto">
                                        {post.copy.main_text.substring(0, 150)}
                                        {post.copy.main_text.length > 150 && '...'}
                                      </div>
                                    </div>
                                  )}
                                  
                                  {post.copy?.hashtags && post.copy.hashtags.length > 0 && (
                                    <div>
                                      <p className="text-xs font-medium text-gray-800">Hashtag-uri:</p>
                                      <div className="flex flex-wrap gap-1">
                                        {post.copy.hashtags.slice(0, 3).map((hashtag: string, i: number) => (
                                          <span key={i} className="px-1 py-0.5 bg-blue-100 text-blue-800 rounded text-xs">
                                            {hashtag}
                                          </span>
                                        ))}
                                        {post.copy.hashtags.length > 3 && (
                                          <span className="text-xs text-gray-500">+{post.copy.hashtags.length - 3}</span>
                                        )}
                                      </div>
                                    </div>
                                  )}
                                  
                                  {post.copy?.call_to_action && (
                                    <div>
                                      <p className="text-xs font-medium text-gray-800">CTA:</p>
                                      <p className="text-xs text-gray-600 italic">{post.copy.call_to_action}</p>
                                    </div>
                                  )}
                                </div>
                              </Card>
                            ))}
                          </div>
                        ) : (
                          <p className="text-gray-500 text-sm text-center py-4">Nu sunt postări programate pentru această săptămână</p>
                        )}
                      </Card>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-8">Calendar editorial în dezvoltare pentru această platformă</p>
                )}
              </Card>
            ))}
          </div>
        ) : (
          <Card className="text-center py-12" animation="bounceIn">
            <div className="p-4 bg-gray-100 rounded-2xl mb-4 inline-block">
              <Calendar className="h-8 w-8 text-gray-500" />
            </div>
            <h4 className="text-lg font-semibold text-gray-900 mb-2">
              Calendar editorial în dezvoltare
            </h4>
            <p className="text-gray-600">
              Calendarul detaliat de conținut va fi disponibil în curând
            </p>
          </Card>
        )}

        {/* Export Calendar Button */}
        {plan.details?.tactical_plan_per_platform && plan.details.tactical_plan_per_platform.length > 0 && (
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

  const renderDetailedContentTab = () => (
    <div className="space-y-6">
      <Card className="shadow-lg" animation="slideInLeft">
        <div className="flex items-center space-x-3 mb-6">
          <div className="p-3 bg-purple-100 rounded-xl">
            <MessageSquare className="h-6 w-6 text-purple-600" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900">Conținut detaliat</h3>
            <p className="text-gray-600">Specificații complete pentru fiecare postare</p>
          </div>
        </div>

        {plan.details?.tactical_plan_per_platform && plan.details.tactical_plan_per_platform.length > 0 ? (
          <div className="space-y-8">
            {plan.details.tactical_plan_per_platform.map((platform: any, platformIndex: number) => (
              <Card key={platformIndex} className={`border-l-4 ${getPlatformColor(platform.platform)}`} padding="md" animation="fadeInUp" delay={platformIndex + 1}>
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-lg ${getPlatformColor(platform.platform)}`}>
                      {getPlatformIcon(platform.platform)}
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">{platform.platform}</h4>
                      <p className="text-xs text-gray-600">{platform.strategy}</p>
                    </div>
                  </div>
                </div>
                
                {platform.editorial_calendar?.month_1 ? (
                  <div className="space-y-6">
                    {platform.editorial_calendar.month_1.map((week: any) => 
                      week.posts?.map((post: any, postIndex: number) => (
                        <Card key={postIndex} className="bg-white border border-gray-200" padding="md" hover="subtle">
                          <div className="flex items-center justify-between mb-4">
                            <div>
                              <h5 className="font-bold text-gray-900">{post.post_id}</h5>
                              <p className="text-sm text-gray-600">{post.scheduled_date}</p>
                            </div>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => {
                                const fullContent = `
POST ID: ${post.post_id}
PROGRAMAT: ${post.scheduled_date}

CONȚINUT:
${post.copy?.main_text || ''}

CALL TO ACTION:
${post.copy?.call_to_action || ''}

HASHTAG-URI:
${post.copy?.hashtags?.join(' ') || ''}

BRIEF VIZUAL:
Tip: ${post.visual_brief?.type || ''}
Dimensiuni: ${post.visual_brief?.dimensions || ''}
Stil: ${post.visual_brief?.style_guidelines || ''}

BUGET PROMOVARE: ${post.promotion_budget || ''}
                                `.trim();
                                copyToClipboard(fullContent, `detailed-post-${platformIndex}-${postIndex}`);
                              }}
                              className="flex items-center space-x-1"
                            >
                              {copiedContentId === `detailed-post-${platformIndex}-${postIndex}` ? (
                                <>
                                  <CheckSquare className="h-3 w-3" />
                                  <span>Copiat!</span>
                                </>
                              ) : (
                                <>
                                  <Copy className="h-3 w-3" />
                                  <span>Copiază tot</span>
                                </>
                              )}
                            </Button>
                          </div>
                          
                          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Copy Section */}
                            {post.copy && (
                              <div>
                                <h6 className="font-semibold text-gray-800 mb-3 flex items-center space-x-2">
                                  <FileText className="h-4 w-4" />
                                  <span>Conținut textual</span>
                                </h6>
                                <div className="space-y-3">
                                  {post.copy.main_text && (
                                    <div>
                                      <p className="text-xs font-medium text-gray-700 mb-1">Text principal:</p>
                                      <div className="bg-gray-50 p-3 rounded-lg text-sm text-gray-800 border">
                                        {post.copy.main_text}
                                      </div>
                                    </div>
                                  )}
                                  
                                  {post.copy.call_to_action && (
                                    <div>
                                      <p className="text-xs font-medium text-gray-700 mb-1">Call to Action:</p>
                                      <div className="bg-blue-50 p-2 rounded-lg text-sm text-blue-800 border border-blue-200">
                                        {post.copy.call_to_action}
                                      </div>
                                    </div>
                                  )}
                                  
                                  {post.copy.hashtags && post.copy.hashtags.length > 0 && (
                                    <div>
                                      <p className="text-xs font-medium text-gray-700 mb-1">Hashtag-uri:</p>
                                      <div className="flex flex-wrap gap-1">
                                        {post.copy.hashtags.map((hashtag: string, i: number) => (
                                          <span key={i} className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                                            {hashtag}
                                          </span>
                                        ))}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}
                            
                            {/* Visual Brief Section */}
                            {post.visual_brief && (
                              <div>
                                <h6 className="font-semibold text-gray-800 mb-3 flex items-center space-x-2">
                                  <Eye className="h-4 w-4" />
                                  <span>Brief vizual</span>
                                </h6>
                                <div className="space-y-3">
                                  <div className="grid grid-cols-2 gap-3 text-xs">
                                    {post.visual_brief.type && (
                                      <div>
                                        <p className="font-medium text-gray-700">Tip:</p>
                                        <p className="text-gray-600">{post.visual_brief.type}</p>
                                      </div>
                                    )}
                                    {post.visual_brief.dimensions && (
                                      <div>
                                        <p className="font-medium text-gray-700">Dimensiuni:</p>
                                        <p className="text-gray-600">{post.visual_brief.dimensions}</p>
                                      </div>
                                    )}
                                  </div>
                                  
                                  {post.visual_brief.style_guidelines && (
                                    <div>
                                      <p className="text-xs font-medium text-gray-700 mb-1">Ghid de stil:</p>
                                      <p className="text-xs text-gray-600 bg-gray-50 p-2 rounded">
                                        {post.visual_brief.style_guidelines}
                                      </p>
                                    </div>
                                  )}
                                  
                                  {post.visual_brief.mandatory_elements && post.visual_brief.mandatory_elements.length > 0 && (
                                    <div>
                                      <p className="text-xs font-medium text-gray-700 mb-1">Elemente obligatorii:</p>
                                      <div className="flex flex-wrap gap-1">
                                        {post.visual_brief.mandatory_elements.map((element: string, i: number) => (
                                          <span key={i} className="px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-xs">
                                            {element}
                                          </span>
                                        ))}
                                      </div>
                                    </div>
                                  )}
                                  
                                  {post.visual_brief.color_palette && post.visual_brief.color_palette.length > 0 && (
                                    <div>
                                      <p className="text-xs font-medium text-gray-700 mb-1">Paletă de culori:</p>
                                      <div className="flex space-x-1">
                                        {post.visual_brief.color_palette.map((color: string, i: number) => (
                                          <div 
                                            key={i} 
                                            className="w-6 h-6 rounded border border-gray-300"
                                            style={{ backgroundColor: color }}
                                            title={color}
                                          />
                                        ))}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                          
                          {/* Additional Details */}
                          <div className="mt-6 pt-4 border-t border-gray-200">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                              {post.promotion_budget && (
                                <div>
                                  <p className="font-medium text-gray-700">Buget promovare:</p>
                                  <p className="text-green-600 font-semibold">{post.promotion_budget}</p>
                                </div>
                              )}
                              
                              {post.individual_metrics?.primary_kpi && (
                                <div>
                                  <p className="font-medium text-gray-700">KPI principal:</p>
                                  <p className="text-blue-600">{post.individual_metrics.primary_kpi}</p>
                                </div>
                              )}
                              
                              {post.individual_metrics?.target_reach && (
                                <div>
                                  <p className="font-medium text-gray-700">Reach țintă:</p>
                                  <p className="text-purple-600">{post.individual_metrics.target_reach}</p>
                                </div>
                              )}
                            </div>
                          </div>
                        </Card>
                      ))
                    )}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-8">Conținut detaliat în dezvoltare pentru această platformă</p>
                )}
              </Card>
            ))}
          </div>
        ) : (
          <Card className="text-center py-12" animation="bounceIn">
            <div className="p-4 bg-gradient-to-r from-purple-100 to-pink-100 rounded-2xl mb-4 inline-block">
              <Zap className="h-8 w-8 text-purple-600" />
            </div>
            <h4 className="text-lg font-semibold text-gray-900 mb-2">
              Conținut detaliat în dezvoltare
            </h4>
            <p className="text-gray-600 mb-4">
              Specificațiile complete pentru fiecare postare vor fi disponibile în curând
            </p>
          </Card>
        )}
      </Card>
    </div>
  );

  const renderMetricsRoiTab = () => (
    <div className="space-y-6">
      <Card className="shadow-lg" animation="slideInLeft">
        <div className="flex items-center space-x-3 mb-6">
          <div className="p-3 bg-orange-100 rounded-xl">
            <BarChart3 className="h-6 w-6 text-orange-600" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900">Metrici și KPI-uri</h3>
            <p className="text-gray-600">Urmărirea performanței și calculul ROI</p>
          </div>
        </div>

        {plan.details?.kpis_smart && plan.details.kpis_smart.length > 0 ? (
          <div className="space-y-6">
            {/* KPIs Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {plan.details.kpis_smart.map((kpi: any, index: number) => (
                <Card key={index} className="bg-gradient-to-r from-orange-50 to-red-50 border-orange-200" padding="md" animation="scaleIn" delay={index + 1} hover="subtle">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-bold text-gray-900">{kpi.name}</h4>
                    <div className="flex items-center space-x-2">
                      <Gauge className="h-4 w-4 text-orange-600" />
                      <span className="text-xs font-medium text-orange-700">{kpi.timeframe}</span>
                    </div>
                  </div>
                  
                  <p className="text-gray-700 text-sm mb-4">{kpi.description}</p>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-700">Valoare țintă:</span>
                      <span className="text-lg font-bold text-orange-600">{kpi.target_value}</span>
                    </div>
                    
                    <div className="space-y-2 text-xs">
                      <div className="flex justify-between">
                        <span className="font-medium text-gray-600">Măsurare:</span>
                        <span className="text-gray-700">{kpi.measurement_method}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium text-gray-600">Responsabil:</span>
                        <span className="text-gray-700">{kpi.responsible}</span>
                      </div>
                    </div>
                    
                    {/* SMART Breakdown */}
                    <div className="pt-3 border-t border-orange-200">
                      <h5 className="font-semibold text-gray-800 mb-2 text-xs">Criteriile SMART:</h5>
                      <div className="space-y-1 text-xs">
                        {kpi.specific && (
                          <div>
                            <span className="font-medium text-gray-600">Specific:</span>
                            <p className="text-gray-700">{kpi.specific}</p>
                          </div>
                        )}
                        {kpi.measurable && (
                          <div>
                            <span className="font-medium text-gray-600">Măsurabil:</span>
                            <p className="text-gray-700">{kpi.measurable}</p>
                          </div>
                        )}
                        {kpi.achievable && (
                          <div>
                            <span className="font-medium text-gray-600">Realizabil:</span>
                            <p className="text-gray-700">{kpi.achievable}</p>
                          </div>
                        )}
                        {kpi.relevant && (
                          <div>
                            <span className="font-medium text-gray-600">Relevant:</span>
                            <p className="text-gray-700">{kpi.relevant}</p>
                          </div>
                        )}
                        {kpi.time_bound && (
                          <div>
                            <span className="font-medium text-gray-600">Încadrat în timp:</span>
                            <p className="text-gray-700">{kpi.time_bound}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
            
            {/* ROI Projections */}
            <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-green-200" animation="fadeInUp">
              <div className="flex items-center space-x-3 mb-6">
                <div className="p-2 bg-green-100 rounded-lg">
                  <TrendingUp className="h-6 w-6 text-green-600" />
                </div>
                <h4 className="text-xl font-bold text-gray-900">Proiecții ROI</h4>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600 mb-2">150-200%</div>
                  <p className="text-sm text-gray-700">ROI așteptat</p>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600 mb-2">3-6 luni</div>
                  <p className="text-sm text-gray-700">Perioada de recuperare</p>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-600 mb-2">25-40%</div>
                  <p className="text-sm text-gray-700">Creștere vânzări</p>
                </div>
              </div>
              
              <div className="bg-white p-4 rounded-lg border border-green-200">
                <h5 className="font-semibold text-gray-900 mb-3 flex items-center space-x-2">
                  <Info className="h-4 w-4 text-blue-600" />
                  <span>Metodologia de calculare ROI</span>
                </h5>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span>ROI = (Venituri generate - Investiția în marketing) / Investiția în marketing × 100</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span>Urmărirea conversiilor prin Google Analytics și pixel-uri de tracking</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span>Atribuirea multi-touch pentru o măsurare precisă a impactului fiecărui canal</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span>Raportare lunară cu analiză detaliată a performanței pe fiecare platformă</span>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        ) : (
          <Card className="text-center py-12" animation="bounceIn">
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

        {/* KPI Recommendations */}
        <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200" animation="fadeInUp">
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
                  <span className="text-gray-700">Folosește A/B testing pentru optimizarea continuă a conținutului</span>
                </li>
              </ul>
            </div>
          </div>
        </Card>
      </Card>
    </div>
  );

  const renderMonitoringTab = () => (
    <div className="space-y-6">
      <Card className="shadow-lg" animation="slideInLeft">
        <div className="flex items-center space-x-3 mb-6">
          <div className="p-3 bg-indigo-100 rounded-xl">
            <Activity className="h-6 w-6 text-indigo-600" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900">Monitorizare și optimizare</h3>
            <p className="text-gray-600">Urmărirea performanței și ajustări continue</p>
          </div>
        </div>

        {plan.details?.monitoring_and_optimization ? (
          <div className="space-y-8">
            {/* Weekly Dashboard Metrics */}
            {plan.details.monitoring_and_optimization.weekly_dashboard_metrics && (
              <Card className="bg-indigo-50 border-indigo-200" padding="md">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="p-2 bg-indigo-100 rounded-lg">
                    <Gauge className="h-5 w-5 text-indigo-600" />
                  </div>
                  <h4 className="text-lg font-bold text-gray-900">Metrici dashboard săptămânal</h4>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {plan.details.monitoring_and_optimization.weekly_dashboard_metrics.map((metric: any, index: number) => (
                    <Card key={index} className="bg-white border border-indigo-200" padding="sm">
                      <div className="space-y-2">
                        <h5 className="font-semibold text-gray-900">{metric.metric}</h5>
                        <p className="text-gray-700 text-sm">{metric.description}</p>
                        <div className="space-y-1 text-xs">
                          <div className="flex justify-between">
                            <span className="font-medium text-gray-600">Țintă:</span>
                            <span className="font-bold text-indigo-600">{metric.target_value}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="font-medium text-gray-600">Frecvență:</span>
                            <span className="text-gray-700">{metric.measurement_frequency}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="font-medium text-gray-600">Sursă:</span>
                            <span className="text-gray-700">{metric.data_source}</span>
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </Card>
            )}
            
            {/* Performance Evaluation Schedule */}
            {plan.details.monitoring_and_optimization.performance_evaluation_schedule && (
              <Card className="bg-blue-50 border-blue-200" padding="md">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Timer className="h-5 w-5 text-blue-600" />
                  </div>
                  <h4 className="text-lg font-bold text-gray-900">Programul de evaluare</h4>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {Object.entries(plan.details.monitoring_and_optimization.performance_evaluation_schedule).map(([period, details]: [string, any], index) => (
                    <Card key={index} className="bg-white border border-blue-200" padding="sm">
                      <div className="space-y-3">
                        <h5 className="font-bold text-gray-900 capitalize">{period.replace(/_/g, ' ')}</h5>
                        
                        {details.focus_areas && (
                          <div>
                            <p className="text-xs font-medium text-gray-700 mb-1">Zone de focus:</p>
                            <ul className="space-y-1">
                              {details.focus_areas.map((area: string, i: number) => (
                                <li key={i} className="text-xs text-gray-600 flex items-start space-x-1">
                                  <span className="w-1 h-1 bg-blue-500 rounded-full mt-1.5 flex-shrink-0"></span>
                                  <span>{area}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                        
                        {details.key_metrics && (
                          <div>
                            <p className="text-xs font-medium text-gray-700 mb-1">Metrici cheie:</p>
                            <div className="flex flex-wrap gap-1">
                              {details.key_metrics.map((metric: string, i: number) => (
                                <span key={i} className="px-1 py-0.5 bg-blue-100 text-blue-800 rounded text-xs">
                                  {metric}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        {details.action_items && (
                          <div>
                            <p className="text-xs font-medium text-gray-700 mb-1">Acțiuni:</p>
                            <ul className="space-y-1">
                              {details.action_items.map((action: string, i: number) => (
                                <li key={i} className="text-xs text-gray-600 flex items-start space-x-1">
                                  <CheckCircle className="h-3 w-3 text-green-600 mt-0.5 flex-shrink-0" />
                                  <span>{action}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </Card>
                  ))}
                </div>
              </Card>
            )}
            
            {/* Adjustment Recommendations */}
            {plan.details.monitoring_and_optimization.adjustment_recommendations && (
              <Card className="bg-amber-50 border-amber-200" padding="md">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="p-2 bg-amber-100 rounded-lg">
                    <Settings className="h-5 w-5 text-amber-600" />
                  </div>
                  <h4 className="text-lg font-bold text-gray-900">Recomandări de ajustare</h4>
                </div>
                
                <div className="space-y-4">
                  {plan.details.monitoring_and_optimization.adjustment_recommendations.map((recommendation: any, index: number) => (
                    <Card key={index} className="bg-white border border-amber-200" padding="sm">
                      <div className="space-y-3">
                        <div>
                          <h5 className="font-semibold text-gray-900 mb-1">Condiție declanșatoare:</h5>
                          <p className="text-gray-700 text-sm">{recommendation.trigger_condition}</p>
                        </div>
                        
                        <div>
                          <h5 className="font-semibold text-gray-900 mb-1">Acțiune recomandată:</h5>
                          <p className="text-gray-700 text-sm">{recommendation.recommended_action}</p>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4 text-xs">
                          <div>
                            <span className="font-medium text-gray-700">Cronologie implementare:</span>
                            <p className="text-gray-600">{recommendation.implementation_timeline}</p>
                          </div>
                          <div>
                            <span className="font-medium text-gray-700">Impact așteptat:</span>
                            <p className="text-gray-600">{recommendation.expected_impact}</p>
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
              <Card className="bg-green-50 border-green-200" padding="md">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Users className="h-5 w-5 text-green-600" />
                  </div>
                  <h4 className="text-lg font-bold text-gray-900">Responsabilități dedicate</h4>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {plan.details.monitoring_and_optimization.dedicated_responsibilities.map((role: any, index: number) => (
                    <Card key={index} className="bg-white border border-green-200" padding="sm">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <h5 className="font-bold text-gray-900">{role.role}</h5>
                          <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                            {role.time_allocation}
                          </span>
                        </div>
                        
                        {role.responsibilities && (
                          <div>
                            <p className="text-xs font-medium text-gray-700 mb-2">Responsabilități:</p>
                            <ul className="space-y-1">
                              {role.responsibilities.map((responsibility: string, i: number) => (
                                <li key={i} className="text-xs text-gray-600 flex items-start space-x-1">
                                  <span className="w-1 h-1 bg-green-500 rounded-full mt-1.5 flex-shrink-0"></span>
                                  <span>{responsibility}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                        
                        {role.required_skills && (
                          <div>
                            <p className="text-xs font-medium text-gray-700 mb-1">Abilități necesare:</p>
                            <div className="flex flex-wrap gap-1">
                              {role.required_skills.map((skill: string, i: number) => (
                                <span key={i} className="px-1 py-0.5 bg-green-200 text-green-800 rounded text-xs">
                                  {skill}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </Card>
                  ))}
                </div>
              </Card>
            )}
          </div>
        ) : (
          <Card className="text-center py-12" animation="bounceIn">
            <div className="p-4 bg-indigo-100 rounded-2xl mb-4 inline-block">
              <Activity className="h-8 w-8 text-indigo-600" />
            </div>
            <h4 className="text-lg font-semibold text-gray-900 mb-2">
              Monitorizare în dezvoltare
            </h4>
            <p className="text-gray-600">
              Sistemul de monitorizare și optimizare va fi disponibil în curând
            </p>
          </Card>
        )}

        {/* Monitoring Best Practices */}
        <Card className="bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200" animation="fadeInUp">
          <div className="flex items-start space-x-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Bell className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Best practices pentru monitorizare</h4>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                  <span className="text-gray-700">Monitorizează zilnic metricile de engagement și reach pentru a identifica rapid tendințele</span>
                </li>
                <li className="flex items-start space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                  <span className="text-gray-700">Setează alerte automate pentru scăderi semnificative în performanță</span>
                </li>
                <li className="flex items-start space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                  <span className="text-gray-700">Documentează toate ajustările și impactul lor pentru învățare continuă</span>
                </li>
                <li className="flex items-start space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                  <span className="text-gray-700">Compară performanța cu perioada anterioară și cu obiectivele stabilite</span>
                </li>
              </ul>
            </div>
          </div>
        </Card>
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
        {activeTab === 'overview' && renderOverviewTab()}
        {activeTab === 'strategy' && renderStrategyKpisTab()}
        {activeTab === 'calendar' && renderEditorialCalendarTab()}
        {activeTab === 'content' && renderDetailedContentTab()}
        {activeTab === 'metrics' && renderMetricsRoiTab()}
        {activeTab === 'monitoring' && renderMonitoringTab()}
      </div>
    </div>
  );
};