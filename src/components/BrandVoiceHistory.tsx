import React, { useState, useEffect } from 'react';
import { Brain, Clock, Eye, TrendingUp, Calendar } from 'lucide-react';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

interface BrandVoiceHistoryItem {
  plan_id: string;
  plan_title: string;
  created_at: string;
  brand_voice_data: any;
}

interface BrandVoiceHistoryProps {
  className?: string;
  maxItems?: number;
}

export const BrandVoiceHistory: React.FC<BrandVoiceHistoryProps> = ({ 
  className = '', 
  maxItems = 5 
}) => {
  const { user } = useAuth();
  const [history, setHistory] = useState<BrandVoiceHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchHistory = async () => {
      if (!user) return;

      try {
        setLoading(true);
        setError(null);

        const { data, error: rpcError } = await supabase
          .rpc('get_brand_voice_history', { user_id: user.id });

        if (rpcError) throw rpcError;

        setHistory(data || []);
      } catch (err) {
        console.error('Error fetching brand voice history:', err);
        setError('Nu am putut încărca istoricul vocii brandului');
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [user]);

  if (loading) {
    return (
      <Card className={`animate-pulse ${className}`}>
        <div className="space-y-4">
          <div className="h-6 bg-gray-200 rounded w-1/2"></div>
          {[1, 2, 3].map(i => (
            <div key={i} className="space-y-2">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={`border-red-200 ${className}`}>
        <div className="text-center py-6">
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      </Card>
    );
  }

  const displayHistory = history.slice(0, maxItems);

  return (
    <Card className={`shadow-lg ${className}`} hover="subtle">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-purple-100 rounded-xl">
              <Brain className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">Istoricul vocii brandului</h3>
              <p className="text-sm text-gray-600">Cum a evoluat vocea ta în timp</p>
            </div>
          </div>
          
          {history.length > maxItems && (
            <Button variant="ghost" size="sm" className="flex items-center space-x-1">
              <Eye className="h-4 w-4" />
              <span>Vezi tot</span>
            </Button>
          )}
        </div>

        {/* History Items */}
        {displayHistory.length === 0 ? (
          <Card className="text-center py-8" animation="bounceIn">
            <div className="p-4 bg-gray-100 rounded-2xl mb-4 inline-block">
              <Clock className="h-8 w-8 text-gray-500" />
            </div>
            <h4 className="text-lg font-semibold text-gray-900 mb-2">
              Încă nu ai istoric
            </h4>
            <p className="text-gray-600 text-sm">
              Istoricul vocii brandului va apărea după ce creezi primul plan de marketing
            </p>
          </Card>
        ) : (
          <div className="space-y-4">
            {displayHistory.map((item, index) => (
              <Card 
                key={item.plan_id}
                className="border-l-4 border-purple-400 bg-purple-50"
                padding="sm"
                animation="fadeInUp"
                delay={index + 1}
                hover="subtle"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900 text-sm">
                        {item.plan_title}
                      </h4>
                      <div className="flex items-center space-x-2 mt-1">
                        <Calendar className="h-3 w-3 text-gray-500" />
                        <span className="text-xs text-gray-500">
                          {new Date(item.created_at).toLocaleDateString('ro-RO', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                      </div>
                    </div>
                  </div>

                  {item.brand_voice_data && (
                    <div className="space-y-2 text-xs">
                      {item.brand_voice_data.personality && (
                        <div>
                          <span className="font-semibold text-gray-800">Personalitate: </span>
                          <span className="text-gray-700">
                            {Array.isArray(item.brand_voice_data.personality) 
                              ? item.brand_voice_data.personality.slice(0, 3).join(', ')
                              : item.brand_voice_data.personality
                            }
                            {Array.isArray(item.brand_voice_data.personality) && 
                             item.brand_voice_data.personality.length > 3 && 
                             ` +${item.brand_voice_data.personality.length - 3}`
                            }
                          </span>
                        </div>
                      )}
                      
                      {item.brand_voice_data.tone && (
                        <div>
                          <span className="font-semibold text-gray-800">Ton: </span>
                          <span className="text-gray-700">
                            {Array.isArray(item.brand_voice_data.tone)
                              ? item.brand_voice_data.tone.slice(0, 3).join(', ')
                              : item.brand_voice_data.tone
                            }
                            {Array.isArray(item.brand_voice_data.tone) && 
                             item.brand_voice_data.tone.length > 3 && 
                             ` +${item.brand_voice_data.tone.length - 3}`
                            }
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Stats */}
        {history.length > 0 && (
          <div className="pt-4 border-t border-gray-200">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center space-x-2">
                <TrendingUp className="h-4 w-4 text-gray-600" />
                <span className="text-gray-700">Total utilizări voce:</span>
              </div>
              <span className="font-semibold text-gray-900">{history.length}</span>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};