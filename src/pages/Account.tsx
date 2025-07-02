import React, { useState, useEffect } from 'react';
import { User, Mail, Calendar, Crown, Settings, Shield, Bell, CreditCard, Edit3, Sparkles } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useLocation, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card } from '../components/ui/Card';

interface UserProfile {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  role: string;
  updated_at: string | null;
}

interface BrandProfile {
  id: string;
  brand_name: string;
  brand_description: string;
  personality_traits: string[];
  communication_tones: string[];
  created_at: string;
  updated_at: string;
}

interface Subscription {
  id: string;
  plan: string | null;
  status: string | null;
  stripe_customer_id: string | null;
  plans_generated_this_month: number | null;
  content_generated_this_month: number | null;
}

export const Account: React.FC = () => {
  const { user, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [brandProfile, setBrandProfile] = useState<BrandProfile | null>(null);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [formData, setFormData] = useState({
    fullName: '',
    email: ''
  });

  // Check for success message from brand voice update
  useEffect(() => {
    if (location.state?.message) {
      setSuccessMessage(location.state.message);
      // Clear the message after showing it
      setTimeout(() => setSuccessMessage(''), 5000);
      // Clear the state to prevent showing the message again on refresh
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  useEffect(() => {
    const fetchUserData = async () => {
      if (!user) return;

      try {
        // Fetch user profile
        const { data: profileData, error: profileError } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (profileData && !profileError) {
          setProfile(profileData);
          setFormData({
            fullName: profileData.full_name || '',
            email: user.email || ''
          });
        }

        // Fetch brand profile
        const { data: brandData, error: brandError } = await supabase
          .from('brand_profiles')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (brandData && !brandError) {
          setBrandProfile(brandData);
        }

        // Fetch subscription
        const { data: subscriptionData, error: subscriptionError } = await supabase
          .from('subscriptions')
          .select('*')
          .eq('id', user.id)
          .single();

        if (subscriptionData && !subscriptionError) {
          setSubscription(subscriptionData);
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [user]);

  const handleSaveProfile = async () => {
    if (!user) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from('user_profiles')
        .upsert({
          id: user.id,
          full_name: formData.fullName,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;

      setProfile(prev => prev ? {
        ...prev,
        full_name: formData.fullName,
        updated_at: new Date().toISOString()
      } : null);

      setSuccessMessage('Profilul a fost actualizat cu succes!');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      console.error('Error saving profile:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleEditBrandVoice = () => {
    navigate('/app/onboarding', { state: { editMode: true } });
  };

  const handleSignOut = async () => {
    await signOut();
  };

  if (loading) {
    return (
      <div className="space-y-8">
        <Card animation="fadeInUp" className="animate-pulse">
          <div className="flex items-center space-x-4">
            <div className="w-20 h-20 bg-gray-200 rounded-full"></div>
            <div className="space-y-2">
              <div className="h-6 bg-gray-200 rounded w-48"></div>
              <div className="h-4 bg-gray-200 rounded w-32"></div>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  const planLimits = {
    free: { plans: 5, content: 50 },
    pro: { plans: 50, content: 500 },
    premium: { plans: -1, content: -1 }
  };

  const currentPlan = subscription?.plan || 'free';
  const limits = planLimits[currentPlan as keyof typeof planLimits];

  return (
    <div className="space-y-8">
      {/* Success Message */}
      {successMessage && (
        <Card className="bg-green-50 border-green-200" animation="slideInLeft">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <Sparkles className="h-5 w-5 text-green-600" />
            </div>
            <p className="text-green-800 font-medium">{successMessage}</p>
          </div>
        </Card>
      )}

      {/* Header */}
      <Card animation="fadeInUp" className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
        <div className="flex items-center space-x-6">
          <div className="w-20 h-20 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
            <User className="h-10 w-10 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {profile?.full_name || 'Utilizator'}
            </h1>
            <p className="text-gray-600 flex items-center space-x-2">
              <Mail className="h-4 w-4" />
              <span>{user?.email}</span>
            </p>
            <p className="text-sm text-gray-500 flex items-center space-x-2 mt-1">
              <Calendar className="h-4 w-4" />
              <span>Membru din {new Date(user?.created_at || '').toLocaleDateString('ro-RO')}</span>
            </p>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile Settings */}
        <Card className="lg:col-span-2 shadow-lg" animation="slideInLeft" hover="subtle">
          <div className="flex items-center space-x-3 mb-6">
            <div className="p-2 bg-blue-100 rounded-xl">
              <Settings className="h-6 w-6 text-blue-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Setări profil</h2>
          </div>

          <div className="space-y-6">
            <Input
              label="Numele complet"
              value={formData.fullName}
              onChange={(e) => setFormData(prev => ({ ...prev, fullName: e.target.value }))}
              placeholder="Introdu numele tău complet"
              icon={User}
            />

            <Input
              label="Adresa de email"
              value={formData.email}
              disabled
              placeholder="Email-ul nu poate fi modificat"
              icon={Mail}
            />

            <div className="flex justify-end">
              <Button
                onClick={handleSaveProfile}
                loading={saving}
                className="flex items-center space-x-2"
              >
                <Settings className="h-4 w-4" />
                <span>Salvează modificările</span>
              </Button>
            </div>
          </div>
        </Card>

        {/* Brand Voice Summary */}
        <Card className="shadow-lg" animation="slideInRight" hover="subtle">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Vocea brandului</h2>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleEditBrandVoice}
              className="flex items-center space-x-2 micro-bounce"
            >
              <Edit3 className="h-4 w-4" />
              <span>{brandProfile ? 'Editează' : 'Configurează'}</span>
            </Button>
          </div>
          
          {brandProfile ? (
            <>
              <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-100" animation="scaleIn" delay={1}>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{brandProfile.brand_name}</h3>
                <p className="text-gray-700 mb-4 text-sm leading-relaxed">{brandProfile.brand_description}</p>
                
                <div className="space-y-3">
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-2 text-sm">Personalitate:</h4>
                    <div className="flex flex-wrap gap-1">
                      {brandProfile.personality_traits?.slice(0, 2).map((trait, index) => (
                        <span 
                          key={index} 
                          className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium"
                        >
                          {trait}
                        </span>
                      ))}
                      {brandProfile.personality_traits?.length > 2 && (
                        <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs">
                          +{brandProfile.personality_traits.length - 2}
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-2 text-sm">Ton:</h4>
                    <div className="flex flex-wrap gap-1">
                      {brandProfile.communication_tones?.slice(0, 2).map((tone, index) => (
                        <span 
                          key={index} 
                          className="px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-medium"
                        >
                          {tone}
                        </span>
                      ))}
                      {brandProfile.communication_tones?.length > 2 && (
                        <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs">
                          +{brandProfile.communication_tones.length - 2}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-blue-200">
                  <p className="text-xs text-gray-500">
                    Ultima actualizare: {new Date(brandProfile.updated_at).toLocaleDateString('ro-RO')}
                  </p>
                </div>
              </Card>

              {/* Quick Actions for Brand Voice */}
              <Card className="mt-4 bg-gradient-to-r from-green-50 to-blue-50 border-green-200" animation="scaleIn" delay={2}>
                <div className="text-center">
                  <h4 className="font-semibold text-gray-900 mb-2">Acțiuni rapide</h4>
                  <div className="space-y-2">
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="w-full micro-bounce"
                      onClick={handleEditBrandVoice}
                    >
                      <Edit3 className="h-4 w-4 mr-2" />
                      Îmbunătățește vocea brandului
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="w-full micro-bounce"
                      onClick={() => navigate('/app/dashboard')}
                    >
                      <Sparkles className="h-4 w-4 mr-2" />
                      Generează conținut nou
                    </Button>
                  </div>
                </div>
              </Card>
            </>
          ) : (
            <Card className="text-center py-8" animation="bounceIn">
              <div className="p-4 bg-gradient-to-r from-blue-100 to-purple-100 rounded-2xl mb-4 inline-block">
                <Sparkles className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Definește vocea brandului</h3>
              <p className="text-gray-600 mb-4 text-sm leading-relaxed">
                Ajută-ne să înțelegem personalitatea și tonul brandului tău pentru a genera conținut personalizat.
              </p>
              <Button 
                className="flex items-center space-x-2 micro-bounce"
                onClick={handleEditBrandVoice}
              >
                <Sparkles className="h-4 w-4" />
                <span>Începe configurarea</span>
              </Button>
            </Card>
          )}

          {/* Subscription Status */}
          <Card className="mt-4 bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200" animation="scaleIn" delay={3}>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-amber-100 rounded-lg">
                  <Crown className="h-5 w-5 text-amber-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 text-sm">Plan {currentPlan}</h4>
                  <p className="text-xs text-gray-600">
                    {subscription?.plans_generated_this_month || 0}
                    {limits.plans > 0 ? `/${limits.plans}` : '/∞'} planuri
                  </p>
                </div>
              </div>
              {currentPlan === 'free' && (
                <Button size="sm" variant="secondary" className="micro-bounce">
                  Upgrade
                </Button>
              )}
            </div>
          </Card>
        </Card>
      </div>

      {/* Additional Settings */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="shadow-lg" animation="scaleIn" delay={1} hover="subtle">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-2 bg-green-100 rounded-xl">
              <Shield className="h-6 w-6 text-green-600" />
            </div>
            <h3 className="text-lg font-bold text-gray-900">Securitate</h3>
          </div>
          <p className="text-gray-600 mb-4">Gestionează setările de securitate ale contului tău</p>
          <Button variant="outline" className="w-full">
            Schimbă parola
          </Button>
        </Card>

        <Card className="shadow-lg" animation="scaleIn" delay={2} hover="subtle">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-2 bg-yellow-100 rounded-xl">
              <Bell className="h-6 w-6 text-yellow-600" />
            </div>
            <h3 className="text-lg font-bold text-gray-900">Notificări</h3>
          </div>
          <p className="text-gray-600 mb-4">Configurează preferințele de notificare</p>
          <Button variant="outline" className="w-full">
            Setări notificări
          </Button>
        </Card>
      </div>

      {/* Danger Zone */}
      <Card className="shadow-lg border-red-200" animation="fadeInUp" delay={3}>
        <div className="flex items-center space-x-3 mb-4">
          <div className="p-2 bg-red-100 rounded-xl">
            <Shield className="h-6 w-6 text-red-600" />
          </div>
          <h3 className="text-lg font-bold text-red-900">Zona periculoasă</h3>
        </div>
        <p className="text-gray-600 mb-6">
          Acțiuni ireversibile pentru contul tău
        </p>
        <div className="flex flex-col sm:flex-row gap-4">
          <Button
            variant="outline"
            onClick={handleSignOut}
            className="border-red-300 text-red-700 hover:bg-red-50"
          >
            Deconectează-te
          </Button>
          <Button
            variant="outline"
            className="border-red-300 text-red-700 hover:bg-red-50"
          >
            Șterge contul
          </Button>
        </div>
      </Card>
    </div>
  );
};