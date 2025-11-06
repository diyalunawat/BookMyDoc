'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

export type Profile = {
  id: string;
  email: string;
  role: string;
  full_name: string;
  phone: string | null;
  age?: number | null;
  gender?: string | null;
  profile_photo_url?: string | null;
  created_at?: string;
  updated_at?: string;
};

type AuthContextType = {
  user: Profile | null;
  profile: Profile | null;
  loading: boolean;
  signUp: (email: string, password: string, userData: { full_name: string; phone: string; role: 'patient' | 'doctor' }) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  updateProfile: (data: Partial<Profile>) => Promise<{ error: any }>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<Profile | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUser();
  }, []);

  const fetchUser = async () => {
    try {
      const { getCurrentUserAction } = await import('./actions');
      const result = await getCurrentUserAction();
      
      if (result.user) {
        setUser(result.user);
        setProfile(result.user);
      }
    } catch (error) {
      console.error('Error fetching user:', error);
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string, userData: { full_name: string; phone: string; role: 'patient' | 'doctor' }) => {
    try {
      const { signUpAction } = await import('./actions');
      const result = await signUpAction(email, password, userData.full_name, userData.phone, userData.role);

      if (result.error) {
        return { error: new Error(result.error) };
      }

      if (result.user) {
        setUser(result.user);
        setProfile(result.user);
      }
      return { error: null };
    } catch (error: any) {
      return { error };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { signInAction } = await import('./actions');
      const result = await signInAction(email, password);

      if (result.error) {
        return { error: new Error(result.error) };
      }

      if (result.user) {
        setUser(result.user);
        setProfile(result.user);
      }
      return { error: null };
    } catch (error: any) {
      return { error };
    }
  };

  const signOut = async () => {
    try {
      const { signOutAction } = await import('./actions');
      await signOutAction();
      setUser(null);
      setProfile(null);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const updateProfile = async (data: Partial<Profile>) => {
    if (!user) return { error: new Error('Not authenticated') };

    try {
      const { updateProfileAction } = await import('./actions');
      const result = await updateProfileAction({
        full_name: data.full_name,
        phone: data.phone || undefined,
        age: data.age || undefined,
        gender: data.gender || undefined,
        profile_photo_url: data.profile_photo_url || undefined,
      });

      if (result.error) {
        return { error: new Error(result.error) };
      }

      if (result.user) {
        setProfile(result.user);
        setUser(result.user);
      }
      return { error: null };
    } catch (error: any) {
      return { error };
    }
  };

  return (
    <AuthContext.Provider value={{ user, profile, loading, signUp, signIn, signOut, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
