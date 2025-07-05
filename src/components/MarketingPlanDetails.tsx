import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, Edit3, Save, X, Calendar, Target, Users, BarChart3, 
  MessageSquare, Clock, CheckCircle, AlertCircle, Copy, Download,
  Eye, ExternalLink, Trash2, Plus, Wand2, Sparkles, Brain, TrendingUp
} from 'lucide-react';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { Textarea } from './ui/Textarea';
import { Input } from './ui/Input';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useNotifications } from '../contexts/NotificationContext';
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

interface ScheduledPost {
  id: string;
  platform: string;
  content: string;
  scheduled_at: string;
  status: string;
}

export const MarketingPlanDetails: React.FC<MarketingPlanDetailsProps> = ({
  plan,
  onBack,
  onEdit,
  onPlanUpdated
}) => {
  const { user } = useAuth();
  const { addNotification } = useNotifications();
  const [activeTab, setActiveTab] = useState<'overview' | 'content' | 'calendar' | 'analytics' | 'edit'>('overview');
  const [scheduledPosts, setScheduledPosts] = useState<ScheduledPost[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingPost, setEditingPost] = useState<string | null>(null);
  const [editedContent, setEditedContent] = useState<string>('');
  const [previewPost, setPreviewPost] = useState<ScheduledPost | null>(null);

  useEffect(() => {
    if (activeTab === 'content') {
      fetchScheduledPosts();
    }
  }, [activeTab, plan.id]);

  const fetchScheduledPosts = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('scheduled_posts')
        .select('*')
        .eq('marketing_plan_id', plan.id)
        .order('scheduled_at', { ascending: true });

      if (error) throw error;
      setScheduledPosts(data || []);
    } catch (error) {
      console.error('Error fetching scheduled posts:', error);
      addNotification({
        type: 'error',
        title: 'Eroare la încărcare',
        message: 'Nu am putut încărca postările programate.',
        persistent: true
      });
    } finally {
      setLoading(false);
    }
  };

  // Funcționalități pentru iconițele postărilor
  const handlePreviewPost = (post: ScheduledPost) => {
    setPreviewPost(post);
    addNotification({
      type: 'info',
      title: 'Previzualizare postare',
      message: `Afișez previzualizarea pentru ${post.platform}`,
      persistent: false,
      autoClose: true,
      duration: 2000
    });
  };

  const handleEditPost = (post: ScheduledPost) => {
    setEditingPost(post.id);
    setEditedContent(post.content);
  };

  const handleSavePost = async (postId: string) => {
    if (!editedContent.trim()) {
      addNotification({
        type: 'error',
        title: 'Eroare',
        message: 'Conținutul nu poate fi gol.',
        persistent: false
      });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from('scheduled_posts')
        .update({ content: editedContent.trim() })
        .eq('id', postId);

      if (error) throw error;

      // Actualizează local
      setScheduledPosts(prev => 
        prev.map(post => 
          post.id === postId 
            ? { ...post, content: editedContent.trim() }
            : post
        )
      );

      setEditingPost(null);
      setEditedContent('');

      addNotification({
        type: 'success',
        title: 'Postare actualizată!',
        message: 'Conținutul a fost salvat cu succes.',
        persistent: false,
        autoClose: true,
        duration: 3000
      });
    } catch (error) {
      console.error('Error updating post:', error);
      addNotification({
        type: 'error',
        title: 'Eroare la salvare',
        message: 'Nu am putut salva modificările.',
        persistent: true
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCancelEdit = () => {
    setEditingPost(null);
    setEditedContent('');
  };

  const handleExportPost = async (post: ScheduledPost) => {
    try {
      const exportContent = `Platform: ${post.platform}
Programată pentru: ${formatScheduledDate(post.scheduled_at)}
Status: ${getStatusText(post.status)}

Conținut:
${post.content}

---
Generat de Univoice - ${new Date().toLocaleDateString('ro-RO')}`;

      // Copiază în clipboard
      await navigator.clipboard.writeText(exportContent);
      
      addNotification({
        type: 'success',
        title: 'Postare exportată!',
        message: `Conținutul pentru ${post.platform} a fost copiat în clipboard.`,
        persistent: false,
        autoClose: true,
        duration: 3000
      });

      // Descarcă și ca fișier
      const blob = new Blob([exportContent], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${post.platform}_post_${post.id.slice(0, 8)}.txt`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Error exporting post:', err);
      addNotification({
        type: 'error',
        title: 'Eroare la export!',
        message: 'Nu am putut exporta postarea.',
        persistent: true,
      });
    }
  };

  const formatScheduledDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (date.getTime() - now.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 24 && diffInHours > 0) {
      return `Astăzi la ${date.toLocaleTimeString('ro-RO', { 
        hour: '2-digit', 
        minute: '2-digit' 
      })}`;
    } else if (diffInHours < 48 && diffInHours > 24) {
      return `Mâine la ${date.toLocaleTimeString('ro-RO', { 
        hour: '2-digit', 
        minute: '2-digit' 
      })}`;
    } else {
      return date.toLocaleDateString('ro-RO', {
        day: 'numeric',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'published':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'draft':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'failed':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'scheduled':
        return 'Programată';
      case 'published':
        return 'Publicată';
      case 'draft':
        return 'Ciornă';
      case 'failed':
        return 'Eșuată';
      default:
        return status;
    }
  };

  const getPlatformIcon = (platform: string) => {
    switch (platform.toLowerCase()) {
      case 'facebook':
        return '📘';
      case 'instagram':
        return '📷';
      case 'twitter':
        return '🐦';
      case 'linkedin':
        return '💼';
      case 'tiktok':
        return '🎵';
      default:
        return '📱';
    }
  };

  const tabs = [
    { id: 'overview', name: 'Prezentare generală', icon: Target },
    { id: 'content', name: 'Conținut generat', icon: MessageSquare },
    { id: 'calendar', name: 'Calendar', icon: Calendar },
    { id: 'analytics', name: 'Analiză', icon: BarChart3 },
    { id: 'edit', name: 'Editează planul', icon: Edit3 }
  ];

  if (activeTab === 'edit') {
    return (
      <MarketingPlanEditor
        plan={plan}
        onSave={onPlanUpdated}
        onCancel={() => setActiveTab('overview')}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card animation="fadeInUp">
        <div className="flex items-center justify-between">
          <Button 
            variant="outline" 
            onClick={onBack}
            className="flex items-center space-x-2"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Înapoi la planuri</span>
          </Button>
          <div className="text-center flex-1 mx-8">
            <h1 className="text-2xl font-bold text-gray-900">{plan.title}</h1>
            <p className="text-gray-600">
              Creat pe {new Date(plan.created_at).toLocaleDateString('ro-RO')}
            </p>
          </div>
          <div className="flex space-x-2">
            <Button 
              variant="outline"
              onClick={() => setActiveTab('edit')}
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
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Plan Summary */}
          <Card className="shadow-lg" animation="slideInLeft" hover="subtle">
            <div className="flex items-center space-x-3 mb-6">
              <div className="p-2 bg-blue-100 rounded-xl">
                <Target className="h-6 w-6 text-blue-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">Rezumat plan</h2>
            </div>
            
            {plan.details?.summary && (
              <div className="mb-6">
                <h3 className="font-semibold text-gray-900 mb-2">Obiectiv principal:</h3>
                <p className="text-gray-700 leading-relaxed">{plan.details.summary}</p>
              </div>
            )}

            {plan.details?.objectives && (
              <div className="mb-6">
                <h3 className="font-semibold text-gray-900 mb-3">Obiective:</h3>
                <ul className="space-y-2">
                  {plan.details.objectives.map((objective: string, index: number) => (
                    <li key={index} className="flex items-start space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700">{objective}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </Card>

          {/* Target Audience */}
          <Card className="shadow-lg" animation="slideInRight" hover="subtle">
            <div className="flex items-center space-x-3 mb-6">
              <div className="p-2 bg-purple-100 rounded-xl">
                <Users className="h-6 w-6 text-purple-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">Audiența țintă</h2>
            </div>
            
            {plan.details?.target_audience && (
              <div className="space-y-4">
                {plan.details.target_audience.primary && (
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Audiența principală:</h3>
                    <p className="text-gray-700">{plan.details.target_audience.primary}</p>
                  </div>
                )}
                
                {plan.details.target_audience.demographics && (
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Demografia:</h3>
                    <p className="text-gray-700">{plan.details.target_audience.demographics}</p>
                  </div>
                )}
              </div>
            )}
          </Card>
        </div>
      )}

      {activeTab === 'content' && (
        <div className="space-y-6">
          {loading ? (
            <Card className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Se încarcă postările...</p>
            </Card>
          ) : scheduledPosts.length === 0 ? (
            <Card className="text-center py-12" animation="bounceIn">
              <div className="p-4 bg-gray-100 rounded-2xl mb-4 inline-block">
                <MessageSquare className="h-12 w-12 text-gray-500" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Nu sunt postări programate
              </h3>
              <p className="text-gray-600 mb-6">
                Acest plan nu are încă postări generate. Poți genera conținut nou.
              </p>
              <Button className="flex items-center space-x-2">
                <Plus className="h-4 w-4" />
                <span>Generează conținut</span>
              </Button>
            </Card>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {scheduledPosts.map((post, index) => (
                <Card 
                  key={post.id}
                  className="shadow-lg border-l-4 border-blue-400"
                  animation="scaleIn"
                  delay={index + 1}
                  hover="subtle"
                >
                  {/* Header cu iconițele funcționale */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">{getPlatformIcon(post.platform)}</span>
                      <div>
                        <h3 className="text-lg font-bold text-gray-900 flex items-center space-x-2">
                          <span>{post.platform}</span>
                          <span 
                            className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(post.status)}`}
                          >
                            {getStatusText(post.status)}
                          </span>
                        </h3>
                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                          <Clock className="h-4 w-4" />
                          <span>{formatScheduledDate(post.scheduled_at)}</span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Iconițele funcționale */}
                    {editingPost !== post.id && (
                      <div className="flex items-center space-x-1">
                        {/* Vizualizare */}
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => handlePreviewPost(post)}
                          className="p-2 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                          title="Previzualizează postarea"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        
                        {/* Editare */}
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => handleEditPost(post)}
                          className="p-2 hover:bg-green-50 hover:text-green-600 transition-colors"
                          title="Editează postarea"
                        >
                          <Edit3 className="h-4 w-4" />
                        </Button>
                        
                        {/* Export */}
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => handleExportPost(post)}
                          className="p-2 hover:bg-purple-50 hover:text-purple-600 transition-colors"
                          title="Exportă postarea"
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  {editingPost === post.id ? (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Conținutul postării pentru {post.platform}
                        </label>
                        <Textarea
                          value={editedContent}
                          onChange={(e) => setEditedContent(e.target.value)}
                          rows={6}
                          placeholder={`Editează conținutul pentru ${post.platform}...`}
                          className="resize-none"
                        />
                        <div className="mt-2 text-xs text-gray-500">
                          Caractere: {editedContent.length}
                        </div>
                      </div>
                      
                      <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                        <Button 
                          variant="outline" 
                          onClick={handleCancelEdit}
                          disabled={loading}
                          className="flex items-center space-x-2"
                        >
                          <X className="h-4 w-4" />
                          <span>Anulează</span>
                        </Button>
                        <Button 
                          onClick={() => handleSavePost(post.id)}
                          loading={loading}
                          disabled={editedContent.trim() === '' || editedContent === post.content}
                          className="flex items-center space-x-2"
                        >
                          <Save className="h-4 w-4" />
                          <span>Salvează</span>
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="bg-gray-50 rounded-lg p-4 border">
                        <p className="text-gray-800 whitespace-pre-wrap leading-relaxed">
                          {post.content}
                        </p>
                      </div>
                      
                      <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="flex items-center space-x-2"
                        >
                          <Calendar className="h-4 w-4" />
                          <span>Programează</span>
                        </Button>
                        
                        <div className="text-xs text-gray-500">
                          ID: {post.id.slice(0, 8)}...
                        </div>
                      </div>
                    </div>
                  )}
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'calendar' && (
        <Card className="shadow-lg text-center py-12" animation="bounceIn">
          <div className="p-4 bg-blue-100 rounded-2xl mb-4 inline-block">
            <Calendar className="h-12 w-12 text-blue-600" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Calendar în dezvoltare
          </h3>
          <p className="text-gray-600">
            Funcționalitatea de calendar va fi disponibilă în curând.
          </p>
        </Card>
      )}

      {activeTab === 'analytics' && (
        <Card className="shadow-lg text-center py-12" animation="bounceIn">
          <div className="p-4 bg-green-100 rounded-2xl mb-4 inline-block">
            <BarChart3 className="h-12 w-12 text-green-600" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Analiză în dezvoltare
          </h3>
          <p className="text-gray-600">
            Funcționalitatea de analiză va fi disponibilă în curând.
          </p>
        </Card>
      )}

      {/* Preview Modal */}
      {previewPost && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="max-w-2xl w-full max-h-[80vh] overflow-y-auto" padding="lg">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <span className="text-2xl">{getPlatformIcon(previewPost.platform)}</span>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">
                    Previzualizare - {previewPost.platform}
                  </h2>
                  <p className="text-sm text-gray-600">
                    {formatScheduledDate(previewPost.scheduled_at)}
                  </p>
                </div>
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setPreviewPost(null)}
                className="p-2"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>

            {/* Preview Content */}
            <div className="space-y-4">
              <div className="bg-white border rounded-lg p-6 shadow-sm">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-sm">
                      {previewPost.platform.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">Brandul tău</p>
                    <p className="text-xs text-gray-500">
                      {formatScheduledDate(previewPost.scheduled_at)}
                    </p>
                  </div>
                </div>
                
                <div className="prose prose-sm max-w-none">
                  <p className="text-gray-800 whitespace-pre-wrap leading-relaxed">
                    {previewPost.content}
                  </p>
                </div>

                <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
                  <div className="flex items-center space-x-4 text-gray-500">
                    <button className="flex items-center space-x-1 hover:text-blue-600">
                      <span>👍</span>
                      <span className="text-sm">Like</span>
                    </button>
                    <button className="flex items-center space-x-1 hover:text-blue-600">
                      <span>💬</span>
                      <span className="text-sm">Comment</span>
                    </button>
                    <button className="flex items-center space-x-1 hover:text-blue-600">
                      <span>📤</span>
                      <span className="text-sm">Share</span>
                    </button>
                  </div>
                  <span 
                    className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(previewPost.status)}`}
                  >
                    {getStatusText(previewPost.status)}
                  </span>
                </div>
              </div>

              <div className="flex justify-end space-x-3">
                <Button 
                  variant="outline" 
                  onClick={() => setPreviewPost(null)}
                  className="flex items-center space-x-2"
                >
                  <X className="h-4 w-4" />
                  <span>Închide</span>
                </Button>
                <Button 
                  onClick={() => {
                    setPreviewPost(null);
                    handleEditPost(previewPost);
                  }}
                  className="flex items-center space-x-2"
                >
                  <Edit3 className="h-4 w-4" />
                  <span>Editează</span>
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};