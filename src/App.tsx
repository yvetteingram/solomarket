import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { Menu } from 'lucide-react';
import { AppSidebar } from './components/AppSidebar';
import { Dashboard } from './screens/Dashboard';
import { Plans } from './screens/Plans';
import { ContentLab } from './screens/ContentLab';
import { Systems } from './screens/Systems';
import { Marketplace } from './screens/Marketplace';
import { Agency } from './screens/Agency';
import { Leads } from './screens/Leads';
import { Analytics } from './screens/Analytics';
import { Settings } from './screens/Settings';
import { Calendar } from './screens/Calendar';
import { Onboarding } from './components/Onboarding';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Auth } from './screens/Auth';
import { LandingPage } from './screens/LandingPage';
import { QuickStart } from './screens/QuickStart';
import { AIAssistant } from './screens/AIAssistant';
import { apiFetch } from './services/api';

const ROUTE_TO_ID: Record<string, string> = {
  '/': 'dashboard',
  '/plans': 'plans',
  '/campaigns': 'campaigns',
  '/content': 'content',
  '/calendar': 'calendar',
  '/leads': 'leads',
  '/analytics': 'analytics',
  '/settings': 'settings',
  '/ai-assistant': 'ai-assistant',
  '/marketplace': 'marketplace',
  '/agency': 'agency',
  '/welcome': 'dashboard',
};

const ID_TO_ROUTE: Record<string, string> = {
  'dashboard': '/',
  'plans': '/plans',
  'campaigns': '/campaigns',
  'content': '/content',
  'calendar': '/calendar',
  'leads': '/leads',
  'analytics': '/analytics',
  'ai-assistant': '/ai-assistant',
  'marketplace': '/marketplace',
  'agency': '/agency',
  'settings': '/settings',
};

function AppContent() {
  const { user, loading } = useAuth();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  // Onboarding state
  const [onboardingChecked, setOnboardingChecked] = useState(false);
  const [hasProducts, setHasProducts] = useState(false);
  const [hasPlans, setHasPlans] = useState(false);
  const [hasPosts, setHasPosts] = useState(false);

  useEffect(() => {
    if (!user) return;

    Promise.all([
      apiFetch('/api/products').then(r => r.ok ? r.json() : []),
      apiFetch('/api/plans').then(r => r.ok ? r.json() : []),
      apiFetch('/api/posts').then(r => r.ok ? r.json() : []),
    ]).then(([products, plans, posts]) => {
      const hp = Array.isArray(products) && products.length > 0;
      const hpl = Array.isArray(plans) && plans.length > 0;
      const hpo = Array.isArray(posts) && posts.length > 0;
      setHasProducts(hp);
      setHasPlans(hpl);
      setHasPosts(hpo);

      // Mark onboarding complete once user has any data
      if (hp || hpl || hpo) {
        localStorage.setItem(`onboarding_done_${user.id}`, '1');
      }

      // Only redirect brand-new users who have never completed onboarding
      const onboardingDone = localStorage.getItem(`onboarding_done_${user.id}`);
      if (!onboardingDone && !hp && !hpl && !hpo && location.pathname === '/') {
        navigate('/welcome', { replace: true });
      }
      setOnboardingChecked(true);
    }).catch(() => {
      setOnboardingChecked(true);
    });
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen bg-bg-main flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <Routes>
        <Route path="/login" element={<Auth />} />
        <Route path="/signup" element={<Auth />} />
        <Route path="/quick-start" element={<QuickStart />} />
        <Route path="*" element={<LandingPage />} />
      </Routes>
    );
  }

  const activeItem = ROUTE_TO_ID[location.pathname] || 'dashboard';

  const handleNavigate = (id: string) => {
    const route = ID_TO_ROUTE[id];
    if (route) navigate(route);
  };

  return (
    <div className="min-h-screen bg-bg-main flex">
      <AppSidebar
        activeItem={activeItem}
        onNavigate={handleNavigate}
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        mobileOpen={mobileMenuOpen}
        onMobileToggle={() => setMobileMenuOpen(false)}
      />

      {/* Mobile header */}
      <div className="fixed top-0 left-0 right-0 h-14 bg-white border-b border-slate-200 flex items-center px-4 z-30 md:hidden">
        <button
          onClick={() => setMobileMenuOpen(true)}
          className="p-2 hover:bg-slate-100 rounded-lg text-slate-600"
        >
          <Menu size={22} />
        </button>
        <div className="flex items-center gap-2 ml-2">
          <div className="w-7 h-7 bg-brand rounded-lg flex items-center justify-center text-white font-bold text-sm">S</div>
          <span className="font-bold text-base tracking-tight">SoloMarket</span>
        </div>
      </div>

      <main
        className={`flex-1 transition-all duration-300 p-4 pt-18 md:p-8 ${
          sidebarCollapsed ? 'md:ml-16' : 'md:ml-64'
        } ml-0`}
      >
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/welcome" element={
            <Onboarding hasProducts={hasProducts} hasPlans={hasPlans} hasPosts={hasPosts} />
          } />
          <Route path="/plans" element={<Plans />} />
          <Route path="/campaigns" element={<Systems />} />
          <Route path="/content" element={<ContentLab />} />
          <Route path="/calendar" element={<Calendar />} />
          <Route path="/leads" element={<Leads />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/ai-assistant" element={<AIAssistant />} />
          <Route path="/marketplace" element={<Marketplace />} />
          <Route path="/agency" element={<Agency />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/quick-start" element={<QuickStart />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </BrowserRouter>
  );
}
