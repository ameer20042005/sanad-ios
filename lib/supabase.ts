import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  const missing = [
    !supabaseUrl && 'EXPO_PUBLIC_SUPABASE_URL',
    !supabaseKey && 'EXPO_PUBLIC_SUPABASE_ANON_KEY',
  ]
    .filter(Boolean)
    .join(' و ');

  throw new Error(
    `Supabase configuration is missing. يرجى تعيين المتغيرات التالية في ملف .env: ${missing}. راجع README للحصول على الإرشادات.`
  );
}

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: false,
    persistSession: false,
    detectSessionInUrl: false,
  },
});

export type Database = {
  public: {
    Tables: {
      donor_profiles: {
        Row: {
          id: string;
          name: string;
          phone: string;
          blood_type: 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-';
          governorate: string;
          city: string;
          contact_preference: 'anytime' | 'morning' | 'evening';
          morning_from: string | null;
          morning_to: string | null;
          evening_from: string | null;
          evening_to: string | null;
          is_active: boolean;
          donation_status?: 'متاح' | 'غير متاح' | 'قيد الانتظار';
          last_donation_date: string | null;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          phone: string;
          blood_type: 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-';
          governorate: string;
          city: string;
          contact_preference?: 'anytime' | 'morning' | 'evening';
          morning_from?: string | null;
          morning_to?: string | null;
          evening_from?: string | null;
          evening_to?: string | null;
          is_active?: boolean;
          donation_status?: 'متاح' | 'غير متاح' | 'قيد الانتظار';
          last_donation_date?: string | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          phone?: string;
          blood_type?: 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-';
          governorate?: string;
          city?: string;
          contact_preference?: 'anytime' | 'morning' | 'evening';
          morning_from?: string | null;
          morning_to?: string | null;
          evening_from?: string | null;
          evening_to?: string | null;
          is_active?: boolean;
          donation_status?: 'متاح' | 'غير متاح' | 'قيد الانتظار';
          last_donation_date?: string | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      donors: {
        Row: {
          id: string;
          name: string;
          phone: string;
          blood_type: 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-';
          governorate: string;
          city: string;
          contact_preference: 'anytime' | 'morning' | 'evening';
          morning_from: string | null;
          morning_to: string | null;
          evening_from: string | null;
          evening_to: string | null;
          notes: string | null;
          is_available: boolean | null;
          last_donation_date: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          phone: string;
          blood_type: 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-';
          governorate: string;
          city: string;
          contact_preference?: 'anytime' | 'morning' | 'evening';
          morning_from?: string | null;
          morning_to?: string | null;
          evening_from?: string | null;
          evening_to?: string | null;
          notes?: string | null;
          is_available?: boolean | null;
          last_donation_date?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          phone?: string;
          blood_type?: 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-';
          governorate?: string;
          city?: string;
          contact_preference?: 'anytime' | 'morning' | 'evening';
          morning_from?: string | null;
          morning_to?: string | null;
          evening_from?: string | null;
          evening_to?: string | null;
          notes?: string | null;
          is_available?: boolean | null;
          last_donation_date?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      donation_requests: {
        Row: {
          id: string;
          donor_id: string | null;
          patient_name: string;
          hospital: string;
          blood_type: string;
          governorate: string;
          city: string;
          urgency: string;
          description: string | null;
          contact_phone: string;
          status: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          donor_id?: string | null;
          patient_name: string;
          hospital: string;
          blood_type: string;
          governorate: string;
          city: string;
          urgency?: string;
          description?: string | null;
          contact_phone: string;
          status?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          donor_id?: string | null;
          patient_name?: string;
          hospital?: string;
          blood_type?: string;
          governorate?: string;
          city?: string;
          urgency?: string;
          description?: string | null;
          contact_phone?: string;
          status?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      campaigns: {
        Row: {
          id: string;
          title: string;
          description: string;
          organizer: string;
          location: string;
          governorate: string;
          city: string;
          start_date: string;
          end_date: string;
          target_donors: number | null;
          registered_donors: number | null;
          status: string;
          image_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          description: string;
          organizer: string;
          location: string;
          governorate: string;
          city: string;
          start_date: string;
          end_date: string;
          target_donors?: number | null;
          registered_donors?: number | null;
          status?: string;
          image_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          description?: string;
          organizer?: string;
          location?: string;
          governorate?: string;
          city?: string;
          start_date?: string;
          end_date?: string;
          target_donors?: number | null;
          registered_donors?: number | null;
          status?: string;
          image_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
  };
};

// أنواع البيانات المخصصة
export type DonorProfile = Database['public']['Tables']['donor_profiles']['Row'];
export type DonorProfileInsert = Database['public']['Tables']['donor_profiles']['Insert'];
export type DonorProfileUpdate = Database['public']['Tables']['donor_profiles']['Update'];

export type Donor = Database['public']['Tables']['donors']['Row'];
export type DonorInsert = Database['public']['Tables']['donors']['Insert'];
export type DonorUpdate = Database['public']['Tables']['donors']['Update'];

export type BloodType = 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-';
export type ContactPreference = 'anytime' | 'morning' | 'evening';