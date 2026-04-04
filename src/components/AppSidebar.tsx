import React, { useState } from 'react';
import {
  LayoutDashboard,
  Target,
  Megaphone,
  FlaskConical,
  Calendar,
  Users,
  BarChart3,
  Settings,
  ChevronLeft,
  ChevronRight,
  LogOut,
  MessageSquareText,
  X,
  Bot,
  ShoppingBag,
  Building2,
  Rocket,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface SidebarItemProps {
  icon: React.ElementType;
  label: string;
  active?: boolean;
  onClick: () => void;
  collapsed?: boolean;
  key?: string | number;
}

const SidebarItem = ({ icon: Icon, label, active, onClick, collapsed }: SidebarItemProps) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 ${
      active
        ? 'bg-brand/10 text-brand font-medium'
        : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'
    }`}
  >
    <Icon size={20} className={active ? 'text-brand' : ''} />
    {!collapsed && <span className="text-sm">{label}</span>}
  </button>
);

interface AppSidebarProps {
  activeItem: string;
  onNavigate: (item: string) => void;
  collapsed: boolean;
  onToggle: () => void;
  mobileOpen: boolean;
  onMobileToggle: () => void;
}

export const AppSidebar = ({ activeItem, onNavigate, collapsed, onToggle, mobileOpen, onMobileToggle }: AppSidebarProps) => {
  const { user, plan, signOut } = useAuth();
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [feedbackText, setFeedbackText] = useState('');
  const [feedbackSent, setFeedbackSent] = useState(false);

  const items = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'plans', label: 'Plans', icon: Target },
    { id: 'campaigns', label: 'Systems', icon: Megaphone },
    { id: 'content', label: 'Content Lab', icon: FlaskConical },
    { id: 'calendar', label: 'Calendar', icon: Calendar },
    { id: 'leads', label: 'Leads', icon: Users },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'ai-assistant', label: 'AI Assistant', icon: Bot },
    { id: 'marketplace', label: 'Marketplace', icon: ShoppingBag },
    { id: 'agency', label: 'Agency', icon: Building2 },
    { id: 'settings', label: 'Settings', icon: Settings },
    { id: 'quick-start', label: 'Quick Start', icon: Rocket },
  ];

  const handleSendFeedback = () => {
    if (!feedbackText.trim()) return;
    // Open mailto with prefilled subject and body
    const subject = encodeURIComponent('SoloMarket Feedback');
    const body = encodeURIComponent(`Feedback from ${user?.email || 'user'}:\n\n${feedbackText}`);
    window.open(`mailto:ketorah.digital@gmail.com?subject=${subject}&body=${body}`, '_blank');
    setFeedbackText('');
    setFeedbackSent(true);
    setTimeout(() => {
      setFeedbackSent(false);
      setFeedbackOpen(false);
    }, 2000);
  };

  const handleNavClick = (id: string) => {
    onNavigate(id);
    onMobileToggle(); // close mobile menu on navigate
  };

  return (
    <>
      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 bg-slate-900/40 z-40 md:hidden" onClick={onMobileToggle} />
      )}

      <aside
        className={`fixed left-0 top-0 h-screen bg-white border-r border-slate-200 transition-all duration-300 z-50 flex flex-col
          ${collapsed ? 'w-16' : 'w-64'}
          ${mobileOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0
        `}
      >
        <div className="p-4 flex items-center justify-between border-b border-slate-100">
          {!collapsed && (
            <button onClick={() => onNavigate('dashboard')} className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              <div className="w-8 h-8 bg-brand rounded-lg flex items-center justify-center text-white font-bold">S</div>
              <span className="font-bold text-lg tracking-tight">SoloMarket</span>
            </button>
          )}
          <button
            onClick={onToggle}
            className="p-1 hover:bg-slate-100 rounded-md text-slate-400"
          >
            {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          </button>
        </div>

        <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
          {items.map((item) => (
            <SidebarItem
              key={item.id}
              icon={item.icon}
              label={item.label}
              active={activeItem === item.id}
              onClick={() => handleNavClick(item.id)}
              collapsed={collapsed}
            />
          ))}
        </nav>

        <div className="px-2 pb-2">
          <button
            onClick={() => setFeedbackOpen(true)}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 text-slate-500 hover:bg-amber-50 hover:text-amber-700"
          >
            <MessageSquareText size={20} />
            {!collapsed && <span className="text-sm font-medium">Send Feedback</span>}
          </button>
        </div>

        <div className="p-4 border-t border-slate-100 space-y-2">
          {!collapsed && (
            <div className="flex items-center gap-3 px-2 py-2">
              <div className="w-8 h-8 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center font-bold text-xs">
                {user?.email?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div className="flex flex-col overflow-hidden">
                <span className="text-xs font-medium text-slate-900 truncate">{user?.email}</span>
                <span className="text-[10px] text-slate-400 font-medium capitalize">{plan === 'free' ? 'Free Plan' : `${plan} Plan`}</span>
              </div>
            </div>
          )}
          <button
            onClick={() => signOut()}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 text-red-500 hover:bg-red-50"
          >
            <LogOut size={20} />
            {!collapsed && <span className="text-sm font-medium">Logout</span>}
          </button>
        </div>
      </aside>

      {/* Feedback Modal */}
      {feedbackOpen && (
        <>
          <div className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-[80]" onClick={() => setFeedbackOpen(false)} />
          <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-white rounded-2xl shadow-2xl z-[90] p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-lg text-slate-900">Send Feedback</h3>
              <button onClick={() => setFeedbackOpen(false)} className="p-1 hover:bg-slate-100 rounded-full text-slate-400">
                <X size={20} />
              </button>
            </div>
            <p className="text-sm text-slate-500 mb-4">
              Help us improve SoloMarket! Share what you love, what's broken, or what you'd like to see next.
            </p>
            {feedbackSent ? (
              <div className="py-8 text-center">
                <div className="text-4xl mb-3">Thanks!</div>
                <p className="text-sm text-slate-600">Your feedback helps us build a better product.</p>
              </div>
            ) : (
              <>
                <textarea
                  value={feedbackText}
                  onChange={(e) => setFeedbackText(e.target.value)}
                  placeholder="What's on your mind?"
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-brand/20 h-32 resize-none mb-4"
                  autoFocus
                />
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => setFeedbackOpen(false)}
                    className="px-4 py-2 text-sm font-medium text-slate-500 hover:text-slate-700"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSendFeedback}
                    disabled={!feedbackText.trim()}
                    className="px-6 py-2 bg-brand text-white text-sm font-bold rounded-xl hover:bg-brand/90 transition-colors disabled:opacity-50"
                  >
                    Send Feedback
                  </button>
                </div>
              </>
            )}
          </div>
        </>
      )}
    </>
  );
};
