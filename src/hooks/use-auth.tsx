
import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  signUp: (email: string, password: string) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Função para limpar completamente o estado de autenticação
const cleanupAuthState = () => {
  // Remove todas as chaves do localStorage relacionadas ao Supabase
  Object.keys(localStorage).forEach((key) => {
    if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
      localStorage.removeItem(key);
    }
  });
  
  // Remove também do sessionStorage se existir
  if (typeof sessionStorage !== 'undefined') {
    Object.keys(sessionStorage).forEach((key) => {
      if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
        sessionStorage.removeItem(key);
      }
    });
  }
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state change:', event, session?.user?.email);
        setSession(session);
        setUser(session?.user ?? null);

        // Create profile if user just signed in and doesn't have one
        if (event === 'SIGNED_IN' && session?.user) {
          setTimeout(async () => {
            try {
              // Check if profile exists
              const { data: existingProfile } = await supabase
                .from('profiles')
                .select('id')
                .eq('id', session.user.id)
                .single();

              // Create profile if it doesn't exist
              if (!existingProfile) {
                console.log('Creating profile for user:', session.user.email);
                const { error } = await supabase
                  .from('profiles')
                  .insert({
                    id: session.user.id,
                    email: session.user.email || '',
                    username: session.user.email?.split('@')[0] || 'Usuário'
                  });

                if (error) {
                  console.error('Error creating profile:', error);
                } else {
                  console.log('Profile created successfully');
                }
              }
            } catch (error) {
              console.error('Error handling profile creation:', error);
            }
          }, 100);
        }

        // Se o usuário fez logout, limpar estado completamente
        if (event === 'SIGNED_OUT') {
          console.log('User signed out, cleaning up state');
          setSession(null);
          setUser(null);
          cleanupAuthState();
        }

        setLoading(false);
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('Initial session check:', session?.user?.email);
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string) => {
    try {
      console.log('Attempting to sign up:', email);
      
      // Limpar estado antes de fazer signup
      cleanupAuthState();
      await supabase.auth.signOut({ scope: 'global' });
      
      const redirectUrl = `${window.location.origin}/`;
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            email: email
          }
        }
      });

      console.log('Sign up response:', { data, error });
      
      if (error) {
        console.error('Sign up error:', error);
        return { error };
      }

      // If user was created and confirmed immediately (no email confirmation required)
      if (data.user && data.session) {
        console.log('User signed up and logged in immediately');
        return { error: null };
      }

      // If user was created but needs email confirmation
      if (data.user && !data.session) {
        console.log('User created, email confirmation required');
        return { 
          error: { 
            message: 'confirm_email',
            details: 'Verifique seu email para confirmar a conta antes de fazer login.'
          }
        };
      }

      return { error: null };
    } catch (err) {
      console.error('Sign up catch error:', err);
      return { error: err };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      console.log('Attempting to sign in:', email);
      
      // Limpar estado antes de fazer login
      cleanupAuthState();
      await supabase.auth.signOut({ scope: 'global' });
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      console.log('Sign in response:', { 
        user: data?.user?.email, 
        session: !!data?.session,
        error: error?.message 
      });

      if (error) {
        console.error('Sign in error:', error);
        return { error };
      }

      console.log('Sign in successful, session will be handled by onAuthStateChange');
      return { error: null };
    } catch (err) {
      console.error('Sign in catch error:', err);
      return { error: err };
    }
  };

  const signOut = async () => {
    try {
      console.log('Attempting to sign out');
      setLoading(true);
      
      // Limpar estado local primeiro
      setSession(null);
      setUser(null);
      
      // Limpar localStorage
      cleanupAuthState();
      
      // Fazer logout global no Supabase
      const { error } = await supabase.auth.signOut({ scope: 'global' });
      
      if (error) {
        console.error('Sign out error:', error);
      }
      
      console.log('Sign out completed, redirecting to home');
      
      // Forçar redirecionamento para home
      window.location.href = '/';
      
    } catch (err) {
      console.error('Sign out catch error:', err);
    } finally {
      // Garantir que o estado seja limpo mesmo se houver erro
      setSession(null);
      setUser(null);
      cleanupAuthState();
      window.location.href = '/';
      setLoading(false);
    }
  };

  const value = {
    user,
    session,
    signUp,
    signIn,
    signOut,
    loading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
