import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import type { User, Session } from '@supabase/supabase-js';
import { signUp, signIn, signOut, getCurrentUser, getCurrentSession, getUserProfile, onAuthStateChange } from '@/services/AuthService';
import type { SignUpData, SignInData, UserProfile } from '@/services/AuthService';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: UserProfile | null;
  loading: boolean;
  signUp: (data: SignUpData) => Promise<{ error: Error | null }>;
  signIn: (data: SignInData) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const loadUser = async () => {
    try {
      const currentUser = await getCurrentUser();
      const currentSession = await getCurrentSession();

      setUser(currentUser);
      setSession(currentSession);

      if (currentUser) {
        const userProfile = await getUserProfile(currentUser.id);
        setProfile(userProfile);
      } else {
        setProfile(null);
      }
    } catch (error) {
      console.error('Error loading user:', error);
      setUser(null);
      setSession(null);
      setProfile(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Load initial user state
    loadUser();

    // Subscribe to auth state changes
    const unsubscribe = onAuthStateChange(async (event, newSession) => {
      setSession(newSession);

      if (newSession?.user) {
        setUser(newSession.user);
        const userProfile = await getUserProfile(newSession.user.id);
        setProfile(userProfile);
      } else {
        setUser(null);
        setProfile(null);
      }
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const handleSignUp = async (data: SignUpData): Promise<{ error: Error | null }> => {
    try {
      const { user: newUser, session: newSession, error } = await signUp(data);

      if (error) {
        return { error: new Error(error.message) };
      }

      if (newUser && newSession) {
        setUser(newUser);
        setSession(newSession);
        // Profile will be created by trigger, but we'll fetch it
        await new Promise(resolve => setTimeout(resolve, 500));
        const userProfile = await getUserProfile(newUser.id);
        setProfile(userProfile);
      }

      return { error: null };
    } catch (error) {
      console.error('Error in handleSignUp:', error);
      return { error: error as Error };
    }
  };

  const handleSignIn = async (data: SignInData): Promise<{ error: Error | null }> => {
    try {
      const { user: signedInUser, session: newSession, error } = await signIn(data);

      if (error) {
        return { error: new Error(error.message) };
      }

      if (signedInUser && newSession) {
        setUser(signedInUser);
        setSession(newSession);
        const userProfile = await getUserProfile(signedInUser.id);
        setProfile(userProfile);
      }

      return { error: null };
    } catch (error) {
      console.error('Error in handleSignIn:', error);
      return { error: error as Error };
    }
  };

  const handleSignOut = async (): Promise<void> => {
    try {
      await signOut();
      setUser(null);
      setSession(null);
      setProfile(null);
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    }
  };

  const refreshProfile = async (): Promise<void> => {
    if (user) {
      const userProfile = await getUserProfile(user.id);
      setProfile(userProfile);
    }
  };

  const value: AuthContextType = {
    user,
    session,
    profile,
    loading,
    signUp: handleSignUp,
    signIn: handleSignIn,
    signOut: handleSignOut,
    refreshProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

