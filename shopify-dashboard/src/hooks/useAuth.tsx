import { useState, useEffect, createContext, useContext, useRef } from "react";
import { supabase, isSupabaseInitialized } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { default as hotToast } from "react-hot-toast";
import { useLocation } from "react-router-dom";

interface AuthContextValue {
  user: any | null;
  loading: boolean;
  login: (email: string, pass: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  loading: true,
  login: async () => { },
  logout: async () => { },
});

// STATIC CREDENTIALS
const SYSTEM_EMAIL = "admin@admin.com";
const SYSTEM_PASS = "123456";

const MOCK_USER = {
  id: "static-admin-123",
  email: SYSTEM_EMAIL,
  app_metadata: { provider: "static" },
  user_metadata: { full_name: "Admin User" },
  aud: "authenticated",
  created_at: new Date().toISOString(),
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const location = useLocation();
  const notifRef = useRef(false);

  // Effect to handle connection toasts ONLY upon login/auth
  useEffect(() => {
    if (!user) return; // Don't show if not logged in

    // Prevent double toast if already shown for this session
    if (notifRef.current) return;
    notifRef.current = true;

    const runChecks = async () => {
      const initialized = isSupabaseInitialized();
      console.log("Supabase Initialized Status:", initialized);

      // Check Supabase
      if (initialized) {
        hotToast.success("Connected to Supabase", {
          duration: 4000,
          style: {
            borderRadius: '12px',
            background: '#18181b', // Zinc-950
            color: '#fafafa', // Zinc-50
            border: '1px solid #27272a',
            fontSize: '14px',
            fontWeight: '500',
          },
          iconTheme: {
            primary: '#4ade80',
            secondary: '#18181b',
          },
        });
      } else {
        hotToast.error("Supabase Not Connected", {
          duration: 5000,
          style: {
            borderRadius: '12px',
            background: '#ef4444',
            color: '#fff',
            fontSize: '14px',
            fontWeight: '500',
          },
        });
      }

      // Check QuickBooks Server (Backend)
      try {
        const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";
        const response = await fetch(`${BASE_URL}/`); // Health check
        if (response.ok) {
          hotToast.success("QuickBooks Server Connected", {
            duration: 4000,
            style: {
              borderRadius: '12px',
              background: '#18181b',
              color: '#fafafa',
              border: '1px solid #27272a',
              fontSize: '14px',
              marginTop: '8px',
              fontWeight: '500',
            },
            iconTheme: {
              primary: '#3b82f6', // Blue for QB
              secondary: '#18181b',
            },
          });
        } else {
          throw new Error("Server Error");
        }
      } catch (err) {
        hotToast.error("QuickBooks Server Disconnected", {
          duration: 6000,
          style: {
            borderRadius: '12px',
            background: '#ef4444',
            color: '#fff',
            fontSize: '14px',
            marginTop: '8px',
            fontWeight: '500',
          },
        });
      }
    };

    // Small delay to ensure UI is ready
    setTimeout(runChecks, 500);

  }, [user]);

  // Initial Session Check
  useEffect(() => {
    let authListener: { subscription: { unsubscribe: () => void } } | null = null;

    const checkSession = async () => {
      // 1. Check for Static Session
      const staticUser = localStorage.getItem("static_auth_user");
      if (staticUser) {
        setUser(JSON.parse(staticUser));
        setLoading(false);
        return;
      }

      // 2. Check for Supabase Session (if initialized)
      if (isSupabaseInitialized()) {
        try {
          const { data: { session } } = await supabase.auth.getSession();
          if (session?.user) {
            setUser(session.user);
          }

          // Listen for changes
          const { data } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null);
            setLoading(false); // Ensure loading stops even on auth change
          });
          authListener = data;
        } catch (err) {
          console.error("Supabase session check check failed", err);
        }
      }

      // Always turn off loading after initial check attempts
      setLoading(false);
    };

    checkSession();

    return () => {
      if (authListener) {
        authListener.subscription.unsubscribe();
      }
    };
  }, []);

  const login = async (email: string, pass: string) => {
    // 1. Try Supabase Auth First
    if (isSupabaseInitialized()) {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password: pass,
      });

      if (!error && data.user) {
        setUser(data.user);
        return;
      }

      // If error is specifically passed credentials, fail.
      // But if error implies connection issue, fall through?
      // Supabase JS doesn't always expose error codes clearly for "connection failed" vs "wrong password" reliably in one go, 
      // but "invalid_grant" is wrong password. "fetch failed" is connection.

      if (error.message.includes("Invalid login credentials")) {
        throw error;
      }
      // If other error (like not init, or network), proceed to check static check below?
      // User requested: "only sign in statically if supabase is not connected"
      console.warn("Supabase login failed, checking failsafe...", error);
    }

    // 2. Failsafe / Static Validation
    // We arrive here if Supabase is NOT initialized OR Supabase login failed (potentially due to connection).
    if (email === SYSTEM_EMAIL && pass === SYSTEM_PASS) {
      // If Supabase WAS initialized but invalid creds, we shouldn't be here (caught above).
      // So we strictly check if Supabase is down/uninit OR if the user intends to use static fallback explicitly.

      if (!isSupabaseInitialized()) {
        setUser(MOCK_USER);
        localStorage.setItem("static_auth_user", JSON.stringify(MOCK_USER));
        toast({
          title: "Supabase Disconnected",
          description: "Logged in using failsafe static credentials.",
          variant: 'destructive'
        });
        return;
      } else {
        // Supabase IS init, but maybe failed?
        // Since we didn't return above, it means Supabase login failed.
        // If we rely on static creds, we allow it.
        // BUT user said "only sign in statically if supabase is not connected".
        // We can check `isSupabaseInitialized` again.
        // If it IS initialized, we probably should have succeeded with real auth if creds were right (assuming user exists in Supabase).
        // But if the user hasn't set up Supabase users yet, they might rely on this static admin.

        // Strict interpretation:
        throw new Error("Invalid credentials (Supabase connected)");
      }
    }

    if (!isSupabaseInitialized()) {
      // If generic login attempt while down
      toast({
        title: "Connection Error",
        description: "Authentication service is unavailable.",
        variant: "destructive"
      });
      throw new Error("Auth unavailable");
    }

    throw new Error("Invalid email or password");
  };

  const logout = async () => {
    localStorage.removeItem("static_auth_user");
    setUser(null);
    notifRef.current = false; // Reset toast flag so they show up again on next login
    if (isSupabaseInitialized()) {
      await supabase.auth.signOut();
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
