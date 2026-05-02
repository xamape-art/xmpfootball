import { createContext, useContext, useEffect, useState } from 'react';
import type { User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

const ADMIN_EMAIL = 'xamape@gmail.com';

interface AuthContextValue {
  user: User | null;
  isAdmin: boolean;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<string | null>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

// Returns true if the user is allowed to access the app
async function checkAccess(u: User): Promise<boolean> {
  if (u.email === ADMIN_EMAIL) return true;
  const { data, error } = await supabase
    .from('app_users')
    .select('id')
    .eq('id', u.id)
    .maybeSingle();
  if (error) return true; // table might not exist yet — don't block
  return data !== null;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      const u = session?.user ?? null;
      if (u) {
        const allowed = await checkAccess(u);
        if (!allowed) { await supabase.auth.signOut(); setUser(null); setLoading(false); return; }
      }
      setUser(u);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      const u = session?.user ?? null;
      if (u) {
        const allowed = await checkAccess(u);
        if (!allowed) { await supabase.auth.signOut(); setUser(null); return; }
      }
      setUser(u);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string): Promise<string | null> => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      if (error.message.includes('Invalid login credentials')) return 'Email o contraseña incorrectos';
      if (error.message.includes('Email not confirmed')) return 'El administrador debe desactivar la confirmación de email en Supabase';
      return error.message;
    }
    return null;
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ user, isAdmin: user?.email === ADMIN_EMAIL, loading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be inside AuthProvider');
  return ctx;
}
