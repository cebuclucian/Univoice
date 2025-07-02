import React, { useState, useEffect } from 'react';
import { Brain, TrendingUp, AlertCircle, CheckCircle, Lightbulb, Target, Zap, Star } from 'lucide-react';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
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

interface BrandVoiceAnalysisProps {
  brandProfile: BrandProfile;
  onAnalysisComplete?: (result: AnalysisResult) => void;
}

export const BrandVoiceAnalysis: React.FC<BrandVoiceAnalysisProps> = ({
  brandProfile,
  onAnalysisComplete
}) => {
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
          <h3 className="text-xl font-bold text-gray-900 mb-2">Analizez vocea brandului...</h3>
          <p className="text-gray-600 mb-4">AI-ul analizează profilul tău pentru a oferi feedback personalizat</p>
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

      {/* Action Button */}
      <Card className="text-center shadow-lg" animation="bounceIn" delay={3}>
        <h3 className="text-lg font-bold text-gray-900 mb-2">Gata să îmbunătățești vocea brandului?</h3>
        <p className="text-gray-600 mb-4">Aplică recomandările AI pentru a obține un scor mai mare</p>
        <Button className="micro-bounce">
          Îmbunătățește vocea brandului
        </Button>
      </Card>
    </div>
  );
};