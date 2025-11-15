import { supabase } from '@/utils/supabase';
import type { User, Session, AuthError } from '@supabase/supabase-js';

export interface SignUpData {
  email: string;
  password: string;
  username?: string;
}

export interface SignInData {
  email: string;
  password: string;
}

export interface UserProfile {
  id: string;
  email: string;
  username: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

/**
 * Sign up a new user
 * @param email - User's email address
 * @param password - User's password
 * @param username - Optional username
 * @returns Object with user, session, and error
 */
export async function signUp({ email, password, username }: SignUpData): Promise<{
  user: User | null;
  session: Session | null;
  error: AuthError | null;
}> {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username: username || email.split('@')[0],
        },
      },
    });

    if (error) {
      return { user: null, session: null, error };
    }

    // Profile is auto-created via trigger, but we can ensure it exists
    if (data.user) {
      // Wait a bit for the trigger to execute
      await new Promise(resolve => setTimeout(resolve, 500));

      // Ensure profile exists
      const { error: profileError } = await supabase
        .from('user_profiles')
        .upsert({
          id: data.user.id,
          email: data.user.email!,
          username: username || data.user.email?.split('@')[0] || null,
        }, {
          onConflict: 'id'
        });

      if (profileError) {
        console.error('Error creating user profile:', profileError);
      }
    }

    return {
      user: data.user,
      session: data.session,
      error: null,
    };
  } catch (error) {
    console.error('Error signing up:', error);
    return {
      user: null,
      session: null,
      error: error as AuthError,
    };
  }
}

/**
 * Sign in an existing user
 * @param email - User's email address
 * @param password - User's password
 * @returns Object with user, session, and error
 */
export async function signIn({ email, password }: SignInData): Promise<{
  user: User | null;
  session: Session | null;
  error: AuthError | null;
}> {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return { user: null, session: null, error };
    }

    return {
      user: data.user,
      session: data.session,
      error: null,
    };
  } catch (error) {
    console.error('Error signing in:', error);
    return {
      user: null,
      session: null,
      error: error as AuthError,
    };
  }
}

/**
 * Sign out the current user
 * @returns Error if sign out fails
 */
export async function signOut(): Promise<{ error: AuthError | null }> {
  try {
    const { error } = await supabase.auth.signOut();
    return { error };
  } catch (error) {
    console.error('Error signing out:', error);
    return { error: error as AuthError };
  }
}

/**
 * Get the current authenticated user
 * @returns Current user or null
 */
export async function getCurrentUser(): Promise<User | null> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    return user;
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
}

/**
 * Get the current session
 * @returns Current session or null
 */
export async function getCurrentSession(): Promise<Session | null> {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    return session;
  } catch (error) {
    console.error('Error getting current session:', error);
    return null;
  }
}

/**
 * Get user profile from user_profiles table
 * @param userId - User ID
 * @returns User profile or null
 */
export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  try {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error getting user profile:', error);
    return null;
  }
}

/**
 * Subscribe to authentication state changes
 * @param callback - Function to call when auth state changes
 * @returns Function to unsubscribe
 */
export function onAuthStateChange(
  callback: (event: 'SIGNED_IN' | 'SIGNED_OUT' | 'TOKEN_REFRESHED' | 'USER_UPDATED', session: Session | null) => void
): () => void {
  const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
    callback(event as 'SIGNED_IN' | 'SIGNED_OUT' | 'TOKEN_REFRESHED' | 'USER_UPDATED', session);
  });

  return () => {
    subscription.unsubscribe();
  };
}

