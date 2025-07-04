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
  businessType: string;
  competitorAnalysis: string;
  currentChallenges: string;
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
    timeframe: '3 luni',
    platforms: [],
    additionalInfo: '',
    businessType: '',
    competitorAnalysis: '',
    currentChallenges: ''
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
      // Construiește prompt-ul extins pentru AI folosind vocea curentă a brandului
      const prompt = `
Creează un plan de marketing digital COMPLET și DETALIAT în format JSON pentru următorul brand, folosind EXACT vocea și personalitatea definită:

INFORMAȚII BRAND (VOCEA CURENTĂ - FOLOSEȘTE EXACT ACEASTA):
- Nume: ${brandProfile.brand_name}
- Descriere: ${brandProfile.brand_description}
- Personalitate: ${brandProfile.personality_traits.join(', ')}
- Ton comunicare: ${brandProfile.communication_tones.join(', ')}

OBIECTIVUL CAMPANIEI:
${formData.objective}

AUDIENȚA ȚINTĂ:
${formData.targetAudience}

BUGET TOTAL:
${formData.budget}

PERIOADA:
${formData.timeframe}

TIPUL DE BUSINESS:
${formData.businessType}

ANALIZA COMPETITORILOR:
${formData.competitorAnalysis}

PROVOCĂRI CURENTE:
${formData.currentChallenges}

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
6. Toate KPI-urile trebuie să fie SMART (Specific, Măsurabil, Realizabil, Relevant, Încadrat în Timp)
7. Calendarul editorial trebuie să conțină 20-30 postări per platformă pentru perioada specificată
8. Fiecare postare trebuie să aibă copy complet, brief vizual și specificații de promovare

Te rog să creezi un plan de marketing digital COMPLET în format JSON cu următoarea structură:
{
  "title": "Plan de Marketing Digital pentru ${brandProfile.brand_name}",
  "summary": "Rezumat executiv al planului de marketing digital",
  "delivery_date": "Data exactă de livrare (${new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toLocaleDateString('ro-RO')})",
  "brand_voice_used": {
    "personality": ${JSON.stringify(brandProfile.personality_traits)},
    "tone": ${JSON.stringify(brandProfile.communication_tones)},
    "brand_description": "${brandProfile.brand_description}",
    "timestamp": "${new Date().toISOString()}"
  },
  "identity_and_voice": {
    "brand_identity": "Identitatea brandului detaliată",
    "voice_characteristics": {
      "tone": "Tonul vocii brandului",
      "personality": "Personalitatea brandului",
      "values": ["valoare 1", "valoare 2", "valoare 3"],
      "communication_style": "Stilul de comunicare"
    },
    "brand_positioning": "Poziționarea brandului pe piață"
  },
  "kpis_smart": [
    {
      "name": "Numele KPI-ului",
      "description": "Descrierea detaliată",
      "target_value": "Valoarea țintă numerică",
      "measurement_method": "Cum se măsoară",
      "timeframe": "Perioada de timp (90 zile)",
      "responsible": "Responsabilul",
      "specific": "Aspectul specific",
      "measurable": "Cum este măsurabil",
      "achievable": "De ce este realizabil",
      "relevant": "De ce este relevant",
      "time_bound": "Încadrarea în timp"
    }
  ],
  "buyer_personas": [
    {
      "name": "Numele personei",
      "demographics": {
        "age_range": "Intervalul de vârstă",
        "gender": "Genul",
        "location": "Locația",
        "income": "Venitul",
        "education": "Educația",
        "occupation": "Ocupația"
      },
      "psychographics": {
        "interests": ["interes 1", "interes 2"],
        "values": ["valoare 1", "valoare 2"],
        "lifestyle": "Stilul de viață",
        "personality_traits": ["trăsătură 1", "trăsătură 2"],
        "pain_points": ["problemă 1", "problemă 2"],
        "goals": ["obiectiv 1", "obiectiv 2"]
      },
      "digital_behavior": {
        "preferred_platforms": ["platformă 1", "platformă 2"],
        "online_activity_time": "Timpul petrecut online",
        "content_preferences": ["tip conținut 1", "tip conținut 2"],
        "purchase_behavior": "Comportamentul de cumpărare"
      }
    }
  ],
  "platform_selection_justification": {
    "selected_platforms": [
      {
        "platform": "Numele platformei",
        "justification": "Justificarea alegerii",
        "audience_overlap": "Suprapunerea cu audiența țintă",
        "expected_roi": "ROI-ul așteptat",
        "priority_level": "high/medium/low"
      }
    ],
    "excluded_platforms": [
      {
        "platform": "Platforma exclusă",
        "reason": "Motivul excluderii"
      }
    ]
  },
  "budget_allocation_summary": {
    "total_budget": "${formData.budget}",
    "allocation_by_channel": [
      {
        "channel": "Numele canalului",
        "percentage": "Procentajul din buget",
        "amount": "Suma alocată",
        "justification": "Justificarea alocării"
      }
    ],
    "allocation_by_type": {
      "content_creation": "Procentaj pentru crearea de conținut",
      "paid_promotion": "Procentaj pentru promovare plătită",
      "tools_and_software": "Procentaj pentru unelte și software",
      "influencer_partnerships": "Procentaj pentru parteneriate cu influenceri",
      "contingency": "Procentaj pentru contingențe"
    }
  },
  "tactical_plan_per_platform": [
    {
      "platform": "Numele platformei",
      "strategy": "Strategia specifică platformei",
      "content_types": ["tip conținut 1", "tip conținut 2"],
      "posting_frequency": "Frecvența postărilor",
      "optimal_posting_times": ["oră 1", "oră 2"],
      "editorial_calendar": {
        "month_1": [
          {
            "week": 1,
            "posts": [
              {
                "post_id": "P001",
                "scheduled_date": "Data și ora exactă",
                "copy": {
                  "main_text": "Textul principal al postării (max 2000 caractere, optimizat SEO)",
                  "call_to_action": "Call-to-action specific și măsurabil",
                  "hashtags": ["#hashtag1", "#hashtag2", "#hashtag3"]
                },
                "visual_brief": {
                  "type": "imagine/video/carousel",
                  "dimensions": "Dimensiunile exacte",
                  "style_guidelines": "Ghidul de stil",
                  "mandatory_elements": ["element 1", "element 2"],
                  "color_palette": ["culoare 1", "culoare 2"],
                  "text_overlay": "Textul de pe imagine/video"
                },
                "promotion_budget": "Bugetul de promovare pentru această postare",
                "target_audience_specific": {
                  "demographics": "Demografia țintă specifică",
                  "interests": ["interes 1", "interes 2"],
                  "behaviors": ["comportament 1", "comportament 2"],
                  "custom_audiences": ["audiență 1", "audiență 2"]
                },
                "individual_metrics": {
                  "primary_kpi": "KPI-ul principal urmărit",
                  "target_reach": "Reach-ul țintă",
                  "target_engagement": "Engagement-ul țintă",
                  "target_clicks": "Click-urile țintă",
                  "target_conversions": "Conversiile țintă"
                },
                "response_protocol": {
                  "comment_response_time": "Timpul de răspuns la comentarii",
                  "message_response_time": "Timpul de răspuns la mesaje",
                  "escalation_procedure": "Procedura de escaladare",
                  "tone_guidelines": "Ghidul de ton pentru răspunsuri"
                }
              }
            ]
          }
        ]
      }
    }
  ],
  "monitoring_and_optimization": {
    "weekly_dashboard_metrics": [
      {
        "metric": "Numele metricii",
        "description": "Descrierea metricii",
        "target_value": "Valoarea țintă",
        "measurement_frequency": "Frecvența măsurării",
        "data_source": "Sursa datelor"
      }
    ],
    "performance_evaluation_schedule": {
      "7_day_review": {
        "focus_areas": ["zona 1", "zona 2"],
        "key_metrics": ["metrică 1", "metrică 2"],
        "action_items": ["acțiune 1", "acțiune 2"]
      },
      "15_day_review": {
        "focus_areas": ["zona 1", "zona 2"],
        "key_metrics": ["metrică 1", "metrică 2"],
        "action_items": ["acțiune 1", "acțiune 2"]
      },
      "30_day_review": {
        "focus_areas": ["zona 1", "zona 2"],
        "key_metrics": ["metrică 1", "metrică 2"],
        "action_items": ["acțiune 1", "acțiune 2"]
      }
    },
    "adjustment_recommendations": [
      {
        "trigger_condition": "Condiția care declanșează ajustarea",
        "recommended_action": "Acțiunea recomandată",
        "implementation_timeline": "Cronologia implementării",
        "expected_impact": "Impactul așteptat"
      }
    ],
    "dedicated_responsibilities": [
      {
        "role": "Rolul/Funcția",
        "responsibilities": ["responsabilitate 1", "responsabilitate 2"],
        "time_allocation": "Alocarea timpului",
        "required_skills": ["abilitate 1", "abilitate 2"]
      }
    ]
  },
  "deliverables": {
    "strategic_document": "Document strategic complet cu toate secțiunile de mai sus",
    "excel_editorial_calendar": "Calendar editorial în format Excel cu toate postările programate",
    "creative_briefs": "Brief-uri creative detaliate pentru fiecare tip de conținut",
    "monitoring_dashboard": "Dashboard pentru monitorizarea performanței",
    "optimization_playbook": "Ghid de optimizare și ajustare"
  }
}

IMPORTANT: Asigură-te că planul:
1. Reflectă EXACT vocea și personalitatea brandului definită
2. Este adaptat platformelor selectate
3. Include conținut specific și acționabil în stilul brandului
4. Respectă bugetul și perioada specificată
5. Include KPI-uri măsurabile și SMART
6. Oferă recomandări practice și implementabile
7. Toate textele sunt scrise în vocea curentă a brandului
8. Calendarul editorial conține 20-30 postări per platformă
9. Fiecare postare are copy complet, brief vizual și specificații de promovare
10. Include protocoale de răspuns și responsabilități clare

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
        // Fallback plan cu structura extinsă
        planData = generateFallbackPlan();
      }

      // Asigură-te că planul conține informații despre vocea brandului folosită
      if (!planData.brand_voice_used) {
        planData.brand_voice_used = {
          personality: brandProfile.personality_traits,
          tone: brandProfile.communication_tones,
          brand_description: brandProfile.brand_description,
          content_examples: [brandProfile.content_example_1, brandProfile.content_example_2].filter(Boolean),
          timestamp: new Date().toISOString()
        };
      }

      // Salvează planul în baza de date
      const { data: savedPlan, error: saveError } = await supabase
        .from('marketing_plans')
        .insert({
          user_id: user.id,
          brand_profile_id: brandProfile.id,
          title: planData.title || `Plan de marketing digital - ${formData.objective}`,
          details: {
            ...planData,
            form_data: formData,
            generated_at: new Date().toISOString(),
            plan_type: 'digital_marketing_complete'
          }
        })
        .select()
        .single();

      if (saveError) throw saveError;

      setGeneratedPlan({ ...planData, id: savedPlan.id });
      onPlanGenerated?.(savedPlan);

      // Actualizează contorul de planuri generate folosind RPC
      const { error: updateError } = await supabase.rpc('increment_plans_generated', {
        user_id: user.id
      });

      if (updateError) {
        console.error('Error updating plans counter:', updateError);
        // Continue even if counter update fails
      }

      // Creează o notificare de succes
      await supabase
        .from('ai_recommendations')
        .insert({
          user_id: user.id,
          title: 'Plan de marketing digital generat cu succes',
          details: `Planul complet "${planData.title}" a fost generat folosind vocea curentă a brandului. Include strategie detaliată, calendar editorial cu 20-30 postări per platformă, KPI-uri SMART și protocoale de monitorizare.`,
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
      title: `Plan de Marketing Digital pentru ${brandProfile.brand_name}`,
      summary: `Plan de marketing digital complet pentru ${formData.objective} pe o perioadă de ${formData.timeframe}, folosind vocea curentă a brandului.`,
      delivery_date: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toLocaleDateString('ro-RO'),
      brand_voice_used: {
        personality: brandProfile.personality_traits,
        tone: brandProfile.communication_tones,
        brand_description: brandProfile.brand_description,
        timestamp: new Date().toISOString()
      },
      identity_and_voice: {
        brand_identity: `${brandProfile.brand_name} este un brand care se diferențiază prin ${brandProfile.personality_traits.slice(0, 2).join(' și ')}.`,
        voice_characteristics: {
          tone: brandProfile.communication_tones.join(', '),
          personality: brandProfile.personality_traits.join(', '),
          values: ["Autenticitate", "Calitate", "Încredere"],
          communication_style: "Direct și empatic, focusat pe nevoile clientului"
        },
        brand_positioning: `Poziționat ca lider în domeniu, ${brandProfile.brand_name} oferă soluții de încredere.`
      },
      kpis_smart: [
        {
          name: "Creșterea awareness-ului brandului",
          description: "Măsurarea creșterii recunoașterii brandului în rândul audiența țintă",
          target_value: "25% creștere",
          measurement_method: "Sondaje de brand awareness și reach organic",
          timeframe: "90 zile",
          responsible: "Marketing Manager",
          specific: "Creșterea awareness-ului cu 25%",
          measurable: "Prin sondaje și metrici de reach",
          achievable: "Bazat pe resurse și buget disponibil",
          relevant: "Esențial pentru obiectivele de business",
          time_bound: "În următoarele 90 de zile"
        }
      ],
      buyer_personas: [
        {
          name: "Clientul Ideal",
          demographics: {
            age_range: "25-45 ani",
            gender: "Mixt",
            location: "Urban, România",
            income: "Mediu-ridicat",
            education: "Studii superioare",
            occupation: "Profesionist"
          },
          psychographics: {
            interests: ["Calitate", "Inovație", "Eficiență"],
            values: ["Autenticitate", "Profesionalism"],
            lifestyle: "Activ, orientat spre rezultate",
            personality_traits: ["Ambicios", "Pragmatic"],
            pain_points: ["Lipsa de timp", "Nevoia de soluții rapide"],
            goals: ["Eficiență", "Calitate"]
          },
          digital_behavior: {
            preferred_platforms: formData.platforms.map(p => availablePlatforms.find(ap => ap.id === p)?.name).filter(Boolean),
            online_activity_time: "2-3 ore pe zi",
            content_preferences: ["Video", "Articole informative"],
            purchase_behavior: "Cercetează înainte de cumpărare"
          }
        }
      ],
      platform_selection_justification: {
        selected_platforms: formData.platforms.map(platformId => {
          const platform = availablePlatforms.find(p => p.id === platformId);
          return {
            platform: platform?.name || platformId,
            justification: `Platformă ideală pentru audiența țintă a brandului ${brandProfile.brand_name}`,
            audience_overlap: "80% suprapunere cu buyer personas",
            expected_roi: "150-200%",
            priority_level: "high"
          };
        }),
        excluded_platforms: availablePlatforms
          .filter(p => !formData.platforms.includes(p.id))
          .map(p => ({
            platform: p.name,
            reason: "Nu se aliniază cu audiența țintă sau obiectivele campaniei"
          }))
      },
      budget_allocation_summary: {
        total_budget: formData.budget,
        allocation_by_channel: formData.platforms.map(platformId => {
          const platform = availablePlatforms.find(p => p.id === platformId);
          return {
            channel: platform?.name || platformId,
            percentage: `${Math.floor(80 / formData.platforms.length)}%`,
            amount: `${Math.floor(parseInt(formData.budget.replace(/\D/g, '') || '1000') * 0.8 / formData.platforms.length)} RON`,
            justification: "Alocare bazată pe potențialul de ROI și audiența țintă"
          };
        }),
        allocation_by_type: {
          content_creation: "40%",
          paid_promotion: "35%",
          tools_and_software: "15%",
          influencer_partnerships: "5%",
          contingency: "5%"
        }
      },
      tactical_plan_per_platform: formData.platforms.map(platformId => {
        const platform = availablePlatforms.find(p => p.id === platformId);
        return {
          platform: platform?.name || platformId,
          strategy: `Strategie adaptată pentru ${platform?.name} folosind vocea brandului ${brandProfile.brand_name}`,
          content_types: ["Postări organice", "Stories", "Video content"],
          posting_frequency: "3-5 postări pe săptămână",
          optimal_posting_times: ["09:00", "18:00"],
          editorial_calendar: {
            month_1: [
              {
                week: 1,
                posts: Array.from({ length: 5 }, (_, i) => ({
                  post_id: `P00${i + 1}`,
                  scheduled_date: `Săptămâna 1, Ziua ${i + 1}, 09:00`,
                  copy: {
                    main_text: `Conținut personalizat pentru ${brandProfile.brand_name} în stilul definit: ${brandProfile.content_example_1.substring(0, 100)}...`,
                    call_to_action: "Află mai multe despre soluțiile noastre",
                    hashtags: [`#${brandProfile.brand_name.replace(/\s+/g, '')}`, "#marketing", "#calitate"]
                  },
                  visual_brief: {
                    type: "imagine",
                    dimensions: "1080x1080px",
                    style_guidelines: "Stil consistent cu identitatea brandului",
                    mandatory_elements: ["Logo", "Culorile brandului"],
                    color_palette: ["#2563eb", "#ffffff"],
                    text_overlay: "Text minimal, focusat pe mesaj"
                  },
                  promotion_budget: "50 RON",
                  target_audience_specific: {
                    demographics: "25-45 ani, urban",
                    interests: ["Business", "Inovație"],
                    behaviors: ["Activi online"],
                    custom_audiences: ["Website visitors", "Email subscribers"]
                  },
                  individual_metrics: {
                    primary_kpi: "Engagement rate",
                    target_reach: "1000 persoane",
                    target_engagement: "5%",
                    target_clicks: "50",
                    target_conversions: "5"
                  },
                  response_protocol: {
                    comment_response_time: "2 ore",
                    message_response_time: "1 oră",
                    escalation_procedure: "Escaladare către manager după 24h",
                    tone_guidelines: "Ton prietenos și profesional, conform vocii brandului"
                  }
                }))
              }
            ]
          }
        };
      }),
      monitoring_and_optimization: {
        weekly_dashboard_metrics: [
          {
            metric: "Reach organic",
            description: "Numărul de persoane care au văzut conținutul organic",
            target_value: "5000 persoane/săptămână",
            measurement_frequency: "Zilnic",
            data_source: "Facebook Insights, Instagram Analytics"
          },
          {
            metric: "Engagement rate",
            description: "Procentajul de interacțiuni față de reach",
            target_value: "4-6%",
            measurement_frequency: "Zilnic",
            data_source: "Native analytics platforms"
          }
        ],
        performance_evaluation_schedule: {
          "7_day_review": {
            focus_areas: ["Performanța conținutului", "Engagement rate"],
            key_metrics: ["Reach", "Impressions", "Engagement"],
            action_items: ["Optimizare conținut slab performant", "Amplificare conținut de succes"]
          },
          "15_day_review": {
            focus_areas: ["ROI campanii plătite", "Calitatea audiența"],
            key_metrics: ["CPC", "CTR", "Conversii"],
            action_items: ["Ajustare targetare", "Optimizare buget"]
          },
          "30_day_review": {
            focus_areas: ["Obiective generale", "Strategia pe termen lung"],
            key_metrics: ["Brand awareness", "Lead generation", "Sales"],
            action_items: ["Revizuire strategie", "Planificare luna următoare"]
          }
        },
        adjustment_recommendations: [
          {
            trigger_condition: "Engagement rate sub 3% pentru 3 zile consecutive",
            recommended_action: "Revizuire tipuri de conținut și optimizare copy",
            implementation_timeline: "24-48 ore",
            expected_impact: "Creștere engagement cu 2-3%"
          }
        ],
        dedicated_responsibilities: [
          {
            role: "Content Creator",
            responsibilities: ["Crearea conținutului", "Programarea postărilor", "Răspunsuri la comentarii"],
            time_allocation: "20 ore/săptămână",
            required_skills: ["Copywriting", "Design grafic", "Social media management"]
          },
          {
            role: "Marketing Manager",
            responsibilities: ["Strategia generală", "Monitorizarea KPI-urilor", "Optimizarea campaniilor"],
            time_allocation: "10 ore/săptămână",
            required_skills: ["Marketing digital", "Analiză date", "Management proiecte"]
          }
        ]
      },
      deliverables: {
        strategic_document: "Document strategic complet cu toate secțiunile planului",
        excel_editorial_calendar: "Calendar editorial în Excel cu toate postările programate",
        creative_briefs: "Brief-uri creative pentru fiecare tip de conținut",
        monitoring_dashboard: "Dashboard pentru monitorizarea performanței în timp real",
        optimization_playbook: "Ghid de optimizare și proceduri de ajustare"
      }
    };
  };

  const isFormValid = () => {
    return formData.objective.trim() !== '' && 
           formData.targetAudience.trim() !== '' && 
           formData.platforms.length > 0 &&
           formData.businessType.trim() !== '';
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
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Plan de Marketing Digital Generat!</h2>
            <p className="text-gray-600">
              Planul tău complet de marketing digital este gata, cu toate detaliile și specificațiile necesare.
            </p>
          </div>
        </Card>

        {/* Plan Overview */}
        <Card className="shadow-lg" animation="slideInLeft" hover="subtle">
          <div className="flex items-center space-x-3 mb-6">
            <div className="p-3 bg-blue-100 rounded-xl">
              <Target className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">{generatedPlan.title}</h3>
              <p className="text-gray-600">Plan de marketing digital complet</p>
            </div>
          </div>

          <div className="prose max-w-none">
            <p className="text-gray-700 leading-relaxed mb-6">{generatedPlan.summary}</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Livrabile incluse:</h4>
                <ul className="space-y-2">
                  <li className="flex items-start space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">Document strategic complet</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">Calendar editorial cu 20-30 postări/platformă</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">Brief-uri creative detaliate</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">Dashboard de monitorizare</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">Ghid de optimizare</span>
                  </li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Platforme incluse:</h4>
                <div className="flex flex-wrap gap-2">
                  {generatedPlan.tactical_plan_per_platform?.map((platform: any, index: number) => (
                    <span 
                      key={index}
                      className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium"
                    >
                      {platform.platform}
                    </span>
                  ))}
                </div>
                
                <div className="mt-4">
                  <h4 className="font-semibold text-gray-900 mb-2">Data livrare:</h4>
                  <p className="text-gray-700">{generatedPlan.delivery_date}</p>
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
              <span>Vezi detaliile complete</span>
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Generator Plan de Marketing Digital</h1>
          <p className="text-gray-600 text-lg">
            Creează un plan complet de marketing digital pentru <strong>{brandProfile.brand_name}</strong>
          </p>
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
              label="Obiectivul principal al campaniei *"
              value={formData.objective}
              onChange={(e) => setFormData(prev => ({ ...prev, objective: e.target.value }))}
              placeholder="ex. Creșterea vânzărilor cu 30% în următoarele 3 luni prin atragerea de clienți noi și fidelizarea celor existenți..."
              rows={4}
              required
            />

            <Textarea
              label="Audiența țintă detaliată *"
              value={formData.targetAudience}
              onChange={(e) => setFormData(prev => ({ ...prev, targetAudience: e.target.value }))}
              placeholder="ex. Femei între 25-40 ani, cu venituri medii-mari, interesate de lifestyle și wellness, active pe social media..."
              rows={4}
              required
            />

            <Input
              label="Tipul de business *"
              value={formData.businessType}
              onChange={(e) => setFormData(prev => ({ ...prev, businessType: e.target.value }))}
              placeholder="ex. E-commerce fashion, Servicii consultanță, Restaurant, etc."
              required
            />

            <Input
              label="Buget total estimat"
              value={formData.budget}
              onChange={(e) => setFormData(prev => ({ ...prev, budget: e.target.value }))}
              placeholder="ex. 10000 RON pentru 3 luni"
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
                <option value="1 lună">1 lună</option>
                <option value="3 luni">3 luni</option>
                <option value="6 luni">6 luni</option>
                <option value="1 an">1 an</option>
              </select>
            </div>

            <Textarea
              label="Analiza competitorilor"
              value={formData.competitorAnalysis}
              onChange={(e) => setFormData(prev => ({ ...prev, competitorAnalysis: e.target.value }))}
              placeholder="Principalii competitori, punctele lor forte/slabe, strategiile lor de marketing..."
              rows={3}
            />
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

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Textarea
              label="Provocări curente"
              value={formData.currentChallenges}
              onChange={(e) => setFormData(prev => ({ ...prev, currentChallenges: e.target.value }))}
              placeholder="Provocările actuale în marketing, limitările de resurse, dificultățile întâmpinate..."
              rows={3}
            />

            <Textarea
              label="Informații adiționale"
              value={formData.additionalInfo}
              onChange={(e) => setFormData(prev => ({ ...prev, additionalInfo: e.target.value }))}
              placeholder="Orice alte detalii relevante pentru campanie (sezonalitate, evenimente speciale, parteneriate, etc.)"
              rows={3}
            />
          </div>
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
              AI-ul va crea un plan complet de marketing digital cu toate detaliile necesare pentru implementare
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
            {loading ? 'Generez planul complet...' : 'Generează Plan de Marketing Digital'}
          </Button>
          
          {!isFormValid() && (
            <p className="text-sm text-gray-500">
              Completează obiectivul, audiența țintă, tipul de business și selectează cel puțin o platformă
            </p>
          )}
        </div>
      </Card>
    </div>
  );
};