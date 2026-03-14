import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { AppSidebar } from './components/AppSidebar';
import { Dashboard } from './screens/Dashboard';
import { Plans } from './screens/Plans';
import { ContentLab } from './screens/ContentLab';
import { Campaigns } from './screens/Campaigns';
import { Leads } from './screens/Leads';
import { Analytics } from './screens/Analytics';
import { Settings } from './screens/Settings';
import { Calendar } from './screens/Calendar';
import { Onboarding } from './components/Onboarding';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Auth } from './screens/Auth';
import { LandingPage } from './screens/LandingPage';
import { QuickStart } from './screens/QuickStart';
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
  'settings': '/settings',
};

function AppContent() {
  const { user, loading } = useAuth();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
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
      />

      <main
        className={`flex-1 transition-all duration-300 p-8 ${
          sidebarCollapsed ? 'ml-16' : 'ml-64'
        }`}
      >
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/welcome" element={
            <Onboarding hasProducts={hasProducts} hasPlans={hasPlans} hasPosts={hasPosts} />
          } />
          <Route path="/plans" element={<Plans />} />
          <Route path="/campaigns" element={<Campaigns />} />
          <Route path="/content" element={<ContentLab />} />
          <Route path="/calendar" element={<Calendar />} />
          <Route path="/leads" element={<Leads />} />
          <Route path="/analytics" element={<Analytics />} />
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
