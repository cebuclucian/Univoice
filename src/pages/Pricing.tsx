import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { CheckCircle, AlertCircle, ArrowLeft } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useSubscription } from '../hooks/useSubscription';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { SubscriptionPlans } from '../components/SubscriptionPlans';

export const Pricing: React.FC = () => {
  const { user } = useAuth();
  const { getCurrentPlan, loading } = useSubscription();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Check for success/cancel parameters
  const success = searchParams.get('success');
  const canceled = searchParams.get('canceled');

  const currentPlan = getCurrentPlan();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-12">
        {/* Success Message */}
        {success && (
          <Card className="mb-8 bg-green-50 border-green-200" animation="slideInLeft">
            <div className="flex items-center space-x-3">
              <CheckCircle className="h-6 w-6 text-green-600" />
              <div>
                <h3 className="font-semibold text-green-900">Abonament activat cu succes!</h3>
                <p className="text-green-700">
                  Mulțumim pentru upgrade! Planul tău a fost activat și poți începe să folosești toate funcționalitățile.
                </p>
              </div>
            </div>
          </Card>
        )}

        {/* Cancel Message */}
        {canceled && (
          <Card className="mb-8 bg-yellow-50 border-yellow-200" animation="slideInLeft">
            <div className="flex items-center space-x-3">
              <AlertCircle className="h-6 w-6 text-yellow-600" />
              <div>
                <h3 className="font-semibold text-yellow-900">Plata a fost anulată</h3>
                <p className="text-yellow-700">
                  Nu s-a efectuat nicio plată. Poți încerca din nou oricând.
                </p>
              </div>
            </div>
          </Card>
        )}

        {/* Back Button */}
        {user && (
          <div className="mb-8">
            <Button 
              variant="outline" 
              onClick={() => navigate('/app/account')}
              className="flex items-center space-x-2"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Înapoi la cont</span>
            </Button>
          </div>
        )}

        {/* Subscription Plans */}
        <SubscriptionPlans 
          currentPlan={currentPlan}
          showCurrentPlan={!!user}
        />

        {/* Security Notice */}
        <Card className="mt-12 max-w-4xl mx-auto bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200" animation="fadeInUp">
          <div className="text-center">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              🔒 Plăți securizate cu Stripe
            </h3>
            <p className="text-gray-700 leading-relaxed">
              Toate plățile sunt procesate securizat prin Stripe, liderul mondial în procesarea plăților online. 
              Nu stocăm informațiile tale de plată și toate tranzacțiile sunt criptate end-to-end.
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
};