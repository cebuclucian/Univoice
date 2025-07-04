import React, { useState, useRef } from 'react';
import { 
  Calendar, Target, Users, TrendingUp, BarChart3, Clock, 
  CheckCircle, ArrowLeft, Edit3, Share2, Download, Brain,
  Lightbulb, Zap, MessageSquare, Instagram, Facebook, 
  Twitter, Mail, Globe, Youtube, Music, Monitor, Copy,
  CheckSquare, AlertCircle, Info, Clipboard, FileText,
  Star, Award, DollarSign, Eye, MousePointer, Heart,
  UserCheck, Settings, Shield, Briefcase, PieChart
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
  const [exportFormat, setExportFormat] = useState<'json' | 'text' | 'calendar' | 'excel'>('text');
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
    { id: 'analytics', name: 'Metrici & ROI', icon: BarChart3 },
    { id: 'monitoring', name: 'Monitorizare', icon: Settings }
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
      case 'excel':
        exportData = generateExcelExport();
        fileName = `${plan.title.replace(/\s+/g, '_')}_excel.csv`;
        mimeType = 'text/csv';
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
      text += `Ton: ${Array.isArray(details.brand_voice_used.tone) ? details.brand_voice_used.tone.join(', ') : details.brand_voice_used.tone}\n\n`;
    }
    
    // Identity and Voice
    if (details?.identity_and_voice) {
      text += 'IDENTITATEA ȘI VOCEA BRANDULUI:\n';
      text += `Identitate: ${details.identity_and_voice.brand_identity || 'N/A'}\n`;
      text += `Poziționare: ${details.identity_and_voice.brand_positioning || 'N/A'}\n`;
      if (details.identity_and_voice.voice_characteristics) {
        text += `Caracteristici voce: ${details.identity_and_voice.voice_characteristics.tone || 'N/A'}\n`;
        text += `Valori: ${Array.isArray(details.identity_and_voice.voice_characteristics.values) ? details.identity_and_voice.voice_characteristics.values.join(', ') : 'N/A'}\n`;
      }
      text += '\n';
    }
    
    // KPIs SMART
    if (details?.kpis_smart && details.kpis_smart.length > 0) {
      text += 'KPI-URI SMART:\n';
      details.kpis_smart.forEach((kpi: any, i: number) => {
        text += `${i+1}. ${kpi.name || 'N/A'}\n`;
        text += `   Descriere: ${kpi.description || 'N/A'}\n`;
        text += `   Țintă: ${kpi.target_value || 'N/A'}\n`;
        text += `   Măsurare: ${kpi.measurement_method || 'N/A'}\n`;
        text += `   Perioada: ${kpi.timeframe || 'N/A'}\n`;
        text += `   Responsabil: ${kpi.responsible || 'N/A'}\n\n`;
      });
    }
    
    // Buyer Personas
    if (details?.buyer_personas && details.buyer_personas.length > 0) {
      text += 'BUYER PERSONAS:\n';
      details.buyer_personas.forEach((persona: any, i: number) => {
        text += `${i+1}. ${persona.name || 'Persona'}\n`;
        if (persona.demographics) {
          text += `   Demografia: ${persona.demographics.age_range || 'N/A'}, ${persona.demographics.location || 'N/A'}\n`;
          text += `   Ocupație: ${persona.demographics.occupation || 'N/A'}\n`;
        }
        if (persona.psychographics) {
          text += `   Interese: ${Array.isArray(persona.psychographics.interests) ? persona.psychographics.interests.join(', ') : 'N/A'}\n`;
          text += `   Puncte de durere: ${Array.isArray(persona.psychographics.pain_points) ? persona.psychographics.pain_points.join(', ') : 'N/A'}\n`;
        }
        text += '\n';
      });
    }
    
    // Budget Allocation
    if (details?.budget_allocation_summary) {
      text += 'ALOCAREA BUGETULUI:\n';
      text += `Buget total: ${details.budget_allocation_summary.total_budget || 'N/A'}\n`;
      if (details.budget_allocation_summary.allocation_by_channel) {
        text += 'Alocare pe canale:\n';
        details.budget_allocation_summary.allocation_by_channel.forEach((channel: any) => {
          text += `- ${channel.channel}: ${channel.percentage} (${channel.amount})\n`;
        });
      }
      text += '\n';
    }
    
    // Tactical Plan per Platform
    if (details?.tactical_plan_per_platform && details.tactical_plan_per_platform.length > 0) {
      text += 'PLANUL TACTIC PE PLATFORME:\n';
      details.tactical_plan_per_platform.forEach((platform: any) => {
        text += `\n${platform.platform.toUpperCase()}:\n`;
        text += `Strategie: ${platform.strategy || 'N/A'}\n`;
        text += `Frecvență postări: ${platform.posting_frequency || 'N/A'}\n`;
        text += `Tipuri conținut: ${Array.isArray(platform.content_types) ? platform.content_types.join(', ') : 'N/A'}\n`;
        
        // Editorial Calendar
        if (platform.editorial_calendar && platform.editorial_calendar.month_1) {
          text += '\nCalendar editorial:\n';
          platform.editorial_calendar.month_1.forEach((week: any) => {
            text += `Săptămâna ${week.week}:\n`;
            if (week.posts && week.posts.length > 0) {
              week.posts.forEach((post: any, postIndex: number) => {
                text += `  Post ${postIndex + 1} (${post.post_id}):\n`;
                text += `    Data: ${post.scheduled_date}\n`;
                if (post.copy) {
                  text += `    Text: ${post.copy.main_text}\n`;
                  text += `    CTA: ${post.copy.call_to_action}\n`;
                  text += `    Hashtags: ${Array.isArray(post.copy.hashtags) ? post.copy.hashtags.join(' ') : 'N/A'}\n`;
                }
                if (post.visual_brief) {
                  text += `    Brief vizual: ${post.visual_brief.type}, ${post.visual_brief.dimensions}\n`;
                }
                text += `    Buget promovare: ${post.promotion_budget || 'N/A'}\n\n`;
              });
            }
          });
        }
      });
    }
    
    // Monitoring and Optimization
    if (details?.monitoring_and_optimization) {
      text += '\nMONITORIZARE ȘI OPTIMIZARE:\n';
      
      if (details.monitoring_and_optimization.weekly_dashboard_metrics) {
        text += 'Metrici dashboard săptămânal:\n';
        details.monitoring_and_optimization.weekly_dashboard_metrics.forEach((metric: any) => {
          text += `- ${metric.metric}: ${metric.target_value} (${metric.measurement_frequency})\n`;
        });
        text += '\n';
      }
      
      if (details.monitoring_and_optimization.dedicated_responsibilities) {
        text += 'Responsabilități:\n';
        details.monitoring_and_optimization.dedicated_responsibilities.forEach((role: any) => {
          text += `- ${role.role}: ${Array.isArray(role.responsibilities) ? role.responsibilities.join(', ') : 'N/A'}\n`;
          text += `  Timp alocat: ${role.time_allocation || 'N/A'}\n`;
        });
      }
    }
    
    return text;
  };

  const generateCalendarExport = () => {
    const { title, details } = plan;
    
    let text = `CALENDAR EDITORIAL: ${title}\n\n`;
    
    if (details?.tactical_plan_per_platform && details.tactical_plan_per_platform.length > 0) {
      details.tactical_plan_per_platform.forEach((platform: any) => {
        text += `PLATFORMA: ${platform.platform.toUpperCase()}\n`;
        text += '='.repeat(50) + '\n\n';
        
        if (platform.editorial_calendar && platform.editorial_calendar.month_1) {
          platform.editorial_calendar.month_1.forEach((week: any) => {
            text += `SĂPTĂMÂNA ${week.week}\n`;
            text += '-'.repeat(20) + '\n';
            
            if (week.posts && week.posts.length > 0) {
              week.posts.forEach((post: any) => {
                text += `${post.scheduled_date} | ${post.post_id}\n`;
                if (post.copy) {
                  text += `Titlu/Text: ${post.copy.main_text.substring(0, 100)}...\n`;
                  text += `CTA: ${post.copy.call_to_action}\n`;
                  text += `Hashtags: ${Array.isArray(post.copy.hashtags) ? post.copy.hashtags.join(' ') : ''}\n`;
                }
                if (post.visual_brief) {
                  text += `Visual: ${post.visual_brief.type} (${post.visual_brief.dimensions})\n`;
                }
                text += `Buget: ${post.promotion_budget || 'N/A'}\n`;
                text += '\n';
              });
            } else {
              text += 'Nu există postări planificate pentru această săptămână.\n\n';
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

  const generateExcelExport = () => {
    let csv = 'Platforma,Săptămâna,Post ID,Data programată,Text principal,CTA,Hashtags,Tip vizual,Dimensiuni,Buget promovare,KPI principal\n';
    
    if (plan.details?.tactical_plan_per_platform) {
      plan.details.tactical_plan_per_platform.forEach((platform: any) => {
        if (platform.editorial_calendar && platform.editorial_calendar.month_1) {
          platform.editorial_calendar.month_1.forEach((week: any) => {
            if (week.posts) {
              week.posts.forEach((post: any) => {
                const row = [
                  platform.platform,
                  week.week,
                  post.post_id || '',
                  post.scheduled_date || '',
                  `"${(post.copy?.main_text || '').replace(/"/g, '""')}"`,
                  `"${(post.copy?.call_to_action || '').replace(/"/g, '""')}"`,
                  `"${Array.isArray(post.copy?.hashtags) ? post.copy.hashtags.join(' ') : ''}"`,
                  post.visual_brief?.type || '',
                  post.visual_brief?.dimensions || '',
                  post.promotion_budget || '',
                  post.individual_metrics?.primary_kpi || ''
                ].join(',');
                csv += row + '\n';
              });
            }
          });
        }
      });
    }
    
    return csv;
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
            <p className="text-gray-600">Obiective și strategie generală</p>
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

      {/* Deliverables */}
      {plan.details?.deliverables && (
        <Card className="shadow-lg" animation="slideInRight" hover="subtle">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-2 bg-green-100 rounded-xl">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <h3 className="text-lg font-bold text-gray-900">Livrabile incluse</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(plan.details.deliverables).map(([key, value], index) => (
              <div key={index} className="flex items-start space-x-2">
                <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium text-gray-900 capitalize">{key.replace(/_/g, ' ')}</p>
                  <p className="text-sm text-gray-600">{value as string}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Platform Selection Justification */}
      {plan.details?.platform_selection_justification && (
        <Card className="shadow-lg" animation="fadeInUp" hover="subtle">
          <div className="flex items-center space-x-3 mb-6">
            <div className="p-2 bg-indigo-100 rounded-xl">
              <Zap className="h-6 w-6 text-indigo-600" />
            </div>
            <h3 className="text-lg font-bold text-gray-900">Justificarea platformelor</h3>
          </div>
          
          <div className="space-y-4">
            {plan.details.platform_selection_justification.selected_platforms?.map((platform: any, index: number) => (
              <Card 
                key={index}
                className={`border-l-4 border-indigo-400 bg-indigo-50`}
                padding="sm"
                hover="subtle"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    {getPlatformIcon(platform.platform)}
                    <h4 className="font-semibold text-gray-900">{platform.platform}</h4>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    platform.priority_level === 'high' ? 'bg-red-100 text-red-800' :
                    platform.priority_level === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {platform.priority_level}
                  </span>
                </div>
                <p className="text-sm text-gray-700 mb-2">{platform.justification}</p>
                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className="font-semibold text-gray-800">Suprapunere audiență: </span>
                    <span className="text-gray-600">{platform.audience_overlap}</span>
                  </div>
                  <div>
                    <span className="font-semibold text-gray-800">ROI așteptat: </span>
                    <span className="text-gray-600">{platform.expected_roi}</span>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </Card>
      )}
    </div>
  );

  const renderStrategy = () => (
    <div className="space-y-6">
      {/* Identity and Voice */}
      {plan.details?.identity_and_voice && (
        <Card className="shadow-lg" animation="slideInLeft">
          <div className="flex items-center space-x-3 mb-6">
            <div className="p-3 bg-purple-100 rounded-xl">
              <Brain className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">Identitatea și vocea brandului</h3>
              <p className="text-gray-600">Fundația strategiei de marketing</p>
            </div>
          </div>
          
          <div className="space-y-4">
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Identitatea brandului:</h4>
              <p className="text-gray-700">{plan.details.identity_and_voice.brand_identity}</p>
            </div>
            
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Poziționarea pe piață:</h4>
              <p className="text-gray-700">{plan.details.identity_and_voice.brand_positioning}</p>
            </div>
            
            {plan.details.identity_and_voice.voice_characteristics && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Caracteristicile vocii:</h4>
                  <p className="text-sm text-gray-700 mb-2">
                    <span className="font-medium">Ton:</span> {plan.details.identity_and_voice.voice_characteristics.tone}
                  </p>
                  <p className="text-sm text-gray-700">
                    <span className="font-medium">Stil comunicare:</span> {plan.details.identity_and_voice.voice_characteristics.communication_style}
                  </p>
                </div>
                
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Valorile brandului:</h4>
                  <div className="flex flex-wrap gap-2">
                    {plan.details.identity_and_voice.voice_characteristics.values?.map((value: string, index: number) => (
                      <span key={index} className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm">
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

      {/* KPIs SMART */}
      {plan.details?.kpis_smart && (
        <Card className="shadow-lg" animation="slideInRight">
          <div className="flex items-center space-x-3 mb-6">
            <div className="p-3 bg-green-100 rounded-xl">
              <Award className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">KPI-uri SMART</h3>
              <p className="text-gray-600">Obiective măsurabile pentru următoarele 90 zile</p>
            </div>
          </div>
          
          <div className="space-y-4">
            {plan.details.kpis_smart.map((kpi: any, index: number) => (
              <Card 
                key={index}
                className="border-l-4 border-green-400 bg-green-50"
                padding="md"
                animation="scaleIn"
                delay={index + 1}
                hover="subtle"
              >
                <div className="flex items-start justify-between mb-3">
                  <h4 className="font-bold text-gray-900">{kpi.name}</h4>
                  <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                    {kpi.target_value}
                  </span>
                </div>
                
                <p className="text-gray-700 mb-4">{kpi.description}</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-semibold text-gray-800">Măsurare: </span>
                    <span className="text-gray-600">{kpi.measurement_method}</span>
                  </div>
                  <div>
                    <span className="font-semibold text-gray-800">Responsabil: </span>
                    <span className="text-gray-600">{kpi.responsible}</span>
                  </div>
                  <div>
                    <span className="font-semibold text-gray-800">Perioada: </span>
                    <span className="text-gray-600">{kpi.timeframe}</span>
                  </div>
                </div>
                
                {/* SMART Breakdown */}
                <div className="mt-4 pt-4 border-t border-green-200">
                  <h5 className="font-semibold text-gray-900 mb-2">Analiza SMART:</h5>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 text-xs">
                    <div><span className="font-medium">S:</span> {kpi.specific}</div>
                    <div><span className="font-medium">M:</span> {kpi.measurable}</div>
                    <div><span className="font-medium">A:</span> {kpi.achievable}</div>
                    <div><span className="font-medium">R:</span> {kpi.relevant}</div>
                    <div><span className="font-medium">T:</span> {kpi.time_bound}</div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </Card>
      )}

      {/* Buyer Personas */}
      {plan.details?.buyer_personas && (
        <Card className="shadow-lg" animation="fadeInUp">
          <div className="flex items-center space-x-3 mb-6">
            <div className="p-3 bg-blue-100 rounded-xl">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">Buyer Personas</h3>
              <p className="text-gray-600">Profiluri detaliate ale audiența țintă</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {plan.details.buyer_personas.map((persona: any, index: number) => (
              <Card 
                key={index}
                className="border-l-4 border-blue-400 bg-blue-50"
                padding="md"
                animation="slideInLeft"
                delay={index + 1}
                hover="subtle"
              >
                <h4 className="font-bold text-gray-900 mb-4">{persona.name}</h4>
                
                {/* Demographics */}
                {persona.demographics && (
                  <div className="mb-4">
                    <h5 className="font-semibold text-gray-800 mb-2">Demografia:</h5>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div><span className="font-medium">Vârstă:</span> {persona.demographics.age_range}</div>
                      <div><span className="font-medium">Gen:</span> {persona.demographics.gender}</div>
                      <div><span className="font-medium">Locație:</span> {persona.demographics.location}</div>
                      <div><span className="font-medium">Venit:</span> {persona.demographics.income}</div>
                      <div><span className="font-medium">Educație:</span> {persona.demographics.education}</div>
                      <div><span className="font-medium">Ocupație:</span> {persona.demographics.occupation}</div>
                    </div>
                  </div>
                )}
                
                {/* Psychographics */}
                {persona.psychographics && (
                  <div className="mb-4">
                    <h5 className="font-semibold text-gray-800 mb-2">Psihografia:</h5>
                    <div className="space-y-2 text-sm">
                      {persona.psychographics.interests && (
                        <div>
                          <span className="font-medium">Interese: </span>
                          <span>{persona.psychographics.interests.join(', ')}</span>
                        </div>
                      )}
                      {persona.psychographics.pain_points && (
                        <div>
                          <span className="font-medium">Puncte de durere: </span>
                          <span>{persona.psychographics.pain_points.join(', ')}</span>
                        </div>
                      )}
                      {persona.psychographics.goals && (
                        <div>
                          <span className="font-medium">Obiective: </span>
                          <span>{persona.psychographics.goals.join(', ')}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
                
                {/* Digital Behavior */}
                {persona.digital_behavior && (
                  <div>
                    <h5 className="font-semibold text-gray-800 mb-2">Comportament digital:</h5>
                    <div className="space-y-1 text-sm">
                      <div><span className="font-medium">Platforme preferate:</span> {persona.digital_behavior.preferred_platforms?.join(', ')}</div>
                      <div><span className="font-medium">Timp online:</span> {persona.digital_behavior.online_activity_time}</div>
                      <div><span className="font-medium">Preferințe conținut:</span> {persona.digital_behavior.content_preferences?.join(', ')}</div>
                    </div>
                  </div>
                )}
              </Card>
            ))}
          </div>
        </Card>
      )}

      {/* Budget Allocation */}
      {plan.details?.budget_allocation_summary && (
        <Card className="shadow-lg" animation="slideInRight">
          <div className="flex items-center space-x-3 mb-6">
            <div className="p-3 bg-yellow-100 rounded-xl">
              <DollarSign className="h-6 w-6 text-yellow-600" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">Alocarea bugetului</h3>
              <p className="text-gray-600">Distribuția resurselor financiare</p>
            </div>
          </div>
          
          <div className="space-y-6">
            <div className="text-center">
              <h4 className="text-2xl font-bold text-gray-900 mb-2">
                Buget total: {plan.details.budget_allocation_summary.total_budget}
              </h4>
            </div>
            
            {/* Allocation by Channel */}
            {plan.details.budget_allocation_summary.allocation_by_channel && (
              <div>
                <h4 className="font-semibold text-gray-900 mb-4">Alocare pe canale:</h4>
                <div className="space-y-3">
                  {plan.details.budget_allocation_summary.allocation_by_channel.map((channel: any, index: number) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        {getPlatformIcon(channel.channel)}
                        <span className="font-medium text-gray-900">{channel.channel}</span>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-gray-900">{channel.percentage}</div>
                        <div className="text-sm text-gray-600">{channel.amount}</div>
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
                    <div key={index} className="text-center p-3 bg-yellow-50 rounded-lg">
                      <div className="font-bold text-gray-900">{percentage as string}</div>
                      <div className="text-sm text-gray-600 capitalize">{type.replace(/_/g, ' ')}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </Card>
      )}
    </div>
  );

  const renderCalendar = () => (
    <div className="space-y-6">
      <Card className="shadow-lg" animation="slideInLeft">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-green-100 rounded-xl">
              <Calendar className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">Calendar editorial</h3>
              <p className="text-gray-600">Planificarea detaliată a conținutului</p>
            </div>
          </div>
          
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => {
              setExportFormat('calendar');
              handleExport();
            }}
            className="flex items-center space-x-2"
          >
            <Download className="h-4 w-4" />
            <span>Export calendar</span>
          </Button>
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
                      const platformContent = platform.editorial_calendar?.month_1?.map((week: any) => 
                        week.posts?.map((post: any) => 
                          `${post.scheduled_date}: ${post.copy?.main_text || ''}`
                        ).join('\n')
                      ).join('\n\n');
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
                        <span>Copiază</span>
                      </>
                    )}
                  </Button>
                </div>
                
                {/* Editorial Calendar */}
                {platform.editorial_calendar?.month_1 && (
                  <div className="space-y-6">
                    {platform.editorial_calendar.month_1.map((week: any, weekIndex: number) => (
                      <Card 
                        key={weekIndex}
                        className="bg-gray-50"
                        padding="md"
                        animation="scaleIn"
                        delay={weekIndex + 1}
                      >
                        <h5 className="font-bold text-gray-900 mb-4">Săptămâna {week.week}</h5>
                        
                        {week.posts && week.posts.length > 0 ? (
                          <div className="space-y-4">
                            {week.posts.map((post: any, postIndex: number) => (
                              <Card 
                                key={postIndex}
                                className="bg-white border-l-4 border-blue-400"
                                padding="sm"
                                hover="subtle"
                              >
                                <div className="flex items-start justify-between mb-3">
                                  <div>
                                    <h6 className="font-semibold text-gray-900">{post.post_id}</h6>
                                    <p className="text-sm text-gray-600">{post.scheduled_date}</p>
                                  </div>
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
                                </div>
                                
                                {/* Post Content */}
                                {post.copy && (
                                  <div className="space-y-3">
                                    <div>
                                      <h6 className="font-medium text-gray-800 mb-1">Conținut:</h6>
                                      <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg">
                                        {post.copy.main_text}
                                      </p>
                                    </div>
                                    
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                      <div>
                                        <h6 className="font-medium text-gray-800 mb-1">Call-to-Action:</h6>
                                        <p className="text-sm text-gray-700">{post.copy.call_to_action}</p>
                                      </div>
                                      
                                      {post.copy.hashtags && (
                                        <div>
                                          <h6 className="font-medium text-gray-800 mb-1">Hashtags:</h6>
                                          <div className="flex flex-wrap gap-1">
                                            {post.copy.hashtags.map((hashtag: string, hashIndex: number) => (
                                              <span 
                                                key={hashIndex}
                                                className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs"
                                              >
                                                {hashtag}
                                              </span>
                                            ))}
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                )}
                                
                                {/* Visual Brief */}
                                {post.visual_brief && (
                                  <div className="mt-3 pt-3 border-t border-gray-200">
                                    <h6 className="font-medium text-gray-800 mb-2">Brief vizual:</h6>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                                      <div><span className="font-medium">Tip:</span> {post.visual_brief.type}</div>
                                      <div><span className="font-medium">Dimensiuni:</span> {post.visual_brief.dimensions}</div>
                                      <div><span className="font-medium">Stil:</span> {post.visual_brief.style_guidelines}</div>
                                      <div><span className="font-medium">Buget:</span> {post.promotion_budget}</div>
                                    </div>
                                  </div>
                                )}
                                
                                {/* Metrics and Targeting */}
                                <div className="mt-3 pt-3 border-t border-gray-200">
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                                    {post.individual_metrics && (
                                      <div>
                                        <h6 className="font-medium text-gray-800 mb-1">Metrici țintă:</h6>
                                        <div className="space-y-1">
                                          <div>KPI principal: {post.individual_metrics.primary_kpi}</div>
                                          <div>Reach țintă: {post.individual_metrics.target_reach}</div>
                                          <div>Engagement țintă: {post.individual_metrics.target_engagement}</div>
                                        </div>
                                      </div>
                                    )}
                                    
                                    {post.target_audience_specific && (
                                      <div>
                                        <h6 className="font-medium text-gray-800 mb-1">Targetare:</h6>
                                        <div className="space-y-1">
                                          <div>Demografia: {post.target_audience_specific.demographics}</div>
                                          <div>Interese: {post.target_audience_specific.interests?.join(', ')}</div>
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                </div>
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
            <p className="text-gray-600">Specificații complete pentru fiecare tip de conținut</p>
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
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-lg ${getPlatformColor(platform.platform)}`}>
                      {getPlatformIcon(platform.platform)}
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">{platform.platform}</h4>
                      <p className="text-sm text-gray-600">{platform.strategy}</p>
                    </div>
                  </div>
                  
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => {
                      const platformStrategy = `Strategie ${platform.platform}:\n${platform.strategy}\n\nTipuri conținut: ${platform.content_types?.join(', ') || 'N/A'}\nFrecvență: ${platform.posting_frequency || 'N/A'}\nOrele optime: ${platform.optimal_posting_times?.join(', ') || 'N/A'}`;
                      copyToClipboard(platformStrategy, `strategy-${platformIndex}`);
                    }}
                    className="flex items-center space-x-1"
                  >
                    {copiedContentId === `strategy-${platformIndex}` ? (
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
                
                {/* Platform Strategy Details */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="bg-white p-4 rounded-lg border">
                    <h5 className="font-medium text-gray-800 mb-2">Tipuri de conținut:</h5>
                    <div className="flex flex-wrap gap-1">
                      {platform.content_types?.map((type: string, index: number) => (
                        <span key={index} className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                          {type}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  <div className="bg-white p-4 rounded-lg border">
                    <h5 className="font-medium text-gray-800 mb-2">Frecvența postărilor:</h5>
                    <p className="text-sm text-gray-700">{platform.posting_frequency}</p>
                  </div>
                  
                  <div className="bg-white p-4 rounded-lg border">
                    <h5 className="font-medium text-gray-800 mb-2">Orele optime:</h5>
                    <div className="flex flex-wrap gap-1">
                      {platform.optimal_posting_times?.map((time: string, index: number) => (
                        <span key={index} className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">
                          {time}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
                
                {/* Content Examples */}
                {platform.editorial_calendar?.month_1 && (
                  <div>
                    <h5 className="font-medium text-gray-800 mb-4">Exemple de conținut:</h5>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {platform.editorial_calendar.month_1
                        .flatMap((week: any) => week.posts || [])
                        .slice(0, 4)
                        .map((post: any, contentIndex: number) => (
                          <Card 
                            key={contentIndex}
                            className="bg-gray-50"
                            padding="sm"
                            hover="subtle"
                          >
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-xs font-medium text-gray-700">{post.visual_brief?.type || 'Post'}</span>
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => copyToClipboard(post.copy?.main_text || '', `content-${platformIndex}-${contentIndex}`)}
                                className="p-1 h-6 w-6"
                              >
                                {copiedContentId === `content-${platformIndex}-${contentIndex}` ? (
                                  <CheckSquare className="h-3 w-3 text-green-600" />
                                ) : (
                                  <Copy className="h-3 w-3" />
                                )}
                              </Button>
                            </div>
                            
                            <h6 className="font-medium text-gray-800 text-sm mb-2">{post.post_id}</h6>
                            <p className="text-xs text-gray-600 line-clamp-3 mb-2">
                              {post.copy?.main_text || 'Conținut indisponibil'}
                            </p>
                            
                            {post.copy?.call_to_action && (
                              <div className="text-xs text-blue-600 font-medium">
                                CTA: {post.copy.call_to_action}
                              </div>
                            )}
                            
                            {post.visual_brief && (
                              <div className="mt-2 pt-2 border-t border-gray-200 text-xs text-gray-500">
                                {post.visual_brief.type} • {post.visual_brief.dimensions}
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
            <p className="text-gray-600">Urmărirea performanței și returnului investiției</p>
          </div>
        </div>

        {/* Weekly Dashboard Metrics */}
        {plan.details?.monitoring_and_optimization?.weekly_dashboard_metrics && (
          <div className="mb-8">
            <h4 className="font-semibold text-gray-900 mb-4">Metrici dashboard săptămânal:</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {plan.details.monitoring_and_optimization.weekly_dashboard_metrics.map((metric: any, index: number) => (
                <Card 
                  key={index}
                  className="bg-gradient-to-r from-orange-50 to-red-50 border-orange-200"
                  padding="md"
                  animation="scaleIn"
                  delay={index + 1}
                  hover="subtle"
                >
                  <div className="text-center">
                    <h5 className="font-semibold text-gray-900 mb-2">{metric.metric}</h5>
                    <div className="text-2xl font-bold text-orange-600 mb-2">
                      {metric.target_value}
                    </div>
                    <p className="text-gray-600 text-sm mb-2">{metric.description}</p>
                    <div className="text-xs text-gray-500">
                      <div>Frecvență: {metric.measurement_frequency}</div>
                      <div>Sursă: {metric.data_source}</div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Performance Evaluation Schedule */}
        {plan.details?.monitoring_and_optimization?.performance_evaluation_schedule && (
          <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200" animation="slideInRight">
            <h4 className="font-semibold text-gray-900 mb-4">Programul de evaluare a performanței:</h4>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {Object.entries(plan.details.monitoring_and_optimization.performance_evaluation_schedule).map(([period, data]: [string, any], index) => (
                <div key={index} className="bg-white p-4 rounded-lg border border-blue-200">
                  <h5 className="font-semibold text-blue-900 mb-3 capitalize">
                    {period.replace(/_/g, ' ')}
                  </h5>
                  
                  <div className="space-y-3 text-sm">
                    <div>
                      <span className="font-medium text-gray-800">Zone de focus:</span>
                      <ul className="mt-1 space-y-1">
                        {data.focus_areas?.map((area: string, areaIndex: number) => (
                          <li key={areaIndex} className="text-gray-600 flex items-start space-x-1">
                            <span className="w-1 h-1 bg-blue-500 rounded-full mt-2 flex-shrink-0"></span>
                            <span>{area}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    <div>
                      <span className="font-medium text-gray-800">Metrici cheie:</span>
                      <div className="mt-1 flex flex-wrap gap-1">
                        {data.key_metrics?.map((metric: string, metricIndex: number) => (
                          <span key={metricIndex} className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                            {metric}
                          </span>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <span className="font-medium text-gray-800">Acțiuni:</span>
                      <ul className="mt-1 space-y-1">
                        {data.action_items?.map((action: string, actionIndex: number) => (
                          <li key={actionIndex} className="text-gray-600 flex items-start space-x-1">
                            <CheckCircle className="h-3 w-3 text-green-600 mt-0.5 flex-shrink-0" />
                            <span>{action}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Platform-specific KPIs */}
        {plan.details?.tactical_plan_per_platform && (
          <div className="mt-8">
            <h4 className="font-semibold text-gray-900 mb-4">KPI-uri pe platforme:</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {plan.details.tactical_plan_per_platform.map((platform: any, index: number) => (
                <Card 
                  key={index}
                  className={`border-l-4 ${getPlatformColor(platform.platform).includes('blue') ? 'border-blue-400' : 
                    getPlatformColor(platform.platform).includes('pink') ? 'border-pink-400' :
                    'border-gray-400'
                  }`}
                  padding="md"
                  animation="fadeInUp"
                  delay={index + 1}
                  hover="subtle"
                >
                  <div className="flex items-center space-x-3 mb-4">
                    <div className={`p-2 rounded-lg ${getPlatformColor(platform.platform)}`}>
                      {getPlatformIcon(platform.platform)}
                    </div>
                    <h5 className="font-semibold text-gray-900">{platform.platform}</h5>
                  </div>
                  
                  {platform.kpis && (
                    <div className="space-y-2">
                      {platform.kpis.map((kpi: string, kpiIndex: number) => (
                        <div key={kpiIndex} className="flex items-center space-x-2">
                          <TrendingUp className="h-4 w-4 text-green-600" />
                          <span className="text-sm text-gray-700">{kpi}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* ROI Projections */}
        <Card className="mt-8 bg-gradient-to-r from-green-50 to-emerald-50 border-green-200" animation="fadeInUp">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-2 bg-green-100 rounded-lg">
              <PieChart className="h-6 w-6 text-green-600" />
            </div>
            <h4 className="font-semibold text-gray-900">Proiecții ROI</h4>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-white rounded-lg border border-green-200">
              <div className="text-2xl font-bold text-green-600 mb-1">150-200%</div>
              <div className="text-sm text-gray-600">ROI așteptat</div>
            </div>
            <div className="text-center p-4 bg-white rounded-lg border border-green-200">
              <div className="text-2xl font-bold text-green-600 mb-1">30-45 zile</div>
              <div className="text-sm text-gray-600">Perioada de recuperare</div>
            </div>
            <div className="text-center p-4 bg-white rounded-lg border border-green-200">
              <div className="text-2xl font-bold text-green-600 mb-1">25-40%</div>
              <div className="text-sm text-gray-600">Creștere conversii</div>
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
            <Settings className="h-6 w-6 text-indigo-600" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900">Monitorizare și optimizare</h3>
            <p className="text-gray-600">Protocoale de urmărire și îmbunătățire continuă</p>
          </div>
        </div>

        {/* Adjustment Recommendations */}
        {plan.details?.monitoring_and_optimization?.adjustment_recommendations && (
          <div className="mb-8">
            <h4 className="font-semibold text-gray-900 mb-4">Recomandări de ajustare:</h4>
            <div className="space-y-4">
              {plan.details.monitoring_and_optimization.adjustment_recommendations.map((recommendation: any, index: number) => (
                <Card 
                  key={index}
                  className="border-l-4 border-amber-400 bg-amber-50"
                  padding="md"
                  animation="slideInLeft"
                  delay={index + 1}
                  hover="subtle"
                >
                  <div className="space-y-3">
                    <div>
                      <h5 className="font-semibold text-gray-900 mb-1">Condiția declanșatoare:</h5>
                      <p className="text-sm text-gray-700">{recommendation.trigger_condition}</p>
                    </div>
                    
                    <div>
                      <h5 className="font-semibold text-gray-900 mb-1">Acțiunea recomandată:</h5>
                      <p className="text-sm text-gray-700">{recommendation.recommended_action}</p>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium text-gray-800">Cronologie implementare: </span>
                        <span className="text-gray-600">{recommendation.implementation_timeline}</span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-800">Impact așteptat: </span>
                        <span className="text-gray-600">{recommendation.expected_impact}</span>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Dedicated Responsibilities */}
        {plan.details?.monitoring_and_optimization?.dedicated_responsibilities && (
          <div className="mb-8">
            <h4 className="font-semibold text-gray-900 mb-4">Responsabilități dedicate:</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {plan.details.monitoring_and_optimization.dedicated_responsibilities.map((role: any, index: number) => (
                <Card 
                  key={index}
                  className="border-l-4 border-indigo-400 bg-indigo-50"
                  padding="md"
                  animation="scaleIn"
                  delay={index + 1}
                  hover="subtle"
                >
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="p-2 bg-indigo-100 rounded-lg">
                      <Briefcase className="h-5 w-5 text-indigo-600" />
                    </div>
                    <h5 className="font-semibold text-gray-900">{role.role}</h5>
                  </div>
                  
                  <div className="space-y-3 text-sm">
                    <div>
                      <span className="font-medium text-gray-800">Responsabilități:</span>
                      <ul className="mt-1 space-y-1">
                        {role.responsibilities?.map((responsibility: string, respIndex: number) => (
                          <li key={respIndex} className="text-gray-600 flex items-start space-x-1">
                            <CheckCircle className="h-3 w-3 text-green-600 mt-0.5 flex-shrink-0" />
                            <span>{responsibility}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    <div className="grid grid-cols-1 gap-2">
                      <div>
                        <span className="font-medium text-gray-800">Timp alocat: </span>
                        <span className="text-gray-600">{role.time_allocation}</span>
                      </div>
                      
                      {role.required_skills && (
                        <div>
                          <span className="font-medium text-gray-800">Abilități necesare: </span>
                          <div className="mt-1 flex flex-wrap gap-1">
                            {role.required_skills.map((skill: string, skillIndex: number) => (
                              <span key={skillIndex} className="px-2 py-1 bg-indigo-100 text-indigo-800 rounded text-xs">
                                {skill}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Response Protocols */}
        <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-green-200" animation="fadeInUp">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-2 bg-green-100 rounded-lg">
              <Shield className="h-6 w-6 text-green-600" />
            </div>
            <h4 className="font-semibold text-gray-900">Protocoale de răspuns</h4>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h5 className="font-medium text-gray-800 mb-3">Timpul de răspuns standard:</h5>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Comentarii:</span>
                  <span className="font-medium">2 ore</span>
                </div>
                <div className="flex justify-between">
                  <span>Mesaje private:</span>
                  <span className="font-medium">1 oră</span>
                </div>
                <div className="flex justify-between">
                  <span>Reclamații:</span>
                  <span className="font-medium">30 minute</span>
                </div>
                <div className="flex justify-between">
                  <span>Escaladare:</span>
                  <span className="font-medium">24 ore</span>
                </div>
              </div>
            </div>
            
            <div>
              <h5 className="font-medium text-gray-800 mb-3">Ghiduri de ton:</h5>
              <ul className="space-y-1 text-sm">
                <li className="flex items-start space-x-2">
                  <CheckCircle className="h-3 w-3 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>Păstrează tonul vocii brandului în toate răspunsurile</span>
                </li>
                <li className="flex items-start space-x-2">
                  <CheckCircle className="h-3 w-3 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>Răspunde empatic și constructiv la feedback negativ</span>
                </li>
                <li className="flex items-start space-x-2">
                  <CheckCircle className="h-3 w-3 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>Oferă soluții concrete și pași următori</span>
                </li>
                <li className="flex items-start space-x-2">
                  <CheckCircle className="h-3 w-3 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>Escaladează situațiile complexe către management</span>
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
                      <span>Document strategic</span>
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="w-full justify-start"
                      onClick={() => {
                        setExportFormat('excel');
                        handleExport();
                      }}
                    >
                      <FileText className="h-4 w-4 mr-2" />
                      <span>Calendar Excel (CSV)</span>
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
                      <span>Calendar editorial</span>
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
                      <span>Export complet (JSON)</span>
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