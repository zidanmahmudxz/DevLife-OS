
import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../services/supabase';

interface AuthContextType {
  user: any | null;
  session: any | null;
  loading: boolean;
  signOut: () => Promise<void>;
  isMfaRequired: boolean;
  checkMfa: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<any | null>(null);
  const [session, setSession] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [isMfaRequired, setIsMfaRequired] = useState(false);

  useEffect(() => {
    // Initial session fetch
    (supabase.auth as any).getSession().then(({ data: { session } }: any) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session) checkMfaStatus();
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = (supabase.auth as any).onAuthStateChange((_event: any, session: any) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session) {
        checkMfaStatus();
      } else {
        setIsMfaRequired(false);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const checkMfaStatus = async () => {
    try {
      const { data, error } = await (supabase.auth as any).mfa.getAuthenticatorAssuranceLevel();
      if (error) throw error;
      // If current level is AAL1 but user has MFA set up (nextLevel AAL2), MFA is required
      if (data.nextLevel > data.currentLevel && data.nextLevel === 'aal2') {
        setIsMfaRequired(true);
      } else {
        setIsMfaRequired(false);
      }
    } catch (err) {
      console.error("MFA Check Error:", err);
    }
  };

  const signOut = async () => {
    await (supabase.auth as any).signOut();
    setUser(null);
    setSession(null);
    setIsMfaRequired(false);
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, signOut, isMfaRequired, checkMfa: checkMfaStatus }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
