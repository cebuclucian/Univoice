import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, Edit3, Share2, Download, Calendar, Target, Users, TrendingUp, BarChart3,
  MessageSquare, Instagram, Facebook, Twitter, Linkedin, Mail, Globe, Youtube, 
  Image as ImageIcon, Copy, ExternalLink, Plus, Eye, Heart, Share, Bookmark,
  Zap, Sparkles, Camera, Palette, Type, Layout, Filter, Search, Clock, CheckCircle
} from 'lucide-react';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
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

interface SocialPost {
  id: string;
  platform: string;
  content: string;
  hashtags: string[];
  scheduledDate: string;
  type: 'post' | 'story' | 'reel' | 'video';
  engagement?: {
    likes: number;
    comments: number;
    shares: number;
  };
}

export const MarketingPlanDetails: React.FC<MarketingPlanDetailsProps> = ({
  plan,
  onBack,
  onEdit,
  onPlanUpdated
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'calendar' | 'content' | 'posts'>('overview');
  const [isEditing, setIsEditing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPlatform, setSelectedPlatform] = useState<string>('all');

  // Mock data pentru postări sociale
  const [socialPosts] = useState<SocialPost[]>([
    {
      id: '1',
      platform: 'Facebook',
      content: 'Descoperă serviciile noastre de reparații auto de înaltă calitate! 🔧 Echipa noastră de experți este gata să îți aducă mașina la parametrii optimi. #ReparatiiAuto #Calitate #Profesionalism',
      hashtags: ['#ReparatiiAuto', '#Calitate', '#Profesionalism'],
      scheduledDate: '2025-01-08T10:00:00',
      type: 'post',
      engagement: { likes: 45, comments: 12, shares: 8 }
    },
    {
      id: '2',
      platform: 'Instagram',
      content: 'Transformăm fiecare reparație într-o artă! ✨ Urmărește procesul de restaurare al acestei mașini clasice. #RestaurareAuto #Craftsmanship #Passion',
      hashtags: ['#RestaurareAuto', '#Craftsmanship', '#Passion'],
      scheduledDate: '2025-01-08T14:30:00',
      type: 'reel',
      engagement: { likes: 128, comments: 23, shares: 15 }
    },
    {
      id: '3',
      platform: 'LinkedIn',
      content: 'Investiția în echipamente de ultimă generație ne permite să oferim servicii de reparații auto la cele mai înalte standarde. Află mai multe despre tehnologiile pe care le folosim.',
      hashtags: ['#TechnologieAuto', '#Inovatie', '#Business'],
      scheduledDate: '2025-01-09T09:00:00',
      type: 'post',
      engagement: { likes: 67, comments: 18, shares: 22 }
    },
    {
      id: '4',
      platform: 'TikTok',
      content: 'POV: Când îți aduci mașina la noi și pleci cu zâmbetul pe buze! 😊 #SatisfiedCustomers #AutoRepair #HappyClients',
      hashtags: ['#SatisfiedCustomers', '#AutoRepair', '#HappyClients'],
      scheduledDate: '2025-01-09T16:00:00',
      type: 'video',
      engagement: { likes: 234, comments: 45, shares: 67 }
    },
    {
      id: '5',
      platform: 'YouTube',
      content: 'Tutorial complet: Cum să îți întreții mașina pentru a evita reparațiile costisitoare. Ghid pas cu pas de la experții noștri!',
      hashtags: ['#TutorialAuto', '#Intretinere', '#DIY'],
      scheduledDate: '2025-01-10T11:00:00',
      type: 'video',
      engagement: { likes: 156, comments: 34, shares: 28 }
    },
    {
      id: '6',
      platform: 'Twitter',
      content: 'Știați că o întreținere regulată poate prelungi viața mașinii cu până la 50%? 📈 Programează-te astăzi pentru un check-up complet! #MaintenanceTips #CarCare',
      hashtags: ['#MaintenanceTips', '#CarCare'],
      scheduledDate: '2025-01-10T15:30:00',
      type: 'post',
      engagement: { likes: 89, comments: 16, shares: 31 }
    }
  ]);

  const tabs = [
    { id: 'overview', name: 'Prezentare generală', icon: Target },
    { id: 'calendar', name: 'Calendar conținut', icon: Calendar },
    { id: 'content', name: 'Conținut generat', icon: MessageSquare },
    { id: 'posts', name: 'Postări', icon: Share2 }
  ];

  const platforms = [
    { id: 'all', name: 'Toate', icon: Globe, color: 'gray' },
    { id: 'Facebook', name: 'Facebook', icon: Facebook, color: 'blue' },
    { id: 'Instagram', name: 'Instagram', icon: Instagram, color: 'pink' },
    { id: 'LinkedIn', name: 'LinkedIn', icon: Linkedin, color: 'indigo' },
    { id: 'TikTok', name: 'TikTok', icon: MessageSquare, color: 'black' },
    { id: 'YouTube', name: 'YouTube', icon: Youtube, color: 'red' },
    { id: 'Twitter', name: 'Twitter', icon: Twitter, color: 'sky' }
  ];

  const getPlatformIcon = (platform: string) => {
    const platformData = platforms.find(p => p.id === platform);
    if (!platformData) return <Globe className="h-4 w-4" />;
    const Icon = platformData.icon;
    return <Icon className="h-4 w-4" />;
  };

  const getPlatformColor = (platform: string) => {
    const colors: { [key: string]: string } = {
      'Facebook': 'bg-blue-100 text-blue-700 border-blue-200',
      'Instagram': 'bg-pink-100 text-pink-700 border-pink-200',
      'LinkedIn': 'bg-indigo-100 text-indigo-700 border-indigo-200',
      'TikTok': 'bg-gray-100 text-gray-700 border-gray-200',
      'YouTube': 'bg-red-100 text-red-700 border-red-200',
      'Twitter': 'bg-sky-100 text-sky-700 border-sky-200',
      'Email': 'bg-green-100 text-green-700 border-green-200'
    };
    return colors[platform] || 'bg-gray-100 text-gray-700 border-gray-200';
  };

  const handleSuggestImages = async (postId: string) => {
    // Simulăm generarea de sugestii de imagini
    const imagePrompts = [
      'Mecanic profesionist lucrând la o mașină în atelier modern',
      'Echipamente auto de ultimă generație în atelier',
      'Client mulțumit ridicând mașina reparată',
      'Detaliu macro cu piese auto de calitate',
      'Atelier auto curat și organizat cu lighting profesional'
    ];

    const randomPrompts = imagePrompts.sort(() => 0.5 - Math.random()).slice(0, 3);
    
    alert(`Sugestii de imagini pentru postarea ${postId}:\n\n${randomPrompts.map((prompt, i) => `${i + 1}. ${prompt}`).join('\n')}\n\nÎn versiunea completă, aici ar fi integrate servicii precum Unsplash, Pexels sau DALL-E pentru generarea automată de imagini.`);
  };

  const filteredPosts = socialPosts.filter(post => {
    const matchesSearch = post.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         post.hashtags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesPlatform = selectedPlatform === 'all' || post.platform === selectedPlatform;
    return matchesSearch && matchesPlatform;
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ro-RO', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
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

  const renderOverviewTab = () => (
    <div className="space-y-8">
      {/* Rezumat executiv */}
      <Card className="shadow-lg" animation="fadeInUp">
        <div className="flex items-center space-x-3 mb-6">
          <div className="p-2 bg-blue-100 rounded-xl">
            <Target className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">Rezumat executiv</h2>
            <p className="text-gray-600">Obiective și strategie</p>
          </div>
        </div>
        
        <div className="prose max-w-none">
          <p className="text-gray-700 leading-relaxed">
            {plan.details?.summary || plan.details?.objective || 
             'Acest plan detalizat se concentrează pe retenția clienților existenți ai Invoicer, utilizând un buget de 5000 de euro pe o perioadă de o lună. Strategia se bazează pe conținut captivant, orientat pe nevoile specifice ale clienților din HoReCa, ateliere de reparații, saloane de înfrumusețare și ateliere de producție, folosind platformele Facebook, Instagram, Email Marketing, TikTok, YouTube, LinkedIn, Twitter/X și website-ul/blogul Invoicer.'}
          </p>
        </div>
      </Card>

      {/* Vocea brandului folosită */}
      {plan.details?.brand_voice_used && (
        <Card className="bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200" animation="slideInLeft">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-2 bg-purple-100 rounded-xl">
              <Sparkles className="h-6 w-6 text-purple-600" />
            </div>
            <h3 className="text-lg font-bold text-gray-900">Vocea brandului folosită</h3>
          </div>
          
          <div className="space-y-3">
            <div>
              <h4 className="font-semibold text-gray-800 mb-2">Personalitate:</h4>
              <div className="flex flex-wrap gap-2">
                {plan.details.brand_voice_used.personality?.map((trait: string, index: number) => (
                  <span key={index} className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm font-medium">
                    {trait}
                  </span>
                ))}
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold text-gray-800 mb-2">Ton:</h4>
              <div className="flex flex-wrap gap-2">
                {plan.details.brand_voice_used.tone?.map((tone: string, index: number) => (
                  <span key={index} className="px-3 py-1 bg-pink-100 text-pink-800 rounded-full text-sm font-medium">
                    {tone}
                  </span>
                ))}
              </div>
            </div>
            
            <div className="pt-3 border-t border-purple-200">
              <p className="text-sm text-gray-600">
                Generat pe: {new Date(plan.details.brand_voice_used.timestamp || plan.created_at).toLocaleDateString('ro-RO')}
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Obiective și Audiența țintă */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="shadow-lg" animation="slideInLeft" hover="subtle">
          <div className="flex items-center space-x-3 mb-6">
            <div className="p-2 bg-green-100 rounded-xl">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900">Obiective</h3>
          </div>
          
          {plan.details?.objectives && plan.details.objectives.length > 0 ? (
            <div className="space-y-3">
              {plan.details.objectives.map((objective: string, index: number) => (
                <div key={index} className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                  <p className="text-gray-700">{objective}</p>
                </div>
              ))}
            </div>
          ) : plan.details?.kpis_smart && plan.details.kpis_smart.length > 0 ? (
            <div className="space-y-3">
              {plan.details.kpis_smart.slice(0, 3).map((kpi: any, index: number) => (
                <div key={index} className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                  <p className="text-gray-700">
                    <span className="font-semibold">{kpi.name || kpi.metric}:</span> {kpi.target_value || kpi.target}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="p-4 bg-gray-100 rounded-2xl mb-4 inline-block">
                <Target className="h-8 w-8 text-gray-500" />
              </div>
              <h4 className="text-lg font-semibold text-gray-900 mb-2">Obiective în dezvoltare</h4>
              <p className="text-gray-600 text-sm">
                Obiectivele specifice vor fi definite în funcție de nevoile brandului și strategia de marketing.
              </p>
            </div>
          )}
        </Card>

        <Card className="shadow-lg" animation="slideInRight" hover="subtle">
          <div className="flex items-center space-x-3 mb-6">
            <div className="p-2 bg-blue-100 rounded-xl">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900">Audiența țintă</h3>
          </div>
          
          {plan.details?.target_audience ? (
            <div className="space-y-4">
              {plan.details.target_audience.primary && (
                <div>
                  <h4 className="font-semibold text-gray-800 mb-2">Audiența principală:</h4>
                  <p className="text-gray-700">{plan.details.target_audience.primary}</p>
                </div>
              )}
              
              {plan.details.target_audience.demographics && (
                <div>
                  <h4 className="font-semibold text-gray-800 mb-2">Demografia:</h4>
                  <p className="text-gray-700">{plan.details.target_audience.demographics}</p>
                </div>
              )}
              
              {plan.details.target_audience.psychographics && (
                <div>
                  <h4 className="font-semibold text-gray-800 mb-2">Psihografia:</h4>
                  <p className="text-gray-700">{plan.details.target_audience.psychographics}</p>
                </div>
              )}
              
              {plan.details.target_audience.pain_points && plan.details.target_audience.pain_points.length > 0 && (
                <div>
                  <h4 className="font-semibold text-gray-800 mb-2">Puncte de durere:</h4>
                  <div className="space-y-1">
                    {plan.details.target_audience.pain_points.map((point: string, index: number) => (
                      <div key={index} className="flex items-start space-x-2">
                        <div className="w-1.5 h-1.5 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                        <p className="text-gray-700 text-sm">{point}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="p-4 bg-gray-100 rounded-2xl mb-4 inline-block">
                <Users className="h-8 w-8 text-gray-500" />
              </div>
              <h4 className="text-lg font-semibold text-gray-900 mb-2">Audiența în analiză</h4>
              <p className="text-gray-600 text-sm">
                Profilul audiența țintă va fi dezvoltat pe baza analizei de piață și a obiectivelor de business.
              </p>
            </div>
          )}
        </Card>
      </div>

      {/* Platforme și strategii */}
      <Card className="shadow-lg" animation="fadeInUp" delay={1}>
        <div className="flex items-center space-x-3 mb-6">
          <div className="p-2 bg-purple-100 rounded-xl">
            <Zap className="h-6 w-6 text-purple-600" />
          </div>
          <h3 className="text-xl font-bold text-gray-900">Platforme și strategii</h3>
        </div>
        
        {plan.details?.tactical_plan_per_platform || plan.details?.platforms ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {(plan.details.tactical_plan_per_platform || plan.details.platforms || []).map((platform: any, index: number) => (
              <Card 
                key={index}
                className={`border-l-4 ${getPlatformColor(platform.platform || platform.name)} bg-opacity-50`}
                padding="md"
                hover="subtle"
              >
                <div className="flex items-center space-x-3 mb-3">
                  {getPlatformIcon(platform.platform || platform.name)}
                  <h4 className="font-semibold text-gray-900">{platform.platform || platform.name}</h4>
                </div>
                
                <div className="space-y-2 text-sm">
                  {platform.strategy && (
                    <p className="text-gray-700">{platform.strategy}</p>
                  )}
                  
                  {platform.posting_frequency && (
                    <div>
                      <span className="font-medium text-gray-800">Frecvența: </span>
                      <span className="text-gray-600">{platform.posting_frequency}</span>
                    </div>
                  )}
                  
                  {platform.content_types && (
                    <div>
                      <span className="font-medium text-gray-800">Tipuri conținut: </span>
                      <span className="text-gray-600">
                        {Array.isArray(platform.content_types) 
                          ? platform.content_types.join(', ')
                          : platform.content_types
                        }
                      </span>
                    </div>
                  )}
                  
                  {platform.kpis && platform.kpis.length > 0 && (
                    <div>
                      <span className="font-medium text-gray-800">KPI-uri: </span>
                      <span className="text-gray-600">{platform.kpis.slice(0, 2).join(', ')}</span>
                    </div>
                  )}
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="p-4 bg-gray-100 rounded-2xl mb-4 inline-block">
              <Globe className="h-8 w-8 text-gray-500" />
            </div>
            <h4 className="text-lg font-semibold text-gray-900 mb-2">Strategii în dezvoltare</h4>
            <p className="text-gray-600">
              Strategiile pentru fiecare platformă vor fi personalizate în funcție de audiența și obiectivele specifice.
            </p>
          </div>
        )}
      </Card>
    </div>
  );

  const renderCalendarTab = () => (
    <div className="space-y-6">
      <Card className="shadow-lg" animation="fadeInUp">
        <div className="flex items-center space-x-3 mb-6">
          <div className="p-2 bg-green-100 rounded-xl">
            <Calendar className="h-6 w-6 text-green-600" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">Calendar de conținut</h2>
            <p className="text-gray-600">Planificarea postărilor pe săptămâni</p>
          </div>
        </div>

        {/* Calendar săptămânal */}
        <div className="grid grid-cols-7 gap-4 mb-6">
          {['Luni', 'Marți', 'Miercuri', 'Joi', 'Vineri', 'Sâmbătă', 'Duminică'].map((day, index) => (
            <div key={day} className="text-center">
              <h3 className="font-semibold text-gray-900 mb-3">{day}</h3>
              <div className="space-y-2">
                {socialPosts
                  .filter(post => new Date(post.scheduledDate).getDay() === (index + 1) % 7)
                  .map(post => (
                    <Card 
                      key={post.id}
                      className={`text-xs p-2 ${getPlatformColor(post.platform)}`}
                      hover="subtle"
                    >
                      <div className="flex items-center space-x-1 mb-1">
                        {getPlatformIcon(post.platform)}
                        <span className="font-medium">{post.platform}</span>
                      </div>
                      <p className="text-xs line-clamp-2">{post.content.substring(0, 50)}...</p>
                      <p className="text-xs mt-1 opacity-75">
                        {formatDate(post.scheduledDate)}
                      </p>
                    </Card>
                  ))
                }
              </div>
            </div>
          ))}
        </div>

        {/* Statistici calendar */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-6 border-t border-gray-200">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{socialPosts.length}</div>
            <div className="text-sm text-gray-600">Total postări</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {new Set(socialPosts.map(p => p.platform)).size}
            </div>
            <div className="text-sm text-gray-600">Platforme active</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">
              {Math.round(socialPosts.length / 7 * 10) / 10}
            </div>
            <div className="text-sm text-gray-600">Postări/zi</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">85%</div>
            <div className="text-sm text-gray-600">Acoperire săptămână</div>
          </div>
        </div>
      </Card>
    </div>
  );

  const renderContentTab = () => (
    <div className="space-y-6">
      <Card className="shadow-lg" animation="fadeInUp">
        <div className="flex items-center space-x-3 mb-6">
          <div className="p-2 bg-pink-100 rounded-xl">
            <MessageSquare className="h-6 w-6 text-pink-600" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">Conținut generat</h2>
            <p className="text-gray-600">Postări și materiale create cu AI</p>
          </div>
        </div>

        {/* Platforme cu conținut */}
        <div className="space-y-6">
          {platforms.slice(1).map((platform, index) => {
            const platformPosts = socialPosts.filter(post => post.platform === platform.id);
            if (platformPosts.length === 0) return null;

            return (
              <Card 
                key={platform.id}
                className={`border-l-4 ${getPlatformColor(platform.id)}`}
                animation="slideInLeft"
                delay={index + 1}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    {getPlatformIcon(platform.id)}
                    <div>
                      <h3 className="font-semibold text-gray-900">{platform.name}</h3>
                      <p className="text-sm text-gray-600">{platformPosts.length} postări/săptămână</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" className="flex items-center space-x-2">
                    <Copy className="h-4 w-4" />
                    <span>Copiază strategia</span>
                  </Button>
                </div>

                <div className="mb-4">
                  <h4 className="font-semibold text-gray-800 mb-2">Strategie:</h4>
                  <p className="text-gray-700 text-sm">
                    {platform.id === 'Facebook' && 'Campanii targetate pe demografie, interese și comportament'}
                    {platform.id === 'Instagram' && 'Promovarea vizuală a serviciilor prin imagini și video'}
                    {platform.id === 'LinkedIn' && 'Conținut profesional și educațional pentru B2B'}
                    {platform.id === 'TikTok' && 'Conținut viral și trendy pentru audiența tânără'}
                    {platform.id === 'YouTube' && 'Tutoriale și conținut educațional video'}
                    {platform.id === 'Twitter' && 'Actualizări rapide și interacțiune cu comunitatea'}
                  </p>
                </div>

                <div className="space-y-3">
                  {platformPosts.slice(0, 2).map(post => (
                    <Card key={post.id} className="bg-gray-50" padding="sm">
                      <p className="text-sm text-gray-700 mb-2">{post.content}</p>
                      <div className="flex items-center justify-between">
                        <div className="flex flex-wrap gap-1">
                          {post.hashtags.slice(0, 3).map(tag => (
                            <span key={tag} className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                              {tag}
                            </span>
                          ))}
                        </div>
                        <span className="text-xs text-gray-500">{formatDate(post.scheduledDate)}</span>
                      </div>
                    </Card>
                  ))}
                </div>
              </Card>
            );
          })}
        </div>
      </Card>
    </div>
  );

  const renderPostsTab = () => (
    <div className="space-y-6">
      {/* Header și filtre */}
      <Card className="shadow-lg" animation="fadeInUp">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Postări sociale</h2>
            <p className="text-gray-600">Gestionează și monitorizează toate postările</p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Caută postări..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-64"
              />
            </div>
            
            <select
              value={selectedPlatform}
              onChange={(e) => setSelectedPlatform(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {platforms.map(platform => (
                <option key={platform.id} value={platform.id}>
                  {platform.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </Card>

      {/* Lista postărilor */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredPosts.map((post, index) => (
          <Card 
            key={post.id}
            className="shadow-lg hover:shadow-xl transition-shadow duration-200"
            animation="scaleIn"
            delay={index + 1}
          >
            {/* Header postare */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className={`p-2 rounded-lg ${getPlatformColor(post.platform)}`}>
                  {getPlatformIcon(post.platform)}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{post.platform}</h3>
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <Clock className="h-3 w-3" />
                    <span>{formatDate(post.scheduledDate)}</span>
                    <span className={`px-2 py-0.5 rounded-full text-xs ${
                      post.type === 'video' ? 'bg-red-100 text-red-700' :
                      post.type === 'reel' ? 'bg-purple-100 text-purple-700' :
                      post.type === 'story' ? 'bg-orange-100 text-orange-700' :
                      'bg-blue-100 text-blue-700'
                    }`}>
                      {post.type}
                    </span>
                  </div>
                </div>
              </div>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleSuggestImages(post.id)}
                className="flex items-center space-x-2 micro-bounce"
              >
                <ImageIcon className="h-4 w-4" />
                <span>Sugerează Imagini</span>
              </Button>
            </div>

            {/* Conținutul postării */}
            <div className="mb-4">
              <p className="text-gray-700 leading-relaxed mb-3">{post.content}</p>
              
              {/* Hashtag-uri */}
              <div className="flex flex-wrap gap-1">
                {post.hashtags.map(tag => (
                  <span 
                    key={tag}
                    className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Metrici de engagement */}
            {post.engagement && (
              <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                <div className="flex items-center space-x-4 text-sm text-gray-600">
                  <div className="flex items-center space-x-1">
                    <Heart className="h-4 w-4 text-red-500" />
                    <span>{post.engagement.likes}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <MessageSquare className="h-4 w-4 text-blue-500" />
                    <span>{post.engagement.comments}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Share className="h-4 w-4 text-green-500" />
                    <span>{post.engagement.shares}</span>
                  </div>
                </div>
                
                <div className="flex space-x-2">
                  <Button variant="ghost" size="sm">
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Edit3 className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}

            {/* Acțiuni postare */}
            <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-200">
              <div className="flex space-x-2">
                <Button variant="outline" size="sm" className="flex items-center space-x-1">
                  <Camera className="h-3 w-3" />
                  <span>Adaugă imagine</span>
                </Button>
                <Button variant="outline" size="sm" className="flex items-center space-x-1">
                  <Type className="h-3 w-3" />
                  <span>Editează text</span>
                </Button>
              </div>
              
              <Button size="sm" className="flex items-center space-x-1">
                <CheckCircle className="h-3 w-3" />
                <span>Programează</span>
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {/* Statistici generale */}
      <Card className="shadow-lg bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200" animation="fadeInUp">
        <div className="text-center mb-6">
          <h3 className="text-lg font-bold text-gray-900 mb-2">Statistici generale postări</h3>
          <p className="text-gray-600">Performanța conținutului pe toate platformele</p>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600 mb-1">
              {socialPosts.reduce((sum, post) => sum + (post.engagement?.likes || 0), 0)}
            </div>
            <div className="text-sm text-gray-600">Total Like-uri</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-green-600 mb-1">
              {socialPosts.reduce((sum, post) => sum + (post.engagement?.comments || 0), 0)}
            </div>
            <div className="text-sm text-gray-600">Total Comentarii</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-purple-600 mb-1">
              {socialPosts.reduce((sum, post) => sum + (post.engagement?.shares || 0), 0)}
            </div>
            <div className="text-sm text-gray-600">Total Share-uri</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-orange-600 mb-1">
              {Math.round(socialPosts.reduce((sum, post) => 
                sum + (post.engagement?.likes || 0) + (post.engagement?.comments || 0) + (post.engagement?.shares || 0), 0
              ) / socialPosts.length)}
            </div>
            <div className="text-sm text-gray-600">Engagement mediu</div>
          </div>
        </div>
      </Card>
    </div>
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200" animation="fadeInUp">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
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
          
          <div className="flex space-x-3">
            <Button variant="outline" className="flex items-center space-x-2">
              <Share2 className="h-4 w-4" />
              <span>Partajează</span>
            </Button>
            <Button variant="outline" className="flex items-center space-x-2">
              <Download className="h-4 w-4" />
              <span>Export</span>
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

      {/* Tabs Navigation */}
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
      <div className="animate-fade-in-up">
        {activeTab === 'overview' && renderOverviewTab()}
        {activeTab === 'calendar' && renderCalendarTab()}
        {activeTab === 'content' && renderContentTab()}
        {activeTab === 'posts' && renderPostsTab()}
      </div>
    </div>
  );
};