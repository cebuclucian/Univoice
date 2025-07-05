import React, { useState, useEffect } from 'react';
import { ArrowLeft, Edit3, Calendar, Target, Users, BarChart3, Globe, Download, Share2, Clock, CheckCircle, AlertCircle, Plus, Trash2, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { Button } from './ui/Button';
import { Card } from './ui/Card';
import { Input } from './ui/Input';
import { Textarea } from './ui/Textarea';
import { MarketingPlanEditor } from './MarketingPlanEditor';
import { PostEditor } from './PostEditor';

interface MarketingPlan {
  id: string;
  title: string;
  details: any;
  created_at: string;
}

interface ScheduledPost {
  id: string;
  platform: string;
  content: string;
  scheduled_at: string;
  status: string;
  user_id: string;
  marketing_plan_id: string;
}

interface MarketingPlanDetailsProps {
  plan: MarketingPlan;
  onBack: () => void;
  onEdit: () => void;
  onPlanUpdated?: (updatedPlan: MarketingPlan) => void;
}

export const MarketingPlanDetails: React.FC<MarketingPlanDetailsProps> = ({
  plan,
  onBack,
  onEdit,
  onPlanUpdated
}) => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'overview' | 'content' | 'calendar' | 'analytics'>('overview');
  const [isEditing, setIsEditing] = useState(false);
  const [scheduledPosts, setScheduledPosts] = useState<ScheduledPost[]>([]);
  const [loadingPosts, setLoadingPosts] = useState(true);
  const [showScheduleForm, setShowScheduleForm] = useState(false);
  const [newPost, setNewPost] = useState({
    platform: '',
    content: '',
    scheduled_at: ''
  });

  // Fetch scheduled posts for this plan
  useEffect(() => {
    const fetchScheduledPosts = async () => {
      if (!user) return;

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
      } finally {
        setLoadingPosts(false);
      }
    };

    fetchScheduledPosts();
  }, [plan.id, user]);

  // Handle post update from PostEditor
  const handlePostUpdate = (updatedPost: ScheduledPost) => {
    setScheduledPosts(prev => 
      prev.map(post => 
        post.id === updatedPost.id ? updatedPost : post
      )
    );
  };

  const handleEditToggle = () => {
    setIsEditing(!isEditing);
  };

  const handlePlanUpdate = (updatedPlan: MarketingPlan) => {
    onPlanUpdated?.(updatedPlan);
    setIsEditing(false);
  };

  const handleSchedulePost = async () => {
    if (!user || !newPost.platform || !newPost.content || !newPost.scheduled_at) return;

    try {
      const { data, error } = await supabase
        .from('scheduled_posts')
        .insert({
          user_id: user.id,
          marketing_plan_id: plan.id,
          platform: newPost.platform,
          content: newPost.content,
          scheduled_at: newPost.scheduled_at,
          status: 'scheduled'
        })
        .select()
        .single();

      if (error) throw error;

      setScheduledPosts(prev => [...prev, data]);
      setNewPost({ platform: '', content: '', scheduled_at: '' });
      setShowScheduleForm(false);
    } catch (error) {
      console.error('Error scheduling post:', error);
    }
  };

  const handleDeletePost = async (postId: string) => {
    if (!confirm('Ești sigur că vrei să ștergi această postare programată?')) return;

    try {
      const { error } = await supabase
        .from('scheduled_posts')
        .delete()
        .eq('id', postId);

      if (error) throw error;

      setScheduledPosts(prev => prev.filter(post => post.id !== postId));
    } catch (error) {
      console.error('Error deleting post:', error);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ro-RO', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getPlatformColor = (platform: string) => {
    switch (platform.toLowerCase()) {
      case 'facebook': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'instagram': return 'bg-pink-100 text-pink-800 border-pink-200';
      case 'twitter': return 'bg-sky-100 text-sky-800 border-sky-200';
      case 'linkedin': return 'bg-indigo-100 text-indigo-800 border-indigo-200';
      case 'tiktok': return 'bg-purple-100 text-purple-800 border-purple-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const tabs = [
    { id: 'overview', name: 'Prezentare generală', icon: Target },
    { id: 'content', name: 'Conținut programat', icon: Calendar },
    { id: 'calendar', name: 'Calendar', icon: Clock },
    { id: 'analytics', name: 'Analiză', icon: BarChart3 }
  ];

  if (isEditing) {
    return (
      <MarketingPlanEditor
        plan={plan}
        onSave={handlePlanUpdate}
        onCancel={() => setIsEditing(false)}
      />
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200" animation="fadeInUp">
        <div className="flex items-center justify-between">
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
              onClick={handleEditToggle}
              className="flex items-center space-x-2"
            >
              <Edit3 className="h-4 w-4" />
              <span>Editează planul</span>
            </Button>
          </div>
        </div>
      </Card>

      {/* Tabs */}
      <Card className="shadow-lg" animation="slideInLeft">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`
                    flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors
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
          {/* Summary */}
          <Card className="shadow-lg" animation="slideInLeft" hover="subtle">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Rezumat executiv</h2>
            <p className="text-gray-700 leading-relaxed">
              {plan.details?.summary || plan.details?.objective || 'Nu există rezumat disponibil.'}
            </p>
          </Card>

          {/* Objectives */}
          {plan.details?.objectives && (
            <Card className="shadow-lg" animation="slideInRight" hover="subtle">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Obiective</h2>
              <ul className="space-y-2">
                {plan.details.objectives.map((objective: string, index: number) => (
                  <li key={index} className="flex items-start space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">{objective}</span>
                  </li>
                ))}
              </ul>
            </Card>
          )}

          {/* Target Audience */}
          {plan.details?.target_audience && (
            <Card className="shadow-lg" animation="slideInLeft" delay={1} hover="subtle">
              <div className="flex items-center space-x-3 mb-4">
                <Users className="h-6 w-6 text-purple-600" />
                <h2 className="text-2xl font-bold text-gray-900">Audiența țintă</h2>
              </div>
              <div className="space-y-3">
                <p className="text-gray-700">{plan.details.target_audience.primary}</p>
                {plan.details.target_audience.demographics && (
                  <div>
                    <h4 className="font-semibold text-gray-800">Demografia:</h4>
                    <p className="text-gray-600 text-sm">{plan.details.target_audience.demographics}</p>
                  </div>
                )}
              </div>
            </Card>
          )}

          {/* KPIs */}
          {plan.details?.kpis_smart && (
            <Card className="shadow-lg" animation="slideInRight" delay={1} hover="subtle">
              <div className="flex items-center space-x-3 mb-4">
                <BarChart3 className="h-6 w-6 text-green-600" />
                <h2 className="text-2xl font-bold text-gray-900">KPI-uri SMART</h2>
              </div>
              <div className="space-y-3">
                {plan.details.kpis_smart.map((kpi: any, index: number) => (
                  <div key={index} className="border-l-4 border-green-400 pl-4">
                    <h4 className="font-semibold text-gray-800">{kpi.name}</h4>
                    <p className="text-gray-600 text-sm">{kpi.target_value}</p>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>
      )}

      {activeTab === 'content' && (
        <div className="space-y-6">
          {/* Header with Add Button */}
          <Card className="shadow-lg" animation="slideInLeft">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Conținut programat</h2>
                <p className="text-gray-600">
                  {scheduledPosts.length} postări programate
                </p>
              </div>
              <Button 
                onClick={() => setShowScheduleForm(true)}
                className="flex items-center space-x-2"
              >
                <Plus className="h-4 w-4" />
                <span>Programează postare</span>
              </Button>
            </div>
          </Card>

          {/* Schedule Form */}
          {showScheduleForm && (
            <Card className="shadow-lg border-blue-200" animation="slideInLeft">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Programează o postare nouă</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Platforma</label>
                  <select
                    value={newPost.platform}
                    onChange={(e) => setNewPost(prev => ({ ...prev, platform: e.target.value }))}
                    className="w-full rounded-xl border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  >
                    <option value="">Selectează platforma</option>
                    <option value="Facebook">Facebook</option>
                    <option value="Instagram">Instagram</option>
                    <option value="Twitter">Twitter</option>
                    <option value="LinkedIn">LinkedIn</option>
                    <option value="TikTok">TikTok</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Data și ora</label>
                  <input
                    type="datetime-local"
                    value={newPost.scheduled_at}
                    onChange={(e) => setNewPost(prev => ({ ...prev, scheduled_at: e.target.value }))}
                    className="w-full rounded-xl border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Conținut</label>
                <Textarea
                  value={newPost.content}
                  onChange={(e) => setNewPost(prev => ({ ...prev, content: e.target.value }))}
                  placeholder="Scrie conținutul postării..."
                  rows={4}
                />
              </div>
              <div className="flex justify-end space-x-3">
                <Button 
                  variant="outline" 
                  onClick={() => setShowScheduleForm(false)}
                >
                  Anulează
                </Button>
                <Button 
                  onClick={handleSchedulePost}
                  disabled={!newPost.platform || !newPost.content || !newPost.scheduled_at}
                >
                  Programează
                </Button>
              </div>
            </Card>
          )}

          {/* Scheduled Posts */}
          {loadingPosts ? (
            <Card className="text-center py-8" animation="bounceIn">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Se încarcă postările programate...</p>
            </Card>
          ) : scheduledPosts.length === 0 ? (
            <Card className="text-center py-12" animation="bounceIn">
              <div className="p-4 bg-gray-100 rounded-2xl mb-4 inline-block">
                <Calendar className="h-12 w-12 text-gray-500" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Nu ai postări programate
              </h3>
              <p className="text-gray-600 mb-6">
                Începe prin a programa prima ta postare pentru acest plan de marketing.
              </p>
              <Button 
                onClick={() => setShowScheduleForm(true)}
                className="flex items-center space-x-2"
              >
                <Plus className="h-4 w-4" />
                <span>Programează prima postare</span>
              </Button>
            </Card>
          ) : (
            <div className="space-y-6">
              {scheduledPosts.map((post, index) => (
                <PostEditor
                  key={post.id}
                  post={post}
                  onUpdate={handlePostUpdate}
                  className="animate-fade-in-up"
                  style={{ animationDelay: `${index * 0.1}s` }}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'calendar' && (
        <Card className="shadow-lg text-center py-12" animation="bounceIn">
          <div className="p-4 bg-gray-100 rounded-2xl mb-4 inline-block">
            <Calendar className="h-12 w-12 text-gray-500" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Calendarul va fi disponibil în curând
          </h3>
          <p className="text-gray-600">
            Funcționalitatea de calendar pentru vizualizarea postărilor programate este în dezvoltare.
          </p>
        </Card>
      )}

      {activeTab === 'analytics' && (
        <Card className="shadow-lg text-center py-12" animation="bounceIn">
          <div className="p-4 bg-gray-100 rounded-2xl mb-4 inline-block">
            <BarChart3 className="h-12 w-12 text-gray-500" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Analiza va fi disponibilă în curând
          </h3>
          <p className="text-gray-600">
            Funcționalitatea de analiză pentru urmărirea performanței planurilor este în dezvoltare.
          </p>
        </Card>
      )}
    </div>
  );
};