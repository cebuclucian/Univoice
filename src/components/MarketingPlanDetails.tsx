import React, { useState, useRef } from 'react';
import { 
  Calendar, Target, Users, TrendingUp, BarChart3, Clock, 
  CheckCircle, ArrowLeft, Edit3, Share2, Download, Brain,
  Lightbulb, Zap, MessageSquare, Instagram, Facebook, 
  Twitter, Mail, Globe, Youtube, Music, Monitor, Copy,
  CheckSquare, AlertCircle, Info, Clipboard, FileText, Image
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
  onPlanUpdated?: (updatedPlan: MarketingPlan) => void;
}

export const MarketingPlanDetails: React.FC<MarketingPlanDetailsProps> = ({
  plan,
  onBack,
  onEdit,
  onPlanUpdated
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'calendar' | 'content' | 'analytics'>('overview');
  const [copiedContentId, setCopiedContentId] = useState<string | null>(null);
  const [showExportOptions, setShowExportOptions] = useState(false);
  const [exportFormat, setExportFormat] = useState<'json' | 'text' | 'calendar'>('text');
  const [showShareOptions, setShowShareOptions] = useState(false);
  const exportLinkRef = useRef<HTMLAnchorElement>(null);

  const getPlatformIcon = (platformName: string) => {
    if (!platformName) return <MessageSquare className="h-4 w-4" />;
    
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
    if (!platformName) return 'bg-gray-100 text-gray-700 border-gray-200';
    
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
    
    // Objectives
    text += 'OBIECTIVE:\n';
    if (details?.objectives && details.objectives.length > 0) {
      details.objectives.forEach((obj: string, i: number) => {
        text += `${i+1}. ${obj}\n`;
      });
    } else {
      text += 'N/A\n';
    }
    text += '\n';
    
    // Target Audience
    text += 'AUDIENȚA ȚINTĂ:\n';
    if (details?.target_audience) {
      text += `Principală: ${details.target_audience.primary || 'N/A'}\n`;
      if (details.target_audience.demographics) {
        text += `Demografie: ${details.target_audience.demographics}\n`;
      }
      if (details.target_audience.pain_points && details.target_audience.pain_points.length > 0) {
        text += 'Puncte de durere:\n';
        details.target_audience.pain_points.forEach((point: string, i: number) => {
          text += `- ${point}\n`;
        });
      }
    } else {
      text += 'N/A\n';
    }
    text += '\n';
    
    return text;
  };

  const generateCalendarExport = () => {
    const { title, details } = plan;
    
    let text = `CALENDAR DE CONȚINUT: ${title}\n\n`;
    
    if (details?.editorial_calendar && details.editorial_calendar.length > 0) {
      details.editorial_calendar.forEach((week: any) => {
        text += `SĂPTĂMÂNA ${week.week_number || week.week}\n`;
        text += '='.repeat(20) + '\n\n';
        
        if (week.posts && week.posts.length > 0) {
          week.posts.forEach((post: any) => {
            text += `${(post.platform || 'Platform necunoscut').toUpperCase()} | ${post.content_type || post.type}\n`;
            text += '-'.repeat(40) + '\n';
            text += `Titlu: ${post.title || 'Fără titlu'}\n`;
            text += `Conținut: ${post.main_text || post.description || 'Fără conținut'}\n`;
            
            if (post.hashtags && post.hashtags.length > 0) {
              text += `Hashtag-uri: ${post.hashtags.join(' ')}\n`;
            }
            
            if (post.call_to_action) {
              text += `Call to Action: ${post.call_to_action}\n`;
            }
            
            text += '\n';
          });
        } else {
          text += 'Nu există conținut planificat pentru această săptămână.\n\n';
        }
        
        text += '\n';
      });
    } else {
      text += 'Nu există un calendar de conținut definit pentru acest plan.\n';
    }
    
    return text;
  };

  const handleShare = () => {
    setShowShareOptions(!showShareOptions);
  };

  const generateImagePrompt = async (post: any) => {
    const prompt = `
Creează un prompt pentru generarea unei imagini pentru următoarea postare de social media:

Platforma: ${post.platform || 'Social Media'}
Tipul conținutului: ${post.content_type || post.type || 'Post'}
Titlu: ${post.title || 'Fără titlu'}
Conținut: ${post.main_text || post.description || 'Fără conținut'}

Te rog să creezi un prompt detaliat în engleză pentru un generator de imagini AI (cum ar fi DALL-E, Midjourney, sau Stable Diffusion) care să descrie o imagine potrivită pentru această postare. Promptul trebuie să fie:

1. Descriptiv și specific
2. Să includă stilul vizual potrivit pentru platforma ${post.platform || 'social media'}
3. Să reflecte conținutul și mesajul postării
4. Să fie optimizat pentru engagement pe social media
5. Să respecte dimensiunile și cerințele vizuale ale platformei

Răspunde DOAR cu promptul pentru imagine, fără explicații suplimentare.
`;

    try {
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-gemini-response`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate image prompt');
      }

      const data = await response.json();
      
      // Copy the generated prompt to clipboard
      await navigator.clipboard.writeText(data.response);
      
      // Show success feedback
      setCopiedContentId(`image-prompt-${post.id || Math.random()}`);
      setTimeout(() => setCopiedContentId(null), 3000);
      
    } catch (error) {
      console.error('Error generating image prompt:', error);
      alert('Nu am putut genera promptul pentru imagine. Te rog încearcă din nou.');
    }
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
      {(plan.details?.platforms || plan.details?.tactical_plan_per_platform) && (
        <Card className="shadow-lg" animation="fadeInUp" hover="subtle">
          <div className="flex items-center space-x-3 mb-6">
            <div className="p-2 bg-indigo-100 rounded-xl">
              <Zap className="h-6 w-6 text-indigo-600" />
            </div>
            <h3 className="text-lg font-bold text-gray-900">Platforme și strategii</h3>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {(plan.details.platforms || plan.details.tactical_plan_per_platform || []).map((platform: any, index: number) => (
              <Card 
                key={index}
                className={`border-l-4 ${getPlatformColor(platform.name || platform.platform).includes('blue') ? 'border-blue-400' : 
                  getPlatformColor(platform.name || platform.platform).includes('pink') ? 'border-pink-400' :
                  getPlatformColor(platform.name || platform.platform).includes('sky') ? 'border-sky-400' :
                  getPlatformColor(platform.name || platform.platform).includes('indigo') ? 'border-indigo-400' :
                  'border-gray-400'
                }`}
                padding="sm"
                hover="subtle"
              >
                <div className="flex items-center space-x-3 mb-3">
                  <div className={`p-2 rounded-lg ${getPlatformColor(platform.name || platform.platform)}`}>
                    {getPlatformIcon(platform.name || platform.platform)}
                  </div>
                  <h4 className="font-semibold text-gray-900">{platform.name || platform.platform || 'Platform necunoscut'}</h4>
                </div>
                
                <div className="space-y-2 text-sm">
                  <p className="text-gray-700">{platform.strategy}</p>
                  
                  {platform.content_types && (
                    <div>
                      <span className="font-semibold text-gray-800">Tipuri conținut: </span>
                      <span className="text-gray-600">{Array.isArray(platform.content_types) ? platform.content_types.join(', ') : platform.content_types}</span>
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

        {plan.details?.editorial_calendar ? (
          <div className="space-y-6">
            {plan.details.editorial_calendar.map((week: any, weekIndex: number) => (
              <Card 
                key={weekIndex}
                className="bg-gray-50"
                padding="md"
                animation="fadeInUp"
                delay={weekIndex + 1}
              >
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-bold text-gray-900">
                    Săptămâna {week.week_number || week.week}
                  </h4>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => {
                      const weekContent = week.posts?.map((post: any) => 
                        `${post.platform || 'Platform necunoscut'} (${post.content_type || post.type}): ${post.title || 'Fără titlu'}\n${post.main_text || post.description || 'Fără conținut'}\n${post.hashtags ? post.hashtags.join(' ') : ''}\n${post.call_to_action || ''}`
                      ).join('\n\n') || 'Nu există conținut pentru această săptămână';
                      copyToClipboard(weekContent, `week-${weekIndex}`);
                    }}
                    className="flex items-center space-x-1"
                  >
                    {copiedContentId === `week-${weekIndex}` ? (
                      <>
                        <CheckSquare className="h-3 w-3" />
                        <span>Copiat!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="h-3 w-3" />
                        <span>Copiază săptămâna</span>
                      </>
                    )}
                  </Button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {week.posts?.map((post: any, postIndex: number) => (
                    <Card 
                      key={postIndex}
                      className={`border-l-4 ${getPlatformColor(post.platform)}`}
                      padding="sm"
                      hover="subtle"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <div className={`p-1 rounded ${getPlatformColor(post.platform)}`}>
                            {getPlatformIcon(post.platform)}
                          </div>
                          <span className="font-semibold text-gray-900 text-sm">
                            {post.platform || 'Platform necunoscut'}
                          </span>
                          <span className="text-xs text-gray-500">
                            {post.content_type || post.type || 'Post'}
                          </span>
                        </div>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => copyToClipboard(post.main_text || post.description || 'Fără conținut', `content-${weekIndex}-${postIndex}`)}
                          className="p-1 h-6 w-6"
                        >
                          {copiedContentId === `content-${weekIndex}-${postIndex}` ? (
                            <CheckSquare className="h-3 w-3 text-green-600" />
                          ) : (
                            <Copy className="h-3 w-3" />
                          )}
                        </Button>
                      </div>
                      
                      <h5 className="font-semibold text-gray-800 mb-2 text-sm">
                        {post.title || 'Fără titlu'}
                      </h5>
                      
                      <div className="bg-white p-2 rounded-md border border-gray-100 mb-3 text-xs text-gray-700 max-h-24 overflow-y-auto">
                        {post.main_text || post.description || 'Fără conținut'}
                      </div>
                      
                      {post.hashtags && post.hashtags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-2">
                          {post.hashtags.map((hashtag: string, hashIndex: number) => (
                            <span 
                              key={hashIndex}
                              className="px-1 py-0.5 bg-blue-100 text-blue-800 rounded text-xs"
                            >
                              {hashtag}
                            </span>
                          ))}
                        </div>
                      )}
                      
                      {post.call_to_action && (
                        <div className="text-xs text-gray-600 italic flex items-center space-x-1 mb-2">
                          <Zap className="h-3 w-3 text-amber-500" />
                          <span>CTA: {post.call_to_action}</span>
                        </div>
                      )}

                      {/* Image suggestion section */}
                      <div className="mt-3 pt-3 border-t border-gray-200">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <Image className="h-3 w-3 text-gray-500" />
                            <span className="text-xs text-gray-600">Imagine sugerată</span>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => generateImagePrompt(post)}
                            className="text-xs px-2 py-1 h-6"
                            disabled={copiedContentId === `image-prompt-${post.id || postIndex}`}
                          >
                            {copiedContentId === `image-prompt-${post.id || postIndex}` ? (
                              <>
                                <CheckSquare className="h-3 w-3 mr-1" />
                                Copiat!
                              </>
                            ) : (
                              'Sugereaza imagine'
                            )}
                          </Button>
                        </div>
                      </div>
                    </Card>
                  )) || (
                    <div className="col-span-full text-center py-4 text-gray-500">
                      Nu există postări planificate pentru această săptămână
                    </div>
                  )}
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

        {/* Export Calendar Button */}
        {plan.details?.editorial_calendar && (
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
            <h3 className="text-xl font-bold text-gray-900">Conținut generat</h3>
            <p className="text-gray-600">Postări și materiale create cu AI</p>
          </div>
        </div>

        {(plan.details?.platforms || plan.details?.tactical_plan_per_platform) && (plan.details.platforms || plan.details.tactical_plan_per_platform).length > 0 ? (
          <div className="space-y-8">
            {(plan.details.platforms || plan.details.tactical_plan_per_platform || []).map((platform: any, platformIndex: number) => (
              <Card 
                key={platformIndex}
                className={`border-l-4 ${getPlatformColor(platform.name || platform.platform).includes('blue') ? 'border-blue-400' : 
                  getPlatformColor(platform.name || platform.platform).includes('pink') ? 'border-pink-400' :
                  getPlatformColor(platform.name || platform.platform).includes('sky') ? 'border-sky-400' :
                  getPlatformColor(platform.name || platform.platform).includes('indigo') ? 'border-indigo-400' :
                  'border-gray-400'
                }`}
                padding="md"
                animation="fadeInUp"
                delay={platformIndex + 1}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-lg ${getPlatformColor(platform.name || platform.platform)}`}>
                      {getPlatformIcon(platform.name || platform.platform)}
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">{platform.name || platform.platform || 'Platform necunoscut'}</h4>
                      <p className="text-xs text-gray-600">{platform.posting_frequency || 'Frecvență variabilă'}</p>
                    </div>
                  </div>
                  
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => {
                      const platformContent = `Strategie ${platform.name || platform.platform}:\n${platform.strategy}\n\nTipuri conținut: ${Array.isArray(platform.content_types) ? platform.content_types.join(', ') : platform.content_types || 'N/A'}\nFrecvență: ${platform.posting_frequency || 'N/A'}`;
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
                
                {plan.details?.editorial_calendar && (
                  <div className="space-y-4">
                    <h5 className="font-medium text-gray-800">Exemple de conținut:</h5>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {plan.details.editorial_calendar
                        .flatMap((week: any) => week.posts || [])
                        .filter((post: any) => (post.platform || '').toLowerCase() === (platform.name || platform.platform || '').toLowerCase())
                        .slice(0, 4)
                        .map((post: any, contentIndex: number) => (
                          <Card 
                            key={contentIndex}
                            className="bg-gray-50"
                            padding="sm"
                            hover="subtle"
                          >
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-xs font-medium text-gray-700">{post.content_type || post.type || 'Post'}</span>
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => copyToClipboard(post.main_text || post.description || 'Fără conținut', `platform-content-${platformIndex}-${contentIndex}`)}
                                className="p-1 h-6 w-6"
                              >
                                {copiedContentId === `platform-content-${platformIndex}-${contentIndex}` ? (
                                  <CheckSquare className="h-3 w-3 text-green-600" />
                                ) : (
                                  <Copy className="h-3 w-3" />
                                )}
                              </Button>
                            </div>
                            <h6 className="font-medium text-gray-800 text-sm mb-1">{post.title || 'Fără titlu'}</h6>
                            <p className="text-xs text-gray-600 line-clamp-3">{post.main_text || post.description || 'Fără conținut'}</p>
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
            <h3 className="text-xl font-bold text-gray-900">Metrici și KPI-uri</h3>
            <p className="text-gray-600">Urmărirea performanței campaniei</p>
          </div>
        </div>

        {(plan.details?.kpis || plan.details?.kpis_smart) ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {(plan.details.kpis || plan.details.kpis_smart || []).map((kpi: any, index: number) => (
              <Card 
                key={index}
                className="bg-gradient-to-r from-orange-50 to-red-50 border-orange-200"
                padding="md"
                animation="scaleIn"
                delay={index + 1}
                hover="subtle"
              >
                <div className="text-center">
                  <h4 className="font-semibold text-gray-900 mb-2">{kpi.name || kpi.metric || `KPI ${index + 1}`}</h4>
                  <div className="text-2xl font-bold text-orange-600 mb-2">
                    {kpi.target || kpi.target_value || 'N/A'}
                  </div>
                  <p className="text-gray-600 text-sm">{kpi.description || kpi.measurement || 'Fără descriere'}</p>
                  
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
        {activeTab === 'calendar' && renderCalendar()}
        {activeTab === 'content' && renderContent()}
        {activeTab === 'analytics' && renderAnalytics()}
      </div>
    </div>
  );
};