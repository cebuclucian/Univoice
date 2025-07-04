import React, { useState, useRef } from 'react';
import { 
  Calendar, Target, Users, TrendingUp, BarChart3, Clock, 
  CheckCircle, ArrowLeft, Edit3, Share2, Download, Brain,
  Lightbulb, Zap, MessageSquare, Instagram, Facebook, 
  Twitter, Mail, Globe, Youtube, Music, Monitor, Copy,
  CheckSquare, AlertCircle, Info, Clipboard, FileText,
  Eye, Play, Pause, SkipForward, SkipBack, Volume2,
  Image, Video, Mic, Camera, Palette, Type, Hash,
  DollarSign, Clock3, MapPin, Heart, ThumbsUp, Share,
  Send, Bookmark, MoreHorizontal, ExternalLink, Settings
} from 'lucide-react';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { MarketingPlanEditor } from './MarketingPlanEditor';

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
  const [isEditing, setIsEditing] = useState(false);
  const [currentPlan, setCurrentPlan] = useState(plan);
  const [selectedPost, setSelectedPost] = useState<any>(null);
  const [previewMode, setPreviewMode] = useState<'mobile' | 'desktop'>('mobile');
  const exportLinkRef = useRef<HTMLAnchorElement>(null);

  const handleEdit = () => {
    setIsEditing(true);
    onEdit?.();
  };

  const handleSaveEdit = (updatedPlan: MarketingPlan) => {
    setCurrentPlan(updatedPlan);
    setIsEditing(false);
    onPlanUpdated?.(updatedPlan);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
  };

  // If in edit mode, show the editor
  if (isEditing) {
    return (
      <MarketingPlanEditor
        plan={currentPlan}
        onSave={handleSaveEdit}
        onCancel={handleCancelEdit}
      />
    );
  }

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

  const handleExport = () => {
    if (!currentPlan) return;

    let exportData: string;
    let fileName: string;
    let mimeType: string;

    switch (exportFormat) {
      case 'json':
        exportData = JSON.stringify(currentPlan, null, 2);
        fileName = `${currentPlan.title.replace(/\s+/g, '_')}_plan.json`;
        mimeType = 'application/json';
        break;
      case 'calendar':
        exportData = generateCalendarExport();
        fileName = `${currentPlan.title.replace(/\s+/g, '_')}_calendar.txt`;
        mimeType = 'text/plain';
        break;
      case 'text':
      default:
        exportData = generateTextExport();
        fileName = `${currentPlan.title.replace(/\s+/g, '_')}_plan.txt`;
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
    const { title, details, created_at } = currentPlan;
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
    
    return text;
  };

  const generateCalendarExport = () => {
    const { title, details } = currentPlan;
    
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

  // Generate comprehensive content from tactical plan
  const generateContentFromTacticalPlan = () => {
    const platforms = currentPlan.details?.tactical_plan_per_platform || [];
    const allContent: any[] = [];

    platforms.forEach((platform: any) => {
      if (platform.editorial_calendar?.month_1) {
        platform.editorial_calendar.month_1.forEach((week: any) => {
          if (week.posts) {
            week.posts.forEach((post: any) => {
              allContent.push({
                ...post,
                platform: platform.platform,
                week: week.week
              });
            });
          }
        });
      }
    });

    return allContent;
  };

  const renderPostPreview = (post: any) => {
    const platformName = post.platform?.toLowerCase() || '';
    
    return (
      <Card 
        className={`max-w-sm mx-auto ${getPlatformColor(post.platform)} cursor-pointer hover:shadow-lg transition-all duration-200`}
        onClick={() => setSelectedPost(post)}
      >
        {/* Platform Header */}
        <div className="flex items-center space-x-3 p-4 border-b border-gray-200">
          <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
            {getPlatformIcon(post.platform)}
          </div>
          <div>
            <p className="font-semibold text-sm">{currentPlan.details?.brand_voice_used?.brand_description?.split(' ')[0] || 'Brand'}</p>
            <p className="text-xs text-gray-500">{post.scheduled_date}</p>
          </div>
          <div className="ml-auto">
            <MoreHorizontal className="h-4 w-4 text-gray-400" />
          </div>
        </div>

        {/* Post Content */}
        <div className="p-4">
          {/* Visual Brief Preview */}
          {post.visual_brief && (
            <div className="mb-3 bg-gray-100 rounded-lg p-3 border-2 border-dashed border-gray-300">
              <div className="flex items-center space-x-2 mb-2">
                {post.visual_brief.type === 'video' ? (
                  <Video className="h-4 w-4 text-gray-600" />
                ) : post.visual_brief.type === 'carousel' ? (
                  <Image className="h-4 w-4 text-gray-600" />
                ) : (
                  <Camera className="h-4 w-4 text-gray-600" />
                )}
                <span className="text-xs font-medium text-gray-600">
                  {post.visual_brief.type} • {post.visual_brief.dimensions}
                </span>
              </div>
              
              {post.visual_brief.text_overlay && (
                <div className="text-center">
                  <p className="text-sm font-bold text-gray-800 mb-1">
                    {post.visual_brief.text_overlay}
                  </p>
                </div>
              )}
              
              <div className="flex items-center justify-center space-x-2 text-xs text-gray-500">
                <Palette className="h-3 w-3" />
                <span>Stil: {post.visual_brief.style_guidelines}</span>
              </div>
            </div>
          )}

          {/* Post Text */}
          <div className="mb-3">
            <p className="text-sm leading-relaxed whitespace-pre-wrap">
              {post.copy?.main_text || post.description || 'Conținut postare...'}
            </p>
          </div>

          {/* Hashtags */}
          {post.copy?.hashtags && post.copy.hashtags.length > 0 && (
            <div className="mb-3">
              <div className="flex flex-wrap gap-1">
                {post.copy.hashtags.map((hashtag: string, idx: number) => (
                  <span key={idx} className="text-blue-600 text-sm">
                    {hashtag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Call to Action */}
          {post.copy?.call_to_action && (
            <div className="mb-3">
              <Button size="sm" className="w-full text-xs">
                {post.copy.call_to_action}
              </Button>
            </div>
          )}
        </div>

        {/* Engagement Preview */}
        <div className="px-4 pb-4">
          <div className="flex items-center justify-between text-gray-500 border-t border-gray-200 pt-3">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-1">
                <Heart className="h-4 w-4" />
                <span className="text-xs">{post.individual_metrics?.target_engagement || '0'}</span>
              </div>
              <div className="flex items-center space-x-1">
                <MessageSquare className="h-4 w-4" />
                <span className="text-xs">0</span>
              </div>
              <div className="flex items-center space-x-1">
                <Share className="h-4 w-4" />
                <span className="text-xs">0</span>
              </div>
            </div>
            <div className="flex items-center space-x-1">
              <Eye className="h-4 w-4" />
              <span className="text-xs">{post.individual_metrics?.target_reach || '0'}</span>
            </div>
          </div>
        </div>

        {/* Promotion Budget */}
        {post.promotion_budget && (
          <div className="px-4 pb-3">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-2">
              <div className="flex items-center space-x-2">
                <DollarSign className="h-3 w-3 text-yellow-600" />
                <span className="text-xs text-yellow-800">
                  Buget promovare: {post.promotion_budget}
                </span>
              </div>
            </div>
          </div>
        )}
      </Card>
    );
  };

  const renderDetailedPostModal = () => {
    if (!selectedPost) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <Card className="max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h3 className="text-xl font-bold text-gray-900">
              Detalii postare - {selectedPost.platform}
            </h3>
            <Button variant="ghost" onClick={() => setSelectedPost(null)}>
              <X className="h-5 w-5" />
            </Button>
          </div>

          <div className="p-6 space-y-6">
            {/* Post Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Informații postare</h4>
                <div className="space-y-2 text-sm">
                  <div><strong>ID:</strong> {selectedPost.post_id}</div>
                  <div><strong>Data programată:</strong> {selectedPost.scheduled_date}</div>
                  <div><strong>Platforma:</strong> {selectedPost.platform}</div>
                  <div><strong>Săptămâna:</strong> {selectedPost.week}</div>
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Metrici țintă</h4>
                <div className="space-y-2 text-sm">
                  <div><strong>KPI principal:</strong> {selectedPost.individual_metrics?.primary_kpi}</div>
                  <div><strong>Reach țintă:</strong> {selectedPost.individual_metrics?.target_reach}</div>
                  <div><strong>Engagement țintă:</strong> {selectedPost.individual_metrics?.target_engagement}</div>
                  <div><strong>Click-uri țintă:</strong> {selectedPost.individual_metrics?.target_clicks}</div>
                  <div><strong>Conversii țintă:</strong> {selectedPost.individual_metrics?.target_conversions}</div>
                </div>
              </div>
            </div>

            {/* Copy Content */}
            <div>
              <h4 className="font-semibold text-gray-900 mb-3">Conținutul postării</h4>
              <Card className="bg-gray-50" padding="md">
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Text principal:</label>
                    <p className="mt-1 text-sm text-gray-900 whitespace-pre-wrap">
                      {selectedPost.copy?.main_text}
                    </p>
                  </div>
                  
                  {selectedPost.copy?.call_to_action && (
                    <div>
                      <label className="text-sm font-medium text-gray-700">Call to Action:</label>
                      <p className="mt-1 text-sm text-gray-900">
                        {selectedPost.copy.call_to_action}
                      </p>
                    </div>
                  )}
                  
                  {selectedPost.copy?.hashtags && (
                    <div>
                      <label className="text-sm font-medium text-gray-700">Hashtag-uri:</label>
                      <div className="mt-1 flex flex-wrap gap-1">
                        {selectedPost.copy.hashtags.map((hashtag: string, idx: number) => (
                          <span key={idx} className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                            {hashtag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </Card>
            </div>

            {/* Visual Brief */}
            {selectedPost.visual_brief && (
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Brief vizual</h4>
                <Card className="bg-blue-50" padding="md">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <strong>Tip:</strong> {selectedPost.visual_brief.type}
                    </div>
                    <div>
                      <strong>Dimensiuni:</strong> {selectedPost.visual_brief.dimensions}
                    </div>
                    <div className="md:col-span-2">
                      <strong>Ghid de stil:</strong> {selectedPost.visual_brief.style_guidelines}
                    </div>
                    {selectedPost.visual_brief.mandatory_elements && (
                      <div className="md:col-span-2">
                        <strong>Elemente obligatorii:</strong>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {selectedPost.visual_brief.mandatory_elements.map((element: string, idx: number) => (
                            <span key={idx} className="px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-xs">
                              {element}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    {selectedPost.visual_brief.color_palette && (
                      <div className="md:col-span-2">
                        <strong>Paleta de culori:</strong>
                        <div className="flex space-x-2 mt-1">
                          {selectedPost.visual_brief.color_palette.map((color: string, idx: number) => (
                            <div 
                              key={idx} 
                              className="w-6 h-6 rounded border border-gray-300"
                              style={{ backgroundColor: color }}
                              title={color}
                            />
                          ))}
                        </div>
                      </div>
                    )}
                    {selectedPost.visual_brief.text_overlay && (
                      <div className="md:col-span-2">
                        <strong>Text pe imagine:</strong> {selectedPost.visual_brief.text_overlay}
                      </div>
                    )}
                  </div>
                </Card>
              </div>
            )}

            {/* Target Audience */}
            {selectedPost.target_audience_specific && (
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Audiența țintă specifică</h4>
                <Card className="bg-green-50" padding="md">
                  <div className="space-y-2 text-sm">
                    <div><strong>Demografia:</strong> {selectedPost.target_audience_specific.demographics}</div>
                    {selectedPost.target_audience_specific.interests && (
                      <div>
                        <strong>Interese:</strong>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {selectedPost.target_audience_specific.interests.map((interest: string, idx: number) => (
                            <span key={idx} className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">
                              {interest}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    {selectedPost.target_audience_specific.behaviors && (
                      <div>
                        <strong>Comportamente:</strong>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {selectedPost.target_audience_specific.behaviors.map((behavior: string, idx: number) => (
                            <span key={idx} className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">
                              {behavior}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </Card>
              </div>
            )}

            {/* Response Protocol */}
            {selectedPost.response_protocol && (
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Protocol de răspuns</h4>
                <Card className="bg-yellow-50" padding="md">
                  <div className="space-y-2 text-sm">
                    <div><strong>Timp răspuns comentarii:</strong> {selectedPost.response_protocol.comment_response_time}</div>
                    <div><strong>Timp răspuns mesaje:</strong> {selectedPost.response_protocol.message_response_time}</div>
                    <div><strong>Procedura de escaladare:</strong> {selectedPost.response_protocol.escalation_procedure}</div>
                    <div><strong>Ghid de ton:</strong> {selectedPost.response_protocol.tone_guidelines}</div>
                  </div>
                </Card>
              </div>
            )}

            {/* Actions */}
            <div className="flex space-x-3">
              <Button 
                onClick={() => copyToClipboard(selectedPost.copy?.main_text || '', selectedPost.post_id)}
                variant="outline"
                className="flex items-center space-x-2"
              >
                <Copy className="h-4 w-4" />
                <span>Copiază textul</span>
              </Button>
              <Button 
                onClick={() => copyToClipboard(JSON.stringify(selectedPost, null, 2), selectedPost.post_id + '-full')}
                variant="outline"
                className="flex items-center space-x-2"
              >
                <FileText className="h-4 w-4" />
                <span>Copiază toate detaliile</span>
              </Button>
            </div>
          </div>
        </Card>
      </div>
    );
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
            {currentPlan.details?.summary || 'Plan de marketing personalizat generat cu AI.'}
          </p>
        </div>
      </Card>

      {/* Brand Voice Used */}
      {currentPlan.details?.brand_voice_used && (
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
                    {Array.isArray(currentPlan.details.brand_voice_used.personality) 
                      ? currentPlan.details.brand_voice_used.personality.join(', ')
                      : currentPlan.details.brand_voice_used.personality
                    }
                  </span>
                </div>
                <div>
                  <span className="font-semibold text-gray-800">Ton: </span>
                  <span className="text-gray-700">
                    {Array.isArray(currentPlan.details.brand_voice_used.tone)
                      ? currentPlan.details.brand_voice_used.tone.join(', ')
                      : currentPlan.details.brand_voice_used.tone
                    }
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Generat pe: {new Date(currentPlan.details.brand_voice_used.timestamp || currentPlan.created_at).toLocaleDateString('ro-RO')}
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
            {currentPlan.details?.objectives?.map((objective: string, index: number) => (
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
          
          {currentPlan.details?.target_audience && (
            <div className="space-y-3 text-sm">
              <div>
                <h4 className="font-semibold text-gray-800 mb-1">Audiența principală:</h4>
                <p className="text-gray-700">{currentPlan.details.target_audience.primary}</p>
              </div>
              
              {currentPlan.details.target_audience.demographics && (
                <div>
                  <h4 className="font-semibold text-gray-800 mb-1">Demografia:</h4>
                  <p className="text-gray-700">{currentPlan.details.target_audience.demographics}</p>
                </div>
              )}
              
              {currentPlan.details.target_audience.pain_points && (
                <div>
                  <h4 className="font-semibold text-gray-800 mb-1">Puncte de durere:</h4>
                  <ul className="space-y-1">
                    {currentPlan.details.target_audience.pain_points.map((point: string, index: number) => (
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
      {currentPlan.details?.strategy && (
        <Card className="shadow-lg" animation="fadeInUp" hover="subtle">
          <div className="flex items-center space-x-3 mb-6">
            <div className="p-2 bg-purple-100 rounded-xl">
              <Lightbulb className="h-6 w-6 text-purple-600" />
            </div>
            <h3 className="text-lg font-bold text-gray-900">Strategia</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {currentPlan.details.strategy.positioning && (
              <div>
                <h4 className="font-semibold text-gray-800 mb-2">Poziționare:</h4>
                <p className="text-gray-700 text-sm">{currentPlan.details.strategy.positioning}</p>
              </div>
            )}
            
            {currentPlan.details.strategy.key_messages && (
              <div>
                <h4 className="font-semibold text-gray-800 mb-2">Mesaje cheie:</h4>
                <ul className="space-y-1">
                  {currentPlan.details.strategy.key_messages.map((message: string, index: number) => (
                    <li key={index} className="text-gray-700 text-sm flex items-start space-x-2">
                      <span className="w-1 h-1 bg-blue-500 rounded-full mt-2 flex-shrink-0"></span>
                      <span>{message}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            
            {currentPlan.details.strategy.content_pillars && (
              <div>
                <h4 className="font-semibold text-gray-800 mb-2">Piloni de conținut:</h4>
                <div className="flex flex-wrap gap-1">
                  {currentPlan.details.strategy.content_pillars.map((pillar: string, index: number) => (
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
      {(currentPlan.details?.platforms || currentPlan.details?.tactical_plan_per_platform) && (
        <Card className="shadow-lg" animation="fadeInUp" hover="subtle">
          <div className="flex items-center space-x-3 mb-6">
            <div className="p-2 bg-indigo-100 rounded-xl">
              <Zap className="h-6 w-6 text-indigo-600" />
            </div>
            <h3 className="text-lg font-bold text-gray-900">Platforme și strategii</h3>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {(currentPlan.details.platforms || currentPlan.details.tactical_plan_per_platform || []).map((platform: any, index: number) => (
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
                  <h4 className="font-semibold text-gray-900">{platform.name || platform.platform}</h4>
                </div>
                
                <div className="space-y-2 text-sm">
                  <p className="text-gray-700">{platform.strategy}</p>
                  
                  {platform.content_types && (
                    <div>
                      <span className="font-semibold text-gray-800">Tipuri conținut: </span>
                      <span className="text-gray-600">
                        {Array.isArray(platform.content_types) ? platform.content_types.join(', ') : platform.content_types}
                      </span>
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

        {currentPlan.details?.content_calendar ? (
          <div className="space-y-6">
            {currentPlan.details.content_calendar.map((week: any, weekIndex: number) => (
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
        {currentPlan.details?.content_calendar && (
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

        {(currentPlan.details?.platforms || currentPlan.details?.tactical_plan_per_platform) && (currentPlan.details.platforms || currentPlan.details.tactical_plan_per_platform).length > 0 ? (
          <div className="space-y-8">
            {(currentPlan.details.platforms || currentPlan.details.tactical_plan_per_platform).map((platform: any, platformIndex: number) => (
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
                      <h4 className="font-semibold text-gray-900">{platform.name || platform.platform}</h4>
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
                
                {currentPlan.details?.content_calendar && (
                  <div className="space-y-4">
                    <h5 className="font-medium text-gray-800">Exemple de conținut:</h5>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {currentPlan.details.content_calendar
                        .flatMap((week: any) => week.content || [])
                        .filter((content: any) => content.platform.toLowerCase() === (platform.name || platform.platform).toLowerCase())
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

  const renderPreview = () => {
    const allContent = generateContentFromTacticalPlan();
    
    return (
      <div className="space-y-6">
        <Card className="shadow-lg" animation="slideInLeft">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-indigo-100 rounded-xl">
                <Eye className="h-6 w-6 text-indigo-600" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">Preview postări</h3>
                <p className="text-gray-600">Vizualizează cum vor arăta postările pe platforme</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Button
                variant={previewMode === 'mobile' ? 'primary' : 'outline'}
                size="sm"
                onClick={() => setPreviewMode('mobile')}
              >
                Mobile
              </Button>
              <Button
                variant={previewMode === 'desktop' ? 'primary' : 'outline'}
                size="sm"
                onClick={() => setPreviewMode('desktop')}
              >
                Desktop
              </Button>
            </div>
          </div>

          {allContent.length > 0 ? (
            <div className={`grid gap-6 ${previewMode === 'mobile' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1 lg:grid-cols-2'}`}>
              {allContent.slice(0, 12).map((post, index) => (
                <div key={index} className="animate-fade-in-up" style={{ animationDelay: `${index * 0.1}s` }}>
                  {renderPostPreview(post)}
                </div>
              ))}
            </div>
          ) : (
            <Card className="text-center py-12" animation="bounceIn">
              <div className="p-4 bg-gray-100 rounded-2xl mb-4 inline-block">
                <Eye className="h-12 w-12 text-gray-500" />
              </div>
              <h4 className="text-xl font-semibold text-gray-900 mb-2">
                Nu există postări de previzualizat
              </h4>
              <p className="text-gray-600">
                Postările vor apărea aici când planul va conține un calendar editorial detaliat
              </p>
            </Card>
          )}

          {allContent.length > 12 && (
            <div className="mt-6 text-center">
              <p className="text-gray-600 mb-4">
                Afișate {Math.min(12, allContent.length)} din {allContent.length} postări
              </p>
              <Button variant="outline">
                Vezi toate postările
              </Button>
            </div>
          )}
        </Card>

        {/* Platform Statistics */}
        {allContent.length > 0 && (
          <Card className="shadow-lg" animation="slideInRight">
            <h4 className="text-lg font-bold text-gray-900 mb-4">Statistici conținut</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{allContent.length}</div>
                <div className="text-sm text-gray-600">Total postări</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {new Set(allContent.map(p => p.platform)).size}
                </div>
                <div className="text-sm text-gray-600">Platforme</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {allContent.filter(p => p.visual_brief?.type === 'video').length}
                </div>
                <div className="text-sm text-gray-600">Video content</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">
                  {allContent.filter(p => p.promotion_budget).length}
                </div>
                <div className="text-sm text-gray-600">Postări promovate</div>
              </div>
            </div>
          </Card>
        )}

        {/* Detailed Post Modal */}
        {renderDetailedPostModal()}
      </div>
    );
  };

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

        {(currentPlan.details?.kpis || currentPlan.details?.kpis_smart) ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {(currentPlan.details.kpis || currentPlan.details.kpis_smart).map((kpi: any, index: number) => (
              <Card 
                key={index}
                className="bg-gradient-to-r from-orange-50 to-red-50 border-orange-200"
                padding="md"
                animation="scaleIn"
                delay={index + 1}
                hover="subtle"
              >
                <div className="text-center">
                  <h4 className="font-semibold text-gray-900 mb-2">{kpi.metric || kpi.name}</h4>
                  <div className="text-2xl font-bold text-orange-600 mb-2">
                    {kpi.target || kpi.target_value}
                  </div>
                  <p className="text-gray-600 text-sm">{kpi.measurement || kpi.description}</p>
                  
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

        {/* Monitoring Schedule */}
        {currentPlan.details?.monitoring_and_optimization && (
          <Card className="shadow-lg" animation="fadeInUp">
            <h4 className="text-lg font-bold text-gray-900 mb-4">Program de monitorizare</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {Object.entries(currentPlan.details.monitoring_and_optimization.performance_evaluation_schedule || {}).map(([period, schedule]: [string, any]) => (
                <Card key={period} className="bg-gray-50" padding="sm">
                  <h5 className="font-semibold text-gray-800 mb-2">
                    {period.replace('_', ' ').replace('day', ' zile')}
                  </h5>
                  <div className="space-y-2 text-sm">
                    <div>
                      <strong>Focus:</strong>
                      <ul className="list-disc list-inside text-gray-600 ml-2">
                        {schedule.focus_areas?.map((area: string, idx: number) => (
                          <li key={idx}>{area}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <strong>Metrici:</strong>
                      <ul className="list-disc list-inside text-gray-600 ml-2">
                        {schedule.key_metrics?.map((metric: string, idx: number) => (
                          <li key={idx}>{metric}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
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
              <h1 className="text-2xl font-bold text-gray-900">{currentPlan.title}</h1>
              <p className="text-gray-600">
                Creat pe {new Date(currentPlan.created_at).toLocaleDateString('ro-RO')}
                {currentPlan.details?.last_edited && (
                  <span className="ml-2 text-sm">
                    • Ultima editare: {new Date(currentPlan.details.last_edited).toLocaleDateString('ro-RO')}
                  </span>
                )}
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
                        navigator.clipboard.writeText(`${window.location.origin}/app/plans?id=${currentPlan.id}`);
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
                        window.open(`mailto:?subject=Plan de marketing: ${currentPlan.title}&body=Iată planul de marketing generat: ${window.location.origin}/app/plans?id=${currentPlan.id}`);
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
            
            <Button size="sm" onClick={handleEdit} className="flex items-center space-x-2">
              <Edit3 className="h-4 w-4" />
              <span>Editează</span>
            </Button>
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