import React, { useState } from 'react';
import { Crown, Check, Zap, Star, ArrowRight, Loader2 } from 'lucide-react';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { STRIPE_PRODUCTS, type StripeProduct } from '../stripe-config';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

interface SubscriptionPlansProps {
  currentPlan?: string;
  onPlanSelect?: (plan: StripeProduct) => void;
  showCurrentPlan?: boolean;
}

export const SubscriptionPlans: React.FC<SubscriptionPlansProps> = ({
  currentPlan = 'free',
  onPlanSelect,
  showCurrentPlan = true
}) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState<string | null>(null);

  const handleSelectPlan = async (planKey: StripeProduct) => {
    if (!user) return;

    setLoading(planKey);
    try {
      const product = STRIPE_PRODUCTS[planKey];
      
      const { data, error } = await supabase.functions.invoke('stripe-checkout', {
        body: {
          price_id: product.priceId,
          mode: product.mode,
          success_url: `${window.location.origin}/app/account?success=true`,
          cancel_url: `${window.location.origin}/app/account?canceled=true`
        }
      });

      if (error) throw error;

      // Redirect to Stripe Checkout
      if (data?.url) {
        window.location.href = data.url;
      }

      onPlanSelect?.(planKey);
    } catch (error) {
      console.error('Error creating checkout session:', error);
    } finally {
      setLoading(null);
    }
  };

  const handleManageSubscription = async () => {
    if (!user) return;

    setLoading('manage');
    try {
      const { data, error } = await supabase.functions.invoke('create-portal-session', {
        body: {
          user_id: user.id,
          return_url: `${window.location.origin}/app/account`
        }
      });

      if (error) throw error;

      if (data?.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error('Error creating portal session:', error);
    } finally {
      setLoading(null);
    }
  };

  const plans = [
    {
      key: 'free' as const,
      name: 'Gratuit',
      price: 0,
      currency: 'EUR',
      interval: 'month',
      description: 'Perfect pentru a începe',
      features: [
        '5 planuri de marketing pe lună',
        '25 conținuturi generate',
        'Definirea vocii brandului',
        'Suport comunitate'
      ],
      popular: false,
      color: 'gray'
    },
    {
      key: 'basic' as StripeProduct,
      ...STRIPE_PRODUCTS.basic,
      interval: 'month',
      popular: false,
      color: 'blue'
    },
    {
      key: 'pro' as StripeProduct,
      ...STRIPE_PRODUCTS.pro,
      interval: 'month',
      popular: true,
      color: 'purple'
    },
    {
      key: 'enterprise' as StripeProduct,
      ...STRIPE_PRODUCTS.enterprise,
      interval: 'month',
      popular: false,
      color: 'indigo'
    }
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">
          Alege planul potrivit pentru tine
        </h2>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Toate planurile includ acces complet la generatorul de conținut AI și analiza vocii brandului
        </p>
      </div>

      {/* Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
        {plans.map((plan, index) => (
          <Card
            key={plan.key}
            className={`relative shadow-lg hover:shadow-xl transition-all duration-300 ${
              plan.popular 
                ? 'border-2 border-purple-500 transform scale-105' 
                : 'border border-gray-200'
            } ${currentPlan === plan.key ? 'ring-2 ring-green-500' : ''}`}
            animation="scaleIn"
            delay={index + 1}
            hover="subtle"
          >
            {/* Popular Badge */}
            {plan.popular && (
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <div className="bg-purple-500 text-white px-4 py-1 rounded-full text-sm font-medium flex items-center space-x-1">
                  <Star className="h-4 w-4" />
                  <span>Cel mai popular</span>
                </div>
              </div>
            )}

            {/* Current Plan Badge */}
            {showCurrentPlan && currentPlan === plan.key && (
              <div className="absolute -top-4 right-4">
                <div className="bg-green-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                  Planul curent
                </div>
              </div>
            )}

            <div className="p-8">
              {/* Plan Header */}
              <div className="text-center mb-8">
                <div className={`p-3 rounded-2xl mb-4 inline-block ${
                  plan.color === 'blue' ? 'bg-blue-100' :
                  plan.color === 'purple' ? 'bg-purple-100' :
                  plan.color === 'indigo' ? 'bg-indigo-100' : 'bg-gray-100'
                }`}>
                  {plan.key === 'free' ? (
                    <Zap className={`h-8 w-8 ${
                      plan.color === 'blue' ? 'text-blue-600' :
                      plan.color === 'purple' ? 'text-purple-600' :
                      plan.color === 'indigo' ? 'text-indigo-600' : 'text-gray-600'
                    }`} />
                  ) : (
                    <Crown className={`h-8 w-8 ${
                      plan.color === 'blue' ? 'text-blue-600' :
                      plan.color === 'purple' ? 'text-purple-600' :
                      plan.color === 'indigo' ? 'text-indigo-600' : 'text-gray-600'
                    }`} />
                  )}
                </div>
                
                <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                <p className="text-gray-600 mb-4">{plan.description}</p>
                
                <div className="flex items-baseline justify-center space-x-1">
                  <span className="text-4xl font-bold text-gray-900">{plan.price}</span>
                  <span className="text-gray-600">{plan.currency}</span>
                  <span className="text-gray-500">/{plan.interval}</span>
                </div>
              </div>

              {/* Features */}
              <div className="space-y-4 mb-8">
                {plan.features.map((feature, featureIndex) => (
                  <div key={featureIndex} className="flex items-start space-x-3">
                    <Check className={`h-5 w-5 mt-0.5 flex-shrink-0 ${
                      plan.color === 'blue' ? 'text-blue-600' :
                      plan.color === 'purple' ? 'text-purple-600' :
                      plan.color === 'indigo' ? 'text-indigo-600' : 'text-green-600'
                    }`} />
                    <span className="text-gray-700">{feature}</span>
                  </div>
                ))}
              </div>

              {/* Action Button */}
              <div className="space-y-3">
                {currentPlan === plan.key ? (
                  <>
                    {plan.key !== 'free' && (
                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={handleManageSubscription}
                        loading={loading === 'manage'}
                      >
                        {loading === 'manage' ? (
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                          <Crown className="h-4 w-4 mr-2" />
                        )}
                        Gestionează abonamentul
                      </Button>
                    )}
                    <div className="text-center text-sm text-green-600 font-medium">
                      ✓ Planul tău actual
                    </div>
                  </>
                ) : (
                  <Button
                    className={`w-full ${
                      plan.popular 
                        ? 'bg-purple-600 hover:bg-purple-700' 
                        : plan.key === 'free'
                        ? 'bg-gray-600 hover:bg-gray-700'
                        : plan.color === 'blue'
                        ? 'bg-blue-600 hover:bg-blue-700'
                        : 'bg-indigo-600 hover:bg-indigo-700'
                    }`}
                    onClick={() => plan.key !== 'free' ? handleSelectPlan(plan.key) : undefined}
                    loading={loading === plan.key}
                    disabled={plan.key === 'free'}
                  >
                    {loading === plan.key ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <ArrowRight className="h-4 w-4 mr-2" />
                    )}
                    {plan.key === 'free' ? 'Plan curent' : 
                     currentPlan === 'free' ? 'Upgrade acum' : 'Schimbă planul'}
                  </Button>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* FAQ Section */}
      <Card className="max-w-4xl mx-auto" animation="fadeInUp" delay={4}>
        <div className="text-center mb-8">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">Întrebări frecvente</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h4 className="font-semibold text-gray-900 mb-2">Pot să-mi schimb planul oricând?</h4>
            <p className="text-gray-600 text-sm">
              Da, poți să-ți schimbi planul oricând. Modificările se aplică imediat și facturarea se ajustează proporțional.
            </p>
          </div>
          
          <div>
            <h4 className="font-semibold text-gray-900 mb-2">Ce se întâmplă dacă depășesc limita?</h4>
            <p className="text-gray-600 text-sm">
              Vei primi notificări când te apropii de limită. După depășire, vei fi invitat să faci upgrade la un plan superior.
            </p>
          </div>
          
          <div>
            <h4 className="font-semibold text-gray-900 mb-2">Există reduceri pentru plata anuală?</h4>
            <p className="text-gray-600 text-sm">
              Da, oferim 20% reducere pentru abonamentele anuale. Contactează-ne pentru mai multe detalii.
            </p>
          </div>
          
          <div>
            <h4 className="font-semibold text-gray-900 mb-2">Pot să anulez oricând?</h4>
            <p className="text-gray-600 text-sm">
              Absolut. Nu există contracte pe termen lung. Poți anula abonamentul oricând din panoul de gestionare.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
};