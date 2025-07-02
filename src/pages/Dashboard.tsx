import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Plus, Target, Calendar, BarChart3, Crown, Sparkles, TrendingUp, Users, Edit3,
  Clock, CheckCircle, AlertCircle, Zap, Brain, MessageSquare, Instagram,
  Facebook, Twitter, Mail, Globe, ArrowRight, Star, Bell, Settings, Wand2
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTranslation } from '../hooks/useTranslation';
import { supabase } from '../lib/supabase';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { SkeletonLoader, CardSkeleton } from '../components/ui/SkeletonLoader';
import { BrandVoiceAnalysis } from '../components/BrandVoiceAnalysis';

interface BrandProfile {
  id: string;
  brand_name: string;
  brand_description: string;
  content_example_1: string;
  content_example_2: string | null;
  personality_traits: string[];
  communication_tones: string[];
  created_at: string;
  updated_at: string;
}

interface MarketingPlan {
  id: string;
  title: string;
  details: any;
  created_at: string;
}

interface Notification {
  id: string;
  type: 'info' | 'warning' | 'success';
  title: string;
  message: string;
  action?: string;
}

export const Dashboard: React.FC = () => {
  const [brandProfile, setBrandProfile] = useState<BrandProfile | null>(null);
  const [marketingPlans, setMarketingPlans] = useState<MarketingPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAnalysis, setShowAnalysis] = useState(false);
  const { user } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();

  // Mock data for enhanced features
  const notifications: Notification[] = [
    {
      id: '1',
      type: 'warning',
      title: 'Plan în expirare',
      message: 'Planul "Campanie de vară" expiră în 3 zile',
      action: 'Vezi planul'
    },
    {
      id: '2',
      type: 'info',
      title: 'Conținut nou disponibil',
      message: 'AI a generat 5 idei noi pentru postări',
      action: 'Vezi ideile'
    }
  ];

  const weeklyCalendar = [
    { day: 'Luni', date: '15', posts: [{ channel: 'Facebook', type: 'post', time: '10:00' }] },
    { day: 'Marți', date: '16', posts: [{ channel: 'Instagram', type: 'story', time: '14:00' }] },
    { day: 'Miercuri', date: '17', posts: [{ channel: 'LinkedIn', type: 'article', time: '09:00' }] },
    { day: 'Joi', date: '18', posts: [{ channel: 'Twitter', type: 'tweet', time: '16:00' }] },
    { day: 'Vineri', date: '19', posts: [{ channel: 'Email', type: 'newsletter', time: '11:00' }] },
    { day: 'Sâmbătă', date: '20', posts: [] },
    { day: 'Duminică', date: '21', posts: [{ channel: 'Instagram', type: 'post', time: '18:00' }] }
  ];

  const aiRecommendations = [
    {
      title: 'Trend în creștere: Sustenabilitate',
      description: 'Conținutul despre sustenabilitate are o creștere de 45% în industria ta',
      action: 'Creează conținut'
    },
    {
      title: 'Optimizează postările de dimineață',
      description: 'Audiența ta este cea mai activă între 8-10 AM',
      action: 'Programează postări'
    },
    {
      title: 'Video content performează mai bine',
      description: 'Postările video au cu 60% mai mult engagement',
      action: 'Creează video'
    }
  ];

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;

      try {
        // Fetch brand profile
        const { data: brandData, error: brandError } = await supabase
          .from('brand_profiles')
          .select('*')
          .eq('user_id', user.id);

        if (brandData && brandData.length > 0 && !brandError) {
          setBrandProfile(brandData[0]);
          
          // Fetch marketing plans if we have a brand profile
          const { data: plansData, error: plansError } = await supabase
            .from('marketing_plans')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false });

          if (plansData && !plansError) {
            setMarketingPlans(plansData);
          }
        } else if (!brandError) {
          setBrandProfile(null);
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  const handleDefineBrandVoice = () => {
    navigate('/app/onboarding');
  };

  const handleEditBrandVoice = () => {
    navigate('/app/onboarding', { state: { editMode: true } });
  };

  const handleAnalyzeBrandVoice = () => {
    setShowAnalysis(true);
  };

  if (loading) {
    return (
      <div className="space-y-8">
        {/* Header Skeleton */}
        <Card animation="fadeInUp" className="animate-pulse">
          <div className="flex justify-between items-start">
            <div className="space-y-2">
              <SkeletonLoader height="h-8" className="w-64" />
              <SkeletonLoader height="h-4" className="w-96" />
            </div>
            <div className="skeleton h-12 w-48 rounded-xl" />
          </div>
        </Card>

        {/* Stats Cards Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <CardSkeleton key={i} className={`animate-scale-in animate-stagger-${i}`} />
          ))}
        </div>

        {/* Content Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <CardSkeleton className="animate-slide-in-left" />
          <CardSkeleton className="animate-slide-in-right" />
        </div>
      </div>
    );
  }

  // Show Brand Voice Analysis if requested
  if (showAnalysis && brandProfile) {
    return (
      <div className="space-y-8">
        {/* Back Button */}
        <Card animation="fadeInUp">
          <div className="flex items-center justify-between">
            <Button 
              variant="outline" 
              onClick={() => setShowAnalysis(false)}
              className="flex items-center space-x-2"
            >
              <ArrowRight className="h-4 w-4 rotate-180" />
              <span>Înapoi la Dashboard</span>
            </Button>
            <h1 className="text-2xl font-bold text-gray-900">Analiza Vocii Brandului</h1>
          </div>
        </Card>

        <BrandVoiceAnalysis 
          brandProfile={brandProfile}
          onAnalysisComplete={(result) => {
            console.log('Analysis completed:', result);
          }}
        />
      </div>
    );
  }

  const activePlans = marketingPlans.length;
  const draftPlans = 0; // Mock data since we don't have status field
  const contentGenerated = 24; // Mock data
  const daysUntilNext = 3; // Mock data

  const getChannelIcon = (channel: string) => {
    switch (channel.toLowerCase()) {
      case 'facebook': return <Facebook className="h-4 w-4" />;
      case 'instagram': return <Instagram className="h-4 w-4" />;
      case 'twitter': return <Twitter className="h-4 w-4" />;
      case 'linkedin': return <Globe className="h-4 w-4" />;
      case 'email': return <Mail className="h-4 w-4" />;
      default: return <MessageSquare className="h-4 w-4" />;
    }
  };

  const getChannelColor = (channel: string) => {
    switch (channel.toLowerCase()) {
      case 'facebook': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'instagram': return 'bg-pink-100 text-pink-700 border-pink-200';
      case 'twitter': return 'bg-sky-100 text-sky-700 border-sky-200';
      case 'linkedin': return 'bg-indigo-100 text-indigo-700 border-indigo-200';
      case 'email': return 'bg-green-100 text-green-700 border-green-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  return (
    <div className="space-y-8">
      {/* Welcome Section with Notifications */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card 
          className="lg:col-span-2 bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200" 
          animation="fadeInUp"
          hover="subtle"
        >
          <div className="flex items-center space-x-4 mb-4">
            <div className="p-3 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl micro-scale">
              <Brain className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Bună dimineața{brandProfile ? `, ${brandProfile.brand_name}` : ''}! 👋
              </h1>
              <p className="text-gray-600">
                {brandProfile 
                  ? 'Ești gata să creezi conținut de marketing uimitor astăzi?'
                  : 'Bine ai venit la Univoice! Să începem prin a-ți defini vocea brandului.'
                }
              </p>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-3 mt-6">
            {brandProfile ? (
              <>
                <Button size="lg" className="flex items-center space-x-2 micro-bounce">
                  <Plus className="h-5 w-5" />
                  <span>Plan de marketing nou</span>
                </Button>
                <Button variant="outline" size="lg" className="flex items-center space-x-2 micro-bounce">
                  <Zap className="h-5 w-5" />
                  <span>Generează conținut rapid</span>
                </Button>
                <Button 
                  variant="outline" 
                  size="lg" 
                  onClick={handleAnalyzeBrandVoice}
                  className="flex items-center space-x-2 micro-bounce"
                >
                  <Brain className="h-5 w-5" />
                  <span>Analizează vocea</span>
                </Button>
                <Button 
                  variant="outline" 
                  size="lg" 
                  onClick={handleEditBrandVoice}
                  className="flex items-center space-x-2 micro-bounce"
                >
                  <Wand2 className="h-5 w-5" />
                  <span>Îmbunătățește vocea</span>
                </Button>
              </>
            ) : (
              <Button 
                size="lg" 
                onClick={handleDefineBrandVoice}
                className="flex items-center space-x-2 micro-bounce"
              >
                <Sparkles className="h-5 w-5" />
                <span>Definește vocea brandului</span>
              </Button>
            )}
          </div>
        </Card>

        {/* Notifications */}
        <Card className="shadow-lg" animation="slideInRight" hover="subtle">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-900">Notificări</h3>
            <Bell className="h-5 w-5 text-gray-400" />
          </div>
          
          {brandProfile ? (
            <div className="space-y-3">
              {notifications.map((notification, index) => (
                <Card 
                  key={notification.id}
                  className={`border-l-4 ${
                    notification.type === 'warning' ? 'border-amber-400 bg-amber-50' :
                    notification.type === 'info' ? 'border-blue-400 bg-blue-50' :
                    'border-green-400 bg-green-50'
                  }`}
                  padding="sm"
                  animation="fadeInUp"
                  delay={index + 1}
                  hover="subtle"
                >
                  <div className="flex items-start space-x-3">
                    <div className={`p-1 rounded-full ${
                      notification.type === 'warning' ? 'bg-amber-200' :
                      notification.type === 'info' ? 'bg-blue-200' :
                      'bg-green-200'
                    }`}>
                      {notification.type === 'warning' ? 
                        <AlertCircle className="h-4 w-4 text-amber-600" /> :
                        notification.type === 'info' ?
                        <Bell className="h-4 w-4 text-blue-600" /> :
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      }
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900 text-sm">{notification.title}</h4>
                      <p className="text-gray-600 text-xs mt-1">{notification.message}</p>
                      {notification.action && (
                        <Button variant="ghost" size="sm" className="mt-2 text-xs p-1 h-auto">
                          {notification.action}
                        </Button>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="bg-blue-50 border-blue-200" padding="md" animation="scaleIn">
              <div className="text-center">
                <div className="p-2 bg-blue-100 rounded-lg mb-3 inline-block">
                  <Target className="h-5 w-5 text-blue-600" />
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">Primul pas</h4>
                <p className="text-sm text-gray-600 mb-3">
                  Definește vocea brandului pentru a începe să primești notificări personalizate.
                </p>
                <Button 
                  size="sm" 
                  onClick={handleDefineBrandVoice}
                  className="micro-bounce"
                >
                  Începe acum
                </Button>
              </div>
            </Card>
          )}
        </Card>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card 
          hover="scale" 
          className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200"
          animation="scaleIn"
          delay={1}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-blue-700 mb-1">Planuri active</p>
              <p className="text-3xl font-bold text-blue-900">{activePlans}</p>
              <p className="text-xs text-blue-600 mt-1">
                {brandProfile ? '+2 față de luna trecută' : 'Creează primul plan'}
              </p>
            </div>
            <div className="p-3 bg-blue-200 rounded-xl micro-scale">
              <Target className="h-6 w-6 text-blue-700" />
            </div>
          </div>
        </Card>

        <Card 
          hover="scale" 
          className="bg-gradient-to-br from-green-50 to-green-100 border-green-200"
          animation="scaleIn"
          delay={2}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-green-700 mb-1">Conținut generat</p>
              <p className="text-3xl font-bold text-green-900">{brandProfile ? contentGenerated : 0}</p>
              <p className="text-xs text-green-600 mt-1">
                {brandProfile ? 'Luna aceasta' : 'Începe să generezi'}
              </p>
            </div>
            <div className="p-3 bg-green-200 rounded-xl micro-scale">
              <MessageSquare className="h-6 w-6 text-green-700" />
            </div>
          </div>
        </Card>

        <Card 
          hover="scale" 
          className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200"
          animation="scaleIn"
          delay={3}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-purple-700 mb-1">Ciorne</p>
              <p className="text-3xl font-bold text-purple-900">{draftPlans}</p>
              <p className="text-xs text-purple-600 mt-1">
                {brandProfile ? 'Așteaptă finalizare' : 'Salvează ideile'}
              </p>
            </div>
            <div className="p-3 bg-purple-200 rounded-xl micro-scale">
              <Edit3 className="h-6 w-6 text-purple-700" />
            </div>
          </div>
        </Card>

        <Card 
          hover="scale" 
          className="bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200"
          animation="scaleIn"
          delay={4}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-amber-700 mb-1">Următoarea acțiune</p>
              <p className="text-3xl font-bold text-amber-900">{brandProfile ? daysUntilNext : '-'}</p>
              <p className="text-xs text-amber-600 mt-1">
                {brandProfile ? 'Zile rămase' : 'Planifică acțiuni'}
              </p>
            </div>
            <div className="p-3 bg-amber-200 rounded-xl micro-scale">
              <Clock className="h-6 w-6 text-amber-700" />
            </div>
          </div>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Calendar/Timeline */}
        <Card className="lg:col-span-2 shadow-lg" animation="slideInLeft" hover="subtle">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Calendar săptămânal</h2>
            <Button variant="outline" size="sm" className="flex items-center space-x-2 micro-bounce">
              <Calendar className="h-4 w-4" />
              <span>Vezi tot calendarul</span>
            </Button>
          </div>

          {brandProfile ? (
            <>
              <div className="grid grid-cols-7 gap-2">
                {weeklyCalendar.map((day, index) => (
                  <Card 
                    key={day.day}
                    className={`text-center ${day.posts.length > 0 ? 'bg-blue-50 border-blue-200' : 'bg-gray-50'}`}
                    padding="sm"
                    animation="scaleIn"
                    delay={index + 1}
                    hover="subtle"
                  >
                    <div className="text-xs font-semibold text-gray-600 mb-1">{day.day}</div>
                    <div className="text-lg font-bold text-gray-900 mb-2">{day.date}</div>
                    
                    {day.posts.length > 0 ? (
                      <div className="space-y-1">
                        {day.posts.map((post, postIndex) => (
                          <div 
                            key={postIndex}
                            className={`text-xs p-1 rounded border ${getChannelColor(post.channel)} flex items-center justify-center space-x-1`}
                          >
                            {getChannelIcon(post.channel)}
                            <span className="truncate">{post.time}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-xs text-gray-400">Liber</div>
                    )}
                  </Card>
                ))}
              </div>

              <Card className="mt-6 bg-gradient-to-r from-green-50 to-blue-50 border-green-200" animation="fadeInUp" delay={1}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">Următoarea postare</h4>
                      <p className="text-sm text-gray-600">Instagram Story - Mâine la 14:00</p>
                    </div>
                  </div>
                  <Button size="sm" variant="outline" className="micro-bounce">
                    Marchează ca gata
                  </Button>
                </div>
              </Card>
            </>
          ) : (
            <Card className="text-center py-12" animation="bounceIn">
              <div className="p-4 bg-gradient-to-r from-gray-100 to-gray-200 rounded-2xl mb-4 inline-block">
                <Calendar className="h-12 w-12 text-gray-500" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Calendarul tău de conținut</h3>
              <p className="text-gray-600 mb-6 max-w-md mx-auto">
                După ce îți definești vocea brandului, vei putea vedea aici toate postările planificate și să îți organizezi conținutul.
              </p>
              <Button 
                onClick={handleDefineBrandVoice}
                className="flex items-center space-x-2 micro-bounce"
              >
                <Sparkles className="h-4 w-4" />
                <span>Începe configurarea</span>
              </Button>
            </Card>
          )}
        </Card>

        {/* Brand Profile Summary */}
        <Card className="shadow-lg" animation="slideInRight" hover="subtle">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Vocea brandului</h2>
            <div className="flex space-x-2">
              {brandProfile && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleAnalyzeBrandVoice}
                  className="flex items-center space-x-2 micro-bounce"
                >
                  <Brain className="h-4 w-4" />
                  <span>Analizează</span>
                </Button>
              )}
              <Button 
                variant="outline" 
                size="sm" 
                onClick={brandProfile ? handleEditBrandVoice : handleDefineBrandVoice}
                className="flex items-center space-x-2 micro-bounce"
              >
                <Edit3 className="h-4 w-4" />
                <span>{brandProfile ? 'Editează' : 'Configurează'}</span>
              </Button>
            </div>
          </div>
          
          {brandProfile ? (
            <>
              <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-100" animation="scaleIn" delay={1}>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{brandProfile.brand_name}</h3>
                <p className="text-gray-700 mb-4 text-sm leading-relaxed">{brandProfile.brand_description}</p>
                
                <div className="space-y-3">
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-2 text-sm">Personalitate:</h4>
                    <div className="flex flex-wrap gap-1">
                      {brandProfile.personality_traits?.slice(0, 2).map((trait, index) => (
                        <span 
                          key={index} 
                          className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium"
                        >
                          {t(`personalityTraits.${trait}`)}
                        </span>
                      ))}
                      {brandProfile.personality_traits?.length > 2 && (
                        <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs">
                          +{brandProfile.personality_traits.length - 2}
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-2 text-sm">Ton:</h4>
                    <div className="flex flex-wrap gap-1">
                      {brandProfile.communication_tones?.slice(0, 2).map((tone, index) => (
                        <span 
                          key={index} 
                          className="px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-medium"
                        >
                          {t(`toneAttributes.${tone}`)}
                        </span>
                      ))}
                      {brandProfile.communication_tones?.length > 2 && (
                        <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs">
                          +{brandProfile.communication_tones.length - 2}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </Card>

              {/* Subscription Status */}
              <Card className="mt-4 bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200" animation="scaleIn" delay={2}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-amber-100 rounded-lg">
                      <Crown className="h-5 w-5 text-amber-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 text-sm">Plan Gratuit</h4>
                      <p className="text-xs text-gray-600">2/5 planuri folosite</p>
                    </div>
                  </div>
                  <Button size="sm" variant="secondary" className="micro-bounce">
                    Upgrade
                  </Button>
                </div>
              </Card>
            </>
          ) : (
            <Card className="text-center py-8" animation="bounceIn">
              <div className="p-4 bg-gradient-to-r from-blue-100 to-purple-100 rounded-2xl mb-4 inline-block">
                <Target className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Definește vocea brandului</h3>
              <p className="text-gray-600 mb-4 text-sm leading-relaxed">
                Ajută-ne să înțelegem personalitatea și tonul brandului tău pentru a genera conținut personalizat.
              </p>
              <Button 
                onClick={handleDefineBrandVoice}
                className="flex items-center space-x-2 micro-bounce"
              >
                <Sparkles className="h-4 w-4" />
                <span>Începe configurarea</span>
              </Button>
            </Card>
          )}
        </Card>
      </div>

      {/* Marketing Plans and AI Recommendations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Marketing Plans */}
        <Card className="shadow-lg" animation="slideInLeft" hover="subtle">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Planurile tale de marketing</h2>
            {brandProfile && (
              <Button size="sm" className="flex items-center space-x-2 micro-bounce">
                <Plus className="h-4 w-4" />
                <span>Nou</span>
              </Button>
            )}
          </div>

          {!brandProfile ? (
            <Card className="text-center py-8" animation="bounceIn">
              <div className="p-4 bg-gradient-to-r from-gray-100 to-gray-200 rounded-2xl mb-4 inline-block">
                <Calendar className="h-8 w-8 text-gray-500" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Planuri de marketing personalizate</h3>
              <p className="text-gray-600 mb-4 text-sm">
                După configurarea vocii brandului, vei putea crea planuri de marketing adaptate afacerii tale.
              </p>
              <Button 
                onClick={handleDefineBrandVoice}
                className="flex items-center space-x-2 micro-bounce"
              >
                <Sparkles className="h-4 w-4" />
                <span>Configurează brandul</span>
              </Button>
            </Card>
          ) : marketingPlans.length === 0 ? (
            <Card className="text-center py-8" animation="bounceIn" delay={2}>
              <div className="p-4 bg-gradient-to-r from-gray-100 to-gray-200 rounded-2xl mb-4 inline-block">
                <Calendar className="h-8 w-8 text-gray-500" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Nu ai încă planuri</h3>
              <p className="text-gray-600 mb-4 text-sm">Creează primul tău plan de marketing</p>
              <Button className="flex items-center space-x-2 micro-bounce">
                <Sparkles className="h-4 w-4" />
                <span>Creează primul plan</span>
              </Button>
            </Card>
          ) : (
            <div className="space-y-3 max-h-80 overflow-y-auto">
              {marketingPlans.slice(0, 3).map((plan, index) => (
                <Card 
                  key={plan.id} 
                  className="border border-gray-200 group cursor-pointer"
                  hover="subtle"
                  animation="fadeInUp"
                  delay={index + 1}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                        {plan.title}
                      </h3>
                      <p className="text-gray-600 text-sm mt-1 line-clamp-1">
                        {plan.details?.objective || 'Plan de marketing'}
                      </p>
                      
                      <div className="flex items-center space-x-3 mt-2">
                        <span className="text-xs text-gray-500">
                          {new Date(plan.created_at).toLocaleDateString('ro-RO')}
                        </span>
                      </div>
                    </div>
                    
                    <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800 ml-3">
                      Activ
                    </span>
                  </div>
                </Card>
              ))}
              
              {marketingPlans.length > 3 && (
                <Button variant="ghost" className="w-full mt-3 micro-bounce">
                  Vezi toate planurile ({marketingPlans.length})
                </Button>
              )}
            </div>
          )}
        </Card>

        {/* AI Recommendations */}
        <Card className="shadow-lg" animation="slideInRight" hover="subtle">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-r from-purple-100 to-pink-100 rounded-xl">
                <Brain className="h-6 w-6 text-purple-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Recomandări AI</h2>
            </div>
            <Star className="h-5 w-5 text-yellow-500" />
          </div>

          {brandProfile ? (
            <>
              <div className="space-y-4">
                {aiRecommendations.map((recommendation, index) => (
                  <Card 
                    key={index}
                    className="bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200"
                    animation="scaleIn"
                    delay={index + 1}
                    hover="subtle"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900 mb-1">{recommendation.title}</h4>
                        <p className="text-gray-600 text-sm mb-3">{recommendation.description}</p>
                        <Button size="sm" variant="outline" className="micro-bounce">
                          {recommendation.action}
                          <ArrowRight className="h-3 w-3 ml-1" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>

              <Card className="mt-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200" animation="fadeInUp" delay={1}>
                <div className="text-center">
                  <h4 className="font-semibold text-gray-900 mb-2">Vrei mai multe recomandări?</h4>
                  <p className="text-sm text-gray-600 mb-3">Upgrade la Premium pentru analize avansate</p>
                  <Button size="sm" variant="secondary" className="micro-bounce">
                    Explorează Premium
                  </Button>
                </div>
              </Card>
            </>
          ) : (
            <Card className="text-center py-8" animation="bounceIn">
              <div className="p-4 bg-gradient-to-r from-purple-100 to-pink-100 rounded-2xl mb-4 inline-block">
                <Brain className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Recomandări personalizate</h3>
              <p className="text-gray-600 mb-4 text-sm leading-relaxed">
                AI-ul nostru va analiza vocea brandului tău și va oferi recomandări personalizate pentru conținut și strategie.
              </p>
              <Button 
                onClick={handleDefineBrandVoice}
                className="flex items-center space-x-2 micro-bounce"
              >
                <Sparkles className="h-4 w-4" />
                <span>Activează AI</span>
              </Button>
            </Card>
          )}
        </Card>
      </div>

      {/* Quick Actions */}
      <Card 
        className="shadow-lg bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200" 
        animation="fadeInUp"
        hover="subtle"
      >
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Acțiuni rapide</h2>
          <p className="text-gray-600">
            {brandProfile 
              ? 'Accelerează-ți workflow-ul de marketing'
              : 'Acțiuni disponibile după configurarea brandului'
            }
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Button 
            variant="outline" 
            className="flex flex-col items-center justify-center space-y-2 h-20 micro-bounce"
            disabled={!brandProfile}
          >
            <TrendingUp className="h-6 w-6" />
            <span className="text-sm">Analizează performanța</span>
          </Button>
          <Button 
            variant="outline" 
            className="flex flex-col items-center justify-center space-y-2 h-20 micro-bounce"
            disabled={!brandProfile}
          >
            <Users className="h-6 w-6" />
            <span className="text-sm">Definește audiența</span>
          </Button>
          <Button 
            variant="outline" 
            className="flex flex-col items-center justify-center space-y-2 h-20 micro-bounce"
            disabled={!brandProfile}
          >
            <Sparkles className="h-6 w-6" />
            <span className="text-sm">Generează idei</span>
          </Button>
          <Button 
            variant="outline" 
            className="flex flex-col items-center justify-center space-y-2 h-20 micro-bounce"
            onClick={brandProfile ? (brandProfile ? handleAnalyzeBrandVoice : handleEditBrandVoice) : handleDefineBrandVoice}
          >
            {brandProfile ? <Brain className="h-6 w-6" /> : <Settings className="h-6 w-6" />}
            <span className="text-sm">
              {brandProfile ? 'Analizează vocea' : 'Configurează vocea'}
            </span>
          </Button>
        </div>
      </Card>
    </div>
  );
};