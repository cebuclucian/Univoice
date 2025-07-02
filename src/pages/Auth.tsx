import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Brain, Mail, Lock, User, ArrowRight, CheckCircle, Sparkles, AlertCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card } from '../components/ui/Card';

export const Auth: React.FC = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: '',
    businessName: '',
  });
  const [error, setError] = useState('');

  const { signUp, signIn } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (isSignUp) {
        const { error } = await signUp(
          formData.email,
          formData.password,
          formData.fullName,
          formData.businessName
        );
        
        if (error) {
          setError(error.message);
        } else {
          // Redirect to dashboard after successful signup
          navigate('/app/dashboard');
        }
      } else {
        const { error } = await signIn(formData.email, formData.password);
        
        if (error) {
          setError(error.message);
        } else {
          // Redirect to dashboard after successful signin
          navigate('/app/dashboard');
        }
      }
    } catch (err: any) {
      setError(err.message || 'A apărut o eroare neașteptată');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.name === 'email' ? e.target.value.trim() : e.target.value
    }));
  };

  const getErrorMessage = (error: string) => {
    if (error.toLowerCase().includes('email not confirmed')) {
      return (
        <div className="space-y-3">
          <div className="flex items-start space-x-2">
            <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium text-red-800">Email-ul nu a fost confirmat</p>
              <p className="text-sm text-red-700 mt-1">
                Pentru a te conecta, trebuie să îți confirmi adresa de email.
              </p>
            </div>
          </div>
          <div className="bg-red-100 rounded-lg p-3 border border-red-200">
            <p className="text-sm text-red-800 font-medium mb-2">Ce trebuie să faci:</p>
            <ol className="text-sm text-red-700 space-y-1 list-decimal list-inside">
              <li>Verifică-ți inbox-ul pentru email-ul de confirmare</li>
              <li>Verifică și folderul de spam/junk</li>
              <li>Dă click pe link-ul de confirmare din email</li>
              <li>Revino aici și încearcă din nou să te conectezi</li>
            </ol>
          </div>
        </div>
      );
    }

    if (error.toLowerCase().includes('email address') && error.toLowerCase().includes('invalid')) {
      return (
        <div className="flex items-start space-x-2">
          <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-medium text-red-800">Adresa de email nu este validă</p>
            <p className="text-sm text-red-700 mt-1">
              Te rugăm să introduci o adresă de email validă (ex: nume@exemplu.com)
            </p>
          </div>
        </div>
      );
    }

    return (
      <div className="flex items-start space-x-2">
        <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
        <p className="text-sm text-red-700">{error}</p>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-6">
      {/* Background Animation */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-32 w-96 h-96 bg-gradient-to-br from-blue-200/20 to-purple-200/20 rounded-full blur-3xl animate-pulse-soft"></div>
        <div className="absolute -bottom-40 -left-32 w-96 h-96 bg-gradient-to-tr from-purple-200/20 to-blue-200/20 rounded-full blur-3xl animate-pulse-soft" style={{ animationDelay: '1s' }}></div>
      </div>

      <div className="relative w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8 animate-fade-in-up">
          <Link to="/" className="inline-flex items-center space-x-3 group mb-8">
            <div className="p-3 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl group-hover:scale-105 transition-transform duration-200 animate-icon-glow">
              <Brain className="h-10 w-10 text-white animate-icon-pulse" />
            </div>
            <span className="font-bold text-3xl text-gray-900">Univoice</span>
          </Link>
          
          <h1 className="text-3xl font-bold text-gray-900 mb-3">
            {isSignUp ? 'Creează-ți contul' : 'Bine ai revenit!'}
          </h1>
          <p className="text-gray-600 text-lg">
            {isSignUp 
              ? 'Începe să-ți construiești vocea unică a brandului' 
              : 'Conectează-te pentru a continua'
            }
          </p>
        </div>

        {/* Auth Form */}
        <Card className="shadow-2xl border-0" animation="scaleIn" padding="lg">
          <form onSubmit={handleSubmit} className="space-y-6">
            {isSignUp && (
              <>
                <Input
                  label="Numele complet"
                  name="fullName"
                  type="text"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  placeholder="Introdu numele tău complet"
                  icon={User}
                  required
                />
                
                <Input
                  label="Numele afacerii (opțional)"
                  name="businessName"
                  type="text"
                  value={formData.businessName}
                  onChange={handleInputChange}
                  placeholder="Numele companiei sau brandului tău"
                  icon={Sparkles}
                />
              </>
            )}

            <Input
              label="Adresa de email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="nume@exemplu.com"
              icon={Mail}
              required
            />

            <Input
              label="Parola"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleInputChange}
              placeholder="Introdu parola"
              icon={Lock}
              required
            />

            {error && (
              <Card className="bg-red-50 border-red-200 text-red-700" padding="sm" animation="slideInLeft">
                {getErrorMessage(error)}
              </Card>
            )}

            <Button
              type="submit"
              loading={loading}
              className="w-full text-lg py-4 shadow-lg hover:shadow-xl"
              size="lg"
            >
              {isSignUp ? (
                <>
                  <CheckCircle className="h-5 w-5 mr-2" />
                  Creează cont gratuit
                </>
              ) : (
                <>
                  <ArrowRight className="h-5 w-5 mr-2" />
                  Conectează-te
                </>
              )}
            </Button>
          </form>

          {/* Toggle Auth Mode */}
          <div className="mt-8 text-center">
            <p className="text-gray-600">
              {isSignUp ? 'Ai deja un cont?' : 'Nu ai încă un cont?'}
            </p>
            <button
              type="button"
              onClick={() => {
                setIsSignUp(!isSignUp);
                setError('');
                setFormData({ email: '', password: '', fullName: '', businessName: '' });
              }}
              className="mt-2 text-blue-600 hover:text-blue-700 font-semibold transition-colors duration-200"
            >
              {isSignUp ? 'Conectează-te aici' : 'Creează un cont gratuit'}
            </button>
          </div>
        </Card>

        {/* Benefits for Sign Up */}
        {isSignUp && (
          <Card className="mt-6 bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200" animation="slideInUp" delay={1}>
            <div className="text-center">
              <h3 className="font-semibold text-gray-900 mb-3">Ce primești gratuit:</h3>
              <div className="space-y-2 text-sm text-gray-700">
                <div className="flex items-center justify-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span>5 planuri de marketing pe lună</span>
                </div>
                <div className="flex items-center justify-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span>Definirea vocii brandului</span>
                </div>
                <div className="flex items-center justify-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span>Conținut personalizat pentru social media</span>
                </div>
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};