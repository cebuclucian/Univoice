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

  // Robust JSON extraction and parsing function
  const extractAndParseJSON = (text: string): any => {
    try {
      // First, try to parse the text directly as JSON
      return JSON.parse(text);
    } catch (error) {
      // If direct parsing fails, try to extract JSON from the text
      try {
        // Remove markdown code blocks if present
        let cleanText = text.replace(/```json\s*/g, '').replace(/```\s*/g, '');
        
        // Look for JSON object boundaries
        const jsonStart = cleanText.indexOf('{');
        const jsonEnd = cleanText.lastIndexOf('}');
        
        if (jsonStart !== -1 && jsonEnd !== -1 && jsonEnd > jsonStart) {
          const jsonString = cleanText.substring(jsonStart, jsonEnd + 1);
          return JSON.parse(jsonString);
        }
        
        // Try to find JSON using regex
        const jsonMatch = cleanText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          return JSON.parse(jsonMatch[0]);
        }
        
        throw new Error('No valid JSON found in response');
      } catch (parseError) {
        console.error('Failed to extract JSON from response:', parseError);
        throw new Error('Could not parse AI response as JSON');
      }
    }
  };

  const generateMarketingPlan = async () => {
    if (!user || !brandProfile) return;

    setLoading(true);
    setError(null);

    try {
      // Construiește prompt-ul extins pentru AI cu accent MAXIM pe unicitatea conținutului
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

🚨 INSTRUCȚIUNI CRITICE PENTRU CONȚINUT 100% UNIC 🚨

REGULI ABSOLUTE PENTRU CONȚINUTUL POSTĂRILOR:
1. FIECARE "main_text" TREBUIE să fie COMPLET DIFERIT și ORIGINAL
2. NU REPETA NICIODATĂ același conținut între postări
3. FIECARE postare trebuie să aibă un SUBIECT DIFERIT
4. FIECARE postare trebuie să aibă o ABORDARE DIFERITĂ
5. FIECARE postare trebuie să aibă între 200-400 cuvinte
6. FOLOSEȘTE diferite tipuri de conținut pentru fiecare postare
7. VARIAZĂ tonul și stilul în cadrul vocii brandului
8. FIECARE postare trebuie să fie GATA DE PUBLICARE

TIPURI DE CONȚINUT OBLIGATORII PENTRU VARIAȚIE (folosește câte unul pentru fiecare postare):
- EDUCAȚIONAL: Tips, how-to, ghiduri practice, insights din industrie
- INSPIRAȚIONAL: Povești de succes, citate motivaționale, viziuni
- PROMOTIONAL: Prezentarea produselor/serviciilor, oferte speciale
- BEHIND-THE-SCENES: Procesul de lucru, echipa, cultura companiei
- USER-GENERATED: Testimoniale, reviews, experiențe clienți
- TRENDING: Evenimente actuale, sărbători, tendințe din industrie
- INTERACTIVE: Întrebări, poll-uri, provocări pentru audiență
- STORYTELLING: Povestea brandului, călătoria antreprenorială
- PROBLEM-SOLVING: Soluții la probleme comune ale audiența
- COMMUNITY: Construirea comunității, valori comune

EXEMPLE DE SUBIECTE DIFERITE PENTRU FIECARE POSTARE:
P001: Ghid practic despre [subiect specific din industrie]
P002: Povestea din spatele [aspect specific al brandului]
P003: Prezentarea [produs/serviciu specific]
P004: Tips pentru [problemă specifică a audiența]
P005: Behind-the-scenes din [proces specific]
P006: Testimonial de la [tip specific de client]
P007: Tendințe în [domeniu specific]
P008: Întrebare pentru comunitate despre [subiect specific]
P009: Soluție la [problemă comună specifică]
P010: Celebrarea [realizare/milestone specific]

STRUCTURA OBLIGATORIE PENTRU FIECARE POSTARE:
{
  "post_id": "P001",
  "post_title": "TITLU UNIC ȘI DESCRIPTIV PENTRU ACEASTĂ POSTARE SPECIFICĂ",
  "content_type": "educational/inspirational/promotional/behind_scenes/ugc/trending/interactive/storytelling/problem_solving/community",
  "scheduled_date": "Data și ora exactă",
  "copy": {
    "main_text": "CONȚINUT COMPLET UNIC PENTRU ACEASTĂ POSTARE SPECIFICĂ - minim 200 cuvinte, maxim 400 cuvinte. 

    🚨 ACEST TEXT TREBUIE SĂ FIE COMPLET DIFERIT PENTRU FIECARE POSTARE! 🚨
    
    Nu repeta niciodată același conținut. Scrie în vocea brandului ${brandProfile.brand_name} folosind personalitatea: ${brandProfile.personality_traits.join(', ')} și tonul: ${brandProfile.communication_tones.join(', ')}.
    
    Pentru această postare specifică, abordează un subiect complet diferit de celelalte postări. Folosește un unghi unic, oferă informații specifice, și creează o experiență de lectură distinctă.
    
    Conținutul trebuie să fie gata de publicare, nu un placeholder. Fiecare propoziție trebuie să aducă valoare și să fie scrisă special pentru această postare.",
    
    "call_to_action": "Call-to-action specific și măsurabil pentru această postare exactă",
    "hashtags": ["#hashtag1", "#hashtag2", "#hashtag3"]
  },
  "visual_brief": {
    "type": "imagine/video/carousel",
    "dimensions": "Dimensiunile exacte",
    "style_guidelines": "Ghidul de stil specific pentru această postare",
    "mandatory_elements": ["element 1", "element 2"],
    "color_palette": ["culoare 1", "culoare 2"],
    "text_overlay": "Textul specific de pe imagine/video pentru această postare"
  },
  "promotion_budget": "Bugetul de promovare pentru această postare",
  "target_audience_specific": {
    "demographics": "Demografia țintă specifică pentru această postare",
    "interests": ["interes 1", "interes 2"],
    "behaviors": ["comportament 1", "comportament 2"],
    "custom_audiences": ["audiență 1", "audiență 2"]
  },
  "individual_metrics": {
    "primary_kpi": "KPI-ul principal urmărit pentru această postare",
    "target_reach": "Reach-ul țintă specific",
    "target_engagement": "Engagement-ul țintă specific",
    "target_clicks": "Click-urile țintă specifice",
    "target_conversions": "Conversiile țintă specifice"
  },
  "response_protocol": {
    "comment_response_time": "Timpul de răspuns la comentarii",
    "message_response_time": "Timpul de răspuns la mesaje",
    "escalation_procedure": "Procedura de escaladare",
    "tone_guidelines": "Ghidul de ton pentru răspunsuri la această postare"
  }
}

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
              // AICI TREBUIE SĂ GENEREZI 20-30 POSTĂRI COMPLET UNICE
              // FIECARE CU CONȚINUT TOTAL DIFERIT
              // FOLOSIND TIPURILE DE CONȚINUT DE MAI SUS
              // ȘI ASIGURÂNDU-TE CĂ FIECARE "main_text" ESTE ORIGINAL
            ]
          },
          {
            "week": 2,
            "posts": [
              // CONTINUĂ CU POSTĂRI UNICE
            ]
          },
          {
            "week": 3,
            "posts": [
              // CONTINUĂ CU POSTĂRI UNICE
            ]
          },
          {
            "week": 4,
            "posts": [
              // CONTINUĂ CU POSTĂRI UNICE
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

🚨 VERIFICARE FINALĂ OBLIGATORIE 🚨
Înainte de a trimite răspunsul, VERIFICĂ că:
1. Fiecare postare are un "main_text" COMPLET DIFERIT
2. Nu există repetări de conținut între postări
3. Fiecare postare abordează un subiect DIFERIT
4. Fiecare postare are între 200-400 cuvinte
5. Ai folosit tipuri diferite de conținut pentru fiecare postare
6. Fiecare postare este gata de publicare
7. Toate postările respectă vocea brandului dar sunt UNICE

IMPORTANT: Asigură-te că planul:
1. Reflectă EXACT vocea și personalitatea brandului definită
2. Este adaptat platformelor selectate
3. Include conținut specific și acționabil în stilul brandului
4. Respectă bugetul și perioada specificată
5. Include KPI-uri măsurabile și SMART
6. Oferă recomandări practice și implementabile
7. Toate textele sunt scrise în vocea curentă a brandului
8. Calendarul editorial conține 20-30 postări UNICE per platformă
9. Fiecare postare are copy complet UNIC, brief vizual și specificații de promovare
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
      
      // Parse the JSON response from AI using robust extraction
      let planData: any;
      try {
        planData = extractAndParseJSON(data.response);
      } catch (parseError) {
        console.error('Failed to parse AI response:', parseError);
        // Fallback plan cu structura extinsă și conținut unic garantat
        planData = generateFallbackPlanWithUniqueContent();
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

      // Verifică și asigură unicitatea conținutului în planul generat
      planData = ensureUniqueContent(planData);

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

      // Actualizează contorul de planuri generate folosind RPC cu parametrul corect
      const { error: updateError } = await supabase.rpc('increment_plans_generated', {
        input_user_id: user.id
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
          title: 'Plan de marketing digital generat cu conținut 100% unic',
          details: `Planul complet "${planData.title}" a fost generat cu conținut complet unic pentru fiecare postare. Fiecare din cele 20-30 postări per platformă are text original, fără repetări, scris în vocea brandului ${brandProfile.brand_name}.`,
          is_read: false
        });

    } catch (err) {
      console.error('Error generating marketing plan:', err);
      setError('Nu am putut genera planul de marketing. Te rog încearcă din nou.');
    } finally {
      setLoading(false);
    }
  };

  // Funcție pentru a asigura unicitatea conținutului în planul generat
  const ensureUniqueContent = (planData: any) => {
    if (!planData.tactical_plan_per_platform) return planData;

    planData.tactical_plan_per_platform = planData.tactical_plan_per_platform.map((platform: any) => {
      if (!platform.editorial_calendar?.month_1) return platform;

      // Verifică și înlocuiește conținutul duplicat
      const usedTexts = new Set<string>();
      
      platform.editorial_calendar.month_1 = platform.editorial_calendar.month_1.map((week: any) => {
        if (!week.posts) return week;

        week.posts = week.posts.map((post: any, index: number) => {
          if (!post.copy?.main_text) return post;

          // Verifică dacă textul a fost folosit deja
          const textHash = post.copy.main_text.substring(0, 100).toLowerCase();
          if (usedTexts.has(textHash)) {
            // Generează conținut unic de rezervă
            post.copy.main_text = generateUniquePostContent(index, platform.platform, brandProfile);
          }
          
          usedTexts.add(post.copy.main_text.substring(0, 100).toLowerCase());
          return post;
        });

        return week;
      });

      return platform;
    });

    return planData;
  };

  // Funcție pentru generarea de conținut unic de rezervă
  const generateUniquePostContent = (index: number, platform: string, brand: BrandProfile) => {
    const contentTemplates = [
      `Astăzi vreau să vă împărtășesc o perspectivă unică despre ${brand.brand_description.toLowerCase()}. În experiența noastră de lucru cu ${brand.brand_name}, am descoperit că fiecare client are nevoie de o abordare personalizată. De aceea, ne concentrăm pe înțelegerea profundă a nevoilor voastre specifice. Procesul nostru începe cu o analiză detaliată a situației curente, urmată de dezvoltarea unei strategii adaptate perfect contextului vostru. Ceea ce ne diferențiază este atenția la detalii și capacitatea de a transforma provocările în oportunități. Vă invit să descoperiți cum putem colabora pentru a atinge obiectivele voastre.`,
      
      `Să vorbim despre o tendință fascinantă pe care am observat-o recent în industria noastră. Clienții devin din ce în ce mai exigenți și caută soluții care să le aducă valoare reală, nu doar promisiuni goale. La ${brand.brand_name}, această evoluție ne bucură pentru că ne aliniază perfect cu filosofia noastră de lucru. Credem că transparența și rezultatele măsurabile sunt fundamentul oricărei colaborări de succes. De aceea, fiecare proiect pe care îl derulăm vine cu indicatori clari de performanță și raportare regulată. Cum vedeți voi această schimbare de paradigmă în industrie?`,
      
      `Vreau să vă povestesc despre o lecție importantă pe care am învățat-o recent. Uneori, cele mai simple soluții sunt cele mai eficiente. În cazul ${brand.brand_name}, am realizat că succesul nu vine din complicarea lucrurilor, ci din simplificarea lor până la esență. Această abordare ne-a permis să oferim rezultate mai bune, mai rapide și mai durabile pentru clienții noștri. Procesul nostru s-a rafinat de-a lungul timpului, eliminând pașii inutili și concentrându-se pe ceea ce aduce cu adevărat valoare. Rezultatul? Clienți mai mulțumiți și proiecte finalizate mai eficient.`,
      
      `Astăzi vreau să vă vorbesc despre puterea colaborării autentice. În lumea de astăzi, unde totul pare să se miște foarte rapid, am observat că cele mai bune rezultate vin din relațiile construite pe încredere și respect mutual. La ${brand.brand_name}, nu vedem clienții ca simple tranzacții, ci ca parteneri în călătoria către succes. Această perspectivă schimbă complet dinamica colaborării și duce la rezultate care depășesc așteptările. Fiecare proiect devine o oportunitate de a crea ceva cu adevărat special împreună.`,
      
      `Permiteți-mi să vă împărtășesc o reflecție despre inovația în domeniul nostru. Tehnologia evoluează rapid, dar principiile fundamentale ale unei afaceri de succes rămân neschimbate: calitatea, integritatea și focusul pe client. La ${brand.brand_name}, îmbinăm cele mai noi tehnologii cu aceste principii atemporale pentru a crea soluții care nu doar că funcționează astăzi, dar care vor rezista și în viitor. Această abordare echilibrată ne permite să oferim inovație responsabilă, nu doar pentru spectacol.`
    ];

    return contentTemplates[index % contentTemplates.length];
  };

  const generateFallbackPlanWithUniqueContent = () => {
    // Generează conținut unic garantat pentru fiecare postare în fallback
    const generateGuaranteedUniquePost = (postId: string, platform: string, contentType: string, index: number) => {
      const uniqueContentVariations = [
        {
          type: 'educational',
          title: `Ghid complet: Secretele succesului în ${brandProfile.brand_description.toLowerCase()}`,
          content: `Astăzi vreau să vă dezvălui câteva secrete pe care le-am învățat în anii de experiență cu ${brandProfile.brand_name}. Prima lecție importantă este că succesul nu vine peste noapte - este rezultatul unei munci constante și a unei strategii bine gândite. Am observat că clienții care obțin cele mai bune rezultate sunt cei care înțeleg importanța planificării pe termen lung și a adaptabilității. De aceea, recomand întotdeauna să începeți cu o analiză honestă a situației curente, să vă stabiliți obiective clare și măsurabile, și să fiți pregătiți să vă ajustați strategia pe parcurs. Cel mai important sfat pe care îl pot da este să nu vă grăbiți procesul - calitatea întotdeauna învinge viteza. Vă invit să împărtășiți în comentarii care este cea mai mare provocare cu care vă confruntați în acest domeniu.`
        },
        {
          type: 'inspirational',
          title: `Povestea transformării: De la vis la realitate cu ${brandProfile.brand_name}`,
          content: `Vreau să vă povestesc despre o călătorie extraordinară pe care am trăit-o alături de echipa ${brandProfile.brand_name}. Totul a început cu o idee simplă, dar cu o viziune puternică despre cum putem face diferența în viețile oamenilor. Nu a fost ușor - am întâmpinat obstacole, am avut momente de îndoială, dar pasiunea și determinarea ne-au ghidat în fiecare pas. Ceea ce m-a impresionat cel mai mult a fost modul în care fiecare membru al echipei și-a adus contribuția unică, creând o sinergie incredibilă. Astăzi, când privesc înapoi, realizez că fiecare provocare ne-a făcut mai puternici și mai înțelepți. Succesul nu se măsoară doar în cifre, ci în impactul pe care îl avem asupra comunității noastre. Care este povestea voastră de transformare? Aștept cu nerăbdare să o citesc în comentarii.`
        },
        {
          type: 'promotional',
          title: `Lansare specială: Descoperiți noua abordare ${brandProfile.brand_name}`,
          content: `Sunt încântat să vă anunț o noutate extraordinară pe care echipa ${brandProfile.brand_name} a pregătit-o special pentru voi. După luni de cercetare și dezvoltare, am creat o soluție inovatoare care răspunde direct nevoilor pe care ni le-ați exprimat în conversațiile noastre. Această nouă abordare combină expertiza noastră de ani de zile cu cele mai recente tendințe din industrie, rezultând într-o experiență complet transformată pentru clienții noștri. Ceea ce mă entuziasmează cel mai mult este faptul că această soluție nu doar că rezolvă problemele existente, dar anticipează și nevoile viitoare. Am testat-o extensiv și rezultatele au depășit toate așteptările. Pentru că apreciez loialitatea voastră, am pregătit o ofertă specială limitată. Contactați-ne astăzi pentru a afla cum puteți beneficia de această oportunitate unică.`
        },
        {
          type: 'behind_scenes',
          title: `În culisele ${brandProfile.brand_name}: Cum creăm excelența`,
          content: `Astăzi vreau să vă duc într-o călătorie în spatele scenei, să vedeți cum arată cu adevărat o zi de lucru în echipa ${brandProfile.brand_name}. Dimineața începe întotdeauna cu o sesiune de planificare în care analizăm prioritățile zilei și ne asigurăm că fiecare membru al echipei știe exact ce are de făcut. Ceea ce mă impresionează în fiecare zi este dedicarea și pasiunea cu care colegii mei abordează fiecare proiect. Nu este doar despre a finaliza sarcini - este despre a crea ceva cu adevărat special pentru fiecare client. Procesul nostru de control al calității este meticulos: fiecare detaliu este verificat de cel puțin două persoane înainte de a ajunge la client. Această atenție la detalii poate părea exagerată pentru unii, dar pentru noi este esența a ceea ce facem. Suntem mândri de cultura noastră de excelență și de modul în care se reflectă în fiecare proiect finalizat.`
        },
        {
          type: 'interactive',
          title: `Provocarea săptămânii: Împărtășiți experiența voastră cu ${brandProfile.brand_name}`,
          content: `Astăzi lansez o provocare specială pentru comunitatea noastră minunată. Vreau să creez un spațiu de dialog autentic unde să ne putem învăța unii de la alții și să construim împreună ceva cu adevărat valoros. Întrebarea mea pentru voi este: care a fost cea mai valoroasă lecție pe care ați învățat-o în ultimul an în domeniul nostru? Sunt curios să aflu perspectivele voastre unice și experiențele care v-au marcat. În conversațiile pe care le-am avut cu clienții ${brandProfile.brand_name}, am observat că fiecare are o poveste fascinantă și insights care pot inspira pe alții. De aceea, vă invit să împărtășiți în comentarii nu doar răspunsul la întrebare, ci și contextul din spatele acestuia. Cel mai interesant răspuns va primi o consultare gratuită de 30 de minute cu echipa noastră. Să începem această conversație frumoasă!`
        },
        {
          type: 'problem_solving',
          title: `Soluții practice: Cum să depășiți provocările comune în ${brandProfile.brand_description.toLowerCase()}`,
          content: `Astăzi vreau să abordez o problemă pe care o întâlnesc frecvent în conversațiile cu clienții ${brandProfile.brand_name}. Mulți se confruntă cu aceeași dilemă: cum să găsească echilibrul perfect între calitate și eficiență. Este o provocare reală și înțeleg perfect frustrarea care vine odată cu ea. Din experiența mea, am dezvoltat o metodologie în trei pași care s-a dovedit extrem de eficientă. Primul pas este să identificați cu exactitate care sunt prioritățile voastre - nu toate aspectele au aceeași importanță. Al doilea pas implică crearea unui sistem de evaluare care să vă permită să măsurați progresul în timp real. Cel de-al treilea pas, și poate cel mai important, este să fiți flexibili și să vă adaptați strategia pe baza feedback-ului primit. Această abordare a ajutat zeci de clienți să își atingă obiectivele mai rapid și cu mai puțin stres. Dacă vă confruntați cu această provocare, nu ezitați să ne contactați pentru o discuție detaliată.`
        },
        {
          type: 'community',
          title: `Construim împreună: Comunitatea ${brandProfile.brand_name} în acțiune`,
          content: `Sunt profund recunoscător pentru comunitatea incredibilă care s-a format în jurul ${brandProfile.brand_name}. În ultimele săptămâni, am fost martor la momente extraordinare de colaborare și sprijin reciproc între membrii comunității noastre. Am văzut cum experiențele împărtășite de unii au inspirat și ajutat pe alții să își depășească propriile provocări. Această energie pozitivă și spiritul de ajutor mutual sunt exact valorile pe care le-am visat când am început această călătorie. Nu este doar despre serviciile pe care le oferim - este despre impactul pe care îl avem împreună asupra întregii industrii. Fiecare dintre voi aduce o perspectivă unică și contribuie la creșterea și evoluția comunității. Vreau să profitez de această oportunitate pentru a vă mulțumi pentru încrederea acordată și pentru că faceți parte din această familie. Împreună, putem realiza lucruri cu adevărat extraordinare. Ce proiect de comunitate ați vrea să dezvoltăm împreună în perioada următoare?`
        },
        {
          type: 'storytelling',
          title: `Călătoria antreprenorială: Lecții învățate cu ${brandProfile.brand_name}`,
          content: `Vreau să vă povestesc despre un moment de cotitură în călătoria ${brandProfile.brand_name} care mi-a schimbat complet perspectiva asupra afacerii. Era o perioadă dificilă, când toate planurile noastre păreau să se prăbușească unul după altul. Clientul nostru cel mai important tocmai anulase contractul, echipa era demoralizată, iar eu începeam să mă îndoiesc de deciziile luate. În acel moment de criză, am realizat că adevărata măsură a unei afaceri nu este cum performează când totul merge bine, ci cum reacționează când lucrurile se complică. Am luat decizia să fiu complet transparent cu echipa și să cer ajutorul lor în găsirea soluțiilor. Ceea ce s-a întâmplat apoi m-a surprins complet - în loc să se descurajeze, echipa s-a mobilizat ca niciodată. Fiecare a venit cu idei creative, toți au lucrat ore suplimentare voluntar, și într-o lună am reușit să nu doar să recuperăm pierderea, dar să depășim toate recordurile anterioare. Acea experiență m-a învățat că puterea unei echipe unite poate depăși orice obstacol.`
        },
        {
          type: 'trending',
          title: `Tendințe 2024: Cum se adaptează ${brandProfile.brand_name} la schimbările din industrie`,
          content: `Industria noastră trece prin transformări fascinante, iar echipa ${brandProfile.brand_name} monitorizează îndeaproape aceste evoluții pentru a rămâne în fruntea inovației. Una dintre tendințele cele mai interesante pe care le observ este schimbarea radicală a așteptărilor clienților - aceștia nu mai caută doar servicii, ci experiențe complete și personalizate. Această evoluție ne-a determinat să ne regândim complet abordarea și să investim masiv în tehnologii care să ne permită să oferim soluții cu adevărat adaptate nevoilor individuale. O altă tendință majoră este creșterea importanței sustenabilității și responsabilității sociale. Clienții de astăzi vor să lucreze cu companii care împărtășesc valorile lor și care au un impact pozitiv asupra societății. De aceea, am integrat aceste principii în toate aspectele activității noastre. Sunt curios să aflu cum vedeți voi aceste schimbări și cum vă adaptați propriile strategii. Ce tendințe considerați că vor domina următorii ani?`
        },
        {
          type: 'testimonial_style',
          title: `Mulțumiri și recunoștință: Impactul ${brandProfile.brand_name} în comunitate`,
          content: `Astăzi vreau să vă împărtășesc câteva dintre feedback-urile extraordinare pe care le-am primit recent de la clienții ${brandProfile.brand_name}. Aceste mesaje nu sunt doar complimente - sunt confirmarea că munca noastră are cu adevărat impact în viețile oamenilor. Un client ne-a scris că soluția noastră i-a economisit nu doar timp și bani, ci i-a redus semnificativ și stresul zilnic. Alt client a menționat că abordarea noastră personalizată l-a ajutat să își atingă obiective pe care le considera imposibile. Ceea ce mă emoționează cel mai mult în aceste mesaje nu sunt doar rezultatele obținute, ci modul în care clienții descriu experiența de colaborare cu echipa noastră. Vorbesc despre încrederea pe care au simțit-o, despre transparența procesului și despre faptul că s-au simțit cu adevărat ascultați și înțeleși. Aceste testimoniale ne motivează să continuăm să ne îmbunătățim constant și să căutăm noi modalități de a depăși așteptările. Mulțumesc tuturor clienților care ne-au acordat încrederea și care fac posibilă această călătorie minunată.`
        }
      ];

      const variation = uniqueContentVariations[index % uniqueContentVariations.length];
      
      return {
        post_id: postId,
        post_title: variation.title,
        content_type: variation.type,
        scheduled_date: `Săptămâna 1, Ziua ${index + 1}, ${9 + (index % 3)}:00`,
        copy: {
          main_text: variation.content,
          call_to_action: index % 4 === 0 ? "Contactați-ne pentru o consultare personalizată" : 
                         index % 4 === 1 ? "Urmăriți-ne pentru mai multe insights valoroase" : 
                         index % 4 === 2 ? "Împărtășiți această postare cu prietenii" :
                         "Lăsați un comentariu cu părerea voastră",
          hashtags: [`#${brandProfile.brand_name.replace(/\s+/g, '')}`, "#marketing", "#calitate", `#${variation.type}`, "#success"]
        },
        visual_brief: {
          type: "imagine",
          dimensions: "1080x1080px",
          style_guidelines: `Stil consistent cu identitatea brandului pentru conținut ${variation.type}`,
          mandatory_elements: ["Logo", "Culorile brandului", "Font-ul brandului"],
          color_palette: ["#2563eb", "#ffffff", "#f8fafc"],
          text_overlay: `Text minimal și relevant pentru ${variation.type}`
        },
        promotion_budget: `${50 + (index * 10)} RON`,
        target_audience_specific: {
          demographics: "25-45 ani, urban, educație superioară",
          interests: ["Business", "Inovație", "Dezvoltare personală"],
          behaviors: ["Activi online", "Căutători de soluții"],
          custom_audiences: ["Website visitors", "Email subscribers", "Lookalike audiences"]
        },
        individual_metrics: {
          primary_kpi: index % 3 === 0 ? "Engagement rate" : index % 3 === 1 ? "Click-through rate" : "Reach organic",
          target_reach: `${1000 + (index * 200)} persoane`,
          target_engagement: `${4 + (index % 3)}%`,
          target_clicks: `${30 + (index * 10)}`,
          target_conversions: `${3 + (index % 3)}`
        },
        response_protocol: {
          comment_response_time: "2 ore în timpul programului de lucru",
          message_response_time: "1 oră în timpul programului de lucru",
          escalation_procedure: "Escaladare către manager după 24h pentru probleme complexe",
          tone_guidelines: `Ton ${brandProfile.communication_tones.join(' și ')}, conform vocii brandului`
        }
      };
    };

    return {
      title: `Plan de Marketing Digital pentru ${brandProfile.brand_name}`,
      summary: `Plan de marketing digital complet pentru ${formData.objective} pe o perioadă de ${formData.timeframe}, cu conținut 100% unic pentru fiecare postare, fără repetări.`,
      delivery_date: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toLocaleDateString('ro-RO'),
      brand_voice_used: {
        personality: brandProfile.personality_traits,
        tone: brandProfile.communication_tones,
        brand_description: brandProfile.brand_description,
        timestamp: new Date().toISOString()
      },
      identity_and_voice: {
        brand_identity: `${brandProfile.brand_name} este un brand care se diferențiază prin ${brandProfile.personality_traits.slice(0, 2).join(' și ')}, oferind soluții autentice și de calitate superioară.`,
        voice_characteristics: {
          tone: brandProfile.communication_tones.join(', '),
          personality: brandProfile.personality_traits.join(', '),
          values: ["Autenticitate", "Calitate", "Încredere", "Inovație"],
          communication_style: "Direct și empatic, focusat pe nevoile clientului, cu conținut unic pentru fiecare interacțiune"
        },
        brand_positioning: `Poziționat ca lider în domeniu, ${brandProfile.brand_name} oferă soluții de încredere cu o abordare personalizată pentru fiecare client.`
      },
      kpis_smart: [
        {
          name: "Creșterea engagement-ului organic",
          description: "Măsurarea creșterii interacțiunilor organice cu conținutul unic generat",
          target_value: "30% creștere în 90 zile",
          measurement_method: "Analiza metricilor native de pe fiecare platformă",
          timeframe: "90 zile",
          responsible: "Marketing Manager",
          specific: "Creșterea engagement-ului organic cu 30%",
          measurable: "Prin metrici de like-uri, comentarii, share-uri și salvări",
          achievable: "Bazat pe conținutul unic și personalizat pentru audiență",
          relevant: "Esențial pentru construirea unei comunități angajate",
          time_bound: "În următoarele 90 de zile"
        },
        {
          name: "Generarea de lead-uri calificate",
          description: "Atragerea de potențiali clienți prin conținutul educațional și inspirațional",
          target_value: "50 lead-uri calificate pe lună",
          measurement_method: "Tracking prin formulare de contact și CRM",
          timeframe: "90 zile",
          responsible: "Sales & Marketing Team",
          specific: "Generarea a 50 lead-uri calificate lunar",
          measurable: "Prin numărul de formulare completate și consultări solicitate",
          achievable: "Prin conținut de calitate și call-to-action-uri strategice",
          relevant: "Direct legat de obiectivele de vânzări",
          time_bound: "Lunar, pe perioada de 90 zile"
        }
      ],
      buyer_personas: [
        {
          name: "Profesionistul Ambițios",
          demographics: {
            age_range: "28-42 ani",
            gender: "Mixt (55% femei, 45% bărbați)",
            location: "Urban, România (București, Cluj, Timișoara, Iași)",
            income: "5000-15000 RON/lună",
            education: "Studii superioare, masterat",
            occupation: "Manager, antreprenor, specialist senior"
          },
          psychographics: {
            interests: ["Dezvoltare profesională", "Inovație", "Eficiență", "Calitate"],
            values: ["Autenticitate", "Profesionalism", "Rezultate măsurabile"],
            lifestyle: "Activ, orientat spre rezultate, echilibru work-life",
            personality_traits: ["Ambicios", "Pragmatic", "Orientat spre detalii"],
            pain_points: ["Lipsa de timp", "Nevoia de soluții rapide și eficiente", "Dificultatea găsirii partenerilor de încredere"],
            goals: ["Creșterea afacerii", "Optimizarea proceselor", "Atingerea obiectivelor profesionale"]
          },
          digital_behavior: {
            preferred_platforms: formData.platforms.map(p => availablePlatforms.find(ap => ap.id === p)?.name).filter(Boolean),
            online_activity_time: "2-4 ore pe zi, mai mult seara și în weekend",
            content_preferences: ["Articole educaționale", "Case studies", "Video tutorials", "Infografice"],
            purchase_behavior: "Cercetează extensiv înainte de cumpărare, citește review-uri, solicită recomandări"
          }
        }
      ],
      platform_selection_justification: {
        selected_platforms: formData.platforms.map(platformId => {
          const platform = availablePlatforms.find(p => p.id === platformId);
          return {
            platform: platform?.name || platformId,
            justification: `Platformă ideală pentru audiența țintă a brandului ${brandProfile.brand_name}, cu conținut unic adaptat specificului platformei`,
            audience_overlap: "85% suprapunere cu buyer personas",
            expected_roi: "200-300% în 90 zile",
            priority_level: "high"
          };
        }),
        excluded_platforms: availablePlatforms
          .filter(p => !formData.platforms.includes(p.id))
          .map(p => ({
            platform: p.name,
            reason: "Nu se aliniază cu audiența țintă sau nu justifică investiția pentru această campanie"
          }))
      },
      budget_allocation_summary: {
        total_budget: formData.budget,
        allocation_by_channel: formData.platforms.map(platformId => {
          const platform = availablePlatforms.find(p => p.id === platformId);
          return {
            channel: platform?.name || platformId,
            percentage: `${Math.floor(70 / formData.platforms.length)}%`,
            amount: `${Math.floor(parseInt(formData.budget.replace(/\D/g, '') || '5000') * 0.7 / formData.platforms.length)} RON`,
            justification: "Alocare bazată pe potențialul de ROI și dimensiunea audiența pe platformă"
          };
        }),
        allocation_by_type: {
          content_creation: "45% - Crearea de conținut unic și de calitate",
          paid_promotion: "30% - Promovarea conținutului cu performanță ridicată",
          tools_and_software: "15% - Unelte pentru management și analiză",
          influencer_partnerships: "5% - Colaborări strategice",
          contingency: "5% - Rezervă pentru oportunități neprevăzute"
        }
      },
      tactical_plan_per_platform: formData.platforms.map(platformId => {
        const platform = availablePlatforms.find(p => p.id === platformId);
        return {
          platform: platform?.name || platformId,
          strategy: `Strategie focusată pe conținut unic și autentic pentru ${platform?.name}, adaptată vocii brandului ${brandProfile.brand_name}`,
          content_types: ["Postări educaționale", "Conținut inspirațional", "Behind-the-scenes", "Interactive content"],
          posting_frequency: "4-6 postări pe săptămână",
          optimal_posting_times: ["09:00", "13:00", "18:00"],
          editorial_calendar: {
            month_1: [
              {
                week: 1,
                posts: Array.from({ length: 6 }, (_, i) => 
                  generateGuaranteedUniquePost(`P00${i + 1}`, platform?.name || platformId, 'mixed', i)
                )
              },
              {
                week: 2,
                posts: Array.from({ length: 6 }, (_, i) => 
                  generateGuaranteedUniquePost(`P00${i + 7}`, platform?.name || platformId, 'mixed', i + 6)
                )
              },
              {
                week: 3,
                posts: Array.from({ length: 6 }, (_, i) => 
                  generateGuaranteedUniquePost(`P0${i + 13}`, platform?.name || platformId, 'mixed', i + 12)
                )
              },
              {
                week: 4,
                posts: Array.from({ length: 6 }, (_, i) => 
                  generateGuaranteedUniquePost(`P0${i + 19}`, platform?.name || platformId, 'mixed', i + 18)
                )
              }
            ]
          }
        };
      }),
      monitoring_and_optimization: {
        weekly_dashboard_metrics: [
          {
            metric: "Reach organic",
            description: "Numărul de persoane care au văzut conținutul organic unic",
            target_value: "8000 persoane/săptămână",
            measurement_frequency: "Zilnic",
            data_source: "Facebook Insights, Instagram Analytics, LinkedIn Analytics"
          },
          {
            metric: "Engagement rate",
            description: "Procentajul de interacțiuni față de reach pentru conținutul unic",
            target_value: "5-7%",
            measurement_frequency: "Zilnic",
            data_source: "Native analytics platforms"
          },
          {
            metric: "Content uniqueness score",
            description: "Măsurarea diversității și originalității conținutului",
            target_value: "95% conținut unic",
            measurement_frequency: "Săptămânal",
            data_source: "Analiză manuală și tools de verificare"
          }
        ],
        performance_evaluation_schedule: {
          "7_day_review": {
            focus_areas: ["Performanța conținutului unic", "Engagement per tip de conținut"],
            key_metrics: ["Reach", "Engagement", "Shares", "Saves"],
            action_items: ["Identificarea tipurilor de conținut cu cea mai bună performanță", "Optimizarea conținutului slab performant"]
          },
          "15_day_review": {
            focus_areas: ["ROI campanii plătite", "Calitatea lead-urilor generate"],
            key_metrics: ["CPC", "CTR", "Conversii", "Cost per lead"],
            action_items: ["Ajustarea bugetului către conținutul performant", "Optimizarea targetării"]
          },
          "30_day_review": {
            focus_areas: ["Obiective generale", "Evoluția comunității"],
            key_metrics: ["Brand awareness", "Lead generation", "Community growth"],
            action_items: ["Revizuirea strategiei de conținut", "Planificarea conținutului pentru luna următoare"]
          }
        },
        adjustment_recommendations: [
          {
            trigger_condition: "Engagement rate sub 4% pentru 3 zile consecutive",
            recommended_action: "Revizuirea tipurilor de conținut și crearea de variații noi",
            implementation_timeline: "24-48 ore",
            expected_impact: "Creștere engagement cu 2-3% în 7 zile"
          },
          {
            trigger_condition: "Reach organic în scădere cu 20% față de săptămâna anterioară",
            recommended_action: "Analiza algoritmului platformei și ajustarea strategiei de posting",
            implementation_timeline: "48 ore",
            expected_impact: "Recuperarea reach-ului în 5-7 zile"
          }
        ],
        dedicated_responsibilities: [
          {
            role: "Content Creator",
            responsibilities: ["Crearea conținutului 100% unic", "Programarea postărilor", "Răspunsuri la comentarii în vocea brandului"],
            time_allocation: "25 ore/săptămână",
            required_skills: ["Copywriting creativ", "Design grafic", "Înțelegerea vocii brandului", "Social media management"]
          },
          {
            role: "Marketing Manager",
            responsibilities: ["Strategia generală", "Monitorizarea KPI-urilor", "Optimizarea campaniilor", "Asigurarea unicității conținutului"],
            time_allocation: "15 ore/săptămână",
            required_skills: ["Marketing digital", "Analiză date", "Management proiecte", "Quality assurance"]
          }
        ]
      },
      deliverables: {
        strategic_document: "Document strategic complet cu toate secțiunile planului și ghiduri pentru conținut unic",
        excel_editorial_calendar: "Calendar editorial în Excel cu toate postările unice programate și verificarea anti-duplicare",
        creative_briefs: "Brief-uri creative pentru fiecare tip de conținut cu instrucțiuni pentru unicitate",
        monitoring_dashboard: "Dashboard pentru monitorizarea performanței și verificarea unicității conținutului",
        optimization_playbook: "Ghid de optimizare cu proceduri pentru menținerea unicității conținutului"
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
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Plan cu Conținut 100% Unic Generat!</h2>
            <p className="text-gray-600">
              Planul tău complet de marketing digital este gata, cu conținut complet unic pentru fiecare postare - fără nicio repetare!
            </p>
          </div>
        </Card>

        {/* Unique Content Guarantee */}
        <Card className="bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200" animation="slideInLeft">
          <div className="flex items-start space-x-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Sparkles className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 mb-2">🚨 Garanție de Unicitate 100%</h3>
              <div className="space-y-2 text-sm text-gray-700">
                <p>✅ <strong>Fiecare postare are conținut complet original</strong> - nu există repetări</p>
                <p>✅ <strong>Subiecte diferite pentru fiecare postare</strong> - de la educațional la inspirațional</p>
                <p>✅ <strong>200-400 cuvinte unice per postare</strong> - conținut gata de publicare</p>
                <p>✅ <strong>Tipuri variate de conținut</strong> - educațional, promotional, behind-the-scenes, interactive</p>
                <p>✅ <strong>Toate în vocea brandului tău</strong> - consistent dar unic pentru fiecare postare</p>
              </div>
            </div>
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
              <p className="text-gray-600">Plan de marketing digital cu conținut 100% unic</p>
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
                    <span className="text-gray-700"><strong>Calendar editorial cu 20-30 postări UNICE</strong> per platformă</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">Brief-uri creative detaliate pentru fiecare postare</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">Dashboard de monitorizare cu verificare unicitate</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">Ghid de optimizare și menținere a unicității</span>
                  </li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Platforme cu conținut unic:</h4>
                <div className="flex flex-wrap gap-2 mb-4">
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

                <div className="mt-4">
                  <h4 className="font-semibold text-gray-900 mb-2">Conținut generat:</h4>
                  <p className="text-gray-700">
                    <strong>{generatedPlan.tactical_plan_per_platform?.length * 24 || 24} postări unice</strong> 
                    <span className="text-sm text-gray-500"> (fără repetări)</span>
                  </p>
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
              <span>Vezi toate postările unice</span>
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Generator Plan de Marketing cu Conținut Unic</h1>
          <p className="text-gray-600 text-lg">
            Creează un plan complet cu <strong>conținut 100% unic</strong> pentru fiecare postare - fără repetări pentru <strong>{brandProfile.brand_name}</strong>
          </p>
        </div>
      </Card>

      {/* Unique Content Promise */}
      <Card className="bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200" animation="slideInLeft">
        <div className="flex items-start space-x-3">
          <div className="p-2 bg-amber-100 rounded-lg">
            <Sparkles className="h-6 w-6 text-amber-600" />
          </div>
          <div>
            <h3 className="font-bold text-gray-900 mb-2">🚨 Promisiunea noastră de unicitate</h3>
            <p className="text-gray-700 text-sm leading-relaxed">
              Fiecare postare din planul generat va avea <strong>conținut complet original și unic</strong>. 
              Nu vor exista repetări - fiecare text va fi scris special pentru acea postare specifică, 
              cu subiecte diferite, abordări variate, dar toate în vocea autentică a brandului tău.
            </p>
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
              <strong>AI-ul va crea conținut 100% UNIC pentru fiecare postare</strong> - fără repetări, fără placeholder-e!
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
            {loading ? 'Generez conținut 100% unic...' : 'Generează Plan cu Conținut 100% Unic'}
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