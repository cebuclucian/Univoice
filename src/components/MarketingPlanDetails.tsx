import React, { useState, useRef } from 'react';
import { 
  Calendar, Target, Users, TrendingUp, BarChart3, Clock, 
  CheckCircle, ArrowLeft, Edit3, Share2, Download, Brain,
  Lightbulb, Zap, MessageSquare, Instagram, Facebook, 
  Twitter, Mail, Globe, Youtube, Music, Monitor, Copy,
  CheckSquare, AlertCircle, Info, Clipboard, FileText,
  Star, Award, DollarSign, Eye, ChevronDown, ChevronUp,
  Sparkles, Crown, Shield, Activity
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
  const [expandedPosts, setExpandedPosts] = useState<Set<string>>(new Set());
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

  const togglePostExpansion = (postId: string) => {
    const newExpanded = new Set(expandedPosts);
    if (newExpanded.has(postId)) {
      newExpanded.delete(postId);
    } else {
      newExpanded.add(postId);
    }
    setExpandedPosts(newExpanded);
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
    
    // Brand Voice
    if (details?.brand_voice_used) {
      text += 'VOCEA BRANDULUI FOLOSITĂ:\n';
      text += `Personalitate: ${Array.isArray(details.brand_voice_used.personality) ? details.brand_voice_used.personality.join(', ') : details.brand_voice_used.personality}\n`;
      text += `Ton: ${Array.isArray(details.brand_voice_used.tone) ? details.brand_voice_used.tone.join(', ') : details.brand_voice_used.tone}\n\n`;
    }
    
    // KPIs SMART
    if (details?.kpis_smart) {
      text += 'KPI-URI SMART:\n';
      details.kpis_smart.forEach((kpi: any, i: number) => {
        text += `${i+1}. ${kpi.name}\n`;
        text += `   Țintă: ${kpi.target_value}\n`;
        text += `   Măsurare: ${kpi.measurement_method}\n`;
        text += `   Responsabil: ${kpi.responsible}\n\n`;
      });
    }
    
    return text;
  };

  const generateCalendarExport = () => {
    const { title, details } = plan;
    
    let text = `CALENDAR EDITORIAL: ${title}\n\n`;
    
    if (details?.tactical_plan_per_platform) {
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
                  <h4 className="font-semibold text-gray-800 mb-2">Caracteristicile vocii:</h4>
                  <div className="space-y-1 text-sm">
                    <p><span className="font-medium">Ton:</span> {plan.details.identity_and_voice.voice_characteristics.tone}</p>
                    <p><span className="font-medium">Personalitate:</span> {plan.details.identity_and_voice.voice_characteristics.personality}</p>
                    <p><span className="font-medium">Stil comunicare:</span> {plan.details.identity_and_voice.voice_characteristics.communication_style}</p>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-semibold text-gray-800 mb-2">Valori:</h4>
                  <div className="flex flex-wrap gap-1">
                    {plan.details.identity_and_voice.voice_characteristics.values?.map((value: string, index: number) => (
                      <span key={index} className="px-2 py-1 bg-indigo-100 text-indigo-800 rounded-full text-xs">
                        {value}
                      </span>
                    ))}
                  </div>
                </div>
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
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-2 bg-green-100 rounded-xl">
              <Users className="h-6 w-6 text-green-600" />
            </div>
            <h3 className="text-lg font-bold text-gray-900">Buyer Personas</h3>
          </div>
          
          <div className="space-y-6">
            {plan.details.buyer_personas.map((persona: any, index: number) => (
              <Card key={index} className="bg-green-50 border-green-200" padding="md">
                <h4 className="font-bold text-gray-900 mb-4">{persona.name}</h4>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <h5 className="font-semibold text-gray-800 mb-2">Demografia:</h5>
                    <div className="space-y-1 text-sm text-gray-700">
                      <p><span className="font-medium">Vârstă:</span> {persona.demographics?.age_range}</p>
                      <p><span className="font-medium">Gen:</span> {persona.demographics?.gender}</p>
                      <p><span className="font-medium">Locație:</span> {persona.demographics?.location}</p>
                      <p><span className="font-medium">Venit:</span> {persona.demographics?.income}</p>
                      <p><span className="font-medium">Educație:</span> {persona.demographics?.education}</p>
                      <p><span className="font-medium">Ocupație:</span> {persona.demographics?.occupation}</p>
                    </div>
                  </div>
                  
                  <div>
                    <h5 className="font-semibold text-gray-800 mb-2">Psihografia:</h5>
                    <div className="space-y-2 text-sm">
                      <div>
                        <span className="font-medium text-gray-800">Interese:</span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {persona.psychographics?.interests?.map((interest: string, i: number) => (
                            <span key={i} className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                              {interest}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div>
                        <span className="font-medium text-gray-800">Valori:</span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {persona.psychographics?.values?.map((value: string, i: number) => (
                            <span key={i} className="px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-xs">
                              {value}
                            </span>
                          ))}
                        </div>
                      </div>
                      <p><span className="font-medium">Stil de viață:</span> {persona.psychographics?.lifestyle}</p>
                    </div>
                  </div>
                  
                  <div>
                    <h5 className="font-semibold text-gray-800 mb-2">Comportament digital:</h5>
                    <div className="space-y-1 text-sm text-gray-700">
                      <p><span className="font-medium">Timp online:</span> {persona.digital_behavior?.online_activity_time}</p>
                      <p><span className="font-medium">Comportament cumpărare:</span> {persona.digital_behavior?.purchase_behavior}</p>
                      <div>
                        <span className="font-medium">Platforme preferate:</span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {persona.digital_behavior?.preferred_platforms?.map((platform: string, i: number) => (
                            <span key={i} className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs">
                              {platform}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
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
            <div className="p-2 bg-yellow-100 rounded-xl">
              <Shield className="h-6 w-6 text-yellow-600" />
            </div>
            <h3 className="text-lg font-bold text-gray-900">Justificarea selecției platformelor</h3>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold text-gray-800 mb-3">Platforme selectate:</h4>
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
            
            <div>
              <h4 className="font-semibold text-gray-800 mb-3">Platforme excluse:</h4>
              <div className="space-y-2">
                {plan.details.platform_selection_justification.excluded_platforms?.map((platform: any, index: number) => (
                  <Card key={index} className="bg-red-50 border-red-200" padding="sm">
                    <h5 className="font-semibold text-gray-900 text-sm">{platform.platform}</h5>
                    <p className="text-xs text-gray-700">{platform.reason}</p>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </Card>
      )}
    </div>
  );

  const renderStrategy = () => (
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
              <Card 
                key={index}
                className="border-l-4 border-green-400 bg-green-50"
                padding="md"
                hover="subtle"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-gray-900">{kpi.name}</h4>
                    <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                      {kpi.target_value}
                    </span>
                  </div>
                  
                  <p className="text-gray-700 text-sm">{kpi.description}</p>
                  
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <span className="font-semibold text-gray-800">Măsurare:</span>
                      <p className="text-gray-600">{kpi.measurement_method}</p>
                    </div>
                    <div>
                      <span className="font-semibold text-gray-800">Responsabil:</span>
                      <p className="text-gray-600">{kpi.responsible}</p>
                    </div>
                    <div>
                      <span className="font-semibold text-gray-800">Perioada:</span>
                      <p className="text-gray-600">{kpi.timeframe}</p>
                    </div>
                  </div>
                  
                  {/* SMART Analysis */}
                  <Card className="bg-white border border-green-200" padding="sm">
                    <h5 className="font-semibold text-gray-800 mb-2 text-sm">Analiza SMART:</h5>
                    <div className="space-y-1 text-xs">
                      <p><span className="font-medium text-green-700">S:</span> {kpi.specific}</p>
                      <p><span className="font-medium text-green-700">M:</span> {kpi.measurable}</p>
                      <p><span className="font-medium text-green-700">A:</span> {kpi.achievable}</p>
                      <p><span className="font-medium text-green-700">R:</span> {kpi.relevant}</p>
                      <p><span className="font-medium text-green-700">T:</span> {kpi.time_bound}</p>
                    </div>
                  </Card>
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
              <DollarSign className="h-6 w-6 text-blue-600" />
            </div>
            <h3 className="text-lg font-bold text-gray-900">Alocarea bugetului</h3>
          </div>
          
          <div className="space-y-6">
            <div className="text-center">
              <h4 className="text-2xl font-bold text-gray-900 mb-2">
                Buget total: {plan.details.budget_allocation_summary.total_budget}
              </h4>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold text-gray-800 mb-3">Alocarea pe canale:</h4>
                <div className="space-y-2">
                  {plan.details.budget_allocation_summary.allocation_by_channel?.map((channel: any, index: number) => (
                    <Card key={index} className="bg-blue-50 border-blue-200" padding="sm">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium text-gray-900">{channel.channel}</span>
                        <div className="text-right">
                          <span className="font-bold text-blue-600">{channel.percentage}</span>
                          <span className="text-sm text-gray-600 ml-2">({channel.amount})</span>
                        </div>
                      </div>
                      <p className="text-xs text-gray-600">{channel.justification}</p>
                    </Card>
                  ))}
                </div>
              </div>
              
              <div>
                <h4 className="font-semibold text-gray-800 mb-3">Alocarea pe tipuri:</h4>
                <div className="space-y-2">
                  {Object.entries(plan.details.budget_allocation_summary.allocation_by_type || {}).map(([type, percentage]) => (
                    <div key={type} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="font-medium text-gray-900 capitalize">
                        {type.replace(/_/g, ' ')}
                      </span>
                      <span className="font-bold text-gray-700">{percentage}</span>
                    </div>
                  ))}
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
            <p className="text-gray-600">Planificarea postărilor pe platforme</p>
          </div>
        </div>

        {plan.details?.tactical_plan_per_platform ? (
          <div className="space-y-8">
            {plan.details.tactical_plan_per_platform.map((platform: any, platformIndex: number) => (
              <Card 
                key={platformIndex}
                className={`border-l-4 ${getPlatformColor(platform.platform)}`}
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
                      <h4 className="font-bold text-gray-900">{platform.platform}</h4>
                      <p className="text-sm text-gray-600">{platform.posting_frequency}</p>
                    </div>
                  </div>
                  
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => {
                      const platformContent = `Strategie ${platform.platform}:\n${platform.strategy}`;
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
                
                <div className="mb-4">
                  <p className="text-gray-700 text-sm">{platform.strategy}</p>
                </div>
                
                {platform.editorial_calendar?.month_1 && (
                  <div className="space-y-4">
                    <h5 className="font-semibold text-gray-800">Luna 1 - Calendar editorial:</h5>
                    {platform.editorial_calendar.month_1.map((week: any, weekIndex: number) => (
                      <Card key={weekIndex} className="bg-gray-50" padding="sm">
                        <h6 className="font-semibold text-gray-900 mb-3">Săptămâna {week.week}</h6>
                        
                        {week.posts && week.posts.length > 0 ? (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {week.posts.map((post: any, postIndex: number) => {
                              const postId = `${platformIndex}-${weekIndex}-${postIndex}`;
                              const isExpanded = expandedPosts.has(postId);
                              
                              return (
                                <Card key={postIndex} className="bg-white border border-gray-200" padding="sm">
                                  <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                      <span className="text-xs font-medium text-gray-600">{post.post_id}</span>
                                      <div className="flex space-x-1">
                                        <Button 
                                          variant="ghost" 
                                          size="sm"
                                          onClick={() => togglePostExpansion(postId)}
                                          className="p-1 h-6 w-6"
                                        >
                                          {isExpanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                                        </Button>
                                        <Button 
                                          variant="ghost" 
                                          size="sm"
                                          onClick={() => copyToClipboard(post.copy?.main_text || '', postId)}
                                          className="p-1 h-6 w-6"
                                        >
                                          {copiedContentId === postId ? (
                                            <CheckSquare className="h-3 w-3 text-green-600" />
                                          ) : (
                                            <Copy className="h-3 w-3" />
                                          )}
                                        </Button>
                                      </div>
                                    </div>
                                    
                                    <div className="text-xs text-gray-500">{post.scheduled_date}</div>
                                    
                                    <div className="text-sm">
                                      <p className={`text-gray-700 ${!isExpanded ? 'line-clamp-2' : ''}`}>
                                        {post.copy?.main_text}
                                      </p>
                                    </div>
                                    
                                    {isExpanded && (
                                      <div className="space-y-3 pt-2 border-t border-gray-200">
                                        {post.copy?.call_to_action && (
                                          <div>
                                            <span className="text-xs font-semibold text-gray-800">CTA:</span>
                                            <p className="text-xs text-gray-700">{post.copy.call_to_action}</p>
                                          </div>
                                        )}
                                        
                                        {post.copy?.hashtags && (
                                          <div>
                                            <span className="text-xs font-semibold text-gray-800">Hashtag-uri:</span>
                                            <div className="flex flex-wrap gap-1 mt-1">
                                              {post.copy.hashtags.map((hashtag: string, hashIndex: number) => (
                                                <span key={hashIndex} className="px-1 py-0.5 bg-blue-100 text-blue-800 rounded text-xs">
                                                  {hashtag}
                                                </span>
                                              ))}
                                            </div>
                                          </div>
                                        )}
                                        
                                        {post.visual_brief && (
                                          <div>
                                            <span className="text-xs font-semibold text-gray-800">Brief vizual:</span>
                                            <div className="text-xs text-gray-700 space-y-1">
                                              <p><span className="font-medium">Tip:</span> {post.visual_brief.type}</p>
                                              <p><span className="font-medium">Dimensiuni:</span> {post.visual_brief.dimensions}</p>
                                              <p><span className="font-medium">Stil:</span> {post.visual_brief.style_guidelines}</p>
                                              {post.visual_brief.text_overlay && (
                                                <p><span className="font-medium">Text overlay:</span> {post.visual_brief.text_overlay}</p>
                                              )}
                                            </div>
                                          </div>
                                        )}
                                        
                                        {post.promotion_budget && (
                                          <div>
                                            <span className="text-xs font-semibold text-gray-800">Buget promovare:</span>
                                            <span className="text-xs text-gray-700 ml-1">{post.promotion_budget}</span>
                                          </div>
                                        )}
                                        
                                        {post.individual_metrics && (
                                          <div>
                                            <span className="text-xs font-semibold text-gray-800">Metrici țintă:</span>
                                            <div className="text-xs text-gray-700 grid grid-cols-2 gap-1 mt-1">
                                              <span>Reach: {post.individual_metrics.target_reach}</span>
                                              <span>Engagement: {post.individual_metrics.target_engagement}</span>
                                              <span>Click-uri: {post.individual_metrics.target_clicks}</span>
                                              <span>Conversii: {post.individual_metrics.target_conversions}</span>
                                            </div>
                                          </div>
                                        )}
                                      </div>
                                    )}
                                  </div>
                                </Card>
                              );
                            })}
                          </div>
                        ) : (
                          <p className="text-sm text-gray-500">Nu sunt postări planificate pentru această săptămână</p>
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
            <p className="text-gray-600">Toate postările și materialele generate</p>
          </div>
        </div>

        {plan.details?.tactical_plan_per_platform ? (
          <div className="space-y-8">
            {plan.details.tactical_plan_per_platform.map((platform: any, platformIndex: number) => (
              <Card 
                key={platformIndex}
                className={`border-l-4 ${getPlatformColor(platform.platform)}`}
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
                      <p className="text-xs text-gray-600">{platform.posting_frequency}</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white p-4 rounded-lg border border-gray-100 mb-4">
                  <h5 className="font-medium text-gray-800 mb-2">Strategia platformei:</h5>
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
                    <div className="mt-2">
                      <span className="font-medium text-gray-800 text-sm">Ore optime: </span>
                      <span className="text-gray-700 text-sm">{platform.optimal_posting_times.join(', ')}</span>
                    </div>
                  )}
                </div>
                
                {platform.editorial_calendar?.month_1 && (
                  <div>
                    <h5 className="font-medium text-gray-800 mb-3">Conținut generat:</h5>
                    <div className="space-y-4">
                      {platform.editorial_calendar.month_1.flatMap((week: any) => 
                        week.posts?.map((post: any, postIndex: number) => (
                          <Card key={`${week.week}-${postIndex}`} className="bg-gray-50" padding="sm">
                            <div className="space-y-3">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-2">
                                  <span className="text-xs font-medium text-gray-600">{post.post_id}</span>
                                  <span className="text-xs text-gray-500">Săptămâna {week.week}</span>
                                </div>
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  onClick={() => copyToClipboard(post.copy?.main_text || '', `content-${platformIndex}-${postIndex}`)}
                                  className="p-1 h-6 w-6"
                                >
                                  {copiedContentId === `content-${platformIndex}-${postIndex}` ? (
                                    <CheckSquare className="h-3 w-3 text-green-600" />
                                  ) : (
                                    <Copy className="h-3 w-3" />
                                  )}
                                </Button>
                              </div>
                              
                              <div className="bg-white p-3 rounded border border-gray-200">
                                <p className="text-sm text-gray-800 mb-2">{post.copy?.main_text}</p>
                                
                                {post.copy?.call_to_action && (
                                  <div className="flex items-center space-x-1 text-xs text-blue-600">
                                    <Zap className="h-3 w-3" />
                                    <span>{post.copy.call_to_action}</span>
                                  </div>
                                )}
                              </div>
                              
                              {post.copy?.hashtags && (
                                <div className="flex flex-wrap gap-1">
                                  {post.copy.hashtags.map((hashtag: string, hashIndex: number) => (
                                    <span key={hashIndex} className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                                      {hashtag}
                                    </span>
                                  ))}
                                </div>
                              )}
                              
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                                <div>
                                  <span className="font-semibold text-gray-800">Programat:</span>
                                  <p className="text-gray-600">{post.scheduled_date}</p>
                                </div>
                                {post.promotion_budget && (
                                  <div>
                                    <span className="font-semibold text-gray-800">Buget:</span>
                                    <p className="text-gray-600">{post.promotion_budget}</p>
                                  </div>
                                )}
                              </div>
                            </div>
                          </Card>
                        )) || []
                      )}
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
          </Card>
        )}
      </Card>
    </div>
  );

  const renderMetrics = () => (
    <div className="space-y-6">
      <Card className="shadow-lg" animation="slideInLeft">
        <div className="flex items-center space-x-3 mb-6">
          <div className="p-3 bg-orange-100 rounded-xl">
            <BarChart3 className="h-6 w-6 text-orange-600" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900">Metrici și ROI</h3>
            <p className="text-gray-600">Urmărirea performanței și proiecții</p>
          </div>
        </div>

        {plan.details?.kpis_smart ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
                  
                  <div className="mt-4 pt-4 border-t border-orange-200">
                    <div className="flex items-center justify-center space-x-2">
                      <TrendingUp className="h-4 w-4 text-green-600" />
                      <span className="text-xs text-green-600">Urmărire activă</span>
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
          <Card className="mt-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200" animation="fadeInUp">
            <div className="flex items-start space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <DollarSign className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Proiecții ROI</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div className="text-center p-3 bg-white rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">150-200%</div>
                    <div className="text-gray-600">ROI așteptat</div>
                  </div>
                  <div className="text-center p-3 bg-white rounded-lg">
                    <div className="text-2xl font-bold text-green-600">3-6 luni</div>
                    <div className="text-gray-600">Perioada de recuperare</div>
                  </div>
                  <div className="text-center p-3 bg-white rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">25-40%</div>
                    <div className="text-gray-600">Creștere vânzări</div>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        )}
      </Card>
    </div>
  );

  const renderMonitoring = () => (
    <div className="space-y-6">
      {/* Weekly Dashboard Metrics */}
      {plan.details?.monitoring_and_optimization?.weekly_dashboard_metrics && (
        <Card className="shadow-lg" animation="slideInLeft">
          <div className="flex items-center space-x-3 mb-6">
            <div className="p-3 bg-indigo-100 rounded-xl">
              <Activity className="h-6 w-6 text-indigo-600" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">Dashboard săptămânal</h3>
              <p className="text-gray-600">Metrici de urmărit săptămânal</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {plan.details.monitoring_and_optimization.weekly_dashboard_metrics.map((metric: any, index: number) => (
              <Card 
                key={index}
                className="bg-indigo-50 border-indigo-200"
                padding="md"
                animation="scaleIn"
                delay={index + 1}
              >
                <h4 className="font-semibold text-gray-900 mb-2">{metric.metric}</h4>
                <p className="text-sm text-gray-700 mb-3">{metric.description}</p>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Țintă:</span>
                    <span className="font-medium text-indigo-600">{metric.target_value}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Frecvență:</span>
                    <span className="font-medium">{metric.measurement_frequency}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Sursă:</span>
                    <span className="font-medium">{metric.data_source}</span>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </Card>
      )}

      {/* Performance Evaluation Schedule */}
      {plan.details?.monitoring_and_optimization?.performance_evaluation_schedule && (
        <Card className="shadow-lg" animation="slideInRight">
          <div className="flex items-center space-x-3 mb-6">
            <div className="p-2 bg-green-100 rounded-xl">
              <Clock className="h-6 w-6 text-green-600" />
            </div>
            <h3 className="text-lg font-bold text-gray-900">Programul de evaluare</h3>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {Object.entries(plan.details.monitoring_and_optimization.performance_evaluation_schedule).map(([period, details]: [string, any]) => (
              <Card key={period} className="bg-green-50 border-green-200" padding="md">
                <h4 className="font-bold text-gray-900 mb-3">
                  {period.replace('_', ' ').replace('day', ' zile')}
                </h4>
                
                <div className="space-y-3 text-sm">
                  <div>
                    <span className="font-semibold text-gray-800">Zone de focus:</span>
                    <ul className="mt-1 space-y-1">
                      {details.focus_areas?.map((area: string, index: number) => (
                        <li key={index} className="text-gray-700 flex items-start space-x-1">
                          <span className="w-1 h-1 bg-green-500 rounded-full mt-2 flex-shrink-0"></span>
                          <span>{area}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div>
                    <span className="font-semibold text-gray-800">Metrici cheie:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {details.key_metrics?.map((metric: string, index: number) => (
                        <span key={index} className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">
                          {metric}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <span className="font-semibold text-gray-800">Acțiuni:</span>
                    <ul className="mt-1 space-y-1">
                      {details.action_items?.map((action: string, index: number) => (
                        <li key={index} className="text-gray-700 flex items-start space-x-1">
                          <CheckCircle className="h-3 w-3 text-green-600 mt-0.5 flex-shrink-0" />
                          <span>{action}</span>
                        </li>
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
      {plan.details?.monitoring_and_optimization?.adjustment_recommendations && (
        <Card className="shadow-lg" animation="fadeInUp">
          <div className="flex items-center space-x-3 mb-6">
            <div className="p-2 bg-yellow-100 rounded-xl">
              <Lightbulb className="h-6 w-6 text-yellow-600" />
            </div>
            <h3 className="text-lg font-bold text-gray-900">Recomandări de ajustare</h3>
          </div>
          
          <div className="space-y-4">
            {plan.details.monitoring_and_optimization.adjustment_recommendations.map((rec: any, index: number) => (
              <Card key={index} className="bg-yellow-50 border-yellow-200" padding="md">
                <div className="space-y-3">
                  <div>
                    <span className="font-semibold text-gray-800">Condiția declanșatoare:</span>
                    <p className="text-gray-700 text-sm mt-1">{rec.trigger_condition}</p>
                  </div>
                  
                  <div>
                    <span className="font-semibold text-gray-800">Acțiunea recomandată:</span>
                    <p className="text-gray-700 text-sm mt-1">{rec.recommended_action}</p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                    <div>
                      <span className="font-semibold text-gray-800">Timeline implementare:</span>
                      <p className="text-gray-700">{rec.implementation_timeline}</p>
                    </div>
                    <div>
                      <span className="font-semibold text-gray-800">Impact așteptat:</span>
                      <p className="text-gray-700">{rec.expected_impact}</p>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </Card>
      )}

      {/* Dedicated Responsibilities */}
      {plan.details?.monitoring_and_optimization?.dedicated_responsibilities && (
        <Card className="shadow-lg" animation="slideInLeft">
          <div className="flex items-center space-x-3 mb-6">
            <div className="p-2 bg-purple-100 rounded-xl">
              <Users className="h-6 w-6 text-purple-600" />
            </div>
            <h3 className="text-lg font-bold text-gray-900">Responsabilități dedicate</h3>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {plan.details.monitoring_and_optimization.dedicated_responsibilities.map((role: any, index: number) => (
              <Card key={index} className="bg-purple-50 border-purple-200" padding="md">
                <h4 className="font-bold text-gray-900 mb-3">{role.role}</h4>
                
                <div className="space-y-3 text-sm">
                  <div>
                    <span className="font-semibold text-gray-800">Responsabilități:</span>
                    <ul className="mt-1 space-y-1">
                      {role.responsibilities?.map((resp: string, respIndex: number) => (
                        <li key={respIndex} className="text-gray-700 flex items-start space-x-1">
                          <span className="w-1 h-1 bg-purple-500 rounded-full mt-2 flex-shrink-0"></span>
                          <span>{resp}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <span className="font-semibold text-gray-800">Timp alocat:</span>
                      <p className="text-gray-700">{role.time_allocation}</p>
                    </div>
                    <div>
                      <span className="font-semibold text-gray-800">Abilități necesare:</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {role.required_skills?.map((skill: string, skillIndex: number) => (
                          <span key={skillIndex} className="px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-xs">
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </Card>
      )}
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
              {plan.details?.plan_type === 'digital_marketing_complete' && (
                <div className="flex items-center space-x-2 mt-1">
                  <Sparkles className="h-4 w-4 text-green-600" />
                  <span className="text-sm text-green-600 font-medium">Plan Digital Complet</span>
                </div>
              )}
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
        {activeTab === 'strategy' && renderStrategy()}
        {activeTab === 'calendar' && renderCalendar()}
        {activeTab === 'content' && renderContent()}
        {activeTab === 'metrics' && renderMetrics()}
        {activeTab === 'monitoring' && renderMonitoring()}
      </div>
    </div>
  );
};