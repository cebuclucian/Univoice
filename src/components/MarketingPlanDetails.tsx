import React, { useState, useRef } from 'react';
import { 
  Calendar, Target, Users, TrendingUp, BarChart3, Clock, 
  CheckCircle, ArrowLeft, Edit3, Share2, Download, Brain,
  Lightbulb, Zap, MessageSquare, Instagram, Facebook, 
  Twitter, Mail, Globe, Youtube, Music, Monitor, Copy,
  CheckSquare, AlertCircle, Info, Clipboard, FileText,
  Eye, EyeOff, ChevronDown, ChevronUp, Star, Award,
  DollarSign, Percent, Activity, Megaphone, Settings,
  PieChart, LineChart, BarChart, TrendingDown, Plus,
  Minus, RefreshCw, Bell, Flag, Shield, Bookmark
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
  const [expandedWeeks, setExpandedWeeks] = useState<Set<number>>(new Set());
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

  const toggleWeekExpansion = (weekNumber: number) => {
    const newExpanded = new Set(expandedWeeks);
    if (newExpanded.has(weekNumber)) {
      newExpanded.delete(weekNumber);
    } else {
      newExpanded.add(weekNumber);
    }
    setExpandedWeeks(newExpanded);
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
        text += `   Responsabil: ${kpi.responsible}\n`;
        text += `   Perioada: ${kpi.timeframe}\n\n`;
      });
    }
    
    // Buyer Personas
    if (details?.buyer_personas) {
      text += 'BUYER PERSONAS:\n';
      details.buyer_personas.forEach((persona: any, i: number) => {
        text += `${i+1}. ${persona.name}\n`;
        text += `   Vârstă: ${persona.demographics?.age_range}\n`;
        text += `   Locație: ${persona.demographics?.location}\n`;
        text += `   Ocupație: ${persona.demographics?.occupation}\n`;
        text += `   Interese: ${persona.psychographics?.interests?.join(', ')}\n`;
        text += `   Platforme preferate: ${persona.digital_behavior?.preferred_platforms?.join(', ')}\n\n`;
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
                text += `Copy: ${post.copy?.main_text}\n`;
                text += `CTA: ${post.copy?.call_to_action}\n`;
                text += `Hashtags: ${post.copy?.hashtags?.join(' ')}\n`;
                text += `Buget promovare: ${post.promotion_budget}\n\n`;
              });
            }
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
              <Shield className="h-6 w-6 text-indigo-600" />
            </div>
            <h3 className="text-lg font-bold text-gray-900">Identitatea și vocea brandului</h3>
          </div>
          
          <div className="space-y-4">
            <div>
              <h4 className="font-semibold text-gray-800 mb-2">Identitatea brandului:</h4>
              <p className="text-gray-700">{plan.details.identity_and_voice.brand_identity}</p>
            </div>
            
            <div>
              <h4 className="font-semibold text-gray-800 mb-2">Poziționarea:</h4>
              <p className="text-gray-700">{plan.details.identity_and_voice.brand_positioning}</p>
            </div>
            
            {plan.details.identity_and_voice.voice_characteristics && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold text-gray-800 mb-2">Caracteristicile vocii:</h4>
                  <ul className="space-y-1 text-sm">
                    <li><span className="font-medium">Ton:</span> {plan.details.identity_and_voice.voice_characteristics.tone}</li>
                    <li><span className="font-medium">Personalitate:</span> {plan.details.identity_and_voice.voice_characteristics.personality}</li>
                    <li><span className="font-medium">Stil:</span> {plan.details.identity_and_voice.voice_characteristics.communication_style}</li>
                  </ul>
                </div>
                
                <div>
                  <h4 className="font-semibold text-gray-800 mb-2">Valorile brandului:</h4>
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
              <Card key={index} className="bg-green-50 border-green-200" padding="md">
                <h4 className="font-bold text-gray-900 mb-4">{persona.name}</h4>
                
                <div className="space-y-3 text-sm">
                  <div>
                    <h5 className="font-semibold text-gray-800 mb-1">Demografia:</h5>
                    <ul className="space-y-1 text-gray-700">
                      <li>Vârstă: {persona.demographics?.age_range}</li>
                      <li>Gen: {persona.demographics?.gender}</li>
                      <li>Locație: {persona.demographics?.location}</li>
                      <li>Venit: {persona.demographics?.income}</li>
                      <li>Educație: {persona.demographics?.education}</li>
                      <li>Ocupație: {persona.demographics?.occupation}</li>
                    </ul>
                  </div>
                  
                  <div>
                    <h5 className="font-semibold text-gray-800 mb-1">Psihografia:</h5>
                    <div className="space-y-1">
                      <div>
                        <span className="font-medium">Interese:</span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {persona.psychographics?.interests?.map((interest: string, i: number) => (
                            <span key={i} className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                              {interest}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div>
                        <span className="font-medium">Valori:</span>
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
                    <h5 className="font-semibold text-gray-800 mb-1">Comportament digital:</h5>
                    <ul className="space-y-1 text-gray-700">
                      <li>Platforme preferate: {persona.digital_behavior?.preferred_platforms?.join(', ')}</li>
                      <li>Timp online: {persona.digital_behavior?.online_activity_time}</li>
                      <li>Preferințe conținut: {persona.digital_behavior?.content_preferences?.join(', ')}</li>
                    </ul>
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
            <div className="p-2 bg-orange-100 rounded-xl">
              <Megaphone className="h-6 w-6 text-orange-600" />
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
                      <p>Suprapunere audiență: {platform.audience_overlap}</p>
                      <p>ROI așteptat: {platform.expected_roi}</p>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold text-gray-800 mb-3">Platforme excluse:</h4>
              <div className="space-y-2">
                {plan.details.platform_selection_justification.excluded_platforms?.map((platform: any, index: number) => (
                  <Card key={index} className="bg-gray-50 border-gray-200" padding="sm">
                    <h5 className="font-semibold text-gray-900 text-sm">{platform.platform}</h5>
                    <p className="text-xs text-gray-600">{platform.reason}</p>
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
              <p className="text-gray-600">Indicatori cheie de performanță măsurabili</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {plan.details.kpis_smart.map((kpi: any, index: number) => (
              <Card key={index} className="bg-green-50 border-green-200" padding="md" hover="subtle">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-bold text-gray-900">{kpi.name}</h4>
                  <div className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
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
                    <p className="text-gray-600">{kpi.timeframe}</p>
                  </div>
                </div>
                
                {/* SMART Analysis */}
                <div className="mt-4 pt-4 border-t border-green-200">
                  <h5 className="font-semibold text-gray-800 mb-2 text-sm">Analiza SMART:</h5>
                  <div className="space-y-1 text-xs">
                    <div><span className="font-medium text-green-700">S</span>pecific: {kpi.specific}</div>
                    <div><span className="font-medium text-green-700">M</span>ăsurabil: {kpi.measurable}</div>
                    <div><span className="font-medium text-green-700">A</span>realizabil: {kpi.achievable}</div>
                    <div><span className="font-medium text-green-700">R</span>elevant: {kpi.relevant}</div>
                    <div><span className="font-medium text-green-700">T</span>ime-bound: {kpi.time_bound}</div>
                  </div>
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
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold text-gray-800 mb-3">Distribuția pe canale:</h4>
              <div className="space-y-3">
                {plan.details.budget_allocation_summary.allocation_by_channel?.map((channel: any, index: number) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                    <div>
                      <h5 className="font-semibold text-gray-900">{channel.channel}</h5>
                      <p className="text-xs text-gray-600">{channel.justification}</p>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-blue-600">{channel.percentage}</div>
                      <div className="text-sm text-gray-600">{channel.amount}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold text-gray-800 mb-3">Distribuția pe tipuri de activități:</h4>
              <div className="space-y-2">
                {Object.entries(plan.details.budget_allocation_summary.allocation_by_type || {}).map(([type, percentage]) => (
                  <div key={type} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <span className="text-sm text-gray-700 capitalize">{type.replace('_', ' ')}</span>
                    <span className="font-semibold text-gray-900">{percentage}</span>
                  </div>
                ))}
              </div>
              
              <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-gray-800">Buget total:</span>
                  <span className="font-bold text-blue-600">{plan.details.budget_allocation_summary.total_budget}</span>
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
                  
                  <div className="text-right text-sm">
                    <p className="text-gray-600">Ore optime:</p>
                    <p className="font-semibold">{platform.optimal_posting_times?.join(', ')}</p>
                  </div>
                </div>
                
                <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                  <h5 className="font-semibold text-gray-800 mb-2">Strategia platformei:</h5>
                  <p className="text-sm text-gray-700">{platform.strategy}</p>
                  <div className="mt-2">
                    <span className="text-sm font-medium text-gray-800">Tipuri de conținut: </span>
                    <span className="text-sm text-gray-600">{platform.content_types?.join(', ')}</span>
                  </div>
                </div>

                {/* Editorial Calendar */}
                {platform.editorial_calendar?.month_1 && (
                  <div className="space-y-4">
                    <h5 className="font-semibold text-gray-800">Calendar editorial - Luna 1:</h5>
                    
                    {platform.editorial_calendar.month_1.map((week: any, weekIndex: number) => (
                      <Card key={weekIndex} className="bg-gray-50" padding="sm">
                        <div className="flex items-center justify-between mb-3">
                          <h6 className="font-semibold text-gray-900">Săptămâna {week.week}</h6>
                          <div className="flex items-center space-x-2">
                            <span className="text-sm text-gray-600">{week.posts?.length || 0} postări</span>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => toggleWeekExpansion(weekIndex)}
                              className="p-1"
                            >
                              {expandedWeeks.has(weekIndex) ? 
                                <ChevronUp className="h-4 w-4" /> : 
                                <ChevronDown className="h-4 w-4" />
                              }
                            </Button>
                          </div>
                        </div>
                        
                        {expandedWeeks.has(weekIndex) && week.posts && (
                          <div className="space-y-3">
                            {week.posts.map((post: any, postIndex: number) => (
                              <Card key={postIndex} className="bg-white border" padding="sm">
                                <div className="flex items-center justify-between mb-2">
                                  <div className="flex items-center space-x-2">
                                    <span className="text-xs font-medium text-gray-600">{post.post_id}</span>
                                    <span className="text-xs text-gray-500">{post.scheduled_date}</span>
                                  </div>
                                  <div className="flex items-center space-x-1">
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => copyToClipboard(post.copy?.main_text || '', `post-${platformIndex}-${weekIndex}-${postIndex}`)}
                                      className="p-1"
                                    >
                                      {copiedContentId === `post-${platformIndex}-${weekIndex}-${postIndex}` ? (
                                        <CheckSquare className="h-3 w-3 text-green-600" />
                                      ) : (
                                        <Copy className="h-3 w-3" />
                                      )}
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => togglePostExpansion(`${platformIndex}-${weekIndex}-${postIndex}`)}
                                      className="p-1"
                                    >
                                      {expandedPosts.has(`${platformIndex}-${weekIndex}-${postIndex}`) ? 
                                        <EyeOff className="h-3 w-3" /> : 
                                        <Eye className="h-3 w-3" />
                                      }
                                    </Button>
                                  </div>
                                </div>
                                
                                <div className="space-y-2">
                                  <div className="bg-blue-50 p-2 rounded text-sm">
                                    <span className="font-medium text-blue-900">Copy:</span>
                                    <p className="text-blue-800 mt-1">
                                      {expandedPosts.has(`${platformIndex}-${weekIndex}-${postIndex}`) 
                                        ? post.copy?.main_text 
                                        : `${post.copy?.main_text?.substring(0, 100)}...`
                                      }
                                    </p>
                                  </div>
                                  
                                  {post.copy?.call_to_action && (
                                    <div className="bg-green-50 p-2 rounded text-sm">
                                      <span className="font-medium text-green-900">CTA:</span>
                                      <p className="text-green-800">{post.copy.call_to_action}</p>
                                    </div>
                                  )}
                                  
                                  {post.copy?.hashtags && (
                                    <div className="flex flex-wrap gap-1">
                                      {post.copy.hashtags.map((hashtag: string, hashIndex: number) => (
                                        <span key={hashIndex} className="px-2 py-1 bg-purple-100 text-purple-800 rounded text-xs">
                                          {hashtag}
                                        </span>
                                      ))}
                                    </div>
                                  )}
                                  
                                  {expandedPosts.has(`${platformIndex}-${weekIndex}-${postIndex}`) && (
                                    <>
                                      {/* Visual Brief */}
                                      {post.visual_brief && (
                                        <div className="bg-yellow-50 p-3 rounded">
                                          <h6 className="font-semibold text-yellow-900 mb-2">Brief vizual:</h6>
                                          <div className="text-sm space-y-1">
                                            <p><span className="font-medium">Tip:</span> {post.visual_brief.type}</p>
                                            <p><span className="font-medium">Dimensiuni:</span> {post.visual_brief.dimensions}</p>
                                            <p><span className="font-medium">Stil:</span> {post.visual_brief.style_guidelines}</p>
                                            <p><span className="font-medium">Elemente obligatorii:</span> {post.visual_brief.mandatory_elements?.join(', ')}</p>
                                            <p><span className="font-medium">Paletă culori:</span> {post.visual_brief.color_palette?.join(', ')}</p>
                                            {post.visual_brief.text_overlay && (
                                              <p><span className="font-medium">Text overlay:</span> {post.visual_brief.text_overlay}</p>
                                            )}
                                          </div>
                                        </div>
                                      )}
                                      
                                      {/* Promotion Details */}
                                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        <div className="bg-orange-50 p-2 rounded text-sm">
                                          <span className="font-medium text-orange-900">Buget promovare:</span>
                                          <p className="text-orange-800">{post.promotion_budget}</p>
                                        </div>
                                        
                                        {post.individual_metrics && (
                                          <div className="bg-indigo-50 p-2 rounded text-sm">
                                            <span className="font-medium text-indigo-900">Metrici țintă:</span>
                                            <div className="text-indigo-800 text-xs mt-1">
                                              <p>Reach: {post.individual_metrics.target_reach}</p>
                                              <p>Engagement: {post.individual_metrics.target_engagement}</p>
                                              <p>Click-uri: {post.individual_metrics.target_clicks}</p>
                                            </div>
                                          </div>
                                        )}
                                      </div>
                                    </>
                                  )}
                                </div>
                              </Card>
                            ))}
                          </div>
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
                      const allPosts = platform.editorial_calendar?.month_1?.flatMap((week: any) => 
                        week.posts?.map((post: any) => 
                          `${post.scheduled_date}\n${post.copy?.main_text}\n${post.copy?.call_to_action}\n${post.copy?.hashtags?.join(' ')}\n---\n`
                        ).join('\n') || ''
                      ).join('\n') || '';
                      copyToClipboard(allPosts, `platform-all-${platformIndex}`);
                    }}
                    className="flex items-center space-x-1"
                  >
                    {copiedContentId === `platform-all-${platformIndex}` ? (
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
                
                <div className="bg-white p-4 rounded-lg border border-gray-100 mb-4">
                  <h5 className="font-medium text-gray-800 mb-2">Strategia platformei:</h5>
                  <p className="text-gray-700 text-sm">{platform.strategy}</p>
                  <div className="mt-2 text-sm">
                    <span className="font-medium text-gray-800">Tipuri de conținut: </span>
                    <span className="text-gray-600">{platform.content_types?.join(', ')}</span>
                  </div>
                </div>
                
                {platform.editorial_calendar?.month_1 && (
                  <div className="space-y-4">
                    <h5 className="font-medium text-gray-800">Toate postările generate:</h5>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {platform.editorial_calendar.month_1
                        .flatMap((week: any) => week.posts || [])
                        .map((post: any, postIndex: number) => (
                          <Card 
                            key={postIndex}
                            className="bg-gray-50"
                            padding="sm"
                            hover="subtle"
                          >
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-xs font-medium text-gray-700">{post.post_id}</span>
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => copyToClipboard(
                                  `${post.copy?.main_text}\n\n${post.copy?.call_to_action}\n\n${post.copy?.hashtags?.join(' ')}`, 
                                  `content-${platformIndex}-${postIndex}`
                                )}
                                className="p-1 h-6 w-6"
                              >
                                {copiedContentId === `content-${platformIndex}-${postIndex}` ? (
                                  <CheckSquare className="h-3 w-3 text-green-600" />
                                ) : (
                                  <Copy className="h-3 w-3" />
                                )}
                              </Button>
                            </div>
                            
                            <div className="space-y-2">
                              <div className="bg-white p-2 rounded border">
                                <p className="text-sm text-gray-800 font-medium mb-1">Copy principal:</p>
                                <p className="text-xs text-gray-700 line-clamp-3">{post.copy?.main_text}</p>
                              </div>
                              
                              {post.copy?.call_to_action && (
                                <div className="bg-green-50 p-2 rounded border border-green-200">
                                  <p className="text-xs font-medium text-green-800">CTA: {post.copy.call_to_action}</p>
                                </div>
                              )}
                              
                              {post.copy?.hashtags && (
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
                              
                              <div className="text-xs text-gray-500 pt-1 border-t">
                                <p>📅 {post.scheduled_date}</p>
                                {post.promotion_budget && <p>💰 {post.promotion_budget}</p>}
                              </div>
                            </div>
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
            <p className="text-gray-600">Urmărirea performanței și calculul ROI</p>
          </div>
        </div>

        {/* ROI Projections */}
        <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-green-200 mb-6" animation="scaleIn">
          <div className="flex items-center space-x-3 mb-4">
            <TrendingUp className="h-6 w-6 text-green-600" />
            <h4 className="font-semibold text-gray-900">Proiecții ROI</h4>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-white rounded-lg">
              <div className="text-2xl font-bold text-green-600">150-200%</div>
              <div className="text-sm text-gray-600">ROI așteptat</div>
            </div>
            <div className="text-center p-4 bg-white rounded-lg">
              <div className="text-2xl font-bold text-blue-600">3-6 luni</div>
              <div className="text-sm text-gray-600">Perioada de recuperare</div>
            </div>
            <div className="text-center p-4 bg-white rounded-lg">
              <div className="text-2xl font-bold text-purple-600">25-40%</div>
              <div className="text-sm text-gray-600">Creștere vânzări</div>
            </div>
          </div>
        </Card>

        {/* Platform Performance Metrics */}
        {plan.details?.tactical_plan_per_platform && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {plan.details.tactical_plan_per_platform.map((platform: any, index: number) => (
              <Card key={index} className="bg-gray-50" padding="md" hover="subtle">
                <div className="flex items-center space-x-3 mb-4">
                  <div className={`p-2 rounded-lg ${getPlatformColor(platform.platform)}`}>
                    {getPlatformIcon(platform.platform)}
                  </div>
                  <h4 className="font-semibold text-gray-900">{platform.platform}</h4>
                </div>
                
                <div className="space-y-3">
                  {platform.editorial_calendar?.month_1?.[0]?.posts?.[0]?.individual_metrics && (
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-white p-3 rounded">
                        <div className="text-lg font-bold text-blue-600">
                          {platform.editorial_calendar.month_1[0].posts[0].individual_metrics.target_reach}
                        </div>
                        <div className="text-xs text-gray-600">Reach țintă</div>
                      </div>
                      <div className="bg-white p-3 rounded">
                        <div className="text-lg font-bold text-green-600">
                          {platform.editorial_calendar.month_1[0].posts[0].individual_metrics.target_engagement}
                        </div>
                        <div className="text-xs text-gray-600">Engagement țintă</div>
                      </div>
                      <div className="bg-white p-3 rounded">
                        <div className="text-lg font-bold text-purple-600">
                          {platform.editorial_calendar.month_1[0].posts[0].individual_metrics.target_clicks}
                        </div>
                        <div className="text-xs text-gray-600">Click-uri țintă</div>
                      </div>
                      <div className="bg-white p-3 rounded">
                        <div className="text-lg font-bold text-orange-600">
                          {platform.editorial_calendar.month_1[0].posts[0].individual_metrics.target_conversions}
                        </div>
                        <div className="text-xs text-gray-600">Conversii țintă</div>
                      </div>
                    </div>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* KPI Tracking */}
        {plan.details?.kpis_smart && (
          <Card className="mt-6 bg-blue-50 border-blue-200" animation="fadeInUp">
            <div className="flex items-center space-x-3 mb-4">
              <Activity className="h-6 w-6 text-blue-600" />
              <h4 className="font-semibold text-gray-900">Urmărirea KPI-urilor</h4>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {plan.details.kpis_smart.slice(0, 6).map((kpi: any, index: number) => (
                <div key={index} className="bg-white p-4 rounded-lg">
                  <h5 className="font-semibold text-gray-900 mb-2">{kpi.name}</h5>
                  <div className="text-2xl font-bold text-blue-600 mb-1">{kpi.target_value}</div>
                  <div className="text-sm text-gray-600">{kpi.measurement_method}</div>
                  
                  {/* Progress simulation */}
                  <div className="mt-3">
                    <div className="flex justify-between text-xs text-gray-600 mb-1">
                      <span>Progres</span>
                      <span>{Math.floor(Math.random() * 40 + 10)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${Math.floor(Math.random() * 40 + 10)}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* ROI Calculation Methodology */}
        <Card className="mt-6 bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200" animation="fadeInUp">
          <div className="flex items-start space-x-3">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Lightbulb className="h-5 w-5 text-yellow-600" />
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Metodologia de calculare ROI</h4>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                  <span className="text-gray-700">ROI = (Venituri generate - Investiția în marketing) / Investiția în marketing × 100</span>
                </li>
                <li className="flex items-start space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                  <span className="text-gray-700">Urmărirea conversiilor prin Google Analytics și pixel-uri de tracking</span>
                </li>
                <li className="flex items-start space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                  <span className="text-gray-700">Atribuirea multi-touch pentru o măsurare precisă a impactului fiecărui canal</span>
                </li>
                <li className="flex items-start space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                  <span className="text-gray-700">Raportare lunară cu analiza detaliată a performanței pe fiecare platformă</span>
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

        {/* Weekly Dashboard Metrics */}
        {plan.details?.monitoring_and_optimization?.weekly_dashboard_metrics && (
          <Card className="bg-indigo-50 border-indigo-200 mb-6" animation="scaleIn">
            <div className="flex items-center space-x-3 mb-4">
              <BarChart className="h-6 w-6 text-indigo-600" />
              <h4 className="font-semibold text-gray-900">Dashboard săptămânal</h4>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {plan.details.monitoring_and_optimization.weekly_dashboard_metrics.map((metric: any, index: number) => (
                <div key={index} className="bg-white p-4 rounded-lg">
                  <h5 className="font-semibold text-gray-900 mb-2">{metric.metric}</h5>
                  <p className="text-sm text-gray-700 mb-2">{metric.description}</p>
                  <div className="text-lg font-bold text-indigo-600">{metric.target_value}</div>
                  <div className="text-xs text-gray-600 mt-1">
                    <p>Frecvență: {metric.measurement_frequency}</p>
                    <p>Sursă: {metric.data_source}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Performance Evaluation Schedule */}
        {plan.details?.monitoring_and_optimization?.performance_evaluation_schedule && (
          <Card className="bg-green-50 border-green-200 mb-6" animation="slideInRight">
            <div className="flex items-center space-x-3 mb-4">
              <Calendar className="h-6 w-6 text-green-600" />
              <h4 className="font-semibold text-gray-900">Programul de evaluare</h4>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {Object.entries(plan.details.monitoring_and_optimization.performance_evaluation_schedule).map(([period, details]: [string, any]) => (
                <div key={period} className="bg-white p-4 rounded-lg">
                  <h5 className="font-semibold text-gray-900 mb-3">
                    {period.replace('_', ' ').replace('day', ' zile')}
                  </h5>
                  
                  <div className="space-y-3 text-sm">
                    <div>
                      <h6 className="font-medium text-gray-800">Zone de focus:</h6>
                      <ul className="list-disc list-inside text-gray-700">
                        {details.focus_areas?.map((area: string, index: number) => (
                          <li key={index}>{area}</li>
                        ))}
                      </ul>
                    </div>
                    
                    <div>
                      <h6 className="font-medium text-gray-800">Metrici cheie:</h6>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {details.key_metrics?.map((metric: string, index: number) => (
                          <span key={index} className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs">
                            {metric}
                          </span>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <h6 className="font-medium text-gray-800">Acțiuni:</h6>
                      <ul className="list-disc list-inside text-gray-700">
                        {details.action_items?.map((action: string, index: number) => (
                          <li key={index}>{action}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Adjustment Recommendations */}
        {plan.details?.monitoring_and_optimization?.adjustment_recommendations && (
          <Card className="bg-yellow-50 border-yellow-200 mb-6" animation="fadeInUp">
            <div className="flex items-center space-x-3 mb-4">
              <RefreshCw className="h-6 w-6 text-yellow-600" />
              <h4 className="font-semibold text-gray-900">Recomandări de ajustare</h4>
            </div>
            
            <div className="space-y-4">
              {plan.details.monitoring_and_optimization.adjustment_recommendations.map((recommendation: any, index: number) => (
                <div key={index} className="bg-white p-4 rounded-lg border-l-4 border-yellow-400">
                  <div className="flex items-start justify-between mb-2">
                    <h5 className="font-semibold text-gray-900">Condiția declanșatoare:</h5>
                    <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded text-xs">
                      Auto-trigger
                    </span>
                  </div>
                  <p className="text-sm text-gray-700 mb-3">{recommendation.trigger_condition}</p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <h6 className="font-medium text-gray-800">Acțiunea recomandată:</h6>
                      <p className="text-gray-700">{recommendation.recommended_action}</p>
                    </div>
                    <div>
                      <h6 className="font-medium text-gray-800">Timeline implementare:</h6>
                      <p className="text-gray-700">{recommendation.implementation_timeline}</p>
                    </div>
                  </div>
                  
                  <div className="mt-3 p-2 bg-green-50 rounded">
                    <h6 className="font-medium text-green-800 text-sm">Impact așteptat:</h6>
                    <p className="text-green-700 text-sm">{recommendation.expected_impact}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Dedicated Responsibilities */}
        {plan.details?.monitoring_and_optimization?.dedicated_responsibilities && (
          <Card className="bg-purple-50 border-purple-200" animation="slideInLeft">
            <div className="flex items-center space-x-3 mb-4">
              <Users className="h-6 w-6 text-purple-600" />
              <h4 className="font-semibold text-gray-900">Responsabilități dedicate</h4>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {plan.details.monitoring_and_optimization.dedicated_responsibilities.map((role: any, index: number) => (
                <div key={index} className="bg-white p-4 rounded-lg">
                  <div className="flex items-center space-x-2 mb-3">
                    <div className="p-2 bg-purple-100 rounded">
                      <Settings className="h-4 w-4 text-purple-600" />
                    </div>
                    <h5 className="font-semibold text-gray-900">{role.role}</h5>
                  </div>
                  
                  <div className="space-y-3 text-sm">
                    <div>
                      <h6 className="font-medium text-gray-800">Responsabilități:</h6>
                      <ul className="list-disc list-inside text-gray-700">
                        {role.responsibilities?.map((responsibility: string, index: number) => (
                          <li key={index}>{responsibility}</li>
                        ))}
                      </ul>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <h6 className="font-medium text-gray-800">Alocare timp:</h6>
                        <p className="text-gray-700">{role.time_allocation}</p>
                      </div>
                      <div>
                        <h6 className="font-medium text-gray-800">Abilități necesare:</h6>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {role.required_skills?.slice(0, 2).map((skill: string, index: number) => (
                            <span key={index} className="px-1 py-0.5 bg-purple-100 text-purple-800 rounded text-xs">
                              {skill}
                            </span>
                          ))}
                          {role.required_skills?.length > 2 && (
                            <span className="px-1 py-0.5 bg-gray-100 text-gray-600 rounded text-xs">
                              +{role.required_skills.length - 2}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Monitoring Tools Recommendation */}
        <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200" animation="fadeInUp">
          <div className="flex items-start space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Monitor className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Unelte de monitorizare recomandate</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <h5 className="font-medium text-gray-800 mb-2">Analytics și tracking:</h5>
                  <ul className="space-y-1 text-gray-700">
                    <li>• Google Analytics 4</li>
                    <li>• Facebook Pixel</li>
                    <li>• Google Tag Manager</li>
                    <li>• Hotjar pentru heatmaps</li>
                  </ul>
                </div>
                <div>
                  <h5 className="font-medium text-gray-800 mb-2">Social media monitoring:</h5>
                  <ul className="space-y-1 text-gray-700">
                    <li>• Hootsuite Analytics</li>
                    <li>• Sprout Social</li>
                    <li>• Buffer Analytics</li>
                    <li>• Native platform insights</li>
                  </ul>
                </div>
              </div>
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