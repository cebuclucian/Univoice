import React, { useState, useRef } from 'react';
import { 
  Calendar, Target, Users, TrendingUp, BarChart3, Clock, 
  CheckCircle, ArrowLeft, Edit3, Share2, Download, Brain,
  Lightbulb, Zap, MessageSquare, Instagram, Facebook, 
  Twitter, Mail, Globe, Youtube, Music, Monitor, Copy,
  CheckSquare, AlertCircle, Info, Clipboard, FileText,
  Star, Award, DollarSign, Eye, Heart, MousePointer,
  Megaphone, PieChart, Activity, Settings, Shield
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
  const [activeTab, setActiveTab] = useState<'overview' | 'strategy' | 'calendar' | 'content' | 'analytics' | 'monitoring'>('overview');
  const [copiedContentId, setCopiedContentId] = useState<string | null>(null);
  const [showExportOptions, setShowExportOptions] = useState(false);
  const [exportFormat, setExportFormat] = useState<'json' | 'text' | 'calendar'>('text');
  const [showShareOptions, setShowShareOptions] = useState(false);
  const [expandedPost, setExpandedPost] = useState<string | null>(null);
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
    { id: 'analytics', name: 'Metrici & ROI', icon: BarChart3 },
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
    text += `Creat pe: ${createdDate}\n`;
    text += `Data livrare: ${details?.delivery_date || 'N/A'}\n\n`;
    
    // Summary
    text += `REZUMAT EXECUTIV:\n${details?.summary || 'N/A'}\n\n`;
    
    // Brand Voice Used
    if (details?.brand_voice_used) {
      text += 'VOCEA BRANDULUI FOLOSITĂ:\n';
      text += `Personalitate: ${Array.isArray(details.brand_voice_used.personality) ? details.brand_voice_used.personality.join(', ') : details.brand_voice_used.personality}\n`;
      text += `Ton: ${Array.isArray(details.brand_voice_used.tone) ? details.brand_voice_used.tone.join(', ') : details.brand_voice_used.tone}\n`;
      text += `Timestamp: ${details.brand_voice_used.timestamp}\n\n`;
    }
    
    // Identity and Voice
    if (details?.identity_and_voice) {
      text += 'IDENTITATEA ȘI VOCEA BRANDULUI:\n';
      text += `Identitate: ${details.identity_and_voice.brand_identity}\n`;
      text += `Poziționare: ${details.identity_and_voice.brand_positioning}\n\n`;
    }
    
    // KPIs SMART
    if (details?.kpis_smart) {
      text += 'KPI-URI SMART:\n';
      details.kpis_smart.forEach((kpi: any, i: number) => {
        text += `${i+1}. ${kpi.name}\n`;
        text += `   Descriere: ${kpi.description}\n`;
        text += `   Țintă: ${kpi.target_value}\n`;
        text += `   Măsurare: ${kpi.measurement_method}\n`;
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
        text += `   Interese: ${persona.psychographics?.interests?.join(', ')}\n`;
        text += `   Platforme preferate: ${persona.digital_behavior?.preferred_platforms?.join(', ')}\n\n`;
      });
    }
    
    // Budget Allocation
    if (details?.budget_allocation_summary) {
      text += 'ALOCAREA BUGETULUI:\n';
      text += `Buget total: ${details.budget_allocation_summary.total_budget}\n`;
      if (details.budget_allocation_summary.allocation_by_channel) {
        text += 'Alocare pe canale:\n';
        details.budget_allocation_summary.allocation_by_channel.forEach((channel: any) => {
          text += `- ${channel.channel}: ${channel.percentage} (${channel.amount})\n`;
        });
      }
      text += '\n';
    }
    
    // Tactical Plan Per Platform
    if (details?.tactical_plan_per_platform) {
      text += 'PLANUL TACTIC PE PLATFORME:\n';
      details.tactical_plan_per_platform.forEach((platform: any, i: number) => {
        text += `${i+1}. ${platform.platform}\n`;
        text += `   Strategie: ${platform.strategy}\n`;
        text += `   Tipuri conținut: ${platform.content_types?.join(', ')}\n`;
        text += `   Frecvență: ${platform.posting_frequency}\n`;
        text += `   Ore optime: ${platform.optimal_posting_times?.join(', ')}\n\n`;
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
                text += `ID: ${post.post_id}\n`;
                text += `Data: ${post.scheduled_date}\n`;
                text += `Conținut: ${post.copy?.main_text}\n`;
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
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
              <div className="flex items-center space-x-2">
                <Calendar className="h-5 w-5 text-green-600" />
                <span className="font-semibold text-green-900">Data livrare: {plan.details.delivery_date}</span>
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
              <h4 className="font-semibold text-gray-800 mb-2">Poziționarea brandului:</h4>
              <p className="text-gray-700">{plan.details.identity_and_voice.brand_positioning}</p>
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
                  {plan.details.identity_and_voice.voice_characteristics.values && (
                    <div className="md:col-span-2">
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
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Buyer Personas */}
      {plan.details?.buyer_personas && (
        <Card className="shadow-lg" animation="slideInRight" hover="subtle">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-2 bg-blue-100 rounded-xl">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
            <h3 className="text-lg font-bold text-gray-900">Buyer Personas</h3>
          </div>
          
          <div className="space-y-6">
            {plan.details.buyer_personas.map((persona: any, index: number) => (
              <Card key={index} className="bg-blue-50 border-blue-200" padding="md">
                <h4 className="font-semibold text-gray-900 mb-3">{persona.name}</h4>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <h5 className="font-medium text-gray-800 mb-2">Demografia:</h5>
                    <ul className="space-y-1 text-gray-600">
                      <li>Vârstă: {persona.demographics?.age_range}</li>
                      <li>Gen: {persona.demographics?.gender}</li>
                      <li>Locație: {persona.demographics?.location}</li>
                      <li>Venit: {persona.demographics?.income}</li>
                      <li>Educație: {persona.demographics?.education}</li>
                    </ul>
                  </div>
                  
                  <div>
                    <h5 className="font-medium text-gray-800 mb-2">Psihografia:</h5>
                    <ul className="space-y-1 text-gray-600">
                      <li>Stil de viață: {persona.psychographics?.lifestyle}</li>
                      {persona.psychographics?.interests && (
                        <li>Interese: {persona.psychographics.interests.slice(0, 3).join(', ')}</li>
                      )}
                      {persona.psychographics?.pain_points && (
                        <li>Probleme: {persona.psychographics.pain_points.slice(0, 2).join(', ')}</li>
                      )}
                    </ul>
                  </div>
                  
                  <div>
                    <h5 className="font-medium text-gray-800 mb-2">Comportament digital:</h5>
                    <ul className="space-y-1 text-gray-600">
                      <li>Timp online: {persona.digital_behavior?.online_activity_time}</li>
                      {persona.digital_behavior?.preferred_platforms && (
                        <li>Platforme: {persona.digital_behavior.preferred_platforms.slice(0, 3).join(', ')}</li>
                      )}
                      <li>Comportament cumpărare: {persona.digital_behavior?.purchase_behavior}</li>
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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="shadow-lg" animation="slideInLeft" hover="subtle">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2 bg-green-100 rounded-xl">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">Platforme selectate</h3>
            </div>
            
            <div className="space-y-3">
              {plan.details.platform_selection_justification.selected_platforms?.map((platform: any, index: number) => (
                <Card key={index} className="bg-green-50 border-green-200" padding="sm">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold text-gray-900">{platform.platform}</h4>
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
                    <span className="font-medium">ROI așteptat: </span>{platform.expected_roi}
                  </div>
                </Card>
              ))}
            </div>
          </Card>

          <Card className="shadow-lg" animation="slideInRight" hover="subtle">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2 bg-red-100 rounded-xl">
                <AlertCircle className="h-6 w-6 text-red-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">Platforme excluse</h3>
            </div>
            
            <div className="space-y-3">
              {plan.details.platform_selection_justification.excluded_platforms?.map((platform: any, index: number) => (
                <Card key={index} className="bg-red-50 border-red-200" padding="sm">
                  <h4 className="font-semibold text-gray-900 mb-1">{platform.platform}</h4>
                  <p className="text-sm text-gray-700">{platform.reason}</p>
                </Card>
              ))}
            </div>
          </Card>
        </div>
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
              <Card key={index} className="bg-green-50 border-green-200" padding="md" hover="subtle">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold text-gray-900">{kpi.name}</h4>
                  <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                    {kpi.target_value}
                  </span>
                </div>
                
                <p className="text-gray-700 text-sm mb-4">{kpi.description}</p>
                
                <div className="space-y-2 text-xs">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <span className="font-medium text-gray-800">Măsurare: </span>
                      <span className="text-gray-600">{kpi.measurement_method}</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-800">Perioada: </span>
                      <span className="text-gray-600">{kpi.timeframe}</span>
                    </div>
                  </div>
                  
                  {kpi.responsible && (
                    <div>
                      <span className="font-medium text-gray-800">Responsabil: </span>
                      <span className="text-gray-600">{kpi.responsible}</span>
                    </div>
                  )}
                </div>
                
                {/* SMART Breakdown */}
                <Card className="mt-4 bg-white border-green-100" padding="sm">
                  <h5 className="font-medium text-gray-800 mb-2 text-xs">Analiza SMART:</h5>
                  <div className="space-y-1 text-xs">
                    <div><span className="font-medium">S</span>pecific: {kpi.specific}</div>
                    <div><span className="font-medium">M</span>ăsurabil: {kpi.measurable}</div>
                    <div><span className="font-medium">A</span>tinsibil: {kpi.achievable}</div>
                    <div><span className="font-medium">R</span>elevant: {kpi.relevant}</div>
                    <div><span className="font-medium">T</span>emporal: {kpi.time_bound}</div>
                  </div>
                </Card>
              </Card>
            ))}
          </div>
        </Card>
      )}

      {/* Budget Allocation */}
      {plan.details?.budget_allocation_summary && (
        <Card className="shadow-lg" animation="slideInRight">
          <div className="flex items-center space-x-3 mb-6">
            <div className="p-3 bg-purple-100 rounded-xl">
              <DollarSign className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">Alocarea bugetului</h3>
              <p className="text-gray-600">Distribuția resurselor financiare</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* By Channel */}
            <div>
              <h4 className="font-semibold text-gray-900 mb-4">Alocare pe canale</h4>
              <div className="space-y-3">
                {plan.details.budget_allocation_summary.allocation_by_channel?.map((channel: any, index: number) => (
                  <Card key={index} className="bg-purple-50 border-purple-200" padding="sm">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-gray-900">{channel.channel}</span>
                      <div className="text-right">
                        <div className="font-semibold text-purple-700">{channel.percentage}</div>
                        <div className="text-sm text-gray-600">{channel.amount}</div>
                      </div>
                    </div>
                    <p className="text-xs text-gray-600">{channel.justification}</p>
                  </Card>
                ))}
              </div>
            </div>
            
            {/* By Type */}
            <div>
              <h4 className="font-semibold text-gray-900 mb-4">Alocare pe tipuri</h4>
              <div className="space-y-3">
                {plan.details.budget_allocation_summary.allocation_by_type && Object.entries(plan.details.budget_allocation_summary.allocation_by_type).map(([type, percentage]: [string, any], index: number) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-purple-50 border border-purple-200 rounded-lg">
                    <span className="font-medium text-gray-900 capitalize">{type.replace(/_/g, ' ')}</span>
                    <span className="font-semibold text-purple-700">{percentage}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          <div className="mt-6 p-4 bg-purple-100 rounded-lg">
            <div className="flex items-center space-x-2">
              <DollarSign className="h-5 w-5 text-purple-600" />
              <span className="font-semibold text-purple-900">
                Buget total: {plan.details.budget_allocation_summary.total_budget}
              </span>
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
            <p className="text-gray-600">Planificarea detaliată a conținutului</p>
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
                
                {/* Platform Strategy Summary */}
                <Card className="bg-gray-50 mb-6" padding="sm">
                  <h5 className="font-medium text-gray-800 mb-2">Strategia platformei:</h5>
                  <p className="text-sm text-gray-700 mb-3">{platform.strategy}</p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                    <div>
                      <span className="font-medium text-gray-800">Tipuri conținut: </span>
                      <span className="text-gray-600">{platform.content_types?.join(', ')}</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-800">Frecvență: </span>
                      <span className="text-gray-600">{platform.posting_frequency}</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-800">Ore optime: </span>
                      <span className="text-gray-600">{platform.optimal_posting_times?.join(', ')}</span>
                    </div>
                  </div>
                </Card>
                
                {/* Editorial Calendar */}
                {platform.editorial_calendar?.month_1 && (
                  <div className="space-y-6">
                    <h5 className="font-semibold text-gray-900">Luna 1 - Calendar editorial</h5>
                    {platform.editorial_calendar.month_1.map((week: any, weekIndex: number) => (
                      <Card key={weekIndex} className="bg-blue-50 border-blue-200" padding="md">
                        <h6 className="font-semibold text-gray-900 mb-4">Săptămâna {week.week}</h6>
                        
                        {week.posts && week.posts.length > 0 ? (
                          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                            {week.posts.map((post: any, postIndex: number) => (
                              <Card key={postIndex} className="bg-white border-blue-100" padding="sm" hover="subtle">
                                <div className="flex items-center justify-between mb-3">
                                  <span className="font-medium text-blue-900">#{post.post_id}</span>
                                  <div className="flex space-x-1">
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
                                    <Button 
                                      variant="ghost" 
                                      size="sm"
                                      onClick={() => setExpandedPost(expandedPost === `${platformIndex}-${weekIndex}-${postIndex}` ? null : `${platformIndex}-${weekIndex}-${postIndex}`)}
                                      className="p-1 h-6 w-6"
                                    >
                                      <Eye className="h-3 w-3" />
                                    </Button>
                                  </div>
                                </div>
                                
                                <div className="space-y-2">
                                  <div>
                                    <span className="text-xs font-medium text-gray-700">Data: </span>
                                    <span className="text-xs text-gray-600">{post.scheduled_date}</span>
                                  </div>
                                  
                                  <div className="bg-gray-50 p-2 rounded text-xs">
                                    <div className="font-medium text-gray-800 mb-1">Conținut:</div>
                                    <div className="text-gray-700 line-clamp-3">{post.copy?.main_text}</div>
                                  </div>
                                  
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
                                  
                                  {post.promotion_budget && (
                                    <div className="text-xs">
                                      <span className="font-medium text-gray-700">Buget promovare: </span>
                                      <span className="text-green-600 font-medium">{post.promotion_budget}</span>
                                    </div>
                                  )}
                                </div>
                                
                                {/* Expanded Post Details */}
                                {expandedPost === `${platformIndex}-${weekIndex}-${postIndex}` && (
                                  <Card className="mt-3 bg-gray-50" padding="sm">
                                    <div className="space-y-3 text-xs">
                                      {post.copy?.call_to_action && (
                                        <div>
                                          <span className="font-medium text-gray-800">CTA: </span>
                                          <span className="text-gray-700">{post.copy.call_to_action}</span>
                                        </div>
                                      )}
                                      
                                      {post.visual_brief && (
                                        <div>
                                          <span className="font-medium text-gray-800">Brief vizual: </span>
                                          <div className="mt-1 space-y-1">
                                            <div>Tip: {post.visual_brief.type}</div>
                                            <div>Dimensiuni: {post.visual_brief.dimensions}</div>
                                            <div>Stil: {post.visual_brief.style_guidelines}</div>
                                          </div>
                                        </div>
                                      )}
                                      
                                      {post.target_audience_specific && (
                                        <div>
                                          <span className="font-medium text-gray-800">Audiența țintă: </span>
                                          <span className="text-gray-700">{post.target_audience_specific.demographics}</span>
                                        </div>
                                      )}
                                      
                                      {post.individual_metrics && (
                                        <div>
                                          <span className="font-medium text-gray-800">Metrici țintă: </span>
                                          <div className="mt-1 grid grid-cols-2 gap-1">
                                            <div>Reach: {post.individual_metrics.target_reach}</div>
                                            <div>Engagement: {post.individual_metrics.target_engagement}</div>
                                            <div>Click-uri: {post.individual_metrics.target_clicks}</div>
                                            <div>Conversii: {post.individual_metrics.target_conversions}</div>
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                  </Card>
                                )}
                              </Card>
                            ))}
                          </div>
                        ) : (
                          <p className="text-gray-500 text-center py-4">Nu există postări planificate pentru această săptămână</p>
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
            <p className="text-gray-600">Postări și materiale create cu AI</p>
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
                </div>
                
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
                              <span className="text-xs font-medium text-gray-700">#{post.post_id}</span>
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
                            
                            <div className="space-y-2">
                              <div className="text-xs text-gray-600">{post.scheduled_date}</div>
                              <div className="bg-white p-2 rounded border text-xs">
                                <div className="font-medium text-gray-800 mb-1">Conținut:</div>
                                <div className="text-gray-700 line-clamp-4">{post.copy?.main_text}</div>
                              </div>
                              
                              {post.copy?.call_to_action && (
                                <div className="text-xs">
                                  <span className="font-medium text-gray-700">CTA: </span>
                                  <span className="text-gray-600">{post.copy.call_to_action}</span>
                                </div>
                              )}
                              
                              {post.copy?.hashtags && (
                                <div className="flex flex-wrap gap-1">
                                  {post.copy.hashtags.slice(0, 3).map((hashtag: string, hashIndex: number) => (
                                    <span key={hashIndex} className="px-1 py-0.5 bg-blue-100 text-blue-800 rounded text-xs">
                                      {hashtag}
                                    </span>
                                  ))}
                                </div>
                              )}
                              
                              {post.visual_brief && (
                                <div className="text-xs">
                                  <span className="font-medium text-gray-700">Visual: </span>
                                  <span className="text-gray-600">{post.visual_brief.type} ({post.visual_brief.dimensions})</span>
                                </div>
                              )}
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
        )}
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
            <h3 className="text-xl font-bold text-gray-900">Metrici și ROI</h3>
            <p className="text-gray-600">Urmărirea performanței campaniei</p>
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
                  
                  {/* Visual indicator */}
                  <div className="mt-4 pt-4 border-t border-orange-200">
                    <div className="flex items-center justify-center space-x-2">
                      {index % 3 === 0 ? (
                        <>
                          <TrendingUp className="h-4 w-4 text-green-600" />
                          <span className="text-xs text-green-600">În creștere</span>
                        </>
                      ) : index % 3 === 1 ? (
                        <>
                          <AlertCircle className="h-4 w-4 text-amber-600" />
                          <span className="text-xs text-amber-600">Necesită atenție</span>
                        </>
                      ) : (
                        <>
                          <Info className="h-4 w-4 text-blue-600" />
                          <span className="text-xs text-blue-600">Monitorizare</span>
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
              Analytics în dezvoltare
            </h4>
            <p className="text-gray-600">
              Urmărirea detaliată a performanței va fi disponibilă în curând
            </p>
          </Card>
        )}

        {/* ROI Projections */}
        {plan.details?.budget_allocation_summary && (
          <Card className="mt-6 bg-gradient-to-r from-green-50 to-blue-50 border-green-200" animation="fadeInUp">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2 bg-green-100 rounded-lg">
                <PieChart className="h-5 w-5 text-green-600" />
              </div>
              <h4 className="font-semibold text-gray-900">Proiecții ROI</h4>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="text-center p-3 bg-white rounded-lg">
                <div className="text-2xl font-bold text-green-600">150-200%</div>
                <div className="text-gray-600">ROI așteptat</div>
              </div>
              <div className="text-center p-3 bg-white rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{plan.details.budget_allocation_summary.total_budget}</div>
                <div className="text-gray-600">Investiție totală</div>
              </div>
              <div className="text-center p-3 bg-white rounded-lg">
                <div className="text-2xl font-bold text-purple-600">90 zile</div>
                <div className="text-gray-600">Perioada evaluare</div>
              </div>
            </div>
          </Card>
        )}

        {/* KPI Recommendations */}
        <Card className="mt-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200" animation="fadeInUp">
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
              </ul>
            </div>
          </div>
        </Card>
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
              <p className="text-gray-600">Metrici de monitorizare continuă</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {plan.details.monitoring_and_optimization.weekly_dashboard_metrics.map((metric: any, index: number) => (
              <Card key={index} className="bg-indigo-50 border-indigo-200" padding="md" hover="subtle">
                <h4 className="font-semibold text-gray-900 mb-2">{metric.metric}</h4>
                <p className="text-sm text-gray-700 mb-3">{metric.description}</p>
                
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Țintă:</span>
                    <span className="font-medium text-indigo-700">{metric.target_value}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Frecvență:</span>
                    <span className="text-gray-700">{metric.measurement_frequency}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Sursă:</span>
                    <span className="text-gray-700">{metric.data_source}</span>
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
            <div className="p-3 bg-green-100 rounded-xl">
              <Clock className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">Programul de evaluare</h3>
              <p className="text-gray-600">Revizuiri periodice ale performanței</p>
            </div>
          </div>
          
          <div className="space-y-6">
            {Object.entries(plan.details.monitoring_and_optimization.performance_evaluation_schedule).map(([period, schedule]: [string, any], index: number) => (
              <Card key={index} className="bg-green-50 border-green-200" padding="md">
                <h4 className="font-semibold text-gray-900 mb-3 capitalize">
                  {period.replace(/_/g, ' ')} Review
                </h4>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <h5 className="font-medium text-gray-800 mb-2">Zone de focus:</h5>
                    <ul className="space-y-1">
                      {schedule.focus_areas?.map((area: string, areaIndex: number) => (
                        <li key={areaIndex} className="text-gray-700 flex items-start space-x-1">
                          <span className="w-1 h-1 bg-green-500 rounded-full mt-2 flex-shrink-0"></span>
                          <span>{area}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div>
                    <h5 className="font-medium text-gray-800 mb-2">Metrici cheie:</h5>
                    <ul className="space-y-1">
                      {schedule.key_metrics?.map((metric: string, metricIndex: number) => (
                        <li key={metricIndex} className="text-gray-700 flex items-start space-x-1">
                          <span className="w-1 h-1 bg-blue-500 rounded-full mt-2 flex-shrink-0"></span>
                          <span>{metric}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div>
                    <h5 className="font-medium text-gray-800 mb-2">Acțiuni:</h5>
                    <ul className="space-y-1">
                      {schedule.action_items?.map((action: string, actionIndex: number) => (
                        <li key={actionIndex} className="text-gray-700 flex items-start space-x-1">
                          <span className="w-1 h-1 bg-purple-500 rounded-full mt-2 flex-shrink-0"></span>
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
            <div className="p-3 bg-amber-100 rounded-xl">
              <Settings className="h-6 w-6 text-amber-600" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">Recomandări de ajustare</h3>
              <p className="text-gray-600">Protocoale de optimizare automată</p>
            </div>
          </div>
          
          <div className="space-y-4">
            {plan.details.monitoring_and_optimization.adjustment_recommendations.map((recommendation: any, index: number) => (
              <Card key={index} className="bg-amber-50 border-amber-200" padding="md" hover="subtle">
                <div className="flex items-start space-x-3">
                  <div className="p-2 bg-amber-100 rounded-lg">
                    <AlertCircle className="h-5 w-5 text-amber-600" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 mb-2">
                      Condiție: {recommendation.trigger_condition}
                    </h4>
                    <p className="text-gray-700 mb-3">{recommendation.recommended_action}</p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium text-gray-800">Timeline implementare: </span>
                        <span className="text-gray-600">{recommendation.implementation_timeline}</span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-800">Impact așteptat: </span>
                        <span className="text-gray-600">{recommendation.expected_impact}</span>
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
      {plan.details?.monitoring_and_optimization?.dedicated_responsibilities && (
        <Card className="shadow-lg" animation="fadeInUp">
          <div className="flex items-center space-x-3 mb-6">
            <div className="p-3 bg-purple-100 rounded-xl">
              <Users className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">Responsabilități dedicate</h3>
              <p className="text-gray-600">Roluri și responsabilități în echipă</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {plan.details.monitoring_and_optimization.dedicated_responsibilities.map((role: any, index: number) => (
              <Card key={index} className="bg-purple-50 border-purple-200" padding="md" hover="subtle">
                <h4 className="font-semibold text-gray-900 mb-3">{role.role}</h4>
                
                <div className="space-y-3 text-sm">
                  <div>
                    <h5 className="font-medium text-gray-800 mb-1">Responsabilități:</h5>
                    <ul className="space-y-1">
                      {role.responsibilities?.map((responsibility: string, respIndex: number) => (
                        <li key={respIndex} className="text-gray-700 flex items-start space-x-1">
                          <span className="w-1 h-1 bg-purple-500 rounded-full mt-2 flex-shrink-0"></span>
                          <span>{responsibility}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <span className="font-medium text-gray-800">Timp alocat: </span>
                      <span className="text-gray-600">{role.time_allocation}</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-800">Abilități: </span>
                      <span className="text-gray-600">{role.required_skills?.slice(0, 2).join(', ')}</span>
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
              <div className="flex items-center space-x-4 text-sm text-gray-600">
                <span>Creat pe {new Date(plan.created_at).toLocaleDateString('ro-RO')}</span>
                {plan.details?.delivery_date && (
                  <span>• Livrare: {plan.details.delivery_date}</span>
                )}
                {plan.details?.plan_type === 'digital_marketing_complete' && (
                  <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                    Plan Digital Complet
                  </span>
                )}
              </div>
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
        {activeTab === 'analytics' && renderAnalytics()}
        {activeTab === 'monitoring' && renderMonitoring()}
      </div>
    </div>
  );
};