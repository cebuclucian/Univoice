// Simple translation hook for Romanian/English support
import { useMemo } from 'react';

type TranslationKey = string;

const translations: Record<string, Record<string, string>> = {
  ro: {
    // Navigation
    'nav.dashboard': 'Dashboard',
    'nav.brandVoice': 'Vocea Brandului',
    'nav.account': 'Cont',
    'nav.univoice': 'Univoice',
    
    // Auth
    'auth.signOut': 'Deconectare',
    
    // Common
    'back': 'Înapoi',
    'next': 'Următorul',
    
    // Onboarding
    'onboarding.title': 'Definește vocea brandului tău',
    'onboarding.updateTitle': 'Actualizează vocea brandului',
    'onboarding.stepOf': 'Pasul {current} din {total}',
    'onboarding.welcomeTitle': 'Bine ai venit la Univoice!',
    'onboarding.welcomeSubtitle': 'Să începem prin a defini vocea unică a brandului tău. Acest proces durează doar câteva minute și va face toată diferența în conținutul generat.',
    
    // Step 1
    'onboarding.step1Title': 'Spune-ne despre brandul tău',
    'onboarding.step1Subtitle': 'Ajută-ne să înțelegem esența afacerii tale',
    'onboarding.brandName': 'Numele brandului',
    'onboarding.brandNamePlaceholder': 'ex. Cafeneaua Artizanală',
    'onboarding.brandDescription': 'Descrierea brandului',
    'onboarding.brandDescriptionPlaceholder': 'Descrie în câteva propoziții ce face brandul tău special...',
    
    // Step 2
    'onboarding.step2Title': 'Arată-ne cum scrii',
    'onboarding.step2Subtitle': 'Oferă-ne exemple de conținut scris de tine pentru a învăța stilul tău',
    'onboarding.sampleText1': 'Primul exemplu de text (obligatoriu)',
    'onboarding.sampleText1Placeholder': 'Copiază aici o postare, un email sau orice text scris de tine...',
    'onboarding.sampleText2': 'Al doilea exemplu de text (opțional)',
    'onboarding.sampleText2Placeholder': 'Un alt exemplu de conținut scris de tine...',
    'onboarding.sampleText3': 'Al treilea exemplu de text (opțional)',
    'onboarding.sampleText3Placeholder': 'Încă un exemplu pentru a ne ajuta să înțelegem mai bine stilul tău...',
    
    // Step 3
    'onboarding.step3Title': 'Alege personalitatea brandului',
    'onboarding.step3Subtitle': 'Selectează trăsăturile care descriu cel mai bine brandul tău',
    
    // Step 4
    'onboarding.step4Title': 'Definește tonul comunicării',
    'onboarding.step4Subtitle': 'Cum vrei să sune brandul tău când vorbește cu audiența?',
    
    'onboarding.completeSetup': 'Finalizează configurarea',
    'onboarding.updateProfile': 'Actualizează profilul',
    
    // Personality traits
    'personalityTraits.friendly': 'Prietenos',
    'personalityTraits.professional': 'Profesional',
    'personalityTraits.casual': 'Casual',
    'personalityTraits.authoritative': 'Autoritar',
    'personalityTraits.playful': 'Jucăuș',
    'personalityTraits.sophisticated': 'Sofisticat',
    'personalityTraits.approachable': 'Accesibil',
    'personalityTraits.expert': 'Expert',
    'personalityTraits.energetic': 'Energic',
    'personalityTraits.calm': 'Calm',
    'personalityTraits.innovative': 'Inovator',
    'personalityTraits.traditional': 'Tradițional',
    
    // Tone attributes
    'toneAttributes.conversational': 'Conversațional',
    'toneAttributes.formal': 'Formal',
    'toneAttributes.inspiring': 'Inspirațional',
    'toneAttributes.educational': 'Educațional',
    'toneAttributes.humorous': 'Amuzant',
    'toneAttributes.serious': 'Serios',
    'toneAttributes.warm': 'Cald',
    'toneAttributes.direct': 'Direct',
    'toneAttributes.supportive': 'Susținător',
    'toneAttributes.confident': 'Încrezător',
    'toneAttributes.empathetic': 'Empatic',
    'toneAttributes.bold': 'Îndrăzneț',
  }
};

export const useTranslation = () => {
  const currentLanguage = 'ro'; // Default to Romanian
  
  const t = useMemo(() => {
    return (key: TranslationKey, params?: Record<string, string>) => {
      let translation = translations[currentLanguage]?.[key] || key;
      
      // Replace parameters in translation
      if (params) {
        Object.entries(params).forEach(([param, value]) => {
          translation = translation.replace(`{${param}}`, value);
        });
      }
      
      return translation;
    };
  }, [currentLanguage]);

  return { t };
};