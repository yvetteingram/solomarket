import { getSupabase } from './supabase';

/**
 * Authenticated fetch wrapper that includes the Supabase session token
 * in the Authorization header for all API requests.
 */
export async function apiFetch(path: string, options: RequestInit = {}): Promise<Response> {
  const supabase = getSupabase();
  const { data: { session } } = await supabase.auth.getSession();

  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string> || {}),
  };

  if (session?.access_token) {
    headers['Authorization'] = `Bearer ${session.access_token}`;
  }

  // Set Content-Type for JSON bodies if not already set
  if (options.body && typeof options.body === 'string' && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  }

  return fetch(path, { ...options, headers });
}
