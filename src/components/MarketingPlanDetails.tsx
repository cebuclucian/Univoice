import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, Edit3, Calendar, Clock, Target, Users, BarChart3, 
  MessageSquare, Instagram, Facebook, Twitter, Linkedin, Mail, 
  Globe, Copy, Image, Type, CheckCircle, X, AlertCircle, Sparkles,
  Eye, Download, Share2, Wand2, Plus, Trash2, Save
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useNotificationActions } from '../hooks/useNotificationActions';
import { supabase } from '../lib/supabase';
import { Button } from './ui/Button';
import { Card } from './ui/Card';
import { Input } from './ui/Input';
import { Textarea } from './ui/Textarea';
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
  onEdit: () => void;
  onPlanUpdated: (updatedPlan: MarketingPlan) => void;
}

interface PostToSchedule {
  platform: string;
  content: string;
  hashtags?: string[];
  type?: string;
}

interface ScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  post: PostToSchedule | null;
  onSchedule: (scheduledAt: string) => void;
  loading: boolean;
}

const ScheduleModal: React.FC<ScheduleModalProps> = ({ 
  isOpen, 
  onClose, 
  post, 
  onSchedule, 
  loading 
}) => {
  const [scheduledDate, setScheduledDate] = useState('');
  const [scheduledTime, setScheduledTime] = useState('');

  useEffect(() => {
    if (isOpen) {
      // Set default to tomorrow at 10:00 AM
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(10, 0, 0, 0);
      
      const dateStr = tomorrow.toISOString().split('T')[0];
      const timeStr = '10:00';
      
      setScheduledDate(dateStr);
      setScheduledTime(timeStr);
    }
  }, [isOpen]);

  const handleSchedule = () => {
    if (!scheduledDate || !scheduledTime) return;
    
    const scheduledDateTime = new Date(`${scheduledDate}T${scheduledTime}`);
    onSchedule(scheduledDateTime.toISOString());
  };

  const getMinDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  const getMinTime = () => {
    const now = new Date();
    const selectedDate = new Date(scheduledDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    selectedDate.setHours(0, 0, 0, 0);
    
    // If selected date is today, minimum time is current time + 1 hour
    if (selectedDate.getTime() === today.getTime()) {
      const minTime = new Date();
      minTime.setHours(minTime.getHours() + 1);
      return minTime.toTimeString().slice(0, 5);
    }
    
    return '00:00';
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 z-50 animate-fade-in"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <Card 
          className="w-full max-w-md bg-white shadow-2xl border-0"
          animation="scaleIn"
          padding="lg"
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-xl">
                <Calendar className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">Programează postarea</h3>
                <p className="text-sm text-gray-600">{post?.platform}</p>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Post Preview */}
          <Card className="bg-gray-50 border-gray-200 mb-6" padding="sm">
            <p className="text-sm text-gray-700 line-clamp-3">
              {post?.content}
            </p>
            {post?.hashtags && post.hashtags.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {post.hashtags.slice(0, 3).map((hashtag, index) => (
                  <span 
                    key={index}
                    className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs"
                  >
                    {hashtag}
                  </span>
                ))}
                {post.hashtags.length > 3 && (
                  <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs">
                    +{post.hashtags.length - 3}
                  </span>
                )}
              </div>
            )}
          </Card>

          {/* Date and Time Selection */}
          <div className="space-y-4 mb-6">
            <Input
              label="Data programării"
              type="date"
              value={scheduledDate}
              onChange={(e) => setScheduledDate(e.target.value)}
              min={getMinDate()}
              required
            />
            
            <Input
              label="Ora programării"
              type="time"
              value={scheduledTime}
              onChange={(e) => setScheduledTime(e.target.value)}
              min={getMinTime()}
              required
            />
          </div>

          {/* Info */}
          <Card className="bg-blue-50 border-blue-200 mb-6" padding="sm">
            <div className="flex items-start space-x-2">
              <AlertCircle className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-blue-800">
                <p className="font-medium mb-1">Notă importantă:</p>
                <p>Postarea va fi salvată în calendarul tău. Vei primi o notificare când este timpul să o publici manual pe platformă.</p>
              </div>
            </div>
          </Card>

          {/* Actions */}
          <div className="flex space-x-3">
            <Button 
              variant="outline" 
              onClick={onClose}
              className="flex-1"
              disabled={loading}
            >
              Anulează
            </Button>
            <Button 
              onClick={handleSchedule}
              loading={loading}
              disabled={!scheduledDate || !scheduledTime}
              className="flex-1 flex items-center space-x-2"
            >
              <Calendar className="h-4 w-4" />
              <span>Programează</span>
            </Button>
          </div>
        </Card>
      </div>
    </>
  );
};

export const MarketingPlanDetails: React.FC<MarketingPlanDetailsProps> = ({
  plan,
  onBack,
  onEdit,
  onPlanUpdated
}) => {
  const { user } = useAuth();
  const { notifySuccess, notifyError } = useNotificationActions();
  const [activeTab, setActiveTab] = useState<'overview' | 'content' | 'calendar'>('overview');
  const [isEditing, setIsEditing] = useState(false);
  const [showImageSuggestions, setShowImageSuggestions] = useState<number | null>(null);
  const [imageSuggestions, setImageSuggestions] = useState<string[]>([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [scheduleModal, setScheduleModal] = useState({
    isOpen: false,
    post: null as PostToSchedule | null,
    loading: false
  });

  const getChannelIcon = (platform: string) => {
    const platformLower = platform.toLowerCase();
    switch (platformLower) {
      case 'facebook': return <Facebook className="h-5 w-5 text-blue-600" />;
      case 'instagram': return <Instagram className="h-5 w-5 text-pink-600" />;
      case 'twitter': return <Twitter className="h-5 w-5 text-sky-500" />;
      case 'linkedin': return <Linkedin className="h-5 w-5 text-blue-700" />;
      case 'email': return <Mail className="h-5 w-5 text-green-600" />;
      case 'website': return <Globe className="h-5 w-5 text-gray-600" />;
      default: return <MessageSquare className="h-5 w-5 text-gray-600" />;
    }
  };

  const getChannelColor = (platform: string) => {
    const platformLower = platform.toLowerCase();
    switch (platformLower) {
      case 'facebook': return 'border-l-blue-500 bg-blue-50';
      case 'instagram': return 'border-l-pink-500 bg-pink-50';
      case 'twitter': return 'border-l-sky-500 bg-sky-50';
      case 'linkedin': return 'border-l-blue-700 bg-blue-50';
      case 'email': return 'border-l-green-500 bg-green-50';
      case 'website': return 'border-l-gray-500 bg-gray-50';
      default: return 'border-l-gray-400 bg-gray-50';
    }
  };

  const generateImageSuggestions = async (content: string, platform: string) => {
    setLoadingSuggestions(true);
    try {
      const prompt = `
Generează 3 prompturi creative pentru imagini care să se potrivească cu următoarea postare de ${platform}:

"${content}"

Prompturile trebuie să fie:
- Specifice și descriptive
- Potrivite pentru ${platform}
- Profesionale și atractive
- În română

Returnează doar prompturile, fiecare pe o linie separată, numerotate 1, 2, 3.
`;

      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-gemini-response`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt }),
      });

      if (!response.ok) throw new Error('Failed to generate suggestions');

      const data = await response.json();
      const suggestions = data.response
        .split('\n')
        .filter((line: string) => line.trim() && /^\d+\./.test(line.trim()))
        .map((line: string) => line.replace(/^\d+\.\s*/, '').trim())
        .slice(0, 3);

      setImageSuggestions(suggestions);
    } catch (error) {
      console.error('Error generating image suggestions:', error);
      notifyError('Eroare', 'Nu am putut genera sugestii de imagini');
    } finally {
      setLoadingSuggestions(false);
    }
  };

  const handleImageSuggestions = (postIndex: number, content: string, platform: string) => {
    setShowImageSuggestions(postIndex);
    generateImageSuggestions(content, platform);
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      notifySuccess('Copiat!', 'Textul a fost copiat în clipboard');
    } catch (error) {
      notifyError('Eroare', 'Nu am putut copia textul');
    }
  };

  const copyAllSuggestions = () => {
    const allSuggestions = imageSuggestions
      .map((suggestion, index) => `${index + 1}. ${suggestion}`)
      .join('\n\n');
    copyToClipboard(allSuggestions);
  };

  const handleSchedulePost = (post: any, platform: string) => {
    const postToSchedule: PostToSchedule = {
      platform: platform,
      content: post.content || post.text || '',
      hashtags: post.hashtags || [],
      type: post.type || 'post'
    };

    setScheduleModal({
      isOpen: true,
      post: postToSchedule,
      loading: false
    });
  };

  const handleConfirmSchedule = async (scheduledAt: string) => {
    if (!scheduleModal.post || !user) return;

    setScheduleModal(prev => ({ ...prev, loading: true }));

    try {
      const { error } = await supabase
        .from('scheduled_posts')
        .insert({
          user_id: user.id,
          marketing_plan_id: plan.id,
          platform: scheduleModal.post!.platform,
          content: scheduleModal.post!.content,
          scheduled_at: scheduledAt,
          status: 'scheduled'
        });

      if (error) throw error;

      notifySuccess(
        'Postare programată!', 
        `Postarea pentru ${scheduleModal.post.platform} a fost programată cu succes pentru ${new Date(scheduledAt).toLocaleDateString('ro-RO', {
          day: 'numeric',
          month: 'long',
          hour: '2-digit',
          minute: '2-digit'
        })}`
      );

      setScheduleModal({
        isOpen: false,
        post: null,
        loading: false
      });

    } catch (error) {
      console.error('Error scheduling post:', error);
      notifyError('Eroare', 'Nu am putut programa postarea. Te rog încearcă din nou.');
      setScheduleModal(prev => ({ ...prev, loading: false }));
    }
  };

  const handleCloseScheduleModal = () => {
    setScheduleModal({
      isOpen: false,
      post: null,
      loading: false
    });
  };

  if (isEditing) {
    return (
      <MarketingPlanEditor
        plan={plan}
        onSave={(updatedPlan) => {
          setIsEditing(false);
          onPlanUpdated(updatedPlan);
        }}
        onCancel={() => setIsEditing(false)}
      />
    );
  }

  const tabs = [
    { id: 'overview', name: 'Prezentare generală', icon: Target },
    { id: 'content', name: 'Conținut generat', icon: MessageSquare },
    { id: 'calendar', name: 'Calendar', icon: Calendar }
  ];

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ro-RO', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const renderOverview = () => (
    <div className="space-y-8">
      {/* Plan Summary */}
      <Card className="shadow-lg" animation="slideInLeft" hover="subtle">
        <div className="flex items-center space-x-3 mb-6">
          <div className="p-2 bg-blue-100 rounded-xl">
            <Target className="h-6 w-6 text-blue-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Rezumat executiv</h2>
        </div>
        
        <div className="prose max-w-none">
          <p className="text-gray-700 leading-relaxed">
            {plan.details?.summary || plan.details?.objective || 'Nu există rezumat disponibil pentru acest plan.'}
          </p>
        </div>
      </Card>

      {/* Objectives */}
      {plan.details?.objectives && (
        <Card className="shadow-lg" animation="slideInLeft" delay={1} hover="subtle">
          <div className="flex items-center space-x-3 mb-6">
            <div className="p-2 bg-green-100 rounded-xl">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Obiective</h2>
          </div>
          
          <div className="space-y-3">
            {plan.details.objectives.map((objective: string, index: number) => (
              <div key={index} className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                <p className="text-gray-700">{objective}</p>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Target Audience */}
      {plan.details?.target_audience && (
        <Card className="shadow-lg" animation="slideInLeft" delay={2} hover="subtle">
          <div className="flex items-center space-x-3 mb-6">
            <div className="p-2 bg-purple-100 rounded-xl">
              <Users className="h-6 w-6 text-purple-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Audiența țintă</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Audiența principală</h3>
              <p className="text-gray-700">{plan.details.target_audience.primary}</p>
            </div>
            
            {plan.details.target_audience.demographics && (
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Demografia</h3>
                <p className="text-gray-700">{plan.details.target_audience.demographics}</p>
              </div>
            )}
          </div>
        </Card>
      )}

      {/* KPIs */}
      {(plan.details?.kpis_smart || plan.details?.kpis) && (
        <Card className="shadow-lg" animation="slideInLeft" delay={3} hover="subtle">
          <div className="flex items-center space-x-3 mb-6">
            <div className="p-2 bg-amber-100 rounded-xl">
              <BarChart3 className="h-6 w-6 text-amber-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">KPI-uri SMART</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {(plan.details.kpis_smart || plan.details.kpis || []).map((kpi: any, index: number) => (
              <Card key={index} className="border-l-4 border-amber-400 bg-amber-50" padding="sm">
                <h4 className="font-semibold text-gray-900 mb-2">
                  {kpi.name || kpi.metric || `KPI ${index + 1}`}
                </h4>
                <p className="text-sm text-gray-700 mb-2">
                  <strong>Țintă:</strong> {kpi.target_value || kpi.target || 'Nu este specificată'}
                </p>
                {kpi.measurement && (
                  <p className="text-sm text-gray-600">{kpi.measurement}</p>
                )}
              </Card>
            ))}
          </div>
        </Card>
      )}
    </div>
  );

  const renderContent = () => {
    const platforms = plan.details?.tactical_plan_per_platform || plan.details?.platforms || [];
    
    return (
      <div className="space-y-8">
        {platforms.map((platform: any, platformIndex: number) => (
          <Card 
            key={platformIndex} 
            className={`shadow-lg border-l-4 ${getChannelColor(platform.platform || platform.name)}`}
            animation="slideInLeft"
            delay={platformIndex + 1}
            hover="subtle"
          >
            <div className="flex items-center space-x-3 mb-6">
              {getChannelIcon(platform.platform || platform.name)}
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  {platform.platform || platform.name}
                </h2>
                <p className="text-gray-600">
                  {platform.posting_frequency || 'Frecvența nu este specificată'}
                </p>
              </div>
            </div>

            {/* Platform Strategy */}
            {platform.strategy && (
              <Card className="bg-gray-50 border-gray-200 mb-6" padding="sm">
                <h3 className="font-semibold text-gray-900 mb-2">Strategia platformei</h3>
                <p className="text-gray-700 text-sm">{platform.strategy}</p>
              </Card>
            )}

            {/* Generated Posts */}
            {platform.posts && platform.posts.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">Postări generate</h3>
                
                {platform.posts.map((post: any, postIndex: number) => {
                  const globalPostIndex = platformIndex * 1000 + postIndex;
                  
                  return (
                    <Card 
                      key={postIndex}
                      className="border border-gray-200 hover:border-gray-300 transition-colors"
                      padding="md"
                      hover="subtle"
                    >
                      <div className="space-y-4">
                        {/* Post Header */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            {getChannelIcon(platform.platform || platform.name)}
                            <div>
                              <div className="flex items-center space-x-2">
                                <span className="font-medium text-gray-900">
                                  {new Date().toLocaleDateString('ro-RO', { 
                                    day: 'numeric', 
                                    month: 'short' 
                                  })}
                                </span>
                                <span className="text-gray-500">•</span>
                                <span className="text-gray-600 text-sm">
                                  {new Date().toLocaleTimeString('ro-RO', { 
                                    hour: '2-digit', 
                                    minute: '2-digit' 
                                  })}
                                </span>
                                <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                                  {post.type || 'post'}
                                </span>
                              </div>
                            </div>
                          </div>
                          
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleImageSuggestions(globalPostIndex, post.content || post.text, platform.platform || platform.name)}
                            className="flex items-center space-x-2"
                          >
                            <Wand2 className="h-4 w-4" />
                            <span>Sugerează Imagini</span>
                          </Button>
                        </div>

                        {/* Post Content */}
                        <div className="space-y-3">
                          <p className="text-gray-800 leading-relaxed whitespace-pre-wrap">
                            {post.content || post.text}
                          </p>
                          
                          {/* Hashtags */}
                          {post.hashtags && post.hashtags.length > 0 && (
                            <div className="flex flex-wrap gap-1">
                              {post.hashtags.map((hashtag: string, hashIndex: number) => (
                                <span 
                                  key={hashIndex}
                                  className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-sm cursor-pointer hover:bg-blue-200 transition-colors"
                                  onClick={() => copyToClipboard(hashtag)}
                                >
                                  {hashtag}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Engagement Metrics (Mock) */}
                        <div className="flex items-center space-x-6 text-sm text-gray-500 pt-3 border-t border-gray-100">
                          <div className="flex items-center space-x-1">
                            <span>❤️</span>
                            <span>{Math.floor(Math.random() * 200) + 50}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <span>💬</span>
                            <span>{Math.floor(Math.random() * 50) + 5}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <span>🔄</span>
                            <span>{Math.floor(Math.random() * 30) + 2}</span>
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                          <div className="flex space-x-2">
                            <Button variant="outline" size="sm" className="flex items-center space-x-1">
                              <Image className="h-4 w-4" />
                              <span>Adaugă imagine</span>
                            </Button>
                            <Button variant="outline" size="sm" className="flex items-center space-x-1">
                              <Type className="h-4 w-4" />
                              <span>Editează text</span>
                            </Button>
                          </div>
                          
                          <Button 
                            size="sm" 
                            className="flex items-center space-x-1"
                            onClick={() => handleSchedulePost(post, platform.platform || platform.name)}
                          >
                            <Calendar className="h-4 w-4" />
                            <span>Programează</span>
                          </Button>
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            )}
          </Card>
        ))}
      </div>
    );
  };

  const renderCalendar = () => (
    <Card className="shadow-lg text-center py-12" animation="bounceIn">
      <div className="p-4 bg-gradient-to-r from-gray-100 to-gray-200 rounded-2xl mb-4 inline-block">
        <Calendar className="h-12 w-12 text-gray-500" />
      </div>
      <h3 className="text-xl font-semibold text-gray-900 mb-2">Calendar în dezvoltare</h3>
      <p className="text-gray-600 mb-6">
        Funcționalitatea de calendar va fi disponibilă în curând pentru a vizualiza toate postările programate.
      </p>
    </Card>
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200" animation="fadeInUp">
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
              <h1 className="text-3xl font-bold text-gray-900">{plan.title}</h1>
              <p className="text-gray-600">
                Creat pe {formatDate(plan.created_at)}
              </p>
            </div>
          </div>
          
          <div className="flex space-x-3">
            <Button variant="outline" className="flex items-center space-x-2">
              <Download className="h-4 w-4" />
              <span>Export</span>
            </Button>
            <Button variant="outline" className="flex items-center space-x-2">
              <Share2 className="h-4 w-4" />
              <span>Partajează</span>
            </Button>
            <Button 
              onClick={() => setIsEditing(true)}
              className="flex items-center space-x-2"
            >
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
        {activeTab === 'content' && renderContent()}
        {activeTab === 'calendar' && renderCalendar()}
      </div>

      {/* Image Suggestions Modal */}
      {showImageSuggestions !== null && (
        <>
          <div 
            className="fixed inset-0 bg-black/50 z-50 animate-fade-in"
            onClick={() => setShowImageSuggestions(null)}
          />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <Card 
              className="w-full max-w-2xl bg-white shadow-2xl border-0 max-h-[90vh] overflow-y-auto"
              animation="scaleIn"
              padding="lg"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900">
                  Sugestii de imagini pentru postarea {Math.floor(showImageSuggestions / 1000) + 1}:
                </h3>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setShowImageSuggestions(null)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              {loadingSuggestions ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <p className="text-gray-600">Generez sugestii de imagini...</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {imageSuggestions.map((suggestion, index) => (
                    <Card 
                      key={index}
                      className="border-l-4 border-blue-400 bg-blue-50"
                      padding="sm"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900 mb-2">
                            {index + 1}. {suggestion}
                          </h4>
                        </div>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => copyToClipboard(suggestion)}
                          className="ml-3"
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                    </Card>
                  ))}

                  <Card className="bg-green-50 border-green-200" padding="sm">
                    <div className="flex items-center space-x-2 text-sm text-green-800">
                      <Sparkles className="h-4 w-4" />
                      <span>
                        <strong>Tip:</strong> În versiunea completă, aici ar fi integrate servicii precum 
                        Unsplash, Pexels sau DALL-E pentru generarea automată de imagini.
                      </span>
                    </div>
                  </Card>

                  <div className="flex justify-center pt-4">
                    <Button 
                      onClick={copyAllSuggestions}
                      className="flex items-center space-x-2"
                    >
                      <Copy className="h-4 w-4" />
                      <span>Copiază toate sugestiile</span>
                    </Button>
                  </div>
                </div>
              )}
            </Card>
          </div>
        </>
      )}

      {/* Schedule Modal */}
      <ScheduleModal
        isOpen={scheduleModal.isOpen}
        onClose={handleCloseScheduleModal}
        post={scheduleModal.post}
        onSchedule={handleConfirmSchedule}
        loading={scheduleModal.loading}
      />
    </div>
  );
};