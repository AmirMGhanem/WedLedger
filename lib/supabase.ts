import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});

export type User = {
  id: string;
  phone: string;
  otp_code?: string;
  created_at: string;
};

export type FamilyMember = {
  id: string;
  user_id: string;
  name: string;
  color: string;
  created_at: string;
};

export type Gift = {
  id: string;
  user_id: string;
  to_whom: string;
  from: string; // family member ID
  amount: number;
  date: string;
  currency: string;
  created_at: string;
};
