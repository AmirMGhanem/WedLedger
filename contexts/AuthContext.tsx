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

// Demo mode - generates consistent user ID from phone number
const generateUserId = (phone: string): string => {
  let hash = 0;
  for (let i = 0; i < phone.length; i++) {
    hash = ((hash << 5) - hash) + phone.charCodeAt(i);
    hash = hash & hash;
  }
  const hex = Math.abs(hash).toString(16).padStart(32, '0');
  return `${hex.substring(0, 8)}-${hex.substring(8, 12)}-4${hex.substring(12, 15)}-a${hex.substring(15, 18)}-${hex.substring(18, 30)}`;
};

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

  const signInWithOtp = async (phone: string) => {
    try {
      console.log('📱 Generating OTP for:', phone);
      
      // Generate random 6-digit OTP
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      
      // Check if user exists
      const { data: existingUser } = await supabase
        .from('users')
        .select('id')
        .eq('phone', phone)
        .maybeSingle();

      if (existingUser) {
        // Update existing user with new OTP
        const { error: updateError } = await supabase
          .from('users')
          .update({ otp_code: otp })
          .eq('phone', phone);

        if (updateError) {
          console.error('❌ Error updating OTP:', updateError);
          throw new Error('Failed to generate OTP');
        }
        
        console.log('✅ OTP updated for existing user');
      } else {
        // Create new user with OTP
        const userId = generateUserId(phone);
        const { error: insertError } = await supabase
          .from('users')
          .insert({
            id: userId,
            phone: phone,
            otp_code: otp,
          });

        if (insertError) {
          console.error('❌ Error creating user:', insertError);
          throw new Error('Failed to create user account');
        }
        
        console.log('✅ New user created with OTP');
      }
      
      // In a real app, you would send this OTP via SMS
      // For demo purposes, we'll log it to console
      console.log('🔑 OTP Code:', otp);
      console.log('⚠️ In production, this would be sent via SMS');
      
    } catch (err: any) {
      console.error('❌ Error in signInWithOtp:', err);
      throw new Error(err.message || 'Failed to send OTP');
    }
  };

  const verifyOtp = async (phone: string, otp: string) => {
    try {
      console.log('🔐 Verifying OTP for:', phone);

      // Check if user exists and get their stored OTP
      const { data: dbUser, error: fetchError } = await supabase
        .from('users')
        .select('*')
        .eq('phone', phone)
        .maybeSingle();

      if (fetchError) {
        console.error('❌ Error fetching user:', fetchError);
        throw new Error('Failed to verify OTP. Please try again.');
      }

      if (!dbUser) {
        console.error('❌ User not found');
        throw new Error('User not found. Please request OTP first.');
      }

      // Verify OTP matches
      if (dbUser.otp_code !== otp) {
        console.error('❌ Invalid OTP provided');
        throw new Error('Invalid OTP. Please check the code and try again.');
      }

      console.log('✅ OTP verified successfully!');

      // Clear OTP after successful verification (optional - for security)
      await supabase
        .from('users')
        .update({ otp_code: null })
        .eq('id', dbUser.id);

      // Load user's related data
      console.log('📊 Loading user data...');
      
      const [familyResult, giftsResult] = await Promise.all([
        supabase
          .from('family_members')
          .select('*')
          .eq('user_id', dbUser.id),
        supabase
          .from('gifts')
          .select('*')
          .eq('user_id', dbUser.id)
      ]);

      const familyCount = familyResult.data?.length || 0;
      const giftsCount = giftsResult.data?.length || 0;
      
      console.log(`✅ Loaded ${familyCount} family members, ${giftsCount} gifts`);

      // Create user session object
      const userSession: SupabaseUser = {
        id: dbUser.id,
        phone: phone,
        app_metadata: {},
        user_metadata: { 
          phone,
          familyCount,
          giftsCount,
        },
        aud: 'authenticated',
        created_at: dbUser.created_at || new Date().toISOString(),
        email: undefined,
      } as SupabaseUser;

      // Save to state and localStorage
      setUser(userSession);
      
      if (typeof window !== 'undefined') {
        localStorage.setItem('wedledger_user', JSON.stringify(userSession));
      }

      console.log('🎉 Authentication successful!');
      console.log('👤 User ID:', dbUser.id);
      console.log('📱 Phone:', phone);
      
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
