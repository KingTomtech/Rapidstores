import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type { Env, User } from '../types';

let supabaseInstance: SupabaseClient | null = null;

export function getSupabase(env: Env, userToken?: string): SupabaseClient {
  if (!supabaseInstance) {
    supabaseInstance = createClient(env.SUPABASE_URL, env.SUPABASE_KEY, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });
  }

  // If user token provided, create a new client with user auth
  if (userToken) {
    return createClient(env.SUPABASE_URL, env.SUPABASE_KEY, {
      global: {
        headers: {
          Authorization: `Bearer ${userToken}`
        }
      },
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });
  }

  return supabaseInstance;
}

export async function getCurrentUser(
  supabase: SupabaseClient
): Promise<User | null> {
  const { data: { user }, error } = await supabase.auth.getUser();
  
  if (error || !user) {
    return null;
  }

  // Get additional user data from profiles table
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  return {
    id: user.id,
    email: user.email || undefined,
    phone: profile?.phone || user.phone || '',
    full_name: profile?.full_name || user.user_metadata?.full_name || '',
    role: profile?.role || 'customer',
    created_at: user.created_at
  };
}

export async function requireAdmin(
  supabase: SupabaseClient
): Promise<User | null> {
  const user = await getCurrentUser(supabase);
  
  if (!user || user.role !== 'admin') {
    return null;
  }

  return user;
}
