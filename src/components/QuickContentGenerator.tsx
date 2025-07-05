import React, { useState } from 'react';
import { X, Zap, MessageSquare, Calendar, CheckCircle, Copy, Download, Sparkles, Wand2, Clock, Target } from 'lucide-react';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { useAuth } from '../contexts/AuthContext';
import { useUserStats } from '../hooks/useUserStats';
import { useNotifications } from '../contexts/NotificationContext';
import { supabase } from '../lib/supabase';

interface BrandProfile {
  id: string;
  brand_name: string;
  brand_description: string;
  content_example_1: string;
  content_example_2: string | null;
  personality_traits: string[];
  communication_tones: string[];
}

interface GeneratedContent {
  id: string;
  platform: string;
  content: string;
  type: string;
  hashtags?: string[];
}

interface QuickContentGeneratorProps {
  isOpen: boolean;
  onClose: () => void;
  brandProfile: BrandProfile;
}

const platforms = [
  { id: 'facebook', name: 'Facebook', icon: '📘', description: 'Postări pentru Facebook' },
  { id: 'instagram', name: 'Instagram', icon: '📷', description: 'Postări și Stories' },
  { id: 'linkedin', name: 'LinkedIn', icon: '💼', description: 'Conținut profesional' },
  { id: 'twitter', name: 'Twitter', icon: '🐦', description: 'Tweet-uri scurte' },
  { id: 'tiktok', name: 'TikTok', icon: '🎵', description: 'Descrieri video' }
];

const contentTypes = [
  { id: 'promotional', name: 'Promoțional', description: 'Promovează produse/servicii' },
  { id: 'educational', name: 'Educațional', description: 'Împărtășește cunoștințe' },
  { id: 'engagement', name: 'Engagement', description: 'Încurajează interacțiunea' },
  { id: 'inspirational', name: 'Inspirațional', description: 'Motivează audiența' },
  { id: 'behind_scenes', name: 'Behind the scenes', description: 'Arată procesele interne' }
];

export const QuickContentGenerator: React.FC<QuickContentGeneratorProps> = ({
  isOpen,
  onClose,
  brandProfile
}) => {
  const { user } = useAuth();
  const { stats, incrementContentCounter } = useUserStats();
  const { addNotification } = useNotifications();
  
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>(['facebook', 'instagram']);
  const [selectedContentTypes, setSelectedContentTypes] = useState<string[]>(['promotional']);
  const [loading, setLoading] = useState(false);
  const [generatedContent, setGeneratedContent] = useState<GeneratedContent[]>([]);
  const [step, setStep] = useState<'setup' | 'generating' | 'results'>('setup');

  if (!isOpen) return null;

  const handlePlatformToggle = (platformId: string) => {
    setSelectedPlatforms(prev => 
      prev.includes(platformId) 
        ? prev.filter(p => p !== platformId)
        : [...prev, platformId]
    );
  };

  const handleContentTypeToggle = (typeId: string) => {
    setSelectedContentTypes(prev => 
      prev.includes(typeId) 
        ? prev.filter(t => t !== typeId)
        : [...prev, typeId]
    );
  };

  const generateContent = async () => {
    if (!user || selectedPlatforms.length === 0 || selectedContentTypes.length === 0) return;

    // Verifică limitele
    const canGenerate = await checkContentLimits();
    if (!canGenerate) return;

    setLoading(true);
    setStep('generating');
    setGeneratedContent([]);

    try {
      const contentPromises = selectedPlatforms.map(async (platform) => {
        const platformInfo = platforms.find(p => p.id === platform);
        const contentType = selectedContentTypes[0]; // Folosim primul tip selectat
        const typeInfo = contentTypes.find(t => t.id === contentType);

        const prompt = `
Creează o postare ${typeInfo?.name.toLowerCase()} pentru ${platformInfo?.name} pentru brandul "${brandProfile.brand_name}".

INFORMAȚII BRAND:
- Nume: ${brandProfile.brand_name}
- Descriere: ${brandProfile.brand_description}
- Personalitate: ${brandProfile.personality_traits.join(', ')}
- Ton comunicare: ${brandProfile.communication_tones.join(', ')}
- Exemplu stil: ${brandProfile.content_example_1}

CERINȚE PLATFORMĂ:
${platform === 'twitter' ? '- Maxim 280 caractere' : ''}
${platform === 'linkedin' ? '- Ton profesional, conținut de valoare' : ''}
${platform === 'instagram' ? '- Include 3-5 hashtag-uri relevante' : ''}
${platform === 'facebook' ? '- Încurajează interacțiunea (întrebări, call-to-action)' : ''}
${platform === 'tiktok' ? '- Descriere pentru video, energică și trendy' : ''}

TIPUL CONȚINUTULUI: ${typeInfo?.description}

Creează o postare autentică care:
1. Respectă vocea brandului
2. Este optimizată pentru ${platformInfo?.name}
3. Include un call-to-action natural
4. Este ${typeInfo?.name.toLowerCase()}

Răspunde DOAR cu textul postării, fără explicații suplimentare.
`;

        const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-gemini-response`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ prompt }),
        });

        if (!response.ok) throw new Error(`Failed to generate content for ${platform}`);

        const data = await response.json();
        
        // Extrage hashtag-urile pentru Instagram
        let hashtags: string[] = [];
        let cleanContent = data.response;
        
        if (platform === 'instagram') {
          const hashtagRegex = /#[\w\u0100-\u017F]+/g;
          hashtags = (cleanContent.match(hashtagRegex) || []).slice(0, 5);
        }

        return {
          id: `${platform}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          platform: platformInfo?.name || platform,
          content: cleanContent.trim(),
          type: typeInfo?.name || contentType,
          hashtags: hashtags.length > 0 ? hashtags : undefined
        };
      });

      const results = await Promise.all(contentPromises);
      setGeneratedContent(results);
      
      // Incrementează contorul de conținut
      await incrementContentCounter(results.length);
      
      setStep('results');
      
      addNotification({
        type: 'success',
        title: 'Conținut generat cu succes!',
        message: `${results.length} postări au fost generate pentru platformele selectate.`,
        persistent: false,
        autoClose: true,
        duration: 4000
      });

    } catch (error) {
      console.error('Error generating content:', error);
      addNotification({
        type: 'error',
        title: 'Eroare la generarea conținutului',
        message: 'Nu am putut genera conținutul. Te rog încearcă din nou.',
        persistent: true
      });
      setStep('setup');
    } finally {
      setLoading(false);
    }
  };

  const checkContentLimits = async (): Promise<boolean> => {
    if (!stats) return false;

    const isUnlimited = stats.content_limit === -1;
    if (isUnlimited) return true;

    const remainingContent = stats.content_limit - stats.content_this_month;
    const contentToGenerate = selectedPlatforms.length;

    if (remainingContent < contentToGenerate) {
      addNotification({
        type: 'warning',
        title: 'Limită de conținut atinsă',
        message: `Poți genera doar ${remainingContent} conținuturi în această lună. Upgrade pentru mai multe.`,
        persistent: true,
        action: {
          label: 'Upgrade acum',
          onClick: () => window.open('/pricing', '_blank')
        }
      });
      return false;
    }

    return true;
  };

  const copyContent = async (content: string, platform: string) => {
    try {
      await navigator.clipboard.writeText(content);
      addNotification({
        type: 'success',
        title: 'Conținut copiat!',
        message: `Postarea pentru ${platform} a fost copiată în clipboard.`,
        persistent: false,
        autoClose: true,
        duration: 2000
      });
    } catch (error) {
      console.error('Error copying content:', error);
    }
  };

  const exportAllContent = () => {
    const exportText = generatedContent.map(item => 
      `Platform: ${item.platform}
Tip: ${item.type}
${item.hashtags ? `Hashtags: ${item.hashtags.join(' ')}` : ''}

Conținut:
${item.content}

---`
    ).join('\n\n');

    const fullExport = `Conținut generat rapid - ${brandProfile.brand_name}
Generat pe: ${new Date().toLocaleDateString('ro-RO')}

${exportText}

Generat de Univoice`;

    const blob = new Blob([fullExport], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `continut_rapid_${brandProfile.brand_name}_${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    addNotification({
      type: 'success',
      title: 'Conținut exportat!',
      message: 'Toate postările au fost salvate într-un fișier text.',
      persistent: false,
      autoClose: true,
      duration: 3000
    });
  };

  const saveToScheduledPosts = async () => {
    if (!user || generatedContent.length === 0) return;

    try {
      setLoading(true);

      // Creează un plan de marketing simplu pentru conținutul rapid
      const { data: planData, error: planError } = await supabase
        .from('marketing_plans')
        .insert({
          user_id: user.id,
          brand_profile_id: brandProfile.id,
          title: `Conținut rapid - ${new Date().toLocaleDateString('ro-RO')}`,
          details: {
            type: 'quick_content',
            generated_at: new Date().toISOString(),
            platforms: selectedPlatforms,
            content_types: selectedContentTypes,
            brand_voice_used: {
              brand_name: brandProfile.brand_name,
              personality_traits: brandProfile.personality_traits,
              communication_tones: brandProfile.communication_tones,
              timestamp: new Date().toISOString()
            }
          }
        })
        .select()
        .single();

      if (planError) throw planError;

      // Salvează postările ca programate pentru următoarele zile
      const scheduledPosts = generatedContent.map((content, index) => {
        const scheduledDate = new Date();
        scheduledDate.setDate(scheduledDate.getDate() + index + 1); // Programează pentru următoarele zile
        scheduledDate.setHours(10, 0, 0, 0); // La ora 10:00

        return {
          user_id: user.id,
          marketing_plan_id: planData.id,
          platform: content.platform,
          content: content.content,
          scheduled_at: scheduledDate.toISOString(),
          status: 'scheduled'
        };
      });

      const { error: postsError } = await supabase
        .from('scheduled_posts')
        .insert(scheduledPosts);

      if (postsError) throw postsError;

      addNotification({
        type: 'success',
        title: 'Conținut salvat și programat!',
        message: `${generatedContent.length} postări au fost programate pentru următoarele zile.`,
        persistent: true,
        action: {
          label: 'Vezi planurile',
          onClick: () => {
            onClose();
            window.location.href = '/app/plans';
          }
        }
      });

      onClose();

    } catch (error) {
      console.error('Error saving scheduled posts:', error);
      addNotification({
        type: 'error',
        title: 'Eroare la salvare',
        message: 'Nu am putut salva postările programate.',
        persistent: true
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="max-w-4xl w-full max-h-[90vh] overflow-y-auto" padding="lg">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-gradient-to-r from-blue-100 to-purple-100 rounded-2xl">
              <Zap className="h-8 w-8 text-blue-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Generează conținut rapid</h2>
              <p className="text-gray-600">Creează postări personalizate pentru {brandProfile.brand_name}</p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose} className="p-2">
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Progress Indicator */}
        <div className="flex items-center justify-center mb-8">
          <div className="flex items-center space-x-4">
            <div className={`flex items-center space-x-2 ${step === 'setup' ? 'text-blue-600' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step === 'setup' ? 'bg-blue-100' : 'bg-gray-100'}`}>
                <Target className="h-4 w-4" />
              </div>
              <span className="text-sm font-medium">Configurare</span>
            </div>
            <div className="w-8 h-0.5 bg-gray-200"></div>
            <div className={`flex items-center space-x-2 ${step === 'generating' ? 'text-blue-600' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step === 'generating' ? 'bg-blue-100' : 'bg-gray-100'}`}>
                <Wand2 className="h-4 w-4" />
              </div>
              <span className="text-sm font-medium">Generare</span>
            </div>
            <div className="w-8 h-0.5 bg-gray-200"></div>
            <div className={`flex items-center space-x-2 ${step === 'results' ? 'text-blue-600' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step === 'results' ? 'bg-blue-100' : 'bg-gray-100'}`}>
                <CheckCircle className="h-4 w-4" />
              </div>
              <span className="text-sm font-medium">Rezultate</span>
            </div>
          </div>
        </div>

        {/* Setup Step */}
        {step === 'setup' && (
          <div className="space-y-8">
            {/* Platform Selection */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Selectează platformele</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {platforms.map((platform) => (
                  <button
                    key={platform.id}
                    onClick={() => handlePlatformToggle(platform.id)}
                    className={`p-4 rounded-xl border-2 transition-all duration-200 text-left ${
                      selectedPlatforms.includes(platform.id)
                        ? 'border-blue-500 bg-blue-50 shadow-md'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">{platform.icon}</span>
                      <div>
                        <p className="font-semibold text-gray-900">{platform.name}</p>
                        <p className="text-xs text-gray-600">{platform.description}</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Content Type Selection */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Tipul de conținut</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {contentTypes.map((type) => (
                  <button
                    key={type.id}
                    onClick={() => handleContentTypeToggle(type.id)}
                    className={`p-4 rounded-xl border-2 transition-all duration-200 text-left ${
                      selectedContentTypes.includes(type.id)
                        ? 'border-purple-500 bg-purple-50 shadow-md'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <p className="font-semibold text-gray-900">{type.name}</p>
                    <p className="text-sm text-gray-600">{type.description}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Usage Info */}
            {stats && (
              <Card className="bg-blue-50 border-blue-200" padding="md">
                <div className="flex items-center space-x-3">
                  <MessageSquare className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="text-sm font-medium text-blue-900">
                      Utilizare conținut: {stats.content_this_month}/{stats.content_limit === -1 ? '∞' : stats.content_limit}
                    </p>
                    <p className="text-xs text-blue-700">
                      Vei genera {selectedPlatforms.length} postări ({selectedPlatforms.length} din limită)
                    </p>
                  </div>
                </div>
              </Card>
            )}

            {/* Generate Button */}
            <div className="flex justify-end space-x-3">
              <Button variant="outline" onClick={onClose}>
                Anulează
              </Button>
              <Button 
                onClick={generateContent}
                disabled={selectedPlatforms.length === 0 || selectedContentTypes.length === 0}
                className="flex items-center space-x-2"
              >
                <Sparkles className="h-4 w-4" />
                <span>Generează conținut ({selectedPlatforms.length} postări)</span>
              </Button>
            </div>
          </div>
        )}

        {/* Generating Step */}
        {step === 'generating' && (
          <div className="text-center py-12">
            <div className="p-6 bg-gradient-to-r from-blue-100 to-purple-100 rounded-2xl mb-6 inline-block">
              <Wand2 className="h-12 w-12 text-blue-600 animate-pulse" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Generez conținut personalizat...</h3>
            <p className="text-gray-600 mb-6">
              AI-ul creează {selectedPlatforms.length} postări adaptate vocii brandului {brandProfile.brand_name}
            </p>
            <div className="flex justify-center space-x-1">
              <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
              <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            </div>
          </div>
        )}

        {/* Results Step */}
        {step === 'results' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">
                Conținut generat ({generatedContent.length} postări)
              </h3>
              <div className="flex space-x-2">
                <Button variant="outline" size="sm" onClick={exportAllContent}>
                  <Download className="h-4 w-4 mr-2" />
                  Exportă tot
                </Button>
                <Button size="sm" onClick={saveToScheduledPosts} loading={loading}>
                  <Calendar className="h-4 w-4 mr-2" />
                  Salvează și programează
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {generatedContent.map((content, index) => (
                <Card key={content.id} className="border-l-4 border-green-400" padding="md">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <span className="text-2xl">
                          {platforms.find(p => p.name === content.platform)?.icon || '📱'}
                        </span>
                        <div>
                          <h4 className="font-semibold text-gray-900">{content.platform}</h4>
                          <p className="text-sm text-gray-600">{content.type}</p>
                        </div>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => copyContent(content.content, content.platform)}
                        className="p-2"
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-gray-800 whitespace-pre-wrap text-sm leading-relaxed">
                        {content.content}
                      </p>
                    </div>

                    {content.hashtags && (
                      <div className="flex flex-wrap gap-1">
                        {content.hashtags.map((hashtag, idx) => (
                          <span key={idx} className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                            {hashtag}
                          </span>
                        ))}
                      </div>
                    )}

                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>Generat: {new Date().toLocaleTimeString('ro-RO')}</span>
                      <span>Caractere: {content.content.length}</span>
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
              <Button variant="outline" onClick={() => setStep('setup')}>
                Generează din nou
              </Button>
              <Button onClick={onClose}>
                Închide
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};