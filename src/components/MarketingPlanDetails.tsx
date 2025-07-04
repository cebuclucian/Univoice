import React, { useState, useRef } from 'react';
import { 
  Calendar, Target, Users, TrendingUp, BarChart3, Clock, 
  CheckCircle, ArrowLeft, Edit3, Share2, Download, Brain,
  Lightbulb, Zap, MessageSquare, Instagram, Facebook, 
  Twitter, Mail, Globe, Youtube, Music, Monitor, Copy,
  CheckSquare, AlertCircle, Info, Clipboard, FileText,
  Award, DollarSign, Activity, Eye, MousePointer, ShoppingCart
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
  const [activeTab, setActiveTab] = useState<'overview' | 'strategy' | 'calendar' | 'content' | 'analytics'>('overview');
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

  const getKPIIcon = (kpiName: string) => {
    const name = kpiName.toLowerCase();
    if (name.includes('reach') || name.includes('vizibilitate')) return <Eye className="h-5 w-5" />;
    if (name.includes('engagement') || name.includes('interacțiuni')) return <Activity className="h-5 w-5" />;
    if (name.includes('click') || name.includes('trafic')) return <MousePointer className="h-5 w-5" />;
    if (name.includes('conversii') || name.includes('vânzări')) return <ShoppingCart className="h-5 w-5" />;
    if (name.includes('roi') || name.includes('profit')) return <DollarSign className="h-5 w-5" />;
    if (name.includes('brand') || name.includes('awareness')) return <Award className="h-5 w-5" />;
    return <TrendingUp className="h-5 w-5" />;
  };

  const tabs = [
    { id: 'overview', name: 'Prezentare generală', icon: Target },
    { id: 'strategy', name: 'Strategie & KPIs', icon: BarChart3 },
    { id: 'calendar', name: 'Calendar editorial', icon: Calendar },
    { id: 'content', name: 'Conținut detaliat', icon: MessageSquare },
    { id: 'analytics', name: 'Metrici & ROI', icon: TrendingUp }
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
    
    let text = `PLAN DE MARKETING: ${title}\n`;
    text += `Creat pe: ${createdDate}\n\n`;
    
    // Summary
    text += `REZUMAT EXECUTIV:\n${details?.summary || 'N/A'}\n\n`;
    
    // KPIs SMART
    text += 'KPI-URI SMART:\n';
    if (details?.kpis_smart && details.kpis_smart.length > 0) {
      details.kpis_smart.forEach((kpi: any, i: number) => {
        text += `${i+1}. ${kpi.name}\n`;
        text += `   Țintă: ${kpi.target_value}\n`;
        text += `   Măsurare: ${kpi.measurement_method}\n`;
        text += `   Perioada: ${kpi.timeframe}\n`;
        text += `   Responsabil: ${kpi.responsible}\n\n`;
      });
    } else {
      text += 'N/A\n';
    }
    text += '\n';
    
    return text;
  };

  const generateCalendarExport = () => {
    const { title, details } = plan;
    
    let text = `CALENDAR DE CONȚINUT: ${title}\n\n`;
    
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
                text += `Copy: ${post.copy?.main_text || 'N/A'}\n`;
                text += `CTA: ${post.copy?.call_to_action || 'N/A'}\n`;
                text += `Hashtags: ${post.copy?.hashtags?.join(' ') || 'N/A'}\n\n`;
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
    </div>
  );

  const renderStrategyKpis = () => (
    <div className="space-y-8">
      {/* KPIs SMART Section */}
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

        {plan.details?.kpis_smart && plan.details.kpis_smart.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {plan.details.kpis_smart.map((kpi: any, index: number) => (
              <Card 
                key={index}
                className="bg-gradient-to-r from-green-50 to-blue-50 border-green-200"
                padding="md"
                animation="scaleIn"
                delay={index + 1}
                hover="subtle"
              >
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <div className="p-2 bg-green-100 rounded-lg">
                      {getKPIIcon(kpi.name)}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-bold text-gray-900 mb-2">{kpi.name}</h4>
                      <p className="text-sm text-gray-700 mb-3">{kpi.description}</p>
                      
                      <div className="grid grid-cols-2 gap-3 text-xs">
                        <div>
                          <span className="font-semibold text-gray-800">Țintă: </span>
                          <span className="text-green-700 font-medium">{kpi.target_value}</span>
                        </div>
                        <div>
                          <span className="font-semibold text-gray-800">Perioada: </span>
                          <span className="text-gray-700">{kpi.timeframe}</span>
                        </div>
                        <div>
                          <span className="font-semibold text-gray-800">Responsabil: </span>
                          <span className="text-gray-700">{kpi.responsible}</span>
                        </div>
                        <div>
                          <span className="font-semibold text-gray-800">Măsurare: </span>
                          <span className="text-gray-700">{kpi.measurement_method}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* SMART Criteria */}
                  <div className="pt-3 border-t border-green-200">
                    <h5 className="font-semibold text-gray-800 mb-2 text-sm">Criterii SMART:</h5>
                    <div className="space-y-1 text-xs">
                      <div><span className="font-medium text-green-700">S</span>pecific: {kpi.specific}</div>
                      <div><span className="font-medium text-green-700">M</span>ăsurabil: {kpi.measurable}</div>
                      <div><span className="font-medium text-green-700">A</span>tins: {kpi.achievable}</div>
                      <div><span className="font-medium text-green-700">R</span>elevant: {kpi.relevant}</div>
                      <div><span className="font-medium text-green-700">T</span>emporal: {kpi.time_bound}</div>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="text-center py-8" animation="bounceIn">
            <div className="p-4 bg-gray-100 rounded-2xl mb-4 inline-block">
              <Award className="h-8 w-8 text-gray-500" />
            </div>
            <h4 className="text-lg font-semibold text-gray-900 mb-2">
              KPI-uri în dezvoltare
            </h4>
            <p className="text-gray-600">
              KPI-urile SMART vor fi disponibile în curând
            </p>
          </Card>
        )}
      </Card>

      {/* Platform Selection Justification */}
      {plan.details?.platform_selection_justification && (
        <Card className="shadow-lg" animation="slideInLeft" delay={1}>
          <div className="flex items-center space-x-3 mb-6">
            <div className="p-3 bg-blue-100 rounded-xl">
              <Lightbulb className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">Justificarea selecției platformelor</h3>
              <p className="text-gray-600">De ce am ales aceste platforme</p>
            </div>
          </div>

          <div className="space-y-6">
            {/* Selected Platforms */}
            <div>
              <h4 className="font-semibold text-gray-900 mb-4">Platforme selectate:</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {plan.details.platform_selection_justification.selected_platforms?.map((platform: any, index: number) => (
                  <Card 
                    key={index}
                    className={`border-l-4 ${getPlatformColor(platform.platform)}`}
                    padding="sm"
                    animation="fadeInUp"
                    delay={index + 1}
                    hover="subtle"
                  >
                    <div className="flex items-start space-x-3">
                      <div className={`p-2 rounded-lg ${getPlatformColor(platform.platform)}`}>
                        {getPlatformIcon(platform.platform)}
                      </div>
                      <div className="flex-1">
                        <h5 className="font-semibold text-gray-900 mb-2">{platform.platform}</h5>
                        <p className="text-sm text-gray-700 mb-3">{platform.justification}</p>
                        
                        <div className="space-y-2 text-xs">
                          <div>
                            <span className="font-semibold text-gray-800">Suprapunere audiență: </span>
                            <span className="text-gray-700">{platform.audience_overlap}</span>
                          </div>
                          <div>
                            <span className="font-semibold text-gray-800">ROI așteptat: </span>
                            <span className="text-green-700 font-medium">{platform.expected_roi}</span>
                          </div>
                          <div>
                            <span className="font-semibold text-gray-800">Prioritate: </span>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              platform.priority_level === 'high' ? 'bg-red-100 text-red-800' :
                              platform.priority_level === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-green-100 text-green-800'
                            }`}>
                              {platform.priority_level}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>

            {/* Excluded Platforms */}
            {plan.details.platform_selection_justification.excluded_platforms?.length > 0 && (
              <div>
                <h4 className="font-semibold text-gray-900 mb-4">Platforme excluse:</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {plan.details.platform_selection_justification.excluded_platforms.map((platform: any, index: number) => (
                    <Card 
                      key={index}
                      className="bg-gray-50 border-gray-200"
                      padding="sm"
                      animation="fadeInUp"
                      delay={index + 1}
                    >
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-gray-200 rounded-lg">
                          {getPlatformIcon(platform.platform)}
                        </div>
                        <div>
                          <h5 className="font-medium text-gray-800">{platform.platform}</h5>
                          <p className="text-xs text-gray-600">{platform.reason}</p>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Budget Allocation Summary */}
      {plan.details?.budget_allocation_summary && (
        <Card className="shadow-lg" animation="slideInLeft" delay={2}>
          <div className="flex items-center space-x-3 mb-6">
            <div className="p-3 bg-purple-100 rounded-xl">
              <DollarSign className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">Alocarea bugetului</h3>
              <p className="text-gray-600">Distribuția resurselor financiare</p>
            </div>
          </div>

          <div className="space-y-6">
            {/* Total Budget */}
            <div className="text-center">
              <div className="inline-flex items-center space-x-2 bg-purple-100 px-6 py-3 rounded-xl">
                <DollarSign className="h-6 w-6 text-purple-600" />
                <span className="text-2xl font-bold text-purple-900">
                  {plan.details.budget_allocation_summary.total_budget}
                </span>
                <span className="text-purple-700">buget total</span>
              </div>
            </div>

            {/* Allocation by Channel */}
            {plan.details.budget_allocation_summary.allocation_by_channel?.length > 0 && (
              <div>
                <h4 className="font-semibold text-gray-900 mb-4">Alocarea pe canale:</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {plan.details.budget_allocation_summary.allocation_by_channel.map((channel: any, index: number) => (
                    <Card 
                      key={index}
                      className="bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200"
                      padding="sm"
                      animation="scaleIn"
                      delay={index + 1}
                      hover="subtle"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h5 className="font-semibold text-gray-900">{channel.channel}</h5>
                        <div className="text-right">
                          <div className="text-lg font-bold text-purple-700">{channel.percentage}</div>
                          <div className="text-sm text-gray-600">{channel.amount}</div>
                        </div>
                      </div>
                      <p className="text-xs text-gray-700">{channel.justification}</p>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Allocation by Type */}
            {plan.details.budget_allocation_summary.allocation_by_type && (
              <div>
                <h4 className="font-semibold text-gray-900 mb-4">Alocarea pe tipuri de cheltuieli:</h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {Object.entries(plan.details.budget_allocation_summary.allocation_by_type).map(([type, percentage], index) => (
                    <Card 
                      key={type}
                      className="text-center bg-purple-50 border-purple-200"
                      padding="sm"
                      animation="bounceIn"
                      delay={index + 1}
                    >
                      <div className="text-lg font-bold text-purple-700">{percentage as string}</div>
                      <div className="text-xs text-gray-700 capitalize">
                        {type.replace(/_/g, ' ')}
                      </div>
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
          <div className="space-y-6">
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
                      const platformContent = `Calendar ${platform.platform}:\n${platform.strategy}`;
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
                        <span>Copiază</span>
                      </>
                    )}
                  </Button>
                </div>

                {platform.editorial_calendar?.month_1 && (
                  <div className="space-y-4">
                    {platform.editorial_calendar.month_1.map((week: any, weekIndex: number) => (
                      <Card 
                        key={weekIndex}
                        className="bg-gray-50"
                        padding="sm"
                        animation="slideInRight"
                        delay={weekIndex + 1}
                      >
                        <h5 className="font-semibold text-gray-900 mb-3">Săptămâna {week.week}</h5>
                        
                        {week.posts && week.posts.length > 0 ? (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {week.posts.map((post: any, postIndex: number) => (
                              <Card 
                                key={postIndex}
                                className="bg-white border border-gray-200"
                                padding="sm"
                                hover="subtle"
                              >
                                <div className="space-y-2">
                                  <div className="flex items-center justify-between">
                                    <span className="text-xs font-medium text-gray-700">{post.post_id}</span>
                                    <span className="text-xs text-gray-500">{post.scheduled_date}</span>
                                  </div>
                                  
                                  <div className="text-sm text-gray-800 line-clamp-3">
                                    {post.copy?.main_text || 'Conținut în dezvoltare'}
                                  </div>
                                  
                                  {post.copy?.hashtags && (
                                    <div className="flex flex-wrap gap-1">
                                      {post.copy.hashtags.slice(0, 3).map((hashtag: string, hashIndex: number) => (
                                        <span 
                                          key={hashIndex}
                                          className="px-1 py-0.5 bg-blue-100 text-blue-800 rounded text-xs"
                                        >
                                          {hashtag}
                                        </span>
                                      ))}
                                    </div>
                                  )}
                                  
                                  {post.copy?.call_to_action && (
                                    <div className="text-xs text-purple-700 italic">
                                      CTA: {post.copy.call_to_action}
                                    </div>
                                  )}
                                </div>
                              </Card>
                            ))}
                          </div>
                        ) : (
                          <p className="text-sm text-gray-500 italic">Nu sunt postări programate pentru această săptămână</p>
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
            <p className="text-gray-600">Postări complete cu brief-uri vizuale și specificații</p>
          </div>
        </div>

        {plan.details?.tactical_plan_per_platform && plan.details.tactical_plan_per_platform.length > 0 ? (
          <div className="space-y-8">
            {plan.details.tactical_plan_per_platform.map((platform: any, platformIndex: number) => (
              <Card 
                key={platformIndex}
                className={`border-l-4 ${getPlatformColor(platform.platform)}`}
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
                      <p className="text-xs text-gray-600">{platform.posting_frequency || 'Frecvență variabilă'}</p>
                    </div>
                  </div>
                  
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => {
                      const platformContent = `Strategie ${platform.platform}:\n${platform.strategy}\n\nTipuri conținut: ${platform.content_types?.join(', ') || 'N/A'}\nFrecvență: ${platform.posting_frequency || 'N/A'}`;
                      copyToClipboard(platformContent, `platform-content-${platformIndex}`);
                    }}
                    className="flex items-center space-x-1"
                  >
                    {copiedContentId === `platform-content-${platformIndex}` ? (
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
                
                <div className="bg-white p-4 rounded-lg border border-gray-100 mb-6">
                  <h5 className="font-medium text-gray-800 mb-2">Strategie:</h5>
                  <p className="text-gray-700 text-sm">{platform.strategy}</p>
                </div>
                
                {/* Detailed Content from Editorial Calendar */}
                {platform.editorial_calendar?.month_1 && (
                  <div className="space-y-6">
                    <h5 className="font-medium text-gray-800">Conținut detaliat:</h5>
                    {platform.editorial_calendar.month_1.map((week: any, weekIndex: number) => (
                      <div key={weekIndex} className="space-y-4">
                        <h6 className="font-semibold text-gray-900 text-sm">Săptămâna {week.week}</h6>
                        {week.posts && week.posts.length > 0 ? (
                          <div className="space-y-4">
                            {week.posts.map((post: any, postIndex: number) => (
                              <Card 
                                key={postIndex}
                                className="bg-gray-50 border border-gray-200"
                                padding="md"
                                hover="subtle"
                              >
                                <div className="space-y-4">
                                  {/* Post Header */}
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-3">
                                      <span className="text-sm font-medium text-gray-900">{post.post_id}</span>
                                      <span className="text-xs text-gray-500">{post.scheduled_date}</span>
                                    </div>
                                    <Button 
                                      variant="ghost" 
                                      size="sm"
                                      onClick={() => {
                                        const fullContent = `${post.copy?.main_text || ''}\n\nCTA: ${post.copy?.call_to_action || ''}\n\nHashtags: ${post.copy?.hashtags?.join(' ') || ''}`;
                                        copyToClipboard(fullContent, `post-${platformIndex}-${weekIndex}-${postIndex}`);
                                      }}
                                      className="p-1 h-6 w-6"
                                    >
                                      {copiedContentId === `post-${platformIndex}-${weekIndex}-${postIndex}` ? (
                                        <CheckSquare className="h-3 w-3 text-green-600" />
                                      ) : (
                                        <Copy className="h-3 w-3" />
                                      )}
                                    </Button>
                                  </div>

                                  {/* Main Text - FULL CONTENT */}
                                  {post.copy?.main_text && (
                                    <div className="bg-white p-4 rounded-lg border border-gray-100">
                                      <h6 className="font-semibold text-gray-800 mb-2 text-sm">Copy principal:</h6>
                                      <div className="text-gray-700 text-sm leading-relaxed whitespace-pre-wrap">
                                        {post.copy.main_text}
                                      </div>
                                    </div>
                                  )}

                                  {/* Call to Action */}
                                  {post.copy?.call_to_action && (
                                    <div className="bg-purple-50 p-3 rounded-lg border border-purple-200">
                                      <h6 className="font-semibold text-purple-800 mb-1 text-sm">Call to Action:</h6>
                                      <p className="text-purple-700 text-sm">{post.copy.call_to_action}</p>
                                    </div>
                                  )}

                                  {/* Hashtags */}
                                  {post.copy?.hashtags && post.copy.hashtags.length > 0 && (
                                    <div>
                                      <h6 className="font-semibold text-gray-800 mb-2 text-sm">Hashtag-uri:</h6>
                                      <div className="flex flex-wrap gap-1">
                                        {post.copy.hashtags.map((hashtag: string, hashIndex: number) => (
                                          <span 
                                            key={hashIndex}
                                            className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium"
                                          >
                                            {hashtag}
                                          </span>
                                        ))}
                                      </div>
                                    </div>
                                  )}

                                  {/* Visual Brief */}
                                  {post.visual_brief && (
                                    <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                                      <h6 className="font-semibold text-yellow-800 mb-3 text-sm">Brief vizual:</h6>
                                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                                        <div>
                                          <span className="font-semibold text-yellow-800">Tip: </span>
                                          <span className="text-yellow-700">{post.visual_brief.type}</span>
                                        </div>
                                        <div>
                                          <span className="font-semibold text-yellow-800">Dimensiuni: </span>
                                          <span className="text-yellow-700">{post.visual_brief.dimensions}</span>
                                        </div>
                                        <div className="md:col-span-2">
                                          <span className="font-semibold text-yellow-800">Ghid stil: </span>
                                          <span className="text-yellow-700">{post.visual_brief.style_guidelines}</span>
                                        </div>
                                        {post.visual_brief.mandatory_elements && (
                                          <div className="md:col-span-2">
                                            <span className="font-semibold text-yellow-800">Elemente obligatorii: </span>
                                            <span className="text-yellow-700">{post.visual_brief.mandatory_elements.join(', ')}</span>
                                          </div>
                                        )}
                                        {post.visual_brief.text_overlay && (
                                          <div className="md:col-span-2">
                                            <span className="font-semibold text-yellow-800">Text pe imagine: </span>
                                            <span className="text-yellow-700">{post.visual_brief.text_overlay}</span>
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  )}

                                  {/* Promotion Budget */}
                                  {post.promotion_budget && (
                                    <div className="bg-green-50 p-3 rounded-lg border border-green-200">
                                      <h6 className="font-semibold text-green-800 mb-1 text-sm">Buget promovare:</h6>
                                      <p className="text-green-700 text-sm font-medium">{post.promotion_budget}</p>
                                    </div>
                                  )}

                                  {/* Target Audience Specific */}
                                  {post.target_audience_specific && (
                                    <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-200">
                                      <h6 className="font-semibold text-indigo-800 mb-3 text-sm">Audiența țintă specifică:</h6>
                                      <div className="space-y-2 text-xs">
                                        {post.target_audience_specific.demographics && (
                                          <div>
                                            <span className="font-semibold text-indigo-800">Demografia: </span>
                                            <span className="text-indigo-700">{post.target_audience_specific.demographics}</span>
                                          </div>
                                        )}
                                        {post.target_audience_specific.interests && (
                                          <div>
                                            <span className="font-semibold text-indigo-800">Interese: </span>
                                            <span className="text-indigo-700">{post.target_audience_specific.interests.join(', ')}</span>
                                          </div>
                                        )}
                                        {post.target_audience_specific.behaviors && (
                                          <div>
                                            <span className="font-semibold text-indigo-800">Comportamente: </span>
                                            <span className="text-indigo-700">{post.target_audience_specific.behaviors.join(', ')}</span>
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  )}

                                  {/* Individual Metrics */}
                                  {post.individual_metrics && (
                                    <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                                      <h6 className="font-semibold text-orange-800 mb-3 text-sm">Metrici individuale:</h6>
                                      <div className="grid grid-cols-2 gap-3 text-xs">
                                        {post.individual_metrics.primary_kpi && (
                                          <div>
                                            <span className="font-semibold text-orange-800">KPI principal: </span>
                                            <span className="text-orange-700">{post.individual_metrics.primary_kpi}</span>
                                          </div>
                                        )}
                                        {post.individual_metrics.target_reach && (
                                          <div>
                                            <span className="font-semibold text-orange-800">Reach țintă: </span>
                                            <span className="text-orange-700">{post.individual_metrics.target_reach}</span>
                                          </div>
                                        )}
                                        {post.individual_metrics.target_engagement && (
                                          <div>
                                            <span className="font-semibold text-orange-800">Engagement țintă: </span>
                                            <span className="text-orange-700">{post.individual_metrics.target_engagement}</span>
                                          </div>
                                        )}
                                        {post.individual_metrics.target_clicks && (
                                          <div>
                                            <span className="font-semibold text-orange-800">Click-uri țintă: </span>
                                            <span className="text-orange-700">{post.individual_metrics.target_clicks}</span>
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  )}

                                  {/* Response Protocol */}
                                  {post.response_protocol && (
                                    <div className="bg-gray-100 p-4 rounded-lg border border-gray-300">
                                      <h6 className="font-semibold text-gray-800 mb-3 text-sm">Protocol de răspuns:</h6>
                                      <div className="space-y-2 text-xs">
                                        {post.response_protocol.comment_response_time && (
                                          <div>
                                            <span className="font-semibold text-gray-800">Timp răspuns comentarii: </span>
                                            <span className="text-gray-700">{post.response_protocol.comment_response_time}</span>
                                          </div>
                                        )}
                                        {post.response_protocol.tone_guidelines && (
                                          <div>
                                            <span className="font-semibold text-gray-800">Ghid ton răspunsuri: </span>
                                            <span className="text-gray-700">{post.response_protocol.tone_guidelines}</span>
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </Card>
                            ))}
                          </div>
                        ) : (
                          <p className="text-sm text-gray-500 italic">Nu sunt postări pentru această săptămână</p>
                        )}
                      </div>
                    ))}
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
        {activeTab === 'strategy' && renderStrategyKpis()}
        {activeTab === 'calendar' && renderCalendar()}
        {activeTab === 'content' && renderContent()}
        {activeTab === 'analytics' && renderAnalytics()}
      </div>
    </div>
  );
};