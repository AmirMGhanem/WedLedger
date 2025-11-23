'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { User as SupabaseUser } from '@supabase/supabase-js';

type AuthContextType = {
  user: SupabaseUser | null;
  loading: boolean;
  signInWithOtp: (phone: string) => Promise<void>;
  verifyOtp: (phone: string, otp: string) => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load user from localStorage on mount
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
      }
      setLoading(false);
    };

    loadUser();
  }, []);

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
      
    } catch (err: any) {
      console.error('❌ Authentication error:', err);
      throw new Error(err.message || 'Authentication failed');
    }
  };

  const signOut = async () => {
    console.log('👋 Signing out...');
    
    // Clear user from localStorage
    if (typeof window !== 'undefined') {
      localStorage.removeItem('wedledger_user');
    }
    
    setUser(null);
    console.log('✅ Signed out successfully');
  };

  return (
    <AuthContext.Provider value={{ user, loading, signInWithOtp, verifyOtp, signOut }}>
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
