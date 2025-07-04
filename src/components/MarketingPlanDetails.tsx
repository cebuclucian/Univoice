import React, { useState, useRef } from 'react';
import { 
  Calendar, Target, Users, TrendingUp, BarChart3, Clock, 
  CheckCircle, ArrowLeft, Edit3, Share2, Download, Brain,
  Lightbulb, Zap, MessageSquare, Instagram, Facebook, 
  Twitter, Mail, Globe, Youtube, Music, Monitor, Copy,
  CheckSquare, AlertCircle, Info, Clipboard, FileText, Image,
  Wand2, Sparkles, Eye
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
  const [activeTab, setActiveTab] = useState<'overview' | 'calendar' | 'content' | 'analytics' | 'preview'>('overview');
  const [copiedContentId, setCopiedContentId] = useState<string | null>(null);
  const [showExportOptions, setShowExportOptions] = useState(false);
  const [exportFormat, setExportFormat] = useState<'json' | 'text' | 'calendar'>('text');
  const [showShareOptions, setShowShareOptions] = useState(false);
  const [copiedImagePrompt, setCopiedImagePrompt] = useState<string | null>(null);
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
    { id: 'calendar', name: 'Calendar conținut', icon: Calendar },
    { id: 'content', name: 'Conținut generat', icon: MessageSquare },
    { id: 'preview', name: 'Preview postări', icon: Eye },
    { id: 'analytics', name: 'Metrici & KPI', icon: BarChart3 }
  ];

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedContentId(id);
      setTimeout(() => setCopiedContentId(null), 2000);
    });
  };

  const generateImagePrompt = (post: any, platform: string, brandVoice?: any) => {
    const brandPersonality = brandVoice?.personality ? 
      (Array.isArray(brandVoice.personality) ? brandVoice.personality.join(', ') : brandVoice.personality) : 
      'profesional, prietenos';
    
    const brandTone = brandVoice?.tone ? 
      (Array.isArray(brandVoice.tone) ? brandVoice.tone.join(', ') : brandVoice.tone) : 
      'cald, inspirațional';

    const platformSpecs = {
      'facebook': 'format pătrat (1:1) sau landscape (16:9), rezoluție înaltă',
      'instagram': 'format pătrat (1:1) pentru feed sau vertical (9:16) pentru stories',
      'linkedin': 'format landscape (16:9) sau pătrat (1:1), aspect profesional',
      'twitter': 'format landscape (16:9) sau pătrat (1:1)',
      'youtube': 'format landscape (16:9), thumbnail style',
      'tiktok': 'format vertical (9:16)',
      'email': 'format landscape (16:9) sau pătrat (1:1)',
      'website': 'format landscape (16:9) sau pătrat (1:1)'
    };

    const platformSpec = platformSpecs[platform.toLowerCase()] || 'format pătrat (1:1)';

    const prompt = `Creează o imagine pentru ${platform} cu următoarele specificații:

CONȚINUTUL POSTĂRII:
Titlu: ${post.title || 'Postare marketing'}
Descriere: ${post.description || post.main_text || 'Conținut marketing'}

SPECIFICAȚII TEHNICE:
- ${platformSpec}
- Calitate înaltă, profesională
- Optimizată pentru ${platform}

STILUL VIZUAL:
- Personalitatea brandului: ${brandPersonality}
- Tonul comunicării: ${brandTone}
- Stil modern, atractiv vizual
- Culori vibrante dar profesionale
- Typography clar și lizibil

ELEMENTE DE INCLUS:
- Vizual relevant pentru conținutul postării
- Spațiu pentru text dacă este necesar
- Elemente grafice care să reflecte personalitatea brandului
- Compoziție echilibrată și atractivă

EVITĂ:
- Imagini generice sau stock photos
- Text prea mic sau greu de citit
- Culori care nu se potrivesc cu tonul brandului
- Elemente care distrag de la mesajul principal

Prompt pentru AI: "${post.title || 'Marketing content'}, ${brandPersonality} brand personality, ${brandTone} tone, ${platformSpec}, professional marketing visual, modern design, vibrant colors, clean typography, engaging composition"`;

    return prompt;
  };

  const handleImageSuggestion = (post: any, platform: string, postId: string) => {
    const prompt = generateImagePrompt(post, platform, plan.details?.brand_voice_used);
    copyToClipboard(prompt, `image-prompt-${postId}`);
    setCopiedImagePrompt(postId);
    setTimeout(() => setCopiedImagePrompt(null), 3000);
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
    
    // Strategy
    text += 'STRATEGIE:\n';
    if (details?.strategy) {
      if (details.strategy.positioning) {
        text += `Poziționare: ${details.strategy.positioning}\n`;
      }
      if (details.strategy.key_messages && details.strategy.key_messages.length > 0) {
        text += 'Mesaje cheie:\n';
        details.strategy.key_messages.forEach((msg: string, i: number) => {
          text += `- ${msg}\n`;
        });
      }
      if (details.strategy.content_pillars && details.strategy.content_pillars.length > 0) {
        text += 'Piloni de conținut: ' + details.strategy.content_pillars.join(', ') + '\n';
      }
    } else {
      text += 'N/A\n';
    }
    text += '\n';
    
    // Platforms
    text += 'PLATFORME:\n';
    if (details?.platforms && details.platforms.length > 0) {
      details.platforms.forEach((platform: any, i: number) => {
        text += `${i+1}. ${platform.name}\n`;
        text += `   Strategie: ${platform.strategy}\n`;
        if (platform.content_types) {
          text += `   Tipuri conținut: ${platform.content_types.join(', ')}\n`;
        }
        if (platform.posting_frequency) {
          text += `   Frecvență: ${platform.posting_frequency}\n`;
        }
        text += '\n';
      });
    } else {
      text += 'N/A\n';
    }
    text += '\n';
    
    // Content Calendar
    text += 'CALENDAR DE CONȚINUT:\n';
    if (details?.content_calendar && details.content_calendar.length > 0) {
      details.content_calendar.forEach((week: any) => {
        text += `Săptămâna ${week.week}:\n`;
        if (week.content && week.content.length > 0) {
          week.content.forEach((content: any, i: number) => {
            text += `${i+1}. ${content.platform} - ${content.type}\n`;
            text += `   Titlu: ${content.title}\n`;
            text += `   Descriere: ${content.description}\n`;
            if (content.hashtags) {
              text += `   Hashtag-uri: ${content.hashtags.join(' ')}\n`;
            }
            if (content.call_to_action) {
              text += `   CTA: ${content.call_to_action}\n`;
            }
            text += '\n';
          });
        } else {
          text += '   Nu există conținut planificat\n\n';
        }
      });
    } else {
      text += 'N/A\n';
    }
    
    return text;
  };

  const generateCalendarExport = () => {
    const { title, details } = plan;
    
    let text = `CALENDAR DE CONȚINUT: ${title}\n\n`;
    
    if (details?.content_calendar && details.content_calendar.length > 0) {
      details.content_calendar.forEach((week: any) => {
        text += `SĂPTĂMÂNA ${week.week}\n`;
        text += '='.repeat(20) + '\n\n';
        
        if (week.content && week.content.length > 0) {
          week.content.forEach((content: any) => {
            text += `${content.platform.toUpperCase()} | ${content.type}\n`;
            text += '-'.repeat(40) + '\n';
            text += `Titlu: ${content.title}\n`;
            text += `Descriere: ${content.description}\n`;
            
            if (content.hashtags && content.hashtags.length > 0) {
              text += `Hashtag-uri: ${content.hashtags.join(' ')}\n`;
            }
            
            if (content.call_to_action) {
              text += `Call to Action: ${content.call_to_action}\n`;
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
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-bold text-gray-900">
                    Săptămâna {week.week}
                  </h4>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => {
                      const weekContent = week.content?.map((c: any) => 
                        `${c.platform} (${c.type}): ${c.title}\n${c.description}\n${c.hashtags ? c.hashtags.join(' ') : ''}\n${c.call_to_action || ''}`
                      ).join('\n\n');
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
                  {week.content?.map((content: any, contentIndex: number) => (
                    <Card 
                      key={contentIndex}
                      className={`border-l-4 ${getPlatformColor(content.platform)}`}
                      padding="sm"
                      hover="subtle"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
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
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => copyToClipboard(content.description, `content-${weekIndex}-${contentIndex}`)}
                          className="p-1 h-6 w-6"
                        >
                          {copiedContentId === `content-${weekIndex}-${contentIndex}` ? (
                            <CheckSquare className="h-3 w-3 text-green-600" />
                          ) : (
                            <Copy className="h-3 w-3" />
                          )}
                        </Button>
                      </div>
                      
                      <h5 className="font-semibold text-gray-800 mb-2 text-sm">
                        {content.title}
                      </h5>
                      
                      <div className="bg-white p-2 rounded-md border border-gray-100 mb-3 text-xs text-gray-700 max-h-24 overflow-y-auto">
                        {content.description}
                      </div>
                      
                      {content.hashtags && (
                        <div className="flex flex-wrap gap-1 mb-2">
                          {content.hashtags.map((hashtag: string, hashIndex: number) => (
                            <span 
                              key={hashIndex}
                              className="px-1 py-0.5 bg-blue-100 text-blue-800 rounded text-xs"
                            >
                              {hashtag}
                            </span>
                          ))}
                        </div>
                      )}
                      
                      {content.call_to_action && (
                        <div className="text-xs text-gray-600 italic flex items-center space-x-1">
                          <Zap className="h-3 w-3 text-amber-500" />
                          <span>CTA: {content.call_to_action}</span>
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

        {/* Export Calendar Button */}
        {plan.details?.content_calendar && (
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

        {plan.details?.platforms && plan.details.platforms.length > 0 ? (
          <div className="space-y-8">
            {plan.details.platforms.map((platform: any, platformIndex: number) => (
              <Card 
                key={platformIndex}
                className={`border-l-4 ${getPlatformColor(platform.name).includes('blue') ? 'border-blue-400' : 
                  getPlatformColor(platform.name).includes('pink') ? 'border-pink-400' :
                  getPlatformColor(platform.name).includes('sky') ? 'border-sky-400' :
                  getPlatformColor(platform.name).includes('indigo') ? 'border-indigo-400' :
                  'border-gray-400'
                }`}
                padding="md"
                animation="fadeInUp"
                delay={platformIndex + 1}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-lg ${getPlatformColor(platform.name)}`}>
                      {getPlatformIcon(platform.name)}
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">{platform.name}</h4>
                      <p className="text-xs text-gray-600">{platform.posting_frequency || 'Frecvență variabilă'}</p>
                    </div>
                  </div>
                  
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => {
                      const platformContent = `Strategie ${platform.name}:\n${platform.strategy}\n\nTipuri conținut: ${platform.content_types?.join(', ') || 'N/A'}\nFrecvență: ${platform.posting_frequency || 'N/A'}`;
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
                
                {plan.details?.content_calendar && (
                  <div className="space-y-4">
                    <h5 className="font-medium text-gray-800">Exemple de conținut:</h5>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {plan.details.content_calendar
                        .flatMap((week: any) => week.content || [])
                        .filter((content: any) => content.platform.toLowerCase() === platform.name.toLowerCase())
                        .slice(0, 4)
                        .map((content: any, contentIndex: number) => (
                          <Card 
                            key={contentIndex}
                            className="bg-gray-50"
                            padding="sm"
                            hover="subtle"
                          >
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-xs font-medium text-gray-700">{content.type}</span>
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => copyToClipboard(content.description, `platform-content-${platformIndex}-${contentIndex}`)}
                                className="p-1 h-6 w-6"
                              >
                                {copiedContentId === `platform-content-${platformIndex}-${contentIndex}` ? (
                                  <CheckSquare className="h-3 w-3 text-green-600" />
                                ) : (
                                  <Copy className="h-3 w-3" />
                                )}
                              </Button>
                            </div>
                            <h6 className="font-medium text-gray-800 text-sm mb-1">{content.title}</h6>
                            <p className="text-xs text-gray-600 line-clamp-3">{content.description}</p>
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

  const renderPreview = () => (
    <div className="space-y-6">
      <Card className="shadow-lg" animation="slideInLeft">
        <div className="flex items-center space-x-3 mb-6">
          <div className="p-3 bg-indigo-100 rounded-xl">
            <Eye className="h-6 w-6 text-indigo-600" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900">Preview postări</h3>
            <p className="text-gray-600">Previzualizare detaliată a tuturor postărilor generate</p>
          </div>
        </div>

        {plan.details?.editorial_calendar && plan.details.editorial_calendar.length > 0 ? (
          <div className="space-y-8">
            {plan.details.editorial_calendar.map((week: any, weekIndex: number) => (
              <Card 
                key={weekIndex}
                className="bg-gradient-to-r from-gray-50 to-blue-50 border-gray-200"
                padding="md"
                animation="fadeInUp"
                delay={weekIndex + 1}
              >
                <div className="flex items-center justify-between mb-6">
                  <h4 className="text-xl font-bold text-gray-900">
                    Săptămâna {week.week_number || weekIndex + 1}
                  </h4>
                  <span className="text-sm text-gray-600">
                    {week.posts?.length || 0} postări planificate
                  </span>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {week.posts?.map((post: any, postIndex: number) => {
                    const postId = `${weekIndex}-${postIndex}`;
                    return (
                      <Card 
                        key={postIndex}
                        className={`border-l-4 ${getPlatformColor(post.platform)} shadow-md`}
                        padding="md"
                        hover="subtle"
                      >
                        {/* Post Header */}
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center space-x-3">
                            <div className={`p-2 rounded-lg ${getPlatformColor(post.platform)}`}>
                              {getPlatformIcon(post.platform)}
                            </div>
                            <div>
                              <h5 className="font-semibold text-gray-900">{post.platform}</h5>
                              <span className="text-xs text-gray-600">{post.content_type}</span>
                            </div>
                          </div>
                          <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full">
                            {post.post_id || `P${String(postIndex + 1).padStart(3, '0')}`}
                          </span>
                        </div>

                        {/* Post Content */}
                        <div className="space-y-4">
                          {/* Title */}
                          <div>
                            <h6 className="font-semibold text-gray-800 mb-2">Titlu:</h6>
                            <p className="text-gray-700 bg-white p-3 rounded-lg border border-gray-200">
                              {post.title}
                            </p>
                          </div>

                          {/* Main Text */}
                          <div>
                            <h6 className="font-semibold text-gray-800 mb-2">Conținut principal:</h6>
                            <div className="bg-white p-3 rounded-lg border border-gray-200 max-h-32 overflow-y-auto">
                              <p className="text-gray-700 text-sm leading-relaxed">
                                {post.main_text || post.description}
                              </p>
                            </div>
                            <div className="flex justify-end mt-2">
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => copyToClipboard(post.main_text || post.description, `main-text-${postId}`)}
                                className="text-xs"
                              >
                                {copiedContentId === `main-text-${postId}` ? (
                                  <>
                                    <CheckSquare className="h-3 w-3 mr-1" />
                                    Copiat!
                                  </>
                                ) : (
                                  <>
                                    <Copy className="h-3 w-3 mr-1" />
                                    Copiază text
                                  </>
                                )}
                              </Button>
                            </div>
                          </div>

                          {/* Visual Brief */}
                          <div>
                            <div className="flex items-center justify-between mb-2">
                              <h6 className="font-semibold text-gray-800">Brief vizual:</h6>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => handleImageSuggestion(post, post.platform, postId)}
                                className="flex items-center space-x-1 text-xs"
                              >
                                {copiedImagePrompt === postId ? (
                                  <>
                                    <CheckSquare className="h-3 w-3" />
                                    <span>Prompt copiat!</span>
                                  </>
                                ) : (
                                  <>
                                    <Wand2 className="h-3 w-3" />
                                    <span>Sugerează imagine</span>
                                  </>
                                )}
                              </Button>
                            </div>
                            <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-3 rounded-lg border border-purple-200">
                              <p className="text-gray-700 text-sm">
                                {post.visual_brief || 'Imagine relevantă pentru conținutul postării, în stilul brandului'}
                              </p>
                            </div>
                          </div>

                          {/* Hashtags */}
                          {post.hashtags && post.hashtags.length > 0 && (
                            <div>
                              <h6 className="font-semibold text-gray-800 mb-2">Hashtag-uri:</h6>
                              <div className="flex flex-wrap gap-1">
                                {post.hashtags.map((hashtag: string, hashIndex: number) => (
                                  <span 
                                    key={hashIndex}
                                    className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium"
                                  >
                                    {hashtag}
                                  </span>
                                ))}
                              </div>
                              <div className="flex justify-end mt-2">
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  onClick={() => copyToClipboard(post.hashtags.join(' '), `hashtags-${postId}`)}
                                  className="text-xs"
                                >
                                  {copiedContentId === `hashtags-${postId}` ? (
                                    <>
                                      <CheckSquare className="h-3 w-3 mr-1" />
                                      Copiat!
                                    </>
                                  ) : (
                                    <>
                                      <Copy className="h-3 w-3 mr-1" />
                                      Copiază hashtag-uri
                                    </>
                                  )}
                                </Button>
                              </div>
                            </div>
                          )}

                          {/* Call to Action */}
                          {post.call_to_action && (
                            <div>
                              <h6 className="font-semibold text-gray-800 mb-2">Call to Action:</h6>
                              <div className="bg-gradient-to-r from-green-50 to-blue-50 p-3 rounded-lg border border-green-200">
                                <p className="text-gray-700 text-sm font-medium">
                                  {post.call_to_action}
                                </p>
                              </div>
                            </div>
                          )}

                          {/* Additional Details */}
                          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200">
                            {post.optimal_posting_time && (
                              <div>
                                <h6 className="font-semibold text-gray-800 text-xs mb-1">Ora optimă:</h6>
                                <p className="text-gray-600 text-xs">{post.optimal_posting_time}</p>
                              </div>
                            )}
                            
                            {post.target_audience && (
                              <div>
                                <h6 className="font-semibold text-gray-800 text-xs mb-1">Audiența:</h6>
                                <p className="text-gray-600 text-xs">{post.target_audience}</p>
                              </div>
                            )}
                          </div>

                          {/* Copy All Button */}
                          <div className="pt-4 border-t border-gray-200">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => {
                                const fullPost = `${post.title}\n\n${post.main_text || post.description}\n\n${post.hashtags ? post.hashtags.join(' ') : ''}\n\n${post.call_to_action || ''}`;
                                copyToClipboard(fullPost, `full-post-${postId}`);
                              }}
                              className="w-full flex items-center justify-center space-x-2"
                            >
                              {copiedContentId === `full-post-${postId}` ? (
                                <>
                                  <CheckSquare className="h-4 w-4" />
                                  <span>Postare copiată!</span>
                                </>
                              ) : (
                                <>
                                  <Copy className="h-4 w-4" />
                                  <span>Copiază postarea completă</span>
                                </>
                              )}
                            </Button>
                          </div>
                        </div>
                      </Card>
                    );
                  })}
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="text-center py-8" animation="bounceIn">
            <div className="p-4 bg-gradient-to-r from-indigo-100 to-purple-100 rounded-2xl mb-4 inline-block">
              <Eye className="h-8 w-8 text-indigo-600" />
            </div>
            <h4 className="text-lg font-semibold text-gray-900 mb-2">
              Preview în dezvoltare
            </h4>
            <p className="text-gray-600">
              Previzualizarea detaliată a postărilor va fi disponibilă în curând
            </p>
          </Card>
        )}

        {/* Image Prompt Info */}
        {copiedImagePrompt && (
          <Card className="mt-6 bg-gradient-to-r from-green-50 to-blue-50 border-green-200" animation="slideInLeft">
            <div className="flex items-start space-x-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Sparkles className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Prompt pentru imagine copiat!</h4>
                <p className="text-gray-700 text-sm">
                  Prompt-ul optimizat pentru generarea imaginii a fost copiat în clipboard. 
                  Poți să-l folosești în AI-uri externe precum DALL-E, Midjourney, Stable Diffusion sau alte generatoare de imagini.
                </p>
              </div>
            </div>
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

        {plan.details?.kpis ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {plan.details.kpis.map((kpi: any, index: number) => (
              <Card 
                key={index}
                className="bg-gradient-to-br from-orange-50 to-red-50 border-orange-200"
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
        {activeTab === 'preview' && renderPreview()}
        {activeTab === 'analytics' && renderAnalytics()}
      </div>
    </div>
  );
};