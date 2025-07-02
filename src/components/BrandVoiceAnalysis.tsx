import React, { useState, useEffect } from 'react';
import { Brain, TrendingUp, AlertCircle, CheckCircle, Lightbulb, Target, Zap, Star, Wand2, Sparkles, ArrowRight } from 'lucide-react';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
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

interface AnalysisResult {
  overall_score: number;
  strengths: string[];
  improvements: string[];
  personality_analysis: {
    coherence_score: number;
    suggestions: string[];
  };
  tone_analysis: {
    balance_score: number;
    suggestions: string[];
  };
  content_analysis: {
    authenticity_score: number;
    suggestions: string[];
  };
  recommendations: {
    missing_traits: string[];
    tone_adjustments: string[];
    content_tips: string[];
  };
}

interface ImprovementSuggestions {
  brand_description: string;
  content_example_1: string;
  content_example_2: string;
  personality_traits: string[];
  communication_tones: string[];
  explanation: string;
  key_changes: string[];
}

interface BrandVoiceAnalysisProps {
  brandProfile: BrandProfile;
  onAnalysisComplete?: (result: AnalysisResult) => void;
  onBrandProfileUpdated?: (updatedProfile: BrandProfile) => void;
}

export const BrandVoiceAnalysis: React.FC<BrandVoiceAnalysisProps> = ({
  brandProfile,
  onAnalysisComplete,
  onBrandProfileUpdated
}) => {
  const { user } = useAuth();
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [improvementLoading, setImprovementLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [improvementResult, setImprovementResult] = useState<ImprovementSuggestions | null>(null);
  const [showImprovementPreview, setShowImprovementPreview] = useState(false);

  const analyzeWithAI = async () => {
    setLoading(true);
    setError(null);

    try {
      const prompt = `
Analizează următorul profil de brand și oferă o analiză detaliată a vocii brandului în format JSON:

PROFIL BRAND:
Nume: ${brandProfile.brand_name}
Descriere: ${brandProfile.brand_description}
Trăsături personalitate: ${brandProfile.personality_traits.join(', ')}
Tonuri comunicare: ${brandProfile.communication_tones.join(', ')}
Exemplu conținut 1: ${brandProfile.content_example_1}
${brandProfile.content_example_2 ? `Exemplu conținut 2: ${brandProfile.content_example_2}` : ''}

Te rog să analizezi și să returnezi DOAR un obiect JSON valid cu următoarea structură:
{
  "overall_score": număr între 1-100,
  "strengths": ["punct forte 1", "punct forte 2", "punct forte 3"],
  "improvements": ["îmbunătățire 1", "îmbunătățire 2", "îmbunătățire 3"],
  "personality_analysis": {
    "coherence_score": număr între 1-100,
    "suggestions": ["sugestie 1", "sugestie 2"]
  },
  "tone_analysis": {
    "balance_score": număr între 1-100,
    "suggestions": ["sugestie 1", "sugestie 2"]
  },
  "content_analysis": {
    "authenticity_score": număr între 1-100,
    "suggestions": ["sugestie 1", "sugestie 2"]
  },
  "recommendations": {
    "missing_traits": ["trăsătură lipsă 1", "trăsătură lipsă 2"],
    "tone_adjustments": ["ajustare ton 1", "ajustare ton 2"],
    "content_tips": ["sfat conținut 1", "sfat conținut 2"]
  }
}

Analizează coerența între personalitate, ton și exemplele de conținut. Oferă feedback constructiv în română.
`;

      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-gemini-response`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt }),
      });

      if (!response.ok) {
        throw new Error('Failed to analyze brand voice');
      }

      const data = await response.json();
      
      // Parse the JSON response from AI
      let analysisResult: AnalysisResult;
      try {
        // Extract JSON from the response text
        const jsonMatch = data.response.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          analysisResult = JSON.parse(jsonMatch[0]);
        } else {
          throw new Error('No valid JSON found in response');
        }
      } catch (parseError) {
        console.error('Failed to parse AI response:', parseError);
        // Fallback analysis
        analysisResult = generateFallbackAnalysis(brandProfile);
      }

      setAnalysis(analysisResult);
      onAnalysisComplete?.(analysisResult);

    } catch (err) {
      console.error('Error analyzing brand voice:', err);
      setError('Nu am putut analiza vocea brandului. Te rog încearcă din nou.');
      
      // Generate fallback analysis
      const fallbackAnalysis = generateFallbackAnalysis(brandProfile);
      setAnalysis(fallbackAnalysis);
      onAnalysisComplete?.(fallbackAnalysis);
    } finally {
      setLoading(false);
    }
  };

  const improveBrandVoice = async () => {
    if (!analysis || !user) return;

    setImprovementLoading(true);
    setError(null);

    try {
      const prompt = `
Bazat pe următoarea analiză a vocii brandului, îmbunătățește profilul brandului pentru a obține un scor mai mare:

PROFIL BRAND ACTUAL:
Nume: ${brandProfile.brand_name}
Descriere: ${brandProfile.brand_description}
Trăsături personalitate: ${brandProfile.personality_traits.join(', ')}
Tonuri comunicare: ${brandProfile.communication_tones.join(', ')}
Exemplu conținut 1: ${brandProfile.content_example_1}
${brandProfile.content_example_2 ? `Exemplu conținut 2: ${brandProfile.content_example_2}` : ''}

ANALIZA CURENTĂ:
Scor general: ${analysis.overall_score}/100
Puncte forte: ${analysis.strengths.join(', ')}
Îmbunătățiri necesare: ${analysis.improvements.join(', ')}
Trăsături lipsă: ${analysis.recommendations.missing_traits.join(', ')}
Ajustări ton: ${analysis.recommendations.tone_adjustments.join(', ')}
Sfaturi conținut: ${analysis.recommendations.content_tips.join(', ')}

Te rog să îmbunătățești profilul brandului și să returnezi DOAR un obiect JSON valid cu următoarea structură:
{
  "brand_description": "Descrierea îmbunătățită a brandului (păstrează esența dar îmbunătățește claritatea și impactul)",
  "content_example_1": "Exemplul de conținut 1 îmbunătățit (păstrează stilul dar îmbunătățește coerența cu personalitatea)",
  "content_example_2": "Un exemplu nou de conținut care completează primul (diferit în format dar consistent în voce)",
  "personality_traits": ["listă", "cu", "trăsături", "îmbunătățite", "inclusiv", "cele", "lipsă"],
  "communication_tones": ["listă", "cu", "tonuri", "îmbunătățite", "și", "ajustate"],
  "explanation": "Explicația detaliată a îmbunătățirilor făcute și de ce vor crește scorul",
  "key_changes": ["schimbare 1", "schimbare 2", "schimbare 3"]
}

INSTRUCȚIUNI IMPORTANTE:
1. Păstrează esența și autenticitatea brandului
2. Îmbunătățește doar aspectele identificate în analiză
3. Adaugă trăsăturile lipsă recomandate
4. Ajustează tonurile conform sugestiilor
5. Îmbunătățește exemplele de conținut pentru mai multă coerență
6. Asigură-te că toate elementele lucrează împreună armonios
7. Explică clar ce ai schimbat și de ce

Răspunde DOAR cu JSON-ul valid, fără text suplimentar.
`;

      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-gemini-response`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt }),
      });

      if (!response.ok) {
        throw new Error('Failed to improve brand voice');
      }

      const data = await response.json();
      
      // Parse the JSON response from AI
      let improvementData: ImprovementSuggestions;
      try {
        // Extract JSON from the response text
        const jsonMatch = data.response.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          improvementData = JSON.parse(jsonMatch[0]);
        } else {
          throw new Error('No valid JSON found in response');
        }
      } catch (parseError) {
        console.error('Failed to parse AI improvement response:', parseError);
        // Fallback improvement
        improvementData = generateFallbackImprovement();
      }

      setImprovementResult(improvementData);
      setShowImprovementPreview(true);

    } catch (err) {
      console.error('Error improving brand voice:', err);
      setError('Nu am putut îmbunătăți vocea brandului. Te rog încearcă din nou.');
    } finally {
      setImprovementLoading(false);
    }
  };

  const applyImprovements = async () => {
    if (!improvementResult || !user) return;

    setLoading(true);
    try {
      // Actualizează profilul brandului cu îmbunătățirile
      const { error } = await supabase
        .from('brand_profiles')
        .update({
          brand_description: improvementResult.brand_description,
          content_example_1: improvementResult.content_example_1,
          content_example_2: improvementResult.content_example_2,
          personality_traits: improvementResult.personality_traits,
          communication_tones: improvementResult.communication_tones,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', user.id);

      if (error) throw error;

      // Creează un log al îmbunătățirii pentru tracking
      await supabase
        .from('ai_recommendations')
        .insert({
          user_id: user.id,
          title: 'Vocea brandului îmbunătățită cu AI',
          details: `Vocea brandului a fost îmbunătățită automat cu AI. Schimbări: ${improvementResult.key_changes.join(', ')}. Toate planurile de marketing viitoare vor folosi această voce îmbunătățită.`,
          is_read: false
        });

      // Update the local brand profile
      const updatedProfile: BrandProfile = {
        ...brandProfile,
        brand_description: improvementResult.brand_description,
        content_example_1: improvementResult.content_example_1,
        content_example_2: improvementResult.content_example_2,
        personality_traits: improvementResult.personality_traits,
        communication_tones: improvementResult.communication_tones,
      };

      onBrandProfileUpdated?.(updatedProfile);
      
      // Reset states to trigger re-analysis
      setAnalysis(null);
      setImprovementResult(null);
      setShowImprovementPreview(false);
      
      // Automatically re-analyze with the improved profile
      setTimeout(() => {
        analyzeWithAI();
      }, 1000);

    } catch (error) {
      console.error('Error applying improvements:', error);
      setError('Nu am putut aplica îmbunătățirile. Te rog încearcă din nou.');
    } finally {
      setLoading(false);
    }
  };

  const generateFallbackImprovement = (): ImprovementSuggestions => {
    return {
      brand_description: `${brandProfile.brand_description} Suntem dedicați să oferim experiențe autentice și de calitate superioară, construind relații de încredere cu fiecare client.`,
      content_example_1: `${brandProfile.content_example_1} #autenticitate #calitate #încredere`,
      content_example_2: "Astăzi vreau să vă povestesc despre pasiunea care ne motivează în fiecare zi. Fiecare detaliu contează pentru noi, pentru că știm că voi meritați doar ce e mai bun. 💫",
      personality_traits: [...brandProfile.personality_traits, 'empatic', 'inovator', 'autentic'],
      communication_tones: [...brandProfile.communication_tones, 'inspirațional', 'cald'],
      explanation: "Am îmbunătățit descrierea brandului pentru mai multă claritate, am adăugat trăsături de personalitate care lipseau și am ajustat tonul pentru mai multă căldură și autenticitate.",
      key_changes: [
        "Adăugat trăsături de personalitate: empatic, inovator, autentic",
        "Îmbunătățit tonul comunicării cu elemente inspiraționale",
        "Creat un al doilea exemplu de conținut pentru diversitate"
      ]
    };
  };

  const generateFallbackAnalysis = (profile: BrandProfile): AnalysisResult => {
    const personalityCount = profile.personality_traits.length;
    const toneCount = profile.communication_tones.length;
    const hasSecondExample = !!profile.content_example_2;
    
    const baseScore = 60;
    const personalityBonus = Math.min(personalityCount * 5, 20);
    const toneBonus = Math.min(toneCount * 5, 15);
    const contentBonus = hasSecondExample ? 10 : 0;
    
    const overallScore = Math.min(baseScore + personalityBonus + toneBonus + contentBonus, 95);

    return {
      overall_score: overallScore,
      strengths: [
        "Profil de brand bine definit",
        "Personalitate clară și coerentă",
        "Exemple de conținut relevante"
      ],
      improvements: [
        "Adaugă mai multe exemple de conținut",
        "Definește mai clar tonul pentru situații specifice",
        "Dezvoltă mai multe aspecte ale personalității"
      ],
      personality_analysis: {
        coherence_score: Math.min(personalityCount * 8 + 20, 90),
        suggestions: [
          "Personalitatea selectată este coerentă",
          "Consideră adăugarea de trăsături complementare"
        ]
      },
      tone_analysis: {
        balance_score: Math.min(toneCount * 8 + 25, 85),
        suggestions: [
          "Tonul ales reflectă bine brandul",
          "Balansează tonurile pentru diferite situații"
        ]
      },
      content_analysis: {
        authenticity_score: hasSecondExample ? 80 : 65,
        suggestions: [
          "Conținutul reflectă personalitatea brandului",
          hasSecondExample ? "Exemplele sunt diverse și relevante" : "Adaugă mai multe exemple pentru o analiză mai precisă"
        ]
      },
      recommendations: {
        missing_traits: ["empatic", "inovator"],
        tone_adjustments: ["mai conversațional", "mai inspirațional"],
        content_tips: [
          "Folosește mai multe povești personale",
          "Integrează mai multe call-to-action-uri"
        ]
      }
    };
  };

  useEffect(() => {
    if (brandProfile && !analysis) {
      analyzeWithAI();
    }
  }, [brandProfile]);

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-100';
    if (score >= 60) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getScoreIcon = (score: number) => {
    if (score >= 80) return <CheckCircle className="h-5 w-5" />;
    if (score >= 60) return <AlertCircle className="h-5 w-5" />;
    return <AlertCircle className="h-5 w-5" />;
  };

  if (loading) {
    return (
      <Card className="shadow-lg" animation="scaleIn">
        <div className="text-center py-8">
          <div className="p-4 bg-gradient-to-r from-blue-100 to-purple-100 rounded-2xl mb-4 inline-block">
            <Brain className="h-8 w-8 text-blue-600 animate-pulse" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            {improvementLoading ? 'Îmbunătățesc vocea brandului...' : 'Analizez vocea brandului...'}
          </h3>
          <p className="text-gray-600 mb-4">
            {improvementLoading 
              ? 'AI-ul creează îmbunătățiri personalizate pentru brandul tău'
              : 'AI-ul analizează profilul tău pentru a oferi feedback personalizat'
            }
          </p>
          <div className="animate-pulse flex space-x-1 justify-center">
            <div className="h-2 w-2 bg-blue-600 rounded-full animate-bounce"></div>
            <div className="h-2 w-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
            <div className="h-2 w-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
          </div>
        </div>
      </Card>
    );
  }

  if (error && !analysis) {
    return (
      <Card className="shadow-lg border-red-200" animation="slideInLeft">
        <div className="text-center py-6">
          <div className="p-3 bg-red-100 rounded-xl mb-4 inline-block">
            <AlertCircle className="h-6 w-6 text-red-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Eroare la analiză</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={analyzeWithAI} className="micro-bounce">
            Încearcă din nou
          </Button>
        </div>
      </Card>
    );
  }

  // Show improvement preview
  if (showImprovementPreview && improvementResult) {
    return (
      <div className="space-y-6">
        {/* Header */}
        <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-green-200" animation="bounceIn">
          <div className="text-center">
            <div className="p-3 bg-gradient-to-r from-green-100 to-blue-100 rounded-2xl mb-4 inline-block">
              <Wand2 className="h-8 w-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Îmbunătățiri AI Generate</h2>
            <p className="text-gray-600">
              AI-ul a analizat profilul tău și a creat îmbunătățiri personalizate
            </p>
          </div>
        </Card>

        {/* Important Notice */}
        <Card className="bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200" animation="slideInLeft">
          <div className="flex items-start space-x-3">
            <div className="p-2 bg-amber-100 rounded-lg">
              <Lightbulb className="h-6 w-6 text-amber-600" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 mb-2">Important de știut:</h3>
              <p className="text-gray-700 text-sm leading-relaxed">
                Dacă aplici aceste îmbunătățiri, <strong>toate planurile de marketing viitoare</strong> vor folosi această voce îmbunătățită. 
                Dacă nu le aplici, planurile vor continua să folosească vocea originală a brandului.
              </p>
            </div>
          </div>
        </Card>

        {/* Explanation */}
        <Card className="shadow-lg" animation="slideInLeft">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-2 bg-blue-100 rounded-xl">
              <Lightbulb className="h-6 w-6 text-blue-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900">Explicația îmbunătățirilor</h3>
          </div>
          <p className="text-gray-700 leading-relaxed mb-4">{improvementResult.explanation}</p>
          
          <div>
            <h4 className="font-semibold text-gray-900 mb-3">Schimbări cheie:</h4>
            <ul className="space-y-2">
              {improvementResult.key_changes.map((change, index) => (
                <li key={index} className="flex items-start space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">{change}</span>
                </li>
              ))}
            </ul>
          </div>
        </Card>

        {/* Before/After Comparison */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Before */}
          <Card className="shadow-lg" animation="slideInLeft">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2 bg-gray-100 rounded-xl">
                <Target className="h-6 w-6 text-gray-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">Înainte</h3>
            </div>
            
            <div className="space-y-4 text-sm">
              <div>
                <h4 className="font-semibold text-gray-800 mb-2">Descriere:</h4>
                <p className="text-gray-600 bg-gray-50 p-3 rounded-lg">{brandProfile.brand_description}</p>
              </div>
              
              <div>
                <h4 className="font-semibold text-gray-800 mb-2">Personalitate:</h4>
                <div className="flex flex-wrap gap-1">
                  {brandProfile.personality_traits.map((trait, index) => (
                    <span key={index} className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs">
                      {trait}
                    </span>
                  ))}
                </div>
              </div>
              
              <div>
                <h4 className="font-semibold text-gray-800 mb-2">Tonuri:</h4>
                <div className="flex flex-wrap gap-1">
                  {brandProfile.communication_tones.map((tone, index) => (
                    <span key={index} className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs">
                      {tone}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </Card>

          {/* After */}
          <Card className="shadow-lg border-green-200" animation="slideInRight">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2 bg-green-100 rounded-xl">
                <Sparkles className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">După îmbunătățiri</h3>
            </div>
            
            <div className="space-y-4 text-sm">
              <div>
                <h4 className="font-semibold text-gray-800 mb-2">Descriere îmbunătățită:</h4>
                <p className="text-gray-700 bg-green-50 p-3 rounded-lg border border-green-200">
                  {improvementResult.brand_description}
                </p>
              </div>
              
              <div>
                <h4 className="font-semibold text-gray-800 mb-2">Personalitate îmbunătățită:</h4>
                <div className="flex flex-wrap gap-1">
                  {improvementResult.personality_traits.map((trait, index) => {
                    const isNew = !brandProfile.personality_traits.includes(trait);
                    return (
                      <span 
                        key={index} 
                        className={`px-2 py-1 rounded-full text-xs ${
                          isNew 
                            ? 'bg-green-100 text-green-800 border border-green-300' 
                            : 'bg-blue-100 text-blue-700'
                        }`}
                      >
                        {trait} {isNew && '✨'}
                      </span>
                    );
                  })}
                </div>
              </div>
              
              <div>
                <h4 className="font-semibold text-gray-800 mb-2">Tonuri îmbunătățite:</h4>
                <div className="flex flex-wrap gap-1">
                  {improvementResult.communication_tones.map((tone, index) => {
                    const isNew = !brandProfile.communication_tones.includes(tone);
                    return (
                      <span 
                        key={index} 
                        className={`px-2 py-1 rounded-full text-xs ${
                          isNew 
                            ? 'bg-green-100 text-green-800 border border-green-300' 
                            : 'bg-purple-100 text-purple-700'
                        }`}
                      >
                        {tone} {isNew && '✨'}
                      </span>
                    );
                  })}
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Action Buttons */}
        <Card className="text-center shadow-lg" animation="fadeInUp">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Aplici aceste îmbunătățiri?</h3>
          <p className="text-gray-600 mb-6">
            Îmbunătățirile vor fi salvate în profilul tău de brand și <strong>toate planurile de marketing viitoare</strong> vor folosi această voce îmbunătățită.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              onClick={() => setShowImprovementPreview(false)}
              variant="outline"
              className="flex items-center space-x-2"
            >
              <ArrowRight className="h-4 w-4 rotate-180" />
              <span>Nu, păstrează vocea originală</span>
            </Button>
            <Button 
              onClick={applyImprovements}
              loading={loading}
              className="flex items-center space-x-2 micro-bounce"
            >
              <CheckCircle className="h-4 w-4" />
              <span>Da, aplică îmbunătățirile</span>
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  if (!analysis) return null;

  return (
    <div className="space-y-6">
      {/* Overall Score */}
      <Card className="shadow-lg bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200" animation="scaleIn">
        <div className="text-center">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <div className="p-3 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl">
              <Brain className="h-8 w-8 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Analiza Vocii Brandului</h2>
              <p className="text-gray-600">Evaluare completă AI</p>
            </div>
          </div>
          
          <div className="flex items-center justify-center space-x-4 mb-6">
            <div className={`px-6 py-3 rounded-2xl font-bold text-2xl flex items-center space-x-2 ${getScoreColor(analysis.overall_score)}`}>
              {getScoreIcon(analysis.overall_score)}
              <span>{analysis.overall_score}/100</span>
            </div>
            <div className="text-left">
              <p className="text-sm text-gray-600">Scor general</p>
              <p className="font-semibold text-gray-900">
                {analysis.overall_score >= 80 ? 'Excelent' : 
                 analysis.overall_score >= 60 ? 'Bun' : 'Necesită îmbunătățiri'}
              </p>
            </div>
          </div>
        </div>
      </Card>

      {/* Detailed Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Personality Analysis */}
        <Card className="shadow-lg" animation="slideInLeft" hover="subtle">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-2 bg-blue-100 rounded-xl">
              <Target className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">Personalitate</h3>
              <div className={`px-2 py-1 rounded-lg text-sm font-medium ${getScoreColor(analysis.personality_analysis.coherence_score)}`}>
                {analysis.personality_analysis.coherence_score}/100
              </div>
            </div>
          </div>
          
          <div className="space-y-3">
            {analysis.personality_analysis.suggestions.map((suggestion, index) => (
              <div key={index} className="flex items-start space-x-2">
                <Lightbulb className="h-4 w-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-gray-700">{suggestion}</p>
              </div>
            ))}
          </div>
        </Card>

        {/* Tone Analysis */}
        <Card className="shadow-lg" animation="scaleIn" delay={1} hover="subtle">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-2 bg-purple-100 rounded-xl">
              <Zap className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">Ton</h3>
              <div className={`px-2 py-1 rounded-lg text-sm font-medium ${getScoreColor(analysis.tone_analysis.balance_score)}`}>
                {analysis.tone_analysis.balance_score}/100
              </div>
            </div>
          </div>
          
          <div className="space-y-3">
            {analysis.tone_analysis.suggestions.map((suggestion, index) => (
              <div key={index} className="flex items-start space-x-2">
                <Lightbulb className="h-4 w-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-gray-700">{suggestion}</p>
              </div>
            ))}
          </div>
        </Card>

        {/* Content Analysis */}
        <Card className="shadow-lg" animation="slideInRight" delay={2} hover="subtle">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-2 bg-green-100 rounded-xl">
              <Star className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">Conținut</h3>
              <div className={`px-2 py-1 rounded-lg text-sm font-medium ${getScoreColor(analysis.content_analysis.authenticity_score)}`}>
                {analysis.content_analysis.authenticity_score}/100
              </div>
            </div>
          </div>
          
          <div className="space-y-3">
            {analysis.content_analysis.suggestions.map((suggestion, index) => (
              <div key={index} className="flex items-start space-x-2">
                <Lightbulb className="h-4 w-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-gray-700">{suggestion}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Strengths and Improvements */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="shadow-lg" animation="slideInLeft" delay={1} hover="subtle">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-2 bg-green-100 rounded-xl">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <h3 className="text-lg font-bold text-gray-900">Puncte forte</h3>
          </div>
          
          <div className="space-y-3">
            {analysis.strengths.map((strength, index) => (
              <div key={index} className="flex items-start space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                <p className="text-gray-700">{strength}</p>
              </div>
            ))}
          </div>
        </Card>

        <Card className="shadow-lg" animation="slideInRight" delay={1} hover="subtle">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-2 bg-amber-100 rounded-xl">
              <TrendingUp className="h-6 w-6 text-amber-600" />
            </div>
            <h3 className="text-lg font-bold text-gray-900">Îmbunătățiri</h3>
          </div>
          
          <div className="space-y-3">
            {analysis.improvements.map((improvement, index) => (
              <div key={index} className="flex items-start space-x-2">
                <div className="w-2 h-2 bg-amber-500 rounded-full mt-2 flex-shrink-0"></div>
                <p className="text-gray-700">{improvement}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Recommendations */}
      <Card className="shadow-lg bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200" animation="fadeInUp" delay={2}>
        <div className="flex items-center space-x-3 mb-6">
          <div className="p-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl">
            <Brain className="h-6 w-6 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900">Recomandări AI</h3>
            <p className="text-gray-600">Sugestii personalizate pentru îmbunătățirea vocii brandului</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <h4 className="font-semibold text-gray-900 mb-3">Trăsături lipsă</h4>
            <div className="space-y-2">
              {analysis.recommendations.missing_traits.map((trait, index) => (
                <span key={index} className="inline-block px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm mr-2 mb-2">
                  {trait}
                </span>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-gray-900 mb-3">Ajustări ton</h4>
            <div className="space-y-2">
              {analysis.recommendations.tone_adjustments.map((adjustment, index) => (
                <span key={index} className="inline-block px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm mr-2 mb-2">
                  {adjustment}
                </span>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-gray-900 mb-3">Sfaturi conținut</h4>
            <div className="space-y-2">
              {analysis.recommendations.content_tips.map((tip, index) => (
                <div key={index} className="flex items-start space-x-2">
                  <Lightbulb className="h-4 w-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-gray-700">{tip}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Card>

      {/* Action Button - Now with AI Improvement */}
      <Card className="text-center shadow-lg" animation="bounceIn" delay={3}>
        <h3 className="text-lg font-bold text-gray-900 mb-2">Gata să îmbunătățești vocea brandului?</h3>
        <p className="text-gray-600 mb-4">
          Lasă AI-ul să îmbunătățească automat profilul brandului bazat pe recomandările de mai sus
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button 
            variant="outline"
            className="flex items-center space-x-2 micro-bounce"
            onClick={() => window.location.reload()}
          >
            <TrendingUp className="h-4 w-4" />
            <span>Analizează din nou</span>
          </Button>
          <Button 
            onClick={improveBrandVoice}
            loading={improvementLoading}
            className="flex items-center space-x-2 micro-bounce"
          >
            <Wand2 className="h-4 w-4" />
            <span>
              {improvementLoading ? 'Îmbunătățesc...' : 'Îmbunătățește cu AI'}
            </span>
          </Button>
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
    </div>
  );
};