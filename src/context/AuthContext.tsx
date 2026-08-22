import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { User, Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

export interface UserProfile {
  id: string;
  display_name: string | null;
  avatar_url: string | null;
  organization: string;
  specialization: string;
  xp: number;
  streak_days: number;
  tests_taken: number;
  badges: string[];
  theme_preference: string;
  last_active_date: string | null;
  weekly_xp?: number;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: UserProfile | null;
  isLoading: boolean;
  isGuest: boolean;
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<{ error: string | null }>;
  signUpWithEmail: (email: string, password: string, name: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  enterGuestMode: () => void;
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isGuest, setIsGuest] = useState(false);

  // Fetch or create profile
  const fetchProfile = async (userId: string) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error && error.code === 'PGRST116') {
      // Profile doesn't exist yet, create one
      const { data: userData } = await supabase.auth.getUser();
      const newProfile = {
        id: userId,
        display_name: userData.user?.user_metadata?.full_name || userData.user?.email?.split('@')[0] || 'Student',
        avatar_url: userData.user?.user_metadata?.avatar_url || null,
        organization: 'PSC',
        specialization: 'BCT',
        xp: 0,
        streak_days: 0,
        tests_taken: 0,
        badges: [],
        theme_preference: 'system',
        last_active_date: new Date().toISOString().split('T')[0],
        weekly_xp: 0,
      };
      
      const { error: insertError } = await supabase.from('profiles').insert(newProfile);
      if (insertError) {
        console.error('Failed to create profile (RLS issue?):', insertError);
      }
      setProfile(newProfile as UserProfile);
    } else if (data) {
      setProfile(data);
      
      // Apply theme preference
      if (data.theme_preference) {
        localStorage.setItem('loksewa_theme', data.theme_preference);
        if (data.theme_preference === 'dark') {
          document.documentElement.classList.add('dark');
        } else if (data.theme_preference === 'light') {
          document.documentElement.classList.remove('dark');
        } else {
          if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
            document.documentElement.classList.add('dark');
          } else {
            document.documentElement.classList.remove('dark');
          }
        }
      }
    }
  };

  const refreshProfile = async () => {
    if (user) await fetchProfile(user.id);
  };

  // Listen for auth changes
  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session: s } }) => {
      setSession(s);
      setUser(s?.user ?? null);
      if (s?.user) {
        fetchProfile(s.user.id);
      }
      setIsLoading(false);
    });

    // Subscribe to changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s);
      setUser(s?.user ?? null);
      if (s?.user) {
        fetchProfile(s.user.id);
      } else {
        setProfile(null);
      }
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin,
      }
    });
  };

  const signInWithEmail = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error: error?.message ?? null };
  };

  const signUpWithEmail = async (email: string, password: string, name: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: name }
      }
    });
    return { error: error?.message ?? null };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setProfile(null);
    setIsGuest(false);
  };

  const enterGuestMode = () => {
    setIsGuest(true);
    setIsLoading(false);
    setProfile({
      id: 'guest',
      display_name: 'Guest',
      avatar_url: null,
      organization: 'PSC',
      specialization: 'BCT',
      xp: 0,
      streak_days: 0,
      tests_taken: 0,
      badges: [],
      theme_preference: 'system',
      last_active_date: null,
      weekly_xp: 0,
    });
  };

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!user || isGuest) return;
    
    // Optimistic update
    if (profile) setProfile({ ...profile, ...updates });
    
    // Theme immediate apply
    if (updates.theme_preference) {
      localStorage.setItem('loksewa_theme', updates.theme_preference);
      if (updates.theme_preference === 'dark') {
        document.documentElement.classList.add('dark');
      } else if (updates.theme_preference === 'light') {
        document.documentElement.classList.remove('dark');
      } else {
        if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      }
    }

    await supabase.from('profiles').update(updates).eq('id', user.id);
  };

  return (
    <AuthContext.Provider value={{
      user, session, profile, isLoading, isGuest,
      signInWithGoogle, signInWithEmail, signUpWithEmail,
      signOut, enterGuestMode, updateProfile, refreshProfile
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
