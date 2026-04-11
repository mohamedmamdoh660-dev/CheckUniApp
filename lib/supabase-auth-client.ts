import { createClient } from '@supabase/supabase-js';
import { supabaseServerClient } from './supabase-server-client';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key';

// The service key is only available on the server. To avoid Next.js replacing it with undefined 
// if it's missing at build time, we dynamically read it from process.env at runtime.
const getServiceKey = () => {
  if (typeof process !== 'undefined' && process.env) {
    return process.env['NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY'] || process.env['SUPABASE_SERVICE_ROLE_KEY'];
  }
  return undefined;
};

const supabaseServiceKey = getServiceKey() || 'placeholder-key';

// Service client with admin privileges - use only on server-side code
export const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

// Client for browser usage with proper session handling
export const supabaseClient = typeof window !== 'undefined' 
  ? supabaseServerClient() 
  : createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });
