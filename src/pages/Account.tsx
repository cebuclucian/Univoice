import React, { useState, useEffect } from 'react';
import { User, Mail, Calendar, Crown, Settings, Shield, Bell, CreditCard } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
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
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    email: ''
  });

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
    } catch (error) {
      console.error('Error saving profile:', error);
    } finally {
      setSaving(false);
    }
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

        {/* Subscription Info */}
        <Card className="shadow-lg" animation="slideInRight" hover="subtle">
          <div className="flex items-center space-x-3 mb-6">
            <div className="p-2 bg-purple-100 rounded-xl">
              <Crown className="h-6 w-6 text-purple-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">Abonament</h2>
          </div>

          <div className="space-y-4">
            <Card className={`${
              currentPlan === 'free' ? 'bg-gray-50 border-gray-200' :
              currentPlan === 'pro' ? 'bg-blue-50 border-blue-200' :
              'bg-purple-50 border-purple-200'
            }`} padding="sm">
              <div className="text-center">
                <h3 className="font-bold text-lg capitalize">{currentPlan}</h3>
                <p className="text-sm text-gray-600">
                  {currentPlan === 'free' ? 'Plan gratuit' :
                   currentPlan === 'pro' ? 'Plan profesional' :
                   'Plan premium'}
                </p>
              </div>
            </Card>

            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Planuri generate</span>
                <span className="font-semibold">
                  {subscription?.plans_generated_this_month || 0}
                  {limits.plans > 0 ? ` / ${limits.plans}` : ' / ∞'}
                </span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Conținut generat</span>
                <span className="font-semibold">
                  {subscription?.content_generated_this_month || 0}
                  {limits.content > 0 ? ` / ${limits.content}` : ' / ∞'}
                </span>
              </div>
            </div>

            {currentPlan === 'free' && (
              <Button variant="secondary" className="w-full flex items-center space-x-2">
                <Crown className="h-4 w-4" />
                <span>Upgrade la Pro</span>
              </Button>
            )}
          </div>
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