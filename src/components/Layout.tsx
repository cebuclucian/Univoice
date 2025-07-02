import React from 'react';
import { Outlet, Link, useLocation, Navigate, useNavigate } from 'react-router-dom';
import { Brain, User, LogOut, Settings, BarChart3, Target } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTranslation } from '../hooks/useTranslation';
import { Button } from './ui/Button';

export const Layout: React.FC = () => {
  const { user, signOut, loading } = useAuth();
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  const navigation = [
    { name: t('nav.dashboard'), href: '/app/dashboard', icon: BarChart3 },
    { name: 'Planuri Marketing', href: '/app/plans', icon: Target },
    { name: t('nav.brandVoice'), href: '/app/onboarding', icon: User },
    { name: t('nav.account'), href: '/app/account', icon: Settings },
  ];

  const handleSignOut = async () => {
    await signOut();
    navigate('/'); // Redirect to home page after logout
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <nav className="bg-white/80 backdrop-blur-md shadow-sm border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex justify-between h-20">
            <div className="flex items-center">
              <Link to="/app/dashboard" className="flex items-center space-x-3 group">
                <div className="p-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl group-hover:scale-105 transition-transform duration-200">
                  <Brain className="h-8 w-8 text-white" />
                </div>
                <span className="font-bold text-xl text-gray-900 hidden sm:block">
                  {t('nav.univoice')}
                </span>
              </Link>
            </div>
            
            <div className="hidden md:flex items-center space-x-2">
              {navigation.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`
                      flex items-center space-x-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200
                      ${isActive 
                        ? 'bg-blue-100 text-blue-700 shadow-sm' 
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                      }
                    `}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
              
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSignOut}
                className="flex items-center space-x-2 ml-4"
              >
                <LogOut className="h-4 w-4" />
                <span>{t('auth.signOut')}</span>
              </Button>
            </div>
          </div>
        </div>
      </nav>
      
      <main className="max-w-7xl mx-auto px-6 lg:px-8 py-12">
        <div className="animate-fade-in-up">
          <Outlet />
        </div>
      </main>
    </div>
  );
};