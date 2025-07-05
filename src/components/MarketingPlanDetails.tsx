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
  const [activeTab, setActiveTab] = useState<'overview' | 'calendar' | 'content' | 'posts' | 'metrics'>('overview');
  const [isEditing, setIsEditing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPlatform, setSelectedPlatform] = useState<string>('all');
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);

  // Mock data pentru postări sociale - extins pentru o lună întreagă
  const [socialPosts] = useState<SocialPost[]>([
    // Săptămâna 1
    {
      id: '1',
      platform: 'Facebook',
      content: 'Descoperă serviciile noastre de reparații auto de înaltă calitate! 🔧 Echipa noastră de experți este gata să îți aducă mașina la parametrii optimi. #ReparatiiAuto #Calitate #Profesionalism',
      hashtags: ['#ReparatiiAuto', '#Calitate', '#Profesionalism'],
      scheduledDate: '2025-01-06T10:00:00',
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
      scheduledDate: '2025-01-10T16:00:00',
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
      scheduledDate: '2025-01-11T15:30:00',
      type: 'post',
      engagement: { likes: 89, comments: 16, shares: 31 }
    },
    // Săptămâna 2
    {
      id: '7',
      platform: 'Facebook',
      content: 'Clientul nostru și-a recuperat mașina în timp record! 🚗💨 Servicii rapide și eficiente pentru toți clienții noștri. #ServiceRapid #ClientiMultumiti',
      hashtags: ['#ServiceRapid', '#ClientiMultumiti'],
      scheduledDate: '2025-01-13T10:00:00',
      type: 'post',
      engagement: { likes: 52, comments: 8, shares: 12 }
    },
    {
      id: '8',
      platform: 'Instagram',
      content: 'Behind the scenes: Echipa noastră la lucru! 👨‍🔧 Pasiune și dedicare în fiecare detaliu. #TeamWork #Dedication #AutoRepair',
      hashtags: ['#TeamWork', '#Dedication', '#AutoRepair'],
      scheduledDate: '2025-01-15T14:30:00',
      type: 'story',
      engagement: { likes: 95, comments: 15, shares: 8 }
    },
    {
      id: '9',
      platform: 'LinkedIn',
      content: 'Cum tehnologia modernă revoluționează industria auto. Articol despre inovațiile din atelierele de reparații contemporane.',
      hashtags: ['#InovatieAuto', '#Tehnologie', '#Industrie'],
      scheduledDate: '2025-01-16T09:00:00',
      type: 'post',
      engagement: { likes: 78, comments: 25, shares: 18 }
    },
    {
      id: '10',
      platform: 'TikTok',
      content: 'Transformarea unei mașini în 60 de secunde! ⚡ De la problemă la soluție într-un timp record! #QuickFix #Transformation',
      hashtags: ['#QuickFix', '#Transformation'],
      scheduledDate: '2025-01-17T16:00:00',
      type: 'video',
      engagement: { likes: 312, comments: 67, shares: 89 }
    },
    // Săptămâna 3
    {
      id: '11',
      platform: 'Facebook',
      content: 'Ofertă specială pentru luna ianuarie! 🎉 20% reducere la toate serviciile de întreținere preventivă. Programează-te acum!',
      hashtags: ['#OfertaSpeciala', '#Reducere', '#Intretinere'],
      scheduledDate: '2025-01-20T10:00:00',
      type: 'post',
      engagement: { likes: 87, comments: 34, shares: 25 }
    },
    {
      id: '12',
      platform: 'Instagram',
      content: 'Galeria noastră de mașini restaurate cu dragoste și atenție la detalii! 📸 Fiecare proiect este o poveste de succes. #Gallery #Restoration',
      hashtags: ['#Gallery', '#Restoration'],
      scheduledDate: '2025-01-22T14:30:00',
      type: 'post',
      engagement: { likes: 145, comments: 28, shares: 19 }
    },
    {
      id: '13',
      platform: 'LinkedIn',
      content: 'Studiu de caz: Cum am redus timpul de reparație cu 40% prin optimizarea proceselor interne. Eficiență și calitate merg mână în mână.',
      hashtags: ['#StudiuDeCaz', '#Eficienta', '#Optimizare'],
      scheduledDate: '2025-01-23T09:00:00',
      type: 'post',
      engagement: { likes: 92, comments: 31, shares: 27 }
    },
    {
      id: '14',
      platform: 'YouTube',
      content: 'Ghidul complet pentru alegerea uleiului potrivit pentru mașina ta. Tot ce trebuie să știi într-un singur video!',
      hashtags: ['#GhidUlei', '#Intretinere', '#Tutorial'],
      scheduledDate: '2025-01-24T11:00:00',
      type: 'video',
      engagement: { likes: 203, comments: 45, shares: 38 }
    },
    // Săptămâna 4
    {
      id: '15',
      platform: 'Facebook',
      content: 'Testimonial client: "Servicii impecabile și personal foarte profesionist. Recomand cu încredere!" - Maria P. ⭐⭐⭐⭐⭐',
      hashtags: ['#Testimonial', '#ClientMultumit', '#5Stele'],
      scheduledDate: '2025-01-27T10:00:00',
      type: 'post',
      engagement: { likes: 76, comments: 19, shares: 14 }
    },
    {
      id: '16',
      platform: 'Instagram',
      content: 'Pregătim mașinile pentru sezonul rece! ❄️ Servicii complete de winterizare pentru siguranța ta pe drumuri. #WinterReady #Safety',
      hashtags: ['#WinterReady', '#Safety'],
      scheduledDate: '2025-01-29T14:30:00',
      type: 'post',
      engagement: { likes: 118, comments: 22, shares: 16 }
    },
    {
      id: '17',
      platform: 'TikTok',
      content: 'Când mecanicul tău este și magician! 🎩✨ Probleme care par imposibile, soluții care par magice! #MechanicMagic #ProblemSolved',
      hashtags: ['#MechanicMagic', '#ProblemSolved'],
      scheduledDate: '2025-01-31T16:00:00',
      type: 'video',
      engagement: { likes: 287, comments: 52, shares: 73 }
    }
  ]);

  const tabs = [
    { id: 'overview', name: 'Prezentare generală', icon: Target },
    { id: 'calendar', name: 'Calendar conținut', icon: Calendar },
    { id: 'content', name: 'Conținut generat', icon: MessageSquare },
    { id: 'posts', name: 'Postări', icon: Share2 },
    { id: 'metrics', name: 'Metrici & KPI', icon: BarChart3 }
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
    const post = socialPosts.find(p => p.id === postId);
    if (!post) return;

    // Generăm sugestii de imagini bazate pe conținutul postării
    const imagePrompts = [
      `Detaliu macro cu piese auto de calitate pentru ${post.platform}`,
      `Atelier auto curat și organizat cu lighting profesional`,
      `Mecanic profesionist lucrând la o mașină în atelier modern`
    ];

    // Creăm un modal personalizat în loc de alert
    const modalContent = `
      <div style="font-family: Inter, sans-serif; max-width: 500px;">
        <h3 style="margin-bottom: 16px; font-size: 18px; font-weight: 600;">Sugestii de imagini pentru postarea ${postId}:</h3>
        <div style="margin-bottom: 20px;">
          ${imagePrompts.map((prompt, i) => `
            <div style="margin-bottom: 12px; padding: 12px; background: #f8fafc; border-radius: 8px; border-left: 4px solid #3b82f6;">
              <strong>${i + 1}.</strong> ${prompt}
              <button onclick="navigator.clipboard.writeText('${prompt}')" style="margin-left: 8px; padding: 4px 8px; background: #3b82f6; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 12px;">Copiază</button>
            </div>
          `).join('')}
        </div>
        <div style="padding: 12px; background: #eff6ff; border-radius: 8px; border: 1px solid #bfdbfe;">
          <p style="margin: 0; font-size: 14px; color: #1e40af;">
            <strong>💡 Tip:</strong> În versiunea completă, aici ar fi integrate servicii precum Unsplash, Pexels sau DALL-E pentru generarea automată de imagini.
          </p>
        </div>
        <div style="margin-top: 16px; text-align: center;">
          <button onclick="navigator.clipboard.writeText('${imagePrompts.join('\\n')}')" style="padding: 8px 16px; background: #10b981; color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: 500;">Copiază toate sugestiile</button>
        </div>
      </div>
    `;

    // Creăm un div temporar pentru modal
    const modalDiv = document.createElement('div');
    modalDiv.style.cssText = `
      position: fixed; top: 0; left: 0; right: 0; bottom: 0; 
      background: rgba(0,0,0,0.5); display: flex; align-items: center; 
      justify-content: center; z-index: 1000; padding: 20px;
    `;
    
    const contentDiv = document.createElement('div');
    contentDiv.style.cssText = `
      background: white; border-radius: 12px; padding: 24px; 
      max-width: 90vw; max-height: 90vh; overflow-y: auto;
      box-shadow: 0 25px 50px rgba(0,0,0,0.25);
    `;
    contentDiv.innerHTML = modalContent;
    
    // Buton de închidere
    const closeBtn = document.createElement('button');
    closeBtn.innerHTML = '✕';
    closeBtn.style.cssText = `
      position: absolute; top: 12px; right: 12px; 
      background: none; border: none; font-size: 20px; 
      cursor: pointer; color: #6b7280; width: 32px; height: 32px;
      display: flex; align-items: center; justify-content: center;
      border-radius: 6px; hover: background-color: #f3f4f6;
    `;
    closeBtn.onclick = () => document.body.removeChild(modalDiv);
    
    contentDiv.style.position = 'relative';
    contentDiv.appendChild(closeBtn);
    modalDiv.appendChild(contentDiv);
    
    // Închidere la click pe backdrop
    modalDiv.onclick = (e) => {
      if (e.target === modalDiv) document.body.removeChild(modalDiv);
    };
    
    document.body.appendChild(modalDiv);
  };

  const handlePostClick = (postId: string) => {
    setSelectedPostId(postId);
    setActiveTab('posts');
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

  // Funcție pentru a genera calendarul lunar
  const generateMonthCalendar = () => {
    const startDate = new Date(2025, 0, 1); // Ianuarie 2025
    const endDate = new Date(2025, 0, 31);
    const weeks = [];
    let currentWeek = [];
    
    // Adăugăm zilele goale de la începutul săptămânii
    const firstDayOfWeek = startDate.getDay();
    for (let i = 0; i < (firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1); i++) {
      currentWeek.push(null);
    }
    
    // Adăugăm toate zilele din lună
    for (let date = new Date(startDate); date <= endDate; date.setDate(date.getDate() + 1)) {
      currentWeek.push(new Date(date));
      
      if (currentWeek.length === 7) {
        weeks.push(currentWeek);
        currentWeek = [];
      }
    }
    
    // Completăm ultima săptămână dacă e nevoie
    while (currentWeek.length < 7 && currentWeek.length > 0) {
      currentWeek.push(null);
    }
    if (currentWeek.length > 0) {
      weeks.push(currentWeek);
    }
    
    return weeks;
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
             'Acest plan detalizat descrie strategia de marketing digital pentru Invoicer, axată pe creșterea bazei de clienți cu 100 de noi clienți în următoarea lună, utilizând un buget de 5000 și concentrându-se pe proprietarii de firme locale din industria Horeca.'}
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
                {(plan.details.brand_voice_used.personality || ['approachable', 'innovative', 'expert', 'authoritative', 'trustworthy', 'humorous', 'proactive', 'reliable', 'transparent']).map((trait: string, index: number) => (
                  <span key={index} className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm font-medium">
                    {trait}
                  </span>
                ))}
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold text-gray-800 mb-2">Ton:</h4>
              <div className="flex flex-wrap gap-2">
                {(plan.details.brand_voice_used.tone || ['conversational', 'empathetic', 'inspiring', 'professional', 'optimistic', 'playful']).map((tone: string, index: number) => (
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
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                <p className="text-gray-700">
                  <span className="font-semibold">Creșterea numărului de clienți:</span> 100
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                <p className="text-gray-700">
                  <span className="font-semibold">Creșterea numărului de clienți:</span> 100
                </p>
              </div>
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
          
          <div className="space-y-4">
            <div>
              <h4 className="font-semibold text-gray-800 mb-2">Audiența principală:</h4>
              <p className="text-gray-700">Proprietari de firme locale din industria HoReCa (hoteluri, restaurante, cafenele)</p>
            </div>
            
            <div>
              <h4 className="font-semibold text-gray-800 mb-2">Demografia:</h4>
              <p className="text-gray-700">Antreprenori cu vârste între 25-55 ani, cu experiență în business și nevoi de facturare eficientă</p>
            </div>
            
            <div>
              <h4 className="font-semibold text-gray-800 mb-2">Psihografia:</h4>
              <p className="text-gray-700">Persoane orientate spre eficiență, care valorează timpul și caută soluții digitale pentru optimizarea proceselor de business</p>
            </div>
            
            <div>
              <h4 className="font-semibold text-gray-800 mb-2">Puncte de durere:</h4>
              <div className="space-y-1">
                {[
                  'Facturarea manuală consumă mult timp',
                  'Dificultăți în urmărirea plăților',
                  'Lipsa de organizare a documentelor financiare',
                  'Nevoia de conformitate fiscală'
                ].map((point: string, index: number) => (
                  <div key={index} className="flex items-start space-x-2">
                    <div className="w-1.5 h-1.5 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                    <p className="text-gray-700 text-sm">{point}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
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
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            { platform: 'Facebook', strategy: 'Campanii targetate pe demografie, interese și comportament', frequency: '3 postări/săptămână' },
            { platform: 'Instagram', strategy: 'Promovarea vizuală a serviciilor prin imagini și video', frequency: '2 postări/săptămână' },
            { platform: 'LinkedIn', strategy: 'Conținut profesional și educațional pentru B2B', frequency: '1 postare/săptămână' },
            { platform: 'TikTok', strategy: 'Conținut viral și trendy pentru audiența tânără', frequency: '1 postare/săptămână' },
            { platform: 'YouTube', strategy: 'Tutoriale și conținut educațional video', frequency: '1 video/săptămână' },
            { platform: 'Twitter', strategy: 'Actualizări rapide și interacțiune cu comunitatea', frequency: '1 postare/săptămână' }
          ].map((platform, index) => (
            <Card 
              key={index}
              className={`border-l-4 ${getPlatformColor(platform.platform)} bg-opacity-50`}
              padding="md"
              hover="subtle"
            >
              <div className="flex items-center space-x-3 mb-3">
                {getPlatformIcon(platform.platform)}
                <h4 className="font-semibold text-gray-900">{platform.platform}</h4>
              </div>
              
              <div className="space-y-2 text-sm">
                <p className="text-gray-700">{platform.strategy}</p>
                
                <div>
                  <span className="font-medium text-gray-800">Frecvența: </span>
                  <span className="text-gray-600">{platform.frequency}</span>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </Card>
    </div>
  );

  const renderCalendarTab = () => {
    const monthWeeks = generateMonthCalendar();
    const dayNames = ['Lun', 'Mar', 'Mie', 'Joi', 'Vin', 'Sâm', 'Dum'];

    return (
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

          {/* Calendar lunar */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Ianuarie 2025</h3>
            
            {/* Header zile săptămână */}
            <div className="grid grid-cols-7 gap-2 mb-2">
              {dayNames.map(day => (
                <div key={day} className="text-center font-semibold text-gray-600 py-2">
                  {day}
                </div>
              ))}
            </div>
            
            {/* Săptămânile */}
            {monthWeeks.map((week, weekIndex) => (
              <div key={weekIndex} className="grid grid-cols-7 gap-2 mb-2">
                {week.map((date, dayIndex) => {
                  if (!date) {
                    return <div key={dayIndex} className="h-24"></div>;
                  }
                  
                  const dayPosts = socialPosts.filter(post => {
                    const postDate = new Date(post.scheduledDate);
                    return postDate.getDate() === date.getDate() && 
                           postDate.getMonth() === date.getMonth();
                  });

                  return (
                    <div key={dayIndex} className="h-24 border border-gray-200 rounded-lg p-1">
                      <div className="text-sm font-semibold text-gray-900 mb-1">
                        {date.getDate()}
                      </div>
                      <div className="space-y-1">
                        {dayPosts.slice(0, 2).map(post => (
                          <div 
                            key={post.id}
                            className={`text-xs p-1 rounded cursor-pointer ${getPlatformColor(post.platform)}`}
                            onClick={() => handlePostClick(post.id)}
                            title={post.content}
                          >
                            <div className="flex items-center space-x-1">
                              {getPlatformIcon(post.platform)}
                              <span className="truncate">{post.platform}</span>
                            </div>
                          </div>
                        ))}
                        {dayPosts.length > 2 && (
                          <div className="text-xs text-gray-500 text-center">
                            +{dayPosts.length - 2} mai multe
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
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
  };

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
                      <p className="text-sm text-gray-600">{platformPosts.length} postări/lună</p>
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
            className={`shadow-lg hover:shadow-xl transition-shadow duration-200 ${
              selectedPostId === post.id ? 'ring-2 ring-blue-500' : ''
            }`}
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
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => console.log('Vizualizează postarea', post.id)}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => console.log('Editează postarea', post.id)}
                  >
                    <Edit3 className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => console.log('Deschide link extern', post.id)}
                  >
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}

            {/* Acțiuni postare */}
            <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-200">
              <div className="flex space-x-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex items-center space-x-1"
                  onClick={() => console.log('Adaugă imagine pentru', post.id)}
                >
                  <Camera className="h-3 w-3" />
                  <span>Adaugă imagine</span>
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex items-center space-x-1"
                  onClick={() => console.log('Editează text pentru', post.id)}
                >
                  <Type className="h-3 w-3" />
                  <span>Editează text</span>
                </Button>
              </div>
              
              <Button 
                size="sm" 
                className="flex items-center space-x-1"
                onClick={() => console.log('Programează postarea', post.id)}
              >
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

  const renderMetricsTab = () => (
    <div className="space-y-6">
      <Card className="shadow-lg" animation="fadeInUp">
        <div className="flex items-center space-x-3 mb-6">
          <div className="p-2 bg-green-100 rounded-xl">
            <BarChart3 className="h-6 w-6 text-green-600" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">Metrici & KPI</h2>
            <p className="text-gray-600">Indicatori cheie de performanță</p>
          </div>
        </div>

        {/* KPI-uri SMART */}
        {plan.details?.kpis_smart && plan.details.kpis_smart.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {plan.details.kpis_smart.map((kpi: any, index: number) => (
              <Card 
                key={index}
                className="border-l-4 border-green-400 bg-green-50"
                animation="scaleIn"
                delay={index + 1}
              >
                <div className="space-y-3">
                  <h4 className="font-semibold text-gray-900">
                    {kpi.name || kpi.metric || `KPI ${index + 1}`}
                  </h4>
                  
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="font-medium text-gray-800">Țintă: </span>
                      <span className="text-gray-700">{kpi.target_value || kpi.target}</span>
                    </div>
                    
                    {kpi.measurement && (
                      <div>
                        <span className="font-medium text-gray-800">Măsurare: </span>
                        <span className="text-gray-700">{kpi.measurement}</span>
                      </div>
                    )}
                    
                    {kpi.description && (
                      <p className="text-gray-600 text-xs leading-relaxed">
                        {kpi.description}
                      </p>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="border-l-4 border-green-400 bg-green-50" animation="scaleIn">
              <div className="space-y-3">
                <h4 className="font-semibold text-gray-900">Rata de retenție a clienților</h4>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="font-medium text-gray-800">Țintă: </span>
                    <span className="text-gray-700">95%</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-800">Măsurare: </span>
                    <span className="text-gray-700">Lunar</span>
                  </div>
                  <p className="text-gray-600 text-xs leading-relaxed">
                    Procentul de clienți care continuă să folosească serviciile după primul an
                  </p>
                </div>
              </div>
            </Card>

            <Card className="border-l-4 border-blue-400 bg-blue-50" animation="scaleIn" delay={1}>
              <div className="space-y-3">
                <h4 className="font-semibold text-gray-900">Creșterea numărului de lead-uri</h4>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="font-medium text-gray-800">Țintă: </span>
                    <span className="text-gray-700">50 lead-uri calificate pe lună</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-800">Măsurare: </span>
                    <span className="text-gray-700">Săptămânal</span>
                  </div>
                  <p className="text-gray-600 text-xs leading-relaxed">
                    Numărul de potențiali clienți generați prin campaniile de marketing
                  </p>
                </div>
              </div>
            </Card>

            <Card className="border-l-4 border-purple-400 bg-purple-50" animation="scaleIn" delay={2}>
              <div className="space-y-3">
                <h4 className="font-semibold text-gray-900">Engagement rate pe social media</h4>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="font-medium text-gray-800">Țintă: </span>
                    <span className="text-gray-700">5% creștere</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-800">Măsurare: </span>
                    <span className="text-gray-700">Zilnic</span>
                  </div>
                  <p className="text-gray-600 text-xs leading-relaxed">
                    Rata de interacțiune cu conținutul pe platformele sociale
                  </p>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Buget și ROI */}
        <Card className="mt-8 bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200" animation="slideInLeft">
          <div className="flex items-center space-x-3 mb-6">
            <div className="p-2 bg-amber-100 rounded-xl">
              <TrendingUp className="h-6 w-6 text-amber-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900">Buget și ROI</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-amber-600 mb-2">5,000 RON</div>
              <div className="text-sm text-gray-600">Buget total</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600 mb-2">300%</div>
              <div className="text-sm text-gray-600">ROI estimat</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">1 lună</div>
              <div className="text-sm text-gray-600">Perioada</div>
            </div>
          </div>
        </Card>

        {/* Tracking și monitorizare */}
        <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200" animation="slideInRight">
          <div className="flex items-center space-x-3 mb-6">
            <div className="p-2 bg-blue-100 rounded-xl">
              <Eye className="h-6 w-6 text-blue-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900">Tracking și monitorizare</h3>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-white rounded-lg border border-blue-200">
              <div>
                <h4 className="font-semibold text-gray-900">Google Analytics</h4>
                <p className="text-sm text-gray-600">Monitorizarea traficului website</p>
              </div>
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            </div>
            
            <div className="flex items-center justify-between p-4 bg-white rounded-lg border border-blue-200">
              <div>
                <h4 className="font-semibold text-gray-900">Facebook Pixel</h4>
                <p className="text-sm text-gray-600">Tracking conversii social media</p>
              </div>
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            </div>
            
            <div className="flex items-center justify-between p-4 bg-white rounded-lg border border-blue-200">
              <div>
                <h4 className="font-semibold text-gray-900">CRM Integration</h4>
                <p className="text-sm text-gray-600">Urmărirea lead-urilor și conversiilor</p>
              </div>
              <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
            </div>
          </div>
        </Card>
      </Card>
    </div>
  );

  // Scroll la postarea selectată când se schimbă tabul
  useEffect(() => {
    if (activeTab === 'posts' && selectedPostId) {
      setTimeout(() => {
        const element = document.querySelector(`[data-post-id="${selectedPostId}"]`);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 100);
    }
  }, [activeTab, selectedPostId]);

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
        {activeTab === 'metrics' && renderMetricsTab()}
      </div>
    </div>
  );
};