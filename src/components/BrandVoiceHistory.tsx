import React, { useState, useEffect } from 'react';
import { Brain, Clock, Eye, TrendingUp, Calendar, BarChart3, Sparkles, ArrowRight } from 'lucide-react';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

interface BrandVoiceHistoryItem {
  plan_id: string;
  plan_title: string;
  created_at: string;
  brand_voice_data: {
    personality?: string[];
    tone?: string[];
    brand_description?: string;
    brand_name?: string;
    timestamp?: string;
    brand_profile_updated_at?: string;
  };
}

interface BrandVoiceHistoryProps {
  className?: string;
  maxItems?: number;
  showEvolution?: boolean;
}

export const BrandVoiceHistory: React.FC<BrandVoiceHistoryProps> = ({ 
  className = '', 
  maxItems = 5,
  showEvolution = false
}) => {
  const { user } = useAuth();
  const [history, setHistory] = useState<BrandVoiceHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showFullHistory, setShowFullHistory] = useState(false);

  useEffect(() => {
    const fetchHistory = async () => {
      if (!user) return;

      try {
        setLoading(true);
        setError(null);

        // Fetch brand voice history
        const { data: historyData, error: historyError } = await supabase
          .rpc('get_brand_voice_history', { user_id: user.id });

        if (historyError) throw historyError;

        setHistory(historyData || []);

      } catch (err) {
        console.error('Error fetching brand voice history:', err);
        setError('Nu am putut încărca istoricul vocii brandului');
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [user, showEvolution]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ro-RO', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getUniqueVoiceVersions = () => {
    const versions = new Set();
    history.forEach(item => {
      if (item.brand_voice_data?.timestamp) {
        versions.add(item.brand_voice_data.timestamp);
      }
    });
    return versions.size;
  };

  const getMostUsedTraits = (type: 'personality' | 'tone') => {
    const counts: { [key: string]: number } = {};
    
    history.forEach(item => {
      const traits = type === 'personality' 
        ? item.brand_voice_data?.personality 
        : item.brand_voice_data?.tone;
      
      if (Array.isArray(traits)) {
        traits.forEach(trait => {
          counts[trait] = (counts[trait] || 0) + 1;
        });
      }
    });

    return Object.entries(counts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([trait]) => trait);
  };

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
          <Button 
            variant="outline" 
            size="sm" 
            className="mt-3"
            onClick={() => window.location.reload()}
          >
            Încearcă din nou
          </Button>
        </div>
      </Card>
    );
  }

  const displayHistory = showFullHistory ? history : history.slice(0, maxItems);

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Main History Card */}
      <Card className="shadow-lg" hover="subtle">
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
            
            {history.length > maxItems && !showFullHistory && (
              <Button 
                variant="ghost" 
                size="sm" 
                className="flex items-center space-x-1"
                onClick={() => setShowFullHistory(true)}
              >
                <Eye className="h-4 w-4" />
                <span>Vezi tot ({history.length})</span>
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
                            {formatDate(item.created_at)}
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

                        {item.brand_voice_data.brand_name && (
                          <div>
                            <span className="font-semibold text-gray-800">Brand: </span>
                            <span className="text-gray-700">{item.brand_voice_data.brand_name}</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          )}

          {/* Show More/Less Button */}
          {history.length > maxItems && (
            <div className="text-center pt-4 border-t border-gray-200">
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setShowFullHistory(!showFullHistory)}
                className="flex items-center space-x-2"
              >
                {showFullHistory ? (
                  <>
                    <span>Arată mai puțin</span>
                  </>
                ) : (
                  <>
                    <span>Vezi toate ({history.length})</span>
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </Button>
            </div>
          )}

          {/* Stats */}
          {history.length > 0 && (
            <div className="pt-4 border-t border-gray-200">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <TrendingUp className="h-4 w-4 text-gray-600" />
                    <span className="text-gray-700">Total utilizări:</span>
                  </div>
                  <span className="font-semibold text-gray-900">{history.length}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Sparkles className="h-4 w-4 text-gray-600" />
                    <span className="text-gray-700">Versiuni voce:</span>
                  </div>
                  <span className="font-semibold text-gray-900">{getUniqueVoiceVersions()}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Evolution Analytics Card */}
      {showEvolution && history.length > 0 && (
        <Card className="shadow-lg bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200" hover="subtle">
          <div className="space-y-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-xl">
                <BarChart3 className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">Analiza evoluției vocii</h3>
                <p className="text-sm text-gray-600">Tendințe și pattern-uri în vocea brandului</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Most Used Personality Traits */}
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Trăsături dominante</h4>
                <div className="space-y-2">
                  {getMostUsedTraits('personality').map((trait) => (
                    <div key={trait} className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <span className="text-sm text-gray-700">{trait}</span>
                    </div>
                  ))}
                  {getMostUsedTraits('personality').length === 0 && (
                    <p className="text-sm text-gray-500">Nu sunt date suficiente</p>
                  )}
                </div>
              </div>

              {/* Most Used Tones */}
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Tonuri dominante</h4>
                <div className="space-y-2">
                  {getMostUsedTraits('tone').map((tone) => (
                    <div key={tone} className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                      <span className="text-sm text-gray-700">{tone}</span>
                    </div>
                  ))}
                  {getMostUsedTraits('tone').length === 0 && (
                    <p className="text-sm text-gray-500">Nu sunt date suficiente</p>
                  )}
                </div>
              </div>
            </div>

            {/* Timeline */}
            {history.length > 1 && (
              <div className="pt-4 border-t border-blue-200">
                <h4 className="font-semibold text-gray-900 mb-3">Cronologie</h4>
                <div className="flex items-center justify-between text-sm">
                  <div>
                    <span className="text-gray-600">Primul plan: </span>
                    <span className="font-medium text-gray-900">
                      {formatDate(history[history.length - 1].created_at)}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600">Ultimul plan: </span>
                    <span className="font-medium text-gray-900">
                      {formatDate(history[0].created_at)}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </Card>
      )}
    </div>
  );
};