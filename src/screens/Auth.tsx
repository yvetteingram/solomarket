import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { supabase } from '../services/supabase';
import { motion } from 'motion/react';
import { LogIn, UserPlus, Mail, Lock, AlertCircle, Loader2, ArrowLeft } from 'lucide-react';

export function Auth() {
  const location = useLocation();
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(location.pathname !== '/signup');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
      } else {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
        });
        if (error) throw error;
        // If Supabase returns a session, user is auto-confirmed and logged in
        if (data.session) {
          // Create the profile row so the app doesn't depend on a DB trigger
          try {
            await fetch('/api/ensure-profile', {
              method: 'POST',
              headers: { Authorization: `Bearer ${data.session.access_token}` },
            });
          } catch (e) {
            console.warn('ensure-profile call failed (non-fatal):', e);
          }
          // Auth context will pick up the session automatically
          return;
        }
        // Fallback message if email confirmation is still enabled
        setMessage('Check your email for the confirmation link!');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred during authentication');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg-main flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 border border-black/5"
      >
        <div className="text-center mb-8">
          <button onClick={() => navigate('/')} className="flex items-center justify-center gap-2 mb-3 hover:opacity-80 transition-opacity mx-auto">
            <div className="w-10 h-10 bg-brand rounded-xl flex items-center justify-center text-white font-bold text-lg">S</div>
            <span className="font-bold text-2xl tracking-tight">SoloMarket</span>
          </button>
          <h1 className="text-xl font-bold text-ink-main mb-1">
            {isLogin ? 'Welcome Back' : 'Create Your Account'}
          </h1>
          <p className="text-sm text-ink-muted">
            {isLogin
              ? 'Sign in to your marketing OS'
              : 'Your AI-powered marketing OS awaits'}
          </p>
        </div>

        <form onSubmit={handleAuth} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-ink-main mb-1">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-ink-muted" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-bg-main border border-black/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                placeholder="you@example.com"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-ink-main mb-1">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-ink-muted" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-bg-main border border-black/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                placeholder="••••••••"
                minLength={6}
              />
            </div>
          </div>


          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-50 text-red-600 rounded-xl text-sm border border-red-100">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <p>{error}</p>
            </div>
          )}

          {message && (
            <div className="flex items-center gap-2 p-3 bg-emerald-50 text-emerald-600 rounded-xl text-sm border border-emerald-100">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <p>{message}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : isLogin ? (
              <>
                <LogIn className="w-5 h-5" />
                Sign In
              </>
            ) : (
              <>
                <UserPlus className="w-5 h-5" />
                Create Account
              </>
            )}
          </button>
        </form>

        <div className="mt-6 text-center space-y-3">
          <button
            onClick={() => {
              const target = isLogin ? '/signup' : '/login';
              setIsLogin(!isLogin);
              setError(null);
              setMessage(null);
              navigate(target, { replace: true });
            }}
            className="text-sm text-emerald-600 hover:text-emerald-700 font-medium transition-colors"
          >
            {isLogin
              ? "Don't have an account? Sign up"
              : "Already have an account? Login"}
          </button>
          <div>
            <button
              onClick={() => navigate('/')}
              className="text-sm text-slate-400 hover:text-slate-600 transition-colors inline-flex items-center gap-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Back to home
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
