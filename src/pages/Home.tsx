import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Brain, 
  ArrowRight, 
  MessageSquare, 
  Target, 
  TrendingUp,
  CheckCircle,
  Sparkles,
  Users,
  Calendar,
  Zap
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';

export const Home: React.FC = () => {
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation Header */}
      <nav className="bg-white/95 backdrop-blur-md shadow-sm border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <Link to="/" className="flex items-center space-x-3 group">
              <div className="p-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl group-hover:scale-105 transition-transform duration-200 animate-icon-glow">
                <Brain className="h-8 w-8 text-white animate-icon-pulse" />
              </div>
              <span className="font-bold text-2xl text-gray-900">Univoice</span>
            </Link>
            
            <div className="flex items-center space-x-4">
              <Link to="/auth">
                <Button variant="ghost" className="text-gray-700 hover:text-gray-900">
                  Autentificare
                </Button>
              </Link>
              <Link to="/auth">
                <Button className="shadow-md hover:shadow-lg">
                  Creează Cont Gratuit
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-white to-purple-50 py-24 lg:py-32">
        {/* Animated Background */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-32 w-96 h-96 bg-gradient-to-br from-blue-200/30 to-purple-200/30 rounded-full blur-3xl animate-pulse-soft"></div>
          <div className="absolute -bottom-40 -left-32 w-96 h-96 bg-gradient-to-tr from-purple-200/30 to-blue-200/30 rounded-full blur-3xl animate-pulse-soft" style={{ animationDelay: '1s' }}></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-r from-blue-100/20 to-purple-100/20 rounded-full blur-2xl animate-pulse-soft" style={{ animationDelay: '2s' }}></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-6 lg:px-8 text-center">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-5xl lg:text-7xl font-bold text-gray-900 mb-8 leading-tight animate-fade-in-up">
              Spune adio marketingului{' '}
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                generic
              </span>
              .
            </h1>
            
            <p className="text-xl lg:text-2xl text-gray-600 mb-12 leading-relaxed animate-fade-in-up animate-stagger-1">
              Univoice este strategul tău de marketing care învață vocea unică a brandului tău pentru a crea conținut autentic ce atrage clienți.
            </p>
            
            <div className="animate-fade-in-up animate-stagger-2">
              <Link to="/auth">
                <Button size="lg" className="text-lg px-12 py-4 shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300">
                  <Sparkles className="h-6 w-6 mr-3 animate-icon-float" />
                  Definește-ți Vocea Gratuit
                  <ArrowRight className="h-6 w-6 ml-3 icon-hover-bounce" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Te regăsești? Section */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6 animate-fade-in-up">
              Marketingul poate fi copleșitor.
            </h2>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <Card 
              className="text-center shadow-lg border-0 bg-gradient-to-br from-red-50 to-orange-50"
              padding="lg"
              animation="slideInLeft"
              delay={1}
              hover="subtle"
            >
              <div className="p-4 bg-red-100 rounded-2xl mb-6 inline-block animate-icon-glow icon-hover-shake">
                <MessageSquare className="h-12 w-12 text-red-600 animate-icon-bounce" />
              </div>
              <p className="text-gray-700 text-lg leading-relaxed">
                Nu mai știi ce să postezi? Petreci ore căutând idei și totul sună la fel ca pe ChatGPT?
              </p>
            </Card>

            <Card 
              className="text-center shadow-lg border-0 bg-gradient-to-br from-yellow-50 to-amber-50"
              padding="lg"
              animation="scaleIn"
              delay={2}
              hover="subtle"
            >
              <div className="p-4 bg-yellow-100 rounded-2xl mb-6 inline-block animate-icon-glow icon-hover-pulse">
                <Users className="h-12 w-12 text-yellow-600 animate-icon-float" />
              </div>
              <p className="text-gray-700 text-lg leading-relaxed">
                Simți că vocea ta se pierde? Conținutul tău nu reflectă pasiunea din spatele afacerii tale?
              </p>
            </Card>

            <Card 
              className="text-center shadow-lg border-0 bg-gradient-to-br from-blue-50 to-indigo-50"
              padding="lg"
              animation="slideInRight"
              delay={3}
              hover="subtle"
            >
              <div className="p-4 bg-blue-100 rounded-2xl mb-6 inline-block animate-icon-glow icon-hover-float">
                <TrendingUp className="h-12 w-12 text-blue-600 animate-icon-pulse" />
              </div>
              <p className="text-gray-700 text-lg leading-relaxed">
                Postezi constant dar vânzările nu cresc? E greu să transformi efortul în clienți reali?
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Cum Funcționează Section */}
      <section className="py-24 bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6 animate-fade-in-up">
              Claritate în 3 pași simpli.
            </h2>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            <div className="text-center animate-fade-in-up animate-stagger-1">
              <Card 
                className="shadow-xl border-0 bg-white mb-8"
                padding="lg"
                hover="scale"
              >
                <div className="p-6 bg-gradient-to-br from-blue-100 to-blue-200 rounded-3xl mb-8 inline-block animate-icon-glow icon-hover-bounce">
                  <Target className="h-16 w-16 text-blue-600 animate-icon-pulse" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">1. Definește</h3>
                <p className="text-gray-600 text-lg leading-relaxed">
                  Învață-ne vocea ta unică prin câteva exemple de text și alegând personalitatea brandului tău. Durează 5 minute.
                </p>
              </Card>
            </div>

            <div className="text-center animate-fade-in-up animate-stagger-2">
              <Card 
                className="shadow-xl border-0 bg-white mb-8"
                padding="lg"
                hover="scale"
              >
                <div className="p-6 bg-gradient-to-br from-purple-100 to-purple-200 rounded-3xl mb-8 inline-block animate-icon-glow icon-hover-shake">
                  <Zap className="h-16 w-16 text-purple-600 animate-icon-bounce" style={{ animationDelay: '0.5s' }} />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">2. Generează</h3>
                <p className="text-gray-600 text-lg leading-relaxed">
                  Primești instant planuri de marketing strategice, un calendar de conținut și postări gata de publicat pentru Facebook, Instagram, Website și WhatsApp.
                </p>
              </Card>
            </div>

            <div className="text-center animate-fade-in-up animate-stagger-3">
              <Card 
                className="shadow-xl border-0 bg-white mb-8"
                padding="lg"
                hover="scale"
              >
                <div className="p-6 bg-gradient-to-br from-green-100 to-green-200 rounded-3xl mb-8 inline-block animate-icon-glow icon-hover-float">
                  <TrendingUp className="h-16 w-16 text-green-600 animate-icon-float" style={{ animationDelay: '1s' }} />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">3. Crește</h3>
                <p className="text-gray-600 text-lg leading-relaxed">
                  Publică conținut autentic care rezonează cu audiența ta. Atrage clienții potriviți și urmărește-ți afacerea înflorind.
                </p>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-24 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="max-w-4xl mx-auto px-6 lg:px-8 text-center">
          <h2 className="text-4xl lg:text-5xl font-bold mb-8 animate-fade-in-up">
            Ești gata să-ți faci vocea auzită?
          </h2>
          
          <p className="text-xl lg:text-2xl mb-12 opacity-90 leading-relaxed animate-fade-in-up animate-stagger-1">
            Lasă în urmă conținutul plictisitor. Începe să construiești un brand pe care clienții îl iubesc și în care au încredere.
          </p>
          
          <div className="animate-fade-in-up animate-stagger-2">
            <Link to="/auth">
              <Button 
                variant="outline" 
                size="lg" 
                className="text-lg px-12 py-4 bg-white text-blue-600 border-white hover:bg-gray-50 shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300"
              >
                <CheckCircle className="h-6 w-6 mr-3 animate-icon-pulse" />
                Creează Cont și Voce Gratuit
                <ArrowRight className="h-6 w-6 ml-3 icon-hover-bounce" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row justify-between items-center">
            <div className="flex items-center space-x-3 mb-8 lg:mb-0">
              <div className="p-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl animate-icon-glow">
                <Brain className="h-8 w-8 text-white animate-icon-rotate" />
              </div>
              <span className="font-bold text-2xl">Univoice</span>
            </div>
            
            <div className="flex flex-wrap justify-center lg:justify-end space-x-8 text-gray-400">
              <a href="#" className="hover:text-white transition-colors duration-200">Despre Noi</a>
              <a href="#" className="hover:text-white transition-colors duration-200">Termeni și Condiții</a>
              <a href="#" className="hover:text-white transition-colors duration-200">Confidențialitate</a>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400">
            <p>&copy; 2025 Univoice. Toate drepturile rezervate.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};