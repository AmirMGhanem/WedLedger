import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Gift = {
  id: string;
  user_id: string;
  date: string;
  amount: number;
  recipient_name: string;
  from_family: boolean;
  created_at: string;
};

export type FamilyMember = {
  id: string;
  user_id: string;
  name: string;
  created_at: string;
};

export type User = {
  id: string;
  phone_number: string;
  created_at: string;
};
