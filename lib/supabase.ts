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
  firstname?: string;
  lastname?: string;
  birthdate?: string;
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
  direction: 'given' | 'received'; // Gift direction
  event_type?: string; // Event category
  gift_type?: string; // Gift category
  created_at: string;
  recipient_phone?: string;
  notes?: string;
};

export type EventType = {
  id: string;
  user_id: string;
  name: string;
  created_at: string;
};

export type GiftType = {
  id: string;
  user_id: string;
  name: string;
  created_at: string;
};

export type UserConnection = {
  id: string;
  parent_user_id: string;
  child_user_id: string;
  permission: 'read' | 'read_write';
  status: 'pending' | 'accepted' | 'revoked';
  invite_token: string;
  invite_expires_at: string;
  created_at: string;
  updated_at: string;
  // Joined data
  parent_user?: User;
  child_user?: User;
};
