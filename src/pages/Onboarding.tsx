import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowRight, ArrowLeft, Sparkles, FileText, Palette, CheckCircle, Wand2, Brain, AlertCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTranslation } from '../hooks/useTranslation';
import { supabase } from '../lib/supabase';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Textarea } from '../components/ui/Textarea';
import { Card } from '../components/ui/Card';

const personalityTraits = [
  'friendly', 'professional', 'casual', 'authoritative',
  'playful', 'sophisticated', 'approachable', 'expert',
  'energetic', 'calm', 'innovative', 'traditional'
];

const toneAttributes = [
  'conversational', 'formal', 'inspiring', 'educational',
  'humorous', 'serious', 'warm', 'direct',
  'supportive', 'confident', 'empathetic', 'bold'
];

export const Onboarding: React.FC = () => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasExistingProfile, setHasExistingProfile] = useState(false);
  const [checkingProfile, setCheckingProfile] = useState(true);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [formData, setFormData] = useState({
    brandName: '',
    brandDescription: '',
    sampleText1: '',
    sampleText2: '',
    sampleText3: '',
    selectedPersonality: [] as string[],
    selectedTone: [] as string[],
  });

  const { user } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();

  // Check if we're coming from a specific source (like Account page)
  const isEditMode = location.state?.editMode || false;

  useEffect(() => {
    const checkExistingProfile = async () => {
      if (!user) return;

      try {
        const { data, error } = await supabase
          .from('brand_profiles')
          .select('*')
          .eq('user_id', user.id);

        if (data && data.length > 0 && !error) {
          setHasExistingProfile(true);
          const profile = data[0];
          setFormData({
            brandName: profile.brand_name || '',
            brandDescription: profile.brand_description || '',
            sampleText1: profile.content_example_1 || '',
            sampleText2: profile.content_example_2 || '',
            sampleText3: '',
            selectedPersonality: profile.personality_traits || [],
            selectedTone: profile.communication_tones || [],
          });
        }
      } catch (error) {
        console.error('Error checking existing profile:', error);
      } finally {
        setCheckingProfile(false);
      }
    };

    checkExistingProfile();
  }, [user]);

  const handlePersonalityToggle = (trait: string) => {
    setFormData(prev => ({
      ...prev,
      selectedPersonality: prev.selectedPersonality.includes(trait)
        ? prev.selectedPersonality.filter(t => t !== trait)
        : [...prev.selectedPersonality, trait]
    }));
  };

  const handleToneToggle = (tone: string) => {
    setFormData(prev => ({
      ...prev,
      selectedTone: prev.selectedTone.includes(tone)
        ? prev.selectedTone.filter(t => t !== tone)
        : [...prev.selectedTone, tone]
    }));
  };

  const handleNext = () => {
    if (step < 4) {
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleSubmit = async () => {
    if (!user) return;

    setLoading(true);
    setSaveSuccess(false);
    
    try {
      if (hasExistingProfile) {
        const { error } = await supabase
          .from('brand_profiles')
          .update({
            brand_name: formData.brandName,
            brand_description: formData.brandDescription,
            content_example_1: formData.sampleText1,
            content_example_2: formData.sampleText2 || null,
            personality_traits: formData.selectedPersonality,
            communication_tones: formData.selectedTone,
            updated_at: new Date().toISOString(),
          })
          .eq('user_id', user.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('brand_profiles')
          .insert({
            user_id: user.id,
            brand_name: formData.brandName,
            brand_description: formData.brandDescription,
            content_example_1: formData.sampleText1,
            content_example_2: formData.sampleText2 || null,
            personality_traits: formData.selectedPersonality,
            communication_tones: formData.selectedTone,
          });

        if (error) throw error;
      }

      setSaveSuccess(true);
      
      // Show success message briefly before redirecting
      setTimeout(() => {
        if (isEditMode) {
          navigate('/app/account', { 
            state: { 
              message: 'Vocea brandului a fost actualizată cu succes!' 
            } 
          });
        } else {
          navigate('/app/dashboard');
        }
      }, 1500);

    } catch (error: any) {
      console.error('Error saving brand profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const isStepValid = () => {
    switch (step) {
      case 1:
        return formData.brandName.trim() !== '' && formData.brandDescription.trim() !== '';
      case 2:
        return formData.sampleText1.trim() !== '';
      case 3:
        return formData.selectedPersonality.length > 0;
      case 4:
        return formData.selectedTone.length > 0;
      default:
        return false;
    }
  };

  if (checkingProfile) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <Card animation="bounceIn" className="p-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Se încarcă profilul brandului...</p>
          </div>
        </Card>
      </div>
    );
  }

  // Success state
  if (saveSuccess) {
    return (
      <div className="max-w-2xl mx-auto">
        <Card className="shadow-2xl border-0 text-center" animation="bounceIn" padding="lg">
          <div className="p-6 bg-gradient-to-r from-green-100 to-blue-100 rounded-2xl mb-6 inline-block">
            <CheckCircle className="h-16 w-16 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            {hasExistingProfile ? 'Vocea brandului actualizată!' : 'Vocea brandului definită!'}
          </h1>
          <p className="text-xl text-gray-600 mb-6">
            {hasExistingProfile 
              ? 'Modificările au fost salvate cu succes. Acum poți genera conținut și mai personalizat.'
              : 'Felicitări! Acum poți începe să generezi conținut de marketing personalizat pentru brandul tău.'
            }
          </p>
          <div className="animate-pulse">
            <p className="text-sm text-gray-500">Redirecționare automată...</p>
          </div>
        </Card>
      </div>
    );
  }

  const stepIcons = [Sparkles, FileText, Palette, CheckCircle];
  const StepIcon = stepIcons[step - 1];

  return (
    <div className="max-w-3xl mx-auto">
      <Card className="shadow-2xl border-0 overflow-hidden" animation="scaleIn">
        {/* Progress Header */}
        <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-blue-700 p-8">
          <div className="flex items-center justify-between text-white mb-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-white/20 rounded-xl micro-scale">
                <Brain className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">
                  {hasExistingProfile ? t('onboarding.updateTitle') : t('onboarding.title')}
                </h1>
                {isEditMode && (
                  <p className="text-blue-100 text-sm mt-1">
                    Editează și îmbunătățește vocea brandului tău
                  </p>
                )}
              </div>
            </div>
            <span className="text-sm bg-white/20 px-4 py-2 rounded-full font-medium">
              {t('onboarding.stepOf', { current: step.toString(), total: '4' })}
            </span>
          </div>
          
          {/* Progress Bar */}
          <div className="bg-white/20 rounded-full h-3 overflow-hidden">
            <div 
              className="bg-white h-3 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${(step / 4) * 100}%` }}
            />
          </div>
        </div>

        <div className="p-8 lg:p-12">
          {/* Welcome Message for New Users */}
          {!hasExistingProfile && step === 1 && !isEditMode && (
            <Card 
              className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200 mb-8" 
              padding="lg"
              animation="slideInLeft"
            >
              <div className="flex items-start space-x-4">
                <div className="p-3 bg-blue-100 rounded-xl micro-scale">
                  <Wand2 className="h-8 w-8 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{t('onboarding.welcomeTitle')}</h3>
                  <p className="text-gray-700 leading-relaxed">
                    {t('onboarding.welcomeSubtitle')}
                  </p>
                </div>
              </div>
            </Card>
          )}

          {/* Edit Mode Notice */}
          {isEditMode && step === 1 && (
            <Card 
              className="bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200 mb-8" 
              padding="lg"
              animation="slideInLeft"
            >
              <div className="flex items-start space-x-4">
                <div className="p-3 bg-amber-100 rounded-xl micro-scale">
                  <AlertCircle className="h-8 w-8 text-amber-600" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Editează vocea brandului</h3>
                  <p className="text-gray-700 leading-relaxed">
                    Poți modifica orice aspect al vocii brandului tău. Schimbările vor fi aplicate imediat pentru tot conținutul viitor generat.
                  </p>
                </div>
              </div>
            </Card>
          )}

          {/* Step Content */}
          <div className="space-y-8">
            <Card className="text-center" animation="bounceIn">
              <div className="p-4 bg-gradient-to-r from-blue-100 to-purple-100 rounded-2xl mb-6 inline-block micro-scale">
                <StepIcon className="h-12 w-12 text-blue-600" />
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-3">
                {t(`onboarding.step${step}Title`)}
              </h2>
              <p className="text-xl text-gray-600 leading-relaxed">
                {t(`onboarding.step${step}Subtitle`)}
              </p>
            </Card>

            {step === 1 && (
              <Card className="max-w-2xl mx-auto" animation="slideInRight" padding="lg">
                <div className="space-y-6">
                  <Input
                    label={t('onboarding.brandName')}
                    value={formData.brandName}
                    onChange={(e) => setFormData(prev => ({ ...prev, brandName: e.target.value }))}
                    placeholder={t('onboarding.brandNamePlaceholder')}
                    required
                  />

                  <Textarea
                    label={t('onboarding.brandDescription')}
                    value={formData.brandDescription}
                    onChange={(e) => setFormData(prev => ({ ...prev, brandDescription: e.target.value }))}
                    placeholder={t('onboarding.brandDescriptionPlaceholder')}
                    rows={4}
                    required
                  />
                </div>
              </Card>
            )}

            {step === 2 && (
              <Card className="max-w-2xl mx-auto" animation="slideInLeft" padding="lg">
                <div className="space-y-6">
                  <Textarea
                    label={t('onboarding.sampleText1')}
                    value={formData.sampleText1}
                    onChange={(e) => setFormData(prev => ({ ...prev, sampleText1: e.target.value }))}
                    placeholder={t('onboarding.sampleText1Placeholder')}
                    rows={4}
                    required
                  />

                  <Textarea
                    label={t('onboarding.sampleText2')}
                    value={formData.sampleText2}
                    onChange={(e) => setFormData(prev => ({ ...prev, sampleText2: e.target.value }))}
                    placeholder={t('onboarding.sampleText2Placeholder')}
                    rows={4}
                  />

                  <Textarea
                    label={t('onboarding.sampleText3')}
                    value={formData.sampleText3}
                    onChange={(e) => setFormData(prev => ({ ...prev, sampleText3: e.target.value }))}
                    placeholder={t('onboarding.sampleText3Placeholder')}
                    rows={4}
                  />
                </div>
              </Card>
            )}

            {step === 3 && (
              <Card className="max-w-4xl mx-auto" animation="scaleIn" padding="lg">
                <div className="mb-6 text-center">
                  <p className="text-gray-600">
                    Selectează {formData.selectedPersonality.length}/12 trăsături care descriu brandul tău
                  </p>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                  {personalityTraits.map((trait, index) => (
                    <button
                      key={trait}
                      onClick={() => handlePersonalityToggle(trait)}
                      className={`
                        p-4 rounded-xl border-2 transition-all duration-200 text-sm font-medium animate-fade-in-up
                        ${formData.selectedPersonality.includes(trait)
                          ? 'border-blue-500 bg-blue-50 text-blue-700 shadow-md transform scale-105'
                          : 'border-gray-200 hover:border-gray-300 text-gray-700 hover:bg-gray-50 hover:shadow-sm'
                        }
                      `}
                      style={{ animationDelay: `${index * 0.05}s` }}
                    >
                      {t(`personalityTraits.${trait}`)}
                    </button>
                  ))}
                </div>
              </Card>
            )}

            {step === 4 && (
              <Card className="max-w-4xl mx-auto" animation="scaleIn" padding="lg">
                <div className="mb-6 text-center">
                  <p className="text-gray-600">
                    Selectează {formData.selectedTone.length}/12 tonuri pentru comunicarea brandului
                  </p>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                  {toneAttributes.map((tone, index) => (
                    <button
                      key={tone}
                      onClick={() => handleToneToggle(tone)}
                      className={`
                        p-4 rounded-xl border-2 transition-all duration-200 text-sm font-medium animate-fade-in-up
                        ${formData.selectedTone.includes(tone)
                          ? 'border-purple-500 bg-purple-50 text-purple-700 shadow-md transform scale-105'
                          : 'border-gray-200 hover:border-gray-300 text-gray-700 hover:bg-gray-50 hover:shadow-sm'
                        }
                      `}
                      style={{ animationDelay: `${index * 0.05}s` }}
                    >
                      {t(`toneAttributes.${tone}`)}
                    </button>
                  ))}
                </div>
              </Card>
            )}
          </div>

          {/* Navigation */}
          <Card className="mt-12 pt-8 border-t border-gray-200" animation="fadeInUp">
            <div className="flex justify-between">
              <Button
                variant="outline"
                onClick={handleBack}
                disabled={step === 1}
                className="flex items-center space-x-2"
                size="lg"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>{t('back')}</span>
              </Button>

              {step < 4 ? (
                <Button
                  onClick={handleNext}
                  disabled={!isStepValid()}
                  className="flex items-center space-x-2"
                  size="lg"
                >
                  <span>{t('next')}</span>
                  <ArrowRight className="h-4 w-4" />
                </Button>
              ) : (
                <Button
                  onClick={handleSubmit}
                  loading={loading}
                  disabled={!isStepValid()}
                  className="flex items-center space-x-2"
                  size="lg"
                >
                  <span>{hasExistingProfile ? t('onboarding.updateProfile') : t('onboarding.completeSetup')}</span>
                  <CheckCircle className="h-4 w-4" />
                </Button>
              )}
            </div>
          </Card>
        </div>
      </Card>
    </div>
  );
};