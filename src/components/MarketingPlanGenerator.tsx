import React, { useState } from 'react';
import { Target, Calendar, Users, TrendingUp, Sparkles, Brain, Zap, CheckCircle, AlertCircle, Lightbulb } from 'lucide-react';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Textarea } from './ui/Textarea';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

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
  brandProfile: BrandProfile;
  onPlanGenerated?: (plan: any) => void;
}

interface PlanFormData {
  objective: string;
  targetAudience: string;
  budget: string;
  timeframe: string;
  platforms: string[];
  additionalInfo: string;
}

const availablePlatforms = [
  { id: 'facebook', name: 'Facebook', icon: '📘' },
  { id: 'instagram', name: 'Instagram', icon: '📷' },
  { id: 'linkedin', name: 'LinkedIn', icon: '💼' },
  { id: 'twitter', name: 'Twitter/X', icon: '🐦' },
  { id: 'tiktok', name: 'TikTok', icon: '🎵' },
  { id: 'youtube', name: 'YouTube', icon: '📺' },
  { id: 'email', name: 'Email Marketing', icon: '📧' },
  { id: 'website', name: 'Website/Blog', icon: '🌐' },
];

export const MarketingPlanGenerator: React.FC<MarketingPlanGeneratorProps> = ({
  brandProfile,
  onPlanGenerated
}) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generatedPlan, setGeneratedPlan] = useState<any>(null);
  const [formData, setFormData] = useState<PlanFormData>({
    objective: '',
    targetAudience: '',
    budget: '',
    timeframe: '1 lună',
    platforms: [],
    additionalInfo: ''
  });

  const handlePlatformToggle = (platformId: string) => {
    setFormData(prev => ({
      ...prev,
      platforms: prev.platforms.includes(platformId)
        ? prev.platforms.filter(p => p !== platformId)
        : [...prev.platforms, platformId]
    }));
  };

  const generateMarketingPlan = async () => {
    if (!user || !brandProfile) return;

    setLoading(true);
    setError(null);

    try {
      // Construiește prompt-ul pentru AI folosind vocea curentă a brandului
      const prompt = `
Creează un plan de marketing detaliat în format JSON pentru următorul brand, folosind EXACT vocea și personalitatea definită:

INFORMAȚII BRAND (VOCEA CURENTĂ - FOLOSEȘTE EXACT ACEASTA):
- Nume: ${brandProfile.brand_name}
- Descriere: ${brandProfile.brand_description}
- Personalitate: ${brandProfile.personality_traits.join(', ')}
- Ton comunicare: ${brandProfile.communication_tones.join(', ')}

OBIECTIVUL CAMPANIEI:
${formData.objective}

AUDIENȚA ȚINTĂ:
${formData.targetAudience}

BUGET:
${formData.budget}

PERIOADA:
${formData.timeframe}

PLATFORME SELECTATE:
${formData.platforms.map(p => availablePlatforms.find(ap => ap.id === p)?.name).join(', ')}

INFORMAȚII ADIȚIONALE:
${formData.additionalInfo}

EXEMPLU DE CONȚINUT BRAND (PĂSTREAZĂ ACEST STIL):
${brandProfile.content_example_1}
${brandProfile.content_example_2 ? `\n${brandProfile.content_example_2}` : ''}

INSTRUCȚIUNI CRITICE:
1. Folosește EXACT personalitatea și tonul definit în profilul brandului
2. Tot conținutul generat TREBUIE să reflecte vocea curentă a brandului
3. Păstrează stilul și abordarea din exemplele de conținut
4. Nu schimba sau îmbunătățește vocea - folosește-o exact cum este definită
5. Asigură-te că fiecare postare sună ca și cum ar fi scrisă de același brand

Te rog să creezi un plan de marketing complet în format JSON cu următoarea structură:
{
  "title": "Titlul planului",
  "summary": "Rezumat executiv al planului",
  "brand_voice_used": {
    "personality": "${brandProfile.personality_traits.join(', ')}",
    "tone": "${brandProfile.communication_tones.join(', ')}",
    "timestamp": "${new Date().toISOString()}"
  },
  "objectives": ["obiectiv 1", "obiectiv 2", "obiectiv 3"],
  "target_audience": {
    "primary": "Audiența principală",
    "demographics": "Demografia detaliată",
    "psychographics": "Psihografia și interesele",
    "pain_points": ["problemă 1", "problemă 2"]
  },
  "strategy": {
    "positioning": "Poziționarea brandului",
    "key_messages": ["mesaj cheie 1", "mesaj cheie 2"],
    "content_pillars": ["pilon 1", "pilon 2", "pilon 3"]
  },
  "platforms": [
    {
      "name": "Numele platformei",
      "strategy": "Strategia specifică platformei",
      "content_types": ["tip conținut 1", "tip conținut 2"],
      "posting_frequency": "Frecvența postărilor",
      "kpis": ["KPI 1", "KPI 2"]
    }
  ],
  "content_calendar": [
    {
      "week": 1,
      "content": [
        {
          "platform": "Platforma",
          "type": "Tipul conținutului",
          "title": "Titlul postării",
          "description": "Descrierea conținutului (scris în vocea brandului)",
          "hashtags": ["#hashtag1", "#hashtag2"],
          "call_to_action": "Call to action în stilul brandului"
        }
      ]
    }
  ],
  "budget_allocation": {
    "organic": "Procentaj pentru organic",
    "paid": "Procentaj pentru plătit",
    "content_creation": "Procentaj pentru crearea de conținut",
    "tools": "Procentaj pentru unelte"
  },
  "kpis": [
    {
      "metric": "Numele metricii",
      "target": "Ținta numerică",
      "measurement": "Cum se măsoară"
    }
  ],
  "timeline": [
    {
      "phase": "Numele fazei",
      "duration": "Durata",
      "activities": ["activitate 1", "activitate 2"]
    }
  ],
  "recommendations": [
    {
      "category": "Categoria recomandării",
      "suggestion": "Sugestia detaliată",
      "priority": "high/medium/low"
    }
  ]
}

Asigură-te că planul:
1. Reflectă EXACT vocea și personalitatea brandului definită
2. Este adaptat platformelor selectate
3. Include conținut specific și acționabil în stilul brandului
4. Respectă bugetul și perioada specificată
5. Include KPI-uri măsurabile
6. Oferă recomandări practice
7. Toate textele sunt scrise în vocea curentă a brandului

Răspunde DOAR cu JSON-ul valid, fără text suplimentar.
`;

      // Apelează funcția edge pentru generarea cu AI
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-gemini-response`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate marketing plan');
      }

      const data = await response.json();
      
      // Parse the JSON response from AI
      let planData: any;
      try {
        // Extract JSON from the response text
        const jsonMatch = data.response.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          planData = JSON.parse(jsonMatch[0]);
        } else {
          throw new Error('No valid JSON found in response');
        }
      } catch (parseError) {
        console.error('Failed to parse AI response:', parseError);
        // Fallback plan
        planData = generateFallbackPlan();
      }

      // Adaugă informații despre vocea brandului folosită
      planData.brand_voice_used = {
        personality: brandProfile.personality_traits,
        tone: brandProfile.communication_tones,
        brand_description: brandProfile.brand_description,
        content_examples: [brandProfile.content_example_1, brandProfile.content_example_2].filter(Boolean),
        timestamp: new Date().toISOString()
      };

      // Salvează planul în baza de date
      const { data: savedPlan, error: saveError } = await supabase
        .from('marketing_plans')
        .insert({
          user_id: user.id,
          brand_profile_id: brandProfile.id,
          title: planData.title || `Plan de marketing - ${formData.objective}`,
          details: {
            ...planData,
            form_data: formData,
            generated_at: new Date().toISOString()
          }
        })
        .select()
        .single();

      if (saveError) throw saveError;

      setGeneratedPlan({ ...planData, id: savedPlan.id });
      onPlanGenerated?.(savedPlan);

      // Actualizează contorul de planuri generate
      await supabase
        .from('subscriptions')
        .update({
          plans_generated_this_month: supabase.sql`plans_generated_this_month + 1`
        })
        .eq('id', user.id);

      // Creează o notificare de succes
      await supabase
        .from('ai_recommendations')
        .insert({
          user_id: user.id,
          title: 'Plan de marketing generat cu succes',
          details: `Planul "${planData.title}" a fost generat folosind vocea curentă a brandului. Personalitate: ${brandProfile.personality_traits.join(', ')}. Ton: ${brandProfile.communication_tones.join(', ')}.`,
          is_read: false
        });

    } catch (err) {
      console.error('Error generating marketing plan:', err);
      setError('Nu am putut genera planul de marketing. Te rog încearcă din nou.');
    } finally {
      setLoading(false);
    }
  };

  const generateFallbackPlan = () => {
    return {
      title: `Plan de marketing pentru ${brandProfile.brand_name}`,
      summary: `Plan de marketing personalizat pentru ${formData.objective} pe o perioadă de ${formData.timeframe}, folosind vocea curentă a brandului.`,
      brand_voice_used: {
        personality: brandProfile.personality_traits,
        tone: brandProfile.communication_tones,
        brand_description: brandProfile.brand_description,
        timestamp: new Date().toISOString()
      },
      objectives: [
        `Creșterea awareness-ului brandului ${brandProfile.brand_name}`,
        `Atragerea și convertirea audiența țintă`,
        `Îmbunătățirea engagement-ului pe platformele sociale`
      ],
      target_audience: {
        primary: formData.targetAudience || "Audiența principală a brandului",
        demographics: "Adulți între 25-45 ani, cu venituri medii-mari",
        psychographics: "Persoane interesate de calitate și autenticitate",
        pain_points: ["Lipsa de timp", "Nevoia de soluții de încredere"]
      },
      strategy: {
        positioning: `${brandProfile.brand_name} ca lider în domeniu`,
        key_messages: [
          "Calitate și autenticitate",
          "Soluții personalizate",
          "Experiență de încredere"
        ],
        content_pillars: ["Educațional", "Inspirațional", "Promotional"]
      },
      platforms: formData.platforms.map(platformId => {
        const platform = availablePlatforms.find(p => p.id === platformId);
        return {
          name: platform?.name || platformId,
          strategy: `Strategie adaptată pentru ${platform?.name} folosind vocea brandului`,
          content_types: ["Postări organice", "Stories", "Video content"],
          posting_frequency: "3-5 postări pe săptămână",
          kpis: ["Reach", "Engagement", "Conversii"]
        };
      }),
      recommendations: [
        {
          category: "Conținut",
          suggestion: "Focusează-te pe storytelling autentic în vocea brandului",
          priority: "high"
        },
        {
          category: "Engagement",
          suggestion: "Răspunde prompt la comentarii și mesaje în stilul brandului",
          priority: "high"
        }
      ]
    };
  };

  const isFormValid = () => {
    return formData.objective.trim() !== '' && 
           formData.targetAudience.trim() !== '' && 
           formData.platforms.length > 0;
  };

  if (generatedPlan) {
    return (
      <div className="space-y-6">
        {/* Success Header */}
        <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-green-200" animation="bounceIn">
          <div className="text-center">
            <div className="p-4 bg-green-100 rounded-2xl mb-4 inline-block">
              <CheckCircle className="h-12 w-12 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Plan generat cu succes!</h2>
            <p className="text-gray-600">
              Planul tău de marketing personalizat este gata, folosind vocea curentă a brandului.
            </p>
          </div>
        </Card>

        {/* Brand Voice Used Notice */}
        {generatedPlan.brand_voice_used && (
          <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200" animation="slideInLeft">
            <div className="flex items-start space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Brain className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 mb-2">Vocea brandului folosită:</h3>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="font-semibold text-gray-800">Personalitate: </span>
                    <span className="text-gray-700">{generatedPlan.brand_voice_used.personality?.join(', ')}</span>
                  </div>
                  <div>
                    <span className="font-semibold text-gray-800">Ton: </span>
                    <span className="text-gray-700">{generatedPlan.brand_voice_used.tone?.join(', ')}</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    Toate planurile viitoare vor folosi vocea curentă a brandului, inclusiv orice îmbunătățiri aplicate.
                  </p>
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* Plan Overview */}
        <Card className="shadow-lg" animation="slideInLeft" hover="subtle">
          <div className="flex items-center space-x-3 mb-6">
            <div className="p-3 bg-blue-100 rounded-xl">
              <Target className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">{generatedPlan.title}</h3>
              <p className="text-gray-600">Plan de marketing personalizat</p>
            </div>
          </div>

          <div className="prose max-w-none">
            <p className="text-gray-700 leading-relaxed mb-6">{generatedPlan.summary}</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Obiective:</h4>
                <ul className="space-y-2">
                  {generatedPlan.objectives?.map((objective: string, index: number) => (
                    <li key={index} className="flex items-start space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700">{objective}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Platforme:</h4>
                <div className="flex flex-wrap gap-2">
                  {generatedPlan.platforms?.map((platform: any, index: number) => (
                    <span 
                      key={index}
                      className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium"
                    >
                      {platform.name}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Action Buttons */}
        <Card className="text-center" animation="fadeInUp">
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              onClick={() => setGeneratedPlan(null)}
              variant="outline"
              className="flex items-center space-x-2"
            >
              <Zap className="h-4 w-4" />
              <span>Generează alt plan</span>
            </Button>
            <Button className="flex items-center space-x-2">
              <Calendar className="h-4 w-4" />
              <span>Vezi calendarul de conținut</span>
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200" animation="fadeInUp">
        <div className="text-center">
          <div className="p-4 bg-gradient-to-r from-blue-100 to-purple-100 rounded-2xl mb-4 inline-block">
            <Brain className="h-12 w-12 text-blue-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Generator Plan de Marketing</h1>
          <p className="text-gray-600 text-lg">
            Creează un plan de marketing personalizat pentru <strong>{brandProfile.brand_name}</strong>
          </p>
        </div>
      </Card>

      {/* Brand Voice Notice */}
      <Card className="bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200" animation="slideInLeft">
        <div className="flex items-start space-x-3">
          <div className="p-2 bg-purple-100 rounded-lg">
            <Brain className="h-6 w-6 text-purple-600" />
          </div>
          <div>
            <h3 className="font-bold text-gray-900 mb-2">Vocea brandului care va fi folosită:</h3>
            <div className="space-y-2 text-sm">
              <div>
                <span className="font-semibold text-gray-800">Personalitate: </span>
                <span className="text-gray-700">{brandProfile.personality_traits.join(', ')}</span>
              </div>
              <div>
                <span className="font-semibold text-gray-800">Ton: </span>
                <span className="text-gray-700">{brandProfile.communication_tones.join(', ')}</span>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Planul va fi generat folosind exact această voce a brandului. Orice modificări viitoare ale vocii se vor reflecta în planurile noi.
              </p>
            </div>
          </div>
        </div>
      </Card>

      {/* Form */}
      <Card className="shadow-lg" animation="slideInLeft" hover="subtle">
        <div className="space-y-6">
          <div className="flex items-center space-x-3 mb-6">
            <div className="p-2 bg-purple-100 rounded-xl">
              <Target className="h-6 w-6 text-purple-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Detalii campanie</h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Textarea
              label="Obiectivul campaniei *"
              value={formData.objective}
              onChange={(e) => setFormData(prev => ({ ...prev, objective: e.target.value }))}
              placeholder="ex. Creșterea vânzărilor cu 30% în următoarele 3 luni prin atragerea de clienți noi..."
              rows={4}
              required
            />

            <Textarea
              label="Audiența țintă *"
              value={formData.targetAudience}
              onChange={(e) => setFormData(prev => ({ ...prev, targetAudience: e.target.value }))}
              placeholder="ex. Femei între 25-40 ani, cu venituri medii, interesate de lifestyle și wellness..."
              rows={4}
              required
            />

            <Input
              label="Buget estimat"
              value={formData.budget}
              onChange={(e) => setFormData(prev => ({ ...prev, budget: e.target.value }))}
              placeholder="ex. 5000 RON/lună"
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Perioada campaniei
              </label>
              <select
                value={formData.timeframe}
                onChange={(e) => setFormData(prev => ({ ...prev, timeframe: e.target.value }))}
                className="block w-full rounded-xl border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-4 py-3"
              >
                <option value="2 săptămâni">2 săptămâni</option>
                <option value="1 lună">1 lună</option>
                <option value="3 luni">3 luni</option>
                <option value="6 luni">6 luni</option>
                <option value="1 an">1 an</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-4">
              Platforme de marketing * (selectează cel puțin una)
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {availablePlatforms.map((platform) => (
                <button
                  key={platform.id}
                  type="button"
                  onClick={() => handlePlatformToggle(platform.id)}
                  className={`
                    p-4 rounded-xl border-2 transition-all duration-200 text-sm font-medium
                    ${formData.platforms.includes(platform.id)
                      ? 'border-blue-500 bg-blue-50 text-blue-700 shadow-md transform scale-105'
                      : 'border-gray-200 hover:border-gray-300 text-gray-700 hover:bg-gray-50'
                    }
                  `}
                >
                  <div className="text-2xl mb-2">{platform.icon}</div>
                  <div>{platform.name}</div>
                </button>
              ))}
            </div>
          </div>

          <Textarea
            label="Informații adiționale"
            value={formData.additionalInfo}
            onChange={(e) => setFormData(prev => ({ ...prev, additionalInfo: e.target.value }))}
            placeholder="Orice alte detalii relevante pentru campanie (concurența, sezonalitate, evenimente speciale, etc.)"
            rows={3}
          />
        </div>
      </Card>

      {/* Error Display */}
      {error && (
        <Card className="bg-red-50 border-red-200" animation="slideInLeft">
          <div className="flex items-center space-x-3">
            <AlertCircle className="h-6 w-6 text-red-600" />
            <p className="text-red-800">{error}</p>
          </div>
        </Card>
      )}

      {/* Generate Button */}
      <Card className="text-center" animation="fadeInUp">
        <div className="space-y-4">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <Lightbulb className="h-6 w-6 text-yellow-500" />
            <p className="text-gray-600">
              AI-ul va analiza vocea brandului tău și va crea un plan personalizat folosind exact personalitatea și tonul definit
            </p>
          </div>
          
          <Button
            onClick={generateMarketingPlan}
            loading={loading}
            disabled={!isFormValid()}
            size="lg"
            className="text-lg px-8 py-4"
          >
            <Sparkles className="h-6 w-6 mr-3" />
            {loading ? 'Generez planul...' : 'Generează Plan de Marketing'}
          </Button>
          
          {!isFormValid() && (
            <p className="text-sm text-gray-500">
              Completează obiectivul, audiența țintă și selectează cel puțin o platformă
            </p>
          )}
        </div>
      </Card>
    </div>
  );
};