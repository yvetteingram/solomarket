/// <reference types="vite/client" />
import { createClient, SupabaseClient } from '@supabase/supabase-js';

let supabaseInstance: SupabaseClient | null = null;

export const getSupabase = (): SupabaseClient => {
  if (supabaseInstance) return supabaseInstance;

  // Browser (Vite): import.meta.env requires VITE_ prefix
  // Netlify functions (Node): process.env, no VITE_ prefix needed
  const supabaseUrl =
    (typeof import.meta !== 'undefined' ? import.meta.env?.VITE_SUPABASE_URL : undefined) ||
    (typeof process !== 'undefined' ? process.env?.SUPABASE_URL : undefined) ||
    '';

  const supabaseKey =
    (typeof import.meta !== 'undefined' ? import.meta.env?.VITE_SUPABASE_ANON_KEY : undefined) ||
    (typeof process !== 'undefined' ? process.env?.SUPABASE_ANON_KEY : undefined) ||
    '';

  if (!supabaseUrl || !supabaseKey) {
    throw new Error(
      'Supabase credentials missing. ' +
      'Ensure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set in your Netlify environment variables, ' +
      'and SUPABASE_URL and SUPABASE_ANON_KEY are set for Netlify functions.'
    );
  }

  supabaseInstance = createClient(supabaseUrl, supabaseKey, {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
    },
  });

  return supabaseInstance;
};

// Proxy for backwards-compatible default import: import { supabase } from './supabase'
export const supabase = new Proxy({} as SupabaseClient, {
  get: (_target, prop) => {
    const client = getSupabase();
    return (client as any)[prop];
  },
});