import React, { useState, useEffect } from 'react';
import { Save, X, Plus, Trash2, Edit3, Target, Users, Calendar, BarChart3, Lightbulb, AlertCircle, CheckCircle } from 'lucide-react';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Textarea } from './ui/Textarea';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

interface MarketingPlan {
  id: string;
  title: string;
  details: any;
  created_at: string;
}

interface MarketingPlanEditorProps {
  plan: MarketingPlan;
  onSave: (updatedPlan: MarketingPlan) => void;
  onCancel: () => void;
}

export const MarketingPlanEditor: React.FC<MarketingPlanEditorProps> = ({
  plan,
  onSave,
  onCancel
}) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [activeSection, setActiveSection] = useState<'general' | 'objectives' | 'audience' | 'platforms' | 'content' | 'kpis'>('general');
  
  const [editedPlan, setEditedPlan] = useState({
    title: plan.title,
    summary: plan.details?.summary || '',
    objectives: plan.details?.objectives || [],
    target_audience: plan.details?.target_audience || {
      primary: '',
      demographics: '',
      psychographics: '',
      pain_points: []
    },
    strategy: plan.details?.strategy || {
      positioning: '',
      key_messages: [],
      content_pillars: []
    },
    platforms: plan.details?.platforms || plan.details?.tactical_plan_per_platform || [],
    kpis: plan.details?.kpis || plan.details?.kpis_smart || [],
    budget_allocation: plan.details?.budget_allocation || plan.details?.budget_allocation_summary || {},
    content_calendar: plan.details?.content_calendar || []
  });

  const sections = [
    { id: 'general', name: 'General', icon: Target },
    { id: 'objectives', name: 'Obiective', icon: CheckCircle },
    { id: 'audience', name: 'Audiența', icon: Users },
    { id: 'platforms', name: 'Platforme', icon: BarChart3 },
    { id: 'content', name: 'Conținut', icon: Calendar },
    { id: 'kpis', name: 'KPI-uri', icon: Lightbulb }
  ];

  const handleSave = async () => {
    if (!user) return;

    setLoading(true);
    setError(null);

    try {
      const updatedDetails = {
        ...plan.details,
        summary: editedPlan.summary,
        objectives: editedPlan.objectives,
        target_audience: editedPlan.target_audience,
        strategy: editedPlan.strategy,
        platforms: editedPlan.platforms,
        tactical_plan_per_platform: editedPlan.platforms,
        kpis: editedPlan.kpis,
        kpis_smart: editedPlan.kpis,
        budget_allocation: editedPlan.budget_allocation,
        budget_allocation_summary: editedPlan.budget_allocation,
        content_calendar: editedPlan.content_calendar,
        last_edited: new Date().toISOString(),
        edited_by: user.id
      };

      const { data, error: updateError } = await supabase
        .from('marketing_plans')
        .update({
          title: editedPlan.title,
          details: updatedDetails
        })
        .eq('id', plan.id)
        .eq('user_id', user.id)
        .select()
        .single();

      if (updateError) throw updateError;

      setSuccess(true);
      setTimeout(() => {
        onSave({
          ...plan,
          title: editedPlan.title,
          details: updatedDetails
        });
      }, 1000);

    } catch (err) {
      console.error('Error updating plan:', err);
      setError('Nu am putut salva modificările. Te rog încearcă din nou.');
    } finally {
      setLoading(false);
    }
  };

  const addObjective = () => {
    setEditedPlan(prev => ({
      ...prev,
      objectives: [...prev.objectives, '']
    }));
  };

  const updateObjective = (index: number, value: string) => {
    setEditedPlan(prev => ({
      ...prev,
      objectives: prev.objectives.map((obj, i) => i === index ? value : obj)
    }));
  };

  const removeObjective = (index: number) => {
    setEditedPlan(prev => ({
      ...prev,
      objectives: prev.objectives.filter((_, i) => i !== index)
    }));
  };

  const addPainPoint = () => {
    setEditedPlan(prev => ({
      ...prev,
      target_audience: {
        ...prev.target_audience,
        pain_points: [...(prev.target_audience.pain_points || []), '']
      }
    }));
  };

  const updatePainPoint = (index: number, value: string) => {
    setEditedPlan(prev => ({
      ...prev,
      target_audience: {
        ...prev.target_audience,
        pain_points: (prev.target_audience.pain_points || []).map((point, i) => i === index ? value : point)
      }
    }));
  };

  const removePainPoint = (index: number) => {
    setEditedPlan(prev => ({
      ...prev,
      target_audience: {
        ...prev.target_audience,
        pain_points: (prev.target_audience.pain_points || []).filter((_, i) => i !== index)
      }
    }));
  };

  const addKeyMessage = () => {
    setEditedPlan(prev => ({
      ...prev,
      strategy: {
        ...prev.strategy,
        key_messages: [...(prev.strategy.key_messages || []), '']
      }
    }));
  };

  const updateKeyMessage = (index: number, value: string) => {
    setEditedPlan(prev => ({
      ...prev,
      strategy: {
        ...prev.strategy,
        key_messages: (prev.strategy.key_messages || []).map((msg, i) => i === index ? value : msg)
      }
    }));
  };

  const removeKeyMessage = (index: number) => {
    setEditedPlan(prev => ({
      ...prev,
      strategy: {
        ...prev.strategy,
        key_messages: (prev.strategy.key_messages || []).filter((_, i) => i !== index)
      }
    }));
  };

  const addContentPillar = () => {
    setEditedPlan(prev => ({
      ...prev,
      strategy: {
        ...prev.strategy,
        content_pillars: [...(prev.strategy.content_pillars || []), '']
      }
    }));
  };

  const updateContentPillar = (index: number, value: string) => {
    setEditedPlan(prev => ({
      ...prev,
      strategy: {
        ...prev.strategy,
        content_pillars: (prev.strategy.content_pillars || []).map((pillar, i) => i === index ? value : pillar)
      }
    }));
  };

  const removeContentPillar = (index: number) => {
    setEditedPlan(prev => ({
      ...prev,
      strategy: {
        ...prev.strategy,
        content_pillars: (prev.strategy.content_pillars || []).filter((_, i) => i !== index)
      }
    }));
  };

  const addPlatform = () => {
    setEditedPlan(prev => ({
      ...prev,
      platforms: [...prev.platforms, {
        name: '',
        platform: '',
        strategy: '',
        content_types: [],
        posting_frequency: '',
        kpis: []
      }]
    }));
  };

  const updatePlatform = (index: number, field: string, value: any) => {
    setEditedPlan(prev => ({
      ...prev,
      platforms: prev.platforms.map((platform, i) => 
        i === index ? { ...platform, [field]: value } : platform
      )
    }));
  };

  const removePlatform = (index: number) => {
    setEditedPlan(prev => ({
      ...prev,
      platforms: prev.platforms.filter((_, i) => i !== index)
    }));
  };

  const addKPI = () => {
    setEditedPlan(prev => ({
      ...prev,
      kpis: [...prev.kpis, {
        name: '',
        metric: '',
        target: '',
        target_value: '',
        measurement: '',
        description: ''
      }]
    }));
  };

  const updateKPI = (index: number, field: string, value: string) => {
    setEditedPlan(prev => ({
      ...prev,
      kpis: prev.kpis.map((kpi, i) => 
        i === index ? { ...kpi, [field]: value } : kpi
      )
    }));
  };

  const removeKPI = (index: number) => {
    setEditedPlan(prev => ({
      ...prev,
      kpis: prev.kpis.filter((_, i) => i !== index)
    }));
  };

  if (success) {
    return (
      <Card className="text-center py-12 bg-green-50 border-green-200" animation="bounceIn">
        <div className="p-4 bg-green-100 rounded-2xl mb-4 inline-block">
          <CheckCircle className="h-12 w-12 text-green-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Plan actualizat cu succes!</h2>
        <p className="text-gray-600 mb-4">
          Modificările au fost salvate și planul a fost actualizat.
        </p>
      </Card>
    );
  }

  const renderGeneralSection = () => (
    <div className="space-y-6">
      <Input
        label="Titlul planului"
        value={editedPlan.title}
        onChange={(e) => setEditedPlan(prev => ({ ...prev, title: e.target.value }))}
        placeholder="Introdu titlul planului de marketing"
      />

      <Textarea
        label="Rezumat executiv"
        value={editedPlan.summary}
        onChange={(e) => setEditedPlan(prev => ({ ...prev, summary: e.target.value }))}
        placeholder="Descrierea generală a planului de marketing..."
        rows={4}
      />

      <Textarea
        label="Poziționarea brandului"
        value={editedPlan.strategy.positioning}
        onChange={(e) => setEditedPlan(prev => ({
          ...prev,
          strategy: { ...prev.strategy, positioning: e.target.value }
        }))}
        placeholder="Cum se poziționează brandul pe piață..."
        rows={3}
      />
    </div>
  );

  const renderObjectivesSection = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Obiectivele campaniei</h3>
        <Button onClick={addObjective} size="sm" className="flex items-center space-x-2">
          <Plus className="h-4 w-4" />
          <span>Adaugă obiectiv</span>
        </Button>
      </div>

      <div className="space-y-4">
        {editedPlan.objectives.map((objective, index) => (
          <div key={index} className="flex items-start space-x-3">
            <Textarea
              value={objective}
              onChange={(e) => updateObjective(index, e.target.value)}
              placeholder={`Obiectivul ${index + 1}...`}
              rows={2}
              className="flex-1"
            />
            <Button
              onClick={() => removeObjective(index)}
              variant="outline"
              size="sm"
              className="mt-2"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );

  const renderAudienceSection = () => (
    <div className="space-y-6">
      <Input
        label="Audiența principală"
        value={editedPlan.target_audience.primary}
        onChange={(e) => setEditedPlan(prev => ({
          ...prev,
          target_audience: { ...prev.target_audience, primary: e.target.value }
        }))}
        placeholder="Descrierea audiența principale..."
      />

      <Textarea
        label="Demografia"
        value={editedPlan.target_audience.demographics}
        onChange={(e) => setEditedPlan(prev => ({
          ...prev,
          target_audience: { ...prev.target_audience, demographics: e.target.value }
        }))}
        placeholder="Vârsta, genul, locația, venitul, educația..."
        rows={3}
      />

      <Textarea
        label="Psihografia"
        value={editedPlan.target_audience.psychographics}
        onChange={(e) => setEditedPlan(prev => ({
          ...prev,
          target_audience: { ...prev.target_audience, psychographics: e.target.value }
        }))}
        placeholder="Interesele, valorile, stilul de viață..."
        rows={3}
      />

      <div>
        <div className="flex items-center justify-between mb-4">
          <label className="block text-sm font-medium text-gray-700">Puncte de durere</label>
          <Button onClick={addPainPoint} size="sm" className="flex items-center space-x-2">
            <Plus className="h-4 w-4" />
            <span>Adaugă</span>
          </Button>
        </div>

        <div className="space-y-3">
          {(editedPlan.target_audience.pain_points || []).map((point, index) => (
            <div key={index} className="flex items-center space-x-3">
              <Input
                value={point}
                onChange={(e) => updatePainPoint(index, e.target.value)}
                placeholder={`Punct de durere ${index + 1}...`}
                className="flex-1"
              />
              <Button
                onClick={() => removePainPoint(index)}
                variant="outline"
                size="sm"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderPlatformsSection = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Platforme de marketing</h3>
        <Button onClick={addPlatform} size="sm" className="flex items-center space-x-2">
          <Plus className="h-4 w-4" />
          <span>Adaugă platformă</span>
        </Button>
      </div>

      <div className="space-y-6">
        {editedPlan.platforms.map((platform, index) => (
          <Card key={index} className="border-l-4 border-blue-400" padding="md">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-semibold text-gray-900">Platforma {index + 1}</h4>
              <Button
                onClick={() => removePlatform(index)}
                variant="outline"
                size="sm"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Numele platformei"
                value={platform.name || platform.platform || ''}
                onChange={(e) => updatePlatform(index, 'name', e.target.value)}
                placeholder="ex. Facebook, Instagram..."
              />

              <Input
                label="Frecvența postărilor"
                value={platform.posting_frequency || ''}
                onChange={(e) => updatePlatform(index, 'posting_frequency', e.target.value)}
                placeholder="ex. 3-5 postări pe săptămână"
              />
            </div>

            <Textarea
              label="Strategia platformei"
              value={platform.strategy || ''}
              onChange={(e) => updatePlatform(index, 'strategy', e.target.value)}
              placeholder="Strategia specifică pentru această platformă..."
              rows={3}
              className="mt-4"
            />

            <Input
              label="Tipuri de conținut (separate prin virgulă)"
              value={Array.isArray(platform.content_types) ? platform.content_types.join(', ') : platform.content_types || ''}
              onChange={(e) => updatePlatform(index, 'content_types', e.target.value.split(',').map(s => s.trim()))}
              placeholder="ex. Postări organice, Stories, Video content"
              className="mt-4"
            />
          </Card>
        ))}
      </div>
    </div>
  );

  const renderKPIsSection = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">KPI-uri și metrici</h3>
        <Button onClick={addKPI} size="sm" className="flex items-center space-x-2">
          <Plus className="h-4 w-4" />
          <span>Adaugă KPI</span>
        </Button>
      </div>

      <div className="space-y-6">
        {editedPlan.kpis.map((kpi, index) => (
          <Card key={index} className="border-l-4 border-green-400" padding="md">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-semibold text-gray-900">KPI {index + 1}</h4>
              <Button
                onClick={() => removeKPI(index)}
                variant="outline"
                size="sm"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Numele KPI-ului"
                value={kpi.name || kpi.metric || ''}
                onChange={(e) => updateKPI(index, 'name', e.target.value)}
                placeholder="ex. Engagement rate"
              />

              <Input
                label="Valoarea țintă"
                value={kpi.target || kpi.target_value || ''}
                onChange={(e) => updateKPI(index, 'target', e.target.value)}
                placeholder="ex. 5% creștere"
              />
            </div>

            <Textarea
              label="Descrierea și metoda de măsurare"
              value={kpi.description || kpi.measurement || ''}
              onChange={(e) => updateKPI(index, 'description', e.target.value)}
              placeholder="Cum se măsoară acest KPI și de ce este important..."
              rows={3}
              className="mt-4"
            />
          </Card>
        ))}
      </div>
    </div>
  );

  const renderStrategySection = () => (
    <div className="space-y-6">
      <div>
        <div className="flex items-center justify-between mb-4">
          <label className="block text-sm font-medium text-gray-700">Mesaje cheie</label>
          <Button onClick={addKeyMessage} size="sm" className="flex items-center space-x-2">
            <Plus className="h-4 w-4" />
            <span>Adaugă mesaj</span>
          </Button>
        </div>

        <div className="space-y-3">
          {(editedPlan.strategy.key_messages || []).map((message, index) => (
            <div key={index} className="flex items-center space-x-3">
              <Input
                value={message}
                onChange={(e) => updateKeyMessage(index, e.target.value)}
                placeholder={`Mesaj cheie ${index + 1}...`}
                className="flex-1"
              />
              <Button
                onClick={() => removeKeyMessage(index)}
                variant="outline"
                size="sm"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-4">
          <label className="block text-sm font-medium text-gray-700">Piloni de conținut</label>
          <Button onClick={addContentPillar} size="sm" className="flex items-center space-x-2">
            <Plus className="h-4 w-4" />
            <span>Adaugă pilon</span>
          </Button>
        </div>

        <div className="space-y-3">
          {(editedPlan.strategy.content_pillars || []).map((pillar, index) => (
            <div key={index} className="flex items-center space-x-3">
              <Input
                value={pillar}
                onChange={(e) => updateContentPillar(index, e.target.value)}
                placeholder={`Pilon de conținut ${index + 1}...`}
                className="flex-1"
              />
              <Button
                onClick={() => removeContentPillar(index)}
                variant="outline"
                size="sm"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderActiveSection = () => {
    switch (activeSection) {
      case 'general':
        return renderGeneralSection();
      case 'objectives':
        return renderObjectivesSection();
      case 'audience':
        return renderAudienceSection();
      case 'platforms':
        return renderPlatformsSection();
      case 'content':
        return renderStrategySection();
      case 'kpis':
        return renderKPIsSection();
      default:
        return renderGeneralSection();
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200" animation="fadeInUp">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-xl">
              <Edit3 className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Editează planul de marketing</h1>
              <p className="text-gray-600">Modifică și actualizează detaliile planului</p>
            </div>
          </div>
          
          <div className="flex space-x-3">
            <Button variant="outline" onClick={onCancel} className="flex items-center space-x-2">
              <X className="h-4 w-4" />
              <span>Anulează</span>
            </Button>
            <Button onClick={handleSave} loading={loading} className="flex items-center space-x-2">
              <Save className="h-4 w-4" />
              <span>Salvează modificările</span>
            </Button>
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

      {/* Navigation Tabs */}
      <Card className="shadow-lg" animation="slideInLeft">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 overflow-x-auto">
            {sections.map((section) => {
              const Icon = section.icon;
              return (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id as any)}
                  className={`
                    flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors whitespace-nowrap
                    ${activeSection === section.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }
                  `}
                >
                  <Icon className="h-4 w-4" />
                  <span>{section.name}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </Card>

      {/* Content */}
      <Card className="shadow-lg" animation="slideInRight" padding="lg">
        {renderActiveSection()}
      </Card>

      {/* Save Actions */}
      <Card className="text-center shadow-lg" animation="fadeInUp">
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button variant="outline" onClick={onCancel} className="flex items-center space-x-2">
            <X className="h-4 w-4" />
            <span>Anulează modificările</span>
          </Button>
          <Button onClick={handleSave} loading={loading} className="flex items-center space-x-2">
            <Save className="h-4 w-4" />
            <span>Salvează planul</span>
          </Button>
        </div>
      </Card>
    </div>
  );
};