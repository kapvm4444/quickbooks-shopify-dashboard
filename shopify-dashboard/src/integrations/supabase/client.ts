
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type { Database } from './types';

// Singleton instance wrapper
let supabaseInstance: SupabaseClient<Database> | null = null;
let initPromise: Promise<void> | null = null;

// Initialize Supabase with keys
export const initSupabase = (url: string, key: string) => {
  if (!supabaseInstance) {
    supabaseInstance = createClient<Database>(url, key, {
      auth: {
        storage: localStorage,
        persistSession: true,
        autoRefreshToken: true,
      }
    });
  }
};

export const getSupabase = () => {
  if (!supabaseInstance) {
    throw new Error("Supabase accessed before initialization");
  }
  return supabaseInstance;
}


// Proxy to make imports work seamlessly for methods like 'from', 'auth', 'storage'
// Usage: supabase.from('table').select('*')
export const supabase = new Proxy({} as SupabaseClient<Database>, {
  get: (target, prop) => {
    // Allow access to 'auth' even if not init, so we can try-catch it or check status
    if (!supabaseInstance) {
      if (prop === 'auth') {
        // Return a dummy auth object that throws or returns null to signal not ready
        return {
          getSession: async () => ({ data: { session: null }, error: new Error("Supabase not initialized") }),
          signInWithPassword: async () => ({ data: {}, error: new Error("Supabase not initialized") }),
          signOut: async () => ({ error: null }),
          onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => { } } } })
        };
      }
      // For other properties, warn but allow valid object return to prevent crashes on property access
      console.warn("Supabase accessed before init.");
      return () => { throw new Error("Supabase not initialized"); };
    }
    return Reflect.get(supabaseInstance, prop);
  }
});

export const isSupabaseInitialized = () => !!supabaseInstance;
