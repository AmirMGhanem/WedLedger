'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { User as SupabaseUser } from '@supabase/supabase-js';

type SharedContext = {
  connectionId: string;
  childUserId: string;
  permission: 'read' | 'read_write';
  childPhone: string;
} | null;

type AuthContextType = {
  user: SupabaseUser | null;
  loading: boolean;
  sharedContext: SharedContext;
  setSharedContext: (context: SharedContext) => void;
  clearSharedContext: () => void;
  signInWithOtp: (phone: string) => Promise<void>;
  verifyOtp: (phone: string, otp: string) => Promise<{ needsRegistration: boolean }>;
  updateProfile: (firstname: string, lastname: string, birthdate: string) => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [sharedContext, setSharedContextState] = useState<SharedContext>(null);

  useEffect(() => {
    // Load user and shared context from localStorage on mount
    const loadUser = async () => {
      if (typeof window !== 'undefined') {
        const storedUser = localStorage.getItem('wedledger_user');
        if (storedUser) {
          try {
            const userData = JSON.parse(storedUser);
            setUser(userData as SupabaseUser);
          } catch (e) {
            localStorage.removeItem('wedledger_user');
          }
        }

        // Load shared context
        const storedContext = localStorage.getItem('wedledger_shared_context');
        if (storedContext) {
          try {
            const contextData = JSON.parse(storedContext);
            setSharedContextState(contextData);
          } catch (e) {
            localStorage.removeItem('wedledger_shared_context');
          }
        }
      }
      setLoading(false);
    };

    loadUser();
  }, []);

  const setSharedContext = (context: SharedContext) => {
    setSharedContextState(context);
    if (typeof window !== 'undefined') {
      if (context) {
        localStorage.setItem('wedledger_shared_context', JSON.stringify(context));
      } else {
        localStorage.removeItem('wedledger_shared_context');
      }
    }
  };

  const clearSharedContext = () => {
    setSharedContextState(null);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('wedledger_shared_context');
    }
  };

  const signInWithOtp = async (phone: string): Promise<void> => {
    try {
      console.log('📱 Sending OTP to:', phone);
      
      // Call API endpoint to send OTP via SMS
      const response = await fetch('/api/otp/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ phone }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send OTP');
      }

      console.log('✅ OTP sent successfully via SMS');
      console.log('📬 Recipients:', data.recipients);
      
    } catch (err: any) {
      console.error('❌ Error in signInWithOtp:', err);
      throw new Error(err.message || 'Failed to send OTP');
    }
  };

  const verifyOtp = async (phone: string, otp: string) => {
    try {
      console.log('🔐 Verifying OTP for:', phone);

      // Call API endpoint to verify OTP
      const response = await fetch('/api/otp/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ phone, otp }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to verify OTP');
      }

      console.log('✅ OTP verified successfully!');

      // Create user session object from API response
      const userSession: SupabaseUser = {
        id: data.user.id,
        phone: data.user.phone,
        app_metadata: {},
        user_metadata: { 
          phone: data.user.phone,
          firstname: data.user.firstname,
          lastname: data.user.lastname,
          birthdate: data.user.birthdate,
          familyCount: data.user.familyCount,
          giftsCount: data.user.giftsCount,
        },
        aud: 'authenticated',
        created_at: new Date().toISOString(),
        email: undefined,
      } as SupabaseUser;

      // Save to state and localStorage
      setUser(userSession);
      
      if (typeof window !== 'undefined') {
        localStorage.setItem('wedledger_user', JSON.stringify(userSession));
      }

      console.log('🎉 Authentication successful!');
      console.log('👤 User ID:', data.user.id);
      console.log('📱 Phone:', data.user.phone);
      console.log(`📊 Family: ${data.user.familyCount}, Gifts: ${data.user.giftsCount}`);
      
      return { needsRegistration: data.needsRegistration || false };
      
    } catch (err: any) {
      console.error('❌ Authentication error:', err);
      throw new Error(err.message || 'Authentication failed');
    }
  };

  const updateProfile = async (firstname: string, lastname: string, birthdate: string) => {
    if (!user) {
      throw new Error('User not authenticated');
    }

    try {
      const response = await fetch('/api/user/profile', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
          firstname,
          lastname,
          birthdate,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update profile');
      }

      // Update user session with new profile data
      const updatedUser: SupabaseUser = {
        ...user,
        user_metadata: {
          ...user.user_metadata,
          firstname: data.user.firstname,
          lastname: data.user.lastname,
          birthdate: data.user.birthdate,
        },
      };

      setUser(updatedUser);
      
      if (typeof window !== 'undefined') {
        localStorage.setItem('wedledger_user', JSON.stringify(updatedUser));
      }

      console.log('✅ Profile updated successfully');
    } catch (err: any) {
      console.error('❌ Profile update error:', err);
      throw new Error(err.message || 'Failed to update profile');
    }
  };

  const signOut = async () => {
    console.log('👋 Signing out...');
    
    // Clear user and shared context from localStorage
    if (typeof window !== 'undefined') {
      localStorage.removeItem('wedledger_user');
      localStorage.removeItem('wedledger_shared_context');
    }
    
    setUser(null);
    setSharedContextState(null);
    console.log('✅ Signed out successfully');
  };

  return (
    <AuthContext.Provider 
      value={{ 
        user, 
        loading, 
        sharedContext,
        setSharedContext,
        clearSharedContext,
        signInWithOtp, 
        verifyOtp, 
        updateProfile,
        signOut 
      }}
    >
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
