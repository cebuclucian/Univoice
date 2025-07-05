import React, { useState } from 'react';
import { X, Target, Wand2, CheckCircle, AlertCircle, Sparkles, Calendar, Users, TrendingUp } from 'lucide-react';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Textarea } from './ui/Textarea';
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

interface MarketingPlanGeneratorProps {
  isOpen: boolean;
  onClose: () => void;
  onPlanGenerated: () => void;
  brandProfile: BrandProfile;
}

interface PlanFormData {
  title: string;
  objective: string;
  targetAudience: string;
  budget: string;
  duration: string;
  platforms: string[];
  contentTypes: string[];
  specialFocus: string;
}

const availablePlatforms = [
  { id: 'facebook', name: 'Facebook', description: 'Postări și reclame Facebook' },
  { id: 'instagram', name: 'Instagram', description: 'Postări, Stories și Reels' },
  { id: 'linkedin', name: 'LinkedIn', description: 'Conținut profesional' },
  { id: 'twitter', name: 'Twitter', description: 'Tweet-uri și thread-uri' },
  { id: 'tiktok', name: 'TikTok', description: 'Video-uri scurte' },
  { id: 'youtube', name: 'YouTube', description: 'Video content' },
  { id: 'email', name: 'Email Marketing', description: 'Newsletter și campanii' },
  { id: 'website', name: 'Website/Blog', description: 'Articole și conținut web' }
];

const contentTypes = [
  { id: 'educational', name: 'Educațional', description: 'Conținut informativ' },
  { id: 'promotional', name: 'Promoțional', description: 'Promovează produse/servicii' },
  { id: 'entertainment', name: 'Divertisment', description: 'Conținut amuzant' },
  { id: 'inspirational', name: 'Inspirațional', description: 'Motivează audiența' },
  { id: 'behind_scenes', name: 'Behind the scenes', description: 'Arată procesele' },
  { id: 'user_generated', name: 'User Generated', description: 'Conținut de la utilizatori' }
];

export const MarketingPlanGenerator: React.FC<MarketingPlanGeneratorProps> = ({
  isOpen,
  onClose,
  onPlanGenerated,
  brandProfile
}) => {
  const { user } = useAuth();
  const { stats, incrementPlansCounter } = useUserStats();
  const { addNotification } = useNotifications();
  
  const [step, setStep] = useState<'form' | 'generating' | 'success'>('form');
  const [loading, setLoading] = useState(false);
  const [generatedPlan, setGeneratedPlan] = useState<any>(null);
  const [formData, setFormData] = useState<PlanFormData>({
    title: '',
    objective: '',
    targetAudience: '',
    budget: '',
    duration: '30',
    platforms: ['facebook', 'instagram'],
    contentTypes: ['educational', 'promotional'],
    specialFocus: ''
  });

  if (!isOpen) return null;

  const handlePlatformToggle = (platformId: string) => {
    setFormData(prev => ({
      ...prev,
      platforms: prev.platforms.includes(platformId)
        ? prev.platforms.filter(p => p !== platformId)
        : [...prev.platforms, platformId]
    }));
  };

  const handleContentTypeToggle = (typeId: string) => {
    setFormData(prev => ({
      ...prev,
      contentTypes: prev.contentTypes.includes(typeId)
        ? prev.contentTypes.filter(t => t !== typeId)
        : [...prev.contentTypes, typeId]
    }));
  };

  const checkPlanLimits = async (): Promise<boolean> => {
    if (!stats) return false;

    const isUnlimited = stats.plan_limit === -1;
    if (isUnlimited) return true;

    const remainingPlans = stats.plan_limit - stats.plans_this_month;

    if (remainingPlans < 1) {
      addNotification({
        type: 'warning',
        title: 'Limită de planuri atinsă',
        message: `Ai atins limita de ${stats.plan_limit} planuri pentru această lună. Upgrade pentru mai multe.`,
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

  const generatePlan = async () => {
    if (!user) return;

    // Verifică limitele
    const canGenerate = await checkPlanLimits();
    if (!canGenerate) return;

    setLoading(true);
    setStep('generating');

    try {
      const selectedPlatformNames = formData.platforms.map(id => 
        availablePlatforms.find(p => p.id === id)?.name || id
      );

      const selectedContentTypeNames = formData.contentTypes.map(id => 
        contentTypes.find(t => t.id === id)?.name || id
      );

      const prompt = `
Creează un plan de marketing digital complet și detaliat pentru brandul "${brandProfile.brand_name}".

INFORMAȚII BRAND:
- Nume: ${brandProfile.brand_name}
- Descriere: ${brandProfile.brand_description}
- Personalitate: ${brandProfile.personality_traits.join(', ')}
- Ton comunicare: ${brandProfile.communication_tones.join(', ')}
- Exemplu stil: ${brandProfile.content_example_1}

CERINȚE PLAN:
- Titlu: ${formData.title}
- Obiectiv principal: ${formData.objective}
- Audiența țintă: ${formData.targetAudience}
- Buget: ${formData.budget}
- Durata: ${formData.duration} zile
- Platforme: ${selectedPlatformNames.join(', ')}
- Tipuri conținut: ${selectedContentTypeNames.join(', ')}
${formData.specialFocus ? `- Focus special: ${formData.specialFocus}` : ''}

Te rog să creezi un plan de marketing digital complet cu următoarea structură JSON:

{
  "plan_type": "digital_marketing_complete",
  "title": "${formData.title}",
  "summary": "Rezumat executiv al planului (2-3 propoziții)",
  "objectives": [
    "Obiectiv SMART 1",
    "Obiectiv SMART 2",
    "Obiectiv SMART 3"
  ],
  "target_audience": {
    "primary": "Descrierea audiența principale",
    "demographics": "Vârsta, genul, locația, venitul",
    "psychographics": "Interese, valori, comportamente",
    "pain_points": ["Problemă 1", "Problemă 2", "Problemă 3"]
  },
  "strategy": {
    "positioning": "Cum se poziționează brandul",
    "key_messages": ["Mesaj cheie 1", "Mesaj cheie 2", "Mesaj cheie 3"],
    "content_pillars": ["Pilon 1", "Pilon 2", "Pilon 3"]
  },
  "tactical_plan_per_platform": [
    {
      "platform": "Facebook",
      "strategy": "Strategia specifică pentru Facebook",
      "content_types": ["Tip conținut 1", "Tip conținut 2"],
      "posting_frequency": "X postări pe săptămână",
      "kpis": ["KPI 1", "KPI 2"]
    }
  ],
  "content_calendar": [
    {
      "week": 1,
      "theme": "Tema săptămânii",
      "posts": [
        {
          "platform": "Facebook",
          "type": "Educational",
          "content": "Textul complet al postării",
          "day": "Luni"
        }
      ]
    }
  ],
  "kpis_smart": [
    {
      "name": "Numele KPI-ului",
      "metric": "Ce se măsoară",
      "target_value": "Valoarea țintă",
      "timeframe": "Perioada de măsurare",
      "measurement": "Cum se măsoară"
    }
  ],
  "budget_allocation_summary": {
    "organic_content": "X%",
    "paid_advertising": "X%",
    "tools_software": "X%",
    "content_creation": "X%"
  },
  "brand_voice_used": {
    "brand_name": "${brandProfile.brand_name}",
    "personality_traits": ${JSON.stringify(brandProfile.personality_traits)},
    "communication_tones": ${JSON.stringify(brandProfile.communication_tones)},
    "timestamp": "${new Date().toISOString()}"
  }
}

IMPORTANT: Răspunde DOAR cu JSON-ul valid, fără text suplimentar. Asigură-te că toate platformele selectate (${selectedPlatformNames.join(', ')}) sunt incluse în tactical_plan_per_platform și că planul este adaptat vocii brandului "${brandProfile.brand_name}".
`;

      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-gemini-response`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt }),
      });

      if (!response.ok) throw new Error('Failed to generate marketing plan');

      const data = await response.json();
      
      // Parse the JSON response from AI
      let planData;
      try {
        // Try to extract JSON from the response
        const jsonMatch = data.response.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          planData = JSON.parse(jsonMatch[0]);
        } else {
          throw new Error('No JSON found in response');
        }
      } catch (parseError) {
        console.error('Failed to parse AI response:', parseError);
        // Fallback plan structure
        planData = {
          plan_type: "digital_marketing_complete",
          title: formData.title,
          summary: `Plan de marketing digital pentru ${brandProfile.brand_name} cu focus pe ${formData.objective}`,
          objectives: [
            `Creșterea awareness-ului brandului ${brandProfile.brand_name}`,
            `Generarea de leads calificați prin ${selectedPlatformNames.join(' și ')}`,
            `Îmbunătățirea engagement-ului cu audiența țintă`
          ],
          target_audience: {
            primary: formData.targetAudience,
            demographics: "Adulți 25-45 ani, urban, venit mediu-ridicat",
            psychographics: "Interesați de calitate și inovație",
            pain_points: ["Lipsa timpului", "Nevoia de soluții rapide", "Dorința de calitate"]
          },
          strategy: {
            positioning: `${brandProfile.brand_name} ca lider în domeniu`,
            key_messages: ["Calitate superioară", "Servicii personalizate", "Rezultate garantate"],
            content_pillars: ["Educație", "Inspirație", "Comunitate"]
          },
          tactical_plan_per_platform: selectedPlatformNames.map(platform => ({
            platform,
            strategy: `Strategia optimizată pentru ${platform}`,
            content_types: selectedContentTypeNames,
            posting_frequency: "3-5 postări pe săptămână",
            kpis: ["Engagement rate", "Reach", "Conversii"]
          })),
          kpis_smart: [
            {
              name: "Creșterea followers",
              metric: "Numărul de urmăritori",
              target_value: "20% creștere",
              timeframe: `${formData.duration} zile`,
              measurement: "Analytics platforme sociale"
            }
          ],
          budget_allocation_summary: {
            organic_content: "40%",
            paid_advertising: "35%",
            tools_software: "15%",
            content_creation: "10%"
          },
          brand_voice_used: {
            brand_name: brandProfile.brand_name,
            personality_traits: brandProfile.personality_traits,
            communication_tones: brandProfile.communication_tones,
            timestamp: new Date().toISOString()
          }
        };
      }

      // Save the plan to database
      const { data: savedPlan, error: saveError } = await supabase
        .from('marketing_plans')
        .insert({
          user_id: user.id,
          brand_profile_id: brandProfile.id,
          title: formData.title,
          details: planData
        })
        .select()
        .single();

      if (saveError) throw saveError;

      // Increment plans counter
      await incrementPlansCounter();

      setGeneratedPlan(savedPlan);
      setStep('success');

      addNotification({
        type: 'success',
        title: 'Plan de marketing generat!',
        message: `Planul "${formData.title}" a fost creat cu succes și salvat în contul tău.`,
        persistent: true,
        action: {
          label: 'Vezi planul',
          onClick: () => {
            onClose();
            window.location.href = `/app/plans?view=${savedPlan.id}`;
          }
        }
      });

      onPlanGenerated();

    } catch (error) {
      console.error('Error generating marketing plan:', error);
      addNotification({
        type: 'error',
        title: 'Eroare la generarea planului',
        message: 'Nu am putut genera planul de marketing. Te rog încearcă din nou.',
        persistent: true
      });
      setStep('form');
    } finally {
      setLoading(false);
    }
  };

  const isFormValid = () => {
    return formData.title.trim() !== '' &&
           formData.objective.trim() !== '' &&
           formData.targetAudience.trim() !== '' &&
           formData.platforms.length > 0 &&
           formData.contentTypes.length > 0;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="max-w-4xl w-full max-h-[90vh] overflow-y-auto" padding="lg">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-gradient-to-r from-blue-100 to-purple-100 rounded-2xl">
              <Target className="h-8 w-8 text-blue-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Generează plan de marketing</h2>
              <p className="text-gray-600">Creează un plan personalizat pentru {brandProfile.brand_name}</p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose} className="p-2">
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Progress Indicator */}
        <div className="flex items-center justify-center mb-8">
          <div className="flex items-center space-x-4">
            <div className={`flex items-center space-x-2 ${step === 'form' ? 'text-blue-600' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step === 'form' ? 'bg-blue-100' : 'bg-gray-100'}`}>
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
            <div className={`flex items-center space-x-2 ${step === 'success' ? 'text-blue-600' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step === 'success' ? 'bg-blue-100' : 'bg-gray-100'}`}>
                <CheckCircle className="h-4 w-4" />
              </div>
              <span className="text-sm font-medium">Finalizat</span>
            </div>
          </div>
        </div>

        {/* Form Step */}
        {step === 'form' && (
          <div className="space-y-8">
            {/* Basic Information */}
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">Informații de bază</h3>
              
              <Input
                label="Titlul planului"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="ex. Campanie de lansare produs nou"
                required
              />

              <Textarea
                label="Obiectivul principal"
                value={formData.objective}
                onChange={(e) => setFormData(prev => ({ ...prev, objective: e.target.value }))}
                placeholder="Descrie obiectivul principal al campaniei..."
                rows={3}
                required
              />

              <Textarea
                label="Audiența țintă"
                value={formData.targetAudience}
                onChange={(e) => setFormData(prev => ({ ...prev, targetAudience: e.target.value }))}
                placeholder="Descrie audiența țintă (vârstă, interese, comportament...)..."
                rows={3}
                required
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                  label="Buget estimat"
                  value={formData.budget}
                  onChange={(e) => setFormData(prev => ({ ...prev, budget: e.target.value }))}
                  placeholder="ex. 5000 RON"
                />

                <Input
                  label="Durata campaniei (zile)"
                  type="number"
                  value={formData.duration}
                  onChange={(e) => setFormData(prev => ({ ...prev, duration: e.target.value }))}
                  placeholder="30"
                />
              </div>

              <Textarea
                label="Focus special (opțional)"
                value={formData.specialFocus}
                onChange={(e) => setFormData(prev => ({ ...prev, specialFocus: e.target.value }))}
                placeholder="ex. Sustenabilitate, inovație, comunitate locală..."
                rows={2}
              />
            </div>

            {/* Platform Selection */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Selectează platformele</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {availablePlatforms.map((platform) => (
                  <button
                    key={platform.id}
                    onClick={() => handlePlatformToggle(platform.id)}
                    className={`p-4 rounded-xl border-2 transition-all duration-200 text-left ${
                      formData.platforms.includes(platform.id)
                        ? 'border-blue-500 bg-blue-50 shadow-md'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <p className="font-semibold text-gray-900 text-sm">{platform.name}</p>
                    <p className="text-xs text-gray-600 mt-1">{platform.description}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Content Type Selection */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Tipuri de conținut</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {contentTypes.map((type) => (
                  <button
                    key={type.id}
                    onClick={() => handleContentTypeToggle(type.id)}
                    className={`p-4 rounded-xl border-2 transition-all duration-200 text-left ${
                      formData.contentTypes.includes(type.id)
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
                  <Calendar className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="text-sm font-medium text-blue-900">
                      Utilizare planuri: {stats.plans_this_month}/{stats.plan_limit === -1 ? '∞' : stats.plan_limit}
                    </p>
                    <p className="text-xs text-blue-700">
                      Vei genera 1 plan de marketing complet
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
                onClick={generatePlan}
                disabled={!isFormValid()}
                className="flex items-center space-x-2"
              >
                <Sparkles className="h-4 w-4" />
                <span>Generează planul</span>
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
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Generez planul de marketing...</h3>
            <p className="text-gray-600 mb-6">
              AI-ul creează un plan personalizat pentru {brandProfile.brand_name} bazat pe vocea brandului și cerințele tale
            </p>
            <div className="flex justify-center space-x-1">
              <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
              <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            </div>
          </div>
        )}

        {/* Success Step */}
        {step === 'success' && generatedPlan && (
          <div className="text-center py-12">
            <div className="p-6 bg-gradient-to-r from-green-100 to-blue-100 rounded-2xl mb-6 inline-block">
              <CheckCircle className="h-12 w-12 text-green-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Plan generat cu succes!</h3>
            <p className="text-gray-600 mb-8">
              Planul "{formData.title}" a fost creat și salvat în contul tău. Poți să îl vizualizezi, editezi și să îl folosești pentru campania ta.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button variant="outline" onClick={onClose}>
                Închide
              </Button>
              <Button 
                onClick={() => {
                  onClose();
                  window.location.href = `/app/plans?view=${generatedPlan.id}`;
                }}
                className="flex items-center space-x-2"
              >
                <TrendingUp className="h-4 w-4" />
                <span>Vezi planul generat</span>
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};